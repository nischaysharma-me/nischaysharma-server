import { AuthProvider } from '../providers/auth/registry.js'
import { admin } from '../config/firebase.js'
import { User } from '../models/index.js'
const auth = AuthProvider('firebase')

async function getUserByToken(token) {
    const decodedToken = await auth.verifyToken(token)
    const userRecord = await admin.auth().getUser(decodedToken.uid)

    // Fetch profile data for RBAC
    // User profile is linked by 'uid' field
    const profile = await User.findOne({ uid: userRecord.uid })

    return {
        id: userRecord.uid, // Use id for consistency
        uid: userRecord.uid,
        email: userRecord.email,
        displayName: userRecord.displayName || profile?.displayName,
        photoURL: userRecord.photoURL || profile?.photoURL || null,
        organizationId: profile?.organizationId || null,
        role: profile?.role || 'user',
        active: profile?.status === 'active', // Map status enum to boolean if needed, or just return status
        preferences: profile?.preferences || { theme: 'dark', notifications: true, language: 'en' },
        metadata: {
            creationTime: userRecord.metadata.creationTime,
            lastSignInTime: userRecord.metadata.lastSignInTime
        }
    }
}

async function verifyAuth(token) {
    return await auth.isAuthenticated(token)
}

export {
    getUserByToken,
    verifyAuth
}