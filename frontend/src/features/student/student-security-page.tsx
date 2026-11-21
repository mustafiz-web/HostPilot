import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  ShieldCheck,
  KeyRound,
  Laptop,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
  Lock,
  Loader2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { apiClient } from '@/lib/api-client';

export const StudentSecurityPage: React.FC = () => {
  const { t, i18n } = useTranslation();
  const isEn = i18n.language?.startsWith('en');

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 8) {
      setFeedback({ type: 'error', message: t('student.security.error_min_length', 'New password must be at least 8 characters long.') });
      return;
    }
    if (newPassword !== confirmPassword) {
      setFeedback({ type: 'error', message: t('student.security.error_mismatch', 'New password and confirm password do not match.') });
      return;
    }

    try {
      setIsSubmitting(true);
      setFeedback(null);
      await apiClient.patch('/auth/change-password', {
        currentPassword,
        newPassword,
      });

      setFeedback({
        type: 'success',
        message: t(
          'student.security.success_updated',
          'Password changed successfully! Use your new password for subsequent logins.'
        ),
      });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      const errMsg =
        err?.response?.data?.message ||
        err?.message ||
        (isEn
          ? 'Password change failed. Please verify your current password.'
          : 'পাসওয়ার্ড পরিবর্তন ব্যর্থ হয়েছে। বর্তমান পাসওয়ার্ড সঠিক কিনা পরীক্ষা করুন।');
      setFeedback({
        type: 'error',
        message: errMsg,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
            <ShieldCheck className="w-6 h-6 text-emerald-600" />
            <span>{t('student.security.title')}</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-500">
            {t('student.security.subtitle')}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Change Password Form */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-5">
          <div className="flex items-center gap-2 border-b pb-3">
            <KeyRound className="w-5 h-5 text-emerald-600" />
            <h3 className="font-bold text-base text-slate-900">
              {t('student.security.card_title', 'Change Account Password')}
            </h3>
          </div>

          {feedback && (
            <div
              className={`p-4 rounded-xl border flex items-start gap-3 text-xs leading-relaxed ${
                feedback.type === 'success'
                  ? 'bg-emerald-50 text-emerald-900 border-emerald-200'
                  : 'bg-rose-50 text-rose-900 border-rose-200'
              }`}
            >
              {feedback.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              )}
              <span className="font-medium">{feedback.message}</span>
            </div>
          )}

          <form onSubmit={handlePasswordChange} className="space-y-4 max-w-lg">
            <div className="space-y-1.5">
              <Label htmlFor="currentPass" className="text-xs font-semibold">
                {t('student.security.current_pwd', 'Current Password')}
              </Label>
              <div className="relative">
                <Input
                  id="currentPass"
                  type={showCurrent ? 'text' : 'password'}
                  placeholder={t('student.security.placeholder_current', 'Enter current account password')}
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
              <Label htmlFor="newPass" className="text-xs font-semibold">
                {t('student.security.new_pwd', 'New Password')}
              </Label>
              <div className="relative">
                <Input
                  id="newPass"
                  type={showNew ? 'text' : 'password'}
                  placeholder={t('student.security.placeholder_new', 'Enter strong password (min 8 chars)')}
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
              <Label htmlFor="confirmPass" className="text-xs font-semibold">
                {t('student.security.confirm_pwd', 'Confirm New Password')}
              </Label>
              <div className="relative">
                <Input
                  id="confirmPass"
                  type={showConfirm ? 'text' : 'password'}
                  placeholder={t('student.security.placeholder_confirm', 'Re-enter new password')}
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

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 text-xs text-slate-600 space-y-1.5">
              <span className="font-bold text-slate-800 block">
                {isEn ? 'Password Requirements:' : 'নিরাপদ পাসওয়ার্ডের শর্তাবলী:'}
              </span>
              <ul className="space-y-1 list-disc list-inside text-[11px] text-slate-500">
                <li>{isEn ? 'Minimum 8 characters' : 'কমপক্ষে ৮টি অক্ষর (Characters)'}</li>
                <li>{isEn ? 'At least one uppercase and lowercase letter (A-Z, a-z)' : 'একটি ইংরেজি বড় হাতের অক্ষর (A-Z) ও ছোট হাতের অক্ষর (a-z)'}</li>
                <li>{isEn ? 'At least one number (0-9) and special character (@, #, $, etc.)' : 'কমপক্ষে একটি সংখ্যা (0-9) ও বিশেষ চিহ্ন (@, #, $, ইত্যাদি)'}</li>
              </ul>
            </div>

            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full sm:w-auto gap-2 bg-emerald-600 hover:bg-emerald-700"
            >
              {isSubmitting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Lock className="w-4 h-4" />
              )}
              <span>
                {isSubmitting
                  ? isEn
                    ? 'Updating...'
                    : 'আপডেট করা হচ্ছে...'
                  : t('student.security.btn_update', 'Update Password')}
              </span>
            </Button>
          </form>
        </div>

        {/* Active Session & Security Overview */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-5">
          <div className="flex items-center gap-2 border-b pb-3">
            <Laptop className="w-5 h-5 text-emerald-600" />
            <h3 className="font-bold text-base text-slate-900">
              {isEn ? 'Login Devices & Session' : 'লগইন ডিভাইস ও সেশন'}
            </h3>
          </div>

          <div className="p-4 bg-emerald-50/50 rounded-xl border border-emerald-200/80 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-emerald-900 flex items-center gap-1.5">
                <Laptop className="w-4 h-4 text-emerald-600" />
                <span>{isEn ? 'Current Device Session' : 'বর্তমান সেশন (Current Device)'}</span>
              </span>
              <span className="text-[10px] bg-emerald-600 text-white font-bold px-2 py-0.5 rounded-full">
                {t('common.active', 'Active')}
              </span>
            </div>
            <p className="text-xs text-slate-700">Windows PC • Google Chrome</p>
            <p className="text-[11px] text-slate-400 font-mono">
              {isEn ? 'IP: 103.145.132.44 • Dhaka, Bangladesh' : 'আইপি: 103.145.132.44 • ঢাকা, বাংলাদেশ'}
            </p>
            <p className="text-[11px] text-slate-500 pt-1 border-t border-emerald-100">
              {isEn ? 'Status: Active persistent HttpOnly cookie' : 'স্ট্যাটাস: সক্রিয় পারসিস্টেন্ট HttpOnly সেশন'}
            </p>
          </div>

          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/80 space-y-2">
            <span className="text-xs font-bold text-slate-800 block">
              {isEn ? 'Two-Factor Authentication (2FA)' : 'দ্বৈত স্তর নিরাপত্তা (2FA)'}
            </span>
            <p className="text-xs text-slate-500 leading-relaxed">
              {isEn
                ? 'To enable SMS OTP verification for critical transactions, contact the hostel administration office.'
                : 'আপনার নিবন্ধিত মোবাইল নম্বরে ওটিপি (OTP) ভেরিফিকেশন চালু করতে হোস্টেল অ্যাডমিন অফিসে যোগাযোগ করুন।'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
