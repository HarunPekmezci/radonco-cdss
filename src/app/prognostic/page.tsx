'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useLanguage } from '@/context/LanguageContext';
import {
  ArrowLeft,
  Activity,
  Brain,
  Bone,
  ActivitySquare,
  ChevronRight,
  Calculator,
  FileText,
  Sparkles,
  Dna,
  ShieldAlert,
  Info,
} from 'lucide-react';

export default function PrognosticPage() {
  const { language } = useLanguage();
  const lang = language === 'tr' ? 'tr' : 'en';

  const [activeTab, setActiveTab] = useState<'capra' | 'dsgpa' | 'mirels' | 'ecog' | 'npi'>('capra');

  // --- States for UCSF CAPRA ---
  const [capraAge, setCapraAge] = useState<number>(65);
  const [capraPSA, setCapraPSA] = useState<number>(8);
  const [capraGleason, setCapraGleason] = useState<'<=3+3' | '3+4' | '4+3' | '8-10'>('3+4');
  const [capraTStage, setCapraTStage] = useState<'T1-T2' | 'T3a'>('T1-T2');
  const [capraCores, setCapraCores] = useState<'<34' | '>=34'>('<34');

  // --- States for Modern ds-GPA (Molecular Models) ---
  const [gpaPrimary, setGpaPrimary] = useState<'NSCLC' | 'Breast' | 'Melanoma' | 'RCC' | 'GI'>('NSCLC');
  const [gpaAge, setGpaAge] = useState<number>(62);
  const [gpaKPS, setGpaKPS] = useState<number>(80);
  const [gpaMets, setGpaMets] = useState<'1' | '2-4' | '>=5'>('1');
  const [gpaExtracranial, setGpaExtracranial] = useState<'Absent' | 'Present'>('Absent');
  // Molecular biomarkers
  const [gpaEgfr, setGpaEgfr] = useState<'Negative' | 'Positive'>('Negative');
  const [gpaAlk, setGpaAlk] = useState<'Negative' | 'Positive'>('Negative');
  const [gpaBreastSubtype, setGpaBreastSubtype] = useState<'Basal' | 'LumA' | 'HER2'>('LumA');
  const [gpaBraf, setGpaBraf] = useState<'WildType' | 'Mutant'>('WildType');

  // --- States for Mirels ---
  const [mirelsSite, setMirelsSite] = useState<1 | 2 | 3>(2); // 1: Upper limb, 2: Lower limb, 3: Peritrochanteric
  const [mirelsPain, setMirelsPain] = useState<1 | 2 | 3>(2); // 1: Mild, 2: Moderate, 3: Functional / with weight-bearing
  const [mirelsLesion, setMirelsLesion] = useState<1 | 2 | 3>(2); // 1: Osteoblastic, 2: Mixed, 3: Osteolytic
  const [mirelsSize, setMirelsSize] = useState<1 | 2 | 3>(2); // 1: <1/3, 2: 1/3-2/3, 3: >2/3

  // --- States for NPI ---
  const [npiSize, setNpiSize] = useState<number>(2.0);
  const [npiNodes, setNpiNodes] = useState<1 | 2 | 3>(1); // 1: 0 nodes, 2: 1-3 nodes, 3: >3 nodes
  const [npiGrade, setNpiGrade] = useState<1 | 2 | 3>(2); // 1, 2, 3

  // --- ECOG State ---
  const [ecogScore, setEcogScore] = useState<number>(1);

  const t = (tr: string, en: string) => (lang === 'tr' ? tr : en);

  // === CALCULATORS ===

  // 1. UCSF CAPRA (Cooperberg MR, et al. Cancer 2005)
  const calcCapra = () => {
    let score = 0;

    // Age >= 50: 1 pt
    if (capraAge >= 50) score += 1;

    // PSA points: <6 (0), 6-10 (1), 10.1-20 (2), 20.1-30 (3), >30 (4)
    if (capraPSA > 6 && capraPSA <= 10) score += 1;
    else if (capraPSA > 10 && capraPSA <= 20) score += 2;
    else if (capraPSA > 20 && capraPSA <= 30) score += 3;
    else if (capraPSA > 30) score += 4;

    // Gleason: <=3+3 (0), 3+4 (1), 4+3 or 8-10 (3)
    if (capraGleason === '3+4') score += 1;
    else if (capraGleason === '4+3' || capraGleason === '8-10') score += 3;

    // Clinical T-stage: T1-T2 (0), T3a (1)
    if (capraTStage === 'T3a') score += 1;

    // Positive biopsy cores: <34% (0), >=34% (1)
    if (capraCores === '>=34') score += 1;

    let risk = 'Low';
    let riskColor = 'text-emerald-400';
    let recur5yr = '85–91%';
    let recur10yr = '80–85%';

    if (score >= 3 && score <= 5) {
      risk = 'Intermediate';
      riskColor = 'text-amber-400';
      recur5yr = '60–74%';
      recur10yr = '55–65%';
    } else if (score >= 6) {
      risk = 'High';
      riskColor = 'text-rose-400';
      recur5yr = '25–44%';
      recur10yr = '20–35%';
    }

    return { score, risk, riskColor, recur5yr, recur10yr };
  };

  // 2. Modern Diagnosis-Specific GPA (Sperduto et al., JAMA Oncol 2017 & JTO 2021)
  const calcGPA = () => {
    let rawScore = 0;
    let medianOS = '';
    let tier = '';
    let molecularNote = '';

    if (gpaPrimary === 'NSCLC') {
      // Lung-molGPA (2017/2021)
      // Age: <50 (1.0), 50-59 (0.5), >=60 (0)
      if (gpaAge < 50) rawScore += 1.0;
      else if (gpaAge < 60) rawScore += 0.5;

      // KPS: >=90 (1.0), 70-80 (0.5), <=60 (0)
      if (gpaKPS >= 90) rawScore += 1.0;
      else if (gpaKPS >= 70) rawScore += 0.5;

      // ECM: Absent (1.0), Present (0)
      if (gpaExtracranial === 'Absent') rawScore += 1.0;

      // Number of brain mets: 1 (1.0), 2-4 (0.5), >=5 (0)
      if (gpaMets === '1') rawScore += 1.0;
      else if (gpaMets === '2-4') rawScore += 0.5;

      // Molecular Alterations: EGFR+ (+1.0) or ALK+ (+1.0)
      const hasDriver = gpaEgfr === 'Positive' || gpaAlk === 'Positive';
      if (hasDriver) {
        rawScore += 1.0;
        molecularNote = gpaEgfr === 'Positive' && gpaAlk === 'Positive'
          ? t('EGFR & ALK pozitifliği (TKI hedefe yönelik tedavi adayı)', 'EGFR & ALK positive (TKI targeted therapy candidate)')
          : gpaEgfr === 'Positive'
          ? t('EGFR mutant pozitif (Osimertinib vb. TKI yanıtı yüksek)', 'EGFR mutant positive (High response to Osimertinib/TKIs)')
          : t('ALK translokasyonu pozitif (Alektinib/Brigatinib adayı)', 'ALK rearrangement positive (Alectinib/Brigatinib candidate)');
      }

      // Max score cap is 4.0
      const finalScore = Math.min(4.0, rawScore);

      if (finalScore >= 3.5) {
        tier = 'GPA 3.5 – 4.0 (Best)';
        medianOS = hasDriver
          ? t('46.8 ay (Sperduto JTO 2021 TKI kohortu)', '46.8 months (Sperduto JTO 2021 TKI cohort)')
          : t('25.3 ay', '25.3 months');
      } else if (finalScore >= 2.5) {
        tier = 'GPA 2.5 – 3.0';
        medianOS = hasDriver ? t('25.5 ay', '25.5 months') : t('17.2 ay', '17.2 months');
      } else if (finalScore >= 1.5) {
        tier = 'GPA 1.5 – 2.0';
        medianOS = hasDriver ? t('14.0 ay', '14.0 months') : t('9.4 ay', '9.4 months');
      } else {
        tier = 'GPA 0.0 – 1.0 (Worst)';
        medianOS = t('6.9 ay', '6.9 months');
      }

      return { score: finalScore.toFixed(1), medianOS, tier, molecularNote, model: 'Lung-molGPA (2017/2021)' };
    }

    if (gpaPrimary === 'Breast') {
      // Breast-GPA (Sperduto et al., 2020)
      // KPS: >=90 (1.5), 70-80 (1.0), <=60 (0)
      if (gpaKPS >= 90) rawScore += 1.5;
      else if (gpaKPS >= 70) rawScore += 1.0;

      // Age: <60 (0.5), >=60 (0)
      if (gpaAge < 60) rawScore += 0.5;

      // Brain Mets: 1 (0.5), >1 (0)
      if (gpaMets === '1') rawScore += 0.5;

      // Molecular Subtype: HER2+ (2.0), LumA ER+/PR+ (1.0), Basal/Triple Negative (0)
      if (gpaBreastSubtype === 'HER2') {
        rawScore += 2.0;
        molecularNote = t('HER2-zenginleşmiş / HER2+ (Trastuzumab/T-DXd ile belirgin uzun sağkalım)', 'HER2-enriched / HER2+ (Marked survival benefit with anti-HER2/T-DXd)');
      } else if (gpaBreastSubtype === 'LumA') {
        rawScore += 1.0;
        molecularNote = t('Luminal (ER+/PR+/HER2-) hormonal duyarlı subtip', 'Luminal (ER+/PR+/HER2-) hormone-responsive subtype');
      } else {
        molecularNote = t('Triple Negatif (Bazal-benzeri; en agresif klinik seyir)', 'Triple Negative (Basal-like; highest risk clinical course)');
      }

      const finalScore = Math.min(4.0, rawScore);

      if (finalScore >= 3.5) {
        tier = 'GPA 3.5 – 4.0';
        medianOS = t('25.3 – 36.5 ay (HER2+ vakalarda)', '25.3 – 36.5 months (in HER2+ cases)');
      } else if (finalScore >= 2.5) {
        tier = 'GPA 2.5 – 3.0';
        medianOS = t('15.3 ay', '15.3 months');
      } else if (finalScore >= 1.5) {
        tier = 'GPA 1.5 – 2.0';
        medianOS = t('7.7 ay', '7.7 months');
      } else {
        tier = 'GPA 0.0 – 1.0';
        medianOS = t('3.4 ay (TNBC agresif seyir)', '3.4 months (TNBC aggressive course)');
      }

      return { score: finalScore.toFixed(1), medianOS, tier, molecularNote, model: 'Breast-GPA (Sperduto 2020)' };
    }

    if (gpaPrimary === 'Melanoma') {
      // Melanoma-molGPA (Sperduto et al., 2017)
      // KPS: >=90 (1.0), 70-80 (0.5), <=60 (0)
      if (gpaKPS >= 90) rawScore += 1.0;
      else if (gpaKPS >= 70) rawScore += 0.5;

      // Number of brain mets: 1 (1.0), 2-4 (0.5), >=5 (0)
      if (gpaMets === '1') rawScore += 1.0;
      else if (gpaMets === '2-4') rawScore += 0.5;

      // Extracranial Mets: Absent (1.0), Present (0)
      if (gpaExtracranial === 'Absent') rawScore += 1.0;

      // BRAF Status: Mutant (1.0), WildType (0)
      if (gpaBraf === 'Mutant') {
        rawScore += 1.0;
        molecularNote = t('BRAF V600E Mutant (Dabrafenib/Trametinib & İmmünoterapi adayı)', 'BRAF V600E Mutant (Dabrafenib/Trametinib & Immunotherapy candidate)');
      } else {
        molecularNote = t('BRAF Wild-Type (İmmün kontrol noktası inhibitörleri adayı)', 'BRAF Wild-Type (Immune checkpoint inhibitor candidate)');
      }

      const finalScore = Math.min(4.0, rawScore);

      if (finalScore >= 3.5) {
        tier = 'GPA 3.5 – 4.0';
        medianOS = t('34.1 ay (BRAF mutant / IO cohort)', '34.1 months (BRAF mutant / IO cohort)');
      } else if (finalScore >= 2.5) {
        tier = 'GPA 2.5 – 3.0';
        medianOS = t('15.8 ay', '15.8 months');
      } else if (finalScore >= 1.5) {
        tier = 'GPA 1.5 – 2.0';
        medianOS = t('8.3 ay', '8.3 months');
      } else {
        tier = 'GPA 0.0 – 1.0';
        medianOS = t('4.9 ay', '4.9 months');
      }

      return { score: finalScore.toFixed(1), medianOS, tier, molecularNote, model: 'Melanoma-molGPA (2017)' };
    }

    if (gpaPrimary === 'RCC') {
      // RCC-GPA (Age and ECM are non-prognostic in RCC!)
      // KPS: >=90 (2.0), 80 (1.0), <=70 (0)
      if (gpaKPS >= 90) rawScore += 2.0;
      else if (gpaKPS === 80) rawScore += 1.0;

      // Brain Mets: 1-2 (2.0), 3-4 (1.0), >=5 (0)
      if (gpaMets === '1') rawScore += 2.0;
      else if (gpaMets === '2-4') rawScore += 1.0;

      const finalScore = Math.min(4.0, rawScore);

      if (finalScore >= 3.5) {
        tier = 'GPA 3.5 – 4.0';
        medianOS = t('14.8 ay', '14.8 months');
      } else if (finalScore >= 2.5) {
        tier = 'GPA 2.5 – 3.0';
        medianOS = t('11.3 ay', '11.3 months');
      } else if (finalScore >= 1.5) {
        tier = 'GPA 1.5 – 2.0';
        medianOS = t('7.3 ay', '7.3 months');
      } else {
        tier = 'GPA 0.0 – 1.0';
        medianOS = t('3.2 ay', '3.2 months');
      }

      molecularNote = t('RCC-GPA modelinde Yaş ve Ekstrakraniyal Hastalık prognostik bulunmamıştır.', 'Age and Extracranial Disease are statistically non-prognostic in RCC-GPA.');

      return { score: finalScore.toFixed(1), medianOS, tier, molecularNote, model: 'RCC-GPA (Sperduto et al.)' };
    }

    // GI-GPA
    // KPS: >=90 (1.5), 70-80 (0.5), <=60 (0)
    if (gpaKPS >= 90) rawScore += 1.5;
    else if (gpaKPS >= 70) rawScore += 0.5;

    // Age: <60 (0.5), >=60 (0)
    if (gpaAge < 60) rawScore += 0.5;

    // Brain Mets: 1 (1.0), 2-4 (0.5), >=5 (0)
    if (gpaMets === '1') rawScore += 1.0;
    else if (gpaMets === '2-4') rawScore += 0.5;

    // ECM: Absent (1.0), Present (0)
    if (gpaExtracranial === 'Absent') rawScore += 1.0;

    const finalScore = Math.min(4.0, rawScore);

    if (finalScore >= 3.5) {
      tier = 'GPA 3.5 – 4.0';
      medianOS = t('13.7 ay', '13.7 months');
    } else if (finalScore >= 2.5) {
      tier = 'GPA 2.5 – 3.0';
      medianOS = t('6.9 ay', '6.9 months');
    } else if (finalScore >= 1.5) {
      tier = 'GPA 1.5 – 2.0';
      medianOS = t('4.4 ay', '4.4 months');
    } else {
      tier = 'GPA 0.0 – 1.0';
      medianOS = t('3.1 ay', '3.1 months');
    }

    return { score: finalScore.toFixed(1), medianOS, tier, molecularNote: '', model: 'GI-GPA (Sperduto et al.)' };
  };

  // 3. Mirels Scoring (Mirels H. Clin Orthop Relat Res 1989)
  const calcMirels = () => {
    const sum = mirelsSite + mirelsPain + mirelsLesion + mirelsSize;
    let rec = '';
    let riskPercent = '';
    let recClass = '';

    if (sum <= 7) {
      riskPercent = '< 4%';
      rec = t(
        'Radyoterapi tek başına güvenle uygulanabilir. (Kırık riski <%5, cerrahi fiksasyon gerekmez).',
        'Radiotherapy alone is safe. (<5% fracture risk; prophylactic fixation not indicated).'
      );
      recClass = 'bg-emerald-950/40 border-emerald-500/50 text-emerald-200';
    } else if (sum === 8) {
      riskPercent = '15%';
      rec = t(
        'Klinik değerlendirme / Sınırda risk (~%15 kırık riski). Hastanın beklenen yaşam süresi, lezyon lokalizasyonu ve ortopedi konsültasyonuyla multidisipliner karar önerilir.',
        'Clinical judgment / Borderline risk (~15% fracture risk). Multidisciplinary orthopedic consult and personalized assessment advised.'
      );
      recClass = 'bg-amber-950/40 border-amber-500/50 text-amber-200';
    } else {
      riskPercent = sum === 9 ? '33%' : sum === 10 ? '68%' : '> 73%';
      rec = t(
        'RT ÖNCESİ PROFİLAKTİK CERRAHİ FİKSASYON ÖNERİLİR. (Yüksek kırık riski; önce cerrahi stabilizasyon, ardından postoperatif RT).',
        'PROPHYLACTIC SURGICAL FIXATION STRONGLY RECOMMENDED PRIOR TO RT. (High fracture risk; surgical stabilization followed by postop RT).'
      );
      recClass = 'bg-rose-950/40 border-rose-500/50 text-rose-200 font-bold';
    }

    return { score: sum, rec, riskPercent, recClass };
  };

  // 4. Nottingham Prognostic Index (NPI)
  const calcNPI = () => {
    const score = npiSize * 0.2 + npiNodes + npiGrade;
    let stratum = t('Mükemmel Prognostik Grup', 'Excellent Prognostic Group');
    let os = '95%';
    if (score > 3.4 && score <= 4.4) {
      stratum = t('İyi Prognostik Grup', 'Good Prognostic Group');
      os = '85%';
    } else if (score > 4.4 && score <= 5.4) {
      stratum = t('Orta Prognostik Grup', 'Moderate Prognostic Group');
      os = '70%';
    } else if (score > 5.4) {
      stratum = t('Kötü Prognostik Grup', 'Poor Prognostic Group');
      os = '50%';
    }
    return { score: score.toFixed(2), stratum, os };
  };

  // 5. ECOG <-> KPS <-> PPS
  const ecogMap = [
    { ecog: 0, kps: 100, pps: 100, desc: t('Tamamen aktif, semptomsuz normal yaşam', 'Fully active, able to carry on all pre-disease activities') },
    { ecog: 1, kps: 80, pps: 80, desc: t('Zorlu fiziksel aktivitede kısıtlı; ayakta, hafif ev/ofis işlerini yapabilir', 'Restricted in physically strenuous activity; ambulatory, light work') },
    { ecog: 2, kps: 60, pps: 60, desc: t('Ambulatuvar, kendi özbakımını yapabilir; günün >%50 ayakta', 'Ambulatory, capable of all selfcare; up and about >50% of waking hours') },
    { ecog: 3, kps: 40, pps: 40, desc: t('Sınırlı özbakım; günün >%50 yatağa veya sandalyeye bağımlı', 'Capable of only limited selfcare; confined to bed/chair >50% of waking hours') },
    { ecog: 4, kps: 20, pps: 20, desc: t('Tamamen yatağa bağımlı, özbakım yok', 'Completely disabled, cannot carry on any selfcare; totally bedbound') },
  ];
  const activeEcog = ecogMap[ecogScore];

  return (
    <main className="min-h-screen bg-[#050B14] font-sans selection:bg-sky-500/30">
      {/* Background ambient lighting */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-sky-900/10 blur-[120px]" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-fuchsia-900/10 blur-[120px]" />
      </div>

      <div className="relative z-10 w-full max-w-[1400px] mx-auto px-4 py-6 md:px-8 md:py-10">
        {/* Header */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10 pb-6 border-b border-slate-800">
          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="p-3 rounded-xl bg-slate-900/80 border border-slate-700/50 hover:bg-slate-800 hover:border-slate-600 transition-all text-slate-300"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <div className="text-sky-400 text-xs font-bold tracking-[0.2em] uppercase mb-1 flex items-center gap-2">
                <Calculator className="w-3.5 h-3.5" />
                {t('Klinik Skorlama ve Prognostik Motor', 'Clinical Scoring & Prognostic Engine')}
              </div>
              <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
                {t('Prognostik İndeksler', 'Prognostic Indices')}
              </h1>
            </div>
          </div>
          <Link
            href="/cdss"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-sky-600/10 border border-sky-500/30 text-sky-400 font-semibold hover:bg-sky-600/20 hover:border-sky-500/50 transition-all group shadow-[0_0_20px_rgba(14,165,233,0.15)]"
          >
            <Sparkles className="w-4 h-4" />
            {t('CDSS Kılavuzlarına Git', 'Launch CDSS')}
            <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </header>

        {/* Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
          {/* Sidebar Nav */}
          <aside className="lg:col-span-3 xl:col-span-3">
            <nav className="flex flex-col gap-2 sticky top-10">
              {[
                { id: 'capra', icon: Activity, title: 'UCSF CAPRA', subtitle: t('Prostat Kanseri Risk', 'Prostate Cancer Risk') },
                { id: 'dsgpa', icon: Brain, title: 'ds-GPA (Moleküler)', subtitle: t('Beyin Metastazları (Sperduto)', 'Brain Mets (Sperduto)') },
                { id: 'mirels', icon: Bone, title: 'Mirels', subtitle: t('Kemik Met. Fraktür Riski', 'Bone Met Fracture Risk') },
                { id: 'npi', icon: FileText, title: 'Nottingham (NPI)', subtitle: t('Meme Kanseri', 'Breast Cancer') },
                { id: 'ecog', icon: ActivitySquare, title: 'ECOG ⟷ KPS', subtitle: t('Performans Skoru', 'Performance Scale') },
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-start gap-3 p-4 rounded-2xl border text-left transition-all ${
                    activeTab === tab.id
                      ? 'bg-sky-900/20 border-sky-500/40 shadow-[0_0_20px_rgba(14,165,233,0.1)]'
                      : 'bg-[#0f172a]/60 border-slate-800 hover:bg-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className={`p-2 rounded-xl mt-0.5 ${activeTab === tab.id ? 'bg-sky-500/20 text-sky-400' : 'bg-slate-800 text-slate-400'}`}>
                    <tab.icon className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className={`font-bold ${activeTab === tab.id ? 'text-sky-300' : 'text-slate-300'}`}>{tab.title}</h3>
                    <p className="text-xs text-slate-500 font-medium mt-0.5">{tab.subtitle}</p>
                  </div>
                </button>
              ))}
            </nav>
          </aside>

          {/* Main Content */}
          <section className="lg:col-span-9 xl:col-span-9">
            <div className="bg-[#0b1221] border border-slate-800/80 rounded-3xl p-6 md:p-10 shadow-2xl">
              {/* CAPRA */}
              {activeTab === 'capra' && (
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <div className="mb-8">
                    <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-sky-400 mb-1">
                      <span>Cooperberg et al., Cancer 2005</span>
                    </div>
                    <h2 className="text-2xl font-bold text-white mb-2">{t('UCSF CAPRA Skoru (Prostat)', 'UCSF CAPRA Score (Prostate)')}</h2>
                    <p className="text-slate-400 text-sm">
                      {t(
                        'Lokalize prostat kanseri için biyokimyasal nüks risksiz sağkalım (bRFS) tahmin motoru (5 tam parametre).',
                        'Validated prognostic tool for predicting biochemical recurrence-free survival (bRFS) in localized prostate cancer (all 5 parameters).'
                      )}
                    </p>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-6">
                      <div>
                        <div className="flex justify-between items-center mb-2">
                          <label className="text-sm font-semibold text-slate-300">{t('1. Tanı Yaşı', '1. Age at Diagnosis')}</label>
                          <span className="text-xs font-mono font-bold text-sky-400">{capraAge} {t('yaş', 'yo')} ({capraAge >= 50 ? '+1 pt' : '0 pt'})</span>
                        </div>
                        <input
                          type="range"
                          min="40"
                          max="85"
                          value={capraAge}
                          onChange={e => setCapraAge(Number(e.target.value))}
                          className="w-full accent-sky-500"
                        />
                        <div className="flex justify-between text-[11px] text-slate-500 mt-1">
                          <span>&lt; 50 (0 pt)</span>
                          <span>≥ 50 (+1 pt)</span>
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-slate-300 mb-2">{t('2. Başlangıç PSA Değeri', '2. Baseline PSA')} (ng/mL)</label>
                        <input
                          type="number"
                          step="0.1"
                          value={capraPSA}
                          onChange={e => setCapraPSA(Number(e.target.value))}
                          className="w-full bg-[#131f33] border border-slate-700 rounded-lg p-3 text-white focus:border-sky-500 focus:ring-1 focus:ring-sky-500 outline-none font-mono"
                        />
                        <div className="flex flex-wrap gap-2 text-[10px] text-slate-400 mt-1.5">
                          <span className={capraPSA <= 6 ? 'text-sky-300 font-bold' : ''}>&lt;6 (0 pt)</span> ·
                          <span className={capraPSA > 6 && capraPSA <= 10 ? 'text-sky-300 font-bold' : ''}>6–10 (+1 pt)</span> ·
                          <span className={capraPSA > 10 && capraPSA <= 20 ? 'text-sky-300 font-bold' : ''}>10.1–20 (+2 pts)</span> ·
                          <span className={capraPSA > 20 && capraPSA <= 30 ? 'text-sky-300 font-bold' : ''}>20.1–30 (+3 pts)</span> ·
                          <span className={capraPSA > 30 ? 'text-sky-300 font-bold' : ''}>&gt;30 (+4 pts)</span>
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-slate-300 mb-2">{t('3. Biyopsi Gleason Skoru', '3. Biopsy Gleason Score')}</label>
                        <select
                          value={capraGleason}
                          onChange={e => setCapraGleason(e.target.value as any)}
                          className="w-full bg-[#131f33] border border-slate-700 rounded-lg p-3 text-white outline-none"
                        >
                          <option value="<=3+3">≤ 3+3 (Grade Group 1) · 0 pt</option>
                          <option value="3+4">3+4 (Grade Group 2 - Sekonder Pattern 4) · +1 pt</option>
                          <option value="4+3">4+3 (Grade Group 3 - Primer Pattern 4) · +3 pts</option>
                          <option value="8-10">8–10 (Grade Group 4-5 - Primer/Sekonder Pattern 5) · +3 pts</option>
                        </select>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-semibold text-slate-300 mb-2">{t('4. Klinik T Evresi', '4. Clinical T-Stage')}</label>
                          <select
                            value={capraTStage}
                            onChange={e => setCapraTStage(e.target.value as any)}
                            className="w-full bg-[#131f33] border border-slate-700 rounded-lg p-3 text-white outline-none"
                          >
                            <option value="T1-T2">cT1 / cT2 (0 pt)</option>
                            <option value="T3a">cT3a (+1 pt)</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-slate-300 mb-2">{t('5. Pozitif Kor Yüzdesi', '5. % Positive Cores')}</label>
                          <select
                            value={capraCores}
                            onChange={e => setCapraCores(e.target.value as any)}
                            className="w-full bg-[#131f33] border border-slate-700 rounded-lg p-3 text-white outline-none"
                          >
                            <option value="<34">&lt; 34% (0 pt)</option>
                            <option value=">=34">≥ 34% (+1 pt)</option>
                          </select>
                        </div>
                      </div>
                    </div>

                    <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 flex flex-col justify-between items-center text-center">
                      <div className="w-full">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                          {t('TOPLAM UCSF CAPRA SKORU', 'TOTAL UCSF CAPRA SCORE')}
                        </span>
                        <div className="w-24 h-24 rounded-full border-4 border-sky-500/30 flex items-center justify-center my-4 mx-auto shadow-[0_0_25px_rgba(14,165,233,0.2)]">
                          <span className="text-4xl font-black text-sky-400">{calcCapra().score}</span>
                        </div>
                        <p className="text-xs text-slate-400">{t('Maksimum: 10 Puan', 'Score Range: 0 – 10 Points')}</p>
                      </div>

                      <div className="w-full py-4 border-y border-slate-800 my-4">
                        <div className="text-xs uppercase font-bold text-slate-400 mb-1">{t('Risk Stratifikasyonu', 'Risk Stratification')}</div>
                        <div className={`text-xl font-extrabold ${calcCapra().riskColor}`}>
                          {calcCapra().risk} {t('Risk', 'Risk')} ({calcCapra().score <= 2 ? '0–2' : calcCapra().score <= 5 ? '3–5' : '6–10'})
                        </div>
                      </div>

                      <div className="w-full grid grid-cols-2 gap-3 text-left bg-slate-950/40 p-3 rounded-xl border border-slate-800/80">
                        <div>
                          <div className="text-[10px] text-slate-400 font-semibold">{t('5-Yıllık bRFS', '5-Year bRFS')}</div>
                          <div className="text-lg font-bold text-emerald-400">{calcCapra().recur5yr}</div>
                        </div>
                        <div>
                          <div className="text-[10px] text-slate-400 font-semibold">{t('10-Yıllık bRFS', '10-Year bRFS')}</div>
                          <div className="text-lg font-bold text-cyan-400">{calcCapra().recur10yr}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* ds-GPA */}
              {activeTab === 'dsgpa' && (
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <div className="mb-8">
                    <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-fuchsia-400 mb-1">
                      <Dna className="w-4 h-4" />
                      <span>{calcGPA().model}</span>
                    </div>
                    <h2 className="text-2xl font-bold text-white mb-2">
                      {t('Modern Moleküler ds-GPA Skoru', 'Modern Molecular ds-GPA Score')}
                    </h2>
                    <p className="text-slate-400 text-sm">
                      {t(
                        'Beyin metastazlarında tanıya özgü ve moleküler biyobelirteçli Graded Prognostic Assessment (Sperduto et al., JAMA Oncol 2017 & JTO 2021).',
                        'Diagnosis-specific Graded Prognostic Assessment with integrated molecular driver alterations (Sperduto et al., JAMA Oncol 2017 & JTO 2021).'
                      )}
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-5">
                      {/* Primer Seçimi */}
                      <div>
                        <label className="block text-sm font-semibold text-slate-300 mb-2">{t('Primer Tümör Tipi', 'Primary Tumor Type')}</label>
                        <select
                          value={gpaPrimary}
                          onChange={e => setGpaPrimary(e.target.value as any)}
                          className="w-full bg-[#131f33] border border-slate-700 rounded-lg p-3 text-white outline-none focus:border-fuchsia-500 font-semibold"
                        >
                          <option value="NSCLC">NSCLC · Akciğer (EGFR / ALK moleküler model)</option>
                          <option value="Breast">Breast · Meme (HER2 & Hormon Reseptör modeli)</option>
                          <option value="Melanoma">Melanoma · Melanom (BRAF V600E moleküler model)</option>
                          <option value="RCC">Renal Cell Carcinoma · RCC (KPS & Met sayısı modeli)</option>
                          <option value="GI">GI · Gastrointestinal</option>
                        </select>
                      </div>

                      {/* Ortak Parametreler: KPS */}
                      <div>
                        <div className="flex justify-between items-center mb-1">
                          <label className="text-sm font-semibold text-slate-300">KPS ({gpaKPS}%)</label>
                          <span className="text-xs text-fuchsia-400 font-mono font-bold">
                            {gpaKPS >= 90 ? (gpaPrimary === 'RCC' ? '+2.0 pts' : gpaPrimary === 'Breast' || gpaPrimary === 'GI' ? '+1.5 pts' : '+1.0 pt') : gpaKPS >= 70 ? (gpaPrimary === 'RCC' ? (gpaKPS === 80 ? '+1.0 pt' : '0 pt') : gpaPrimary === 'Breast' ? '+1.0 pt' : '+0.5 pt') : '0 pt'}
                          </span>
                        </div>
                        <input
                          type="range"
                          min="30"
                          max="100"
                          step="10"
                          value={gpaKPS}
                          onChange={e => setGpaKPS(Number(e.target.value))}
                          className="w-full accent-fuchsia-500"
                        />
                        <div className="flex justify-between text-[10px] text-slate-500">
                          <span>≤ 60 (Düşük)</span>
                          <span>70–80 (Orta)</span>
                          <span>90–100 (Yüksek)</span>
                        </div>
                      </div>

                      {/* Yaş: RCC harici tüm modellerde aktif */}
                      {gpaPrimary !== 'RCC' && (
                        <div>
                          <div className="flex justify-between items-center mb-1">
                            <label className="text-sm font-semibold text-slate-300">{t('Hasta Yaşı', 'Patient Age')} ({gpaAge})</label>
                            <span className="text-xs text-fuchsia-400 font-mono font-bold">
                              {gpaPrimary === 'NSCLC' ? (gpaAge < 50 ? '+1.0 pt' : gpaAge < 60 ? '+0.5 pt' : '0 pt') : (gpaAge < 60 ? '+0.5 pt' : '0 pt')}
                            </span>
                          </div>
                          <input
                            type="range"
                            min="20"
                            max="90"
                            value={gpaAge}
                            onChange={e => setGpaAge(Number(e.target.value))}
                            className="w-full accent-fuchsia-500"
                          />
                        </div>
                      )}

                      {/* Beyin Met Sayısı */}
                      <div>
                        <label className="block text-sm font-semibold text-slate-300 mb-2">{t('Beyin Metastazı Sayısı', 'Number of Brain Mets')}</label>
                        <div className="grid grid-cols-3 gap-2">
                          {(['1', '2-4', '>=5'] as const).map(opt => (
                            <button
                              key={opt}
                              type="button"
                              onClick={() => setGpaMets(opt)}
                              className={`py-2 rounded-lg text-xs font-bold border transition-colors ${
                                gpaMets === opt ? 'bg-fuchsia-600 border-fuchsia-400 text-white' : 'bg-[#131f33] border-slate-700 text-slate-300'
                              }`}
                            >
                              {opt === '>=5' ? '≥ 5' : opt}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Ekstrakraniyal Hastalık: RCC haricinde prognostik */}
                      {gpaPrimary !== 'RCC' && (
                        <div>
                          <label className="block text-sm font-semibold text-slate-300 mb-2">{t('Ekstrakraniyal Metastaz', 'Extracranial Metastases')}</label>
                          <div className="grid grid-cols-2 gap-2">
                            {(['Absent', 'Present'] as const).map(opt => (
                              <button
                                key={opt}
                                type="button"
                                onClick={() => setGpaExtracranial(opt)}
                                className={`py-2 rounded-lg text-xs font-bold border transition-colors ${
                                  gpaExtracranial === opt ? 'bg-fuchsia-600 border-fuchsia-400 text-white' : 'bg-[#131f33] border-slate-700 text-slate-300'
                                }`}
                              >
                                {opt === 'Absent' ? t('Yok (Absent · +1.0 pt)', 'Absent (+1.0 pt)') : t('Var (Present · 0 pt)', 'Present (0 pt)')}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* DİNAMİK MOLEKÜLER KRİTERLER */}
                      {gpaPrimary === 'NSCLC' && (
                        <div className="p-4 rounded-xl border border-sky-500/30 bg-sky-950/20 space-y-3">
                          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-sky-400">
                            <Dna className="w-4 h-4" />
                            <span>{t('NSCLC Moleküler Sürücüler (Lung-molGPA 2017/2021)', 'NSCLC Molecular Drivers (Lung-molGPA)')}</span>
                          </div>
                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <label className="block text-[11px] font-semibold text-slate-300 mb-1">EGFR Mutasyonu</label>
                              <select
                                value={gpaEgfr}
                                onChange={e => setGpaEgfr(e.target.value as any)}
                                className="w-full bg-[#131f33] border border-slate-700 rounded-lg p-2 text-xs text-white outline-none"
                              >
                                <option value="Negative">Negatif / Wild-type (0 pt)</option>
                                <option value="Positive">Pozitif / Mutant (+1.0 pt)</option>
                              </select>
                            </div>
                            <div>
                              <label className="block text-[11px] font-semibold text-slate-300 mb-1">ALK Translokasyonu</label>
                              <select
                                value={gpaAlk}
                                onChange={e => setGpaAlk(e.target.value as any)}
                                className="w-full bg-[#131f33] border border-slate-700 rounded-lg p-2 text-xs text-white outline-none"
                              >
                                <option value="Negative">Negatif (0 pt)</option>
                                <option value="Positive">Pozitif (+1.0 pt)</option>
                              </select>
                            </div>
                          </div>
                        </div>
                      )}

                      {gpaPrimary === 'Breast' && (
                        <div className="p-4 rounded-xl border border-pink-500/30 bg-pink-950/20 space-y-2">
                          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-pink-400">
                            <Dna className="w-4 h-4" />
                            <span>{t('Meme Moleküler Subtipi (Breast-GPA)', 'Breast Molecular Subtype (Breast-GPA)')}</span>
                          </div>
                          <select
                            value={gpaBreastSubtype}
                            onChange={e => setGpaBreastSubtype(e.target.value as any)}
                            className="w-full bg-[#131f33] border border-slate-700 rounded-lg p-2.5 text-xs text-white outline-none"
                          >
                            <option value="HER2">HER2-Pozitif (Herhangi bir ER/PR) · +2.0 pts</option>
                            <option value="LumA">Luminal A/B (ER+ veya PR+, HER2-) · +1.0 pt</option>
                            <option value="Basal">Triple Negatif (ER-, PR-, HER2-) · 0 pt</option>
                          </select>
                        </div>
                      )}

                      {gpaPrimary === 'Melanoma' && (
                        <div className="p-4 rounded-xl border border-amber-500/30 bg-amber-950/20 space-y-2">
                          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-400">
                            <Dna className="w-4 h-4" />
                            <span>{t('Melanom BRAF Durumu (Melanoma-molGPA)', 'Melanoma BRAF Status (Melanoma-molGPA)')}</span>
                          </div>
                          <select
                            value={gpaBraf}
                            onChange={e => setGpaBraf(e.target.value as any)}
                            className="w-full bg-[#131f33] border border-slate-700 rounded-lg p-2.5 text-xs text-white outline-none"
                          >
                            <option value="WildType">BRAF Wild-Type (0 pt)</option>
                            <option value="Mutant">BRAF V600E Mutant (+1.0 pt)</option>
                          </select>
                        </div>
                      )}

                      {gpaPrimary === 'RCC' && (
                        <div className="p-3 rounded-xl border border-slate-800 bg-slate-900/40 text-xs text-slate-400 flex items-start gap-2">
                          <Info className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                          <span>{t('RCC-GPA modelinde istatistiksel analizlerde Yaş ve Ekstrakraniyal Hastalık bağımsız prognostik bulunmamış; yalnızca KPS ve Beyin Met Sayısı skorlamaya dahil edilmiştir.', 'In RCC-GPA, Age and Extracranial Disease are statistically non-prognostic; only KPS and Brain Met count are incorporated.')}</span>
                        </div>
                      )}
                    </div>

                    <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 flex flex-col justify-between items-center text-center">
                      <div className="w-full">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                          {t('HESAPLANAN ds-GPA SKORU', 'CALCULATED ds-GPA SCORE')}
                        </span>
                        <div className="w-24 h-24 rounded-full border-4 border-fuchsia-500/30 flex items-center justify-center my-4 mx-auto shadow-[0_0_25px_rgba(217,70,239,0.2)]">
                          <span className="text-4xl font-black text-fuchsia-400">{calcGPA().score}</span>
                        </div>
                        <p className="text-xs text-slate-400">{t('Skor Aralığı: 0.0 – 4.0', 'Score Range: 0.0 – 4.0')}</p>
                        <div className="inline-block mt-2 px-3 py-1 rounded-full text-xs font-bold bg-fuchsia-500/10 text-fuchsia-300 border border-fuchsia-500/20">
                          {calcGPA().tier}
                        </div>
                      </div>

                      <div className="w-full py-4 border-y border-slate-800 my-4 text-center">
                        <div className="text-xs text-slate-400 uppercase font-semibold mb-1">
                          {t('Tahmini Ortanca Genel Sağkalım (Median OS)', 'Estimated Median Overall Survival')}
                        </div>
                        <div className="text-2xl font-black text-white">{calcGPA().medianOS}</div>
                      </div>

                      {calcGPA().molecularNote && (
                        <div className="w-full p-3 rounded-xl bg-slate-950/60 border border-slate-800 text-left text-xs text-slate-300">
                          <span className="font-bold text-sky-400 block mb-0.5">🧬 {t('Moleküler Etki:', 'Molecular Impact:')}</span>
                          {calcGPA().molecularNote}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Mirels */}
              {activeTab === 'mirels' && (
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <div className="mb-8">
                    <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-amber-400 mb-1">
                      <span>Mirels H. Clin Orthop Relat Res 1989</span>
                    </div>
                    <h2 className="text-2xl font-bold text-white mb-2">{t('Mirels Skoru (Kemik Kırık Riski)', 'Mirels Scoring System (Bone Fracture Risk)')}</h2>
                    <p className="text-slate-400 text-sm">
                      {t(
                        'Kemik metastazlarında patolojik kırık riskini ve profilaktik cerrahi fiksasyon gereksinimini belirleyen 4 parametreli klinik kılavuz.',
                        'Standardized 4-parameter criteria for assessing pathological fracture risk and prophylactic surgical fixation indication in bone metastases.'
                      )}
                    </p>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-5">
                      <div>
                        <label className="block text-sm font-semibold text-slate-300 mb-2">{t('1. Anatomik Bölge (Site)', '1. Anatomic Site')}</label>
                        <select
                          value={mirelsSite}
                          onChange={e => setMirelsSite(Number(e.target.value) as 1 | 2 | 3)}
                          className="w-full bg-[#131f33] border border-slate-700 rounded-lg p-3 text-white outline-none"
                        >
                          <option value={1}>{t('Üst Ekstremite · Upper Extremity (1 puan)', 'Upper Extremity (1 point)')}</option>
                          <option value={2}>{t('Alt Ekstremite · Lower Extremity (2 puan)', 'Lower Extremity (2 points)')}</option>
                          <option value={3}>{t('Peritrokanterik Bölge · Peritrochanteric (3 puan)', 'Peritrochanteric Region (3 points)')}</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-slate-300 mb-2">{t('2. Ağrı Şiddeti (Pain)', '2. Pain Severity')}</label>
                        <select
                          value={mirelsPain}
                          onChange={e => setMirelsPain(Number(e.target.value) as 1 | 2 | 3)}
                          className="w-full bg-[#131f33] border border-slate-700 rounded-lg p-3 text-white outline-none"
                        >
                          <option value={1}>{t('Hafif ağrı · Mild (1 puan)', 'Mild Pain (1 point)')}</option>
                          <option value={2}>{t('Orta derecede ağrı · Moderate (2 puan)', 'Moderate Pain (2 points)')}</option>
                          <option value={3}>{t('Şiddetli / Yük taşımakla artan fonksiyonel ağrı · Functional / weight-bearing (3 puan)', 'Functional / Weight-bearing Pain (3 points)')}</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-slate-300 mb-2">{t('3. Lezyon Karakteri (Lesion Character)', '3. Lesion Radiographic Appearance')}</label>
                        <select
                          value={mirelsLesion}
                          onChange={e => setMirelsLesion(Number(e.target.value) as 1 | 2 | 3)}
                          className="w-full bg-[#131f33] border border-slate-700 rounded-lg p-3 text-white outline-none"
                        >
                          <option value={1}>{t('Osteoblastik / Blastik · Blastic (1 puan)', 'Osteoblastic / Blastic (1 point)')}</option>
                          <option value={2}>{t('Miks (Litiko-blastik) · Mixed (2 puan)', 'Mixed (2 points)')}</option>
                          <option value={3}>{t('Osteolitik / Litik · Lytic (3 puan)', 'Osteolytic / Lytic (3 points)')}</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-slate-300 mb-2">{t('4. Kortikal Tutulum / Boyut (Size)', '4. Cortical Involvement / Size')}</label>
                        <select
                          value={mirelsSize}
                          onChange={e => setMirelsSize(Number(e.target.value) as 1 | 2 | 3)}
                          className="w-full bg-[#131f33] border border-slate-700 rounded-lg p-3 text-white outline-none"
                        >
                          <option value={1}>{t('< 1/3 korteks tutulumu (1 puan)', '< 1/3 of cortical diameter (1 point)')}</option>
                          <option value={2}>{t('1/3 – 2/3 korteks tutulumu (2 puan)', '1/3 to 2/3 of cortical diameter (2 points)')}</option>
                          <option value={3}>{t('> 2/3 korteks tutulumu (3 puan)', '> 2/3 of cortical diameter (3 points)')}</option>
                        </select>
                      </div>
                    </div>

                    <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 flex flex-col justify-between items-center text-center">
                      <div className="w-full">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                          {t('TOPLAM MİRELS SKORU', 'TOTAL MIRELS SCORE')}
                        </span>
                        <div className="w-24 h-24 rounded-full border-4 border-amber-500/30 flex items-center justify-center my-4 mx-auto shadow-[0_0_25px_rgba(245,158,11,0.2)]">
                          <span className="text-4xl font-black text-amber-400">{calcMirels().score}</span>
                        </div>
                        <p className="text-xs text-slate-400">{t('Skor Aralığı: 4 – 12 Puan', 'Score Range: 4 – 12 Points')}</p>
                      </div>

                      <div className="w-full py-4 border-y border-slate-800 my-4">
                        <div className="text-xs text-slate-400 uppercase font-semibold mb-1">
                          {t('Tahmini Patolojik Kırık Riski', 'Estimated Pathological Fracture Risk')}
                        </div>
                        <div className={`text-2xl font-black ${calcMirels().score >= 9 ? 'text-rose-400' : calcMirels().score === 8 ? 'text-amber-400' : 'text-emerald-400'}`}>
                          {calcMirels().riskPercent}
                        </div>
                      </div>

                      <div className={`w-full p-4 rounded-xl border text-left text-xs leading-relaxed ${calcMirels().recClass}`}>
                        <div className="flex items-center gap-1.5 font-bold mb-1 uppercase tracking-wider">
                          <ShieldAlert className="w-4 h-4 shrink-0" />
                          <span>{t('Klinik Yönetim Kararı:', 'Clinical Management Recommendation:')}</span>
                        </div>
                        <p>{calcMirels().rec}</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* NPI */}
              {activeTab === 'npi' && (
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <div className="mb-8">
                    <h2 className="text-2xl font-bold text-white mb-2">{t('Nottingham Prognostik İndeks', 'Nottingham Prognostic Index')}</h2>
                    <p className="text-slate-400 text-sm">{t('Erken evre meme kanseri için cerrahi sonrası prognostik skorlama aracı.', 'Post-surgical prognostic scoring tool for early-stage breast cancer.')}</p>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-5">
                      <div>
                        <label className="block text-sm font-semibold text-slate-300 mb-2">{t('Tümör Çapı', 'Tumor Size')} ({npiSize.toFixed(1)} cm)</label>
                        <input type="range" min="0.1" max="10.0" step="0.1" value={npiSize} onChange={e => setNpiSize(Number(e.target.value))} className="w-full accent-rose-500" />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-slate-300 mb-2">{t('Lenf Nodu Tutulumu', 'Lymph Node Status')}</label>
                        <select value={npiNodes} onChange={e => setNpiNodes(Number(e.target.value) as 1 | 2 | 3)} className="w-full bg-[#131f33] border border-slate-700 rounded-lg p-3 text-white outline-none">
                          <option value={1}>{t('0 Nod (1 puan)', '0 Nodes (1 point)')}</option>
                          <option value={2}>{t('1-3 Nod (2 puan)', '1-3 Nodes (2 points)')}</option>
                          <option value={3}>{t('>3 Nod (3 puan)', '>3 Nodes (3 points)')}</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-slate-300 mb-2">{t('Histolojik Derece', 'Histologic Grade')}</label>
                        <select value={npiGrade} onChange={e => setNpiGrade(Number(e.target.value) as 1 | 2 | 3)} className="w-full bg-[#131f33] border border-slate-700 rounded-lg p-3 text-white outline-none">
                          <option value={1}>{t('Grade I (1 puan)', 'Grade I (1 point)')}</option>
                          <option value={2}>{t('Grade II (2 puan)', 'Grade II (2 points)')}</option>
                          <option value={3}>{t('Grade III (3 puan)', 'Grade III (3 points)')}</option>
                        </select>
                      </div>
                    </div>
                    <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 flex flex-col justify-center items-center text-center">
                      <div className="w-24 h-24 rounded-full border-4 border-rose-500/30 flex items-center justify-center mb-6">
                        <span className="text-4xl font-black text-rose-400">{calcNPI().score}</span>
                      </div>
                      <h3 className="text-lg font-bold text-white mb-1">{calcNPI().stratum}</h3>
                      <p className="text-slate-400 text-sm mt-4">{t('Tahmini 5-Yıllık Sağkalım:', 'Estimated 5-Year Survival:')}</p>
                      <p className="text-2xl font-black text-slate-200 mt-1">{calcNPI().os}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* ECOG Converter */}
              {activeTab === 'ecog' && (
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <div className="mb-8">
                    <h2 className="text-2xl font-bold text-white mb-2">{t('Performans Skoru Dönüştürücü', 'Performance Scale Converter')}</h2>
                    <p className="text-slate-400 text-sm">{t('ECOG, Karnofsky (KPS) ve Palyatif Performans Skoru (PPS) arası anında senkronize dönüştürücü.', 'Synchronous converter between ECOG, KPS, and Palliative Performance Scale (PPS).')}</p>
                  </div>
                  <div className="max-w-2xl mx-auto mt-12">
                    <div className="mb-12">
                      <label className="block text-center text-sm font-semibold text-slate-300 mb-6 uppercase tracking-wider">ECOG Performance Status</label>
                      <div className="relative pt-6 pb-2">
                        <input type="range" min="0" max="4" step="1" value={ecogScore} onChange={e => setEcogScore(Number(e.target.value))} className="w-full accent-sky-500" />
                        <div className="flex justify-between text-xs font-bold text-slate-400 mt-3 px-1">
                          <span>0</span>
                          <span>1</span>
                          <span>2</span>
                          <span>3</span>
                          <span>4</span>
                        </div>
                      </div>
                      <p className="text-center text-sky-300 font-medium text-sm mt-4 h-8">{activeEcog.desc}</p>
                    </div>

                    <div className="grid grid-cols-2 gap-6 text-center border-t border-slate-800 pt-10">
                      <div>
                        <div className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">Karnofsky (KPS)</div>
                        <div className="text-5xl font-black text-white">{activeEcog.kps}%</div>
                      </div>
                      <div>
                        <div className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">Palliative (PPS)</div>
                        <div className="text-5xl font-black text-white">{activeEcog.pps}%</div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
