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

export type AnalSetting = 'newly-diagnosed' | 'locally-advanced' | 'recurrent' | 'metastatic';
export type AnalHistology = 'squamous-cell' | 'adenocarcinoma' | 'basaloid' | 'other' | 'unknown';
export type AnalHIVStatus = 'negative' | 'positive-controlled' | 'positive-uncontrolled' | 'unknown';
export type AnalResponse = 'complete-clinical-response' | 'partial-response' | 'stable' | 'progressive' | 'unknown';
export type AnalMolecularFinding = 'HPV-associated' | 'HPV-negative' | 'MSI-H' | 'dMMR' | 'unknown';

export interface AnalInput extends ClinicalCaseInput {
  organSystem: 'gis';
  disease: 'anal-cancer';
  setting: AnalSetting;
  stage?: TNMStage;
  histology?: AnalHistology;
  clinicalT?: string;
  nodalStatus?: 'N0' | 'N1a' | 'N1b' | 'N1c' | 'N2' | 'N3' | 'unknown';
  tumorSizeCm?: number;
  inguinalNodesInvolved?: boolean;
  mesorectalNodesInvolved?: boolean;
  hivStatus?: AnalHIVStatus;
  cd4Count?: number;
  performanceStatusECOG?: number;
  responseToChemoradiation?: AnalResponse;
  localRecurrence?: boolean;
  metastaticSites?: string[];
  priorPelvicRT?: boolean;
  surgicalMargin?: 'R0' | 'R1' | 'R2' | 'RX' | 'not-applicable';
  molecularFinding?: AnalMolecularFinding;
}

const NCCN: GuidelineReference = {
  organization: 'NCCN',
  title: 'NCCN Clinical Practice Guidelines in Oncology: Anal Carcinoma',
  version: 'Current version; verify institutional subscription before use',
  url: 'https://www.nccn.org/guidelines/guidelines-detail?category=1&id=1406',
  evidenceLevel: '2A',
};

const ASTRO: GuidelineReference = {
  organization: 'ASTRO',
  title: 'ASTRO clinical practice resources for gastrointestinal and anal cancer radiotherapy',
  url: 'https://www.astro.org/Patient-Care-and-Research/Clinical-Practice-Statements',
  evidenceLevel: 'B',
};

const ESTRO: GuidelineReference = {
  organization: 'ESTRO',
  title: 'ESTRO-ACROP guidance for anal cancer radiotherapy and target delineation',
  url: 'https://www.estro.org/Science/Guidelines',
  evidenceLevel: 'B',
};

const TRIALS: GuidelineReference[] = [
  {
    organization: 'other',
    title: 'ACT II: mitomycin/5-FU chemoradiotherapy and maintenance chemotherapy in anal cancer',
    url: 'https://doi.org/10.1016/S0140-6736(13)61953-5',
    evidenceLevel: '1',
  },
  {
    organization: 'other',
    title: 'RTOG 98-11: mitomycin versus cisplatin with fluoropyrimidine and radiotherapy',
    url: 'https://clinicaltrials.gov/study/NCT00025090',
    evidenceLevel: '1',
  },
  {
    organization: 'other',
    title: 'RTOG 3DCRT/IMRT anal cancer protocol resources',
    url: 'https://www.nrgoncology.org/Clinical-Trials/Protocol-Table',
    evidenceLevel: '2A',
  },
  {
    organization: 'other',
    title: 'InterAACT: carboplatin-paclitaxel versus cisplatin-5-FU in advanced anal cancer',
    url: 'https://doi.org/10.1016/S1470-2045(18)30422-5',
    evidenceLevel: '1',
  },
];

