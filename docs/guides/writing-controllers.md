# How to Create a Controller

Controllers are the **Traffic Police**. They handle the HTTP request, ask services to do the work, and then send back the response.

## Responsibilities

1.  **Parse Request**: Get data from `req.body`, `req.params`, or `req.query`.
2.  **Call Services**: Orchestrate the business logic.
3.  **Handle Responses**: Send JSON with status codes (`200`, `201`, `400`, `500`).

## Example: Blog Controller

Create `src/controllers/blogController.js`.

```javascript
import * as blogService from '../services/blogService.js';

/**
 * Handle create post request
 */
const createPost = async (req, res) => {
    try {
        // Data comes from middleware (already validated by Joi!)
        const blogData = req.body;
        const authorId = req.user.uid; // From auth middleware

        // Call Service
        const newPost = await blogService.createPost({ 
            ...blogData, 
            authorId 
        });

        // Send Success
        res.status(201).json({
            success: true,
            data: newPost
        });

    } catch (error) {
        // Handle Errors
        console.error(error);
        res.status(400).json({
            success: false,
            error: error.message
        });
    }
};

export {
    createPost
};
```

## Best Practices

-   **Keep it Thin**: Controllers shouldn't have complex logic. If you find yourself writing `if` statements about business rules, move it to a Service.
-   **Standard Responses**: Always wrap data in `{ success: true, data: ... }`.
-   **Error Handling**: Always use `try/catch` blocks.
