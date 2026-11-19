import { prisma } from '../../config/database';
import { AppError } from '../../utils/app-error';
import {
  CreateAdmissionInput,
  UpdateAdmissionStatusInput,
  AdmissionQueryFilters,
} from './admission.types';

export class AdmissionService {
  /**
   * Public admission application submission.
   */
  public async createApplication(input: CreateAdmissionInput) {
    // Generate unique Application Number
    const count = await prisma.admission.count();
    const year = new Date().getFullYear();
    const applicationNumber = `HP-ADM-${year}-${String(count + 1).padStart(4, '0')}`;

    const admission = await prisma.admission.create({
      data: {
        applicationNumber,
        applicantName: input.applicantName.trim(),
        email: input.email.trim().toLowerCase(),
        phone: input.phone.trim(),
        gender: input.gender,
        dateOfBirth: new Date(input.dateOfBirth),
        bloodGroup: input.bloodGroup?.trim(),
        address: input.address.trim(),
        preferredRoomType: input.preferredRoomType,
        guardianName: input.guardianName.trim(),
        guardianRelation: input.guardianRelation.trim(),
        guardianPhone: input.guardianPhone.trim(),
        status: 'PENDING',
      },
    });

    return admission;
  }

  /**
   * Admin paginated & filtered list of admissions.
   */
  public async getApplications(filters: AdmissionQueryFilters) {
    const page = Math.max(1, Number(filters.page) || 1);
    const limit = Math.min(100, Math.max(1, Number(filters.limit) || 20));
    const skip = (page - 1) * limit;

    const where: any = {};

    if (filters.status) {
      where.status = filters.status;
    }

    if (filters.preferredRoomType) {
      where.preferredRoomType = filters.preferredRoomType;
    }

    if (filters.search) {
      const term = filters.search.trim();
      where.OR = [
        { applicantName: { contains: term } },
        { applicationNumber: { contains: term } },
        { email: { contains: term } },
        { phone: { contains: term } },
      ];
    }

    const [total, admissions] = await Promise.all([
      prisma.admission.count({ where }),
      prisma.admission.findMany({
        where,
        skip,
        take: limit,
        orderBy: {
          [filters.sortBy || 'appliedAt']: filters.sortOrder || 'desc',
        },
        include: {
          reviewedByUser: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      }),
    ]);

    return {
      admissions,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit) || 1,
      },
    };
  }

  /**
   * Get single application details.
   */
  public async getApplicationById(id: string) {
    const admission = await prisma.admission.findUnique({
      where: { id },
      include: {
        reviewedByUser: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        student: {
          select: {
            id: true,
            studentCode: true,
          },
        },
      },
    });

    if (!admission) {
      throw AppError.notFound('ভর্তি আবেদনটি পাওয়া যায়নি (Admission application not found)');
    }

    return admission;
  }

  /**
   * Admin status update (Approved, Rejected, Withdrawn).
   */
  public async updateStatus(
    id: string,
    input: UpdateAdmissionStatusInput,
    reviewedByUserId: string
  ) {
    const existing = await prisma.admission.findUnique({ where: { id } });
    if (!existing) {
      throw AppError.notFound('ভর্তি আবেদনটি পাওয়া যায়নি (Admission application not found)');
    }

    const updated = await prisma.admission.update({
      where: { id },
      data: {
        status: input.status,
        decisionNote: input.decisionNote?.trim(),
        reviewedAt: new Date(),
        reviewedByUserId,
      },
      include: {
        reviewedByUser: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    return updated;
  }
}

export const admissionService = new AdmissionService();
