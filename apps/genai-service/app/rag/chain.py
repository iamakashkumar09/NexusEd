"""
LangChain RAG Chain
Orchestrates the full RAG pipeline:
  Question → Retriever → Context → Prompt → LLM → Answer

The LLM is selected based on LLM_PROVIDER env var, making it easy to
swap between Gemini, OpenAI, or Ollama without changing this code.
"""

import logging
from typing import Optional
from functools import lru_cache

from langchain_core.language_models import BaseChatModel
from langchain_core.output_parsers import StrOutputParser
from langchain_core.runnables import RunnablePassthrough, RunnableParallel

from app.config import settings
from app.rag.prompt import RAG_PROMPT
from app.rag.retriever import get_retriever

logger = logging.getLogger(__name__)


# ─────────────────────────────────────────────────────────────────────────────
# LLM Factory — swap provider via LLM_PROVIDER env var
# ─────────────────────────────────────────────────────────────────────────────

@lru_cache()
def get_llm() -> BaseChatModel:
    """
    Return the configured LangChain LLM.
    Provider is controlled by the LLM_PROVIDER environment variable:
      - "groq"   → ChatGroq (default — ultra-fast inference via Groq Cloud)
      - "gemini" → ChatGoogleGenerativeAI
      - "openai" → ChatOpenAI
      - "ollama" → ChatOllama (local)
    """
    provider = settings.LLM_PROVIDER.lower()
    logger.info(f"Loading LLM: provider={provider}, model={settings.LLM_MODEL}")

    if provider == "groq":
        from langchain_groq import ChatGroq
        return ChatGroq(
            model=settings.LLM_MODEL,
            groq_api_key=settings.GROQ_API_KEY,
            temperature=0.2,
            max_tokens=800,
        )

    elif provider == "gemini":
        from langchain_google_genai import ChatGoogleGenerativeAI
        return ChatGoogleGenerativeAI(
            model=settings.LLM_MODEL,
            google_api_key=settings.GOOGLE_API_KEY,
            temperature=0.2,
        )

    elif provider == "openai":
        from langchain_openai import ChatOpenAI
        return ChatOpenAI(
            model=settings.LLM_MODEL,
            openai_api_key=settings.OPENAI_API_KEY,
            temperature=0.2,
        )

    elif provider == "ollama":
        from langchain_community.chat_models import ChatOllama
        return ChatOllama(
            model=settings.OLLAMA_MODEL,
            base_url=settings.OLLAMA_URL,
            temperature=0.2,
        )

    else:
        raise ValueError(
            f"Unknown LLM_PROVIDER: '{provider}'. Must be 'groq', 'gemini', 'openai', or 'ollama'."
        )


# ─────────────────────────────────────────────────────────────────────────────
# RAG Chain
# ─────────────────────────────────────────────────────────────────────────────

def _format_docs(docs) -> str:
    """Concatenate retrieved document chunks into a single context string."""
    return "\n\n---\n\n".join(
        f"[Chunk {i+1} | Lecture: {doc.metadata.get('lectureId', 'unknown')}]\n{doc.page_content}"
        for i, doc in enumerate(docs)
    )


async def run_rag_chain(
    question: str,
    course_id: str,
    lecture_id: Optional[str] = None,
) -> dict:
    """
    Execute the full RAG pipeline for a student's question.

    Args:
        question: The student's question
        course_id: Restrict retrieval to this course
        lecture_id: Optional — restrict to a specific lecture

    Returns:
        dict with 'answer' (str) and 'sources' (list of chunk source IDs)
    """
    retriever = get_retriever(course_id=course_id, lecture_id=lecture_id)
    llm = get_llm()

    # Retrieve relevant documents first (for both context and sources)
    docs = await retriever.ainvoke(question)

    if not docs:
        logger.warning(
            f"[RAG] No relevant chunks found for course={course_id}, lecture={lecture_id}"
        )
        return {
            "answer": "I couldn't find relevant lecture material to answer this question.",
            "sources": [],
        }

    context = _format_docs(docs)
    sources = [doc.metadata.get("source", "") for doc in docs]

    # Build and run the chain
    chain = RAG_PROMPT | llm | StrOutputParser()
    answer = await chain.ainvoke({"context": context, "question": question})

    logger.info(
        f"[RAG] Generated answer for course={course_id} "
        f"using {len(docs)} chunks | provider={settings.LLM_PROVIDER}"
    )

    return {"answer": answer, "sources": sources}
