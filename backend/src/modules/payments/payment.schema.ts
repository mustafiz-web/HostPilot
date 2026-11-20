import { z } from 'zod';
import { PaymentMethod } from '@prisma/client';

export const recordPaymentSchema = {
  body: z.object({
    studentId: z.string().optional(),
    billingPeriod: z
      .string()
      .min(3, 'বিলিং পিরিয়ড আবশ্যক (e.g. 2026-03 or মার্চ ২০২৬)')
      .trim(),
    amount: z.coerce.number().positive('বিলের পরিমাণ ধনাত্মক হতে হবে'),
    paidAmount: z.coerce.number().min(0, 'পরিশোধিত অর্থ অঋণাত্মক হতে হবে'),
    paymentMethod: z.nativeEnum(PaymentMethod).default(PaymentMethod.CASH),
    transactionReference: z.string().optional(),
  }),
};
