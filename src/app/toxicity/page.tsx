'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  Activity,
  ArrowUpRight,
  BookOpen,
  CircleDot,
  Droplets,
  HeartPulse,
  Search,
  ShieldAlert,
  ShieldCheck,
  Stethoscope,
  Utensils,
  Wind,
  X,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

type GradeLevel = '1' | '2' | '3' | '4';
type OrganFilter = 'All' | 'Skin' | 'Thorax' | 'Esophagus' | 'Oral cavity' | 'Pelvis' | 'Salivary glands';
type GradeGuidance = {
  criteria: string;
  management: string[];
  defined?: boolean;
};
type ToxicityEvent = {
  id: string;
  name: string;
  organ: Exclude<OrganFilter, 'All'>;
  icon: LucideIcon;
  summary: string;
  grades: Record<GradeLevel, GradeGuidance>;
};

const gradeOrder: GradeLevel[] = ['1', '2', '3', '4'];
const filters: OrganFilter[] = ['All', 'Skin', 'Thorax', 'Esophagus', 'Oral cavity', 'Pelvis', 'Salivary glands'];

const gradeStyles: Record<GradeLevel, { label: string; className: string; badgeClass: string }> = {
  '1': {
    label: 'Mild',
    className: 'border-emerald-400/20 bg-emerald-400/[0.04]',
    badgeClass: 'bg-emerald-400/10 text-emerald-300',
  },
  '2': {
    label: 'Moderate',
    className: 'border-sky-400/20 bg-sky-400/[0.04]',
    badgeClass: 'bg-sky-400/10 text-sky-300',
  },
  '3': {
    label: 'Severe',
    className: 'border-amber-400/25 bg-amber-400/[0.04]',
    badgeClass: 'bg-amber-400/10 text-amber-300',
  },
  '4': {
    label: 'Life-threatening',
    className: 'border-rose-400/25 bg-rose-400/[0.04]',
    badgeClass: 'bg-rose-400/10 text-rose-300',
  },
};

