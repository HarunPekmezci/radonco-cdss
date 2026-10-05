'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, BookOpen, ExternalLink, ShieldCheck } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';

type CategoryId =
  | 'thorax'
  | 'breast'
  | 'gus'
  | 'gis'
  | 'head-neck'
  | 'cns'
  | 'gynecology'
  | 'bone-sarcoma'
  | 'guidelines'
  | 'oar';

type Reference = {
  category: CategoryId;
  title: string;
  indication: string;
  indication_en: string;
  publication: string;
  authors: string;
  url: string;
  linkLabel?: string;
};

const pubmedSearch = (query: string) =>
  `https://pubmed.ncbi.nlm.nih.gov/?term=${encodeURIComponent(query)}`;

const categories: { id: CategoryId | 'all'; label_tr: string; label_en: string }[] = [
  { id: 'all', label_tr: 'Tümü', label_en: 'All Sources' },
  { id: 'thorax', label_tr: 'Toraks', label_en: 'Thorax' },
  { id: 'breast', label_tr: 'Meme', label_en: 'Breast' },
  { id: 'gus', label_tr: 'GÜS', label_en: 'GU' },
  { id: 'gis', label_tr: 'GİS', label_en: 'GI' },
  { id: 'head-neck', label_tr: 'Baş-Boyun', label_en: 'Head & Neck' },
  { id: 'cns', label_tr: 'MSS', label_en: 'CNS' },
  { id: 'gynecology', label_tr: 'Jinekoloji', label_en: 'Gynecology' },
  { id: 'bone-sarcoma', label_tr: 'Kemik & Sarkom', label_en: 'Bone & Soft Tissue' },
  { id: 'guidelines', label_tr: 'Kılavuzlar', label_en: 'Guidelines' },
  { id: 'oar', label_tr: 'OAR & Radyobiyoloji', label_en: 'Physics & OAR' },
];

