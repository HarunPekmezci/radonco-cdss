export type AcademicPillar = 'CLINICAL' | 'RADIOBIOLOGY' | 'PHYSICS';
export type OrganCategory = 'Breast' | 'Prostate' | 'Thorax' | 'GI' | 'CNS' | 'Head & Neck' | 'Gynecology' | 'Sarcoma' | 'GU' | 'General' | 'Interactions' | 'Dosimetry QA' | '5Rs' | 'LQ Model' | 'Linac Engineering';

export interface VignetteOption {
  id: string;
  text: string;
}

export interface QuizVignette {
  id: string;
  pillar: AcademicPillar;
  category: OrganCategory;
  clinicalCase: string;
  options: VignetteOption[];
  correctAnswerId: string;
  explanation: string;
  distractorRationale?: Record<string, string>;
  landmarkTrialTitle: string;
  doiUrl: string;
}

export interface Flashcard {
  id: string;
  pillar: AcademicPillar;
  category: OrganCategory;
  question: string;
  answerPopulation: string;
  answerIntervention: string;
  answerControl: string;
  answerOutcome: string;
  trialName: string;
  keyTakeaway: string;
}

export interface BoardPearl {
  id: string;
  pillar: AcademicPillar;
  category: OrganCategory;
  title: string;
  points: string[];
}

