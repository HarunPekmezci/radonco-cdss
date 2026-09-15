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

export type ProstateRiskGroup =
  | 'very-low'
  | 'low'
  | 'favorable-intermediate'
  | 'unfavorable-intermediate'
  | 'high'
  | 'very-high'
  | 'regional'
  | 'metastatic'
  | 'unknown';

export type ProstateSetting =
  | 'newly-diagnosed-localized'
  | 'post-prostatectomy'
  | 'biochemical-recurrence'
  | 'metastatic-castration-sensitive'
  | 'metastatic-castration-resistant';

export type ProstateMolecularFinding =
  | 'BRCA1'
  | 'BRCA2'
  | 'other-HRR'
  | 'MSI-H'
  | 'dMMR'
  | 'CDK12'
  | 'no-actionable-alteration'
  | 'unknown';

export interface ProstateInput extends ClinicalCaseInput {
  organSystem: 'gus';
  disease: 'prostate-cancer';
  setting: ProstateSetting;
  stage?: TNMStage;
  psaNgMl?: number;
  gradeGroup?: 1 | 2 | 3 | 4 | 5;
  gleasonPrimary?: number;
  gleasonSecondary?: number;
  positiveCoresPercent?: number;
  clinicalT?: string;
  nodalStatus?: 'N0' | 'N1' | 'unknown';
  metastaticSites?: string[];
  riskGroup?: ProstateRiskGroup;
  lifeExpectancyYears?: number;
  prostatectomy?: boolean;
  surgicalMargin?: 'R0' | 'R1' | 'R2' | 'RX' | 'not-applicable';
  seminalVesicleInvasion?: boolean;
  extracapsularExtension?: boolean;
  postoperativePsaNgMl?: number;
  psaDoublingTimeMonths?: number;
  castrationLevelTestosterone?: boolean;
  priorPelvicRT?: boolean;
  molecularFinding?: ProstateMolecularFinding;
  urinaryFunctionPoor?: boolean;
  inflammatoryBowelDisease?: boolean;
}

const NCCN: GuidelineReference = {
  organization: 'NCCN',
  title: 'NCCN Clinical Practice Guidelines in Oncology: Prostate Cancer',
  version: 'Current version; verify institutional subscription before use',
  url: 'https://www.nccn.org/guidelines/guidelines-detail?category=1&id=1459',
  evidenceLevel: '2A',
};

const ASTRO: GuidelineReference = {
  organization: 'ASTRO',
  title: 'ASTRO/AUA/ASCO guideline: hypofractionation for localized prostate cancer',
  url: 'https://www.auanet.org/guidelines-and-quality/guidelines/clinically-localized-prostate-cancer-aua/astro-guideline',
  evidenceLevel: 'A',
};

const ESTRO: GuidelineReference = {
  organization: 'ESTRO',
  title: 'ESTRO-ACROP recommendations for external beam radiotherapy and image guidance in prostate cancer',
  url: 'https://www.estro.org/Science/Guidelines',
  evidenceLevel: 'B',
};

const TRIAL_REFERENCES: GuidelineReference[] = [
  {
    organization: 'other',
    title: 'CHHiP: conventional versus hypofractionated radiotherapy for localized prostate cancer',
    url: 'https://doi.org/10.1016/S0140-6736(16)30402-4',
    evidenceLevel: '1',
  },
  {
    organization: 'other',
    title: 'PACE-B: stereotactic body radiotherapy for localized prostate cancer',
    url: 'https://doi.org/10.1016/S0140-6736(24)00302-0',
    evidenceLevel: '1',
  },
  {
    organization: 'other',
    title: 'RTOG 9408: short-term androgen deprivation with radiotherapy',
    url: 'https://clinicaltrials.gov/study/NCT00002597',
    evidenceLevel: '1',
  },
  {
    organization: 'other',
    title: 'SPPORT/RTOG 0534: salvage prostate bed and pelvic nodal radiotherapy',
    url: 'https://clinicaltrials.gov/study/NCT00567580',
    evidenceLevel: '1',
  },
  {
    organization: 'other',
    title: 'STAMPEDE: abiraterone-based intensification in high-risk non-metastatic prostate cancer',
    url: 'https://doi.org/10.1016/S0140-6736(21)02437-5',
    evidenceLevel: '1',
  },
];

