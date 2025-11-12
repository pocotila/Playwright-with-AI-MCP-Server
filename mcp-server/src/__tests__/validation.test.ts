import request from 'supertest';
import express from 'express';
import { validateRequest } from '../middleware/validation';
import { body } from 'express-validator';

const app = express();
app.use(express.json());

// Test validation rules
const testValidation = [
  body('name').notEmpty().isString(),
  body('age').isInt({ min: 0 })
];

// Test endpoint
app.post('/validate', testValidation, validateRequest, (req: express.Request, res: express.Response) => {
  res.json({ success: true });
});

describe('Validation Middleware', () => {
  it('should pass valid data', async () => {
    const response = await request(app)
      .post('/validate')
      .send({
        name: 'Test User',
        age: 25
      });

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ success: true });
  });

  it('should reject invalid data', async () => {
    const response = await request(app)
      .post('/validate')
      .send({
        name: '',
        age: 'invalid'
      });

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty('errors');
    expect(response.body.errors).toBeInstanceOf(Array);
  });

  it('should reject missing required fields', async () => {
    const response = await request(app)
      .post('/validate')
      .send({});

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty('errors');
  });
});