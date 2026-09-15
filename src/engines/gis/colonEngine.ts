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

export type ColonSetting = 'newly-diagnosed' | 'postoperative' | 'locally-advanced' | 'recurrent' | 'metastatic';
export type ColonMolecularFinding = 'MSI-H' | 'dMMR' | 'MSS' | 'RAS-mutated' | 'RAS-wild-type' | 'BRAF-V600E' | 'HER2-amplified' | 'unknown';
export type ColonRisk = 'stage-I' | 'stage-II-low-risk' | 'stage-II-high-risk' | 'stage-III' | 'stage-IV' | 'unknown';

export interface ColonInput extends ClinicalCaseInput {
  organSystem: 'gis';
  disease: 'colon-cancer';
  setting: ColonSetting;
  stage?: TNMStage;
  colonRisk?: ColonRisk;
  clinicalT?: string;
  nodalStatus?: 'N0' | 'N1' | 'N2' | 'unknown';
  metastaticSites?: string[];
  molecularFinding?: ColonMolecularFinding;
  primaryTumorSite?: 'right' | 'transverse' | 'left' | 'sigmoid' | 'unknown';
  obstruction?: boolean;
  perforation?: boolean;
  T4bAdjacentOrganInvasion?: boolean;
  lymphovascularInvasion?: boolean;
  perineuralInvasion?: boolean;
  inadequateNodesExamined?: boolean;
  surgicalMargin?: 'R0' | 'R1' | 'R2' | 'RX' | 'not-applicable';
  surgeryType?: 'segmental-colectomy' | 'subtotal-colectomy' | 'none' | 'unknown';
  oligometastaticControlled?: boolean;
  priorAbdominalRT?: boolean;
  performanceStatusECOG?: number;
}

const NCCN: GuidelineReference = {
  organization: 'NCCN',
  title: 'NCCN Clinical Practice Guidelines in Oncology: Colon Cancer',
  version: 'Current version; verify institutional subscription before use',
  url: 'https://www.nccn.org/guidelines/guidelines-detail?category=1&id=1420',
  evidenceLevel: '2A',
};

const ASTRO: GuidelineReference = {
  organization: 'ASTRO',
  title: 'ASTRO clinical practice resources for gastrointestinal and oligometastatic radiotherapy',
  url: 'https://www.astro.org/Patient-Care-and-Research/Clinical-Practice-Statements',
  evidenceLevel: 'B',
};

const ESTRO: GuidelineReference = {
  organization: 'ESTRO',
  title: 'ESTRO-ACROP guidance for gastrointestinal and stereotactic radiotherapy',
  url: 'https://www.estro.org/Science/Guidelines',
  evidenceLevel: 'B',
};

const TRIALS: GuidelineReference[] = [
  {
    organization: 'other',
    title: 'IDEA collaboration: duration of adjuvant chemotherapy in stage III colon cancer',
    url: 'https://doi.org/10.1056/NEJMoa1713709',
    evidenceLevel: '1',
  },
  {
    organization: 'other',
    title: 'FOxTROT: neoadjuvant chemotherapy in locally advanced colon cancer',
    url: 'https://doi.org/10.1016/S0140-6736(23)01748-4',
    evidenceLevel: '1',
  },
  {
    organization: 'other',
    title: 'NICHE-2: neoadjuvant immunotherapy in dMMR colon cancer',
    url: 'https://doi.org/10.1056/NEJMoa2309942',
    evidenceLevel: '2A',
  },
  {
    organization: 'other',
    title: 'EORTC 40004: local therapy for colorectal liver metastases',
    url: 'https://doi.org/10.1016/S1470-2045(12)70217-3',
    evidenceLevel: '2A',
  },
];

