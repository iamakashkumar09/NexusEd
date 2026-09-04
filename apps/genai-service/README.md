# 🧠 NexusEd — GenAI Service

> **Python + FastAPI** microservice providing RAG-based course Q&A and video transcript ingestion.

---

## 📁 File Structure

```
apps/genai-service/
├── main.py                          # Entry point: FastAPI + gRPC servers (asyncio.gather)
├── requirements.txt                 # All Python dependencies
├── .env.example                     # Environment variable template (copy to .env)
│
├── scripts/
│   └── generate_protos.py           # Compiles ai.proto → Python gRPC stubs
│
├── generated/                       # Auto-generated gRPC stubs (run generate_protos.py)
│   ├── __init__.py
│   ├── ai_pb2.py
│   └── ai_pb2_grpc.py
│
└── app/
    ├── __init__.py
    ├── config.py                    # All settings loaded from .env (pydantic-settings)
    │
    ├── api/                         # FastAPI REST layer
    │   ├── __init__.py
    │   └── routes/
    │       ├── __init__.py
    │       └── query.py             # POST /api/v1/query — RAG question answering
    │
    ├── ingestion/                   # Ingestion Pipeline (async, event-driven)
    │   ├── __init__.py
    │   ├── consumer.py              # RabbitMQ event consumer (aio-pika)
    │   ├── transcriber.py           # YouTube Transcript API fetcher
    │   ├── chunker.py               # LangChain RecursiveCharacterTextSplitter
    │   └── embedder.py              # LangChain HuggingFaceEmbeddings → ChromaDB
    │
    ├── rag/                         # RAG Query Pipeline
    │   ├── __init__.py
    │   ├── prompt.py                # LangChain ChatPromptTemplate (system + human)
    │   ├── retriever.py             # LangChain Chroma retriever (courseId filter)
    │   └── chain.py                 # Full RAG chain + LLM factory (Gemini/OpenAI/Ollama)
    │
    ├── db/
    │   ├── __init__.py
    │   └── chroma.py                # ChromaDB HttpClient singleton
    │
    └── grpc/
        ├── __init__.py
        └── ai_servicer.py           # gRPC AIService implementaton (bridges → RAG chain)
```

> **Shared libs** used by this service:
> ```
> libs/shared/proto/ai.proto        ← gRPC contract definition
> libs/python-ml-core/              ← Shared chunking, preprocessing, embedding utils
> ```

---

## 🔄 Step-by-Step: Ingestion Pipeline

Triggered by a `VideoUploaded` event from RabbitMQ:

```
Step 1 — Event Consumer
  RabbitMQ (queue: video.uploaded)
        │
        ▼ consumer.py receives VideoUploaded event

Step 2 — YouTube Transcription
  transcriber.py
        │  extract_video_id(videoUrl)
        │  YouTubeTranscriptApi.list_transcripts(video_id)
        ▼  Returns full transcript text (string)

Step 3 — Text Chunking
  chunker.py
        │  LangChain RecursiveCharacterTextSplitter
        │  chunk_size=500, chunk_overlap=50
        ▼  Returns List[Document] with courseId + lectureId metadata

Step 4 — Embedding + Storage
  embedder.py
        │  LangChain HuggingFaceEmbeddings (all-MiniLM-L6-v2)
        │  Converts each chunk → embedding vector
        ▼  Stored in ChromaDB with courseId/lectureId/chunkIndex metadata

Step 5 — Completion Event
  consumer.py
        │  Publishes AIProcessingComplete event
        ▼  RabbitMQ (queue: ai.processing.complete)
```

---

## 🔎 Step-by-Step: RAG Query Pipeline

Triggered by a student's question (via REST or gRPC):

```
Step 1 — Receive Question
  POST /api/v1/query  { courseId, question, lectureId? }
      OR
  gRPC AIService.QueryCourse(QueryRequest)

Step 2 — Embed the Question
  retriever.py
        │  Same HuggingFaceEmbeddings model (all-MiniLM-L6-v2)
        ▼  Question → embedding vector

Step 3 — Retrieve Relevant Chunks
  retriever.py
        │  LangChain Chroma retriever
        │  Filter: { courseId: <id> } (+ lectureId if specified)
        ▼  Top-K semantically similar lecture chunks from ChromaDB

Step 4 — Build RAG Prompt
  prompt.py
        │  ChatPromptTemplate (system + human messages)
        │  System: "Answer only from the provided lecture context"
        ▼  Prompt = context chunks + student question

Step 5 — LLM Generation
  chain.py (LLM Factory)
        │  LLM_PROVIDER=gemini  → ChatGoogleGenerativeAI
        │  LLM_PROVIDER=openai  → ChatOpenAI
        │  LLM_PROVIDER=ollama  → ChatOllama
        ▼  LLM generates answer grounded in lecture chunks

Step 6 — Return Answer
  { answer: "...", sources: ["lecture:X:chunk:Y", ...] }
```

