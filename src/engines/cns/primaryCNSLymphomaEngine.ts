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

export type PrimaryCNSLymphomaSetting = 'newly-diagnosed' | 'consolidation' | 'recurrent' | 'progressive' | 'palliative';
export type PrimaryCNSLymphomaSubtype = 'diffuse-large-B-cell' | 'T-cell' | 'other' | 'unknown';
export type PrimaryCNSLymphomaRisk = 'low' | 'intermediate' | 'high' | 'unknown';
export type PrimaryCNSLymphomaImmuneStatus = 'immunocompetent' | 'HIV-associated' | 'transplant-associated' | 'immunosuppressed-other' | 'unknown';
export type PrimaryCNSLymphomaResponse = 'complete-response' | 'partial-response' | 'stable' | 'progressive' | 'unknown';

export interface PrimaryCNSLymphomaInput extends ClinicalCaseInput {
  organSystem: 'cns';
  disease: 'primary-cns-lymphoma';
  setting: PrimaryCNSLymphomaSetting;
  stage?: TNMStage;
  subtype?: PrimaryCNSLymphomaSubtype;
  immuneStatus?: PrimaryCNSLymphomaImmuneStatus;
  riskCategory?: PrimaryCNSLymphomaRisk;
  response?: PrimaryCNSLymphomaResponse;
  deepBrainInvolvement?: boolean;
  ocularInvolvement?: boolean;
  leptomeningealInvolvement?: boolean;
  CSFPositive?: boolean;
  HIVViralLoadControlled?: boolean;
  CD4Count?: number;
  kidneyFunctionAdequate?: boolean;
  biopsyConfirmed?: boolean;
  surgeryType?: 'stereotactic-biopsy' | 'resection' | 'none' | 'unknown';
  priorRadiotherapy?: boolean;
  ageYears?: number;
  performanceStatusECOG?: number;
}

const NCCN: GuidelineReference = {
  organization: 'NCCN',
  title: 'NCCN Clinical Practice Guidelines in Oncology: Primary CNS Lymphoma',
  version: 'Current version; verify institutional subscription before use',
  url: 'https://www.nccn.org/guidelines/guidelines-detail?category=1&id=1475',
  evidenceLevel: '2A',
};

const ASTRO: GuidelineReference = {
  organization: 'ASTRO',
  title: 'ASTRO clinical practice resources for CNS lymphoma and radiotherapy',
  url: 'https://www.astro.org/Patient-Care-and-Research/Clinical-Practice-Statements/Clinical-Practice-Guidelines',
  evidenceLevel: 'B',
};

const ESTRO: GuidelineReference = {
  organization: 'ESTRO',
  title: 'ESTRO-EANO guidance for primary CNS lymphoma and CNS radiotherapy',
  url: 'https://www.estro.org/Science/Guidelines',
  evidenceLevel: 'B',
};

const TRIALS: GuidelineReference[] = [
  { organization: 'other', title: 'IELSG32: methotrexate-based induction and autologous stem-cell transplant in primary CNS lymphoma', url: 'https://doi.org/10.1016/S0140-6736(16)31553-3', evidenceLevel: '1' },
  { organization: 'other', title: 'IELSG32 consolidation: autologous stem-cell transplant versus whole-brain radiotherapy', url: 'https://doi.org/10.1016/S0140-6736(19)31226-0', evidenceLevel: '1' },
  { organization: 'other', title: 'MATRix: methotrexate, cytarabine, thiotepa and rituximab regimen in PCNSL', url: 'https://doi.org/10.1016/S0140-6736(16)31553-3', evidenceLevel: '1' },
  { organization: 'other', title: 'RTOG 1114: reduced-dose whole-brain radiotherapy in primary CNS lymphoma', url: 'https://clinicaltrials.gov/study/NCT01549184', evidenceLevel: '2A' },
  { organization: 'other', title: 'PRECIS: intensive chemotherapy with autologous transplant versus conventional chemotherapy plus WBRT', url: 'https://doi.org/10.1200/JCO.2017.72.2180', evidenceLevel: '1' },
];

