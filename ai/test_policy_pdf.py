
import sys
import json
from pathlib import Path

from policy_explainer import (
    extract_pdf_pages,
    create_document_chunks
)


def main():

    if len(sys.argv) < 2:
        print("Usage: python test_policy_pdf.py <pdf_path>")
        return

    pdf_path = Path(sys.argv[1])

    if not pdf_path.is_file():
        print("PDF not found:", pdf_path)
        return

    if pdf_path.suffix.lower() != ".pdf":
        print("Please provide a PDF file.")
        return

    print("\nReading government document...\n")

    try:

        pdf_bytes = pdf_path.read_bytes()

        pdf_data = extract_pdf_pages(pdf_bytes)

        chunks = create_document_chunks(pdf_data)

        print("DOCUMENT EXTRACTION SUCCESSFUL")
        print("=" * 40)

        print("Filename:", pdf_path.name)
        print("Total pages:", pdf_data["total_pages"])
        print("Pages extracted:", len(pdf_data["pages"]))
        print("Empty pages:", pdf_data["empty_pages"])
        print("Total chunks:", len(chunks))

        print("\nFIRST THREE CHUNKS")
        print("=" * 40)

        for chunk in chunks[:3]:

            print("\nPage:", chunk["page_number"])
            print("Chunk:", chunk["chunk_index"])
            print(chunk["text"][:500])
            print("-" * 40)

    except Exception as error:

        print("\nPDF PROCESSING FAILED")
        print(type(error).__name__, str(error))


if __name__ == "__main__":
    main()
