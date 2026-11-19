import { z } from 'zod';
import { ComplaintCategory, ComplaintPriority, ComplaintStatus } from '@prisma/client';

export const createComplaintSchema = {
  body: z.object({
    title: z.string().min(3, 'শিরোনাম কমপক্ষে ৩ অক্ষরের হতে হবে').trim(),
    category: z.nativeEnum(ComplaintCategory).default(ComplaintCategory.OTHER),
    priority: z.nativeEnum(ComplaintPriority).default(ComplaintPriority.MEDIUM),
    description: z.string().min(5, 'অভিযোগের বিস্তারিত বিবরণ দিন').trim(),
  }),
};

export const updateComplaintStatusSchema = {
  body: z.object({
    status: z.nativeEnum(ComplaintStatus),
    adminNote: z.string().optional(),
  }),
  params: z.object({
    id: z.string().min(1),
  }),
};
