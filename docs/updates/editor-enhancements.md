# Refactor Update: Editor Enhancements

## Summary
This update focuses on critical usability and feature enhancements for the Tiptap-based editor. The goal is to provide a seamless writing experience with support for advanced content types like Mermaid diagrams and efficient media handling.

## Key Features

### 1. Fullscreen Scroll Fix
Resolved a critical layout bug where the editor content became unscrollable in fullscreen mode. The editor body now correctly respects the viewport height and provides smooth vertical scrolling.

### 2. Native Markdown Pasting
The editor now intelligently handles Markdown content pasted from the clipboard. It automatically parses Markdown syntax (headers, lists, code blocks, etc.) and converts it into formatted rich text.

### 3. Mermaid Diagram Support
Introduced support for Mermaid.js diagrams directly within the editor. Users can create, preview, and edit complex diagrams using standard Mermaid syntax.

### 4. Automatic Image Upload on Paste
Streamlined media management by allowing users to paste images directly from their clipboard. The editor automatically uploads the image to Firebase Storage and inserts the resulting URL, eliminating the need for manual uploads.
