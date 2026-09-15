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

export type StomachSetting = 'newly-diagnosed' | 'locally-advanced' | 'postoperative' | 'recurrent' | 'metastatic';
export type StomachHistology = 'adenocarcinoma' | 'gastroesophageal-junction' | 'other' | 'unknown';
export type StomachMolecularFinding = 'HER2-positive' | 'PD-L1-positive' | 'MSI-H' | 'dMMR' | 'CLDN18.2-positive' | 'EBV-positive' | 'none' | 'unknown';

export interface StomachInput extends ClinicalCaseInput {
  organSystem: 'gis';
  disease: 'gastric-cancer';
  setting: StomachSetting;
  stage?: TNMStage;
  histology?: StomachHistology;
  clinicalT?: string;
  nodalStatus?: 'N0' | 'N1' | 'N2' | 'N3' | 'unknown';
  metastaticSites?: string[];
  resectability?: 'resectable' | 'borderline' | 'unresectable' | 'unknown';
  surgicalMargin?: 'R0' | 'R1' | 'R2' | 'RX' | 'not-applicable';
  lymphadenectomy?: 'D1' | 'D1+' | 'D2' | 'unknown';
  obstruction?: boolean;
  bleeding?: boolean;
  perforation?: boolean;
  molecularFinding?: StomachMolecularFinding;
  oligometastaticControlled?: boolean;
  priorAbdominalRT?: boolean;
  performanceStatusECOG?: number;
}

const NCCN: GuidelineReference = {
  organization: 'NCCN',
  title: 'NCCN Clinical Practice Guidelines in Oncology: Gastric and Gastroesophageal Junction Cancers',
  version: 'Current version; verify institutional subscription before use',
  url: 'https://www.nccn.org/guidelines/guidelines-detail?category=1&id=1434',
  evidenceLevel: '2A',
};

const ASTRO: GuidelineReference = {
  organization: 'ASTRO',
  title: 'ASTRO clinical practice resources for gastrointestinal radiotherapy',
  url: 'https://www.astro.org/Patient-Care-and-Research/Clinical-Practice-Statements',
  evidenceLevel: 'B',
};

const ESTRO: GuidelineReference = {
  organization: 'ESTRO',
  title: 'ESTRO-ACROP guidance for upper gastrointestinal radiotherapy',
  url: 'https://www.estro.org/Science/Guidelines',
  evidenceLevel: 'B',
};

const TRIALS: GuidelineReference[] = [
  { organization: 'other', title: 'FLOT4: perioperative FLOT versus ECF/ECX in gastric and GEJ adenocarcinoma', url: 'https://doi.org/10.1016/S0140-6736(18)32557-1', evidenceLevel: '1' },
  { organization: 'other', title: 'CRITICS: perioperative chemotherapy versus postoperative chemoradiotherapy', url: 'https://doi.org/10.1016/S0140-6736(18)31840-4', evidenceLevel: '1' },
  { organization: 'other', title: 'ARTIST: adjuvant chemotherapy with or without radiotherapy after D2 gastrectomy', url: 'https://doi.org/10.1016/S0140-6736(15)01129-9', evidenceLevel: '1' },
  { organization: 'other', title: 'CheckMate-649: nivolumab plus chemotherapy in advanced gastric/GEJ cancer', url: 'https://doi.org/10.1056/NEJMoa2016668', evidenceLevel: '1' },
  { organization: 'other', title: 'ToGA: trastuzumab plus chemotherapy in HER2-positive gastric cancer', url: 'https://doi.org/10.1016/S0140-6736(09)61136-0', evidenceLevel: '1' },
];

export const STOMACH_INPUT_JSON_SCHEMA: JsonSchema = {
  $schema: 'http://json-schema.org/draft-07/schema#',
  $id: 'https://radonco.local/schema/stomach-input.json',
  title: 'Gastric cancer clinical case input',
  type: 'object',
  required: ['organSystem', 'disease', 'setting'],
  properties: {
    organSystem: { type: 'string', enum: ['gis'] },
    disease: { type: 'string', enum: ['gastric-cancer'] },
    setting: { type: 'string', enum: ['newly-diagnosed', 'locally-advanced', 'postoperative', 'recurrent', 'metastatic'] },
    stage: { type: 'object', additionalProperties: true },
    histology: { type: 'string', enum: ['adenocarcinoma', 'gastroesophageal-junction', 'other', 'unknown'] },
    clinicalT: { type: 'string' },
    nodalStatus: { type: 'string', enum: ['N0', 'N1', 'N2', 'N3', 'unknown'] },
    metastaticSites: { type: 'array', items: { type: 'string' } },
    resectability: { type: 'string', enum: ['resectable', 'borderline', 'unresectable', 'unknown'] },
    surgicalMargin: { type: 'string', enum: ['R0', 'R1', 'R2', 'RX', 'not-applicable'] },
    lymphadenectomy: { type: 'string', enum: ['D1', 'D1+', 'D2', 'unknown'] },
    obstruction: { type: 'boolean' },
    bleeding: { type: 'boolean' },
    perforation: { type: 'boolean' },
    molecularFinding: { type: 'string' },
    oligometastaticControlled: { type: 'boolean' },
    priorAbdominalRT: { type: 'boolean' },
    performanceStatusECOG: { type: 'number' },
  },
  additionalProperties: true,
};

