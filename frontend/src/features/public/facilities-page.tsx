import React from 'react';
import { useTranslation } from 'react-i18next';
import {
  Wifi,
  Utensils,
  ShieldCheck,
  Sparkles,
  BookOpen,
  Clock,
  Droplets,
  Tv,
  CheckCircle2,
  CalendarDays,
} from 'lucide-react';

export const FacilitiesPage: React.FC = () => {
  const { t, i18n } = useTranslation();
  const isEn = i18n.language?.startsWith('en');

  const facilities = [
    {
      icon: Wifi,
      title: isEn ? 'High-Speed Wi-Fi' : 'উচ্চগতির ওয়াইফাই',
      desc: isEn ? 'Continuous dual-band fiber optic internet across all rooms and study lounges.' : 'সকল রুম ও স্টাডি জোনে নিরবচ্ছিন্ন উচ্চগতির ফাইবার অপটিক ইন্টারনেট সংযোগ।',
    },
    {
      icon: Utensils,
      title: isEn ? 'Hygienic Dining & Meals' : 'স্বাস্থ্যসম্মত ডাইনিং ব্যবস্থা',
      desc: isEn ? 'Balanced 3-course nutritious meals prepared daily under strict hygiene protocols.' : 'অভিজ্ঞ বাবুর্চি দ্বারা পরিষ্কার পরিবেশে প্রস্তুত তিন বেলার সুষম খাদ্য।',
    },
    {
      icon: ShieldCheck,
      title: isEn ? '24/7 CCTV & Security' : 'সার্বক্ষণিক সিসিটিভি ও নিরাপত্তা',
      desc: isEn ? 'Guard-controlled biometric entrance and 24/7 video surveillance for total safety.' : 'সিসিটিভি ক্যামেরা ও নিরাপত্তা প্রহরী দ্বারা সার্বক্ষণিক ক্যাম্পাসের নিরাপত্তা পর্যবেক্ষণ।',
    },
    {
      icon: Droplets,
      title: isEn ? 'Purified Drinking Water' : 'বিশুদ্ধ খাবার পানি',
      desc: isEn ? 'Commercial multi-stage RO water purification systems installed on every floor.' : 'প্রতিটি ফ্লোরে আধুনিক আরও (RO) ফিল্টারের মাধ্যমে বিশুদ্ধ নিরাপদ খাবার পানি সরবরাহ।',
    },
    {
      icon: Clock,
      title: isEn ? 'Generator Power Backup' : 'লোডশেডিং মুক্ত জেনারেটর ব্যাকআপ',
      desc: isEn ? 'Heavy-duty automatic diesel generator ensuring non-stop lighting and fans.' : 'স্বয়ংক্রিয় হেভি-ডিউটি জেনারেটরের মাধ্যমে লোডশেডিংহীন বিদ্যুৎ ব্যবস্থা।',
    },
    {
      icon: BookOpen,
      title: isEn ? 'Quiet Study Lounge' : 'নীরব স্টাডি ও রিডিং রুম',
      desc: isEn ? 'Air-conditioned silent library environment dedicated for exams and research.' : 'পরীক্ষার প্রস্তুতি ও নিরিবিলি পড়ার জন্য শীতাতপ নিয়ন্ত্রিত আলাদা রিডিং স্পেস।',
    },
    {
      icon: Sparkles,
      title: isEn ? 'Daily Housekeeping' : 'দৈনিক পরিচ্ছন্নতা সার্ভিস',
      desc: isEn ? 'Professional cleaning staff maintaining sanitized bathrooms and common spaces.' : 'নিয়মিত ওয়াশরুম, করিডোর ও কমন স্পেস জীবাণুমুক্ত ও পরিষ্কার রাখার ব্যবস্থা।',
    },
    {
      icon: Tv,
      title: isEn ? 'Recreation & Common Hall' : 'বিনোদন ও ইনডোর গেমস',
      desc: isEn ? 'Table tennis, carrom, television, and newspaper zone for relaxation.' : 'টিভি, টেবিল টেনিস, ক্যারম এবং দৈনিক সংবাদপত্র পাঠের জন্য উন্মুক্ত কমন রুম।',
    },
  ];

  const mealSchedule = [
    {
      mealEn: 'Breakfast',
      mealBn: 'সকালের নাস্তা',
      time: '৭:৩০ — ৯:০০ AM',
      itemsEn: 'Paratha / Ruti, Egg / Dal, Mixed Vegetable, Tea',
      itemsBn: 'পরোটা / হাতে বানানো রুটি, ডিম / ডাল ভুনা, সবজি, চা',
    },
    {
      mealEn: 'Lunch',
      mealBn: 'দুপুরের খাবার',
      time: '১:০০ — ২:৩০ PM',
      itemsEn: 'Steamed Rice, Fresh Fish / Chicken / Beef, Lentils, Green Salad',
      itemsBn: 'ভাত, মাছ / মুরগি / গরুর মাংস, ঘন ডাল, সবুজ সালাদ',
    },
    {
      mealEn: 'Dinner',
      mealBn: 'রাতের খাবার',
      time: '৮:০০ — ৯:৩০ PM',
      itemsEn: 'Steamed Rice, Chicken Curry / Egg Curry, Seasonal Veggies, Dal',
      itemsBn: 'ভাত, চিকেন কারি / ডিম ভুনা, মৌসুমি সবজি, ডাল',
    },
  ];

  return (
    <div className="space-y-16 py-10 md:py-16">
      {/* Header */}
      <section className="container mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-4 max-w-3xl">
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-gray-900 tracking-tight">
          {t('facilities.title')}
        </h1>
        <p className="text-base sm:text-lg text-gray-600 leading-relaxed">
          {t('facilities.subtitle')}
        </p>
      </section>

      {/* Facilities Grid */}
      <section className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {facilities.map((fac, idx) => {
            const Icon = fac.icon;
            return (
              <div
                key={idx}
                className="bg-white rounded-2xl border border-gray-200 p-6 shadow-xs hover:border-emerald-300 hover:shadow-md transition-all space-y-3"
              >
                <div className="h-12 w-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <Icon className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-gray-900">{fac.title}</h3>
                <p className="text-xs text-gray-600 leading-relaxed">{fac.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Meal Schedule Section */}
      <section className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-5xl">
        <div className="bg-white rounded-2xl border border-emerald-100 p-8 sm:p-10 shadow-xs space-y-6">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center">
              <CalendarDays className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                {t('facilities.meal_schedule_title')}
              </h2>
              <p className="text-xs text-gray-500">
                {t('facilities.meal_schedule_desc')}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
            {mealSchedule.map((schedule, idx) => (
              <div
                key={idx}
                className="rounded-xl border border-gray-200 bg-slate-50/70 p-5 space-y-3"
              >
                <div className="flex items-center justify-between border-b border-gray-200 pb-2">
                  <h4 className="font-bold text-base text-gray-900">
                    {isEn ? schedule.mealEn : schedule.mealBn}
                  </h4>
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                    {schedule.time}
                  </span>
                </div>
                <p className="text-xs text-gray-600 leading-relaxed">
                  {isEn ? schedule.itemsEn : schedule.itemsBn}
                </p>
              </div>
            ))}
          </div>

          <div className="p-4 bg-emerald-50/80 rounded-xl border border-emerald-200 text-xs text-emerald-900 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>হোস্টেল মিল মেস সিস্টেমের মাধ্যমে পরিচালিত হয়। শিক্ষার্থীরা প্রয়োজন অনুযায়ী মিল অন/অফ করতে পারেন।</span>
          </div>
        </div>
      </section>
    </div>
  );
};