export const PRIMARY_CNS_LYMPHOMA_INPUT_JSON_SCHEMA: JsonSchema = {
  $schema: 'http://json-schema.org/draft-07/schema#',
  $id: 'https://radonco.local/schema/primary-cns-lymphoma-input.json',
  title: 'Primary CNS lymphoma clinical case input',
  type: 'object',
  required: ['organSystem', 'disease', 'setting'],
  properties: {
    organSystem: { type: 'string', enum: ['cns'] },
    disease: { type: 'string', enum: ['primary-cns-lymphoma'] },
    setting: { type: 'string', enum: ['newly-diagnosed', 'consolidation', 'recurrent', 'progressive', 'palliative'] },
    stage: { type: 'object', additionalProperties: true },
    subtype: { type: 'string', enum: ['diffuse-large-B-cell', 'T-cell', 'other', 'unknown'] },
    immuneStatus: { type: 'string', enum: ['immunocompetent', 'HIV-associated', 'transplant-associated', 'immunosuppressed-other', 'unknown'] },
    riskCategory: { type: 'string', enum: ['low', 'intermediate', 'high', 'unknown'] },
    response: { type: 'string', enum: ['complete-response', 'partial-response', 'stable', 'progressive', 'unknown'] },
    deepBrainInvolvement: { type: 'boolean' },
    ocularInvolvement: { type: 'boolean' },
    leptomeningealInvolvement: { type: 'boolean' },
    CSFPositive: { type: 'boolean' },
    HIVViralLoadControlled: { type: 'boolean' },
    CD4Count: { type: 'number' },
    kidneyFunctionAdequate: { type: 'boolean' },
    biopsyConfirmed: { type: 'boolean' },
    surgeryType: { type: 'string', enum: ['stereotactic-biopsy', 'resection', 'none', 'unknown'] },
    priorRadiotherapy: { type: 'boolean' },
    ageYears: { type: 'number' },
    performanceStatusECOG: { type: 'number' },
  },
  additionalProperties: true,
};

