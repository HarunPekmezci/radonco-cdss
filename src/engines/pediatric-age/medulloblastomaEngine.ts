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

export type MedulloblastomaSetting = 'newly-diagnosed' | 'postoperative' | 'relapsed' | 'metastatic' | 'surveillance';
export type MedulloblastomaRisk = 'average-risk' | 'high-risk' | 'infant-young-child' | 'relapsed' | 'unknown';
export type MedulloblastomaMolecularGroup = 'WNT-activated' | 'SHH-activated' | 'group-3' | 'group-4' | 'molecular-unknown';
export type MedulloblastomaSurgery = 'gross-total-resection' | 'near-total-resection' | 'subtotal-resection' | 'biopsy' | 'none' | 'unknown';

export interface MedulloblastomaInput extends ClinicalCaseInput {
  organSystem: 'cns';
  disease: 'medulloblastoma';
  setting: MedulloblastomaSetting;
  riskGroup?: MedulloblastomaRisk;
  molecularGroup?: MedulloblastomaMolecularGroup;
  stage?: TNMStage;
  surgeryType?: MedulloblastomaSurgery;
  residualTumorMm?: number;
  diffuseAnaplasia?: boolean;
  csfPositive?: boolean;
  metastaticDisease?: boolean;
  spineMetastases?: boolean;
  ageYears?: number;
  performanceStatusECOG?: number;
  priorCraniospinalRT?: boolean;
  priorChemotherapy?: string[];
  hydrocephalus?: boolean;
  molecularFinding?: string[];
  relapseSite?: 'local' | 'leptomeningeal' | 'distant' | 'mixed' | 'unknown';
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
  title: 'ASTRO clinical practice resources for pediatric CNS tumors and craniospinal irradiation',
  url: 'https://www.astro.org/Patient-Care-and-Research/Clinical-Practice-Statements/Clinical-Practice-Guidelines',
  evidenceLevel: 'B',
};
const ESTRO: GuidelineReference = {
  organization: 'ESTRO',
  title: 'ESTRO consensus guidance for pediatric craniospinal irradiation and medulloblastoma',
  url: 'https://www.estro.org/Science/Guidelines',
  evidenceLevel: 'B',
};
const TRIALS: GuidelineReference[] = [
  { organization: 'other', title: 'COG ACNS0331: reduced-dose craniospinal irradiation for average-risk medulloblastoma', url: 'https://clinicaltrials.gov/study/NCT00085735', evidenceLevel: '1' },
  { organization: 'other', title: 'COG ACNS0332: risk-adapted therapy for high-risk medulloblastoma', url: 'https://clinicaltrials.gov/study/NCT00392327', evidenceLevel: '1' },
  { organization: 'other', title: 'SIOP-PNET5-MB: molecularly informed therapy for standard-risk medulloblastoma', url: 'https://clinicaltrials.gov/study/NCT02066220', evidenceLevel: '1' },
  { organization: 'other', title: 'HIT-SIOP-PNET4: hyperfractionated versus conventional radiotherapy in childhood medulloblastoma', url: 'https://doi.org/10.1016/S0140-6736(10)61420-6', evidenceLevel: '1' },
  { organization: 'other', title: 'RTOG 0539: a pediatric craniospinal irradiation quality-assurance framework', url: 'https://clinicaltrials.gov/study/NCT00533793', evidenceLevel: '2B' },
];