---

## ⚙️ Setup

### 1. Prerequisites

- Python 3.11+
- Running ChromaDB server (`docker run -p 8000:8000 chromadb/chroma`)
- Running RabbitMQ (`docker run -p 5672:5672 rabbitmq:3-management`)

### 2. Install dependencies

```bash
cd apps/genai-service
pip install -r requirements.txt
```

### 3. Configure environment

```bash
cp .env.example .env
# Edit .env — add your GOOGLE_API_KEY and confirm other settings
```

### 4. Generate gRPC stubs

```bash
python scripts/generate_protos.py
```

This compiles `libs/shared/proto/ai.proto` into `generated/ai_pb2.py` and `generated/ai_pb2_grpc.py`.

### 5. Run the service

```bash
python main.py
```

This starts:
- **FastAPI HTTP** on `http://localhost:8001` (docs at `/docs`)
- **gRPC server** on port `50054`
- **RabbitMQ consumer** (background task)

---

## 🌐 API Reference

### REST

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/v1/query` | RAG question answering |
| `GET` | `/health` | Health check |
| `GET` | `/docs` | Swagger UI |

**POST /api/v1/query**
```json
// Request
{
  "courseId": "course-123",
  "question": "Explain the producer-consumer problem from this lecture.",
  "lectureId": "lecture-456"   // optional
}

// Response
{
  "answer": "The producer-consumer problem is...",
  "sources": ["lecture:456:chunk:3", "lecture:456:chunk:7"],
  "courseId": "course-123",
  "lectureId": "lecture-456"
}
```

### gRPC

Defined in `libs/shared/proto/ai.proto`:

```protobuf
service AIService {
  rpc QueryCourse (QueryRequest) returns (QueryResponse) {}
  rpc GetIngestionStatus (IngestionStatusRequest) returns (IngestionStatusResponse) {}
}
```

---

## 🔧 Technology Stack

| Technology | Role |
|-----------|------|
| **FastAPI** | HTTP API server |
| **gRPC / ai.proto** | API Gateway communication |
| **LangChain** | RAG orchestration (chain, retriever, prompt) |
| **HuggingFaceEmbeddings** | LangChain-wrapped SentenceTransformers (all-MiniLM-L6-v2) |
| **LangChain-Chroma** | Vector store integration |
| **ChromaDB** | Vector storage and similarity search |
| **ChatGroq** | Default cloud LLM (llama-3.3-70b-versatile) — swappable via env |
| **youtube-transcript-api** | YouTube caption fetching (no Whisper needed) |
| **aio-pika** | Async RabbitMQ consumer |
| **pydantic-settings** | Environment variable configuration |

---

## 🔀 Swapping the LLM

Change `LLM_PROVIDER` in `.env` — no code changes needed:

```env
# Use Groq (default — ultra-fast, free tier available)
LLM_PROVIDER=groq
LLM_MODEL=llama-3.3-70b-versatile
GROQ_API_KEY=your-key

# Use Gemini
LLM_PROVIDER=gemini
LLM_MODEL=gemini-1.5-flash
GOOGLE_API_KEY=your-key

# Use OpenAI
LLM_PROVIDER=openai
LLM_MODEL=gpt-4o-mini
OPENAI_API_KEY=your-key

# Use local Ollama
LLM_PROVIDER=ollama
OLLAMA_MODEL=llama3
OLLAMA_URL=http://localhost:11434
```

---

## 🛡️ RAG Authorization

Per the NexusEd security design, every ChromaDB retrieval query is **filtered by `courseId`**.

This means:
- A student can only retrieve lecture chunks from courses they are authorized to access
- Authorization is enforced at the API Gateway level (JWT + enrollment check) before the query reaches this service
- The `courseId` is always passed into the retriever's metadata filter — never retrieved globally

---

## 📦 Related Files

| File | Description |
|------|-------------|
| [`libs/shared/proto/ai.proto`](../../libs/shared/proto/ai.proto) | gRPC service contract |
| [`libs/python-ml-core/`](../../libs/python-ml-core/) | Shared chunking, preprocessing, embedding |
| [`apps/media-service/`](../media-service/) | Publishes `VideoUploaded` events |
