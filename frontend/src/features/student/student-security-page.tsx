import React, { useState } from 'react';
import {
  ShieldCheck,
  KeyRound,
  Laptop,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
  Lock,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export const StudentSecurityPage: React.FC = () => {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const handlePasswordChange = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 8) {
      setFeedback({ type: 'error', message: 'নতুন পাসওয়ার্ড কমপক্ষে ৮ অক্ষরের হতে হবে।' });
      return;
    }
    if (newPassword !== confirmPassword) {
      setFeedback({ type: 'error', message: 'নতুন পাসওয়ার্ড এবং কনফার্ম পাসওয়ার্ড মিলছে না।' });
      return;
    }

    setFeedback({
      type: 'success',
      message: 'পাসওয়ার্ড সফলভাবে পরিবর্তিত হয়েছে! পরবর্তী লগইনে নতুন পাসওয়ার্ড ব্যবহার করুন।',
    });
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
            <ShieldCheck className="w-6 h-6 text-emerald-600" />
            <span>অ্যাকাউন্ট সিকিউরিটি ও পাসওয়ার্ড পরিবর্তন (Account Security)</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-500">
            শিক্ষার্থী অ্যাকাউন্টের নিরাপত্তা নিশ্চিতকরণ, পাসওয়ার্ড পরিবর্তন ও লগইন সেশন ট্র্যাকিং
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Change Password Form */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-5">
          <div className="flex items-center gap-2 border-b pb-3">
            <KeyRound className="w-5 h-5 text-emerald-600" />
            <h3 className="font-bold text-base text-slate-900">পাসওয়ার্ড পরিবর্তন করুন</h3>
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
                বর্তমান পাসওয়ার্ড
              </Label>
              <div className="relative">
                <Input
                  id="currentPass"
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
              <Label htmlFor="newPass" className="text-xs font-semibold">
                নতুন পাসওয়ার্ড
              </Label>
              <div className="relative">
                <Input
                  id="newPass"
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
              <Label htmlFor="confirmPass" className="text-xs font-semibold">
                নতুন পাসওয়ার্ড পুনরায় লিখুন (Confirm)
              </Label>
              <div className="relative">
                <Input
                  id="confirmPass"
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

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 text-xs text-slate-600 space-y-1.5">
              <span className="font-bold text-slate-800 block">নিরাপদ পাসওয়ার্ডের শর্তাবলী:</span>
              <ul className="space-y-1 list-disc list-inside text-[11px] text-slate-500">
                <li>কমপক্ষে ৮টি অক্ষর (Characters)</li>
                <li>একটি ইংরেজি বড় হাতের অক্ষর (A-Z) ও ছোট হাতের অক্ষর (a-z)</li>
                <li>কমপক্ষে একটি সংখ্যা (0-9) ও বিশেষ চিহ্ন (@, #, $, ইত্যাদি)</li>
              </ul>
            </div>

            <Button type="submit" className="gap-2 bg-emerald-600 hover:bg-emerald-700">
              <Lock className="w-4 h-4" />
              <span>পাসওয়ার্ড আপডেট করুন</span>
            </Button>
          </form>
        </div>

        {/* Active Session & Security Overview */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-5">
          <div className="flex items-center gap-2 border-b pb-3">
            <Laptop className="w-5 h-5 text-emerald-600" />
            <h3 className="font-bold text-base text-slate-900">লগইন ডিভাইস ও সেশন</h3>
          </div>

          <div className="p-4 bg-emerald-50/50 rounded-xl border border-emerald-200/80 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-emerald-900 flex items-center gap-1.5">
                <Laptop className="w-4 h-4 text-emerald-600" />
                <span>বর্তমান সেশন (Current Device)</span>
              </span>
              <span className="text-[10px] bg-emerald-600 text-white font-bold px-2 py-0.5 rounded-full">
                সক্রিয়
              </span>
            </div>
            <p className="text-xs text-slate-700">Windows PC • Google Chrome</p>
            <p className="text-[11px] text-slate-400 font-mono">আইপি: 103.145.132.44 • ঢাকা, বাংলাদেশ</p>
            <p className="text-[11px] text-slate-500 pt-1 border-t border-emerald-100">
              লগইনের সময়: ১৮ নভেম্বর, ২০২৬ (বিকাল ০৪:১৫)
            </p>
          </div>

          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/80 space-y-2">
            <span className="text-xs font-bold text-slate-800 block">দ্বৈত স্তর নিরাপত্তা (2FA)</span>
            <p className="text-xs text-slate-500 leading-relaxed">
              আপনার নিবন্ধিত মোবাইল নম্বরে ওটিপি (OTP) ভেরিফিকেশন চালু করতে হোস্টেল অ্যাডমিন অফিসে যোগাযোগ করুন।
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
