import rateLimit from 'express-rate-limit';
import { env } from '../config/env';
import { ApiResponse } from '../utils/api-response';

export const apiRateLimiter = rateLimit({
  windowMs: env.RATE_LIMIT_WINDOW_MS,
  max: env.RATE_LIMIT_MAX,
  standardHeaders: true,
  legacyHeaders: false,
  skip: () => env.NODE_ENV === 'test',
  handler: (_req, res) => {
    return ApiResponse.error(
      res,
      'RATE_LIMIT_EXCEEDED',
      'Too many requests from this IP, please try again later.',
      429
    );
  },
});
