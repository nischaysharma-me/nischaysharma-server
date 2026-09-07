# Posts and LinkedIn Publishing

The Posts feature supports short-form publishing independently from long-form articles. It combines a public feed, an admin studio, AI-assisted writing and image generation, and a LinkedIn distribution workflow.

## User-Facing Routes

- `/posts`: Public, paginated social feed of published posts.
- `/admin/posts`: Manage drafts, published posts, and archived posts.
- `/admin/posts/create`: Write manually or generate a new post draft with AI.
- `/admin/posts/:id`: Edit content, tags, status, image, and alt text; generate or regenerate an image.
- `/admin/posts/:id/post/linkedin`: Prepare and publish the selected post to LinkedIn.
- `/admin/articles/:id/post/linkedin`: Prepare a LinkedIn post grounded in a selected article.

## AI Post Workflow

1. Enter a topic, choose a tone, and optionally add instructions.
2. The server uses the editable `post.generate` Prompt Library template.
3. The generated result is saved as a draft so it can be reviewed and changed.
4. Optionally generate a 4:5 image during creation or from the editor. Image generation uses `post.image` and the current draft as source context.
5. Publish the post to the website feed, share it to LinkedIn, or do both independently.

AI generation does not publish automatically.

## LinkedIn Composer

The composer supports three formats:

- **Text**: A LinkedIn caption with optional source context.
- **Image**: An uploaded or AI-generated image plus caption.
- **Document/carousel**: Multiple slides, each optionally containing a generated or uploaded image, published as a LinkedIn document.

The bulk image action generates all missing images instead of requiring one request per slide. Article-based compositions pass the article content into generation so the caption, hero image, and slides stay aligned with the source.

Generated Firebase Storage URLs are downloaded by the server before upload to LinkedIn. This keeps the LinkedIn publishing flow independent of browser CORS rules.

If LinkedIn reports an expired access token, reconnect the integration from the admin settings before publishing again.

## Prompt Library Templates

The workflows use these editable templates:

- `post.generate`
- `post.image`
- `social.linkedin`
- `social.linkedin.rich`
- `social.linkedin.source-context`
- `social.linkedin.image`
- `social.linkedin.slide-image`

Defaults live in `prompts.example.json`. Runtime overrides live in the ignored `prompts.json` file and can be edited, previewed, reset, and reviewed through the Prompt Library admin page. The prompt catalog is served without stale caching so newly added templates appear immediately.

## Operational Notes

- Deploy the Firestore indexes included with the server before relying on indexed production queries.
- Keep image alt text meaningful for accessibility.
- LinkedIn OAuth requires `openid`, `profile`, `email`, and `w_member_social`.
- LinkedIn access tokens expire; reconnection is the recovery path when refresh is unavailable.
