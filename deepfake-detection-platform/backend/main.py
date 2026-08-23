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
from reverse_search import reverse_search
from metadata import analyze_metadata
from c2pa_analysis import analyze_c2pa
from semantic_analysis import analyze_semantics


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
    semantic_score: float,
) -> dict[str, float]:
    """
    Calculate the overall authenticity score.

    SBI = 90%
    Semantic analysis = 10%

    SBI remains the primary deepfake detector.
    Semantic analysis is a supporting signal.
    """

    final_authenticity = (
        0.70 * ai_authenticity
        + 0.30 * semantic_score
    )

    final_authenticity = round(
        max(0.0, min(100.0, final_authenticity)),
        1,
    )

    final_risk = round(
        100.0 - final_authenticity,
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

        temporary.write(
            await file.read()
        )

        temporary_path = temporary.name

    try:

        # ==================================================
        # 1. EXISTING SELFBLENDEDIMAGES MODEL
        # ==================================================

        fakeness = analyse(
            temporary_path,
            media_type.startswith("video/")
        )

        authenticity = round(
            (1 - fakeness) * 100,
            1
        )

        # ==================================================
        # 2. METADATA
        # ==================================================

        if media_type.startswith("image/"):

            try:

                metadata = analyze_metadata(
                    temporary_path
                )

            except Exception as exc:

                metadata = {
                    "available": False,
                    "findings": [
                        "Metadata analysis failed."
                    ],
                    "warnings": [
                        str(exc)
                    ],
                    "risk_score": 0,
                }

        else:

            metadata = {
                "available": False,
                "findings": [
                    "Metadata analysis is currently "
                    "available for images only."
                ],
                "warnings": [],
                "risk_score": 0,
            }

        # ==================================================
        # 3. REVERSE IMAGE SEARCH
        # ==================================================

        if media_type.startswith("image/"):

            reverse_search_result = reverse_search(
                temporary_path
            )

        else:

            reverse_search_result = {
                "available": False,
                "status": "unsupported_media",
                "matches_found": 0,
                "exact_matches": [],
                "visual_matches": [],
                "findings": [
                    "Reverse image search is currently "
                    "available for images only."
                ],
                "error": None,
            }

        # ==================================================
        # 3. C2PA CONTENT CREDENTIALS
        # ==================================================

        if media_type.startswith("image/"):

            c2pa_result = analyze_c2pa(
                temporary_path
            )

        else:

            c2pa_result = {
                "available": False,
                "status": "unsupported_media",
                "has_manifest": False,
                "validation_state": None,
                "claim_generator": None,
                "title": None,
                "actions": [],
                "ingredients": [],
                "findings": [
                    "C2PA analysis is currently available "
                    "for images only."
                ],
                "warnings": [],
            }

        # ==================================================
        # 4. SEMANTIC ANALYSIS
        # ==================================================

        if media_type.startswith("image/"):

            semantic_result = analyze_semantics(
                temporary_path
            )

        else:

            semantic_result = {
                "available": False,
                "status": "unsupported_media",
                "semantic_score": 0.0,
                "real_score": 0.0,
                "synthetic_score": 0.0,
                "margin": 0.0,
                "findings": [
                    "Semantic analysis is currently "
                    "available for images only."
                ],
                "warnings": [],
            }


        # ==================================================
        # 5. FUSED AUTHENTICITY SCORE
        # ==================================================

        semantic_score = float(
            semantic_result.get(
                "semantic_score",
                0.0
            )
        )

        forensic_score = calculate_forensic_score(
            ai_authenticity=authenticity,
            semantic_score=semantic_score,
        )
        
        # ==================================================
        # 5. RETURN EVERYTHING
        # ==================================================

        return {

            # ==================================================
            # PRIMARY AI DETECTOR
            # ==================================================

            "fakeness": round(
                fakeness,
                4
            ),

            "authenticity": authenticity,
            # ==================================================
            # FUSED SCORE
            # ==================================================

            "overall_authenticity": forensic_score[
                "final_authenticity"
            ],

            "overall_risk": forensic_score[
                "final_risk"
            ],

            # ==================================================
            # FORENSIC SIGNALS
            # ==================================================

            "metadata": metadata,

            "reverse_search": reverse_search_result,

            "c2pa": c2pa_result,

            "semantic": semantic_result,
        }

    finally:

        Path(
            temporary_path
        ).unlink(
            missing_ok=True
        )
