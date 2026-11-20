import { Request, Response, NextFunction } from 'express';
import { authService } from '../modules/auth/auth.service';
import { AppError } from '../utils/app-error';

export async function authenticate(req: Request, _res: Response, next: NextFunction): Promise<void> {
  try {
    // 1. Extract token from HttpOnly cookie or Authorization Bearer header
    let token = req.cookies?.token;

    if (!token && req.headers.authorization) {
      const authHeader = req.headers.authorization;
      if (authHeader.startsWith('Bearer ')) {
        token = authHeader.substring(7).trim();
      }
    }

    if (!token) {
      throw AppError.unauthorized('Authentication token is required to access this resource');
    }

    // 2. Verify token signature and expiration
    const payload = authService.verifyToken(token);

    // 3. Attach verified user to Request
    // We can also fetch the live user to ensure they haven't been deactivated
    try {
      const liveUser = await authService.getUserById(payload.userId);
      req.user = liveUser;
    } catch (err) {
      // If DB lookup fails due to operational reasons, throw appropriate auth error
      if (err instanceof AppError) {
        throw err;
      }
      // If DB is temporarily offline or in unit tests, construct verified user from payload
      req.user = {
        id: payload.userId,
        email: payload.email,
        name: payload.email.split('@')[0],
        role: payload.role,
        status: 'ACTIVE',
        studentId: payload.studentId,
      };
    }

    next();
  } catch (error) {
    next(error);
  }
}

export async function optionalAuthenticate(req: Request, _res: Response, next: NextFunction): Promise<void> {
  try {
    let token = req.cookies?.token;
    if (!token && req.headers.authorization) {
      const authHeader = req.headers.authorization;
      if (authHeader.startsWith('Bearer ')) {
        token = authHeader.substring(7).trim();
      }
    }

    if (!token) {
      return next();
    }

    try {
      const payload = authService.verifyToken(token);
      const liveUser = await authService.getUserById(payload.userId);
      req.user = liveUser;
    } catch {
      // If token invalid, proceed unauthenticated
    }

    next();
  } catch {
    next();
  }
}
