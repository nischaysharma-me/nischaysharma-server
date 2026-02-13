# Service Pattern Architecture

This document outlines the **Service Pattern** architecture, which serves as the core business logic layer of the application. The Service layer acts as the bridge between the Transport layer (Controllers) and the Data/Infrastructure layer (Models/Providers).

## Concept

Services encapsulate the application's business rules and logic. They are responsible for processing data, validating inputs against business requirements, coordinating multiple data sources (Providers/Models), and returning formatted results. Crucially, Services are **transport-agnostic**, meaning they do not know about HTTP requests, responses, status codes, or CLI arguments.

### Core Responsibilities

1.  **Business Logic:** Implementation of core algorithms and business rules.
2.  **Orchestration:** Coordinating calls to multiple Providers (e.g., calling AI provider then saving to Database).
3.  **Data Transformation:** Converting raw data from providers/databases into domain objects.
4.  **Error Handling:** Catching technical errors and wrapping them in meaningful business errors.

---

## Architecture Flow

```text
[Controller] -> [Service] -> [Providers / Models]
     ^             |               |
     |             v               v
  (HTTP/CLI)   (Logic)     (External/DB)
```

## Generic Structure

A Service is typically a stateless module or class containing methods for specific business operations.

**Generic Example:**

```javascript
// services/notificationService.js
import * as userModel from "../models/userModel.js";
import { MessagingProviderFactory } from "../providers/messaging/registry.js";

/**
 * Send a welcome notification to a user
 * @param {string} userId - The unique ID of the user
 * @param {string} method - 'email' or 'sms'
 * @returns {Promise<Object>} - Result of the operation
 */
export async function sendWelcomeNotification(userId, method) {
    // 1. Data Retrieval (Model Interaction)
    const user = await userModel.findById(userId);
    if (!user) {
        throw new Error("User not found");
    }

    // 2. Business Logic / Validation
    if (user.status !== 'active') {
        throw new Error("Cannot send notification to inactive user");
    }

    // 3. Provider Instantiation (Infrastructure Interaction)
    const provider = MessagingProviderFactory(method);
    
    // 4. Operation Execution
    const message = `Welcome to our platform, ${user.name}!`;
    const success = await provider.sendMessage(user.contactInfo, message);

    // 5. Result Formatting
    return {
        userId: user.id,
        sent: success,
        timestamp: new Date()
    };
}
```

## Best Practices

1.  **Statelessness:** Services should not hold state between function calls. All necessary context should be passed as arguments.
2.  **Input Validation:** While Controllers validate request formats (e.g., "is this an email?"), Services validate business rules (e.g., "does this email exist?").
3.  **Dependency Injection:** Prefer injecting dependencies (like providers) or using factories rather than hardcoding specific implementations.
4.  **No HTTP Dependencies:** Never import `express`, `req`, or `res` inside a service. This allows services to be reused in CLI scripts, cron jobs, or WebSocket handlers.
5.  **Single Responsibility:** Each service should focus on a specific domain (e.g., `UserService`, `PaymentService`, `AuthService`).

## Benefits

1.  **Reusability:** The same service logic can be triggered by an API call, a scheduled background job, or a test script.
2.  **Testability:** Services can be unit tested in isolation by mocking Models and Providers.
3.  **Maintainability:** Business logic is centralized, not scattered across API endpoints.
4.  **Separation of Concerns:** Keeps Controllers "thin" (focusing only on HTTP) and Models "dumb" (focusing only on data access).

## Directory Structure

```text
src/services/
├── userService.js         # User account logic
├── authService.js         # Authentication logic
├── aiService.js           # AI orchestration logic
├── notificationHandler/   # Complex services can be split into folders
│   ├── index.js
│   └── templates.js
└── index.js               # Optional barrel file
```
