# Migration Guide: Express to NestJS

This document serves as a comprehensive guide for migrating the current **TaughtCode Server** (Express.js + Firebase + BullMQ) to the **NestJS** framework.

## 1. Project Overview & Architecture

**Current Stack:**
*   **Framework:** Express.js (ES Modules)
*   **Database:** Firebase (Firestore + Realtime DB)
*   **Queue:** BullMQ (Redis)
*   **Validation:** Joi
*   **Documentation:** Swagger UI (JSDoc)
*   **AI:** Google Gemini / OpenAI (via custom Provider Registry)

**Target Stack (NestJS):**
*   **Framework:** NestJS (TypeScript recommended, but migration can start in JS)
*   **Module System:** Angular-style Dependency Injection
*   **Validation:** DTOs + class-validator
*   **Queue:** `@nestjs/bull`
*   **Docs:** `@nestjs/swagger`

## 2. Folder Structure Mapping

We will transition from a "Layered Architecture" (Controllers/Services/Models) to a "Modular Architecture" (Feature-based).

| Current Express Path | Target NestJS Path | Concept Change |
| :--- | :--- | :--- |
| `src/app.js` | `src/app.module.ts` | Root Module orchestration |
| `src/server.js` | `src/main.ts` | Entry point |
| `src/config/*` | `src/config/*` | Use `@nestjs/config` service |
| `src/controllers/userProfileController.js` | `src/users/users.controller.ts` | Decorator-based routing |
| `src/services/userProfileService.js` | `src/users/users.service.ts` | `@Injectable()` provider |
| `src/models/userProfileModel.js` | `src/users/schemas/user.schema.ts` | Mongoose schema or Repository |
| `src/routes/userProfile.js` | `N/A` | Routes defined in Controller decorators |
| `src/middleware/auth.js` | `src/auth/guards/jwt-auth.guard.ts` | Middleware -> Guards |
| `src/workers/bullWorker.js` | `src/jobs/jobs.processor.ts` | `@Processor()` class |

## 3. Core Module Migration Strategy

### A. Configuration (`src/config/`)
*   **Current:** `dotenv` loading env vars into simple objects.
*   **NestJS:** Install `@nestjs/config`.
*   **Action:** Create a `configuration.ts` to load process.env, similar to `src/config/ai.js`.

### B. Providers & Services (`src/providers/` & `src/services/`)
The custom `ProviderRegistry` pattern in `src/providers/ai/registry.js` is a manual implementation of Dependency Injection. NestJS handles this natively.

**Migration:**
1.  Create an `AiModule`.
2.  Define an abstract `AiProvider` (Interface).
3.  Create `GeminiProvider` and `OpenAIProvider` classes implementing the interface, decorated with `@Injectable()`.
4.  Use `useClass` or `useFactory` in the module to inject the correct provider based on `AI_PROVIDER` env var.

```typescript
// ai.module.ts
@Module({
  providers: [
    {
        provide: 'AI_PROVIDER',
        useFactory: (config: ConfigService) => {
            return config.get('AI_PROVIDER') === 'gemini' ? new GeminiService() : new OpenAIService();
        },
        inject: [ConfigService]
    }
  ],
  exports: ['AI_PROVIDER']
})
export class AiModule {}
```

### C. Authentication (`src/middleware/auth.js`)
*   **Current:** Middleware checks Bearer token against Firebase Admin.
*   **NestJS:** Use `@nestjs/passport` and `passport-firebase-jwt`.
*   **Action:**
    1.  Create `AuthModule`.
    2.  Implement a `FirebaseAuthStrategy` extending `PassportStrategy`.
    3.  Protect routes using `@UseGuards(FirebaseAuthGuard)`.

### D. Validation (`src/validation/` & `Joi`)
*   **Current:** Joi schemas in `src/validation/*.js` validated via middleware.
*   **NestJS:** Use Data Transfer Objects (DTOs) with `class-validator`.
*   **Action:** Convert `onboardUserSchema` (Joi) to `CreateUserDto` (Class).

