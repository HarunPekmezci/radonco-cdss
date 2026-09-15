import type { CDSSResult, ClinicalCaseInput, JsonSchema, OrganSystem } from '../types/cdss';
import * as Bone from './bone';
import * as CNS from './cns';
import * as GIS from './gis';
import * as GUS from './gus';
import * as Gynecology from './gynecology';
import * as HeadNeck from './head-neck';
import * as Hematologic from './hematologic';
import * as Palliative from './palliative';
import * as Pediatric from './pediatric-age';
import * as Skin from './skin';
import * as Thorax from './thorax';
import * as Breast from './breast';

export type CDSSFieldType = 'text' | 'number' | 'boolean' | 'select';
export interface CDSSFormField {
  key: string;
  label: string;
  type: CDSSFieldType;
  options?: Array<{ label: string; value: string }>;
  description?: string;
}
export interface CDSSPreset {
  id: string;
  label: string;
  description: string;
  input: Record<string, unknown>;
}
export interface RegisteredEngine {
  id: string;
  name: string;
  organSystem: OrganSystem;
  navigationGroup: OrganSystem;
  disease: string;
  version: string;
  inputSchema: JsonSchema;
  formSchema: CDSSFormField[];
  presets: CDSSPreset[];
  defaults: Record<string, unknown>;
  evaluate: (input: Record<string, unknown>) => CDSSResult;
}

type Engine = {
  id: string;
  version: string;
  inputSchema: JsonSchema;
  evaluate: (input: unknown) => CDSSResult;
};
const asEngine = (engine: unknown): Engine => engine as Engine;

