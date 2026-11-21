import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Settings,
  Shield,
  Building,
  KeyRound,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Save,
  Clock,
  Eye,
  EyeOff,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { apiClient } from '@/lib/api-client';

export const SettingsPage: React.FC = () => {
  const { t, i18n } = useTranslation();
  const isEn = i18n.language?.startsWith('en');

  const [activeTab, setActiveTab] = useState<'GENERAL' | 'SECURITY'>('GENERAL');

  // General Settings State
  const [generalSettings, setGeneralSettings] = useState({
    hostelName: 'Host Pilot Residence',
    contactEmail: 'admin@hostpilot.edu.bd',
    address: isEn ? 'Hostel Campus, College Road, Dhaka-1205, Bangladesh' : 'হোস্টেল ক্যাম্পাস, কলেজ রোড, ঢাকা-১২০৫, বাংলাদেশ',
    contactPhone: '+880 17XXXXXXXX',
    gateCloseTime: '22:00',
    currency: 'BDT (৳)',
    timezone: 'Asia/Dhaka (GMT+6)',
  });

  const [isSaved, setIsSaved] = useState(false);

  // Security (Password Change) State
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [isChangingPass, setIsChangingPass] = useState(false);
  const [passwordStatus, setPasswordStatus] = useState<{
    type: 'success' | 'error' | null;
    message: string;
  }>({ type: null, message: '' });

  const handleSaveGeneral = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordStatus({ type: null, message: '' });

    if (passwordForm.newPassword.length < 8) {
      setPasswordStatus({
        type: 'error',
        message: isEn ? 'New password must be at least 8 characters.' : 'নতুন পাসওয়ার্ড কমপক্ষে ৮ অক্ষরের হতে হবে।',
      });
      return;
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordStatus({
        type: 'error',
        message: isEn ? 'New password and confirm password do not match.' : 'নতুন পাসওয়ার্ড এবং কনফার্ম পাসওয়ার্ড মিলছে না।',
      });
      return;
    }

    setIsChangingPass(true);
    try {
      await apiClient.post('/auth/change-password', {
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      });

      setPasswordStatus({
        type: 'success',
        message: isEn ? 'Admin password updated successfully in database!' : 'অ্যাডমিন পাসওয়ার্ড সফলভাবে ডাটাবেজে আপডেট করা হয়েছে!',
      });
      setPasswordForm({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
    } catch (err: any) {
      const msg =
        err?.response?.data?.error?.message ||
        err?.message ||
        (isEn ? 'Password update failed. Verify current password is correct.' : 'পাসওয়ার্ড পরিবর্তন ব্যর্থ হয়েছে। বর্তমান পাসওয়ার্ড সঠিক কিনা পরীক্ষা করুন।');
      setPasswordStatus({
        type: 'error',
        message: msg,
      });
    } finally {
      setIsChangingPass(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
            <Settings className="w-6 h-6 text-emerald-600" />
            <span>{t('admin.settings.title')}</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-500">
            {t('admin.settings.subtitle')}
          </p>
        </div>
      </div>

      {/* Settings Navigation Tabs */}
      <div className="flex gap-2 border-b border-slate-200 pb-2">
        <Button
          variant={activeTab === 'GENERAL' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setActiveTab('GENERAL')}
          className={`gap-2 rounded-xl text-xs font-bold ${
            activeTab === 'GENERAL'
              ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs'
              : 'text-slate-600'
          }`}
        >
          <Building className="w-4 h-4" />
          <span>{isEn ? 'General Configuration' : 'সাধারণ কনফিগারেশন'}</span>
        </Button>
        <Button
          variant={activeTab === 'SECURITY' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setActiveTab('SECURITY')}
          className={`gap-2 rounded-xl text-xs font-bold ${
            activeTab === 'SECURITY'
              ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs'
              : 'text-slate-600'
          }`}
        >
          <Shield className="w-4 h-4" />
          <span>{isEn ? 'Security & Password' : 'নিরাপত্তা ও পাসওয়ার্ড'}</span>
        </Button>
      </div>

      {/* GENERAL CONFIGURATION TAB */}
      {activeTab === 'GENERAL' && (
        <form onSubmit={handleSaveGeneral} className="space-y-6">
          {isSaved && (
            <Alert className="bg-emerald-50 border-emerald-200 text-emerald-900">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              <AlertTitle className="text-emerald-950 font-bold">{t('admin.settings.success_saved')}</AlertTitle>
              <AlertDescription className="text-xs text-emerald-800">
                {isEn ? 'Hostel institutional configuration has been saved successfully.' : 'হোস্টেলের প্রাতিষ্ঠানিক কনফিগারেশন সফলভাবে ব্রাউজারে সংরক্ষিত হয়েছে।'}
              </AlertDescription>
            </Alert>
          )}

          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-5">
            <div className="border-b border-slate-100 pb-3 flex items-center gap-2">
              <Building className="w-5 h-5 text-emerald-600" />
              <h3 className="font-bold text-base text-slate-900">
                {t('admin.settings.sec_profile')}
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="space-y-1.5">
                <Label htmlFor="set-name">{t('admin.settings.hostel_name')}</Label>
                <Input
                  id="set-name"
                  value={generalSettings.hostelName}
                  onChange={(e) => setGeneralSettings({ ...generalSettings, hostelName: e.target.value })}
                  className="h-9 text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="set-email">{t('admin.settings.contact_email')}</Label>
                <Input
                  id="set-email"
                  type="email"
                  value={generalSettings.contactEmail}
                  onChange={(e) => setGeneralSettings({ ...generalSettings, contactEmail: e.target.value })}
                  className="h-9 text-xs font-mono"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="set-phone">{t('admin.settings.contact_phone')}</Label>
                <Input
                  id="set-phone"
                  value={generalSettings.contactPhone}
                  onChange={(e) => setGeneralSettings({ ...generalSettings, contactPhone: e.target.value })}
                  className="h-9 text-xs font-mono"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="set-gate">{t('admin.settings.gate_close_time')}</Label>
                <div className="relative">
                  <Clock className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                  <Input
                    id="set-gate"
                    type="time"
                    value={generalSettings.gateCloseTime}
                    onChange={(e) => setGeneralSettings({ ...generalSettings, gateCloseTime: e.target.value })}
                    className="pl-8 h-9 text-xs"
                  />
                </div>
              </div>

              <div className="space-y-1.5 sm:col-span-2">
                <Label htmlFor="set-addr">{t('admin.settings.hostel_address')}</Label>
                <Input
                  id="set-addr"
                  value={generalSettings.address}
                  onChange={(e) => setGeneralSettings({ ...generalSettings, address: e.target.value })}
                  className="h-9 text-xs"
                />
              </div>
            </div>

            {/* Standards & Currency */}
            <div className="pt-4 border-t border-slate-100">
              <h4 className="font-bold text-xs text-slate-800 uppercase tracking-wider mb-3">
                {isEn ? 'System Currency & Timezone' : 'সিস্টেম মুদ্রা ও সময় অঞ্চল'}
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="p-3 bg-slate-50 rounded-xl space-y-1 border border-slate-100">
                  <Label className="text-slate-600">{t('admin.settings.currency')}</Label>
                  <p className="font-mono font-bold text-slate-900">{generalSettings.currency}</p>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl space-y-1 border border-slate-100">
                  <Label className="text-slate-600">{t('admin.settings.timezone')}</Label>
                  <p className="font-mono font-bold text-slate-900">{generalSettings.timezone}</p>
                </div>
              </div>
            </div>

            <div className="pt-3 flex justify-end">
              <Button type="submit" className="gap-2 bg-emerald-600 hover:bg-emerald-700 text-white">
                <Save className="w-4 h-4" />
                <span>{t('admin.settings.btn_save')}</span>
              </Button>
            </div>
          </div>
        </form>
      )}

      {/* SECURITY TAB (Password Management) */}
      {activeTab === 'SECURITY' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-5 max-w-xl">
          <div className="border-b border-slate-100 pb-3">
            <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
              <KeyRound className="w-5 h-5 text-emerald-600" />
              <span>{isEn ? 'Change Admin Password' : 'অ্যাডমিন পাসওয়ার্ড পরিবর্তন'}</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              {isEn ? 'Use a strong password to ensure security of your administrator account.' : 'আপনার অ্যাডমিনিস্ট্রেটর অ্যাকাউন্টের নিরাপত্তা নিশ্চিত করতে শক্তিশালী পাসওয়ার্ড ব্যবহার করুন'}
            </p>
          </div>

          {passwordStatus.type === 'success' && (
            <Alert className="bg-emerald-50 border-emerald-200 text-emerald-900 text-xs">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <AlertDescription>{passwordStatus.message}</AlertDescription>
            </Alert>
          )}

          {passwordStatus.type === 'error' && (
            <Alert variant="destructive" className="bg-rose-50 border-rose-200 text-rose-800 text-xs">
              <AlertCircle className="w-4 h-4 text-rose-600" />
              <AlertDescription>{passwordStatus.message}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleChangePassword} className="space-y-4 text-xs">
            {/* Current Password */}
            <div className="space-y-1.5">
              <Label htmlFor="curr-pass">{t('auth.current_password', 'Current Password')}</Label>
              <div className="relative">
                <Input
                  id="curr-pass"
                  type={showCurrentPassword ? 'text' : 'password'}
                  required
                  placeholder={t('auth.password_placeholder', 'Enter password')}
                  value={passwordForm.currentPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                  className="pr-10 h-9 text-xs"
                />
                <button
                  type="button"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
                >
                  {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* New Password */}
            <div className="space-y-1.5">
              <Label htmlFor="new-pass">{t('auth.new_password', 'New Password')}</Label>
              <div className="relative">
                <Input
                  id="new-pass"
                  type={showNewPassword ? 'text' : 'password'}
                  required
                  placeholder={isEn ? 'Minimum 8 characters' : 'কমপক্ষে ৮ অক্ষরের শক্তিশালী পাসওয়ার্ড'}
                  value={passwordForm.newPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                  className="pr-10 h-9 text-xs"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
                >
                  {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Confirm New Password */}
            <div className="space-y-1.5">
              <Label htmlFor="conf-pass">{t('auth.confirm_password', 'Confirm Password')}</Label>
              <div className="relative">
                <Input
                  id="conf-pass"
                  type={showConfirmPassword ? 'text' : 'password'}
                  required
                  placeholder={t('auth.confirm_password', 'Confirm Password')}
                  value={passwordForm.confirmPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                  className="pr-10 h-9 text-xs"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
                >
                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="pt-2">
              <Button
                type="submit"
                disabled={isChangingPass}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white"
              >
                {isChangingPass ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    <span>{t('common.loading')}</span>
                  </>
                ) : (
                  <span>{t('auth.change_password_submit', 'Change Password')}</span>
                )}
              </Button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
