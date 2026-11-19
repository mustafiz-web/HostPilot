export class AppError extends Error {
  public readonly statusCode: number;
  public readonly errorCode: string;
  public readonly details?: unknown[];
  public readonly isOperational: boolean;

  constructor(
    message: string,
    statusCode: number = 500,
    errorCode: string = 'INTERNAL_ERROR',
    details?: unknown[]
  ) {
    super(message);
    this.statusCode = statusCode;
    this.errorCode = errorCode;
    this.details = details;
    this.isOperational = true;

    Object.setPrototypeOf(this, new.target.prototype);
    Error.captureStackTrace(this, this.constructor);
  }

  static badRequest(message: string, details?: unknown[]): AppError {
    return new AppError(message, 400, 'BAD_REQUEST', details);
  }

  static validation(message: string, details?: unknown[]): AppError {
    return new AppError(message, 400, 'VALIDATION_ERROR', details);
  }

  static unauthorized(message: string = 'Authentication required'): AppError {
    return new AppError(message, 401, 'UNAUTHORIZED');
  }

  static forbidden(message: string = 'Access denied'): AppError {
    return new AppError(message, 403, 'FORBIDDEN');
  }

  static notFound(message: string = 'Resource not found'): AppError {
    return new AppError(message, 404, 'NOT_FOUND');
  }

  static conflict(message: string = 'Resource conflict'): AppError {
    return new AppError(message, 409, 'CONFLICT');
  }

  static internal(message: string = 'An unexpected internal error occurred'): AppError {
    return new AppError(message, 500, 'INTERNAL_SERVER_ERROR');
  }
}