const schema = (engine: Engine): JsonSchema => engine.inputSchema;
const adapter = (engine: Engine, organSystem: OrganSystem, disease: string) => ({
  evaluate: (input: Record<string, unknown>) => {
    const normalized = { organSystem, disease, ...input } as Record<string, unknown>;
    if (engine.id === 'gus.prostate') {
      normalized.setting = normalized.setting ?? 'newly-diagnosed-localized';
      normalized.psaNgMl = normalized.psaNgMl ?? normalized.psa;
      normalized.gleasonPrimary = normalized.gleasonPrimary ?? normalized.primaryPattern;
      normalized.gleasonSecondary = normalized.gleasonSecondary ?? normalized.secondaryPattern;
      normalized.gradeGroup = undefined;
      normalized.riskGroup = undefined;
      normalized.nodalStatus = normalized.nodalStatus ?? 'N0';
      normalized.stage = { edition: 'AJCC_8', t: String(normalized.clinicalT ?? 'T1c'), n: String(normalized.nodalStatus), m: String(normalized.metastaticStatus ?? 'M0') };
    }
    return (engine.evaluate as (input: ClinicalCaseInput) => CDSSResult)(normalized as unknown as ClinicalCaseInput);
  },
  engine,
});
const TERMS: Record<string, string> = {
  setting: 'Tedavi bağlamı', 'clinical setting': 'Tedavi bağlamı', localized: 'Lokalize', postoperative: 'Postoperatif', 'newly-diagnosed': 'Yeni tanı',
  'locally-advanced': 'Lokal ileri', metastatic: 'Metastatik', recurrent: 'Nüks', relapsed: 'Relaps',
  'biochemical-recurrence': 'Biyokimyasal nüks', definitive: 'Definitif', palliative: 'Palyatif', curative: 'Küratif',
  'medically-inoperable-early': 'Medikal inoperabl (erken evre)', 'operable-early': 'Operabl (erken evre)',
  resectable: 'Rezekabl', borderline: 'Sınırda rezekabl', unresectable: 'Rezeke edilemez',
  'non-keratinizing': 'Non-keratinize (diferansiye/indiferansiye)',
  'newly-diagnosed-localized': 'Yeni tanı lokalize',
  adequate: 'Yeterli fonksiyon', impaired: 'Yetersiz fonksiyon', squamous: 'Yassı hücreli karsinom (skuamöz)', adenocarcinoma: 'Adenokarsinom (intestinal)',
  'gastroesophageal-junction': 'Kardia / GEJ (Siewert I-III)', unknown: 'Bilinmiyor', none: 'Yok',
  other: 'Diğer', 'not-done': 'Yapılmadı / değerlendirilmedi', indeterminate: 'Şüpheli / belirsiz',
  pain: 'Ağrı', 'limited-stage': 'Sınırlı evre', 'extensive-stage': 'Yaygın evre', neoadjuvant: 'Neoadjuvan',
  'dMMR': 'MMR yetersizliği', proficient: 'Yeterli MMR', complete: 'Tam yanıt', partial: 'Kısmi yanıt',
  keratinizing: 'Keratinize', methylated: 'Metile', unmethylated: 'Metile değil', 'not-assessed': 'Değerlendirilmedi',
  biopsy: 'Biyopsi', 'maximal-safe-resection': 'Maksimal güvenli rezeksiyon',
  'stage-iva': 'Evre IVA',
  low: 'Düşük', high: 'Yüksek', 'very-high': 'Çok yüksek', standard: 'Standart', intermediate: 'Orta',
  'favorable-intermediate': 'Orta risk - uygun', 'unfavorable-intermediate': 'Orta risk - uygunsuz',
  'not-applicable': 'Uygulanamaz', 'no-actionable-alteration': 'Eyleme geçirilebilir değişiklik yok',
  peripheral: 'Periferik', central: 'Santral', 'ultra-central': 'Ultra-santral', negative: 'Negatif', positive: 'Pozitif',
  'D1': 'D1', 'D1+': 'D1+', 'D2': 'D2', 'R0': 'R0 - negatif', 'R1': 'R1 - mikroskopik pozitif', 'R2': 'R2 - makroskopik pozitif',
  'new-symptom': 'Yeni semptom', 'urgent-emergency': 'Acil durum', progression: 'Progresyon', bone: 'Kemik', spine: 'Omurga',
  bleeding: 'Kanama', good: 'İyi', poor: 'Kötü', 'stage-ii': 'Evre II', 'stage-iii': 'Evre III',
  premenopausal: 'Premenopozal', postmenopausal: 'Postmenopozal', lumpectomy: 'Meme koruyucu cerrahi (lumpektomi)', mastectomy: 'Mastektomi',
  close: 'Sınırda (<2 mm)', 'pT1a-c': 'pT1a-c', pT2: 'pT2', pT3: 'pT3', 'pT4a-d': 'pT4a-d',
  'adenocarcinoma-intestinal': 'Adenokarsinom (intestinal)', 'adenocarcinoma-diffuse': 'Adenokarsinom (diffüz / taşlı yüzük)',
  gist: 'GİST', neuroendocrine: 'Nöroendokrin', 'cardia-gej': 'Kardia / GEJ (Siewert I-III)',
  'corpus-fundus': 'Korpus / fundus', 'antrum-pylorus': 'Antrum / pilor',
  'WHO-1': 'Derece 1 (benign)', 'WHO-2': 'Derece 2 (atipik)', 'WHO-3': 'Derece 3 (anaplastik)',
  'gross-total-resection': 'Simpson I-III (total rezeksiyon)', 'subtotal-resection': 'Simpson IV-V (subtotal rezeksiyon)',
  'deficit-or-raised-icp': 'Semptomatik / KİBAS / nöbet', 'brain-invasion': 'Beyin invazyonu',
  pN0: 'pN0', pN1a: 'pN1a (1-3 LN)', pN2a: 'pN2a (4-9 LN)', pN3a: 'pN3a (≥10 LN)',
  oligometastatic: 'Oligometastatik (2-4)', multiple: 'Çoklu (5-10)', diffuse: 'Yaygın (>10)',
  'less-than-5-mm': '<5 mm', 'at-least-5-mm': '≥5 mm', asymptomatic: 'Asemptomatik',
};
const field = (key: string, label: string, type: CDSSFieldType, options?: string[], description?: string): CDSSFormField => ({
  key, label: TERMS[label] ?? label, type, description, options: options?.map((value) => ({ value, label: TERMS[value] ?? value })),
});
const presets = (items: Array<[string, string, Record<string, unknown>]>): CDSSPreset[] =>
  items.map(([id, label, input]) => ({ id, label, description: label, input }));

const common = [
  field('stageGroup', 'Evre grubu', 'text', undefined, 'TNM/FIGO/AJCC evre grubu'),
  field('surgicalMargin', 'Cerrahi marjin', 'select', ['R0', 'R1', 'R2', 'not-applicable']),
  field('performanceStatusECOG', 'ECOG', 'number'),
];

const register = (
  id: string,
  name: string,
  organSystem: OrganSystem,
  disease: string,
  engine: unknown,
  defaults: Record<string, unknown>,
  formSchema: CDSSFormField[],
  casePresets: CDSSPreset[],
  navigationGroup: OrganSystem = organSystem,
): RegisteredEngine => {
  const normalized = asEngine(engine);
  const bound = adapter(normalized, organSystem, disease);
  const uniqueFields = [...new Map(formSchema.map((item) => [item.key, item])).values()];
  return { id, name, organSystem, navigationGroup, disease, version: normalized.version, inputSchema: schema(normalized), formSchema: uniqueFields, presets: casePresets, defaults, evaluate: bound.evaluate };
};

