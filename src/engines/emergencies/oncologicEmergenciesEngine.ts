import { BaseDecisionEngine } from '../base-engine';
import type {
  CDSSResult, ClinicalCaseInput, ClinicalRecommendation, Fractionation,
  GuidelineReference, JsonSchema, TargetVolume,
} from '../../types/cdss';

export type OncologicEmergencyScenario =
  | 'spinal-cord-compression'
  | 'superior-vena-cava-syndrome'
  | 'acute-airway-obstruction'
  | 'major-hemorrhage'
  | 'raised-intracranial-pressure';

export interface OncologicEmergenciesInput extends ClinicalCaseInput {
  organSystem: 'emergencies';
  disease: 'oncologic-emergencies';
  scenario: OncologicEmergencyScenario;
  surgicalCandidate?: boolean;
  singleLevelDisease?: boolean;
  goodPerformanceStatus?: boolean;
  expectedSurvivalMonths?: number;
  neurologicDeficitDurationHours?: number;
  spinalInstability?: boolean;
  poorPrognosis?: boolean;
  airwayCompromise?: boolean;
  hemodynamicInstability?: boolean;
  priorRadiotherapy?: boolean;
}

const SCENARIOS: OncologicEmergencyScenario[] = [
  'spinal-cord-compression',
  'superior-vena-cava-syndrome',
  'acute-airway-obstruction',
  'major-hemorrhage',
  'raised-intracranial-pressure',
];

export const ONCOLOGIC_EMERGENCIES_INPUT_JSON_SCHEMA: JsonSchema = {
  $schema: 'http://json-schema.org/draft-07/schema#',
  $id: 'https://radonco.local/schema/oncologic-emergencies-input.json',
  title: 'Oncologic emergency radiotherapy case input',
  type: 'object',
  required: ['organSystem', 'disease', 'scenario'],
  properties: {
    organSystem: { type: 'string', enum: ['emergencies'] },
    disease: { type: 'string', enum: ['oncologic-emergencies'] },
    scenario: { type: 'string', enum: SCENARIOS },
    surgicalCandidate: { type: 'boolean' },
    singleLevelDisease: { type: 'boolean' },
    goodPerformanceStatus: { type: 'boolean' },
    expectedSurvivalMonths: { type: 'number' },
    neurologicDeficitDurationHours: { type: 'number' },
    spinalInstability: { type: 'boolean' },
    poorPrognosis: { type: 'boolean' },
    airwayCompromise: { type: 'boolean' },
    hemodynamicInstability: { type: 'boolean' },
    priorRadiotherapy: { type: 'boolean' },
  },
  additionalProperties: true,
};

export const ONCOLOGIC_EMERGENCIES_OUTPUT_JSON_SCHEMA: JsonSchema = {
  $schema: 'http://json-schema.org/draft-07/schema#',
  $id: 'https://radonco.local/schema/oncologic-emergencies-result.json',
  title: 'Oncologic emergency radiotherapy CDSS result',
  type: 'object',
  required: ['schemaVersion', 'engineId', 'engineVersion', 'organSystem', 'rtIndication', 'intent', 'summary', 'recommendations'],
  properties: {
    schemaVersion: { type: 'string', enum: ['1.0'] },
    engineId: { type: 'string', enum: ['emergencies.oncologic-emergencies'] },
    engineVersion: { type: 'string' },
    organSystem: { type: 'string', enum: ['emergencies'] },
    rtIndication: { type: 'string' },
    intent: { type: 'string' },
    summary: { type: 'string' },
    recommendations: { type: 'array', items: { type: 'object', additionalProperties: true } },
    warnings: { type: 'array', items: { type: 'string' } },
    guidelineReferences: { type: 'array', items: { type: 'object', additionalProperties: true } },
  },
  additionalProperties: true,
};

const NICE: GuidelineReference = {
  organization: 'other',
  title: 'NICE guideline: spinal metastases and metastatic spinal cord compression',
  url: 'https://www.nice.org.uk/guidance/ng234',
  evidenceLevel: 'A',
};
const ASTRO: GuidelineReference = {
  organization: 'ASTRO',
  title: 'ASTRO clinical practice guideline: bone metastases and palliative external beam radiotherapy',
  url: 'https://www.astro.org/Patient-Care-and-Research/Clinical-Practice-Statements/Clinical-Practice-Guidelines',
  evidenceLevel: 'A',
};
const PATCHELL: GuidelineReference = {
  organization: 'other',
  title: 'Direct decompressive surgical resection in the treatment of spinal cord compression caused by metastatic cancer',
  url: 'https://doi.org/10.1056/NEJMoa030471',
  evidenceLevel: '1',
};
const references: GuidelineReference[] = [NICE, PATCHELL, ASTRO];