export const MEDULLOBLASTOMA_INPUT_JSON_SCHEMA: JsonSchema = {
  $schema: 'http://json-schema.org/draft-07/schema#',
  $id: 'https://radonco.local/schema/medulloblastoma-input.json',
  title: 'Medulloblastoma clinical case input',
  type: 'object',
  required: ['organSystem', 'disease', 'setting'],
  properties: {
    organSystem: { type: 'string', enum: ['cns'] },
    disease: { type: 'string', enum: ['medulloblastoma'] },
    setting: { type: 'string', enum: ['newly-diagnosed', 'postoperative', 'relapsed', 'metastatic', 'surveillance'] },
    riskGroup: { type: 'string', enum: ['average-risk', 'high-risk', 'infant-young-child', 'relapsed', 'unknown'] },
    molecularGroup: { type: 'string', enum: ['WNT-activated', 'SHH-activated', 'group-3', 'group-4', 'molecular-unknown'] },
    stage: { type: 'object', additionalProperties: true },
    surgeryType: { type: 'string' }, residualTumorMm: { type: 'number' },
    diffuseAnaplasia: { type: 'boolean' }, csfPositive: { type: 'boolean' },
    metastaticDisease: { type: 'boolean' }, spineMetastases: { type: 'boolean' },
    ageYears: { type: 'number' }, performanceStatusECOG: { type: 'number' },
    priorCraniospinalRT: { type: 'boolean' }, priorChemotherapy: { type: 'array', items: { type: 'string' } },
    hydrocephalus: { type: 'boolean' }, molecularFinding: { type: 'array', items: { type: 'string' } },
    relapseSite: { type: 'string', enum: ['local', 'leptomeningeal', 'distant', 'mixed', 'unknown'] },
  },
  additionalProperties: true,
};

export const MEDULLOBLASTOMA_OUTPUT_JSON_SCHEMA: JsonSchema = {
  $schema: 'http://json-schema.org/draft-07/schema#',
  $id: 'https://radonco.local/schema/medulloblastoma-result.json',
  title: 'Medulloblastoma CDSS result',
  type: 'object',
  required: ['schemaVersion', 'engineId', 'engineVersion', 'organSystem', 'rtIndication', 'intent', 'summary', 'recommendations'],
  properties: {
    schemaVersion: { type: 'string', enum: ['1.0'] },
    engineId: { type: 'string', enum: ['pediatric-age.medulloblastoma'] },
    engineVersion: { type: 'string' }, organSystem: { type: 'string', enum: ['cns'] },
    rtIndication: { type: 'string' }, intent: { type: 'string' }, summary: { type: 'string' },
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
  technique: 'IMRT',
  alphaBetaTumor: 10,
  bedGy: totalDoseGy * (1 + totalDoseGy / fractions / 10),
  eqd2Gy: totalDoseGy * ((totalDoseGy / fractions + 10) / 12),
});

const targets = (craniospinal: Fractionation, boost: Fractionation): TargetVolume[] => [
  { name: 'CTV', description: 'Beyin ve spinal subaraknoid boşluk; kraniospinal aks, kribriform plak, optik sinir kılıfları ve sakral thekal keseye kadar.', dose: craniospinal, margin: 'MRI/CT miyelografi, kemik anatomisi ve büyüme plaklarına göre; günlük IGRT ile' },
  { name: 'GTV', description: 'Rezidüel posterior fossa yatağı, metastatik nodül veya relaps lezyonu.', dose: boost, margin: 'Postoperatif MRI, cerrahi kavite, tümör yatağı ve füzyon görüntülerine göre' },
  { name: 'PTV', description: 'CSI ve tümör yatağı boost hacimlerinin immobilizasyon, doz hesaplama ve kurulum belirsizliği.', dose: boost, margin: 'IMRT/VMAT/proton tedavisinde tipik 3-5 mm; merkez protokolü ve IGRT ile' },
];

