import React, { useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Building2,
  LayoutDashboard,
  Users,
  UserPlus,
  BedDouble,
  KeyRound,
  CreditCard,
  Receipt,
  AlertCircle,
  Bell,
  BarChart3,
  Settings,
  ArrowLeft,
  Menu,
  LogOut,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/features/auth/auth-context';
import { LanguageSwitcher } from '@/components/shared/language-switcher';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from '@/components/ui/sheet';

export const AdminLayout: React.FC = () => {
  const { t } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const menuItems = [
    { href: '/admin', label: t('admin.nav.dashboard'), icon: LayoutDashboard },
    { href: '/admin/students', label: t('admin.nav.students'), icon: Users },
    { href: '/admin/admissions', label: t('admin.nav.admissions'), icon: UserPlus },
    { href: '/admin/rooms', label: t('admin.nav.rooms'), icon: BedDouble },
    { href: '/admin/allocations', label: t('admin.nav.allocations'), icon: KeyRound },
    { href: '/admin/payments', label: t('admin.nav.payments'), icon: CreditCard },
    { href: '/admin/expenses', label: t('admin.nav.expenses'), icon: Receipt },
    { href: '/admin/complaints', label: t('admin.nav.complaints'), icon: AlertCircle },
    { href: '/admin/notices', label: t('admin.nav.notices'), icon: Bell },
    { href: '/admin/reports', label: t('admin.nav.reports'), icon: BarChart3 },
    { href: '/admin/settings', label: t('admin.nav.settings'), icon: Settings },
  ];

  const renderNavLinks = () => (
    <nav className="flex-1 px-3 py-4 space-y-1">
      {menuItems.map((item) => {
        const Icon = item.icon;
        const active = location.pathname === item.href;
        return (
          <Link
            key={item.href}
            to={item.href}
            onClick={() => setMobileDrawerOpen(false)}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs sm:text-sm font-medium transition-colors ${
              active
                ? 'bg-emerald-600 text-white font-semibold shadow-xs'
                : 'text-slate-300 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <Icon className="w-4 h-4 shrink-0" />
            <span className="truncate">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );

  return (
    <div className="min-h-screen flex bg-slate-100 font-sans">
      {/* Desktop Sidebar */}
      <aside className="w-64 bg-slate-900 text-slate-100 flex flex-col hidden lg:flex shrink-0 border-r border-slate-800">
        <div className="h-16 flex items-center px-6 border-b border-slate-800 gap-3">
          <div className="h-8 w-8 rounded-lg bg-emerald-600 flex items-center justify-center text-white font-bold shadow-xs">
            <Building2 className="w-5 h-5" />
          </div>
          <span className="font-bold text-base text-white tracking-tight">
            {t('brand.name')} <span className="text-xs text-emerald-400 font-normal">Admin</span>
          </span>
        </div>

        {renderNavLinks()}

        <div className="p-4 border-t border-slate-800">
          <Link
            to="/"
            className="flex items-center gap-2 text-xs text-slate-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>{t('admin.nav.switch_to_site')}</span>
          </Link>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-3 sm:px-6 sticky top-0 z-20">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            {/* Mobile Sidebar Trigger */}
            <Sheet open={mobileDrawerOpen} onOpenChange={setMobileDrawerOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="lg:hidden text-slate-700 shrink-0">
                  <Menu className="w-5 h-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-72 max-w-[85vw] bg-slate-900 text-white p-0 border-slate-800">
                <SheetHeader className="h-16 flex items-center px-6 border-b border-slate-800 text-left justify-center">
                  <SheetTitle className="text-white text-base font-bold flex items-center gap-2">
                    <Building2 className="w-5 h-5 text-emerald-500" />
                    <span>Host Pilot Admin</span>
                  </SheetTitle>
                </SheetHeader>
                {renderNavLinks()}
                <div className="p-4 border-t border-slate-800">
                  <Link
                    to="/"
                    onClick={() => setMobileDrawerOpen(false)}
                    className="flex items-center gap-2 text-xs text-slate-400 hover:text-white"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>{t('admin.nav.switch_to_site')}</span>
                  </Link>
                </div>
              </SheetContent>
            </Sheet>

            <h1 className="text-sm sm:text-lg font-bold text-slate-800 truncate">
              {t('admin.nav.portal_title')}
            </h1>
          </div>

          <div className="flex items-center gap-2 sm:gap-4 shrink-0">
            <LanguageSwitcher />
            <div className="flex items-center gap-2 border-l pl-2 sm:pl-4 border-slate-200">
              <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center text-xs shrink-0">
                {user?.name ? user.name.substring(0, 2).toUpperCase() : 'AD'}
              </div>
              <div className="hidden sm:block text-left">
                <span className="block text-xs font-semibold text-slate-800 leading-none">
                  {user?.name || 'Administrator'}
                </span>
                <span className="text-[10px] text-slate-400">
                  {user?.email || 'admin@hostpilot.dev'}
                </span>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLogout}
              className="text-xs text-rose-600 hover:text-rose-700 hover:bg-rose-50 gap-1.5 h-8 px-2 sm:px-2.5"
              title={t('admin.nav.logout')}
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden md:inline">{t('admin.nav.logout')}</span>
            </Button>
          </div>
        </header>

        <main className="flex-1 p-3 sm:p-6 lg:p-8 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
