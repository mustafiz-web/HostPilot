import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/app-error';

/**
 * Enforces student data ownership.
 * Admins are permitted full access.
 * Students can only access resources where the parameter matches their own studentId (or userId).
 */
export function requireStudentOwnership(paramKey: string = 'id') {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      return next(AppError.unauthorized('Authentication is required'));
    }

    // Admins bypass ownership check
    if (req.user.role === 'ADMIN') {
      return next();
    }

    // For students, verify ID matches
    const targetId = req.params[paramKey];

    const isMatch =
      (req.user.studentId && req.user.studentId === targetId) ||
      req.user.id === targetId ||
      targetId === 'me';

    if (!isMatch) {
      return next(
        AppError.forbidden('Access denied: students are strictly prohibited from accessing another student’s records')
      );
    }

    next();
  };
}
