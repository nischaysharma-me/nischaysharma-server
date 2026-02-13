# How to Create a Provider

Providers are the bridge between our application and the outside world (like AI, Storage, Auth, or Email). We use a **Base-Provider-Registry** pattern to keep things modular.

## The Concept

Imagine "Storage" as a generic idea. We don't want our code to know we are using *Firebase Storage* specifically. We just want to say "Upload this file".

1.  **Base Provider**: The contract (Interface). It says "Any storage provider *must* have an `upload` method".
2.  **Concrete Provider**: The actual worker (e.g., `FirebaseStorageProvider`). It knows *how* to talk to Firebase.
3.  **Registry**: The factory. It gives you the correct provider based on configuration.

---

## Step 1: Define the Contract (Base)

Create a `base.js` in your provider folder (e.g., `src/providers/email/base.js`).

```javascript
class BaseEmailProvider {
    constructor() {}

    async sendEmail(to, subject, body) {
        throw new Error("Method 'sendEmail' must be implemented");
    }
}

export default BaseEmailProvider;
```

## Step 2: Implement the Logic (Concrete)

Create your specific implementation (e.g., `src/providers/email/sendgrid/index.js`).

```javascript
import BaseEmailProvider from "../base.js";
import sendgrid from "@sendgrid/mail";

class SendGridProvider extends BaseEmailProvider {
    constructor() {
        super();
        sendgrid.setApiKey(process.env.SENDGRID_API_KEY);
    }

    async sendEmail(to, subject, body) {
        // Real implementation
        await sendgrid.send({ to, from: 'noreply@app.com', subject, text: body });
        return true;
    }
}

export default SendGridProvider;
```

## Step 3: Register It (Registry)

Create `src/providers/email/registry.js`. This is where you list available providers.

```javascript
import SendGridProvider from "./sendgrid/index.js";
// import SESProvider from "./ses/index.js"; // Future provider

const providers = {
    sendgrid: SendGridProvider,
    // ses: SESProvider
};

export function EmailProvider(providerName = 'sendgrid') {
    const ProviderClass = providers[providerName];
    if (!ProviderClass) throw new Error(`Provider ${providerName} not found`);
    return new ProviderClass();
}
```

## Usage

Now, anywhere in your app:

```javascript
import { EmailProvider } from '../providers/email/registry.js';

const emailer = EmailProvider(); // Defaults to sendgrid
await emailer.sendEmail('user@example.com', 'Hello', 'Welcome!');
```
