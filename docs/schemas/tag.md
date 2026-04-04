# Tag Schema

Categorical metadata used to index and group articles.

| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `name` | String | Yes | Human-readable label (e.g., 'React'). |
| `slug` | String | Yes | URL-friendly identifier (e.g., 'react'). |
| `usageCount` | Number | No | Total number of articles using this tag. |
| `createdAt` | Date | Yes | Timestamp when the tag was first created. |
| `updatedAt` | Date | Yes | Timestamp of last usage update. |