export const COLON_INPUT_JSON_SCHEMA: JsonSchema = {
  $schema: 'http://json-schema.org/draft-07/schema#',
  $id: 'https://radonco.local/schema/colon-input.json',
  title: 'Colon cancer clinical case input',
  type: 'object',
  required: ['organSystem', 'disease', 'setting'],
  properties: {
    organSystem: { type: 'string', enum: ['gis'] },
    disease: { type: 'string', enum: ['colon-cancer'] },
    setting: { type: 'string', enum: ['newly-diagnosed', 'postoperative', 'locally-advanced', 'recurrent', 'metastatic'] },
    stage: { type: 'object', additionalProperties: true },
    colonRisk: { type: 'string', enum: ['stage-I', 'stage-II-low-risk', 'stage-II-high-risk', 'stage-III', 'stage-IV', 'unknown'] },
    clinicalT: { type: 'string' },
    nodalStatus: { type: 'string', enum: ['N0', 'N1', 'N2', 'unknown'] },
    metastaticSites: { type: 'array', items: { type: 'string' } },
    molecularFinding: { type: 'string' },
    primaryTumorSite: { type: 'string', enum: ['right', 'transverse', 'left', 'sigmoid', 'unknown'] },
    obstruction: { type: 'boolean' },
    perforation: { type: 'boolean' },
    T4bAdjacentOrganInvasion: { type: 'boolean' },
    lymphovascularInvasion: { type: 'boolean' },
    perineuralInvasion: { type: 'boolean' },
    inadequateNodesExamined: { type: 'boolean' },
    surgicalMargin: { type: 'string', enum: ['R0', 'R1', 'R2', 'RX', 'not-applicable'] },
    surgeryType: { type: 'string', enum: ['segmental-colectomy', 'subtotal-colectomy', 'none', 'unknown'] },
    oligometastaticControlled: { type: 'boolean' },
    priorAbdominalRT: { type: 'boolean' },
    performanceStatusECOG: { type: 'number' },
  },
  additionalProperties: true,
};

export const COLON_OUTPUT_JSON_SCHEMA: JsonSchema = {
  $schema: 'http://json-schema.org/draft-07/schema#',
  $id: 'https://radonco.local/schema/colon-result.json',
  title: 'Colon cancer CDSS result',
  type: 'object',
  required: ['schemaVersion', 'engineId', 'engineVersion', 'organSystem', 'rtIndication', 'intent', 'summary', 'recommendations'],
  properties: {
    schemaVersion: { type: 'string', enum: ['1.0'] },
    engineId: { type: 'string', enum: ['gis.colon'] },
    engineVersion: { type: 'string' },
    organSystem: { type: 'string', enum: ['gis'] },
    rtIndication: { type: 'string' },
    intent: { type: 'string' },
    summary: { type: 'string' },
    recommendations: { type: 'array', items: { type: 'object', additionalProperties: true } },
    warnings: { type: 'array', items: { type: 'string' } },
    guidelineReferences: { type: 'array', items: { type: 'object', additionalProperties: true } },
  },
  additionalProperties: true,
};

