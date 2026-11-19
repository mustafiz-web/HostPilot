import { z } from 'zod';

export const createAdmissionSchema = {
  body: z.object({
    applicantName: z
      .string({ required_error: 'আবেদনকারীর নাম আবশ্যক (Applicant name is required)' })
      .min(3, 'কমপক্ষে ৩ অক্ষরের নাম দিন')
      .max(100),
    email: z
      .string({ required_error: 'ইমেইল ঠিকানা আবশ্যক' })
      .email('সঠিক ইমেইল ঠিকানা প্রদান করুন'),
    phone: z
      .string({ required_error: 'মোবাইল নম্বর আবশ্যক' })
      .min(11, '১১ ডিজিটের মোবাইল নম্বর দিন')
      .max(14),
    gender: z.enum(['MALE', 'FEMALE', 'OTHER'], {
      required_error: 'লিঙ্গ নির্বাচন করুন (Gender is required)',
    }),
    dateOfBirth: z.coerce.date({
      required_error: 'জন্ম তারিখ আবশ্যক (Date of birth is required)',
    }),
    bloodGroup: z.string().optional(),
    address: z
      .string({ required_error: 'স্থায়ী ঠিকানা আবশ্যক' })
      .min(5, 'ঠিকানা বিস্তারিত লিখুন'),
    preferredRoomType: z.enum(['SINGLE', 'DOUBLE', 'QUAD'], {
      required_error: 'পছন্দের রুমের ধরন নির্বাচন করুন',
    }),
    guardianName: z
      .string({ required_error: 'অভিভাবকের নাম আবশ্যক' })
      .min(3, 'অভিভাবকের নাম লিখুন'),
    guardianRelation: z
      .string({ required_error: 'অভিভাবকের সাথে সম্পর্ক আবশ্যক' })
      .min(2, 'সম্পর্ক লিখুন'),
    guardianPhone: z
      .string({ required_error: 'অভিভাবকের মোবাইল নম্বর আবশ্যক' })
      .min(11, '১১ ডিজিটের মোবাইল নম্বর দিন')
      .max(14),
  }),
};

export const updateAdmissionStatusSchema = {
  body: z.object({
    status: z.enum(['PENDING', 'APPROVED', 'REJECTED', 'WITHDRAWN'], {
      required_error: 'স্ট্যাটাস আবশ্যক (Status is required)',
    }),
    decisionNote: z.string().max(500).optional(),
  }),
  params: z.object({
    id: z.string().min(1, 'Admission ID is required'),
  }),
};

export const admissionQuerySchema = {
  query: z.object({
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(20),
    search: z.string().optional(),
    status: z.enum(['PENDING', 'APPROVED', 'REJECTED', 'WITHDRAWN']).optional(),
    preferredRoomType: z.enum(['SINGLE', 'DOUBLE', 'QUAD']).optional(),
    sortBy: z.enum(['appliedAt', 'applicantName', 'status']).default('appliedAt'),
    sortOrder: z.enum(['asc', 'desc']).default('desc'),
  }),
};
