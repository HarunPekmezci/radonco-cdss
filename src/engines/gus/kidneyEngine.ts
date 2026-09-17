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

export type KidneySetting =
  | 'localized'
  | 'locally-advanced'
  | 'post-nephrectomy'
  | 'oligometastatic'
  | 'metastatic';

export type KidneyHistology = 'clear-cell' | 'papillary' | 'chromophobe' | 'collecting-duct' | 'other' | 'unknown';
export type KidneyResectability = 'resectable' | 'borderline' | 'unresectable' | 'unknown';
export type KidneySurgery = 'partial-nephrectomy' | 'radical-nephrectomy' | 'ablation' | 'none' | 'unknown';
export type KidneyMolecularFinding = 'VHL' | 'MET' | 'FH-deficient' | 'TSC1-TSC2' | 'MSI-H' | 'dMMR' | 'none' | 'unknown';

export interface KidneyInput extends ClinicalCaseInput {
  organSystem: 'gus';
  disease: 'renal-cell-carcinoma';
  setting: KidneySetting;
  stage?: TNMStage;
  histology?: KidneyHistology;
  tumorSizeCm?: number;
  renalTumorLocation?: 'peripheral' | 'central' | 'hilar' | 'multifocal' | 'unknown';
  resectability?: KidneyResectability;
  surgeryType?: KidneySurgery;
  surgicalMargin?: 'R0' | 'R1' | 'R2' | 'RX' | 'not-applicable';
  nodalStatus?: 'N0' | 'N1' | 'unknown';
  metastases?: string[];
  solitaryKidney?: boolean;
  baselineEGFR?: number;
  chronicKidneyDisease?: boolean;
  medicallyInoperable?: boolean;
  priorAbdominalRT?: boolean;
  oligometastaticControlled?: boolean;
  immunotherapyContraindicated?: boolean;
  molecularFinding?: KidneyMolecularFinding;
  symptoms?: string[];
}

const NCCN: GuidelineReference = {
  organization: 'NCCN',
  title: 'NCCN Clinical Practice Guidelines in Oncology: Kidney Cancer',
  version: 'Current version; verify institutional subscription before use',
  url: 'https://www.nccn.org/guidelines/guidelines-detail?category=1&id=1440',
  evidenceLevel: '2A',
};

const ASTRO: GuidelineReference = {
  organization: 'ASTRO',
  title: 'ASTRO guideline and consensus resources for renal cell carcinoma and oligometastatic radiotherapy',
  url: 'https://www.astro.org/Patient-Care-and-Research/Clinical-Practice-Statements',
  evidenceLevel: 'B',
};

const ESTRO: GuidelineReference = {
  organization: 'ESTRO',
  title: 'ESTRO-ACROP recommendations for stereotactic radiotherapy and oligometastatic disease',
  url: 'https://www.estro.org/Science/Guidelines',
  evidenceLevel: 'B',
};

const TRIALS: GuidelineReference[] = [
  {
    organization: 'other',
    title: 'KEYNOTE-564: adjuvant pembrolizumab after nephrectomy for high-risk clear-cell RCC',
    url: 'https://doi.org/10.1056/NEJMoa2106391',
    evidenceLevel: '1',
  },
  {
    organization: 'other',
    title: 'NORDIC-SUN: cytoreductive nephrectomy and systemic therapy in metastatic RCC',
    url: 'https://clinicaltrials.gov/study/NCT03977571',
    evidenceLevel: '2A',
  },
  {
    organization: 'other',
    title: 'NCT00922974: prospective SBRT study for medically inoperable primary renal tumors',
    url: 'https://clinicaltrials.gov/study/NCT00922974',
    evidenceLevel: '2A',
  },
  {
    organization: 'other',
    title: 'SABR-COMET: stereotactic ablative radiotherapy for oligometastatic disease',
    url: 'https://doi.org/10.1016/S0140-6736(19)30118-1',
    evidenceLevel: '1',
  },
];

