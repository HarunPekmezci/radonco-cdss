import { BaseDecisionEngine } from '../base-engine';
import type {
  CDSSResult, ClinicalCaseInput, ClinicalRecommendation, Fractionation,
  GuidelineReference, JsonSchema, OARConstraint, SystemicTherapyRecommendation,
  TargetVolume, TNMStage,
} from '../../types/cdss';

export type OsteosarcomaSetting = 'newly-diagnosed' | 'postoperative' | 'localized' | 'metastatic' | 'relapsed' | 'surveillance';
export type OsteosarcomaRisk = 'localized-resectable' | 'localized-high-risk' | 'pulmonary-metastatic' | 'bone-metastatic' | 'multifocal' | 'relapsed' | 'unknown';
export type OsteosarcomaSite = 'femur' | 'tibia' | 'humerus' | 'pelvis' | 'spine' | 'craniofacial' | 'rib' | 'other' | 'unknown';
export type OsteosarcomaHistology = 'conventional-high-grade' | 'telangiectatic' | 'parosteal-low-grade' | 'periosteal-intermediate-grade' | 'secondary' | 'unknown';
export type OsteosarcomaSurgery = 'limb-sparing-resection' | 'hemipelvectomy' | 'amputation' | 'craniofacial-resection' | 'biopsy-only' | 'none' | 'unknown';

export interface OsteosarcomaInput extends ClinicalCaseInput {
  organSystem: 'bone';
  disease: 'osteosarcoma';
  setting: OsteosarcomaSetting;
  riskGroup?: OsteosarcomaRisk;
  stage?: TNMStage;
  primarySite?: OsteosarcomaSite;
  histology?: OsteosarcomaHistology;
  surgeryType?: OsteosarcomaSurgery;
  surgicalMargin?: 'R0' | 'R1' | 'R2' | 'RX' | 'not-applicable';
  tumorSizeCm?: number;
  tumorVolumeMl?: number;
  metastaticDisease?: boolean;
  pulmonaryMetastases?: boolean;
  boneMetastases?: boolean;
  nodalMetastases?: boolean;
  poorHistologicResponse?: boolean;
  necrosisPercent?: number;
  positiveMargin?: boolean;
  unresectable?: boolean;
  pathologicFracture?: boolean;
  priorRadiotherapy?: boolean;
  priorChemotherapy?: string[];
  symptomaticDisease?: boolean;
  ageYears?: number;
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
  { organization: 'other', title: 'EURAMOS-1: MAP-based risk-adapted therapy in osteosarcoma', url: 'https://clinicaltrials.gov/study/NCT00134030', evidenceLevel: '1' },
  { organization: 'other', title: 'EURAMOS-1 maintenance interferon-alpha after MAP', url: 'https://doi.org/10.1016/S0140-6736(15)00300-7', evidenceLevel: '1' },
  { organization: 'other', title: 'COG INT-0133: doxorubicin/cisplatin/methotrexate-based osteosarcoma therapy', url: 'https://clinicaltrials.gov/study/NCT00002611', evidenceLevel: '1' },
  { organization: 'other', title: 'RTOG 0131: stereotactic radiotherapy framework for selected sarcoma metastases', url: 'https://clinicaltrials.gov/study/NCT00084305', evidenceLevel: '2B' },
  { organization: 'other', title: 'International consensus on osteosarcoma local control and radiotherapy', url: 'https://doi.org/10.1016/j.ejca.2018.08.013', evidenceLevel: 'B' },
];

