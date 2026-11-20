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

const HOSTEL_RULES_DATA = {
  gateClosingTime: 'রাত ১০:০০ টা (শুক্রবার ও ছুটির দিনে রাত ১০:৩০ টা)',
  diningTimes: [
    { meal: 'সকালের নাশতা (Breakfast)', time: 'সকাল ০৭:৩০ টা — সকাল ০৯:৩০ টা' },
    { meal: 'দুপুরের খাবার (Lunch)', time: 'দুপুর ১২:৩০ টা — দুপুর ০২:৩০ টা' },
    { meal: 'সান্ধ্য চা ও নাশতা (Evening Snacks)', time: 'বিকেল ০৫:৩০ টা — সন্ধ্যা ০৬:৩০ টা' },
    { meal: 'রাতের খাবার (Dinner)', time: 'রাত ০৮:০০ টা — রাত ১০:০০ টা' },
  ],
  rulesList: [
    'রাত ১০:০০ টার পর হোস্টেলের প্রধান ফটক বন্ধ থাকবে। বিশেষ প্রয়োজনে ওয়ার্ডেনের পূর্বানুমতি ব্যতিরেকে বিলম্ব গ্রহণযোগ্য নয়।',
    'রুমের ভেতর কোনো প্রকার অতিরিক্ত উচ্চ ক্ষমতাসম্পন্ন হিটার, ইন্ডাকশন চুলা বা অবৈধ ইলেকট্রিক সরঞ্জাম ব্যবহার সম্পূর্ণ নিষিদ্ধ।',
    'রাত ১১:০০ টা থেকে সকাল ০৬:০০ টা পর্যন্ত স্টাডি ও সাইলেন্স আওয়ার হিসেবে গণ্য হবে; কোনো ধরনের উচ্চশব্দ বা হইচই করা যাবে না।',
    'হোস্টেল চত্বর সম্পূর্ণ ধূমপান ও মাদকমুক্ত এলাকা। যে কোনো অসদাচরণের জন্য সিট বরাদ্দ বাতিল ও বহিষ্কারের শাস্তিমূলক ব্যবস্থা গ্রহণ করা হবে।',
    'বহিরাগত বা অনাবাসিক অতিথিকে রুমে রাখা সম্পূর্ণ বেআইনি। অভিভাবকগণ কেবল কমন লাউঞ্জে সাক্ষাৎ করতে পারবেন।',
    'মাসিক সিট ভাড়া ও সার্ভিস চার্জ প্রতি মাসের ৭ তারিখের মধ্যে পরিশোধ করতে হবে।',
  ],
  emergencyContacts: [
    { title: 'হোস্টেল সুপারিনটেনডেন্ট', name: 'অধ্যাপক ড. মুহাম্মদ আলমগীর', phone: '০১৭১১-১০০০০১', email: 'superintendent@campus.edu.bd' },
    { title: 'সহকারী ওয়ার্ডেন (প্রশাসন ও শৃঙ্খলা)', name: 'জনাব কাজী মোসাদ্দেক হোসেন', phone: '০১৮১১-২০০০০২', email: 'warden.admin@campus.edu.bd' },
    { title: 'ক্যাম্পাস মেডিকেল সেন্টার (২৪/৭ জরুরি)', name: 'মেডিকেল অফিসার অন-ডিউটি', phone: '০১৭২২-৩০০০০৩', email: 'medical@campus.edu.bd' },
    { title: 'হোস্টেল প্রধান সিকিউরিটি পোস্ট', name: 'নিরাপত্তা নিয়ন্ত্রণ কক্ষ', phone: '০১৯৩৩-৪০০০০৪', email: 'security@campus.edu.bd' },
  ],
};

export const StudentRulesPage: React.FC = () => {
  const { t } = useTranslation();
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
            <span>হোস্টেল প্রধান ফটক বন্ধের সময়</span>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-white">
            {HOSTEL_RULES_DATA.gateClosingTime}
          </div>
          <p className="text-xs text-emerald-200 leading-relaxed">
            রাত ১০:০০ টার পর মূল ফটক সম্পূর্ণ বন্ধ থাকবে। যৌক্তিক জরুরি কারণ ব্যতিরেকে রাত ১০:০০ টার পরে প্রবেশের অনুমতি নেই।
          </p>
        </div>

        <div className="bg-amber-900/90 text-white rounded-2xl p-6 shadow-xs space-y-2 border border-amber-800">
          <div className="flex items-center gap-2 text-amber-300 text-xs font-bold uppercase tracking-wider">
            <ShieldAlert className="w-4 h-4" />
            <span>ক্যাম্পাস শৃঙ্খলা ও নিরাপত্তা বিধি</span>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-white">
            জিরো টলারেন্স নীতি
          </div>
          <p className="text-xs text-amber-200 leading-relaxed">
            মাদক, ধূমপান, র‍্যাগিং ও যেকোনো প্রকার বিশৃঙ্খলা কঠোরভাবে নিষিদ্ধ। আইন ভঙ্গ করলে তাৎক্ষণিক সিট বাতিল ও প্রাতিষ্ঠানিক বহিষ্কার হবে।
          </p>
        </div>
      </div>

      {/* Dining Timing Schedule */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
        <div className="flex items-center gap-2 border-b pb-3">
          <Utensils className="w-5 h-5 text-emerald-600" />
          <h3 className="font-bold text-base text-slate-900">ডাইনিং মিল সময়সূচি (Dining Schedule)</h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {HOSTEL_RULES_DATA.diningTimes.map((item, idx) => (
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
          * কোনো বেলার মিল বন্ধ রাখতে চাইলে আগের দিন রাত ১০:০০ টার মধ্যে ডাইনিং ম্যানেজারকে অবহিত করতে হবে।
        </p>
      </div>

      {/* Rules Code List */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
        <div className="flex items-center gap-2 border-b pb-3">
          <AlertTriangle className="w-5 h-5 text-emerald-600" />
          <h3 className="font-bold text-base text-slate-900">সাধারণ আচরণবিধি ও শৃঙ্খলা</h3>
        </div>

        <div className="space-y-3">
          {HOSTEL_RULES_DATA.rulesList.map((rule, idx) => (
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
          <h3 className="font-bold text-base text-slate-900">জরুরি যোগাযোগ ও হেল্পলাইন (Emergency Contacts)</h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {HOSTEL_RULES_DATA.emergencyContacts.map((contact, idx) => (
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
