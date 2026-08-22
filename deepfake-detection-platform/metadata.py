from PIL import Image, ExifTags
from pathlib import Path
import hashlib


# EXIF tag names
EXIF_TAGS = {
    tag_id: tag_name
    for tag_id, tag_name in ExifTags.TAGS.items()
}


def calculate_sha256(image_path):
    """Calculate SHA-256 hash of the original image."""

    sha256 = hashlib.sha256()

    with open(image_path, "rb") as f:
        for chunk in iter(lambda: f.read(8192), b""):
            sha256.update(chunk)

    return sha256.hexdigest()


def analyze_metadata(image_path):
    """
    Analyze image metadata.

    IMPORTANT:
    This function does NOT modify the image.
    It only reads metadata.
    """

    image_path = Path(image_path)

    findings = []
    warnings = []
    exif_data = {}

    try:
        with Image.open(image_path) as image:

            # -----------------------------------------
            # Basic image information
            # -----------------------------------------

            width, height = image.size
            image_format = image.format
            mode = image.mode

            # -----------------------------------------
            # EXIF
            # -----------------------------------------

            exif = image.getexif()

            if exif:

                for tag_id, value in exif.items():

                    tag_name = EXIF_TAGS.get(
                        tag_id,
                        str(tag_id)
                    )

                    # Avoid binary EXIF data
                    if isinstance(value, bytes):
                        value = "<binary>"

                    exif_data[tag_name] = str(value)

            # -----------------------------------------
            # Metadata findings
            # -----------------------------------------

            if not exif_data:

                findings.append(
                    "No EXIF metadata found"
                )

                warnings.append(
                    "Metadata may have been removed or stripped"
                )

            else:

                findings.append(
                    f"{len(exif_data)} EXIF metadata fields detected"
                )

            # -----------------------------------------
            # Software / editing detection
            # -----------------------------------------

            software = exif_data.get("Software")

            if software:

                findings.append(
                    f"Software tag detected: {software}"
                )

                warnings.append(
                    f"Image contains software metadata: {software}"
                )

            # -----------------------------------------
            # Camera information
            # -----------------------------------------

            make = exif_data.get("Make")
            model = exif_data.get("Model")

            if make or model:

                camera = " ".join(
                    x for x in [make, model]
                    if x
                )

                findings.append(
                    f"Camera information detected: {camera}"
                )

            else:

                findings.append(
                    "No camera information detected"
                )

            # -----------------------------------------
            # Date/time
            # -----------------------------------------

            datetime_value = (
                exif_data.get("DateTimeOriginal")
                or exif_data.get("DateTime")
            )

            if datetime_value:

                findings.append(
                    f"Capture timestamp detected: {datetime_value}"
                )

            else:

                findings.append(
                    "No original capture timestamp detected"
                )

            # -----------------------------------------
            # Image dimensions
            # -----------------------------------------

            findings.append(
                f"Image dimensions: {width} × {height}"
            )

            # -----------------------------------------
            # Hash
            # -----------------------------------------

            sha256 = calculate_sha256(image_path)

            # -----------------------------------------
            # Metadata risk score
            #
            # 0 = low concern
            # 100 = high concern
            # -----------------------------------------

            metadata_risk = 0

            # Missing EXIF is only a weak indicator
            if not exif_data:
                metadata_risk += 15

            # Editing software is stronger evidence
            if software:
                metadata_risk += 25

            # Missing camera information
            if not make and not model:
                metadata_risk += 5

            # Missing timestamp
            if not datetime_value:
                metadata_risk += 5

            metadata_risk = min(
                metadata_risk,
                100
            )

            return {
                "available": True,

                "format": image_format,
                "width": width,
                "height": height,
                "mode": mode,

                "sha256": sha256,

                "exif": exif_data,

                "findings": findings,

                "warnings": warnings,

                "risk_score": metadata_risk
            }

    except Exception as e:

        return {
            "available": False,

            "format": None,
            "width": None,
            "height": None,
            "mode": None,

            "sha256": None,

            "exif": {},

            "findings": [
                "Metadata analysis failed"
            ],

            "warnings": [
                str(e)
            ],

            "risk_score": 0
        }