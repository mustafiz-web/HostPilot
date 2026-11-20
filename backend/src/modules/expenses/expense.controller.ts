import { Request, Response, NextFunction } from 'express';
import { expenseService } from './expense.service';

export class ExpenseController {
  public async createExpense(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const expense = await expenseService.createExpense(req.user!.id, req.body);
      res.status(201).json({
        success: true,
        data: expense,
        message: 'খরচ সফলভাবে এন্ট্রি করা হয়েছে (Expense recorded successfully)',
      });
    } catch (error) {
      next(error);
    }
  }

  public async getExpenses(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await expenseService.getExpenses(req.query as any);
      res.status(200).json({
        success: true,
        data: result.expenses,
        meta: result.summary,
        message: 'Expenses retrieved successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  public async getCategories(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const categories = await expenseService.getCategories();
      res.status(200).json({
        success: true,
        data: categories,
        message: 'Expense categories retrieved successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  public async updateExpense(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const expense = await expenseService.updateExpense(req.params.id, req.body);
      res.status(200).json({
        success: true,
        data: expense,
        message: 'খরচ সফলভাবে আপডেট করা হয়েছে (Expense updated successfully)',
      });
    } catch (error) {
      next(error);
    }
  }

  public async deleteExpense(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await expenseService.deleteExpense(req.params.id);
      res.status(200).json({
        success: true,
        data: result,
        message: 'খরচের রেকর্ড সফলভাবে মুছে ফেলা হয়েছে (Expense deleted successfully)',
      });
    } catch (error) {
      next(error);
    }
  }
}

export const expenseController = new ExpenseController();
