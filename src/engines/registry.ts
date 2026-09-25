import {
  nsclcEngine, sclcEngine, stomachEngine, rectumEngine, prostateEngine, bladderEngine, breastEngine,
  glialTumorEngine, brainMetastasesEngine, nasopharynxEngine, cervixEngine, palliativeRadiotherapyEngine,
  colonEngine, analEngine, gistEngine, liverCancerEngine, kidneyEngine, testisEngine, penileEngine,
  meningiomaEngine, ependymomaEngine, primaryCNSLymphomaEngine, leptomeningealMetastasesEngine,
  metastaticSpinalTumorEngine, primarySpinalCordTumorEngine, oropharynxEngine, hypopharynxEngine,
  oralCavityEngine, salivaryGlandEngine, maxillarySinusEngine, thyroidEngine, endometrialEngine,
  ovaryEngine, uterusEngine, vaginalEngine, vulvarEngine, medulloblastomaEngine, ewingSarcomaEngine,
  acuteLymphoblasticLeukemiaEngine, wilmsTumorEngine, osteosarcomaEngine, chondrosarcomaEngine,
  giantCellTumorEngine, melanomaEngine, bccEngine, skinSccEngine, cutaneousLymphomaEngine, kaposiSarcomaEngine,
  multipleMyelomaEngine, acuteMyeloidLeukemiaEngine, chronicMyeloidLeukemiaEngine,
} from './index';

import type { DecisionEngine } from './base-engine';
import type { ClinicalCaseInput, OrganSystem } from '../types/cdss';

export interface CDSSFormField {
  key: string;
  label: string;
  description?: string;
  type: 'text' | 'number' | 'boolean' | 'select' | 'textarea';
  options?: { value: string; label: string }[];
}

export type RegimenOption = {
  id: string;
  label: string;
  description: string;
  totalDoseGy: number;
  fractions: number;
  dosePerFractionGy: number;
  bedGy: number;
  eqd2Gy: number;
  alphaBeta: number;
  technique: string;
  targetSummary?: string;
  priority?: 'primary' | 'secondary' | 'backup';
};

export type RegisteredEngine = DecisionEngine<ClinicalCaseInput> & {
  formSchema: CDSSFormField[];
  defaults: Record<string, unknown>;
};

const RAW_ENGINES: DecisionEngine<ClinicalCaseInput>[] = [
  nsclcEngine, sclcEngine, stomachEngine, rectumEngine, prostateEngine, bladderEngine, breastEngine,
  glialTumorEngine, brainMetastasesEngine, nasopharynxEngine, cervixEngine, palliativeRadiotherapyEngine,
  colonEngine, analEngine, gistEngine, liverCancerEngine, kidneyEngine, testisEngine, penileEngine,
  meningiomaEngine, ependymomaEngine, primaryCNSLymphomaEngine, leptomeningealMetastasesEngine,
  metastaticSpinalTumorEngine, primarySpinalCordTumorEngine, oropharynxEngine, hypopharynxEngine,
  oralCavityEngine, salivaryGlandEngine, maxillarySinusEngine, thyroidEngine, endometrialEngine,
  ovaryEngine, uterusEngine, vaginalEngine, vulvarEngine, medulloblastomaEngine, ewingSarcomaEngine,
  acuteLymphoblasticLeukemiaEngine, wilmsTumorEngine, osteosarcomaEngine, chondrosarcomaEngine,
  giantCellTumorEngine, melanomaEngine, bccEngine, skinSccEngine, cutaneousLymphomaEngine, kaposiSarcomaEngine,
  multipleMyelomaEngine, acuteMyeloidLeukemiaEngine, chronicMyeloidLeukemiaEngine,
];

