
import logging
from io import BytesIO
from typing import Optional

from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from pydantic import BaseModel, Field
from PIL import Image, UnidentifiedImageError

from gemini_client import analyze_civic_image
from severity import calculate_severity
from department import recommend_department
from duplicate_detection import find_possible_duplicates


logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("civiclens")

app = FastAPI(
    title="CivicLens AI Engine",
    description="AI-powered civic infrastructure analysis and triage",
    version="1.0.0"
)

MAX_IMAGE_SIZE = 8 * 1024 * 1024

ALLOWED_FORMATS = {
    "JPEG": "image/jpeg",
    "PNG": "image/png",
    "WEBP": "image/webp"
}


# -------------------------------
# Health check
# -------------------------------

@app.get("/health")
def health_check():
    return {
        "status": "success",
        "service": "CivicLens AI Engine"
    }


# -------------------------------
# Duplicate detection request
# -------------------------------

class DuplicateCheckRequest(BaseModel):

    latitude: float = Field(ge=-90, le=90)
    longitude: float = Field(ge=-180, le=180)

    category: str = Field(min_length=1)

    existing_reports: list[dict] = Field(
        default_factory=list
    )

    radius_m: float = Field(
        default=100,
        gt=0,
        le=10000
    )


# -------------------------------
# Image analysis endpoint
# -------------------------------

@app.post("/analyze")
def analyze_report(
    image: UploadFile = File(...),
    description: str = Form(default=""),
    latitude: Optional[float] = Form(default=None),
    longitude: Optional[float] = Form(default=None)
):

    # Validate coordinates
    if (latitude is None) != (longitude is None):
        raise HTTPException(
            status_code=400,
            detail="Provide both latitude and longitude."
        )

    if latitude is not None:
        if not -90 <= latitude <= 90:
            raise HTTPException(
                status_code=400,
                detail="Invalid latitude."
            )

        if not -180 <= longitude <= 180:
            raise HTTPException(
                status_code=400,
                detail="Invalid longitude."
            )

    # Validate declared MIME type
    if image.content_type not in ALLOWED_FORMATS.values():
        raise HTTPException(
            status_code=415,
            detail="Only JPEG, PNG and WEBP images are supported."
        )

    try:
        image_bytes = image.file.read(MAX_IMAGE_SIZE + 1)

        if not image_bytes:
            raise HTTPException(
                status_code=400,
                detail="Uploaded image is empty."
            )

        if len(image_bytes) > MAX_IMAGE_SIZE:
            raise HTTPException(
                status_code=413,
                detail="Image must be smaller than 8 MB."
            )

        # Verify that the file is actually an image
        with Image.open(BytesIO(image_bytes)) as img:

            image_format = img.format
            width, height = img.size

            if image_format not in ALLOWED_FORMATS:
                raise HTTPException(
                    status_code=415,
                    detail="Unsupported image format."
                )

            if width * height > 20_000_000:
                raise HTTPException(
                    status_code=413,
                    detail="Image dimensions are too large."
                )

            img.verify()

        actual_mime_type = ALLOWED_FORMATS[image_format]

        if image.content_type != actual_mime_type:
            raise HTTPException(
                status_code=400,
                detail="Image content type does not match the file."
            )

    except HTTPException:
        raise

    except (UnidentifiedImageError, OSError, Image.DecompressionBombError):
        raise HTTPException(
            status_code=400,
            detail="Invalid or corrupted image."
        )

    # Run actual AI inference
    try:

        analysis = analyze_civic_image(
            image_bytes=image_bytes,
            mime_type=actual_mime_type,
            description=description
        )

        severity = calculate_severity(analysis)

        department = recommend_department(analysis)

        return {
            "status": "success",
            "analysis": analysis.model_dump(),
            "severity_assessment": severity,
            "department_recommendation": department,
            "location": {
                "latitude": latitude,
                "longitude": longitude
            } if latitude is not None else None
        }

    except ValueError as error:
        raise HTTPException(
            status_code=400,
            detail=str(error)
        )

    except Exception:
        logger.exception("CivicLens AI analysis failed")

        raise HTTPException(
            status_code=502,
            detail="AI analysis failed. Please retry."
        )


# -------------------------------
# Duplicate detection endpoint
# -------------------------------

@app.post("/duplicates/check")
def check_duplicates(request: DuplicateCheckRequest):

    try:

        result = find_possible_duplicates(
            latitude=request.latitude,
            longitude=request.longitude,
            category=request.category,
            existing_reports=request.existing_reports,
            radius_m=request.radius_m
        )

        return {
            "status": "success",
            "duplicate_analysis": result
        }

    except ValueError as error:
        raise HTTPException(
            status_code=400,
            detail=str(error)
        )

    except Exception:
        logger.exception("Duplicate detection failed")

        raise HTTPException(
            status_code=500,
            detail="Duplicate detection failed."
        )
