import { prisma } from '../../config/database';
import { AppError } from '../../utils/app-error';
import { PaymentMethod, PaymentStatus } from '@prisma/client';

export class PaymentService {
  /**
   * Record payment.
   * Strictly enforces duplicate billing period rule (rejects with 409 CONFLICT).
   */
  public async recordPayment(
    input: {
      studentId: string;
      billingPeriod: string;
      amount: number;
      paidAmount: number;
      paymentMethod: PaymentMethod;
      transactionReference?: string;
    },
    recordedByUserId: string
  ) {
    const student = await prisma.student.findUnique({
      where: { id: input.studentId },
    });
    if (!student) {
      throw AppError.notFound('শিক্ষার্থীর রেকর্ড খুঁজে পাওয়া যায়নি (Student not found)');
    }

    const billingPeriod = input.billingPeriod.trim();

    // Check duplicate billing-period payment
    const existing = await prisma.payment.findUnique({
      where: {
        studentId_billingPeriod: {
          studentId: input.studentId,
          billingPeriod,
        },
      },
    });

    if (existing) {
      throw AppError.conflict(
        `এই শিক্ষার্থীর জন্য '${billingPeriod}' বিলিং পিরিয়ডের পেমেন্ট ইতিমধ্যে রেকর্ড করা হয়েছে (Duplicate billing period payment)`
      );
    }

    // Generate unique receipt number
    const totalPayments = await prisma.payment.count();
    const year = new Date().getFullYear();
    const receiptNumber = `HP-REC-${year}-${String(totalPayments + 1).padStart(5, '0')}`;

    const status: PaymentStatus =
      input.paidAmount >= input.amount
        ? PaymentStatus.PAID
        : input.paidAmount > 0
        ? PaymentStatus.PARTIAL
        : PaymentStatus.DUE;

    const payment = await prisma.payment.create({
      data: {
        studentId: input.studentId,
        billingPeriod,
        amount: input.amount,
        paidAmount: input.paidAmount,
        status,
        paymentMethod: input.paymentMethod,
        receiptNumber,
        transactionReference: input.transactionReference?.trim(),
        paidAt: input.paidAmount > 0 ? new Date() : null,
        recordedByUserId,
      },
      include: {
        student: {
          include: {
            user: { select: { name: true, email: true } },
          },
        },
      },
    });

    return payment;
  }

  /**
   * List all payments (Admin)
   */
  public async getAllPayments() {
    const payments = await prisma.payment.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        student: {
          include: {
            user: { select: { name: true, email: true } },
          },
        },
        recordedByUser: {
          select: { name: true, email: true },
        },
      },
    });
    return payments;
  }

  /**
   * Get student's own payment history
   */
  public async getStudentPayments(studentId: string) {
    const payments = await prisma.payment.findMany({
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
    return payments;
  }

  /**
   * Get single receipt details
   */
  public async getPaymentById(id: string) {
    const payment = await prisma.payment.findUnique({
      where: { id },
      include: {
        student: {
          include: {
            user: { select: { name: true, email: true } },
          },
        },
        recordedByUser: {
          select: { name: true, email: true },
        },
      },
    });

    if (!payment) {
      throw AppError.notFound('পেমেন্ট রসিদ খুঁজে পাওয়া যায়নি (Payment receipt not found)');
    }

    return payment;
  }
}

export const paymentService = new PaymentService();
