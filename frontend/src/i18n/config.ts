import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import enTranslation from './locales/en/translation.json';
import bnTranslation from './locales/bn/translation.json';

const resources = {
  bn: {
    translation: bnTranslation,
  },
  en: {
    translation: enTranslation,
  },
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'bn',
    supportedLngs: ['bn', 'en'],
    interpolation: {
      escapeValue: false, // React already protects against XSS
    },
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage'],
      lookupLocalStorage: 'i18nextLng',
    },
  });

const syncHtmlLang = (lng: string | undefined) => {
  if (typeof document !== 'undefined') {
    const active = lng?.startsWith('en') ? 'en' : 'bn';
    document.documentElement.lang = active;
    if (active === 'bn') {
      document.documentElement.classList.add('font-bengali');
      document.documentElement.classList.remove('font-sans');
    } else {
      document.documentElement.classList.add('font-sans');
      document.documentElement.classList.remove('font-bengali');
    }
  }
};

syncHtmlLang(i18n.language);
i18n.on('languageChanged', (lng) => {
  syncHtmlLang(lng);
});

export default i18n;