export const STOMACH_OUTPUT_JSON_SCHEMA: JsonSchema = {
  $schema: 'http://json-schema.org/draft-07/schema#',
  $id: 'https://radonco.local/schema/stomach-result.json',
  title: 'Gastric cancer CDSS result',
  type: 'object',
  required: ['schemaVersion', 'engineId', 'engineVersion', 'organSystem', 'rtIndication', 'intent', 'summary', 'recommendations'],
  properties: {
    schemaVersion: { type: 'string', enum: ['1.0'] },
    engineId: { type: 'string', enum: ['gis.stomach'] },
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
  technique: 'IMRT',
  alphaBetaTumor: 10,
  bedGy: totalDoseGy * (1 + totalDoseGy / fractions / 10),
  eqd2Gy: totalDoseGy * ((totalDoseGy / fractions + 10) / 12),
});

const stomachTargets = (radiationDose: Fractionation, includeNodes = true): TargetVolume[] => [
  { name: 'GTV', description: 'Endoskopi, kontrastlı BT/PET ve cerrahi kliplerle primer/rezidüel mide tümörü.', dose: radiationDose, margin: 'Görüntülenebilir hastalık' },
  { name: 'CTV', description: 'Primer tümör yatağı, mide duvarı ve riskli cerrahi yatak.', dose: radiationDose, margin: 'Anatomik bariyerler ve solunum hareketi dikkate alınır' },
  ...(includeNodes ? [{ name: 'CTV', description: 'Tümör lokalizasyonu ve D2 diseksiyon/klinik nodal riske göre perigastrik, çölyak, hepatik ve splenik nodal istasyonlar.', dose: radiationDose, margin: 'Gastrik nodal atlas; rutin para-aortik ENI yok' }] : []),
  { name: 'PTV', description: 'Solunum ve mide doluluğu için IGRT marjı.', dose: radiationDose, margin: '4D-CT/CBCT ile yaklaşık 5-10 mm; adaptif planlama tercih edilebilir' },
];

const stomachOars: OARConstraint[] = [
  { organ: 'Kidneys', metric: 'Dmean', limit: 18, unit: 'Gy', priority: 'mandatory', source: 'QUANTEC', sourceReference: 'Gastric/upper abdominal RT renal objective' },
  { organ: 'Liver', metric: 'Dmean', limit: 28, unit: 'Gy', priority: 'optimal', source: 'QUANTEC', sourceReference: 'Upper abdominal RT liver objective' },
  { organ: 'Spinal cord', metric: 'Dmax', limit: 45, unit: 'Gy', priority: 'mandatory', source: 'QUANTEC', sourceReference: 'Spinal cord tolerance' },
  { organ: 'Small bowel', metric: 'V45', limit: 195, unit: 'cc', priority: 'mandatory', source: 'protocol', sourceReference: 'Upper abdominal chemoradiotherapy bowel objective' },
  { organ: 'Duodenum', metric: 'Dmax', limit: 50, unit: 'Gy', priority: 'mandatory', source: 'protocol', sourceReference: 'Gastric RT duodenal constraint' },
  { organ: 'Heart', metric: 'Dmean', limit: 26, unit: 'Gy', priority: 'optimal', source: 'QUANTEC', sourceReference: 'Upper abdominal RT cardiac objective' },
];

const systemic = (setting: SystemicTherapyRecommendation['setting'], regimen: string, agents: string[], timing: string, evidenceLevel: SystemicTherapyRecommendation['evidenceLevel'] = '1'): SystemicTherapyRecommendation => ({ setting, regimen, agents, timing, evidenceLevel });
const references = (...extra: GuidelineReference[]): GuidelineReference[] => [NCCN, ASTRO, ESTRO, ...extra];

export class StomachDecisionEngine extends BaseDecisionEngine<StomachInput> {
  public readonly id = 'gis.stomach';
  public readonly version = '1.0.0';
  public readonly inputSchema = STOMACH_INPUT_JSON_SCHEMA;
  public readonly outputSchema = STOMACH_OUTPUT_JSON_SCHEMA;

  public constructor() {
    super('1.0.0');
  }

