"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const authController_1 = __importStar(require("../controllers/authController"));
const passport_1 = __importDefault(require("passport"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const router = express_1.default.Router();
/**
 * @swagger
 * tags:
 *   name: Authentication
 *   description: Endpoints for user authentication
 */
/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 example: "user@example.com"
 *               username:
 *                 type: string
 *                 example: "user123"
 *               password:
 *                 type: string
 *                 example: "securepassword"
 *     responses:
 *       201:
 *         description: User registered successfully
 *       400:
 *         description: Validation error
 */
router.post("/register", authController_1.default.register);
/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Log in a user
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 example: "user@example.com"
 *               password:
 *                 type: string
 *                 example: "securepassword"
 *     responses:
 *       200:
 *         description: User logged in successfully
 *       400:
 *         description: Invalid credentials
 */
router.post("/login", authController_1.default.login);
/**
 * @swagger
 * /auth/refresh:
 *   post:
 *     summary: Refresh a user's access token
 *     tags: [Authentication]
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               refreshToken:
 *                 type: string
 *                 example: "refresh-token"
 *     responses:
 *       200:
 *         description: Token refreshed successfully
 *       403:
 *         description: Invalid refresh token
 */
router.post("/refresh", authController_1.default.refresh);
/**
 * @swagger
 * /auth/logout:
 *   post:
 *     summary: Log out a user
 *     tags: [Authentication]
 *     responses:
 *       200:
 *         description: User logged out successfully
 */
router.post("/logout", authController_1.default.logout);
/**
 * @swagger
 * /auth/user:
 *   get:
 *     summary: Get current user info
 *     tags: [Authentication]
 *     responses:
 *       200:
 *         description: User information
 *       401:
 *         description: Not authenticated
 */
router.get("/user", authController_1.authMiddleware, authController_1.default.user);
/**
 * @swagger
 * /auth/google:
 *   get:
 *     summary: Authenticate with Google
 *     tags: [Authentication]
 *     responses:
 *       302:
 *         description: Redirects to Google authentication
 */
router.get("/google", passport_1.default.authenticate("google", {
    scope: ["profile", "email"]
}));
/**
 * @swagger
 * /auth/google/callback:
 *   get:
 *     summary: Google OAuth callback
 *     tags: [Authentication]
 *     responses:
 *       302:
 *         description: Redirects with authentication result
 */
router.get("/google/callback", passport_1.default.authenticate("google", {
    session: false,
    failureRedirect: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/login?error=Google%20authentication%20failed`
}), authController_1.default.googleCallback);
/**
 * @swagger
 * /auth/facebook:
 *   get:
 *     summary: Authenticate with Facebook
 *     tags: [Authentication]
 *     responses:
 *       302:
 *         description: Redirects to Facebook authentication
 */
router.get("/facebook", passport_1.default.authenticate("facebook", {
    scope: ["email", "public_profile"] // Added public_profile scope
}));
/**
 * @swagger
 * /auth/facebook/callback:
 *   get:
 *     summary: Facebook OAuth callback
 *     tags: [Authentication]
 *     responses:
 *       302:
 *         description: Redirects with authentication result
 */
router.get("/facebook/callback", passport_1.default.authenticate("facebook", {
    session: false,
    failureRedirect: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/login?error=Facebook%20authentication%20failed`
}), authController_1.default.facebookCallback);
// Add a debug endpoint for testing OAuth flow (only in development)
if (process.env.NODE_ENV !== 'production') {
    router.get('/debug-token', (req, res) => {
        try {
            if (!process.env.TOKEN_SECRET) {
                res.status(500).json({ message: 'Server error - No token secret' });
                return;
            }
            // Create a test user ID
            const testUserId = 'debug123456789';
            // Create a test token for debugging
            const accessToken = jsonwebtoken_1.default.sign({ _id: testUserId }, process.env.TOKEN_SECRET, { expiresIn: '15m' });
            // Redirect to frontend callback
            const redirectUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/oauth-success?accessToken=${encodeURIComponent(accessToken)}`;
            console.log(`Debug redirecting to: ${redirectUrl}`);
            res.redirect(redirectUrl);
        }
        catch (error) {
            console.error('Debug token error:', error);
            res.status(500).json({ message: 'Server error generating debug token' });
        }
    });
}
exports.default = router;
//# sourceMappingURL=authRoutes.js.map