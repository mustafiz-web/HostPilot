import React from 'react';
import { useTranslation } from 'react-i18next';
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
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/ui/status-badge';
import { Badge } from '@/components/ui/badge';
import { MOCK_ROOMS, MOCK_NOTICES } from './mock-data/public-mock-data';

export const HomePage: React.FC = () => {
  const { t, i18n } = useTranslation();
  const isEn = i18n.language?.startsWith('en');

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
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-100/80 text-emerald-800 text-xs sm:text-sm font-medium border border-emerald-200/60 shadow-xs"
          >
            <Sparkles className="w-4 h-4 text-emerald-600" />
            <span>{t('hero.badge')}</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-gray-900 leading-tight"
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
            className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4"
          >
            <Button asChild size="lg" className="w-full sm:w-auto gap-2 shadow-sm font-semibold">
              <Link to="/admission">
                <span>{t('hero.cta_apply')}</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="w-full sm:w-auto font-medium">
              <Link to="/rooms">{t('hero.cta_explore')}</Link>
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Stats Counter Strip */}
      <section className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-2xl bg-slate-900 text-white p-8 max-w-5xl mx-auto shadow-md">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 text-center">
            {stats.map((st, i) => (
              <div key={i} className="space-y-1">
                <div className="text-3xl sm:text-4xl font-extrabold text-emerald-400">
                  {st.value}
                </div>
                <div className="text-xs sm:text-sm text-slate-300 font-medium">
                  {isEn ? st.labelEn : st.labelBn}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Core Features Cards */}
      <section className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto space-y-8">
          <div className="text-center space-y-2">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">
              প্রধান বৈশিষ্ট্যসমূহ
            </h2>
            <p className="text-sm sm:text-base text-gray-600">
              একটি সমন্বিত ডিজিটাল প্ল্যাটফর্মে হোস্টেল পরিচালনার সবকিছু
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {features.map((item, idx) => {
              const Icon = item.icon;
              return (
                <motion.div
                  key={idx}
                  whileHover={{ y: -4 }}
                  transition={{ duration: 0.2 }}
                  className="rounded-xl border border-gray-200 bg-white p-6 shadow-xs hover:border-emerald-300 hover:shadow-md transition-all space-y-4"
                >
                  <div className="flex items-center justify-between">
                    <div className="h-12 w-12 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
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

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {MOCK_ROOMS.slice(0, 3).map((room) => (
            <div
              key={room.id}
              className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-xs hover:border-emerald-300 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="relative aspect-16/10 w-full bg-slate-100 overflow-hidden">
                  <img
                    src={room.imageUrl}
                    alt={room.roomNumber}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-3 right-3">
                    <StatusBadge status={room.availableBeds > 0 ? 'AVAILABLE' : 'OCCUPIED'} />
                  </div>
                </div>

                <div className="p-5 space-y-3">
                  <div className="flex justify-between items-baseline">
                    <h3 className="font-bold text-lg text-gray-900">
                      {isEn ? room.typeLabelEn : room.typeLabelBn}
                    </h3>
                    <span className="text-sm font-extrabold text-emerald-700">
                      ৳ {room.monthlyRent} / মাস
                    </span>
                  </div>
                  <p className="text-xs text-gray-600 line-clamp-2">
                    {isEn ? room.descriptionEn : room.descriptionBn}
                  </p>
                  <div className="pt-2 border-t border-gray-100 text-xs text-gray-500">
                    আসন: <strong>{room.availableBeds}</strong> টি খালি / মোট {room.totalBeds} টি
                  </div>
                </div>
              </div>

              <div className="p-5 pt-0">
                <Button asChild size="sm" className="w-full gap-1">
                  <Link to="/admission">
                    <span>সিটের আবেদন করুন</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </Button>
              </div>
            </div>
          ))}
        </div>
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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {MOCK_NOTICES.slice(0, 2).map((notice) => (
            <div
              key={notice.id}
              className="bg-white rounded-xl border border-gray-200 p-5 shadow-xs space-y-2 hover:border-emerald-300 transition-all flex flex-col justify-between"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs text-gray-400">
                  <Badge variant="outline" className="text-[10px]">
                    {isEn ? notice.categoryLabelEn : notice.categoryLabelBn}
                  </Badge>
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    <span>{notice.publishedDate}</span>
                  </span>
                </div>
                <h3 className="font-bold text-sm text-gray-900">
                  {isEn ? notice.titleEn : notice.titleBn}
                </h3>
                <p className="text-xs text-gray-600 line-clamp-2">
                  {isEn ? notice.contentEn : notice.contentBn}
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
      </section>

      {/* CTA Admission Banner */}
      <section className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-5xl">
        <div className="rounded-3xl bg-linear-to-r from-emerald-700 to-emerald-900 text-white p-8 sm:p-12 text-center space-y-6 shadow-lg">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight">
            হোস্টেলে আপনার আসন নিশ্চিত করতে প্রস্তুত?
          </h2>
          <p className="text-emerald-100 max-w-xl mx-auto text-sm sm:text-base leading-relaxed">
            কোনো পূর্ববর্তী অ্যাকাউন্টের প্রয়োজন ছাড়াই অনলাইনে সহজে সিটের জন্য আবেদন করুন।
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
            <Button asChild size="lg" className="w-full sm:w-auto bg-white text-emerald-900 hover:bg-emerald-50 font-bold shadow-md">
              <Link to="/admission">
                <span>অনলাইনে আবেদন করুন</span>
                <ArrowRight className="w-4 h-4 ml-1" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="w-full sm:w-auto border-emerald-400 text-white hover:bg-emerald-800 font-semibold">
              <Link to="/contact">যোগাযোগ করুন</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};
