# 🧠 NexusEd — GenAI Service

> **Python + FastAPI + gRPC + LangChain** microservice powering RAG-grounded course Q&A, automated lecture transcript ingestion, and semantic search.

---

## 🏗️ Architecture Overview

The **NexusEd GenAI Service** acts as the intelligent cognitive layer for the NexusEd platform. It operates synchronously via **gRPC/REST** for real-time student queries and asynchronously via **RabbitMQ** for event-driven lecture transcript ingestion and vector embedding.

```
                                 ┌────────────────────────┐
                                 │    Next.js Web App     │
                                 │   (Course Player UI)   │
                                 └───────────┬────────────┘
                                             │
                                   HTTP / REST (JWT Auth)
                                             │
                                             ▼
                                 ┌────────────────────────┐
                                 │   NestJS API Gateway   │
                                 │     (Port: 3333)       │
                                 └─────┬────────────┬─────┘
                                       │            │
                 gRPC (AIService / Port: 50054)     │ RabbitMQ Events
                                       │            │ (CloudAMQP / Local)
                                       ▼            ▼
 ┌──────────────────────────────────────────────────────────────────────────────────┐
 │                            NexusEd GenAI Service                                 │
 │                                                                                  │
 │   ┌───────────────────────┐                    ┌─────────────────────────────┐   │
 │   │  FastAPI REST Server  │                    │      Async Event Worker     │   │
 │   │     (Port: 8001)      │                    │     (aio-pika Consumer)     │   │
 │   └───────────┬───────────┘                    └──────────────┬──────────────┘   │
 │               │                                               │                  │
 │               ▼                                               ▼                  │
 │   ┌───────────────────────┐                    ┌─────────────────────────────┐   │
 │   │   LangChain RAG Chain │                    │    Ingestion & Chunker      │   │
 │   │  • Dynamic Prompts    │                    │  • YouTube Captions API     │   │
 │   │  • Course Filtered    │                    │  • Groq Whisper Fallback    │   │
 │   │  • Multi-LLM Factory  │                    │  • Recursive Character      │   │
 │   └───────────┬───────────┘                    └──────────────┬──────────────┘   │
 └───────────────┼───────────────────────────────────────────────┼──────────────────┘
                 │                                               │
                 │ Embeddings & Similarity Search                │ Vector Upsert
                 ▼                                               ▼
   ┌───────────────────────────┐                   ┌───────────────────────────┐
   │       Qdrant Cloud        │                   │    HuggingFace API        │
   │ (Collection: nexused_lectures) │              │ (all-MiniLM-L6-v2)        │
   └─────────────┬─────────────┘                   └───────────────────────────┘
                 │
                 ▼
   ┌───────────────────────────┐
   │    Groq / LLM Provider    │
   │ (Qwen 2.5 / LLaMA 3.3 /   │
   │  Gemini / OpenAI / Ollama)│
   └───────────────────────────┘
```

---

## 🔄 Core Workflows

### 1. 📥 Asynchronous Lecture Ingestion Pipeline
Triggered automatically when an instructor uploads or links a lecture video (`video.uploaded` event):

```
RabbitMQ: video.uploaded
       │
       ▼
 [consumer.py] ── Receives payload (courseId, lectureId, videoUrl)
       │
       ▼
 [transcriber.py] ── 1. YouTube Transcript API (Zero-cost subtitle extraction)
       │              2. Fallback: yt-dlp audio download + Groq Whisper API
       ▼
 [chunker.py] ──── Splits transcript into 500-token chunks with 50-token overlap
       │              (LangChain RecursiveCharacterTextSplitter)
       ▼
 [embedder.py] ─── Computes 384-dimensional dense vector embeddings via 
       │              HuggingFace Inference API (sentence-transformers/all-MiniLM-L6-v2)
       ▼
 [Qdrant Cloud] ── Upserts vectors with courseId, lectureId, and chunkIndex metadata
       │
       ▼
RabbitMQ: ai.processing.complete ── Notifies Course Service of completion
```

---

### 2. ⚡ Real-Time RAG Query Pipeline
Triggered when a student asks a question in the AI Tutor drawer:

```
Student Question: "What is DBMS and what are its key responsibilities?"
       │
       ▼
[API Gateway] ── Authenticates student & routes to GenAI Service via gRPC
       │
       ▼
[retriever.py] ─ 1. Embeds question using all-MiniLM-L6-v2
                 2. Queries Qdrant with metadata authorization filter:
                    Filter: metadata.courseId == course_id
                 3. Fetches Top-K (default: 5) semantically relevant chunks
       │
       ▼
[prompt.py] ──── Injects lecture chunks + question into strict grounding prompt
       │
       ▼
[chain.py] ───── Groq Cloud LLM (or Gemini/OpenAI/Ollama) synthesizes answer
       │
       ▼
[Course Player] ─ Frontend renders answer with MarkdownRenderer:
                 • High-contrast bold terminology
                 • Formatted bullet & numbered lists
                 • Syntax-highlighted code blocks with copy button
```