const references: Reference[] = [
  // =========================================================================
  // 1. GUIDELINES & CORE CONSENSUS
  // =========================================================================
  {
    category: 'guidelines',
    title: 'NCCN Clinical Practice Guidelines in Oncology',
    indication: 'Hastalık bölgesine özgü güncel kanıta dayalı kılavuzlar. Sürümü, erişim tarihini ve klinik uygunluğu doğrulayın; bazı içerikler erişim kısıtlamalı olabilir.',
    indication_en: 'Current evidence-based guidelines by disease site. Verify the version, access date, and clinical applicability; some content may require authorized access.',
    publication: 'NCCN Guidelines',
    authors: 'National Comprehensive Cancer Network',
    url: 'https://www.nccn.org/guidelines',
    linkLabel: 'NCCN',
  },
  {
    category: 'guidelines',
    title: 'NCCN Gastric Cancer Guidelines (v1.2025)',
    indication: 'Mide ve GEJ adenokarsinomu için NCCN algoritmik tanı, evreleme, cerrahi sonrası radyoterapi/kemoradyoterapi ilkeleri (GAST-C).',
    indication_en: 'NCCN algorithmic diagnosis, staging, postoperative chemoradiotherapy, and radiotherapy principles for gastric and GEJ adenocarcinoma (GAST-C).',
    publication: 'NCCN Guidelines v1.2025',
    authors: 'NCCN Gastric Cancer Panel',
    url: 'https://www.nccn.org/guidelines/guidelines-detail?category=1&id=1434',
    linkLabel: 'NCCN',
  },
  {
    category: 'guidelines',
    title: 'ESTRO Guidelines and Consensus Statements',
    indication: 'Radyoterapi uygulamalarına yönelik Avrupa kılavuzları ve uzman konsensus belgeleri.',
    indication_en: 'European guidelines and expert consensus statements on radiotherapy practice.',
    publication: 'ESTRO Clinical Practice Guidelines',
    authors: 'European Society for Radiotherapy and Oncology',
    url: 'https://www.estro.org/Science/Guidelines',
    linkLabel: 'ESTRO',
  },
  {
    category: 'guidelines',
    title: 'HyTEC — High Dose per Fraction, Hypofractionated Treatment Effects in the Clinic',
    indication: 'Stereotaktik radyoterapide doz, fraksiyonasyon ve klinik toksisite ilişkisine yönelik yayımlanmış kanıtları bulun ve her organ için ilgili birincil analizi doğrulayın.',
    indication_en: 'Find published evidence on dose, fractionation, and clinical toxicity in stereotactic radiotherapy; verify the relevant primary analysis for each organ.',
    publication: 'HyTEC evidence reviews',
    authors: 'AAPM Working Group',
    url: pubmedSearch('HyTEC high dose per fraction hypofractionated treatment effects clinic'),
    linkLabel: 'PubMed',
  },

  // =========================================================================
  // 2. THORAX (8 LANDMARK STUDIES & GUIDELINES)
  // =========================================================================
  {
    category: 'thorax',
    title: 'PACIFIC Trial (Antonia et al., NEJM 2017 & 2018) — Durvalumab after Chemoradiotherapy in Stage III NSCLC',
    indication: 'Rezeke edilemeyen Evre III KHDAK hastalarında definitif eşzamanlı kemoradyoterapi (60 Gy) sonrası 1 yıl konsolidatif durvalumab immünoterapisinin progresyonsuz ve genel sağkalımı belirgin uzattığını kanıtlayan temel Faz III çalışma.',
    indication_en: 'Foundational Phase III trial establishing 1 year of consolidative durvalumab immunotherapy following definitive concurrent chemoradiotherapy (60 Gy) as standard of care for unresectable Stage III NSCLC, demonstrating dramatic progression-free and overall survival benefits.',
    publication: 'New England Journal of Medicine, 2017 & 2018',
    authors: 'Antonia SJ, Villegas A, Daniel D, et al.',
    url: 'https://doi.org/10.1056/NEJMoa1709937',
    linkLabel: 'DOI',
  },
  {
    category: 'thorax',
    title: 'RTOG 0236 (Timmerman et al., JAMA 2010 / Lancet Oncol 2018) — SBRT for Inoperable Peripheral NSCLC',
    indication: 'Medikal inoperabl periferik erken evre T1-T2N0 KHDAK’ta 54 Gy / 3 fraksiyon (18 Gy/fx) SBRT şemasının %90 üzerinde 5 yıllık mükemmel lokal kontrol sağladığını gösteren öncü protokol.',
    indication_en: 'Landmark prospective Phase II/III protocol proving 54 Gy in 3 fractions (18 Gy/fx) yields exceptional 5-year local tumor control (>90%) in medically inoperable early T1-T2N0 peripheral NSCLC.',
    publication: 'JAMA, 2010; The Lancet Oncology, 2018',
    authors: 'Timmerman R, Paulus R, Galvin J, et al.',
    url: 'https://doi.org/10.1001/jama.2010.261',
    linkLabel: 'DOI',
  },
  {
    category: 'thorax',
    title: 'RTOG 0915 (Videtic et al., JCO 2015 & IJROBP 2019) — SBRT Fractionation in Early-Stage NSCLC',
    indication: 'Medikal inoperabl periferik Evre I KHDAK’ta tek fraksiyon 34 Gy ile 4 fraksiyonda 48 Gy (12 Gy/fx) SBRT fraksiyonasyonlarının karşılaştırılması; her iki şemanın da >%90 5 yıllık lokal kontrol sağladığını, 48 Gy/4 fx kolunda derece 3 toksisitenin daha düşük olduğunu gösterir.',
    indication_en: 'Comparison of single-fraction 34 Gy versus 48 Gy in 4 fractions; demonstrates both schedules achieve outstanding 5-year local control (>90%), with 48 Gy/4 fx demonstrating reduced primary grade 3 toxicities.',
    publication: 'Journal of Clinical Oncology, 2015; IJROBP, 2019',
    authors: 'Videtic GMM, Hu C, Singh AK, et al.',
    url: 'https://doi.org/10.1200/JCO.2015.63.1556',
    linkLabel: 'DOI',
  },
  {
    category: 'thorax',
    title: 'Turrisi et al. (NEJM 1999) & CONVERT Trial (Faivre-Finn et al., Lancet Oncol 2017) — SCLC Radiotherapy',
    indication: 'Sınırlı evre küçük hücreli akciğer kanserinde eşzamanlı sisplatin/etoposid ile hiperfraksiyone hızlandırılmış RT (3 haftada 30 fraksiyonda 45 Gy, günde iki kez 1.5 Gy) ve günde tek fraksiyon (60-66 Gy) rejimlerinin primer küratif standart olduğunu doğrular.',
    indication_en: 'Validates hyperfractionated accelerated radiotherapy (45 Gy in 30 fractions, 1.5 Gy BID over 3 weeks) alongside once-daily (60-66 Gy) as primary curative concurrent chemoradiotherapy regimens for limited-stage small-cell lung cancer.',
    publication: 'New England Journal of Medicine, 1999; The Lancet Oncology, 2017',
    authors: 'Turrisi AT 3rd, Kim K, Blum R, et al. / Faivre-Finn C, Snee M, Ellis S, et al.',
    url: 'https://doi.org/10.1056/NEJM199901283400403',
    linkLabel: 'DOI',
  },
  {
    category: 'thorax',
    title: 'CREST Trial (Slotman et al., Lancet 2015) — Consolidative Thoracic Radiotherapy in Extensive SCLC',
    indication: 'Sistemik kemoterapiye yanıt veren yaygın evre KHAK hastalarında konsolidatif torasik radyoterapinin (10 fraksiyonda 30 Gy) 2 yıllık genel sağkalımı anlamlı derecede artırdığını ve torasik progresyonu azalttığını gösteren randomize çalışma.',
    indication_en: 'Randomized trial showing consolidative thoracic radiotherapy (30 Gy in 10 fractions) significantly improves 2-year overall survival and decreases thoracic progression in patients with extensive-stage SCLC responding to systemic chemotherapy.',
    publication: 'The Lancet, 2015',
    authors: 'Slotman BJ, van Tinteren H, Praag JO, et al.',
    url: 'https://doi.org/10.1016/S0140-6736(14)61085-0',
    linkLabel: 'DOI',
  },
  {
    category: 'thorax',
    title: 'Aupérin Meta-Analysis (NEJM 1999) & NRG CC003 — Prophylactic Cranial Irradiation in SCLC',
    indication: 'Tam remisyondaki KHAK hastalarında proflaktik kraniyal ışınlamanın (PCI - 10 fraksiyonda 25 Gy) 3 yıllık beyin metastazı kümülatif insidansını %58.6’dan %33.3’e indirdiğini ve %5.4 mutlak genel sağkalım avantajı sağladığını gösteren meta-analiz.',
    indication_en: 'Definitive meta-analysis establishing that PCI (25 Gy in 10 fractions) decreases 3-year cumulative brain metastases incidence from 58.6% to 33.3% and delivers a 5.4% absolute overall survival benefit.',
    publication: 'New England Journal of Medicine, 1999; Journal of Clinical Oncology, 2023',
    authors: 'Aupérin A, Arriagada R, Pignon JP, et al.',
    url: 'https://doi.org/10.1056/NEJM199908123410703',
    linkLabel: 'DOI',
  },
  {
    category: 'thorax',
    title: 'Lung-ART Trial (Le Pechoux et al., Lancet Oncol 2022) — Postoperative Radiotherapy in Stage III-N2 NSCLC',
    indication: 'Tam rezeke edilmiş mediastinal N2 tutulumlu Evre III KHDAK’ta modern 3D-CRT/IMRT ile postoperatif RT (54 Gy) rolünü değerlendiren, kardiyopulmoner doku koruma ve hasta seçim kriterlerinin kritik önemini vurgulayan Faz III çalışma.',
    indication_en: 'Modern conformal 3D/IMRT Phase III trial assessing PORT (54 Gy) in resected mediastinal nodal involvement, highlighting exact patient selection criteria and cardiac/pulmonary sparing requirements.',
    publication: 'The Lancet Oncology, 2022',
    authors: 'Le Pechoux C, Pourel N, Barlesi F, et al.',
    url: 'https://doi.org/10.1016/S1470-2045(21)00606-9',
    linkLabel: 'DOI',
  },
  {
    category: 'thorax',
    title: 'NCCN Thoracic Malignancies Guidelines (NSCLC & SCLC v1.2025)',
    indication: 'Küçük hücreli ve küçük hücreli dışı akciğer kanserinde evreleme, SBRT/SABR, definitif eşzamanlı KRT, PCI ve konsolidatif torasik RT algoritmaları ve doz-hacim ilkeleri.',
    indication_en: 'NCCN Clinical Practice Guidelines in Oncology: Thoracic Malignancies (NSCLC & SCLC), outlining staging, definitive SBRT, concurrent CRT, PCI, and consolidative thoracic RT algorithms.',
    publication: 'National Comprehensive Cancer Network, v1.2025',
    authors: 'Ettinger DS, Wood DE, Aisner DL, et al.',
    url: 'https://www.nccn.org/guidelines/guidelines-detail?category=1&id=1450',
    linkLabel: 'Guidelines',
  },

  // =========================================================================
  // 3. BREAST (8 LANDMARK STUDIES & GUIDELINES)
  // =========================================================================
  {
    category: 'breast',
    title: 'FAST-Forward Trial (Brunt et al., Lancet 2020) — 1-Week Ultra-Hypofractionated Breast Radiotherapy',
    indication: 'Erken evre meme kanserinde 1 haftalık ultra-hipofraksiyonasyon (1 haftada 5 fraksiyonda 26 Gy) şemasının lokal kontrol ve normal doku etkileri açısından 15 fraksiyonda 40 Gy’e non-inferior olduğunu kanıtlayan uluslararası dönüm noktası Faz III çalışma.',
    indication_en: 'International landmark non-inferiority Phase III trial establishing 1-week ultra-hypofractionation (26 Gy in 5 fractions over 1 week) as clinically non-inferior to 40 Gy in 15 fractions for local control and normal tissue effects.',
    publication: 'The Lancet, 2020',
    authors: 'Brunt AM, Haviland JS, Wheatley DA, et al.',
    url: 'https://doi.org/10.1016/S0140-6736(20)30932-6',
    linkLabel: 'DOI',
  },
  {
    category: 'breast',
    title: 'START Trials (START A & START B, Lancet 2008 & 2013) — 3-Week Hypofractionation Standard',
    indication: 'Erken evre meme kanserinde 40 Gy / 15 fraksiyon (3 haftada 2.67 Gy/fx) hipofraksiyonasyon şemasının 50 Gy / 25 fraksiyon konvansiyonel tedaviye eşdeğer lokorejyonel kontrol ve daha düşük fibrozis/iyileştirilmiş kozmetik sağladığını gösteren standart oluşturan Faz III çalışmalar.',
    indication_en: 'Foundational Phase III trials establishing 40 Gy in 15 fractions (2.67 Gy/fx over 3 weeks) as international standard of care with equivalent local-regional control and reduced breast cosmesis/fibrosis compared to 50 Gy in 25 fractions.',
    publication: 'The Lancet, 2008; The Lancet Oncology, 2013',
    authors: 'Bentzen SM, Agrawal RK, Aird EG, et al. / Haviland JS, Owen JR, Dewar JA, et al.',
    url: 'https://doi.org/10.1016/S1470-2045(13)70386-3',
    linkLabel: 'DOI',
  },
  {
    category: 'breast',
    title: 'EBCTCG Meta-Analyses (Darby / McGale et al., Lancet 2011 & 2014) — Postmastectomy & Regional RT',
    indication: '10.000’den fazla hastayı kapsayan bireysel hasta meta-analizi; lenf nodu pozitif meme kanserinde adjuvan radyoterapinin 10 yıllık lokal nüksü üçte iki oranında ve 20 yıllık meme kanseri mortalitesini altıda bir oranında azalttığını kesin olarak kanıtlamıştır.',
    indication_en: 'Extensive individual patient meta-analysis of over 10,000 women proving radiotherapy substantially reduces 10-year local recurrence by two-thirds and 20-year breast cancer mortality by one-sixth in node-positive disease.',
    publication: 'The Lancet, 2011 & 2014',
    authors: 'Darby S, McGale P, Correa C, et al. (EBCTCG)',
    url: 'https://doi.org/10.1016/S0140-6736(14)60488-8',
    linkLabel: 'DOI',
  },
  {
    category: 'breast',
    title: 'MA.20 (Whelan et al., NEJM 2015) & EORTC 22922 (Poortmans et al., NEJM 2015) — Regional Nodal Irradiation',
    indication: 'Meme koruyucu cerrahi veya mastektomi sonrası internal mammar ve supraklavikuler lenfatiklerin kapsamlı bölgesel ışınlanmasının (RNI) hastalıksız sağkalımı ve metastazsız sağkalımı anlamlı derecede artırdığını gösteren paralel Faz III çalışmalar.',
    indication_en: 'Parallel Phase III trials establishing that adding comprehensive regional nodal irradiation (supraclavicular and internal mammary nodes) significantly improves disease-free and metastasis-free survival.',
    publication: 'New England Journal of Medicine, 2015',
    authors: 'Whelan TJ, Olivotto IA, Parulekar WR, et al. / Poortmans PM, Collette S, Kirkove C, et al.',
    url: 'https://doi.org/10.1056/NEJMoa1415340',
    linkLabel: 'DOI',
  },
  {
    category: 'breast',
    title: 'EORTC 22881-10882 Boost Trial (Bartelink et al., NEJM 2000 & Lancet Oncol 2015) — Tumor Bed Boost',
    indication: '20 yıllık uzun dönem takipte tümör yatağına 16 Gy ek doz (boost) verilmesinin lokal nüksü kalıcı ve anlamlı derecede azalttığını, en belirgin mutlak faydanın 50 yaş altındaki genç kadınlarda elde edildiğini gösteren çalışma.',
    indication_en: 'Long-term 20-year follow-up proving a 16 Gy tumor bed boost delivers a persistent, statistically significant reduction in local recurrence, with the highest absolute benefit observed in patients younger than 50 years.',
    publication: 'The Lancet Oncology, 2015 (20-year follow-up); NEJM, 2000',
    authors: 'Bartelink H, Maingon P, Poortmans P, et al.',
    url: 'https://doi.org/10.1016/S1470-2045(14)71156-8',
    linkLabel: 'DOI',
  },
  {
    category: 'breast',
    title: 'SUPREMO Trial / BIG 2-04 (Kunkler et al., Lancet Oncol 2024) — PMRT in Intermediate-Risk Breast Cancer',
    indication: 'Güncel sistemik tedavi alan 1-3 pozitif lenf nodlu veya yüksek riskli lenf nodu negatif mastektomili kadınlarda postmastektomi göğüs duvarı radyoterapisinin (PMRT) rolünü değerlendiren çok merkezli randomize Faz III çalışma.',
    indication_en: 'Modern multicentre randomized Phase III trial evaluating postmastectomy chest wall radiotherapy in women with 1-3 positive lymph nodes or high-risk node-negative features receiving contemporary systemic therapy.',
    publication: 'The Lancet Oncology, 2024',
    authors: 'Kunkler IH, Canney P, van Tienhoven G, et al.',
    url: 'https://doi.org/10.1016/S1470-2045(24)00215-8',
    linkLabel: 'DOI',
  },
  {
    category: 'breast',
    title: 'GEC-ESTRO APBI Trial (Strnad et al., Lancet 2016) — Accelerated Partial-Breast Irradiation',
    indication: 'Seçilmiş düşük riskli erken evre meme kanserinde interstisyel çok kateterli brakiterapi ile hızlandırılmış parsiyel meme ışınlamasının (APBI) 5 yıllık lokal nüks oranlarının tüm meme radyoterapisine (WBI) non-inferior olduğunu kanıtlayan Faz III çalışma.',
    indication_en: 'Randomized Phase III non-inferiority trial proving accelerated partial breast irradiation delivers 5-year local recurrence rates identical to whole-breast irradiation in selected low-risk early breast cancer.',
    publication: 'The Lancet, 2016',
    authors: 'Strnad V, Ott OJ, Hildebrandt G, et al.',
    url: 'https://doi.org/10.1016/S0140-6736(15)00471-0',
    linkLabel: 'DOI',
  },
  {
    category: 'breast',
    title: 'NCCN Breast Cancer Guidelines (v1.2025) — Principles of Radiation Therapy',
    indication: 'Meme koruyucu cerrahi sonrası radyoterapi, mastektomi sonrası göğüs duvarı ve bölgesel lenfatik ışınlama (PMRT), hipofraksiyonasyon ve APBI için NCCN klinik prensipleri.',
    indication_en: 'NCCN Breast Cancer Radiation Therapy Principles, detailing whole-breast hypofractionation, post-mastectomy radiation therapy (PMRT), regional nodal irradiation, and APBI algorithms.',
    publication: 'National Comprehensive Cancer Network, v1.2025',
    authors: 'Gradishar WJ, Moran MS, Abraham J, et al.',
    url: 'https://www.nccn.org/guidelines/guidelines-detail?category=1&id=1419',
    linkLabel: 'Guidelines',
  },

  // =========================================================================
  // 4. GENITOURINARY / GU (8 LANDMARK STUDIES & GUIDELINES)
  // =========================================================================
  {
    category: 'gus',
    title: 'CHHiP Trial (Dearnaley et al., Lancet Oncol 2016) — Moderate Hypofractionation for Prostate Cancer',
    indication: 'Lokalize prostat kanserinde orta hipofraksiyonasyonun (20 fraksiyonda 60 Gy, 3.0 Gy/fx) biyokimyasal ve klinik kontrol açısından konvansiyonel 37 fraksiyonda 74 Gy şemasına non-inferior olduğunu kanıtlayan dönüm noktası Faz III çalışma.',
    indication_en: 'Pivotal Phase III non-inferiority study establishing moderate hypofractionation (60 Gy in 20 fractions at 3.0 Gy/fx) as non-inferior in biochemical and clinical failure compared to 74 Gy in 37 fractions.',
    publication: 'The Lancet Oncology, 2016',
    authors: 'Dearnaley D, Syndikus I, Mossop H, et al.',
    url: 'https://doi.org/10.1016/S1470-2045(16)30102-4',
    linkLabel: 'DOI',
  },
  {
    category: 'gus',
    title: 'FLAME Trial (Kerkmeester et al., JCO 2021) — Focal Dose Escalation to Intraprostatic Lesion',
    indication: 'Baskın intraprostatik MRI lezyonuna 95 Gy’e kadar eşzamanlı entegre boost (SIB) uygulanmasının geç Gİ ve GÜ toksisiteleri artırmaksızın 5 yıllık biyokimyasal hastalıksız sağkalımı (bDFS) anlamlı düzeyde artırdığını gösteren Faz III çalışma.',
    indication_en: 'Randomized Phase III trial demonstrating that an integrated focal boost up to 95 Gy (Simultaneous Integrated Boost - SIB) to the dominant intraprostatic MRI lesion significantly improves 5-year biochemical disease-free survival without increasing late gastrointestinal or genitourinary toxicity.',
    publication: 'Journal of Clinical Oncology, 2021',
    authors: 'Kerkmeester RKW, van der Voort van Zyp JRN, et al.',
    url: 'https://doi.org/10.1200/JCO.20.02873',
    linkLabel: 'DOI',
  },
  {
    category: 'gus',
    title: 'PACE-B Trial (van As et al., Lancet Oncol 2024 / NEJM 2019) — 5-Fraction Prostate SBRT',
    indication: 'Lokalize prostat kanserinde 5 fraksiyon ultra-hipofraksiyone SBRT’nin (5 fraksiyonda 36.25 Gy) 5 yıllık biyokimyasal veya klinik başarısızlık açısından konvansiyonel/orta hipofraksiyone radyoterapiye non-inferior olduğunu doğrulayan uluslararası Faz III çalışma.',
    indication_en: 'International Phase III trial confirming 5-fraction ultra-hypofractionated SBRT (36.25 Gy in 5 fractions) is non-inferior to conventionally or moderately hypofractionated radiotherapy for 5-year freedom from biochemical or clinical failure.',
    publication: 'The Lancet Oncology, 2024; NEJM, 2019',
    authors: 'van As NJ, Tree A, Patel J, et al.',
    url: 'https://doi.org/10.1016/S1470-2045(24)00417-0',
    linkLabel: 'DOI',
  },
  {
    category: 'gus',
    title: 'STAMPEDE Trial (Parker et al., Lancet 2018) — Prostate Radiotherapy in Oligometastatic Disease',
    indication: 'Yeni tanı almış düşük tümör yüklü oligometastatik prostat kanserinde primer prostata definitif radyoterapi uygulanmasının (55 Gy / 20 fx veya 36 Gy / 6 fx) genel sağkalımı (HR 0.68) ve progresyonsuz sağkalımı anlamlı düzeyde iyileştirdiğini gösteren çalışma.',
    indication_en: 'Landmark randomized trial proving definitive prostate radiotherapy (55 Gy/20 fx or 36 Gy/6 fx) improves overall survival (HR 0.68) and progression-free survival in men with low-volume oligometastatic prostate cancer.',
    publication: 'The Lancet, 2018',
    authors: 'Parker CC, James ND, Brawley CD, et al.',
    url: 'https://doi.org/10.1016/S0140-6736(18)32486-3',
    linkLabel: 'DOI',
  },
  {
    category: 'gus',
    title: 'EORTC 22991 (Bolla et al., Lancet Oncol 2016) & RTOG 92-02 — ADT Duration with Radiotherapy',
    indication: 'Yüksek doz radyoterapi ile androjen baskılama tedavisi (ADT) süre standartlarını belirler: Orta riskli hastalıkta 4-6 ay kısa süreli ADT, yüksek riskli ve lokal ileri hastalıkta 24-36 ay uzun süreli ADT standardı.',
    indication_en: 'Defines standard ADT durations: 4-6 months short-term ADT for intermediate-risk, and 24-36 months long-term ADT for high-risk and locally advanced disease.',
    publication: 'The Lancet Oncology, 2016; JCO, 2008',
    authors: 'Bolla M, Maingon P, Carrie C, et al. / Hanks GE, Pajak TF, Porter A, et al.',
    url: 'https://doi.org/10.1016/S1470-2045(16)30166-8',
    linkLabel: 'DOI',
  },
  {
    category: 'gus',
    title: 'RADICALS-RT (Parker et al., Lancet 2020) & ARTISTIC Meta-Analysis — Adjuvant vs Early Salvage RT',
    indication: 'Radikal prostatektomi sonrası saptanabilir biyokimyasal nükste uygulanan erken kurtarma (salvage) radyoterapisinin rutin adjuvan RT ile eşdeğer onkolojik sonuçlar verdiğini ve hastaların yaklaşık %50’sini gereksiz pelvik radyasyondan koruduğunu gösteren çalışmalar.',
    indication_en: 'International randomized trials showing early salvage radiotherapy for detectable biochemical recurrence achieves oncological outcomes equal to routine adjuvant radiotherapy while sparing ~50% of patients from pelvic radiation.',
    publication: 'The Lancet, 2020',
    authors: 'Parker CC, Clarke NW, Cook AD, et al. (ARTISTIC Collaboration)',
    url: 'https://doi.org/10.1016/S0140-6736(20)31553-1',
    linkLabel: 'DOI',
  },
  {
    category: 'gus',
    title: 'BC2001 Trial (James et al., NEJM 2012) — Chemoradiotherapy in Muscle-Invasive Bladder Cancer',
    indication: 'Kas invaziv mesane kanserinde 5-FU ve mitomisin C ile eşzamanlı kemoradyoterapinin (55 Gy/20 fx veya 64 Gy/32 fx) lokorejyonel nüksü %33 azalttığını ve radikal sistektomiye alternatif organ koruyucu küratif yaklaşım sağladığını kanıtlayan Faz III çalışma.',
    indication_en: 'Phase III trial showing synchronous fluorouracil and mitomycin C chemoradiotherapy (55 Gy/20 fx or 64 Gy/32 fx) reduces locoregional relapse by 33% with an organ-preserving alternative to radical cystectomy.',
    publication: 'New England Journal of Medicine, 2012',
    authors: 'James ND, Hussain SA, Hall E, et al.',
    url: 'https://doi.org/10.1056/NEJMoa1106106',
    linkLabel: 'DOI',
  },
  {
    category: 'gus',
    title: 'NCCN Prostate & Bladder Cancer Guidelines (v1.2025)',
    indication: 'Prostat ve mesane kanserinde risk sınıflandırması, hipofraksiyonasyon, SBRT, brakiterapi, pelvik nodal radyoterapi ve mesane koruyucu trimodalite tedavi algoritmaları.',
    indication_en: 'NCCN Guidelines in Oncology: Prostate and Bladder Cancer, detailing risk stratification, SBRT, moderate hypofractionation, ADT duration, and trimodality bladder preservation algorithms.',
    publication: 'National Comprehensive Cancer Network, v1.2025',
    authors: 'Schaeffer EM, Srinivas S, Antonarakis ES, et al.',
    url: 'https://www.nccn.org/guidelines/guidelines-detail?category=1&id=1459',
    linkLabel: 'Guidelines',
  },

  // =========================================================================
  // 5. GASTROINTESTINAL / GI (8 LANDMARK STUDIES & GUIDELINES)
  // =========================================================================
  {
    category: 'gis',
    title: 'RAPIDO Trial (Bahadoer et al., Lancet Oncol 2021 & 2023) — Total Neoadjuvant Therapy in Rectal Cancer',
    indication: 'Yüksek riskli lokal ileri rektum kanserinde Total Neoadjuvan Tedavi (5 × 5 Gy kısa dönem RT ve ardından 18 hafta CAPOX/FOLFOX konsolidasyon kemoterapisi) yaklaşımının hastalığa bağlı tedavi başarısızlığını azalttığını (HR 0.75) ve patolojik tam yanıt oranını (%28 vs %14) ikiye katladığını gösteren çalışma.',
    indication_en: 'Landmark Phase III trial proving Total Neoadjuvant Therapy (5 x 5 Gy short-course radiotherapy followed by 18 weeks of CAPOX/FOLFOX consolidation chemotherapy) significantly reduces disease-related treatment failure (HR 0.75) and doubles pathological complete response (28% vs 14%) compared to standard chemoradiotherapy.',
    publication: 'The Lancet Oncology, 2021 & 2023',
    authors: 'Bahadoer RR, Dijkstra EA, van Etten B, et al.',
    url: 'https://doi.org/10.1016/S1470-2045(20)30555-6',
    linkLabel: 'DOI',
  },
  {
    category: 'gis',
    title: 'PRODIGE 23 Trial (Conroy et al., Lancet Oncol 2021) — Induction FOLFIRINOX in Rectal Cancer',
    indication: 'Lokal ileri rektum kanserinde preoperatif 50 Gy KRT öncesi indüksiyon mFOLFIRINOX kemoterapisinin metastazsız sağkalımı ve hastalıksız sağkalımı (DFS) anlamlı derecede artırdığını gösteren çok merkezli Faz III çalışma.',
    indication_en: 'Multi-center randomized Phase III trial showing induction mFOLFIRINOX before standard preoperative 50 Gy CRT and surgery delivers significant metastasis-free and disease-free survival improvements in high-risk LARC.',
    publication: 'The Lancet Oncology, 2021',
    authors: 'Conroy T, Bosset JF, Etienne PL, et al.',
    url: 'https://doi.org/10.1016/S1470-2045(21)00079-6',
    linkLabel: 'DOI',
  },
  {
    category: 'gis',
    title: 'CROSS Trial (van Hagen et al., NEJM 2012 / Lancet Oncol 2015) — Preoperative CRT for Esophageal Cancer',
    indication: 'Rezektabl özofagus veya gastroözofageal bileşke kanserinde preoperatif kemoradyoterapinin (haftalık karboplatin/paklitaksel ile 23 fraksiyonda 41.4 Gy) tek başına cerrahiye kıyasla medyan genel sağkalımı 24 aydan 49.4 aya çıkardığını gösteren temel Faz III çalışma.',
    indication_en: 'Practice-defining Phase III study showing preoperative chemoradiation (41.4 Gy in 23 fractions concurrent with weekly carboplatin/paclitaxel) substantially increases median overall survival from 24.0 to 49.4 months compared to surgery alone.',
    publication: 'New England Journal of Medicine, 2012; The Lancet Oncology, 2015',
    authors: 'van Hagen P, Hulshof MC, van Lanschot JJ, et al.',
    url: 'https://doi.org/10.1056/NEJMoa1112088',
    linkLabel: 'DOI',
  },
  {
    category: 'gis',
    title: 'INT-0116 / SWOG 9008 (Macdonald et al., NEJM 2001 / JCO 2012) — Adjuvant Chemoradiotherapy for Gastric Cancer',
    indication: 'Rezeke edilmiş evre IB-IV (M0) mide veya GEJ adenokarsinomunda cerrahi sonrası adjuvan 5-FU/leukovorin kemoradyoterapinin (25 fraksiyonda 45 Gy, 1.8 Gy/fx) cerrahiye kıyasla genel sağkalımı (HR 1.35) ve nükssüz sağkalımı anlamlı derecede uzattığını kanıtlayan Faz III çalışma.',
    indication_en: 'Establishes that adjuvant 45 Gy in 25 fractions concurrent with 5-FU/leucovorin significantly prolongs overall and relapse-free survival in resected stage IB-IV (M0) gastric adenocarcinoma.',
    publication: 'New England Journal of Medicine, 2001; Journal of Clinical Oncology, 2012',
    authors: 'Macdonald JS, Smalley SR, Benedetti J, et al.',
    url: 'https://doi.org/10.1056/NEJM200109063451001',
    linkLabel: 'DOI',
  },
  {
    category: 'gis',
    title: 'UK ACT II Trial (James et al., Lancet Oncol 2013) & Nigro Protocol — Chemoradiation for Anal Cancer',
    indication: 'Anal kanal skuamöz hücreli karsinomunda 50.4 Gy radyoterapi ile eşzamanlı 5-FU ve mitomisin C kombinasyonunun idame kemoterapi gerektirmeksizin yüksek organ koruma ve lokorejyonel kontrol sağladığını doğrulayan uluslararası standart Faz III çalışma.',
    indication_en: 'Definitive Phase III trial confirming 5-FU plus mitomycin C concurrent with 50.4 Gy radiotherapy as the international standard of care for anal canal squamous cell carcinoma, maintaining organ preservation without requiring maintenance chemotherapy.',
    publication: 'The Lancet Oncology, 2013; JCO, 2008',
    authors: 'James RD, Glynne-Jones R, Meadows HM, et al.',
    url: 'https://doi.org/10.1016/S1470-2045(13)70104-9',
    linkLabel: 'DOI',
  },
  {
    category: 'gis',
    title: 'German Rectal Cancer Trial CAO/ARO/AIO-94 (Sauer et al., NEJM 2004 & JCO 2012) — Preop vs Postop CRT',
    indication: 'Lokal ileri rektum kanserinde preoperatif 50.4 Gy kemoradyoterapinin postoperatif KRT’ye kıyasla belirgin olarak üstün 5 yıllık lokal kontrol (%6 vs %13), daha az akut/geç toksisite ve artmış sfinkter koruma sağladığını kanıtlayan temel çalışma.',
    indication_en: 'Landmark study proving preoperative 50.4 Gy chemoradiotherapy achieves superior 5-year local control (6% vs 13%), reduced acute/late toxicities, and enhanced sphincter preservation compared to postoperative CRT.',
    publication: 'New England Journal of Medicine, 2004; Journal of Clinical Oncology, 2012',
    authors: 'Sauer R, Becker H, Hohenberger W, et al.',
    url: 'https://doi.org/10.1056/NEJMoa040694',
    linkLabel: 'DOI',
  },
  {
    category: 'gis',
    title: 'PREOPANC Trial (Versteijne et al., JCO 2020 & 2022) — Preoperative CRT in Pancreatic Cancer',
    indication: 'Rezektabl ve sınırda rezektabl (borderline) pankreas kanserinde neoadjuvan gemsitabin bazlı kemoradyoterapinin (15 fraksiyonda 36 Gy) doğrudan cerrahiye kıyasla genel sağkalımı, R0 rezeksiyon oranını (%72 vs %43) ve hastalıksız sağkalımı anlamlı derecede artırdığını gösteren Faz III çalışma.',
    indication_en: 'Shows neoadjuvant gemcitabine-based chemoradiotherapy (36 Gy in 15 fractions) significantly improves overall survival, R0 resection rate (72% vs 43%), and disease-free survival in borderline resectable pancreatic cancer.',
    publication: 'Journal of Clinical Oncology, 2020 & 2022',
    authors: 'Versteijne E, Suker M, Groothuis K, et al.',
    url: 'https://doi.org/10.1200/JCO.20.00199',
    linkLabel: 'DOI',
  },
  {
    category: 'gis',
    title: 'NCCN Gastrointestinal Cancers Guidelines (v1.2025) — Rectal, Gastric, Esophageal & Pancreatic',
    indication: 'Rektum, mide, özofagus, anal kanal ve pankreas kanserlerinde neoadjuvan TNT, preoperatif KRT, postoperatif adjuvan RT ve definitif organ koruyucu radyoterapi klinik algoritmaları.',
    indication_en: 'NCCN Guidelines: Rectal, Gastric, Esophageal, Anal, and Pancreatic Cancers, providing clinical pathways for total neoadjuvant therapy, definitive chemoradiotherapy, and organ-preservation protocols.',
    publication: 'National Comprehensive Cancer Network, v1.2025',
    authors: 'Benson AB, Venook AP, Al-Hawary MM, et al.',
    url: 'https://www.nccn.org/guidelines/guidelines-detail?category=1&id=1461',
    linkLabel: 'Guidelines',
  },

  // =========================================================================
  // 6. CENTRAL NERVOUS SYSTEM / CNS (8 LANDMARK STUDIES & GUIDELINES)
  // =========================================================================
  {
    category: 'cns',
    title: 'Stupp Protocol / EORTC 26981 / NCIC CE.3 (NEJM 2005 & Lancet Oncol 2009) — Chemoradiotherapy for Glioblastoma',
    indication: 'Yeni tanı almış glioblastomada cerrahi sonrası 30 fraksiyonda 60 Gy radyoterapi ile eşzamanlı günlük temozolomid (75 mg/m²) ve ardından 6 kür adjuvan temozolomidin küresel altın standart olduğunu kanıtlayan temel Faz III çalışma.',
    indication_en: 'Foundational Phase III trial establishing 60 Gy in 30 fractions with concurrent daily temozolomide (75 mg/m²) followed by 6 cycles of adjuvant temozolomide as the global standard of care for newly diagnosed glioblastoma.',
    publication: 'New England Journal of Medicine, 2005; The Lancet Oncology, 2009',
    authors: 'Stupp R, Mason WP, van den Bent MJ, et al.',
    url: 'https://doi.org/10.1056/NEJMoa043479',
    linkLabel: 'DOI',
  },
  {
    category: 'cns',
    title: 'Perry Protocol (Perry et al., NEJM 2017) — Short-Course Radiotherapy with Temozolomide in Elderly GBM',
    indication: 'Yaşlı (≥65 yaş) glioblastoma hastalarında hipofraksiyone radyoterapiye (15 fraksiyonda 40 Gy) eşzamanlı ve adjuvan temozolomid eklenmesinin genel sağkalımı anlamlı düzeyde uzattığını (özellikle MGMT metile grupta 13.5 vs 7.7 ay) gösteren uluslararası Faz III çalışma.',
    indication_en: 'Phase III trial showing hypofractionated radiotherapy (40 Gy in 15 fractions) combined with temozolomide significantly extends survival (9.3 vs 7.6 months; and 13.5 vs 7.7 months in MGMT methylated tumors) in elderly glioblastoma patients (≥65 years).',
    publication: 'New England Journal of Medicine, 2017',
    authors: 'Perry JR, Laperriere N, O’Callaghan CJ, et al.',
    url: 'https://doi.org/10.1056/NEJMoa1611977',
    linkLabel: 'DOI',
  },
  {
    category: 'cns',
    title: 'JLGK0901 Study (Yamamoto et al., Lancet Oncol 2014 & 2017) — Stereotactic Radiosurgery for 1–10 Brain Mets',
    indication: '5 ila 10 adet beyin metastazı bulunan hastalarda stereotaktik radyocerrahinin (SRS), 2 ila 4 metastazı olan hastalara kıyasla genel sağkalım ve nörolojik sonuçlar bakımından non-inferior olduğunu ve tüm beyin RT’sine kıyasla nörokognitif toksisiteyi en aza indirdiğini gösteren prospektif çalışma.',
    indication_en: 'Definitive prospective study showing SRS in patients with 5 to 10 brain metastases yields overall survival and neurological outcomes non-inferior to patients with 2 to 4 metastases, minimizing neurocognitive toxicity compared to whole-brain RT.',
    publication: 'The Lancet Oncology, 2014 & 2017',
    authors: 'Yamamoto M, Serizawa T, Shuto T, et al.',
    url: 'https://doi.org/10.1016/S1470-2045(14)70061-0',
    linkLabel: 'DOI',
  },
  {
    category: 'cns',
    title: 'Alliance N0577 / NCCTG N107C (Brown et al., JAMA 2016 & Lancet Oncol 2017) — Post-op SRS vs WBRT',
    indication: 'Rezeke edilmiş tek beyin metastazında cerrahi kaviteye fokal SRS uygulanmasının tüm beyin radyoterapisine (WBRT) kıyasla eşdeğer genel sağkalım sağlarken kognitif hafızayı ve fonksiyonel bağımsızlığı belirgin biçimde üstün koruduğunu gösteren randomize Faz III çalışma.',
    indication_en: 'Phase III randomized trial showing focal SRS to the surgical cavity preserves cognitive memory and functional independence significantly better than WBRT with identical overall survival.',
    publication: 'JAMA, 2016; The Lancet Oncology, 2017',
    authors: 'Brown PD, Ballman KV, Cerhan JH, et al.',
    url: 'https://doi.org/10.1001/jama.2016.9839',
    linkLabel: 'DOI',
  },
  {
    category: 'cns',
    title: 'NRG Oncology CC001 (Brown et al., JCO 2020) — Hippocampal Avoidance WBRT plus Memantine',
    indication: 'Beyin metastazlarında WBRT (10 fraksiyonda 30 Gy) sırasında IMRT ile hipokampusun korunmasının ve memantin eklenmesinin yönetici kognitif fonksiyonları ve hafızayı istatistiksel ve klinik olarak anlamlı düzeyde koruduğunu gösteren randomize Faz III çalışma.',
    indication_en: 'Randomized Phase III trial demonstrating that intensity-modulated hippocampal avoidance during WBRT (30 Gy/10 fx) plus memantine significantly preserves executive neurocognitive function and patient-reported memory.',
    publication: 'Journal of Clinical Oncology, 2020',
    authors: 'Brown PD, Gondi V, Pugh S, et al.',
    url: 'https://doi.org/10.1200/JCO.19.02767',
    linkLabel: 'DOI',
  },
  {
    category: 'cns',
    title: 'EORTC 22042 & RTOG 0539 (Rogers et al., IJROBP 2020) — Risk-Stratified RT for Meningiomas',
    indication: 'Menenjiyomlarda risk sınıflandırmasına göre yüksek doz radyoterapi protokolleri: Orta riskli grupta (GTR yapılmış WHO Evre 2) 54 Gy, yüksek riskli grupta (STR veya Evre 3 anaplastik) genişletilmiş marjinle 60 Gy standartlarını belirler.',
    indication_en: 'High-dose radiotherapy protocols establishing 54 Gy for intermediate-risk (WHO Grade 2 with gross total resection) and 60 Gy with margin expansion for high-risk (subtotal resection or Grade 3 anaplastic) meningiomas.',
    publication: 'International Journal of Radiation Oncology, Biology, Physics, 2020; Neuro-Oncology, 2021',
    authors: 'Rogers CL, Won M, Vogelbaum MA, et al. / Weber DC, et al.',
    url: 'https://doi.org/10.1016/j.ijrobp.2020.01.036',
    linkLabel: 'DOI',
  },
  {
    category: 'cns',
    title: 'RTOG 9802 (Buckner et al., NEJM 2016) — Radiation plus PCV in High-Risk Low-Grade Glioma',
    indication: 'Yüksek riskli Evre 2 gliomlarda 54 Gy radyoterapi sonrasında adjuvan PCV kemoterapisi eklenmesinin medyan genel sağkalımı iki katından fazla artırdığını (13.3 yıla karşı 7.8 yıl) kanıtlayan dönüm noktası Faz III çalışma.',
    indication_en: 'Landmark Phase III trial showing the addition of adjuvant PCV chemotherapy following 54 Gy radiation therapy more than doubles median overall survival (13.3 vs 7.8 years) in high-risk Grade 2 gliomas.',
    publication: 'New England Journal of Medicine, 2016',
    authors: 'Buckner JC, Shaw EG, Pugh SL, et al.',
    url: 'https://doi.org/10.1056/NEJMoa1500925',
    linkLabel: 'DOI',
  },
  {
    category: 'cns',
    title: 'NCCN Central Nervous System Cancers Guidelines (v1.2025)',
    indication: 'Glioblastoma, düşük ve yüksek dereceli gliomlar, intrakraniyal menenjiyomlar ve beyin metastazlarında SRS, HA-WBRT ve fraksiyone radyoterapi ilkeleri.',
    indication_en: 'NCCN Guidelines in Oncology: Central Nervous System Cancers, detailing multimodality management of glioblastoma, lower-grade gliomas, meningiomas, and brain metastases.',
    publication: 'National Comprehensive Cancer Network, v1.2025',
    authors: 'Nabors LB, Portnow J, Ahluwalia M, et al.',
    url: 'https://www.nccn.org/guidelines/guidelines-detail?category=1&id=1425',
    linkLabel: 'Guidelines',
  },

  // =========================================================================
  // 7. GYNECOLOGY (8 LANDMARK STUDIES & GUIDELINES)
  // =========================================================================
  {
    category: 'gynecology',
    title: 'EMBRACE II & retroEMBRACE (Lancet Oncol 2021) — Image-Guided Adaptive Brachytherapy in Cervical Cancer',
    indication: 'Lokal ileri serviks kanserinde KRT sonrası 3D MRI rehberli adaptif brakiterapinin (IGABT) uluslararası altın standardı; HR-CTV D90 ≥85-90 Gy EQD2 hedef doz standardıyla %92 üzerinde benzersiz 5 yıllık lokal kontrol ve düşük organ toksisitesi sağlar.',
    indication_en: 'International standard benchmark for 3D MRI-guided adaptive brachytherapy combined with chemoradiotherapy; establishes the HR-CTV D90 ≥85-90 Gy EQD2 target benchmark, achieving unprecedented 5-year local control rates (>92%) and reduced organ toxicity.',
    publication: 'The Lancet Oncology, 2021; Radiotherapy and Oncology, 2016',
    authors: 'Pötter R, Tanderup K, Kirisits C, et al. / Sturdza A, Pötter R, Fokdal LU, et al.',
    url: 'https://doi.org/10.1016/S1470-2045(21)00078-4',
    linkLabel: 'DOI',
  },
  {
    category: 'gynecology',
    title: 'PORTEC-3 Trial (de Boer et al., Lancet Oncol 2018 & 2019) — Adjuvant Chemoradiotherapy in High-Risk Endometrial Cancer',
    indication: 'Yüksek riskli Evre III veya seröz/şeffaf hücreli endometriyum karsinomunda adjuvan eşzamanlı kemoradyoterapinin (48.6 Gy + sisplatin) ve ardından 4 kür karboplatin/paklitakselin 5 yıllık genel sağkalımı (%81.4 vs %76.1) ve başarısızsız sağkalımı anlamlı derecede iyileştirdiğini gösteren randomize Faz III çalışma.',
    indication_en: 'Phase III randomized trial proving adjuvant concurrent chemoradiation (48.6 Gy + cisplatin) followed by 4 cycles of adjuvant carboplatin/paclitaxel significantly enhances 5-year overall survival (81.4% vs 76.1%) and failure-free survival in Stage III / high-risk endometrial carcinoma.',
    publication: 'The Lancet Oncology, 2018 & 2019',
    authors: 'de Boer SM, Powell ME, Mileshkin L, et al.',
    url: 'https://doi.org/10.1016/S1470-2045(17)30879-3',
    linkLabel: 'DOI',
  },
  {
    category: 'gynecology',
    title: 'PORTEC-2 Trial (Nout et al., Lancet 2010) — Vaginal Brachytherapy in High-Intermediate Risk Endometrial Cancer',
    indication: 'Yüksek-orta riskli endometriyum kanserinde vajinal kaf brakiterapisinin (VBT - 3 fraksiyonda 21 Gy) pelvik eksternal RT ile benzer vajinal kontrol (%1.2 vs %1.6) sağlarken şiddetli gastrointestinal toksisiteyi neredeyse tamamen ortadan kaldırdığını kanıtlayan non-inferiorite çalışması.',
    indication_en: 'Randomized Phase III non-inferiority trial proving vaginal brachytherapy (VBT - 21 Gy in 3 fractions) provides vaginal control equal to external beam pelvic RT (1.2% vs 1.6%) while virtually eliminating severe gastrointestinal toxicities.',
    publication: 'The Lancet, 2010',
    authors: 'Nout RA, Smit VT, Putter H, et al.',
    url: 'https://doi.org/10.1016/S0140-6736(09)62163-2',
    linkLabel: 'DOI',
  },
  {
    category: 'gynecology',
    title: 'GOG 92 & Sedlis Criteria (Sedlis et al., Gyn Oncol 1999 & 2006) — Postoperative Pelvic RT in Cervical Cancer',
    indication: 'Lenfovasküler alan invazyonu (LVSI), derin servikal stromal invazyon ve büyük tümör çapı kombinasyonlarını içeren Sedlis kriterlerini tanımlayan ve adjuvan pelvik radyoterapinin nüks riskini %47 oranında azalttığını kanıtlayan çalışma.',
    indication_en: 'Randomized trial establishing the Sedlis criteria (combinations of lymphovascular space invasion [LVSI], deep cervical stromal invasion, and large tumor diameter) as indications for adjuvant pelvic radiotherapy to reduce recurrence by 47%.',
    publication: 'Gynecologic Oncology, 1999 & 2006',
    authors: 'Sedlis A, Bundy BN, Rotman MZ, et al.',
    url: 'https://doi.org/10.1006/gyno.1999.5387',
    linkLabel: 'DOI',
  },
  {
    category: 'gynecology',
    title: 'GOG 109 & Peters Criteria (Peters et al., JCO 2000) — Concurrent Chemoradiation for High-Risk Cervical Cancer',
    indication: 'Radikal histerektomi sonrası pozitif lenf nodu, pozitif cerrahi sınır veya parametrial tutulumu olan yüksek riskli serviks kanserinde adjuvan eşzamanlı sisplatin/5-FU kemoradyoterapisinin tek başına RT’ye kıyasla progresyonsuz ve genel sağkalımı anlamlı düzeyde artırdığını gösteren çalışma.',
    indication_en: 'Foundational Phase III intergroup trial proving adjuvant concurrent cisplatin/5-FU chemoradiation significantly improves progression-free and overall survival in post-radical hysterectomy patients with positive lymph nodes, positive margins, or parametrial involvement.',
    publication: 'Journal of Clinical Oncology, 2000',
    authors: 'Peters WA 3rd, Liu PY, Barrett RJ 2nd, et al.',
    url: 'https://doi.org/10.1200/JCO.2000.18.8.1606',
    linkLabel: 'DOI',
  },
  {
    category: 'gynecology',
    title: 'GROINSS-V & GROINSS-V-II Trials (Oonk et al., JCO 2021) — Radiotherapy for Sentinel Node Micrometastases in Vulvar Cancer',
    indication: 'Bekçi lenf nodu mikrometastazı (≤2 mm) olan vulva kanseri hastalarında adjuvan inguinofemoral radyoterapinin (50 Gy) tam lenfadenektomiye kıyasla çok daha düşük morbidite ile güvenli ve etkili bir alternatif olduğunu kanıtlayan prospektif çok merkezli çalışma.',
    indication_en: 'Prospective multicenter study proving adjuvant inguinofemoral radiotherapy (50 Gy) is an effective, lower-morbidity alternative to full lymphadenectomy for vulvar cancer patients with sentinel node micrometastases (≤2 mm).',
    publication: 'Journal of Clinical Oncology, 2021; JCO, 2008',
    authors: 'Oonk MHM, Slomovitz B, Baldwin PJW, et al.',
    url: 'https://doi.org/10.1200/JCO.20.03004',
    linkLabel: 'DOI',
  },
  {
    category: 'gynecology',
    title: 'MITO RT-1 Study (Macchia et al., Lancet Oncol / Crit Rev 2020) — SBRT for Gynecologic Oligometastases',
    indication: 'Oligoreküren pelvik ve paraaortik jinekolojik lenfatik metastazlarda yüksek doz SBRT’nin (3-5 fraksiyonda 30-45 Gy) minimal invaziv, yüksek lokal kontrollü ve etkin bir tedavi modalitesi olduğunu doğrulayan çok merkezli çalışma.',
    indication_en: 'Multi-institutional study validating high-dose SBRT (30-45 Gy in 3-5 fractions) as an effective, minimally invasive therapeutic modality for oligorecurrent pelvic and para-aortic gynecologic nodal metastases.',
    publication: 'The Lancet Oncology, 2020; Critical Reviews in Oncology/Hematology, 2019',
    authors: 'Macchia G, Laliscia N, D’Agostino GR, et al.',
    url: 'https://doi.org/10.1016/S1470-2045(18)30601-6',
    linkLabel: 'DOI',
  },
  {
    category: 'gynecology',
    title: 'NCCN Gynecologic Malignancies Guidelines (Cervical, Uterine & Vulvar v1.2025)',
    indication: 'Serviks, endometriyum ve vulva kanserlerinde definitif KRT, IGABT, adjuvan pelvik RT/VBT ve pelvik lenfatik ışınlama algoritmaları ve klinik yönergeleri.',
    indication_en: 'NCCN Guidelines in Oncology: Gynecologic Malignancies, outlining clinical recommendations for definitive chemoradiotherapy, IGABT, adjuvant pelvic RT/VBT, and nodal irradiation.',
    publication: 'National Comprehensive Cancer Network, v1.2025',
    authors: 'Abu-Rustum NR, Yashar CM, Bradley K, et al.',
    url: 'https://www.nccn.org/guidelines/guidelines-detail?category=1&id=1422',
    linkLabel: 'Guidelines',
  },

  // =========================================================================
  // 8. HEAD & NECK (8 LANDMARK STUDIES & GUIDELINES)
  // =========================================================================
  {
    category: 'head-neck',
    title: 'EORTC 22931 (Bernier et al., NEJM 2004) — Postoperative Concurrent Chemoradiotherapy in High-Risk HNSCC',
    indication: 'Pozitif cerrahi sınır ve ekstrakapsüler lenf nodu yayılımı (ECE/ENE) olan yüksek riskli baş-boyun kanserli hastalarda cerrahi sonrası eşzamanlı sisplatin kemoradyoterapisinin lokorejyonel kontrolü ve progresyonsuz sağkalımı anlamlı derecede artırdığını kanıtlayan temel çalışma.',
    indication_en: 'Landmark trial proving concurrent cisplatin chemoradiotherapy significantly improves local-regional control and progression-free survival in patients with positive margins and extracapsular nodal extension (ECE/ENE).',
    publication: 'New England Journal of Medicine, 2004',
    authors: 'Bernier J, Domenge C, Ozsahin M, et al.',
    url: 'https://doi.org/10.1056/NEJMoa032641',
    linkLabel: 'DOI',
  },
  {
    category: 'head-neck',
    title: 'RTOG 9501 (Cooper et al., NEJM 2004) — Postoperative Chemoradiotherapy for High-Risk HNSCC',
    indication: 'Yüksek risk kriterlerine (ENE+, pozitif mukoza sınırı) sahip opere baş-boyun skuamöz karsinomlarında postoperatif eşzamanlı kemoradyoterapinin tek başına radyoterapiye üstünlüğünü doğrulayan intergroup Faz III çalışma.',
    indication_en: 'Intergroup trial confirming postop concurrent chemoradiation superiority over RT alone for high-risk features (ENE+, positive mucosal margins).',
    publication: 'New England Journal of Medicine, 2004',
    authors: 'Cooper JS, Pajak TF, Forastiere AA, et al.',
    url: 'https://doi.org/10.1056/NEJMoa040298',
    linkLabel: 'DOI',
  },
  {
    category: 'head-neck',
    title: 'RTOG 91-11 (Forastiere et al., NEJM 2003 / JCO 2013) — Organ Preservation in Advanced Laryngeal Cancer',
    indication: 'İleri evre larenks kanserinde eşzamanlı sisplatin-RT kombinasyonunun indüksiyon KT sonrası RT veya tek başına RT’ye kıyasla en yüksek intakt larenks koruma oranını (%88) sağladığını gösteren temel çalışma.',
    indication_en: 'Foundational trial demonstrating concurrent cisplatin-RT achieves the highest rate of intact larynx preservation (88%) compared to induction chemotherapy followed by RT or RT alone.',
    publication: 'New England Journal of Medicine, 2003; Journal of Clinical Oncology, 2013',
    authors: 'Forastiere AA, Goepfert H, Maor M, et al.',
    url: 'https://doi.org/10.1056/NEJMoa022983',
    linkLabel: 'DOI',
  },
  {
    category: 'head-neck',
    title: 'MAC-NPC Meta-Analysis (Blanchard et al., Lancet Oncol 2015) — Chemoradiotherapy in Nasopharyngeal Cancer',
    indication: 'Lokorejyonel ileri nazofarenks karsinomunda radyoterapiye eşzamanlı kemoradyoterapinin (adjuvan KT ile veya KT\'siz) genel sağkalım ve lokorejyonel kontrol için altın standart olduğunu kanıtlayan kesin meta-analiz.',
    indication_en: 'Definitive meta-analysis establishing concomitant chemoradiotherapy (with or without adjuvant chemotherapy) as the gold standard for locoregionally advanced nasopharyngeal carcinoma.',
    publication: 'The Lancet Oncology, 2015',
    authors: 'Blanchard P, Lee AWM, Marguet S, et al. (MAC-NPC Collaborative Group)',
    url: 'https://doi.org/10.1016/S1470-2045(15)70126-9',
    linkLabel: 'DOI',
  },
  {
    category: 'head-neck',
    title: 'MARCH Meta-Analysis (Bourhis / Lacas et al., Lancet 2006 & 2017) — Hyperfractionated/Accelerated RT in HNSCC',
    indication: 'Lokal ileri baş ve boyun karsinomlarında hiperfraksiyone (günde çift seans) ve hızlandırılmış radyoterapi rejimlerinin konvansiyonel RT’ye kıyasla anlamlı genel sağkalım ve lokorejyonel kontrol üstünlüğü sağladığını doğrulayan meta-analiz.',
    indication_en: 'Confirms hyperfractionated (BID) and accelerated radiotherapy regimens provide a significant overall survival and locoregional control benefit in locally advanced head and neck carcinomas.',
    publication: 'The Lancet, 2006; The Lancet Oncology, 2017',
    authors: 'Bourhis J, Overgaard J, Audry H, et al. / Lacas B, et al.',
    url: 'https://doi.org/10.1016/S1470-2045(17)30458-8',
    linkLabel: 'DOI',
  },
  {
    category: 'head-neck',
    title: 'RTOG 9512 & Yamazaki et al. (Cancer 2006) — Accelerated Fractionation for Early Glottic Laryngeal Cancer',
    indication: 'Erken evre T1-T2 glottik larenks kanserinde fraksiyon başına doz artırımının (2.25 Gy/fx ile 63-65.25 Gy) konvansiyonel 2.0 Gy fraksiyonasyona kıyasla üstün 5 yıllık lokal kontrol sağladığını gösteren çalışma.',
    indication_en: 'Evaluates dose-per-fraction escalation (63-65.25 Gy at 2.25 Gy/fx) demonstrating superior 5-year local control over conventional 2.0 Gy fractionation for early glottic cancer.',
    publication: 'Cancer, 2006; IJROBP, 2008',
    authors: 'Yamazaki H, Nishiyama K, Tanaka E, et al.',
    url: 'https://doi.org/10.1002/cncr.22018',
    linkLabel: 'DOI',
  },
  {
    category: 'head-neck',
    title: 'RTOG 1016 (Gillison et al., Lancet 2019) — Cetuximab vs Cisplatin in HPV-Positive Oropharyngeal Cancer',
    indication: 'HPV-pozitif orofarenks kanserinde sisplatin eşzamanlı kemoradyoterapi standardının setuksimab-radyoterapiye kıyasla genel sağkalım ve lokorejyonel kontrolde belirgin üstün olduğunu kanıtlayan Faz III çalışma.',
    indication_en: 'Randomized evidence supporting concurrent cisplatin chemoradiotherapy over cetuximab-radiotherapy for HPV-positive oropharyngeal cancer.',
    publication: 'The Lancet, 2019',
    authors: 'Gillison ML, Trotti AM, Harris J, et al.',
    url: 'https://doi.org/10.1016/S0140-6736(19)32779-X',
    linkLabel: 'DOI',
  },
  {
    category: 'head-neck',
    title: 'NCCN Head and Neck Cancers Guidelines (v1.2025)',
    indication: 'Nazofarenks, orofarenks, larenks, oral kavite, hipofarenks ve tükürük bezi tümörlerinde definitif KRT, postoperatif adjuvan RT, SIB-IMRT ve organ koruma algoritmaları.',
    indication_en: 'NCCN Clinical Practice Guidelines in Oncology: Head and Neck Cancers, covering nasopharynx, oropharynx, larynx, oral cavity, hypopharynx, and salivary gland consensus recommendations.',
    publication: 'National Comprehensive Cancer Network, v1.2025',
    authors: 'Pfister DG, Spencer S, Adelstein D, et al.',
    url: 'https://www.nccn.org/guidelines/guidelines-detail?category=1&id=1437',
    linkLabel: 'Guidelines',
  },

  // =========================================================================
  // 9. BONE & SOFT TISSUE SARCOMA (7 LANDMARK STUDIES & GUIDELINES)
  // =========================================================================
  {
    category: 'bone-sarcoma',
    title: 'O’Sullivan et al. (Lancet 2002) — Preoperative vs Postoperative Radiotherapy in Soft-Tissue Sarcoma',
    indication: 'Ekstremite yumuşak doku sarkomlarında preoperatif 50 Gy ile postoperatif 66 Gy radyoterapinin lokal kontrol ve yara iyileşmesi/geç fibrozis toksisite profillerini karşılaştıran öncü Faz III çalışma.',
    indication_en: 'Comparison of preoperative (50 Gy) and postoperative (66 Gy) radiotherapy timing, wound complications, and long-term functional fibrosis in extremity soft-tissue sarcoma.',
    publication: 'The Lancet, 2002',
    authors: 'O’Sullivan B, Davis AM, Turcotte R, et al.',
    url: 'https://doi.org/10.1016/S0140-6736(02)09411-1',
    linkLabel: 'DOI',
  },
  {
    category: 'bone-sarcoma',
    title: 'STRASS Trial / EORTC 62092 (Bonvalot et al., Lancet Oncol 2020) — Preoperative RT in Retroperitoneal Sarcoma',
    indication: 'Primer retroperitoneal sarkomlarda preoperatif radyoterapi ve cerrahi kombinasyonunun abdominal nükssüz sağkalım üzerindeki etkisini değerlendiren; özellikle retroperitoneal liposarkomlarda belirgin lokorejyonel fayda sağlandığını gösteren çok merkezli randomize Faz III çalışma.',
    indication_en: 'Multicentre randomized Phase III trial evaluating abdominal recurrence-free survival in primary retroperitoneal sarcomas, highlighting pronounced local-regional benefit in retroperitoneal liposarcomas.',
    publication: 'The Lancet Oncology, 2020',
    authors: 'Bonvalot S, Gronchi A, Le Pechoux C, et al.',
    url: 'https://doi.org/10.1016/S1470-2045(20)30446-0',
    linkLabel: 'DOI',
  },
  {
    category: 'bone-sarcoma',
    title: 'DOREMY Trial (de Vreeze et al., Lancet Oncol 2020) — Dose-Reduced RT for Myxoid Liposarcoma (36 Gy / 9 fx)',
    indication: 'Miksosarkom / miksoid liposarkomların belirgin radyosensitivitesini kanıtlayan, azaltılmış preoperatif hipofraksiyone radyoterapi (9 fraksiyonda 36 Gy) ile %91 patolojik yanıt oranı ve mükemmel lokal kontrol sağlandığını gösteren çalışma.',
    indication_en: 'Proves marked radiosensitivity of myxoid liposarcoma, achieving a 91% pathological response rate and excellent local control with reduced preoperative 36 Gy / 9 fx.',
    publication: 'The Lancet Oncology, 2020',
    authors: 'de Vreeze R, de Jong D, Haas R, et al.',
    url: 'https://doi.org/10.1016/S1470-2045(20)30504-0',
    linkLabel: 'DOI',
  },
  {
    category: 'bone-sarcoma',
    title: 'MGH High-Dose Osteosarcoma Series (DeLaney et al., Cancer 2005) — Dose-Escalated RT in Osteosarcoma',
    indication: 'İnoperabl veya pozitif cerrahi sınırlı osteosarkomlarda yüksek doz radyoterapinin (≥66-70 Gy EQD2, proton ışını ve ileri IMRT) lokal kontrol ve küratif potansiyel sağladığını gösteren seri.',
    indication_en: 'Demonstrates that high-dose radiation therapy (≥66-70 Gy EQD2, often utilizing proton beam or advanced IMRT) provides curative potential and local control for inoperable or positive-margin osteosarcomas.',
    publication: 'Cancer, 2005',
    authors: 'DeLaney TF, Park L, Goldberg SI, et al.',
    url: 'https://doi.org/10.1002/cncr.21175',
    linkLabel: 'DOI',
  },
  {
    category: 'bone-sarcoma',
    title: 'Euro-Ewing Trials (Schuck et al., JCO 2003 & 2010) — Radiation Principles in Bone Ewing Sarcoma',
    indication: 'Kemik Ewing sarkomunda lokal kontrol standartları; inoperabl tümörlerde definitif RT (54-55.8 Gy) ve cerrahi sınır pozitifliği veya marjinal rezeksiyonlarda postoperatif adjuvan RT (45-50.4 Gy) ilkelerini belirler.',
    indication_en: 'Outlines local control outcomes, establishing definitive RT (54-55.8 Gy) for inoperable tumors and adjuvant postoperative RT (45-50.4 Gy) for positive/marginal surgical resections.',
    publication: 'Journal of Clinical Oncology, 2003 & 2010',
    authors: 'Schuck A, Ahrens S, Paulussen M, et al.',
    url: 'https://doi.org/10.1200/JCO.2003.09.043',
    linkLabel: 'DOI',
  },
  {
    category: 'bone-sarcoma',
    title: 'PTCOG Skull Base & Spine Chordoma Consensus (Stacchiotti et al., Lancet Oncol 2017) — High-Dose RT Principles',
    indication: 'Kafa tabanı ve sakral kordomalar ile kondrosarkomlarda radyo-rezistansı aşmak için stereotaktik foton, proton veya karbon iyonları ile yüksek biyolojik efektif dozların (>70-74 Gy EQD2) gerekliliğini doğrulayan uluslararası uzlaşı.',
    indication_en: 'Validates requirement of high biological effective doses (>70-74 Gy EQD2) via stereotactic photons, protons, or carbon ions to overcome radioresistance in chordomas and low-grade chondrosarcomas.',
    publication: 'The Lancet Oncology, 2017; IJROBP, 1999',
    authors: 'Stacchiotti S, Sommer J, Chordoma Global Consensus Group, et al.',
    url: 'https://doi.org/10.1016/S1470-2045(17)30026-8',
    linkLabel: 'DOI',
  },
  {
    category: 'bone-sarcoma',
    title: 'NCCN Soft Tissue Sarcoma & Bone Cancer Guidelines (v1.2025)',
    indication: 'Ekstremite ve gövde sarkomları, retroperitoneal sarkomlar, osteosarkom, Ewing sarkomu ve kordomalar için preoperatif/postoperatif RT ve yüksek doz radyoterapi algoritmaları.',
    indication_en: 'Primary clinical algorithms for extremity/trunk sarcomas, retroperitoneal disease, osteosarcoma, Ewing sarcoma, and chordomas, detailing definitive and adjuvant radiation recommendations.',
    publication: 'National Comprehensive Cancer Network, v1.2025',
    authors: 'von Mehren M, Kane JM, Agulnik M, et al.',
    url: 'https://www.nccn.org/guidelines/guidelines-detail?category=1&id=1464',
    linkLabel: 'Guidelines',
  },

  // =========================================================================
  // 10. PHYSICS, OAR CONSTRAINTS & RADIOBIOLOGY
  // =========================================================================
  {
    category: 'oar',
    title: 'ICRU Report 83 — Prescribing, Recording, and Reporting IMRT',
    indication: 'IMRT’de doz reçetelendirme, raporlama ve hedef hacim/doz-volüm değerlendirmeleri için uluslararası rapor.',
    indication_en: 'International recommendations for IMRT dose prescription, recording, reporting, target volumes, and dose-volume assessment.',
    publication: 'Journal of the ICRU, 2010',
    authors: 'International Commission on Radiation Units and Measurements',
    url: 'https://doi.org/10.1093/jicru/ndq002',
    linkLabel: 'DOI',
  },
  {
    category: 'oar',
    title: 'ICRU Report 91 — Stereotactic Treatments with Small Photon Beams',
    indication: 'Küçük foton alanlarıyla stereotaktik tedavilerde doz reçetelendirme, kayıt ve raporlama.',
    indication_en: 'Recommendations for prescribing, recording, and reporting stereotactic treatments using small photon beams.',
    publication: 'Journal of the ICRU, 2017; journal summary, 2019',
    authors: 'International Commission on Radiation Units and Measurements',
    url: 'https://doi.org/10.1007/s00066-018-1416-x',
    linkLabel: 'DOI',
  },
  {
    category: 'oar',
    title: 'QUANTEC — Use of Normal Tissue Complication Probability Models in the Clinic',
    indication: 'Normal doku komplikasyon olasılığı modelleri ve klinik doz-kısıt kararları için temel derleme.',
    indication_en: 'Foundational review of normal-tissue complication probability models and their use in clinical dose-constraint decisions.',
    publication: 'International Journal of Radiation Oncology, Biology, Physics, 2010',
    authors: 'Marks LB et al.',
    url: 'https://pubmed.ncbi.nlm.nih.gov/20171502/',
    linkLabel: 'PubMed',
  },
];

