import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import {
  Bed,
  Receipt,
  AlertCircle,
  Bell,
  ArrowRight,
  CreditCard,
  MessageSquarePlus,
  Users,
  ShieldCheck,
  Clock,
  RefreshCw,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/ui/status-badge';
import { Skeleton } from '@/components/ui/skeleton';
import { apiClient } from '@/lib/api-client';

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
  roommates: Array<{
    name: string;
    bedCode: string;
    department: string;
  }>;
  currentDue: {
    id: string;
    billingPeriod: string;
    amount: number;
    paidAmount: number;
    dueAmount: number;
    status: string;
  } | null;
  complaints: Array<{
    id: string;
    title: string;
    category: string;
    priority: string;
    status: string;
    createdAt: string;
  }>;
  notices: Array<{
    id: string;
    title: string;
    category: string;
    isPinned: boolean;
    publishedAt: string;
  }>;
}

export const StudentDashboardPage: React.FC = () => {
  const { t } = useTranslation();
  const {
    data: dashboardResponse,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ['student-dashboard-metrics'],
    queryFn: async () => {
      const res = await apiClient.get<StudentDashboardData>('/dashboard/student');
      return res.data;
    },
    staleTime: 30 * 1000,
  });

  // Query recent payments of logged-in student
  const { data: paymentsResponse } = useQuery({
    queryKey: ['student-recent-payments'],
    queryFn: async () => {
      const res = await apiClient.get<any[]>('/payments/me');
      return res.data;
    },
    staleTime: 60 * 1000,
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-36 rounded-2xl w-full" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-28 rounded-2xl" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Skeleton className="h-64 rounded-2xl" />
          <Skeleton className="lg:col-span-2 h-64 rounded-2xl" />
        </div>
      </div>
    );
  }

  if (isError || !dashboardResponse) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-4">
        <AlertCircle className="w-12 h-12 text-rose-500 mx-auto" />
        <h3 className="text-lg font-bold text-slate-800">{t('admin.dashboard.load_error')}</h3>
        <p className="text-xs text-slate-500 max-w-sm mx-auto">
          {(error as any)?.message || 'Failed to fetch student data from server.'}
        </p>
        <Button onClick={() => refetch()} variant="outline" size="sm" className="gap-2">
          <RefreshCw className="w-4 h-4" />
          <span>{t('admin.dashboard.retry')}</span>
        </Button>
      </div>
    );
  }

  const { profile, allocation, roommates, currentDue, complaints, notices } = dashboardResponse;
  const payments = paymentsResponse || [];
  const activeComplaints = complaints.filter((c) => c.status !== 'RESOLVED');

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-emerald-800 to-teal-900 text-white rounded-2xl p-4 sm:p-8 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 bg-emerald-700/50 text-emerald-200 px-3 py-1 rounded-full text-xs font-medium border border-emerald-600/40">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-300" />
            <span>{t('student.nav.portal_title')}</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            {t('student.dashboard.welcome')}, {profile.name}!
          </h2>
          <p className="text-emerald-100 text-xs sm:text-sm max-w-xl leading-relaxed">
            {t('student.dashboard.meta_id')}: <span className="font-mono font-bold text-white">{profile.studentCode}</span> • {t('student.dashboard.meta_dept')}: {profile.department} ({t('student.dashboard.meta_roll')}: {profile.rollNumber}) • {t('student.dashboard.meta_session')}: {profile.session}
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <Button asChild className="bg-white text-emerald-900 hover:bg-emerald-50 gap-2 shadow-xs">
            <Link to="/student/payments">
              <CreditCard className="w-4 h-4 text-emerald-700" />
              <span>{t('student.nav.payments')}</span>
            </Link>
          </Button>
          <Button
            asChild
            variant="outline"
            className="border-emerald-600 text-white hover:bg-emerald-800/80 gap-2"
          >
            <Link to="/student/complaints">
              <MessageSquarePlus className="w-4 h-4 text-emerald-300" />
              <span>{t('student.complaints.btn_new')}</span>
            </Link>
          </Button>
        </div>
      </div>

      {/* Key Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Allocated Bed Card */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-3">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              {t('student.dashboard.card_room')}
            </span>
            <div className="h-9 w-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Bed className="w-5 h-5" />
            </div>
          </div>
          <div>
            {allocation ? (
              <>
                <div className="text-2xl font-black text-slate-900">
                  {t('student.room.room_number')} {allocation.roomNumber} ({allocation.bedCode})
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  {t('student.room.floor')}: {allocation.floor} • {allocation.roomType}
                </p>
              </>
            ) : (
              <>
                <div className="text-xl font-bold text-slate-400">{t('student.dashboard.no_room')}</div>
                <p className="text-xs text-slate-400 mt-1">{t('student.room.not_allocated')}</p>
              </>
            )}
          </div>
          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-slate-400">{t('student.dashboard.roommates_title')}:</span>
            <span className="font-semibold text-slate-700">
              {roommates.length > 0 ? `${roommates[0].name} (${roommates[0].bedCode})` : t('student.dashboard.no_roommates')}
            </span>
          </div>
        </div>

        {/* Current Due / Billing Status Card */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-3">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              {t('student.dashboard.card_payment')}
            </span>
            <div className="h-9 w-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Receipt className="w-5 h-5" />
            </div>
          </div>
          <div>
            {currentDue ? (
              <>
                <div className="text-2xl font-black text-amber-600">
                  ৳ {currentDue.dueAmount.toLocaleString()}
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  {currentDue.billingPeriod} • {t('status.due')}
                </p>
              </>
            ) : (
              <>
                <div className="text-2xl font-black text-emerald-600">{t('status.paid')}</div>
                <p className="text-xs text-slate-500 mt-1">{t('student.dashboard.no_due')}</p>
              </>
            )}
          </div>
          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-slate-400">{t('common.status')}:</span>
            <span className="font-semibold text-emerald-700">
              {currentDue ? t('status.due') : t('student.dashboard.no_due')}
            </span>
          </div>
        </div>

        {/* Active Complaints Status Card */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-3">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              {t('student.dashboard.card_complaint')}
            </span>
            <div className="h-9 w-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <AlertCircle className="w-5 h-5" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-black text-slate-900">
              {activeComplaints.length}
            </div>
            <p className="text-xs text-slate-500 mt-1">
              {activeComplaints.length > 0 ? t('status.in_progress') : t('status.resolved')}
            </p>
          </div>
          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-slate-400">{t('student.nav.complaints')}:</span>
            <span className="font-semibold text-slate-700">{complaints.length}</span>
          </div>
        </div>

        {/* Recent Notices Card */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-3">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              {t('student.dashboard.card_notice')}
            </span>
            <div className="h-9 w-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Bell className="w-5 h-5" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-black text-slate-900">
              {notices.length} টি বিজ্ঞপ্তি
            </div>
            <p className="text-xs text-slate-500 mt-1">সর্বশেষ প্রকাশিত</p>
          </div>
          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-slate-400">ক্যাটাগরি:</span>
            <span className="font-semibold text-slate-700">হোস্টেল নোটিশ</span>
          </div>
        </div>
      </div>

      {/* Middle Grid: Room Details & Active Complaints */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Room & Roommate Summary */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b pb-3">
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-emerald-600" />
              <h3 className="font-bold text-base text-slate-900">আমার রুম ও রুমমেট</h3>
            </div>
            <Link
              to="/student/room"
              className="text-xs font-medium text-emerald-700 hover:underline flex items-center gap-1"
            >
              <span>বিস্তারিত</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {allocation ? (
            <>
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/80 space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-500">ফ্লোর ও রুম:</span>
                  <span className="font-bold text-slate-800">
                    ফ্লোর {allocation.floor}, রুম {allocation.roomNumber}
                  </span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-500">রুম টাইপ:</span>
                  <span className="font-bold text-slate-800">{allocation.roomType}</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-500">মাসিক সিট ভাড়া:</span>
                  <span className="font-extrabold text-emerald-700">
                    ৳ {allocation.monthlyRent.toLocaleString()}
                  </span>
                </div>
              </div>

              <div className="space-y-3 pt-1">
                <h4 className="text-xs font-bold text-slate-600 uppercase tracking-wider">রুমের সহবাসী:</h4>
                {roommates.length === 0 ? (
                  <p className="text-xs text-slate-400 italic">বর্তমানে অন্য কোনো রুমমেট বরাদ্দ নেই</p>
                ) : (
                  roommates.map((rm, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-3 rounded-xl border border-slate-100 bg-white hover:bg-slate-50 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs bg-slate-100 text-slate-700">
                          {rm.bedCode}
                        </div>
                        <div>
                          <div className="font-bold text-xs text-slate-900">{rm.name}</div>
                          <div className="text-[11px] text-slate-400">{rm.department}</div>
                        </div>
                      </div>
                      <span className="text-[11px] font-mono font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                        বেড {rm.bedCode}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </>
          ) : (
            <div className="text-center py-8 space-y-2">
              <Bed className="w-8 h-8 text-slate-300 mx-auto" />
              <p className="text-xs text-slate-500">বর্তমানে আপনার কোনো সিট বরাদ্দ নেই</p>
            </div>
          )}
        </div>

        {/* Complaints Live Tracking Widget */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b pb-3">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-emerald-600" />
              <h3 className="font-bold text-base text-slate-900">আমার দাখিলকৃত অভিযোগ ট্র্যাকিং</h3>
            </div>
            <Link
              to="/student/complaints"
              className="text-xs font-medium text-emerald-700 hover:underline flex items-center gap-1"
            >
              <span>সকল অভিযোগ</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="space-y-3">
            {complaints.length === 0 ? (
              <div className="text-center py-8 text-xs text-slate-400">
                আপনি এখনও কোনো অভিযোগ জমা দেননি
              </div>
            ) : (
              complaints.slice(0, 2).map((cmp) => (
                <div
                  key={cmp.id}
                  className="p-4 rounded-xl border border-slate-200 hover:border-slate-300 transition-all space-y-2 bg-slate-50/50"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold px-2 py-0.5 rounded bg-slate-200 text-slate-700">
                        {cmp.category}
                      </span>
                      <h4 className="font-bold text-sm text-slate-900">{cmp.title}</h4>
                    </div>
                    <div className="flex items-center gap-2">
                      <StatusBadge status={cmp.status} />
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      <span>দাখিল: {new Date(cmp.createdAt).toLocaleDateString()}</span>
                    </span>
                    <span className="font-medium text-slate-500">অগ্রাধিকার: {cmp.priority}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Bottom Grid: Notice Board & Payment History Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Notice Board Preview */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b pb-3">
            <div className="flex items-center gap-2">
              <Bell className="w-5 h-5 text-emerald-600" />
              <h3 className="font-bold text-base text-slate-900">হোস্টেল নোটিশ বোর্ড</h3>
            </div>
            <Link
              to="/student/notices"
              className="text-xs font-medium text-emerald-700 hover:underline flex items-center gap-1"
            >
              <span>সকল নোটিশ</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="space-y-3">
            {notices.length === 0 ? (
              <div className="text-center py-8 text-xs text-slate-400">বর্তমানে কোনো নোটিশ নেই</div>
            ) : (
              notices.slice(0, 2).map((notice) => (
                <div
                  key={notice.id}
                  className="p-4 bg-slate-50 rounded-xl border border-slate-200/80 space-y-1.5"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                      {notice.category}
                    </span>
                    <span className="text-[11px] text-slate-400">
                      {new Date(notice.publishedAt).toLocaleDateString()}
                    </span>
                  </div>
                  <h4 className="font-bold text-sm text-slate-900">{notice.title}</h4>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Quick Payment Status Overview */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b pb-3">
            <div className="flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-emerald-600" />
              <h3 className="font-bold text-base text-slate-900">{t('student.dashboard.recent_receipts')}</h3>
            </div>
            <Link
              to="/student/payments"
              className="text-xs font-medium text-emerald-700 hover:underline flex items-center gap-1"
            >
              <span>{t('admin.dashboard.view_all_payments')}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="space-y-3">
            {payments.length === 0 ? (
              <div className="text-center py-8 text-xs text-slate-400">
                {t('admin.dashboard.empty_payments')}
              </div>
            ) : (
              payments.slice(0, 3).map((inv: any) => (
                <div
                  key={inv.id}
                  className="flex items-center justify-between p-3.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 transition-colors"
                >
                  <div>
                    <div className="font-bold text-xs text-slate-900">{inv.billingPeriod}</div>
                    <div className="text-[11px] font-mono text-slate-400">
                      {inv.receiptNumber} {inv.paidAt ? `• পরিশোধ: ${new Date(inv.paidAt).toLocaleDateString()}` : ''}
                    </div>
                  </div>
                  <div className="text-right flex items-center gap-3">
                    <div>
                      <div className="text-xs font-extrabold text-slate-900">
                        ৳ {Number(inv.amount).toLocaleString()}
                      </div>
                      <StatusBadge status={inv.status} />
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
