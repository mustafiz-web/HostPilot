import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import express from 'express';
import cookieParser from 'cookie-parser';
import bcrypt from 'bcryptjs';
import { app } from '../src/app';
import { prisma } from '../src/config/database';
import { authService } from '../src/modules/auth/auth.service';
import { authenticate } from '../src/middlewares/authenticate.middleware';
import { authorize } from '../src/middlewares/authorize.middleware';
import { requireStudentOwnership } from '../src/middlewares/ownership.middleware';
import { errorHandlerMiddleware } from '../src/middlewares/error-handler.middleware';

describe('Authentication & Authorization Suite (/api/v1/auth)', () => {
  const mockAdminUser = {
    id: 'user-admin-1',
    email: 'admin@hostpilot.dev',
    name: 'Administrator',
    passwordHash: '',
    role: 'ADMIN' as const,
    status: 'ACTIVE' as const,
    student: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockStudentUser = {
    id: 'user-student-1',
    email: 'tanvir@campus.edu.bd',
    name: 'Tanvir Ahmed',
    passwordHash: '',
    role: 'STUDENT' as const,
    status: 'ACTIVE' as const,
    student: {
      id: 'student-tanvir-001',
      userId: 'user-student-1',
      studentCode: 'HP-STU-2026-001',
      department: 'CSE',
      rollNumber: '045',
      session: '2022-23',
      batch: '23',
      bloodGroup: 'B+',
      phone: '01711223344',
      address: 'Dhaka',
      dateOfBirth: null,
      status: 'ACTIVE' as const,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    // Generate actual bcrypt hash for testing
    const hash = await bcrypt.hash('CorrectPass123!', 10);
    mockAdminUser.passwordHash = hash;
    mockStudentUser.passwordHash = hash;
    vi.restoreAllMocks();
  });

  describe('1. Login Endpoint (POST /api/v1/auth/login)', () => {
    it('should successfully log in with valid credentials and return token & HttpOnly cookie', async () => {
      vi.spyOn(prisma.user, 'findUnique').mockResolvedValue(mockAdminUser as any);

      const res = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: 'admin@hostpilot.dev',
          password: 'CorrectPass123!',
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.token).toBeDefined();
      expect(res.body.data.user.email).toBe('admin@hostpilot.dev');
      expect(res.body.data.user.role).toBe('ADMIN');

      // Crucial security check: passwordHash must NEVER be exposed
      expect(res.body.data.user.passwordHash).toBeUndefined();
      expect(JSON.stringify(res.body)).not.toContain('CorrectPass123!');

      // Verify Set-Cookie header is HttpOnly and Lax
      const cookies = res.headers['set-cookie'];
      expect(cookies).toBeDefined();
      expect(cookies[0]).toContain('HttpOnly');
      expect(cookies[0]).toContain('SameSite=Lax');
    });

    it('should reject login when password is incorrect with safe error', async () => {
      vi.spyOn(prisma.user, 'findUnique').mockResolvedValue(mockAdminUser as any);

      const res = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: 'admin@hostpilot.dev',
          password: 'WrongPassword!',
        });

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('UNAUTHORIZED');
      expect(res.body.error.message).toBe('Invalid email or password');
    });

    it('should reject login when user does not exist with identical safe error', async () => {
      vi.spyOn(prisma.user, 'findUnique').mockResolvedValue(null);

      const res = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: 'nonexistent@hostpilot.dev',
          password: 'SomePassword123!',
        });

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
      expect(res.body.error.message).toBe('Invalid email or password');
    });

    it('should reject login for inactive or suspended users with 403 Forbidden', async () => {
      const suspendedUser = { ...mockStudentUser, status: 'SUSPENDED' };
      vi.spyOn(prisma.user, 'findUnique').mockResolvedValue(suspendedUser as any);

      const res = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: 'tanvir@campus.edu.bd',
          password: 'CorrectPass123!',
        });

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
      expect(res.body.error.message).toContain('inactive or suspended');
    });

    it('should reject malformed email or short password via Zod validation', async () => {
      const res = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: 'not-an-email',
          password: '123',
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('VALIDATION_ERROR');
    });
  });

  describe('2. Protected Route & Current User (GET /api/v1/auth/me)', () => {
    it('should return current user when valid Bearer token is provided', async () => {
      vi.spyOn(prisma.user, 'findUnique').mockResolvedValue(mockStudentUser as any);

      const token = authService.generateToken({
        userId: mockStudentUser.id,
        email: mockStudentUser.email,
        role: mockStudentUser.role,
        studentId: mockStudentUser.student.id,
      });

      const res = await request(app)
        .get('/api/v1/auth/me')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.id).toBe(mockStudentUser.id);
      expect(res.body.data.studentId).toBe(mockStudentUser.student.id);
      expect(res.body.data.studentCode).toBe(mockStudentUser.student.studentCode);
      expect(res.body.data.passwordHash).toBeUndefined();
    });

    it('should return current user when valid cookie is provided', async () => {
      vi.spyOn(prisma.user, 'findUnique').mockResolvedValue(mockAdminUser as any);

      const token = authService.generateToken({
        userId: mockAdminUser.id,
        email: mockAdminUser.email,
        role: mockAdminUser.role,
      });

      const res = await request(app)
        .get('/api/v1/auth/me')
        .set('Cookie', [`token=${token}`]);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.email).toBe(mockAdminUser.email);
    });

    it('should reject with 401 when unauthenticated (no token or cookie)', async () => {
      const res = await request(app).get('/api/v1/auth/me');

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('UNAUTHORIZED');
      expect(res.body.error.message).toContain('Authentication token is required');
    });

    it('should reject with 401 when token is forged or expired', async () => {
      const res = await request(app)
        .get('/api/v1/auth/me')
        .set('Authorization', 'Bearer forged.invalid.token');

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
      expect(res.body.error.message).toContain('Invalid or expired authentication token');
    });
  });

  describe('3. Logout Endpoint (POST /api/v1/auth/logout)', () => {
    it('should clear the token cookie on logout', async () => {
      const token = authService.generateToken({
        userId: mockAdminUser.id,
        email: mockAdminUser.email,
        role: mockAdminUser.role,
      });

      const res = await request(app)
        .post('/api/v1/auth/logout')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);

      const cookies = res.headers['set-cookie'];
      expect(cookies[0]).toMatch(/token=;/);
    });
  });

  describe('4. Role-based Authorization & Student Data Ownership Guard', () => {
    // Isolated express router to test authorize and ownership guards
    const guardApp = express();
    guardApp.use(express.json());
    guardApp.use(cookieParser());

    // Admin only endpoint
    guardApp.get(
      '/admin-only-area',
      authenticate,
      authorize('ADMIN'),
      (_req, res) => {
        res.status(200).json({ success: true, message: 'Welcome Admin' });
      }
    );

    // Student profile endpoint with strict ownership
    guardApp.get(
      '/students/:id/details',
      authenticate,
      requireStudentOwnership('id'),
      (req, res) => {
        res.status(200).json({ success: true, requestedId: req.params.id, message: 'Access granted' });
      }
    );

    guardApp.use(errorHandlerMiddleware);

    it('should allow ADMIN to access admin-only endpoints', async () => {
      const adminToken = authService.generateToken({
        userId: 'admin-id-1',
        email: 'admin@hostpilot.dev',
        role: 'ADMIN',
      });

      const res = await request(guardApp)
        .get('/admin-only-area')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.message).toBe('Welcome Admin');
    });

    it('should block STUDENT from accessing admin-only endpoints with 403 Forbidden', async () => {
      const studentToken = authService.generateToken({
        userId: 'student-user-1',
        email: 'student@hostpilot.dev',
        role: 'STUDENT',
        studentId: 'student-profile-1',
      });

      const res = await request(guardApp)
        .get('/admin-only-area')
        .set('Authorization', `Bearer ${studentToken}`);

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('FORBIDDEN');
      expect(res.body.error.message).toContain('Access denied');
    });

    it('should allow STUDENT to access their OWN records', async () => {
      const studentToken = authService.generateToken({
        userId: 'student-user-1',
        email: 'student@hostpilot.dev',
        role: 'STUDENT',
        studentId: 'student-profile-1',
      });

      const res = await request(guardApp)
        .get('/students/student-profile-1/details')
        .set('Authorization', `Bearer ${studentToken}`);

      expect(res.status).toBe(200);
      expect(res.body.requestedId).toBe('student-profile-1');
      expect(res.body.message).toBe('Access granted');
    });

    it('should STRICTLY FORBID a student from accessing another student’s records by changing IDs', async () => {
      const studentToken = authService.generateToken({
        userId: 'student-user-1',
        email: 'student@hostpilot.dev',
        role: 'STUDENT',
        studentId: 'student-profile-1',
      });

      // Student tries to access ID of another student: 'student-profile-999'
      const res = await request(guardApp)
        .get('/students/student-profile-999/details')
        .set('Authorization', `Bearer ${studentToken}`);

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('FORBIDDEN');
      expect(res.body.error.message).toContain('students are strictly prohibited from accessing another student’s records');
    });

    it('should allow ADMIN to access any student record', async () => {
      const adminToken = authService.generateToken({
        userId: 'admin-id-1',
        email: 'admin@hostpilot.dev',
        role: 'ADMIN',
      });

      const res = await request(guardApp)
        .get('/students/student-profile-999/details')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.requestedId).toBe('student-profile-999');
    });
  });
});
