import type {
  AlternativeDoseScheme,
  Fractionation,
  GuidelineReference,
  OARConstraint,
  RegimenCatalog,
  TreatmentIntent,
} from '../types/cdss';

const reference = (title: string, url: string, organization: GuidelineReference['organization'] = 'ASTRO'): GuidelineReference => ({
  organization,
  title,
  url,
  evidenceLevel: 'A',
});

const fractionation = (
  totalDoseGy: number,
  fractions: number,
  alphaBetaTumor = 10,
  fractionationClass: Fractionation['class'] = 'conventional',
  technique?: Fractionation['technique'],
): Fractionation => {
  const dosePerFractionGy = totalDoseGy / fractions;
  const bedGy = totalDoseGy * (1 + dosePerFractionGy / alphaBetaTumor);
  return {
    class: fractionationClass,
    totalDoseGy,
    fractions,
    dosePerFractionGy: Number(dosePerFractionGy.toFixed(2)),
    alphaBetaTumor,
    bedGy: Number(bedGy.toFixed(1)),
    eqd2Gy: Number((bedGy / (1 + 2 / alphaBetaTumor)).toFixed(1)),
    technique: technique ?? (['SBRT', 'SRS', 'single-fraction'].includes(fractionationClass) ? 'IGRT' : 'IMRT'),
  };
};

const oars = (profile: 'pelvis' | 'thorax' | 'breast' | 'upper-abdomen' | 'brain' | 'head-neck' | 'palliative'): OARConstraint[] => {
  const profiles: Record<typeof profile, OARConstraint[]> = {
    pelvis: [
      { organ: 'Rectum', metric: 'V70', limit: 15, unit: '%', priority: 'optimal', source: 'QUANTEC' },
      { organ: 'Bladder', metric: 'V65', limit: 25, unit: '%', priority: 'optimal', source: 'QUANTEC' },
      { organ: 'Femoral heads', metric: 'Dmax', limit: 50, unit: 'Gy', priority: 'acceptable', source: 'protocol' },
    ],
    thorax: [
      { organ: 'Lung minus GTV', metric: 'V20', limit: 30, unit: '%', priority: 'mandatory', source: 'QUANTEC' },
      { organ: 'Spinal cord', metric: 'Dmax', limit: 45, unit: 'Gy', priority: 'mandatory', source: 'QUANTEC' },
      { organ: 'Esophagus', metric: 'Dmean', limit: 34, unit: 'Gy', priority: 'optimal', source: 'QUANTEC' },
    ],
    breast: [
      { organ: 'Heart', metric: 'Dmean', limit: 4, unit: 'Gy', priority: 'optimal', source: 'protocol' },
      { organ: 'Ipsilateral lung', metric: 'V20', limit: 10, unit: '%', priority: 'optimal', source: 'protocol' },
      { organ: 'Contralateral breast', metric: 'Dmean', limit: 1.5, unit: 'Gy', priority: 'optimal', source: 'protocol' },
    ],
    'upper-abdomen': [
      { organ: 'Kidneys', metric: 'Dmean', limit: 18, unit: 'Gy', priority: 'optimal', source: 'QUANTEC' },
      { organ: 'Liver', metric: 'Dmean', limit: 28, unit: 'Gy', priority: 'optimal', source: 'QUANTEC' },
      { organ: 'Spinal cord', metric: 'Dmax', limit: 45, unit: 'Gy', priority: 'mandatory', source: 'QUANTEC' },
    ],
    brain: [
      { organ: 'Optic apparatus', metric: 'Dmax', limit: 54, unit: 'Gy', priority: 'mandatory', source: 'QUANTEC' },
      { organ: 'Brainstem', metric: 'Dmax', limit: 54, unit: 'Gy', priority: 'mandatory', source: 'QUANTEC' },
      { organ: 'Normal brain', metric: 'V12', limit: 5, unit: 'cc', priority: 'optimal', source: 'HyTEC' },
    ],
    'head-neck': [
      { organ: 'Spinal cord', metric: 'Dmax', limit: 45, unit: 'Gy', priority: 'mandatory', source: 'QUANTEC' },
      { organ: 'Brainstem', metric: 'Dmax', limit: 54, unit: 'Gy', priority: 'mandatory', source: 'QUANTEC' },
      { organ: 'Parotid glands', metric: 'Dmean', limit: 26, unit: 'Gy', priority: 'optimal', source: 'QUANTEC' },
    ],
    palliative: [
      { organ: 'Spinal cord', metric: 'Dmax', limit: 30, unit: 'Gy', priority: 'mandatory', source: 'QUANTEC' },
      { organ: 'Kidneys', metric: 'Dmean', limit: 18, unit: 'Gy', priority: 'optimal', source: 'QUANTEC' },
    ],
  };
  return profiles[profile];
};

