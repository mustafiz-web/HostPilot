import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Send,
  CheckCircle2,
  FileText,
  User,
  Users,
  Home,
  Loader2,
  Info,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';

import { apiClient } from '@/lib/api-client';

const admissionSchema = z.object({
  applicantName: z.string().min(3, 'কমপক্ষে ৩ অক্ষরের নাম আবশ্যক (Min 3 characters)'),
  email: z.string().email('সঠিক ইমেইল ঠিকানা প্রদান করুন (Valid email required)'),
  phone: z.string().min(11, '১১ ডিজিটের মোবাইল নম্বর দিন (11-digit mobile number)').max(14),
  dateOfBirth: z.string().min(1, 'জন্ম তারিখ নির্বাচন করুন (Date of birth is required)'),
  gender: z.enum(['MALE', 'FEMALE', 'OTHER']),
  bloodGroup: z.string().optional(),
  preferredRoomType: z.enum(['SINGLE', 'DOUBLE', 'QUAD']),
  guardianName: z.string().min(3, 'অভিভাবকের নাম আবশ্যক (Guardian name is required)'),
  guardianRelation: z.string().min(2, 'সম্পর্ক লিখুন (e.g. পিতা/মাতা/ভাই)'),
  guardianPhone: z.string().min(11, 'অভিভাবকের ১১ ডিজিট মোবাইল নম্বর দিন'),
  address: z.string().min(6, 'স্থায়ী ঠিকানা বিস্তারিত লিখুন (Address is required)'),
});

type AdmissionFormValues = z.infer<typeof admissionSchema>;

