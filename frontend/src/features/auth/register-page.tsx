import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Building2,
  User,
  GraduationCap,
  ArrowLeft,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
  ShieldCheck,
  MapPin,
  KeyRound,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { LanguageSwitcher } from '@/components/shared/language-switcher';
import { apiClient } from '@/lib/api-client';
import { useAuth } from './auth-context';

export const RegisterPage: React.FC = () => {
  const { t, i18n } = useTranslation();
  const isEn = i18n.language?.startsWith('en');
  const navigate = useNavigate();
  const { isAuthenticated, isLoading: isAuthLoading, role: userRole } = useAuth();

  React.useEffect(() => {
    if (!isAuthLoading && isAuthenticated && userRole) {
      navigate(userRole === 'ADMIN' ? '/admin' : '/student', { replace: true });
    }
  }, [isAuthLoading, isAuthenticated, userRole, navigate]);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    department: 'CSE',
    rollNumber: '',
    institution: '',
    session: '2026',
    batch: '26',
    bloodGroup: 'B+',
    gender: 'MALE' as 'MALE' | 'FEMALE' | 'OTHER',
    dateOfBirth: '',
    address: '',
    preferredRoomType: 'DOUBLE' as 'SINGLE' | 'DOUBLE' | 'QUAD',
    guardianName: '',
    guardianRelation: 'Parent',
    guardianPhone: '',
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const [successData, setSuccessData] = useState<{
    studentCode: string;
    applicationNumber: string;
    name: string;
    email: string;
    status: string;
  } | null>(null);

  // Password strength calculation
  const getPasswordStrength = (pass: string) => {
    if (!pass) return { score: 0, label: '', width: '0%', color: 'bg-slate-200' };
    let score = 0;
    if (pass.length >= 6) score++;
    if (pass.length >= 8) score++;
    if (/[A-Z]/.test(pass) || /[0-9]/.test(pass)) score++;
    if (/[^A-Za-z0-9]/.test(pass)) score++;

    switch (score) {
      case 1:
        return {
          score: 1,
          label: isEn ? 'Weak (min 6 chars)' : 'দুর্বল (কমপক্ষে ৬ অক্ষর)',
          width: '25%',
          color: 'bg-rose-500 text-rose-700',
        };
      case 2:
        return {
          score: 2,
          label: isEn ? 'Fair' : 'মোটামুটি',
          width: '50%',
          color: 'bg-amber-500 text-amber-700',
        };
      case 3:
        return {
          score: 3,
          label: isEn ? 'Good' : 'ভালো',
          width: '75%',
          color: 'bg-blue-500 text-blue-700',
        };
      case 4:
      default:
        return {
          score: 4,
          label: isEn ? 'Strong' : 'শক্তিশালী',
          width: '100%',
          color: 'bg-emerald-500 text-emerald-700',
        };
    }
  };

  const passwordStrength = getPasswordStrength(formData.password);

  const validateForm = () => {
    const errors: Record<string, string> = {};

    if (!formData.name.trim() || formData.name.trim().length < 3) {
      errors.name = isEn
        ? 'Full Name must be at least 3 characters.'
        : 'পূর্ণ নাম কমপক্ষে ৩ অক্ষরের হতে হবে।';
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email.trim())) {
      errors.email = isEn
        ? 'Please enter a valid email address.'
        : 'সঠিক ইমেইল ঠিকানা প্রদান করুন।';
    }

    const phoneClean = formData.phone.trim().replace(/[- ]/g, '');
    if (phoneClean.length < 11 || phoneClean.length > 14) {
      errors.phone = isEn
        ? 'Enter a valid 11-digit phone number (e.g. 017XXXXXXXX).'
        : '১১ ডিজিটের সঠিক মোবাইল নম্বর প্রদান করুন (যেমন: ০১৭১১XXXXXX)।';
    }

    if (formData.password.length < 6) {
      errors.password = isEn
        ? 'Password must be at least 6 characters.'
        : 'পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে।';
    }

    if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = isEn
        ? 'Passwords do not match.'
        : 'পাসওয়ার্ড এবং কনফার্ম পাসওয়ার্ড মিলছে না।';
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const payload = {
        name: formData.name.trim(),
        email: formData.email.trim().toLowerCase(),
        password: formData.password,
        phone: formData.phone.trim(),
        department: formData.department?.trim() || 'General',
        rollNumber: formData.rollNumber?.trim() || undefined,
        institution: formData.institution?.trim() || undefined,
        session: formData.session?.trim() || '2026',
        batch: formData.batch?.trim() || '26',
        bloodGroup: formData.bloodGroup || undefined,
        gender: formData.gender,
        dateOfBirth: formData.dateOfBirth || undefined,
        address: formData.address?.trim() || 'Hostel Applicant',
        preferredRoomType: formData.preferredRoomType,
        guardianName: formData.guardianName?.trim() || 'Guardian',
        guardianRelation: formData.guardianRelation?.trim() || 'Parent',
        guardianPhone: formData.guardianPhone?.trim() || formData.phone.trim(),
        emergencyContact: formData.guardianPhone?.trim() || formData.phone.trim(),
      };

      const res = await apiClient.post<any>('/auth/register', payload);
      setSuccessData(res.data);
    } catch (err: any) {
      const msg =
        err?.response?.data?.error?.message ||
        err?.message ||
        t('common.something_went_wrong');
      setErrorMessage(msg);

      if (msg.toLowerCase().includes('email') || msg.includes('ইমেইল')) {
        setFieldErrors((prev) => ({
          ...prev,
          email: isEn
            ? 'This email address is already registered.'
            : 'এই ইমেইল দিয়ে ইতিমধ্যে একটি অ্যাকাউন্ট নিবন্ধিত রয়েছে।',
        }));
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8 bg-slate-50 flex flex-col justify-center relative">
      <div className="absolute top-4 right-4 sm:top-6 sm:right-6">
        <LanguageSwitcher />
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-2xl space-y-4">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-xs sm:text-sm text-emerald-700 hover:text-emerald-800 font-medium mx-auto justify-center w-full"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{t('auth.back_to_site')}</span>
        </Link>

        <div className="flex justify-center">
          <div className="h-12 w-12 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-md">
            <Building2 className="w-6 h-6" />
          </div>
        </div>

        <h2 className="text-center text-2xl sm:text-3xl font-extrabold tracking-tight text-gray-900">
          {t('auth.register_title')}
        </h2>
        <p className="text-center text-xs sm:text-sm text-gray-600 max-w-md mx-auto">
          {t('auth.register_subtitle')}
        </p>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-2xl">
        <div className="bg-white py-8 px-5 shadow-sm sm:rounded-2xl sm:px-10 border border-gray-200">
          {successData ? (
            /* Registration Success Feedback Screen */
            <div className="text-center space-y-6 py-4">
              <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-xs">
                <CheckCircle2 className="w-10 h-10" />
              </div>

              <div className="space-y-2">
                <h3 className="text-xl sm:text-2xl font-bold text-slate-900">
                  {t('auth.success_title')}
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 max-w-md mx-auto">
                  {t('auth.success_subtitle')}
                </p>
              </div>

              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-2 text-left max-w-md mx-auto">
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-500">{t('auth.full_name')}:</span>
                  <span className="font-bold text-slate-800">{successData.name}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-500">{t('auth.email')}:</span>
                  <span className="font-mono text-slate-800">{successData.email}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-500">{t('student.dashboard.meta_id')}:</span>
                  <span className="font-mono font-bold text-emerald-700">{successData.studentCode}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-500">{t('admin.admissions.th_app_no')}:</span>
                  <span className="font-mono font-bold text-blue-700">{successData.applicationNumber}</span>
                </div>
                <div className="flex justify-between pt-1">
                  <span className="text-slate-500">{t('common.status')}:</span>
                  <span className="bg-amber-100 text-amber-800 font-bold px-2 py-0.5 rounded text-[11px]">
                    {t('auth.status_pending')}
                  </span>
                </div>
              </div>

              <div className="p-3.5 bg-emerald-50 rounded-xl border border-emerald-200/80 text-xs text-emerald-900 max-w-md mx-auto flex items-start gap-2.5 text-left">
                <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                <p className="leading-relaxed">
                  {t('auth.success_instructions')}
                </p>
              </div>

              <div className="pt-3 flex flex-col sm:flex-row gap-3 justify-center">
                <Button
                  onClick={() => navigate('/login')}
                  className="bg-emerald-600 hover:bg-emerald-700 font-semibold px-8 shadow-xs"
                >
                  {t('auth.btn_go_login')}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => navigate('/')}
                  className="font-medium"
                >
                  {t('auth.back_to_site')}
                </Button>
              </div>
            </div>
          ) : (
            /* Registration Form */
            <form onSubmit={handleSubmit} className="space-y-6">
              {errorMessage && (
                <Alert variant="destructive" className="bg-rose-50 border-rose-200 text-rose-800 text-xs">
                  <AlertCircle className="w-4 h-4 text-rose-600" />
                  <AlertDescription>{errorMessage}</AlertDescription>
                </Alert>
              )}

              {/* 1. Personal & Contact Information */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5 border-b pb-2">
                  <User className="w-4 h-4 text-emerald-600" />
                  <span>{t('auth.sec_personal')}</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label htmlFor="reg-name" className="text-xs font-semibold text-slate-700">
                      {t('auth.full_name')} *
                    </Label>
                    <Input
                      id="reg-name"
                      required
                      placeholder="Farhan Ahmed"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className={`h-9 text-xs ${fieldErrors.name ? 'border-rose-500' : ''}`}
                    />
                    {fieldErrors.name && (
                      <p className="text-[11px] text-rose-600">{fieldErrors.name}</p>
                    )}
                  </div>

                  <div className="space-y-1">
                    <Label htmlFor="reg-email" className="text-xs font-semibold text-slate-700">
                      {t('auth.email')} *
                    </Label>
                    <Input
                      id="reg-email"
                      type="email"
                      required
                      placeholder="student@campus.edu.bd"
                      value={formData.email}
                      onChange={(e) => {
                        setFormData({ ...formData, email: e.target.value });
                        if (fieldErrors.email) {
                          setFieldErrors((prev) => ({ ...prev, email: '' }));
                        }
                      }}
                      className={`h-9 text-xs ${fieldErrors.email ? 'border-rose-500' : ''}`}
                    />
                    {fieldErrors.email && (
                      <p className="text-[11px] text-rose-600">{fieldErrors.email}</p>
                    )}
                  </div>

                  <div className="space-y-1">
                    <Label htmlFor="reg-phone" className="text-xs font-semibold text-slate-700">
                      {t('auth.phone')} *
                    </Label>
                    <Input
                      id="reg-phone"
                      required
                      placeholder="017XXXXXXXX"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className={`h-9 text-xs font-mono ${fieldErrors.phone ? 'border-rose-500' : ''}`}
                    />
                    {fieldErrors.phone && (
                      <p className="text-[11px] text-rose-600">{fieldErrors.phone}</p>
                    )}
                  </div>

                  <div className="space-y-1">
                    <Label htmlFor="reg-gender" className="text-xs font-semibold text-slate-700">
                      {t('auth.gender')} *
                    </Label>
                    <select
                      id="reg-gender"
                      value={formData.gender}
                      onChange={(e) => setFormData({ ...formData, gender: e.target.value as any })}
                      className="w-full h-9 rounded-md border border-slate-200 bg-white px-3 py-1 text-xs shadow-xs focus:ring-1 focus:ring-emerald-600"
                    >
                      <option value="MALE">{t('auth.gender_male')}</option>
                      <option value="FEMALE">{t('auth.gender_female')}</option>
                      <option value="OTHER">{t('auth.gender_other')}</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* 2. Academic & Identification */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5 border-b pb-2">
                  <GraduationCap className="w-4 h-4 text-emerald-600" />
                  <span>{t('auth.sec_academic')}</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label htmlFor="reg-roll" className="text-xs font-semibold text-slate-700">
                      {t('auth.roll_number')}
                    </Label>
                    <Input
                      id="reg-roll"
                      placeholder="2026-CSE-088"
                      value={formData.rollNumber}
                      onChange={(e) => setFormData({ ...formData, rollNumber: e.target.value })}
                      className="h-9 text-xs font-mono"
                    />
                  </div>

                  <div className="space-y-1">
                    <Label htmlFor="reg-dept" className="text-xs font-semibold text-slate-700">
                      {t('auth.department')}
                    </Label>
                    <Input
                      id="reg-dept"
                      placeholder="Computer Science & Engineering"
                      value={formData.department}
                      onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                      className="h-9 text-xs"
                    />
                  </div>

                  <div className="space-y-1">
                    <Label htmlFor="reg-roompref" className="text-xs font-semibold text-slate-700">
                      {t('auth.room_preference')}
                    </Label>
                    <select
                      id="reg-roompref"
                      value={formData.preferredRoomType}
                      onChange={(e) =>
                        setFormData({ ...formData, preferredRoomType: e.target.value as any })
                      }
                      className="w-full h-9 rounded-md border border-slate-200 bg-white px-3 py-1 text-xs shadow-xs focus:ring-1 focus:ring-emerald-600"
                    >
                      <option value="DOUBLE">{t('admin.rooms.type_double')}</option>
                      <option value="SINGLE">{t('admin.rooms.type_single')}</option>
                      <option value="QUAD">{t('admin.rooms.type_quad')}</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* 3. Address & Emergency Contact */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5 border-b pb-2">
                  <MapPin className="w-4 h-4 text-emerald-600" />
                  <span>{t('auth.sec_guardian')}</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1 sm:col-span-2">
                    <Label htmlFor="reg-addr" className="text-xs font-semibold text-slate-700">
                      {t('auth.address')}
                    </Label>
                    <Input
                      id="reg-addr"
                      placeholder="Dhanmondi, Dhaka"
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      className="h-9 text-xs"
                    />
                  </div>

                  <div className="space-y-1">
                    <Label htmlFor="reg-gname" className="text-xs font-semibold text-slate-700">
                      {t('auth.guardian_name')}
                    </Label>
                    <Input
                      id="reg-gname"
                      placeholder="Rafiq Ahmed"
                      value={formData.guardianName}
                      onChange={(e) => setFormData({ ...formData, guardianName: e.target.value })}
                      className="h-9 text-xs"
                    />
                  </div>

                  <div className="space-y-1">
                    <Label htmlFor="reg-gphone" className="text-xs font-semibold text-slate-700">
                      {t('auth.guardian_phone')}
                    </Label>
                    <Input
                      id="reg-gphone"
                      placeholder="018XXXXXXXX"
                      value={formData.guardianPhone}
                      onChange={(e) => setFormData({ ...formData, guardianPhone: e.target.value })}
                      className="h-9 text-xs font-mono"
                    />
                  </div>
                </div>
              </div>

              {/* 4. Password Security */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5 border-b pb-2">
                  <KeyRound className="w-4 h-4 text-emerald-600" />
                  <span>{t('auth.sec_security')}</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label htmlFor="reg-pwd" className="text-xs font-semibold text-slate-700">
                      {t('auth.password')} *
                    </Label>
                    <div className="relative">
                      <Input
                        id="reg-pwd"
                        type={showPassword ? 'text' : 'password'}
                        required
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        className={`h-9 text-xs pr-8 ${fieldErrors.password ? 'border-rose-500' : ''}`}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-2 top-2.5 text-gray-400 hover:text-gray-600"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    {/* Strength Indicator */}
                    {formData.password && (
                      <div className="space-y-1 pt-1">
                        <div className="h-1 w-full bg-slate-100 rounded-full overflow-hidden">
                          <div
                            className={`h-full ${passwordStrength.color} transition-all duration-300`}
                            style={{ width: passwordStrength.width }}
                          />
                        </div>
                        <span className={`text-[10px] font-medium ${passwordStrength.color}`}>
                          {passwordStrength.label}
                        </span>
                      </div>
                    )}
                    {fieldErrors.password && (
                      <p className="text-[11px] text-rose-600">{fieldErrors.password}</p>
                    )}
                  </div>

                  <div className="space-y-1">
                    <Label htmlFor="reg-cpwd" className="text-xs font-semibold text-slate-700">
                      {t('auth.confirm_password')} *
                    </Label>
                    <div className="relative">
                      <Input
                        id="reg-cpwd"
                        type={showConfirmPassword ? 'text' : 'password'}
                        required
                        value={formData.confirmPassword}
                        onChange={(e) =>
                          setFormData({ ...formData, confirmPassword: e.target.value })
                        }
                        className={`h-9 text-xs pr-8 ${
                          fieldErrors.confirmPassword ? 'border-rose-500' : ''
                        }`}
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-2 top-2.5 text-gray-400 hover:text-gray-600"
                      >
                        {showConfirmPassword ? (
                          <EyeOff className="w-4 h-4" />
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                    {fieldErrors.confirmPassword && (
                      <p className="text-[11px] text-rose-600">{fieldErrors.confirmPassword}</p>
                    )}
                  </div>
                </div>
              </div>

              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-emerald-600 hover:bg-emerald-700 font-semibold shadow-xs py-5 text-sm mt-4 text-white"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    <span>{t('auth.submitting')}</span>
                  </>
                ) : (
                  <span>{t('auth.btn_register')}</span>
                )}
              </Button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