export const KIDNEY_INPUT_JSON_SCHEMA: JsonSchema = {
  $schema: 'http://json-schema.org/draft-07/schema#',
  $id: 'https://radonco.local/schema/kidney-input.json',
  title: 'Renal cell carcinoma clinical case input',
  type: 'object',
  required: ['organSystem', 'disease', 'setting'],
  properties: {
    organSystem: { type: 'string', enum: ['gus'] },
    disease: { type: 'string', enum: ['renal-cell-carcinoma'] },
    setting: { type: 'string', enum: ['localized', 'locally-advanced', 'post-nephrectomy', 'oligometastatic', 'metastatic'] },
    stage: { type: 'object', additionalProperties: true },
    histology: { type: 'string', enum: ['clear-cell', 'papillary', 'chromophobe', 'collecting-duct', 'other', 'unknown'] },
    tumorSizeCm: { type: 'number' },
    renalTumorLocation: { type: 'string', enum: ['peripheral', 'central', 'hilar', 'multifocal', 'unknown'] },
    resectability: { type: 'string', enum: ['resectable', 'borderline', 'unresectable', 'unknown'] },
    surgeryType: { type: 'string', enum: ['partial-nephrectomy', 'radical-nephrectomy', 'ablation', 'none', 'unknown'] },
    surgicalMargin: { type: 'string', enum: ['R0', 'R1', 'R2', 'RX', 'not-applicable'] },
    nodalStatus: { type: 'string', enum: ['N0', 'N1', 'unknown'] },
    metastases: { type: 'array', items: { type: 'string' } },
    solitaryKidney: { type: 'boolean' },
    baselineEGFR: { type: 'number' },
    chronicKidneyDisease: { type: 'boolean' },
    medicallyInoperable: { type: 'boolean' },
    priorAbdominalRT: { type: 'boolean' },
    oligometastaticControlled: { type: 'boolean' },
    immunotherapyContraindicated: { type: 'boolean' },
    molecularFinding: { type: 'string' },
    symptoms: { type: 'array', items: { type: 'string' } },
  },
  additionalProperties: true,
};

export const KIDNEY_OUTPUT_JSON_SCHEMA: JsonSchema = {
  $schema: 'http://json-schema.org/draft-07/schema#',
  $id: 'https://radonco.local/schema/kidney-result.json',
  title: 'Renal cell carcinoma CDSS result',
  type: 'object',
  required: ['schemaVersion', 'engineId', 'engineVersion', 'organSystem', 'rtIndication', 'intent', 'summary', 'recommendations'],
  properties: {
    schemaVersion: { type: 'string', enum: ['1.0'] },
    engineId: { type: 'string', enum: ['gus.kidney'] },
    engineVersion: { type: 'string' },
    organSystem: { type: 'string', enum: ['gus'] },
    rtIndication: { type: 'string' },
    intent: { type: 'string' },
    summary: { type: 'string' },
    recommendations: { type: 'array', items: { type: 'object', additionalProperties: true } },
    warnings: { type: 'array', items: { type: 'string' } },
    guidelineReferences: { type: 'array', items: { type: 'object', additionalProperties: true } },
  },
  additionalProperties: true,
};

const fraction = (
  totalDoseGy: number,
  fractions: number,
  fractionationClass: Fractionation['class'],
  schedule: string,
): Fractionation => ({
  class: fractionationClass,
  totalDoseGy,
  fractions,
  dosePerFractionGy: totalDoseGy / fractions,
  schedule,
  technique: 'IGRT',
  alphaBetaTumor: 10,
  bedGy: totalDoseGy * (1 + totalDoseGy / fractions / 10),
  eqd2Gy: totalDoseGy * ((totalDoseGy / fractions + 10) / 12),
});

const renalTargets = (radiationDose: Fractionation, metastatic = false): TargetVolume[] => [
  {
    name: 'GTV',
    description: metastatic ? 'Kontrastlı BT/MR/PET ile tanımlanan renal veya metastatik lezyon.' : 'Kontrastlı renal protokol BT/MR ile tanımlanan primer renal tümör.',
    dose: radiationDose,
    margin: 'Görüntülenebilir tümör',
  },
  {
    name: 'CTV',
    description: 'RCC’de rutin mikroskopik çevresel CTV ve elektif nodal ışınlama standart değildir; görüntülenebilir hedef odaklanır.',
    dose: radiationDose,
    margin: 'Genellikle 0 mm; anatomik belirsizlik ve önceki ablasyon alanı bireyselleştirilir',
  },
  {
    name: 'PTV',
    description: 'Solunum hareketi ve günlük kurulum için ITV/4D-CT tabanlı marj.',
    dose: radiationDose,
    margin: '4D-CT/IGRT ile genellikle 3-5 mm; tümör ve OAR hareketine göre',
  },
];

