import { Request, Response, NextFunction } from 'express';
import { authService } from './auth.service';
import { ApiResponse } from '../../utils/api-response';
import { env } from '../../config/env';

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  path: '/',
};

export class AuthController {
  public async login(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { email, password } = req.body;
      const { user, token } = await authService.authenticateUser(email, password);

      // Set secure HttpOnly cookie
      res.cookie('token', token, COOKIE_OPTIONS);

      ApiResponse.success(
        res,
        {
          user,
          token,
        },
        'Sign in successful'
      );
    } catch (error) {
      next(error);
    }
  }

  public async logout(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      // Clear auth cookie
      res.clearCookie('token', {
        httpOnly: true,
        secure: env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
      });

      ApiResponse.success(res, null, 'Logged out successfully');
    } catch (error) {
      next(error);
    }
  }

  public async getMe(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        return next(new Error('User context missing'));
      }
      ApiResponse.success(res, req.user, 'Current user profile');
    } catch (error) {
      next(error);
    }
  }

  public async forgotPassword(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      // In MVP policy, password resets are reviewed and issued by hostel administration
      ApiResponse.success(
        res,
        null,
        'Password reset request received. The hostel administration will verify your identity.'
      );
    } catch (error) {
      next(error);
    }
  }
}

export const authController = new AuthController();
