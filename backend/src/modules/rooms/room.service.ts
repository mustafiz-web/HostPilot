import { prisma } from '../../config/database';
import { AppError } from '../../utils/app-error';
import { RoomType, RoomStatus, BedStatus } from '@prisma/client';

export class RoomService {
  public async createRoom(input: {
    roomNumber: string;
    floor: number;
    capacity: number;
    roomType: RoomType;
    monthlyRent: number;
    beds?: string[];
  }) {
    // Check duplicate room number
    const existing = await prisma.room.findUnique({
      where: { roomNumber: input.roomNumber.trim() },
    });
    if (existing) {
      throw AppError.conflict('এই রুম নম্বর ইতিমধ্যে বিদ্যমান রয়েছে (Room number already exists)');
    }

    // Default beds if not supplied
    const bedCodes = input.beds && input.beds.length > 0
      ? input.beds
      : Array.from({ length: input.capacity }, (_, i) => String.fromCharCode(65 + i)); // ['A', 'B', ...]

    if (bedCodes.length > input.capacity) {
      throw AppError.badRequest('বেডের সংখ্যা রুমের ধারণক্ষমতার বেশি হতে পারবে না');
    }

    // Atomic room & bed creation
    return prisma.$transaction(async (tx) => {
      const room = await tx.room.create({
        data: {
          roomNumber: input.roomNumber.trim(),
          floor: input.floor,
          capacity: input.capacity,
          roomType: input.roomType,
          monthlyRent: input.monthlyRent,
          status: RoomStatus.AVAILABLE,
          beds: {
            create: bedCodes.map((code) => ({
              bedCode: code.trim().toUpperCase(),
              status: BedStatus.AVAILABLE,
            })),
          },
        },
        include: {
          beds: true,
        },
      });

      return room;
    });
  }

  public async getRooms() {
    const rooms = await prisma.room.findMany({
      orderBy: [{ floor: 'asc' }, { roomNumber: 'asc' }],
      include: {
        beds: {
          orderBy: { bedCode: 'asc' },
          include: {
            allocations: {
              where: { status: 'ACTIVE' },
              include: {
                student: {
                  include: {
                    user: { select: { name: true, email: true } },
                  },
                },
              },
            },
          },
        },
      },
    });

    return rooms;
  }

  public async getRoomById(id: string) {
    const room = await prisma.room.findUnique({
      where: { id },
      include: {
        beds: {
          orderBy: { bedCode: 'asc' },
          include: {
            allocations: {
              where: { status: 'ACTIVE' },
              include: {
                student: {
                  include: {
                    user: { select: { name: true, email: true } },
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!room) {
      throw AppError.notFound('রুমটি খুঁজে পাওয়া যায়নি (Room not found)');
    }

    return room;
  }

  public async addBed(roomId: string, input: { bedCode: string; status?: BedStatus }) {
    const room = await prisma.room.findUnique({
      where: { id: roomId },
      include: { beds: true },
    });

    if (!room) {
      throw AppError.notFound('রুমটি খুঁজে পাওয়া যায়নি (Room not found)');
    }

    if (room.beds.length >= room.capacity) {
      throw AppError.badRequest('রুমের ধারণক্ষমতা পূর্ণ, নতুন বেড যুক্ত করা সম্ভব নয়');
    }

    const code = input.bedCode.trim().toUpperCase();
    const duplicate = room.beds.some((b) => b.bedCode === code);
    if (duplicate) {
      throw AppError.conflict('এই রুমে এই কোডের বেড ইতিমধ্যে বিদ্যমান (Bed code already exists in this room)');
    }

    const bed = await prisma.bed.create({
      data: {
        roomId,
        bedCode: code,
        status: input.status || BedStatus.AVAILABLE,
      },
    });

    return bed;
  }
}

export const roomService = new RoomService();
