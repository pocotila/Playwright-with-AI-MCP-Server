import { Request, Response } from 'express';
import redisClient from '../config/redis';
import logger from '../config/logger';

export const cacheMiddleware = (key: string, ttl: number = 3600) => {
  return async (req: Request, res: Response, next: Function) => {
    try {
      const cachedData = await redisClient.get(key);
      if (cachedData) {
        return res.json(JSON.parse(cachedData));
      }
      
      // Store the original res.json method
      const originalJson = res.json.bind(res);
      res.json = ((data: any) => {
        // Cache the data before sending response
        redisClient.setEx(key, ttl, JSON.stringify(data))
          .catch(err => logger.error('Redis cache error:', err));
        return originalJson(data);
      }) as any;
      
      next();
    } catch (error) {
      logger.error('Cache middleware error:', error);
      next();
    }
  };
};