const renalOars: OARConstraint[] = [
  { organ: 'Contralateral functioning kidney', metric: 'Dmean', limit: 5, unit: 'Gy', priority: 'mandatory', source: 'HyTEC', sourceReference: 'Renal SBRT normal kidney preservation; institutional protocol required' },
  { organ: 'Ipsilateral kidney minus GTV', metric: 'Dmean', limit: 18, unit: 'Gy', priority: 'optimal', source: 'HyTEC', sourceReference: 'Renal SBRT dose-volume objective' },
  { organ: 'Stomach', metric: 'Dmax', limit: 32, unit: 'Gy', priority: 'mandatory', source: 'HyTEC', sourceReference: 'Upper abdominal SBRT luminal organ objective' },
  { organ: 'Duodenum', metric: 'Dmax', limit: 32, unit: 'Gy', priority: 'mandatory', source: 'HyTEC', sourceReference: 'Upper abdominal SBRT luminal organ objective' },
  { organ: 'Small bowel', metric: 'Dmax', limit: 35, unit: 'Gy', priority: 'mandatory', source: 'HyTEC', sourceReference: 'Abdominal SBRT luminal organ objective' },
  { organ: 'Spinal cord', metric: 'Dmax', limit: 25, unit: 'Gy', priority: 'mandatory', source: 'HyTEC', sourceReference: 'SBRT spinal cord tolerance; fractionation dependent' },
  { organ: 'Liver', metric: 'Dmean', limit: 15, unit: 'Gy', priority: 'optimal', source: 'HyTEC', sourceReference: 'Abdominal SBRT liver objective' },
];

const systemic = (
  setting: SystemicTherapyRecommendation['setting'],
  regimen: string,
  agents: string[],
  timing: string,
  evidenceLevel: SystemicTherapyRecommendation['evidenceLevel'] = '1',
): SystemicTherapyRecommendation => ({ setting, regimen, agents, timing, evidenceLevel });

const references = (...extra: GuidelineReference[]): GuidelineReference[] => [NCCN, ASTRO, ESTRO, ...extra];

export class KidneyDecisionEngine extends BaseDecisionEngine<KidneyInput> {
  public readonly id = 'gus.kidney';
  public readonly version = '1.0.0';
  public readonly inputSchema = KIDNEY_INPUT_JSON_SCHEMA;
  public readonly outputSchema = KIDNEY_OUTPUT_JSON_SCHEMA;

  public constructor() {
    super('1.0.0');
  }

