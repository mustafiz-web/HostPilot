import { prisma } from '../../config/database';
import { AppError } from '../../utils/app-error';

export class DashboardService {
  /**
   * Aggregated real-time metrics for Admin Dashboard
   */
  public async getAdminMetrics() {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const [
      totalStudents,
      activeStudents,
      totalRooms,
      totalBeds,
      occupiedBeds,
      availableBeds,
      monthPaymentAgg,
      pendingComplaintsCount,
      recentAdmissions,
      recentPayments,
      recentComplaints,
    ] = await Promise.all([
      prisma.student.count(),
      prisma.student.count({ where: { status: 'ACTIVE' } }),
      prisma.room.count(),
      prisma.bed.count(),
      prisma.bed.count({ where: { status: 'OCCUPIED' } }),
      prisma.bed.count({ where: { status: 'AVAILABLE' } }),
      prisma.payment.aggregate({
        _sum: { paidAmount: true },
        where: {
          status: 'PAID',
          paidAt: { gte: startOfMonth },
        },
      }),
      prisma.complaint.count({
        where: { status: { in: ['PENDING', 'IN_PROGRESS'] } },
      }),
      prisma.admission.findMany({
        take: 4,
        orderBy: { appliedAt: 'desc' },
        select: {
          id: true,
          applicationNumber: true,
          applicantName: true,
          email: true,
          phone: true,
          preferredRoomType: true,
          status: true,
          appliedAt: true,
        },
      }),
      prisma.payment.findMany({
        take: 4,
        orderBy: { createdAt: 'desc' },
        include: {
          student: {
            include: {
              user: { select: { name: true } },
              allocations: {
                where: { status: 'ACTIVE' },
                take: 1,
                include: {
                  bed: {
                    include: {
                      room: { select: { roomNumber: true } },
                    },
                  },
                },
              },
            },
          },
        },
      }),
      prisma.complaint.findMany({
        take: 3,
        orderBy: { createdAt: 'desc' },
        include: {
          student: {
            include: {
              user: { select: { name: true } },
              allocations: {
                where: { status: 'ACTIVE' },
                take: 1,
                include: {
                  bed: {
                    include: {
                      room: { select: { roomNumber: true } },
                    },
                  },
                },
              },
            },
          },
        },
      }),
    ]);

    const monthlyCollection = Number(monthPaymentAgg._sum.paidAmount || 0);
    const occupancyRate = totalBeds > 0 ? ((occupiedBeds / totalBeds) * 100).toFixed(1) : '0';

    return {
      stats: {
        totalStudents,
        activeStudents,
        totalRooms,
        totalBeds,
        occupiedBeds,
        availableBeds,
        occupancyRate: Number(occupancyRate),
        monthlyCollection,
        pendingComplaintsCount,
      },
      recentAdmissions,
      recentPayments: recentPayments.map((p) => ({
        id: p.id,
        receiptNumber: p.receiptNumber,
        studentName: p.student?.user?.name || 'Unknown Student',
        roomNumber: p.student?.allocations?.[0]?.bed?.room?.roomNumber || 'N/A',
        amount: Number(p.amount),
        paidAmount: Number(p.paidAmount),
        status: p.status,
        billingPeriod: p.billingPeriod,
        paidAt: p.paidAt,
        createdAt: p.createdAt,
      })),
      recentComplaints: recentComplaints.map((c) => ({
        id: c.id,
        title: c.title,
        category: c.category,
        priority: c.priority,
        status: c.status,
        studentName: c.student?.user?.name || 'Unknown Student',
        roomNumber: c.student?.allocations?.[0]?.bed?.room?.roomNumber || 'N/A',
        createdAt: c.createdAt,
      })),
    };
  }

  /**
   * Real-time personalized dashboard for authenticated Student
   */
  public async getStudentMetrics(userId: string, studentId?: string) {
    const student = await prisma.student.findFirst({
      where: {
        OR: [
          ...(studentId ? [{ id: studentId }] : []),
          { userId },
        ],
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            status: true,
          },
        },
        guardians: true,
        allocations: {
          where: { status: 'ACTIVE' },
          take: 1,
          include: {
            bed: {
              include: {
                room: true,
              },
            },
          },
        },
      },
    });

    if (!student) {
      throw AppError.notFound('শিক্ষার্থীর প্রোফাইল পাওয়া যায়নি (Student profile not found)');
    }

    const activeAlloc = student.allocations[0] || null;

    // Find roommates if allocated
    let roommates: Array<{ name: string; bedCode: string; department: string }> = [];
    if (activeAlloc?.bed?.roomId) {
      const roomAllocations = await prisma.roomAllocation.findMany({
        where: {
          status: 'ACTIVE',
          studentId: { not: student.id },
          bed: {
            roomId: activeAlloc.bed.roomId,
          },
        },
        include: {
          student: {
            include: {
              user: { select: { name: true } },
            },
          },
          bed: { select: { bedCode: true } },
        },
      });

      roommates = roomAllocations.map((ra) => ({
        name: ra.student.user.name,
        bedCode: ra.bed.bedCode,
        department: ra.student.department,
      }));
    }

    // Current due payment
    const duePayment = await prisma.payment.findFirst({
      where: {
        studentId: student.id,
        status: { in: ['DUE', 'PARTIAL'] },
      },
      orderBy: { createdAt: 'desc' },
    });

    // Recent student complaints
    const recentComplaints = await prisma.complaint.findMany({
      where: { studentId: student.id },
      orderBy: { createdAt: 'desc' },
      take: 3,
    });

    // Recent published notices
    const recentNotices = await prisma.notice.findMany({
      where: { status: 'PUBLISHED' },
      orderBy: [{ isPinned: 'desc' }, { publishedAt: 'desc' }],
      take: 3,
      select: {
        id: true,
        title: true,
        category: true,
        isPinned: true,
        publishedAt: true,
      },
    });

    return {
      profile: {
        id: student.id,
        name: student.user.name,
        email: student.user.email,
        studentCode: student.studentCode,
        phone: student.phone,
        department: student.department,
        rollNumber: student.rollNumber,
        session: student.session,
        batch: student.batch,
        status: student.status,
      },
      allocation: activeAlloc
        ? {
            id: activeAlloc.id,
            roomNumber: activeAlloc.bed.room.roomNumber,
            floor: activeAlloc.bed.room.floor,
            roomType: activeAlloc.bed.room.roomType,
            bedCode: activeAlloc.bed.bedCode,
            monthlyRent: Number(activeAlloc.bed.room.monthlyRent),
            startDate: activeAlloc.startDate,
          }
        : null,
      roommates,
      currentDue: duePayment
        ? {
            id: duePayment.id,
            billingPeriod: duePayment.billingPeriod,
            amount: Number(duePayment.amount),
            paidAmount: Number(duePayment.paidAmount),
            dueAmount: Number(duePayment.amount) - Number(duePayment.paidAmount),
            status: duePayment.status,
          }
        : null,
      complaints: recentComplaints.map((c) => ({
        id: c.id,
        title: c.title,
        category: c.category,
        priority: c.priority,
        status: c.status,
        createdAt: c.createdAt,
      })),
      notices: recentNotices,
    };
  }
}

export const dashboardService = new DashboardService();
