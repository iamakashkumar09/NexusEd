"""
Text preprocessing utilities shared across GenAI/ML components.
"""

import re


def clean_text(text: str) -> str:
    """
    Basic text cleaning for transcript preprocessing.
    - Removes excessive whitespace
    - Removes common transcript artifacts (e.g., [Music], [Applause])
    - Normalizes line endings
    """
    # Remove transcript annotations like [Music], [Applause], [Laughter]
    text = re.sub(r"\[.*?\]", "", text)

    # Normalize whitespace
    text = re.sub(r"\s+", " ", text)

    # Strip leading/trailing whitespace
    text = text.strip()

    return text


def normalize_newlines(text: str) -> str:
    """Normalize mixed line endings to Unix-style."""
    return text.replace("\r\n", "\n").replace("\r", "\n")


def truncate_text(text: str, max_chars: int = 50000) -> str:
    """
    Truncate text to a maximum character count.
    Used to prevent excessively long transcripts from causing issues.
    """
    if len(text) <= max_chars:
        return text
    return text[:max_chars] + "... [truncated]"
