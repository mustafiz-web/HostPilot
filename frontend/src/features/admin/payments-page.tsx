import React, { useState } from 'react';
import { CreditCard, Plus, Search, Receipt, Printer } from 'lucide-react';
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
import { INITIAL_MOCK_PAYMENTS, type MockPayment } from './mock-data/admin-mock-data';

export const PaymentsPage: React.FC = () => {
  const [payments, setPayments] = useState<MockPayment[]>(INITIAL_MOCK_PAYMENTS);
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'PAID' | 'DUE' | 'PARTIAL'>('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [receiptTarget, setReceiptTarget] = useState<MockPayment | null>(null);

  const [newPay, setNewPay] = useState({
    studentName: 'তানভীর আহমেদ',
    studentCode: 'HP-STU-2026-001',
    roomNumber: '১০১',
    billingPeriod: 'নভেম্বর ২০২৬',
    amount: 8000,
    paidAmount: 8000,
    paymentMethod: 'BKASH' as 'CASH' | 'BANK_TRANSFER' | 'BKASH',
  });

  const filtered = payments.filter((p) => {
    const matchesStatus = statusFilter === 'ALL' || p.status === statusFilter;
    const term = searchTerm.toLowerCase();
    const matchesSearch =
      p.studentName.toLowerCase().includes(term) ||
      p.receiptNumber.toLowerCase().includes(term);
    return matchesStatus && matchesSearch;
  });

  const handleRecordPayment = (e: React.FormEvent) => {
    e.preventDefault();
    const entry: MockPayment = {
      id: `pay-${Date.now()}`,
      receiptNumber: `RCP-2026-${Math.floor(1000 + Math.random() * 9000)}`,
      studentName: newPay.studentName,
      studentCode: newPay.studentCode,
      roomNumber: newPay.roomNumber,
      billingPeriod: newPay.billingPeriod,
      amount: Number(newPay.amount),
      paidAmount: Number(newPay.paidAmount),
      status: Number(newPay.paidAmount) >= Number(newPay.amount) ? 'PAID' : Number(newPay.paidAmount) > 0 ? 'PARTIAL' : 'DUE',
      paymentMethod: newPay.paymentMethod,
      paidAt: '১৮ নভেম্বর, ২০২৬',
    };
    setPayments([entry, ...payments]);
    setAddModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
            <CreditCard className="w-6 h-6 text-emerald-600" />
            <span>পেমেন্ট ও ভাড়া কালেকশন (Payments & Receipts)</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-500">
            মাসিক সিট ভাড়া আদায়, রসিদ তৈরি এবং বকেয়া ট্র্যাকিং
          </p>
        </div>
        <Button onClick={() => setAddModalOpen(true)} className="gap-2 shadow-xs self-start sm:self-auto">
          <Plus className="w-4 h-4" />
          <span>পেমেন্ট এন্ট্রি করুন</span>
        </Button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <Input
            placeholder="রশিদ নং বা শিক্ষার্থীর নাম..."
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
            variant={statusFilter === 'PARTIAL' ? 'default' : 'outline'}
            onClick={() => setStatusFilter('PARTIAL')}
            className="text-xs rounded-full h-8"
          >
            আংশিক ({payments.filter((p) => p.status === 'PARTIAL').length})
          </Button>
          <Button
            size="sm"
            variant={statusFilter === 'DUE' ? 'default' : 'outline'}
            onClick={() => setStatusFilter('DUE')}
            className="text-xs rounded-full h-8"
          >
            বকেয়া ({payments.filter((p) => p.status === 'DUE').length})
          </Button>
        </div>
      </div>

      {/* Payments Table */}
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>রশিদ নম্বর</TableHead>
            <TableHead>শিক্ষার্থী ও রুম</TableHead>
            <TableHead>বিলিং সেশন</TableHead>
            <TableHead>নির্ধারিত ভাড়া</TableHead>
            <TableHead>পরিশোধিত টাকা</TableHead>
            <TableHead>পেমেন্ট মাধ্যম</TableHead>
            <TableHead>স্ট্যাটাস</TableHead>
            <TableHead className="text-right">রসিদ</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filtered.map((item) => (
            <TableRow key={item.id}>
              <TableCell className="font-mono text-xs font-bold text-slate-700">
                {item.receiptNumber}
              </TableCell>
              <TableCell>
                <div className="font-bold text-slate-900 text-sm">{item.studentName}</div>
                <div className="text-xs text-slate-400">রুম {item.roomNumber} ({item.studentCode})</div>
              </TableCell>
              <TableCell className="text-xs text-slate-600">{item.billingPeriod}</TableCell>
              <TableCell className="text-xs font-bold text-slate-900">
                ৳ {item.amount.toLocaleString()}
              </TableCell>
              <TableCell className="text-xs font-extrabold text-emerald-700">
                ৳ {item.paidAmount.toLocaleString()}
              </TableCell>
              <TableCell>
                <span className="text-[11px] font-semibold px-2 py-0.5 rounded-md bg-slate-100 text-slate-700">
                  {item.paymentMethod}
                </span>
              </TableCell>
              <TableCell>
                <StatusBadge status={item.status} />
              </TableCell>
              <TableCell className="text-right">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setReceiptTarget(item)}
                  className="h-8 px-2.5 text-xs text-slate-700 gap-1 hover:text-emerald-700"
                >
                  <Receipt className="w-3.5 h-3.5 text-emerald-600" />
                  <span>রসিদ দেখুন</span>
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {/* Record Payment Modal */}
      <Dialog open={addModalOpen} onOpenChange={setAddModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>ম্যানুয়াল পেমেন্ট রেকর্ড</DialogTitle>
            <DialogDescription>
              শিক্ষার্থীর নিকট থেকে সংগৃহীত ভাড়ার বিবরণ এন্ট্রি করুন।
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleRecordPayment} className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label>শিক্ষার্থী নির্বাচন *</Label>
              <select
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-xs focus:ring-2 focus:ring-ring"
                value={newPay.studentName}
                onChange={(e) => setNewPay({ ...newPay, studentName: e.target.value })}
              >
                <option value="তানভীর আহমেদ">তানভীর আহমেদ (HP-STU-2026-001, রুম ১০১)</option>
                <option value="মাহমুদুল হাসান">মাহমুদুল হাসান (HP-STU-2026-002, রুম ১০২)</option>
                <option value="সাকিব আল হাসান">সাকিব আল হাসান (HP-STU-2026-003, রুম ২০১)</option>
                <option value="আব্দুল্লাহ আল নোমান">আব্দুল্লাহ আল নোমান (HP-STU-2026-004, রুম ২০১)</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="pay-period">বিলিং সেশন *</Label>
                <Input
                  id="pay-period"
                  value={newPay.billingPeriod}
                  onChange={(e) => setNewPay({ ...newPay, billingPeriod: e.target.value })}
                />
              </div>

              <div className="space-y-1.5">
                <Label>পেমেন্ট মাধ্যম *</Label>
                <select
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-xs focus:ring-2 focus:ring-ring"
                  value={newPay.paymentMethod}
                  onChange={(e) => setNewPay({ ...newPay, paymentMethod: e.target.value as any })}
                >
                  <option value="CASH">ক্যাশ (Cash)</option>
                  <option value="BKASH">বিকাশ (bKash)</option>
                  <option value="BANK_TRANSFER">ব্যাংক ট্রান্সফার</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="pay-amt">নির্ধারিত ভাড়া (BDT)</Label>
                <Input
                  id="pay-amt"
                  type="number"
                  value={newPay.amount}
                  onChange={(e) => setNewPay({ ...newPay, amount: Number(e.target.value) })}
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="pay-paid">প্রাপ্ত টাকা (BDT) *</Label>
                <Input
                  id="pay-paid"
                  type="number"
                  value={newPay.paidAmount}
                  onChange={(e) => setNewPay({ ...newPay, paidAmount: Number(e.target.value) })}
                />
              </div>
            </div>

            <DialogFooter className="gap-2 pt-2">
              <Button type="button" variant="outline" onClick={() => setAddModalOpen(false)}>
                বাতিল
              </Button>
              <Button type="submit">পেমেন্ট এন্ট্রি নিশ্চিত করুন</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Printable Receipt Modal Dialog */}
      {receiptTarget && (
        <Dialog open={!!receiptTarget} onOpenChange={(open) => !open && setReceiptTarget(null)}>
          <DialogContent className="max-w-md bg-white p-6">
            <div className="border border-slate-200 rounded-xl p-5 space-y-4">
              <div className="flex justify-between items-start border-b pb-3">
                <div>
                  <h3 className="font-extrabold text-base text-slate-900">Host Pilot Hostel</h3>
                  <p className="text-[11px] text-slate-500">হোস্টেল মানিরিসিট (Official Receipt)</p>
                </div>
                <div className="text-right">
                  <div className="font-mono text-xs font-bold text-slate-700">{receiptTarget.receiptNumber}</div>
                  <div className="text-[10px] text-slate-400">তারিখ: {receiptTarget.paidAt}</div>
                </div>
              </div>

              <div className="space-y-2 text-xs text-slate-700">
                <div className="flex justify-between">
                  <span className="text-slate-500">শিক্ষার্থীর নাম:</span>
                  <span className="font-bold text-slate-900">{receiptTarget.studentName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">শিক্ষার্থী আইডি:</span>
                  <span className="font-mono">{receiptTarget.studentCode}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">বরাদ্দকৃত রুম:</span>
                  <span className="font-bold">রুম {receiptTarget.roomNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">বিলিং সেশন:</span>
                  <span>{receiptTarget.billingPeriod}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">পেমেন্ট মেথড:</span>
                  <span className="font-semibold">{receiptTarget.paymentMethod}</span>
                </div>
              </div>

              <div className="border-t pt-3 flex justify-between items-center text-sm">
                <span className="font-bold text-slate-800">পরিশোধিত মোট অংক:</span>
                <span className="font-extrabold text-xl text-emerald-700">৳ {receiptTarget.paidAmount.toLocaleString()}</span>
              </div>

              <div className="pt-2 flex justify-between items-center text-xs">
                <span className="text-slate-500">পেমেন্ট স্ট্যাটাস:</span>
                <StatusBadge status={receiptTarget.status} />
              </div>
            </div>

            <DialogFooter className="gap-2 sm:justify-between items-center pt-2">
              <Button variant="outline" size="sm" onClick={() => setReceiptTarget(null)}>
                বন্ধ করুন
              </Button>
              <Button size="sm" className="gap-1.5" onClick={() => window.print()}>
                <Printer className="w-4 h-4" />
                <span>প্রিন্ট করুন</span>
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};
