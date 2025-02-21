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
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const register = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const password = req.body.password;
        const salt = yield bcryptjs_1.default.genSalt(10);
        const hashedPassword = yield bcryptjs_1.default.hash(password, salt);
        const user = yield userModel_1.default.create({
            email: req.body.email,
            password: hashedPassword,
            refreshToken: []
        });
        res.status(200).send(user);
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
        const validPassword = yield bcryptjs_1.default.compare(req.body.password, user.password);
        if (!validPassword) {
            res.status(400).send('Wrong username or password');
            return;
        }
        if (!process.env.TOKEN_SECRET) {
            res.status(500).send('Server error');
            return;
        }
        // Set a very short expiration for testing purposes
        const accessToken = jsonwebtoken_1.default.sign({ _id: user._id }, process.env.TOKEN_SECRET, { expiresIn: process.env.TOKEN_EXPIRATION });
        const refreshToken = jsonwebtoken_1.default.sign({ _id: user._id }, process.env.TOKEN_SECRET, { expiresIn: process.env.REFRESH_TOKEN_EXPIRATION });
        user.refreshToken = user.refreshToken || [];
        user.refreshToken.push(refreshToken);
        yield user.save();
        if (user.refreshToken == null) {
            user.refreshToken = [];
        }
        user.refreshToken.push(refreshToken);
        yield user.save();
        res.status(200).json({
            email: user.email,
            _id: user._id,
            accessToken,
            refreshToken
        });
    }
    catch (error) {
        res.status(400).send(error);
    }
});
const refresh = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const { refreshToken } = req.body;
        if (!refreshToken) {
            res.status(401).send('Refresh token required');
            return;
        }
        if (!process.env.TOKEN_SECRET) {
            res.status(500).send('Server error');
            return;
        }
        const payload = jsonwebtoken_1.default.verify(refreshToken, process.env.TOKEN_SECRET);
        const user = yield userModel_1.default.findById(payload._id);
        if (!user || !((_a = user.refreshToken) === null || _a === void 0 ? void 0 : _a.includes(refreshToken))) {
            res.status(401).send('Invalid refresh token');
            return;
        }
        // Remove the used refresh token
        user.refreshToken = user.refreshToken.filter(token => token !== refreshToken);
        // Generate new tokens
        const accessToken = jsonwebtoken_1.default.sign({ _id: user._id }, process.env.TOKEN_SECRET, { expiresIn: '3s' } // Short expiration for testing
        );
        const newRefreshToken = jsonwebtoken_1.default.sign({ _id: user._id }, process.env.TOKEN_SECRET, { expiresIn: '7d' });
        // Save the new refresh token
        user.refreshToken.push(newRefreshToken);
        yield user.save();
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
        const { refreshToken } = req.body;
        if (!refreshToken) {
            res.status(400).send('Refresh token required');
            return;
        }
        const user = yield userModel_1.default.findOne({ refreshToken: refreshToken });
        if (!user) {
            res.status(200).send('Logged out successfully');
            return;
        }
        user.refreshToken = ((_a = user.refreshToken) === null || _a === void 0 ? void 0 : _a.filter(token => token !== refreshToken)) || [];
        yield user.save();
        res.status(200).send('Logged out successfully');
    }
    catch (error) {
        res.status(500).send('Server error');
    }
});
const authMiddleware = (req, res, next) => {
    console.log('Auth headers:', req.headers);
    const authorization = req.header('authorization');
    const token = authorization && authorization.split('JWT ')[1];
    if (!token) {
        console.log('No token found');
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
};
exports.authMiddleware = authMiddleware;
const controller = {
    register,
    login,
    refresh,
    logout
};
exports.default = controller;
//# sourceMappingURL=authController.js.map