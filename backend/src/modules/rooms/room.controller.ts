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

  public async getRooms(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const rooms = await roomService.getRooms();
      res.status(200).json({
        success: true,
        data: rooms,
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
}

export const roomController = new RoomController();
