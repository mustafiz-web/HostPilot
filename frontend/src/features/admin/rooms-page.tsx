import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  BedDouble,
  Plus,
  Building,
  AlertCircle,
  Loader2,
  RefreshCw,
  DoorOpen,
  Search,
  Filter,
  Edit2,
  Trash2,
  History,
  Wrench,
  Users,
  ShieldAlert,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { StatusBadge } from '@/components/ui/status-badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@/components/ui/table';
import { apiClient } from '@/lib/api-client';

interface BedItem {
  id: string;
  roomId: string;
  bedCode: string;
  identifier: string;
  status: 'AVAILABLE' | 'OCCUPIED' | 'MAINTENANCE';
  occupant?: {
    allocationId: string;
    studentId: string;
    studentName: string;
    studentCode: string;
    rollNumber: string;
    department: string;
    startDate: string;
  } | null;
}

interface RoomItem {
  id: string;
  roomNumber: string;
  floor: number;
  capacity: number;
  roomType: 'SINGLE' | 'DOUBLE' | 'QUAD';
  monthlyRent: number;
  status: 'AVAILABLE' | 'PARTIALLY_OCCUPIED' | 'FULL' | 'MAINTENANCE';
  occupiedBedsCount: number;
  availableBedsCount: number;
  unavailableBedsCount?: number;
  beds: BedItem[];
}

interface InventorySummary {
  totalRooms: number;
  totalBeds: number;
  occupiedBeds: number;
  availableBeds: number;
  unavailableBeds: number;
}

interface AllocationHistoryItem {
  id: string;
  bedCode: string;
  studentId: string;
  studentName: string;
  studentEmail: string;
  studentCode: string;
  rollNumber: string;
  department: string;
  startDate: string;
  endDate: string | null;
  status: 'ACTIVE' | 'VACATED' | 'CANCELLED';
  allocatedBy: string;
  createdAt: string;
}

