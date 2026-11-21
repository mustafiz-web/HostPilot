import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import {
  Search,
  Pin,
  Calendar,
  Eye,
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

function formatNoticeCategory(cat: string, isEn: boolean) {
  if (cat === 'ভর্তি' || cat === 'ADMISSION') return isEn ? 'Admission' : 'ভর্তি';
  if (cat === 'ডাইনিং' || cat === 'DINING') return isEn ? 'Dining' : 'ডাইনিং';
  if (cat === 'সাধারণ' || cat === 'GENERAL') return isEn ? 'General' : 'সাধারণ';
  if (cat === 'জরুরি' || cat === 'URGENT') return isEn ? 'Urgent' : 'জরুরি';
  return cat;
}

export const NoticesPage: React.FC = () => {
  const { t, i18n } = useTranslation();
  const isEn = i18n.language?.startsWith('en');

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [activeNotice, setActiveNotice] = useState<NoticeItem | null>(null);

  // Query: Fetch real published notices from MySQL
  const {
    data: noticesResponse,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ['public-notices'],
    queryFn: async () => {
      const res = await apiClient.get<NoticeItem[]>('/notices');
      return res;
    },
    staleTime: 30 * 1000,
  });

  const notices: NoticeItem[] = noticesResponse?.data || [];

  const filteredNotices = notices.filter((notice) => {
    const matchesCategory = selectedCategory === 'ALL' || notice.category === selectedCategory;
    const title = isEn && notice.titleEn ? notice.titleEn.toLowerCase() : notice.title.toLowerCase();
    const content = isEn && notice.contentEn ? notice.contentEn.toLowerCase() : notice.content.toLowerCase();
    const term = searchTerm.toLowerCase().trim();
    const matchesSearch = !term || title.includes(term) || content.includes(term);
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="space-y-12 py-10 md:py-16">
      {/* Header */}
      <section className="container mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-4 max-w-3xl">
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-gray-900 tracking-tight">
          {t('notices.title')}
        </h1>
        <p className="text-base sm:text-lg text-gray-600 leading-relaxed">
          {t('notices.subtitle')}
        </p>

        {/* Search & Category Filter */}
        <div className="pt-4 max-w-md mx-auto space-y-3">
          <div className="relative">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
            <Input
              type="text"
              placeholder={t('notices.search_placeholder')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>

          <div className="flex flex-wrap items-center justify-center gap-2">
            <Button
              size="sm"
              variant={selectedCategory === 'ALL' ? 'default' : 'outline'}
              onClick={() => setSelectedCategory('ALL')}
              className="rounded-full text-xs"
            >
              {t('notices.category_all')}
            </Button>
            <Button
              size="sm"
              variant={selectedCategory === 'ভর্তি' ? 'default' : 'outline'}
              onClick={() => setSelectedCategory('ভর্তি')}
              className="rounded-full text-xs"
            >
              {t('notices.category_admission')}
            </Button>
            <Button
              size="sm"
              variant={selectedCategory === 'ডাইনিং' ? 'default' : 'outline'}
              onClick={() => setSelectedCategory('ডাইনিং')}
              className="rounded-full text-xs"
            >
              {t('notices.category_dining')}
            </Button>
            <Button
              size="sm"
              variant={selectedCategory === 'সাধারণ' ? 'default' : 'outline'}
              onClick={() => setSelectedCategory('সাধারণ')}
              className="rounded-full text-xs"
            >
              {t('notices.category_general')}
            </Button>
          </div>
        </div>
      </section>

      {/* Notices Feed */}
      <section className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-40 w-full rounded-2xl" />
            ))}
          </div>
        ) : isError ? (
          <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center space-y-4">
            <AlertCircle className="w-12 h-12 text-rose-500 mx-auto" />
            <h3 className="text-lg font-bold text-gray-800">
              {isEn ? 'Failed to load notices' : 'নোটিশ লোড করা সম্ভব হয়নি'}
            </h3>
            <p className="text-xs text-gray-500 max-w-sm mx-auto">
              {(error as any)?.message || 'সার্ভার থেকে নোটিশ লোড করতে সমস্যা হয়েছে।'}
            </p>
            <Button onClick={() => refetch()} variant="outline" size="sm" className="gap-2">
              <RefreshCw className="w-4 h-4" />
              <span>{isEn ? 'Retry' : 'পুনরায় লোড করুন'}</span>
            </Button>
          </div>
        ) : filteredNotices.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center space-y-3">
            <FileText className="w-12 h-12 text-gray-300 mx-auto" />
            <h4 className="text-base font-bold text-gray-800">
              {isEn ? 'No notices found' : 'কোনো নোটিশ পাওয়া যায়নি'}
            </h4>
            <p className="text-xs text-gray-500 max-w-sm mx-auto">
              {isEn
                ? 'There are currently no active public announcements.'
                : 'বর্তমানে কোনো নোটিশ নেই। নতুন নোটিশ প্রকাশিত হলে এখানে দেখতে পাবেন।'}
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
                  className={`bg-white rounded-2xl border p-6 sm:p-8 transition-all space-y-4 ${
                    notice.isPinned
                      ? 'border-emerald-300 ring-1 ring-emerald-100 shadow-sm'
                      : 'border-gray-200 hover:border-gray-300 shadow-xs'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-gray-100 pb-3">
                    <div className="flex items-center gap-2">
                      {notice.isPinned && (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded-full">
                          <Pin className="w-3 h-3 text-emerald-700" />
                          <span>{isEn ? 'Important' : 'জরুরি / পিনযুক্ত'}</span>
                        </span>
                      )}
                      <Badge variant="outline" className="text-xs">
                        {formatNoticeCategory(notice.category, !!isEn)}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-gray-400">
                      <Calendar className="w-3.5 h-3.5" />
                      <span>
                        {notice.publishedAt
                          ? new Date(notice.publishedAt).toLocaleDateString(isEn ? 'en-US' : 'bn-BD')
                          : ''}
                      </span>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-xl font-bold text-gray-900 leading-snug">
                      {displayTitle}
                    </h3>
                    <p className="text-sm text-gray-600 leading-relaxed mt-2 line-clamp-3">
                      {displayContent}
                    </p>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-gray-100 text-xs">
                    <span className="text-gray-400">
                      {isEn ? 'Issued by: ' : 'প্রচারক: '}
                      <strong className="text-gray-700">
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
                      <span>{t('notices.read_full')}</span>
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Notice Detail Dialog */}
      {activeNotice && (
        <Dialog open={!!activeNotice} onOpenChange={(open) => !open && setActiveNotice(null)}>
          <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <div className="flex items-center gap-2 mb-1">
                <Badge variant="outline" className="text-xs">
                  {formatNoticeCategory(activeNotice.category, !!isEn)}
                </Badge>
                {activeNotice.isPinned && (
                  <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full">
                    {isEn ? 'Important' : 'পিনযুক্ত'}
                  </span>
                )}
                <span className="text-xs text-gray-400">
                  {activeNotice.publishedAt
                    ? new Date(activeNotice.publishedAt).toLocaleDateString(isEn ? 'en-US' : 'bn-BD')
                    : ''}
                </span>
              </div>
              <DialogTitle className="text-xl leading-snug">
                {isEn && activeNotice.titleEn ? activeNotice.titleEn : activeNotice.title}
              </DialogTitle>
              <DialogDescription>
                {isEn ? 'Issued by: ' : 'প্রচারক: '}
                {activeNotice.createdByUser?.name || 'Hostel Administration'}
              </DialogDescription>
            </DialogHeader>

            <div className="p-4 bg-slate-50 rounded-xl border border-gray-200 text-sm leading-relaxed text-gray-700 whitespace-pre-line">
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