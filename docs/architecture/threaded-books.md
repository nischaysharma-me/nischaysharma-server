# Threaded Books Architecture (Updated)

## Concept Overview
The "Threaded Books" concept shifts the paradigm of content creation to collaborative, iterative co-authoring between a user and AI. A "Book" (or "Paper") is attached to a conversational thread.

### Multi-Chapter Books vs. Research Papers
1.  **Books**: Have multiple named **Chapters**. Each chapter serves as a container for ordered **Pages**.
2.  **Papers**: Have exactly one nameless (null title) Chapter. All drafted content is appended as ordered **Pages** within this single flow.

## AI Co-Authoring Workflow
To ensure high-quality, human-aligned content, the AI follows a strict **Brainstorming -> Drafting** cycle:
- **Brainstorming**: User and AI converse normally. The AI should NOT trigger drafting tools autonomously during this phase.
- **Drafting**: Triggered ONLY by explicit user command (e.g., "Draft this page"). The AI then uses the `draft_chapter_page` tool to initiate a background generation job.

## Core Entities & Relationships

### 1. Book (or Publication)
Represents the overarching collection.
- **Attributes**: `id`, `userId`, `threadId`, `title`, `description`, `type` ('book' | 'paper'), `status`, `chapters` (Array<{ id, title, pageIds: [] }>).

### 2. Page
A block of content within a chapter.
- **Attributes**: `id`, `bookId`, `chapterId`, `content` (Markdown/HTML), `images` (array), `status`, `lastDraftedFromMessageId`.

## AI Tool Integration

- **`create_chapter`**: Adds a new named container to a 'book' type publication.
- **`draft_chapter_page`**: Initiates a background job to synthesize the conversation into a Page. If `chapterId` is omitted, it defaults to the single chapter (for papers) or the latest chapter (for books).

## Background Worker logic
When `draft_chapter_page` is called:
1.  **Worker** fetches the *entire* thread history.
2.  **Worker** generates a cohesive Page structure and full content based on the brainstorming context.
3.  **Worker** saves the Page to the specific `chapterId` and updates the Book's chapter order.
