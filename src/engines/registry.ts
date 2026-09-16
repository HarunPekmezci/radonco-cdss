import {
  nsclcEngine, sclcEngine, stomachEngine, rectumEngine, prostateEngine, bladderEngine, breastEngine,
  glialTumorEngine, brainMetastasesEngine, nasopharynxEngine, cervixEngine, palliativeRadiotherapyEngine,
  colonEngine, analEngine, gistEngine, liverCancerEngine, kidneyEngine, testisEngine, penileEngine,
  meningeiomaEngine, ependymomaEngine, primaryCNSLymphomaEngine, leptomeningealMetastasesEngine,
  metastaticSpinalTumorEngine, primarySpinalCordTumorEngine, oropharynxEngine, hypopharynxEngine,
  oralCavityEngine, salivaryGlandEngine, maxillarySinusEngine, thyroidEngine, endometrialEngine,
  ovaryEngine, uterusEngine, vaginalEngine, vulvarEngine, medulloblastomaEngine, ewingSarcomaEngine,
  acuteLymphoblasticLeukemiaEngine, wilmsTumorEngine, osteosarcomaEngine, chondrosarcomaEngine,
  giantCellTumorEngine, melanomaEngine, bccEngine, skinSccEngine, cutaneousLymphomaEngine, kaposiSarcomaEngine,
  multipleMyelomaEngine, acuteMyeloidLeukemiaEngine, chronicMyeloidLeukemiaEngine,
} from './engines';

import { JsonSchema7 } from 'json-schema';

type OrganSystem = 'thorax' | 'gis' | 'gus' | 'breast' | 'head-neck' | 'cns' | 'gynecology' | 'bone' | 'skin' | 'hematologic' | 'pediatric-age' | 'palliative';

interface RegisteredEngine {
  id: string;
  name: string;
  organSystem: OrganSystem;
  disease: string;
  version: string;
  inputSchema: JsonSchema7;
  formSchema: CDSSFormField[];
  presets: CDSSPreset[];
  evaluate: (input: Record<string, unknown>) => CDSSResult;
}

interface CDSSFormField {
  key: string;
  label: string;
  type: 'text' | 'number' | 'boolean' | 'select';
  options?: string[];
  description?: string;
}

interface CDSSPreset {
  id: string;
  label: string;
  description: string;
  input: Record<string, unknown>;
}

interface CDSSResult {
  rtIndication: 'indicated' | 'consider' | 'conditional' | 'not-indicated' | 'contraindicated';
  intent: 'curative' | 'adjuvant' | 'neoadjuvant' | 'definitive' | 'palliative' | 'prophylactic' | 'salvage' | 'observation';
  summary: string;
  recommendations: Recommendation[];
  warnings: string[];
  guidelineReferences: GuidelineReference[];
  alternativeDoseSchemes: AlternativeDoseScheme[];
}

interface Recommendation {
  label: string;
  rationale: string[];
  fractionation: Fractionation;
  systemicTherapy?: SystemicTherapy[];
}

interface Fractionation {
  totalDoseGy: number;
  fractions: number;
  dosePerFractionGy: number;
  technique: string;
  alphaBetaTumor?: number;
  bedGy?: number;
  eqd2Gy?: number;
}

interface SystemicTherapy {
  regimen: string;
}

interface GuidelineReference {
  organization: string;
  title: string;
  url: string;
}

interface AlternativeDoseScheme {
  id: string;
  label: string;
  targetDescription: string;
  fractionation: Fractionation;
  oarProfile: OARConstraint[];
  evidence: GuidelineReference[];
}

interface OARConstraint {
  organ: string;
  metric: string;
  limit: number;
  unit: string;
  source: string;
}

