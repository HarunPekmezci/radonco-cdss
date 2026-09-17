import {
  CDSSResult,
  ClinicalCaseInput,
  ClinicalRecommendation,
  Fractionation,
  GuidelineReference,
  OARConstraint,
  SystemicTherapyRecommendation,
  TargetVolume,
  TNMStage,
} from '../../types/cdss';
import { JsonSchema } from '../../types/cdss';
import { BaseDecisionEngine } from '../base-engine';

export type NSCLCSetting = 'operable-early' | 'medically-inoperable-early' | 'locally-advanced' | 'metastatic';
export type NSCLCResectability = 'resectable' | 'borderline' | 'unresectable' | 'unknown';
export type NSCLCCentrality = 'peripheral' | 'central' | 'ultra-central';
export type NSCLCMediastinalStaging = 'not-done' | 'negative' | 'positive' | 'indeterminate';
export type NSCLCDriverAlteration =
  | 'EGFR'
  | 'ALK'
  | 'ROS1'
  | 'BRAF_V600E'
  | 'KRAS_G12C'
  | 'MET_exon14'
  | 'RET'
  | 'NTRK'
  | 'HER2'
  | 'no-actionable-alteration'
  | 'unknown';

export interface NSCLCInput extends ClinicalCaseInput {
  organSystem: 'thorax';
  disease: 'non-small-cell-lung-cancer';
  setting: NSCLCSetting;
  stage?: TNMStage;
  tumorSizeCm?: number;
  centrality?: NSCLCCentrality;
  mediastinalStaging?: NSCLCMediastinalStaging;
  resectability?: NSCLCResectability;
  surgicalMargin?: 'R0' | 'R1' | 'R2' | 'RX' | 'not-applicable';
  nodalDisease?: boolean;
  bulkyNodalDisease?: boolean;
  actionableAlteration?: NSCLCDriverAlteration;
  pdL1TumorProportionScore?: number;
  performanceStatusECOG?: number;
  interstitialLungDisease?: boolean;
  priorThoracicRT?: boolean;
  oligometastatic?: boolean;
  metastasesControlled?: boolean;
}

const NCCN_NSCLC: GuidelineReference = {
  organization: 'NCCN',
  title: 'NCCN Clinical Practice Guidelines in Oncology: Non-Small Cell Lung Cancer',
  version: 'Current version; verify institutional subscription before use',
  url: 'https://www.nccn.org/guidelines/guidelines-detail?category=1&id=1450',
  evidenceLevel: '2A',
};

const ASTRO_SABR: GuidelineReference = {
  organization: 'ASTRO',
  title: 'ASTRO guideline: Stereotactic body radiation therapy for early-stage NSCLC',
  url: 'https://www.practicalradonc.org/article/S1879-355X(17)30056-0/fulltext',
  evidenceLevel: 'A',
};

const ESTRO_ACROP: GuidelineReference = {
  organization: 'ESTRO',
  title: 'ESTRO-ACROP recommendations for stereotactic and locally advanced lung radiotherapy',
  url: 'https://www.estro.org/Science/Guidelines',
  evidenceLevel: 'B',
};

const PACIFIC: GuidelineReference = {
  organization: 'other',
  title: 'PACIFIC trial: durvalumab after concurrent chemoradiotherapy in unresectable stage III NSCLC',
  url: 'https://doi.org/10.1056/NEJMoa1709937',
  evidenceLevel: '1',
};

const RTOG_REFERENCES: GuidelineReference[] = [
  {
    organization: 'other',
    title: 'RTOG 0236: SBRT for medically inoperable peripheral stage I NSCLC',
    url: 'https://clinicaltrials.gov/study/NCT00057993',
    evidenceLevel: '1',
  },
  {
    organization: 'other',
    title: 'RTOG 0813: five-fraction SBRT for centrally located NSCLC',
    url: 'https://clinicaltrials.gov/study/NCT00750269',
    evidenceLevel: '2A',
  },
  {
    organization: 'other',
    title: 'RTOG 0617: dose and concurrent chemotherapy in stage III NSCLC',
    url: 'https://clinicaltrials.gov/study/NCT00533949',
    evidenceLevel: '1',
  },
];

