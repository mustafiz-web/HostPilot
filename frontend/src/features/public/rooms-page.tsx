import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { CheckCircle2, ArrowRight, Eye, RefreshCw, AlertCircle, Bed } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/ui/status-badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { apiClient } from '@/lib/api-client';

interface RealRoom {
  id: string;
  roomNumber: string;
  floor: number;
  capacity: number;
  roomType: 'SINGLE' | 'DOUBLE' | 'TRIPLE' | 'FOUR_BED';
  monthlyRent: number;
  status: 'AVAILABLE' | 'PARTIALLY_OCCUPIED' | 'FULL' | 'MAINTENANCE';
  occupiedBedsCount: number;
  availableBedsCount: number;
  unavailableBedsCount: number;
  beds?: Array<{
    id: string;
    bedCode: string;
    status: string;
  }>;
}

function getRoomMetadata(type: string) {
  switch (type) {
    case 'SINGLE':
      return {
        labelBn: 'সিঙ্গেল বেড রুম',
        labelEn: 'Single Bed Room',
        descBn: 'একক শিক্ষার্থীর জন্য উপযুক্ত নিরিবিলি ও প্রিমিয়াম সিঙ্গেল রুম।',
        descEn: 'Premium single-occupancy room designed for quiet academic focus.',
        featuresBn: ['ব্যক্তিগত পড়ার টেবিল ও চেয়ার', 'সংযুক্ত বারান্দা', 'উচ্চগতির ওয়াইফাই', 'ব্যক্তিগত আলমিরা'],
        featuresEn: ['Private Study Table & Chair', 'Attached Balcony', 'High-Speed Wi-Fi', 'Personal Wardrobe'],
        imageUrl: 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&q=80&w=800',
      };
    case 'DOUBLE':
      return {
        labelBn: 'ডাবল শেয়ার্ড রুম (২ বেড)',
        labelEn: 'Double Shared Room (2 Beds)',
        descBn: 'দুজন শিক্ষার্থীর জন্য প্রশস্ত ও স্বাস্থ্যকর মনোরম পরিবেশ।',
        descEn: 'Spacious dual-occupancy room with dedicated study areas.',
        featuresBn: ['২টি পৃথক স্টাডি ডেস্ক', 'প্রশস্ত ভেন্টিলেশন', 'শেয়ার্ড স্টোরেজ লকার', 'হাই-স্পিড ইন্টারনেট'],
        featuresEn: ['2 Separate Study Desks', 'Spacious Ventilation', 'Shared Storage Lockers', 'High-Speed Internet'],
        imageUrl: 'https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?auto=format&fit=crop&q=80&w=800',
      };
    case 'TRIPLE':
      return {
        labelBn: 'ট্রিপল শেয়ার্ড রুম (৩ বেড)',
        labelEn: 'Triple Shared Room (3 Beds)',
        descBn: 'তিনজন শিক্ষার্থীর জন্য পর্যাপ্ত আলো-বাতাস ও সুবিশাল পরিবেশ।',
        descEn: 'Triple sharing accommodation designed for cooperative student life.',
        featuresBn: ['৩টি পড়ার ডেস্ক', 'পর্যাপ্ত বুকশেল্ফ', 'উচ্চগতির ওয়াইফাই', 'দৈনিক ক্লিনিং'],
        featuresEn: ['3 Study Desks', 'Spacious Bookshelves', 'High-Speed Wi-Fi', 'Daily Cleaning'],
        imageUrl: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&q=80&w=800',
      };
    case 'FOUR_BED':
    default:
      return {
        labelBn: 'ফোর-বেড স্ট্যান্ডার্ড রুম (৪ বেড)',
        labelEn: 'Four-Bed Standard Room (4 Beds)',
        descBn: 'চারজন শিক্ষার্থীর জন্য মানসম্মত, সাশ্রয়ী ও আরামদায়ক ডরমেটরি ব্যবস্থা।',
        descEn: 'Economical dormitory accommodation ideal for collaborative peers.',
        featuresBn: ['ব্যক্তিগত লকার', 'ওয়াইফাই সংযোগ', 'প্রতিটি বেডে চার্জিং পয়েন্ট', 'দৈনিক হাউস-কিপিং'],
        featuresEn: ['Personal Lockers', 'Wi-Fi Connection', 'Bedside Power Outlets', 'Daily Housekeeping'],
        imageUrl: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&q=80&w=800',
      };
  }
}

