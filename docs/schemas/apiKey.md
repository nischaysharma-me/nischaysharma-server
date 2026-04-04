# API Key Schema

Represents a programmatic access token associated with an organization.

| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `name` | String | Yes | Human-readable label for the key. |
| `keyHash` | String | Yes | Securely hashed version of the actual API key. |
| `prefix` | String | Yes | First few characters of the key (e.g., `tc_`) for identification. |
| `organizationId` | String | Yes | ID of the organization that owns this key. |
| `createdBy` | String | Yes | UID of the user who generated the key. |
| `scopes` | Array | No | Permissions granted to this key (default: `['*']`). |
| `status` | String | Yes | State of the key: `active`, `revoked`, `expired`. |
| `lastUsedAt` | Date | No | Timestamp of the most recent API call using this key. |
| `expiresAt` | Date | No | Timestamp when the key will automatically expire. |
| `createdAt` | Date | Yes | Timestamp of generation. |
| `updatedAt` | Date | Yes | Timestamp of last metadata update. |