const nsclc = register(
  'thorax.nsclc', 'KHDAK', 'thorax', 'non-small-cell-lung-cancer', nsclcEngine,
  { setting: 'medically-inoperable-early', centrality: 'peripheral', stageGroup: 'I', tumorSizeCm: 2.5, resectability: 'unknown' },
  [field('setting', 'Klinik Durum', 'select', ['operable-early', 'medically-inoperable-early', 'locally-advanced', 'metastatic']), field('centrality', 'Santralite', 'select', ['peripheral', 'central', 'ultra-central']), field('tumorSizeCm', 'Tümör çapı (cm)', 'number'), field('mediastinalStaging', 'Mediasten evrelemesi', 'select', ['değerlendirilmedi', 'negatif', 'pozitif', 'belirsiz']), field('resectability', 'Rezektabilite', 'select', ['resektabil', 'kenar', 'resektabil değil', 'belirsiz']), field('surgicalMargin', 'PORT marjini', 'select', ['R0', 'R1', 'R2', 'değerlendirilmedi']), field('actionableAlteration', 'Sürücü mutasyon', 'select', ['değerlendirilmedi', 'EGFR', 'ALK', 'ROS1', 'KRAS_G12C', 'belirsiz']), ...common],
  presets([
    ['peripheral-sbrt', 'Erken evre periferik SBRT — 54 Gy / 3 fx', { setting: 'medically-inoperable-early', centrality: 'peripheral', stageGroup: 'I', tumorSizeCm: 2.5 }],
    ['central-sbrt', 'Santral SBRT — 50 Gy / 5 fx', { setting: 'medically-inoperable-early', centrality: 'central', stageGroup: 'I', tumorSizeCm: 2.8 }],
    ['ultracentral', 'Ultra-santral — 60 Gy / 12-15 fx', { setting: 'medically-inoperable-early', centrality: 'ultra-central', stageGroup: 'I', tumorSizeCm: 3 }],
    ['pacific', 'Evre III eşzamanlı KRT + PACIFIC', { setting: 'locally-advanced', stageGroup: 'III', mediastinalStaging: 'pozitif', resectability: 'resektabil değil' }],
  ]),
);

const sclc = register(
  'thorax.sclc', 'KHAK', 'thorax', 'small-cell-lung-cancer', sclcEngine,
  { setting: 'sınırlı-evre', stageGroup: 'sınırlı' },
  [field('setting', 'Hastalık evresi', 'select', ['sınırlı-evre', 'geniş-evre', 'yeniden-geliş']), field('stageGroup', 'Hastalık yaygınlığı', 'select', ['sınırlı', 'geniş']), field('performanceStatusECOG', 'ECOG', 'number'), field('brainMRI', 'Beyin MR değerlendirmesi', 'select', ['negatif', 'pozitif', 'belirsiz']), ...common],
  presets([
    ['limited-bid', 'Sınırlı evre — 45 Gy / 30 fx BID', { setting: 'sınırlı-evre', stageGroup: 'sınırlı' }],
    ['limited-conventional', 'Sınırlı evre — 60-66 Gy konvansiyonel', { setting: 'sınırlı-evre', stageGroup: 'sınırlı', brainMRI: 'negatif' }],
    ['pci', 'Yanıt sonrası PCI — 25 Gy / 10 fx', { setting: 'sınırlı-evre', stageGroup: 'sınırlı', response: 'tam' }],
    ['geniş', 'Geniş evre / sistemik tedavi', { setting: 'geniş-evre', stageGroup: 'geniş' }],
  ]),
);

