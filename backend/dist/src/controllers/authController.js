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
// Cookie options for storing refresh tokens
const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
};
const register = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email, username, password } = req.body;
        // Check if user already exists
        const userExists = yield userModel_1.default.findOne({ email });
        if (userExists) {
            res.status(400).send('User with this email already exists');
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
            res.status(500).send('Server error');
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
            _id: user._id,
            email: user.email,
            username: user.username,
            accessToken
        });
    }
    catch (error) {
        res.status(400).send(error);
    }
});
const login = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = yield userModel_1.default.findOne({ email: req.body.email });
        if (!user) {
            res.status(400).send('Wrong username or password');
            return;
        }
        // Verify password
        if (!user.matchPassword) {
            res.status(500).send('Server error');
            return;
        }
        const validPassword = yield user.matchPassword(req.body.password);
        if (!validPassword) {
            res.status(400).send('Wrong username or password');
            return;
        }
        if (!process.env.TOKEN_SECRET) {
            res.status(500).send('Server error');
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
            email: user.email,
            _id: user._id,
            username: user.username,
            accessToken
        });
    }
    catch (error) {
        res.status(400).send(error);
    }
});
const refresh = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        // Get refresh token from cookie or request body
        const refreshToken = req.cookies.refreshToken || req.body.refreshToken;
        if (!refreshToken) {
            res.status(401).send('Refresh token required');
            return;
        }
        if (!process.env.TOKEN_SECRET) {
            res.status(500).send('Server error');
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
            res.status(401).send('Invalid refresh token');
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
        res.status(401).send('Invalid refresh token');
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
        // Clear refresh token cookie
        res.clearCookie('refreshToken', cookieOptions);
        res.status(200).send('Logged out successfully');
    }
    catch (error) {
        res.status(500).send('Server error');
    }
});
// OAuth callback handlers
const googleCallback = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // User should be attached by passport middleware
        const user = req.user;
        if (!user || !user._id) {
            res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:3000'}/login?error=Authentication failed`);
            return;
        }
        if (!process.env.TOKEN_SECRET) {
            res.status(500).send('Server error');
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
        res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:3000'}/oauth-success?accessToken=${accessToken}`);
    }
    catch (error) {
        res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:3000'}/login?error=Authentication failed`);
    }
});
const facebookCallback = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // User should be attached by passport middleware
        const user = req.user;
        if (!user || !user._id) {
            res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:3000'}/login?error=Authentication failed`);
            return;
        }
        if (!process.env.TOKEN_SECRET) {
            res.status(500).send('Server error');
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
        res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:3000'}/oauth-success?accessToken=${accessToken}`);
    }
    catch (error) {
        res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:3000'}/login?error=Authentication failed`);
    }
});
// Updated auth middleware to support checking tokens from cookies
const authMiddleware = (req, res, next) => {
    try {
        // Check Authorization header first
        const authorization = req.header('authorization');
        let token = authorization && authorization.split('JWT ')[1];
        // If no token in header, check cookies
        if (!token && req.cookies.refreshToken) {
            // Attempt to get new access token using refresh token
            // This is optional and depends on your token strategy
            // In a real app, you might want to call the refresh endpoint instead
            if (!process.env.TOKEN_SECRET) {
                res.status(500).send('Server error');
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
            res.status(401).send('Access Denied');
            return;
        }
        if (!process.env.TOKEN_SECRET) {
            res.status(500).send('Server error');
            return;
        }
        jsonwebtoken_1.default.verify(token, process.env.TOKEN_SECRET, (error, payload) => {
            if (error) {
                res.status(401).send('Access Denied');
                return;
            }
            req.body.userId = payload._id;
            next();
        });
    }
    catch (error) {
        res.status(401).send('Access Denied');
    }
};
exports.authMiddleware = authMiddleware;
const controller = {
    register,
    login,
    refresh,
    logout,
    googleCallback,
    facebookCallback
};
exports.default = controller;
//# sourceMappingURL=authController.js.map