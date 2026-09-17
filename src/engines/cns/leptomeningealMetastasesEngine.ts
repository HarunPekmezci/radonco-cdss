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

export type LeptomeningealSetting = 'newly-diagnosed' | 'progressive' | 'recurrent' | 'palliative';
export type LeptomeningealPrimary = 'NSCLC' | 'breast' | 'melanoma' | 'hematologic' | 'gastrointestinal' | 'other' | 'unknown';
export type LeptomeningealPattern = 'linear' | 'nodular' | 'mixed' | 'hydrocephalus-dominant' | 'unknown';
export type LeptomeningealMolecularFinding = 'EGFR' | 'ALK' | 'HER2' | 'ROS1' | 'BRAF-V600E' | 'RET' | 'MET' | 'ER-positive' | 'ER-negative' | 'none' | 'unknown';

export interface LeptomeningealMetastasesInput extends ClinicalCaseInput {
  organSystem: 'cns';
  disease: 'leptomeningeal-metastases';
  setting: LeptomeningealSetting;
  stage?: TNMStage;
  primary?: LeptomeningealPrimary;
  molecularFinding?: LeptomeningealMolecularFinding;
  imagingPattern?: LeptomeningealPattern;
  brainMRIPositive?: boolean;
  spineMRIPositive?: boolean;
  csfCytologyPositive?: boolean;
  csfCirculatingTumorDNA?: boolean;
  hydrocephalus?: boolean;
  obstructiveHydrocephalus?: boolean;
  symptomatic?: boolean;
  neurologicDeficit?: boolean;
  bulkyNodularDisease?: boolean;
  extracranialDiseaseControlled?: boolean;
  performanceStatusECOG?: number;
  priorCranialRT?: boolean;
  priorSpinalRT?: boolean;
  priorIntrathecalTherapy?: boolean;
  csfFlowStudyCompleted?: boolean;
  csfFlowObstruction?: boolean;
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
  title: 'ASTRO clinical practice resources for brain metastases and CNS radiotherapy',
  url: 'https://www.astro.org/Patient-Care-and-Research/Clinical-Practice-Statements/Clinical-Practice-Guidelines',
  evidenceLevel: 'B',
};

const ESTRO: GuidelineReference = {
  organization: 'ESTRO',
  title: 'ESTRO-EANO clinical guidance for leptomeningeal metastases and CNS radiotherapy',
  url: 'https://www.estro.org/Science/Guidelines',
  evidenceLevel: 'B',
};

const TRIALS: GuidelineReference[] = [
  { organization: 'other', title: 'EANO-ESMO clinical practice guideline for brain and leptomeningeal metastases', url: 'https://doi.org/10.1016/j.annonc.2021.07.016', evidenceLevel: 'B' },
  { organization: 'other', title: 'BLOOM: intrathecal osimertinib in EGFR-mutant NSCLC with leptomeningeal metastases', url: 'https://doi.org/10.1016/S1470-2045(19)30035-3', evidenceLevel: '2A' },
  { organization: 'other', title: 'SYMPToM: intrathecal trastuzumab in HER2-positive breast cancer leptomeningeal disease', url: 'https://doi.org/10.1016/j.ejca.2022.04.007', evidenceLevel: '2B' },
  { organization: 'other', title: 'CNS metastatic disease response assessment: RANO-LM criteria', url: 'https://doi.org/10.1093/neuonc/noy067', evidenceLevel: 'B' },
];

