import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
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
import { formatCurrency, formatDate, formatNumber } from '@/lib/formatters';

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
      setAddError(err.message || t('common.error_occurred'));
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
      setEditError(err.message || t('common.error_occurred'));
    },
  });

  // Mutation: Delete Room
  const deleteRoomMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await apiClient.delete<{ message: string }>(`/rooms/${id}`);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-rooms'] });
      queryClient.invalidateQueries({ queryKey: ['admin-dashboard-metrics'] });
      setDeleteTarget(null);
      setDeleteError(null);
    },
    onError: (err: any) => {
      setDeleteError(err.message || t('common.error_occurred'));
    },
  });

  // Mutation: Toggle Bed Maintenance
  const toggleBedMutation = useMutation({
    mutationFn: async ({ bedId, status }: { bedId: string; status: 'AVAILABLE' | 'MAINTENANCE' }) => {
      const res = await apiClient.patch(`/rooms/beds/${bedId}/status`, { status });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-rooms'] });
      queryClient.invalidateQueries({ queryKey: ['admin-dashboard-metrics'] });
    },
    onError: (err: any) => {
      alert(err.message || t('common.error_occurred'));
    },
  });

  // Mutation: Add Single Bed to existing room
  const addBedMutation = useMutation({
    mutationFn: async ({ roomId, bedCode }: { roomId: string; bedCode: string }) => {
      const res = await apiClient.post(`/rooms/${roomId}/beds`, { bedCode });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-rooms'] });
      queryClient.invalidateQueries({ queryKey: ['admin-dashboard-metrics'] });
      setAddBedTarget(null);
      setNewBedCode('');
      setBedError(null);
    },
    onError: (err: any) => {
      setBedError(err.message || t('common.error_occurred'));
    },
  });

  // Distinct list of floors from dataset
  const availableFloors = Array.from(new Set(rooms.map((r) => r.floor))).sort((a, b) => a - b);

  // Client search and filter logic
  const filteredRooms = rooms.filter((room) => {
    // 1. Search term (room number, occupant student name, occupant code)
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase().trim();
      const matchRoom = room.roomNumber.toLowerCase().includes(term);
      const matchOccupant = room.beds.some(
        (b) =>
          b.occupant?.studentName.toLowerCase().includes(term) ||
          b.occupant?.studentCode.toLowerCase().includes(term) ||
          b.occupant?.rollNumber.toLowerCase().includes(term)
      );
      if (!matchRoom && !matchOccupant) return false;
    }

    // 2. Floor filter
    if (floorFilter !== 'ALL' && room.floor !== floorFilter) {
      return false;
    }

    // 3. Status filter
    if (statusFilter !== 'ALL') {
      if (statusFilter === 'AVAILABLE' && room.availableBedsCount <= 0) return false;
      if (statusFilter === 'FULL' && room.status !== 'FULL') return false;
      if (statusFilter === 'MAINTENANCE' && room.status !== 'MAINTENANCE') return false;
    }

    // 4. Type filter
    if (typeFilter !== 'ALL' && room.roomType !== typeFilter) {
      return false;
    }

    return true;
  });

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setAddError(null);
    addRoomMutation.mutate(newRoom);
  };

  const handleEditOpen = (room: RoomItem) => {
    setEditRoom(room);
    setEditForm({
      roomNumber: room.roomNumber,
      floor: room.floor,
      capacity: room.capacity,
      roomType: room.roomType,
      monthlyRent: room.monthlyRent,
      status: room.status === 'MAINTENANCE' ? 'MAINTENANCE' : 'AVAILABLE',
    });
    setEditError(null);
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editRoom) return;
    setEditError(null);
    updateRoomMutation.mutate({ id: editRoom.id, payload: editForm });
  };

  const handleDeleteOpen = (room: RoomItem) => {
    setDeleteTarget(room);
    setDeleteError(null);
  };

  const handleDeleteConfirm = () => {
    if (!deleteTarget) return;
    deleteRoomMutation.mutate(deleteTarget.id);
  };

  const handleToggleBedMaintenance = (bed: BedItem) => {
    if (bed.status === 'OCCUPIED') return;
    const nextStatus = bed.status === 'MAINTENANCE' ? 'AVAILABLE' : 'MAINTENANCE';
    toggleBedMutation.mutate({ bedId: bed.id, status: nextStatus });
  };

  const handleAddBedSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!addBedTarget || !newBedCode.trim()) return;
    setBedError(null);
    addBedMutation.mutate({ roomId: addBedTarget.id, bedCode: newBedCode.trim().toUpperCase() });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
            <DoorOpen className="w-6 h-6 text-emerald-600" />
            <span>{t('admin.rooms.title')}</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-500">
            {t('admin.rooms.subtitle')}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            className="gap-1.5 text-xs text-slate-700"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>{t('common.refresh')}</span>
          </Button>
          <Button
            onClick={() => {
              setAddError(null);
              setAddModalOpen(true);
            }}
            className="gap-2 shadow-xs bg-emerald-600 hover:bg-emerald-700 text-white"
          >
            <Plus className="w-4 h-4" />
            <span>{t('admin.rooms.btn_add_room')}</span>
          </Button>
        </div>
      </div>

      {/* Inventory KPI Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
            {t('admin.rooms.stat_total_rooms')}
          </span>
          <div className="text-2xl font-black text-slate-900 mt-1">
            {formatNumber(meta?.totalRooms ?? rooms.length)}{isEn ? '' : ' টি'}
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
            {t('admin.rooms.stat_total_beds')}
          </span>
          <div className="text-2xl font-black text-blue-700 mt-1">
            {formatNumber(meta?.totalBeds ?? 0)}{isEn ? '' : ' টি'}
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
            {t('admin.rooms.stat_occupied')}
          </span>
          <div className="text-2xl font-black text-emerald-700 mt-1">
            {formatNumber(meta?.occupiedBeds ?? 0)}{isEn ? '' : ' টি'}
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
            {t('admin.rooms.stat_available')}
          </span>
          <div className="text-2xl font-black text-amber-600 mt-1">
            {formatNumber(meta?.availableBeds ?? 0)}{isEn ? '' : ' টি'}
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs col-span-2 sm:col-span-1">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
            {t('admin.rooms.stat_maintenance')}
          </span>
          <div className="text-2xl font-black text-rose-600 mt-1">
            {formatNumber(meta?.unavailableBeds ?? 0)}{isEn ? '' : ' টি'}
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Search Input */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <Input
            placeholder={isEn ? 'Search room number or occupant...' : 'রুম নং বা শিক্ষার্থীর নাম/আইডি দিয়ে খুঁজুন...'}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 h-9 text-xs sm:text-sm"
          />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Floor selector */}
          <div className="flex items-center gap-1.5 text-xs text-slate-600">
            <Building className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={floorFilter}
              onChange={(e) => setFloorFilter(e.target.value === 'ALL' ? 'ALL' : Number(e.target.value))}
              className="h-9 rounded-lg border border-slate-200 bg-white px-2.5 text-xs font-medium text-slate-700 shadow-xs focus:outline-hidden"
            >
              <option value="ALL">{isEn ? 'All Floors' : 'সকল ফ্লোর'}</option>
              {availableFloors.map((fl) => (
                <option key={fl} value={fl}>{isEn ? `Floor ${fl}` : `ফ্লোর ${fl}`}</option>
              ))}
            </select>
          </div>

          {/* Status filter */}
          <div className="flex items-center gap-1.5 text-xs text-slate-600">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="h-9 rounded-lg border border-slate-200 bg-white px-2.5 text-xs font-medium text-slate-700 shadow-xs focus:outline-hidden"
            >
              <option value="ALL">{isEn ? 'All Statuses' : 'সকল স্ট্যাটাস'}</option>
              <option value="AVAILABLE">{t('admin.rooms.filter_available')}</option>
              <option value="FULL">{t('admin.rooms.filter_full')}</option>
              <option value="MAINTENANCE">{t('admin.rooms.filter_maintenance')}</option>
            </select>
          </div>

          {/* Type filter */}
          <div className="flex items-center gap-1.5 text-xs text-slate-600">
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="h-9 rounded-lg border border-slate-200 bg-white px-2.5 text-xs font-medium text-slate-700 shadow-xs focus:outline-hidden"
            >
              <option value="ALL">{isEn ? 'All Types' : 'সকল ধরন'}</option>
              <option value="SINGLE">{t('admin.rooms.type_single')}</option>
              <option value="DOUBLE">{t('admin.rooms.type_double')}</option>
              <option value="QUAD">{t('admin.rooms.type_quad')}</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Room Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Skeleton key={i} className="h-64 rounded-2xl w-full" />
          ))}
        </div>
      ) : isError ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-4">
          <AlertCircle className="w-12 h-12 text-rose-500 mx-auto" />
          <h3 className="text-lg font-bold text-slate-800">{isEn ? 'Failed to load rooms list' : 'রুম তালিকা লোড করা যায়নি'}</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            {(error as any)?.message || t('common.error_occurred')}
          </p>
          <Button onClick={() => refetch()} variant="outline" size="sm" className="gap-2">
            <RefreshCw className="w-4 h-4" />
            <span>{t('common.retry')}</span>
          </Button>
        </div>
      ) : filteredRooms.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-3">
          <DoorOpen className="w-12 h-12 text-slate-300 mx-auto" />
          <h4 className="text-base font-bold text-slate-800">{t('admin.rooms.empty_rooms')}</h4>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            {isEn ? 'No rooms match the selected filters. Reset filters or create a new room.' : 'প্রদত্ত ফিল্টারে কোনো রুম খুঁজে পাওয়া যায়নি। ফিল্টার রিসেট করুন বা নতুন রুম তৈরি করুন।'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredRooms.map((room) => {
            const isFull = room.availableBedsCount === 0;
            const isMaint = room.status === 'MAINTENANCE';

            return (
              <div
                key={room.id}
                className={`bg-white rounded-2xl border p-5 shadow-xs transition-all flex flex-col justify-between space-y-4 ${
                  isMaint
                    ? 'border-rose-200 bg-rose-50/20'
                    : isFull
                    ? 'border-slate-200'
                    : 'border-emerald-200 hover:border-emerald-300'
                }`}
              >
                {/* Room Header */}
                <div>
                  <div className="flex items-start justify-between gap-2 border-b border-slate-100 pb-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xl font-black text-slate-900">
                          {t('student.room.room_number', { number: room.roomNumber })}
                        </span>
                        <span className="text-xs font-mono font-medium text-slate-400">
                          {t('student.room.floor')}: {room.floor}
                        </span>
                      </div>
                      <span className="text-xs text-slate-500 font-medium block mt-0.5">
                        {room.roomType} ({room.capacity} {isEn ? 'Seats' : 'সিট'})
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-sm font-extrabold text-emerald-700 block">
                        {formatCurrency(room.monthlyRent)} {isEn ? '/mo' : '/মাস'}
                      </span>
                      <StatusBadge status={room.status} />
                    </div>
                  </div>

                  {/* Capacity Bar */}
                  <div className="mt-3 space-y-1">
                    <div className="flex justify-between text-[11px] text-slate-500 font-medium">
                      <span>{isEn ? 'Occupancy:' : 'সিট পূর্ণতা:'}</span>
                      <span className="font-bold text-slate-800">
                        {room.occupiedBedsCount} / {room.capacity} {isEn ? 'Seats' : 'সিট বরাদ্দ'}
                      </span>
                    </div>
                    <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${
                          isMaint
                            ? 'bg-rose-500'
                            : room.occupiedBedsCount === room.capacity
                            ? 'bg-amber-500'
                            : 'bg-emerald-500'
                        }`}
                        style={{
                          width: `${Math.min(
                            100,
                            Math.round((room.occupiedBedsCount / (room.capacity || 1)) * 100)
                          )}%`,
                        }}
                      />
                    </div>
                  </div>

                  {/* Bed Slots Grid */}
                  <div className="mt-4 space-y-2">
                    <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                      <span>{isEn ? 'Beds & Status:' : 'বেড বরাদ্দ ও অবস্থা:'}</span>
                      {room.beds.length < room.capacity && (
                        <button
                          type="button"
                          onClick={() => {
                            setAddBedTarget(room);
                            setNewBedCode(String.fromCharCode(65 + room.beds.length));
                            setBedError(null);
                          }}
                          className="text-[11px] text-emerald-700 hover:text-emerald-800 flex items-center gap-0.5 font-semibold"
                        >
                          <Plus className="w-3 h-3" />
                          <span>{isEn ? 'Add Bed' : 'বেড যোগ'}</span>
                        </button>
                      )}
                    </div>

                    <div className="space-y-1.5">
                      {room.beds.map((bed) => {
                        const isBedOccupied = bed.status === 'OCCUPIED';
                        const isBedMaintenance = bed.status === 'MAINTENANCE';

                        return (
                          <div
                            key={bed.id}
                            className={`p-2.5 rounded-xl border text-xs flex items-center justify-between transition-all ${
                              isBedOccupied
                                ? 'bg-slate-50 border-slate-200'
                                : isBedMaintenance
                                ? 'bg-rose-50/60 border-rose-200 text-rose-800'
                                : 'bg-emerald-50/40 border-emerald-200 text-emerald-900'
                            }`}
                          >
                            <div className="flex items-center gap-2.5 overflow-hidden">
                              <span
                                className={`w-6 h-6 rounded-md font-mono font-bold text-xs flex items-center justify-center shrink-0 ${
                                  isBedOccupied
                                    ? 'bg-slate-200 text-slate-800'
                                    : isBedMaintenance
                                    ? 'bg-rose-200 text-rose-900'
                                    : 'bg-emerald-200 text-emerald-900'
                                }`}
                              >
                                {bed.bedCode}
                              </span>

                              <div className="truncate">
                                {isBedOccupied && bed.occupant ? (
                                  <div>
                                    <span className="font-bold text-slate-900 block truncate">
                                      {bed.occupant.studentName}
                                    </span>
                                    <span className="text-[10px] text-slate-500 font-mono block">
                                      {bed.occupant.studentCode} • {bed.occupant.department}
                                    </span>
                                  </div>
                                ) : isBedMaintenance ? (
                                  <span className="text-slate-500 font-medium">
                                    {isEn ? 'Under Maintenance' : 'রক্ষণাবেক্ষণাধীন (Maintenance)'}
                                  </span>
                                ) : (
                                  <span className="text-emerald-700 font-medium">
                                    {isEn ? 'Available Seat' : 'ফাঁকা সিট (Available)'}
                                  </span>
                                )}
                              </div>
                            </div>

                            <div className="flex items-center gap-1 shrink-0">
                              <span className="text-[10px] font-mono text-slate-400">
                                {bed.identifier}
                              </span>

                              {!isBedOccupied && (
                                <button
                                  type="button"
                                  onClick={() => handleToggleBedMaintenance(bed)}
                                  disabled={toggleBedMutation.isPending}
                                  className={`p-1 rounded-md text-xs transition-colors ${
                                    isBedMaintenance
                                      ? 'text-rose-600 hover:bg-rose-100'
                                      : 'text-slate-400 hover:text-slate-700 hover:bg-slate-100'
                                  }`}
                                  title={isBedMaintenance ? (isEn ? 'Activate Bed' : 'বেড সচল করুন') : (isEn ? 'Set Bed Maintenance' : 'বেড রক্ষণাবেক্ষণ চিহ্নিত করুন')}
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
                </div>

                {/* Card Action Footer */}
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setHistoryRoom(room)}
                    className="h-8 text-xs text-slate-600 hover:text-slate-900 gap-1"
                  >
                    <History className="w-3.5 h-3.5" />
                    <span>{isEn ? 'History' : 'ইতিহাস'}</span>
                  </Button>

                  <div className="flex items-center gap-1.5">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEditOpen(room)}
                      className="h-8 text-xs text-slate-700 hover:text-emerald-700 gap-1"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                      <span>{isEn ? 'Edit' : 'সম্পাদনা'}</span>
                    </Button>

                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteOpen(room)}
                      className="h-8 w-8 p-0 text-rose-500 hover:text-rose-700 hover:bg-rose-50"
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

      {/* Add New Room Dialog */}
      <Dialog open={addModalOpen} onOpenChange={setAddModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-base font-bold flex items-center gap-2">
              <DoorOpen className="w-5 h-5 text-emerald-600" />
              <span>{t('admin.rooms.dialog_add_title')}</span>
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-500">
              {t('admin.rooms.dialog_add_desc')}
            </DialogDescription>
          </DialogHeader>

          {addError && (
            <Alert variant="destructive" className="bg-rose-50 border-rose-200 text-rose-800 text-xs">
              <AlertCircle className="w-4 h-4 text-rose-600" />
              <AlertDescription>{addError}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleAddSubmit} className="space-y-4 text-xs">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label htmlFor="roomNumber" className="text-xs font-semibold">
                  {t('admin.rooms.room_number')} *
                </Label>
                <Input
                  id="roomNumber"
                  required
                  placeholder={isEn ? 'e.g. 101 or 202' : 'e.g. 101 বা ২০২'}
                  value={newRoom.roomNumber}
                  onChange={(e) => setNewRoom({ ...newRoom, roomNumber: e.target.value })}
                  className="h-9 text-xs"
                />
              </div>

              <div className="space-y-1">
                <Label htmlFor="floor" className="text-xs font-semibold">
                  {t('admin.rooms.floor')} *
                </Label>
                <Input
                  id="floor"
                  type="number"
                  min="0"
                  max="20"
                  required
                  value={newRoom.floor}
                  onChange={(e) => setNewRoom({ ...newRoom, floor: Number(e.target.value) })}
                  className="h-9 text-xs"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">{isEn ? 'Room Type & Capacity *' : 'রুমের ধরন ও ধারণক্ষমতা *'}</Label>
              <div className="grid grid-cols-3 gap-2">
                {(['SINGLE', 'DOUBLE', 'QUAD'] as const).map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() =>
                      setNewRoom({
                        ...newRoom,
                        roomType: type,
                        capacity: type === 'SINGLE' ? 1 : type === 'DOUBLE' ? 2 : 4,
                      })
                    }
                    className={`p-2.5 rounded-xl border text-center transition-all ${
                      newRoom.roomType === type
                        ? 'border-emerald-600 bg-emerald-50 text-emerald-900 font-bold'
                        : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <div className="text-xs font-mono font-bold">{type}</div>
                    <div className="text-[10px] text-slate-500 mt-0.5">
                      {type === 'SINGLE' ? (isEn ? '1 Seat' : '১ সিট') : type === 'DOUBLE' ? (isEn ? '2 Seats' : '২ সিট') : (isEn ? '4 Seats' : '৪ সিট')}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-1">
              <Label htmlFor="rent" className="text-xs font-semibold">
                {t('admin.rooms.rent')} *
              </Label>
              <Input
                id="rent"
                type="number"
                min="0"
                step="100"
                required
                value={newRoom.monthlyRent}
                onChange={(e) => setNewRoom({ ...newRoom, monthlyRent: Number(e.target.value) })}
                className="h-9 text-xs font-mono"
              />
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 text-[11px] text-slate-600 space-y-1">
              <div className="font-bold">{isEn ? 'Automatic Bed Generation:' : 'স্বয়ংক্রিয় বেড জেনারেশন:'}</div>
              <p>
                {isEn ? `This room will have ${newRoom.capacity} beds generated: ` : `এই রুমে ${newRoom.capacity}টি বেড তৈরি হবে: `}
                {Array.from({ length: newRoom.capacity }, (_, i) => `${isEn ? 'Bed' : 'বেড'} ${String.fromCharCode(65 + i)}`).join(', ')}
              </p>
            </div>

            <DialogFooter className="gap-2 pt-2 flex-col sm:flex-row">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setAddModalOpen(false)}
              >
                {t('common.cancel')}
              </Button>
              <Button
                type="submit"
                size="sm"
                disabled={addRoomMutation.isPending}
                className="bg-emerald-600 hover:bg-emerald-700 text-white"
              >
                {addRoomMutation.isPending ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" />
                    <span>{t('common.loading')}</span>
                  </>
                ) : (
                  <span>{t('common.save')}</span>
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Room Dialog */}
      {editRoom && (
        <Dialog open={!!editRoom} onOpenChange={(open) => !open && setEditRoom(null)}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="text-base font-bold flex items-center gap-2">
                <Edit2 className="w-5 h-5 text-emerald-600" />
                <span>{isEn ? `Edit Room ${editRoom.roomNumber}` : `রুম তথ্য সম্পাদন (রুম ${editRoom.roomNumber})`}</span>
              </DialogTitle>
              <DialogDescription className="text-xs text-slate-500">
                {isEn ? 'Update room number, rent, capacity, and maintenance status.' : 'রুম নম্বর, ভাড়া, ক্যাপাসিটি এবং রক্ষণাবেক্ষণ স্ট্যাটাস আপডেট করুন।'}
              </DialogDescription>
            </DialogHeader>

            {editError && (
              <Alert variant="destructive" className="bg-rose-50 border-rose-200 text-rose-800 text-xs">
                <AlertCircle className="w-4 h-4 text-rose-600" />
                <AlertDescription>{editError}</AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleEditSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label htmlFor="editRoomNumber" className="text-xs">
                    {t('admin.rooms.room_number')} *
                  </Label>
                  <Input
                    id="editRoomNumber"
                    required
                    value={editForm.roomNumber}
                    onChange={(e) => setEditForm({ ...editForm, roomNumber: e.target.value })}
                    className="h-9 text-xs"
                  />
                </div>

                <div className="space-y-1">
                  <Label htmlFor="editFloor" className="text-xs">
                    {t('admin.rooms.floor')} *
                  </Label>
                  <Input
                    id="editFloor"
                    type="number"
                    min="0"
                    max="20"
                    required
                    value={editForm.floor}
                    onChange={(e) => setEditForm({ ...editForm, floor: Number(e.target.value) })}
                    className="h-9 text-xs"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <Label htmlFor="editCapacity" className="text-xs">
                  {t('admin.rooms.capacity')} *
                </Label>
                <Input
                  id="editCapacity"
                  type="number"
                  min={Math.max(1, editRoom.occupiedBedsCount)}
                  max="8"
                  required
                  value={editForm.capacity}
                  onChange={(e) => setEditForm({ ...editForm, capacity: Number(e.target.value) })}
                  className="h-9 text-xs"
                />
                <p className="text-[10px] text-slate-400">
                  {isEn
                    ? `Current occupancy: ${editRoom.occupiedBedsCount} (minimum ${editRoom.occupiedBedsCount})`
                    : `বর্তমান দখল: ${editRoom.occupiedBedsCount} টি (সর্বনিম্ন ${editRoom.occupiedBedsCount} হতে হবে)`}
                </p>
              </div>

              <div className="space-y-1">
                <Label htmlFor="editRent" className="text-xs">
                  {t('admin.rooms.rent')} *
                </Label>
                <Input
                  id="editRent"
                  type="number"
                  min="0"
                  step="100"
                  required
                  value={editForm.monthlyRent}
                  onChange={(e) => setEditForm({ ...editForm, monthlyRent: Number(e.target.value) })}
                  className="h-9 text-xs font-mono"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs">{t('admin.rooms.stat_maintenance')}</Label>
                <select
                  value={editForm.status}
                  onChange={(e) => setEditForm({ ...editForm, status: e.target.value as any })}
                  className="w-full h-9 rounded-md border border-slate-200 bg-white px-2.5 text-xs"
                >
                  <option value="AVAILABLE">{isEn ? 'Active / Available for allocation' : 'সচল / স্বাভাবিক (Available for allocation)'}</option>
                  <option value="MAINTENANCE">{isEn ? 'Under Maintenance (No new allocations)' : 'রক্ষণাবেক্ষণাধীন (Maintenance - নো নতুন বরাদ্দ)'}</option>
                </select>
                <p className="text-[10px] text-slate-400">
                  {isEn ? 'Setting maintenance prevents new allocations in this room.' : 'রক্ষণাবেক্ষণ নির্বাচন করলে এই রুমে কোনো নতুন শিক্ষার্থী বরাদ্দ দেওয়া যাবে না।'}
                </p>
              </div>

              <DialogFooter className="gap-2 pt-2 flex-col sm:flex-row">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setEditRoom(null)}
                >
                  {t('common.cancel')}
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  disabled={updateRoomMutation.isPending}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white"
                >
                  {updateRoomMutation.isPending ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" />
                      <span>{t('common.loading')}</span>
                    </>
                  ) : (
                    <span>{t('common.save')}</span>
                  )}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      )}

      {/* Delete Room Confirmation Dialog */}
      {deleteTarget && (
        <Dialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="text-base font-bold text-rose-700">
                {isEn ? 'Confirm Room Deletion' : 'রুম মুছে ফেলার নিশ্চিতকরণ'}
              </DialogTitle>
              <DialogDescription className="text-xs text-slate-600">
                {isEn
                  ? `Are you sure you want to permanently delete Room ${deleteTarget.roomNumber}?`
                  : `আপনি কি নিশ্চিতভাবে রুম ${deleteTarget.roomNumber} স্থায়ীভাবে মুছে ফেলতে চান?`}
              </DialogDescription>
            </DialogHeader>

            {deleteTarget.occupiedBedsCount > 0 && (
              <Alert variant="destructive" className="bg-rose-50 border-rose-200 text-rose-800 text-xs">
                <ShieldAlert className="w-4 h-4 text-rose-600" />
                <AlertTitle className="font-bold">{isEn ? 'Cannot Delete Room' : 'মুছে ফেলা সম্ভব নয়'}</AlertTitle>
                <AlertDescription>
                  {isEn
                    ? `This room has ${deleteTarget.occupiedBedsCount} active allocations. Vacate all beds first.`
                    : `এই রুমে ${deleteTarget.occupiedBedsCount} সিট বরাদ্দ রয়েছে। প্রথমে সিট খালি করুন।`}
                </AlertDescription>
              </Alert>
            )}

            {deleteError && (
              <Alert variant="destructive" className="bg-rose-50 border-rose-200 text-rose-800 text-xs">
                <AlertCircle className="w-4 h-4 text-rose-600" />
                <AlertDescription>{deleteError}</AlertDescription>
              </Alert>
            )}

            <DialogFooter className="gap-2 pt-2 flex-col sm:flex-row">
              <Button variant="outline" size="sm" onClick={() => setDeleteTarget(null)}>
                {t('common.cancel')}
              </Button>
              <Button
                size="sm"
                variant="destructive"
                disabled={deleteTarget.occupiedBedsCount > 0 || deleteRoomMutation.isPending}
                onClick={handleDeleteConfirm}
              >
                {deleteRoomMutation.isPending ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" />
                    <span>{t('common.loading')}</span>
                  </>
                ) : (
                  <span>{t('common.delete', 'Delete Permanently')}</span>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Allocation History Modal Dialog */}
      {historyRoom && (
        <Dialog open={!!historyRoom} onOpenChange={() => setHistoryRoom(null)}>
          <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-base font-bold flex items-center gap-2">
                <History className="w-5 h-5 text-emerald-600" />
                <span>
                  {t('student.room.room_number', { number: historyRoom.roomNumber })} — {isEn ? 'Allocation & Audit History' : 'বরাদ্দ ও অডিট ইতিহাস'}
                </span>
              </DialogTitle>
              <DialogDescription className="text-xs text-slate-500">
                {isEn ? 'Complete chronological allocation history for this room' : 'এই রুমের সকল সক্রিয় ও অতীত বরাদ্দের সম্পূর্ণ কালানুক্রমিক ইতিহাস'}
              </DialogDescription>
            </DialogHeader>

            <div className="py-2">
              {isHistoryLoading ? (
                <div className="p-8 text-center space-y-2">
                  <Loader2 className="w-6 h-6 animate-spin text-emerald-600 mx-auto" />
                  <p className="text-xs text-slate-400">{t('common.loading')}</p>
                </div>
              ) : !historyResponse?.allocations || historyResponse.allocations.length === 0 ? (
                <div className="p-8 text-center text-slate-400">
                  <p className="text-xs">{isEn ? 'No student allocations recorded for this room yet.' : 'এই রুমে এখনো কোনো শিক্ষার্থী বরাদ্দের রেকর্ড নেই।'}</p>
                </div>
              ) : (
                <div className="overflow-x-auto border border-slate-200 rounded-xl">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-slate-50 text-xs">
                        <TableHead className="text-xs">{t('student.room.bed')}</TableHead>
                        <TableHead className="text-xs">{t('student.payments.student_lbl')}</TableHead>
                        <TableHead className="text-xs">{t('student.profile.department')}</TableHead>
                        <TableHead className="text-xs">{t('admin.allocations.start_date')}</TableHead>
                        <TableHead className="text-xs">{t('admin.allocations.vacate_date')}</TableHead>
                        <TableHead className="text-xs">{t('common.status')}</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {historyResponse.allocations.map((alloc) => (
                        <TableRow key={alloc.id} className="text-xs">
                          <TableCell className="font-mono font-bold">{alloc.bedCode}</TableCell>
                          <TableCell>
                            <span className="font-bold text-slate-800 block">{alloc.studentName}</span>
                            <span className="text-[10px] text-slate-400 font-mono">
                              {alloc.studentCode} ({t('student.profile.roll_number')}: {alloc.rollNumber})
                            </span>
                          </TableCell>
                          <TableCell>{alloc.department}</TableCell>
                          <TableCell>{formatDate(alloc.startDate)}</TableCell>
                          <TableCell>{alloc.endDate ? formatDate(alloc.endDate) : (isEn ? 'Active' : 'চলমান')}</TableCell>
                          <TableCell>
                            <StatusBadge status={alloc.status} />
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </div>

            <DialogFooter>
              <Button variant="outline" size="sm" onClick={() => setHistoryRoom(null)}>
                {t('common.close')}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Add Bed Target Modal Dialog */}
      {addBedTarget && (
        <Dialog open={!!addBedTarget} onOpenChange={() => setAddBedTarget(null)}>
          <DialogContent className="sm:max-w-xs">
            <DialogHeader>
              <DialogTitle className="text-sm font-bold flex items-center gap-1.5">
                <Plus className="w-4 h-4 text-emerald-600" />
                <span>{isEn ? `Add Bed to Room ${addBedTarget.roomNumber}` : `নতুন বেড যোগ (রুম ${addBedTarget.roomNumber})`}</span>
              </DialogTitle>
            </DialogHeader>

            {bedError && (
              <Alert variant="destructive" className="bg-rose-50 border-rose-200 text-rose-800 text-xs">
                <AlertCircle className="w-4 h-4 text-rose-600" />
                <AlertDescription>{bedError}</AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleAddBedSubmit} className="space-y-3 py-1">
              <div className="space-y-1">
                <Label htmlFor="bedCode" className="text-xs">
                  {isEn ? 'Bed Code (e.g. C, D) *' : 'বেড কোড (e.g. C, D) *'}
                </Label>
                <Input
                  id="bedCode"
                  required
                  maxLength={4}
                  value={newBedCode}
                  onChange={(e) => setNewBedCode(e.target.value.toUpperCase())}
                  placeholder={isEn ? 'e.g. C' : 'যেমন: C'}
                  className="h-9 text-xs font-mono font-bold"
                />
              </div>

              <DialogFooter className="gap-2 pt-1 flex-col sm:flex-row">
                <Button variant="outline" size="sm" onClick={() => setAddBedTarget(null)}>
                  {t('common.cancel')}
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  disabled={addBedMutation.isPending}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white"
                >
                  {addBedMutation.isPending ? t('common.loading') : (isEn ? 'Add Bed' : 'বেড যুক্ত করুন')}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};
