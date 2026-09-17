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

export type ThymicSetting = 'newly-diagnosed' | 'postoperative' | 'recurrent' | 'metastatic';
export type ThymicHistology = 'thymoma' | 'thymic-carcinoma' | 'thymic-neuroendocrine' | 'other' | 'unknown';
export type ThymicStage = 'I' | 'II' | 'III' | 'IVA' | 'IVB' | 'unknown';
export type ThymicSurgery = 'none' | 'thymectomy' | 'extended-thymectomy' | 'en-bloc-resection' | 'debulking' | 'unknown';
export type ThymicMolecularFinding = 'KIT-altered' | 'PD-L1-positive' | 'NTRK-fusion' | 'MSI-H' | 'TMB-high' | 'none' | 'unknown';

export interface ThymicInput extends ClinicalCaseInput {
  organSystem: 'thorax';
  disease: 'thymic-cancer';
  setting: ThymicSetting;
  stage?: TNMStage;
  stageGroup?: ThymicStage;
  histology?: ThymicHistology;
  surgeryType?: ThymicSurgery;
  surgicalMargin?: 'R0' | 'R1' | 'R2' | 'RX' | 'not-applicable';
  resectability?: 'resectable' | 'borderline' | 'unresectable' | 'unknown';
  grossResidualDisease?: boolean;
  pleuralImplants?: boolean;
  pericardialInvasion?: boolean;
  greatVesselInvasion?: boolean;
  phrenicNerveInvolvement?: boolean;
  myastheniaGravis?: boolean;
  positiveNodes?: number;
  distantMetastases?: string[];
  priorThoracicRT?: boolean;
  symptomaticRecurrence?: boolean;
  performanceStatusECOG?: number;
  molecularFinding?: ThymicMolecularFinding;
}

const NCCN: GuidelineReference = {
  organization: 'NCCN',
  title: 'NCCN Clinical Practice Guidelines in Oncology: Thymomas and Thymic Carcinomas',
  version: 'Current version; verify institutional subscription before use',
  url: 'https://www.nccn.org/guidelines/guidelines-detail?category=1&id=1460',
  evidenceLevel: '2A',
};
const ASTRO: GuidelineReference = {
  organization: 'ASTRO',
  title: 'ASTRO clinical practice resources for thoracic radiotherapy',
  url: 'https://www.astro.org/Patient-Care-and-Research/Clinical-Practice-Statements/Clinical-Practice-Guidelines',
  evidenceLevel: 'B',
};
const ESTRO: GuidelineReference = {
  organization: 'ESTRO',
  title: 'ESTRO guidance for mediastinal target delineation and thoracic OAR planning',
  url: 'https://www.estro.org/Science/Guidelines',
  evidenceLevel: 'B',
};
const TRIALS: GuidelineReference[] = [
  { organization: 'other', title: 'ITMIG retrospective database: postoperative radiotherapy in thymic malignancies', url: 'https://doi.org/10.1016/j.jtho.2016.03.012', evidenceLevel: '2B' },
  { organization: 'other', title: 'ADOC chemotherapy in advanced thymoma and thymic carcinoma', url: 'https://doi.org/10.1016/S0140-6736(99)00114-5', evidenceLevel: '2B' },
  { organization: 'other', title: 'NEJ023: carboplatin and paclitaxel in advanced thymic malignancies', url: 'https://doi.org/10.1093/annonc/mdt165', evidenceLevel: '2B' },
  { organization: 'other', title: 'Pembrolizumab in recurrent thymic carcinoma', url: 'https://doi.org/10.1200/JCO.2018.77.8829', evidenceLevel: '2A' },
];

