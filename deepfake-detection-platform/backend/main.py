"""HTTP adapter connecting the Next.js UI to SelfBlendedImages inference."""
from __future__ import annotations
import os
import sys
import tempfile
from pathlib import Path
import cv2
import numpy as np
import torch
from fastapi import FastAPI, File, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from retinaface.pre_trained_models import get_model

from metadata import analyze_metadata

ROOT = Path(__file__).resolve().parents[2]
INFERENCE_DIR = ROOT / "SelfBlendedImages-master" / "src" / "inference"
WEIGHTS = Path(os.getenv("SBI_WEIGHTS", ROOT / "SelfBlendedImages-master" / "weights" / "FFraw.tar"))
sys.path.insert(0, str(INFERENCE_DIR))
from model import Detector  # noqa: E402
from preprocess import extract_face, extract_frames  # noqa: E402

app = FastAPI(title="SelfBlendedImages detection API")
app.add_middleware(CORSMiddleware, allow_origins=os.getenv("CORS_ORIGINS", "http://localhost:3000").split(","), allow_methods=["*"], allow_headers=["*"])
device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
detector: Detector | None = None
face_detector = None

def models() -> tuple[Detector, object]:
    global detector, face_detector
    if not WEIGHTS.is_file():
        raise HTTPException(503, f"SBI model weight is missing at {WEIGHTS}. Download FFraw.tar from the SelfBlendedImages README.")
    if detector is None:
        detector = Detector().to(device)
        detector.load_state_dict(torch.load(WEIGHTS, map_location=device, weights_only=False)["model"])
        detector.eval()
        face_detector = get_model("resnet50_2020-07-20", max_size=2048, device=device)
        face_detector.eval()
    return detector, face_detector

def score_faces(faces: list[np.ndarray], model: Detector) -> float:
    if not faces:
        raise HTTPException(422, "No face was detected in this media.")
    with torch.no_grad():
        return float(model(torch.tensor(np.asarray(faces)).to(device).float().div(255)).softmax(1)[:, 1].max().item())

def analyse(path: str, is_video: bool) -> float:
    model, face_model = models()
    if not is_video:
        frame = cv2.imread(path)
        if frame is None: raise HTTPException(422, "The uploaded image could not be decoded.")
        return score_faces(extract_face(cv2.cvtColor(frame, cv2.COLOR_BGR2RGB), face_model), model)
    faces, indices = extract_frames(path, 32, face_model)
    if not faces: raise HTTPException(422, "No face was detected in the sampled video frames.")
    with torch.no_grad(): scores = model(torch.tensor(np.asarray(faces)).to(device).float().div(255)).softmax(1)[:, 1].cpu().numpy()
    frames: dict[int, list[float]] = {}
    for index, score in zip(indices, scores, strict=True): frames.setdefault(index, []).append(float(score))
    return float(np.mean([max(values) for values in frames.values()]))

def calculate_forensic_score(
    ai_authenticity: float,
    metadata_risk: float,
) -> dict[str, float]:
    """
    Combine the trained AI detector with metadata evidence.

    The SBI model remains the primary signal.
    Metadata contributes only 20%.
    """

    ai_risk = 100.0 - ai_authenticity

    final_risk = (
        0.80 * ai_risk +
        0.20 * metadata_risk
    )

    final_risk = round(
        max(0.0, min(100.0, final_risk)),
        1,
    )

    final_authenticity = round(
        100.0 - final_risk,
        1,
    )

    return {
        "final_risk": final_risk,
        "final_authenticity": final_authenticity,
    }


@app.get("/health")
def health() -> dict[str, object]:
    return {"ready": WEIGHTS.is_file(), "device": str(device), "weights": str(WEIGHTS)}


@app.post("/analyze")
async def analyze(file: UploadFile = File(...)) -> dict[str, object]:

    media_type = file.content_type or ""

    if not (
        media_type.startswith("image/")
        or media_type.startswith("video/")
    ):
        raise HTTPException(
            415,
            "Upload an image or video file."
        )

    suffix = (
        Path(file.filename or "upload").suffix
        or (
            ".mp4"
            if media_type.startswith("video/")
            else ".jpg"
        )
    )

    with tempfile.NamedTemporaryFile(
        suffix=suffix,
        delete=False
    ) as temporary:

        temporary.write(await file.read())

        temporary_path = temporary.name

    try:

        # =====================================================
        # 1. EXISTING SELFBLENDEDIMAGES MODEL
        # =====================================================

        fakeness = analyse(
            temporary_path,
            media_type.startswith("video/")
        )

        ai_authenticity = round(
            (1 - fakeness) * 100,
            1
        )

        # =====================================================
        # 2. METADATA ANALYSIS
        # =====================================================

        # Metadata is meaningful for images.
        # For videos we safely skip it for now.
        if media_type.startswith("image/"):

            metadata = analyze_metadata(
                temporary_path
            )

        else:

            metadata = {
                "available": False,
                "format": None,
                "width": None,
                "height": None,
                "mode": None,
                "sha256": None,
                "exif": {},
                "findings": [
                    "Metadata analysis is currently available for images only."
                ],
                "warnings": [],
                "risk_score": 0,
            }

        # =====================================================
        # 3. EVIDENCE FUSION
        # =====================================================

        forensic = calculate_forensic_score(
            ai_authenticity=ai_authenticity,
            metadata_risk=float(
                metadata.get("risk_score", 0)
            ),
        )

        # =====================================================
        # 4. FINAL API RESPONSE
        # =====================================================

        return {

            # Original SBI values
            "fakeness": round(fakeness, 4),

            "authenticity": ai_authenticity,

            # Metadata findings
            "metadata": metadata,

            # Combined forensic assessment
            "forensic_analysis": {

                "metadata_risk": metadata.get(
                    "risk_score",
                    0
                ),

                "final_risk": forensic[
                    "final_risk"
                ],

                "final_authenticity": forensic[
                    "final_authenticity"
                ],

            },
        }

    finally:

        Path(
            temporary_path
        ).unlink(
            missing_ok=True
        )

# @app.post("/analyze")
# async def analyze(file: UploadFile = File(...)) -> dict[str, object]:
#     media_type = file.content_type or ""
#     if not (media_type.startswith("image/") or media_type.startswith("video/")):
#         raise HTTPException(415, "Upload an image or video file.")
#     suffix = Path(file.filename or "upload").suffix or (".mp4" if media_type.startswith("video/") else ".jpg")
#     with tempfile.NamedTemporaryFile(suffix=suffix, delete=False) as temporary:
#         temporary.write(await file.read()); temporary_path = temporary.name
#     try:
#         fakeness = analyse(temporary_path, media_type.startswith("video/"))
#         return {"fakeness": round(fakeness, 4), "authenticity": round((1 - fakeness) * 100, 1)}
#     finally:
#         Path(temporary_path).unlink(missing_ok=True)
