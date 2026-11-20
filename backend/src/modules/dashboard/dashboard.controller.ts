import { Request, Response, NextFunction } from 'express';
import { dashboardService } from './dashboard.service';
import { ApiResponse } from '../../utils/api-response';

export class DashboardController {
  public async getAdminMetrics(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const data = await dashboardService.getAdminMetrics();
      ApiResponse.success(res, data, 'Admin dashboard metrics retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  public async getStudentMetrics(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.id;
      const studentId = req.user!.studentId;
      const data = await dashboardService.getStudentMetrics(userId, studentId);
      ApiResponse.success(res, data, 'Student dashboard metrics retrieved successfully');
    } catch (error) {
      next(error);
    }
  }
}

export const dashboardController = new DashboardController();