  protected evaluateCase(input: StomachInput): CDSSResult {
    const recommendations: ClinicalRecommendation[] = [];
    const rationale: string[] = [];
    const warnings: string[] = [];
    let rtIndication: CDSSResult['rtIndication'] = 'not-indicated';
    let intent: CDSSResult['intent'] = 'curative';

    if (input.priorAbdominalRT) warnings.push('Önceki abdominal RT mevcut; böbrek, karaciğer, duodenum, ince barsak ve kalp kümülatif dozları değerlendirilmelidir.');
    if (input.obstruction || input.bleeding || input.perforation) warnings.push('Obstrüksiyon, kanama veya perforasyon acil endoskopik/cerrahi stabilizasyon ve beslenme desteği gerektirebilir.');

    if (input.setting === 'newly-diagnosed' || input.setting === 'locally-advanced') {
      const resectable = input.resectability !== 'unresectable';
      recommendations.push({
        id: 'gastric-perioperative-management',
        label: 'Perioperatif sistemik tedavi + R0 gastrektomi',
        indication: resectable ? 'indicated' : 'conditional',
        intent: 'curative',
        systemicTherapy: [systemic('neoadjuvant', 'Perioperatif FLOT', ['5-FU/leucovorin/oxaliplatin/docetaxel'], 'Rezeksiyon öncesi ve sonrası, uygun rezeke edilebilir mide/GEJ adenokarsinomunda')],
        rationale: [
          'Lokal ileri rezeke edilebilir mide/GEJ adenokarsinomunda R0 gastrektomi ve yeterli D2 lenfadenektomi temel küratif yaklaşımdır.',
          'FLOT4, perioperatif FLOT’un eski ECF/ECX şemalarına üstünlüğünü destekler.',
          'R1/R2 marjin, yetersiz D2 diseksiyon veya rezidüel makroskopik hastalık ek lokal/sistemik tedavi ve yeniden rezeksiyon açısından MDT’de tartışılır.',
        ],
        guidelineReferences: references(TRIALS[0]),
      });
      if (!resectable || input.surgicalMargin === 'R2') {
        const definitiveDose = fraction(50.4, 28, 'conventional', '45 Gy / 25 fx + 5.4 Gy boost / 3 fx');
        recommendations.push({
          id: 'unresectable-gastric-chemoradiation',
          label: 'Seçilmiş unresectable/rezidüel lokal hastalıkta kemoradyoterapi',
          indication: 'consider',
          intent: 'definitive',
          fractionation: definitiveDose,
          targetVolumes: stomachTargets(definitiveDose, true),
          oarConstraints: stomachOars,
          systemicTherapy: [systemic('concurrent', 'Fluoropirimidin bazlı eşzamanlı kemoterapi', ['capecitabine veya 5-FU'], 'RT süresince, seçilmiş hastada')],
          rationale: ['Mide kanserinde RT rutin cerrahi alternatifi değildir; unresectable lokal hastalık, R2 rezidü veya semptomatik lokal kontrol gereksiniminde seçilmiş MDT kararıyla kullanılır.', 'Elektif nodal alanlar tümör lokalizasyonu ve D2 diseksiyon durumuna göre belirlenir; geniş para-aortik ENI rutin değildir.'],
          guidelineReferences: references(TRIALS[1], TRIALS[2]),
        });
        rtIndication = 'consider';
      }
    } else if (input.setting === 'postoperative') {
      const postoperativeDose = fraction(45, 25, 'conventional', '45 Gy / 25 fx; seçilmiş tümör yatağı/nodal boost');
      const highRisk = input.surgicalMargin === 'R1' || input.surgicalMargin === 'R2' || input.lymphadenectomy === 'D1' || input.lymphadenectomy === 'D1+';
      recommendations.push({
        id: 'postoperative-gastric-adjuvant',
        label: highRisk ? 'Yüksek riskli postoperatif kemoradyoterapi ± sistemik tedavi' : 'D2 sonrası patolojiye göre adjuvan sistemik tedavi',
        indication: highRisk ? 'consider' : 'conditional',
        intent: 'adjuvant',
        fractionation: highRisk ? postoperativeDose : undefined,
        targetVolumes: highRisk ? stomachTargets(postoperativeDose, true) : undefined,
        oarConstraints: highRisk ? stomachOars : undefined,
        systemicTherapy: [systemic('adjuvant', 'Adjuvan fluoropirimidin/oksaliplatin tabanlı tedavi', ['CAPOX veya FOLFOX'], 'Patolojik evre, marjin ve perioperatif tedaviye göre')],
        rationale: [
          'D2 diseksiyon sonrası rutin adjuvan RT tüm hastalarda standart değildir; ARTIST verileri seçilmiş nodal/intestinal risk dışında rutin ek yararı sınırlı göstermiştir.',
          'R1/R2 marjin veya yetersiz lenfadenektomi lokal nüks riskini artırır; modern IMRT ile seçilmiş postoperatif KRT düşünülebilir.',
          'CRITICS, perioperatif kemoterapi ve postoperatif KRT arasında genel sağkalım üstünlüğü göstermemiştir; RT kararı bireyselleştirilmelidir.',
        ],
        guidelineReferences: references(TRIALS[1], TRIALS[2]),
      });
      rtIndication = highRisk ? 'consider' : 'not-indicated';
      intent = 'adjuvant';
    } else if (input.setting === 'recurrent') {
      const salvageDose = fraction(50.4, 28, 'conventional', '45 Gy / 25 fx + boost; önceki RT ve OAR dozuna göre');
      recommendations.push({
        id: 'recurrent-gastric-salvage',
        label: 'Lokal nükste salvage cerrahi veya seçilmiş RT',
        indication: 'conditional',
        intent: 'salvage',
        fractionation: salvageDose,
        targetVolumes: stomachTargets(salvageDose, true),
        oarConstraints: stomachOars,
        rationale: ['R0 salvage olasılığı, nüksün lokalizasyonu, peritoneal yayılım ve önceki RT dozu MDT ile değerlendirilir.', 'Kanama, ağrı veya obstrüksiyonda RT semptomatik lokal kontrol sağlayabilir.'],
        guidelineReferences: references(),
      });
      rtIndication = 'conditional';
      intent = 'salvage';
    } else {
      intent = 'palliative';
      const therapy: SystemicTherapyRecommendation[] = [
        systemic('palliative', 'Moleküler profile göre metastatik sistemik tedavi', ['platin/fluoropirimidin ± nivolumab veya pembrolizumab'], 'PD-L1 CPS, HER2, MSI/MMR ve performansa göre'),
      ];
      if (input.molecularFinding === 'HER2-positive') therapy.push(systemic('palliative', 'HER2 hedefli tedavi', ['trastuzumab + kemoterapi ± pembrolizumab'], 'HER2 doğrulaması ve güncel kılavuza göre'));
      if (input.molecularFinding === 'CLDN18.2-positive') therapy.push(systemic('palliative', 'CLDN18.2 hedefli tedavi değerlendirmesi', ['zolbetuximab'], 'Uygun ilk sıra HER2-negatif hastada güncel ruhsat/kılavuza göre'));
      if (input.molecularFinding === 'MSI-H' || input.molecularFinding === 'dMMR') therapy.push(systemic('palliative', 'MSI-H/dMMR immünoterapisi', ['pembrolizumab veya nivolumab'], 'Moleküler sonuç ve ruhsat kriterlerine göre'));
      recommendations.push({
        id: 'metastatic-gastric-systemic',
        label: 'Metastatik mide kanserinde sistemik tedavi ve semptom odaklı RT',
        indication: 'indicated',
        intent,
        systemicTherapy: therapy,
        rationale: [
          'CheckMate-649, uygun PD-L1 ve klinik bağlamda nivolumab + kemoterapi seçeneğini destekler; HER2 pozitif hastalıkta ToGA trastuzumab yaklaşımını destekler.',
          'RT; kanama, obstrüksiyon, ağrı veya seçilmiş oligometastatik odaklarda palyatif/ablative amaçla değerlendirilir.',
        ],
        guidelineReferences: references(TRIALS[3], TRIALS[4]),
      });
      rtIndication = input.metastaticSites?.length || input.bleeding || input.obstruction ? 'conditional' : 'consider';
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
      uncertainties: !input.stage || input.histology === 'unknown' ? ['TNM evresi veya histoloji tamamlanmamış.'] : undefined,
      confidence: !input.stage || input.histology === 'unknown' ? 0.72 : 0.86,
      generatedAt: new Date().toISOString(),
      guidelineReferences: recommendations.flatMap((recommendation) => recommendation.guidelineReferences ?? []),
    };
  }

  private summary(input: StomachInput): string {
    if (input.setting === 'newly-diagnosed' || input.setting === 'locally-advanced') return 'Yeni tanı/lokal ileri mide kanseri: perioperatif FLOT, R0 gastrektomi ve seçilmiş lokal RT.';
    if (input.setting === 'postoperative') return 'Postoperatif mide kanseri: D2, marjin ve patolojik risklere göre adjuvan tedavi.';
    if (input.setting === 'recurrent') return 'Lokal nüks mide kanseri: salvage cerrahi/RT ve semptom kontrolü.';
    return 'Metastatik mide kanseri: HER2, PD-L1, MSI/MMR ve CLDN18.2 profile göre sistemik tedavi ve semptom odaklı RT.';
  }
}

export const stomachEngine = new StomachDecisionEngine();

export default stomachEngine;
