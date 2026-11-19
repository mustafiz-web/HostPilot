import { prisma } from '../../config/database';
import { AppError } from '../../utils/app-error';
import { ComplaintCategory, ComplaintPriority, ComplaintStatus } from '@prisma/client';

export class ComplaintService {
  public async createComplaint(
    studentId: string,
    input: {
      title: string;
      category: ComplaintCategory;
      priority: ComplaintPriority;
      description: string;
    }
  ) {
    const student = await prisma.student.findUnique({ where: { id: studentId } });
    if (!student) {
      throw AppError.notFound('Student not found');
    }

    const complaint = await prisma.complaint.create({
      data: {
        studentId,
        title: input.title.trim(),
        category: input.category,
        priority: input.priority,
        description: input.description.trim(),
        status: ComplaintStatus.PENDING,
      },
      include: {
        student: {
          include: {
            user: { select: { name: true, email: true } },
          },
        },
      },
    });

    return complaint;
  }

  public async getComplaintsByStudent(studentId: string) {
    return prisma.complaint.findMany({
      where: { studentId },
      orderBy: { createdAt: 'desc' },
      include: {
        student: {
          include: {
            user: { select: { name: true, email: true } },
          },
        },
      },
    });
  }

  public async getAllComplaints() {
    return prisma.complaint.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        student: {
          include: {
            user: { select: { name: true, email: true } },
          },
        },
      },
    });
  }

  public async getComplaintById(id: string) {
    const complaint = await prisma.complaint.findUnique({
      where: { id },
      include: {
        student: {
          include: {
            user: { select: { name: true, email: true } },
          },
        },
      },
    });

    if (!complaint) {
      throw AppError.notFound('অভিযোগটি খুঁজে পাওয়া যায়নি (Complaint not found)');
    }

    return complaint;
  }

  public async updateStatus(id: string, status: ComplaintStatus, adminNote?: string) {
    const existing = await prisma.complaint.findUnique({ where: { id } });
    if (!existing) {
      throw AppError.notFound('অভিযোগটি খুঁজে পাওয়া যায়নি (Complaint not found)');
    }

    const updated = await prisma.complaint.update({
      where: { id },
      data: {
        status,
        adminNote: adminNote?.trim(),
        resolvedAt: status === ComplaintStatus.RESOLVED ? new Date() : null,
      },
      include: {
        student: {
          include: {
            user: { select: { name: true, email: true } },
          },
        },
      },
    });

    return updated;
  }
}

export const complaintService = new ComplaintService();
