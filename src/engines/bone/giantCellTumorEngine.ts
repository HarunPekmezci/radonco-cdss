import { BaseDecisionEngine } from '../base-engine';
import type {
  CDSSResult, ClinicalCaseInput, ClinicalRecommendation, Fractionation,
  GuidelineReference, JsonSchema, OARConstraint, SystemicTherapyRecommendation,
  TargetVolume, TNMStage,
} from '../../types/cdss';

export type GiantCellTumorSetting = 'newly-diagnosed' | 'postoperative' | 'locally-advanced' | 'recurrent' | 'metastatic' | 'surveillance';
export type GiantCellTumorRisk = 'localized-resectable' | 'locally-aggressive' | 'unresectable' | 'recurrent' | 'metastatic' | 'unknown';
export type GiantCellTumorSite = 'distal-femur' | 'proximal-tibia' | 'distal-radius' | 'proximal-humerus' | 'sacrum' | 'pelvis' | 'spine' | 'other' | 'unknown';
export type GiantCellTumorSurgery = 'curettage' | 'wide-resection' | 'arthroplasty' | 'amputation' | 'biopsy-only' | 'none' | 'unknown';

export interface GiantCellTumorInput extends ClinicalCaseInput {
  organSystem: 'bone';
  disease: 'giant-cell-tumor-of-bone';
  setting: GiantCellTumorSetting;
  riskGroup?: GiantCellTumorRisk;
  stage?: TNMStage;
  primarySite?: GiantCellTumorSite;
  surgeryType?: GiantCellTumorSurgery;
  surgicalMargin?: 'R0' | 'R1' | 'R2' | 'RX' | 'not-applicable';
  campanacciGrade?: 1 | 2 | 3;
  tumorSizeCm?: number;
  epiphysealInvolvement?: boolean;
  jointSurfaceInvolvement?: boolean;
  softTissueExtension?: boolean;
  pathologicFracture?: boolean;
  unresectable?: boolean;
  localRecurrence?: boolean;
  lungMetastases?: boolean;
  denosumabPreviously?: boolean;
  priorRadiotherapy?: boolean;
  priorSystemicTherapy?: string[];
  symptomaticDisease?: boolean;
  performanceStatusECOG?: number;
}

const NCCN: GuidelineReference = {
  organization: 'NCCN',
  title: 'NCCN Clinical Practice Guidelines in Oncology: Bone Cancer',
  version: 'Current version; verify institutional subscription before use',
  url: 'https://www.nccn.org/guidelines/guidelines-detail?category=1&id=1418',
  evidenceLevel: '2A',
};
const ASTRO: GuidelineReference = {
  organization: 'ASTRO',
  title: 'ASTRO clinical practice resources for bone and soft-tissue tumor radiotherapy',
  url: 'https://www.astro.org/Patient-Care-and-Research/Clinical-Practice-Statements/Clinical-Practice-Guidelines',
  evidenceLevel: 'B',
};
const ESTRO: GuidelineReference = {
  organization: 'ESTRO',
  title: 'ESTRO consensus guidance for sarcoma and benign aggressive bone tumor radiotherapy',
  url: 'https://www.estro.org/Science/Guidelines',
  evidenceLevel: 'B',
};
const TRIALS: GuidelineReference[] = [
  { organization: 'other', title: 'Denosumab for treatment of giant-cell tumor of bone', url: 'https://doi.org/10.1056/NEJMoa1200930', evidenceLevel: '1' },
  { organization: 'other', title: 'Denosumab efficacy in unresectable or recurrent giant-cell tumor of bone', url: 'https://doi.org/10.1016/S0140-6736(13)61448-4', evidenceLevel: '1' },
  { organization: 'other', title: 'Giant-cell tumor of bone: multidisciplinary surgical and radiotherapy consensus', url: 'https://doi.org/10.1016/j.ejca.2018.08.013', evidenceLevel: 'B' },
  { organization: 'other', title: 'RTOG 0131: stereotactic radiotherapy framework for selected bone tumors', url: 'https://clinicaltrials.gov/study/NCT00084305', evidenceLevel: '2B' },
  { organization: 'other', title: 'RTOG 0631: stereotactic spine radiotherapy quality framework', url: 'https://clinicaltrials.gov/study/NCT00340171', evidenceLevel: '1' },
];

