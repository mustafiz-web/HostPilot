import React, { useState } from 'react';
import { KeyRound, Plus, UserX } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
import { INITIAL_MOCK_ALLOCATIONS, type MockAllocation } from './mock-data/admin-mock-data';

export const AllocationsPage: React.FC = () => {
  const [allocations, setAllocations] = useState<MockAllocation[]>(INITIAL_MOCK_ALLOCATIONS);
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE' | 'VACATED'>('ALL');
  const [allocateModalOpen, setAllocateModalOpen] = useState(false);
  const [vacateTarget, setVacateTarget] = useState<MockAllocation | null>(null);

  const [newAlloc, setNewAlloc] = useState({
    studentName: 'রাফসান আহমেদ (Approved Applicant)',
    studentCode: 'HP-STU-2026-005',
    roomNumber: '১০২',
    bedCode: 'B',
    startDate: '১৮ নভেম্বর, ২০২৬',
  });

  const filtered = allocations.filter((a) => {
    if (statusFilter === 'ALL') return true;
    return a.status === statusFilter;
  });

  const handleCreateAllocation = (e: React.FormEvent) => {
    e.preventDefault();
    const entry: MockAllocation = {
      id: `alloc-${Date.now()}`,
      studentName: newAlloc.studentName,
      studentCode: newAlloc.studentCode,
      roomNumber: newAlloc.roomNumber,
      bedCode: newAlloc.bedCode,
      startDate: newAlloc.startDate,
      endDate: null,
      status: 'ACTIVE',
    };
    setAllocations([entry, ...allocations]);
    setAllocateModalOpen(false);
  };

  const handleConfirmVacate = () => {
    if (!vacateTarget) return;
    setAllocations((prev) =>
      prev.map((a) =>
        a.id === vacateTarget.id
          ? { ...a, status: 'VACATED', endDate: '১৮ নভেম্বর, ২০২৬' }
          : a
      )
    );
    setVacateTarget(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
            <KeyRound className="w-6 h-6 text-emerald-600" />
            <span>সিট বরাদ্দ ও হিস্ট্রি (Room Allocations)</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-500">
            শিক্ষার্থীদের নির্দিষ্ট বেডে বরাদ্দ প্রদান এবং সিট ছেড়ে দেওয়া (Vacate) ইতিহাস ট্র্যাকিং
          </p>
        </div>
        <Button onClick={() => setAllocateModalOpen(true)} className="gap-2 shadow-xs self-start sm:self-auto">
          <Plus className="w-4 h-4" />
          <span>নতুন সিট বরাদ্দ দিন</span>
        </Button>
      </div>

      {/* Filter Strip */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center gap-2">
        <span className="text-xs text-slate-500 font-medium">স্ট্যাটাস:</span>
        <Button
          size="sm"
          variant={statusFilter === 'ALL' ? 'default' : 'outline'}
          onClick={() => setStatusFilter('ALL')}
          className="text-xs rounded-full h-8"
        >
          সব ({allocations.length})
        </Button>
        <Button
          size="sm"
          variant={statusFilter === 'ACTIVE' ? 'default' : 'outline'}
          onClick={() => setStatusFilter('ACTIVE')}
          className="text-xs rounded-full h-8"
        >
          সক্রিয় বরাদ্দ ({allocations.filter((a) => a.status === 'ACTIVE').length})
        </Button>
        <Button
          size="sm"
          variant={statusFilter === 'VACATED' ? 'default' : 'outline'}
          onClick={() => setStatusFilter('VACATED')}
          className="text-xs rounded-full h-8"
        >
          প্রাক্তন / সিট বাতিল ({allocations.filter((a) => a.status === 'VACATED').length})
        </Button>
      </div>

      {/* Allocations Table */}
      <Table>
        <TableHeader>
          <TableRow>
            <TableRow>
              <TableHead>শিক্ষার্থী ও কোড</TableHead>
              <TableHead>রুম নং</TableHead>
              <TableHead>বেড নং</TableHead>
              <TableHead>বরাদ্দের শুরুর তারিখ</TableHead>
              <TableHead>সমাপ্তির তারিখ</TableHead>
              <TableHead>স্ট্যাটাস</TableHead>
              <TableHead className="text-right">অ্যাকশন</TableHead>
            </TableRow>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filtered.map((item) => (
            <TableRow key={item.id}>
              <TableCell>
                <div className="font-bold text-slate-900 text-sm">{item.studentName}</div>
                <div className="text-xs text-slate-400 font-mono">{item.studentCode}</div>
              </TableCell>
              <TableCell className="font-bold text-slate-800">
                রুম {item.roomNumber}
              </TableCell>
              <TableCell>
                <span className="font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md text-xs border border-emerald-200">
                  বেড {item.bedCode}
                </span>
              </TableCell>
              <TableCell className="text-xs text-slate-600">{item.startDate}</TableCell>
              <TableCell className="text-xs text-slate-400">
                {item.endDate || '—'}
              </TableCell>
              <TableCell>
                <StatusBadge status={item.status} />
              </TableCell>
              <TableCell className="text-right">
                {item.status === 'ACTIVE' ? (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setVacateTarget(item)}
                    className="h-8 px-2.5 text-xs text-rose-700 border-rose-200 hover:bg-rose-50"
                  >
                    <UserX className="w-3.5 h-3.5 mr-1 text-rose-600" />
                    <span>সিট ছাড়ুন (Vacate)</span>
                  </Button>
                ) : (
                  <span className="text-xs text-slate-400">হিস্ট্রি সংরক্ষিত</span>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {/* Allocate Bed Modal */}
      <Dialog open={allocateModalOpen} onOpenChange={setAllocateModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>নতুন সিট বরাদ্দ ফরম</DialogTitle>
            <DialogDescription>
              অনুমোদিত শিক্ষার্থীকে নির্দিষ্ট রুমে খালি থাকা বেডে বরাদ্দ দিন।
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCreateAllocation} className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label>অনুমোদিত শিক্ষার্থী নির্বাচন</Label>
              <select
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-xs focus:ring-2 focus:ring-ring"
                value={newAlloc.studentName}
                onChange={(e) => setNewAlloc({ ...newAlloc, studentName: e.target.value })}
              >
                <option value="রাফসান আহমেদ (Approved Applicant)">রাফসান আহমেদ (ADM-2026-7845)</option>
                <option value="জুবায়ের হোসেন (Approved Applicant)">জুবায়ের হোসেন (ADM-2026-8912)</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>রুম নির্বাচন</Label>
                <select
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-xs focus:ring-2 focus:ring-ring"
                  value={newAlloc.roomNumber}
                  onChange={(e) => setNewAlloc({ ...newAlloc, roomNumber: e.target.value })}
                >
                  <option value="১০২">রুম ১০২ (ডাবল)</option>
                  <option value="২০১">রুম ২০১ (ফোর-বেড)</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <Label>খালি বেড</Label>
                <select
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-xs focus:ring-2 focus:ring-ring"
                  value={newAlloc.bedCode}
                  onChange={(e) => setNewAlloc({ ...newAlloc, bedCode: e.target.value })}
                >
                  <option value="B">বেড B (খালি)</option>
                  <option value="C">বেড C (খালি)</option>
                </select>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="alloc-date">বরাদ্দের তারিখ</Label>
              <Input
                id="alloc-date"
                value={newAlloc.startDate}
                onChange={(e) => setNewAlloc({ ...newAlloc, startDate: e.target.value })}
              />
            </div>

            <DialogFooter className="gap-2 pt-2">
              <Button type="button" variant="outline" onClick={() => setAllocateModalOpen(false)}>
                বাতিল
              </Button>
              <Button type="submit">বরাদ্দ নিশ্চিত করুন</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Vacate Confirmation Modal */}
      {vacateTarget && (
        <Dialog open={!!vacateTarget} onOpenChange={(open) => !open && setVacateTarget(null)}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="text-rose-700">সিট বাতিলের নিশ্চিতকরণ (Vacate Bed)</DialogTitle>
              <DialogDescription>
                আপনি কি নিশ্চিত যে শিক্ষার্থী <strong>{vacateTarget.studentName}</strong> (রুম {vacateTarget.roomNumber}, বেড {vacateTarget.bedCode}) এর সিট বাতিল করতে চান?
              </DialogDescription>
            </DialogHeader>
            <div className="p-3 bg-amber-50 rounded-lg text-xs text-amber-800 border border-amber-200">
              এই সিটটি খালি (AVAILABLE) হিসেবে চিহ্নিত হবে এবং অতীত হিস্ট্রিতে সমাপ্তির তারিখ যুক্ত হবে। কোনো হিস্ট্রি মুছে ফেলা হবে না।
            </div>
            <DialogFooter className="gap-2">
              <Button variant="outline" onClick={() => setVacateTarget(null)}>
                বাতিল
              </Button>
              <Button variant="destructive" onClick={handleConfirmVacate}>
                হ্যাঁ, সিট খালি করুন
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};
