import { Request, Response, NextFunction } from 'express';
import { roomService } from './room.service';

export class RoomController {
  public async createRoom(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const room = await roomService.createRoom(req.body);
      res.status(201).json({
        success: true,
        data: room,
        message: 'রুম সফলভাবে তৈরি করা হয়েছে (Room created successfully)',
      });
    } catch (error) {
      next(error);
    }
  }

  public async getRooms(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const isAdmin = req.user?.role === 'ADMIN';
      const result = await roomService.getRooms(req.query as any, isAdmin);
      res.status(200).json({
        success: true,
        data: result.rooms,
        meta: result.summary,
        message: 'Rooms retrieved successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  public async getRoomById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const room = await roomService.getRoomById(req.params.id);
      res.status(200).json({
        success: true,
        data: room,
        message: 'Room details retrieved successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  public async addBed(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const bed = await roomService.addBed(req.params.roomId, req.body);
      res.status(201).json({
        success: true,
        data: bed,
        message: 'বেড সফলভাবে যুক্ত করা হয়েছে (Bed added successfully)',
      });
    } catch (error) {
      next(error);
    }
  }

  public async updateRoom(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const room = await roomService.updateRoom(req.params.id, req.body);
      res.status(200).json({
        success: true,
        data: room,
        message: 'রুমের তথ্য সফলভাবে হালনাগাদ করা হয়েছে (Room updated successfully)',
      });
    } catch (error) {
      next(error);
    }
  }

  public async deleteRoom(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await roomService.deleteRoom(req.params.id);
      res.status(200).json({
        success: true,
        data: result,
        message: result.message,
      });
    } catch (error) {
      next(error);
    }
  }

  public async getRoomAllocationHistory(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const history = await roomService.getRoomAllocationHistory(req.params.id);
      res.status(200).json({
        success: true,
        data: history,
        message: 'Room allocation history retrieved successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  public async updateBed(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const bed = await roomService.updateBed(req.params.roomId, req.params.bedId, req.body);
      res.status(200).json({
        success: true,
        data: bed,
        message: 'বেডের তথ্য সফলভাবে আপডেট করা হয়েছে (Bed updated successfully)',
      });
    } catch (error) {
      next(error);
    }
  }

  public async deleteBed(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await roomService.deleteBed(req.params.roomId, req.params.bedId);
      res.status(200).json({
        success: true,
        data: result,
        message: result.message,
      });
    } catch (error) {
      next(error);
    }
  }
}

export const roomController = new RoomController();
