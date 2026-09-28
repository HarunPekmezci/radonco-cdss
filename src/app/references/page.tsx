'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, BookOpen, ExternalLink, ShieldCheck } from 'lucide-react';

type CategoryId =
  | 'thorax'
  | 'breast'
  | 'gus'
  | 'gis'
  | 'head-neck'
  | 'cns'
  | 'gynecology'
  | 'bone-sarcoma'
  | 'oar';

type Reference = {
  category: CategoryId;
  title: string;
  indication: string;
  publication: string;
  authors: string;
  url: string;
  linkLabel?: string;
};

const pubmedSearch = (query: string) =>
  `https://pubmed.ncbi.nlm.nih.gov/?term=${encodeURIComponent(query)}`;

const categories: { id: CategoryId | 'all'; label: string }[] = [
  { id: 'all', label: 'Tümü' },
  { id: 'thorax', label: 'Toraks' },
  { id: 'breast', label: 'Meme' },
  { id: 'gus', label: 'GÜS' },
  { id: 'gis', label: 'GİS' },
  { id: 'head-neck', label: 'Baş-Boyun' },
  { id: 'cns', label: 'MSS' },
  { id: 'gynecology', label: 'Jinekoloji' },
  { id: 'bone-sarcoma', label: 'Kemik & Sarkom' },
  { id: 'oar', label: 'OAR & Radyobiyoloji' },
];