const ENGINE_DISPLAY_LABELS: Record<string, string> = {
  'thorax.nsclc': 'Küçük Hücreli Dışı Akciğer Karsinomu',
  'thorax.sclc': 'Küçük Hücreli Akciğer Karsinomu',
  'gis.stomach': 'Mide',
  'gis.rectum': 'Rektum',
  'gis.colon': 'Kolon',
  'gis.anal': 'Anal Kanal',
  'gis.gist': 'GİS Stromal Tümör',
  'gis.liver': 'Karaciğer',
  'gus.prostate': 'Prostat',
  'gus.bladder': 'Mesane',
  'gus.kidney': 'Böbrek',
  'gus.testis': 'Testis',
  'gus.penile': 'Penis',
  'breast.primary': 'Meme',
  'cns.brain-metastases': 'Beyin Metastazı',
  'cns.glioma': 'Glioma',
  'cns.meningioma': 'Meningiom',
  'head-neck.nasopharynx': 'Nazofarenks',
  'head-neck.oropharynx': 'Orofarenks',
  'head-neck.hypopharynx': 'Hipofarenks',
  'head-neck.oral-cavity': 'Ağız Kavitesi',
  'head-neck.salivary-gland': 'Tükrük Bezi',
  'head-neck.maxillary-sinus': 'Maksiller Sinüs',
  'head-neck.thyroid': 'Tiroid',
  'gynecology.cervix': 'Serviks',
  'gynecology.endometrial': 'Endometriyum',
  'gynecology.ovary': 'Over',
  'gynecology.uterus': 'Uterus',
  'gynecology.vaginal': 'Vajinal',
  'gynecology.vulvar': 'Vulvar',
  'bone.osteosarcoma': 'Osteosarkom',
  'bone.chondrosarcoma': 'Kondrosarkom',
  'bone.giant-cell-tumor': 'Dev Hücreli Tümör',
  'pediatric-age.ewing-sarcoma': 'Ewing Sarkomu',
  'pediatric-age.medulloblastoma': 'Medulloblastom',
  'pediatric-age.wilms': 'Wilms Tümörü',
  'skin.melanoma': 'Melanom',
  'skin.bcc': 'Bazal Hücreli Karsinom',
  'skin.scc': 'Yassı Hücreli Karsinom',
  'hematologic.multiple-myeloma': 'Multipl Miyelom',
  'hematologic.acute-myeloid-leukemia': 'AML',
  'hematologic.chronic-myeloid-leukemia': 'KML',
};

function normalizeLookupToken(value: string | undefined | null): string {
  return (value ?? '').trim().replace(/\./g, '-').toLowerCase();
}

function deriveOrganSystem(engineId: string): OrganSystem {
  const [organSlug] = engineId.split('.');
  return (organSlug || 'palliative') as OrganSystem;
}

function deriveDisease(engineId: string): string {
  const [, ...rest] = engineId.split('.');
  return rest.join('.') || engineId;
}

export function resolveEngine(organSystem?: string, tumorSubtype?: string): RegisteredEngine | undefined {
  const organToken = normalizeLookupToken(organSystem);
  const subtypeToken = normalizeLookupToken(tumorSubtype);

  if (!organToken && !subtypeToken) {
    return ENGINE_REGISTRY[0];
  }

  return ENGINE_REGISTRY.find((engine) => {
    const normalizedId = normalizeLookupToken(engine.id);
    const [organPart, ...diseaseParts] = engine.id.split('.');
    const organPartToken = normalizeLookupToken(organPart);
    const diseaseToken = normalizeLookupToken(diseaseParts.join('.'));

    const organMatches = organToken ? organPartToken === organToken : true;
    const subtypeMatches = subtypeToken ? diseaseToken.includes(subtypeToken) || normalizedId.includes(subtypeToken) : true;

    return organMatches && subtypeMatches;
  });
}

