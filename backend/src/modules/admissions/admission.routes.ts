import { Router } from 'express';
import { admissionController } from './admission.controller';
import {
  createAdmissionSchema,
  updateAdmissionStatusSchema,
  admissionQuerySchema,
} from './admission.schema';
import { authenticate } from '../../middlewares/authenticate.middleware';
import { authorize } from '../../middlewares/authorize.middleware';
import { validate } from '../../middlewares/validate.middleware';

const router = Router();

// 1. Submit Online Admission Application (Public)
router.post(
  '/',
  validate(createAdmissionSchema),
  (req, res, next) => admissionController.createApplication(req, res, next)
);

// 2. List Applications (Admin Only)
router.get(
  '/',
  authenticate,
  authorize('ADMIN'),
  validate(admissionQuerySchema),
  (req, res, next) => admissionController.getApplications(req, res, next)
);

// 3. Application Details (Admin Only)
router.get(
  '/:id',
  authenticate,
  authorize('ADMIN'),
  (req, res, next) => admissionController.getApplicationById(req, res, next)
);

// 4. Update Status / Review Decision (Admin Only)
router.patch(
  '/:id/status',
  authenticate,
  authorize('ADMIN'),
  validate(updateAdmissionStatusSchema),
  (req, res, next) => admissionController.updateStatus(req, res, next)
);

export const admissionRoutes = router;
