import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  UserPlus,
  Search,
  CheckCircle2,
  XCircle,
  Eye,
  Phone,
  Mail,
  Loader2,
  AlertCircle,
  RefreshCw,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { StatusBadge } from '@/components/ui/status-badge';
import { Skeleton } from '@/components/ui/skeleton';
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
import { apiClient } from '@/lib/api-client';

interface AdmissionApplication {
  id: string;
  applicationNumber: string;
  applicantName: string;
  email: string;
  phone: string;
  gender: 'MALE' | 'FEMALE' | 'OTHER';
  dateOfBirth: string;
  bloodGroup?: string;
  address: string;
  preferredRoomType: 'SINGLE' | 'DOUBLE' | 'QUAD';
  guardianName: string;
  guardianRelation: string;
  guardianPhone: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'WITHDRAWN';
  appliedAt: string;
  decisionNote?: string;
  reviewedByUser?: {
    name: string;
  };
}

export const AdmissionsPage: React.FC = () => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'PENDING' | 'APPROVED' | 'REJECTED'>('ALL');
  const [selectedApp, setSelectedApp] = useState<AdmissionApplication | null>(null);
  const [decisionNote, setDecisionNote] = useState('');

  // Query: Get admissions from MySQL API
  const {
    data: admissionsResponse,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ['admin-admissions', { search: searchTerm, status: statusFilter }],
    queryFn: async () => {
      const res = await apiClient.get<AdmissionApplication[]>('/admissions', {
        search: searchTerm || undefined,
        status: statusFilter === 'ALL' ? undefined : statusFilter,
      });
      return res;
    },
    staleTime: 30 * 1000,
  });

  const admissions = admissionsResponse?.data || [];

  // Mutation: Update application status
  const decisionMutation = useMutation({
    mutationFn: async ({
      id,
      status,
      note,
    }: {
      id: string;
      status: 'APPROVED' | 'REJECTED';
      note?: string;
    }) => {
      const res = await apiClient.patch<AdmissionApplication>(`/admissions/${id}/status`, {
        status,
        decisionNote: note,
      });
      return res.data;
    },
    onSuccess: (updated) => {
      queryClient.invalidateQueries({ queryKey: ['admin-admissions'] });
      queryClient.invalidateQueries({ queryKey: ['admin-students'] });
      queryClient.invalidateQueries({ queryKey: ['admin-dashboard-metrics'] });
      if (selectedApp?.id === updated.id) {
        setSelectedApp(updated);
      }
    },
  });

  const handleDecision = (id: string, newStatus: 'APPROVED' | 'REJECTED') => {
    decisionMutation.mutate({ id, status: newStatus, note: decisionNote });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
            <UserPlus className="w-6 h-6 text-emerald-600" />
            <span>{t('admin.admissions.title')}</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-500">
            {t('admin.admissions.subtitle')}
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <Input
            placeholder={t('admin.students.search_placeholder')}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 h-9 text-xs sm:text-sm"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          <span className="text-xs text-slate-500 font-medium">{t('common.status')}:</span>
          <Button
            size="sm"
            variant={statusFilter === 'ALL' ? 'default' : 'outline'}
            onClick={() => setStatusFilter('ALL')}
            className="text-xs rounded-full h-8"
          >
            {t('common.all')} ({admissions.length})
          </Button>
          <Button
            size="sm"
            variant={statusFilter === 'PENDING' ? 'default' : 'outline'}
            onClick={() => setStatusFilter('PENDING')}
            className="text-xs rounded-full h-8"
          >
            {t('status.pending')}
          </Button>
          <Button
            size="sm"
            variant={statusFilter === 'APPROVED' ? 'default' : 'outline'}
            onClick={() => setStatusFilter('APPROVED')}
            className="text-xs rounded-full h-8"
          >
            {t('status.approved')}
          </Button>
          <Button
            size="sm"
            variant={statusFilter === 'REJECTED' ? 'default' : 'outline'}
            onClick={() => setStatusFilter('REJECTED')}
            className="text-xs rounded-full h-8"
          >
            {t('status.rejected')}
          </Button>
        </div>
      </div>

      {/* Table Card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        {isLoading ? (
          <div className="p-8 space-y-4">
            <div className="flex items-center justify-center gap-2 text-slate-500 text-sm">
              <Loader2 className="w-5 h-5 animate-spin text-emerald-600" />
              <span>আবেদন তালিকা লোড হচ্ছে...</span>
            </div>
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
        ) : isError ? (
          <div className="p-8 text-center space-y-3">
            <AlertCircle className="w-8 h-8 text-rose-500 mx-auto" />
            <p className="text-sm text-slate-700 font-medium">
              {(error as any)?.message || 'আবেদন তালিকা লোড করতে সমস্যা হয়েছে'}
            </p>
            <Button variant="outline" size="sm" onClick={() => refetch()} className="gap-1.5">
              <RefreshCw className="w-3.5 h-3.5" />
              <span>পুনরায় চেষ্টা করুন</span>
            </Button>
          </div>
        ) : admissions.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <UserPlus className="w-12 h-12 text-slate-300 mx-auto" />
            <h4 className="text-base font-bold text-slate-800">কোনো ভর্তি আবেদন নেই</h4>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              পাবলিক ওয়েবসাইটের আবেদন ফর্মের মাধ্যমে ছাত্ররা আবেদন জমা দিলে এখানে তালিকাভুক্ত হবে।
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-50/80">
                  <TableHead className="font-semibold text-xs">{t('admin.admissions.th_app_no')}</TableHead>
                  <TableHead className="font-semibold text-xs">{t('admin.admissions.th_applicant')}</TableHead>
                  <TableHead className="font-semibold text-xs">{t('admin.admissions.th_room_pref')}</TableHead>
                  <TableHead className="font-semibold text-xs">{t('admin.admissions.th_date')}</TableHead>
                  <TableHead className="font-semibold text-xs">{t('admin.admissions.th_status')}</TableHead>
                  <TableHead className="font-semibold text-xs text-right">{t('admin.admissions.th_actions')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {admissions.map((app) => (
                  <TableRow key={app.id} className="hover:bg-slate-50/50">
                    <TableCell className="font-mono text-xs font-semibold text-slate-700">
                      {app.applicationNumber}
                    </TableCell>
                    <TableCell>
                      <div className="space-y-0.5">
                        <p className="text-xs font-bold text-slate-900">{app.applicantName}</p>
                        <div className="flex items-center gap-3 text-[11px] text-slate-500">
                          <span className="flex items-center gap-1">
                            <Mail className="w-3 h-3 text-slate-400" />
                            {app.email}
                          </span>
                          <span className="flex items-center gap-1 font-mono">
                            <Phone className="w-3 h-3 text-slate-400" />
                            {app.phone}
                          </span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-xs text-slate-700 font-medium">
                      <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-mono text-[11px]">
                        {app.preferredRoomType === 'SINGLE'
                          ? 'একক রুম (Single)'
                          : app.preferredRoomType === 'DOUBLE'
                          ? 'দ্বৈত রুম (Double)'
                          : '৪-সিটার রুম (Quad)'}
                      </span>
                    </TableCell>
                    <TableCell className="text-xs text-slate-500">
                      {new Date(app.appliedAt).toLocaleDateString('bn-BD', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      })}
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={app.status} />
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0"
                          onClick={() => {
                            setSelectedApp(app);
                            setDecisionNote(app.decisionNote || '');
                          }}
                          title="বিস্তারিত দেখুন"
                        >
                          <Eye className="w-4 h-4 text-slate-600" />
                        </Button>
                        {app.status === 'PENDING' && (
                          <>
                            <Button
                              variant="ghost"
                              size="sm"
                              disabled={decisionMutation.isPending}
                              className="h-8 w-8 p-0 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50"
                              onClick={() => handleDecision(app.id, 'APPROVED')}
                              title="অনুমোদন করুন"
                            >
                              <CheckCircle2 className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              disabled={decisionMutation.isPending}
                              className="h-8 w-8 p-0 text-rose-600 hover:text-rose-700 hover:bg-rose-50"
                              onClick={() => handleDecision(app.id, 'REJECTED')}
                              title="বাতিল করুন"
                            >
                              <XCircle className="w-4 h-4" />
                            </Button>
                          </>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>

      {/* Review Dialog */}
      {selectedApp && (
        <Dialog open={!!selectedApp} onOpenChange={() => setSelectedApp(null)}>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle className="text-base font-bold flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-emerald-600" />
                <span>ভর্তি আবেদনের বিস্তারিত তথ্য</span>
              </DialogTitle>
              <DialogDescription className="text-xs text-slate-500 font-mono">
                আবেদন নং: {selectedApp.applicationNumber}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-2 text-xs">
              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                <div>
                  <h4 className="font-bold text-sm text-slate-900">{selectedApp.applicantName}</h4>
                  <p className="text-[11px] text-slate-500">
                    লিঙ্গ: {selectedApp.gender === 'MALE' ? 'পুরুষ' : 'মহিলা'} • রক্ত: {selectedApp.bloodGroup || 'অজানা'}
                  </p>
                </div>
                <StatusBadge status={selectedApp.status} />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-2.5 bg-slate-50 rounded-lg">
                  <span className="text-[10px] text-slate-400 block uppercase">যোগাযোগ নম্বর</span>
                  <p className="font-semibold text-slate-800 font-mono">{selectedApp.phone}</p>
                  <p className="text-[11px] text-slate-500 truncate">{selectedApp.email}</p>
                </div>
                <div className="p-2.5 bg-slate-50 rounded-lg">
                  <span className="text-[10px] text-slate-400 block uppercase">পছন্দের রুমের ধরন</span>
                  <p className="font-semibold text-slate-800">{selectedApp.preferredRoomType}</p>
                </div>
              </div>

              <div className="p-3 bg-emerald-50/60 rounded-xl border border-emerald-100">
                <span className="text-[10px] text-emerald-800 font-bold block uppercase mb-1">
                  অভিভাবকের বিবরণ
                </span>
                <p className="font-semibold text-slate-900">
                  {selectedApp.guardianName} ({selectedApp.guardianRelation})
                </p>
                <p className="text-[11px] text-slate-600 font-mono">মোবাইল: {selectedApp.guardianPhone}</p>
              </div>

              <div className="p-2.5 bg-slate-50 rounded-lg">
                <span className="text-[10px] text-slate-400 block uppercase">স্থায়ী ঠিকানা</span>
                <p className="text-slate-800">{selectedApp.address}</p>
              </div>

              {selectedApp.decisionNote && (
                <div className="p-2.5 bg-amber-50 rounded-lg border border-amber-200">
                  <span className="text-[10px] text-amber-800 font-bold block uppercase">সিদ্ধান্তের নোট</span>
                  <p className="text-slate-800">{selectedApp.decisionNote}</p>
                </div>
              )}
            </div>

            <DialogFooter className="gap-2 flex-col sm:flex-row">
              <Button size="sm" variant="outline" onClick={() => setSelectedApp(null)}>
                বন্ধ করুন
              </Button>
              {selectedApp.status === 'PENDING' && (
                <>
                  <Button
                    size="sm"
                    variant="destructive"
                    disabled={decisionMutation.isPending}
                    onClick={() => handleDecision(selectedApp.id, 'REJECTED')}
                    className="bg-rose-600 hover:bg-rose-700"
                  >
                    আবেদন বাতিল
                  </Button>
                  <Button
                    size="sm"
                    disabled={decisionMutation.isPending}
                    onClick={() => handleDecision(selectedApp.id, 'APPROVED')}
                    className="bg-emerald-600 hover:bg-emerald-700"
                  >
                    আবেদন অনুমোদন
                  </Button>
                </>
              )}
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};
