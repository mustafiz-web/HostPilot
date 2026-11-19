import { Request, Response, NextFunction } from 'express';
import { complaintService } from './complaint.service';
import { AppError } from '../../utils/app-error';

export class ComplaintController {
  public async createComplaint(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user?.studentId) {
        throw AppError.forbidden('Only students can submit complaints');
      }
      const complaint = await complaintService.createComplaint(req.user.studentId, req.body);
      res.status(201).json({
        success: true,
        data: complaint,
        message: 'অভিযোগ সফলভাবে দাখিল করা হয়েছে (Complaint submitted successfully)',
      });
    } catch (error) {
      next(error);
    }
  }

  public async getMyComplaints(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user?.studentId) {
        throw AppError.forbidden('Only students can view their complaints');
      }
      const complaints = await complaintService.getComplaintsByStudent(req.user.studentId);
      res.status(200).json({
        success: true,
        data: complaints,
        message: 'Student complaints retrieved successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  public async getAllComplaints(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const complaints = await complaintService.getAllComplaints();
      res.status(200).json({
        success: true,
        data: complaints,
        message: 'All complaints retrieved successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  public async getComplaintById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const complaint = await complaintService.getComplaintById(req.params.id);

      // Ownership check: Student can only view their own complaint
      if (req.user?.role === 'STUDENT' && req.user.studentId !== complaint.studentId) {
        throw AppError.forbidden(
          'Access denied: students are strictly prohibited from accessing another student’s complaint'
        );
      }

      res.status(200).json({
        success: true,
        data: complaint,
        message: 'Complaint retrieved successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  public async updateStatus(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const complaint = await complaintService.updateStatus(
        req.params.id,
        req.body.status,
        req.body.adminNote
      );
      res.status(200).json({
        success: true,
        data: complaint,
        message: 'অভিযোগের স্ট্যাটাস সফলভাবে আপডেট করা হয়েছে (Status updated)',
      });
    } catch (error) {
      next(error);
    }
  }
}

export const complaintController = new ComplaintController();