const nsclc = register(
  'thorax.nsclc', 'KHDAK', 'thorax', 'non-small-cell-lung-cancer', Thorax.nsclcEngine,
  { setting: 'medically-inoperable-early', centrality: 'peripheral', stageGroup: 'I', tumorSizeCm: 2.5, resectability: 'unknown' },
  [field('setting', 'Tedavi bağlamı', 'select', ['operable-early', 'medically-inoperable-early', 'locally-advanced', 'metastatic']), field('centrality', 'Santralite', 'select', ['peripheral', 'central', 'ultra-central']), field('tumorSizeCm', 'Tümör çapı (cm)', 'number'), field('mediastinalStaging', 'Mediasten evrelemesi', 'select', ['not-done', 'negative', 'positive', 'indeterminate']), field('resectability', 'Rezektabilite', 'select', ['resectable', 'borderline', 'unresectable', 'unknown']), field('surgicalMargin', 'PORT marjini', 'select', ['R0', 'R1', 'R2', 'not-applicable']), field('actionableAlteration', 'Sürücü mutasyon', 'select', ['no-actionable-alteration', 'EGFR', 'ALK', 'ROS1', 'KRAS_G12C', 'unknown']), ...common],
  presets([
    ['peripheral-sbrt', 'Erken evre periferik SBRT — 54 Gy / 3 fx', { setting: 'medically-inoperable-early', centrality: 'peripheral', stageGroup: 'I', tumorSizeCm: 2.5 }],
    ['central-sbrt', 'Santral SBRT — 50 Gy / 5 fx', { setting: 'medically-inoperable-early', centrality: 'central', stageGroup: 'I', tumorSizeCm: 2.8 }],
    ['ultracentral', 'Ultra-santral — 60 Gy / 12-15 fx', { setting: 'medically-inoperable-early', centrality: 'ultra-central', stageGroup: 'I', tumorSizeCm: 3 }],
    ['pacific', 'Evre III eşzamanlı KRT + PACIFIC', { setting: 'locally-advanced', stageGroup: 'III', mediastinalStaging: 'positive', resectability: 'unresectable' }],
  ]),
);

const sclc = register(
  'thorax.sclc', 'KHAK', 'thorax', 'small-cell-lung-cancer', Thorax.sclcEngine,
  { setting: 'limited-stage', stageGroup: 'limited' },
  [field('setting', 'Hastalık evresi', 'select', ['limited-stage', 'extensive-stage', 'relapsed']), field('stageGroup', 'Hastalık yaygınlığı', 'select', ['limited', 'extensive']), field('performanceStatusECOG', 'ECOG', 'number'), field('brainMRI', 'Beyin MR değerlendirmesi', 'select', ['negative', 'positive', 'unknown']), ...common],
  presets([
    ['limited-bid', 'Sınırlı evre — 45 Gy / 30 fx BID', { setting: 'limited-stage', stageGroup: 'limited' }],
    ['limited-conventional', 'Sınırlı evre — 60-66 Gy konvansiyonel', { setting: 'limited-stage', stageGroup: 'limited', brainMRI: 'negative' }],
    ['pci', 'Yanıt sonrası PCI — 25 Gy / 10 fx', { setting: 'limited-stage', stageGroup: 'limited', response: 'complete' }],
    ['extensive', 'Yaygın evre / sistemik tedavi', { setting: 'extensive-stage', stageGroup: 'extensive' }],
  ]),
);

const gastric = register(
  'gis.gastric', 'Mide', 'gis', 'gastric-cancer', GIS.stomachEngine,
  { setting: 'postoperative', stageGroup: 'III', lymphadenectomy: 'D1', surgicalMargin: 'R0', histology: 'adenocarcinoma-intestinal', site: 'cardia-gej' },
  [field('setting', 'Tedavi bağlamı', 'select', ['newly-diagnosed', 'locally-advanced', 'postoperative', 'recurrent', 'metastatic']), field('site', 'Anatomik yerleşim', 'select', ['cardia-gej', 'corpus-fundus', 'antrum-pylorus']), field('lymphadenectomy', 'Lenfadenektomi', 'select', ['D1', 'D1+', 'D2', 'unknown']), field('surgicalMargin', 'Marjin', 'select', ['R0', 'R1', 'R2', 'RX']), field('stageGroup', 'Evre', 'text'), field('histology', 'Histoloji', 'select', ['adenocarcinoma-intestinal', 'adenocarcinoma-diffuse', 'gist', 'neuroendocrine']), field('nodalStatus', 'Nodal durum', 'select', ['N0', 'N1', 'N2', 'N3', 'unknown']), ...common],
  presets([
    ['d1-r0', 'Postop D1 R0 evre III — INT-0116 KRT', { setting: 'postoperative', stageGroup: 'III', lymphadenectomy: 'D1', surgicalMargin: 'R0' }],
    ['d2-r0', 'Postop D2 R0 — adjuvan KT / ARTIST-2', { setting: 'postoperative', stageGroup: 'II', lymphadenectomy: 'D2', surgicalMargin: 'R0' }],
    ['r1', 'R1 pozitif marjin — postop KRT', { setting: 'postoperative', stageGroup: 'III', lymphadenectomy: 'D2', surgicalMargin: 'R1' }],
    ['r2', 'R2 rezidü — salvage/palyatif KRT', { setting: 'postoperative', stageGroup: 'IV', lymphadenectomy: 'D1', surgicalMargin: 'R2' }],
  ]),
);

