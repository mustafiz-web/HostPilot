import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import { app } from '../src/app';
import { prisma } from '../src/config/database';
import { authService } from '../src/modules/auth/auth.service';

describe('Critical Business Journeys & Concurrency/Security Verification', () => {
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
      if (id === 'user-student-2') {
        return {
          id: 'user-student-2',
          email: 'mehedi@campus.edu.bd',
          name: 'Mehedi Hasan',
          role: 'STUDENT',
          status: 'ACTIVE',
          studentId: 'student-id-2',
        } as any;
      }
      return null;
    });
  });

  describe('Journey 1: Rooms & Beds Creation', () => {
    it('should allow ADMIN to create room with capacity and auto-generate beds', async () => {
      vi.spyOn(prisma.room, 'findUnique').mockResolvedValue(null);
      vi.spyOn(prisma, '$transaction').mockImplementation(async (callback: any) => {
        return callback({
          room: {
            create: vi.fn().mockResolvedValue({
              id: 'room-101',
              roomNumber: '১০১',
              floor: 1,
              capacity: 2,
              roomType: 'DOUBLE',
              monthlyRent: 3500,
              beds: [
                { id: 'bed-1', bedCode: 'A', status: 'AVAILABLE' },
                { id: 'bed-2', bedCode: 'B', status: 'AVAILABLE' },
              ],
            }),
          },
        });
      });

      const res = await request(app)
        .post('/api/v1/rooms')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          roomNumber: '১০১',
          floor: 1,
          capacity: 2,
          roomType: 'DOUBLE',
          monthlyRent: 3500,
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.roomNumber).toBe('১০১');
    });

    it('should reject duplicate room number with 409 Conflict', async () => {
      vi.spyOn(prisma.room, 'findUnique').mockResolvedValue({ id: 'existing-room' } as any);

      const res = await request(app)
        .post('/api/v1/rooms')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          roomNumber: '১০১',
          floor: 1,
          capacity: 2,
          roomType: 'DOUBLE',
          monthlyRent: 3500,
        });

      expect(res.status).toBe(409);
      expect(res.body.error.code).toBe('CONFLICT');
    });
  });

  describe('Journey 2: Bed Allocation & Concurrency Conflicts', () => {
    it('should allocate available bed to eligible student in an atomic transaction', async () => {
      vi.spyOn(prisma, '$transaction').mockImplementation(async (callback: any) => {
        return callback({
          student: { findUnique: vi.fn().mockResolvedValue({ id: 'student-id-1', status: 'ACTIVE' }) },
          roomAllocation: {
            findFirst: vi.fn().mockResolvedValue(null), // no active allocation
            count: vi.fn().mockResolvedValue(0),
            create: vi.fn().mockResolvedValue({
              id: 'alloc-1',
              studentId: 'student-id-1',
              bedId: 'bed-1',
              status: 'ACTIVE',
            }),
          },
          bed: {
            findUnique: vi.fn().mockResolvedValue({
              id: 'bed-1',
              status: 'AVAILABLE',
              roomId: 'room-1',
              room: { capacity: 2 },
            }),
            update: vi.fn().mockResolvedValue({ id: 'bed-1', status: 'OCCUPIED' }),
            count: vi.fn().mockResolvedValue(1),
          },
        });
      });

      const res = await request(app)
        .post('/api/v1/allocations')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          studentId: 'student-id-1',
          bedId: 'bed-1',
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.status).toBe('ACTIVE');
    });

    it('should REJECT concurrent/overlapping allocation if student already has active allocation (409 Conflict)', async () => {
      vi.spyOn(prisma, '$transaction').mockImplementation(async (callback: any) => {
        return callback({
          student: { findUnique: vi.fn().mockResolvedValue({ id: 'student-id-1', status: 'ACTIVE' }) },
          roomAllocation: {
            findFirst: vi.fn().mockResolvedValue({ id: 'existing-alloc', status: 'ACTIVE' }),
          },
        });
      });

      const res = await request(app)
        .post('/api/v1/allocations')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          studentId: 'student-id-1',
          bedId: 'bed-2',
        });

      expect(res.status).toBe(409);
      expect(res.body.error.code).toBe('CONFLICT');
      expect(res.body.error.message).toContain('শিক্ষার্থীর ইতিমধ্যে একটি সক্রিয় সিট বরাদ্দ রয়েছে');
    });

    it('should REJECT allocation if bed is already OCCUPIED (409 Conflict)', async () => {
      vi.spyOn(prisma, '$transaction').mockImplementation(async (callback: any) => {
        return callback({
          student: { findUnique: vi.fn().mockResolvedValue({ id: 'student-id-1', status: 'ACTIVE' }) },
          roomAllocation: {
            findFirst: vi.fn().mockResolvedValue(null),
          },
          bed: {
            findUnique: vi.fn().mockResolvedValue({
              id: 'bed-1',
              status: 'OCCUPIED',
              room: { capacity: 2 },
            }),
          },
        });
      });

      const res = await request(app)
        .post('/api/v1/allocations')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          studentId: 'student-id-1',
          bedId: 'bed-1',
        });

      expect(res.status).toBe(409);
      expect(res.body.error.code).toBe('CONFLICT');
      expect(res.body.error.message).toContain('এই সিটটি বর্তমানে ফাঁকা নেই');
    });
  });

  describe('Journey 3: Payment Recording & Duplicate Billing Period Prevention', () => {
    it('should record valid payment with unique receipt number', async () => {
      vi.spyOn(prisma.student, 'findUnique').mockResolvedValue({ id: 'student-id-1' } as any);
      vi.spyOn(prisma.payment, 'findUnique').mockResolvedValue(null); // no existing payment for this period
      vi.spyOn(prisma.payment, 'count').mockResolvedValue(10);
      vi.spyOn(prisma.payment, 'create').mockResolvedValue({
        id: 'pay-1',
        studentId: 'student-id-1',
        billingPeriod: '2026-03',
        amount: 3500,
        paidAmount: 3500,
        status: 'PAID',
        receiptNumber: 'HP-REC-2026-00011',
      } as any);

      const res = await request(app)
        .post('/api/v1/payments')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          studentId: 'student-id-1',
          billingPeriod: '2026-03',
          amount: 3500,
          paidAmount: 3500,
          paymentMethod: 'CASH',
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.receiptNumber).toBe('HP-REC-2026-00011');
      expect(res.body.data.status).toBe('PAID');
    });

    it('should strictly REJECT duplicate billing period payment for the same student (409 Conflict)', async () => {
      vi.spyOn(prisma.student, 'findUnique').mockResolvedValue({ id: 'student-id-1' } as any);
      vi.spyOn(prisma.payment, 'findUnique').mockResolvedValue({
        id: 'existing-payment',
        billingPeriod: '2026-03',
      } as any);

      const res = await request(app)
        .post('/api/v1/payments')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          studentId: 'student-id-1',
          billingPeriod: '2026-03',
          amount: 3500,
          paidAmount: 3500,
          paymentMethod: 'CASH',
        });

      expect(res.status).toBe(409);
      expect(res.body.error.code).toBe('CONFLICT');
      expect(res.body.error.message).toContain('Duplicate billing period payment');
    });

    it('should allow student to view OWN payments', async () => {
      vi.spyOn(prisma.payment, 'findMany').mockResolvedValue([
        { id: 'pay-1', studentId: 'student-id-1', amount: 3500, billingPeriod: '2026-03' } as any,
      ]);

      const res = await request(app)
        .get('/api/v1/payments/me')
        .set('Authorization', `Bearer ${student1Token}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data[0].billingPeriod).toBe('2026-03');
    });

    it('should strictly FORBID student from viewing another student’s payment receipt by ID (403 Forbidden)', async () => {
      vi.spyOn(prisma.payment, 'findUnique').mockResolvedValue({
        id: 'pay-2',
        studentId: 'student-id-2', // belongs to student 2
        amount: 4000,
      } as any);

      // Student 1 tries to access Student 2's payment
      const res = await request(app)
        .get('/api/v1/payments/pay-2')
        .set('Authorization', `Bearer ${student1Token}`);

      expect(res.status).toBe(403);
      expect(res.body.error.code).toBe('FORBIDDEN');
      expect(res.body.error.message).toContain('prohibited from accessing another student’s payment receipt');
    });
  });

  describe('Journey 4: Complaints & IDOR Protection', () => {
    it('should allow student to submit a complaint', async () => {
      vi.spyOn(prisma.student, 'findUnique').mockResolvedValue({ id: 'student-id-1' } as any);
      vi.spyOn(prisma.complaint, 'create').mockResolvedValue({
        id: 'comp-1',
        studentId: 'student-id-1',
        title: 'ফ্যানের রেগুলেটর নষ্ট',
        category: 'ELECTRICAL',
        status: 'PENDING',
      } as any);

      const res = await request(app)
        .post('/api/v1/complaints')
        .set('Authorization', `Bearer ${student1Token}`)
        .send({
          title: 'ফ্যানের রেগুলেটর নষ্ট',
          category: 'ELECTRICAL',
          description: 'রুমের সিলিং ফ্যানের রেগুলেটর কাজ করছে না',
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.status).toBe('PENDING');
    });

    it('should strictly BLOCK a student from accessing another student’s complaint (403 Forbidden)', async () => {
      vi.spyOn(prisma.complaint, 'findUnique').mockResolvedValue({
        id: 'comp-99',
        studentId: 'student-id-2', // belongs to student 2
        title: 'পানি লাইনে সমস্যা',
      } as any);

      // Student 1 tries to view Student 2's complaint
      const res = await request(app)
        .get('/api/v1/complaints/comp-99')
        .set('Authorization', `Bearer ${student1Token}`);

      expect(res.status).toBe(403);
      expect(res.body.error.code).toBe('FORBIDDEN');
    });

    it('should allow ADMIN to update complaint status to RESOLVED', async () => {
      vi.spyOn(prisma.complaint, 'findUnique').mockResolvedValue({
        id: 'comp-1',
        status: 'PENDING',
      } as any);
      vi.spyOn(prisma.complaint, 'update').mockResolvedValue({
        id: 'comp-1',
        status: 'RESOLVED',
        adminNote: 'ইলেকট্রিশিয়ান গিয়ে ঠিক করে দিয়েছে',
      } as any);

      const res = await request(app)
        .patch('/api/v1/complaints/comp-1/status')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          status: 'RESOLVED',
          adminNote: 'ইলেকট্রিশিয়ান গিয়ে ঠিক করে দিয়েছে',
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.status).toBe('RESOLVED');
    });
  });

  describe('Journey 5: Notices Management', () => {
    it('should allow ADMIN to publish notice', async () => {
      vi.spyOn(prisma.notice, 'create').mockResolvedValue({
        id: 'not-1',
        title: 'হোস্টেল গেট বন্ধের সময়সূচি',
        content: 'রাত ১০টার মধ্যে সকলকে হলে প্রবেশ করতে হবে',
        status: 'PUBLISHED',
      } as any);

      const res = await request(app)
        .post('/api/v1/notices')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          title: 'হোস্টেল গেট বন্ধের সময়সূচি',
          content: 'রাত ১০টার মধ্যে সকলকে হলে প্রবেশ করতে হবে',
          status: 'PUBLISHED',
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.status).toBe('PUBLISHED');
    });

    it('should allow public/students to view published notices', async () => {
      vi.spyOn(prisma.notice, 'findMany').mockResolvedValue([
        { id: 'not-1', title: 'জরুরি নোটিশ', status: 'PUBLISHED' } as any,
      ]);

      const res = await request(app).get('/api/v1/notices');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.length).toBe(1);
    });
  });
});