export const REGIMEN_CATALOG: Record<string, RegimenOption[]> = {
  'gus.prostate': [
    {
      id: 'prostate-sib',
      label: '70 Gy / 28 fx · SIB Prostat + Pelvis',
      description: 'PTV_Prostat 70 Gy | PTV_Seminal 61.6 Gy | PTV_Pelvis 50.4 Gy',
      totalDoseGy: 70,
      fractions: 28,
      dosePerFractionGy: 2.5,
      bedGy: 186.6,
      eqd2Gy: 80,
      alphaBeta: 1.5,
      technique: 'SIB / IMRT',
      targetSummary: 'Prostat + seminal vezikül + pelvis nodal alanı',
      priority: 'primary',
    },
    {
      id: 'prostate-chhip',
      label: '60 Gy / 20 fx · CHHiP',
      description: 'Ilımlı hipofraksiyonasyon / PROFIT uyumlu',
      totalDoseGy: 60,
      fractions: 20,
      dosePerFractionGy: 3,
      bedGy: 180,
      eqd2Gy: 77.1,
      alphaBeta: 1.5,
      technique: 'IMRT / VMAT',
      targetSummary: 'Prostat ± seminal vezikül',
      priority: 'secondary',
    },
    {
      id: 'prostate-paceb',
      label: '36.25 Gy / 5 fx · PACE-B SBRT',
      description: 'Ultra-hipofraksiyonasyon / SBRT',
      totalDoseGy: 36.25,
      fractions: 5,
      dosePerFractionGy: 7.25,
      bedGy: 211,
      eqd2Gy: 90.6,
      alphaBeta: 1.5,
      technique: 'SBRT / IGRT',
      targetSummary: 'Sadece prostat / seçilmiş olgular',
      priority: 'secondary',
    },
    {
      id: 'prostate-conventional',
      label: '78 Gy / 39 fx · Konvansiyonel',
      description: 'Standart eskalasyon protokolü',
      totalDoseGy: 78,
      fractions: 39,
      dosePerFractionGy: 2,
      bedGy: 182,
      eqd2Gy: 78,
      alphaBeta: 1.5,
      technique: '3D-CRT / IMRT',
      targetSummary: 'Prostat ± sempo. yakın alan',
      priority: 'backup',
    },
  ],
  'breast.primary': [
    {
      id: 'breast-fast-forward',
      label: '26 Gy / 5 fx · FAST-Forward',
      description: 'Ultrahipofraksiyon / 1 haftalık tüm memede',
      totalDoseGy: 26,
      fractions: 5,
      dosePerFractionGy: 5.2,
      bedGy: 59.8,
      eqd2Gy: 44.8,
      alphaBeta: 4,
      technique: '3D-CRT / VMAT',
      targetSummary: 'Tüm meme alanı',
      priority: 'primary',
    },
    {
      id: 'breast-start-b',
      label: '40.05 Gy / 15 fx · START-B',
      description: 'Standart hipofraksiyonasyon',
      totalDoseGy: 40.05,
      fractions: 15,
      dosePerFractionGy: 2.67,
      bedGy: 66.7,
      eqd2Gy: 46.7,
      alphaBeta: 4,
      technique: 'VMAT / IMRT',
      targetSummary: 'Meme + eşlik eden boost değerlendirmesi',
      priority: 'secondary',
    },
    {
      id: 'breast-pmrt',
      label: '50 Gy / 25 fx · Konvansiyonel + PMRT/RNI',
      description: 'Göğüs duvarı + sklaviküler + IMC',
      totalDoseGy: 50,
      fractions: 25,
      dosePerFractionGy: 2,
      bedGy: 62.5,
      eqd2Gy: 44,
      alphaBeta: 4,
      technique: '3D/IMRT',
      targetSummary: 'PMRT / RNI',
      priority: 'backup',
    },
  ],
  'thorax.nsclc': [
    {
      id: 'thorax-sbrt-peripheral',
      label: '54 Gy / 3 fx · SBRT Periferik',
      description: 'RTOG 0236/0915 uyumlu periferik olgu',
      totalDoseGy: 54,
      fractions: 3,
      dosePerFractionGy: 18,
      bedGy: 151.2,
      eqd2Gy: 79,
      alphaBeta: 10,
      technique: 'SBRT / IGRT',
      targetSummary: 'Primer tümör / periferik lezyon',
      priority: 'primary',
    },
    {
      id: 'thorax-sbrt-central',
      label: '50 Gy / 5 fx · SBRT Santral / No-Fly Zone',
      description: 'Santral tümörlerde güvenlik öncelikli',
      totalDoseGy: 50,
      fractions: 5,
      dosePerFractionGy: 10,
      bedGy: 100,
      eqd2Gy: 62,
      alphaBeta: 10,
      technique: 'SBRT / 4D-CT',
      targetSummary: 'Santral lezyon / OAR yakınlığı',
      priority: 'secondary',
    },
    {
      id: 'thorax-60-30',
      label: '60 Gy / 30 fx · Eşzamanlı KRT + Durvalumab',
      description: 'PACIFIC uyumlu definitif yaklaşım',
      totalDoseGy: 60,
      fractions: 30,
      dosePerFractionGy: 2,
      bedGy: 72,
      eqd2Gy: 60,
      alphaBeta: 10,
      technique: 'IMRT / VMAT',
      targetSummary: 'Definitif torasik alan',
      priority: 'secondary',
    },
    {
      id: 'thorax-66-33',
      label: '66 Gy / 33 fx · Yüksek Doz KRT',
      description: 'Lokal ileri, yüksek doz hedefleme',
      totalDoseGy: 66,
      fractions: 33,
      dosePerFractionGy: 2,
      bedGy: 80.5,
      eqd2Gy: 66,
      alphaBeta: 10,
      technique: 'IMRT / VMAT',
      targetSummary: 'Primer + nodal alan',
      priority: 'backup',
    },
  ],
  'thorax.sclc': [
    {
      id: 'sclc-hyperfractionated',
      label: '45 Gy / 30 fx · Hiperfraksiyone BID',
      description: 'Turrisi standart yaklaşım',
      totalDoseGy: 45,
      fractions: 30,
      dosePerFractionGy: 1.5,
      bedGy: 58.5,
      eqd2Gy: 52,
      alphaBeta: 10,
      technique: 'IMRT / 3D-CRT',
      targetSummary: 'Sınırlı evre hastalık',
      priority: 'primary',
    },
    {
      id: 'sclc-conventional',
      label: '60-66 Gy / 30-33 fx · Konvansiyonel KRT',
      description: 'Günlük eşzamanlı kemoradyoterapi',
      totalDoseGy: 64,
      fractions: 32,
      dosePerFractionGy: 2,
      bedGy: 76.8,
      eqd2Gy: 64,
      alphaBeta: 10,
      technique: 'IMRT / VMAT',
      targetSummary: 'Sınırlı / yaygın evre',
      priority: 'secondary',
    },
    {
      id: 'sclc-pci',
      label: '25 Gy / 10 fx · PCI',
      description: 'Profilaktik kraniyal ışınlama',
      totalDoseGy: 25,
      fractions: 10,
      dosePerFractionGy: 2.5,
      bedGy: 31.25,
      eqd2Gy: 27,
      alphaBeta: 10,
      technique: 'WBRT / PCI',
      targetSummary: 'Kraniyal profilaksi',
      priority: 'backup',
    },
  ],
  'cns.glioma': [
    {
      id: 'gbm-stupp',
      label: '60 Gy / 30 fx · Stupp',
      description: 'Standart Stupp protokolü',
      totalDoseGy: 60,
      fractions: 30,
      dosePerFractionGy: 2,
      bedGy: 72,
      eqd2Gy: 60,
      alphaBeta: 10,
      technique: 'IMRT / VMAT',
      targetSummary: 'Primer beyin + postoperatif alan',
      priority: 'primary',
    },
    {
      id: 'gbm-elderly',
      label: '40 Gy / 15 fx · Yaşlı / Kırılgan',
      description: 'Hipofraksiyonasyon',
      totalDoseGy: 40,
      fractions: 15,
      dosePerFractionGy: 2.67,
      bedGy: 52,
      eqd2Gy: 40,
      alphaBeta: 10,
      technique: 'IMRT',
      targetSummary: 'Postoperatif beyin',
      priority: 'secondary',
    },
    {
      id: 'gbm-short-hypofx',
      label: '34 Gy / 10 fx · Kısa Hipofraksiyonasyon',
      description: 'Kısa protokol',
      totalDoseGy: 34,
      fractions: 10,
      dosePerFractionGy: 3.4,
      bedGy: 48,
      eqd2Gy: 36,
      alphaBeta: 10,
      technique: 'IMRT',
      targetSummary: 'Kısa süreli RT',
      priority: 'backup',
    },
  ],
  'cns.brain-metastases': [
    {
      id: 'brain-srs-24gy',
      label: '24 Gy / 1 fx · Tek Fraksiyon SRS',
      description: '≤2 cm lezyon',
      totalDoseGy: 24,
      fractions: 1,
      dosePerFractionGy: 24,
      bedGy: 120,
      eqd2Gy: 70,
      alphaBeta: 10,
      technique: 'SRS',
      targetSummary: '≤2 cm metastaz',
      priority: 'primary',
    },
    {
      id: 'brain-srt-30-5',
      label: '30 Gy / 5 fx · Fraksiyone SRT',
      description: '6 Gy/fx',
      totalDoseGy: 30,
      fractions: 5,
      dosePerFractionGy: 6,
      bedGy: 66,
      eqd2Gy: 44,
      alphaBeta: 10,
      technique: 'SRT / IGRT',
      targetSummary: '3-5 fraksiyon',
      priority: 'secondary',
    },
    {
      id: 'brain-wb-30-10',
      label: '30 Gy / 10 fx · HA-WBRT',
      description: 'Hipokampal korumalı + memantin',
      totalDoseGy: 30,
      fractions: 10,
      dosePerFractionGy: 3,
      bedGy: 45,
      eqd2Gy: 30,
      alphaBeta: 10,
      technique: 'WBRT',
      targetSummary: 'Multifokal hastalık / meme basal',
      priority: 'backup',
    },
  ],
  'head-neck.nasopharynx': [
    {
      id: 'hn-sib-70-60-54',
      label: '70/60/54 Gy · 3 Kademeli SIB',
      description: 'PTV_High 70 Gy | PTV_Mid 60 Gy | PTV_Low 54 Gy',
      totalDoseGy: 70,
      fractions: 33,
      dosePerFractionGy: 2.12,
      bedGy: 170,
      eqd2Gy: 70,
      alphaBeta: 10,
      technique: 'SIB / IMRT',
      targetSummary: 'High/Mid/Low nodal level',
      priority: 'primary',
    },
    {
      id: 'hn-sib-70-56',
      label: '70/56 Gy · 2 Kademeli SIB',
      description: 'İki-seviyeli yüksek risk yaklaşım',
      totalDoseGy: 70,
      fractions: 35,
      dosePerFractionGy: 2,
      bedGy: 165,
      eqd2Gy: 70,
      alphaBeta: 10,
      technique: 'IMRT / VMAT',
      targetSummary: 'İki kademeli hedef alanı',
      priority: 'secondary',
    },
  ],
  'palliative.palliative-radiotherapy': [
    {
      id: 'palliative-8-1',
      label: '8 Gy / 1 fx · Tek Fraksiyon Palyatif',
      description: 'Hızlı ağrı / kemik palyasyonu',
      totalDoseGy: 8,
      fractions: 1,
      dosePerFractionGy: 8,
      bedGy: 24,
      eqd2Gy: 10,
      alphaBeta: 10,
      technique: 'Tek alan / EBRT',
      targetSummary: 'Hızlı semptom kontrolü',
      priority: 'primary',
    },
    {
      id: 'palliative-20-5',
      label: '20 Gy / 5 fx · Standart Palyatif',
      description: '4 Gy/fx',
      totalDoseGy: 20,
      fractions: 5,
      dosePerFractionGy: 4,
      bedGy: 42,
      eqd2Gy: 24,
      alphaBeta: 10,
      technique: 'EBRT',
      targetSummary: 'Semptomatik lezyon',
      priority: 'secondary',
    },
  ],
};