const rectum = register(
  'gis.rectum', 'Rektum', 'gis', 'rectal-cancer', GIS.rectumEngine,
  { setting: 'locally-advanced', stageGroup: 'III', riskGroup: 'high-risk', mmrStatus: 'proficient', response: 'not-assessed' },
  [field('setting', 'Tedavi bağlamı', 'select', ['newly-diagnosed', 'locally-advanced', 'postoperative', 'recurrent', 'metastatic']), field('stageGroup', 'Evre', 'text'), field('riskGroup', 'Risk', 'select', ['early', 'intermediate', 'high-risk']), field('crmThreatened', 'CRM tehditli', 'boolean'), field('emvi', 'EMVI pozitif', 'boolean'), field('mmrStatus', 'MMR', 'select', ['proficient', 'dMMR', 'unknown']), field('response', 'Yanıt', 'select', ['complete', 'partial', 'not-assessed']), ...common],
  presets([
    ['tnt-rapido', 'Lokal ileri TNT — RAPIDO', { setting: 'locally-advanced', stageGroup: 'III', riskGroup: 'high-risk', crmThreatened: true, emvi: true }],
    ['tnt-opra', 'Lokal ileri TNT — OPRA / organ koruma', { setting: 'locally-advanced', stageGroup: 'II', riskGroup: 'intermediate', response: 'not-assessed' }],
    ['long-course', 'Uzun dönem KRT — 50.4 Gy + kapesitabin', { setting: 'locally-advanced', stageGroup: 'II', riskGroup: 'intermediate' }],
    ['short-course', 'Kısa dönem RT — 5 x 5 Gy', { setting: 'locally-advanced', stageGroup: 'III', riskGroup: 'high-risk' }],
  ]),
);

const prostate = register(
  'gus.prostate', 'Prostat', 'gus', 'prostate-cancer', GUS.prostateEngine,
  { setting: 'newly-diagnosed-localized', psaNgMl: 6, gleasonPrimary: 3, gleasonSecondary: 3, clinicalT: 'T1c', nodalStatus: 'N0', metastaticStatus: 'M0', positiveCoresPercent: 20 },
  [field('gleasonPrimary', 'Primer Gleason paterni', 'number'), field('gleasonSecondary', 'Sekonder Gleason paterni', 'number'), field('psaNgMl', 'PSA düzeyi (ng/mL)', 'number'), field('seminalVesicleInvasion', 'Seminal vezikül tutulumu', 'boolean'), field('extracapsularExtension', 'Ekstrakapsüler uzanım', 'boolean'), field('clinicalT', 'Klinik T evresi', 'select', ['T1a', 'T1b', 'T1c', 'T2a', 'T2b', 'T2c', 'T3a', 'T3b', 'T4']), field('nodalStatus', 'Nodal durum', 'select', ['N0', 'N1']), field('metastaticStatus', 'Uzak metastaz', 'select', ['M0', 'M1']), field('positiveCoresPercent', 'Pozitif biyopsi kor oranı (%)', 'number'), field('lifeExpectancyYears', 'Yaşam beklentisi (yıl)', 'number')],
  presets([
    ['low-sbrt', 'Düşük risk — 36.25 Gy / 5 fx SBRT', { setting: 'newly-diagnosed-localized', psaNgMl: 6, gleasonPrimary: 3, gleasonSecondary: 3, clinicalT: 'T1c', nodalStatus: 'N0', metastaticStatus: 'M0' }],
    ['intermediate-adt', 'Orta risk — hipoFx + 4-6 ay ADT', { setting: 'newly-diagnosed-localized', psaNgMl: 12, gleasonPrimary: 3, gleasonSecondary: 4, clinicalT: 'T2b', nodalStatus: 'N0', metastaticStatus: 'M0' }],
    ['high-pelvis', 'Yüksek risk — pelvik RT + 18-36 ay ADT', { setting: 'newly-diagnosed-localized', psaNgMl: 35, gleasonPrimary: 4, gleasonSecondary: 5, clinicalT: 'T3b', nodalStatus: 'N0', metastaticStatus: 'M0' }],
    ['postop', 'Postop biyokimyasal nüks', { setting: 'biochemical-recurrence', psaNgMl: 0.3, clinicalT: 'T3a', nodalStatus: 'N0', metastaticStatus: 'M0', surgicalMargin: 'R1' }],
  ]),
);

