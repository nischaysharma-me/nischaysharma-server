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

## Media Management

### Update Profile Picture
Update the currently authenticated user's profile picture.

- **URL**: `/me/photo`
- **Method**: `PATCH`
- **Content-Type**: `multipart/form-data`
- **Body Parameters**:
    - `file` (File, Required): The image file.
- **Success Response**: `200 OK` with updated User object.

### Update Cover Photo
Update the currently authenticated user's cover photo.

- **URL**: `/me/cover`
- **Method**: `PATCH`
- **Content-Type**: `multipart/form-data`
- **Body Parameters**:
    - `file` (File, Required): The image file.
- **Success Response**: `200 OK` with updated User object.

### Add Gallery Asset
Add a photo or video to the user's gallery.

- **URL**: `/me/gallery`
- **Method**: `POST`
- **Content-Type**: `multipart/form-data`
- **Body Parameters**:
    - `file` (File, Required): The image or video file.
    - `title` (String, Optional): Title for the asset.
    - `description` (String, Optional): Description for the asset.
- **Success Response**: `200 OK` with updated User object.

### Delete Gallery Asset
Remove an asset from the user's gallery and storage.

- **URL**: `/me/gallery`
- **Method**: `DELETE`
- **Body Parameters**:
    - `assetUrl` (String, Required): The full URL of the asset to delete.
- **Success Response**: `200 OK` with updated User object.

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