export default function ReferencesPage() {
  const { language: lang } = useLanguage();
  const [activeCategory, setActiveCategory] = useState<CategoryId | 'all'>('all');
  const filteredReferences = useMemo(
    () => activeCategory === 'all'
      ? references
      : references.filter(reference => reference.category === activeCategory),
    [activeCategory],
  );

  return (
    <main className="min-h-screen bg-[#070b14] px-4 py-6 text-slate-100 sm:px-6 md:p-12">
      <div className="mx-auto w-full max-w-7xl">
        <div className="mb-8">
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-lg border border-slate-700 bg-[#0e1726] px-3 py-2 text-sm font-medium text-slate-200 transition hover:border-sky-500/60 hover:bg-[#131f33] hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            {lang === 'en' ? 'Back to portal' : 'Portala dön'}
          </Link>
        </div>

        <header className="mb-8 max-w-4xl">
          <div className="mb-3 flex items-center gap-2 text-sky-300">
            <BookOpen className="h-5 w-5" aria-hidden="true" />
            <span className="text-xs font-semibold uppercase tracking-[0.16em]">
              {lang === 'en' ? 'RADONC CDSS • EVIDENCE ATLAS' : 'RADONC CDSS • KANIT ATLASI'}
            </span>
          </div>
          <h1 className="text-2xl font-bold leading-tight tracking-tight text-white sm:text-3xl md:text-4xl">
            {lang === 'en'
              ? '📚 Clinical Guidelines, Landmark Trials & Evidence Atlas'
              : '📚 Klinik Kılavuzlar, Önemli Çalışmalar ve Bilimsel Kanıt Atlası'}
          </h1>
          <p className="mt-4 max-w-3xl text-sm leading-6 text-slate-400 sm:text-base">
            {lang === 'en'
              ? 'Literature sources for fractionation approaches, target-volume definitions, and dosimetric OAR constraints used in RadOnc CDSS. Publication titles remain in their original language; summaries are translated.'
              : 'RadOnco CDSS sistemindeki fraksiyonasyon yaklaşımları, hedef hacim tanımları ve OAR kısıtları için literatür kaynakları. Yayın başlıkları özgün dilinde, özetler seçilen dilde gösterilir.'}
          </p>
        </header>

        <section aria-label={lang === 'en' ? 'Reference categories' : 'Kaynak kategorileri'} className="mb-6">
          <div className="flex gap-2 overflow-x-auto pb-2">
            {categories.map(category => {
              const isActive = activeCategory === category.id;
              const count = category.id === 'all'
                ? references.length
                : references.filter(r => r.category === category.id).length;
              return (
                <button
                  key={category.id}
                  type="button"
                  aria-pressed={isActive}
                  onClick={() => setActiveCategory(category.id)}
                  className={`shrink-0 rounded-lg border px-3 py-2 text-xs font-semibold transition sm:text-sm flex items-center gap-1.5 ${
                    isActive
                      ? 'border-sky-400 bg-sky-500/15 text-sky-200 ring-1 ring-sky-500/50'
                      : 'border-slate-800 bg-[#0e1726] text-slate-400 hover:border-slate-600 hover:text-slate-100'
                  }`}
                >
                  <span>{lang === 'en' ? category.label_en : category.label_tr}</span>
                  <span
                    className={`text-[10px] px-1.5 py-0.5 rounded-full font-mono font-bold ${
                      isActive ? 'bg-sky-400/30 text-sky-200' : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </section>

        <section aria-live="polite" aria-label={lang === 'en' ? 'Scientific references' : 'Bilimsel kaynaklar'}>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-slate-200">
              {activeCategory === 'all'
                ? (lang === 'en' ? 'All scientific references' : 'Tüm bilimsel kaynaklar')
                : (lang === 'en'
                  ? categories.find(category => category.id === activeCategory)?.label_en
                  : categories.find(category => category.id === activeCategory)?.label_tr)}
            </h2>
            <span className="text-xs text-slate-400">
              {filteredReferences.length} {lang === 'en' ? 'references' : 'kaynak'}
            </span>
          </div>
          <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
            {filteredReferences.map(reference => (
              <article
                key={reference.title}
                className="flex h-full flex-col rounded-2xl border border-slate-800 bg-[#0e1726] p-4 shadow-sm transition hover:border-slate-700 sm:p-5"
              >
                <div className="mb-3 flex items-start justify-between gap-3">
                  <span className="rounded-md border border-sky-500/20 bg-sky-500/10 px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-sky-300">
                    {lang === 'en'
                      ? categories.find(category => category.id === reference.category)?.label_en
                      : categories.find(category => category.id === reference.category)?.label_tr}
                  </span>
                  <span className="shrink-0 text-right text-[11px] text-slate-400">{reference.publication}</span>
                </div>
                <h3 className="text-sm font-semibold leading-5 text-slate-100 sm:text-base">
                  {reference.title}
                </h3>
                <p className="mt-2 flex-1 text-xs leading-5 text-slate-400 sm:text-sm">
                  {lang === 'en' ? reference.indication_en : reference.indication}
                </p>
                <div className="mt-4 flex flex-wrap items-end justify-between gap-3 border-t border-slate-800/80 pt-3">
                  <div>
                    <div className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                      {lang === 'en' ? 'AUTHORS' : 'YAZARLAR'}
                    </div>
                    <p className="mt-1 text-xs text-slate-300">{reference.authors}</p>
                  </div>
                  <a
                    href={reference.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-slate-700 bg-[#131f33] px-2.5 py-1.5 text-xs font-semibold text-sky-300 transition hover:border-sky-500/60 hover:bg-sky-500/10 hover:text-sky-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400"
                  >
                    {reference.linkLabel ?? 'PubMed'}
                    <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
                  </a>
                </div>
              </article>
            ))}
          </div>
        </section>

        <aside className="mt-10 rounded-2xl border border-amber-500/25 bg-amber-500/[0.06] p-4 sm:p-6">
          <div className="flex items-start gap-3">
            <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-amber-300" aria-hidden="true" />
            <div>
              <h2 className="text-sm font-bold text-amber-100">
                {lang === 'en' ? 'Legal, Copyright & Trademark Disclaimer' : 'Yasal Sorumluluk, Telif ve Marka Bildirimi'}
              </h2>
              <p className="mt-3 text-xs leading-6 text-slate-300 sm:text-sm">
                {lang === 'en'
                  ? 'NCCN®, ASTRO®, ESTRO®, RTOG®, QUANTEC®, EMBRACE® and other related names are the property of their respective trademark-owning organizations.'
                  : 'NCCN®, ASTRO®, ESTRO®, RTOG®, QUANTEC®, EMBRACE® ve ilgili diğer isimler kendi tescilli kurumlarının mülkiyetindedir.'}
              </p>
              <p className="mt-2 text-xs leading-6 text-slate-400 sm:text-sm">
                {lang === 'en'
                  ? 'This web platform is an independent clinical decision-support and educational tool. It is not affiliated with the named organizations or cooperative groups. References are listed for citation and scholarly discussion in accordance with applicable fair-use principles.'
                  : 'Bu web platformu, bağımsız bir klinik karar destek ve eğitim aracıdır. Bahsi geçen kurum veya kooperatif çalışma gruplarıyla doğrudan kurumsal bir ortaklığı bulunmamaktadır. Referanslar akademik adil kullanım (Fair Use) prensiplerine uygun olarak atıf amacıyla listelenmiştir.'}
              </p>
              <p className="mt-3 border-t border-amber-500/15 pt-3 text-[11px] leading-5 text-slate-400">
                {lang === 'en'
                  ? 'This atlas identifies academic sources; it is not a patient-specific clinical recommendation or a substitute for guideline texts. Treatment decisions should be based on current guidelines, institutional protocols, and specialist judgment.'
                  : 'Bu atlas akademik kaynakları tanımlar; bireysel hastaya yönelik klinik öneri veya kılavuz metninin yerine geçmez. Tedavi kararları güncel kılavuzlar, kurum protokolleri ve uzman değerlendirmesiyle verilmelidir.'}
              </p>
            </div>
          </div>
        </aside>
      </div>
    </main>
  );
}
