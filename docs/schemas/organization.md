# Organization Schema

Defines a group entity that can own articles, manage users, and issue API keys.

| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `name` | String | Yes | Full name of the organization. |
| `orgCode` | String | No | Short alphanumeric code for identification. |
| `slug` | String | No | URL-friendly unique identifier. |
| `type` | String | Yes | Category: `enterprise`, `startup`, `personal`. |
| `description` | String | No | Detailed bio or purpose (max 500 chars). |
| `ownerId` | String | Yes | UID of the user who manages the organization. |
| `members` | Array | No | List of member objects: `{ userId, role, addedAt }`. |
| `settings` | Object | No | Configurable parameters: `{ allowApiKeys: Boolean, maxUsers: Number }`. |
| `status` | Object | No | Operational state: `{ state: 'active'|'suspended', reason: String, changedAt: Date }`. |
| `createdAt` | Date | Yes | Timestamp of creation. |
| `updatedAt` | Date | Yes | Timestamp of last update. |
