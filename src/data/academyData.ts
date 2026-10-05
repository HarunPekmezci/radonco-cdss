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
  {
    id: 'bp1',
    pillar: 'CLINICAL',
    category: 'CNS',
    title: 'Brain Tolerance Constraints (QUANTEC)',
    points: [
      'Brainstem: Max dose < 54 Gy (conventionally fractionated)',
      'Optic Chiasm / Nerves: Max dose < 55 Gy',
      'Spinal Cord: Max dose < 45-50 Gy (EQD2)',
      'Cochlea: Mean dose < 45 Gy (to prevent hearing loss)'
    ]
  },
  {
    id: 'bp2',
    pillar: 'RADIOBIOLOGY',
    category: '5Rs',
    title: 'The 5 Rs of Fractionation',
    points: [
      'Repair: Sublethal damage repair (spares late-responding normal tissues)',
      'Repopulation: Tumor cell proliferation (harmful, limits overall time)',
      'Reoxygenation: Hypoxic cells become oxygenated between fractions',
      'Redistribution: Cells move into sensitive phases (M/G2)',
      'Radiosensitivity: Inherent cellular susceptibility to radiation'
    ]
  },
  {
    id: 'bp3',
    pillar: 'PHYSICS',
    category: 'Dosimetry QA',
    title: 'TG-51 Dosimetry Protocol',
    points: [
      'Defines absorbed dose to water (D_w) in a reference water phantom',
      'Requires a cylindrical ion chamber calibrated at a standards lab (N_{D,w})',
      'Measurements are taken at a reference depth (10 cm for photons)'
    ]
  }
];
