# Billboard API Endpoints

Base URL: `/api/v1/billboards`

Billboard management allows for creating, updating, and managing billboard content and associated imagery.

## Billboard Management

### List Billboards
List all active billboards.

- **URL**: `/`
- **Method**: `GET`
- **Auth**: None
- **Success Response**: `200 OK` with Array of Billboards.

### Create Billboard
Create a new billboard entry.

- **URL**: `/`
- **Method**: `POST`
- **Auth**: Required
- **Body Parameters**:
    - `title` (String, Required)
    - `description` (String, Optional)
    - `image` (File, Optional): Billboard image file.
    - `link` (String, Optional)
- **Success Response**: `201 Created` with Billboard object.

### Update Billboard
Update an existing billboard.

- **URL**: `/:id`
- **Method**: `PATCH`
- **Auth**: Required
- **Body Parameters**:
    - `title` (String, Optional)
    - `description` (String, Optional)
    - `image` (File, Optional)
    - `link` (String, Optional)
- **Success Response**: `200 OK` with updated Billboard.

### Delete Billboard
Delete an existing billboard.

- **URL**: `/:id`
- **Method**: `DELETE`
- **Auth**: Required
- **Success Response**: `200 OK` with a success message.

### Generate Billboard Image
Generate an image for a billboard using AI.

- **URL**: `/:id/generate-image`
- **Method**: `POST`
- **Auth**: Required
- **Body Parameters**:
    - `prompt` (String, Required): Prompt for AI image generation.
- **Success Response**: `200 OK` with the updated Billboard object containing the new image URL.
