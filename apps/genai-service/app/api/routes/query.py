"""
Query API Route
POST /api/v1/query — RAG question answering endpoint.

This is the REST interface. The gRPC interface (for API Gateway) is in app/grpc/.
"""

import logging
from typing import Optional, List
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

from app.rag.chain import run_rag_chain

logger = logging.getLogger(__name__)
router = APIRouter()


# ─────────────────────────────────────────────────────────────────────────────
# Request / Response Models
# ─────────────────────────────────────────────────────────────────────────────

class QueryRequest(BaseModel):
    courseId: str = Field(..., description="Course ID to restrict the RAG search")
    question: str = Field(..., min_length=5, description="Student's question")
    lectureId: Optional[str] = Field(None, description="Optional: restrict to a specific lecture")


class QueryResponse(BaseModel):
    answer: str
    sources: List[str]
    courseId: str
    lectureId: Optional[str]


# ─────────────────────────────────────────────────────────────────────────────
# Endpoints
# ─────────────────────────────────────────────────────────────────────────────

@router.post("/query", response_model=QueryResponse, summary="Ask a course question (RAG)")
async def query_course(body: QueryRequest) -> QueryResponse:
    """
    Run a RAG query against course lecture embeddings.

    The response is grounded in the actual lecture transcript chunks stored in ChromaDB.
    Results are filtered by courseId (and optionally lectureId) to enforce authorization.
    """
    logger.info(
        f"[Query] Received question for course={body.courseId}, lecture={body.lectureId}"
    )

    try:
        result = await run_rag_chain(
            question=body.question,
            course_id=body.courseId,
            lecture_id=body.lectureId,
        )
    except Exception as e:
        logger.error(f"[Query] RAG chain failed: {e}")
        raise HTTPException(status_code=500, detail="Failed to process your question.")

    return QueryResponse(
        answer=result["answer"],
        sources=result["sources"],
        courseId=body.courseId,
        lectureId=body.lectureId,
    )
