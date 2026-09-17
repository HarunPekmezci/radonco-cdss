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

export type SCLCStage = 'limited-stage' | 'extensive-stage' | 'recurrent' | 'unknown';
export type SCLCResectability = 'resectable' | 'unresectable' | 'not-applicable' | 'unknown';
export type SCLCResponse = 'complete' | 'partial' | 'stable' | 'progressive' | 'unknown';
export type SCLCMolecularFinding = 'DLL3-high' | 'no-actionable-alteration' | 'unknown';

export interface SCLCInput extends ClinicalCaseInput {
  organSystem: 'thorax';
  disease: 'small-cell-lung-cancer';
  stage: SCLCStage;
  tnm?: TNMStage;
  resectability?: SCLCResectability;
  mediastinalStaging?: 'not-done' | 'negative' | 'positive' | 'indeterminate';
  responseToInitialTherapy?: SCLCResponse;
  performanceStatusECOG?: number;
  brainMRICompleted?: boolean;
  brainMetastases?: boolean;
  pleuralEffusion?: 'none' | 'ipsilateral' | 'contralateral' | 'malignant' | 'unknown';
  bulkyDisease?: boolean;
  priorThoracicRT?: boolean;
  priorPCI?: boolean;
  molecularFinding?: SCLCMolecularFinding;
  immunotherapyContraindicated?: boolean;
  thoracicSymptoms?: string[];
}

const NCCN: GuidelineReference = {
  organization: 'NCCN',
  title: 'NCCN Clinical Practice Guidelines in Oncology: Small Cell Lung Cancer',
  version: 'Current version; verify institutional subscription before use',
  url: 'https://www.nccn.org/guidelines/guidelines-detail?category=1&id=1462',
  evidenceLevel: '2A',
};

const ASTRO: GuidelineReference = {
  organization: 'ASTRO',
  title: 'ASTRO Clinical Practice Guideline: Radiation Therapy for Small Cell Lung Cancer',
  url: 'https://www.practicalradonc.org/article/S1879-355X(19)30085-3/fulltext',
  evidenceLevel: 'A',
};

const ESTRO: GuidelineReference = {
  organization: 'ESTRO',
  title: 'ESTRO guidance and recommendations for lung cancer radiotherapy',
  url: 'https://www.estro.org/Science/Guidelines',
  evidenceLevel: 'B',
};

const CONVERT: GuidelineReference = {
  organization: 'other',
  title: 'CONVERT: once-daily versus twice-daily concurrent chemoradiotherapy in limited-stage SCLC',
  url: 'https://doi.org/10.1016/S0140-6736(17)32188-4',
  evidenceLevel: '1',
};

const CREST: GuidelineReference = {
  organization: 'other',
  title: 'CREST: thoracic radiotherapy in extensive-stage SCLC responders',
  url: 'https://doi.org/10.1016/S0140-6736(14)62048-8',
  evidenceLevel: '1',
};

const ADRIATIC: GuidelineReference = {
  organization: 'other',
  title: 'ADRIATIC: consolidation durvalumab after chemoradiotherapy in limited-stage SCLC',
  url: 'https://clinicaltrials.gov/study/NCT03703297',
  evidenceLevel: '1',
};

const REFERENCES = [NCCN, ASTRO, ESTRO, CONVERT, CREST, ADRIATIC];

