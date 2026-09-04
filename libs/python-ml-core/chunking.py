"""
Text Chunking Utilities (shared)
Reusable chunking logic using LangChain's RecursiveCharacterTextSplitter.
Used by the GenAI service ingestion pipeline.
"""

from typing import List
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_core.documents import Document


def chunk_text(
    text: str,
    chunk_size: int = 500,
    chunk_overlap: int = 50,
    metadata: dict | None = None,
) -> List[Document]:
    """
    Split raw text into overlapping LangChain Documents.

    Args:
        text: Input text to split
        chunk_size: Maximum characters per chunk
        chunk_overlap: Overlap between consecutive chunks
        metadata: Optional metadata dict attached to every chunk

    Returns:
        List of LangChain Document objects
    """
    splitter = RecursiveCharacterTextSplitter(
        chunk_size=chunk_size,
        chunk_overlap=chunk_overlap,
        separators=["\n\n", "\n", ". ", " ", ""],
    )

    raw_chunks = splitter.split_text(text)
    base_metadata = metadata or {}

    return [
        Document(
            page_content=chunk,
            metadata={**base_metadata, "chunkIndex": idx},
        )
        for idx, chunk in enumerate(raw_chunks)
    ]
