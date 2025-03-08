import { SwaggerDefinition, Options } from 'swagger-jsdoc';

const swaggerDefinition: SwaggerDefinition = {
  openapi: '3.0.0', // Specify the OpenAPI version
  info: {
    title: 'Unfit Web App', 
    version: '1.0.0', 
    description: '',
    contact: {
      name: 'Yam Balas and Coral Bareket',
      email: 'coral.bareket@gmail.com',
    },
  },
  servers: [
    {
      url: 'http://localhost:5173', 
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
      BearerAuth: [],  // Apply the BearerAuth security scheme globally
    },
  ],
};

const swaggerOptions: Options = {
  swaggerDefinition,
  apis: [
    './src/routes/*.ts',       // Include route files with Swagger annotations
    './src/controllers/*.ts',  // Include controller files if add annotations there
  ],
};

export default swaggerOptions;