  protected evaluateCase(input: KidneyInput): CDSSResult {
    const recommendations: ClinicalRecommendation[] = [];
    const rationale: string[] = [];
    const warnings: string[] = [];
    let rtIndication: CDSSResult['rtIndication'] = 'conditional';
    let intent: CDSSResult['intent'] = 'curative';

    if (input.priorAbdominalRT) warnings.push('Önceki abdominal RT mevcut; kalan böbrek, barsak, mide/duodenum, karaciğer ve spinal kord kümülatif dozları hesaplanmalıdır.');
    if (input.solitaryKidney || input.chronicKidneyDisease || (input.baselineEGFR !== undefined && input.baselineEGFR < 45)) {
      warnings.push('Böbrek rezervi sınırlı; nefrektomi, kontrast, sistemik tedavi ve SBRT seçimi nefroloji/üroloji ile bireyselleştirilmelidir.');
    }

    if (input.setting === 'localized' || input.setting === 'locally-advanced') {
      const resectable = input.resectability !== 'unresectable' && input.resectability !== 'unknown';
      const renalSbrt = fraction(42, 3, 'SBRT', '42 Gy / 3 fx; seçilmiş medikal inoperabl primer RCC');
      recommendations.push({
        id: 'localized-renal-surgery',
        label: input.tumorSizeCm !== undefined && input.tumorSizeCm <= 7 ? 'Parsiyel nefrektomi öncelikli cerrahi değerlendirmesi' : 'Radikal veya parsiyel nefrektomi değerlendirmesi',
        indication: resectable ? 'indicated' : 'conditional',
        intent: 'curative',
        systemicTherapy: input.setting === 'locally-advanced'
          ? [systemic('neoadjuvant', 'Neoadjuvan sistemik tedavi yalnızca seçilmiş/klinik çalışma bağlamında', ['güncel IO/TKI veya klinik çalışma'], 'Rutin standart değildir; rezektabilite ve klinik çalışma uygunluğuna göre')]
          : undefined,
        rationale: [
          'Lokalize RCC’de cerrahi, uygun hastada parsiyel nefrektomi ile nefron korumayı; tümör özellikleri izin vermiyorsa radikal nefrektomiyi hedefler.',
          'R0 rezeksiyon hedeflenir; R1/R2 marjin veya makroskopik rezidüde yeniden rezeksiyon, sistemik tedavi ve seçilmiş salvage RT MDT ile değerlendirilir.',
          'RCC’de elektif nodal ışınlama ve rutin adjuvan RT standart değildir; nodal cerrahi/örnekleme şüpheli nodal hastalıkta yapılır.',
        ],
        guidelineReferences: references(),
      });
      if (input.medicallyInoperable || input.resectability === 'unresectable') {
        recommendations.push({
          id: 'primary-renal-sbrt',
          label: 'Medikal inoperabl/cerrahiye uygun olmayan primer RCC için SBRT',
          indication: 'consider',
          intent: 'curative',
          fractionation: renalSbrt,
          targetVolumes: renalTargets(renalSbrt),
          oarConstraints: renalOars,
          rationale: [
            'Medikal inoperabl, cerrahi riski yüksek veya tek böbrekli seçilmiş hastada primer renal SBRT lokal ablasyon seçeneğidir.',
            '3x14 Gy, 5 fraksiyonlu 40-50 Gy veya benzeri şemalar tümör boyutu, santral/hiler konum, hareket ve OAR yakınlığına göre seçilir; tek fraksiyon rutin değildir.',
            '4D-CT, abdominal compression/breath-hold ve günlük IGRT; mide, duodenum, barsak ve kalan böbrek dozlarını korumak için gereklidir.',
          ],
          guidelineReferences: references(TRIALS[2]),
        });
        rtIndication = 'consider';
      } else {
        rtIndication = 'not-indicated';
      }
      if (input.setting === 'locally-advanced') {
        rationale.push('Komşu organ/damar invazyonunda rezektabilite; üroloji, vasküler cerrahi, medikal onkoloji ve radyasyon onkolojisi ile R0 olasılığı ve neoadjuvan klinik çalışma açısından değerlendirilir.');
      }
    } else if (input.setting === 'post-nephrectomy') {
      const highRisk = input.surgicalMargin === 'R1' || input.surgicalMargin === 'R2' || input.nodalStatus === 'N1' || input.stage?.t === 'T4';
      recommendations.push({
        id: 'post-nephrectomy-adjuvant',
        label: 'Patolojik risk-adapte takip ve adjuvan pembrolizumab değerlendirmesi',
        indication: highRisk ? 'indicated' : 'conditional',
        intent: 'adjuvant',
        systemicTherapy: input.histology === 'clear-cell' && highRisk
          ? [systemic('adjuvant', 'Adjuvan pembrolizumab', ['pembrolizumab'], 'Nefrektomi sonrası yüksek riskli clear-cell RCC’de KEYNOTE-564 ve güncel kılavuz kriterlerine göre')]
          : undefined,
        rationale: [
          'R0 nefrektomi sonrası rutin adjuvan RT önerilmez; lokal yatak RT yalnızca seçilmiş unresected/makroskopik rezidü veya semptomatik lokal riskte tartışılır.',
          'R1/R2 marjin ve pT3/pT4 veya N1 hastalık yüksek nüks riskidir; yeniden rezeksiyon olasılığı ve sistemik tedavi değerlendirilir.',
          'KEYNOTE-564, yüksek riskli clear-cell RCC’de adjuvan pembrolizumab seçeneğini destekler; fayda/immün toksisite ve hasta uygunluğu birlikte değerlendirilmelidir.',
        ],
        guidelineReferences: references(TRIALS[0]),
      });
      rtIndication = input.surgicalMargin === 'R2' ? 'consider' : 'not-indicated';
    } else if (input.setting === 'oligometastatic') {
      const metastasisDose = fraction(50, 5, 'SBRT', '50 Gy / 5 fx; metastaz bölgesine göre 3-5 fx');
      recommendations.push({
        id: 'oligometastatic-renal-sbrt',
        label: 'Oligometastatik RCC’de metastaz-yönelimli SBRT',
        indication: 'consider',
        intent: 'curative',
        fractionation: metastasisDose,
        targetVolumes: renalTargets(metastasisDose, true),
        oarConstraints: renalOars,
        systemicTherapy: [systemic('maintenance', 'Sistemik IO/TKI ile lokal ablasyon sıralaması', ['nivolumab/ipilimumab veya pembrolizumab/axitinib ve güncel NCCN seçenekleri'], 'Metastaz yükü, yanıt ve toksisiteye göre MDT')],
        rationale: [
          'Sınırlı sayıda ve kontrol edilebilir metastazda metastaz-yönelimli SBRT; sistemik tedavi ile birlikte seçilmiş hastada uzun süreli kontrol amacıyla değerlendirilebilir.',
          'SABR-COMET oligometastatik yaklaşımın genel kanıtını destekler; RCC’ye özgü seçim, tümör biyolojisi, metastaz bölgesi ve sistemik yanıtla yapılmalıdır.',
        ],
        guidelineReferences: references(TRIALS[3]),
      });
      rtIndication = 'consider';
    } else {
      intent = 'palliative';
      const systemicTherapy: SystemicTherapyRecommendation[] = [
        systemic('palliative', 'Metastatik RCC’de IO/TKI tabanlı sistemik tedavi', ['nivolumab/ipilimumab veya pembrolizumab/axitinib veya nivolumab/cabozantinib'], 'IMDC risk grubu, histoloji ve önceki tedaviye göre'),
      ];
      if (input.molecularFinding === 'MET') systemicTherapy.push(systemic('palliative', 'Papiller RCC’de MET-yolak hedefli tedavi değerlendirmesi', ['cabozantinib veya klinik çalışma'], 'Histoloji ve erişilebilirlik kriterlerine göre'));
      if (input.molecularFinding === 'VHL') systemicTherapy.push(systemic('palliative', 'VHL ilişkili hastalıkta HIF-2α hedefleme değerlendirmesi', ['belzutifan'], 'Uygun endikasyon ve güncel kılavuz/ruhsat kriterlerine göre'));
      if (input.molecularFinding === 'MSI-H' || input.molecularFinding === 'dMMR') systemicTherapy.push(systemic('palliative', 'MSI-H/dMMR için immünoterapi değerlendirmesi', ['pembrolizumab'], 'Moleküler sonuç ve ruhsat kriterlerine göre'));
      recommendations.push({
        id: 'metastatic-renal-systemic',
        label: 'Metastatik RCC’de sistemik tedavi ve semptom odaklı RT',
        indication: 'indicated',
        intent,
        systemicTherapy,
        rationale: [
          'Metastatik RCC’de sistemik IO/TKI tedavisi omurgadır; sitoredüktif nefrektomi seçimi performans, IMDC riski, tümör yükü ve semptomlarla yapılır.',
          'RT ağrı, spinal kord basısı, beyin metastazı, kanama veya oligoprogresif odaklarda palyatif/ablative amaçla uygulanır.',
          'RCC radyo dirençli kabul edilse de yüksek doz stereotaktik RT ile seçilmiş metastatik odaklarda lokal kontrol sağlanabilir.',
        ],
        guidelineReferences: references(),
      });
      if (input.metastases?.length || input.symptoms?.length) {
        recommendations.push({
          id: 'metastatic-renal-palliative-rt',
          label: 'Semptomatik RCC metastazlarına RT',
          indication: 'consider',
          intent: 'palliative',
          rationale: ['Kemik/spinal lezyonlarda fraksiyonasyon; stabilite, nörolojik bulgu, önceki RT ve OAR dozlarına göre belirlenir.'],
          guidelineReferences: references(),
        });
      }
      rtIndication = input.metastases?.length || input.symptoms?.length ? 'conditional' : 'consider';
    }

    return {
      schemaVersion: '1.0',
      engineId: this.id,
      engineVersion: this.version,
      caseId: input.caseId,
      organSystem: 'gus',
      rtIndication,
      intent,
      summary: this.summary(input),
      recommendations,
      rationale,
      warnings: warnings.length ? warnings : undefined,
      uncertainties: input.histology === 'unknown' || !input.stage ? ['Histoloji ve TNM evresi tamamlanmamış.'] : undefined,
      confidence: input.histology === 'unknown' || !input.stage ? 0.72 : 0.86,
      generatedAt: new Date().toISOString(),
      guidelineReferences: recommendations.flatMap((recommendation) => recommendation.guidelineReferences ?? []),
    };
  }

  private summary(input: KidneyInput): string {
    if (input.setting === 'localized') return 'Lokalize RCC: nefron koruyucu veya radikal cerrahi; medikal inoperabl seçilmiş hastada primer renal SBRT.';
    if (input.setting === 'locally-advanced') return 'Lokal ileri RCC: R0 rezektabilite ve multidisipliner neoadjuvan/cerrahi strateji değerlendirmesi.';
    if (input.setting === 'post-nephrectomy') return 'Nefrektomi sonrası RCC: patolojik risk, marjin ve clear-cell histolojiye göre adjuvan sistemik tedavi.';
    if (input.setting === 'oligometastatic') return 'Oligometastatik RCC: sistemik tedavi ile birlikte seçilmiş metastaz-yönelimli SBRT.';
    return 'Metastatik RCC: IMDC/histoloji/moleküler profile göre IO/TKI ve semptom odaklı RT.';
  }
}

export const kidneyEngine = new KidneyDecisionEngine();

export default kidneyEngine;