export const PROSTATE_INPUT_JSON_SCHEMA: JsonSchema = {
  $schema: 'http://json-schema.org/draft-07/schema#',
  $id: 'https://radonco.local/schema/prostate-input.json',
  title: 'Prostate cancer clinical case input',
  type: 'object',
  required: ['organSystem', 'disease', 'setting'],
  properties: {
    organSystem: { type: 'string', enum: ['gus'] },
    disease: { type: 'string', enum: ['prostate-cancer'] },
    setting: { type: 'string', enum: ['newly-diagnosed-localized', 'post-prostatectomy', 'biochemical-recurrence', 'metastatic-castration-sensitive', 'metastatic-castration-resistant'] },
    stage: { type: 'object', additionalProperties: true },
    psaNgMl: { type: 'number' },
    gradeGroup: { type: 'number', enum: ['1', '2', '3', '4', '5'] },
    gleasonPrimary: { type: 'number' },
    gleasonSecondary: { type: 'number' },
    positiveCoresPercent: { type: 'number' },
    clinicalT: { type: 'string' },
    nodalStatus: { type: 'string', enum: ['N0', 'N1', 'unknown'] },
    metastaticSites: { type: 'array', items: { type: 'string' } },
    riskGroup: { type: 'string' },
    lifeExpectancyYears: { type: 'number' },
    prostatectomy: { type: 'boolean' },
    surgicalMargin: { type: 'string', enum: ['R0', 'R1', 'R2', 'RX', 'not-applicable'] },
    seminalVesicleInvasion: { type: 'boolean' },
    extracapsularExtension: { type: 'boolean' },
    postoperativePsaNgMl: { type: 'number' },
    psaDoublingTimeMonths: { type: 'number' },
    castrationLevelTestosterone: { type: 'boolean' },
    priorPelvicRT: { type: 'boolean' },
    molecularFinding: { type: 'string' },
    urinaryFunctionPoor: { type: 'boolean' },
    inflammatoryBowelDisease: { type: 'boolean' },
  },
  additionalProperties: true,
};

export const PROSTATE_OUTPUT_JSON_SCHEMA: JsonSchema = {
  $schema: 'http://json-schema.org/draft-07/schema#',
  $id: 'https://radonco.local/schema/prostate-result.json',
  title: 'Prostate cancer CDSS result',
  type: 'object',
  required: ['schemaVersion', 'engineId', 'engineVersion', 'organSystem', 'rtIndication', 'intent', 'summary', 'recommendations'],
  properties: {
    schemaVersion: { type: 'string', enum: ['1.0'] },
    engineId: { type: 'string', enum: ['gus.prostate'] },
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
  alphaBetaTumor: 1.5,
  bedGy: totalDoseGy * (1 + totalDoseGy / fractions / 1.5),
  eqd2Gy: totalDoseGy * ((totalDoseGy / fractions + 1.5) / 3.5),
});

const prostateTargets = (radiationDose: Fractionation, includeNodes = false, salvage = false): TargetVolume[] => [
  {
    name: 'GTV',
    description: salvage ? 'Makroskopik lokal nüks; PSMA-PET/MR ve füzyon ile tanımlanır.' : 'Görüntülenebilir prostat ± seminal vezikül hastalığı.',
    dose: radiationDose,
    margin: 'Görüntülenebilir hastalık',
  },
  {
    name: 'CTV',
    description: salvage ? 'Prostatektomi yatağı ve riskli anastomoz/seminal vezikül yatağı.' : 'Prostat ± seminal veziküller; risk grubuna göre kapsama.',
    dose: radiationDose,
    margin: salvage ? 'RTOG/ESTRO prostate-bed atlasına göre anatomik konturlama' : 'Prostat çevresinde mikroskopik risk; anatomik bariyerler dikkate alınır',
  },
  ...(includeNodes
    ? [{
        name: 'CTV',
        description: 'Pelvik nodal zincirler; ortak/internal/external iliak ve obturator bölgeler, risk ve görüntülemeye göre.',
        dose: fraction(46, 23, 'conventional', 'Pelvik nodlar 46 Gy / 23 fx; prostat boost ile eşzamanlı veya ardışık'),
        margin: 'Pelvik nodal atlas ve damar konturları',
      }]
    : []),
  {
    name: 'PTV',
    description: 'Prostat/prostate-bed ve seçilmiş nodal CTV üzerine günlük IGRT marjı.',
    dose: radiationDose,
    margin: 'Günlük CBCT/fiducial IGRT ile yaklaşık 3-5 mm; posterior yönde kurum protokolü',
  },
];

