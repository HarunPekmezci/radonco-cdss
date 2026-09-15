import { BaseDecisionEngine } from '../base-engine';
import type {
  CDSSResult,
  ClinicalCaseInput,
  ClinicalRecommendation,
  Fractionation,
  GuidelineReference,
  JsonSchema,
  OARConstraint,
  SystemicTherapyRecommendation,
  TargetVolume,
  TNMStage,
} from '../../types/cdss';

export type WilmsSetting = 'newly-diagnosed' | 'postoperative' | 'relapsed' | 'metastatic' | 'surveillance';
export type WilmsStage = 'I' | 'II' | 'III' | 'IV' | 'V' | 'unknown';
export type WilmsHistology = 'favorable' | 'diffuse-anaplasia' | 'focal-anaplasia' | 'unknown';
export type WilmsSurgery = 'unilateral-nephrectomy' | 'partial-nephrectomy' | 'bilateral-sparing-surgery' | 'biopsy-only' | 'none' | 'unknown';

export interface WilmsTumorInput extends ClinicalCaseInput {
  organSystem: 'gus';
  disease: 'wilms-tumor';
  setting: WilmsSetting;
  stageGroup?: WilmsStage;
  histology?: WilmsHistology;
  stage?: TNMStage;
  surgeryType?: WilmsSurgery;
  surgicalMargin?: 'R0' | 'R1' | 'R2' | 'RX' | 'not-applicable';
  tumorRupture?: boolean;
  positiveNodes?: number;
  lymphNodeSamplingAdequate?: boolean;
  residualTumor?: boolean;
  bilateralDisease?: boolean;
  lungMetastases?: boolean;
  liverMetastases?: boolean;
  boneOrBrainMetastases?: boolean;
  anaplasia?: boolean;
  ageYears?: number;
  priorRadiotherapy?: boolean;
  priorChemotherapy?: string[];
  symptomaticDisease?: boolean;
  performanceStatusECOG?: number;
}

const NCCN: GuidelineReference = {
  organization: 'NCCN',
  title: 'NCCN Clinical Practice Guidelines in Oncology: Wilms Tumor',
  version: 'Current version; verify institutional subscription before use',
  url: 'https://www.nccn.org/guidelines/guidelines-detail?category=1&id=1476',
  evidenceLevel: '2A',
};
const ASTRO: GuidelineReference = {
  organization: 'ASTRO',
  title: 'ASTRO clinical practice resources for pediatric abdominal and renal tumor radiotherapy',
  url: 'https://www.astro.org/Patient-Care-and-Research/Clinical-Practice-Statements/Clinical-Practice-Guidelines',
  evidenceLevel: 'B',
};
const ESTRO: GuidelineReference = {
  organization: 'ESTRO',
  title: 'ESTRO guidance for pediatric radiotherapy and abdominal organ sparing',
  url: 'https://www.estro.org/Science/Guidelines',
  evidenceLevel: 'B',
};
const TRIALS: GuidelineReference[] = [
  { organization: 'other', title: 'COG AREN0532: nephrectomy and reduced therapy for favorable-histology Wilms tumor', url: 'https://clinicaltrials.gov/study/NCT00379340', evidenceLevel: '1' },
  { organization: 'other', title: 'COG AREN0533: pulmonary metastatic Wilms tumor response-adapted therapy', url: 'https://clinicaltrials.gov/study/NCT00379340', evidenceLevel: '1' },
  { organization: 'other', title: 'NWTS-5: stage- and histology-adapted treatment for Wilms tumor', url: 'https://doi.org/10.1001/jama.293.24.3004', evidenceLevel: '1' },
  { organization: 'other', title: 'SIOP Wilms tumor protocol: preoperative chemotherapy and response-adapted local therapy', url: 'https://siope.eu/clinical-guidelines/standard-clinical-practice-recommendations/', evidenceLevel: '1' },
  { organization: 'other', title: 'RTOG 0825: pediatric abdominal radiotherapy quality and organ-sparing principles', url: 'https://clinicaltrials.gov/study/NCT00987389', evidenceLevel: '2B' },
];

