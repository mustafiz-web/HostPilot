import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  User,
  Mail,
  Phone,
  GraduationCap,
  MapPin,
  Heart,
  Shield,
  Edit,
  CheckCircle2,
  Calendar,
  Bed,
  Loader2,
  AlertCircle,
  RefreshCw,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { apiClient } from '@/lib/api-client';

interface StudentProfileResponse {
  id: string;
  studentCode: string;
  phone: string;
  department: string;
  rollNumber: string;
  session: string;
  batch: string;
  bloodGroup?: string;
  address: string;
  createdAt: string;
  user: {
    name: string;
    email: string;
  };
  guardians: Array<{
    name: string;
    relationship: string;
    phone: string;
    emergencyContact?: string;
  }>;
  activeAllocation?: {
    id: string;
    room?: { roomNumber: string };
    bed?: { bedCode: string };
  };
}

export const StudentProfilePage: React.FC = () => {
  const queryClient = useQueryClient();
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editSuccess, setEditSuccess] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);

  // Query: Student Own Profile
  const {
    data: profileResponse,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ['student-own-profile'],
    queryFn: async () => {
      const res = await apiClient.get<StudentProfileResponse>('/students/me/profile');
      return res.data;
    },
    staleTime: 60 * 1000,
  });

  const profile = profileResponse;

  const [editForm, setEditForm] = useState({
    phone: '',
    address: '',
    bloodGroup: '',
    guardianPhone: '',
  });

  // Populate edit form when modal opens
  const handleOpenEdit = () => {
    if (profile) {
      setEditForm({
        phone: profile.phone || '',
        address: profile.address || '',
        bloodGroup: profile.bloodGroup || '',
        guardianPhone: profile.guardians?.[0]?.phone || '',
      });
    }
    setEditError(null);
    setEditSuccess(false);
    setEditModalOpen(true);
  };

  // Mutation: Update permitted profile fields
  const updateProfileMutation = useMutation({
    mutationFn: async (payload: typeof editForm) => {
      if (!profile?.id) throw new Error('Student record not found');
      const res = await apiClient.patch(`/students/${profile.id}`, payload);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['student-own-profile'] });
      setEditSuccess(true);
      setTimeout(() => {
        setEditSuccess(false);
        setEditModalOpen(false);
      }, 1500);
    },
    onError: (err: any) => {
      setEditError(err.message || 'প্রোফাইল আপডেট করতে সমস্যা হয়েছে');
    },
  });

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setEditError(null);
    updateProfileMutation.mutate(editForm);
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-20 w-full rounded-2xl" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Skeleton className="h-80 rounded-2xl" />
          <div className="lg:col-span-2 space-y-6">
            <Skeleton className="h-40 rounded-2xl" />
            <Skeleton className="h-40 rounded-2xl" />
          </div>
        </div>
      </div>
    );
  }

  if (isError || !profile) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-4">
        <AlertCircle className="w-12 h-12 text-rose-500 mx-auto" />
        <h3 className="text-lg font-bold text-slate-800">প্রোফাইল তথ্য লোড করা যায়নি</h3>
        <p className="text-xs text-slate-500 max-w-sm mx-auto">
          {(error as any)?.message || 'সার্ভার থেকে শিক্ষার্থীর প্রোফাইল সংগ্রহে সমস্যা হয়েছে।'}
        </p>
        <Button onClick={() => refetch()} variant="outline" size="sm" className="gap-2">
          <RefreshCw className="w-4 h-4" />
          <span>পুনরায় লোড করুন</span>
        </Button>
      </div>
    );
  }

  const primaryGuardian = profile.guardians?.[0];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
            <User className="w-6 h-6 text-emerald-600" />
            <span>আমার ব্যক্তিগত প্রোফাইল (My Profile)</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-500">
            শিক্ষার্থীর প্রাতিষ্ঠানিক তথ্য, অভিভাবকের বিবরণ এবং যোগাযোগের ঠিকানা
          </p>
        </div>
        <Button onClick={handleOpenEdit} className="gap-2 shadow-xs self-start sm:self-auto bg-emerald-600 hover:bg-emerald-700">
          <Edit className="w-4 h-4" />
          <span>প্রোফাইল সম্পাদনা</span>
        </Button>
      </div>

      {/* Main Profile Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: ID Card */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs text-center space-y-4">
          <div className="w-24 h-24 rounded-full bg-emerald-100 text-emerald-800 text-3xl font-black flex items-center justify-center mx-auto border-4 border-emerald-50 shadow-xs">
            {profile.user?.name ? profile.user.name.charAt(0) : 'S'}
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900">{profile.user?.name}</h3>
            <p className="text-xs font-mono font-medium text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full inline-block mt-1">
              {profile.studentCode}
            </p>
          </div>

          <div className="pt-4 border-t border-slate-100 text-left space-y-2.5 text-xs">
            <div className="flex items-center gap-2 text-slate-600">
              <GraduationCap className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{profile.department}</span>
            </div>
            <div className="flex items-center gap-2 text-slate-600">
              <Mail className="w-4 h-4 text-emerald-600 shrink-0" />
              <span className="font-mono">{profile.user?.email}</span>
            </div>
            <div className="flex items-center gap-2 text-slate-600">
              <Phone className="w-4 h-4 text-emerald-600 shrink-0" />
              <span className="font-mono">{profile.phone}</span>
            </div>
            <div className="flex items-center gap-2 text-slate-600">
              <Calendar className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>
                নিবন্ধনের তারিখ:{' '}
                {new Date(profile.createdAt).toLocaleDateString('bn-BD', {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric',
                })}
              </span>
            </div>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 text-left">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-800 mb-1">
              <Bed className="w-4 h-4 text-emerald-600" />
              <span>বর্তমান সিট বরাদ্দ</span>
            </div>
            <p className="text-xs text-slate-600">
              {profile.activeAllocation ? (
                `রুম ${profile.activeAllocation.room?.roomNumber || '১০১'} (বেড ${profile.activeAllocation.bed?.bedCode || 'A'})`
              ) : (
                <span className="text-slate-400 italic">কোনো সিট বরাদ্দ নেই</span>
              )}
            </p>
          </div>
        </div>

        {/* Right Columns: Detailed Information Sections */}
        <div className="lg:col-span-2 space-y-6">
          {/* Academic Details Card */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
            <div className="flex items-center gap-2 border-b pb-3">
              <GraduationCap className="w-5 h-5 text-emerald-600" />
              <h3 className="font-bold text-base text-slate-900">একাডেমিক তথ্য (Academic Details)</h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <span className="text-slate-400 block mb-0.5">রোল / রেজিস্ট্রেশন নম্বর:</span>
                <span className="font-mono font-bold text-slate-800 text-sm">
                  {profile.rollNumber}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block mb-0.5">বিভাগ:</span>
                <span className="font-bold text-slate-800 text-sm">
                  {profile.department}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block mb-0.5">শিক্ষাবর্ষ (Session):</span>
                <span className="font-bold text-slate-800">{profile.session}</span>
              </div>
              <div>
                <span className="text-slate-400 block mb-0.5">ব্যাচ (Batch):</span>
                <span className="font-bold text-slate-800">{profile.batch}</span>
              </div>
            </div>
          </div>

          {/* Personal & Emergency Details Card */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
            <div className="flex items-center gap-2 border-b pb-3">
              <Shield className="w-5 h-5 text-emerald-600" />
              <h3 className="font-bold text-base text-slate-900">ব্যক্তিগত ও অভিভাবকের তথ্য</h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <span className="text-slate-400 block mb-0.5">রক্তের গ্রুপ (Blood Group):</span>
                <span className="font-bold text-rose-600 text-sm flex items-center gap-1">
                  <Heart className="w-3.5 h-3.5 fill-rose-600 text-rose-600" />
                  {profile.bloodGroup || 'অজানা'}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block mb-0.5">যোগাযোগ নম্বর:</span>
                <span className="font-mono font-bold text-slate-800 text-sm">
                  {profile.phone}
                </span>
              </div>
              {primaryGuardian && (
                <>
                  <div>
                    <span className="text-slate-400 block mb-0.5">অভিভাবকের নাম ও সম্পর্ক:</span>
                    <span className="font-bold text-slate-800">
                      {primaryGuardian.name} ({primaryGuardian.relationship})
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block mb-0.5">অভিভাবকের মোবাইল:</span>
                    <span className="font-mono font-bold text-slate-800 text-sm">
                      {primaryGuardian.phone}
                    </span>
                  </div>
                </>
              )}
            </div>

            <div className="pt-3 border-t border-slate-100 text-xs">
              <span className="text-slate-400 block mb-0.5 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-slate-400" />
                <span>স্থায়ী ঠিকানা (Permanent Address):</span>
              </span>
              <p className="text-slate-700 font-medium leading-relaxed">
                {profile.address}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Profile Modal Dialog */}
      <Dialog open={editModalOpen} onOpenChange={setEditModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-base font-bold flex items-center gap-2">
              <Edit className="w-5 h-5 text-emerald-600" />
              <span>যোগাযোগ তথ্য সম্পাদনা</span>
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-500">
              শিক্ষার্থী সরাসরি মোবাইল নম্বর, ঠিকানা ও রক্তের গ্রুপ আপডেট করতে পারবেন।
            </DialogDescription>
          </DialogHeader>

          {editSuccess ? (
            <div className="py-6 text-center space-y-2">
              <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto" />
              <h4 className="text-sm font-bold text-slate-800">প্রোফাইল সফলভাবে আপডেট হয়েছে!</h4>
            </div>
          ) : (
            <form onSubmit={handleEditSubmit} className="space-y-4 py-2 text-xs">
              {editError && (
                <Alert variant="destructive" className="bg-rose-50 border-rose-200 text-rose-800 text-xs">
                  <AlertCircle className="w-4 h-4 text-rose-600" />
                  <AlertDescription>{editError}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-1">
                <Label htmlFor="edit-phone" className="text-xs">
                  মোবাইল নম্বর
                </Label>
                <Input
                  id="edit-phone"
                  required
                  value={editForm.phone}
                  onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                  className="h-9 text-xs font-mono"
                />
              </div>

              <div className="space-y-1">
                <Label htmlFor="edit-blood" className="text-xs">
                  রক্তের গ্রুপ
                </Label>
                <Input
                  id="edit-blood"
                  placeholder="e.g. B+"
                  value={editForm.bloodGroup}
                  onChange={(e) => setEditForm({ ...editForm, bloodGroup: e.target.value })}
                  className="h-9 text-xs"
                />
              </div>

              <div className="space-y-1">
                <Label htmlFor="edit-address" className="text-xs">
                  স্থায়ী ঠিকানা
                </Label>
                <Input
                  id="edit-address"
                  required
                  value={editForm.address}
                  onChange={(e) => setEditForm({ ...editForm, address: e.target.value })}
                  className="h-9 text-xs"
                />
              </div>

              <DialogFooter className="gap-2 pt-2">
                <Button type="button" variant="outline" size="sm" onClick={() => setEditModalOpen(false)}>
                  বাতিল
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  disabled={updateProfileMutation.isPending}
                  className="bg-emerald-600 hover:bg-emerald-700"
                >
                  {updateProfileMutation.isPending ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" />
                      <span>সংরক্ষণ হচ্ছে...</span>
                    </>
                  ) : (
                    <span>পরিবর্তন সংরক্ষণ করুন</span>
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
