import express from 'express';
import appInit from './server';
import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import swaggerConfig from './swaggerConfig';
import dotenv from 'dotenv';
import fileRoutes from './routes/fileRoutes';
import path from 'path';

dotenv.config();
const port = process.env.PORT || 5000;

const startServer = async () => {
    try {
        const app = await appInit();

        // Serve static files from 'uploads' directory
        app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

        // Use file routes
        app.use('/file', fileRoutes);

        // Generate Swagger documentation
        const swaggerDocs = swaggerJsdoc(swaggerConfig);

        // Add Swagger UI to your app
        app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

        // Start the server
        app.listen(port, () => {
            console.log(`Server started at http://localhost:${port}`);
            console.log(`API Documentation available at http://localhost:${port}/api-docs`);
            console.log(`OAuth endpoints available at http://localhost:${port}/auth/google and http://localhost:${port}/auth/facebook`);
        });
    } catch (error) {
        console.error('Failed to start server:', error);
        process.exit(1);
    }
};

startServer();