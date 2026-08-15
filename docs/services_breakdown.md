# NexusEd — Microservices Breakdown & Responsibilities

This document provides a comprehensive overview of each microservice in the **NexusEd** platform, including technology stack, storage/database layers, communication protocols, and specific functional responsibilities.

---

## 1. 🛡️ API Gateway (`apps/api-gateway`)

- **Tech Stack**: NestJS (TypeScript)
- **Communication Protocol**:
  - **Client-facing**: REST / JSON (HTTP/HTTPS)
  - **Internal Services**: gRPC Client (via `.proto` files in `libs/shared/proto`)
- **Primary Responsibilities**:
  - Serves as the single entry point for Web and Mobile client requests.
  - Translates external HTTP/REST requests into internal gRPC microservice invocations.
  - Enforces API security: JWT verification, role-based authorization, rate limiting, and CORS.
  - Handles request validation, body transformation, and error formatting.
  - Aggregates data from multiple backend microservices when necessary.

---

## 2. 🔐 Auth & User Services

### 2.1 Auth Service (`apps/auth-service`)
- **Tech Stack**: NestJS (TypeScript), gRPC Server
- **Database**: PostgreSQL (via Prisma ORM)
- **Primary Responsibilities**:
  - Handles user registration, email uniqueness checks, and secure password hashing using `bcrypt`.
  - Manages authentication (login), issuing signed JWT Access Tokens (1-hour expiry) and Refresh Tokens (7-day expiry).
  - Manages token rotation and refresh operations by storing hashed refresh tokens in the database.
  - Triggers profile creation in `user-service` upon user registration.

### 2.2 User Service (`apps/user-service`)
- **Tech Stack**: NestJS (TypeScript), gRPC Server
- **Database**: PostgreSQL (via Prisma ORM)
- **Primary Responsibilities**:
  - Manages user profiles (first name, last name, avatar, bio, user preferences).
  - Handles role management (`student`, `instructor`, `admin`).
  - Tracks and manages student course enrollment records.

---

## 3. 📚 Course Service (`apps/course-service`)

- **Tech Stack**: NestJS (TypeScript), gRPC Server, RabbitMQ/Kafka Consumer
- **Database**: PostgreSQL (Relational schema: `Course` → `Module` → `Lecture` / `Quiz`)
- **Primary Responsibilities**:
  - Manages course content hierarchy (Creating, updating, and deleting Courses, Modules, Lectures, and Quizzes).
  - Manages course publishing states (Draft, Published, Archived) and instructor course assignments.
  - Provides course catalog browsing, filtering, and full-text search capability.
  - **Event Consumer**: Consumes `AIProcessingComplete` events from the message broker to update course lectures with generated transcripts, chapters, and metadata.

---

## 4. 💳 Payment Service (`apps/payment-service`)

- **Tech Stack**: NestJS (TypeScript), gRPC Server, RabbitMQ/Kafka Publisher
- **Database**: PostgreSQL (Transactions, Payments, Payouts)
- **Primary Responsibilities**:
  - Processes course purchases, checkout transactions, and payment gateway webhooks.
  - Calculates and tracks instructor revenue shares and payouts.
  - **Event Publisher**: Emits `PaymentCompletedEvent` upon successful checkout to trigger automatic enrollment workflows across `user-service` and `course-service`.

---

## 5. 🎥 Media Service (`apps/media-service`)

- **Tech Stack**: NestJS (TypeScript), gRPC Server, AWS SDK, RabbitMQ/Kafka Publisher
- **Storage / Database**: AWS S3 (Raw & processed lecture videos) + PostgreSQL / Metadata Store
- **Primary Responsibilities**:
  - Handles lecture media upload workflows (e.g., generating AWS S3 pre-signed URLs for secure direct client uploads).
  - Tracks upload progress, file states, and video metadata.
  - **Event Publisher**: Emits the `VideoUploaded` event to RabbitMQ/Kafka as soon as a video upload completes, triggering the downstream AI pipeline.

---

## 6. 🧠 GenAI Service (`apps/genai-service`)

- **Tech Stack**: Python, FastAPI, LangChain, SentenceTransformers, ChromaDB, Ollama (Llama / Qwen), Pandas
- **Storage / Vector Database**: ChromaDB (Vector Store for embeddings) + AWS S3 references
- **Primary Responsibilities**:

### A. Asynchronous Ingestion Pipeline (Event-Driven)
1. Listens for `VideoUploaded` events published to RabbitMQ/Kafka.
2. Extracts audio and generates video transcripts (using Whisper or Speech-to-Text).
3. Chunks transcript text into semantically coherent segments using text splitters.
4. Computes text embeddings using `SentenceTransformers`.
5. Stores embedding vectors with course & lecture metadata in `ChromaDB`.
6. Emits `AIProcessingComplete` event upon ingestion completion.

### B. Synchronous RAG Query Pipeline (API-Driven)
1. Receives student questions regarding course material through FastAPI / gRPC endpoints.
2. Performs vector similarity search in `ChromaDB` (filtered by user authorization and course ID).
3. Builds context-grounded RAG prompts using `LangChain`.
4. Runs local LLM inference via `Ollama` (Llama / Qwen models).
5. Returns accurate, context-aware answers to the student.

### C. Automated Learning Tools
- Generates automatic video chapter markers, summaries, and quiz questions from lecture transcripts.

---

## 7. 📦 Shared Libraries (`libs/`)

| Library Path | Tech / Type | Key Responsibilities |
|---|---|---|
| `libs/shared/proto` | Protocol Buffers | Centralized `.proto` service interfaces (`auth.proto`, `user.proto`, `course.proto`, `payment.proto`, `media.proto`, `ai.proto`) for gRPC contract enforcement. |
| `libs/shared/contracts` | TypeScript | Shared DTOs, interfaces, and domain enums (`UserRole`, `CourseStatus`, `PaymentStatus`). |
| `libs/shared/events` | TypeScript | Standardized event payload definitions (`VideoUploadedEvent`, `AIProcessingCompleteEvent`, `PaymentCompletedEvent`). |
| `libs/shared/auth` | TypeScript / NestJS | Reusable NestJS authentication guards, JWT strategies, role decorators, and request context extractors. |
| `libs/python-ml-core` | Python | Reusable Python modules for text preprocessing, chunking algorithms, embedding helpers, and ML utilities. |
