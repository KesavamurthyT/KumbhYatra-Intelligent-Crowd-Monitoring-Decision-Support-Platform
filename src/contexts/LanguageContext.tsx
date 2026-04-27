import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { translations, Translations } from '../lib/translations';

type SupportedLanguage = 'en' | 'hi' | 'mr';

interface LanguageContextType {
  language: SupportedLanguage;
  setLanguage: (lang: SupportedLanguage) => void;
  t: Translations;
  translate: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

interface LanguageProviderProps {
  children: ReactNode;
}

export const LanguageProvider: React.FC<LanguageProviderProps> = ({ children }) => {
  const [language, setLanguageState] = useState<SupportedLanguage>('en');

  // Load language from localStorage on mount
  useEffect(() => {
    const savedLanguage = localStorage.getItem('kumbh-language') as SupportedLanguage;
    if (savedLanguage && translations[savedLanguage]) {
      setLanguageState(savedLanguage);
    }
  }, []);

  // Update language and save to localStorage
  const setLanguage = (lang: SupportedLanguage) => {
    setLanguageState(lang);
    localStorage.setItem('kumbh-language', lang);
    console.log(`🌐 Language changed to: ${lang}`);
  };

  // Get current translations
  const t = translations[language];

  // Helper function to get nested translation values
  const translate = (key: string): string => {
    try {
      const keys = key.split('.');
      let value: any = t;
      
      for (const k of keys) {
        value = value[k];
        if (value === undefined) {
          console.warn(`Translation key not found: ${key}`);
          return key; // Return the key itself as fallback
        }
      }
      
      if (typeof value === 'string') {
        return value;
      } else {
        console.warn(`Translation value is not a string: ${key}`);
        return key;
      }
    } catch (error) {
      console.warn(`Error getting translation for key: ${key}`, error);
      return key; // Return the key itself as fallback
    }
  };

  const value: LanguageContextType = {
    language,
    setLanguage,
    t,
    translate
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

// Type guard for supported languages
export const isSupportedLanguage = (lang: string): lang is SupportedLanguage => {
  return ['en', 'hi', 'mr'].includes(lang);
};

// Get language display name
export const getLanguageDisplayName = (lang: SupportedLanguage): string => {
  const languageNames = {
    en: 'English',
    hi: 'हिंदी',
    mr: 'मराठी'
  };
  return languageNames[lang];
};
