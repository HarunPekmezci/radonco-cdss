import { BaseDecisionEngine } from '../base-engine';
import type {
  CDSSResult, ClinicalCaseInput, ClinicalRecommendation, Fractionation,
  GuidelineReference, JsonSchema, OARConstraint, SystemicTherapyRecommendation,
  TargetVolume, TNMStage,
} from '../../types/cdss';

export type MelanomaSetting = 'newly-diagnosed' | 'postoperative' | 'recurrent' | 'metastatic';
export type MelanomaSite = 'cutaneous' | 'acral' | 'mucosal' | 'ocular' | 'unknown';
export type MelanomaStage = 'I' | 'II' | 'III' | 'IV' | 'unknown';
export type MelanomaSurgery = 'wide-excision' | 'sentinel-node-biopsy' | 'therapeutic-lymphadenectomy' | 'metastasectomy' | 'none' | 'unknown';
export type MelanomaMolecularFinding = 'BRAF-V600-positive' | 'NRAS-altered' | 'KIT-altered' | 'PD-L1-positive' | 'TMB-high' | 'MSI-H' | 'none' | 'unknown';

export interface MelanomaInput extends ClinicalCaseInput {
  organSystem: 'skin';
  disease: 'melanoma';
  setting: MelanomaSetting;
  stage?: TNMStage;
  stageGroup?: MelanomaStage;
  site?: MelanomaSite;
  surgeryType?: MelanomaSurgery;
  surgicalMargin?: 'R0' | 'R1' | 'R2' | 'RX' | 'not-applicable';
  breslowMm?: number;
  ulceration?: boolean;
  mitoticRate?: number;
  sentinelNodePositive?: boolean;
  positiveNodes?: number;
  extranodalExtension?: boolean;
  inTransitDisease?: boolean;
  brainMetastases?: boolean;
  distantMetastases?: string[];
  priorSkinRT?: boolean;
  symptomaticRecurrence?: boolean;
  performanceStatusECOG?: number;
  molecularFinding?: MelanomaMolecularFinding;
}

const NCCN: GuidelineReference = {
  organization: 'NCCN',
  title: 'NCCN Clinical Practice Guidelines in Oncology: Cutaneous Melanoma',
  version: 'Current version; verify institutional subscription before use',
  url: 'https://www.nccn.org/guidelines/guidelines-detail?category=1&id=1492',
  evidenceLevel: '2A',
};
const ASTRO: GuidelineReference = {
  organization: 'ASTRO',
  title: 'ASTRO clinical practice resources for melanoma and skin radiotherapy',
  url: 'https://www.astro.org/Patient-Care-and-Research/Clinical-Practice-Statements/Clinical-Practice-Guidelines',
  evidenceLevel: 'B',
};
const ESTRO: GuidelineReference = {
  organization: 'ESTRO',
  title: 'ESTRO consensus guidance for melanoma radiotherapy and stereotactic treatment',
  url: 'https://www.estro.org/Science/Guidelines',
  evidenceLevel: 'B',
};
const TRIALS: GuidelineReference[] = [
  { organization: 'other', title: 'KEYNOTE-054: adjuvant pembrolizumab in resected high-risk melanoma', url: 'https://doi.org/10.1056/NEJMoa1802357', evidenceLevel: '1' },
  { organization: 'other', title: 'CheckMate 238: adjuvant nivolumab versus ipilimumab in resected melanoma', url: 'https://doi.org/10.1056/NEJMoa1709030', evidenceLevel: '1' },
  { organization: 'other', title: 'COMBI-AD: adjuvant dabrafenib plus trametinib in BRAF-mutated melanoma', url: 'https://doi.org/10.1056/NEJMoa1708539', evidenceLevel: '1' },
  { organization: 'other', title: 'DREAMseq: first-line immunotherapy versus targeted therapy in advanced BRAF-mutant melanoma', url: 'https://doi.org/10.1200/JCO.22.00416', evidenceLevel: '1' },
  { organization: 'other', title: 'N0574: stereotactic radiosurgery with or without whole-brain radiotherapy for brain metastases', url: 'https://doi.org/10.1016/j.jco.2016.02.022', evidenceLevel: '1' },
];

