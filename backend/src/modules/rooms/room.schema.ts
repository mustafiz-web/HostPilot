import { z } from 'zod';
import { RoomType, RoomStatus, BedStatus } from '@prisma/client';

export const createRoomSchema = {
  body: z.object({
    roomNumber: z.string().min(1, 'রুম নম্বর আবশ্যক (Room number is required)').trim(),
    floor: z.coerce.number().int().min(0, 'ফ্লোর নম্বর দিন (Floor is required)'),
    capacity: z.coerce.number().int().min(1, 'ন্যূনতম ১টি সিট ক্ষমতা থাকতে হবে').max(10),
    roomType: z.nativeEnum(RoomType).default(RoomType.DOUBLE),
    monthlyRent: z.coerce.number().positive('মাসিক ভাড়া ধনাত্মক সংখ্যা হতে হবে'),
    beds: z.array(z.string().min(1)).optional(), // bed codes like ["A", "B"]
  }),
};

export const updateRoomSchema = {
  body: z.object({
    roomNumber: z.string().min(1).trim().optional(),
    floor: z.coerce.number().int().min(0).optional(),
    capacity: z.coerce.number().int().min(1).max(10).optional(),
    roomType: z.nativeEnum(RoomType).optional(),
    monthlyRent: z.coerce.number().positive().optional(),
    status: z.nativeEnum(RoomStatus).optional(),
  }),
  params: z.object({
    id: z.string().min(1),
  }),
};

export const addBedSchema = {
  body: z.object({
    bedCode: z.string().min(1, 'বেড কোড আবশ্যক (e.g. A, B)').trim(),
    status: z.nativeEnum(BedStatus).default(BedStatus.AVAILABLE),
  }),
  params: z.object({
    roomId: z.string().min(1),
  }),
};

export const updateBedSchema = {
  body: z.object({
    bedCode: z.string().min(1).trim().optional(),
    status: z.nativeEnum(BedStatus).optional(),
  }),
  params: z.object({
    roomId: z.string().min(1),
    bedId: z.string().min(1),
  }),
};
