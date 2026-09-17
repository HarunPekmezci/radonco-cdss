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

export type MeningiomaSetting = 'newly-diagnosed' | 'postoperative' | 'recurrent' | 'progressive' | 'metastatic';
export type MeningiomaGrade = 'WHO-1' | 'WHO-2' | 'WHO-3' | 'unknown';
export type MeningiomaSite = 'convexity' | 'skull-base' | 'parasellar' | 'falx' | 'spinal' | 'ventricular' | 'other' | 'unknown';
export type MeningiomaSurgery = 'gross-total-resection' | 'subtotal-resection' | 'biopsy-only' | 'none' | 'unknown';

export interface MeningiomaInput extends ClinicalCaseInput {
  organSystem: 'cns';
  disease: 'meningioma';
  setting: MeningiomaSetting;
  stage?: TNMStage;
  grade?: MeningiomaGrade;
  site?: MeningiomaSite;
  surgeryType?: MeningiomaSurgery;
  resectionMargin?: 'R0' | 'R1' | 'R2' | 'RX' | 'not-applicable';
  residualTumor?: boolean;
  tumorSizeCm?: number;
  opticPathwayInvolvement?: boolean;
  brainstemInvolvement?: boolean;
  neurologicDeficit?: boolean;
  seizures?: boolean;
  edemaOrMassEffect?: boolean;
  midlineShift?: 'none' | 'less-than-5-mm' | 'at-least-5-mm';
  symptomStatus?: 'asymptomatic' | 'deficit-or-raised-icp';
  brainInvasion?: boolean;
  priorRadiotherapy?: boolean;
  performanceStatusECOG?: number;
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
  title: 'ASTRO clinical practice resources for CNS and stereotactic radiotherapy',
  url: 'https://www.astro.org/Patient-Care-and-Research/Clinical-Practice-Statements',
  evidenceLevel: 'B',
};

const ESTRO: GuidelineReference = {
  organization: 'ESTRO',
  title: 'ESTRO-EANO guidance for meningioma and CNS radiotherapy',
  url: 'https://www.estro.org/Science/Guidelines',
  evidenceLevel: 'B',
};

const TRIALS: GuidelineReference[] = [
  { organization: 'other', title: 'EORTC 22042-26042: high-dose postoperative radiotherapy for atypical meningioma', url: 'https://doi.org/10.1016/j.ejca.2018.03.012', evidenceLevel: '2A' },
  { organization: 'other', title: 'NRG Oncology/RTOG 0539: risk-adapted radiotherapy for meningioma', url: 'https://doi.org/10.1016/j.ijrobp.2019.11.031', evidenceLevel: '2A' },
  { organization: 'other', title: 'ROAM/EORTC-1308: adjuvant radiotherapy versus observation after atypical meningioma resection', url: 'https://clinicaltrials.gov/study/NCT00895622', evidenceLevel: '2A' },
  { organization: 'other', title: 'EORTC 26021-22022: bevacizumab in recurrent meningioma', url: 'https://clinicaltrials.gov/study/NCT01125046', evidenceLevel: '2B' },
];

export const MENINGIOMA_INPUT_JSON_SCHEMA: JsonSchema = {
  $schema: 'http://json-schema.org/draft-07/schema#',
  $id: 'https://radonco.local/schema/meningioma-input.json',
  title: 'Meningioma clinical case input',
  type: 'object',
  required: ['organSystem', 'disease', 'setting'],
  properties: {
    organSystem: { type: 'string', enum: ['cns'] },
    disease: { type: 'string', enum: ['meningioma'] },
    setting: { type: 'string', enum: ['newly-diagnosed', 'postoperative', 'recurrent', 'progressive', 'metastatic'] },
    stage: { type: 'object', additionalProperties: true },
    grade: { type: 'string', enum: ['WHO-1', 'WHO-2', 'WHO-3', 'unknown'] },
    site: { type: 'string', enum: ['convexity', 'skull-base', 'parasellar', 'falx', 'spinal', 'ventricular', 'other', 'unknown'] },
    surgeryType: { type: 'string', enum: ['gross-total-resection', 'subtotal-resection', 'biopsy-only', 'none', 'unknown'] },
    resectionMargin: { type: 'string', enum: ['R0', 'R1', 'R2', 'RX', 'not-applicable'] },
    residualTumor: { type: 'boolean' },
    tumorSizeCm: { type: 'number' },
    opticPathwayInvolvement: { type: 'boolean' },
    brainstemInvolvement: { type: 'boolean' },
    neurologicDeficit: { type: 'boolean' },
    seizures: { type: 'boolean' },
    edemaOrMassEffect: { type: 'boolean' },
    midlineShift: { type: 'string', enum: ['none', 'less-than-5-mm', 'at-least-5-mm'] },
    symptomStatus: { type: 'string', enum: ['asymptomatic', 'deficit-or-raised-icp'] },
    brainInvasion: { type: 'boolean' },
    priorRadiotherapy: { type: 'boolean' },
    performanceStatusECOG: { type: 'number' },
  },
  additionalProperties: true,
};

