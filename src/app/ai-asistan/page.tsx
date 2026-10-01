'use client';

import { useState } from 'react';
import { Bot, ClipboardCopy, ShieldAlert } from 'lucide-react';

const guidelines = ['NCCN', 'ESTRO', 'ASTRO'] as const;
const templates = [
  {
    label: 'Fractionation review',
    prompt: 'Summarize evidence-based radiotherapy fractionation options for [disease/site and stage]. Distinguish guideline recommendations from trial evidence and list relevant OAR considerations.',
  },
  {
    label: 'Trial summary',
    prompt: 'Critically summarize [trial name]: population, intervention, comparator, primary endpoint, key outcomes, limitations, and applicability to [clinical context]. Cite verifiable sources.',
  },
  {
    label: 'OAR planning review',
    prompt: 'Review planning considerations for [target/site] treated with [dose/fractions]. Separate protocol-specific constraints from general planning aims; do not invent missing thresholds.',
  },
] as const;

export default function AiAssistantPage() {
  const [guideline, setGuideline] = useState<(typeof guidelines)[number]>('NCCN');
  const [question, setQuestion] = useState('');
  const [notice, setNotice] = useState('');

  const addTemplate = (prompt: string) => {
    setQuestion(current => current ? `${current}\n\n${prompt}` : prompt);
    setNotice('');
  };

  const copyPrompt = async () => {
    if (!question.trim()) {
      setNotice('Enter a clinical question before copying.');
      return;
    }
    try {
      await navigator.clipboard.writeText(`${guideline} evidence context requested. Verify all recommendations against the current primary guideline and source literature.\n\n${question.trim()}`);
      setNotice('Prompt copied. No clinical query was sent by this page.');
    } catch (error) {
      console.error('Unable to copy the AI prompt to clipboard.', error);
      setNotice('Clipboard access failed. Select and copy the prompt manually.');
    }
  };

  return (
    <main className="min-h-full bg-[#0a0f1d] px-3 py-6 text-slate-100 sm:px-6 sm:py-9">
      <div className="mx-auto max-w-4xl">
        <header className="mb-6">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.18em] text-emerald-300">
            <Bot className="h-4 w-4" aria-hidden="true" />
            Evidence-aware workspace
          </div>
          <h1 className="mt-2 text-2xl font-bold text-white sm:text-3xl">Onkoloji AI Asistanı</h1>
          <p className="mt-2 text-sm leading-6 text-slate-400">Kılavuz ve klinik kanıtları yapılandırılmış sorularla incelemek için bir prompt hazırlayın.</p>
        </header>

        <div role="alert" className="flex gap-3 rounded-xl border border-amber-500/30 bg-amber-500/10 p-4 text-xs leading-5 text-amber-100">
          <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
          <p><strong>Tıbbi güvenlik uyarısı:</strong> Bu arayüz bir yapay zeka servisine bağlı değildir ve hasta verisi göndermemektedir. Dış AI araçlarına kimlik belirleyici veya gizli hasta bilgisi girmeyin. AI çıktıları hatalı veya eksik olabilir; güncel kılavuzları ve birincil kaynakları doğrulayın.</p>
        </div>

        <section className="mt-4 rounded-2xl border border-slate-800 bg-[#0e1726] p-4 sm:p-6">
          <h2 className="text-sm font-semibold text-white">Kılavuz bağlamı</h2>
          <div className="mt-3 flex flex-wrap gap-2">
            {guidelines.map(item => (
              <button key={item} type="button" onClick={() => setGuideline(item)} aria-pressed={guideline === item}
                className={`rounded-lg border px-4 py-2 text-xs font-bold transition ${guideline === item ? 'border-emerald-400/60 bg-emerald-400/10 text-emerald-100' : 'border-slate-700 text-slate-400 hover:text-white'}`}>
                {item}
              </button>
            ))}
          </div>
          <p className="mt-2 text-[11px] text-slate-500">Seçim yalnızca prompt bağlamına eklenir; bu uygulama guideline içeriğini canlı sorgulamaz.</p>

          <h2 className="mt-6 text-sm font-semibold text-white">Hazır klinik prompt şablonları</h2>
          <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-3">
            {templates.map(template => (
              <button key={template.label} type="button" onClick={() => addTemplate(template.prompt)}
                className="rounded-xl border border-slate-700 bg-slate-900/60 p-3 text-left text-xs font-semibold text-slate-200 transition hover:border-emerald-500/50 hover:bg-slate-900">
                {template.label}
                <span className="mt-1 block text-[10px] font-normal leading-4 text-slate-500">Şablonu prompt alanına ekle</span>
              </button>
            ))}
          </div>

          <label htmlFor="clinical-question" className="mt-5 block text-xs font-semibold text-slate-300">Klinik soru / prompt</label>
          <textarea id="clinical-question" value={question} onChange={event => setQuestion(event.target.value)}
            rows={8} maxLength={6000} placeholder="Klinik bağlamı anonimleştirerek yazın. Hasta kimlik bilgisi eklemeyin."
            className="mt-2 w-full resize-y rounded-xl border border-slate-700 bg-[#0a0f1d] p-3 text-sm leading-6 text-white outline-none placeholder:text-slate-600 focus:border-emerald-500" />
          <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
            <span className="text-[11px] text-slate-500">{question.length}/6000 · Gönderim yapılmaz</span>
            <button type="button" onClick={copyPrompt} className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-3.5 py-2.5 text-xs font-semibold text-white transition hover:bg-emerald-500">
              <ClipboardCopy className="h-4 w-4" aria-hidden="true" />
              Promptu kopyala
            </button>
          </div>
          {notice && <p role="status" className="mt-3 text-xs text-slate-300">{notice}</p>}
        </section>

        <section className="mt-4 rounded-xl border border-slate-800 bg-slate-900/50 p-4 text-xs leading-5 text-slate-400">
          <h2 className="font-semibold text-slate-200">Halüsinasyon koruma kontrol listesi</h2>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            <li>Yanıtta belirtilen çalışma, doz ve popülasyonu birincil kaynaktan doğrulayın.</li>
            <li>Kılavuz sürümü ve erişim tarihini kontrol edin; farklı fraksiyonasyonları doğrudan eşitlemeyin.</li>
            <li>Eksik OAR metriğini modelin varsaymasına izin vermeyin; protokolde doğrulayın.</li>
          </ul>
        </section>
      </div>
    </main>
  );
}
