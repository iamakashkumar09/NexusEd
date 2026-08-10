# NexusEd

### An AI-Powered, Event-Driven E-Learning Platform

NexusEd is a scalable e-learning platform designed around **microservices, gRPC communication, event-driven processing, and Generative AI**.

The platform combines traditional e-learning capabilities such as users, courses, payments, media, and real-time communication with an AI-powered learning layer for transcript processing, semantic retrieval, and RAG-based question answering.

---

## 🚀 Highlights

- **Microservices architecture** using NestJS and FastAPI
- **API Gateway** exposing REST/JSON APIs to web and mobile clients
- **gRPC** for synchronous communication between the API Gateway and backend services
- **RabbitMQ/Kafka** for asynchronous event-driven communication
- **PostgreSQL** for relational business data, including the Course Service
- **AWS S3** for video/media storage
- **GenAI service** built with Python and FastAPI
- **LangChain-based RAG pipeline**
- **SentenceTransformers** for text embeddings
- **ChromaDB** for vector storage and semantic retrieval
- **Ollama / Llama / Qwen** for local LLM inference
- Shared contracts, protobuf definitions, authentication utilities, and events

---

# 🏗️ Architecture Overview

```text
                         ┌─────────────────────────┐
                         │     Web / Mobile        │
                         │        Clients          │
                         └────────────┬────────────┘
                                      │
                              REST / JSON
                                      │
                                      ▼
                         ┌─────────────────────────┐
                         │      API Gateway        │
                         │         NestJS           │
                         └────────────┬────────────┘
                                      │
                              gRPC / Protobuf
                                      │
             ┌────────────────────────┼────────────────────────┐
             │                        │                        │
             ▼                        ▼                        ▼
    ┌────────────────┐      ┌────────────────┐      ┌────────────────┐
    │ User Service   │      │ Course Service │      │Payment Service │
    │    NestJS      │      │    NestJS      │      │    NestJS      │
    │   gRPC Server  │      │   gRPC Server  │      │   gRPC Server  │
    └───────┬────────┘      └───────┬────────┘      └───────┬────────┘
            │                       │                       │
            ▼                       ▼                       ▼
       PostgreSQL             PostgreSQL              PostgreSQL


                         ┌─────────────────────────┐
                         │      Media Service      │
                         │         NestJS           │
                         │       gRPC Server        │
                         └────────────┬────────────┘
                                      │
                           Video / Media Upload
                                      │
                                      ▼
                                  AWS S3
                                      │
                                      │ VideoUploaded
                                      ▼
                         ┌─────────────────────────┐
                         │    RabbitMQ / Kafka     │
                         │      Message Broker     │
                         └────────────┬────────────┘
                                      │
                                      ▼
                         ┌─────────────────────────┐
                         │      GenAI Service      │
                         │      Python / FastAPI   │
                         └────────────┬────────────┘
                                      │
                           ┌──────────┴──────────┐
                           │                     │
                           ▼                     ▼
                    Ingestion Pipeline      Query Pipeline
                           │                     │
                           ▼                     ▼
                    Transcription          LangChain
                           │                     │
                           ▼                     ▼
                       Chunking             Retriever
                           │                     │
                           ▼                     ▼
                 SentenceTransformers       ChromaDB
                           │                     │
                           ▼                     ▼
                       ChromaDB                 LLM
                                                 │
                                                 ▼
                                         Ollama / Llama / Qwen


```

---

# 🔌 Communication Architecture

NexusEd intentionally uses different communication mechanisms for different workloads.

## 1. REST/JSON — Client → API Gateway

The frontend communicates with the API Gateway using standard HTTP REST APIs.

```text
Web / Mobile Client
        │
        │ HTTPS / REST / JSON
        ▼
   API Gateway
```

The gateway handles concerns such as:

- Request routing
- Authentication
- Authorization
- Validation
- Rate limiting
- API composition

---

