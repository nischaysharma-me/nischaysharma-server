# User Schema

The User Profile represents a registered user in the system. It contains personal information, preferences, and role-based access control details.

| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `uid` | String | Yes | Unique Firebase Auth ID. Acts as the primary key. |
| `email` | String | Yes | User's email address. Must be unique. |
| `displayName` | String | Yes | User's full name or display name. |
| `photoURL` | String | No | URL to the profile picture. |
| `coverURL` | String | No | URL to the cover photo. |
| `occupation` | String | No | User's job title or occupation. |
| `bio` | String | No | Short biography (max 1000 chars). |
| `skills` | Array | No | List of technical/soft skills. |
| `projects` | Array | No | Featured projects: `{ title, description, link }`. |
| `expertise` | Array | No | Areas the user is knowledgeable in. |
| `gallery` | Array | No | Array of objects: `{ url, type, title, createdAt }`. |
| `featured` | Array | No | Array of objects: `{ type, id, title, url }`. |
| `hobbies` | Array | No | List of hobbies. |
| `interests` | Array | No | List of interests. |
| `writingStyle` | String | No | Preferred AI writing style (`professional`, `casual`, `technical`, `witty`, `academic`, `storyteller`). |
| `socialLinks` | Object | No | Social profile links: `{ twitter, linkedin, github, website }`. |
| `role` | String | Yes | User role (`user`, `admin`, `moderator`). Default: `user`. |
| `preferences` | Object | No | UI preferences: `{ theme, notifications, language }`. |
| `integrations` | Object | No | OAuth integration data (tokens, identifiers). |
| `analytics` | Object | No | Processed professional data: `{ github: githubAnalyticsSchema, linkedin: linkedinAnalyticsSchema }`. |
| `organizationId` | String | No | ID of the organization the user belongs to. |
| `status` | String | Yes | Account status (`active`, `deactivated`, `disabled`). Default: `active`. |
| `createdAt` | Date | Yes | Timestamp of creation. |
| `updatedAt` | Date | Yes | Timestamp of last update. |