const makeFractionation = (totalDoseGy: number, fractions: number, schedule: string): Fractionation => ({
  class: fractions === 1 ? 'single-fraction' : 'moderate-hypofractionation',
  totalDoseGy,
  fractions,
  dosePerFractionGy: totalDoseGy / fractions,
  schedule,
  technique: 'IGRT',
  alphaBetaTumor: 10,
  bedGy: totalDoseGy * (1 + totalDoseGy / fractions / 10),
  eqd2Gy: totalDoseGy * ((totalDoseGy / fractions + 10) / 12),
});

const targetVolumes = (
  anatomy: string,
  dose: Fractionation,
  ctv: string,
  ptv: string,
): TargetVolume[] => [
  { name: 'GTV', description: anatomy, dose, margin: 'Görüntüleme ve acil klinik bulgularla tanımlanır.' },
  { name: 'CTV', description: ctv, dose, margin: 'Anatomik yayılım ve organ hareketine göre; elektif nodal hacim rutin eklenmez.' },
  { name: 'PTV', description: ptv, dose, margin: 'İmmobilizasyon, hareket yönetimi ve günlük görüntü kılavuzluğuna göre.' },
];

const recommendation = (
  id: string,
  label: string,
  dose: Fractionation,
  volumes: TargetVolume[],
  rationale: string[],
): ClinicalRecommendation => ({
  id,
  label,
  indication: 'indicated',
  intent: 'palliative',
  fractionation: dose,
  targetVolumes: volumes,
  rationale,
  guidelineReferences: references,
});

export class OncologicEmergenciesDecisionEngine extends BaseDecisionEngine<OncologicEmergenciesInput> {
  public readonly id = 'emergencies.oncologic-emergencies';
  public readonly version = '1.0.0';
  public readonly inputSchema = ONCOLOGIC_EMERGENCIES_INPUT_JSON_SCHEMA;
  public readonly outputSchema = ONCOLOGIC_EMERGENCIES_OUTPUT_JSON_SCHEMA;

  public constructor() {
    super('1.0.0');
  }

