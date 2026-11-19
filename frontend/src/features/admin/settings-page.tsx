import React, { useState } from 'react';
import { Settings, Save, CheckCircle2, Shield, Clock, Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';

export const SettingsPage: React.FC = () => {
  const [saved, setSaved] = useState(false);
  const [settings, setSettings] = useState({
    hostelName: 'Host Pilot Hostel',
    address: 'হোস্টেল ক্যাম্পাস, কলেজ রোড, ঢাকা-১২০৫, বাংলাদেশ',
    contactPhone: '+৮৮০ ১৭XXXXXXXX',
    contactEmail: 'admin@hostpilot.com',
    currency: 'BDT (৳)',
    timezone: 'Asia/Dhaka (GMT+6)',
    gateCloseTime: '09:30 PM',
  });

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
          <Settings className="w-6 h-6 text-emerald-600" />
          <span>হোস্টেল সেটিংস ও কনফিগারেশন (Hostel Settings)</span>
        </h2>
        <p className="text-xs sm:text-sm text-slate-500">
          হোস্টেলের প্রাতিষ্ঠানিক তথ্য, মুদ্রা, সময় অঞ্চল ও নিয়মাবলী পরিচালনা
        </p>
      </div>

      {saved && (
        <Alert variant="success" className="bg-emerald-50 border-emerald-200">
          <CheckCircle2 className="h-4 w-4 text-emerald-600" />
          <AlertTitle className="text-emerald-950 font-bold">সেটিংস সংরক্ষিত হয়েছে!</AlertTitle>
          <AlertDescription className="text-emerald-800">
            হোস্টেলের প্রাতিষ্ঠানিক কনফিগারেশন সফলভাবে আপডেট করা হয়েছে।
          </AlertDescription>
        </Alert>
      )}

      <form onSubmit={handleSave} className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
        <div className="border-b pb-3">
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Shield className="w-4 h-4 text-emerald-600" />
            <span>প্রাতিষ্ঠানিক পরিচয় ও যোগাযোগ</span>
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="set-name">হোস্টেলের নাম</Label>
            <Input
              id="set-name"
              required
              value={settings.hostelName}
              onChange={(e) => setSettings({ ...settings, hostelName: e.target.value })}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="set-email">অফিসিয়াল ইমেইল</Label>
            <Input
              id="set-email"
              type="email"
              required
              value={settings.contactEmail}
              onChange={(e) => setSettings({ ...settings, contactEmail: e.target.value })}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="set-phone">যোগাযোগ ফোন নম্বর</Label>
            <Input
              id="set-phone"
              required
              value={settings.contactPhone}
              onChange={(e) => setSettings({ ...settings, contactPhone: e.target.value })}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="set-gate">ফটক বন্ধের সময় (Gate Close Time)</Label>
            <div className="relative">
              <Clock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <Input
                id="set-gate"
                className="pl-9"
                value={settings.gateCloseTime}
                onChange={(e) => setSettings({ ...settings, gateCloseTime: e.target.value })}
              />
            </div>
          </div>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="set-addr">ক্যাম্পাস পূর্ণ ঠিকানা</Label>
          <Input
            id="set-addr"
            required
            value={settings.address}
            onChange={(e) => setSettings({ ...settings, address: e.target.value })}
          />
        </div>

        <div className="border-b pt-4 pb-3">
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Globe className="w-4 h-4 text-emerald-600" />
            <span>সিস্টেম মুদ্রা ও সময় অঞ্চল (Fixed Standards)</span>
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label>সিস্টেম মুদ্রা (Currency)</Label>
            <Input disabled value={settings.currency} className="bg-slate-50 font-mono" />
            <span className="text-[11px] text-slate-400">অনুমোদিত স্ট্যান্ডার্ড অনুযায়ী নির্ধারিত</span>
          </div>
          <div className="space-y-1.5">
            <Label>সময় অঞ্চল (Timezone)</Label>
            <Input disabled value={settings.timezone} className="bg-slate-50 font-mono" />
            <span className="text-[11px] text-slate-400">অনুমোদিত ঢাকা টাইমজোন অনুযায়ী নির্ধারিত</span>
          </div>
        </div>

        <div className="pt-4 border-t border-slate-100 flex justify-end">
          <Button type="submit" className="gap-2 font-semibold shadow-xs">
            <Save className="w-4 h-4" />
            <span>সেটিংস পরিবর্তন সংরক্ষণ করুন</span>
          </Button>
        </div>
      </form>
    </div>
  );
};
