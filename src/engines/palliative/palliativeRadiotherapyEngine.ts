import { BaseDecisionEngine } from '../base-engine';
import type {
  CDSSResult, ClinicalCaseInput, ClinicalRecommendation, Fractionation,
  GuidelineReference, JsonSchema, OARConstraint, TargetVolume,
} from '../../types/cdss';

export type PalliativeSetting = 'new-symptom' | 'progression' | 're-irradiation' | 'urgent-emergency' | 'end-of-life';
export type PalliativeSite = 'bone' | 'brain' | 'spine' | 'lung' | 'mediastinum' | 'abdomen' | 'pelvis' | 'head-neck' | 'soft-tissue' | 'other';
export type PalliativeSymptom = 'pain' | 'neurologic-deficit' | 'cord-compression' | 'bleeding' | 'obstruction' | 'dyspnea' | 'seizure' | 'fungation' | 'other';
export type PalliativePerformance = 'good' | 'limited' | 'poor' | 'actively-dying' | 'unknown';

export interface PalliativeRadiotherapyInput extends ClinicalCaseInput {
  organSystem: 'palliative';
  disease: 'palliative-radiotherapy';
  setting: PalliativeSetting;
  site: PalliativeSite;
  symptoms?: PalliativeSymptom[];
  performance?: PalliativePerformance;
  expectedSurvivalMonths?: number;
  oligometastatic?: boolean;
  numberOfTargets?: number;
  targetSizeCm?: number;
  spinalCordCompression?: boolean;
  epiduralSpinalCordCompression?: boolean;
  spinalInstability?: boolean;
  pathologicFracture?: boolean;
  impendingFracture?: boolean;
  brainMetastases?: boolean;
  leptomeningealDisease?: boolean;
  bleedingRisk?: boolean;
  airwayOrEsophagealObstruction?: boolean;
  priorRadiotherapy?: boolean;
  priorDoseGy?: number;
  priorFractions?: number;
  systemicTherapy?: string[];
  molecularTargets?: string[];
  surgeryMargin?: 'R0' | 'R1' | 'R2' | 'not-applicable';
}

const NCCN: GuidelineReference = {
  organization: 'NCCN',
  title: 'NCCN Clinical Practice Guidelines in Oncology: Adult Cancer Pain and Palliative Care',
  version: 'Current version; verify institutional subscription before use',
  url: 'https://www.nccn.org/guidelines/guidelines-detail?category=3&id=1454',
  evidenceLevel: '2A',
};
const ASTRO: GuidelineReference = {
  organization: 'ASTRO',
  title: 'ASTRO clinical practice guideline: palliative radiation therapy for symptomatic bone metastases',
  url: 'https://www.astro.org/Patient-Care-and-Research/Clinical-Practice-Statements/Clinical-Practice-Guidelines',
  evidenceLevel: 'A',
};
const ESTRO: GuidelineReference = {
  organization: 'ESTRO',
  title: 'ESTRO clinical practice recommendations for palliative radiotherapy and re-irradiation',
  url: 'https://www.estro.org/Science/Guidelines',
  evidenceLevel: 'B',
};
const TRIALS: GuidelineReference[] = [
  { organization: 'other', title: 'NCIC CTG SC.23: single-fraction stereotactic re-irradiation for painful vertebral metastases', url: 'https://doi.org/10.1016/S1470-2045(17)30144-9', evidenceLevel: '1' },
  { organization: 'other', title: 'RTOG 97-14: 8 Gy single fraction versus multifraction RT for painful bone metastases', url: 'https://doi.org/10.1016/S0360-3016(04)00440-3', evidenceLevel: '1' },
  { organization: 'other', title: 'RTOG 0631: stereotactic radiosurgery for localized vertebral metastases', url: 'https://clinicaltrials.gov/study/NCT00340171', evidenceLevel: '1' },
  { organization: 'other', title: 'QUARTZ: whole-brain radiotherapy in poor-prognosis brain metastases', url: 'https://doi.org/10.1016/S0140-6736(16)30825-X', evidenceLevel: '1' },
  { organization: 'other', title: 'SABR-COMET: stereotactic ablative radiotherapy for oligometastatic disease', url: 'https://doi.org/10.1016/S0140-6736(19)30199-0', evidenceLevel: '1' },
];

