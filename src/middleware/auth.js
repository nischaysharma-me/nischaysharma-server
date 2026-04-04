import { getUserByToken, verifyAuth } from '../services/authService.js'
import apiKeyAuth from './apiKeyAuth.js';
import { getClientAppByUrl } from '../services/clientAppService.js';
import { CLIENT_PERMISSIONS } from '../config/permissions.js';

/**
 * Enhanced authentication middleware supporting both Bearer tokens and API Keys
 */
async function isAuthenticated(req, res, next) {
    // 1. Check if already authenticated by API Key (if mounted before this)
    if (req.authType === 'apikey') {
        return next();
    }

    // 2. Check Client Application Origin & Permissions
    const origin = req.headers.origin || req.headers.referer;
    if (origin) {
        try {
            const originUrl = origin.startsWith('http') ? new URL(origin).origin : origin;
            const clientApp = await getClientAppByUrl(originUrl);
            
            if (clientApp) {
                // Determine if any of the client's granted permissions unlock this route/method
                const hasPermission = clientApp.permissions.some(permKey => {
                    const config = CLIENT_PERMISSIONS[permKey];
                    if (!config) return false;
                    
                    return config.routes.some(route => {
                        // Very simple path matching. 
                        // Note: For complex paths with params (like /articles/:slug), 
                        // we might need a more robust matcher, but this covers the basics.
                        const regexPath = route.path.replace(/:[^\/]+/g, '[^/]+');
                        const fullRegex = new RegExp(`^${regexPath}$`);
                        
                        // We check against req.path (which is relative to the router mount) 
                        // but the config has paths like /articles. 
                        // Since we are mounted under /api/v1, we need to be careful.
                        // For now, assume config paths are relative to base if they don't start with /api/v1
                        const normalizedReqPath = req.path.startsWith('/api/v1') ? req.path : `/api/v1${req.path}`;
                        const normalizedConfigPath = route.path.startsWith('/api/v1') ? route.path : `/api/v1${route.path}`;
                        
                        const configRegex = new RegExp(`^${normalizedConfigPath.replace(/:[^\/]+/g, '[^/]+')}$`);
                        
                        return route.method === req.method && configRegex.test(normalizedReqPath);
                    });
                });

                if (hasPermission) {
                    req.clientAppId = clientApp.id;
                    req.authType = 'client_whitelist';
                    req.user = {
                        id: `system_client_${clientApp.id}`,
                        isSystem: true,
                        role: 'client'
                    };
                    return next();
                }
            }
        } catch (e) {
            // Proceed to token auth
        }
    }

    // 3. Otherwise, attempt API Key auth directly (if not mounted separately)
    await apiKeyAuth(req, res, () => { });
    if (req.authType === 'apikey') {
        return next();
    }

    // 4. Fallback to Firebase Token Authentication
    try {
        const token = extractToken(req)

        if (!token) {
            return res.status(401).json({
                success: false,
                error: 'No authentication provided (Bearer token or x-api-key required)'
            })
        }

        const isValid = await verifyAuth(token)

        if (!isValid) {
            return res.status(401).json({
                success: false,
                error: 'Invalid or expired token'
            })
        }

        const user = await getUserByToken(token)
        req.user = user
        req.authType = 'token';

        next()
    } catch (error) {
        return res.status(401).json({
            success: false,
            error: 'Authentication failed'
        })
    }
}

/**
 * Optional Authentication - Sets req.user if valid token provided, otherwise proceeds as guest
 */
async function optionalAuth(req, res, next) {
    try {
        const token = extractToken(req)

        if (!token) {
            return next(); // Guest
        }

        const isValid = await verifyAuth(token)

        if (isValid) {
            const user = await getUserByToken(token)
            req.user = user
            req.authType = 'token';
        }
        // If invalid token, we could either error or treat as guest. 
        // Let's treat as guest to avoid blocking public content due to stale tokens, 
        // but logging it might be good. For now, just proceed.
        
        next()
    } catch (error) {
        // If verification fails, proceed as guest
        next()
    }
}

function extractToken(req) {
    if (req.headers.authorization) {
        const parts = req.headers.authorization.split(' ')
        if (parts.length === 2 && parts[0] === 'Bearer') {
            return parts[1]
        }
    }

    if (req.cookies && req.cookies.token) {
        return req.cookies.token
    }

    return null
}

export { isAuthenticated, optionalAuth }