import React, { useState } from 'react';
import { BarChart3, Printer, Bed, CreditCard } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@/components/ui/table';

export const ReportsPage: React.FC = () => {
  const [reportType, setReportType] = useState<'OCCUPANCY' | 'FINANCE'>('OCCUPANCY');

  const occupancyRows = [
    { floor: '১ম তলা', rooms: '১৮ টি', beds: '৫২ টি', occupied: '৪৬ টি', available: '৬ টি', rate: '৮৮.৫%' },
    { floor: '২য় তলা', rooms: '২০ টি', beds: '৯৮ টি', occupied: '৭৮ টি', available: '২০ টি', rate: '৭৯.৬%' },
    { floor: 'সর্বমোট', rooms: '৩৮ টি', beds: '১৫০ টি', occupied: '১২৪ টি', available: '২৬ টি', rate: '৮২.৬%' },
  ];

  const financialSummary = [
    { item: 'শিক্ষার্থী মাসিক সিট ভাড়া কালেকশন', type: 'আয় (Income)', amount: 485000 },
    { item: 'নতুন ভর্তি আবেদন ও রেজিস্ট্রেশন ফি', type: 'আয় (Income)', amount: 35000 },
    { item: 'ডাইনিং মিল ও খাদ্য ক্রয় ব্যয়', type: 'ব্যয় (Expense)', amount: -78000 },
    { item: 'বিদ্যুৎ, গ্যাস ও পানির ইউটিলিটি বিল', type: 'ব্যয় (Expense)', amount: -42500 },
    { item: 'হোস্টেল চত্বর ও প্লাম্বিং রক্ষণাবেক্ষণ', type: 'ব্যয় (Expense)', amount: -6800 },
    { item: 'ফাইবার অপটিক ইন্টারনেট ও ওয়াইফাই', type: 'ব্যয় (Expense)', amount: -12000 },
  ];

  const totalIncome = 520000;
  const totalExpense = 139300;
  const netBalance = totalIncome - totalExpense;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-emerald-600" />
            <span>হোস্টেল রিপোর্ট ও অ্যানালিটিক্স (Reports)</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-500">
            সিট অকুপেন্সি ও মাসিক আয়-ব্যয়ের অনুমোদিত পরিসংখ্যান ও প্রিন্ট-রেডি প্রতিবেদন
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => window.print()} className="gap-1.5 shadow-xs">
            <Printer className="w-4 h-4 text-slate-600" />
            <span>প্রিন্ট রিপোর্ট</span>
          </Button>
        </div>
      </div>

      {/* Report Selector Tabs */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant={reportType === 'OCCUPANCY' ? 'default' : 'outline'}
            onClick={() => setReportType('OCCUPANCY')}
            className="text-xs"
          >
            <Bed className="w-3.5 h-3.5 mr-1" />
            <span>সিট অকুপেন্সি রিপোর্ট</span>
          </Button>
          <Button
            size="sm"
            variant={reportType === 'FINANCE' ? 'default' : 'outline'}
            onClick={() => setReportType('FINANCE')}
            className="text-xs"
          >
            <CreditCard className="w-3.5 h-3.5 mr-1" />
            <span>আর্থিক আয়-ব্যয় রিপোর্ট</span>
          </Button>
        </div>

        <div className="text-xs text-slate-500 font-medium">
          সেশন: <strong>নভেম্বর ২০২৬</strong> (Host Pilot Single Hostel)
        </div>
      </div>

      {/* Render Selected Report */}
      {reportType === 'OCCUPANCY' ? (
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
            <div className="border-b pb-3">
              <h3 className="font-bold text-base text-slate-900">ফ্লোরভিত্তিক সিট ও বেড অকুপেন্সি বিশ্লেষণ</h3>
              <p className="text-xs text-slate-500">প্রতিটি ফ্লোরে খালি ও পূর্ণ বেডের সঠিক হিসাব</p>
            </div>

            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ফ্লোর</TableHead>
                  <TableHead>মোট রুম</TableHead>
                  <TableHead>মোট বেড</TableHead>
                  <TableHead>বরাদ্দকৃত বেড</TableHead>
                  <TableHead>খালি বেড</TableHead>
                  <TableHead className="text-right">অকুপেন্সি হার</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {occupancyRows.map((row, i) => (
                  <TableRow key={i} className={i === occupancyRows.length - 1 ? 'font-bold bg-slate-50' : ''}>
                    <TableCell className="font-bold text-slate-800">{row.floor}</TableCell>
                    <TableCell>{row.rooms}</TableCell>
                    <TableCell>{row.beds}</TableCell>
                    <TableCell className="text-slate-900 font-semibold">{row.occupied}</TableCell>
                    <TableCell className="text-emerald-700 font-semibold">{row.available}</TableCell>
                    <TableCell className="text-right text-emerald-800 font-bold">{row.rate}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
              <span className="text-xs text-slate-500 uppercase font-semibold">মোট আয় (Income)</span>
              <div className="text-2xl font-extrabold text-emerald-700 mt-1">
                ৳ {totalIncome.toLocaleString()}
              </div>
            </div>
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
              <span className="text-xs text-slate-500 uppercase font-semibold">মোট ব্যয় (Expenses)</span>
              <div className="text-2xl font-extrabold text-rose-700 mt-1">
                ৳ {totalExpense.toLocaleString()}
              </div>
            </div>
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
              <span className="text-xs text-slate-500 uppercase font-semibold">নিট ব্যালান্স (Net Surplus)</span>
              <div className="text-2xl font-extrabold text-slate-900 mt-1">
                ৳ {netBalance.toLocaleString()}
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
            <div className="border-b pb-3">
              <h3 className="font-bold text-base text-slate-900">নভেম্বর ২০২৬ আয়-ব্যয় বিবরণী</h3>
            </div>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>খাত ও বিবরণ</TableHead>
                  <TableHead>ধরণ</TableHead>
                  <TableHead className="text-right">টাকার পরিমাণ (BDT)</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {financialSummary.map((item, i) => (
                  <TableRow key={i}>
                    <TableCell className="font-medium text-slate-800 text-sm">{item.item}</TableCell>
                    <TableCell>
                      <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${
                        item.amount > 0 ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                      }`}>
                        {item.type}
                      </span>
                    </TableCell>
                    <TableCell className={`text-right font-extrabold text-sm ${
                      item.amount > 0 ? 'text-emerald-700' : 'text-rose-700'
                    }`}>
                      {item.amount > 0 ? `+ ৳ ${item.amount.toLocaleString()}` : `- ৳ ${Math.abs(item.amount).toLocaleString()}`}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      )}
    </div>
  );
};
