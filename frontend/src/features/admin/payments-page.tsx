import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  CreditCard,
  Plus,
  Receipt,
  Printer,
  Search,
  AlertCircle,
  Loader2,
  RefreshCw,
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
import { formatCurrency, formatNumber } from '@/lib/formatters';

interface PaymentItem {
  id: string;
  studentId: string;
  billingPeriod: string;
  amount: number;
  paidAmount: number;
  status: 'PAID' | 'PARTIAL' | 'DUE';
  paymentMethod: 'CASH' | 'BANK_TRANSFER' | 'BKASH' | 'NAGAD';
  receiptNumber: string;
  transactionReference?: string | null;
  paidAt?: string | null;
  createdAt: string;
  student?: {
    id: string;
    studentCode: string;
    department: string;
    rollNumber: string;
    user?: {
      name: string;
      email: string;
    };
  };
}

interface StudentOption {
  id: string;
  studentCode: string;
  department: string;
  rollNumber: string;
  user: {
    name: string;
    email: string;
  };
}

export const PaymentsPage: React.FC = () => {
  const { t, i18n } = useTranslation();
  const isEn = i18n.language?.startsWith('en');
  const queryClient = useQueryClient();

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'PAID' | 'DUE' | 'PARTIAL'>('ALL');
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [addError, setAddError] = useState<string | null>(null);
  const [receiptTarget, setReceiptTarget] = useState<PaymentItem | null>(null);

  // Form State: New Payment
  const [newPayment, setNewPayment] = useState({
    studentId: '',
    billingPeriod: new Date().toLocaleString(isEn ? 'en-US' : 'bn-BD', { month: 'long', year: 'numeric' }),
    amount: '',
    paidAmount: '',
    paymentMethod: 'BKASH' as 'CASH' | 'BANK_TRANSFER' | 'BKASH' | 'NAGAD',
    transactionReference: '',
  });

  // Query: Payments List
  const {
    data: paymentsResponse,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ['admin-payments', { status: statusFilter }],
    queryFn: async () => {
      const res = await apiClient.get<PaymentItem[]>('/payments', {
        status: statusFilter === 'ALL' ? undefined : statusFilter,
      });
      return res;
    },
    staleTime: 30 * 1000,
  });

  // Query: Active Students for dropdown
  const { data: studentsResponse } = useQuery({
    queryKey: ['students-for-payment-recording'],
    queryFn: async () => {
      const res = await apiClient.get<StudentOption[]>('/students', { limit: 100, status: 'ACTIVE' });
      return res.data;
    },
    enabled: addModalOpen,
  });

  const payments = paymentsResponse?.data || [];
  const students = studentsResponse || [];

  // Filtered List
  const filtered = payments.filter((p) => {
    if (!searchTerm.trim()) return true;
    const term = searchTerm.toLowerCase();
    return (
      p.receiptNumber?.toLowerCase().includes(term) ||
      p.student?.user?.name?.toLowerCase().includes(term) ||
      p.student?.studentCode?.toLowerCase().includes(term) ||
      p.billingPeriod?.toLowerCase().includes(term)
    );
  });

  // Mutation: Record payment
  const addPaymentMutation = useMutation({
    mutationFn: async (payload: any) => {
      const res = await apiClient.post<PaymentItem>('/payments', payload);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-payments'] });
      queryClient.invalidateQueries({ queryKey: ['admin-dashboard-metrics'] });
      setAddModalOpen(false);
      setAddError(null);
      setNewPayment({
        studentId: '',
        billingPeriod: new Date().toLocaleString(isEn ? 'en-US' : 'bn-BD', { month: 'long', year: 'numeric' }),
        amount: '',
        paidAmount: '',
        paymentMethod: 'BKASH',
        transactionReference: '',
      });
    },
    onError: (err: any) => {
      setAddError(err.message || t('common.error_occurred'));
    },
  });

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPayment.studentId) {
      setAddError(isEn ? 'Please select a student' : 'অনুগ্রহ করে একজন শিক্ষার্থী নির্বাচন করুন');
      return;
    }
    setAddError(null);
    addPaymentMutation.mutate({
      studentId: newPayment.studentId,
      billingPeriod: newPayment.billingPeriod,
      amount: Number(newPayment.amount),
      paidAmount: Number(newPayment.paidAmount),
      paymentMethod: newPayment.paymentMethod,
      transactionReference: newPayment.transactionReference.trim() || undefined,
    });
  };

  // Financial aggregates
  const totalCollected = payments.reduce((sum, p) => sum + Number(p.paidAmount || 0), 0);
  const totalDue = payments.reduce(
    (sum, p) => sum + Math.max(0, Number(p.amount || 0) - Number(p.paidAmount || 0)),
    0
  );

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
            className="gap-2 shadow-xs bg-emerald-600 hover:bg-emerald-700 text-white"
          >
            <Plus className="w-4 h-4" />
            <span>{t('admin.payments.btn_record_payment')}</span>
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-2">
          <span className="text-xs font-bold uppercase text-slate-400">
            {t('admin.payments.stat_total_collected')}
          </span>
          <div className="text-2xl font-black text-emerald-700">
            {formatCurrency(totalCollected)}
          </div>
          <span className="text-xs text-slate-400">
            {t('common.total_count', { count: payments.length })}
          </span>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-2">
          <span className="text-xs font-bold uppercase text-slate-400">
            {t('admin.payments.stat_total_due')}
          </span>
          <div className="text-2xl font-black text-amber-600">
            {formatCurrency(totalDue)}
          </div>
          <span className="text-xs text-slate-400">{t('admin.reports.financial_summary')}</span>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-2">
          <span className="text-xs font-bold uppercase text-slate-400">
            {t('status.paid')}
          </span>
          <div className="text-2xl font-black text-slate-900">
            {formatNumber(payments.filter((p) => p.status === 'PAID').length)}
          </div>
          <span className="text-xs text-slate-400">{t('student.payments.paid_in_current_session')}</span>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <Input
            placeholder={t('admin.payments.search_placeholder')}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 h-9 text-xs sm:text-sm"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          <span className="text-xs text-slate-500 font-medium">{t('common.status')}:</span>
          <Button
            size="sm"
            variant={statusFilter === 'ALL' ? 'default' : 'outline'}
            onClick={() => setStatusFilter('ALL')}
            className="text-xs rounded-full h-8"
          >
            {t('common.all')} ({formatNumber(payments.length)})
          </Button>
          <Button
            size="sm"
            variant={statusFilter === 'PAID' ? 'default' : 'outline'}
            onClick={() => setStatusFilter('PAID')}
            className="text-xs rounded-full h-8"
          >
            {t('status.paid')} ({formatNumber(payments.filter((p) => p.status === 'PAID').length)})
          </Button>
          <Button
            size="sm"
            variant={statusFilter === 'DUE' ? 'default' : 'outline'}
            onClick={() => setStatusFilter('DUE')}
            className="text-xs rounded-full h-8"
          >
            {t('status.due')} ({formatNumber(payments.filter((p) => p.status === 'DUE').length)})
          </Button>
          <Button
            size="sm"
            variant={statusFilter === 'PARTIAL' ? 'default' : 'outline'}
            onClick={() => setStatusFilter('PARTIAL')}
            className="text-xs rounded-full h-8"
          >
            {t('status.partial')} ({formatNumber(payments.filter((p) => p.status === 'PARTIAL').length)})
          </Button>
        </div>
      </div>

      {/* Main Table Card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        {isLoading ? (
          <div className="p-8 space-y-4">
            <div className="flex items-center justify-center gap-2 text-slate-500 text-sm">
              <Loader2 className="w-5 h-5 animate-spin text-emerald-600" />
              <span>{t('common.loading')}</span>
            </div>
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
        ) : isError ? (
          <div className="p-8 text-center space-y-3">
            <AlertCircle className="w-8 h-8 text-rose-500 mx-auto" />
            <h3 className="text-lg font-bold text-slate-800">{isEn ? 'Failed to load payments' : 'পেমেন্ট তালিকা লোড করা যায়নি'}</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              {(error as any)?.message || t('common.error_occurred')}
            </p>
            <Button variant="outline" size="sm" onClick={() => refetch()} className="gap-1.5">
              <RefreshCw className="w-3.5 h-3.5" />
              <span>{t('common.retry')}</span>
            </Button>
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <Receipt className="w-12 h-12 text-slate-300 mx-auto" />
            <h4 className="text-base font-bold text-slate-800">{t('admin.payments.empty_payments')}</h4>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              {isEn ? 'Click the button above to record a new fee or payment.' : 'নতুন ভাড়া বা ফি রেকর্ড করতে ওপরের বাটনে চাপুন।'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-50/80">
                  <TableHead className="font-semibold text-xs">{t('admin.payments.th_receipt_no')}</TableHead>
                  <TableHead className="font-semibold text-xs">{t('admin.payments.th_student')}</TableHead>
                  <TableHead className="font-semibold text-xs">{t('admin.payments.th_period')}</TableHead>
                  <TableHead className="font-semibold text-xs">{t('admin.payments.th_method')}</TableHead>
                  <TableHead className="font-semibold text-xs">{t('admin.payments.th_amount')}</TableHead>
                  <TableHead className="font-semibold text-xs">{t('admin.payments.th_paid')}</TableHead>
                  <TableHead className="font-semibold text-xs">{t('admin.payments.th_status')}</TableHead>
                  <TableHead className="font-semibold text-xs text-right">{t('common.actions')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((item) => (
                  <TableRow key={item.id} className="hover:bg-slate-50/50">
                    <TableCell className="font-mono text-xs font-bold text-slate-700">
                      {item.receiptNumber || 'N/A'}
                    </TableCell>
                    <TableCell>
                      <div className="space-y-0.5">
                        <span className="font-bold text-xs text-slate-900 block">
                          {item.student?.user?.name || t('student.payments.student_lbl')}
                        </span>
                        <span className="text-[11px] text-slate-500 font-mono">
                          {item.student?.studentCode} • {item.student?.department}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-xs font-semibold text-slate-800">
                      {item.billingPeriod}
                    </TableCell>
                    <TableCell className="text-xs">
                      <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-mono text-[11px]">
                        {item.paymentMethod}
                      </span>
                    </TableCell>
                    <TableCell className="font-mono text-xs font-semibold text-slate-800">
                      {formatCurrency(item.amount)}
                    </TableCell>
                    <TableCell className="font-mono text-xs font-extrabold text-emerald-700">
                      {formatCurrency(item.paidAmount)}
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={item.status} />
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 text-xs text-emerald-700 hover:text-emerald-800 hover:bg-emerald-50 gap-1"
                        onClick={() => setReceiptTarget(item)}
                      >
                        <Receipt className="w-3.5 h-3.5" />
                        <span>{t('student.payments.view_receipt')}</span>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>

      {/* Record Payment Dialog */}
      <Dialog open={addModalOpen} onOpenChange={setAddModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-base font-bold flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-emerald-600" />
              <span>{t('admin.payments.dialog_record_title')}</span>
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-500">
              {isEn ? 'Record student hostel rent or dues payment and generate official receipt.' : 'শিক্ষার্থীর মাসিক সিট ভাড়া বা বকেয়া ফি প্রাপ্তি নিশ্চিত করে রসিদ তৈরি করুন।'}
            </DialogDescription>
          </DialogHeader>

          {addError && (
            <Alert variant="destructive" className="bg-rose-50 border-rose-200 text-rose-800 text-xs">
              <AlertCircle className="w-4 h-4 text-rose-600" />
              <AlertDescription>{addError}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleAddSubmit} className="space-y-4 text-xs">
            {/* Student Dropdown */}
            <div className="space-y-1.5">
              <Label htmlFor="pay-student" className="text-xs font-semibold">
                {t('admin.allocations.select_student')} *
              </Label>
              <select
                id="pay-student"
                required
                value={newPayment.studentId}
                onChange={(e) => setNewPayment({ ...newPayment, studentId: e.target.value })}
                className="w-full h-9 rounded-md border border-slate-200 bg-white px-3 py-1 text-xs shadow-xs focus:outline-hidden"
              >
                <option value="">-- {t('admin.allocations.select_student')} --</option>
                {students.map((stu) => (
                  <option key={stu.id} value={stu.id}>
                    {stu.user?.name} ({stu.studentCode} • {stu.department})
                  </option>
                ))}
              </select>
            </div>

            {/* Billing Period */}
            <div className="space-y-1.5">
              <Label htmlFor="pay-period" className="text-xs font-semibold">
                {t('student.payments.billing_period_field')} *
              </Label>
              <Input
                id="pay-period"
                required
                placeholder={isEn ? 'e.g. November 2026' : 'যেমন: নভেম্বর ২০২৬'}
                value={newPayment.billingPeriod}
                onChange={(e) => setNewPayment({ ...newPayment, billingPeriod: e.target.value })}
                className="h-9 text-xs"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="pay-amount" className="text-xs font-semibold">
                  {t('admin.payments.th_amount')} (BDT) *
                </Label>
                <Input
                  id="pay-amount"
                  type="number"
                  min="0"
                  step="50"
                  required
                  placeholder="4500"
                  value={newPayment.amount}
                  onChange={(e) => setNewPayment({ ...newPayment, amount: e.target.value })}
                  className="h-9 text-xs font-mono"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="pay-paid" className="text-xs font-semibold">
                  {t('admin.payments.th_paid')} (BDT) *
                </Label>
                <Input
                  id="pay-paid"
                  type="number"
                  min="0"
                  step="50"
                  required
                  placeholder="4500"
                  value={newPayment.paidAmount}
                  onChange={(e) => setNewPayment({ ...newPayment, paidAmount: e.target.value })}
                  className="h-9 text-xs font-mono"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">{t('student.payments.select_method')} *</Label>
              <select
                value={newPayment.paymentMethod}
                onChange={(e) => setNewPayment({ ...newPayment, paymentMethod: e.target.value as any })}
                className="w-full h-9 rounded-md border border-slate-200 bg-white px-3 py-1 text-xs"
              >
                <option value="BKASH">{t('admin.payments.method_bkash')}</option>
                <option value="NAGAD">{t('admin.payments.method_nagad')}</option>
                <option value="CASH">{t('admin.payments.method_cash')}</option>
                <option value="BANK_TRANSFER">{t('admin.payments.method_bank')}</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="pay-ref" className="text-xs font-semibold">
                {t('student.payments.trx_id_field')}
              </Label>
              <Input
                id="pay-ref"
                placeholder="BK9X274LAQ"
                value={newPayment.transactionReference}
                onChange={(e) => setNewPayment({ ...newPayment, transactionReference: e.target.value })}
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
                disabled={addPaymentMutation.isPending}
                className="bg-emerald-600 hover:bg-emerald-700 text-white"
              >
                {addPaymentMutation.isPending ? (
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

      {/* Official Receipt Dialog */}
      {receiptTarget && (
        <Dialog open={!!receiptTarget} onOpenChange={() => setReceiptTarget(null)}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="text-base font-bold flex items-center justify-between border-b pb-2">
                <span>{t('student.payments.receipt_title')}</span>
                <span className="text-xs font-mono text-slate-400">{receiptTarget.receiptNumber}</span>
              </DialogTitle>
            </DialogHeader>

            <div className="p-4 bg-slate-50 rounded-xl space-y-3 text-xs">
              <div className="flex justify-between border-b pb-2">
                <span className="text-slate-500">{t('student.payments.student_lbl')}:</span>
                <span className="font-bold text-slate-900">{receiptTarget.student?.user?.name}</span>
              </div>
              <div className="flex justify-between border-b pb-2">
                <span className="text-slate-500">{t('admin.students.th_academic')}:</span>
                <span className="font-mono">{receiptTarget.student?.studentCode} ({receiptTarget.student?.department})</span>
              </div>
              <div className="flex justify-between border-b pb-2">
                <span className="text-slate-500">{t('admin.payments.th_period')}:</span>
                <span className="font-semibold">{receiptTarget.billingPeriod}</span>
              </div>
              <div className="flex justify-between border-b pb-2">
                <span className="text-slate-500">{t('admin.payments.th_method')}:</span>
                <span className="font-mono font-bold text-slate-800">{receiptTarget.paymentMethod}</span>
              </div>
              {receiptTarget.transactionReference && (
                <div className="flex justify-between border-b pb-2">
                  <span className="text-slate-500">{t('student.payments.trx_lbl')}</span>
                  <span className="font-mono text-emerald-700">{receiptTarget.transactionReference}</span>
                </div>
              )}
              <div className="flex justify-between border-b pb-2">
                <span className="text-slate-500">{t('student.payments.th_monthly_rent')}:</span>
                <span className="font-semibold text-slate-800">{formatCurrency(receiptTarget.amount)}</span>
              </div>
              <div className="flex justify-between pt-1 text-sm font-extrabold text-emerald-800">
                <span>{t('student.payments.total_collected')}</span>
                <span>{formatCurrency(receiptTarget.paidAmount)}</span>
              </div>
            </div>

            <DialogFooter className="gap-2 flex-col sm:flex-row">
              <Button variant="outline" size="sm" onClick={() => setReceiptTarget(null)}>
                {t('common.close')}
              </Button>
              <Button
                size="sm"
                onClick={() => window.print()}
                className="gap-1 bg-emerald-700 hover:bg-emerald-800 text-white"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>{t('student.payments.print_receipt')}</span>
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};
