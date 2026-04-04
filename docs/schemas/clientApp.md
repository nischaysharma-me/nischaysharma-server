# Client Application Schema

Defines an external application or device authorized to interact with the platform.

| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `name` | String | Yes | Name of the client app/device. |
| `url` | String | Yes | Primary URL or callback for the client. |
| `ownerId` | String | Yes | UID of the user who owns this client registration. |
| `permissions` | Array | No | List of authorized scopes (e.g., `read:articles`, `write:jobs`). |
| `status` | String | Yes | State: `active`, `inactive`. |
| `registeredDevices` | Array | No | List of active device sessions: `[{ deviceId, name, type, lastConnectedAt }]`. |
| `createdAt` | Date | Yes | Timestamp of registration. |
| `updatedAt` | Date | Yes | Timestamp of last metadata update. |
