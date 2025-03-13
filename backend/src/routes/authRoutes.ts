import express from "express";
import authController, { authMiddleware } from "../controllers/authController";
import passport from "passport";
import jwt from 'jsonwebtoken';

const router = express.Router();

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
router.post("/register", authController.register);

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
router.post("/login", authController.login);

/**
 * @swagger
 * /auth/profile:
 *   put:
 *     summary: Update user profile
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *               bio:
 *                 type: string
 *               fullName:
 *                 type: string
 *               profileImage:
 *                 type: string
 *     responses:
 *       200:
 *         description: Profile updated successfully
 *       401:
 *         description: Not authenticated
 *       404:
 *         description: User not found
 */
router.put("/profile", authMiddleware, authController.updateProfile);

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
router.post("/refresh", authController.refresh);

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
router.post("/logout", authController.logout);

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
router.get("/user", authMiddleware, authController.user);

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
router.get("/google", passport.authenticate("google", { 
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
router.get(
    "/google/callback",
    passport.authenticate("google", { 
        session: false,
        failureRedirect: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/login?error=Google%20authentication%20failed` 
    }),
    authController.googleCallback
);

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
router.get("/facebook", passport.authenticate("facebook", { 
    scope: ["email", "public_profile"]  // Added public_profile scope
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
router.get(
    "/facebook/callback",
    passport.authenticate("facebook", { 
        session: false,
        failureRedirect: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/login?error=Facebook%20authentication%20failed` 
    }),
    authController.facebookCallback
);

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
            const accessToken = jwt.sign(
                { _id: testUserId },
                process.env.TOKEN_SECRET,
                { expiresIn: '15m' }
            );
            
            // Redirect to frontend callback
            const redirectUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/oauth-success?accessToken=${encodeURIComponent(accessToken)}`;
            console.log(`Debug redirecting to: ${redirectUrl}`);
            res.redirect(redirectUrl);
        } catch (error) {
            console.error('Debug token error:', error);
            res.status(500).json({ message: 'Server error generating debug token' });
        }
    });
}

export default router;