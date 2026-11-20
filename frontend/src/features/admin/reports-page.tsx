import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  BarChart3,
  Printer,
  Bed,
  CreditCard,
  Loader2,
  AlertCircle,
  Building,
  TrendingUp,
  TrendingDown,
  Scale,
  RefreshCw,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
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
import { apiClient } from '@/lib/api-client';

interface BedItem {
  id: string;
  status: 'AVAILABLE' | 'OCCUPIED' | 'MAINTENANCE';
}

interface RoomItem {
  id: string;
  roomNumber: string;
  floor: number;
  capacity: number;
  status: 'AVAILABLE' | 'PARTIALLY_OCCUPIED' | 'FULL' | 'MAINTENANCE';
  occupiedBedsCount: number;
  availableBedsCount: number;
  beds?: BedItem[];
}

interface PaymentItem {
  id: string;
  amount: number;
  paidAmount: number;
  status: 'PAID' | 'PARTIAL' | 'DUE';
  billingPeriod: string;
  paidAt?: string | null;
  createdAt: string;
}

interface ExpenseItem {
  id: string;
  title: string;
  category: string;
  categoryLabel: string;
  amount: number;
  description?: string;
  expenseDate: string;
}

export const ReportsPage: React.FC = () => {
  const [reportType, setReportType] = useState<'OCCUPANCY' | 'FINANCE'>('OCCUPANCY');

  // Fetch Rooms for Occupancy Report
  const {
    data: roomsResponse,
    isLoading: isRoomsLoading,
    isError: isRoomsError,
    refetch: refetchRooms,
  } = useQuery({
    queryKey: ['admin-reports-rooms'],
    queryFn: async () => {
      const res = await apiClient.get<RoomItem[]>('/rooms');
      return res.data;
    },
  });

  // Fetch Payments for Finance Report
  const {
    data: paymentsResponse,
    isLoading: isPaymentsLoading,
    isError: isPaymentsError,
    refetch: refetchPayments,
  } = useQuery({
    queryKey: ['admin-reports-payments'],
    queryFn: async () => {
      const res = await apiClient.get<PaymentItem[]>('/payments');
      return res.data;
    },
  });

  // Fetch Expenses for Finance Report
  const {
    data: expensesResponse,
    isLoading: isExpensesLoading,
    isError: isExpensesError,
    refetch: refetchExpenses,
  } = useQuery({
    queryKey: ['admin-reports-expenses'],
    queryFn: async () => {
      const res = await apiClient.get<ExpenseItem[]>('/expenses');
      return res.data;
    },
  });

  const rooms = useMemo(() => roomsResponse || [], [roomsResponse]);
  const payments = useMemo(() => paymentsResponse || [], [paymentsResponse]);
  const expenses = useMemo(() => expensesResponse || [], [expensesResponse]);

  // Compute Occupancy by Floor
  const occupancyData = useMemo(() => {
    const floorMap = new Map<
      number,
      { floor: number; rooms: number; beds: number; occupied: number; available: number }
    >();

    rooms.forEach((r) => {
      const fl = r.floor || 1;
      const cur = floorMap.get(fl) || {
        floor: fl,
        rooms: 0,
        beds: 0,
        occupied: 0,
        available: 0,
      };

      cur.rooms += 1;
      cur.beds += r.capacity;
      cur.occupied += r.occupiedBedsCount;
      cur.available += r.availableBedsCount;
      floorMap.set(fl, cur);
    });

    const floors = Array.from(floorMap.values()).sort((a, b) => a.floor - b.floor);

    const totalRooms = floors.reduce((acc, f) => acc + f.rooms, 0);
    const totalBeds = floors.reduce((acc, f) => acc + f.beds, 0);
    const totalOccupied = floors.reduce((acc, f) => acc + f.occupied, 0);
    const totalAvailable = floors.reduce((acc, f) => acc + f.available, 0);
    const overallRate = totalBeds > 0 ? ((totalOccupied / totalBeds) * 100).toFixed(1) : '0.0';

    return {
      floors: floors.map((f) => ({
        floorName: `${f.floor}ম তলা (Floor ${f.floor})`,
        rooms: f.rooms,
        beds: f.beds,
        occupied: f.occupied,
        available: f.available,
        rate: f.beds > 0 ? ((f.occupied / f.beds) * 100).toFixed(1) : '0.0',
      })),
      totals: {
        rooms: totalRooms,
        beds: totalBeds,
        occupied: totalOccupied,
        available: totalAvailable,
        rate: overallRate,
      },
    };
  }, [rooms]);

  // Compute Financial Aggregates
  const financialData = useMemo(() => {
    // Total income from paid payments
    const totalIncome = payments.reduce((acc, p) => acc + (Number(p.paidAmount) || 0), 0);

    // Group expenses by category
    const categoryTotals: Record<string, { label: string; amount: number; count: number }> = {};
    let totalExpense = 0;

    expenses.forEach((e) => {
      const amt = Number(e.amount) || 0;
      totalExpense += amt;
      const cat = e.category || 'OTHER';
      const label = e.categoryLabel || cat;
      if (!categoryTotals[cat]) {
        categoryTotals[cat] = { label, amount: 0, count: 0 };
      }
      categoryTotals[cat].amount += amt;
      categoryTotals[cat].count += 1;
    });

    const netBalance = totalIncome - totalExpense;

    return {
      totalIncome,
      totalExpense,
      netBalance,
      categoryTotals: Object.values(categoryTotals),
    };
  }, [payments, expenses]);

  const isLoading = isRoomsLoading || isPaymentsLoading || isExpensesLoading;
  const isError = isRoomsError || isPaymentsError || isExpensesError;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-emerald-600" />
            <span>হোস্টেল রিপোর্ট ও অ্যানালিটিক্স (Hostel Reports & Analytics)</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-500">
            রিয়েল-টাইম ডাটাবেজ থেকে সিট অকুপেন্সি ও মাসিক আয়-ব্যয়ের অনুমোদিত পরিসংখ্যান
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              refetchRooms();
              refetchPayments();
              refetchExpenses();
            }}
            className="gap-1.5 shadow-xs"
          >
            <RefreshCw className="w-4 h-4 text-slate-600" />
            <span>রিফ্রেশ</span>
          </Button>
          <Button
            variant="default"
            size="sm"
            onClick={() => window.print()}
            className="gap-1.5 shadow-xs bg-emerald-600 hover:bg-emerald-700"
          >
            <Printer className="w-4 h-4" />
            <span>প্রিন্ট রিপোর্ট (Print)</span>
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
            className={`text-xs gap-1.5 ${
              reportType === 'OCCUPANCY' ? 'bg-emerald-600 hover:bg-emerald-700 text-white' : ''
            }`}
          >
            <Bed className="w-3.5 h-3.5" />
            <span>সিট অকুপেন্সি রিপোর্ট</span>
          </Button>
          <Button
            size="sm"
            variant={reportType === 'FINANCE' ? 'default' : 'outline'}
            onClick={() => setReportType('FINANCE')}
            className={`text-xs gap-1.5 ${
              reportType === 'FINANCE' ? 'bg-emerald-600 hover:bg-emerald-700 text-white' : ''
            }`}
          >
            <CreditCard className="w-3.5 h-3.5" />
            <span>আর্থিক আয়-ব্যয় রিপোর্ট</span>
          </Button>
        </div>

        <div className="text-xs text-slate-500 font-medium flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span>সরাসরি MySQL ডাটাবেজ থেকে সিঙ্ক করা হয়েছে</span>
        </div>
      </div>

      {/* Loading & Error States */}
      {isLoading && (
        <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-xs space-y-4">
          <div className="flex items-center justify-center gap-2 text-slate-500 text-sm">
            <Loader2 className="w-5 h-5 animate-spin text-emerald-600" />
            <span>রিপোর্ট ডাটা লোড হচ্ছে...</span>
          </div>
          <div className="space-y-2">
            <Skeleton className="h-8 w-full rounded-lg" />
            <Skeleton className="h-8 w-full rounded-lg" />
            <Skeleton className="h-8 w-full rounded-lg" />
          </div>
        </div>
      )}

      {isError && !isLoading && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            রিপোর্ট তথ্য লোড করতে সমস্যা হয়েছে। অনুগ্রহ করে সার্ভার সংযোগ পরীক্ষা করে পুনরায় রিফ্রেশ করুন।
          </AlertDescription>
        </Alert>
      )}

      {/* Render Selected Report */}
      {!isLoading && !isError && reportType === 'OCCUPANCY' && (
        <div className="space-y-6">
          {/* Quick Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
              <span className="text-xs font-semibold text-slate-500 uppercase">মোট রুম সংখ্যা</span>
              <div className="text-2xl font-black text-slate-800 mt-1">
                {occupancyData.totals.rooms} টি
              </div>
            </div>
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
              <span className="text-xs font-semibold text-slate-500 uppercase">মোট বেড ধারণক্ষমতা</span>
              <div className="text-2xl font-black text-slate-800 mt-1">
                {occupancyData.totals.beds} টি
              </div>
            </div>
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
              <span className="text-xs font-semibold text-slate-500 uppercase">বরাদ্দকৃত (Occupied)</span>
              <div className="text-2xl font-black text-emerald-700 mt-1">
                {occupancyData.totals.occupied} টি
              </div>
            </div>
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
              <span className="text-xs font-semibold text-slate-500 uppercase">সামগ্রিক অকুপেন্সি হার</span>
              <div className="text-2xl font-black text-emerald-800 mt-1">
                {occupancyData.totals.rate}%
              </div>
            </div>
          </div>

          {/* Occupancy Table */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
            <div className="border-b pb-3 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
                  <Building className="w-4 h-4 text-emerald-600" />
                  <span>ফ্লোরভিত্তিক সিট ও বেড অকুপেন্সি বিশ্লেষণ (Floor-wise Occupancy)</span>
                </h3>
                <p className="text-xs text-slate-500">
                  হোস্টেলের প্রতিটি তলায় মোট রুম, সিট সংখ্যা এবং বর্তমান বরাদ্দের অনুপাত
                </p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ফ্লোর (Floor)</TableHead>
                    <TableHead>মোট রুম</TableHead>
                    <TableHead>মোট বেড</TableHead>
                    <TableHead>বরাদ্দকৃত বেড</TableHead>
                    <TableHead>খালি বেড (Available)</TableHead>
                    <TableHead className="text-right">অকুপেন্সি হার</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {occupancyData.floors.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-6 text-slate-400">
                        কোনো রুমের তথ্য পাওয়া যায়নি।
                      </TableCell>
                    </TableRow>
                  ) : (
                    occupancyData.floors.map((row, i) => (
                      <TableRow key={i}>
                        <TableCell className="font-bold text-slate-800">{row.floorName}</TableCell>
                        <TableCell>{row.rooms} টি</TableCell>
                        <TableCell>{row.beds} টি</TableCell>
                        <TableCell className="text-slate-900 font-semibold">{row.occupied} টি</TableCell>
                        <TableCell className="text-emerald-700 font-semibold">{row.available} টি</TableCell>
                        <TableCell className="text-right text-emerald-800 font-bold">
                          <span className="inline-block bg-emerald-50 text-emerald-800 px-2.5 py-0.5 rounded-full border border-emerald-200">
                            {row.rate}%
                          </span>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                  {occupancyData.floors.length > 0 && (
                    <TableRow className="font-bold bg-slate-50 border-t-2 border-slate-300">
                      <TableCell className="font-black text-slate-900">সর্বমোট (Total)</TableCell>
                      <TableCell>{occupancyData.totals.rooms} টি</TableCell>
                      <TableCell>{occupancyData.totals.beds} টি</TableCell>
                      <TableCell className="text-slate-900 font-black">{occupancyData.totals.occupied} টি</TableCell>
                      <TableCell className="text-emerald-700 font-black">{occupancyData.totals.available} টি</TableCell>
                      <TableCell className="text-right text-emerald-800 font-black">
                        <span className="inline-block bg-emerald-600 text-white px-3 py-1 rounded-full text-xs font-bold">
                          {occupancyData.totals.rate}%
                        </span>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        </div>
      )}

      {/* Render Selected Report: FINANCE */}
      {!isLoading && !isError && reportType === 'FINANCE' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-500 uppercase font-semibold">মোট সংগৃহীত আয় (Income)</span>
                <TrendingUp className="w-4 h-4 text-emerald-600" />
              </div>
              <div className="text-2xl font-extrabold text-emerald-700 mt-2">
                ৳ {financialData.totalIncome.toLocaleString()}
              </div>
              <span className="text-[11px] text-slate-400">শিক্ষার্থী সিট ভাড়া ও ফি কালেকশন</span>
            </div>
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-500 uppercase font-semibold">মোট হোস্টেল ব্যয় (Expenses)</span>
                <TrendingDown className="w-4 h-4 text-rose-600" />
              </div>
              <div className="text-2xl font-extrabold text-rose-700 mt-2">
                ৳ {financialData.totalExpense.toLocaleString()}
              </div>
              <span className="text-[11px] text-slate-400">ডাইনিং, ইউটিলিটি, ইন্টারনেট ও মেনটেন্যান্স</span>
            </div>
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-500 uppercase font-semibold">নিট ব্যালান্স (Net Surplus)</span>
                <Scale className="w-4 h-4 text-slate-600" />
              </div>
              <div className={`text-2xl font-extrabold mt-2 ${financialData.netBalance >= 0 ? 'text-slate-900' : 'text-rose-600'}`}>
                ৳ {financialData.netBalance.toLocaleString()}
              </div>
              <span className="text-[11px] text-slate-400">বর্তমান আর্থিক উদ্বৃত্ত ও মার্জিন</span>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
            <div className="border-b pb-3">
              <h3 className="font-bold text-base text-slate-900">খাতভিত্তিক ব্যয় ও খরচের বিবরণী (Expense Breakdown)</h3>
              <p className="text-xs text-slate-500">ডাটাবেজে সংরক্ষিত অনুমোদিত খরচের বিবরণ</p>
            </div>

            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>খরচের খাত (Category)</TableHead>
                    <TableHead>ভাউচার সংখ্যা</TableHead>
                    <TableHead>ব্যয়ের ধরণ</TableHead>
                    <TableHead className="text-right">টাকার পরিমাণ (BDT)</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell className="font-semibold text-slate-800">
                      শিক্ষার্থী মাসিক সিট ভাড়া কালেকশন (Seat Rent Collections)
                    </TableCell>
                    <TableCell>{payments.length} টি রসিদ</TableCell>
                    <TableCell>
                      <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                        আয় (Income)
                      </span>
                    </TableCell>
                    <TableCell className="text-right font-extrabold text-emerald-700">
                      + ৳ {financialData.totalIncome.toLocaleString()}
                    </TableCell>
                  </TableRow>

                  {financialData.categoryTotals.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-4 text-slate-400 text-xs">
                        কোনো ব্যয়ের রেকর্ড পাওয়া যায়নি।
                      </TableCell>
                    </TableRow>
                  ) : (
                    financialData.categoryTotals.map((cat, idx) => (
                      <TableRow key={idx}>
                        <TableCell className="font-medium text-slate-700">
                          {cat.label}
                        </TableCell>
                        <TableCell>{cat.count} টি ভাউচার</TableCell>
                        <TableCell>
                          <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-rose-100 text-rose-800">
                            ব্যয় (Expense)
                          </span>
                        </TableCell>
                        <TableCell className="text-right font-extrabold text-rose-700">
                          - ৳ {cat.amount.toLocaleString()}
                        </TableCell>
                      </TableRow>
                    ))
                  )}

                  <TableRow className="font-bold bg-slate-50 border-t-2 border-slate-300">
                    <TableCell className="font-black text-slate-900" colSpan={3}>
                      নিট ব্যালান্স / আর্থিক স্থিতি (Net Balance)
                    </TableCell>
                    <TableCell className={`text-right font-black text-base ${
                      financialData.netBalance >= 0 ? 'text-slate-900' : 'text-rose-700'
                    }`}>
                      ৳ {financialData.netBalance.toLocaleString()}
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
