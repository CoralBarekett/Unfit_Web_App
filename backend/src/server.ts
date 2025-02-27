import express, {Express} from 'express';
import dotenv from 'dotenv';
import bodyParser from 'body-parser';
import mongoose from 'mongoose';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import passport from 'passport';

// Import routes
import postsRoutes from './routes/postsRoutes';
import commentsRoutes from './routes/commentsRoutes';
import authRoutes from './routes/authRoutes';

// Load environment variables
dotenv.config();

// Import passport configuration
import './config/passport';

const initApp = () => {
    return new Promise<Express>(async (resolve, reject) => {
        try {
            const app = express();
            
            // Connect to MongoDB
            if (process.env.DB_CONNECT === undefined) {
                console.error('DB_CONNECT is not defined in .env file');
                reject();
                return;
            }
            
            await mongoose.connect(process.env.DB_CONNECT);
            const db = mongoose.connection;
            db.on('error', (error) => console.error(error));
            db.once('open', () => console.log('Connected to database'));
            
            // Middlewares
            app.use(bodyParser.json());
            app.use(bodyParser.urlencoded({ extended: true }));
            app.use(cookieParser()); // Add cookie parser
            
            // CORS configuration - FIX: Updated CORS settings to properly handle requests
            app.use(cors({
                // Use an array to allow multiple origins
                origin: [
                    process.env.FRONTEND_URL || 'http://localhost:5173', 
                    'http://localhost:5173',
                    'http://127.0.0.1:5173'
                ],
                credentials: true, // Important for cookies to work cross-origin
                methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
                allowedHeaders: ['Content-Type', 'Authorization']
            }));
            
            // Initialize Passport
            app.use(passport.initialize());
            
            // Routes
            app.use('/posts', postsRoutes);
            app.use('/comments', commentsRoutes);
            app.use('/auth', authRoutes);
            
            resolve(app);
        } catch (error) {
            console.error('Error initializing app:', error);
            reject(error);
        }
    });
};

export default initApp;