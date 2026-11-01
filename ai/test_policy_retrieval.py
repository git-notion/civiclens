
import os
import sys
import math
import json

from pathlib import Path
from dotenv import load_dotenv
from google.genai import types

from policy_answer import answer_from_passages

from gemini_client import get_gemini_client
from policy_explainer import (
    extract_pdf_pages,
    create_document_chunks
)


# ==========================================
# CONFIGURATION
# ==========================================

AI_DIR = Path(__file__).resolve().parent

load_dotenv(AI_DIR / ".env")

EMBEDDING_MODEL = os.getenv(
    "GEMINI_EMBEDDING_MODEL",
    "gemini-embedding-001"
)

EMBEDDING_DIMENSION = 768

BATCH_SIZE = 8


# ==========================================
# GENERATE EMBEDDINGS
# ==========================================

def generate_embeddings(texts, task_type):

    client = get_gemini_client()

    response = client.models.embed_content(

        model=EMBEDDING_MODEL,

        contents=texts,

        config=types.EmbedContentConfig(

            task_type=task_type,

            output_dimensionality=EMBEDDING_DIMENSION

        )

    )

    if not response.embeddings:
        raise RuntimeError("No embeddings returned.")

    vectors = [
        embedding.values
        for embedding in response.embeddings
    ]

    if len(vectors) != len(texts):
        raise RuntimeError("Embedding count mismatch.")

    return vectors


# ==========================================
# COSINE SIMILARITY
# ==========================================

def cosine_similarity(a, b):

    if len(a) != len(b):
        raise ValueError("Vector dimension mismatch.")

    dot = sum(
        x * y for x, y in zip(a, b)
    )

    norm_a = math.sqrt(
        sum(x * x for x in a)
    )

    norm_b = math.sqrt(
        sum(y * y for y in b)
    )

    if norm_a == 0 or norm_b == 0:
        return 0.0

    return dot / (norm_a * norm_b)


# ==========================================
# MAIN RETRIEVAL PIPELINE
# ==========================================

def main():

    if len(sys.argv) < 2:
        print(
            'Usage: python test_policy_retrieval.py '
            '"document.pdf" "Your question"'
        )
        return

    pdf_path = Path(sys.argv[1])

    question = (
        sys.argv[2]
        if len(sys.argv) >= 3
        else "Who is eligible for PM-Kisan Maan-Dhan Yojana?"
    )

    language = (
        sys.argv[3]
        if len(sys.argv) >= 4
        else "English"
    )

    if not pdf_path.is_file():
        print("PDF not found:", pdf_path)
        return

    try:

        # STEP 1: Extract PDF

        print("\nSTEP 1: EXTRACTING PDF")
        print("=" * 45)

        pdf_data = extract_pdf_pages(
            pdf_path.read_bytes()
        )

        chunks = create_document_chunks(pdf_data)

        print("Pages:", pdf_data["total_pages"])
        print("Chunks:", len(chunks))

        # STEP 2: Embed document chunks

        print("\nSTEP 2: GENERATING DOCUMENT EMBEDDINGS")
        print("=" * 45)

        document_vectors = []

        for start in range(
            0,
            len(chunks),
            BATCH_SIZE
        ):

            batch = chunks[
                start:start + BATCH_SIZE
            ]

            texts = [
                (
                    f"Document: {pdf_path.name}\n"
                    f"Page: {chunk['page_number']}\n"
                    f"{chunk['text']}"
                )
                for chunk in batch
            ]

            vectors = generate_embeddings(
                texts,
                "RETRIEVAL_DOCUMENT"
            )

            document_vectors.extend(vectors)

            print(
                f"Embedded {len(document_vectors)} "
                f"/ {len(chunks)} chunks"
            )

       
        # STEP 3: Expand the citizen's question

        print("\nSTEP 3: EXPANDING RETRIEVAL QUERIES")
        print("=" * 45)

        retrieval_queries = [question]

        question_lower = question.lower()

        eligibility_terms = [
            "eligibility",
            "eligible",
            "qualify",
            "qualified",
            "exclusion",
            "excluded",
            "who can"
        ]

        if any(term in question_lower for term in eligibility_terms):

            retrieval_queries.extend([
                "What are all the eligibility conditions for this scheme?",
                "What categories of farmers or beneficiaries are excluded from this scheme?",
                "What exclusion criteria and certification rules are specified in the guidelines?"
            ])

        benefit_terms = [
            "benefit",
            "pension",
            "contribution",
            "amount",
            "financial"
        ]

        if any(term in question_lower for term in benefit_terms):

            retrieval_queries.extend([
                "What financial benefits does this scheme provide?",
                "What contribution amounts and payment conditions apply?",
                "When and under what conditions are benefits paid?"
            ])

        # Remove duplicate queries
        retrieval_queries = list(dict.fromkeys(retrieval_queries))

        for query in retrieval_queries:
            print("-", query)


        # STEP 4: Retrieve passages for every query

        print("\nSTEP 4: SEMANTIC RETRIEVAL")
        print("=" * 45)

        retrieved_map = {}

        for retrieval_query in retrieval_queries:

            query_vector = generate_embeddings(
                [retrieval_query],
                "RETRIEVAL_QUERY"
            )[0]

            scored_for_query = []

            for chunk, vector in zip(
                chunks,
                document_vectors
            ):

                score = cosine_similarity(
                    query_vector,
                    vector
                )

                scored_for_query.append({

                    "filename": pdf_path.name,

                    "page_number": chunk["page_number"],

                    "chunk_index": chunk["chunk_index"],

                    "text": chunk["text"],

                    "similarity": score,

                    "matched_queries": [retrieval_query]

                })

            scored_for_query.sort(
                key=lambda item: item["similarity"],
                reverse=True
            )

            # Retrieve the five best passages per query
            for item in scored_for_query[:5]:

                key = (
                    item["page_number"],
                    item["chunk_index"]
                )

                if key not in retrieved_map:

                    retrieved_map[key] = item

                else:

                    existing = retrieved_map[key]

                    existing["matched_queries"].append(
                        retrieval_query
                    )

                    existing["similarity"] = max(
                        existing["similarity"],
                        item["similarity"]
                    )

        scored_results = sorted(
            retrieved_map.values(),
            key=lambda item: item["similarity"],
            reverse=True
        )

        # Keep the context manageable
        top_passages = scored_results[:12]

        print("\nRETRIEVED PASSAGES")
        print("=" * 45)

        for rank, item in enumerate(
            top_passages,
            start=1
        ):

            print(f"\nRANK: {rank}")

            print("Page:", item["page_number"])

            print("Chunk:", item["chunk_index"])

            print(
                "Similarity:",
                round(item["similarity"], 4)
            )

            print(item["text"][:700])

            print("-" * 45)


        # STEP 5: Generate grounded policy answer

        print("\nSTEP 5: GENERATING POLICY ANSWER")
        print("=" * 45)

        answer = answer_from_passages(
            question=question,
            retrieved_passages=top_passages,
            language=language
        )

        print(
            json.dumps(
                answer,
                indent=2,
                ensure_ascii=False
            )
        )


    except Exception as error:

        print("\nRETRIEVAL FAILED")

        print(
            type(error).__name__,
            str(error)
        )


if __name__ == "__main__":
    main()
