import React from 'react';
import { Link } from 'react-router-dom';
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
  CheckCircle2,
  Clock,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/ui/status-badge';
import {
  CURRENT_STUDENT_PROFILE,
  CURRENT_STUDENT_ALLOCATION,
  INITIAL_STUDENT_INVOICES,
  INITIAL_STUDENT_COMPLAINTS,
  STUDENT_NOTICES,
} from './mock-data/student-mock-data';

export const StudentDashboardPage: React.FC = () => {
  const currentDueInvoice = INITIAL_STUDENT_INVOICES.find((inv) => inv.status === 'DUE');
  const activeComplaints = INITIAL_STUDENT_COMPLAINTS.filter((c) => c.status !== 'RESOLVED');

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-emerald-800 to-teal-900 text-white rounded-2xl p-6 sm:p-8 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 bg-emerald-700/50 text-emerald-200 px-3 py-1 rounded-full text-xs font-medium border border-emerald-600/40">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-300" />
            <span>হোস্টেল আবাসিক শিক্ষার্থী ড্যাশবোর্ড</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            স্বাগতম, {CURRENT_STUDENT_PROFILE.name}!
          </h2>
          <p className="text-emerald-100 text-xs sm:text-sm max-w-xl leading-relaxed">
            বিভাগ: {CURRENT_STUDENT_PROFILE.department} • সেশন: {CURRENT_STUDENT_PROFILE.session}
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <Button asChild className="bg-white text-emerald-900 hover:bg-emerald-50 gap-2 shadow-xs">
            <Link to="/student/payments">
              <CreditCard className="w-4 h-4 text-emerald-700" />
              <span>ভাড়া পরিশোধ করুন</span>
            </Link>
          </Button>
          <Button
            asChild
            variant="outline"
            className="border-emerald-600 text-white hover:bg-emerald-800/80 gap-2"
          >
            <Link to="/student/complaints">
              <MessageSquarePlus className="w-4 h-4 text-emerald-300" />
              <span>অভিযোগ জমা দিন</span>
            </Link>
          </Button>
        </div>
      </div>

      {/* Key Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Allocated Bed Card */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-3">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">বরাদ্দকৃত সিট</span>
            <div className="h-9 w-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Bed className="w-5 h-5" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-black text-slate-900">
              রুম {CURRENT_STUDENT_ALLOCATION.roomNumber} ({CURRENT_STUDENT_ALLOCATION.bedCode})
            </div>
            <p className="text-xs text-slate-500 mt-1">
              {CURRENT_STUDENT_ALLOCATION.floorName}
            </p>
          </div>
          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-slate-400">রুমমেট:</span>
            <span className="font-semibold text-slate-700">মেহেদী হাসান (বেড B)</span>
          </div>
        </div>

        {/* Current Due / Billing Status Card */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-3">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">চলতি বিলিং অবস্থা</span>
            <div className="h-9 w-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Receipt className="w-5 h-5" />
            </div>
          </div>
          <div>
            {currentDueInvoice ? (
              <>
                <div className="text-2xl font-black text-amber-600">
                  ৳ {currentDueInvoice.amount.toLocaleString()}
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  {currentDueInvoice.billingPeriod} • বকেয়া
                </p>
              </>
            ) : (
              <>
                <div className="text-2xl font-black text-emerald-600">পরিশোধিত</div>
                <p className="text-xs text-slate-500 mt-1">সকল বকেয়া পরিশোধিত আছে</p>
              </>
            )}
          </div>
          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-slate-400">সর্বশেষ পরিশোধ:</span>
            <span className="font-semibold text-emerald-700">০৩ নভেম্বর (৳ ৮,০০০)</span>
          </div>
        </div>

        {/* Active Complaints Status Card */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-3">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">অভিযোগ অবস্থা</span>
            <div className="h-9 w-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <AlertCircle className="w-5 h-5" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-black text-slate-900">
              {activeComplaints.length} টি সক্রিয়
            </div>
            <p className="text-xs text-slate-500 mt-1">
              {activeComplaints.length > 0 ? '১টি প্রক্রিয়াধীন (In Progress)' : 'কোনো সক্রিয় সমস্যা নেই'}
            </p>
          </div>
          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-slate-400">মোট সমাধানকৃত:</span>
            <span className="font-semibold text-emerald-700">২ টি সমাধান হয়েছে</span>
          </div>
        </div>

        {/* Recent Notices Card */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-3">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">জরুরি নোটিশ</span>
            <div className="h-9 w-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Bell className="w-5 h-5" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-black text-slate-900">
              {STUDENT_NOTICES.length} টি বিজ্ঞপ্তি
            </div>
            <p className="text-xs text-slate-500 mt-1">সর্বশেষ: ১৮ নভেম্বর, ২০২৬</p>
          </div>
          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-slate-400">ক্যাটাগরি:</span>
            <span className="font-semibold text-slate-700">সিট নবায়ন ও ডাইনিং</span>
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

          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/80 space-y-2">
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-500">ব্লক ও ফ্লোর:</span>
              <span className="font-bold text-slate-800">{CURRENT_STUDENT_ALLOCATION.blockName}</span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-500">রুম টাইপ:</span>
              <span className="font-bold text-slate-800">২ সিট (ডাবল শেয়ার্ড)</span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-500">মাসিক সিট ভাড়া:</span>
              <span className="font-extrabold text-emerald-700">
                ৳ {CURRENT_STUDENT_ALLOCATION.monthlyRent.toLocaleString()}
              </span>
            </div>
          </div>

          <div className="space-y-3 pt-1">
            <h4 className="text-xs font-bold text-slate-600 uppercase tracking-wider">রুমের সদস্যরা:</h4>
            {CURRENT_STUDENT_ALLOCATION.roommates.map((rm) => (
              <div
                key={rm.id}
                className="flex items-center justify-between p-3 rounded-xl border border-slate-100 bg-white hover:bg-slate-50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${
                      rm.isSelf
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                        : 'bg-slate-100 text-slate-700'
                    }`}
                  >
                    {rm.bedCode}
                  </div>
                  <div>
                    <div className="font-bold text-xs text-slate-900 flex items-center gap-1.5">
                      <span>{rm.name}</span>
                      {rm.isSelf && (
                        <span className="text-[10px] font-normal bg-emerald-50 text-emerald-700 px-1.5 rounded">
                          আপনি
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] text-slate-400">{rm.department}</div>
                  </div>
                </div>
                <span className="text-[11px] font-mono font-medium text-slate-600">{rm.phone}</span>
              </div>
            ))}
          </div>
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
            {INITIAL_STUDENT_COMPLAINTS.slice(0, 2).map((cmp) => (
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
                <p className="text-xs text-slate-600 leading-relaxed">{cmp.description}</p>
                {cmp.adminNote && (
                  <div className="p-2.5 bg-emerald-50/80 rounded-lg border border-emerald-200/60 text-xs text-emerald-900 flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold">প্রশাসনের প্রতিক্রিয়া: </span>
                      <span>{cmp.adminNote}</span>
                    </div>
                  </div>
                )}
                <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    <span>দাখিল: {cmp.submittedAt}</span>
                  </span>
                  {cmp.resolvedAt && <span>সমাধান: {cmp.resolvedAt}</span>}
                </div>
              </div>
            ))}
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
            {STUDENT_NOTICES.slice(0, 2).map((notice) => (
              <div
                key={notice.id}
                className="p-4 bg-slate-50 rounded-xl border border-slate-200/80 space-y-1.5"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                    {notice.category}
                  </span>
                  <span className="text-[11px] text-slate-400">{notice.publishedAt}</span>
                </div>
                <h4 className="font-bold text-sm text-slate-900">{notice.title}</h4>
                <p className="text-xs text-slate-600 line-clamp-2">{notice.content}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Payment Status Overview */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b pb-3">
            <div className="flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-emerald-600" />
              <h3 className="font-bold text-base text-slate-900">পেমেন্ট ইতিহাস ও রসিদ</h3>
            </div>
            <Link
              to="/student/payments"
              className="text-xs font-medium text-emerald-700 hover:underline flex items-center gap-1"
            >
              <span>সব রসিদ</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="space-y-3">
            {INITIAL_STUDENT_INVOICES.slice(0, 3).map((inv) => (
              <div
                key={inv.id}
                className="flex items-center justify-between p-3.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 transition-colors"
              >
                <div>
                  <div className="font-bold text-xs text-slate-900">{inv.billingPeriod}</div>
                  <div className="text-[11px] font-mono text-slate-400">
                    {inv.receiptNumber} {inv.paidAt ? `• পরিশোধ: ${inv.paidAt}` : ''}
                  </div>
                </div>
                <div className="text-right flex items-center gap-3">
                  <div>
                    <div className="text-xs font-extrabold text-slate-900">
                      ৳ {inv.amount.toLocaleString()}
                    </div>
                    <StatusBadge status={inv.status} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