export const GIANT_CELL_TUMOR_INPUT_JSON_SCHEMA: JsonSchema = {
  $schema: 'http://json-schema.org/draft-07/schema#',
  $id: 'https://radonco.local/schema/giant-cell-tumor-input.json',
  title: 'Giant-cell tumor of bone clinical case input', type: 'object',
  required: ['organSystem', 'disease', 'setting'],
  properties: {
    organSystem: { type: 'string', enum: ['bone'] }, disease: { type: 'string', enum: ['giant-cell-tumor-of-bone'] },
    setting: { type: 'string', enum: ['newly-diagnosed', 'postoperative', 'locally-advanced', 'recurrent', 'metastatic', 'surveillance'] },
    riskGroup: { type: 'string', enum: ['localized-resectable', 'locally-aggressive', 'unresectable', 'recurrent', 'metastatic', 'unknown'] },
    stage: { type: 'object', additionalProperties: true },
    primarySite: { type: 'string', enum: ['distal-femur', 'proximal-tibia', 'distal-radius', 'proximal-humerus', 'sacrum', 'pelvis', 'spine', 'other', 'unknown'] },
    surgeryType: { type: 'string' }, surgicalMargin: { type: 'string' }, campanacciGrade: { type: 'number' },
    tumorSizeCm: { type: 'number' }, epiphysealInvolvement: { type: 'boolean' }, jointSurfaceInvolvement: { type: 'boolean' },
    softTissueExtension: { type: 'boolean' }, pathologicFracture: { type: 'boolean' }, unresectable: { type: 'boolean' },
    localRecurrence: { type: 'boolean' }, lungMetastases: { type: 'boolean' }, denosumabPreviously: { type: 'boolean' },
    priorRadiotherapy: { type: 'boolean' }, priorSystemicTherapy: { type: 'array', items: { type: 'string' } },
    symptomaticDisease: { type: 'boolean' }, performanceStatusECOG: { type: 'number' },
  }, additionalProperties: true,
};

export const GIANT_CELL_TUMOR_OUTPUT_JSON_SCHEMA: JsonSchema = {
  $schema: 'http://json-schema.org/draft-07/schema#', $id: 'https://radonco.local/schema/giant-cell-tumor-result.json',
  title: 'Giant-cell tumor of bone CDSS result', type: 'object',
  required: ['schemaVersion', 'engineId', 'engineVersion', 'organSystem', 'rtIndication', 'intent', 'summary', 'recommendations'],
  properties: {
    schemaVersion: { type: 'string', enum: ['1.0'] }, engineId: { type: 'string', enum: ['bone.giant-cell-tumor'] },
    engineVersion: { type: 'string' }, organSystem: { type: 'string', enum: ['bone'] }, rtIndication: { type: 'string' },
    intent: { type: 'string' }, summary: { type: 'string' }, recommendations: { type: 'array', items: { type: 'object', additionalProperties: true } },
    warnings: { type: 'array', items: { type: 'string' } }, guidelineReferences: { type: 'array', items: { type: 'object', additionalProperties: true } },
  }, additionalProperties: true,
};

