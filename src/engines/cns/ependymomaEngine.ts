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

export type EpendymomaSetting = 'newly-diagnosed' | 'postoperative' | 'recurrent' | 'disseminated';
export type EpendymomaGrade = 'WHO-2' | 'WHO-3' | 'unknown';
export type EpendymomaCompartment = 'supratentorial' | 'posterior-fossa' | 'spinal' | 'cervical' | 'unknown';
export type EpendymomaMolecularGroup = 'ZFTA-fusion-positive' | 'YAP1-fusion-positive' | 'PFA' | 'PFB' | 'MYCN-amplified' | 'unknown';
export type EpendymomaSurgery = 'gross-total-resection' | 'subtotal-resection' | 'biopsy-only' | 'none' | 'unknown';

export interface EpendymomaInput extends ClinicalCaseInput {
  organSystem: 'cns';
  disease: 'ependymoma';
  setting: EpendymomaSetting;
  stage?: TNMStage;
  grade?: EpendymomaGrade;
  compartment?: EpendymomaCompartment;
  molecularGroup?: EpendymomaMolecularGroup;
  surgeryType?: EpendymomaSurgery;
  resectionMargin?: 'R0' | 'R1' | 'R2' | 'RX' | 'not-applicable';
  residualTumor?: boolean;
  leptomeningealDisease?: boolean;
  positiveCSFCytology?: boolean;
  spinalDropMetastases?: boolean;
  ageYears?: number;
  pediatricPatient?: boolean;
  performanceStatusECOG?: number;
  priorRadiotherapy?: boolean;
  hydrocephalus?: boolean;
  neurologicDeficit?: boolean;
}

const NCCN: GuidelineReference = {
  organization: 'NCCN',
  title: 'NCCN Clinical Practice Guidelines in Oncology: Central Nervous System Cancers',
  version: 'Current version; verify institutional subscription before use',
  url: 'https://www.nccn.org/guidelines/guidelines-detail?category=1&id=1425',
  evidenceLevel: '2A',
};

const ASTRO: GuidelineReference = {
  organization: 'ASTRO',
  title: 'ASTRO clinical practice resources for pediatric and CNS radiotherapy',
  url: 'https://www.astro.org/Patient-Care-and-Research/Clinical-Practice-Statements',
  evidenceLevel: 'B',
};

const ESTRO: GuidelineReference = {
  organization: 'ESTRO',
  title: 'ESTRO-EANO guidance for ependymoma and CNS radiotherapy',
  url: 'https://www.estro.org/Science/Guidelines',
  evidenceLevel: 'B',
};

const TRIALS: GuidelineReference[] = [
  { organization: 'other', title: 'CERN prospective ependymoma study: conformal radiotherapy after surgery', url: 'https://doi.org/10.1016/S1470-2045(08)70224-6', evidenceLevel: '2A' },
  { organization: 'other', title: 'COG ACNS0121: postoperative conformal radiotherapy for pediatric ependymoma', url: 'https://clinicaltrials.gov/study/NCT00004188', evidenceLevel: '2A' },
  { organization: 'other', title: 'SIOP Ependymoma I: postoperative radiotherapy and chemotherapy strategy', url: 'https://clinicaltrials.gov/study/NCT01096368', evidenceLevel: '2B' },
  { organization: 'other', title: 'EANO-EURACAN clinical practice guideline for ependymal tumors', url: 'https://doi.org/10.1093/neuonc/noab150', evidenceLevel: 'B' },
];

export const EPENDYMOMA_INPUT_JSON_SCHEMA: JsonSchema = {
  $schema: 'http://json-schema.org/draft-07/schema#',
  $id: 'https://radonco.local/schema/ependymoma-input.json',
  title: 'Ependymoma clinical case input',
  type: 'object',
  required: ['organSystem', 'disease', 'setting'],
  properties: {
    organSystem: { type: 'string', enum: ['cns'] },
    disease: { type: 'string', enum: ['ependymoma'] },
    setting: { type: 'string', enum: ['newly-diagnosed', 'postoperative', 'recurrent', 'disseminated'] },
    stage: { type: 'object', additionalProperties: true },
    grade: { type: 'string', enum: ['WHO-2', 'WHO-3', 'unknown'] },
    compartment: { type: 'string', enum: ['supratentorial', 'posterior-fossa', 'spinal', 'cervical', 'unknown'] },
    molecularGroup: { type: 'string', enum: ['ZFTA-fusion-positive', 'YAP1-fusion-positive', 'PFA', 'PFB', 'MYCN-amplified', 'unknown'] },
    surgeryType: { type: 'string', enum: ['gross-total-resection', 'subtotal-resection', 'biopsy-only', 'none', 'unknown'] },
    resectionMargin: { type: 'string', enum: ['R0', 'R1', 'R2', 'RX', 'not-applicable'] },
    residualTumor: { type: 'boolean' },
    leptomeningealDisease: { type: 'boolean' },
    positiveCSFCytology: { type: 'boolean' },
    spinalDropMetastases: { type: 'boolean' },
    ageYears: { type: 'number' },
    pediatricPatient: { type: 'boolean' },
    performanceStatusECOG: { type: 'number' },
    priorRadiotherapy: { type: 'boolean' },
    hydrocephalus: { type: 'boolean' },
    neurologicDeficit: { type: 'boolean' },
  },
  additionalProperties: true,
};