const gastric = register(
  'gis.gastric', 'Mide', 'gis', 'gastric-cancer', stomachEngine,
  { setting: 'postoperative', stageGroup: 'III', lymphadenectomy: 'D1', surgicalMargin: 'R0', histology: 'adenocarcinoma-intestinal', site: 'cardia-gej' },
  [field('setting', 'Klinik Durum', 'select', ['yeniden-geliş', 'yerel-ileri', 'postoperative', 'yeniden-geliş', 'metastatic']), field('site', 'Anatomik yerleşim', 'select', ['cardia-gej', 'corpus-fundus', 'antrum-pylorus']), field('lymphadenectomy', 'Lenfadenektomi', 'select', ['D1', 'D1+', 'D2', 'belirsiz']), field('surgicalMargin', 'Marjin', 'select', ['R0', 'R1', 'R2', 'RX']), field('stageGroup', 'Evre', 'text'), field('histology', 'Histoloji', 'select', ['adenocarcinoma-intestinal', 'adenocarcinoma-diffuse', 'gist', 'neuroendocrine']), field('nodalStatus', 'Nodal durum', 'select', ['N0', 'N1', 'N2', 'N3', 'belirsiz']), ...common],
  presets([
    ['d1-r0', 'Postop D1 R0 evre III — INT-0116 KRT', { setting: 'postoperative', stageGroup: 'III', lymphadenectomy: 'D1', surgicalMargin: 'R0' }],
    ['d2-r0', 'Postop D2 R0 — adjuvan KT / ARTIST-2', { setting: 'postoperative', stageGroup: 'II', lymphadenectomy: 'D2', surgicalMargin: 'R0' }],
    ['r1', 'R1 pozitif marjin — postop KRT', { setting: 'postoperative', stageGroup: 'III', lymphadenectomy: 'D2', surgicalMargin: 'R1' }],
    ['r2', 'R2 rezidü — salvage/palyatif KRT', { setting: 'postoperative', stageGroup: 'IV', lymphadenectomy: 'D1', surgicalMargin: 'R2' }],
  ]),
);

const rectum = register(
  'gis.rectum', 'Rektum', 'gis', 'rectal-cancer', rectumEngine,
  { setting: 'yerel-ileri', stageGroup: 'III', riskGroup: 'yüksek-risk', mmrStatus: 'etkin', response: 'değerlendirilmedi' },
  [field('setting', 'Klinik Durum', 'select', ['yeniden-geliş', 'yerel-ileri', 'postoperative', 'yeniden-geliş', 'metastatic']), field('stageGroup', 'Evre', 'text'), field('riskGroup', 'Risk', 'select', ['erken', 'orta', 'yüksek-risk']), field('crmThreatened', 'CRM tehditli', 'boolean'), field('emvi', 'EMVI pozitif', 'boolean'), field('mmrStatus', 'MMR', 'select', ['etkin', 'dMMR', 'belirsiz']), field('response', 'Yanıt', 'select', ['tam', 'kismi', 'değerlendirilmedi']), ...common],
  presets([
    ['tnt-rapido', 'Lokal ileri TNT — RAPIDO', { setting: 'yerel-ileri', stageGroup: 'III', riskGroup: 'yüksek-risk', crmThreatened: true, emvi: true }],
    ['tnt-opra', 'Lokal ileri TNT — OPRA / organ koruma', { setting: 'yerel-ileri', stageGroup: 'II', riskGroup: 'orta', response: 'değerlendirilmedi' }],
    ['long-course', 'Uzun dönem KRT — 50.4 Gy + kapesitabin', { setting: 'yerel-ileri', stageGroup: 'II', riskGroup: 'orta' }],
    ['short-course', 'Kısa dönem RT — 5 x 5 Gy', { setting: 'yerel-ileri', stageGroup: 'III', riskGroup: 'yüksek-risk' }],
  ]),
);

