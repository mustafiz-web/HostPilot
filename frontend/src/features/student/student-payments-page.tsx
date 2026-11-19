import React, { useState } from 'react';
import {
  CreditCard,
  Receipt,
  Printer,
  CheckCircle2,
  Plus,
  Building,
  Smartphone,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { StatusBadge } from '@/components/ui/status-badge';
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
import {
  CURRENT_STUDENT_PROFILE,
  CURRENT_STUDENT_ALLOCATION,
  INITIAL_STUDENT_INVOICES,
  type MockStudentInvoice,
} from './mock-data/student-mock-data';

export const StudentPaymentsPage: React.FC = () => {
  const [invoices, setInvoices] = useState<MockStudentInvoice[]>(INITIAL_STUDENT_INVOICES);
  const [receiptTarget, setReceiptTarget] = useState<MockStudentInvoice | null>(null);
  const [payModalOpen, setPayModalOpen] = useState(false);
  const [paySuccess, setPaySuccess] = useState(false);

  const [paymentForm, setPaymentForm] = useState({
    invoiceId: 'inv-due-12',
    method: 'BKASH' as 'BKASH' | 'NAGAD' | 'BANK_TRANSFER',
    senderPhone: '০১৭০০-১২৩৪৫৬',
    trxId: '',
  });

  const dueInvoice = invoices.find((inv) => inv.status === 'DUE');
  const totalPaid = invoices
    .filter((inv) => inv.status === 'PAID')
    .reduce((sum, inv) => sum + inv.paidAmount, 0);

  const handlePaySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPaySuccess(true);

    setTimeout(() => {
      setInvoices((prev) =>
        prev.map((inv) =>
          inv.id === paymentForm.invoiceId
            ? {
                ...inv,
                status: 'PAID',
                paidAmount: inv.amount,
                paidAt: '১৮ নভেম্বর, ২০২৬',
                paymentMethod: paymentForm.method,
                trxId: paymentForm.trxId || `TX-${Date.now().toString().slice(-6)}`,
                receiptNumber: `RCP-2026-${Math.floor(1000 + Math.random() * 9000)}`,
              }
            : inv
        )
      );
      setPaySuccess(false);
      setPayModalOpen(false);
    }, 1800);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
            <CreditCard className="w-6 h-6 text-emerald-600" />
            <span>আমার পেমেন্ট ও রসিদ (My Payments & Receipts)</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-500">
            মাসিক সিট ভাড়ার পরিশোধ তালিকা, ডিজিটাল রসিদ এবং নতুন ফি প্রদান
          </p>
        </div>
        {dueInvoice && (
          <Button
            onClick={() => setPayModalOpen(true)}
            className="gap-2 shadow-xs self-start sm:self-auto bg-emerald-600 hover:bg-emerald-700 text-white"
          >
            <Plus className="w-4 h-4" />
            <span>বকেয়া ভাড়া পরিশোধ করুন</span>
          </Button>
        )}
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-2">
          <span className="text-xs font-bold uppercase text-slate-400">সর্বমোট পরিশোধিত</span>
          <div className="text-2xl font-black text-emerald-700">
            ৳ {totalPaid.toLocaleString()}
          </div>
          <p className="text-xs text-slate-500">চলতি সেশনে পরিশোধকৃত ভাড়া</p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-2">
          <span className="text-xs font-bold uppercase text-slate-400">বর্তমান বকেয়া ফি</span>
          <div className="text-2xl font-black text-amber-600">
            ৳ {dueInvoice ? dueInvoice.amount.toLocaleString() : '০'}
          </div>
          <p className="text-xs text-slate-500">
            {dueInvoice ? dueInvoice.billingPeriod : 'কোনো বকেয়া নেই'}
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-2">
          <span className="text-xs font-bold uppercase text-slate-400">মাসিক নির্ধারিত ভাড়া</span>
          <div className="text-2xl font-black text-slate-900">
            ৳ {CURRENT_STUDENT_ALLOCATION.monthlyRent.toLocaleString()}
          </div>
          <p className="text-xs text-slate-500">রুম ১০১ (বেড A) • প্রতি মাসের ৭ তারিখের মধ্যে প্রদেয়</p>
        </div>
      </div>

      {/* Invoices & Receipts Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Receipt className="w-5 h-5 text-emerald-600" />
            <h3 className="font-bold text-base text-slate-900">ভাড়া পরিশোধের ইতিহাস</h3>
          </div>
          <span className="text-xs text-slate-500">সর্বমোট {invoices.length} টি রেকর্ড</span>
        </div>

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
            {invoices.map((inv) => (
              <TableRow key={inv.id}>
                <TableCell className="font-mono text-xs font-bold text-slate-700">
                  {inv.receiptNumber}
                </TableCell>
                <TableCell className="font-bold text-slate-900 text-xs">
                  {inv.billingPeriod}
                </TableCell>
                <TableCell className="text-xs font-semibold text-slate-800">
                  ৳ {inv.amount.toLocaleString()}
                </TableCell>
                <TableCell className="text-xs font-extrabold text-emerald-700">
                  ৳ {inv.paidAmount.toLocaleString()}
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
                  {inv.paidAt || 'অপেক্ষমান'}
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
                      onClick={() => setPayModalOpen(true)}
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
                  <h4 className="font-bold text-sm text-slate-900">{CURRENT_STUDENT_PROFILE.name}</h4>
                  <p className="text-slate-500 font-mono">আইডি: {CURRENT_STUDENT_PROFILE.studentCode} • রোল: {CURRENT_STUDENT_PROFILE.rollNumber}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-slate-800">রুম {CURRENT_STUDENT_ALLOCATION.roomNumber} (বেড {CURRENT_STUDENT_ALLOCATION.bedCode})</p>
                  <p className="text-slate-400">{CURRENT_STUDENT_ALLOCATION.blockName}</p>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-500">বিলিং সময়কাল:</span>
                  <span className="font-bold text-slate-800">{receiptTarget.billingPeriod}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-500">পরিশোধের তারিখ:</span>
                  <span className="font-mono text-slate-800">{receiptTarget.paidAt}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-500">পেমেন্ট মেথড:</span>
                  <span className="font-mono font-bold text-slate-800">{receiptTarget.paymentMethod}</span>
                </div>
                {receiptTarget.trxId && (
                  <div className="flex justify-between py-1 border-b border-slate-100">
                    <span className="text-slate-500">ট্রানজেকশন আইডি (TrxID):</span>
                    <span className="font-mono font-bold text-emerald-800">{receiptTarget.trxId}</span>
                  </div>
                )}
                <div className="flex justify-between py-2 text-sm font-extrabold text-slate-900 bg-emerald-50/60 px-3 rounded-lg border border-emerald-100">
                  <span>সর্বমোট আদায়কৃত টাকা:</span>
                  <span className="text-emerald-700">৳ {receiptTarget.paidAmount.toLocaleString()}</span>
                </div>
              </div>

              <div className="p-2.5 bg-emerald-100/60 text-emerald-900 rounded-lg text-center font-bold text-xs">
                ✓ পেমেন্ট অনুমোদিত ও সংগৃহীত (PAID & VERIFIED)
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
            <DialogTitle>অনলাইন ফি পরিশোধ (Pay Due Rent)</DialogTitle>
            <DialogDescription>
              বিকাশ, নগদ বা ব্যাংক ট্রান্সফারের মাধ্যমে সিট ভাড়া পরিশোধ নিশ্চিত করুন।
            </DialogDescription>
          </DialogHeader>

          {paySuccess ? (
            <div className="p-6 bg-emerald-50 rounded-xl text-center space-y-2 border border-emerald-200">
              <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto" />
              <h4 className="font-bold text-emerald-900">পেমেন্ট সফলভাবে জমা হয়েছে!</h4>
              <p className="text-xs text-emerald-700">
                আপনার রসিদ তৈরি হয়েছে এবং স্ট্যাটাস "পরিশোধিত" হিসেবে আপডেট হয়েছে।
              </p>
            </div>
          ) : (
            <form onSubmit={handlePaySubmit} className="space-y-4">
              <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-xs space-y-1">
                <div className="flex justify-between">
                  <span className="text-emerald-800">পরিশোধের খাত:</span>
                  <span className="font-bold text-emerald-900">{dueInvoice?.billingPeriod}</span>
                </div>
                <div className="flex justify-between text-sm font-extrabold text-emerald-900 pt-1 border-t border-emerald-200">
                  <span>মোট প্রদেয়:</span>
                  <span>৳ {dueInvoice?.amount.toLocaleString()}</span>
                </div>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">পেমেন্ট মেথড নির্বাচন করুন</Label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setPaymentForm({ ...paymentForm, method: 'BKASH' })}
                    className={`p-2.5 rounded-lg border text-xs font-bold flex flex-col items-center gap-1 transition-all ${
                      paymentForm.method === 'BKASH'
                        ? 'border-emerald-600 bg-emerald-50 text-emerald-800'
                        : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <Smartphone className="w-4 h-4 text-pink-600" />
                    <span>bKash</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaymentForm({ ...paymentForm, method: 'NAGAD' })}
                    className={`p-2.5 rounded-lg border text-xs font-bold flex flex-col items-center gap-1 transition-all ${
                      paymentForm.method === 'NAGAD'
                        ? 'border-emerald-600 bg-emerald-50 text-emerald-800'
                        : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <Smartphone className="w-4 h-4 text-orange-600" />
                    <span>Nagad</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaymentForm({ ...paymentForm, method: 'BANK_TRANSFER' })}
                    className={`p-2.5 rounded-lg border text-xs font-bold flex flex-col items-center gap-1 transition-all ${
                      paymentForm.method === 'BANK_TRANSFER'
                        ? 'border-emerald-600 bg-emerald-50 text-emerald-800'
                        : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <Building className="w-4 h-4 text-blue-600" />
                    <span>Bank Transfer</span>
                  </button>
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="senderPhone" className="text-xs font-semibold">
                  প্রেরকের মোবাইল নম্বর
                </Label>
                <Input
                  id="senderPhone"
                  value={paymentForm.senderPhone}
                  onChange={(e) => setPaymentForm({ ...paymentForm, senderPhone: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="trxId" className="text-xs font-semibold">
                  ট্রানজেকশন আইডি (TrxID)
                </Label>
                <Input
                  id="trxId"
                  placeholder="যেমন: BK9X274LAQ"
                  value={paymentForm.trxId}
                  onChange={(e) => setPaymentForm({ ...paymentForm, trxId: e.target.value })}
                  required
                />
              </div>

              <DialogFooter className="gap-2 sm:gap-0 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setPayModalOpen(false)}
                >
                  বাতিল
                </Button>
                <Button type="submit">পেমেন্ট নিশ্চিত করুন</Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};