export const LEPTOMENINGEAL_METASTASES_INPUT_JSON_SCHEMA: JsonSchema = {
  $schema: 'http://json-schema.org/draft-07/schema#',
  $id: 'https://radonco.local/schema/leptomeningeal-metastases-input.json',
  title: 'Leptomeningeal metastases clinical case input',
  type: 'object',
  required: ['organSystem', 'disease', 'setting'],
  properties: {
    organSystem: { type: 'string', enum: ['cns'] },
    disease: { type: 'string', enum: ['leptomeningeal-metastases'] },
    setting: { type: 'string', enum: ['newly-diagnosed', 'progressive', 'recurrent', 'palliative'] },
    stage: { type: 'object', additionalProperties: true },
    primary: { type: 'string', enum: ['NSCLC', 'breast', 'melanoma', 'hematologic', 'gastrointestinal', 'other', 'unknown'] },
    molecularFinding: { type: 'string' },
    imagingPattern: { type: 'string', enum: ['linear', 'nodular', 'mixed', 'hydrocephalus-dominant', 'unknown'] },
    brainMRIPositive: { type: 'boolean' },
    spineMRIPositive: { type: 'boolean' },
    csfCytologyPositive: { type: 'boolean' },
    csfCirculatingTumorDNA: { type: 'boolean' },
    hydrocephalus: { type: 'boolean' },
    obstructiveHydrocephalus: { type: 'boolean' },
    symptomatic: { type: 'boolean' },
    neurologicDeficit: { type: 'boolean' },
    bulkyNodularDisease: { type: 'boolean' },
    extracranialDiseaseControlled: { type: 'boolean' },
    performanceStatusECOG: { type: 'number' },
    priorCranialRT: { type: 'boolean' },
    priorSpinalRT: { type: 'boolean' },
    priorIntrathecalTherapy: { type: 'boolean' },
    csfFlowStudyCompleted: { type: 'boolean' },
    csfFlowObstruction: { type: 'boolean' },
  },
  additionalProperties: true,
};

