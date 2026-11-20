import { Router } from 'express';
import { expenseController } from './expense.controller';
import { createExpenseSchema } from './expense.schema';
import { authenticate } from '../../middlewares/authenticate.middleware';
import { authorize } from '../../middlewares/authorize.middleware';
import { validate } from '../../middlewares/validate.middleware';

const router = Router();

// 1. List Expenses (Admin Only)
router.get(
  '/',
  authenticate,
  authorize('ADMIN'),
  (req, res, next) => expenseController.getExpenses(req, res, next)
);

// 2. Record Expense (Admin Only)
router.post(
  '/',
  authenticate,
  authorize('ADMIN'),
  validate(createExpenseSchema),
  (req, res, next) => expenseController.createExpense(req, res, next)
);

// 3. List Categories
router.get(
  '/categories',
  authenticate,
  authorize('ADMIN'),
  (req, res, next) => expenseController.getCategories(req, res, next)
);

// 4. Update Expense (Admin Only)
router.patch(
  '/:id',
  authenticate,
  authorize('ADMIN'),
  (req, res, next) => expenseController.updateExpense(req, res, next)
);

// 5. Delete Expense (Admin Only)
router.delete(
  '/:id',
  authenticate,
  authorize('ADMIN'),
  (req, res, next) => expenseController.deleteExpense(req, res, next)
);

export const expenseRoutes = router;
