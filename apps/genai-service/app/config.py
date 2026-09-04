"""
GenAI Service Configuration
All settings are loaded from environment variables via pydantic-settings.
"""

from pydantic_settings import BaseSettings, SettingsConfigDict
from functools import lru_cache


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore",
    )

    # ── App ──────────────────────────────────────────────────────────────────
    APP_NAME: str = "nexused-genai-service"
    APP_ENV: str = "development"
    APP_PORT: int = 8001
    GRPC_PORT: int = 50054

    # ── LLM ──────────────────────────────────────────────────────────────────
    LLM_PROVIDER: str = "groq"                    # groq | gemini | openai | ollama
    LLM_MODEL: str = "qwen/qwen3.8-27b"          # Groq model

    # Provider API keys
    GROQ_API_KEY: str = ""
    GOOGLE_API_KEY: str = ""
    OPENAI_API_KEY: str = ""

    # Ollama (local — future use)
    OLLAMA_URL: str = "http://localhost:11434"
    OLLAMA_MODEL: str = "llama3"

    # ── Embeddings ───────────────────────────────────────────────────────────
    EMBEDDING_MODEL: str = "sentence-transformers/all-MiniLM-L6-v2"
    HUGGING_FACE_API: str = ""

    # ── Qdrant ───────────────────────────────────────────────────────────────
    QDRANT_URL: str = ""
    QDRANT_API_KEY: str = ""
    QDRANT_COLLECTION_NAME: str = "nexused_lectures"

    # ── RabbitMQ ─────────────────────────────────────────────────────────────
    RABBITMQ_URL: str = "amqp://guest:guest@localhost:5672/"
    VIDEO_UPLOADED_QUEUE: str = "video.uploaded"
    AI_PROCESSING_COMPLETE_QUEUE: str = "ai.processing.complete"

    # ── Ingestion ─────────────────────────────────────────────────────────────
    CHUNK_SIZE: int = 500
    CHUNK_OVERLAP: int = 50
    RETRIEVER_TOP_K: int = 5


@lru_cache()
def get_settings() -> Settings:
    return Settings()


settings = get_settings()
