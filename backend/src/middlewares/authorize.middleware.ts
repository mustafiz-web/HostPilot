import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/app-error';

export function authorize(...allowedRoles: Array<'ADMIN' | 'STUDENT'>) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      return next(AppError.unauthorized('Authentication is required'));
    }

    if (!allowedRoles.includes(req.user.role)) {
      return next(
        AppError.forbidden(
          `Access denied: requires one of the following roles [${allowedRoles.join(', ')}]`
        )
      );
    }

    next();
  };
}
