import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import { app } from '../src/app';
import { prisma } from '../src/config/database';
import { authService } from '../src/modules/auth/auth.service';

describe('Dashboard Analytics & Relationship Verification (/api/v1/dashboard)', () => {
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

  beforeEach(() => {
    vi.restoreAllMocks();
    vi.spyOn(authService, 'getUserById').mockImplementation(async (id: string) => {
      if (id === 'user-admin-1') {
        return {
          id: 'user-admin-1',
          email: 'admin@hostpilot.dev',
          name: 'Hostel Admin',
          role: 'ADMIN' as const,
          status: 'ACTIVE' as const,
        } as any;
      }
      if (id === 'user-student-1') {
        return {
          id: 'user-student-1',
          email: 'tanvir@campus.edu.bd',
          name: 'তানভীর আহমেদ',
          role: 'STUDENT' as const,
          status: 'ACTIVE' as const,
          student: {
            id: 'student-id-1',
            studentCode: 'HP-STU-2026-001',
          },
        } as any;
      }
      return null;
    });
  });

  describe('1. Admin Dashboard (/api/v1/dashboard/admin)', () => {
    it('should return real aggregated database statistics for ADMIN', async () => {
      vi.spyOn(prisma.student, 'count')
        .mockResolvedValueOnce(50) // total
        .mockResolvedValueOnce(45); // active
      vi.spyOn(prisma.room, 'count').mockResolvedValueOnce(20);
      vi.spyOn(prisma.bed, 'count')
        .mockResolvedValueOnce(80) // total
        .mockResolvedValueOnce(60) // occupied
        .mockResolvedValueOnce(20); // available
      vi.spyOn(prisma.payment, 'aggregate').mockResolvedValueOnce({
        _sum: { paidAmount: 250000 as any },
        _count: {} as any,
        _avg: {} as any,
        _min: {} as any,
        _max: {} as any,
      });
      vi.spyOn(prisma.complaint, 'count').mockResolvedValueOnce(3);
      vi.spyOn(prisma.admission, 'findMany').mockResolvedValueOnce([
        {
          id: 'adm-1',
          applicationNumber: 'HP-ADM-2026-0001',
          applicantName: 'আরিফুল ইসলাম',
          email: 'ariful@campus.edu.bd',
          phone: '01711223344',
          preferredRoomType: 'DOUBLE',
          status: 'PENDING',
          appliedAt: new Date(),
        } as any,
      ]);
      vi.spyOn(prisma.payment, 'findMany').mockResolvedValueOnce([]);
      vi.spyOn(prisma.complaint, 'findMany').mockResolvedValueOnce([]);

      const res = await request(app)
        .get('/api/v1/dashboard/admin')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.stats.totalStudents).toBe(50);
      expect(res.body.data.stats.activeStudents).toBe(45);
      expect(res.body.data.stats.totalRooms).toBe(20);
      expect(res.body.data.stats.totalBeds).toBe(80);
      expect(res.body.data.stats.occupiedBeds).toBe(60);
      expect(res.body.data.stats.availableBeds).toBe(20);
      expect(res.body.data.stats.occupancyRate).toBe(75);
      expect(res.body.data.stats.monthlyCollection).toBe(250000);
      expect(res.body.data.recentAdmissions.length).toBe(1);
    });

    it('should FORBID student from accessing admin dashboard (403 Forbidden)', async () => {
      const res = await request(app)
        .get('/api/v1/dashboard/admin')
        .set('Authorization', `Bearer ${studentToken}`);

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('FORBIDDEN');
    });

    it('should REJECT unauthenticated access with 401 Unauthorized', async () => {
      const res = await request(app).get('/api/v1/dashboard/admin');
      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });
  });

  describe('2. Student Dashboard (/api/v1/dashboard/student)', () => {
    it('should return personalized student dashboard for authenticated STUDENT', async () => {
      vi.spyOn(prisma.student, 'findFirst').mockResolvedValueOnce({
        id: 'student-id-1',
        userId: 'user-student-1',
        studentCode: 'HP-STU-2026-001',
        phone: '01711223344',
        department: 'CSE',
        rollNumber: '045',
        session: '2022-23',
        batch: '23',
        status: 'ACTIVE',
        user: {
          id: 'user-student-1',
          name: 'তানভীর আহমেদ',
          email: 'tanvir@campus.edu.bd',
          status: 'ACTIVE',
        },
        guardians: [],
        allocations: [
          {
            id: 'alloc-1',
            startDate: new Date('2026-01-01'),
            bed: {
              bedCode: 'A',
              roomId: 'room-1',
              room: {
                roomNumber: '201',
                floor: 2,
                roomType: 'DOUBLE',
                monthlyRent: 4500 as any,
              },
            },
          },
        ],
      } as any);

      vi.spyOn(prisma.roomAllocation, 'findMany').mockResolvedValueOnce([
        {
          student: {
            department: 'CSE',
            user: { name: 'মেহেদী হাসান' },
          },
          bed: { bedCode: 'B' },
        } as any,
      ]);

      vi.spyOn(prisma.payment, 'findFirst').mockResolvedValueOnce(null);
      vi.spyOn(prisma.complaint, 'findMany').mockResolvedValueOnce([]);
      vi.spyOn(prisma.notice, 'findMany').mockResolvedValueOnce([]);

      const res = await request(app)
        .get('/api/v1/dashboard/student')
        .set('Authorization', `Bearer ${studentToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.profile.name).toBe('তানভীর আহমেদ');
      expect(res.body.data.profile.studentCode).toBe('HP-STU-2026-001');
      expect(res.body.data.allocation.roomNumber).toBe('201');
      expect(res.body.data.allocation.bedCode).toBe('A');
      expect(res.body.data.roommates).toHaveLength(1);
      expect(res.body.data.roommates[0].name).toBe('মেহেদী হাসান');
      expect(res.body.data.roommates[0].bedCode).toBe('B');
      expect(res.body.data.profile).not.toHaveProperty('passwordHash');
    });

    it('should FORBID admin from accessing student personal dashboard (403 Forbidden)', async () => {
      const res = await request(app)
        .get('/api/v1/dashboard/student')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('FORBIDDEN');
    });
  });
});
