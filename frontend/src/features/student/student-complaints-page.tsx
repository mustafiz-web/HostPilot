import React, { useState } from 'react';
import {
  MessageSquareWarning,
  Plus,
  CheckCircle2,
  Clock,
  Eye,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { StatusBadge } from '@/components/ui/status-badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  INITIAL_STUDENT_COMPLAINTS,
  type MockStudentComplaint,
} from './mock-data/student-mock-data';

export const StudentComplaintsPage: React.FC = () => {
  const [complaints, setComplaints] = useState<MockStudentComplaint[]>(INITIAL_STUDENT_COMPLAINTS);
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'PENDING' | 'IN_PROGRESS' | 'RESOLVED'>('ALL');
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [viewComplaint, setViewComplaint] = useState<MockStudentComplaint | null>(null);

  const [newComplaint, setNewComplaint] = useState({
    title: '',
    category: 'PLUMBING' as MockStudentComplaint['category'],
    priority: 'MEDIUM' as MockStudentComplaint['priority'],
    description: '',
  });

  const filtered = complaints.filter((c) => {
    if (statusFilter === 'ALL') return true;
    return c.status === statusFilter;
  });

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const created: MockStudentComplaint = {
      id: `cmp-${Date.now()}`,
      title: newComplaint.title,
      category: newComplaint.category,
      priority: newComplaint.priority,
      status: 'PENDING',
      submittedAt: '১৮ নভেম্বর, ২০২৬',
      description: newComplaint.description,
    };
    setComplaints([created, ...complaints]);
    setAddModalOpen(false);
    setNewComplaint({
      title: '',
      category: 'PLUMBING',
      priority: 'MEDIUM',
      description: '',
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
            <MessageSquareWarning className="w-6 h-6 text-emerald-600" />
            <span>আমার দাখিলকৃত অভিযোগ (My Complaints)</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-500">
            রুমের মেইনটেন্যান্স, ওয়াইফাই, ইলেকট্রিক্যাল ও ডাইনিং সংক্রান্ত অভিযোগ ও অগ্রগতি ট্র্যাকিং
          </p>
        </div>
        <Button onClick={() => setAddModalOpen(true)} className="gap-2 shadow-xs self-start sm:self-auto">
          <Plus className="w-4 h-4" />
          <span>নতুন অভিযোগ দাখিল করুন</span>
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
            variant={statusFilter === 'IN_PROGRESS' ? 'default' : 'outline'}
            onClick={() => setStatusFilter('IN_PROGRESS')}
            className="text-xs rounded-full h-8"
          >
            প্রক্রিয়াধীন ({complaints.filter((c) => c.status === 'IN_PROGRESS').length})
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
            variant={statusFilter === 'RESOLVED' ? 'default' : 'outline'}
            onClick={() => setStatusFilter('RESOLVED')}
            className="text-xs rounded-full h-8"
          >
            সমাধানকৃত ({complaints.filter((c) => c.status === 'RESOLVED').length})
          </Button>
        </div>
      </div>

      {/* Complaints List Cards */}
      <div className="space-y-4">
        {filtered.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-3">
            <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto" />
            <h3 className="font-bold text-slate-700">কোনো অভিযোগ রেকর্ড নেই</h3>
            <p className="text-xs text-slate-400">এই ফিল্টারে কোনো অভিযোগ পাওয়া যায়নি।</p>
          </div>
        ) : (
          filtered.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-3 hover:border-slate-300 transition-all"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2.5">
                  <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                    {item.category}
                  </span>
                  <h3 className="font-bold text-base text-slate-900">{item.title}</h3>
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      item.priority === 'URGENT' || item.priority === 'HIGH'
                        ? 'bg-rose-100 text-rose-800'
                        : 'bg-slate-100 text-slate-700'
                    }`}
                  >
                    অগ্রাধিকার: {item.priority}
                  </span>
                  <StatusBadge status={item.status} />
                </div>
              </div>

              <p className="text-xs text-slate-600 leading-relaxed">{item.description}</p>

              {item.adminNote && (
                <div className="p-3 bg-emerald-50/80 rounded-xl border border-emerald-200/60 text-xs text-emerald-900 flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold">প্রশাসনের গৃহীত পদক্ষেপ: </span>
                    <span>{item.adminNote}</span>
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs text-slate-400">
                <div className="flex items-center gap-4">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    <span>দাখিল: {item.submittedAt}</span>
                  </span>
                  {item.resolvedAt && (
                    <span className="text-emerald-700 font-medium">
                      সমাধান: {item.resolvedAt}
                    </span>
                  )}
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
          ))
        )}
      </div>

      {/* Add Complaint Modal */}
      <Dialog open={addModalOpen} onOpenChange={setAddModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>নতুন অভিযোগ দাখিল করুন</DialogTitle>
            <DialogDescription>
              আপনার রুমের বা হোস্টেল চত্বরের সমস্যা সুনির্দিষ্টভাবে বর্ণনা করুন।
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleAddSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="complaintTitle" className="text-xs font-semibold">
                অভিযোগের শিরোনাম
              </Label>
              <Input
                id="complaintTitle"
                placeholder="যেমন: সিলিং ফ্যানের রেগুলেটর সমস্যা"
                value={newComplaint.title}
                onChange={(e) => setNewComplaint({ ...newComplaint, title: e.target.value })}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
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
                      category: e.target.value as MockStudentComplaint['category'],
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
                      priority: e.target.value as MockStudentComplaint['priority'],
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
                সমস্যার বিস্তারিত বিবরণ
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

            <DialogFooter className="gap-2 sm:gap-0 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setAddModalOpen(false)}
              >
                বাতিল
              </Button>
              <Button type="submit">অভিযোগ জমা দিন</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* View Complaint Modal */}
      {viewComplaint && (
        <Dialog open={!!viewComplaint} onOpenChange={(open) => !open && setViewComplaint(null)}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <div className="flex items-center gap-2 mb-1">
                <StatusBadge status={viewComplaint.status} />
                <span className="text-xs text-slate-400 font-mono">{viewComplaint.category}</span>
              </div>
              <DialogTitle className="text-base">{viewComplaint.title}</DialogTitle>
              <DialogDescription>
                দাখিলের তারিখ: {viewComplaint.submittedAt}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-2 text-xs text-slate-700">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                <span className="font-bold text-slate-900 block">বিবরণ:</span>
                <p className="leading-relaxed text-slate-600">{viewComplaint.description}</p>
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
