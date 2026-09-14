import { DiseaseItem, MainCategoryGroup } from '../types';

export const MAIN_GROUPS: MainCategoryGroup[] = [
  'GÜS (Genitoüriner Sistem)',
  'GİS (Gastrointestinal Sistem)',
  'Torasik / Akciğer',
  'Baş-Boyun Onkolojisi',
  'Jinekolojik Onkoloji',
  'Meme Onkolojisi',
  'Santral Sinir Sistemi (MSS)',
  'Sarkom & Kemik',
  'Dermatolojik Onkoloji',
  'Palyatif Radyoterapi'
];

export const DISEASE_CATALOG: DiseaseItem[] = [
  // GÜS
  { id: 'prostate', name: 'Prostat Kanseri', subTitle: 'Gleason, tPSA, SVI, LN, M0/M1 & SIB', group: 'GÜS (Genitoüriner Sistem)', guidelinePrimary: 'NCCN / ESTRO' },
  { id: 'bladder', name: 'Mesane Kanseri', subTitle: 'Trimodalite Organ Koruma & TURBT', group: 'GÜS (Genitoüriner Sistem)', guidelinePrimary: 'NCCN / BC2001' },
  { id: 'kidney_rcc', name: 'Böbrek (RCC)', subTitle: 'Primer Renal SBRT & Oligometastaz', group: 'GÜS (Genitoüriner Sistem)', guidelinePrimary: 'I収RT / NCCN' },
  
  // GİS
  { id: 'rectum', name: 'Rektum Kanseri', subTitle: 'Total Neoadjuvan (TNT RAPIDO) vs. KRT', group: 'GİS (Gastrointestinal Sistem)', guidelinePrimary: 'NCCN / ESMO' },
  { id: 'anal_canal', name: 'Anal Kanal Kanseri', subTitle: 'Nigro Protokolü, SIB Kemoradyoterapi', group: 'GİS (Gastrointestinal Sistem)', guidelinePrimary: 'NCCN / ACT II' },
  { id: 'esophagus', name: 'Özofagus Kanseri', subTitle: 'Neoadjuvan CROSS vs. Definitif KRT', group: 'GİS (Gastrointestinal Sistem)', guidelinePrimary: 'CROSS / NCCN' },
  { id: 'pancreas', name: 'Pankreas Kanseri', subTitle: 'Borderline/LAPC SBRT vs. Kemoradyoterapi', group: 'GİS (Gastrointestinal Sistem)', guidelinePrimary: 'NCCN / Alliance' },
  { id: 'liver_hcc', name: 'Karaciğer (HCC & Met)', subTitle: 'Ablatif Karaciğer SBRT', group: 'GİS (Gastrointestinal Sistem)', guidelinePrimary: 'AASLD / ASTRO' },

  // Torasik
  { id: 'lung_nsclc', name: 'Akciğer - KHDAK', subTitle: 'Erken Evre SBRT vs. Evre III KRT', group: 'Torasik / Akciğer', guidelinePrimary: 'NCCN / ASTRO' },
  { id: 'lung_sclc', name: 'Akciğer - KHAK', subTitle: 'Sınırlı Evre BID / QD & PCI', group: 'Torasik / Akciğer', guidelinePrimary: 'NCCN SCLC' },

  // Baş-Boyun
  { id: 'nasopharynx', name: 'Nazofarinks Kanseri', subTitle: '3 Kademeli SIB (70/60/54 Gy)', group: 'Baş-Boyun Onkolojisi', guidelinePrimary: 'NCCN / CSCO' },
  { id: 'hypopharynx', name: 'Hipofarinks Kanseri', subTitle: 'Organ Koruma KRT vs. Postop RT', group: 'Baş-Boyun Onkolojisi', guidelinePrimary: 'NCCN H&N' },

  // Jinekoloji
  { id: 'cervix', name: 'Serviks Kanseri', subTitle: 'FIGO 2018, SIB Nodal Boost & 3D IGABT', group: 'Jinekolojik Onkoloji', guidelinePrimary: 'EMBRACE II' },
  { id: 'endometrium', name: 'Endometriyum Kanseri', subTitle: 'PORTEC Yüksek Risk Pelvik RT vs. VBT', group: 'Jinekolojik Onkoloji', guidelinePrimary: 'PORTEC / NCCN' },

  // Meme
  { id: 'breast', name: 'Meme Kanseri', subTitle: 'WBI (26 Gy / 40 Gy), RNI, Boost & APBI', group: 'Meme Onkolojisi', guidelinePrimary: 'ASTRO / NCCN' },

  // MSS
  { id: 'glioma', name: 'Glial Tümörler (GBM/LGG)', subTitle: 'IDH, 1p19q, Stupp 60 Gy vs. Kırılgan 40 Gy', group: 'Santral Sinir Sistemi (MSS)', guidelinePrimary: 'EANO / NCCN' },
  { id: 'meningioma', name: 'Menenjiom', subTitle: 'Grade I-III, Simpson, Semptom & SRS', group: 'Santral Sinir Sistemi (MSS)', guidelinePrimary: 'EANO / ESTRO' },

  // Sarkom & Kemik
  { id: 'sarcoma_sts', name: 'Yumuşak Doku Sarkomu', subTitle: 'Preoperatif 50 Gy vs. Postoperatif 60-66 Gy', group: 'Sarkom & Kemik', guidelinePrimary: 'NCCN / ASTRO' },
  
  // Dermatolojik Onkoloji
  { id: 'skin_melanoma', name: 'Melanom', subTitle: 'Adjuvan Havza RT & Beyin SRS', group: 'Dermatolojik Onkoloji', guidelinePrimary: 'NCCN Melanoma' },
  { id: 'skin_nonmelanoma', name: 'NMSC (BCC/SCC)', subTitle: 'Maske Alanı H-zone, PNI+, Cerrahi Sınır R1', group: 'Dermatolojik Onkoloji', guidelinePrimary: 'NCCN NMSC' },

  // Palyatif
  { id: 'palliative_bone', name: 'Palyatif Kemik RT', subTitle: 'Ağrı, Kord Basısı, SBRT & 8 Gy Tek Fraksiyon', group: 'Palyatif Radyoterapi', guidelinePrimary: 'ASTRO Bone' },
];