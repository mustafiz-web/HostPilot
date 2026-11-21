import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Bed,
  Users,
  Wifi,
  Sparkles,
  CheckCircle2,
  Calendar,
  AlertCircle,
  Loader2,
  RefreshCw,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { apiClient } from '@/lib/api-client';
import { formatCurrency, formatDate } from '@/lib/formatters';

interface StudentDashboardData {
  profile: {
    name: string;
    studentCode: string;
    phone: string;
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
}

export const StudentRoomPage: React.FC = () => {
  const { t, i18n } = useTranslation();
  const isEn = i18n.language?.startsWith('en');
  const queryClient = useQueryClient();
  const [changeModalOpen, setChangeModalOpen] = useState(false);
  const [changeReason, setChangeReason] = useState('');
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const {
    data: dashboardData,
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

  // Mutation: Submit Room Change Request as a complaint
  const changeRequestMutation = useMutation({
    mutationFn: async (reason: string) => {
      const res = await apiClient.post('/complaints', {
        title: isEn ? 'Room Change Request' : 'রুম পরিবর্তনের আবেদন (Room Change Request)',
        category: 'OTHER',
        priority: 'MEDIUM',
        description: reason,
      });
      return res.data;
    },
    onSuccess: () => {
      setSubmitSuccess(true);
      queryClient.invalidateQueries({ queryKey: ['student-dashboard-metrics'] });
      setTimeout(() => {
        setSubmitSuccess(false);
        setChangeModalOpen(false);
        setChangeReason('');
      }, 2000);
    },
    onError: (err: any) => {
      setSubmitError(
        err.message ||
          (isEn
            ? 'Failed to submit room change request.'
            : 'আবেদন দাখিল করতে সমস্যা হয়েছে।')
      );
    },
  });

  const handleRoomChangeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!changeReason.trim()) return;
    setSubmitError(null);
    changeRequestMutation.mutate(changeReason);
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-20 w-full rounded-2xl" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Skeleton className="lg:col-span-2 h-96 rounded-2xl" />
          <Skeleton className="h-96 rounded-2xl" />
        </div>
      </div>
    );
  }

  if (isError || !dashboardData) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-4">
        <AlertCircle className="w-12 h-12 text-rose-500 mx-auto" />
        <h3 className="text-lg font-bold text-slate-800">
          {isEn ? 'Failed to fetch room information' : 'রুম তথ্য সংগ্রহ করা যায়নি'}
        </h3>
        <p className="text-xs text-slate-500 max-w-sm mx-auto">
          {(error as any)?.message || (isEn ? 'Unable to load seat allocation data from server.' : 'সার্ভার থেকে সিট বরাদ্দের তথ্য পাওয়া যায়নি।')}
        </p>
        <Button onClick={() => refetch()} variant="outline" size="sm" className="gap-2">
          <RefreshCw className="w-4 h-4" />
          <span>{t('common.retry')}</span>
        </Button>
      </div>
    );
  }

  const { allocation, roommates, profile } = dashboardData;

  const defaultAmenities = [
    t('student.room.amenity_table', 'Personal Study Desk & Chair'),
    t('student.room.amenity_wifi', '24/7 High-Speed Wi-Fi'),
    t('student.room.amenity_closet', 'Personal Wardrobe / Locker'),
    t('student.room.amenity_cleaning', 'Regular Housekeeping & Sanitation'),
    t('student.room.amenity_power', 'Uninterrupted Electricity & Backup'),
    isEn ? 'Safe Filtered Drinking Water' : 'নিরাপদ ফিল্টার করা খাবার পানি',
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
            <Bed className="w-6 h-6 text-emerald-600" />
            <span>{t('student.room.title')}</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-500">
            {t('student.room.subtitle')}
          </p>
        </div>
        {allocation && (
          <Button
            variant="outline"
            onClick={() => {
              setSubmitError(null);
              setSubmitSuccess(false);
              setChangeModalOpen(true);
            }}
            className="gap-2 shadow-xs self-start sm:self-auto border-emerald-600 text-emerald-700 hover:bg-emerald-50"
          >
            <Sparkles className="w-4 h-4 text-emerald-600" />
            <span>{isEn ? 'Request Room Change' : 'রুম পরিবর্তনের আবেদন'}</span>
          </Button>
        )}
      </div>

      {!allocation ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-4">
          <Bed className="w-16 h-16 text-slate-300 mx-auto" />
          <h3 className="text-lg font-bold text-slate-800">{t('student.dashboard.no_room')}</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
            {t('student.room.not_allocated')}
          </p>
        </div>
      ) : (
        /* Main Grid: Room Spec Card + Roommate Card */
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Room Spec Card */}
          <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-2xl sm:text-3xl font-black text-slate-900">
                    {t('student.room.room_number')} {allocation.roomNumber}
                  </span>
                  <span className="bg-emerald-100 text-emerald-800 font-extrabold px-3 py-1 rounded-full text-xs border border-emerald-300">
                    {t('student.room.bed_code')} {allocation.bedCode}
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  {t('student.room.floor')}: {allocation.floor} • {t('student.room.room_type')}: {allocation.roomType}
                </p>
              </div>
              <div className="sm:text-right">
                <div className="text-xl sm:text-2xl font-black text-emerald-700">
                  {formatCurrency(allocation.monthlyRent, i18n.language)}
                </div>
                <span className="text-xs text-slate-400">{t('student.room.monthly_charge')}</span>
              </div>
            </div>

            {/* Quick Specifications */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs">
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/80">
                <span className="text-slate-400 block mb-1">
                  {isEn ? 'Room Type:' : 'রুমের ধরন:'}
                </span>
                <span className="font-bold text-slate-800 text-sm">{allocation.roomType}</span>
              </div>
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/80">
                <span className="text-slate-400 block mb-1">
                  {isEn ? 'Allocation Date:' : 'বরাদ্দের তারিখ:'}
                </span>
                <span className="font-bold text-slate-800 text-sm flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-slate-500" />
                  {formatDate(allocation.startDate, i18n.language)}
                </span>
              </div>
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/80 col-span-2 sm:col-span-1">
                <span className="text-slate-400 block mb-1">
                  {isEn ? 'Current Seat Status:' : 'বর্তমান সিট স্ট্যাটাস:'}
                </span>
                <span className="font-bold text-emerald-700 text-sm flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  {t('status.occupied')}
                </span>
              </div>
            </div>

            {/* Amenities & Facility List */}
            <div className="space-y-3">
              <h4 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                <Wifi className="w-4 h-4 text-emerald-600" />
                <span>{t('student.room.amenities_title', 'Room Amenities & Facilities:')}</span>
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {defaultAmenities.map((item, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-2.5 text-xs text-slate-700 bg-emerald-50/50 p-2.5 rounded-lg border border-emerald-100/70"
                  >
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Roommates Card */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
            <div className="flex items-center gap-2 border-b pb-3">
              <Users className="w-5 h-5 text-emerald-600" />
              <h3 className="font-bold text-base text-slate-900">
                {t('student.room.roommates_title', 'Roommates List')}
              </h3>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">
              {isEn
                ? 'Information of fellow residents living in this room for hostel coordination.'
                : 'হোস্টেলের জরুরি সমন্বয় ও সৌহার্দ্যপূর্ণ পরিবেশ বজায় রাখার স্বার্থে রুমমেটের মৌলিক তথ্য'}
            </p>

            <div className="space-y-3 pt-2">
              {/* Current Student's Own Bed */}
              <div className="p-4 rounded-xl border border-emerald-300 bg-emerald-50/40">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full font-bold flex items-center justify-center text-xs bg-emerald-600 text-white">
                    {allocation.bedCode}
                  </div>
                  <div>
                    <div className="font-bold text-sm text-slate-900 flex items-center gap-1.5">
                      <span>{profile.name}</span>
                      <span className="text-[10px] bg-emerald-600 text-white font-medium px-1.5 py-0.5 rounded">
                        {isEn ? 'You' : 'আপনি'}
                      </span>
                    </div>
                    <div className="text-xs text-slate-500 font-mono">
                      {isEn ? 'ID:' : 'আইডি:'} {profile.studentCode}
                    </div>
                  </div>
                </div>
              </div>

              {/* Other Roommates */}
              {roommates.length === 0 ? (
                <div className="p-4 rounded-xl border border-slate-100 bg-slate-50 text-center text-xs text-slate-400">
                  {t('student.dashboard.no_roommates')}
                </div>
              ) : (
                roommates.map((rm, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-xl border border-slate-200 bg-white hover:border-slate-300 transition-all"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full font-bold flex items-center justify-center text-xs bg-slate-100 text-slate-700 border border-slate-200">
                        {rm.bedCode}
                      </div>
                      <div>
                        <div className="font-bold text-sm text-slate-900">{rm.name}</div>
                        <div className="text-xs text-slate-500">{rm.department}</div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="p-3 bg-amber-50 rounded-xl border border-amber-200/80 text-xs text-amber-900 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <span>
                {isEn
                  ? 'If any room fixtures or furniture need maintenance, please submit a report in the complaints section.'
                  : 'রুমের কোনো ফার্নিচার বা ফিক্সচারের ক্ষয়ক্ষতি হলে তাৎক্ষণিকভাবে অভিযোগ সেকশনে রিপোর্ট করুন।'}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Room Change Request Dialog */}
      <Dialog open={changeModalOpen} onOpenChange={setChangeModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {isEn ? 'Request Room or Bed Change' : 'রুম বা সিট পরিবর্তনের আবেদন'}
            </DialogTitle>
            <DialogDescription>
              {isEn
                ? 'Submit an application to the hostel superintendent detailing your valid reason for room transfer.'
                : 'রুম পরিবর্তনের যৌক্তিক কারণ উল্লেখ করে হোস্টেল সুপারিনটেনডেন্ট বরাবর আবেদন জমা দিন।'}
            </DialogDescription>
          </DialogHeader>

          {submitError && (
            <Alert variant="destructive" className="bg-rose-50 border-rose-200 text-rose-800 text-xs">
              <AlertCircle className="w-4 h-4 text-rose-600" />
              <AlertDescription>{submitError}</AlertDescription>
            </Alert>
          )}

          {submitSuccess ? (
            <div className="p-6 bg-emerald-50 rounded-xl text-center space-y-2 border border-emerald-200">
              <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto" />
              <h4 className="font-bold text-emerald-900">
                {isEn ? 'Application Submitted Successfully!' : 'আবেদন সফলভাবে গৃহীত হয়েছে!'}
              </h4>
              <p className="text-xs text-emerald-700">
                {isEn
                  ? 'Your transfer request has been recorded. Administration will review it promptly.'
                  : 'আপনার আবেদনটি অভিযোগ/রিকোয়েস্ট ট্র্যাকিংয়ে নথিভুক্ত হয়েছে। কর্তৃপক্ষ দ্রুত পর্যালোচনা করবে।'}
              </p>
            </div>
          ) : (
            <form onSubmit={handleRoomChangeSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="currentRoom" className="text-xs font-semibold">
                  {isEn ? 'Current Room & Bed' : 'বর্তমান রুম ও সিট'}
                </Label>
                <div className="p-2.5 bg-slate-100 rounded-lg text-xs font-mono font-bold text-slate-800">
                  {allocation
                    ? isEn
                      ? `Room ${allocation.roomNumber} (Bed ${allocation.bedCode}) • Floor ${allocation.floor}`
                      : `রুম ${allocation.roomNumber} (বেড ${allocation.bedCode}) • ফ্লোর ${allocation.floor}`
                    : t('common.no_data')}
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="changeReason" className="text-xs font-semibold">
                  {isEn ? 'Reason for Change *' : 'রুম পরিবর্তনের কারণ *'}
                </Label>
                <Textarea
                  id="changeReason"
                  rows={3}
                  placeholder={
                    isEn
                      ? 'e.g. Need single room for quiet study / transfer to lower floor required...'
                      : 'যেমন: পড়াশোনার নীরবতার জন্য সিঙ্গেল রুমে স্থানান্তর প্রয়োজন / নিচতলায় স্থানান্তর প্রয়োজন...'
                  }
                  value={changeReason}
                  onChange={(e) => setChangeReason(e.target.value)}
                  required
                />
              </div>

              <DialogFooter className="gap-2 pt-2 flex-col sm:flex-row">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setChangeModalOpen(false)}
                >
                  {t('common.cancel')}
                </Button>
                <Button
                  type="submit"
                  disabled={changeRequestMutation.isPending}
                  className="bg-emerald-600 hover:bg-emerald-700"
                >
                  {changeRequestMutation.isPending ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" />
                      <span>{isEn ? 'Submitting...' : 'জমা হচ্ছে...'}</span>
                    </>
                  ) : (
                    <span>{t('common.submit')}</span>
                  )}
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};
