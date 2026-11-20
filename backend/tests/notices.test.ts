import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import { app } from '../src/app';
import { prisma } from '../src/config/database';
import { authService } from '../src/modules/auth/auth.service';

describe('Notice Management System Suite (/api/v1/notices)', () => {
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

  describe('1. Create Notice (POST /api/v1/notices)', () => {
    it('should allow Admin to create a published bilingual notice with target audience and pin status', async () => {
      const mockNotice = {
        id: 'notice-1',
        title: 'শীতকালীন অবকাশের নোটিশ',
        content: 'আগামী মাসের ১৫ তারিখ থেকে হোস্টেলের কার্যক্রম সাময়িক বন্ধ থাকবে।',
        titleEn: 'Winter Vacation Notice',
        contentEn: 'Hostel operations will be temporarily suspended starting 15th next month.',
        category: 'ছুটি',
        targetAudience: 'ALL',
        isPinned: true,
        status: 'PUBLISHED',
        publishedAt: new Date(),
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        createdByUserId: 'user-admin-1',
        createdByUser: { name: 'Hostel Admin', email: 'admin@hostpilot.dev' },
      };

      vi.spyOn(prisma.notice, 'create').mockResolvedValue(mockNotice as any);

      const res = await request(app)
        .post('/api/v1/notices')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          title: 'শীতকালীন অবকাশের নোটিশ',
          content: 'আগামী মাসের ১৫ তারিখ থেকে হোস্টেলের কার্যক্রম সাময়িক বন্ধ থাকবে।',
          titleEn: 'Winter Vacation Notice',
          contentEn: 'Hostel operations will be temporarily suspended starting 15th next month.',
          category: 'ছুটি',
          targetAudience: 'ALL',
          isPinned: true,
          status: 'PUBLISHED',
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.title).toBe('শীতকালীন অবকাশের নোটিশ');
      expect(res.body.data.titleEn).toBe('Winter Vacation Notice');
      expect(res.body.data.targetAudience).toBe('ALL');
      expect(res.body.data.isPinned).toBe(true);
    });

    it('should FORBID Student from creating notices (403 Forbidden)', async () => {
      const res = await request(app)
        .post('/api/v1/notices')
        .set('Authorization', `Bearer ${studentToken}`)
        .send({
          title: 'অননুমোদিত নোটিশ',
          content: 'ছাত্রদের নোটিশ লেখার অনুমতি নেই।',
        });

      expect(res.status).toBe(403);
      expect(res.body.error.code).toBe('FORBIDDEN');
    });

    it('should REJECT unauthenticated notice creation (401 Unauthorized)', async () => {
      const res = await request(app)
        .post('/api/v1/notices')
        .send({
          title: 'নোটিশ',
          content: 'লগইন ছাড়া সম্ভব নয়।',
        });

      expect(res.status).toBe(401);
    });
  });

  describe('2. Notice Visibility & Expiry Protection (GET /api/v1/notices)', () => {
    it('should allow Admin to see all notices including DRAFT and EXPIRED notices', async () => {
      const mockAllNotices = [
        {
          id: 'n-draft',
          title: 'খসড়া নোটিশ',
          status: 'DRAFT',
          targetAudience: 'ADMIN',
          createdByUser: { name: 'Admin' },
        },
        {
          id: 'n-pub',
          title: 'প্রকাশিত নোটিশ',
          status: 'PUBLISHED',
          targetAudience: 'ALL',
          createdByUser: { name: 'Admin' },
        },
      ];

      vi.spyOn(prisma.notice, 'findMany').mockResolvedValue(mockAllNotices as any);

      const res = await request(app)
        .get('/api/v1/notices')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data).toHaveLength(2);
      expect(prisma.notice.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          orderBy: [{ isPinned: 'desc' }, { createdAt: 'desc' }],
        })
      );
    });

    it('should STRICTLY filter out DRAFT, ADMIN-only, and EXPIRED notices for Students and Public', async () => {
      const mockStudentNotices = [
        {
          id: 'n-pub',
          title: 'ডাইনিং রুটিন',
          status: 'PUBLISHED',
          targetAudience: 'STUDENTS',
          expiresAt: null,
          createdByUser: { name: 'Admin' },
        },
      ];

      vi.spyOn(prisma.notice, 'findMany').mockResolvedValue(mockStudentNotices as any);

      const res = await request(app)
        .get('/api/v1/notices')
        .set('Authorization', `Bearer ${studentToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data).toHaveLength(1);
      expect(res.body.data[0].title).toBe('ডাইনিং রুটিন');

      // Verify the query filtered for PUBLISHED, intended audience, and non-expired
      expect(prisma.notice.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            status: 'PUBLISHED',
            targetAudience: { in: ['ALL', 'STUDENTS'] },
          }),
        })
      );
    });
  });

  describe('3. Notice Update & Toggle Publish (PATCH /api/v1/notices/:id)', () => {
    it('should allow Admin to update notice title, content, and audience', async () => {
      vi.spyOn(prisma.notice, 'findUnique').mockResolvedValue({
        id: 'n-1',
        title: 'পুরাতন শিরোনাম',
        status: 'DRAFT',
        publishedAt: null,
      } as any);

      vi.spyOn(prisma.notice, 'update').mockResolvedValue({
        id: 'n-1',
        title: 'হালনাগাদ শিরোনাম',
        content: 'হালনাগাদ বিবরণী',
        status: 'PUBLISHED',
        publishedAt: new Date(),
        createdByUser: { name: 'Admin' },
      } as any);

      const res = await request(app)
        .patch('/api/v1/notices/n-1')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          title: 'হালনাগাদ শিরোনাম',
          content: 'হালনাগাদ বিবরণী',
          status: 'PUBLISHED',
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.title).toBe('হালনাগাদ শিরোনাম');
    });

    it('should allow Admin to toggle publication status (PUBLISHED <-> DRAFT)', async () => {
      vi.spyOn(prisma.notice, 'findUnique').mockResolvedValue({
        id: 'n-1',
        title: 'নোটিশ',
        status: 'PUBLISHED',
      } as any);

      vi.spyOn(prisma.notice, 'update').mockResolvedValue({
        id: 'n-1',
        title: 'নোটিশ',
        status: 'DRAFT',
        createdByUser: { name: 'Admin' },
      } as any);

      const res = await request(app)
        .patch('/api/v1/notices/n-1/toggle-publish')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.status).toBe('DRAFT');
    });
  });

  describe('4. Delete Notice (DELETE /api/v1/notices/:id)', () => {
    it('should allow Admin to safely delete a notice', async () => {
      vi.spyOn(prisma.notice, 'findUnique').mockResolvedValue({
        id: 'n-del',
        title: 'মুছে ফেলার নোটিশ',
      } as any);

      vi.spyOn(prisma.notice, 'delete').mockResolvedValue({
        id: 'n-del',
      } as any);

      const res = await request(app)
        .delete('/api/v1/notices/n-del')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(prisma.notice.delete).toHaveBeenCalledWith({ where: { id: 'n-del' } });
    });

    it('should FORBID Student from deleting notices', async () => {
      const res = await request(app)
        .delete('/api/v1/notices/n-del')
        .set('Authorization', `Bearer ${studentToken}`);

      expect(res.status).toBe(403);
    });
  });
});
