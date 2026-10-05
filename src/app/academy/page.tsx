'use client';

import { useState } from 'react';
import { quizVignettes, flashcards, boardPearls, type OrganCategory } from '@/data/academyData';
import { GraduationCap, Library, Activity, BookOpen, CheckCircle, XCircle, RotateCcw, ChevronRight } from 'lucide-react';
import Navbar from '@/components/layout/Navbar';

export default function AcademyPage() {
  const [activeTab, setActiveTab] = useState<'quizzes' | 'flashcards' | 'radiobiology' | 'pearls'>('quizzes');

  return (
    <div className="min-h-screen bg-[#060b14] text-slate-200 selection:bg-sky-500/30">
      <Navbar />
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <header className="mb-8">
          <h1 className="flex items-center gap-3 text-3xl font-bold tracking-tight text-white">
            <GraduationCap className="h-8 w-8 text-sky-400" />
            RadOnco Academy & Study Hub
          </h1>
          <p className="mt-2 text-slate-400">
            Interactive educational workstation and board-exam training portal for Radiation Oncology.
          </p>
        </header>

        {/* Navigation Tabs */}
        <div className="mb-8 flex flex-wrap gap-2 rounded-xl border border-slate-800 bg-[#0c1322] p-2">
          <TabButton id="quizzes" icon={<Library className="h-4 w-4" />} label="Clinical Case Quizzes" isActive={activeTab === 'quizzes'} onClick={() => setActiveTab('quizzes')} />
          <TabButton id="flashcards" icon={<BookOpen className="h-4 w-4" />} label="Landmark Flashcards" isActive={activeTab === 'flashcards'} onClick={() => setActiveTab('flashcards')} />
          <TabButton id="radiobiology" icon={<Activity className="h-4 w-4" />} label="Radiobiology Comparator" isActive={activeTab === 'radiobiology'} onClick={() => setActiveTab('radiobiology')} />
          <TabButton id="pearls" icon={<ChevronRight className="h-4 w-4" />} label="High-Yield Board Pearls" isActive={activeTab === 'pearls'} onClick={() => setActiveTab('pearls')} />
        </div>

        {/* Tab Content */}
        <div className="rounded-2xl border border-slate-800 bg-[#0c1322] p-6 shadow-xl">
          {activeTab === 'quizzes' && <QuizzesTab />}
          {activeTab === 'flashcards' && <FlashcardsTab />}
          {activeTab === 'radiobiology' && <RadiobiologyTab />}
          {activeTab === 'pearls' && <PearlsTab />}
        </div>
      </main>
    </div>
  );
}

function TabButton({ id, icon, label, isActive, onClick }: { id: string, icon: React.ReactNode, label: string, isActive: boolean, onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`flex flex-1 items-center justify-center gap-2 rounded-lg px-4 py-3 text-sm font-medium transition-all ${
        isActive ? 'bg-sky-500/20 text-sky-300 border border-sky-500/30' : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200 border border-transparent'
      }`}
    >
      {icon}
      {label}
    </button>
  );
}

