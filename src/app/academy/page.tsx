'use client';

import { useState, useMemo, useEffect } from 'react';
import { quizVignettes, flashcards, boardPearls, type AcademicPillar } from '@/data/academyData';
import { GraduationCap, Library, Activity, BookOpen, CheckCircle, XCircle, RotateCcw, ChevronRight, Bookmark, ArrowRight, ArrowLeft, Target, ArrowUpRight, ShieldCheck, Beaker, Atom, AlertCircle } from 'lucide-react';

const PILLAR_STYLES: Record<AcademicPillar, { text: string; bg: string; border: string; glow: string; icon: React.ReactNode }> = {
  CLINICAL: { text: 'text-sky-400', bg: 'bg-sky-900/20', border: 'border-sky-500/30', glow: 'shadow-[0_0_15px_rgba(56,189,248,0.15)]', icon: <ShieldCheck className="w-3.5 h-3.5" /> },
  RADIOBIOLOGY: { text: 'text-emerald-400', bg: 'bg-emerald-900/20', border: 'border-emerald-500/30', glow: 'shadow-[0_0_15px_rgba(16,185,129,0.15)]', icon: <Beaker className="w-3.5 h-3.5" /> },
  PHYSICS: { text: 'text-violet-400', bg: 'bg-violet-900/20', border: 'border-violet-500/30', glow: 'shadow-[0_0_15px_rgba(139,92,246,0.15)]', icon: <Atom className="w-3.5 h-3.5" /> },
};

export default function AcademyPage() {
  const [activeTab, setActiveTab] = useState<'hub' | 'quizzes' | 'flashcards' | 'radiobiology' | 'pearls'>('hub');
  const [pillarFilter, setPillarFilter] = useState<AcademicPillar | 'ALL'>('ALL');
  const [mode, setMode] = useState<'tutor' | 'exam'>('tutor');

  const [score, setScore] = useState(0);
  const [answeredCount, setAnsweredCount] = useState(0);
  const [totalQuestions, setTotalQuestions] = useState(quizVignettes.length);
  const [resetKey, setResetKey] = useState(0);

  const resetQuizzes = () => {
    setScore(0);
    setAnsweredCount(0);
    setResetKey(prev => prev + 1);
  };

  const handleHubNavigation = (tab: any, filter: AcademicPillar | 'ALL') => {
    setActiveTab(tab);
    setPillarFilter(filter);
  };

  return (
    <div className="min-h-screen bg-[#060b14] text-slate-200 selection:bg-sky-500/30 font-sans">
      <main className="mx-auto max-w-[90rem] px-4 py-8 sm:px-6 lg:px-8">
        
        {/* Top Header & Tabs */}
        <header className="mb-10 flex flex-col xl:flex-row xl:items-end justify-between gap-6">
          <div>
            <h1 className="flex items-center gap-3 text-3xl font-bold tracking-tight text-white sm:text-4xl">
              <GraduationCap className="h-10 w-10 text-sky-400" />
              RadOnco Academy
            </h1>
            <p className="mt-3 text-sm sm:text-base text-slate-400 max-w-2xl leading-relaxed">
              Premier 3-Pillar Radiation Oncology Workstation. Master clinical oncology, radiobiology, and medical physics.
            </p>
          </div>
          
          <div className="flex flex-wrap gap-2 rounded-2xl bg-[#0c1322] p-2 border border-slate-800 shadow-xl">
            <TabButton id="hub" icon={<Activity className="h-4 w-4" />} label="Academy Hub" isActive={activeTab === 'hub'} onClick={() => setActiveTab('hub')} />
            <TabButton id="quizzes" icon={<Library className="h-4 w-4" />} label="Quizzes" isActive={activeTab === 'quizzes'} onClick={() => setActiveTab('quizzes')} />
            <TabButton id="flashcards" icon={<BookOpen className="h-4 w-4" />} label="Flashcards" isActive={activeTab === 'flashcards'} onClick={() => setActiveTab('flashcards')} />
            <TabButton id="radiobiology" icon={<Beaker className="h-4 w-4" />} label="LQ Lab" isActive={activeTab === 'radiobiology'} onClick={() => setActiveTab('radiobiology')} />
            <TabButton id="pearls" icon={<ChevronRight className="h-4 w-4" />} label="Pearls" isActive={activeTab === 'pearls'} onClick={() => setActiveTab('pearls')} />
          </div>
        </header>

        {activeTab === 'hub' ? (
          <HubDashboard onNavigate={handleHubNavigation} />
        ) : (
          <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
            {/* Left Column */}
            <aside className="xl:col-span-3 space-y-6">
              
              <div className="rounded-2xl border border-slate-800 bg-gradient-to-b from-[#131f33] to-[#0c1322] p-6 shadow-xl">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-6 flex items-center gap-2">
                  <Target className="h-4 w-4 text-sky-400" />
                  Discipline Filter
                </h3>
                <div className="flex flex-col gap-3">
                  <FilterButton id="ALL" label="All Pillars" icon={<Library className="w-4 h-4"/>} active={pillarFilter === 'ALL'} onClick={() => setPillarFilter('ALL')} color="slate" />
                  <FilterButton id="CLINICAL" label="Clinical Oncology" icon={<ShieldCheck className="w-4 h-4"/>} active={pillarFilter === 'CLINICAL'} onClick={() => setPillarFilter('CLINICAL')} color="sky" />
                  <FilterButton id="RADIOBIOLOGY" label="Radiobiology" icon={<Beaker className="w-4 h-4"/>} active={pillarFilter === 'RADIOBIOLOGY'} onClick={() => setPillarFilter('RADIOBIOLOGY')} color="emerald" />
                  <FilterButton id="PHYSICS" label="Medical Physics" icon={<Atom className="w-4 h-4"/>} active={pillarFilter === 'PHYSICS'} onClick={() => setPillarFilter('PHYSICS')} color="violet" />
                </div>
              </div>

              {activeTab === 'quizzes' && (
                <div className="rounded-2xl border border-slate-800 bg-gradient-to-b from-[#131f33] to-[#0c1322] p-6 shadow-xl">
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-6 flex items-center gap-2">
                    <Target className="h-4 w-4 text-emerald-400" />
                    Exam Readiness
                  </h3>
                  <div className="flex items-center justify-around mb-8">
                    <ReadinessStats score={score} answeredCount={answeredCount} totalQuestions={totalQuestions} />
                  </div>
                  
                  <div className="flex items-center justify-between border-t border-slate-800/80 pt-5">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Mode</span>
                    <button 
                      onClick={() => setMode(m => m === 'tutor' ? 'exam' : 'tutor')}
                      className="flex items-center gap-1 rounded-full bg-slate-900 p-1 border border-slate-700 shadow-inner transition hover:border-slate-500"
                    >
                      <span className={`rounded-full px-4 py-1.5 text-xs font-bold transition-all ${mode === 'tutor' ? 'bg-sky-500 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'}`}>Tutor</span>
                      <span className={`rounded-full px-4 py-1.5 text-xs font-bold transition-all ${mode === 'exam' ? 'bg-amber-500 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'}`}>Exam</span>
                    </button>
                  </div>
                </div>
              )}

              <div className="flex gap-3">
                 <button onClick={resetQuizzes} className="flex-1 flex items-center justify-center gap-2 rounded-xl border border-slate-700 bg-[#0c1322] py-3.5 text-sm font-bold text-slate-300 hover:bg-slate-800 hover:text-white hover:border-slate-500 transition shadow-lg">
                   <RotateCcw className="h-4 w-4" /> Reset
                 </button>
                 <button className="flex-1 flex items-center justify-center gap-2 rounded-xl border border-slate-700 bg-[#0c1322] py-3.5 text-sm font-bold text-slate-300 hover:bg-slate-800 hover:text-white hover:border-slate-500 transition shadow-lg">
                   <Bookmark className="h-4 w-4" /> Saved
                 </button>
              </div>

            </aside>

            {/* Right Column */}
            <section className="xl:col-span-9">
              <div className="rounded-3xl border border-slate-800 bg-[#0c1322] p-6 sm:p-10 shadow-2xl min-h-[700px] flex flex-col">
                {activeTab === 'quizzes' && <QuizzesTab key={resetKey} filter={pillarFilter} mode={mode} score={score} setScore={setScore} answeredCount={answeredCount} setAnsweredCount={setAnsweredCount} setTotalQuestions={setTotalQuestions} />}
                {activeTab === 'flashcards' && <FlashcardsTab filter={pillarFilter} />}
                {activeTab === 'radiobiology' && <RadiobiologyTab />}
                {activeTab === 'pearls' && <PearlsTab filter={pillarFilter} />}
              </div>
            </section>
          </div>
        )}
      </main>
    </div>
  );
}

