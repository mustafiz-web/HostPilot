import { z } from 'zod';

export const createAllocationSchema = {
  body: z.object({
    studentId: z.string().min(1, 'শিক্ষার্থী আইডি আবশ্যক (Student ID is required)'),
    bedId: z.string().min(1, 'বেড আইডি আবশ্যক (Bed ID is required)'),
    startDate: z.coerce.date().default(() => new Date()),
  }),
};

export const vacateAllocationSchema = {
  body: z.object({
    endDate: z.coerce.date().default(() => new Date()),
  }),
  params: z.object({
    id: z.string().min(1),
  }),
};