export const MELANOMA_INPUT_JSON_SCHEMA: JsonSchema = {
  $schema: 'http://json-schema.org/draft-07/schema#',
  $id: 'https://radonco.local/schema/melanoma-input.json',
  title: 'Melanoma clinical case input',
  type: 'object',
  required: ['organSystem', 'disease', 'setting'],
  properties: {
    organSystem: { type: 'string', enum: ['skin'] }, disease: { type: 'string', enum: ['melanoma'] },
    setting: { type: 'string', enum: ['newly-diagnosed', 'postoperative', 'recurrent', 'metastatic'] },
    stage: { type: 'object', additionalProperties: true }, stageGroup: { type: 'string', enum: ['I', 'II', 'III', 'IV', 'unknown'] },
    site: { type: 'string', enum: ['cutaneous', 'acral', 'mucosal', 'ocular', 'unknown'] },
    surgeryType: { type: 'string' }, surgicalMargin: { type: 'string' },
    breslowMm: { type: 'number' }, ulceration: { type: 'boolean' }, mitoticRate: { type: 'number' },
    sentinelNodePositive: { type: 'boolean' }, positiveNodes: { type: 'number' },
    extranodalExtension: { type: 'boolean' }, inTransitDisease: { type: 'boolean' },
    brainMetastases: { type: 'boolean' }, distantMetastases: { type: 'array', items: { type: 'string' } },
    priorSkinRT: { type: 'boolean' }, symptomaticRecurrence: { type: 'boolean' },
    performanceStatusECOG: { type: 'number' }, molecularFinding: { type: 'string' },
  }, additionalProperties: true,
};

export const MELANOMA_OUTPUT_JSON_SCHEMA: JsonSchema = {
  $schema: 'http://json-schema.org/draft-07/schema#',
  $id: 'https://radonco.local/schema/melanoma-result.json',
  title: 'Melanoma CDSS result', type: 'object',
  required: ['schemaVersion', 'engineId', 'engineVersion', 'organSystem', 'rtIndication', 'intent', 'summary', 'recommendations'],
  properties: {
    schemaVersion: { type: 'string', enum: ['1.0'] }, engineId: { type: 'string', enum: ['skin.melanoma'] },
    engineVersion: { type: 'string' }, organSystem: { type: 'string', enum: ['skin'] },
    rtIndication: { type: 'string' }, intent: { type: 'string' }, summary: { type: 'string' },
    recommendations: { type: 'array', items: { type: 'object', additionalProperties: true } },
    warnings: { type: 'array', items: { type: 'string' } },
    guidelineReferences: { type: 'array', items: { type: 'object', additionalProperties: true } },
  }, additionalProperties: true,
};

const fraction = (totalDoseGy: number, fractions: number, className: Fractionation['class'], schedule: string): Fractionation => ({
  class: className, totalDoseGy, fractions, dosePerFractionGy: totalDoseGy / fractions, schedule,
  technique: className === 'SBRT' || className === 'SRS' ? 'IGRT' : 'IMRT', alphaBetaTumor: 10,
  bedGy: totalDoseGy * (1 + totalDoseGy / fractions / 10),
  eqd2Gy: totalDoseGy * ((totalDoseGy / fractions + 10) / 12),
});
const melanomaTargets = (dose: Fractionation, recurrent = false): TargetVolume[] => [
  { name: 'GTV', description: recurrent ? 'Görüntülenebilir cilt, nodal, in-transit veya metastatik nüks.' : 'Primer melanoma yatağı, nodal hastalık veya metastatik hedef.', dose, margin: 'Cerrahi klipler, klinik fotoğraf, MRI/PET-CT ve nörolojik görüntülemeye göre' },
  { name: 'CTV', description: 'Primer cilt/subkutan yatak, nodal basin, in-transit risk alanı veya metastatik lezyon çevresi.', dose, margin: 'Anatomik bariyerler, cerrahi ve hareket yönetimine göre' },
  { name: 'PTV', description: 'Cilt yüzeyi veya stereotaktik hedef için immobilizasyon ve günlük IGRT belirsizliği.', dose, margin: 'Yüzeyel hedefte 3-5 mm ve bolus; SRS/SBRT’de 1-3 mm' },
];
const melanomaOars: OARConstraint[] = [
  { organ: 'Spinal cord', metric: 'Dmax', limit: 45, unit: 'Gy', priority: 'mandatory', source: 'QUANTEC', sourceReference: 'Melanoma spine/head and neck RT objective' },
  { organ: 'Brainstem', metric: 'Dmax', limit: 54, unit: 'Gy', priority: 'mandatory', source: 'QUANTEC', sourceReference: 'Brain SRS objective' },
  { organ: 'Optic pathways', metric: 'Dmax', limit: 54, unit: 'Gy', priority: 'mandatory', source: 'QUANTEC', sourceReference: 'Optic pathway objective' },
  { organ: 'Contralateral eye', metric: 'Dmean', limit: 30, unit: 'Gy', priority: 'optimal', source: 'protocol', sourceReference: 'Periocular melanoma objective' },
  { organ: 'Brachial plexus', metric: 'Dmax', limit: 66, unit: 'Gy', priority: 'mandatory', source: 'protocol', sourceReference: 'Nodal melanoma RT objective' },
];
const systemic = (setting: SystemicTherapyRecommendation['setting'], regimen: string, agents: string[], timing: string, evidenceLevel: SystemicTherapyRecommendation['evidenceLevel'] = '1'): SystemicTherapyRecommendation => ({ setting, regimen, agents, timing, evidenceLevel });
const references = (...extra: GuidelineReference[]): GuidelineReference[] => [NCCN, ASTRO, ESTRO, ...extra];

