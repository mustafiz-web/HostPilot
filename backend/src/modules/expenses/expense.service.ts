import { prisma } from '../../config/database';
import { AppError } from '../../utils/app-error';

export class ExpenseService {
  public async createExpense(
    userId: string,
    input: {
      title: string;
      amount: number;
      category: string;
      description?: string;
      expenseDate?: Date;
    }
  ) {
    const categoryName = input.category.trim();

    // Find or create category
    let category = await prisma.expenseCategory.findUnique({
      where: { name: categoryName },
    });

    if (!category) {
      category = await prisma.expenseCategory.create({
        data: {
          name: categoryName,
          description: `${categoryName} category expenses`,
          isActive: true,
        },
      });
    }

    const expense = await prisma.expense.create({
      data: {
        title: input.title.trim(),
        amount: input.amount,
        categoryId: category.id,
        description: input.description?.trim() || null,
        expenseDate: input.expenseDate || new Date(),
        recordedByUserId: userId,
      },
      include: {
        category: true,
        recordedByUser: {
          select: { name: true, email: true },
        },
      },
    });

    return {
      id: expense.id,
      title: expense.title,
      category: expense.category.name,
      categoryLabel: this.getCategoryLabel(expense.category.name),
      amount: Number(expense.amount),
      description: expense.description,
      expenseDate: expense.expenseDate.toLocaleDateString('bn-BD'),
      rawDate: expense.expenseDate,
      recordedBy: expense.recordedByUser.name,
      createdAt: expense.createdAt,
    };
  }

  public async getExpenses(filters?: { category?: string }) {
    const where: any = {};
    if (filters?.category && filters.category !== 'ALL') {
      where.category = {
        name: filters.category,
      };
    }

    const expenses = await prisma.expense.findMany({
      where,
      orderBy: { expenseDate: 'desc' },
      include: {
        category: true,
        recordedByUser: {
          select: { name: true, email: true },
        },
      },
    });

    const formatted = expenses.map((e) => ({
      id: e.id,
      title: e.title,
      category: e.category.name,
      categoryLabel: this.getCategoryLabel(e.category.name),
      amount: Number(e.amount),
      description: e.description,
      expenseDate: e.expenseDate.toLocaleDateString('bn-BD'),
      rawDate: e.expenseDate,
      recordedBy: e.recordedByUser.name,
      createdAt: e.createdAt,
    }));

    const totalExpense = formatted.reduce((sum, item) => sum + item.amount, 0);

    return {
      expenses: formatted,
      summary: {
        totalExpense,
        totalAmount: totalExpense,
        count: formatted.length,
        totalExpenses: formatted.length,
      },
    };
  }

  public async updateExpense(
    id: string,
    input: {
      title?: string;
      amount?: number;
      category?: string;
      description?: string;
      expenseDate?: Date;
    }
  ) {
    const existing = await prisma.expense.findUnique({
      where: { id },
      include: { category: true },
    });
    if (!existing) {
      throw AppError.notFound('খরচের রেকর্ড খুঁজে পাওয়া যায়নি (Expense not found)');
    }

    let categoryId = existing.categoryId;
    if (input.category) {
      let cat = await prisma.expenseCategory.findUnique({
        where: { name: input.category.trim() },
      });
      if (!cat) {
        cat = await prisma.expenseCategory.create({
          data: {
            name: input.category.trim(),
            description: `${input.category.trim()} expenses`,
            isActive: true,
          },
        });
      }
      categoryId = cat.id;
    }

    const updated = await prisma.expense.update({
      where: { id },
      data: {
        title: input.title !== undefined ? input.title.trim() : undefined,
        amount: input.amount !== undefined ? input.amount : undefined,
        categoryId,
        description: input.description !== undefined ? input.description.trim() : undefined,
        expenseDate: input.expenseDate !== undefined ? input.expenseDate : undefined,
      },
      include: {
        category: true,
        recordedByUser: { select: { name: true, email: true } },
      },
    });

    return {
      id: updated.id,
      title: updated.title,
      category: updated.category.name,
      categoryLabel: this.getCategoryLabel(updated.category.name),
      amount: Number(updated.amount),
      description: updated.description,
      expenseDate: updated.expenseDate.toLocaleDateString('bn-BD'),
      rawDate: updated.expenseDate,
      recordedBy: updated.recordedByUser.name,
      createdAt: updated.createdAt,
    };
  }

  public async deleteExpense(id: string) {
    const existing = await prisma.expense.findUnique({ where: { id } });
    if (!existing) {
      throw AppError.notFound('খরচের রেকর্ড খুঁজে পাওয়া যায়নি (Expense not found)');
    }

    await prisma.expense.delete({ where: { id } });
    return { id, message: 'খরচের রেকর্ড মুছে ফেলা হয়েছে' };
  }

  public async getCategories() {
    return prisma.expenseCategory.findMany({
      where: { isActive: true },
      orderBy: { name: 'asc' },
    });
  }

  private getCategoryLabel(cat: string): string {
    const labels: Record<string, string> = {
      UTILITIES: 'বিদ্যুৎ ও গ্যাস',
      MAINTENANCE: 'রক্ষণাবেক্ষণ',
      FOOD: 'খাদ্য ও ডাইনিং',
      STAFF_SALARY: 'স্টাফ বেতন',
      WIFI: 'ইন্টারনেট ও ওয়াইফাই',
      OTHER: 'অন্যান্য',
    };
    return labels[cat] || cat;
  }
}

export const expenseService = new ExpenseService();
