"""
Qdrant Retriever
LangChain Qdrant retriever with metadata filtering.
Filters by courseId (and optionally lectureId) so students only access
content from courses they're enrolled in — enforcing RAG authorization.
"""

import logging
from typing import Optional
from functools import lru_cache

from qdrant_client import QdrantClient
from qdrant_client.http import models as rest
from langchain_qdrant import QdrantVectorStore
from langchain_core.vectorstores import VectorStoreRetriever
from langchain_huggingface import HuggingFaceEndpointEmbeddings

from app.config import settings

logger = logging.getLogger(__name__)


@lru_cache()
def _get_embedding_model() -> HuggingFaceEndpointEmbeddings:
    """Cached embedding model — loaded once at startup. Uses Inference API."""
    logger.info(f"Loading embedding model for retriever via Inference API: {settings.EMBEDDING_MODEL}")
    return HuggingFaceEndpointEmbeddings(
        model=settings.EMBEDDING_MODEL,
        huggingfacehub_api_token=settings.HUGGING_FACE_API,
    )


def get_retriever(
    course_id: str,
    lecture_id: Optional[str] = None,
    top_k: Optional[int] = None,
) -> VectorStoreRetriever:
    """
    Build a LangChain retriever filtered by courseId (and optionally lectureId).

    This enforces that a student's RAG query only searches within their
    authorized course content — matching the README security requirement.

    Args:
        course_id: Filter results to this course only
        lecture_id: Optional — further restrict to a specific lecture
        top_k: Number of chunks to retrieve (defaults to settings.RETRIEVER_TOP_K)

    Returns:
        A configured LangChain VectorStoreRetriever
    """
    k = top_k or settings.RETRIEVER_TOP_K

    # Build Qdrant filter
    filter_conditions = [
        rest.FieldCondition(
            key="metadata.courseId",
            match=rest.MatchValue(value=course_id)
        )
    ]
    
    if lecture_id:
        filter_conditions.append(
            rest.FieldCondition(
                key="metadata.lectureId",
                match=rest.MatchValue(value=lecture_id)
            )
        )
        
    qdrant_filter = rest.Filter(
        must=filter_conditions
    )

    client = QdrantClient(
        url=settings.QDRANT_URL,
        api_key=settings.QDRANT_API_KEY if settings.QDRANT_API_KEY else None
    )

    vectorstore = QdrantVectorStore(
        client=client,
        collection_name=settings.QDRANT_COLLECTION_NAME,
        embedding=_get_embedding_model(),
    )

    return vectorstore.as_retriever(
        search_type="similarity",
        search_kwargs={
            "k": k,
            "filter": qdrant_filter,
        },
    )
