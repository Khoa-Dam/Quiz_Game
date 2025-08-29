import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const redoc = require('redoc-express');

export const redocOptions = {
  title: 'Quiz Game API',
  specUrl: '/api-docs/swagger.json',
  redocOptions: {
    theme: {
      colors: {
        primary: {
          main: '#1890ff'
        }
      }
    }
  }
};

export { redoc }; 