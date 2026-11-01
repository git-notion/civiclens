
import os
import base64

from pathlib import Path
from dotenv import load_dotenv
from google import genai


AI_DIR = Path(__file__).resolve().parent

load_dotenv(AI_DIR / ".env")

TTS_MODEL = os.getenv(
    "GEMINI_TTS_MODEL",
    "gemini-3.8-flash-lite-tts"
)


def generate_speech(
    text: str,
    voice: str = "Kore",
    style: str = "Clear, calm and friendly public-service narrator. Speak naturally at a moderate pace."
) -> bytes:
    """
    Convert an already translated policy explanation
    into WAV audio.

    The input text is spoken verbatim.
    Translation must happen before this function.
    """

    if not text or not text.strip():
        raise ValueError("Speech text cannot be empty.")

    if len(text) > 10000:
        raise ValueError("Speech text exceeds the 10000 character limit.")

    api_key = os.getenv("GEMINI_API_KEY")

    if not api_key:
        raise RuntimeError("GEMINI_API_KEY is missing.")

    client = genai.Client(api_key=api_key)

    interaction = client.interactions.create(
        model=TTS_MODEL,

        input=[
            {
                "type": "user_input",
                "content": [
                    {
                        "type": "text",
                        "text": text.strip(),
                        "annotations": [
                            {
                                "type": "speech_metadata",
                                "style": style
                            }
                        ]
                    }
                ]
            }
        ],

        response_format={
            "type": "audio"
        },

        generation_config={
            "speech_config": [
                {
                    "voice": voice
                }
            ]
        }
    )

    audio_output = interaction.output_audio

    if audio_output is None or not audio_output.data:
        raise RuntimeError("Gemini did not return audio.")

    audio_bytes = base64.b64decode(
        audio_output.data,
        validate=True
    )

    if not audio_bytes.startswith(b"RIFF"):
        raise RuntimeError("Generated audio is not a valid WAV file.")

    return audio_bytes
