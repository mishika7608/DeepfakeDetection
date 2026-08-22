from __future__ import annotations

import io
import os
from pathlib import Path
from typing import Any

import requests
from PIL import Image
from dotenv import load_dotenv


load_dotenv(
    Path(__file__).resolve().parent / ".env"
)


SERPAPI_UPLOAD_URL = "https://serpapi.com/image"
SERPAPI_SEARCH_URL = "https://serpapi.com/search"

MAX_UPLOAD_SIZE = 500 * 1024  # SerpApi limit: 500 KB


def _prepare_image(image_path: str) -> tuple[bytes, str]:
    """
    Prepare an image for SerpApi.

    SerpApi's image upload endpoint accepts JPG/JPEG, PNG and WebP
    with a maximum size of 500 KB.

    If the original image is too large, create a temporary JPEG
    representation in memory.

    The original uploaded image is NEVER modified.
    """

    path = Path(image_path)

    data = path.read_bytes()

    # Original image is already small enough.
    if len(data) <= MAX_UPLOAD_SIZE:
        suffix = path.suffix.lower()

        if suffix in {".jpg", ".jpeg"}:
            content_type = "image/jpeg"
        elif suffix == ".png":
            content_type = "image/png"
        elif suffix == ".webp":
            content_type = "image/webp"
        else:
            content_type = "image/jpeg"

        return data, content_type

    # ---------------------------------------------------------
    # Compress/resize only the copy sent to SerpApi.
    # Original uploaded image remains untouched.
    # ---------------------------------------------------------

    with Image.open(image_path) as image:

        image = image.convert("RGB")

        # Reduce dimensions progressively.
        max_dimension = 1600

        if max(image.size) > max_dimension:

            ratio = max_dimension / max(image.size)

            new_size = (
                max(1, int(image.width * ratio)),
                max(1, int(image.height * ratio)),
            )

            image = image.resize(
                new_size,
                Image.Resampling.LANCZOS,
            )

        quality = 85

        while quality >= 40:

            buffer = io.BytesIO()

            image.save(
                buffer,
                format="JPEG",
                quality=quality,
                optimize=True,
            )

            data = buffer.getvalue()

            if len(data) <= MAX_UPLOAD_SIZE:
                return data, "image/jpeg"

            quality -= 5

        # Final fallback
        buffer = io.BytesIO()

        image.thumbnail((1000, 1000))

        image.save(
            buffer,
            format="JPEG",
            quality=40,
            optimize=True,
        )

        return buffer.getvalue(), "image/jpeg"


def _upload_image(
    image_path: str,
    api_key: str,
) -> str:

    image_bytes, content_type = _prepare_image(
        image_path
    )

    filename = "reverse_search_image.jpg"

    if content_type == "image/png":
        filename = "reverse_search_image.png"

    elif content_type == "image/webp":
        filename = "reverse_search_image.webp"

    files = {
        "image": (
            filename,
            image_bytes,
            content_type,
        )
    }

    response = requests.post(
        SERPAPI_UPLOAD_URL,
        files=files,
        data={
            "api_key": api_key,
        },
        timeout=30,
    )

    response.raise_for_status()

    result = response.json()

    if "error" in result:
        raise RuntimeError(
            result["error"]
        )

    image_id = result.get("image_id")

    if not image_id:
        raise RuntimeError(
            "SerpApi did not return an image_id."
        )

    return image_id


def _search_google_lens(
    image_id: str,
    api_key: str,
) -> dict[str, Any]:

    response = requests.get(
        SERPAPI_SEARCH_URL,
        params={
            "engine": "google_lens",
            "image_id": image_id,
            "api_key": api_key,
            "hl": "en",
            "country": "in",
            "type": "all",
        },
        timeout=45,
    )

    response.raise_for_status()

    result = response.json()

    if "error" in result:
        raise RuntimeError(
            result["error"]
        )

    return result


def _clean_match(
    match: dict[str, Any]
) -> dict[str, Any]:

    return {
        "title": match.get("title"),
        "source": match.get("source"),
        "link": match.get("link"),
        "thumbnail": match.get("thumbnail"),
    }


def reverse_search(
    image_path: str,
) -> dict[str, Any]:

    """
    Perform Google Lens reverse image search using SerpApi.

    Returns a safe structured response even when:
      - API key is missing
      - upload fails
      - search fails
      - no matches are found

    The AI detector is completely independent of this function.
    """

    api_key = os.getenv("SERPAPI_API_KEY")

    # ---------------------------------------------------------
    # No API key
    # ---------------------------------------------------------

    if not api_key:

        return {
            "available": False,
            "status": "not_configured",
            "matches_found": 0,
            "exact_matches": [],
            "visual_matches": [],
            "findings": [
                "Reverse image search is not configured."
            ],
            "error": None,
        }

    try:

        # -----------------------------------------------------
        # 1. Upload image
        # -----------------------------------------------------

        image_id = _upload_image(
            image_path,
            api_key,
        )

        # -----------------------------------------------------
        # 2. Search Google Lens
        # -----------------------------------------------------

        results = _search_google_lens(
            image_id,
            api_key,
        )

        # -----------------------------------------------------
        # 3. Extract exact matches
        # -----------------------------------------------------

        exact_matches = [
            _clean_match(match)
            for match in results.get(
                "exact_matches",
                []
            )
        ]

        # -----------------------------------------------------
        # 4. Extract visual matches
        # -----------------------------------------------------

        visual_matches = [
            _clean_match(match)
            for match in results.get(
                "visual_matches",
                []
            )
        ]

        # Limit what gets returned to frontend.
        exact_matches = exact_matches[:10]
        visual_matches = visual_matches[:10]

        total_matches = (
            len(exact_matches)
            + len(visual_matches)
        )

        # -----------------------------------------------------
        # 5. Generate forensic findings
        # -----------------------------------------------------

        findings = []

        if exact_matches:

            findings.append(
                f"{len(exact_matches)} exact or near-exact "
                "online match(es) identified."
            )

            findings.append(
                "The uploaded image appears to have "
                "corresponding indexed online sources."
            )

        elif visual_matches:

            findings.append(
                f"{len(visual_matches)} visually similar "
                "online result(s) identified."
            )

            findings.append(
                "Similar images were found online, "
                "but an exact source match was not established."
            )

        else:

            findings.append(
                "No indexed exact or visually similar "
                "results were identified."
            )

            findings.append(
                "No online source was identified by the "
                "reverse-search service."
            )

        return {
            "available": True,

            "status": (
                "exact_match"
                if exact_matches
                else (
                    "visual_matches"
                    if visual_matches
                    else "no_match"
                )
            ),

            "matches_found": total_matches,

            "exact_matches": exact_matches,

            "visual_matches": visual_matches,

            "findings": findings,

            "error": None,
        }

    except requests.RequestException as exc:

        return {
            "available": False,
            "status": "request_error",
            "matches_found": 0,
            "exact_matches": [],
            "visual_matches": [],
            "findings": [
                "Reverse image search could not be completed."
            ],
            "error": str(exc),
        }

    except Exception as exc:

        return {
            "available": False,
            "status": "error",
            "matches_found": 0,
            "exact_matches": [],
            "visual_matches": [],
            "findings": [
                "Reverse image search could not be completed."
            ],
            "error": str(exc),
        }