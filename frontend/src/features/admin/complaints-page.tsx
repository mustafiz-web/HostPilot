import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  MessageSquareWarning,
  Search,
  AlertCircle,
  Loader2,
  RefreshCw,
  Edit2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
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
import { formatDate, formatNumber } from '@/lib/formatters';

interface ComplaintItem {
  id: string;
  title: string;
  category: 'PLUMBING' | 'ELECTRICAL' | 'CLEANING' | 'DINING' | 'WIFI' | 'FURNITURE' | 'OTHER';
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  description: string;
  status: 'PENDING' | 'IN_PROGRESS' | 'RESOLVED' | 'REJECTED';
  adminNote?: string | null;
  createdAt: string;
  student?: {
    id: string;
    studentCode: string;
    department: string;
    user?: {
      name: string;
      email: string;
    };
  };
}

export const AdminComplaintsPage: React.FC = () => {
  const { t, i18n } = useTranslation();
  const isEn = i18n.language?.startsWith('en');
  const queryClient = useQueryClient();

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'PENDING' | 'IN_PROGRESS' | 'RESOLVED'>('ALL');
  const [selectedComp, setSelectedComp] = useState<ComplaintItem | null>(null);
  const [newStatus, setNewStatus] = useState<ComplaintItem['status']>('IN_PROGRESS');
  const [adminNote, setAdminNote] = useState('');

  // Query: Complaints from MySQL API
  const {
    data: complaintsResponse,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ['admin-complaints', { status: statusFilter }],
    queryFn: async () => {
      const res = await apiClient.get<ComplaintItem[]>('/complaints', {
        status: statusFilter === 'ALL' ? undefined : statusFilter,
      });
      return res;
    },
    staleTime: 30 * 1000,
  });

  const complaints = complaintsResponse?.data || [];

  const filtered = complaints.filter((c) => {
    if (!searchTerm.trim()) return true;
    const term = searchTerm.toLowerCase();
    return (
      c.title.toLowerCase().includes(term) ||
      c.description.toLowerCase().includes(term) ||
      c.student?.user?.name?.toLowerCase().includes(term) ||
      c.student?.studentCode?.toLowerCase().includes(term)
    );
  });

  // Mutation: Update status
  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status, note }: { id: string; status: string; note?: string }) => {
      const res = await apiClient.patch(`/complaints/${id}/status`, {
        status,
        adminNote: note,
      });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-complaints'] });
      queryClient.invalidateQueries({ queryKey: ['admin-dashboard-metrics'] });
      setSelectedComp(null);
      setAdminNote('');
    },
    onError: (err: any) => {
      alert(err.message || t('common.error_occurred'));
    },
  });

  const handleOpenUpdate = (comp: ComplaintItem) => {
    setSelectedComp(comp);
    setNewStatus(comp.status);
    setAdminNote(comp.adminNote || '');
  };

  const handleUpdateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedComp) return;
    updateStatusMutation.mutate({
      id: selectedComp.id,
      status: newStatus,
      note: adminNote.trim() || undefined,
    });
  };

  const pendingCount = complaints.filter((c) => c.status === 'PENDING').length;
  const inProgressCount = complaints.filter((c) => c.status === 'IN_PROGRESS').length;
  const resolvedCount = complaints.filter((c) => c.status === 'RESOLVED').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
            <MessageSquareWarning className="w-6 h-6 text-emerald-600" />
            <span>{t('admin.complaints.title')}</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-500">
            {t('admin.complaints.subtitle')}
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => refetch()}
          className="gap-1.5 text-xs text-slate-700"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>{t('common.refresh')}</span>
        </Button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <Input
            placeholder={isEn ? 'Search complaint title or student...' : 'অভিযোগের বিষয় বা শিক্ষার্থী দিয়ে খুঁজুন...'}
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
            {t('common.all')} ({formatNumber(complaints.length)})
          </Button>
          <Button
            size="sm"
            variant={statusFilter === 'PENDING' ? 'default' : 'outline'}
            onClick={() => setStatusFilter('PENDING')}
            className="text-xs rounded-full h-8"
          >
            {t('status.pending')} ({formatNumber(pendingCount)})
          </Button>
          <Button
            size="sm"
            variant={statusFilter === 'IN_PROGRESS' ? 'default' : 'outline'}
            onClick={() => setStatusFilter('IN_PROGRESS')}
            className="text-xs rounded-full h-8"
          >
            {t('status.in_progress')} ({formatNumber(inProgressCount)})
          </Button>
          <Button
            size="sm"
            variant={statusFilter === 'RESOLVED' ? 'default' : 'outline'}
            onClick={() => setStatusFilter('RESOLVED')}
            className="text-xs rounded-full h-8"
          >
            {t('status.resolved')} ({formatNumber(resolvedCount)})
          </Button>
        </div>
      </div>

      {/* Main Table Card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        {isLoading ? (
          <div className="p-8 space-y-4">
            <div className="flex items-center justify-center gap-2 text-slate-500 text-sm">
              <Loader2 className="w-5 h-5 animate-spin text-emerald-600" />
              <span>{t('common.loading')}</span>
            </div>
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
        ) : isError ? (
          <div className="p-8 text-center space-y-3">
            <AlertCircle className="w-8 h-8 text-rose-500 mx-auto" />
            <h3 className="text-lg font-bold text-slate-800">{isEn ? 'Failed to load complaints' : 'অভিযোগ তালিকা লোড করা যায়নি'}</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              {(error as any)?.message || t('common.error_occurred')}
            </p>
            <Button variant="outline" size="sm" onClick={() => refetch()} className="gap-1.5">
              <RefreshCw className="w-3.5 h-3.5" />
              <span>{t('common.retry')}</span>
            </Button>
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <MessageSquareWarning className="w-12 h-12 text-slate-300 mx-auto" />
            <h4 className="text-base font-bold text-slate-800">{t('admin.complaints.empty_complaints')}</h4>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              {isEn ? 'No complaints recorded matching the selected filter.' : 'প্রদত্ত ফিল্টারে কোনো অভিযোগ রেকর্ড নেই।'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-50/80">
                  <TableHead className="font-semibold text-xs">{t('admin.complaints.th_title')}</TableHead>
                  <TableHead className="font-semibold text-xs">{t('admin.complaints.th_student')}</TableHead>
                  <TableHead className="font-semibold text-xs">{t('admin.complaints.th_category')}</TableHead>
                  <TableHead className="font-semibold text-xs">{t('admin.complaints.th_date')}</TableHead>
                  <TableHead className="font-semibold text-xs">{t('admin.complaints.th_status')}</TableHead>
                  <TableHead className="font-semibold text-xs text-right">{t('common.actions')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((item) => (
                  <TableRow key={item.id} className="hover:bg-slate-50/50">
                    <TableCell className="max-w-xs">
                      <div className="space-y-0.5">
                        <span className="font-bold text-xs text-slate-900 block truncate">
                          {item.title}
                        </span>
                        <p className="text-[11px] text-slate-500 line-clamp-1">
                          {item.description}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-0.5">
                        <span className="font-bold text-xs text-slate-900 block">
                          {item.student?.user?.name || t('student.payments.student_lbl')}
                        </span>
                        <span className="text-[11px] text-slate-500 font-mono">
                          {item.student?.studentCode}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-xs">
                      <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-mono text-[11px]">
                        {item.category}
                      </span>
                    </TableCell>
                    <TableCell className="text-xs text-slate-500">
                      {formatDate(item.createdAt)}
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={item.status} />
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 text-xs text-emerald-700 hover:text-emerald-800 hover:bg-emerald-50 gap-1"
                        onClick={() => handleOpenUpdate(item)}
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                        <span>{isEn ? 'Update Status' : 'স্ট্যাটাস আপডেট'}</span>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>

      {/* Update Complaint Status Dialog */}
      {selectedComp && (
        <Dialog open={!!selectedComp} onOpenChange={() => setSelectedComp(null)}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="text-base font-bold flex items-center gap-2">
                <MessageSquareWarning className="w-5 h-5 text-emerald-600" />
                <span>{t('admin.complaints.dialog_update_title')}</span>
              </DialogTitle>
              <DialogDescription className="text-xs text-slate-500">
                {t('student.payments.student_lbl')}: {selectedComp.student?.user?.name} ({selectedComp.student?.studentCode})
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleUpdateSubmit} className="space-y-4 text-xs">
              <div className="p-3 bg-slate-50 rounded-xl space-y-1 text-xs">
                <span className="font-bold block text-slate-900 mb-1">{isEn ? 'Student Statement:' : 'শিক্ষার্থীর বক্তব্য:'}</span>
                <p className="text-slate-700">{selectedComp.description}</p>
              </div>

              <div className="space-y-1.5">
                <Label>{isEn ? 'Select New Status *' : 'নতুন স্ট্যাটাস নির্ধারণ করুন *'}</Label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value as any)}
                  className="w-full h-9 rounded-md border border-slate-200 bg-white px-3 py-1 text-xs"
                >
                  <option value="PENDING">{t('status.pending')}</option>
                  <option value="IN_PROGRESS">{t('status.in_progress')}</option>
                  <option value="RESOLVED">{t('status.resolved')}</option>
                  <option value="REJECTED">{t('status.rejected')}</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="res-note">{t('student.complaints.admin_response')}</Label>
                <Textarea
                  id="res-note"
                  rows={3}
                  placeholder={isEn ? 'e.g. Electrician was dispatched and resolved the issue.' : 'যেমন: ইলেকট্রিশিয়ান পাঠিয়ে মেরামত কাজ সম্পন্ন করা হয়েছে।'}
                  value={adminNote}
                  onChange={(e) => setAdminNote(e.target.value)}
                  className="text-xs"
                />
              </div>

              <DialogFooter className="gap-2 pt-2 flex-col sm:flex-row">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedComp(null)}
                >
                  {t('common.cancel')}
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  disabled={updateStatusMutation.isPending}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white"
                >
                  {updateStatusMutation.isPending ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" />
                      <span>{t('common.loading')}</span>
                    </>
                  ) : (
                    <span>{t('common.save')}</span>
                  )}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export const ComplaintsPage = AdminComplaintsPage;
