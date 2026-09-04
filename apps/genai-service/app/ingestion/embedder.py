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
from qdrant_client.models import VectorParams, Distance, PayloadSchemaType
from langchain_core.documents import Document
from langchain_huggingface import HuggingFaceEndpointEmbeddings
from langchain_qdrant import QdrantVectorStore

from app.config import settings

logger = logging.getLogger(__name__)

# Dimension for sentence-transformers/all-MiniLM-L6-v2
EMBEDDING_DIMENSION = 384


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


def ensure_collection(client: QdrantClient) -> None:
    """Ensure the target Qdrant collection and payload indexes exist before read/write operations."""
    collection_name = settings.QDRANT_COLLECTION_NAME
    try:
        if not client.collection_exists(collection_name):
            logger.info(f"Creating Qdrant collection '{collection_name}' with {EMBEDDING_DIMENSION}-dim Cosine vectors...")
            client.create_collection(
                collection_name=collection_name,
                vectors_config=VectorParams(size=EMBEDDING_DIMENSION, distance=Distance.COSINE),
            )
            logger.info(f"Qdrant collection '{collection_name}' created successfully.")

        # Ensure filtering payload indexes exist
        try:
            client.create_payload_index(
                collection_name=collection_name,
                field_name="metadata.courseId",
                field_schema=PayloadSchemaType.KEYWORD,
            )
            client.create_payload_index(
                collection_name=collection_name,
                field_name="metadata.lectureId",
                field_schema=PayloadSchemaType.KEYWORD,
            )
        except Exception:
            pass  # Indexes already exist
    except Exception as e:
        logger.error(f"Error ensuring Qdrant collection '{collection_name}': {e}")


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

    # Ensure collection and indexes exist before initializing QdrantVectorStore
    ensure_collection(client)

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