export const quizVignettes: QuizVignette[] = [
  {
    id: 'q1',
    pillar: 'CLINICAL',
    category: 'Breast',
    clinicalCase: 'A 65-year-old female undergoes lumpectomy for pT1c pN0 ER+ PR+ HER2- invasive ductal carcinoma. She is starting whole breast irradiation. Which of the following regimens is supported by the FAST-Forward trial?',
    options: [
      { id: 'A', text: '50 Gy in 25 fractions' },
      { id: 'B', text: '42.5 Gy in 16 fractions' },
      { id: 'C', text: '26 Gy in 5 fractions' },
      { id: 'D', text: '30 Gy in 5 fractions' },
    ],
    correctAnswerId: 'C',
    explanation: 'The FAST-Forward trial demonstrated non-inferiority of 26 Gy in 5 fractions over 1 week compared to 40 Gy in 15 fractions for local control and normal tissue effects.',
    distractorRationale: {
      'A': 'This is conventional fractionation (START trials comparator), not the 1-week regimen from FAST-Forward.',
      'B': 'This is standard hypofractionation from START B, not ultra-hypofractionation.',
      'D': 'This dose/fractionation was not part of the FAST-Forward or UK FAST trial arms.'
    },
    landmarkTrialTitle: 'FAST-Forward Trial (Lancet 2020)',
    doiUrl: 'https://doi.org/10.1016/S0140-6736(20)30932-6'
  },
  {
    id: 'q2',
    pillar: 'CLINICAL',
    category: 'Thorax',
    clinicalCase: 'In patients with unresectable Stage III NSCLC who have not progressed after concurrent chemoradiotherapy, which systemic therapy was shown to improve OS in the PACIFIC trial?',
    options: [
      { id: 'A', text: 'Pembrolizumab' },
      { id: 'B', text: 'Nivolumab' },
      { id: 'C', text: 'Durvalumab' },
      { id: 'D', text: 'Atezolizumab' },
    ],
    correctAnswerId: 'C',
    explanation: 'The PACIFIC trial established consolidation durvalumab for up to 1 year as the standard of care following concurrent chemoradiation in unresectable Stage III NSCLC.',
    distractorRationale: {
      'A': 'Pembrolizumab is used in metastatic NSCLC (KEYNOTE-024) or adjuvant setting (PEARLS).',
      'B': 'Nivolumab is used in metastatic or neo-adjuvant (CheckMate 816), not as post-CRT consolidation.',
      'D': 'Atezolizumab is used in adjuvant setting (IMpower010) and metastatic disease.'
    },
    landmarkTrialTitle: 'PACIFIC Trial (NEJM 2017)',
    doiUrl: 'https://doi.org/10.1056/NEJMoa1709937'
  },
  {
    id: 'q3',
    pillar: 'CLINICAL',
    category: 'Head & Neck',
    clinicalCase: 'Following surgical resection for oral cavity squamous cell carcinoma, which of the following features mandates the addition of concurrent chemotherapy (cisplatin) to adjuvant radiotherapy?',
    options: [
      { id: 'A', text: 'Lymphovascular space invasion (LVSI)' },
      { id: 'B', text: 'Perineural invasion (PNI)' },
      { id: 'C', text: 'Extracapsular nodal extension (ENE) or positive margins' },
      { id: 'D', text: 'Multiple positive lymph nodes without ENE' },
    ],
    correctAnswerId: 'C',
    explanation: 'Pooled analysis of EORTC 22931 and RTOG 9501 confirmed that concurrent cisplatin improves OS and locoregional control specifically for patients with positive surgical margins or ENE.',
    distractorRationale: {
      'A': 'LVSI is a minor risk factor and an indication for adjuvant RT alone, not concurrent CRT.',
      'B': 'PNI is a minor risk factor, warranting adjuvant RT but not definitively CRT.',
      'D': 'Multiple positive nodes without ENE was not proven to benefit from concurrent cisplatin in the pooled analysis.'
    },
    landmarkTrialTitle: 'EORTC 22931 / RTOG 9501 (NEJM 2004)',
    doiUrl: 'https://doi.org/10.1056/NEJMoa032641'
  },
  {
    id: 'q4',
    pillar: 'RADIOBIOLOGY',
    category: 'LQ Model',
    clinicalCase: 'A patient is being planned for SBRT to a lung lesion. The spinal cord receives a max dose of 24 Gy in 3 fractions. What is the equivalent dose in 2 Gy fractions (EQD2) for late effects (assume α/β = 3)?',
    options: [
      { id: 'A', text: '35.2 Gy' },
      { id: 'B', text: '42.0 Gy' },
      { id: 'C', text: '52.8 Gy' },
      { id: 'D', text: '88.0 Gy' },
    ],
    correctAnswerId: 'C',
    explanation: 'Dose per fraction (d) = 8 Gy. BED = D × (1 + d / α/β) = 24 × (1 + 8/3) = 24 × (11/3) = 88 Gy₃. EQD2 = BED / (1 + 2 / α/β) = 88 / (1 + 2/3) = 88 / (5/3) = 52.8 Gy.',
    distractorRationale: {
      'A': 'Incorrect calculation.',
      'B': 'Incorrect calculation.',
      'D': '88.0 is the BED₃, not the EQD2.'
    },
    landmarkTrialTitle: 'Radiobiology Principles (Fowler 1989)',
    doiUrl: 'https://pubmed.ncbi.nlm.nih.gov/2679720/'
  },
  {
    id: 'q5',
    pillar: 'RADIOBIOLOGY',
    category: '5Rs',
    clinicalCase: 'In the definitive radiotherapy of squamous cell carcinoma of the Head & Neck, which of the "5 Rs" is the primary rationale for avoiding treatment interruptions and using altered fractionation (e.g. accelerated fractionation)?',
    options: [
      { id: 'A', text: 'Reoxygenation' },
      { id: 'B', text: 'Repair of sublethal damage' },
      { id: 'C', text: 'Repopulation' },
      { id: 'D', text: 'Redistribution' },
    ],
    correctAnswerId: 'C',
    explanation: 'Accelerated repopulation of tumor clonogens begins approximately 3-4 weeks into a fractionated radiotherapy course, notably in rapidly dividing tumors like SCC of the H&N.',
    distractorRationale: {
      'A': 'Reoxygenation occurs between fractions but is not the reason to avoid prolonged overall treatment time.',
      'B': 'Repair relates to normal tissue sparing when doses are fractionated (allowing 6+ hours between fractions).',
      'D': 'Redistribution into radiosensitive phases of the cell cycle is a benefit of fractionation, unrelated to overall time.'
    },
    landmarkTrialTitle: 'Time-dose relationships (Withers 1988)',
    doiUrl: 'https://pubmed.ncbi.nlm.nih.gov/3343152/'
  },
  {
    id: 'q6',
    pillar: 'PHYSICS',
    category: 'Interactions',
    clinicalCase: 'Which photon interaction probability is proportional to Z³ / E³ and is the dominant interaction for low-energy orthovoltage beams and diagnostic imaging?',
    options: [
      { id: 'A', text: 'Compton Scattering' },
      { id: 'B', text: 'Photoelectric Effect' },
      { id: 'C', text: 'Pair Production' },
      { id: 'D', text: 'Photodisintegration' },
    ],
    correctAnswerId: 'B',
    explanation: 'The photoelectric effect is dominant at lower energies and its cross-section is highly dependent on atomic number (Z³). This makes it excellent for bone/soft tissue contrast in diagnostic imaging.',
    distractorRationale: {
      'A': 'Compton scattering is independent of Z and dominant in therapeutic energy ranges (100 keV - 10 MeV).',
      'C': 'Pair production requires a threshold energy of 1.022 MeV and is proportional to Z.',
      'D': 'Photodisintegration occurs at >10 MeV and results in neutron emission.'
    },
    landmarkTrialTitle: 'Radiation Physics (Podgorsak 2005)',
    doiUrl: 'https://www-pub.iaea.org/MTCD/Publications/PDF/Pub1196_web.pdf'
  },
  {
    id: 'q7',
    pillar: 'PHYSICS',
    category: 'Dosimetry QA',
    clinicalCase: 'When comparing a 6 MV photon beam to an 18 MV photon beam, which of the following depth-dose characteristics is correct?',
    options: [
      { id: 'A', text: '18 MV has a shallower dmax (depth of maximum dose)' },
      { id: 'B', text: '6 MV has higher surface dose' },
      { id: 'C', text: '18 MV has a faster dose fall-off past dmax' },
      { id: 'D', text: '6 MV produces more neutrons' },
    ],
    correctAnswerId: 'B',
    explanation: 'A 6 MV beam has a dmax of ~1.5 cm and a higher surface dose relative to 18 MV (dmax ~3.0-3.5 cm). Higher energies are more penetrating, offering better skin sparing.',
    distractorRationale: {
      'A': '18 MV has a deeper dmax than 6 MV.',
      'C': 'Higher energy beams (18 MV) have a slower, more penetrating dose fall-off.',
      'D': 'Neutron production via photodisintegration primarily occurs at energies > 10 MV (e.g., 18 MV).'
    },
    landmarkTrialTitle: 'Medical Radiations (Khan 2014)',
    doiUrl: 'https://app.knovel.com/web/toc.v/cid:kpPKROIM05'
  }
];