export const EPENDYMOMA_OUTPUT_JSON_SCHEMA: JsonSchema = {
  $schema: 'http://json-schema.org/draft-07/schema#',
  $id: 'https://radonco.local/schema/ependymoma-result.json',
  title: 'Ependymoma CDSS result',
  type: 'object',
  required: ['schemaVersion', 'engineId', 'engineVersion', 'organSystem', 'rtIndication', 'intent', 'summary', 'recommendations'],
  properties: {
    schemaVersion: { type: 'string', enum: ['1.0'] },
    engineId: { type: 'string', enum: ['cns.ependymoma'] },
    engineVersion: { type: 'string' },
    organSystem: { type: 'string', enum: ['cns'] },
    rtIndication: { type: 'string' },
    intent: { type: 'string' },
    summary: { type: 'string' },
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
  technique: className === 'SRS' ? 'IGRT' : 'IMRT',
  alphaBetaTumor: 10,
  bedGy: totalDoseGy * (1 + totalDoseGy / fractions / 10),
  eqd2Gy: totalDoseGy * ((totalDoseGy / fractions + 10) / 12),
});

const ependymomaTargets = (dose: Fractionation, craniospinal: boolean): TargetVolume[] => [
  {
    name: 'GTV',
    description: 'Kontrastlı beyin ve spinal MRI ile tanımlanan primer, rezidüel tümör veya nüks.',
    dose,
    margin: 'Rezeksiyon kavitesi ve görüntülenebilir tümör',
  },
  {
    name: 'CTV',
    description: craniospinal
      ? 'Kraniospinal subaraknoid boşluk ve görüntülenebilir drop metastazları; primer yatağına boost ile.'
      : 'Rezeksiyon kavitesi, rezidüel hastalık ve tümörün anatomik yayılım yolu; rutin elektif nodal alan yoktur.',
    dose,
    margin: craniospinal ? 'Beyin/spinal subaraknoid alan; MRI ve CSF bulgularına göre' : 'Genellikle 1-1.5 cm; yaş, tümör yatağı ve anatomik bariyerlere göre',
  },
  {
    name: 'PTV',
    description: 'Immobilizasyon, organ hareketi ve günlük görüntüleme belirsizliği için IGRT marjı.',
    dose,
    margin: 'Günlük CBCT/IGRT ile yaklaşık 2-5 mm; pediatrik ve spinal alanda kurum protokolüne göre',
  },
];

const ependymomaOars: OARConstraint[] = [
  { organ: 'Brainstem', metric: 'Dmax', limit: 54, unit: 'Gy', priority: 'mandatory', source: 'QUANTEC', sourceReference: 'Conventional fractionation brainstem tolerance' },
  { organ: 'Optic nerves and chiasm', metric: 'Dmax', limit: 54, unit: 'Gy', priority: 'mandatory', source: 'QUANTEC', sourceReference: 'Conventional fractionation optic pathway tolerance' },
  { organ: 'Spinal cord', metric: 'Dmax', limit: 45, unit: 'Gy', priority: 'mandatory', source: 'QUANTEC', sourceReference: 'Spinal cord tolerance' },
  { organ: 'Cochleae', metric: 'Dmean', limit: 35, unit: 'Gy', priority: 'optimal', source: 'protocol', sourceReference: 'Posterior fossa radiotherapy hearing preservation objective' },
  { organ: 'Normal brain', metric: 'V12', limit: 5, unit: 'cc', priority: 'optimal', source: 'HyTEC', sourceReference: 'Stereotactic radionecrosis risk objective' },
];

const systemic = (setting: SystemicTherapyRecommendation['setting'], regimen: string, agents: string[], timing: string, evidenceLevel: SystemicTherapyRecommendation['evidenceLevel'] = '2B'): SystemicTherapyRecommendation => ({ setting, regimen, agents, timing, evidenceLevel });
const references = (...extra: GuidelineReference[]): GuidelineReference[] => [NCCN, ASTRO, ESTRO, ...extra];