const fraction = (totalDoseGy: number, fractions: number, className: Fractionation['class'], schedule: string): Fractionation => ({
  class: className, totalDoseGy, fractions, dosePerFractionGy: totalDoseGy / fractions, schedule, technique: 'IMRT',
  alphaBetaTumor: 10, bedGy: totalDoseGy * (1 + totalDoseGy / fractions / 10), eqd2Gy: totalDoseGy * ((totalDoseGy / fractions + 10) / 12),
});
const targets = (dose: Fractionation, recurrent = false): TargetVolume[] => [
  { name: 'GTV', description: recurrent ? 'Görüntülenebilir lokal nüks, yumuşak doku uzanımı veya akciğer/kemik metastazı.' : 'MRI/BT ile tanımlanan dev hücreli tümör ve küretaj/rezeksiyon yatağı.', dose, margin: 'Başlangıç görüntüleme, cerrahi kavite ve kemik anatomisine göre' },
  { name: 'CTV', description: 'Kavite, biyopsi yolu, subklinik kemik ve yumuşak doku uzanımı.', dose, margin: 'Genellikle 1-2 cm; eklem, spinal kanal ve anatomik bariyerlere göre' },
  { name: 'PTV', description: 'İmmobilizasyon, günlük IGRT ve kemik/eklem hareket belirsizliği.', dose, margin: 'Konvansiyonel IMRT için 3-5 mm; spinal/oligometastatik SBRT’de 1-3 mm' },
];
const oars: OARConstraint[] = [
  { organ: 'Spinal cord', metric: 'Dmax', limit: 45, unit: 'Gy', priority: 'mandatory', source: 'QUANTEC', sourceReference: 'Spinal giant-cell tumor planning objective' },
  { organ: 'Lung', metric: 'V20', limit: 30, unit: '%', priority: 'optimal', source: 'QUANTEC', sourceReference: 'Pulmonary metastasis planning objective' },
  { organ: 'Heart', metric: 'Dmean', limit: 15, unit: 'Gy', priority: 'optimal', source: 'protocol', sourceReference: 'Thoracic metastasis objective' },
  { organ: 'Bowel', metric: 'Dmax', limit: 54, unit: 'Gy', priority: 'mandatory', source: 'protocol', sourceReference: 'Pelvic giant-cell tumor objective' },
  { organ: 'Kidneys', metric: 'Dmean', limit: 18, unit: 'Gy', priority: 'optimal', source: 'protocol', sourceReference: 'Sacral/pelvic RT planning objective' },
];
const systemic = (setting: SystemicTherapyRecommendation['setting'], regimen: string, agents: string[], timing: string, evidenceLevel: SystemicTherapyRecommendation['evidenceLevel'] = '1'): SystemicTherapyRecommendation => ({ setting, regimen, agents, timing, evidenceLevel });
const references = (...extra: GuidelineReference[]): GuidelineReference[] => [NCCN, ASTRO, ESTRO, ...extra];

export class GiantCellTumorDecisionEngine extends BaseDecisionEngine<GiantCellTumorInput> {
  public readonly id = 'bone.giant-cell-tumor';
  public readonly version = '1.0.0';
  public readonly inputSchema = GIANT_CELL_TUMOR_INPUT_JSON_SCHEMA;
  public readonly outputSchema = GIANT_CELL_TUMOR_OUTPUT_JSON_SCHEMA;
  public constructor() { super('1.0.0'); }

