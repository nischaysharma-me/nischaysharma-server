import * as docsService from '../services/docsService.js';
import { renderDocPage, renderTemplate } from '../utils/templateRenderer.js';
import docsConfig from '../config/docs.js';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DOCS_DIR = path.join(__dirname, '../../docs');

/**
 * Documentation Controller
 * Thin controller that delegates to service layer
 */

/**
 * Helper to check if JSON is requested
 */
function isJsonRequest(req) {
    return req.xhr || 
           (req.headers.accept && req.headers.accept.indexOf('json') > -1) ||
           req.path.startsWith('/api') ||
           req.originalUrl.includes('/api/v1/docs');
}

/**
 * Get documentation file
 * GET /docs/:path(*)
 */
async function getDoc(req, res) {
    // Handle Login POST
    if (req.method === 'POST') {
        return handleLogin(req, res);
    }

    try {
        // Extract path from request (Express 5 regex route or standard params)
        let routePath = req.params.path || req.params[0] || req.path;
        routePath = routePath.replace(/^\/+/, '').replace(/\/+$/, '').replace(/^docs\//, '');

        // Check for refresh parameter (allow manual refresh via ?refresh=true)
        const forceRefresh = req.query.refresh === 'true';

        // Get documentation content from service (always fresh, no cache)
        const docData = await docsService.getDocContent(routePath);

        // Get navigation structure (with optional refresh)
        const navigation = await docsService.getNavigationStructure(forceRefresh);

        if (isJsonRequest(req)) {
            // Fetch raw markdown for frontend rendering
            let rawMarkdown = '';
            try {
                const filePath = path.join(DOCS_DIR, `${routePath}.md`);
                rawMarkdown = await fs.readFile(filePath, 'utf-8');
            } catch (e) {
                // If it's a directory or missing, leave empty
            }

            return res.json({
                success: true,
                data: {
                    ...docData,
                    markdown: rawMarkdown,
                    navigation
                }
            });
        }

        // Render page using template
        const html = await renderDocPage({
            title: docData.title,
            content: docData.content,
            currentPath: `/docs/${routePath}`,
            navigation
        });

        res.send(html);
    } catch (error) {
        console.error('Error serving documentation:', error);

        if (error.message === 'File not found') {
            if (isJsonRequest(req)) {
                return res.status(404).json({ success: false, error: 'Documentation not found' });
            }
            return res.status(404).send(await get404Page());
        }

        if (error.message === 'Access denied') {
            return res.status(403).json({
                success: false,
                error: 'Access denied'
            });
        }

        if (isJsonRequest(req)) {
            return res.status(500).json({ success: false, error: 'Internal server error' });
        }

        res.status(500).json({
            success: false,
            error: 'Internal server error'
        });
    }
}

/**
 * List all documentation files
 * GET /docs
 */
async function listDocs(req, res) {
    // Handle Login POST
    if (req.method === 'POST') {
        return handleLogin(req, res);
    }

    try {
        // Check for refresh parameter (allow manual refresh via ?refresh=true)
        const forceRefresh = req.query.refresh === 'true';

        // Get index data from service (now async)
        const indexData = await docsService.getIndexData();

        // Get navigation structure (with optional refresh)
        const navigation = await docsService.getNavigationStructure(forceRefresh);

        if (isJsonRequest(req)) {
            return res.json({
                success: true,
                data: {
                    ...indexData,
                    navigation
                }
            });
        }

        // Render page using template
        const html = await renderDocPage({
            title: indexData.title,
            content: indexData.content,
            currentPath: '/docs',
            navigation
        });

        res.send(html);
    } catch (error) {
        console.error('Error listing documentation:', error);
        
        if (isJsonRequest(req)) {
            return res.status(500).json({ success: false, error: 'Internal server error' });
        }

        res.status(500).json({
            success: false,
            error: 'Internal server error'
        });
    }
}

/**
 * Handle documentation login
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 */
async function handleLogin(req, res) {
    const { password } = req.body;

    if (password === docsConfig.password) {
        // Set authentication cookie
        res.cookie('docs_auth', password, docsConfig.session);
        
        // If it's an AJAX request (from our template), send success
        if (req.xhr || req.headers.accept.indexOf('json') > -1) {
            return res.json({ success: true });
        }
        
        // Otherwise redirect back
        return res.redirect(req.originalUrl);
    }

    // Invalid password
    if (req.xhr || req.headers.accept.indexOf('json') > -1) {
        return res.status(401).json({ success: false, error: 'Invalid password' });
    }

    // Render login page with error
    const html = await renderTemplate('docs-login', {
        errorMessage: 'Invalid password. Please try again.',
        errorDisplay: 'block'
    });
    res.status(401).send(html);
}

/**
 * Get 404 page
 * @returns {Promise<string>} 404 HTML page
 */
async function get404Page() {
    const navigation = await docsService.getNavigationStructure();

    return await renderDocPage({
        title: 'Page Not Found',
        content: `
      <h1>404 - Page Not Found</h1>
      <p>The documentation page you're looking for doesn't exist.</p>
      <p><a href="/docs">Go to Documentation Index</a></p>
    `,
        currentPath: '',
        navigation
    });
}

export {
    getDoc,
    listDocs
};