const bladder = register(
  'gus.bladder', 'Mesane', 'gus', 'bladder-cancer', GUS.bladderEngine,
  { setting: 'localized', riskGroup: 'high', completeTURBT: true, nodalStatus: 'cN0' },
  [field('setting', 'Tedavi bağlamı', 'select', ['localized', 'postoperative', 'locally-advanced', 'metastatic']), field('completeTURBT', 'Tam TUR-MT', 'boolean'), field('riskGroup', 'Risk', 'select', ['low', 'intermediate', 'high']), field('nodalStatus', 'Nodal durum', 'select', ['cN0', 'cN1', 'cN2', 'unknown']), field('cis', 'CIS', 'boolean'), field('hydronephrosis', 'Hidronefroz', 'boolean'), ...common],
  presets([
    ['trimodality', 'Mesane koruma — TUR-MT + 64-66 Gy KRT', { setting: 'localized', riskGroup: 'high', completeTURBT: true, nodalStatus: 'cN0' }],
    ['cis', 'CIS / yüksek risk trimodalite', { setting: 'localized', riskGroup: 'high', completeTURBT: true, cis: true, nodalStatus: 'cN0' }],
    ['node-positive', 'Nodal pozitif — sistemik tedavi + RT', { setting: 'locally-advanced', riskGroup: 'high', nodalStatus: 'cN1', completeTURBT: true }],
  ]),
);

const breast = register(
  'breast.primary', 'Meme', 'breast', 'breast-cancer', Breast.breastEngine,
  { setting: 'postoperative', surgeryType: 'lumpectomy', menopause: 'postmenopausal', pathologicT: 'pT1a-c', pathologicN: 'pN0', marginStatus: 'negative', erPercent: 90, prPercent: 80, her2Status: 'negative', ki67Percent: 15 },
  [field('setting', 'Tedavi bağlamı', 'select', ['newly-diagnosed', 'postoperative', 'neoadjuvant', 'recurrent', 'metastatic']), field('menopause', 'Menopoz durumu', 'select', ['premenopausal', 'postmenopausal']), field('surgeryType', 'Cerrahi tipi', 'select', ['lumpectomy', 'mastectomy']), field('marginStatus', 'Rezeksiyon marjini', 'select', ['negative', 'close', 'positive']), field('pathologicT', 'Patolojik pT', 'select', ['pT1a-c', 'pT2', 'pT3', 'pT4a-d']), field('pathologicN', 'Patolojik pN', 'select', ['pN0', 'pN1a', 'pN2a', 'pN3a']), field('erPercent', 'ER (+)', 'number'), field('prPercent', 'PR (+)', 'number'), field('her2Status', 'HER2 (+)', 'select', ['positive', 'negative']), field('ki67Percent', 'Ki-67 > %20', 'number')],
  presets([
    ['mkc-wbi', 'MKC sonrası WBI — 40 Gy/15 fx', { setting: 'postoperative', surgeryType: 'lumpectomy', menopause: 'postmenopausal', pathologicT: 'pT1a-c', pathologicN: 'pN0', marginStatus: 'negative' }],
    ['mkc-fast', 'MKC sonrası FAST-Forward — 26 Gy/5 fx', { setting: 'postoperative', surgeryType: 'lumpectomy', menopause: 'premenopausal', pathologicT: 'pT1a-c', pathologicN: 'pN0', marginStatus: 'negative' }],
    ['pmrt', 'Mastektomi sonrası PMRT + RNI', { setting: 'postoperative', surgeryType: 'mastectomy', pathologicT: 'pT3', pathologicN: 'pN2a', marginStatus: 'negative' }],
    ['positive-margin', 'Pozitif marjin — boost ve RNI değerlendirmesi', { setting: 'postoperative', surgeryType: 'lumpectomy', pathologicT: 'pT2', pathologicN: 'pN1a', marginStatus: 'positive', erPercent: 0, her2Status: 'negative' }],
  ]),
);

const gbm = register(
  'cns.glioblastoma', 'Glioblastom', 'cns', 'glial-tumor', CNS.glialTumorEngine,
  { setting: 'postoperative', grade: 4, ageYears: 55, methylation: 'unmethylated', surgery: 'maximal-safe-resection' },
  [field('setting', 'Tedavi bağlamı', 'select', ['newly-diagnosed', 'postoperative', 'recurrent']), field('grade', 'WHO derece', 'number'), field('ageYears', 'Yaş', 'number'), field('methylation', 'MGMT metilasyonu', 'select', ['methylated', 'unmethylated', 'unknown']), field('surgery', 'Cerrahi', 'select', ['biopsy', 'subtotal-resection', 'maximal-safe-resection']), ...common],
  presets([
    ['stupp', 'Standart Stupp — 60 Gy / 30 fx + TMZ', { setting: 'postoperative', grade: 4, ageYears: 55, methylation: 'methylated', surgery: 'maximal-safe-resection' }],
    ['elderly-40', 'Yaşlı/kırılgan — 40 Gy / 15 fx + TMZ', { setting: 'postoperative', grade: 4, ageYears: 72, methylation: 'methylated', surgery: 'subtotal-resection' }],
    ['elderly-34', 'Çok kırılgan — 34 Gy / 10 fx', { setting: 'postoperative', grade: 4, ageYears: 80, methylation: 'unmethylated', surgery: 'biopsy' }],
  ]),
);

