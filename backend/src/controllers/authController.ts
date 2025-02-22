import { NextFunction, Request, Response } from 'express';
import userModel from '../models/userModel';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

export type AuthController = {
    register: (req: Request, res: Response) => Promise<void>;
    login: (req: Request, res: Response) => Promise<void>;
    refresh: (req: Request, res: Response) => Promise<void>;
    logout: (req: Request, res: Response) => Promise<void>;
    googleCallback: (req: Request, res: Response) => Promise<void>;
    facebookCallback: (req: Request, res: Response) => Promise<void>;
};

// Cookie options for storing refresh tokens
const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict' as const,
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
};

const register = async (req: Request, res: Response): Promise<void> => {
    try {
        const { email, username, password } = req.body;
        
        // Check if user already exists
        const userExists = await userModel.findOne({ email });
        if (userExists) {
            res.status(400).send('User with this email already exists');
            return;
        }
        
        // Create new user
        const user = await userModel.create({
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

        const accessToken = jwt.sign(
            { _id: user._id },
            process.env.TOKEN_SECRET,
            { expiresIn: process.env.TOKEN_EXPIRATION || '15m' }
        );

        // Generate refresh token
        const refreshToken = jwt.sign(
            { _id: user._id },
            process.env.TOKEN_SECRET,
            { expiresIn: process.env.REFRESH_TOKEN_EXPIRATION || '7d' }
        );

        // Save refresh token to user
        user.refreshToken = [refreshToken];
        await user.save();

        // Set refresh token as httpOnly cookie
        res.cookie('refreshToken', refreshToken, cookieOptions);

        res.status(201).json({
            _id: user._id,
            email: user.email,
            username: user.username,
            accessToken
        });
    } catch (error) {
        res.status(400).send(error);
    }
};

const login = async (req: Request, res: Response): Promise<void> => {
    try {
        const user = await userModel.findOne({ email: req.body.email });
        if (!user) {
            res.status(400).send('Wrong username or password');
            return;
        }

        // Verify password
        if (!user.matchPassword) {
            res.status(500).send('Server error');
            return;
        }
        
        const validPassword = await user.matchPassword(req.body.password);
        if (!validPassword) {
            res.status(400).send('Wrong username or password');
            return;
        }

        if (!process.env.TOKEN_SECRET) {
            res.status(500).send('Server error');
            return;
        }

        // Generate access token
        const accessToken = jwt.sign(
            { _id: user._id },
            process.env.TOKEN_SECRET,
            { expiresIn: process.env.TOKEN_EXPIRATION || '15m' }
        );

        // Generate refresh token
        const refreshToken = jwt.sign(
            { _id: user._id },
            process.env.TOKEN_SECRET,
            { expiresIn: process.env.REFRESH_TOKEN_EXPIRATION || '7d' }
        );

        // Save refresh token to user
        user.refreshToken = user.refreshToken || [];
        user.refreshToken.push(refreshToken);
        await user.save();

        // Set refresh token as httpOnly cookie
        res.cookie('refreshToken', refreshToken, cookieOptions);

        res.status(200).json({
            email: user.email,
            _id: user._id,
            username: user.username,
            accessToken
        });
    } catch (error) {
        res.status(400).send(error);
    }
};

const refresh = async (req: Request, res: Response): Promise<void> => {
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
        const payload = jwt.verify(refreshToken, process.env.TOKEN_SECRET) as { _id: string };
        
        // Find user with this refresh token
        const user = await userModel.findOne({ 
            _id: payload._id,
            refreshToken: refreshToken 
        });

        if (!user) {
            res.status(401).send('Invalid refresh token');
            return;
        }

        // Remove used refresh token
        user.refreshToken = user.refreshToken?.filter(token => token !== refreshToken) || [];

        // Generate new tokens
        const accessToken = jwt.sign(
            { _id: user._id },
            process.env.TOKEN_SECRET,
            { expiresIn: process.env.TOKEN_EXPIRATION || '15m' }
        );

        const newRefreshToken = jwt.sign(
            { _id: user._id },
            process.env.TOKEN_SECRET,
            { expiresIn: process.env.REFRESH_TOKEN_EXPIRATION || '7d' }
        );

        // Save new refresh token
        user.refreshToken.push(newRefreshToken);
        await user.save();

        // Set new refresh token as cookie
        res.cookie('refreshToken', newRefreshToken, cookieOptions);

        res.status(200).json({
            accessToken,
            refreshToken: newRefreshToken
        });
    } catch (error) {
        res.status(401).send('Invalid refresh token');
    }
};

const logout = async (req: Request, res: Response): Promise<void> => {
    try {
        // Get refresh token from cookie or request body
        const refreshToken = req.cookies.refreshToken || req.body.refreshToken;
        
        if (refreshToken) {
            // Find user and remove refresh token
            const user = await userModel.findOne({ refreshToken: refreshToken });
            if (user) {
                user.refreshToken = user.refreshToken?.filter(token => token !== refreshToken) || [];
                await user.save();
            }
        }

        // Clear refresh token cookie
        res.clearCookie('refreshToken', cookieOptions);
        
        res.status(200).send('Logged out successfully');
    } catch (error) {
        res.status(500).send('Server error');
    }
};

// OAuth callback handlers
const googleCallback = async (req: Request, res: Response): Promise<void> => {
    try {
        // User should be attached by passport middleware
        const user = req.user as any;
        
        if (!user || !user._id) {
            res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:3000'}/login?error=Authentication failed`);
            return;
        }

        if (!process.env.TOKEN_SECRET) {
            res.status(500).send('Server error');
            return;
        }

        // Generate tokens
        const accessToken = jwt.sign(
            { _id: user._id },
            process.env.TOKEN_SECRET,
            { expiresIn: process.env.TOKEN_EXPIRATION || '15m' }
        );

        const refreshToken = jwt.sign(
            { _id: user._id },
            process.env.TOKEN_SECRET,
            { expiresIn: process.env.REFRESH_TOKEN_EXPIRATION || '7d' }
        );

        // Save refresh token
        user.refreshToken = user.refreshToken || [];
        user.refreshToken.push(refreshToken);
        await user.save();

        // Set refresh token cookie
        res.cookie('refreshToken', refreshToken, cookieOptions);

        // Redirect to frontend with access token
        res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:3000'}/oauth-success?accessToken=${accessToken}`);
    } catch (error) {
        res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:3000'}/login?error=Authentication failed`);
    }
};

const facebookCallback = async (req: Request, res: Response): Promise<void> => {
    try {
        // User should be attached by passport middleware
        const user = req.user as any;
        
        if (!user || !user._id) {
            res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:3000'}/login?error=Authentication failed`);
            return;
        }

        if (!process.env.TOKEN_SECRET) {
            res.status(500).send('Server error');
            return;
        }

        // Generate tokens
        const accessToken = jwt.sign(
            { _id: user._id },
            process.env.TOKEN_SECRET,
            { expiresIn: process.env.TOKEN_EXPIRATION || '15m' }
        );

        const refreshToken = jwt.sign(
            { _id: user._id },
            process.env.TOKEN_SECRET,
            { expiresIn: process.env.REFRESH_TOKEN_EXPIRATION || '7d' }
        );

        // Save refresh token
        user.refreshToken = user.refreshToken || [];
        user.refreshToken.push(refreshToken);
        await user.save();

        // Set refresh token cookie
        res.cookie('refreshToken', refreshToken, cookieOptions);

        // Redirect to frontend with access token
        res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:3000'}/oauth-success?accessToken=${accessToken}`);
    } catch (error) {
        res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:3000'}/login?error=Authentication failed`);
    }
};

// Updated auth middleware to support checking tokens from cookies
export const authMiddleware = (req: Request, res: Response, next: NextFunction): void => {
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
                const payload = jwt.verify(req.cookies.refreshToken, process.env.TOKEN_SECRET) as { _id: string };
                req.body.userId = payload._id;
                next();
                return;
            } catch (err) {
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

        jwt.verify(token, process.env.TOKEN_SECRET, (error, payload) => {
            if (error) {
                res.status(401).send('Access Denied');
                return;
            }
            req.body.userId = (payload as { _id: string })._id;
            next();
        });
    } catch (error) {
        res.status(401).send('Access Denied');
    }
};

const controller: AuthController = {
    register,
    login,
    refresh,
    logout,
    googleCallback,
    facebookCallback
};

export default controller;