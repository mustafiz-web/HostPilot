import { z } from 'zod';

export const loginSchema = {
  body: z.object({
    email: z
      .string({ required_error: 'ইমেইল ঠিকানা আবশ্যক (Email is required)' })
      .email('সঠিক ইমেইল ফরম্যাট প্রদান করুন (Invalid email format)')
      .trim()
      .toLowerCase(),
    password: z
      .string({ required_error: 'পাসওয়ার্ড আবশ্যক (Password is required)' })
      .min(6, 'পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে (Password must be at least 6 characters)'),
  }),
};

export const forgotPasswordSchema = {
  body: z.object({
    email: z
      .string({ required_error: 'ইমেইল ঠিকানা আবশ্যক' })
      .email('সঠিক ইমেইল ফরম্যাট প্রদান করুন')
      .trim()
      .toLowerCase(),
  }),
};

export const changePasswordSchema = {
  body: z.object({
    currentPassword: z.string().min(1, 'বর্তমান পাসওয়ার্ড আবশ্যক'),
    newPassword: z.string().min(8, 'নতুন পাসওয়ার্ড কমপক্ষে ৮ অক্ষরের হতে হবে'),
  }),
};

export const registerSchema = {
  body: z.object({
    name: z.string().min(3, 'পূর্ণ নাম কমপক্ষে ৩ অক্ষরের হতে হবে').trim(),
    email: z.string().email('সঠিক ইমেইল ঠিকানা প্রদান করুন').trim().toLowerCase(),
    password: z.string().min(6, 'পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে'),
    phone: z.string().min(11, '১১ ডিজিটের মোবাইল নম্বর প্রদান করুন').max(14).trim(),
    department: z.string().trim().optional().default('General'),
    rollNumber: z.string().trim().optional(),
    institution: z.string().trim().optional(),
    session: z.string().trim().optional(),
    batch: z.string().trim().optional(),
    bloodGroup: z.string().optional(),
    gender: z.enum(['MALE', 'FEMALE', 'OTHER']).default('MALE'),
    dateOfBirth: z.string().optional(),
    address: z.string().trim().optional().default('Hostel Applicant'),
    preferredRoomType: z.enum(['SINGLE', 'DOUBLE', 'QUAD']).default('DOUBLE'),
    guardianName: z.string().trim().optional().default('Guardian'),
    guardianRelation: z.string().trim().optional().default('Parent'),
    guardianPhone: z.string().trim().optional(),
    emergencyContact: z.string().trim().optional(),
  }),
};
