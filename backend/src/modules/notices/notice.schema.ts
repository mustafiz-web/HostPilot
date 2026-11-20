import { z } from 'zod';
import { NoticeStatus } from '@prisma/client';

export const createNoticeSchema = {
  body: z.object({
    title: z.string().min(3, 'শিরোনাম আবশ্যক (Title required)').trim(),
    content: z.string().min(5, 'নোটিশের বিবরণ আবশ্যক (Content required)').trim(),
    titleEn: z.string().trim().optional(),
    contentEn: z.string().trim().optional(),
    category: z.string().default('GENERAL'),
    targetAudience: z.enum(['ALL', 'STUDENTS', 'ADMIN']).default('ALL'),
    isPinned: z.boolean().default(false),
    status: z.nativeEnum(NoticeStatus).default(NoticeStatus.PUBLISHED),
    publishedAt: z.coerce.date().optional(),
    expiresAt: z.coerce.date().nullable().optional(),
  }),
};

export const updateNoticeSchema = {
  body: z.object({
    title: z.string().min(3).trim().optional(),
    content: z.string().min(5).trim().optional(),
    titleEn: z.string().trim().optional(),
    contentEn: z.string().trim().optional(),
    category: z.string().optional(),
    targetAudience: z.enum(['ALL', 'STUDENTS', 'ADMIN']).optional(),
    isPinned: z.boolean().optional(),
    status: z.nativeEnum(NoticeStatus).optional(),
    publishedAt: z.coerce.date().nullable().optional(),
    expiresAt: z.coerce.date().nullable().optional(),
  }),
  params: z.object({
    id: z.string().min(1),
  }),
};
