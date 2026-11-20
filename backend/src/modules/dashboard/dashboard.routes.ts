import { Router } from 'express';
import { dashboardController } from './dashboard.controller';
import { authenticate } from '../../middlewares/authenticate.middleware';
import { authorize } from '../../middlewares/authorize.middleware';

const router = Router();

// 1. Admin Dashboard Metrics (Admin Only)
router.get(
  '/admin',
  authenticate,
  authorize('ADMIN'),
  (req, res, next) => dashboardController.getAdminMetrics(req, res, next)
);

// 2. Student Dashboard Metrics (Student Only - strictly own records)
router.get(
  '/student',
  authenticate,
  authorize('STUDENT'),
  (req, res, next) => dashboardController.getStudentMetrics(req, res, next)
);

export const dashboardRoutes = router;
