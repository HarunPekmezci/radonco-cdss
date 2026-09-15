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

export type PenileSetting = 'newly-diagnosed' | 'postoperative' | 'recurrent' | 'metastatic';
export type PenileHistology = 'squamous-cell' | 'basaloid' | 'verrucous' | 'other' | 'unknown';
export type PenileHPVStatus = 'p16-positive' | 'p16-negative' | 'unknown';
export type PenileHIVStatus = 'negative' | 'positive-controlled' | 'positive-uncontrolled' | 'unknown';
export type PenileMolecularFinding = 'HPV-associated' | 'PD-L1-positive' | 'MSI-H' | 'dMMR' | 'none' | 'unknown';

export interface PenileInput extends ClinicalCaseInput {
  organSystem: 'gus';
  disease: 'penile-cancer';
  setting: PenileSetting;
  stage?: TNMStage;
  histology?: PenileHistology;
  clinicalT?: string;
  nodalStatus?: 'N0' | 'N1' | 'N2' | 'N3' | 'unknown';
  inguinalNodesInvolved?: boolean;
  pelvicNodesInvolved?: boolean;
  tumorSizeCm?: number;
  urethralInvolvement?: boolean;
  corporalInvasion?: boolean;
  hpvStatus?: PenileHPVStatus;
  hivStatus?: PenileHIVStatus;
  cd4Count?: number;
  surgicalMargin?: 'R0' | 'R1' | 'R2' | 'RX' | 'not-applicable';
  surgeryType?: 'circumcision' | 'local-excision' | 'glansectomy' | 'partial-penectomy' | 'total-penectomy' | 'none' | 'unknown';
  priorPelvicRT?: boolean;
  metastaticSites?: string[];
  performanceStatusECOG?: number;
  molecularFinding?: PenileMolecularFinding;
}

const NCCN: GuidelineReference = {
  organization: 'NCCN',
  title: 'NCCN Clinical Practice Guidelines in Oncology: Penile Cancer',
  version: 'Current version; verify institutional subscription before use',
  url: 'https://www.nccn.org/guidelines/guidelines-detail?category=1&id=1456',
  evidenceLevel: '2A',
};

const ASTRO: GuidelineReference = {
  organization: 'ASTRO',
  title: 'ASTRO clinical practice resources for genitourinary and skin/anal squamous cancers',
  url: 'https://www.astro.org/Patient-Care-and-Research/Clinical-Practice-Statements',
  evidenceLevel: 'B',
};

const ESTRO: GuidelineReference = {
  organization: 'ESTRO',
  title: 'ESTRO-ACROP guidance for penile cancer and inguinal nodal radiotherapy',
  url: 'https://www.estro.org/Science/Guidelines',
  evidenceLevel: 'B',
};

const TRIALS: GuidelineReference[] = [
  {
    organization: 'other',
    title: 'INPACT: international consensus on penile cancer management',
    url: 'https://doi.org/10.1016/S1470-2045(20)30143-7',
    evidenceLevel: '2A',
  },
  {
    organization: 'other',
    title: 'TIP chemotherapy in advanced penile squamous cell carcinoma',
    url: 'https://doi.org/10.1200/JCO.2008.20.0763',
    evidenceLevel: '2A',
  },
  {
    organization: 'other',
    title: 'PLATINUM trial: adjuvant radiotherapy in high-risk penile cancer',
    url: 'https://clinicaltrials.gov/study/NCT02012439',
    evidenceLevel: '2A',
  },
];

