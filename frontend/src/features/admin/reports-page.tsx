import React, { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import {
  BarChart3,
  Building,
  TrendingUp,
  TrendingDown,
  Printer,
  RefreshCw,
  AlertCircle,
  Loader2,
  PieChart,
  DollarSign,
  Bed,
  CheckCircle2,
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
import { formatCurrency, formatNumber } from '@/lib/formatters';

interface RoomData {
  id: string;
  roomNumber: string;
  floor: number;
  capacity: number;
  status: string;
  occupiedBedsCount: number;
  availableBedsCount: number;
}

interface PaymentRecord {
  id: string;
  amount: number;
  paidAmount: number;
  status: string;
  billingPeriod: string;
  paymentMethod: string;
}

interface ExpenseRecord {
  id: string;
  title: string;
  amount: number;
  category: string;
  categoryLabel?: string;
  expenseDate: string;
}

export const ReportsPage: React.FC = () => {
  const { t, i18n } = useTranslation();
  const isEn = i18n.language?.startsWith('en');
  const [activeTab, setActiveTab] = useState<'OCCUPANCY' | 'FINANCIAL'>('OCCUPANCY');

  // 1. Fetch Rooms Data
  const {
    data: roomsResponse,
    isLoading: isRoomsLoading,
    isError: isRoomsError,
    refetch: refetchRooms,
  } = useQuery({
    queryKey: ['admin-reports-rooms'],
    queryFn: async () => {
      const res = await apiClient.get<RoomData[]>('/rooms');
      return res.data;
    },
    staleTime: 60 * 1000,
  });

  // 2. Fetch Payments Data
  const {
    data: paymentsResponse,
    isLoading: isPaymentsLoading,
    isError: isPaymentsError,
    refetch: refetchPayments,
  } = useQuery({
    queryKey: ['admin-reports-payments'],
    queryFn: async () => {
      const res = await apiClient.get<PaymentRecord[]>('/payments');
      return res.data;
    },
    staleTime: 60 * 1000,
  });

  // 3. Fetch Expenses Data
  const {
    data: expensesResponse,
    isLoading: isExpensesLoading,
    isError: isExpensesError,
    refetch: refetchExpenses,
  } = useQuery({
    queryKey: ['admin-reports-expenses'],
    queryFn: async () => {
      const res = await apiClient.get<ExpenseRecord[]>('/expenses');
      return res.data;
    },
    staleTime: 60 * 1000,
  });

  const rooms = roomsResponse || [];
  const payments = paymentsResponse || [];
  const expenses = expensesResponse || [];

  // Compute Occupancy Aggregates
  const occupancyData = useMemo(() => {
    const floorMap = new Map<number, { floor: number; rooms: number; beds: number; occupied: number; available: number }>();

    rooms.forEach((r) => {
      const fl = r.floor;
      const cur = floorMap.get(fl) || { floor: fl, rooms: 0, beds: 0, occupied: 0, available: 0 };

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
        floorName: `${isEn ? 'Floor ' + f.floor : f.floor + 'ম তলা'}`,
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
  }, [rooms, isEn]);

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
            <span>{t('admin.reports.title')}</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-500">
            {t('admin.reports.subtitle')}
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
            className="gap-1.5 text-xs text-slate-700"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>{t('common.refresh')}</span>
          </Button>
          <Button
            size="sm"
            onClick={() => window.print()}
            className="gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>{t('student.payments.print_receipt')}</span>
          </Button>
        </div>
      </div>

      {/* Report Switcher Tabs */}
      <div className="flex items-center justify-between bg-white p-2 rounded-2xl border border-slate-200 shadow-xs">
        <div className="flex gap-2">
          <Button
            variant={activeTab === 'OCCUPANCY' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setActiveTab('OCCUPANCY')}
            className={`gap-2 rounded-xl text-xs font-bold ${
              activeTab === 'OCCUPANCY'
                ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs'
                : 'text-slate-600'
            }`}
          >
            <Bed className="w-4 h-4" />
            <span>{t('admin.reports.occupancy_report')}</span>
          </Button>
          <Button
            variant={activeTab === 'FINANCIAL' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setActiveTab('FINANCIAL')}
            className={`gap-2 rounded-xl text-xs font-bold ${
              activeTab === 'FINANCIAL'
                ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs'
                : 'text-slate-600'
            }`}
          >
            <DollarSign className="w-4 h-4" />
            <span>{t('admin.reports.financial_summary')}</span>
          </Button>
        </div>
        <div className="hidden sm:flex items-center gap-1.5 text-xs text-slate-400 px-3">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
          <span>{isEn ? 'Synchronized with MySQL Database' : 'সরাসরি MySQL ডাটাবেজ থেকে সিঙ্ক করা হয়েছে'}</span>
        </div>
      </div>

      {isLoading ? (
        <div className="p-8 space-y-4 bg-white rounded-2xl border border-slate-200">
          <div className="flex items-center justify-center gap-2 text-slate-500 text-sm">
            <Loader2 className="w-5 h-5 animate-spin text-emerald-600" />
            <span>{t('common.loading')}</span>
          </div>
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
        </div>
      ) : isError ? (
        <Alert variant="destructive" className="bg-rose-50 border-rose-200 text-rose-800 text-xs">
          <AlertCircle className="w-4 h-4 text-rose-600" />
          <AlertDescription>
            {isEn
              ? 'Failed to load report data. Please check connection and refresh.'
              : 'রিপোর্ট তথ্য লোড করতে সমস্যা হয়েছে। অনুগ্রহ করে সার্ভার সংযোগ পরীক্ষা করে পুনরায় রিফ্রেশ করুন।'}
          </AlertDescription>
        </Alert>
      ) : activeTab === 'OCCUPANCY' ? (
        /* ================= OCCUPANCY REPORT TAB ================= */
        <div className="space-y-6">
          {/* Occupancy KPI Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-1">
              <span className="text-xs font-semibold text-slate-500 uppercase">{t('admin.rooms.stat_total_rooms')}</span>
              <div className="text-2xl font-black text-slate-900">{formatNumber(occupancyData.totals.rooms)}{isEn ? '' : ' টি'}</div>
            </div>
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-1">
              <span className="text-xs font-semibold text-slate-500 uppercase">{t('admin.rooms.stat_total_beds')}</span>
              <div className="text-2xl font-black text-blue-700">{formatNumber(occupancyData.totals.beds)}{isEn ? '' : ' টি'}</div>
            </div>
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-1">
              <span className="text-xs font-semibold text-slate-500 uppercase">{t('admin.rooms.stat_occupied')}</span>
              <div className="text-2xl font-black text-emerald-700">{formatNumber(occupancyData.totals.occupied)}{isEn ? '' : ' টি'}</div>
            </div>
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-1">
              <span className="text-xs font-semibold text-slate-500 uppercase">{t('admin.reports.occupancy_rate')}</span>
              <div className="text-2xl font-black text-purple-700">{occupancyData.totals.rate}%</div>
            </div>
          </div>

          {/* Floor-wise Detailed Occupancy Table */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
                  <Building className="w-5 h-5 text-emerald-600" />
                  <span>{isEn ? 'Floor-wise Occupancy Analysis' : 'ফ্লোরভিত্তিক সিট ও বেড অকুপেন্সি বিশ্লেষণ'}</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  {isEn ? 'Room and bed distribution and allocation metrics per floor' : 'হোস্টেলের প্রতিটি তলায় মোট রুম, সিট সংখ্যা এবং বর্তমান বরাদ্দের অনুপাত'}
                </p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-slate-50/80">
                    <TableHead className="font-semibold text-xs">{t('admin.rooms.floor')}</TableHead>
                    <TableHead className="font-semibold text-xs">{t('admin.rooms.stat_total_rooms')}</TableHead>
                    <TableHead className="font-semibold text-xs">{t('admin.rooms.stat_total_beds')}</TableHead>
                    <TableHead className="font-semibold text-xs">{t('admin.rooms.stat_occupied')}</TableHead>
                    <TableHead className="font-semibold text-xs">{t('admin.rooms.stat_available')}</TableHead>
                    <TableHead className="font-semibold text-xs text-right">{t('admin.reports.occupancy_rate')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {occupancyData.floors.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8 text-slate-400 text-xs">
                        {isEn ? 'No room records found.' : 'কোনো রুমের তথ্য পাওয়া যায়নি।'}
                      </TableCell>
                    </TableRow>
                  ) : (
                    occupancyData.floors.map((row, idx) => (
                      <TableRow key={idx} className="hover:bg-slate-50/50 text-xs">
                        <TableCell className="font-bold text-slate-900">{row.floorName}</TableCell>
                        <TableCell>{formatNumber(row.rooms)}{isEn ? '' : ' টি'}</TableCell>
                        <TableCell>{formatNumber(row.beds)}{isEn ? '' : ' টি'}</TableCell>
                        <TableCell className="text-slate-900 font-semibold">{formatNumber(row.occupied)}{isEn ? '' : ' টি'}</TableCell>
                        <TableCell className="text-emerald-700 font-semibold">{formatNumber(row.available)}{isEn ? '' : ' টি'}</TableCell>
                        <TableCell className="text-right font-bold text-slate-800">
                          <span
                            className={`px-2 py-0.5 rounded font-mono text-[11px] ${
                              Number(row.rate) > 80
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-slate-100 text-slate-700'
                            }`}
                          >
                            {row.rate}%
                          </span>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                  {/* Totals Summary Row */}
                  <TableRow className="bg-slate-100/70 font-bold text-xs border-t-2 border-slate-200">
                    <TableCell className="font-black text-slate-900">{t('common.all', 'Total')}</TableCell>
                    <TableCell>{formatNumber(occupancyData.totals.rooms)}{isEn ? '' : ' টি'}</TableCell>
                    <TableCell>{formatNumber(occupancyData.totals.beds)}{isEn ? '' : ' টি'}</TableCell>
                    <TableCell className="text-slate-900 font-black">{formatNumber(occupancyData.totals.occupied)}{isEn ? '' : ' টি'}</TableCell>
                    <TableCell className="text-emerald-700 font-black">{formatNumber(occupancyData.totals.available)}{isEn ? '' : ' টি'}</TableCell>
                    <TableCell className="text-right font-black text-purple-800 font-mono">
                      {occupancyData.totals.rate}%
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>
          </div>
        </div>
      ) : (
        /* ================= FINANCIAL REPORT TAB ================= */
        <div className="space-y-6">
          {/* Financial KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-500 uppercase font-semibold">{t('admin.reports.total_income')}</span>
                <TrendingUp className="w-5 h-5 text-emerald-600" />
              </div>
              <div className="text-2xl font-black text-emerald-700">
                {formatCurrency(financialData.totalIncome)}
              </div>
              <span className="text-[11px] text-slate-400">{t('student.payments.paid_in_current_session')}</span>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-500 uppercase font-semibold">{t('admin.reports.total_expense')}</span>
                <TrendingDown className="w-5 h-5 text-rose-600" />
              </div>
              <div className="text-2xl font-black text-rose-700">
                {formatCurrency(financialData.totalExpense)}
              </div>
              <span className="text-[11px] text-slate-400">{isEn ? 'Utilities, maintenance, and dining expenses' : 'ডাইনিং, ইউটিলিটি, ইন্টারনেট ও মেনটেন্যান্স'}</span>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-500 uppercase font-semibold">{t('admin.reports.net_balance')}</span>
                <PieChart className="w-5 h-5 text-purple-600" />
              </div>
              <div className={`text-2xl font-black ${financialData.netBalance >= 0 ? 'text-purple-700' : 'text-rose-600'}`}>
                {formatCurrency(financialData.netBalance)}
              </div>
              <span className="text-[11px] text-slate-400">{isEn ? 'Net cash reserve / margin' : 'বর্তমান আর্থিক উদ্বৃত্ত ও মার্জিন'}</span>
            </div>
          </div>

          {/* Breakdown Table */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="p-5 border-b border-slate-100">
              <h3 className="font-bold text-base text-slate-900">{isEn ? 'Expense Breakdown by Category' : 'খাতভিত্তিক ব্যয় ও খরচের বিবরণী'}</h3>
              <p className="text-xs text-slate-500">{isEn ? 'Itemized breakdown from recorded transactions' : 'ডাটাবেজে সংরক্ষিত অনুমোদিত খরচের বিবরণ'}</p>
            </div>

            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-slate-50/80">
                    <TableHead className="font-semibold text-xs">{t('admin.expenses.th_category')}</TableHead>
                    <TableHead className="font-semibold text-xs">{isEn ? 'Transactions' : 'ভাউচার সংখ্যা'}</TableHead>
                    <TableHead className="font-semibold text-xs">{isEn ? 'Type' : 'ব্যয়ের ধরণ'}</TableHead>
                    <TableHead className="font-semibold text-xs text-right">{isEn ? 'Amount (BDT)' : 'টাকার পরিমাণ (BDT)'}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {/* Income Row */}
                  <TableRow className="hover:bg-slate-50/50 text-xs">
                    <TableCell className="font-bold text-slate-900">
                      {isEn ? 'Student Seat Rent & Fees Collection' : 'শিক্ষার্থী মাসিক সিট ভাড়া কালেকশন'}
                    </TableCell>
                    <TableCell>{formatNumber(payments.length)} {isEn ? 'Receipts' : 'টি রসিদ'}</TableCell>
                    <TableCell>
                      <span className="text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded">
                        {isEn ? 'Income' : 'আয় (Income)'}
                      </span>
                    </TableCell>
                    <TableCell className="font-mono font-bold text-emerald-700 text-right">
                      + {formatCurrency(financialData.totalIncome)}
                    </TableCell>
                  </TableRow>

                  {/* Expense Rows */}
                  {financialData.categoryTotals.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-6 text-slate-400 text-xs">
                        {isEn ? 'No expense records found.' : 'কোনো ব্যয়ের রেকর্ড পাওয়া যায়নি।'}
                      </TableCell>
                    </TableRow>
                  ) : (
                    financialData.categoryTotals.map((cat, idx) => (
                      <TableRow key={idx} className="hover:bg-slate-50/50 text-xs">
                        <TableCell className="font-medium text-slate-800">{cat.label}</TableCell>
                        <TableCell>{formatNumber(cat.count)} {isEn ? 'Vouchers' : 'টি ভাউচার'}</TableCell>
                        <TableCell>
                          <span className="text-rose-700 font-bold bg-rose-50 px-2 py-0.5 rounded">
                            {isEn ? 'Expense' : 'ব্যয় (Expense)'}
                          </span>
                        </TableCell>
                        <TableCell className="font-mono font-bold text-rose-700 text-right">
                          - {formatCurrency(cat.amount)}
                        </TableCell>
                      </TableRow>
                    ))
                  )}

                  {/* Net Balance Row */}
                  <TableRow className="bg-slate-100/70 font-black text-xs border-t-2 border-slate-200">
                    <TableCell className="font-black text-slate-900" colSpan={3}>
                      {t('admin.reports.net_balance')}
                    </TableCell>
                    <TableCell className={`font-mono text-right font-black text-sm ${financialData.netBalance >= 0 ? 'text-purple-800' : 'text-rose-700'}`}>
                      {formatCurrency(financialData.netBalance)}
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