**Example:**
```typescript
export class CreateUserDto {
  @IsEmail()
  email: string;

  @IsString()
  @Length(2, 50)
  displayName: string;
}
```

## 4. Feature Modules Breakdown

### 1. Users Module (`src/users/`)
*   **Controller:** `UsersController` (migrated from `userProfileController.js`).
*   **Service:** `UsersService` (migrated from `userProfileService.js`).
*   **Repository:** If keeping Firebase, create a `FirebaseRepository` generic or specific `UsersRepository`.

### 2. Articles Module (`src/articles/`)
*   **Controller:** `ArticlesController`.
*   **Service:** `ArticlesService`.
*   **Logic:**
    *   Move `publishArticle`, `generateArticleContent` logic here.
    *   Inject `AiModule` to handle content generation.
    *   Inject `StorageModule` (migrated from `storageService.js`) for image uploads.

### 3. Jobs Module (`src/jobs/`)
*   **Dependencies:** `@nestjs/bull`.
*   **Components:**
    *   `JobsController`: Enqueue jobs (`POST /jobs`).
    *   `JobsProcessor`: Handle background tasks (migrated from `bullWorker.js`).
    *   `JobService`: Manage Job status in Firestore (State Machine logic).

**Queues:**
Define the queue in `JobsModule`:
```typescript
BullModule.registerQueue({
  name: 'taughtcode-jobs',
})
```

### 4. Docs Module (`src/docs/`)
*   **Controller:** `DocsController`.
*   **Service:** `DocsService`.
*   **Note:** This module renders HTML. NestJS supports template rendering (Handlebars/EJS) via `MVC` setup.
*   **Migration:** Ensure `hbs` or `ejs` is configured in `main.ts` to serve the templates currently in `src/templates/`.

## 5. Database Layer (Firebase)

Since the project uses `FirebaseModel` (a custom wrapper around Firestore), we have two options:
1.  **Keep Wrapper:** Port `src/utils/firebaseModel.js` to a TypeScript class and use it as a base repository.
2.  **Native Firestore:** Use `nestjs-fireorm` or just raw `firebase-admin` injected via a custom provider.

**Recommendation:** Port the existing `FirebaseModel` to a `@Injectable()` Repository pattern to minimize logic changes.

## 6. API Documentation (Swagger)

*   **Current:** `swagger-jsdoc` comments in routes.
*   **NestJS:** `@nestjs/swagger` decorators on Controllers and DTOs.
*   **Action:** Remove JSDoc comments and replace with `@ApiTags()`, `@ApiOperation()`, `@ApiResponse()`, and `@ApiProperty()` in DTOs.

## 7. Migration Steps Summary

1.  **Initialize:** `nest new taughtcode-server-nest`.
2.  **Dependencies:** Install `firebase-admin`, `@nestjs/config`, `@nestjs/bull`, `bull`, `class-validator`, `class-transformer`.
3.  **Config:** Port `dotenv` vars to `ConfigModule`.
4.  **Shared Modules:** Implement `FirebaseModule` (DB connection) and `AiModule`.
5.  **Feature Migration:** Port `Users`, `Articles`, then `Jobs` module by module.
6.  **Refactor:** Replace `Joi` with DTOs.
7.  **Testing:** Verify endpoints using the new Swagger UI.

## 8. Specific Code migration examples

### Storage Service
**Express (`src/services/storageService.js`):**
```javascript
import { StorageProvider } from '../providers/storage/registry.js';
const provider = StorageProvider('firebase');
export async function uploadUserAsset(...) { ... }
```

**NestJS (`src/storage/storage.service.ts`):**
```typescript
@Injectable()
export class StorageService {
  constructor(@Inject('STORAGE_PROVIDER') private provider: BaseStorageProvider) {}

  async uploadUserAsset(...) {
    return this.provider.upload(...);
  }
}
```
