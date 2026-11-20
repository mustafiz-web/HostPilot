import { Router } from 'express';
import { healthRoutes } from './modules/health/health.routes';
import { authRoutes } from './modules/auth/auth.routes';
import { studentRoutes } from './modules/students/student.routes';
import { admissionRoutes } from './modules/admissions/admission.routes';
import { roomRoutes } from './modules/rooms/room.routes';
import { allocationRoutes } from './modules/allocations/allocation.routes';
import { paymentRoutes } from './modules/payments/payment.routes';
import { complaintRoutes } from './modules/complaints/complaint.routes';
import { noticeRoutes } from './modules/notices/notice.routes';
import { expenseRoutes } from './modules/expenses/expense.routes';
import { dashboardRoutes } from './modules/dashboard/dashboard.routes';

const router = Router();

// Health Check API
router.use('/health', healthRoutes);

// Authentication & Identity API
router.use('/auth', authRoutes);

// Students & Guardians Management API
router.use('/students', studentRoutes);

// Admissions API
router.use('/admissions', admissionRoutes);

// Rooms & Beds API
router.use('/rooms', roomRoutes);

// Seat Allocations API
router.use('/allocations', allocationRoutes);

// Payments & Billing API
router.use('/payments', paymentRoutes);

// Expenses API
router.use('/expenses', expenseRoutes);

// Complaints API
router.use('/complaints', complaintRoutes);

// Notices API
router.use('/notices', noticeRoutes);

// Dashboard Analytics API
router.use('/dashboard', dashboardRoutes);

export const apiV1Routes = router;
