import React, { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Building2,
  LayoutDashboard,
  User,
  Bed,
  Receipt,
  MessageSquareWarning,
  Bell,
  BookOpen,
  ShieldCheck,
  ArrowLeft,
  Menu,
  LogOut,
} from 'lucide-react';
import { LanguageSwitcher } from '@/components/shared/language-switcher';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { useAuth } from '@/features/auth/auth-context';

export const StudentLayout: React.FC = () => {
  const { t } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const menuItems = [
    { href: '/student', label: t('student.nav.dashboard'), icon: LayoutDashboard },
    { href: '/student/profile', label: t('student.nav.profile'), icon: User },
    { href: '/student/room', label: t('student.nav.room'), icon: Bed },
    { href: '/student/payments', label: t('student.nav.payments'), icon: Receipt },
    { href: '/student/complaints', label: t('student.nav.complaints'), icon: MessageSquareWarning },
    { href: '/student/notices', label: t('student.nav.notices'), icon: Bell },
    { href: '/student/rules', label: t('student.nav.rules'), icon: BookOpen },
    { href: '/student/security', label: t('student.nav.security'), icon: ShieldCheck },
  ];

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen flex bg-slate-50 font-sans antialiased text-slate-800">
      {/* Desktop Sidebar */}
      <aside className="w-64 bg-emerald-950 text-emerald-100 flex flex-col hidden lg:flex shrink-0 border-r border-emerald-900 shadow-xl">
        {/* Brand Header */}
        <div className="h-16 flex items-center px-6 border-b border-emerald-900 gap-3">
          <div className="h-9 w-9 rounded-lg bg-emerald-500 flex items-center justify-center text-white font-bold shadow-xs">
            <Building2 className="w-5 h-5" />
          </div>
          <div>
            <span className="font-bold text-base text-white tracking-tight flex items-center gap-1.5">
              {t('brand.name')}
              <span className="text-[10px] bg-emerald-500/30 text-emerald-300 px-1.5 py-0.5 rounded font-mono">
                Student
              </span>
            </span>
            <p className="text-[10px] text-emerald-400 font-medium">{t('student.nav.portal_title')}</p>
          </div>
        </div>

        {/* Student Profile Quick Badge */}
        <div className="px-4 py-3 mx-3 my-3 bg-emerald-900/60 rounded-xl border border-emerald-800/80 flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-emerald-500 text-white font-bold flex items-center justify-center text-xs shadow-xs shrink-0">
            {user?.name ? user.name.charAt(0) : 'S'}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-bold text-white truncate">{user?.name || t('student.nav.portal_title')}</p>
            <p className="text-[11px] text-emerald-300 font-mono truncate">
              {user?.studentCode || user?.email || 'Student'}
            </p>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 px-3 py-1 space-y-1 overflow-y-auto">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const active = location.pathname === item.href;
            return (
              <Link
                key={item.href}
                to={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs sm:text-sm font-medium transition-all ${
                  active
                    ? 'bg-emerald-600 text-white font-semibold shadow-xs'
                    : 'text-emerald-200 hover:bg-emerald-900/80 hover:text-white'
                }`}
              >
                <Icon className={`w-4 h-4 shrink-0 ${active ? 'text-white' : 'text-emerald-300'}`} />
                <span className="truncate">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Privacy Note & Footer */}
        <div className="p-3 border-t border-emerald-900/80 space-y-2">
          <div className="flex items-center justify-between pt-1">
            <Link
              to="/"
              className="flex items-center gap-1.5 text-[11px] text-emerald-300 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>{t('student.nav.switch_to_site')}</span>
            </Link>
            <button
              onClick={handleLogout}
              className="flex items-center gap-1 text-[11px] text-rose-300 hover:text-rose-100 transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>{t('student.nav.logout')}</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Mobile Drawer */}
      <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
        <SheetContent side="left" className="bg-emerald-950 text-emerald-100 p-0 w-72 max-w-[85vw] border-emerald-900">
          <SheetHeader className="h-16 px-6 border-b border-emerald-900 flex items-center justify-between">
            <SheetTitle className="text-white font-bold text-base flex items-center gap-2">
              <Building2 className="w-5 h-5 text-emerald-400" />
              <span>{t('brand.name')} Student</span>
            </SheetTitle>
          </SheetHeader>
          <div className="p-4 space-y-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const active = location.pathname === item.href;
              return (
                <Link
                  key={item.href}
                  to={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                    active
                      ? 'bg-emerald-600 text-white font-semibold'
                      : 'text-emerald-200 hover:bg-emerald-900 hover:text-white'
                  }`}
                >
                  <Icon className="w-4 h-4 shrink-0 text-emerald-300" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
            <div className="pt-4 border-t border-emerald-900 mt-4 space-y-2">
              <Link
                to="/"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2 text-xs text-emerald-300 hover:text-white px-3 py-2"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>{t('student.nav.switch_to_site')}</span>
              </Link>
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  handleLogout();
                }}
                className="flex items-center gap-2 text-xs text-rose-300 hover:text-rose-100 px-3 py-2 w-full text-left"
              >
                <LogOut className="w-4 h-4" />
                <span>{t('student.nav.logout')}</span>
              </button>
            </div>
          </div>
        </SheetContent>
      </Sheet>

      {/* Main Content Viewport */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-3 sm:px-6 sticky top-0 z-20 shadow-xs">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setMobileMenuOpen(true)}
              className="lg:hidden p-1.5 h-9 w-9 text-slate-700 shrink-0"
            >
              <Menu className="w-5 h-5" />
            </Button>
            <div className="min-w-0">
              <h1 className="text-sm sm:text-base font-bold text-slate-900 flex items-center gap-2 truncate">
                <span className="truncate">{t('common.student_portal')}</span>
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-4 shrink-0">
            <LanguageSwitcher />
            <div className="flex items-center gap-2 border-l pl-2 sm:pl-4 border-slate-200">
              <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center text-xs border border-emerald-300 shrink-0">
                {user?.name ? user.name.substring(0, 2) : 'ST'}
              </div>
              <div className="hidden md:block text-left">
                <p className="text-xs font-bold text-slate-800 leading-tight">
                  {user?.name || 'শিক্ষার্থী'}
                </p>
                <p className="text-[10px] text-slate-400 font-mono">
                  {user?.studentCode || user?.email}
                </p>
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 p-3 sm:p-6 lg:p-8 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
