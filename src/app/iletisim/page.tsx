'use client';

import { useState, type FormEvent } from 'react';
import Link from 'next/link';
import { Mail, ShieldAlert } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';

export default function ContactContributionPage() {
  const { language } = useLanguage();
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const topic = String(form.get('topic') || '');
    const message = String(form.get('message') || '');
    const topicLabel = language === 'en'
      ? ({ general: 'General feedback', issue: 'Issue report', protocol: 'Clinical protocol contribution', evidence: 'Evidence source suggestion', algorithm: 'Algorithm improvement' } as const)[topic as 'general' | 'issue' | 'protocol' | 'evidence' | 'algorithm']
      : ({ general: 'Genel geri bildirim', issue: 'Hata bildirimi', protocol: 'Klinik protokol katkısı', evidence: 'Kanıt kaynağı önerisi', algorithm: 'Algoritma iyileştirme önerisi' } as const)[topic as 'general' | 'issue' | 'protocol' | 'evidence' | 'algorithm'];
    const subject = encodeURIComponent(`RadOnco portal: ${topicLabel || topic}`);
    const body = encodeURIComponent(message);
    window.location.href = `mailto:harun.pekmezci@sbu.edu.tr?subject=${subject}&body=${body}`;
    setSubmitted(true);
  };

  return (
    <main className="min-h-full bg-[#0a0f1d] px-3 py-6 text-slate-100 sm:px-6 sm:py-9">
      <div className="mx-auto max-w-2xl">
        <header className="mb-6">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.18em] text-sky-300">
            <Mail className="h-4 w-4" aria-hidden="true" />
            {language === 'en' ? 'Feedback & contribution' : 'Geri bildirim ve katkı'}
          </div>
          <h1 className="mt-2 text-2xl font-bold text-white sm:text-3xl">{language === 'en' ? 'Contact and Clinical Contributions' : 'İletişim ve Klinik Katkı'}</h1>
          <p className="mt-2 text-sm leading-6 text-slate-400">{language === 'en' ? 'Send feedback, report an issue, suggest an evidence source, or propose an anonymized protocol improvement.' : 'Geri bildirim, hata bildirimi, kaynak önerisi veya anonim protokol iyileştirme önerisi iletin.'}</p>
        </header>

        <div role="alert" className="mb-4 flex gap-2 rounded-xl border border-amber-500/25 bg-amber-500/5 p-3 text-xs leading-5 text-amber-100/80">
          <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
          {language === 'en'
            ? 'Do not include patient names, dates of birth, record numbers, images, or identifiable clinical data. The form opens an email draft; it does not submit content to this site.'
            : 'Hasta adı, doğum tarihi, dosya numarası, görüntü veya tanımlanabilir klinik veri eklemeyin. Form e-posta taslağı açar; içerik bu sayfaya gönderilmez.'}
        </div>

        <p className="mb-4 text-sm text-slate-300">
          <span className="font-semibold">{language === 'en' ? 'Contact email: ' : 'İletişim e-postası: '}</span>
          <a href="mailto:harun.pekmezci@sbu.edu.tr" className="text-sky-300 underline decoration-sky-300/30 underline-offset-2 hover:text-sky-200">harun.pekmezci@sbu.edu.tr</a>
        </p>

        <form onSubmit={handleSubmit} className="rounded-2xl border border-slate-800 bg-[#0e1726] p-4 sm:p-6">
          <label htmlFor="topic" className="block text-xs font-semibold text-slate-300">{language === 'en' ? 'Contribution type' : 'Bildirim türü'}</label>
          <select id="topic" name="topic" required className="mt-1.5 w-full rounded-lg border border-slate-700 bg-[#0a0f1d] px-3 py-2.5 text-sm text-white outline-none focus:border-sky-500">
            <option value="general">{language === 'en' ? 'General feedback' : 'Genel geri bildirim'}</option>
            <option value="issue">{language === 'en' ? 'Issue report' : 'Hata bildirimi'}</option>
            <option value="protocol">{language === 'en' ? 'Clinical protocol contribution' : 'Klinik protokol katkısı'}</option>
            <option value="evidence">{language === 'en' ? 'Evidence source suggestion' : 'Kaynak / kanıt önerisi'}</option>
            <option value="algorithm">{language === 'en' ? 'Algorithm improvement' : 'Algoritma iyileştirme önerisi'}</option>
          </select>
          <label htmlFor="message" className="mt-4 block text-xs font-semibold text-slate-300">{language === 'en' ? 'Message (anonymized)' : 'Mesaj (anonimleştirilmiş)'}</label>
          <textarea id="message" name="message" required minLength={10} maxLength={4000} rows={7}
            placeholder={language === 'en' ? 'Describe the issue or proposal, expected behavior, and any relevant source.' : 'Açıklama, beklenen davranış ve varsa kaynak bağlantısını yazın.'}
            className="mt-1.5 w-full resize-y rounded-lg border border-slate-700 bg-[#0a0f1d] p-3 text-sm leading-6 text-white outline-none placeholder:text-slate-600 focus:border-sky-500" />
          <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
            <span className="text-[11px] text-slate-400">{language === 'en' ? 'Your email app opens; review the recipient and message before sending.' : 'E-posta istemciniz açılır; alıcı ve metni göndermeden önce inceleyin.'}</span>
            <button type="submit" className="rounded-lg bg-sky-600 px-4 py-2.5 text-xs font-semibold text-white transition hover:bg-sky-500">{language === 'en' ? 'Create email draft' : 'E-posta taslağı oluştur'}</button>
          </div>
          {submitted && <p role="status" className="mt-3 text-xs text-emerald-300">{language === 'en' ? 'Email draft request opened.' : 'E-posta taslağı açma isteği gönderildi.'}</p>}
        </form>
        <div className="mt-4 flex flex-wrap gap-4 text-xs font-semibold">
          <Link href="/gizlilik" className="text-sky-300 hover:text-sky-200">{language === 'en' ? 'Privacy notice' : 'Gizlilik bildirimi'}</Link>
          <Link href="/" className="text-sky-300 hover:text-sky-200">{language === 'en' ? 'Back to portal' : 'Portala dön'}</Link>
        </div>
      </div>
    </main>
  );
}
