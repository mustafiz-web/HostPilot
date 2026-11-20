import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import {
  Users,
  Bed,
  CreditCard,
  AlertCircle,
  UserPlus,
  KeyRound,
  ArrowRight,
  TrendingUp,
  RefreshCw,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/ui/status-badge';
import { Skeleton } from '@/components/ui/skeleton';
import { apiClient } from '@/lib/api-client';

interface AdminDashboardData {
  stats: {
    totalStudents: number;
    activeStudents: number;
    totalRooms: number;
    totalBeds: number;
    occupiedBeds: number;
    availableBeds: number;
    occupancyRate: number;
    monthlyCollection: number;
    pendingComplaintsCount: number;
  };
  recentAdmissions: Array<{
    id: string;
    applicationNumber: string;
    applicantName: string;
    email: string;
    phone: string;
    preferredRoomType: string;
    status: string;
    appliedAt: string;
  }>;
  recentPayments: Array<{
    id: string;
    receiptNumber: string;
    studentName: string;
    roomNumber: string;
    amount: number;
    paidAmount: number;
    status: string;
    billingPeriod: string;
    paidAt?: string;
    createdAt: string;
  }>;
  recentComplaints: Array<{
    id: string;
    title: string;
    category: string;
    priority: string;
    status: string;
    studentName: string;
    roomNumber: string;
    createdAt: string;
  }>;
}

export const AdminDashboardPage: React.FC = () => {
  const { t, i18n } = useTranslation();
  const isEn = i18n.language?.startsWith('en');

  const {
    data: dashboardResponse,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ['admin-dashboard-metrics'],
    queryFn: async () => {
      const res = await apiClient.get<AdminDashboardData>('/dashboard/admin');
      return res.data;
    },
    staleTime: 30 * 1000,
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-24 bg-white rounded-2xl border border-slate-200 p-5 flex items-center justify-between">
          <div className="space-y-2">
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-72" />
          </div>
          <div className="flex gap-2">
            <Skeleton className="h-9 w-32" />
            <Skeleton className="h-9 w-28" />
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-32 rounded-2xl" />
          ))}
        </div>
        <Skeleton className="h-28 rounded-2xl" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Skeleton className="h-64 rounded-2xl" />
          <Skeleton className="h-64 rounded-2xl" />
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
          {(error as any)?.message || 'Database error fetching dashboard metrics.'}
        </p>
        <Button onClick={() => refetch()} variant="outline" size="sm" className="gap-2">
          <RefreshCw className="w-4 h-4" />
          <span>{t('admin.dashboard.retry')}</span>
        </Button>
      </div>
    );
  }

  const { stats, recentAdmissions, recentPayments, recentComplaints } = dashboardResponse;

  const statCards = [
    {
      label: t('admin.dashboard.stat_students'),
      value: isEn ? `${stats.totalStudents}` : `${stats.totalStudents} জন`,
      icon: Users,
      sub: `${stats.activeStudents} ${t('admin.dashboard.stat_students_sub')}`,
      color: 'text-emerald-600',
      bg: 'bg-emerald-50',
    },
    {
      label: t('admin.dashboard.stat_beds'),
      value: isEn ? `${stats.totalBeds}` : `${stats.totalBeds} টি`,
      icon: Bed,
      sub: `${stats.availableBeds} ${t('admin.dashboard.stat_beds_sub')}`,
      color: 'text-blue-600',
      bg: 'bg-blue-50',
    },
    {
      label: t('admin.dashboard.stat_collection'),
      value: `৳ ${stats.monthlyCollection.toLocaleString()}`,
      icon: CreditCard,
      sub: t('admin.dashboard.stat_collection_sub'),
      color: 'text-purple-600',
      bg: 'bg-purple-50',
    },
    {
      label: t('admin.dashboard.stat_complaints'),
      value: isEn ? `${stats.pendingComplaintsCount}` : `${stats.pendingComplaintsCount} টি`,
      icon: AlertCircle,
      sub: `${stats.pendingComplaintsCount} ${t('admin.dashboard.stat_complaints_sub')}`,
      color: 'text-amber-600',
      bg: 'bg-amber-50',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Page Title & Quick Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
            {t('admin.dashboard.title')}
          </h2>
          <p className="text-xs sm:text-sm text-slate-500">
            {t('admin.dashboard.subtitle')}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button asChild size="sm" className="gap-1.5 shadow-xs bg-emerald-600 hover:bg-emerald-700">
            <Link to="/admin/admissions">
              <UserPlus className="w-4 h-4" />
              <span>{t('admin.dashboard.quick_admissions')}</span>
            </Link>
          </Button>
          <Button asChild variant="outline" size="sm" className="gap-1.5">
            <Link to="/admin/allocations">
              <KeyRound className="w-4 h-4" />
              <span>{t('admin.dashboard.quick_allocate')}</span>
            </Link>
          </Button>
        </div>
      </div>

      {/* Metrics Counter Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <div
              key={idx}
              className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs hover:border-emerald-300 transition-all space-y-3"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                  {stat.label}
                </span>
                <div className={`h-9 w-9 rounded-xl ${stat.bg} ${stat.color} flex items-center justify-center`}>
                  <Icon className="w-5 h-5" />
                </div>
              </div>
              <div className="text-2xl sm:text-3xl font-extrabold text-slate-900">{stat.value}</div>
              <div className="flex items-center text-xs text-slate-600 font-medium">
                <TrendingUp className="w-3.5 h-3.5 text-emerald-600 mr-1" />
                <span>{stat.sub}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Occupancy Bar Visual */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-3">
        <div className="flex justify-between items-center text-sm">
          <span className="font-bold text-slate-800">{t('admin.dashboard.stat_occupancy')}:</span>
          <span className="font-extrabold text-emerald-700">
            {stats.occupancyRate}% ({stats.occupiedBeds}/{stats.totalBeds})
          </span>
        </div>
        <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-emerald-600 rounded-full transition-all duration-500"
            style={{ width: `${Math.min(100, stats.occupancyRate)}%` }}
          />
        </div>
        <div className="flex justify-between text-xs text-slate-500 pt-1">
          <span>{t('admin.rooms.stat_total_rooms')}: {stats.totalRooms}</span>
          <span>{t('admin.rooms.stat_occupied')}: {stats.occupiedBeds}</span>
          <span className="text-emerald-700 font-semibold">{t('admin.rooms.stat_available')}: {stats.availableBeds}</span>
        </div>
      </div>

      {/* Two Column Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Admissions */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b pb-3">
            <div>
              <h3 className="font-bold text-base text-slate-900">{t('admin.dashboard.recent_admissions')}</h3>
              <p className="text-xs text-slate-500">{t('admin.admissions.subtitle')}</p>
            </div>
            <Button asChild variant="ghost" size="sm" className="text-xs text-emerald-700 gap-1">
              <Link to="/admin/admissions">
                <span>{t('admin.dashboard.view_all_admissions')}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </Button>
          </div>

          <div className="space-y-3">
            {recentAdmissions.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-6">{t('admin.dashboard.empty_admissions')}</p>
            ) : (
              recentAdmissions.map((adm) => (
                <div
                  key={adm.id}
                  className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100 hover:bg-slate-100/60 transition-colors"
                >
                  <div>
                    <div className="font-bold text-sm text-slate-800">{adm.applicantName}</div>
                    <div className="text-xs text-slate-500 font-mono">
                      {adm.applicationNumber} • {new Date(adm.appliedAt).toLocaleDateString()}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <StatusBadge status={adm.status} />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Recent Payment Records */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b pb-3">
            <div>
              <h3 className="font-bold text-base text-slate-900">{t('admin.dashboard.recent_payments')}</h3>
              <p className="text-xs text-slate-500">{t('admin.payments.subtitle')}</p>
            </div>
            <Button asChild variant="ghost" size="sm" className="text-xs text-emerald-700 gap-1">
              <Link to="/admin/payments">
                <span>{t('admin.dashboard.view_all_payments')}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </Button>
          </div>

          <div className="space-y-3">
            {recentPayments.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-6">{t('admin.dashboard.empty_payments')}</p>
            ) : (
              recentPayments.map((pay) => (
                <div
                  key={pay.id}
                  className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100 hover:bg-slate-100/60 transition-colors"
                >
                  <div>
                    <div className="font-bold text-sm text-slate-800">{pay.studentName}</div>
                    <div className="text-xs text-slate-500 font-mono">
                      {t('admin.rooms.room_number')} {pay.roomNumber} • {pay.receiptNumber}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-sm text-emerald-700">
                      ৳ {pay.paidAmount.toLocaleString()}
                    </div>
                    <StatusBadge status={pay.status} />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Pending Complaints Overview */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b pb-3">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-amber-600" />
            <h3 className="font-bold text-base text-slate-900">{t('admin.dashboard.recent_complaints')}</h3>
          </div>
          <Button asChild variant="outline" size="sm" className="text-xs gap-1">
            <Link to="/admin/complaints">
              <span>{t('admin.dashboard.view_all_complaints')}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {recentComplaints.length === 0 ? (
            <div className="col-span-3 text-center py-8 text-xs text-slate-400">
              {t('admin.dashboard.empty_complaints')}
            </div>
          ) : (
            recentComplaints.map((comp) => (
              <div key={comp.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-2">
                <div className="flex justify-between items-start">
                  <span className="text-[11px] font-mono font-medium text-slate-500">{comp.category}</span>
                  <StatusBadge status={comp.status} />
                </div>
                <h4 className="text-xs font-bold text-slate-800 line-clamp-1">{comp.title}</h4>
                <div className="text-[11px] text-slate-400 pt-2 border-t border-slate-200">
                  {comp.studentName} ({t('admin.rooms.room_number')} {comp.roomNumber})
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
