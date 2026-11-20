import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Receipt, Plus, AlertCircle, Loader2, RefreshCw } from 'lucide-react';
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

export interface ExpenseItem {
  id: string;
  title: string;
  category: string;
  categoryLabel: string;
  amount: number;
  description?: string;
  expenseDate: string;
  recordedBy: string;
  createdAt: string;
}

export const ExpensesPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [addError, setAddError] = useState<string | null>(null);

  const [newExp, setNewExp] = useState({
    title: '',
    category: 'UTILITIES',
    amount: '',
  });

  // Query: Fetch expenses from real MySQL API
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

  const expenses: ExpenseItem[] = expensesResponse?.data || [];
  const totalExpense = expenses.reduce((sum, item) => sum + item.amount, 0);

  // Mutation: Record Expense
  const addExpenseMutation = useMutation({
    mutationFn: async (payload: { title: string; category: string; amount: number }) => {
      const res = await apiClient.post<ExpenseItem>('/expenses', payload);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-expenses'] });
      setAddModalOpen(false);
      setAddError(null);
      setNewExp({
        title: '',
        category: 'UTILITIES',
        amount: '',
      });
    },
    onError: (err: any) => {
      setAddError(err.message || 'খরচ এন্ট্রি করতে সমস্যা হয়েছে');
    },
  });

  const handleAddExpense = (e: React.FormEvent) => {
    e.preventDefault();
    setAddError(null);
    addExpenseMutation.mutate({
      title: newExp.title,
      category: newExp.category,
      amount: Number(newExp.amount),
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
            <Receipt className="w-6 h-6 text-emerald-600" />
            <span>হোস্টেল খরচ ও ব্যয় ব্যবস্থাপনা (Expense Management)</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-500">
            বিদ্যুৎ, ডাইনিং রেশন, ওয়াইফাই এবং হোস্টেল রক্ষণাবেক্ষণের নিয়মিত খরচের হিসাব
          </p>
        </div>
        <Button
          onClick={() => {
            setAddError(null);
            setAddModalOpen(true);
          }}
          className="gap-2 shadow-xs self-start sm:self-auto bg-emerald-600 hover:bg-emerald-700"
        >
          <Plus className="w-4 h-4" />
          <span>নতুন খরচ এন্ট্রি করুন</span>
        </Button>
      </div>

      {/* Expense Summary Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
          <span className="text-xs text-slate-500 font-semibold uppercase">মোট খরচ</span>
          <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">
            ৳ {totalExpense.toLocaleString()}
          </div>
          <span className="text-xs text-slate-400">ফিল্টারকৃত মোট ব্যয় ({expenses.length} টি ভাউচার)</span>
        </div>
      </div>

      {/* Filter Category Strip */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-wrap items-center gap-2">
        <span className="text-xs text-slate-500 font-medium">ক্যাটাগরি:</span>
        <Button
          size="sm"
          variant={categoryFilter === 'ALL' ? 'default' : 'outline'}
          onClick={() => setCategoryFilter('ALL')}
          className="text-xs rounded-full h-8"
        >
          সব ({expenses.length})
        </Button>
        <Button
          size="sm"
          variant={categoryFilter === 'UTILITIES' ? 'default' : 'outline'}
          onClick={() => setCategoryFilter('UTILITIES')}
          className="text-xs rounded-full h-8"
        >
          বিদ্যুৎ ও ইউটিলিটি
        </Button>
        <Button
          size="sm"
          variant={categoryFilter === 'MAINTENANCE' ? 'default' : 'outline'}
          onClick={() => setCategoryFilter('MAINTENANCE')}
          className="text-xs rounded-full h-8"
        >
          রক্ষণাবেক্ষণ
        </Button>
        <Button
          size="sm"
          variant={categoryFilter === 'FOOD' ? 'default' : 'outline'}
          onClick={() => setCategoryFilter('FOOD')}
          className="text-xs rounded-full h-8"
        >
          খাদ্য ও ডাইনিং
        </Button>
      </div>

      {/* Expenses Table */}
      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-12 w-full rounded-xl" />
          ))}
        </div>
      ) : isError ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-4">
          <AlertCircle className="w-12 h-12 text-rose-500 mx-auto" />
          <h3 className="text-lg font-bold text-slate-800">ব্যয়ের হিসাব লোড করা যায়নি</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            {(error as any)?.message || 'সার্ভার থেকে খরচের তথ্য পাওয়া যায়নি।'}
          </p>
          <Button onClick={() => refetch()} variant="outline" size="sm" className="gap-2">
            <RefreshCw className="w-4 h-4" />
            <span>পুনরায় লোড করুন</span>
          </Button>
        </div>
      ) : expenses.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-3">
          <Receipt className="w-12 h-12 text-slate-300 mx-auto" />
          <h4 className="text-base font-bold text-slate-800">কোনো খরচ রেকর্ড পাওয়া যায়নি</h4>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            নতুন খরচের হিসাব অন্তর্ভুক্ত করতে ওপরের "নতুন খরচ এন্ট্রি করুন" বাটনে চাপুন।
          </p>
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>খরচের বিবরণ</TableHead>
              <TableHead>ক্যাটাগরি</TableHead>
              <TableHead>তারিখ</TableHead>
              <TableHead>অ্যান্ট্রিকৃত কর্মকর্তা</TableHead>
              <TableHead className="text-right">টাকার পরিমাণ (BDT)</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {expenses.map((item) => (
              <TableRow key={item.id}>
                <TableCell className="font-bold text-slate-900 text-sm">
                  {item.title}
                </TableCell>
                <TableCell>
                  <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700">
                    {item.categoryLabel}
                  </span>
                </TableCell>
                <TableCell className="text-xs text-slate-500">{item.expenseDate}</TableCell>
                <TableCell className="text-xs text-slate-600">{item.recordedBy}</TableCell>
                <TableCell className="text-right font-extrabold text-slate-900 text-sm">
                  ৳ {item.amount.toLocaleString()}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      {/* Add Expense Modal */}
      <Dialog open={addModalOpen} onOpenChange={setAddModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>নতুন খরচ রেকর্ড করুন</DialogTitle>
            <DialogDescription>
              হোস্টেল পরিচালনা ও মেরামতের ব্যয় বিবরণী সংরক্ষণ করুন।
            </DialogDescription>
          </DialogHeader>

          {addError && (
            <Alert variant="destructive" className="bg-rose-50 border-rose-200 text-rose-800 text-xs">
              <AlertCircle className="w-4 h-4 text-rose-600" />
              <AlertDescription>{addError}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleAddExpense} className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label htmlFor="exp-title">খরচের শিরোনাম / বিবরণ *</Label>
              <Input
                id="exp-title"
                required
                placeholder="যেমন: ডাইনিং গ্যাস সিলিন্ডার রিফিল"
                value={newExp.title}
                onChange={(e) => setNewExp({ ...newExp, title: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>খরচের ক্যাটাগরি *</Label>
                <select
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-xs focus:ring-2 focus:ring-ring"
                  value={newExp.category}
                  onChange={(e) => setNewExp({ ...newExp, category: e.target.value })}
                >
                  <option value="UTILITIES">ইউটিলিটি ও বিল</option>
                  <option value="MAINTENANCE">মেরামত ও রক্ষণাবেক্ষণ</option>
                  <option value="FOOD">খাদ্য ও ডাইনিং</option>
                  <option value="STAFF_SALARY">স্টাফ বেতন</option>
                  <option value="OTHER">অন্যান্য</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="exp-amt">টাকার পরিমাণ (BDT) *</Label>
                <Input
                  id="exp-amt"
                  type="number"
                  min={1}
                  required
                  placeholder="যেমন: ৩০০০"
                  value={newExp.amount}
                  onChange={(e) => setNewExp({ ...newExp, amount: e.target.value })}
                />
              </div>
            </div>

            <DialogFooter className="flex flex-col-reverse sm:flex-row gap-2 pt-2">
              <Button type="button" variant="outline" className="w-full sm:w-auto" onClick={() => setAddModalOpen(false)}>
                বাতিল
              </Button>
              <Button
                type="submit"
                disabled={addExpenseMutation.isPending}
                className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-700"
              >
                {addExpenseMutation.isPending ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" />
                    <span>সংরক্ষণ হচ্ছে...</span>
                  </>
                ) : (
                  <span>খরচ সংরক্ষণ করুন</span>
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};