const scheme = (
  id: string,
  label: string,
  intent: TreatmentIntent,
  totalDoseGy: number,
  fractions: number,
  targetDescription: string,
  evidence: GuidelineReference,
  profile: Parameters<typeof oars>[0],
  fractionationClass: Fractionation['class'] = 'conventional',
  indication?: string,
  alphaBetaTumor = 10,
): AlternativeDoseScheme => ({
  id,
  label,
  intent,
  indication,
  fractionation: fractionation(totalDoseGy, fractions, alphaBetaTumor, fractionationClass),
  targetDescription,
  evidence: [evidence],
  oarProfile: oars(profile),
});

const refs = {
  prostate: reference('ASTRO/AUA Clinically Localized Prostate Cancer Guideline', 'https://www.auanet.org/guidelines-and-quality/guidelines/clinically-localized-prostate-cancer', 'ASTRO'),
  breast: reference('ASTRO Whole Breast Irradiation Guideline', 'https://www.practicalradonc.org/article/S1879-8500(18)30116-6/fulltext', 'ASTRO'),
  lung: reference('ASTRO SBRT Guideline for Early Stage NSCLC', 'https://www.practicalradonc.org/article/S1879-8500(17)30050-2/fulltext', 'ASTRO'),
  sclc: reference('ASTRO Small Cell Lung Cancer Guideline', 'https://www.practicalradonc.org/article/S1879-8500(19)30112-8/fulltext', 'ASTRO'),
  rectum: reference('ASTRO Rectal Cancer Guideline', 'https://www.practicalradonc.org/article/S1879-8500(20)30139-5/fulltext', 'ASTRO'),
  gastric: reference('NCCN Gastric Cancer Guidelines', 'https://www.nccn.org/guidelines/guidelines-detail?category=1&id=151', 'NCCN'),
  glioblastoma: reference('EANO guidelines for diffuse gliomas', 'https://www.nature.com/articles/s41571-020-00447-z', 'EANO'),
  brain: reference('ASTRO Brain Metastases Guideline', 'https://www.practicalradonc.org/article/S1879-8500(22)00052-2/fulltext', 'ASTRO'),
  headNeck: reference('ASTRO HPV-positive Oropharyngeal Cancer Guideline', 'https://www.practicalradonc.org/article/S1879-8500(18)30068-6/fulltext', 'ASTRO'),
  palliative: reference('ASTRO Bone Metastases Guideline', 'https://www.practicalradonc.org/article/S1879-8500(16)30188-4/fulltext', 'ASTRO'),
};