const references: Reference[] = [
  {
    category: 'thorax',
    title: 'PACIFIC Trial — Durvalumab after Chemoradiotherapy in Stage III NSCLC',
    indication: 'Evre III KHDAK’ta definitif eşzamanlı kemoradyoterapi sonrası durvalumab konsolidasyonu.',
    publication: 'New England Journal of Medicine, 2017',
    authors: 'Antonia SJ et al.',
    url: 'https://doi.org/10.1056/NEJMoa1709937',
    linkLabel: 'DOI',
  },
  {
    category: 'thorax',
    title: 'RTOG 0236 — Stereotactic Body Radiation Therapy for Inoperable Early-Stage Lung Cancer',
    indication: 'Medikal inoperabl, periferik erken evre KHDAK için 54 Gy / 3 fraksiyon SBRT.',
    publication: 'JAMA, 2010',
    authors: 'Timmerman R et al.',
    url: 'https://doi.org/10.1001/jama.2010.261',
    linkLabel: 'DOI',
  },
  {
    category: 'thorax',
    title: 'RTOG 0915 — Comparison of Two SBRT Schedules for Peripheral Stage I NSCLC',
    indication: 'Periferik erken evre KHDAK’ta 48 Gy / 4 fraksiyon ile 34 Gy / tek fraksiyon SBRT karşılaştırması.',
    publication: 'Journal of Clinical Oncology, 2015',
    authors: 'Videtic GMM et al.',
    url: pubmedSearch('RTOG 0915 48 Gy 4 fractions 34 Gy single fraction Videtic'),
    linkLabel: 'PubMed',
  },
  {
    category: 'thorax',
    title: 'Turrisi et al. — Twice-Daily Compared with Once-Daily Thoracic Radiotherapy in Limited SCLC',
    indication: 'Sınırlı evre KHAK’ta eşzamanlı kemoradyoterapide günde iki kez ve günde bir kez RT karşılaştırması.',
    publication: 'New England Journal of Medicine, 1999',
    authors: 'Turrisi AT III et al.',
    url: pubmedSearch('Turrisi twice daily once daily thoracic radiotherapy limited small cell lung cancer 1999'),
    linkLabel: 'PubMed',
  },
  {
    category: 'thorax',
    title: 'CONVERT — Once-Daily versus Twice-Daily Chemoradiotherapy in Limited-Stage SCLC',
    indication: 'Sınırlı evre KHAK’ta eşzamanlı platin-etoposid ve iki farklı torasik RT şemasının karşılaştırılması.',
    publication: 'The Lancet Oncology, 2017',
    authors: 'Faivre-Finn C et al.',
    url: pubmedSearch('CONVERT trial once daily twice daily chemoradiotherapy limited stage small cell lung cancer 2017'),
    linkLabel: 'PubMed',
  },
  {
    category: 'breast',
    title: 'FAST-Forward Phase III — One-Week versus Three-Week Breast Radiotherapy',
    indication: 'Erken evre meme kanserinde adjuvan tüm meme RT’si; 26 Gy / 5 fraksiyon şemasının beş yıllık sonuçları.',
    publication: 'The Lancet, 2020',
    authors: 'Brunt AM et al.',
    url: 'https://doi.org/10.1016/S0140-6736(20)30932-6',
    linkLabel: 'DOI',
  },
  {
    category: 'breast',
    title: 'START-B Trial — Hypofractionated Breast Radiotherapy',
    indication: 'Erken evre meme kanserinde 40 Gy / 15 fraksiyon adjuvan meme RT’si.',
    publication: 'The Lancet, 2008',
    authors: 'START Trialists’ Group',
    url: 'https://doi.org/10.1016/S0140-6736(08)60348-7',
    linkLabel: 'DOI',
  },
  {
    category: 'breast',
    title: 'EORTC 22922 / BIG 1-02 — Internal Mammary and Medial Supraclavicular Irradiation',
    indication: 'Erken evre meme kanserinde internal mammar ve medial supraklavikuler lenfatiklerin bölgesel ışınlanması.',
    publication: 'Journal of Clinical Oncology, 2020 (10 yıllık sonuçlar)',
    authors: 'Poortmans PM et al.',
    url: 'https://doi.org/10.1200/JCO.19.02139',
    linkLabel: 'DOI',
  },
  {
    category: 'gus',
    title: 'CHHiP Trial — Conventional versus Hypofractionated High-Dose Radiotherapy',
    indication: 'Lokalize prostat kanserinde orta hipofraksiyonasyon; 60 Gy / 20 fraksiyon şeması.',
    publication: 'The Lancet Oncology, 2016',
    authors: 'Dearnaley D et al.',
    url: pubmedSearch('CHHiP trial Dearnaley 60 Gy 20 fractions 2016 Lancet Oncology'),
    linkLabel: 'PubMed',
  },
  {
    category: 'gus',
    title: 'PACE-B Phase III — Stereotactic Body Radiotherapy for Localized Prostate Cancer',
    indication: 'Düşük ve orta risk prostat kanserinde 36.25 Gy / 5 fraksiyon SBRT ile konvansiyonel/orta hipofraksiyone RT karşılaştırması.',
    publication: 'New England Journal of Medicine, 2024',
    authors: 'van As N et al.',
    url: 'https://doi.org/10.1056/NEJMoa2309918',
    linkLabel: 'DOI',
  },
  {
    category: 'gus',
    title: 'Bladder Preservation — Radiotherapy with or without Chemotherapy in Muscle-Invasive Bladder Cancer',
    indication: 'Kas invaziv mesane kanserinde mesane koruyucu trimodalite yaklaşımının temel randomize kanıtı.',
    publication: 'New England Journal of Medicine, 2012',
    authors: 'James ND et al.',
    url: 'https://doi.org/10.1056/NEJMoa1106106',
    linkLabel: 'DOI',
  },
  {
    category: 'gis',
    title: 'RAPIDO Phase III — Short-Course Radiotherapy and Total Neoadjuvant Therapy',
    indication: 'Lokal ileri rektum kanserinde kısa dönem RT (5 × 5 Gy) ve konsolidasyon kemoterapisini içeren TNT yaklaşımı.',
    publication: 'The Lancet Oncology, 2021',
    authors: 'Bahadoer RR et al.',
    url: pubmedSearch('RAPIDO trial short course radiotherapy rectal cancer Bahadoer 2021'),
    linkLabel: 'PubMed',
  },
  {
    category: 'gis',
    title: 'CROSS Trial — Neoadjuvant Chemoradiotherapy for Oesophageal or Junctional Cancer',
    indication: 'Özofagus ve gastroözofageal bileşke kanserinde 41.4 Gy neoadjuvan KRT ve paklitaksel/karboplatin.',
    publication: 'New England Journal of Medicine, 2012',
    authors: 'van Hagen P et al.',
    url: 'https://doi.org/10.1056/NEJMoa1112088',
    linkLabel: 'DOI',
  },
  {
    category: 'gis',
    title: 'Nigro Protocol / RTOG 9811 — Definitive Chemoradiotherapy for Anal Cancer',
    indication: 'Anal kanal skuamöz hücreli karsinomunda mitomisin-C ve 5-FU ile definitif RT/kemoradyoterapi yaklaşımı.',
    publication: 'Diseases of the Colon & Rectum, 1974; Journal of Clinical Oncology, 2008',
    authors: 'Nigro ND et al.; Ajani JA et al.',
    url: pubmedSearch('Nigro anal cancer chemoradiation 1974 RTOG 9811 Ajani'),
    linkLabel: 'PubMed',
  },
  {
    category: 'cns',
    title: 'Stupp Protocol — Radiotherapy plus Concomitant and Adjuvant Temozolomide for Glioblastoma',
    indication: 'Glioblastomada cerrahi sonrası 60 Gy RT ile eşzamanlı ve adjuvan temozolomid.',
    publication: 'New England Journal of Medicine, 2005',
    authors: 'Stupp R et al.',
    url: 'https://pubmed.ncbi.nlm.nih.gov/15758009/',
    linkLabel: 'PubMed',
  },
  {
    category: 'cns',
    title: 'RTOG 9802 — Radiation plus PCV in High-Risk Low-Grade Glioma',
    indication: 'Yüksek riskli düşük dereceli gliomda 54 Gy RT’ye adjuvan prokarbazin, lomustin ve vinkristin (PCV) eklenmesi.',
    publication: 'New England Journal of Medicine, 2016',
    authors: 'Buckner JC et al.',
    url: 'https://doi.org/10.1056/NEJMoa1500925',
    linkLabel: 'DOI',
  },
  {
    category: 'cns',
    title: 'NRG Oncology CC001 — Hippocampal Avoidance during WBRT plus Memantine',
    indication: 'Beyin metastazlarında bilişsel işlevi korumaya yönelik hipokampal korumalı tüm beyin RT’si ve memantin.',
    publication: 'Journal of Clinical Oncology, 2020',
    authors: 'Brown PD et al.',
    url: 'https://doi.org/10.1200/JCO.19.02767',
    linkLabel: 'DOI',
  },
  {
    category: 'gynecology',
    title: 'EMBRACE II — Image-Guided Adaptive Brachytherapy in Locally Advanced Cervical Cancer',
    indication: 'Lokal ileri serviks kanserinde kemoradyoterapi sonrası MRI rehberli adaptif brakiterapi ve hedef doz/kısıt stratejileri.',
    publication: 'Radiotherapy and Oncology, 2021',
    authors: 'Pötter R et al.',
    url: 'https://doi.org/10.1016/j.radonc.2021.01.014',
    linkLabel: 'DOI',
  },
  {
    category: 'gynecology',
    title: 'PORTEC-2 — Vaginal Brachytherapy versus Pelvic External-Beam Radiotherapy',
    indication: 'Orta-yüksek risk endometriyum kanserinde vajinal kaf brakiterapisi ile pelvik EBRT’nin karşılaştırılması.',
    publication: 'The Lancet, 2010',
    authors: 'Nout RA et al.',
    url: 'https://pubmed.ncbi.nlm.nih.gov/20729020/',
    linkLabel: 'PubMed',
  },
  {
    category: 'gynecology',
    title: 'PORTEC-3 — Adjuvant Chemoradiotherapy versus Radiotherapy Alone',
    indication: 'Yüksek risk endometriyum kanserinde pelvik EBRT’ye adjuvan kemoterapi eklenmesinin değerlendirilmesi.',
    publication: 'The Lancet Oncology, 2018',
    authors: 'de Boer SM et al.',
    url: 'https://pubmed.ncbi.nlm.nih.gov/29499893/',
    linkLabel: 'PubMed',
  },
  {
    category: 'head-neck',
    title: 'RTOG 1016 — Radiotherapy plus Cetuximab or Cisplatin in HPV-Positive Oropharyngeal Cancer',
    indication: 'HPV-pozitif orofarenks kanserinde sisplatin eşzamanlı KRT standardını destekleyen randomize çalışma.',
    publication: 'The Lancet, 2019',
    authors: 'Gillison ML et al.',
    url: 'https://doi.org/10.1016/S0140-6736(19)32779-X',
    linkLabel: 'DOI',
  },
  {
    category: 'bone-sarcoma',
    title: 'Preoperative versus Postoperative Radiotherapy in Soft-Tissue Sarcoma of the Limbs',
    indication: 'Ekstremite yumuşak doku sarkomunda preoperatif ve postoperatif RT zamanlaması ve toksisite sonuçları.',
    publication: 'The Lancet, 2002',
    authors: 'O’Sullivan B et al.',
    url: pubmedSearch('O Sullivan preoperative postoperative radiotherapy soft tissue sarcoma limbs Lancet 2002'),
    linkLabel: 'PubMed',
  },
  {
    category: 'oar',
    title: 'ICRU Report 83 — Prescribing, Recording, and Reporting IMRT',
    indication: 'IMRT’de doz reçetelendirme, raporlama ve hedef hacim/doz-volüm değerlendirmeleri için uluslararası rapor.',
    publication: 'Journal of the ICRU, 2010',
    authors: 'International Commission on Radiation Units and Measurements',
    url: 'https://doi.org/10.1093/jicru/ndq002',
    linkLabel: 'DOI',
  },
  {
    category: 'oar',
    title: 'ICRU Report 91 — Stereotactic Treatments with Small Photon Beams',
    indication: 'Küçük foton alanlarıyla stereotaktik tedavilerde doz reçetelendirme, kayıt ve raporlama.',
    publication: 'Journal of the ICRU, 2017; journal summary, 2019',
    authors: 'International Commission on Radiation Units and Measurements',
    url: 'https://doi.org/10.1007/s00066-018-1416-x',
    linkLabel: 'DOI',
  },
  {
    category: 'oar',
    title: 'QUANTEC — Use of Normal Tissue Complication Probability Models in the Clinic',
    indication: 'Normal doku komplikasyon olasılığı modelleri ve klinik doz-kısıt kararları için temel derleme.',
    publication: 'International Journal of Radiation Oncology, Biology, Physics, 2010',
    authors: 'Marks LB et al.',
    url: 'https://pubmed.ncbi.nlm.nih.gov/20171502/',
    linkLabel: 'PubMed',
  },
];

