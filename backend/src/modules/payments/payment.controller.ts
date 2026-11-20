import { Request, Response, NextFunction } from 'express';
import { paymentService } from './payment.service';
import { AppError } from '../../utils/app-error';

export class PaymentController {
  public async recordPayment(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      let studentId = req.body.studentId;
      if (req.user?.role === 'STUDENT') {
        if (!req.user.studentId) {
          throw AppError.forbidden('Only registered students can make fee payments');
        }
        studentId = req.user.studentId;
      } else if (!studentId) {
        throw AppError.badRequest('শিক্ষার্থী আইডি আবশ্যক (Student ID required)');
      }

      const payment = await paymentService.recordPayment(
        { ...req.body, studentId },
        req.user!.id
      );
      res.status(201).json({
        success: true,
        data: payment,
        message: 'পেমেন্ট সফলভাবে রেকর্ড করা হয়েছে (Payment recorded successfully)',
      });
    } catch (error) {
      next(error);
    }
  }

  public async getAllPayments(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const payments = await paymentService.getAllPayments();
      res.status(200).json({
        success: true,
        data: payments,
        message: 'Payments retrieved successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  public async getMyPayments(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user?.studentId) {
        throw AppError.forbidden('Only registered students can access their payment history');
      }
      const payments = await paymentService.getStudentPayments(req.user.studentId);
      res.status(200).json({
        success: true,
        data: payments,
        message: 'Student payments retrieved successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  public async getPaymentById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const payment = await paymentService.getPaymentById(req.params.id);

      // Ownership enforcement: Students can only view their own payment receipt!
      if (req.user?.role === 'STUDENT' && req.user.studentId !== payment.studentId) {
        throw AppError.forbidden(
          'Access denied: students are strictly prohibited from accessing another student’s payment receipt'
        );
      }

      res.status(200).json({
        success: true,
        data: payment,
        message: 'Payment receipt retrieved successfully',
      });
    } catch (error) {
      next(error);
    }
  }
}

export const paymentController = new PaymentController();