const prostate = register(
  'gus.prostate', 'Prostat', 'gus', 'prostate-cancer', prostateEngine,
  { setting: 'yeniden-geliş', psaNgMl: 6, gleasonPrimary: 3, gleasonSecondary: 3, clinicalT: 'T1c', nodalStatus: 'N0', metastaticStatus: 'M0', positiveCoresPercent: 20 },
  [field('gleasonPrimary', 'Primer Gleason paterni', 'number'), field('gleasonSecondary', 'Sekonder Gleason paterni', 'number'), field('psaNgMl', 'PSA düzeyi (ng/mL)', 'number'), field('seminalVesicleInvasion', 'Seminal vezikül tutulumu', 'boolean'), field('extracapsularExtension', 'Ekstrakapsüler uzanım', 'boolean'), field('clinicalT', 'Klinik T evresi', 'select', ['T1a', 'T1b', 'T1c', 'T2a', 'T2b', 'T2c', 'T3a', 'T3b', 'T4']), field('nodalStatus', 'Nodal durum', 'select', ['N0', 'N1']), field('metastaticStatus', 'Uzak metastaz', 'select', ['M0', 'M1']), field('positiveCoresPercent', 'Pozitif biyopsi kor oranı (%)', 'number'), field('lifeExpectancyYears', 'Yaşam beklentisi (yıl)', 'number')],
  presets([
    ['low-sbrt', 'Düşük risk — 36.25 Gy / 5 fx SBRT', { setting: 'yeniden-geliş', psaNgMl: 6, gleasonPrimary: 3, gleasonSecondary: 3, clinicalT: 'T1c', nodalStatus: 'N0', metastaticStatus: 'M0' }],
    ['intermediate-adt', 'Orta risk — hipoFx + 4-6 ay ADT', { setting: 'yeniden-geliş', psaNgMl: 12, gleasonPrimary: 3, gleasonSecondary: 4, clinicalT: 'T2b', nodalStatus: 'N0', metastaticStatus: 'M0' }],
    ['high-pelvis', 'Yüksek risk — pelvik RT + 18-36 ay ADT', { setting: 'yeniden-geliş', psaNgMl: 35, gleasonPrimary: 4, gleasonSecondary: 5, clinicalT: 'T3b', nodalStatus: 'N0', metastaticStatus: 'M0' }],
    ['postop', 'Postop biyokimyasal nüks', { setting: 'biyokimyasal-nüks', psaNgMl: 0.3, clinicalT: 'T3a', nodalStatus: 'N0', metastaticStatus: 'M0', surgicalMargin: 'R1' }],
  ]),
);

const bladder = register(
  'gus.bladder', 'Mesane', 'gus', 'bladder-cancer', bladderEngine,
  { setting: 'yerel', riskGroup: 'yüksek', completeTURBT: true, nodalStatus: 'cN0' },
  [field('setting', 'Klinik Durum', 'select', ['yerel', 'postoperative', 'yerel-ileri', 'metastatic']), field('completeTURBT', 'Tam TUR-MT', 'boolean'), field('riskGroup', 'Risk', 'select', ['düşük', 'orta', 'yüksek']), field('nodalStatus', 'Nodal durum', 'select', ['cN0', 'cN1', 'cN2', 'belirsiz']), field('cis', 'CIS', 'boolean'), field('hydronephrosis', 'Hidronefroz', 'boolean'), ...common],
  presets([
    ['trimodality', 'Mesane koruma — TUR-MT + 64-66 Gy KRT', { setting: 'yerel', riskGroup: 'yüksek', completeTURBT: true, nodalStatus: 'cN0' }],
    ['cis', 'CIS / yüksek risk trimodalite', { setting: 'yerel', riskGroup: 'yüksek', completeTURBT: true, cis: true, nodalStatus: 'cN0' }],
    ['node-positive', 'Nodal pozitif — sistemik tedavi + RT', { setting: 'yerel-ileri', riskGroup: 'yüksek', nodalStatus: 'cN1', completeTURBT: true }],
  ]),
);

const breast = register(
  'breast.primary', 'Meme', 'breast', 'breast-cancer', breastEngine,
  { setting: 'postoperative', surgeryType: 'lumpectomy', menopause: 'postmenopausal', pathologicT: 'pT1a-c', pathologicN: 'pN0', marginStatus: 'negative', erPercent: 90, prPercent: 80, her2Status: 'negative', ki67Percent: 15 },
  [field('setting', 'Klinik Durum', 'select', ['yeniden-geliş', 'postoperative', 'neoadjuvant', 'yeniden-geliş', 'metastatic']), field('menopause', 'Menopoz durumu', 'select', ['premenopausal', 'postmenopausal']), field('surgeryType', 'Cerrahi tipi', 'select', ['lumpectomy', 'mastectomy']), field('marginStatus', 'Rezeksiyon marjini', 'select', ['negative', 'yakın', 'pozitif']), field('pathologicT', 'Patolojik pT', 'select', ['pT1a-c', 'pT2', 'pT3', 'pT4a-d']), field('pathologicN', 'Patolojik pN', 'select', ['pN0', 'pN1a', 'pN2a', 'pN3a']), field('erPercent', 'ER (+)', 'number'), field('prPercent', 'PR (+)', 'number'), field('her2Status', 'HER2 (+)', 'select', ['pozitif', 'negatif']), field('ki67Percent', 'Ki-67 > %20', 'number')],
  presets([
    ['mkc-wbi', 'MKC sonrası WBI — 40 Gy/15 fx', { setting: 'postoperative', surgeryType: 'lumpectomy', menopause: 'postmenopausal', pathologicT: 'pT1a-c', pathologicN: 'pN0', marginStatus: 'negative' }],
    ['mkc-fast', 'MKC sonrası FAST-Forward — 26 Gy/5 fx', { setting: 'postoperative', surgeryType: 'lumpectomy', menopause: 'premenopausal', pathologicT: 'pT1a-c', pathologicN: 'pN0', marginStatus: 'negative' }],
    ['pmrt', 'Mastektomi sonrası PMRT + RNI', { setting: 'postoperative', surgeryType: 'mastectomy', pathologicT: 'pT3', pathologicN: 'pN2a', marginStatus: 'negative' }],
    ['positive-margin', 'Pozitif marjin — boost ve RNI değerlendirmesi', { setting: 'postoperative', surgeryType: 'lumpectomy', pathologicT: 'pT2', pathologicN: 'pN1a', marginStatus: 'positive', erPercent: 0, her2Status: 'negatif' }],
  ]),
);

