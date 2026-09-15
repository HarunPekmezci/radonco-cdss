import { BaseDecisionEngine } from '../base-engine';
import type {
  CDSSResult, ClinicalCaseInput, ClinicalRecommendation, Fractionation,
  GuidelineReference, JsonSchema, OARConstraint, SystemicTherapyRecommendation,
  TargetVolume, TNMStage,
} from '../../types/cdss';

export type ChondrosarcomaSetting = 'newly-diagnosed' | 'postoperative' | 'localized' | 'metastatic' | 'relapsed' | 'surveillance';
export type ChondrosarcomaRisk = 'low-grade-resectable' | 'high-grade-resectable' | 'unresectable' | 'metastatic' | 'recurrent' | 'unknown';
export type ChondrosarcomaSite = 'pelvis' | 'spine' | 'skull-base' | 'craniofacial' | 'extremity' | 'rib' | 'other' | 'unknown';
export type ChondrosarcomaHistology = 'conventional-grade-1' | 'conventional-grade-2' | 'conventional-grade-3' | 'dedifferentiated' | 'mesenchymal' | 'clear-cell' | 'unknown';
export type ChondrosarcomaSurgery = 'wide-resection' | 'hemipelvectomy' | 'craniofacial-resection' | 'endoscopic-skull-base-resection' | 'biopsy-only' | 'none' | 'unknown';

export interface ChondrosarcomaInput extends ClinicalCaseInput {
  organSystem: 'bone';
  disease: 'chondrosarcoma';
  setting: ChondrosarcomaSetting;
  riskGroup?: ChondrosarcomaRisk;
  stage?: TNMStage;
  primarySite?: ChondrosarcomaSite;
  histology?: ChondrosarcomaHistology;
  surgeryType?: ChondrosarcomaSurgery;
  surgicalMargin?: 'R0' | 'R1' | 'R2' | 'RX' | 'not-applicable';
  tumorSizeCm?: number;
  tumorVolumeMl?: number;
  metastaticDisease?: boolean;
  lungMetastases?: boolean;
  boneMetastases?: boolean;
  positiveMargin?: boolean;
  unresectable?: boolean;
  skullBaseOrCriticalStructureInvasion?: boolean;
  dedifferentiatedComponent?: boolean;
  localRecurrence?: boolean;
  priorRadiotherapy?: boolean;
  priorSystemicTherapy?: string[];
  symptomaticDisease?: boolean;
  performanceStatusECOG?: number;
  molecularFindings?: string[];
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
  title: 'ASTRO clinical practice resources for bone and soft-tissue sarcoma radiotherapy',
  url: 'https://www.astro.org/Patient-Care-and-Research/Clinical-Practice-Statements/Clinical-Practice-Guidelines',
  evidenceLevel: 'B',
};
const ESTRO: GuidelineReference = {
  organization: 'ESTRO',
  title: 'ESTRO clinical practice and consensus guidance for sarcoma radiotherapy',
  url: 'https://www.estro.org/Science/Guidelines',
  evidenceLevel: 'B',
};
const TRIALS: GuidelineReference[] = [
  { organization: 'other', title: 'Chondrosarcoma consensus: surgical and radiotherapy management of conventional and dedifferentiated disease', url: 'https://doi.org/10.1016/j.ejca.2018.08.013', evidenceLevel: 'B' },
  { organization: 'other', title: 'Particle therapy for skull-base and spinal chordoma/chondrosarcoma', url: 'https://doi.org/10.1016/j.ijrobp.2015.01.011', evidenceLevel: '2B' },
  { organization: 'other', title: 'NCI study of pembrolizumab in advanced sarcoma, including selected chondrosarcoma cohorts', url: 'https://clinicaltrials.gov/study/NCT02301039', evidenceLevel: '2B' },
  { organization: 'other', title: 'RTOG 0131: stereotactic radiotherapy framework for selected sarcoma metastases', url: 'https://clinicaltrials.gov/study/NCT00084305', evidenceLevel: '2B' },
  { organization: 'other', title: 'RTOG 0631: stereotactic spine radiotherapy quality framework', url: 'https://clinicaltrials.gov/study/NCT00340171', evidenceLevel: '1' },
];

