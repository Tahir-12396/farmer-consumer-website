import React, { createContext, useContext, useState, useEffect } from 'react';
import en from '../translations/en.json';
import te from '../translations/te.json';
import hi from '../translations/hi.json';
import api from '../services/api';

const translations = { en, te, hi };

const LanguageContext = createContext();

export const LanguageProvider = ({ children }) => {
  const [language, setLanguageState] = useState(() => {
    return localStorage.getItem('kd_language') || 'en';
  });

  const setLanguage = async (newLang) => {
    if (translations[newLang]) {
      setLanguageState(newLang);
      localStorage.setItem('kd_language', newLang);
      
      // If user logged in, persist to backend
      const token = localStorage.getItem('kd_token');
      if (token) {
        try {
          await api.put('/api/auth/language', { language: newLang });
        } catch (e) {
          // non-blocking
        }
      }
    }
  };

  const t = (key, fallback = '') => {
    const dict = translations[language] || translations.en;
    return dict[key] || translations.en[key] || fallback || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);