const gbm = register(
  'cns.glioblastoma', 'Glioblastom', 'cns', 'glial-tumor', glialTumorEngine,
  { setting: 'postoperative', grade: 4, ageYears: 55, methylation: 'unmethylated', surgery: 'maximal-safe-resection' },
  [field('setting', 'Klinik Durum', 'select', ['yeniden-geliş', 'postoperative', 'yeniden-geliş']), field('grade', 'WHO derece', 'number'), field('ageYears', 'Yaş', 'number'), field('methylation', 'MGMT metilasyonu', 'select', ['metilasyonlu', 'metilasyonsuz', 'belirsiz']), field('surgery', 'Cerrahi', 'select', ['biyopsi', 'subtotal-resection', 'maximal-safe-resection']), ...common],
  presets([
    ['stupp', 'Standart Stupp — 60 Gy / 30 fx + TMZ', { setting: 'postoperative', grade: 4, ageYears: 55, methylation: 'metilasyonlu', surgery: 'maximal-safe-resection' }],
    ['elderly-40', 'Yaşlı/kırılgan — 40 Gy / 15 fx + TMZ', { setting: 'postoperative', grade: 4, ageYears: 72, methylation: 'metilasyonlu', surgery: 'subtotal-resection' }],
    ['elderly-34', 'Çok kırılgan — 34 Gy / 10 fx', { setting: 'postoperative', grade: 4, ageYears: 80, methylation: 'metilasyonsuz', surgery: 'biyopsi' }],
  ]),
);

const brainMet = register(
  'cns.brain-metastases', 'Beyin metastazları', 'cns', 'brain-metastases', brainMetastasesEngine,
  { setting: 'yeniden-geliş', numberOfLesions: 1, performanceStatusECOG: 1, largestLesionCm: 2 },
  [field('setting', 'Klinik Durum', 'select', ['yeniden-geliş', 'postoperative', 'yeniden-geliş']), field('numberOfLesions', 'Metastaz sayısı', 'number'), field('burden', 'Metastaz yükü', 'select', ['tek', 'oligometastaz', 'çoklu', 'yaygın']), field('largestLesionCm', 'En büyük lezyon (cm)', 'number'), field('midlineShift', 'Orta hat şifti', 'select', ['yok', '5 mm altı', '5 mm ve üstü']), field('symptomStatus', 'Nörolojik durum', 'select', ['asimptomatik', 'deficit veya artan intrakran baskısı']), field('performanceStatusECOG', 'ECOG', 'number'), field('kps', 'KPS', 'number'), field('leptomeningealDisease', 'Leptomeningeal hastalık', 'boolean'), ...common],
  presets([
    ['srs-single', 'Tek lezyon — SRS 18-24 Gy', { setting: 'yeniden-geliş', numberOfLesions: 1, largestLesionCm: 1.8, performanceStatusECOG: 1 }],
    ['srs-oligo', 'Oligometastaz — SRT 27-30 Gy / 3 fx', { setting: 'yeniden-geliş', numberOfLesions: 4, largestLesionCm: 2.5, performanceStatusECOG: 1 }],
    ['hawbrt', 'Çoklu metastaz — HA-WBRT 30 Gy / 10 fx + memantin', { setting: 'yeniden-geliş', numberOfLesions: 12, largestLesionCm: 2, performanceStatusECOG: 2 }],
  ]),
);