export class MelanomaDecisionEngine extends BaseDecisionEngine<MelanomaInput> {
  public readonly id = 'skin.melanoma';
  public readonly version = '1.0.0';
  public readonly inputSchema = MELANOMA_INPUT_JSON_SCHEMA;
  public readonly outputSchema = MELANOMA_OUTPUT_JSON_SCHEMA;
  public constructor() { super('1.0.0'); }

  protected evaluateCase(input: MelanomaInput): CDSSResult {
    const recommendations: ClinicalRecommendation[] = [];
    const rationale: string[] = [];
    const warnings: string[] = [];
    let rtIndication: CDSSResult['rtIndication'] = 'not-indicated';
    let intent: CDSSResult['intent'] = 'curative';
    const highRisk = input.surgicalMargin === 'R1' || input.surgicalMargin === 'R2' || input.extranodalExtension === true || Boolean(input.positiveNodes && input.positiveNodes > 0) || input.inTransitDisease === true || input.ulceration === true;
    if (input.priorSkinRT) warnings.push('Önceki cilt RT mevcut; cilt, göz, beyin, spinal kord ve brakiyal pleksus kümülatif dozları değerlendirilmelidir.');
    if (input.brainMetastases) warnings.push('Beyin metastazı mevcut; nöro-onkoloji, MRI ve sistemik immünoterapi/targeted tedavi sıralaması MDT ile belirlenmelidir.');
    if (input.breslowMm !== undefined) rationale.push(`Breslow kalınlığı ${input.breslowMm} mm olarak girildi; ülserasyon ve sentinel nod sonucu adjuvan risk sınıflamasında birlikte değerlendirilmelidir.`);

    if (input.setting === 'newly-diagnosed' || input.setting === 'postoperative') {
      const dose = fraction(48, 20, 'conventional', '48 Gy / 20 fx; seçilmiş yüksek riskli primer/nodal yatak');
      recommendations.push({
        id: 'localized-melanoma',
        label: input.setting === 'postoperative' ? (highRisk ? 'Yüksek riskli postoperatif melanoma yatağı/nodal basin RT ve adjuvan sistemik tedavi' : 'R0 eksizyon ve sentinel nod sonucuna göre izlem/adjuvan sistemik tedavi') : 'Geniş eksizyon + sentinel nod biyopsisi; seçilmiş yüksek riskte adjuvan RT',
        indication: highRisk ? 'indicated' : 'conditional', intent: input.setting === 'postoperative' ? 'adjuvant' : 'curative',
        fractionation: highRisk ? dose : undefined, targetVolumes: highRisk ? melanomaTargets(dose) : undefined, oarConstraints: highRisk ? melanomaOars : undefined,
        systemicTherapy: highRisk ? [systemic('adjuvant', 'Evre III/rezeke yüksek riskli hastada adjuvan immünoterapi veya BRAF/MEK tedavisi', ['nivolumab veya pembrolizumab', 'dabrafenib + trametinib BRAF-V600 pozitifse'], 'Cerrahi sonrası, patolojik evre ve moleküler duruma göre', '1')] : undefined,
        rationale: [
          'Primer kutanöz melanomda geniş eksizyon ve Breslow/ülserasyon temelli sentinel nod biyopsisi temel yaklaşımdır; rutin primer RT çoğu hastada önerilmez.',
          'Adjuvan RT, seçilmiş nodal basin hastalığında ekstranodal yayılım, bulky nodal hastalık, tekrarlayan nodal hastalık veya cerrahi kontrolün yetersiz olduğu durumlarda düşünülür.',
          'Evre III hastalıkta nivolumab/pembrolizumab veya BRAF-V600 pozitifse dabrafenib/trametinib gibi adjuvan seçenekler sistemik MDT ile planlanır.',
          'Elektif nodal RT rutin değildir; tedavi nodal basin veya makroskopik/rezidüel hedefle sınırlanmalıdır.',
        ],
        guidelineReferences: references(TRIALS[0], TRIALS[1], TRIALS[2]),
      });
      rtIndication = highRisk ? 'indicated' : 'conditional'; intent = input.setting === 'postoperative' ? 'adjuvant' : 'curative';
    } else if (input.setting === 'recurrent') {
      const dose = fraction(48, 20, 'conventional', '48 Gy / 20 fx; seçilmiş cilt/nodal/in-transit salvage alan');
      const sbrtDose = fraction(30, 5, 'SBRT', '30 Gy / 5 fx; seçilmiş oligorekürens veya metastatik hedef');
      const prior = input.priorSkinRT === true;
      recommendations.push({
        id: 'recurrent-melanoma',
        label: prior ? 'Önceki RT sonrası seçilmiş salvage cerrahi/re-irradiation veya sistemik tedavi' : 'Salvage cerrahi, nodal tedavi ve seçilmiş fokal RT',
        indication: input.symptomaticRecurrence ? 'indicated' : 'conditional', intent: 'salvage',
        fractionation: prior ? sbrtDose : dose, targetVolumes: melanomaTargets(prior ? sbrtDose : dose, true), oarConstraints: melanomaOars,
        systemicTherapy: [systemic('palliative', 'PD-1 inhibitörü, nivolumab/ipilimumab veya BRAF/MEK hedefli tedavi', ['nivolumab/pembrolizumab', 'nivolumab + ipilimumab', 'dabrafenib + trametinib BRAF-V600 pozitifse'], 'Nüks yükü, semptom, BRAF durumu ve önceki tedavilere göre', '1')],
        rationale: ['İzole cilt/nodal nükste cerrahi ve seçilmiş salvage RT değerlendirilebilir; yaygın nükste sistemik immünoterapi veya hedefli tedavi önceliklidir.', 'Önceki RT sonrası re-irradiation; cilt, göz, beyin, spinal kord ve brakiyal pleksus dozlarıyla birlikte planlanmalıdır.'],
        guidelineReferences: references(TRIALS[0], TRIALS[2], TRIALS[3]),
      });
      rtIndication = input.symptomaticRecurrence ? 'indicated' : 'conditional'; intent = 'salvage';
    } else {
      const brainDose = fraction(27, 3, 'SRS', '27 Gy / 3 fx; seçilmiş beyin metastazı');
      const pallDose = fraction(30, 10, 'moderate-hypofractionation', '30 Gy / 10 fx; semptomatik cilt/kemik/nodal odak');
      recommendations.push({
        id: 'metastatic-melanoma',
        label: input.brainMetastases ? 'SRS/FSRT ve sistemik immünoterapi/targeted tedavi' : 'Sistemik immünoterapi veya BRAF/MEK tedavisi ve semptomatik odaklara RT',
        indication: input.symptomaticRecurrence || input.brainMetastases ? 'indicated' : 'conditional', intent: 'palliative',
        fractionation: input.brainMetastases ? brainDose : input.symptomaticRecurrence ? pallDose : undefined,
        targetVolumes: input.brainMetastases || input.symptomaticRecurrence ? melanomaTargets(input.brainMetastases ? brainDose : pallDose) : undefined,
        oarConstraints: melanomaOars,
        systemicTherapy: [systemic('palliative', 'PD-1 ± CTLA-4 inhibitörü veya BRAF/MEK hedefli tedavi', ['nivolumab/pembrolizumab', 'nivolumab + ipilimumab', 'dabrafenib + trametinib'], 'BRAF durumu, beyin metastazı, semptom ve performansa göre', '1')],
        rationale: ['Metastatik melanomda immünoterapi ve BRAF/MEK hedefli tedavi ana sistemik seçeneklerdir; SRS/FSRT beyin veya oligometastatik odaklarda lokal kontrol sağlar.', 'N0574 verileri sınırlı beyin metastazında SRS yaklaşımını destekler; tüm beyin RT kararı lezyon sayısı, semptom, leptomeningeal durum ve sistemik seçeneklere göre verilmelidir.'],
        guidelineReferences: references(TRIALS[0], TRIALS[3], TRIALS[4]),
      });
      rtIndication = input.symptomaticRecurrence || input.brainMetastases ? 'indicated' : 'conditional'; intent = 'palliative';
    }
    if (input.distantMetastases && input.distantMetastases.length > 0) rationale.push('Uzak metastazlar mevcut; lokal RT kararı sistemik hastalık yükü ve semptomlarla birlikte verilmelidir.');
    return {
      schemaVersion: '1.0', engineId: this.id, engineVersion: this.version, caseId: input.caseId,
      organSystem: 'skin', rtIndication, intent, summary: recommendations[0]?.label ?? 'Melanom için MDT değerlendirmesi gerekir.',
      recommendations, rationale, warnings,
      uncertainties: ['Aktif NCCN/ASTRO/ESTRO sürümü, Breslow/ülserasyon, sentinel nod patolojisi, BRAF profili ve beyin MRI kurum içinde doğrulanmalıdır.'],
      confidence: 0.85, guidelineReferences: references(...TRIALS),
    };
  }
}

export const melanomaEngine = new MelanomaDecisionEngine();
