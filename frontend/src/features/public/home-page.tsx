import React from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'motion/react';
import { Link } from 'react-router-dom';
import {
  Bed,
  CreditCard,
  MessageSquare,
  ArrowRight,
  Sparkles,
  Bell,
  Calendar,
  UserPlus,
  LogIn,
  LayoutDashboard,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/ui/status-badge';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { apiClient } from '@/lib/api-client';
import { useAuth } from '@/features/auth/auth-context';

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
}

interface RealNotice {
  id: string;
  title: string;
  titleEn?: string | null;
  content: string;
  contentEn?: string | null;
  category: string;
  isPinned: boolean;
  publishedAt?: string | null;
  createdAt: string;
}

function getRoomMetadata(type: string) {
  switch (type) {
    case 'SINGLE':
      return {
        labelBn: 'সিঙ্গেল বেড রুম',
        labelEn: 'Single Bed Room',
        descBn: 'একক শিক্ষার্থীর জন্য উপযুক্ত নিরিবিলি ও প্রিমিয়াম সিঙ্গেল রুম।',
        descEn: 'Premium single-occupancy room designed for quiet academic focus.',
        imageUrl: 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&q=80&w=800',
      };
    case 'DOUBLE':
      return {
        labelBn: 'ডাবল শেয়ার্ড রুম (২ বেড)',
        labelEn: 'Double Shared Room (2 Beds)',
        descBn: 'দুজন শিক্ষার্থীর জন্য প্রশস্ত ও স্বাস্থ্যকর মনোরম পরিবেশ।',
        descEn: 'Spacious dual-occupancy room with dedicated study areas.',
        imageUrl: 'https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?auto=format&fit=crop&q=80&w=800',
      };
    case 'TRIPLE':
      return {
        labelBn: 'ট্রিপল শেয়ার্ড রুম (৩ বেড)',
        labelEn: 'Triple Shared Room (3 Beds)',
        descBn: 'তিনজন শিক্ষার্থীর জন্য পর্যাপ্ত আলো-বাতাস ও সুবিশাল পরিবেশ।',
        descEn: 'Triple sharing accommodation designed for cooperative student life.',
        imageUrl: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&q=80&w=800',
      };
    case 'FOUR_BED':
    default:
      return {
        labelBn: 'ফোর-বেড স্ট্যান্ডার্ড রুম (৪ বেড)',
        labelEn: 'Four-Bed Standard Room (4 Beds)',
        descBn: 'চারজন শিক্ষার্থীর জন্য মানসম্মত, সাশ্রয়ী ও আরামদায়ক ডরমেটরি ব্যবস্থা।',
        descEn: 'Economical dormitory accommodation ideal for collaborative peers.',
        imageUrl: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&q=80&w=800',
      };
  }
}

