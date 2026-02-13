# User API Endpoints

Base URL: `/api/v1/users`

Authentication: Bearer Token (Firebase ID Token)

## Onboarding & Profile

### Onboard User
Completes the user registration process by creating a profile and optionally joining/creating an organization.

- **URL**: `/onboard`
- **Method**: `POST`
- **Content-Type**: `multipart/form-data`
- **Body Parameters**:
    - `photo` (File, Optional): Profile picture image.
    - `email` (String, Required): User email.
    - `displayName` (String, Required): Full name.
    - `writingStyle` (String, Optional): Preferred writing style.
    - `createOrganization` (Boolean, Optional): Create a new org?
    - `organizationName` (String, Optional): Name of org if creating one.
    - `...` (Other profile fields)

### Get Current Profile
Retrieve the profile of the currently authenticated user.

- **URL**: `/me`
- **Method**: `GET`
- **Success Response**: 
    - `200 OK` with User object.
    - If user exists in Auth but not in Database (not onboarded): `200 OK` with `{ ..., isOnboarded: false }`.

### Update Profile
Update details of the current user.

- **URL**: `/me`
- **Method**: `PATCH`
- **Body Parameters**: (JSON)
    - Any writable User schema field (e.g., `bio`, `displayName`, `preferences`).

## User Management

### Get User by ID
Fetch a user's public profile details.

- **URL**: `/:id`
- **Method**: `GET`
- **Success Response**: `200 OK` with User object.
- **Error Response**: `404 Not Found` if user does not exist or is deactivated.

### List Users (Admin)
Get a list of all users, optionally filtered.

- **URL**: `/`
- **Method**: `GET`
- **Query Params**:
    - `role` (optional): Filter by role.
    - `status` (optional): Filter by status.

## Status Management

### Deactivate User
Soft delete a user account (Self or Admin).

- **URL**: `/:id/deactivate`
- **Method**: `PATCH`

### Disable User (Admin)
Ban a user account.

- **URL**: `/:id/disable`
- **Method**: `PATCH`

### Activate User (Admin)
Unban/Reactivate a user account.

- **URL**: `/:id/activate`
- **Method**: `PATCH`