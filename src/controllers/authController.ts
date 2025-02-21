import { NextFunction, Request, Response } from 'express';
import userModel from '../models/userModel';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

export type AuthController = {
    register: (req: Request, res: Response) => Promise<void>;
    login: (req: Request, res: Response) => Promise<void>;
    refresh: (req: Request, res: Response) => Promise<void>;
    logout: (req: Request, res: Response) => Promise<void>;
};

const register = async (req: Request, res: Response): Promise<void> => {
    try {
        const password = req.body.password;
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        const user = await userModel.create({
            email: req.body.email,
            password: hashedPassword,
            refreshToken: []
        });
        res.status(200).send(user);
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

        const validPassword = await bcrypt.compare(req.body.password, user.password);
        if (!validPassword) {
            res.status(400).send('Wrong username or password');
            return;
        }

        if (!process.env.TOKEN_SECRET) {
            res.status(500).send('Server error');
            return;
        }

        // Set a very short expiration for testing purposes
        const accessToken = jwt.sign(
            { _id: user._id },
            process.env.TOKEN_SECRET,
            { expiresIn: process.env.TOKEN_EXPIRATION }
        );

        const refreshToken = jwt.sign(
            { _id: user._id },
            process.env.TOKEN_SECRET,
            { expiresIn: process.env.REFRESH_TOKEN_EXPIRATION }
        );

        user.refreshToken = user.refreshToken || [];
        user.refreshToken.push(refreshToken);
        await user.save();

        if(user.refreshToken == null){
            user.refreshToken = [];
        }
        user.refreshToken.push(refreshToken);
        await user.save();
        res.status(200).json({
            email: user.email,
            _id: user._id,
            accessToken,
            refreshToken
        });
    } catch (error) {
        res.status(400).send(error);
    }
};

const refresh = async (req: Request, res: Response): Promise<void> => {
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

        const payload = jwt.verify(refreshToken, process.env.TOKEN_SECRET) as { _id: string };
        const user = await userModel.findById(payload._id);

        if (!user || !user.refreshToken?.includes(refreshToken)) {
            res.status(401).send('Invalid refresh token');
            return;
        }

        // Remove the used refresh token
        user.refreshToken = user.refreshToken.filter(token => token !== refreshToken);

        // Generate new tokens
        const accessToken = jwt.sign(
            { _id: user._id },
            process.env.TOKEN_SECRET,
            { expiresIn: '3s' }  // Short expiration for testing
        );

        const newRefreshToken = jwt.sign(
            { _id: user._id },
            process.env.TOKEN_SECRET,
            { expiresIn: '7d' }
        );

        // Save the new refresh token
        user.refreshToken.push(newRefreshToken);
        await user.save();

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
        const { refreshToken } = req.body;
        if (!refreshToken) {
            res.status(400).send('Refresh token required');
            return;
        }

        const user = await userModel.findOne({ refreshToken: refreshToken });
        if (!user) {
            res.status(200).send('Logged out successfully');
            return;
        }

        user.refreshToken = user.refreshToken?.filter(token => token !== refreshToken) || [];
        await user.save();

        res.status(200).send('Logged out successfully');
    } catch (error) {
        res.status(500).send('Server error');
    }
};

export const authMiddleware = (req: Request, res: Response, next: NextFunction): void => {
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

    jwt.verify(token, process.env.TOKEN_SECRET, (error, payload) => {
        if (error) {
            res.status(401).send('Access Denied');
            return;
        }
        req.body.userId = (payload as { _id: string })._id;
        next();
    });
};

const controller: AuthController = {
    register,
    login,
    refresh,
    logout
};

export default controller;