import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Building2, Menu, X, LogIn } from 'lucide-react';
import { LanguageSwitcher } from './language-switcher';
import { Button } from '@/components/ui/button';

export const Header: React.FC = () => {
  const { t } = useTranslation();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { href: '/', label: t('nav.home') },
    { href: '/about', label: t('nav.about') },
    { href: '/rooms', label: t('nav.rooms') },
    { href: '/facilities', label: t('nav.facilities') },
    { href: '/admission', label: t('nav.admission') },
    { href: '/notices', label: t('nav.notices') },
    { href: '/contact', label: t('nav.contact') },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <header className="sticky top-0 z-50 w-full border-b border-emerald-100 bg-white/95 backdrop-blur-md supports-[backdrop-filter]:bg-white/80 shadow-xs">
      <div className="container mx-auto flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand Logo */}
        <Link to="/" className="flex items-center gap-2 group shrink min-w-0">
          <div className="flex h-9 w-9 sm:h-10 sm:w-10 shrink-0 items-center justify-center rounded-lg bg-emerald-600 text-white shadow-sm transition-transform group-hover:scale-105">
            <Building2 className="h-5 w-5" />
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-base sm:text-lg font-bold tracking-tight text-gray-900 group-hover:text-emerald-700 transition-colors truncate">
              {t('brand.name')}
            </span>
            <span className="text-[10px] sm:text-[11px] text-emerald-600 font-medium tracking-wide hidden sm:block truncate">
              {t('brand.tagline')}
            </span>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex items-center gap-1 xl:gap-2">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              to={link.href}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                isActive(link.href)
                  ? 'text-emerald-700 bg-emerald-50 font-semibold'
                  : 'text-gray-600 hover:text-emerald-600 hover:bg-gray-50'
              }`}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Action Controls */}
        <div className="hidden lg:flex items-center gap-3">
          <LanguageSwitcher />
          <Button asChild size="sm" className="gap-1.5 font-medium shadow-xs">
            <Link to="/login">
              <LogIn className="w-4 h-4" />
              <span>{t('nav.login')}</span>
            </Link>
          </Button>
        </div>

        {/* Mobile Hamburger Toggle */}
        <div className="flex items-center gap-2 lg:hidden">
          <LanguageSwitcher />
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle Navigation Menu"
          >
            {mobileMenuOpen ? <X className="h-5 w-5 text-gray-700" /> : <Menu className="h-5 w-5 text-gray-700" />}
          </Button>
        </div>
      </div>

      {/* Mobile Nav Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-b border-emerald-100 bg-white px-4 pt-2 pb-4 space-y-1 shadow-lg">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              to={link.href}
              onClick={() => setMobileMenuOpen(false)}
              className={`block px-3 py-2 rounded-md text-base font-medium transition-colors ${
                isActive(link.href)
                  ? 'text-emerald-700 bg-emerald-50 font-semibold'
                  : 'text-gray-700 hover:bg-gray-50 hover:text-emerald-600'
              }`}
            >
              {link.label}
            </Link>
          ))}
          <div className="pt-3 border-t border-gray-100 flex flex-col gap-2">
            <Button asChild className="w-full gap-2">
              <Link to="/login" onClick={() => setMobileMenuOpen(false)}>
                <LogIn className="w-4 h-4" />
                <span>{t('nav.login')}</span>
              </Link>
            </Button>
          </div>
        </div>
      )}
    </header>
  );
};
