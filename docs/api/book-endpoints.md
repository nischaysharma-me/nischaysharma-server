# Book API Endpoints

Base URL: `/api/v1/books`

Authentication: Bearer Token (Firebase ID Token) is required for all book management routes.

## Book Management

### Create Book
Create a new Threaded Book or Paper.

- **URL**: `/`
- **Method**: `POST`
- **Auth**: Required
- **Body Parameters**:
    - `title` (String, Optional): The title of the book. Default: "Untitled".
    - `description` (String, Optional): Summary.
    - `type` (String, Optional): `book` (multi-chapter) or `paper` (single-chapter). Default: `book`.
    - `threadId` (String, Optional): An existing conversational thread ID to link to this book.
- **Success Response**: `201 Created` with Book object.

### List Books
Get all books for the authenticated user.

- **URL**: `/`
- **Method**: `GET`
- **Auth**: Required
- **Success Response**: `200 OK` with Array of Book objects.

### Get Book Details
Retrieve metadata about a specific book (does not include nested pages).

- **URL**: `/:bookId`
- **Method**: `GET`
- **Auth**: Required
- **Success Response**: `200 OK` with Book object.

### Update Book Metadata
Update properties of an existing book.

- **URL**: `/:bookId`
- **Method**: `PATCH`
- **Auth**: Required
- **Body Parameters**:
    - `title` (String, Optional)
    - `description` (String, Optional)
    - `status` (String, Optional): `draft` or `published`.
    - `type` (String, Optional)
- **Success Response**: `200 OK` with updated Book object.

### Delete Book
Delete a book and all its associated chapters and pages.

- **URL**: `/:bookId`
- **Method**: `DELETE`
- **Auth**: Required
- **Success Response**: `200 OK` with success message.

## Page Management

### Get Full Book Hierarchy (Pages)
Retrieve the full nested hierarchy of a book, including its chapters and their correctly ordered pages.

- **URL**: `/:bookId/pages`
- **Method**: `GET`
- **Auth**: Required
- **Success Response**: `200 OK` with Book object containing a populated `chapters` array with `pages`.

### Update Page
Manually update an existing page's content or title.

- **URL**: `/:bookId/pages/:pageId`
- **Method**: `PATCH`
- **Auth**: Required
- **Body Parameters**:
    - `content` (String, Optional): Markdown or HTML content.
    - `status` (String, Optional)
- **Success Response**: `200 OK` with updated Page object.

### Delete Page
Delete a specific page from a book. The backend automatically handles removing the page ID from its parent chapter's order array.

- **URL**: `/:bookId/pages/:pageId`
- **Method**: `DELETE`
- **Auth**: Required
- **Success Response**: `200 OK` with success message.
