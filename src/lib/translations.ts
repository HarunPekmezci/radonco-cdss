export type Language = 'tr' | 'en';

export type TranslationDictionary = {
  nav: {
    cdss: string;
    constraints: string;
    calculator: string;
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
    palliative: { title: string; description: string; badges: string[] };
    references: { title: string; description: string; badges: string[] };
    toxicity: { title: string; description: string; badges: string[] };
  };
  rapidProtocols: {
    quickCaseId: 'case-05' | 'case-26' | 'case-01' | 'case-21';
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
    rapidProtocolsTitle: 'Sık Karşılaşılan Hızlı Klinik Protokoller (Rapid Protocols)',
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
        badges: ['eContour', 'RTOG Consensus'],
      },
      palliative: {
        title: 'Palyatif & Acil RT Protokolleri',
        description: 'Kemik metastazı tek doz (8 Gy), kord basısı, VCSS ve hemostatik palyasyon.',
        badges: ['Acil RT', 'ASTRO Palliative'],
      },
      references: {
        title: 'Kaynakça ve Kanıt Kütüphanesi',
        description: 'NCCN 2025, ASTRO ve ESTRO güncel klinik kılavuzları ve Faz III çalışmalar.',
        badges: ['Kılavuzlar', 'Faz III'],
      },
      toxicity: {
        title: 'Toksisite & Yan Etki Değerlendirme (CTCAE v5.0)',
        description: 'Radyasyon dermatiti, pnömonit, özofajit, mukozit ve proktit için CTCAE derecelendirmesi ve medikal yönetim rehberi.',
        badges: ['CTCAE v5.0', 'Akut & Geç Toksisite'],
      },
    },
    rapidProtocols: [
      {
        quickCaseId: 'case-05',
        title: 'Meme Kanserinde Hipofraksiyonasyon',
        dose: 'FAST-Forward · 26 Gy / 5 fx',
        details: 'T1-2 N0 M0 · Adjuvan tüm meme RT',
        tags: ['ADJUVAN', 'TÜM MEME'],
      },
      {
        quickCaseId: 'case-26',
        title: 'Prostat SBRT (Orta Risk)',
        dose: '36.25 Gy / 5 fx',
        details: 'Gün aşırı · PTV marjlı stereotaktik tedavi',
        tags: ['PACE-B', 'GÜN AŞIRI'],
      },
      {
        quickCaseId: 'case-01',
        title: 'Erken Evre Periferik KHDAK SBRT',
        dose: '54 Gy / 3 fx',
        details: 'T1b N0 M0 · Küratif altın standart · BED10 = 151.2 Gy',
        tags: ['KÜRATİF', 'PERİFERİK'],
      },
      {
        quickCaseId: 'case-21',
        title: 'Palyatif Kemik Metastazı',
        dose: '8 Gy / 1 fx',
        details: 'Hızlı ağrı kontrolü · Kategori 1 analjezik palyasyon',
        tags: ['TEK FRAKSİYON', 'ASTRO'],
      },
    ],
  },
  en: {
    nav: {
      cdss: 'CDSS',
      constraints: 'OAR Constraints',
      calculator: 'Dose Calculator',
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
      palliative: {
        title: 'Palliative & Emergency RT Protocols',
        description: 'Single-fraction bone metastasis RT (8 Gy), cord compression, VCSS, and hemostatic palliation.',
        badges: ['Emergency RT', 'ASTRO Palliative'],
      },
      references: {
        title: 'References & Evidence Library',
        description: 'Current NCCN 2025, ASTRO, and ESTRO guidelines and phase III studies.',
        badges: ['Guidelines', 'Phase III'],
      },
      toxicity: {
        title: 'Toxicity & Adverse Effects Assessment (CTCAE v5.0)',
        description: 'CTCAE grading and medical management guidance for radiation dermatitis, pneumonitis, esophagitis, mucositis, and proctitis.',
        badges: ['CTCAE v5.0', 'Acute & Late Toxicity'],
      },
    },
    rapidProtocols: [
      {
        quickCaseId: 'case-05',
        title: 'Hypofractionation for Breast Cancer',
        dose: 'FAST-Forward · 26 Gy / 5 fx',
        details: 'T1-2 N0 M0 · Adjuvant whole-breast RT',
        tags: ['ADJUVANT', 'WHOLE BREAST'],
      },
      {
        quickCaseId: 'case-26',
        title: 'Prostate SBRT (Intermediate Risk)',
        dose: '36.25 Gy / 5 fx',
        details: 'Alternate days · Stereotactic treatment with PTV margin',
        tags: ['PACE-B', 'ALTERNATE DAYS'],
      },
      {
        quickCaseId: 'case-01',
        title: 'Early-Stage Peripheral NSCLC SBRT',
        dose: '54 Gy / 3 fx',
        details: 'T1b N0 M0 · Curative standard · BED10 = 151.2 Gy',
        tags: ['CURATIVE', 'PERIPHERAL'],
      },
      {
        quickCaseId: 'case-21',
        title: 'Palliative Bone Metastasis',
        dose: '8 Gy / 1 fx',
        details: 'Rapid pain control · Category 1 analgesic palliation',
        tags: ['SINGLE FRACTION', 'ASTRO'],
      },
    ],
  },
};
