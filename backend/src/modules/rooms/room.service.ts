import { prisma } from '../../config/database';
import { AppError } from '../../utils/app-error';
import { RoomType, RoomStatus, BedStatus, AllocationStatus } from '@prisma/client';

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

  public async getRooms(filters?: { floor?: number; status?: RoomStatus; onlyAvailable?: boolean }, isAdmin = false) {
    const where: any = {};
    if (filters?.floor) {
      where.floor = Number(filters.floor);
    }
    if (filters?.status) {
      where.status = filters.status;
    }
    if (filters?.onlyAvailable) {
      where.status = RoomStatus.AVAILABLE;
    }

    const rawRooms = await prisma.room.findMany({
      where,
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
                    user: { select: { id: true, name: true, email: true } },
                  },
                },
              },
            },
          },
        },
      },
    });

    let totalBedsCount = 0;
    let occupiedBedsCount = 0;
    let availableBedsCount = 0;
    let unavailableBedsCount = 0;

    const formattedRooms = rawRooms.map((room) => {
      let roomOccupied = 0;
      let roomAvailable = 0;
      let roomUnavailable = 0;

      const beds = room.beds.map((b) => {
        const activeAlloc = b.allocations[0] || null;
        const isOccupied = b.status === BedStatus.OCCUPIED || !!activeAlloc;
        const isAvailable = b.status === BedStatus.AVAILABLE && !activeAlloc;

        if (isOccupied) {
          roomOccupied++;
          occupiedBedsCount++;
        } else if (isAvailable) {
          roomAvailable++;
          availableBedsCount++;
        } else {
          roomUnavailable++;
          unavailableBedsCount++;
        }
        totalBedsCount++;

        return {
          id: b.id,
          roomId: b.roomId,
          bedCode: b.bedCode,
          identifier: `${room.roomNumber}-${b.bedCode}`,
          status: isOccupied ? 'OCCUPIED' : b.status,
          occupant: (isAdmin && activeAlloc)
            ? {
                allocationId: activeAlloc.id,
                studentId: activeAlloc.student.id,
                studentName: activeAlloc.student.user.name,
                studentCode: activeAlloc.student.studentCode,
                rollNumber: activeAlloc.student.rollNumber,
                department: activeAlloc.student.department,
                startDate: activeAlloc.startDate,
              }
            : null,
        };
      });

      // Calculate room status:
      let calculatedStatus: 'AVAILABLE' | 'PARTIALLY_OCCUPIED' | 'FULL' | 'MAINTENANCE';
      if (room.status === RoomStatus.MAINTENANCE) {
        calculatedStatus = 'MAINTENANCE';
      } else if (roomOccupied >= room.capacity || roomAvailable === 0) {
        calculatedStatus = 'FULL';
      } else if (roomOccupied > 0) {
        calculatedStatus = 'PARTIALLY_OCCUPIED';
      } else {
        calculatedStatus = 'AVAILABLE';
      }

      return {
        id: room.id,
        roomNumber: room.roomNumber,
        floor: room.floor,
        capacity: room.capacity,
        roomType: room.roomType,
        monthlyRent: Number(room.monthlyRent),
        status: calculatedStatus,
        occupiedBedsCount: roomOccupied,
        availableBedsCount: roomAvailable,
        unavailableBedsCount: roomUnavailable,
        beds,
      };
    });

    const finalRooms = filters?.onlyAvailable
      ? formattedRooms.filter((r) => r.status === 'AVAILABLE' || r.status === 'PARTIALLY_OCCUPIED')
      : formattedRooms;

    return {
      rooms: finalRooms,
      summary: {
        totalRooms: rawRooms.length,
        totalBeds: totalBedsCount,
        occupiedBeds: occupiedBedsCount,
        availableBeds: availableBedsCount,
        unavailableBeds: unavailableBedsCount,
      },
    };
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

    let roomOccupied = 0;
    let roomAvailable = 0;

    const beds = room.beds.map((b) => {
      const activeAlloc = b.allocations[0] || null;
      const isOccupied = b.status === BedStatus.OCCUPIED || !!activeAlloc;
      const isAvailable = b.status === BedStatus.AVAILABLE && !activeAlloc;

      if (isOccupied) roomOccupied++;
      else if (isAvailable) roomAvailable++;

      return {
        id: b.id,
        roomId: b.roomId,
        bedCode: b.bedCode,
        identifier: `${room.roomNumber}-${b.bedCode}`,
        status: isOccupied ? 'OCCUPIED' : b.status,
        occupant: activeAlloc
          ? {
              allocationId: activeAlloc.id,
              studentId: activeAlloc.student.id,
              studentName: activeAlloc.student.user.name,
              studentCode: activeAlloc.student.studentCode,
              rollNumber: activeAlloc.student.rollNumber,
              department: activeAlloc.student.department,
              startDate: activeAlloc.startDate,
            }
          : null,
      };
    });

    let calculatedStatus: 'AVAILABLE' | 'PARTIALLY_OCCUPIED' | 'FULL' | 'MAINTENANCE';
    if (room.status === RoomStatus.MAINTENANCE) {
      calculatedStatus = 'MAINTENANCE';
    } else if (roomOccupied >= room.capacity || roomAvailable === 0) {
      calculatedStatus = 'FULL';
    } else if (roomOccupied > 0) {
      calculatedStatus = 'PARTIALLY_OCCUPIED';
    } else {
      calculatedStatus = 'AVAILABLE';
    }

    return {
      id: room.id,
      roomNumber: room.roomNumber,
      floor: room.floor,
      capacity: room.capacity,
      roomType: room.roomType,
      monthlyRent: Number(room.monthlyRent),
      status: calculatedStatus,
      occupiedBedsCount: roomOccupied,
      availableBedsCount: roomAvailable,
      beds,
    };
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

  public async updateRoom(
    id: string,
    input: {
      roomNumber?: string;
      floor?: number;
      capacity?: number;
      roomType?: RoomType;
      monthlyRent?: number;
      status?: RoomStatus;
    }
  ) {
    const room = await prisma.room.findUnique({
      where: { id },
      include: {
        beds: {
          include: {
            allocations: {
              where: { status: AllocationStatus.ACTIVE },
            },
          },
        },
      },
    });

    if (!room) {
      throw AppError.notFound('রুমটি খুঁজে পাওয়া যায়নি (Room not found)');
    }

    // 1. If roomNumber changed, verify uniqueness
    if (input.roomNumber && input.roomNumber.trim() !== room.roomNumber) {
      const existing = await prisma.room.findUnique({
        where: { roomNumber: input.roomNumber.trim() },
      });
      if (existing && existing.id !== id) {
        throw AppError.conflict('এই রুম নম্বর ইতিমধ্যে অন্য রুমে বিদ্যমান রয়েছে (Room number already in use)');
      }
    }

    // 2. Count active occupancy
    const activeOccupancy = room.beds.reduce(
      (count, bed) => count + bed.allocations.length,
      0
    );

    // 3. Enforce business rule: Capacity cannot be reduced below current occupancy
    if (input.capacity !== undefined) {
      if (input.capacity < 1) {
        throw AppError.badRequest('রুমের ধারণক্ষমতা কমপক্ষে ১ হতে হবে');
      }
      if (input.capacity < activeOccupancy) {
        throw AppError.badRequest(
          `রুমটিতে বর্তমানে ${activeOccupancy} জন শিক্ষার্থী অবস্থান করছেন। ধারণক্ষমতা ${activeOccupancy} এর চেয়ে কম নির্ধারণ করা সম্ভব নয় (Capacity cannot be reduced below current occupancy of ${activeOccupancy})`
        );
      }
    }

    return prisma.$transaction(async (tx) => {
      // If capacity increased beyond current beds count, automatically create required beds
      if (input.capacity !== undefined && input.capacity > room.beds.length) {
        const bedsNeeded = input.capacity - room.beds.length;
        const existingCodes = new Set(room.beds.map((b) => b.bedCode));
        const newBedsData = [];
        let charCode = 65; // 'A'
        while (newBedsData.length < bedsNeeded) {
          const candidate = String.fromCharCode(charCode);
          if (!existingCodes.has(candidate)) {
            newBedsData.push({
              bedCode: candidate,
              status: BedStatus.AVAILABLE,
            });
            existingCodes.add(candidate);
          }
          charCode++;
        }

        await tx.bed.createMany({
          data: newBedsData.map((b) => ({
            roomId: id,
            bedCode: b.bedCode,
            status: b.status,
          })),
        });
      }

      // If room status is set to MAINTENANCE, ensure bed allocations are accounted for
      const updated = await tx.room.update({
        where: { id },
        data: {
          roomNumber: input.roomNumber ? input.roomNumber.trim() : undefined,
          floor: input.floor !== undefined ? input.floor : undefined,
          capacity: input.capacity !== undefined ? input.capacity : undefined,
          roomType: input.roomType || undefined,
          monthlyRent: input.monthlyRent !== undefined ? input.monthlyRent : undefined,
          status: input.status || undefined,
        },
        include: {
          beds: {
            orderBy: { bedCode: 'asc' },
          },
        },
      });

      return updated;
    });
  }

  public async deleteRoom(id: string) {
    const room = await prisma.room.findUnique({
      where: { id },
      include: {
        beds: {
          include: {
            allocations: true,
          },
        },
      },
    });

    if (!room) {
      throw AppError.notFound('রুমটি খুঁজে পাওয়া যায়নি (Room not found)');
    }

    // 1. Business rule: Occupied rooms must not be deleted
    const activeAllocations = room.beds.flatMap((b) =>
      b.allocations.filter((a) => a.status === AllocationStatus.ACTIVE)
    );
    if (activeAllocations.length > 0) {
      throw AppError.badRequest(
        'রুমটিতে বর্তমানে শিক্ষার্থী সক্রিয় বরাদ্দে রয়েছে, তাই এটি মুছে ফেলা সম্ভব নয় (Cannot delete occupied room)'
      );
    }

    // 2. Business rule: Do not delete if historical records depend on them
    const historicalAllocations = room.beds.flatMap((b) => b.allocations);
    if (historicalAllocations.length > 0) {
      throw AppError.badRequest(
        'এই রুম ও এর সিটগুলোতে অতীত বরাদ্দের অডিট রেকর্ড সংরক্ষিত রয়েছে। নিরাপত্তার স্বার্থে এটি মুছে ফেলার পরিবর্তে স্ট্যাটাস \'MAINTENANCE\' নির্ধারণ করুন (Cannot delete room with historical records; set status to MAINTENANCE instead)'
      );
    }

    // 3. Safe deletion of empty beds and room
    return prisma.$transaction(async (tx) => {
      await tx.bed.deleteMany({
        where: { roomId: id },
      });
      await tx.room.delete({
        where: { id },
      });
      return { id, message: 'রুমটি সফলভাবে মুছে ফেলা হয়েছে (Room deleted successfully)' };
    });
  }

  public async getRoomAllocationHistory(roomId: string) {
    const room = await prisma.room.findUnique({
      where: { id: roomId },
      select: { id: true, roomNumber: true, floor: true, capacity: true, roomType: true },
    });

    if (!room) {
      throw AppError.notFound('রুমটি খুঁজে পাওয়া যায়নি (Room not found)');
    }

    const allocations = await prisma.roomAllocation.findMany({
      where: {
        bed: { roomId },
      },
      orderBy: { createdAt: 'desc' },
      include: {
        bed: { select: { id: true, bedCode: true } },
        student: {
          include: {
            user: { select: { id: true, name: true, email: true } },
          },
        },
        allocatedByUser: { select: { id: true, name: true, email: true } },
      },
    });

    return {
      room,
      allocations: allocations.map((a) => ({
        id: a.id,
        bedCode: a.bed.bedCode,
        studentId: a.student.id,
        studentName: a.student.user.name,
        studentEmail: a.student.user.email,
        studentCode: a.student.studentCode,
        rollNumber: a.student.rollNumber,
        department: a.student.department,
        startDate: a.startDate,
        endDate: a.endDate,
        status: a.status,
        allocatedBy: a.allocatedByUser.name,
        createdAt: a.createdAt,
      })),
    };
  }

  public async updateBed(
    roomId: string,
    bedId: string,
    input: { status?: BedStatus; bedCode?: string }
  ) {
    const bed = await prisma.bed.findFirst({
      where: { id: bedId, roomId },
      include: {
        allocations: {
          where: { status: AllocationStatus.ACTIVE },
        },
      },
    });

    if (!bed) {
      throw AppError.notFound('বেডটি খুঁজে পাওয়া যায়নি (Bed not found in this room)');
    }

    if (bed.allocations.length > 0 && input.status === BedStatus.AVAILABLE) {
      throw AppError.conflict('এই বেডে বর্তমানে সক্রিয় শিক্ষার্থী বরাদ্দ রয়েছে, তাই এটিকে ফাঁকা চিহ্নিত করা যাবে না');
    }

    if (input.bedCode && input.bedCode.trim().toUpperCase() !== bed.bedCode) {
      const existing = await prisma.bed.findFirst({
        where: {
          roomId,
          bedCode: input.bedCode.trim().toUpperCase(),
          id: { not: bedId },
        },
      });
      if (existing) {
        throw AppError.conflict('এই রুমে এই কোডের বেড ইতিমধ্যে বিদ্যমান');
      }
    }

    const updated = await prisma.bed.update({
      where: { id: bedId },
      data: {
        status: input.status || undefined,
        bedCode: input.bedCode ? input.bedCode.trim().toUpperCase() : undefined,
      },
    });

    return updated;
  }

  public async deleteBed(roomId: string, bedId: string) {
    const bed = await prisma.bed.findFirst({
      where: { id: bedId, roomId },
      include: {
        allocations: true,
      },
    });

    if (!bed) {
      throw AppError.notFound('বেডটি খুঁজে পাওয়া যায়নি (Bed not found)');
    }

    if (bed.allocations.length > 0) {
      throw AppError.badRequest('এই বেডে অতীত বা বর্তমান বরাদ্দের রেকর্ড সংরক্ষিত রয়েছে, তাই এটি মুছে ফেলা সম্ভব নয়');
    }

    await prisma.bed.delete({
      where: { id: bedId },
    });

    return { id: bedId, message: 'বেড সফলভাবে মুছে ফেলা হয়েছে' };
  }
}

export const roomService = new RoomService();
