"""
Embedding Utilities (shared)
LangChain-wrapped SentenceTransformers embedding model singleton.
Shared by both ingestion and retrieval pipelines to ensure
the same vector space is used throughout.
"""

from functools import lru_cache
from langchain_huggingface import HuggingFaceEmbeddings


@lru_cache()
def get_embedding_model(model_name: str = "all-MiniLM-L6-v2") -> HuggingFaceEmbeddings:
    """
    Return a cached LangChain HuggingFaceEmbeddings instance.

    Using @lru_cache ensures the model is loaded from disk only once,
    regardless of how many times this function is called.

    Args:
        model_name: HuggingFace model identifier (default: all-MiniLM-L6-v2)

    Returns:
        LangChain HuggingFaceEmbeddings instance
    """
    return HuggingFaceEmbeddings(
        model_name=model_name,
        model_kwargs={"device": "cpu"},
        encode_kwargs={"normalize_embeddings": True},
    )
