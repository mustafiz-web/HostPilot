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
  Sparkles,
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
    { href: '/student', label: 'আমার ড্যাশবোর্ড (Dashboard)', icon: LayoutDashboard },
    { href: '/student/profile', label: 'আমার প্রোফাইল (My Profile)', icon: User },
    { href: '/student/room', label: 'আমার রুম ও সিট (Room & Bed)', icon: Bed },
    { href: '/student/payments', label: 'পেমেন্ট ও রসিদ (Payments)', icon: Receipt },
    { href: '/student/complaints', label: 'আমার অভিযোগ (Complaints)', icon: MessageSquareWarning },
    { href: '/student/notices', label: 'নোটিশ বোর্ড (Notices)', icon: Bell },
    { href: '/student/rules', label: 'হোস্টেল নিয়মাবলী (Rules & Info)', icon: BookOpen },
    { href: '/student/security', label: 'অ্যাকাউন্ট সিকিউরিটি (Security)', icon: ShieldCheck },
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
            <p className="text-[10px] text-emerald-400 font-medium">শিক্ষার্থী পোর্টাল</p>
          </div>
        </div>

        {/* Student Profile Quick Badge */}
        <div className="px-4 py-3 mx-3 my-3 bg-emerald-900/60 rounded-xl border border-emerald-800/80 flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-emerald-500 text-white font-bold flex items-center justify-center text-xs shadow-xs shrink-0">
            {user?.name ? user.name.charAt(0) : 'S'}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-bold text-white truncate">{user?.name || 'শিক্ষার্থী'}</p>
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
          <div className="p-2 bg-emerald-900/40 rounded-lg text-[10px] text-emerald-300 leading-relaxed border border-emerald-800/50 flex items-start gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
            <span>গোপনীয়তা সুরক্ষা: আপনি শুধুমাত্র আপনার নিজস্ব সিট ও পেমেন্ট রেকর্ড দেখতে পাচ্ছেন।</span>
          </div>
          <div className="flex items-center justify-between pt-1">
            <Link
              to="/"
              className="flex items-center gap-1.5 text-[11px] text-emerald-300 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>মূল সাইট</span>
            </Link>
            <button
              onClick={handleLogout}
              className="flex items-center gap-1 text-[11px] text-rose-300 hover:text-rose-100 transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>লগআউট</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Mobile Drawer */}
      <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
        <SheetContent side="left" className="bg-emerald-950 text-emerald-100 p-0 w-72 border-emerald-900">
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
                <span>মূল ওয়েবসাইটে ফিরে যান</span>
              </Link>
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  handleLogout();
                }}
                className="flex items-center gap-2 text-xs text-rose-300 hover:text-rose-100 px-3 py-2 w-full text-left"
              >
                <LogOut className="w-4 h-4" />
                <span>লগআউট করুন</span>
              </button>
            </div>
          </div>
        </SheetContent>
      </Sheet>

      {/* Main Content Viewport */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 sm:px-6 sticky top-0 z-20 shadow-xs">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setMobileMenuOpen(true)}
              className="lg:hidden p-1.5 h-9 w-9 text-slate-700"
            >
              <Menu className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-sm sm:text-base font-bold text-slate-900 flex items-center gap-2">
                <span>{t('common.student_portal')}</span>
                <span className="hidden sm:inline-flex text-[11px] font-medium bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full border border-emerald-200">
                  রুম ১০১ (বেড A)
                </span>
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-3 sm:gap-4">
            <LanguageSwitcher />
            <div className="flex items-center gap-2 border-l pl-3 sm:pl-4 border-slate-200">
              <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center text-xs border border-emerald-300">
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

        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