export const PENILE_INPUT_JSON_SCHEMA: JsonSchema = {
  $schema: 'http://json-schema.org/draft-07/schema#',
  $id: 'https://radonco.local/schema/penile-input.json',
  title: 'Penile cancer clinical case input',
  type: 'object',
  required: ['organSystem', 'disease', 'setting'],
  properties: {
    organSystem: { type: 'string', enum: ['gus'] },
    disease: { type: 'string', enum: ['penile-cancer'] },
    setting: { type: 'string', enum: ['newly-diagnosed', 'postoperative', 'recurrent', 'metastatic'] },
    stage: { type: 'object', additionalProperties: true },
    histology: { type: 'string', enum: ['squamous-cell', 'basaloid', 'verrucous', 'other', 'unknown'] },
    clinicalT: { type: 'string' },
    nodalStatus: { type: 'string', enum: ['N0', 'N1', 'N2', 'N3', 'unknown'] },
    inguinalNodesInvolved: { type: 'boolean' },
    pelvicNodesInvolved: { type: 'boolean' },
    tumorSizeCm: { type: 'number' },
    urethralInvolvement: { type: 'boolean' },
    corporalInvasion: { type: 'boolean' },
    hpvStatus: { type: 'string', enum: ['p16-positive', 'p16-negative', 'unknown'] },
    hivStatus: { type: 'string', enum: ['negative', 'positive-controlled', 'positive-uncontrolled', 'unknown'] },
    cd4Count: { type: 'number' },
    surgicalMargin: { type: 'string', enum: ['R0', 'R1', 'R2', 'RX', 'not-applicable'] },
    surgeryType: { type: 'string' },
    priorPelvicRT: { type: 'boolean' },
    metastaticSites: { type: 'array', items: { type: 'string' } },
    performanceStatusECOG: { type: 'number' },
    molecularFinding: { type: 'string' },
  },
  additionalProperties: true,
};

