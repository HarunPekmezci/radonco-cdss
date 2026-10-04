'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, BookOpen, ExternalLink, ShieldCheck } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';

type CategoryId =
  | 'thorax'
  | 'breast'
  | 'gus'
  | 'gis'
  | 'head-neck'
  | 'cns'
  | 'gynecology'
  | 'bone-sarcoma'
  | 'guidelines'
  | 'oar';

type Reference = {
  category: CategoryId;
  title: string;
  indication: string;
  indication_en: string;
  publication: string;
  authors: string;
  url: string;
  linkLabel?: string;
};

const pubmedSearch = (query: string) =>
  `https://pubmed.ncbi.nlm.nih.gov/?term=${encodeURIComponent(query)}`;

const categories: { id: CategoryId | 'all'; label_tr: string; label_en: string }[] = [
  { id: 'all', label_tr: 'Tümü', label_en: 'All Sources' },
  { id: 'thorax', label_tr: 'Toraks', label_en: 'Thorax' },
  { id: 'breast', label_tr: 'Meme', label_en: 'Breast' },
  { id: 'gus', label_tr: 'GÜS', label_en: 'GU' },
  { id: 'gis', label_tr: 'GİS', label_en: 'GI' },
  { id: 'head-neck', label_tr: 'Baş-Boyun', label_en: 'Head & Neck' },
  { id: 'cns', label_tr: 'MSS', label_en: 'CNS' },
  { id: 'gynecology', label_tr: 'Jinekoloji', label_en: 'Gynecology' },
  { id: 'bone-sarcoma', label_tr: 'Kemik & Sarkom', label_en: 'Bone & Soft Tissue' },
  { id: 'guidelines', label_tr: 'Kılavuzlar', label_en: 'Guidelines' },
  { id: 'oar', label_tr: 'OAR & Radyobiyoloji', label_en: 'Physics & OAR' },
];

