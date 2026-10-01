'use client';

import { useState, type FormEvent } from 'react';
import Link from 'next/link';
import { Mail, ShieldAlert } from 'lucide-react';

export default function ContactContributionPage() {
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const topic = String(form.get('topic') || '');
    const message = String(form.get('message') || '');
    const subject = encodeURIComponent(`RadOnco portal: ${topic}`);
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
            Feedback &amp; contribution
          </div>
          <h1 className="mt-2 text-2xl font-bold text-white sm:text-3xl">İletişim ve Klinik Katkı</h1>
          <p className="mt-2 text-sm leading-6 text-slate-400">Geri bildirim, hata bildirimi, kaynak önerisi veya anonim protokol iyileştirme önerisi iletin.</p>
        </header>

        <div role="alert" className="mb-4 flex gap-2 rounded-xl border border-amber-500/25 bg-amber-500/5 p-3 text-xs leading-5 text-amber-100/80">
          <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
          Hasta adı, doğum tarihi, dosya numarası, görüntü veya tanımlanabilir klinik veri eklemeyin. Form e-posta taslağı açar; içerik bu sayfaya gönderilmez.
        </div>

        <form onSubmit={handleSubmit} className="rounded-2xl border border-slate-800 bg-[#0e1726] p-4 sm:p-6">
          <label htmlFor="topic" className="block text-xs font-semibold text-slate-300">Bildirim türü</label>
          <select id="topic" name="topic" required className="mt-1.5 w-full rounded-lg border border-slate-700 bg-[#0a0f1d] px-3 py-2.5 text-sm text-white outline-none focus:border-sky-500">
            <option>Genel geri bildirim</option>
            <option>Hata bildirimi</option>
            <option>Klinik protokol katkısı</option>
            <option>Kaynak / kanıt önerisi</option>
            <option>Algoritma optimizasyon önerisi</option>
          </select>
          <label htmlFor="message" className="mt-4 block text-xs font-semibold text-slate-300">Mesaj (anonimleştirilmiş)</label>
          <textarea id="message" name="message" required minLength={10} maxLength={4000} rows={7}
            placeholder="Açıklama, beklenen davranış ve varsa kaynak bağlantısını yazın."
            className="mt-1.5 w-full resize-y rounded-lg border border-slate-700 bg-[#0a0f1d] p-3 text-sm leading-6 text-white outline-none placeholder:text-slate-600 focus:border-sky-500" />
          <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
            <span className="text-[11px] text-slate-500">E-posta istemciniz açılır; alıcı ve metni göndermeden önce inceleyin.</span>
            <button type="submit" className="rounded-lg bg-sky-600 px-4 py-2.5 text-xs font-semibold text-white transition hover:bg-sky-500">E-posta taslağı oluştur</button>
          </div>
          {submitted && <p role="status" className="mt-3 text-xs text-emerald-300">E-posta taslağı açma isteği gönderildi.</p>}
        </form>
        <Link href="/" className="mt-4 inline-flex text-xs font-semibold text-sky-300 hover:text-sky-200">Portal ana sayfasına dön</Link>
      </div>
    </main>
  );
}