const nasopharynx = register(
  'head-neck.nasopharynx', 'Nazofarenks', 'head-neck', 'nasopharyngeal-carcinoma', nasopharynxEngine,
  { setting: 'yeniden-geliş', stageGroup: 'III', histology: 'non-keratinizing', resectability: 'resektabil değil' },
  [field('setting', 'Klinik Durum', 'select', ['yeniden-geliş', 'postoperative', 'yeniden-geliş', 'metastatic']), field('stageGroup', 'Evre', 'text'), field('histology', 'Histoloji', 'select', ['non-keratinizing', 'keratinizing']), field('inductionChemotherapy', 'İndüksiyon KT', 'boolean'), ...common],
  presets([
    ['stage-ii', 'Evre II — 70/60/54 Gy SIB KRT', { setting: 'yeniden-geliş', stageGroup: 'II', inductionChemotherapy: false }],
    ['stage-iii', 'Evre III — indüksiyon KT + KRT', { setting: 'yeniden-geliş', stageGroup: 'III', inductionChemotherapy: true }],
    ['stage-iva', 'Evre IVA — indüksiyon + eşzamanlı KRT', { setting: 'yeniden-geliş', stageGroup: 'IVA', inductionChemotherapy: true }],
  ]),
);

const cervix = register(
  'gynecology.cervix', 'Serviks', 'gynecology', 'cervical-cancer', cervixEngine,
  { setting: 'definitive', figoStage: 'IIIB', histology: 'squamous', renalFunction: 'adequate' },
  [field('setting', 'Klinik Durum', 'select', ['definitive', 'postoperative', 'yeniden-geliş', 'metastatic']), field('figoStage', 'FIGO evre', 'text'), field('histology', 'Histoloji', 'select', ['squamous', 'adenocarcinoma', 'adenosquamous']), field('renalFunction', 'Böbrek fonksiyonu', 'select', ['adequate', 'impaired']), field('paraAorticNodes', 'Paraaortik nod', 'boolean'), ...common],
  presets([
    ['ib3-iva', 'IB3-IVA — 45 Gy pelvis + sisplatin + HDR', { setting: 'definitive', figoStage: 'IIIB', renalFunction: 'adequate' }],
    ['postop-risk', 'Postop yüksek risk — KRT + brakiterapi değerlendirmesi', { setting: 'postoperative', figoStage: 'IIIC1', surgicalMargin: 'R1' }],
    ['para-aortic', 'Paraaortik nod pozitif — genişletilmiş alan', { setting: 'definitive', figoStage: 'IIIC2', paraAorticNodes: true }],
  ]),
);

const palliative = register(
  'palliative.radiotherapy', 'Palyatif RT', 'palliative', 'palliative-radiotherapy', palliativeRadiotherapyEngine,
  { setting: 'yeniden-geliş', site: 'bone', symptoms: ['ağrı'], performance: 'iyi' },
  [field('setting', 'Acil Durum', 'select', ['yeniden-geliş', 'acil-urgence', 'yeniden-geliş']), field('site', 'Tedavi Alanı', 'select', ['bone', 'spine', 'beyin', 'toraks', 'kanama']), field('symptoms', 'Semptom', 'text'), field('spinalCordCompression', 'Medulla Basısı', 'boolean'), field('performance', 'Performans', 'select', ['iyi', 'sınırlı', 'kötü']), ...common],
  presets([
    ['bone-8', 'Ağrılı Kemik Metastazı — 8 Gy / 1 fx', { setting: 'yeniden-geliş', site: 'bone', symptoms: ['ağrı'], performance: 'iyi' }],
    ['bone-20', 'Ağrılı Kemik Metastazı — 20 Gy / 5 fx', { setting: 'yeniden-geliş', site: 'bone', symptoms: ['ağrı'], performance: 'sınırlı' }],
    ['cord', 'Medulla Basısı — Acil 30 Gy / 10 fx + steroid', { setting: 'acil-urgence', site: 'spine', spinalCordCompression: true, symptoms: ['nörolojik-yetersizlik'], performance: 'sınırlı' }],
    ['bleeding', 'Kanama — Hemostatik Palyatif RT', { setting: 'acil-urgence', site: 'kanama', symptoms: ['kanama'], performance: 'sınırlı' }],
  ]),
);

