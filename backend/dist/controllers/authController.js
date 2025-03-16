"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authMiddleware = void 0;
const userModel_1 = __importDefault(require("../models/userModel"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
// Cookie options with explicit typing
const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
};
// Options for clearing cookies (without maxAge)
const clearCookieOptions = {
    httpOnly: cookieOptions.httpOnly,
    secure: cookieOptions.secure,
    sameSite: cookieOptions.sameSite
};
const register = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email, username, password } = req.body;
        // Check if user already exists
        const userExists = yield userModel_1.default.findOne({ email });
        if (userExists) {
            res.status(400).json({ message: 'User with this email already exists' });
            return;
        }
        // Create new user
        const user = yield userModel_1.default.create({
            email,
            username,
            password,
            refreshToken: []
        });
        // Generate access token
        if (!process.env.TOKEN_SECRET) {
            res.status(500).json({ message: 'Server error' });
            return;
        }
        const accessToken = jsonwebtoken_1.default.sign({ _id: user._id }, process.env.TOKEN_SECRET, { expiresIn: process.env.TOKEN_EXPIRATION || '15m' });
        // Generate refresh token
        const refreshToken = jsonwebtoken_1.default.sign({ _id: user._id }, process.env.TOKEN_SECRET, { expiresIn: process.env.REFRESH_TOKEN_EXPIRATION || '7d' });
        // Save refresh token to user
        user.refreshToken = [refreshToken];
        yield user.save();
        // Set refresh token as httpOnly cookie
        res.cookie('refreshToken', refreshToken, cookieOptions);
        res.status(201).json({
            user: {
                _id: user._id,
                email: user.email,
                username: user.username
            },
            accessToken
        });
    }
    catch (error) {
        console.error('Registration error:', error);
        res.status(400).json({ message: 'Registration failed', error });
    }
});
const login = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = yield userModel_1.default.findOne({ email: req.body.email });
        if (!user) {
            res.status(400).json({ message: 'Wrong username or password' });
            return;
        }
        // Verify password
        if (!user.matchPassword) {
            res.status(500).json({ message: 'Server error' });
            return;
        }
        const validPassword = yield user.matchPassword(req.body.password);
        if (!validPassword) {
            res.status(400).json({ message: 'Wrong username or password' });
            return;
        }
        if (!process.env.TOKEN_SECRET) {
            res.status(500).json({ message: 'Server error' });
            return;
        }
        // Generate access token
        const accessToken = jsonwebtoken_1.default.sign({ _id: user._id }, process.env.TOKEN_SECRET, { expiresIn: process.env.TOKEN_EXPIRATION || '15m' });
        // Generate refresh token
        const refreshToken = jsonwebtoken_1.default.sign({ _id: user._id }, process.env.TOKEN_SECRET, { expiresIn: process.env.REFRESH_TOKEN_EXPIRATION || '7d' });
        // Save refresh token to user
        user.refreshToken = user.refreshToken || [];
        user.refreshToken.push(refreshToken);
        yield user.save();
        // Set refresh token as httpOnly cookie
        res.cookie('refreshToken', refreshToken, cookieOptions);
        res.status(200).json({
            user: {
                _id: user._id,
                email: user.email,
                username: user.username
            },
            accessToken
        });
    }
    catch (error) {
        console.error('Login error:', error);
        res.status(400).json({ message: 'Login failed', error });
    }
});
const updateProfile = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Get user ID from middleware
        const userId = req.body.userId;
        if (!userId) {
            res.status(401).json({ message: 'Not authenticated' });
            return;
        }
        // Find user
        const user = yield userModel_1.default.findById(userId);
        if (!user) {
            res.status(404).json({ message: 'User not found' });
            return;
        }
        // Fields that can be updated
        const allowedUpdates = ['username', 'bio', 'fullName', 'profileImage'];
        // Update only allowed fields
        for (const field of allowedUpdates) {
            if (req.body[field] !== undefined) {
                // @ts-expect-error - we've already checked that the field is valid
                user[field] = req.body[field];
            }
        }
        // Save the updated user
        yield user.save();
        // Return user without sensitive info
        res.status(200).json({
            _id: user._id,
            email: user.email,
            username: user.username,
            bio: user.bio,
            fullName: user.fullName,
            profileImage: user.profileImage
        });
    }
    catch (error) {
        console.error('Profile update error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});
const refresh = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        // Get refresh token from cookie or request body
        const refreshToken = req.cookies.refreshToken || req.body.refreshToken;
        if (!refreshToken) {
            res.status(401).json({ message: 'Refresh token required' });
            return;
        }
        if (!process.env.TOKEN_SECRET) {
            res.status(500).json({ message: 'Server error' });
            return;
        }
        // Verify refresh token
        const payload = jsonwebtoken_1.default.verify(refreshToken, process.env.TOKEN_SECRET);
        // Find user with this refresh token
        const user = yield userModel_1.default.findOne({
            _id: payload._id,
            refreshToken: refreshToken
        });
        if (!user) {
            res.status(401).json({ message: 'Invalid refresh token' });
            return;
        }
        // Remove used refresh token
        user.refreshToken = ((_a = user.refreshToken) === null || _a === void 0 ? void 0 : _a.filter(token => token !== refreshToken)) || [];
        // Generate new tokens
        const accessToken = jsonwebtoken_1.default.sign({ _id: user._id }, process.env.TOKEN_SECRET, { expiresIn: process.env.TOKEN_EXPIRATION || '15m' });
        const newRefreshToken = jsonwebtoken_1.default.sign({ _id: user._id }, process.env.TOKEN_SECRET, { expiresIn: process.env.REFRESH_TOKEN_EXPIRATION || '7d' });
        // Save new refresh token
        user.refreshToken.push(newRefreshToken);
        yield user.save();
        // Set new refresh token as cookie
        res.cookie('refreshToken', newRefreshToken, cookieOptions);
        res.status(200).json({
            accessToken,
            refreshToken: newRefreshToken
        });
    }
    catch (error) {
        console.error('Token refresh error:', error);
        res.status(401).json({ message: 'Invalid refresh token' });
    }
});
const logout = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        // Get refresh token from cookie or request body
        const refreshToken = req.cookies.refreshToken || req.body.refreshToken;
        if (refreshToken) {
            // Find user and remove refresh token
            const user = yield userModel_1.default.findOne({ refreshToken: refreshToken });
            if (user) {
                user.refreshToken = ((_a = user.refreshToken) === null || _a === void 0 ? void 0 : _a.filter(token => token !== refreshToken)) || [];
                yield user.save();
            }
        }
        // Clear refresh token cookie using clearCookieOptions without maxAge
        res.clearCookie('refreshToken', clearCookieOptions);
        res.status(200).json({ message: 'Logged out successfully' });
    }
    catch (error) {
        console.error('Logout error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});
// Get user info endpoint
const user = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Get user ID from middleware
        const userId = req.body.userId;
        if (!userId) {
            res.status(401).json({ message: 'Not authenticated' });
            return;
        }
        // Find user
        const user = yield userModel_1.default.findById(userId).select('-password -refreshToken');
        if (!user) {
            res.status(404).json({ message: 'User not found' });
            return;
        }
        res.status(200).json(user);
    }
    catch (error) {
        console.error('User fetch error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});
// OAuth callback handlers
const googleCallback = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // User should be attached by passport middleware
        const user = req.user;
        if (!user || !user._id) {
            res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:3000'}/login?error=Authentication%20failed`);
            return;
        }
        if (!process.env.TOKEN_SECRET) {
            res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:3000'}/login?error=Server%20error`);
            return;
        }
        // Generate tokens
        const accessToken = jsonwebtoken_1.default.sign({ _id: user._id }, process.env.TOKEN_SECRET, { expiresIn: process.env.TOKEN_EXPIRATION || '15m' });
        const refreshToken = jsonwebtoken_1.default.sign({ _id: user._id }, process.env.TOKEN_SECRET, { expiresIn: process.env.REFRESH_TOKEN_EXPIRATION || '7d' });
        // Save refresh token
        user.refreshToken = user.refreshToken || [];
        user.refreshToken.push(refreshToken);
        yield user.save();
        // Set refresh token cookie
        res.cookie('refreshToken', refreshToken, cookieOptions);
        // Redirect to frontend with access token
        const redirectUrl = encodeURI(`${process.env.FRONTEND_URL || 'http://localhost:3000'}/oauth-success?accessToken=${accessToken}`);
        res.redirect(redirectUrl);
    }
    catch (error) {
        console.error('Google callback error:', error);
        res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:3000'}/login?error=Authentication%20failed`);
    }
});
const facebookCallback = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // User should be attached by passport middleware
        const user = req.user;
        if (!user || !user._id) {
            res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:3000'}/login?error=Authentication%20failed`);
            return;
        }
        if (!process.env.TOKEN_SECRET) {
            res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:3000'}/login?error=Server%20error`);
            return;
        }
        // Generate tokens
        const accessToken = jsonwebtoken_1.default.sign({ _id: user._id }, process.env.TOKEN_SECRET, { expiresIn: process.env.TOKEN_EXPIRATION || '15m' });
        const refreshToken = jsonwebtoken_1.default.sign({ _id: user._id }, process.env.TOKEN_SECRET, { expiresIn: process.env.REFRESH_TOKEN_EXPIRATION || '7d' });
        // Save refresh token
        user.refreshToken = user.refreshToken || [];
        user.refreshToken.push(refreshToken);
        yield user.save();
        // Set refresh token cookie
        res.cookie('refreshToken', refreshToken, cookieOptions);
        // Redirect to frontend with access token
        const redirectUrl = encodeURI(`${process.env.FRONTEND_URL || 'http://localhost:3000'}/oauth-success?accessToken=${accessToken}`);
        res.redirect(redirectUrl);
    }
    catch (error) {
        console.error('Facebook callback error:', error);
        res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:3000'}/login?error=Authentication%20failed`);
    }
});
const authMiddleware = (req, res, next) => {
    try {
        // Check Authorization header first
        const authorization = req.header('authorization');
        let token = null;
        if (authorization) {
            // Support both "Bearer" and "JWT" prefixes
            if (authorization.startsWith('Bearer ')) {
                token = authorization.split('Bearer ')[1];
            }
            else if (authorization.startsWith('JWT ')) {
                token = authorization.split('JWT ')[1];
            }
        }
        // If no token in header, check cookies
        if (!token && req.cookies.refreshToken) {
            // Attempt to get new access token using refresh token
            if (!process.env.TOKEN_SECRET) {
                res.status(500).json({ message: 'Server error' });
                return;
            }
            try {
                const payload = jsonwebtoken_1.default.verify(req.cookies.refreshToken, process.env.TOKEN_SECRET);
                req.body.userId = payload._id;
                next();
                return;
            }
            catch (err) {
                // Continue with normal flow if refresh token is invalid
            }
        }
        if (!token) {
            res.status(401).json({ message: 'Access Denied' });
            return;
        }
        if (!process.env.TOKEN_SECRET) {
            res.status(500).json({ message: 'Server error' });
            return;
        }
        jsonwebtoken_1.default.verify(token, process.env.TOKEN_SECRET, (error, payload) => {
            if (error) {
                res.status(401).json({ message: 'Access Denied - Invalid token' });
                return;
            }
            req.body.userId = payload._id;
            next();
        });
    }
    catch (error) {
        console.error('Auth middleware error:', error);
        res.status(401).json({ message: 'Access Denied' });
    }
};
exports.authMiddleware = authMiddleware;
const controller = {
    register,
    login,
    refresh,
    logout,
    googleCallback,
    facebookCallback,
    user,
    updateProfile
};
exports.default = controller;
//# sourceMappingURL=authController.js.map