const prostateOars: OARConstraint[] = [
  { organ: 'Rectum', metric: 'V70', limit: 15, unit: '%', priority: 'mandatory', source: 'protocol', sourceReference: 'NRG/RTOG prostate planning objectives' },
  { organ: 'Rectum', metric: 'V60', limit: 25, unit: '%', priority: 'optimal', source: 'protocol', sourceReference: 'NRG/RTOG prostate planning objectives' },
  { organ: 'Rectum', metric: 'V50', limit: 50, unit: '%', priority: 'optimal', source: 'protocol', sourceReference: 'NRG/RTOG prostate planning objectives' },
  { organ: 'Bladder', metric: 'V70', limit: 25, unit: '%', priority: 'optimal', source: 'protocol', sourceReference: 'NRG/RTOG prostate planning objectives' },
  { organ: 'Bladder', metric: 'V65', limit: 50, unit: '%', priority: 'optimal', source: 'protocol', sourceReference: 'NRG/RTOG prostate planning objectives' },
  { organ: 'Femoral heads', metric: 'Dmax', limit: 50, unit: 'Gy', priority: 'mandatory', source: 'protocol', sourceReference: 'Prostate EBRT planning objective' },
  { organ: 'Penile bulb', metric: 'Dmean', limit: 50, unit: 'Gy', priority: 'acceptable', source: 'protocol', sourceReference: 'Prostate EBRT planning objective' },
];

const systemic = (
  setting: SystemicTherapyRecommendation['setting'],
  regimen: string,
  agents: string[],
  timing: string,
  evidenceLevel: SystemicTherapyRecommendation['evidenceLevel'] = '1',
): SystemicTherapyRecommendation => ({ setting, regimen, agents, timing, evidenceLevel });

const references = (...extra: GuidelineReference[]): GuidelineReference[] => [NCCN, ASTRO, ESTRO, ...extra];

const inferRiskGroup = (input: ProstateInput): ProstateRiskGroup => {
  if (input.riskGroup) return input.riskGroup;
  if (input.metastaticSites?.length || input.setting.includes('metastatic')) return 'metastatic';
  if (input.nodalStatus === 'N1') return 'regional';
  const gleason = (input.gleasonPrimary ?? 0) + (input.gleasonSecondary ?? 0);
  const derivedGradeGroup = input.gradeGroup ?? (gleason >= 9 ? 5 : gleason === 8 ? 4 : gleason === 7 && input.gleasonPrimary === 4 ? 3 : gleason === 7 ? 2 : gleason === 6 ? 1 : undefined);
  if ((input.psaNgMl ?? 0) > 20 || (derivedGradeGroup ?? 1) >= 4 || ['T3a', 'T3b', 'T4', 'cT3', 'cT4'].includes(input.clinicalT ?? '')) return 'high';
  if ((derivedGradeGroup ?? 1) === 3 || (input.psaNgMl ?? 0) >= 10 || (input.positiveCoresPercent ?? 0) >= 50) return 'unfavorable-intermediate';
  if ((derivedGradeGroup ?? 1) === 2) return 'favorable-intermediate';
  if ((derivedGradeGroup ?? 1) === 1 && (input.psaNgMl ?? 0) < 10) return 'low';
  return 'unknown';
};

export class ProstateDecisionEngine extends BaseDecisionEngine<ProstateInput> {
  public readonly id = 'gus.prostate';
  public readonly version = '1.0.0';
  public readonly inputSchema = PROSTATE_INPUT_JSON_SCHEMA;
  public readonly outputSchema = PROSTATE_OUTPUT_JSON_SCHEMA;

  public constructor() {
    super('1.0.0');
  }

