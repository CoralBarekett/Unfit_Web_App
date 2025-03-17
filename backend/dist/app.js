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
/* eslint-disable @typescript-eslint/no-explicit-any */
const express_1 = __importDefault(require("express"));
const server_1 = __importDefault(require("./server"));
const swagger_jsdoc_1 = __importDefault(require("swagger-jsdoc"));
const swagger_ui_express_1 = __importDefault(require("swagger-ui-express"));
const swaggerConfig_1 = __importDefault(require("./swaggerConfig"));
const dotenv_1 = __importDefault(require("dotenv"));
const fileRoutes_1 = __importDefault(require("./routes/fileRoutes"));
const path_1 = __importDefault(require("path"));
const aiRoutes_1 = __importDefault(require("./routes/aiRoutes"));
//import { RequestHandler } from "express";
dotenv_1.default.config();
const port = process.env.PORT || 3001;
const startServer = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const app = yield (0, server_1.default)();
        console.log("Uploads directory:", path_1.default.join(__dirname, "uploads"));
        // Serve static files from 'uploads' directory
        app.use("/uploads", express_1.default.static(path_1.default.join(__dirname, "uploads")));
        // Use file routes
        app.use("/file", fileRoutes_1.default);
        // Generate Swagger documentation
        const swaggerDocs = (0, swagger_jsdoc_1.default)(swaggerConfig_1.default);
        // Add Swagger UI to your app
        app.use("/api-docs", swagger_ui_express_1.default.serve, swagger_ui_express_1.default.setup(swaggerDocs));
        app.use("/api/ai", aiRoutes_1.default);
        app._router.stack.forEach((middleware) => {
            var _a;
            if (middleware.route) {
                console.log(`Route registered: ${middleware.route.path}`);
            }
            else if (middleware.name === "router" && ((_a = middleware.handle) === null || _a === void 0 ? void 0 : _a.stack)) {
                middleware.handle.stack.forEach((subMiddleware) => {
                    if (subMiddleware.route) {
                        console.log(`Route registered: /api/ai${subMiddleware.route.path}`);
                    }
                });
            }
        });
        // Start the server
        app.listen(port, () => {
            console.log(`Server started at http://localhost:${port}`);
            console.log(`API Documentation available at http://localhost:${port}/api-docs`);
            console.log(`OAuth endpoints available at http://localhost:${port}/auth/google and http://localhost:${port}/auth/facebook`);
        });
    }
    catch (error) {
        console.error("Failed to start server:", error);
        process.exit(1);
    }
});
startServer();
//# sourceMappingURL=app.js.map