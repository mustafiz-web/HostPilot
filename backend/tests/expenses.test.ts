import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import { app } from '../src/app';
import { prisma } from '../src/config/database';
import { authService } from '../src/modules/auth/auth.service';

describe('Expense Management Suite (/api/v1/expenses)', () => {
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
          role: 'ADMIN',
          status: 'ACTIVE',
        } as any;
      }
      if (id === 'user-student-1') {
        return {
          id: 'user-student-1',
          email: 'tanvir@campus.edu.bd',
          name: 'তানভীর আহমেদ',
          role: 'STUDENT',
          status: 'ACTIVE',
          studentId: 'student-id-1',
        } as any;
      }
      return null;
    });
  });

  describe('1. Create Expense (POST /api/v1/expenses)', () => {
    it('should FORBID Student from creating an expense (403 Forbidden)', async () => {
      const res = await request(app)
        .post('/api/v1/expenses')
        .set('Authorization', `Bearer ${studentToken}`)
        .send({
          title: 'বিদ্যুৎ বিল',
          amount: 5000,
          category: 'UTILITIES',
          expenseDate: '2026-11-20',
        });

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
    });

    it('should REJECT invalid payload missing required fields (400 Bad Request)', async () => {
      const res = await request(app)
        .post('/api/v1/expenses')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          amount: -100, // Invalid negative amount
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it('should allow Admin to record an expense and persist in MySQL database', async () => {
      const mockCreated = {
        id: 'expense-1',
        title: 'নভেম্বর ২০২৬ বিদ্যুৎ বিল',
        amount: 14500,
        category: 'UTILITIES',
        expenseDate: new Date('2026-11-20'),
        description: 'DPDC electricity bill for Hostel Block A',
        recordedByUserId: 'user-admin-1',
        createdAt: new Date(),
        updatedAt: new Date(),
        recordedByUser: { name: 'Hostel Admin', email: 'admin@hostpilot.dev' },
      };

      vi.spyOn(prisma.expense, 'create').mockResolvedValue(mockCreated as any);

      const res = await request(app)
        .post('/api/v1/expenses')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          title: 'নভেম্বর ২০২৬ বিদ্যুৎ বিল',
          amount: 14500,
          category: 'UTILITIES',
          expenseDate: '2026-11-20',
          description: 'DPDC electricity bill for Hostel Block A',
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.id).toBe('expense-1');
      expect(res.body.data.title).toBe('নভেম্বর ২০২৬ বিদ্যুৎ বিল');
    });
  });

  describe('2. List Expenses (GET /api/v1/expenses)', () => {
    it('should FORBID unauthenticated requests (401 Unauthorized)', async () => {
      const res = await request(app).get('/api/v1/expenses');
      expect(res.status).toBe(401);
    });

    it('should FORBID Student from accessing expense list (403 Forbidden)', async () => {
      const res = await request(app)
        .get('/api/v1/expenses')
        .set('Authorization', `Bearer ${studentToken}`);

      expect(res.status).toBe(403);
    });

    it('should return real expense records and summary analytics for Admin', async () => {
      const mockExpenses = [
        {
          id: 'expense-1',
          title: 'বিদ্যুৎ বিল',
          amount: 12000,
          category: 'UTILITIES',
          expenseDate: new Date('2026-11-15'),
          recordedByUser: { name: 'Admin', email: 'admin@hostpilot.dev' },
        },
        {
          id: 'expense-2',
          title: 'প্লাম্বিং পাইপ মেরামত',
          amount: 3500,
          category: 'MAINTENANCE',
          expenseDate: new Date('2026-11-18'),
          recordedByUser: { name: 'Admin', email: 'admin@hostpilot.dev' },
        },
      ];

      vi.spyOn(prisma.expense, 'findMany').mockResolvedValue(mockExpenses as any);

      const res = await request(app)
        .get('/api/v1/expenses')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveLength(2);
      expect(res.body.meta.totalExpenses).toBe(2);
      expect(res.body.meta.totalAmount).toBe(15500);
    });
  });

  describe('3. Update and Delete Expense (PATCH/DELETE /api/v1/expenses/:id)', () => {
    it('should update expense details when authorized as Admin', async () => {
      vi.spyOn(prisma.expense, 'findUnique').mockResolvedValue({
        id: 'expense-1',
        categoryId: 'cat-1',
        category: { id: 'cat-1', name: 'UTILITIES' },
      } as any);
      vi.spyOn(prisma.expense, 'update').mockResolvedValue({
        id: 'expense-1',
        title: 'সংশোধিত বিদ্যুৎ বিল',
        amount: 13000,
        category: { name: 'UTILITIES' },
        expenseDate: new Date(),
        recordedByUser: { name: 'Admin', email: 'admin@hostpilot.dev' },
        createdAt: new Date(),
      } as any);

      const res = await request(app)
        .patch('/api/v1/expenses/expense-1')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          title: 'সংশোধিত বিদ্যুৎ বিল',
          amount: 13000,
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.amount).toBe(13000);
    });

    it('should delete expense when authorized as Admin', async () => {
      vi.spyOn(prisma.expense, 'findUnique').mockResolvedValue({ id: 'expense-1' } as any);
      vi.spyOn(prisma.expense, 'delete').mockResolvedValue({ id: 'expense-1' } as any);

      const res = await request(app)
        .delete('/api/v1/expenses/expense-1')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });
});
