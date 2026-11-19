import { z } from 'zod';
import { NoticeStatus } from '@prisma/client';

export const createNoticeSchema = {
  body: z.object({
    title: z.string().min(3, 'শিরোনাম আবশ্যক (Title required)').trim(),
    content: z.string().min(5, 'নোটিশের বিবরণ আবশ্যক (Content required)').trim(),
    category: z.string().default('GENERAL'),
    isPinned: z.boolean().default(false),
    status: z.nativeEnum(NoticeStatus).default(NoticeStatus.PUBLISHED),
  }),
};

export const updateNoticeSchema = {
  body: z.object({
    title: z.string().min(3).trim().optional(),
    content: z.string().min(5).trim().optional(),
    category: z.string().optional(),
    isPinned: z.boolean().optional(),
    status: z.nativeEnum(NoticeStatus).optional(),
  }),
  params: z.object({
    id: z.string().min(1),
  }),
};
