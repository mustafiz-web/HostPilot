import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { CheckCircle2, ArrowRight, Eye } from 'lucide-react';
import { MOCK_ROOMS, type MockRoom } from './mock-data/public-mock-data';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/ui/status-badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';

export const RoomsPage: React.FC = () => {
  const { t, i18n } = useTranslation();
  const isEn = i18n.language?.startsWith('en');

  const [filter, setFilter] = useState<'ALL' | 'SINGLE' | 'DOUBLE' | 'QUAD'>('ALL');
  const [selectedRoom, setSelectedRoom] = useState<MockRoom | null>(null);

  const filteredRooms = MOCK_ROOMS.filter((room) => {
    if (filter === 'ALL') return true;
    return room.type === filter;
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
            variant={filter === 'QUAD' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter('QUAD')}
            className="rounded-full"
          >
            {t('rooms.filter_quad')}
          </Button>
        </div>
      </section>

      {/* Rooms Grid */}
      <section className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredRooms.map((room) => {
            const isAvailable = room.availableBeds > 0;
            return (
              <div
                key={room.id}
                className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-xs hover:border-emerald-300 hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="relative aspect-16/9 w-full bg-slate-100 overflow-hidden">
                    <img
                      src={room.imageUrl}
                      alt={isEn ? room.typeLabelEn : room.typeLabelBn}
                      className="w-full h-full object-cover object-center"
                    />
                    <div className="absolute top-3 right-3">
                      <StatusBadge status={isAvailable ? 'AVAILABLE' : 'OCCUPIED'} />
                    </div>
                    <div className="absolute bottom-3 left-3 bg-black/60 backdrop-blur-xs text-white text-xs px-2.5 py-1 rounded-md font-medium">
                      {isEn ? `Floor ${room.floor}` : `${room.floor}ম তলা`} — রুম {room.roomNumber}
                    </div>
                  </div>

                  <div className="p-6 space-y-4">
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">
                        {isEn ? room.typeLabelEn : room.typeLabelBn}
                      </h3>
                      <p className="text-xs text-gray-500 mt-1">
                        {isEn ? room.descriptionEn : room.descriptionBn}
                      </p>
                    </div>

                    <div className="flex items-baseline justify-between border-y border-gray-100 py-3">
                      <span className="text-xs font-semibold text-gray-500 uppercase">
                        {t('rooms.monthly_rent')}
                      </span>
                      <span className="text-2xl font-extrabold text-emerald-700">
                        ৳ {room.monthlyRent.toLocaleString('en-US')}
                        <span className="text-xs font-normal text-gray-500"> / মাস</span>
                      </span>
                    </div>

                    {/* Bed Capacity Indicator */}
                    <div className="space-y-1.5">
                      <div className="flex justify-between text-xs text-gray-600">
                        <span>সিট প্রাপ্যতা:</span>
                        <span className="font-semibold text-gray-900">
                          {room.availableBeds} {t('rooms.beds_available')} {room.totalBeds}
                        </span>
                      </div>
                      <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all ${
                            isAvailable ? 'bg-emerald-500' : 'bg-slate-400'
                          }`}
                          style={{
                            width: `${((room.totalBeds - room.availableBeds) / room.totalBeds) * 100}%`,
                          }}
                        />
                      </div>
                    </div>

                    {/* Features list */}
                    <ul className="space-y-1.5 pt-1">
                      {(isEn ? room.featuresEn : room.featuresBn).slice(0, 3).map((feat, fidx) => (
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
                      <span>{t('rooms.apply_now')}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Room Details Modal Dialog */}
      {selectedRoom && (
        <Dialog open={!!selectedRoom} onOpenChange={(open) => !open && setSelectedRoom(null)}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle className="text-xl">
                {isEn ? selectedRoom.typeLabelEn : selectedRoom.typeLabelBn} — রুম {selectedRoom.roomNumber}
              </DialogTitle>
              <DialogDescription>
                {isEn ? `Floor ${selectedRoom.floor}` : `${selectedRoom.floor}ম তলা`} | {isEn ? selectedRoom.descriptionEn : selectedRoom.descriptionBn}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-2">
              <div className="aspect-16/9 rounded-lg overflow-hidden bg-slate-100">
                <img
                  src={selectedRoom.imageUrl}
                  alt={selectedRoom.roomNumber}
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="grid grid-cols-2 gap-3 p-3 bg-slate-50 rounded-lg text-xs">
                <div>
                  <span className="text-gray-500 block">মাসিক ভাড়া:</span>
                  <span className="font-bold text-base text-emerald-700">৳ {selectedRoom.monthlyRent} / মাস</span>
                </div>
                <div>
                  <span className="text-gray-500 block">আসন প্রাপ্যতা:</span>
                  <span className="font-bold text-sm text-gray-900">
                    {selectedRoom.availableBeds} টি খালি (মোট {selectedRoom.totalBeds} টি)
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="text-xs font-bold text-gray-900 uppercase tracking-wider">
                  সুযোগ-সুবিধাসমূহ (Amenities):
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {(isEn ? selectedRoom.featuresEn : selectedRoom.featuresBn).map((feat, i) => (
                    <div key={i} className="flex items-center gap-2 text-xs text-gray-700">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span>{feat}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <DialogFooter className="gap-2 sm:justify-between items-center border-t pt-4">
              <Button variant="outline" onClick={() => setSelectedRoom(null)}>
                বন্ধ করুন
              </Button>
              <Button asChild disabled={selectedRoom.availableBeds === 0} className="gap-1.5">
                <Link to="/admission" onClick={() => setSelectedRoom(null)}>
                  <span>{t('rooms.apply_now')}</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};
