import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  AlertCircle,
  Search,
  Eye,
  RefreshCw,
  Loader2,
  MessageSquare,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { StatusBadge } from '@/components/ui/status-badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
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

export interface ComplaintItem {
  id: string;
  studentId: string;
  title: string;
  category: 'PLUMBING' | 'ELECTRICAL' | 'CLEANING' | 'DINING' | 'WIFI' | 'FURNITURE' | 'OTHER';
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  description: string;
  status: 'PENDING' | 'IN_PROGRESS' | 'RESOLVED' | 'REJECTED';
  adminNote?: string | null;
  createdAt: string;
  resolvedAt?: string | null;
  student?: {
    id: string;
    studentCode: string;
    rollNumber: string;
    department: string;
    user?: {
      name: string;
      email: string;
    };
  };
}

export const ComplaintsPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [selectedComp, setSelectedComp] = useState<ComplaintItem | null>(null);
  const [editStatus, setEditStatus] = useState<'PENDING' | 'IN_PROGRESS' | 'RESOLVED' | 'REJECTED'>('IN_PROGRESS');
  const [resolutionNote, setResolutionNote] = useState('');

  // Query: Fetch all complaints from real MySQL API
  const {
    data: complaintsResponse,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ['admin-complaints'],
    queryFn: async () => {
      const res = await apiClient.get<ComplaintItem[]>('/complaints');
      return res;
    },
    staleTime: 30 * 1000,
  });

  const complaints: ComplaintItem[] = complaintsResponse?.data || [];

  // Mutation: Update Complaint Status
  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status, adminNote }: { id: string; status: string; adminNote?: string }) => {
      const res = await apiClient.patch<ComplaintItem>(`/complaints/${id}/status`, {
        status,
        adminNote,
      });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-complaints'] });
      queryClient.invalidateQueries({ queryKey: ['student-complaints'] });
      queryClient.invalidateQueries({ queryKey: ['admin-dashboard-metrics'] });
      setSelectedComp(null);
    },
    onError: (err: any) => {
      alert(err.message || 'স্ট্যাটাস আপডেট করতে সমস্যা হয়েছে');
    },
  });

  const filtered = complaints.filter((c) => {
    const matchesStatus = statusFilter === 'ALL' || c.status === statusFilter;
    const term = searchTerm.toLowerCase().trim();
    const studentName = c.student?.user?.name?.toLowerCase() || '';
    const studentCode = c.student?.studentCode?.toLowerCase() || '';
    const title = c.title.toLowerCase();
    const matchesSearch =
      !term ||
      title.includes(term) ||
      studentName.includes(term) ||
      studentCode.includes(term);
    return matchesStatus && matchesSearch;
  });

  const handleOpenStatusModal = (comp: ComplaintItem) => {
    setSelectedComp(comp);
    setEditStatus(comp.status);
    setResolutionNote(comp.adminNote || '');
  };

  const handleSaveStatus = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedComp) return;
    updateStatusMutation.mutate({
      id: selectedComp.id,
      status: editStatus,
      adminNote: resolutionNote,
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
            <AlertCircle className="w-6 h-6 text-emerald-600" />
            <span>অভিযোগ ও রক্ষণাবেক্ষণ (Complaints Management)</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-500">
            শিক্ষার্থীদের হোস্টেল সম্পর্কিত অভিযোগ পর্যালোচনা ও স্ট্যাটাস আপডেট
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <Input
            placeholder="অভিযোগের বিষয় বা শিক্ষার্থী দিয়ে খুঁজুন..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 h-9 text-xs sm:text-sm"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          <span className="text-xs text-slate-500 font-medium">স্ট্যাটাস:</span>
          <Button
            size="sm"
            variant={statusFilter === 'ALL' ? 'default' : 'outline'}
            onClick={() => setStatusFilter('ALL')}
            className="text-xs rounded-full h-8"
          >
            সব ({complaints.length})
          </Button>
          <Button
            size="sm"
            variant={statusFilter === 'PENDING' ? 'default' : 'outline'}
            onClick={() => setStatusFilter('PENDING')}
            className="text-xs rounded-full h-8"
          >
            অপেক্ষমান ({pendingCount})
          </Button>
          <Button
            size="sm"
            variant={statusFilter === 'IN_PROGRESS' ? 'default' : 'outline'}
            onClick={() => setStatusFilter('IN_PROGRESS')}
            className="text-xs rounded-full h-8"
          >
            প্রক্রিয়াধীন ({inProgressCount})
          </Button>
          <Button
            size="sm"
            variant={statusFilter === 'RESOLVED' ? 'default' : 'outline'}
            onClick={() => setStatusFilter('RESOLVED')}
            className="text-xs rounded-full h-8"
          >
            সমাধানকৃত ({resolvedCount})
          </Button>
        </div>
      </div>

      {/* Complaints Table */}
      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-14 w-full rounded-xl" />
          ))}
        </div>
      ) : isError ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-4">
          <AlertCircle className="w-12 h-12 text-rose-500 mx-auto" />
          <h3 className="text-lg font-bold text-slate-800">অভিযোগ তালিকা লোড করা যায়নি</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            {(error as any)?.message || 'সার্ভার থেকে অভিযোগের তথ্য পাওয়া যায়নি।'}
          </p>
          <Button onClick={() => refetch()} variant="outline" size="sm" className="gap-2">
            <RefreshCw className="w-4 h-4" />
            <span>পুনরায় লোড করুন</span>
          </Button>
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-3">
          <MessageSquare className="w-12 h-12 text-slate-300 mx-auto" />
          <h4 className="text-base font-bold text-slate-800">কোনো অভিযোগ পাওয়া যায়নি</h4>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            প্রদত্ত ফিল্টারে কোনো অভিযোগ রেকর্ড নেই।
          </p>
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>অভিযোগের বিষয় ও বিবরণ</TableHead>
              <TableHead>শিক্ষার্থী</TableHead>
              <TableHead>ক্যাটাগরি</TableHead>
              <TableHead>দাখিলের তারিখ</TableHead>
              <TableHead>স্ট্যাটাস</TableHead>
              <TableHead className="text-right">অ্যাকশন</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((item) => (
              <TableRow key={item.id}>
                <TableCell className="max-w-md">
                  <div className="font-bold text-slate-900 text-sm">{item.title}</div>
                  <p className="text-xs text-slate-500 line-clamp-1">{item.description}</p>
                </TableCell>
                <TableCell>
                  <div className="font-bold text-slate-900 text-sm">
                    {item.student?.user?.name || 'শিক্ষার্থী'}
                  </div>
                  <div className="text-xs text-slate-400 font-mono">
                    {item.student?.studentCode} • {item.student?.department}
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className="text-xs font-semibold">
                    {item.category}
                  </Badge>
                </TableCell>
                <TableCell className="text-xs text-slate-500">
                  {new Date(item.createdAt).toLocaleDateString('bn-BD')}
                </TableCell>
                <TableCell>
                  <StatusBadge status={item.status} />
                </TableCell>
                <TableCell className="text-right">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleOpenStatusModal(item)}
                    className="h-8 px-2.5 text-xs text-slate-700 gap-1 hover:text-emerald-700"
                  >
                    <Eye className="w-3.5 h-3.5 text-emerald-600" />
                    <span>স্ট্যাটাস আপডেট</span>
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      {/* Update Complaint Status Dialog */}
      {selectedComp && (
        <Dialog open={!!selectedComp} onOpenChange={(open) => !open && setSelectedComp(null)}>
          <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <div className="flex items-center gap-2 mb-1">
                <StatusBadge status={selectedComp.status} />
                <Badge variant="outline" className="text-xs">{selectedComp.category}</Badge>
              </div>
              <DialogTitle className="text-lg">{selectedComp.title}</DialogTitle>
              <DialogDescription>
                শিক্ষার্থী: {selectedComp.student?.user?.name} ({selectedComp.student?.studentCode})
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSaveStatus} className="space-y-4 py-2">
              <div className="p-3 bg-slate-50 rounded-lg text-xs text-slate-700 border border-slate-100">
                <span className="font-bold block text-slate-900 mb-1">শিক্ষার্থীর বক্তব্য:</span>
                <p className="leading-relaxed whitespace-pre-line">{selectedComp.description}</p>
              </div>

              <div className="space-y-1.5">
                <Label>নতুন স্ট্যাটাস নির্ধারণ করুন *</Label>
                <select
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-xs focus:ring-2 focus:ring-ring"
                  value={editStatus}
                  onChange={(e) => setEditStatus(e.target.value as any)}
                >
                  <option value="PENDING">অপেক্ষমান (Pending)</option>
                  <option value="IN_PROGRESS">প্রক্রিয়াধীন (In Progress)</option>
                  <option value="RESOLVED">সমাধানকৃত (Resolved)</option>
                  <option value="REJECTED">প্রত্যাখ্যাত (Rejected)</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="res-note">প্রশাসনিক সমাধান নোট</Label>
                <Textarea
                  id="res-note"
                  rows={2}
                  placeholder="যেমন: ইলেকট্রিশিয়ান পাঠিয়ে মেরামত কাজ সম্পন্ন করা হয়েছে।"
                  value={resolutionNote}
                  onChange={(e) => setResolutionNote(e.target.value)}
                />
              </div>

              <DialogFooter className="flex flex-col-reverse sm:flex-row gap-2 pt-2">
                <Button type="button" variant="outline" className="w-full sm:w-auto" onClick={() => setSelectedComp(null)}>
                  বাতিল
                </Button>
                <Button
                  type="submit"
                  disabled={updateStatusMutation.isPending}
                  className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-700"
                >
                  {updateStatusMutation.isPending ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" />
                      <span>সংরক্ষণ হচ্ছে...</span>
                    </>
                  ) : (
                    <span>স্ট্যাটাস সংরক্ষণ করুন</span>
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