export const THYMIC_INPUT_JSON_SCHEMA: JsonSchema = {
  $schema: 'http://json-schema.org/draft-07/schema#',
  $id: 'https://radonco.local/schema/thymic-input.json',
  title: 'Thymic cancer clinical case input',
  type: 'object',
  required: ['organSystem', 'disease', 'setting'],
  properties: {
    organSystem: { type: 'string', enum: ['thorax'] },
    disease: { type: 'string', enum: ['thymic-cancer'] },
    setting: { type: 'string', enum: ['newly-diagnosed', 'postoperative', 'recurrent', 'metastatic'] },
    stage: { type: 'object', additionalProperties: true },
    stageGroup: { type: 'string', enum: ['I', 'II', 'III', 'IVA', 'IVB', 'unknown'] },
    histology: { type: 'string', enum: ['thymoma', 'thymic-carcinoma', 'thymic-neuroendocrine', 'other', 'unknown'] },
    surgeryType: { type: 'string' },
    surgicalMargin: { type: 'string', enum: ['R0', 'R1', 'R2', 'RX', 'not-applicable'] },
    resectability: { type: 'string', enum: ['resectable', 'borderline', 'unresectable', 'unknown'] },
    grossResidualDisease: { type: 'boolean' },
    pleuralImplants: { type: 'boolean' },
    pericardialInvasion: { type: 'boolean' },
    greatVesselInvasion: { type: 'boolean' },
    phrenicNerveInvolvement: { type: 'boolean' },
    myastheniaGravis: { type: 'boolean' },
    positiveNodes: { type: 'number' },
    distantMetastases: { type: 'array', items: { type: 'string' } },
    priorThoracicRT: { type: 'boolean' },
    symptomaticRecurrence: { type: 'boolean' },
    performanceStatusECOG: { type: 'number' },
    molecularFinding: { type: 'string' },
  },
  additionalProperties: true,
};

