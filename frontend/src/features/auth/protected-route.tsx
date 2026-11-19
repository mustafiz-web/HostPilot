import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { Loader2, ShieldAlert } from 'lucide-react';
import { useAuth } from './auth-context';
import { Button } from '@/components/ui/button';

interface ProtectedRouteProps {
  requiredRole?: 'ADMIN' | 'STUDENT';
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ requiredRole }) => {
  const { user, isAuthenticated, isLoading, role } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 gap-3">
        <Loader2 className="w-8 h-8 text-emerald-600 animate-spin" />
        <p className="text-sm font-medium text-slate-600">সার্ভার যাচাইকরণ চলছে (Verifying authentication)...</p>
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
          <h2 className="text-2xl font-bold text-slate-900 mb-2">অ্যাক্সেস সংরক্ষিত (Access Denied)</h2>
          <p className="text-sm text-slate-600 max-w-md mb-6">
            এই পৃষ্ঠাটি শুধুমাত্র হোস্টেল অ্যাডমিনিস্ট্রেটরের জন্য সংরক্ষিত। শিক্ষার্থীরা শুধুমাত্র নিজস্ব প্যানেল ব্যবহার করতে পারবেন।
          </p>
          <div className="flex gap-3">
            <Button onClick={() => window.location.href = '/student'} className="bg-emerald-600 hover:bg-emerald-700">
              শিক্ষার্থী ড্যাশবোর্ডে যান
            </Button>
            <Button variant="outline" onClick={() => window.location.href = '/'}>
              মূল ওয়েবসাইট
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
