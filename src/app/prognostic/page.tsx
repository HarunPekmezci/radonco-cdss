'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useLanguage } from '@/context/LanguageContext';
import { ArrowLeft, Activity, Brain, Bone, ActivitySquare, Pill, ChevronRight, Calculator, Stethoscope, FileText, Settings, Sparkles } from 'lucide-react';

export default function PrognosticPage() {
  const { language } = useLanguage();
  const lang = language === 'tr' ? 'tr' : 'en';

  const [activeTab, setActiveTab] = useState<'capra' | 'dsgpa' | 'mirels' | 'ecog' | 'npi'>('capra');

  // --- States for CAPRA ---
  const [capraAge, setCapraAge] = useState<number>(65);
  const [capraPSA, setCapraPSA] = useState<number>(8);
  const [capraGleason, setCapraGleason] = useState<'<=3+3' | '3+4' | '4+3' | '8-10'>('3+4');
  const [capraTStage, setCapraTStage] = useState<'T1-T2' | 'T3a'>('T1-T2');
  const [capraCores, setCapraCores] = useState<'<34' | '>=34'>('<34');

  // --- States for ds-GPA ---
  const [gpaPrimary, setGpaPrimary] = useState<'NSCLC' | 'Breast' | 'Melanoma' | 'RCC' | 'GI'>('NSCLC');
  const [gpaAge, setGpaAge] = useState<number>(65);
  const [gpaKPS, setGpaKPS] = useState<number>(80);
  const [gpaMets, setGpaMets] = useState<'1' | '2-3' | '>3'>('1');
  const [gpaExtracranial, setGpaExtracranial] = useState<'Absent' | 'Present'>('Absent');

  // --- States for Mirels ---
  const [mirelsSite, setMirelsSite] = useState<1 | 2 | 3>(2); // 1: Upper, 2: Lower, 3: Peritrochanteric
  const [mirelsPain, setMirelsPain] = useState<1 | 2 | 3>(2); // 1: Mild, 2: Mod, 3: Severe
  const [mirelsLesion, setMirelsLesion] = useState<1 | 2 | 3>(2); // 1: Blastic, 2: Mixed, 3: Lytic
  const [mirelsSize, setMirelsSize] = useState<1 | 2 | 3>(2); // 1: <1/3, 2: 1/3-2/3, 3: >2/3

  // --- States for NPI ---
  const [npiSize, setNpiSize] = useState<number>(2.0);
  const [npiNodes, setNpiNodes] = useState<1 | 2 | 3>(1); // 1: 0, 2: 1-3, 3: >3
  const [npiGrade, setNpiGrade] = useState<1 | 2 | 3>(2); // 1, 2, 3

  // --- ECOG State ---
  const [ecogScore, setEcogScore] = useState<number>(1);

  // === CALCULATORS ===
  const calcCapra = () => {
    let score = 0;
    if (capraPSA > 6 && capraPSA <= 10) score += 1;
    else if (capraPSA > 10 && capraPSA <= 20) score += 2;
    else if (capraPSA > 20 && capraPSA <= 30) score += 3;
    else if (capraPSA > 30) score += 4;

    if (capraGleason === '3+4') score += 1;
    else if (capraGleason === '4+3' || capraGleason === '8-10') score += 3;

    if (capraTStage === 'T3a') score += 1;
    if (capraCores === '>=34') score += 1;
    if (capraAge < 50) score += 1;

    let risk = 'Low';
    let recur = '90-95%';
    if (score >= 3 && score <= 5) { risk = 'Intermediate'; recur = '70-80%'; }
    if (score >= 6) { risk = 'High'; recur = '<50%'; }

    return { score, risk, recur };
  };

  const calcGPA = () => {
    let score = 0;
    // Simplified classic GPA / ds-GPA proxy
    if (gpaKPS >= 90) score += 1.0;
    else if (gpaKPS >= 70) score += 0.5;

    if (gpaAge < 50) score += 1.0;
    else if (gpaAge < 60) score += 0.5;

    if (gpaMets === '1') score += 1.0;
    else if (gpaMets === '2-3') score += 0.5;

    if (gpaExtracranial === 'Absent') score += 1.0;

    const os = score >= 3.5 ? '25.3 months' : score >= 2.5 ? '14.0 months' : score >= 1.5 ? '9.4 months' : '4.3 months';
    return { score: score.toFixed(1), os };
  };

  const calcMirels = () => {
    const sum = mirelsSite + mirelsPain + mirelsLesion + mirelsSize;
    let rec = lang === 'tr' ? 'Radyoterapi yeterli (Cerrahi fiksasyon gerekmez)' : 'Radiotherapy alone (No prophylactic fixation needed)';
    if (sum === 8) rec = lang === 'tr' ? 'Klinik değerlendirme (Sınırda risk)' : 'Clinical judgment (Borderline risk)';
    if (sum >= 9) rec = lang === 'tr' ? 'RT öncesi profilaktik cerrahi fiksasyon ÖNERİLİR' : 'Prophylactic surgical fixation RECOMMENDED prior to RT';
    return { score: sum, rec };
  };

  const calcNPI = () => {
    const score = (npiSize * 0.2) + npiNodes + npiGrade;
    let stratum = lang === 'tr' ? 'Mükemmel Prognostik Grup' : 'Excellent Prognostic Group';
    let os = '95%';
    if (score > 3.4 && score <= 4.4) { stratum = lang === 'tr' ? 'İyi Prognostik Grup' : 'Good Prognostic Group'; os = '85%'; }
    if (score > 4.4 && score <= 5.4) { stratum = lang === 'tr' ? 'Orta Prognostik Grup' : 'Moderate Prognostic Group'; os = '70%'; }
    if (score > 5.4) { stratum = lang === 'tr' ? 'Kötü Prognostik Grup' : 'Poor Prognostic Group'; os = '50%'; }
    return { score: score.toFixed(2), stratum, os };
  };

  const ecogMap = [
    { ecog: 0, kps: 100, pps: 100, desc: lang === 'tr' ? 'Tamamen aktif' : 'Fully active' },
    { ecog: 1, kps: 80, pps: 80, desc: lang === 'tr' ? 'Zorlu fiziksel aktivitede kısıtlı' : 'Restricted in strenuous physical activity' },
    { ecog: 2, kps: 60, pps: 60, desc: lang === 'tr' ? 'Ambulatuvar, kendi işini görebilir' : 'Ambulatory, capable of selfcare' },
    { ecog: 3, kps: 40, pps: 40, desc: lang === 'tr' ? 'Sınırlı özbakım, >%50 yatağa bağımlı' : 'Limited selfcare, >50% bedbound' },
    { ecog: 4, kps: 20, pps: 20, desc: lang === 'tr' ? 'Tamamen yatağa bağımlı, özbakım yok' : 'Completely disabled, bedbound' },
  ];
  const activeEcog = ecogMap[ecogScore];

  const t = (tr: string, en: string) => lang === 'tr' ? tr : en;

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
            <Link href="/" className="p-3 rounded-xl bg-slate-900/80 border border-slate-700/50 hover:bg-slate-800 hover:border-slate-600 transition-all text-slate-300">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <div className="text-sky-400 text-xs font-bold tracking-[0.2em] uppercase mb-1 flex items-center gap-2">
                <Calculator className="w-3.5 h-3.5" />
                {t('Klinik Skorlama', 'Clinical Scoring')}
              </div>
              <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
                {t('Prognostik İndeksler', 'Prognostic Indices')}
              </h1>
            </div>
          </div>
          <Link href="/cdss" className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-sky-600/10 border border-sky-500/30 text-sky-400 font-semibold hover:bg-sky-600/20 hover:border-sky-500/50 transition-all group shadow-[0_0_20px_rgba(14,165,233,0.15)]">
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
                { id: 'dsgpa', icon: Brain, title: 'ds-GPA', subtitle: t('Beyin Metastazları', 'Brain Metastases') },
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
                    <h2 className="text-2xl font-bold text-white mb-2">{t('UCSF CAPRA Skoru', 'UCSF CAPRA Score')}</h2>
                    <p className="text-slate-400 text-sm">
                      {t('Prostat kanseri için biyokimyasal nüks risksiz sağkalım tahmin aracı.', 'A clinical tool for predicting biochemical recurrence-free survival in prostate cancer.')}
                    </p>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-6">
                      <div>
                        <label className="block text-sm font-semibold text-slate-300 mb-2">{t('Hasta Yaşı', 'Patient Age')} ({capraAge})</label>
                        <input type="range" min="40" max="90" value={capraAge} onChange={e => setCapraAge(Number(e.target.value))} className="w-full accent-sky-500" />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-slate-300 mb-2">PSA (ng/mL)</label>
                        <input type="number" value={capraPSA} onChange={e => setCapraPSA(Number(e.target.value))} className="w-full bg-[#131f33] border border-slate-700 rounded-lg p-3 text-white focus:border-sky-500 focus:ring-1 focus:ring-sky-500 outline-none" />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-slate-300 mb-2">{t('Gleason Skoru', 'Gleason Score')}</label>
                        <select value={capraGleason} onChange={e => setCapraGleason(e.target.value as any)} className="w-full bg-[#131f33] border border-slate-700 rounded-lg p-3 text-white outline-none">
                          <option value="<=3+3">≤ 3+3 (Grade Group 1)</option>
                          <option value="3+4">3+4 (Grade Group 2)</option>
                          <option value="4+3">4+3 (Grade Group 3)</option>
                          <option value="8-10">8-10 (Grade Group 4-5)</option>
                        </select>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-semibold text-slate-300 mb-2">{t('Klinik Evre', 'Clinical T-Stage')}</label>
                          <select value={capraTStage} onChange={e => setCapraTStage(e.target.value as any)} className="w-full bg-[#131f33] border border-slate-700 rounded-lg p-3 text-white outline-none">
                            <option value="T1-T2">T1 - T2</option>
                            <option value="T3a">T3a</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-slate-300 mb-2">{t('% Pozitif Kor', '% Positive Cores')}</label>
                          <select value={capraCores} onChange={e => setCapraCores(e.target.value as any)} className="w-full bg-[#131f33] border border-slate-700 rounded-lg p-3 text-white outline-none">
                            <option value="<34">&lt; 34%</option>
                            <option value=">=34">≥ 34%</option>
                          </select>
                        </div>
                      </div>
                    </div>
                    <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 flex flex-col justify-center items-center text-center">
                      <div className="w-24 h-24 rounded-full border-4 border-sky-500/30 flex items-center justify-center mb-6">
                        <span className="text-4xl font-black text-sky-400">{calcCapra().score}</span>
                      </div>
                      <h3 className="text-lg font-bold text-white mb-1">{t('Risk Grubu:', 'Risk Group:')} <span className={calcCapra().risk === 'Low' ? 'text-emerald-400' : calcCapra().risk === 'Intermediate' ? 'text-amber-400' : 'text-rose-400'}>{calcCapra().risk}</span></h3>
                      <p className="text-slate-400 text-sm mt-4">{t('5 Yıllık Biyokimyasal Nüks Gelişmeme İhtimali:', '5-Year Biochemical Recurrence-Free Survival:')}</p>
                      <p className="text-2xl font-black text-slate-200 mt-1">{calcCapra().recur}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* ds-GPA */}
              {activeTab === 'dsgpa' && (
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <div className="mb-8">
                    <h2 className="text-2xl font-bold text-white mb-2">{t('ds-GPA Skoru', 'ds-GPA Score')}</h2>
                    <p className="text-slate-400 text-sm">{t('Beyin metastazları için Graded Prognostic Assessment aracı.', 'Diagnosis-Specific Graded Prognostic Assessment for brain metastases.')}</p>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-5">
                      <div>
                        <label className="block text-sm font-semibold text-slate-300 mb-2">{t('Primer Tümör', 'Primary Tumor')}</label>
                        <select value={gpaPrimary} onChange={e => setGpaPrimary(e.target.value as any)} className="w-full bg-[#131f33] border border-slate-700 rounded-lg p-3 text-white outline-none">
                          <option value="NSCLC">NSCLC (Lung)</option>
                          <option value="Breast">Breast</option>
                          <option value="Melanoma">Melanoma</option>
                          <option value="RCC">Renal Cell Carcinoma</option>
                          <option value="GI">Gastrointestinal</option>
                        </select>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-semibold text-slate-300 mb-2">KPS ({gpaKPS})</label>
                          <input type="range" min="30" max="100" step="10" value={gpaKPS} onChange={e => setGpaKPS(Number(e.target.value))} className="w-full accent-fuchsia-500" />
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-slate-300 mb-2">{t('Yaş', 'Age')} ({gpaAge})</label>
                          <input type="range" min="20" max="90" value={gpaAge} onChange={e => setGpaAge(Number(e.target.value))} className="w-full accent-fuchsia-500" />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-slate-300 mb-2">{t('Beyin Metastazı Sayısı', 'Number of Brain Mets')}</label>
                        <div className="grid grid-cols-3 gap-2">
                          {['1', '2-3', '>3'].map(opt => (
                            <button key={opt} onClick={() => setGpaMets(opt as any)} className={`py-2 rounded-lg text-sm font-bold border transition-colors ${gpaMets === opt ? 'bg-fuchsia-600 border-fuchsia-400 text-white' : 'bg-[#131f33] border-slate-700 text-slate-300'}`}>{opt}</button>
                          ))}
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-slate-300 mb-2">{t('Ekstrakraniyal Metastaz', 'Extracranial Mets')}</label>
                        <div className="grid grid-cols-2 gap-2">
                          {['Absent', 'Present'].map(opt => (
                            <button key={opt} onClick={() => setGpaExtracranial(opt as any)} className={`py-2 rounded-lg text-sm font-bold border transition-colors ${gpaExtracranial === opt ? 'bg-fuchsia-600 border-fuchsia-400 text-white' : 'bg-[#131f33] border-slate-700 text-slate-300'}`}>{t(opt === 'Absent' ? 'Yok' : 'Var', opt)}</button>
                          ))}
                        </div>
                      </div>
                    </div>
                    <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 flex flex-col justify-center items-center text-center">
                      <div className="w-24 h-24 rounded-full border-4 border-fuchsia-500/30 flex items-center justify-center mb-6">
                        <span className="text-4xl font-black text-fuchsia-400">{calcGPA().score}</span>
                      </div>
                      <p className="text-slate-400 text-sm">{t('Maksimum: 4.0', 'Maximum: 4.0')}</p>
                      <p className="text-slate-400 text-sm mt-6">{t('Tahmini Ortanca Genel Sağkalım:', 'Estimated Median Overall Survival:')}</p>
                      <p className="text-2xl font-black text-slate-200 mt-1">{calcGPA().os}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Mirels */}
              {activeTab === 'mirels' && (
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <div className="mb-8">
                    <h2 className="text-2xl font-bold text-white mb-2">{t('Mirels Skoru', 'Mirels Scoring System')}</h2>
                    <p className="text-slate-400 text-sm">{t('Kemik metastazlarında patolojik kırık riskini ve profilaktik fiksasyon ihtiyacını belirler.', 'Determines pathological fracture risk and prophylactic fixation necessity in bone metastases.')}</p>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-5">
                      <div>
                        <label className="block text-sm font-semibold text-slate-300 mb-2">{t('Anatomik Bölge', 'Anatomic Site')}</label>
                        <select value={mirelsSite} onChange={e => setMirelsSite(Number(e.target.value) as 1|2|3)} className="w-full bg-[#131f33] border border-slate-700 rounded-lg p-3 text-white outline-none">
                          <option value={1}>{t('Üst Ekstremite (1)', 'Upper Limb (1)')}</option>
                          <option value={2}>{t('Alt Ekstremite (2)', 'Lower Limb (2)')}</option>
                          <option value={3}>{t('Peritrokanterik (3)', 'Peritrochanteric (3)')}</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-slate-300 mb-2">{t('Ağrı Şiddeti', 'Pain Severity')}</label>
                        <select value={mirelsPain} onChange={e => setMirelsPain(Number(e.target.value) as 1|2|3)} className="w-full bg-[#131f33] border border-slate-700 rounded-lg p-3 text-white outline-none">
                          <option value={1}>{t('Hafif (1)', 'Mild (1)')}</option>
                          <option value={2}>{t('Orta (2)', 'Moderate (2)')}</option>
                          <option value={3}>{t('Şiddetli / Fonksiyonel (3)', 'Severe / Functional (3)')}</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-slate-300 mb-2">{t('Radyografik Görünüm', 'Radiographic Appearance')}</label>
                        <select value={mirelsLesion} onChange={e => setMirelsLesion(Number(e.target.value) as 1|2|3)} className="w-full bg-[#131f33] border border-slate-700 rounded-lg p-3 text-white outline-none">
                          <option value={1}>{t('Blastik (1)', 'Blastic (1)')}</option>
                          <option value={2}>{t('Miks (2)', 'Mixed (2)')}</option>
                          <option value={3}>{t('Litik (3)', 'Lytic (3)')}</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-slate-300 mb-2">{t('Kortikal Tutulum / Boyut', 'Cortical Involvement / Size')}</label>
                        <select value={mirelsSize} onChange={e => setMirelsSize(Number(e.target.value) as 1|2|3)} className="w-full bg-[#131f33] border border-slate-700 rounded-lg p-3 text-white outline-none">
                          <option value={1}>{t('< 1/3 korteks (1)', '< 1/3 of cortex (1)')}</option>
                          <option value={2}>{t('1/3 - 2/3 korteks (2)', '1/3 - 2/3 of cortex (2)')}</option>
                          <option value={3}>{t('> 2/3 korteks (3)', '> 2/3 of cortex (3)')}</option>
                        </select>
                      </div>
                    </div>
                    <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 flex flex-col justify-center items-center text-center">
                      <div className="w-24 h-24 rounded-full border-4 border-amber-500/30 flex items-center justify-center mb-6">
                        <span className="text-4xl font-black text-amber-400">{calcMirels().score}</span>
                      </div>
                      <h3 className="text-lg font-bold text-white mb-4">{t('Klinik Öneri', 'Clinical Recommendation')}</h3>
                      <div className={`px-4 py-3 rounded-lg border text-sm font-medium ${calcMirels().score >= 9 ? 'bg-rose-950/40 border-rose-500/50 text-rose-200' : calcMirels().score === 8 ? 'bg-amber-950/40 border-amber-500/50 text-amber-200' : 'bg-emerald-950/40 border-emerald-500/50 text-emerald-200'}`}>
                        {calcMirels().rec}
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
                        <select value={npiNodes} onChange={e => setNpiNodes(Number(e.target.value) as 1|2|3)} className="w-full bg-[#131f33] border border-slate-700 rounded-lg p-3 text-white outline-none">
                          <option value={1}>{t('0 Nod (1 puan)', '0 Nodes (1 point)')}</option>
                          <option value={2}>{t('1-3 Nod (2 puan)', '1-3 Nodes (2 points)')}</option>
                          <option value={3}>{t('>3 Nod (3 puan)', '>3 Nodes (3 points)')}</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-slate-300 mb-2">{t('Histolojik Derece', 'Histologic Grade')}</label>
                        <select value={npiGrade} onChange={e => setNpiGrade(Number(e.target.value) as 1|2|3)} className="w-full bg-[#131f33] border border-slate-700 rounded-lg p-3 text-white outline-none">
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
                          <span>0</span><span>1</span><span>2</span><span>3</span><span>4</span>
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