const fraction = (totalDoseGy: number, fractions: number, fractionationClass: Fractionation['class'], schedule: string): Fractionation => ({
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

const colonTargets = (radiationDose: Fractionation, metastatic = false): TargetVolume[] => [
  {
    name: 'GTV',
    description: metastatic ? 'Görüntülenebilir oligometastatik veya lokal nüks odağı.' : 'Primer kolon tümörü veya lokal rezidü/nüks.',
    dose: radiationDose,
    margin: 'Görüntülenebilir hedef',
  },
  {
    name: 'CTV',
    description: 'Kolon kanserinde rutin elektif nodal RT standart değildir; hedef, lokal ileri komşu organ invazyonu veya nüks alanına göre seçilir.',
    dose: radiationDose,
    margin: 'Anatomik bariyerler, cerrahi klipler ve görüntüleme dikkate alınır',
  },
  {
    name: 'PTV',
    description: 'Solunum hareketi ve barsak doluluğu için günlük IGRT marjı.',
    dose: radiationDose,
    margin: '4D-CT/CBCT ile yaklaşık 5-10 mm; abdominal hareket ve OAR yakınlığına göre',
  },
];

const colonOars: OARConstraint[] = [
  { organ: 'Small bowel', metric: 'Dmax', limit: 35, unit: 'Gy', priority: 'mandatory', source: 'HyTEC', sourceReference: 'Abdominal SBRT luminal bowel objective' },
  { organ: 'Small bowel', metric: 'D1cc', limit: 30, unit: 'Gy', priority: 'mandatory', source: 'HyTEC', sourceReference: 'Abdominal SBRT luminal bowel objective' },
  { organ: 'Stomach', metric: 'Dmax', limit: 32, unit: 'Gy', priority: 'mandatory', source: 'HyTEC', sourceReference: 'Upper abdominal SBRT objective' },
  { organ: 'Duodenum', metric: 'Dmax', limit: 32, unit: 'Gy', priority: 'mandatory', source: 'HyTEC', sourceReference: 'Upper abdominal SBRT objective' },
  { organ: 'Kidneys', metric: 'Dmean', limit: 15, unit: 'Gy', priority: 'optimal', source: 'HyTEC', sourceReference: 'Abdominal SBRT kidney objective' },
  { organ: 'Liver', metric: 'Dmean', limit: 15, unit: 'Gy', priority: 'optimal', source: 'HyTEC', sourceReference: 'Abdominal SBRT liver objective' },
  { organ: 'Spinal cord', metric: 'Dmax', limit: 25, unit: 'Gy', priority: 'mandatory', source: 'HyTEC', sourceReference: 'SBRT spinal cord tolerance; fractionation dependent' },
];

const systemic = (
  setting: SystemicTherapyRecommendation['setting'],
  regimen: string,
  agents: string[],
  timing: string,
  evidenceLevel: SystemicTherapyRecommendation['evidenceLevel'] = '1',
): SystemicTherapyRecommendation => ({ setting, regimen, agents, timing, evidenceLevel });

const references = (...extra: GuidelineReference[]): GuidelineReference[] => [NCCN, ASTRO, ESTRO, ...extra];

export class ColonDecisionEngine extends BaseDecisionEngine<ColonInput> {
  public readonly id = 'gis.colon';
  public readonly version = '1.0.0';
  public readonly inputSchema = COLON_INPUT_JSON_SCHEMA;
  public readonly outputSchema = COLON_OUTPUT_JSON_SCHEMA;

  public constructor() {
    super('1.0.0');
  }

  protected evaluateCase(input: ColonInput): CDSSResult {
    const recommendations: ClinicalRecommendation[] = [];
    const rationale: string[] = [];
    const warnings: string[] = [];
    let rtIndication: CDSSResult['rtIndication'] = 'not-indicated';
    let intent: CDSSResult['intent'] = 'curative';

    if (input.priorAbdominalRT) warnings.push('Önceki abdominal RT mevcut; ince barsak, mide, böbrek, karaciğer ve spinal kord kümülatif dozları hesaplanmalıdır.');
    if (input.perforation || input.obstruction) warnings.push('Obstrüksiyon/perforasyon acil cerrahi, stent/diversiyon ve sepsis kontrolü gerektirebilir; onkolojik tedavi sıralaması stabilizasyondan sonra belirlenmelidir.');

    if (input.setting === 'newly-diagnosed' || input.setting === 'locally-advanced') {
      const highRisk = input.T4bAdjacentOrganInvasion || input.obstruction || input.perforation || input.colonRisk === 'stage-II-high-risk';
      recommendations.push({
        id: 'colon-surgical-resection',
        label: 'Onkolojik segmental kolektomi ve R0 rezeksiyon değerlendirmesi',
        indication: 'indicated',
        intent: 'curative',
        systemicTherapy: [
          systemic('adjuvant', 'Patolojik evreye göre fluoropirimidin/oksaliplatin', ['FOLFOX veya CAPOX'], 'R0/R1/R2, nodal durum ve risk faktörlerine göre; genellikle cerrahi sonrası'),
        ],
        rationale: [
          'Kolon kanserinde küratif temel tedavi yeterli lenfadenektomi ile anatomik rezeksiyondur; R0 hedeflenir.',
          'R1/R2 marjin, T4b komşu organ invazyonu, perforasyon, obstrüksiyon, lenfovasküler/perinöral invazyon ve yetersiz nod sayısı adjuvan tedavi kararını etkiler.',
          highRisk ? 'T4b veya obstrüksiyon/perforasyonda multivisceral en-bloc rezeksiyon ve seçilmiş neoadjuvan kemoterapi/immünoterapi yaklaşımı MDT’de tartışılabilir.' : 'Erken evre hastalıkta rutin neoadjuvan RT veya elektif nodal RT önerilmez.',
        ],
        guidelineReferences: references(),
      });
      if (highRisk || input.setting === 'locally-advanced') {
        recommendations.push({
          id: 'locally-advanced-colon-neoadjuvant',
          label: input.molecularFinding === 'MSI-H' || input.molecularFinding === 'dMMR' ? 'dMMR/MSI-H için neoadjuvan immünoterapi değerlendirmesi' : 'Seçilmiş lokal ileri kolon kanserinde neoadjuvan sistemik tedavi',
          indication: 'consider',
          intent: 'neoadjuvant',
          systemicTherapy: input.molecularFinding === 'MSI-H' || input.molecularFinding === 'dMMR'
            ? [systemic('neoadjuvant', 'PD-1 blokajı', ['dostarlimab veya pembrolizumab'], 'Moleküler doğrulama ve MDT/klinik çalışma protokolüne göre', '2A')]
            : [systemic('neoadjuvant', 'Neoadjuvan FOLFOX/CAPOX', ['FOLFOX veya CAPOX'], 'Cerrahi öncesi seçilmiş T4b/bulky nodal hastalıkta')],
          rationale: [
            'FOxTROT, seçilmiş lokal ileri kolon kanserinde neoadjuvan kemoterapi ile tümör gerilemesi ve patolojik yanıt potansiyelini destekler.',
            'NICHE-2, dMMR kolon kanserinde neoadjuvan immünoterapi ile yüksek yanıt oranlarını destekler; standart dışı uygulamalar moleküler kurul ve güncel kılavuzla sınırlandırılmalıdır.',
          ],
          guidelineReferences: references(TRIALS[1], TRIALS[2]),
        });
      }
      rtIndication = 'not-indicated';
      rationale.push('Kolon primerinde elektif pelvik/abdominal nodal RT rutin değildir; RT lokal nüks, unresectable komşu organ invazyonu veya seçilmiş oligometastatik odaklara saklanır.');
    } else if (input.setting === 'postoperative') {
      const highRisk = input.surgicalMargin === 'R1' || input.surgicalMargin === 'R2' || input.T4bAdjacentOrganInvasion || input.obstruction || input.perforation || input.inadequateNodesExamined;
      const stageIII = input.colonRisk === 'stage-III' || input.nodalStatus === 'N1' || input.nodalStatus === 'N2';
      recommendations.push({
        id: 'postoperative-colon-adjuvant',
        label: stageIII || highRisk ? 'Adjuvan FOLFOX/CAPOX ve risk-adapte takip' : 'Patolojik evreye göre izlem veya adjuvan tedavi',
        indication: stageIII || highRisk ? 'indicated' : 'conditional',
        intent: 'adjuvant',
        systemicTherapy: stageIII || highRisk
          ? [systemic('adjuvant', 'Adjuvan oksaliplatin bazlı kemoterapi', ['FOLFOX veya CAPOX'], 'Risk, nöropati, yaş ve önceki tedaviye göre 3-6 ay; IDEA prensipleriyle bireyselleştirilir')]
          : undefined,
        rationale: [
          'Evre III hastalıkta adjuvan fluoropirimidin/oksaliplatin standarttır; IDEA ile süre ve toksisite risk-adapte ele alınır.',
          'Evre II’de MSI/MMR, T4, perforasyon, obstrüksiyon, LVI/PNI, kötü diferansiyasyon ve yetersiz nod sayısı adjuvan kemoterapi kararını etkiler.',
          'R1/R2 marjin veya makroskopik rezidüde yeniden rezeksiyon öncelikle değerlendirilir; RT yalnızca seçilmiş lokal kontrol sorunlarında MDT ile planlanır.',
        ],
        guidelineReferences: references(TRIALS[0]),
      });
      rtIndication = highRisk ? 'consider' : 'not-indicated';
      intent = 'adjuvant';
    } else if (input.setting === 'recurrent') {
      const salvageDose = fraction(50, 25, 'conventional', '50 Gy / 25 fx; lokal nüks/salvage planına göre boost');
      recommendations.push({
        id: 'recurrent-colon-salvage',
        label: 'Lokal nükste salvage cerrahi ± seçilmiş RT',
        indication: 'conditional',
        intent: 'salvage',
        fractionation: salvageDose,
        targetVolumes: colonTargets(salvageDose),
        oarConstraints: colonOars,
        rationale: [
          'Lokal nükste R0 rezeksiyon olasılığı, komşu organ invazyonu ve sistemik metastaz durumu MDT ile değerlendirilir.',
          'Kolon kanserinde RT rutin değildir; unresectable/close-margin lokal nüks veya semptomatik lokal hastalıkta seçilmiş kemoradyoterapi düşünülebilir.',
        ],
        guidelineReferences: references(),
      });
      rtIndication = 'conditional';
      intent = 'salvage';
    } else {
      intent = 'palliative';
      const systemicTherapy: SystemicTherapyRecommendation[] = [
        systemic('palliative', 'Moleküler profile göre sistemik tedavi', ['FOLFOX/FOLFIRI ± bevacizumab; RAS-wild-type sol kolon için anti-EGFR'], 'RAS/BRAF, MSI/MMR, primer tarafı ve önceki tedaviye göre'),
      ];
      if (input.molecularFinding === 'MSI-H' || input.molecularFinding === 'dMMR') {
        systemicTherapy.push(systemic('palliative', 'MSI-H/dMMR immünoterapisi', ['pembrolizumab veya nivolumab/ipilimumab'], 'Moleküler sonuç ve güncel kılavuz kriterlerine göre'));
      }
      if (input.molecularFinding === 'BRAF-V600E') {
        systemicTherapy.push(systemic('palliative', 'BRAF V600E hedefli kombinasyon', ['encorafenib + cetuximab'], 'Önceki tedavi ve güncel kılavuz dizilimine göre'));
      }
      recommendations.push({
        id: 'metastatic-colon-systemic',
        label: 'Metastatik kolon kanserinde sistemik tedavi ve seçilmiş lokal ablasyon',
        indication: 'indicated',
        intent,
        systemicTherapy,
        rationale: [
          'Metastatik kolon kanserinde RAS/BRAF, MSI/MMR ve primer tümör tarafı tedavi seçimini belirler.',
          'Karaciğer/akciğer sınırlı metastazlarda rezeksiyon, ablasyon veya SBRT seçilmiş hastalarda uzun süreli kontrol amacıyla değerlendirilebilir.',
        ],
        guidelineReferences: references(TRIALS[3]),
      });
      if (input.oligometastaticControlled || input.metastaticSites?.length) {
        const metastasisDose = fraction(50, 5, 'SBRT', 'Metastaza göre 3-5 fx SBRT');
        recommendations.push({
          id: 'metastatic-colon-sbrt',
          label: 'Seçilmiş oligometastatik odaklara SBRT',
          indication: 'consider',
          intent: 'palliative',
          fractionation: metastasisDose,
          targetVolumes: colonTargets(metastasisDose, true),
          oarConstraints: colonOars,
          rationale: ['SBRT; metastaz sayısı, bölgesi, hareketi, barsak yakınlığı ve sistemik yanıtla seçilir.'],
          guidelineReferences: references(TRIALS[3]),
        });
      }
      rtIndication = input.metastaticSites?.length ? 'conditional' : 'consider';
    }

    return {
      schemaVersion: '1.0',
      engineId: this.id,
      engineVersion: this.version,
      caseId: input.caseId,
      organSystem: 'gis',
      rtIndication,
      intent,
      summary: this.summary(input),
      recommendations,
      rationale,
      warnings: warnings.length ? warnings : undefined,
      uncertainties: !input.stage || !input.molecularFinding ? ['TNM veya moleküler profil tamamlanmamış.'] : undefined,
      confidence: !input.stage || !input.molecularFinding ? 0.72 : 0.86,
      generatedAt: new Date().toISOString(),
      guidelineReferences: recommendations.flatMap((recommendation) => recommendation.guidelineReferences ?? []),
    };
  }

  private summary(input: ColonInput): string {
    if (input.setting === 'newly-diagnosed' || input.setting === 'locally-advanced') return 'Yeni tanı/lokal ileri kolon kanseri: R0 cerrahi, patolojik risk ve MSI/RAS/BRAF profiline göre perioperatif tedavi.';
    if (input.setting === 'postoperative') return 'Postoperatif kolon kanseri: evre, marjin, nodal durum ve yüksek risk özelliklerine göre adjuvan tedavi.';
    if (input.setting === 'recurrent') return 'Lokal nüks kolon kanseri: salvage cerrahi ve seçilmiş lokal RT.';
    return 'Metastatik kolon kanseri: RAS/BRAF/MSI/MMR profile göre sistemik tedavi ve seçilmiş metastaz-yönelimli RT.';
  }
}

export const colonEngine = new ColonDecisionEngine();

export default colonEngine;
