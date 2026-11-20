import { prisma } from '../../config/database';
import { AppError } from '../../utils/app-error';
import { NoticeStatus } from '@prisma/client';

export class NoticeService {
  public async createNotice(
    userId: string,
    input: {
      title: string;
      content: string;
      titleEn?: string;
      contentEn?: string;
      category?: string;
      targetAudience?: string;
      isPinned?: boolean;
      status?: NoticeStatus;
      publishedAt?: Date;
      expiresAt?: Date | null;
    }
  ) {
    const status = input.status || NoticeStatus.PUBLISHED;
    const publishedAt = input.publishedAt
      ? input.publishedAt
      : status === NoticeStatus.PUBLISHED
      ? new Date()
      : null;

    const notice = await prisma.notice.create({
      data: {
        title: input.title.trim(),
        content: input.content.trim(),
        titleEn: input.titleEn?.trim() || null,
        contentEn: input.contentEn?.trim() || null,
        category: input.category || 'GENERAL',
        targetAudience: input.targetAudience || 'ALL',
        isPinned: input.isPinned || false,
        status,
        publishedAt,
        expiresAt: input.expiresAt || null,
        createdByUserId: userId,
      },
      include: {
        createdByUser: {
          select: { name: true, email: true },
        },
      },
    });

    return notice;
  }

  public async getNotices(role?: string) {
    // If Admin, show everything (Drafts, Published, Expired, All Audiences)
    if (role === 'ADMIN') {
      return prisma.notice.findMany({
        orderBy: [{ isPinned: 'desc' }, { createdAt: 'desc' }],
        include: {
          createdByUser: {
            select: { name: true, email: true },
          },
        },
      });
    }

    // For Students and Public: Only show PUBLISHED, non-expired, intended for ALL or STUDENTS
    const now = new Date();
    return prisma.notice.findMany({
      where: {
        status: NoticeStatus.PUBLISHED,
        targetAudience: { in: ['ALL', 'STUDENTS'] },
        OR: [
          { expiresAt: null },
          { expiresAt: { gt: now } },
        ],
      },
      orderBy: [{ isPinned: 'desc' }, { publishedAt: 'desc' }, { createdAt: 'desc' }],
      include: {
        createdByUser: {
          select: { name: true, email: true },
        },
      },
    });
  }

  public async getNoticeById(id: string, role?: string) {
    const notice = await prisma.notice.findUnique({
      where: { id },
      include: {
        createdByUser: {
          select: { name: true, email: true },
        },
      },
    });

    if (!notice) {
      throw AppError.notFound('নোটিশটি খুঁজে পাওয়া যায়নি (Notice not found)');
    }

    // Non-admins cannot see DRAFT, ADMIN-only, or EXPIRED notices
    if (role !== 'ADMIN') {
      const isExpired = notice.expiresAt && notice.expiresAt < new Date();
      if (
        notice.status !== NoticeStatus.PUBLISHED ||
        notice.targetAudience === 'ADMIN' ||
        isExpired
      ) {
        throw AppError.notFound('নোটিশটি খুঁজে পাওয়া যায়নি বা এর মেয়াদ উত্তীর্ণ হয়েছে (Notice not available or expired)');
      }
    }

    return notice;
  }

  public async updateNotice(
    id: string,
    input: {
      title?: string;
      content?: string;
      titleEn?: string;
      contentEn?: string;
      category?: string;
      targetAudience?: string;
      isPinned?: boolean;
      status?: NoticeStatus;
      publishedAt?: Date | null;
      expiresAt?: Date | null;
    }
  ) {
    const existing = await prisma.notice.findUnique({ where: { id } });
    if (!existing) {
      throw AppError.notFound('নোটিশটি খুঁজে পাওয়া যায়নি (Notice not found)');
    }

    const data: any = { ...input };
    if (input.status === NoticeStatus.PUBLISHED && !existing.publishedAt && !input.publishedAt) {
      data.publishedAt = new Date();
    }

    const updated = await prisma.notice.update({
      where: { id },
      data,
      include: {
        createdByUser: {
          select: { name: true, email: true },
        },
      },
    });

    return updated;
  }

  public async deleteNotice(id: string) {
    const existing = await prisma.notice.findUnique({ where: { id } });
    if (!existing) {
      throw AppError.notFound('নোটিশটি খুঁজে পাওয়া যায়নি (Notice not found)');
    }

    await prisma.notice.delete({ where: { id } });
    return { id, message: 'নোটিশটি সফলভাবে মুছে ফেলা হয়েছে (Notice deleted successfully)' };
  }

  public async togglePublish(id: string) {
    const existing = await prisma.notice.findUnique({ where: { id } });
    if (!existing) {
      throw AppError.notFound('নোটিশটি খুঁজে পাওয়া যায়নি (Notice not found)');
    }

    const nextStatus =
      existing.status === NoticeStatus.PUBLISHED ? NoticeStatus.DRAFT : NoticeStatus.PUBLISHED;

    const data: any = { status: nextStatus };
    if (nextStatus === NoticeStatus.PUBLISHED) {
      data.publishedAt = new Date();
    }

    const updated = await prisma.notice.update({
      where: { id },
      data,
      include: {
        createdByUser: {
          select: { name: true, email: true },
        },
      },
    });

    return updated;
  }
}

export const noticeService = new NoticeService();
