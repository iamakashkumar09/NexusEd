"""
YouTube Transcript Fetcher
Fetches the transcript for a YouTube video using the youtube-transcript-api.
Since NexusEd stores videos on YouTube, this avoids the need for Whisper/ASR.
"""

import logging
import re
from typing import Optional
from youtube_transcript_api import YouTubeTranscriptApi, TranscriptsDisabled, NoTranscriptFound

logger = logging.getLogger(__name__)


def extract_video_id(url_or_id: str) -> str:
    """
    Extract the YouTube video ID from a URL or return the ID directly.

    Supports formats:
    - https://www.youtube.com/watch?v=VIDEO_ID
    - https://youtu.be/VIDEO_ID
    - VIDEO_ID (plain)
    """
    patterns = [
        r"(?:v=)([a-zA-Z0-9_-]{11})",
        r"(?:youtu\.be/)([a-zA-Z0-9_-]{11})",
    ]
    for pattern in patterns:
        match = re.search(pattern, url_or_id)
        if match:
            return match.group(1)

    # Assume it's already a video ID
    if re.match(r"^[a-zA-Z0-9_-]{11}$", url_or_id):
        return url_or_id

    raise ValueError(f"Could not extract YouTube video ID from: {url_or_id}")


def fetch_transcript(video_url: str, language: str = "en") -> Optional[str]:
    """
    Fetch the full transcript text for a YouTube video.

    Args:
        video_url: YouTube URL or video ID
        language: Preferred language code (default: 'en')

    Returns:
        Full transcript as a single string, or None if unavailable.
    """
    video_id = extract_video_id(video_url)
    logger.info(f"Fetching transcript for YouTube video: {video_id}")

    try:
        # Try to get transcript in preferred language, fall back to any available
        transcript_list = YouTubeTranscriptApi.list_transcripts(video_id)

        try:
            transcript = transcript_list.find_transcript([language])
        except Exception:
            # Fall back to the first available transcript
            transcript = transcript_list.find_generated_transcript(
                transcript_list._manually_created_transcripts
                or transcript_list._generated_transcripts
            )

        entries = transcript.fetch()

        # Combine all text entries into a single string
        full_text = " ".join(entry["text"] for entry in entries)
        logger.info(
            f"Successfully fetched transcript for {video_id} "
            f"({len(full_text)} characters, {len(entries)} segments)"
        )
        return full_text

    except TranscriptsDisabled:
        logger.warning(f"Transcripts are disabled for video {video_id}")
        return None
    except NoTranscriptFound:
        logger.warning(f"No transcript found for video {video_id} in language '{language}'")
        return None
    except Exception as e:
        logger.error(f"Failed to fetch transcript for {video_id}: {e}")
        raise