export const CHONDROSARCOMA_INPUT_JSON_SCHEMA: JsonSchema = {
  $schema: 'http://json-schema.org/draft-07/schema#',
  $id: 'https://radonco.local/schema/chondrosarcoma-input.json',
  title: 'Chondrosarcoma clinical case input', type: 'object',
  required: ['organSystem', 'disease', 'setting'],
  properties: {
    organSystem: { type: 'string', enum: ['bone'] }, disease: { type: 'string', enum: ['chondrosarcoma'] },
    setting: { type: 'string', enum: ['newly-diagnosed', 'postoperative', 'localized', 'metastatic', 'relapsed', 'surveillance'] },
    riskGroup: { type: 'string', enum: ['low-grade-resectable', 'high-grade-resectable', 'unresectable', 'metastatic', 'recurrent', 'unknown'] },
    stage: { type: 'object', additionalProperties: true },
    primarySite: { type: 'string', enum: ['pelvis', 'spine', 'skull-base', 'craniofacial', 'extremity', 'rib', 'other', 'unknown'] },
    histology: { type: 'string', enum: ['conventional-grade-1', 'conventional-grade-2', 'conventional-grade-3', 'dedifferentiated', 'mesenchymal', 'clear-cell', 'unknown'] },
    surgeryType: { type: 'string' }, surgicalMargin: { type: 'string' }, tumorSizeCm: { type: 'number' }, tumorVolumeMl: { type: 'number' },
    metastaticDisease: { type: 'boolean' }, lungMetastases: { type: 'boolean' }, boneMetastases: { type: 'boolean' },
    positiveMargin: { type: 'boolean' }, unresectable: { type: 'boolean' }, skullBaseOrCriticalStructureInvasion: { type: 'boolean' },
    dedifferentiatedComponent: { type: 'boolean' }, localRecurrence: { type: 'boolean' }, priorRadiotherapy: { type: 'boolean' },
    priorSystemicTherapy: { type: 'array', items: { type: 'string' } }, symptomaticDisease: { type: 'boolean' },
    performanceStatusECOG: { type: 'number' }, molecularFindings: { type: 'array', items: { type: 'string' } },
  }, additionalProperties: true,
};

export const CHONDROSARCOMA_OUTPUT_JSON_SCHEMA: JsonSchema = {
  $schema: 'http://json-schema.org/draft-07/schema#', $id: 'https://radonco.local/schema/chondrosarcoma-result.json',
  title: 'Chondrosarcoma CDSS result', type: 'object',
  required: ['schemaVersion', 'engineId', 'engineVersion', 'organSystem', 'rtIndication', 'intent', 'summary', 'recommendations'],
  properties: {
    schemaVersion: { type: 'string', enum: ['1.0'] }, engineId: { type: 'string', enum: ['bone.chondrosarcoma'] },
    engineVersion: { type: 'string' }, organSystem: { type: 'string', enum: ['bone'] }, rtIndication: { type: 'string' },
    intent: { type: 'string' }, summary: { type: 'string' }, recommendations: { type: 'array', items: { type: 'object', additionalProperties: true } },
    warnings: { type: 'array', items: { type: 'string' } }, guidelineReferences: { type: 'array', items: { type: 'object', additionalProperties: true } },
  }, additionalProperties: true,
};