export const OSTEOSARCOMA_INPUT_JSON_SCHEMA: JsonSchema = {
  $schema: 'http://json-schema.org/draft-07/schema#',
  $id: 'https://radonco.local/schema/osteosarcoma-input.json',
  title: 'Osteosarcoma clinical case input',
  type: 'object',
  required: ['organSystem', 'disease', 'setting'],
  properties: {
    organSystem: { type: 'string', enum: ['bone'] }, disease: { type: 'string', enum: ['osteosarcoma'] },
    setting: { type: 'string', enum: ['newly-diagnosed', 'postoperative', 'localized', 'metastatic', 'relapsed', 'surveillance'] },
    riskGroup: { type: 'string', enum: ['localized-resectable', 'localized-high-risk', 'pulmonary-metastatic', 'bone-metastatic', 'multifocal', 'relapsed', 'unknown'] },
    stage: { type: 'object', additionalProperties: true },
    primarySite: { type: 'string', enum: ['femur', 'tibia', 'humerus', 'pelvis', 'spine', 'craniofacial', 'rib', 'other', 'unknown'] },
    histology: { type: 'string' }, surgeryType: { type: 'string' }, surgicalMargin: { type: 'string' },
    tumorSizeCm: { type: 'number' }, tumorVolumeMl: { type: 'number' }, metastaticDisease: { type: 'boolean' },
    pulmonaryMetastases: { type: 'boolean' }, boneMetastases: { type: 'boolean' }, nodalMetastases: { type: 'boolean' },
    poorHistologicResponse: { type: 'boolean' }, necrosisPercent: { type: 'number' }, positiveMargin: { type: 'boolean' },
    unresectable: { type: 'boolean' }, pathologicFracture: { type: 'boolean' }, priorRadiotherapy: { type: 'boolean' },
    priorChemotherapy: { type: 'array', items: { type: 'string' } }, symptomaticDisease: { type: 'boolean' },
    ageYears: { type: 'number' }, performanceStatusECOG: { type: 'number' }, molecularFindings: { type: 'array', items: { type: 'string' } },
  }, additionalProperties: true,
};

export const OSTEOSARCOMA_OUTPUT_JSON_SCHEMA: JsonSchema = {
  $schema: 'http://json-schema.org/draft-07/schema#',
  $id: 'https://radonco.local/schema/osteosarcoma-result.json',
  title: 'Osteosarcoma CDSS result', type: 'object',
  required: ['schemaVersion', 'engineId', 'engineVersion', 'organSystem', 'rtIndication', 'intent', 'summary', 'recommendations'],
  properties: {
    schemaVersion: { type: 'string', enum: ['1.0'] }, engineId: { type: 'string', enum: ['bone.osteosarcoma'] },
    engineVersion: { type: 'string' }, organSystem: { type: 'string', enum: ['bone'] }, rtIndication: { type: 'string' },
    intent: { type: 'string' }, summary: { type: 'string' }, recommendations: { type: 'array', items: { type: 'object', additionalProperties: true } },
    warnings: { type: 'array', items: { type: 'string' } }, guidelineReferences: { type: 'array', items: { type: 'object', additionalProperties: true } },
  }, additionalProperties: true,
};

const fraction = (totalDoseGy: number, fractions: number, className: Fractionation['class'], schedule: string, technique: Fractionation['technique'] = 'IMRT'): Fractionation => ({
  class: className, totalDoseGy, fractions, dosePerFractionGy: totalDoseGy / fractions, schedule, technique,
  alphaBetaTumor: 10, bedGy: totalDoseGy * (1 + totalDoseGy / fractions / 10), eqd2Gy: totalDoseGy * ((totalDoseGy / fractions + 10) / 12),
});
const targets = (dose: Fractionation, metastatic = false): TargetVolume[] => [
  { name: 'GTV', description: metastatic ? 'Makroskopik primer, rezidüel hastalık veya seçilmiş akciğer/kemik metastazı.' : 'Başlangıç MRI/BT/PET ile tanımlanan primer kemik tümörü ve postoperatif yatak.', dose, margin: 'Başlangıç görüntüleme, cerrahi klipler ve kemik anatomisiyle füzyon' },
  { name: 'CTV', description: 'Tümör yatağı, biyopsi yolu ve mikroskopik kemik/soft-tissue yayılım alanı.', dose, margin: 'Genellikle longitudinal 2-3 cm ve radial 1-2 cm; eklem/anatomik bariyer ve protokole göre' },
  { name: 'PTV', description: 'Pediatrik immobilizasyon, kurulum ve hareket belirsizliği.', dose, margin: 'Genellikle 3-5 mm; torasik metastazda 4D-CT ve IGRT ile' },
];
const oars: OARConstraint[] = [
  { organ: 'Spinal cord', metric: 'Dmax', limit: 45, unit: 'Gy', priority: 'mandatory', source: 'QUANTEC', sourceReference: 'Spinal/para-spinal osteosarcoma RT objective' },
  { organ: 'Lung', metric: 'V20', limit: 30, unit: '%', priority: 'optimal', source: 'QUANTEC', sourceReference: 'Pulmonary metastasis planning objective' },
  { organ: 'Heart', metric: 'Dmean', limit: 15, unit: 'Gy', priority: 'optimal', source: 'protocol', sourceReference: 'Pediatric thoracic sarcoma objective' },
  { organ: 'Kidneys', metric: 'Dmean', limit: 18, unit: 'Gy', priority: 'optimal', source: 'protocol', sourceReference: 'Pelvic/abdominal osteosarcoma objective' },
  { organ: 'Bowel', metric: 'Dmax', limit: 54, unit: 'Gy', priority: 'mandatory', source: 'protocol', sourceReference: 'Pelvic osteosarcoma objective' },
  { organ: 'Growth plates', metric: 'Dmean', limit: 20, unit: 'Gy', priority: 'optimal', source: 'protocol', sourceReference: 'Pediatric growth preservation objective' },
];
const systemic = (setting: SystemicTherapyRecommendation['setting'], regimen: string, agents: string[], timing: string, evidenceLevel: SystemicTherapyRecommendation['evidenceLevel'] = '1'): SystemicTherapyRecommendation => ({ setting, regimen, agents, timing, evidenceLevel });
const references = (...extra: GuidelineReference[]): GuidelineReference[] => [NCCN, ASTRO, ESTRO, ...extra];

