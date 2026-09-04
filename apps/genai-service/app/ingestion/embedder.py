"""
Embedder
Uses LangChain's HuggingFaceEmbeddings (wrapping SentenceTransformers)
to embed transcript chunks and store them in Qdrant Cloud.
Compatible with langchain-qdrant and qdrant-client.
"""

import logging
from typing import List
from functools import lru_cache

from qdrant_client import QdrantClient
from langchain_core.documents import Document
from langchain_huggingface import HuggingFaceEndpointEmbeddings
from langchain_qdrant import QdrantVectorStore

from app.config import settings

logger = logging.getLogger(__name__)


@lru_cache()
def get_embedding_model() -> HuggingFaceEndpointEmbeddings:
    """
    Return a cached LangChain HuggingFaceEndpointEmbeddings instance.
    This calls the Hugging Face Inference API.
    """
    logger.info(f"Loading embedding model via Inference API: {settings.EMBEDDING_MODEL}")
    return HuggingFaceEndpointEmbeddings(
        model=settings.EMBEDDING_MODEL,
        huggingfacehub_api_token=settings.HUGGING_FACE_API,
    )


def get_vectorstore() -> QdrantVectorStore:
    """
    Return a LangChain Qdrant vectorstore connected to Qdrant Cloud.
    """
    if not settings.QDRANT_URL:
        logger.warning("QDRANT_URL is not set. Will attempt local memory/disk if applicable, but cloud expects a URL.")

    # Initialize Qdrant Client
    client = QdrantClient(
        url=settings.QDRANT_URL,
        api_key=settings.QDRANT_API_KEY if settings.QDRANT_API_KEY else None
    )

    # Note: QdrantVectorStore will automatically create the collection if it doesn't exist
    # when documents are added via add_documents.
    return QdrantVectorStore(
        client=client,
        collection_name=settings.QDRANT_COLLECTION_NAME,
        embedding=get_embedding_model(),
    )


def embed_and_store(documents: List[Document]) -> int:
    """
    Embed a list of LangChain Documents and store them in Qdrant.

    Args:
        documents: List of chunked transcript Documents with metadata

    Returns:
        Number of documents stored
    """
    if not documents:
        logger.warning("No documents to embed — skipping.")
        return 0

    lecture_id = documents[0].metadata.get("lectureId", "unknown")
    logger.info(f"Embedding {len(documents)} chunks for lecture: {lecture_id}")

    vectorstore = get_vectorstore()
    vectorstore.add_documents(documents)

    logger.info(f"Stored {len(documents)} embeddings in Qdrant for lecture: {lecture_id}")
    return len(documents)
