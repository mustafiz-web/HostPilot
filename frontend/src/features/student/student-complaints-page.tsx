import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  MessageSquareWarning,
  Plus,
  CheckCircle2,
  Clock,
  Eye,
  AlertCircle,
  RefreshCw,
  Loader2,
  FileText,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { StatusBadge } from '@/components/ui/status-badge';
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
import { formatDate, formatNumber } from '@/lib/formatters';

export interface StudentComplaintItem {
  id: string;
  title: string;
  category: 'PLUMBING' | 'ELECTRICAL' | 'CLEANING' | 'DINING' | 'WIFI' | 'FURNITURE' | 'OTHER';
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  description: string;
  status: 'PENDING' | 'IN_PROGRESS' | 'RESOLVED' | 'REJECTED';
  adminNote?: string | null;
  createdAt: string;
  resolvedAt?: string | null;
}

export const StudentComplaintsPage: React.FC = () => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();

  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [addError, setAddError] = useState<string | null>(null);
  const [viewComplaint, setViewComplaint] = useState<StudentComplaintItem | null>(null);

  const [newComplaint, setNewComplaint] = useState({
    title: '',
    category: 'PLUMBING' as StudentComplaintItem['category'],
    priority: 'MEDIUM' as StudentComplaintItem['priority'],
    description: '',
  });

  // Query: Student's own complaints from real MySQL API
  const {
    data: complaintsResponse,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ['student-complaints'],
    queryFn: async () => {
      const res = await apiClient.get<StudentComplaintItem[]>('/complaints/me');
      return res;
    },
    staleTime: 30 * 1000,
  });

  const complaints: StudentComplaintItem[] = complaintsResponse?.data || [];

  // Mutation: Submit complaint
  const addComplaintMutation = useMutation({
    mutationFn: async (payload: typeof newComplaint) => {
      const res = await apiClient.post<StudentComplaintItem>('/complaints', payload);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['student-complaints'] });
      setAddModalOpen(false);
      setAddError(null);
      setNewComplaint({
        title: '',
        category: 'PLUMBING',
        priority: 'MEDIUM',
        description: '',
      });
    },
    onError: (err: any) => {
      setAddError(err.message || t('student.complaints.err_submit'));
    },
  });

  const filtered = complaints.filter((c) => {
    if (statusFilter === 'ALL') return true;
    return c.status === statusFilter;
  });

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setAddError(null);
    addComplaintMutation.mutate(newComplaint);
  };

  const getPriorityBadgeClass = (p: string) => {
    switch (p) {
      case 'URGENT':
        return 'bg-rose-100 text-rose-800 border-rose-300';
      case 'HIGH':
        return 'bg-amber-100 text-amber-800 border-amber-300';
      case 'MEDIUM':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-300';
    }
  };

  const getPriorityLabel = (p: string) => {
    switch (p) {
      case 'URGENT':
        return t('student.complaints.prio_urgent', 'Urgent');
      case 'HIGH':
        return t('student.complaints.prio_high', 'High');
      case 'MEDIUM':
        return t('student.complaints.prio_medium', 'Medium');
      default:
        return t('student.complaints.prio_low', 'Low');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
            <MessageSquareWarning className="w-6 h-6 text-emerald-600" />
            <span>{t('student.complaints.title')}</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-500">
            {t('student.complaints.subtitle')}
          </p>
        </div>
        <Button
          onClick={() => {
            setAddError(null);
            setAddModalOpen(true);
          }}
          className="gap-2 shadow-xs self-start sm:self-auto bg-emerald-600 hover:bg-emerald-700 text-white"
        >
          <Plus className="w-4 h-4" />
          <span>{t('student.complaints.btn_new')}</span>
        </Button>
      </div>

      {/* Filter Tabs */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs text-slate-500 font-medium">{t('student.complaints.filter_by_status', 'Filter by status:')}</span>
          <Button
            size="sm"
            variant={statusFilter === 'ALL' ? 'default' : 'outline'}
            onClick={() => setStatusFilter('ALL')}
            className="text-xs rounded-full h-8"
          >
            {t('student.complaints.filter_all')} ({formatNumber(complaints.length)})
          </Button>
          <Button
            size="sm"
            variant={statusFilter === 'PENDING' ? 'default' : 'outline'}
            onClick={() => setStatusFilter('PENDING')}
            className="text-xs rounded-full h-8"
          >
            {t('student.complaints.filter_pending')} ({formatNumber(complaints.filter((c) => c.status === 'PENDING').length)})
          </Button>
          <Button
            size="sm"
            variant={statusFilter === 'IN_PROGRESS' ? 'default' : 'outline'}
            onClick={() => setStatusFilter('IN_PROGRESS')}
            className="text-xs rounded-full h-8"
          >
            {t('student.complaints.filter_in_progress')} ({formatNumber(complaints.filter((c) => c.status === 'IN_PROGRESS').length)})
          </Button>
          <Button
            size="sm"
            variant={statusFilter === 'RESOLVED' ? 'default' : 'outline'}
            onClick={() => setStatusFilter('RESOLVED')}
            className="text-xs rounded-full h-8"
          >
            {t('student.complaints.filter_resolved')} ({formatNumber(complaints.filter((c) => c.status === 'RESOLVED').length)})
          </Button>
        </div>
      </div>

      {/* Complaints List Feed */}
      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-32 w-full rounded-2xl" />
          ))}
        </div>
      ) : isError ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-4">
          <AlertCircle className="w-12 h-12 text-rose-500 mx-auto" />
          <h3 className="text-lg font-bold text-slate-800">{t('student.complaints.error_load')}</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            {(error as any)?.message || t('common.error_occurred', 'An error occurred')}
          </p>
          <Button onClick={() => refetch()} variant="outline" size="sm" className="gap-2">
            <RefreshCw className="w-4 h-4" />
            <span>{t('common.retry')}</span>
          </Button>
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-3">
          <FileText className="w-12 h-12 text-slate-300 mx-auto" />
          <h4 className="text-base font-bold text-slate-800">{t('student.complaints.no_complaints')}</h4>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            {t('student.complaints.no_complaints_desc')}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-xs hover:border-slate-300 transition-all space-y-3"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${getPriorityBadgeClass(
                      item.priority
                    )}`}
                  >
                    {getPriorityLabel(item.priority)}
                  </span>
                  <span className="text-xs font-mono font-semibold text-slate-700 bg-slate-100 px-2 py-0.5 rounded-md">
                    {item.category}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-400">
                    {formatDate(item.createdAt)}
                  </span>
                  <StatusBadge status={item.status} />
                </div>
              </div>

              <div>
                <h3 className="text-base font-bold text-slate-900">{item.title}</h3>
                <p className="text-xs text-slate-600 line-clamp-2 mt-1 leading-relaxed">
                  {item.description}
                </p>
              </div>

              {item.adminNote && (
                <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-xs text-emerald-900 space-y-1">
                  <span className="font-bold flex items-center gap-1.5 text-emerald-950">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>{t('student.complaints.admin_response')}</span>
                  </span>
                  <p className="text-emerald-800 leading-relaxed">{item.adminNote}</p>
                </div>
              )}

              <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
                <div className="flex items-center gap-1.5 text-slate-400">
                  <Clock className="w-3.5 h-3.5" />
                  <span>
                    {item.status === 'RESOLVED'
                      ? `${t('student.complaints.resolved_date', 'Resolved Date')}: ${item.resolvedAt ? formatDate(item.resolvedAt) : ''}`
                      : t('status.in_progress', 'In Progress')}
                  </span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setViewComplaint(item)}
                  className="h-7 text-xs text-emerald-700 gap-1 hover:text-emerald-800"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>{t('common.details', 'Details')}</span>
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Complaint Modal */}
      <Dialog open={addModalOpen} onOpenChange={setAddModalOpen}>
        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{t('student.complaints.modal_title')}</DialogTitle>
            <DialogDescription>
              {t('student.complaints.modal_desc')}
            </DialogDescription>
          </DialogHeader>

          {addError && (
            <Alert variant="destructive" className="bg-rose-50 border-rose-200 text-rose-800 text-xs">
              <AlertCircle className="w-4 h-4 text-rose-600" />
              <AlertDescription>{addError}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleAddSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="complaintTitle" className="text-xs font-semibold">
                {t('student.complaints.title_field')} *
              </Label>
              <Input
                id="complaintTitle"
                placeholder={t('student.complaints.title_placeholder')}
                value={newComplaint.title}
                onChange={(e) => setNewComplaint({ ...newComplaint, title: e.target.value })}
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="category" className="text-xs font-semibold">
                  {t('student.complaints.category_field')}
                </Label>
                <select
                  id="category"
                  value={newComplaint.category}
                  onChange={(e) =>
                    setNewComplaint({
                      ...newComplaint,
                      category: e.target.value as any,
                    })
                  }
                  className="w-full text-xs h-9 rounded-md border border-slate-200 px-2.5 bg-white"
                >
                  <option value="PLUMBING">{t('student.complaints.cat_plumbing')}</option>
                  <option value="ELECTRICAL">{t('student.complaints.cat_electrical')}</option>
                  <option value="CLEANING">{t('student.complaints.cat_cleaning')}</option>
                  <option value="WIFI">{t('student.complaints.cat_internet')}</option>
                  <option value="DINING">{t('student.complaints.cat_dining', 'Dining & Food')}</option>
                  <option value="FURNITURE">{t('student.complaints.cat_furniture')}</option>
                  <option value="OTHER">{t('student.complaints.cat_other')}</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="priority" className="text-xs font-semibold">
                  {t('student.complaints.priority_field')}
                </Label>
                <select
                  id="priority"
                  value={newComplaint.priority}
                  onChange={(e) =>
                    setNewComplaint({
                      ...newComplaint,
                      priority: e.target.value as any,
                    })
                  }
                  className="w-full text-xs h-9 rounded-md border border-slate-200 px-2.5 bg-white"
                >
                  <option value="LOW">{t('student.complaints.prio_low')}</option>
                  <option value="MEDIUM">{t('student.complaints.prio_medium')}</option>
                  <option value="HIGH">{t('student.complaints.prio_high')}</option>
                  <option value="URGENT">{t('student.complaints.prio_urgent', 'Urgent')}</option>
                </select>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="desc" className="text-xs font-semibold">
                {t('student.complaints.desc_field')} *
              </Label>
              <Textarea
                id="desc"
                rows={3}
                placeholder={t('student.complaints.desc_placeholder')}
                value={newComplaint.description}
                onChange={(e) => setNewComplaint({ ...newComplaint, description: e.target.value })}
                required
              />
            </div>

            <DialogFooter className="flex flex-col-reverse sm:flex-row gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                className="w-full sm:w-auto"
                onClick={() => setAddModalOpen(false)}
              >
                {t('common.cancel')}
              </Button>
              <Button
                type="submit"
                disabled={addComplaintMutation.isPending}
                className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-700 text-white"
              >
                {addComplaintMutation.isPending ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" />
                    <span>{t('student.complaints.submitting')}</span>
                  </>
                ) : (
                  <span>{t('student.complaints.submit_btn')}</span>
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* View Complaint Modal */}
      {viewComplaint && (
        <Dialog open={!!viewComplaint} onOpenChange={(open) => !open && setViewComplaint(null)}>
          <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <div className="flex items-center gap-2 mb-1">
                <StatusBadge status={viewComplaint.status} />
                <span className="text-xs text-slate-400 font-mono">{viewComplaint.category}</span>
              </div>
              <DialogTitle className="text-base">{viewComplaint.title}</DialogTitle>
              <DialogDescription>
                {t('student.complaints.card_submitted')} {formatDate(viewComplaint.createdAt)}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-2 text-xs text-slate-700">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                <span className="font-bold text-slate-900 block">{t('common.description', 'Description')}:</span>
                <p className="leading-relaxed text-slate-600 whitespace-pre-line">{viewComplaint.description}</p>
              </div>

              {viewComplaint.adminNote && (
                <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 space-y-1">
                  <span className="font-bold text-emerald-900 block">{t('student.complaints.admin_response')}</span>
                  <p className="leading-relaxed text-emerald-800">{viewComplaint.adminNote}</p>
                </div>
              )}
            </div>

            <DialogFooter>
              <Button variant="outline" size="sm" onClick={() => setViewComplaint(null)}>
                {t('common.close')}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};
