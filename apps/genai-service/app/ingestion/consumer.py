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
    "videoUrl": "https://www.youtube.com/watch?v=VIDEO_ID",
    "retryCount": 0   # incremented on each retry, max MAX_RETRIES
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
from app.ingestion.transcriber import fetch_transcript, VideoNotReadyError
from app.ingestion.chunker import chunk_transcript
from app.ingestion.embedder import embed_and_store

logger = logging.getLogger(__name__)

# Progressive retry delays in seconds: quick check first (30s, 45s, 60s...) then max 5m
RETRY_DELAYS = [30, 45, 60, 90, 120, 180, 240, 300]
MAX_RETRIES = 15


async def process_video_uploaded(event: dict) -> bool:
    """
    Full ingestion pipeline triggered by a VideoUploaded event.

    Steps:
    1. Fetch YouTube transcript (or Groq Whisper)
    2. Chunk the transcript
    3. Embed and store in Qdrant

    Returns:
        True if successfully processed and stored, False otherwise.
    """
    course_id = event.get("courseId")
    lecture_id = event.get("lectureId")
    video_url = event.get("videoUrl")

    logger.info(
        f"[Ingestion] Starting for lecture={lecture_id}, course={course_id}, url={video_url}"
    )

    # Step 1 — Transcription (may raise VideoNotReadyError)
    transcript = fetch_transcript(video_url)
    if not transcript:
        logger.warning(
            f"[Ingestion] No transcript available for lecture={lecture_id}. Skipping."
        )
        return False

    # Step 2 — Chunking
    chunks = chunk_transcript(
        text=transcript,
        course_id=course_id,
        lecture_id=lecture_id,
    )

    if not chunks:
        logger.warning(f"[Ingestion] No chunks produced for lecture={lecture_id}. Skipping.")
        return False

    # Step 3 — Embed and Store in Qdrant
    count = embed_and_store(chunks)
    logger.info(f"[Ingestion] Complete — {count} chunks stored for lecture={lecture_id}")
    return True


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


async def retry_video_later(channel: aio_pika.abc.AbstractChannel, event: dict) -> None:
    """
    YouTube is still processing the newly uploaded video.
    Wait progressive delay then re-publish the event to the same queue.
    Increments retryCount; gives up after MAX_RETRIES.
    """
    retry_count = event.get("retryCount", 0) + 1
    lecture_id = event.get("lectureId")

    if retry_count > MAX_RETRIES:
        logger.error(
            f"[Consumer] Giving up on lecture={lecture_id} after {MAX_RETRIES} retries. "
            f"YouTube video was never available."
        )
        return

    delay = RETRY_DELAYS[min(retry_count - 1, len(RETRY_DELAYS) - 1)]
    logger.warning(
        f"[Consumer] Video not ready on YouTube yet for lecture={lecture_id}. "
        f"Retry {retry_count}/{MAX_RETRIES} in {delay}s..."
    )

    await asyncio.sleep(delay)

    # Re-publish with incremented retryCount
    retry_event = {**event, "retryCount": retry_count}
    await channel.default_exchange.publish(
        Message(
            body=json.dumps(retry_event).encode(),
            delivery_mode=DeliveryMode.PERSISTENT,
            content_type="application/json",
        ),
        routing_key=settings.VIDEO_UPLOADED_QUEUE,
    )
    logger.info(
        f"[Consumer] Re-queued VideoUploaded for lecture={lecture_id} (retry {retry_count})"
    )


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
                        async with message.process(requeue=False):
                            try:
                                event = json.loads(message.body.decode())
                                logger.info(f"[Consumer] Received: {event.get('eventType')} "
                                            f"(retry={event.get('retryCount', 0)})")

                                success = await process_video_uploaded(event)
                                if success:
                                    await publish_ai_complete(
                                        channel,
                                        lecture_id=event.get("lectureId"),
                                        course_id=event.get("courseId"),
                                    )

                            except VideoNotReadyError as e:
                                # YouTube is still processing the video — schedule automatic retry
                                logger.warning(f"[Consumer] {e}")
                                await retry_video_later(channel, event)

                            except Exception as e:
                                logger.error(f"[Consumer] Error processing message: {e}")

        except Exception as e:
            logger.error(f"[Consumer] RabbitMQ connection error: {e}. Retrying in 5s...")
            await asyncio.sleep(5)
