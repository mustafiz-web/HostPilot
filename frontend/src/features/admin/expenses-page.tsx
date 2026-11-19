import React, { useState } from 'react';
import { Receipt, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
import { INITIAL_MOCK_EXPENSES, type MockExpense } from './mock-data/admin-mock-data';

export const ExpensesPage: React.FC = () => {
  const [expenses, setExpenses] = useState<MockExpense[]>(INITIAL_MOCK_EXPENSES);
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');
  const [addModalOpen, setAddModalOpen] = useState(false);

  const [newExp, setNewExp] = useState({
    title: '',
    category: 'MAINTENANCE' as any,
    categoryLabel: 'রক্ষণাবেক্ষণ',
    amount: '',
    expenseDate: '১৮ নভেম্বর, ২০২৬',
  });

  const filtered = expenses.filter((e) => {
    if (categoryFilter === 'ALL') return true;
    return e.category === categoryFilter;
  });

  const totalExpense = filtered.reduce((sum, item) => sum + item.amount, 0);

  const handleAddExpense = (e: React.FormEvent) => {
    e.preventDefault();
    const catLabels: Record<string, string> = {
      UTILITIES: 'বিদ্যুৎ ও গ্যাস',
      MAINTENANCE: 'রক্ষণাবেক্ষণ',
      FOOD: 'খাদ্য ও ডাইনিং',
      STAFF_SALARY: 'স্টাফ বেতন',
      OTHER: 'অন্যান্য',
    };

    const entry: MockExpense = {
      id: `exp-${Date.now()}`,
      title: newExp.title,
      category: newExp.category,
      categoryLabel: catLabels[newExp.category] || 'সাধারণ',
      amount: Number(newExp.amount),
      expenseDate: newExp.expenseDate,
      recordedBy: 'Admin (Current User)',
    };

    setExpenses([entry, ...expenses]);
    setAddModalOpen(false);
    setNewExp({
      title: '',
      category: 'MAINTENANCE',
      categoryLabel: 'রক্ষণাবেক্ষণ',
      amount: '',
      expenseDate: '১৮ নভেম্বর, ২০২৬',
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
        <Button onClick={() => setAddModalOpen(true)} className="gap-2 shadow-xs self-start sm:self-auto">
          <Plus className="w-4 h-4" />
          <span>নতুন খরচ এন্ট্রি করুন</span>
        </Button>
      </div>

      {/* Expense Summary Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
          <span className="text-xs text-slate-500 font-semibold uppercase">মোট খরচ (চলতি মাস)</span>
          <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">
            ৳ {totalExpense.toLocaleString()}
          </div>
          <span className="text-xs text-slate-400">ফিল্টারকৃত মোট ব্যয়</span>
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
          {filtered.map((item) => (
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

      {/* Add Expense Modal */}
      <Dialog open={addModalOpen} onOpenChange={setAddModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>নতুন খরচ রেকর্ড করুন</DialogTitle>
            <DialogDescription>
              হোস্টেল পরিচালনা ও মেরামতের ব্যয় বিবরণী সংরক্ষণ করুন।
            </DialogDescription>
          </DialogHeader>

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

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>খরচের ক্যাটাগরি *</Label>
                <select
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-xs focus:ring-2 focus:ring-ring"
                  value={newExp.category}
                  onChange={(e) => setNewExp({ ...newExp, category: e.target.value as any })}
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
                  required
                  placeholder="যেমন: ৩০০০"
                  value={newExp.amount}
                  onChange={(e) => setNewExp({ ...newExp, amount: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="exp-date">খরচের তারিখ</Label>
              <Input
                id="exp-date"
                value={newExp.expenseDate}
                onChange={(e) => setNewExp({ ...newExp, expenseDate: e.target.value })}
              />
            </div>

            <DialogFooter className="gap-2 pt-2">
              <Button type="button" variant="outline" onClick={() => setAddModalOpen(false)}>
                বাতিল
              </Button>
              <Button type="submit">খরচ সংরক্ষণ করুন</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};
