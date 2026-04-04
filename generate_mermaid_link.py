import base64
import zlib
import sys

diagram = """erDiagram
    ORGANIZATION {
        string id PK
        string name
        string ownerId FK "Admin User"
        string status
        timestamp created_at
    }

    USER {
        string uid PK "Firebase UID"
        string email UK
        string displayName
        string organizationId FK
        string role "user/admin"
    }

    ARTICLE_TEMPLATE {
        string id PK
        string name
        string structure "JSON"
        string aiInstructions
        string authorId FK
    }

    ARTICLE {
        string id PK
        string title
        text content "HTML/Markdown"
        enum status "draft/published/archived"
        string authorId FK
        string templateId FK
        timestamp created_at
        timestamp updated_at
    }

    JOB {
        string id PK
        string type "article_generation/etc"
        enum status "queued/processing/completed/failed"
        string bullmq_job_id UK "External Queue ID"
        jsonb data "Input Payload"
        jsonb result "LLM Response / Metadata"
        text error_log
        string userId FK
        string articleId FK "Optional: Target Article"
        int attempt_count
        timestamp created_at
        timestamp started_at
        timestamp finished_at
    }

    ORGANIZATION ||--o{ USER : "employs"
    USER ||--o{ ARTICLE : "authors"
    USER ||--o{ JOB : "initiates"
    USER ||--o{ ARTICLE_TEMPLATE : "creates"
    
    ARTICLE_TEMPLATE ||--o{ ARTICLE : "structures"
    
    ARTICLE ||--o{ JOB : "generated_by"
"""

# Mermaid.ink expects:
# 1. JSON string: {"code": "..."}
# 2. Deflated
# 3. Base64 encoded (URL safe)

# Actually, simply deflating the diagram string often works for older versions, 
# but the standard now is often wrapping in json: { "code": "...", "mermaid": {"theme": "default"} }
# Let's try the simple raw deflate first which mermaid.ink supports for legacy/simple compat.
# Actually, the most reliable for mermaid.ink is:
# base64(zlib.compress(json.dumps({'code': diagram, 'mermaid': {'theme': 'default'}})))

import json
json_data = json.dumps({'code': diagram, 'mermaid': {'theme': 'default'}})
compressed = zlib.compress(json_data.encode('utf-8'))
# zlib.compress produces a header. deflate (raw) usually shouldn't have it for some implementations, 
# but mermaid.ink (pako) often handles standard zlib or raw deflate. 
# Let's use pako compatible encoding (standard zlib usually works).

encoded = base64.urlsafe_b64encode(compressed).decode('utf-8')
print(f"https://mermaid.ink/img/{encoded}")
