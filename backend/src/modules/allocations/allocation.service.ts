import { prisma } from '../../config/database';
import { AppError } from '../../utils/app-error';
import { AllocationStatus, BedStatus, RoomStatus } from '@prisma/client';

export class AllocationService {
  /**
   * Allocate bed to student.
   * Enforces:
   * 1. Student eligibility (must be ACTIVE)
   * 2. No concurrent/overlapping active allocation for student (rejects with 409 CONFLICT)
   * 3. Bed availability (status AVAILABLE, no active allocation on bed)
   * 4. Room capacity limit
   * Executed atomically in a Prisma transaction.
   */
  public async allocateBed(
    input: { studentId: string; bedId: string; startDate: Date },
    allocatedByUserId: string
  ) {
    return prisma.$transaction(async (tx) => {
      // 1. Verify student exists and is active
      const student = await tx.student.findUnique({
        where: { id: input.studentId },
      });
      if (!student) {
        throw AppError.notFound('শিক্ষার্থীর রেকর্ড খুঁজে পাওয়া যায়নি (Student not found)');
      }
      if (student.status !== 'ACTIVE') {
        throw AppError.badRequest('শুধুমাত্র সক্রিয় শিক্ষার্থীদের সিট বরাদ্দ দেওয়া সম্ভব');
      }

      // 2. Reject duplicate/concurrent active allocation for student
      const existingStudentAllocation = await tx.roomAllocation.findFirst({
        where: {
          studentId: input.studentId,
          status: AllocationStatus.ACTIVE,
        },
      });
      if (existingStudentAllocation) {
        throw AppError.conflict(
          'শিক্ষার্থীর ইতিমধ্যে একটি সক্রিয় সিট বরাদ্দ রয়েছে (Student already has an active allocation)'
        );
      }

      // 3. Verify bed exists and is available
      const bed = await tx.bed.findUnique({
        where: { id: input.bedId },
        include: { room: { include: { beds: true } } },
      });
      if (!bed) {
        throw AppError.notFound('সিট/বেড খুঁজে পাওয়া যায়নি (Bed not found)');
      }
      if (bed.status !== BedStatus.AVAILABLE) {
        throw AppError.conflict('এই সিটটি বর্তমানে ফাঁকা নেই (Bed is not available)');
      }

      // Check overlapping active allocation on this bed
      const existingBedAllocation = await tx.roomAllocation.findFirst({
        where: {
          bedId: input.bedId,
          status: AllocationStatus.ACTIVE,
        },
      });
      if (existingBedAllocation) {
        throw AppError.conflict(
          'এই সিটে ইতিমধ্যে সক্রিয় বরাদ্দ বিদ্যমান (Bed is already occupied by an active allocation)'
        );
      }

      // 4. Verify room capacity
      const activeAllocationsInRoom = await tx.roomAllocation.count({
        where: {
          bed: { roomId: bed.roomId },
          status: AllocationStatus.ACTIVE,
        },
      });
      if (activeAllocationsInRoom >= bed.room.capacity) {
        throw AppError.conflict('রুমের সর্বোচ্চ ধারণক্ষমতা পূর্ণ (Room capacity reached)');
      }

      // 5. Create Allocation
      const allocation = await tx.roomAllocation.create({
        data: {
          studentId: input.studentId,
          bedId: input.bedId,
          startDate: input.startDate,
          status: AllocationStatus.ACTIVE,
          allocatedByUserId,
        },
        include: {
          student: { include: { user: { select: { name: true, email: true } } } },
          bed: { include: { room: true } },
        },
      });

      // 6. Mark bed as OCCUPIED
      await tx.bed.update({
        where: { id: input.bedId },
        data: { status: BedStatus.OCCUPIED },
      });

      // 7. If room is now full, update room status to FULL
      const remainingAvailableBeds = await tx.bed.count({
        where: {
          roomId: bed.roomId,
          status: BedStatus.AVAILABLE,
        },
      });
      if (remainingAvailableBeds === 0) {
        await tx.room.update({
          where: { id: bed.roomId },
          data: { status: RoomStatus.FULL },
        });
      }

      return allocation;
    });
  }

  /**
   * Vacate an allocation.
   * Atomically marks allocation VACATED, releases Bed to AVAILABLE, and updates Room status.
   */
  public async vacateAllocation(allocationId: string, endDate: Date) {
    return prisma.$transaction(async (tx) => {
      const allocation = await tx.roomAllocation.findUnique({
        where: { id: allocationId },
        include: { bed: true },
      });

      if (!allocation) {
        throw AppError.notFound('সিট বরাদ্দের তথ্য পাওয়া যায়নি (Allocation not found)');
      }
      if (allocation.status !== AllocationStatus.ACTIVE) {
        throw AppError.badRequest('বরাদ্দটি ইতিমধ্যে সমাপ্ত করা হয়েছে (Allocation already vacated)');
      }

      // 1. Update allocation status
      const updatedAllocation = await tx.roomAllocation.update({
        where: { id: allocationId },
        data: {
          status: AllocationStatus.VACATED,
          endDate,
        },
        include: {
          student: { include: { user: { select: { name: true, email: true } } } },
          bed: { include: { room: true } },
        },
      });

      // 2. Set Bed status to AVAILABLE
      await tx.bed.update({
        where: { id: allocation.bedId },
        data: { status: BedStatus.AVAILABLE },
      });

      // 3. Set Room status to AVAILABLE
      await tx.room.update({
        where: { id: allocation.bed.roomId },
        data: { status: RoomStatus.AVAILABLE },
      });

      return updatedAllocation;
    });
  }

  /**
   * List allocations (Admin)
   */
  public async getAllocations(status?: AllocationStatus) {
    const allocations = await prisma.roomAllocation.findMany({
      where: status ? { status } : undefined,
      orderBy: { createdAt: 'desc' },
      include: {
        student: {
          include: {
            user: { select: { name: true, email: true } },
          },
        },
        bed: {
          include: {
            room: true,
          },
        },
        allocatedByUser: {
          select: { name: true, email: true },
        },
      },
    });

    return allocations;
  }
}

export const allocationService = new AllocationService();
