# Article Generation Prompts

This document explains the prompt engineering strategy used to generate high-quality, structured articles using AI.

## Overview

The article generation process is a two-step pipeline designed to ensure structural integrity and content quality. It supports varying levels of detail via the `depth` parameter (`standard` vs `deep-dive`).

1.  **Structure Generation**: The AI first plans the article skeleton (JSON).
2.  **Content Generation**: The AI then fills in the content based on the plan (Markdown/HTML).

## 1. Structure Generation Prompt

**Goal**: To create a valid JSON object defining the article's metadata and sections.

**Prompt Template**:
```javascript
`You are an expert article writer... topic: "${topic}".

**Mode: ${depth === 'deep-dive' ? "DEEP DIVE" : "Standard"}**
// If deep-dive: "Aim for 8-12 comprehensive sections. Include advanced concepts..."

Please provide the output in strict JSON format...`
```

**Key Features**:
-   **Strict JSON**: Ensures the output can be parsed programmatically.
-   **Layout & Aspect Ratio Control**: The `layout` field dictates how the section is rendered, while `imageAspectRatio` ensures images are generated in the correct dimensions (e.g., 16:9, 4:3, 1:1).
-   **Depth Control**: Adjusts section count and complexity based on user request.

## 1.5 Asset Generation Logic

**Goal**: To generate visual assets (cover image and section graphics) with high quality and consistency.

**Background Image (Cover)**:
-   **Prompt**: Strictly instructed to have NO TEXT, typography, or words.
-   **Configuration**: Forced to **16:9** aspect ratio and **2K** resolution for professional aesthetics.

**Section Images**:
-   **Prompt**: Contextually enhanced with the article topic.
-   **Configuration**: Uses the dynamic `imageAspectRatio` predicted during Step 1.

## 2. Content Generation Prompt

**Goal**: To generate the final **Semantic HTML** content with embedded styling.

**Prompt Template**:
```javascript
`You are an expert web content creator...

Structure: ...
Image URLs: ...

Instructions:
...
// If deep-dive: "Do not be superficial. Each section must be substantial (300-500 words)..."
...`
```

**Key Features**:
-   **Semantic HTML**: Outputs clean `<section>`, `<figure>`, `<h2>` tags.
-   **Depth Control**: Enforces word count minimums and technical depth for "deep-dive" requests.
-   **Asset Integration**: Images are placed contextually.
## Workflow

1.  **User Input**: Topic received via API.
2.  **Step 1 (AI)**: Generate JSON Structure (including layouts and aspect ratios).
3.  **Step 1.5 (AI & Storage)**:
    -   Generate high-res background (cover) image (16:9, no text).
    -   Iterate through sections. If `imagePrompt` exists, generate image using the predicted `imageAspectRatio`, upload to Storage, and get URL.
4.  **Step 2 (AI)**: Generate HTML content using the Structure + Image URLs.
5.  **Save**: Store the final Article object in the database.
