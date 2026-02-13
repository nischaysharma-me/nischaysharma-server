# Firebase Model Architecture

This document outlines the **Firebase Model Pattern** used in this project to interact with Firestore. This abstraction layer provides a structured, familiar, and type-safe way to manage data, mimicking the popular **Mongoose** library used with MongoDB.

## Concept

Directly using the Firestore SDK in Controllers or Services can lead to code duplication, scattered validation logic, and a lack of type safety. The `FirebaseModel` class acts as a base wrapper that provides standard CRUD operations (`create`, `findById`, `findOne`, `findOneAndUpdate`, `delete`) and integrates schema validation.

## Architecture Components

1.  **FirebaseModel (Base Class)**: Located in `src/utils/firebaseModel.js`. It wraps the Firestore collection and implements Mongoose-like CRUD methods.
2.  **Concrete Models**: Classes that extend `FirebaseModel` (e.g., `src/models/userProfileModel.js`). They define the collection name and can add specific business queries.
3.  **Validation**: Built-in schema validation (type checking, required fields, enums, defaults) similar to Mongoose.
4.  **Utilities**: Helper functions in `src/utils/firebaseUtils.js` for data transformation (e.g., converting Firestore timestamps).

## Usage Guide

### 1. Modern Mongoose-Style Definition

You can define schemas using familiar Mongoose syntax. The `FirebaseModel` handles validation automatically.

```javascript
import FirebaseModel from '../utils/firebaseModel.js';

const organizationSchema = {
  name: {
    type: String,
    required: true,
    trim: true
  },
  type: {
    type: String,
    enum: ['enterprise', 'startup', 'personal'],
    default: 'personal'
  },
  ownerId: {
    type: String,
    required: true
  },
  settings: {
    type: Object,
    default: {
      allowApiKeys: true,
      maxUsers: 50
    }
  },
  createdAt: {
    type: Date,
    default: () => new Date()
  }
};

// Easy to read instantiation
const Organization = new FirebaseModel('organizations', organizationSchema);

export default Organization;
```

### 2. Direct Instantiation (Shorthand Style)

For very simple collections, you can even use a shorthand style.

```javascript
import { createModel } from '../models/index.js';

// Creating a simple model with just types
const Tag = createModel('tags', {
    name: String,
    slug: { type: String, lowercase: true }
});
```

---

## Comparison: FirebaseModel vs. Mongoose

While designed to feel like Mongoose, there are fundamental differences due to the underlying database (NoSQL Document Store vs. NoSQL Document Store).

| Feature | Mongoose (MongoDB) | FirebaseModel (Firestore) |
| :--- | :--- | :--- |
| **Connection** | Maintains a persistent TCP connection pool. | Stateless HTTP/gRPC (via SDK). |
| **Schemas** | Strict schemas defined in Mongoose. | **Mongoose-style** objects validated internally. |
| **Queries** | Rich query language (`$gt`, `$in`, regex). | Limited Firestore queries (equality, basic range). |
| **Relations** | `populate()` for joining collections. | No native joins. Manual fetching required. |
| **Middleware** | Pre/Post hooks (`pre('save')`). | Not implemented. |
| **ID** | `_id` (ObjectId). | `id` (String/UUID). |


## Implementation Details

### `src/utils/firebaseModel.js`

-   **`constructor(collectionName, schema)`**: Initializes the Firestore collection reference.
-   **`create(data)`**: Validates input, applies defaults, casts types, adds timestamps (`createdAt`, `updatedAt`), and saves to a new document (using auto-generated ID).
-   **`findById(id)`**: Fetches a document by Doc ID.
-   **`findOne(query)`**: Fetches a single document matching a query (e.g. `{ uid: '...' }`).
-   **`find(query, options)`**: Performs queries with filtering, sorting, limiting, and skipping.
-   **`findByIdAndUpdate(id, data, options)`**: Updates document by ID. Supports `new: true` to return updated doc.
-   **`findOneAndUpdate(query, data, options)`**: Finds by query and updates. Supports `upsert`.
-   **`findByIdAndDelete(id)`**: Removes the document by ID.
-   **`deleteMany(query)`**: Deletes multiple documents matching a query.
-   **`updateMany(query, data)`**: Updates multiple documents matching a query.

### `src/utils/firebaseUtils.js`

-   **`docToObj(doc)`**: Converts a Firestore `DocumentSnapshot` to a plain JS object. Crucially, it converts Firestore `Timestamp` objects back to standard JS `Date` objects.

## Why this approach?

1.  **Consistency**: Developers coming from a MERN stack feel right at home.
2.  **Safety**: Validation prevents "schemaless chaos" in the database.
3.  **Abstraction**: If we ever switch database providers, we only update the `FirebaseModel` base class, not every service.