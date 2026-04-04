class BaseAuthProvider {
    constructor() {}

    async verifyToken(token) {
        throw new Error("Method 'verifyToken' must be implemented");
    }

    async isAuthenticated(token) {
        throw new Error("Method 'isAuthenticated' must be implemented");
    }
}

export default BaseAuthProvider;
