# Project Folder Structure

This project follows the Provider-Service-Controller (PSC) pattern.

## Directory Structure

- `src/config`: Configuration files.
- `src/controller`: Controllers handle incoming requests and send responses.
- `src/middleware`: Express middlewares.
- `src/models`: Database models.
- `src/prompts`: System prompts for AI/LLM interactions.
- `src/providers`: External service providers or adapters.
- `src/routes`: API route definitions.
- `src/services`: Business logic layer.
- `src/templates`: Templates for emails or generated content.
- `src/tools`: Utility tools or scripts.
- `src/utils`: General utility functions.
- `src/validation`: Request validation schemas.
- `src/workers`: Background workers.
- `src/app.js`: Application setup.
- `src/server.js`: Server entry point.

## PSC Pattern

- **Provider**: Handles external interactions and data sources.
- **Service**: Contains the core business logic.
- **Controller**: Manages the HTTP request/response cycle.
