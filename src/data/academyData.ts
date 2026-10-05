export type OrganCategory = 'Breast' | 'Prostate' | 'Thorax' | 'GI' | 'CNS' | 'Head & Neck' | 'Gynecology' | 'Sarcoma' | 'GU';

export interface VignetteOption {
  id: string;
  text: string;
}

export interface QuizVignette {
  id: string;
  category: OrganCategory;
  clinicalCase: string;
  options: VignetteOption[];
  correctAnswerId: string;
  explanation: string;
  landmarkTrialTitle: string;
  doiUrl: string;
}

export interface Flashcard {
  id: string;
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
  category: OrganCategory;
  title: string;
  points: string[];
}

export const quizVignettes: QuizVignette[] = [
  {
    id: 'q1',
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
    landmarkTrialTitle: 'FAST-Forward Trial (Lancet 2020)',
    doiUrl: 'https://doi.org/10.1016/S0140-6736(20)30932-6'
  },
  {
    id: 'q2',
    category: 'Breast',
    clinicalCase: 'According to the EORTC 22922 and MA.20 trials, what is the primary benefit of adding Regional Nodal Irradiation (RNI) in high-risk node-negative or 1-3 node-positive breast cancer?',
    options: [
      { id: 'A', text: 'Improved Overall Survival by 15%' },
      { id: 'B', text: 'Improved Disease-Free Survival and distant metastasis-free survival' },
      { id: 'C', text: 'Reduced risk of contralateral breast cancer' },
      { id: 'D', text: 'Reduced cardiac toxicity' },
    ],
    correctAnswerId: 'B',
    explanation: 'Both MA.20 and EORTC 22922 demonstrated improvements in DFS and distant metastasis-free survival with the addition of RNI, though OS benefit was marginal or restricted to subgroups.',
    landmarkTrialTitle: 'MA.20 (NEJM 2015) & EORTC 22922 (NEJM 2015)',
    doiUrl: 'https://doi.org/10.1056/NEJMoa1412313'
  },
  {
    id: 'q3',
    category: 'Prostate',
    clinicalCase: 'A 70-year-old man presents with newly diagnosed metastatic prostate cancer (high-burden). According to STAMPEDE (Arm H), what is the role of prostate-directed radiotherapy?',
    options: [
      { id: 'A', text: 'It improves overall survival in high-burden disease' },
      { id: 'B', text: 'It improves overall survival ONLY in low-burden disease' },
      { id: 'C', text: 'It reduces the risk of spinal cord compression' },
      { id: 'D', text: 'It is contraindicated' },
    ],
    correctAnswerId: 'B',
    explanation: 'STAMPEDE showed that radiotherapy to the primary tumor improved overall survival in men with low-burden metastatic prostate cancer, but not in those with high-burden disease.',
    landmarkTrialTitle: 'STAMPEDE (Lancet 2018)',
    doiUrl: 'https://doi.org/10.1016/S0140-6736(18)32486-3'
  },
  {
    id: 'q4',
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
    landmarkTrialTitle: 'PACIFIC Trial (NEJM 2017)',
    doiUrl: 'https://doi.org/10.1056/NEJMoa1709937'
  },
  {
    id: 'q5',
    category: 'GI',
    clinicalCase: 'For locally advanced rectal cancer, the RAPIDO trial compared TNT (short-course RT followed by consolidation chemotherapy) to standard CRT. What was the primary endpoint finding?',
    options: [
      { id: 'A', text: 'Improved Overall Survival' },
      { id: 'B', text: 'Decreased disease-related treatment failure (DrTF) and doubled pCR rate' },
      { id: 'C', text: 'Lower rate of acute toxicity' },
      { id: 'D', text: 'Higher rate of sphincter preservation' },
    ],
    correctAnswerId: 'B',
    explanation: 'RAPIDO showed that short-course RT (5x5 Gy) followed by CAPOX/FOLFOX reduced DrTF and significantly increased the pathological complete response (pCR) rate compared to standard CRT.',
    landmarkTrialTitle: 'RAPIDO Trial (Lancet Oncol 2021)',
    doiUrl: 'https://doi.org/10.1016/S1470-2045(20)30555-6'
  },
  {
    id: 'q6',
    category: 'CNS',
    clinicalCase: 'An elderly patient (age 70) with newly diagnosed glioblastoma requires RT. According to the Perry/CCTG CE.6 trial, what is the optimal regimen?',
    options: [
      { id: 'A', text: '60 Gy in 30 fractions + concurrent/adjuvant TMZ' },
      { id: 'B', text: '40 Gy in 15 fractions + concurrent/adjuvant TMZ' },
      { id: 'C', text: '40 Gy in 15 fractions alone' },
      { id: 'D', text: '34 Gy in 10 fractions alone' },
    ],
    correctAnswerId: 'B',
    explanation: 'The Perry trial showed that adding TMZ to short-course RT (40 Gy / 15 fx) improved OS in elderly patients with GBM compared to RT alone, establishing it as a standard option.',
    landmarkTrialTitle: 'Perry / CCTG CE.6 (NEJM 2017)',
    doiUrl: 'https://doi.org/10.1056/NEJMoa1611977'
  },
  {
    id: 'q7',
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
    landmarkTrialTitle: 'EORTC 22931 / RTOG 9501 (NEJM 2004)',
    doiUrl: 'https://doi.org/10.1056/NEJMoa032641'
  },
  {
    id: 'q8',
    category: 'Gynecology',
    clinicalCase: 'In the EMBRACE II study protocol for locally advanced cervical cancer, what is the planning aim for the High-Risk CTV (HR-CTV) D90?',
    options: [
      { id: 'A', text: '≥ 80 Gy EQD2' },
      { id: 'B', text: '≥ 85-90 Gy EQD2' },
      { id: 'C', text: '≥ 95 Gy EQD2' },
      { id: 'D', text: '≥ 75 Gy EQD2' },
    ],
    correctAnswerId: 'B',
    explanation: 'EMBRACE II aims for an HR-CTV D90 of ≥85-90 Gy (EQD2) to optimize local control while adhering strictly to OAR dose constraints.',
    landmarkTrialTitle: 'EMBRACE II Protocol',
    doiUrl: 'https://doi.org/10.1016/j.ctro.2018.04.004'
  },
  {
    id: 'q9',
    category: 'Sarcoma',
    clinicalCase: 'A patient with an extremity soft tissue sarcoma is being evaluated for radiotherapy. According to the O\'Sullivan trial, pre-operative RT compared to post-operative RT resulted in:',
    options: [
      { id: 'A', text: 'Higher rates of local recurrence' },
      { id: 'B', text: 'Higher rates of late fibrosis and joint stiffness' },
      { id: 'C', text: 'Higher rates of acute wound complications' },
      { id: 'D', text: 'Improved overall survival' },
    ],
    correctAnswerId: 'C',
    explanation: 'Preoperative RT (50 Gy) is associated with higher acute wound complications but significantly lower late toxicity (fibrosis, edema, joint stiffness) compared to postoperative RT (66 Gy).',
    landmarkTrialTitle: 'NCIC CTG SR2 (Lancet 2002)',
    doiUrl: 'https://doi.org/10.1016/s0140-6736(02)09092-d'
  },
  {
    id: 'q10',
    category: 'Thorax',
    clinicalCase: 'For limited-stage small cell lung cancer (LS-SCLC), the Turrisi trial established which of the following RT regimens as a standard of care alongside chemotherapy?',
    options: [
      { id: 'A', text: '45 Gy in 30 fractions BID' },
      { id: 'B', text: '60 Gy in 30 fractions QD' },
      { id: 'C', text: '66 Gy in 33 fractions QD' },
      { id: 'D', text: '50 Gy in 25 fractions QD' },
    ],
    correctAnswerId: 'A',
    explanation: 'The Turrisi trial (INT 0096) demonstrated improved survival with 45 Gy in 30 twice-daily (BID) fractions compared to 45 Gy QD. Later, CONVERT showed 66 Gy QD was not superior to 45 Gy BID, keeping 45 Gy BID a preferred standard.',
    landmarkTrialTitle: 'Turrisi / INT 0096 (NEJM 1999)',
    doiUrl: 'https://doi.org/10.1056/NEJM199901283400404'
  }
];

