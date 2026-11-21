import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Loader2, ShieldAlert } from 'lucide-react';
import { useAuth } from './auth-context';
import { Button } from '@/components/ui/button';

interface ProtectedRouteProps {
  requiredRole?: 'ADMIN' | 'STUDENT';
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ requiredRole }) => {
  const { t } = useTranslation();
  const { user, isAuthenticated, isLoading, role } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 gap-3">
        <Loader2 className="w-8 h-8 text-emerald-600 animate-spin" />
        <p className="text-sm font-medium text-slate-600">{t('auth.verifying_server', 'Verifying authentication...')}</p>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (requiredRole && role !== requiredRole) {
    // If student attempts to view admin area, block and guide to student area
    if (requiredRole === 'ADMIN' && role === 'STUDENT') {
      return (
        <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-slate-50 text-center">
          <div className="w-16 h-16 rounded-2xl bg-rose-100 text-rose-700 flex items-center justify-center mb-4">
            <ShieldAlert className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">{t('auth.access_denied', 'Access Denied')}</h2>
          <p className="text-sm text-slate-600 max-w-md mb-6">
            {t(
              'auth.access_denied_desc',
              'This area is restricted to hostel administrators. Students may only access their personal dashboard.'
            )}
          </p>
          <div className="flex gap-3">
            <Button onClick={() => window.location.href = '/student'} className="bg-emerald-600 hover:bg-emerald-700">
              {t('auth.go_student_dashboard', 'Go to Student Dashboard')}
            </Button>
            <Button variant="outline" onClick={() => window.location.href = '/'}>
              {t('auth.back_to_site', 'Main Website')}
            </Button>
          </div>
        </div>
      );
    }

    if (requiredRole === 'STUDENT' && role === 'ADMIN') {
      return <Navigate to="/admin" replace />;
    }
  }

  return <Outlet />;
};
