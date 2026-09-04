"""
Text Chunker
Splits transcript text into overlapping chunks using LangChain's
RecursiveCharacterTextSplitter. Chunk size and overlap are configurable
via environment variables.
Compatible with langchain >= 1.0 (uses langchain_text_splitters package)
"""

import logging
from typing import List
from langchain_core.documents import Document
from langchain_text_splitters import RecursiveCharacterTextSplitter
from app.config import settings

logger = logging.getLogger(__name__)


def chunk_transcript(
    text: str,
    course_id: str,
    lecture_id: str,
    chunk_size: int | None = None,
    chunk_overlap: int | None = None,
) -> List[Document]:
    """
    Split a transcript into overlapping LangChain Documents with metadata.

    Args:
        text: Raw transcript text
        course_id: Course identifier (for ChromaDB metadata filtering)
        lecture_id: Lecture identifier
        chunk_size: Characters per chunk (defaults to settings.CHUNK_SIZE)
        chunk_overlap: Overlap between chunks (defaults to settings.CHUNK_OVERLAP)

    Returns:
        List of LangChain Document objects with metadata
    """
    chunk_size = chunk_size or settings.CHUNK_SIZE
    chunk_overlap = chunk_overlap or settings.CHUNK_OVERLAP

    splitter = RecursiveCharacterTextSplitter(
        chunk_size=chunk_size,
        chunk_overlap=chunk_overlap,
        separators=["\n\n", "\n", ". ", " ", ""],
    )

    raw_chunks = splitter.split_text(text)

    documents = [
        Document(
            page_content=chunk,
            metadata={
                "courseId": course_id,
                "lectureId": lecture_id,
                "chunkIndex": idx,
                "source": f"lecture:{lecture_id}:chunk:{idx}",
            },
        )
        for idx, chunk in enumerate(raw_chunks)
    ]

    logger.info(
        f"Chunked transcript for lecture {lecture_id} into {len(documents)} chunks "
        f"(size={chunk_size}, overlap={chunk_overlap})"
    )
    return documents
