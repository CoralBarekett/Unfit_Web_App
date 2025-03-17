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
/* eslint-disable no-async-promise-executor */
const express_1 = __importDefault(require("express"));
const dotenv_1 = __importDefault(require("dotenv"));
const body_parser_1 = __importDefault(require("body-parser"));
const mongoose_1 = __importDefault(require("mongoose"));
const cors_1 = __importDefault(require("cors"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const passport_1 = __importDefault(require("passport"));
const path_1 = __importDefault(require("path"));
const aiRoutes_1 = __importDefault(require("./routes/aiRoutes"));
// Import routes
const postsRoutes_1 = __importDefault(require("./routes/postsRoutes"));
const commentsRoutes_1 = __importDefault(require("./routes/commentsRoutes"));
const authRoutes_1 = __importDefault(require("./routes/authRoutes"));
// Load environment variables
dotenv_1.default.config();
// Import passport configuration
require("./config/passport");
const fileRoutes_1 = __importDefault(require("./routes/fileRoutes"));
const initApp = () => {
    return new Promise((resolve, reject) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const app = (0, express_1.default)();
            // Connect to MongoDB
            if (process.env.DB_CONNECT === undefined) {
                console.error('DB_CONNECT is not defined in .env file');
                reject();
                return;
            }
            yield mongoose_1.default.connect(process.env.DB_CONNECT);
            const db = mongoose_1.default.connection;
            db.on('error', (error) => console.error(error));
            db.once('open', () => console.log('Connected to database'));
            // Middlewares
            app.use(body_parser_1.default.json());
            app.use(body_parser_1.default.urlencoded({ extended: true }));
            app.use((0, cookie_parser_1.default)()); // Add cookie parser
            // CORS configuration - FIX: Updated CORS settings to properly handle requests
            app.use((0, cors_1.default)({
                // Use an array to allow multiple origins
                origin: [
                    process.env.FRONTEND_URL || 'http://localhost:5173',
                    'http://localhost:5173',
                    'http://127.0.0.1:5173',
                    'https://node01.cs.colman.ac.il'
                ],
                credentials: true, // Important for cookies to work cross-origin
                methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
                allowedHeaders: ['Content-Type', 'Authorization']
            }));
            // Initialize Passport
            app.use(passport_1.default.initialize());
            // Serve static files from the uploads directory
            app.use('/uploads', express_1.default.static(path_1.default.join(__dirname, '..', 'uploads')));
            // Routes
            app.use('/api/posts', postsRoutes_1.default);
            app.use('/api/comments', commentsRoutes_1.default);
            app.use('/auth', authRoutes_1.default);
            app.use('/file', fileRoutes_1.default);
            app.use('/api/ai', aiRoutes_1.default);
            resolve(app);
        }
        catch (error) {
            console.error('Error initializing app:', error);
            reject(error);
        }
    }));
};
exports.default = initApp;
//# sourceMappingURL=server.js.map