const brainMet = register(
  'cns.brain-metastases', 'Beyin metastazları', 'cns', 'brain-metastases', CNS.brainMetastasesEngine,
  { setting: 'newly-diagnosed', numberOfLesions: 1, performanceStatusECOG: 1, largestLesionCm: 2 },
  [field('setting', 'Tedavi bağlamı', 'select', ['newly-diagnosed', 'postoperative', 'progression']), field('numberOfLesions', 'Metastaz sayısı', 'number'), field('burden', 'Metastaz yükü', 'select', ['single', 'oligometastatic', 'multiple', 'diffuse']), field('largestLesionCm', 'En büyük lezyon (cm)', 'number'), field('midlineShift', 'Orta hat şifti', 'select', ['none', 'less-than-5-mm', 'at-least-5-mm']), field('symptomStatus', 'Nörolojik durum', 'select', ['asymptomatic', 'deficit-or-raised-icp']), field('performanceStatusECOG', 'ECOG', 'number'), field('kps', 'KPS', 'number'), field('leptomeningealDisease', 'Leptomeningeal hastalık', 'boolean'), ...common],
  presets([
    ['srs-single', 'Tek lezyon — SRS 18-24 Gy', { setting: 'newly-diagnosed', numberOfLesions: 1, largestLesionCm: 1.8, performanceStatusECOG: 1 }],
    ['srs-oligo', 'Oligometastaz — SRT 27-30 Gy / 3 fx', { setting: 'newly-diagnosed', numberOfLesions: 4, largestLesionCm: 2.5, performanceStatusECOG: 1 }],
    ['hawbrt', 'Çoklu metastaz — HA-WBRT 30 Gy / 10 fx + memantin', { setting: 'newly-diagnosed', numberOfLesions: 12, largestLesionCm: 2, performanceStatusECOG: 2 }],
  ]),
);

const nasopharynx = register(
  'head-neck.nasopharynx', 'Nazofarenks', 'head-neck', 'nasopharyngeal-carcinoma', HeadNeck.nasopharynxEngine,
  { setting: 'newly-diagnosed', stageGroup: 'III', histology: 'non-keratinizing', resectability: 'unresectable' },
  [field('setting', 'Tedavi bağlamı', 'select', ['newly-diagnosed', 'postoperative', 'recurrent', 'metastatic']), field('stageGroup', 'Evre', 'text'), field('histology', 'Histoloji', 'select', ['non-keratinizing', 'keratinizing']), field('inductionChemotherapy', 'İndüksiyon KT', 'boolean'), ...common],
  presets([
    ['stage-ii', 'Evre II — 70/60/54 Gy SIB KRT', { setting: 'newly-diagnosed', stageGroup: 'II', inductionChemotherapy: false }],
    ['stage-iii', 'Evre III — indüksiyon KT + KRT', { setting: 'newly-diagnosed', stageGroup: 'III', inductionChemotherapy: true }],
    ['stage-iva', 'Evre IVA — indüksiyon + eşzamanlı KRT', { setting: 'newly-diagnosed', stageGroup: 'IVA', inductionChemotherapy: true }],
  ]),
);

const cervix = register(
  'gynecology.cervix', 'Serviks', 'gynecology', 'cervical-cancer', Gynecology.cervixEngine,
  { setting: 'definitive', figoStage: 'IIIB', histology: 'squamous', renalFunction: 'adequate' },
  [field('setting', 'Tedavi bağlamı', 'select', ['definitive', 'postoperative', 'recurrent', 'metastatic']), field('figoStage', 'FIGO evre', 'text'), field('histology', 'Histoloji', 'select', ['squamous', 'adenocarcinoma', 'adenosquamous']), field('renalFunction', 'Böbrek fonksiyonu', 'select', ['adequate', 'impaired']), field('paraAorticNodes', 'Paraaortik nod', 'boolean'), ...common],
  presets([
    ['ib3-iva', 'IB3-IVA — 45 Gy pelvis + sisplatin + HDR', { setting: 'definitive', figoStage: 'IIIB', renalFunction: 'adequate' }],
    ['postop-risk', 'Postop yüksek risk — KRT + brakiterapi değerlendirmesi', { setting: 'postoperative', figoStage: 'IIIC1', surgicalMargin: 'R1' }],
    ['para-aortic', 'Paraaortik nod pozitif — genişletilmiş alan', { setting: 'definitive', figoStage: 'IIIC2', paraAorticNodes: true }],
  ]),
);

