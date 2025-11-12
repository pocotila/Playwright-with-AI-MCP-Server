import request from 'supertest';
import express, { Request, Response } from 'express';
import { rateLimit } from 'express-rate-limit';

const app = express();
app.use(express.json());

// Test rate limiter
const limiter = rateLimit({
  windowMs: 1000, // 1 second window
  max: 2 // limit each IP to 2 requests per windowMs
});

// Test endpoint
app.get('/limited', limiter, (req: Request, res: Response) => {
  res.json({ success: true });
});

describe('Rate Limiting', () => {
  it('should allow requests within limit', async () => {
    // First request
    const response1 = await request(app)
      .get('/limited');
    expect(response1.status).toBe(200);

    // Second request
    const response2 = await request(app)
      .get('/limited');
    expect(response2.status).toBe(200);
  });

  it('should block requests over limit', async () => {
    // Make two requests to reach the limit
    await request(app).get('/limited');
    await request(app).get('/limited');

    // Third request should be blocked
    const response = await request(app)
      .get('/limited');
    expect(response.status).toBe(429); // Too Many Requests
  });

  it('should reset limit after window', async () => {
    // Make two requests to reach the limit
    await request(app).get('/limited');
    await request(app).get('/limited');

    // Wait for rate limit window to reset
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Should be able to make requests again
    const response = await request(app)
      .get('/limited');
    expect(response.status).toBe(200);
  });
});