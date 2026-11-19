import { Router } from 'express';
import { studentController } from './student.controller';
import {
  createStudentSchema,
  updateStudentSchema,
  updateStudentStatusSchema,
  studentQuerySchema,
} from './student.schema';
import { authenticate } from '../../middlewares/authenticate.middleware';
import { authorize } from '../../middlewares/authorize.middleware';
import { requireStudentOwnership } from '../../middlewares/ownership.middleware';
import { validate } from '../../middlewares/validate.middleware';

const router = Router();

// 1. Create Student (Admin Only)
router.post(
  '/',
  authenticate,
  authorize('ADMIN'),
  validate(createStudentSchema),
  (req, res, next) => studentController.createStudent(req, res, next)
);

// 2. List Students (Admin Only - paginated, searchable, filterable)
router.get(
  '/',
  authenticate,
  authorize('ADMIN'),
  validate(studentQuerySchema),
  (req, res, next) => studentController.getStudents(req, res, next)
);

// 3. Logged-in Student's Own Profile (Student Only)
router.get(
  '/me/profile',
  authenticate,
  authorize('STUDENT'),
  (req, res, next) => studentController.getMyProfile(req, res, next)
);

// 4. Student Details by ID (Admin or Owning Student)
router.get(
  '/:id',
  authenticate,
  requireStudentOwnership('id'),
  (req, res, next) => studentController.getStudentById(req, res, next)
);

// 5. Update Student Profile (Admin or Owning Student with restricted fields)
router.patch(
  '/:id',
  authenticate,
  requireStudentOwnership('id'),
  validate(updateStudentSchema),
  (req, res, next) => studentController.updateStudent(req, res, next)
);

// 6. Change Student Status (Admin Only)
router.patch(
  '/:id/status',
  authenticate,
  authorize('ADMIN'),
  validate(updateStudentStatusSchema),
  (req, res, next) => studentController.updateStudentStatus(req, res, next)
);

export const studentRoutes = router;
