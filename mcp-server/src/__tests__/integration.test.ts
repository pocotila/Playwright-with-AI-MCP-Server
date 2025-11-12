import request from 'supertest';
import express, { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { body } from 'express-validator';
import { authenticate } from '../middleware/auth';
import { validateRequest } from '../middleware/validation';
import { cacheMiddleware } from '../middleware/cache';

const app = express();
app.use(express.json());

// Setup test routes with all middleware
const completionsValidation = [
  body('prompt').notEmpty().isString(),
  body('maxTokens').optional().isInt({ min: 1, max: 2048 })
];

app.post('/v1/completions', 
  authenticate,
  completionsValidation,
  validateRequest,
  async (req: Request, res: Response) => {
    res.json({
      choices: [{
        text: 'Test completion response',
        finish_reason: 'stop'
      }]
    });
});

describe('Integration Tests', () => {
  const validToken = jwt.sign({ userId: '123' }, process.env.JWT_SECRET || 'test-secret');

  describe('Completions Endpoint', () => {
    it('should handle valid completion request', async () => {
      const response = await request(app)
        .post('/v1/completions')
        .set('Authorization', `Bearer ${validToken}`)
        .send({
          prompt: 'Test prompt',
          maxTokens: 100
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('choices');
      expect(response.body.choices[0]).toHaveProperty('text');
    });

    it('should reject invalid requests', async () => {
      const response = await request(app)
        .post('/v1/completions')
        .set('Authorization', `Bearer ${validToken}`)
        .send({
          prompt: '', // Invalid - empty prompt
          maxTokens: -1 // Invalid - negative tokens
        });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('errors');
    });

    it('should reject unauthorized requests', async () => {
      const response = await request(app)
        .post('/v1/completions')
        .send({
          prompt: 'Test prompt',
          maxTokens: 100
        });

      expect(response.status).toBe(401);
    });
  });

  describe('Error Handling', () => {
    const errorEndpoint = '/test-error';
    app.get(errorEndpoint, (req: express.Request, res: express.Response, next: express.NextFunction) => {
      next(new Error('Test error'));
    });

    // Add error handling middleware
    app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
      res.status(500).json({ error: err.message });
    });

    it('should handle errors gracefully', async () => {
      const response = await request(app)
        .get(errorEndpoint);

      expect(response.status).toBe(500);
      expect(response.body).toHaveProperty('error');
    });
  });
});