export const THYMIC_OUTPUT_JSON_SCHEMA: JsonSchema = {
  $schema: 'http://json-schema.org/draft-07/schema#',
  $id: 'https://radonco.local/schema/thymic-result.json',
  title: 'Thymic cancer CDSS result',
  type: 'object',
  required: ['schemaVersion', 'engineId', 'engineVersion', 'organSystem', 'rtIndication', 'intent', 'summary', 'recommendations'],
  properties: {
    schemaVersion: { type: 'string', enum: ['1.0'] },
    engineId: { type: 'string', enum: ['head-neck.thymic'] },
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

const fraction = (totalDoseGy: number, fractions: number, className: Fractionation['class'], schedule: string): Fractionation => ({
  class: className,
  totalDoseGy,
  fractions,
  dosePerFractionGy: totalDoseGy / fractions,
  schedule,
  technique: className === 'SBRT' ? 'IGRT' : 'IMRT',
  alphaBetaTumor: 10,
  bedGy: totalDoseGy * (1 + totalDoseGy / fractions / 10),
  eqd2Gy: totalDoseGy * ((totalDoseGy / fractions + 10) / 12),
});

const thymicTargets = (dose: Fractionation, recurrent = false): TargetVolume[] => [
  { name: 'GTV', description: recurrent ? 'CT/PET-CT ile tanımlanan mediastinal, plevral veya perikardiyal nüks.' : 'Timik primer kitle, rezidüel hastalık, nodal veya plevral/perikardiyal makroskopik odaklar.', dose, margin: 'Makroskopik tümör, cerrahi yatak ve klipler' },
  { name: 'CTV', description: recurrent ? 'Nüks çevresi ve cerrahi/plevral risk alanları; yeniden ışınlamada daraltılmış hacim.' : 'Anterior mediasten ve tümör yayılımına göre cerrahi yatak; rutin elektif mediastinal nodal ışınlama yapılmaz.', dose, margin: 'Cerrahi, PET-CT/CT, plevral yayılım ve hareket yönetimine göre' },
  { name: 'PTV', description: 'Solunum hareketi, kalp/perikard hareketi ve günlük IGRT belirsizliği.', dose, margin: '4D-CT/IGRT ile yaklaşık 5-10 mm; solunum yönetimi değerlendirilmeli' },
];

const thymicOars: OARConstraint[] = [
  { organ: 'Lungs combined', metric: 'V20', limit: 30, unit: '%', priority: 'optimal', source: 'QUANTEC', sourceReference: 'Thoracic lung objective' },
  { organ: 'Lungs combined', metric: 'Dmean', limit: 20, unit: 'Gy', priority: 'optimal', source: 'QUANTEC', sourceReference: 'Thoracic lung mean-dose objective' },
  { organ: 'Heart', metric: 'Dmean', limit: 26, unit: 'Gy', priority: 'optimal', source: 'QUANTEC', sourceReference: 'Thoracic heart objective' },
  { organ: 'Esophagus', metric: 'Dmean', limit: 34, unit: 'Gy', priority: 'optimal', source: 'QUANTEC', sourceReference: 'Thoracic esophageal objective' },
  { organ: 'Spinal cord', metric: 'Dmax', limit: 45, unit: 'Gy', priority: 'mandatory', source: 'QUANTEC', sourceReference: 'Thoracic spinal cord objective' },
  { organ: 'Brachial plexus', metric: 'Dmax', limit: 66, unit: 'Gy', priority: 'mandatory', source: 'protocol', sourceReference: 'Thoracic outlet objective' },
];

const systemic = (
  setting: SystemicTherapyRecommendation['setting'],
  regimen: string,
  agents: string[],
  timing: string,
  evidenceLevel: SystemicTherapyRecommendation['evidenceLevel'] = '2A',
): SystemicTherapyRecommendation => ({ setting, regimen, agents, timing, evidenceLevel });

const references = (...extra: GuidelineReference[]): GuidelineReference[] => [NCCN, ASTRO, ESTRO, ...extra];

export class ThymicDecisionEngine extends BaseDecisionEngine<ThymicInput> {
  public readonly id = 'head-neck.thymic';
  public readonly version = '1.0.0';
  public readonly inputSchema = THYMIC_INPUT_JSON_SCHEMA;
  public readonly outputSchema = THYMIC_OUTPUT_JSON_SCHEMA;

  public constructor() {
    super('1.0.0');
  }

  protected evaluateCase(input: ThymicInput): CDSSResult {
    const recommendations: ClinicalRecommendation[] = [];
    const rationale: string[] = [];
    const warnings: string[] = [];
    let rtIndication: CDSSResult['rtIndication'] = 'not-indicated';
    let intent: CDSSResult['intent'] = 'curative';
    const locallyAdvanced = input.stageGroup === 'III' || input.stageGroup === 'IVA' || input.resectability === 'unresectable' || input.greatVesselInvasion === true;
    const highRisk = input.surgicalMargin === 'R1' || input.surgicalMargin === 'R2' || input.grossResidualDisease === true || input.pericardialInvasion === true || input.pleuralImplants === true || input.greatVesselInvasion === true;

    if (input.priorThoracicRT) warnings.push('Önceki toraks RT mevcut; akciğer, kalp, özofagus, spinal kord ve brakiyal pleksus kümülatif dozları hesaplanmalıdır.');
    if (input.myastheniaGravis) warnings.push('Miyastenia gravis mevcut; anestezi, cerrahi ve özellikle immün kontrol noktası inhibitörleri açısından nöroloji/MDT değerlendirmesi gereklidir.');
    if (input.pleuralImplants) rationale.push('Plevral implantlar Masaoka-Koga IVA/özel TNM yayılımı ile uyumludur; sitoredüksiyon/HIPEC seçimi ve sistemik tedavi MDT ile değerlendirilmelidir.');

    if (input.setting === 'newly-diagnosed') {
      const definitiveDose = fraction(60, 30, 'conventional', '60 Gy / 30 fx; mediastinal primer/rezidüel hastalık için IMRT/VMAT');
      recommendations.push({
        id: 'new-thymic-cancer',
        label: locallyAdvanced ? 'Neoadjuvan platin bazlı kemoterapi + cerrahi rezektabilite değerlendirmesi veya definitif KRT' : 'R0 hedefli timik rezeksiyon; patolojiye göre adjuvan RT',
        indication: highRisk || locallyAdvanced ? 'indicated' : 'conditional',
        intent: 'curative',
        fractionation: highRisk || locallyAdvanced ? definitiveDose : undefined,
        targetVolumes: highRisk || locallyAdvanced ? thymicTargets(definitiveDose) : undefined,
        oarConstraints: highRisk || locallyAdvanced ? thymicOars : undefined,
        systemicTherapy: locallyAdvanced
          ? [systemic('neoadjuvant', 'Platin bazlı indüksiyon kemoterapisi', ['cisplatin/carboplatin', 'doxorubicin', 'cyclophosphamide'], 'Rezektabiliteyi artırmak için 2-4 kür sonrası yeniden değerlendirme', '2A'), systemic('concurrent', 'Seçilmiş unresectable hastada eşzamanlı platin bazlı KRT', ['cisplatin'], 'RT ile eşzamanlı; rutin standart histoloji ve MDT’ye bağlı', '2B')]
          : [systemic('adjuvant', 'Seçilmiş yüksek riskte adjuvan kemoterapi veya yakın izlem', ['CAP/ADOC veya kurum protokolü'], 'Rezeksiyon ve patolojik risk sonrası', '2B')],
        rationale: [
          'Timik tümörlerde cerrahi rezeksiyon ve mümkünse komplet makroskopik rezeksiyon temel tedavidir; great vessel, perikard, akciğer ve plevra ilişkisi rezekte edilebilirliği belirler.',
          'R0 evre I timomada rutin RT çoğu hastada gerekli değildir; evre II-III, timik karsinom, R1/R2 veya plevral/perikardiyal yayılımda postoperatif RT değerlendirilir.',
          'Lokal ileri unresectable hastalıkta platin bazlı indüksiyon kemoterapisi sonrası cerrahi veya definitif 60-66 Gy KRT seçilmiş MDT yaklaşımıdır.',
          'Elektif mediastinal nodal ışınlama rutin değildir; GTV/cerrahi yatak ve makroskopik plevral/perikardiyal odaklar hareket yönetimiyle hedeflenir.',
        ],
        guidelineReferences: references(TRIALS[0], TRIALS[1], TRIALS[2]),
      });
      rtIndication = highRisk || locallyAdvanced ? 'indicated' : 'conditional';
    } else if (input.setting === 'postoperative') {
      const postoperativeDose = fraction(50.4, 28, 'conventional', '50.4 Gy / 28 fx; timik yatak ve riskli rezidüel alan');
      recommendations.push({
        id: 'postoperative-thymic-cancer',
        label: highRisk ? 'Yüksek riskli postoperatif mediastinal RT' : 'Evre/histoloji/marjine göre adjuvan RT veya izlem',
        indication: highRisk ? 'indicated' : 'conditional',
        intent: 'adjuvant',
        fractionation: highRisk ? postoperativeDose : undefined,
        targetVolumes: highRisk ? thymicTargets(postoperativeDose) : undefined,
        oarConstraints: highRisk ? thymicOars : undefined,
        systemicTherapy: highRisk ? [systemic('adjuvant', 'Seçilmiş timik karsinom veya rezidüel hastalıkta platin bazlı sistemik tedavi', ['carboplatin/paclitaxel veya CAP'], 'RT sekansına göre MDT planlaması', '2B')] : undefined,
        rationale: [
          'R1/R2 rezeksiyon, timik karsinom, ileri invazyon, plevral/perikardiyal yayılım veya yüksek lokal nüks riski postoperatif RT endikasyonunu güçlendirir.',
          'Timik yatak, preoperatif kitle uzanımı ve rezidüel/makroskopik alanlar kapsanmalı; gereksiz geniş mediastinal alan kalp ve akciğer dozunu artırmamalıdır.',
          'Miyastenia gravis ve eşlik eden otoimmün hastalıklar sistemik tedavi ve steroid yönetimini etkiler.',
        ],
        guidelineReferences: references(TRIALS[0]),
      });
      rtIndication = highRisk ? 'indicated' : 'conditional';
      intent = 'adjuvant';
    } else if (input.setting === 'recurrent') {
      const salvageDose = fraction(60, 30, 'conventional', '60 Gy / 30 fx; daha önce ışınlanmamış seçilmiş mediastinal/plevral salvage alan');
      const focalDose = fraction(30, 5, 'SBRT', '30 Gy / 5 fx; küçük ve kalp/özofagustan uzak seçilmiş odak');
      const previouslyIrradiated = input.priorThoracicRT === true;
      recommendations.push({
        id: 'recurrent-thymic-cancer',
        label: previouslyIrradiated ? 'Önceki RT sonrası seçilmiş cerrahi/re-irradiation veya sistemik tedavi' : 'Salvage cerrahi, lokal RT/SBRT ve sistemik tedavi seçimi',
        indication: input.symptomaticRecurrence ? 'indicated' : 'conditional',
        intent: 'salvage',
        fractionation: previouslyIrradiated ? focalDose : salvageDose,
        targetVolumes: thymicTargets(previouslyIrradiated ? focalDose : salvageDose, true),
        oarConstraints: thymicOars,
        systemicTherapy: [systemic('palliative', 'Platin bazlı tedavi, pembrolizumab seçilmiş timik karsinomda veya klinik çalışma', ['carboplatin/paclitaxel', 'pembrolizumab', 'lenvatinib/klinik çalışma'], 'Histoloji, otoimmünite, progresyon ve performansa göre', '2A')],
        rationale: [
          'İzole mediastinal/plevral nükste komplet sitoredüksiyon, cerrahi veya lokal RT/SBRT seçilmiş hastalarda değerlendirilebilir.',
          'Önceki toraks RT sonrası yeniden ışınlama; kalp, akciğer, özofagus, spinal kord ve büyük damar kümülatif dozları ile fistül/kanama riski hesaplanmadan yapılmamalıdır.',
          'Timomada immün kontrol noktası inhibitörleri miyokardit ve diğer ciddi immün toksisiteler nedeniyle seçilmiş timik karsinom hastalarında dahi dikkatle kullanılmalıdır.',
        ],
        guidelineReferences: references(TRIALS[2], TRIALS[3]),
      });
      rtIndication = input.symptomaticRecurrence ? 'indicated' : 'conditional';
      intent = 'salvage';
    } else {
      const palliativeDose = fraction(30, 10, 'moderate-hypofractionation', '30 Gy / 10 fx; semptomatik mediastinal/plevral veya metastatik odak');
      recommendations.push({
        id: 'metastatic-thymic-cancer',
        label: 'Sistemik tedavi ve semptomatik mediastinal/plevral odaklara palyatif RT',
        indication: input.symptomaticRecurrence ? 'indicated' : 'conditional',
        intent: 'palliative',
        fractionation: input.symptomaticRecurrence ? palliativeDose : undefined,
        targetVolumes: input.symptomaticRecurrence ? thymicTargets(palliativeDose) : undefined,
        oarConstraints: input.symptomaticRecurrence ? thymicOars : undefined,
        systemicTherapy: [systemic('palliative', 'Histolojiye göre CAP/ADOC, carboplatin-paklitaksel, pembrolizumab seçilmiş timik karsinomda veya klinik çalışma', ['CAP/ADOC', 'carboplatin/paclitaxel', 'pembrolizumab', 'clinical trial'], 'Performans, otoimmünite ve önceki tedavilere göre', '2A')],
        rationale: [
          'Metastatik timik tümörde sistemik tedavi ana yaklaşımdır; RT nefes darlığı, vena cava basısı, göğüs ağrısı, kanama veya sınırlı metastaz için kullanılır.',
          'Miyastenia gravis ve diğer paraneoplastik/otoimmün durumlar immünoterapi riskini önemli ölçüde artırabilir.',
        ],
        guidelineReferences: references(TRIALS[2], TRIALS[3]),
      });
      rtIndication = input.symptomaticRecurrence ? 'indicated' : 'conditional';
      intent = 'palliative';
    }

    if (input.distantMetastases && input.distantMetastases.length > 0) {
      rationale.push('Uzak metastazlar mevcut; lokal RT kararı sistemik hastalık yükü, semptomlar ve seçilmiş oligometastatik strateji ile birlikte verilmelidir.');
    }

    return {
      schemaVersion: '1.0',
      engineId: this.id,
      engineVersion: this.version,
      caseId: input.caseId,
      organSystem: 'thorax',
      rtIndication,
      intent,
      summary: recommendations[0]?.label ?? 'Timus kanseri için MDT değerlendirmesi gerekir.',
      recommendations,
      rationale,
      warnings,
      uncertainties: ['Aktif NCCN/ASTRO/ESTRO sürümü, kontrastlı toraks CT/PET-CT, rezekabilite ve otoimmünite değerlendirmesi kurum içinde doğrulanmalıdır.'],
      confidence: 0.8,
      guidelineReferences: references(...TRIALS),
    };
  }
}

export const thymicEngine = new ThymicDecisionEngine();