const fraction = (totalDoseGy: number, fractions: number, className: Fractionation['class'], schedule: string, technique: Fractionation['technique'] = 'IMRT'): Fractionation => ({
  class: className, totalDoseGy, fractions, dosePerFractionGy: totalDoseGy / fractions, schedule, technique,
  alphaBetaTumor: 10, bedGy: totalDoseGy * (1 + totalDoseGy / fractions / 10), eqd2Gy: totalDoseGy * ((totalDoseGy / fractions + 10) / 12),
});
const targets = (dose: Fractionation, metastasis = false): TargetVolume[] => [
  { name: 'GTV', description: metastasis ? 'Makroskopik primer, rezidüel hastalık veya seçilmiş akciğer/kemik metastazı.' : 'MRI/CT/PET ile belirlenen kondrosarkom ve postoperatif yatak.', dose, margin: 'Başlangıç görüntüleme, cerrahi klipler ve anatomik füzyonla' },
  { name: 'CTV', description: 'Primer tümör yatağı ve subklinik kemik/soft-tissue yayılım alanı; kritik organ komşuluğuna göre bireyselleştirilir.', dose, margin: 'Genellikle 1-2 cm; pelvis/spinde longitudinal yayılım ve kafa tabanı perinöral yolları dikkate alınır' },
  { name: 'PTV', description: 'Immobilizasyon, MRI/CT füzyon ve günlük IGRT belirsizliği.', dose, margin: 'IMRT/proton için 3-5 mm; stereotaktik metastazda 1-3 mm' },
];
const oars: OARConstraint[] = [
  { organ: 'Spinal cord', metric: 'Dmax', limit: 45, unit: 'Gy', priority: 'mandatory', source: 'QUANTEC', sourceReference: 'Spinal chondrosarcoma planning objective' },
  { organ: 'Brainstem', metric: 'Dmax', limit: 54, unit: 'Gy', priority: 'mandatory', source: 'QUANTEC', sourceReference: 'Skull-base chondrosarcoma objective' },
  { organ: 'Optic pathways', metric: 'Dmax', limit: 54, unit: 'Gy', priority: 'mandatory', source: 'QUANTEC', sourceReference: 'Skull-base chondrosarcoma objective' },
  { organ: 'Lung', metric: 'V20', limit: 30, unit: '%', priority: 'optimal', source: 'QUANTEC', sourceReference: 'Thoracic metastasis planning objective' },
  { organ: 'Heart', metric: 'Dmean', limit: 15, unit: 'Gy', priority: 'optimal', source: 'protocol', sourceReference: 'Thoracic sarcoma planning objective' },
  { organ: 'Bowel', metric: 'Dmax', limit: 54, unit: 'Gy', priority: 'mandatory', source: 'protocol', sourceReference: 'Pelvic chondrosarcoma objective' },
];
const systemic = (setting: SystemicTherapyRecommendation['setting'], regimen: string, agents: string[], timing: string, evidenceLevel: SystemicTherapyRecommendation['evidenceLevel'] = '2A'): SystemicTherapyRecommendation => ({ setting, regimen, agents, timing, evidenceLevel });
const references = (...extra: GuidelineReference[]): GuidelineReference[] => [NCCN, ASTRO, ESTRO, ...extra];

export class ChondrosarcomaDecisionEngine extends BaseDecisionEngine<ChondrosarcomaInput> {
  public readonly id = 'bone.chondrosarcoma';
  public readonly version = '1.0.0';
  public readonly inputSchema = CHONDROSARCOMA_INPUT_JSON_SCHEMA;
  public readonly outputSchema = CHONDROSARCOMA_OUTPUT_JSON_SCHEMA;
  public constructor() { super('1.0.0'); }