const oars: OARConstraint[] = [
  { organ: 'Cochlea', metric: 'Dmean', limit: 35, unit: 'Gy', priority: 'optimal', source: 'protocol', sourceReference: 'Pediatric medulloblastoma hearing preservation objective' },
  { organ: 'Hypothalamus', metric: 'Dmean', limit: 20, unit: 'Gy', priority: 'optimal', source: 'protocol', sourceReference: 'Pediatric CSI neuroendocrine objective' },
  { organ: 'Pituitary', metric: 'Dmean', limit: 20, unit: 'Gy', priority: 'optimal', source: 'protocol', sourceReference: 'Pediatric CSI endocrine objective' },
  { organ: 'Optic pathways', metric: 'Dmax', limit: 54, unit: 'Gy', priority: 'mandatory', source: 'QUANTEC', sourceReference: 'CNS tumor radiotherapy objective' },
  { organ: 'Brainstem', metric: 'Dmax', limit: 54, unit: 'Gy', priority: 'mandatory', source: 'QUANTEC', sourceReference: 'Posterior fossa boost objective' },
  { organ: 'Spinal cord', metric: 'Dmax', limit: 45, unit: 'Gy', priority: 'mandatory', source: 'QUANTEC', sourceReference: 'Craniospinal irradiation objective' },
  { organ: 'Kidneys', metric: 'Dmean', limit: 18, unit: 'Gy', priority: 'optimal', source: 'protocol', sourceReference: 'Pediatric CSI renal objective' },
  { organ: 'Heart', metric: 'Dmean', limit: 15, unit: 'Gy', priority: 'optimal', source: 'protocol', sourceReference: 'Pediatric CSI cardiac objective' },
];

const systemic = (setting: SystemicTherapyRecommendation['setting'], regimen: string, agents: string[], timing: string, evidenceLevel: SystemicTherapyRecommendation['evidenceLevel'] = '1'): SystemicTherapyRecommendation => ({
  setting, regimen, agents, timing, evidenceLevel,
});
const references = (...extra: GuidelineReference[]): GuidelineReference[] => [NCCN, ASTRO, ESTRO, ...extra];

export class MedulloblastomaDecisionEngine extends BaseDecisionEngine<MedulloblastomaInput> {
  public readonly id = 'pediatric-age.medulloblastoma';
  public readonly version = '1.0.0';
  public readonly inputSchema = MEDULLOBLASTOMA_INPUT_JSON_SCHEMA;
  public readonly outputSchema = MEDULLOBLASTOMA_OUTPUT_JSON_SCHEMA;

  public constructor() {
    super('1.0.0');
  }