const references: Reference[] = [
  {
    category: 'guidelines',
    title: 'NCCN Clinical Practice Guidelines in Oncology',
    indication: 'Hastalık bölgesine özgü güncel kanıta dayalı kılavuzlar. Sürümü, erişim tarihini ve klinik uygunluğu doğrulayın; bazı içerikler erişim kısıtlamalı olabilir.',
    indication_en: 'Current evidence-based guidelines by disease site. Verify the version, access date, and clinical applicability; some content may require authorized access.',
    publication: 'NCCN Guidelines',
    authors: 'National Comprehensive Cancer Network',
    url: 'https://www.nccn.org/guidelines',
    linkLabel: 'NCCN',
  },
  {
    category: 'guidelines',
    title: 'ESTRO Guidelines and Consensus Statements',
    indication: 'Radyoterapi uygulamalarına yönelik Avrupa kılavuzları ve uzman konsensus belgeleri.',
    indication_en: 'European guidelines and expert consensus statements on radiotherapy practice.',
    publication: 'ESTRO Clinical Practice Guidelines',
    authors: 'European Society for Radiotherapy and Oncology',
    url: 'https://www.estro.org/Science/Guidelines',
    linkLabel: 'ESTRO',
  },
  {
    category: 'guidelines',
    title: 'HyTEC — High Dose per Fraction, Hypofractionated Treatment Effects in the Clinic',
    indication: 'Stereotaktik radyoterapide doz, fraksiyonasyon ve klinik toksisite ilişkisine yönelik yayımlanmış kanıtları bulun ve her organ için ilgili birincil analizi doğrulayın.',
    indication_en: 'Find published evidence on dose, fractionation, and clinical toxicity in stereotactic radiotherapy; verify the relevant primary analysis for each organ.',
    publication: 'HyTEC evidence reviews',
    authors: 'AAPM Working Group',
    url: pubmedSearch('HyTEC high dose per fraction hypofractionated treatment effects clinic'),
    linkLabel: 'PubMed',
  },
  {
    category: 'thorax',
    title: 'PACIFIC Trial — Durvalumab after Chemoradiotherapy in Stage III NSCLC',
    indication: 'Evre III KHDAK’ta definitif eşzamanlı kemoradyoterapi sonrası durvalumab konsolidasyonu.',
    indication_en: 'Consolidation durvalumab after definitive concurrent chemoradiotherapy for unresectable stage III NSCLC.',
    publication: 'New England Journal of Medicine, 2017',
    authors: 'Antonia SJ et al.',
    url: 'https://doi.org/10.1056/NEJMoa1709937',
    linkLabel: 'DOI',
  },
  {
    category: 'thorax',
    title: 'RTOG 0236 — Stereotactic Body Radiation Therapy for Inoperable Early-Stage Lung Cancer',
    indication: 'Medikal inoperabl, periferik erken evre KHDAK için 54 Gy / 3 fraksiyon SBRT.',
    indication_en: 'SBRT at 54 Gy in 3 fractions for medically inoperable, peripheral early-stage NSCLC.',
    publication: 'JAMA, 2010',
    authors: 'Timmerman R et al.',
    url: 'https://doi.org/10.1001/jama.2010.261',
    linkLabel: 'DOI',
  },
  {
    category: 'thorax',
    title: 'RTOG 0915 — Comparison of Two SBRT Schedules for Peripheral Stage I NSCLC',
    indication: 'Periferik erken evre KHDAK’ta 48 Gy / 4 fraksiyon ile 34 Gy / tek fraksiyon SBRT karşılaştırması.',
    indication_en: 'Comparison of 48 Gy in 4 fractions versus 34 Gy in 1 fraction for peripheral early-stage NSCLC.',
    publication: 'Journal of Clinical Oncology, 2015',
    authors: 'Videtic GMM et al.',
    url: pubmedSearch('RTOG 0915 48 Gy 4 fractions 34 Gy single fraction Videtic'),
    linkLabel: 'PubMed',
  },
  {
    category: 'thorax',
    title: 'Turrisi et al. — Twice-Daily Compared with Once-Daily Thoracic Radiotherapy in Limited SCLC',
    indication: 'Sınırlı evre KHAK’ta eşzamanlı kemoradyoterapide günde iki kez ve günde bir kez RT karşılaştırması.',
    indication_en: 'Comparison of twice-daily and once-daily thoracic radiotherapy delivered with concurrent chemotherapy for limited-stage SCLC.',
    publication: 'New England Journal of Medicine, 1999',
    authors: 'Turrisi AT III et al.',
    url: pubmedSearch('Turrisi twice daily once daily thoracic radiotherapy limited small cell lung cancer 1999'),
    linkLabel: 'PubMed',
  },
  {
    category: 'thorax',
    title: 'CONVERT — Once-Daily versus Twice-Daily Chemoradiotherapy in Limited-Stage SCLC',
    indication: 'Sınırlı evre KHAK’ta eşzamanlı platin-etoposid ve iki farklı torasik RT şemasının karşılaştırılması.',
    indication_en: 'Comparison of once-daily and twice-daily thoracic radiotherapy with concurrent platinum-etoposide for limited-stage SCLC.',
    publication: 'The Lancet Oncology, 2017',
    authors: 'Faivre-Finn C et al.',
    url: pubmedSearch('CONVERT trial once daily twice daily chemoradiotherapy limited stage small cell lung cancer 2017'),
    linkLabel: 'PubMed',
  },
  {
    category: 'breast',
    title: 'FAST-Forward Phase III — One-Week versus Three-Week Breast Radiotherapy',
    indication: 'Erken evre meme kanserinde adjuvan tüm meme RT’si; 26 Gy / 5 fraksiyon şemasının beş yıllık sonuçları.',
    indication_en: 'Five-year efficacy and late-effects results for adjuvant whole-breast radiotherapy, including 26 Gy in 5 fractions.',
    publication: 'The Lancet, 2020',
    authors: 'Brunt AM et al.',
    url: 'https://doi.org/10.1016/S0140-6736(20)30932-6',
    linkLabel: 'DOI',
  },
  {
    category: 'breast',
    title: 'START-B Trial — Hypofractionated Breast Radiotherapy',
    indication: 'Erken evre meme kanserinde 40 Gy / 15 fraksiyon adjuvan meme RT’si.',
    indication_en: 'Adjuvant breast radiotherapy for early breast cancer, establishing the 40 Gy in 15 fractions schedule.',
    publication: 'The Lancet, 2008',
    authors: 'START Trialists’ Group',
    url: 'https://doi.org/10.1016/S0140-6736(08)60348-7',
    linkLabel: 'DOI',
  },
  {
    category: 'breast',
    title: 'EORTC 22922 / BIG 1-02 — Internal Mammary and Medial Supraclavicular Irradiation',
    indication: 'Erken evre meme kanserinde internal mammar ve medial supraklavikuler lenfatiklerin bölgesel ışınlanması.',
    indication_en: 'Regional irradiation of the internal mammary and medial supraclavicular lymph-node chains in early-stage breast cancer.',
    publication: 'Journal of Clinical Oncology, 2020 (10 yıllık sonuçlar)',
    authors: 'Poortmans PM et al.',
    url: 'https://doi.org/10.1200/JCO.19.02139',
    linkLabel: 'DOI',
  },
  {
    category: 'gus',
    title: 'CHHiP Trial — Conventional versus Hypofractionated High-Dose Radiotherapy',
    indication: 'Lokalize prostat kanserinde orta hipofraksiyonasyon; 60 Gy / 20 fraksiyon şeması.',
    indication_en: 'Moderate hypofractionation for localized prostate cancer, including 60 Gy in 20 fractions.',
    publication: 'The Lancet Oncology, 2016',
    authors: 'Dearnaley D et al.',
    url: pubmedSearch('CHHiP trial Dearnaley 60 Gy 20 fractions 2016 Lancet Oncology'),
    linkLabel: 'PubMed',
  },
  {
    category: 'gus',
    title: 'PACE-B Phase III — Stereotactic Body Radiotherapy for Localized Prostate Cancer',
    indication: 'Düşük ve orta risk prostat kanserinde 36.25 Gy / 5 fraksiyon SBRT ile konvansiyonel/orta hipofraksiyone RT karşılaştırması.',
    indication_en: 'Non-inferiority comparison of SBRT at 36.25 Gy in 5 fractions with conventional or moderately hypofractionated radiotherapy for low- and intermediate-risk prostate cancer.',
    publication: 'New England Journal of Medicine, 2024',
    authors: 'van As N et al.',
    url: 'https://doi.org/10.1056/NEJMoa2309918',
    linkLabel: 'DOI',
  },
  {
    category: 'gus',
    title: 'Bladder Preservation — Radiotherapy with or without Chemotherapy in Muscle-Invasive Bladder Cancer',
    indication: 'Kas invaziv mesane kanserinde mesane koruyucu trimodalite yaklaşımının temel randomize kanıtı.',
    indication_en: 'Landmark randomized evidence for bladder-preserving trimodality therapy in muscle-invasive bladder cancer.',
    publication: 'New England Journal of Medicine, 2012',
    authors: 'James ND et al.',
    url: 'https://doi.org/10.1056/NEJMoa1106106',
    linkLabel: 'DOI',
  },
  {
    category: 'gis',
    title: 'RAPIDO Phase III — Short-Course Radiotherapy and Total Neoadjuvant Therapy',
    indication: 'Lokal ileri rektum kanserinde kısa dönem RT (5 × 5 Gy) ve konsolidasyon kemoterapisini içeren TNT yaklaşımı.',
    indication_en: 'Total neoadjuvant therapy for locally advanced rectal cancer using short-course radiotherapy (5 × 5 Gy) followed by consolidation chemotherapy.',
    publication: 'The Lancet Oncology, 2021',
    authors: 'Bahadoer RR et al.',
    url: pubmedSearch('RAPIDO trial short course radiotherapy rectal cancer Bahadoer 2021'),
    linkLabel: 'PubMed',
  },
  {
    category: 'gis',
    title: 'CROSS Trial — Neoadjuvant Chemoradiotherapy for Oesophageal or Junctional Cancer',
    indication: 'Özofagus ve gastroözofageal bileşke kanserinde 41.4 Gy neoadjuvan KRT ve paklitaksel/karboplatin.',
    indication_en: 'Neoadjuvant chemoradiotherapy with 41.4 Gy and carboplatin-paclitaxel for esophageal or gastroesophageal-junction cancer.',
    publication: 'New England Journal of Medicine, 2012',
    authors: 'van Hagen P et al.',
    url: 'https://doi.org/10.1056/NEJMoa1112088',
    linkLabel: 'DOI',
  },
  {
    category: 'gis',
    title: 'Nigro Protocol / RTOG 9811 — Definitive Chemoradiotherapy for Anal Cancer',
    indication: 'Anal kanal skuamöz hücreli karsinomunda mitomisin-C ve 5-FU ile definitif RT/kemoradyoterapi yaklaşımı.',
    indication_en: 'Definitive radiotherapy and chemoradiotherapy using mitomycin-C and 5-FU for anal canal squamous-cell carcinoma.',
    publication: 'Diseases of the Colon & Rectum, 1974; Journal of Clinical Oncology, 2008',
    authors: 'Nigro ND et al.; Ajani JA et al.',
    url: pubmedSearch('Nigro anal cancer chemoradiation 1974 RTOG 9811 Ajani'),
    linkLabel: 'PubMed',
  },
  {
    category: 'cns',
    title: 'Stupp Protocol — Radiotherapy plus Concomitant and Adjuvant Temozolomide for Glioblastoma',
    indication: 'Glioblastomada cerrahi sonrası 60 Gy RT ile eşzamanlı ve adjuvan temozolomid.',
    indication_en: 'Postoperative radiotherapy to 60 Gy with concurrent and adjuvant temozolomide for glioblastoma.',
    publication: 'New England Journal of Medicine, 2005',
    authors: 'Stupp R et al.',
    url: 'https://pubmed.ncbi.nlm.nih.gov/15758009/',
    linkLabel: 'PubMed',
  },
  {
    category: 'cns',
    title: 'RTOG 9802 — Radiation plus PCV in High-Risk Low-Grade Glioma',
    indication: 'Yüksek riskli düşük dereceli gliomda 54 Gy RT’ye adjuvan prokarbazin, lomustin ve vinkristin (PCV) eklenmesi.',
    indication_en: 'Adjuvant procarbazine, lomustine, and vincristine (PCV) added to 54 Gy radiotherapy for high-risk low-grade glioma.',
    publication: 'New England Journal of Medicine, 2016',
    authors: 'Buckner JC et al.',
    url: 'https://doi.org/10.1056/NEJMoa1500925',
    linkLabel: 'DOI',
  },
  {
    category: 'cns',
    title: 'NRG Oncology CC001 — Hippocampal Avoidance during WBRT plus Memantine',
    indication: 'Beyin metastazlarında bilişsel işlevi korumaya yönelik hipokampal korumalı tüm beyin RT’si ve memantin.',
    indication_en: 'Hippocampal-avoidance whole-brain radiotherapy plus memantine to preserve cognitive function in patients with brain metastases.',
    publication: 'Journal of Clinical Oncology, 2020',
    authors: 'Brown PD et al.',
    url: 'https://doi.org/10.1200/JCO.19.02767',
    linkLabel: 'DOI',
  },
  {
    category: 'gynecology',
    title: 'EMBRACE II — Image-Guided Adaptive Brachytherapy in Locally Advanced Cervical Cancer',
    indication: 'Lokal ileri serviks kanserinde kemoradyoterapi sonrası MRI rehberli adaptif brakiterapi ve hedef doz/kısıt stratejileri.',
    indication_en: 'MRI-guided adaptive brachytherapy after chemoradiotherapy for locally advanced cervical cancer, with protocolized target-dose and organ-at-risk goals.',
    publication: 'Radiotherapy and Oncology, 2021',
    authors: 'Pötter R et al.',
    url: 'https://doi.org/10.1016/j.radonc.2021.01.014',
    linkLabel: 'DOI',
  },
  {
    category: 'gynecology',
    title: 'PORTEC-2 — Vaginal Brachytherapy versus Pelvic External-Beam Radiotherapy',
    indication: 'Orta-yüksek risk endometriyum kanserinde vajinal kaf brakiterapisi ile pelvik EBRT’nin karşılaştırılması.',
    indication_en: 'Comparison of vaginal-cuff brachytherapy with pelvic external-beam radiotherapy for high-intermediate-risk endometrial cancer.',
    publication: 'The Lancet, 2010',
    authors: 'Nout RA et al.',
    url: 'https://pubmed.ncbi.nlm.nih.gov/20729020/',
    linkLabel: 'PubMed',
  },
  {
    category: 'gynecology',
    title: 'PORTEC-3 — Adjuvant Chemoradiotherapy versus Radiotherapy Alone',
    indication: 'Yüksek risk endometriyum kanserinde pelvik EBRT’ye adjuvan kemoterapi eklenmesinin değerlendirilmesi.',
    indication_en: 'Evaluation of adding adjuvant chemotherapy to pelvic external-beam radiotherapy for high-risk endometrial cancer.',
    publication: 'The Lancet Oncology, 2018',
    authors: 'de Boer SM et al.',
    url: 'https://pubmed.ncbi.nlm.nih.gov/29499893/',
    linkLabel: 'PubMed',
  },
  {
    category: 'head-neck',
    title: 'RTOG 1016 — Radiotherapy plus Cetuximab or Cisplatin in HPV-Positive Oropharyngeal Cancer',
    indication: 'HPV-pozitif orofarenks kanserinde sisplatin eşzamanlı KRT standardını destekleyen randomize çalışma.',
    indication_en: 'Randomized evidence supporting concurrent cisplatin chemoradiotherapy over cetuximab-radiotherapy for HPV-positive oropharyngeal cancer.',
    publication: 'The Lancet, 2019',
    authors: 'Gillison ML et al.',
    url: 'https://doi.org/10.1016/S0140-6736(19)32779-X',
    linkLabel: 'DOI',
  },
  {
    category: 'bone-sarcoma',
    title: 'Preoperative versus Postoperative Radiotherapy in Soft-Tissue Sarcoma of the Limbs',
    indication: 'Ekstremite yumuşak doku sarkomunda preoperatif ve postoperatif RT zamanlaması ve toksisite sonuçları.',
    indication_en: 'Comparison of preoperative and postoperative radiotherapy timing and toxicity in extremity soft-tissue sarcoma.',
    publication: 'The Lancet, 2002',
    authors: 'O’Sullivan B et al.',
    url: pubmedSearch('O Sullivan preoperative postoperative radiotherapy soft tissue sarcoma limbs Lancet 2002'),
    linkLabel: 'PubMed',
  },
  {
    category: 'oar',
    title: 'ICRU Report 83 — Prescribing, Recording, and Reporting IMRT',
    indication: 'IMRT’de doz reçetelendirme, raporlama ve hedef hacim/doz-volüm değerlendirmeleri için uluslararası rapor.',
    indication_en: 'International recommendations for IMRT dose prescription, recording, reporting, target volumes, and dose-volume assessment.',
    publication: 'Journal of the ICRU, 2010',
    authors: 'International Commission on Radiation Units and Measurements',
    url: 'https://doi.org/10.1093/jicru/ndq002',
    linkLabel: 'DOI',
  },
  {
    category: 'oar',
    title: 'ICRU Report 91 — Stereotactic Treatments with Small Photon Beams',
    indication: 'Küçük foton alanlarıyla stereotaktik tedavilerde doz reçetelendirme, kayıt ve raporlama.',
    indication_en: 'Recommendations for prescribing, recording, and reporting stereotactic treatments using small photon beams.',
    publication: 'Journal of the ICRU, 2017; journal summary, 2019',
    authors: 'International Commission on Radiation Units and Measurements',
    url: 'https://doi.org/10.1007/s00066-018-1416-x',
    linkLabel: 'DOI',
  },
  {
    category: 'oar',
    title: 'QUANTEC — Use of Normal Tissue Complication Probability Models in the Clinic',
    indication: 'Normal doku komplikasyon olasılığı modelleri ve klinik doz-kısıt kararları için temel derleme.',
    indication_en: 'Foundational review of normal-tissue complication probability models and their use in clinical dose-constraint decisions.',
    publication: 'International Journal of Radiation Oncology, Biology, Physics, 2010',
    authors: 'Marks LB et al.',
    url: 'https://pubmed.ncbi.nlm.nih.gov/20171502/',
    linkLabel: 'PubMed',
  },
];

