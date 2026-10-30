
import sys
import mimetypes
import json

from pathlib import Path

from gemini_client import analyze_civic_image
from severity import calculate_severity
from department import recommend_department


def main():

    # Check command-line arguments
    if len(sys.argv) < 2:
        print("Usage: python test_gemini.py <image_path>")
        return

    image_path = Path(sys.argv[1])

    # Check whether the image exists
    if not image_path.is_file():
        print("Image file not found:", image_path)
        return

    # Identify image format
    mime_type, _ = mimetypes.guess_type(image_path.name)

    if not mime_type or not mime_type.startswith("image/"):
        print("Unsupported image format.")
        return

    image_bytes = image_path.read_bytes()

    print("\nAnalysing photograph using Gemini...\n")

    try:
        # STEP 1: Gemini image analysis
        result = analyze_civic_image(
            image_bytes=image_bytes,
            mime_type=mime_type,
            description="Citizen reported a possible civic infrastructure problem."
        )

        print("\nGEMINI ANALYSIS")
        print("===================")

        print(result.model_dump_json(indent=2))

        # STEP 2: Calculate severity using our Python engine
        severity_result = calculate_severity(result)

        print("\nSEVERITY ASSESSMENT")
        print("===================")

        print(
            json.dumps(
                severity_result,
                indent=2
            )
        )

        # STEP 3: Recommend responsible department
        department_result = recommend_department(result)

        print("\nDEPARTMENT RECOMMENDATION")
        print("=========================")

        print(
            json.dumps(
                department_result,
                indent=2
            )
        )

    except Exception as error:
        print("\nAnalysis failed:")
        print(type(error).__name__, str(error))


if __name__ == "__main__":
    main()
