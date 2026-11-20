import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import { app } from '../src/app';
import { prisma } from '../src/config/database';
import { authService } from '../src/modules/auth/auth.service';

describe('Complete Student Registration Workflow (/api/v1/auth/register -> Approval -> Login)', () => {
  const adminToken = authService.generateToken({
    userId: 'user-admin-1',
    email: 'admin@hostpilot.dev',
    role: 'ADMIN',
  });

  beforeEach(() => {
    vi.restoreAllMocks();
  });

  const validRegistrationPayload = {
    name: 'আব্দুল্লাহ আল মামুন',
    email: 'mamun@campus.edu.bd',
    password: 'Password#2026!',
    phone: '01799887766',
    department: 'CSE',
    rollNumber: '2022-CSE-099',
    session: '2022-23',
    batch: '23',
    bloodGroup: 'O+',
    gender: 'MALE' as const,
    dateOfBirth: '2004-05-15',
    address: 'মিরপুর-১০, ঢাকা',
    preferredRoomType: 'DOUBLE' as const,
    guardianName: 'মোঃ রফিকুল ইসলাম',
    guardianRelation: 'পিতা',
    guardianPhone: '01899887766',
  };

  it('1. should validate input fields and reject invalid email/phone (400 Bad Request)', async () => {
    const invalidPayload = {
      ...validRegistrationPayload,
      email: 'invalid-email-format',
      phone: '123', // too short
    };

    const res = await request(app)
      .post('/api/v1/auth/register')
      .send(invalidPayload);

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('2. should reject duplicate email address with 409 Conflict', async () => {
    vi.spyOn(prisma.user, 'findUnique').mockResolvedValueOnce({
      id: 'existing-id',
      email: 'mamun@campus.edu.bd',
    } as any);

    const res = await request(app)
      .post('/api/v1/auth/register')
      .send(validRegistrationPayload);

    expect(res.status).toBe(409);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('CONFLICT');
    expect(res.body.error.message).toContain('ইমেইল দিয়ে ইতিমধ্যে একটি অ্যাকাউন্ট নিবন্ধিত রয়েছে');
  });

  it('3. should successfully register student with PENDING status in an atomic transaction', async () => {
    vi.spyOn(prisma.user, 'findUnique').mockResolvedValueOnce(null);
    vi.spyOn(prisma.student, 'count').mockResolvedValueOnce(5);
    vi.spyOn(prisma.admission, 'count').mockResolvedValueOnce(12);

    const mockCreatedUser = {
      id: 'new-user-id-1',
      name: 'আব্দুল্লাহ আল মামুন',
      email: 'mamun@campus.edu.bd',
      role: 'STUDENT',
      status: 'INACTIVE',
    };

    const mockCreatedStudent = {
      id: 'new-student-id-1',
      userId: 'new-user-id-1',
      studentCode: 'HP-STU-2026-006',
      status: 'INACTIVE',
    };

    const mockCreatedAdmission = {
      id: 'new-adm-id-1',
      applicationNumber: 'HP-ADM-2026-0013',
      status: 'PENDING',
    };

    vi.spyOn(prisma, '$transaction').mockImplementation(async (callback: any) => {
      return callback({
        user: { create: vi.fn().mockResolvedValue(mockCreatedUser) },
        student: { create: vi.fn().mockResolvedValue(mockCreatedStudent) },
        guardian: { create: vi.fn().mockResolvedValue({ id: 'guard-1' }) },
        admission: { create: vi.fn().mockResolvedValue(mockCreatedAdmission) },
      });
    });

    const res = await request(app)
      .post('/api/v1/auth/register')
      .send(validRegistrationPayload);

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.studentCode).toBe('HP-STU-2026-006');
    expect(res.body.data.applicationNumber).toBe('HP-ADM-2026-0013');
    expect(res.body.data.status).toBe('PENDING');
  });

  it('4. should BLOCK pending/inactive student from logging in (403 Forbidden)', async () => {
    vi.spyOn(prisma.user, 'findUnique').mockResolvedValueOnce({
      id: 'new-user-id-1',
      email: 'mamun@campus.edu.bd',
      passwordHash: await authService.hashPassword('Password#2026!'),
      role: 'STUDENT',
      status: 'INACTIVE', // Pending approval
      student: { id: 'new-student-id-1' },
    } as any);

    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({
        email: 'mamun@campus.edu.bd',
        password: 'Password#2026!',
      });

    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('FORBIDDEN');
    expect(res.body.error.message).toContain('inactive or suspended');
  });

  it('5. should ALLOW student to log in once Admin approves account (status ACTIVE)', async () => {
    vi.spyOn(prisma.user, 'findUnique').mockResolvedValueOnce({
      id: 'new-user-id-1',
      email: 'mamun@campus.edu.bd',
      name: 'আব্দুল্লাহ আল মামুন',
      passwordHash: await authService.hashPassword('Password#2026!'),
      role: 'STUDENT',
      status: 'ACTIVE', // Approved by Admin!
      student: {
        id: 'new-student-id-1',
        studentCode: 'HP-STU-2026-006',
        department: 'CSE',
        rollNumber: '2022-CSE-099',
      },
    } as any);

    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({
        email: 'mamun@campus.edu.bd',
        password: 'Password#2026!',
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty('token');
    expect(res.body.data.user.email).toBe('mamun@campus.edu.bd');
    expect(res.body.data.user.status).toBe('ACTIVE');
    expect(res.body.data.user.studentCode).toBe('HP-STU-2026-006');
  });
});