---

## 📁 Project Structure

```
apps/genai-service/
├── main.py                          # Dual server bootstrap: FastAPI + gRPC + RabbitMQ
├── requirements.txt                 # Python dependencies
├── .env.example                     # Environment template
│
├── scripts/
│   └── generate_protos.py           # Compiles ai.proto → Python gRPC stubs
│
├── generated/                       # Auto-generated gRPC stubs
│   ├── __init__.py
│   ├── ai_pb2.py
│   └── ai_pb2_grpc.py
│
└── app/
    ├── __init__.py
    ├── config.py                    # Pydantic v2 settings & environment manager
    │
    ├── api/                         # FastAPI REST Layer
    │   ├── __init__.py
    │   └── routes/
    │       ├── __init__.py
    │       └── query.py             # POST /api/v1/query endpoint
    │
    ├── ingestion/                   # Asynchronous Ingestion Engine
    │   ├── __init__.py
    │   ├── consumer.py              # RabbitMQ consumer & publisher (aio-pika)
    │   ├── transcriber.py           # YouTube Captions + Groq Whisper fallback
    │   ├── chunker.py               # LangChain text splitter
    │   └── embedder.py              # HF Inference API embeddings + Qdrant upsert
    │
    ├── rag/                         # Retrieval-Augmented Generation Engine
    │   ├── __init__.py
    │   ├── prompt.py                # System & student prompt templates
    │   ├── retriever.py             # Qdrant vector search with courseId filtering
    │   └── chain.py                 # Multi-provider LLM chain factory
    │
    ├── db/                          # Vector DB Client
    │   ├── __init__.py
    │   └── qdrant.py                # Qdrant client singleton & collection initialization
    │
    └── grpc/                        # gRPC Microservice Layer
        ├── __init__.py
        └── ai_servicer.py           # Implements AIService (QueryCourse & IngestionStatus)
```

---

## 🛠️ Technology Stack