function QuizzesTab() {
  const [currentQuizIndex, setCurrentQuizIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [answeredCount, setAnsweredCount] = useState(0);

  const quiz = quizVignettes[currentQuizIndex];

  const handleSelect = (id: string) => {
    if (selectedAnswer) return;
    setSelectedAnswer(id);
    setAnsweredCount(prev => prev + 1);
    if (id === quiz.correctAnswerId) setScore(prev => prev + 1);
  };

  const nextQuiz = () => {
    setSelectedAnswer(null);
    setCurrentQuizIndex(prev => (prev + 1) % quizVignettes.length);
  };

  const resetQuiz = () => {
    setSelectedAnswer(null);
    setCurrentQuizIndex(0);
    setScore(0);
    setAnsweredCount(0);
  };

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-6 flex items-center justify-between text-sm text-slate-400">
        <div>Progress: {answeredCount} / {quizVignettes.length} (Score: {score})</div>
        <button onClick={resetQuiz} className="flex items-center gap-1 hover:text-sky-400"><RotateCcw className="h-4 w-4" /> Reset</button>
      </div>

      <div className="mb-6 rounded-xl border border-slate-700 bg-[#131f33] p-6 shadow-inner">
        <div className="mb-4 inline-flex items-center rounded-md bg-slate-800 px-2 py-1 text-xs font-semibold text-sky-400 uppercase tracking-wider">{quiz.category}</div>
        <h2 className="text-lg font-medium leading-relaxed text-white">{quiz.clinicalCase}</h2>
      </div>

      <div className="space-y-3">
        {quiz.options.map(option => {
          const isSelected = selectedAnswer === option.id;
          const isCorrect = option.id === quiz.correctAnswerId;
          let buttonClass = "w-full rounded-xl border border-slate-700 bg-[#0d1527] p-4 text-left transition-colors hover:border-slate-500 hover:bg-slate-800";
          let icon = null;

          if (selectedAnswer) {
            if (isCorrect) {
              buttonClass = "w-full rounded-xl border border-emerald-500 bg-emerald-500/10 p-4 text-left text-emerald-200";
              icon = <CheckCircle className="h-5 w-5 text-emerald-500" />;
            } else if (isSelected) {
              buttonClass = "w-full rounded-xl border border-rose-500 bg-rose-500/10 p-4 text-left text-rose-200";
              icon = <XCircle className="h-5 w-5 text-rose-500" />;
            } else {
              buttonClass = "w-full rounded-xl border border-slate-800 bg-[#0a101d] p-4 text-left text-slate-500 opacity-50";
            }
          }

          return (
            <button key={option.id} onClick={() => handleSelect(option.id)} disabled={!!selectedAnswer} className={buttonClass}>
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-3">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full border border-current text-xs font-bold">{option.id}</span>
                  {option.text}
                </span>
                {icon}
              </div>
            </button>
          );
        })}
      </div>

      {selectedAnswer && (
        <div className="mt-8 animate-in fade-in slide-in-from-bottom-2 rounded-xl border border-sky-500/30 bg-sky-900/10 p-6">
          <h3 className="mb-2 text-sm font-bold tracking-wider text-sky-400 uppercase">Clinical Rationale & Evidence Provenance</h3>
          <p className="mb-4 text-sm leading-relaxed text-slate-300">{quiz.explanation}</p>
          <a href={quiz.doiUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-lg bg-slate-800 px-3 py-1.5 text-xs font-medium text-sky-300 hover:bg-slate-700">
            <BookOpen className="h-3.5 w-3.5" />
            {quiz.landmarkTrialTitle}
          </a>
          <div className="mt-6 border-t border-slate-700/50 pt-4 text-right">
            <button onClick={nextQuiz} className="rounded-lg bg-sky-600 px-5 py-2 text-sm font-semibold text-white hover:bg-sky-500">Next Question →</button>
          </div>
        </div>
      )}
    </div>
  );
}

function FlashcardsTab() {
  const [filter, setFilter] = useState<OrganCategory | 'All'>('All');
  const [flipped, setFlipped] = useState<Record<string, boolean>>({});

  const toggleFlip = (id: string) => setFlipped(prev => ({ ...prev, [id]: !prev[id] }));

  const categories = ['All', ...Array.from(new Set(flashcards.map(fc => fc.category)))] as const;
  const filtered = filter === 'All' ? flashcards : flashcards.filter(fc => fc.category === filter);

  return (
    <div>
      <div className="mb-6 flex flex-wrap gap-2">
        {categories.map(cat => (
          <button key={cat} onClick={() => setFilter(cat as typeof filter)} className={`rounded-full px-3 py-1 text-xs font-medium border ${filter === cat ? 'bg-sky-500/20 border-sky-500/50 text-sky-300' : 'border-slate-700 bg-slate-800 text-slate-400 hover:bg-slate-700'}`}>
            {cat}
          </button>
        ))}
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filtered.map(fc => (
          <div key={fc.id} className="relative h-80 w-full [perspective:1000px]">
            <div className={`relative h-full w-full transition-transform duration-500 [transform-style:preserve-3d] cursor-pointer ${flipped[fc.id] ? '[transform:rotateY(180deg)]' : ''}`} onClick={() => toggleFlip(fc.id)}>
              {/* Front */}
              <div className="absolute inset-0 flex flex-col justify-center rounded-2xl border border-slate-700 bg-gradient-to-br from-[#131f33] to-[#0d1527] p-6 text-center shadow-lg [backface-visibility:hidden]">
                <div className="absolute top-4 left-4 rounded bg-slate-800 px-2 py-1 text-[10px] font-bold text-sky-400 uppercase">{fc.category}</div>
                <h3 className="text-lg font-medium leading-relaxed text-white">{fc.question}</h3>
                <div className="absolute bottom-4 left-0 right-0 text-xs text-slate-500">Click to flip</div>
              </div>
              {/* Back */}
              <div className="absolute inset-0 flex flex-col justify-between rounded-2xl border border-emerald-500/30 bg-gradient-to-br from-[#0c1815] to-[#08100e] p-6 text-left shadow-lg [backface-visibility:hidden] [transform:rotateY(180deg)]">
                <div className="space-y-2 text-xs">
                  <div><strong className="text-emerald-400">P:</strong> <span className="text-slate-300">{fc.answerPopulation}</span></div>
                  <div><strong className="text-emerald-400">I:</strong> <span className="text-slate-300">{fc.answerIntervention}</span></div>
                  <div><strong className="text-emerald-400">C:</strong> <span className="text-slate-300">{fc.answerControl}</span></div>
                  <div><strong className="text-emerald-400">O:</strong> <span className="text-slate-300">{fc.answerOutcome}</span></div>
                </div>
                <div className="mt-4 border-t border-emerald-900/50 pt-3">
                  <div className="text-[10px] font-bold text-emerald-500 uppercase">{fc.trialName}</div>
                  <div className="text-xs text-emerald-100">{fc.keyTakeaway}</div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function RadiobiologyTab() {
  const [regA, setRegA] = useState({ totalDose: 60, fractions: 30 });
  const [regB, setRegB] = useState({ totalDose: 60, fractions: 20 });

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
    <div className="mx-auto max-w-4xl space-y-8">
      <div className="grid gap-8 md:grid-cols-2">
        <RegimenCard title="Regimen A" reg={regA} setReg={setRegA} />
        <RegimenCard title="Regimen B" reg={regB} setReg={setRegB} />
      </div>

      <div className="overflow-hidden rounded-xl border border-slate-700 bg-[#131f33]">
        <table className="w-full text-left text-sm text-slate-300">
          <thead className="bg-slate-800 text-xs font-semibold text-slate-400 uppercase">
            <tr>
              <th className="px-4 py-3">Parameter</th>
              <th className="px-4 py-3 text-right">Regimen A</th>
              <th className="px-4 py-3 text-right">Regimen B</th>
              <th className="px-4 py-3 text-center">Diff</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-700/50">
            <tr>
              <td className="px-4 py-3"><div className="font-medium text-white">Tumor / Acute (α/β = 10)</div><div className="text-xs text-slate-500">BED₁₀ / EQD2₁₀</div></td>
              <td className="px-4 py-3 text-right font-mono"><span className="text-sky-300">{resA10.bed.toFixed(1)}</span> / {resA10.eqd2.toFixed(1)} Gy</td>
              <td className="px-4 py-3 text-right font-mono"><span className="text-sky-300">{resB10.bed.toFixed(1)}</span> / {resB10.eqd2.toFixed(1)} Gy</td>
              <td className="px-4 py-3 text-center text-xs">{(resB10.bed - resA10.bed) > 0 ? '+' : ''}{(resB10.bed - resA10.bed).toFixed(1)}</td>
            </tr>
            <tr>
              <td className="px-4 py-3"><div className="font-medium text-white">Late Effects (α/β = 3)</div><div className="text-xs text-slate-500">BED₃ / EQD2₃</div></td>
              <td className="px-4 py-3 text-right font-mono"><span className="text-rose-300">{resA3.bed.toFixed(1)}</span> / {resA3.eqd2.toFixed(1)} Gy</td>
              <td className="px-4 py-3 text-right font-mono"><span className="text-rose-300">{resB3.bed.toFixed(1)}</span> / {resB3.eqd2.toFixed(1)} Gy</td>
              <td className="px-4 py-3 text-center text-xs">{(resB3.bed - resA3.bed) > 0 ? '+' : ''}{(resB3.bed - resA3.bed).toFixed(1)}</td>
            </tr>
          </tbody>
        </table>
      </div>
      <div className="rounded-xl bg-sky-900/10 border border-sky-500/20 p-4 text-sm text-sky-200">
        <strong>Clinical Interpretation:</strong> Regimen B provides a {(resB10.eqd2 - resA10.eqd2).toFixed(1)} Gy difference in EQD2₁₀ (tumor effect) and a {(resB3.eqd2 - resA3.eqd2).toFixed(1)} Gy difference in EQD2₃ (late normal tissue effect) compared to Regimen A.
      </div>
    </div>
  );
}

function RegimenCard({ title, reg, setReg }: { title: string, reg: any, setReg: any }) {
  return (
    <div className="rounded-xl border border-slate-700 bg-[#0d1527] p-5">
      <h3 className="mb-4 text-sm font-bold uppercase text-slate-400">{title}</h3>
      <div className="space-y-4">
        <div>
          <label className="mb-1 block text-xs text-slate-400">Total Dose (Gy)</label>
          <input type="number" value={reg.totalDose} onChange={e => setReg({ ...reg, totalDose: Number(e.target.value) })} className="w-full rounded-lg border border-slate-700 bg-slate-800 p-2 text-white" />
        </div>
        <div>
          <label className="mb-1 block text-xs text-slate-400">Fractions</label>
          <input type="number" value={reg.fractions} onChange={e => setReg({ ...reg, fractions: Number(e.target.value) })} className="w-full rounded-lg border border-slate-700 bg-slate-800 p-2 text-white" />
        </div>
        <div className="pt-2">
          <div className="text-xs text-slate-500">Dose per fraction</div>
          <div className="font-mono text-lg text-slate-200">{(reg.totalDose / (reg.fractions || 1)).toFixed(2)} Gy</div>
        </div>
      </div>
    </div>
  );
}

function PearlsTab() {
  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {boardPearls.map(pearl => (
        <div key={pearl.id} className="rounded-xl border border-slate-700 bg-gradient-to-b from-[#131f33] to-[#0d1527] p-5 shadow-sm">
          <div className="mb-2 inline-block rounded bg-amber-500/10 px-2 py-0.5 text-[10px] font-bold text-amber-500 uppercase">{pearl.category}</div>
          <h3 className="mb-4 text-sm font-bold text-white">{pearl.title}</h3>
          <ul className="space-y-2 text-xs text-slate-300">
            {pearl.points.map((pt, i) => (
              <li key={i} className="flex items-start gap-2">
                <span className="mt-1 block h-1.5 w-1.5 shrink-0 rounded-full bg-sky-400" />
                <span className="leading-relaxed">{pt}</span>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}