  protected evaluateCase(input: ProstateInput): CDSSResult {
    const recommendations: ClinicalRecommendation[] = [];
    const rationale: string[] = [];
    const warnings: string[] = [];
    const risk = inferRiskGroup(input);
    let rtIndication: CDSSResult['rtIndication'] = 'conditional';
    let intent: CDSSResult['intent'] = 'curative';

    if (input.priorPelvicRT) warnings.push('Önceki pelvik RT mevcut; kümülatif rektum, mesane, ince barsak ve femur dozları hesaplanmadan yeniden ışınlama önerilmez.');
    if (input.inflammatoryBowelDisease) warnings.push('Aktif inflamatuvar barsak hastalığında pelvik RT toksisitesi artabilir; gastroenteroloji ve multidisipliner risk değerlendirmesi gerekir.');
    if (input.lifeExpectancyYears !== undefined && input.lifeExpectancyYears < 10 && input.setting === 'newly-diagnosed-localized') {
      recommendations.push({
        id: 'localized-observation',
        label: 'Gözlem veya semptom odaklı yaklaşım',
        indication: 'not-indicated',
        intent: 'observation',
        rationale: ['Yaşam beklentisi 10 yıldan kısa ve düşük/uygun orta riskli lokalize hastalıkta küratif lokal tedavinin net yararı sınırlı olabilir.'],
        guidelineReferences: references(),
      });
      rtIndication = 'not-indicated';
      intent = 'observation';
    } else if (input.setting === 'newly-diagnosed-localized') {
      const highRisk = risk === 'high' || risk === 'very-high' || risk === 'regional';
      const pelvic = highRisk || input.nodalStatus === 'N1';
      const moderate = fraction(60, 20, 'moderate-hypofractionation', '60 Gy / 20 fx');
      const highDose = fraction(78, 39, 'conventional', '78 Gy / 39 fx; prostat ± seminal vezikül, elektif pelvis 46-50 Gy');
      const ultra = fraction(36.25, 5, 'SBRT', '36.25 Gy / 5 fx; uygun seçilmiş hasta');
      const systemicTherapy = highRisk
        ? [
            systemic('concurrent', 'Neoadjuvan ve eşzamanlı uzun süreli ADT', ['LHRH agonist/antagonist'], 'RT öncesi başlanır ve toplam yaklaşık 18-36 ay; risk ve toleransa göre'),
            ...(risk === 'high' || risk === 'very-high'
              ? [systemic('adjuvant', 'Androjen reseptör yolu intensifikasyonu değerlendirmesi', ['abiraterone + prednisone'], 'Yüksek riskli, uygun fit hastada; STAMPEDE/NCCN kriterlerine göre')]
              : []),
          ]
        : undefined;
      recommendations.push({
        id: 'localized-definitive-rt',
        label: highRisk ? 'Definitif RT + uzun süreli ADT' : 'Definitif prostat RT',
        indication: 'indicated',
        intent: highRisk ? 'adjuvant' : 'curative',
        fractionation: highRisk ? highDose : moderate,
        targetVolumes: prostateTargets(highRisk ? highDose : moderate, pelvic),
        oarConstraints: prostateOars,
        systemicTherapy,
        rationale: [
          highRisk ? 'Yüksek/çok yüksek risk veya bölgesel hastalıkta prostat ± seminal vezikül ve seçilmiş pelvik nodlara RT, uzun süreli ADT ile kombine edilir.' : 'Lokalize düşük/orta riskli hastalıkta aktif izlem, prostatektomi veya definitif RT; yaşam beklentisi, komorbidite ve hasta tercihleri ile seçilir.',
          'CHHiP, orta hipofraksiyonasyonun uygun lokalize hastalarda konvansiyonel fraksiyonasyona alternatif olduğunu destekler.',
          'PACE-B, dikkatle seçilmiş düşük/orta riskli hastalarda SBRT’nin 5 fraksiyonda uygulanabilirliğini destekler; hipofraksiyonasyon kararı üriner fonksiyon, rektal anatomi ve IGRT kapasitesine bağlıdır.',
          pelvic ? 'Elektif nodal RT rutin tüm hastalara uygulanmaz; nodal risk, PSMA-PET ve kılavuz kriterlerine göre seçilir.' : 'Düşük nodal riskte elektif pelvik nodal RT önerilmez.',
        ],
        guidelineReferences: references(TRIAL_REFERENCES[0], TRIAL_REFERENCES[1], TRIAL_REFERENCES[2], TRIAL_REFERENCES[4]),
      });
      if (!input.urinaryFunctionPoor && !input.inflammatoryBowelDisease) {
        recommendations.push({
          id: 'localized-sbrt-option',
          label: 'Seçilmiş hastada prostat SBRT',
          indication: 'consider',
          intent: 'curative',
          fractionation: ultra,
          targetVolumes: prostateTargets(ultra, false),
          oarConstraints: prostateOars,
          rationale: ['5 fraksiyonlu SBRT; belirgin üriner obstrüksiyon, yüksek rektal risk, çok büyük prostat veya yetersiz IGRT olmayan seçilmiş hastalarda alternatif olabilir.'],
          guidelineReferences: references(ASTRO),
        });
      }
      rtIndication = 'indicated';
      rationale.push(input.prostatectomy
        ? 'Cerrahi seçeneği olan hastada prostatektomi sonrası R0/R1/R2, pT evresi, seminal vezikül invazyonu ve PSA kinetiği adjuvan veya erken salvage RT kararını belirler.'
        : 'Radikal prostatektomi ve pelvik lenf nodu diseksiyonu uygun seçilmiş hastada alternatif lokal tedavidir; cerrahi marjin ve nodal durum postoperatif RT/ADT kararını yönlendirir.');
    } else if (input.setting === 'post-prostatectomy' || input.setting === 'biochemical-recurrence') {
      const salvageDose = fraction(66, 33, 'conventional', 'Prostate yatağı 66 Gy / 33 fx; erken salvage bağlamında kurum protokolü');
      const recurrent = (input.postoperativePsaNgMl ?? 0) > 0.2 || input.surgicalMargin === 'R1' || input.extracapsularExtension || input.seminalVesicleInvasion;
      recommendations.push({
        id: 'post-prostatectomy-salvage-rt',
        label: recurrent ? 'Erken salvage prostate-bed RT ± ADT' : 'Postoperatif risk-adapte prostate-bed RT',
        indication: recurrent ? 'indicated' : 'consider',
        intent: 'salvage',
        fractionation: salvageDose,
        targetVolumes: prostateTargets(salvageDose, input.nodalStatus === 'N1', true),
        oarConstraints: prostateOars,
        systemicTherapy: recurrent && (input.psaDoublingTimeMonths ?? 99) < 12
          ? [systemic('concurrent', 'Kısa süreli ADT ile salvage RT', ['LHRH agonist/antagonist ± antiandrojen'], 'PSA kinetiği, patolojik risk ve görüntülemeye göre; bireyselleştirilir')]
          : undefined,
        rationale: [
          'Persistan veya yükselen PSA’da PSMA-PET/BT ve MR ile nüks lokalizasyonu değerlendirilir; negatif PSMA-PET mikroskopik prostate-bed hastalığını dışlamaz.',
          'R1 marjin, pT3/seminal vezikül invazyonu ve hızlı PSA doubling time salvage RT lehine klinik risk oluşturur.',
          'SPPORT/RTOG 0534, seçilmiş biyokimyasal nüks hastalarında prostate-bed RT’ye kısa süreli ADT ve pelvik nodal RT eklenmesini destekler.',
          'R0/R1/R2 kavramı prostatektomi patolojisi ile yorumlanır; R2 veya makroskopik rezidüde salvage yaklaşım doz ve hedef hacim açısından yeniden planlanmalıdır.',
        ],
        guidelineReferences: references(TRIAL_REFERENCES[3]),
      });
      rtIndication = recurrent ? 'indicated' : 'consider';
      intent = 'salvage';
    } else {
      intent = input.setting === 'metastatic-castration-resistant' ? 'palliative' : 'curative';
      const metastaticTherapy: SystemicTherapyRecommendation[] = [
        systemic('maintenance', 'Androjen deprivasyon tedavisi (ADT) ve yaşam uzatıcı intensifikasyon', ['LHRH agonist/antagonist + abiraterone/prednisone veya enzalutamide/apalutamide'], 'mCSPC’de başlangıçtan itibaren; hastalık yükü ve komorbiditeye göre'),
      ];
      if (input.molecularFinding === 'BRCA1' || input.molecularFinding === 'BRCA2' || input.molecularFinding === 'other-HRR') {
        metastaticTherapy.push(systemic('palliative', 'HRR değişikliğine göre PARP inhibitörü değerlendirmesi', ['olaparib/rucaparib/talazoparib'], 'Önceki tedavi, ruhsat ve güncel NCCN kriterlerine göre'));
      }
      if (input.molecularFinding === 'MSI-H' || input.molecularFinding === 'dMMR') {
        metastaticTherapy.push(systemic('palliative', 'İmmün kontrol noktası inhibitörü değerlendirmesi', ['pembrolizumab'], 'MSI-H/dMMR ve güncel kılavuz/ruhsat kriterlerine göre'));
      }
      recommendations.push({
        id: 'metastatic-prostate-systemic-and-rt',
        label: input.setting === 'metastatic-castration-sensitive' ? 'mCSPC sistemik intensifikasyonu ± primer RT' : 'mCRPC sistemik tedavi ve semptom odaklı RT',
        indication: 'conditional',
        intent,
        systemicTherapy: metastaticTherapy,
        rationale: [
          input.setting === 'metastatic-castration-sensitive'
            ? 'Metastatik hormona duyarlı hastalıkta ADT tek başına yerine uygun hastada AR-yolu intensifikasyonu; düşük metastatik yükte primer prostata RT seçilmiş hastada düşünülebilir.'
            : 'mCRPC’de sistemik tedavi dizilimi, semptom yükü, progresyon paterni ve genomik profile göre yapılır; RT ağrı, spinal kord basısı, kırık riski veya oligoprogresif odaklarda kullanılır.',
          'EGFR/ALK gibi akciğer kanseri sürücüleri prostat kanseri karar ağacına ait değildir; prostatta HRR ve MSI/MMR testleri klinik olarak daha anlamlıdır.',
        ],
        guidelineReferences: references(TRIAL_REFERENCES[4]),
      });
      if (input.metastaticSites?.length || input.setting === 'metastatic-castration-resistant') {
        recommendations.push({
          id: 'metastatic-palliative-rt',
          label: 'Metastatik odaklara palyatif veya metastaz-yönelimli RT',
          indication: 'consider',
          intent: 'palliative',
          rationale: ['Kemik ağrısı, spinal kord basısı, patolojik kırık riski veya sınırlı oligoprogresif odaklarda fraksiyonasyon ve stereotaktik yaklaşım lezyon/omurga stabilitesine göre seçilir.'],
          guidelineReferences: references(),
        });
      }
      rtIndication = input.metastaticSites?.length ? 'conditional' : 'consider';
    }

    return {
      schemaVersion: '1.0',
      engineId: this.id,
      engineVersion: this.version,
      caseId: input.caseId,
      organSystem: 'gus',
      rtIndication,
      intent,
      summary: this.summary(input, risk),
      recommendations,
      rationale,
      warnings: warnings.length ? warnings : undefined,
      uncertainties: risk === 'unknown' ? ['Risk grubu için PSA, grade group, klinik T ve nodal/metastatik değerlendirme eksik.'] : undefined,
      confidence: risk === 'unknown' ? 0.68 : 0.87,
      generatedAt: new Date().toISOString(),
      guidelineReferences: recommendations.flatMap((recommendation) => recommendation.guidelineReferences ?? []),
    };
  }

  private summary(input: ProstateInput, risk: ProstateRiskGroup): string {
    if (input.setting === 'post-prostatectomy' || input.setting === 'biochemical-recurrence') return 'Prostatektomi sonrası veya biyokimyasal nüks: PSMA-PET/MR, PSA kinetiği ve patolojik risk ile erken salvage RT değerlendirmesi.';
    if (input.setting === 'metastatic-castration-sensitive') return 'Metastatik hormona duyarlı prostat kanseri: ADT tabanlı sistemik intensifikasyon ve seçilmiş durumda primer/metastaz RT.';
    if (input.setting === 'metastatic-castration-resistant') return 'Kastrasyona dirençli metastatik prostat kanseri: genomik profile göre sistemik tedavi ve semptom/oligoprogresyon odaklı RT.';
    return `Yeni tanı lokalize prostat kanseri: ${risk} risk grubu için risk-adapte lokal tedavi, RT ve sistemik tedavi değerlendirmesi.`;
  }
}

export const prostateEngine = new ProstateDecisionEngine();

export default prostateEngine;