| Domain | Technology | Purpose |
|---|---|---|
| **Framework** | [FastAPI](https://fastapi.tiangolo.com/) | High-performance async REST API & Swagger UI |
| **RPC** | [gRPC](https://grpc.io/) / [Protobuf](https://protobuf.dev/) | Sub-millisecond internal microservice communication |
| **Orchestration** | [LangChain](https://www.langchain.com/) | RAG chains, prompt management, and retrievers |
| **Vector Store** | [Qdrant Cloud](https://qdrant.tech/) | Managed vector database with payload filtering |
| **Embeddings** | [Hugging Face](https://huggingface.co/) | `sentence-transformers/all-MiniLM-L6-v2` via Serverless Inference API |
| **LLM Inference** | [Groq Cloud](https://groq.com/) | Ultra-low latency inference (`llama-3.3-70b-versatile`, `qwen/qwen3.8-27b`) |
| **Audio ASR** | [Groq Whisper](https://groq.com/) | `whisper-large-v3` fallback for videos without native subtitles |
| **Messaging** | [RabbitMQ](https://www.rabbitmq.com/) + [aio-pika](https://aio-pika.readthedocs.io/) | Asynchronous, decoupled ingestion events |
| **Video Extraction**| [yt-dlp](https://github.com/yt-dlp/yt-dlp) + [youtube-transcript-api](https://github.com/jdepoix/youtube-transcript-api) | Resilient subtitle fetching and audio extraction |

---

## 🚀 Getting Started

### 1. Prerequisites
- **Python 3.11+** installed
- **Qdrant Cloud** cluster URL & API key (or local Docker Qdrant on port 6333)
- **RabbitMQ** instance (CloudAMQP or local Docker on port 5672)
- **Groq API Key** (Free tier available at [console.groq.com](https://console.groq.com))
- **Hugging Face Token** (from [huggingface.co/settings/tokens](https://huggingface.co/settings/tokens))

---

### 2. Setup Virtual Environment & Install Dependencies

#### On Windows (PowerShell):
```powershell
cd apps\genai-service

# Create virtual environment
python -m venv .venv

# Activate virtual environment
.\.venv\Scripts\Activate.ps1

# Install requirements
pip install -r requirements.txt
```

#### On Linux / macOS (Bash):
```bash
cd apps/genai-service

# Create virtual environment
python3 -m venv .venv

# Activate virtual environment
source .venv/bin/activate

# Install requirements
pip install -r requirements.txt
```

---

### 3. Configure Environment Variables

Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

Configure the following required keys in your `.env`:
```env
APP_NAME=nexused-genai-service
APP_ENV=development
APP_PORT=8001
GRPC_PORT=50054

# LLM Provider (groq | gemini | openai | ollama)
LLM_PROVIDER=groq
LLM_MODEL=llama-3.3-70b-versatile
GROQ_API_KEY=gsk_your_groq_api_key

# Hugging Face Embeddings
EMBEDDING_MODEL=sentence-transformers/all-MiniLM-L6-v2
HUGGING_FACE_API=hf_your_huggingface_token

# Qdrant Cloud Vector Database
QDRANT_URL=https://your-cluster-id.us-east4-0.gcp.cloud.qdrant.io:6333
QDRANT_API_KEY=your_qdrant_api_key
QDRANT_COLLECTION_NAME=nexused_lectures

# RabbitMQ
RABBITMQ_URL=amqps://user:password@hostname/vhost
VIDEO_UPLOADED_QUEUE=video.uploaded
AI_PROCESSING_COMPLETE_QUEUE=ai.processing.complete
```

---

### 4. Compile Protobuf Definitions

Generate the Python gRPC client and server stubs:
```bash
python scripts/generate_protos.py
```

This compiles `libs/shared/proto/ai.proto` into `generated/ai_pb2.py` and `generated/ai_pb2_grpc.py`.

---

### 5. Run the Service

```bash
python main.py
```

This concurrently boots:
- 🚀 **FastAPI HTTP Server** on `http://localhost:8001` (Interactive Swagger docs: `http://localhost:8001/docs`)
- ⚡ **gRPC Server** on `0.0.0.0:50054`
- 🐰 **RabbitMQ Event Consumer** listening for `video.uploaded` messages

---

## 📡 API Reference

### REST Endpoints

#### `POST /api/v1/query`
Answers questions grounded strictly in the course's lecture context.

**Request Body:**
```json
{
  "courseId": "44503bc4-ddd3-456d-8260-559121b1afe8",
  "question": "What is DBMS and what are its key responsibilities?",
  "lectureId": "0b740a4f-94e0-4794-8af0-b65ca7100a17"
}
```

**Response:**
```json
{
  "answer": "Based on the lecture context, DBMS (Database Management System) is defined as...",
  "sources": [
    "lecture:0b740a4f:chunk:0",
    "lecture:0b740a4f:chunk:1"
  ],
  "courseId": "44503bc4-ddd3-456d-8260-559121b1afe8",
  "lectureId": "0b740a4f-94e0-4794-8af0-b65ca7100a17"
}
```

#### `GET /health`
Returns service health and active configuration status.

---

### gRPC Contract (`ai.proto`)

```protobuf
syntax = "proto3";

package ai;

service AIService {
  rpc QueryCourse (QueryRequest) returns (QueryResponse);
  rpc GetIngestionStatus (IngestionStatusRequest) returns (IngestionStatusResponse);
}

message QueryRequest {
  string course_id = 1;
  string question = 2;
  optional string lecture_id = 3;
}

message QueryResponse {
  string answer = 1;
  repeated string sources = 2;
  string course_id = 3;
  optional string lecture_id = 4;
}
```

---

## 🔒 Security & Authorization

1. **Course-Level Isolation**: Every retrieval query in Qdrant executes with a mandatory payload filter:
   ```python
   rest.FieldCondition(
       key="metadata.courseId",
       match=rest.MatchValue(value=course_id)
   )
   ```
   This prevents data leakage across different courses and ensures students can only retrieve information from courses they are enrolled in.
2. **Hallucination Prevention**: The system prompt enforces that the model must strictly answer using the provided lecture context. If the concept is not present, it gracefully states that information is not available in the lecture.

---

## 🔄 Multi-Provider LLM Switching

Switch between different LLM providers seamlessly by editing `.env`:

```env
# Groq Cloud (Recommended for speed & cost)
LLM_PROVIDER=groq
LLM_MODEL=llama-3.3-70b-versatile
GROQ_API_KEY=gsk_...

# Google Gemini
LLM_PROVIDER=gemini
LLM_MODEL=gemini-1.5-flash
GOOGLE_API_KEY=AIza...

# OpenAI
LLM_PROVIDER=openai
LLM_MODEL=gpt-4o-mini
OPENAI_API_KEY=sk-...

# Local Ollama
LLM_PROVIDER=ollama
LLM_MODEL=llama3
OLLAMA_URL=http://localhost:11434
```