export class EpendymomaDecisionEngine extends BaseDecisionEngine<EpendymomaInput> {
  public readonly id = 'cns.ependymoma';
  public readonly version = '1.0.0';
  public readonly inputSchema = EPENDYMOMA_INPUT_JSON_SCHEMA;
  public readonly outputSchema = EPENDYMOMA_OUTPUT_JSON_SCHEMA;

  public constructor() {
    super('1.0.0');
  }

  protected evaluateCase(input: EpendymomaInput): CDSSResult {
    const recommendations: ClinicalRecommendation[] = [];
    const rationale: string[] = [];
    const warnings: string[] = [];
    let rtIndication: CDSSResult['rtIndication'] = 'indicated';
    let intent: CDSSResult['intent'] = 'curative';
    const disseminated = Boolean(input.setting === 'disseminated' || input.leptomeningealDisease || input.positiveCSFCytology || input.spinalDropMetastases);

    if (input.hydrocephalus || input.neurologicDeficit) warnings.push('Hidrosefali veya nörolojik defisit varsa acil nöroşirürjik değerlendirme, BOS diversiyonu ve bası yönetimi gerekir.');
    if (input.priorRadiotherapy) warnings.push('Önceki kraniyal/spinal RT mevcut; yeniden ışınlama öncesi kümülatif beyin sapı, optik yol, koklea, spinal kord ve normal beyin dozları hesaplanmalıdır.');
    if (input.pediatricPatient || (input.ageYears !== undefined && input.ageYears < 18)) warnings.push('Pediatrik hastada nörogelişim, endokrin işlev, işitme ve ikincil malignite riskleri nedeniyle proton/konformal planlama ve geç toksisite azaltımı değerlendirilmelidir.');

    if (input.setting === 'newly-diagnosed' || input.setting === 'postoperative') {
      const localDose = fraction(59.4, 33, 'conventional', '59.4 Gy / 33 fx; seçilmiş lokalize posterior fossa/supratentorial hastalık');
      const spinalLocalDose = fraction(54, 30, 'conventional', '54 Gy / 30 fx; seçilmiş spinal ependimom');
      const craniospinalDose = fraction(36, 20, 'conventional', '36 Gy / 20 fx CSI + primer/drop metastaz boost');
      const localTreatmentDose = input.compartment === 'spinal' || input.compartment === 'cervical' ? spinalLocalDose : localDose;
      recommendations.push({
        id: 'new-ependymoma-management',
        label: disseminated ? 'Maksimal güvenli rezeksiyon + kraniospinal RT ve boost' : 'Maksimal güvenli rezeksiyon + postoperatif fokal RT',
        indication: 'indicated',
        intent: 'curative',
        fractionation: disseminated ? craniospinalDose : localTreatmentDose,
        targetVolumes: ependymomaTargets(disseminated ? craniospinalDose : localTreatmentDose, disseminated),
        oarConstraints: ependymomaOars,
        systemicTherapy: input.pediatricPatient
          ? [systemic('adjuvant', 'Seçilmiş pediatrik ependimomda kemoterapi/klinik çalışma', ['vincristine, cisplatin, cyclophosphamide veya klinik çalışma'], 'RT zamanlaması ve yaşa göre; RT geciktirme kararı yalnızca pediatrik nöro-onkoloji MDT’sinde', '2B')]
          : undefined,
        rationale: [
          'Maksimal güvenli rezeksiyon, tanı ve moleküler sınıflama ile birlikte lokal kontrolün temelidir; nörolojik fonksiyon korunmalıdır.',
          disseminated ? 'Leptomeningeal/CSF pozitifliği veya spinal drop metastazlarında kraniospinal RT, primer yatak ve makroskopik spinal odak boostları ile planlanır.' : 'Lokalize ependimomda postoperatif fokal RT, özellikle rezidüel hastalık, WHO grade 3 veya nüks riski yüksek lokal anatomide temel lokal tedavidir.',
          'R0/R1/R2 değerlendirmesi, rezidüel kontrastlanan tümör ve erken postoperatif MRI ile birlikte ele alınır; rutin elektif nodal ışınlama CNS ependimomunda uygulanmaz.',
        ],
        guidelineReferences: references(TRIALS[0], TRIALS[1], TRIALS[3]),
      });
    } else if (input.setting === 'recurrent') {
      intent = 'salvage';
      const salvageDose = fraction(30, 5, 'SRS', '30 Gy / 5 fx; sınırlı fokal nüks ve kritik OAR mesafesine göre');
      recommendations.push({
        id: 'recurrent-ependymoma',
        label: 'Nüks ependimomda yeniden cerrahi, fokal RT veya seçilmiş yeniden ışınlama',
        indication: input.priorRadiotherapy ? 'consider' : 'indicated',
        intent,
        fractionation: salvageDose,
        targetVolumes: ependymomaTargets(salvageDose, false),
        oarConstraints: ependymomaOars,
        systemicTherapy: [systemic('palliative', 'RT/cerrahiye uygun olmayan nükste klinik çalışma veya salvage kemoterapi', ['platin/etoposide veya klinik çalışma'], 'Yaş, önceki kemoterapi/RT, moleküler grup ve performansa göre', '2B')],
        rationale: [
          'İzole ve rezeke edilebilir lokal nükste yeniden cerrahi; küçük fokal nükste stereotaktik veya fraksiyone RT değerlendirilebilir.',
          'Önceden RT alan hastada yeniden ışınlama yalnızca kümülatif OAR dozları ve beklenen yarar kabul edilebilir ise düşünülmelidir.',
          'Yaygın nüks veya çoklu tedavi sonrası hastalıkta klinik çalışma önceliklidir; sistemik tedavinin kanıt düzeyi sınırlıdır.',
        ],
        guidelineReferences: references(TRIALS[2], TRIALS[3]),
      });
      rtIndication = input.priorRadiotherapy ? 'consider' : 'indicated';
    } else {
      intent = 'palliative';
      const palliativeDose = fraction(30, 10, 'moderate-hypofractionation', '30 Gy / 10 fx; semptomatik kraniyal/spinal hedefe göre');
      recommendations.push({
        id: 'disseminated-ependymoma',
        label: 'Yaygın ependimomda kraniospinal/fokal semptom odaklı RT ve sistemik tedavi',
        indication: 'conditional',
        intent,
        fractionation: palliativeDose,
        targetVolumes: ependymomaTargets(palliativeDose, true),
        oarConstraints: ependymomaOars,
        systemicTherapy: [systemic('palliative', 'Yaygın/tedavi dirençli hastalıkta klinik çalışma veya salvage sistemik tedavi', ['platin/etoposide, temozolomide veya klinik çalışma'], 'Performans, önceki tedavi ve semptom yüküne göre', '2B')],
        rationale: [
          'Yaygın leptomeningeal hastalıkta tedavi MRI/CSF dağılımı, nörolojik semptomlar ve önceki RT alanlarına göre fokal veya kraniospinal olarak uyarlanır.',
          'RT; kord basısı, hidrosefali, ağrı, nörolojik defisit ve semptomatik drop metastazlarında lokal kontrol/palyasyon sağlar.',
        ],
        guidelineReferences: references(TRIALS[2], TRIALS[3]),
      });
      rtIndication = 'conditional';
    }

    rationale.push('Ependimom kararı; nöroşirürji, pediatrik/erişkin nöro-onkoloji, radyasyon onkolojisi, nöroradyoloji ve nöropatoloji konseyinde beyin-spinal MRI, CSF değerlendirmesi, WHO grade ve moleküler gruplama ile kesinleştirilmelidir.');
    return {
      schemaVersion: '1.0',
      engineId: this.id,
      engineVersion: this.version,
      caseId: input.caseId,
      organSystem: 'cns',
      rtIndication,
      intent,
      summary: this.summary(input),
      recommendations,
      rationale,
      warnings: warnings.length ? warnings : undefined,
      uncertainties: !input.grade || !input.surgeryType || input.leptomeningealDisease === undefined ? ['WHO grade, cerrahi kapsamı veya kraniospinal evreleme eksik; RT alanı ve sıralaması değişebilir.'] : undefined,
      confidence: !input.grade || !input.surgeryType || input.leptomeningealDisease === undefined ? 0.72 : 0.87,
      generatedAt: new Date().toISOString(),
      guidelineReferences: recommendations.flatMap((recommendation) => recommendation.guidelineReferences ?? []),
    };
  }

  private summary(input: EpendymomaInput): string {
    if (input.setting === 'newly-diagnosed' || input.setting === 'postoperative') return 'Yeni tanı/postoperatif ependimom: maksimal güvenli cerrahi, beyin-spinal evreleme ve lokal veya kraniospinal RT.';
    if (input.setting === 'recurrent') return 'Nüks ependimom: yeniden cerrahi, fokal stereotaktik RT ve seçilmiş salvage sistemik tedavi.';
    return 'Dissemine ependimom: kraniospinal/fokal semptom odaklı RT ve klinik çalışma yaklaşımı.';
  }
}

export const ependymomaEngine = new EpendymomaDecisionEngine();

export default ependymomaEngine;