export const SCLC_INPUT_JSON_SCHEMA: JsonSchema = {
  $schema: 'http://json-schema.org/draft-07/schema#',
  $id: 'https://radonco.local/schema/sclc-input.json',
  title: 'Small-cell lung cancer clinical case input',
  type: 'object',
  required: ['organSystem', 'disease', 'stage'],
  properties: {
    organSystem: { type: 'string', enum: ['thorax'] },
    disease: { type: 'string', enum: ['small-cell-lung-cancer'] },
    stage: { type: 'string', enum: ['limited-stage', 'extensive-stage', 'recurrent', 'unknown'] },
    tnm: { type: 'object', additionalProperties: true },
    resectability: { type: 'string', enum: ['resectable', 'unresectable', 'not-applicable', 'unknown'] },
    mediastinalStaging: { type: 'string', enum: ['not-done', 'negative', 'positive', 'indeterminate'] },
    responseToInitialTherapy: { type: 'string', enum: ['complete', 'partial', 'stable', 'progressive', 'unknown'] },
    performanceStatusECOG: { type: 'number' },
    brainMRICompleted: { type: 'boolean' },
    brainMetastases: { type: 'boolean' },
    pleuralEffusion: { type: 'string', enum: ['none', 'ipsilateral', 'contralateral', 'malignant', 'unknown'] },
    bulkyDisease: { type: 'boolean' },
    priorThoracicRT: { type: 'boolean' },
    priorPCI: { type: 'boolean' },
    molecularFinding: { type: 'string', enum: ['DLL3-high', 'no-actionable-alteration', 'unknown'] },
    immunotherapyContraindicated: { type: 'boolean' },
    thoracicSymptoms: { type: 'array', items: { type: 'string' } },
  },
  additionalProperties: true,
};

