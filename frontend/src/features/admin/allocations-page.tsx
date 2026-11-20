import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  KeyRound,
  Plus,
  UserX,
  Search,
  AlertCircle,
  Loader2,
  RefreshCw,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { StatusBadge } from '@/components/ui/status-badge';
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

interface AllocationRecord {
  id: string;
  studentId: string;
  bedId: string;
  startDate: string;
  endDate?: string | null;
  status: 'ACTIVE' | 'VACATED' | 'TRANSFERRED';
  createdAt: string;
  student: {
    id: string;
    studentCode: string;
    department: string;
    rollNumber: string;
    user: {
      name: string;
      email: string;
    };
  };
  bed: {
    id: string;
    bedCode: string;
    room: {
      roomNumber: string;
      floor: number;
      roomType: string;
      monthlyRent: number;
    };
  };
  allocatedByUser?: {
    name: string;
  };
}

interface StudentOption {
  id: string;
  studentCode: string;
  department: string;
  rollNumber: string;
  user: {
    name: string;
    email: string;
  };
  activeAllocation?: any;
}

interface RoomWithBeds {
  id: string;
  roomNumber: string;
  floor: number;
  roomType: string;
  status: string;
  beds: Array<{
    id: string;
    bedCode: string;
    identifier: string;
    status: string;
  }>;
}

