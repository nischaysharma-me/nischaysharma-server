/**
 * Documentation Configuration
 * 
 * Configure documentation viewer settings including public routes
 */

export default {
    // Password for protected documentation
    // Set via DOCS_PASSWORD environment variable
    password: process.env.DOCS_PASSWORD || null,

    // Public routes that don't require authentication
    // Add route paths here to make them publicly accessible
    publicRoutes: [
        // Examples (uncomment to enable):
        '/docs',
        // 'guides/quick-start',
        // 'api/endpoints',
        // 'guides',  // Makes entire guides section public
        // 'api',     // Makes entire api section public
        // '/docs/structure/TAUGHTCODE_DEVELOPER_DOCUMENTATION',
    ],

    // Session configuration
    session: {
        maxAge: 24 * 60 * 60 * 1000, // 24 hours in milliseconds
        httpOnly: true,
        sameSite: 'strict'
    }
};