export const WILMS_TUMOR_INPUT_JSON_SCHEMA: JsonSchema = {
  $schema: 'http://json-schema.org/draft-07/schema#',
  $id: 'https://radonco.local/schema/wilms-tumor-input.json',
  title: 'Wilms tumor clinical case input',
  type: 'object',
  required: ['organSystem', 'disease', 'setting'],
  properties: {
    organSystem: { type: 'string', enum: ['gus'] },
    disease: { type: 'string', enum: ['wilms-tumor'] },
    setting: { type: 'string', enum: ['newly-diagnosed', 'postoperative', 'relapsed', 'metastatic', 'surveillance'] },
    stageGroup: { type: 'string', enum: ['I', 'II', 'III', 'IV', 'V', 'unknown'] },
    histology: { type: 'string', enum: ['favorable', 'diffuse-anaplasia', 'focal-anaplasia', 'unknown'] },
    stage: { type: 'object', additionalProperties: true }, surgeryType: { type: 'string' },
    surgicalMargin: { type: 'string', enum: ['R0', 'R1', 'R2', 'RX', 'not-applicable'] },
    tumorRupture: { type: 'boolean' }, positiveNodes: { type: 'number' },
    lymphNodeSamplingAdequate: { type: 'boolean' }, residualTumor: { type: 'boolean' },
    bilateralDisease: { type: 'boolean' }, lungMetastases: { type: 'boolean' },
    liverMetastases: { type: 'boolean' }, boneOrBrainMetastases: { type: 'boolean' },
    anaplasia: { type: 'boolean' }, ageYears: { type: 'number' },
    priorRadiotherapy: { type: 'boolean' }, priorChemotherapy: { type: 'array', items: { type: 'string' } },
    symptomaticDisease: { type: 'boolean' }, performanceStatusECOG: { type: 'number' },
  },
  additionalProperties: true,
};

export const WILMS_TUMOR_OUTPUT_JSON_SCHEMA: JsonSchema = {
  $schema: 'http://json-schema.org/draft-07/schema#',
  $id: 'https://radonco.local/schema/wilms-tumor-result.json',
  title: 'Wilms tumor CDSS result',
  type: 'object',
  required: ['schemaVersion', 'engineId', 'engineVersion', 'organSystem', 'rtIndication', 'intent', 'summary', 'recommendations'],
  properties: {
    schemaVersion: { type: 'string', enum: ['1.0'] },
    engineId: { type: 'string', enum: ['pediatric-age.wilms-tumor'] },
    engineVersion: { type: 'string' }, organSystem: { type: 'string', enum: ['gus'] },
    rtIndication: { type: 'string' }, intent: { type: 'string' }, summary: { type: 'string' },
    recommendations: { type: 'array', items: { type: 'object', additionalProperties: true } },
    warnings: { type: 'array', items: { type: 'string' } },
    guidelineReferences: { type: 'array', items: { type: 'object', additionalProperties: true } },
  },
  additionalProperties: true,
};

const fraction = (totalDoseGy: number, fractions: number, className: Fractionation['class'], schedule: string): Fractionation => ({
  class: className,
  totalDoseGy,
  fractions,
  dosePerFractionGy: totalDoseGy / fractions,
  schedule,
  technique: 'IMRT',
  alphaBetaTumor: 10,
  bedGy: totalDoseGy * (1 + totalDoseGy / fractions / 10),
  eqd2Gy: totalDoseGy * ((totalDoseGy / fractions + 10) / 12),
});

const targets = (dose: Fractionation, lung = false): TargetVolume[] => [
  { name: 'GTV', description: lung ? 'Başlangıçta belgelenmiş pulmoner/visseral metastazlar ve rezidüel renal tümör yatağı.' : 'Başlangıç renal tümör hacmi, cerrahi yatak ve riskli retroperitoneal nodal alan.', dose, margin: 'Preoperatif/başlangıç BT-MRI, cerrahi klipler ve patolojiyle füzyon' },
  { name: 'CTV', description: lung ? 'Tüm akciğer veya seçilmiş metastatik hedefler; primer renal yatak/pozitif nodal alan.' : 'İpsilateral böbrek yatağı ve başlangıç tümör çevresindeki mikroskopik risk alanı.', dose, margin: 'COG/SIOP protokolüne göre başlangıç hacmi, cerrahi yatak ve anatomik bariyerlerle' },
  { name: 'PTV', description: 'Pediatrik immobilizasyon, solunum hareketi ve günlük görüntüleme belirsizliği.', dose, margin: 'Genellikle 3-5 mm; akciğer tedavisinde 4D-CT/ITV ve IGRT' },
];

