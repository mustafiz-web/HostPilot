import { Request, Response, NextFunction } from 'express';
import { noticeService } from './notice.service';

export class NoticeController {
  public async createNotice(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const notice = await noticeService.createNotice(req.user!.id, req.body);
      res.status(201).json({
        success: true,
        data: notice,
        message: 'নোটিশ সফলভাবে প্রকাশ করা হয়েছে (Notice published successfully)',
      });
    } catch (error) {
      next(error);
    }
  }

  public async getNotices(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const notices = await noticeService.getNotices(req.user?.role);
      res.status(200).json({
        success: true,
        data: notices,
        message: 'Notices retrieved successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  public async getNoticeById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const notice = await noticeService.getNoticeById(req.params.id, req.user?.role);
      res.status(200).json({
        success: true,
        data: notice,
        message: 'Notice details retrieved successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  public async updateNotice(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const notice = await noticeService.updateNotice(req.params.id, req.body);
      res.status(200).json({
        success: true,
        data: notice,
        message: 'নোটিশ সফলভাবে আপডেট করা হয়েছে (Notice updated successfully)',
      });
    } catch (error) {
      next(error);
    }
  }
}

export const noticeController = new NoticeController();