export const flashcards: Flashcard[] = [
  {
    id: 'fc1',
    pillar: 'CLINICAL',
    category: 'Prostate',
    question: 'What did the FLAME trial investigate in localized prostate cancer?',
    answerPopulation: 'Intermediate- and high-risk localized prostate cancer',
    answerIntervention: 'EBRT (77 Gy) + Focal boost to intraprostatic lesion (up to 95 Gy)',
    answerControl: 'EBRT (77 Gy) without focal boost',
    answerOutcome: 'Focal boost improved biochemical disease-free survival (bDFS) without significantly increasing severe toxicity.',
    trialName: 'FLAME Trial',
    keyTakeaway: 'SIB up to 95 Gy to dominant nodule is safe and effective.'
  },
  {
    id: 'fc2',
    pillar: 'RADIOBIOLOGY',
    category: 'LQ Model',
    question: 'What is the generally accepted α/β ratio for prostate cancer, and why does it matter?',
    answerPopulation: 'Prostate Cancer Cells',
    answerIntervention: 'Extreme hypofractionation (SBRT)',
    answerControl: 'Conventional fractionation (1.8-2 Gy/fx)',
    answerOutcome: 'Prostate cancer is thought to have an extremely low α/β ratio (~1.5 Gy).',
    trialName: 'PACE-B / HYPO-RT-PC',
    keyTakeaway: 'Low α/β implies high sensitivity to large fraction sizes, justifying hypofractionation and SBRT.'
  },
  {
    id: 'fc3',
    pillar: 'PHYSICS',
    category: 'Linac Engineering',
    question: 'What is the purpose of a flattening filter in a medical linear accelerator?',
    answerPopulation: 'X-ray beam generation',
    answerIntervention: 'Flattening Filter',
    answerControl: 'Flattening Filter Free (FFF)',
    answerOutcome: 'Creates a uniform (flat) dose profile at a specific depth.',
    trialName: 'Linac Component Physics',
    keyTakeaway: 'FFF beams lack this filter, resulting in a forward-peaked profile but significantly higher dose rates.'
  }
];

