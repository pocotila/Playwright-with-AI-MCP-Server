import { Request, Response, NextFunction } from 'express';
import logger from '../config/logger';

interface ErrorWithStatus extends Error {
  status?: number;
  code?: string;
  details?: any;
}

export const errorHandler = (err: ErrorWithStatus, req: Request, res: Response, next: NextFunction) => {
  // Log error details
  const errorContext = {
    method: req.method,
    url: req.url,
    body: req.body,
    headers: req.headers,
    query: req.query,
    params: req.params,
    timestamp: new Date().toISOString(),
    error: {
      name: err.name,
      message: err.message,
      stack: err.stack,
      code: err.code,
      details: err.details
    }
  };

  logger.error('Request failed', errorContext);

  // Determine status code
  const statusCode = err.status || 500;

  // Send appropriate error response
  res.status(statusCode).json({
    error: {
      status: statusCode,
      message: err.message,
      code: err.code || 'INTERNAL_ERROR',
      timestamp: new Date().toISOString(),
      path: req.url,
      details: process.env.NODE_ENV === 'development' ? err.details : undefined
    },
    requestId: req.headers['x-request-id'] || 'unknown'
  });
};

// Custom error classes
export class ValidationError extends Error {
  constructor(message: string, public details?: any) {
    super(message);
    this.name = 'ValidationError';
    this.status = 400;
  }
  status: number;
}

export class AuthenticationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'AuthenticationError';
    this.status = 401;
  }
  status: number;
}

export class RateLimitError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'RateLimitError';
    this.status = 429;
  }
  status: number;
}

// Error logging middleware
export const requestLogger = (req: Request, res: Response, next: NextFunction) => {
  const start = Date.now();

  // Log request
  logger.info('Incoming request', {
    method: req.method,
    url: req.url,
    headers: req.headers,
    query: req.query,
    body: req.body,
  });

  // Override res.json to log response
  const originalJson = res.json;
  res.json = function(body: any) {
    const responseTime = Date.now() - start;
    
    logger.info('Outgoing response', {
      method: req.method,
      url: req.url,
      statusCode: res.statusCode,
      responseTime,
      body: body
    });

    return originalJson.call(this, body);
  };

  next();
};