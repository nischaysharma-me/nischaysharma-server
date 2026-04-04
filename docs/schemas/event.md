# Event Schema

Audit log for real-time WebSocket events and system notifications.

| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `userId` | String | Yes | UID of the user who received or triggered the event. |
| `type` | String | Yes | Categorical type (e.g., `job:completed`, `auth:login`). |
| `payload` | Object | Yes | The raw data associated with the event. |
| `source` | String | No | Origin of the event (default: `websocket`). |
| `receivedAt` | Date | Yes | Precise timestamp of arrival. |
| `deviceId` | String | No | Identifier for the client device that handled the event. |