const genericEngineDefinitions = [
  ...[
    ['gis.colon', 'Kolon', 'gis', 'colon-cancer', colonEngine],
    ['gis.anal', 'Anal Kanal', 'gis', 'anal-cancer', analEngine],
    ['gis.gist', 'GİST', 'gis', 'gist', gistEngine],
    ['gis.liver', 'Karaciğer', 'liver', 'liver-cancer', liverCancerEngine],
    ['gus.kidney', 'Böbrek / RCC', 'gus', 'renal-cell-carcinoma', kidneyEngine],
    ['gus.testis', 'Testis', 'gus', 'testicular-cancer', testisEngine],
    ['gus.penile', 'Penis', 'gus', 'penile-cancer', penileEngine],
    ['cns.meningioma', 'Menenjiom', 'cns', 'meningioma', meningeiomaEngine],
    ['cns.ependymoma', 'Ependimom', 'cns', 'ependymoma', ependymomaEngine],
    ['cns.primary-cns-lymphoma', 'Primer CNS Lenfoması', 'cns', 'primary-cns-lymphoma', primaryCNSLymphomaEngine],
    ['cns.leptomeningeal', 'Leptomeningeal Metastaz', 'cns', 'leptomeningeal-metastases', leptomeningealMetastasesEngine],
    ['cns.metastatic-spine', 'Metastatik Spinal Tümör', 'cns', 'metastatic-spinal-tumor', metastaticSpinalTumorEngine],
    ['cns.primary-spinal-cord', 'Primer Spinal Kord Tümörü', 'cns', 'primary-spinal-cord-tumor', primarySpinalCordTumorEngine],
    ['head-neck.oropharynx', 'Orofarenks', 'head-neck', 'oropharyngeal-cancer', oropharynxEngine],
    ['head-neck.hypopharynx', 'Hipofarenks', 'head-neck', 'hypopharyngeal-cancer', hypopharynxEngine],
    ['head-neck.oral-cavity', 'Oral Kavite', 'head-neck', 'oral-cavity-cancer', oralCavityEngine],
    ['head-neck.salivary-gland', 'Tükürük Bezi', 'head-neck', 'salivary-gland-cancer', salivaryGlandEngine],
    ['head-neck.maxillary-sinus', 'Maksiller Sinüs', 'head-neck', 'maxillary-sinus-cancer', maxillarySinusEngine],
    ['head-neck.thyroid', 'Tiroid', 'head-neck', 'thyroid-cancer', thyroidEngine],
    ['gynecology.endometrial', 'Endometriyum', 'gynecology', 'endometrial-cancer', endometrialEngine],
    ['gynecology.ovary', 'Ovary', 'gynecology', 'ovarian-cancer', ovaryEngine],
    ['gynecology.uterus', 'Uterus', 'gynecology', 'uterine-cancer', uterusEngine],
    ['gynecology.vaginal', 'Vajina', 'gynecology', 'vaginal-cancer', vaginalEngine],
    ['gynecology.vulvar', 'Vulva', 'gynecology', 'vulvar-cancer', vulvarEngine],
    ['pediatric.medulloblastoma', 'Medulloblastom', 'cns', 'medulloblastoma', medulloblastomaEngine],
    ['pediatric.ewing', 'Ewing Sarkomu', 'sarcoma', 'ewing-sarcoma', ewingSarcomaEngine],
    ['pediatric.all', 'Pediatrik ALL', 'cns', 'acute-lymphoblastic-leukemia', acuteLymphoblasticLeukemiaEngine],
    ['pediatric.wilms', 'Wilms Tümörü', 'gus', 'wilms-tumor', wilmsTumorEngine],
    ['bone.osteosarcoma', 'Osteosarkom', 'bone', 'osteosarcoma', osteosarcomaEngine],
    ['bone.chondrosarcoma', 'Kondrosarkom', 'bone', 'chondrosarcoma', chondrosarcomaEngine],
    ['bone.giant-cell-tumor', 'Dev Hücreli Tümör', 'bone', 'giant-cell-tumor', giantCellTumorEngine],
    ['skin.melanoma', 'Melanom', 'skin', 'melanoma', melanomaEngine],
    ['skin.bcc', 'BCC', 'skin', 'basal-cell-carcinoma', bccEngine],
    ['skin.scc', 'SCC', 'skin', 'cutaneous-squamous-cell-carcinoma', skinSccEngine],
    ['skin.cutaneous-lymphoma', 'Kutanöz Lenfoma', 'skin', 'cutaneous-lymphoma', cutaneousLymphomaEngine],
    ['skin.kaposi', 'Kaposi Sarkomu', 'skin', 'kaposi-sarcoma', kaposiSarcomaEngine],
    ['hematologic.myeloma', 'Multiple Myelom', 'hematologic', 'multiple-myeloma', multipleMyelomaEngine],
    ['hematologic.aml', 'AML', 'hematologic', 'acute-myeloid-leukemia', acuteMyeloidLeukemiaEngine],
    ['hematologic.cml', 'KML', 'hematologic', 'chronic-myeloid-leukemia', chronicMyeloidLeukemiaEngine],
  ],
] as Array<[string, string, OrganSystem, string, unknown]>;

