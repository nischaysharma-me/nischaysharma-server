# User Schema

The User Profile represents a registered user in the system. It contains personal information, preferences, and role-based access control details.

| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `uid` | String | Yes | Unique Firebase Auth ID. Acts as the primary key. |
| `email` | String | Yes | User's email address. Must be unique. |
| `displayName` | String | Yes | User's full name or display name. |
| `photoURL` | String | No | URL to the profile picture (stored in Firebase Storage). |
| `occupation` | String | No | User's job title or occupation. |
| `bio` | String | No | Short biography (max 1000 chars). |
| `hobbies` | Array | No | List of hobbies (Strings). |
| `interests` | Array | No | List of interests (Strings). |
| `expertise` | Array | No | Areas of expertise (Strings). |
| `writingStyle` | String | No | Preferred AI writing style (e.g., 'casual', 'professional'). |
| `organizationId` | String | No | ID of the organization the user belongs to. |
| `role` | String | Yes | User role (`user`, `admin`, `moderator`). Default: `user`. |
| `status` | String | Yes | Account status (`active`, `deactivated`, `disabled`). Default: `active`. |
| `preferences` | Object | No | UI preferences (theme, notifications). |
| `socialLinks` | Object | No | Social media profile links. |
| `createdAt` | Date | Yes | Timestamp of creation. |
| `updatedAt` | Date | Yes | Timestamp of last update. |