export const boardPearls: BoardPearl[] = [
  // ================= CLINICAL ONCOLOGY (8 cards) =================
  {
    id: 'bp1',
    pillar: 'CLINICAL',
    category: 'CNS',
    title: 'CNS & Brain Tolerance (QUANTEC)',
    points: [
      'Brainstem: Dmax < 54 Gy (< 59 Gy to small volume < 1-10 cc); SBRT 1-fx Dmax < 12.5 Gy',
      'Optic Chiasm & Nerves: Dmax < 54-55 Gy (risk of optic neuropathy < 3%); SRS 1-fx Dmax < 8-10 Gy',
      'Spinal Cord: Dmax < 45-50 Gy (EQD2) for conventional fractionation (< 0.2% myelopathy risk)',
      'Cochlea: Mean dose < 45 Gy (prevents sensorineural hearing loss; strict pediatric target < 35 Gy)',
      'Brain Necrosis (SRS): V12 Gy < 5-10 cc in single-fraction SRS limits symptomatic radionecrosis to < 10%'
    ]
  },
  {
    id: 'bp2',
    pillar: 'CLINICAL',
    category: 'Breast',
    title: 'Breast Radiation Constraints & Regimens',
    points: [
      'FAST-Forward Trial (Lancet 2020): 26 Gy in 5 fractions over 1 week (non-inferior to 40 Gy in 15 fx)',
      'START-B Regimen: 40.05 Gy in 15 fractions over 3 weeks (standard UK/Canadian moderate hypofractionation)',
      'DIBH Cardiac Sparing: Mean Heart Dose < 2-3 Gy (Darby 2013: 7.4% excess major coronary event per 1 Gy mean)',
      'LAD Coronary Artery: V20 Gy < 10% (strict) or V15 Gy < 10%; Dmax < 30-40 Gy',
      'Ipsilateral Lung: V20 Gy < 15-20%, V5 Gy < 40-50% for whole breast tangents'
    ]
  },
  {
    id: 'bp3',
    pillar: 'CLINICAL',
    category: 'Thorax',
    title: 'Thoracic & Lung Constraints',
    points: [
      'Total Lung V20 Gy: < 30-35% (conventionally fractionated CRT; maintains radiation pneumonitis < 10-15%)',
      'Mean Lung Dose (MLD): < 20 Gy (< 13 Gy optimal to prevent grade ≥ 3 radiation pneumonitis)',
      'Esophagus Tolerance: Mean dose < 34 Gy, V60 Gy < 17%; Dmax < 66 Gy (minimizes acute severe esophagitis)',
      'Timmerman Central SBRT: "No Fly Zone" 2 cm from proximal bronchial tree requires risk-adapted 4-8 fx SBRT (e.g., 50 Gy/5fx or 60 Gy/8fx)',
      'Heart Thoracic Limits: V50 Gy < 25%, Mean Heart Dose < 20 Gy (RTOG 0617 showed heart dose strongly predicts OS)'
    ]
  },
  {
    id: 'bp4',
    pillar: 'CLINICAL',
    category: 'Head & Neck',
    title: 'Head & Neck OAR Ceilings',
    points: [
      'Parotid Glands: At least one gland Mean < 20-26 Gy or combined mean < 25 Gy (preserves unstimulated salivary flow)',
      'Mandible Ceiling: Dmax < 70 Gy (keep V60 Gy < 3-5 cc; osteoradionecrosis risk skyrockets above 70 Gy)',
      'Larynx & Pharyngeal Constrictors: Mean dose < 45-50 Gy (preserves swallowing/voice and prevents PEG tube dependence)',
      'Brachial Plexus: Dmax < 60-66 Gy (prevents disabling radiation-induced plexopathy and motor weakness)',
      'Submandibular Glands: Mean < 35-39 Gy if uninvolved (preserves basal unstimulated mucous lubrication)'
    ]
  },
  {
    id: 'bp5',
    pillar: 'CLINICAL',
    category: 'Prostate',
    title: 'Pelvic & Prostate Tolerances',
    points: [
      'Rectum Constraints: V70 Gy < 20%, V65 Gy < 25%, V60 Gy < 35%, V40 Gy < 50% (reduces grade ≥ 2 late GI bleeding)',
      'Bladder Constraints: V70 Gy < 35%, V65 Gy < 50%, V40 Gy < 70% (reduces chronic radiation cystitis & dysuria)',
      'Femoral Heads: Max dose < 50 Gy, V50 Gy < 5% (prevents avascular necrosis & subcapital hip fractures)',
      'Penile Bulb: Mean dose < 50 Gy to 90% volume (optimizes post-RT erectile potency preservation)',
      'SBRT Prostate Limits (PACE-B / 36.25 Gy / 5fx): Rectum V36 Gy < 1-2 cc, Bladder V37 Gy < 5-10 cc'
    ]
  },
  {
    id: 'bp6',
    pillar: 'CLINICAL',
    category: 'GI',
    title: 'GI & Rectal Constraints',
    points: [
      'Small Bowel (Peritoneal Cavity): V45 Gy < 195 cc (individual loops: V15 Gy < 120 cc, Dmax < 54 Gy)',
      'Liver (Whole Organ): Mean dose < 28-30 Gy for primary liver RT; preserve ≥ 700 cc normal liver < 15 Gy to avoid RILD',
      'Bilateral Kidneys: Combined Mean dose < 15-18 Gy, V20 Gy < 32% (prevents chronic radiation nephropathy & hypertension)',
      'Stomach & Duodenum: Dmax < 54 Gy, V45 Gy < 5-10% (duodenum Dmax < 50-52 Gy; SBRT 1-fx Dmax < 15 Gy)',
      'Spinal Cord (Abdominal Fields): Dmax < 45 Gy (EQD2) strictly respected'
    ]
  },
  {
    id: 'bp7',
    pillar: 'CLINICAL',
    category: 'Gynecology',
    title: 'GYN EMBRACE / ICRU 89 Targets',
    points: [
      'HR-CTV Coverage: D90 > 85-90 Gy EQD2 (α/β = 10; achieving > 85 Gy yields > 90% 3-year local control)',
      'Bladder OAR Ceiling: D2cc < 80-90 Gy EQD2 (α/β = 3; strictly limit to reduce severe vesicovaginal fistulas & cystitis)',
      'Rectum OAR Ceiling: D2cc < 65-75 Gy EQD2 (α/β = 3; EMBRACE target D2cc ≤ 65 Gy avoids ulceration/rectovaginal fistula)',
      'Sigmoid Colon OAR Ceiling: D2cc < 70-75 Gy EQD2 (α/β = 3)',
      'ICRU 89 Concept: Transition from Point A 2D prescription to 3D MR-guided volume-adaptive brachytherapy'
    ]
  },
  {
    id: 'bp8',
    pillar: 'CLINICAL',
    category: 'CNS',
    title: 'Spine SBRT & SRS Normal Tissue Ceilings',
    points: [
      'Spinal Cord (Single Fraction): Thecal Sac / True Cord Dmax < 13-14 Gy (RTOG 0631 / HyTEC threshold)',
      'Spinal Cord (3 fractions): Dmax < 21.9 Gy; 5 fractions: Dmax < 30 Gy (V20 Gy < 0.1 cc)',
      'Cauda Equina: 1-fraction Dmax < 16 Gy; 3-fraction Dmax < 24 Gy; 5-fraction Dmax < 32-34 Gy',
      'Esophagus in Spine SBRT: 1-fraction Dmax < 15.4 Gy; 3-fraction Dmax < 25.2 Gy; 5-fraction Dmax < 30 Gy',
      'Vertebral Compression Fracture (VCF): Risk exceeds 40% when dose/fraction > 20 Gy or baseline osteopenia exists'
    ]
  },

  // ================= RADIOBIOLOGY (7 cards) =================
  {
    id: 'bp9',
    pillar: 'RADIOBIOLOGY',
    category: '5Rs',
    title: 'The 5 Rs of Fractionation',
    points: [
      'Repair: Sublethal damage repair occurs over 6-8 hours; late-responding normal tissues have greater repair capacity than tumors',
      'Repopulation: Tumor clonogen proliferation during prolonged treatment courses (accelerates after lag phase)',
      'Reoxygenation: Chronically and acutely hypoxic tumor cells reoxygenate between fractions, restoring radiosensitivity',
      'Redistribution: Surviving cells synchronize into radiosensitive G2/M cell cycle phases from radioresistant S phase',
      'Radiosensitivity (5th R - Steel & Peckham): Inherent intrinsic cellular sensitivity governed by DNA-PK, ATM, and apoptosis pathways'
    ]
  },
  {
    id: 'bp10',
    pillar: 'RADIOBIOLOGY',
    category: 'LQ Model',
    title: 'LQ Model & Tissue Alpha/Beta Ratios Table',
    points: [
      'Early Responding Tissues & Acute Effects: α/β ≈ 10 Gy (skin, mucosa, bone marrow, rapid turnover)',
      'Late Responding Normal Tissues: α/β ≈ 2-3 Gy (spinal cord, brain, kidneys, lung fibrosis, telangiectasia)',
      'Prostate Adenocarcinoma: Low α/β ≈ 1.5 Gy (uniquely lower than late rectal tissue, favoring extreme hypofractionation)',
      'Breast Carcinoma: Intermediate α/β ≈ 3.5-4.0 Gy (FAST-Forward & START foundation for hypofractionation)',
      'Melanoma & Renal Cell: Low α/β ≈ 2.5-4.5 Gy (radioresistant to 2 Gy, highly sensitive to large ablative fraction sizes)'
    ]
  },
  {
    id: 'bp11',
    pillar: 'RADIOBIOLOGY',
    category: 'Interactions',
    title: 'Oxygen Enhancement Ratio (OER) & Hypoxia',
    points: [
      'Low-LET X-rays / Electrons: OER is ~2.5 - 3.0 (oxygen fixes free radical DNA damage via peroxyl radical ROO•)',
      'High-LET Carbon / Neutrons: OER drops to 1.0 - 1.6 (dense ionizations cause direct clustered DSBs independent of oxygen)',
      'Km Value for Oxygen: Half-maximal radiosensitivity occurs at PO2 ≈ 3 mm Hg (~0.5% O2; normal tissue is 30-40 mm Hg)',
      'HIF-1α Pathway: Hypoxia stabilizes HIF-1α, driving VEGF angiogenesis, GLUT-1 glucose influx, and radioresistance',
      'Chronic vs Cycling Hypoxia: Diffusion limitation (> 100-150 µm from capillaries) vs transient microvessel thrombosis/flow fluctuations'
    ]
  },
  {
    id: 'bp12',
    pillar: 'RADIOBIOLOGY',
    category: 'LQ Model',
    title: 'Accelerated Repopulation & Treatment Interruption',
    points: [
      '4-Week Lag Period (Tk): In head & neck SCC, accelerated repopulation of clonogens triggers ~28 days (4 weeks) after RT initiation',
      'Dose Penalty (Withers 1988): Approximately 0.6 Gy per day (equivalent to ~1% local control per day lost) is needed to counter repopulation',
      'Interruption Compensation: Compensate unscheduled gaps using twice-daily fractionation (> 6h interval) or weekend treatments',
      'EQD2 Adjustment Formula: Total dose must be adjusted upward if overall treatment time (OTT) is prolonged beyond planned completion',
      'TDF & Time Factor: Prolonging OTT reduces tumor cure without conferring any sparing on late normal tissue toxicity'
    ]
  },
  {
    id: 'bp13',
    pillar: 'RADIOBIOLOGY',
    category: 'General',
    title: 'TCP, NTCP & EUD (LKB Model)',
    points: [
      'TCP (Tumor Control Probability): Sigmoidal dose-response curve; Poisson model TCP = exp(-N0 × S) where N0 is clonogen number',
      'NTCP (Normal Tissue Complication Probability): Lyman-Kutcher-Burman (LKB) model with parameters TD50, m (slope), and n (volume effect)',
      'Serial Organs (n ≈ 0): E.g., Spinal Cord, Brainstem, Optic Chiasm; max point dose (Dmax) governs functional subunit failure',
      'Parallel Organs (n ≈ 1): E.g., Liver, Lung, Parotid, Kidneys; mean dose and fractional volume spared determine complication risk',
      'EUD (Niemierko): The single uniform dose that leads to the exact same biological effect as a heterogeneous dose distribution'
    ]
  },
  {
    id: 'bp14',
    pillar: 'RADIOBIOLOGY',
    category: 'General',
    title: 'Relative Biological Effectiveness (RBE) & LET',
    points: [
      'RBE Definition: Ratio of dose of 250 kVp X-rays to dose of test radiation producing identical biological endpoint',
      'Proton RBE Constant: Clinically standardized as RBE = 1.1 across the spread-out Bragg peak (SOBP), rising at distal fall-off',
      'Carbon Ion Therapy: High-LET heavy ion RBE ranges from 2.0 to 3.5+ at the distal Bragg peak with sharp penumbra',
      'Optimal LET Peak: RBE reaches maximum efficiency at LET ≈ 100 keV/µm (average distance between ionizations matches DNA helix 2 nm)',
      'Overkill Effect: Beyond 100-200 keV/µm, RBE decreases as excess energy is deposited into already lethal clustered lesion tracks'
    ]
  },
  {
    id: 'bp15',
    pillar: 'RADIOBIOLOGY',
    category: 'General',
    title: 'Low-Dose Hyper-Radiosensitivity & Abscopal Axis',
    points: [
      'Low-Dose Hyper-Radiosensitivity (HRS): Cells exhibit increased lethality per unit dose below 0.5 Gy before ATM-dependent repair turns on',
      'Induced Radioresistance (IRR): Transition between 0.5 Gy and 1.0 Gy where DNA damage sensing cascades activate survival repair',
      'Abscopal Effect: Radiation-induced regression of distant non-irradiated metastatic lesions mediated by T-cell adaptive immunity',
      'STING / cGAS Signaling: Cytosolic dsDNA from irradiated cells triggers type I interferon (IFN-β) secretion and DC cross-priming',
      'Immunogenic Cell Death (ICD): Radiation induces calreticulin cell surface translocation, HMGB1 release, and extracellular ATP burst'
    ]
  },

  // ================= MEDICAL PHYSICS & DOSIMETRY (7 cards) =================
  {
    id: 'bp16',
    pillar: 'PHYSICS',
    category: 'Interactions',
    title: 'Photon & Electron Matter Interactions',
    points: [
      'Photoelectric Effect: Dominant at E < 50 keV. Probability ∝ Z³ / E³. Critical for diagnostic CT contrast and orthovoltage RT',
      'Compton Scattering: Dominant in megavoltage RT (100 keV - 10 MeV). Probability is Z-independent, strictly proportional to electron density (ρe)',
      'Pair Production: Threshold energy > 1.022 MeV (nuclear field) & 2.044 MeV (triplet). Probability ∝ Z², increases with beam energy',
      'Photodisintegration (γ, n): Threshold > 7-10 MeV; yields undesirable photo-neutron activation in 15-18 MV linac heads and bunkers',
      'Electron Collisional vs Radiative: Energy loss dE/dx divided into soft/hard collisions (ionization) and Bremsstrahlung (∝ Z × E)'
    ]
  },
  {
    id: 'bp17',
    pillar: 'PHYSICS',
    category: 'Dosimetry QA',
    title: 'TG-51 and TRS-398 Absolute Dosimetry',
    points: [
      'Reference Machine Output: Standard calibration defines 1.000 cGy/MU for a 10 × 10 cm² field at reference depth (10 cm or dmax) and SSD/SAD 100 cm',
      'Chamber Calibration (ND,w,Co-60): Absorbed-dose-to-water calibration factor from an ADCL secondary standard laboratory',
      'Beam Quality Specifier: Photons use %dd(10)x (lead foil filter eliminates electron contamination); Electrons use R50 (depth at 50% dose)',
      'k_Q Conversion Factor: Quality conversion factor accounts for differences between Co-60 calibration spectrum and clinical user beam energy',
      'Raw Reading Corrections: M = P_ion × P_TP × P_elec × P_pol × M_raw (corrects for ion recombination, temperature/pressure, polarity)'
    ]
  },
  {
    id: 'bp18',
    pillar: 'PHYSICS',
    category: 'Linac Engineering',
    title: 'Linac Anatomy & RF Generation',
    points: [
      'RF Power Generation: Magnetron (generates RF power via electron cloud oscillations, 4-6 MV) vs Klystron (amplifies low RF input, > 10 MV)',
      'Electron Gun: Triode or diode dispenser cathode emits pulses of electrons (~50 keV) injected into the accelerating waveguide',
      'Bending Magnet Assemblies: 90° magnet is chromatic (energy dispersion); 270° achromatic magnet focuses disparate energy electrons into tight < 1-2 mm spot',
      'Flattening Filter vs FFF: Flattening filter produces flat profiles at 10 cm depth; FFF yields forward-peaked beam with 4× higher dose rate (up to 2400 MU/min)',
      'Dual Ionization Chambers: Sealed, temperature/pressure independent monitor chambers track dose (MU), beam symmetry, and steering in real-time'
    ]
  },
  {
    id: 'bp19',
    pillar: 'PHYSICS',
    category: 'General',
    title: 'Depth-Dose Parameters (PDD, TMR, TPR)',
    points: [
      'Dmax Depths (10 × 10 cm²): 6 MV dmax = 1.5 cm; 10 MV dmax = 2.5 cm; 18 MV dmax = 3.5 cm; Co-60 dmax = 0.5 cm',
      'PDD at 10 cm Depth (%dd(10)): 6 MV ≈ 67%, 10 MV ≈ 73%, 18 MV ≈ 80% (higher energy yields deeper penetration and skin sparing)',
      'Surface Dose: Increases with field size and beam energy; 6 MV surface dose ≈ 15-25% vs 18 MV ≈ 10-15% (secondary electron scatter)',
      'TMR & TPR Concept: Tissue-Maximum Ratio is independent of SSD; ideal for isocentric SAD calculation (TMR = Dose at depth d / Dose at dmax with constant SAD)',
      'Mayneord F-Factor: Corrects PDD for changing SSD setup when geometry shifts from 100 cm SSD to non-standard distances'
    ]
  },
  {
    id: 'bp20',
    pillar: 'PHYSICS',
    category: 'Linac Engineering',
    title: 'Multi-Leaf Collimator (MLC) Physics',
    points: [
      'Interleaf Leakage: Precision tungsten leaf tolerances maintain leakage transmission < 1-2% (vs primary jaw transmission < 0.5%)',
      'Tongue-and-Groove Design: Stepped leaf sides prevent open photon ray paths between neighboring leaves but create localized underdosage at abutments',
      'Rounded Leaf Ends: Leaves have curved edges to maintain constant penumbra at all off-axis field positions; requires Dosimetric Leaf Gap (DLG) in TPS',
      'Leaf Width Resolution: Standard MLC leaf width 5 mm or 10 mm at isocenter; High-Definition micro-MLC (HD-MLC) has 2.5 mm central leaves for SRS',
      'Backup Jaws Tracking: Secondary tungsten collimator jaws dynamic tracking minimizes out-of-field leakage and head scatter transmission'
    ]
  },
  {
    id: 'bp21',
    pillar: 'PHYSICS',
    category: 'Dosimetry QA',
    title: 'IMRT & VMAT Patient-Specific QA',
    points: [
      'Gamma Index Metric (Low 1998): Evaluates simultaneous Dose Difference (DD) and Distance to Agreement (DTA) in complex gradient fields',
      'Standard Evaluation Criteria: 3% Dose Difference / 2-3 mm DTA with 10% low-dose threshold; action limit passing rate > 95% (TG-218)',
      'Stereotactic SBRT Criteria: Stricter 2% DD / 2 mm DTA criteria; action threshold > 95% pass rate required due to high ablative fraction sizes',
      'Measurement Arrays: Electronic Portal Imaging Device (EPID), 2D ion chamber/diode matrices (MapCHECK, Matrixx), cylindrical arrays (ArcCHECK, Octavius)',
      'Complexity Metrics: Modulation Complexity Score (MCS) and leaf travel speed variability predict deliverability and QA failure'
    ]
  },
  {
    id: 'bp22',
    pillar: 'PHYSICS',
    category: 'Dosimetry QA',
    title: 'Small Field Dosimetry & SRS Physics (TG-155 / TRS-483)',
    points: [
      'Small Field Definition: Field size smaller than lateral electron range (r_lat) or collimator setting occluding the primary photon source (focal spot)',
      'Lateral Electron Disequilibrium: Secondary electrons travel outside the beam geometry before depositing their full kinetic energy, causing central axis dose drop',
      'Detector Volume Averaging: Ionization chambers larger than 1 mm underestimate peak dose in steep dose gradients (micro-diamonds, diodes, or liquid chambers required)',
      'Detector Perturbation Factor (k_Qclin,Qmsr): Accounts for non-water equivalence of small-field detectors (mass stopping power ratio, scattering perturbation)',
      'Source Occlusion Effect: Collimator jaws/MLC partially block the broad primary focal spot, creating steep non-linear output factor drop-offs below 2 × 2 cm²'
    ]
  }
];