export const PALLIATIVE_RADIOTHERAPY_INPUT_JSON_SCHEMA: JsonSchema = {
  $schema: 'http://json-schema.org/draft-07/schema#',
  $id: 'https://radonco.local/schema/palliative-radiotherapy-input.json',
  title: 'Palliative radiotherapy clinical case input',
  type: 'object',
  required: ['organSystem', 'disease', 'setting', 'site'],
  properties: {
    organSystem: { type: 'string', enum: ['palliative'] },
    disease: { type: 'string', enum: ['palliative-radiotherapy'] },
    setting: { type: 'string', enum: ['new-symptom', 'progression', 're-irradiation', 'urgent-emergency', 'end-of-life'] },
    site: { type: 'string', enum: ['bone', 'brain', 'spine', 'lung', 'mediastinum', 'abdomen', 'pelvis', 'head-neck', 'soft-tissue', 'other'] },
    symptoms: { type: 'array', items: { type: 'string' } }, performance: { type: 'string' },
    expectedSurvivalMonths: { type: 'number' }, oligometastatic: { type: 'boolean' }, numberOfTargets: { type: 'number' }, targetSizeCm: { type: 'number' },
    spinalCordCompression: { type: 'boolean' }, epiduralSpinalCordCompression: { type: 'boolean' }, spinalInstability: { type: 'boolean' },
    pathologicFracture: { type: 'boolean' }, impendingFracture: { type: 'boolean' }, brainMetastases: { type: 'boolean' },
    leptomeningealDisease: { type: 'boolean' }, bleedingRisk: { type: 'boolean' }, airwayOrEsophagealObstruction: { type: 'boolean' },
    priorRadiotherapy: { type: 'boolean' }, priorDoseGy: { type: 'number' }, priorFractions: { type: 'number' },
    systemicTherapy: { type: 'array', items: { type: 'string' } }, molecularTargets: { type: 'array', items: { type: 'string' } },
    surgeryMargin: { type: 'string', enum: ['R0', 'R1', 'R2', 'not-applicable'] },
  },
  additionalProperties: true,
};

export const PALLIATIVE_RADIOTHERAPY_OUTPUT_JSON_SCHEMA: JsonSchema = {
  $schema: 'http://json-schema.org/draft-07/schema#',
  $id: 'https://radonco.local/schema/palliative-radiotherapy-result.json',
  title: 'Palliative radiotherapy CDSS result',
  type: 'object',
  required: ['schemaVersion', 'engineId', 'engineVersion', 'organSystem', 'rtIndication', 'intent', 'summary', 'recommendations'],
  properties: {
    schemaVersion: { type: 'string', enum: ['1.0'] }, engineId: { type: 'string', enum: ['palliative.radiotherapy'] },
    engineVersion: { type: 'string' }, organSystem: { type: 'string', enum: ['palliative'] }, rtIndication: { type: 'string' },
    intent: { type: 'string' }, summary: { type: 'string' }, recommendations: { type: 'array', items: { type: 'object', additionalProperties: true } },
    warnings: { type: 'array', items: { type: 'string' } }, guidelineReferences: { type: 'array', items: { type: 'object', additionalProperties: true } },
  },
  additionalProperties: true,
};

const fraction = (totalDoseGy: number, fractions: number, className: Fractionation['class'], schedule: string, technique: Fractionation['technique'] = 'IGRT'): Fractionation => ({
  class: className, totalDoseGy, fractions, dosePerFractionGy: totalDoseGy / fractions, schedule, technique,
  alphaBetaTumor: 10, bedGy: totalDoseGy * (1 + totalDoseGy / fractions / 10), eqd2Gy: totalDoseGy * ((totalDoseGy / fractions + 10) / 12),
});
const targets = (dose: Fractionation, site: PalliativeSite): TargetVolume[] => [
  { name: 'GTV', description: `Görüntülenebilir/klinik semptomatik ${site} metastatik veya tümör hedefi.`, dose, margin: 'Semptom, kontrastlı görüntüleme, PET/CT veya MRI ile' },
  { name: 'CTV', description: 'GTV çevresindeki mikroskopik hastalık ve anatomik risk alanı; elektif nodal alan rutin değildir.', dose, margin: 'Anatomik bariyer ve protokole göre 0.5-1.5 cm; spinal kord/epidural hastalıkta MRI temelli' },
  { name: 'PTV', description: 'Kurulum, solunum/hareket ve günlük IGRT belirsizlikleri.', dose, margin: 'Konvansiyonel 5-10 mm; SBRT/SRS için immobilizasyon ve IGRT ile 1-3 mm' },
];
const oars: OARConstraint[] = [
  { organ: 'Spinal cord', metric: 'Dmax', limit: 45, unit: 'Gy', priority: 'mandatory', source: 'QUANTEC', sourceReference: 'Palliative spine RT; cumulative re-irradiation required' },
  { organ: 'Brainstem', metric: 'Dmax', limit: 54, unit: 'Gy', priority: 'mandatory', source: 'QUANTEC', sourceReference: 'Brain SRS/FSRT objective' },
  { organ: 'Optic pathways', metric: 'Dmax', limit: 54, unit: 'Gy', priority: 'mandatory', source: 'QUANTEC', sourceReference: 'Brain SRS/FSRT objective' },
  { organ: 'Lung', metric: 'V20', limit: 30, unit: '%', priority: 'optimal', source: 'QUANTEC', sourceReference: 'Thoracic palliative planning objective' },
  { organ: 'Esophagus', metric: 'Dmean', limit: 34, unit: 'Gy', priority: 'optimal', source: 'QUANTEC', sourceReference: 'Thoracic palliative planning objective' },
  { organ: 'Heart', metric: 'Dmean', limit: 26, unit: 'Gy', priority: 'optimal', source: 'QUANTEC', sourceReference: 'Thoracic palliative planning objective' },
];
const references = (...extra: GuidelineReference[]): GuidelineReference[] => [NCCN, ASTRO, ESTRO, ...extra];

