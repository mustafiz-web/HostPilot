import { z } from 'zod';

export const createExpenseSchema = {
  body: z.object({
    title: z.string().min(2, 'খরচের শিরোনাম বা বিবরণ আবশ্যক').trim(),
    amount: z.coerce.number().positive('টাকার পরিমাণ ধনাত্মক সংখ্যা হতে হবে'),
    category: z.string().min(1, 'ক্যাটাগরি আবশ্যক').trim(),
    description: z.string().trim().optional(),
    expenseDate: z.coerce.date().default(() => new Date()),
  }),
};
