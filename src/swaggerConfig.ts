import { SwaggerDefinition, Options } from 'swagger-jsdoc';

const swaggerDefinition: SwaggerDefinition = {
  openapi: '3.0.0', // Specify the OpenAPI version
  info: {
    title: 'REST API Advanced - Task 2', // The title of the API
    version: '1.0.0', 
    description: 'This is the REST API documentation for the Advanced Web Development course project.',
    contact: {
      name: 'Yam Balas and Coral Bareket',
      email: 'youremail@example.com',  // Add a contact email if needed
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
        bearerFormat: 'JWT', // Indicate that JWT tokens will be used
      },
    },
  },
  security: [
    {
      BearerAuth: [],  // Apply the BearerAuth security scheme globally
    },
  ],
};

const swaggerOptions: Options = {
  swaggerDefinition,
  apis: [
    './src/routes/*.ts',       // Include route files with Swagger annotations
    './src/controllers/*.ts',  // Include controller files if you add annotations there
  ],
};

export default swaggerOptions;
