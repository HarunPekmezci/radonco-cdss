export type Language = 'tr' | 'en';

export type TranslationDictionary = {
  nav: {
    cdss: string;
    academy: string;
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
  hero: {
    cdss: { badge: string; title: string; subtitle: string; description: string; bullet1: string; bullet2: string; bullet3: string; button: string; };
    academy: { badge: string; title: string; subtitle: string; description: string; bullet1: string; bullet2: string; bullet3: string; button: string; };
  };
  academy: {
    tabs: { hub: string; quizzes: string; flashcards: string; radiobiology: string; pearls: string; };
    pillars: { clinical: string; radiobiology: string; physics: string; };
  };
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
  workspaceView: {
    title: string;
    guidedWorkflow: string;
    guidedMode: string;
    fullMatrix: string;
  };
};

export const translations: Record<Language, TranslationDictionary> = {
  tr: {
    nav: {
      cdss: 'CDSS',
      academy: 'Akademi',
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
    heroBadge: 'RADONCO PORTAL',
    heroTitle: 'Klinik Karar & Onkoloji Akademisi',
    heroDescription: 'Radyasyon onkolojisi klinik karar desteği ve yeterlik sınavı / onkoloji eğitimi için birleşik çalışma istasyonu.',
    heroAction: 'Karar Destek Matrisini Aç',
    hero: {
      cdss: {
        badge: 'KLİNİK KARAR DESTEK',
        title: 'RadOnco CDSS',
        subtitle: 'Kanıta Dayalı Klinik Karar Destek Sistemi',
        description: 'MDR Kural 11 uyumlu, tam kural izlenebilirliği sunan deterministik radyoterapi karar motoru.',
        bullet1: '25+ Faz III Landmark Çalışma Havuzu',
        bullet2: 'EQD2 / BED Biyo-Eşdeğer Doz Matematiği',
        bullet3: 'Organa Özgü Risk ve Evreleme Motorları',
        button: 'CDSS Motorunu Başlat',
      },
      academy: {
        badge: 'EĞİTİM & SINAV HAZIRLIK',
        title: 'RadOnco Akademi',
        subtitle: 'İnteraktif Onkoloji Eğitimi & Yeterlik Sınavı Merkezi',
        description: 'Vaka temelli soru bankası, yüksek verimli landmark akıl kartları ve canlı radyobiyoloji/fizik laboratuvarı.',
        bullet1: 'Tıklanabilir DOI Bağlantılı PICO Vaka Havuzu',
        bullet2: '3D İnteraktif Akıl Kartları (Flashcards)',
        bullet3: 'Radyobiyolojik Doz & Fraksiyonasyon Hesaplayıcı',
        button: 'Akademiye Gir',
      },
    },
    academy: {
      tabs: {
        hub: 'Akademi Merkezi',
        quizzes: 'Vaka Soruları',
        flashcards: 'Akıl Kartları',
        radiobiology: 'LQ Laboratuvarı',
        pearls: 'Klinik İnciler',
      },
      pillars: {
        clinical: 'Klinik Onkoloji',
        radiobiology: 'Radyobiyoloji Laboratuvarı',
        physics: 'Tıbbi Radyofizik',
      },
    },
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
        title: 'Klinik Kılavuzlar & Kaynakça',
        description: 'NCCN 2025, ASTRO ve ESTRO güncel klinik kılavuzları ve dönüm noktası kanıtlar.',
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
    workspaceView: {
      title: 'Çalışma Görünümü',
      guidedWorkflow: 'Adım Adım Klinik Akış',
      guidedMode: 'Adım Adım Klinik Akış',
      fullMatrix: 'Tam Matris Görünümü',
    },
  },
  en: {
    nav: {
      cdss: 'CDSS',
      academy: 'Academy',
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
    heroBadge: 'RADONCO PORTAL',
    heroTitle: 'Clinical Decision Support & Oncology Academy',
    heroDescription: 'Unified clinical decision support and radiation oncology board training workstation.',
    heroAction: 'Open Decision Support Matrix',
    hero: {
      cdss: {
        badge: 'DECISION SUPPORT',
        title: 'RadOnco CDSS',
        subtitle: 'Evidence-Based Clinical Decision Support',
        description: 'Deterministic, guideline-adherent radiotherapy decision-making with full rule auditability and MDR Rule 11 compliance.',
        bullet1: '25+ Landmark Phase III Trials',
        bullet2: 'EQD2/BED Isoeffective Math',
        bullet3: 'Organ-Specific Risk Engines',
        button: 'Launch CDSS',
      },
      academy: {
        badge: 'EDUCATION & PREP',
        title: 'RadOnco Academy',
        subtitle: 'Interactive Oncology Education & Board Exam Prep',
        description: 'Case-based vignette quiz bank, high-yield landmark trial flashcards, and live radiobiology comparator.',
        bullet1: 'PICO Case Bank with Clickable DOIs',
        bullet2: '3D Interactive Flashcards',
        bullet3: 'Radiobiological Regimen Calculator',
        button: 'Enter Academy',
      },
    },
    academy: {
      tabs: {
        hub: 'Academy Hub',
        quizzes: 'Case Quizzes',
        flashcards: 'Flashcards',
        radiobiology: 'LQ Lab',
        pearls: 'Board Pearls',
      },
      pillars: {
        clinical: 'Clinical Oncology',
        radiobiology: 'Radiobiology Lab',
        physics: 'Medical Physics',
      },
    },
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
        title: 'Clinical Guidelines & References',
        description: 'NCCN 2025, ASTRO, and ESTRO clinical guidelines and landmark evidence.',
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
    workspaceView: {
      title: 'Workspace View',
      guidedWorkflow: 'Guided Clinical Workflow',
      guidedMode: 'Guided Clinical Workflow',
      fullMatrix: 'Full Matrix View',
    },
  },
};
