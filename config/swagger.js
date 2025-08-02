import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Quiz Game API',
      version: '1.0.0',
      description: 'API documentation for Quiz Game application',
      contact: {
        name: 'Quiz Game Team',
        email: 'support@quizgame.com'
      }
    },
    servers: [
      {
        url: 'http://localhost:3000/api/v1',
        description: 'Development server'
      }
    ],
    components: {
      securitySchemes: {
        cookieAuth: {
          type: 'apiKey',
          in: 'cookie',
          name: 'token'
        }
      }
    }
  },
  apis: ['./routes/**/*.js', './controllers/**/*.js'] // Path to the API docs
};

const specs = swaggerJsdoc(options);

export { specs, swaggerUi }; 