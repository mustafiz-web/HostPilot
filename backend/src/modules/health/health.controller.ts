import { Request, Response, NextFunction } from 'express';
import { healthService } from './health.service';
import { ApiResponse } from '../../utils/api-response';

export class HealthController {
  public checkHealth(_req: Request, res: Response, next: NextFunction): void {
    try {
      const healthData = healthService.getHealthStatus();
      ApiResponse.success(res, healthData, 'Host Pilot API is healthy and operational');
    } catch (error) {
      next(error);
    }
  }
}

export const healthController = new HealthController();