export class PalliativeRadiotherapyDecisionEngine extends BaseDecisionEngine<PalliativeRadiotherapyInput> {
  public readonly id = 'palliative.radiotherapy';
  public readonly version = '1.0.0';
  public readonly inputSchema = PALLIATIVE_RADIOTHERAPY_INPUT_JSON_SCHEMA;
  public readonly outputSchema = PALLIATIVE_RADIOTHERAPY_OUTPUT_JSON_SCHEMA;
  public constructor() { super('1.0.0'); }

  protected evaluateCase(input: PalliativeRadiotherapyInput): CDSSResult {
    const recommendations: ClinicalRecommendation[] = [];
    const rationale: string[] = [];
    const warnings: string[] = [];
    const symptoms = input.symptoms ?? [];
    const urgent = input.setting === 'urgent-emergency' || input.spinalCordCompression === true || input.epiduralSpinalCordCompression === true || input.airwayOrEsophagealObstruction === true || input.bleedingRisk === true;
    const poorPrognosis = input.performance === 'poor' || input.performance === 'actively-dying' || (input.expectedSurvivalMonths !== undefined && input.expectedSurvivalMonths < 3);
    let rtIndication: CDSSResult['rtIndication'] = 'consider';
    const intent: CDSSResult['intent'] = 'palliative';
    if (input.priorRadiotherapy) warnings.push('Re-irradiation mevcut; önceki plan/kümülatif BED, spinal kord, beyin sapı, optik yollar, akciğer, özofagus ve kalp dozları mutlaka doğrulanmalıdır.');
    if (input.spinalInstability || input.pathologicFracture || input.impendingFracture) warnings.push('Mekanik instabilite/kırık riski için ortopedi veya spinal cerrahi değerlendirmesi; RT tek başına mekanik stabilite sağlamaz.');
    if (urgent) warnings.push('Acil semptom/organ tehdidi mevcut; steroid, analjezi, hava yolu/kanama yönetimi ve cerrahi girişim gereksinimi RT ile eşzamanlı değerlendirilmelidir.');

    if (urgent && (input.site === 'spine' || input.spinalCordCompression)) {
      const dose = fraction(20, 5, 'moderate-hypofractionation', '20 Gy / 5 fx; spinal kord basısı veya nörolojik tehdit için');
      recommendations.push({
        id: 'urgent-spine-palliation', label: 'Acil spinal MRI, cerrahi/stabilizasyon değerlendirmesi ve hızlı spinal RT',
        indication: 'indicated', intent: 'palliative', fractionation: dose, targetVolumes: targets(dose, 'spine'), oarConstraints: oars,
        rationale: ['MSCC/epidural hastalıkta kontrastlı tüm spinal MRI, kortikosteroid ve nöroşirürji-spinal cerrahi görüşü geciktirilmemelidir.', 'Cerrahiye uygun olmayan veya RT sonrası stabilizasyon gereken hastada 20 Gy/5 fx veya yaşam beklentisine göre 8 Gy/1 fx düşünülebilir.'],
        guidelineReferences: references(TRIALS[1], TRIALS[2]),
      });
      rtIndication = 'indicated';
    } else if (input.site === 'brain' || input.brainMetastases) {
      const dose = input.numberOfTargets !== undefined && input.numberOfTargets <= 4 && !poorPrognosis ? fraction(27, 3, 'SRS', '27 Gy / 3 fx; seçilmiş sınırlı beyin metastazı') : fraction(20, 5, 'moderate-hypofractionation', '20 Gy / 5 fx; seçilmiş beyin metastazı veya semptomatik hedef');
      recommendations.push({
        id: 'brain-palliation', label: poorPrognosis ? 'Destek tedavisi ± kısa beyin RT; QUARTZ benzeri seçilmiş yaklaşım' : 'SRS/FSRT veya seçilmiş WBRT ve sistemik tedavi',
        indication: input.brainMetastases || symptoms.includes('seizure') || symptoms.includes('neurologic-deficit') ? 'indicated' : 'conditional',
        intent: 'palliative', fractionation: poorPrognosis ? fraction(20, 5, 'moderate-hypofractionation', '20 Gy / 5 fx; yalnızca beklenen fayda varsa') : dose,
        targetVolumes: targets(poorPrognosis ? fraction(20, 5, 'moderate-hypofractionation', '20 Gy / 5 fx') : dose, 'brain'), oarConstraints: oars,
        rationale: ['Sınırlı sayıda iyi performanslı hastada SRS/FSRT; çok sayıda/yaygın hastalıkta sistemik tedavi ve seçilmiş WBRT değerlendirilir.', 'Kötü prognozda WBRT otomatik değildir; QUARTZ verileri destek tedavisiyle birlikte beklenen yaşam ve semptom yararının tartılmasını destekler.'],
        guidelineReferences: references(TRIALS[3], TRIALS[4]),
      });
      rtIndication = 'indicated';
    } else if (input.oligometastatic && input.numberOfTargets !== undefined && input.numberOfTargets <= 5 && !poorPrognosis) {
      const dose = fraction(30, 5, 'SBRT', '30 Gy / 5 fx; seçilmiş oligometastatik hedef', 'IGRT');
      recommendations.push({
        id: 'oligometastatic-palliation', label: 'Seçilmiş oligometastatik hastalıkta metastaz-yönelik SBRT',
        indication: 'consider', intent: 'palliative', fractionation: dose, targetVolumes: targets(dose, input.site), oarConstraints: oars,
        rationale: ['SABR-COMET benzeri seçilmiş oligometastatik hastalarda lokal ablasyon düşünülebilir; bu yaklaşım semptom palliasyonundan öte hastalık kontrolü amacı taşıyabilir.', 'Kritik organ yakınlığı, toplam hedef sayısı, sistemik tedavi ve yaşam beklentisi SBRT kararını belirler.'],
        guidelineReferences: references(TRIALS[4]),
      });
      rtIndication = 'consider';
    } else {
      const dose = poorPrognosis ? fraction(8, 1, 'single-fraction', '8 Gy / 1 fx; kısa yaşam beklentisi ve hızlı semptom kontrolü') : fraction(20, 5, 'moderate-hypofractionation', '20 Gy / 5 fx; yaygın semptomatik metastaz veya obstrüksiyon/kanama');
      recommendations.push({
        id: 'standard-palliative-rt', label: urgent ? 'Semptomatik hedefe kısa palyatif RT ve destek tedavisi' : 'Semptom, hedef anatomisi ve yaşam beklentisine göre palyatif RT',
        indication: symptoms.length > 0 || urgent ? 'indicated' : 'conditional', intent: 'palliative', fractionation: dose,
        targetVolumes: targets(dose, input.site), oarConstraints: oars,
        rationale: ['ASTRO kemik metastazı kılavuzu 8 Gy/1 fx, 20 Gy/5 fx, 24 Gy/6 fx veya 30 Gy/10 fx seçeneklerinin hasta ve hedefe göre kullanılmasını destekler.', 'Kanama, ağrı, obstrüksiyon ve dispne için hedef hacim semptomu oluşturan lezyonla sınırlanmalı; elektif nodal ışınlama rutin değildir.', 'Mediastinal/akciğer olgularında 60-66 Gy/30-33 fx eşzamanlı KRT ve konsolidasyon immünoterapisi palyatif RT’nin varsayılan yaklaşımı değildir; yalnızca farklı definitif amaçlı seçilmiş olgular için düşünülür.'],
        guidelineReferences: references(TRIALS[0], TRIALS[1]),
      });
      rtIndication = symptoms.length > 0 || urgent ? 'indicated' : 'conditional';
    }
    if (input.systemicTherapy?.length || input.molecularTargets?.length) rationale.push('Sistemik tedavi, cerrahi rezektabilite/marjin ve EGFR/ALK gibi moleküler hedefler ilgili primer tümör MDT’si ile RT zamanlamasına göre koordine edilmelidir; RT bunların yerine geçmez.');
    rationale.push('Palyatif RT kararı semptom yükü, performans, beklenen yaşam, hedef güvenliği, hastanın tercihleri ve erken destek/palyatif bakım entegrasyonuyla birlikte verilmelidir.');
    return {
      schemaVersion: '1.0', engineId: this.id, engineVersion: this.version, caseId: input.caseId, organSystem: 'palliative',
      rtIndication, intent, summary: recommendations[0]?.label ?? 'Palyatif bakım ve RT için MDT değerlendirmesi gerekir.',
      recommendations, rationale, warnings,
      uncertainties: ['Aktif NCCN/ASTRO/ESTRO sürümü, hedef görüntüleme, önceki RT planları/kümülatif doz, prognoz, sistemik tedavi ve cerrahi uygunluk doğrulanmalıdır.'],
      confidence: 0.9, guidelineReferences: references(...TRIALS),
    };
  }
}

export const palliativeRadiotherapyEngine = new PalliativeRadiotherapyDecisionEngine();