export const SCLC_OUTPUT_JSON_SCHEMA: JsonSchema = {
  $schema: 'http://json-schema.org/draft-07/schema#',
  $id: 'https://radonco.local/schema/sclc-result.json',
  title: 'Small-cell lung cancer CDSS result',
  type: 'object',
  required: ['schemaVersion', 'engineId', 'engineVersion', 'organSystem', 'rtIndication', 'intent', 'summary', 'recommendations'],
  properties: {
    schemaVersion: { type: 'string', enum: ['1.0'] },
    engineId: { type: 'string', enum: ['thorax.sclc'] },
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

const dose = (
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

const targets = (radiationDose: Fractionation, includePCI = false): TargetVolume[] => [
  {
    name: 'GTV',
    description: 'Başlangıç PET/BT ve kontrastlı BT ile tanımlanan primer ve involved nodal hastalık; yanıt sonrası yalnızca rezidü değil başlangıç hacmi referans alınır.',
    dose: radiationDose,
    margin: 'Görüntülenebilir hastalık',
  },
  {
    name: 'CTV',
    description: 'GTV/ITV çevresinde mikroskopik yayılım ve seçilmiş involved nodal istasyonlar.',
    dose: radiationDose,
    margin: 'Yaklaşık 5-10 mm; anatomik bariyerler ve günlük görüntüleme ile uyarlanır',
  },
  {
    name: 'PTV',
    description: 'Solunum hareketi ve kurulum belirsizliği için ITV/CTV üzerine planlama marjı.',
    dose: radiationDose,
    margin: '4D-CT ve IGRT protokolüne göre genellikle 5-10 mm',
  },
  ...(includePCI
    ? [{
        name: 'CTV',
        description: 'Profilaktik kraniyal ışınlama için tüm beyin hacmi.',
        dose: dose(25, 10, 'conventional', 'PCI 25 Gy / 10 fx'),
        margin: 'Tüm beyin; lens ve hipokampus koruma protokolü kurum ve klinik çalışmaya göre',
      }]
    : []),
];

const oars: OARConstraint[] = [
  { organ: 'Total lung minus GTV/ITV', metric: 'V20', limit: 30, unit: '%', priority: 'mandatory', source: 'QUANTEC', sourceReference: 'QUANTEC lung pneumonitis' },
  { organ: 'Total lung minus GTV/ITV', metric: 'Dmean', limit: 20, unit: 'Gy', priority: 'optimal', source: 'QUANTEC', sourceReference: 'QUANTEC lung pneumonitis' },
  { organ: 'Esophagus', metric: 'Dmean', limit: 34, unit: 'Gy', priority: 'optimal', source: 'QUANTEC', sourceReference: 'QUANTEC esophageal toxicity' },
  { organ: 'Esophagus', metric: 'V60', limit: 17, unit: '%', priority: 'optimal', source: 'QUANTEC', sourceReference: 'QUANTEC esophageal toxicity' },
  { organ: 'Heart', metric: 'Dmean', limit: 26, unit: 'Gy', priority: 'optimal', source: 'QUANTEC', sourceReference: 'QUANTEC cardiac toxicity' },
  { organ: 'Heart', metric: 'V30', limit: 46, unit: '%', priority: 'optimal', source: 'QUANTEC', sourceReference: 'QUANTEC cardiac toxicity' },
  { organ: 'Heart', metric: 'V50', limit: 25, unit: '%', priority: 'optimal', source: 'protocol', sourceReference: 'Institutional/NRG planning objective' },
  { organ: 'Spinal cord', metric: 'Dmax', limit: 50, unit: 'Gy', priority: 'mandatory', source: 'QUANTEC', sourceReference: 'QUANTEC spinal cord myelopathy' },
  { organ: 'Brachial plexus', metric: 'Dmax', limit: 66, unit: 'Gy', priority: 'mandatory', source: 'protocol', sourceReference: 'Thoracic RT protocol; account for fractionation and prior RT' },
];

const therapy = (
  setting: SystemicTherapyRecommendation['setting'],
  regimen: string,
  agents: string[],
  timing: string,
  evidenceLevel: SystemicTherapyRecommendation['evidenceLevel'] = '1',
): SystemicTherapyRecommendation => ({ setting, regimen, agents, timing, evidenceLevel });

export class SCLCDecisionEngine extends BaseDecisionEngine<SCLCInput> {
  public readonly id = 'thorax.sclc';
  public readonly version = '1.0.0';
  public readonly inputSchema = SCLC_INPUT_JSON_SCHEMA;
  public readonly outputSchema = SCLC_OUTPUT_JSON_SCHEMA;

  public constructor() {
    super('1.0.0');
  }

  protected evaluateCase(input: SCLCInput): CDSSResult {
    const recommendations: ClinicalRecommendation[] = [];
    const rationale: string[] = [];
    const warnings: string[] = [];
    let rtIndication: CDSSResult['rtIndication'] = 'conditional';
    let intent: CDSSResult['intent'] = 'curative';

    if (!input.brainMRICompleted) {
      warnings.push('Başlangıçta kontrastlı beyin MR tamamlanmamış; PCI veya beyin metastazı yönetimi kararı öncesi tamamlanmalıdır.');
    }
    if (input.priorThoracicRT) {
      warnings.push('Önceki torasik RT nedeniyle kümülatif akciğer, özofagus, kalp, medulla ve brakial pleksus dozları hesaplanmalıdır.');
    }
    if (input.stage === 'limited-stage') {
      const thoracicDose = dose(45, 30, 'conventional', '45 Gy / 30 fx BID, günde 2 fx');
      const systemicTherapy = [
        therapy('concurrent', 'Platin-etoposid ile eşzamanlı torasik KRT', ['cisplatin + etoposide veya carboplatin + etoposide'], 'RT tercihen ilk kemoterapi siklusunda, mümkün olduğunca erken başlatılır'),
        ...(input.responseToInitialTherapy === 'complete' || input.responseToInitialTherapy === 'partial'
          ? [therapy('maintenance', 'Konsolidasyon immünoterapisi değerlendirmesi', ['durvalumab'], 'KRT ve platin-etoposid sonrası progresyon yoksa, uygunluk ve güncel ruhsat/kurum protokolüne göre', '1')]
          : []),
      ];
      recommendations.push({
        id: 'limited-stage-concurrent-chemoradiation',
        label: 'Sınırlı evre: eşzamanlı torasik KRT',
        indication: 'indicated',
        intent: 'curative',
        fractionation: thoracicDose,
        targetVolumes: targets(thoracicDose),
        oarConstraints: oars,
        systemicTherapy,
        rationale: [
          'Sınırlı evre KHAK’ta platin-etoposid ile eşzamanlı torasik RT standart küratif yaklaşımdır.',
          '45 Gy / 30 fx BID, erken başlama ve sıkı normal doku planlama hedefleri ASTRO/NCCN ile uyumludur; CONVERT çalışması 66 Gy QD’nin 45 Gy BID’ye üstünlüğünü göstermemiştir.',
          'ENI rutin değildir; başlangıç PET/BT, BT ve gerektiğinde patolojik mediastinal evrelemeye dayalı involved-field tedavi tercih edilir.',
          'CTV yalnızca kemoterapi sonrası küçülen rezidüel kitleye indirgenmemeli; başlangıç hastalık hacmi ve mikroskopik yayılım riski birlikte değerlendirilmelidir.',
        ],
        guidelineReferences: [NCCN, ASTRO, ESTRO, CONVERT, ADRIATIC],
      });
      recommendations.push({
        id: 'limited-stage-pci',
        label: 'Yanıt sonrası profilaktik kraniyal ışınlama',
        indication: input.priorPCI ? 'not-indicated' : input.brainMetastases ? 'not-indicated' : 'consider',
        intent: 'prophylactic',
        fractionation: dose(25, 10, 'conventional', '25 Gy / 10 fx'),
        targetVolumes: targets(dose(25, 10, 'conventional', '25 Gy / 10 fx'), true),
        rationale: [
          'Küratif tedavi sonrası tam veya kısmi yanıt veren, beyin MR’ı negatif uygun hastada PCI; yaş, nörobilişsel risk, MR ile yakın izlem ve hasta tercihleriyle birlikte tartışılır.',
          'Beyin metastazı varsa PCI yerine terapötik kraniyal RT/SRS veya WBRT değerlendirilir.',
        ],
        guidelineReferences: [NCCN, ASTRO],
      });
      rtIndication = 'indicated';
      rationale.push(input.resectability === 'resectable'
        ? 'KHAK’ta cerrahi yalnızca çok seçilmiş klinik T1-2N0 olgularda, invaziv mediastinal evreleme ve lobektomi sonrası adjuvan platin-etoposid ile düşünülebilir; çoğu sınırlı evre hastada KRT önceliklidir.'
        : 'R0 rezeksiyon olasılığı, mediastinal evreleme ve multidisipliner kurul değerlendirmesi olmadan varsayılamaz; R1/R2 veya pozitif mediastinal nodlarda cerrahi dışı multimodal yaklaşım gerekir.');
      if (input.molecularFinding === 'DLL3-high') {
        rationale.push('DLL3 ekspresyonu klinik çalışma/immünoterapi seçimini etkileyebilir; rutin hedefe yönelik tedavi yerine güncel kılavuz ve klinik çalışma uygunluğu değerlendirilmelidir.');
      }
    } else if (input.stage === 'extensive-stage') {
      intent = 'palliative';
      const systemicTherapy = [
        therapy('induction', 'Platin-etoposid + PD-L1 inhibitörü', ['atezolizumab veya durvalumab', 'cisplatin/carboplatin + etoposide'], 'İlk sıra sistemik tedavi; immünoterapi kontrendikasyonunda platin-etoposid', '1'),
      ];
      if (input.responseToInitialTherapy === 'complete' || input.responseToInitialTherapy === 'partial') {
        recommendations.push({
          id: 'extensive-stage-consolidative-thoracic-rt',
          label: 'Yanıt veren yaygın evrede seçilmiş konsolidatif torasik RT',
          indication: 'consider',
          intent: 'palliative',
          fractionation: dose(30, 10, 'moderate-hypofractionation', '30 Gy / 10 fx'),
          targetVolumes: targets(dose(30, 10, 'moderate-hypofractionation', '30 Gy / 10 fx')),
          oarConstraints: oars,
          systemicTherapy,
          rationale: [
            'Yaygın evrede rutin torasik RT yerine, iyi yanıt veren ve rezidüel torasik hastalığı bulunan seçilmiş hastalarda konsolidatif RT düşünülebilir.',
            'CREST çalışması bu yaklaşımın seçilmiş yanıt veren hastalarda torasik kontrol katkısını destekler; hasta seçimi, semptom, tümör yükü ve OAR dozları kritiktir.',
            'ENI önerilmez; başlangıç ve yanıt sonrası görüntüleme ile involved-field yaklaşımı kullanılır.',
          ],
          guidelineReferences: [NCCN, ASTRO, ESTRO, CREST],
        });
      }
      recommendations.push({
        id: 'extensive-stage-systemic-and-palliative-rt',
        label: 'Yaygın evre: sistemik tedavi ve semptom odaklı RT',
        indication: 'indicated',
        intent: 'palliative',
        systemicTherapy,
        rationale: [
          'Yaygın evrede sistemik tedavi omurgadır; RT hemoptizi, ağrı, hava yolu/vena cava basısı, spinal kord basısı veya beyin metastazlarında palyatif/ablative amaçla kullanılır.',
          'Beyin metastazında semptom, sayı, hacim, performans ve ekstrakraniyal kontrola göre SRS, WBRT veya destek tedavisi seçilir.',
        ],
        guidelineReferences: [NCCN, ASTRO, ESTRO],
      });
      if (input.immunotherapyContraindicated) {
        warnings.push('İmmünoterapi kontrendike olarak işaretlenmiş; platin-etoposid tek başına veya klinik çalışma seçeneği medikal onkoloji tarafından değerlendirilmelidir.');
      }
      rtIndication = input.thoracicSymptoms?.length ? 'indicated' : 'conditional';
      rationale.push('Mediastinal evreleme ve rezekabilite yaygın evrede genellikle RT kararını değiştirmez; yine de seçilmiş oligometastatik/oligoprogresif tablolar için MDT değerlendirmesi gerekir.');
    } else {
      intent = 'palliative';
      rtIndication = 'conditional';
      recommendations.push({
        id: 'recurrent-sclc',
        label: 'Nüks KHAK: semptomatik veya oligoprogresif odaklara RT',
        indication: 'conditional',
        intent: 'palliative',
        rationale: [
          'Nüks zamanı, önceki tedaviye duyarlılık, nüks alanı, kümülatif doz ve sistemik seçeneklere göre yeniden ışınlama veya palyatif RT düşünülebilir.',
          'Erken nüks ve progresif hastalıkta sistemik tedavi/klinik çalışma önceliklidir; RT semptom kontrolü ve seçilmiş oligoprogresyonda kullanılır.',
        ],
        guidelineReferences: [NCCN, ASTRO, ESTRO],
      });
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
      uncertainties: input.stage === 'unknown' ? ['KHAK evresi sınıflandırılmamış.'] : undefined,
      confidence: input.stage === 'unknown' || !input.brainMRICompleted ? 0.72 : 0.87,
      generatedAt: new Date().toISOString(),
      guidelineReferences: REFERENCES,
    };
  }

  private summary(input: SCLCInput): string {
    if (input.stage === 'limited-stage') return 'Sınırlı evre KHAK: platin-etoposid ile eşzamanlı torasik KRT ve uygun yanıt sonrası PCI/immünoterapi değerlendirmesi.';
    if (input.stage === 'extensive-stage') return 'Yaygın evre KHAK: platin-etoposid tabanlı sistemik tedavi, uygun hastada konsolidatif torasik RT ve semptom odaklı RT.';
    if (input.stage === 'recurrent') return 'Nüks KHAK: sistemik tedavi/klinik çalışma ve seçilmiş semptomatik veya oligoprogresif odaklara RT.';
    return 'KHAK evresi netleşmemiş: beyin MR, PET/BT ve uygun mediastinal değerlendirme sonrası karar verilmelidir.';
  }
}

export const sclcEngine = new SCLCDecisionEngine();

export default sclcEngine;
