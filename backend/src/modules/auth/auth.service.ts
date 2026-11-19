import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../../config/database';
import { env } from '../../config/env';
import { AppError } from '../../utils/app-error';
import { AuthenticatedUser, JwtPayload } from './auth.types';

export class AuthService {
  public async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, 10);
  }

  public async comparePassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }

  public generateToken(payload: JwtPayload): string {
    return jwt.sign(payload, env.JWT_SECRET, {
      expiresIn: env.JWT_EXPIRES_IN as any,
    });
  }

  public verifyToken(token: string): JwtPayload {
    try {
      return jwt.verify(token, env.JWT_SECRET) as JwtPayload;
    } catch {
      throw AppError.unauthorized('Invalid or expired authentication token');
    }
  }

  public async authenticateUser(email: string, password: string): Promise<{ user: AuthenticatedUser; token: string }> {
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
      include: {
        student: true,
      },
    });

    if (!user) {
      throw AppError.unauthorized('Invalid email or password');
    }

    if (user.status !== 'ACTIVE') {
      throw AppError.forbidden('Your account is currently inactive or suspended. Please contact administration.');
    }

    const isPasswordValid = await this.comparePassword(password, user.passwordHash);
    if (!isPasswordValid) {
      throw AppError.unauthorized('Invalid email or password');
    }

    const payload: JwtPayload = {
      userId: user.id,
      email: user.email,
      role: user.role,
      studentId: user.student?.id,
    };

    const token = this.generateToken(payload);

    const authenticatedUser: AuthenticatedUser = {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      status: user.status,
      studentId: user.student?.id,
      studentCode: user.student?.studentCode,
      department: user.student?.department,
      rollNumber: user.student?.rollNumber,
    };

    return { user: authenticatedUser, token };
  }

  public async getUserById(userId: string): Promise<AuthenticatedUser> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        student: true,
      },
    });

    if (!user) {
      throw AppError.notFound('User account not found');
    }

    if (user.status !== 'ACTIVE') {
      throw AppError.forbidden('Your account is currently inactive or suspended.');
    }

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      status: user.status,
      studentId: user.student?.id,
      studentCode: user.student?.studentCode,
      department: user.student?.department,
      rollNumber: user.student?.rollNumber,
    };
  }
}

export const authService = new AuthService();
