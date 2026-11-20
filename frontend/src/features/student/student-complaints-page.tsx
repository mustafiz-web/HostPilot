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
      setAddError(err.message || 'অভিযোগ জমা দেওয়া সম্ভব হয়নি');
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
          className="gap-2 shadow-xs self-start sm:self-auto bg-emerald-600 hover:bg-emerald-700"
        >
          <Plus className="w-4 h-4" />
          <span>{t('student.complaints.btn_new')}</span>
        </Button>
      </div>

      {/* Filter Tabs */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs text-slate-500 font-medium">স্ট্যাটাস অনুযায়ী:</span>
          <Button
            size="sm"
            variant={statusFilter === 'ALL' ? 'default' : 'outline'}
            onClick={() => setStatusFilter('ALL')}
            className="text-xs rounded-full h-8"
          >
            সকল অভিযোগ ({complaints.length})
          </Button>
          <Button
            size="sm"
            variant={statusFilter === 'PENDING' ? 'default' : 'outline'}
            onClick={() => setStatusFilter('PENDING')}
            className="text-xs rounded-full h-8"
          >
            অপেক্ষমান ({complaints.filter((c) => c.status === 'PENDING').length})
          </Button>
          <Button
            size="sm"
            variant={statusFilter === 'IN_PROGRESS' ? 'default' : 'outline'}
            onClick={() => setStatusFilter('IN_PROGRESS')}
            className="text-xs rounded-full h-8"
          >
            প্রক্রিয়াধীন ({complaints.filter((c) => c.status === 'IN_PROGRESS').length})
          </Button>
          <Button
            size="sm"
            variant={statusFilter === 'RESOLVED' ? 'default' : 'outline'}
            onClick={() => setStatusFilter('RESOLVED')}
            className="text-xs rounded-full h-8"
          >
            সমাধানকৃত ({complaints.filter((c) => c.status === 'RESOLVED').length})
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
          <h3 className="text-lg font-bold text-slate-800">অভিযোগ লোড করা যায়নি</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            {(error as any)?.message || 'সার্ভার থেকে অভিযোগের তথ্য পাওয়া যায়নি।'}
          </p>
          <Button onClick={() => refetch()} variant="outline" size="sm" className="gap-2">
            <RefreshCw className="w-4 h-4" />
            <span>পুনরায় চেষ্টা করুন</span>
          </Button>
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-3">
          <FileText className="w-12 h-12 text-slate-300 mx-auto" />
          <h4 className="text-base font-bold text-slate-800">কোনো অভিযোগ দাখিল করা হয়নি</h4>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            আপনার রুম বা হোস্টেল চত্বরে কোনো সমস্যা থাকলে ওপরের "নতুন অভিযোগ দাখিল" বাটনে চাপুন।
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
                    {item.priority === 'URGENT'
                      ? 'জরুরি'
                      : item.priority === 'HIGH'
                      ? 'উচ্চ'
                      : item.priority === 'MEDIUM'
                      ? 'মাঝারি'
                      : 'সাধারণ'}
                  </span>
                  <span className="text-xs font-mono font-semibold text-slate-700 bg-slate-100 px-2 py-0.5 rounded-md">
                    {item.category}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-400">
                    {new Date(item.createdAt).toLocaleDateString('bn-BD')}
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
                    <span>প্রশাসনিক সমাধান নোট:</span>
                  </span>
                  <p className="text-emerald-800 leading-relaxed">{item.adminNote}</p>
                </div>
              )}

              <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
                <div className="flex items-center gap-1.5 text-slate-400">
                  <Clock className="w-3.5 h-3.5" />
                  <span>
                    {item.status === 'RESOLVED'
                      ? `সমাধানের তারিখ: ${item.resolvedAt ? new Date(item.resolvedAt).toLocaleDateString('bn-BD') : ''}`
                      : 'প্রক্রিয়া চলমান'}
                  </span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setViewComplaint(item)}
                  className="h-7 text-xs text-emerald-700 gap-1 hover:text-emerald-800"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>বিস্তারিত</span>
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
            <DialogTitle>নতুন অভিযোগ দাখিল করুন</DialogTitle>
            <DialogDescription>
              আপনার রুমের বা হোস্টেল চত্বরের সমস্যা সুনির্দিষ্টভাবে বর্ণনা করুন।
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
                অভিযোগের শিরোনাম *
              </Label>
              <Input
                id="complaintTitle"
                placeholder="যেমন: সিলিং ফ্যানের রেগুলেটর সমস্যা"
                value={newComplaint.title}
                onChange={(e) => setNewComplaint({ ...newComplaint, title: e.target.value })}
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="category" className="text-xs font-semibold">
                  ক্যাটাগরি
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
                  <option value="PLUMBING">প্লাম্বিং ও ওয়াশরুম</option>
                  <option value="ELECTRICAL">ইলেকট্রিক্যাল ও ফ্যান</option>
                  <option value="CLEANING">পরিচ্ছন্নতা</option>
                  <option value="WIFI">ইন্টারনেট ও ওয়াইফাই</option>
                  <option value="DINING">ডাইনিং ও খাবার</option>
                  <option value="FURNITURE">আসবাবপত্র</option>
                  <option value="OTHER">অন্যান্য</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="priority" className="text-xs font-semibold">
                  জরুরিতা / প্রায়োরিটি
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
                  <option value="LOW">সাধারণ (Low)</option>
                  <option value="MEDIUM">মাঝারি (Medium)</option>
                  <option value="HIGH">জরুরি (High)</option>
                  <option value="URGENT">অত্যন্ত জরুরি (Urgent)</option>
                </select>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="desc" className="text-xs font-semibold">
                সমস্যার বিস্তারিত বিবরণ *
              </Label>
              <Textarea
                id="desc"
                rows={3}
                placeholder="সমস্যাটি কখন থেকে হচ্ছে এবং সমাধানের প্রয়োজনীয়তা বিস্তারিত লিখুন..."
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
                বাতিল
              </Button>
              <Button
                type="submit"
                disabled={addComplaintMutation.isPending}
                className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-700"
              >
                {addComplaintMutation.isPending ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" />
                    <span>জমা হচ্ছে...</span>
                  </>
                ) : (
                  <span>অভিযোগ জমা দিন</span>
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
                দাখিলের তারিখ: {new Date(viewComplaint.createdAt).toLocaleDateString('bn-BD')}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-2 text-xs text-slate-700">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                <span className="font-bold text-slate-900 block">বিবরণ:</span>
                <p className="leading-relaxed text-slate-600 whitespace-pre-line">{viewComplaint.description}</p>
              </div>

              {viewComplaint.adminNote && (
                <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 space-y-1">
                  <span className="font-bold text-emerald-900 block">কর্তৃপক্ষের নোট:</span>
                  <p className="leading-relaxed text-emerald-800">{viewComplaint.adminNote}</p>
                </div>
              )}
            </div>

            <DialogFooter>
              <Button variant="outline" size="sm" onClick={() => setViewComplaint(null)}>
                বন্ধ করুন
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};
