import React, { createContext, useContext, useState, useEffect } from 'react';

export type AppLanguage = 'en' | 'hi' | 'gu' | 'ta';

export interface LanguageOption {
  code: AppLanguage;
  name: string;
  nativeName: string;
  flag: string;
  region: string;
}

export const APP_LANGUAGES: LanguageOption[] = [
  { code: 'en', name: 'English', nativeName: 'English (IN)', flag: '🌐', region: 'Global / All Mandis' },
  { code: 'hi', name: 'Hindi', nativeName: 'हिंदी', flag: '🇮🇳', region: 'Delhi, UP, MP, Punjab, Haryana' },
  { code: 'gu', name: 'Gujarati', nativeName: 'ગુજરાતી', flag: '🏭', region: 'Surat, Ahmedabad, Rajkot, Unjha' },
  { code: 'ta', name: 'Tamil', nativeName: 'தமிழ்', flag: '🌾', region: 'Chennai, Coimbatore, Madurai, Salem' },
];

interface Translations {
  [key: string]: {
    en: string;
    hi: string;
    gu: string;
    ta: string;
  };
}

export const UI_TRANSLATIONS: Translations = {
  // Navigation & Headers
  tagline: {
    en: 'Autonomous B2B Agentic Commerce & Escrow',
    hi: 'स्वायत्त बी2बी व्यापार और एस्क्रो प्रणाली',
    gu: 'સ્વાયત્ત B2B કોમર્સ અને સ્માર્ટ એસ્ક્રો',
    ta: 'தன்னாட்சி B2B வர்த்தகம் மற்றும் எஸ்க்ரோ'
  },
  home: {
    en: 'Home',
    hi: 'होम',
    gu: 'હોમ',
    ta: 'முகப்பு'
  },
  liveArena: {
    en: 'Live Arena',
    hi: 'लाइव नेगोशिएशन',
    gu: 'લાઈવ વાટાઘાટ',
    ta: 'நேரடி பேரம்'
  },
  invoicesVault: {
    en: 'Invoices Vault',
    hi: 'इनवॉइस वॉल्ट',
    gu: 'ઇન્વૉઇસ વૉલ્ટ',
    ta: 'விலைப்பட்டியல் வால்ட்'
  },
  compliance: {
    en: 'Compliance 6/6',
    hi: 'कानूनी अनुपालन 6/6',
    gu: 'કાનૂની અનુપાલન 6/6',
    ta: 'சட்ட இணக்கம் 6/6'
  },
  ondcGem: {
    en: 'ONDC & GeM',
    hi: 'ओएनडीसी एवं जीईएम',
    gu: 'ONDC અને GeM',
    ta: 'ONDC மற்றும் GeM'
  },
  tredsHub: {
    en: 'TReDS Factoring',
    hi: 'TReDS इनवॉइस डिस्काउंटिंग',
    gu: 'TReDS ફેક્ટરિંગ',
    ta: 'TReDS பணப்புழக்கம்'
  },
  judgeReel: {
    en: '60s Reel',
    hi: '60 सेकंड डेमो',
    gu: '60 સેકન્ડ રીલ',
    ta: '60 வினாடி ரீல்'
  },
  voiceAgent: {
    en: 'Voice Agent',
    hi: 'वॉयस असिस्टेंट',
    gu: 'વોઇસ એજન્ટ',
    ta: 'குரல் முகவர்'
  },
  whatsAppBot: {
    en: 'WhatsApp Bot',
    hi: 'व्हाट्सएप बॉट',
    gu: 'વોટ્સએપ બોટ',
    ta: 'வாட்ஸ்அப் பாட்'
  },
  // Hero section
  heroHeading: {
    en: 'Autonomous Wholesale Commerce for Indian Enterprises & Mandis',
    hi: 'भारतीय उद्यमों और मंडियों के लिए स्वायत्त थोक व्यापार',
    gu: 'ભારતીય વેપારીઓ અને મંડીઓ માટે સ્વાયત્ત હોલસેલ પ્લેટફોર્મ',
    ta: 'இந்திய நிறுவனங்களுக்கான தன்னாட்சி மொத்த வர்த்தக தளம்'
  },
  heroSubtitle: {
    en: 'Zero-loss SLA agentic negotiations with dual-key Razorpay escrow, Fastag GPS logistics, and automated Section 31 GST tax compliance.',
    hi: 'शून्य-नुकसान एसएलए नेगोशिएशन, रेज़रपे स्मार्ट एस्क्रो, फास्टैग जीपीएस लॉजिस्टिक्स एवं धारा 31 जीएसटी अनुपालन।',
    gu: 'ઝીરો-લોસ SLA એજન્ટ વાટાઘાટ, રેઝરપે સ્માર્ટ એસ્ક્રો, ફાસ્ટેગ જીપીએસ અને કાનૂની GST બિલિંગ.',
    ta: 'ரேஸர்பே ஸ்மார்ட் எஸ்க்ரோ, ஃபாஸ்டாக் ஜிபிஎஸ் மற்றும் சட்டபூர்வமான ஜிஎஸ்டி பில்லிங் கொண்ட வர்த்தக தளம்.'
  },
  startNegotiationBtn: {
    en: 'Start Live Trade SLA',
    hi: 'लाइव व्यापार शुरू करें',
    gu: 'લાઈવ સોદો શરૂ કરો',
    ta: 'வர்த்தகத்தை தொடங்கவும்'
  },
  tredsActionBtn: {
    en: 'Get Instant TReDS Liquidity',
    hi: 'तत्काल TReDS भुगतान पाएं',
    gu: 'TReDS ત્વરિત ચુકવણી મેળવો',
    ta: 'உடனடி பணப்புழக்கம் பெறுங்கள்'
  }
};

interface LanguageContextType {
  language: AppLanguage;
  setLanguage: (lang: AppLanguage) => void;
  t: (key: string) => string;
  activeLanguageConfig: LanguageOption;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<AppLanguage>(() => {
    const saved = localStorage.getItem('agentbazar_preferred_lang');
    return (saved as AppLanguage) || 'en';
  });

  const setLanguage = (lang: AppLanguage) => {
    setLanguageState(lang);
    localStorage.setItem('agentbazar_preferred_lang', lang);
  };

  const t = (key: string): string => {
    if (UI_TRANSLATIONS[key] && UI_TRANSLATIONS[key][language]) {
      return UI_TRANSLATIONS[key][language];
    }
    if (UI_TRANSLATIONS[key] && UI_TRANSLATIONS[key].en) {
      return UI_TRANSLATIONS[key].en;
    }
    return key;
  };

  const activeLanguageConfig = APP_LANGUAGES.find((l) => l.code === language) || APP_LANGUAGES[0];

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, activeLanguageConfig }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