export const REGIMEN_CATALOGS: Record<string, RegimenCatalog> = {
  'gus.prostate': {
    defaultSchemeId: 'moderate-hypofractionation',
    schemes: [
      scheme('sib-rtog-0415', 'SIB: 70 Gy / 28 fx', 'definitive', 70, 28, 'PTV prostat 70 Gy; seminal vezikül 61.6 Gy; elektif pelvis 50.4 Gy.', refs.prostate, 'pelvis', 'moderate-hypofractionation', 'RTOG 0415 SIB yaklaşımı', 1.5),
      scheme('conventional', 'Konvansiyonel: 78 Gy / 39 fx', 'definitive', 78, 39, 'Prostat ± seminal veziküller; yüksek riskte elektif pelvis ayrı planlanır.', refs.prostate, 'pelvis', 'conventional', undefined, 1.5),
      scheme('moderate-hypofractionation', 'Orta hipoFraksiyon: 60 Gy / 20 fx', 'definitive', 60, 20, 'Prostat ve proksimal seminal veziküller, günlük IGRT.', refs.prostate, 'pelvis', 'moderate-hypofractionation', undefined, 1.5),
      scheme('ultra-hypofractionation', 'SBRT: 36.25 Gy / 5 fx', 'definitive', 36.25, 5, 'Düşük/orta risk prostat; seçilmiş hastada prostat ± seminal vezikül.', refs.prostate, 'pelvis', 'SBRT', undefined, 1.5),
      scheme('salvage-bed', 'Salvage yatak: 66 Gy / 33 fx', 'salvage', 66, 33, 'Prostatektomi yatağı; biyokimyasal nüks veya pT3/R1 bağlamında.', refs.prostate, 'pelvis'),
    ],
  },
  'breast.primary': {
    defaultSchemeId: 'moderate-hypofractionation',
    schemes: [
      scheme('moderate-hypofractionation', 'START-B: 40.05 Gy / 15 fx', 'adjuvant', 40.05, 15, 'Tüm meme/göğüs duvarı; nodal riskte bölgesel lenfatikler.', refs.breast, 'breast', 'moderate-hypofractionation', undefined, 4),
      scheme('ultra-hypofractionation', 'FAST-Forward: 26 Gy / 5 fx', 'adjuvant', 26, 5, 'Tüm meme veya göğüs duvarı, uygun erken evre hastalar.', refs.breast, 'breast', 'moderate-hypofractionation', undefined, 4),
      scheme('conventional', 'Konvansiyonel: 50 Gy / 25 fx', 'adjuvant', 50, 25, 'Tüm meme/göğüs duvarı ± bölgesel nodlar; boost ayrı değerlendirilir.', refs.breast, 'breast', 'conventional', undefined, 4),
      scheme('tumor-bed-boost', 'Tümör yatağı boost: 10–16 Gy / 4–8 fx', 'adjuvant', 16, 8, 'Tüm meme RT sonrası cerrahi tümör yatağına sekansiyel boost.', refs.breast, 'breast', 'conventional', 'Yaş, grad, marjin ve lokal nüks riskine göre.', 4),
      scheme('sib-boost', 'SIB boost: 48 Gy / 15 fx', 'adjuvant', 48, 15, 'Tüm meme ve tümör yatağında eşzamanlı boost; kurum protokolü ve plan kalitesi ile.', refs.breast, 'breast', 'moderate-hypofractionation', 'Seçilmiş hastalarda.', 4),
    ],
  },
  'thorax.nsclc': {
    defaultSchemeId: 'peripheral-sbrt',
    schemes: [
      scheme('peripheral-sbrt', 'Periferik SBRT: 54 Gy / 3 fx', 'definitive', 54, 3, 'Periferik, ≤5 cm primer akciğer lezyonu; ITV/PTV 4D-CT ile.', refs.lung, 'thorax', 'SBRT'),
      scheme('central-sbrt', 'Santral SBRT: 50 Gy / 5 fx', 'definitive', 50, 5, 'Santral lezyon; trakeobronşiyal ağaç ve özofagus dozları öncelikli.', refs.lung, 'thorax', 'SBRT'),
      scheme('concurrent-chemoradiation', 'Evre III KRT: 60 Gy / 30 fx', 'definitive', 60, 30, 'Primer ve tutulmuş nodal istasyonlar, eşzamanlı sistemik tedavi.', refs.lung, 'thorax'),
      scheme('dose-escalated-chemoradiation', 'Yüksek doz KRT: 66 Gy / 33 fx', 'definitive', 66, 33, 'Seçilmiş lokal ileri hastada; OAR kısıtları izin verirse.', refs.lung, 'thorax'),
      scheme('port-lung-art', 'PORT: 54 Gy / 27 fx', 'adjuvant', 54, 27, 'Seçilmiş pN2 veya R1/R2 rezeksiyon sonrası mediasten/rezeksiyon yatağı.', refs.lung, 'thorax', 'conventional', 'Lung-ART kriterleri ile.'),
      scheme('ultracentral-risk-adapted', 'Ultra-santral: 60 Gy / 12 fx', 'definitive', 60, 12, 'Ultra-santral lezyonlarda risk-adapte fraksiyonasyon.', refs.lung, 'thorax', 'SBRT'),
    ],
  },
  'thorax.sclc': {
    defaultSchemeId: 'limited-bid',
    schemes: [
      scheme('limited-bid', 'Sınırlı evre BID: 45 Gy / 30 fx', 'definitive', 45, 30, 'Primer tümör ve mediastinal/hiler nodlar; günde iki fraksiyon.', refs.sclc, 'thorax'),
      scheme('limited-conventional', 'Sınırlı evre: 60 Gy / 30 fx', 'definitive', 60, 30, 'Primer ve tutulmuş nodal hacimler; BID uygun değilse alternatif.', refs.sclc, 'thorax'),
      scheme('limited-high-dose', 'Sınırlı evre: 66 Gy / 33 fx', 'definitive', 66, 33, 'Seçilmiş günlük eşzamanlı KRT protokolü.', refs.sclc, 'thorax'),
      scheme('pci', 'Profilaktik kraniyal RT: 25 Gy / 10 fx', 'prophylactic', 25, 10, 'Tüm beyin, yanıt veren sınırlı/yaygın evrede seçilmiş hastalar.', refs.sclc, 'brain'),
    ],
  },
  'gis.rectum': {
    defaultSchemeId: 'long-course',
    schemes: [
      scheme('long-course', 'Uzun dönem KRT: 50.4 Gy / 28 fx', 'neoadjuvant', 50.4, 28, 'Primer rektum ve mezorektum ± lateral nodlar; cerrahi öncesi.', refs.rectum, 'pelvis'),
      scheme('short-course', 'Kısa dönem: 25 Gy / 5 fx', 'neoadjuvant', 25, 5, 'Rektum ve mezorektum; 5 ardışık fraksiyon, TNT protokollerinde.', refs.rectum, 'pelvis', 'moderate-hypofractionation'),
      scheme('opra-organ-preservation', 'OPRA organ koruma TNT: 50.4 Gy / 28 fx', 'neoadjuvant', 50.4, 28, 'Uzun dönem KRT ve konsolidasyon/indüksiyon sistemik tedavisi sonrası klinik tam yanıtda organ koruma değerlendirmesi.', refs.rectum, 'pelvis'),
      scheme('postoperative', 'Postop KRT: 50 Gy / 25 fx', 'adjuvant', 50, 25, 'Cerrahi yatak, mezorektum ve riskli nodal bölgeler.', refs.rectum, 'pelvis'),
    ],
  },
  'gis.gastric': {
    defaultSchemeId: 'postoperative-45',
    schemes: [
      scheme('postoperative-45', 'INT-0116: 45 Gy / 25 fx', 'adjuvant', 45, 25, 'Gastrektomi yatağı, anastomoz ve bölgesel nodlar; kapesitabin/5-FU ile.', refs.gastric, 'upper-abdomen'),
      scheme('postoperative-50-4', 'Boostlu postop: 50.4 Gy / 28 fx', 'adjuvant', 50.4, 28, 'Pozitif/şüpheli marjin veya rezidüel hastalıkta boost içeren hedef.', refs.gastric, 'upper-abdomen'),
      scheme('definitive-50-4', 'Definitif KRT: 50.4 Gy / 28 fx', 'definitive', 50.4, 28, 'İnoperabl veya definitif kemoradyoterapi seçilen mide/GEJ hastalığı.', refs.gastric, 'upper-abdomen'),
      scheme('palliative-30', 'Palyatif: 30 Gy / 10 fx', 'palliative', 30, 10, 'Kanayan, ağrı yapan veya obstrüktif semptom veren mide/GEJ kitlesi.', refs.gastric, 'upper-abdomen', 'moderate-hypofractionation'),
    ],
  },
  'cns.glial-tumor': {
    defaultSchemeId: 'standard-glioblastoma',
    schemes: [
      scheme('standard-glioblastoma', 'Glioblastom standardı: 60 Gy / 30 fx', 'adjuvant', 60, 30, 'Rezeksiyon kavitesi ve rezidüel kontrastlanan tümör + CTV marjı.', refs.glioblastoma, 'brain'),
      scheme('elderly-hypofractionated', 'Yaşlı/frail: 40.05 Gy / 15 fx', 'adjuvant', 40.05, 15, 'Kavite/rezidü + CTV; kısa kür ve uygun sistemik tedavi seçilmiş hastada.', refs.glioblastoma, 'brain', 'moderate-hypofractionation'),
      scheme('very-short-course', 'Çok kısa kür: 34 Gy / 10 fx', 'adjuvant', 34, 10, 'Sınırlı yaşam beklentisi veya düşük performansta kavite/rezidü.', refs.glioblastoma, 'brain', 'moderate-hypofractionation'),
    ],
  },
  'cns.brain-metastases': {
    defaultSchemeId: 'srs-single',
    schemes: [
      scheme('srs-single', 'SRS: 20 Gy / 1 fx', 'definitive', 20, 1, 'Tek/küçük beyin metastazı, GTV + stereotaktik marj.', refs.brain, 'brain', 'single-fraction'),
      scheme('srs-small-24', 'SRS küçük lezyon: 24 Gy / 1 fx', 'definitive', 24, 1, '≤2 cm metastaz; seçilmiş hastada tek fraksiyon SRS.', refs.brain, 'brain', 'single-fraction'),
      scheme('srs-medium-18', 'SRS orta lezyon: 18 Gy / 1 fx', 'definitive', 18, 1, '2.1–3 cm metastaz; normal beyin ve kritik yapı dozları ile.', refs.brain, 'brain', 'single-fraction'),
      scheme('srs-three', 'Fraksiyone SRS: 27 Gy / 3 fx', 'definitive', 27, 3, 'Büyük veya kritik yapıya komşu metastaz; GTV + stereotaktik marj.', refs.brain, 'brain', 'SRS'),
      scheme('surgical-cavity', 'Cerrahi kavite SRT: 27–30 Gy / 3 fx', 'adjuvant', 27, 3, 'Rezeksiyon kavitesi ve cerrahi trakt; fraksiyone stereotaktik yaklaşım.', refs.brain, 'brain', 'SRS'),
      scheme('whole-brain', 'WBRT: 30 Gy / 10 fx', 'palliative', 30, 10, 'Çoklu/yaygın metastaz; tüm beyin, hipokampal koruma uygunlukla.', refs.brain, 'brain'),
      scheme('palliative-wbrt', 'Palyatif WBRT: 20 Gy / 5 fx', 'palliative', 20, 5, 'Yaygın semptomatik beyin metastazlarında kısa süreli palyatif tedavi.', refs.brain, 'brain', 'moderate-hypofractionation'),
    ],
  },
  'head-neck.nasopharynx': {
    defaultSchemeId: 'definitive-70',
    schemes: [
      scheme('definitive-70', 'Definitif KRT: 70 Gy / 35 fx', 'definitive', 70, 35, 'Primer nazofarenks ve gross nodal hastalık; elektif boyun hacimleri.', refs.headNeck, 'head-neck'),
      scheme('moderate-66', 'Definitif: 66 Gy / 33 fx', 'definitive', 66, 33, 'Primer ve tutulmuş nodlar; eşzamanlı sisplatin ile.', refs.headNeck, 'head-neck'),
      scheme('postoperative-60', 'Postop: 60 Gy / 30 fx', 'adjuvant', 60, 30, 'Cerrahi yatak ve riskli nodal seviyeler.', refs.headNeck, 'head-neck'),
    ],
  },
  'head-neck.oropharynx': {
    defaultSchemeId: 'definitive-70',
    schemes: [
      scheme('definitive-70', 'Definitif KRT: 70 Gy / 35 fx', 'definitive', 70, 35, 'Primer orofarenks ve gross nodal hastalık; elektif boyun.', refs.headNeck, 'head-neck'),
      scheme('definitive-66', 'Definitif: 66 Gy / 33 fx', 'definitive', 66, 33, 'Primer ve gross nodlar; seçilmiş HPV-pozitif protokollerde.', refs.headNeck, 'head-neck'),
      scheme('postoperative-60', 'Postop: 60 Gy / 30 fx', 'adjuvant', 60, 30, 'Cerrahi yatak ve riskli nodal bölgeler; pozitif marjinde boost düşünülür.', refs.headNeck, 'head-neck'),
    ],
  },
  'head-neck.hypopharynx': {
    defaultSchemeId: 'definitive-70',
    schemes: [
      scheme('definitive-70', 'Definitif KRT: 70 Gy / 35 fx', 'definitive', 70, 35, 'Primer hipofarenks/lokal larenks bölgesi ve gross nodlar.', refs.headNeck, 'head-neck'),
      scheme('definitive-66', 'Definitif: 66 Gy / 33 fx', 'definitive', 66, 33, 'Primer ve gross nodlar; organ koruma protokollerinde.', refs.headNeck, 'head-neck'),
      scheme('postoperative-60', 'Postop: 60 Gy / 30 fx', 'adjuvant', 60, 30, 'Cerrahi yatak ve riskli nodal seviyeler.', refs.headNeck, 'head-neck'),
    ],
  },
  'head-neck.larynx': {
    defaultSchemeId: 'definitive-65',
    schemes: [
      scheme('definitive-65', 'Larenks organ koruma: 65 Gy / 30 fx', 'definitive', 65, 30, 'Primer larenks ve gross nodal hastalık; organ koruma yaklaşımı.', refs.headNeck, 'head-neck', 'moderate-hypofractionation'),
      scheme('definitive-70', 'Definitif: 70 Gy / 35 fx', 'definitive', 70, 35, 'Primer larenks ve gross nodlar; elektif boyun hacimleri.', refs.headNeck, 'head-neck'),
    ],
  },
  'palliative.radiotherapy': {
    defaultSchemeId: 'single-8',
    schemes: [
      scheme('single-8', 'Tek fraksiyon: 8 Gy / 1 fx', 'palliative', 8, 1, 'Ağrılı kemik metastazı veya kısa yaşam beklentisinde semptomatik odak.', refs.palliative, 'palliative', 'single-fraction'),
      scheme('short-20', 'Kısa kür: 20 Gy / 5 fx', 'palliative', 20, 5, 'Kemik/yumuşak doku semptomatik metastazı; yeniden ışınlama planlamasıyla.', refs.palliative, 'palliative', 'moderate-hypofractionation'),
      scheme('standard-30', 'Konvansiyonel palyatif: 30 Gy / 10 fx', 'palliative', 30, 10, 'Semptomatik metastaz veya lokal kitle kontrolü; seçilmiş iyi performanslı hasta.', refs.palliative, 'palliative'),
    ],
  },
};

export const getRegimenCatalog = (engineId: string): RegimenCatalog | undefined => REGIMEN_CATALOGS[engineId];