## 2. gRPC — API Gateway → Backend Services

The API Gateway communicates with internal NestJS services using **gRPC and Protocol Buffers**.

```text
API Gateway
     │
     │ gRPC
     ▼
┌───────────────┐
│ User Service  │
├───────────────┤
│ Course Service│
├───────────────┤
│Payment Service│
├───────────────┤
│ Media Service │
└───────────────┘
```

The protobuf definitions are centralized inside:

```text
libs/shared/proto/
```

Example:

```text
course.proto
user.proto
payment.proto
media.proto
ai.proto
```

### Why gRPC?

- Strongly typed contracts
- Efficient binary serialization
- Low-latency internal communication
- Code generation from `.proto` files
- Clear service interfaces

---

# ⚡ Event-Driven Architecture

NexusEd uses RabbitMQ or Kafka for operations that should not block an HTTP/gRPC request.

For example, uploading a video should not make the user wait while the entire AI pipeline runs.

```text
Media Service
      │
      │ VideoUploaded
      ▼
RabbitMQ / Kafka
      │
      ▼
GenAI Service
      │
      ├── Transcription
      ├── Chunking
      ├── Embedding
      └── Vector Storage
```

After processing:

```text
GenAI Service
      │
      │ AIProcessingComplete
      ▼
RabbitMQ / Kafka
      │
      ▼
Course Service
```

This gives the system:

- Loose coupling
- Asynchronous processing
- Independent scaling
- Retry capability
- Fault isolation
- Better handling of long-running AI jobs

---

# 🧠 GenAI Service

The GenAI service is implemented using **Python + FastAPI**.

It contains two primary workflows:

```text
                 GenAI Service
                      │
            ┌─────────┴─────────┐
            │                   │
            ▼                   ▼
      Ingestion Pipeline    Query Pipeline
       Asynchronous          Synchronous
```

---

## 📥 1. Ingestion Pipeline

The ingestion pipeline processes uploaded course videos.

```text
Video Uploaded
      │
      ▼
    AWS S3
      │
      ▼
VideoUploaded Event
      │
      ▼
RabbitMQ / Kafka
      │
      ▼
GenAI Worker
      │
      ▼
Transcription
      │
      ▼
Text Chunking
      │
      ▼
SentenceTransformers
      │
      ▼
Embedding Vectors
      │
      ▼
ChromaDB
```

### Step-by-step

1. Instructor uploads a lecture.
2. Media Service stores the video in AWS S3.
3. Media Service publishes `VideoUploaded`.
4. GenAI Service consumes the event.
5. The video is transcribed.
6. Transcript text is divided into meaningful chunks.
7. SentenceTransformers converts chunks into vectors.
8. Vectors and metadata are stored in ChromaDB.

This process is asynchronous.

---

# 🔎 2. RAG Query Pipeline

When a student asks a question about a course:

```text
Student
   │
   ▼
API Gateway
   │
   ▼
GenAI API
   │
   ▼
LangChain
   │
   ▼
Retriever
   │
   ▼
ChromaDB
   │
   ▼
Relevant Course Chunks
   │
   ▼
RAG Prompt
   │
   ▼
Ollama
   │
   ▼
Llama / Qwen
   │
   ▼
Answer
```

### Example

Student asks:

> "Explain the producer-consumer problem from this lecture."

The system:

1. Converts the question into an embedding.
2. Searches ChromaDB for semantically similar lecture chunks.
3. Retrieves relevant course context.
4. LangChain builds the RAG prompt.
5. The prompt is sent to the configured LLM.
6. The LLM generates an answer grounded in the retrieved lecture material.

---

# 🧩 GenAI Technology Responsibilities

| Technology | Responsibility |
|---|---|
| **FastAPI** | GenAI service API and service layer |
| **LangChain** | RAG orchestration |
| **SentenceTransformers** | Text embeddings |
| **ChromaDB** | Vector storage and similarity search |
| **Ollama** | Local LLM runtime |
| **Llama / Qwen** | Text generation |
| **Pandas** | Data preprocessing where required |
| **Python ML Core** | Reusable preprocessing/ML utilities |

