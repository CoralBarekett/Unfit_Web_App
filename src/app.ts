import appInit from './server';
import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import swaggerConfig from './swaggerConfig';

const port = process.env.PORT;

const tmpFunc = async () => {
    const app = await appInit();

    // Generate Swagger documentation
    const swaggerDocs = swaggerJsdoc(swaggerConfig);

    // Add Swagger UI to your app
    app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

    // Start the server
    app.listen(port, () => {
        console.log(`Server started at http://localhost:${port}`);
        console.log(`API Documentation available at http://localhost:${port}/api-docs`);
    });
};

tmpFunc();
