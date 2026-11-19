import { z } from 'zod';
import { StudentStatus } from '@prisma/client';

export const createStudentSchema = {
  body: z.object({
    name: z.string().min(3, 'নাম কমপক্ষে ৩ অক্ষরের হতে হবে (Name must be at least 3 characters)').trim(),
    email: z.string().email('সঠিক ইমেইল ফরম্যাট আবশ্যক (Valid email required)').trim().toLowerCase(),
    password: z.string().min(6, 'পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে').optional(),
    studentCode: z.string().min(3, 'স্টুডেন্ট আইডি কোড আবশ্যক (Student code required)').trim(),
    phone: z.string().min(11, '১১ ডিজিটের মোবাইল নম্বর দিন (11-digit phone required)').trim(),
    department: z.string().min(2, 'বিভাগ উল্লেখ করুন (Department required)').trim(),
    rollNumber: z.string().min(1, 'রোল নম্বর আবশ্যক (Roll number required)').trim(),
    session: z.string().min(4, 'সেশন আবশ্যক (Session required)').trim(),
    batch: z.string().min(1, 'ব্যাচ উল্লেখ করুন (Batch required)').trim(),
    bloodGroup: z.string().optional(),
    address: z.string().min(5, 'স্থায়ী ঠিকানা আবশ্যক (Address required)').trim(),
    dateOfBirth: z.string().optional(),

    // Primary Guardian info
    guardianName: z.string().min(3, 'অভিভাবকের নাম আবশ্যক (Guardian name required)').trim(),
    guardianRelation: z.string().min(2, 'সম্পর্ক উল্লেখ করুন (e.g. পিতা/মাতা)').trim(),
    guardianPhone: z.string().min(11, 'অভিভাবকের মোবাইল নম্বর দিন').trim(),
    emergencyContact: z.string().optional(),
  }),
};

export const updateStudentSchema = {
  body: z.object({
    name: z.string().min(3).trim().optional(),
    phone: z.string().min(11).trim().optional(),
    department: z.string().min(2).trim().optional(),
    rollNumber: z.string().min(1).trim().optional(),
    session: z.string().min(4).trim().optional(),
    batch: z.string().min(1).trim().optional(),
    bloodGroup: z.string().optional(),
    address: z.string().min(5).trim().optional(),
    dateOfBirth: z.string().optional(),

    // Guardian updates
    guardianName: z.string().min(3).trim().optional(),
    guardianRelation: z.string().min(2).trim().optional(),
    guardianPhone: z.string().min(11).trim().optional(),
    emergencyContact: z.string().optional(),
  }),
};

export const updateStudentStatusSchema = {
  body: z.object({
    status: z.nativeEnum(StudentStatus, {
      errorMap: () => ({ message: 'স্ট্যাটাস ACTIVE, INACTIVE, GRADUATED, বা EXPELLED হতে হবে' }),
    }),
  }),
};

export const studentQuerySchema = {
  query: z.object({
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(20),
    search: z.string().optional(),
    status: z.nativeEnum(StudentStatus).optional(),
    department: z.string().optional(),
    sortBy: z.enum(['createdAt', 'name', 'studentCode', 'rollNumber']).default('createdAt'),
    sortOrder: z.enum(['asc', 'desc']).default('desc'),
  }),
};
