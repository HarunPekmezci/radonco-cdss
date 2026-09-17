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

export type LiverDisease = 'HCC' | 'intrahepatic-cholangiocarcinoma' | 'liver-metastasis';
export type LiverSetting = 'localized' | 'locally-advanced' | 'postoperative' | 'oligometastatic' | 'metastatic';
export type ChildPugh = 'A' | 'B7' | 'B8-9' | 'C' | 'unknown';
export type LiverMolecularFinding = 'FGFR2-fusion' | 'IDH1' | 'BRAF-V600E' | 'MSI-H' | 'dMMR' | 'HER2' | 'none' | 'unknown';

export interface LiverInput extends ClinicalCaseInput {
  organSystem: 'gis';
  disease: 'liver-cancer';
  setting: LiverSetting;
  liverDisease: LiverDisease;
  stage?: TNMStage;
  childPugh?: ChildPugh;
  meldScore?: number;
  tumorSizeCm?: number;
  tumorCount?: number;
  portalVeinTumorThrombus?: boolean;
  extrahepaticDisease?: boolean;
  metastaticSites?: string[];
  transplantCandidate?: boolean;
  resectable?: boolean;
  surgeryType?: 'resection' | 'transplant' | 'ablation' | 'none' | 'unknown';
  surgicalMargin?: 'R0' | 'R1' | 'R2' | 'RX' | 'not-applicable';
  priorTACE?: boolean;
  priorTARE?: boolean;
  priorAbdominalRT?: boolean;
  molecularFinding?: LiverMolecularFinding;
  oligometastaticControlled?: boolean;
  symptoms?: string[];
}

const NCCN_HCC: GuidelineReference = {
  organization: 'NCCN',
  title: 'NCCN Clinical Practice Guidelines in Oncology: Hepatocellular Carcinoma',
  version: 'Current version; verify institutional subscription before use',
  url: 'https://www.nccn.org/guidelines/guidelines-detail?category=1&id=1514',
  evidenceLevel: '2A',
};

const NCCN_BILIARY: GuidelineReference = {
  organization: 'NCCN',
  title: 'NCCN Clinical Practice Guidelines in Oncology: Biliary Tract Cancers',
  version: 'Current version; verify institutional subscription before use',
  url: 'https://www.nccn.org/guidelines/guidelines-detail?category=1&id=1426',
  evidenceLevel: '2A',
};

const ASTRO: GuidelineReference = {
  organization: 'ASTRO',
  title: 'ASTRO clinical practice resources for liver cancer and liver SBRT',
  url: 'https://www.astro.org/Patient-Care-and-Research/Clinical-Practice-Statements',
  evidenceLevel: 'B',
};

const ESTRO: GuidelineReference = {
  organization: 'ESTRO',
  title: 'ESTRO-ACROP recommendations for liver stereotactic radiotherapy',
  url: 'https://www.estro.org/Science/Guidelines',
  evidenceLevel: 'B',
};

const TRIALS: GuidelineReference[] = [
  { organization: 'other', title: 'IMbrave150: atezolizumab plus bevacizumab in unresectable HCC', url: 'https://doi.org/10.1056/NEJMoa1915745', evidenceLevel: '1' },
  { organization: 'other', title: 'HIMALAYA: tremelimumab plus durvalumab in unresectable HCC', url: 'https://doi.org/10.1056/NEJMoa2203919', evidenceLevel: '1' },
  { organization: 'other', title: 'TOPAZ-1: durvalumab plus gemcitabine/cisplatin in advanced biliary tract cancer', url: 'https://doi.org/10.1016/S0140-6736(22)00847-5', evidenceLevel: '1' },
  { organization: 'other', title: 'RTOG 1112: sorafenib with or without SBRT in advanced HCC', url: 'https://clinicaltrials.gov/study/NCT01730937', evidenceLevel: '2A' },
];

