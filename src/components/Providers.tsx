// components/Providers.tsx
"use client";
import { I18nextProvider } from 'react-i18next';
import i18n from '../app/i18n';
import { ThemeProvider } from './index/ThemeProvider';

export function Providers({ 
  children,
  serverTheme 
}: { 
  children: React.ReactNode;
  serverTheme?: string;
}) {
  return (
    <I18nextProvider i18n={i18n}>
      <ThemeProvider serverTheme={serverTheme}>
        {children}
      </ThemeProvider>
    </I18nextProvider>
  );
}