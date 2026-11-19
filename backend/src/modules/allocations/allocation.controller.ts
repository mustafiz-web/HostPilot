import { Request, Response, NextFunction } from 'express';
import { allocationService } from './allocation.service';

export class AllocationController {
  public async allocateBed(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const allocation = await allocationService.allocateBed(req.body, req.user!.id);
      res.status(201).json({
        success: true,
        data: allocation,
        message: 'সিট সফলভাবে বরাদ্দ করা হয়েছে (Bed allocated successfully)',
      });
    } catch (error) {
      next(error);
    }
  }

  public async vacateAllocation(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const allocation = await allocationService.vacateAllocation(
        req.params.id,
        new Date(req.body.endDate || new Date())
      );
      res.status(200).json({
        success: true,
        data: allocation,
        message: 'সিট বরাদ্দ সফলভাবে সমাপ্ত করা হয়েছে (Bed vacated successfully)',
      });
    } catch (error) {
      next(error);
    }
  }

  public async getAllocations(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const allocations = await allocationService.getAllocations(req.query.status as any);
      res.status(200).json({
        success: true,
        data: allocations,
        message: 'Allocations retrieved successfully',
      });
    } catch (error) {
      next(error);
    }
  }
}

export const allocationController = new AllocationController();