export const AdmissionPage: React.FC = () => {
  const { t } = useTranslation();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedAppCode, setSubmittedAppCode] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<AdmissionFormValues>({
    resolver: zodResolver(admissionSchema),
    defaultValues: {
      preferredRoomType: 'DOUBLE',
      gender: 'MALE',
      bloodGroup: 'B+',
    },
  });

  const onSubmit = async (data: AdmissionFormValues) => {
    setIsSubmitting(true);
    setSubmitError(null);
    try {
      const res = await apiClient.post<any>('/admissions', data);
      setSubmittedAppCode(res.data.applicationNumber);
    } catch (err: any) {
      setSubmitError(
        err.message || 'ভর্তি আবেদন জমা নেওয়া সম্ভব হয়নি। অনুগ্রহ করে তথ্য যাচাই করে পুনরায় চেষ্টা করুন।'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setSubmittedAppCode(null);
    setSubmitError(null);
    reset();
  };

  return (
    <div className="space-y-12 py-10 md:py-16">
      {/* Header */}
      <section className="container mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-4 max-w-3xl">
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-gray-900 tracking-tight">
          {t('admission.title')}
        </h1>
        <p className="text-base sm:text-lg text-gray-600 leading-relaxed">
          {t('admission.subtitle')}
        </p>
      </section>

      {submitError && (
        <section className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
          <Alert variant="destructive" className="bg-rose-50 border-rose-200 text-rose-800">
            <Info className="h-4 w-4 text-rose-600" />
            <AlertTitle className="text-rose-950 font-bold">আবেদন জমা দিতে সমস্যা হয়েছে</AlertTitle>
            <AlertDescription className="text-rose-800 text-xs mt-1">
              {submitError}
            </AlertDescription>
          </Alert>
        </section>
      )}

      <section className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Guidelines Sidebar */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-xs space-y-4">
            <h3 className="font-bold text-gray-900 text-base flex items-center gap-2 border-b pb-3">
              <FileText className="w-5 h-5 text-emerald-600" />
              <span>{t('admission.guidelines_title')}</span>
            </h3>
            <ul className="space-y-3 text-xs text-gray-600">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>{t('admission.guideline_1')}</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>{t('admission.guideline_2')}</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>{t('admission.guideline_3')}</span>
              </li>
            </ul>
          </div>

          <div className="bg-emerald-50 rounded-2xl border border-emerald-200 p-6 shadow-xs space-y-3">
            <h4 className="font-bold text-emerald-950 text-sm">প্রয়োজনীয় কাগজপত্র:</h4>
            <ul className="space-y-2 text-xs text-emerald-900">
              <li>• জাতীয় পরিচয়পত্র / জন্মনিবন্ধন কপি</li>
              <li>• কলেজ / বিশ্ববিদ্যালয় স্টুডেন্ট আইডি</li>
              <li>• সদ্য তোলা ২ কপি পাসপোর্ট সাইজ ছবি</li>
              <li>• অভিভাবকের জাতীয় পরিচয়পত্রের কপি</li>
            </ul>
          </div>
        </div>

        {/* Form or Success State */}
        <div className="lg:col-span-2">
          {submittedAppCode ? (
            <div className="bg-white rounded-2xl border border-emerald-200 p-8 text-center space-y-6 shadow-sm">
              <div className="h-16 w-16 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <div className="space-y-2">
                <h2 className="text-2xl font-bold text-gray-900">
                  {t('admission.success_title')}
                </h2>
                <p className="text-sm text-gray-600 max-w-md mx-auto">
                  {t('admission.success_msg')}
                </p>
                <div className="inline-block px-4 py-2 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-800 font-mono text-lg font-bold tracking-wider mt-2">
                  {submittedAppCode}
                </div>
              </div>
              <p className="text-xs text-gray-500 max-w-sm mx-auto">
                এই ট্র্যাকিং কোডটি সংরক্ষণ করুন। আবেদন অনুমোদিত হলে আপনাকে এসএমএস ও ইমেইলে অবগত করা হবে।
              </p>
              <div className="pt-4 border-t border-gray-100">
                <Button onClick={handleReset} variant="outline" className="font-medium">
                  {t('admission.apply_another')}
                </Button>
              </div>
            </div>
          ) : (
            <form
              onSubmit={handleSubmit(onSubmit)}
              className="bg-white rounded-2xl border border-gray-200 p-6 sm:p-8 shadow-xs space-y-6"
            >
              <div className="border-b pb-3">
                <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                  <User className="w-5 h-5 text-emerald-600" />
                  <span>শিক্ষার্থীর ব্যক্তিগত তথ্য (Student Details)</span>
                </h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="applicantName">{t('admission.name_label')}</Label>
                  <Input
                    id="applicantName"
                    placeholder="যেমন: তানভীর আহমেদ"
                    error={!!errors.applicantName}
                    {...register('applicantName')}
                  />
                  {errors.applicantName && (
                    <p className="text-xs text-destructive">{errors.applicantName.message}</p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="email">{t('admission.email_label')}</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="tanvir@example.com"
                    error={!!errors.email}
                    {...register('email')}
                  />
                  {errors.email && (
                    <p className="text-xs text-destructive">{errors.email.message}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="phone">{t('admission.phone_label')}</Label>
                  <Input
                    id="phone"
                    placeholder="017XXXXXXXX"
                    error={!!errors.phone}
                    {...register('phone')}
                  />
                  {errors.phone && (
                    <p className="text-xs text-destructive">{errors.phone.message}</p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="dateOfBirth">{t('admission.dob_label')}</Label>
                  <Input
                    id="dateOfBirth"
                    type="date"
                    error={!!errors.dateOfBirth}
                    {...register('dateOfBirth')}
                  />
                  {errors.dateOfBirth && (
                    <p className="text-xs text-destructive">{errors.dateOfBirth.message}</p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="gender">{t('admission.gender_label')}</Label>
                  <select
                    id="gender"
                    {...register('gender')}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  >
                    <option value="MALE">পুরুষ (Male)</option>
                    <option value="FEMALE">মহিলা (Female)</option>
                    <option value="OTHER">অন্যান্য (Other)</option>
                  </select>
                </div>
              </div>

              <div className="border-b pt-4 pb-3">
                <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                  <Home className="w-5 h-5 text-emerald-600" />
                  <span>রুম প্রেফারেন্স (Room Preference)</span>
                </h2>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="preferredRoomType">{t('admission.room_pref_label')}</Label>
                <select
                  id="preferredRoomType"
                  {...register('preferredRoomType')}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  <option value="SINGLE">সিঙ্গেল রুম — ১ বেড (৳ ৮,০০০/মাস)</option>
                  <option value="DOUBLE">ডাবল রুম — ২ বেড (৳ ৫,০০০/মাস)</option>
                  <option value="QUAD">ফোর-বেড রুম — ৪ বেড (৳ ৩,৫০০/মাস)</option>
                </select>
              </div>

              <div className="border-b pt-4 pb-3">
                <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                  <Users className="w-5 h-5 text-emerald-600" />
                  <span>অভিভাবকের তথ্য (Guardian Details)</span>
                </h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="guardianName">{t('admission.guardian_name_label')}</Label>
                  <Input
                    id="guardianName"
                    placeholder="অভিভাবকের পুরো নাম"
                    error={!!errors.guardianName}
                    {...register('guardianName')}
                  />
                  {errors.guardianName && (
                    <p className="text-xs text-destructive">{errors.guardianName.message}</p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="guardianRelation">সম্পর্ক (Relation) *</Label>
                  <Input
                    id="guardianRelation"
                    placeholder="পিতা / মাতা / ভাই"
                    error={!!errors.guardianRelation}
                    {...register('guardianRelation')}
                  />
                  {errors.guardianRelation && (
                    <p className="text-xs text-destructive">{errors.guardianRelation.message}</p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="guardianPhone">{t('admission.guardian_phone_label')}</Label>
                  <Input
                    id="guardianPhone"
                    placeholder="018XXXXXXXX"
                    error={!!errors.guardianPhone}
                    {...register('guardianPhone')}
                  />
                  {errors.guardianPhone && (
                    <p className="text-xs text-destructive">{errors.guardianPhone.message}</p>
                  )}
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="address">{t('admission.address_label')}</Label>
                <Textarea
                  id="address"
                  rows={3}
                  placeholder="গ্রাম/বাড়ি নং, রোড নং, পোস্ট কোড, থানা, জেলা"
                  error={!!errors.address}
                  {...register('address')}
                />
                {errors.address && (
                  <p className="text-xs text-destructive">{errors.address.message}</p>
                )}
              </div>

              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full font-semibold gap-2 py-6 text-base shadow-sm mt-4"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>প্রক্রিয়াধীন রয়েছে...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>{t('admission.submit_btn')}</span>
                  </>
                )}
              </Button>
            </form>
          )}
        </div>
      </section>
    </div>
  );
};