export const NSCLC_INPUT_JSON_SCHEMA: JsonSchema = {
  $schema: 'http://json-schema.org/draft-07/schema#',
  $id: 'https://radonco.local/schema/nsclc-input.json',
  title: 'Non-small-cell lung cancer clinical case input',
  type: 'object',
  required: ['organSystem', 'disease', 'setting'],
  properties: {
    organSystem: { type: 'string', enum: ['thorax'] },
    disease: { type: 'string', enum: ['non-small-cell-lung-cancer'] },
    setting: { type: 'string', enum: ['operable-early', 'medically-inoperable-early', 'locally-advanced', 'metastatic'] },
    stage: { type: 'object', additionalProperties: true },
    tumorSizeCm: { type: 'number' },
    centrality: { type: 'string', enum: ['peripheral', 'central', 'ultra-central'] },
    mediastinalStaging: { type: 'string', enum: ['not-done', 'negative', 'positive', 'indeterminate'] },
    resectability: { type: 'string', enum: ['resectable', 'borderline', 'unresectable', 'unknown'] },
    surgicalMargin: { type: 'string', enum: ['R0', 'R1', 'R2', 'RX', 'not-applicable'] },
    nodalDisease: { type: 'boolean' },
    bulkyNodalDisease: { type: 'boolean' },
    actionableAlteration: { type: 'string' },
    pdL1TumorProportionScore: { type: 'number' },
    performanceStatusECOG: { type: 'number' },
    interstitialLungDisease: { type: 'boolean' },
    priorThoracicRT: { type: 'boolean' },
    oligometastatic: { type: 'boolean' },
    metastasesControlled: { type: 'boolean' },
  },
  additionalProperties: true,
};

