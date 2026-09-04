"""
YouTube Transcript Fetcher
Primary:  YouTube captions via youtube-transcript-api (instant, free).
Fallback: Groq Whisper audio transcription when captions are unavailable.

Since NexusEd stores videos on YouTube, we first try captions.
If the video has no captions (e.g. a newly uploaded lecture without auto-captions),
we download the audio with yt-dlp and send it to Groq's Whisper endpoint.
"""

import logging
import os
import re
import shutil
import tempfile
from typing import Optional

from youtube_transcript_api import YouTubeTranscriptApi, TranscriptsDisabled, NoTranscriptFound
from groq import Groq

from app.config import settings

logger = logging.getLogger(__name__)

# Ensure WinGet / standard ffmpeg locations are in PATH for yt-dlp subprocesses
_winget_links = os.path.expandvars(r"%LOCALAPPDATA%\Microsoft\WinGet\Links")
if os.path.isdir(_winget_links) and _winget_links not in os.environ.get("PATH", ""):
    os.environ["PATH"] = _winget_links + os.pathsep + os.environ.get("PATH", "")


class VideoNotReadyError(Exception):
    """Raised when YouTube is still processing the video — consumer should retry later."""
    pass


def extract_video_id(url_or_id: str) -> str:
    """
    Extract the YouTube video ID from a URL or return the ID directly.

    Supports:
    - https://www.youtube.com/watch?v=VIDEO_ID
    - https://youtu.be/VIDEO_ID
    - VIDEO_ID (plain 11-char ID)
    """
    patterns = [
        r"(?:v=)([a-zA-Z0-9_-]{11})",
        r"(?:youtu\.be/)([a-zA-Z0-9_-]{11})",
    ]
    for pattern in patterns:
        match = re.search(pattern, url_or_id)
        if match:
            return match.group(1)

    if re.match(r"^[a-zA-Z0-9_-]{11}$", url_or_id):
        return url_or_id

    raise ValueError(f"Could not extract YouTube video ID from: {url_or_id}")


# ─── Strategy 1: YouTube Captions ────────────────────────────────────────────

def _fetch_via_captions(video_id: str, language: str = "en") -> Optional[str]:
    """
    Try to get the transcript from YouTube's caption system.
    Returns None if no captions exist (not an error — triggers Whisper fallback).
    Raises VideoNotReadyError if YouTube is still encoding the video.
    """
    try:
        ytt_api = YouTubeTranscriptApi()
        transcript_list = ytt_api.list(video_id)

        try:
            transcript = transcript_list.find_transcript([language])
        except Exception:
            all_transcripts = list(transcript_list)
            if not all_transcripts:
                return None   # No captions at all → use Whisper
            transcript = all_transcripts[0]

        entries = transcript.fetch()

        def get_text(entry) -> str:
            if hasattr(entry, 'text'):
                return entry.text
            return entry["text"]

        full_text = " ".join(get_text(entry) for entry in entries)
        logger.info(
            f"[Captions] Fetched transcript for {video_id} "
            f"({len(full_text)} chars, {len(entries)} segments)"
        )
        return full_text

    except (TranscriptsDisabled, NoTranscriptFound):
        return None   # No captions → use Whisper fallback

    except Exception as e:
        error_msg = str(e)
        if "processing this video" in error_msg or "unplayable" in error_msg:
            raise VideoNotReadyError(
                f"Video {video_id} is still being processed by YouTube. Will retry later."
            )
        raise


# ─── Strategy 2: Groq Whisper Fallback ───────────────────────────────────────

