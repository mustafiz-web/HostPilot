import React from 'react';
import { useTranslation } from 'react-i18next';
import { Building2, ShieldCheck, Heart } from 'lucide-react';
import { Link } from 'react-router-dom';

export const Footer: React.FC = () => {
  const { t } = useTranslation();

  return (
    <footer className="border-t border-emerald-100 bg-emerald-950 text-emerald-100">
      <div className="container mx-auto px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Column */}
          <div className="md:col-span-2 space-y-3">
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-600 text-white">
                <Building2 className="h-5 w-5" />
              </div>
              <span className="text-xl font-bold tracking-tight text-white">
                {t('brand.name')}
              </span>
            </div>
            <p className="text-sm text-emerald-300 max-w-sm">
              {t('brand.tagline')} — {t('hero.subtitle')}
            </p>
            <div className="flex items-center gap-2 text-xs text-emerald-400 pt-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>{t('footer.safe_reliable', 'Safe & Reliable Hostel Administration')}</span>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold uppercase tracking-wider text-white">
              {t('footer.quick_links', 'Quick Links')}
            </h4>
            <ul className="space-y-2 text-sm text-emerald-300">
              <li>
                <Link to="/rooms" className="hover:text-white transition-colors">
                  {t('nav.rooms')}
                </Link>
              </li>
              <li>
                <Link to="/facilities" className="hover:text-white transition-colors">
                  {t('nav.facilities')}
                </Link>
              </li>
              <li>
                <Link to="/admission" className="hover:text-white transition-colors">
                  {t('nav.admission')}
                </Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-white transition-colors">
                  {t('nav.contact')}
                </Link>
              </li>
            </ul>
          </div>

          {/* Portals */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold uppercase tracking-wider text-white">
              {t('footer.portal_access', 'Portal Access')}
            </h4>
            <ul className="space-y-2 text-sm text-emerald-300">
              <li>
                <Link to="/login" className="hover:text-white transition-colors">
                  {t('common.student_portal')}
                </Link>
              </li>
              <li>
                <Link to="/login" className="hover:text-white transition-colors">
                  {t('common.admin_portal')}
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 border-t border-emerald-900 pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-emerald-400 gap-4">
          <p>© {new Date().getFullYear()} Host Pilot. {t('footer.all_rights_reserved', 'All rights reserved.')}</p>
          <p className="flex items-center gap-1">
            Built with <Heart className="w-3.5 h-3.5 text-emerald-500 fill-emerald-500" /> for modern hostels
          </p>
        </div>
      </div>
    </footer>
  );
};
