
import logging
from io import BytesIO
from typing import Optional, Any

from typing import Any
from pydantic import HttpUrl
from fastapi import HTTPException
from bureaucracy_agent import run_bureaucracy_agent


from fastapi import (
    FastAPI,
    UploadFile,
    File,
    Form,
    HTTPException
)

from fastapi.responses import Response
from pydantic import BaseModel, Field

from PIL import Image, UnidentifiedImageError

# Civic grievance AI modules
from gemini_client import analyze_civic_image
from severity import calculate_severity
from department import recommend_department
from duplicate_detection import find_possible_duplicates

# Policy voice generation
from voice_explainer import generate_speech


# ==========================================
# APPLICATION CONFIGURATION
# ==========================================

logging.basicConfig(level=logging.INFO)

logger = logging.getLogger("civiclens")

app = FastAPI(
    title="CivicLens AI Engine",
    description=(
        "AI-powered civic intelligence platform "
        "for public services, infrastructure triage "
        "and multilingual policy assistance."
    ),
    version="2.0.0"
)


MAX_IMAGE_SIZE = 8 * 1024 * 1024

ALLOWED_FORMATS = {
    "JPEG": "image/jpeg",
    "PNG": "image/png",
    "WEBP": "image/webp"
}

class BureaucracyRequest(BaseModel):
    portal_url: HttpUrl
    service_request: str = Field(min_length=5, max_length=500)
    citizen_profile: dict[str, Any]
    max_steps: int = Field(default=5, ge=1, le=8)


@app.post("/bureaucracy/prepare")
async def prepare_public_service_application(request: BureaucracyRequest):
    try:
        return await run_bureaucracy_agent(
            portal_url=str(request.portal_url),
            service_request=request.service_request,
            citizen_profile=request.citizen_profile,
            max_steps=request.max_steps,
            headless=False,
        )
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc))
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Application preparation failed: {type(exc).__name__}")



# ==========================================
# REQUEST MODELS
# ==========================================

class DuplicateCheckRequest(BaseModel):

    latitude: float = Field(ge=-90, le=90)
    longitude: float = Field(ge=-180, le=180)

    category: str = Field(min_length=1)

    existing_reports: list[dict[str, Any]] = Field(
        default_factory=list
    )

    radius_m: float = Field(
        default=100,
        gt=0,
        le=10000
    )


class VoiceRequest(BaseModel):

    text: str = Field(
        min_length=1,
        max_length=10000
    )

    language: str = Field(
        default="Hindi",
        min_length=2,
        max_length=40
    )

    voice: str = Field(
        default="Kore",
        min_length=1,
        max_length=50
    )


# ==========================================
# 1. HEALTH CHECK
# ==========================================

@app.get("/health")
def health_check():

    return {
        "status": "success",
        "service": "CivicLens AI Engine",
        "version": "2.0.0"
    }


# ==========================================
# 2. CIVIC IMAGE ANALYSIS
# ==========================================

@app.post("/analyze")
def analyze_report(

    image: UploadFile = File(...),

    description: str = Form(default=""),

    latitude: Optional[float] = Form(default=None),

    longitude: Optional[float] = Form(default=None)

):

    # Validate GPS coordinates

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

    # Validate uploaded image MIME type

    if image.content_type not in ALLOWED_FORMATS.values():

        raise HTTPException(
            status_code=415,
            detail="Only JPEG, PNG and WEBP images are supported."
        )

    try:

        image_bytes = image.file.read(
            MAX_IMAGE_SIZE + 1
        )

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

        # Verify actual image contents

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

    except (
        UnidentifiedImageError,
        OSError,
        Image.DecompressionBombError
    ):

        raise HTTPException(
            status_code=400,
            detail="Invalid or corrupted image."
        )

    # Perform actual Gemini inference

    try:

        analysis = analyze_civic_image(
            image_bytes=image_bytes,
            mime_type=actual_mime_type,
            description=description
        )

        # Calculate severity using Python logic
        severity = calculate_severity(analysis)

        # Recommend responsible department
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

        logger.exception(
            "CivicLens image analysis failed"
        )

        raise HTTPException(
            status_code=502,
            detail="AI analysis failed. Please retry."
        )


# ==========================================
# 3. GEOSPATIAL DUPLICATE DETECTION
# ==========================================

@app.post("/duplicates/check")
def check_duplicates(
    request: DuplicateCheckRequest
):

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

        logger.exception(
            "CivicLens duplicate detection failed"
        )

        raise HTTPException(
            status_code=500,
            detail="Duplicate detection failed."
        )


# ==========================================
# 4. MULTILINGUAL POLICY VOICE EXPLAINER
# ==========================================

@app.post("/policy/speak")
def policy_speak(
    request: VoiceRequest
):

    try:

        # Generate actual speech from supplied text.
        # The text should already be translated into
        # the citizen's selected language.

        audio_bytes = generate_speech(

            text=request.text,

            voice=request.voice,

            style=(
                f"Speak naturally in {request.language}. "
                "Use a clear, calm and friendly public-service "
                "narrator style. Speak at a moderate pace. "
                "Pronounce all words clearly."
            )

        )

        # Return playable WAV audio

        return Response(

            content=audio_bytes,

            media_type="audio/wav",

            headers={

                "Content-Disposition":
                    'inline; filename="policy-explainer.wav"',

                "X-Explanation-Language":
                    request.language

            }

        )

    except ValueError as error:

        raise HTTPException(
            status_code=400,
            detail=str(error)
        )

    except Exception:

        logger.exception(
            "CivicLens policy voice generation failed"
        )

        raise HTTPException(
            status_code=502,
            detail="Could not generate voice explanation."
        )


# ==========================================
# APPLICATION STARTUP
# ==========================================

@app.on_event("startup")
async def startup_event():

    logger.info("CivicLens AI Engine started successfully.")

    logger.info("Available modules:")
    logger.info("1. Civic image analysis")
    logger.info("2. Geospatial duplicate detection")
    logger.info("3. Policy voice generation")