export function getRegimenCatalogForEngine(engineId: string): RegimenOption[] {
  return REGIMEN_CATALOG[engineId] ?? [];
}

const GENERIC_FORM_SCHEMA: CDSSFormField[] = [
  {
    key: 'diagnosis',
    label: 'Tanı / Klinik Not',
    description: 'Serbest metin klinik özet (opsiyonel).',
    type: 'textarea',
  },
];

function toRegisteredEngine(engine: DecisionEngine<ClinicalCaseInput>): RegisteredEngine {
  const organSystem = deriveOrganSystem(engine.id);
  const disease = deriveDisease(engine.id);

  return Object.assign(engine, {
    formSchema: GENERIC_FORM_SCHEMA,
    defaults: {
      organSystem,
      disease,
      diagnosis: '',
    },
  });
}

export const ENGINE_REGISTRY: RegisteredEngine[] = RAW_ENGINES.map(toRegisteredEngine);

function normalizeEngineId(id: string): string {
  return id.trim().replace(/\./g, '-').toLowerCase();
}

export const registry = {
  get(id: string): RegisteredEngine | undefined {
    const normId = normalizeEngineId(id);
    return ENGINE_REGISTRY.find((engine) => normalizeEngineId(engine.id) === normId);
  },
};

export function getEngineDisplayName(engineId: string): string {
  const normalizedLookup = normalizeLookupToken(engineId);
  const direct = Object.keys(ENGINE_DISPLAY_LABELS).find((key) => normalizeLookupToken(key) === normalizedLookup);
  if (direct) return ENGINE_DISPLAY_LABELS[direct];

  const disease = deriveDisease(engineId)
    .replace(/-/g, ' ')
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase());

  const organ = deriveOrganSystem(engineId)
    .replace(/-/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase());

  return `${organ} · ${disease}`;
}

