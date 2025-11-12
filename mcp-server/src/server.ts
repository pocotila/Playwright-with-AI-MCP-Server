import 'dotenv/config';
import express, { Request, Response } from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import rateLimit from 'express-rate-limit';
import { body } from 'express-validator';
import { authenticate } from './middleware/auth';
import { validateRequest } from './middleware/validation';
import { cacheMiddleware } from './middleware/cache';
import logger from './config/logger';
import { errorHandler, requestLogger, ValidationError, AuthenticationError, RateLimitError } from './middleware/error-handler';

const app = express();
const port = process.env.PORT || 3000;

// Add request ID to each request
app.use((req, res, next) => {
  req.headers['x-request-id'] = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  next();
});

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(requestLogger);

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'),
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100')
});
app.use(limiter);

// Validation rules
const completionsValidation = [
  body('prompt').notEmpty().isString(),
  body('maxTokens').optional().isInt({ min: 1, max: 2048 })
];

const embeddingsValidation = [
  body('input').notEmpty().isString()
];

// Routes with authentication, validation, and caching
app.post('/v1/completions',
  authenticate,
  completionsValidation,
  validateRequest,
  async (req: Request, res: Response) => {
    try {
      const { prompt, maxTokens } = req.body;
      // Implement your completion logic here
      logger.info('Completion request processed', { prompt, maxTokens });
      
      res.json({
        choices: [{
          text: 'Sample completion response',
          finish_reason: 'stop'
        }]
      });
    } catch (error) {
      logger.error('Completion error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
});

app.post('/v1/embeddings',
  authenticate,
  embeddingsValidation,
  validateRequest,
  cacheMiddleware('embeddings', 3600),
  async (req: Request, res: Response) => {
    try {
      const { input } = req.body;
      // Implement your embedding logic here
      logger.info('Embedding request processed', { input });
      
      res.json({
        data: [{
          embedding: [0.1, 0.2, 0.3] // Sample embedding vector
        }]
      });
    } catch (error) {
      logger.error('Embedding error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
});

// Metrics endpoint
app.get('/metrics',
  authenticate,
  (req: Request, res: Response) => {
    // Implement your metrics collection logic here
    res.json({
      requests: {
        total: 100,
        success: 95,
        failed: 5
      },
      latency: {
        p50: 100,
        p95: 200,
        p99: 300
      }
    });
});

// Health check endpoint
app.get('/health', (req: Request, res: Response) => {
  res.json({ 
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version
  });
});

// Error handling middleware
app.use(errorHandler);

// Start server
app.listen(port, () => {
  logger.info(`MCP Server running on port ${port}`);
});