function HubDashboard({ onNavigate }: { onNavigate: (tab: 'quizzes' | 'flashcards' | 'radiobiology' | 'pearls', filter: AcademicPillar | 'ALL') => void }) {
  return (
    <div className="flex flex-col gap-8 py-4">
      {/* Top 3 Pillar Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Clinical Suite */}
        <div className="rounded-3xl border border-sky-500/40 bg-slate-900/90 shadow-lg shadow-sky-950/40 p-8 hover:-translate-y-1 hover:shadow-sky-900/50 transition-all duration-300 flex flex-col backdrop-blur-md relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity">
            <ShieldCheck className="w-32 h-32 text-sky-400" />
          </div>
          <div className="h-14 w-14 rounded-2xl bg-sky-500/20 border border-sky-500/50 flex items-center justify-center mb-5 relative z-10">
            <ShieldCheck className="h-7 w-7 text-sky-400" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2 relative z-10">Clinical Oncology</h2>
          <p className="text-slate-400 text-sm leading-relaxed mb-6 flex-1 relative z-10">
            Evidence-based practice covering Organ-specific vignettes, Phase III landmark trials, and NCCN guideline adherence.
          </p>
          <div className="flex flex-wrap gap-2 mb-6 relative z-10">
            {['Breast', 'Thorax', 'GI', 'GU', 'H&N', 'CNS'].map(pill => (
              <span key={pill} className="rounded-md bg-sky-950/50 border border-sky-500/20 px-2 py-1 text-[10px] font-bold uppercase tracking-widest text-sky-300">{pill}</span>
            ))}
            <span className="rounded-md bg-sky-500 text-slate-950 px-2 py-1 text-[10px] font-black uppercase tracking-widest">+120 Q's</span>
          </div>
          <div className="space-y-3 relative z-10">
            <button onClick={() => onNavigate('quizzes', 'CLINICAL')} className="w-full flex items-center justify-between rounded-xl bg-[#060b14] border border-slate-700 px-5 py-3 text-sm font-bold text-sky-300 hover:border-sky-500 hover:bg-sky-950/50 transition shadow-sm">
              <span className="flex items-center gap-2"><Library className="w-4 h-4"/> Case Quizzes</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button onClick={() => onNavigate('flashcards', 'CLINICAL')} className="w-full flex items-center justify-between rounded-xl bg-[#060b14] border border-slate-700 px-5 py-3 text-sm font-bold text-sky-300 hover:border-sky-500 hover:bg-sky-950/50 transition shadow-sm">
              <span className="flex items-center gap-2"><BookOpen className="w-4 h-4"/> Landmark Flashcards</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Radiobiology Lab */}
        <div className="rounded-3xl border border-emerald-500/40 bg-slate-900/90 shadow-lg shadow-emerald-950/40 p-8 hover:-translate-y-1 hover:shadow-emerald-900/50 transition-all duration-300 flex flex-col backdrop-blur-md relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity">
            <Beaker className="w-32 h-32 text-emerald-400" />
          </div>
          <div className="h-14 w-14 rounded-2xl bg-emerald-500/20 border border-emerald-500/50 flex items-center justify-center mb-5 relative z-10">
            <Beaker className="h-7 w-7 text-emerald-400" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2 relative z-10">Radiobiology Lab</h2>
          <p className="text-slate-400 text-sm leading-relaxed mb-6 flex-1 relative z-10">
            Master the LQ model, fractionations, α/β values, the 5Rs, acute vs late tissue effects, and tumor repopulation.
          </p>
          <div className="flex flex-wrap gap-2 mb-6 relative z-10">
            {['LQ Model', '5Rs', 'EQD2', 'Hypofractionation'].map(pill => (
              <span key={pill} className="rounded-md bg-emerald-950/50 border border-emerald-500/20 px-2 py-1 text-[10px] font-bold uppercase tracking-widest text-emerald-300">{pill}</span>
            ))}
            <span className="rounded-md bg-emerald-500 text-slate-950 px-2 py-1 text-[10px] font-black uppercase tracking-widest">+40 Q's</span>
          </div>
          <div className="space-y-3 relative z-10">
            <button onClick={() => onNavigate('radiobiology', 'ALL')} className="w-full flex items-center justify-between rounded-xl bg-[#060b14] border border-slate-700 px-5 py-3 text-sm font-bold text-emerald-300 hover:border-emerald-500 hover:bg-emerald-950/50 transition shadow-sm">
              <span className="flex items-center gap-2"><Activity className="w-4 h-4"/> BED / EQD2 Comparator</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button onClick={() => onNavigate('quizzes', 'RADIOBIOLOGY')} className="w-full flex items-center justify-between rounded-xl bg-[#060b14] border border-slate-700 px-5 py-3 text-sm font-bold text-emerald-300 hover:border-emerald-500 hover:bg-emerald-950/50 transition shadow-sm">
              <span className="flex items-center gap-2"><Library className="w-4 h-4"/> Concept Quizzes</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Physics Suite */}
        <div className="rounded-3xl border border-violet-500/40 bg-slate-900/90 shadow-lg shadow-violet-950/40 p-8 hover:-translate-y-1 hover:shadow-violet-900/50 transition-all duration-300 flex flex-col backdrop-blur-md relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity">
            <Atom className="w-32 h-32 text-violet-400" />
          </div>
          <div className="h-14 w-14 rounded-2xl bg-violet-500/20 border border-violet-500/50 flex items-center justify-center mb-5 relative z-10">
            <Atom className="h-7 w-7 text-violet-400" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2 relative z-10">Medical Physics</h2>
          <p className="text-slate-400 text-sm leading-relaxed mb-6 flex-1 relative z-10">
            Photon/electron interactions, linac engineering, PDD/TMR curves, dosimetry (TG-51), and rigorous machine QA standards.
          </p>
          <div className="flex flex-wrap gap-2 mb-6 relative z-10">
            {['Linac Anatomy', 'TG-51', 'Interactions', 'MLC QA'].map(pill => (
              <span key={pill} className="rounded-md bg-violet-950/50 border border-violet-500/20 px-2 py-1 text-[10px] font-bold uppercase tracking-widest text-violet-300">{pill}</span>
            ))}
            <span className="rounded-md bg-violet-500 text-slate-950 px-2 py-1 text-[10px] font-black uppercase tracking-widest">+55 Q's</span>
          </div>
          <div className="space-y-3 relative z-10">
            <button onClick={() => onNavigate('quizzes', 'PHYSICS')} className="w-full flex items-center justify-between rounded-xl bg-[#060b14] border border-slate-700 px-5 py-3 text-sm font-bold text-violet-300 hover:border-violet-500 hover:bg-violet-950/50 transition shadow-sm">
              <span className="flex items-center gap-2"><Library className="w-4 h-4"/> Physics Vignettes</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button onClick={() => onNavigate('pearls', 'PHYSICS')} className="w-full flex items-center justify-between rounded-xl bg-[#060b14] border border-slate-700 px-5 py-3 text-sm font-bold text-violet-300 hover:border-violet-500 hover:bg-violet-950/50 transition shadow-sm">
              <span className="flex items-center gap-2"><ChevronRight className="w-4 h-4"/> TG-51 & QA Pearls</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Featured Clinical Case of the Day */}
      <div className="rounded-3xl border border-amber-500/40 bg-gradient-to-r from-amber-950/30 to-slate-900/90 shadow-lg shadow-amber-900/20 p-8 backdrop-blur-md flex flex-col md:flex-row items-center justify-between gap-8 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-2 h-full bg-amber-500"></div>
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-4">
            <span className="inline-flex items-center gap-1.5 rounded-lg bg-amber-500/20 px-3 py-1.5 text-xs font-black text-amber-400 uppercase tracking-widest border border-amber-500/40">
              <AlertCircle className="w-3.5 h-3.5" /> Featured Case of the Day
            </span>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest border border-slate-700 rounded-lg px-3 py-1.5 bg-slate-800/50">
              Breast Cancer
            </span>
          </div>
          <h3 className="text-2xl font-bold text-white mb-3">FAST-Forward: Ultra-Hypofractionation</h3>
          <p className="text-slate-300 text-sm leading-relaxed max-w-3xl">
            A 65-year-old female undergoes lumpectomy for pT1c pN0 ER+ PR+ HER2- invasive ductal carcinoma. She is starting whole breast irradiation. Which of the following regimens is supported by the FAST-Forward trial?
          </p>
        </div>
        <div className="shrink-0">
          <button onClick={() => onNavigate('quizzes', 'CLINICAL')} className="flex items-center justify-center gap-2 rounded-2xl bg-amber-500 px-8 py-4 text-sm font-black text-amber-950 hover:bg-amber-400 transition shadow-[0_0_20px_rgba(245,158,11,0.3)] hover:shadow-[0_0_30px_rgba(245,158,11,0.5)]">
            Solve Case <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* 2-Column High-Yield Board Knowledge Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        
        {/* Landmark Phase III Trial Quick-Matrix */}
        <div className="rounded-3xl border border-slate-700 bg-slate-900/90 shadow-xl p-8 backdrop-blur-md">
          <h3 className="text-lg font-black text-white mb-6 uppercase tracking-widest flex items-center gap-3 border-b border-slate-800 pb-4">
            <BookOpen className="w-5 h-5 text-sky-400" /> Landmark Trial Matrix
          </h3>
          <div className="space-y-4">
            {/* Trial 1 */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-[#060b14] border border-slate-800 hover:border-sky-500/30 transition-colors">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="text-sm font-bold text-sky-400">FLAME</h4>
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest bg-slate-800 px-2 py-0.5 rounded">Prostate</span>
                </div>
                <p className="text-xs text-slate-300 font-medium">EBRT + Focal boost up to 95 Gy to intraprostatic lesion</p>
              </div>
              <div className="flex flex-col sm:items-end gap-1 shrink-0">
                <span className="text-[11px] font-bold text-emerald-400">Improved bDFS</span>
                <a href="https://doi.org/10.1200/JCO.20.02873" target="_blank" rel="noreferrer" className="text-[10px] text-slate-500 hover:text-sky-400 flex items-center gap-1 font-bold"><ArrowUpRight className="w-3 h-3"/> PubMed</a>
              </div>
            </div>
            
            {/* Trial 2 */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-[#060b14] border border-slate-800 hover:border-sky-500/30 transition-colors">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="text-sm font-bold text-sky-400">PACIFIC</h4>
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest bg-slate-800 px-2 py-0.5 rounded">NSCLC</span>
                </div>
                <p className="text-xs text-slate-300 font-medium">Stage III unresectable post-CRT + Durvalumab</p>
              </div>
              <div className="flex flex-col sm:items-end gap-1 shrink-0">
                <span className="text-[11px] font-bold text-emerald-400">Improved OS & PFS</span>
                <a href="https://doi.org/10.1056/NEJMoa1709937" target="_blank" rel="noreferrer" className="text-[10px] text-slate-500 hover:text-sky-400 flex items-center gap-1 font-bold"><ArrowUpRight className="w-3 h-3"/> PubMed</a>
              </div>
            </div>

            {/* Trial 3 */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-[#060b14] border border-slate-800 hover:border-sky-500/30 transition-colors">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="text-sm font-bold text-sky-400">CROSS</h4>
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest bg-slate-800 px-2 py-0.5 rounded">Esophageal</span>
                </div>
                <p className="text-xs text-slate-300 font-medium">Pre-op CRT 41.4 Gy + Carbo/Taxol</p>
              </div>
              <div className="flex flex-col sm:items-end gap-1 shrink-0">
                <span className="text-[11px] font-bold text-emerald-400">Improved OS & R0 Resection</span>
                <a href="https://doi.org/10.1056/NEJMoa1205128" target="_blank" rel="noreferrer" className="text-[10px] text-slate-500 hover:text-sky-400 flex items-center gap-1 font-bold"><ArrowUpRight className="w-3 h-3"/> PubMed</a>
              </div>
            </div>
            
            {/* Trial 4 */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-[#060b14] border border-slate-800 hover:border-sky-500/30 transition-colors">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="text-sm font-bold text-sky-400">EORTC 22881</h4>
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest bg-slate-800 px-2 py-0.5 rounded">Breast</span>
                </div>
                <p className="text-xs text-slate-300 font-medium">16 Gy tumor bed boost after 50 Gy WBI</p>
              </div>
              <div className="flex flex-col sm:items-end gap-1 shrink-0">
                <span className="text-[11px] font-bold text-emerald-400">Halved Local Recurrence</span>
                <a href="https://doi.org/10.1056/NEJMoa070140" target="_blank" rel="noreferrer" className="text-[10px] text-slate-500 hover:text-sky-400 flex items-center gap-1 font-bold"><ArrowUpRight className="w-3 h-3"/> PubMed</a>
              </div>
            </div>
          </div>
        </div>

        {/* Essential Radiobiology & Physics Cheat-Sheet */}
        <div className="rounded-3xl border border-slate-700 bg-slate-900/90 shadow-xl p-8 backdrop-blur-md">
          <h3 className="text-lg font-black text-white mb-6 uppercase tracking-widest flex items-center gap-3 border-b border-slate-800 pb-4">
            <Activity className="w-5 h-5 text-emerald-400" /> Radiobiology & Physics
          </h3>
          <div className="grid gap-4">
            
            {/* QUANTEC Table */}
            <div className="rounded-2xl bg-[#060b14] border border-slate-800 p-5">
               <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2"><Target className="w-3.5 h-3.5"/> QUANTEC OAR Constraints</h4>
               <div className="grid grid-cols-2 gap-y-3 gap-x-4 text-xs font-medium">
                 <div className="flex justify-between border-b border-slate-800 pb-1">
                   <span className="text-slate-300">Spinal Cord</span>
                   <span className="text-rose-400 font-bold max-w-[100px] text-right">Max &lt; 45-50 Gy</span>
                 </div>
                 <div className="flex justify-between border-b border-slate-800 pb-1">
                   <span className="text-slate-300">Brainstem</span>
                   <span className="text-rose-400 font-bold max-w-[100px] text-right">Max &lt; 54 Gy</span>
                 </div>
                 <div className="flex justify-between border-b border-slate-800 pb-1">
                   <span className="text-slate-300">Optic Chiasm</span>
                   <span className="text-rose-400 font-bold max-w-[100px] text-right">Max &lt; 54 Gy</span>
                 </div>
                 <div className="flex justify-between border-b border-slate-800 pb-1">
                   <span className="text-slate-300">Rectum</span>
                   <span className="text-rose-400 font-bold max-w-[100px] text-right">V70 &lt; 20%</span>
                 </div>
               </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              {/* LQ Formula */}
              <div className="rounded-2xl bg-[#060b14] border border-emerald-900/30 p-5">
                <h4 className="text-[10px] font-black text-emerald-500 uppercase tracking-widest mb-3">LQ Model Math</h4>
                <div className="space-y-3">
                  <div>
                    <span className="block text-[10px] font-bold text-slate-500 uppercase">BED</span>
                    <span className="text-sm font-mono text-emerald-300">nd [1 + d/(α/β)]</span>
                  </div>
                  <div>
                    <span className="block text-[10px] font-bold text-slate-500 uppercase">EQD2</span>
                    <span className="text-sm font-mono text-emerald-300">BED / [1 + 2/(α/β)]</span>
                  </div>
                </div>
              </div>

              {/* Photon Physics */}
              <div className="rounded-2xl bg-[#060b14] border border-violet-900/30 p-5">
                <h4 className="text-[10px] font-black text-violet-500 uppercase tracking-widest mb-3">Photon Physics</h4>
                <ul className="space-y-2 text-xs font-medium text-slate-300">
                  <li className="flex justify-between"><span className="text-slate-400">6 MV dmax:</span> <span className="text-violet-300 font-bold">1.5 cm</span></li>
                  <li className="flex justify-between"><span className="text-slate-400">18 MV dmax:</span> <span className="text-violet-300 font-bold">3.5 cm</span></li>
                  <li className="flex justify-between"><span className="text-slate-400">Compton:</span> <span className="text-violet-300 font-bold">Z⁰ dep.</span></li>
                  <li className="flex justify-between"><span className="text-slate-400">Photoelectric:</span> <span className="text-violet-300 font-bold">Z³ dep.</span></li>
                </ul>
              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}

function TabButton({ id, icon, label, isActive, onClick }: any) {
  return (
    <button
      onClick={onClick}
      className={`flex flex-1 sm:flex-none items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-bold transition-all ${
        isActive ? 'bg-slate-800 text-white border border-slate-500 shadow-sm' : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200 border border-transparent'
      }`}
    >
      {icon}
      {label}
    </button>
  );
}

function FilterButton({ id, label, icon, active, onClick, color }: { id: string, label: string, icon: React.ReactNode, active: boolean, onClick: () => void, color: 'sky' | 'emerald' | 'violet' | 'slate' }) {
  const activeClass = {
    sky: 'bg-sky-500 text-[#060b14] border-sky-500 shadow-[0_0_15px_rgba(56,189,248,0.3)]',
    emerald: 'bg-emerald-500 text-[#060b14] border-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.3)]',
    violet: 'bg-violet-500 text-[#060b14] border-violet-500 shadow-[0_0_15px_rgba(139,92,246,0.3)]',
    slate: 'bg-slate-200 text-slate-900 border-slate-300 shadow-md'
  }[color];

  const inactiveClass = `border-slate-700 bg-[#060b14] text-slate-400 hover:bg-slate-800 hover:text-white hover:border-${color}-500/50`;

  return (
    <button onClick={onClick} className={`flex items-center justify-between rounded-xl px-4 py-3 text-sm font-bold transition-all border ${active ? activeClass : inactiveClass}`}>
      <span className="flex items-center gap-3">{icon} {label}</span>
    </button>
  );
}

function ReadinessStats({ score, answeredCount, totalQuestions }: any) {
  const acc = answeredCount > 0 ? Math.round((score / answeredCount) * 100) : 0;
  const progress = totalQuestions > 0 ? Math.round((answeredCount / totalQuestions) * 100) : 0;
  
  return (
    <>
      <div className="flex flex-col items-center">
        <div className="text-3xl font-black text-white">{score} <span className="text-sm font-medium text-slate-600">/ {answeredCount}</span></div>
        <div className="text-[10px] uppercase tracking-widest text-slate-500 mt-2 font-bold">Correct</div>
      </div>
      <div className="w-px h-12 bg-slate-800"></div>
      <div className="flex flex-col items-center">
        <div className="text-3xl font-black text-emerald-400">{acc}%</div>
        <div className="text-[10px] uppercase tracking-widest text-slate-500 mt-2 font-bold">Accuracy</div>
      </div>
      <div className="w-px h-12 bg-slate-800"></div>
      <div className="flex flex-col items-center">
        <div className="text-3xl font-black text-sky-400">{progress}%</div>
        <div className="text-[10px] uppercase tracking-widest text-slate-500 mt-2 font-bold">Completed</div>
      </div>
    </>
  );
}

function QuizzesTab({ filter, mode, score, setScore, answeredCount, setAnsweredCount, setTotalQuestions }: any) {
  const filteredQuizzes = useMemo(() => filter === 'ALL' ? quizVignettes : quizVignettes.filter(q => q.pillar === filter), [filter]);
  
  useEffect(() => {
    setTotalQuestions(filteredQuizzes.length);
  }, [filteredQuizzes.length, setTotalQuestions]);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);

  useEffect(() => {
    setCurrentIndex(0);
    setSelectedAnswer(null);
  }, [filter]);

  if (filteredQuizzes.length === 0) {
    return <div className="text-center py-24 text-lg font-medium text-slate-400 flex flex-col items-center gap-4"><Library className="h-12 w-12 text-slate-700"/> No questions available for this module yet.</div>;
  }

  const quiz = filteredQuizzes[currentIndex];
  const pStyle = PILLAR_STYLES[quiz.pillar];

  const handleSelect = (id: string) => {
    if (selectedAnswer) return;
    setSelectedAnswer(id);
    setAnsweredCount((prev: number) => prev + 1);
    if (id === quiz.correctAnswerId) setScore((prev: number) => prev + 1);
  };

  const nextQuiz = () => {
    setSelectedAnswer(null);
    setCurrentIndex(prev => (prev + 1) % filteredQuizzes.length);
  };
  const prevQuiz = () => {
    setSelectedAnswer(null);
    setCurrentIndex(prev => (prev - 1 + filteredQuizzes.length) % filteredQuizzes.length);
  };

  const formattedClinicalCase = quiz.clinicalCase
    .replace(/((\d+-year-old|\d+ yo)( male| female)?|pT\d[a-c]? pN\d[a-c]?|ER\+|PR\+|HER2-|lumpectomy|mastectomy|\d+ Gy in \d+ fractions|SBRT|EBRT)/gi, '<strong class="text-white bg-slate-800 px-1 py-0.5 rounded border border-slate-700">$1</strong>');

  return (
    <div className="flex flex-col h-full flex-1">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 pb-5 border-b border-slate-800">
        <div className="flex flex-wrap items-center gap-3">
          <span className={`inline-flex items-center gap-1.5 rounded-lg ${pStyle.bg} px-3 py-1.5 text-xs font-bold ${pStyle.text} uppercase tracking-widest border ${pStyle.border} shadow-sm`}>
            {pStyle.icon}
            {quiz.pillar}
          </span>
          <span className="inline-flex items-center text-xs font-bold text-slate-300 uppercase tracking-widest border border-slate-700 rounded-lg px-3 py-1.5 bg-slate-800/50 shadow-sm">
            {quiz.category}
          </span>
        </div>
        <div className="flex items-center gap-5 text-sm font-bold text-slate-400 bg-slate-900 px-4 py-2 rounded-xl border border-slate-800 shadow-inner">
          <button onClick={prevQuiz} className={`hover:${pStyle.text} transition p-1`}><ArrowLeft className="h-4 w-4"/></button>
          <span className="tracking-widest uppercase text-[10px]">Q {currentIndex + 1} OF {filteredQuizzes.length}</span>
          <button onClick={nextQuiz} className={`hover:${pStyle.text} transition p-1`}><ArrowRight className="h-4 w-4"/></button>
        </div>
      </div>

      {/* Clinical Vignette Box */}
      <div className="mb-8 rounded-2xl border border-slate-700 bg-slate-900/90 p-6 sm:p-10 shadow-2xl relative overflow-hidden">
        <div className={`absolute top-0 left-0 w-1.5 h-full ${pStyle.bg.replace('/20', '/80')} ${pStyle.glow}`}></div>
        <h2 className="text-lg sm:text-xl font-medium leading-loose text-slate-300" dangerouslySetInnerHTML={{ __html: formattedClinicalCase }}></h2>
      </div>

      {/* Options */}
      <div className="space-y-4 mb-8">
        {quiz.options.map(option => {
          const isSelected = selectedAnswer === option.id;
          const isCorrect = option.id === quiz.correctAnswerId;
          const showCorrectness = selectedAnswer !== null; 
          const isDistractor = showCorrectness && !isCorrect && (isSelected || mode === 'tutor');

          let buttonClass = "group w-full flex flex-col gap-2 rounded-2xl border border-slate-700 bg-[#0d1527] p-5 sm:p-6 text-left transition-all hover:border-slate-500/50 hover:bg-slate-800/80 shadow-md";
          let badgeClass = "flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 border-slate-600 bg-slate-800 text-base font-black text-slate-400 transition-colors group-hover:border-slate-400 group-hover:text-slate-300 group-hover:bg-slate-700";
          let icon = null;

          if (showCorrectness) {
            if (isCorrect) {
              buttonClass = "w-full flex flex-col gap-2 rounded-2xl border-2 border-emerald-500 bg-emerald-900/10 p-5 sm:p-6 text-left shadow-[0_0_20px_rgba(16,185,129,0.15)] transition-all";
              badgeClass = "flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 border-emerald-500 bg-emerald-500 text-base font-black text-[#060b14]";
              icon = <CheckCircle className="h-7 w-7 text-emerald-500 shrink-0" />;
            } else if (isSelected) {
              buttonClass = "w-full flex flex-col gap-2 rounded-2xl border-2 border-rose-500/80 bg-rose-900/10 p-5 sm:p-6 text-left transition-all";
              badgeClass = "flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 border-rose-500 bg-rose-500 text-base font-black text-[#060b14]";
              icon = <XCircle className="h-7 w-7 text-rose-500 shrink-0" />;
            } else {
              buttonClass = "w-full flex flex-col gap-2 rounded-2xl border border-slate-800 bg-[#0a101d] p-5 sm:p-6 text-left text-slate-500 opacity-70";
              badgeClass = "flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 border-slate-700 bg-slate-800 text-base font-black text-slate-600";
            }
          }

          return (
            <button key={option.id} onClick={() => handleSelect(option.id)} disabled={!!selectedAnswer} className={buttonClass}>
              <div className="flex items-center gap-5 w-full">
                <span className={badgeClass}>{option.id}</span>
                <span className={`text-base sm:text-lg font-medium ${showCorrectness && isCorrect ? 'text-emerald-100' : ''}`}>{option.text}</span>
                <div className="ml-auto">{icon}</div>
              </div>
              {/* Distractor Rationale for Tutor Mode */}
              {isDistractor && quiz.distractorRationale && quiz.distractorRationale[option.id] && (
                <div className="mt-3 ml-15 pl-4 border-l-2 border-rose-500/30 text-sm text-slate-400 animate-in fade-in slide-in-from-top-2">
                  <span className="font-bold text-rose-400 mr-2">Why incorrect:</span>
                  {quiz.distractorRationale[option.id]}
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Rationale Card (Tutor Mode) */}
      {selectedAnswer && mode === 'tutor' && (
        <div className="mt-auto animate-in fade-in slide-in-from-bottom-6">
          <div className={`rounded-3xl border ${pStyle.border} bg-gradient-to-br from-[#0c1a2e] to-[#0c1322] p-8 sm:p-10 shadow-2xl relative overflow-hidden`}>
             <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
                <Target className="w-40 h-40" />
             </div>
            <div className="flex flex-wrap items-center justify-between gap-4 mb-6 relative z-10">
              <h3 className={`text-sm font-black tracking-widest uppercase flex items-center gap-3 ${pStyle.text}`}>
                <AlertCircle className="h-5 w-5" />
                Correct Answer Rationale
              </h3>
              <span className={`inline-flex rounded-lg ${pStyle.bg} px-3 py-1.5 text-[10px] font-black ${pStyle.text} uppercase tracking-widest border ${pStyle.border} shadow-sm`}>
                High-Yield Board Concept
              </span>
            </div>
            
            <p className="mb-8 text-base sm:text-lg leading-relaxed text-slate-200 relative z-10 font-medium">{quiz.explanation}</p>
            
            <div className="mb-8 rounded-2xl bg-[#060b14]/80 p-6 border border-slate-700/80 shadow-inner relative z-10">
              <div className="text-xs font-black text-slate-400 mb-4 uppercase tracking-widest flex items-center gap-2"><Target className="w-4 h-4"/> Reference Summary</div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-sm">
                <div><span className={`${pStyle.text} block text-[10px] font-bold uppercase tracking-widest mb-1`}>Source / Landmark</span> <span className="text-slate-100 font-medium text-base">{quiz.landmarkTrialTitle}</span></div>
                <div><span className={`${pStyle.text} block text-[10px] font-bold uppercase tracking-widest mb-1`}>Topic</span> <span className="text-slate-100 font-medium text-base">{quiz.category}</span></div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-between border-t border-slate-700/80 pt-8 gap-4 relative z-10">
              <a href={quiz.doiUrl} target="_blank" rel="noreferrer" className={`w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-[#0d1527] border border-slate-600 px-6 py-3.5 text-xs font-bold ${pStyle.text} hover:bg-slate-800 transition shadow-md`}>
                <ArrowUpRight className="h-4 w-4" />
                Review Full Evidence
              </a>
              <button onClick={nextQuiz} className={`w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-slate-200 px-8 py-3.5 text-sm font-black text-slate-900 hover:bg-white transition shadow-lg`}>
                Next Question <ArrowRight className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Next button for exam mode */}
      {selectedAnswer && mode === 'exam' && (
         <div className="mt-auto flex justify-end pt-8 border-t border-slate-800">
             <button onClick={nextQuiz} className="inline-flex items-center gap-2 rounded-xl bg-amber-500 px-8 py-3.5 text-sm font-black text-amber-950 hover:bg-amber-400 transition shadow-[0_0_20px_rgba(245,158,11,0.3)]">
                Next Question <ArrowRight className="h-5 w-5" />
              </button>
         </div>
      )}
    </div>
  );
}

function FlashcardsTab({ filter }: any) {
  const filtered = filter === 'ALL' ? flashcards : flashcards.filter(fc => fc.pillar === filter);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);

  useEffect(() => {
    setCurrentIndex(0);
    setFlipped(false);
  }, [filter]);

  if (filtered.length === 0) return <div className="text-center py-24 text-lg font-medium text-slate-400 flex flex-col items-center gap-4"><BookOpen className="h-12 w-12 text-slate-700"/> No flashcards for this module.</div>;
  const fc = filtered[currentIndex];
  const pStyle = PILLAR_STYLES[fc.pillar];

  const nextCard = () => {
    setFlipped(false);
    setTimeout(() => {
      setCurrentIndex(prev => (prev + 1) % filtered.length);
    }, 200);
  };

  return (
    <div className="flex flex-col h-full items-center justify-center p-4 sm:p-10 flex-1">
      <div className="w-full max-w-3xl relative h-[500px] [perspective:1500px]">
        <div className={`relative h-full w-full transition-all duration-700 ease-in-out [transform-style:preserve-3d] cursor-pointer shadow-2xl rounded-[2rem] ${flipped ? '[transform:rotateY(180deg)]' : ''}`} onClick={() => setFlipped(!flipped)}>
          {/* Front */}
          <div className="absolute inset-0 flex flex-col justify-center rounded-[2rem] border border-slate-700 bg-gradient-to-br from-[#131f33] to-[#0c1322] p-12 text-center [backface-visibility:hidden] hover:border-slate-500/50 transition-colors">
            <div className={`absolute top-8 left-8 rounded-lg ${pStyle.bg} px-4 py-2 text-xs font-black ${pStyle.text} uppercase tracking-widest border ${pStyle.border} flex items-center gap-2`}>{pStyle.icon} {fc.category}</div>
            <div className="absolute top-8 right-8 text-sm text-slate-500 font-bold tracking-widest bg-slate-900/50 px-4 py-2 rounded-lg">{currentIndex + 1} / {filtered.length}</div>
            <h3 className="text-2xl sm:text-3xl font-medium leading-relaxed text-white">{fc.question}</h3>
            <div className="absolute bottom-10 left-0 right-0 text-sm font-bold tracking-widest uppercase text-slate-500 animate-pulse flex items-center justify-center gap-2"><ArrowRight className="h-4 w-4"/> Click anywhere to flip <ArrowLeft className="h-4 w-4"/></div>
          </div>
          {/* Back */}
          <div className={`absolute inset-0 flex flex-col justify-between rounded-[2rem] border ${pStyle.border} bg-gradient-to-br from-[#0a1a15] to-[#06100d] p-10 sm:p-12 text-left [backface-visibility:hidden] [transform:rotateY(180deg)] ${pStyle.glow}`}>
            <h3 className={`text-xl sm:text-2xl font-black ${pStyle.text} mb-6 uppercase tracking-widest border-b border-slate-800 pb-6`}>{fc.trialName}</h3>
            <div className="space-y-5 text-sm sm:text-base flex-1">
              <div className="grid grid-cols-[30px_1fr] gap-3 items-start"><strong className={`${pStyle.text} text-lg`}>P:</strong> <span className="text-slate-200 leading-relaxed font-medium mt-1">{fc.answerPopulation}</span></div>
              <div className="grid grid-cols-[30px_1fr] gap-3 items-start"><strong className={`${pStyle.text} text-lg`}>I:</strong> <span className="text-slate-200 leading-relaxed font-medium mt-1">{fc.answerIntervention}</span></div>
              <div className="grid grid-cols-[30px_1fr] gap-3 items-start"><strong className={`${pStyle.text} text-lg`}>C:</strong> <span className="text-slate-200 leading-relaxed font-medium mt-1">{fc.answerControl}</span></div>
              <div className="grid grid-cols-[30px_1fr] gap-3 items-start"><strong className={`${pStyle.text} text-lg`}>O:</strong> <span className="text-white leading-relaxed font-bold mt-1">{fc.answerOutcome}</span></div>
            </div>
            <div className="mt-8 rounded-2xl bg-[#060b14]/50 p-5 border border-slate-800 shadow-inner">
              <div className={`text-[11px] font-black ${pStyle.text} uppercase tracking-widest mb-2 flex items-center gap-2`}><CheckCircle className="w-4 h-4"/> Key Takeaway</div>
              <div className="text-base font-semibold text-slate-100 leading-relaxed">{fc.keyTakeaway}</div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Confidence Scoring (only visible when flipped) */}
      <div className={`mt-10 flex flex-wrap justify-center items-center gap-4 sm:gap-6 transition-all duration-500 ${flipped ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'}`}>
        <button onClick={(e) => { e.stopPropagation(); nextCard(); }} className="rounded-2xl border-2 border-rose-500/30 bg-[#060b14] px-8 py-3 sm:py-4 text-sm font-black tracking-widest uppercase text-rose-500 hover:bg-rose-500 hover:text-rose-950 transition shadow-lg hover:shadow-rose-500/30">Hard</button>
        <button onClick={(e) => { e.stopPropagation(); nextCard(); }} className="rounded-2xl border-2 border-amber-500/30 bg-[#060b14] px-8 py-3 sm:py-4 text-sm font-black tracking-widest uppercase text-amber-500 hover:bg-amber-500 hover:text-amber-950 transition shadow-lg hover:shadow-amber-500/30">Good</button>
        <button onClick={(e) => { e.stopPropagation(); nextCard(); }} className="rounded-2xl border-2 border-emerald-500/30 bg-[#060b14] px-8 py-3 sm:py-4 text-sm font-black tracking-widest uppercase text-emerald-500 hover:bg-emerald-500 hover:text-emerald-950 transition shadow-lg hover:shadow-emerald-500/30">Easy</button>
      </div>
    </div>
  );
}

function RadiobiologyTab() {
  const [regA, setRegA] = useState({ totalDose: 60, fractions: 30 });
  const [regB, setRegB] = useState({ totalDose: 40, fractions: 15 });

  const calc = (totalDose: number, fractions: number, ab: number) => {
    if (!fractions) return { bed: 0, eqd2: 0 };
    const d = totalDose / fractions;
    const bed = totalDose * (1 + d / ab);
    const eqd2 = bed / (1 + 2 / ab);
    return { bed, eqd2 };
  };

  const resA10 = calc(regA.totalDose, regA.fractions, 10);
  const resA3 = calc(regA.totalDose, regA.fractions, 3);
  const resB10 = calc(regB.totalDose, regB.fractions, 10);
  const resB3 = calc(regB.totalDose, regB.fractions, 3);

  return (
    <div className="flex flex-col h-full flex-1 w-full max-w-5xl mx-auto py-4">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-white flex items-center gap-3"><Activity className="w-8 h-8 text-emerald-400"/> Live Radiobiological Comparator</h2>
        <p className="text-base text-slate-400 mt-2 font-medium">Compare standard fractionation vs hypofractionation with live BED and EQD2 math (Linear-Quadratic Model).</p>
      </div>

      <div className="grid gap-8 md:grid-cols-2 mb-10">
        <RegimenCard title="Standard Regimen (A)" reg={regA} setReg={setRegA} color="sky" />
        <RegimenCard title="Alternative Regimen (B)" reg={regB} setReg={setRegB} color="amber" />
      </div>

      <div className="overflow-hidden rounded-3xl border border-slate-700 shadow-2xl bg-[#060b14]">
        <table className="w-full text-left text-sm text-slate-300">
          <thead className="bg-[#0a101d] border-b border-slate-700 text-xs font-black text-slate-400 uppercase tracking-widest">
            <tr>
              <th className="px-8 py-5">Effect / Parameter</th>
              <th className="px-8 py-5 text-right">Regimen A</th>
              <th className="px-8 py-5 text-right">Regimen B</th>
              <th className="px-8 py-5 text-center bg-slate-900/50">Δ Difference</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800">
            <tr className="hover:bg-slate-900/50 transition duration-300">
              <td className="px-8 py-7">
                <div className="text-base font-bold text-white mb-1.5 flex items-center gap-2"><Target className="w-4 h-4 text-sky-400"/> Tumor / Acute Control</div>
                <div className="text-xs text-slate-500 font-mono font-bold tracking-widest">α/β = 10 (BED₁₀ / EQD2₁₀)</div>
              </td>
              <td className="px-8 py-7 text-right font-mono">
                <div className="text-sky-400 text-xl font-bold mb-1">{resA10.bed.toFixed(1)} <span className="text-xs text-slate-500 tracking-wider">Gy₁₀</span></div>
                <div className="text-slate-300 text-base">{resA10.eqd2.toFixed(1)} <span className="text-xs text-slate-500 tracking-wider">EQD2</span></div>
              </td>
              <td className="px-8 py-7 text-right font-mono">
                <div className="text-amber-400 text-xl font-bold mb-1">{resB10.bed.toFixed(1)} <span className="text-xs text-slate-500 tracking-wider">Gy₁₀</span></div>
                <div className="text-slate-300 text-base">{resB10.eqd2.toFixed(1)} <span className="text-xs text-slate-500 tracking-wider">EQD2</span></div>
              </td>
              <td className="px-8 py-7 text-center font-mono bg-slate-900/30">
                <div className={`text-lg font-bold ${resB10.eqd2 - resA10.eqd2 > 0 ? 'text-emerald-400' : resB10.eqd2 - resA10.eqd2 < 0 ? 'text-rose-400' : 'text-slate-500'}`}>
                  {(resB10.eqd2 - resA10.eqd2) > 0 ? '+' : ''}{(resB10.eqd2 - resA10.eqd2).toFixed(1)}
                </div>
              </td>
            </tr>
            <tr className="hover:bg-slate-900/50 transition duration-300">
              <td className="px-8 py-7">
                <div className="text-base font-bold text-white mb-1.5 flex items-center gap-2"><ShieldCheck className="w-4 h-4 text-rose-400"/> Late Normal Tissue</div>
                <div className="text-xs text-slate-500 font-mono font-bold tracking-widest">α/β = 3 (BED₃ / EQD2₃)</div>
              </td>
              <td className="px-8 py-7 text-right font-mono">
                <div className="text-sky-400 text-xl font-bold mb-1">{resA3.bed.toFixed(1)} <span className="text-xs text-slate-500 tracking-wider">Gy₃</span></div>
                <div className="text-slate-300 text-base">{resA3.eqd2.toFixed(1)} <span className="text-xs text-slate-500 tracking-wider">EQD2</span></div>
              </td>
              <td className="px-8 py-7 text-right font-mono">
                <div className="text-amber-400 text-xl font-bold mb-1">{resB3.bed.toFixed(1)} <span className="text-xs text-slate-500 tracking-wider">Gy₃</span></div>
                <div className="text-slate-300 text-base">{resB3.eqd2.toFixed(1)} <span className="text-xs text-slate-500 tracking-wider">EQD2</span></div>
              </td>
              <td className="px-8 py-7 text-center font-mono bg-slate-900/30">
                <div className={`text-lg font-bold ${resB3.eqd2 - resA3.eqd2 > 0 ? 'text-rose-400' : resB3.eqd2 - resA3.eqd2 < 0 ? 'text-emerald-400' : 'text-slate-500'}`}>
                  {(resB3.eqd2 - resA3.eqd2) > 0 ? '+' : ''}{(resB3.eqd2 - resA3.eqd2).toFixed(1)}
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}

function RegimenCard({ title, reg, setReg, color }: any) {
  const borderColor = color === 'sky' ? 'border-sky-500/30' : 'border-amber-500/30';
  const bgColor = color === 'sky' ? 'bg-sky-500/5' : 'bg-amber-500/5';
  const textColor = color === 'sky' ? 'text-sky-400' : 'text-amber-400';
  const shadowColor = color === 'sky' ? 'shadow-sky-500/10' : 'shadow-amber-500/10';

  return (
    <div className={`rounded-3xl border ${borderColor} ${bgColor} p-8 shadow-xl ${shadowColor}`}>
      <h3 className={`mb-6 text-sm font-black uppercase tracking-widest ${textColor}`}>{title}</h3>
      <div className="space-y-6">
        <div>
          <label className="mb-2 block text-[11px] font-black text-slate-400 uppercase tracking-widest">Total Dose (Gy)</label>
          <input type="number" value={reg.totalDose || ''} onChange={e => setReg({ ...reg, totalDose: Number(e.target.value) })} className={`w-full rounded-2xl border-2 border-slate-700 bg-[#060b14] p-4 text-xl font-bold text-white shadow-inner focus:border-${color}-500 focus:outline-none transition-colors`} />
        </div>
        <div>
          <label className="mb-2 block text-[11px] font-black text-slate-400 uppercase tracking-widest">Fractions</label>
          <input type="number" value={reg.fractions || ''} onChange={e => setReg({ ...reg, fractions: Number(e.target.value) })} className={`w-full rounded-2xl border-2 border-slate-700 bg-[#060b14] p-4 text-xl font-bold text-white shadow-inner focus:border-${color}-500 focus:outline-none transition-colors`} />
        </div>
        <div className="pt-4 flex items-center justify-between border-t border-slate-800">
          <div className="text-xs font-black text-slate-500 uppercase tracking-widest mt-2">Dose / Fraction</div>
          <div className="font-mono text-2xl font-black text-white mt-2">{(reg.totalDose / (reg.fractions || 1)).toFixed(2)} <span className="text-sm font-bold text-slate-500 tracking-widest">Gy</span></div>
        </div>
      </div>
    </div>
  );
}

function PearlsTab({ filter }: any) {
  const filtered = filter === 'ALL' ? boardPearls : boardPearls.filter(p => p.pillar === filter);
  if (filtered.length === 0) return <div className="text-center py-24 text-lg font-medium text-slate-400 flex flex-col items-center gap-4"><ChevronRight className="h-12 w-12 text-slate-700"/> No pearls for this module.</div>;

  return (
    <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3 py-4">
      {filtered.map(pearl => {
        const pStyle = PILLAR_STYLES[pearl.pillar];
        return (
          <div key={pearl.id} className={`rounded-3xl border border-slate-700 bg-gradient-to-br from-[#131f33] to-[#0c1322] p-8 shadow-xl hover:${pStyle.border} transition-colors group`}>
            <div className={`mb-6 inline-flex items-center gap-2 rounded-lg ${pStyle.bg} px-3 py-1.5 text-[10px] font-black ${pStyle.text} uppercase tracking-widest border ${pStyle.border}`}>
              {pStyle.icon} {pearl.category}
            </div>
            <h3 className={`mb-6 text-xl font-bold text-white leading-snug group-hover:${pStyle.text} transition-colors`}>{pearl.title}</h3>
            <ul className="space-y-4 text-sm text-slate-300 font-medium">
              {pearl.points.map((pt, i) => (
                <li key={i} className="flex items-start gap-3">
                  <span className={`mt-1.5 block h-2 w-2 shrink-0 rounded-full ${pStyle.bg.replace('/20', '')} ${pStyle.glow}`} />
                  <span className="leading-relaxed">{pt}</span>
                </li>
              ))}
            </ul>
          </div>
        );
      })}
    </div>
  );
}
