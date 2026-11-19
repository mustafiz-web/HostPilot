import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/app-error';
import { ApiResponse } from '../utils/api-response';
import { logger } from '../config/logger';
import { env } from '../config/env';

export function errorHandlerMiddleware(
  err: Error | AppError,
  req: Request,
  res: Response,
  _next: NextFunction
): void {
  // Check if it's our known AppError
  if (err instanceof AppError) {
    logger.warn(`Operational Error: ${err.message}`, {
      code: err.errorCode,
      statusCode: err.statusCode,
      url: req.originalUrl,
      requestId: req.id,
    });

    ApiResponse.error(res, err.errorCode, err.message, err.statusCode, err.details);
    return;
  }

  // Handle JSON parse errors from body-parser
  if ('type' in err && err.type === 'entity.parse.failed') {
    ApiResponse.error(
      res,
      'INVALID_JSON',
      'The request body contains invalid JSON',
      400
    );
    return;
  }

  // Unexpected non-operational error (Bug, DB failure, network fault)
  logger.error(`Unhandled Exception: ${err.message}`, {
    stack: err.stack,
    url: req.originalUrl,
    requestId: req.id,
  });

  const clientMessage = env.NODE_ENV === 'production'
    ? 'An unexpected internal server error occurred'
    : err.message;

  ApiResponse.error(
    res,
    'INTERNAL_SERVER_ERROR',
    clientMessage,
    500
  );
}