const palliative = register(
  'palliative.radiotherapy', 'Palyatif RT', 'palliative', 'palliative-radiotherapy', Palliative.palliativeRadiotherapyEngine,
  { setting: 'new-symptom', site: 'bone', symptoms: ['pain'], performance: 'good' },
  [field('setting', 'Acil durum', 'select', ['new-symptom', 'urgent-emergency', 'progression']), field('site', 'Tedavi alanı', 'select', ['bone', 'spine', 'brain', 'thorax', 'bleeding']), field('symptoms', 'Semptom', 'text'), field('spinalCordCompression', 'Medulla basısı', 'boolean'), field('performance', 'Performans', 'select', ['good', 'limited', 'poor']), ...common],
  presets([
    ['bone-8', 'Ağrılı kemik metastazı — 8 Gy / 1 fx', { setting: 'new-symptom', site: 'bone', symptoms: ['pain'], performance: 'good' }],
    ['bone-20', 'Ağrılı kemik metastazı — 20 Gy / 5 fx', { setting: 'new-symptom', site: 'bone', symptoms: ['pain'], performance: 'limited' }],
    ['cord', 'Medulla basısı — acil 30 Gy / 10 fx + steroid', { setting: 'urgent-emergency', site: 'spine', spinalCordCompression: true, symptoms: ['neurologic-deficit'], performance: 'limited' }],
    ['bleeding', 'Kanama — hemostatik palyatif RT', { setting: 'urgent-emergency', site: 'bleeding', symptoms: ['bleeding'], performance: 'limited' }],
  ]),
);

const genericEngineDefinitions = [
  ...[
    ['gis.colon', 'Kolon', 'gis', 'colon-cancer', GIS.colonEngine],
    ['gis.anal', 'Anal kanal', 'gis', 'anal-cancer', GIS.analEngine],
    ['gis.gist', 'GİST', 'gis', 'gist', 'gis.gistEngine'],
    ['gis.liver', 'Karaciğer', 'liver', 'liver-cancer', GIS.liverCancerEngine],
    ['gus.kidney', 'Böbrek / RCC', 'gus', 'renal-cell-carcinoma', GUS.kidneyEngine],
    ['gus.testis', 'Testis', 'gus', 'testicular-cancer', GUS.testisEngine],
    ['gus.penile', 'Penis', 'gus', 'penile-cancer', GUS.penileEngine],
    ['cns.meningioma', 'Menenjiom', 'cns', 'meningioma', CNS.meningiomaEngine],
    ['cns.ependymoma', 'Ependimom', 'cns', 'ependymoma', CNS.ependymomaEngine],
    ['cns.primary-cns-lymphoma', 'Primer CNS lenfoması', 'cns', 'primary-cns-lymphoma', CNS.primaryCNSLymphomaEngine],
    ['cns.leptomeningeal', 'Leptomeningeal metastaz', 'cns', 'leptomeningeal-metastases', CNS.leptomeningealMetastasesEngine],
    ['cns.metastatic-spine', 'Metastatik spinal tümör', 'cns', 'metastatic-spinal-tumor', CNS.metastaticSpinalTumorEngine],
    ['cns.primary-spinal-cord', 'Primer spinal kord tümörü', 'cns', 'primary-spinal-cord-tumor', CNS.primarySpinalCordTumorEngine],
    ['head-neck.oropharynx', 'Orofarenks', 'head-neck', 'oropharyngeal-cancer', HeadNeck.oropharynxEngine],
    ['head-neck.hypopharynx', 'Hipofarenks', 'head-neck', 'hypopharyngeal-cancer', HeadNeck.hypopharynxEngine],
    ['head-neck.oral-cavity', 'Oral kavite', 'head-neck', 'oral-cavity-cancer', HeadNeck.oralCavityEngine],
    ['head-neck.salivary-gland', 'Tükürük bezi', 'head-neck', 'salivary-gland-cancer', HeadNeck.salivaryGlandEngine],
    ['head-neck.maxillary-sinus', 'Maksiller sinüs', 'head-neck', 'maxillary-sinus-cancer', HeadNeck.maxillarySinusEngine],
    ['head-neck.thyroid', 'Tiroid', 'head-neck', 'thyroid-cancer', HeadNeck.thyroidEngine],
    ['gynecology.endometrial', 'Endometriyum', 'gynecology', 'endometrial-cancer', Gynecology.endometrialEngine],
    ['gynecology.ovary', 'Over', 'gynecology', 'ovarian-cancer', Gynecology.ovaryEngine],
    ['gynecology.uterus', 'Uterus', 'gynecology', 'uterine-cancer', Gynecology.uterusEngine],
    ['gynecology.vaginal', 'Vajina', 'gynecology', 'vaginal-cancer', Gynecology.vaginalEngine],
    ['gynecology.vulvar', 'Vulva', 'gynecology', 'vulvar-cancer', Gynecology.vulvarEngine],
    ['pediatric.medulloblastoma', 'Medulloblastom', 'cns', 'medulloblastoma', Pediatric.medulloblastomaEngine],
    ['pediatric.ewing', 'Ewing sarkomu', 'sarcoma', 'ewing-sarcoma', Pediatric.ewingSarcomaEngine],
    ['pediatric.all', 'Pediatrik ALL', 'cns', 'acute-lymphoblastic-leukemia', Pediatric.acuteLymphoblasticLeukemiaEngine],
    ['pediatric.wilms', 'Wilms tümörü', 'gus', 'wilms-tumor', Pediatric.wilmsTumorEngine],
    ['bone.osteosarcoma', 'Osteosarkom', 'bone', 'osteosarcoma', Bone.osteosarcomaEngine],
    ['bone.chondrosarcoma', 'Kondrosarkom', 'bone', 'chondrosarcoma', Bone.chondrosarcomaEngine],
    ['bone.giant-cell-tumor', 'Dev hücreli tümör', 'bone', 'giant-cell-tumor', Bone.giantCellTumorEngine],
    ['skin.melanoma', 'Melanom', 'skin', 'melanoma', Skin.melanomaEngine],
    ['skin.bcc', 'BCC', 'skin', 'basal-cell-carcinoma', Skin.bccEngine],
    ['skin.scc', 'SCC', 'skin', 'cutaneous-squamous-cell-carcinoma', Skin.skinSccEngine],
    ['skin.cutaneous-lymphoma', 'Kutanöz lenfoma', 'skin', 'cutaneous-lymphoma', Skin.cutaneousLymphomaEngine],
    ['skin.kaposi', 'Kaposi sarkomu', 'skin', 'kaposi-sarcoma', Skin.kaposiSarcomaEngine],
    ['hematologic.myeloma', 'Multiple Myelom', 'hematologic', 'multiple-myeloma', Hematologic.multipleMyelomaEngine],
    ['hematologic.aml', 'AML', 'hematologic', 'acute-myeloid-leukemia', Hematologic.acuteMyeloidLeukemiaEngine],
    ['hematologic.cml', 'KML', 'hematologic', 'chronic-myeloid-leukemia', Hematologic.chronicMyeloidLeukemiaEngine],
  ],
] as Array<[string, string, OrganSystem, string, unknown]>;

