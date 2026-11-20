import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Bell,
  Plus,
  Eye,
  Edit2,
  Trash2,
  Pin,
  Search,
  Filter,
  Users,
  AlertCircle,
  Loader2,
  RefreshCw,
  FileText,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
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

export interface NoticeItem {
  id: string;
  title: string;
  content: string;
  titleEn?: string | null;
  contentEn?: string | null;
  category: string;
  targetAudience: 'ALL' | 'STUDENTS' | 'ADMIN';
  isPinned: boolean;
  status: 'PUBLISHED' | 'DRAFT';
  publishedAt: string | null;
  expiresAt: string | null;
  createdByUserId: string;
  createdByUser?: {
    name: string;
    email: string;
  };
  createdAt: string;
  updatedAt: string;
}

export const NoticesAdminPage: React.FC = () => {
  const queryClient = useQueryClient();

  // Filter & Search states
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'PUBLISHED' | 'DRAFT'>('ALL');
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');
  const [audienceFilter, setAudienceFilter] = useState<string>('ALL');

  // Modal states
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

  const [editNotice, setEditNotice] = useState<NoticeItem | null>(null);
  const [editForm, setEditForm] = useState({
    title: '',
    content: '',
    titleEn: '',
    contentEn: '',
    category: 'সাধারণ',
    targetAudience: 'ALL' as 'ALL' | 'STUDENTS' | 'ADMIN',
    isPinned: false,
    status: 'PUBLISHED' as 'PUBLISHED' | 'DRAFT',
    expiresAt: '',
  });
  const [editError, setEditError] = useState<string | null>(null);

  const [deleteTarget, setDeleteTarget] = useState<NoticeItem | null>(null);
  const [viewNotice, setViewNotice] = useState<NoticeItem | null>(null);

  const [newNotice, setNewNotice] = useState({
    title: '',
    content: '',
    titleEn: '',
    contentEn: '',
    category: 'সাধারণ',
    targetAudience: 'ALL' as 'ALL' | 'STUDENTS' | 'ADMIN',
    isPinned: false,
    status: 'PUBLISHED' as 'PUBLISHED' | 'DRAFT',
    expiresAt: '',
  });

  // Query: Fetch all notices from real MySQL API
  const {
    data: noticesResponse,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ['admin-notices'],
    queryFn: async () => {
      const res = await apiClient.get<NoticeItem[]>('/notices');
      return res;
    },
    staleTime: 30 * 1000,
  });

  const notices: NoticeItem[] = noticesResponse?.data || [];

  // Mutation: Create Notice
  const createNoticeMutation = useMutation({
    mutationFn: async (payload: typeof newNotice) => {
      const res = await apiClient.post<NoticeItem>('/notices', {
        ...payload,
        expiresAt: payload.expiresAt ? new Date(payload.expiresAt).toISOString() : null,
      });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-notices'] });
      queryClient.invalidateQueries({ queryKey: ['student-notices'] });
      queryClient.invalidateQueries({ queryKey: ['public-notices'] });
      setCreateModalOpen(false);
      setCreateError(null);
      setNewNotice({
        title: '',
        content: '',
        titleEn: '',
        contentEn: '',
        category: 'সাধারণ',
        targetAudience: 'ALL',
        isPinned: false,
        status: 'PUBLISHED',
        expiresAt: '',
      });
    },
    onError: (err: any) => {
      setCreateError(err.message || 'নোটিশ প্রকাশ করতে সমস্যা হয়েছে');
    },
  });

  // Mutation: Update Notice
  const updateNoticeMutation = useMutation({
    mutationFn: async ({ id, payload }: { id: string; payload: typeof editForm }) => {
      const res = await apiClient.patch<NoticeItem>(`/notices/${id}`, {
        ...payload,
        expiresAt: payload.expiresAt ? new Date(payload.expiresAt).toISOString() : null,
      });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-notices'] });
      queryClient.invalidateQueries({ queryKey: ['student-notices'] });
      queryClient.invalidateQueries({ queryKey: ['public-notices'] });
      setEditNotice(null);
      setEditError(null);
    },
    onError: (err: any) => {
      setEditError(err.message || 'নোটিশ আপডেট করতে সমস্যা হয়েছে');
    },
  });

  // Mutation: Toggle Publish Status
  const togglePublishMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await apiClient.patch<NoticeItem>(`/notices/${id}/toggle-publish`);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-notices'] });
      queryClient.invalidateQueries({ queryKey: ['student-notices'] });
      queryClient.invalidateQueries({ queryKey: ['public-notices'] });
    },
    onError: (err: any) => {
      alert(err.message || 'স্ট্যাটাস পরিবর্তন করা সম্ভব হয়নি');
    },
  });

  // Mutation: Delete Notice
  const deleteNoticeMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await apiClient.delete<any>(`/notices/${id}`);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-notices'] });
      queryClient.invalidateQueries({ queryKey: ['student-notices'] });
      queryClient.invalidateQueries({ queryKey: ['public-notices'] });
      setDeleteTarget(null);
    },
    onError: (err: any) => {
      alert(err.message || 'নোটিশ মুছে ফেলা যায়নি');
    },
  });

  // Handlers
  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setCreateError(null);
    createNoticeMutation.mutate(newNotice);
  };

  const handleOpenEdit = (n: NoticeItem) => {
    setEditNotice(n);
    setEditError(null);
    setEditForm({
      title: n.title,
      content: n.content,
      titleEn: n.titleEn || '',
      contentEn: n.contentEn || '',
      category: n.category,
      targetAudience: n.targetAudience,
      isPinned: n.isPinned,
      status: n.status,
      expiresAt: n.expiresAt ? n.expiresAt.split('T')[0] : '',
    });
  };

  const handleUpdateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editNotice) return;
    setEditError(null);
    updateNoticeMutation.mutate({ id: editNotice.id, payload: editForm });
  };

  // Filtered list
  const filteredNotices = notices.filter((n) => {
    const term = searchTerm.toLowerCase().trim();
    const matchesSearch =
      !term ||
      n.title.toLowerCase().includes(term) ||
      (n.titleEn && n.titleEn.toLowerCase().includes(term)) ||
      n.content.toLowerCase().includes(term) ||
      (n.createdByUser && n.createdByUser.name.toLowerCase().includes(term));

    const matchesStatus = statusFilter === 'ALL' || n.status === statusFilter;
    const matchesCategory = categoryFilter === 'ALL' || n.category === categoryFilter;
    const matchesAudience = audienceFilter === 'ALL' || n.targetAudience === audienceFilter;

    return matchesSearch && matchesStatus && matchesCategory && matchesAudience;
  });

  const totalPublished = notices.filter((n) => n.status === 'PUBLISHED').length;
  const totalDraft = notices.filter((n) => n.status === 'DRAFT').length;
  const totalPinned = notices.filter((n) => n.isPinned).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
            <Bell className="w-6 h-6 text-emerald-600" />
            <span>হোস্টেল নোটিশ বোর্ড পরিচালনা (Notice Management)</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-500">
            নোটিশ তৈরি, দ্বিভাষিক প্রকাশনা, টার্গেট অডিয়েন্স এবং খসড়া ও প্রকাশনা ব্যবস্থাপনা
          </p>
        </div>
        <Button
          onClick={() => {
            setCreateError(null);
            setCreateModalOpen(true);
          }}
          className="gap-2 shadow-xs bg-emerald-600 hover:bg-emerald-700 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>নতুন নোটিশ লিখুন</span>
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-1">
          <span className="text-[11px] font-semibold text-slate-500 uppercase block">সর্বমোট নোটিশ</span>
          <div className="text-xl sm:text-2xl font-black text-slate-900">{notices.length} টি</div>
          <span className="text-[10px] text-slate-400">ডাটাবেসে সংরক্ষিত</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-1">
          <span className="text-[11px] font-semibold text-slate-500 uppercase block">প্রকাশিত (Published)</span>
          <div className="text-xl sm:text-2xl font-black text-emerald-600">{totalPublished} টি</div>
          <span className="text-[10px] text-emerald-700 font-medium">শিক্ষার্থীদের জন্য উন্মুক্ত</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-1">
          <span className="text-[11px] font-semibold text-slate-500 uppercase block">খসড়া (Draft)</span>
          <div className="text-xl sm:text-2xl font-black text-amber-600">{totalDraft} টি</div>
          <span className="text-[10px] text-slate-400">অপ্রকাশিত অবস্থায়</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-1">
          <span className="text-[11px] font-semibold text-slate-500 uppercase block">পিনযুক্ত (Important)</span>
          <div className="text-xl sm:text-2xl font-black text-blue-600">{totalPinned} টি</div>
          <span className="text-[10px] text-slate-400">সর্বোচ্চ গুরুত্বে শীর্ষে</span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        {/* Search Input */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <Input
            placeholder="নোটিশ শিরোনাম বা বিবরণ দিয়ে খুঁজুন..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 h-9 text-xs sm:text-sm"
          />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Status Filter */}
          <div className="flex items-center gap-1.5 mr-2">
            <Filter className="w-4 h-4 text-slate-400" />
            <span className="text-xs text-slate-500 font-medium">স্ট্যাটাস:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="h-8 text-xs rounded-lg border border-slate-200 bg-white px-2 focus:ring-1 focus:ring-emerald-500"
            >
              <option value="ALL">সকল স্ট্যাটাস</option>
              <option value="PUBLISHED">প্রকাশিত (Published)</option>
              <option value="DRAFT">খসড়া (Draft)</option>
            </select>
          </div>

          {/* Category Filter */}
          <div className="flex items-center gap-1.5 mr-2">
            <span className="text-xs text-slate-500 font-medium">ক্যাটাগরি:</span>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="h-8 text-xs rounded-lg border border-slate-200 bg-white px-2 focus:ring-1 focus:ring-emerald-500"
            >
              <option value="ALL">সকল ক্যাটাগরি</option>
              <option value="সাধারণ">সাধারণ</option>
              <option value="ভর্তি">ভর্তি</option>
              <option value="ডাইনিং">ডাইনিং</option>
              <option value="ছুটি">ছুটি</option>
              <option value="জরুরি">জরুরি</option>
            </select>
          </div>

          {/* Audience Filter */}
          <div className="flex items-center gap-1.5">
            <Users className="w-4 h-4 text-slate-400" />
            <span className="text-xs text-slate-500 font-medium">প্রাপক:</span>
            <select
              value={audienceFilter}
              onChange={(e) => setAudienceFilter(e.target.value)}
              className="h-8 text-xs rounded-lg border border-slate-200 bg-white px-2 focus:ring-1 focus:ring-emerald-500"
            >
              <option value="ALL">সকল প্রাপক</option>
              <option value="ALL">সবার জন্য (ALL)</option>
              <option value="STUDENTS">শুধুমাত্র শিক্ষার্থী</option>
              <option value="ADMIN">শুধুমাত্র অ্যাডমিন</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Table / Grid */}
      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-14 w-full rounded-xl" />
          ))}
        </div>
      ) : isError ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-4">
          <AlertCircle className="w-12 h-12 text-rose-500 mx-auto" />
          <h3 className="text-lg font-bold text-slate-800">নোটিশ তালিকা লোড করা যায়নি</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            {(error as any)?.message || 'সার্ভার থেকে নোটিশ লোড করতে সমস্যা হয়েছে।'}
          </p>
          <Button onClick={() => refetch()} variant="outline" size="sm" className="gap-2">
            <RefreshCw className="w-4 h-4" />
            <span>পুনরায় লোড করুন</span>
          </Button>
        </div>
      ) : filteredNotices.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-3">
          <FileText className="w-12 h-12 text-slate-300 mx-auto" />
          <h4 className="text-base font-bold text-slate-800">কোনো নোটিশ পাওয়া যায়নি</h4>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            নির্বাচিত ফিল্টারে কোনো নোটিশ নেই। নতুন নোটিশ লিখতে ওপরের বাটনে চাপুন।
          </p>
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>শিরোনাম ও বিবরণ</TableHead>
              <TableHead>ক্যাটাগরি</TableHead>
              <TableHead>প্রাপক (Audience)</TableHead>
              <TableHead>প্রকাশের তারিখ</TableHead>
              <TableHead>স্ট্যাটাস</TableHead>
              <TableHead className="text-right">অ্যাকশন</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredNotices.map((n) => {
              const isPublished = n.status === 'PUBLISHED';

              return (
                <TableRow key={n.id}>
                  <TableCell className="max-w-md">
                    <div className="flex items-center gap-2">
                      {n.isPinned && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full shrink-0">
                          <Pin className="w-3 h-3 text-emerald-700" />
                          <span>পিনযুক্ত</span>
                        </span>
                      )}
                      <span className="font-bold text-slate-900 text-sm">{n.title}</span>
                    </div>
                    {n.titleEn && (
                      <p className="text-[11px] text-slate-400 italic">{n.titleEn}</p>
                    )}
                    <p className="text-xs text-slate-500 line-clamp-1 mt-0.5">{n.content}</p>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="text-xs font-semibold">
                      {n.category}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <span
                      className={`text-[11px] font-semibold px-2 py-0.5 rounded-md ${
                        n.targetAudience === 'ADMIN'
                          ? 'bg-purple-100 text-purple-800'
                          : n.targetAudience === 'STUDENTS'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      {n.targetAudience === 'ADMIN'
                        ? 'অ্যাডমিন'
                        : n.targetAudience === 'STUDENTS'
                        ? 'শিক্ষার্থী'
                        : 'সকলের জন্য'}
                    </span>
                  </TableCell>
                  <TableCell className="text-xs text-slate-500">
                    {n.publishedAt ? new Date(n.publishedAt).toLocaleDateString('bn-BD') : 'খসড়া (অপ্রকাশিত)'}
                  </TableCell>
                  <TableCell>
                    <span
                      className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full ${
                        isPublished ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {isPublished ? 'প্রকাশিত' : 'খসড়া (Draft)'}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setViewNotice(n)}
                        className="h-8 px-2 text-xs text-slate-700 hover:text-emerald-700"
                        title="দেখুন"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </Button>

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleOpenEdit(n)}
                        className="h-8 px-2 text-xs text-slate-700 hover:text-emerald-700"
                        title="সম্পাদনা"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </Button>

                      <Button
                        variant="outline"
                        size="sm"
                        disabled={togglePublishMutation.isPending}
                        onClick={() => togglePublishMutation.mutate(n.id)}
                        className={`h-8 px-2 text-xs font-medium ${
                          isPublished
                            ? 'text-amber-700 hover:bg-amber-50'
                            : 'text-emerald-700 hover:bg-emerald-50'
                        }`}
                      >
                        {isPublished ? 'খসড়া করুন' : 'প্রকাশ করুন'}
                      </Button>

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setDeleteTarget(n)}
                        className="h-8 px-2 text-xs text-rose-600 hover:text-rose-700 hover:bg-rose-50 border-rose-200"
                        title="মুছুন"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      )}

      {/* Create Notice Modal Dialog */}
      <Dialog open={createModalOpen} onOpenChange={setCreateModalOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-base font-bold flex items-center gap-2">
              <Plus className="w-5 h-5 text-emerald-600" />
              <span>নতুন নোটিশ তৈরি করুন (Create Notice)</span>
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-500">
              বাংলা ও ইংরেজি দ্বিভাষিক নোটিশ লিখুন এবং প্রকাশ বা খসড়া হিসেবে সংরক্ষণ করুন।
            </DialogDescription>
          </DialogHeader>

          {createError && (
            <Alert variant="destructive" className="bg-rose-50 border-rose-200 text-rose-800 text-xs">
              <AlertCircle className="w-4 h-4 text-rose-600" />
              <AlertDescription>{createError}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleCreateSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="create-title" className="text-xs font-semibold">
                নোটিশের শিরোনাম (বাংলা) *
              </Label>
              <Input
                id="create-title"
                required
                placeholder="যেমন: গেট ক্লোজিং সময়সূচি পরিবর্তন"
                value={newNotice.title}
                onChange={(e) => setNewNotice({ ...newNotice, title: e.target.value })}
                className="h-9 text-xs"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="create-title-en" className="text-xs font-semibold text-slate-500">
                Notice Title (English — ঐচ্ছিক)
              </Label>
              <Input
                id="create-title-en"
                placeholder="e.g. Change in Gate Closing Timing"
                value={newNotice.titleEn}
                onChange={(e) => setNewNotice({ ...newNotice, titleEn: e.target.value })}
                className="h-9 text-xs font-mono"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">ক্যাটাগরি</Label>
                <select
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-xs focus:ring-2 focus:ring-ring"
                  value={newNotice.category}
                  onChange={(e) => setNewNotice({ ...newNotice, category: e.target.value })}
                >
                  <option value="সাধারণ">সাধারণ</option>
                  <option value="ভর্তি">ভর্তি</option>
                  <option value="ডাইনিং">ডাইনিং</option>
                  <option value="ছুটি">ছুটি</option>
                  <option value="জরুরি">জরুরি</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">প্রাপক / অডিয়েন্স (Target Audience)</Label>
                <select
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-xs focus:ring-2 focus:ring-ring"
                  value={newNotice.targetAudience}
                  onChange={(e) => setNewNotice({ ...newNotice, targetAudience: e.target.value as any })}
                >
                  <option value="ALL">সবার জন্য উন্মুক্ত (All Students & Staff)</option>
                  <option value="STUDENTS">শুধুমাত্র শিক্ষার্থী (Students Only)</option>
                  <option value="ADMIN">শুধুমাত্র অ্যাডমিন (Admin Only Announcements)</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">প্রকাশের স্ট্যাটাস</Label>
                <select
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-xs focus:ring-2 focus:ring-ring"
                  value={newNotice.status}
                  onChange={(e) => setNewNotice({ ...newNotice, status: e.target.value as any })}
                >
                  <option value="PUBLISHED">সরাসরি প্রকাশ করুন (Published)</option>
                  <option value="DRAFT">খসড়া রাখুন (Draft - অপ্রকাশিত)</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="create-expiry" className="text-xs font-semibold text-slate-500">
                  মেয়াদোত্তীর্ণের তারিখ (Expiry Date — ঐচ্ছিক)
                </Label>
                <Input
                  id="create-expiry"
                  type="date"
                  value={newNotice.expiresAt}
                  onChange={(e) => setNewNotice({ ...newNotice, expiresAt: e.target.value })}
                  className="h-10 text-xs"
                />
              </div>
            </div>

            <div className="flex items-center gap-2 pt-1">
              <input
                type="checkbox"
                id="create-pinned"
                checked={newNotice.isPinned}
                onChange={(e) => setNewNotice({ ...newNotice, isPinned: e.target.checked })}
                className="h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
              />
              <Label htmlFor="create-pinned" className="text-xs font-medium cursor-pointer flex items-center gap-1">
                <Pin className="w-3.5 h-3.5 text-emerald-600" />
                <span>গুরুত্বপূর্ণ পিনযুক্ত নোটিশ হিসেবে শীর্ষে রাখুন</span>
              </Label>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="create-content" className="text-xs font-semibold">
                নোটিশের বিস্তারিত বক্তব্য (বাংলা) *
              </Label>
              <Textarea
                id="create-content"
                required
                rows={3}
                placeholder="নোটিশের বিস্তারিত বক্তব্য এখানে লিখুন..."
                value={newNotice.content}
                onChange={(e) => setNewNotice({ ...newNotice, content: e.target.value })}
                className="text-xs"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="create-content-en" className="text-xs font-semibold text-slate-500">
                Notice Detailed Content (English — ঐচ্ছিক)
              </Label>
              <Textarea
                id="create-content-en"
                rows={2}
                placeholder="Notice description in English (optional)..."
                value={newNotice.contentEn}
                onChange={(e) => setNewNotice({ ...newNotice, contentEn: e.target.value })}
                className="text-xs"
              />
            </div>

            <DialogFooter className="gap-2 pt-2 flex flex-col-reverse sm:flex-row">
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="w-full sm:w-auto"
                onClick={() => setCreateModalOpen(false)}
              >
                বাতিল
              </Button>
              <Button
                type="submit"
                size="sm"
                disabled={createNoticeMutation.isPending}
                className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-700"
              >
                {createNoticeMutation.isPending ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" />
                    <span>সংরক্ষণ হচ্ছে...</span>
                  </>
                ) : (
                  <span>নোটিশ সংরক্ষণ করুন</span>
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Notice Modal Dialog */}
      {editNotice && (
        <Dialog open={!!editNotice} onOpenChange={(open) => !open && setEditNotice(null)}>
          <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-base font-bold flex items-center gap-2">
                <Edit2 className="w-5 h-5 text-emerald-600" />
                <span>নোটিশ সম্পাদনা (Edit Notice)</span>
              </DialogTitle>
            </DialogHeader>

            {editError && (
              <Alert variant="destructive" className="bg-rose-50 border-rose-200 text-rose-800 text-xs">
                <AlertCircle className="w-4 h-4 text-rose-600" />
                <AlertDescription>{editError}</AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleUpdateSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="edit-title" className="text-xs font-semibold">
                  নোটিশের শিরোনাম (বাংলা) *
                </Label>
                <Input
                  id="edit-title"
                  required
                  value={editForm.title}
                  onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                  className="h-9 text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="edit-title-en" className="text-xs font-semibold text-slate-500">
                  Notice Title (English)
                </Label>
                <Input
                  id="edit-title-en"
                  value={editForm.titleEn}
                  onChange={(e) => setEditForm({ ...editForm, titleEn: e.target.value })}
                  className="h-9 text-xs font-mono"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">ক্যাটাগরি</Label>
                  <select
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-xs focus:ring-2 focus:ring-ring"
                    value={editForm.category}
                    onChange={(e) => setEditForm({ ...editForm, category: e.target.value })}
                  >
                    <option value="সাধারণ">সাধারণ</option>
                    <option value="ভর্তি">ভর্তি</option>
                    <option value="ডাইনিং">ডাইনিং</option>
                    <option value="ছুটি">ছুটি</option>
                    <option value="জরুরি">জরুরি</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">প্রাপক / অডিয়েন্স</Label>
                  <select
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-xs focus:ring-2 focus:ring-ring"
                    value={editForm.targetAudience}
                    onChange={(e) => setEditForm({ ...editForm, targetAudience: e.target.value as any })}
                  >
                    <option value="ALL">সবার জন্য উন্মুক্ত (ALL)</option>
                    <option value="STUDENTS">শুধুমাত্র শিক্ষার্থী (STUDENTS)</option>
                    <option value="ADMIN">শুধুমাত্র অ্যাডমিন (ADMIN)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">প্রকাশের স্ট্যাটাস</Label>
                  <select
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-xs focus:ring-2 focus:ring-ring"
                    value={editForm.status}
                    onChange={(e) => setEditForm({ ...editForm, status: e.target.value as any })}
                  >
                    <option value="PUBLISHED">প্রকাশিত (Published)</option>
                    <option value="DRAFT">খসড়া (Draft)</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="edit-expiry" className="text-xs font-semibold text-slate-500">
                    মেয়াদোত্তীর্ণের তারিখ
                  </Label>
                  <Input
                    id="edit-expiry"
                    type="date"
                    value={editForm.expiresAt}
                    onChange={(e) => setEditForm({ ...editForm, expiresAt: e.target.value })}
                    className="h-10 text-xs"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="edit-pinned"
                  checked={editForm.isPinned}
                  onChange={(e) => setEditForm({ ...editForm, isPinned: e.target.checked })}
                  className="h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                />
                <Label htmlFor="edit-pinned" className="text-xs font-medium cursor-pointer flex items-center gap-1">
                  <Pin className="w-3.5 h-3.5 text-emerald-600" />
                  <span>গুরুত্বপূর্ণ পিনযুক্ত নোটিশ</span>
                </Label>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="edit-content" className="text-xs font-semibold">
                  নোটিশের বিস্তারিত বক্তব্য (বাংলা) *
                </Label>
                <Textarea
                  id="edit-content"
                  required
                  rows={3}
                  value={editForm.content}
                  onChange={(e) => setEditForm({ ...editForm, content: e.target.value })}
                  className="text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="edit-content-en" className="text-xs font-semibold text-slate-500">
                  Notice Detailed Content (English)
                </Label>
                <Textarea
                  id="edit-content-en"
                  rows={2}
                  value={editForm.contentEn}
                  onChange={(e) => setEditForm({ ...editForm, contentEn: e.target.value })}
                  className="text-xs"
                />
              </div>

              <DialogFooter className="gap-2 pt-2 flex flex-col-reverse sm:flex-row">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="w-full sm:w-auto"
                  onClick={() => setEditNotice(null)}
                >
                  বাতিল
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  disabled={updateNoticeMutation.isPending}
                  className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-700"
                >
                  {updateNoticeMutation.isPending ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" />
                      <span>আপডেট হচ্ছে...</span>
                    </>
                  ) : (
                    <span>হালনাগাদ সংরক্ষণ করুন</span>
                  )}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      )}

      {/* Delete Notice Confirmation Dialog */}
      {deleteTarget && (
        <Dialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="text-base font-bold text-rose-700">নোটিশ মুছে ফেলার নিশ্চিতকরণ</DialogTitle>
              <DialogDescription className="text-xs text-slate-600">
                আপনি কি নিশ্চিতভাবে এই নোটিশটি মুছে ফেলতে চান?
              </DialogDescription>
            </DialogHeader>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-800">
              <span className="font-bold block text-slate-900 mb-1">{deleteTarget.title}</span>
              <p className="line-clamp-2 text-slate-500">{deleteTarget.content}</p>
            </div>

            <DialogFooter className="gap-2 pt-2 flex flex-col-reverse sm:flex-row">
              <Button
                variant="outline"
                size="sm"
                className="w-full sm:w-auto"
                onClick={() => setDeleteTarget(null)}
              >
                বাতিল
              </Button>
              <Button
                variant="destructive"
                size="sm"
                disabled={deleteNoticeMutation.isPending}
                className="w-full sm:w-auto"
                onClick={() => deleteNoticeMutation.mutate(deleteTarget.id)}
              >
                {deleteNoticeMutation.isPending ? 'মুছে ফেলা হচ্ছে...' : 'স্থায়ীভাবে মুছুন'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* View Notice Detail Dialog */}
      {viewNotice && (
        <Dialog open={!!viewNotice} onOpenChange={(open) => !open && setViewNotice(null)}>
          <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <div className="flex items-center gap-2 mb-1">
                <Badge variant="outline">{viewNotice.category}</Badge>
                {viewNotice.isPinned && (
                  <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full">
                    পিনযুক্ত
                  </span>
                )}
                <span className="text-xs text-slate-400">
                  {viewNotice.publishedAt ? new Date(viewNotice.publishedAt).toLocaleDateString('bn-BD') : 'খসড়া'}
                </span>
              </div>
              <DialogTitle className="text-lg leading-snug">{viewNotice.title}</DialogTitle>
              {viewNotice.titleEn && (
                <p className="text-xs text-slate-400 italic">{viewNotice.titleEn}</p>
              )}
            </DialogHeader>

            <div className="space-y-3 py-2 text-xs text-slate-700">
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100 space-y-1">
                <span className="font-bold text-slate-900 block">বিস্তারিত বক্তব্য:</span>
                <p className="leading-relaxed whitespace-pre-line">{viewNotice.content}</p>
              </div>

              {viewNotice.contentEn && (
                <div className="p-3.5 bg-slate-50/60 rounded-xl border border-slate-100 space-y-1">
                  <span className="font-bold text-slate-600 block">English Content:</span>
                  <p className="leading-relaxed whitespace-pre-line text-slate-600">{viewNotice.contentEn}</p>
                </div>
              )}

              <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
                <span>প্রাপক: <strong>{viewNotice.targetAudience}</strong></span>
                <span>লেখক: <strong>{viewNotice.createdByUser?.name || 'Admin'}</strong></span>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" size="sm" onClick={() => setViewNotice(null)}>
                বন্ধ করুন
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};