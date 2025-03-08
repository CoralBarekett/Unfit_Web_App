import { NextFunction, Request, Response } from 'express';
import userModel from '../models/userModel';
import jwt from 'jsonwebtoken';

export type AuthController = {
    register: (req: Request, res: Response) => Promise<void>;
    login: (req: Request, res: Response) => Promise<void>;
    refresh: (req: Request, res: Response) => Promise<void>;
    logout: (req: Request, res: Response) => Promise<void>;
    googleCallback: (req: Request, res: Response) => Promise<void>;
    facebookCallback: (req: Request, res: Response) => Promise<void>;
    user: (req: Request, res: Response) => Promise<void>;
};

// Cookie options with explicit typing
const cookieOptions: {
    httpOnly: boolean;
    secure: boolean;
    sameSite: 'strict' | 'lax' | 'none' | undefined;
    maxAge: number;
} = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
};

const register = async (req: Request, res: Response): Promise<void> => {
    try {
        const { email, username, password } = req.body;
        
        // Check if user already exists
        const userExists = await userModel.findOne({ email });
        if (userExists) {
            res.status(400).json({ message: 'User with this email already exists' });
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
            res.status(500).json({ message: 'Server error' });
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
            user: {
                _id: user._id,
                email: user.email,
                username: user.username
            },
            accessToken
        });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(400).json({ message: 'Registration failed', error });
    }
};

const login = async (req: Request, res: Response): Promise<void> => {
    try {
        const user = await userModel.findOne({ email: req.body.email });
        if (!user) {
            res.status(400).json({ message: 'Wrong username or password' });
            return;
        }

        // Verify password
        if (!user.matchPassword) {
            res.status(500).json({ message: 'Server error' });
            return;
        }
        
        const validPassword = await user.matchPassword(req.body.password);
        if (!validPassword) {
            res.status(400).json({ message: 'Wrong username or password' });
            return;
        }

        if (!process.env.TOKEN_SECRET) {
            res.status(500).json({ message: 'Server error' });
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
            user: {
                _id: user._id,
                email: user.email,
                username: user.username
            },
            accessToken
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(400).json({ message: 'Login failed', error });
    }
};

const refresh = async (req: Request, res: Response): Promise<void> => {
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
        const payload = jwt.verify(refreshToken, process.env.TOKEN_SECRET) as { _id: string };
        
        // Find user with this refresh token
        const user = await userModel.findOne({ 
            _id: payload._id,
            refreshToken: refreshToken 
        });

        if (!user) {
            res.status(401).json({ message: 'Invalid refresh token' });
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
        console.error('Token refresh error:', error);
        res.status(401).json({ message: 'Invalid refresh token' });
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
        
        res.status(200).json({ message: 'Logged out successfully' });
    } catch (error) {
        console.error('Logout error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Get user info endpoint
const user = async (req: Request, res: Response): Promise<void> => {
    try {
        // Get user ID from middleware
        const userId = req.body.userId;
        
        if (!userId) {
            res.status(401).json({ message: 'Not authenticated' });
            return;
        }
        
        // Find user
        const user = await userModel.findById(userId).select('-password -refreshToken');
        
        if (!user) {
            res.status(404).json({ message: 'User not found' });
            return;
        }
        
        res.status(200).json(user);
    } catch (error) {
        console.error('User fetch error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// OAuth callback handlers
const googleCallback = async (req: Request, res: Response): Promise<void> => {
    try {
        // User should be attached by passport middleware
        const user = req.user as any;
        
        if (!user || !user._id) {
            res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:3000'}/login?error=Authentication%20failed`);
            return;
        }

        if (!process.env.TOKEN_SECRET) {
            res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:3000'}/login?error=Server%20error`);
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
        const redirectUrl = encodeURI(`${process.env.FRONTEND_URL || 'http://localhost:3000'}/oauth-success?accessToken=${accessToken}`);
        res.redirect(redirectUrl);
    } catch (error) {
        console.error('Google callback error:', error);
        res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:3000'}/login?error=Authentication%20failed`);
    }
};

const facebookCallback = async (req: Request, res: Response): Promise<void> => {
    try {
        // User should be attached by passport middleware
        const user = req.user as any;
        
        if (!user || !user._id) {
            res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:3000'}/login?error=Authentication%20failed`);
            return;
        }

        if (!process.env.TOKEN_SECRET) {
            res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:3000'}/login?error=Server%20error`);
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
        const redirectUrl = encodeURI(`${process.env.FRONTEND_URL || 'http://localhost:3000'}/oauth-success?accessToken=${accessToken}`);
        res.redirect(redirectUrl);
    } catch (error) {
        console.error('Facebook callback error:', error);
        res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:3000'}/login?error=Authentication%20failed`);
    }
};

// Auth middleware - exported separately from the controller object
export const authMiddleware = (req: Request, res: Response, next: NextFunction): void => {
    try {
        // Check Authorization header first
        const authorization = req.header('authorization');
        let token = null;
        
        if (authorization) {
            // Support both "Bearer" and "JWT" prefixes
            if (authorization.startsWith('Bearer ')) {
                token = authorization.split('Bearer ')[1];
            } else if (authorization.startsWith('JWT ')) {
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
                const payload = jwt.verify(req.cookies.refreshToken, process.env.TOKEN_SECRET) as { _id: string };
                req.body.userId = payload._id;
                next();
                return;
            } catch (err) {
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

        jwt.verify(token, process.env.TOKEN_SECRET, (error, payload) => {
            if (error) {
                res.status(401).json({ message: 'Access Denied - Invalid token' });
                return;
            }
            req.body.userId = (payload as { _id: string })._id;
            next();
        });
    } catch (error) {
        console.error('Auth middleware error:', error);
        res.status(401).json({ message: 'Access Denied' });
    }
};

const controller: AuthController = {
    register,
    login,
    refresh,
    logout,
    googleCallback,
    facebookCallback,
    user
};

export default controller;