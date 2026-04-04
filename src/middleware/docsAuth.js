import docsConfig from '../config/docs.js';
import { renderTemplate } from '../utils/templateRenderer.js';

/**
 * Documentation Authentication Middleware
 * Checks if the route is public or if the user is authenticated via password
 */
async function docsAuth(req, res, next) {
    // If no password is set, docs are public
    if (!docsConfig.password) {
        return next();
    }

    const path = req.originalUrl.split('?')[0];

    // Check if path is in public routes
    const isPublic = docsConfig.publicRoutes.some(route => {
        const cleanRoute = route.startsWith('/') ? route : `/docs/${route}`;
        return path === cleanRoute || path.startsWith(`${cleanRoute}/`);
    });

    if (isPublic) {
        return next();
    }

    // Check for authentication cookie
    const authCookie = req.cookies['docs_auth'];
    if (authCookie === docsConfig.password) {
        return next();
    }

    // If it's a POST request to the current path, it might be a login attempt
    if (req.method === 'POST') {
        return next(); // Let the controller handle login
    }

    // Not authenticated and not a public route, show login page
    try {
        const html = await renderTemplate('docs-login', {
            errorMessage: '',
            errorDisplay: 'none'
        });
        return res.send(html);
    } catch (error) {
        console.error('Error rendering login template:', error);
        return res.status(500).send('Internal Server Error');
    }
}

export default docsAuth;