export default function ReferencesPage() {
  const [activeCategory, setActiveCategory] = useState<CategoryId | 'all'>('all');
  const filteredReferences = useMemo(
    () => activeCategory === 'all'
      ? references
      : references.filter(reference => reference.category === activeCategory),
    [activeCategory],
  );

  return (
    <main className="min-h-screen bg-[#070b14] px-4 py-6 text-slate-100 sm:px-6 md:p-12">
      <div className="mx-auto w-full max-w-7xl">
        <Link
          href="/"
          className="mb-8 inline-flex items-center gap-2 rounded-lg border border-slate-700 bg-[#0e1726] px-3 py-2 text-sm font-medium text-slate-200 transition hover:border-sky-500/60 hover:bg-[#131f33] hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          Ana Karar Destek Paneline Dön
        </Link>

        <header className="mb-8 max-w-4xl">
          <div className="mb-3 flex items-center gap-2 text-sky-300">
            <BookOpen className="h-5 w-5" aria-hidden="true" />
            <span className="text-xs font-semibold uppercase tracking-[0.16em]">RadOnc CDSS • Kaynak Atlası</span>
          </div>
          <h1 className="text-2xl font-bold leading-tight tracking-tight text-white sm:text-3xl md:text-4xl">
            📚 Klinik Kılavuzlar, Randomize Çalışmalar ve Bilimsel Kanıt Atlası
          </h1>
          <p className="mt-4 max-w-3xl text-sm leading-6 text-slate-400 sm:text-base">
            RadOnc CDSS sisteminde kullanılan tüm fraksiyonasyon şemaları, hedef hacim tanımları ve dozimetrik kısıtların literatür kaynakları.
          </p>
        </header>

        <section aria-label="Referans kategorileri" className="mb-6">
          <div className="flex gap-2 overflow-x-auto pb-2">
            {categories.map(category => {
              const isActive = activeCategory === category.id;
              return (
                <button
                  key={category.id}
                  type="button"
                  aria-pressed={isActive}
                  onClick={() => setActiveCategory(category.id)}
                  className={`shrink-0 rounded-lg border px-3 py-2 text-xs font-semibold transition sm:text-sm ${
                    isActive
                      ? 'border-sky-400 bg-sky-500/15 text-sky-200 ring-1 ring-sky-500/50'
                      : 'border-slate-800 bg-[#0e1726] text-slate-400 hover:border-slate-600 hover:text-slate-100'
                  }`}
                >
                  {category.label}
                </button>
              );
            })}
          </div>
        </section>

        <section aria-live="polite" aria-label="Bilimsel referanslar">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-slate-200">
              {activeCategory === 'all'
                ? 'Tüm bilimsel kaynaklar'
                : categories.find(category => category.id === activeCategory)?.label}
            </h2>
            <span className="text-xs text-slate-500">{filteredReferences.length} kaynak</span>
          </div>
          <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
            {filteredReferences.map(reference => (
              <article
                key={reference.title}
                className="flex h-full flex-col rounded-2xl border border-slate-800 bg-[#0e1726] p-4 shadow-sm transition hover:border-slate-700 sm:p-5"
              >
                <div className="mb-3 flex items-start justify-between gap-3">
                  <span className="rounded-md border border-sky-500/20 bg-sky-500/10 px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-sky-300">
                    {categories.find(category => category.id === reference.category)?.label}
                  </span>
                  <span className="shrink-0 text-right text-[11px] text-slate-500">{reference.publication}</span>
                </div>
                <h3 className="text-sm font-semibold leading-5 text-slate-100 sm:text-base">
                  {reference.title}
                </h3>
                <p className="mt-2 flex-1 text-xs leading-5 text-slate-400 sm:text-sm">
                  {reference.indication}
                </p>
                <div className="mt-4 flex flex-wrap items-end justify-between gap-3 border-t border-slate-800/80 pt-3">
                  <div>
                    <div className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">Yazarlar</div>
                    <p className="mt-1 text-xs text-slate-300">{reference.authors}</p>
                  </div>
                  <a
                    href={reference.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-slate-700 bg-[#131f33] px-2.5 py-1.5 text-xs font-semibold text-sky-300 transition hover:border-sky-500/60 hover:bg-sky-500/10 hover:text-sky-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400"
                  >
                    {reference.linkLabel ?? 'PubMed'}
                    <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
                  </a>
                </div>
              </article>
            ))}
          </div>
        </section>

        <aside className="mt-10 rounded-2xl border border-amber-500/25 bg-amber-500/[0.06] p-4 sm:p-6">
          <div className="flex items-start gap-3">
            <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-amber-300" aria-hidden="true" />
            <div>
              <h2 className="text-sm font-bold text-amber-100">Yasal Sorumluluk, Telif ve Marka Bildirimi</h2>
              <p className="mt-3 text-xs leading-6 text-slate-300 sm:text-sm">
                NCCN®, ASTRO®, ESTRO®, RTOG®, QUANTEC®, EMBRACE® ve ilgili diğer isimler kendi tescilli kurumlarının mülkiyetindedir.
              </p>
              <p className="mt-2 text-xs leading-6 text-slate-400 sm:text-sm">
                Bu web platformu, bağımsız bir klinik karar destek ve eğitim aracıdır. Bahsi geçen kurum veya kooperatif çalışma gruplarıyla doğrudan kurumsal bir ortaklığı bulunmamaktadır. Referanslar akademik adil kullanım (Fair Use) prensiplerine uygun olarak atıf amacıyla listelenmiştir.
              </p>
              <p className="mt-3 border-t border-amber-500/15 pt-3 text-[11px] leading-5 text-slate-500">
                Bu atlas akademik kaynakları tanımlar; bireysel hastaya yönelik klinik öneri veya kılavuz metninin yerine geçmez. Tedavi kararları güncel kılavuzlar, kurum protokolleri ve uzman değerlendirmesiyle verilmelidir.
              </p>
            </div>
          </div>
        </aside>
      </div>
    </main>
  );
}