def _fetch_via_whisper(video_id: str) -> Optional[str]:
    """
    Download the YouTube audio with yt-dlp and transcribe it using Groq Whisper.
    Used when YouTube captions are unavailable.
    """
    import yt_dlp  # lazy import — only needed for fallback

    groq_api_key = settings.GROQ_API_KEY or os.getenv("GROQ_API_KEY", "")
    if not groq_api_key:
        logger.warning("[Whisper] GROQ_API_KEY is not set — cannot use Whisper fallback.")
        return None

    video_url = f"https://www.youtube.com/watch?v={video_id}"
    logger.info(f"[Whisper] No captions found for {video_id}. Downloading audio for Whisper...")

    # Locate ffmpeg if available
    ffmpeg_exec = shutil.which("ffmpeg")
    if not ffmpeg_exec:
        winget_ffmpeg = os.path.expandvars(r"%LOCALAPPDATA%\Microsoft\WinGet\Links\ffmpeg.exe")
        if os.path.exists(winget_ffmpeg):
            ffmpeg_exec = winget_ffmpeg

    with tempfile.TemporaryDirectory() as tmpdir:
        ydl_opts = {
            "format": "bestaudio/best",
            "outtmpl": os.path.join(tmpdir, "audio.%(ext)s"),
            "postprocessors": [{
                "key": "FFmpegExtractAudio",
                "preferredcodec": "mp3",
                "preferredquality": "64",   # low quality is fine for speech
            }],
            "quiet": True,
            "no_warnings": True,
        }

        if ffmpeg_exec:
            ydl_opts["ffmpeg_location"] = os.path.dirname(ffmpeg_exec) if os.path.dirname(ffmpeg_exec) else ffmpeg_exec

        try:
            with yt_dlp.YoutubeDL(ydl_opts) as ydl:
                ydl.download([video_url])
        except Exception as e:
            error_msg = str(e)
            if "processing this video" in error_msg.lower() or "unplayable" in error_msg.lower() or "check back later" in error_msg.lower():
                raise VideoNotReadyError(
                    f"Video {video_id} is still being processed by YouTube. Will retry automatically."
                )
            logger.error(f"[Whisper] Failed to download audio for {video_id}: {e}")
            return None

        # Find the downloaded audio file
        audio_file = None
        for fname in os.listdir(tmpdir):
            if fname.startswith("audio"):
                audio_file = os.path.join(tmpdir, fname)
                break

        if not audio_file or not os.path.exists(audio_file):
            logger.error(f"[Whisper] Audio file not found after download for {video_id}")
            return None

        file_size_mb = os.path.getsize(audio_file) / (1024 * 1024)
        logger.info(f"[Whisper] Audio downloaded ({file_size_mb:.1f} MB). Sending to Groq Whisper...")

        # Groq Whisper has a 25 MB file limit
        if file_size_mb > 24:
            logger.warning(f"[Whisper] Audio file too large ({file_size_mb:.1f} MB > 24 MB). Skipping.")
            return None

        try:
            client = Groq(api_key=groq_api_key)
            with open(audio_file, "rb") as f:
                response = client.audio.transcriptions.create(
                    model="whisper-large-v3",
                    file=f,
                    response_format="text",
                )

            # Groq returns a string directly when response_format="text"
            transcript_text = response if isinstance(response, str) else response.text
            logger.info(
                f"[Whisper] Transcription complete for {video_id} "
                f"({len(transcript_text)} chars)"
            )
            return transcript_text

        except Exception as e:
            logger.error(f"[Whisper] Groq transcription failed for {video_id}: {e}")
            return None


# ─── Public API ───────────────────────────────────────────────────────────────

def fetch_transcript(video_url: str, language: str = "en") -> Optional[str]:
    """
    Fetch the full transcript text for a YouTube video.

    Strategy:
    1. Try YouTube captions (fast, free, no audio download)
    2. If no captions → download audio + Groq Whisper transcription

    Args:
        video_url: YouTube URL or video ID
        language:  Preferred caption language (default: 'en')

    Returns:
        Full transcript as a single string, or None if unavailable.

    Raises:
        VideoNotReadyError: YouTube is still processing the video — consumer should retry.
    """
    video_id = extract_video_id(video_url)
    logger.info(f"[Transcriber] Processing video: {video_id}")

    # Note: YouTube captions fetcher is temporarily commented out as requested.
    # We directly use Groq Whisper for all audio transcriptions.
    #
    # # Strategy 1 — YouTube captions (may raise VideoNotReadyError)
    # text = _fetch_via_captions(video_id, language)
    # if text:
    #     return text

    # Use Groq Whisper directly for audio transcription
    logger.info(f"[Transcriber] Transcribing video {video_id} directly with Groq Whisper...")
    text = _fetch_via_whisper(video_id)
    if text:
        return text

    logger.warning(f"[Transcriber] Could not get transcript for {video_id} via Groq Whisper.")
    return None
