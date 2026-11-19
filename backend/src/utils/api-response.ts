import { Response } from 'express';

export interface ApiSuccessEnvelope<T = unknown> {
  success: true;
  data: T;
  message?: string;
  meta?: Record<string, unknown>;
}

export interface ApiErrorEnvelope {
  success: false;
  error: {
    code: string;
    message: string;
    details?: unknown[];
  };
}

export const ApiResponse = {
  success<T>(
    res: Response,
    data: T,
    message: string = 'Operation completed successfully',
    statusCode: number = 200,
    meta?: Record<string, unknown>
  ): Response {
    const payload: ApiSuccessEnvelope<T> = {
      success: true,
      data,
      message,
      ...(meta ? { meta } : {}),
    };
    return res.status(statusCode).json(payload);
  },

  created<T>(
    res: Response,
    data: T,
    message: string = 'Resource created successfully'
  ): Response {
    return ApiResponse.success(res, data, message, 201);
  },

  error(
    res: Response,
    code: string,
    message: string,
    statusCode: number = 500,
    details?: unknown[]
  ): Response {
    const payload: ApiErrorEnvelope = {
      success: false,
      error: {
        code,
        message,
        ...(details ? { details } : {}),
      },
    };
    return res.status(statusCode).json(payload);
  },
};
