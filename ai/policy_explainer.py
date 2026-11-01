
from io import BytesIO
from pypdf import PdfReader
from google.genai import types

import re

from pydantic import BaseModel, Field
from google.genai import types

from gemini_client import get_gemini_client, MODEL_NAME
def extract_pdf_pages(pdf_bytes: bytes):

    if not pdf_bytes:
        raise ValueError("PDF is empty.")

    if not pdf_bytes.startswith(b"%PDF-"):
        raise ValueError("Invalid PDF file.")

    try:
        reader = PdfReader(
            BytesIO(pdf_bytes),
            strict=False
        )

        if reader.is_encrypted:
            decrypted = reader.decrypt("")

            if not decrypted:
                raise ValueError("Password-protected PDF.")

    except ValueError:
        raise

    except Exception as error:
        raise ValueError(f"Could not read PDF: {error}")

    total_pages = len(reader.pages)

    if total_pages == 0:
        raise ValueError("PDF has no pages.")

    if total_pages > 200:
        raise ValueError("PDF exceeds 200 pages.")

    pages = []
    empty_pages = []

    for page_number, page in enumerate(
        reader.pages,
        start=1
    ):

        try:
            text = page.extract_text() or ""
        except Exception:
            text = ""

        text = "\n".join(
            line.strip()
            for line in text.splitlines()
            if line.strip()
        )

        if not text:
            empty_pages.append(page_number)
            continue

        pages.append({
            "page_number": page_number,
            "text": text
        })

    if not pages:
        raise ValueError(
            "No extractable text. PDF may be scanned."
        )

    return {
        "pages": pages,
        "empty_pages": empty_pages,
        "total_pages": total_pages
    }


def chunk_text(
    text: str,
    max_chars: int = 1400,
    overlap: int = 180
):

    if max_chars <= 0 or overlap < 0 or overlap >= max_chars:
        raise ValueError("Invalid chunk configuration.")

    chunks = []

    start = 0

    while start < len(text):

        end = min(
            start + max_chars,
            len(text)
        )

        if end < len(text):

            boundary = text.rfind(" ", start, end)

            if boundary > start:
                end = boundary

        chunk = text[start:end].strip()

        if chunk:
            chunks.append(chunk)

        if end >= len(text):
            break

        start = max(0, end - overlap)

    return chunks


def create_document_chunks(pdf_data):

    result = []

    for page in pdf_data["pages"]:

        page_chunks = chunk_text(
            page["text"]
        )

        for index, content in enumerate(
            page_chunks,
            start=1
        ):

            result.append({
                "page_number": page["page_number"],
                "chunk_index": index,
                "text": content
            })

    return result
