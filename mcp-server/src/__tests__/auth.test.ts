import request from 'supertest';
import express from 'express';
import jwt from 'jsonwebtoken';
import { authenticate } from '../middleware/auth';

const app = express();
app.use(express.json());

// Test endpoint
app.get('/protected', authenticate, (req, res) => {
  res.json({ success: true });
});

describe('Auth Middleware', () => {
  const validToken = jwt.sign({ userId: '123' }, process.env.JWT_SECRET || 'test-secret');

  it('should allow access with valid token', async () => {
    const response = await request(app)
      .get('/protected')
      .set('Authorization', `Bearer ${validToken}`);

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ success: true });
  });

  it('should reject requests without token', async () => {
    const response = await request(app)
      .get('/protected');

    expect(response.status).toBe(401);
    expect(response.body).toHaveProperty('error');
  });

  it('should reject invalid tokens', async () => {
    const response = await request(app)
      .get('/protected')
      .set('Authorization', 'Bearer invalid-token');

    expect(response.status).toBe(401);
    expect(response.body).toHaveProperty('error');
  });
});