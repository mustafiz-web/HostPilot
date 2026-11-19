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
