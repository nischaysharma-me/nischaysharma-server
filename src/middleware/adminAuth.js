/**
 * Admin Authorization Middleware
 * Ensures the authenticated user has the 'admin' role
 */
export default async function adminAuth(req, res, next) {
    if (!req.user) {
        return res.status(401).json({
            success: false,
            message: 'Unauthorized: No user found in request'
        });
    }

    if (req.user.role !== 'admin') {
        return res.status(403).json({
            success: false,
            message: 'Forbidden: Admin access required'
        });
    }

    next();
}
