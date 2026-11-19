import { Request, Response, NextFunction } from 'express';
import { admissionService } from './admission.service';

export class AdmissionController {
  public async createApplication(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const admission = await admissionService.createApplication(req.body);
      res.status(201).json({
        success: true,
        data: admission,
        message: 'ভর্তি আবেদন সফলভাবে জমা নেওয়া হয়েছে (Admission application submitted successfully)',
      });
    } catch (error) {
      next(error);
    }
  }

  public async getApplications(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await admissionService.getApplications(req.query as any);
      res.status(200).json({
        success: true,
        data: result.admissions,
        meta: result.meta,
        message: 'Admission applications retrieved successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  public async getApplicationById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const admission = await admissionService.getApplicationById(req.params.id);
      res.status(200).json({
        success: true,
        data: admission,
        message: 'Admission details retrieved successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  public async updateStatus(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const admission = await admissionService.updateStatus(
        req.params.id,
        req.body,
        req.user!.id
      );
      res.status(200).json({
        success: true,
        data: admission,
        message: 'আবেদনের স্ট্যাটাস সফলভাবে আপডেট করা হয়েছে (Status updated)',
      });
    } catch (error) {
      next(error);
    }
  }
}

export const admissionController = new AdmissionController();