export const LIVER_INPUT_JSON_SCHEMA: JsonSchema = {
  $schema: 'http://json-schema.org/draft-07/schema#',
  $id: 'https://radonco.local/schema/liver-input.json',
  title: 'Primary liver cancer clinical case input',
  type: 'object',
  required: ['organSystem', 'disease', 'setting', 'liverDisease'],
  properties: {
    organSystem: { type: 'string', enum: ['gis'] },
    disease: { type: 'string', enum: ['liver-cancer'] },
    setting: { type: 'string', enum: ['localized', 'locally-advanced', 'postoperative', 'oligometastatic', 'metastatic'] },
    liverDisease: { type: 'string', enum: ['HCC', 'intrahepatic-cholangiocarcinoma', 'liver-metastasis'] },
    stage: { type: 'object', additionalProperties: true },
    childPugh: { type: 'string', enum: ['A', 'B7', 'B8-9', 'C', 'unknown'] },
    meldScore: { type: 'number' },
    tumorSizeCm: { type: 'number' },
    tumorCount: { type: 'number' },
    portalVeinTumorThrombus: { type: 'boolean' },
    extrahepaticDisease: { type: 'boolean' },
    transplantCandidate: { type: 'boolean' },
    resectable: { type: 'boolean' },
    surgeryType: { type: 'string', enum: ['resection', 'transplant', 'ablation', 'none', 'unknown'] },
    surgicalMargin: { type: 'string', enum: ['R0', 'R1', 'R2', 'RX', 'not-applicable'] },
    priorTACE: { type: 'boolean' },
    priorTARE: { type: 'boolean' },
    priorAbdominalRT: { type: 'boolean' },
    molecularFinding: { type: 'string' },
    oligometastaticControlled: { type: 'boolean' },
    symptoms: { type: 'array', items: { type: 'string' } },
  },
  additionalProperties: true,
};

