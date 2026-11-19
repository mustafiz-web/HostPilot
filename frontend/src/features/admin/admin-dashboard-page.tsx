import React from 'react';
import { Link } from 'react-router-dom';
import {
  Users,
  Bed,
  CreditCard,
  AlertCircle,
  UserPlus,
  KeyRound,
  ArrowRight,
  TrendingUp,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/ui/status-badge';
import {
  INITIAL_MOCK_ADMISSIONS,
  INITIAL_MOCK_PAYMENTS,
  INITIAL_MOCK_COMPLAINTS,
} from './mock-data/admin-mock-data';

export const AdminDashboardPage: React.FC = () => {
  const stats = [
    { label: 'মোট শিক্ষার্থী', value: '১২৪ জন', icon: Users, sub: 'সক্রিয় আবাসিক ছাত্র', color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { label: 'মোট আসন সংখ্যা', value: '১৫০ টি', icon: Bed, sub: '২৬ টি আসন খালি আছে', color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'চলতি মাসে আদায়', value: '৳ ৪,৮৫,০০০', icon: CreditCard, sub: '৮৮% ভাড়া সংগৃহীত', color: 'text-purple-600', bg: 'bg-purple-50' },
    { label: 'অমীমাংসিত অভিযোগ', value: '৩ টি', icon: AlertCircle, sub: 'কার্যক্রম চলমান', color: 'text-amber-600', bg: 'bg-amber-50' },
  ];

  return (
    <div className="space-y-6">
      {/* Page Title & Quick Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
            অ্যাডমিন ড্যাশবোর্ড ওভারভিউ
          </h2>
          <p className="text-xs sm:text-sm text-slate-500">
            হোস্টেল অপারেশন, শিক্ষার্থী, আসন বরাদ্দ এবং আর্থিক সামগ্রিক চিত্র
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button asChild size="sm" className="gap-1.5 shadow-xs">
            <Link to="/admin/admissions">
              <UserPlus className="w-4 h-4" />
              <span>নতুন আবেদন দেখুন</span>
            </Link>
          </Button>
          <Button asChild variant="outline" size="sm" className="gap-1.5">
            <Link to="/admin/allocations">
              <KeyRound className="w-4 h-4" />
              <span>সিট বরাদ্দ দিন</span>
            </Link>
          </Button>
        </div>
      </div>

      {/* Metrics Counter Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, idx) => {
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
          <span className="font-bold text-slate-800">হোস্টেল আসন পূর্ণতার হার (Occupancy Rate):</span>
          <span className="font-extrabold text-emerald-700">৮২.৬% পূর্ণ (১২৪/১৫০)</span>
        </div>
        <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden">
          <div className="h-full bg-emerald-600 rounded-full" style={{ width: '82.6%' }} />
        </div>
        <div className="flex justify-between text-xs text-slate-500 pt-1">
          <span>মোট রুম: ৩৮ টি</span>
          <span>বরাদ্দকৃত বেড: ১২৪ টি</span>
          <span className="text-emerald-700 font-semibold">খালি বেড: ২৬ টি</span>
        </div>
      </div>

      {/* Two Column Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Admissions */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b pb-3">
            <div>
              <h3 className="font-bold text-base text-slate-900">সর্বশেষ ভর্তি আবেদন</h3>
              <p className="text-xs text-slate-500">অনলাইন থেকে জমাকৃত আবেদনসমূহ</p>
            </div>
            <Button asChild variant="ghost" size="sm" className="text-xs text-emerald-700 gap-1">
              <Link to="/admin/admissions">
                <span>সব দেখুন</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </Button>
          </div>

          <div className="space-y-3">
            {INITIAL_MOCK_ADMISSIONS.slice(0, 3).map((adm) => (
              <div
                key={adm.id}
                className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100 hover:bg-slate-100/60 transition-colors"
              >
                <div>
                  <div className="font-bold text-sm text-slate-800">{adm.applicantName}</div>
                  <div className="text-xs text-slate-500 font-mono">{adm.applicationNumber} • {adm.appliedAt}</div>
                </div>
                <div className="flex items-center gap-2">
                  <StatusBadge status={adm.status} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Payment Records */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b pb-3">
            <div>
              <h3 className="font-bold text-base text-slate-900">সাম্প্রতিক পেমেন্ট কালেকশন</h3>
              <p className="text-xs text-slate-500">নভেম্বর ২০২৬ সেশনের সংগৃহীত ভাড়া</p>
            </div>
            <Button asChild variant="ghost" size="sm" className="text-xs text-emerald-700 gap-1">
              <Link to="/admin/payments">
                <span>সব দেখুন</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </Button>
          </div>

          <div className="space-y-3">
            {INITIAL_MOCK_PAYMENTS.slice(0, 3).map((pay) => (
              <div
                key={pay.id}
                className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100 hover:bg-slate-100/60 transition-colors"
              >
                <div>
                  <div className="font-bold text-sm text-slate-800">{pay.studentName}</div>
                  <div className="text-xs text-slate-500">রুম {pay.roomNumber} • {pay.receiptNumber}</div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-sm text-emerald-700">৳ {pay.paidAmount.toLocaleString()}</div>
                  <StatusBadge status={pay.status} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Pending Complaints Overview */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b pb-3">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-amber-600" />
            <h3 className="font-bold text-base text-slate-900">সক্রিয় অভিযোগসমূহ (Active Complaints)</h3>
          </div>
          <Button asChild variant="outline" size="sm" className="text-xs gap-1">
            <Link to="/admin/complaints">
              <span>অভিযোগ ব্যবস্থাপনা</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {INITIAL_MOCK_COMPLAINTS.map((comp) => (
            <div key={comp.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-2">
              <div className="flex justify-between items-start">
                <span className="text-[11px] font-mono text-slate-400">{comp.ticketNo}</span>
                <StatusBadge status={comp.status} />
              </div>
              <h4 className="text-xs font-bold text-slate-800 line-clamp-1">{comp.subject}</h4>
              <p className="text-xs text-slate-500 line-clamp-2">{comp.description}</p>
              <div className="text-[11px] text-slate-400 pt-2 border-t border-slate-200">
                শিক্ষার্থী: {comp.studentName} (রুম {comp.roomNumber})
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
