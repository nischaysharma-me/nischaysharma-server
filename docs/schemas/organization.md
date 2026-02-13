# Organization Schema

Represents a workspace or team. Users can belong to an organization, which allows for shared resources and management.

| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `id` | String | Yes | Unique Organization ID (Auto-generated). |
| `name` | String | Yes | Organization name. |
| `orgCode` | String | No | Unique code for the organization (for invitations/lookup). |
| `slug` | String | No | URL-friendly slug for the organization profile. |
| `type` | String | Yes | Type of organization (`enterprise`, `startup`, `personal`). |
| `ownerId` | String | Yes | User ID of the admin/owner. |
| `description` | String | No | Description of the organization. |
| `settings` | Object | No | Organization settings (api keys, user limits, feature flags). |
| `status` | Object | No | Status object containing state (`active`, `suspended`), reason, and history. |
| `createdAt` | Date | Yes | Timestamp of creation. |
| `updatedAt` | Date | Yes | Timestamp of last update. |
