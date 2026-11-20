import { Router } from 'express';
import { paymentController } from './payment.controller';
import { recordPaymentSchema } from './payment.schema';
import { authenticate } from '../../middlewares/authenticate.middleware';
import { authorize } from '../../middlewares/authorize.middleware';
import { validate } from '../../middlewares/validate.middleware';

const router = Router();

// 1. Logged-in Student Payments History
router.get(
  '/me',
  authenticate,
  authorize('STUDENT'),
  (req, res, next) => paymentController.getMyPayments(req, res, next)
);

router.get(
  '/my-payments',
  authenticate,
  authorize('STUDENT'),
  (req, res, next) => paymentController.getMyPayments(req, res, next)
);

// 2. All Payments List (Admin Only)
router.get(
  '/',
  authenticate,
  authorize('ADMIN'),
  (req, res, next) => paymentController.getAllPayments(req, res, next)
);

// 3. Record / Pay Fee (Admin or Logged-in Student)
router.post(
  '/',
  authenticate,
  authorize('ADMIN', 'STUDENT'),
  validate(recordPaymentSchema),
  (req, res, next) => paymentController.recordPayment(req, res, next)
);

// 4. Payment Receipt by ID (Admin or Owning Student)
router.get(
  '/:id',
  authenticate,
  (req, res, next) => paymentController.getPaymentById(req, res, next)
);

export const paymentRoutes = router;
