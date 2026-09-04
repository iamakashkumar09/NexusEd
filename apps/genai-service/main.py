"""
NexusEd GenAI Service
Entry point: starts the FastAPI HTTP server and the gRPC server concurrently.
"""

import asyncio
import logging
import signal

import grpc
import uvicorn
from app.config import settings
from app.grpc.ai_servicer import AIServicer
from generated import ai_pb2_grpc

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
)
logger = logging.getLogger(__name__)


# ─────────────────────────────────────────────────────────────────────────────
# FastAPI Application
# ─────────────────────────────────────────────────────────────────────────────

def create_app():
    from fastapi import FastAPI
    from app.api.routes import query
    from app.ingestion.consumer import start_consumer
    from contextlib import asynccontextmanager

    @asynccontextmanager
    async def lifespan(app: FastAPI):
        """Start RabbitMQ consumer on app startup."""
        logger.info("🚀 Starting NexusEd GenAI Service...")
        consumer_task = asyncio.create_task(start_consumer())
        yield
        consumer_task.cancel()
        logger.info("🛑 GenAI Service shutting down.")

    app = FastAPI(
        title="NexusEd GenAI Service",
        description="RAG-based AI question answering and video ingestion pipeline",
        version="1.0.0",
        lifespan=lifespan,
    )

    app.include_router(query.router, prefix="/api/v1", tags=["Query"])

    @app.get("/health")
    async def health():
        return {"status": "ok", "service": settings.APP_NAME}

    return app


# ─────────────────────────────────────────────────────────────────────────────
# gRPC Server
# ─────────────────────────────────────────────────────────────────────────────

async def start_grpc_server():
    """Start the async gRPC server."""
    server = grpc.aio.server()
    ai_pb2_grpc.add_AIServiceServicer_to_server(AIServicer(), server)
    listen_addr = f"[::]:{settings.GRPC_PORT}"
    server.add_insecure_port(listen_addr)
    await server.start()
    logger.info(f"🔌 gRPC server listening on {listen_addr}")
    await server.wait_for_termination()


# ─────────────────────────────────────────────────────────────────────────────
# Main: Run both FastAPI + gRPC concurrently
# ─────────────────────────────────────────────────────────────────────────────

async def main():
    app = create_app()

    # Uvicorn config for FastAPI
    uvicorn_config = uvicorn.Config(
        app=app,
        host="0.0.0.0",
        port=settings.APP_PORT,
        log_level="info",
    )
    uvicorn_server = uvicorn.Server(uvicorn_config)

    # Run FastAPI + gRPC concurrently
    await asyncio.gather(
        uvicorn_server.serve(),
        start_grpc_server(),
    )


if __name__ == "__main__":
    asyncio.run(main())