The architecture deliberately separates these responsibilities.

```text
LangChain
   ↓
Orchestration

SentenceTransformers
   ↓
Text → Vector

ChromaDB
   ↓
Vector Storage + Retrieval

Ollama
   ↓
LLM Runtime

Llama / Qwen
   ↓
Generation
```

---

# 🗄️ Data Architecture

NexusEd uses **PostgreSQL as the primary relational database** for the backend services.

| Service | Database | Example Data |
|---|---|---|
| User Service | PostgreSQL | Users, roles, profiles |
| Course Service | PostgreSQL | Courses, modules, lectures, enrollments |
| Payment Service | PostgreSQL | Transactions, payments, payouts |
| Media Service | PostgreSQL / metadata store | Media metadata, upload state |
| GenAI Service | ChromaDB + object storage references | Embeddings, chunks, metadata |

---

# ✅ Is PostgreSQL Good for the Course Service?

**Yes — PostgreSQL is an excellent choice for the Course Service**, especially for the structure you are building.

A typical course domain is highly relational:

```text
Course
  │
  ├── Modules
  │     │
  │     ├── Lectures
  │     │     ├── Video
  │     │     ├── Transcript
  │     │     └── Resources
  │     │
  │     └── Quizzes
  │
  ├── Instructor
  ├── Categories
  └── Enrollments
```

PostgreSQL gives you:

- Foreign keys
- Transactions
- Referential integrity
- Joins
- Indexes
- Constraints
- Reliable updates
- Strong consistency

For an e-learning platform, these properties are valuable.

### Course search

You can also start with PostgreSQL full-text search for traditional keyword search.

If you later want vector search inside PostgreSQL, **pgvector** is another option.

That means you could eventually have:

```text
PostgreSQL
   │
   ├── Relational Course Data
   │
   ├── Full-Text Search
   │
   └── pgvector (optional)
```

You do **not** need MongoDB just because course data can contain nested structures. PostgreSQL with JSONB can also handle flexible fields when needed.

---

# 🗃️ Why PostgreSQL Instead of MongoDB?

For NexusEd, PostgreSQL is a strong default because the core domain has relationships such as:

```text
User ───────< Enrollment >────── Course
                                │
                                ├── Module
                                │
                                ├── Lecture
                                │
                                └── Quiz
```

This makes relational modeling natural.

MongoDB can absolutely work, but PostgreSQL provides a strong foundation for:

- Enrollment relationships
- Instructor ownership
- Course/module/lecture relationships
- Payments
- Transactions
- Constraints
- Reporting

You can still use specialized stores where they provide a clear benefit, such as:

```text
AWS S3    → Videos
ChromaDB  → Embeddings
PostgreSQL → Business data
```

---

# 📁 Project Structure

The current NexusEd workspace is organized as follows:

```text
NexusEd/
├── apps/
│   ├── api-gateway/            # NestJS: REST/JSON API + gRPC client
│   ├── user-service/           # NestJS: Authentication, profiles, roles
│   ├── course-service/         # NestJS: Courses, modules, catalog, search
│   ├── payment-service/        # NestJS: Transactions and payouts
│   ├── media-service/          # NestJS: Video uploads + event publisher
│   ├── genai-service/          # Python/FastAPI: RAG + AI/ML processing
│
├── libs/
│   ├── shared/
│   │   ├── proto/              # Centralized gRPC .proto definitions
│   │   ├── contracts/          # Shared TypeScript interfaces, enums, DTOs
│   │   ├── events/             # Standardized broker event payloads
│   │   └── auth/               # Shared JWT guards and decorators
│   │
│   └── python-ml-core/         # Shared Python AI/ML preprocessing
│
├── tools/                      # Nx generators and workspace scripts
├── nx.json                     # Nx workspace configuration and caching
├── package.json                # Global Node.js dependencies
├── requirements.txt            # Global Python dependencies
├── tsconfig.base.json          # Root TypeScript configuration
└── .prettierrc                 # Global formatting rules
```

