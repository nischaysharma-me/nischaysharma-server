import BaseAuthProvider from "../base.js"
import { admin } from "../../../config/firebase.js"

class FirebaseAuthProvider extends BaseAuthProvider {
    constructor() {
        super()
    }

    async verifyToken(token) {
        try {
            const decodedToken = await admin.auth().verifyIdToken(token)
            return decodedToken
        } catch (error) {
            throw new Error("Invalid token")
        }
    }

    async isAuthenticated(token) {
        try {
            await admin.auth().verifyIdToken(token)
            return true
        } catch (error) {
            return false
        }
    }
}

export default FirebaseAuthProvider

