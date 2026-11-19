import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import { app } from '../src/app';
import { prisma } from '../src/config/database';
import { authService } from '../src/modules/auth/auth.service';

describe('Students & Guardians API (/api/v1/students)', () => {
  const adminToken = authService.generateToken({
    userId: 'user-admin-1',
    email: 'admin@hostpilot.dev',
    role: 'ADMIN',
  });

  const student1Token = authService.generateToken({
    userId: 'user-student-1',
    email: 'tanvir@campus.edu.bd',
    role: 'STUDENT',
    studentId: 'student-id-1',
  });

  const student2Token = authService.generateToken({
    userId: 'user-student-2',
    email: 'mehedi@campus.edu.bd',
    role: 'STUDENT',
    studentId: 'student-id-2',
  });

  const sampleStudentData = {
    id: 'student-id-1',
    userId: 'user-student-1',
    studentCode: 'HP-STU-2026-001',
    phone: '01711223344',
    department: 'CSE',
    rollNumber: '045',
    session: '2022-23',
    batch: '23',
    bloodGroup: 'B+',
    address: 'Uttaara, Dhaka',
    dateOfBirth: new Date('2003-05-15'),
    status: 'ACTIVE' as const,
    createdAt: new Date(),
    updatedAt: new Date(),
    user: {
      id: 'user-student-1',
      name: 'Tanvir Ahmed',
      email: 'tanvir@campus.edu.bd',
      role: 'STUDENT' as const,
      status: 'ACTIVE' as const,
    },
    guardians: [
      {
        id: 'g-1',
        name: 'Rafiqul Islam',
        relationship: 'পিতা',
        phone: '01811987654',
        emergencyContact: '01811987654',
      },
    ],
    allocations: [],
  };

  beforeEach(() => {
    vi.restoreAllMocks();

    // Mock authService.getUserById so authenticate middleware always finds active users
    vi.spyOn(authService, 'getUserById').mockImplementation(async (id: string) => {
      if (id === 'user-admin-1') {
        return {
          id: 'user-admin-1',
          email: 'admin@hostpilot.dev',
          name: 'System Admin',
          role: 'ADMIN',
          status: 'ACTIVE',
          student: null,
        } as any;
      }
      if (id === 'user-student-1') {
        return {
          id: 'user-student-1',
          email: 'tanvir@campus.edu.bd',
          name: 'Tanvir Ahmed',
          role: 'STUDENT',
          status: 'ACTIVE',
          studentId: 'student-id-1',
          student: { id: 'student-id-1' },
        } as any;
      }
      if (id === 'user-student-2') {
        return {
          id: 'user-student-2',
          email: 'mehedi@campus.edu.bd',
          name: 'Mehedi Hasan',
          role: 'STUDENT',
          status: 'ACTIVE',
          studentId: 'student-id-2',
          student: { id: 'student-id-2' },
        } as any;
      }
      return null;
    });
  });

  describe('1. Create Student (POST /api/v1/students)', () => {
    const validStudentPayload = {
      name: 'Naimur Rahman',
      email: 'naimur@campus.edu.bd',
      studentCode: 'HP-STU-2026-099',
      phone: '01911223344',
      department: 'EEE',
      rollNumber: '102',
      session: '2022-23',
      batch: '23',
      address: 'Mirpur, Dhaka',
      guardianName: 'Abdur Rahim',
      guardianRelation: 'পিতা',
      guardianPhone: '01711998877',
    };

    it('should allow ADMIN to atomically create a student with User and Guardian', async () => {
      vi.spyOn(prisma.user, 'findUnique').mockResolvedValue(null);
      vi.spyOn(prisma.student, 'findUnique').mockResolvedValue(null);
      vi.spyOn(prisma, '$transaction').mockImplementation(async (callback: any) => {
        return callback({
          user: { create: vi.fn().mockResolvedValue({ id: 'new-user-id' }) },
          student: { create: vi.fn().mockResolvedValue({ id: 'new-student-id' }) },
          guardian: { create: vi.fn().mockResolvedValue({ id: 'new-guardian-id' }) },
        });
      });
      vi.spyOn(prisma.student, 'findFirst').mockResolvedValue({
        ...sampleStudentData,
        id: 'new-student-id',
        studentCode: 'HP-STU-2026-099',
      } as any);

      const res = await request(app)
        .post('/api/v1/students')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(validStudentPayload);

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.studentCode).toBe('HP-STU-2026-099');
    });

    it('should reject student creation when called by a STUDENT (403 Forbidden)', async () => {
      const res = await request(app)
        .post('/api/v1/students')
        .set('Authorization', `Bearer ${student1Token}`)
        .send(validStudentPayload);

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('FORBIDDEN');
    });

    it('should reject duplicate email with 409 Conflict', async () => {
      vi.spyOn(prisma.user, 'findUnique').mockResolvedValue({ id: 'existing-id' } as any);

      const res = await request(app)
        .post('/api/v1/students')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(validStudentPayload);

      expect(res.status).toBe(409);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('CONFLICT');
    });

    it('should reject invalid input via Zod validation (400 Bad Request)', async () => {
      const invalidPayload = {
        name: 'N', // too short
        email: 'invalid-email',
      };

      const res = await request(app)
        .post('/api/v1/students')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(invalidPayload);

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('VALIDATION_ERROR');
    });
  });

  describe('2. List Students (GET /api/v1/students)', () => {
    it('should allow ADMIN to retrieve paginated student list', async () => {
      vi.spyOn(prisma.student, 'findMany').mockResolvedValue([sampleStudentData as any]);
      vi.spyOn(prisma.student, 'count').mockResolvedValue(1);

      const res = await request(app)
        .get('/api/v1/students?page=1&limit=10')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.meta.total).toBe(1);
    });

    it('should block STUDENT from accessing all students list (403 Forbidden)', async () => {
      const res = await request(app)
        .get('/api/v1/students')
        .set('Authorization', `Bearer ${student1Token}`);

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
    });
  });

  describe('3. Student Details & Ownership (GET /api/v1/students/:id)', () => {
    it('should allow ADMIN to view any student record', async () => {
      vi.spyOn(prisma.student, 'findFirst').mockResolvedValue(sampleStudentData as any);

      const res = await request(app)
        .get('/api/v1/students/student-id-1')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.id).toBe('student-id-1');
    });

    it('should allow STUDENT to view their OWN record', async () => {
      vi.spyOn(prisma.student, 'findFirst').mockResolvedValue(sampleStudentData as any);

      const res = await request(app)
        .get('/api/v1/students/student-id-1')
        .set('Authorization', `Bearer ${student1Token}`);

      expect(res.status).toBe(200);
      expect(res.body.data.id).toBe('student-id-1');
    });

    it('should strictly BLOCK student from viewing ANOTHER student record (403 Forbidden)', async () => {
      // student1 attempts to access student-id-2
      const res = await request(app)
        .get('/api/v1/students/student-id-2')
        .set('Authorization', `Bearer ${student1Token}`);

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('FORBIDDEN');
      expect(res.body.error.message).toContain('students are strictly prohibited from accessing another student’s records');
    });

    it('should return 404 when student record is not found', async () => {
      vi.spyOn(prisma.student, 'findFirst').mockResolvedValue(null);

      const res = await request(app)
        .get('/api/v1/students/non-existent-student')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('NOT_FOUND');
    });
  });

  describe('4. Logged-in Student Profile (GET /api/v1/students/me/profile)', () => {
    it('should return logged-in student personal profile', async () => {
      vi.spyOn(prisma.student, 'findFirst').mockResolvedValue(sampleStudentData as any);

      const res = await request(app)
        .get('/api/v1/students/me/profile')
        .set('Authorization', `Bearer ${student1Token}`);

      expect(res.status).toBe(200);
      expect(res.body.data.studentCode).toBe('HP-STU-2026-001');
    });
  });

  describe('5. Update Student Status (PATCH /api/v1/students/:id/status)', () => {
    it('should allow ADMIN to change student status', async () => {
      vi.spyOn(prisma.student, 'findFirst').mockResolvedValue(sampleStudentData as any);
      vi.spyOn(prisma.student, 'update').mockResolvedValue({ ...sampleStudentData, status: 'INACTIVE' } as any);
      vi.spyOn(prisma.user, 'update').mockResolvedValue({ id: 'user-student-1', status: 'INACTIVE' } as any);

      const res = await request(app)
        .patch('/api/v1/students/student-id-1/status')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ status: 'INACTIVE' });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it('should block STUDENT from changing student status (403 Forbidden)', async () => {
      const res = await request(app)
        .patch('/api/v1/students/student-id-1/status')
        .set('Authorization', `Bearer ${student1Token}`)
        .send({ status: 'INACTIVE' });

      expect(res.status).toBe(403);
    });
  });
});
