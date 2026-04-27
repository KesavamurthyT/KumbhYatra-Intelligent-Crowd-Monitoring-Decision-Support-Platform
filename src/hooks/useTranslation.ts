import { useLanguage } from '../contexts/LanguageContext';

/**
 * Custom hook for accessing translations in a more convenient way
 * 
 * @returns Object with translation functions and current language info
 * 
 * @example
 * ```tsx
 * const { t, translate, language, setLanguage } = useTranslation();
 * 
 * // Access nested translations directly
 * <h1>{t.onboarding.welcome.title}</h1>
 * 
 * // Use helper function for dynamic keys
 * <p>{translate('onboarding.welcome.description')}</p>
 * 
 * // Change language
 * setLanguage('hi');
 * ```
 */
export const useTranslation = () => {
  const { language, setLanguage, t, translate } = useLanguage();

  return {
    // Current language code (en, hi, mr)
    language,
    
    // Function to change language
    setLanguage,
    
    // Direct access to current language translations
    t,
    
    // Helper function to get translation by key path
    translate,
    
    // Convenience functions for common operations
    getCurrentLanguageName: () => {
      const names = {
        en: 'English',
        hi: 'हिंदी', 
        mr: 'मराठी'
      };
      return names[language];
    },
    
    // Check if current language is RTL (none of our supported languages are RTL, but for future)
    isRTL: () => false,
    
    // Get available languages
    getAvailableLanguages: () => [
      { code: 'en', name: 'English', native: 'English' },
      { code: 'hi', name: 'Hindi', native: 'हिंदी' },
      { code: 'mr', name: 'Marathi', native: 'मराठी' }
    ],
    
    // Format text with variables (simple string replacement)
    formatMessage: (key: string, variables?: Record<string, string | number>) => {
      let message = translate(key);
      
      if (variables) {
        Object.entries(variables).forEach(([key, value]) => {
          message = message.replace(`{${key}}`, String(value));
        });
      }
      
      return message;
    }
  };
};
