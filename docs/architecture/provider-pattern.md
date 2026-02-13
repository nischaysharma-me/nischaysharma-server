# Provider Pattern Architecture

This document outlines the **Provider Pattern** architecture used to abstract external services and third-party integrations. This pattern ensures modularity, testability, and ease of switching between different vendors (e.g., switching from Firebase Auth to Auth0, or Gemini to OpenAI) without impacting the core business logic.

## Concept

The Provider Pattern isolates the implementation details of external dependencies behind a consistent interface. The core application (Services/Controllers) interacts only with these generic interfaces, never directly with the SDKs of external services.

### Core Components

1.  **Base Provider (Interface/Abstract Class)**
2.  **Concrete Provider (Implementation)**
3.  **Registry (Factory/Resolver)**

---

## 1. Base Provider

The Base Provider defines the contract that all concrete implementations must follow. In languages like JavaScript/Node.js, this is often a class with methods that throw "Not Implemented" errors, effectively acting as an interface.

**Generic Example:**

```javascript
// providers/messaging/base.js
class BaseMessagingProvider {
    constructor() {}

    /**
     * Send a message to a recipient
     * @param {string} to - Recipient identifier
     * @param {string} content - Message content
     * @returns {Promise<boolean>} - Success status
     */
    async sendMessage(to, content) {
        throw new Error("Method 'sendMessage' must be implemented");
    }

    /**
     * Subscribe to a topic
     * @param {string} topic - Topic name
     */
    async subscribe(topic) {
        throw new Error("Method 'subscribe' must be implemented");
    }
}

export default BaseMessagingProvider;
```

## 2. Concrete Provider

A Concrete Provider extends the Base Provider and implements its methods using a specific technology or SDK. It handles all the nitty-gritty details of authentication, configuration, and data transformation required by the specific vendor.

**Generic Example (Email Implementation):**

```javascript
// providers/messaging/email/index.js
import BaseMessagingProvider from "../base.js";
import emailSdk from "some-email-sdk";

class EmailProvider extends BaseMessagingProvider {
    constructor(config) {
        super();
        this.client = emailSdk.initialize(config.apiKey);
    }

    async sendMessage(to, content) {
        try {
            await this.client.send({ to, body: content });
            return true;
        } catch (error) {
            console.error("Email failed", error);
            return false;
        }
    }
    
    // ... implement other methods
}
```

**Generic Example (SMS Implementation):**

```javascript
// providers/messaging/sms/index.js
import BaseMessagingProvider from "../base.js";

class SMSProvider extends BaseMessagingProvider {
    // ... implementation using Twilio/SNS/etc.
}
```

## 3. Registry (Factory)

The Registry acts as a centralized factory to instantiate and retrieve the correct provider based on configuration or runtime arguments. This is the only place where the concrete classes are imported.

**Generic Example:**

```javascript
// providers/messaging/registry.js
import EmailProvider from "./email/index.js";
import SMSProvider from "./sms/index.js";

const providers = {
    email: EmailProvider,
    sms: SMSProvider,
};

/**
 * Factory function to get a provider instance
 * @param {string} type - Provider type ('email' or 'sms')
 * @returns {BaseMessagingProvider}
 */
export function MessagingProviderFactory(type) {
    const ProviderClass = providers[type];

    if (!ProviderClass) {
        throw new Error(`Messaging provider '${type}' not found`);
    }

    return new ProviderClass();
}
```

## Benefits

1.  **Decoupling:** Business logic depends on `BaseProvider` methods, not specific vendor SDKs.
2.  **Interchangeability:** You can swap "Gemini" for "GPT-4" or "Firebase" for "Supabase" just by changing a configuration string and creating a new provider file.
3.  **Testing:** It's trivial to create a `MockProvider` that extends the Base Provider for unit tests, avoiding real API calls.
4.  **Consistency:** Forces all implementations to adhere to the same method signatures (e.g., `generateText` always takes `prompt` and `options`).

## Directory Structure

A typical directory structure for this pattern:

```text
src/providers/
├── <domain>/              # e.g., ai, auth, storage, payment
│   ├── base.js            # Abstract base class
│   ├── registry.js        # Factory/Registry
│   ├── <vendor-a>/        # Concrete implementation A
│   │   └── index.js
│   └── <vendor-b>/        # Concrete implementation B
│       └── index.js
```
