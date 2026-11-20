import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Building2,
  Lock,
  Mail,
  Shield,
  User,
  ArrowLeft,
  Loader2,
  Sparkles,
  AlertCircle,
  Eye,
  EyeOff,
  UserPlus,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { LanguageSwitcher } from '@/components/shared/language-switcher';
import { useAuth } from './auth-context';

export const LoginPage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  const [role, setRole] = useState<'ADMIN' | 'STUDENT'>('ADMIN');
  const [email, setEmail] = useState('admin@hostpilot.dev');
  const [password, setPassword] = useState('Admin#Dev2026!');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const loggedInUser = await login(email, password);
      const destination =
        (location.state as any)?.from?.pathname ||
        (loggedInUser.role === 'ADMIN' ? '/admin' : '/student');
      navigate(destination, { replace: true });
    } catch (err: any) {
      setErrorMessage(
        err.message || 'ইমেইল বা পাসওয়ার্ড সঠিক নয় (Invalid email or password)'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleFillDemo = (targetRole: 'ADMIN' | 'STUDENT') => {
    setRole(targetRole);
    setErrorMessage(null);
    if (targetRole === 'ADMIN') {
      setEmail('admin@hostpilot.dev');
      setPassword('Admin#Dev2026!');
    } else {
      setEmail('tanvir@campus.edu.bd');
      setPassword('Student#Dev2026!');
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center py-8 px-3 sm:px-6 lg:px-8 bg-slate-50 relative">
      <div className="absolute top-3 right-3 sm:top-6 sm:right-6">
        <LanguageSwitcher />
      </div>
      <div className="sm:mx-auto sm:w-full sm:max-w-md space-y-4">
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
          {t('auth.login_title')}
        </h2>
        <p className="text-center text-xs sm:text-sm text-gray-600 max-w-xs mx-auto">
          {t('auth.login_subtitle')}
        </p>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow-sm sm:rounded-2xl sm:px-10 border border-gray-200 space-y-6">
          {/* Role Selector Tabs */}
          <div className="grid grid-cols-2 gap-2 bg-slate-100 p-1 rounded-xl">
            <button
              type="button"
              onClick={() => handleFillDemo('STUDENT')}
              className={`flex items-center justify-center gap-2 py-2.5 text-xs font-semibold rounded-lg transition-all ${
                role === 'STUDENT'
                  ? 'bg-white text-emerald-800 shadow-xs'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <User className="w-3.5 h-3.5" />
              <span>{t('auth.student_tab')}</span>
            </button>
            <button
              type="button"
              onClick={() => handleFillDemo('ADMIN')}
              className={`flex items-center justify-center gap-2 py-2.5 text-xs font-semibold rounded-lg transition-all ${
                role === 'ADMIN'
                  ? 'bg-white text-emerald-800 shadow-xs'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Shield className="w-3.5 h-3.5" />
              <span>{t('auth.admin_tab')}</span>
            </button>
          </div>

          {errorMessage && (
            <Alert variant="destructive" className="bg-rose-50 border-rose-200 text-rose-800">
              <AlertCircle className="w-4 h-4 text-rose-600" />
              <AlertDescription className="text-xs font-medium">
                {errorMessage}
              </AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="login-email">{t('auth.email_label')}</Label>
              <div className="relative rounded-md shadow-xs">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                  <Mail className="h-4 w-4" />
                </div>
                <Input
                  id="login-email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={role === 'ADMIN' ? 'admin@hostpilot.dev' : 'tanvir@campus.edu.bd'}
                  className="pl-9"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label htmlFor="login-password">{t('auth.password_label')}</Label>
                <Link
                  to="/forgot-password"
                  className="text-xs text-emerald-700 hover:text-emerald-800 font-medium"
                >
                  {t('auth.forgot_pwd')}
                </Link>
              </div>
              <div className="relative rounded-md shadow-xs">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                  <Lock className="h-4 w-4" />
                </div>
                <Input
                  id="login-password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="pl-9 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full font-semibold shadow-xs py-5 mt-2 text-sm bg-emerald-600 hover:bg-emerald-700"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  <span>{t('auth.verifying')}</span>
                </>
              ) : (
                <span>{role === 'ADMIN' ? t('auth.admin_login_btn') : t('auth.student_login_btn')}</span>
              )}
            </Button>
          </form>

          {/* Registration CTA Box */}
          <div className="pt-5 border-t border-gray-100 text-center space-y-2.5">
            <p className="text-xs text-gray-500">{t('auth.new_student')}</p>
            <Button
              asChild
              variant="outline"
              className="w-full gap-2 border-emerald-600 text-emerald-700 hover:bg-emerald-50 hover:text-emerald-800 font-semibold text-xs py-4"
            >
              <Link to="/register">
                <UserPlus className="w-4 h-4 text-emerald-600" />
                <span>{t('auth.register_here')}</span>
              </Link>
            </Button>
          </div>

          {/* Quick Demo Credentials Fill Helpers */}
          <div className="pt-4 border-t border-gray-100 space-y-2">
            <div className="flex items-center gap-1.5 text-[11px] font-semibold text-gray-500 uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
              <span>{t('auth.demo_hint')} (Development MySQL)</span>
            </div>
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="flex-1 text-[11px] h-8"
                onClick={() => handleFillDemo('STUDENT')}
              >
                {t('auth.student_account')}
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="flex-1 text-[11px] h-8"
                onClick={() => handleFillDemo('ADMIN')}
              >
                {t('auth.admin_account')}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
