import React, { useState } from 'react';
import { Bell, Plus, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
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

interface AdminNotice {
  id: string;
  title: string;
  category: string;
  status: 'PUBLISHED' | 'DRAFT';
  publishedAt: string;
  content: string;
}

const INITIAL_ADMIN_NOTICES: AdminNotice[] = [
  {
    id: 'n-1',
    title: 'নতুন শিক্ষাবর্ষের হোস্টেল ভর্তি আবেদন শুরু',
    category: 'ভর্তি',
    status: 'PUBLISHED',
    publishedAt: '১৮ নভেম্বর, ২০২৬',
    content: 'আসন্ন সেমিস্টারের শিক্ষার্থীদের জন্য হোস্টেলের অনলাইন সিট বরাদ্দ আবেদন শুরু হয়েছে।',
  },
  {
    id: 'n-2',
    title: 'হোস্টেল ডাইনিং মিল চার্জ ও মেনু হালনাগাদ সংক্রান্ত',
    category: 'ডাইনিং',
    status: 'PUBLISHED',
    publishedAt: '১৫ নভেম্বর, ২০২৬',
    content: 'ডাইনিং কমিটি চলতি মাসের জন্য উন্নত ও পুষ্টিকর খাদ্য তালিকা প্রকাশ করেছে।',
  },
  {
    id: 'n-3',
    title: 'শীতকালীন অবকাশে হোস্টেল সংস্কারের খসড়া নোটিশ',
    category: 'সাধারণ',
    status: 'DRAFT',
    publishedAt: 'খসড়া (অপ্রকাশিত)',
    content: 'আগামী মাসে অনুষ্ঠিতব্য শীতকালীন ছুটির সময়ে হোস্টেলের পেইন্টিং ও মেরামত কাজের খসড়া নোটিশ।',
  },
];

export const NoticesAdminPage: React.FC = () => {
  const [notices, setNotices] = useState<AdminNotice[]>(INITIAL_ADMIN_NOTICES);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [viewNotice, setViewNotice] = useState<AdminNotice | null>(null);

  const [newNotice, setNewNotice] = useState({
    title: '',
    category: 'সাধারণ',
    status: 'PUBLISHED' as 'PUBLISHED' | 'DRAFT',
    content: '',
  });

  const handleCreateNotice = (e: React.FormEvent) => {
    e.preventDefault();
    const entry: AdminNotice = {
      id: `n-${Date.now()}`,
      title: newNotice.title,
      category: newNotice.category,
      status: newNotice.status,
      publishedAt: newNotice.status === 'PUBLISHED' ? '১৮ নভেম্বর, ২০২৬' : 'খসড়া (অপ্রকাশিত)',
      content: newNotice.content,
    };
    setNotices([entry, ...notices]);
    setAddModalOpen(false);
    setNewNotice({
      title: '',
      category: 'সাধারণ',
      status: 'PUBLISHED',
      content: '',
    });
  };

  const handleTogglePublish = (id: string) => {
    setNotices((prev) =>
      prev.map((n) =>
        n.id === id
          ? {
              ...n,
              status: n.status === 'PUBLISHED' ? 'DRAFT' : 'PUBLISHED',
              publishedAt: n.status === 'DRAFT' ? '১৮ নভেম্বর, ২০২৬' : 'খসড়া (অপ্রকাশিত)',
            }
          : n
      )
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
            <Bell className="w-6 h-6 text-emerald-600" />
            <span>নোটিশ বোর্ড পরিচালনা (Notice Management)</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-500">
            হোস্টেল নোটিশ তৈরি, প্রকাশ, খসড়া সংরক্ষণ ও সংরক্ষণাগার ব্যবস্থাপনা
          </p>
        </div>
        <Button onClick={() => setAddModalOpen(true)} className="gap-2 shadow-xs self-start sm:self-auto">
          <Plus className="w-4 h-4" />
          <span>নতুন নোটিশ লিখুন</span>
        </Button>
      </div>

      {/* Notices Table */}
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>শিরোনাম</TableHead>
            <TableHead>ক্যাটাগরি</TableHead>
            <TableHead>প্রকাশের তারিখ</TableHead>
            <TableHead>স্ট্যাটাস</TableHead>
            <TableHead className="text-right">অ্যাকশন</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {notices.map((n) => (
            <TableRow key={n.id}>
              <TableCell className="font-bold text-slate-900 text-sm max-w-md">
                {n.title}
              </TableCell>
              <TableCell>
                <Badge variant="outline" className="text-xs">
                  {n.category}
                </Badge>
              </TableCell>
              <TableCell className="text-xs text-slate-500">{n.publishedAt}</TableCell>
              <TableCell>
                <span
                  className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full ${
                    n.status === 'PUBLISHED'
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-amber-100 text-amber-800'
                  }`}
                >
                  {n.status === 'PUBLISHED' ? 'প্রকাশিত' : 'খসড়া (Draft)'}
                </span>
              </TableCell>
              <TableCell className="text-right space-x-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setViewNotice(n)}
                  className="h-8 px-2 text-xs text-slate-700 hover:text-emerald-700"
                >
                  <Eye className="w-3.5 h-3.5 mr-1" />
                  <span>দেখুন</span>
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleTogglePublish(n.id)}
                  className="h-8 px-2 text-xs"
                >
                  {n.status === 'PUBLISHED' ? 'খসড়া করুন' : 'প্রকাশ করুন'}
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {/* Create Notice Modal */}
      <Dialog open={addModalOpen} onOpenChange={setAddModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>নতুন নোটিশ তৈরি করুন</DialogTitle>
            <DialogDescription>
              ছাত্রদের জন্য প্রয়োজনীয় নোটিশ লিখুন এবং প্রকাশ বা খসড়া হিসেবে সংরক্ষণ করুন।
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCreateNotice} className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label htmlFor="n-title">নোটিশের শিরোনাম *</Label>
              <Input
                id="n-title"
                required
                placeholder="যেমন: গেট ক্লোজিং সময়সূচি পরিবর্তন"
                value={newNotice.title}
                onChange={(e) => setNewNotice({ ...newNotice, title: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>ক্যাটাগরি</Label>
                <select
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-xs focus:ring-2 focus:ring-ring"
                  value={newNotice.category}
                  onChange={(e) => setNewNotice({ ...newNotice, category: e.target.value })}
                >
                  <option value="সাধারণ">সাধারণ</option>
                  <option value="ভর্তি">ভর্তি</option>
                  <option value="ডাইনিং">ডাইনিং</option>
                  <option value="ছুটি">ছুটি</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <Label>প্রকাশের স্ট্যাটাস</Label>
                <select
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-xs focus:ring-2 focus:ring-ring"
                  value={newNotice.status}
                  onChange={(e) => setNewNotice({ ...newNotice, status: e.target.value as any })}
                >
                  <option value="PUBLISHED">সরাসরি প্রকাশ করুন (Published)</option>
                  <option value="DRAFT">খসড়া রাখুন (Draft)</option>
                </select>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="n-content">নোটিশের বিস্তারিত বক্তব্য *</Label>
              <Textarea
                id="n-content"
                required
                rows={4}
                placeholder="নোটিশের বিস্তারিত তথ্য লিখুন..."
                value={newNotice.content}
                onChange={(e) => setNewNotice({ ...newNotice, content: e.target.value })}
              />
            </div>

            <DialogFooter className="gap-2 pt-2">
              <Button type="button" variant="outline" onClick={() => setAddModalOpen(false)}>
                বাতিল
              </Button>
              <Button type="submit">নোটিশ সংরক্ষণ করুন</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* View Notice Detail Dialog */}
      {viewNotice && (
        <Dialog open={!!viewNotice} onOpenChange={(open) => !open && setViewNotice(null)}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <div className="flex items-center gap-2 mb-1">
                <Badge variant="outline">{viewNotice.category}</Badge>
                <span className="text-xs text-slate-400">{viewNotice.publishedAt}</span>
              </div>
              <DialogTitle className="text-lg">{viewNotice.title}</DialogTitle>
            </DialogHeader>

            <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 my-2 text-xs text-slate-700 leading-relaxed">
              {viewNotice.content}
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setViewNotice(null)}>
                বন্ধ করুন
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};
