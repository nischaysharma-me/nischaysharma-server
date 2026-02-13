# Project Overview & Architecture

## Introduction
The **TaughtCode Server** is a backend application designed to orchestrate AI-driven content generation, user management, and article publishing. It utilizes a "State-Driven" architecture where long-running tasks (like AI generation) are handled asynchronously via a job queue.

## Tech Stack
*   **Runtime:** Node.js
*   **Framework:** Express.js (using ES Modules)
*   **Database:** Firebase (Firestore & Realtime Database)
*   **Queue System:** BullMQ (backed by Redis)
*   **Authentication:** Firebase Auth & Custom API Keys
*   **Validation:** Joi
*   **Documentation:** Swagger UI (JSDoc) & Custom Markdown Renderer
*   **AI Providers:** Google Gemini, OpenAI, Anthropic (via custom abstraction)

## Core Architecture
The application follows a layered architecture with a strong emphasis on modularity through a custom **Provider Pattern**.

1.  **API Layer (Express):** Handles HTTP requests, authentication, and validation. It delegates business logic to the Service Layer.
2.  **Service Layer:** Contains the core business logic (e.g., `articleService`, `userService`). It interacts with the Data Layer and external Providers.
3.  **Data Layer (Custom ORM):** A `FirebaseModel` class wraps Firestore interactions, providing a Mongoose-like schema validation and API.
4.  **Provider Layer:** Abstracts external services (AI, Auth, Storage) behind common interfaces, allowing for vendor switching without changing business logic.
5.  **Worker Layer (BullMQ):** Background workers process heavy tasks like AI article generation to keep the API responsive.

## Key Features
*   **AI Content Generation:** Generates articles and templates using LLMs (Gemini, etc.).
*   **Job Lifecycle Tracking:** Tracks the state of async tasks (`queued`, `processing`, `completed`, `failed`).
*   **User Management:** Onboarding, profiles, and organization management.
*   **Documentation Portal:** specific routes to serve markdown-based documentation with mermaid diagram support.
*   **Role-Based Access Control (RBAC):** Admin, User, and System (API Key) roles.

## Integration Points
*   **Firebase:** Used for Auth, Firestore (NoSQL DB), and Storage.
*   **Redis:** Required for BullMQ job management.
*   **External AI APIs:** Gemini, OpenAI, Anthropic keys required.
*   **Google Custom Search:** Used as a tool for AI grounding.
