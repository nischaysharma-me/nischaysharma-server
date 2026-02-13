# Data Layer Documentation

The application uses a custom Object-Document Mapper (ODM) wrapper around Firebase Firestore to provide schema validation and a Mongoose-like API.

## `FirebaseModel` (`src/utils/firebaseModel.js`)
This class standardizes interactions with Firestore collections.

### Core Features
1.  **Schema Validation**: Validates data types (`String`, `Number`, `Boolean`, `Date`, `Array`, `Object`), enums, min/max values, and custom validators before writing to the database.
2.  **Type Casting**: Automatically converts Firestore Timestamps to JavaScript `Date` objects upon retrieval (`_normalizeData`).
3.  **Default Values**: Applies default values defined in the schema if fields are missing.
4.  **CRUD Methods**:
    *   `create(data)`: Validates and adds a document. Handles `createdAt`/`updatedAt`.
    *   `findById(id)`: Retrieves a document by ID.
    *   `findOne(query)`: Finds a single document matching criteria.
    *   `find(query, options)`: Finds multiple documents with filtering (`$gt`, `$lt`, `in`), sorting, and pagination (limit/skip).
    *   `findByIdAndUpdate(id, updateData)`: Validates updates and modifies the document.
    *   `findByIdAndDelete(id)`: Removes a document.

## Models (`src/models/`)

### 1. `User` (`userProfileModel.js`)
*   **Collection**: `users`
*   **Key Fields**: `uid` (Firebase Auth ID), `email`, `role` (user/admin), `organizationId`, `preferences`.

### 2. `Article` (`articleModel.js`)
*   **Collection**: `articles`
*   **Key Fields**: `slug` (Unique), `title`, `content` (HTML), `status` (draft/published), `access` (free/paid), `authorId`.

### 3. `Job` (`jobModel.js`)
*   **Collection**: `jobs`
*   **Key Fields**: `type` (job type), `status` (queued/processing/completed/failed), `data` (input payload), `result` (output), `error`.

### 4. `ArticleTemplate` (`articleTemplateModel.js`)
*   **Collection**: `article_templates`
*   **Key Fields**: `structure` (JSON array of sections), `aiInstructions`, `category`.

### 5. `Organization` (`organizationModel.js`)
*   **Collection**: `organizations`
*   **Key Fields**: `ownerId`, `settings` (allowed features).

### 6. `ApiKey` (`apiKeyModel.js`)
*   **Collection**: `api_keys`
*   **Key Fields**: `keyHash` (SHA256), `scopes`, `organizationId`, `expiresAt`.

## Migration Considerations
When migrating to a new framework (e.g., NestJS):
*   **Option A (Keep Firestore):** Port `FirebaseModel` to a TypeScript Repository pattern or use `nestjs-fireorm`.
*   **Option B (Switch DB):** Migrate schemas to Mongoose (MongoDB) or TypeORM/Prisma (SQL). The schema definitions are already very close to Mongoose syntax.
