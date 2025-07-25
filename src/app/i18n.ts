import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

i18n.use(initReactI18next).init({
  resources: {
    en: { translation: require('@/public/locales/en/translation.json') },
    fr: { translation: require('@/public/locales/fr/translation.json') },
    de: { translation: require('@/public/locales/de/translation.json') }
  },
  lng: 'en',
  fallbackLng: 'en',
  interpolation: { escapeValue: false }
});

export default i18n;