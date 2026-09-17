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

export type GlialSetting = 'newly-diagnosed' | 'postoperative' | 'recurrent' | 'progressive' | 'metastatic';
export type GlialHistology = 'glioblastoma' | 'astrocytoma' | 'oligodendroglioma' | 'high-grade-glioma' | 'low-grade-glioma' | 'diffuse-midline-glioma' | 'other' | 'unknown';
export type GlialGrade = 'WHO-1' | 'WHO-2' | 'WHO-3' | 'WHO-4' | 'unknown';
export type GlialMolecularProfile = 'IDH-mutant' | 'IDH-wildtype' | 'H3-K27-altered' | 'H3-G34-mutant' | 'MGMT-methylated' | 'MGMT-unmethylated' | '1p19q-codeleted' | '1p19q-intact' | 'BRAF-V600E' | 'unknown';
export type GlialSurgery = 'gross-total-resection' | 'subtotal-resection' | 'biopsy-only' | 'none' | 'unknown';

export interface GlialTumorInput extends ClinicalCaseInput {
  organSystem: 'cns';
  disease: 'glial-tumor';
  setting: GlialSetting;
  stage?: TNMStage;
  histology?: GlialHistology;
  grade?: GlialGrade;
  molecularProfile?: GlialMolecularProfile[];
  surgeryType?: GlialSurgery;
  resectionMargin?: 'R0' | 'R1' | 'R2' | 'RX' | 'not-applicable';
  residualEnhancingTumor?: boolean;
  tumorSizeCm?: number;
  eloquentCortex?: boolean;
  ageYears?: number;
  performanceStatusECOG?: number;
  priorRadiotherapy?: boolean;
  leptomeningealDisease?: boolean;
  extracranialDisease?: boolean;
  seizures?: boolean;
  edemaOrMassEffect?: boolean;
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
  title: 'ASTRO clinical practice resources for brain metastases and CNS radiotherapy',
  url: 'https://www.astro.org/Patient-Care-and-Research/Clinical-Practice-Statements',
  evidenceLevel: 'B',
};

const ESTRO: GuidelineReference = {
  organization: 'ESTRO',
  title: 'ESTRO-EANO guidance for glioma and CNS radiotherapy',
  url: 'https://www.estro.org/Science/Guidelines',
  evidenceLevel: 'B',
};

const TRIALS: GuidelineReference[] = [
  { organization: 'other', title: 'Stupp trial: radiotherapy plus concomitant/adjuvant temozolomide for glioblastoma', url: 'https://doi.org/10.1056/NEJMoa0433305', evidenceLevel: '1' },
  { organization: 'other', title: 'CATNON: adjuvant temozolomide in 1p/19q non-codeleted anaplastic glioma', url: 'https://doi.org/10.1016/S0140-6736(17)31442-3', evidenceLevel: '1' },
  { organization: 'other', title: 'RTOG 9802: radiotherapy plus PCV for high-risk low-grade glioma', url: 'https://doi.org/10.1056/NEJMoa1208420', evidenceLevel: '1' },
  { organization: 'other', title: 'EORTC 26951: radiotherapy plus PCV in anaplastic oligodendroglial tumors', url: 'https://doi.org/10.1016/S0140-6736(13)61411-4', evidenceLevel: '1' },
  { organization: 'other', title: 'INDIGO: vorasidenib in IDH1/2-mutant grade 2 glioma', url: 'https://doi.org/10.1056/NEJMoa2304194', evidenceLevel: '1' },
];

export const GLIAL_TUMOR_INPUT_JSON_SCHEMA: JsonSchema = {
  $schema: 'http://json-schema.org/draft-07/schema#',
  $id: 'https://radonco.local/schema/glial-tumor-input.json',
  title: 'Glial tumor clinical case input',
  type: 'object',
  required: ['organSystem', 'disease', 'setting'],
  properties: {
    organSystem: { type: 'string', enum: ['cns'] },
    disease: { type: 'string', enum: ['glial-tumor'] },
    setting: { type: 'string', enum: ['newly-diagnosed', 'postoperative', 'recurrent', 'progressive', 'metastatic'] },
    stage: { type: 'object', additionalProperties: true },
    histology: { type: 'string', enum: ['glioblastoma', 'astrocytoma', 'oligodendroglioma', 'high-grade-glioma', 'low-grade-glioma', 'diffuse-midline-glioma', 'other', 'unknown'] },
    grade: { type: 'string', enum: ['WHO-1', 'WHO-2', 'WHO-3', 'WHO-4', 'unknown'] },
    molecularProfile: { type: 'array', items: { type: 'string' } },
    surgeryType: { type: 'string', enum: ['gross-total-resection', 'subtotal-resection', 'biopsy-only', 'none', 'unknown'] },
    resectionMargin: { type: 'string', enum: ['R0', 'R1', 'R2', 'RX', 'not-applicable'] },
    residualEnhancingTumor: { type: 'boolean' },
    tumorSizeCm: { type: 'number' },
    eloquentCortex: { type: 'boolean' },
    ageYears: { type: 'number' },
    performanceStatusECOG: { type: 'number' },
    priorRadiotherapy: { type: 'boolean' },
    leptomeningealDisease: { type: 'boolean' },
    extracranialDisease: { type: 'boolean' },
    seizures: { type: 'boolean' },
    edemaOrMassEffect: { type: 'boolean' },
    neurologicDeficit: { type: 'boolean' },
  },
  additionalProperties: true,
};