---

# 📦 Shared Libraries

## `libs/shared/proto`

Central location for gRPC service contracts.

```text
libs/shared/proto/
├── user.proto
├── course.proto
├── payment.proto
├── media.proto
└── ai.proto
```

This prevents different services from maintaining incompatible contracts.

---

## `libs/shared/contracts`

Contains shared TypeScript definitions:

```text
UserRole
CourseStatus
PaymentStatus
MediaStatus
...
```

and DTOs/interfaces used across NestJS applications.

---

## `libs/shared/events`

Contains standardized event definitions.

Example:

```text
VideoUploadedEvent
AIProcessingStartedEvent
AIProcessingCompleteEvent
PaymentCompletedEvent
...
```

A standardized event can look conceptually like:

```json
{
  "eventType": "VideoUploaded",
  "eventId": "uuid",
  "timestamp": "2026-08-10T10:00:00Z",
  "courseId": "course-id",
  "lectureId": "lecture-id",
  "videoUrl": "s3://..."
}
```

---

## `libs/shared/auth`

Shared authentication utilities for NestJS services.

Potential responsibilities:

- JWT guards
- Role guards
- Authentication decorators
- User context extraction
- Authorization helpers

---

## `libs/python-ml-core`

Reusable Python logic shared by the GenAI and ML components.

Potential responsibilities:

- Text preprocessing
- Cleaning
- Chunking utilities
- Feature preprocessing
- Embedding helpers
- Evaluation utilities

ML algorithms such as PCA or SVM should only be introduced where they solve a real classification, preprocessing, or dimensionality-reduction requirement; they are not necessary components of the core RAG pipeline.

---

# 🔄 End-to-End Video Processing

```text
Instructor
    │
    ▼
API Gateway
    │
    │ gRPC
    ▼
Media Service
    │
    ├──────────────► PostgreSQL
    │                  │
    │                  └── Media Metadata
    │
    ▼
AWS S3
    │
    │ VideoUploaded
    ▼
RabbitMQ / Kafka
    │
    ▼
GenAI Service
    │
    ├── Transcription
    ├── Chunking
    ├── Embeddings
    └── ChromaDB
    │
    │ AIProcessingComplete
    ▼
RabbitMQ / Kafka
    │
    ▼
Course Service
    │
    ▼
Course Updated
```

---

# 🔄 End-to-End AI Question Answering

```text
Student
   │
   ▼
API Gateway
   │
   │ gRPC
   ▼
GenAI Service
   │
   ▼
LangChain
   │
   ▼
Embedding Model
   │
   ▼
ChromaDB
   │
   ▼
Relevant Course Context
   │
   ▼
RAG Prompt
   │
   ▼
Ollama
   │
   ▼
Llama / Qwen
   │
   ▼
Answer
   │
   ▼
Student
```

---

# 📈 Scalability

Each service can be scaled independently.

For example:

```text
                    Message Broker
                         │
              ┌──────────┼──────────┐
              ▼          ▼          ▼
          GenAI-1    GenAI-2    GenAI-3
```

This allows multiple AI workers to process video jobs concurrently.

Similarly:

```text
                   Load Balancer
                        │
              ┌─────────┼─────────┐
              ▼         ▼         ▼
           Gateway-1 Gateway-2 Gateway-3
```

The architecture also allows independent scaling of:

- API Gateway
- Course Service
- Media Service
- GenAI workers
- Chat servers

---

# 🛡️ Security

Important security considerations include:

- JWT-based authentication
- Role-based authorization
- API input validation
- Rate limiting
- Secure gRPC communication
- Private internal service networking
- AWS S3 signed URLs
- Secrets through environment variables/secrets managers
- Course-level authorization for RAG retrieval
- Validation of uploaded media
- Protection against unauthorized AI context retrieval

### RAG Authorization

A critical rule is:

> A student should only retrieve embeddings and course content belonging to courses they are authorized to access.

This should be enforced through metadata filtering and authorization checks rather than relying only on the LLM.

---

# 🛠️ Technology Stack

## Backend

- **NestJS**
- **TypeScript**
- **FastAPI**
- **Python**

## Communication

- **REST / JSON**
- **gRPC**
- **Protocol Buffers**
- **RabbitMQ / Apache Kafka**

## AI / GenAI

- **LangChain**
- **SentenceTransformers**
- **ChromaDB**
- **Ollama**
- **Llama / Qwen**
- **Pandas**
- **Python ML utilities**

## Databases / Storage

- **PostgreSQL**
- **ChromaDB**
- **AWS S3**

## Infrastructure / Tooling

- **Nx**
- **Docker**
- **GitHub**
- **AWS**

---

# 🧪 Development Roadmap

### Core Platform

- [ ] Nx workspace setup
- [ ] API Gateway
- [ ] User Service
- [ ] Course Service
- [ ] Payment Service
- [ ] Media Service
- [ ] PostgreSQL schemas
- [ ] Authentication and authorization

### Communication

- [ ] gRPC contracts
- [ ] Shared protobuf definitions
- [ ] RabbitMQ/Kafka integration
- [ ] Standard event contracts

### Media

- [ ] AWS S3 integration
- [ ] Video upload
- [ ] Media metadata
- [ ] Upload events

### GenAI

- [ ] FastAPI GenAI service
- [ ] Video transcription
- [ ] Transcript chunking
- [ ] SentenceTransformers
- [ ] ChromaDB
- [ ] LangChain RAG
- [ ] Ollama integration
- [ ] AI-powered course Q&A
- [ ] AI-generated chapters
- [ ] AI-generated quizzes

### Production

- [ ] Dockerization
- [ ] CI/CD
- [ ] Monitoring
- [ ] Centralized logging
- [ ] Metrics
- [ ] Production deployment
- [ ] Load testing

---

# 🎯 Design Principles

### Separation of Concerns

Each microservice owns a focused business capability.

### Strong Contracts

gRPC and protobuf provide explicit contracts between services.

### Asynchronous Processing

Long-running workloads such as video AI processing use events rather than blocking requests.

### Data Ownership

Each service should own its data and expose access through its API/contracts rather than directly modifying another service's database.

### AI Grounding

RAG retrieves course-specific context before generation.

### Independent Scaling

Services and workers can scale according to their individual workloads.

### Extensibility

The RAG layer can support different LLM providers without redesigning the complete platform.

```text
                    LangChain
                       │
          ┌────────────┼────────────┐
          ▼            ▼            ▼
       Ollama       Cloud LLM    Other LLM
          │
     ┌────┴────┐
     ▼         ▼
   Llama      Qwen
```

---

# 📚 Documentation

Recommended documentation structure:

```text
docs/
├── architecture.md
├── api.md
├── grpc.md
├── events.md
├── genai.md
├── database.md
└── deployment.md
```

The most important technical documentation is the GenAI architecture:

```text
Media Service
     ↓
Event Broker
     ↓
GenAI Worker
     ↓
Transcription
     ↓
Chunking
     ↓
Embeddings
     ↓
ChromaDB
     ↓
LangChain Retriever
     ↓
RAG
     ↓
LLM
```

---

# 👨‍💻 NexusEd

> **An AI-Powered, Event-Driven E-Learning Platform**

NexusEd is built to explore and demonstrate:

- Distributed systems
- Microservices architecture
- gRPC
- Event-driven architecture
- Message brokers
- Cloud storage
- Generative AI
- RAG
- Vector search
- Scalable backend engineering