export const NSCLC_OUTPUT_JSON_SCHEMA: JsonSchema = {
  $schema: 'http://json-schema.org/draft-07/schema#',
  $id: 'https://radonco.local/schema/nsclc-result.json',
  title: 'Non-small-cell lung cancer CDSS result',
  type: 'object',
  required: ['schemaVersion', 'engineId', 'engineVersion', 'organSystem', 'rtIndication', 'intent', 'summary', 'recommendations'],
  properties: {
    schemaVersion: { type: 'string', enum: ['1.0'] },
    engineId: { type: 'string', enum: ['thorax.nsclc'] },
    engineVersion: { type: 'string' },
    organSystem: { type: 'string', enum: ['thorax'] },
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

const earlyTargets = (dose: Fractionation): TargetVolume[] => [
  { name: 'GTV', description: 'Primer tümör; 4D-CT ve PET/BT ile tanımlanır.', dose, margin: 'GTV görünür hastalık' },
  { name: 'ITV', description: 'Solunum hareketi; 4D-CT fazları veya breath-hold ile oluşturulur.', dose, margin: 'GTV hareket zarfı' },
  { name: 'PTV', description: 'ITV üzerine görüntüleme ve kurulum belirsizliği marjı.', dose, margin: 'Genellikle 3-5 mm; kurum IGRT protokolüne göre' },
];

const locallyAdvancedTargets = (dose: Fractionation): TargetVolume[] => [
  { name: 'GTV', description: 'Primer ve PET/BT-pozitif nodal hastalık.', dose, margin: 'Görüntülenebilir hastalık' },
  { name: 'CTV', description: 'GTV/ITV ve seçilmiş mikroskopik yayılım alanları.', dose, margin: 'Primer için yaklaşık 5-8 mm; anatomik bariyerler dikkate alınır' },
  { name: 'PTV', description: 'Solunum ve günlük kurulum belirsizliğini kapsar.', dose, margin: 'ITV/CTV üzerine yaklaşık 5 mm; 4D-CT/IGRT ile kurum protokolü' },
];

const thoracicOARConstraints: OARConstraint[] = [
  { organ: 'Total lung minus GTV/ITV', metric: 'V20', limit: 30, unit: '%', priority: 'mandatory', source: 'QUANTEC', sourceReference: 'QUANTEC lung pneumonitis' },
  { organ: 'Total lung minus GTV/ITV', metric: 'Dmean', limit: 20, unit: 'Gy', priority: 'optimal', source: 'QUANTEC', sourceReference: 'QUANTEC lung pneumonitis' },
  { organ: 'Esophagus', metric: 'Dmean', limit: 34, unit: 'Gy', priority: 'optimal', source: 'QUANTEC', sourceReference: 'QUANTEC esophageal toxicity' },
  { organ: 'Esophagus', metric: 'V60', limit: 17, unit: '%', priority: 'optimal', source: 'QUANTEC', sourceReference: 'QUANTEC esophageal toxicity' },
  { organ: 'Heart', metric: 'Dmean', limit: 26, unit: 'Gy', priority: 'optimal', source: 'QUANTEC', sourceReference: 'QUANTEC cardiac toxicity' },
  { organ: 'Heart', metric: 'V30', limit: 46, unit: '%', priority: 'optimal', source: 'QUANTEC', sourceReference: 'QUANTEC cardiac toxicity' },
  { organ: 'Heart', metric: 'V50', limit: 25, unit: '%', priority: 'optimal', source: 'protocol', sourceReference: 'RTOG 0617 / institutional planning objectives' },
  { organ: 'Spinal cord', metric: 'Dmax', limit: 50, unit: 'Gy', priority: 'mandatory', source: 'QUANTEC', sourceReference: 'QUANTEC spinal cord myelopathy' },
  { organ: 'Brachial plexus', metric: 'Dmax', limit: 66, unit: 'Gy', priority: 'mandatory', source: 'protocol', sourceReference: 'RTOG brachial plexus constraint; respect fractionation and prior RT' },
];

const systemic = (setting: SystemicTherapyRecommendation['setting'], regimen: string, agents: string[], timing: string, evidenceLevel: SystemicTherapyRecommendation['evidenceLevel'] = '2A'): SystemicTherapyRecommendation => ({
  setting,
  regimen,
  agents,
  timing,
  evidenceLevel,
});

const referencesFor = (...extra: GuidelineReference[]): GuidelineReference[] => [NCCN_NSCLC, ASTRO_SABR, ESTRO_ACROP, ...extra];

export class NSCLCDecisionEngine extends BaseDecisionEngine<NSCLCInput> {
  public readonly id = 'thorax.nsclc';
  public readonly version = '1.0.0';
  public readonly inputSchema = NSCLC_INPUT_JSON_SCHEMA;
  public readonly outputSchema = NSCLC_OUTPUT_JSON_SCHEMA;

  public constructor() {
    super('1.0.0');
  }

  protected evaluateCase(input: NSCLCInput): CDSSResult {
    const warnings: string[] = [];
    const rationale: string[] = [];
    const recommendations: ClinicalRecommendation[] = [];
    let rtIndication: CDSSResult['rtIndication'] = 'conditional';
    let intent: CDSSResult['intent'] = 'curative';

    if (input.interstitialLungDisease) {
      warnings.push('İnterstisyel akciğer hastalığında SBRT/torasik RT ciddi veya fatal pnömonit riskini artırabilir; multidisipliner ve bireysel risk değerlendirmesi gerekir.');
    }
    if (input.priorThoracicRT) {
      warnings.push('Önceki torasik RT nedeniyle kümülatif OAR dozları ve yeniden ışınlama belirsizliği ayrıca değerlendirilmelidir.');
    }

    if (input.setting === 'operable-early' || input.setting === 'medically-inoperable-early') {
      const central = input.centrality === 'central' || input.centrality === 'ultra-central';
      const dose = central
        ? fraction(50, 5, 'SBRT', '50 Gy / 5 fx; merkezi veya ultra-merkezi lezyonlarda güvenlik öncelikli')
        : fraction(54, 3, 'SBRT', '54 Gy / 3 fx; periferik uygun lezyon')
      ;
      const isOperable = input.setting === 'operable-early';
      const surgeryRationale = isOperable
        ? 'Operabl hastada anatomik rezeksiyon ve sistematik mediastinal evreleme (hiler/mediastinal nod örneklemesi veya diseksiyonu) standart lokal tedavi seçeneğidir.'
        : 'Medikal inoperabl veya cerrahi riski yüksek hastada SBRT, biyopsi/PET-BT ve uygun mediastinal evreleme ile küratif alternatiftir.';
      recommendations.push({
        id: isOperable ? 'early-surgery' : 'early-sbrt',
        label: isOperable ? 'Cerrahi rezeksiyon ± adjuvan tedavi' : 'Küratif akciğer SBRT',
        indication: 'indicated',
        intent: 'curative',
        fractionation: isOperable ? undefined : dose,
        targetVolumes: isOperable ? undefined : earlyTargets(dose),
        oarConstraints: isOperable ? undefined : thoracicOARConstraints,
        systemicTherapy: input.actionableAlteration && input.actionableAlteration !== 'no-actionable-alteration'
          ? [systemic('adjuvant', 'Moleküler sürücüye göre adjuvan hedefe yönelik tedavi değerlendirmesi', [input.actionableAlteration], 'Rezeksiyon ve patolojik evreleme sonrası MDT; hedefe yönelik tedavi RT ile otomatik olarak eşzamanlı değildir.')]
          : undefined,
        rationale: [
          surgeryRationale,
          central ? 'Santral/ultra-santral lezyonlarda 3 fraksiyon yerine 4-5 fraksiyon ve yakın bronş, özofagus, kalp, büyük damar ve medulla kısıtları tercih edilir; “no-fly zone” içinde tek fraksiyon uygulanmaz.' : 'Periferik uygun lezyonlarda 3x18 Gy veya 4x12 Gy gibi biyolojik olarak ablatif şemalar, tümör boyutu ve OAR yakınlığına göre seçilir.',
          'RTOG 0236 ve ASTRO/ESTRO stereotaktik RT önerileri ile uyumlu olarak 4D-CT, IGRT ve hareket yönetimi gereklidir.',
        ],
        guidelineReferences: referencesFor(RTOG_REFERENCES[0]),
      });
      if (isOperable) {
        rationale.push('R0 hedeflenir; R1/R2 marjin veya yetersiz mediastinal evreleme durumunda postoperatif RT/yeniden rezeksiyon kararı patoloji ve MDT ile verilmelidir.');
      }
    } else if (input.setting === 'locally-advanced') {
      const dose = fraction(60, 30, 'conventional', '60 Gy / 30 fx; seçilmiş olguda 66 Gy / 33 fx');
      const systemicTherapy = [
        systemic('concurrent', 'Platin bazlı eşzamanlı kemoradyoterapi', ['cisplatin/etoposide veya carboplatin/paclitaxel'], 'RT ile eşzamanlı; uygun performans ve organ fonksiyonu olan hastada', '1'),
        systemic('maintenance', 'Konsolidasyon durvalumab', ['durvalumab'], 'KRT tamamlandıktan sonra progresyon yoksa; uygun hastada 12 aya kadar', '1'),
      ];
      if (input.actionableAlteration === 'EGFR' || input.actionableAlteration === 'ALK') {
        warnings.push(`${input.actionableAlteration} değişikliği lokal ileri hastalıkta sistemik tedavi ve klinik çalışma seçimini etkiler; durvalumab ve hedefe yönelik tedavi sıralaması göğüs hastalıkları/medikal onkoloji ile bireyselleştirilmelidir.`);
      }
      recommendations.push({
        id: 'stage-iii-concurrent-chemoradiation',
        label: 'Definitif eşzamanlı KRT + konsolidasyon immünoterapisi',
        indication: 'indicated',
        intent: 'definitive',
        fractionation: dose,
        targetVolumes: locallyAdvancedTargets(dose),
        oarConstraints: thoracicOARConstraints,
        systemicTherapy,
        rationale: [
          'Unrezektabl evre III KHDAK için 60-66 Gy / 30-33 fraksiyon IMRT/VMAT ile definitif eşzamanlı KRT temel yaklaşımdır.',
          'Elektif nodal ışınlama (ENI) rutin önerilmez; PET/BT ve beyin MR ile doğrulanmış involved-field yaklaşımı ve seçilmiş nodal istasyonlar tercih edilir.',
          'PACIFIC çalışması, progresyon olmayan ve uygun hastada KRT sonrası durvalumab ile sağkalım kazanımını destekler.',
          'RTOG 0617, doz artırmanın otomatik olarak üstün olmadığını; kalp/akciğer dozlarının ve tedavi güvenliğinin kritik olduğunu gösterir.',
        ],
        guidelineReferences: referencesFor(PACIFIC, RTOG_REFERENCES[2]),
      });
      rationale.push(input.mediastinalStaging === 'not-done' || input.mediastinalStaging === 'indeterminate'
        ? 'Küratif torasik tedavi öncesi EBUS/EUS ve/veya mediastinoskopi ile patolojik mediastinal evreleme önerilir.'
        : 'Mediastinal evreleme sonucu hedef hacim ve cerrahi/definitif KRT seçimini yönlendirir.');
    } else {
      rtIndication = input.oligometastatic && input.metastasesControlled ? 'consider' : 'conditional';
      intent = 'palliative';
      if (input.oligometastatic && input.metastasesControlled) {
        intent = 'curative';
        recommendations.push({
          id: 'oligometastatic-consolidative-rt',
          label: 'Seçilmiş oligometastatik hastalıkta konsolidatif lokal RT',
          indication: 'consider',
          intent: 'curative',
          fractionation: fraction(50, 5, 'SBRT', 'Metastaz ve primer bölgeye göre 3-5 fx SBRT'),
          targetVolumes: earlyTargets(fraction(50, 5, 'SBRT', '3-5 fx')),
          oarConstraints: thoracicOARConstraints,
          rationale: ['Primer ve metastatik odakların kontrol altında olduğu, sınırlı metastatik yükte MDT kararıyla konsolidatif lokal tedavi düşünülebilir.'],
          guidelineReferences: referencesFor(),
        });
      } else {
        recommendations.push({
          id: 'metastatic-palliative-rt',
          label: 'Semptom veya tehdit oluşturan odaklara palyatif RT',
          indication: 'conditional',
          intent: 'palliative',
          rationale: ['RT hemoptizi, ağrı, hava yolu/özofagus basısı, vena cava superior sendromu veya oligoprogresif odaklarda semptom ve lokal kontrol amacıyla kullanılabilir.'],
          guidelineReferences: referencesFor(),
        });
      }
      if (input.actionableAlteration && input.actionableAlteration !== 'no-actionable-alteration' && input.actionableAlteration !== 'unknown') {
        recommendations[0].systemicTherapy = [
          systemic('palliative', 'Sürücü değişikliğine özgü ilk sıra hedefe yönelik tedavi', [input.actionableAlteration], 'Moleküler tümör kurulunun güncel sistemik tedavi algoritmasına göre'),
        ];
        rationale.push('EGFR, ALK, ROS1, BRAF, KRAS G12C, MET, RET, NTRK ve HER2 gibi sürücüler için geniş moleküler profil sonuçları sistemik tedavinin RT sıralamasını belirler; CHRYSALIS ve ilgili hedefe yönelik tedavi kanıtları bu karar ağacına bağlanmalıdır.');
      }
    }

    if (input.nodalDisease && input.setting !== 'metastatic') {
      rationale.push('Nodal hastalıkta cerrahi kapsamı ve R0 olasılığı; PET/BT, EBUS/EUS, mediastinoskopi ve gerektiğinde multidisipliner yeniden değerlendirme ile belirlenmelidir.');
    }

    return {
      schemaVersion: '1.0',
      engineId: this.id,
      engineVersion: this.version,
      caseId: input.caseId,
      organSystem: 'thorax',
      rtIndication,
      intent,
      summary: this.summary(input),
      recommendations,
      rationale,
      warnings: warnings.length ? warnings : undefined,
      uncertainties: input.mediastinalStaging === 'not-done' ? ['Mediastinal evreleme tamamlanmamış.'] : undefined,
      confidence: input.mediastinalStaging === 'not-done' ? 0.72 : 0.86,
      generatedAt: new Date().toISOString(),
      guidelineReferences: recommendations.flatMap((recommendation) => recommendation.guidelineReferences ?? []),
    };
  }

  private summary(input: NSCLCInput): string {
    if (input.setting === 'locally-advanced') return 'Lokal ileri KHDAK: definitif eşzamanlı KRT ve uygun hastada PACIFIC yaklaşımı.';
    if (input.setting === 'metastatic') return input.oligometastatic ? 'Oligometastatik KHDAK: sistemik tedavi ve seçilmiş konsolidatif lokal tedavi değerlendirmesi.' : 'Metastatik KHDAK: moleküler profile göre sistemik tedavi; semptomatik odaklarda RT.';
    return input.setting === 'operable-early' ? 'Erken evre operabl KHDAK: R0 hedefli cerrahi ve patolojik evreye göre adjuvan tedavi.' : 'Erken evre medikal inoperabl/yüksek cerrahi riskli KHDAK: küratif SBRT değerlendirmesi.';
  }
}

export const nsclcEngine = new NSCLCDecisionEngine();

export default nsclcEngine;