export const MENINGIOMA_OUTPUT_JSON_SCHEMA: JsonSchema = {
  $schema: 'http://json-schema.org/draft-07/schema#',
  $id: 'https://radonco.local/schema/meningioma-result.json',
  title: 'Meningioma CDSS result',
  type: 'object',
  required: ['schemaVersion', 'engineId', 'engineVersion', 'organSystem', 'rtIndication', 'intent', 'summary', 'recommendations'],
  properties: {
    schemaVersion: { type: 'string', enum: ['1.0'] },
    engineId: { type: 'string', enum: ['cns.meningioma'] },
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

const meningiomaTargets = (dose: Fractionation, stereotactic: boolean): TargetVolume[] => [
  {
    name: 'GTV',
    description: 'Kontrastlı ince kesit MRI ile belirlenen meningioma, rezidüel tümör veya nüks.',
    dose,
    margin: 'Görüntülenebilir tümör ve cerrahi yatak',
  },
  {
    name: 'CTV',
    description: stereotactic
      ? 'GTV çevresinde minimal klinik marj; dural tail ve kemik invazyonu görüntülemeye göre dahil edilir.'
      : 'Rezeksiyon yatağı, dural tutulum ve grade/rezidüel hastalığa göre riskli dura.',
    dose,
    margin: stereotactic ? '0-2 mm; anatomik bariyer ve MRI doğruluğuna göre' : 'Genellikle 0.5-1.5 cm; grade, invazyon ve cerrahi yatağa göre',
  },
  {
    name: 'PTV',
    description: 'Fraksiyon içi hareket ve immobilizasyon belirsizliği için günlük IGRT marjı.',
    dose,
    margin: stereotactic ? '1-3 mm' : '2-5 mm; maske/CBCT ve kurum protokolüne göre',
  },
];

const meningiomaOars: OARConstraint[] = [
  { organ: 'Optic nerves and chiasm', metric: 'Dmax', limit: 54, unit: 'Gy', priority: 'mandatory', source: 'QUANTEC', sourceReference: 'Conventional fractionation optic pathway tolerance' },
  { organ: 'Brainstem', metric: 'Dmax', limit: 54, unit: 'Gy', priority: 'mandatory', source: 'QUANTEC', sourceReference: 'Conventional fractionation brainstem tolerance' },
  { organ: 'Spinal cord', metric: 'Dmax', limit: 45, unit: 'Gy', priority: 'mandatory', source: 'QUANTEC', sourceReference: 'Spinal cord tolerance' },
  { organ: 'Normal brain', metric: 'V12', limit: 5, unit: 'cc', priority: 'optimal', source: 'HyTEC', sourceReference: 'SRS radionecrosis risk objective' },
  { organ: 'Eyes/lenses', metric: 'Dmax', limit: 10, unit: 'Gy', priority: 'optimal', source: 'QUANTEC', sourceReference: 'Lens/ocular structure sparing objective' },
];

const systemic = (setting: SystemicTherapyRecommendation['setting'], regimen: string, agents: string[], timing: string, evidenceLevel: SystemicTherapyRecommendation['evidenceLevel'] = '2B'): SystemicTherapyRecommendation => ({ setting, regimen, agents, timing, evidenceLevel });
const references = (...extra: GuidelineReference[]): GuidelineReference[] => [NCCN, ASTRO, ESTRO, ...extra];

export class MeningiomaDecisionEngine extends BaseDecisionEngine<MeningiomaInput> {
  public readonly id = 'cns.meningioma';
  public readonly version = '1.0.0';
  public readonly inputSchema = MENINGIOMA_INPUT_JSON_SCHEMA;
  public readonly outputSchema = MENINGIOMA_OUTPUT_JSON_SCHEMA;

  public constructor() {
    super('1.0.0');
  }

  protected evaluateCase(input: MeningiomaInput): CDSSResult {
    const recommendations: ClinicalRecommendation[] = [];
    const rationale: string[] = [];
    const warnings: string[] = [];
    let rtIndication: CDSSResult['rtIndication'] = 'not-indicated';
    let intent: CDSSResult['intent'] = 'curative';

    if (input.edemaOrMassEffect || input.neurologicDeficit || input.symptomStatus === 'deficit-or-raised-icp' || input.midlineShift === 'at-least-5-mm') warnings.push('Kitle etkisi, orta hat şifti veya nörolojik semptom varsa nöroşirürjik değerlendirme, steroid ve nörolojik destek aciliyeti değerlendirilmelidir.');
    if (input.brainInvasion) warnings.push('Beyin invazyonu WHO derece ve rezeksiyon kapsamı ile birlikte yüksek riskli patolojik özellik olarak MDT içinde değerlendirilmelidir.');
    if (input.priorRadiotherapy) warnings.push('Önceki kraniyal/spinal RT varsa kümülatif optik yol, beyin sapı, spinal kord ve normal beyin dozları yeniden hesaplanmalıdır.');
    if (input.opticPathwayInvolvement || input.brainstemInvolvement) warnings.push('Optik yol veya beyin sapı komşuluğunda stereotaktik doz seçimi kritik OAR toleranslarıyla sınırlıdır; fraksiyone yaklaşım tercih edilebilir.');

    if (input.setting === 'newly-diagnosed') {
      const smallTumor = input.tumorSizeCm !== undefined && input.tumorSizeCm <= 3;
      const radiosurgeryDose = fraction(15, 1, 'SRS', '15 Gy / 1 fx; seçilmiş küçük, kritik yapılardan uzak tümör');
      recommendations.push({
        id: 'new-meningioma-management',
        label: input.grade === 'WHO-1' && smallTumor ? 'Gözlem veya seçilmiş SRS; semptomatik/kompresif hastalıkta cerrahi' : 'Maksimal güvenli rezeksiyon ve patolojiye göre RT',
        indication: input.grade === 'WHO-1' && !input.neurologicDeficit && !input.edemaOrMassEffect ? 'conditional' : 'indicated',
        intent: 'curative',
        fractionation: input.grade === 'WHO-1' && smallTumor ? radiosurgeryDose : undefined,
        targetVolumes: input.grade === 'WHO-1' && smallTumor ? meningiomaTargets(radiosurgeryDose, true) : undefined,
        oarConstraints: input.grade === 'WHO-1' && smallTumor ? meningiomaOars : undefined,
        rationale: [
          'Küçük, asemptomatik, yavaş büyüyen WHO grade 1 meningiomada seri MRI ile gözlem uygun olabilir.',
          'Semptomatik, büyüyen, kitle etkisi oluşturan veya güvenli şekilde çıkarılabilen tümörde maksimal güvenli rezeksiyon ve histopatolojik/moleküler değerlendirme esastır.',
          'Küçük ve kritik yapılardan uzak WHO grade 1 lezyonlarda SRS yüksek lokal kontrol sağlayabilir; optik yol/beyin sapı komşuluğunda fraksiyone RT düşünülür.',
        ],
        guidelineReferences: references(TRIALS[1]),
      });
      rtIndication = input.grade === 'WHO-1' && !input.neurologicDeficit ? 'conditional' : 'consider';
    } else if (input.setting === 'postoperative') {
      const grade3Dose = fraction(60, 30, 'conventional', '60 Gy / 30 fx');
      const grade2Dose = fraction(54, 30, 'conventional', '54 Gy / 30 fx');
      const grade1Dose = fraction(50.4, 28, 'conventional', '50.4 Gy / 28 fx; seçilmiş rezidüel veya yüksek riskli grade 1');
      const dose = input.grade === 'WHO-3' ? grade3Dose : input.grade === 'WHO-2' ? grade2Dose : grade1Dose;
      const indicated = input.grade === 'WHO-3' || input.resectionMargin === 'R1' || input.resectionMargin === 'R2' || input.residualTumor;
      recommendations.push({
        id: 'postoperative-meningioma',
        label: indicated ? 'Yüksek riskli/rezidüel meningiomada postoperatif fraksiyone RT' : 'WHO grade 1 R0 sonrası MRI sürveyansı',
        indication: indicated ? 'indicated' : 'not-indicated',
        intent: 'adjuvant',
        fractionation: indicated ? dose : undefined,
        targetVolumes: indicated ? meningiomaTargets(dose, false) : undefined,
        oarConstraints: indicated ? meningiomaOars : undefined,
        rationale: [
          'WHO grade 3, subtotal rezeksiyon/rezidüel tümör ve R1/R2 lokal hastalıkta postoperatif RT lokal kontrol amacıyla güçlü biçimde değerlendirilir.',
          'WHO grade 2 meningiomada postoperatif RT kararı rezeksiyon kapsamı, beyin invazyonu, proliferasyon, nüks riski ve klinik çalışma verileriyle bireyselleştirilir.',
          'WHO grade 1 ve tam rezeksiyon sonrası rutin adjuvan RT çoğu hastada gerekli değildir; seri kontrastlı MRI ile sürveyans esastır.',
        ],
        guidelineReferences: references(TRIALS[0], TRIALS[1], TRIALS[2]),
      });
      rtIndication = indicated ? 'indicated' : 'not-indicated';
      intent = 'adjuvant';
    } else if (input.setting === 'recurrent' || input.setting === 'progressive') {
      const salvageDose = fraction(25, 5, 'SRS', '25 Gy / 5 fx; kritik OAR komşuluğunda fraksiyone stereotaktik RT');
      recommendations.push({
        id: 'recurrent-meningioma',
        label: 'Nüks/progresif meningiomada yeniden cerrahi veya stereotaktik RT',
        indication: input.priorRadiotherapy ? 'consider' : 'indicated',
        intent: 'salvage',
        fractionation: salvageDose,
        targetVolumes: meningiomaTargets(salvageDose, true),
        oarConstraints: meningiomaOars,
        systemicTherapy: [systemic('palliative', 'RT-refrakter veya yaygın nükste klinik çalışma/anti-anjiyojenik seçenek', ['bevacizumab veya klinik çalışma'], 'Multidisipliner değerlendirme ve önceki tedavilere göre', '2B')],
        rationale: [
          'Lokalize ve rezeke edilebilir nükste yeniden cerrahi; cerrahiye uygun olmayan sınırlı nükste SRS veya fraksiyone stereotaktik RT tercih edilebilir.',
          'Önceden RT alanlarda yeniden ışınlama doz, aralık, hedef hacmi ve radyonekroz riskiyle sınırlıdır.',
          'Sistemik tedavi rutin ilk seçenek değildir; progresif, çoklu tedavi görmüş veya RT/cerrahiye uygun olmayan hastalarda klinik çalışma önceliklidir.',
        ],
        guidelineReferences: references(TRIALS[3]),
      });
      rtIndication = input.priorRadiotherapy ? 'consider' : 'indicated';
      intent = 'salvage';
    } else {
      intent = 'palliative';
      const palliativeDose = fraction(30, 10, 'moderate-hypofractionation', '30 Gy / 10 fx; semptom ve hedef hacmine göre');
      recommendations.push({
        id: 'advanced-meningioma',
        label: 'İleri meningiomada semptom odaklı RT ve sistemik/klinik çalışma yaklaşımı',
        indication: 'conditional',
        intent,
        fractionation: palliativeDose,
        targetVolumes: meningiomaTargets(palliativeDose, false),
        oarConstraints: meningiomaOars,
        systemicTherapy: [systemic('palliative', 'Klinik çalışma veya seçilmiş anti-anjiyojenik tedavi', ['bevacizumab veya klinik çalışma'], 'Performans durumu, semptom yükü ve önceki lokal tedavilere göre')],
        rationale: ['Metastatik/çok odaklı meningiomada tedavi semptom, nörolojik risk, tümör biyolojisi ve lokal seçeneklere göre belirlenir; rutin kemoterapi ve elektif nodal RT standart değildir.'],
        guidelineReferences: references(TRIALS[3]),
      });
      rtIndication = 'conditional';
    }

    rationale.push('Meningiom kararı; nöroşirürji, radyasyon onkolojisi, nöroradyoloji ve nöropatoloji konseyinde WHO grade, rezeksiyon kapsamı, MRI büyüme paterni ve kritik OAR ilişkisiyle kesinleştirilmelidir.');
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
      uncertainties: !input.grade || !input.surgeryType ? ['WHO grade veya cerrahi kapsam eksik; gözlem, RT ve cerrahi sıralaması değişebilir.'] : undefined,
      confidence: !input.grade || !input.surgeryType ? 0.74 : 0.88,
      generatedAt: new Date().toISOString(),
      guidelineReferences: recommendations.flatMap((recommendation) => recommendation.guidelineReferences ?? []),
    };
  }

  private summary(input: MeningiomaInput): string {
    if (input.setting === 'newly-diagnosed') return 'Yeni tanı meningiom: semptom, büyüme, WHO grade, tümör boyutu ve kritik OAR ilişkisine göre gözlem, cerrahi veya RT.';
    if (input.setting === 'postoperative') return 'Postoperatif meningiom: grade, rezeksiyon kapsamı, marjin ve rezidüye göre adjuvan RT veya MRI sürveyansı.';
    if (input.setting === 'recurrent' || input.setting === 'progressive') return 'Nüks/progresif meningiom: yeniden cerrahi, stereotaktik RT ve seçilmiş sistemik/klinik çalışma seçenekleri.';
    return 'İleri meningiom: semptom ve nörolojik risk odaklı lokal RT ve klinik çalışma yaklaşımı.';
  }
}

export const meningiomaEngine = new MeningiomaDecisionEngine();

export default meningiomaEngine;
