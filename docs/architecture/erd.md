# Entity Relationship Diagram (ERD) & System Architecture

This document outlines the data model and architectural flows for the TaughtCode Server, emphasizing the "State-Driven" architecture required for the backend-only article generator using BullMQ.

## 1. Core Data Model (State-Driven)

In this system, the **Job** entity is central to tracking the asynchronous lifecycle of AI content generation. The `Job` table acts as the source of truth for the process, decoupling the generation logic from the final `Article` schema.

```mermaid
flowchart TD
    %% Entities represented as nodes
    Organization[ORGANIZATION<br/>id: PK<br/>name<br/>ownerId: FK<br/>status]
    User[USER<br/>uid: PK<br/>email: UK<br/>role: Enum<br/>authProvider]
    ApiKey[API_KEY<br/>id: PK<br/>key_hash<br/>scopes<br/>expires_at]
    Template[ARTICLE_TEMPLATE<br/>id: PK<br/>structure: JSON<br/>aiInstructions]
    Article[ARTICLE<br/>id: PK<br/>status: Enum<br/>content: HTML]
    Conversation[CONVERSATION<br/>id: PK<br/>messages: Array<br/>bookId: FK]
    Book[BOOK<br/>id: PK<br/>type: Enum<br/>chapters: Array]
    Page[PAGE<br/>id: PK<br/>bookId: FK<br/>chapterId: FK<br/>content: HTML]
    Job[JOB<br/>id: PK<br/>status: Enum<br/>bullmq_job_id: UK<br/>data: JSONB<br/>result: JSONB]

    %% Relationships
    Organization -->|employs| User
    User -->|authors| Article
    User -->|initiates| Job
    User -->|creates| Template
    User -->|owns| ApiKey
    User -->|initiates| Conversation
    User -->|authors| Book
    
    Conversation -->|drafts_for| Book
    Book -->|contains| Page

    Template -->|structures| Article
    Article -.->|generated_by| Job
    Page -.->|generated_by| Job
```

## 2. Authentication Architecture

The system supports dual authentication strategies: **User Interactive (OAuth/Firebase)** and **Machine-to-Machine (API Keys)**.

```mermaid
flowchart TD
    subgraph Clients
        Web[Web Client]
        CLI[CLI Tool / External Service]
    end

    subgraph AuthLayer [Authentication Layer]
        AuthMiddleware[Auth Middleware]
        FirebaseAuth[Firebase Auth]
        APIKeyAuth[API Key Strategy]
    end

    subgraph UserData
        UserDB[(User Collection)]
        KeyDB[(API Keys Collection)]
    end

    Web -->|Bearer Token JWT| AuthMiddleware
    CLI -->|x-api-key Header| AuthMiddleware

    AuthMiddleware -->|Verify JWT| FirebaseAuth
    AuthMiddleware -->|Hash and Compare| APIKeyAuth

    FirebaseAuth -->|Get User Profile| UserDB
    APIKeyAuth -->|Validate Key and Scopes| KeyDB
    APIKeyAuth -->|Get Linked User| UserDB

    UserDB -->|Attach User Context| RequestContext[Request Context]
```

## 3. Provider System Pattern

We use a **Provider Pattern** to abstract external dependencies (AI, Storage, Auth), allowing for easy switching of vendors without changing business logic.

```mermaid
flowchart TD
    Registry[ProviderRegistry<br/>+register<br/>+get]
    
    Base[BaseProvider<br/>+initialize<br/>+validateConfig]
    
    AI[AIProvider<br/>+generateText<br/>+generateImage]
    Storage[StorageProvider<br/>+uploadFile]
    
    Gemini[GeminiProvider]
    OpenAI[OpenAIProvider]
    Firebase[FirebaseStorageProvider]

    Registry -->|manages| Base
    
    Base -->|implements| AI
    Base -->|implements| Storage
    
    AI -->|extended by| Gemini
    AI -->|extended by| OpenAI
    
    Storage -->|extended by| Firebase
```

## 4. Job Processing & Service Workers

The **BullMQ** architecture ensures reliability for long-running AI tasks. It separates the API (Producer) from the background processing (Consumer).

```mermaid
sequenceDiagram
    participant Client
    participant API as API Server
    participant DB as Database (Firestore)
    participant Queue as Redis Queue (BullMQ)
    participant Worker as Job Worker
    participant AI as AI Provider

    Client->>API: POST /jobs/create (Article Gen)
    API->>DB: Create Job Record (status: queued)
    API->>Queue: Add Job to Queue (jobId, payload)
    API-->>Client: Return Job ID (202 Accepted)

    loop Polling / Webhook
        Client->>API: GET /jobs/:id
        API-->>Client: Job Status
    end

    Queue->>Worker: Process Job (event)
    activate Worker
    Worker->>DB: Update Job (status: processing, started_at)
    
    Worker->>AI: Generate Content (Prompt + Context)
    AI-->>Worker: Content Response
    
    alt Success
        Worker->>DB: Create Article Draft
        Worker->>DB: Update Job (status: completed, result, finished_at)
    else Failure
        Worker->>DB: Update Job (status: failed, error_log)
    end
    deactivate Worker
```

## 5. System Data Flow

A high-level view of how a user request flows through the entire system.

```mermaid
flowchart LR
    subgraph Frontend
        User[User Interaction]
    end

    subgraph "API Layer"
        Router[Express Router]
        Auth[Auth Middleware]
        Controller[Job Controller]
    end

    subgraph "Service Layer"
        JobService[Job Service]
        AIService[AI Service]
    end

    subgraph "Infrastructure"
        Redis[(Redis Queue)]
        Firestore[(Firestore DB)]
        Worker[Background Worker]
    end

    User -->|Request| Router
    Router --> Auth
    Auth -->|Validated| Controller
    Controller -->|Create Job| JobService
    
    JobService -->|Persist State| Firestore
    JobService -->|Enqueue| Redis
    
    Redis -->|Dequeue| Worker
    Worker -->|Execute Logic| AIService
    AIService -->|Call External API| ExternalAI[Gemini/OpenAI]
    
    Worker -->|Update State| Firestore
    Worker -->|Save Result| Firestore
```