  protected evaluateCase(input: GiantCellTumorInput): CDSSResult {
    const recommendations: ClinicalRecommendation[] = [];
    const rationale: string[] = [];
    const warnings: string[] = [];
    let rtIndication: CDSSResult['rtIndication'] = 'not-indicated';
    let intent: CDSSResult['intent'] = 'curative';
    const aggressive = input.riskGroup === 'locally-aggressive' || input.riskGroup === 'unresectable' || input.campanacciGrade === 3 || input.softTissueExtension === true || input.pathologicFracture === true;
    const unresectable = input.unresectable === true || input.primarySite === 'sacrum' || input.primarySite === 'spine' || input.primarySite === 'pelvis' && input.softTissueExtension === true;
    if (input.priorRadiotherapy) warnings.push('Önceki RT mevcut; spinal kord, bağırsak, böbrek, akciğer ve eklem/kemik kümülatif dozları re-irradiation uzmanı tarafından değerlendirilmelidir.');
    if (input.pathologicFracture) warnings.push('Patolojik kırıkta ortopedik onkoloji ile stabilizasyon, eklem rekonstrüksiyonu ve cerrahi morbidite değerlendirilmelidir.');
    if (input.lungMetastases) warnings.push('Akciğer metastazı mevcut; toraks BT, metastazektomi/SBRT uygunluğu ve sistemik denosumab yaklaşımı birlikte değerlendirilmelidir.');

    if (input.setting === 'newly-diagnosed' || input.setting === 'postoperative') {
      const dose = fraction(unresectable ? 60 : 50, unresectable ? 30 : 25, 'conventional', unresectable ? '60 Gy / 30 fx; unresectable veya seçilmiş lokal kontrol' : '50 Gy / 25 fx; seçilmiş rezidüel/nüks riski');
      recommendations.push({
        id: 'localized-giant-cell-tumor',
        label: unresectable ? 'Unresectable sakral/pelvik/spinal dev hücreli tümörde denosumab ve seçilmiş RT' : 'Küretaj/geniş rezeksiyon ve adjuvan RT’den genellikle kaçınma',
        indication: unresectable || aggressive && input.surgicalMargin !== 'R0' ? 'indicated' : 'not-indicated',
        intent: input.setting === 'postoperative' ? 'adjuvant' : 'curative',
        fractionation: unresectable ? dose : undefined, targetVolumes: unresectable ? targets(dose) : undefined, oarConstraints: unresectable ? oars : undefined,
        systemicTherapy: unresectable ? [systemic('neoadjuvant', 'Unresectable veya morbid anatomik bölgede RANKL inhibisyonu', ['denosumab'], 'Cerrahi küçültme/semptom kontrolü için; süre ve rebound riski ile kemik MDT’sinde', '1')] : undefined,
        rationale: [
          'Dev hücreli tümörde temel tedavi küretaj + lokal adjuvan yöntemler veya geniş en-blok rezeksiyondur; eklem yüzeyi, kırık, Campanacci grade ve rekonstrüksiyon ihtiyacı kararları belirler.',
          'RT rutin değildir; sacrum/spin/pelvis gibi rezeke edilemeyen veya cerrahinin kabul edilemez morbidite taşıdığı hastalarda, denosumab ve MDT değerlendirmesi sonrası seçilmiş definitif RT düşünülebilir.',
          'Denosumab cerrahi öncesi küçültme veya unresectable hastalıkta hastalık kontrolü sağlayabilir; kesilme sonrası rebound hiperkalsemi ve cerrahi planlama etkileri izlenmelidir.',
          'PACIFIC tipi konsolidasyon immünoterapisi, EGFR/ALK hedefli tedavi ve elektif nodal ışınlama dev hücreli tümör için uygun standartlar değildir.',
        ],
        guidelineReferences: references(TRIALS[0], TRIALS[1], TRIALS[2]),
      });
      rtIndication = unresectable || aggressive && input.surgicalMargin !== 'R0' ? 'indicated' : 'not-indicated';
      intent = input.setting === 'postoperative' ? 'adjuvant' : 'curative';
    } else if (input.setting === 'metastatic' || input.lungMetastases) {
      const dose = fraction(30, 5, 'SBRT', '30 Gy / 5 fx; seçilmiş pulmoner veya kemik metastazı');
      recommendations.push({
        id: 'metastatic-giant-cell-tumor',
        label: 'Metastatik dev hücreli tümörde denosumab, metastazektomi ve seçilmiş SBRT',
        indication: input.symptomaticDisease || input.lungMetastases ? 'indicated' : 'conditional', intent: 'palliative',
        fractionation: dose, targetVolumes: targets(dose, true), oarConstraints: oars,
        systemicTherapy: [systemic('palliative', 'Metastatik/ileri hastalıkta RANKL inhibisyonu', ['denosumab'], 'Akciğer metastazı, semptom ve cerrahi/SBRT ile birlikte', '1')],
        rationale: [
          'Akciğer metastazlarında metastazektomi veya seçilmiş SBRT; semptomatik kemik hedeflerinde stabilizasyon ve fokal RT değerlendirilir.',
          'Yaygın hastalıkta denosumab ana sistemik seçenektir; RT lokal semptom kontrolü içindir ve küratif torasik KRT şemaları rutin değildir.',
          'RTOG 0131/0631 doğrudan dev hücreli tümör kanıtı değildir; yalnızca seçilmiş stereotaktik kemik/spinal planlama çerçevesi olarak kullanılmalıdır.',
        ],
        guidelineReferences: references(TRIALS[0], TRIALS[3], TRIALS[4]),
      });
      rtIndication = input.symptomaticDisease || input.lungMetastases ? 'indicated' : 'conditional'; intent = 'palliative';
    } else if (input.setting === 'recurrent') {
      const dose = fraction(30, 10, 'moderate-hypofractionation', '30 Gy / 10 fx; seçilmiş lokal rekürrens');
      recommendations.push({
        id: 'recurrent-giant-cell-tumor',
        label: 'Lokal rekürren dev hücreli tümörde salvage cerrahi/denosumab ve seçilmiş RT',
        indication: input.symptomaticDisease ? 'indicated' : 'conditional', intent: 'salvage',
        fractionation: input.symptomaticDisease ? dose : undefined, targetVolumes: input.symptomaticDisease ? targets(dose, true) : undefined, oarConstraints: input.symptomaticDisease ? oars : undefined,
        systemicTherapy: [systemic('palliative', 'Rekürren veya unresectable hastalıkta denosumab', ['denosumab'], 'Cerrahi, semptom ve önceki tedaviye göre', '1')],
        rationale: ['Lokal rekürrenste tekrar küretaj/geniş rezeksiyon veya denosumab değerlendirilir; RT yalnızca seçilmiş unresectable/semptomatik odakta düşünülür.', 'Re-irradiation kümülatif dozlar, eklem/kemik iyileşmesi ve spinal/bağırsak riskleri ile sınırlandırılmalıdır.'],
        guidelineReferences: references(TRIALS[0], TRIALS[1], TRIALS[3]),
      });
      rtIndication = input.symptomaticDisease ? 'indicated' : 'conditional'; intent = 'salvage';
    } else {
      recommendations.push({
        id: 'giant-cell-tumor-surveillance', label: 'Tedavi sonrası dev hücreli tümör izlemi',
        indication: 'not-indicated', intent: 'observation',
        rationale: ['R0 veya kontrol edilmiş lokal hastalıkta rutin RT verilmez; primer bölge MRI/BT, akciğer görüntülemesi ve denosumab sonrası kalsiyum/kemik metabolizması izlenir.'],
        guidelineReferences: references(TRIALS[2]),
      });
      rtIndication = 'not-indicated'; intent = 'observation';
    }
    rationale.push('Bu motor dev hücreli kemik tümöründe ortopedik onkoloji, medikal onkoloji ve radyasyon onkolojisi MDT kararını destekler; patoloji, Campanacci/lokal agresiflik ve cerrahi morbidite RT’den önce değerlendirilmelidir.');
    return {
      schemaVersion: '1.0', engineId: this.id, engineVersion: this.version, caseId: input.caseId, organSystem: 'bone',
      rtIndication, intent, summary: recommendations[0]?.label ?? 'Dev hücreli tümör için kemik tümörü MDT değerlendirmesi gerekir.',
      recommendations, rationale, warnings,
      uncertainties: ['Aktif NCCN/ASTRO/ESTRO sürümü, Campanacci derecesi, MRI/BT, patolojik kırık, cerrahi seçenek, denosumab öyküsü, akciğer metastazı ve önceki RT dozları doğrulanmalıdır.'],
      confidence: 0.87, guidelineReferences: references(...TRIALS),
    };
  }
}

export const giantCellTumorEngine = new GiantCellTumorDecisionEngine();
