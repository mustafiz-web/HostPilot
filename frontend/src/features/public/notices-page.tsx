import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Bell, Search, Pin, Calendar, Eye } from 'lucide-react';
import { MOCK_NOTICES, type MockNotice } from './mock-data/public-mock-data';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';

export const NoticesPage: React.FC = () => {
  const { t, i18n } = useTranslation();
  const isEn = i18n.language?.startsWith('en');

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [activeNotice, setActiveNotice] = useState<MockNotice | null>(null);

  const filteredNotices = MOCK_NOTICES.filter((notice) => {
    const matchesCategory = selectedCategory === 'ALL' || notice.category === selectedCategory;
    const title = isEn ? notice.titleEn.toLowerCase() : notice.titleBn.toLowerCase();
    const matchesSearch = title.includes(searchTerm.toLowerCase());
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
              {t('notices.all_categories')}
            </Button>
            <Button
              size="sm"
              variant={selectedCategory === 'ADMISSION' ? 'default' : 'outline'}
              onClick={() => setSelectedCategory('ADMISSION')}
              className="rounded-full text-xs"
            >
              ভর্তি (Admission)
            </Button>
            <Button
              size="sm"
              variant={selectedCategory === 'DINING' ? 'default' : 'outline'}
              onClick={() => setSelectedCategory('DINING')}
              className="rounded-full text-xs"
            >
              ডাইনিং (Dining)
            </Button>
            <Button
              size="sm"
              variant={selectedCategory === 'GENERAL' ? 'default' : 'outline'}
              onClick={() => setSelectedCategory('GENERAL')}
              className="rounded-full text-xs"
            >
              সাধারণ (General)
            </Button>
          </div>
        </div>
      </section>

      {/* Notices List */}
      <section className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl space-y-4">
        {filteredNotices.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center space-y-3">
            <Bell className="w-8 h-8 text-gray-300 mx-auto" />
            <h3 className="font-bold text-gray-700">কোনো নোটিশ খুঁজে পাওয়া যায়নি</h3>
            <p className="text-xs text-gray-500">অনুগ্রহ করে অন্য শব্দ বা ক্যাটাগরি দিয়ে চেষ্টা করুন।</p>
          </div>
        ) : (
          filteredNotices.map((notice) => (
            <div
              key={notice.id}
              className={`bg-white rounded-2xl border p-6 shadow-xs hover:border-emerald-300 transition-all flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 ${
                notice.isPinned ? 'border-emerald-300 bg-emerald-50/20' : 'border-gray-200'
              }`}
            >
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  {notice.isPinned && (
                    <Badge variant="default" className="gap-1 bg-emerald-600 text-white text-[10px]">
                      <Pin className="w-3 h-3" />
                      <span>{t('notices.pinned')}</span>
                    </Badge>
                  )}
                  <Badge variant="outline" className="text-[10px]">
                    {isEn ? notice.categoryLabelEn : notice.categoryLabelBn}
                  </Badge>
                  <span className="flex items-center gap-1 text-xs text-gray-400">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>{notice.publishedDate}</span>
                  </span>
                </div>

                <h3 className="text-lg font-bold text-gray-900">
                  {isEn ? notice.titleEn : notice.titleBn}
                </h3>
                <p className="text-xs text-gray-600 line-clamp-2 max-w-2xl leading-relaxed">
                  {isEn ? notice.contentEn : notice.contentBn}
                </p>
              </div>

              <div className="shrink-0">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setActiveNotice(notice)}
                  className="gap-1 text-xs font-semibold"
                >
                  <Eye className="w-3.5 h-3.5 text-emerald-600" />
                  <span>{t('notices.read_more')}</span>
                </Button>
              </div>
            </div>
          ))
        )}
      </section>

      {/* Notice Detail Dialog */}
      {activeNotice && (
        <Dialog open={!!activeNotice} onOpenChange={(open) => !open && setActiveNotice(null)}>
          <DialogContent className="max-w-xl">
            <DialogHeader>
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="outline">
                  {isEn ? activeNotice.categoryLabelEn : activeNotice.categoryLabelBn}
                </Badge>
                <span className="text-xs text-gray-400">{activeNotice.publishedDate}</span>
              </div>
              <DialogTitle className="text-xl leading-snug">
                {isEn ? activeNotice.titleEn : activeNotice.titleBn}
              </DialogTitle>
              <DialogDescription className="text-xs text-gray-500">
                {isEn ? 'Hostel Official Announcement' : 'হোস্টেল কর্তৃপক্ষের অফিশিয়াল বিজ্ঞপ্তি'}
              </DialogDescription>
            </DialogHeader>

            <div className="py-4 border-y border-gray-100 my-2">
              <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">
                {isEn ? activeNotice.contentEn : activeNotice.contentBn}
              </p>
            </div>

            <DialogFooter>
              <Button onClick={() => setActiveNotice(null)} variant="default">
                ঠিক আছে (Close)
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};
