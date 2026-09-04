"""
AIService gRPC Servicer
Implements the AIService defined in ai.proto.
Bridges gRPC calls from the API Gateway to the LangChain RAG chain.
"""

import logging
import asyncio
import grpc
from app.rag.chain import run_rag_chain

logger = logging.getLogger(__name__)

# Import generated stubs (run scripts/generate_protos.py first)
try:
    from generated import ai_pb2, ai_pb2_grpc
except ImportError:
    raise RuntimeError(
        "gRPC stubs not found. Run: python scripts/generate_protos.py"
    )


class AIServicer(ai_pb2_grpc.AIServiceServicer):
    """
    gRPC Servicer for AIService.

    Methods:
        QueryCourse   — RAG-based course question answering
        GetIngestionStatus — Check lecture ingestion status
    """

    async def QueryCourse(self, request, context):
        """
        Handle a gRPC QueryCourse call from the API Gateway.

        Args:
            request: QueryRequest (courseId, question, lectureId)

        Returns:
            QueryResponse (answer, sources)
        """
        logger.info(
            f"[gRPC] QueryCourse — course={request.courseId}, "
            f"lecture={request.lectureId or 'all'}"
        )
        try:
            result = await run_rag_chain(
                question=request.question,
                course_id=request.courseId,
                lecture_id=request.lectureId or None,
            )
            return ai_pb2.QueryResponse(
                answer=result["answer"],
                sources=result["sources"],
            )
        except Exception as e:
            logger.error(f"[gRPC] QueryCourse failed: {e}")
            await context.abort(
                grpc.StatusCode.INTERNAL,
                f"RAG query failed: {str(e)}",
            )

    async def GetIngestionStatus(self, request, context):
        """
        Return the ingestion status for a lecture.
        Currently a stub — can be extended to track status in a database.
        """
        logger.info(f"[gRPC] GetIngestionStatus — lecture={request.lectureId}")
        # TODO: Track status in PostgreSQL or Redis
        return ai_pb2.IngestionStatusResponse(
            status="COMPLETE",
            lectureId=request.lectureId,
            message="Status tracking not yet implemented.",
        )