export const HomePage: React.FC = () => {
  const { t, i18n } = useTranslation();
  const isEn = i18n.language?.startsWith('en');
  const { user, isAuthenticated } = useAuth();

  // Fetch real rooms from MySQL
  const { data: roomsResponse, isLoading: isLoadingRooms } = useQuery({
    queryKey: ['public-home-rooms'],
    queryFn: async () => {
      return apiClient.get<RealRoom[]>('/rooms');
    },
  });

  // Fetch real notices from MySQL
  const { data: noticesResponse, isLoading: isLoadingNotices } = useQuery({
    queryKey: ['public-home-notices'],
    queryFn: async () => {
      return apiClient.get<RealNotice[]>('/notices');
    },
  });

  const rooms: RealRoom[] = roomsResponse?.data || [];
  const notices: RealNotice[] = noticesResponse?.data || [];

  const features = [
    {
      icon: Bed,
      title: t('features.room_title'),
      desc: t('features.room_desc'),
      tag: 'স্বচ্ছ বণ্টন',
    },
    {
      icon: CreditCard,
      title: t('features.payment_title'),
      desc: t('features.payment_desc'),
      tag: 'ডিজিটাল হিসাব',
    },
    {
      icon: MessageSquare,
      title: t('features.complaint_title'),
      desc: t('features.complaint_desc'),
      tag: 'দ্রুত সমাধান',
    },
  ];

  const stats = [
    { value: '১৫০+', labelEn: 'Total Beds', labelBn: 'মোট আসন সংখ্যা' },
    { value: '৯৮%', labelEn: 'Student Satisfaction', labelBn: 'শিক্ষার্থী সন্তুষ্টি' },
    { value: '২৪/৭', labelEn: 'Security & CCTV', labelBn: 'নিরাপত্তা ও সিসিটিভি' },
    { value: '১০০%', labelEn: 'Digital Transparency', labelBn: 'ডিজিটাল স্বচ্ছতা' },
  ];

  return (
    <div className="space-y-16 py-8 md:py-16">
      {/* Hero Section */}
      <section className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 text-emerald-900 text-xs sm:text-sm font-bold border border-emerald-300 shadow-xs"
          >
            <Sparkles className="w-4 h-4 text-emerald-700" />
            <span>{t('hero.badge')}</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-gray-900 leading-tight"
          >
            {t('hero.title')}{' '}
            <span className="text-emerald-600 block mt-1 sm:inline">
              Hostel Management
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed"
          >
            {t('hero.subtitle')}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4"
          >
            {isAuthenticated && user ? (
              <>
                <Button asChild size="lg" className="w-full sm:w-auto gap-2 shadow-sm font-semibold bg-emerald-600 hover:bg-emerald-700 text-white">
                  <Link to={user.role === 'ADMIN' ? '/admin' : '/student'}>
                    <LayoutDashboard className="w-4 h-4" />
                    <span>{isEn ? `Go to ${user.role === 'ADMIN' ? 'Admin' : 'Student'} Dashboard` : 'ড্যাশবোর্ডে প্রবেশ করুন'}</span>
                  </Link>
                </Button>
                <Button asChild variant="outline" size="lg" className="w-full sm:w-auto font-medium border-emerald-600 text-emerald-800 hover:bg-emerald-50">
                  <Link to="/rooms">
                    <span>{t('hero.cta_explore')}</span>
                  </Link>
                </Button>
              </>
            ) : (
              <>
                <Button asChild size="lg" className="w-full sm:w-auto gap-2 shadow-sm font-semibold bg-emerald-600 hover:bg-emerald-700 text-white">
                  <Link to="/register">
                    <UserPlus className="w-4 h-4" />
                    <span>{isEn ? 'Register as Student' : 'শিক্ষার্থী অ্যাকাউন্ট তৈরি'}</span>
                  </Link>
                </Button>
                <Button asChild variant="outline" size="lg" className="w-full sm:w-auto font-medium border-emerald-600 text-emerald-800 hover:bg-emerald-50">
                  <Link to="/login">
                    <LogIn className="w-4 h-4" />
                    <span>{isEn ? 'Student / Admin Login' : 'লগইন করুন'}</span>
                  </Link>
                </Button>
                <Button asChild variant="ghost" size="lg" className="w-full sm:w-auto font-medium text-slate-700">
                  <Link to="/rooms">{t('hero.cta_explore')}</Link>
                </Button>
              </>
            )}
          </motion.div>
        </div>
      </section>

      {/* Stats Counter Section */}
      <section className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 p-6 sm:p-8 bg-emerald-900 text-white rounded-3xl shadow-sm">
          {stats.map((stat, idx) => (
            <div key={idx} className="text-center p-3 border-r last:border-r-0 border-emerald-800/80">
              <div className="text-3xl sm:text-4xl font-extrabold text-emerald-300">
                {stat.value}
              </div>
              <div className="text-xs sm:text-sm text-emerald-100 font-medium mt-1">
                {isEn ? stat.labelEn : stat.labelBn}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Core Features */}
      <section className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl space-y-12">
        <div className="text-center space-y-3 max-w-2xl mx-auto">
          <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider">
            {t('features.tag')}
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">
            {t('features.main_heading')}
          </h2>
          <p className="text-sm text-gray-600">
            {t('features.main_subheading')}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {features.map((item, idx) => {
            const Icon = item.icon;
            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: idx * 0.1 }}
                className="bg-white rounded-2xl border border-gray-200 p-6 shadow-xs hover:border-emerald-300 hover:shadow-md transition-all space-y-4"
              >
                <div className="flex items-center justify-between">
                  <div className="h-12 w-12 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                    <Icon className="w-6 h-6" />
                  </div>
                  <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700">
                    {item.tag}
                  </span>
                </div>
                <h3 className="text-lg font-bold text-gray-900">{item.title}</h3>
                <p className="text-sm text-gray-600 leading-relaxed">{item.desc}</p>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* Rooms Preview Section */}
      <section className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b pb-4">
          <div>
            <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider block">
              রুম ক্যাটাগরি
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">
              আমাদের আধুনিক রুমসমূহ
            </h2>
          </div>
          <Button asChild variant="outline" size="sm" className="gap-1.5 self-start sm:self-auto">
            <Link to="/rooms">
              <span>সব রুম দেখুন</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </Button>
        </div>

        {isLoadingRooms ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-2xl border border-gray-200 p-5 space-y-3">
                <Skeleton className="aspect-16/10 w-full rounded-xl" />
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {rooms.slice(0, 3).map((room) => {
              const meta = getRoomMetadata(room.roomType);
              const isAvailable = room.availableBedsCount > 0 && room.status !== 'MAINTENANCE';

              return (
                <div
                  key={room.id}
                  className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-xs hover:border-emerald-300 transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="relative aspect-16/10 w-full bg-slate-100 overflow-hidden">
                      <img
                        src={meta.imageUrl}
                        alt={room.roomNumber}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute top-3 right-3">
                        <StatusBadge status={isAvailable ? 'AVAILABLE' : 'FULL'} />
                      </div>
                    </div>

                    <div className="p-5 space-y-3">
                      <div className="flex justify-between items-baseline">
                        <h3 className="font-bold text-lg text-gray-900">
                          {isEn ? meta.labelEn : meta.labelBn}
                        </h3>
                        <span className="text-sm font-extrabold text-emerald-700">
                          ৳ {Number(room.monthlyRent).toLocaleString()} / মাস
                        </span>
                      </div>
                      <p className="text-xs text-gray-600 line-clamp-2">
                        {isEn ? meta.descEn : meta.descBn}
                      </p>
                      <div className="pt-2 border-t border-gray-100 text-xs text-gray-500">
                        আসন: <strong>{room.availableBedsCount}</strong> টি খালি / মোট {room.capacity} টি
                      </div>
                    </div>
                  </div>

                  <div className="p-5 pt-0">
                    <Button asChild size="sm" className="w-full gap-1" disabled={!isAvailable}>
                      <Link to="/admission">
                        <span>{isAvailable ? 'সিটের আবেদন করুন' : 'স্টক আউট'}</span>
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

      {/* Latest Notices Preview */}
      <section className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-5xl space-y-6">
        <div className="flex items-center justify-between border-b pb-4">
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
                সাম্প্রতিক হোস্টেল নোটিশ
              </h2>
              <p className="text-xs text-gray-500">জরুরি ঘোষণা ও একাডেমিক আপডেট</p>
            </div>
          </div>
          <Button asChild variant="ghost" size="sm" className="text-xs text-emerald-700 gap-1">
            <Link to="/notices">
              <span>সকল নোটিশ</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </Button>
        </div>

        {isLoadingNotices ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[1, 2].map((i) => (
              <div key={i} className="bg-white rounded-xl border border-gray-200 p-5 space-y-2">
                <Skeleton className="h-4 w-1/4" />
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-12 w-full" />
              </div>
            ))}
          </div>
        ) : notices.length === 0 ? (
          <div className="text-center py-8 bg-white rounded-xl border border-slate-200 p-6 text-xs text-slate-400">
            বর্তমানে কোনো সাম্প্রতিক নোটিশ নেই।
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {notices.slice(0, 2).map((notice) => (
              <div
                key={notice.id}
                className="bg-white rounded-xl border border-gray-200 p-5 shadow-xs space-y-2 hover:border-emerald-300 transition-all flex flex-col justify-between"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs text-gray-400">
                    <Badge variant="outline" className="text-[10px]">
                      {notice.category}
                    </Badge>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      <span>
                        {notice.publishedAt
                          ? new Date(notice.publishedAt).toLocaleDateString('bn-BD', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric',
                            })
                          : new Date(notice.createdAt).toLocaleDateString('bn-BD', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric',
                            })}
                      </span>
                    </span>
                  </div>
                  <h3 className="font-bold text-sm text-gray-900">
                    {isEn && notice.titleEn ? notice.titleEn : notice.title}
                  </h3>
                  <p className="text-xs text-gray-600 line-clamp-2">
                    {isEn && notice.contentEn ? notice.contentEn : notice.content}
                  </p>
                </div>
                <div className="pt-3 border-t border-gray-100">
                  <Button asChild variant="link" size="sm" className="p-0 text-xs h-auto">
                    <Link to="/notices">
                      <span>বিস্তারিত পড়ুন</span>
                      <ArrowRight className="w-3 h-3 ml-1" />
                    </Link>
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* CTA Admission Banner */}
      <section className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-5xl">
        <div className="rounded-3xl bg-emerald-900 bg-gradient-to-r from-emerald-800 via-emerald-900 to-slate-900 text-white p-8 sm:p-12 text-center space-y-6 shadow-xl border border-emerald-700/50">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-white drop-shadow-sm">
            হোস্টেলে আপনার আসন নিশ্চিত করতে প্রস্তুত?
          </h2>
          <p className="text-emerald-100 max-w-xl mx-auto text-sm sm:text-base leading-relaxed">
            কোনো পূর্ববর্তী অ্যাকাউন্টের প্রয়োজন ছাড়াই অনলাইনে সহজে সিটের জন্য আবেদন করুন।
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
            <Button asChild size="lg" className="w-full sm:w-auto bg-white text-emerald-950 hover:bg-emerald-50 font-bold shadow-md px-6 py-2.5">
              <Link to="/admission">
                <span>অনলাইনে আবেদন করুন</span>
                <ArrowRight className="w-4 h-4 ml-1" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="w-full sm:w-auto border-2 border-white/80 bg-white/10 text-white hover:bg-white hover:text-emerald-950 font-bold px-6 py-2.5 transition-colors">
              <Link to="/contact">যোগাযোগ করুন</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};
