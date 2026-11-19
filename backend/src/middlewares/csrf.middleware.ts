import { Request, Response, NextFunction } from 'express';
import { env } from '../config/env';
import { AppError } from '../utils/app-error';

const SAFE_METHODS = ['GET', 'HEAD', 'OPTIONS'];

export function csrfProtection(req: Request, _res: Response, next: NextFunction): void {
  // Safe read methods don't modify state
  if (SAFE_METHODS.includes(req.method)) {
    return next();
  }

  // If request uses Authorization Bearer header, browser does not send it cross-origin automatically
  if (req.headers.authorization?.startsWith('Bearer ')) {
    return next();
  }

  // If using cookies, ensure request originates from the trusted client or includes custom header
  const origin = req.headers.origin;
  const customHeader = req.headers['x-csrf-token'] || req.headers['x-requested-with'];

  // Check origin header if present
  if (origin && origin !== env.CLIENT_URL) {
    if (env.NODE_ENV === 'development' && (origin.includes('localhost') || origin.includes('127.0.0.1'))) {
      // Allowed in local development
      return next();
    }
    return next(AppError.forbidden('CSRF protection: request origin mismatch'));
  }

  // Require custom header or valid origin
  if (!origin && !customHeader && env.NODE_ENV !== 'test') {
    return next(AppError.forbidden('CSRF protection: missing verification header'));
  }

  next();
}
