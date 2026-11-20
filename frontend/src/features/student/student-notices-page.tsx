import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import {
  Bell,
  Search,
  Eye,
  Pin,
  Calendar,
  AlertCircle,
  RefreshCw,
  FileText,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
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
  createdByUser?: {
    name: string;
    email: string;
  };
  createdAt: string;
}

export const StudentNoticesPage: React.FC = () => {
  const { t, i18n } = useTranslation();
  const isEn = i18n.language?.startsWith('en');

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [activeNotice, setActiveNotice] = useState<NoticeItem | null>(null);

  // Query: Real notices from MySQL via API
  const {
    data: noticesResponse,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ['student-notices'],
    queryFn: async () => {
      const res = await apiClient.get<NoticeItem[]>('/notices');
      return res;
    },
    staleTime: 30 * 1000,
  });

  const notices: NoticeItem[] = noticesResponse?.data || [];

  const filteredNotices = notices.filter((n) => {
    const matchesCat = selectedCategory === 'ALL' || n.category === selectedCategory;
    const term = searchTerm.toLowerCase().trim();
    const matchesSearch =
      !term ||
      n.title.toLowerCase().includes(term) ||
      (n.titleEn && n.titleEn.toLowerCase().includes(term)) ||
      n.content.toLowerCase().includes(term) ||
      (n.contentEn && n.contentEn.toLowerCase().includes(term));
    return matchesCat && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
            <Bell className="w-6 h-6 text-emerald-600" />
            <span>{t('student.nav.notices')}</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-500">
            {t('notices.subtitle')}
          </p>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <Input
            placeholder={isEn ? 'Search notices...' : 'নোটিশ অনুসন্ধান করুন...'}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 h-9 text-xs sm:text-sm"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          <span className="text-xs text-slate-500 font-medium">
            {isEn ? 'Category:' : 'ক্যাটাগরি:'}
          </span>
          <Button
            size="sm"
            variant={selectedCategory === 'ALL' ? 'default' : 'outline'}
            onClick={() => setSelectedCategory('ALL')}
            className="text-xs rounded-full h-8"
          >
            {isEn ? 'All' : 'সকল নোটিশ'}
          </Button>
          <Button
            size="sm"
            variant={selectedCategory === 'ভর্তি' ? 'default' : 'outline'}
            onClick={() => setSelectedCategory('ভর্তি')}
            className="text-xs rounded-full h-8"
          >
            {isEn ? 'Admission' : 'সিট ও ভর্তি'}
          </Button>
          <Button
            size="sm"
            variant={selectedCategory === 'ডাইনিং' ? 'default' : 'outline'}
            onClick={() => setSelectedCategory('ডাইনিং')}
            className="text-xs rounded-full h-8"
          >
            {isEn ? 'Dining' : 'ডাইনিং'}
          </Button>
          <Button
            size="sm"
            variant={selectedCategory === 'সাধারণ' ? 'default' : 'outline'}
            onClick={() => setSelectedCategory('সাধারণ')}
            className="text-xs rounded-full h-8"
          >
            {isEn ? 'General' : 'সাধারণ'}
          </Button>
          <Button
            size="sm"
            variant={selectedCategory === 'জরুরি' ? 'default' : 'outline'}
            onClick={() => setSelectedCategory('জরুরি')}
            className="text-xs rounded-full h-8"
          >
            {isEn ? 'Urgent' : 'জরুরি'}
          </Button>
        </div>
      </div>

      {/* Notices Feed */}
      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-36 w-full rounded-2xl" />
          ))}
        </div>
      ) : isError ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-4">
          <AlertCircle className="w-12 h-12 text-rose-500 mx-auto" />
          <h3 className="text-lg font-bold text-slate-800">
            {isEn ? 'Failed to load notices' : 'নোটিশ লোড করা সম্ভব হয়নি'}
          </h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            {(error as any)?.message || 'সার্ভার থেকে নোটিশ লোড করতে সমস্যা হয়েছে।'}
          </p>
          <Button onClick={() => refetch()} variant="outline" size="sm" className="gap-2">
            <RefreshCw className="w-4 h-4" />
            <span>{isEn ? 'Retry' : 'পুনরায় লোড করুন'}</span>
          </Button>
        </div>
      ) : filteredNotices.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-3">
          <FileText className="w-12 h-12 text-slate-300 mx-auto" />
          <h4 className="text-base font-bold text-slate-800">
            {isEn ? 'No notices available' : 'কোনো নোটিশ পাওয়া যায়নি'}
          </h4>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            {isEn
              ? 'There are currently no active announcements published for students.'
              : 'বর্তমানে শিক্ষার্থীদের জন্য কোনো সক্রিয় নোটিশ নেই। নতুন নোটিশ প্রকাশিত হলে এখানে দেখতে পাবেন।'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredNotices.map((notice) => {
            const displayTitle = isEn && notice.titleEn ? notice.titleEn : notice.title;
            const displayContent = isEn && notice.contentEn ? notice.contentEn : notice.content;

            return (
              <div
                key={notice.id}
                className={`bg-white rounded-2xl border p-6 shadow-xs transition-all space-y-3 ${
                  notice.isPinned
                    ? 'border-emerald-300 ring-1 ring-emerald-100 bg-emerald-50/20'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-2">
                    {notice.isPinned && (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full">
                        <Pin className="w-3 h-3 text-emerald-700" />
                        <span>{isEn ? 'Important' : 'পিনযুক্ত নোটিশ'}</span>
                      </span>
                    )}
                    <Badge variant="outline" className="text-xs">
                      {notice.category}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-400">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>
                      {notice.publishedAt
                        ? new Date(notice.publishedAt).toLocaleDateString(isEn ? 'en-US' : 'bn-BD')
                        : ''}
                    </span>
                  </div>
                </div>

                <h3 className="text-base font-bold text-slate-900">{displayTitle}</h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed line-clamp-3">
                  {displayContent}
                </p>

                <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
                  <span className="text-slate-400">
                    {isEn ? 'Issued by: ' : 'প্রচারক: '}
                    <strong className="text-slate-700">
                      {notice.createdByUser?.name || 'Hostel Administration'}
                    </strong>
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setActiveNotice(notice)}
                    className="text-xs text-emerald-700 hover:text-emerald-800 gap-1"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>{isEn ? 'Read Details' : 'সম্পূর্ণ পড়ুন'}</span>
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Notice Detail Dialog */}
      {activeNotice && (
        <Dialog open={!!activeNotice} onOpenChange={(open) => !open && setActiveNotice(null)}>
          <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <div className="flex items-center gap-2 mb-1">
                <Badge variant="outline" className="text-xs">
                  {activeNotice.category}
                </Badge>
                {activeNotice.isPinned && (
                  <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full">
                    {isEn ? 'Pinned' : 'পিনযুক্ত'}
                  </span>
                )}
                <span className="text-xs text-slate-400">
                  {activeNotice.publishedAt
                    ? new Date(activeNotice.publishedAt).toLocaleDateString(isEn ? 'en-US' : 'bn-BD')
                    : ''}
                </span>
              </div>
              <DialogTitle className="text-lg leading-snug">
                {isEn && activeNotice.titleEn ? activeNotice.titleEn : activeNotice.title}
              </DialogTitle>
              <DialogDescription>
                {isEn ? 'Issued by: ' : 'প্রচারক: '}
                {activeNotice.createdByUser?.name || 'Hostel Administration'}
              </DialogDescription>
            </DialogHeader>

            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs sm:text-sm leading-relaxed text-slate-700 whitespace-pre-line">
              {isEn && activeNotice.contentEn ? activeNotice.contentEn : activeNotice.content}
            </div>

            <DialogFooter>
              <Button variant="outline" size="sm" onClick={() => setActiveNotice(null)}>
                {isEn ? 'Close' : 'বন্ধ করুন'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};