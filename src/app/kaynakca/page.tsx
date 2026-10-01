import Link from 'next/link';
import { ArrowUpRight, BookOpen, ExternalLink } from 'lucide-react';

const sources = [
  { category: 'Kılavuzlar', name: 'NCCN Clinical Practice Guidelines in Oncology', detail: 'Kılavuz sürümü ilgili tümör alanına ve erişim tarihine göre ayrıca doğrulanmalıdır.', url: 'https://www.nccn.org/guidelines' },
  { category: 'Kılavuzlar', name: 'ASTRO Clinical Practice Guidelines', detail: 'Radyasyon onkolojisi için hastalık ve endikasyon bazlı kılavuzlar.', url: 'https://www.astro.org/provider-resources/guidelines' },
  { category: 'Kılavuzlar', name: 'ESTRO Guidelines and Consensus Statements', detail: 'Avrupa radyoterapi uygulamaları ve konsensus dokümanları.', url: 'https://www.estro.org/Science/Guidelines' },
  { category: 'Faz III çalışma', name: 'PACIFIC', detail: 'Evre III KHDAK’ta eşzamanlı kemoradyoterapi sonrasında durvalumab konsolidasyonu.', url: 'https://doi.org/10.1056/NEJMoa1709937' },
  { category: 'Faz III çalışma', name: 'RAPIDO', detail: 'Lokal ileri rektum kanserinde kısa dönem RT ve total neoadjuvan tedavi yaklaşımı.', url: 'https://doi.org/10.1016/S1470-2045(20)30555-6' },
  { category: 'Faz III çalışma', name: 'STAMPEDE', detail: 'İleri prostat kanserinde sistemik tedavi stratejileri; ilgili RT kolu ve popülasyonunu doğrulayın.', url: 'https://www.stampedetrial.org/' },
  { category: 'Faz III çalışma', name: 'PORTEC-3', detail: 'Yüksek riskli endometriyum kanserinde adjuvan kemoradyoterapi karşılaştırması.', url: 'https://doi.org/10.1016/S1470-2045(18)30079-2' },
  { category: 'Faz III çalışma', name: 'FAST-Forward', detail: 'Erken meme kanserinde kısa süreli adjuvan meme radyoterapisi.', url: 'https://doi.org/10.1056/NEJMoa2000756' },
  { category: 'Dozimetri', name: 'QUANTEC', detail: 'Konvansiyonel fraksiyonasyonda normal doku doz-hacim etkilerine ilişkin organ-spesifik derlemeler.', url: 'https://doi.org/10.1016/j.ijrobp.2009.07.1753' },
  { category: 'Dozimetri', name: 'HyTEC', detail: 'Stereotaktik radyoterapi ve radyocerrahide doz-hacim / toksisite kanıtları.', url: 'https://www.aapm.org/pubs/Reports/RPT_101.pdf' },
  { category: 'Dozimetri', name: 'AAPM TG-101', detail: 'Stereotaktik vücut radyoterapisi için rapor ve uygulama çerçevesi.', url: 'https://www.aapm.org/pubs/Reports/RPT_101.pdf' },
  { category: 'Dozimetri', name: 'UK SABR Consortium', detail: 'Stereotaktik ablative radyoterapi uygulamaları için güncel protokol dokümanları.', url: 'https://www.sabr.org.uk/' },
] as const;

export default function ReferencesPortalPage() {
  return (
    <main className="min-h-full bg-[#0a0f1d] px-3 py-6 text-slate-100 sm:px-6 sm:py-9">
      <div className="mx-auto max-w-6xl">
        <header className="mb-6">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.18em] text-amber-300">
            <BookOpen className="h-4 w-4" aria-hidden="true" />
            Evidence atlas
          </div>
          <h1 className="mt-2 text-2xl font-bold text-white sm:text-3xl">Kaynakça ve Kanıt Atlası</h1>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-400">
            Kılavuzlara, mihenk taşı klinik çalışmalara ve dozimetri kaynaklarına doğrudan erişim. Uygulama içinde gösterilen her öneri, ilgili hasta bağlamı ve güncel kaynakla ayrıca doğrulanmalıdır.
          </p>
        </header>

        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          {sources.map(source => (
            <article key={source.name} className="rounded-2xl border border-slate-800 bg-[#0e1726] p-4 sm:p-5">
              <div className="text-[10px] font-bold uppercase tracking-wider text-amber-300">{source.category}</div>
              <h2 className="mt-2 text-sm font-semibold text-white">{source.name}</h2>
              <p className="mt-2 text-xs leading-5 text-slate-400">{source.detail}</p>
              <a href={source.url} target="_blank" rel="noreferrer" className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold text-sky-300 hover:text-sky-200">
                Kaynağı aç <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
              </a>
            </article>
          ))}
        </div>

        <div className="mt-5 rounded-xl border border-amber-500/20 bg-amber-500/5 p-4 text-xs leading-5 text-amber-100/70">
          Kaynak kayıtları özet niteliğindedir; yayın ve protokol sürümleri değişebilir. Kapsam, sonlanım ve dahil edilme ölçütlerini orijinal yayında kontrol edin.
        </div>
        <Link href="/cdss" className="mt-4 inline-flex items-center gap-1 text-xs font-semibold text-sky-300 hover:text-sky-200">
          Karar Destek Matrisine dön <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
        </Link>
      </div>
    </main>
  );
}
