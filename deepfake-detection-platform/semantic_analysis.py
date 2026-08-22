from __future__ import annotations

from pathlib import Path
from typing import Any

import torch
from PIL import Image
from transformers import CLIPModel, CLIPProcessor


# ============================================================
# MODEL
# ============================================================

MODEL_NAME = "openai/clip-vit-base-patch32"

_device = torch.device(
    "cuda" if torch.cuda.is_available() else "cpu"
)

_clip_model: CLIPModel | None = None
_clip_processor: CLIPProcessor | None = None


# ============================================================
# LOAD CLIP ONCE
# ============================================================

def _get_clip():
    global _clip_model
    global _clip_processor

    if _clip_model is None:

        _clip_processor = CLIPProcessor.from_pretrained(
            MODEL_NAME
        )

        _clip_model = CLIPModel.from_pretrained(
            MODEL_NAME
        ).to(_device)

        _clip_model.eval()

    return _clip_model, _clip_processor


# ============================================================
# SEMANTIC PROMPTS
# ============================================================

AUTHENTIC_PROMPTS = [
    "a real photograph",
    "a genuine camera photograph",
    "a natural photograph of a real person",
    "an authentic photograph",
    "a normal photograph captured by a camera",
]

SYNTHETIC_PROMPTS = [
    "an AI generated image",
    "a synthetic AI generated photograph",
    "a deepfake image",
    "a digitally manipulated face",
    "an artificially generated photograph",
]


# ============================================================
# ANALYSIS
# ============================================================

def analyze_semantics(
    image_path: str,
) -> dict[str, Any]:

    result = {
        "available": True,
        "status": "clear",
        "semantic_score": 0.0,
        "real_score": 0.0,
        "synthetic_score": 0.0,
        "margin": 0.0,
        "findings": [],
        "warnings": [],
    }

    try:

        path = Path(image_path)

        if not path.is_file():

            raise FileNotFoundError(
                f"Image not found: {image_path}"
            )

        # ----------------------------------------------------
        # Load image
        # ----------------------------------------------------

        image = Image.open(
            path
        ).convert("RGB")

        # ----------------------------------------------------
        # Load CLIP
        # ----------------------------------------------------

        model, processor = _get_clip()

        # ----------------------------------------------------
        # Prepare prompts
        # ----------------------------------------------------

        real_prompts = [
            AUTHENTIC_PROMPTS
        ]

        synthetic_prompts = [
            SYNTHETIC_PROMPTS
        ]

        all_prompts = (
            AUTHENTIC_PROMPTS
            + SYNTHETIC_PROMPTS
        )

        # ----------------------------------------------------
        # CLIP inference
        # ----------------------------------------------------

        inputs = processor(
            text=all_prompts,
            images=image,
            return_tensors="pt",
            padding=True,
        )

        inputs = {
            key: value.to(_device)
            for key, value in inputs.items()
        }

        with torch.no_grad():

            outputs = model(
                **inputs
            )

            logits = (
                outputs.logits_per_image
            )

            probabilities = (
                logits.softmax(dim=1)
                .squeeze(0)
                .cpu()
            )

        # ----------------------------------------------------
        # Separate groups
        # ----------------------------------------------------

        real_count = len(
            AUTHENTIC_PROMPTS
        )

        real_probability = (
            probabilities[
                :real_count
            ].mean().item()
        )

        synthetic_probability = (
            probabilities[
                real_count:
            ].mean().item()
        )

        # ----------------------------------------------------
        # Normalize to a semantic authenticity score
        # ----------------------------------------------------

        total = (
            real_probability
            + synthetic_probability
        )

        if total > 0:

            real_score = (
                real_probability
                / total
            ) * 100

            synthetic_score = (
                synthetic_probability
                / total
            ) * 100

        else:

            real_score = 50.0
            synthetic_score = 50.0

        margin = (
            real_score
            - synthetic_score
        )

        semantic_score = max(
            0.0,
            min(
                100.0,
                real_score
            )
        )

        # ----------------------------------------------------
        # Interpret result conservatively
        # ----------------------------------------------------

        if synthetic_score >= 70:

            status = "flag"

            findings = [
                (
                    f"Semantic model score favors "
                    f"synthetic/manipulated content "
                    f"({synthetic_score:.1f}%)."
                ),
                (
                    "The image's visual semantics are "
                    "more compatible with the synthetic "
                    "reference descriptions used by CLIP."
                ),
                (
                    "This is supporting evidence only and "
                    "is not a standalone deepfake verdict."
                ),
            ]

        elif synthetic_score >= 55:

            status = "minor"

            findings = [
                (
                    f"Semantic model shows a mild "
                    f"synthetic-content preference "
                    f"({synthetic_score:.1f}%)."
                ),
                (
                    "The semantic signal is inconclusive "
                    "and should be interpreted alongside "
                    "the primary detector."
                ),
            ]

        else:

            status = "clear"

            findings = [
                (
                    f"Semantic model favors real/"
                    f"photographic content "
                    f"({real_score:.1f}%)."
                ),
                (
                    "The overall visual semantics are "
                    "more compatible with the real-photo "
                    "reference descriptions."
                ),
            ]

        # ----------------------------------------------------
        # Return
        # ----------------------------------------------------

        result.update(
            {
                "status": status,
                "semantic_score": round(
                    semantic_score,
                    1
                ),
                "real_score": round(
                    real_score,
                    1
                ),
                "synthetic_score": round(
                    synthetic_score,
                    1
                ),
                "margin": round(
                    margin,
                    1
                ),
                "findings": findings,
            }
        )

        return result

    except Exception as exc:

        return {
            "available": False,
            "status": "error",
            "semantic_score": 0.0,
            "real_score": 0.0,
            "synthetic_score": 0.0,
            "margin": 0.0,
            "findings": [
                "Semantic analysis could not be completed."
            ],
            "warnings": [
                str(exc)
            ],
        }