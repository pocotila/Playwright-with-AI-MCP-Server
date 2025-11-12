import request from 'supertest';
import express from 'express';
import { cacheMiddleware } from '../middleware/cache';
import redis from '../config/redis';

const app = express();
app.use(express.json());

// Mock data
const testData = { test: 'data' };

// Test endpoint
app.get('/cached', cacheMiddleware('test-key', 60), (req, res) => {
  res.json(testData);
});

jest.mock('../config/redis', () => ({
  get: jest.fn(),
  setEx: jest.fn(),
}));

describe('Cache Middleware', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return cached data if available', async () => {
    (redis.get as jest.Mock).mockResolvedValue(JSON.stringify(testData));

    const response = await request(app)
      .get('/cached');

    expect(response.status).toBe(200);
    expect(response.body).toEqual(testData);
    expect(redis.get).toHaveBeenCalledWith('test-key');
    expect(redis.setEx).not.toHaveBeenCalled();
  });

  it('should cache new data if not in cache', async () => {
    (redis.get as jest.Mock).mockResolvedValue(null);
    (redis.setEx as jest.Mock).mockResolvedValue('OK');

    const response = await request(app)
      .get('/cached');

    expect(response.status).toBe(200);
    expect(response.body).toEqual(testData);
    expect(redis.get).toHaveBeenCalledWith('test-key');
    expect(redis.setEx).toHaveBeenCalledWith('test-key', 60, JSON.stringify(testData));
  });

  it('should handle redis errors gracefully', async () => {
    (redis.get as jest.Mock).mockRejectedValue(new Error('Redis error'));

    const response = await request(app)
      .get('/cached');

    expect(response.status).toBe(200);
    expect(response.body).toEqual(testData);
  });
});