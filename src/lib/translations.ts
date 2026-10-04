export type Language = 'tr' | 'en';

export type TranslationDictionary = {
  nav: {
    cdss: string;
    constraints: string;
    calculator: string;
    contouring: string;
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
  rapidProtocolsTitle: string;
  rapidProtocolsDescription: string;
  rapidProtocolsLaunch: string;
  cards: {
    oar: { title: string; description: string; badges: string[] };
    calculator: { title: string; description: string; badges: string[] };
    contouring: { title: string; description: string; badges: string[] };
    prognostic: { title: string; description: string; badges: string[] };
    references: { title: string; description: string; badges: string[] };
    toxicity: { title: string; description: string; badges: string[] };
  };
  rapidProtocols: {
    quickCaseId: 'case-06' | 'case-27' | 'case-02' | 'case-21';
    title: string;
    dose: string;
    details: string;
    tags: string[];
  }[];
};

export const translations: Record<Language, TranslationDictionary> = {
  tr: {
    nav: {
      cdss: 'CDSS',
      constraints: 'Doz Kısıtları',
      calculator: 'Doz Hesaplayıcı',
      contouring: 'Hedef Hacim',
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
    rapidProtocolsTitle: 'Sık Karşılaşılan Hızlı Klinik Protokoller',
    rapidProtocolsDescription: 'Poliklinik pratiğinde en sık uygulanan kanıta dayalı hızlı fraksiyonasyon şablonları.',
    rapidProtocolsLaunch: "CDSS'de vakayı aç",
    cards: {
      oar: {
        title: 'OAR Doz Kısıtları & Tolerans Atlası',
        description: 'Kritik organ kısıtları, QUANTEC, HyTEC ve stereotaktik toleranslar.',
        badges: ['QUANTEC', 'HyTEC'],
      },
      calculator: {
        title: 'Radyobiyoloji & Dozimetri Hesaplayıcı',
        description: 'BED, EQD2, alfa/beta oranları ve fraksiyonasyon şeması dönüştürücü.',
        badges: ['LQ Model', 'EQD2'],
      },
      contouring: {
        title: 'Hedef Hacim & Konturlama Atlası',
        description: 'eContour entegrasyonu, RTOG ve ESTRO hedef hacim konturlama rehberleri.',
        badges: ['eContour', 'RTOG'],
      },
      prognostic: {
        title: 'Klinik Skorlama & Prognostik İndeksler',
        description: 'DS-GPA, CAPRA ve RPA klinik karar destek araçları.',
        badges: ['DS-GPA', 'CAPRA', 'RPA'],
      },
      references: {
        title: 'Kaynakça ve Kanıt Kütüphanesi',
        description: 'NCCN 2025, ASTRO ve ESTRO güncel klinik kılavuzları ve Faz III çalışmalar.',
        badges: ['NCCN 2025', 'Faz III'],
      },
      toxicity: {
        title: 'Toksisite & Yan Etki Değerlendirme',
        description: 'Radyasyon dermatiti, pnömonit, özofajit, mukozit ve proktit için CTCAE derecelendirmesi ve medikal yönetim rehberi.',
        badges: ['CTCAE v5.0', 'Akut & Geç'],
      },
    },
    rapidProtocols: [
      {
        quickCaseId: 'case-06',
        title: 'Meme / Göğüs Duvarı',
        dose: '50 Gy / 25 fx',
        details: 'Adjuvan tüm meme / post-mastektomi',
        tags: ['ADJUVAN', 'GÖĞÜS DUVARI'],
      },
      {
        quickCaseId: 'case-27',
        title: 'Prostat SIB',
        dose: '70 Gy / 56 Gy / 28 fx',
        details: 'Ilımlı hipofraksiyonasyon + entegre boost',
        tags: ['SIB', '28 FRAKSİYON'],
      },
      {
        quickCaseId: 'case-02',
        title: 'Konvansiyonel Toraks (AC)',
        dose: '60 Gy / 30 fx',
        details: 'Lokal İleri KHDAK eşzamanlı KRT',
        tags: ['KEMORADYOTERAPİ', 'KHDAK'],
      },
      {
        quickCaseId: 'case-21',
        title: 'Palyatif Kemik Metastazı',
        dose: '8 Gy / 1 fx',
        details: 'Tek fraksiyon hızlı analjezik palyasyon',
        tags: ['TEK FRAKSİYON', 'ASTRO'],
      },
    ],
  },
  en: {
    nav: {
      cdss: 'CDSS',
      constraints: 'OAR Constraints',
      calculator: 'Dose Calculator',
      contouring: 'Target Volumes',
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
    rapidProtocolsTitle: 'Frequently Used Rapid Clinical Protocols',
    rapidProtocolsDescription: 'Evidence-based, rapid fractionation templates commonly used in outpatient practice.',
    rapidProtocolsLaunch: 'Open case in CDSS',
    cards: {
      oar: {
        title: 'OAR Dose Constraints & Tolerance Atlas',
        description: 'Critical organ constraints, QUANTEC, HyTEC, and stereotactic tolerances.',
        badges: ['QUANTEC', 'HyTEC'],
      },
      calculator: {
        title: 'Radiobiology & Dosimetry Calculator',
        description: 'BED, EQD2, alpha/beta ratios, and a fractionation scheme converter.',
        badges: ['LQ Model', 'EQD2'],
      },
      contouring: {
        title: 'Target Volume & Contouring Atlas',
        description: 'eContour integration and RTOG and ESTRO target-volume contouring guidance.',
        badges: ['eContour', 'RTOG Consensus'],
      },
      prognostic: {
        title: 'Clinical Scoring & Prognostic Indices',
        description: 'DS-GPA, CAPRA, and RPA clinical decision support tools.',
        badges: ['DS-GPA', 'CAPRA', 'RPA'],
      },
      references: {
        title: 'References & Evidence Library',
        description: 'Current NCCN 2025, ASTRO, and ESTRO guidelines and phase III studies.',
        badges: ['NCCN 2025', 'Phase III'],
      },
      toxicity: {
        title: 'Toxicity & Adverse Effects Assessment',
        description: 'CTCAE grading and medical management guidance for radiation dermatitis, pneumonitis, esophagitis, mucositis, and proctitis.',
        badges: ['CTCAE v5.0', 'Acute & Late'],
      },
    },
    rapidProtocols: [
      {
        quickCaseId: 'case-06',
        title: 'Breast / Chest Wall',
        dose: '50 Gy / 25 fx',
        details: 'Adjuvant whole breast / post-mastectomy',
        tags: ['ADJUVANT', 'CHEST WALL'],
      },
      {
        quickCaseId: 'case-27',
        title: 'Prostate SIB',
        dose: '70 Gy / 56 Gy / 28 fx',
        details: 'Moderate hypofractionation + integrated boost',
        tags: ['SIB', '28 FRACTIONS'],
      },
      {
        quickCaseId: 'case-02',
        title: 'Conventional Thorax (AC)',
        dose: '60 Gy / 30 fx',
        details: 'Locally advanced NSCLC concurrent CRT',
        tags: ['CHEMORADIOTHERAPY', 'NSCLC'],
      },
      {
        quickCaseId: 'case-21',
        title: 'Palliative Bone Metastasis',
        dose: '8 Gy / 1 fx',
        details: 'Single-fraction rapid analgesic palliation',
        tags: ['SINGLE FRACTION', 'ASTRO'],
      },
    ],
  },
};
