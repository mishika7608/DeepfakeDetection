from __future__ import annotations

import json
from pathlib import Path
from typing import Any

import c2pa


def _safe_string(value: Any) -> str:
    if value is None:
        return ""
    return str(value)


def analyze_c2pa(image_path: str) -> dict[str, Any]:
    """
    Read and validate C2PA Content Credentials embedded
    in an image.

    This function NEVER modifies the uploaded image.
    """

    path = Path(image_path)

    result = {
        "available": True,
        "status": "not_present",
        "has_manifest": False,
        "validation_state": None,
        "claim_generator": None,
        "title": None,
        "actions": [],
        "ingredients": [],
        "findings": [],
        "warnings": [],
    }

    try:

        # --------------------------------------------------
        # Read C2PA manifest
        # --------------------------------------------------

        with c2pa.Context() as context:

            with c2pa.Reader(
                str(path),
                context=context,
            ) as reader:

                # Check whether a manifest is embedded.
                result["has_manifest"] = reader.is_embedded()

                if not result["has_manifest"]:

                    result["status"] = "not_present"

                    result["findings"].append(
                        "No embedded C2PA Content Credentials "
                        "were detected."
                    )

                    result["findings"].append(
                        "C2PA absence is inconclusive and does "
                        "not indicate that the image is fake."
                    )

                    return result

                # --------------------------------------------------
                # Manifest exists
                # --------------------------------------------------

                result["status"] = "present"

                # Validation state
                try:

                    validation_state = (
                        reader.get_validation_state()
                    )

                    result["validation_state"] = (
                        _safe_string(validation_state)
                    )

                except Exception:
                    result["validation_state"] = None

                # --------------------------------------------------
                # Parse manifest JSON
                # --------------------------------------------------

                manifest_store = json.loads(
                    reader.json()
                )

                active_manifest_id = (
                    manifest_store.get(
                        "active_manifest"
                    )
                )

                manifests = (
                    manifest_store.get(
                        "manifests",
                        {}
                    )
                )

                active_manifest = (
                    manifests.get(
                        active_manifest_id,
                        {}
                    )
                    if active_manifest_id
                    else {}
                )

                # --------------------------------------------------
                # Claim generator
                # --------------------------------------------------

                claim_generator = (
                    active_manifest.get(
                        "claim_generator"
                    )
                )

                if claim_generator:
                    result["claim_generator"] = (
                        claim_generator
                    )

                # --------------------------------------------------
                # Title
                # --------------------------------------------------

                title = active_manifest.get(
                    "title"
                )

                if title:
                    result["title"] = title

                # --------------------------------------------------
                # Assertions / actions
                # --------------------------------------------------

                assertions = active_manifest.get(
                    "assertions",
                    []
                )

                for assertion in assertions:

                    label = assertion.get(
                        "label"
                    )

                    data = assertion.get(
                        "data",
                        {}
                    )

                    if label == "c2pa.actions":

                        actions = data.get(
                            "actions",
                            []
                        )

                        for action in actions:

                            action_name = action.get(
                                "action"
                            )

                            source_type = action.get(
                                "digitalSourceType"
                            )

                            result["actions"].append(
                                {
                                    "action": action_name,
                                    "digital_source_type":
                                        source_type,
                                }
                            )

                # --------------------------------------------------
                # Ingredients / provenance chain
                # --------------------------------------------------

                ingredients = active_manifest.get(
                    "ingredients",
                    []
                )

                for ingredient in ingredients:

                    result["ingredients"].append(
                        {
                            "title": ingredient.get(
                                "title"
                            ),
                            "relationship": ingredient.get(
                                "relationship"
                            ),
                            "format": ingredient.get(
                                "format"
                            ),
                        }
                    )

                # --------------------------------------------------
                # Findings
                # --------------------------------------------------

                result["findings"].append(
                    "C2PA Content Credentials are embedded "
                    "in this image."
                )

                if result["claim_generator"]:

                    result["findings"].append(
                        "Claim generator: "
                        + result["claim_generator"]
                    )

                if result["actions"]:

                    for action in result["actions"]:

                        action_name = (
                            action.get("action")
                            or "unknown"
                        )

                        source_type = (
                            action.get(
                                "digital_source_type"
                            )
                        )

                        if source_type:

                            result["findings"].append(
                                f"Recorded action: "
                                f"{action_name} "
                                f"({source_type})."
                            )

                        else:

                            result["findings"].append(
                                f"Recorded action: "
                                f"{action_name}."
                            )

                if result["ingredients"]:

                    result["findings"].append(
                        f"{len(result['ingredients'])} "
                        "provenance ingredient(s) recorded."
                    )

                # --------------------------------------------------
                # Validation interpretation
                # --------------------------------------------------

                state = (
                    result["validation_state"]
                    or ""
                ).lower()

                if (
                    "valid" in state
                    and "invalid" not in state
                ):

                    result["findings"].append(
                        "The C2PA manifest passed the "
                        "available validation checks."
                    )

                elif "invalid" in state:

                    result["warnings"].append(
                        "The C2PA manifest contains "
                        "validation problems."
                    )

                else:

                    result["findings"].append(
                        "A C2PA manifest was found, but its "
                        "trust/validation state could not be "
                        "fully established by the current "
                        "configuration."
                    )

                return result

    except Exception as exc:

        return {
            "available": False,
            "status": "error",
            "has_manifest": False,
            "validation_state": None,
            "claim_generator": None,
            "title": None,
            "actions": [],
            "ingredients": [],
            "findings": [
                "C2PA analysis could not be completed."
            ],
            "warnings": [
                str(exc)
            ],
        }