export const LEPTOMENINGEAL_METASTASES_OUTPUT_JSON_SCHEMA: JsonSchema = {
  $schema: 'http://json-schema.org/draft-07/schema#',
  $id: 'https://radonco.local/schema/leptomeningeal-metastases-result.json',
  title: 'Leptomeningeal metastases CDSS result',
  type: 'object',
  required: ['schemaVersion', 'engineId', 'engineVersion', 'organSystem', 'rtIndication', 'intent', 'summary', 'recommendations'],
  properties: {
    schemaVersion: { type: 'string', enum: ['1.0'] },
    engineId: { type: 'string', enum: ['cns.leptomeningeal-metastases'] },
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

const leptomeningealTargets = (dose: Fractionation, craniospinal: boolean): TargetVolume[] => [
  {
    name: 'GTV',
    description: 'Kontrastlı beyin/spinal MRI ile tanımlanan nodüler leptomeningeal odak, semptomatik bası veya bulky hastalık.',
    dose,
    margin: 'Görüntülenebilir nodüler/semptomatik hastalık',
  },
  {
    name: 'CTV',
    description: craniospinal
      ? 'Tüm kraniospinal subaraknoid boşluk; nodüler/semptomatik odaklara boost.'
      : 'Semptomatik/nodüler leptomeningeal odak veya ilgili nöroaksiyel segment; rutin elektif nodal alan yoktur.',
    dose,
    margin: craniospinal ? 'Beyin ve tüm spinal subaraknoid alan; MRI/CSF ve akış çalışmasına göre' : 'Fokal anatomik alan; görüntüleme ve BOS dağılımına göre',
  },
  {
    name: 'PTV',
    description: 'Kraniyal/spinal immobilizasyon ve günlük IGRT belirsizliği.',
    dose,
    margin: 'Günlük CBCT/IGRT ile yaklaşık 2-5 mm; proton CSI’de kurum protokolüne göre',
  },
];

const leptomeningealOars: OARConstraint[] = [
  { organ: 'Brainstem', metric: 'Dmax', limit: 54, unit: 'Gy', priority: 'mandatory', source: 'QUANTEC', sourceReference: 'Conventional fractionation brainstem tolerance' },
  { organ: 'Optic nerves and chiasm', metric: 'Dmax', limit: 54, unit: 'Gy', priority: 'mandatory', source: 'QUANTEC', sourceReference: 'Conventional fractionation optic pathway tolerance' },
  { organ: 'Spinal cord', metric: 'Dmax', limit: 45, unit: 'Gy', priority: 'mandatory', source: 'QUANTEC', sourceReference: 'Spinal cord tolerance' },
  { organ: 'Cochleae', metric: 'Dmean', limit: 35, unit: 'Gy', priority: 'optimal', source: 'protocol', sourceReference: 'Craniospinal radiotherapy hearing preservation objective' },
  { organ: 'Kidneys', metric: 'Dmean', limit: 18, unit: 'Gy', priority: 'optimal', source: 'QUANTEC', sourceReference: 'Craniospinal radiotherapy renal objective' },
  { organ: 'Heart', metric: 'Dmean', limit: 26, unit: 'Gy', priority: 'optimal', source: 'QUANTEC', sourceReference: 'Craniospinal radiotherapy cardiac objective' },
];

const systemic = (setting: SystemicTherapyRecommendation['setting'], regimen: string, agents: string[], timing: string, evidenceLevel: SystemicTherapyRecommendation['evidenceLevel'] = '2A'): SystemicTherapyRecommendation => ({ setting, regimen, agents, timing, evidenceLevel });
const references = (...extra: GuidelineReference[]): GuidelineReference[] => [NCCN, ASTRO, ESTRO, ...extra];

export class LeptomeningealMetastasesDecisionEngine extends BaseDecisionEngine<LeptomeningealMetastasesInput> {
  public readonly id = 'cns.leptomeningeal-metastases';
  public readonly version = '1.0.0';
  public readonly inputSchema = LEPTOMENINGEAL_METASTASES_INPUT_JSON_SCHEMA;
  public readonly outputSchema = LEPTOMENINGEAL_METASTASES_OUTPUT_JSON_SCHEMA;

  public constructor() {
    super('1.0.0');
  }

  protected evaluateCase(input: LeptomeningealMetastasesInput): CDSSResult {
    const recommendations: ClinicalRecommendation[] = [];
    const rationale: string[] = [];
    const warnings: string[] = [];
    let rtIndication: CDSSResult['rtIndication'] = 'conditional';
    let intent: CDSSResult['intent'] = 'palliative';
    const symptomatic = Boolean(input.symptomatic || input.neurologicDeficit || input.hydrocephalus);
    const bulky = Boolean(input.bulkyNodularDisease || input.imagingPattern === 'nodular' || input.imagingPattern === 'mixed');
    const diffuse = Boolean(input.brainMRIPositive && input.spineMRIPositive) || input.imagingPattern === 'linear' || input.setting === 'newly-diagnosed';

    if (input.obstructiveHydrocephalus) warnings.push('Obstrüktif hidrosefali acil nöroşirürjik değerlendirme, BOS diversiyonu ve RT/intratekal tedavi öncesi akışın düzeltilmesini gerektirir.');
    if (!input.brainMRIPositive || !input.spineMRIPositive || !input.csfFlowStudyCompleted) warnings.push('Beyin ve tüm spinal MRI, BOS sitolojisi/ctDNA ve intratekal tedavi planlanıyorsa BOS akış çalışması tamamlanmalıdır.');
    if (input.priorCranialRT || input.priorSpinalRT) warnings.push('Önceki kraniyal/spinal RT mevcut; kümülatif beyin sapı, optik yol, spinal kord, böbrek ve kalp dozları hesaplanmalıdır.');
    if (input.csfFlowObstruction) warnings.push('BOS akım obstrüksiyonu intratekal ilaç dağılımını bozabilir; obstrüksiyon giderilmeden intratekal tedavi uygulanmamalıdır.');

    if (input.setting === 'newly-diagnosed' || input.setting === 'progressive') {
      const focalDose = fraction(30, 10, 'moderate-hypofractionation', '30 Gy / 10 fx; semptomatik/bulky fokal alan');
      const csiDose = fraction(36, 20, 'conventional', '36 Gy / 20 fx kraniospinal RT; seçilmiş iyi performanslı hastada');
      const systemicTherapy: SystemicTherapyRecommendation[] = [];
      if (input.molecularFinding === 'EGFR') systemicTherapy.push(systemic('maintenance', 'CNS-aktif EGFR hedefli tedavi', ['osimertinib'], 'BLOOM verileri ve ekstrakraniyal kontrolle birlikte; RT ile ardışıklık MDT’de'));
      if (input.molecularFinding === 'ALK') systemicTherapy.push(systemic('maintenance', 'CNS-aktif ALK hedefli tedavi', ['lorlatinib veya alectinib'], 'Primer tümör yanıtı, ilaç penetrasyonu ve RT zamanlamasına göre'));
      if (input.molecularFinding === 'HER2') systemicTherapy.push(systemic('maintenance', 'HER2 hedefli sistemik/intratekal yaklaşım', ['trastuzumab deruxtecan veya intratekal trastuzumab'], 'Primer meme kanseri, BOS yanıtı ve multidisipliner karara göre'));
      if (input.primary === 'melanoma' && input.molecularFinding === 'BRAF-V600E') systemicTherapy.push(systemic('maintenance', 'BRAF/MEK hedefli tedavi', ['dabrafenib + trametinib'], 'İntrakraniyal ve ekstrakraniyal yanıtla birlikte'));
      if (input.csfFlowStudyCompleted && !input.csfFlowObstruction) systemicTherapy.push(systemic('palliative', 'Seçilmiş hastada intratekal tedavi', ['intratekal methotrexate, cytarabine veya trastuzumab'], 'BOS akışı açık, nörolojik olarak uygun ve primer tümöre göre; merkez deneyimi/klinik çalışma ile', '2B'));
      const useCsi = diffuse && !symptomatic && Boolean(input.extracranialDiseaseControlled) && (input.performanceStatusECOG === undefined || input.performanceStatusECOG <= 2);
      const dose = useCsi ? csiDose : focalDose;
      recommendations.push({
        id: 'initial-leptomeningeal-management',
        label: useCsi ? 'Seçilmiş iyi performanslı hastada kraniospinal RT + CNS-aktif sistemik/intratekal tedavi' : 'Semptomatik/bulky leptomeningeal hastalıkta fokal RT + CNS-aktif sistemik/intratekal tedavi',
        indication: symptomatic || bulky ? 'indicated' : 'conditional',
        intent: 'palliative',
        fractionation: dose,
        targetVolumes: leptomeningealTargets(dose, useCsi),
        oarConstraints: leptomeningealOars,
        systemicTherapy: systemicTherapy.length ? systemicTherapy : undefined,
        rationale: [
          'Semptomatik nodüler hastalık, kord/kraniyal sinir basısı veya hidrosefalide en acil tehdit oluşturan fokal alanlara RT uygulanır.',
          useCsi ? 'Seçilmiş ECOG 0-2, ekstrakraniyal kontrolü olan ve organ toleransı uygun hastada proton/konformal kraniospinal RT düşünülebilir; toksisite ve nöroaksiyel hacim dikkatle değerlendirilir.' : 'Yaygın tedavide amaç nörolojik semptom kontrolü ve yaşam kalitesidir; fokal RT alanı MRI/CSF dağılımına göre belirlenir.',
          'EANO-ESMO ve RANO-LM yaklaşımı, beyin/spinal MRI, tekrarlayan BOS değerlendirmesi ve nörolojik yanıtın birlikte izlenmesini destekler.',
        ],
        guidelineReferences: references(TRIALS[0], TRIALS[1], TRIALS[3]),
      });
      rtIndication = symptomatic || bulky ? 'indicated' : 'conditional';
    } else if (input.setting === 'recurrent') {
      const salvageDose = fraction(20, 5, 'moderate-hypofractionation', '20 Gy / 5 fx; daha önce ışınlanmış sınırlı semptomatik alan');
      recommendations.push({
        id: 'recurrent-leptomeningeal-management',
        label: 'Nüks leptomeningeal hastalıkta seçilmiş salvage fokal RT ve tedavi değişikliği',
        indication: input.priorCranialRT || input.priorSpinalRT ? 'consider' : 'conditional',
        intent: 'salvage',
        fractionation: salvageDose,
        targetVolumes: leptomeningealTargets(salvageDose, false),
        oarConstraints: leptomeningealOars,
        systemicTherapy: [systemic('palliative', 'Önceki tedavilere göre CNS-aktif sistemik/intratekal salvage', ['moleküler hedefli tedavi veya klinik çalışma'], 'BOS ve MRI yanıtı, akış durumu ve performansa göre', '2B')],
        rationale: [
          'Nüks leptomeningeal hastalıkta yeniden RT yalnızca sınırlı semptomatik/progresif alan ve kabul edilebilir kümülatif OAR dozu varsa düşünülür.',
          'Klinik çalışma, moleküler hedefli tedavi ve uygun hastada intratekal tedavi çoğu zaman RT ile birlikte değerlendirilmelidir.',
        ],
        guidelineReferences: references(TRIALS[0], TRIALS[3]),
      });
      rtIndication = input.priorCranialRT || input.priorSpinalRT ? 'consider' : 'conditional';
      intent = 'salvage';
    } else {
      const palliativeDose = fraction(20, 5, 'moderate-hypofractionation', '20 Gy / 5 fx; kısa yaşam beklentisi veya semptomatik odak');
      recommendations.push({
        id: 'palliative-leptomeningeal-management',
        label: 'Leptomeningeal hastalıkta kısa semptom odaklı RT ve erken palyatif bakım',
        indication: symptomatic ? 'indicated' : 'conditional',
        intent,
        fractionation: palliativeDose,
        targetVolumes: leptomeningealTargets(palliativeDose, false),
        oarConstraints: leptomeningealOars,
        rationale: [
          'Kötü performans veya kısa beklenen yaşam süresinde kısa fokal RT, kortikosteroid, analjezi ve erken palyatif bakım önceliklidir.',
          'Yaygın nöroaksiyel hastalıkta tedavi hedefi nörolojik kötüleşmeyi yavaşlatmak ve yaşam kalitesini korumaktır.',
        ],
        guidelineReferences: references(TRIALS[0]),
      });
      rtIndication = symptomatic ? 'indicated' : 'conditional';
    }

    rationale.push('Leptomeningeal metastaz kararı; medikal/radyasyon onkolojisi, nöroşirürji, nöroradyoloji, nöroloji, BOS laboratuvarı ve palyatif bakım ekipleriyle; primer biyoloji, MRI/CSF bulguları, BOS akışı ve hasta hedeflerine göre verilmelidir.');
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
      uncertainties: !input.primary || input.brainMRIPositive === undefined || input.spineMRIPositive === undefined || input.csfCytologyPositive === undefined ? ['Primer tümör veya nöroaksiyel/BOS evrelemesi eksik; RT ve intratekal tedavi seçimi değişebilir.'] : undefined,
      confidence: !input.primary || input.brainMRIPositive === undefined || input.spineMRIPositive === undefined || input.csfCytologyPositive === undefined ? 0.7 : 0.86,
      generatedAt: new Date().toISOString(),
      guidelineReferences: recommendations.flatMap((recommendation) => recommendation.guidelineReferences ?? []),
    };
  }

  private summary(input: LeptomeningealMetastasesInput): string {
    if (input.setting === 'newly-diagnosed' || input.setting === 'progressive') return 'Yeni/progresif leptomeningeal metastaz: MRI/CSF evreleme, semptomatik fokal veya seçilmiş kraniospinal RT ve CNS-aktif tedavi.';
    if (input.setting === 'recurrent') return 'Nüks leptomeningeal metastaz: kümülatif doz güvenliğiyle seçilmiş salvage RT ve sistemik/intratekal tedavi.';
    return 'Leptomeningeal metastaz: kısa semptom odaklı RT, BOS akışı yönetimi ve erken palyatif bakım.';
  }
}

export const leptomeningealMetastasesEngine = new LeptomeningealMetastasesDecisionEngine();

export default leptomeningealMetastasesEngine;
