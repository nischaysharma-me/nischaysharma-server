# Conversation API Endpoints

Base URL: `/api/v1/conversations`

Authentication: Bearer Token (Firebase ID Token) is generally applied. Unauthenticated requests might result in an 'anonymous' user depending on the middleware configuration.

## Conversation Thread Management

### Create Thread
Create a new AI conversation thread.

- **URL**: `/`
- **Method**: `POST`
- **Auth**: Required
- **Body Parameters**:
    - `title` (String, Optional): Title of the thread. Default: "New Conversation".
    - `initialMessage` (String, Optional): An initial message to start the conversation context.
- **Success Response**: `201 Created` with Thread object.

### List Threads
Get a list of all conversation threads for the authenticated user.

- **URL**: `/`
- **Method**: `GET`
- **Auth**: Required
- **Success Response**: `200 OK` with Array of Thread objects.

### Get Thread
Retrieve the details and message history of a specific thread.

- **URL**: `/:threadId`
- **Method**: `GET`
- **Auth**: Required
- **Success Response**: `200 OK` with Thread object containing a `messages` array.

### Update Thread
Update metadata (title or pinning status) of a specific thread.

- **URL**: `/:threadId`
- **Method**: `PATCH`
- **Auth**: Required
- **Body Parameters**:
    - `title` (String, Optional): New title.
    - `isPinned` (Boolean, Optional): Pin status.
- **Success Response**: `200 OK` with updated Thread object.

### Stream AI Reply
Send a message and receive a streamed Server-Sent Events (SSE) response from the AI. The AI may also trigger background tool calls (like image generation or book page drafting) during this stream.

- **URL**: `/:threadId/stream`
- **Method**: `POST`
- **Auth**: Required
- **Headers**:
    - `Accept`: `text/event-stream`
- **Body Parameters**:
    - `message` (String, Required): The user's prompt.
- **Success Response**: `200 OK` (chunked).
    - Streams `data: {"text": "chunk content"}\n\n`
    - Streams `data: [DONE]\n\n` upon completion.

### Delete Thread
Delete a conversation thread.

- **URL**: `/:threadId`
- **Method**: `DELETE`
- **Auth**: Required
- **Success Response**: `200 OK` with success message.