  protected evaluateCase(input: ChondrosarcomaInput): CDSSResult {
    const recommendations: ClinicalRecommendation[] = [];
    const rationale: string[] = [];
    const warnings: string[] = [];
    let rtIndication: CDSSResult['rtIndication'] = 'conditional';
    let intent: CDSSResult['intent'] = 'curative';
    const metastatic = input.metastaticDisease === true || input.lungMetastases === true || input.boneMetastases === true || input.riskGroup === 'metastatic';
    const highRisk = input.positiveMargin === true || input.surgicalMargin === 'R1' || input.surgicalMargin === 'R2' || input.unresectable === true || input.skullBaseOrCriticalStructureInvasion === true || input.histology === 'conventional-grade-3' || input.histology === 'dedifferentiated' || input.dedifferentiatedComponent === true || input.localRecurrence === true || input.riskGroup === 'high-grade-resectable';
    if (input.priorRadiotherapy) warnings.push('Önceki RT mevcut; spinal kord, beyin sapı, optik yollar, bağırsak, akciğer ve kalp kümülatif dozları re-irradiation uzmanı tarafından değerlendirilmelidir.');
    if (input.primarySite === 'skull-base' || input.primarySite === 'spine') warnings.push('Kafa tabanı/spinal hastalıkta nöroşirürji, kafa tabanı cerrahisi ve proton/partikül planlama konusunda uzman MDT gerekir.');
    if (input.lungMetastases || input.boneMetastases) warnings.push('Metastatik hastalıkta PET-CT, toraks BT ve tüm kemik MRI ile metastaz yükü ve komplet metastazektomi/SBRT uygunluğu değerlendirilmelidir.');

    if (input.setting === 'newly-diagnosed' || input.setting === 'localized' || input.setting === 'postoperative') {
      const dose = fraction(input.primarySite === 'skull-base' || input.primarySite === 'spine' ? 70 : 66, input.primarySite === 'skull-base' || input.primarySite === 'spine' ? 35 : 33, 'conventional', '66-70 Gy / 33-35 fx; unresectable, kritik anatomik bölge veya yüksek riskli rezidüel hastalık', input.primarySite === 'skull-base' || input.primarySite === 'spine' ? 'IGRT' : 'IMRT');
      recommendations.push({
        id: 'localized-chondrosarcoma',
        label: highRisk ? 'Yüksek riskli/rezidüel kondrosarkomda R0 cerrahi yeniden değerlendirme ve yüksek doz RT' : 'Geniş R0 cerrahi; düşük dereceli hastalıkta RT’den kaçınma',
        indication: highRisk ? 'indicated' : 'conditional',
        intent: input.setting === 'postoperative' ? 'adjuvant' : 'curative',
        fractionation: highRisk ? dose : undefined, targetVolumes: highRisk ? targets(dose) : undefined, oarConstraints: highRisk ? oars : undefined,
        systemicTherapy: input.histology === 'dedifferentiated' || input.dedifferentiatedComponent ? [systemic('adjuvant', 'Dediferansiye kondrosarkomda seçilmiş sarcoma kemoterapisi/klinik çalışma', ['doxorubicin ± ifosfamide; histoloji ve MDT’ye göre'], 'Cerrahi ve RT ile birlikte yalnızca seçilmiş yüksek riskli olguda', '2B')] : undefined,
        rationale: [
          'Konvansiyonel kondrosarkomda geniş en-blok R0 cerrahi temel tedavidir; düşük dereceli, tamamen rezeke R0 hastalıkta adjuvan RT ve rutin kemoterapi çoğunlukla gerekmez.',
          'RT; unresectable veya kritik yapı invazyonlu kafa tabanı/spinal hastalıkta, R1/R2 marjinde, lokal rekürrenste ve cerrahi morbiditesi yüksek pelvik/aksiyel hastalıkta yüksek doz IMRT/proton olarak düşünülür.',
          'Kondrosarkom görece radyo-rezistan olduğundan 66-70 Gy aralığı ve proton/partikül ile normal doku korunması seçilmiş hastalarda önemlidir; doz kritik organ toleransına göre sınırlandırılır.',
          'PACIFIC benzeri konsolidasyon immünoterapisi ve rutin elektif nodal ışınlama kondrosarkom standardı değildir; sistemik/ hedefli tedaviler histoloji ve klinik çalışma bağlamında verilmelidir.',
        ],
        guidelineReferences: references(TRIALS[0], TRIALS[1], TRIALS[4]),
      });
      rtIndication = highRisk ? 'indicated' : 'conditional'; intent = input.setting === 'postoperative' ? 'adjuvant' : 'curative';
    } else if (metastatic) {
      const dose = fraction(30, 5, 'SBRT', '30 Gy / 5 fx; seçilmiş oligometastatik akciğer/kemik hedefi');
      recommendations.push({
        id: 'metastatic-chondrosarcoma',
        label: 'Metastatik kondrosarkomda metastazektomi ve seçilmiş SBRT/RT; sistemik/klinik çalışma',
        indication: input.symptomaticDisease || input.lungMetastases || input.boneMetastases ? 'indicated' : 'conditional',
        intent: 'palliative', fractionation: dose, targetVolumes: targets(dose, true), oarConstraints: oars,
        systemicTherapy: [systemic('palliative', 'İleri kondrosarkomda klinik çalışma veya histolojiye göre sistemik tedavi', ['pazopanib veya regorafenib seçilmiş olguda', 'IDH1 hedefli yaklaşım/klinik çalışma', 'immünoterapi klinik çalışma'], 'Metastazektomi/SBRT ve moleküler profile göre', '2B')],
        rationale: [
          'Oligometastatik akciğer hastalığında metastazektomi veya SBRT; semptomatik kemik metastazında cerrahi stabilizasyon ve RT değerlendirilir.',
          'Yaygın metastatik kondrosarkomda sistemik seçenekler sınırlıdır; klinik çalışma ve moleküler hedef (ör. IDH1) araştırması önceliklidir.',
          'RTOG 0131/0631 çerçeveleri seçilmiş stereotaktik metastaz/spin planlamasına yardımcı olabilir ancak kondrosarkoma özgü randomize kanıt değildir.',
        ],
        guidelineReferences: references(TRIALS[2], TRIALS[3], TRIALS[4]),
      });
      rtIndication = input.symptomaticDisease || input.lungMetastases || input.boneMetastases ? 'indicated' : 'conditional'; intent = 'palliative';
    } else if (input.setting === 'relapsed') {
      const dose = fraction(30, 10, 'moderate-hypofractionation', '30 Gy / 10 fx; seçilmiş lokal relaps veya semptomatik odak');
      recommendations.push({
        id: 'relapsed-chondrosarcoma',
        label: 'Lokal relaps kondrosarkomda salvage cerrahi ve seçilmiş RT/re-irradiation',
        indication: input.symptomaticDisease ? 'indicated' : 'conditional', intent: 'salvage',
        fractionation: input.symptomaticDisease ? dose : undefined, targetVolumes: input.symptomaticDisease ? targets(dose, true) : undefined, oarConstraints: input.symptomaticDisease ? oars : undefined,
        rationale: ['Lokal relapsta mümkünse komplet cerrahi rezeksiyon ilk seçenektir; RT/re-irradiation kümülatif doz, kritik yapı ve cerrahi seçeneklerle birlikte tartılır.', 'Kafa tabanı/spinal relapsta proton/partikül veya yüksek hassasiyetli IMRT, normal doku dozlarını azaltmak için uzman merkezde planlanmalıdır.'],
        guidelineReferences: references(TRIALS[0], TRIALS[1], TRIALS[3]),
      });
      rtIndication = input.symptomaticDisease ? 'indicated' : 'conditional'; intent = 'salvage';
    } else {
      recommendations.push({
        id: 'chondrosarcoma-surveillance', label: 'Tedavi sonrası kondrosarkom izlemi',
        indication: 'not-indicated', intent: 'observation',
        rationale: ['R0 rezeksiyon sonrası rutin RT verilmez; primer bölge MRI/BT ve akciğer görüntülemesiyle lokal nüks/metastaz izlemi sürdürülür.'],
        guidelineReferences: references(TRIALS[0]),
      });
      rtIndication = 'not-indicated'; intent = 'observation';
    }
    rationale.push('Bu motor kondrosarkomda ortopedik/kafa tabanı cerrahisi, medikal onkoloji, radyasyon onkolojisi ve proton/partikül planlama MDT kararını destekler; güncel patoloji ve anatomik rezeke edilebilirlik tedavinin temelidir.');
    return {
      schemaVersion: '1.0', engineId: this.id, engineVersion: this.version, caseId: input.caseId, organSystem: 'bone',
      rtIndication, intent, summary: recommendations[0]?.label ?? 'Kondrosarkom için sarkom MDT değerlendirmesi gerekir.',
      recommendations, rationale, warnings,
      uncertainties: ['Aktif NCCN/ASTRO/ESTRO sürümü, derece/histoloji, MRI/PET-CT, cerrahi marjin, kafa tabanı/spinal kritik yapı ilişkisi, metastaz yükü ve önceki RT dozları doğrulanmalıdır.'],
      confidence: 0.88, guidelineReferences: references(...TRIALS),
    };
  }
}

export const chondrosarcomaEngine = new ChondrosarcomaDecisionEngine();