export class OsteosarcomaDecisionEngine extends BaseDecisionEngine<OsteosarcomaInput> {
  public readonly id = 'bone.osteosarcoma';
  public readonly version = '1.0.0';
  public readonly inputSchema = OSTEOSARCOMA_INPUT_JSON_SCHEMA;
  public readonly outputSchema = OSTEOSARCOMA_OUTPUT_JSON_SCHEMA;
  public constructor() { super('1.0.0'); }

  protected evaluateCase(input: OsteosarcomaInput): CDSSResult {
    const recommendations: ClinicalRecommendation[] = [];
    const rationale: string[] = [];
    const warnings: string[] = [];
    let rtIndication: CDSSResult['rtIndication'] = 'conditional';
    let intent: CDSSResult['intent'] = 'curative';
    const metastatic = input.metastaticDisease === true || input.pulmonaryMetastases === true || input.boneMetastases === true || input.riskGroup === 'pulmonary-metastatic' || input.riskGroup === 'bone-metastatic' || input.riskGroup === 'multifocal';
    const highRiskLocal = input.positiveMargin === true || input.surgicalMargin === 'R1' || input.surgicalMargin === 'R2' || input.unresectable === true || input.poorHistologicResponse === true || input.tumorSizeCm !== undefined && input.tumorSizeCm > 8 || input.riskGroup === 'localized-high-risk';
    if (input.priorRadiotherapy) warnings.push('Önceki RT mevcut; büyüme plakları, spinal kord, bağırsak, böbrek, kalp ve akciğer kümülatif dozları pediatrik re-irradiation uzmanı tarafından değerlendirilmelidir.');
    if (input.pathologicFracture) warnings.push('Patolojik kırıkta ortopedik onkoloji ile stabilizasyon ve cerrahi rezeke edilebilirlik acilen değerlendirilmelidir.');
    if (input.primarySite === 'spine' || input.primarySite === 'pelvis') warnings.push('Spinal/pelvik yerleşimde nörolojik yapı, büyük damar, bağırsak ve mesane ilişkisi için uzman sarkom MDT planlaması gerekir.');
    if (input.pulmonaryMetastases || input.boneMetastases) warnings.push('Metastatik hastalıkta toraks BT/PET-CT ve tüm kemik MRI ile metastaz yükü; pulmoner metastazektomi/SBRT veya kemik lokal tedavisi sistemik yanıtla birlikte değerlendirilmelidir.');

    if (input.setting === 'newly-diagnosed' || input.setting === 'localized' || input.setting === 'postoperative') {
      const dose = fraction(highRiskLocal ? 60 : 50.4, highRiskLocal ? 30 : 28, 'conventional', highRiskLocal ? '60 Gy / 30 fx; unresectable veya mikroskopik/makroskopik rezidüel hastalık' : '50.4 Gy / 28 fx; seçilmiş mikroskopik risk alanı');
      recommendations.push({
        id: 'localized-osteosarcoma',
        label: highRiskLocal ? 'MAP kemoterapisi sonrası yüksek riskli/rezidüel osteosarkomda lokal RT ve cerrahi yeniden değerlendirme' : 'Neoadjuvan MAP, R0 rezeksiyon ve histolojik yanıta göre RT’den kaçınma',
        indication: highRiskLocal ? 'indicated' : 'conditional',
        intent: input.setting === 'postoperative' ? 'adjuvant' : 'curative',
        fractionation: highRiskLocal ? dose : undefined, targetVolumes: highRiskLocal ? targets(dose) : undefined, oarConstraints: highRiskLocal ? oars : undefined,
        systemicTherapy: [
          systemic('neoadjuvant', 'MAP kemoterapisi', ['yüksek doz metotreksat', 'doxorubicin', 'cisplatin'], 'Cerrahi öncesi; pediatrik/AYA osteosarkom protokolüne göre', '1'),
          systemic('adjuvant', 'Cerrahi sonrası MAP konsolidasyonu', ['yüksek doz metotreksat', 'doxorubicin', 'cisplatin'], 'R0/R1 durumu ve nekroz yanıtına göre protokol tamamlanır', '1'),
        ],
        rationale: [
          'Yüksek dereceli osteosarkomda sistemik MAP ve güvenli R0 geniş rezeksiyon temel tedavidir; ekstremite koruyucu cerrahi mümkün değilse amputation/hemipelvectomy değerlendirilir.',
          'RT, osteosarkomda rutin adjuvan tedavi değildir; unresectable hastalık, R1/R2 marjin, yetersiz lokal kontrol, kritik anatomik bölgeler veya seçilmiş craniofacial/spinal olgularda düşünülür.',
          'Cerrahi öncesi başlangıç tümör hacmi ve biyopsi traktı hedeflenmelidir; postoperatif RT yalnızca lokal kontrol yararı toksisiteyi aştığında uygulanır.',
          'PACIFIC tipi konsolidasyon immünoterapisi, EGFR/ALK hedefli tedavi ve rutin elektif nodal ışınlama osteosarkom standardı değildir; metastatik/relaps yaklaşım klinik çalışma ve sarkom MDT’sine dayanır.',
        ],
        guidelineReferences: references(TRIALS[0], TRIALS[1], TRIALS[2], TRIALS[4]),
      });
      rtIndication = highRiskLocal ? 'indicated' : 'conditional';
      intent = input.setting === 'postoperative' ? 'adjuvant' : 'curative';
    } else if (metastatic) {
      const dose = fraction(45, 15, 'moderate-hypofractionation', '45 Gy / 15 fx; seçilmiş lokal/metastatik kontrol');
      const sbrt = fraction(30, 5, 'SBRT', '30 Gy / 5 fx; küçük, sınırlı ve kritik yapılardan uzak metastaz');
      recommendations.push({
        id: 'metastatic-osteosarcoma',
        label: 'Metastatik osteosarkomda sistemik tedavi, metastazektomi ve seçilmiş RT/SBRT',
        indication: input.symptomaticDisease || input.pulmonaryMetastases || input.boneMetastases ? 'indicated' : 'conditional',
        intent: 'curative', fractionation: input.symptomaticDisease ? dose : sbrt, targetVolumes: targets(input.symptomaticDisease ? dose : sbrt, true), oarConstraints: oars,
        systemicTherapy: [systemic('induction', 'Metastatik osteosarkom için MAP veya relaps uyumlu sistemik tedavi', ['doxorubicin', 'cisplatin', 'yüksek doz metotreksat', 'ifosfamide/etoposide veya klinik çalışma'], 'Metastazektomi ve lokal RT/SBRT kararıyla birlikte', '2A')],
        rationale: [
          'Pulmoner metastazda tam metastazektomi mümkünse cerrahi, seçilmiş küçük/rezidüel odaklarda SBRT veya ablasyon değerlendirilebilir; kemik metastazında cerrahi stabilizasyon ve fokal RT semptom/lokal kontrol sağlar.',
          'Sistemik tedavi ve metastaz yükü belirlenmeden torasik 60-66 Gy eşzamanlı KRT uygulanmaz; akciğer OAR’ları metastatik SBRT planında korunmalıdır.',
          'İyi yanıt veren sınırlı metastatik hastalıkta küratif niyetli multimodal yaklaşım, yaygın hastalıkta ise semptom kontrolü ve klinik çalışma önceliklidir.',
        ],
        guidelineReferences: references(TRIALS[0], TRIALS[3], TRIALS[4]),
      });
      rtIndication = input.symptomaticDisease || input.pulmonaryMetastases || input.boneMetastases ? 'indicated' : 'conditional';
      intent = 'curative';
    } else if (input.setting === 'relapsed') {
      const dose = fraction(30, 10, 'moderate-hypofractionation', '30 Gy / 10 fx; seçilmiş lokal relaps veya semptomatik metastaz');
      recommendations.push({
        id: 'relapsed-osteosarcoma',
        label: 'Relaps osteosarkomda kurtarma tedavisi/klinik çalışma ve seçilmiş fokal RT',
        indication: input.symptomaticDisease ? 'indicated' : 'conditional', intent: 'salvage',
        fractionation: input.symptomaticDisease ? dose : undefined, targetVolumes: input.symptomaticDisease ? targets(dose, true) : undefined, oarConstraints: input.symptomaticDisease ? oars : undefined,
        systemicTherapy: [systemic('palliative', 'Relaps osteosarkom için kurtarma kemoterapisi veya klinik çalışma', ['ifosfamide', 'etoposide', 'gemcitabine + docetaxel', 'regorafenib veya klinik çalışma'], 'Önceki MAP, organ fonksiyonu ve metastaz paternine göre', '2A')],
        rationale: [
          'Relaps osteosarkomda yeniden evreleme, rezektabilite ve klinik çalışma uygunluğu önceliklidir; mümkünse metastazektomi veya komplet lokal rezeksiyon düşünülür.',
          'RT ağrı, nörolojik tehdit, kanama veya sınırlı oligorelaps için seçilebilir; re-irradiation kümülatif dozla sınırlıdır.',
          'RTOG 0131 doğrudan osteosarkom standardı değildir; stereotaktik sarcoma metastaz planlama çerçevesi olarak sınırlı yorumlanmalıdır.',
        ],
        guidelineReferences: references(TRIALS[1], TRIALS[3]),
      });
      rtIndication = input.symptomaticDisease ? 'indicated' : 'conditional';
      intent = 'salvage';
    } else {
      recommendations.push({
        id: 'osteosarcoma-surveillance', label: 'Tedavi sonrası pediatrik/AYA osteosarkom izlemi',
        indication: 'not-indicated', intent: 'observation',
        rationale: ['Remisyonda rutin RT yerine primer bölge MRI/BT, toraks BT, lokal nüks ve pulmoner metastaz izlemi; kardiyak, renal, işitme, fertilite ve büyüme geç etkileri takip edilmelidir.'],
        guidelineReferences: references(TRIALS[0]),
      });
      rtIndication = 'not-indicated'; intent = 'observation';
    }
    rationale.push('Bu motor osteosarkomda ortopedik onkoloji, pediatrik/AYA medikal onkoloji, radyasyon onkolojisi ve rehabilitasyon MDT kararını destekler; RT cerrahi ve MAP sistemik tedavinin yerine geçmez.');
    return {
      schemaVersion: '1.0', engineId: this.id, engineVersion: this.version, caseId: input.caseId, organSystem: 'bone',
      rtIndication, intent, summary: recommendations[0]?.label ?? 'Osteosarkom için sarkom MDT değerlendirmesi gerekir.',
      recommendations, rationale, warnings,
      uncertainties: ['Aktif NCCN/ASTRO/ESTRO sürümü, biyopsi/patoloji, başlangıç tümör hacmi, cerrahi marjin, nekroz oranı, metastatik evre, önceki MAP/RT ve pediatrik/AYA protokolü doğrulanmalıdır.'],
      confidence: 0.89, guidelineReferences: references(...TRIALS),
    };
  }
}

export const osteosarcomaEngine = new OsteosarcomaDecisionEngine();
