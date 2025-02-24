"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const swaggerDefinition = {
    openapi: '3.0.0', // Specify the OpenAPI version
    info: {
        title: 'Unfit Web App',
        version: '1.0.0',
        description: 'This is the REST API documentation for the Advanced Web Development course project.',
        contact: {
            name: 'Yam Balas and Coral Bareket',
            email: 'coral.bareket@gmail.com',
        },
    },
    servers: [
        {
            url: 'http://localhost:3001',
            description: 'Local development server',
        },
    ],
    components: {
        securitySchemes: {
            BearerAuth: {
                type: 'http',
                scheme: 'bearer',
                bearerFormat: 'JWT',
            },
        },
    },
    security: [
        {
            BearerAuth: [], // Apply the BearerAuth security scheme globally
        },
    ],
};
const swaggerOptions = {
    swaggerDefinition,
    apis: [
        './src/routes/*.ts', // Include route files with Swagger annotations
        './src/controllers/*.ts', // Include controller files if add annotations there
    ],
};
exports.default = swaggerOptions;
//# sourceMappingURL=swaggerConfig.js.map