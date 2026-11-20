import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  CreditCard,
  Plus,
  Search,
  Receipt,
  Printer,
  AlertCircle,
  Loader2,
  RefreshCw,
  FileText,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { StatusBadge } from '@/components/ui/status-badge';
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

export interface PaymentItem {
  id: string;
  studentId: string;
  billingPeriod: string;
  amount: number;
  paidAmount: number;
  status: 'PAID' | 'PARTIAL' | 'DUE';
  paymentMethod?: 'CASH' | 'BANK_TRANSFER' | 'BKASH' | 'NAGAD' | null;
  receiptNumber: string;
  transactionReference?: string | null;
  paidAt?: string | null;
  createdAt: string;
  student?: {
    id: string;
    studentCode: string;
    rollNumber: string;
    department: string;
    user?: {
      name: string;
      email: string;
    };
  };
  recordedByUser?: {
    name: string;
    email: string;
  } | null;
}

export const PaymentsPage: React.FC = () => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();

  const [statusFilter, setStatusFilter] = useState<'ALL' | 'PAID' | 'DUE' | 'PARTIAL'>('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [addError, setAddError] = useState<string | null>(null);
  const [receiptTarget, setReceiptTarget] = useState<PaymentItem | null>(null);

  const [newPay, setNewPay] = useState({
    studentId: '',
    billingPeriod: 'নভেম্বর ২০২৬',
    amount: '4500',
    paidAmount: '4500',
    paymentMethod: 'BKASH' as 'CASH' | 'BANK_TRANSFER' | 'BKASH' | 'NAGAD',
    transactionReference: '',
  });

  // Query: Fetch all payments from real MySQL API
  const {
    data: paymentsResponse,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ['admin-payments'],
    queryFn: async () => {
      const res = await apiClient.get<PaymentItem[]>('/payments');
      return res;
    },
    staleTime: 30 * 1000,
  });

  const payments: PaymentItem[] = paymentsResponse?.data || [];

  // Query: Active Students for payment dropdown
  const { data: studentsResponse } = useQuery({
    queryKey: ['admin-students-dropdown'],
    queryFn: async () => {
      const res = await apiClient.get<any>('/students', { limit: 100 });
      return res.data;
    },
    staleTime: 60 * 1000,
  });

  const studentsList: any[] = studentsResponse || [];

  // Mutation: Record Payment
  const recordPaymentMutation = useMutation({
    mutationFn: async (payload: {
      studentId: string;
      billingPeriod: string;
      amount: number;
      paidAmount: number;
      paymentMethod: string;
      transactionReference?: string;
    }) => {
      const res = await apiClient.post<PaymentItem>('/payments', payload);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-payments'] });
      queryClient.invalidateQueries({ queryKey: ['admin-dashboard-metrics'] });
      setAddModalOpen(false);
      setAddError(null);
      setNewPay({
        studentId: '',
        billingPeriod: 'নভেম্বর ২০২৬',
        amount: '4500',
        paidAmount: '4500',
        paymentMethod: 'BKASH',
        transactionReference: '',
      });
    },
    onError: (err: any) => {
      setAddError(err.message || 'পেমেন্ট রেকর্ড করতে সমস্যা হয়েছে');
    },
  });

  const handleRecordPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPay.studentId) {
      setAddError('অনুগ্রহ করে একজন শিক্ষার্থী নির্বাচন করুন');
      return;
    }
    setAddError(null);
    recordPaymentMutation.mutate({
      studentId: newPay.studentId,
      billingPeriod: newPay.billingPeriod,
      amount: Number(newPay.amount),
      paidAmount: Number(newPay.paidAmount),
      paymentMethod: newPay.paymentMethod,
      transactionReference: newPay.transactionReference || undefined,
    });
  };

  const filtered = payments.filter((p) => {
    const matchesStatus = statusFilter === 'ALL' || p.status === statusFilter;
    const term = searchTerm.toLowerCase().trim();
    const studentName = p.student?.user?.name?.toLowerCase() || '';
    const studentCode = p.student?.studentCode?.toLowerCase() || '';
    const receipt = p.receiptNumber.toLowerCase();
    const matchesSearch =
      !term ||
      studentName.includes(term) ||
      studentCode.includes(term) ||
      receipt.includes(term);
    return matchesStatus && matchesSearch;
  });

  const totalCollected = payments.reduce((sum, item) => sum + Number(item.paidAmount || 0), 0);
  const totalDue = payments
    .filter((p) => p.status === 'DUE' || p.status === 'PARTIAL')
    .reduce((sum, item) => sum + (Number(item.amount) - Number(item.paidAmount || 0)), 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
            <CreditCard className="w-6 h-6 text-emerald-600" />
            <span>{t('admin.payments.title')}</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-500">
            {t('admin.payments.subtitle')}
          </p>
        </div>
        <Button
          onClick={() => {
            setAddError(null);
            setAddModalOpen(true);
          }}
          className="gap-2 shadow-xs bg-emerald-600 hover:bg-emerald-700 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>{t('admin.payments.btn_record_payment')}</span>
        </Button>
      </div>

      {/* Financial Summary Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
          <span className="text-xs text-slate-500 font-semibold uppercase">{t('admin.payments.stat_total_collection')}</span>
          <div className="text-2xl sm:text-3xl font-extrabold text-emerald-600 mt-1">
            ৳ {totalCollected.toLocaleString()}
          </div>
          <span className="text-xs text-slate-400">মোট আদায়কৃত অর্থ ({payments.length} টি রসিদ)</span>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
          <span className="text-xs text-slate-500 font-semibold uppercase">{t('admin.payments.stat_total_due')}</span>
          <div className="text-2xl sm:text-3xl font-extrabold text-rose-600 mt-1">
            ৳ {totalDue.toLocaleString()}
          </div>
          <span className="text-xs text-slate-400">বকেয়া বিলিং পরিমাণ</span>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
          <span className="text-xs text-slate-500 font-semibold uppercase">{t('admin.payments.stat_active_invoices')}</span>
          <div className="text-2xl sm:text-3xl font-extrabold text-blue-600 mt-1">
            {payments.filter((p) => p.status === 'PAID').length} টি
          </div>
          <span className="text-xs text-slate-400">পরিশোধিত সফল ভাউচার</span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <Input
            placeholder="রসিদ নং বা শিক্ষার্থীর নাম দিয়ে খুঁজুন..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 h-9 text-xs sm:text-sm"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          <span className="text-xs text-slate-500 font-medium">স্ট্যাটাস:</span>
          <Button
            size="sm"
            variant={statusFilter === 'ALL' ? 'default' : 'outline'}
            onClick={() => setStatusFilter('ALL')}
            className="text-xs rounded-full h-8"
          >
            সব ({payments.length})
          </Button>
          <Button
            size="sm"
            variant={statusFilter === 'PAID' ? 'default' : 'outline'}
            onClick={() => setStatusFilter('PAID')}
            className="text-xs rounded-full h-8"
          >
            পরিশোধিত ({payments.filter((p) => p.status === 'PAID').length})
          </Button>
          <Button
            size="sm"
            variant={statusFilter === 'DUE' ? 'default' : 'outline'}
            onClick={() => setStatusFilter('DUE')}
            className="text-xs rounded-full h-8"
          >
            বকেয়া ({payments.filter((p) => p.status === 'DUE').length})
          </Button>
          <Button
            size="sm"
            variant={statusFilter === 'PARTIAL' ? 'default' : 'outline'}
            onClick={() => setStatusFilter('PARTIAL')}
            className="text-xs rounded-full h-8"
          >
            আংশিক ({payments.filter((p) => p.status === 'PARTIAL').length})
          </Button>
        </div>
      </div>

      {/* Payments Table */}
      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-14 w-full rounded-xl" />
          ))}
        </div>
      ) : isError ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-4">
          <AlertCircle className="w-12 h-12 text-rose-500 mx-auto" />
          <h3 className="text-lg font-bold text-slate-800">পেমেন্ট তালিকা লোড করা যায়নি</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            {(error as any)?.message || 'সার্ভার থেকে পেমেন্ট সংক্রান্ত তথ্য পাওয়া যায়নি।'}
          </p>
          <Button onClick={() => refetch()} variant="outline" size="sm" className="gap-2">
            <RefreshCw className="w-4 h-4" />
            <span>পুনরায় লোড করুন</span>
          </Button>
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-3">
          <FileText className="w-12 h-12 text-slate-300 mx-auto" />
          <h4 className="text-base font-bold text-slate-800">কোনো পেমেন্ট রেকর্ড পাওয়া যায়নি</h4>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            নতুন ভাড়া বা ফি রেকর্ড করতে ওপরের বাটনে চাপুন।
          </p>
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>রসিদ নম্বর</TableHead>
              <TableHead>শিক্ষার্থী</TableHead>
              <TableHead>বিলিং পিরিয়ড</TableHead>
              <TableHead>পরিশোধ পদ্ধতি</TableHead>
              <TableHead>নির্ধারিত ফি</TableHead>
              <TableHead>পরিশোধিত</TableHead>
              <TableHead>স্ট্যাটাস</TableHead>
              <TableHead className="text-right">অ্যাকশন</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((item) => (
              <TableRow key={item.id}>
                <TableCell className="font-mono text-xs font-bold text-slate-800">
                  {item.receiptNumber}
                </TableCell>
                <TableCell>
                  <div className="font-bold text-slate-900 text-sm">
                    {item.student?.user?.name || 'শিক্ষার্থী'}
                  </div>
                  <div className="text-xs text-slate-400 font-mono">
                    {item.student?.studentCode} • {item.student?.department}
                  </div>
                </TableCell>
                <TableCell className="text-xs font-medium text-slate-700">
                  {item.billingPeriod}
                </TableCell>
                <TableCell>
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-slate-100 text-slate-700">
                    {item.paymentMethod || 'N/A'}
                  </span>
                </TableCell>
                <TableCell className="text-xs font-semibold text-slate-600">
                  ৳ {Number(item.amount).toLocaleString()}
                </TableCell>
                <TableCell className="text-xs font-bold text-emerald-700">
                  ৳ {Number(item.paidAmount).toLocaleString()}
                </TableCell>
                <TableCell>
                  <StatusBadge status={item.status} />
                </TableCell>
                <TableCell className="text-right">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setReceiptTarget(item)}
                    className="h-8 px-2.5 text-xs text-slate-700 gap-1.5 hover:text-emerald-700"
                  >
                    <Receipt className="w-3.5 h-3.5" />
                    <span>মানি রিসিট</span>
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      {/* Record Payment Modal */}
      <Dialog open={addModalOpen} onOpenChange={setAddModalOpen}>
        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>নতুন ভাড়া / ফি কালেকশন এন্ট্রি</DialogTitle>
            <DialogDescription>
              শিক্ষার্থীর মাসিক সিট ভাড়া বা বকেয়া ফি প্রাপ্তি নিশ্চিত করে রসিদ তৈরি করুন।
            </DialogDescription>
          </DialogHeader>

          {addError && (
            <Alert variant="destructive" className="bg-rose-50 border-rose-200 text-rose-800 text-xs">
              <AlertCircle className="w-4 h-4 text-rose-600" />
              <AlertDescription>{addError}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleRecordPayment} className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">শিক্ষার্থী নির্বাচন করুন *</Label>
              <select
                required
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-xs focus:ring-2 focus:ring-ring"
                value={newPay.studentId}
                onChange={(e) => setNewPay({ ...newPay, studentId: e.target.value })}
              >
                <option value="">-- শিক্ষার্থী বাছাই করুন --</option>
                {studentsList.map((stu) => (
                  <option key={stu.id} value={stu.id}>
                    {stu.user?.name} ({stu.studentCode} • রোল {stu.rollNumber})
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="pay-period" className="text-xs font-semibold">
                বিলিং পিরিয়ড (মাস ও সাল) *
              </Label>
              <Input
                id="pay-period"
                required
                placeholder="যেমন: নভেম্বর ২০২৬"
                value={newPay.billingPeriod}
                onChange={(e) => setNewPay({ ...newPay, billingPeriod: e.target.value })}
                className="h-9 text-xs"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="pay-amt" className="text-xs font-semibold">
                  ধার্যকৃত মোট ফি (BDT) *
                </Label>
                <Input
                  id="pay-amt"
                  type="number"
                  min={1}
                  required
                  value={newPay.amount}
                  onChange={(e) => setNewPay({ ...newPay, amount: e.target.value })}
                  className="h-9 text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="pay-paid" className="text-xs font-semibold">
                  প্রাপ্ত অর্থ (BDT) *
                </Label>
                <Input
                  id="pay-paid"
                  type="number"
                  min={0}
                  required
                  value={newPay.paidAmount}
                  onChange={(e) => setNewPay({ ...newPay, paidAmount: e.target.value })}
                  className="h-9 text-xs"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">পরিশোধের মাধ্যম *</Label>
                <select
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-xs focus:ring-2 focus:ring-ring"
                  value={newPay.paymentMethod}
                  onChange={(e) => setNewPay({ ...newPay, paymentMethod: e.target.value as any })}
                >
                  <option value="BKASH">বিকাশ (bKash)</option>
                  <option value="NAGAD">নগদ (Nagad)</option>
                  <option value="CASH">ক্যাশ / নগদ টাকা</option>
                  <option value="BANK_TRANSFER">ব্যাংক ডিপোজিট</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="pay-tx" className="text-xs font-semibold text-slate-500">
                  ট্রানজ্যাকশন আইডি (ঐচ্ছিক)
                </Label>
                <Input
                  id="pay-tx"
                  placeholder="e.g. TRX982341"
                  value={newPay.transactionReference}
                  onChange={(e) => setNewPay({ ...newPay, transactionReference: e.target.value })}
                  className="h-9 text-xs font-mono"
                />
              </div>
            </div>

            <DialogFooter className="flex flex-col-reverse sm:flex-row gap-2 pt-2">
              <Button type="button" variant="outline" className="w-full sm:w-auto" onClick={() => setAddModalOpen(false)}>
                বাতিল
              </Button>
              <Button
                type="submit"
                disabled={recordPaymentMutation.isPending}
                className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-700"
              >
                {recordPaymentMutation.isPending ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" />
                    <span>রেকর্ড হচ্ছে...</span>
                  </>
                ) : (
                  <span>পেমেন্ট সংরক্ষণ করুন</span>
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Official Receipt Modal Dialog */}
      {receiptTarget && (
        <Dialog open={!!receiptTarget} onOpenChange={(open) => !open && setReceiptTarget(null)}>
          <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center justify-between text-base">
                <span>অফিসিয়াল মানি রিসিট (Receipt)</span>
                <span className="text-xs font-mono text-emerald-700">{receiptTarget.receiptNumber}</span>
              </DialogTitle>
            </DialogHeader>

            <div className="p-6 bg-slate-50/80 rounded-xl border border-slate-200 text-xs space-y-4 my-2">
              <div className="flex justify-between border-b pb-2">
                <span className="text-slate-500">শিক্ষার্থী:</span>
                <span className="font-bold text-slate-900">{receiptTarget.student?.user?.name}</span>
              </div>
              <div className="flex justify-between border-b pb-2">
                <span className="text-slate-500">আইডি ও বিভাগ:</span>
                <span className="font-mono text-slate-700">
                  {receiptTarget.student?.studentCode} • {receiptTarget.student?.department}
                </span>
              </div>
              <div className="flex justify-between border-b pb-2">
                <span className="text-slate-500">বিলিং সেশন:</span>
                <span className="font-bold text-slate-800">{receiptTarget.billingPeriod}</span>
              </div>
              <div className="flex justify-between border-b pb-2">
                <span className="text-slate-500">পেমেন্ট মেথড:</span>
                <span className="font-semibold text-slate-700">{receiptTarget.paymentMethod}</span>
              </div>
              {receiptTarget.transactionReference && (
                <div className="flex justify-between border-b pb-2">
                  <span className="text-slate-500">ট্রানজ্যাকশন আইডি:</span>
                  <span className="font-mono text-slate-700">{receiptTarget.transactionReference}</span>
                </div>
              )}
              <div className="flex justify-between border-b pb-2">
                <span className="text-slate-500">নির্ধারিত মোট ভাড়া:</span>
                <span className="font-semibold text-slate-800">৳ {Number(receiptTarget.amount).toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm font-bold text-emerald-800 pt-1">
                <span>আদায়কৃত অর্থ:</span>
                <span>৳ {Number(receiptTarget.paidAmount).toLocaleString()}</span>
              </div>
            </div>

            <DialogFooter className="gap-2 flex flex-col-reverse sm:flex-row">
              <Button variant="outline" className="w-full sm:w-auto" onClick={() => setReceiptTarget(null)}>
                বন্ধ করুন
              </Button>
              <Button onClick={() => window.print()} className="w-full sm:w-auto gap-2">
                <Printer className="w-4 h-4" />
                <span>প্রিন্ট রসিদ</span>
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};