  protected evaluateCase(input: OncologicEmergenciesInput): CDSSResult {
    const recommendations: ClinicalRecommendation[] = [];
    const warnings = [
      'Acil stabilizasyon ve ilgili uzmanlık değerlendirmesi RT planlamasıyla eşzamanlı yürütülmeli; RT hava yolu, cerrahi dekompresyon veya resüsitasyonu geciktirmemelidir.',
    ];
    if (input.priorRadiotherapy) {
      warnings.push('Önceki RT planı ve kümülatif dozlar doğrulanmadan yeniden ışınlama uygulanmamalıdır.');
    }

    switch (input.scenario) {
      case 'spinal-cord-compression': {
        const surgeryPreferred = input.surgicalCandidate === true
          && input.singleLevelDisease === true
          && input.goodPerformanceStatus === true
          && (input.expectedSurvivalMonths === undefined || input.expectedSurvivalMonths >= 3)
          && (input.neurologicDeficitDurationHours === undefined || input.neurologicDeficitDurationHours <= 48);
        const dose = surgeryPreferred
          ? makeFractionation(30, 10, '30 Gy / 10 fx; dekompresyon/stabilizasyon sonrası postoperatif RT')
          : makeFractionation(20, 5, '20 Gy / 5 fx; cerrahiye uygun olmayan veya nörolojik tehditte');
        const volumes = targetVolumes(
          'MRI ile tanımlanan vertebral metastaz ve epidural tümör uzanımı.',
          dose,
          'İlgili vertebra(lar), epidural hastalık ve gerekli komşu anatomik yayılım; cerrahi sonrası yatağa göre MRI/BT temelli konturlama.',
          'Spinal hareket ve set-up belirsizliği; günlük IGRT ile kurum protokolüne göre daraltılır.',
        );
        recommendations.push(recommendation(
          'mscc-emergency-rt',
          surgeryPreferred
            ? 'Deksametazon ve acil spinal cerrahi değerlendirmesi; seçilmiş hastada dekompresyon/stabilizasyon ardından postoperatif RT'
            : 'Deksametazon ve acil spinal cerrahi değerlendirmesi; cerrahi uygun değilse dekompresif RT',
          dose,
          volumes,
          [
            'Deksametazon 16 mg IV stat, ardından 4 mg IV/PO 6 saatte bir (toplam 16 mg/gün); nörolojik durum ve tedavi yanıtına göre azaltım planlanır.',
            'Patchell ölçütlerini göz önüne alın: tek seviyeli kompresyon, cerrahi olarak düzeltilebilir bası, iyi performans/yaşam beklentisi (genellikle en az 3 ay), kabul edilebilir nörolojik durum (tam parapleji süresi 48 saati aşmamış) ve stabilizasyon gereksinimi olan seçilmiş hastada dekompresif cerrahi + postoperatif RT lehinedir.',
            surgeryPreferred
              ? 'Cerrahi adayı, tek seviyeli hastalık ve cerrahi için uygun performans/prognoz bildirildi; acil dekompresyon/stabilizasyon sonrası 30 Gy / 10 fx RT planlanır.'
              : 'Cerrahiye uygun olmayan veya kısa prognozlu hastada 8 Gy/1 fx; uygun seçilmiş hastada 20 Gy/5 fx ya da 30 Gy/10 fx değerlendirilebilir.',
          ],
        ));
        if (!surgeryPreferred) {
          const singleDose = makeFractionation(8, 1, '8 Gy / 1 fx; seçilmiş, cerrahiye uygun olmayan hastada');
          const extendedDose = makeFractionation(30, 10, '30 Gy / 10 fx; uygun prognoz ve klinik durumda');
          recommendations.push(recommendation(
            'mscc-8gy-alternative',
            'Alternatif kısa şema: 8 Gy / 1 fx',
            singleDose,
            targetVolumes('MRI ile tanımlanan vertebral metastaz ve epidural uzanım.', singleDose, 'İlgili vertebral seviye ve epidural hastalık.', 'Günlük görüntü kılavuzluğuna göre.'),
            ['Nörolojik bulgu, instabilite, önceki RT ve yaşam beklentisi doğrulanarak seçilir.'],
          ));
          recommendations.push(recommendation(
            'mscc-30gy-alternative',
            'Alternatif şema: 30 Gy / 10 fx',
            extendedDose,
            targetVolumes('MRI ile tanımlanan vertebral metastaz ve epidural uzanım.', extendedDose, 'İlgili vertebral seviye ve epidural hastalık.', 'Günlük görüntü kılavuzluğuna göre.'),
            ['Kümülatif kord dozu ve prognoz göz önüne alınarak seçilir.'],
          ));
        }
        break;
      }
      case 'superior-vena-cava-syndrome': {
        const total = input.poorPrognosis ? 20 : 30;
        const fractions = input.poorPrognosis ? 5 : 10;
        const frontLoad = input.poorPrognosis
          ? '4 Gy/fx ilk 2 fraksiyonda, ardından toplam 20 Gy / 5 fx tamamlanır.'
          : '4 Gy/fx ilk 2 fraksiyonda, ardından kalan doz toplam 30 Gy / 10 fx olacak şekilde tamamlanır.';
        const dose = makeFractionation(total, fractions, `${frontLoad} (örnek; klinik yanıta göre uyarlanır)`);
        recommendations.push(recommendation(
          'svcs-front-loaded-rt',
          `Öne yüklemeli torasik RT: ${total} Gy / ${fractions} fx`,
          dose,
          targetVolumes(
            'Kontrastlı toraks BT/PET-BT ile tanımlanan vena kava superior obstrüksiyonuna neden olan primer kitle ve semptomatik nodal hastalık.',
            dose,
            'Makroskopik obstrüktif kitle ve anatomik komşuluğu; patoloji ve doku tanısı için uygun stabil hastada RT öncesi örnekleme planlanır.',
            'Solunum hareketi ve günlük IGRT dikkate alınarak oluşturulur.',
          ),
          [
            frontLoad,
            'Stridor, serebral ödem veya hemodinamik/solunumsal bozulmada hava yolu ve dolaşım stabilizasyonu; uygun hastada endovasküler stent ve histolojiye göre sistemik tedavi önceliği acilen değerlendirilir.',
          ],
        ));
        const alternativeDose = input.poorPrognosis
          ? makeFractionation(30, 10, '4 Gy/fx ilk 2 fraksiyonda, ardından kalan dozla toplam 30 Gy / 10 fx')
          : makeFractionation(20, 5, '4 Gy/fx ilk 2 fraksiyonda, ardından kalan dozla toplam 20 Gy / 5 fx');
        recommendations.push(recommendation(
          'svcs-alternative-rt',
          `Alternatif öne yüklemeli şema: ${alternativeDose.totalDoseGy} Gy / ${alternativeDose.fractions} fx`,
          alternativeDose,
          targetVolumes('VCSS obstrüksiyonuna neden olan makroskopik torasik kitle ve semptomatik nodlar.', alternativeDose, 'Obstrüktif kitle ve gerekli komşu anatomik yayılım.', 'Solunum hareketi ve günlük IGRT dikkate alınır.'),
          ['Öne yükleme ve toplam doz klinik yanıt, histoloji, prognoz ve sistemik tedavi seçeneklerine göre uyarlanır.'],
        ));
        break;
      }
      case 'acute-airway-obstruction': {
        const dose = makeFractionation(17, 2, '16-17 Gy / 2 fx; hızlı palyatif dekompresyon için seçilmiş olguda');
        recommendations.push(recommendation(
          'airway-obstruction-rt',
          'Akut hava yolu obstrüksiyonunda acil hava yolu güvenliği ve dekompresif RT',
          dose,
          targetVolumes(
            'BT/bronkoskopi ile belirlenen trakea, ana bronş veya karinayı daraltan makroskopik tümör.',
            dose,
            'Hava yolunu daraltan tümör hacmi ve doğrudan komşu ekstraluminal uzanım; elektif akciğer/nodal hacim eklenmez.',
            '4D-CT veya uygun solunum yönetimi ve günlük IGRT ile hava yolu hareketine göre.',
          ),
          [
            input.airwayCompromise
              ? 'Hava yolu tehdidi mevcut: anestezi, göğüs hastalıkları ve girişimsel bronkoskopi ile hava yolu güvenliği RT’den önce/eşzamanlı sağlanır.'
              : 'Stridor, hipoksemi veya asfiksi riski gelişirse anestezi, göğüs hastalıkları ve girişimsel bronkoskopi ile hava yolu güvenliği RT’den önce/eşzamanlı sağlanır.',
            'Alternatif şemalar: 8 Gy / 1 fx veya 20 Gy / 5 fx; 16-17 Gy / 2 fx hız ve klinik toleransa göre seçilebilir.',
          ],
        ));
        const singleDose = makeFractionation(8, 1, '8 Gy / 1 fx; frail hasta veya kısa prognozda');
        const fiveFxDose = makeFractionation(20, 5, '20 Gy / 5 fx; klinik olarak tolere edilebilen hastada');
        recommendations.push(recommendation(
          'airway-obstruction-8gy-alternative',
          'Alternatif kısa şema: 8 Gy / 1 fx',
          singleDose,
          targetVolumes('Trakea/karinayı daraltan makroskopik tümör.', singleDose, 'Semptomatik obstrüktif kitle.', 'Hareket ve set-up belirsizliğine göre.'),
          ['Hava yolu güvenliği ve bronkoskopik girişim gereksinimi önceliklidir.'],
        ));
        recommendations.push(recommendation(
          'airway-obstruction-20gy-alternative',
          'Alternatif şema: 20 Gy / 5 fx',
          fiveFxDose,
          targetVolumes('Trakea/karinayı daraltan makroskopik tümör.', fiveFxDose, 'Semptomatik obstrüktif kitle ve doğrudan komşu uzanım.', 'Hareket ve set-up belirsizliğine göre.'),
          ['Hava yolu güvenliği ve bronkoskopik girişim gereksinimi önceliklidir.'],
        ));
        break;
      }
      case 'major-hemorrhage': {
        const dose = input.poorPrognosis || input.hemodynamicInstability
          ? makeFractionation(8, 1, '8 Gy / 1 fx; hızlı hemostatik palyasyon')
          : makeFractionation(14.8, 4, '14.8 Gy / 4 fx BID; fraksiyonlar arasında en az 6 saat ara');
        recommendations.push(recommendation(
          'hemostatic-rt',
          `Masif tümör kanamasında hemostatik RT: ${dose.totalDoseGy} Gy / ${dose.fractions} fx`,
          dose,
          targetVolumes(
            'Kanama odağıyla ilişkili makroskopik tümör; hemoptizi, jinekolojik kanama veya hematüri odağına göre görüntüleme/endoskopi ile tanımlanır.',
            dose,
            'Kanayan tümör ve gerekli anatomik komşuluk; normal doku ve elektif nodal hacimler korunur.',
            'Kanama odağına uygun immobilizasyon, günlük IGRT ve gerekiyorsa mesane/organ dolum protokolü.',
          ),
          [
            input.hemodynamicInstability
              ? 'Hemodinamik instabilitede resüsitasyon, kan ürünü, girişimsel radyoloji/endoskopi ve ilgili cerrahi ekip önceliklidir; RT stabilizasyonu geciktirmemelidir.'
              : 'Hemostaz, transfüzyon gereksinimi ve kanama odağı ilgili uzmanlıkla eşzamanlı yönetilir.',
            'Alternatif şemalar: 8 Gy / 1 fx veya 14.8 Gy / 4 fx BID (fraksiyonlar arasında en az 6 saat).',
          ],
        ));
        const alternativeDose = dose.fractions === 1
          ? makeFractionation(14.8, 4, '14.8 Gy / 4 fx BID; fraksiyonlar arasında en az 6 saat ara')
          : makeFractionation(8, 1, '8 Gy / 1 fx; kısa prognoz veya hızlı hemostaz gereksiniminde');
        recommendations.push(recommendation(
          'hemostatic-rt-alternative',
          `Alternatif hemostatik şema: ${alternativeDose.totalDoseGy} Gy / ${alternativeDose.fractions} fx`,
          alternativeDose,
          targetVolumes('Kanama odağıyla ilişkili makroskopik tümör.', alternativeDose, 'Kanayan hedef ve gerekli anatomik komşuluk.', 'Kanama odağı ve organ dolum protokolüne göre.'),
          ['BID şemada fraksiyonlar arasında en az 6 saat bırakılır; klinik stabilite ve kanama kontrolüne göre seçilir.'],
        ));
        break;
      }
      case 'raised-intracranial-pressure': {
        const dose = input.poorPrognosis
          ? makeFractionation(20, 5, '20 Gy / 5 fx; kısa prognozda')
          : makeFractionation(30, 10, '30 Gy / 10 fx; semptomatik beyin metastazında seçilmiş olguda');
        recommendations.push(recommendation(
          'raised-icp-emergency-wbrt',
          `Akut KİBAS/herniasyon tehdidinde stabilizasyon sonrası acil WBRT: ${dose.totalDoseGy} Gy / ${dose.fractions} fx`,
          dose,
          targetVolumes(
            'Kontrastlı beyin MRI/BT ile değerlendirilen beyin metastazları; WBRT hedefi tüm beyin parankimidir.',
            dose,
            'Tüm beyin; hipokampus koruması akut herniasyon tehdidi ve acil başlangıç koşullarında uygunluk açısından ayrıca değerlendirilir.',
            'Maske immobilizasyonu ve günlük görüntü kılavuzluğu; lens ve optik yapılar doz optimizasyonuna alınır.',
          ),
          [
            'Herniasyon tehdidinde hava yolu/nörolojik stabilizasyon, baş elevasyonu, mannitol %20 ve deksametazon; acil nöroşirürji değerlendirmesi RT’den önce/eşzamanlı yapılır.',
            'WBRT 20 Gy / 5 fx veya 30 Gy / 10 fx; prognoz, performans, tümör yükü ve sistemik tedavi seçeneklerine göre seçilir. Cerrahi rezeksiyon veya SRS uygunluğunu gecikmeden değerlendirin.',
          ],
        ));
        const alternativeDose = input.poorPrognosis
          ? makeFractionation(30, 10, '30 Gy / 10 fx; uygun prognozda')
          : makeFractionation(20, 5, '20 Gy / 5 fx; kısa prognozda');
        recommendations.push(recommendation(
          'raised-icp-alternative-wbrt',
          `Alternatif WBRT: ${alternativeDose.totalDoseGy} Gy / ${alternativeDose.fractions} fx`,
          alternativeDose,
          targetVolumes('Tüm beyin parankimi; MRI/BT ile beyin metastazı değerlendirmesi.', alternativeDose, 'Tüm beyin hacmi; hipokampus ve optik yapılar için doz optimizasyonu.', 'Maske immobilizasyonu ve günlük görüntü kılavuzluğu.'),
          ['Nörolojik stabilizasyon, deksametazon/mannitol ve acil nöroşirürji değerlendirmesi RT’den önce/eşzamanlı yürütülür.'],
        ));
        break;
      }
    }

    return {
      schemaVersion: '1.0',
      engineId: this.id,
      engineVersion: this.version,
      caseId: input.caseId,
      organSystem: 'emergencies',
      rtIndication: 'indicated',
      intent: 'palliative',
      summary: recommendations[0]?.label ?? 'Onkolojik acil durum için derhal multidisipliner değerlendirme gerekir.',
      recommendations,
      rationale: ['RT fraksiyonasyonu, hedef hacmi ve sıralama klinik stabilite, histoloji, prognoz, önceki RT ve kurum protokolüne göre uzman ekip tarafından doğrulanmalıdır.'],
      warnings,
      uncertainties: ['Görüntüleme, histoloji, nörolojik/hava yolu durumu, hemodinamik stabilite, önceki RT ve cerrahi uygunluk doğrulanmalıdır.'],
      confidence: 0.85,
      guidelineReferences: references,
    };
  }
}

export const oncologicEmergenciesEngine = new OncologicEmergenciesDecisionEngine();