const allEngines: RegisteredEngine[] = [
  nsclc, sclc, gastric, rectum, prostate, bladder, breast, gbm, brainMet, nasopharynx, cervix, palliative,
  ...genericEngineDefinitions.map(([id, name, organSystem, disease, engine]) => register(
    id as string, name as string, organSystem as OrganSystem, disease as string, engine as Engine,
    id === 'cns.meningioma'
      ? { setting: 'yeniden-geliş', grade: 'WHO-1', surgeryType: 'gross-total-resection', midlineShift: 'yok', symptomStatus: 'asimptomatik', brainInvasion: false }
      : { setting: 'yeniden-geliş' },
    id === 'cns.meningioma'
      ? [
          field('setting', 'Klinik Durum', 'select', ['yeniden-geliş', 'postoperative', 'yeniden-geliş', 'yeniden-geliş']),
          field('grade', 'WHO Derecesi', 'select', ['WHO-1', 'WHO-2', 'WHO-3']),
          field('surgeryType', 'Simpson Rezeksiyonu', 'select', ['gross-total-resection', 'subtotal-resection']),
          field('midlineShift', 'Orta Hat Şifti', 'select', ['yok', '5 mm altı', '5 mm ve üstü']),
          field('symptomStatus', 'Nörolojik Semptom', 'select', ['asimptomatik', 'deficit veya artan intrakran baskısı']),
          field('brainInvasion', 'Beyin İnvazyonu', 'boolean'),
          field('tumorSizeCm', 'Tümör Çapı (cm)', 'number'),
          field('neurologicDeficit', 'Nörolojik Defisit', 'boolean'),
          field('seizures', 'Nöbet', 'boolean'),
        ]
      : [...common],
    presets([['standard', `${name} Standart Vaka`, { setting: 'yeniden-geliş' }], ['postop', `${name} Postop`, { setting: 'postoperative', surgicalMargin: 'R1' }], ['advanced', `${name} İleri/Yeniden Geliş`, { setting: 'yeniden-geliş' }]]),
    id.startsWith('pediatric.') ? 'pediatric-age' : organSystem,
  )),
];

export const ENGINE_REGISTRY = allEngines;
export const getEnginesByOrgan = (organSystem: OrganSystem): RegisteredEngine[] => ENGINE_REGISTRY.filter((engine) => engine.navigationGroup === organSystem);
export const getRegisteredEngine = (id: string): RegisteredEngine | undefined => ENGINE_REGISTRY.find((engine) => engine.id === id);
