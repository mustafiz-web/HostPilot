import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { authController } from './auth.controller';
import { loginSchema, forgotPasswordSchema } from './auth.schema';
import { validate } from '../../middlewares/validate.middleware';
import { authenticate } from '../../middlewares/authenticate.middleware';
import { env } from '../../config/env';
import { ApiResponse } from '../../utils/api-response';

const router = Router();

// Brute-force protection specific to login endpoint
const loginRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // 10 attempts
  standardHeaders: true,
  legacyHeaders: false,
  skip: () => env.NODE_ENV === 'test',
  handler: (_req, res) => {
    return ApiResponse.error(
      res,
      'TOO_MANY_LOGIN_ATTEMPTS',
      'Too many login attempts from this IP. Please try again after 15 minutes.',
      429
    );
  },
});

router.post('/login', loginRateLimiter, validate(loginSchema), (req, res, next) =>
  authController.login(req, res, next)
);

router.post('/logout', authenticate, (req, res, next) =>
  authController.logout(req, res, next)
);

router.get('/me', authenticate, (req, res, next) =>
  authController.getMe(req, res, next)
);

router.post('/forgot-password', validate(forgotPasswordSchema), (req, res, next) =>
  authController.forgotPassword(req, res, next)
);

export const authRoutes = router;