export const RoomsPage: React.FC = () => {
  const { t, i18n } = useTranslation();
  const isEn = i18n.language?.startsWith('en');

  const [filter, setFilter] = useState<'ALL' | 'SINGLE' | 'DOUBLE' | 'TRIPLE' | 'FOUR_BED'>('ALL');
  const [selectedRoom, setSelectedRoom] = useState<RealRoom | null>(null);

  // Fetch rooms from real MySQL database
  const {
    data: roomsResponse,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ['public-rooms'],
    queryFn: async () => {
      return apiClient.get<RealRoom[]>('/rooms');
    },
  });

  const rooms: RealRoom[] = roomsResponse?.data || [];

  const filteredRooms = rooms.filter((room) => {
    if (filter === 'ALL') return true;
    return room.roomType === filter;
  });

  return (
    <div className="space-y-12 py-10 md:py-16">
      {/* Header */}
      <section className="container mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-4 max-w-3xl">
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-gray-900 tracking-tight">
          {t('rooms.title')}
        </h1>
        <p className="text-base sm:text-lg text-gray-600 leading-relaxed">
          {t('rooms.subtitle')}
        </p>

        {/* Filter Tabs */}
        <div className="flex flex-wrap items-center justify-center gap-2 pt-4">
          <Button
            variant={filter === 'ALL' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter('ALL')}
            className="rounded-full"
          >
            {t('rooms.filter_all')}
          </Button>
          <Button
            variant={filter === 'SINGLE' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter('SINGLE')}
            className="rounded-full"
          >
            {t('rooms.filter_single')}
          </Button>
          <Button
            variant={filter === 'DOUBLE' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter('DOUBLE')}
            className="rounded-full"
          >
            {t('rooms.filter_double')}
          </Button>
          <Button
            variant={filter === 'FOUR_BED' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter('FOUR_BED')}
            className="rounded-full"
          >
            {t('rooms.filter_quad')}
          </Button>
        </div>
      </section>

      {/* Rooms Grid */}
      <section className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl">
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="bg-white rounded-2xl border border-gray-200 p-5 space-y-4">
                <Skeleton className="aspect-16/9 w-full rounded-xl" />
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-10 w-full" />
              </div>
            ))}
          </div>
        ) : isError ? (
          <div className="text-center py-12 bg-white rounded-2xl border border-slate-200 p-8 space-y-3">
            <AlertCircle className="w-10 h-10 text-red-500 mx-auto" />
            <h3 className="text-base font-bold text-slate-800">রুম তালিকা লোড করা সম্ভব হয়নি</h3>
            <p className="text-xs text-slate-500">ডাটাবেজ সংযোগে সমস্যা হতে পারে। অনুগ্রহ করে পুনরায় চেষ্টা করুন।</p>
            <Button size="sm" onClick={() => refetch()} className="gap-1.5">
              <RefreshCw className="w-4 h-4" />
              <span>পুনরায় লোড করুন</span>
            </Button>
          </div>
        ) : filteredRooms.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-slate-200 p-8 space-y-3">
            <Bed className="w-12 h-12 text-slate-300 mx-auto" />
            <h3 className="text-base font-bold text-slate-800">কোনো রুম খুঁজে পাওয়া যায়নি</h3>
            <p className="text-xs text-slate-400">ফিল্টার পরিবর্তন করে পুনরায় চেষ্টা করুন।</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredRooms.map((room) => {
              const meta = getRoomMetadata(room.roomType);
              const isAvailable = room.availableBedsCount > 0 && room.status !== 'MAINTENANCE';
              const isFull = room.availableBedsCount === 0 || room.status === 'FULL';

              return (
                <div
                  key={room.id}
                  className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-xs hover:border-emerald-300 hover:shadow-md transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="relative aspect-16/9 w-full bg-slate-100 overflow-hidden">
                      <img
                        src={meta.imageUrl}
                        alt={isEn ? meta.labelEn : meta.labelBn}
                        className="w-full h-full object-cover object-center"
                      />
                      <div className="absolute top-3 right-3">
                        <StatusBadge
                          status={
                            room.status === 'MAINTENANCE'
                              ? 'MAINTENANCE'
                              : isAvailable
                              ? 'AVAILABLE'
                              : 'FULL'
                          }
                        />
                      </div>
                      <div className="absolute bottom-3 left-3 bg-black/60 backdrop-blur-xs text-white text-xs px-2.5 py-1 rounded-md font-medium">
                        {isEn ? `Floor ${room.floor}` : `${room.floor}ম তলা`} — রুম {room.roomNumber}
                      </div>
                    </div>

                    <div className="p-6 space-y-4">
                      <div>
                        <h3 className="text-xl font-bold text-gray-900">
                          {isEn ? meta.labelEn : meta.labelBn}
                        </h3>
                        <p className="text-xs text-gray-500 mt-1">
                          {isEn ? meta.descEn : meta.descBn}
                        </p>
                      </div>

                      <div className="flex items-baseline justify-between border-y border-gray-100 py-3">
                        <span className="text-xs font-semibold text-gray-500 uppercase">
                          {t('rooms.monthly_rent')}
                        </span>
                        <span className="text-2xl font-extrabold text-emerald-700">
                          ৳ {Number(room.monthlyRent).toLocaleString('en-US')}
                          <span className="text-xs font-normal text-gray-500"> / মাস</span>
                        </span>
                      </div>

                      {/* Bed Capacity Indicator */}
                      <div className="space-y-1.5">
                        <div className="flex justify-between text-xs text-gray-600">
                          <span>সিট প্রাপ্যতা:</span>
                          <span className="font-semibold text-gray-900">
                            {isFull
                              ? 'স্টক আউট (কোনো সিট খালি নেই)'
                              : `${room.availableBedsCount} ${t('rooms.beds_available')} ${room.capacity}`}
                          </span>
                        </div>
                        <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all ${
                              isAvailable ? 'bg-emerald-500' : 'bg-red-400'
                            }`}
                            style={{
                              width: `${(room.occupiedBedsCount / room.capacity) * 100}%`,
                            }}
                          />
                        </div>
                      </div>

                      {/* Features list */}
                      <ul className="space-y-1.5 pt-1">
                        {(isEn ? meta.featuresEn : meta.featuresBn).slice(0, 3).map((feat, fidx) => (
                          <li key={fidx} className="flex items-center gap-2 text-xs text-gray-700">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                            <span>{feat}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  <div className="p-6 pt-0 border-t border-gray-100 mt-4 flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 gap-1 text-xs"
                      onClick={() => setSelectedRoom(room)}
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>{t('rooms.view_details')}</span>
                    </Button>
                    <Button
                      asChild
                      size="sm"
                      className="flex-1 gap-1 text-xs font-semibold shadow-xs"
                      disabled={!isAvailable}
                    >
                      <Link to="/admission">
                        <span>{isAvailable ? t('rooms.apply_now') : 'স্টক আউট'}</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Room Details Modal Dialog */}
      {selectedRoom && (
        <Dialog open={!!selectedRoom} onOpenChange={(open) => !open && setSelectedRoom(null)}>
          <DialogContent className="max-w-lg">
            {(() => {
              const meta = getRoomMetadata(selectedRoom.roomType);
              const isAvail = selectedRoom.availableBedsCount > 0 && selectedRoom.status !== 'MAINTENANCE';
              return (
                <>
                  <DialogHeader>
                    <DialogTitle className="text-xl">
                      {isEn ? meta.labelEn : meta.labelBn} — রুম {selectedRoom.roomNumber}
                    </DialogTitle>
                    <DialogDescription>
                      {isEn ? `Floor ${selectedRoom.floor}` : `${selectedRoom.floor}ম তলা`} | {isEn ? meta.descEn : meta.descBn}
                    </DialogDescription>
                  </DialogHeader>

                  <div className="space-y-4 py-2">
                    <div className="aspect-16/9 rounded-lg overflow-hidden bg-slate-100">
                      <img
                        src={meta.imageUrl}
                        alt={selectedRoom.roomNumber}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3 p-3 bg-slate-50 rounded-lg text-xs">
                      <div>
                        <span className="text-gray-500 block">মাসিক ভাড়া:</span>
                        <span className="font-bold text-base text-emerald-700">
                          ৳ {Number(selectedRoom.monthlyRent).toLocaleString()} / মাস
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-500 block">আসন প্রাপ্যতা:</span>
                        <span className="font-bold text-sm text-gray-900">
                          {selectedRoom.availableBedsCount} টি খালি (মোট {selectedRoom.capacity} টি)
                        </span>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <h4 className="text-xs font-bold text-gray-900 uppercase tracking-wider">
                        সুযোগ-সুবিধাসমূহ (Amenities):
                      </h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {(isEn ? meta.featuresEn : meta.featuresBn).map((feat, i) => (
                          <div key={i} className="flex items-center gap-2 text-xs text-gray-700">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                            <span>{feat}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <DialogFooter className="flex flex-col-reverse sm:flex-row gap-2 sm:justify-between items-stretch sm:items-center border-t pt-4">
                    <Button variant="outline" className="w-full sm:w-auto" onClick={() => setSelectedRoom(null)}>
                      বন্ধ করুন
                    </Button>
                    <Button
                      asChild
                      disabled={!isAvail}
                      className="w-full sm:w-auto gap-1.5"
                    >
                      <Link to="/admission" onClick={() => setSelectedRoom(null)}>
                        <span>{isAvail ? t('rooms.apply_now') : 'স্টক আউট'}</span>
                        <ArrowRight className="w-4 h-4" />
                      </Link>
                    </Button>
                  </DialogFooter>
                </>
              );
            })()}
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};
