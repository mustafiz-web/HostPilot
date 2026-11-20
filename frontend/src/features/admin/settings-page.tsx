import React, { useState } from 'react';
import {
  Settings,
  Save,
  CheckCircle2,
  Shield,
  Clock,
  Globe,
  KeyRound,
  Eye,
  EyeOff,
  Lock,
  Loader2,
  AlertCircle,
  Building2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { apiClient } from '@/lib/api-client';

const SETTINGS_KEY = 'hostpilot_admin_settings';

export const SettingsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'GENERAL' | 'SECURITY'>('GENERAL');
  const [saved, setSaved] = useState(false);

  // General Settings state with persistence
  const [settings, setSettings] = useState(() => {
    const cached = localStorage.getItem(SETTINGS_KEY);
    if (cached) {
      try {
        return JSON.parse(cached);
      } catch {
        // fallback
      }
    }
    return {
      hostelName: 'Host Pilot Model Hostel',
      address: 'হোস্টেল ক্যাম্পাস, কলেজ রোড, ঢাকা-১২০৫, বাংলাদেশ',
      contactPhone: '+৮৮০ ১৭XXXXXXXX',
      contactEmail: 'admin@hostpilot.com',
      currency: 'BDT (৳)',
      timezone: 'Asia/Dhaka (GMT+6)',
      gateCloseTime: '09:30 PM',
      visitorEndTime: '07:00 PM',
    };
  });

  // Password change state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isChangingPass, setIsChangingPass] = useState(false);
  const [passFeedback, setPassFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
    setSaved(true);
    setTimeout(() => setSaved(false), 3500);
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 8) {
      setPassFeedback({
        type: 'error',
        message: 'নতুন পাসওয়ার্ড কমপক্ষে ৮ অক্ষরের হতে হবে।',
      });
      return;
    }
    if (newPassword !== confirmPassword) {
      setPassFeedback({
        type: 'error',
        message: 'নতুন পাসওয়ার্ড এবং কনফার্ম পাসওয়ার্ড মিলছে না।',
      });
      return;
    }

    try {
      setIsChangingPass(true);
      setPassFeedback(null);
      await apiClient.patch('/auth/change-password', {
        currentPassword,
        newPassword,
      });

      setPassFeedback({
        type: 'success',
        message: 'অ্যাডমিন পাসওয়ার্ড সফলভাবে ডাটাবেজে আপডেট করা হয়েছে!',
      });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        'পাসওয়ার্ড পরিবর্তন ব্যর্থ হয়েছে। বর্তমান পাসওয়ার্ড সঠিক কিনা পরীক্ষা করুন।';
      setPassFeedback({
        type: 'error',
        message: msg,
      });
    } finally {
      setIsChangingPass(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
            <Settings className="w-6 h-6 text-emerald-600" />
            <span>হোস্টেল সেটিংস ও কনফিগারেশন (Settings)</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-500">
            হোস্টেলের প্রাতিষ্ঠানিক তথ্য, যোগাযোগ, নিরাপত্তা এবং অ্যাক্সেস পরিচালনা
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-slate-200 pb-2">
        <Button
          size="sm"
          variant={activeTab === 'GENERAL' ? 'default' : 'outline'}
          onClick={() => setActiveTab('GENERAL')}
          className="gap-1.5"
        >
          <Building2 className="w-4 h-4" />
          <span>সাধারণ কনফিগারেশন</span>
        </Button>
        <Button
          size="sm"
          variant={activeTab === 'SECURITY' ? 'default' : 'outline'}
          onClick={() => setActiveTab('SECURITY')}
          className="gap-1.5"
        >
          <KeyRound className="w-4 h-4" />
          <span>নিরাপত্তা ও পাসওয়ার্ড</span>
        </Button>
      </div>

      {/* Tab: GENERAL */}
      {activeTab === 'GENERAL' && (
        <div className="space-y-6">
          {saved && (
            <Alert variant="success" className="bg-emerald-50 border-emerald-200">
              <CheckCircle2 className="h-4 w-4 text-emerald-600" />
              <AlertTitle className="text-emerald-950 font-bold">সেটিংস সংরক্ষিত হয়েছে!</AlertTitle>
              <AlertDescription className="text-emerald-800">
                হোস্টেলের প্রাতিষ্ঠানিক কনফিগারেশন সফলভাবে ব্রাউজারে সংরক্ষিত হয়েছে।
              </AlertDescription>
            </Alert>
          )}

          <form
            onSubmit={handleSaveSettings}
            className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6"
          >
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
              <Button type="submit" className="w-full sm:w-auto gap-2 font-semibold shadow-xs bg-emerald-600 hover:bg-emerald-700">
                <Save className="w-4 h-4" />
                <span>সেটিংস সংরক্ষণ করুন</span>
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* Tab: SECURITY */}
      {activeTab === 'SECURITY' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
          <div className="border-b pb-3">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <KeyRound className="w-5 h-5 text-emerald-600" />
              <span>অ্যাডমিন পাসওয়ার্ড পরিবর্তন (Change Password)</span>
            </h3>
            <p className="text-xs text-slate-500">
              আপনার অ্যাডমিনিস্ট্রেটর অ্যাকাউন্টের নিরাপত্তা নিশ্চিত করতে শক্তিশালী পাসওয়ার্ড ব্যবহার করুন
            </p>
          </div>

          {passFeedback && (
            <div
              className={`p-4 rounded-xl border flex items-start gap-3 text-xs leading-relaxed ${
                passFeedback.type === 'success'
                  ? 'bg-emerald-50 text-emerald-900 border-emerald-200'
                  : 'bg-rose-50 text-rose-900 border-rose-200'
              }`}
            >
              {passFeedback.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              )}
              <span className="font-medium">{passFeedback.message}</span>
            </div>
          )}

          <form onSubmit={handlePasswordChange} className="space-y-4 max-w-lg">
            <div className="space-y-1.5">
              <Label htmlFor="adminCurrentPass" className="text-xs font-semibold">
                বর্তমান পাসওয়ার্ড
              </Label>
              <div className="relative">
                <Input
                  id="adminCurrentPass"
                  type={showCurrent ? 'text' : 'password'}
                  placeholder="বর্তমান অ্যাকাউন্টের পাসওয়ার্ড"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  required
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowCurrent(!showCurrent)}
                  className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
                >
                  {showCurrent ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="adminNewPass" className="text-xs font-semibold">
                নতুন পাসওয়ার্ড (New Password)
              </Label>
              <div className="relative">
                <Input
                  id="adminNewPass"
                  type={showNew ? 'text' : 'password'}
                  placeholder="কমপক্ষে ৮ অক্ষরের শক্তিশালী পাসওয়ার্ড"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowNew(!showNew)}
                  className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
                >
                  {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="adminConfirmPass" className="text-xs font-semibold">
                নতুন পাসওয়ার্ড নিশ্চিত করুন (Confirm Password)
              </Label>
              <div className="relative">
                <Input
                  id="adminConfirmPass"
                  type={showConfirm ? 'text' : 'password'}
                  placeholder="নতুন পাসওয়ার্ডটি নিশ্চিত করতে পুনরায় লিখুন"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
                >
                  {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              disabled={isChangingPass}
              className="w-full sm:w-auto gap-2 bg-emerald-600 hover:bg-emerald-700"
            >
              {isChangingPass ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Lock className="w-4 h-4" />
              )}
              <span>{isChangingPass ? 'আপডেট হচ্ছে...' : 'পাসওয়ার্ড পরিবর্তন করুন'}</span>
            </Button>
          </form>
        </div>
      )}
    </div>
  );
};
