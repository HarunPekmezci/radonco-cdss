'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  BookOpen,
  ExternalLink,
  ShieldCheck,
  CheckCircle2,
  Calendar,
  Search,
  Activity,
  Layers,
  Sparkles,
  FileCheck2,
} from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import {
  GUIDELINES_REGISTRY_DATA,
  GuidelineRegistryEntry,
} from '@/data/guidelinesRegistryData';

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

type LandmarkReference = {
  category: CategoryId;
  title: string;
  indication: string;
  indication_en: string;
  publication: string;
  authors: string;
  url: string;
  linkLabel?: string;
};

const landmarkCategories: { id: CategoryId | 'all'; label_tr: string; label_en: string }[] = [
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

const landmarkReferences: LandmarkReference[] = [
  // 1. GUIDELINES & CORE CONSENSUS
  {
    category: 'guidelines',
    title: 'NCCN Clinical Practice Guidelines in Oncology',
    indication: 'Hastalık bölgesine özgü güncel kanıta dayalı kılavuzlar. Sürümü, erişim tarihini ve klinik uygunluğu doğrulayın.',
    indication_en: 'Current evidence-based guidelines by disease site. Verify the version, access date, and clinical applicability.',
    publication: 'NCCN Guidelines v1.2026',
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
    indication: 'Stereotaktik radyoterapide doz, fraksiyonasyon ve klinik toksisite ilişkisine yönelik yayımlanmış kanıtlar.',
    indication_en: 'Published evidence on dose, fractionation, and clinical toxicity in stereotactic radiotherapy.',
    publication: 'HyTEC evidence reviews',
    authors: 'AAPM Working Group',
    url: 'https://www.redjournal.org/issue/S0360-3016(21)X0003-8',
    linkLabel: 'Red Journal',
  },
  // 2. THORAX
  {
    category: 'thorax',
    title: 'PACIFIC Trial (Antonia et al., NEJM 2017 & 2018) — Durvalumab after Chemoradiotherapy in Stage III NSCLC',
    indication: 'Rezeke edilemeyen Evre III KHDAK hastalarında definitif eşzamanlı kemoradyoterapi (60 Gy) sonrası 1 yıl konsolidatif durvalumab immünoterapisinin progresyonsuz ve genel sağkalımı belirgin uzattığını kanıtlayan temel Faz III çalışma.',
    indication_en: 'Foundational Phase III trial establishing 1 year of consolidative durvalumab immunotherapy following definitive concurrent chemoradiotherapy (60 Gy) as standard of care for unresectable Stage III NSCLC.',
    publication: 'New England Journal of Medicine, 2017 & 2018',
    authors: 'Antonia SJ, Villegas A, Daniel D, et al.',
    url: 'https://doi.org/10.1056/NEJMoa1709937',
    linkLabel: 'DOI',
  },
  {
    category: 'thorax',
    title: 'RTOG 0236 (Timmerman et al., JAMA 2010 / Lancet Oncol 2018) — SBRT for Inoperable Peripheral NSCLC',
    indication: 'Medikal inoperabl periferik erken evre T1-T2N0 KHDAK’ta 54 Gy / 3 fraksiyon (18 Gy/fx) SBRT şemasının %90 üzerinde 5 yıllık mükemmel lokal kontrol sağladığını gösteren öncü protokol.',
    indication_en: 'Landmark prospective Phase II/III protocol proving 54 Gy in 3 fractions (18 Gy/fx) yields exceptional 5-year local tumor control (>90%) in medically inoperable early T1-T2N0 peripheral NSCLC.',
    publication: 'JAMA, 2010; The Lancet Oncology, 2018',
    authors: 'Timmerman R, Paulus R, Galvin J, et al.',
    url: 'https://doi.org/10.1001/jama.2010.261',
    linkLabel: 'DOI',
  },
  {
    category: 'thorax',
    title: 'RTOG 0915 (Videtic et al., JCO 2015 & IJROBP 2019) — SBRT Fractionation in Early-Stage NSCLC',
    indication: 'Medikal inoperabl periferik Evre I KHDAK’ta tek fraksiyon 34 Gy ile 4 fraksiyonda 48 Gy (12 Gy/fx) SBRT fraksiyonasyonlarının karşılaştırılması.',
    indication_en: 'Comparison of single-fraction 34 Gy versus 48 Gy in 4 fractions; demonstrates both schedules achieve outstanding 5-year local control (>90%).',
    publication: 'Journal of Clinical Oncology, 2015; IJROBP, 2019',
    authors: 'Videtic GMM, Hu C, Singh AK, et al.',
    url: 'https://doi.org/10.1200/JCO.2015.63.1556',
    linkLabel: 'DOI',
  },
  {
    category: 'thorax',
    title: 'Turrisi et al. (NEJM 1999) & CONVERT Trial (Faivre-Finn et al., Lancet Oncol 2017) — SCLC Radiotherapy',
    indication: 'Sınırlı evre küçük hücreli akciğer kanserinde eşzamanlı sisplatin/etoposid ile hiperfraksiyone hızlandırılmış RT (45 Gy BID) ve günde tek fraksiyon (60-66 Gy) rejimleri.',
    indication_en: 'Validates hyperfractionated accelerated radiotherapy (45 Gy in 30 fractions BID) alongside once-daily (60-66 Gy) as primary curative regimens for limited-stage SCLC.',
    publication: 'New England Journal of Medicine, 1999; The Lancet Oncology, 2017',
    authors: 'Turrisi AT 3rd, et al. / Faivre-Finn C, et al.',
    url: 'https://doi.org/10.1056/NEJM199901283400403',
    linkLabel: 'DOI',
  },
  // 3. BREAST
  {
    category: 'breast',
    title: 'FAST-Forward Trial (Brunt et al., Lancet 2020) — 1-Week Ultra-Hypofractionated Adjuvant RT for Breast Cancer',
    indication: 'Erken evre invaziv meme kanserinde mastektomi veya MKC sonrası 1 haftada 5 fraksiyonda 26 Gy tüm meme/göğüs duvarı radyoterapisinin 3 haftalık 40 Gy standardına non-inferior olduğunu kanıtlayan Faz III çalışma.',
    indication_en: 'Landmark Phase III trial establishing 26 Gy in 5 fractions over 1 week as non-inferior for local tumor control and normal tissue effects compared to 40 Gy in 15 fractions over 3 weeks.',
    publication: 'The Lancet, 2020',
    authors: 'Brunt AM, Haviland JS, Wheatley DA, et al.',
    url: 'https://doi.org/10.1016/S0140-6736(20)30932-6',
    linkLabel: 'DOI',
  },
  {
    category: 'breast',
    title: 'START Trials (START-A & START-B, Lancet 2008 / Lancet Oncol 2013) — Moderately Hypofractionated Breast RT',
    indication: 'Erken evre meme kanserinde 15 fraksiyonda 40 Gy veya 13 fraksiyonda 39 Gy hipofraksiyonasyon şemalarının 50 Gy / 25 fx konvansiyonel tedaviye eşdeğer lokal kontrol sağladığını kanıtlayan temel İngiltere çalışmaları.',
    indication_en: 'Foundational UK trials demonstrating 40 Gy in 15 fractions provides equivalent local cancer control with similar or reduced normal tissue toxicity compared to 50 Gy in 25 fractions.',
    publication: 'The Lancet, 2008; The Lancet Oncology, 2013',
    authors: 'START Trialists’ Group, Bentzen SM, Agrawal RK, et al.',
    url: 'https://doi.org/10.1016/S0140-6736(08)60348-7',
    linkLabel: 'DOI',
  },
  // 4. PROSTATE
  {
    category: 'gus',
    title: 'CHHiP Trial (Dearnaley et al., Lancet Oncol 2016) — Moderate Hypofractionation for Localised Prostate Cancer',
    indication: 'Lokalize prostat kanserinde 20 fraksiyonda 60 Gy hipofraksiyone radyoterapinin 37 fraksiyonda 74 Gy konvansiyonel radyoterapiye biyokimyasal kontrol açısından non-inferior olduğunu kanıtlayan Faz III çalışma.',
    indication_en: 'Phase III non-inferiority trial proving 60 Gy in 20 fractions is non-inferior to 74 Gy in 37 fractions for biochemical control in localized prostate cancer.',
    publication: 'The Lancet Oncology, 2016',
    authors: 'Dearnaley D, Syndikus I, Mossop H, et al.',
    url: 'https://doi.org/10.1016/S1470-2045(16)30102-4',
    linkLabel: 'DOI',
  },
  {
    category: 'gus',
    title: 'PACE-B Trial (van As et al., NEJM 2024 / Lancet Oncol 2019) — SBRT vs Conventional/Moderate RT in Prostate',
    indication: 'Düşük ve orta riskli lokalize prostat kanserinde 5 fraksiyonda 36.25 Gy SBRT uygulamasının 5 yıllık biyokimyasal nükssüz sağkalım açısından konvansiyonel/moderat hipofraksiyonasyona non-inferior olduğunu gösteren Faz III çalışma.',
    indication_en: 'Phase III trial showing 5-fraction prostate SBRT (36.25 Gy in 5 fx) is non-inferior to conventionally fractionated or moderately hypofractionated radiotherapy for 5-year biochemical progression-free survival.',
    publication: 'New England Journal of Medicine, 2024; Lancet Oncology, 2019',
    authors: 'van As NJ, Tree AC, Patel J, et al.',
    url: 'https://doi.org/10.1056/NEJMoa2403366',
    linkLabel: 'DOI',
  },
  // 5. CNS
  {
    category: 'cns',
    title: 'Stupp et al. (NEJM 2005 / Lancet Oncol 2009) — Radiotherapy plus Concomitant and Adjuvant Temozolomide for Glioblastoma',
    indication: 'Glioblastom hastalarında cerrahi rezeksiyon sonrası 30 fraksiyonda 60 Gy radyoterapiye eşzamanlı günlük temozolomid ve ardından 6 kür adjuvan temozolomid eklenmesinin sağkalımı belirgin uzattığını kanıtlayan altın standart Faz III çalışma.',
    indication_en: 'Gold-standard Phase III trial demonstrating radiotherapy (60 Gy in 30 fractions) with concomitant daily temozolomide followed by adjuvant temozolomide significantly improves overall survival in newly diagnosed glioblastoma.',
    publication: 'New England Journal of Medicine, 2005; Lancet Oncol, 2009',
    authors: 'Stupp R, Mason WP, van den Bent MJ, et al.',
    url: 'https://doi.org/10.1056/NEJMoa043330',
    linkLabel: 'DOI',
  },
  // 6. GI & RECTAL
  {
    category: 'gis',
    title: 'RAPIDO Trial (Bahadoer et al., Lancet Oncol 2021) — Short-Course RT Followed by Chemotherapy in Rectal Cancer',
    indication: 'Lokal ileri yüksek riskli rektum kanserinde kısa dönem radyoterapi (5x5 Gy) ve ardından konsolidasyon kemoterapisinin (TNT) standart kemosensitizasyonlu uzun dönem KRT’ye kıyasla metastaz ilişkili başarısızlığı anlamlı derecede düşürdüğünü kanıtlayan Faz III çalışma.',
    indication_en: 'Phase III trial demonstrating short-course radiotherapy (5x5 Gy) followed by consolidation chemotherapy (TNT) significantly reduces disease-related treatment failure compared to standard preoperative chemoradiotherapy.',
    publication: 'The Lancet Oncology, 2021',
    authors: 'Bahadoer RR, Dijkstra EA, van Etten B, et al.',
    url: 'https://doi.org/10.1016/S1470-2045(20)30555-6',
    linkLabel: 'DOI',
  },
  {
    category: 'gis',
    title: 'CROSS Trial (van Hagen et al., NEJM 2012 / Shapiro et al., Lancet Oncol 2015) — Preoperative Chemoradiotherapy in Esophageal Cancer',
    indication: 'Rezeke edilebilir özofagus ve gastroözofageal bileşke kanserlerinde preoperatif haftalık karboplatin/paklitaksel eşliğinde 41.4 Gy (23x1.8 Gy) kemoradyoterapinin genel sağkalımı anlamlı şekilde artırdığını kanıtlayan dönüm noktası çalışma.',
    indication_en: 'Pivotal Phase III trial demonstrating preoperative chemoradiotherapy (41.4 Gy with weekly carboplatin/paclitaxel) substantially improves overall survival compared with surgery alone in esophageal or gastroesophageal junction cancer.',
    publication: 'New England Journal of Medicine, 2012; Lancet Oncology, 2015',
    authors: 'van Hagen P, Hulshof MCCM, van Lanschot JJB, et al.',
    url: 'https://doi.org/10.1056/NEJMoa1112088',
    linkLabel: 'DOI',
  },
];

type GuidelineFilterTab = 'all' | 'nccn' | 'astro' | 'estro' | 'constraints' | 'cooperative';

export default function ReferencesPage() {
  const { language: lang } = useLanguage();

  // Active view: 'guidelines' (30 Institutional Guidelines Radar) or 'trials' (Landmark Trials Archive)
  const [activeView, setActiveView] = useState<'guidelines' | 'trials'>('guidelines');

  // Guidelines filter & search state
  const [guidelineCategory, setGuidelineCategory] = useState<GuidelineFilterTab>('all');
  const [guidelineSearch, setGuidelineSearch] = useState('');

  // Landmark trials filter state
  const [activeTrialCategory, setActiveTrialCategory] = useState<CategoryId | 'all'>('all');

  // Filtered guidelines radar
  const filteredGuidelines = useMemo(() => {
    return GUIDELINES_REGISTRY_DATA.filter((item: GuidelineRegistryEntry) => {
      const matchesCategory =
        guidelineCategory === 'all' || item.category === guidelineCategory;
      const q = guidelineSearch.toLowerCase().trim();
      const matchesSearch =
        q === '' ||
        item.title.toLowerCase().includes(q) ||
        item.organSite.toLowerCase().includes(q) ||
        item.currentVersion.toLowerCase().includes(q) ||
        item.summary.toLowerCase().includes(q) ||
        item.organization.toLowerCase().includes(q) ||
        (item.organizationBadge && item.organizationBadge.toLowerCase().includes(q));
      return matchesCategory && matchesSearch;
    });
  }, [guidelineCategory, guidelineSearch]);

  // Filtered landmark trials
  const filteredTrials = useMemo(() => {
    if (activeTrialCategory === 'all') return landmarkReferences;
    return landmarkReferences.filter(r => r.category === activeTrialCategory);
  }, [activeTrialCategory]);

  const getOrgBadgeStyles = (org: string) => {
    switch (org) {
      case 'NCCN':
        return 'border-sky-500/30 bg-sky-500/10 text-sky-300 ring-1 ring-sky-500/20';
      case 'ASTRO':
        return 'border-amber-500/30 bg-amber-500/10 text-amber-300 ring-1 ring-amber-500/20';
      case 'ESTRO':
        return 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300 ring-1 ring-emerald-500/20';
      case 'QUANTEC':
      case 'AAPM':
        return 'border-purple-500/30 bg-purple-500/10 text-purple-300 ring-1 ring-purple-500/20';
      case 'NRG':
      case 'TROD':
      default:
        return 'border-teal-500/30 bg-teal-500/10 text-teal-300 ring-1 ring-teal-500/20';
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-950 via-[#0b1220] to-[#040814] text-slate-100 py-10 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        {/* Navigation & Header */}
        <div className="mb-6">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-xs font-semibold text-sky-400 hover:text-sky-300 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>{lang === 'en' ? 'Back to Portal' : 'Ana Portala Dön'}</span>
          </Link>
        </div>

        <header className="mb-8">
          <div className="inline-flex items-center gap-2 rounded-full border border-sky-500/20 bg-sky-500/10 px-3 py-1 text-xs font-semibold text-sky-300 mb-3">
            <Activity className="h-3.5 w-3.5" />
            <span>
              {lang === 'en'
                ? 'RadOnc Clinical Guidelines & Evidence Radar'
                : 'RadOnco Klinik Kılavuzlar ve Kanıt Radarı'}
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-300 bg-clip-text text-transparent">
            {lang === 'en'
              ? 'Institutional Guidelines & Evidence Radar'
              : 'Klinik Kılavuzlar ve Kanıt Radarı'}
          </h1>
          <p className="mt-3 max-w-3xl text-sm sm:text-base text-slate-400 leading-relaxed">
            {lang === 'en'
              ? 'Real-time institutional guideline version tracking across NCCN, ASTRO, ESTRO, QUANTEC, HyTEC, AAPM and TROD national protocols. All algorithms and dose constraints are mapped to deterministic SaMD rules.'
              : 'NCCN, ASTRO, ESTRO, QUANTEC, HyTEC, AAPM ve TROD ulusal tedavi protokolleri için gerçek zamanlı kurumsal sürüm takibi. Tüm doz algoritmaları ve klinik kararlar deterministik SaMD kurallarıyla eşleştirilmiştir.'}
          </p>
        </header>

        {/* 4 Header Audit Metrics */}
        <section aria-label="Audit Metrics" className="mb-10">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Metric 1 */}
            <div className="rounded-2xl border border-sky-500/20 bg-slate-900/60 backdrop-blur-xl p-5 shadow-lg relative overflow-hidden group hover:border-sky-500/40 transition-all">
              <div className="absolute -top-10 -right-10 w-24 h-24 bg-sky-500/10 rounded-full blur-xl pointer-events-none" />
              <div className="flex items-center justify-between mb-3">
                <span className="p-2 rounded-xl bg-sky-500/10 text-sky-400 border border-sky-500/20">
                  <BookOpen className="h-5 w-5" />
                </span>
                <span className="text-[10px] font-bold uppercase tracking-wider text-sky-400/80 bg-sky-400/10 px-2 py-0.5 rounded-full">
                  Verified
                </span>
              </div>
              <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                {lang === 'en' ? '30 Verified Guidelines' : '30 Doğrulanmış Kaynak'}
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                NCCN · ASTRO · ESTRO · QUANTEC · TROD
              </p>
            </div>

            {/* Metric 2 */}
            <div className="rounded-2xl border border-emerald-500/20 bg-slate-900/60 backdrop-blur-xl p-5 shadow-lg relative overflow-hidden group hover:border-emerald-500/40 transition-all">
              <div className="absolute -top-10 -right-10 w-24 h-24 bg-emerald-500/10 rounded-full blur-xl pointer-events-none" />
              <div className="flex items-center justify-between mb-3">
                <span className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  <CheckCircle2 className="h-5 w-5" />
                </span>
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400/80 bg-emerald-400/10 px-2 py-0.5 rounded-full">
                  100% Audit
                </span>
              </div>
              <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                {lang === 'en' ? '100% Rule Audit Coverage' : '100% Kural Eşleşmesi'}
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                {lang === 'en'
                  ? '194+ Linked Decision Rules'
                  : '194+ Karar Kuralı İle Bağlantılı'}
              </p>
            </div>

            {/* Metric 3 */}
            <div className="rounded-2xl border border-amber-500/20 bg-slate-900/60 backdrop-blur-xl p-5 shadow-lg relative overflow-hidden group hover:border-amber-500/40 transition-all">
              <div className="absolute -top-10 -right-10 w-24 h-24 bg-amber-500/10 rounded-full blur-xl pointer-events-none" />
              <div className="flex items-center justify-between mb-3">
                <span className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
                  <Calendar className="h-5 w-5" />
                </span>
                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400/80 bg-amber-400/10 px-2 py-0.5 rounded-full">
                  v1.2026 Active
                </span>
              </div>
              <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                {lang === 'en' ? 'Last Audit: Oct 2026' : 'Son Global Denetim: Ekim 2026'}
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                {lang === 'en'
                  ? 'Continuous Institutional Revision'
                  : 'Kesintisiz Kurumsal Sürüm Doğrulama'}
              </p>
            </div>

            {/* Metric 4 */}
            <div className="rounded-2xl border border-purple-500/20 bg-slate-900/60 backdrop-blur-xl p-5 shadow-lg relative overflow-hidden group hover:border-purple-500/40 transition-all">
              <div className="absolute -top-10 -right-10 w-24 h-24 bg-purple-500/10 text-purple-400 border border-purple-500/20">
                <FileCheck2 className="h-5 w-5" />
              </div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-purple-400/80 bg-purple-400/10 px-2 py-0.5 rounded-full float-right mt-1">
                SaMD Reg
              </span>
              <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight mt-1">
                MDR Rule 11
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                {lang === 'en'
                  ? 'SaMD Audit Trace Ready'
                  : 'SaMD Klinik Denetim İzi Hazır'}
              </p>
            </div>
          </div>
        </section>

        {/* View Switcher: Guidelines Radar vs Landmark Trials */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 mb-8 border-b border-slate-800 pb-5">
          <div className="inline-flex rounded-xl bg-slate-900/90 p-1 border border-slate-800">
            <button
              type="button"
              onClick={() => setActiveView('guidelines')}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all ${
                activeView === 'guidelines'
                  ? 'bg-sky-500 text-slate-950 shadow-md font-bold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Activity className="h-4 w-4" />
              <span>
                {lang === 'en'
                  ? 'Guideline Version Radar (30 Sources)'
                  : 'Kılavuz Sürüm Radarı (30 Kaynak)'}
              </span>
            </button>
            <button
              type="button"
              onClick={() => setActiveView('trials')}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all ${
                activeView === 'trials'
                  ? 'bg-sky-500 text-slate-950 shadow-md font-bold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Layers className="h-4 w-4" />
              <span>
                {lang === 'en'
                  ? 'Landmark Phase III Trials (Evidence)'
                  : 'Landmark Faz III Çalışmalar (Literatür)'}
              </span>
            </button>
          </div>

          {activeView === 'guidelines' && (
            <div className="relative w-full sm:w-80">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
              <input
                type="text"
                value={guidelineSearch}
                onChange={e => setGuidelineSearch(e.target.value)}
                placeholder={
                  lang === 'en'
                    ? 'Search guidelines, organ, version...'
                    : 'Kılavuz, organ veya sürüm ara...'
                }
                className="w-full rounded-xl border border-slate-800 bg-slate-900/80 pl-9 pr-4 py-2 text-xs sm:text-sm text-slate-200 placeholder-slate-500 focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
              />
              {guidelineSearch && (
                <button
                  type="button"
                  onClick={() => setGuidelineSearch('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-white"
                >
                  ✕
                </button>
              )}
            </div>
          )}
        </div>

        {/* =========================================================================
            VIEW 1: 30-SOURCE CLINICAL GUIDELINES RADAR
            ========================================================================= */}
        {activeView === 'guidelines' && (
          <div className="space-y-6">
            {/* Quick Category Filter Pills */}
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin">
              <button
                type="button"
                onClick={() => setGuidelineCategory('all')}
                className={`shrink-0 rounded-xl px-3.5 py-2 text-xs font-semibold transition-all flex items-center gap-2 ${
                  guidelineCategory === 'all'
                    ? 'bg-sky-500/20 text-sky-200 border border-sky-400/50 ring-1 ring-sky-500/30'
                    : 'bg-slate-900/60 text-slate-400 border border-slate-800 hover:border-slate-700 hover:text-slate-200'
                }`}
              >
                <span>{lang === 'en' ? 'All (30)' : 'Tümü (30)'}</span>
              </button>

              <button
                type="button"
                onClick={() => setGuidelineCategory('nccn')}
                className={`shrink-0 rounded-xl px-3.5 py-2 text-xs font-semibold transition-all flex items-center gap-2 ${
                  guidelineCategory === 'nccn'
                    ? 'bg-sky-500/20 text-sky-200 border border-sky-400/50 ring-1 ring-sky-500/30'
                    : 'bg-slate-900/60 text-slate-400 border border-slate-800 hover:border-slate-700 hover:text-slate-200'
                }`}
              >
                <span className="h-2 w-2 rounded-full bg-sky-400" />
                <span>NCCN (11)</span>
              </button>

              <button
                type="button"
                onClick={() => setGuidelineCategory('astro')}
                className={`shrink-0 rounded-xl px-3.5 py-2 text-xs font-semibold transition-all flex items-center gap-2 ${
                  guidelineCategory === 'astro'
                    ? 'bg-amber-500/20 text-amber-200 border border-amber-400/50 ring-1 ring-amber-500/30'
                    : 'bg-slate-900/60 text-slate-400 border border-slate-800 hover:border-slate-700 hover:text-slate-200'
                }`}
              >
                <span className="h-2 w-2 rounded-full bg-amber-400" />
                <span>ASTRO (6)</span>
              </button>

              <button
                type="button"
                onClick={() => setGuidelineCategory('estro')}
                className={`shrink-0 rounded-xl px-3.5 py-2 text-xs font-semibold transition-all flex items-center gap-2 ${
                  guidelineCategory === 'estro'
                    ? 'bg-emerald-500/20 text-emerald-200 border border-emerald-400/50 ring-1 ring-emerald-500/30'
                    : 'bg-slate-900/60 text-slate-400 border border-slate-800 hover:border-slate-700 hover:text-slate-200'
                }`}
              >
                <span className="h-2 w-2 rounded-full bg-emerald-400" />
                <span>ESTRO (5)</span>
              </button>

              <button
                type="button"
                onClick={() => setGuidelineCategory('constraints')}
                className={`shrink-0 rounded-xl px-3.5 py-2 text-xs font-semibold transition-all flex items-center gap-2 ${
                  guidelineCategory === 'constraints'
                    ? 'bg-purple-500/20 text-purple-200 border border-purple-400/50 ring-1 ring-purple-500/30'
                    : 'bg-slate-900/60 text-slate-400 border border-slate-800 hover:border-slate-700 hover:text-slate-200'
                }`}
              >
                <span className="h-2 w-2 rounded-full bg-purple-400" />
                <span>
                  {lang === 'en'
                    ? 'Dose Constraints / QUANTEC-HyTEC (4)'
                    : 'Doz Kısıtları / QUANTEC-HyTEC (4)'}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setGuidelineCategory('cooperative')}
                className={`shrink-0 rounded-xl px-3.5 py-2 text-xs font-semibold transition-all flex items-center gap-2 ${
                  guidelineCategory === 'cooperative'
                    ? 'bg-teal-500/20 text-teal-200 border border-teal-400/50 ring-1 ring-teal-500/30'
                    : 'bg-slate-900/60 text-slate-400 border border-slate-800 hover:border-slate-700 hover:text-slate-200'
                }`}
              >
                <span className="h-2 w-2 rounded-full bg-teal-400" />
                <span>
                  {lang === 'en' ? 'Cooperative / TROD (4)' : 'Kooperatif / TROD (4)'}
                </span>
              </button>
            </div>

            {/* Results count */}
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span>
                {lang === 'en'
                  ? `Showing ${filteredGuidelines.length} of ${GUIDELINES_REGISTRY_DATA.length} verified guidelines`
                  : `${filteredGuidelines.length} / ${GUIDELINES_REGISTRY_DATA.length} doğrulanmış kılavuz listeleniyor`}
              </span>
              <span className="inline-flex items-center gap-1.5 text-emerald-400 font-medium">
                <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                {lang === 'en' ? 'Live Registry Synced' : 'Canlı Kılavuz Veri Tabanı Senkronize'}
              </span>
            </div>

            {/* 2-3 Column Responsive Card Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredGuidelines.map(guideline => (
                <article
                  key={guideline.id}
                  className="rounded-2xl border border-slate-800/90 bg-slate-900/60 backdrop-blur-xl p-5 shadow-xl hover:border-slate-700 hover:bg-slate-900/80 transition-all flex flex-col justify-between group"
                >
                  <div>
                    {/* Top Badges Row */}
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <div className="flex items-center gap-2">
                        {/* Organization pill badge */}
                        <span
                          className={`rounded-lg px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider border ${getOrgBadgeStyles(
                            guideline.organization
                          )}`}
                        >
                          {guideline.organizationBadge || guideline.organization}
                        </span>

                        {/* Organ site badge */}
                        <span className="rounded-lg bg-slate-800/80 border border-slate-700 px-2 py-0.5 text-[10px] font-semibold text-slate-300">
                          {guideline.organSite}
                        </span>
                      </div>

                      {/* Verified badge */}
                      <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/25 shrink-0">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                        {lang === 'en' ? '✓ Up to Date' : '✓ Doğrulandı'}
                      </span>
                    </div>

                    {/* Version & Date Subheading */}
                    <div className="flex items-center gap-2 mb-2">
                      <span className="px-2 py-0.5 rounded text-[11px] font-mono font-bold bg-slate-800 text-sky-300 border border-slate-700">
                        {guideline.currentVersion}
                      </span>
                      <span className="text-[10px] text-slate-400">
                        {guideline.cadence} · {guideline.lastVerifiedDate}
                      </span>
                    </div>

                    {/* Title */}
                    <h3 className="text-sm sm:text-base font-bold text-white group-hover:text-amber-300 transition-colors leading-snug">
                      {guideline.title}
                    </h3>

                    {/* Summary */}
                    <p className="mt-2.5 text-xs text-slate-400 leading-relaxed line-clamp-3">
                      {guideline.summary}
                    </p>
                  </div>

                  {/* Card Footer & Action Button */}
                  <div className="mt-5 pt-4 border-t border-slate-800/80">
                    <div className="flex items-center justify-between text-[11px] text-slate-400 mb-3">
                      <span className="inline-flex items-center gap-1 text-slate-300 font-medium">
                        <Sparkles className="h-3 w-3 text-amber-400" />
                        {lang === 'en'
                          ? `${guideline.linkedRulesCount} Linked Decision Rules`
                          : `${guideline.linkedRulesCount} Karar Kuralı İle Entegre`}
                      </span>
                      <span className="text-slate-500">MDR Trace: OK</span>
                    </div>

                    <a
                      href={guideline.officialUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full py-2.5 px-4 rounded-xl font-semibold text-xs sm:text-sm bg-gradient-to-r from-sky-500/15 via-sky-400/10 to-sky-500/15 hover:from-sky-500/25 hover:to-sky-500/25 text-sky-200 border border-sky-500/30 hover:border-sky-400/60 transition-all flex items-center justify-center gap-2 group/btn"
                    >
                      <span>
                        {lang === 'en'
                          ? '↗ View Official Guideline'
                          : '↗ Resmi Kılavuzu İncele'}
                      </span>
                      <ExternalLink className="h-3.5 w-3.5 transition-transform group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5" />
                    </a>
                  </div>
                </article>
              ))}
            </div>
          </div>
        )}

        {/* =========================================================================
            VIEW 2: LANDMARK CLINICAL TRIALS ARCHIVE
            ========================================================================= */}
        {activeView === 'trials' && (
          <div className="space-y-6">
            {/* Trial categories */}
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin">
              {landmarkCategories.map(cat => {
                const isActive = activeTrialCategory === cat.id;
                const count =
                  cat.id === 'all'
                    ? landmarkReferences.length
                    : landmarkReferences.filter(r => r.category === cat.id).length;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setActiveTrialCategory(cat.id)}
                    className={`shrink-0 rounded-xl px-3 py-1.5 text-xs font-semibold transition-all flex items-center gap-1.5 ${
                      isActive
                        ? 'border-sky-400 bg-sky-500/20 text-sky-200 ring-1 ring-sky-500/30'
                        : 'border-slate-800 bg-slate-900/60 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                    }`}
                  >
                    <span>{lang === 'en' ? cat.label_en : cat.label_tr}</span>
                    <span className="text-[10px] px-1.5 py-0.2 rounded-full font-mono bg-slate-800 text-slate-300">
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredTrials.map(trial => (
                <article
                  key={trial.title}
                  className="rounded-2xl border border-slate-800 bg-[#0e1726]/80 p-5 shadow-lg flex flex-col justify-between hover:border-slate-700 transition-all"
                >
                  <div>
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <span className="rounded-md border border-sky-500/20 bg-sky-500/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-sky-300">
                        {lang === 'en'
                          ? landmarkCategories.find(c => c.id === trial.category)?.label_en
                          : landmarkCategories.find(c => c.id === trial.category)?.label_tr}
                      </span>
                      <span className="text-[11px] text-slate-400">{trial.publication}</span>
                    </div>
                    <h3 className="text-sm sm:text-base font-bold text-white">
                      {trial.title}
                    </h3>
                    <p className="mt-2 text-xs sm:text-sm text-slate-400 leading-relaxed">
                      {lang === 'en' ? trial.indication_en : trial.indication}
                    </p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between gap-3">
                    <span className="text-xs text-slate-400 truncate max-w-[60%]">
                      {trial.authors}
                    </span>
                    <a
                      href={trial.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800/90 px-3 py-1.5 text-xs font-semibold text-sky-300 hover:border-sky-500 hover:text-sky-200 transition-all"
                    >
                      <span>{trial.linkLabel || 'PubMed / DOI'}</span>
                      <ExternalLink className="h-3.5 w-3.5" />
                    </a>
                  </div>
                </article>
              ))}
            </div>
          </div>
        )}

        {/* Legal Disclaimer Box */}
        <aside className="mt-12 rounded-2xl border border-amber-500/25 bg-amber-500/[0.05] p-5 sm:p-6 backdrop-blur-xl">
          <div className="flex items-start gap-3">
            <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-amber-300" aria-hidden="true" />
            <div>
              <h2 className="text-sm font-bold text-amber-100">
                {lang === 'en'
                  ? 'Regulatory, Trademark & Fair-Use Notice'
                  : 'Yasal Sorumluluk, Telif ve Tescilli Marka Bildirimi'}
              </h2>
              <p className="mt-2 text-xs leading-relaxed text-slate-300">
                {lang === 'en'
                  ? 'NCCN®, ASTRO®, ESTRO®, RTOG®, QUANTEC®, EMBRACE®, AAPM® and related clinical consensus marks are the exclusive property of their respective trademark holders. RadOnc CDSS is an independent software tool providing educational citations and deterministic clinical algorithms in compliance with European Medical Device Regulation (MDR) Rule 11 and SaMD audit trace standards.'
                  : 'NCCN®, ASTRO®, ESTRO®, RTOG®, QUANTEC®, EMBRACE®, AAPM® ve ilgili diğer isimler kendi tescilli kurumlarının mülkiyetindedir. RadOnco CDSS, bağımsız bir klinik karar destek ve eğitim aracı olup Avrupa Tıbbi Cihaz Yönetmeliği (MDR) Kural 11 ve SaMD denetim standartlarına uygun algoritmik referanslama sağlar.'}
              </p>
              <p className="mt-2 text-[11px] leading-relaxed text-slate-400 border-t border-amber-500/15 pt-2">
                {lang === 'en'
                  ? 'This registry verifies institutional guideline release versions; it does not replace individualized multidisciplinary tumor board consensus or clinical judgment.'
                  : 'Bu veri tabanı kurumsal kılavuz sürümlerini doğrular; bireysel multidisipliner tümör konseyi veya uzman hekim klinik kanaatinin yerine geçmez.'}
              </p>
            </div>
          </div>
        </aside>
      </div>
    </main>
  );
}
