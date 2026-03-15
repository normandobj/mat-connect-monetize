import { createContext, useContext, useState, type ReactNode } from 'react';

type Language = 'pt' | 'en';

interface LanguageContextType {
  lang: Language;
  setLang: (lang: Language) => void;
  toggle: () => void;
}

const LanguageContext = createContext<LanguageContextType>({
  lang: 'pt',
  setLang: () => {},
  toggle: () => {},
});

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Language>(() => {
    const stored = localStorage.getItem('lang');
    return (stored === 'en' || stored === 'pt') ? stored : 'pt';
  });

  const setLang = (newLang: Language) => {
    setLangState(newLang);
    localStorage.setItem('lang', newLang);
  };

  const toggle = () => {
    const newLang = lang === 'en' ? 'pt' : 'en';
    setLang(newLang);
  };

  return (
    <LanguageContext.Provider value={{ lang, setLang, toggle }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}
