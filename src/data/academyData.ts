export type AcademicPillar = 'CLINICAL' | 'RADIOBIOLOGY' | 'PHYSICS';
export type OrganCategory =
  | 'Breast'
  | 'Prostate'
  | 'Thorax'
  | 'GI'
  | 'CNS'
  | 'Head & Neck'
  | 'Gynecology'
  | 'GYN'
  | 'GU'
  | 'Palliative'
  | 'Sarcoma'
  | 'General'
  | 'Interactions'
  | 'Dosimetry QA'
  | '5Rs'
  | 'LQ Model'
  | 'Linac Engineering';

export interface VignetteOption {
  id: string;
  text: string;
}

export interface QuizVignette {
  id: string;
  pillar: AcademicPillar;
  category: OrganCategory;
  organ?: OrganCategory;
  title?: string;
  clinicalCase: string;
  vignette?: string;
  options: VignetteOption[];
  correctAnswerId: string;
  correctIndex?: number;
  explanation: string;
  rationale?: string;
  distractorRationale?: Record<string, string>;
  distractorRationales?: Record<string, string>;
  landmarkTrialTitle: string;
  trial?: string;
  doiUrl: string;
  citation?: string;
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
    "id": "q-breast-fast-forward",
    "pillar": "CLINICAL",
    "category": "Breast",
    "organ": "Breast",
    "title": "FAST-Forward: 1-Week Ultra-Hypofractionated Whole Breast Irradiation",
    "clinicalCase": "A 64-year-old female undergoes breast-conserving lumpectomy and sentinel lymph node biopsy for a 1.6 cm, grade 2 invasive ductal carcinoma (pT1c pN0, ER+ 95%, PR+ 80%, HER2-negative). Surgical margins are clear (> 2 mm). According to the 5-year results of the Phase III FAST-Forward trial, which adjuvant whole breast radiotherapy schedule demonstrates non-inferior 5-year local control and comparable normal tissue cosmesis compared to 40 Gy in 15 fractions?",
    "vignette": "A 64-year-old female undergoes breast-conserving lumpectomy and sentinel lymph node biopsy for a 1.6 cm, grade 2 invasive ductal carcinoma (pT1c pN0, ER+ 95%, PR+ 80%, HER2-negative). Surgical margins are clear (> 2 mm). According to the 5-year results of the Phase III FAST-Forward trial, which adjuvant whole breast radiotherapy schedule demonstrates non-inferior 5-year local control and comparable normal tissue cosmesis compared to 40 Gy in 15 fractions?",
    "options": [
      {
        "id": "A",
        "text": "50 Gy in 25 daily fractions over 5 weeks"
      },
      {
        "id": "B",
        "text": "42.5 Gy in 16 daily fractions over 3.2 weeks"
      },
      {
        "id": "C",
        "text": "26 Gy in 5 daily fractions over 1 week"
      },
      {
        "id": "D",
        "text": "28.5 Gy in 5 once-weekly fractions over 5 weeks"
      }
    ],
    "correctAnswerId": "C",
    "correctIndex": 2,
    "explanation": "The FAST-Forward Phase III non-inferiority trial (4,096 patients, Lancet 2020) demonstrated that 26 Gy delivered in 5 daily fractions over 1 week was non-inferior to 40 Gy in 15 fractions over 3 weeks. At 5 years, the cumulative local relapse incidence was 1.4% for 26 Gy and 2.1% for 40 Gy (HR 0.67, 95% CI 0.38–1.16). Clinician- and patient-reported moderate/marked breast induration and late normal tissue toxicity were comparable between 26 Gy and 40 Gy (unlike the 27 Gy/5 fx arm, which showed significantly higher normal tissue effects).",
    "rationale": "The FAST-Forward Phase III non-inferiority trial (4,096 patients, Lancet 2020) demonstrated that 26 Gy delivered in 5 daily fractions over 1 week was non-inferior to 40 Gy in 15 fractions over 3 weeks. At 5 years, the cumulative local relapse incidence was 1.4% for 26 Gy and 2.1% for 40 Gy (HR 0.67, 95% CI 0.38–1.16). Clinician- and patient-reported moderate/marked breast induration and late normal tissue toxicity were comparable between 26 Gy and 40 Gy (unlike the 27 Gy/5 fx arm, which showed significantly higher normal tissue effects).",
    "distractorRationale": {
      "A": "50 Gy in 25 fractions is the historical conventional comparator arm from the START and Canadian trials, now superseded by hypofractionation.",
      "B": "42.5 Gy in 16 fractions is the Canadian hypofractionated schedule (Whelan et al.), delivered over more than 3 weeks.",
      "D": "28.5 Gy in 5 once-weekly fractions is the regimen from the original UK FAST trial (2011), not the 1-week consecutive schedule validated in FAST-Forward."
    },
    "distractorRationales": {
      "A": "50 Gy in 25 fractions is the historical conventional comparator arm from the START and Canadian trials, now superseded by hypofractionation.",
      "B": "42.5 Gy in 16 fractions is the Canadian hypofractionated schedule (Whelan et al.), delivered over more than 3 weeks.",
      "D": "28.5 Gy in 5 once-weekly fractions is the regimen from the original UK FAST trial (2011), not the 1-week consecutive schedule validated in FAST-Forward."
    },
    "landmarkTrialTitle": "FAST-Forward Phase III Trial (Lancet 2020)",
    "trial": "FAST-Forward (2020)",
    "doiUrl": "https://doi.org/10.1016/S0140-6736(20)30932-6",
    "citation": "Brunt AM, et al. Hypofractionated breast radiotherapy for 1 week versus 3 weeks (FAST-Forward). Lancet 2020;395(10237):1613-1626."
  },
  {
    "id": "q-breast-start-b",
    "pillar": "CLINICAL",
    "category": "Breast",
    "organ": "Breast",
    "title": "UK START-B: Moderate Hypofractionation vs Conventional WBRT",
    "clinicalCase": "A 58-year-old female with pT2 (2.6 cm) pN0 grade 2 invasive ductal carcinoma completes breast-conserving surgery with negative margins. In the landmark UK START-B trial comparing 40 Gy in 15 fractions over 3 weeks versus 50 Gy in 25 fractions over 5 weeks, what was the primary finding regarding 10-year locoregional recurrence and normal tissue cosmesis?",
    "vignette": "A 58-year-old female with pT2 (2.6 cm) pN0 grade 2 invasive ductal carcinoma completes breast-conserving surgery with negative margins. In the landmark UK START-B trial comparing 40 Gy in 15 fractions over 3 weeks versus 50 Gy in 25 fractions over 5 weeks, what was the primary finding regarding 10-year locoregional recurrence and normal tissue cosmesis?",
    "options": [
      {
        "id": "A",
        "text": "Locoregional recurrence was significantly higher with 40 Gy in 15 fractions"
      },
      {
        "id": "B",
        "text": "40 Gy in 15 fractions had equivalent locoregional control and significantly lower rates of breast shrinkage, telangiectasia, and edema"
      },
      {
        "id": "C",
        "text": "40 Gy had lower locoregional recurrence but resulted in markedly higher rates of rib fractures and ischemic heart disease"
      },
      {
        "id": "D",
        "text": "Both schedules had identical tumor control but 50 Gy had superior cosmetic outcomes"
      }
    ],
    "correctAnswerId": "B",
    "correctIndex": 1,
    "explanation": "With 10-year follow-up published in Lancet Oncology 2013, the UK START-B trial (2,215 patients) confirmed that 40 Gy in 15 fractions over 3 weeks achieved equivalent (and numerically lower) locoregional relapse (4.3% vs 5.5%, HR 0.77, p=0.21) and significantly lower rates of moderate/marked breast shrinkage (HR 0.83), breast edema (HR 0.64), and telangiectasia (HR 0.61) compared to 50 Gy in 25 fractions over 5 weeks.",
    "rationale": "With 10-year follow-up published in Lancet Oncology 2013, the UK START-B trial (2,215 patients) confirmed that 40 Gy in 15 fractions over 3 weeks achieved equivalent (and numerically lower) locoregional relapse (4.3% vs 5.5%, HR 0.77, p=0.21) and significantly lower rates of moderate/marked breast shrinkage (HR 0.83), breast edema (HR 0.64), and telangiectasia (HR 0.61) compared to 50 Gy in 25 fractions over 5 weeks.",
    "distractorRationale": {
      "A": "40 Gy in 15 fractions showed equivalent locoregional control with HR 0.77 favoring 40 Gy.",
      "C": "Rib fracture rates and cardiovascular toxicity were not increased with the 40 Gy regimen.",
      "D": "Cosmetic outcomes and late adverse tissue effects were significantly superior with 40 Gy in 15 fractions."
    },
    "distractorRationales": {
      "A": "40 Gy in 15 fractions showed equivalent locoregional control with HR 0.77 favoring 40 Gy.",
      "C": "Rib fracture rates and cardiovascular toxicity were not increased with the 40 Gy regimen.",
      "D": "Cosmetic outcomes and late adverse tissue effects were significantly superior with 40 Gy in 15 fractions."
    },
    "landmarkTrialTitle": "UK START-B Phase III Trial (Lancet 2008 / Lancet Oncol 2013)",
    "trial": "START-B (2008 / 2013)",
    "doiUrl": "https://doi.org/10.1016/S1470-2045(13)70388-6",
    "citation": "Haviland JS, et al. The UK Standardisation of Breast Radiotherapy (START) trials. Lancet Oncol 2013;14(11):1086-1094."
  },
  {
    "id": "q-breast-eortc-boost",
    "pillar": "CLINICAL",
    "category": "Breast",
    "organ": "Breast",
    "title": "EORTC 22881-10886: Tumor Bed Boost in Early Breast Cancer",
    "clinicalCase": "A 38-year-old premenopausal female undergoes breast-conserving lumpectomy for a 1.8 cm grade 3 invasive ductal carcinoma (pN0, margins negative by 3 mm). She receives 50 Gy whole breast irradiation. According to the 20-year long-term results of the EORTC 22881-10886 Phase III trial, which group receives the greatest absolute benefit from an additional 16 Gy tumor bed boost?",
    "vignette": "A 38-year-old premenopausal female undergoes breast-conserving lumpectomy for a 1.8 cm grade 3 invasive ductal carcinoma (pN0, margins negative by 3 mm). She receives 50 Gy whole breast irradiation. According to the 20-year long-term results of the EORTC 22881-10886 Phase III trial, which group receives the greatest absolute benefit from an additional 16 Gy tumor bed boost?",
    "options": [
      {
        "id": "A",
        "text": "Women aged > 60 years with low-grade ER+ tumors"
      },
      {
        "id": "B",
        "text": "Women aged ≤ 50 years, with the largest absolute local recurrence reduction in women ≤ 40 years"
      },
      {
        "id": "C",
        "text": "All age groups equally with a 50% relative reduction in overall survival"
      },
      {
        "id": "D",
        "text": "Only patients with microscopically positive surgical margins"
      }
    ],
    "correctAnswerId": "B",
    "correctIndex": 1,
    "explanation": "In the EORTC 22881-10886 boost trial (5,318 patients, Bartelink et al., Lancet Oncol 2015), the 16 Gy tumor bed boost significantly reduced the 20-year cumulative incidence of local recurrence from 16.4% to 12.0% (HR 0.65, p<0.0001). The absolute reduction was highest in young women aged ≤ 40 years (local recurrence reduced from 36.0% to 24.4%, absolute reduction 11.6%) and aged 41-50 years, whereas women > 60 had a very low baseline risk and minimal absolute benefit (reduction from 7.3% to 4.9%). No overall survival difference was observed.",
    "rationale": "In the EORTC 22881-10886 boost trial (5,318 patients, Bartelink et al., Lancet Oncol 2015), the 16 Gy tumor bed boost significantly reduced the 20-year cumulative incidence of local recurrence from 16.4% to 12.0% (HR 0.65, p<0.0001). The absolute reduction was highest in young women aged ≤ 40 years (local recurrence reduced from 36.0% to 24.4%, absolute reduction 11.6%) and aged 41-50 years, whereas women > 60 had a very low baseline risk and minimal absolute benefit (reduction from 7.3% to 4.9%). No overall survival difference was observed.",
    "distractorRationale": {
      "A": "Women > 60 years had low absolute benefit (~2.4% reduction at 20 years).",
      "C": "The boost improved local control without showing a statistically significant overall survival benefit.",
      "D": "Patients in EORTC 22881 were required to have microscopically clear margins to be randomized; positive margins mandate re-excision or higher boost independently."
    },
    "distractorRationales": {
      "A": "Women > 60 years had low absolute benefit (~2.4% reduction at 20 years).",
      "C": "The boost improved local control without showing a statistically significant overall survival benefit.",
      "D": "Patients in EORTC 22881 were required to have microscopically clear margins to be randomized; positive margins mandate re-excision or higher boost independently."
    },
    "landmarkTrialTitle": "EORTC 22881-10886 Phase III Boost Trial (NEJM 2000 / Lancet Oncol 2015)",
    "trial": "EORTC 22881-10886 (2015)",
    "doiUrl": "https://doi.org/10.1016/S1470-2045(14)71156-8",
    "citation": "Bartelink H, et al. Whole-breast irradiation with or without a boost for patients treated with breast-conserving surgery: 20-year follow-up of a randomised phase 3 trial. Lancet Oncol 2015;16(1):47-56."
  },
  {
    "id": "q-breast-ma20",
    "pillar": "CLINICAL",
    "category": "Breast",
    "organ": "Breast",
    "title": "NCIC CTG MA.20: Regional Nodal Irradiation in Node-Positive / High-Risk Breast Cancer",
    "clinicalCase": "A 52-year-old female with pT2 (2.4 cm) invasive ductal carcinoma undergoes lumpectomy. Axillary dissection reveals 2 positive lymph nodes (2/12) without extracapsular extension. She completes adjuvant dose-dense AC-T chemotherapy. What was the landmark conclusion of the NCIC CTG MA.20 / CCTG MA.20 trial regarding the addition of Regional Nodal Irradiation (RNI: internal mammary, supraclavicular, and high axillary nodes)?",
    "vignette": "A 52-year-old female with pT2 (2.4 cm) invasive ductal carcinoma undergoes lumpectomy. Axillary dissection reveals 2 positive lymph nodes (2/12) without extracapsular extension. She completes adjuvant dose-dense AC-T chemotherapy. What was the landmark conclusion of the NCIC CTG MA.20 / CCTG MA.20 trial regarding the addition of Regional Nodal Irradiation (RNI: internal mammary, supraclavicular, and high axillary nodes)?",
    "options": [
      {
        "id": "A",
        "text": "RNI provided no benefit in local or distant recurrence and doubled cardiac deaths"
      },
      {
        "id": "B",
        "text": "RNI significantly improved disease-free survival (DFS) and reduced distant metastasis, without a significant improvement in overall survival"
      },
      {
        "id": "C",
        "text": "RNI improved 10-year overall survival by 15% across all ER-positive cohorts"
      },
      {
        "id": "D",
        "text": "RNI is only beneficial if ≥ 4 positive axillary nodes are identified"
      }
    ],
    "correctAnswerId": "B",
    "correctIndex": 1,
    "explanation": "The NCIC CTG MA.20 Phase III trial (1,832 patients, Whelan et al., NEJM 2015) randomized women with node-positive (85% had 1-3 nodes) or high-risk node-negative disease to whole breast irradiation alone or WBRT + Regional Nodal Irradiation (internal mammary, supraclavicular, and axillary apex). At 10 years, RNI significantly improved disease-free survival (82.0% vs 77.0%, HR 0.76, p=0.01) and distant disease-free survival (HR 0.76, p=0.02). Overall survival was not significantly improved (82.8% vs 81.8%, HR 0.91, p=0.38). Lymphedema was increased (8.4% vs 4.5%).",
    "rationale": "The NCIC CTG MA.20 Phase III trial (1,832 patients, Whelan et al., NEJM 2015) randomized women with node-positive (85% had 1-3 nodes) or high-risk node-negative disease to whole breast irradiation alone or WBRT + Regional Nodal Irradiation (internal mammary, supraclavicular, and axillary apex). At 10 years, RNI significantly improved disease-free survival (82.0% vs 77.0%, HR 0.76, p=0.01) and distant disease-free survival (HR 0.76, p=0.02). Overall survival was not significantly improved (82.8% vs 81.8%, HR 0.91, p=0.38). Lymphedema was increased (8.4% vs 4.5%).",
    "distractorRationale": {
      "A": "RNI significantly reduced distant and locoregional recurrences; cardiac mortality was not significantly increased with modern 3D CT planning.",
      "C": "Overall survival was not significantly different (HR 0.91, p=0.38).",
      "D": "85% of patients in MA.20 had 1-3 positive nodes, validating RNI for this exact intermediate-risk cohort."
    },
    "distractorRationales": {
      "A": "RNI significantly reduced distant and locoregional recurrences; cardiac mortality was not significantly increased with modern 3D CT planning.",
      "C": "Overall survival was not significantly different (HR 0.91, p=0.38).",
      "D": "85% of patients in MA.20 had 1-3 positive nodes, validating RNI for this exact intermediate-risk cohort."
    },
    "landmarkTrialTitle": "NCIC CTG MA.20 Phase III Trial (NEJM 2015)",
    "trial": "MA.20 (2015)",
    "doiUrl": "https://doi.org/10.1056/NEJMoa1407072",
    "citation": "Whelan TJ, et al. Regional Nodal Irradiation in Early-Stage Breast Cancer. N Engl J Med 2015;373(4):307-316."
  },
  {
    "id": "q-breast-amaros",
    "pillar": "CLINICAL",
    "category": "Breast",
    "organ": "Breast",
    "title": "EORTC 10981-22023 AMAROS: Axillary Radiotherapy vs Axillary Dissection",
    "clinicalCase": "A 61-year-old female with cT1cN0 invasive ductal carcinoma undergoes lumpectomy and sentinel lymph node biopsy (SLNB). Histopathology shows 1 of 2 sentinel nodes has a 2.4 mm macrometastasis without extranodal extension. In the Phase III AMAROS trial, what was the comparison between Axillary Radiotherapy (ART) and Completion Axillary Lymph Node Dissection (ALND)?",
    "vignette": "A 61-year-old female with cT1cN0 invasive ductal carcinoma undergoes lumpectomy and sentinel lymph node biopsy (SLNB). Histopathology shows 1 of 2 sentinel nodes has a 2.4 mm macrometastasis without extranodal extension. In the Phase III AMAROS trial, what was the comparison between Axillary Radiotherapy (ART) and Completion Axillary Lymph Node Dissection (ALND)?",
    "options": [
      {
        "id": "A",
        "text": "Axillary recurrence was significantly higher with axillary radiotherapy (5-year rate 8.4% vs 0.5%)"
      },
      {
        "id": "B",
        "text": "Axillary radiotherapy provided equivalent locoregional control (<1.5% 10-year axillary recurrence) with half the rate of lymphedema compared to ALND"
      },
      {
        "id": "C",
        "text": "ALND resulted in significantly superior 10-year disease-free and overall survival"
      },
      {
        "id": "D",
        "text": "Axillary radiotherapy led to intolerable radiation brachial plexopathy in over 15% of patients"
      }
    ],
    "correctAnswerId": "B",
    "correctIndex": 1,
    "explanation": "The EORTC AMAROS trial (4,806 patients enrolled, 1,425 node-positive randomized; Lancet Oncol 2014 & 10-year follow-up Lancet Oncol 2023) compared ALND with axillary radiotherapy (50 Gy to axilla levels I-III and supraclavicular fossa) in cT1-2N0 patients with a positive sentinel node. At 10 years, axillary recurrence was 0.93% after ALND and 1.82% after ART (HR 1.71, p=0.37, equivalent). Crucially, clinical lymphedema at 5 years was significantly lower in the radiotherapy arm (11% vs 23%, p<0.0001), establishing axillary RT as an effective, less morbid alternative to ALND.",
    "rationale": "The EORTC AMAROS trial (4,806 patients enrolled, 1,425 node-positive randomized; Lancet Oncol 2014 & 10-year follow-up Lancet Oncol 2023) compared ALND with axillary radiotherapy (50 Gy to axilla levels I-III and supraclavicular fossa) in cT1-2N0 patients with a positive sentinel node. At 10 years, axillary recurrence was 0.93% after ALND and 1.82% after ART (HR 1.71, p=0.37, equivalent). Crucially, clinical lymphedema at 5 years was significantly lower in the radiotherapy arm (11% vs 23%, p<0.0001), establishing axillary RT as an effective, less morbid alternative to ALND.",
    "distractorRationale": {
      "A": "10-year axillary recurrence was < 2% in both arms (0.93% vs 1.82%, non-significant difference).",
      "C": "Overall survival (84.6% vs 81.4%) and disease-free survival were identical between arms.",
      "D": "Severe brachial plexopathy was negligible (< 0.5%) with modern anatomical contouring."
    },
    "distractorRationales": {
      "A": "10-year axillary recurrence was < 2% in both arms (0.93% vs 1.82%, non-significant difference).",
      "C": "Overall survival (84.6% vs 81.4%) and disease-free survival were identical between arms.",
      "D": "Severe brachial plexopathy was negligible (< 0.5%) with modern anatomical contouring."
    },
    "landmarkTrialTitle": "EORTC 10981-22023 AMAROS Phase III Trial (Lancet Oncol 2014 / 2023)",
    "trial": "AMAROS (2014 / 2023)",
    "doiUrl": "https://doi.org/10.1016/S1470-2045(14)70408-1",
    "citation": "Donker M, et al. Radiotherapy or surgery of the axilla after a positive sentinel node in breast cancer (AMAROS). Lancet Oncol 2014;15(12):1303-1310."
  },
  {
    "id": "q-thorax-pacific",
    "pillar": "CLINICAL",
    "category": "Thorax",
    "organ": "Thorax",
    "title": "PACIFIC: Durvalumab Consolidation in Unresectable Stage III NSCLC",
    "clinicalCase": "A 63-year-old male with unresectable Stage IIIA (cT3N2M0, subcarinal node involvement) lung adenocarcinoma completes definitive concurrent chemoradiotherapy (60 Gy in 30 fractions with concurrent weekly carboplatin and paclitaxel). Restaging CT at 3 weeks demonstrates a partial response with no progression. ECOG PS is 1. According to the PACIFIC trial, which consolidative therapy improves both progression-free and overall survival?",
    "vignette": "A 63-year-old male with unresectable Stage IIIA (cT3N2M0, subcarinal node involvement) lung adenocarcinoma completes definitive concurrent chemoradiotherapy (60 Gy in 30 fractions with concurrent weekly carboplatin and paclitaxel). Restaging CT at 3 weeks demonstrates a partial response with no progression. ECOG PS is 1. According to the PACIFIC trial, which consolidative therapy improves both progression-free and overall survival?",
    "options": [
      {
        "id": "A",
        "text": "Consolidative docetaxel chemotherapy for 2 cycles"
      },
      {
        "id": "B",
        "text": "Consolidative Durvalumab (10 mg/kg q2w or 1500 mg q4w) for up to 12 months"
      },
      {
        "id": "C",
        "text": "Observation until symptomatic progression"
      },
      {
        "id": "D",
        "text": "Consolidative Osimertinib regardless of EGFR mutation status"
      }
    ],
    "correctAnswerId": "B",
    "correctIndex": 1,
    "explanation": "The PACIFIC Phase III trial (713 patients, Antonia et al., NEJM 2017 & Spigel et al., JCO 2021) demonstrated that 12 months of consolidation durvalumab (anti-PD-L1 antibody) initiated within 1-42 days after definitive concurrent CRT significantly improved median PFS from 5.6 to 16.9 months (HR 0.55, p<0.001) and 5-year overall survival from 33.4% to 42.9% (HR 0.72, 95% CI 0.59–0.89). It is the global standard of care for non-progressing unresectable stage III NSCLC.",
    "rationale": "The PACIFIC Phase III trial (713 patients, Antonia et al., NEJM 2017 & Spigel et al., JCO 2021) demonstrated that 12 months of consolidation durvalumab (anti-PD-L1 antibody) initiated within 1-42 days after definitive concurrent CRT significantly improved median PFS from 5.6 to 16.9 months (HR 0.55, p<0.001) and 5-year overall survival from 33.4% to 42.9% (HR 0.72, 95% CI 0.59–0.89). It is the global standard of care for non-progressing unresectable stage III NSCLC.",
    "distractorRationale": {
      "A": "Consolidative chemotherapy was tested in HOG LUN 01-24 and failed to improve survival while adding severe toxicities.",
      "C": "Observation was the placebo control arm in PACIFIC, which was significantly inferior in PFS and OS.",
      "D": "Osimertinib is indicated only for EGFR-mutated stage III NSCLC based on the LAURA trial (2024), not for unselected wild-type patients."
    },
    "distractorRationales": {
      "A": "Consolidative chemotherapy was tested in HOG LUN 01-24 and failed to improve survival while adding severe toxicities.",
      "C": "Observation was the placebo control arm in PACIFIC, which was significantly inferior in PFS and OS.",
      "D": "Osimertinib is indicated only for EGFR-mutated stage III NSCLC based on the LAURA trial (2024), not for unselected wild-type patients."
    },
    "landmarkTrialTitle": "PACIFIC Phase III Trial (NEJM 2017 / JCO 2021)",
    "trial": "PACIFIC (2017 / 2021)",
    "doiUrl": "https://doi.org/10.1056/NEJMoa1709937",
    "citation": "Antonia SJ, et al. Durvalumab after Chemoradiotherapy in Stage III Non-Small-Cell Lung Cancer. N Engl J Med 2017;377(20):1919-1929."
  },
  {
    "id": "q-thorax-rtog-0236",
    "pillar": "CLINICAL",
    "category": "Thorax",
    "organ": "Thorax",
    "title": "RTOG 0236: SBRT for Medically Inoperable Peripheral Early-Stage NSCLC",
    "clinicalCase": "A 75-year-old male with severe emphysema (FEV1 35% predicted) presents with a biopsy-proven 2.2 cm peripheral T1bN0 adenocarcinoma in the right middle lobe, located > 2 cm from all mediastinal structures and the proximal bronchial tree. According to the landmark RTOG 0236 Phase II trial, what is the established stereotactic body radiation therapy (SBRT) regimen and primary tumor local control rate?",
    "vignette": "A 75-year-old male with severe emphysema (FEV1 35% predicted) presents with a biopsy-proven 2.2 cm peripheral T1bN0 adenocarcinoma in the right middle lobe, located > 2 cm from all mediastinal structures and the proximal bronchial tree. According to the landmark RTOG 0236 Phase II trial, what is the established stereotactic body radiation therapy (SBRT) regimen and primary tumor local control rate?",
    "options": [
      {
        "id": "A",
        "text": "60 Gy in 30 fractions; 3-year local control 60%"
      },
      {
        "id": "B",
        "text": "54 Gy in 3 fractions (prescribed to PTV cover); 3-year primary tumor control > 95%"
      },
      {
        "id": "C",
        "text": "45 Gy in 15 fractions; 3-year local control 75%"
      },
      {
        "id": "D",
        "text": "30 Gy in 1 fraction; 3-year local control 80%"
      }
    ],
    "correctAnswerId": "B",
    "correctIndex": 1,
    "explanation": "RTOG 0236 (Timmerman et al., JAMA 2010; 5-year update Lancet Oncol 2018) treated medically inoperable T1-T2 peripheral NSCLC with SBRT delivering 54 Gy in 3 fractions (delivered over 1.5–2 weeks, equivalent to 60 Gy in 3 fx without heterogeneity correction). At 3 years, primary tumor control was 97.6%, and 5-year primary tumor control was 92.7%. Grade 3/4 pulmonary adverse events occurred in only 16.3% of patients, validating 54 Gy in 3 fractions as a potent ablative standard for peripheral lesions.",
    "rationale": "RTOG 0236 (Timmerman et al., JAMA 2010; 5-year update Lancet Oncol 2018) treated medically inoperable T1-T2 peripheral NSCLC with SBRT delivering 54 Gy in 3 fractions (delivered over 1.5–2 weeks, equivalent to 60 Gy in 3 fx without heterogeneity correction). At 3 years, primary tumor control was 97.6%, and 5-year primary tumor control was 92.7%. Grade 3/4 pulmonary adverse events occurred in only 16.3% of patients, validating 54 Gy in 3 fractions as a potent ablative standard for peripheral lesions.",
    "distractorRationale": {
      "A": "60 Gy in 30 fractions is conventional radiotherapy with inferior local control (50-60%) compared to SBRT (>90%).",
      "C": "45 Gy in 15 fractions is a moderate palliative or hypofractionated scheme with biological effective dose (BED) < 100 Gy₁₀.",
      "D": "Single-fraction 30 Gy was explored in RTOG 0915 but 54 Gy in 3 fx was the benchmark established in RTOG 0236."
    },
    "distractorRationales": {
      "A": "60 Gy in 30 fractions is conventional radiotherapy with inferior local control (50-60%) compared to SBRT (>90%).",
      "C": "45 Gy in 15 fractions is a moderate palliative or hypofractionated scheme with biological effective dose (BED) < 100 Gy₁₀.",
      "D": "Single-fraction 30 Gy was explored in RTOG 0915 but 54 Gy in 3 fx was the benchmark established in RTOG 0236."
    },
    "landmarkTrialTitle": "RTOG 0236 Phase II Trial (JAMA 2010 / Lancet Oncol 2018)",
    "trial": "RTOG 0236 (2010 / 2018)",
    "doiUrl": "https://doi.org/10.1001/jama.2010.261",
    "citation": "Timmerman R, et al. Stereotactic body radiation therapy for inoperable early stage lung cancer. JAMA 2010;303(11):1070-1076."
  },
  {
    "id": "q-thorax-rtog-0813",
    "pillar": "CLINICAL",
    "category": "Thorax",
    "organ": "Thorax",
    "title": "RTOG 0813: Risk-Adapted SBRT for Centrally Located Early-Stage NSCLC",
    "clinicalCase": "A 69-year-old female with inoperable T2aN0 (3.2 cm) squamous cell lung carcinoma has a tumor located 1.2 cm from the carina and left mainstem bronchus (within the 2-cm \"no fly zone\" of the proximal bronchial tree). Applying 54 Gy in 3 fractions carries a high risk of airway necrosis or fatal hemoptysis. What dose and fractionation schedule was established by the Phase I/II RTOG 0813 trial for central lung lesions?",
    "vignette": "A 69-year-old female with inoperable T2aN0 (3.2 cm) squamous cell lung carcinoma has a tumor located 1.2 cm from the carina and left mainstem bronchus (within the 2-cm \"no fly zone\" of the proximal bronchial tree). Applying 54 Gy in 3 fractions carries a high risk of airway necrosis or fatal hemoptysis. What dose and fractionation schedule was established by the Phase I/II RTOG 0813 trial for central lung lesions?",
    "options": [
      {
        "id": "A",
        "text": "60 Gy in 3 fractions"
      },
      {
        "id": "B",
        "text": "50 Gy in 5 fractions"
      },
      {
        "id": "C",
        "text": "35 Gy in 10 fractions"
      },
      {
        "id": "D",
        "text": "40 Gy in 2 fractions"
      }
    ],
    "correctAnswerId": "B",
    "correctIndex": 1,
    "explanation": "The RTOG 0813 dose-escalation Phase I/II trial (Bezjak et al., JCO 2019) evaluated SBRT in medically inoperable centrally located stage I NSCLC within 2 cm of the proximal bronchial tree. The maximum tolerated and tested dose cohort was 50 Gy in 5 fractions (10 Gy/fx). At 50 Gy/5 fx, the 2-year primary tumor control was 87.7%, 2-year overall survival was 72.7%, and treatment-related dose-limiting toxicity occurred in only 7.2% of patients, validating 50 Gy in 5 fx as the risk-adapted standard for central lung tumors.",
    "rationale": "The RTOG 0813 dose-escalation Phase I/II trial (Bezjak et al., JCO 2019) evaluated SBRT in medically inoperable centrally located stage I NSCLC within 2 cm of the proximal bronchial tree. The maximum tolerated and tested dose cohort was 50 Gy in 5 fractions (10 Gy/fx). At 50 Gy/5 fx, the 2-year primary tumor control was 87.7%, 2-year overall survival was 72.7%, and treatment-related dose-limiting toxicity occurred in only 7.2% of patients, validating 50 Gy in 5 fx as the risk-adapted standard for central lung tumors.",
    "distractorRationale": {
      "A": "60 Gy in 3 fractions in central locations causes up to 30-40% severe bronchial stenosis, hemorrhage, or fatal necrosis (Timmerman 2006).",
      "C": "35 Gy in 10 fractions has a BED₁₀ of only 47 Gy, which is subtherapeutic for local eradication of early NSCLC.",
      "D": "2-fraction schemes are not safe in the mediastinal proximity."
    },
    "distractorRationales": {
      "A": "60 Gy in 3 fractions in central locations causes up to 30-40% severe bronchial stenosis, hemorrhage, or fatal necrosis (Timmerman 2006).",
      "C": "35 Gy in 10 fractions has a BED₁₀ of only 47 Gy, which is subtherapeutic for local eradication of early NSCLC.",
      "D": "2-fraction schemes are not safe in the mediastinal proximity."
    },
    "landmarkTrialTitle": "RTOG 0813 Phase I/II Trial (JCO 2019)",
    "trial": "RTOG 0813 (2019)",
    "doiUrl": "https://doi.org/10.1200/JCO.18.00622",
    "citation": "Bezjak A, et al. Safety and Efficacy of a Five-Fraction Stereotactic Body Radiotherapy Schedule for Centrally Located Non-Small-Cell Lung Cancer: NRG Oncology/RTOG 0813 Trial. J Clin Oncol 2019;37(15):1316-1325."
  },
  {
    "id": "q-thorax-convert",
    "pillar": "CLINICAL",
    "category": "Thorax",
    "organ": "Thorax",
    "title": "CONVERT: Twice-Daily vs Once-Daily Concurrent Chemoradiotherapy in LS-SCLC",
    "clinicalCase": "A 57-year-old male with good performance status (ECOG 0) is diagnosed with Limited-Stage Small Cell Lung Cancer (LS-SCLC, cT2N2M0). He is planned for concurrent chemoradiotherapy with Cisplatin and Etoposide. In the Phase III CONVERT trial comparing twice-daily (45 Gy in 30 fractions BID over 3 weeks) with high-dose once-daily (66 Gy in 33 fractions QD over 6.5 weeks), what was the outcome regarding overall survival and toxicity?",
    "vignette": "A 57-year-old male with good performance status (ECOG 0) is diagnosed with Limited-Stage Small Cell Lung Cancer (LS-SCLC, cT2N2M0). He is planned for concurrent chemoradiotherapy with Cisplatin and Etoposide. In the Phase III CONVERT trial comparing twice-daily (45 Gy in 30 fractions BID over 3 weeks) with high-dose once-daily (66 Gy in 33 fractions QD over 6.5 weeks), what was the outcome regarding overall survival and toxicity?",
    "options": [
      {
        "id": "A",
        "text": "Once-daily 66 Gy was markedly superior in survival with median OS of 42 vs 20 months"
      },
      {
        "id": "B",
        "text": "Twice-daily 45 Gy was not proven inferior to 66 Gy (median OS 30 vs 25 months; HR 1.18, p=0.14) with identical rates of grade 3/4 esophagitis (19%)"
      },
      {
        "id": "C",
        "text": "Twice-daily BID schedule caused a 45% rate of fatal radiation pneumonitis"
      },
      {
        "id": "D",
        "text": "Once-daily radiation resulted in zero locoregional recurrences"
      }
    ],
    "correctAnswerId": "B",
    "correctIndex": 1,
    "explanation": "The international Phase III CONVERT trial (547 patients, Faivre-Finn et al., Lancet Oncol 2017) evaluated whether modern once-daily 66 Gy was superior to the Turrisi standard twice-daily 45 Gy (1.5 Gy BID over 3 weeks). The trial showed no statistically significant difference in overall survival (median OS 30 months in BID vs 25 months in QD; HR 1.18, p=0.14). Grade 3/4 esophagitis was surprisingly identical between arms (19% in both), confirming twice-daily 45 Gy BID as a robust, non-inferior reference standard.",
    "rationale": "The international Phase III CONVERT trial (547 patients, Faivre-Finn et al., Lancet Oncol 2017) evaluated whether modern once-daily 66 Gy was superior to the Turrisi standard twice-daily 45 Gy (1.5 Gy BID over 3 weeks). The trial showed no statistically significant difference in overall survival (median OS 30 months in BID vs 25 months in QD; HR 1.18, p=0.14). Grade 3/4 esophagitis was surprisingly identical between arms (19% in both), confirming twice-daily 45 Gy BID as a robust, non-inferior reference standard.",
    "distractorRationale": {
      "A": "66 Gy QD was not superior to 45 Gy BID (median OS numerically favored 45 Gy BID: 30 vs 25 months).",
      "C": "Severe pneumonitis was rare (grade 3/4 in 2.5% of BID and 2.2% of QD patients).",
      "D": "Locoregional failure occurred in both arms without statistically significant difference."
    },
    "distractorRationales": {
      "A": "66 Gy QD was not superior to 45 Gy BID (median OS numerically favored 45 Gy BID: 30 vs 25 months).",
      "C": "Severe pneumonitis was rare (grade 3/4 in 2.5% of BID and 2.2% of QD patients).",
      "D": "Locoregional failure occurred in both arms without statistically significant difference."
    },
    "landmarkTrialTitle": "CONVERT Phase III Trial (Lancet Oncol 2017)",
    "trial": "CONVERT (2017)",
    "doiUrl": "https://doi.org/10.1016/S1470-2045(17)30318-2",
    "citation": "Faivre-Finn C, et al. Concurrent once-daily versus twice-daily chemoradiotherapy in patients with limited-stage small-cell lung cancer (CONVERT). Lancet Oncol 2017;18(8):1116-1125."
  },
  {
    "id": "q-thorax-sabr-comet",
    "pillar": "CLINICAL",
    "category": "Thorax",
    "organ": "Thorax",
    "title": "SABR-COMET: Stereotactic Ablative Radiotherapy in Oligometastatic Cancer",
    "clinicalCase": "A 66-year-old female with a controlled primary breast cancer presents with 2 metachronous asymptomatic metastases (1 in the right lung base, 1 in the posterior liver dome) on FDG PET-CT. In the randomized Phase II SABR-COMET trial investigating comprehensive stereotactic ablative radiotherapy (SABR) to 1–5 oligometastases in addition to standard of care, what was the primary survival impact at long-term follow-up?",
    "vignette": "A 66-year-old female with a controlled primary breast cancer presents with 2 metachronous asymptomatic metastases (1 in the right lung base, 1 in the posterior liver dome) on FDG PET-CT. In the randomized Phase II SABR-COMET trial investigating comprehensive stereotactic ablative radiotherapy (SABR) to 1–5 oligometastases in addition to standard of care, what was the primary survival impact at long-term follow-up?",
    "options": [
      {
        "id": "A",
        "text": "No difference in progression-free or overall survival"
      },
      {
        "id": "B",
        "text": "Significant improvement in 5-year overall survival from 17.7% to 42.3% (HR 0.57)"
      },
      {
        "id": "C",
        "text": "Improvement in local control only, with accelerated death from distant metastasis"
      },
      {
        "id": "D",
        "text": "Only patients with solitary brain metastases derived an overall survival benefit"
      }
    ],
    "correctAnswerId": "B",
    "correctIndex": 1,
    "explanation": "The SABR-COMET randomized trial (Palma et al., Lancet 2019; 5-year follow-up JCO 2020) enrolled 99 patients with controlled primary tumors and 1–5 oligometastatic lesions. Adding SABR to standard of care resulted in an absolute 24.6% improvement in 5-year overall survival (42.3% in SABR arm vs 17.7% in control arm, HR 0.57, p=0.006) and extended median survival from 28 to 50 months, cementing the paradigm of ablative local therapy for oligometastatic disease.",
    "rationale": "The SABR-COMET randomized trial (Palma et al., Lancet 2019; 5-year follow-up JCO 2020) enrolled 99 patients with controlled primary tumors and 1–5 oligometastatic lesions. Adding SABR to standard of care resulted in an absolute 24.6% improvement in 5-year overall survival (42.3% in SABR arm vs 17.7% in control arm, HR 0.57, p=0.006) and extended median survival from 28 to 50 months, cementing the paradigm of ablative local therapy for oligometastatic disease.",
    "distractorRationale": {
      "A": "Both PFS (HR 0.47) and OS (HR 0.57) were significantly prolonged with SABR.",
      "C": "Survival was significantly extended without accelerating out-of-field failures.",
      "D": "Patients with breast, colorectal, lung, and prostate oligometastases in bone, liver, and lung all derived benefit."
    },
    "distractorRationales": {
      "A": "Both PFS (HR 0.47) and OS (HR 0.57) were significantly prolonged with SABR.",
      "C": "Survival was significantly extended without accelerating out-of-field failures.",
      "D": "Patients with breast, colorectal, lung, and prostate oligometastases in bone, liver, and lung all derived benefit."
    },
    "landmarkTrialTitle": "SABR-COMET Randomized Phase II Trial (Lancet 2019 / JCO 2020)",
    "trial": "SABR-COMET (2019 / 2020)",
    "doiUrl": "https://doi.org/10.1200/JCO.20.00818",
    "citation": "Palma DA, et al. Stereotactic Ablative Radiotherapy for the Comprehensive Treatment of Oligometastatic Cancers: Long-Term Results of the SABR-COMET Phase II Randomized Trial. J Clin Oncol 2020;38(25):2830-2838."
  },
  {
    "id": "q-prostate-flame",
    "pillar": "CLINICAL",
    "category": "Prostate",
    "organ": "Prostate",
    "title": "FLAME: Focal Intraprostatic Boost to Intraprostatic Lesion in Prostate Cancer",
    "clinicalCase": "A 67-year-old male with high-risk localized prostate cancer (PSA 17 ng/mL, Gleason 4+4=8, cT2c) undergoes multiparametric MRI demonstrating a 2.1 cm dominant intraprostatic lesion (DIL) in the left peripheral zone with extracapsular abutment. In the Phase III FLAME trial, what clinical benefit was demonstrated by delivering a simultaneous integrated focal boost up to 95 Gy to the MRI-defined DIL?",
    "vignette": "A 67-year-old male with high-risk localized prostate cancer (PSA 17 ng/mL, Gleason 4+4=8, cT2c) undergoes multiparametric MRI demonstrating a 2.1 cm dominant intraprostatic lesion (DIL) in the left peripheral zone with extracapsular abutment. In the Phase III FLAME trial, what clinical benefit was demonstrated by delivering a simultaneous integrated focal boost up to 95 Gy to the MRI-defined DIL?",
    "options": [
      {
        "id": "A",
        "text": "Doubled rates of grade 4 rectourethral fistulas requiring colostomy"
      },
      {
        "id": "B",
        "text": "Significant improvement in 5-year biochemical disease-free survival (92% vs 85%, HR 0.45) with no increase in late severe GI or GU toxicity"
      },
      {
        "id": "C",
        "text": "No benefit in biochemical control and high rates of urethral strictures"
      },
      {
        "id": "D",
        "text": "Significant improvement only when combined with 36 months of bicalutamide monotherapy"
      }
    ],
    "correctAnswerId": "B",
    "correctIndex": 1,
    "explanation": "The FLAME Phase III randomized trial (571 patients, Kerkmeijer et al., JCO 2021) investigated standard EBRT (77 Gy in 35 fractions to the whole prostate) with or without an integrated focal boost up to 95 Gy (2.7 Gy/fx) to the MRI-defined dominant nodule while respecting strict organ-at-risk dose constraints. At 5 years, the focal boost significantly increased biochemical disease-free survival from 85% to 92% (HR 0.45, p<0.001) without increasing late grade ≥2 GU (28% vs 23%) or GI toxicities (13% vs 12%).",
    "rationale": "The FLAME Phase III randomized trial (571 patients, Kerkmeijer et al., JCO 2021) investigated standard EBRT (77 Gy in 35 fractions to the whole prostate) with or without an integrated focal boost up to 95 Gy (2.7 Gy/fx) to the MRI-defined dominant nodule while respecting strict organ-at-risk dose constraints. At 5 years, the focal boost significantly increased biochemical disease-free survival from 85% to 92% (HR 0.45, p<0.001) without increasing late grade ≥2 GU (28% vs 23%) or GI toxicities (13% vs 12%).",
    "distractorRationale": {
      "A": "Grade 4 toxicity was 0% in both arms due to strict urethral and rectal constraints.",
      "C": "bDFS was dramatically improved with HR 0.45 (hazard of failure reduced by 55%).",
      "D": "LHRH agonists with or without antiandrogen were used as standard; bicalutamide monotherapy was not part of the protocol."
    },
    "distractorRationales": {
      "A": "Grade 4 toxicity was 0% in both arms due to strict urethral and rectal constraints.",
      "C": "bDFS was dramatically improved with HR 0.45 (hazard of failure reduced by 55%).",
      "D": "LHRH agonists with or without antiandrogen were used as standard; bicalutamide monotherapy was not part of the protocol."
    },
    "landmarkTrialTitle": "FLAME Phase III Trial (JCO 2021)",
    "trial": "FLAME (2021)",
    "doiUrl": "https://doi.org/10.1200/JCO.20.02873",
    "citation": "Kerkmeijer LGW, et al. Focal Boost to the Intraprostatic Tumor in External Beam Radiotherapy for Patients With Localized Prostate Cancer: Results From the FLAME Randomized Phase III Trial. J Clin Oncol 2021;39(7):787-796."
  },
  {
    "id": "q-prostate-chhip",
    "pillar": "CLINICAL",
    "category": "Prostate",
    "organ": "Prostate",
    "title": "CHHiP: Moderate Hypofractionated Radiotherapy in Localized Prostate Cancer",
    "clinicalCase": "A 70-year-old male with intermediate-risk localized adenocarcinoma of the prostate (cT2a, PSA 7.8 ng/mL, Gleason 3+4=7) receives 4–6 months of neoadjuvant and concurrent ADT. Which moderate hypofractionated external beam radiotherapy schedule was proven non-inferior to conventional 74 Gy in 37 fractions in the 3,216-patient Phase III CHHiP trial?",
    "vignette": "A 70-year-old male with intermediate-risk localized adenocarcinoma of the prostate (cT2a, PSA 7.8 ng/mL, Gleason 3+4=7) receives 4–6 months of neoadjuvant and concurrent ADT. Which moderate hypofractionated external beam radiotherapy schedule was proven non-inferior to conventional 74 Gy in 37 fractions in the 3,216-patient Phase III CHHiP trial?",
    "options": [
      {
        "id": "A",
        "text": "50 Gy in 25 fractions over 5 weeks"
      },
      {
        "id": "B",
        "text": "60 Gy in 20 fractions over 4 weeks"
      },
      {
        "id": "C",
        "text": "70 Gy in 28 fractions over 5.6 weeks"
      },
      {
        "id": "D",
        "text": "36.25 Gy in 5 fractions over 2 weeks"
      }
    ],
    "correctAnswerId": "B",
    "correctIndex": 1,
    "explanation": "The UK CHHiP Phase III randomized non-inferiority trial (Dearnaley et al., Lancet Oncol 2016) randomized 3,216 men to 74 Gy in 37 fractions, 60 Gy in 20 fractions (3.0 Gy/fx), or 57 Gy in 19 fractions. At 5 years, biochemical or clinical failure-free survival was 88.3% for 74 Gy, 90.6% for 60 Gy (HR 0.84, non-inferiority p=0.0018), and 85.9% for 57 Gy. Long-term late bowel and bladder toxicity rates at 5 years were identical (< 2% grade ≥ 2), making 60 Gy in 20 fractions the international benchmark.",
    "rationale": "The UK CHHiP Phase III randomized non-inferiority trial (Dearnaley et al., Lancet Oncol 2016) randomized 3,216 men to 74 Gy in 37 fractions, 60 Gy in 20 fractions (3.0 Gy/fx), or 57 Gy in 19 fractions. At 5 years, biochemical or clinical failure-free survival was 88.3% for 74 Gy, 90.6% for 60 Gy (HR 0.84, non-inferiority p=0.0018), and 85.9% for 57 Gy. Long-term late bowel and bladder toxicity rates at 5 years were identical (< 2% grade ≥ 2), making 60 Gy in 20 fractions the international benchmark.",
    "distractorRationale": {
      "A": "50 Gy in 25 fractions has an EQD2 of only ~50 Gy, insufficient for definitive prostate cancer eradication.",
      "C": "70 Gy in 28 fractions is the PROFIT trial schedule (Catton et al.), not the CHHiP arm.",
      "D": "36.25 Gy in 5 fractions is ultra-hypofractionated SBRT (PACE-B / HYPO-RT-PC), not the CHHiP schedule."
    },
    "distractorRationales": {
      "A": "50 Gy in 25 fractions has an EQD2 of only ~50 Gy, insufficient for definitive prostate cancer eradication.",
      "C": "70 Gy in 28 fractions is the PROFIT trial schedule (Catton et al.), not the CHHiP arm.",
      "D": "36.25 Gy in 5 fractions is ultra-hypofractionated SBRT (PACE-B / HYPO-RT-PC), not the CHHiP schedule."
    },
    "landmarkTrialTitle": "CHHiP Phase III Trial (Lancet Oncol 2016)",
    "trial": "CHHiP (2016)",
    "doiUrl": "https://doi.org/10.1016/S1470-2045(16)30102-1",
    "citation": "Dearnaley D, et al. Conventional versus hypofractionated high-dose intensity-modulated radiotherapy for prostate cancer: 5-year results of the randomised, non-inferiority, phase 3 CHHiP trial. Lancet Oncol 2016;17(8):1047-1060."
  },
  {
    "id": "q-prostate-stampede",
    "pillar": "CLINICAL",
    "category": "Prostate",
    "organ": "Prostate",
    "title": "STAMPEDE Arm H: Radiotherapy to the Primary Tumor in Metastatic Prostate Cancer",
    "clinicalCase": "A 64-year-old male presents with de novo metastatic castrate-sensitive prostate cancer (mCSPC, PSA 55 ng/mL, Gleason 4+5=9). Whole-body MRI and bone scan reveal 3 asymptomatic osteoblastic metastases in the pelvic bones and L3 vertebral body (CHAARTED low-volume disease; no visceral metastases). He is starting ADT + novel androgen receptor pathway inhibitor. According to STAMPEDE Arm H, what is the role of prostate-directed radiotherapy?",
    "vignette": "A 64-year-old male presents with de novo metastatic castrate-sensitive prostate cancer (mCSPC, PSA 55 ng/mL, Gleason 4+5=9). Whole-body MRI and bone scan reveal 3 asymptomatic osteoblastic metastases in the pelvic bones and L3 vertebral body (CHAARTED low-volume disease; no visceral metastases). He is starting ADT + novel androgen receptor pathway inhibitor. According to STAMPEDE Arm H, what is the role of prostate-directed radiotherapy?",
    "options": [
      {
        "id": "A",
        "text": "Prostate RT is contraindicated because distant metastases preclude any local benefit"
      },
      {
        "id": "B",
        "text": "Prostate RT confers a statistically significant overall survival benefit specifically in low metastatic burden (3-year OS 81% vs 73%, HR 0.68)"
      },
      {
        "id": "C",
        "text": "Prostate RT should only be administered if the patient develops gross hematuria"
      },
      {
        "id": "D",
        "text": "Prostate RT improves survival equally in low-burden and high-burden metastatic disease"
      }
    ],
    "correctAnswerId": "B",
    "correctIndex": 1,
    "explanation": "STAMPEDE Arm H (Parker et al., Lancet 2018; 2,061 patients) demonstrated that adding local prostate radiotherapy (either 55 Gy in 20 fx or 36 Gy in 6 weekly fx) to standard systemic therapy in newly diagnosed metastatic prostate cancer significantly improved overall survival in men with low metastatic burden (pre-specified CHAARTED criteria: < 4 bone metastases and no visceral lesions). In low-burden patients, 3-year OS increased from 73% to 81% (HR 0.68, 95% CI 0.52–0.90, p=0.007). In patients with high burden, no overall survival benefit was observed.",
    "rationale": "STAMPEDE Arm H (Parker et al., Lancet 2018; 2,061 patients) demonstrated that adding local prostate radiotherapy (either 55 Gy in 20 fx or 36 Gy in 6 weekly fx) to standard systemic therapy in newly diagnosed metastatic prostate cancer significantly improved overall survival in men with low metastatic burden (pre-specified CHAARTED criteria: < 4 bone metastases and no visceral lesions). In low-burden patients, 3-year OS increased from 73% to 81% (HR 0.68, 95% CI 0.52–0.90, p=0.007). In patients with high burden, no overall survival benefit was observed.",
    "distractorRationale": {
      "A": "STAMPEDE Arm H revolutionized practice by demonstrating local RT improves survival in low-volume metastatic disease.",
      "C": "Prostate RT in STAMPEDE was given for oncologic survival benefit, not merely as symptom palliation.",
      "D": "Patients with high-volume disease did not experience an overall survival benefit from primary radiotherapy."
    },
    "distractorRationales": {
      "A": "STAMPEDE Arm H revolutionized practice by demonstrating local RT improves survival in low-volume metastatic disease.",
      "C": "Prostate RT in STAMPEDE was given for oncologic survival benefit, not merely as symptom palliation.",
      "D": "Patients with high-volume disease did not experience an overall survival benefit from primary radiotherapy."
    },
    "landmarkTrialTitle": "STAMPEDE Arm H Phase III Trial (Lancet 2018)",
    "trial": "STAMPEDE Arm H (2018)",
    "doiUrl": "https://doi.org/10.1016/S0140-6736(18)32486-3",
    "citation": "Parker CC, et al. Radiotherapy to the primary tumour for newly diagnosed, metastatic prostate cancer (STAMPEDE): a randomised controlled phase 3 trial. Lancet 2018;392(10162):2353-2366."
  },
  {
    "id": "q-gu-bc2001",
    "pillar": "CLINICAL",
    "category": "GU",
    "organ": "GU",
    "title": "BC2001: Trimodality Therapy with 5-FU and Mitomycin C in Muscle-Invasive Bladder Cancer",
    "clinicalCase": "A 72-year-old male with solitary cT2N0M0 muscle-invasive urothelial carcinoma of the bladder undergoes a maximally complete transurethral resection (TURBT). He is medically unfit for neoadjuvant cisplatin-based chemotherapy due to chronic kidney disease (GFR 38 mL/min) and strongly desires bladder preservation. What is the proven concurrent radiosensitizing chemotherapy regimen established by the landmark Phase III BC2001 trial?",
    "vignette": "A 72-year-old male with solitary cT2N0M0 muscle-invasive urothelial carcinoma of the bladder undergoes a maximally complete transurethral resection (TURBT). He is medically unfit for neoadjuvant cisplatin-based chemotherapy due to chronic kidney disease (GFR 38 mL/min) and strongly desires bladder preservation. What is the proven concurrent radiosensitizing chemotherapy regimen established by the landmark Phase III BC2001 trial?",
    "options": [
      {
        "id": "A",
        "text": "Single-agent Gemcitabine 1000 mg/m² weekly"
      },
      {
        "id": "B",
        "text": "Fluorouracil (5-FU) continuous infusion + Mitomycin C (MMC)"
      },
      {
        "id": "C",
        "text": "Oral Capecitabine daily without radiotherapy"
      },
      {
        "id": "D",
        "text": "High-dose Methotrexate, Vinblastine, Doxorubicin, Cisplatin (MVAC)"
      }
    ],
    "correctAnswerId": "B",
    "correctIndex": 1,
    "explanation": "The BC2001 Phase III trial (James et al., NEJM 2012; 360 patients) established that combining radiotherapy (55 Gy in 20 fx or 64 Gy in 32 fx) with synchronous 5-Fluorouracil (500 mg/m²/day on days 1–5 and 16–20) and Mitomycin C (12 mg/m² IV bolus on day 1) significantly reduced the 2-year locoregional recurrence rate by 32% (HR 0.68, 95% CI 0.48–0.96, p=0.03; 2-year locoregional disease-free rate 67% vs 54%) without increasing late grade 3/4 bladder or bowel toxicity.",
    "rationale": "The BC2001 Phase III trial (James et al., NEJM 2012; 360 patients) established that combining radiotherapy (55 Gy in 20 fx or 64 Gy in 32 fx) with synchronous 5-Fluorouracil (500 mg/m²/day on days 1–5 and 16–20) and Mitomycin C (12 mg/m² IV bolus on day 1) significantly reduced the 2-year locoregional recurrence rate by 32% (HR 0.68, 95% CI 0.48–0.96, p=0.03; 2-year locoregional disease-free rate 67% vs 54%) without increasing late grade 3/4 bladder or bowel toxicity.",
    "distractorRationale": {
      "A": "Gemcitabine is radiosensitizing and used as an alternative (e.g. Choudhury et al.), but 5-FU/MMC was the regimen validated in the definitive Phase III BC2001 trial.",
      "C": "Chemotherapy alone without definitive radiotherapy or cystectomy results in high local failure in muscle-invasive disease.",
      "D": "MVAC is a neoadjuvant systemic regimen, not a concurrent radiosensitizing protocol, and is nephrotoxic."
    },
    "distractorRationales": {
      "A": "Gemcitabine is radiosensitizing and used as an alternative (e.g. Choudhury et al.), but 5-FU/MMC was the regimen validated in the definitive Phase III BC2001 trial.",
      "C": "Chemotherapy alone without definitive radiotherapy or cystectomy results in high local failure in muscle-invasive disease.",
      "D": "MVAC is a neoadjuvant systemic regimen, not a concurrent radiosensitizing protocol, and is nephrotoxic."
    },
    "landmarkTrialTitle": "BC2001 Phase III Trial (NEJM 2012)",
    "trial": "BC2001 (2012)",
    "doiUrl": "https://doi.org/10.1056/NEJMoa1111440",
    "citation": "James ND, et al. Radiotherapy with or without chemotherapy in muscle-invasive bladder cancer. N Engl J Med 2012;366(16):1477-1488."
  },
  {
    "id": "q-gi-rapido",
    "pillar": "CLINICAL",
    "category": "GI",
    "organ": "GI",
    "title": "RAPIDO: Short-Course Radiotherapy and Preoperative Chemotherapy in High-Risk Rectal Cancer",
    "clinicalCase": "A 54-year-old male presents with locally advanced high-risk mid-rectal adenocarcinoma (cT3c cN2 M0, extramural venous invasion [EMVI] positive, mesorectal fascia [MRF] threatened at 1 mm). According to the Phase III RAPIDO trial, what is the experimental Total Neoadjuvant Therapy (TNT) regimen that significantly reduced disease-related treatment failure (DrTF) and doubled the pathologic complete response (pCR) rate?",
    "vignette": "A 54-year-old male presents with locally advanced high-risk mid-rectal adenocarcinoma (cT3c cN2 M0, extramural venous invasion [EMVI] positive, mesorectal fascia [MRF] threatened at 1 mm). According to the Phase III RAPIDO trial, what is the experimental Total Neoadjuvant Therapy (TNT) regimen that significantly reduced disease-related treatment failure (DrTF) and doubled the pathologic complete response (pCR) rate?",
    "options": [
      {
        "id": "A",
        "text": "Long-course chemoradiotherapy (50.4 Gy) followed by immediate surgery and no systemic therapy"
      },
      {
        "id": "B",
        "text": "Short-course radiotherapy (5 × 5 Gy) followed by 6 cycles of CAPOX (or 9 cycles of mFOLFOX6) prior to total mesorectal excision (TME)"
      },
      {
        "id": "C",
        "text": "Induction immunotherapy with Ipilimumab followed by surgery"
      },
      {
        "id": "D",
        "text": "Definitive chemoradiation to 60 Gy without surgical resection in all patients"
      }
    ],
    "correctAnswerId": "B",
    "correctIndex": 1,
    "explanation": "The RAPIDO trial (912 high-risk rectal cancer patients; Hospers et al., Lancet Oncol 2021) compared standard preoperative long-course chemoradiotherapy (50.4 Gy + capecitabine) with TNT consisting of short-course radiotherapy (5 × 5 Gy) followed by systemic chemotherapy (6 cycles CAPOX or 9 cycles mFOLFOX6) and then TME. At 3 years, the TNT arm significantly reduced disease-related treatment failure (23.7% vs 30.4%, HR 0.75, p=0.019), reduced distant metastases (20.0% vs 26.8%, HR 0.69), and doubled the pCR rate (28.4% vs 14.3%).",
    "rationale": "The RAPIDO trial (912 high-risk rectal cancer patients; Hospers et al., Lancet Oncol 2021) compared standard preoperative long-course chemoradiotherapy (50.4 Gy + capecitabine) with TNT consisting of short-course radiotherapy (5 × 5 Gy) followed by systemic chemotherapy (6 cycles CAPOX or 9 cycles mFOLFOX6) and then TME. At 3 years, the TNT arm significantly reduced disease-related treatment failure (23.7% vs 30.4%, HR 0.75, p=0.019), reduced distant metastases (20.0% vs 26.8%, HR 0.69), and doubled the pCR rate (28.4% vs 14.3%).",
    "distractorRationale": {
      "A": "Standard long-course CRT with optional postoperative chemo was the comparator arm, which had higher distant metastasis and half the pCR rate.",
      "C": "Immunotherapy alone is only applicable in mismatch repair-deficient (dMMR/MSI-H) tumors (Cercek et al.), not general rectal cancer.",
      "D": "RAPIDO was a preoperative trial requiring TME surgery in all non-progressing patients."
    },
    "distractorRationales": {
      "A": "Standard long-course CRT with optional postoperative chemo was the comparator arm, which had higher distant metastasis and half the pCR rate.",
      "C": "Immunotherapy alone is only applicable in mismatch repair-deficient (dMMR/MSI-H) tumors (Cercek et al.), not general rectal cancer.",
      "D": "RAPIDO was a preoperative trial requiring TME surgery in all non-progressing patients."
    },
    "landmarkTrialTitle": "RAPIDO Phase III Trial (Lancet Oncol 2021 / Ann Oncol 2023)",
    "trial": "RAPIDO (2021 / 2023)",
    "doiUrl": "https://doi.org/10.1016/S1470-2045(20)30555-6",
    "citation": "Bahadoer RR, et al. Short-course radiotherapy followed by chemotherapy before total mesorectal excision (RAPIDO): a randomised, open-label, phase 3 trial. Lancet Oncol 2021;22(1):29-42."
  },
  {
    "id": "q-gi-opra",
    "pillar": "CLINICAL",
    "category": "GI",
    "organ": "GI",
    "title": "OPRA: Sequencing Total Neoadjuvant Therapy for Organ Preservation in Rectal Cancer",
    "clinicalCase": "A 51-year-old female presents with distal rectal adenocarcinoma (cT3N1, 3.5 cm from anal verge). An abdominoperineal resection (APR) with permanent colostomy would be required if treated by traditional surgery. She desires organ preservation via a Watch-and-Wait strategy if a clinical complete response (cCR) is achieved. In the Phase II randomized OPRA trial, which TNT sequencing strategy achieved higher 3-year organ preservation?",
    "vignette": "A 51-year-old female presents with distal rectal adenocarcinoma (cT3N1, 3.5 cm from anal verge). An abdominoperineal resection (APR) with permanent colostomy would be required if treated by traditional surgery. She desires organ preservation via a Watch-and-Wait strategy if a clinical complete response (cCR) is achieved. In the Phase II randomized OPRA trial, which TNT sequencing strategy achieved higher 3-year organ preservation?",
    "options": [
      {
        "id": "A",
        "text": "Induction chemotherapy followed by long-course chemoradiotherapy (INCT-CRT)"
      },
      {
        "id": "B",
        "text": "Long-course chemoradiotherapy followed by consolidation chemotherapy (CRT-CNCT)"
      },
      {
        "id": "C",
        "text": "Both sequences had identical 10% organ preservation rates"
      },
      {
        "id": "D",
        "text": "Short-course radiotherapy without chemotherapy"
      }
    ],
    "correctAnswerId": "B",
    "correctIndex": 1,
    "explanation": "The OPRA trial (324 patients; Garcia-Aguilar et al., JCO 2022) evaluated organ preservation in locally advanced rectal cancer by comparing induction chemotherapy followed by CRT (INCT-CRT) versus CRT followed by consolidation chemotherapy (CRT-CNCT). Patients with clinical complete response were managed with Watch-and-Wait. At 3 years, organ preservation was significantly higher in the consolidation group (53% in CRT-CNCT vs 41% in INCT-CRT, p=0.01), while 3-year disease-free survival (76% in both arms) and overall survival were identical.",
    "rationale": "The OPRA trial (324 patients; Garcia-Aguilar et al., JCO 2022) evaluated organ preservation in locally advanced rectal cancer by comparing induction chemotherapy followed by CRT (INCT-CRT) versus CRT followed by consolidation chemotherapy (CRT-CNCT). Patients with clinical complete response were managed with Watch-and-Wait. At 3 years, organ preservation was significantly higher in the consolidation group (53% in CRT-CNCT vs 41% in INCT-CRT, p=0.01), while 3-year disease-free survival (76% in both arms) and overall survival were identical.",
    "distractorRationale": {
      "A": "Induction chemotherapy had a 41% organ preservation rate, significantly lower than the 53% achieved by consolidation chemotherapy.",
      "C": "Organ preservation rates were 53% vs 41%, demonstrating that more than half of patients avoided radical resection.",
      "D": "Short-course radiation without systemic chemotherapy was not evaluated in OPRA."
    },
    "distractorRationales": {
      "A": "Induction chemotherapy had a 41% organ preservation rate, significantly lower than the 53% achieved by consolidation chemotherapy.",
      "C": "Organ preservation rates were 53% vs 41%, demonstrating that more than half of patients avoided radical resection.",
      "D": "Short-course radiation without systemic chemotherapy was not evaluated in OPRA."
    },
    "landmarkTrialTitle": "OPRA Randomized Trial (JCO 2022)",
    "trial": "OPRA (2022)",
    "doiUrl": "https://doi.org/10.1200/JCO.22.00032",
    "citation": "Garcia-Aguilar J, et al. Organ Preservation in Patients With Rectal Cancer Treated With Total Neoadjuvant Therapy. J Clin Oncol 2022;40(23):2546-2556."
  },
  {
    "id": "q-gi-cross",
    "pillar": "CLINICAL",
    "category": "GI",
    "organ": "GI",
    "title": "CROSS: Preoperative Chemoradiotherapy for Esophageal and Junctional Cancer",
    "clinicalCase": "A 62-year-old male with resectable cT3N1M0 adenocarcinoma of the distal esophagus and gastroesophageal junction (Siewert type I) is evaluated for neoadjuvant therapy. According to the Phase III CROSS trial (van Hagen et al., NEJM 2012; 10-year follow-up JCO 2021), what preoperative chemoradiotherapy regimen and long-term survival impact was established?",
    "vignette": "A 62-year-old male with resectable cT3N1M0 adenocarcinoma of the distal esophagus and gastroesophageal junction (Siewert type I) is evaluated for neoadjuvant therapy. According to the Phase III CROSS trial (van Hagen et al., NEJM 2012; 10-year follow-up JCO 2021), what preoperative chemoradiotherapy regimen and long-term survival impact was established?",
    "options": [
      {
        "id": "A",
        "text": "50.4 Gy with Cisplatin and 5-FU, with a 5% increase in perioperative mortality"
      },
      {
        "id": "B",
        "text": "41.4 Gy in 23 fractions with weekly Carboplatin and Paclitaxel, doubling median overall survival (48.6 vs 24.0 months; HR 0.68)"
      },
      {
        "id": "C",
        "text": "30 Gy in 10 fractions with Epirubicin, with no survival difference compared to surgery alone"
      },
      {
        "id": "D",
        "text": "45 Gy in 25 fractions with Oxaliplatin, showing benefit only in squamous cell carcinoma"
      }
    ],
    "correctAnswerId": "B",
    "correctIndex": 1,
    "explanation": "The Dutch CROSS trial (368 patients; NEJM 2012 & 10-yr JCO 2021) demonstrated that preoperative chemoradiotherapy with 41.4 Gy (1.8 Gy/fx) and weekly carboplatin (AUC 2) + paclitaxel (50 mg/m²) significantly improved median overall survival from 24.0 months with surgery alone to 48.6 months with nCRT (HR 0.68, p=0.003). At 10 years, overall survival was 38% vs 25%. Pathologic complete response (pCR) was 29% overall (49% in squamous cell carcinoma, 23% in adenocarcinoma) with clear surgical R0 resection achieved in 92% vs 69%.",
    "rationale": "The Dutch CROSS trial (368 patients; NEJM 2012 & 10-yr JCO 2021) demonstrated that preoperative chemoradiotherapy with 41.4 Gy (1.8 Gy/fx) and weekly carboplatin (AUC 2) + paclitaxel (50 mg/m²) significantly improved median overall survival from 24.0 months with surgery alone to 48.6 months with nCRT (HR 0.68, p=0.003). At 10 years, overall survival was 38% vs 25%. Pathologic complete response (pCR) was 29% overall (49% in squamous cell carcinoma, 23% in adenocarcinoma) with clear surgical R0 resection achieved in 92% vs 69%.",
    "distractorRationale": {
      "A": "50.4 Gy with Cisplatin/5-FU was the older RTOG 85-01 / CALGB 9781 regimen, which has higher acute toxicity than CROSS.",
      "C": "Epirubicin-based triplets (ECF) were tested in MAGIC as perioperative chemotherapy without RT, not in CROSS.",
      "D": "CROSS demonstrated significant overall survival benefit in both adenocarcinoma (median OS 43.2 vs 27.1 mos) and squamous cell carcinoma (median OS 81.6 vs 21.1 mos)."
    },
    "distractorRationales": {
      "A": "50.4 Gy with Cisplatin/5-FU was the older RTOG 85-01 / CALGB 9781 regimen, which has higher acute toxicity than CROSS.",
      "C": "Epirubicin-based triplets (ECF) were tested in MAGIC as perioperative chemotherapy without RT, not in CROSS.",
      "D": "CROSS demonstrated significant overall survival benefit in both adenocarcinoma (median OS 43.2 vs 27.1 mos) and squamous cell carcinoma (median OS 81.6 vs 21.1 mos)."
    },
    "landmarkTrialTitle": "CROSS Phase III Trial (NEJM 2012 / JCO 2021)",
    "trial": "CROSS (2012 / 2021)",
    "doiUrl": "https://doi.org/10.1056/NEJMoa1110805",
    "citation": "van Hagen P, et al. Preoperative chemoradiotherapy for esophageal or junctional cancer. N Engl J Med 2012;366(22):2074-2084."
  },
  {
    "id": "q-gi-artist2",
    "pillar": "CLINICAL",
    "category": "GI",
    "organ": "GI",
    "title": "ARTIST-2: Adjuvant Chemoradiotherapy in D2-Resected Node-Positive Gastric Cancer",
    "clinicalCase": "A 57-year-old male undergoes curative total gastrectomy with standard D2 lymphadenectomy for gastric antrum adenocarcinoma. Final surgical pathology confirms pT3 pN2 (5/22 positive regional lymph nodes) with R0 margins. According to the Phase III ARTIST-2 trial, what is the role of adjuvant chemoradiotherapy (SOX-RT: 45 Gy + S-1) compared to adjuvant chemotherapy alone (SOX)?",
    "vignette": "A 57-year-old male undergoes curative total gastrectomy with standard D2 lymphadenectomy for gastric antrum adenocarcinoma. Final surgical pathology confirms pT3 pN2 (5/22 positive regional lymph nodes) with R0 margins. According to the Phase III ARTIST-2 trial, what is the role of adjuvant chemoradiotherapy (SOX-RT: 45 Gy + S-1) compared to adjuvant chemotherapy alone (SOX)?",
    "options": [
      {
        "id": "A",
        "text": "SOX-RT significantly reduces locoregional recurrence compared to SOX alone, while both SOX and SOX-RT achieve superior 3-year disease-free survival over S-1 monotherapy"
      },
      {
        "id": "B",
        "text": "Adjuvant RT is strictly detrimental after D2 gastrectomy and should never be offered"
      },
      {
        "id": "C",
        "text": "SOX-RT is indicated only in Stage I disease"
      },
      {
        "id": "D",
        "text": "Radiotherapy provides no benefit in local control or disease-free survival regardless of nodal status"
      }
    ],
    "correctAnswerId": "A",
    "correctIndex": 0,
    "explanation": "The ARTIST-2 Phase III trial (546 patients; Park et al., JCO 2021) evaluated stage II/III, D2-resected, node-positive gastric cancer randomized to S-1 monotherapy, SOX (S-1 + oxaliplatin), or SOX-RT (SOX followed by 45 Gy chemoradiation). Both SOX and SOX-RT demonstrated significantly superior 3-year disease-free survival over S-1 alone (74.3% in SOX, HR 0.69; 72.8% in SOX-RT, HR 0.72 vs 64.8% in S-1). Importantly, locoregional recurrence was significantly lower in the SOX-RT arm compared to SOX alone.",
    "rationale": "The ARTIST-2 Phase III trial (546 patients; Park et al., JCO 2021) evaluated stage II/III, D2-resected, node-positive gastric cancer randomized to S-1 monotherapy, SOX (S-1 + oxaliplatin), or SOX-RT (SOX followed by 45 Gy chemoradiation). Both SOX and SOX-RT demonstrated significantly superior 3-year disease-free survival over S-1 alone (74.3% in SOX, HR 0.69; 72.8% in SOX-RT, HR 0.72 vs 64.8% in S-1). Importantly, locoregional recurrence was significantly lower in the SOX-RT arm compared to SOX alone.",
    "distractorRationale": {
      "B": "RT is not detrimental; it provides robust locoregional sterilization, particularly in node-positive and D1-resected cases.",
      "C": "Stage I gastric cancer does not require adjuvant therapy.",
      "D": "Locoregional recurrence was specifically reduced in patients receiving radiation."
    },
    "distractorRationales": {
      "B": "RT is not detrimental; it provides robust locoregional sterilization, particularly in node-positive and D1-resected cases.",
      "C": "Stage I gastric cancer does not require adjuvant therapy.",
      "D": "Locoregional recurrence was specifically reduced in patients receiving radiation."
    },
    "landmarkTrialTitle": "ARTIST-2 Phase III Trial (JCO 2021)",
    "trial": "ARTIST-2 (2021)",
    "doiUrl": "https://doi.org/10.1200/JCO.20.02725",
    "citation": "Park SH, et al. Adjuvant Chemotherapy With S-1 Plus Oxaliplatin With or Without Radiotherapy for Gastric Cancer (ARTIST 2). J Clin Oncol 2021;39(19):2153-2163."
  },
  {
    "id": "q-hn-rtog-1016",
    "pillar": "CLINICAL",
    "category": "Head & Neck",
    "organ": "Head & Neck",
    "title": "RTOG 1016: De-Escalation with Cetuximab vs Cisplatin in HPV-Positive Oropharyngeal Cancer",
    "clinicalCase": "A 54-year-old non-smoking male presents with p16-positive (HPV-related) squamous cell carcinoma of the left palatine tonsil (cT2 cN1 M0, Stage I by AJCC 8th edition). He is planned for definitive accelerated radiotherapy (70 Gy in 35 fractions over 6 weeks). In the landmark Phase III RTOG 1016 trial (and parallel De-ESCALATE trial), what was the outcome of de-escalating therapy by substituting Cisplatin with Cetuximab (EGFR inhibitor)?",
    "vignette": "A 54-year-old non-smoking male presents with p16-positive (HPV-related) squamous cell carcinoma of the left palatine tonsil (cT2 cN1 M0, Stage I by AJCC 8th edition). He is planned for definitive accelerated radiotherapy (70 Gy in 35 fractions over 6 weeks). In the landmark Phase III RTOG 1016 trial (and parallel De-ESCALATE trial), what was the outcome of de-escalating therapy by substituting Cisplatin with Cetuximab (EGFR inhibitor)?",
    "options": [
      {
        "id": "A",
        "text": "Cetuximab was non-inferior with 50% lower acute mucositis"
      },
      {
        "id": "B",
        "text": "Cetuximab resulted in significantly inferior overall survival (5-year OS 77.9% vs 84.6%, HR 1.45) and higher locoregional failure (17.3% vs 9.9%), without reducing severe toxicity"
      },
      {
        "id": "C",
        "text": "Cetuximab was superior to Cisplatin in overall survival for non-smokers"
      },
      {
        "id": "D",
        "text": "Both agents had identical survival but Cetuximab eliminated late dysphagia"
      }
    ],
    "correctAnswerId": "B",
    "correctIndex": 1,
    "explanation": "RTOG 1016 (849 HPV-positive oropharynx patients; Gillison et al., Lancet 2019) and the European De-ESCALATE trial tested whether Cetuximab could replace Cisplatin (100 mg/m² days 1 and 22) to reduce toxicity. Cetuximab failed the non-inferiority criteria and was markedly inferior: 5-year OS was 77.9% with Cetuximab vs 84.6% with Cisplatin (HR 1.45, p=0.016), and 5-year locoregional failure nearly doubled (17.3% vs 9.9%, HR 1.83). Overall grade 3/4 toxicity rates were identical (~80%), proving Cisplatin is irreplaceable as standard radiosensitizer in HPV+ oropharyngeal cancer.",
    "rationale": "RTOG 1016 (849 HPV-positive oropharynx patients; Gillison et al., Lancet 2019) and the European De-ESCALATE trial tested whether Cetuximab could replace Cisplatin (100 mg/m² days 1 and 22) to reduce toxicity. Cetuximab failed the non-inferiority criteria and was markedly inferior: 5-year OS was 77.9% with Cetuximab vs 84.6% with Cisplatin (HR 1.45, p=0.016), and 5-year locoregional failure nearly doubled (17.3% vs 9.9%, HR 1.83). Overall grade 3/4 toxicity rates were identical (~80%), proving Cisplatin is irreplaceable as standard radiosensitizer in HPV+ oropharyngeal cancer.",
    "distractorRationale": {
      "A": "Cetuximab was inferior in survival and did not reduce severe acute or late toxicity.",
      "C": "Cisplatin was superior in all subgroups, including non-smokers and low-risk patients.",
      "D": "Rates of late dysphagia, gastrostomy tube dependency, and xerostomia were not reduced by Cetuximab."
    },
    "distractorRationales": {
      "A": "Cetuximab was inferior in survival and did not reduce severe acute or late toxicity.",
      "C": "Cisplatin was superior in all subgroups, including non-smokers and low-risk patients.",
      "D": "Rates of late dysphagia, gastrostomy tube dependency, and xerostomia were not reduced by Cetuximab."
    },
    "landmarkTrialTitle": "RTOG 1016 Phase III Trial (Lancet 2019)",
    "trial": "RTOG 1016 (2019)",
    "doiUrl": "https://doi.org/10.1016/S0140-6736(18)32771-5",
    "citation": "Gillison ML, et al. Radiotherapy plus cetuximab or cisplatin in human papillomavirus-positive oropharyngeal cancer (NRG Oncology RTOG 1016). Lancet 2019;393(10166):40-50."
  },
  {
    "id": "q-hn-eortc-22931",
    "pillar": "CLINICAL",
    "category": "Head & Neck",
    "organ": "Head & Neck",
    "title": "EORTC 22931 / RTOG 9501: High-Risk Postoperative Head and Neck Chemoradiotherapy",
    "clinicalCase": "A 59-year-old male undergoes composite resection and neck dissection for a T3N2b squamous cell carcinoma of the oral tongue. Final pathology reveals an invasive 3.4 cm tumor with negative bone margins, but 2 of 28 lymph nodes are positive, with 1 node demonstrating 3 mm extracapsular nodal extension (ENE) into soft tissue, and the mucosal resection margin is microscopically positive (R1, tumor on ink). Based on the landmark pooled analysis of EORTC 22931 and RTOG 9501, what is the mandatory adjuvant recommendation?",
    "vignette": "A 59-year-old male undergoes composite resection and neck dissection for a T3N2b squamous cell carcinoma of the oral tongue. Final pathology reveals an invasive 3.4 cm tumor with negative bone margins, but 2 of 28 lymph nodes are positive, with 1 node demonstrating 3 mm extracapsular nodal extension (ENE) into soft tissue, and the mucosal resection margin is microscopically positive (R1, tumor on ink). Based on the landmark pooled analysis of EORTC 22931 and RTOG 9501, what is the mandatory adjuvant recommendation?",
    "options": [
      {
        "id": "A",
        "text": "Adjuvant radiotherapy alone to 50 Gy"
      },
      {
        "id": "B",
        "text": "Adjuvant concurrent chemoradiotherapy (60–66 Gy with high-dose Cisplatin 100 mg/m² on days 1, 22, 43)"
      },
      {
        "id": "C",
        "text": "Adjuvant Pembrolizumab immunotherapy alone"
      },
      {
        "id": "D",
        "text": "Observation until clinical disease recurrence"
      }
    ],
    "correctAnswerId": "B",
    "correctIndex": 1,
    "explanation": "The landmark pooled analysis of EORTC 22931 (Bernier et al.) and RTOG 9501 (Cooper et al., published in Head & Neck 2005) demonstrated that the addition of concurrent high-dose cisplatin (100 mg/m² q3w) to postoperative radiotherapy (60–66 Gy) confers a statistically significant overall survival benefit (HR 0.78) and locoregional control benefit exclusively in two major high-risk pathological features: microscopically positive surgical margins (R1) and extracapsular nodal extension (ENE). Other intermediate risk features (perineural invasion, lymphovascular invasion, single node) did not demonstrate a clear overall survival benefit from chemotherapy.",
    "rationale": "The landmark pooled analysis of EORTC 22931 (Bernier et al.) and RTOG 9501 (Cooper et al., published in Head & Neck 2005) demonstrated that the addition of concurrent high-dose cisplatin (100 mg/m² q3w) to postoperative radiotherapy (60–66 Gy) confers a statistically significant overall survival benefit (HR 0.78) and locoregional control benefit exclusively in two major high-risk pathological features: microscopically positive surgical margins (R1) and extracapsular nodal extension (ENE). Other intermediate risk features (perineural invasion, lymphovascular invasion, single node) did not demonstrate a clear overall survival benefit from chemotherapy.",
    "distractorRationale": {
      "A": "Radiotherapy alone is insufficient for patients with ENE or positive margins based on the pooled Phase III data.",
      "C": "Adjuvant immunotherapy alone without concurrent chemoradiation is not standard of care.",
      "D": "Observation carries an unacceptably high local recurrence rate (> 50%) in high-risk resected disease."
    },
    "distractorRationales": {
      "A": "Radiotherapy alone is insufficient for patients with ENE or positive margins based on the pooled Phase III data.",
      "C": "Adjuvant immunotherapy alone without concurrent chemoradiation is not standard of care.",
      "D": "Observation carries an unacceptably high local recurrence rate (> 50%) in high-risk resected disease."
    },
    "landmarkTrialTitle": "EORTC 22931 / RTOG 9501 Pooled Analysis (NEJM 2004 / Head Neck 2005)",
    "trial": "Bernier / Cooper Pooled (2005)",
    "doiUrl": "https://doi.org/10.1002/hed.20279",
    "citation": "Bernier J, et al. Defining risk levels in locally advanced head and neck cancers: a comparative analysis of concurrent postoperative radiation plus chemotherapy trials of the EORTC (#22931) and RTOG (#9501). Head Neck 2005;27(10):843-850."
  },
  {
    "id": "q-hn-pet-neck",
    "pillar": "CLINICAL",
    "category": "Head & Neck",
    "organ": "Head & Neck",
    "title": "PET-NECK: Surveillance PET-CT vs Planned Neck Dissection in N2/N3 Head and Neck Cancer",
    "clinicalCase": "A 60-year-old male with Stage IVA (T3N2bM0) hypopharyngeal squamous cell carcinoma with bilateral 3.5 cm lymphadenopathy completes definitive concurrent chemoradiotherapy (70 Gy with 3 cycles of Cisplatin). At 12 weeks post-treatment, restaging 18F-FDG PET-CT shows complete metabolic response in the primary tumor bed and all cervical lymph nodes. In the Phase III PET-NECK trial, what is the recommended management of the neck?",
    "vignette": "A 60-year-old male with Stage IVA (T3N2bM0) hypopharyngeal squamous cell carcinoma with bilateral 3.5 cm lymphadenopathy completes definitive concurrent chemoradiotherapy (70 Gy with 3 cycles of Cisplatin). At 12 weeks post-treatment, restaging 18F-FDG PET-CT shows complete metabolic response in the primary tumor bed and all cervical lymph nodes. In the Phase III PET-NECK trial, what is the recommended management of the neck?",
    "options": [
      {
        "id": "A",
        "text": "Bilateral comprehensive neck dissection regardless of PET response"
      },
      {
        "id": "B",
        "text": "Surveillance with serial clinical exams and imaging; omit neck dissection in complete metabolic responders"
      },
      {
        "id": "C",
        "text": "Repeat biopsy of all previously enlarged lymph nodes"
      },
      {
        "id": "D",
        "text": "Prophylactic re-irradiation to 40 Gy"
      }
    ],
    "correctAnswerId": "B",
    "correctIndex": 1,
    "explanation": "The UK PET-NECK Phase III trial (564 patients; Mehanna et al., NEJM 2016) randomized patients with locally advanced nodal disease (N2/N3) undergoing definitive CRT to planned neck dissection or surveillance guided by 12-week PET-CT (neck dissection performed only if incomplete/equivocal metabolic response). 2-year overall survival was non-inferior (84.9% with PET-CT surveillance vs 81.5% with planned neck dissection, HR 0.92). Surveillance reduced neck dissections from 78% to 19%, significantly reducing surgical complications and hospital costs.",
    "rationale": "The UK PET-NECK Phase III trial (564 patients; Mehanna et al., NEJM 2016) randomized patients with locally advanced nodal disease (N2/N3) undergoing definitive CRT to planned neck dissection or surveillance guided by 12-week PET-CT (neck dissection performed only if incomplete/equivocal metabolic response). 2-year overall survival was non-inferior (84.9% with PET-CT surveillance vs 81.5% with planned neck dissection, HR 0.92). Surveillance reduced neck dissections from 78% to 19%, significantly reducing surgical complications and hospital costs.",
    "distractorRationale": {
      "A": "Planned neck dissection was historically mandated but proven non-superior in PET-NECK while causing high surgical morbidity.",
      "C": "Biopsy of nodes with complete metabolic response on PET is unnecessary and traumatic.",
      "D": "Re-irradiation is contraindicated in complete responders."
    },
    "distractorRationales": {
      "A": "Planned neck dissection was historically mandated but proven non-superior in PET-NECK while causing high surgical morbidity.",
      "C": "Biopsy of nodes with complete metabolic response on PET is unnecessary and traumatic.",
      "D": "Re-irradiation is contraindicated in complete responders."
    },
    "landmarkTrialTitle": "PET-NECK Phase III Trial (NEJM 2016)",
    "trial": "PET-NECK (2016)",
    "doiUrl": "https://doi.org/10.1056/NEJMoa1514493",
    "citation": "Mehanna H, et al. PET-CT-Guided Watchful Waiting versus Planned Neck Dissection for Advanced Nodal Metastases in Head and Neck Cancer. N Engl J Med 2016;374(15):1444-1454."
  },
  {
    "id": "q-cns-stupp",
    "pillar": "CLINICAL",
    "category": "CNS",
    "organ": "CNS",
    "title": "EORTC 26981 / NCIC CE.3 (Stupp Protocol): Chemoradiotherapy in Glioblastoma",
    "clinicalCase": "A 56-year-old male with ECOG PS 1 undergoes maximal safe resection of a left temporal lobe Glioblastoma (IDH-wildtype, MGMT promoter methylated). According to the landmark EORTC 26981/22981 - NCIC CE.3 trial (Stupp et al., NEJM 2005 & 5-year Lancet Oncol 2009), what definitive adjuvant treatment protocol established the international standard of care?",
    "vignette": "A 56-year-old male with ECOG PS 1 undergoes maximal safe resection of a left temporal lobe Glioblastoma (IDH-wildtype, MGMT promoter methylated). According to the landmark EORTC 26981/22981 - NCIC CE.3 trial (Stupp et al., NEJM 2005 & 5-year Lancet Oncol 2009), what definitive adjuvant treatment protocol established the international standard of care?",
    "options": [
      {
        "id": "A",
        "text": "Whole brain radiotherapy 40 Gy with Carmustine (BCNU) wafers"
      },
      {
        "id": "B",
        "text": "Focal radiotherapy 60 Gy in 30 fractions with daily concurrent Temozolomide (75 mg/m²/day), followed by 6 cycles of adjuvant maintenance Temozolomide (150–200 mg/m²)"
      },
      {
        "id": "C",
        "text": "Radiotherapy 60 Gy alone with Temozolomide reserved exclusively for tumor recurrence"
      },
      {
        "id": "D",
        "text": "Stereotactic radiosurgery 24 Gy in 1 fraction followed by Bevacizumab"
      }
    ],
    "correctAnswerId": "B",
    "correctIndex": 1,
    "explanation": "The Stupp trial (573 patients; NEJM 2005) demonstrated that adding daily concurrent temozolomide (75 mg/m²/day throughout RT including weekends) to 60 Gy in 30 fractions focal radiotherapy, followed by 6 maintenance cycles (150–200 mg/m² on days 1–5 every 28 days), significantly increased median overall survival from 12.1 to 14.6 months (HR 0.63, p<0.001) and 5-year overall survival from 1.9% to 9.8% (Lancet Oncol 2009). Patients with MGMT promoter methylation derived the greatest survival benefit (2-year OS 46.0% vs 13.8%).",
    "rationale": "The Stupp trial (573 patients; NEJM 2005) demonstrated that adding daily concurrent temozolomide (75 mg/m²/day throughout RT including weekends) to 60 Gy in 30 fractions focal radiotherapy, followed by 6 maintenance cycles (150–200 mg/m² on days 1–5 every 28 days), significantly increased median overall survival from 12.1 to 14.6 months (HR 0.63, p<0.001) and 5-year overall survival from 1.9% to 9.8% (Lancet Oncol 2009). Patients with MGMT promoter methylation derived the greatest survival benefit (2-year OS 46.0% vs 13.8%).",
    "distractorRationale": {
      "A": "Whole brain radiotherapy is contraindicated due to severe cognitive deterioration with no survival advantage over focal RT.",
      "C": "Radiotherapy alone without concurrent temozolomide was the control arm, which resulted in significantly inferior survival.",
      "D": "Single-fraction SRS has no role as primary definitive treatment for multifocal infiltrative glioblastoma."
    },
    "distractorRationales": {
      "A": "Whole brain radiotherapy is contraindicated due to severe cognitive deterioration with no survival advantage over focal RT.",
      "C": "Radiotherapy alone without concurrent temozolomide was the control arm, which resulted in significantly inferior survival.",
      "D": "Single-fraction SRS has no role as primary definitive treatment for multifocal infiltrative glioblastoma."
    },
    "landmarkTrialTitle": "EORTC 26981 / NCIC CE.3 Stupp Trial (NEJM 2005 / Lancet Oncol 2009)",
    "trial": "Stupp Protocol (2005 / 2009)",
    "doiUrl": "https://doi.org/10.1056/NEJMoa043330",
    "citation": "Stupp R, et al. Radiotherapy plus concomitant and adjuvant temozolomide for glioblastoma. N Engl J Med 2005;352(10):987-996."
  },
  {
    "id": "q-cns-alliance-a071801",
    "pillar": "CLINICAL",
    "category": "CNS",
    "organ": "CNS",
    "title": "Alliance A071801 / NCCTG N0577: SRS Alone vs SRS + WBRT for Brain Metastases",
    "clinicalCase": "A 61-year-old female with systemic metastatic breast cancer on stable trastuzumab develops 2 newly diagnosed asymptomatic brain metastases (1.6 cm right parietal, 1.1 cm left cerebellar). KPS is 90. According to the Phase III Alliance / NCCTG N0577 trial (Brown et al., JAMA 2016), what was the comparison between Stereotactic Radiosurgery (SRS) alone and SRS plus Whole Brain Radiotherapy (WBRT)?",
    "vignette": "A 61-year-old female with systemic metastatic breast cancer on stable trastuzumab develops 2 newly diagnosed asymptomatic brain metastases (1.6 cm right parietal, 1.1 cm left cerebellar). KPS is 90. According to the Phase III Alliance / NCCTG N0577 trial (Brown et al., JAMA 2016), what was the comparison between Stereotactic Radiosurgery (SRS) alone and SRS plus Whole Brain Radiotherapy (WBRT)?",
    "options": [
      {
        "id": "A",
        "text": "SRS + WBRT significantly improved overall survival by 8 months"
      },
      {
        "id": "B",
        "text": "SRS alone demonstrated equivalent overall survival with significantly less cognitive decline at 3 months (63.5% vs 91.7%) and better quality of life"
      },
      {
        "id": "C",
        "text": "SRS alone caused immediate leptomeningeal dissemination in over 30% of patients"
      },
      {
        "id": "D",
        "text": "WBRT was superior in motor preservation and daily functioning"
      }
    ],
    "correctAnswerId": "B",
    "correctIndex": 1,
    "explanation": "In the Alliance A071801 / NCCTG N0577 Phase III trial (213 patients with 1–3 brain metastases; Brown et al., JAMA 2016), patients randomized to SRS alone experienced significantly less cognitive deterioration at 3 months compared to SRS + WBRT (63.5% vs 91.7%, p<0.001), with better verbal memory, motor speed, and executive function. Importantly, overall survival was identical (median OS 10.4 months for SRS alone vs 7.4 months for SRS + WBRT, HR 1.02, p=0.92), establishing SRS alone as standard of care.",
    "rationale": "In the Alliance A071801 / NCCTG N0577 Phase III trial (213 patients with 1–3 brain metastases; Brown et al., JAMA 2016), patients randomized to SRS alone experienced significantly less cognitive deterioration at 3 months compared to SRS + WBRT (63.5% vs 91.7%, p<0.001), with better verbal memory, motor speed, and executive function. Importantly, overall survival was identical (median OS 10.4 months for SRS alone vs 7.4 months for SRS + WBRT, HR 1.02, p=0.92), establishing SRS alone as standard of care.",
    "distractorRationale": {
      "A": "Adding WBRT to SRS did NOT improve overall survival in Alliance N0577, EORTC 22952-26001, or JROSG 99-1.",
      "C": "Leptomeningeal disease is rare (< 5%) and not accelerated by modern frame-based or frameless SRS.",
      "D": "Quality of life and cognitive functioning were significantly worse in patients receiving WBRT."
    },
    "distractorRationales": {
      "A": "Adding WBRT to SRS did NOT improve overall survival in Alliance N0577, EORTC 22952-26001, or JROSG 99-1.",
      "C": "Leptomeningeal disease is rare (< 5%) and not accelerated by modern frame-based or frameless SRS.",
      "D": "Quality of life and cognitive functioning were significantly worse in patients receiving WBRT."
    },
    "landmarkTrialTitle": "Alliance A071801 / NCCTG N0577 Phase III Trial (JAMA 2016)",
    "trial": "Alliance A071801 (2016)",
    "doiUrl": "https://doi.org/10.1001/jama.2016.9839",
    "citation": "Brown PD, et al. Effect of Radiosurgery Alone vs Radiosurgery With Whole-Brain Radiation Therapy on Cognitive Function in Patients With 1 to 3 Brain Metastases. JAMA 2016;316(4):401-409."
  },
  {
    "id": "q-cns-nrg-cc001",
    "pillar": "CLINICAL",
    "category": "CNS",
    "organ": "CNS",
    "title": "NRG Oncology CC001: Hippocampal Avoidance in Whole Brain Radiotherapy",
    "clinicalCase": "A 64-year-old female with widely disseminated non-melanoma brain metastases (> 10 lesions; no metastasis within 5 mm of the bilateral hippocampi) requires whole brain radiation therapy (30 Gy in 10 fractions). In the Phase III NRG Oncology CC001 trial, what intervention significantly preserved neurocognitive function and memory compared to conventional WBRT plus memantine?",
    "vignette": "A 64-year-old female with widely disseminated non-melanoma brain metastases (> 10 lesions; no metastasis within 5 mm of the bilateral hippocampi) requires whole brain radiation therapy (30 Gy in 10 fractions). In the Phase III NRG Oncology CC001 trial, what intervention significantly preserved neurocognitive function and memory compared to conventional WBRT plus memantine?",
    "options": [
      {
        "id": "A",
        "text": "Hyperbaric oxygen during whole brain irradiation"
      },
      {
        "id": "B",
        "text": "Hippocampal Avoidance using IMRT/VMAT (HA-WBRT) combined with Memantine"
      },
      {
        "id": "C",
        "text": "High-dose Dexamethasone (32 mg/day) throughout treatment"
      },
      {
        "id": "D",
        "text": "Adding concurrent Temozolomide to WBRT"
      }
    ],
    "correctAnswerId": "B",
    "correctIndex": 1,
    "explanation": "The NRG CC001 Phase III trial (518 patients; Brown et al., JCO 2020) demonstrated that conformal avoidance of the hippocampal neural stem cell compartments (HA-WBRT; D100% to hippocampus ≤ 9 Gy and max dose ≤ 16 Gy) in combination with memantine significantly reduced the risk of cognitive function failure (HR 0.74, 95% CI 0.58–0.95, p=0.02) compared to standard WBRT + memantine. Deterioration in Hopkins Verbal Learning Test (HVLT-R) delayed recall at 6 months was reduced from 68.2% to 50.5%, with no differences in intracranial progression-free survival or overall survival.",
    "rationale": "The NRG CC001 Phase III trial (518 patients; Brown et al., JCO 2020) demonstrated that conformal avoidance of the hippocampal neural stem cell compartments (HA-WBRT; D100% to hippocampus ≤ 9 Gy and max dose ≤ 16 Gy) in combination with memantine significantly reduced the risk of cognitive function failure (HR 0.74, 95% CI 0.58–0.95, p=0.02) compared to standard WBRT + memantine. Deterioration in Hopkins Verbal Learning Test (HVLT-R) delayed recall at 6 months was reduced from 68.2% to 50.5%, with no differences in intracranial progression-free survival or overall survival.",
    "distractorRationale": {
      "A": "Hyperbaric oxygen does not protect neural stem cells from radiation injury.",
      "C": "High-dose dexamethasone causes myopathy, psychosis, and metabolic toxicity without cognitive preservation.",
      "D": "Temozolomide adds myelosuppression and does not protect against neurocognitive decline."
    },
    "distractorRationales": {
      "A": "Hyperbaric oxygen does not protect neural stem cells from radiation injury.",
      "C": "High-dose dexamethasone causes myopathy, psychosis, and metabolic toxicity without cognitive preservation.",
      "D": "Temozolomide adds myelosuppression and does not protect against neurocognitive decline."
    },
    "landmarkTrialTitle": "NRG Oncology CC001 Phase III Trial (JCO 2020)",
    "trial": "NRG CC001 (2020)",
    "doiUrl": "https://doi.org/10.1200/JCO.19.02767",
    "citation": "Brown PD, et al. Hippocampal Avoidance During Whole-Brain Radiotherapy Plus Memantine for Patients With Brain Metastases: Phase III Trial NRG Oncology CC001. J Clin Oncol 2020;38(10):1019-1029."
  },
  {
    "id": "q-gyn-embrace2",
    "pillar": "CLINICAL",
    "category": "Gynecology",
    "organ": "Gynecology",
    "title": "EMBRACE-II: 3D Image-Guided Adaptive Brachytherapy (IGABT) in Cervical Cancer",
    "clinicalCase": "A 49-year-old female presents with Stage IIB squamous cell carcinoma of the uterine cervix (4.5 cm tumor extending into the left parametrium). She is treated with definitive chemoradiotherapy (45 Gy in 25 fractions to the pelvis with weekly Cisplatin) and is now receiving MRI-guided adaptive brachytherapy (IGABT). According to the international EMBRACE / EMBRACE-II benchmarks, what is the mandatory minimum EQD2 dose (using α/β = 10) to the High-Risk Clinical Target Volume (HR-CTV D90) required to achieve > 90% local tumor control?",
    "vignette": "A 49-year-old female presents with Stage IIB squamous cell carcinoma of the uterine cervix (4.5 cm tumor extending into the left parametrium). She is treated with definitive chemoradiotherapy (45 Gy in 25 fractions to the pelvis with weekly Cisplatin) and is now receiving MRI-guided adaptive brachytherapy (IGABT). According to the international EMBRACE / EMBRACE-II benchmarks, what is the mandatory minimum EQD2 dose (using α/β = 10) to the High-Risk Clinical Target Volume (HR-CTV D90) required to achieve > 90% local tumor control?",
    "options": [
      {
        "id": "A",
        "text": "HR-CTV D90 ≥ 65 Gy EQD2"
      },
      {
        "id": "B",
        "text": "HR-CTV D90 ≥ 85 Gy EQD2 (ideally 90–95 Gy for large tumors)"
      },
      {
        "id": "C",
        "text": "HR-CTV D90 ≥ 115 Gy EQD2"
      },
      {
        "id": "D",
        "text": "Point A dose of 70 Gy without 3D volume contouring"
      }
    ],
    "correctAnswerId": "B",
    "correctIndex": 1,
    "explanation": "The prospective multi-institutional EMBRACE studies (Pötter et al., Lancet Oncol 2021) demonstrated that 3D MRI-guided adaptive brachytherapy (IGABT) delivers unprecedented 5-year local control of 92% and overall survival of 74% in locally advanced cervical cancer. The dose-effect relationship confirmed that achieving HR-CTV D90 ≥ 85 Gy EQD2 (EBRT + brachytherapy combined) results in local control > 90%, whereas doses < 85 Gy correlate with higher recurrence. Strict organ constraints (rectum D2cc < 65 Gy, bladder D2cc < 80–85 Gy) keep severe morbidity < 5%.",
    "rationale": "The prospective multi-institutional EMBRACE studies (Pötter et al., Lancet Oncol 2021) demonstrated that 3D MRI-guided adaptive brachytherapy (IGABT) delivers unprecedented 5-year local control of 92% and overall survival of 74% in locally advanced cervical cancer. The dose-effect relationship confirmed that achieving HR-CTV D90 ≥ 85 Gy EQD2 (EBRT + brachytherapy combined) results in local control > 90%, whereas doses < 85 Gy correlate with higher recurrence. Strict organ constraints (rectum D2cc < 65 Gy, bladder D2cc < 80–85 Gy) keep severe morbidity < 5%.",
    "distractorRationale": {
      "A": "65 Gy EQD2 is subtherapeutic for macroscopic cervical carcinoma and has an unacceptably high local relapse rate.",
      "C": "115 Gy EQD2 exceeds normal tissue tolerances and causes severe rectovaginal and vesicovaginal fistulae.",
      "D": "2D Point A prescribing ignores true 3D tumor volume and normal tissue D2cc anatomy."
    },
    "distractorRationales": {
      "A": "65 Gy EQD2 is subtherapeutic for macroscopic cervical carcinoma and has an unacceptably high local relapse rate.",
      "C": "115 Gy EQD2 exceeds normal tissue tolerances and causes severe rectovaginal and vesicovaginal fistulae.",
      "D": "2D Point A prescribing ignores true 3D tumor volume and normal tissue D2cc anatomy."
    },
    "landmarkTrialTitle": "EMBRACE-I Prospective Multicentre Study (Lancet Oncol 2021)",
    "trial": "EMBRACE (2021)",
    "doiUrl": "https://doi.org/10.1016/S1470-2045(20)30753-1",
    "citation": "Pötter R, et al. MRI-guided adaptive brachytherapy in locally advanced cervical cancer (EMBRACE-I): a multicentre prospective cohort study. Lancet Oncol 2021;22(4):538-547."
  },
  {
    "id": "q-gyn-portec3",
    "pillar": "CLINICAL",
    "category": "Gynecology",
    "organ": "Gynecology",
    "title": "PORTEC-3: Adjuvant Chemoradiotherapy vs Radiotherapy Alone in High-Risk Endometrial Cancer",
    "clinicalCase": "A 63-year-old female undergoes total hysterectomy and bilateral salpingo-oophorectomy for endometrial carcinoma. Pathology reveals Stage III endometrioid adenocarcinoma (deep myometrial invasion, pelvic nodal involvement, clear lymphovascular space invasion). In the Phase III PORTEC-3 trial (de Boer et al., Lancet Oncol 2018 / 2019), what was the survival benefit of adding chemotherapy (concurrent Cisplatin followed by 4 cycles of Carboplatin/Paclitaxel) to pelvic external beam radiotherapy (48.6 Gy)?",
    "vignette": "A 63-year-old female undergoes total hysterectomy and bilateral salpingo-oophorectomy for endometrial carcinoma. Pathology reveals Stage III endometrioid adenocarcinoma (deep myometrial invasion, pelvic nodal involvement, clear lymphovascular space invasion). In the Phase III PORTEC-3 trial (de Boer et al., Lancet Oncol 2018 / 2019), what was the survival benefit of adding chemotherapy (concurrent Cisplatin followed by 4 cycles of Carboplatin/Paclitaxel) to pelvic external beam radiotherapy (48.6 Gy)?",
    "options": [
      {
        "id": "A",
        "text": "No difference in failure-free survival or overall survival in any subgroup"
      },
      {
        "id": "B",
        "text": "Statistically significant improvement in 5-year overall survival (81.4% vs 76.1%, HR 0.70) and failure-free survival, with the greatest benefit in Stage III disease (5-year FFS 69.3% vs 58.0%)"
      },
      {
        "id": "C",
        "text": "Benefit restricted exclusively to Stage IA clear cell carcinoma"
      },
      {
        "id": "D",
        "text": "Doubling of pelvic recurrence with no distant control benefit"
      }
    ],
    "correctAnswerId": "B",
    "correctIndex": 1,
    "explanation": "The PORTEC-3 Phase III randomized trial (660 high-risk endometrial cancer patients; de Boer et al., Lancet Oncol 2019) demonstrated that adding chemotherapy (2 cycles concurrent cisplatin 50 mg/m² during EBRT followed by 4 cycles carboplatin AUC 5 + paclitaxel 175 mg/m²) to pelvic radiotherapy significantly improved 5-year overall survival (81.4% vs 76.1%, HR 0.70, p=0.034) and 5-year failure-free survival (75.5% vs 68.6%, HR 0.71, p=0.012). The absolute benefit was most pronounced in Stage III patients, where 5-year failure-free survival increased by 11.3% (69.3% vs 58.0%, HR 0.66).",
    "rationale": "The PORTEC-3 Phase III randomized trial (660 high-risk endometrial cancer patients; de Boer et al., Lancet Oncol 2019) demonstrated that adding chemotherapy (2 cycles concurrent cisplatin 50 mg/m² during EBRT followed by 4 cycles carboplatin AUC 5 + paclitaxel 175 mg/m²) to pelvic radiotherapy significantly improved 5-year overall survival (81.4% vs 76.1%, HR 0.70, p=0.034) and 5-year failure-free survival (75.5% vs 68.6%, HR 0.71, p=0.012). The absolute benefit was most pronounced in Stage III patients, where 5-year failure-free survival increased by 11.3% (69.3% vs 58.0%, HR 0.66).",
    "distractorRationale": {
      "A": "Chemoradiotherapy significantly prolonged both OS (HR 0.70) and FFS (HR 0.71).",
      "C": "Stage III patients and serous carcinoma patients derived the greatest benefit, not Stage IA.",
      "D": "Pelvic control was high in both arms, but chemotherapy significantly reduced distant metastases."
    },
    "distractorRationales": {
      "A": "Chemoradiotherapy significantly prolonged both OS (HR 0.70) and FFS (HR 0.71).",
      "C": "Stage III patients and serous carcinoma patients derived the greatest benefit, not Stage IA.",
      "D": "Pelvic control was high in both arms, but chemotherapy significantly reduced distant metastases."
    },
    "landmarkTrialTitle": "PORTEC-3 Phase III Trial (Lancet Oncol 2018 / 2019)",
    "trial": "PORTEC-3 (2018 / 2019)",
    "doiUrl": "https://doi.org/10.1016/S1470-2045(19)30395-X",
    "citation": "de Boer SM, et al. Adjuvant chemoradiotherapy versus radiotherapy alone for women with high-risk endometrial cancer (PORTEC-3): final results of an international, open-label, multicentre, randomised, phase 3 trial. Lancet Oncol 2019;20(9):1273-1285."
  },
  {
    "id": "q-palliative-rtog-9714",
    "pillar": "CLINICAL",
    "category": "Palliative",
    "organ": "Palliative",
    "title": "RTOG 9714: Single-Fraction vs Multi-Fraction Radiotherapy for Bone Metastases",
    "clinicalCase": "A 68-year-old male with metastatic castration-resistant prostate cancer presents with severe focal pain (numeric rating scale 8/10) over an uncomplicated osteoblastic right iliac bone metastasis. There is no neurologic deficit, spinal instability, or pathologic fracture. According to the Phase III RTOG 9714 trial (and updated ASTRO evidence-based guidelines), what was concluded regarding single-fraction (8 Gy in 1 fx) versus multi-fraction (30 Gy in 10 fx) radiotherapy?",
    "vignette": "A 68-year-old male with metastatic castration-resistant prostate cancer presents with severe focal pain (numeric rating scale 8/10) over an uncomplicated osteoblastic right iliac bone metastasis. There is no neurologic deficit, spinal instability, or pathologic fracture. According to the Phase III RTOG 9714 trial (and updated ASTRO evidence-based guidelines), what was concluded regarding single-fraction (8 Gy in 1 fx) versus multi-fraction (30 Gy in 10 fx) radiotherapy?",
    "options": [
      {
        "id": "A",
        "text": "Single-fraction 8 Gy had an unacceptably low pain relief rate (< 25%)"
      },
      {
        "id": "B",
        "text": "Single-fraction 8 Gy provides equivalent pain relief (complete and partial response rates ~65%) with equal toxicity, albeit with higher retreatment rates (18% vs 9%)"
      },
      {
        "id": "C",
        "text": "30 Gy in 10 fractions significantly improved overall survival by 6 months"
      },
      {
        "id": "D",
        "text": "Multi-fraction regimens are mandatory for all prostate cancer bone metastases"
      }
    ],
    "correctAnswerId": "B",
    "correctIndex": 1,
    "explanation": "The RTOG 9714 Phase III randomized trial (898 patients; Hartsell et al., JAMA 2005) compared single-fraction 8 Gy with 30 Gy in 10 fractions for painful, uncomplicated bone metastases (breast and prostate). At 3 months, overall pain relief rates were equivalent (65% in 8 Gy vs 66% in 30 Gy; complete response 15% vs 17%). Acute toxicity was lower with 8 Gy. While retreatment rates were higher with 8 Gy (18% vs 9%), retreatment is safe, and 8 Gy provides maximal convenience and cost-effectiveness for palliative patients.",
    "rationale": "The RTOG 9714 Phase III randomized trial (898 patients; Hartsell et al., JAMA 2005) compared single-fraction 8 Gy with 30 Gy in 10 fractions for painful, uncomplicated bone metastases (breast and prostate). At 3 months, overall pain relief rates were equivalent (65% in 8 Gy vs 66% in 30 Gy; complete response 15% vs 17%). Acute toxicity was lower with 8 Gy. While retreatment rates were higher with 8 Gy (18% vs 9%), retreatment is safe, and 8 Gy provides maximal convenience and cost-effectiveness for palliative patients.",
    "distractorRationale": {
      "A": "Pain relief rates were identical (~65-66%) across international meta-analyses (Chow et al.).",
      "C": "Fractionation schedules for palliative bone metastases have zero impact on overall survival.",
      "D": "Single-fraction 8 Gy is endorsed by ASTRO, ESTRO, and NCCN as the preferred standard for uncomplicated bone metastases."
    },
    "distractorRationales": {
      "A": "Pain relief rates were identical (~65-66%) across international meta-analyses (Chow et al.).",
      "C": "Fractionation schedules for palliative bone metastases have zero impact on overall survival.",
      "D": "Single-fraction 8 Gy is endorsed by ASTRO, ESTRO, and NCCN as the preferred standard for uncomplicated bone metastases."
    },
    "landmarkTrialTitle": "RTOG 9714 Phase III Trial (JAMA 2005)",
    "trial": "RTOG 9714 (2005)",
    "doiUrl": "https://doi.org/10.1001/jama.294.7.787",
    "citation": "Hartsell WF, et al. Randomized trial of short- versus long-course radiotherapy for palliation of painful bone metastases. J Natl Cancer Inst 2005;97(11):798-804."
  },
  {
    "id": "q-radiobio-eqd2",
    "pillar": "RADIOBIOLOGY",
    "category": "LQ Model",
    "organ": "LQ Model",
    "title": "Linear-Quadratic Model: EQD2 Calculation for Spinal Cord Late Toxicity",
    "clinicalCase": "A patient is undergoing stereotactic body radiation therapy (SBRT) for a thoracic spine metastasis delivering 24 Gy in 3 fractions. The adjacent spinal cord PRV receives a maximum dose of 24 Gy in 3 fractions (d = 8 Gy/fx). Assuming an α/β ratio of 2 Gy (or 3 Gy) for late central nervous system toxicity (use α/β = 3 Gy), what is the equivalent dose in 2 Gy fractions (EQD2)?",
    "vignette": "A patient is undergoing stereotactic body radiation therapy (SBRT) for a thoracic spine metastasis delivering 24 Gy in 3 fractions. The adjacent spinal cord PRV receives a maximum dose of 24 Gy in 3 fractions (d = 8 Gy/fx). Assuming an α/β ratio of 2 Gy (or 3 Gy) for late central nervous system toxicity (use α/β = 3 Gy), what is the equivalent dose in 2 Gy fractions (EQD2)?",
    "options": [
      {
        "id": "A",
        "text": "35.2 Gy"
      },
      {
        "id": "B",
        "text": "42.0 Gy"
      },
      {
        "id": "C",
        "text": "52.8 Gy"
      },
      {
        "id": "D",
        "text": "88.0 Gy"
      }
    ],
    "correctAnswerId": "C",
    "correctIndex": 2,
    "explanation": "Dose per fraction d = 24 / 3 = 8 Gy. Using the linear-quadratic equation: BED = D × [1 + d / (α/β)] = 24 × [1 + 8 / 3] = 24 × (11 / 3) = 88 Gy₃. The 2-Gy equivalent dose is EQD2 = BED / [1 + 2 / (α/β)] = 88 / [1 + 2 / 3] = 88 / (5 / 3) = 88 × 0.6 = 52.8 Gy. Since 52.8 Gy exceeds the conventional spinal cord tolerance ceiling of 50 Gy EQD2, plan re-optimization is mandated.",
    "rationale": "Dose per fraction d = 24 / 3 = 8 Gy. Using the linear-quadratic equation: BED = D × [1 + d / (α/β)] = 24 × [1 + 8 / 3] = 24 × (11 / 3) = 88 Gy₃. The 2-Gy equivalent dose is EQD2 = BED / [1 + 2 / (α/β)] = 88 / [1 + 2 / 3] = 88 / (5 / 3) = 88 × 0.6 = 52.8 Gy. Since 52.8 Gy exceeds the conventional spinal cord tolerance ceiling of 50 Gy EQD2, plan re-optimization is mandated.",
    "distractorRationale": {
      "A": "35.2 Gy results from erroneously dividing by 2.5.",
      "B": "42.0 Gy results from failing to account for the biological weighting of 8 Gy fractions.",
      "D": "88.0 Gy is the BED₃, not the normalized EQD2."
    },
    "distractorRationales": {
      "A": "35.2 Gy results from erroneously dividing by 2.5.",
      "B": "42.0 Gy results from failing to account for the biological weighting of 8 Gy fractions.",
      "D": "88.0 Gy is the BED₃, not the normalized EQD2."
    },
    "landmarkTrialTitle": "Radiobiology Principles (Fowler 1989)",
    "trial": "Fowler LQ Principles (1989)",
    "doiUrl": "https://pubmed.ncbi.nlm.nih.gov/2679720/",
    "citation": "Fowler JF. The linear-quadratic formula and progress in fractionated radiotherapy. Br J Radiol 1989;62(740):679-694."
  },
  {
    "id": "q-radiobio-5rs",
    "pillar": "RADIOBIOLOGY",
    "category": "5Rs",
    "organ": "5Rs",
    "title": "The 5 Rs of Radiobiology: Accelerated Repopulation and Treatment Gaps",
    "clinicalCase": "In the definitive radiotherapy of mucosal squamous cell carcinoma of the Head and Neck, which of the \"5 Rs\" of radiobiology provides the primary biological rationale for avoiding unscheduled treatment interruptions and implementing accelerated hyperfractionation?",
    "vignette": "In the definitive radiotherapy of mucosal squamous cell carcinoma of the Head and Neck, which of the \"5 Rs\" of radiobiology provides the primary biological rationale for avoiding unscheduled treatment interruptions and implementing accelerated hyperfractionation?",
    "options": [
      {
        "id": "A",
        "text": "Reoxygenation of hypoxic core cells"
      },
      {
        "id": "B",
        "text": "Repair of sublethal cellular DNA damage"
      },
      {
        "id": "C",
        "text": "Accelerated Repopulation of surviving tumor clonogens"
      },
      {
        "id": "D",
        "text": "Redistribution into radioresistant S-phase"
      }
    ],
    "correctAnswerId": "C",
    "correctIndex": 2,
    "explanation": "Accelerated repopulation (Withers et al., Acta Oncol 1988) begins approximately 3–4 weeks (T_lag ≈ 21–28 days) after initiating radiotherapy in rapidly dividing mucosal squamous carcinomas. Surviving tumor clonogens double at an accelerated pace (doubling time shortening to ~4 days vs 60 days pre-treatment). Unscheduled treatment gaps allow clonogens to repopulate, requiring approximately 0.6 Gy per day of prolongation to maintain equivalent local control.",
    "rationale": "Accelerated repopulation (Withers et al., Acta Oncol 1988) begins approximately 3–4 weeks (T_lag ≈ 21–28 days) after initiating radiotherapy in rapidly dividing mucosal squamous carcinomas. Surviving tumor clonogens double at an accelerated pace (doubling time shortening to ~4 days vs 60 days pre-treatment). Unscheduled treatment gaps allow clonogens to repopulate, requiring approximately 0.6 Gy per day of prolongation to maintain equivalent local control.",
    "distractorRationale": {
      "A": "Reoxygenation enhances radiosensitivity between fractions but is not the reason overall time hurts tumor control.",
      "B": "Repair of sublethal damage protects late-responding normal tissues when fractions are spaced ≥ 6 hours apart.",
      "D": "Redistribution causes cells to accumulate in radiosensitive G2/M phases, an advantage of fractionation."
    },
    "distractorRationales": {
      "A": "Reoxygenation enhances radiosensitivity between fractions but is not the reason overall time hurts tumor control.",
      "B": "Repair of sublethal damage protects late-responding normal tissues when fractions are spaced ≥ 6 hours apart.",
      "D": "Redistribution causes cells to accumulate in radiosensitive G2/M phases, an advantage of fractionation."
    },
    "landmarkTrialTitle": "Time-Dose Relationships and Accelerated Repopulation (Withers 1988)",
    "trial": "Withers 5 Rs (1988)",
    "doiUrl": "https://pubmed.ncbi.nlm.nih.gov/3343152/",
    "citation": "Withers HR, Taylor JM, Maciejewski B. The hazard of accelerated tumor clonogen repopulation during radiotherapy. Acta Oncol 1988;27(2):131-146."
  },
  {
    "id": "q-physics-photoelectric",
    "pillar": "PHYSICS",
    "category": "Interactions",
    "organ": "Interactions",
    "title": "Photon Interactions: Photoelectric Effect vs Compton Scattering",
    "clinicalCase": "Which photon interaction mechanism has a probability of occurrence approximately proportional to Z³ / E³, making it the dominant contributor to radiographic image contrast in diagnostic CT imaging and superficial orthovoltage therapy?",
    "vignette": "Which photon interaction mechanism has a probability of occurrence approximately proportional to Z³ / E³, making it the dominant contributor to radiographic image contrast in diagnostic CT imaging and superficial orthovoltage therapy?",
    "options": [
      {
        "id": "A",
        "text": "Compton Scattering"
      },
      {
        "id": "B",
        "text": "Photoelectric Effect"
      },
      {
        "id": "C",
        "text": "Pair Production"
      },
      {
        "id": "D",
        "text": "Photodisintegration"
      }
    ],
    "correctAnswerId": "B",
    "correctIndex": 1,
    "explanation": "The photoelectric effect occurs when an incident photon transfers all its energy to an inner-shell electron (K- or L-shell), ejecting it as a photoelectron. The mass attenuation coefficient is proportional to Z³ / E³ (where Z is atomic number and E is photon energy). This strong Z-dependence provides high contrast between bone (Z ≈ 13.8) and soft tissue (Z ≈ 7.4) in diagnostic radiology (20–120 keV). At megavoltage therapeutic energies (6–18 MV), Compton scattering (proportional to electron density, nearly independent of Z) predominates.",
    "rationale": "The photoelectric effect occurs when an incident photon transfers all its energy to an inner-shell electron (K- or L-shell), ejecting it as a photoelectron. The mass attenuation coefficient is proportional to Z³ / E³ (where Z is atomic number and E is photon energy). This strong Z-dependence provides high contrast between bone (Z ≈ 13.8) and soft tissue (Z ≈ 7.4) in diagnostic radiology (20–120 keV). At megavoltage therapeutic energies (6–18 MV), Compton scattering (proportional to electron density, nearly independent of Z) predominates.",
    "distractorRationale": {
      "A": "Compton scattering is proportional to electron density and independent of Z in water-equivalent tissues.",
      "C": "Pair production requires a threshold photon energy of 1.022 MeV and its probability increases with Z (not Z³).",
      "D": "Photodisintegration occurs only at very high energies (> 10 MeV) in high-Z linac shielding materials."
    },
    "distractorRationales": {
      "A": "Compton scattering is proportional to electron density and independent of Z in water-equivalent tissues.",
      "C": "Pair production requires a threshold photon energy of 1.022 MeV and its probability increases with Z (not Z³).",
      "D": "Photodisintegration occurs only at very high energies (> 10 MeV) in high-Z linac shielding materials."
    },
    "landmarkTrialTitle": "Radiation Oncology Physics (Podgorsak / IAEA 2005)",
    "trial": "Podgorsak Physics (2005)",
    "doiUrl": "https://www-pub.iaea.org/MTCD/Publications/PDF/Pub1196_web.pdf",
    "citation": "Podgorsak EB. Radiation Oncology Physics: A Handbook for Teachers and Students. International Atomic Energy Agency (IAEA) Vienna 2005."
  },
  {
    "id": "q-physics-energies",
    "pillar": "PHYSICS",
    "category": "Dosimetry QA",
    "organ": "Dosimetry QA",
    "title": "Linear Accelerator Megavoltage Dosimetry: 6 MV vs 18 MV Beam Characteristics",
    "clinicalCase": "When evaluating percent depth dose (PDD) and surface dose characteristics comparing a 6 MV photon beam with an 18 MV photon beam on a modern medical linear accelerator (10 × 10 cm² field, 100 cm SSD), which statement is correct?",
    "vignette": "When evaluating percent depth dose (PDD) and surface dose characteristics comparing a 6 MV photon beam with an 18 MV photon beam on a modern medical linear accelerator (10 × 10 cm² field, 100 cm SSD), which statement is correct?",
    "options": [
      {
        "id": "A",
        "text": "18 MV has a shallower dmax and higher skin entrance dose"
      },
      {
        "id": "B",
        "text": "6 MV has a dmax of ~1.5 cm and higher skin dose, whereas 18 MV has a dmax of ~3.3 cm and superior skin sparing but produces photoneutrons (>10 MV)"
      },
      {
        "id": "C",
        "text": "6 MV beams produce significant photoneutron activation in room maze walls"
      },
      {
        "id": "D",
        "text": "Both energies have identical depth of maximum dose in water"
      }
    ],
    "correctAnswerId": "B",
    "correctIndex": 1,
    "explanation": "The depth of maximum dose (dmax) for 6 MV is approximately 1.5 cm with an entrance surface dose of ~15–25%, whereas 18 MV has a dmax of ~3.0–3.5 cm and an entrance surface dose of ~10–15% (greater skin sparing). However, photon energies exceeding 10 MV exceed the binding energy threshold of tungsten, lead, and copper nuclei, producing photoneutron contamination (gamma,n reactions) requiring borated polyethylene linac room shielding and increasing out-of-field secondary cancer risk.",
    "rationale": "The depth of maximum dose (dmax) for 6 MV is approximately 1.5 cm with an entrance surface dose of ~15–25%, whereas 18 MV has a dmax of ~3.0–3.5 cm and an entrance surface dose of ~10–15% (greater skin sparing). However, photon energies exceeding 10 MV exceed the binding energy threshold of tungsten, lead, and copper nuclei, producing photoneutron contamination (gamma,n reactions) requiring borated polyethylene linac room shielding and increasing out-of-field secondary cancer risk.",
    "distractorRationale": {
      "A": "18 MV has a deeper dmax (~3.3 cm vs 1.5 cm) and lower skin dose (better skin sparing).",
      "C": "Photoneutron generation occurs at energies > 10 MV; 6 MV produces negligible neutrons.",
      "D": "dmax increases with beam energy due to the forward momentum and range of secondary electrons."
    },
    "distractorRationales": {
      "A": "18 MV has a deeper dmax (~3.3 cm vs 1.5 cm) and lower skin dose (better skin sparing).",
      "C": "Photoneutron generation occurs at energies > 10 MV; 6 MV produces negligible neutrons.",
      "D": "dmax increases with beam energy due to the forward momentum and range of secondary electrons."
    },
    "landmarkTrialTitle": "The Physics of Radiation Therapy (Khan 2014)",
    "trial": "Khan Dosimetry Principles (2014)",
    "doiUrl": "https://app.knovel.com/web/toc.v/cid:kpPKROIM05",
    "citation": "Khan FM, Gibbons JP. Khan's The Physics of Radiation Therapy. 5th edition. Lippincott Williams & Wilkins 2014."
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
