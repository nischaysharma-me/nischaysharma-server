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
*   **Key Fields**: `uid`, `email`, `role`, `organizationId`, `analytics`.
*   **Detail**: [user.md](../schemas/user.md)

### 2. `Article` (`articleModel.js`)
*   **Collection**: `articles`
*   **Key Fields**: `slug`, `title`, `content`, `status`, `access`, `authorId`.
*   **Detail**: [article.md](../schemas/article.md)

### 3. `Job` (`jobModel.js`)
*   **Collection**: `jobs`
*   **Key Fields**: `type`, `status` (queued/processing/completed/failed), `data`, `result`.
*   **Detail**: [job.md](../schemas/job.md)

### 4. `Book` (`bookModel.js`)
*   **Collection**: `books`
*   **Key Fields**: `userId`, `title`, `type` (book/paper), `chapters`.
*   **Detail**: [book.md](../schemas/book.md)

### 5. `Page` (`pageModel.js`)
*   **Collection**: `pages`
*   **Key Fields**: `bookId`, `chapterId`, `content`, `status`.
*   **Detail**: [page.md](../schemas/page.md)

### 6. `Conversation` (`conversationModel.js`)
*   **Collection**: `conversations`
*   **Key Fields**: `userId`, `messages` (role/content history), `isPinned`.
*   **Detail**: [conversation.md](../schemas/conversation.md)

### 7. `Organization` (`organizationModel.js`)
*   **Collection**: `organizations`
*   **Key Fields**: `ownerId`, `orgCode`, `settings`, `status`.
*   **Detail**: [organization.md](../schemas/organization.md)

### 8. `ArticleTemplate` (`articleTemplateModel.js`)
*   **Collection**: `article_templates`
*   **Key Fields**: `structure`, `aiInstructions`, `category`.
*   **Detail**: [articleTemplate.md](../schemas/articleTemplate.md)

### 9. `ApiKey` (`apiKeyModel.js`)
*   **Collection**: `api_keys`
*   **Key Fields**: `keyHash`, `scopes`, `organizationId`.
*   **Detail**: [apiKey.md](../schemas/apiKey.md)

### 10. `ClientApp` (`clientAppModel.js`)
*   **Collection**: `clientApps`
*   **Key Fields**: `name`, `url`, `ownerId`, `permissions`.
*   **Detail**: [clientApp.md](../schemas/clientApp.md)

### 11. `Review` (`reviewModel.js`)
*   **Collection**: `reviews`
*   **Key Fields**: `articleId`, `userId`, `rating`, `comment`.
*   **Detail**: [review.md](../schemas/review.md)

### 12. `Tag` (`tagModel.js`)
*   **Collection**: `tags`
*   **Key Fields**: `name`, `slug`, `usageCount`.
*   **Detail**: [tag.md](../schemas/tag.md)

### 13. `Event` (`eventModel.js`)
*   **Collection**: `events`
*   **Key Fields**: `userId`, `type`, `payload`, `source`.
*   **Detail**: [event.md](../schemas/event.md)

## Migration Considerations
When migrating to a new framework (e.g., NestJS):
*   **Option A (Keep Firestore):** Port `FirebaseModel` to a TypeScript Repository pattern or use `nestjs-fireorm`.
*   **Option B (Switch DB):** Migrate schemas to Mongoose (MongoDB) or TypeORM/Prisma (SQL). The schema definitions are already very close to Mongoose syntax.
