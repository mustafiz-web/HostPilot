import express, { Application } from 'express';
import helmet from 'helmet';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { env } from './config/env';
import { requestIdMiddleware } from './middlewares/request-id.middleware';
import { requestLoggerMiddleware } from './middlewares/request-logger.middleware';
import { apiRateLimiter } from './middlewares/rate-limiter.middleware';
import { notFoundMiddleware } from './middlewares/not-found.middleware';
import { errorHandlerMiddleware } from './middlewares/error-handler.middleware';
import { apiV1Routes } from './routes';

export function createApp(): Application {
  const app = express();

  // 1. Security Headers
  app.use(helmet());

  // 2. Strict CORS Configuration
  const allowedOrigins = [env.CLIENT_URL];
  // In development, also allow preview port 4173 if distinct
  if (env.NODE_ENV === 'development') {
    allowedOrigins.push('http://localhost:4173', 'http://127.0.0.1:5173', 'http://127.0.0.1:4173');
  }

  app.use(
    cors({
      origin: (origin, callback) => {
        // Allow requests with no origin (like mobile apps, curl, server-to-server)
        if (!origin) return callback(null, true);
        if (allowedOrigins.includes(origin)) {
          return callback(null, true);
        }
        return callback(new Error(`CORS blocked request from unauthorized origin: ${origin}`));
      },
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'X-Request-ID', 'X-CSRF-Token'],
    })
  );

  // 3. Request Parsers & Cookies
  app.use(cookieParser(env.COOKIE_SECRET));
  app.use(express.json({ limit: '1mb' }));
  app.use(express.urlencoded({ extended: true, limit: '1mb' }));

  // 4. Request Identification & Safe Logging
  app.use(requestIdMiddleware);
  app.use(requestLoggerMiddleware);

  // 5. Global Rate Limiting
  app.use('/api', apiRateLimiter);

  // 6. Base API Welcome Endpoint
  app.get('/', (_req, res) => {
    res.status(200).json({
      name: 'Host Pilot API',
      version: '1.0.0',
      description: 'Hostel Management System REST API',
      endpoints: {
        health: '/api/v1/health',
        apiV1: '/api/v1',
      },
    });
  });

  // 7. Mount Core API v1 Routes
  app.use('/api/v1', apiV1Routes);

  // 8. 404 Route Catch-all
  app.use(notFoundMiddleware);

  // 9. Centralized Error Handler
  app.use(errorHandlerMiddleware);

  return app;
}

export const app = createApp();
