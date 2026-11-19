import React from 'react';
import { useTranslation } from 'react-i18next';
import { ShieldCheck, Heart, BookOpen, Clock, Phone, Mail, Award, CheckCircle2 } from 'lucide-react';
import { MOCK_TEAM } from './mock-data/public-mock-data';

export const AboutPage: React.FC = () => {
  const { t, i18n } = useTranslation();
  const isEn = i18n.language?.startsWith('en');

  const values = [
    {
      icon: ShieldCheck,
      title: isEn ? 'Safety & Security' : 'নিরাপত্তা ও শৃঙ্খলা',
      desc: isEn ? 'Round-the-clock surveillance, secure gate access, and dedicated warden presence.' : 'সার্বক্ষণিক সিসিটিভি নজরদারি, ডিজিটাল গেট রেজিস্ট্রি ও নিবেদিত ওয়ার্ডেন উপস্থিতি।',
    },
    {
      icon: BookOpen,
      title: isEn ? 'Academic Focus' : 'পড়াশোনার আদর্শ পরিবেশ',
      desc: isEn ? 'Mandatory quiet hours and dedicated study spaces to support academic excellence.' : 'রাত ১০টার পর নীরব সময় এবং নিরিবিলি স্টাডি জোনের মাধ্যমে পড়াশোনার অনুকূল পরিবেশ।',
    },
    {
      icon: Heart,
      title: isEn ? 'Health & Hygiene' : 'স্বাস্থ্য ও পরিচ্ছন্নতা',
      desc: isEn ? 'Nutritious balanced meal plans and daily housekeeping across all residential blocks.' : 'পুষ্টিকর খাদ্য তালিকা এবং প্রতিটি ফ্লোরে দৈনিক নিয়মিত পরিচ্ছন্নতা কার্যক্রম।',
    },
    {
      icon: Award,
      title: isEn ? 'Fairness & Transparency' : 'স্বচ্ছতা ও ন্যায়পরায়ণতা',
      desc: isEn ? 'Clear seat allocation records, zero hidden charges, and open complaint tracking.' : 'কোনো গোপন চার্জ নেই, সিট বণ্টনে স্বচ্ছতা এবং শিক্ষার্থীদের অভিযোগের দ্রুত সমাধান।',
    },
  ];

  const rules = [
    t('about.rule_1'),
    t('about.rule_2'),
    t('about.rule_3'),
    t('about.rule_4'),
  ];

  return (
    <div className="space-y-16 py-10 md:py-16">
      {/* Page Header */}
      <section className="container mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-4 max-w-3xl">
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-gray-900 tracking-tight">
          {t('about.title')}
        </h1>
        <p className="text-base sm:text-lg text-gray-600 leading-relaxed">
          {t('about.subtitle')}
        </p>
      </section>

      {/* Vision & Mission */}
      <section className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-5xl">
        <div className="rounded-2xl bg-white border border-emerald-100 p-8 sm:p-12 shadow-xs space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-semibold">
            <Award className="w-4 h-4 text-emerald-600" />
            <span>{isEn ? 'Our Commitment' : 'আমাদের অঙ্গীকার'}</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">
            {t('about.vision_title')}
          </h2>
          <p className="text-base sm:text-lg text-gray-700 leading-relaxed">
            {t('about.vision_desc')}
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 pt-6 border-t border-gray-100">
            {values.map((v, i) => {
              const Icon = v.icon;
              return (
                <div key={i} className="space-y-2">
                  <div className="h-10 w-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                    <Icon className="w-5 h-5" />
                  </div>
                  <h3 className="font-bold text-gray-900 text-base">{v.title}</h3>
                  <p className="text-xs text-gray-600 leading-relaxed">{v.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Administration Team */}
      <section className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-5xl space-y-8">
        <div className="text-center space-y-2">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">
            {t('about.team_title')}
          </h2>
          <p className="text-sm text-gray-600 max-w-xl mx-auto">
            {t('about.team_desc')}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {MOCK_TEAM.map((member, idx) => (
            <div
              key={idx}
              className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-xs hover:border-emerald-300 transition-all flex flex-col justify-between"
            >
              <div className="aspect-4/3 w-full overflow-hidden bg-slate-100">
                <img
                  src={member.imageUrl}
                  alt={isEn ? member.nameEn : member.nameBn}
                  className="w-full h-full object-cover object-center"
                />
              </div>
              <div className="p-5 space-y-3">
                <div>
                  <h3 className="text-lg font-bold text-gray-900">
                    {isEn ? member.nameEn : member.nameBn}
                  </h3>
                  <span className="text-xs font-semibold text-emerald-700 block">
                    {isEn ? member.roleEn : member.roleBn}
                  </span>
                </div>
                <div className="pt-2 border-t border-gray-100 space-y-1.5 text-xs text-gray-600">
                  <div className="flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 text-emerald-600" />
                    <span>{member.phone}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail className="w-3.5 h-3.5 text-emerald-600" />
                    <span>{member.email}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Code of Conduct & Rules */}
      <section className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-5xl">
        <div className="rounded-2xl bg-slate-900 text-white p-8 sm:p-10 space-y-6">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-2xl font-bold tracking-tight text-white">
                {t('about.rules_title')}
              </h2>
              <p className="text-xs text-slate-400">
                হোস্টেলের শৃঙ্খলা ও নিরাপত্তা বজায় রাখতে আবাসিক শিক্ষার্থীদের জন্য পালনীয়
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            {rules.map((rule, idx) => (
              <div key={idx} className="flex items-start gap-3 bg-slate-800/80 p-4 rounded-xl border border-slate-700/60">
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                <span className="text-sm text-slate-200 leading-relaxed">{rule}</span>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};