export const ANAL_INPUT_JSON_SCHEMA: JsonSchema = {
  $schema: 'http://json-schema.org/draft-07/schema#',
  $id: 'https://radonco.local/schema/anal-input.json',
  title: 'Anal cancer clinical case input',
  type: 'object',
  required: ['organSystem', 'disease', 'setting'],
  properties: {
    organSystem: { type: 'string', enum: ['gis'] },
    disease: { type: 'string', enum: ['anal-cancer'] },
    setting: { type: 'string', enum: ['newly-diagnosed', 'locally-advanced', 'recurrent', 'metastatic'] },
    stage: { type: 'object', additionalProperties: true },
    histology: { type: 'string', enum: ['squamous-cell', 'adenocarcinoma', 'basaloid', 'other', 'unknown'] },
    clinicalT: { type: 'string' },
    nodalStatus: { type: 'string', enum: ['N0', 'N1a', 'N1b', 'N1c', 'N2', 'N3', 'unknown'] },
    tumorSizeCm: { type: 'number' },
    inguinalNodesInvolved: { type: 'boolean' },
    mesorectalNodesInvolved: { type: 'boolean' },
    hivStatus: { type: 'string', enum: ['negative', 'positive-controlled', 'positive-uncontrolled', 'unknown'] },
    cd4Count: { type: 'number' },
    performanceStatusECOG: { type: 'number' },
    responseToChemoradiation: { type: 'string', enum: ['complete-clinical-response', 'partial-response', 'stable', 'progressive', 'unknown'] },
    localRecurrence: { type: 'boolean' },
    metastaticSites: { type: 'array', items: { type: 'string' } },
    priorPelvicRT: { type: 'boolean' },
    surgicalMargin: { type: 'string', enum: ['R0', 'R1', 'R2', 'RX', 'not-applicable'] },
    molecularFinding: { type: 'string' },
  },
  additionalProperties: true,
};