const toxicities: ToxicityEvent[] = [
  {
    id: 'radiation-dermatitis',
    name: 'Radiation Dermatitis',
    organ: 'Skin',
    icon: CircleDot,
    summary: 'Assess erythema, dry or moist desquamation, edema, bleeding, ulceration, and necrosis within the treated field.',
    grades: {
      '1': {
        criteria: 'Faint erythema or dry desquamation; mild tightness or pruritus may occur.',
        management: [
          'Use gentle cleansing, fragrance-free moisturizers, and barrier products on intact skin; reduce friction and adhesive trauma.',
          'A clinician may use a topical corticosteroid on intact inflamed skin according to the site-specific pathway.',
        ],
      },
      '2': {
        criteria: 'Moderate to brisk erythema, patchy moist desquamation confined to skin folds or creases, or moderate edema.',
        management: [
          'Review skin-care technique and pain; use non-adherent dressings or hydrogel for moist areas as appropriate.',
          'Keep topical corticosteroids to intact skin. Check for secondary infection if exudate, increasing pain, or fever develops.',
        ],
      },
      '3': {
        criteria: 'Moist desquamation outside skin folds; bleeding may occur with minor trauma or friction.',
        management: [
          'Arrange prompt wound-care or radiation-oncology assessment; use gentle cleansing and absorbent, non-adherent dressings.',
          'Consider silver sulfadiazine only when prescribed under the local wound-care protocol; check allergy and site-specific precautions.',
        ],
      },
      '4': {
        criteria: 'Life-threatening consequences, including full-thickness dermal ulceration or necrosis, spontaneous bleeding, or need for skin grafting.',
        management: [
          'Urgent specialist assessment; evaluate bleeding, infection, tissue viability, and need for hospital or surgical care.',
          'Provide analgesia and wound care with a specialist-directed plan; use topical antimicrobials only when clinically indicated.',
        ],
      },
    },
  },
  {
    id: 'radiation-pneumonitis',
    name: 'Radiation Pneumonitis',
    organ: 'Thorax',
    icon: Wind,
    summary: 'Distinguish asymptomatic radiographic change from symptomatic pneumonitis; exclude infection, embolism, progression, and other causes.',
    grades: {
      '1': {
        criteria: 'Asymptomatic; imaging or clinical observations only; intervention is not indicated.',
        management: [
          'Review symptoms, oxygen saturation, treatment timing, and imaging; monitor clinically and radiographically as indicated.',
          'Do not start systemic corticosteroids for imaging changes alone unless another indication is established.',
        ],
      },
      '2': {
        criteria: 'Symptomatic; medical intervention is indicated and instrumental activities may be limited.',
        management: [
          'Assess oxygenation and investigate competing diagnoses before attributing symptoms to radiation.',
          'For clinically diagnosed symptomatic pneumonitis, a clinician may use prednisone about 1 mg/kg/day followed by an individualized 6-8 week taper; reassess response and relapse.',
          'Give supplemental oxygen when hypoxemia or the patient’s clinical status indicates it.',
        ],
      },
      '3': {
        criteria: 'Severe symptoms limiting self-care activities; oxygen is indicated.',
        management: [
          'Urgent hospital-level assessment, oxygen and respiratory monitoring; involve pulmonology and radiation oncology.',
          'Systemic corticosteroids are generally used after infection and other urgent causes have been evaluated; taper under close clinical supervision.',
        ],
      },
      '4': {
        criteria: 'Life-threatening respiratory compromise requiring urgent intervention, such as ventilatory support.',
        management: [
          'Emergency or intensive-care management with airway and oxygenation support.',
          'Urgently evaluate infection, pulmonary embolism, and other causes while specialists direct corticosteroids and additional treatment.',
        ],
      },
    },
  },
  {
    id: 'radiation-esophagitis',
    name: 'Radiation Esophagitis',
    organ: 'Esophagus',
    icon: Utensils,
    summary: 'Grade dysphagia, odynophagia, oral intake, hydration, and functional impact; consider infection, reflux, and obstruction.',
    grades: {
      '1': {
        criteria: 'Asymptomatic or mild symptoms; intervention is not indicated.',
        management: [
          'Encourage fluids and soft, moist foods; avoid foods or temperatures that trigger pain.',
          'Monitor swallowing, weight, and oral intake during treatment.',
        ],
      },
      '2': {
        criteria: 'Symptomatic with altered eating or swallowing; oral supplements may be indicated.',
        management: [
          'Use small, frequent, soft meals and oral nutritional supplements; dietitian review is appropriate if intake declines.',
          'Provide clinician-selected analgesia or mucosal protectants; assess for candidiasis, reflux, dehydration, and weight loss.',
        ],
      },
      '3': {
        criteria: 'Severely altered eating or swallowing; tube feeding, parenteral nutrition, or hospitalization may be indicated.',
        management: [
          'Urgent swallowing, nutrition, and hydration assessment; consider enteral support when oral intake is inadequate.',
          'Treat identified infection and control pain; evaluate severe or progressive symptoms for stricture or other complications.',
        ],
      },
      '4': {
        criteria: 'Life-threatening consequences requiring urgent intervention.',
        management: [
          'Urgent hospital and specialist evaluation for inability to maintain airway or hydration, bleeding, perforation, or obstruction.',
          'Stabilize nutrition and fluids and treat the identified complication with gastroenterology and radiation-oncology input.',
        ],
      },
    },
  },
  {
    id: 'oral-mucositis',
    name: 'Oral Mucositis',
    organ: 'Oral cavity',
    icon: Stethoscope,
    summary: 'Assess mucosal ulceration, pain, oral intake, hydration, and infection risk; document functional impact.',
    grades: {
      '1': {
        criteria: 'Asymptomatic or mild symptoms; intervention is not indicated.',
        management: [
          'Maintain gentle oral hygiene and bland saline or sodium-bicarbonate rinses; avoid tobacco, alcohol, and irritating foods.',
          'Review hydration and oral-care technique at treatment visits.',
        ],
      },
      '2': {
        criteria: 'Moderate pain or ulceration that does not interfere with oral intake; a modified diet may be indicated.',
        management: [
          'Use soft, moist foods and frequent fluids; consider topical mucosal protectants and clinician-selected analgesic suspensions.',
          '“Magic mouthwash” formulations vary and are not standardized; prescribe only a locally approved formulation and assess for candidiasis or HSV when suspected.',
        ],
      },
      '3': {
        criteria: 'Severe pain interfering with oral intake.',
        management: [
          'Provide adequate systemic analgesia and urgent nutrition and hydration assessment; consider enteral support if intake is insufficient.',
          'Examine for infection, bleeding, or superimposed causes and involve oral medicine or supportive-care specialists.',
        ],
      },
      '4': {
        criteria: 'Life-threatening consequences requiring urgent intervention.',
        management: [
          'Urgent hospital assessment for airway compromise, uncontrolled bleeding, sepsis, or inability to maintain hydration.',
          'Stabilize airway, infection, pain, fluids, and nutrition with multidisciplinary care.',
        ],
      },
    },
  },
  {
    id: 'radiation-proctitis',
    name: 'Radiation Proctitis',
    organ: 'Pelvis',
    icon: Activity,
    summary: 'Track urgency, frequency, tenesmus, pain, mucus, and rectal bleeding; distinguish acute toxicity from late injury.',
    grades: {
      '1': {
        criteria: 'Mild symptoms or clinical observations only; intervention is not indicated.',
        management: [
          'Review stool pattern, hydration, and diet; monitor bleeding and symptom trajectory.',
          'Exclude infection and medication-related causes when symptoms are new or atypical.',
        ],
      },
      '2': {
        criteria: 'Moderate symptoms requiring medical intervention and potentially limiting instrumental activities.',
        management: [
          'Hydration and symptom-directed bowel care; a clinician may consider an antispasmodic for cramping after assessment.',
          'For selected patients, topical corticosteroid or short-chain fatty-acid enemas may be considered by a specialist; evidence and suitability vary by setting.',
        ],
      },
      '3': {
        criteria: 'Severe symptoms limiting self-care or requiring hospitalization; clinically significant bleeding may occur.',
        management: [
          'Prompt gastroenterology or radiation-oncology assessment; check blood count and hemodynamic status when bleeding is significant.',
          'Provide fluids, analgesia, and targeted treatment after evaluating infection, ulceration, and other causes; consider endoscopy when indicated.',
        ],
      },
      '4': {
        criteria: 'Life-threatening consequences requiring urgent intervention.',
        management: [
          'Emergency hospital care for major hemorrhage, hemodynamic instability, perforation, or sepsis.',
          'Resuscitation and urgent endoscopic, interventional, or surgical management as directed by specialists.',
        ],
      },
    },
  },
  {
    id: 'radiation-cystitis',
    name: 'Radiation Cystitis',
    organ: 'Pelvis',
    icon: Droplets,
    summary: 'Assess urgency, frequency, dysuria, suprapubic discomfort, hematuria, retention, and hydration; exclude urinary infection.',
    grades: {
      '1': {
        criteria: 'Mild symptoms or observations only; intervention is not indicated.',
        management: [
          'Encourage appropriate hydration and monitor urinary symptoms.',
          'Obtain urinalysis or culture when clinically indicated; do not assume new urinary symptoms are radiation-related.',
        ],
      },
      '2': {
        criteria: 'Moderate symptoms requiring medical intervention; catheterization is not indicated.',
        management: [
          'Exclude infection and retention; provide hydration and symptom-directed care.',
          'A clinician may consider an antispasmodic for urgency or bladder spasm after reviewing contraindications and other causes.',
        ],
      },
      '3': {
        criteria: 'Severe symptoms; catheterization, transfusion, procedural intervention, or hospitalization may be indicated.',
        management: [
          'Urgent assessment for gross hematuria, clots, retention, anemia, or renal impairment; involve urology.',
          'Monitor blood count and renal function as appropriate; bladder irrigation or other intervention requires specialist direction.',
        ],
      },
      '4': {
        criteria: 'Life-threatening consequences requiring urgent intervention.',
        management: [
          'Emergency urology and hospital care for hemodynamic compromise, uncontrolled hemorrhage, or obstructive clot retention.',
          'Stabilize circulation and urinary drainage; treat the underlying complication under specialist supervision.',
        ],
      },
    },
  },
  {
    id: 'radiation-xerostomia',
    name: 'Radiation-Induced Xerostomia',
    organ: 'Salivary glands',
    icon: HeartPulse,
    summary: 'Assess dry or thick saliva, oral intake, salivary flow, dental health, and impact on speaking, chewing, and swallowing.',
    grades: {
      '1': {
        criteria: 'Symptomatic dry or thick saliva without significant dietary alteration; unstimulated saliva may remain above 0.2 mL/min.',
        management: [
          'Offer frequent sips of water, humidification, sugar-free gum or lozenges, and saliva substitutes or oral lubricants.',
          'Start preventive dental care: fluoride, regular dental review, and meticulous oral hygiene.',
        ],
      },
      '2': {
        criteria: 'Moderate symptoms with oral intake changes, such as frequent water or lubricants or a soft, moist diet; unstimulated saliva may be 0.1-0.2 mL/min.',
        management: [
          'Continue saliva substitutes, hydration, and dental prevention; adapt food texture and moisture to maintain intake.',
          'Consider pilocarpine or another cholinergic agonist when residual gland function is likely and contraindications have been reviewed.',
        ],
      },
      '3': {
        criteria: 'Inability to maintain adequate oral alimentation; tube feeding or parenteral nutrition may be indicated; unstimulated saliva may be below 0.1 mL/min.',
        management: [
          'Arrange urgent nutrition, hydration, and dental assessment; provide enteral support if oral intake is inadequate.',
          'Review candidiasis, dental caries, oral pain, and swallowing function; cholinergic treatment requires individualized medical review.',
        ],
      },
      '4': {
        defined: false,
        criteria: 'CTCAE v5.0 does not define a Grade 4 category for the Dry Mouth term. Record severe complications under the applicable CTCAE event.',
        management: [
          'If there is an acute threat to hydration, nutrition, airway, or safety, arrange urgent assessment and manage the complication directly.',
          'Do not assign a CTCAE Grade 4 to xerostomia itself when the grading term does not define one.',
        ],
      },
    },
  },
];