export function getEnginesByOrgan(organ: OrganSystem): RegisteredEngine[] {
  const normalizedOrgan = (organ ?? '').toString().trim().toLowerCase();
  return ENGINE_REGISTRY.filter((engine) => normalizeLookupToken(deriveOrganSystem(engine.id)) === normalizeLookupToken(normalizedOrgan));
}

export function getEngineById(engineId: string): RegisteredEngine | undefined {
  return engineId ? registry.get(engineId) : undefined;
}

export function resolveEngineId(engineId: string): RegisteredEngine | undefined {
  return engineId ? registry.get(engineId) : undefined;
}

export function resolve(organSystem?: string, tumorSubtype?: string): RegisteredEngine | undefined {
  const organToken = normalizeLookupToken(organSystem);
  const subtypeToken = normalizeLookupToken(tumorSubtype);

  if (!organToken && !subtypeToken) {
    return ENGINE_REGISTRY[0] ?? undefined;
  }

  return ENGINE_REGISTRY.find((engine) => {
    const normalizedId = normalizeLookupToken(engine.id);
    const [organPart = '', ...rest] = engine.id.split('.');
    const organPartToken = normalizeLookupToken(organPart);
    const diseaseToken = normalizeLookupToken(rest.join('.'));
    const organMatches = !organToken || organPartToken === organToken;
    const subtypeMatches = !subtypeToken || diseaseToken.includes(subtypeToken) || normalizedId.includes(subtypeToken);
    return organMatches && subtypeMatches;
  });
}