const oars: OARConstraint[] = [
  { organ: 'Contralateral kidney', metric: 'Dmean', limit: 8, unit: 'Gy', priority: 'mandatory', source: 'protocol', sourceReference: 'Pediatric Wilms tumor renal preservation objective' },
  { organ: 'Liver', metric: 'Dmean', limit: 15, unit: 'Gy', priority: 'optimal', source: 'QUANTEC', sourceReference: 'Whole-abdomen Wilms tumor planning objective' },
  { organ: 'Small bowel', metric: 'Dmax', limit: 45, unit: 'Gy', priority: 'mandatory', source: 'protocol', sourceReference: 'Pediatric abdominal RT objective' },
  { organ: 'Spinal cord', metric: 'Dmax', limit: 45, unit: 'Gy', priority: 'mandatory', source: 'QUANTEC', sourceReference: 'Abdominal flank RT objective' },
  { organ: 'Heart', metric: 'Dmean', limit: 15, unit: 'Gy', priority: 'optimal', source: 'protocol', sourceReference: 'Whole-lung pediatric RT objective' },
  { organ: 'Lung', metric: 'V20', limit: 20, unit: '%', priority: 'optimal', source: 'protocol', sourceReference: 'Whole-lung or pulmonary metastasis planning objective' },
  { organ: 'Growth plates', metric: 'Dmean', limit: 20, unit: 'Gy', priority: 'optimal', source: 'protocol', sourceReference: 'Pediatric growth preservation objective' },
];

const systemic = (setting: SystemicTherapyRecommendation['setting'], regimen: string, agents: string[], timing: string, evidenceLevel: SystemicTherapyRecommendation['evidenceLevel'] = '1'): SystemicTherapyRecommendation => ({
  setting, regimen, agents, timing, evidenceLevel,
});
const references = (...extra: GuidelineReference[]): GuidelineReference[] => [NCCN, ASTRO, ESTRO, ...extra];

export class WilmsTumorDecisionEngine extends BaseDecisionEngine<WilmsTumorInput> {
  public readonly id = 'pediatric-age.wilms-tumor';
  public readonly version = '1.0.0';
  public readonly inputSchema = WILMS_TUMOR_INPUT_JSON_SCHEMA;
  public readonly outputSchema = WILMS_TUMOR_OUTPUT_JSON_SCHEMA;

  public constructor() { super('1.0.0'); }