const allEngines: RegisteredEngine[] = [
  nsclc, sclc, gastric, rectum, prostate, bladder, breast, gbm, brainMet, nasopharynx, cervix, palliative,
  ...genericEngineDefinitions.map(([id, name, organSystem, disease, engine]) => register(
    id as string, name as string, organSystem as OrganSystem, disease as string, engine as Engine,
    id === 'cns.meningioma'
      ? { setting: 'newly-diagnosed', grade: 'WHO-1', surgeryType: 'gross-total-resection', midlineShift: 'none', symptomStatus: 'asymptomatic', brainInvasion: false }
      : { setting: 'newly-diagnosed' },
    id === 'cns.meningioma'
      ? [
          field('setting', 'Tedavi bağlamı', 'select', ['newly-diagnosed', 'postoperative', 'recurrent', 'progressive']),
          field('grade', 'WHO derecesi', 'select', ['WHO-1', 'WHO-2', 'WHO-3']),
          field('surgeryType', 'Simpson rezeksiyonu', 'select', ['gross-total-resection', 'subtotal-resection']),
          field('midlineShift', 'Orta hat şifti', 'select', ['none', 'less-than-5-mm', 'at-least-5-mm']),
          field('symptomStatus', 'Nörolojik semptom', 'select', ['asymptomatic', 'deficit-or-raised-icp']),
          field('brainInvasion', 'Beyin invazyonu', 'boolean'),
          field('tumorSizeCm', 'Tümör çapı (cm)', 'number'),
          field('neurologicDeficit', 'Nörolojik defisit', 'boolean'),
          field('seizures', 'Nöbet', 'boolean'),
        ]
      : [...common],
    presets([['standard', `${name} standart vaka`, { setting: 'newly-diagnosed' }], ['postop', `${name} postop`, { setting: 'postoperative', surgicalMargin: 'R1' }], ['advanced', `${name} ileri/relaps`, { setting: 'relapsed' }]]),
    id.startsWith('pediatric.') ? 'pediatric-age' : organSystem,
  )),
];

export const ENGINE_REGISTRY = allEngines;
export const getEnginesByOrgan = (organSystem: OrganSystem): RegisteredEngine[] => ENGINE_REGISTRY.filter((engine) => engine.navigationGroup === organSystem);
export const getRegisteredEngine = (id: string): RegisteredEngine | undefined => ENGINE_REGISTRY.find((engine) => engine.id === id);