export const PRIMARY_CNS_LYMPHOMA_OUTPUT_JSON_SCHEMA: JsonSchema = {
  $schema: 'http://json-schema.org/draft-07/schema#',
  $id: 'https://radonco.local/schema/primary-cns-lymphoma-result.json',
  title: 'Primary CNS lymphoma CDSS result',
  type: 'object',
  required: ['schemaVersion', 'engineId', 'engineVersion', 'organSystem', 'rtIndication', 'intent', 'summary', 'recommendations'],
  properties: {
    schemaVersion: { type: 'string', enum: ['1.0'] },
    engineId: { type: 'string', enum: ['cns.primary-cns-lymphoma'] },
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

const lymphomaTargets = (dose: Fractionation, reducedDose = false): TargetVolume[] => [
  {
    name: 'GTV',
    description: 'Kontrastlı beyin MRI ile belirlenen tüm lenfoma odakları ve rezidüel lezyonlar.',
    dose,
    margin: 'Görüntülenebilir tümör; göz/CSF tutulumu klinik bağlama göre',
  },
  {
    name: 'CTV',
    description: 'Tüm beyin ve gerekirse göz/meningeal risk alanları; PCNSL’de rutin fokal nodal/ENI yaklaşımı yoktur.',
    dose,
    margin: reducedDose ? 'GTV/rezidüel alan çevresinde yaklaşık 1-2 cm; modern MRI/IGRT ile' : 'Tüm beyin veya riskli meningeal alan; protokole göre',
  },
  {
    name: 'PTV',
    description: 'Kraniyal immobilizasyon ve günlük IGRT belirsizliği.',
    dose,
    margin: '2-5 mm; maske ve CBCT/IGRT ile',
  },
];

const lymphomaOars: OARConstraint[] = [
  { organ: 'Optic nerves and chiasm', metric: 'Dmax', limit: 54, unit: 'Gy', priority: 'mandatory', source: 'QUANTEC', sourceReference: 'Conventional fractionation optic pathway tolerance' },
  { organ: 'Brainstem', metric: 'Dmax', limit: 54, unit: 'Gy', priority: 'mandatory', source: 'QUANTEC', sourceReference: 'Conventional fractionation brainstem tolerance' },
  { organ: 'Eyes/lenses', metric: 'Dmax', limit: 10, unit: 'Gy', priority: 'optimal', source: 'QUANTEC', sourceReference: 'Lens/ocular structure sparing objective' },
  { organ: 'Hippocampi', metric: 'D100%', limit: 9, unit: 'Gy', priority: 'optimal', source: 'protocol', sourceReference: 'Hippocampal avoidance WBRT planning objective' },
  { organ: 'Normal brain', metric: 'V12', limit: 5, unit: 'cc', priority: 'optimal', source: 'HyTEC', sourceReference: 'Stereotactic radionecrosis risk objective' },
];

const systemic = (setting: SystemicTherapyRecommendation['setting'], regimen: string, agents: string[], timing: string, evidenceLevel: SystemicTherapyRecommendation['evidenceLevel'] = '1'): SystemicTherapyRecommendation => ({ setting, regimen, agents, timing, evidenceLevel });
const references = (...extra: GuidelineReference[]): GuidelineReference[] => [NCCN, ASTRO, ESTRO, ...extra];

export class PrimaryCNSLymphomaDecisionEngine extends BaseDecisionEngine<PrimaryCNSLymphomaInput> {
  public readonly id = 'cns.primary-cns-lymphoma';
  public readonly version = '1.0.0';
  public readonly inputSchema = PRIMARY_CNS_LYMPHOMA_INPUT_JSON_SCHEMA;
  public readonly outputSchema = PRIMARY_CNS_LYMPHOMA_OUTPUT_JSON_SCHEMA;

  public constructor() {
    super('1.0.0');
  }

  protected evaluateCase(input: PrimaryCNSLymphomaInput): CDSSResult {
    const recommendations: ClinicalRecommendation[] = [];
    const rationale: string[] = [];
    const warnings: string[] = [];
    let rtIndication: CDSSResult['rtIndication'] = 'not-indicated';
    let intent: CDSSResult['intent'] = 'curative';

    if (!input.biopsyConfirmed) warnings.push('PCNSL şüphesinde kortikosteroid biyopsi duyarlılığını azaltabilir; mümkünse steroid başlamadan stereotaktik biyopsi ve hematopatolojik doğrulama planlanmalıdır.');
    if (input.immuneStatus === 'HIV-associated' && !input.HIVViralLoadControlled) warnings.push('HIV ilişkili PCNSL’de antiretroviral tedavi, enfeksiyon profilaksisi ve CD4/viral yük optimizasyonu kemoterapi ile birlikte yönetilmelidir.');
    if (input.kidneyFunctionAdequate === false) warnings.push('Yüksek doz metotreksat için renal fonksiyon yetersizliği varsa dozlama, hidrasyon/alkalinizasyon ve alternatif tedavi hematoloji MDT’sinde planlanmalıdır.');
    if (input.deepBrainInvolvement || input.leptomeningealInvolvement || input.ocularInvolvement) warnings.push('Derin, göz veya leptomeningeal tutulumda sistemik ve/veya intratekal CNS-aktif tedavi gereksinimi artar; yalnız RT ile tedavi edilmemelidir.');
    if (input.priorRadiotherapy) warnings.push('Önceki kraniyal RT mevcut; yeniden ışınlama öncesi kümülatif optik yol, beyin sapı ve normal beyin dozları değerlendirilmelidir.');

    if (input.setting === 'newly-diagnosed') {
      const systemicTherapy: SystemicTherapyRecommendation[] = [
        systemic('induction', 'Yüksek doz metotreksat tabanlı immünokemoterapi', ['MATRix: methotrexate + cytarabine + thiotepa + rituximab'], 'Renal fonksiyon, yaş, performans ve enfeksiyon riskine göre; hematoloji gözetiminde'),
      ];
      if (input.ocularInvolvement || input.leptomeningealInvolvement || input.CSFPositive) systemicTherapy.push(systemic('induction', 'Seçilmiş oküler/CSF tutulumunda intratekal tedavi', ['intratekal methotrexate veya cytarabine'], 'BOS akışı ve hematoloji/nöro-onkoloji protokolüne göre', '2A'));
      recommendations.push({
        id: 'new-primary-cns-lymphoma',
        label: 'Biyopsi ile doğrulama + yüksek doz metotreksat tabanlı indüksiyon; RT yalnız seçilmiş konsolidasyon/palyasyon',
        indication: 'indicated',
        intent: 'curative',
        systemicTherapy,
        rationale: [
          'PCNSL’de tanısal stereotaktik biyopsi ve hematopatolojik/moleküler doğrulama temel adımdır; geniş rezeksiyon çoğu hastada standart değildir.',
          'Yüksek doz metotreksat tabanlı rejimler ve rituksimab, tedavinin omurgasıdır; MATRix uygun hastalarda güçlü kanıt sağlar.',
          'Yeni tanıda rutin WBRT nörokognitif toksisite nedeniyle otomatik standart değildir; konsolidasyon kararı yanıt, yaş, performans ve transplant uygunluğuna göre belirlenir.',
        ],
        guidelineReferences: references(TRIALS[0], TRIALS[2]),
      });
      rtIndication = 'conditional';
    } else if (input.setting === 'consolidation') {
      const reducedDose = fraction(23.4, 13, 'conventional', '23.4 Gy / 13 fx; tam yanıt sonrası düşük doz WBRT konsolidasyonu');
      const standardDose = fraction(36, 20, 'conventional', '36 Gy / 20 fx; seçilmiş konsolidasyon veya rezidüel hastalık');
      const dose = input.response === 'complete-response' ? reducedDose : standardDose;
      recommendations.push({
        id: 'pcns-lymphoma-consolidation',
        label: input.response === 'complete-response' ? 'Tam yanıt sonrası seçilmiş düşük doz WBRT veya otolog kök hücre nakli' : 'Rezidüel/parsiyel yanıtta konsolidasyon ve hematoloji temelli tedavi',
        indication: input.response === 'complete-response' ? 'conditional' : 'consider',
        intent: 'adjuvant',
        fractionation: dose,
        targetVolumes: lymphomaTargets(dose, input.response === 'complete-response'),
        oarConstraints: lymphomaOars,
        systemicTherapy: [systemic('maintenance', 'Konsolidasyon otolog kök hücre nakli değerlendirmesi', ['thiotepa-bazlı yüksek doz kemoterapi + ASCT'], 'Uygun yaş/organ fonksiyonu ve yanıt durumunda; WBRT ile alternatif/ardışık karar', '1')],
        rationale: [
          'IELSG32 ve PRECIS, uygun hastada otolog kök hücre naklinin konsolidasyon seçeneği olduğunu destekler.',
          'Tam yanıt sonrası düşük doz WBRT, seçilmiş hastada nörokognitif toksisiteyi azaltan bir yaklaşım olabilir; yaş, MRI yanıtı ve transplant uygunluğu belirleyicidir.',
          'Rutin fokal boost veya elektif nodal ışınlama PCNSL’de önerilmez; tüm beyin/meningeal risk alanı protokole göre kapsanır.',
        ],
        guidelineReferences: references(TRIALS[1], TRIALS[4]),
      });
      rtIndication = 'conditional';
      intent = 'adjuvant';
    } else if (input.setting === 'recurrent' || input.setting === 'progressive') {
      const salvageDose = fraction(30, 15, 'conventional', '30 Gy / 15 fx; seçilmiş lokal nüks veya palyatif WBRT');
      recommendations.push({
        id: 'recurrent-pcns-lymphoma',
        label: 'Nüks/progresif PCNSL’de salvage sistemik tedavi, transplant veya seçilmiş WBRT',
        indication: input.priorRadiotherapy ? 'consider' : 'indicated',
        intent: 'salvage',
        fractionation: salvageDose,
        targetVolumes: lymphomaTargets(salvageDose, true),
        oarConstraints: lymphomaOars,
        systemicTherapy: [systemic('palliative', 'Salvage CNS-aktif tedavi', ['lenalidomide, ibrutinib, temozolomide veya yüksek doz kemoterapi/ASCT'], 'Önceki tedavi, yaş, organ fonksiyonu ve klinik çalışma durumuna göre', '2A')],
        rationale: [
          'Nükste sistemik CNS-penetran tedavi ve uygun hastada otolog kök hücre nakli, RT’den önce veya RT ile birlikte değerlendirilir.',
          'Önceden WBRT almış hastada yeniden RT seçilmiş sınırlı hacim ve kabul edilebilir nörotoksisite riskinde düşünülebilir.',
          'SRS yalnız çok küçük, sınırlı ve fokal nükslerde seçilmiş bir seçenek olabilir; PCNSL’nin infiltratif doğası nedeniyle rutin yaklaşım değildir.',
        ],
        guidelineReferences: references(TRIALS[0], TRIALS[4]),
      });
      rtIndication = input.priorRadiotherapy ? 'consider' : 'conditional';
      intent = 'salvage';
    } else {
      intent = 'palliative';
      const palliativeDose = fraction(20, 5, 'moderate-hypofractionation', '20 Gy / 5 fx; semptomatik kraniyal hastalık');
      recommendations.push({
        id: 'palliative-pcns-lymphoma',
        label: 'PCNSL’de semptom odaklı kısa RT ve destek tedavisi',
        indication: 'conditional',
        intent,
        fractionation: palliativeDose,
        targetVolumes: lymphomaTargets(palliativeDose, true),
        oarConstraints: lymphomaOars,
        systemicTherapy: [systemic('palliative', 'Destek tedavisi ve seçilmiş düşük yoğunluklu CNS-aktif tedavi', ['steroid, temozolomide veya uygun klinik çalışma'], 'Performans ve hedeflere göre', '2B')],
        rationale: ['Kötü performans veya yoğun tedaviye uygun olmayan hastada kısa RT, steroid, nöbet/ödem kontrolü ve erken palyatif bakım birlikte planlanır.'],
        guidelineReferences: references(TRIALS[0]),
      });
      rtIndication = 'conditional';
    }

    rationale.push('PCNSL kararı; nöro-onkoloji, hematoloji, radyasyon onkolojisi, nöroşirürji, enfeksiyon hastalıkları ve nöroradyoloji konseyinde biyopsi, göz/CSF tutulumu, immün durum ve organ fonksiyonlarıyla verilmelidir.');
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
      uncertainties: !input.biopsyConfirmed || !input.response || !input.kidneyFunctionAdequate ? ['Biyopsi doğrulaması, yanıt durumu veya renal uygunluk eksik; metotreksat ve RT konsolidasyon seçimi değişebilir.'] : undefined,
      confidence: !input.biopsyConfirmed || !input.response || !input.kidneyFunctionAdequate ? 0.7 : 0.88,
      generatedAt: new Date().toISOString(),
      guidelineReferences: recommendations.flatMap((recommendation) => recommendation.guidelineReferences ?? []),
    };
  }

  private summary(input: PrimaryCNSLymphomaInput): string {
    if (input.setting === 'newly-diagnosed') return 'Yeni tanı PCNSL: biyopsi doğrulaması ve yüksek doz metotreksat tabanlı sistemik tedavi; seçilmiş konsolidasyon RT.';
    if (input.setting === 'consolidation') return 'PCNSL konsolidasyonu: yanıt ve uygunluk durumuna göre düşük doz WBRT veya otolog kök hücre nakli.';
    if (input.setting === 'recurrent' || input.setting === 'progressive') return 'Nüks/progresif PCNSL: CNS-aktif salvage tedavi, transplant ve seçilmiş RT.';
    return 'PCNSL: semptom odaklı kısa RT, steroid ve destek tedavisi.';
  }
}

export const primaryCNSLymphomaEngine = new PrimaryCNSLymphomaDecisionEngine();

export default primaryCNSLymphomaEngine;
