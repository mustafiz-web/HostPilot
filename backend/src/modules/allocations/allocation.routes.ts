import { Router } from 'express';
import { allocationController } from './allocation.controller';
import { createAllocationSchema, vacateAllocationSchema } from './allocation.schema';
import { authenticate } from '../../middlewares/authenticate.middleware';
import { authorize } from '../../middlewares/authorize.middleware';
import { validate } from '../../middlewares/validate.middleware';

const router = Router();

// 1. List Allocations (Admin Only)
router.get(
  '/',
  authenticate,
  authorize('ADMIN'),
  (req, res, next) => allocationController.getAllocations(req, res, next)
);

// 2. Allocate Bed to Student (Admin Only)
router.post(
  '/',
  authenticate,
  authorize('ADMIN'),
  validate(createAllocationSchema),
  (req, res, next) => allocationController.allocateBed(req, res, next)
);

// 3. Vacate Bed Allocation (Admin Only)
router.patch(
  '/:id/vacate',
  authenticate,
  authorize('ADMIN'),
  validate(vacateAllocationSchema),
  (req, res, next) => allocationController.vacateAllocation(req, res, next)
);

export const allocationRoutes = router;