  protected evaluateCase(input: MedulloblastomaInput): CDSSResult {
    const recommendations: ClinicalRecommendation[] = [];
    const rationale: string[] = [];
    const warnings: string[] = [];
    let rtIndication: CDSSResult['rtIndication'] = 'indicated';
    let intent: CDSSResult['intent'] = 'curative';
    const infant = input.ageYears !== undefined && input.ageYears < 3;
    const highRisk = input.riskGroup === 'high-risk' || input.metastaticDisease === true || input.csfPositive === true || input.residualTumorMm !== undefined && input.residualTumorMm > 1 || input.diffuseAnaplasia === true;

    if (input.hydrocephalus) warnings.push('Hidrosefali mevcut; nöroşirürji ile BOS diversiyonu, perioperatif güvenlik ve RT planlama zamanlaması değerlendirilmelidir.');
    if (input.priorCraniospinalRT) warnings.push('Önceki CSI mevcut; yeniden ışınlama yalnızca kümülatif beyin, beyin sapı, spinal kord, optik yollar ve büyüme/işitme organ dozlarıyla uzman merkezde düşünülmelidir.');
    if (input.molecularGroup === 'WNT-activated') rationale.push('WNT-aktive tümörlerde biyolojik olarak daha iyi prognoz görülebilir; doz azaltma yalnızca uygun pediatrik protokol veya klinik çalışma kapsamında değerlendirilmelidir.');
    if (input.molecularGroup === 'SHH-activated') rationale.push('SHH grubu için TP53 durumu, yaş ve hedeflenebilir yolaklar moleküler tümör kurulunda değerlendirilmelidir; RT dozu tek başına moleküler sonuçla azaltılmamalıdır.');
    if (input.csfPositive || input.metastaticDisease) warnings.push('Pozitif BOS veya metastatik hastalıkta beyin/spinal MRI, BOS sitolojisi ve M evresi tamamlanmadan boost/CSI hacmi kesinleştirilmemelidir.');

    if (input.setting === 'newly-diagnosed' || input.setting === 'postoperative') {
      if (infant || input.riskGroup === 'infant-young-child') {
        recommendations.push({
          id: 'infant-medulloblastoma',
          label: 'Üç yaş altı medulloblastomda RT erteleme/azaltma protokolü ve yoğun kemoterapi',
          indication: 'conditional',
          intent: 'curative',
          systemicTherapy: [systemic('adjuvant', 'RT erteleme veya doz azaltma amacıyla pediatrik yoğun kemoterapi protokolü', ['yüksek doz metotreksat içeren kurum/protokol rejimi', 'otolog kök hücre desteği seçilmiş olguda'], 'Tam rezeksiyon/rezidü, moleküler grup ve metastatik duruma göre pediatrik onkoloji ile', '1')],
          rationale: [
            'Üç yaş altındaki çocuklarda nörogelişimsel ve endokrin toksisiteyi azaltmak için CSI sıklıkla ertelenir; bu yaklaşım yalnızca deneyimli pediatrik onkoloji protokolleriyle uygulanmalıdır.',
            'Cerrahi rezeksiyon güvenli maksimum düzeyde yapılmalı; rezidüel hastalık ve BOS/MRI evrelemesi tedavi riskini belirler.',
            'RT gerekli hale gelirse proton veya dikkatli IMRT ile koklea, hipotalamus, hipofiz, kalp ve böbrek dozları azaltılmalıdır.',
          ],
          guidelineReferences: references(TRIALS[2], TRIALS[3]),
        });
        rtIndication = 'conditional';
        intent = 'curative';
      } else {
        const csi = fraction(highRisk ? 36 : 23.4, highRisk ? 20 : 13, 'conventional', highRisk ? '36 Gy / 20 fx CSI; yüksek risk veya metastatik hastalık' : '23.4 Gy / 13 fx CSI; ortalama risk');
        const boost = fraction(54, 30, 'conventional', 'Posterior fossa/tümör yatağı toplam 54 Gy; CSI sonrası boost');
        recommendations.push({
          id: 'newly-diagnosed-medulloblastoma',
          label: highRisk ? 'Yüksek risk medulloblastom: CSI + posterior fossa/tümör yatağı boost + adjuvan kemoterapi' : 'Ortalama risk medulloblastom: azaltılmış CSI + boost + adjuvan kemoterapi',
          indication: 'indicated',
          intent: 'curative',
          fractionation: csi,
          targetVolumes: targets(csi, boost),
          oarConstraints: oars,
          systemicTherapy: [systemic('adjuvant', 'Risk uyumlu pediatrik medulloblastom kemoterapisi', ['cisplatin', 'vincristine', 'cyclophosphamide', 'lomustine veya protokole uygun alternatif'], 'RT sırasında ve sonrasında COG/SIOP protokolüne göre', '1')],
          rationale: [
            'Standart tedavi güvenli maksimum cerrahi, patolojik/moleküler risk ve BOS/MRI evrelemesi sonrası CSI, primer yatak/posterior fossa boost ve adjuvan kemoterapidir.',
            'ACNS0331 ve SIOP-PNET5-MB ortalama risk hastalıkta azaltılmış CSI yaklaşımlarını; ACNS0332 yüksek risk hastalıkta risk uyumlu tedaviyi destekler.',
            'Elektif nodal ışınlama veya torasik 60-66 Gy kemoradyoterapi medulloblastom için uygun değildir; tüm nöroaksial subaraknoid boşluk CSI ile kapsanır.',
          ],
          guidelineReferences: references(TRIALS[0], TRIALS[1], TRIALS[2], TRIALS[3]),
        });
        rtIndication = 'indicated';
        intent = 'curative';
      }
    } else if (input.setting === 'relapsed' || input.setting === 'metastatic') {
      const focal = fraction(30, 10, 'conventional', '30 Gy / 10 fx; seçilmiş fokal relaps veya semptomatik metastaz');
      recommendations.push({
        id: 'relapsed-medulloblastoma',
        label: 'Relaps/metastatik medulloblastomda yeniden evreleme, kurtarma tedavisi ve seçilmiş fokal RT',
        indication: input.relapseSite === 'local' || input.spineMetastases ? 'indicated' : 'conditional',
        intent: 'salvage',
        fractionation: input.relapseSite === 'local' || input.spineMetastases ? focal : undefined,
        targetVolumes: input.relapseSite === 'local' || input.spineMetastases ? targets(focal, focal) : undefined,
        oarConstraints: oars,
        systemicTherapy: [systemic('palliative', 'Relaps medulloblastom için pediatrik kurtarma kemoterapisi/klinik çalışma', ['protokole uygun yüksek doz kemoterapi', 'otolog kök hücre desteği seçilmiş olguda'], 'Moleküler grup, önceki CSI, relaps paterni ve organ fonksiyonuna göre', '2A')],
        rationale: [
          'Relaps hastalıkta kontrastlı beyin ve tüm spinal MRI, BOS sitolojisi ve önceki RT planlarının incelenmesi zorunludur.',
          'Daha önce CSI almamış seçilmiş olguda kurtarma CSI; daha önce ışınlanmış hastada fokal re-irradiation veya stereotaktik yaklaşım yalnızca uzman pediatrik merkezde değerlendirilir.',
          'Sistemik tedavi ve klinik çalışma çoğu relaps senaryosunda temel bileşendir; cerrahi yalnızca güvenli ve anlamlı sitoredüksiyon sağlayacak sınırlı relapslarda düşünülür.',
        ],
        guidelineReferences: references(TRIALS[1], TRIALS[2], TRIALS[4]),
      });
      rtIndication = input.relapseSite === 'local' || input.spineMetastases ? 'indicated' : 'conditional';
      intent = 'salvage';
    } else {
      rtIndication = 'not-indicated';
      intent = 'observation';
      recommendations.push({
        id: 'medulloblastoma-surveillance',
        label: 'Aktif RT vermeden yapılandırılmış pediatrik onkoloji ve nörogelişimsel takip',
        indication: 'not-indicated',
        intent: 'observation',
        rationale: ['Remisyon veya tedavi sonrası dönemde rutin RT yerine protokole uygun beyin/spinal MRI, BOS gereksinimi, işitme, endokrin, nörokognitif ve büyüme izlemi yapılmalıdır.'],
        guidelineReferences: references(TRIALS[0]),
      });
    }
    rationale.push('Medulloblastomda karar; güvenli rezeksiyon, BOS/MRI evrelemesi, yaş, metastatik durum ve WNT/SHH/grup 3/grup 4 moleküler sınıflamasının pediatrik nöro-onkoloji MDT tarafından birlikte yorumlanmasına dayanır.');
    return {
      schemaVersion: '1.0',
      engineId: this.id,
      engineVersion: this.version,
      caseId: input.caseId,
      organSystem: 'cns',
      rtIndication,
      intent,
      summary: recommendations[0]?.label ?? 'Medulloblastom için pediatrik nöro-onkoloji MDT değerlendirmesi gerekir.',
      recommendations,
      rationale,
      warnings,
      uncertainties: ['Aktif NCCN/ASTRO/ESTRO sürümü, yaş, cerrahi rezidü, CSF sitolojisi, beyin/tüm spinal MRI, moleküler alt grup, önceki RT/kemoterapi ve protokol uygunluğu doğrulanmalıdır.'],
      confidence: 0.9,
      guidelineReferences: references(...TRIALS),
    };
  }
}

export const medulloblastomaEngine = new MedulloblastomaDecisionEngine();
