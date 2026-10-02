'use client';

import Link from 'next/link';
import { ShieldAlert } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';

const sections = {
  tr: [
    { title: 'Kullanım amacı ve kapsam', body: 'RadOnco CDSS eğitim ve klinik karar desteği amacıyla sunulur. Sistem tanı koymaz, tedavi reçete etmez ve hekim değerlendirmesinin, multidisipliner tümör konseyinin veya kurum protokolünün yerine geçmez.' },
    { title: 'Nihai klinik sorumluluk', body: 'Tanı, evre, tedavi endikasyonu, doz, fraksiyonasyon, hedef hacimler ve kritik organ toleranslarına ilişkin nihai karar hastayı değerlendiren yetkili klinik ekibe aittir. Çıktılar tedavi planında kullanılmadan önce radyasyon onkoloğu ve medikal fizik uzmanı tarafından doğrulanmalıdır.' },
    { title: 'Kanıt ve algoritma sınırları', body: 'İçerik ve kaynak sürümleri değişebilir; bir öneri her klinik senaryoya uygulanamaz. OAR metrikleri fraksiyonasyon, kontur tanımı, eşzamanlı tedavi, önceki ışınlama ve hasta özelliklerine bağlıdır. Güncel birincil kaynak ve kurum protokolü ayrıca doğrulanmalıdır.' },
    { title: 'Hasta verisi ve gizlilik', body: 'Bu portala, iletişim formuna veya harici AI hizmetlerine doğrudan tanımlayıcı, hassas ya da gizli hasta bilgisi girmeyin. Klinik örnekleri paylaşmadan önce kurumunuzun veri koruma, etik kurul ve yetkilendirme süreçlerine uyun.' },
  ],
  en: [
    { title: 'Purpose and scope', body: 'RadOnco CDSS is provided for education and clinical decision support. It does not diagnose, prescribe treatment, or replace clinician assessment, multidisciplinary tumor-board review, or institutional protocols.' },
    { title: 'Final clinical responsibility', body: 'Final decisions about diagnosis, stage, treatment indication, dose, fractionation, target volumes, and critical-organ tolerances belong to the qualified clinical team caring for the patient. A radiation oncologist and medical physics professional must verify outputs before they are used in a treatment plan.' },
    { title: 'Evidence and algorithm limitations', body: 'Content and source versions may change; a recommendation may not apply to every clinical scenario. OAR metrics depend on fractionation, contour definitions, concurrent therapy, prior irradiation, and patient factors. Verify current primary sources and institutional protocols independently.' },
    { title: 'Patient data and privacy', body: 'Do not enter directly identifying, sensitive, or confidential patient information into this portal, its contact form, or external AI services. Follow your institution’s data-protection, ethics-review, and authorization processes before sharing clinical examples.' },
  ],
} as const;

export default function DisclaimerPage() {
  const { language } = useLanguage();

  return (
    <main className="min-h-full bg-[#0a0f1d] px-3 py-6 text-slate-100 sm:px-6 sm:py-9">
      <div className="mx-auto max-w-4xl">
        <header className="mb-6 flex items-start gap-3">
          <span className="rounded-xl border border-rose-400/20 bg-rose-400/10 p-2.5 text-rose-300">
            <ShieldAlert className="h-5 w-5" aria-hidden="true" />
          </span>
          <div>
            <div className="text-xs font-bold uppercase tracking-[0.18em] text-rose-300">{language === 'en' ? 'Clinical governance' : 'Klinik yönetişim'}</div>
            <h1 className="mt-2 text-2xl font-bold text-white sm:text-3xl">{language === 'en' ? 'Medical Disclaimer and Clinical Responsibility' : 'Tıbbi Uyarı ve Klinik Sorumluluk'}</h1>
          </div>
        </header>
        <div className="space-y-3">
          {sections[language].map(section => (
            <section key={section.title} className="rounded-2xl border border-slate-800 bg-[#0e1726] p-4 sm:p-5">
              <h2 className="text-sm font-semibold text-white">{section.title}</h2>
              <p className="mt-2 text-xs leading-6 text-slate-400">{section.body}</p>
            </section>
          ))}
        </div>
        <p className="mt-5 rounded-xl border border-amber-500/25 bg-amber-500/5 p-4 text-xs font-semibold leading-5 text-amber-100">
          {language === 'en'
            ? 'RadOnco CDSS outputs must not be used as a treatment decision or as medical advice to a patient.'
            : 'RadOnco CDSS çıktıları doğrudan tedavi kararı veya hastaya yönelik tıbbi öneri olarak kullanılmamalıdır.'}
        </p>
        <div className="mt-4 flex flex-wrap gap-4 text-xs font-semibold">
          <Link href="/gizlilik" className="text-sky-300 hover:text-sky-200">{language === 'en' ? 'Privacy notice' : 'Gizlilik bildirimi'}</Link>
          <Link href="/" className="text-sky-300 hover:text-sky-200">{language === 'en' ? 'Back to portal' : 'Portala dön'}</Link>
        </div>
      </div>
    </main>
  );
}