function GradeCard({ grade, guidance }: { grade: GradeLevel; guidance: GradeGuidance }) {
  const style = gradeStyles[grade];

  return (
    <article className={`flex min-h-full flex-col rounded-lg border p-4 ${style.className}`}>
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-500">CTCAE v5.0</p>
          <h4 className="mt-1 text-sm font-semibold text-white">Grade {grade}</h4>
        </div>
        <span className={`rounded-md px-2 py-1 text-[9px] font-bold uppercase tracking-wide ${style.badgeClass}`}>
          {guidance.defined === false ? 'Not defined' : style.label}
        </span>
      </div>
      <div className="mt-4">
        <h5 className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Grading features</h5>
        <p className="mt-1.5 text-xs leading-5 text-slate-200">{guidance.criteria}</p>
      </div>
      <div className="mt-4 flex-1 border-t border-slate-700/70 pt-3">
        <h5 className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Management considerations</h5>
        <ul className="mt-2 space-y-2">
          {guidance.management.map(item => (
            <li key={item} className="flex gap-2 text-[11px] leading-5 text-slate-300">
              <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-sky-400" aria-hidden="true" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </div>
    </article>
  );
}

export default function ToxicityAtlasPage() {
  const [activeFilter, setActiveFilter] = useState<OrganFilter>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const query = searchQuery.trim().toLowerCase();
  const filteredToxicities = toxicities.filter(event => {
    if (activeFilter !== 'All' && event.organ !== activeFilter) return false;
    if (!query) return true;

    const searchableText = [
      event.name,
      event.organ,
      event.summary,
      ...Object.values(event.grades).flatMap(grade => [grade.criteria, ...grade.management]),
    ].join(' ').toLowerCase();

    return searchableText.includes(query);
  });

  return (
    <main className="min-h-screen bg-[#0B1120] px-3 py-8 text-slate-100 sm:px-6 sm:py-10">
      <div className="mx-auto max-w-7xl">
        <header className="border-b border-slate-800/80 pb-6">
          <div className="flex flex-wrap items-center gap-2 text-[10px] font-bold uppercase tracking-[0.16em] text-sky-300">
            <HeartPulse className="h-4 w-4" aria-hidden="true" />
            <span>Radiation Oncology / Supportive Care</span>
            <span className="rounded-md border border-slate-700 bg-slate-900/70 px-2 py-1 text-slate-300">CTCAE v5.0</span>
          </div>
          <div className="mt-4 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl">
              <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">Radiation Toxicity Atlas</h1>
              <p className="mt-2 text-sm leading-6 text-slate-300">
                Grade radiation-induced adverse events and review practical, evidence-informed supportive-care options.
              </p>
            </div>
            <Link href="/cdss" className="inline-flex w-fit items-center gap-2 rounded-lg border border-slate-700 bg-slate-900/60 px-3 py-2 text-xs font-semibold text-slate-200 transition hover:border-sky-500/50 hover:text-white">
              Open CDSS workspace
              <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
            </Link>
          </div>
        </header>

        <section className="mt-5 rounded-lg border border-amber-400/20 bg-amber-400/[0.06] px-4 py-3" aria-label="Clinical use notice">
          <div className="flex items-start gap-2.5">
            <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0 text-amber-300" aria-hidden="true" />
            <p className="text-xs leading-5 text-amber-100/90">
              Educational clinical reference only. Grade using the full CTCAE v5.0 term and local protocol. Exclude infection, progression, and other causes; severe or rapidly worsening symptoms require urgent clinical assessment. Management and steroid regimens must be individualized by the treating team.
            </p>
          </div>
        </section>

        <section className="mt-6" aria-label="Filter toxicity events">
          <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
            <div className="flex min-w-0 gap-1 overflow-x-auto pb-1 [scrollbar-width:thin]" role="group" aria-label="Filter by organ system">
              {filters.map(filter => (
                <button
                  key={filter}
                  type="button"
                  aria-pressed={activeFilter === filter}
                  onClick={() => setActiveFilter(filter)}
                  className={`shrink-0 rounded-md border px-3 py-2 text-xs font-semibold transition ${activeFilter === filter
                    ? 'border-sky-400/50 bg-sky-400/10 text-sky-200'
                    : 'border-slate-800 bg-slate-900/50 text-slate-400 hover:border-slate-600 hover:text-slate-200'
                    }`}
                >
                  {filter}
                </button>
              ))}
            </div>
            <label className="flex w-full items-center gap-2 rounded-lg border border-slate-700 bg-slate-900/70 px-3 py-2.5 text-slate-400 focus-within:border-sky-500/60 xl:max-w-sm">
              <Search className="h-4 w-4 shrink-0" aria-hidden="true" />
              <span className="sr-only">Search toxicities, signs, or management</span>
              <input
                type="search"
                value={searchQuery}
                onChange={event => setSearchQuery(event.target.value)}
                placeholder="Search toxicities, signs, or management"
                className="min-w-0 flex-1 bg-transparent text-xs text-white outline-none placeholder:text-slate-500"
              />
              {searchQuery && (
                <button type="button" aria-label="Clear search" onClick={() => setSearchQuery('')} className="rounded p-0.5 text-slate-500 hover:text-white">
                  <X className="h-3.5 w-3.5" aria-hidden="true" />
                </button>
              )}
            </label>
          </div>
        </section>

        <section className="mt-5 space-y-5" aria-live="polite">
          {filteredToxicities.map(event => {
            const Icon = event.icon;
            return (
              <article key={event.id} className="overflow-hidden rounded-xl border border-slate-800 bg-[#0d1728]">
                <header className="flex flex-col gap-3 border-b border-slate-800 bg-slate-900/35 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
                  <div className="flex min-w-0 items-start gap-3">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-sky-400/20 bg-sky-400/[0.07] text-sky-300">
                      <Icon className="h-4 w-4" aria-hidden="true" />
                    </span>
                    <div className="min-w-0">
                      <h2 className="text-sm font-semibold text-white sm:text-base">{event.name}</h2>
                      <p className="mt-1 text-xs leading-5 text-slate-400">{event.summary}</p>
                    </div>
                  </div>
                  <span className="w-fit shrink-0 rounded-md border border-slate-700 px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-slate-400">{event.organ}</span>
                </header>
                <div className="grid gap-3 p-3 sm:grid-cols-2 xl:grid-cols-4 sm:p-4">
                  {gradeOrder.map(grade => (
                    <GradeCard key={grade} grade={grade} guidance={event.grades[grade]} />
                  ))}
                </div>
              </article>
            );
          })}

          {filteredToxicities.length === 0 && (
            <div className="rounded-xl border border-slate-800 bg-[#0d1728] px-5 py-12 text-center">
              <Search className="mx-auto h-5 w-5 text-slate-500" aria-hidden="true" />
              <h2 className="mt-3 text-sm font-semibold text-white">No matching toxicity events</h2>
              <p className="mt-1 text-xs text-slate-400">Try another organ filter or search term.</p>
            </div>
          )}
        </section>

        <section className="mt-8 grid gap-3 border-t border-slate-800/80 pt-6 md:grid-cols-[1fr_auto] md:items-center" aria-labelledby="sources-heading">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-200">
              <BookOpen className="h-4 w-4 text-sky-300" aria-hidden="true" />
              <h2 id="sources-heading">Reference framework</h2>
            </div>
            <p className="mt-1 text-[11px] leading-5 text-slate-500">
              Management summaries are not a substitute for the complete grading criteria, current evidence, or institution-approved pathways. Evidence for selected topical and enema therapies varies; confirm suitability with the relevant specialist.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <a href="https://ctep.cancer.gov/protocolDevelopment/electronic_applications/ctc.htm" target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 rounded-md border border-slate-700 bg-slate-900/60 px-2.5 py-2 text-[10px] font-semibold text-slate-300 transition hover:border-sky-500/50 hover:text-white">
              NCI CTCAE v5.0
              <ArrowUpRight className="h-3 w-3" aria-hidden="true" />
            </a>
            <a href="https://mascc.org/clinical-practice-guidelines/" target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 rounded-md border border-slate-700 bg-slate-900/60 px-2.5 py-2 text-[10px] font-semibold text-slate-300 transition hover:border-sky-500/50 hover:text-white">
              MASCC / ISOO mucositis guidance
              <ArrowUpRight className="h-3 w-3" aria-hidden="true" />
            </a>
            <a href="https://www.astro.org/patient-care-and-research/clinical-practice-statements" target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 rounded-md border border-slate-700 bg-slate-900/60 px-2.5 py-2 text-[10px] font-semibold text-slate-300 transition hover:border-sky-500/50 hover:text-white">
              ASTRO practice resources
              <ArrowUpRight className="h-3 w-3" aria-hidden="true" />
            </a>
          </div>
        </section>

        <footer className="mt-6 flex items-center gap-2 border-t border-slate-800/70 pt-4 text-[10px] leading-4 text-slate-500">
          <ShieldCheck className="h-3.5 w-3.5 shrink-0 text-emerald-400" aria-hidden="true" />
          <p>Verify grade definitions against CTCAE v5.0 and follow current institutional protocols before clinical use.</p>
        </footer>
      </div>
    </main>
  );
}