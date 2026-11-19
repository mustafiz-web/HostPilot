import React, { useState } from 'react';
import {
  Bell,
  Search,
  Eye,
  Pin,
  Calendar,
} from 'lucide-react';
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
import {
  STUDENT_NOTICES,
  type MockStudentNotice,
} from './mock-data/student-mock-data';

export const StudentNoticesPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [activeNotice, setActiveNotice] = useState<MockStudentNotice | null>(null);

  const filteredNotices = STUDENT_NOTICES.filter((n) => {
    const matchesCat = selectedCategory === 'ALL' || n.category.includes(selectedCategory);
    const matchesSearch =
      n.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      n.content.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCat && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
            <Bell className="w-6 h-6 text-emerald-600" />
            <span>হোস্টেল নোটিশ বোর্ড (Hostel Notices)</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-500">
            কর্তৃপক্ষের জরুরি প্রজ্ঞাপন, সিট নবায়ন, ডাইনিং ও প্রশাসনিক নির্দেশনা
          </p>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <Input
            placeholder="নোটিশ অনুসন্ধান করুন..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 h-9 text-xs sm:text-sm"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          <span className="text-xs text-slate-500 font-medium">ক্যাটাগরি:</span>
          <Button
            size="sm"
            variant={selectedCategory === 'ALL' ? 'default' : 'outline'}
            onClick={() => setSelectedCategory('ALL')}
            className="text-xs rounded-full h-8"
          >
            সকল নোটিশ
          </Button>
          <Button
            size="sm"
            variant={selectedCategory === 'ভর্তি' ? 'default' : 'outline'}
            onClick={() => setSelectedCategory('ভর্তি')}
            className="text-xs rounded-full h-8"
          >
            সিট ও ভর্তি
          </Button>
          <Button
            size="sm"
            variant={selectedCategory === 'ডাইনিং' ? 'default' : 'outline'}
            onClick={() => setSelectedCategory('ডাইনিং')}
            className="text-xs rounded-full h-8"
          >
            ডাইনিং
          </Button>
          <Button
            size="sm"
            variant={selectedCategory === 'সাধারণ' ? 'default' : 'outline'}
            onClick={() => setSelectedCategory('সাধারণ')}
            className="text-xs rounded-full h-8"
          >
            প্রশাসনিক
          </Button>
        </div>
      </div>

      {/* Notices Feed */}
      <div className="space-y-4">
        {filteredNotices.map((notice) => (
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
                    <span>পিনযুক্ত নোটিশ</span>
                  </span>
                )}
                <Badge variant="outline" className="text-xs">
                  {notice.category}
                </Badge>
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-400">
                <Calendar className="w-3.5 h-3.5" />
                <span>{notice.publishedAt}</span>
              </div>
            </div>

            <h3 className="text-base font-bold text-slate-900">{notice.title}</h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed line-clamp-3">
              {notice.content}
            </p>

            <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
              <span className="text-slate-400">
                প্রচারক: <strong className="text-slate-700">{notice.author}</strong>
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setActiveNotice(notice)}
                className="text-xs text-emerald-700 hover:text-emerald-800 gap-1"
              >
                <Eye className="w-3.5 h-3.5" />
                <span>সম্পূর্ণ পড়ুন</span>
              </Button>
            </div>
          </div>
        ))}
      </div>

      {/* Notice Detail Dialog */}
      {activeNotice && (
        <Dialog open={!!activeNotice} onOpenChange={(open) => !open && setActiveNotice(null)}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <div className="flex items-center gap-2 mb-1">
                <Badge variant="outline" className="text-xs">
                  {activeNotice.category}
                </Badge>
                <span className="text-xs text-slate-400">{activeNotice.publishedAt}</span>
              </div>
              <DialogTitle className="text-lg leading-snug">{activeNotice.title}</DialogTitle>
              <DialogDescription>
                প্রচারক: {activeNotice.author}
              </DialogDescription>
            </DialogHeader>

            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs sm:text-sm leading-relaxed text-slate-700 whitespace-pre-line">
              {activeNotice.content}
            </div>

            <DialogFooter>
              <Button variant="outline" size="sm" onClick={() => setActiveNotice(null)}>
                বন্ধ করুন
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};
