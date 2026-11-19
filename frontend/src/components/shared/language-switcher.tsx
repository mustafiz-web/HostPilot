import React from 'react';
import { useTranslation } from 'react-i18next';
import { Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';

export const LanguageSwitcher: React.FC = () => {
  const { i18n } = useTranslation();
  const currentLang = i18n.language?.startsWith('en') ? 'en' : 'bn';

  const toggleLanguage = () => {
    const nextLang = currentLang === 'bn' ? 'en' : 'bn';
    i18n.changeLanguage(nextLang);
  };

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={toggleLanguage}
      className="flex items-center gap-1.5 border-emerald-200 text-emerald-800 hover:bg-emerald-50 hover:text-emerald-900 transition-all font-medium text-xs h-8 px-2.5 sm:px-3"
      aria-label="Toggle language"
    >
      <Globe className="w-3.5 h-3.5 text-emerald-600" />
      <span>{currentLang === 'bn' ? 'English' : 'বাংলা'}</span>
    </Button>
  );
};