export const flashcards: Flashcard[] = [
  {
    id: 'fc1',
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
    category: 'GI',
    question: 'What is the standard pre-op chemoradiation regimen for resectable esophageal cancer based on the CROSS trial?',
    answerPopulation: 'Resectable esophageal or esophagogastric junction cancer (squamous or adeno)',
    answerIntervention: 'Pre-op CRT (41.4 Gy/23 fx) with concurrent carboplatin and paclitaxel, followed by surgery',
    answerControl: 'Surgery alone',
    answerOutcome: 'Significant improvement in median OS (49.4 vs 24.0 months) and R0 resection rates.',
    trialName: 'CROSS Trial',
    keyTakeaway: 'Pre-op CRT (41.4 Gy) + Carbo/Taxol is standard for resectable esophageal cancer.'
  },
  {
    id: 'fc3',
    category: 'Breast',
    question: 'When is a tumor bed boost recommended after breast-conserving surgery?',
    answerPopulation: 'Stage I-II breast cancer patients who underwent BCS and WBI',
    answerIntervention: '16 Gy / 8 fx boost to the tumor bed',
    answerControl: 'No boost',
    answerOutcome: 'Halved the local recurrence rate at 20 years, with the largest absolute benefit in patients ≤ 50 years old.',
    trialName: 'EORTC 22881-10882',
    keyTakeaway: 'Boost is mandatory for patients ≤ 50 years, and considered for those with risk factors (high grade, close margins).'
  }
];

export const boardPearls: BoardPearl[] = [
  {
    id: 'bp1',
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
    category: 'Head & Neck',
    title: 'Margin Principles (ICRU 83)',
    points: [
      'GTV to High-Risk CTV: typically 5-10 mm margin (respecting anatomic barriers)',
      'CTV to PTV: 3-5 mm depending on IGRT setup accuracy',
      'Nodes: PTV expansion from CTV node typically 3-5 mm'
    ]
  },
  {
    id: 'bp3',
    category: 'Gynecology',
    title: 'Cervix IGABT (EMBRACE)',
    points: [
      'HR-CTV D90 aim: 85-90 Gy (EQD2)',
      'IR-CTV D90 aim: > 60 Gy',
      'Rectum D2cc < 65-70 Gy',
      'Bladder D2cc < 80-90 Gy',
      'Sigmoid / Bowel D2cc < 70-75 Gy'
    ]
  }
];