export const RoomsPage: React.FC = () => {
  const { t, i18n } = useTranslation();
  const isEn = i18n.language?.startsWith('en');
  const queryClient = useQueryClient();

  // Search and Filter States
  const [searchTerm, setSearchTerm] = useState('');
  const [floorFilter, setFloorFilter] = useState<number | 'ALL'>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [typeFilter, setTypeFilter] = useState<string>('ALL');

  // Modal States
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [addError, setAddError] = useState<string | null>(null);

  const [editRoom, setEditRoom] = useState<RoomItem | null>(null);
  const [editForm, setEditForm] = useState({
    roomNumber: '',
    floor: 1,
    capacity: 2,
    roomType: 'DOUBLE' as 'SINGLE' | 'DOUBLE' | 'QUAD',
    monthlyRent: 4500,
    status: 'AVAILABLE' as 'AVAILABLE' | 'MAINTENANCE',
  });
  const [editError, setEditError] = useState<string | null>(null);

  const [deleteTarget, setDeleteTarget] = useState<RoomItem | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const [historyRoom, setHistoryRoom] = useState<RoomItem | null>(null);

  const [addBedTarget, setAddBedTarget] = useState<RoomItem | null>(null);
  const [newBedCode, setNewBedCode] = useState('');
  const [bedError, setBedError] = useState<string | null>(null);

  const [newRoom, setNewRoom] = useState({
    roomNumber: '',
    floor: 1,
    capacity: 2,
    roomType: 'DOUBLE' as 'SINGLE' | 'DOUBLE' | 'QUAD',
    monthlyRent: 4500,
  });

  // Query: Fetch all rooms from real MySQL API
  const {
    data: roomsResponse,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ['admin-rooms', { floor: floorFilter }],
    queryFn: async () => {
      const res = await apiClient.get<RoomItem[]>('/rooms', {
        floor: floorFilter === 'ALL' ? undefined : floorFilter,
      });
      return res;
    },
    staleTime: 30 * 1000,
  });

  const rooms: RoomItem[] = roomsResponse?.data || [];
  const meta = roomsResponse?.meta as unknown as InventorySummary | undefined;

  // Query: Allocation History
  const {
    data: historyResponse,
    isLoading: isHistoryLoading,
  } = useQuery({
    queryKey: ['room-history', historyRoom?.id],
    queryFn: async () => {
      if (!historyRoom) return null;
      const res = await apiClient.get<{ room: any; allocations: AllocationHistoryItem[] }>(
        `/rooms/${historyRoom.id}/history`
      );
      return res.data;
    },
    enabled: !!historyRoom,
  });

  // Mutation: Create Room
  const addRoomMutation = useMutation({
    mutationFn: async (payload: typeof newRoom) => {
      const res = await apiClient.post<RoomItem>('/rooms', payload);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-rooms'] });
      queryClient.invalidateQueries({ queryKey: ['admin-dashboard-metrics'] });
      setAddModalOpen(false);
      setAddError(null);
      setNewRoom({
        roomNumber: '',
        floor: 1,
        capacity: 2,
        roomType: 'DOUBLE',
        monthlyRent: 4500,
      });
    },
    onError: (err: any) => {
      setAddError(err.message || 'রুম তৈরি করতে সমস্যা হয়েছে');
    },
  });

  // Mutation: Update Room
  const updateRoomMutation = useMutation({
    mutationFn: async ({ id, payload }: { id: string; payload: typeof editForm }) => {
      const res = await apiClient.patch<RoomItem>(`/rooms/${id}`, payload);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-rooms'] });
      queryClient.invalidateQueries({ queryKey: ['admin-dashboard-metrics'] });
      setEditRoom(null);
      setEditError(null);
    },
    onError: (err: any) => {
      setEditError(err.message || 'রুম আপডেট করতে সমস্যা হয়েছে');
    },
  });

  // Mutation: Delete Room (Safe Deletion)
  const deleteRoomMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await apiClient.delete<any>(`/rooms/${id}`);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-rooms'] });
      queryClient.invalidateQueries({ queryKey: ['admin-dashboard-metrics'] });
      setDeleteTarget(null);
      setDeleteError(null);
    },
    onError: (err: any) => {
      setDeleteError(err.message || 'রুম মুছে ফেলা সম্ভব হয়নি');
    },
  });

  // Mutation: Toggle Bed Maintenance Status
  const toggleBedStatusMutation = useMutation({
    mutationFn: async ({
      roomId,
      bedId,
      status,
    }: {
      roomId: string;
      bedId: string;
      status: 'AVAILABLE' | 'MAINTENANCE';
    }) => {
      const res = await apiClient.patch<any>(`/rooms/${roomId}/beds/${bedId}`, { status });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-rooms'] });
    },
    onError: (err: any) => {
      alert(err.message || 'বেড স্ট্যাটাস পরিবর্তন করা সম্ভব হয়নি');
    },
  });

  // Mutation: Add Extra Bed
  const addBedMutation = useMutation({
    mutationFn: async ({ roomId, bedCode }: { roomId: string; bedCode: string }) => {
      const res = await apiClient.post<any>(`/rooms/${roomId}/beds`, { bedCode });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-rooms'] });
      setAddBedTarget(null);
      setNewBedCode('');
      setBedError(null);
    },
    onError: (err: any) => {
      setBedError(err.message || 'নতুন বেড যোগ করা যায়নি');
    },
  });

  // Handlers
  const handleAddRoom = (e: React.FormEvent) => {
    e.preventDefault();
    setAddError(null);
    addRoomMutation.mutate(newRoom);
  };

  const handleOpenEdit = (room: RoomItem) => {
    setEditRoom(room);
    setEditError(null);
    setEditForm({
      roomNumber: room.roomNumber,
      floor: room.floor,
      capacity: room.capacity,
      roomType: room.roomType,
      monthlyRent: room.monthlyRent,
      status: room.status === 'MAINTENANCE' ? 'MAINTENANCE' : 'AVAILABLE',
    });
  };

  const handleUpdateRoom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editRoom) return;
    setEditError(null);
    updateRoomMutation.mutate({ id: editRoom.id, payload: editForm });
  };

  const handleTypeChange = (type: 'SINGLE' | 'DOUBLE' | 'QUAD') => {
    const cap = type === 'SINGLE' ? 1 : type === 'DOUBLE' ? 2 : 4;
    const defaultRent = type === 'SINGLE' ? 8000 : type === 'DOUBLE' ? 4500 : 3000;
    setNewRoom({
      ...newRoom,
      roomType: type,
      capacity: cap,
      monthlyRent: defaultRent,
    });
  };

  // Client-side search and filtering
  const filteredRooms = rooms.filter((r) => {
    const term = searchTerm.toLowerCase().trim();
    const matchesSearch =
      !term ||
      r.roomNumber.toLowerCase().includes(term) ||
      r.beds.some(
        (b) =>
          b.occupant &&
          (b.occupant.studentName.toLowerCase().includes(term) ||
            b.occupant.studentCode.toLowerCase().includes(term) ||
            b.occupant.rollNumber.toLowerCase().includes(term) ||
            b.occupant.department.toLowerCase().includes(term))
      );

    const matchesStatus =
      statusFilter === 'ALL' ||
      (statusFilter === 'AVAILABLE' && (r.status === 'AVAILABLE' || r.status === 'PARTIALLY_OCCUPIED')) ||
      r.status === statusFilter;

    const matchesType = typeFilter === 'ALL' || r.roomType === typeFilter;

    return matchesSearch && matchesStatus && matchesType;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
            <BedDouble className="w-6 h-6 text-emerald-600" />
            <span>{t('admin.rooms.title')}</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-500">
            {t('admin.rooms.subtitle')}
          </p>
        </div>
        <Button
          onClick={() => {
            setAddError(null);
            setAddModalOpen(true);
          }}
          className="gap-2 shadow-xs bg-emerald-600 hover:bg-emerald-700 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>{t('admin.rooms.btn_add_room')}</span>
        </Button>
      </div>

      {/* Inventory Capacity Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-1">
          <span className="text-[11px] font-semibold text-slate-500 uppercase block">{t('admin.rooms.stat_total_rooms')}</span>
          <div className="text-xl sm:text-2xl font-black text-slate-900">
            {isEn ? `${meta?.totalRooms ?? rooms.length}` : `${meta?.totalRooms ?? rooms.length} টি`}
          </div>
          <span className="text-[10px] text-slate-400">{t('admin.rooms.stat_total_rooms')}</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-1">
          <span className="text-[11px] font-semibold text-slate-500 uppercase block">{t('admin.rooms.stat_total_beds')}</span>
          <div className="text-xl sm:text-2xl font-black text-blue-600">
            {isEn ? `${meta?.totalBeds ?? 0}` : `${meta?.totalBeds ?? 0} টি`}
          </div>
          <span className="text-[10px] text-slate-400">{t('admin.rooms.capacity')}</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-1">
          <span className="text-[11px] font-semibold text-slate-500 uppercase block">{t('admin.rooms.stat_occupied')}</span>
          <div className="text-xl sm:text-2xl font-black text-purple-600">
            {isEn ? `${meta?.occupiedBeds ?? 0}` : `${meta?.occupiedBeds ?? 0} টি`}
          </div>
          <span className="text-[10px] text-slate-400">{t('admin.dashboard.stat_occupancy')}</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-1">
          <span className="text-[11px] font-semibold text-slate-500 uppercase block">{t('admin.rooms.stat_available')}</span>
          <div className="text-xl sm:text-2xl font-black text-emerald-600">
            {isEn ? `${meta?.availableBeds ?? 0}` : `${meta?.availableBeds ?? 0} টি`}
          </div>
          <span className="text-[10px] text-emerald-700 font-medium">{t('status.available')}</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-1 col-span-2 sm:col-span-1">
          <span className="text-[11px] font-semibold text-slate-500 uppercase block">{t('admin.rooms.stat_maintenance')}</span>
          <div className="text-xl sm:text-2xl font-black text-slate-600">
            {isEn ? `${meta?.unavailableBeds ?? 0}` : `${meta?.unavailableBeds ?? 0} টি`}
          </div>
          <span className="text-[10px] text-slate-400">{t('status.maintenance')}</span>
        </div>
      </div>

      {/* Filter and Search Controls */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        {/* Search Input */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <Input
            placeholder="রুম নং বা শিক্ষার্থীর নাম/আইডি দিয়ে খুঁজুন..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 h-9 text-xs sm:text-sm"
          />
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Floor selector */}
          <div className="flex items-center gap-1.5 mr-2">
            <Building className="w-4 h-4 text-slate-400" />
            <span className="text-xs text-slate-500 font-medium">{t('admin.rooms.floor')}:</span>
            <select
              value={floorFilter}
              onChange={(e) => setFloorFilter(e.target.value === 'ALL' ? 'ALL' : Number(e.target.value))}
              className="h-8 text-xs rounded-lg border border-slate-200 bg-white px-2 focus:ring-1 focus:ring-emerald-500"
            >
              <option value="ALL">সকল ফ্লোর</option>
              {[1, 2, 3, 4, 5].map((fl) => (
                <option key={fl} value={fl}>ফ্লোর {fl}</option>
              ))}
            </select>
          </div>

          {/* Status selector */}
          <div className="flex items-center gap-1.5 mr-2">
            <Filter className="w-4 h-4 text-slate-400" />
            <span className="text-xs text-slate-500 font-medium">স্ট্যাটাস:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="h-8 text-xs rounded-lg border border-slate-200 bg-white px-2 focus:ring-1 focus:ring-emerald-500"
            >
              <option value="ALL">সকল স্ট্যাটাস</option>
              <option value="AVAILABLE">ফাঁকা সিট রয়েছে</option>
              <option value="FULL">পূর্ণ (Full)</option>
              <option value="MAINTENANCE">রক্ষণাবেক্ষণ (Maintenance)</option>
            </select>
          </div>

          {/* Room Type selector */}
          <div className="flex items-center gap-1.5">
            <span className="text-xs text-slate-500 font-medium">ধরন:</span>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="h-8 text-xs rounded-lg border border-slate-200 bg-white px-2 focus:ring-1 focus:ring-emerald-500"
            >
              <option value="ALL">সকল ধরন</option>
              <option value="SINGLE">সিঙ্গেল (SINGLE)</option>
              <option value="DOUBLE">ডাবল (DOUBLE)</option>
              <option value="QUAD">কোয়াড (QUAD)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Rooms Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Skeleton key={i} className="h-64 rounded-2xl w-full" />
          ))}
        </div>
      ) : isError ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-4">
          <AlertCircle className="w-12 h-12 text-rose-500 mx-auto" />
          <h3 className="text-lg font-bold text-slate-800">রুম তালিকা লোড করা যায়নি</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            {(error as any)?.message || 'সার্ভার থেকে রুমের তথ্য পাওয়া যায়নি।'}
          </p>
          <Button onClick={() => refetch()} variant="outline" size="sm" className="gap-2">
            <RefreshCw className="w-4 h-4" />
            <span>পুনরায় লোড করুন</span>
          </Button>
        </div>
      ) : filteredRooms.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-3">
          <DoorOpen className="w-12 h-12 text-slate-300 mx-auto" />
          <h4 className="text-base font-bold text-slate-800">কোনো রুম পাওয়া যায়নি</h4>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            প্রদত্ত ফিল্টারে কোনো রুম খুঁজে পাওয়া যায়নি। ফিল্টার রিসেট করুন বা নতুন রুম তৈরি করুন।
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredRooms.map((room) => {
            const occupancyPct = room.capacity > 0 ? (room.occupiedBedsCount / room.capacity) * 100 : 0;
            const isFull = room.status === 'FULL' || room.availableBedsCount === 0;
            const isMaintenance = room.status === 'MAINTENANCE';

            return (
              <div
                key={room.id}
                className={`bg-white rounded-2xl border transition-all p-5 shadow-xs flex flex-col justify-between space-y-4 ${
                  isMaintenance
                    ? 'border-slate-300 bg-slate-50/50'
                    : isFull
                    ? 'border-rose-200 bg-rose-50/10'
                    : room.status === 'PARTIALLY_OCCUPIED'
                    ? 'border-amber-200'
                    : 'border-slate-200 hover:border-emerald-300'
                }`}
              >
                {/* Room Header & Controls */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-xl font-black text-slate-900">রুম {room.roomNumber}</span>
                      <span className="text-xs font-mono font-medium text-slate-400">ফ্লোর {room.floor}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <StatusBadge status={room.status} />
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs text-slate-600 pt-1">
                    <span className="font-medium">
                      ধরন: {room.roomType} ({room.capacity} সিট)
                    </span>
                    <span className="font-extrabold text-emerald-700">
                      ৳ {room.monthlyRent.toLocaleString()} /মাস
                    </span>
                  </div>

                  {/* Occupancy Mini Bar */}
                  <div className="space-y-1 pt-1">
                    <div className="flex justify-between text-[11px] text-slate-500">
                      <span>সিট পূর্ণতা:</span>
                      <span className="font-bold text-slate-700">
                        {room.occupiedBedsCount} / {room.capacity} সিট বরাদ্দ
                      </span>
                    </div>
                    <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-300 ${
                          isMaintenance
                            ? 'bg-slate-400'
                            : isFull
                            ? 'bg-rose-500'
                            : room.occupiedBedsCount > 0
                            ? 'bg-amber-500'
                            : 'bg-emerald-500'
                        }`}
                        style={{ width: `${Math.min(100, occupancyPct)}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Beds Grid / List */}
                <div className="space-y-2 pt-2 border-t border-slate-100">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                      বেড বরাদ্দ ও অবস্থা:
                    </span>
                    {room.beds.length < room.capacity && (
                      <button
                        onClick={() => {
                          setAddBedTarget(room);
                          const nextCode = String.fromCharCode(65 + room.beds.length);
                          setNewBedCode(nextCode);
                          setBedError(null);
                        }}
                        className="text-[10px] font-semibold text-emerald-700 hover:text-emerald-800 flex items-center gap-0.5"
                      >
                        <Plus className="w-3 h-3" />
                        <span>বেড যোগ</span>
                      </button>
                    )}
                  </div>

                  <div className="space-y-1.5">
                    {room.beds.map((bed) => {
                      const isBedOccupied = bed.status === 'OCCUPIED' || !!bed.occupant;
                      const isBedMaintenance = bed.status === 'MAINTENANCE';

                      return (
                        <div
                          key={bed.id}
                          className={`p-2.5 rounded-xl border flex items-center justify-between text-xs transition-colors ${
                            isBedOccupied
                              ? 'bg-slate-50/80 border-slate-200'
                              : isBedMaintenance
                              ? 'bg-slate-100/70 border-slate-200'
                              : 'bg-emerald-50/40 border-emerald-200/80'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <div
                              className={`w-6 h-6 rounded-md font-bold text-[11px] flex items-center justify-center ${
                                isBedOccupied
                                  ? 'bg-slate-200 text-slate-700'
                                  : isBedMaintenance
                                  ? 'bg-slate-300 text-slate-700'
                                  : 'bg-emerald-600 text-white'
                              }`}
                            >
                              {bed.bedCode}
                            </div>
                            <div>
                              {bed.occupant ? (
                                <div>
                                  <span className="font-bold text-slate-900 block leading-tight">
                                    {bed.occupant.studentName}
                                  </span>
                                  <span className="text-[10px] text-slate-400 font-mono">
                                    {bed.occupant.studentCode} • {bed.occupant.department}
                                  </span>
                                </div>
                              ) : isBedMaintenance ? (
                                <span className="text-slate-500 font-medium">রক্ষণাবেক্ষণাধীন (Maintenance)</span>
                              ) : (
                                <span className="text-emerald-700 font-medium">ফাঁকা সিট (Available)</span>
                              )}
                            </div>
                          </div>

                          <div className="text-right flex items-center gap-2">
                            <div>
                              <span className="text-[10px] font-mono text-slate-400 block">
                                আইডি: {bed.identifier}
                              </span>
                              <StatusBadge status={bed.status} showDot={false} className="text-[10px] px-1.5 py-0" />
                            </div>

                            {/* Bed Maintenance Toggle Button (only when empty) */}
                            {!isBedOccupied && (
                              <button
                                onClick={() =>
                                  toggleBedStatusMutation.mutate({
                                    roomId: room.id,
                                    bedId: bed.id,
                                    status: isBedMaintenance ? 'AVAILABLE' : 'MAINTENANCE',
                                  })
                                }
                                title={isBedMaintenance ? 'বেড সচল করুন' : 'বেড রক্ষণাবেক্ষণ চিহ্নিত করুন'}
                                className="p-1 text-slate-400 hover:text-emerald-600 rounded transition-colors"
                              >
                                <Wrench className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Card Action Controls (Edit, History, Delete) */}
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setHistoryRoom(room)}
                    className="h-8 px-2.5 text-xs text-slate-700 gap-1.5 hover:text-emerald-700"
                  >
                    <History className="w-3.5 h-3.5" />
                    <span>ইতিহাস</span>
                  </Button>

                  <div className="flex items-center gap-1.5">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleOpenEdit(room)}
                      className="h-8 px-2.5 text-xs text-slate-700 gap-1 hover:text-emerald-700"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                      <span>সম্পাদনা</span>
                    </Button>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setDeleteTarget(room);
                        setDeleteError(null);
                      }}
                      className="h-8 px-2 text-xs text-rose-600 hover:text-rose-700 hover:bg-rose-50 border-rose-200"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add Room Modal Dialog */}
      <Dialog open={addModalOpen} onOpenChange={setAddModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-base font-bold flex items-center gap-2">
              <Plus className="w-5 h-5 text-emerald-600" />
              <span>নতুন রুম নিবন্ধন (Add New Room)</span>
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-500">
              রুম নম্বর, ফ্লোর এবং ধারণক্ষমতা অনুযায়ী স্বয়ংক্রিয়ভাবে বেড তৈরি করা হবে।
            </DialogDescription>
          </DialogHeader>

          {addError && (
            <Alert variant="destructive" className="bg-rose-50 border-rose-200 text-rose-800 text-xs">
              <AlertCircle className="w-4 h-4 text-rose-600" />
              <AlertDescription>{addError}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleAddRoom} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label htmlFor="room-num" className="text-xs">
                  রুম নম্বর *
                </Label>
                <Input
                  id="room-num"
                  required
                  placeholder="e.g. 101 বা ২০২"
                  value={newRoom.roomNumber}
                  onChange={(e) => setNewRoom({ ...newRoom, roomNumber: e.target.value })}
                  className="h-9 text-xs font-mono font-bold"
                />
              </div>

              <div className="space-y-1">
                <Label htmlFor="floor-num" className="text-xs">
                  ফ্লোর নম্বর *
                </Label>
                <Input
                  id="floor-num"
                  type="number"
                  min={1}
                  max={20}
                  required
                  value={newRoom.floor}
                  onChange={(e) => setNewRoom({ ...newRoom, floor: Number(e.target.value) })}
                  className="h-9 text-xs"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs">রুমের ধরন ও ধারণক্ষমতা *</Label>
              <div className="grid grid-cols-3 gap-2">
                {(['SINGLE', 'DOUBLE', 'QUAD'] as const).map((type) => (
                  <Button
                    key={type}
                    type="button"
                    size="sm"
                    variant={newRoom.roomType === type ? 'default' : 'outline'}
                    onClick={() => handleTypeChange(type)}
                    className="text-xs h-9 flex flex-col items-center justify-center py-1"
                  >
                    <span className="font-bold">{type}</span>
                    <span className="text-[10px] opacity-80">
                      {type === 'SINGLE' ? '১ সিট' : type === 'DOUBLE' ? '২ সিট' : '৪ সিট'}
                    </span>
                  </Button>
                ))}
              </div>
            </div>

            <div className="space-y-1">
              <Label htmlFor="monthly-rent" className="text-xs">
                মাসিক সিট ভাড়া (টাকা) *
              </Label>
              <Input
                id="monthly-rent"
                type="number"
                min={500}
                required
                value={newRoom.monthlyRent}
                onChange={(e) => setNewRoom({ ...newRoom, monthlyRent: Number(e.target.value) })}
                className="h-9 text-xs font-mono font-semibold"
              />
            </div>

            <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200/80 text-xs text-emerald-900 space-y-1">
              <div className="font-bold">স্বয়ংক্রিয় বেড জেনারেশন:</div>
              <p className="text-[11px] text-emerald-800">
                এই রুমে {newRoom.capacity}টি বেড তৈরি হবে: {Array.from({ length: newRoom.capacity }, (_, i) => `বেড ${String.fromCharCode(65 + i)}`).join(', ')}
              </p>
            </div>

            <DialogFooter className="gap-2 pt-2 flex flex-col-reverse sm:flex-row">
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="w-full sm:w-auto"
                onClick={() => setAddModalOpen(false)}
              >
                বাতিল
              </Button>
              <Button
                type="submit"
                size="sm"
                disabled={addRoomMutation.isPending}
                className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-700"
              >
                {addRoomMutation.isPending ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" />
                    <span>তৈরি হচ্ছে...</span>
                  </>
                ) : (
                  <span>রুম সংরক্ষণ করুন</span>
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Room Modal Dialog */}
      {editRoom && (
        <Dialog open={!!editRoom} onOpenChange={(open) => !open && setEditRoom(null)}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="text-base font-bold flex items-center gap-2">
                <Edit2 className="w-5 h-5 text-emerald-600" />
                <span>রুম তথ্য সম্পাদন (Edit Room {editRoom.roomNumber})</span>
              </DialogTitle>
              <DialogDescription className="text-xs text-slate-500">
                রুম নম্বর, ভাড়া, ক্যাপাসিটি এবং রক্ষণাবেক্ষণ স্ট্যাটাস আপডেট করুন।
              </DialogDescription>
            </DialogHeader>

            {editError && (
              <Alert variant="destructive" className="bg-rose-50 border-rose-200 text-rose-800 text-xs">
                <AlertCircle className="w-4 h-4 text-rose-600" />
                <AlertDescription>{editError}</AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleUpdateRoom} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label htmlFor="edit-room-num" className="text-xs">
                    রুম নম্বর *
                  </Label>
                  <Input
                    id="edit-room-num"
                    required
                    value={editForm.roomNumber}
                    onChange={(e) => setEditForm({ ...editForm, roomNumber: e.target.value })}
                    className="h-9 text-xs font-mono font-bold"
                  />
                </div>

                <div className="space-y-1">
                  <Label htmlFor="edit-floor-num" className="text-xs">
                    ফ্লোর নম্বর *
                  </Label>
                  <Input
                    id="edit-floor-num"
                    type="number"
                    min={1}
                    max={20}
                    required
                    value={editForm.floor}
                    onChange={(e) => setEditForm({ ...editForm, floor: Number(e.target.value) })}
                    className="h-9 text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label htmlFor="edit-capacity" className="text-xs">
                    ধারণক্ষমতা (সিট সংখ্যা) *
                  </Label>
                  <Input
                    id="edit-capacity"
                    type="number"
                    min={Math.max(1, editRoom.occupiedBedsCount)}
                    max={10}
                    required
                    value={editForm.capacity}
                    onChange={(e) => setEditForm({ ...editForm, capacity: Number(e.target.value) })}
                    className="h-9 text-xs font-bold"
                  />
                  <span className="text-[10px] text-slate-400 block">
                    বর্তমান দখল: {editRoom.occupiedBedsCount} টি (সর্বনিম্ন {editRoom.occupiedBedsCount} হতে হবে)
                  </span>
                </div>

                <div className="space-y-1">
                  <Label htmlFor="edit-rent" className="text-xs">
                    মাসিক সিট ভাড়া (টাকা) *
                  </Label>
                  <Input
                    id="edit-rent"
                    type="number"
                    min={500}
                    required
                    value={editForm.monthlyRent}
                    onChange={(e) => setEditForm({ ...editForm, monthlyRent: Number(e.target.value) })}
                    className="h-9 text-xs font-mono font-semibold"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs">রক্ষণাবেক্ষণ স্ট্যাটাস (Maintenance)</Label>
                <select
                  value={editForm.status}
                  onChange={(e) => setEditForm({ ...editForm, status: e.target.value as any })}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-xs focus:ring-2 focus:ring-ring"
                >
                  <option value="AVAILABLE">সচল / স্বাভাবিক (Available for allocation)</option>
                  <option value="MAINTENANCE">রক্ষণাবেক্ষণাধীন (Maintenance - নো নতুন বরাদ্দ)</option>
                </select>
                <span className="text-[10px] text-slate-400">
                  রক্ষণাবেক্ষণ নির্বাচন করলে এই রুমে কোনো নতুন শিক্ষার্থী বরাদ্দ দেওয়া যাবে না।
                </span>
              </div>

              <DialogFooter className="gap-2 pt-2 flex flex-col-reverse sm:flex-row">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="w-full sm:w-auto"
                  onClick={() => setEditRoom(null)}
                >
                  বাতিল
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  disabled={updateRoomMutation.isPending}
                  className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-700"
                >
                  {updateRoomMutation.isPending ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" />
                      <span>সংরক্ষণ হচ্ছে...</span>
                    </>
                  ) : (
                    <span>পরিবর্তন সংরক্ষণ করুন</span>
                  )}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      )}

      {/* Delete Room Confirmation Modal Dialog */}
      {deleteTarget && (
        <Dialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <div className="flex items-center gap-2 text-rose-600 mb-1">
                <ShieldAlert className="w-5 h-5" />
                <DialogTitle className="text-base font-bold text-rose-700">রুম মুছে ফেলার নিশ্চিতকরণ</DialogTitle>
              </div>
              <DialogDescription className="text-xs text-slate-600">
                আপনি কি নিশ্চিতভাবে <strong>রুম {deleteTarget.roomNumber}</strong> স্থায়ীভাবে মুছে ফেলতে চান?
              </DialogDescription>
            </DialogHeader>

            {deleteError && (
              <Alert variant="destructive" className="bg-rose-50 border-rose-200 text-rose-900 text-xs my-2">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <div>
                  <AlertTitle className="font-bold">মুছে ফেলা সম্ভব নয়</AlertTitle>
                  <AlertDescription className="text-[11px] leading-relaxed mt-1">
                    {deleteError}
                  </AlertDescription>
                </div>
              </Alert>
            )}

            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-600 space-y-2">
              <div className="flex justify-between">
                <span>রুমের বর্তমান অবস্থান:</span>
                <span className="font-bold text-slate-900">{deleteTarget.occupiedBedsCount} সিট বরাদ্দকৃত</span>
              </div>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                * কোনো শিক্ষার্থী সক্রিয় বরাদ্দ থাকলে রুম মুছে ফেলা যাবে না। এছাড়া অতীত বরাদ্দের অডিট ট্রেইল থাকলে রুমটি ডিলিট করার পরিবর্তে <strong>সম্পাদনা</strong> মেন্যু থেকে <strong>'রক্ষণাবেক্ষণ (MAINTENANCE)'</strong> স্ট্যাটাস নির্ধারণ করুন।
              </p>
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
                disabled={deleteRoomMutation.isPending}
                className="w-full sm:w-auto"
                onClick={() => deleteRoomMutation.mutate(deleteTarget.id)}
              >
                {deleteRoomMutation.isPending ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" />
                    <span>মুছে ফেলা হচ্ছে...</span>
                  </>
                ) : (
                  <span>স্থায়ীভাবে মুছুন</span>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Room Allocation History Modal Dialog */}
      {historyRoom && (
        <Dialog open={!!historyRoom} onOpenChange={(open) => !open && setHistoryRoom(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <History className="w-5 h-5 text-emerald-600" />
                  <DialogTitle className="text-lg font-bold">
                    রুম {historyRoom.roomNumber} — বরাদ্দ ও অডিট ইতিহাস
                  </DialogTitle>
                </div>
                <StatusBadge status={historyRoom.status} />
              </div>
              <DialogDescription className="text-xs text-slate-500">
                এই রুমের সকল সক্রিয় ও অতীত বরাদ্দের সম্পূর্ণ কালানুক্রমিক ইতিহাস
              </DialogDescription>
            </DialogHeader>

            <div className="py-2">
              {isHistoryLoading ? (
                <div className="space-y-2 py-4">
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-full" />
                </div>
              ) : !historyResponse?.allocations || historyResponse.allocations.length === 0 ? (
                <div className="text-center py-8 text-slate-500 space-y-2">
                  <Users className="w-10 h-10 text-slate-300 mx-auto" />
                  <p className="text-xs">এই রুমে এখনো কোনো শিক্ষার্থী বরাদ্দের রেকর্ড নেই।</p>
                </div>
              ) : (
                <div className="overflow-x-auto rounded-xl border border-slate-200">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-slate-50">
                        <TableHead className="text-xs">বেড</TableHead>
                        <TableHead className="text-xs">শিক্ষার্থীর নাম ও আইডি</TableHead>
                        <TableHead className="text-xs">বিভাগ</TableHead>
                        <TableHead className="text-xs">বরাদ্দ শুরুর তারিখ</TableHead>
                        <TableHead className="text-xs">সমাপ্তি</TableHead>
                        <TableHead className="text-xs">স্ট্যাটাস</TableHead>
                        <TableHead className="text-xs">অনুমোদনকারী</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {historyResponse.allocations.map((alloc) => (
                        <TableRow key={alloc.id} className="text-xs">
                          <TableCell className="font-bold font-mono">
                            বেড {alloc.bedCode}
                          </TableCell>
                          <TableCell>
                            <span className="font-bold text-slate-900 block">{alloc.studentName}</span>
                            <span className="text-[10px] text-slate-400 font-mono">
                              {alloc.studentCode} (রোল {alloc.rollNumber})
                            </span>
                          </TableCell>
                          <TableCell>{alloc.department}</TableCell>
                          <TableCell className="text-slate-600">
                            {new Date(alloc.startDate).toLocaleDateString('bn-BD')}
                          </TableCell>
                          <TableCell className="text-slate-500">
                            {alloc.endDate ? new Date(alloc.endDate).toLocaleDateString('bn-BD') : (
                              <span className="text-emerald-700 font-semibold">চলমান (Active)</span>
                            )}
                          </TableCell>
                          <TableCell>
                            <StatusBadge status={alloc.status} className="text-[10px] px-2 py-0.5" />
                          </TableCell>
                          <TableCell className="text-slate-600">{alloc.allocatedBy}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </div>

            <DialogFooter className="pt-2">
              <Button
                variant="outline"
                size="sm"
                className="w-full sm:w-auto"
                onClick={() => setHistoryRoom(null)}
              >
                বন্ধ করুন
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Add Bed Modal Dialog */}
      {addBedTarget && (
        <Dialog open={!!addBedTarget} onOpenChange={(open) => !open && setAddBedTarget(null)}>
          <DialogContent className="sm:max-w-xs">
            <DialogHeader>
              <DialogTitle className="text-sm font-bold flex items-center gap-1.5">
                <Plus className="w-4 h-4 text-emerald-600" />
                <span>নতুন বেড যোগ (রুম {addBedTarget.roomNumber})</span>
              </DialogTitle>
            </DialogHeader>

            {bedError && (
              <Alert variant="destructive" className="bg-rose-50 border-rose-200 text-rose-800 text-xs">
                <AlertDescription>{bedError}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-3 py-2">
              <div className="space-y-1">
                <Label htmlFor="bed-code" className="text-xs">
                  বেড কোড (e.g. C, D) *
                </Label>
                <Input
                  id="bed-code"
                  value={newBedCode}
                  onChange={(e) => setNewBedCode(e.target.value.toUpperCase())}
                  placeholder="যেমন: C"
                  className="h-9 text-xs font-mono font-bold uppercase"
                />
              </div>
            </div>

            <DialogFooter className="gap-2 pt-2 flex flex-col-reverse sm:flex-row">
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="w-full sm:w-auto"
                onClick={() => setAddBedTarget(null)}
              >
                বাতিল
              </Button>
              <Button
                size="sm"
                disabled={addBedMutation.isPending || !newBedCode.trim()}
                className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-700"
                onClick={() =>
                  addBedMutation.mutate({
                    roomId: addBedTarget.id,
                    bedCode: newBedCode.trim(),
                  })
                }
              >
                {addBedMutation.isPending ? 'যোগ হচ্ছে...' : 'বেড যুক্ত করুন'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};