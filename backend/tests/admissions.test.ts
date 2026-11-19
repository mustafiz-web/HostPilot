import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import { app } from '../src/app';
import { prisma } from '../src/config/database';
import { authService } from '../src/modules/auth/auth.service';

describe('Admissions API (/api/v1/admissions)', () => {
  const adminToken = authService.generateToken({
    userId: 'user-admin-1',
    email: 'admin@hostpilot.dev',
    role: 'ADMIN',
  });

  const studentToken = authService.generateToken({
    userId: 'user-student-1',
    email: 'tanvir@campus.edu.bd',
    role: 'STUDENT',
    studentId: 'student-id-1',
  });

  const sampleAdmission = {
    id: 'adm-uuid-1',
    applicationNumber: 'HP-ADM-2026-0001',
    applicantName: 'আরিফুল ইসলাম',
    email: 'ariful@campus.edu.bd',
    phone: '01711223344',
    gender: 'MALE' as const,
    dateOfBirth: new Date('2004-01-01'),
    bloodGroup: 'A+',
    address: 'মিরপুর, ঢাকা',
    preferredRoomType: 'DOUBLE' as const,
    guardianName: 'মো. রফিকুল ইসলাম',
    guardianRelation: 'পিতা',
    guardianPhone: '01811223344',
    status: 'PENDING' as const,
    appliedAt: new Date(),
    reviewedAt: null,
    reviewedByUserId: null,
    decisionNote: null,
    studentId: null,
    reviewedByUser: null,
  };

  beforeEach(() => {
    vi.restoreAllMocks();
    vi.spyOn(authService, 'getUserById').mockImplementation(async (id: string) => {
      if (id === 'user-admin-1') {
        return {
          id: 'user-admin-1',
          email: 'admin@hostpilot.dev',
          name: 'System Admin',
          role: 'ADMIN',
          status: 'ACTIVE',
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
        } as any;
      }
      return null;
    });
  });

  describe('1. Submit Application (POST /api/v1/admissions)', () => {
    const validPayload = {
      applicantName: 'আরিফুল ইসলাম',
      email: 'ariful@campus.edu.bd',
      phone: '01711223344',
      gender: 'MALE',
      dateOfBirth: '2004-01-01',
      bloodGroup: 'A+',
      address: 'মিরপুর, ঢাকা',
      preferredRoomType: 'DOUBLE',
      guardianName: 'মো. রফিকুল ইসলাম',
      guardianRelation: 'পিতা',
      guardianPhone: '01811223344',
    };

    it('should allow public submission without authentication', async () => {
      vi.spyOn(prisma.admission, 'count').mockResolvedValue(0);
      vi.spyOn(prisma.admission, 'create').mockResolvedValue(sampleAdmission as any);

      const res = await request(app)
        .post('/api/v1/admissions')
        .send(validPayload);

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.applicationNumber).toBe('HP-ADM-2026-0001');
    });

    it('should validate inputs using Zod schema (400 Bad Request)', async () => {
      const res = await request(app)
        .post('/api/v1/admissions')
        .send({ applicantName: 'A' }); // invalid

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('VALIDATION_ERROR');
    });
  });

  describe('2. List Applications (GET /api/v1/admissions)', () => {
    it('should allow ADMIN to retrieve applications list', async () => {
      vi.spyOn(prisma.admission, 'count').mockResolvedValue(1);
      vi.spyOn(prisma.admission, 'findMany').mockResolvedValue([sampleAdmission as any]);

      const res = await request(app)
        .get('/api/v1/admissions?page=1&limit=10')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
    });

    it('should block STUDENT from accessing admissions list (403 Forbidden)', async () => {
      const res = await request(app)
        .get('/api/v1/admissions')
        .set('Authorization', `Bearer ${studentToken}`);

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
    });
  });

  describe('3. Update Application Status (PATCH /api/v1/admissions/:id/status)', () => {
    it('should allow ADMIN to review and approve application', async () => {
      vi.spyOn(prisma.admission, 'findUnique').mockResolvedValue(sampleAdmission as any);
      vi.spyOn(prisma.admission, 'update').mockResolvedValue({
        ...sampleAdmission,
        status: 'APPROVED',
        decisionNote: 'যোগ্য বিবেচিত',
      } as any);

      const res = await request(app)
        .patch('/api/v1/admissions/adm-uuid-1/status')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ status: 'APPROVED', decisionNote: 'যোগ্য বিবেচিত' });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.status).toBe('APPROVED');
    });

    it('should return 404 when application does not exist', async () => {
      vi.spyOn(prisma.admission, 'findUnique').mockResolvedValue(null);

      const res = await request(app)
        .patch('/api/v1/admissions/non-existent/status')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ status: 'APPROVED' });

      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
    });
  });
});