export const LIVER_OUTPUT_JSON_SCHEMA: JsonSchema = {
  $schema: 'http://json-schema.org/draft-07/schema#',
  $id: 'https://radonco.local/schema/liver-result.json',
  title: 'Primary liver cancer CDSS result',
  type: 'object',
  required: ['schemaVersion', 'engineId', 'engineVersion', 'organSystem', 'rtIndication', 'intent', 'summary', 'recommendations'],
  properties: {
    schemaVersion: { type: 'string', enum: ['1.0'] },
    engineId: { type: 'string', enum: ['gis.liver'] },
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

const liverTargets = (radiationDose: Fractionation, metastasis = false): TargetVolume[] => [
  { name: 'GTV', description: metastasis ? 'Görüntülenebilir karaciğer metastazı.' : 'Kontrastlı multiphasic BT/MR ile arteriyel/portal fazda tanımlanan karaciğer lezyonu.', dose: radiationDose, margin: 'Görüntülenebilir tümör' },
  { name: 'ITV', description: 'Solunum hareketi için 4D-CT veya breath-hold hareket zarfı.', dose: radiationDose, margin: 'Solunum hareketi' },
  { name: 'CTV', description: 'HCC/ICC’de rutin geniş mikroskopik CTV ve elektif nodal RT standart değildir; damar invazyonu/rezidü ve anatomik risklere göre.', dose: radiationDose, margin: 'Genellikle 0-5 mm, hastalık ve ablasyon tekniğine göre' },
  { name: 'PTV', description: 'ITV/CTV üzerine günlük IGRT ve hareket yönetimi marjı.', dose: radiationDose, margin: '3-5 mm; 4D-CT/CBCT ve fiducial/kontrast füzyonuna göre' },
];

const liverOars: OARConstraint[] = [
  { organ: 'Normal liver minus GTV', metric: 'Dmean', limit: 15, unit: 'Gy', priority: 'mandatory', source: 'HyTEC', sourceReference: 'Liver SBRT normal liver objective; Child-Pugh dependent' },
  { organ: 'Normal liver minus GTV', metric: 'Dmean', limit: 13, unit: 'Gy', priority: 'optimal', source: 'HyTEC', sourceReference: 'HCC SBRT planning objective' },
  { organ: 'Stomach', metric: 'Dmax', limit: 32, unit: 'Gy', priority: 'mandatory', source: 'HyTEC', sourceReference: 'Upper abdominal SBRT luminal organ objective' },
  { organ: 'Duodenum', metric: 'Dmax', limit: 32, unit: 'Gy', priority: 'mandatory', source: 'HyTEC', sourceReference: 'Upper abdominal SBRT luminal organ objective' },
  { organ: 'Small bowel', metric: 'Dmax', limit: 35, unit: 'Gy', priority: 'mandatory', source: 'HyTEC', sourceReference: 'Abdominal SBRT bowel objective' },
  { organ: 'Spinal cord', metric: 'Dmax', limit: 25, unit: 'Gy', priority: 'mandatory', source: 'HyTEC', sourceReference: 'SBRT spinal cord tolerance; fractionation dependent' },
  { organ: 'Kidneys', metric: 'Dmean', limit: 15, unit: 'Gy', priority: 'optimal', source: 'HyTEC', sourceReference: 'Abdominal SBRT kidney objective' },
];

const systemic = (setting: SystemicTherapyRecommendation['setting'], regimen: string, agents: string[], timing: string, evidenceLevel: SystemicTherapyRecommendation['evidenceLevel'] = '1'): SystemicTherapyRecommendation => ({ setting, regimen, agents, timing, evidenceLevel });
const references = (...extra: GuidelineReference[]): GuidelineReference[] => [NCCN_HCC, NCCN_BILIARY, ASTRO, ESTRO, ...extra];

export class LiverDecisionEngine extends BaseDecisionEngine<LiverInput> {
  public readonly id = 'gis.liver';
  public readonly version = '1.0.0';
  public readonly inputSchema = LIVER_INPUT_JSON_SCHEMA;
  public readonly outputSchema = LIVER_OUTPUT_JSON_SCHEMA;

  public constructor() {
    super('1.0.0');
  }

  protected evaluateCase(input: LiverInput): CDSSResult {
    const recommendations: ClinicalRecommendation[] = [];
    const rationale: string[] = [];
    const warnings: string[] = [];
    let rtIndication: CDSSResult['rtIndication'] = 'conditional';
    let intent: CDSSResult['intent'] = 'curative';

    if (input.priorAbdominalRT) warnings.push('Önceki abdominal RT mevcut; normal karaciğer, mide, duodenum, barsak, böbrek ve spinal kord kümülatif dozları hesaplanmalıdır.');
    if (input.childPugh === 'B8-9' || input.childPugh === 'C') warnings.push('Child-Pugh B8-9/C karaciğer rezervinde RT/SBRT ciddi hepatik dekompansasyon riski taşır; yalnızca seçilmiş olguda hepatoloji ve MDT ile.');

    if (input.liverDisease === 'HCC' && (input.setting === 'localized' || input.setting === 'locally-advanced')) {
      const sbrtDose = fraction(50, 5, 'SBRT', '50 Gy / 5 fx; tümör/OAR ve Child-Pugh’a göre');
      recommendations.push({
        id: 'hcc-local-therapy',
        label: input.resectable ? 'Rezeksiyon/transplant/ablasyon öncelikli HCC tedavisi' : 'Seçilmiş HCC’de SBRT veya intraarteriyel lokal tedavi',
        indication: 'indicated',
        intent: 'curative',
        fractionation: input.resectable ? undefined : sbrtDose,
        targetVolumes: input.resectable ? undefined : liverTargets(sbrtDose),
        oarConstraints: input.resectable ? undefined : liverOars,
        systemicTherapy: input.extrahepaticDisease ? [systemic('palliative', 'İleri HCC sistemik tedavisi', ['atezolizumab + bevacizumab veya tremelimumab + durvalumab'], 'Karaciğer fonksiyonu, kanama riski ve Child-Pugh’a göre')] : undefined,
        rationale: [
          'HCC’de rezeksiyon, transplantasyon veya ablasyon; tümör sayısı/boyutu, portal hipertansiyon, karaciğer rezervi ve damar invazyonuna göre ilk lokal seçeneklerdir.',
          'Medikal inoperabl, transplant/rezeksiyona uygun olmayan veya TACE/TARE sonrası lokal kontrol gerektiren seçilmiş hastada SBRT değerlendirilebilir.',
          'Portal ven tümör trombüsü ve ekstrahepatik hastalık lokal RT hedefini ve sistemik tedavi gereksinimini değiştirir; elektif nodal RT rutin değildir.',
        ],
        guidelineReferences: references(TRIALS[0], TRIALS[1], TRIALS[3]),
      });
      rtIndication = input.resectable ? 'conditional' : 'consider';
    } else if (input.liverDisease === 'intrahepatic-cholangiocarcinoma' && (input.setting === 'localized' || input.setting === 'locally-advanced')) {
      const chemoradiationDose = fraction(60, 30, 'conventional', '50.4-60 Gy / 25-30 fx; seçilmiş lokal ileri ICC');
      recommendations.push({
        id: 'icc-local-therapy',
        label: 'ICC’de R0 rezeksiyon/ablasyon ± seçilmiş kemoradyoterapi',
        indication: input.resectable ? 'indicated' : 'consider',
        intent: 'curative',
        fractionation: input.resectable ? undefined : chemoradiationDose,
        targetVolumes: input.resectable ? undefined : liverTargets(chemoradiationDose),
        oarConstraints: input.resectable ? undefined : liverOars,
        systemicTherapy: [systemic('neoadjuvant', 'Gemcitabine/cisplatin ± durvalumab', ['gemcitabine + cisplatin ± durvalumab'], 'Rezektabilite, klinik çalışma ve güncel biliyer kılavuza göre')],
        rationale: [
          'İntrahepatik kolanjiyokarsinomda R0 rezeksiyon temel küratif hedeftir; damar/komşu organ ilişkisi ve karaciğer rezervi rezektabiliteyi belirler.',
          'Unresectable lokal hastalıkta gemcitabine/cisplatin tabanlı tedavi sonrası seçilmiş yüksek doz RT/SBRT veya intraarteriyel yaklaşım düşünülebilir.',
          'TOPAZ-1 ileri biliyer kanserde durvalumab + gemcitabine/cisplatin seçeneğini destekler.',
        ],
        guidelineReferences: references(TRIALS[2]),
      });
      rtIndication = input.resectable ? 'conditional' : 'consider';
    } else if (input.setting === 'postoperative') {
      const postoperativeDose = fraction(50.4, 28, 'conventional', '45 Gy / 25 fx + 5.4 Gy / 3 fx boost; seçilmiş R1/R2 veya lokal yüksek risk');
      const highRisk = input.surgicalMargin === 'R1' || input.surgicalMargin === 'R2' || input.portalVeinTumorThrombus;
      recommendations.push({
        id: 'postoperative-liver-management',
        label: highRisk ? 'Yüksek riskli postoperatif lokal/sistemik tedavi' : 'Patolojik risk-adapte takip ve adjuvan sistemik tedavi',
        indication: highRisk ? 'consider' : 'conditional',
        intent: 'adjuvant',
        fractionation: highRisk ? postoperativeDose : undefined,
        targetVolumes: highRisk ? liverTargets(postoperativeDose) : undefined,
        oarConstraints: highRisk ? liverOars : undefined,
        systemicTherapy: [systemic('adjuvant', 'Histolojiye göre adjuvan sistemik tedavi', ['HCC veya biliyer trakt kılavuzuna göre'], 'R0/R1/R2, vasküler invazyon ve nüks riskine göre')],
        rationale: [
          'R0 rezeksiyon sonrası rutin adjuvan RT standart değildir; R1/R2 marjin, vasküler invazyon veya lokal rezidüde seçilmiş RT düşünülebilir.',
          'Karaciğer rezervi ve cerrahi sonrası kalan hacim, adjuvan RT güvenliğini belirler.',
        ],
        guidelineReferences: references(),
      });
      rtIndication = highRisk ? 'consider' : 'not-indicated';
      intent = 'adjuvant';
    } else if (input.setting === 'oligometastatic') {
      const metastasisDose = fraction(50, 5, 'SBRT', '50 Gy / 5 fx; metastaz anatomisine göre 3-5 fx');
      recommendations.push({
        id: 'liver-oligometastatic-sbrt',
        label: 'Kontrollü oligometastatik karaciğer hastalığında SBRT',
        indication: 'consider',
        intent: 'curative',
        fractionation: metastasisDose,
        targetVolumes: liverTargets(metastasisDose, true),
        oarConstraints: liverOars,
        rationale: ['Seçilmiş oligometastatik karaciğer lezyonlarında rezeksiyon/ablasyon mümkün değilse, sistemik yanıt ve karaciğer rezervi uygun olduğunda SBRT lokal kontrol amacıyla düşünülebilir.'],
        guidelineReferences: references(TRIALS[3]),
      });
      rtIndication = 'consider';
    } else {
      intent = 'palliative';
      const therapy: SystemicTherapyRecommendation[] = input.liverDisease === 'HCC'
        ? [systemic('palliative', 'İleri HCC sistemik tedavisi', ['atezolizumab + bevacizumab veya tremelimumab + durvalumab'], 'Child-Pugh, varis/kanama riski ve performans durumuna göre')]
        : [systemic('palliative', 'İleri biliyer trakt sistemik tedavisi', ['gemcitabine + cisplatin + durvalumab'], 'Renal/hepatik fonksiyon ve performansa göre')];
      if (input.molecularFinding === 'FGFR2-fusion') therapy.push(systemic('palliative', 'FGFR2 hedefli tedavi', ['pemigatinib veya futibatinib'], 'Önceki tedavi ve güncel biliyer kılavuz kriterlerine göre'));
      if (input.molecularFinding === 'IDH1') therapy.push(systemic('palliative', 'IDH1 hedefli tedavi', ['ivosidenib'], 'İleri IDH1-mutant ICC’de uygun hastada'));
      if (input.molecularFinding === 'BRAF-V600E') therapy.push(systemic('palliative', 'BRAF/MEK hedefli tedavi', ['dabrafenib + trametinib'], 'BRAF V600E ve güncel kılavuz kriterlerine göre'));
      if (input.molecularFinding === 'MSI-H' || input.molecularFinding === 'dMMR') therapy.push(systemic('palliative', 'MSI-H/dMMR immünoterapisi', ['pembrolizumab'], 'Moleküler sonuç ve ruhsat kriterlerine göre'));
      recommendations.push({
        id: 'metastatic-liver-systemic',
        label: 'İleri karaciğer kanserinde sistemik tedavi ve semptom odaklı RT',
        indication: 'indicated',
        intent,
        systemicTherapy: therapy,
        rationale: [
          'HCC’de IMbrave150 ve HIMALAYA; biliyer kanserde TOPAZ-1 sistemik tedavi seçimlerini destekler.',
          'RT; ağrı, kanama, portal/vena cava basısı veya seçilmiş progresif odaklarda palyatif/ablative amaçla uygulanır.',
        ],
        guidelineReferences: references(TRIALS[0], TRIALS[1], TRIALS[2]),
      });
      rtIndication = input.symptoms?.length || input.metastaticSites?.length ? 'conditional' : 'consider';
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
      uncertainties: input.childPugh === 'unknown' || !input.stage ? ['Child-Pugh/MELD, TNM ve karaciğer fonksiyon değerlendirmesi tamamlanmamış.'] : undefined,
      confidence: input.childPugh === 'unknown' || !input.stage ? 0.7 : 0.85,
      generatedAt: new Date().toISOString(),
      guidelineReferences: recommendations.flatMap((recommendation) => recommendation.guidelineReferences ?? []),
    };
  }

  private summary(input: LiverInput): string {
    if (input.liverDisease === 'HCC') return 'HCC: karaciğer rezervi/Child-Pugh, BCLC özellikleri ve damar/ekstrahepatik hastalığa göre rezeksiyon, transplantasyon, lokal ablasyon, SBRT veya sistemik tedavi.';
    if (input.liverDisease === 'intrahepatic-cholangiocarcinoma') return 'İntrahepatik kolanjiyokarsinom: R0 cerrahi, gemcitabine/cisplatin ± durvalumab ve seçilmiş lokal RT.';
    return 'Karaciğer metastazı: sistemik tedaviye ek olarak seçilmiş rezeksiyon/ablasyon/SBRT.';
  }
}

export const liverCancerEngine = new LiverDecisionEngine();

export default liverCancerEngine;
