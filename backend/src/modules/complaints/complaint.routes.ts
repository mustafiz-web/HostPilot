import { Router } from 'express';
import { complaintController } from './complaint.controller';
import { createComplaintSchema, updateComplaintStatusSchema } from './complaint.schema';
import { authenticate } from '../../middlewares/authenticate.middleware';
import { authorize } from '../../middlewares/authorize.middleware';
import { validate } from '../../middlewares/validate.middleware';

const router = Router();

// 1. Submit Complaint (Student Only)
router.post(
  '/',
  authenticate,
  authorize('STUDENT'),
  validate(createComplaintSchema),
  (req, res, next) => complaintController.createComplaint(req, res, next)
);

// 2. Student's Own Complaints List
router.get(
  '/me',
  authenticate,
  authorize('STUDENT'),
  (req, res, next) => complaintController.getMyComplaints(req, res, next)
);

// 3. All Complaints (Admin Only)
router.get(
  '/',
  authenticate,
  authorize('ADMIN'),
  (req, res, next) => complaintController.getAllComplaints(req, res, next)
);

// 4. Complaint Details (Admin or Owning Student)
router.get(
  '/:id',
  authenticate,
  (req, res, next) => complaintController.getComplaintById(req, res, next)
);

// 5. Update Status (Admin Only)
router.patch(
  '/:id/status',
  authenticate,
  authorize('ADMIN'),
  validate(updateComplaintStatusSchema),
  (req, res, next) => complaintController.updateStatus(req, res, next)
);

export const complaintRoutes = router;
