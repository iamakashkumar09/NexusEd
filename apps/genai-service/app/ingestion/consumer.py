"""
RabbitMQ Event Consumer
Listens for VideoUploaded events from RabbitMQ and triggers the ingestion pipeline.
After processing, publishes an AIProcessingComplete event.

Event shape (VideoUploaded):
{
    "eventType": "VideoUploaded",
    "eventId": "uuid",
    "timestamp": "2026-09-04T10:00:00Z",
    "courseId": "course-id",
    "lectureId": "lecture-id",
    "videoUrl": "https://www.youtube.com/watch?v=VIDEO_ID"
}
"""

import asyncio
import json
import logging
import uuid
from datetime import datetime, timezone

import aio_pika
from aio_pika import Message, DeliveryMode

from app.config import settings
from app.ingestion.transcriber import fetch_transcript
from app.ingestion.chunker import chunk_transcript
from app.ingestion.embedder import embed_and_store

logger = logging.getLogger(__name__)


async def process_video_uploaded(event: dict) -> None:
    """
    Full ingestion pipeline triggered by a VideoUploaded event.

    Steps:
    1. Fetch YouTube transcript
    2. Chunk the transcript
    3. Embed and store in ChromaDB
    """
    course_id = event.get("courseId")
    lecture_id = event.get("lectureId")
    video_url = event.get("videoUrl")

    logger.info(
        f"[Ingestion] Starting for lecture={lecture_id}, course={course_id}, url={video_url}"
    )

    # Step 1 — Transcription
    transcript = fetch_transcript(video_url)
    if not transcript:
        logger.warning(
            f"[Ingestion] No transcript available for lecture={lecture_id}. Skipping."
        )
        return

    # Step 2 — Chunking
    chunks = chunk_transcript(
        text=transcript,
        course_id=course_id,
        lecture_id=lecture_id,
    )

    # Step 3 — Embed and Store in ChromaDB
    count = embed_and_store(chunks)
    logger.info(f"[Ingestion] Complete — {count} chunks stored for lecture={lecture_id}")


async def publish_ai_complete(channel: aio_pika.abc.AbstractChannel, lecture_id: str, course_id: str) -> None:
    """Publish AIProcessingComplete event back to RabbitMQ."""
    payload = {
        "eventType": "AIProcessingComplete",
        "eventId": str(uuid.uuid4()),
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "lectureId": lecture_id,
        "courseId": course_id,
    }
    await channel.default_exchange.publish(
        Message(
            body=json.dumps(payload).encode(),
            delivery_mode=DeliveryMode.PERSISTENT,
            content_type="application/json",
        ),
        routing_key=settings.AI_PROCESSING_COMPLETE_QUEUE,
    )
    logger.info(f"[Consumer] Published AIProcessingComplete for lecture={lecture_id}")


async def start_consumer() -> None:
    """
    Connect to RabbitMQ and start consuming VideoUploaded events.
    Runs indefinitely as a background task.
    """
    logger.info(f"[Consumer] Connecting to RabbitMQ: {settings.RABBITMQ_URL}")

    while True:
        try:
            connection = await aio_pika.connect_robust(settings.RABBITMQ_URL)

            async with connection:
                channel = await connection.channel()
                await channel.set_qos(prefetch_count=1)

                # Declare queues (idempotent)
                queue = await channel.declare_queue(
                    settings.VIDEO_UPLOADED_QUEUE,
                    durable=True,
                )
                await channel.declare_queue(
                    settings.AI_PROCESSING_COMPLETE_QUEUE,
                    durable=True,
                )

                logger.info(
                    f"[Consumer] Listening on queue: {settings.VIDEO_UPLOADED_QUEUE}"
                )

                async with queue.iterator() as queue_iter:
                    async for message in queue_iter:
                        async with message.process(requeue=True):
                            try:
                                event = json.loads(message.body.decode())
                                logger.info(f"[Consumer] Received: {event.get('eventType')}")

                                await process_video_uploaded(event)
                                await publish_ai_complete(
                                    channel,
                                    lecture_id=event.get("lectureId"),
                                    course_id=event.get("courseId"),
                                )
                            except Exception as e:
                                logger.error(f"[Consumer] Error processing message: {e}")

        except Exception as e:
            logger.error(f"[Consumer] RabbitMQ connection error: {e}. Retrying in 5s...")
            await asyncio.sleep(5)
