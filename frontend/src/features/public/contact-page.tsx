import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Mail, Phone, MapPin, Clock, Send, ShieldAlert, CheckCircle2, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

export const ContactPage: React.FC = () => {
  const { t, i18n } = useTranslation();
  const isEn = i18n.language?.startsWith('en');
  const [sent, setSent] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSent(true);
  };

  return (
    <div className="space-y-12 py-10 md:py-16">
      {/* Header */}
      <section className="container mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-4 max-w-3xl">
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-gray-900 tracking-tight">
          {t('contact.title')}
        </h1>
        <p className="text-base sm:text-lg text-gray-600 leading-relaxed">
          {t('contact.subtitle')}
        </p>
      </section>

      <section className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-5xl grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Contact Info & Helplines */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-gray-200 p-6 sm:p-8 space-y-5 shadow-xs">
            <h2 className="text-xl font-bold text-gray-900 border-b pb-3">
              {isEn ? 'Office & Hostel Campus' : 'অফিস ও হোস্টেল ক্যাম্পাস'}
            </h2>
            <div className="space-y-4 text-sm text-gray-700">
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold text-gray-900 block">
                    {isEn ? 'Campus Location:' : 'ক্যাম্পাস অবস্থান:'}
                  </span>
                  <span>{isEn ? 'Hostel Campus, College Road, Dhaka-1205, Bangladesh' : 'হোস্টেল ক্যাম্পাস, কলেজ রোড, ঢাকা-১২০৫, বাংলাদেশ'}</span>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Phone className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold text-gray-900 block">
                    {isEn ? 'Official Helpline:' : 'অফিসিয়াল ফোন নম্বর:'}
                  </span>
                  <span>{isEn ? '+880 17XXXXXXXX, +880 18XXXXXXXX' : '+৮৮০ ১৭XXXXXXXX, +৮৮০ ১৮XXXXXXXX'}</span>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Mail className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold text-gray-900 block">
                    {isEn ? 'Email Support:' : 'ইমেইল যোগাযোগ:'}
                  </span>
                  <span>info@hostpilot.com, support@hostpilot.com</span>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Clock className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold text-gray-900 block">
                    {isEn ? 'Visiting & Office Hours:' : 'অফিস ও ভিজিটিং সময়:'}
                  </span>
                  <span>{isEn ? '9:00 AM — 8:00 PM (Daily)' : 'সকাল ৯:০০ — রাত ৮:০০ (প্রতিদিন)'}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Emergency Alert Box */}
          <div className="bg-emerald-50 rounded-2xl border border-emerald-200 p-6 space-y-3 shadow-xs">
            <div className="flex items-center gap-2.5 text-emerald-900 font-bold text-base">
              <ShieldAlert className="w-5 h-5 text-emerald-600" />
              <span>{t('contact.emergency_title')}</span>
            </div>
            <p className="text-xs text-emerald-800 leading-relaxed">
              {t('contact.emergency_desc')}
            </p>
            <div className="p-3 bg-white/80 rounded-lg border border-emerald-200 flex justify-between items-center text-xs">
              <span className="font-medium text-emerald-900">{isEn ? 'Duty Warden Hotline:' : 'ডিউটি ওয়ার্ডেন হটলাইন:'}</span>
              <span className="font-bold text-emerald-700 text-sm">{isEn ? '019XXXXXXXX' : '০১৯XXXXXXXX'}</span>
            </div>
          </div>
        </div>

        {/* Contact Form */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6 sm:p-8 shadow-xs">
          <div className="border-b pb-3 mb-6">
            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-emerald-600" />
              <span>{t('contact.form_title')}</span>
            </h2>
          </div>

          {sent ? (
            <div className="p-6 text-center space-y-4 bg-emerald-50 rounded-xl border border-emerald-200">
              <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto" />
              <h3 className="text-lg font-bold text-emerald-950">
                {isEn ? 'Message Sent Successfully!' : 'বার্তা সফলভাবে পাঠানো হয়েছে!'}
              </h3>
              <p className="text-xs text-emerald-800">
                {isEn
                  ? 'Your inquiry has been received. Our officer will respond to your provided email promptly.'
                  : 'আপনার বার্তাটি গ্রহণ করা হয়েছে। দায়িত্বপ্রাপ্ত কর্মকর্তা দ্রুত আপনার প্রদত্ত ইমেইলে যোগাযোগ করবেন।'}
              </p>
              <Button onClick={() => setSent(false)} variant="outline" size="sm">
                {isEn ? 'Send Another Message' : 'আরেকটি বার্তা পাঠান'}
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="c-name">{t('contact.name')} *</Label>
                <Input
                  id="c-name"
                  required
                  placeholder={isEn ? 'Enter your full name' : 'আপনার পূর্ণ নাম লিখুন'}
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="c-email">{t('contact.email')} *</Label>
                <Input
                  id="c-email"
                  type="email"
                  required
                  placeholder="example@mail.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="c-subject">{t('contact.subject')} *</Label>
                <Input
                  id="c-subject"
                  required
                  placeholder={isEn ? 'e.g. Query regarding seat booking' : 'যেমন: সিট বুকিং সংক্রান্ত প্রশ্ন'}
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="c-msg">{t('contact.message')} *</Label>
                <Textarea
                  id="c-msg"
                  required
                  rows={4}
                  placeholder={isEn ? 'Write your message or inquiry in detail...' : 'আপনার প্রশ্ন বা মতামত বিস্তারিত লিখুন...'}
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                />
              </div>

              <Button type="submit" className="w-full gap-2 font-semibold shadow-xs">
                <Send className="w-4 h-4" />
                <span>{t('contact.send_btn')}</span>
              </Button>
            </form>
          )}
        </div>
      </section>
    </div>
  );
};
