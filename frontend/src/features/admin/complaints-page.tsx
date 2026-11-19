import React, { useState } from 'react';
import { AlertCircle, Search, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { StatusBadge } from '@/components/ui/status-badge';
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
import { INITIAL_MOCK_COMPLAINTS, type MockComplaint } from './mock-data/admin-mock-data';

export const ComplaintsPage: React.FC = () => {
  const [complaints, setComplaints] = useState<MockComplaint[]>(INITIAL_MOCK_COMPLAINTS);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'PENDING' | 'IN_PROGRESS' | 'RESOLVED'>('ALL');
  const [selectedComp, setSelectedComp] = useState<MockComplaint | null>(null);
  const [editStatus, setEditStatus] = useState<'PENDING' | 'IN_PROGRESS' | 'RESOLVED'>('IN_PROGRESS');
  const [resolutionNote, setResolutionNote] = useState('');

  const filtered = complaints.filter((c) => {
    const matchesStatus = statusFilter === 'ALL' || c.status === statusFilter;
    const term = searchTerm.toLowerCase();
    const matchesSearch =
      c.ticketNo.toLowerCase().includes(term) ||
      c.studentName.toLowerCase().includes(term) ||
      c.subject.toLowerCase().includes(term);
    return matchesStatus && matchesSearch;
  });

  const handleOpenStatusModal = (comp: MockComplaint) => {
    setSelectedComp(comp);
    setEditStatus(comp.status);
    setResolutionNote('');
  };

  const handleSaveStatus = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedComp) return;
    setComplaints((prev) =>
      prev.map((c) =>
        c.id === selectedComp.id ? { ...c, status: editStatus } : c
      )
    );
    setSelectedComp(null);
  };

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
            placeholder="টিকিট নং বা বিষয় দিয়ে খুঁজুন..."
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
            অপেক্ষমান ({complaints.filter((c) => c.status === 'PENDING').length})
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
            variant={statusFilter === 'RESOLVED' ? 'default' : 'outline'}
            onClick={() => setStatusFilter('RESOLVED')}
            className="text-xs rounded-full h-8"
          >
            সমাধানকৃত ({complaints.filter((c) => c.status === 'RESOLVED').length})
          </Button>
        </div>
      </div>

      {/* Complaints Table */}
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>টিকিট নম্বর</TableHead>
            <TableHead>শিক্ষার্থী ও রুম</TableHead>
            <TableHead>অভিযোগের বিষয় ও বিবরণ</TableHead>
            <TableHead>দাখিলের তারিখ</TableHead>
            <TableHead>স্ট্যাটাস</TableHead>
            <TableHead className="text-right">অ্যাকশন</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filtered.map((item) => (
            <TableRow key={item.id}>
              <TableCell className="font-mono text-xs font-bold text-slate-700">
                {item.ticketNo}
              </TableCell>
              <TableCell>
                <div className="font-bold text-slate-900 text-sm">{item.studentName}</div>
                <div className="text-xs text-slate-400">রুম {item.roomNumber}</div>
              </TableCell>
              <TableCell className="max-w-md">
                <div className="font-bold text-slate-800 text-xs">{item.subject}</div>
                <p className="text-xs text-slate-500 line-clamp-1">{item.description}</p>
              </TableCell>
              <TableCell className="text-xs text-slate-500">{item.createdAt}</TableCell>
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

      {/* Update Complaint Status Dialog */}
      {selectedComp && (
        <Dialog open={!!selectedComp} onOpenChange={(open) => !open && setSelectedComp(null)}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-mono text-slate-400">{selectedComp.ticketNo}</span>
                <StatusBadge status={selectedComp.status} />
              </div>
              <DialogTitle className="text-lg">{selectedComp.subject}</DialogTitle>
              <DialogDescription>
                শিক্ষার্থী: {selectedComp.studentName} (রুম {selectedComp.roomNumber}) • {selectedComp.createdAt}
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSaveStatus} className="space-y-4 py-2">
              <div className="p-3 bg-slate-50 rounded-lg text-xs text-slate-700 border border-slate-100">
                <span className="font-bold block text-slate-900 mb-1">শিক্ষার্থীর বিবরণ:</span>
                <p>{selectedComp.description}</p>
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
                </select>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="res-note">প্রশাসনিক সমাধান নোট</Label>
                <Textarea
                  id="res-note"
                  rows={2}
                  placeholder="যেমন: ইলেকট্রিশিয়ান পাঠিয়ে ফ্যান মেরামত করা হয়েছে।"
                  value={resolutionNote}
                  onChange={(e) => setResolutionNote(e.target.value)}
                />
              </div>

              <DialogFooter className="gap-2 pt-2">
                <Button type="button" variant="outline" onClick={() => setSelectedComp(null)}>
                  বাতিল
                </Button>
                <Button type="submit">স্ট্যাটাস সংরক্ষণ করুন</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};
