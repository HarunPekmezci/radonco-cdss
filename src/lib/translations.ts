export type Language = 'tr' | 'en';

export type TranslationDictionary = {
  nav: {
    cdss: string;
    constraints: string;
    calculator: string;
    assistant: string;
    references: string;
    disclaimer: string;
    privacy: string;
    contact: string;
    mainNavigation: string;
    languagePicker: string;
  };
  languageNames: {
    tr: string;
    en: string;
  };
  heroBadge: string;
  heroTitle: string;
  heroDescription: string;
  heroAction: string;
  sectionTitle: string;
  sectionDescription: string;
  portalBadge: string;
  cards: {
    oar: { title: string; description: string; badge: string };
    calculator: { title: string; description: string; badge: string };
    assistant: { title: string; description: string; badge: string };
    references: { title: string; description: string; badge: string };
    disclaimer: { title: string; description: string; badge: string };
    contact: { title: string; description: string; badge: string };
  };
};

export const translations: Record<Language, TranslationDictionary> = {
  tr: {
    nav: {
      cdss: 'CDSS',
      constraints: 'Doz Kısıtları',
      calculator: 'Doz Hesaplayıcı',
      assistant: 'AI Asistan',
      references: 'Kaynakça',
      disclaimer: 'Yasal Uyarı',
      privacy: 'Gizlilik',
      contact: 'İletişim',
      mainNavigation: 'Ana navigasyon',
      languagePicker: 'Dil seçimi',
    },
    languageNames: { tr: 'Türkçe', en: 'English' },
    heroBadge: 'ONCOLOGY DECISION & DOSIMETRY PORTAL',
    heroTitle: 'RadOnco CDSS',
    heroDescription: 'Radyasyon onkolojisi klinik karar desteği, dozimetri araçları ve kanıt kaynakları tek bir çalışma alanında. Tüm çıktılar klinik değerlendirmeyi desteklemek içindir; hekim kararının yerini almaz.',
    heroAction: 'Karar Destek Matrisini Aç',
    sectionTitle: 'Klinik araçlar ve kaynaklar',
    sectionDescription: 'Çalışma alanını seçerek devam edin.',
    portalBadge: 'RadOnco Portal',
    cards: {
      oar: {
        title: 'OAR Doz Kısıtları',
        description: 'Kritik organları bölge ve fraksiyonasyon şemasına göre arayın, doğrulanmış kaynak bağlamını inceleyin.',
        badge: 'QUANTEC · HyTEC',
      },
      calculator: {
        title: 'Radyobiyoloji Hesaplayıcı',
        description: 'BED, EQD2, şema karşılaştırması ve tedavi arası telafi hesaplarını çalıştırın.',
        badge: 'LQ Model',
      },
      assistant: {
        title: 'Onkoloji AI Asistanı',
        description: 'Kanıt odaklı istem şablonları ve güvenli klinik soru-cevap çalışma alanı.',
        badge: 'Kanıt odaklı',
      },
      references: {
        title: 'Kaynakça ve Kanıt Atlası',
        description: 'Kılavuzlar, dozimetri referansları ve temel klinik çalışmaları keşfedin.',
        badge: 'Kılavuzlar · Çalışmalar',
      },
      disclaimer: {
        title: 'Yasal Uyarı',
        description: 'Kullanım kapsamı, klinik sorumluluk ve hekim değerlendirmesi ilkeleri.',
        badge: 'Klinik yönetişim',
      },
      contact: {
        title: 'İletişim ve Katkı',
        description: 'Geri bildirim, hata bildirimi veya protokol katkısı iletin.',
        badge: 'Geri bildirim',
      },
    },
  },
  en: {
    nav: {
      cdss: 'CDSS',
      constraints: 'OAR Constraints',
      calculator: 'Dose Calculator',
      assistant: 'AI Assistant',
      references: 'References',
      disclaimer: 'Disclaimer',
      privacy: 'Privacy',
      contact: 'Contact',
      mainNavigation: 'Main navigation',
      languagePicker: 'Language selection',
    },
    languageNames: { tr: 'Türkçe', en: 'English' },
    heroBadge: 'ONCOLOGY DECISION & DOSIMETRY PORTAL',
    heroTitle: 'RadOnco CDSS',
    heroDescription: 'Radiation oncology clinical decision support, dosimetry tools and evidence sources in a unified workspace. All outputs support clinical evaluation; they do not replace clinician judgement.',
    heroAction: 'Open Decision Support Matrix',
    sectionTitle: 'Clinical tools and resources',
    sectionDescription: 'Select a workspace to proceed.',
    portalBadge: 'RadOnco Portal',
    cards: {
      oar: {
        title: 'OAR Dose Constraints',
        description: 'Search critical organs by region and fractionation scheme, and review verified source context.',
        badge: 'QUANTEC · HyTEC',
      },
      calculator: {
        title: 'Radiobiology Calculator',
        description: 'Calculate BED, EQD2, compare fractionation schemes, and estimate treatment-break compensation.',
        badge: 'LQ Model',
      },
      assistant: {
        title: 'Oncology AI Assistant',
        description: 'An evidence-led prompt library and a safe clinical question-and-answer workspace.',
        badge: 'Evidence-aware',
      },
      references: {
        title: 'References & Evidence Atlas',
        description: 'Explore guidelines, dosimetry references, and landmark clinical studies.',
        badge: 'Guidelines · Trials',
      },
      disclaimer: {
        title: 'Legal Disclaimer',
        description: 'Scope of use, clinical responsibility, and principles for clinician review.',
        badge: 'Clinical governance',
      },
      contact: {
        title: 'Contact & Feedback',
        description: 'Send feedback, report an issue, or contribute a protocol.',
        badge: 'Feedback',
      },
    },
  },
};
