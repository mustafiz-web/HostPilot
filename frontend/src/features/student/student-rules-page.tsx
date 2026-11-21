import React from 'react';
import { useTranslation } from 'react-i18next';
import {
  BookOpen,
  Clock,
  Utensils,
  ShieldAlert,
  PhoneCall,
  Mail,
  AlertTriangle,
  CheckCircle2,
} from 'lucide-react';

export const StudentRulesPage: React.FC = () => {
  const { t, i18n } = useTranslation();
  const isEn = i18n.language?.startsWith('en');

  const diningTimes = [
    {
      meal: t('student.rules.meal_breakfast', 'Breakfast'),
      time: isEn ? '07:30 AM — 09:30 AM' : 'সকাল ০৭:৩০ টা — সকাল ০৯:৩০ টা',
    },
    {
      meal: t('student.rules.meal_lunch', 'Lunch'),
      time: isEn ? '12:30 PM — 02:30 PM' : 'দুপুর ১২:৩০ টা — দুপুর ০২:৩০ টা',
    },
    {
      meal: t('student.rules.meal_snacks', 'Evening Snacks'),
      time: isEn ? '05:30 PM — 06:30 PM' : 'বিকেল ০৫:৩০ টা — সন্ধ্যা ০৬:৩০ টা',
    },
    {
      meal: t('student.rules.meal_dinner', 'Dinner'),
      time: isEn ? '08:00 PM — 10:00 PM' : 'রাত ০৮:০০ টা — রাত ১০:০০ টা',
    },
  ];

  const rulesList = [
    t('student.rules.rule_1', 'Hostel gate closes at 10:00 PM. Prior warden approval is required for emergency delays.'),
    t('student.rules.rule_2', 'High-power electric heaters, induction stoves, and unauthorized devices are strictly prohibited.'),
    t('student.rules.rule_3', 'Study and quiet hours are observed from 11:00 PM to 6:00 AM. Noise must be minimized.'),
    t('student.rules.rule_4', 'Hostel premises are strictly smoke-free and drug-free. Violations lead to immediate seat cancellation.'),
    t('student.rules.rule_5', 'Unregistered guests cannot stay overnight. Guardians may meet residents in the common lounge.'),
    isEn
      ? 'Monthly seat rent and utility charges must be cleared by the 7th of every month.'
      : 'মাসিক সিট ভাড়া ও সার্ভিস চার্জ প্রতি মাসের ৭ তারিখের মধ্যে পরিশোধ করতে হবে।',
  ];

  const emergencyContacts = [
    {
      title: isEn ? 'Hostel Superintendent' : 'হোস্টেল সুপারিনটেনডেন্ট',
      name: isEn ? 'Prof. Dr. Muhammad Alamgir' : 'অধ্যাপক ড. মুহাম্মদ আলমগীর',
      phone: '01711-100001',
      email: 'superintendent@campus.edu.bd',
    },
    {
      title: isEn ? 'Assistant Warden (Discipline)' : 'সহকারী ওয়ার্ডেন (প্রশাসন ও শৃঙ্খলা)',
      name: isEn ? 'Kazi Mosaddeq Hossain' : 'জনাব কাজী মোসাদ্দেক হোসেন',
      phone: '01811-200002',
      email: 'warden.admin@campus.edu.bd',
    },
    {
      title: isEn ? 'Medical Center (24/7 Emergency)' : 'ক্যাম্পাস মেডিকেল সেন্টার (২৪/৭ জরুরি)',
      name: isEn ? 'Medical Officer on Duty' : 'মেডিকেল অফিসার অন-ডিউটি',
      phone: '01722-300003',
      email: 'medical@campus.edu.bd',
    },
    {
      title: isEn ? 'Hostel Security Desk' : 'হোস্টেল প্রধান সিকিউরিটি পোস্ট',
      name: isEn ? 'Security Control Room' : 'নিরাপত্তা নিয়ন্ত্রণ কক্ষ',
      phone: '01933-400004',
      email: 'security@campus.edu.bd',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-emerald-600" />
            <span>{t('student.rules.title')}</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-500">
            {t('student.rules.subtitle')}
          </p>
        </div>
      </div>

      {/* Top Banner: Gate Timing & Safety Alert */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-emerald-900 text-white rounded-2xl p-6 shadow-xs space-y-2 border border-emerald-800">
          <div className="flex items-center gap-2 text-emerald-300 text-xs font-bold uppercase tracking-wider">
            <Clock className="w-4 h-4" />
            <span>{t('student.rules.gate_timing_title')}</span>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-white">
            {isEn ? '10:00 PM (Fridays 10:30 PM)' : 'রাত ১০:০০ টা (শুক্রবার ও ছুটির দিনে রাত ১০:৩০ টা)'}
          </div>
          <p className="text-xs text-emerald-200 leading-relaxed">
            {t('student.rules.gate_rule')}
          </p>
        </div>

        <div className="bg-amber-900/90 text-white rounded-2xl p-6 shadow-xs space-y-2 border border-amber-800">
          <div className="flex items-center gap-2 text-amber-300 text-xs font-bold uppercase tracking-wider">
            <ShieldAlert className="w-4 h-4" />
            <span>{isEn ? 'Campus Discipline & Code of Conduct' : 'ক্যাম্পাস শৃঙ্খলা ও নিরাপত্তা বিধি'}</span>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-white">
            {isEn ? 'Zero Tolerance Policy' : 'জিরো টলারেন্স নীতি'}
          </div>
          <p className="text-xs text-amber-200 leading-relaxed">
            {isEn
              ? 'Drugs, smoking, ragging, and disruptive activities are strictly prohibited. Violations result in immediate seat cancellation.'
              : 'মাদক, ধূমপান, র‍্যাগিং ও যেকোনো প্রকার বিশৃঙ্খলা কঠোরভাবে নিষিদ্ধ। আইন ভঙ্গ করলে তাৎক্ষণিক সিট বাতিল ও প্রাতিষ্ঠানিক বহিষ্কার হবে।'}
          </p>
        </div>
      </div>

      {/* Dining Timing Schedule */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
        <div className="flex items-center gap-2 border-b pb-3">
          <Utensils className="w-5 h-5 text-emerald-600" />
          <h3 className="font-bold text-base text-slate-900">{t('student.rules.meal_schedule')}</h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {diningTimes.map((item, idx) => (
            <div
              key={idx}
              className="p-4 bg-slate-50 rounded-xl border border-slate-200/80 space-y-1.5"
            >
              <span className="text-xs font-bold text-emerald-700 block">{item.meal}</span>
              <p className="text-xs font-mono font-semibold text-slate-800">{item.time}</p>
            </div>
          ))}
        </div>
        <p className="text-[11px] text-slate-400">
          {isEn
            ? '* To pause or cancel a meal, notify the dining manager by 10:00 PM the previous evening.'
            : '* কোনো বেলার মিল বন্ধ রাখতে চাইলে আগের দিন রাত ১০:০০ টার মধ্যে ডাইনিং ম্যানেজারকে অবহিত করতে হবে।'}
        </p>
      </div>

      {/* Rules Code List */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
        <div className="flex items-center gap-2 border-b pb-3">
          <AlertTriangle className="w-5 h-5 text-emerald-600" />
          <h3 className="font-bold text-base text-slate-900">{t('student.rules.general_rules_title')}</h3>
        </div>

        <div className="space-y-3">
          {rulesList.map((rule, idx) => (
            <div
              key={idx}
              className="flex items-start gap-3 p-3.5 rounded-xl border border-slate-100 bg-slate-50/50 text-xs sm:text-sm text-slate-700"
            >
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span className="leading-relaxed">{rule}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Emergency Helpline Contacts */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
        <div className="flex items-center gap-2 border-b pb-3">
          <PhoneCall className="w-5 h-5 text-emerald-600" />
          <h3 className="font-bold text-base text-slate-900">
            {isEn ? 'Emergency Helpline & Contacts' : 'জরুরি যোগাযোগ ও হেল্পলাইন'}
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {emergencyContacts.map((contact, idx) => (
            <div
              key={idx}
              className="p-4 rounded-xl border border-slate-200 bg-white hover:border-emerald-300 transition-all space-y-2"
            >
              <div>
                <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider block">
                  {contact.title}
                </span>
                <h4 className="font-bold text-sm text-slate-900">{contact.name}</h4>
              </div>

              <div className="pt-2 border-t border-slate-100 space-y-1 text-xs">
                <div className="flex items-center gap-2 text-slate-600">
                  <PhoneCall className="w-3.5 h-3.5 text-slate-400" />
                  <span className="font-mono font-bold text-slate-800">{contact.phone}</span>
                </div>
                <div className="flex items-center gap-2 text-slate-600">
                  <Mail className="w-3.5 h-3.5 text-slate-400" />
                  <span className="font-mono text-slate-500">{contact.email}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
