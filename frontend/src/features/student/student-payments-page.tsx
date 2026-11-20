import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  CreditCard,
  Receipt,
  Printer,
  Plus,
  Building,
  Smartphone,
  Loader2,
  AlertCircle,
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

interface RealPayment {
  id: string;
  studentId: string;
  billingPeriod: string;
  amount: number | string;
  paidAmount: number | string;
  status: 'PAID' | 'PARTIAL' | 'DUE';
  paymentMethod: 'CASH' | 'BANK_TRANSFER' | 'BKASH' | 'NAGAD';
  receiptNumber: string;
  transactionReference?: string | null;
  paidAt?: string | null;
  createdAt: string;
  student?: {
    id: string;
    studentCode: string;
    rollNumber: string;
    department: string;
    user: {
      name: string;
      email: string;
    };
  };
}

interface StudentDashboardData {
  profile: {
    id: string;
    name: string;
    email: string;
    studentCode: string;
    phone: string;
    department: string;
    rollNumber: string;
    session: string;
    batch: string;
    status: string;
  };
  allocation: {
    id: string;
    roomNumber: string;
    floor: number;
    roomType: string;
    bedCode: string;
    monthlyRent: number;
    startDate: string;
  } | null;
}

export const StudentPaymentsPage: React.FC = () => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();

  const [receiptTarget, setReceiptTarget] = useState<RealPayment | null>(null);
  const [payModalOpen, setPayModalOpen] = useState(false);
  const [payError, setPayError] = useState<string | null>(null);

  const [paymentForm, setPaymentForm] = useState({
    billingPeriod: new Date().toLocaleString('en-US', { month: 'long', year: 'numeric' }),
    amount: '',
    paymentMethod: 'BKASH' as 'CASH' | 'BANK_TRANSFER' | 'BKASH' | 'NAGAD',
    senderPhone: '',
    transactionReference: '',
  });

  // 1. Fetch payments for current student from real database
  const {
    data: paymentsResponse,
    isLoading: isLoadingPayments,
    isError: isErrorPayments,
    refetch: refetchPayments,
  } = useQuery({
    queryKey: ['student-payments'],
    queryFn: async () => {
      return apiClient.get<RealPayment[]>('/payments/me');
    },
  });

  // 2. Fetch student dashboard for room & allocation details
  const { data: dashboardResponse } = useQuery({
    queryKey: ['student-dashboard'],
    queryFn: async () => {
      return apiClient.get<StudentDashboardData>('/students/me/dashboard');
    },
  });

  const payments: RealPayment[] = paymentsResponse?.data || [];
  const dashboard: StudentDashboardData | undefined = dashboardResponse?.data;
  const allocation = dashboard?.allocation;
  const profile = dashboard?.profile;

  // Calculate live financial statistics
  const totalPaid = payments
    .filter((p) => p.status === 'PAID' || p.status === 'PARTIAL')
    .reduce((sum, p) => sum + Number(p.paidAmount || 0), 0);

  const duePayment = payments.find((p) => p.status === 'DUE' || p.status === 'PARTIAL');
  const dueAmount = duePayment
    ? Number(duePayment.amount) - Number(duePayment.paidAmount || 0)
    : 0;

  // Pay fee mutation
  const payFeeMutation = useMutation({
    mutationFn: async (payload: {
      billingPeriod: string;
      amount: number;
      paidAmount: number;
      paymentMethod: string;
      transactionReference?: string;
    }) => {
      const res = await apiClient.post('/payments', payload);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['student-payments'] });
      queryClient.invalidateQueries({ queryKey: ['student-dashboard'] });
      setPayModalOpen(false);
      setPayError(null);
      setPaymentForm({
        billingPeriod: new Date().toLocaleString('en-US', { month: 'long', year: 'numeric' }),
        amount: '',
        paymentMethod: 'BKASH',
        senderPhone: '',
        transactionReference: '',
      });
    },
    onError: (err: any) => {
      const msg =
        err?.response?.data?.error?.message ||
        err?.response?.data?.message ||
        'পেমেন্ট সম্পন্ন করা সম্ভব হয়নি। অনুগ্রহ করে পুনরায় চেষ্টা করুন।';
      setPayError(msg);
    },
  });

  const handlePaySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPayError(null);
    const amountNum = Number(paymentForm.amount || allocation?.monthlyRent || 0);
    if (!amountNum || amountNum <= 0) {
      setPayError('অনুগ্রহ করে সঠিক টাকার পরিমাণ উল্লেখ করুন');
      return;
    }

    payFeeMutation.mutate({
      billingPeriod: paymentForm.billingPeriod.trim(),
      amount: amountNum,
      paidAmount: amountNum,
      paymentMethod: paymentForm.paymentMethod,
      transactionReference: paymentForm.transactionReference.trim() || undefined,
    });
  };

  const openPayModalWithPeriod = (period?: string, defaultAmt?: number) => {
    setPaymentForm({
      billingPeriod: period || new Date().toLocaleString('en-US', { month: 'long', year: 'numeric' }),
      amount: defaultAmt ? String(defaultAmt) : allocation?.monthlyRent ? String(allocation.monthlyRent) : '',
      paymentMethod: 'BKASH',
      senderPhone: profile?.phone || '',
      transactionReference: '',
    });
    setPayError(null);
    setPayModalOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
            <CreditCard className="w-6 h-6 text-emerald-600" />
            <span>{t('student.payments.title')}</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-500">
            {t('student.payments.subtitle')}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetchPayments()}
            className="gap-1.5 text-xs text-slate-700"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>রিফ্রেশ</span>
          </Button>
          <Button
            onClick={() => openPayModalWithPeriod()}
            className="gap-2 shadow-xs self-start sm:self-auto bg-emerald-600 hover:bg-emerald-700 text-white"
          >
            <Plus className="w-4 h-4" />
            <span>অনলাইন ফি পরিশোধ</span>
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-2">
          <span className="text-xs font-bold uppercase text-slate-400">সর্বমোট পরিশোধিত</span>
          <div className="text-2xl font-black text-emerald-700">
            ৳ {totalPaid.toLocaleString()}
          </div>
          <p className="text-xs text-slate-500">চলতি সেশনে পরিশোধকৃত ফি</p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-2">
          <span className="text-xs font-bold uppercase text-slate-400">বর্তমান বকেয়া ফি</span>
          <div className={`text-2xl font-black ${dueAmount > 0 ? 'text-amber-600' : 'text-slate-700'}`}>
            ৳ {dueAmount.toLocaleString()}
          </div>
          <p className="text-xs text-slate-500">
            {duePayment ? `${duePayment.billingPeriod} এর বকেয়া` : 'কোনো বকেয়া নেই'}
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-2">
          <span className="text-xs font-bold uppercase text-slate-400">মাসিক নির্ধারিত ভাড়া</span>
          <div className="text-2xl font-black text-slate-900">
            ৳ {allocation?.monthlyRent ? Number(allocation.monthlyRent).toLocaleString() : '০'}
          </div>
          <p className="text-xs text-slate-500">
            {allocation
              ? `রুম ${allocation.roomNumber} (বেড ${allocation.bedCode}) • প্রতি মাসের ১০ তারিখের মধ্যে প্রদেয়`
              : 'সিট বরাদ্দ সক্রিয় নেই'}
          </p>
        </div>
      </div>

      {/* Invoices & Receipts Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Receipt className="w-5 h-5 text-emerald-600" />
            <h3 className="font-bold text-base text-slate-900">ভাড়া পরিশোধের ইতিহাস</h3>
          </div>
          <span className="text-xs text-slate-500">সর্বমোট {payments.length} টি রেকর্ড</span>
        </div>

        {isLoadingPayments ? (
          <div className="p-6 space-y-3">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-10 w-full rounded-md" />
            ))}
          </div>
        ) : isErrorPayments ? (
          <div className="p-8 text-center space-y-3">
            <AlertCircle className="w-10 h-10 text-red-500 mx-auto" />
            <p className="text-sm font-semibold text-slate-700">পেমেন্ট হিস্ট্রি লোড করতে সমস্যা হয়েছে</p>
            <Button variant="outline" size="sm" onClick={() => refetchPayments()}>
              আবার চেষ্টা করুন
            </Button>
          </div>
        ) : payments.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <Receipt className="w-12 h-12 text-slate-300 mx-auto" />
            <p className="text-sm font-semibold text-slate-700">এখনও কোনো পেমেন্ট রেকর্ড নেই</p>
            <p className="text-xs text-slate-400">আপনার পরিশোধিত বা বকেয়া ফি এখানে প্রদর্শিত হবে।</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>রশিদ / ইনভয়েস নং</TableHead>
                  <TableHead>বিলিং সময়কাল</TableHead>
                  <TableHead>নির্ধারিত ভাড়া</TableHead>
                  <TableHead>পরিশোধিত টাকা</TableHead>
                  <TableHead>পেমেন্ট মাধ্যম</TableHead>
                  <TableHead>পরিশোধের তারিখ</TableHead>
                  <TableHead>স্ট্যাটাস</TableHead>
                  <TableHead className="text-right">অ্যাকশন</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {payments.map((inv) => (
                  <TableRow key={inv.id}>
                    <TableCell className="font-mono text-xs font-bold text-slate-700">
                      {inv.receiptNumber || 'N/A'}
                    </TableCell>
                    <TableCell className="font-bold text-slate-900 text-xs">
                      {inv.billingPeriod}
                    </TableCell>
                    <TableCell className="text-xs font-semibold text-slate-800">
                      ৳ {Number(inv.amount).toLocaleString()}
                    </TableCell>
                    <TableCell className="text-xs font-extrabold text-emerald-700">
                      ৳ {Number(inv.paidAmount).toLocaleString()}
                    </TableCell>
                    <TableCell className="text-xs">
                      {inv.paymentMethod ? (
                        <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-mono text-[11px]">
                          {inv.paymentMethod}
                        </span>
                      ) : (
                        <span className="text-slate-400">—</span>
                      )}
                    </TableCell>
                    <TableCell className="text-xs text-slate-500">
                      {inv.paidAt
                        ? new Date(inv.paidAt).toLocaleDateString('bn-BD', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                          })
                        : 'অপেক্ষমান'}
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={inv.status} />
                    </TableCell>
                    <TableCell className="text-right">
                      {inv.status === 'PAID' ? (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setReceiptTarget(inv)}
                          className="h-8 px-2.5 text-xs text-slate-700 gap-1 hover:text-emerald-700"
                        >
                          <Receipt className="w-3.5 h-3.5 text-emerald-600" />
                          <span>রসিদ দেখুন</span>
                        </Button>
                      ) : (
                        <Button
                          size="sm"
                          onClick={() =>
                            openPayModalWithPeriod(
                              inv.billingPeriod,
                              Number(inv.amount) - Number(inv.paidAmount)
                            )
                          }
                          className="h-8 px-2.5 text-xs bg-emerald-600 hover:bg-emerald-700 text-white gap-1"
                        >
                          <span>এখন পে করুন</span>
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>

      {/* Official Receipt Dialog */}
      {receiptTarget && (
        <Dialog open={!!receiptTarget} onOpenChange={(open) => !open && setReceiptTarget(null)}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle className="flex items-center justify-between border-b pb-3">
                <span className="text-emerald-700 font-bold">হোস্টেল ফি আদায় রসিদ (Official Receipt)</span>
                <span className="text-xs font-mono text-slate-400">{receiptTarget.receiptNumber}</span>
              </DialogTitle>
              <DialogDescription>
                Host Pilot অনুমোদিত ডিজিটাল পেমেন্ট স্বীকৃতি
              </DialogDescription>
            </DialogHeader>

            <div className="p-4 bg-slate-50/60 rounded-xl border border-slate-200/80 space-y-4 text-xs">
              <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                <div>
                  <h4 className="font-bold text-sm text-slate-900">{profile?.name || receiptTarget.student?.user?.name || 'শিক্ষার্থী'}</h4>
                  <p className="text-slate-500 font-mono">আইডি: {profile?.studentCode || receiptTarget.student?.studentCode || 'N/A'} • ডিপার্টমেন্ট: {profile?.department || receiptTarget.student?.department || 'N/A'}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-slate-800">
                    {allocation ? `রুম ${allocation.roomNumber} (বেড ${allocation.bedCode})` : 'হোস্টেল সীট'}
                  </p>
                  <p className="text-slate-400">Host Pilot Residence</p>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-500">বিলিং সময়কাল:</span>
                  <span className="font-bold text-slate-800">{receiptTarget.billingPeriod}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-500">পরিশোধের তারিখ:</span>
                  <span className="font-mono text-slate-800">
                    {receiptTarget.paidAt ? new Date(receiptTarget.paidAt).toLocaleString() : 'N/A'}
                  </span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-500">পেমেন্ট মেথড:</span>
                  <span className="font-mono font-bold text-slate-800">{receiptTarget.paymentMethod}</span>
                </div>
                {receiptTarget.transactionReference && (
                  <div className="flex justify-between py-1 border-b border-slate-100">
                    <span className="text-slate-500">ট্রানজেকশন আইডি (TrxID):</span>
                    <span className="font-mono font-bold text-emerald-800">{receiptTarget.transactionReference}</span>
                  </div>
                )}
                <div className="flex justify-between py-2 text-sm font-extrabold text-slate-900 bg-emerald-50/60 px-3 rounded-lg border border-emerald-100">
                  <span>সর্বমোট আদায়কৃত টাকা:</span>
                  <span className="text-emerald-700">৳ {Number(receiptTarget.paidAmount).toLocaleString()}</span>
                </div>
              </div>

              <div className="p-2.5 bg-emerald-100/60 text-emerald-900 rounded-lg text-center font-bold text-xs">
                ✓ পেমেন্ট অনুমোদিত ও ডাটাবেজে সংরক্ষিত (PAID & VERIFIED)
              </div>
            </div>

            <DialogFooter className="flex items-center justify-between pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setReceiptTarget(null)}
              >
                বন্ধ করুন
              </Button>
              <Button
                size="sm"
                onClick={() => window.print()}
                className="gap-1.5 bg-emerald-700 hover:bg-emerald-800"
              >
                <Printer className="w-4 h-4" />
                <span>রসিদ প্রিন্ট করুন</span>
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Pay Now Modal */}
      <Dialog open={payModalOpen} onOpenChange={setPayModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>অনলাইন ফি পরিশোধ (Pay Hostel Rent)</DialogTitle>
            <DialogDescription>
              বিকাশ, নগদ বা ব্যাংক ট্রান্সফারের মাধ্যমে সিট ভাড়া পরিশোধ নিশ্চিত করুন।
            </DialogDescription>
          </DialogHeader>

          {payError && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{payError}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={handlePaySubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="billingPeriod" className="text-xs font-semibold">
                বিলিং সময়কাল (মাস/বছর)
              </Label>
              <Input
                id="billingPeriod"
                value={paymentForm.billingPeriod}
                onChange={(e) => setPaymentForm({ ...paymentForm, billingPeriod: e.target.value })}
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="amount" className="text-xs font-semibold">
                পরিশোধের পরিমাণ (টাকা)
              </Label>
              <Input
                id="amount"
                type="number"
                placeholder={allocation?.monthlyRent ? String(allocation.monthlyRent) : '3500'}
                value={paymentForm.amount}
                onChange={(e) => setPaymentForm({ ...paymentForm, amount: e.target.value })}
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">পেমেন্ট মেথড নির্বাচন করুন</Label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setPaymentForm({ ...paymentForm, paymentMethod: 'BKASH' })}
                  className={`p-2.5 rounded-lg border text-xs font-bold flex flex-col items-center gap-1 transition-all ${
                    paymentForm.paymentMethod === 'BKASH'
                      ? 'border-emerald-600 bg-emerald-50 text-emerald-800'
                      : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <Smartphone className="w-4 h-4 text-pink-600" />
                  <span>bKash</span>
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentForm({ ...paymentForm, paymentMethod: 'NAGAD' })}
                  className={`p-2.5 rounded-lg border text-xs font-bold flex flex-col items-center gap-1 transition-all ${
                    paymentForm.paymentMethod === 'NAGAD'
                      ? 'border-emerald-600 bg-emerald-50 text-emerald-800'
                      : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <Smartphone className="w-4 h-4 text-orange-600" />
                  <span>Nagad</span>
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentForm({ ...paymentForm, paymentMethod: 'BANK_TRANSFER' })}
                  className={`p-2.5 rounded-lg border text-xs font-bold flex flex-col items-center gap-1 transition-all ${
                    paymentForm.paymentMethod === 'BANK_TRANSFER'
                      ? 'border-emerald-600 bg-emerald-50 text-emerald-800'
                      : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <Building className="w-4 h-4 text-blue-600" />
                  <span>Bank</span>
                </button>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="senderPhone" className="text-xs font-semibold">
                প্রেরকের মোবাইল নম্বর
              </Label>
              <Input
                id="senderPhone"
                placeholder="০১৭১১-XXXXXX"
                value={paymentForm.senderPhone}
                onChange={(e) => setPaymentForm({ ...paymentForm, senderPhone: e.target.value })}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="trxId" className="text-xs font-semibold">
                ট্রানজেকশন আইডি (TrxID)
              </Label>
              <Input
                id="trxId"
                placeholder="যেমন: BK9X274LAQ"
                value={paymentForm.transactionReference}
                onChange={(e) => setPaymentForm({ ...paymentForm, transactionReference: e.target.value })}
                required
              />
            </div>

            <DialogFooter className="gap-2 pt-2 flex-col sm:flex-row">
              <Button
                type="button"
                variant="outline"
                disabled={payFeeMutation.isPending}
                onClick={() => setPayModalOpen(false)}
              >
                বাতিল
              </Button>
              <Button type="submit" disabled={payFeeMutation.isPending}>
                {payFeeMutation.isPending ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>প্রক্রিয়াধীন...</span>
                  </span>
                ) : (
                  'পেমেন্ট নিশ্চিত করুন'
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};
