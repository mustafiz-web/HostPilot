import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Building2, Mail, ArrowLeft, CheckCircle2, Info, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';

export const ForgotPasswordPage: React.FC = () => {
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [requested, setRequested] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setRequested(true);
    }, 700);
  };

  return (
    <div className="min-h-screen flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 bg-slate-50">
      <div className="sm:mx-auto sm:w-full sm:max-w-md space-y-4">
        <Link
          to="/login"
          className="inline-flex items-center gap-2 text-xs sm:text-sm text-emerald-700 hover:text-emerald-800 font-medium mx-auto justify-center w-full"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{t('auth.back_to_login')}</span>
        </Link>
        <div className="flex justify-center">
          <div className="h-12 w-12 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-md">
            <Building2 className="w-6 h-6" />
          </div>
        </div>
        <h2 className="text-center text-2xl sm:text-3xl font-extrabold tracking-tight text-gray-900">
          {t('auth.forgot_title')}
        </h2>
        <p className="text-center text-xs sm:text-sm text-gray-600 max-w-xs mx-auto">
          {t('auth.forgot_subtitle')}
        </p>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow-sm sm:rounded-2xl sm:px-10 border border-gray-200 space-y-6">
          {requested ? (
            <div className="space-y-4 text-center">
              <div className="h-12 w-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-gray-900">{t('auth.reset_requested_title', 'Password Reset Request Received')}</h3>
              <p className="text-xs text-gray-600 leading-relaxed">
                {t(
                  'auth.reset_requested_desc',
                  'Your reset request has been logged. The hostel administration will verify your identity and issue temporary login credentials.'
                )}
              </p>
              <Button asChild variant="outline" className="w-full mt-2">
                <Link to="/login">{t('auth.back_to_login')}</Link>
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <Alert variant="info" className="bg-sky-50 border-sky-200">
                <Info className="h-4 w-4 text-sky-600" />
                <AlertTitle className="text-xs font-bold text-sky-950">{t('auth.policy_notice', 'Security Policy Notice')}</AlertTitle>
                <AlertDescription className="text-xs text-sky-800">
                  {t(
                    'auth.policy_notice_desc',
                    'For security verification, password reset requests are verified by hostel administration via student roll number and registered phone.'
                  )}
                </AlertDescription>
              </Alert>

              <div className="space-y-1.5">
                <Label htmlFor="forgot-email">{t('auth.email_label')}</Label>
                <div className="relative rounded-md shadow-xs">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                    <Mail className="h-4 w-4" />
                  </div>
                  <Input
                    id="forgot-email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="student@hostpilot.com"
                    className="pl-9"
                  />
                </div>
              </div>

              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full font-semibold shadow-xs py-5 mt-2 text-sm"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    <span>{t('auth.submitting_request', 'Submitting request...')}</span>
                  </>
                ) : (
                  <span>{t('auth.forgot_btn')}</span>
                )}
              </Button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