export const AllocationsPage: React.FC = () => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE' | 'VACATED'>('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [allocateModalOpen, setAllocateModalOpen] = useState(false);
  const [allocateError, setAllocateError] = useState<string | null>(null);
  const [vacateTarget, setVacateTarget] = useState<AllocationRecord | null>(null);
  const [vacateError, setVacateError] = useState<string | null>(null);

  // Form State for new allocation
  const [newAlloc, setNewAlloc] = useState({
    studentId: '',
    bedId: '',
    startDate: new Date().toISOString().split('T')[0],
  });

  // Query: All Allocations
  const {
    data: allocationsResponse,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ['admin-allocations', { status: statusFilter }],
    queryFn: async () => {
      const res = await apiClient.get<AllocationRecord[]>('/allocations', {
        status: statusFilter === 'ALL' ? undefined : statusFilter,
      });
      return res.data;
    },
    staleTime: 30 * 1000,
  });

  // Query: Active Students for dropdown
  const { data: studentsResponse } = useQuery({
    queryKey: ['eligible-students-for-allocation'],
    queryFn: async () => {
      const res = await apiClient.get<StudentOption[]>('/students', { limit: 100, status: 'ACTIVE' });
      return res.data;
    },
    enabled: allocateModalOpen,
  });

  // Query: Available Rooms & Beds for dropdown
  const { data: roomsResponse } = useQuery({
    queryKey: ['available-rooms-for-allocation'],
    queryFn: async () => {
      const res = await apiClient.get<RoomWithBeds[]>('/rooms', { onlyAvailable: true });
      return res.data;
    },
    enabled: allocateModalOpen,
  });

  const allocations: AllocationRecord[] = allocationsResponse || [];
  const eligibleStudents = (studentsResponse || []).filter((s) => !s.activeAllocation);
  const availableRooms = roomsResponse || [];

  // Filter available beds from available rooms
  const availableBeds = availableRooms.flatMap((room) =>
    room.beds
      .filter((b) => b.status === 'AVAILABLE')
      .map((b) => ({
        ...b,
        roomNumber: room.roomNumber,
        floor: room.floor,
        roomType: room.roomType,
      }))
  );

  // Client search filter
  const filtered = allocations.filter((a) => {
    if (!searchTerm.trim()) return true;
    const term = searchTerm.toLowerCase();
    return (
      a.student?.user?.name?.toLowerCase().includes(term) ||
      a.student?.studentCode?.toLowerCase().includes(term) ||
      a.bed?.room?.roomNumber?.toLowerCase().includes(term)
    );
  });

  // Mutation: Allocate Bed
  const allocateMutation = useMutation({
    mutationFn: async (payload: typeof newAlloc) => {
      const res = await apiClient.post<AllocationRecord>('/allocations', payload);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-allocations'] });
      queryClient.invalidateQueries({ queryKey: ['admin-rooms'] });
      queryClient.invalidateQueries({ queryKey: ['admin-dashboard-metrics'] });
      queryClient.invalidateQueries({ queryKey: ['admin-students'] });
      setAllocateModalOpen(false);
      setAllocateError(null);
      setNewAlloc({
        studentId: '',
        bedId: '',
        startDate: new Date().toISOString().split('T')[0],
      });
    },
    onError: (err: any) => {
      setAllocateError(err.message || 'সিট বরাদ্দ করতে সমস্যা হয়েছে');
    },
  });

  // Mutation: Vacate Allocation
  const vacateMutation = useMutation({
    mutationFn: async ({ id, endDate }: { id: string; endDate: string }) => {
      const res = await apiClient.patch<AllocationRecord>(`/allocations/${id}/vacate`, {
        endDate,
      });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-allocations'] });
      queryClient.invalidateQueries({ queryKey: ['admin-rooms'] });
      queryClient.invalidateQueries({ queryKey: ['admin-dashboard-metrics'] });
      queryClient.invalidateQueries({ queryKey: ['admin-students'] });
      setVacateTarget(null);
      setVacateError(null);
    },
    onError: (err: any) => {
      setVacateError(err.message || 'সিট খালি (Vacate) করতে সমস্যা হয়েছে');
    },
  });

  const handleCreateAllocation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAlloc.studentId || !newAlloc.bedId) {
      setAllocateError('শিক্ষার্থী এবং বেড উভয়ই নির্বাচন করুন');
      return;
    }
    setAllocateError(null);
    allocateMutation.mutate(newAlloc);
  };

  const handleConfirmVacate = () => {
    if (!vacateTarget) return;
    setVacateError(null);
    vacateMutation.mutate({
      id: vacateTarget.id,
      endDate: new Date().toISOString(),
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
            <KeyRound className="w-6 h-6 text-emerald-600" />
            <span>{t('admin.allocations.title')}</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-500">
            {t('admin.allocations.subtitle')}
          </p>
        </div>
        <Button
          onClick={() => {
            setAllocateError(null);
            setAllocateModalOpen(true);
          }}
          className="gap-2 shadow-xs bg-emerald-600 hover:bg-emerald-700"
        >
          <Plus className="w-4 h-4" />
          <span>{t('admin.allocations.btn_new')}</span>
        </Button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <Input
            placeholder="নাম, রোল, রুম নম্বর দিয়ে খুঁজুন..."
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
            সব ({allocations.length})
          </Button>
          <Button
            size="sm"
            variant={statusFilter === 'ACTIVE' ? 'default' : 'outline'}
            onClick={() => setStatusFilter('ACTIVE')}
            className="text-xs rounded-full h-8"
          >
            সক্রিয় ({allocations.filter((a) => a.status === 'ACTIVE').length})
          </Button>
          <Button
            size="sm"
            variant={statusFilter === 'VACATED' ? 'default' : 'outline'}
            onClick={() => setStatusFilter('VACATED')}
            className="text-xs rounded-full h-8"
          >
            সমাপ্ত ({allocations.filter((a) => a.status === 'VACATED').length})
          </Button>
        </div>
      </div>

      {/* Main Table Card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        {isLoading ? (
          <div className="p-8 space-y-4">
            <div className="flex items-center justify-center gap-2 text-slate-500 text-sm">
              <Loader2 className="w-5 h-5 animate-spin text-emerald-600" />
              <span>বরাদ্দ তালিকা লোড হচ্ছে...</span>
            </div>
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
        ) : isError ? (
          <div className="p-8 text-center space-y-3">
            <AlertCircle className="w-8 h-8 text-rose-500 mx-auto" />
            <p className="text-sm text-slate-700 font-medium">
              {(error as any)?.message || 'সিট বরাদ্দের তথ্য লোড করা যায়নি'}
            </p>
            <Button variant="outline" size="sm" onClick={() => refetch()} className="gap-1.5">
              <RefreshCw className="w-3.5 h-3.5" />
              <span>পুনরায় চেষ্টা করুন</span>
            </Button>
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <KeyRound className="w-12 h-12 text-slate-300 mx-auto" />
            <h4 className="text-base font-bold text-slate-800">কোনো বরাদ্দের রেকর্ড নেই</h4>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              {searchTerm
                ? 'আপনার সার্চ টার্মের সাথে মিল রেখে কোনো বরাদ্দ পাওয়া যায়নি।'
                : 'বর্তমানে কোনো সক্রিয় সিট বরাদ্দ নেই। নতুন বরাদ্দ দিতে ওপরের বাটনে চাপুন।'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-50/80">
                  <TableHead className="font-semibold text-xs">শিক্ষার্থীর নাম ও কোড</TableHead>
                  <TableHead className="font-semibold text-xs">রুম ও বেড নম্বর</TableHead>
                  <TableHead className="font-semibold text-xs">মাসিক ভাড়া</TableHead>
                  <TableHead className="font-semibold text-xs">বরাদ্দের সময়কাল</TableHead>
                  <TableHead className="font-semibold text-xs">স্ট্যাটাস</TableHead>
                  <TableHead className="font-semibold text-xs text-right">পদক্ষেপ</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((item) => (
                  <TableRow key={item.id} className="hover:bg-slate-50/50">
                    <TableCell>
                      <div className="space-y-0.5">
                        <span className="font-bold text-xs text-slate-900 block">
                          {item.student?.user?.name}
                        </span>
                        <span className="text-[11px] text-slate-500 font-mono">
                          {item.student?.studentCode} • {item.student?.department} (রোল: {item.student?.rollNumber})
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-xs text-slate-800">
                          রুম {item.bed?.room?.roomNumber}
                        </span>
                        <span className="bg-emerald-50 text-emerald-800 text-[11px] font-mono px-2 py-0.5 rounded border border-emerald-200">
                          বেড {item.bed?.bedCode}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="font-mono text-xs font-semibold text-slate-700">
                      ৳ {Number(item.bed?.room?.monthlyRent || 0).toLocaleString()}
                    </TableCell>
                    <TableCell className="text-xs text-slate-600">
                      <div>
                        <span className="block font-medium">
                          শুরু: {new Date(item.startDate).toLocaleDateString()}
                        </span>
                        {item.endDate && (
                          <span className="text-[11px] text-slate-400 block">
                            সমাপ্ত: {new Date(item.endDate).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={item.status} />
                    </TableCell>
                    <TableCell className="text-right">
                      {item.status === 'ACTIVE' && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 text-rose-600 hover:text-rose-700 hover:bg-rose-50 gap-1 text-xs"
                          onClick={() => {
                            setVacateError(null);
                            setVacateTarget(item);
                          }}
                        >
                          <UserX className="w-3.5 h-3.5" />
                          <span>সিট খালি করুন</span>
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>

      {/* Allocate Bed Modal Dialog */}
      <Dialog open={allocateModalOpen} onOpenChange={setAllocateModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-base font-bold flex items-center gap-2">
              <KeyRound className="w-5 h-5 text-emerald-600" />
              <span>নতুন সিট বরাদ্দ (Allocate Bed)</span>
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-500">
              শুধুমাত্র সক্রিয় এবং বরাদ্দহীন শিক্ষার্থীকে ফাঁকা বেডে বরাদ্দ দেওয়া যাবে।
            </DialogDescription>
          </DialogHeader>

          {allocateError && (
            <Alert variant="destructive" className="bg-rose-50 border-rose-200 text-rose-800 text-xs">
              <AlertCircle className="w-4 h-4 text-rose-600" />
              <AlertDescription>{allocateError}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleCreateAllocation} className="space-y-4">
            {/* Student Dropdown */}
            <div className="space-y-1.5">
              <Label htmlFor="alloc-student" className="text-xs font-semibold">
                শিক্ষার্থী নির্বাচন করুন *
              </Label>
              <select
                id="alloc-student"
                required
                value={newAlloc.studentId}
                onChange={(e) => setNewAlloc({ ...newAlloc, studentId: e.target.value })}
                className="w-full h-9 rounded-md border border-slate-200 bg-white px-3 py-1 text-xs shadow-xs focus:outline-hidden focus:ring-1 focus:ring-emerald-600"
              >
                <option value="">-- শিক্ষার্থী নির্বাচন করুন --</option>
                {eligibleStudents.length === 0 ? (
                  <option disabled value="">
                    কোনো বরাদ্দহীন সক্রিয় শিক্ষার্থী নেই
                  </option>
                ) : (
                  eligibleStudents.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.user.name} ({s.studentCode} • {s.department})
                    </option>
                  ))
                )}
              </select>
            </div>

            {/* Room & Bed Dropdown */}
            <div className="space-y-1.5">
              <Label htmlFor="alloc-bed" className="text-xs font-semibold">
                ফাঁকা রুম ও বেড নির্বাচন করুন *
              </Label>
              <select
                id="alloc-bed"
                required
                value={newAlloc.bedId}
                onChange={(e) => setNewAlloc({ ...newAlloc, bedId: e.target.value })}
                className="w-full h-9 rounded-md border border-slate-200 bg-white px-3 py-1 text-xs shadow-xs focus:outline-hidden focus:ring-1 focus:ring-emerald-600"
              >
                <option value="">-- ফাঁকা বেড নির্বাচন করুন --</option>
                {availableBeds.length === 0 ? (
                  <option disabled value="">
                    হোস্টেলে কোনো ফাঁকা বেড নেই (Stock Out)
                  </option>
                ) : (
                  availableBeds.map((b) => (
                    <option key={b.id} value={b.id}>
                      রুম {b.roomNumber} - বেড {b.bedCode} (ফ্লোর {b.floor} • {b.roomType})
                    </option>
                  ))
                )}
              </select>
            </div>

            {/* Start Date */}
            <div className="space-y-1.5">
              <Label htmlFor="alloc-date" className="text-xs font-semibold">
                বরাদ্দের শুরুর তারিখ *
              </Label>
              <Input
                id="alloc-date"
                type="date"
                required
                value={newAlloc.startDate}
                onChange={(e) => setNewAlloc({ ...newAlloc, startDate: e.target.value })}
                className="h-9 text-xs"
              />
            </div>

            <DialogFooter className="gap-2 pt-2 flex-col sm:flex-row">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setAllocateModalOpen(false)}
              >
                বাতিল
              </Button>
              <Button
                type="submit"
                size="sm"
                disabled={allocateMutation.isPending || availableBeds.length === 0}
                className="bg-emerald-600 hover:bg-emerald-700"
              >
                {allocateMutation.isPending ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" />
                    <span>বরাদ্দ হচ্ছে...</span>
                  </>
                ) : (
                  <span>বরাদ্দ নিশ্চিত করুন</span>
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Confirm Vacate Dialog */}
      {vacateTarget && (
        <Dialog open={!!vacateTarget} onOpenChange={() => setVacateTarget(null)}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="text-base font-bold flex items-center gap-2 text-rose-600">
                <UserX className="w-5 h-5 text-rose-600" />
                <span>সিট খালি করার নিশ্চিতকরণ (Confirm Vacate)</span>
              </DialogTitle>
              <DialogDescription className="text-xs text-slate-500">
                সিট ছেড়ে দিলে বেডটি স্বয়ংক্রিয়ভাবে পুনরায় খালি (Available) অবস্থায় রূপান্তরিত হবে।
              </DialogDescription>
            </DialogHeader>

            {vacateError && (
              <Alert variant="destructive" className="bg-rose-50 border-rose-200 text-rose-800 text-xs">
                <AlertCircle className="w-4 h-4 text-rose-600" />
                <AlertDescription>{vacateError}</AlertDescription>
              </Alert>
            )}

            <div className="p-3 bg-slate-50 rounded-xl space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500">শিক্ষার্থী:</span>
                <span className="font-bold text-slate-900">{vacateTarget.student?.user?.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">বরাদ্দকৃত সিট:</span>
                <span className="font-bold text-emerald-800">
                  রুম {vacateTarget.bed?.room?.roomNumber} (বেড {vacateTarget.bed?.bedCode})
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">বরাদ্দের শুরু:</span>
                <span className="font-mono">{new Date(vacateTarget.startDate).toLocaleDateString()}</span>
              </div>
            </div>

            <DialogFooter className="gap-2 pt-2 flex-col sm:flex-row">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setVacateTarget(null)}
              >
                বাতিল
              </Button>
              <Button
                size="sm"
                variant="destructive"
                disabled={vacateMutation.isPending}
                onClick={handleConfirmVacate}
              >
                {vacateMutation.isPending ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" />
                    <span>প্রক্রিয়াধীন...</span>
                  </>
                ) : (
                  <span>সিট খালি করুন (Vacate)</span>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};
