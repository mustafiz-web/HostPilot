import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  TrendingDown,
  Plus,
  Receipt,
  AlertCircle,
  Loader2,
  RefreshCw,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { apiClient } from '@/lib/api-client';
import { formatCurrency, formatDate, formatNumber } from '@/lib/formatters';

interface ExpenseItem {
  id: string;
  title: string;
  amount: number;
  category: 'UTILITIES' | 'MAINTENANCE' | 'FOOD' | 'STAFF_SALARY' | 'OTHER';
  expenseDate: string;
  recordedBy?: {
    name: string;
    email: string;
  };
}

export const ExpensesPage: React.FC = () => {
  const { t, i18n } = useTranslation();
  const isEn = i18n.language?.startsWith('en');
  const queryClient = useQueryClient();

  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [addError, setAddError] = useState<string | null>(null);

  const [newExpense, setNewExpense] = useState({
    title: '',
    category: 'UTILITIES' as ExpenseItem['category'],
    amount: '',
    expenseDate: new Date().toISOString().split('T')[0],
  });

  // Query: Expenses from MySQL
  const {
    data: expensesResponse,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ['admin-expenses', { category: categoryFilter }],
    queryFn: async () => {
      const res = await apiClient.get<ExpenseItem[]>('/expenses', {
        category: categoryFilter === 'ALL' ? undefined : categoryFilter,
      });
      return res;
    },
    staleTime: 30 * 1000,
  });

  const expenses = expensesResponse?.data || [];
  const totalExpense = expenses.reduce((sum, e) => sum + Number(e.amount || 0), 0);

  // Mutation: Record Expense
  const addExpenseMutation = useMutation({
    mutationFn: async (payload: typeof newExpense) => {
      const res = await apiClient.post<ExpenseItem>('/expenses', {
        ...payload,
        amount: Number(payload.amount),
      });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-expenses'] });
      queryClient.invalidateQueries({ queryKey: ['admin-dashboard-metrics'] });
      setAddModalOpen(false);
      setAddError(null);
      setNewExpense({
        title: '',
        category: 'UTILITIES',
        amount: '',
        expenseDate: new Date().toISOString().split('T')[0],
      });
    },
    onError: (err: any) => {
      setAddError(err.message || t('common.error_occurred'));
    },
  });

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setAddError(null);
    addExpenseMutation.mutate(newExpense);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
            <TrendingDown className="w-6 h-6 text-rose-600" />
            <span>{t('admin.expenses.title')}</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-500">
            {t('admin.expenses.subtitle')}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            className="gap-1.5 text-xs text-slate-700"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>{t('common.refresh')}</span>
          </Button>
          <Button
            onClick={() => {
              setAddError(null);
              setAddModalOpen(true);
            }}
            className="gap-2 shadow-xs bg-rose-600 hover:bg-rose-700 text-white"
          >
            <Plus className="w-4 h-4" />
            <span>{t('admin.expenses.btn_add_expense')}</span>
          </Button>
        </div>
      </div>

      {/* KPI Cards & Filter */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <span className="text-xs text-slate-500 font-semibold uppercase">{t('admin.expenses.stat_total_expenses')}</span>
          <div className="text-2xl font-black text-rose-700">{formatCurrency(totalExpense)}</div>
          <span className="text-xs text-slate-400">
            {t('common.total_count', { count: expenses.length })}
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs text-slate-500 font-medium">{t('student.complaints.category_field')}:</span>
          <Button
            size="sm"
            variant={categoryFilter === 'ALL' ? 'default' : 'outline'}
            onClick={() => setCategoryFilter('ALL')}
            className="text-xs rounded-full h-8"
          >
            {t('common.all')} ({formatNumber(expenses.length)})
          </Button>
          <Button
            size="sm"
            variant={categoryFilter === 'UTILITIES' ? 'default' : 'outline'}
            onClick={() => setCategoryFilter('UTILITIES')}
            className="text-xs rounded-full h-8"
          >
            {t('admin.expenses.cat_utilities')}
          </Button>
          <Button
            size="sm"
            variant={categoryFilter === 'MAINTENANCE' ? 'default' : 'outline'}
            onClick={() => setCategoryFilter('MAINTENANCE')}
            className="text-xs rounded-full h-8"
          >
            {t('admin.expenses.cat_maintenance')}
          </Button>
          <Button
            size="sm"
            variant={categoryFilter === 'FOOD' ? 'default' : 'outline'}
            onClick={() => setCategoryFilter('FOOD')}
            className="text-xs rounded-full h-8"
          >
            {t('admin.expenses.cat_dining')}
          </Button>
        </div>
      </div>

      {/* Table Card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        {isLoading ? (
          <div className="p-8 space-y-4">
            <div className="flex items-center justify-center gap-2 text-slate-500 text-sm">
              <Loader2 className="w-5 h-5 animate-spin text-rose-600" />
              <span>{t('common.loading')}</span>
            </div>
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
        ) : isError ? (
          <div className="p-8 text-center space-y-3">
            <AlertCircle className="w-8 h-8 text-rose-500 mx-auto" />
            <h3 className="text-lg font-bold text-slate-800">{isEn ? 'Failed to load expenses' : 'ব্যয়ের হিসাব লোড করা যায়নি'}</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              {(error as any)?.message || t('common.error_occurred')}
            </p>
            <Button variant="outline" size="sm" onClick={() => refetch()} className="gap-1.5">
              <RefreshCw className="w-3.5 h-3.5" />
              <span>{t('common.retry')}</span>
            </Button>
          </div>
        ) : expenses.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <Receipt className="w-12 h-12 text-slate-300 mx-auto" />
            <h4 className="text-base font-bold text-slate-800">{t('admin.expenses.empty_expenses')}</h4>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              {isEn ? 'Click the button above to record a new expense.' : 'নতুন খরচের হিসাব অন্তর্ভুক্ত করতে ওপরের "নতুন খরচ এন্ট্রি করুন" বাটনে চাপুন।'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-50/80">
                  <TableHead className="font-semibold text-xs">{t('admin.expenses.th_title')}</TableHead>
                  <TableHead className="font-semibold text-xs">{t('admin.expenses.th_category')}</TableHead>
                  <TableHead className="font-semibold text-xs">{t('admin.expenses.th_date')}</TableHead>
                  <TableHead className="font-semibold text-xs">{t('admin.expenses.th_recorded_by')}</TableHead>
                  <TableHead className="font-semibold text-xs text-right">{t('admin.expenses.th_amount')} (BDT)</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {expenses.map((item) => (
                  <TableRow key={item.id} className="hover:bg-slate-50/50">
                    <TableCell className="font-bold text-xs text-slate-900">
                      {item.title}
                    </TableCell>
                    <TableCell className="text-xs">
                      <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-mono text-[11px]">
                        {item.category}
                      </span>
                    </TableCell>
                    <TableCell className="text-xs text-slate-500">
                      {formatDate(item.expenseDate)}
                    </TableCell>
                    <TableCell className="text-xs text-slate-600 font-medium">
                      {item.recordedBy?.name || 'Admin'}
                    </TableCell>
                    <TableCell className="font-mono text-xs font-bold text-rose-700 text-right">
                      {formatCurrency(item.amount)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>

      {/* Record Expense Dialog */}
      <Dialog open={addModalOpen} onOpenChange={setAddModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-base font-bold flex items-center gap-2">
              <TrendingDown className="w-5 h-5 text-rose-600" />
              <span>{t('admin.expenses.dialog_add_title')}</span>
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-500">
              {isEn ? 'Record hostel operational, utility, or maintenance expense.' : 'হোস্টেল পরিচালনা ও মেরামতের ব্যয় বিবরণী সংরক্ষণ করুন।'}
            </DialogDescription>
          </DialogHeader>

          {addError && (
            <Alert variant="destructive" className="bg-rose-50 border-rose-200 text-rose-800 text-xs">
              <AlertCircle className="w-4 h-4 text-rose-600" />
              <AlertDescription>{addError}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleAddSubmit} className="space-y-4 text-xs">
            <div className="space-y-1.5">
              <Label htmlFor="exp-title">{t('admin.expenses.th_title')} *</Label>
              <Input
                id="exp-title"
                required
                placeholder={isEn ? 'e.g. Dining gas cylinder refill' : 'যেমন: ডাইনিং গ্যাস সিলিন্ডার রিফিল'}
                value={newExpense.title}
                onChange={(e) => setNewExpense({ ...newExpense, title: e.target.value })}
                className="h-9 text-xs"
              />
            </div>

            <div className="space-y-1.5">
              <Label>{t('admin.expenses.th_category')} *</Label>
              <select
                value={newExpense.category}
                onChange={(e) => setNewExpense({ ...newExpense, category: e.target.value as any })}
                className="w-full h-9 rounded-md border border-slate-200 bg-white px-3 py-1 text-xs"
              >
                <option value="UTILITIES">{t('admin.expenses.cat_utilities')}</option>
                <option value="MAINTENANCE">{t('admin.expenses.cat_maintenance')}</option>
                <option value="FOOD">{t('admin.expenses.cat_dining')}</option>
                <option value="STAFF_SALARY">{t('admin.expenses.cat_salary')}</option>
                <option value="OTHER">{t('admin.expenses.cat_other')}</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="exp-amt">{t('admin.expenses.th_amount')} (BDT) *</Label>
              <Input
                id="exp-amt"
                type="number"
                min="0"
                step="50"
                required
                placeholder={isEn ? 'e.g. 3000' : 'যেমন: ৩০০০'}
                value={newExpense.amount}
                onChange={(e) => setNewExpense({ ...newExpense, amount: e.target.value })}
                className="h-9 text-xs font-mono"
              />
            </div>

            <DialogFooter className="gap-2 pt-2 flex-col sm:flex-row">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setAddModalOpen(false)}
              >
                {t('common.cancel')}
              </Button>
              <Button
                type="submit"
                size="sm"
                disabled={addExpenseMutation.isPending}
                className="bg-rose-600 hover:bg-rose-700 text-white"
              >
                {addExpenseMutation.isPending ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" />
                    <span>{t('common.loading')}</span>
                  </>
                ) : (
                  <span>{t('common.save')}</span>
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};
