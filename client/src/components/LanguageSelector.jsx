import React, { useState } from 'react';
import { Globe, Check } from 'lucide-react';
import { useAccessibility } from '../contexts/AccessibilityContext';

export default function LanguageSelector() {
  const { language, languages, changeLanguage } = useAccessibility();
  const [isOpen, setIsOpen] = useState(false);

  const handleLanguageChange = (langCode) => {
    changeLanguage(langCode);
    setIsOpen(false);
  };

  return (
    <div className="relative">
      {/* Current Language Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2 bg-white border-2 border-gray-300 rounded-lg hover:border-blue-500 transition-colors"
      >
        <Globe className="w-5 h-5 text-gray-600" />
        <span className="font-medium text-gray-700">
          {languages[language].flag} {languages[language].name.split(' ')[0]}
        </span>
        <svg 
          className={`w-4 h-4 text-gray-600 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 z-10" 
            onClick={() => setIsOpen(false)}
          />

          {/* Dropdown */}
          <div className="absolute right-0 mt-2 w-72 bg-white border-2 border-gray-200 rounded-lg shadow-xl z-20 max-h-96 overflow-y-auto">
            <div className="p-3 border-b border-gray-200">
              <h3 className="font-semibold text-gray-900">Select Language</h3>
              <p className="text-sm text-gray-500">Choose your preferred language</p>
            </div>

            <div className="p-2">
              {Object.entries(languages).map(([code, lang]) => (
                <button
                  key={code}
                  onClick={() => handleLanguageChange(code)}
                  className={`w-full flex items-center justify-between px-4 py-3 rounded-lg transition-colors ${
                    language === code
                      ? 'bg-blue-50 text-blue-700'
                      : 'hover:bg-gray-50 text-gray-700'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{lang.flag}</span>
                    <div className="text-left">
                      <p className="font-medium">{lang.name}</p>
                      <p className="text-xs text-gray-500">{lang.code}</p>
                    </div>
                  </div>
                  {language === code && (
                    <Check className="w-5 h-5 text-blue-600" />
                  )}
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}