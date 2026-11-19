import { Request, Response, NextFunction } from 'express';
import { studentService } from './student.service';
import { ApiResponse } from '../../utils/api-response';

export class StudentController {
  public async createStudent(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const student = await studentService.createStudent(req.body);
      ApiResponse.created(res, student, 'শিক্ষার্থী সফলভাবে নিবন্ধিত হয়েছে (Student registered successfully)');
    } catch (error) {
      next(error);
    }
  }

  public async getStudents(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await studentService.getStudents(req.query as any);
      ApiResponse.success(res, result.items, 'Students retrieved successfully', 200, result.pagination);
    } catch (error) {
      next(error);
    }
  }

  public async getStudentById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const student = await studentService.getStudentById(req.params.id);
      ApiResponse.success(res, student, 'Student details retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  public async getMyProfile(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const studentId = req.user?.studentId || req.user?.id;
      if (!studentId) {
        return next(new Error('Student profile association missing'));
      }
      const student = await studentService.getStudentById(studentId);
      ApiResponse.success(res, student, 'Student personal profile retrieved');
    } catch (error) {
      next(error);
    }
  }

  public async updateStudent(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const isStudentSelf = req.user?.role === 'STUDENT';
      const student = await studentService.updateStudent(req.params.id, req.body, isStudentSelf);
      ApiResponse.success(res, student, 'Student profile updated successfully');
    } catch (error) {
      next(error);
    }
  }

  public async updateStudentStatus(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const student = await studentService.updateStudentStatus(req.params.id, req.body.status);
      ApiResponse.success(res, student, 'Student status updated successfully');
    } catch (error) {
      next(error);
    }
  }
}

export const studentController = new StudentController();