export default function ReferencesPage() {
  const { language: lang } = useLanguage();
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
        <div className="mb-8">
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-lg border border-slate-700 bg-[#0e1726] px-3 py-2 text-sm font-medium text-slate-200 transition hover:border-sky-500/60 hover:bg-[#131f33] hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            {lang === 'en' ? 'Back to portal' : 'Portala dön'}
          </Link>
        </div>

        <header className="mb-8 max-w-4xl">
          <div className="mb-3 flex items-center gap-2 text-sky-300">
            <BookOpen className="h-5 w-5" aria-hidden="true" />
            <span className="text-xs font-semibold uppercase tracking-[0.16em]">
              {lang === 'en' ? 'RADONC CDSS • EVIDENCE ATLAS' : 'RADONC CDSS • KANIT ATLASI'}
            </span>
          </div>
          <h1 className="text-2xl font-bold leading-tight tracking-tight text-white sm:text-3xl md:text-4xl">
            {lang === 'en'
              ? '📚 Clinical Guidelines, Landmark Trials & Evidence Atlas'
              : '📚 Klinik Kılavuzlar, Önemli Çalışmalar ve Bilimsel Kanıt Atlası'}
          </h1>
          <p className="mt-4 max-w-3xl text-sm leading-6 text-slate-400 sm:text-base">
            {lang === 'en'
              ? 'Literature sources for fractionation approaches, target-volume definitions, and dosimetric OAR constraints used in RadOnc CDSS. Publication titles remain in their original language; summaries are translated.'
              : 'RadOnco CDSS sistemindeki fraksiyonasyon yaklaşımları, hedef hacim tanımları ve OAR kısıtları için literatür kaynakları. Yayın başlıkları özgün dilinde, özetler seçilen dilde gösterilir.'}
          </p>
        </header>

        <section aria-label={lang === 'en' ? 'Reference categories' : 'Kaynak kategorileri'} className="mb-6">
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
                  {lang === 'en' ? category.label_en : category.label_tr}
                </button>
              );
            })}
          </div>
        </section>

        <section aria-live="polite" aria-label={lang === 'en' ? 'Scientific references' : 'Bilimsel kaynaklar'}>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-slate-200">
              {activeCategory === 'all'
                ? (lang === 'en' ? 'All scientific references' : 'Tüm bilimsel kaynaklar')
                : (lang === 'en'
                  ? categories.find(category => category.id === activeCategory)?.label_en
                  : categories.find(category => category.id === activeCategory)?.label_tr)}
            </h2>
            <span className="text-xs text-slate-400">
              {filteredReferences.length} {lang === 'en' ? 'references' : 'kaynak'}
            </span>
          </div>
          <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
            {filteredReferences.map(reference => (
              <article
                key={reference.title}
                className="flex h-full flex-col rounded-2xl border border-slate-800 bg-[#0e1726] p-4 shadow-sm transition hover:border-slate-700 sm:p-5"
              >
                <div className="mb-3 flex items-start justify-between gap-3">
                  <span className="rounded-md border border-sky-500/20 bg-sky-500/10 px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-sky-300">
                    {lang === 'en'
                      ? categories.find(category => category.id === reference.category)?.label_en
                      : categories.find(category => category.id === reference.category)?.label_tr}
                  </span>
                  <span className="shrink-0 text-right text-[11px] text-slate-400">{reference.publication}</span>
                </div>
                <h3 className="text-sm font-semibold leading-5 text-slate-100 sm:text-base">
                  {reference.title}
                </h3>
                <p className="mt-2 flex-1 text-xs leading-5 text-slate-400 sm:text-sm">
                  {lang === 'en' ? reference.indication_en : reference.indication}
                </p>
                <div className="mt-4 flex flex-wrap items-end justify-between gap-3 border-t border-slate-800/80 pt-3">
                  <div>
                    <div className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                      {lang === 'en' ? 'AUTHORS' : 'YAZARLAR'}
                    </div>
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
              <h2 className="text-sm font-bold text-amber-100">
                {lang === 'en' ? 'Legal, Copyright & Trademark Disclaimer' : 'Yasal Sorumluluk, Telif ve Marka Bildirimi'}
              </h2>
              <p className="mt-3 text-xs leading-6 text-slate-300 sm:text-sm">
                {lang === 'en'
                  ? 'NCCN®, ASTRO®, ESTRO®, RTOG®, QUANTEC®, EMBRACE® and other related names are the property of their respective trademark-owning organizations.'
                  : 'NCCN®, ASTRO®, ESTRO®, RTOG®, QUANTEC®, EMBRACE® ve ilgili diğer isimler kendi tescilli kurumlarının mülkiyetindedir.'}
              </p>
              <p className="mt-2 text-xs leading-6 text-slate-400 sm:text-sm">
                {lang === 'en'
                  ? 'This web platform is an independent clinical decision-support and educational tool. It is not affiliated with the named organizations or cooperative groups. References are listed for citation and scholarly discussion in accordance with applicable fair-use principles.'
                  : 'Bu web platformu, bağımsız bir klinik karar destek ve eğitim aracıdır. Bahsi geçen kurum veya kooperatif çalışma gruplarıyla doğrudan kurumsal bir ortaklığı bulunmamaktadır. Referanslar akademik adil kullanım (Fair Use) prensiplerine uygun olarak atıf amacıyla listelenmiştir.'}
              </p>
              <p className="mt-3 border-t border-amber-500/15 pt-3 text-[11px] leading-5 text-slate-400">
                {lang === 'en'
                  ? 'This atlas identifies academic sources; it is not a patient-specific clinical recommendation or a substitute for guideline texts. Treatment decisions should be based on current guidelines, institutional protocols, and specialist judgment.'
                  : 'Bu atlas akademik kaynakları tanımlar; bireysel hastaya yönelik klinik öneri veya kılavuz metninin yerine geçmez. Tedavi kararları güncel kılavuzlar, kurum protokolleri ve uzman değerlendirmesiyle verilmelidir.'}
              </p>
            </div>
          </div>
        </aside>
      </div>
    </main>
  );
}