export const GLIAL_TUMOR_OUTPUT_JSON_SCHEMA: JsonSchema = {
  $schema: 'http://json-schema.org/draft-07/schema#',
  $id: 'https://radonco.local/schema/glial-tumor-result.json',
  title: 'Glial tumor CDSS result',
  type: 'object',
  required: ['schemaVersion', 'engineId', 'engineVersion', 'organSystem', 'rtIndication', 'intent', 'summary', 'recommendations'],
  properties: {
    schemaVersion: { type: 'string', enum: ['1.0'] },
    engineId: { type: 'string', enum: ['cns.glial-tumor'] },
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

const glialTargets = (dose: Fractionation, highGrade: boolean): TargetVolume[] => [
  { name: 'GTV', description: 'Postoperatif kontrastlanan rezidü/nodül ve preoperatif tümör yatağı MRI füzyonu ile.', dose, margin: 'T1 kontrastlanan hastalık ve rezeksiyon kavitesi' },
  { name: 'CTV', description: highGrade ? 'Rezeksiyon kavitesi, rezidüel tümör ve seçilmiş FLAIR/T2 anormalliği; leptomeningeal yayılım şüphesinde ilgili alan.' : 'Rezeksiyon kavitesi, rezidüel tümör ve klinik/radyolojik infiltratif alan.', dose, margin: highGrade ? 'Genellikle 1.5-2 cm; anatomik bariyerler ve güncel MRI ile daraltılabilir' : 'Genellikle 1-2 cm; tümör grade ve infiltrasyonuna göre' },
  { name: 'PTV', description: 'Fraksiyon içi hareket ve immobilizasyon/IGRT belirsizliği için.', dose, margin: 'Maske, CBCT ve günlük IGRT ile yaklaşık 2-5 mm; SRS’de kurum protokolüne göre' },
];

const glialOars: OARConstraint[] = [
  { organ: 'Optic nerves and chiasm', metric: 'Dmax', limit: 54, unit: 'Gy', priority: 'mandatory', source: 'QUANTEC', sourceReference: 'Conventional fractionation optic pathway tolerance' },
  { organ: 'Brainstem', metric: 'Dmax', limit: 54, unit: 'Gy', priority: 'mandatory', source: 'QUANTEC', sourceReference: 'Conventional fractionation brainstem tolerance' },
  { organ: 'Spinal cord', metric: 'Dmax', limit: 45, unit: 'Gy', priority: 'mandatory', source: 'QUANTEC', sourceReference: 'Spinal cord tolerance' },
  { organ: 'Normal brain', metric: 'V12', limit: 5, unit: 'cc', priority: 'optimal', source: 'HyTEC', sourceReference: 'SRS radionecrosis risk objective' },
  { organ: 'Eyes/lenses', metric: 'Dmax', limit: 10, unit: 'Gy', priority: 'optimal', source: 'QUANTEC', sourceReference: 'Lens/ocular structure sparing objective' },
];

const systemic = (setting: SystemicTherapyRecommendation['setting'], regimen: string, agents: string[], timing: string, evidenceLevel: SystemicTherapyRecommendation['evidenceLevel'] = '1'): SystemicTherapyRecommendation => ({ setting, regimen, agents, timing, evidenceLevel });
const references = (...extra: GuidelineReference[]): GuidelineReference[] => [NCCN, ASTRO, ESTRO, ...extra];
const has = (input: GlialTumorInput, marker: GlialMolecularProfile): boolean => input.molecularProfile?.includes(marker) ?? false;

export class GlialTumorDecisionEngine extends BaseDecisionEngine<GlialTumorInput> {
  public readonly id = 'cns.glial-tumor';
  public readonly version = '1.0.0';
  public readonly inputSchema = GLIAL_TUMOR_INPUT_JSON_SCHEMA;
  public readonly outputSchema = GLIAL_TUMOR_OUTPUT_JSON_SCHEMA;

  public constructor() {
    super('1.0.0');
  }

  protected evaluateCase(input: GlialTumorInput): CDSSResult {
    const recommendations: ClinicalRecommendation[] = [];
    const rationale: string[] = [];
    const warnings: string[] = [];
    let rtIndication: CDSSResult['rtIndication'] = 'indicated';
    let intent: CDSSResult['intent'] = 'curative';
    const highGrade = input.grade === 'WHO-3' || input.grade === 'WHO-4' || input.histology === 'glioblastoma' || input.histology === 'high-grade-glioma';

    if (input.edemaOrMassEffect || input.neurologicDeficit) warnings.push('Ödem/kitle etkisi veya nörolojik defisit mevcut; nöroşirürji, steroid gereksinimi, antiepileptik ve acil bası yönetimi MDT’de değerlendirilmelidir.');
    if (input.priorRadiotherapy) warnings.push('Önceki kraniyal RT mevcut; yeniden ışınlama öncesi plan füzyonu, kümülatif optik yol/beyin sapı dozları ve radyonekroz riski hesaplanmalıdır.');
    if (input.leptomeningealDisease) warnings.push('Leptomeningeal hastalık varsa kraniyal/spinal MRI, BOS sitolojisi ve fokal RT ile sistemik/intratekal seçeneklerin entegrasyonu gerekir.');

    if (input.setting === 'newly-diagnosed' || input.setting === 'postoperative') {
      const dose = highGrade
        ? fraction(60, 30, 'conventional', '60 Gy / 30 fx')
        : fraction(54, 30, 'conventional', '54 Gy / 30 fx; grade 2 diffuse gliomada risk-adapte');
      const systemicTherapy: SystemicTherapyRecommendation[] = [];
      if (input.histology === 'glioblastoma' || highGrade) {
        systemicTherapy.push(systemic('concurrent', 'Stupp protokolü eşzamanlı temozolomid', ['temozolomide'], 'RT boyunca günlük, uygun performans ve organ fonksiyonunda'));
        systemicTherapy.push(systemic('adjuvant', 'Adjuvan temozolomid', ['temozolomide'], 'RT sonrası 6 veya daha fazla kür; MGMT ve klinik toleransa göre'));
      } else if (input.histology === 'oligodendroglioma' && has(input, '1p19q-codeleted')) {
        systemicTherapy.push(systemic('adjuvant', 'RT sonrası PCV', ['procarbazine', 'lomustine', 'vincristine'], 'Yüksek riskli grade 2-3, 1p/19q-codeleted hastalıkta'));
      } else if (input.grade === 'WHO-2') {
        systemicTherapy.push(systemic('adjuvant', 'Risk-adapte PCV veya temozolomid', ['PCV veya temozolomide'], 'Yaş, rezeksiyon, tümör boyutu, nörolojik risk ve moleküler profile göre', '2A'));
      }
      recommendations.push({
        id: 'new-glial-tumor-standard',
        label: highGrade ? 'Maksimal güvenli rezeksiyon/biopsi + fraksiyone RT ve sistemik tedavi' : 'Maksimal güvenli rezeksiyon + risk-adapte RT/sistemik tedavi',
        indication: 'indicated',
        intent: 'curative',
        fractionation: dose,
        targetVolumes: glialTargets(dose, highGrade),
        oarConstraints: glialOars,
        systemicTherapy,
        rationale: [
          'Maksimal güvenli rezeksiyon veya tanısal biyopsi; nörolojik fonksiyonu koruyarak tümör yükünü azaltma ve moleküler tanı için esastır.',
          highGrade ? 'Glioblastom ve yüksek grade glial tümörlerde 60 Gy/30 fx ile eşzamanlı ve adjuvan temozolomid, Stupp çalışması temelinde standart yaklaşımdır.' : 'Grade 2-3 diffüz gliomada RT kararı yaş, rezeksiyon kapsamı, tümör boyutu, nörolojik bulgu ve IDH/1p19q durumuna göre risk-adaptedir.',
          'GTV/CTV MRI füzyonu ile tanımlanır; rutin elektif nodal ışınlama CNS glial tümörlerinde anatomik olarak uygulanmaz.',
        ],
        guidelineReferences: references(TRIALS[0], TRIALS[1], TRIALS[2], TRIALS[3]),
      });
      if (input.histology === 'low-grade-glioma' && has(input, 'IDH-mutant')) {
        recommendations.push({
          id: 'idH-mutant-grade-two-option',
          label: 'IDH-mutant grade 2 hastalıkta seçilmiş gözlem veya vorasidenib değerlendirmesi',
          indication: 'conditional',
          intent: 'observation',
          systemicTherapy: [systemic('maintenance', 'IDH1/2 inhibitörü değerlendirmesi', ['vorasidenib'], 'RT/kemoterapi gerektirmeyen seçilmiş rezidüel grade 2 IDH-mutant olguda; erişim ve ruhsat durumuna göre', '1')],
          rationale: ['INDIGO çalışması, seçilmiş IDH-mutant grade 2 gliomada progresyonsuz sağkalım yararı göstermiştir; bu seçenek RT gereksinimini ortadan kaldıran evrensel bir kural değildir.'],
          guidelineReferences: references(TRIALS[4]),
        });
      }
    } else if (input.setting === 'recurrent' || input.setting === 'progressive') {
      intent = 'salvage';
      const reirradiationDose = fraction(30, 5, 'SRS', '30 Gy / 5 fx; küçük ve sınırlı nükste, OAR mesafesine göre');
      recommendations.push({
        id: 'recurrent-glial-tumor',
        label: 'Nüks/progresyonda yeniden rezeksiyon, sistemik tedavi ve seçilmiş stereotaktik RT',
        indication: input.priorRadiotherapy ? 'consider' : 'conditional',
        intent,
        fractionation: reirradiationDose,
        targetVolumes: glialTargets(reirradiationDose, true),
        oarConstraints: glialOars,
        systemicTherapy: [systemic('palliative', 'Moleküler ve önceki tedaviye göre salvage sistemik tedavi', ['temozolomide yeniden kullanım, lomustine, bevacizumab veya klinik çalışma'], 'Performans, MGMT, önceki temozolomid ve progresyon paternine göre', '2A')],
        rationale: [
          'Nüks gliomada yeniden cerrahi, patolojik/moleküler doğrulama ve semptomatik kitle etkisinin giderilmesi için seçilmiş hastada düşünülür.',
          'Yeniden RT rutin değildir; küçük, sınırlı ve kritik yapılardan güvenli mesafedeki progresyonda SRS/hipofraksiyone stereotaktik RT düşünülebilir.',
          'Radyonekroz ile gerçek progresyon ayrımı için ileri MRI/PET ve yakın klinik-radyolojik takip gerekir.',
        ],
        guidelineReferences: references(),
      });
      rtIndication = input.priorRadiotherapy ? 'consider' : 'indicated';
    } else {
      intent = 'palliative';
      recommendations.push({
        id: 'advanced-glial-tumor',
        label: 'İleri/yaygın CNS hastalığında semptom odaklı lokal RT ve sistemik tedavi',
        indication: 'conditional',
        intent,
        fractionation: fraction(30, 10, 'moderate-hypofractionation', '30 Gy / 10 fx; performans ve hedef hacmine göre'),
        targetVolumes: glialTargets(fraction(30, 10, 'moderate-hypofractionation', '30 Gy / 10 fx'), true),
        oarConstraints: glialOars,
        systemicTherapy: [systemic('palliative', 'Klinik durum ve moleküler profile göre sistemik tedavi/klinik çalışma', ['temozolomide, lomustine, bevacizumab veya hedefli tedavi'], 'Semptom, nörolojik durum ve önceki tedavilere göre', '2A')],
        rationale: ['Palyatif RT ağrı, nörolojik defisit, kitle etkisi veya sınırlı progresif odaklarda semptom ve lokal kontrol amacıyla uygulanır.'],
        guidelineReferences: references(),
      });
      rtIndication = 'conditional';
    }

    rationale.push('Glial tümör kararı; nöroşirürji, nöro-onkoloji, radyasyon onkolojisi, nöroradyoloji ve nöropatoloji konseyinde WHO 2021/2024 entegre tanı, MRI ve hasta hedefleriyle kesinleştirilmelidir.');
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
      uncertainties: !input.histology || !input.grade || !input.molecularProfile?.length ? ['Histoloji, WHO grade veya moleküler profil eksik; RT ve sistemik tedavi seçimi değişebilir.'] : undefined,
      confidence: !input.histology || !input.grade || !input.molecularProfile?.length ? 0.72 : 0.88,
      generatedAt: new Date().toISOString(),
      guidelineReferences: recommendations.flatMap((recommendation) => recommendation.guidelineReferences ?? []),
    };
  }

  private summary(input: GlialTumorInput): string {
    if (input.setting === 'newly-diagnosed' || input.setting === 'postoperative') return 'Yeni tanı/postoperatif glial tümör: maksimal güvenli cerrahi, moleküler tanı ve grade-risk uyumlu RT/sistemik tedavi.';
    if (input.setting === 'recurrent' || input.setting === 'progressive') return 'Nüks/progresif glial tümör: salvage cerrahi, sistemik seçenekler ve seçilmiş yeniden ışınlama.';
    return 'İleri glial tümör: nörolojik semptom ve lokal kontrol odaklı palyatif yaklaşım.';
  }
}

export const glialTumorEngine = new GlialTumorDecisionEngine();

export default glialTumorEngine;