export const PENILE_OUTPUT_JSON_SCHEMA: JsonSchema = {
  $schema: 'http://json-schema.org/draft-07/schema#',
  $id: 'https://radonco.local/schema/penile-result.json',
  title: 'Penile cancer CDSS result',
  type: 'object',
  required: ['schemaVersion', 'engineId', 'engineVersion', 'organSystem', 'rtIndication', 'intent', 'summary', 'recommendations'],
  properties: {
    schemaVersion: { type: 'string', enum: ['1.0'] },
    engineId: { type: 'string', enum: ['gus.penile'] },
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

const fraction = (totalDoseGy: number, fractions: number, schedule: string): Fractionation => ({
  class: 'conventional',
  totalDoseGy,
  fractions,
  dosePerFractionGy: totalDoseGy / fractions,
  schedule,
  technique: 'IMRT',
  alphaBetaTumor: 10,
  bedGy: totalDoseGy * (1 + totalDoseGy / fractions / 10),
  eqd2Gy: totalDoseGy * ((totalDoseGy / fractions + 10) / 12),
});

const penileTargets = (radiationDose: Fractionation, includeNodes = true): TargetVolume[] => [
  {
    name: 'GTV',
    description: 'Primer penis tümörü ve görüntülenebilir inguinal/pelvik nodlar; klinik muayene ve MRI/PET-BT ile.',
    dose: radiationDose,
    margin: 'Görüntülenebilir hastalık',
  },
  {
    name: 'CTV',
    description: 'Primer tümör yatağı, korpus/üretra risk alanı ve cerrahi yatak.',
    dose: radiationDose,
    margin: 'Anatomik bariyerler ve cerrahi klipler dikkate alınır',
  },
  ...(includeNodes
    ? [{
        name: 'CTV',
        description: 'Bilateral inguinal ve seçilmiş external/internal iliak-pelvik nodal alanlar.',
        dose: fraction(45, 25, 'İnguinal/pelvik nodlar 45 Gy / 25 fx'),
        margin: 'İnguinal ve pelvik nodal atlas',
      }]
    : []),
  {
    name: 'PTV',
    description: 'Pelvik/inguinal hareket ve günlük kurulum için CTV marjı.',
    dose: radiationDose,
    margin: 'IGRT ile yaklaşık 5-10 mm; femur başı ve genital organ dozlarına göre',
  },
];

const penileOars: OARConstraint[] = [
  { organ: 'Small bowel', metric: 'V45', limit: 195, unit: 'cc', priority: 'mandatory', source: 'protocol', sourceReference: 'Inguinal/pelvic RT bowel objective' },
  { organ: 'Bladder', metric: 'V40', limit: 50, unit: '%', priority: 'optimal', source: 'protocol', sourceReference: 'Pelvic RT planning objective' },
  { organ: 'Femoral heads', metric: 'Dmax', limit: 44, unit: 'Gy', priority: 'mandatory', source: 'protocol', sourceReference: 'Inguinal nodal RT objective' },
  { organ: 'External genitalia', metric: 'Dmean', limit: 45, unit: 'Gy', priority: 'acceptable', source: 'protocol', sourceReference: 'Penile cancer IMRT objective' },
  { organ: 'Remaining testis', metric: 'Dmean', limit: 2, unit: 'Gy', priority: 'mandatory', source: 'protocol', sourceReference: 'Gonadal preservation objective' },
];

const systemic = (setting: SystemicTherapyRecommendation['setting'], regimen: string, agents: string[], timing: string, evidenceLevel: SystemicTherapyRecommendation['evidenceLevel'] = '2A'): SystemicTherapyRecommendation => ({ setting, regimen, agents, timing, evidenceLevel });
const references = (...extra: GuidelineReference[]): GuidelineReference[] => [NCCN, ASTRO, ESTRO, ...extra];

export class PenileDecisionEngine extends BaseDecisionEngine<PenileInput> {
  public readonly id = 'gus.penile';
  public readonly version = '1.0.0';
  public readonly inputSchema = PENILE_INPUT_JSON_SCHEMA;
  public readonly outputSchema = PENILE_OUTPUT_JSON_SCHEMA;

  public constructor() {
    super('1.0.0');
  }

  protected evaluateCase(input: PenileInput): CDSSResult {
    const recommendations: ClinicalRecommendation[] = [];
    const rationale: string[] = [];
    const warnings: string[] = [];
    let rtIndication: CDSSResult['rtIndication'] = 'conditional';
    let intent: CDSSResult['intent'] = 'curative';

    if (input.priorPelvicRT) warnings.push('Önceki pelvik RT mevcut; ince barsak, mesane, femur başları ve genital yapıların kümülatif dozları hesaplanmalıdır.');
    if (input.hivStatus === 'positive-uncontrolled' || (input.hivStatus === 'positive-controlled' && (input.cd4Count ?? 999) < 200)) {
      warnings.push('Kontrolsüz HIV veya CD4 <200 hücre/µL durumunda enfeksiyon ve hematolojik toksisite riski için enfeksiyon hastalıkları ile optimizasyon gerekir.');
    }

    if (input.setting === 'newly-diagnosed') {
      const primaryDose = fraction(60, 30, 'Primer penis RT 60 Gy / 30 fx; seçilmiş organ koruma/definitif yaklaşım');
      recommendations.push({
        id: 'penile-organ-preserving-local-treatment',
        label: 'Organ koruyucu lokal eksizyon/glansectomi veya seçilmiş RT',
        indication: 'indicated',
        intent: 'curative',
        fractionation: input.corporalInvasion ? undefined : primaryDose,
        targetVolumes: input.corporalInvasion ? undefined : penileTargets(primaryDose, false),
        oarConstraints: input.corporalInvasion ? undefined : penileOars,
        rationale: [
          'Küçük, yüzeyel ve sınırlı primerlerde lokal eksizyon, sünnet/glansektomi veya seçilmiş organ koruyucu RT ile R0 marjin hedeflenir.',
          'Korpus/üretra invazyonu, geniş veya derin tümörde parsiyel/total penektomi gerekebilir; rekonstrüksiyon ve idrar fonksiyonu MDT’de planlanır.',
          'Elektif inguinal nodal RT rutin tüm N0 hastalara verilmez; tümör T evresi, diferansiyasyon, LVI/PNI ve palpabl nodlara göre risk-adapte karar verilir.',
        ],
        guidelineReferences: references(TRIALS[0]),
      });
      if (input.inguinalNodesInvolved || input.nodalStatus === 'N1' || input.nodalStatus === 'N2' || input.nodalStatus === 'N3') {
        const nodalDose = fraction(50.4, 28, 'İnguinal/pelvik nodal RT 45 Gy / 25 fx + boost');
        recommendations.push({
          id: 'penile-node-management',
          label: 'Pozitif inguinal nodlarda inguinal/pelvik diseksiyon ± RT',
          indication: 'indicated',
          intent: 'curative',
          fractionation: nodalDose,
          targetVolumes: penileTargets(nodalDose, true),
          oarConstraints: penileOars,
          systemicTherapy: input.nodalStatus === 'N2' || input.nodalStatus === 'N3'
            ? [systemic('neoadjuvant', 'Neoadjuvan TIP', ['paclitaxel + ifosfamide + cisplatin'], 'Bulky veya çoklu nodal hastalıkta cerrahi öncesi, uygun hastada')]
            : undefined,
          rationale: [
            'Pozitif inguinal nodlarda terapötik inguinal lenfadenektomi ve seçilmiş pelvik nod diseksiyonu temel bileşenlerdir.',
            'Bulky, bilateral, çoklu veya ekstranodal uzanımlı nodal hastalıkta neoadjuvan TIP ve ardından cerrahi/RT MDT’de değerlendirilir.',
            'R1/R2 nodal veya primer marjinlerinde boost ve sistemik tedavi sıralaması yeniden planlanmalıdır.',
          ],
          guidelineReferences: references(TRIALS[1]),
        });
        rtIndication = 'indicated';
      } else {
        rtIndication = 'consider';
      }
    } else if (input.setting === 'postoperative') {
      const postoperativeDose = fraction(50.4, 28, '45 Gy / 25 fx + 5.4 Gy / 3 fx boost');
      const highRisk = input.surgicalMargin === 'R1' || input.surgicalMargin === 'R2' || input.nodalStatus === 'N2' || input.nodalStatus === 'N3' || input.pelvicNodesInvolved;
      recommendations.push({
        id: 'postoperative-penile-management',
        label: highRisk ? 'Yüksek riskli postoperatif inguinal/pelvik RT ± sistemik tedavi' : 'Patolojiye göre postoperatif izlem',
        indication: highRisk ? 'consider' : 'conditional',
        intent: 'adjuvant',
        fractionation: highRisk ? postoperativeDose : undefined,
        targetVolumes: highRisk ? penileTargets(postoperativeDose, true) : undefined,
        oarConstraints: highRisk ? penileOars : undefined,
        systemicTherapy: highRisk ? [systemic('adjuvant', 'Nodal risk ve performansa göre adjuvan kemoterapi', ['cisplatin/5-FU veya taxane-platin yaklaşımı'], 'R1/R2, bulky nodal veya pelvik nodal hastalıkta MDT’ye göre')] : undefined,
        rationale: [
          'R0 ve sınırlı nodal hastalıkta yakın sürveyans; R1/R2, ekstranodal uzanım, çoklu/bulky nod veya pelvik nodal hastalıkta adjuvan RT düşünülür.',
          'PLATINUM çalışması yüksek riskli penis kanserinde adjuvan RT stratejilerinin klinik değerlendirmesini temsil eder; kanıt sınırlı olduğundan hasta seçimi kritiktir.',
        ],
        guidelineReferences: references(TRIALS[2]),
      });
      rtIndication = highRisk ? 'consider' : 'not-indicated';
      intent = 'adjuvant';
    } else if (input.setting === 'recurrent') {
      const salvageDose = fraction(60, 30, 'Salvage primer/inguinal RT 60 Gy / 30 fx; önceki RT’ye göre');
      recommendations.push({
        id: 'recurrent-penile-salvage',
        label: 'Lokal nükste salvage cerrahi ± yeniden RT',
        indication: 'conditional',
        intent: 'salvage',
        fractionation: salvageDose,
        targetVolumes: penileTargets(salvageDose, true),
        oarConstraints: penileOars,
        rationale: [
          'Lokal nükste R0 salvage cerrahi önceliklidir; organ koruma mümkün değilse parsiyel/total penektomi değerlendirilir.',
          'Önceki RT sonrası yeniden ışınlama yalnızca kümülatif doz, interval, hedef ve genital/inguinal OAR riski ile seçilmiş hastada yapılır.',
        ],
        guidelineReferences: references(),
      });
      rtIndication = 'conditional';
      intent = 'salvage';
    } else {
      intent = 'palliative';
      const systemicTherapy = [
        systemic('palliative', 'İleri penis skuamöz kanserinde sistemik tedavi', ['cisplatin + 5-FU veya carboplatin + paclitaxel'], 'Performans durumu, önceki tedavi ve renal fonksiyona göre'),
      ];
      if (input.molecularFinding === 'PD-L1-positive' || input.molecularFinding === 'MSI-H' || input.molecularFinding === 'dMMR') {
        systemicTherapy.push(systemic('palliative', 'İmmünoterapi/klinik çalışma değerlendirmesi', ['pembrolizumab veya nivolumab'], 'Biyobelirteç, ruhsat ve güncel kılavuz kriterlerine göre'));
      }
      recommendations.push({
        id: 'metastatic-penile-systemic',
        label: 'Metastatik penis kanserinde sistemik tedavi ve semptom odaklı RT',
        indication: 'indicated',
        intent,
        systemicTherapy,
        rationale: [
          'Metastatik penis skuamöz kanserinde platin/fluoropirimidin veya taxane-platin tabanlı tedavi kullanılır; TIP çalışması ileri nodal hastalıkta neoadjuvan/salvage seçeneği destekler.',
          'RT; kanama, ağrı, ülserasyon, lokal obstrüksiyon veya semptomatik metastazlarda palyatif amaçla uygulanır.',
          'EGFR/ALK gibi akciğer sürücüleri penis kanserinde rutin karar düğümleri değildir; HPV/p16, PD-L1, MSI/MMR ve klinik çalışma uygunluğu daha anlamlıdır.',
        ],
        guidelineReferences: references(TRIALS[1]),
      });
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
      summary: this.summary(input),
      recommendations,
      rationale,
      warnings: warnings.length ? warnings : undefined,
      uncertainties: !input.stage || input.histology === 'unknown' ? ['TNM evresi veya histoloji tamamlanmamış.'] : undefined,
      confidence: !input.stage || input.histology === 'unknown' ? 0.72 : 0.85,
      generatedAt: new Date().toISOString(),
      guidelineReferences: recommendations.flatMap((recommendation) => recommendation.guidelineReferences ?? []),
    };
  }

  private summary(input: PenileInput): string {
    if (input.setting === 'newly-diagnosed') return 'Yeni tanı penis kanseri: organ koruyucu lokal tedavi, R0 cerrahi ve risk-adapte inguinal/pelvik nod yönetimi.';
    if (input.setting === 'postoperative') return 'Postoperatif penis kanseri: marjin, nodal yük ve ekstranodal hastalığa göre adjuvan RT/sistemik tedavi.';
    if (input.setting === 'recurrent') return 'Lokal nüks penis kanseri: R0 salvage cerrahi ve seçilmiş yeniden ışınlama.';
    return 'Metastatik penis kanseri: platin/taxane tabanlı sistemik tedavi ve semptom odaklı RT.';
  }
}

export const penileEngine = new PenileDecisionEngine();

export default penileEngine;
