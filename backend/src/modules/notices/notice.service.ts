import { prisma } from '../../config/database';
import { AppError } from '../../utils/app-error';
import { NoticeStatus } from '@prisma/client';

export class NoticeService {
  public async createNotice(
    userId: string,
    input: {
      title: string;
      content: string;
      category?: string;
      isPinned?: boolean;
      status?: NoticeStatus;
    }
  ) {
    const status = input.status || NoticeStatus.PUBLISHED;
    const notice = await prisma.notice.create({
      data: {
        title: input.title.trim(),
        content: input.content.trim(),
        category: input.category || 'GENERAL',
        isPinned: input.isPinned || false,
        status,
        publishedAt: status === NoticeStatus.PUBLISHED ? new Date() : null,
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
    // If not Admin, only show PUBLISHED notices!
    const where = role === 'ADMIN' ? undefined : { status: NoticeStatus.PUBLISHED };

    return prisma.notice.findMany({
      where,
      orderBy: [{ isPinned: 'desc' }, { createdAt: 'desc' }],
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

    if (notice.status !== NoticeStatus.PUBLISHED && role !== 'ADMIN') {
      throw AppError.notFound('নোটিশটি খুঁজে পাওয়া যায়নি (Notice not found)');
    }

    return notice;
  }

  public async updateNotice(
    id: string,
    input: {
      title?: string;
      content?: string;
      category?: string;
      isPinned?: boolean;
      status?: NoticeStatus;
    }
  ) {
    const existing = await prisma.notice.findUnique({ where: { id } });
    if (!existing) {
      throw AppError.notFound('নোটিশটি খুঁজে পাওয়া যায়নি (Notice not found)');
    }

    const data: any = { ...input };
    if (input.status === NoticeStatus.PUBLISHED && !existing.publishedAt) {
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
