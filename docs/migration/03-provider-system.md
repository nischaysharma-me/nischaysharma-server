# Provider System Documentation

The application uses a **Provider Pattern** to decouple the core business logic from external service implementations. This allows for easy swapping of vendors (e.g., changing from Gemini to OpenAI, or Firebase Storage to AWS S3) without modifying the service layer code.

All providers reside in `src/providers/` and follow a consistent structure:
1.  **Base Class (`base.js`):** An abstract class defining the interface (methods that must be implemented).
2.  **Implementation (`[providerName]/index.js`):** The concrete class implementing the interface.
3.  **Registry (`registry.js`):** A factory function that instantiates the correct provider based on configuration.

## 1. AI Provider (`src/providers/ai/`)

### Base Interface (`BaseAIProvider`)
*   `generateText(prompt, options)`: Generates text completion.
*   `chat(messages, options)`: Handles multi-turn chat conversations.
*   `generateImage(prompt, options)`: Generates images from text.

### Implementations
*   **Gemini (`gemini/index.js`)**:
    *   Uses `@google/genai` SDK.
    *   Supports `flash`, `pro`, and `image` models via `AI_CONFIG`.
    *   Handles tool usage (Google Search grounding) and structured output (JSON mode).
    *   Implements `generateText`, `chat`, and `generateImage`.

### Usage
```javascript
import { AIProvider } from "../providers/ai/registry.js";
const ai = AIProvider(process.env.AI_PROVIDER || "gemini");
const result = await ai.generateText("Hello world");
```

## 2. Authentication Provider (`src/providers/auth/`)

### Base Interface (`BaseAuthProvider`)
*   `verifyToken(token)`: Verifies an authentication token and returns the decoded payload.
*   `isAuthenticated(token)`: Returns `true` or `false` based on token validity.

### Implementations
*   **Firebase (`firebase/index.js`)**:
    *   Uses `firebase-admin` SDK.
    *   Verifies ID tokens issued by Firebase Auth.
*   **API Key (`apiKey.js`)**:
    *   Generates keys (`tk_{random}`).
    *   Hashes keys (`sha256`) for secure storage/lookup.
    *   Verifies keys against a stored hash (currently simple implementation, extensible to DB lookup).

### Usage
```javascript
import { AuthProvider } from "../providers/auth/registry.js";
const auth = AuthProvider('firebase');
const decoded = await auth.verifyToken(token);
```

## 3. Storage Provider (`src/providers/storage/`)

### Base Interface (`BaseStorageProvider`)
*   `upload(file, destination, options)`: Uploads a file buffer.
*   `download(path)`: Downloads file content.
*   `delete(path)`: Deletes a file.
*   `getSignedUrl(path, options)`: Generates a temporary access URL.

### Implementations
*   **Firebase Storage (`firebase/index.js`)**:
    *   Uses `firebase-admin` (`admin.storage().bucket()`).
    *   Handles metadata and public/private access control.

### Usage
```javascript
import { StorageProvider } from "../providers/storage/registry.js";
const storage = StorageProvider('firebase');
const result = await storage.upload(buffer, 'path/to/file.jpg');
```

## Tool Registry (`src/tools/`)
While not strictly a "Provider" in the same folder, the **Tool Registry** functions similarly for AI capabilities.
*   **`BaseTool`**: Interface for tools (`execute`, `getDefinition`).
*   **`ToolRegistry`**: Manages available tools (e.g., `GoogleSearchTool`).
*   **Implementations**: `GoogleSearchTool` (uses Google Custom Search API).