export const ANAL_OUTPUT_JSON_SCHEMA: JsonSchema = {
  $schema: 'http://json-schema.org/draft-07/schema#',
  $id: 'https://radonco.local/schema/anal-result.json',
  title: 'Anal cancer CDSS result',
  type: 'object',
  required: ['schemaVersion', 'engineId', 'engineVersion', 'organSystem', 'rtIndication', 'intent', 'summary', 'recommendations'],
  properties: {
    schemaVersion: { type: 'string', enum: ['1.0'] },
    engineId: { type: 'string', enum: ['gis.anal'] },
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

const analTargets = (radiationDose: Fractionation, includeInguinal = true): TargetVolume[] => [
  {
    name: 'GTV',
    description: 'Primer anal tümör ve görüntülenebilir nodal hastalık; klinik muayene, anoskopi, MR ve PET/BT ile.',
    dose: radiationDose,
    margin: 'Görüntülenebilir hastalık',
  },
  {
    name: 'CTV',
    description: 'Anal kanal/primer yatak, mezorektal-presakral ve internal iliak risk alanları.',
    dose: radiationDose,
    margin: 'Anatomik bariyerler ve tümör yayılım yolları dikkate alınır',
  },
  ...(includeInguinal
    ? [{
        name: 'CTV',
        description: 'Bilateral inguinal ve external iliac nodal bölgeler; T/N evresine ve tümör yerleşimine göre.',
        dose: fraction(45, 25, 'conventional', 'Elektif nodlar 45 Gy / 25 fx'),
        margin: 'İnguinal ve pelvik nodal atlas',
      }]
    : []),
  {
    name: 'PTV',
    description: 'Pelvik organ hareketi, rektum/mesane doluluğu ve günlük kurulum belirsizliği için CTV marjı.',
    dose: radiationDose,
    margin: 'IGRT ile yaklaşık 5-10 mm; primer ve nodal boostlarda kurum protokolü',
  },
];

const analOars: OARConstraint[] = [
  { organ: 'Small bowel', metric: 'V45', limit: 195, unit: 'cc', priority: 'mandatory', source: 'protocol', sourceReference: 'NRG/RTOG anal cancer planning objective' },
  { organ: 'Small bowel', metric: 'Dmax', limit: 50, unit: 'Gy', priority: 'mandatory', source: 'protocol', sourceReference: 'Pelvic chemoradiotherapy bowel constraint' },
  { organ: 'Bladder', metric: 'V40', limit: 50, unit: '%', priority: 'optimal', source: 'protocol', sourceReference: 'Anal cancer pelvic RT objective' },
  { organ: 'Femoral heads', metric: 'Dmax', limit: 44, unit: 'Gy', priority: 'mandatory', source: 'protocol', sourceReference: 'Anal cancer planning objective' },
  { organ: 'External genitalia', metric: 'Dmean', limit: 40, unit: 'Gy', priority: 'acceptable', source: 'protocol', sourceReference: 'Anal cancer IMRT planning objective' },
];

const systemic = (
  setting: SystemicTherapyRecommendation['setting'],
  regimen: string,
  agents: string[],
  timing: string,
  evidenceLevel: SystemicTherapyRecommendation['evidenceLevel'] = '1',
): SystemicTherapyRecommendation => ({ setting, regimen, agents, timing, evidenceLevel });

const references = (...extra: GuidelineReference[]): GuidelineReference[] => [NCCN, ASTRO, ESTRO, ...extra];

export class AnalDecisionEngine extends BaseDecisionEngine<AnalInput> {
  public readonly id = 'gis.anal';
  public readonly version = '1.0.0';
  public readonly inputSchema = ANAL_INPUT_JSON_SCHEMA;
  public readonly outputSchema = ANAL_OUTPUT_JSON_SCHEMA;

  public constructor() {
    super('1.0.0');
  }

  protected evaluateCase(input: AnalInput): CDSSResult {
    const recommendations: ClinicalRecommendation[] = [];
    const rationale: string[] = [];
    const warnings: string[] = [];
    let rtIndication: CDSSResult['rtIndication'] = 'conditional';
    let intent: CDSSResult['intent'] = 'curative';

    if (input.priorPelvicRT) warnings.push('Önceki pelvik RT mevcut; ince barsak, mesane, femur başları ve genital yapıların kümülatif dozları değerlendirilmelidir.');
    if (input.hivStatus === 'positive-uncontrolled' || (input.hivStatus === 'positive-controlled' && (input.cd4Count ?? 999) < 200)) {
      warnings.push('Kontrolsüz HIV veya CD4 <200 hücre/µL durumunda enfeksiyon, hematolojik toksisite ve tedavi sürekliliği enfeksiyon hastalıkları ile optimize edilmelidir; RT otomatik olarak dışlanmaz.');
    }

    if (input.setting === 'newly-diagnosed' || input.setting === 'locally-advanced') {
      const definitiveDose = fraction(54, 30, 'conventional', '54 Gy / 30 fx; primer/nodal boostlu IMRT');
      const systemicTherapy = [
        systemic('concurrent', 'Nigro tipi eşzamanlı kemoradyoterapi', ['5-FU veya capecitabine + mitomycin-C'], 'RT boyunca; mitomycin gün 1 ve protokole göre ikinci doz'),
      ];
      recommendations.push({
        id: 'anal-definitive-chemoradiation',
        label: 'Definitif IMRT + mitomycin/fluoropirimidin',
        indication: 'indicated',
        intent: 'curative',
        fractionation: definitiveDose,
        targetVolumes: analTargets(definitiveDose, true),
        oarConstraints: analOars,
        systemicTherapy,
        rationale: [
          'Skuamöz anal kanserde cerrahi yerine definitif kemoradyoterapi organ koruyucu standart yaklaşımdır.',
          'ACT II ve RTOG 98-11, mitomycin/fluoropirimidin temelli eşzamanlı KRT’nin lokal kontrol ve kolostomisiz sağkalımdaki rolünü destekler.',
          'İnguinal, external iliac, internal iliac ve presakral nodlar tümör seviyesi ve N durumuna göre kapsanır; elektif nodal politika anal kanserde rutin ve anatomik olarak hastalığa özgüdür.',
          'IMRT, cilt, genital yapı, ince barsak, mesane ve femur başı dozlarını azaltmak için tercih edilir; tedavi kesintileri mümkün olduğunca önlenir.',
        ],
        guidelineReferences: references(TRIALS[0], TRIALS[1], TRIALS[2]),
      });
      recommendations.push({
        id: 'anal-response-surveillance',
        label: 'KRT sonrası gecikmiş klinik yanıt değerlendirmesi',
        indication: 'consider',
        intent: 'curative',
        rationale: [
          'KRT sonrası yanıt birkaç ay içinde derinleşebilir; erken rezidüel bulguda hemen abdominoperineal rezeksiyon kararı verilmemelidir.',
          'DRE, anoskopi, biyopsi gerektiğinde MRI/PET-BT ile 8-12 hafta ve devam eden yakın takip yapılır.',
          'Tam yanıt yoksa veya lokal progresyon varsa salvage abdominoperineal rezeksiyon değerlendirilir.',
        ],
        guidelineReferences: references(),
      });
      rtIndication = 'indicated';
    } else if (input.setting === 'recurrent') {
      const salvageDose = fraction(54, 30, 'conventional', 'Salvage pelvik RT 45 Gy / 25 fx + boost; önceki RT’ye göre');
      recommendations.push({
        id: 'anal-local-recurrence-salvage',
        label: 'Lokal nükste salvage abdominoperineal rezeksiyon ± yeniden RT',
        indication: 'conditional',
        intent: 'salvage',
        fractionation: salvageDose,
        targetVolumes: analTargets(salvageDose, true),
        oarConstraints: analOars,
        rationale: [
          'Lokal nükste R0 salvage cerrahi potansiyeli, komşu organ invazyonu ve uzak metastaz durumu pelvik MDT tarafından değerlendirilir.',
          'Önceki RT alanında yeniden ışınlama yalnızca kümülatif doz, interval ve hedef/OAR geometrisi ile seçilmiş hastada uygulanmalıdır.',
          'R1/R2 salvage marjin veya makroskopik rezidü durumunda ek lokal tedavi ve sistemik tedavi seçenekleri tartışılır.',
        ],
        guidelineReferences: references(),
      });
      rtIndication = 'conditional';
      intent = 'salvage';
    } else {
      intent = 'palliative';
      const systemicTherapy = [
        systemic('palliative', 'İleri anal kanserde sistemik tedavi', ['carboplatin + paclitaxel veya cisplatin + 5-FU'], 'Performans durumu, önceki KRT ve organ fonksiyonuna göre'),
      ];
      if (input.molecularFinding === 'MSI-H' || input.molecularFinding === 'dMMR') {
        systemicTherapy.push(systemic('palliative', 'MSI-H/dMMR immünoterapisi değerlendirmesi', ['pembrolizumab veya nivolumab'], 'Moleküler sonuç ve güncel kılavuz/ruhsat kriterlerine göre'));
      }
      recommendations.push({
        id: 'metastatic-anal-systemic',
        label: 'Metastatik anal kanserde sistemik tedavi ve semptom odaklı RT',
        indication: 'indicated',
        intent,
        systemicTherapy,
        rationale: [
          'Metastatik hastalıkta carboplatin-paclitaxel veya uygun hastada cisplatin-5-FU sistemik omurgadır; InterAAct çalışması carboplatin-paclitaxel lehine toksisite/uygulanabilirlik verisi sağlar.',
          'RT; kanama, ağrı, lokal obstrüksiyon, spinal/kemik tehdidi veya seçilmiş oligometastatik odaklarda palyatif/ablative amaçla uygulanır.',
          'EGFR/ALK gibi akciğer sürücüleri anal skuamöz kanserin rutin biyobelirteçleri değildir; HPV, MSI/MMR ve klinik çalışma uygunluğu daha anlamlıdır.',
        ],
        guidelineReferences: references(TRIALS[3]),
      });
      if (input.metastaticSites?.length) {
        recommendations.push({
          id: 'metastatic-anal-palliative-rt',
          label: 'Semptomatik metastazlara RT',
          indication: 'consider',
          intent: 'palliative',
          rationale: ['Kemik, karaciğer veya lokal pelvik metastazlarda RT fraksiyonasyonu hedef, semptom, önceki RT ve yaşam beklentisine göre belirlenir.'],
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
      organSystem: 'gis',
      rtIndication,
      intent,
      summary: this.summary(input),
      recommendations,
      rationale,
      warnings: warnings.length ? warnings : undefined,
      uncertainties: !input.stage || input.histology === 'unknown' ? ['TNM evresi veya histoloji tamamlanmamış.'] : undefined,
      confidence: !input.stage || input.histology === 'unknown' ? 0.72 : 0.87,
      generatedAt: new Date().toISOString(),
      guidelineReferences: recommendations.flatMap((recommendation) => recommendation.guidelineReferences ?? []),
    };
  }

  private summary(input: AnalInput): string {
    if (input.setting === 'newly-diagnosed' || input.setting === 'locally-advanced') return 'Yeni tanı/lokal ileri anal skuamöz kanser: Nigro tipi definitif kemoradyoterapi ve yakın yanıt takibi.';
    if (input.setting === 'recurrent') return 'Lokal nüks anal kanser: R0 salvage cerrahi ve seçilmiş yeniden ışınlama.';
    return 'Metastatik anal kanser: carboplatin-paclitaxel/cisplatin-5FU tabanlı sistemik tedavi ve semptom odaklı RT.';
  }
}

export const analEngine = new AnalDecisionEngine();

export default analEngine;