  protected evaluateCase(input: WilmsTumorInput): CDSSResult {
    const recommendations: ClinicalRecommendation[] = [];
    const rationale: string[] = [];
    const warnings: string[] = [];
    let rtIndication: CDSSResult['rtIndication'] = 'not-indicated';
    let intent: CDSSResult['intent'] = 'observation';
    const highRisk = input.stageGroup === 'III' || input.stageGroup === 'IV' || input.stageGroup === 'V' || input.histology === 'diffuse-anaplasia' || input.anaplasia === true || input.surgicalMargin === 'R1' || input.surgicalMargin === 'R2' || input.residualTumor === true || input.tumorRupture === true;
    const lung = input.lungMetastases === true;

    if (input.priorRadiotherapy) warnings.push('Önceki RT mevcut; karşı böbrek, karaciğer, bağırsak, omurilik, kalp ve akciğer kümülatif dozları pediatrik re-irradiation uzmanı tarafından değerlendirilmelidir.');
    if (input.bilateralDisease) warnings.push('Bilateral hastalıkta nefron koruyucu cerrahi, böbrek fonksiyonları ve Wilms tümör predispozisyon sendromları (WT1/11p15 vb.) genetik/nefroloji MDT ile değerlendirilmelidir.');
    if (input.lymphNodeSamplingAdequate === false) warnings.push('Lenf nodu örneklemesi yetersiz; yanlış düşük evreleme riski nedeniyle pediatrik cerrahi ve patoloji yeniden değerlendirmesi gerekir.');
    if (input.tumorRupture) warnings.push('Tümör rüptürü/peritoneal saçılım şüphesi mevcut; flank yerine tüm abdomen kapsamı protokole göre değerlendirilmelidir.');

    if (input.setting === 'newly-diagnosed' || input.setting === 'postoperative') {
      const dose = fraction(highRisk ? 19.8 : 10.8, highRisk ? 11 : 6, 'conventional', highRisk ? '19.8 Gy / 11 fx; yüksek riskli renal yatak ± nodal/peritoneal alan' : '10.8 Gy / 6 fx; seçilmiş evre III/fokal risk alanı');
      recommendations.push({
        id: 'localized-wilms-tumor',
        label: highRisk ? 'Neoadjuvan/adjuvan vincristine-dactinomycin ± doxorubicin ve protokole göre flank/abdomen RT' : 'Nefrektomi sonrası risk-adapte kemoterapi; rutin RT yok, seçilmiş patolojik riskte RT',
        indication: highRisk ? 'indicated' : 'conditional',
        intent: input.setting === 'postoperative' ? 'adjuvant' : 'curative',
        fractionation: highRisk ? dose : undefined,
        targetVolumes: highRisk ? targets(dose) : undefined,
        oarConstraints: highRisk ? oars : undefined,
        systemicTherapy: [
          systemic('neoadjuvant', 'SIOP yaklaşımında preoperatif risk-adapte kemoterapi', ['vincristine', 'dactinomycin', 'doxorubicin yüksek riskte'], 'Nefrektomi öncesi, görüntüleme yanıtı ve rezektabilite ile', '1'),
          systemic('adjuvant', 'COG/NWTS risk-adapte kemoterapi', ['vincristine', 'dactinomycin', 'doxorubicin yüksek riskte', 'cyclophosphamide/etoposide anaplazik veya evre IV protokolde'], 'Cerrahi ve patolojik evre sonrası', '1'),
        ],
        rationale: [
          'Wilms tümöründe cerrahi (COG’de primer nefrektomi; SIOP yaklaşımında seçilmiş preoperatif kemoterapi sonrası cerrahi), patolojik evre/histoloji ve sistemik kemoterapi birlikte planlanır.',
          'Evre I-II favorable histology hastalıkta çoğu olguda RT gerekmez; evre III, diffuse anaplazi, rüptür/rezidüel hastalık veya pozitif nodlarda renal yatak/flank RT endikasyonu artar.',
          'RT hacmi başlangıç tümör yatağı, pozitif nodlar ve patolojiye göre çizilmeli; elektif nodal veya 60-66 Gy torasik kemoradyoterapi Wilms tümöründe uygun değildir.',
          'AREN0532, AREN0533 ve NWTS-5 risk/yanıt uyumlu cerrahi, kemoterapi ve akciğer yaklaşımını destekler.',
        ],
        guidelineReferences: references(TRIALS[0], TRIALS[2], TRIALS[3]),
      });
      rtIndication = highRisk ? 'indicated' : 'conditional';
      intent = input.setting === 'postoperative' ? 'adjuvant' : 'curative';
    } else if (input.setting === 'metastatic') {
      const dose = fraction(12, 8, 'conventional', '12 Gy / 8 fx; seçilmiş pulmoner metastaz/whole-lung RT veya semptomatik metastatik hedef');
      recommendations.push({
        id: 'metastatic-wilms-tumor',
        label: lung ? 'Risk-adapte kemoterapi ve seçilmiş whole-lung/metastaz RT' : 'Sistemik tedavi ve semptomatik metastazlara seçilmiş RT',
        indication: input.symptomaticDisease || lung || input.liverMetastases || input.boneOrBrainMetastases ? 'indicated' : 'conditional',
        intent: 'curative',
        fractionation: input.symptomaticDisease || lung ? dose : undefined,
        targetVolumes: input.symptomaticDisease || lung ? targets(dose, lung) : undefined,
        oarConstraints: oars,
        systemicTherapy: [systemic('induction', 'Evre IV Wilms tümöründe yoğunlaştırılmış risk-adapte kemoterapi', ['vincristine', 'dactinomycin', 'doxorubicin', 'cyclophosphamide/etoposide veya protokole göre'], 'Primer ve metastaz yanıtına göre lokal tedavi ile birlikte', '1')],
        rationale: [
          'Pulmoner metastazda sistemik kemoterapi esastır; persistan veya yüksek riskli pulmoner hastalıkta whole-lung RT ya da seçilmiş metastaz tedavisi AREN0533/SIOP protokolüne göre değerlendirilir.',
          'Karaciğer, kemik veya beyin metastazları için RT; semptom, rezektabilite, sistemik yanıt ve pediatrik OAR kısıtlarıyla birlikte planlanır.',
          'Toraks için SBRT ve PACIFIC benzeri konsolidasyon immünoterapisi Wilms tümörünün standart yaklaşımı değildir; pediatrik protokol dışı kullanım önerilmez.',
        ],
        guidelineReferences: references(TRIALS[1], TRIALS[2], TRIALS[4]),
      });
      rtIndication = input.symptomaticDisease || lung || input.liverMetastases || input.boneOrBrainMetastases ? 'indicated' : 'conditional';
      intent = 'curative';
    } else if (input.setting === 'relapsed') {
      const dose = fraction(20, 10, 'moderate-hypofractionation', '20 Gy / 10 fx; seçilmiş relaps veya semptomatik odak');
      recommendations.push({
        id: 'relapsed-wilms-tumor',
        label: 'Relaps Wilms tümöründe kurtarma kemoterapisi/klinik çalışma ve seçilmiş salvage RT',
        indication: input.symptomaticDisease ? 'indicated' : 'conditional',
        intent: 'salvage',
        fractionation: input.symptomaticDisease ? dose : undefined,
        targetVolumes: input.symptomaticDisease ? targets(dose, lung) : undefined,
        oarConstraints: input.symptomaticDisease ? oars : undefined,
        systemicTherapy: [systemic('palliative', 'Relaps Wilms tümörü için kurtarma kemoterapisi', ['ifosfamide', 'carboplatin', 'etoposide', 'cyclophosphamide/topotecan veya protokole göre'], 'Önceki antrasiklin/RT, böbrek fonksiyonu ve klinik çalışma uygunluğuna göre', '2A')],
        rationale: [
          'Relaps hastalıkta biyopsi/görüntüleme ile doğrulama, tüm vücut evreleme ve pediatrik renal tümör kurulunda klinik çalışma önceliklidir.',
          'RT, lokal relaps, ağrı/kanama veya organ tehdidi oluşturan metastatik odaklarda salvage/palyatif amaçla seçilebilir; daha önce ışınlanmış alanlarda kümülatif doz kritiktir.',
          'Hedefe yönelik EGFR/ALK veya rutin immünoterapi Wilms tümöründe standart değildir; moleküler çalışma yalnızca klinik araştırma/istisnai MDT kapsamında ele alınmalıdır.',
        ],
        guidelineReferences: references(TRIALS[0], TRIALS[2]),
      });
      rtIndication = input.symptomaticDisease ? 'indicated' : 'conditional';
      intent = 'salvage';
    } else {
      recommendations.push({
        id: 'wilms-surveillance',
        label: 'Tedavi sonrası yapılandırılmış pediatrik renal tümör izlemi',
        indication: 'not-indicated',
        intent: 'observation',
        rationale: ['Remisyonda rutin RT yerine renal fonksiyon, tansiyon, karşı böbrek, büyüme/gelişme, kardiyak geç etkiler ve protokole uygun abdominal/torasik görüntüleme izlenmelidir.'],
        guidelineReferences: references(TRIALS[0]),
      });
    }
    rationale.push('Bu motor favorable/anaplastik histoloji, COG/NWTS ve SIOP evreleme yaklaşımlarını pediatrik nefroloji, cerrahi, onkoloji, radyoloji ve radyasyon onkolojisi MDT’siyle birlikte yorumlamak üzere tasarlanmıştır.');
    return {
      schemaVersion: '1.0',
      engineId: this.id,
      engineVersion: this.version,
      caseId: input.caseId,
      organSystem: 'gus',
      rtIndication,
      intent,
      summary: recommendations[0]?.label ?? 'Wilms tümörü için pediatrik renal tümör MDT değerlendirmesi gerekir.',
      recommendations,
      rationale,
      warnings,
      uncertainties: ['Aktif NCCN/ASTRO/ESTRO sürümü, COG/SIOP evresi, histoloji, nod örneklemesi, tümör rüptürü, metastatik yanıt, önceki RT/kemoterapi ve renal fonksiyon doğrulanmalıdır.'],
      confidence: 0.89,
      guidelineReferences: references(...TRIALS),
    };
  }
}

export const wilmsTumorEngine = new WilmsTumorDecisionEngine();
