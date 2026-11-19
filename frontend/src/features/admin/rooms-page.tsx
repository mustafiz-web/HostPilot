import React, { useState } from 'react';
import { BedDouble, Plus, Bed, Building } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { StatusBadge } from '@/components/ui/status-badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { INITIAL_MOCK_ROOMS, type MockAdminRoom, type MockBed } from './mock-data/admin-mock-data';

export const RoomsPage: React.FC = () => {
  const [rooms, setRooms] = useState<MockAdminRoom[]>(INITIAL_MOCK_ROOMS);
  const [floorFilter, setFloorFilter] = useState<number | 'ALL'>('ALL');
  const [addModalOpen, setAddModalOpen] = useState(false);

  const [newRoom, setNewRoom] = useState({
    roomNumber: '',
    floor: 1,
    type: 'DOUBLE' as 'SINGLE' | 'DOUBLE' | 'QUAD',
    monthlyRent: 5000,
  });

  const filtered = rooms.filter((r) => {
    if (floorFilter === 'ALL') return true;
    return r.floor === floorFilter;
  });

  const handleAddRoom = (e: React.FormEvent) => {
    e.preventDefault();
    const cap = newRoom.type === 'SINGLE' ? 1 : newRoom.type === 'DOUBLE' ? 2 : 4;
    const generatedBeds: MockBed[] = Array.from({ length: cap }, (_, i) => ({
      id: `b-${newRoom.roomNumber}-${String.fromCharCode(65 + i)}`,
      bedCode: String.fromCharCode(65 + i),
      status: 'AVAILABLE',
    }));

    const roomEntry: MockAdminRoom = {
      id: `r-${Date.now()}`,
      roomNumber: newRoom.roomNumber,
      floor: Number(newRoom.floor),
      type: newRoom.type,
      capacity: cap,
      monthlyRent: Number(newRoom.monthlyRent),
      status: 'AVAILABLE',
      beds: generatedBeds,
    };

    setRooms([...rooms, roomEntry]);
    setAddModalOpen(false);
    setNewRoom({
      roomNumber: '',
      floor: 1,
      type: 'DOUBLE',
      monthlyRent: 5000,
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
            <BedDouble className="w-6 h-6 text-emerald-600" />
            <span>রুম ও বেড ব্যবস্থাপনা (Rooms & Beds)</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-500">
            ফিজিক্যাল রুম, ধারণক্ষমতা এবং প্রতিটি বেডের রিয়েলটাইম অবস্থা
          </p>
        </div>
        <Button onClick={() => setAddModalOpen(true)} className="gap-2 shadow-xs self-start sm:self-auto">
          <Plus className="w-4 h-4" />
          <span>নতুন রুম যোগ করুন</span>
        </Button>
      </div>

      {/* Floor Filter Strip */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center gap-2">
        <Building className="w-4 h-4 text-slate-400 mr-1" />
        <span className="text-xs text-slate-500 font-medium">ফ্লোর নির্বাচন:</span>
        <Button
          size="sm"
          variant={floorFilter === 'ALL' ? 'default' : 'outline'}
          onClick={() => setFloorFilter('ALL')}
          className="text-xs rounded-full h-8"
        >
          সকল ফ্লোর
        </Button>
        <Button
          size="sm"
          variant={floorFilter === 1 ? 'default' : 'outline'}
          onClick={() => setFloorFilter(1)}
          className="text-xs rounded-full h-8"
        >
          ১ম তলা (Floor 1)
        </Button>
        <Button
          size="sm"
          variant={floorFilter === 2 ? 'default' : 'outline'}
          onClick={() => setFloorFilter(2)}
          className="text-xs rounded-full h-8"
        >
          ২য় তলা (Floor 2)
        </Button>
      </div>

      {/* Rooms Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filtered.map((room) => {
          const availableCount = room.beds.filter((b) => b.status === 'AVAILABLE').length;
          return (
            <div
              key={room.id}
              className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4 hover:border-emerald-300 transition-all"
            >
              <div className="flex items-start justify-between border-b pb-3">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-xl font-bold text-slate-900">রুম {room.roomNumber}</h3>
                    <StatusBadge status={room.status} />
                  </div>
                  <span className="text-xs text-slate-500">
                    {room.floor}ম তলা • {room.type === 'SINGLE' ? 'সিঙ্গেল রুম' : room.type === 'DOUBLE' ? 'ডাবল রুম' : 'ফোর-বেড রুম'}
                  </span>
                </div>
                <div className="text-right">
                  <div className="text-lg font-extrabold text-emerald-700">
                    ৳ {room.monthlyRent.toLocaleString()}
                  </div>
                  <span className="text-[11px] text-slate-400">প্রতি সিট / মাস</span>
                </div>
              </div>

              {/* Beds Inventory Cards */}
              <div className="space-y-2">
                <div className="flex justify-between items-center text-xs text-slate-600 font-semibold">
                  <span>বেড সক্ষমতা ও বণ্টন অবস্থা:</span>
                  <span className="text-emerald-700">
                    {availableCount} টি সিট খালি (মোট {room.capacity} টি)
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {room.beds.map((bed) => {
                    const isOcc = bed.status === 'OCCUPIED';
                    const isMaint = bed.status === 'MAINTENANCE';
                    return (
                      <div
                        key={bed.id}
                        className={`p-3 rounded-xl border flex flex-col justify-between text-xs space-y-2 ${
                          isOcc
                            ? 'bg-slate-50 border-slate-200 text-slate-700'
                            : isMaint
                            ? 'bg-amber-50 border-amber-200 text-amber-800'
                            : 'bg-emerald-50/60 border-emerald-200 text-emerald-900'
                        }`}
                      >
                        <div className="flex justify-between items-center">
                          <span className="font-extrabold text-sm">বেড {bed.bedCode}</span>
                          <Bed className="w-4 h-4 opacity-70" />
                        </div>
                        <div className="text-[11px] truncate">
                          {isOcc ? (
                            <span className="font-medium text-slate-800" title={bed.studentName}>
                              {bed.studentName}
                            </span>
                          ) : isMaint ? (
                            <span className="font-medium text-amber-700">মেরামত চলছে</span>
                          ) : (
                            <span className="font-semibold text-emerald-700">খালি আছে</span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Room Modal */}
      <Dialog open={addModalOpen} onOpenChange={setAddModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>নতুন রুম তৈরি করুন</DialogTitle>
            <DialogDescription>
              রুম নম্বর, ফ্লোর এবং রুম টাইপ নির্বাচন করুন। বেডগুলো স্বয়ংক্রিয়ভাবে জেনারেট হবে।
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleAddRoom} className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label htmlFor="r-num">রুম নম্বর *</Label>
              <Input
                id="r-num"
                required
                placeholder="যেমন: ২০৩"
                value={newRoom.roomNumber}
                onChange={(e) => setNewRoom({ ...newRoom, roomNumber: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="r-floor">ফ্লোর *</Label>
                <select
                  id="r-floor"
                  value={newRoom.floor}
                  onChange={(e) => setNewRoom({ ...newRoom, floor: Number(e.target.value) })}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-ring"
                >
                  <option value={1}>১ম তলা (1st Floor)</option>
                  <option value={2}>২য় তলা (2nd Floor)</option>
                  <option value={3}>৩য় তলা (3rd Floor)</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="r-type">রুমের ধরন *</Label>
                <select
                  id="r-type"
                  value={newRoom.type}
                  onChange={(e) =>
                    setNewRoom({
                      ...newRoom,
                      type: e.target.value as 'SINGLE' | 'DOUBLE' | 'QUAD',
                      monthlyRent: e.target.value === 'SINGLE' ? 8000 : e.target.value === 'DOUBLE' ? 5000 : 3500,
                    })
                  }
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-ring"
                >
                  <option value="SINGLE">সিঙ্গেল (১ বেড)</option>
                  <option value="DOUBLE">ডাবল (২ বেড)</option>
                  <option value="QUAD">ফোর-বেড (৪ বেড)</option>
                </select>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="r-rent">মাসিক ভাড়া (BDT) *</Label>
              <Input
                id="r-rent"
                type="number"
                required
                value={newRoom.monthlyRent}
                onChange={(e) => setNewRoom({ ...newRoom, monthlyRent: Number(e.target.value) })}
              />
            </div>

            <DialogFooter className="gap-2 pt-2">
              <Button type="button" variant="outline" onClick={() => setAddModalOpen(false)}>
                বাতিল
              </Button>
              <Button type="submit">রুম যোগ করুন</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};
