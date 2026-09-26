/**
 * Radiation Oncology Clinical Decision Support System (RadOnco CDSS)
 * Comprehensive 12-Organ Adaptive Clinical Decision & Prescription Matrix
 * Standards: NCCN v1.2025, ASTRO, ESTRO, QUANTEC, HyTEC, EMBRACE II, RAPIDO, PACIFIC, STAMPEDE, PORTEC-3, GROINSS-V
 */

'use client';

import React, { useState, useMemo, useEffect } from 'react';
import {
  Radiation,
  Copy,
  Check,
  BookOpen,
  Wind,
  Droplets,
  CircleDot,
  Brain,
  Sparkles,
  Bone,
  Shield,
  ShieldCheck,
  Droplet,
  Baby,
  HandHeart,
  User,
  UtensilsCrossed,
  AlertTriangle,
  ShieldAlert,
  CheckCircle2,
  XCircle,
  Activity,
  Layers,
  ChevronRight,
  Info,
  Sun,
  Moon
} from 'lucide-react';
import { Show, SignInButton, SignOutButton, SignUpButton, UserButton, useUser } from '@clerk/nextjs';

// ==========================================
// 1. TİPLER VE KLİNİK VERİ MODELLERİ
// ==========================================

export type OrganId =
  | 'thorax'
  | 'prostate'
  | 'breast'
  | 'gis'
  | 'head-neck'
  | 'cns'
  | 'gynecology'
  | 'bone-sarcoma'
  | 'skin'
  | 'hematologic'
  | 'pediatric'
  | 'palliative'
  | 'benign';

interface EContourTarget {
  url: string;
  label_tr: string;
  label_en: string;
}

const getAdaptiveEContour = (
  organ: OrganId,
  subsite: string,
  t: string,
  n: string,
  m: string,
  riskCategory?: string,
  surgeryStatus?: string,
): EContourTarget => {
  const normalizedSubsite = subsite.toLocaleLowerCase('tr');
  const normalizedSurgery = surgeryStatus?.toLocaleLowerCase('tr') ?? '';
  const normalizedRisk = riskCategory?.toLocaleLowerCase('tr') ?? '';
  const isHighRisk = /yüksek|high|unfavorable|unfavourable|çok yüksek/.test(normalizedRisk);
  const target = (url: string, label_tr: string, label_en: string): EContourTarget => ({
    url,
    label_tr,
    label_en,
  });

  if (organ === 'prostate' && normalizedSubsite.includes('bladder')) {
    return target(
      'https://econtour.org/cases/',
      'eContour: Mesane Koruyucu KRT & Pelvik Lenfatikler',
      'eContour: Bladder-Preserving CRT & Pelvic Nodes',
    );
  }

  if (organ === 'prostate' && normalizedSubsite.includes('prostate')) {
    if (normalizedSurgery.includes('postop') || normalizedSurgery.includes('prostatektomi')) {
      return target(
        'https://econtour.org/cases/34',
        'eContour: RTOG Prostatik Yatak (Fossa) Atlası',
        'eContour: RTOG Prostate Bed (Fossa) Atlas',
      );
    }
    if (t.startsWith('T3') || t.startsWith('T4') || n.startsWith('N1') || isHighRisk) {
      return target(
        'https://econtour.org/cases/34',
        'eContour: Yüksek Risk Prostat + Pelvik Lenfatikler',
        'eContour: High-Risk Prostate + Pelvic Nodes',
      );
    }
    return target(
      'https://econtour.org/cases/34',
      'eContour: İntakt Prostat Bezi (SBRT/Hipofraksiyon)',
      'eContour: Intact Prostate Gland Atlas',
    );
  }

  if (organ === 'thorax') {
    if (normalizedSubsite.includes('nsclc') || normalizedSubsite === 'thorax-nsclc') {
      if (n === 'N2' || n === 'N3' || t === 'T3' || t === 'T4') {
        return target(
          'https://econtour.org/cases/',
          'eContour: Lokal İleri KHDAK & Mediasten Atlası',
          'eContour: Locally Advanced NSCLC & Mediastinal Nodes',
        );
      }
      return target(
        'https://econtour.org/cases/',
        'eContour: Akciğer SBRT (4D-CT / ITV) Atlası',
        'eContour: Lung SBRT (4D-CT / ITV Target Volume)',
      );
    }
    if (normalizedSubsite.includes('sclc') && !normalizedSubsite.includes('nsclc')) {
      return target(
        'https://econtour.org/cases/',
        'eContour: Sınırlı Evre KHAK Torasik KRT & PCI',
        'eContour: Limited SCLC Thoracic CRT & PCI',
      );
    }
    if (normalizedSubsite.includes('thymoma') || normalizedSubsite.includes('timoma')) {
      return target(
        'https://econtour.org/cases/',
        'eContour: Timoma Masaoka Cerrahi Yatak PORT',
        'eContour: Thymoma Post-op Bed (PORT) Atlas',
      );
    }
    if (n === 'N2' || n === 'N3' || t === 'T3' || t === 'T4') {
      return target(
        'https://econtour.org/cases/',
        'eContour: Lokal İleri KHDAK & IASLC Mediastinal Nodal İstasyonlar',
        'eContour: Locally Advanced NSCLC & Mediastinal Stations',
      );
    }
    return target(
      'https://econtour.org/cases/',
      'eContour: Akciğer SBRT (4D-CT / ITV Hacim Kapsamı)',
      'eContour: Lung SBRT (4D-CT / ITV Target Volume)',
    );
  }

  if (organ === 'breast') {
    if (n === 'N2' || n === 'N3' || normalizedSurgery.includes('mastektomi')) {
      return target(
        'https://econtour.org/cases/74',
        'eContour: Göğüs Duvarı + Aksilla & Supraklavikular (RNI)',
        'eContour: Chest Wall + Regional Nodal Irradiation (RNI)',
      );
    }
    return target(
      'https://econtour.org/hypofrac',
      'eContour: Tüm Meme (WBRT) & Kavite Boost Atlası',
      'eContour: Whole Breast & Tumor Bed Cavity Atlas',
    );
  }

  if (organ === 'gis') {
    if (normalizedSubsite.includes('rektum') || normalizedSubsite.includes('rectal')) {
      return target(
        'https://econtour.org/cases/11',
        'eContour: Preoperatif Rektum & Pelvik Mezorektum Atlası',
        'eContour: Preoperative Rectal & Pelvic Mesorectum',
      );
    }
    if (normalizedSubsite.includes('mide') || normalizedSubsite.includes('gastric')) {
      return target(
        'https://econtour.org/cases/',
        'eContour: Adjuvan Mide Cerrahi Yatak & Nodal Kapsam',
        'eContour: Adjuvant Gastric Bed & Nodal Stations',
      );
    }
    if (normalizedSubsite.includes('karaciger') || normalizedSubsite.includes('karaciğer') || normalizedSubsite.includes('liver')) {
      return target(
        'https://econtour.org/cases/',
        'eContour: Karaciğer Primer/Metastaz SBRT Atlası',
        'eContour: Liver SBRT & Normal Tissue Envelope',
      );
    }
    return target(
      'https://econtour.org/cases/',
      'eContour: Gastrointestinal Tümör Konturlama Atlası',
      'eContour: Gastrointestinal Contouring Atlas',
    );
  }

  if (organ === 'head-neck') {
    if (normalizedSubsite.includes('nasopharynx') || normalizedSubsite.includes('nazofarenks')) {
      return target(
        'https://econtour.org/cases/',
        'eContour: Nazofarenks & Retrofarengeal / Kafa Tabanı Kapsamı',
        'eContour: Nasopharynx & Retropharyngeal / Skull Base',
      );
    }
    return target(
      'https://econtour.org/cases/',
      'eContour: Baş-Boyun Bilateral Servikal Boyun Düzeyleri (I-VII)',
      'eContour: Head & Neck Bilateral Neck Levels (I-VII)',
    );
  }

  if (organ === 'cns') {
    if (normalizedSubsite.includes('gbm') || normalizedSubsite.includes('glioblastom')) {
      return target(
        'https://econtour.org/cases/',
        'eContour: Glioblastom (GBM) Stupp T1+Gd / FLAIR CTV Atlası',
        'eContour: Glioblastoma (GBM) Stupp T1+Gd / FLAIR CTV',
      );
    }
    if (normalizedSubsite.includes('meningioma') || normalizedSubsite.includes('menenj')) {
      return target(
        'https://econtour.org/cases/',
        'eContour: Menenjiom SRS / Fraksiyone SRT Hedef Hacmi',
        'eContour: Meningioma SRS / FSRT Target Volume',
      );
    }
    return target(
      'https://econtour.org/cases/',
      'eContour: Beyin Metastazları Tek/Oligo SRS Atlası',
      'eContour: Brain Metastases SRS / HA-WBRT Atlas',
    );
  }

  if (organ === 'gynecology') {
    if (normalizedSubsite.includes('endometriyum') || normalizedSubsite.includes('endometrial')) {
      return target(
        'https://econtour.org/cases/',
        'eContour: Endometriyum PORTEC-2 VCB & Pelvik EBRT',
        'eContour: Endometrial PORTEC-2 VCB & Pelvic EBRT',
      );
    }
    if (normalizedSubsite.includes('vulva') || normalizedSubsite.includes('vulvar')) {
      return target(
        'https://econtour.org/cases/',
        'eContour: Vulva GROINSS-V Kasık & Pelvik Lenfatikler',
        'eContour: Vulva GROINSS-V Inguinal & Pelvic Nodes',
      );
    }
    return target(
      'https://econtour.org/cases/',
      'eContour: EMBRACE II Serviks Pelvik EBRT & MR-IGABT',
      'eContour: EMBRACE II Cervix Pelvic EBRT & MR-IGABT',
    );
  }

  if (organ === 'bone-sarcoma') {
    if (normalizedSubsite.includes('ewing') || normalizedSubsite.includes('osteosarkom')) {
      return target(
        'https://econtour.org/cases/',
        'eContour: Kemik Sarkomları (Pre-KT Kemik Tutulum Hacmi)',
        'eContour: Bone Sarcoma (Pre-chemo Bone Extent CTV)',
      );
    }
    return target(
      'https://econtour.org/cases/',
      'eContour: Yumuşak Doku Sarkomu Preop 50 Gy & Cilt Şeridi',
      'eContour: Soft Tissue Sarcoma Preop 50 Gy & Skin Sparing',
    );
  }

  if (organ === 'skin') {
    return target(
      'https://econtour.org/cases/',
      'eContour: Kutanöz Melanom / NMSC Marjin ve Nodal Atlası',
      'eContour: Cutaneous Melanoma / NMSC Margin & Nodal Atlas',
    );
  }

  if (organ === 'hematologic') {
    return target(
      'https://econtour.org/cases/',
      'eContour: Lenfoma ILROG Tutulu Alan (ISRT / INRT) Atlası',
      'eContour: Lymphoma ILROG Involved-Site RT (ISRT/INRT)',
    );
  }

  if (organ === 'pediatric') {
    return target(
      'https://econtour.org/cases/',
      'eContour: Pediatrik Medulloblastom (CSI) & Wilms Atlası',
      'eContour: Pediatric Medulloblastoma (CSI) & Wilms Atlas',
    );
  }

  if (organ === 'palliative') {
    if (normalizedSubsite.includes('spinal') || normalizedSubsite.includes('kord')) {
      return target(
        'https://econtour.org/cases/',
        'eContour: Spinal Kord Basısı Acil Dekompresif KRT',
        'eContour: Spinal Cord Compression Emergency RT',
      );
    }
    return target(
      'https://econtour.org/cases/',
      'eContour: Kemik Metastazları Omurga/Femur SBRT & 3D',
      'eContour: Bone Metastases Spine/Femur SBRT & 3D',
    );
  }

  if (organ === 'benign') {
    if (normalizedSubsite.includes('ho') || normalizedSubsite.includes('heterotopik')) {
      return target(
        'https://econtour.org/cases/',
        'eContour: Heterotopik Ossifikasyon Kalça Periartiküler',
        'eContour: Heterotopic Ossification Periarticular Soft Tissue',
      );
    }
    if (normalizedSubsite.includes('keloid')) {
      return target(
        'https://econtour.org/cases/',
        'eContour: Keloid Cerrahi Eksizyon Yatağı (<24h)',
        'eContour: Keloid Excision Bed Superficial Target (<24h)',
      );
    }
    if (normalizedSubsite.includes('dupuytren')) {
      return target(
        'https://econtour.org/cases/',
        'eContour: Dupuytren Palmar Aponöroz Nodül & Kordon',
        'eContour: Dupuytren Palmar Aponeurosis Cord & Nodule',
      );
    }
    return target(
      'https://econtour.org/cases/',
      'eContour: Dejeneratif Kas-İskelet Düşük Doz RT Hedefi',
      'eContour: Degenerative Musculoskeletal Low-Dose RT',
    );
  }

  return target(
    'https://econtour.org/cases/',
    'eContour: İnteraktif 3D Konturlama Atlası',
    'eContour: Interactive 3D Contouring Atlas',
  );
};

const TRANSLATION_MAP: Record<string, string> = {
  'Muayenede palpe edilemeyen; PSA yüksekliği biyopsisinde saptanan': 'Non-palpable tumor identified clinically; detected by elevated PSA biopsy',
  'Palpabl tümör; bir lobun yarısı or daha azı ile limited': 'Palpable tumor confined to half of one lobe or less',
  'Palpabl tümör; bir lobun yarısından fazlasına uzanmış': 'Palpable tumor involving more than half of one lobe',
  'Bilateral her iki prostat lobunu tutan kitle': 'Tumor involving both lobes bilaterally',
  'Extracapsular extension (ECE) - Prostate kapsülünü aşmış': 'Extracapsular extension (ECE) - Extends beyond prostatic capsule',
  'Rectum, levator kasları or pelvik taban komşu organ invasion': 'Invasion of adjacent organs: rectum, levator muscles, or pelvic floor',
  'Regional pelvik lymph node metastasis absent': 'No regional pelvic lymph node metastasis',
  'Pelvic lymph node metastasis (obturator, iliak nodlar)': 'Pelvic lymph node metastasis (obturator, internal/external iliac)',
  'ORTA-FAVORABLE: ADT GENELLİKLE NOT REQUIRED': 'INTERMEDIATE-FAVORABLE: ADT GENERALLY NOT REQUIRED',
  '60 Gy / 20 fx (Ilımlı Hipofraksiyonasyon CHHIP)': '60 Gy / 20 fx (Moderate Hypofractionation - CHHIP Protocol)',
  'Intermediate riskli prostat kanserinde 20 fraksiyonluk rejim 39 fraksiyona non-inferiordur (Category 1 standard).': 'In intermediate-risk prostate cancer, a 20-fraction schedule is non-inferior to 39 fractions (Category 1 standard).',
  'Intermediate-favorable riskte ADT çoğunlukla is not recommended.': 'In favorable-intermediate risk, androgen deprivation therapy (ADT) is generally not recommended.',
  'Target: Prostat bezi ve seminal vezikül proksimal 1 cm': 'Target: Prostate gland and proximal 1 cm of seminal vesicles',
  'Prostate bezi ve seminal vezikul proksimal 1 om': 'Prostate gland and proximal 1 cm of seminal vesicles',
  'Çok Yüksek Riskli veya N1 Prostat Ca': 'Very High-Risk or N1 Prostate Cancer',
  'Çok Yüksek Risk': 'Very High Risk',
  'Çok yüksek risk': 'Very high risk',
  'Çok Yüksek': 'Very High',
  'Çok yüksek': 'Very high',
  'Yüksek-Orta Risk': 'High-Intermediate Risk',
  'Yüksek Orta Risk': 'High-Intermediate Risk',
  'Yüksek risk': 'High risk',
  'Düşük risk': 'Low risk',
  'Standart Risk': 'Standard Risk',
  'Küçük Hücreli Dışı Akciğer Ca (KHDAK)': 'Non-Small Cell Lung Cancer (NSCLC)',
  'Küçük Hücreli Akciğer Ca (KHAK / SCLC)': 'Small Cell Lung Cancer (SCLC)',
  'Küçük Hücreli Akciğer Ca (KHAK)': 'Small Cell Lung Cancer (SCLC)',
  'Timoma & Timik Karsinom': 'Thymoma / Thymic Carcinoma',
  'Malign Plevral Mezotelyoma (MPM)': 'Malignant Pleural Mesothelioma (MPM)',
  'Nazofarenks Karsinomu (NPC)': 'Nasopharyngeal Carcinoma (NPC)',
  'Orofarenks Karsinomu (p16/HPV)': 'Oropharyngeal Carcinoma (p16/HPV)',
  'Larinks Karsinomu (Glottik/Supraglottik)': 'Laryngeal Cancer (Glottic/Supraglottic)',
  'Hipofarenks Karsinomu': 'Hypopharyngeal Carcinoma',
  'Oral Kavite Karsinomu': 'Oral Cavity Carcinoma',
  'Tükürük Bezi Tümörleri': 'Salivary Gland Tumors',
  'Beyin Metastazları': 'Brain Metastases',
  'Beyin Metastazı': 'Brain Metastases',
  'Glioblastom': 'Glioblastoma (GBM)',
  'Menenjiyom': 'Meningioma',
  'Serviks Uteri Karsinomu (Cervix)': 'Cervical Cancer',
  'Endometriyum Karsinomu (Corpus Uteri)': 'Endometrial Cancer',
  'Over & Tuba Uterina Karsinomu': 'Ovarian / Fallopian Tube Cancer',
  'Vajen Karsinomu (Vagina)': 'Vaginal Cancer',
  'Vulva Karsinomu (Vulva)': 'Vulvar Cancer',
  'Yumuşak Doku Sarkomu (YDS / STS)': 'Soft Tissue Sarcoma (STS)',
  'Osteosarkom (Osteosarcoma)': 'Osteosarcoma',
  'Ewing Sarkomu (Ewing Sarcoma)': 'Ewing Sarcoma',
  'Kondrosarkom (Chondrosarcoma)': 'Chondrosarcoma',
  'Kordoma (Sakral / Klivus Chordoma)': 'Chordoma (Sacral / Clival)',
  'Dev Hücreli Kemik Tümörü (GCTB)': 'Giant Cell Tumor of Bone (GCTB)',
  'Melanom': 'Melanoma',
  'Bazal Hücreli Karsinom (BCC)': 'Basal Cell Carcinoma (BCC)',
  'Skuamöz Hücreli Karsinom (SCC)': 'Squamous Cell Carcinoma (SCC)',
  'Hodgkin Lenfoma': 'Hodgkin Lymphoma',
  'Non-Hodgkin Lenfoma': 'Non-Hodgkin Lymphoma',
  'Multipl Miyelom': 'Multiple Myeloma',
  'Kemik Metastazı': 'Bone Metastases',
  'Spinal Kord Basısı': 'Spinal Cord Compression',
  'Palyatif Beyin Metastazı': 'Palliative Brain Metastases',
  'Palyatif Radyoterapi': 'Palliative Radiotherapy',
  'Benign Hastalıklar': 'Benign Diseases',
  'Heterotopik Ossifikasyon': 'Heterotopic Ossification',
  'Heterotopik Ossifikasyon Profilaksisi': 'Heterotopic Ossification Prophylaxis',
  'Keloid Profilaksisi': 'Keloid Prophylaxis',
  'Dupuytren Kontraktürü': 'Dupuytren Contracture',
  'Ledderhose Hastalığı': 'Ledderhose Disease',
  'Jinekomasti Profilaksisi': 'Gynecomastia Prophylaxis',
  'Plantar Fasiit / Kalkaneus Dikeni': 'Plantar Fasciitis / Heel Spur',
  'Tenisçi / Golfçü Dirseği': 'Tennis / Golfer’s Elbow',
  'Omuz Periartriti / İmpingement': 'Shoulder Periarthritis / Impingement',
  'Gonartroz / Koksartroz': 'Gonarthrosis / Coxarthrosis',
  'Graves Orbitopati': 'Graves Orbitopathy',
  'Trigeminal Nevralji (SRS)': 'Trigeminal Neuralgia (SRS)',
  'Trigeminal Nevralji SRS': 'Trigeminal Neuralgia SRS',
  'Vestibüler Schwannom': 'Vestibular Schwannoma',
  'Arteriovenöz Malformasyon (AVM)': 'Arteriovenous Malformation (AVM)',
  'Prostat': 'Prostate',
  'Mesane': 'Bladder',
  'Testis': 'Testis',
  'Prostat Kanseri': 'Prostate Cancer',
  'Mesane Kanseri': 'Bladder Cancer',
  'Meme Kanseri': 'Breast Cancer',
  'Rektum Kanseri': 'Rectal Cancer',
  'Mide Kanseri': 'Gastric Cancer',
  'Pankreas Kanseri': 'Pancreatic Cancer',
  'Özofagus Kanseri': 'Esophageal Cancer',
  'Karaciğer': 'Liver',
  'Nazofarenks': 'Nasopharynx',
  'Orofarenks': 'Oropharynx',
  'Larenks': 'Larynx',
  'Hipofarenks': 'Hypopharynx',
  'Oral Kavite': 'Oral Cavity',
  'Serviks': 'Cervix',
  'Endometriyum': 'Endometrium',
  'Vajen': 'Vagina',
  'Vulva': 'Vulva',
  'Yumuşak Doku Sarkomu': 'Soft Tissue Sarcoma',
  'Osteosarkom': 'Osteosarcoma',
  'Ewing Sarkomu': 'Ewing Sarcoma',
  'Kondrosarkom': 'Chondrosarcoma',
  'Kordoma': 'Chordoma',
  'Periferik erken evre KHDAK (Kategori 1 küratif altın standart, BED10 = 151.2 Gy).': 'Peripheral early-stage NSCLC (Category 1 curative gold standard, BED10 = 151.2 Gy).',
  'Lokal ileri KHDAK; Eşzamanlı Kemo-Radyoterapi (Kategori 1).': 'Locally advanced NSCLC; concurrent chemoradiotherapy (Category 1).',
  'Hedef: 4D-CT tüm solunum hareket hacmi': 'Target: 4D-CT full respiratory motion ITV',
  'Nodal: Elektif nodal hedef yok': 'Nodal: No elective nodal irradiation',
  'Teknik & Hareket: SBRT (4D-CT / ITV VMAT)': 'Technique: SBRT (4D-CT / ITV VMAT)',
  'Teknik: SBRT (4D-CT / ITV VMAT)': 'Technique: SBRT (4D-CT / ITV VMAT)',
  '4D-CT tüm solunum hareket hacmi': '4D-CT full respiratory motion ITV',
  'Set-up ve internal marjin': 'Set-up and internal margin',
  'Primer tümör ve tutulu lenfatikler': 'Primary tumor and involved nodal stations',
  'Elektif nodal CTV': 'Elective nodal CTV',
  'Cerrahi yatak ve marjin': 'Surgical bed and microscopic margin',
  'Bilateral Akciğer': 'Bilateral Lung',
  'Spinal Kord': 'Spinal Cord',
  'Kalp': 'Heart',
  'Özofagus': 'Esophagus',
  'Brakiyal Pleksus': 'Brachial Plexus',
  'Trakea / Ana Bronş': 'Trachea / Main Bronchus',
  'Göz': 'Eye / Globe',
  'Optik Sinir': 'Optic Nerve',
  'Optik Kiazma': 'Optic Chiasm',
  'Beyin Sapı': 'Brainstem',
  'Koklea': 'Cochlea',
  'Parotis': 'Parotid Gland',
  'Submandibular': 'Submandibular Gland',
  'Mide': 'Stomach',
  'Duodenum': 'Duodenum',
  'İnce Bağırsak': 'Small Bowel',
  'Rektum': 'Rectum',
  'Femur Başı': 'Femoral Head',
  'Böbrek': 'Kidney',
  'Cilt': 'Skin',
  'Bölgesel lenf nodu metastazı yok': 'No regional lymph node metastasis',
  'İpsilateral peribronşiyal / hiler lenf nodu tutulumu': 'Ipsilateral peribronchial / hilar lymph node involvement',
  'İpsilateral mediastinal / subkarinal lenf nodu tutulumu': 'Ipsilateral mediastinal / subcarinal lymph node involvement',
  'Kontralateral mediastinal/hiler veya supraklavikular lenf nodu': 'Contralateral mediastinal, hilar, or supraclavicular lymph node involvement',
  'Uzak metastaz yok': 'No distant metastasis',
  'Uzak metastaz var': 'Distant metastasis present',
  'Tek organ / oligometastaz': 'Single organ / oligometastatic disease',
  'Multipl organ metastazı': 'Multiple organ / widespread metastases',
  'ENDİKE: KÜRATİF': 'INDICATED: CURATIVE',
  'ENDİKE: PALYATİF': 'INDICATED: PALLIATIVE',
  'KONTRENDİKE': 'CONTRAINDICATED',
  'PROTOKOLÜ': 'PROTOCOL',
  'Periferik SBRT': 'Peripheral SBRT',
  'Santral SBRT': 'Central SBRT',
  'Ultrasantral': 'Ultracentral',
  'SBRT Periferik Standart': 'Standard Peripheral SBRT',
  '≤1 cm primer kitle; ana bronş dallarına uzanım yok': '≤1 cm primary tumor; no main bronchus involvement',
  '>1 cm ama ≤2 cm çap; visseral plevra intakt': '>1 cm to ≤2 cm diameter; visceral pleura intact',
  '>2 cm ama ≤3 cm çap; periferik parankimde': '>2 cm to ≤3 cm diameter; in peripheral parenchyma',
  '>3 cm ama ≤4 cm veya ana bronş tutulumu (karina >2 cm)': '>3 cm to ≤4 cm or main bronchus involvement (>2 cm from carina)',
  '>4 cm ama ≤5 cm veya visseral plevra invazyonu': '>4 cm to ≤5 cm or visceral pleura invasion',
  '>5 cm ama ≤7 cm veya göğüs duvarı / frenik sinir tutulumu': '>5 cm to ≤7 cm or chest wall / phrenic nerve involvement',
  '>7 cm veya mediasten, kalp, büyük damarlar, trakea,...': '>7 cm or invasion of the mediastinum, heart, great vessels, or trachea',
  'HEDEF HACİMLER (TARGET VOLUMES)': 'TARGET VOLUMES (ICRU 83)',
  'KRİTİK ORGAN (OAR) KISITLARI': 'ORGANS AT RISK (OAR) CONSTRAINTS',
  'Küçük Hücreli Dışı Akciğer Ca': 'Non-Small Cell Lung Cancer',
  'Küçük Hücreli Akciğer Ca': 'Small Cell Lung Cancer',
  'Medikal İnoperabl / Cerrahi Red': 'Medically Inoperable / Declines Surgery',
  'Medikal Operabl': 'Medically Operable',
  'Postoperatif': 'Postoperative',
  'Preoperatif': 'Preoperative',
  'Uygulanmaz': 'Not applicable',
  'Kılavuz Tanımlı': 'Guideline-defined',
  'Kılavuz': 'Guideline',
  'Kriterleri': 'Criteria',
  'Kriteri': 'Criteria',
  'Primer Tümör': 'Primary Tumor',
  'Bölgesel Lenf Nodları': 'Regional Lymph Nodes',
  'Uzak Metastaz': 'Distant Metastasis',
  'Anatomik Kapsam': 'Anatomic Coverage',
  'Doz Limiti': 'Dose Limit',
  'Marjin': 'Margin',
  'Hacim': 'Volume',
  'Doz': 'Dose',
  'Organ': 'Organ',
  'Metrik': 'Metric',
  'Benign hastalıkta TNM evrelemesi uygulanmaz; klinik durum ve tedavi zamanlamasını seçin.': 'TNM staging does not apply to benign disease; select clinical status and treatment timing.',
  'Seçili alt başlığa özgü kriterler; tıklayarak anında güncelleyin.': 'Subsite-specific criteria; click to update instantly.',
  'Klinik Durum, Evre ve Zamanlama Kriteri': 'Clinical Status and Timing Criteria',
  'TNM uygulanmaz': 'TNM not applicable',
  'Zamanlama kritik:': 'Timing is critical:',
  'HO profilaksisi preoperatif ilk 4 saatte veya postoperatif ilk 24-48 saatte planlanır; >72 saat sonra etkinlik beklenmez.': 'HO prophylaxis is planned within 4 hours preoperatively or 24-48 hours postoperatively; benefit is not expected after 72 hours.',
  'Keloid eksizyonu sonrası RT ilk 24 saat içinde başlatılmalıdır.': 'Radiotherapy should begin within 24 hours after keloid excision.',
  'Jinekolojik Kanser Bölgesi': 'Gynecologic Cancer Site',
  'Sarkom / Kemik Tümör Tipi': 'Sarcoma / Bone Tumor Type',
  'Baş-Boyun Anatomik Bölgesi': 'Head and Neck Subsite',
  'MSS Patolojisi': 'CNS Pathology',
  'Gastrointestinal tümör alt tipi': 'Gastrointestinal Tumor Subsite',
  'GİS Tümör Alt Tipi': 'GI Tumor Subsite',
  'GÜS Alt Tipi': 'GU Subsite',
  'Meme Histopatolojisi': 'Breast Histopathology',
  'Cilt Patolojisi': 'Skin Histology',
  'Hematolojik Tümör': 'Hematologic Tumor',
  'Pediatrik Tümör': 'Pediatric Tumor',
  'Palyatif Onkoloji': 'Palliative Oncology',
  'Ağrılı Kemik / Beyin / Spinal Kord Basısı': 'Painful Bone / Brain / Spinal Cord Compression',
  'Düşük Risk': 'Low Risk',
  'Orta Risk': 'Intermediate Risk',
  'Yüksek Risk': 'High Risk',
  'Radyoterapi Amacı': 'Radiotherapy Intent',
  'Klinik Evre / Cerrahi': 'Clinical Stage / Surgery',
  'Radyoterapi Zamanlaması': 'Radiotherapy Timing',
  'Klinik Durum': 'Clinical Status',
  'Lokal Kontrol Modalitesi': 'Local Control Modality',
  'Seminom evresi': 'Seminoma Stage',
  'Menopoz durumu': 'Menopausal Status',
  'Cerrahi Sınır': 'Surgical Margin',
  'Cerrahi': 'Surgery',
  'Maksimal TURBT tamamlandı': 'Maximal TURBT completed',
  'Mesane koruyucu TMT için klinik uygunluk': 'Clinical eligibility for bladder-preserving TMT',
  'Yüksek dereceli stromal aşırı büyüme': 'High-grade stromal overgrowth',
  'Tümör yatağı boostu (10-16 Gy) uygula': 'Apply tumor bed boost (10-16 Gy)',
  'Ağrı': 'Pain',
  'Negatif': 'Negative',
  'Pozitif': 'Positive',
  'Rezeke edilemeyen': 'Unresectable',
  'fraksiyon': 'fraction',
  'fraksiyonda': 'fractions',
  'Evre': 'Stage',
  'yanıt': 'response',
  'Rezidü': 'Residual disease',
  'rezeksiyon': 'resection',
  'Cerrahi Sonrası': 'Postoperative',
  'KRT': 'chemoradiotherapy',
  'RT': 'radiotherapy',
  'İzlem': 'surveillance',
  'Gerekmez': 'Not required',
  'Gerekli': 'Required',
  'Uygula': 'Apply',
  'Uygun': 'Eligible',
  'İnoperabl': 'Inoperable',
  'Lokal İleri': 'Locally Advanced',
  'Definitif': 'Definitive',
  'Adjuvan': 'Adjuvant',
  'Palyatif': 'Palliative',
  'Oligometastatik': 'Oligometastatic',
  'Nüks': 'Recurrence',
  'Kitle': 'Mass',
  'Agri': 'Pain',
  'Kanama': 'Bleeding',
  'Düşük': 'Low',
  'Orta': 'Intermediate',
  'Yüksek': 'High',
  'Santral': 'Central',
  'Periferik': 'Peripheral',
  'Lateralize': 'Lateralized',
  'Bilaterally': 'Bilateral',
  'Bilateral': 'Bilateral',
  'İpsilateral': 'Ipsilateral',
  'Kontralateral': 'Contralateral',
  'Lenf nodu': 'lymph node',
  'lenf nodu': 'lymph node',
  'lenf nodları': 'lymph nodes',
  'tutulumu': 'involvement',
  'invazyonu': 'invasion',
  'metastazı': 'metastasis',
  'yok': 'absent',
  'var': 'present',
  'çap': 'diameter',
  'ama': 'to',
  'veya': 'or',
  'sınır': 'margin',
  'kapsanır': 'included',
  'eklenir': 'is added',
  'önerilir': 'is recommended',
  'önerilmez': 'is not recommended',
  'değerlendirilir': 'is considered',
  'değerlendirme': 'assessment',
  'doz': 'dose',
  'hedef': 'target',
  'saat': 'hours',
  'hafta': 'weeks',
  'gün': 'days',
  'Primer': 'Primary',
  'Tümör': 'Tumor',
  'Tümör yatağı': 'Tumor bed',
  'Yumuşak Doku': 'Soft Tissue',
  'Beyin': 'Brain',
  'Akciğer': 'Lung',
  'Meme': 'Breast',
  'Boyun': 'Neck',
  'Kasık': 'Groin',
  'Pelvik': 'Pelvic',
  'Pelvis': 'Pelvis',
  'Bölgesel': 'Regional',
  'Uzak': 'Distant',
  'hastalık': 'disease',
  'Hastalık': 'Disease',
  'Klinik': 'Clinical',
  'klinik': 'clinical',
  'küratif': 'curative',
  'Küratif': 'Curative',
  'standart': 'standard',
  'Standart': 'Standard',
  'yüksek risk': 'high risk',
  'düşük risk': 'low risk',
  'negatif': 'negative',
  'pozitif': 'positive',
  'Kurumsal Hekim Erişimi / Institutional Access': 'Institutional Physician Access',
  'RadOnc CDSS is restricted to licensed physicians and institutional medical personnel. Yalnızca kurumsal hekim e-postaları geçerlidir.': 'RadOnc CDSS is restricted to licensed physicians and institutional medical personnel. Only institutional physician email addresses are accepted.',
  'Farklı Hesapla Giriş / Sign In with Another Account': 'Sign In with Another Account',
  'Kılavuz Tanımlı Elektif Boyun Drenaj Rehberi (ESTRO / ASTRO Konsensüsü)': 'Guideline-Defined Elective Neck Irradiation (ESTRO / ASTRO Consensus)',
  'Bilateral Level II-Vb ve retrofaringeal lenf nodları (RPN) kapsanır.': 'Bilateral levels II-Vb and retropharyngeal lymph nodes (RPNs) are included.',
  'Bilateral Level II-IV; orta hat komşuluğu ve bilateral drenaj riski dikkate alınır.': 'Bilateral levels II-IV; consider midline proximity and the risk of bilateral drainage.',
  'Elektif boyun ışınlaması yapılmaz; yalnızca gerçek vokal kordlar hedeflenir.': 'Elective neck irradiation is not given; only the true vocal cords are targeted.',
  'İpsilateral Level I-III; DOI >5 mm ise Level IV eklenir.': 'Ipsilateral levels I-III; include level IV if DOI is >5 mm.',
  'Bilateral Level I-IV kapsanır.': 'Bilateral levels I-IV are included.',
  'Level V eklenmesi ve tutulu nod yatağına 66-70 Gy SIB boost değerlendirilir.': 'Consider adding level V and a 66-70 Gy SIB boost to the involved nodal bed.',
  'Prostat adenokarsinomu': 'Prostate adenocarcinoma',
  'Mesane koruyucu trimodal tedavi (TMT)': 'Bladder-preserving trimodality therapy (TMT)',
  'Testis seminom evrelemesi': 'Testicular seminoma staging',
  'KHAK Klinik Evresi': 'SCLC Clinical Stage',
  'Fraksiyonasyon Rejimi': 'Fractionation Regimen',
  'Klinik Senaryo': 'Clinical Scenario',
  'Endometriyum Risk Grubu (PORTEC)': 'Endometrial Risk Group (PORTEC)',
  'Cerrahi durumu': 'Surgical Status',
  'Larinks klinik senaryosu': 'Laryngeal Clinical Scenario',
  'Orta hattı geçiyor': 'Crosses the midline',
  'Orta hatta uzaklık (cm)': 'Distance from midline (cm)',
  'Tümör çapı (cm)': 'Tumor diameter (cm)',
  'Derin invazyon (DOI, mm)': 'Depth of invasion (DOI, mm)',
  'Ekstranodal yayılım (ENE)': 'Extranodal extension (ENE)',
  'Pozitif cerrahi sınır (R1)': 'Positive surgical margin (R1)',
  'Gleason Skoru': 'Gleason Score',
  'Pozitif biyopsi kor oranı (%)': 'Percentage of Positive Biopsy Cores (%)',
  'Ekstrakapsüler yayılım (ECE)': 'Extracapsular extension (ECE)',
  'Seminal vezikül invazyonu': 'Seminal vesicle invasion',
  'Otomatik NCCN risk grubu: ': 'Automated NCCN risk group: ',
  'En yakın cerrahi marjin (cm)': 'Closest surgical margin (cm)',
  'Histolojik Grade': 'Histologic Grade',
  'Biyobelirteçler sistemik tedavi kararında onkoloji ekibiyle birlikte yorumlanır.': 'Interpret biomarkers in conjunction with the oncology team when making systemic therapy decisions.',
  'Orta Hat Şifti (Herniasyon)': 'Midline Shift (Herniation)',
  'Semptom durumu': 'Symptom Status',
  'Metastaz Sayısı': 'Number of Metastases',
  'Maks Çap (cm)': 'Maximum Diameter (cm)',
  'Cerrahi / rezeksiyon': 'Surgery / Resection',
  'Performans / tedavi uygunluğu': 'Performance Status / Treatment Eligibility',
  'WHO derece': 'WHO Grade',
  'Rezeksiyon derecesi / cerrahi sınır': 'Extent of Resection / Surgical Margin',
  'Simpson derecesi': 'Simpson Grade',
  'Maksimum çap (cm)': 'Maximum Diameter (cm)',
  'Cerrahi marjin / rezektabilite': 'Surgical Margin / Resectability',
  'İnvazyon derinliği (mm)': 'Depth of Invasion (mm)',
  'Perinöral invazyon': 'Perineural Invasion',
  'Kemik tutulumu': 'Bone Involvement',
  'Palyatif fraksiyonasyon': 'Palliative Fractionation',
  'Sistemik tedaviye yanıt': 'Response to Systemic Therapy',
  'Medulloblastom risk grubu': 'Medulloblastoma Risk Group',
  'Wilms evre / histoloji': 'Wilms Tumor Stage / Histology',
  'Yaygın peritoneal yayılım / tüm batın RT endikasyonu': 'Diffuse Peritoneal Spread / Indication for Whole-Abdominal Radiotherapy',
  'Radyobiyolojik Eşdeğerlik': 'Radiobiological Equivalence',
  'Eşlik Eden Sistemik Tedavi:': 'Concomitant Systemic Therapy:',
  'Kanıt ve Kılavuz': 'Evidence and Guidelines',
  'Kılavuz & Kaynakça': 'Guidelines & References',
  'Yasal Sorumluluk Reddi': 'Disclaimer',
  'Radyasyon Onkolojisi CDSS - Kaynakça ve Yasal Bilgiler': 'Radiation Oncology CDSS - References and Legal Information',
  'Landmark çalışmalar ve klinik başlıklar': 'Landmark Trials and Clinical Topics',
  'PACIFIC (evre III KHDAK), Turrisi ve CONVERT (KHAK), Lung-ART (postoperatif toraks RT).': 'PACIFIC (stage III NSCLC), Turrisi and CONVERT (SCLC), and Lung-ART (postoperative thoracic radiotherapy).',
  'FAST-Forward (hipofraksiyone adjuvan RT).': 'FAST-Forward (hypofractionated adjuvant radiotherapy).',
  'RAPIDO ve PRODIGE-23 (rektum TNT), PORTEC-3 (endometriyum adjuvan kemoradyoterapi).': 'RAPIDO and PRODIGE-23 (rectal total neoadjuvant therapy), PORTEC-3 (adjuvant chemoradiotherapy for endometrial cancer).',
  'EMBRACE II (serviks KRT ve görüntü kılavuzlu brakiterapi).': 'EMBRACE II (cervical chemoradiotherapy and image-guided brachytherapy).',
  'Stupp protokolü (glioblastom kemoradyoterapisi).': 'Stupp protocol (glioblastoma chemoradiotherapy).',
  'Normal doku doz sınırları, kullanılan fraksiyonasyon, hedef hacim, eşzamanlı tedavi ve hastaya özgü klinik koşullarla birlikte değerlendirilmelidir.': 'Normal tissue dose constraints should be evaluated in the context of fractionation, target volume, concurrent treatment, and patient-specific clinical factors.',
  'Konvansiyonel fraksiyonasyonda normal doku doz-hacim etkilerini özetleyen, organ ve sonlanıma özgü derlemeler.': 'Organ- and endpoint-specific reviews summarizing normal-tissue dose-volume effects with conventional fractionation.',
  'Stereotaktik radyocerrahi ve vücut RT’si için doz-hacim ve toksisite kanıtlarını derleyen raporlar.': 'Reports synthesizing dose-volume and toxicity evidence for stereotactic radiosurgery and body radiotherapy.',
  'SABR hasta seçimi, planlama ve organ riskindeki doz kısıtları için teknik rehberler.': 'Technical guidance on SABR patient selection, planning, and organ-at-risk dose constraints.',
  'Serviks kanserinde görüntü kılavuzlu adaptif brakiterapi hedef ve organ riskindeki doz hedefleri/kısıtları.': 'Dose objectives and constraints for image-guided adaptive brachytherapy targets and organs at risk in cervical cancer.',
  'Bu merkez tek başına hasta planlaması için doz reçetesi değildir. OAR kısıtları, geçerli protokolün güncel birincil kaynağından ve kurum onaylı planlama yönergelerinden kontrol edilmelidir.': 'This reference is not a standalone dose prescription for patient planning. Verify OAR constraints against the current primary source for the applicable protocol and institution-approved planning guidance.',
  'Yasal sorumluluk reddi ve telif': 'Disclaimer and Copyright',
  'RadOnc CDSS, kanıta dayalı radyasyon onkolojisi literatürünü derleyen bir eğitim ve klinik karar destek aracıdır. Hekimin bireysel tıbbi muhakemesinin ve multidisipliner tümör konseyi (MDT) kararlarının yerine geçemez. Planlama sınırları her hasta için doğrulanmalıdır. NCCN®, ASTRO®, ESTRO®, RTOG®, QUANTEC® ilgili kurumların tescilli markaları olup resmi sponsorluk bağı bulunmamaktadır.': 'RadOnc CDSS is an educational and clinical decision-support tool that synthesizes evidence-based radiation oncology literature. It does not replace a physician’s independent clinical judgment or multidisciplinary tumor board (MDT) decisions. Planning constraints must be verified for each patient. NCCN®, ASTRO®, ESTRO®, RTOG®, and QUANTEC® are registered trademarks of their respective organizations; no official sponsorship is implied.',
  'Toraks': 'Thorax',
  'GİS': 'GI',
  'Jinekoloji': 'Gynecology',
  'MSS': 'CNS',
  'Kılavuz İlkeleri': 'Guideline Principles',
  'Kaynakça': 'References',
  'Kurumsal Hekim Portalı': 'Institutional Physician Portal',
  'Giriş yap': 'Sign in',
  'Kayıt ol': 'Sign up',
  'Onkolojik': 'Oncology',
  'KHAK': 'SCLC',
  'KHDAK': 'NSCLC',
  'evre': 'stage',
  'tutulu': 'involved',
  'geç': 'late',
  'Erken': 'Early',
  'erken': 'early',
  'İleri': 'Advanced',
  'ileri': 'advanced',
  'uygun': 'eligible',
  'Uygunsuz': 'Ineligible',
  'dahil': 'including',
  'dışında': 'excluding',
  'sonrası': 'after',
  'öncesi': 'before',
  'için': 'for',
  'olgu': 'case',
  'olguda': 'in cases',
  'hastada': 'in patients',
  'uygulanır': 'is applied',
  'uygulanmaz': 'does not apply',
  'yapılır': 'is performed',
  'yapılmalıdır': 'should be performed',
  'yapılmaz': 'is not performed',
  'planlanır': 'is planned',
  'belirlenmeli': 'should be determined',
  'beklenmez': 'is not expected',
  'yararı': 'benefit',
  'sınırlı': 'limited',
  'dakika': 'minutes',
  'risk grubu': 'risk group',
  'Risk Grubu': 'Risk Group',
  'ENDİKE:': 'INDICATED:',
  'ENDİKE': 'INDICATED',
  'KONTRENDİKE:': 'CONTRAINDICATED:',
  'ÖNERİLMEZ:': 'NOT RECOMMENDED:',
  'RT DEĞERLENDİR': 'CONSIDER RADIOTHERAPY',
  'DEĞERLENDİR': 'CONSIDER',
  'DEĞERLENDİRİLİR': 'IS CONSIDERED',
  'YOK': 'ABSENT',
  'VAR': 'PRESENT',
  'VE': 'AND',
  'VEYA': 'OR',
  'İLE': 'WITH',
  'SONRASI': 'AFTER',
  'ÖNCESİ': 'BEFORE',
  'İÇİN': 'FOR',
  'CERRAHİ': 'SURGERY',
  'CERRAHİSİ': 'SURGERY',
  'POSTOPERATİF': 'POSTOPERATIVE',
  'PREOPERATİF': 'PREOPERATIVE',
  'ADJUVAN': 'ADJUVANT',
  'NEOADJUVAN': 'NEOADJUVANT',
  'EŞZAMANLI': 'CONCURRENT',
  'KEMORADYOTERAPİ': 'CHEMORADIOTHERAPY',
  'KEMOTERAPİ': 'CHEMOTHERAPY',
  'DEFİNİTİF': 'DEFINITIVE',
  'KÜRATİF': 'CURATIVE',
  'PALYATİF': 'PALLIATIVE',
  'LOKAL': 'LOCAL',
  'İLERİ': 'ADVANCED',
  'ERKEN': 'EARLY',
  'YÜKSEK': 'HIGH',
  'DÜŞÜK': 'LOW',
  'RİSK': 'RISK',
  'EVRE': 'STAGE',
  'KLINİK': 'CLINICAL',
  'KLİNİK': 'CLINICAL',
  'DURUM': 'STATUS',
  'UYGUN': 'ELIGIBLE',
  'UYGUNSUZ': 'INELIGIBLE',
  'YARARI': 'BENEFIT',
  'SINIRLI': 'LIMITED',
  'BEKLENMEZ': 'IS NOT EXPECTED',
  'GEREKMEZ': 'NOT REQUIRED',
  'GEREKLİ': 'REQUIRED',
  'İZLEM': 'SURVEILLANCE',
  'SRS': 'SRS',
  'FRAKSİYONASYON': 'FRACTIONATION',
  'DOZU': 'DOSE',
  'DOZ': 'DOSE',
  'MARJİN': 'MARGIN',
  'CERRAHİ SONRASI': 'AFTER SURGERY',
  'LOKAL İLERİ': 'LOCALLY ADVANCED',
  'LOKAL NÜKS': 'LOCAL RECURRENCE',
  'NÜKS': 'RECURRENCE',
  'REZEKE EDİLEMEYEN': 'UNRESECTABLE',
  'İNOPERABL': 'INOPERABLE',
  'AKTİF': 'ACTIVE',
  'İN-AKTİF': 'INACTIVE',
  'FİBROZİS': 'FIBROSIS',
  'SİSTEMİK': 'SYSTEMIC',
  'TEDAVİ': 'TREATMENT',
  'TEDAVİYE': 'TREATMENT',
  'PROFİLAKSİSİ': 'PROPHYLAXIS',
  'ORBİTOPATİSİNDE': 'ORBITOPATHY',
  'KONTRAKTÜR': 'CONTRACTURE',
  'PERSISTAN': 'PERSISTENT',
  'SEMPTOM': 'SYMPTOM',
  'SEMPTOMDA': 'FOR SYMPTOMS',
  'REFRAKTER': 'REFRACTORY',
  'DEJENERATİF': 'DEGENERATIVE',
  'ENFLAMATUAR': 'INFLAMMATORY',
  'DOZ RT': 'DOSE RADIOTHERAPY',
  'HİPOFRAKSİYONE': 'HYPOFRACTIONATED',
  'BRAKİTERAPİSİ': 'BRACHYTHERAPY',
  'KEMORADYOTERAPİSİ': 'CHEMORADIOTHERAPY',
  'GÖRÜNTÜ KILAVUZLU': 'IMAGE-GUIDED',
  'KONSEYDE': 'IN MULTIDISCIPLINARY REVIEW',
  'UZMAN KONSEYİNDE': 'IN A SPECIALIST MULTIDISCIPLINARY REVIEW',
  'SAATTE': 'WITHIN HOURS',
  'HAFTA SONRA': 'WEEKS LATER',
  'STANDARTI': 'STANDARD',
  'STANDART': 'STANDARD',
  'GÜNDE': 'PER DAY',
  'YATAĞI': 'BED',
  'LENF NODU': 'LYMPH NODE',
  'LENF NODLARI': 'LYMPH NODES',
  'METASTAZI': 'METASTASIS',
  'METASTAZ': 'METASTASIS',
  'KARACİĞER': 'LIVER',
  'AKCİĞER': 'LUNG',
  'BEYİN': 'BRAIN',
  'KEMİK': 'BONE',
  'MEME': 'BREAST',
  'SERVİKS': 'CERVIX',
  'ENDOMETRİYUM': 'ENDOMETRIUM',
  'VULVA': 'VULVA',
  'OVER': 'OVARY',
  'HASTALIKTA': 'IN DISEASE',
  'HASTALIĞI': 'DISEASE',
  'HASTALIK': 'DISEASE',
  'YAYILIM': 'SPREAD',
  'TUTULUMU': 'INVOLVEMENT',
  'İNVASİYONU': 'INVASION',
  'BASISI': 'COMPRESSION',
  'DİRENÇLİ': 'REFRACTORY',
  'MEDİKAL': 'MEDICAL',
  'TÜMÖRÜNDE': 'TUMOR',
  'TÜMÖRÜ': 'TUMOR',
  'TÜMÖR': 'TUMOR',
  'KİTLE': 'MASS',
  'YÜKSEK DOZ': 'HIGH-DOSE',
  'ULTRA YÜKSEK DOZ': 'ULTRA-HIGH-DOSE',
  'ESKALASYON': 'ESCALATION',
  'BOOST': 'BOOST',
  'FAYDA BEKLENMEZ': 'NO BENEFIT IS EXPECTED',
  'UYGUN ZAMAN PENCERESİNDE': 'WITHIN THE APPROPRIATE TREATMENT WINDOW',
  'ERKEN BAŞVURU': 'EARLY PRESENTATION',
  'GEÇ BAŞVURU': 'LATE PRESENTATION',
  'TÜM SOLUNUM HAREKET HACMİ': 'FULL RESPIRATORY MOTION VOLUME',
  'HETERO TOPİK OSSİFİKASYON': 'HETEROTOPIC OSSIFICATION',
  'HETEROTOPİK OSSİFİKASYON': 'HETEROTOPIC OSSIFICATION',
  'Menenjiyom (Grade 1 / 2 / 3)': 'Meningioma (Grade 1 / 2 / 3)',
  'Beyin Metastazı (SRS vs WBRT)': 'Brain Metastases (SRS vs WBRT)',
  'Dermatofibrosarkoma Protuberans (DFSP)': 'Dermatofibrosarcoma Protuberans (DFSP)',
  'Rektum Karsinomu (TNT RAPIDO)': 'Rectal Carcinoma (TNT RAPIDO)',
  'Mide / Gastrik Adenokarsinom': 'Gastric Adenocarcinoma',
  'Karaciğer (HCC / Kolanjio SBRT)': 'Liver (HCC / Cholangiocarcinoma SBRT)',
  'Özofagus Karsinomu (CROSS)': 'Esophageal Carcinoma (CROSS)',
  'Pankreas Adenokarsinomu': 'Pancreatic Adenocarcinoma',
  'Anal Kanal Skuamöz Karsinom (Nigro)': 'Anal Canal Squamous Cell Carcinoma (Nigro)',
  'Düşük Risk (Evre IA G1-2, LVSI yok - İzlem)': 'Low Risk (Stage IA G1-2, no LVSI - Surveillance)',
  'Orta Risk (Evre IB G1-2 veya IA G3)': 'Intermediate Risk (Stage IB G1-2 or IA G3)',
  'Yüksek-Orta Risk (PORTEC-2: Yalnızca VCB Brakiterapisi)': 'High-Intermediate Risk (PORTEC-2: Vaginal Cuff Brachytherapy Alone)',
  'Yüksek Risk (Evre III / Seröz / Derin İnvazyon - PORTEC-3 KRT)': 'High Risk (Stage III / Serous / Deep Invasion - PORTEC-3 Chemoradiotherapy)',
  'nsclc': 'Non-Small Cell Lung Cancer',
  'sclc': 'Small Cell Lung Cancer',
  'thymoma': 'Thymoma',
  'mesothelioma': 'Mesothelioma',
  'mets': 'Metastases',
  'gbm': 'Glioblastoma',
  'meningioma': 'Meningioma',
  'prostate': 'Prostate',
  'bladder': 'Bladder',
  'testis': 'Testis',
  'penis': 'Penis',
  'Yumusak_Doku': 'Soft Tissue Sarcoma',
  'Ewing': 'Ewing Sarcoma',
  'GCTB': 'Giant Cell Tumor of Bone',
  'DFSP': 'Dermatofibrosarcoma Protuberans',
  '>7 cm or mediasten, kalp, büyük damarlar, trakea, omur...': '>7 cm or mediastinum, heart, great vessels, trachea, and spine invasion',
  'Contralateral mediastinal/hiler or supraklavikular lymph...': 'Contralateral mediastinal, hilar, or supraclavicular lymph node involvement',
  'Karşı akciğer nodülü, plevral/perikardiyal efüzyon or...': 'Contralateral lung nodules, malignant pleural or pericardial effusion',
  'Karşı akciğer nodülü, plevral/perikardiyal efüzyon': 'Contralateral lung nodules, malignant pleural or pericardial effusion',
  'Tek bir ekstratorasik organda soliter metastaz...': 'Single extrathoracic metastasis in a single organ (Oligometastatic)',
  'Tek bir ekstratorasik organda soliter metastaz': 'Single extrathoracic metastasis in a single organ (Oligometastatic)',
  'Çoklu organlarda yaygın metastazlar (Polimetastatik)': 'Multiple extrathoracic metastases in multiple organs (Polymetastatic)',
  'Göğüs Duvarı': 'Chest Wall',
  'Kategori 1': 'Category 1',
  'Kategori 2A': 'Category 2A',
  'Klinik Reçete Raporunu Kopyala': 'Copy Clinical Prescription Report',
  'Rapor Kopyalandı!': 'Report Copied to Clipboard!',
  'Kopyalandı!': 'Copied!',
  '>7 cm veya mediasten, kalp, büyük damarlar, trakea, omurga invazyonu': '>7 cm or invasion of the mediastinum, heart, great vessels, trachea, or spine',
  'Karşı akciğer nodülü, plevral/perikardiyal efüzyon veya nodül': 'Contralateral lung nodules, malignant pleural or pericardial effusion',
  'Tek bir ekstratorasik organda soliter metastaz (Oligometastatik)': 'Single extrathoracic metastasis in a single organ (Oligometastatic)',
};

const TRANSLATION_ENTRIES = Object.entries(TRANSLATION_MAP).sort(
  ([left], [right]) => right.length - left.length,
);
const TRANSLATION_MATCHER = new RegExp(
  TRANSLATION_ENTRIES.map(([source]) => {
    const escaped = source.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    return /^[\p{L}\p{N}]+$/u.test(source)
      ? `(?<![\\p{L}\\p{N}])${escaped}(?![\\p{L}\\p{N}])`
      : escaped;
  }).join('|'),
  'gu',
);

const SUBSITES: Partial<Record<OrganId, { id: string; name: string }[]>> = {
  benign: [
    { id: 'benign-ho', name: 'Heterotopik Ossifikasyon' },
    { id: 'benign-keloid', name: 'Keloid Profilaksisi' },
    { id: 'benign-dupuytren', name: 'Dupuytren Kontraktürü' },
    { id: 'benign-ledderhose', name: 'Ledderhose Hastalığı' },
    { id: 'benign-jinekomasti', name: 'Jinekomasti Profilaksisi' },
    { id: 'benign-topuk-dikeni', name: 'Plantar Fasiit / Kalkaneus Dikeni' },
    { id: 'benign-epikondilit', name: 'Tenisçi / Golfçü Dirseği' },
    { id: 'benign-omuz', name: 'Omuz Periartriti / İmpingement' },
    { id: 'benign-artroz', name: 'Gonartroz / Koksartroz' },
    { id: 'benign-graves', name: 'Graves Orbitopati' },
    { id: 'benign-trigeminal', name: 'Trigeminal Nevralji (SRS)' },
    { id: 'benign-schwannom', name: 'Vestibüler Schwannom' },
    { id: 'benign-avm', name: 'Arteriovenöz Malformasyon (AVM)' },
  ],
};

const BENIGN_CLINICAL_OPTIONS: Record<string, { value: string; label: string }[]> = {
  'benign-ho': [
    { value: 'preop', label: 'Preoperatif ilk 4 saat' },
    { value: 'postop-24h', label: 'Cerrahi sonrası <24 saat' },
    { value: 'postop-48h', label: '24-48 saat arası' },
    { value: 'late', label: '>72 saat - geç başvuru' },
  ],
  'benign-keloid': [
    { value: 'postop-24h', label: 'Cerrahi sonrası <24 saat' },
    { value: 'postop-48h', label: '24-48 saat arası' },
    { value: 'late', label: '>72 saat - geç başvuru' },
  ],
  'benign-dupuytren': [
    { value: 'tubiana-n', label: 'Tubiana Evre N (Palmar nodül)' },
    { value: 'tubiana-ni', label: 'Evre N/I (Kordon)' },
    { value: 'advanced', label: 'İleri kontraktür (cerrahi öncelikli)' },
  ],
  'benign-ledderhose': [
    { value: 'tubiana-n', label: 'Erken nodül evresi' },
    { value: 'tubiana-ni', label: 'Nodül / kordon evresi' },
    { value: 'advanced', label: 'İleri kontraktür (cerrahi öncelikli)' },
  ],
  'benign-jinekomasti': [
    { value: 'prophylaxis', label: 'Antiandrojen tedavi öncesi profilaksi' },
    { value: 'symptomatic', label: 'Semptomatik / yerleşik jinekomasti' },
  ],
  'benign-topuk-dikeni': [
    { value: 'primary', label: 'Primer tedavi (0.5 Gy × 6)' },
    { value: 'repeat', label: 'Nüks / 2. seri (6-12 hafta sonra)' },
  ],
  'benign-epikondilit': [
    { value: 'primary', label: 'Primer tedavi (0.5 Gy × 6)' },
    { value: 'repeat', label: 'Nüks / 2. seri (6-12 hafta sonra)' },
  ],
  'benign-omuz': [
    { value: 'primary', label: 'Primer tedavi (0.5 Gy × 6)' },
    { value: 'repeat', label: 'Nüks / 2. seri (6-12 hafta sonra)' },
  ],
  'benign-artroz': [
    { value: 'primary', label: 'Primer tedavi (0.5 Gy × 6)' },
    { value: 'repeat', label: 'Nüks / 2. seri (6-12 hafta sonra)' },
  ],
  'benign-graves': [
    { value: 'active', label: 'Aktif orta-ağır orbitopati' },
    { value: 'fibrotic', label: 'İnaktif / fibrotik hastalık' },
  ],
  'benign-trigeminal': [
    { value: 'refractory', label: 'Medikal tedaviye dirençli trigeminal nevralji' },
  ],
  'benign-schwannom': [
    { value: 'small', label: 'Küçük / orta hacimli tümör - SRS' },
    { value: 'large', label: 'Büyük tümör / beyin sapı basısı - FSRT değerlendirme' },
  ],
  'benign-avm': [
    { value: 'low-grade', label: 'Spetzler-Martin I-II / küçük nidus' },
    { value: 'high-grade', label: 'Spetzler-Martin III-V / kompleks nidus' },
  ],
};

export interface TNMOption {
  code: string;
  label: string;
  criterion: string;
}

export interface TargetVolume {
  name: string;
  doseGy: number;
  marginMm: string;
  anatomical: string;
}

export interface OARConstraint {
  organ: string;
  metric: string;
  limit: string;
  source: string;
}

export interface DoseScheme {
  id: string;
  name: string;
  tag: string;
  totalDoseGy: number;
  fractionCount: number;
  fractionDoseGy: number;
  alphaBeta: number;
  technique: string;
  indication: string;
  targetVolumes: TargetVolume[];
  oars: OARConstraint[];
  systemicTherapy?: string;
  evidence: string;
}

export interface EvaluatedDecision {
  statusText: string;
  badgeClass: string;
  primaryScheme: DoseScheme;
  alternativeSchemes: DoseScheme[];
  targetVolumeBadge?: string;
  nodalStatusBadge?: string;
  techniqueBadge?: string;
}

function parseOption<T extends string>(value: string, options: readonly T[]): T | undefined {
  return options.find(option => option === value);
}

// ==========================================
// 2. TÜM ORGAN VE ALT BAŞLIKLAR İÇİN DİNAMİK TNM / EVRELEME MATRİSİ
// ==========================================

const TNM_DATABASE: Record<string, { T: TNMOption[]; N: TNMOption[]; M: TNMOption[] }> = {
  // --- TORAKS: KHDAK ---
  'thorax-nsclc': {
    T: [
      { code: 'T1a', label: 'T1a', criterion: '≤1 cm primer kitle; ana bronş dallarına uzanım yok' },
      { code: 'T1b', label: 'T1b', criterion: '>1 cm ama ≤2 cm çap; visseral plevra intakt' },
      { code: 'T1c', label: 'T1c', criterion: '>2 cm ama ≤3 cm çap; periferik parankimde' },
      { code: 'T2a', label: 'T2a', criterion: '>3 cm ama ≤4 cm veya ana bronş tutulumu (karina >2 cm)' },
      { code: 'T2b', label: 'T2b', criterion: '>4 cm ama ≤5 cm veya visseral plevra invazyonu' },
      { code: 'T3', label: 'T3', criterion: '>5 cm ama ≤7 cm veya göğüs duvarı / frenik sinir tutulumu' },
      { code: 'T4', label: 'T4', criterion: '>7 cm veya mediasten, kalp, büyük damarlar, trakea, omurga invazyonu' },
    ],
    N: [
      { code: 'N0', label: 'N0', criterion: 'Bölgesel lenf nodu metastazı yok' },
      { code: 'N1', label: 'N1', criterion: 'İpsilateral peribronşiyal / hiler lenf nodu tutulumu' },
      { code: 'N2', label: 'N2', criterion: 'İpsilateral mediastinal / subkarinal lenf nodu tutulumu' },
      { code: 'N3', label: 'N3', criterion: 'Kontralateral mediastinal/hiler veya supraklavikular lenf nodu' },
    ],
    M: [
      { code: 'M0', label: 'M0', criterion: 'Uzak metastaz yok' },
      { code: 'M1a', label: 'M1a', criterion: 'Karşı akciğer nodülü, plevral/perikardiyal efüzyon veya nodül' },
      { code: 'M1b', label: 'M1b', criterion: 'Tek bir ekstratorasik organda soliter metastaz (Oligometastatik)' },
      { code: 'M1c', label: 'M1c', criterion: 'Çoklu organlarda yaygın metastazlar (Polimetastatik)' },
    ],
  },
  // --- TORAKS: KHAK (Küçük Hücreli Akciğer Kanseri) ---
  'thorax-sclc': {
    T: [
      { code: 'T1-T2', label: 'T1-T2', criterion: 'Lokalize primer kitle (≤5 cm, plevral yayılım yok)' },
      { code: 'T3-T4', label: 'T3-T4', criterion: 'Geniş mediastinal, trakeal, karinal veya toraks duvarı invazyonu' },
    ],
    N: [
      { code: 'N0-N1', label: 'N0-N1', criterion: 'Nodal tutulum yok veya hiler tutulum ile sınırlı' },
      { code: 'N2-N3', label: 'N2-N3', criterion: 'Mediastinal, subkarinal veya supraklavikular lenf nodu pozitifliği' },
    ],
    M: [
      { code: 'M0', label: 'Sınırlı Evre (LS-SCLC)', criterion: 'Tek bir tolere edilebilir radyasyon alanı içine dahil edilebilen hastalık (M0)' },
      { code: 'M1', label: 'Yaygın Evre (ES-SCLC)', criterion: 'Karşı akciğer, plevral efüzyon veya uzak organ metastazı (M1)' },
    ],
  },
  // --- TORAKS: Timoma & Timik Karsinom ---
  'thorax-thymoma': {
    T: [
      { code: 'Masaoka-I', label: 'Evre I', criterion: 'Kapsül intakt; makroskopik ve mikroskopik invazyon yok' },
      { code: 'Masaoka-II', label: 'Evre II', criterion: 'Mikroskopik transkapsüler veya çevre mediastinal yağ invazyonu' },
      { code: 'Masaoka-III', label: 'Evre III', criterion: 'Komşu organ invazyonu (perikard, büyük damar, akciğer)' },
      { code: 'Masaoka-IV', label: 'Evre IV', criterion: 'Plevral/perikardiyal tohumlanma (IVA) veya uzak metastaz (IVB)' },
    ],
    N: [
      { code: 'N0', label: 'N0', criterion: 'Lenf nodu tutulumu yok' },
      { code: 'N1', label: 'N1', criterion: 'Anterior mediastinal lenf nodu tutulumu' },
      { code: 'N2', label: 'N2', criterion: 'Derin intratorasik veya supraklavikular lenf nodu' },
    ],
    M: [
      { code: 'M0', label: 'M0', criterion: 'Uzak metastaz yok' },
      { code: 'M1', label: 'M1', criterion: 'Uzak organ metastazı' },
    ],
  },
  // --- TORAKS: Mezotelyoma ---
  'thorax-mesothelioma': {
    T: [
      { code: 'T1', label: 'T1', criterion: 'İpsilateral pariyetal plevra ile sınırlı' },
      { code: 'T2', label: 'T2', criterion: 'Visseral plevra, diyafram kası veya akciğer parankimi tutulumu' },
      { code: 'T3', label: 'T3', criterion: 'Endotorasik fasya veya mediastinal yağ dokusu invazyonu' },
      { code: 'T4', label: 'T4', criterion: 'Göğüs duvarı, perikard, karşı plevra veya omurga invazyonu' },
    ],
    N: [
      { code: 'N0', label: 'N0', criterion: 'Bölgesel lenf nodu tutulumu yok' },
      { code: 'N1', label: 'N1', criterion: 'İpsilateral bronkopulmoner, hiler veya mediastinal lenf nodu' },
      { code: 'N2', label: 'N2', criterion: 'Kontralateral mediastinal veya supraklavikular lenf nodu' },
    ],
    M: [
      { code: 'M0', label: 'M0', criterion: 'Uzak metastaz yok' },
      { code: 'M1', label: 'M1', criterion: 'Uzak metastaz mevcut' },
    ],
  },
  // --- JİNEKOLOJİ: Serviks Uteri ---
  'gynecology-Serviks': {
    T: [
      { code: 'IB1-IB2', label: 'FIGO IB1-IB2', criterion: 'Servikse sınırlı, invazyon derinliği ≥5 mm, kitle çapı <4 cm' },
      { code: 'IB3', label: 'FIGO IB3', criterion: 'Servikse sınırlı kitle, en büyük çap ≥4 cm (Lokal ileri)' },
      { code: 'IIA-IIB', label: 'FIGO IIA-IIB', criterion: 'Üst 2/3 vajen tutulumu (IIA) veya parametriyal invazyon (IIB)' },
      { code: 'IIIA-IIIB', label: 'FIGO IIIA-IIIB', criterion: 'Alt 1/3 vajen tutulumu (IIIA) veya pelvik yan duvar / hidronefroz (IIIB)' },
      { code: 'IVA', label: 'FIGO IVA', criterion: 'Mesane veya rektum mukozası doğrudan invazyonu' },
    ],
    N: [
      { code: 'N0', label: 'N0', criterion: 'Bölgesel lenf nodu metastazı yok' },
      { code: 'N1', label: 'N1 (FIGO IIIC1)', criterion: 'Pelvik lenf nodu metastazı pozitif' },
      { code: 'N2', label: 'N2 (FIGO IIIC2)', criterion: 'Paraaortik lenf nodu metastazı pozitif' },
    ],
    M: [
      { code: 'M0', label: 'M0', criterion: 'Uzak metastaz yok' },
      { code: 'M1', label: 'M1 (FIGO IVB)', criterion: 'Uzak organ metastazı (akciğer, karaciğer, kemik vb.)' },
    ],
  },
  // --- JİNEKOLOJİ: Endometriyum ---
  'gynecology-Endometriyum': {
    T: [
      { code: 'IA', label: 'FIGO IA', criterion: 'Uterus korpusuna sınırlı, myometrium invazyonu <%50' },
      { code: 'IB', label: 'FIGO IB', criterion: 'Myometrium invazyonu ≥%50 (Derin myometriyal invazyon)' },
      { code: 'II', label: 'FIGO II', criterion: 'Servikal stromal invazyon mevcut (ancak korpus dışına çıkmamış)' },
      { code: 'IIIA-IIIB', label: 'FIGO IIIA-IIIB', criterion: 'Uterus seroza/adneks tutulumu (IIIA) veya vajen/parametrium invazyonu (IIIB)' },
      { code: 'IVA', label: 'FIGO IVA', criterion: 'Mesane veya barsak mukozası invazyonu' },
    ],
    N: [
      { code: 'N0', label: 'N0', criterion: 'Bölgesel lenf nodu metastazı yok' },
      { code: 'N1', label: 'N1 (FIGO IIIC1)', criterion: 'Pelvik lenf nodu pozitifliği' },
      { code: 'N2', label: 'N2 (FIGO IIIC2)', criterion: 'Paraaortik lenf nodu pozitifliği' },
    ],
    M: [
      { code: 'M0', label: 'M0', criterion: 'Uzak metastaz yok' },
      { code: 'M1', label: 'M1 (FIGO IVB)', criterion: 'Uzak organ veya intraabdominal peritoneal yayılım' },
    ],
  },
  // --- JİNEKOLOJİ: Over & Tuba Uterina ---
  'gynecology-Over_Tuba': {
    T: [
      { code: 'FIGO-I', label: 'FIGO I', criterion: 'Over veya tuba uterina ile sınırlı tümör' },
      { code: 'FIGO-II', label: 'FIGO II', criterion: 'Pelvik organlara (uterus, mesane, sigmoid) yayılım' },
      { code: 'FIGO-III', label: 'FIGO III', criterion: 'Pelvis dışı mikroskopik/makroskopik peritoneal yayılım' },
    ],
    N: [
      { code: 'N0', label: 'N0', criterion: 'Lenf nodu tutulumu yok' },
      { code: 'N1', label: 'N1 (FIGO IIIA1)', criterion: 'Retroperitoneal (pelvik/paraaortik) lenf nodu metastazı' },
    ],
    M: [
      { code: 'M0', label: 'M0', criterion: 'Uzak organ metastazı yok' },
      { code: 'M1', label: 'M1 (FIGO IV)', criterion: 'Plevral efüzyon sitolojisi pozitif (IVA) veya karaciğer/dalak parankim metastazı (IVB)' },
    ],
  },
  // --- JİNEKOLOJİ: Vajen Karsinomu ---
  'gynecology-Vajen': {
    T: [
      { code: 'FIGO-I', label: 'FIGO I', criterion: 'Vajen duvarı ile sınırlı karsinom' },
      { code: 'FIGO-II', label: 'FIGO II', criterion: 'Subvajinal doku / paraservikal alana invazyon (pelvis duvarına ulaşmamış)' },
      { code: 'FIGO-III', label: 'FIGO III', criterion: 'Pelvis yan duvarına uzanım' },
      { code: 'FIGO-IVA', label: 'FIGO IVA', criterion: 'Mesane veya rektum mukozası invazyonu veya gerçek pelvis dışına çıkış' },
    ],
    N: [
      { code: 'N0', label: 'N0', criterion: 'Bölgesel lenf nodu tutulumu yok' },
      { code: 'N1', label: 'N1', criterion: 'Pelvik veya inguinal lenf nodu metastazı' },
    ],
    M: [
      { code: 'M0', label: 'M0', criterion: 'Uzak metastaz yok' },
      { code: 'M1', label: 'M1', criterion: 'Uzak organ metastazı' },
    ],
  },
  // --- JİNEKOLOJİ: Vulva Karsinomu ---
  'gynecology-Vulva': {
    T: [
      { code: 'FIGO-I', label: 'FIGO I', criterion: 'Vulva veya perinede sınırlı, ≤2 cm lezyon' },
      { code: 'FIGO-II', label: 'FIGO II', criterion: '>2 cm kitle veya alt üretra/alt vajen/anüs komşuluğu' },
      { code: 'FIGO-III', label: 'FIGO III', criterion: 'Üst üretra, mesane, rektum mukozası veya pelvik kemik fiksasyonu' },
    ],
    N: [
      { code: 'N0', label: 'N0', criterion: 'İnguinofemoral lenf nodu negatif' },
      { code: 'N1', label: 'N1', criterion: '1-2 lenf nodu metastazı (<5 mm)' },
      { code: 'N2', label: 'N2', criterion: '≥3 lenf nodu metastazı veya kapsül dışı yayılım (ENE/ECE)' },
    ],
    M: [
      { code: 'M0', label: 'M0', criterion: 'Uzak metastaz yok' },
      { code: 'M1', label: 'M1', criterion: 'Pelvik lenf nodları veya uzak organ metastazları' },
    ],
  },
  // --- KEMİK & SARKOM: Yumuşak Doku Sarkomu ---
  'bone-sarcoma-Yumusak_Doku': {
    T: [
      { code: 'T1', label: 'T1', criterion: '≤5 cm en büyük çapta yüzeyel veya derin yerleşimli sarkom' },
      { code: 'T2', label: 'T2', criterion: '>5 cm ama ≤10 cm çap; fasyayı aşmamış veya derin' },
      { code: 'T3', label: 'T3', criterion: '>10 cm ama ≤15 cm çap' },
      { code: 'T4', label: 'T4', criterion: '>15 cm büyük dev sarkomatöz kitle' },
    ],
    N: [
      { code: 'N0', label: 'N0', criterion: 'Bölgesel lenf nodu tutulumu yok (çoğu YDS)' },
      { code: 'N1', label: 'N1', criterion: 'Bölgesel lenf nodu metastazı (Evre IV kabul edilir)' },
    ],
    M: [
      { code: 'M0', label: 'M0', criterion: 'Uzak metastaz yok' },
      { code: 'M1', label: 'M1', criterion: 'Akciğer veya diğer uzak organ metastazları' },
    ],
  },
  // --- KEMİK & SARKOM: Osteosarkom ---
  'bone-sarcoma-Osteosarkom': {
    T: [
      { code: 'T1', label: 'T1', criterion: '≤8 cm primer kemik içinde sınırlı kitle' },
      { code: 'T2', label: 'T2', criterion: '>8 cm korteksi aşan primer kemik kitlesi' },
      { code: 'T3', label: 'T3', criterion: 'Aynı kemik segmentinde diskontinü skip lezyonlar' },
    ],
    N: [
      { code: 'N0', label: 'N0', criterion: 'Bölgesel lenf nodu tutulumu yok' },
      { code: 'N1', label: 'N1', criterion: 'Bölgesel lenf nodu tutulumu' },
    ],
    M: [
      { code: 'M0', label: 'M0', criterion: 'Uzak metastaz yok' },
      { code: 'M1a', label: 'M1a', criterion: 'Yalnızca akciğer metastazı' },
      { code: 'M1b', label: 'M1b', criterion: 'Diğer kemik veya visseral organ metastazları' },
    ],
  },
  // --- KEMİK & SARKOM: Ewing Sarkomu ---
  'bone-sarcoma-Ewing': {
    T: [
      { code: 'T1', label: 'T1', criterion: '≤8 cm veya lokalize primer kemik tutulumu' },
      { code: 'T2', label: 'T2', criterion: '>8 cm veya geniş ekstraosseöz yumuşak doku kompanenti' },
    ],
    N: [
      { code: 'N0', label: 'N0', criterion: 'Bölgesel lenf nodu metastazı yok' },
      { code: 'N1', label: 'N1', criterion: 'Bölgesel lenf nodu pozitif' },
    ],
    M: [
      { code: 'M0', label: 'M0', criterion: 'Lokalize hastalık (metastaz yok)' },
      { code: 'M1a', label: 'M1a', criterion: 'Yalnızca akciğer metastazı' },
      { code: 'M1b', label: 'M1b', criterion: 'Kemik iliği, diğer kemikler veya uzak organ metastazı' },
    ],
  },
  // --- KEMİK & SARKOM: Kondrosarkom ---
  'bone-sarcoma-Kondrosarkom': {
    T: [
      { code: 'T1', label: 'T1', criterion: '≤8 cm kortikal veya intramedüller lezyon' },
      { code: 'T2', label: 'T2', criterion: '>8 cm geniş periostal / ekstraosseöz kitle' },
    ],
    N: [
      { code: 'N0', label: 'N0', criterion: 'Lenf nodu tutulumu yok' },
      { code: 'N1', label: 'N1', criterion: 'Bölgesel lenf nodu pozitif' },
    ],
    M: [
      { code: 'M0', label: 'M0', criterion: 'Uzak metastaz yok' },
      { code: 'M1', label: 'M1', criterion: 'Akciğer veya uzak metastaz' },
    ],
  },
  // --- KEMİK & SARKOM: Kordoma ---
  'bone-sarcoma-Kordoma': {
    T: [
      { code: 'T1', label: 'T1', criterion: '≤5 cm sakrum, vertebra veya klivus yerleşimli' },
      { code: 'T2', label: 'T2', criterion: '>5 cm komşu nöral / vasküler veya dural invazyon' },
    ],
    N: [
      { code: 'N0', label: 'N0', criterion: 'Lenf nodu tutulumu yok' },
      { code: 'N1', label: 'N1', criterion: 'Bölgesel lenf nodu tutulumu' },
    ],
    M: [
      { code: 'M0', label: 'M0', criterion: 'Uzak metastaz yok' },
      { code: 'M1', label: 'M1', criterion: 'Uzak metastaz' },
    ],
  },
  // --- KEMİK & SARKOM: Dev Hücreli Kemik Tümörü (GCTB) ---
  'bone-sarcoma-GCTB': {
    T: [
      { code: 'T1', label: 'Evre 1 (Latent)', criterion: 'İntraosseöz sınırları belirgin, inaktif lezyon' },
      { code: 'T2', label: 'Evre 2 (Aktif)', criterion: 'Korteks genişlemiş ama intakt lezyon' },
      { code: 'T3', label: 'Evre 3 (Agresif)', criterion: 'Kortikal perforasyon ve yumuşak doku yayılımı' },
    ],
    N: [
      { code: 'N0', label: 'N0', criterion: 'Lenf nodu tutulumu yok' },
      { code: 'N1', label: 'N1', criterion: 'Lenf nodu pozitif' },
    ],
    M: [
      { code: 'M0', label: 'M0', criterion: 'Metastaz yok' },
      { code: 'M1', label: 'M1', criterion: 'Akciğer benign/malign metastatik implantları' },
    ],
  },
  // --- BAŞ-BOYUN: Nazofarenks ---
  'head-neck-nasopharynx': {
    T: [
      { code: 'T1', label: 'T1', criterion: 'Nazofarenks veya orofarenks / burun boşluğu ile sınırlı' },
      { code: 'T2', label: 'T2', criterion: 'Parafaringeal alana uzanım' },
      { code: 'T3', label: 'T3', criterion: 'Kafatası tabanı, servikal vertebra, pterigoid kemik invazyonu' },
      { code: 'T4', label: 'T4', criterion: 'İntrakraniyal uzanım, kraniyal sinir tutulumu, hipofarenks, orbita' },
    ],
    N: [
      { code: 'N0', label: 'N0', criterion: 'Bölgesel lenf nodu metastazı yok' },
      { code: 'N1', label: 'N1', criterion: 'Unilateral servikal (≤6 cm) veya bilateral retrofaringeal lenf nodu' },
      { code: 'N2', label: 'N2', criterion: 'Bilateral servikal lenf nodu (≤6 cm, klavikula üstü)' },
      { code: 'N3', label: 'N3', criterion: '>6 cm lenf nodu veya supraklavikuler fossa tutulumu' },
    ],
    M: [
      { code: 'M0', label: 'M0', criterion: 'Uzak metastaz yok' },
      { code: 'M1', label: 'M1', criterion: 'Uzak metastaz mevcut' },
    ],
  },
  // --- BAŞ-BOYUN: Orofarenks ---
  'head-neck-oropharynx': {
    T: [
      { code: 'T1', label: 'T1', criterion: '≤2 cm primer tümör' },
      { code: 'T2', label: 'T2', criterion: '>2 cm ama ≤4 cm' },
      { code: 'T3', label: 'T3', criterion: '>4 cm veya epiglot lingual yüzeyi tutulumu' },
      { code: 'T4', label: 'T4', criterion: 'Larinks, dil kası, medial pterigoid veya mandibula invazyonu' },
    ],
    N: [
      { code: 'N0', label: 'N0', criterion: 'Bölgesel lenf nodu yok' },
      { code: 'N1', label: 'N1', criterion: 'İpsilateral tek lenf nodu ≤3 cm' },
      { code: 'N2', label: 'N2', criterion: 'Bilateral veya kontralateral ≤6 cm lenf nodu' },
      { code: 'N3', label: 'N3', criterion: '>6 cm lenf nodu veya ENE pozitifliği' },
    ],
    M: [
      { code: 'M0', label: 'M0', criterion: 'Uzak metastaz yok' },
      { code: 'M1', label: 'M1', criterion: 'Uzak metastaz' },
    ],
  },
  // --- BAŞ-BOYUN: Larinks ---
  'head-neck-larynx': {
    T: [
      { code: 'T1a/b', label: 'T1a/b', criterion: 'Tek veya her iki vokal kordla sınırlı, kord mobilitesi normal' },
      { code: 'T2', label: 'T2', criterion: 'Supraglottik/subglottik uzanım ve/veya azalmış vokal kord mobilitesi' },
      { code: 'T3', label: 'T3', criterion: 'Vokal kord fiksasyonu ve/veya paraglottik alan invazyonu' },
      { code: 'T4a', label: 'T4a', criterion: 'Tiroid kıkırdak penetrasyonu, trakea veya derin boyun kası invazyonu' },
    ],
    N: [
      { code: 'N0', label: 'N0', criterion: 'Lenf nodu tutulumu yok' },
      { code: 'N1', label: 'N1', criterion: 'İpsilateral tek lenf nodu ≤3 cm' },
      { code: 'N2', label: 'N2', criterion: 'İpsilateral çoklu veya bilateral lenf nodları ≤6 cm' },
      { code: 'N3', label: 'N3', criterion: '>6 cm lenf nodu' },
    ],
    M: [
      { code: 'M0', label: 'M0', criterion: 'Uzak metastaz yok' },
      { code: 'M1', label: 'M1', criterion: 'Uzak metastaz' },
    ],
  },
  // --- MSS: Beyin Metastazı ---
  'cns-mets': {
    T: [
      { code: 'Soliter', label: 'Tek Odak', criterion: '≤2 cm soliter metastatik lezyon' },
      { code: 'Oligo', label: '2-4 Odak', criterion: 'Oligometastatik intrakraniyal lezyonlar (çap ≤3-4 cm)' },
      { code: 'Coklu', label: '>4 Odak / Yaygın', criterion: 'Çoklu intrakraniyal metastazlar veya yaygın ödem/kitle etkisi' },
    ],
    N: [
      { code: 'N0', label: 'Primer N0', criterion: 'Primer tümör bölgesel lenf nodu negatif' },
      { code: 'N+', label: 'Primer N+', criterion: 'Primer tümör bölgesel lenf nodu pozitif' },
    ],
    M: [
      { code: 'M1', label: 'M1 Beyin', criterion: 'Parankimal intrakraniyal beyin metastazı' },
    ],
  },
  // --- MSS: Glioblastom ---
  'cns-gbm': {
    T: [
      { code: 'Lokalize', label: 'Lokalize Kitle', criterion: 'Maksimal güvenli cerrahiye uygun lober kitle' },
      { code: 'Derin_Infiltratif', label: 'Derin / Santral', criterion: 'Bazal ganglion, talamus veya korpus kallozum invazyonu' },
      { code: 'Multifokal', label: 'Multifokal GBM', criterion: 'Beyin parankiminde birden fazla birbirinden bağımsız odak' },
    ],
    N: [
      { code: 'N0', label: 'Uygulanamaz', criterion: 'MSS primer tümörlerinde lenf nodu değerlendirmesi yapılmaz' },
    ],
    M: [
      { code: 'M0', label: 'M0', criterion: 'Leptomeningeal veya spinal tohumlanma yok' },
      { code: 'M1', label: 'M1 (Leptomeningeal)', criterion: 'BOS sitolojisi pozitif veya spinal tohumlanma mevcut' },
    ],
  },
  // --- MSS: Menenjiyom ---
  'cns-meningioma': {
    T: [
      { code: 'Grade-1', label: 'WHO Grade 1', criterion: 'Benign histoloji (Mitoz <4/10 BBA, beyin invazyonu yok)' },
      { code: 'Grade-2', label: 'WHO Grade 2 (Atipik)', criterion: 'Atipik histoloji (Mitoz 4-19/10 BBA veya beyin invazyonu)' },
      { code: 'Grade-3', label: 'WHO Grade 3 (Malign)', criterion: 'Anaplastik / malign histoloji (Mitoz ≥20/10 BBA)' },
    ],
    N: [
      { code: 'N0', label: 'Uygulanamaz', criterion: 'Lenfatik drenaj değerlendirilmez' },
    ],
    M: [
      { code: 'M0', label: 'M0', criterion: 'İntrakraniyal sınırlı lezyon' },
      { code: 'M1', label: 'M1', criterion: 'Ekstrakraniyal uzak metastaz' },
    ],
  },
  // --- GİS: Rektum ---
  'gis-Rektum': {
    T: [
      { code: 'T1', label: 'T1', criterion: 'Submukoza invazyonu (Muskularis propria intakt)' },
      { code: 'T2', label: 'T2', criterion: 'Muskularis propria invazyonu' },
      { code: 'T3', label: 'T3', criterion: 'Subseroza veya perirektal yağ dokusu invazyonu (Mezorektum)' },
      { code: 'T4a', label: 'T4a', criterion: 'Visseral periton penetrasyonu' },
      { code: 'T4b', label: 'T4b', criterion: 'Komşu organ invazyonu (prostat, mesane, vajen, sakrum vb.)' },
    ],
    N: [
      { code: 'N0', label: 'N0', criterion: 'Bölgesel mezorektal lenf nodu metastazı yok' },
      { code: 'N1', label: 'N1', criterion: '1-3 bölgesel mezorektal lenf nodu pozitif' },
      { code: 'N2', label: 'N2', criterion: '≥4 bölgesel mezorektal lenf nodu pozitif' },
    ],
    M: [
      { code: 'M0', label: 'M0', criterion: 'Uzak organ metastazı yok' },
      { code: 'M1a', label: 'M1a', criterion: 'Tek bir uzak organda soliter metastaz (örn. izole karaciğer)' },
      { code: 'M1b', label: 'M1b', criterion: 'Birden fazla organda metastaz' },
    ],
  },
  // --- GİS: Mide ---
  'gis-Mide': {
    T: [
      { code: 'T1', label: 'T1', criterion: 'Lamina propria veya submukozaya invazyon' },
      { code: 'T2', label: 'T2', criterion: 'Muskularis propria invazyonu' },
      { code: 'T3', label: 'T3', criterion: 'Subseroza bağ dokusu invazyonu' },
      { code: 'T4a', label: 'T4a', criterion: 'Seroza (visseral periton) perforasyonu' },
      { code: 'T4b', label: 'T4b', criterion: 'Komşu organ invazyonu (kolon, karaciğer, diyafram, pankreas)' },
    ],
    N: [
      { code: 'N0', label: 'N0', criterion: 'Bölgesel lenf nodu metastazı yok' },
      { code: 'N1', label: 'N1', criterion: '1-2 bölgesel lenf nodu pozitif' },
      { code: 'N2', label: 'N2', criterion: '3-6 bölgesel lenf nodu pozitif' },
      { code: 'N3', label: 'N3', criterion: '≥7 bölgesel lenf nodu pozitif' },
    ],
    M: [
      { code: 'M0', label: 'M0', criterion: 'Uzak metastaz yok' },
      { code: 'M1', label: 'M1', criterion: 'Uzak organ veya peritoneal karsinomatozis' },
    ],
  },
  // --- GÜS: Prostat ---
  'prostate-prostate': {
    T: [
      { code: 'T1c', label: 'T1c', criterion: 'Muayenede palpe edilemeyen; PSA yüksekliği biyopsisinde saptanan' },
      { code: 'T2a', label: 'T2a', criterion: 'Palpabl tümör; bir lobun yarısı veya daha azı ile sınırlı' },
      { code: 'T2b', label: 'T2b', criterion: 'Palpabl tümör; bir lobun yarısından fazlasına uzanmış' },
      { code: 'T2c', label: 'T2c', criterion: 'Bilateral her iki prostat lobunu tutan kitle' },
      { code: 'T3a', label: 'T3a', criterion: 'Ekstrakapsüler yayılım (ECE) - Prostat kapsülünü aşmış' },
      { code: 'T3b', label: 'T3b', criterion: 'Seminal vezikül invazyonu (SVI)' },
      { code: 'T4', label: 'T4', criterion: 'Rektum, levator kasları veya pelvik taban komşu organ invazyonu' },
    ],
    N: [
      { code: 'N0', label: 'N0', criterion: 'Bölgesel pelvik lenf nodu metastazı yok' },
      { code: 'N1', label: 'N1', criterion: 'Pelvik lenf nodu metastazı (obturator, iliak nodlar)' },
    ],
    M: [
      { code: 'M0', label: 'M0', criterion: 'Uzak metastaz yok' },
      { code: 'M1a', label: 'M1a', criterion: 'Bölge dışı uzak lenf nodu metastazları' },
      { code: 'M1b', label: 'M1b', criterion: 'Kemik metastazı (aksiyel/apandiküler iskelet)' },
      { code: 'M1c', label: 'M1c', criterion: 'Visseral organ metastazları (akciğer, karaciğer vb.)' },
    ],
  },
  // --- MEME ---
  breast: {
    T: [
      { code: 'T1mic', label: 'T1mic', criterion: 'Mikroinvazyon; en büyük odak ≤0.1 cm (1 mm)' },
      { code: 'T1a', label: 'T1a', criterion: 'Tümör >0.1 cm ama ≤0.5 cm (1-5 mm)' },
      { code: 'T1b', label: 'T1b', criterion: 'Tümör >0.5 cm ama ≤1.0 cm (5-10 mm)' },
      { code: 'T1c', label: 'T1c', criterion: 'Tümör >1.0 cm ama ≤2.0 cm (10-20 mm)' },
      { code: 'T2', label: 'T2', criterion: '>2 cm ama ≤5 cm invaziv kitle' },
      { code: 'T3', label: 'T3', criterion: '>5 cm primer meme kitlesi' },
      { code: 'T4', label: 'T4', criterion: 'Göğüs duvarı fiksasyonu, cilt ülserasyonu veya enflamatuar karsinom' },
    ],
    N: [
      { code: 'N0', label: 'N0', criterion: 'Aksiller lenf nodu metastazı yok' },
      { code: 'N1', label: 'N1', criterion: '1-3 ipsilateral hareketli Level I-II aksiller lenf nodu' },
      { code: 'N2', label: 'N2', criterion: '4-9 aksiller lenf nodu veya fikse konglomere kitle' },
      { code: 'N3', label: 'N3', criterion: '≥10 aksiller nod veya supraklavikuler / internal mammar lenf nodu' },
    ],
    M: [
      { code: 'M0', label: 'M0', criterion: 'Uzak metastaz yok' },
      { code: 'M1', label: 'M1', criterion: 'Kemik, akciğer, karaciğer veya beyin uzak metastazı' },
    ],
  },
  // --- CİLT ---
  skin: {
    T: [
      { code: 'T1', label: 'T1', criterion: '≤2 cm çap; yüksek risk özelliği yok' },
      { code: 'T2', label: 'T2', criterion: '>2 cm ama ≤4 cm' },
      { code: 'T3', label: 'T3', criterion: '>4 cm veya derin invazyon (>6 mm) veya kemik korteks erozyonu' },
      { code: 'T4', label: 'T4', criterion: 'Aksiyel kemik veya kafatası tabanı derin invazyonu' },
    ],
    N: [
      { code: 'N0', label: 'N0', criterion: 'Bölgesel lenf nodu tutulumu yok' },
      { code: 'N1', label: 'N1', criterion: '1 lenf nodu metastazı (≤3 cm)' },
      { code: 'N2', label: 'N2', criterion: 'Çoklu lenf nodu veya >3 cm kitle' },
    ],
    M: [
      { code: 'M0', label: 'M0', criterion: 'Uzak metastaz yok' },
      { code: 'M1', label: 'M1', criterion: 'Uzak visseral organ metastazları' },
    ],
  },
  // --- HEMATOLOJİK ---
  hematologic: {
    T: [
      { code: 'Evre I', label: 'Evre I', criterion: 'Tek bir lenf nodu bölgesi veya tek bir ekstralenfatik organ tutulumu' },
      { code: 'Evre II', label: 'Evre II', criterion: 'Diyaframın aynı tarafında iki veya daha fazla lenf nodu bölgesi' },
      { code: 'Evre III', label: 'Evre III', criterion: 'Diyaframın her iki tarafında lenf nodu tutulumu' },
      { code: 'Evre IV', label: 'Evre IV', criterion: 'Yaygın kemik iliği, karaciğer veya ekstralenfatik organ yayılımı' },
    ],
    N: [
      { code: 'Non-Bulky', label: 'Non-Bulky', criterion: 'Mediastinal veya periferik kitle çapı <7-10 cm' },
      { code: 'Bulky', label: 'Bulky Kitle', criterion: '≥7-10 cm büyük kitle veya transtorasik çapın >1/3\'ü' },
    ],
    M: [
      { code: 'A', label: 'A', criterion: 'B semptomu yok (Ateş, gece terlemesi, kilo kaybı yok)' },
      { code: 'B', label: 'B', criterion: 'B semptomları mevcut' },
    ],
  },
  // --- PEDİATRİK ---
  pediatric: {
    T: [
      { code: 'Standart', label: 'Standart Risk', criterion: 'Rezidü kitle <1.5 cm2, nörolojik defisit ve yayılım sınırlı' },
      { code: 'Yuksek', label: 'Yüksek Risk', criterion: 'Rezidü ≥1.5 cm2 veya kraniyospinal aksa yayılım şüphesi' },
    ],
    N: [
      { code: 'N0', label: 'N0', criterion: 'Nodal tutulum yok' },
      { code: 'N1', label: 'N1', criterion: 'Bölgesel nodal tutulum' },
    ],
    M: [
      { code: 'M0', label: 'M0', criterion: 'BOS sitolojisi ve omurilik MR temiz (CSI lokalize)' },
      { code: 'M1-3', label: 'M+', criterion: 'BOS sitolojisi pozitif veya spinal leptomeningeal tohumlanma' },
    ],
  },
  // --- PALYATİF ---
  palliative: {
    T: [
      { code: 'Kemik', label: 'Ağrılı Kemik Metastazı', criterion: 'Omurga, pelvis, ekstremite kemik tutulumu' },
      { code: 'Beyin', label: 'Beyin Metastazı', criterion: 'Kafa içi kitle lezyonları' },
      { code: 'Kord', label: 'Spinal Kord Basısı', criterion: 'Acil medüller bası ve paraparezi riski' },
      { code: 'VCSS', label: 'Süperior Vena Kava', criterion: 'Mediastinal obstrüksiyon sendromu' },
      { code: 'Kanama', label: 'Malign Hemoraji', criterion: 'Pelvik, mesane veya rektal kanama' },
    ],
    N: [
      { code: 'TekFx', label: 'Tek Fraksiyon Tercihi', criterion: '8 Gy tek fraksiyon (Optimal ağrı palyasyonu, hasta konforu)' },
      { code: 'CokFx', label: 'Çoklu Fraksiyon Tercihi', criterion: '20 Gy / 5 fx veya 30 Gy / 10 fx (Uzun sağkalım beklentisi)' },
    ],
    M: [
      { code: 'M1', label: 'Metastatik / İlerlemiş', criterion: 'Palyatif semptomatik endikasyon' },
    ],
  },
};

TNM_DATABASE['prostate-bladder'] = {
  T: [
    { code: 'T2', label: 'cT2', criterion: 'Detrusor kasını invaze eden kas-invaziv mesane tümörü' },
    { code: 'T3', label: 'cT3', criterion: 'Perivezikal yağ dokusuna uzanım' },
    { code: 'T4a', label: 'cT4a', criterion: 'Prostat stroması, uterus veya vajen invazyonu' },
  ],
  N: [
    { code: 'N0', label: 'N0', criterion: 'Bölgesel lenf nodu metastazı yok' },
    { code: 'N1', label: 'N1', criterion: 'Tek bölgesel lenf nodunda metastaz' },
    { code: 'N2', label: 'N2', criterion: 'Birden fazla bölgesel lenf nodu metastazı' },
  ],
  M: [
    { code: 'M0', label: 'M0', criterion: 'Uzak metastaz yok' },
    { code: 'M1', label: 'M1', criterion: 'Uzak metastaz mevcut' },
  ],
};
TNM_DATABASE['prostate-testis'] = {
  T: [
    { code: 'I', label: 'Evre I', criterion: 'Seminom testise sınırlı, tümör belirteçleri ve görüntüleme ile N0M0' },
    { code: 'IIA', label: 'Evre IIA', criterion: 'Retroperitoneal lenf nodu metastazı, en büyük çap ≤2 cm' },
    { code: 'IIB', label: 'Evre IIB', criterion: 'Retroperitoneal lenf nodu metastazı, en büyük çap >2-5 cm' },
  ],
  N: [
    { code: 'N0', label: 'N0', criterion: 'Retroperitoneal lenf nodu metastazı yok' },
    { code: 'N1', label: 'N1', criterion: 'Metastatik nodal kitle ≤2 cm' },
    { code: 'N2', label: 'N2', criterion: 'Metastatik nodal kitle >2-5 cm' },
  ],
  M: [
    { code: 'M0', label: 'M0', criterion: 'Uzak metastaz yok' },
    { code: 'M1', label: 'M1', criterion: 'Uzak metastaz mevcut' },
  ],
};
TNM_DATABASE['prostate-penis'] = {
  T: [
    { code: 'T1', label: 'T1', criterion: 'Subepitelyal bağ dokusuna invazyon' },
    { code: 'T2', label: 'T2', criterion: 'Corpus spongiosum veya cavernosum invazyonu' },
    { code: 'T3', label: 'T3', criterion: 'Üretra veya prostat invazyonu' },
    { code: 'T4', label: 'T4', criterion: 'Diğer komşu yapılara invazyon' },
  ],
  N: [
    { code: 'N0', label: 'N0', criterion: 'Bölgesel lenf nodu metastazı yok' },
    { code: 'N1', label: 'N1', criterion: 'Tek unilateral inguinal lenf nodu' },
    { code: 'N2', label: 'N2', criterion: 'Çoklu veya bilateral inguinal lenf nodu' },
    { code: 'N3', label: 'N3', criterion: 'Pelvik nodal metastaz veya ekstranodal yayılım' },
  ],
  M: [
    { code: 'M0', label: 'M0', criterion: 'Uzak metastaz yok' },
    { code: 'M1', label: 'M1', criterion: 'Uzak metastaz mevcut' },
  ],
};
TNM_DATABASE['breast-dcis'] = {
  T: [{ code: 'Tis', label: 'Tis (DCIS)', criterion: 'Duktal karsinoma in situ; stromal invazyon yok' }],
  N: [{ code: 'N0', label: 'N0', criterion: 'Bölgesel lenf nodu metastazı yok' }],
  M: [{ code: 'M0', label: 'M0', criterion: 'Uzak metastaz yok' }],
};
TNM_DATABASE['breast-phyllodes'] = {
  T: [
    { code: 'T1', label: 'T1', criterion: 'Tümör çapı ≤5 cm' },
    { code: 'T2', label: 'T2', criterion: 'Tümör çapı >5 cm' },
  ],
  N: [{ code: 'N0', label: 'N0', criterion: 'Rutin elektif aksiller nodal ışınlama endikasyonu yok' }],
  M: [
    { code: 'M0', label: 'M0', criterion: 'Uzak metastaz yok' },
    { code: 'M1', label: 'M1', criterion: 'Uzak metastaz mevcut' },
  ],
};
TNM_DATABASE['head-neck-hypopharynx'] = {
  T: [
    { code: 'T1', label: 'T1', criterion: 'Hipofarenksin tek alt bölgesinde, çap ≤2 cm' },
    { code: 'T2', label: 'T2', criterion: 'Birden fazla alt bölge veya komşu bölge tutulumu, çap ≤4 cm' },
    { code: 'T3', label: 'T3', criterion: 'Çap >4 cm veya hemilarinks fiksasyonu' },
    { code: 'T4', label: 'T4', criterion: 'Tiroid/kıkırdak veya komşu yapı invazyonu' },
  ],
  N: [
    { code: 'N0', label: 'N0', criterion: 'Bölgesel lenf nodu metastazı yok' },
    { code: 'N1', label: 'N1', criterion: 'Tek ipsilateral nod ≤3 cm' },
    { code: 'N2', label: 'N2', criterion: 'Nod(lar) >3-6 cm veya bilateral/kontralateral tutulum' },
    { code: 'N3', label: 'N3', criterion: 'Nod >6 cm' },
  ],
  M: [
    { code: 'M0', label: 'M0', criterion: 'Uzak metastaz yok' },
    { code: 'M1', label: 'M1', criterion: 'Uzak metastaz mevcut' },
  ],
};
TNM_DATABASE['head-neck-oral-cavity'] = {
  T: [
    { code: 'T1', label: 'T1', criterion: 'Tümör ≤2 cm ve DOI ≤5 mm' },
    { code: 'T2', label: 'T2', criterion: 'Tümör ≤2 cm ve DOI >5-10 mm veya >2-4 cm ve DOI ≤10 mm' },
    { code: 'T3', label: 'T3', criterion: 'Tümör >4 cm veya DOI >10 mm' },
    { code: 'T4a', label: 'T4a', criterion: 'Kortikal kemik, maksiller sinüs veya yüz cildi invazyonu' },
    { code: 'T4b', label: 'T4b', criterion: 'Mastikatör alan, pterigoid plak, kafa tabanı veya karotis çevresi invazyonu' },
  ],
  N: [
    { code: 'N0', label: 'N0', criterion: 'Bölgesel lenf nodu metastazı yok' },
    { code: 'N1', label: 'N1', criterion: 'Tek ipsilateral nod ≤3 cm, ENE negatif' },
    { code: 'N2', label: 'N2', criterion: 'Çoklu/bilateral nodlar ≤6 cm, ENE negatif' },
    { code: 'N3', label: 'N3', criterion: 'Nod >6 cm veya klinik olarak anlamlı ENE' },
  ],
  M: [
    { code: 'M0', label: 'M0', criterion: 'Uzak metastaz yok' },
    { code: 'M1', label: 'M1', criterion: 'Uzak metastaz mevcut' },
  ],
};
TNM_DATABASE['head-neck-salivary'] = {
  T: [
    { code: 'T1', label: 'T1', criterion: 'Tümör ≤2 cm, ekstraparenkimal yayılım yok' },
    { code: 'T2', label: 'T2', criterion: 'Tümör >2-4 cm, ekstraparenkimal yayılım yok' },
    { code: 'T3', label: 'T3', criterion: 'Tümör >4 cm veya ekstraparenkimal yumuşak doku yayılımı' },
    { code: 'T4a', label: 'T4a', criterion: 'Deri, mandibula, dış kulak yolu veya fasiyal sinir invazyonu' },
    { code: 'T4b', label: 'T4b', criterion: 'Kafa tabanı, pterigoid plak veya karotis çevresi invazyonu' },
  ],
  N: [
    { code: 'N0', label: 'N0', criterion: 'Bölgesel lenf nodu metastazı yok' },
    { code: 'N1', label: 'N1', criterion: 'Tek ipsilateral nod ≤3 cm, ENE negatif' },
    { code: 'N2', label: 'N2', criterion: 'Nod >3-6 cm veya çoklu/bilateral nodal hastalık' },
    { code: 'N3', label: 'N3', criterion: 'Nod >6 cm' },
  ],
  M: [
    { code: 'M0', label: 'M0', criterion: 'Uzak metastaz yok' },
    { code: 'M1', label: 'M1', criterion: 'Uzak metastaz mevcut' },
  ],
};
TNM_DATABASE['hematologic-Hodgkin'] = TNM_DATABASE.hematologic;
TNM_DATABASE['hematologic-DLBCL'] = TNM_DATABASE.hematologic;
TNM_DATABASE['hematologic-Plasmacytoma'] = {
  T: [
    { code: 'Soliter', label: 'Soliter', criterion: 'Tek kemik veya ekstramedüller plazmasitom' },
    { code: 'Multifokal', label: 'Multifokal', criterion: 'Birden fazla kemik lezyonu; miyelom değerlendirmesi gerekir' },
  ],
  N: [{ code: 'N0', label: 'N0', criterion: 'Bölgesel lenf nodu tutulumu yok' }],
  M: [
    { code: 'M0', label: 'M0', criterion: 'Tek lokalize plazmasitom' },
    { code: 'M1', label: 'M1', criterion: 'Ek odak veya sistemik hastalık' },
  ],
};
TNM_DATABASE['hematologic-Myeloma'] = {
  T: [{ code: 'Semptomatik', label: 'Semptomatik', criterion: 'Ağrılı litik lezyon veya patolojik fraktür riski' }],
  N: [{ code: 'N0', label: 'N0', criterion: 'Nodal evreleme uygulanmaz' }],
  M: [{ code: 'Sistemik', label: 'Sistemik', criterion: 'Sistemik multipl miyelom' }],
};
TNM_DATABASE['pediatric-Medulloblastom'] = TNM_DATABASE.pediatric;
TNM_DATABASE['pediatric-Wilms'] = {
  T: [
    { code: 'I-II', label: 'Evre I-II', criterion: 'Böbreğe sınırlı veya cerrahiyle tamamen çıkarılmış tümör' },
    { code: 'III', label: 'Evre III', criterion: 'Karın içinde rezidü, nodal tutulum veya fokal/diffüz anaplazi' },
  ],
  N: [
    { code: 'N0', label: 'N0', criterion: 'Bölgesel nodal tutulum yok' },
    { code: 'N1', label: 'N1', criterion: 'Bölgesel lenf nodu tutulumu' },
  ],
  M: [
    { code: 'M0', label: 'M0', criterion: 'Uzak metastaz yok' },
    { code: 'M1', label: 'M1', criterion: 'Uzak metastaz, sıklıkla akciğer' },
  ],
};
TNM_DATABASE['pediatric-Neuroblastom'] = {
  T: [
    { code: 'L1', label: 'L1', criterion: 'Görüntülemede risk faktörü olmayan lokalize tümör' },
    { code: 'L2', label: 'L2', criterion: 'Bir veya daha fazla görüntüleme tanımlı risk faktörü olan lokalize tümör' },
    { code: 'M', label: 'M', criterion: 'Uzak metastatik hastalık' },
  ],
  N: [{ code: 'N0', label: 'N0', criterion: 'Lenf nodu tutulumu yok' }, { code: 'N1', label: 'N1', criterion: 'İpsilateral bölgesel nod tutulumu' }],
  M: [{ code: 'M0', label: 'M0', criterion: 'Uzak metastaz yok' }, { code: 'M1', label: 'M1', criterion: 'Uzak metastaz mevcut' }],
};
TNM_DATABASE['breast-breast'] = TNM_DATABASE.breast;
TNM_DATABASE['gis-Karaciger'] = {
  T: [
    { code: 'T1a', label: 'T1a', criterion: 'Tek lezyon ≤2 cm; vasküler invazyon yok' },
    { code: 'T1b', label: 'T1b', criterion: 'Tek lezyon ≤2 cm; mikrovasküler invazyon mevcut' },
    { code: 'T2', label: 'T2', criterion: 'Tek lezyon >2 cm veya vasküler invazyonlu tek lezyon' },
    { code: 'T3', label: 'T3', criterion: 'Çapı >5 cm olan çoklu lezyonlar veya ana portal/hepatik ven dalı invazyonu' },
    { code: 'T4', label: 'T4', criterion: 'Komşu organ invazyonu (safra kesesi hariç) veya visseral periton perforasyonu' },
  ],
  N: [
    { code: 'N0', label: 'N0', criterion: 'Bölgesel lenf nodu metastazı yok' },
    { code: 'N1', label: 'N1', criterion: 'Bölgesel lenf nodu metastazı mevcut' },
  ],
  M: [
    { code: 'M0', label: 'M0', criterion: 'Uzak metastaz yok' },
    { code: 'M1', label: 'M1', criterion: 'Uzak organ/peritoneal metastaz mevcut' },
  ],
};
TNM_DATABASE['pediatric-Ewing'] = TNM_DATABASE['bone-sarcoma-Ewing'];
TNM_DATABASE['skin-BCC'] = TNM_DATABASE.skin;
TNM_DATABASE['skin-SCC'] = TNM_DATABASE.skin;
TNM_DATABASE['skin-Melanom'] = TNM_DATABASE.skin;
TNM_DATABASE['skin-Merkel'] = TNM_DATABASE.skin;
TNM_DATABASE['bone-sarcoma-DFSP'] = TNM_DATABASE['bone-sarcoma-Yumusak_Doku'];

// Fallback atamaları
TNM_DATABASE['thorax'] = TNM_DATABASE['thorax-nsclc'];
TNM_DATABASE['prostate'] = TNM_DATABASE['prostate-prostate'];
TNM_DATABASE['gis'] = TNM_DATABASE['gis-Rektum'];
TNM_DATABASE['head-neck'] = TNM_DATABASE['head-neck-nasopharynx'];
TNM_DATABASE['cns'] = TNM_DATABASE['cns-mets'];
TNM_DATABASE['gynecology'] = TNM_DATABASE['gynecology-Serviks'];
TNM_DATABASE['bone-sarcoma'] = TNM_DATABASE['bone-sarcoma-Yumusak_Doku'];

const generateCasePrompt = (
  organ: string,
  subsite: string,
  t: string,
  n: string,
  m: string,
  schemeName?: string,
  totalDose?: string,
  riskGroup?: string,
  lang: 'tr' | 'en' = 'tr',
): string => {
  if (lang === 'en') {
    return `Dear Oncology Consultant, I request your expert evaluation of the following radiation oncology case in light of NCCN v1.2025, ASTRO, ESTRO guidelines, and current landmark Phase III randomized clinical trial evidence:

CLINICAL CASE DETAILS:
- Anatomic Site: ${organ.toUpperCase()} - ${subsite}
- Staging: ${t} ${n} ${m}
${riskGroup ? `- Risk Profile / Biomarkers: ${riskGroup}` : ''}
- Prescribed Regimen: ${totalDose || ''} (${schemeName || ''})

KEY CLINICAL QUESTIONS:
1. Is the proposed fractionation scheme and radiobiological equivalence (BED / EQD2) optimal for this stage and risk profile?
2. What are the indications, timing, and evidence levels for concurrent or adjuvant systemic therapy (Chemotherapy, ADT, Immunotherapy)?
3. What are the critical ICRU 83 target volume (CTV/PTV) margins and QUANTEC/HyTEC organs at risk (OAR) safety constraints to watch out for?
4. What are the landmark Phase III clinical trials supporting this specific therapeutic strategy?`;
  }

  return `Sayın Onkoloji Danışmanı, aşağıdaki radyasyon onkolojisi vakasını NCCN v1.2025, ASTRO, ESTRO ve güncel randomize Faz III klinik çalışma kanıtları doğrultusunda değerlendirmenizi rica ediyorum:

KLİNİK VAKA BİLGİLERİ:
- Anatomik Bölge: ${organ.toUpperCase()} - ${subsite}
- Evreleme: ${t} ${n} ${m}
${riskGroup ? `- Risk Grubu / Biyobelirteçler: ${riskGroup}` : ''}
- Planlanan Reçete: ${totalDose || ''} (${schemeName || ''})

DEĞERLENDİRİLMESİ İSTENEN NOKTALAR:
1. Bu evre ve risk profili için önerilen fraksiyonasyon şeması ve biyolojik eşdeğer doz (BED/EQD2) uygunluğu nedir?
2. Eşzamanlı veya ardışık sistemik tedavi (Kemoterapi, ADT, İmmünoterapi) endikasyonu ve kanıt düzeyi nedir?
3. Hedef hacim marjinleri (CTV/PTV) ve ICRU 83 / QUANTEC kritik organ (OAR) toleransları açısından dikkat edilmesi gereken özel riskler nelerdir?
4. Bu klinik senaryoyu destekleyen güncel landmark Faz III çalışmalar hangileridir?`;
};


export default function RadoncoCDSSPage() {
  const { isLoaded, user } = useUser();
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [lang, setLang] = useState<'tr' | 'en'>('en');
  const [activeReferenceTab, setActiveReferenceTab] = useState<'guidelines' | 'oar' | 'disclaimer'>('guidelines');
  const tText = (text: string | undefined): string => {
    if (!text) return '';
    if (lang === 'tr') return text;
    if (TRANSLATION_MAP[text]) return TRANSLATION_MAP[text];

    return text.replace(TRANSLATION_MATCHER, match => TRANSLATION_MAP[match] ?? match);
  };
  const email = user?.primaryEmailAddress?.emailAddress ?? '';
  const ADMIN_EMAILS = ['harun.pekmezci@sbu.edu.tr', 'ee011126@mail2.gantep.edu.tr'];
  const emailLower = email.toLowerCase();
  const isDoctor =
    ADMIN_EMAILS.includes(emailLower) ||
    emailLower.endsWith('saglik.gov.tr') ||
    emailLower.endsWith('.edu.tr') ||
    emailLower.endsWith('.edu') ||
    emailLower.endsWith('nhs.net') ||
    emailLower.endsWith('.ac.uk') ||
    emailLower.includes('.med.') ||
    emailLower.includes('.hospital');

  useEffect(() => {
    const storedTheme = window.localStorage.getItem('radonco-theme');
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const applyTheme = (nextTheme: 'light' | 'dark') => {
      setTheme(nextTheme);
      document.documentElement.classList.toggle('dark', nextTheme === 'dark');
    };

    if (storedTheme === 'light' || storedTheme === 'dark') {
      applyTheme(storedTheme);
    } else {
      applyTheme(mediaQuery.matches ? 'dark' : 'light');
    }

    const handleSystemThemeChange = (event: MediaQueryListEvent) => {
      if (!window.localStorage.getItem('radonco-theme')) {
        applyTheme(event.matches ? 'dark' : 'light');
      }
    };

    mediaQuery.addEventListener('change', handleSystemThemeChange);
    return () => mediaQuery.removeEventListener('change', handleSystemThemeChange);
  }, []);

  useEffect(() => {
    const saved = window.localStorage.getItem('radonco-lang');
    if (saved === 'tr' || saved === 'en') {
      setLang(saved);
    } else {
      setLang('en');
      window.localStorage.setItem('radonco-lang', 'en');
    }
  }, []);

  const changeLanguage = (nextLanguage: 'tr' | 'en') => {
    setLang(nextLanguage);
    window.localStorage.setItem('radonco-lang', nextLanguage);
  };

  const toggleTheme = () => {
    const nextTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(nextTheme);
    document.documentElement.classList.toggle('dark', nextTheme === 'dark');
    window.localStorage.setItem('radonco-theme', nextTheme);
  };

  // ==========================================
  // ANA ORGAN VE EVRE DURUMU
  // ==========================================
  const [selectedOrgan, setSelectedOrgan] = useState<OrganId>('thorax');
  const [selectedT, setSelectedT] = useState<string>('T1b');
  const [selectedN, setSelectedN] = useState<string>('N0');
  const [selectedM, setSelectedM] = useState<string>('M0');
  const [selectedSubsite, setSelectedSubsite] = useState<string>('benign-ho');
  const [benignClinicalStatus, setBenignClinicalStatus] = useState<string>('postop-24h');

  // ==========================================
  // 1. TORAKS ALT BAŞLIKLARI VE RİSK FAKTÖRLERİ
  // ==========================================
  const [thoraxSubtype, setThoraxSubtype] = useState<'nsclc' | 'sclc' | 'thymoma' | 'mesothelioma'>('nsclc');
  const [thoraxCentrality, setThoraxCentrality] = useState<'Peripheral' | 'Central' | 'UltraCentral'>('Peripheral');
  const [thoraxSurgeryStatus, setThoraxSurgeryStatus] = useState<'Inoperable' | 'Operable' | 'Postop_R0' | 'Postop_R1_R2'>('Inoperable');
  // KHAK (SCLC)
  const [sclcStage, setSclcStage] = useState<'Sinirli' | 'Yaygin'>('Sinirli');
  const [sclcTiming, setSclcTiming] = useState<'Erken_BID_45Gy' | 'Standart_QD_60Gy'>('Erken_BID_45Gy');
  // Timoma
  const [thymomaStage, setThymomaStage] = useState<'Masaoka_I' | 'Masaoka_II' | 'Masaoka_III' | 'Masaoka_IV'>('Masaoka_II');
  const [thymomaMargin, setThymomaMargin] = useState<'R0' | 'R1' | 'R2'>('R0');
  // Mezotelyoma
  const [mesoIntent, setMesoIntent] = useState<'Palyatif' | 'Hemitorasik_Postop' | 'Dren_Yeri'>('Palyatif');

  // ==========================================
  // 2. GÜS / PROSTAT ALT BAŞLIKLARI
  // ==========================================
  const [gusSubtype, setGusSubtype] = useState<'prostate' | 'bladder' | 'testis' | 'penile'>('prostate');
  const [gleasonPrimary, setGleasonPrimary] = useState<string>('3');
  const [gleasonSecondary, setGleasonSecondary] = useState<string>('4');
  const [psaLevel, setPsaLevel] = useState<string>('8.5');
  const [hasECE, setHasECE] = useState<boolean>(false);
  const [hasSVI, setHasSVI] = useState<boolean>(false);
  const [positiveCorePercent, setPositiveCorePercent] = useState<string>('35');
  const [bladderTurbtComplete, setBladderTurbtComplete] = useState<boolean>(true);
  const [bladderTmtSuitable, setBladderTmtSuitable] = useState<boolean>(true);

  // ==========================================
  // 3. MEME RİSK FAKTÖRLERİ
  // ==========================================
  const [breastHistology, setBreastHistology] = useState<string>('İnvaziv Duktal Karsinom (İDK)');
  const [breastMenopause, setBreastMenopause] = useState<'Premenopozal' | 'Postmenopozal'>('Postmenopozal');
  const [breastSurgery, setBreastSurgery] = useState<'MKC' | 'Mastektomi'>('MKC');
  const [breastMargin, setBreastMargin] = useState<'Negatif' | 'Yakin' | 'Pozitif'>('Negatif');
  const [breastBoost, setBreastBoost] = useState<boolean>(true);
  const [phyllodesMarginCm, setPhyllodesMarginCm] = useState<string>('1.2');
  const [phyllodesHighGrade, setPhyllodesHighGrade] = useState<boolean>(false);
  const [breastER, setBreastER] = useState<boolean>(true);
  const [breastPR, setBreastPR] = useState<boolean>(true);
  const [breastHER2, setBreastHER2] = useState<boolean>(false);
  const [breastKi67, setBreastKi67] = useState<string>('18');
  const [breastGrade, setBreastGrade] = useState<'1' | '2' | '3'>('2');

  // ==========================================
  // 4. GİS ALT BAŞLIKLARI
  // ==========================================
  const [gisOrgan, setGisOrgan] = useState<'Rektum' | 'Mide' | 'Ozofagus' | 'Pankreas' | 'Anal' | 'Karaciger'>('Rektum');
  const [gisCrmStatus, setGisCrmStatus] = useState<'Negatif' | 'Pozitif'>('Negatif');

  // ==========================================
  // 5. BAŞ-BOYUN ALT BAŞLIKLARI
  // ==========================================
  const [hnSubsite, setHnSubsite] = useState<'nasopharynx' | 'oropharynx' | 'larynx' | 'hypopharynx' | 'oral-cavity' | 'salivary'>('nasopharynx');
  const [hnLarynxSubsite, setHnLarynxSubsite] = useState<'Erken_Glottik_T1_T2' | 'Lokal_Ileri_T3_T4'>('Erken_Glottik_T1_T2');
  const [hnCrossesMidline, setHnCrossesMidline] = useState<boolean>(false);
  const [hnDistanceFromMidlineCm, setHnDistanceFromMidlineCm] = useState<string>('2');
  const [hnTumorSizeCm, setHnTumorSizeCm] = useState<string>('1.5');
  const [hnDoiMm, setHnDoiMm] = useState<string>('4');
  const [hnENE, setHnENE] = useState<boolean>(false);
  const [hnPositiveMargin, setHnPositiveMargin] = useState<boolean>(false);

  // ==========================================
  // 6. MSS / BEYİN ALT BAŞLIKLARI
  // ==========================================
  const [cnsSubtype, setCnsSubtype] = useState<'mets' | 'gbm' | 'meningioma'>('mets');
  const [cnsMidlineShift, setCnsMidlineShift] = useState<'Yok' | '<5mm' | '>=5mm'>('Yok');
  const [cnsMetCount, setCnsMetCount] = useState<string>('1');
  const [cnsMaxDiameter, setCnsMaxDiameter] = useState<string>('1.8');
  const [cnsSymptoms, setCnsSymptoms] = useState<'Asimptomatik' | 'Semptomatik'>('Asimptomatik');
  const [cnsResection, setCnsResection] = useState<'Yok' | 'GTR' | 'STR' | 'Biyopsi'>('Yok');
  const [meningiomaSimpson, setMeningiomaSimpson] = useState<'I-III' | 'IV-V'>('I-III');
  const [cnsKps, setCnsKps] = useState<string>('90');
  const [gbmPerformance, setGbmPerformance] = useState<'Iyi_ECOG_0_1' | 'Duskun_Yasli'>('Iyi_ECOG_0_1');
  const [meningiomaGrade, setMeningiomaGrade] = useState<'Grade_1' | 'Grade_2' | 'Grade_3'>('Grade_1');

  // ==========================================
  // 7. JİNEKOLOJİ ALT BAŞLIKLARI (SERVİKS, ENDOMETRİYUM, OVER, VAJEN, VULVA)
  // ==========================================
  const [gynSite, setGynSite] = useState<'Serviks' | 'Endometriyum' | 'Over_Tuba' | 'Vajen' | 'Vulva'>('Serviks');
  const [cervixScenario, setCervixScenario] = useState<'Definitif_KRT' | 'Adjuvan_Peters' | 'Adjuvan_Sedlis'>('Definitif_KRT');
  const [endoRisk, setEndoRisk] = useState<'Low' | 'Intermediate' | 'High_Intermediate' | 'High'>('High_Intermediate');
  const [ovaryScenario, setOvaryScenario] = useState<'Oligometastatik_SBRT' | 'Palyatif_Kitle_Agri'>('Oligometastatik_SBRT');
  const [vulvaScenario, setVulvaScenario] = useState<'Adjuvan_Cerrahi_Sonrasi' | 'Inoperabl_Lokal_Ileri'>('Adjuvan_Cerrahi_Sonrasi');

  // ==========================================
  // 8. KEMİK & SARKOM ALT BAŞLIKLARI (YDS, OSTEOSARKOM, EWING, KONDROSARKOM, KORDOMA, GCTB)
  // ==========================================
  const [sarcomaSubtype, setSarcomaSubtype] = useState<'Yumusak_Doku' | 'Osteosarkom' | 'Ewing' | 'Kondrosarkom' | 'Kordoma' | 'GCTB' | 'DFSP'>('Yumusak_Doku');
  const [dfspStatus, setDfspStatus] = useState<'R0' | 'R1' | 'Unresectable'>('R1');
  const [sarcomaSurgery, setSarcomaSurgery] = useState<'Preop' | 'Postop_R0' | 'Postop_R1'>('Preop');
  const [osteoScenario, setOsteoScenario] = useState<'Marjin_Pozitif_R1_R2' | 'Inoperabl_Aksiyel_Pelvis' | 'Cerrahi_R0_Takip'>('Marjin_Pozitif_R1_R2');
  const [ewingIntent, setEwingIntent] = useState<'Definitif_RT' | 'Postop_R1'>('Definitif_RT');

  // ==========================================
  // 9. CİLT RİSK FAKTÖRLERİ
  // ==========================================
  const [skinHistology, setSkinHistology] = useState<'BCC' | 'SCC' | 'Melanom' | 'Merkel'>('SCC');
  const [skinMargin, setSkinMargin] = useState<'Negatif' | 'Pozitif' | 'Rezeke_Edilemez'>('Negatif');
  const [skinDepthMm, setSkinDepthMm] = useState<string>('4');
  const [skinPerineuralInvasion, setSkinPerineuralInvasion] = useState<boolean>(false);
  const [skinBoneInvasion, setSkinBoneInvasion] = useState<boolean>(false);

  // ==========================================
  // 10. HEMATOLOJİK
  // ==========================================
  const [hematologicSubtype, setHematologicSubtype] = useState<'Hodgkin' | 'DLBCL' | 'Plasmacytoma' | 'Myeloma'>('Hodgkin');
  const [lymphomaResponse, setLymphomaResponse] = useState<'Tam_Yanit' | 'Parsiyel_Rezidü'>('Tam_Yanit');
  const [myelomaFractionation, setMyelomaFractionation] = useState<'TekFx' | '20Gy' | '30Gy'>('TekFx');

  // ==========================================
  // 11. PEDİATRİK & 12. PALYATİF
  // ==========================================
  const [pediatricSubtype, setPediatricSubtype] = useState<'Medulloblastom' | 'Wilms' | 'Neuroblastom' | 'Ewing'>('Medulloblastom');
  const [pediatricRisk, setPediatricRisk] = useState<'Standart' | 'Yuksek'>('Standart');
  const [wilmsStage, setWilmsStage] = useState<'Evre_I_II' | 'Evre_III_Anaplazi'>('Evre_I_II');
  const [wilmsWholeAbdomen, setWilmsWholeAbdomen] = useState<boolean>(false);
  const [palliativeIntent, setPalliativeIntent] = useState<'Agri' | 'Kord_Basisi' | 'Kanama'>('Agri');

  // Modal ve Kopyalama State'leri
  const [showGuidelineModal, setShowGuidelineModal] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);
  const [selectedSchemeId, setSelectedSchemeId] = useState<string>('');
  const [isAiOpen, setIsAiOpen] = useState<boolean>(false);
  const [copiedPrompt, setCopiedPrompt] = useState<boolean>(false);

  // Dinamik TNM Anahtarı
  const currentTnmKey = useMemo(() => {
    if (selectedOrgan === 'thorax') return `thorax-${thoraxSubtype}`;
    if (selectedOrgan === 'gynecology') return `gynecology-${gynSite}`;
    if (selectedOrgan === 'bone-sarcoma') return `bone-sarcoma-${sarcomaSubtype}`;
    if (selectedOrgan === 'head-neck') return `head-neck-${hnSubsite}`;
    if (selectedOrgan === 'cns') return `cns-${cnsSubtype}`;
    if (selectedOrgan === 'gis') return `gis-${gisOrgan}`;
    if (selectedOrgan === 'prostate') return `prostate-${gusSubtype}`;
    if (selectedOrgan === 'skin') return `skin-${skinHistology}`;
    if (selectedOrgan === 'breast') {
      if (breastHistology === 'Duktal Karsinoma In Situ (DCIS)') return 'breast-dcis';
      if (breastHistology === 'Malign Filloides Tümörü') return 'breast-phyllodes';
      return 'breast-breast';
    }
    if (selectedOrgan === 'hematologic') return `hematologic-${hematologicSubtype}`;
    if (selectedOrgan === 'pediatric') return `pediatric-${pediatricSubtype}`;
    return selectedOrgan;
  }, [selectedOrgan, thoraxSubtype, gynSite, sarcomaSubtype, hnSubsite, cnsSubtype, gisOrgan, gusSubtype, breastHistology, hematologicSubtype, pediatricSubtype, skinHistology]);

  const currentTNM = TNM_DATABASE[currentTnmKey] || TNM_DATABASE[selectedOrgan] || TNM_DATABASE['thorax-nsclc'];
  const prostateRiskLabel = useMemo(() => {
    const primary = Number.parseInt(gleasonPrimary, 10) || 3;
    const secondary = Number.parseInt(gleasonSecondary, 10) || 4;
    const score = primary + secondary;
    const psa = Number.parseFloat(psaLevel) || 0;
    const cores = Number.parseFloat(positiveCorePercent) || 0;
    if (selectedN === 'N1') return 'N1';
    if (hasSVI || selectedT === 'T4' || primary === 5 || (selectedT === 'T3b' && (score >= 8 || psa > 20))) return 'Çok Yüksek';
    if (score >= 8 || psa > 20 || selectedT === 'T3a' || selectedT === 'T3b' || hasECE) return 'Yüksek';
    const intermediateFactors = Number(selectedT === 'T2b' || selectedT === 'T2c') + Number(score === 7) + Number(psa >= 10 && psa <= 20);
    if (intermediateFactors === 0) return 'Düşük';
    return primary >= 4 || cores >= 50 || intermediateFactors > 1 ? 'Orta-Unfavorable' : 'Orta-Favorable';
  }, [gleasonPrimary, gleasonSecondary, psaLevel, positiveCorePercent, selectedN, selectedT, hasSVI, hasECE]);

  const eContourSubsite = [
    currentTnmKey,
    selectedOrgan === 'palliative' ? palliativeIntent : '',
    selectedOrgan === 'benign' ? selectedSubsite : '',
  ].filter(Boolean).join(' ');
  const eContourRiskCategory = selectedOrgan === 'prostate'
    ? prostateRiskLabel
    : selectedOrgan === 'gynecology' && gynSite === 'Endometriyum'
      ? endoRisk
      : selectedOrgan === 'breast' && (selectedN === 'N2' || selectedN === 'N3')
        ? 'high'
        : undefined;
  const eContourSurgeryStatus = selectedOrgan === 'thorax'
    ? thoraxSurgeryStatus
    : selectedOrgan === 'breast'
      ? breastSurgery
      : selectedOrgan === 'bone-sarcoma'
        ? sarcomaSurgery
        : undefined;
  const eContour = getAdaptiveEContour(
    selectedOrgan,
    eContourSubsite,
    selectedT,
    selectedN,
    selectedM,
    eContourRiskCategory,
    eContourSurgeryStatus,
  );

  // Organ Değişimi
  const handleOrganChange = (newOrgan: OrganId) => {
    setSelectedOrgan(newOrgan);
    setSelectedSchemeId('');
    let key = newOrgan as string;
    if (newOrgan === 'thorax') key = `thorax-${thoraxSubtype}`;
    if (newOrgan === 'gynecology') key = `gynecology-${gynSite}`;
    if (newOrgan === 'bone-sarcoma') key = `bone-sarcoma-${sarcomaSubtype}`;
    if (newOrgan === 'head-neck') key = `head-neck-${hnSubsite}`;
    if (newOrgan === 'cns') key = `cns-${cnsSubtype}`;
    if (newOrgan === 'gis') key = `gis-${gisOrgan}`;
    if (newOrgan === 'prostate') key = `prostate-${gusSubtype}`;
    if (newOrgan === 'skin') key = `skin-${skinHistology}`;
    if (newOrgan === 'breast') key = breastHistology === 'Duktal Karsinoma In Situ (DCIS)' ? 'breast-dcis' : breastHistology === 'Malign Filloides Tümörü' ? 'breast-phyllodes' : 'breast-breast';
    if (newOrgan === 'hematologic') key = `hematologic-${hematologicSubtype}`;
    if (newOrgan === 'pediatric') key = `pediatric-${pediatricSubtype}`;

    const db = TNM_DATABASE[key] || TNM_DATABASE[newOrgan] || TNM_DATABASE['thorax-nsclc'];
    if (db && db.T.length > 0) setSelectedT(db.T[0].code);
    if (db && db.N.length > 0) setSelectedN(db.N[0].code);
    if (db && db.M.length > 0) setSelectedM(db.M[0].code);
  };

  // Alt Başlık Değişimi
  const handleSubsiteChange = (subKey: string) => {
    setSelectedSchemeId('');
    const db = TNM_DATABASE[subKey] || currentTNM;
    if (db && db.T.length > 0) setSelectedT(db.T[0].code);
    if (db && db.N.length > 0) setSelectedN(db.N[0].code);
    if (db && db.M.length > 0) setSelectedM(db.M[0].code);
  };

  const handleTnmSelection = (axis: 'T' | 'N' | 'M', code: string) => {
    if (axis === 'T') {
      setSelectedT(code);
      if (selectedOrgan === 'cns' && cnsSubtype === 'meningioma') {
        const grade = parseOption(code, ['Grade-1', 'Grade-2', 'Grade-3'] as const);
        if (grade === 'Grade-1') setMeningiomaGrade('Grade_1');
        if (grade === 'Grade-2') setMeningiomaGrade('Grade_2');
        if (grade === 'Grade-3') setMeningiomaGrade('Grade_3');
      }
      if (selectedOrgan === 'pediatric' && pediatricSubtype === 'Medulloblastom') {
        const risk = parseOption(code, ['Standart', 'Yuksek'] as const);
        if (risk) setPediatricRisk(risk);
      }
      if (selectedOrgan === 'pediatric' && pediatricSubtype === 'Wilms') {
        if (code === 'I-II') setWilmsStage('Evre_I_II');
        if (code === 'III') setWilmsStage('Evre_III_Anaplazi');
      }
      return;
    }
    if (axis === 'N') {
      setSelectedN(code);
      return;
    }
    setSelectedM(code);
  };

  // ==========================================
  // 3. REAKTİF KLİNİK KARAR MOTORU (12 ORGAN VE TÜM ALT BAŞLIKLAR)
  // ==========================================
  const evaluatedDecision: EvaluatedDecision = useMemo(() => {
    if (selectedOrgan === 'benign') {
      const selectedClinicalOption = BENIGN_CLINICAL_OPTIONS[selectedSubsite]?.find(option => option.value === benignClinicalStatus);
      const clinicalContext = selectedClinicalOption?.label || 'Klinik durum değerlendirmesi';
      const makeScheme = (
        id: string,
        name: string,
        totalDoseGy: number,
        fractionCount: number,
        fractionDoseGy: number,
        technique: string,
        indication: string,
        target: string,
        oars: OARConstraint[] = [],
        alphaBeta = 3,
      ): DoseScheme => ({
        id,
        name,
        tag: 'Benign RT',
        totalDoseGy,
        fractionCount,
        fractionDoseGy,
        alphaBeta,
        technique,
        indication,
        targetVolumes: totalDoseGy > 0
          ? [{ name: 'CTV / PTV', doseGy: totalDoseGy, marginMm: 'Anatomik klinik marjin', anatomical: target }]
          : [],
        oars,
        evidence: 'DEGRO / ESTRO benign radyoterapi önerileri; hasta bazında klinik doğrulama gerekir.',
      });
      let primaryScheme: DoseScheme;
      let alternativeSchemes: DoseScheme[] = [];
      let statusText: string;
      let targetVolumeBadge = 'Hedef: Klinik hedef hacim';
      let techniqueBadge = 'Teknik: Klinik endikasyona göre planlama';
      const noNodalDisease = 'Nodal: Uygulanmaz (Benign)';

      if (selectedSubsite === 'benign-ho') {
        const late = benignClinicalStatus === 'late';
        primaryScheme = makeScheme(
          'benign-ho-7gy',
          late ? 'RT önerilmez (>72 saat)' : '7 Gy / 1 fx (Heterotopik Ossifikasyon Profilaksisi)',
          late ? 0 : 7,
          late ? 0 : 1,
          late ? 0 : 7,
          'Tek fraksiyon konformal RT',
          `${clinicalContext}. Cerrahi yatak ve periartiküler yumuşak doku hedeflenir; eklem aralığı hariç tutulur. Preoperatif ilk 4 saat veya postoperatif 24-48 saat içinde uygulanmalıdır; >72 saatte etkinlik beklenmez.`,
          'Cerrahi yatak ve periartiküler yumuşak doku (eklem aralığı hariç)',
          [{ organ: 'Gonad / komşu eklem', metric: 'Doz', limit: 'Mümkün olduğunca düşük', source: 'DEGRO' }],
        );
        alternativeSchemes = late ? [primaryScheme] : [primaryScheme, makeScheme(
          'benign-ho-10gy-5fx', '10 Gy / 5 fx (Alternatif Profilaksi)', 10, 5, 2,
          'Konformal 3D-CRT', `${clinicalContext}. Zamanlama cerrahi ekiple koordine edilmelidir.`,
          'Cerrahi yatak ve periartiküler yumuşak doku (eklem aralığı hariç)',
          [{ organ: 'Gonad / komşu eklem', metric: 'Doz', limit: 'Mümkün olduğunca düşük', source: 'DEGRO' }],
        )];
        statusText = late ? 'GEÇ BAŞVURU: >72 SAATTE HO PROFİLAKSİSİNDEN FAYDA BEKLENMEZ' : 'ENDİKE: UYGUN ZAMAN PENCERESİNDE HO PROFİLAKSİSİ';
        targetVolumeBadge = 'Hedef: Cerrahi Yatak / Periartiküler Yumuşak Doku';
        techniqueBadge = 'Teknik: Konformal 3D-CRT';
      } else if (selectedSubsite === 'benign-keloid') {
        const late = benignClinicalStatus === 'late';
        primaryScheme = makeScheme(
          'benign-keloid-12gy', late ? 'RT zamanlaması yeniden değerlendirilmelidir' : '12 Gy / 3 fx (Keloid Eksizyon Sonrası)',
          late ? 0 : 12, late ? 0 : 3, late ? 0 : 4,
          'Yüzeysel elektron veya brakiterapi',
          `${clinicalContext}. Cerrahi eksizyon sonrası RT ideal olarak ilk 24 saat içinde başlatılmalıdır.`,
          'Eksizyon yatağı ve keloid skarı',
          [{ organ: 'Cilt / çevre doku', metric: 'Doz', limit: 'Hedef dışı dokularda en aza indir', source: 'ESTRO' }],
        );
        alternativeSchemes = late ? [primaryScheme] : [primaryScheme, makeScheme(
          'benign-keloid-18gy', '18 Gy / 3 fx (Yüksek Riskli Nüks)', 18, 3, 6,
          'Yüzeysel elektron veya brakiterapi', 'Yüksek nüks riskinde uzman değerlendirmesiyle fraksiyone RT.',
          'Eksizyon yatağı ve keloid skarı',
          [{ organ: 'Cilt / çevre doku', metric: 'Doz', limit: 'Hedef dışı dokularda en aza indir', source: 'ESTRO' }],
        )];
        statusText = late ? 'ZAMANLAMA UYGUN DEĞİL: KONSEYDE TEDAVİ YAKLAŞIMINI DEĞERLENDİRİN' : 'ENDİKE: EKSİZYON SONRASI ERKEN KELOİD PROFİLAKSİSİ';
        targetVolumeBadge = 'Hedef: Cerrahi Yatak (<24 saat)';
        techniqueBadge = 'Teknik: Yüzeysel Elektron / Brakiterapi';
      } else if (selectedSubsite === 'benign-dupuytren' || selectedSubsite === 'benign-ledderhose') {
        const advanced = benignClinicalStatus === 'advanced';
        const label = selectedSubsite === 'benign-dupuytren' ? 'Dupuytren' : 'Ledderhose';
        primaryScheme = makeScheme(
          `benign-${label.toLowerCase()}-30gy`,
          advanced ? 'RT rutin önerilmez - ileri hastalıkta cerrahi değerlendirme' : '30 Gy / 10 fx (Split-Course)',
          advanced ? 0 : 30, advanced ? 0 : 10, advanced ? 0 : 3,
          'Elektron / ortovoltaj; 5 fx + 6-8 hafta ara + 5 fx',
          `${clinicalContext}. Erken nodül/kordon evresinde: Faz 1 5 × 3 Gy = 15 Gy, 6-8 hafta ara, ardından Faz 2 5 × 3 Gy = 15 Gy.`,
          `${label} nodül ve kordonları; eklem aralıkları korunur`,
          [{ organ: 'Cilt / el-ayak eklemleri', metric: 'Doz', limit: 'Klinik planlama ile korunur', source: 'DEGRO' }],
        );
        alternativeSchemes = [primaryScheme];
        statusText = advanced ? 'İLERİ KONTRAKTÜR: CERRAHİ ÖNCELİKLİ, RT YARARI SINIRLI' : 'ERKEN NODÜL / KORDON: SPLIT-COURSE RT DEĞERLENDİR';
        targetVolumeBadge = `Hedef: ${label} Nodül ve Kordonlar`;
        techniqueBadge = 'Teknik: Elektron / Ortovoltaj';
      } else if (['benign-topuk-dikeni', 'benign-epikondilit', 'benign-omuz', 'benign-artroz'].includes(selectedSubsite)) {
        const repeat = benignClinicalStatus === 'repeat';
        const sites: Record<string, string> = {
          'benign-topuk-dikeni': 'Plantar fasya / kalkaneus yapışma alanı',
          'benign-epikondilit': 'Lateral veya medial epikondil ve tendon yapışma alanı',
          'benign-omuz': 'Omuz periartiküler yumuşak dokuları',
          'benign-artroz': 'Semptomatik eklem çevresi; eklem aralığı korunur',
        };
        primaryScheme = makeScheme(
          repeat ? `benign-${selectedSubsite}-repeat-6gy` : `benign-${selectedSubsite}-3gy`,
          repeat ? '6 Gy / 6 fx (İkinci Seri)' : '3 Gy / 6 fx (DEGRO Düşük Doz)',
          repeat ? 6 : 3, 6, repeat ? 1 : 0.5,
          'Konformal düşük doz RT; haftada 2-3 fraksiyon',
          `${clinicalContext}. Refrakter semptomlarda 6-12 hafta sonra klinik değerlendirme ve gerekirse ikinci seri düşünülür.`,
          sites[selectedSubsite],
          [{ organ: 'Cilt / komşu eklem', metric: 'Doz', limit: 'Düşük doz protokolü', source: 'DEGRO' }],
        );
        alternativeSchemes = [primaryScheme];
        statusText = repeat ? 'PERSISTAN SEMPTOM: 6-12 HAFTA SONRA İKİNCİ SERİ DEĞERLENDİR' : 'ENDİKE: REFRAKTER DEJENERATİF / ENFLAMATUAR SEMPTOMDA DÜŞÜK DOZ RT';
        targetVolumeBadge = `Hedef: ${sites[selectedSubsite]}`;
        techniqueBadge = 'Teknik: Konformal Düşük Doz RT';
      } else if (selectedSubsite === 'benign-graves') {
        const inactive = benignClinicalStatus === 'fibrotic';
        primaryScheme = makeScheme(
          'benign-graves-20gy', inactive ? 'İnaktif fibrotik hastalıkta RT rutin önerilmez' : '20 Gy / 10 fx (Graves Orbitopati)',
          inactive ? 0 : 20, inactive ? 0 : 10, inactive ? 0 : 2,
          'IMRT / VMAT; lens koruması',
          `${clinicalContext}. Aktif orta-ağır orbitopatide 2 haftada uygulanır.`,
          'Orbital yumuşak dokular ve ekstraoküler kaslar',
          [{ organ: 'Lens', metric: 'Dmax', limit: '<5 Gy', source: 'DEGRO' }, { organ: 'Retina', metric: 'Dmean', limit: '<30 Gy', source: 'DEGRO' }],
          3,
        );
        alternativeSchemes = [primaryScheme];
        statusText = inactive ? 'İN-AKTİF FİBROZİS: RT YARARI BEKLENMEZ' : 'ENDİKE: AKTİF GRAVES ORBİTOPATİSİNDE ORBİTAL RT';
        targetVolumeBadge = 'Hedef: Bilateral Orbital Yumuşak Dokular';
        techniqueBadge = 'Teknik: IMRT / VMAT, Lens Koruması';
      } else if (selectedSubsite === 'benign-trigeminal') {
        primaryScheme = makeScheme(
          'benign-trigeminal-80gy', '80 Gy / 1 fx (Trigeminal Nevralji SRS)', 80, 1, 80,
          'Stereotaktik radyocerrahi (SRS)',
          `${clinicalContext}. Maksimum tolere edilebilir doz REZ bölgesine odaklanır.`,
          'Trigeminal sinirin kök giriş bölgesi (REZ)',
          [{ organ: 'Beyin sapı yüzeyi', metric: 'Dmax', limit: '<12 Gy', source: 'SRS konsensüsü' }],
          2,
        );
        alternativeSchemes = [primaryScheme, { ...primaryScheme, id: 'benign-trigeminal-70gy', name: '70 Gy / 1 fx (Trigeminal Nevralji SRS)', totalDoseGy: 70, fractionDoseGy: 70 }];
        statusText = 'ENDİKE: MEDİKAL TEDAVİYE DİRENÇLİ OLGUDA SRS DEĞERLENDİR';
        targetVolumeBadge = 'Hedef: Trigeminal REZ Bölgesi';
        techniqueBadge = 'Teknik: Stereotaktik Radyocerrahi';
      } else if (selectedSubsite === 'benign-schwannom') {
        const large = benignClinicalStatus === 'large';
        primaryScheme = makeScheme(
          large ? 'benign-schwannom-fsrt' : 'benign-schwannom-srs',
          large ? '50.4 Gy / 28 fx (Vestibüler Schwannom FSRT)' : '12.5 Gy / 1 fx (Vestibüler Schwannom SRS)',
          large ? 50.4 : 12.5, large ? 28 : 1, large ? 1.8 : 12.5,
          large ? 'Fraksiyone stereotaktik RT' : 'Stereotaktik radyocerrahi (SRS)',
          `${clinicalContext}. İşitme, tümör hacmi ve beyin sapı komşuluğu multidisipliner değerlendirilmelidir.`,
          'Vestibüler schwannom hedefi',
          [{ organ: 'Koklea', metric: 'Dmean', limit: '<4 Gy (SRS)', source: 'SRS konsensüsü' }, { organ: 'Beyin sapı', metric: 'Dmax', limit: 'Planlama protokolü içinde', source: 'QUANTEC / HyTEC' }],
          3,
        );
        alternativeSchemes = [primaryScheme, { ...primaryScheme, id: large ? 'benign-schwannom-srs-alt' : 'benign-schwannom-fsrt-alt', name: large ? '12-13 Gy / 1 fx (uygun küçük hedefte SRS)' : '50.4 Gy / 28 fx (FSRT)', totalDoseGy: large ? 12.5 : 50.4, fractionCount: large ? 1 : 28, fractionDoseGy: large ? 12.5 : 1.8 }];
        statusText = 'ENDİKE: VESTİBÜLER SCHWANNOMDA SRS / FSRT DEĞERLENDİR';
        targetVolumeBadge = 'Hedef: Vestibüler Schwannom';
        techniqueBadge = large ? 'Teknik: Fraksiyone Stereotaktik RT' : 'Teknik: SRS';
      } else {
        const highGrade = benignClinicalStatus === 'high-grade';
        primaryScheme = makeScheme(
          'benign-avm-20gy', '20 Gy / 1 fx (AVM SRS)', 20, 1, 20,
          'Stereotaktik radyocerrahi (SRS)',
          `${clinicalContext}. Marjin dozu nidus hacmi ve Spetzler-Martin / Pollock skoruna göre 16-24 Gy aralığında bireyselleştirilir.`,
          'AVM nidusu',
          [{ organ: 'Beyin sapı / optik yol', metric: 'Dmax', limit: 'Konum ve protokole göre kısıtla', source: 'HyTEC / SRS konsensüsü' }],
          2,
        );
        alternativeSchemes = [primaryScheme, { ...primaryScheme, id: 'benign-avm-16gy', name: '16 Gy / 1 fx (AVM SRS)', totalDoseGy: 16, fractionDoseGy: 16 }];
        statusText = highGrade ? 'KOMPLEKS AVM: SRS DOZU / FRAKSİYONASYON UZMAN KONSEYİNDE BELİRLENMELİ' : 'ENDİKE: UYGUN AVM NİDUSUNDA SRS DEĞERLENDİR';
        targetVolumeBadge = 'Hedef: AVM Nidusu';
        techniqueBadge = 'Teknik: Stereotaktik Radyocerrahi';
      }

      return {
        statusText,
        badgeClass: primaryScheme.totalDoseGy > 0 ? 'bg-emerald-50 text-emerald-800 border-emerald-300' : 'bg-amber-50 text-amber-800 border-amber-300',
        primaryScheme,
        alternativeSchemes,
        targetVolumeBadge,
        nodalStatusBadge: noNodalDisease,
        techniqueBadge,
      };
    }

    // ------------------------------------------
    // 1. TORAKS
    // ------------------------------------------
    if (selectedOrgan === 'thorax') {
      // 1.A. KHAK (Küçük Hücreli Akciğer Kanseri)
      if (thoraxSubtype === 'sclc') {
        if (sclcStage === 'Sinirli') {
          const isBid = sclcTiming === 'Erken_BID_45Gy';
          const sclcChest: DoseScheme = {
            id: isBid ? 'sclc-turrisi-45' : 'sclc-convert-60',
            name: isBid ? '45 Gy / 30 fx BID (Turrisi Erken Günde İki Kez)' : '60-66 Gy / 30-33 fx QD (CONVERT Günlük Standart)',
            tag: isBid ? '⚡ Turrisi Altın Standart' : '🎯 CONVERT Günlük',
            totalDoseGy: isBid ? 45 : 60,
            fractionCount: isBid ? 30 : 30,
            fractionDoseGy: isBid ? 1.5 : 2.0,
            alphaBeta: 10,
            technique: 'IMRT / VMAT (Erken Eşzamanlı KRT - KT Kür 1 veya 2 ile)',
            indication: 'Sınırlı Evre KHAK: Kemoterapi (Sisplatin + Etopozid) ile eşzamanlı erken torasik RT sağkalım avantajı sağlar (Kategori 1).',
            targetVolumes: [
              { name: 'GTV_T & Nodal', doseGy: isBid ? 45 : 60, marginMm: '0 mm', anatomical: 'Pre-KT primer kitle ve tutulu mediastinal/hiler lenf nodları' },
              { name: 'CTV_Involved', doseGy: isBid ? 45 : 60, marginMm: 'GTV + 5 mm', anatomical: 'Yalnızca tutulu alan mikroskobik yayılımı (Elektif nodal önerilmez)' },
              { name: 'PTV', doseGy: isBid ? 45 : 60, marginMm: 'CTV + 5 mm', anatomical: 'Solunum ve set-up zarfı' },
            ],
            oars: [
              { organ: 'Bilateral Akciğer', metric: 'V20Gy', limit: '< 30%', source: 'CONVERT / Turrisi' },
              { organ: 'Spinal Kord', metric: 'Dmax', limit: '< 45 Gy', source: 'QUANTEC' },
              { organ: 'Özofagus Mean', metric: 'Dmean', limit: '< 34 Gy', source: 'QUANTEC' },
            ],
            systemicTherapy: 'Eşzamanlı Sisplatin (60 mg/m2 d1) + Etopozid (120 mg/m2 d1-3) q3w x 4 kür.',
            evidence: 'Turrisi et al. (NEJM 1999), CONVERT Trial (Lancet Oncol 2017), NCCN v1.2025 SCLC',
          };

          const sclcPCI: DoseScheme = {
            id: 'sclc-pci-25',
            name: '25 Gy / 10 fx (Profilaktik Kraniyal Işınlama - PCI)',
            tag: '🧠 Standart PCI (HA-PCI)',
            totalDoseGy: 25,
            fractionCount: 10,
            fractionDoseGy: 2.5,
            alphaBeta: 10,
            technique: 'VMAT (Hipokampus Koruma - HA-PCI Tercih Edilir)',
            indication: 'Torasik KRT sonrası tam/kısmi yanıt veren Sınırlı Evre KHAK olgularında beyin metastazı riskini %50 azaltır ve sağkalımı uzatır.',
            targetVolumes: [
              { name: 'PTV_Brain', doseGy: 25, marginMm: '3 mm', anatomical: 'Tüm beyin parankimi (Hipokampus nörogenezis zonu hariç)' },
            ],
            oars: [
              { organ: 'Hipokampus Dmax', metric: 'Dmax', limit: '< 16 Gy (D100% < 9 Gy)', source: 'RTOG 0933 / NRG CC003' },
              { organ: 'Optik Kiazma', metric: 'Dmax', limit: '< 25 Gy', source: 'QUANTEC' },
            ],
            systemicTherapy: 'Sistemik KRT tamamlandıktan 3-4 hafta sonra başlanır.',
            evidence: 'Auperin et al. Meta-analysis (NEJM), NRG CC003',
          };

          return {
            statusText: 'ENDİKE: SINIRLI EVRE KHAK ERKEN EŞZAMANLI KRT ± PCI',
            badgeClass: 'bg-emerald-50 text-emerald-800 border-emerald-300 shadow-[0_0_15px_rgba(16,185,129,0.25)]',
            primaryScheme: sclcChest,
            alternativeSchemes: [sclcChest, sclcPCI],
          };
        } else {
          // Yaygın Evre
          const crest: DoseScheme = {
            id: 'sclc-crest-30',
            name: '30 Gy / 10 fx (CREST Torasik Konsolidasyon RT)',
            tag: '🛡️ CREST Konsolidasyon',
            totalDoseGy: 30,
            fractionCount: 10,
            fractionDoseGy: 3.0,
            alphaBeta: 10,
            technique: '3D-CRT / IMRT',
            indication: 'Yaygın Evre KHAK: Sistemik kemo-immünoterapiye (EP + Atezolizumab/Durvalumab) yanıt veren olgularda rezidüel torasik kitleye konsolidasyon RT 2 yıllık sağkalımı artırır.',
            targetVolumes: [
              { name: 'GTV_Residue', doseGy: 30, marginMm: '0 mm', anatomical: 'Post-KT rezidüel akciğer kitlesi ve tutulu nodlar' },
              { name: 'PTV', doseGy: 30, marginMm: 'GTV + 8 mm', anatomical: 'Planlanan hedef alan' },
            ],
            oars: [
              { organ: 'Bilateral Akciğer', metric: 'V20Gy', limit: '< 25%', source: 'CREST Trial' },
              { organ: 'Spinal Kord', metric: 'Dmax', limit: '< 30 Gy', source: 'QUANTEC' },
            ],
            systemicTherapy: 'İmmünoterapi (Atezolizumab veya Durvalumab) idamesine RT sonrası devam edilir.',
            evidence: 'CREST Faz III Çalışması (Slotman et al. Lancet 2015)',
          };
          return {
            statusText: 'ÖNERİLİR: YAYGIN EVRE YANITLI HASTADA TORASİK KONSOLİDASYON RT',
            badgeClass: 'bg-indigo-50 text-indigo-800 border-indigo-300',
            primaryScheme: crest,
            alternativeSchemes: [crest],
          };
        }
      }

      // 1.B. TİMOMA VE TİMİK KARSİNOM
      if (thoraxSubtype === 'thymoma') {
        if (thymomaStage === 'Masaoka_I' && thymomaMargin === 'R0') {
          const noRt: DoseScheme = {
            id: 'thymoma-obs',
            name: 'Radyoterapi Önerilmez (İzlem)',
            tag: '👁️ Yalnızca İzlem',
            totalDoseGy: 0,
            fractionCount: 0,
            fractionDoseGy: 0,
            alphaBeta: 10,
            technique: 'Klinik ve Toraks BT İzlemi',
            indication: 'Tam rezeke (R0) Masaoka Evre I timomalarda adjuvan radyoterapi nüks veya sağkalım avantajı sağlamaz.',
            targetVolumes: [],
            oars: [],
            evidence: 'ITMIG & NCCN Guidelines for Thymoma and Thymic Carcinoma',
          };
          return {
            statusText: 'ENDİKE DEĞİLDİR: R0 EVRE I TİMOMADA PORT GEREKMEZ (İZLEM)',
            badgeClass: 'bg-slate-100 text-slate-700 border-slate-300',
            primaryScheme: noRt,
            alternativeSchemes: [noRt],
          };
        } else {
          const dose = thymomaMargin === 'R1' ? 54 : thymomaStage === 'Masaoka_II' ? 50 : 60;
          const thymomaRt: DoseScheme = {
            id: 'thymoma-port-50',
            name: `${dose} Gy / ${Math.round(dose / 2)} fx (Adjuvan / Definitif Mediastinal RT)`,
            tag: '🛡️ PORT Standardı',
            totalDoseGy: dose,
            fractionCount: Math.round(dose / 2),
            fractionDoseGy: 2.0,
            alphaBeta: 10,
            technique: 'IMRT / VMAT (Kalp ve Akciğer Koruma)',
            indication: 'Masaoka Evre II-III veya R1 cerrahi sınır pozitifliği taşıyan timoma ve timik karsinomlarda lokal nüksü önler.',
            targetVolumes: [
              { name: 'CTV_Bed', doseGy: dose, marginMm: 'Anatomik', anatomical: 'Tümör yatağı, plevral adezyon bölgeleri ve anterior mediasten' },
              { name: 'PTV', doseGy: dose, marginMm: 'CTV + 5 mm', anatomical: 'Planlama hedef hacmi' },
            ],
            oars: [
              { organ: 'Kalp Dmean', metric: 'Dmean', limit: '< 20 Gy', source: 'QUANTEC' },
              { organ: 'Akciğer V20Gy', metric: 'V20Gy', limit: '< 25%', source: 'QUANTEC' },
            ],
            evidence: 'ITMIG Retrospective Studies, NCCN v1.2025',
          };
          return {
            statusText: 'ENDİKE: POSTOPERATİF ADJUVAN MEDİASTİNAL RT (PORT)',
            badgeClass: 'bg-emerald-50 text-emerald-800 border-emerald-300',
            primaryScheme: thymomaRt,
            alternativeSchemes: [thymomaRt],
          };
        }
      }

      // 1.C. MALİGN PLEVRAL MEZOTELYOMA
      if (thoraxSubtype === 'mesothelioma') {
        const mesoPal: DoseScheme = {
          id: 'meso-pal-30',
          name: '30 Gy / 10 fx (Palyatif Semptom Kontrolü)',
          tag: '🛡️ Palyatif Plevral RT',
          totalDoseGy: 30,
          fractionCount: 10,
          fractionDoseGy: 3.0,
          alphaBeta: 10,
          technique: '3D-CRT / IMRT',
          indication: 'Göğüs duvarı ağrısı ve nefes darlığını palye etmek için uygulanır.',
          targetVolumes: [{ name: 'GTV_Pain', doseGy: 30, marginMm: '0 mm', anatomical: 'Ağrılı invaziv plevral kitle odağı' }],
          oars: [{ organ: 'Spinal Kord', metric: 'Dmax', limit: '< 30 Gy', source: 'QUANTEC' }],
          evidence: 'NCCN v1.2025 Mesothelioma Principles',
        };
        const mesoTract: DoseScheme = {
          id: 'meso-tract-21',
          name: '21 Gy / 3 fx (Girişim / Dren Yeri Proflaksisi)',
          tag: '⚠️ Girişim Yeri RT',
          totalDoseGy: 21,
          fractionCount: 3,
          fractionDoseGy: 7.0,
          alphaBeta: 10,
          technique: 'Elektron Demeti veya Yüzeyel Foton',
          indication: 'Torasentez ve dren giriş traktusunda tümör tohumlanmasını engellemek amacıyla uygulanır (Klinik tartışmalı).',
          targetVolumes: [{ name: 'PTV_Scar', doseGy: 21, marginMm: 'Skar + 10 mm', anatomical: 'Dren ve biyopsi skarları' }],
          oars: [{ organ: 'Akciğer', metric: 'Dmax', limit: '< 10 Gy', source: 'Klinik' }],
          evidence: 'SMART Trial, NCCN',
        };
        return {
          statusText: 'PALYATİF VEYA GİRİŞİM YERİ PROFLAKTİK RT',
          badgeClass: 'bg-indigo-50 text-indigo-800 border-indigo-300',
          primaryScheme: mesoIntent === 'Dren_Yeri' ? mesoTract : mesoPal,
          alternativeSchemes: [mesoPal, mesoTract],
        };
      }

      // 1.D. KHDAK (Küçük Hücreli Dışı Akciğer Kanseri)
      const isM1 = selectedM.startsWith('M1');
      const isLocallyAdvanced = selectedN === 'N2' || selectedN === 'N3' || selectedT === 'T3' || selectedT === 'T4';
      const isPostop = thoraxSurgeryStatus.startsWith('Postop');

      if (isM1) {
        if (selectedM === 'M1b') {
          const sbrtOligo: DoseScheme = {
            id: 'lung-oligo-sbrt',
            name: '50 Gy / 5 fx (SABR-COMET Oligometastaz SBRT)',
            tag: '🎯 SABR-COMET',
            totalDoseGy: 50,
            fractionCount: 5,
            fractionDoseGy: 10,
            alphaBeta: 10,
            technique: 'SBRT (4D-CT Entegre VMAT)',
            indication: 'Oligometastatik KHDAK (1-3 odak). Primer tümör ve metastazlara ablatif SBRT genel sağkalım avantajı sağlar.',
            targetVolumes: [
              { name: 'GTV_Oligo', doseGy: 50, marginMm: '0 mm', anatomical: 'Metastatik odak ve primer kitle' },
              { name: 'PTV_SBRT', doseGy: 50, marginMm: 'ITV + 4 mm', anatomical: 'Ablatif PTV hedefi' },
            ],
            oars: [
              { organ: 'Spinal Kord', metric: 'Dmax', limit: '< 25 Gy', source: 'AAPM TG-101' },
              { organ: 'Bilateral Akciğer', metric: 'V20Gy', limit: '< 15%', source: 'AAPM TG-101' },
            ],
            systemicTherapy: 'Sistemik Kemo-İmmünoterapi veya hedefe yönelik TKI devamlılığı.',
            evidence: 'SABR-COMET Trial (Lancet), Gomez et al.',
          };
          return {
            statusText: 'DEĞERLENDİRİLMELİ: OLİGOMETASTAZ ABLATİF SBRT (SABR-COMET)',
            badgeClass: 'bg-amber-50 text-amber-800 border-amber-300 shadow-[0_0_15px_rgba(245,158,11,0.25)]',
            primaryScheme: sbrtOligo,
            alternativeSchemes: [sbrtOligo],
          };
        }
        const pal: DoseScheme = {
          id: 'lung-pal-30',
          name: '30 Gy / 10 fx (Semptom Kontrolü Palyatif RT)',
          tag: '🛡️ Palyatif RT',
          totalDoseGy: 30,
          fractionCount: 10,
          fractionDoseGy: 3,
          alphaBeta: 10,
          technique: '3D-CRT / Konformal RT',
          indication: 'Yaygın polimetastatik hastalıkta primer tümöre ablatif RT sağkalımı artırmaz. Sistemik tedavi önceliklidir; RT hemoptizi/ağrı palyasyonuna yöneliktir.',
          targetVolumes: [{ name: 'GTV_Palyatif', doseGy: 30, marginMm: '0 mm', anatomical: 'Semptomatik obstrüktif kitle' }],
          oars: [{ organ: 'Spinal Kord', metric: 'Dmax', limit: '< 30 Gy', source: 'QUANTEC' }],
          systemicTherapy: 'Birinci basamak Kemo-İmmünoterapi (KEYNOTE-189/407).',
          evidence: 'NCCN v1.2025 Palyatif İlkeler',
        };
        return {
          statusText: 'PALYATİF / SİSTEMİK TEDAVİ ÖNCELİKLİ (SEMPTOMATİK RT)',
          badgeClass: 'bg-indigo-50 text-indigo-800 border-indigo-300',
          primaryScheme: pal,
          alternativeSchemes: [pal],
        };
      }

      if (isPostop && thoraxSurgeryStatus === 'Postop_R0' && (selectedN === 'N0' || selectedN === 'N1')) {
        const contra: DoseScheme = {
          id: 'lung-contra',
          name: 'Radyoterapi Önerilmez (İzlem)',
          tag: '⛔ KONTRENDİKE',
          totalDoseGy: 0,
          fractionCount: 0,
          fractionDoseGy: 0,
          alphaBeta: 10,
          technique: 'İzlem / Rutin BT Takibi',
          indication: 'R0 rezeke pN0-pN1 olgularda postoperatif radyoterapi (PORT) sağkalımı düşürür ve kardiyopulmoner mortaliteyi artırır. UYGULANMAMALIDIR.',
          targetVolumes: [],
          oars: [],
          evidence: 'PORT Meta-Analysis (Lancet), Lung-ART (Lancet Oncol 2022)',
        };
        return {
          statusText: 'ENDİKE DEĞİLDİR: PORT KONTRENDİKEDİR (LUNG-ART)',
          badgeClass: 'bg-rose-50 text-rose-800 border-rose-300 shadow-[0_0_15px_rgba(244,63,94,0.3)]',
          primaryScheme: contra,
          alternativeSchemes: [contra],
        };
      }

      if (isLocallyAdvanced) {
        const pacific: DoseScheme = {
          id: 'lung-pacific',
          name: '60 Gy / 30 fx (Eşzamanlı KRT + PACIFIC)',
          tag: '⚡ PACIFIC Standart',
          totalDoseGy: 60,
          fractionCount: 30,
          fractionDoseGy: 2,
          alphaBeta: 10,
          technique: 'IMRT / VMAT (Elektif Nodal Işınlama YAPILMAZ)',
          indication: 'Lokal ileri rezeke edilemez Evre III olgularda kesin eşzamanlı KRT standardı. KRT bitiminde progresyonsuz olgularda 12 aya kadar Durvalumab (Kategori 1).',
          targetVolumes: [
            { name: 'GTV_T & Nodal', doseGy: 60, marginMm: '0 mm', anatomical: 'Primer kitle + PET/biyopsi pozitif mediastinal nodlar' },
            { name: 'CTV_Involved', doseGy: 60, marginMm: 'GTV + 5-7 mm', anatomical: 'Yalnızca tutulu alan mikroskobik payı' },
            { name: 'PTV_Definitive', doseGy: 60, marginMm: 'CTV + 5 mm', anatomical: 'Solunum ve set-up zarfı' },
          ],
          oars: [
            { organ: 'Bilateral Akciğer', metric: 'V20Gy', limit: '< 30-35%', source: 'RTOG 0617' },
            { organ: 'Kalp Mean Doz', metric: 'Dmean', limit: '< 15 Gy', source: 'RTOG 0617 (OS Belirleyicisi)' },
            { organ: 'Spinal Kord', metric: 'Dmax', limit: '< 45-50 Gy', source: 'QUANTEC' },
          ],
          systemicTherapy: 'Eşzamanlı Sisplatin/Etopozid. KRT bitiminde 12 ay Durvalumab konsolidasyonu.',
          evidence: 'PACIFIC Faz III (NEJM 2017 & 2021), RTOG 0617',
        };
        const highDose: DoseScheme = { ...pacific, id: 'lung-high-66', name: '66 Gy / 33 fx (Yüksek Doz KRT)', totalDoseGy: 66, fractionCount: 33 };
        return {
          statusText: 'ENDİKE: DEFİNİTİF EŞZAMANLI KRT + PACIFIC DURVALUMAB',
          badgeClass: 'bg-emerald-50 text-emerald-800 border-emerald-300 shadow-[0_0_15px_rgba(16,185,129,0.25)]',
          primaryScheme: pacific,
          alternativeSchemes: [pacific, highDose],
        };
      }

      // Erken Evre SBRT
      let sbrt: DoseScheme;
      if (thoraxCentrality === 'Central') {
        sbrt = {
          id: 'lung-sbrt-50',
          name: '50 Gy / 5 fx (SBRT Santral No-Fly Zone)',
          tag: '⚠️ Santral SBRT',
          totalDoseGy: 50,
          fractionCount: 5,
          fractionDoseGy: 10,
          alphaBeta: 10,
          technique: 'SBRT (Risk-Adapte)',
          indication: 'PBT ≤2 cm komşu lezyonlar. Fatal hemoptizi ve bronşiyal fistülü önlemek için 5 fraksiyon standardı.',
          targetVolumes: [{ name: 'PTV_Central', doseGy: 50, marginMm: 'ITV + 4 mm', anatomical: 'Santral PTV' }],
          oars: [{ organ: 'Proksimal Bronş Ağacı', metric: 'Dmax', limit: '< 50 Gy', source: 'RTOG 0813' }],
          evidence: 'RTOG 0813 (Bezjak et al. JCO 2019)',
        };
      } else if (thoraxCentrality === 'UltraCentral') {
        sbrt = {
          id: 'lung-sbrt-60',
          name: '60 Gy / 12 fx (SBRT Ultrasantral SUNSET)',
          tag: '🛡️ Ultrasantral',
          totalDoseGy: 60,
          fractionCount: 12,
          fractionDoseGy: 5,
          alphaBeta: 10,
          technique: 'Hipofraksiyone SBRT',
          indication: 'Trakea veya özofagus ile direkt temas eden lezyonlar. 3-5 fraksiyonluk ablatif dozlar kontrendikedir.',
          targetVolumes: [{ name: 'PTV_Ultra', doseGy: 60, marginMm: 'ITV + 3 mm', anatomical: 'Koruyucu PTV' }],
          oars: [{ organ: 'Ana Bronş / Trakea', metric: 'Dmax', limit: '< 60 Gy', source: 'SUNSET Trial' }],
          evidence: 'SUNSET Trial',
        };
      } else {
        sbrt = {
          id: 'lung-sbrt-54',
          name: '54 Gy / 3 fx (SBRT Periferik Standart)',
          tag: '🎯 Periferik SBRT',
          totalDoseGy: 54,
          fractionCount: 3,
          fractionDoseGy: 18,
          alphaBeta: 10,
          technique: 'SBRT (4D-CT / ITV VMAT)',
          indication: 'Periferik erken evre KHDAK (Kategori 1 küratif altın standart, BED10 = 151.2 Gy).',
          targetVolumes: [
            { name: 'ITV_4D', doseGy: 54, marginMm: '0 mm', anatomical: '4D-CT tüm solunum hareket hacmi' },
            { name: 'PTV_SBRT', doseGy: 54, marginMm: 'ITV + 4-5 mm', anatomical: 'Set-up ve internal marjin' },
          ],
          oars: [
            { organ: 'Bilateral Akciğer', metric: 'V20Gy', limit: '< 10-15%', source: 'RTOG 0236' },
            { organ: 'Göğüs Duvarı', metric: 'V30Gy', limit: '< 30 cc', source: 'RTOG 0236' },
          ],
          evidence: 'RTOG 0236, RTOG 0915, NCCN v1.2025 Kategori 1',
        };
      }
      return {
        statusText: `ENDİKE: KÜRATİF ${sbrt.tag} PROTOKOLÜ`,
        badgeClass: 'bg-emerald-50 text-emerald-800 border-emerald-300 shadow-[0_0_15px_rgba(16,185,129,0.25)]',
        primaryScheme: sbrt,
        alternativeSchemes: [sbrt],
      };
    }

    // ------------------------------------------
    // 2. JİNEKOLOJİ (SERVİKS, ENDOMETRİYUM, OVER, VAJEN, VULVA)
    // ------------------------------------------
    if (selectedOrgan === 'gynecology') {
      if (gynSite === 'Serviks') {
        const cervixCrt: DoseScheme = {
          id: 'gyn-cervix-embrace',
          name: '45-50.4 Gy Pelvik EBRT + HDR 3D Brakiterapi (EMBRACE II)',
          tag: '⚡ EMBRACE II Standart',
          totalDoseGy: 45,
          fractionCount: 25,
          fractionDoseGy: 1.8,
          alphaBeta: 10,
          technique: 'IGRT Pelvik KRT + MR Kılavuzluğunda 3D/4D İntrakaviter/İnterstisyel Brakiterapi',
          indication: 'Lokal ileri Serviks Karsinomu (FIGO IB3-IVA veya LN+). Eşzamanlı haftalık Sisplatinli EBRT sonrası IGABT ile HR-CTV D90 ≥85-90 Gy EQD2 hedeflenir.',
          targetVolumes: [
            { name: 'CTV_Pelvis', doseGy: 45, marginMm: 'Anatomik', anatomical: 'Serviks, uterus, parametriyal dokular, vajen üst 1/2 ve pelvik lenf nodları' },
            { name: 'HR-CTV (High-Risk)', doseGy: 85, marginMm: 'MR bazlı', anatomical: 'Rezidu servikal kitle + tüm serviks (Brakiterapi ile eskalasyon)' },
          ],
          oars: [
            { organ: 'Rektum D2cc', metric: 'EQD2', limit: '< 65 Gy', source: 'EMBRACE II' },
            { organ: 'Mesane D2cc', metric: 'EQD2', limit: '< 80 Gy', source: 'EMBRACE II' },
            { organ: 'Sigmoid D2cc', metric: 'EQD2', limit: '< 70 Gy', source: 'EMBRACE II' },
            { organ: 'İnce Bağırsak D2cc', metric: 'EQD2', limit: '< 70 Gy', source: 'EMBRACE II' },
          ],
          systemicTherapy: 'Eşzamanlı haftalık Sisplatin (40 mg/m2, 5-6 kür).',
          evidence: 'EMBRACE II Protokolü, NCCN v1.2025 Kategori 1',
        };

        const postopPeters: DoseScheme = {
          id: 'gyn-cervix-peters',
          name: '50.4 Gy / 28 fx Pelvik KRT (Peters Protokolü)',
          tag: '🔬 Peters Adjuvan KRT',
          totalDoseGy: 50.4,
          fractionCount: 28,
          fractionDoseGy: 1.8,
          alphaBeta: 10,
          technique: 'IMRT / VMAT + Eşzamanlı Sisplatin',
          indication: 'Radikal histerektomi sonrası yüksek risk faktörleri (Pozitif cerrahi marjin, pozitif pelvik lenf nodları, parametriyal tutulum).',
          targetVolumes: [
            { name: 'CTV_Bed_Pelvis', doseGy: 50.4, marginMm: 'Anatomik', anatomical: 'Vajinal kaf, parametriyum yatağı ve pelvik lenfatik drenaj' },
          ],
          oars: [
            { organ: 'İnce Bağırsak V40Gy', metric: 'V40Gy', limit: '< 100 cc', source: 'QUANTEC' },
            { organ: 'Rektum V40Gy', metric: 'V40Gy', limit: '< 40%', source: 'QUANTEC' },
          ],
          systemicTherapy: 'Eşzamanlı Sisplatin (40-50 mg/m2 haftalık).',
          evidence: 'Peters et al. (JCO 2000), GOG 109',
        };

        return {
          statusText: cervixScenario === 'Adjuvan_Peters'
            ? 'ENDİKE: POSTOPERATİF YÜKSEK RİSK ADJUVAN KRT (PETERS)'
            : 'ENDİKE: DEFİNİTİF KEMORADYOTERAPİ + 3D IGABT (EMBRACE II)',
          badgeClass: 'bg-emerald-50 text-emerald-800 border-emerald-300 shadow-[0_0_15px_rgba(16,185,129,0.25)]',
          primaryScheme: cervixScenario === 'Adjuvan_Peters' ? postopPeters : cervixCrt,
          alternativeSchemes: [cervixCrt, postopPeters],
        };
      }

      if (gynSite === 'Endometriyum') {
        if (endoRisk === 'Low') {
          const noRt: DoseScheme = {
            id: 'endo-obs',
            name: 'Radyoterapi Önerilmez (İzlem)',
            tag: '👁️ Yalnızca İzlem',
            totalDoseGy: 0,
            fractionCount: 0,
            fractionDoseGy: 0,
            alphaBeta: 10,
            technique: 'Düzenli Jinekolojik Takip',
            indication: 'Düşük riskli endometrioid adenokarsinomda (Evre IA, G1-2, LVSI yok) cerrahi sonrası radyoterapiye gerek yoktur.',
            targetVolumes: [],
            oars: [],
            evidence: 'PORTEC-1, ASTRO Guidelines',
          };
          return {
            statusText: 'ENDİKE DEĞİLDİR: DÜŞÜK RİSK ENDOMETRİYUMDA İZLEM STANDARTTIR',
            badgeClass: 'bg-slate-100 text-slate-700 border-slate-300',
            primaryScheme: noRt,
            alternativeSchemes: [noRt],
          };
        } else if (endoRisk === 'Intermediate' || endoRisk === 'High_Intermediate') {
          const vcb: DoseScheme = {
            id: 'endo-vcb-21',
            name: '21 Gy / 3 fx veya 25 Gy / 5 fx (Vajinal Kaf Brakiterapisi - VCB)',
            tag: '🎯 VCB Standardı (PORTEC-2)',
            totalDoseGy: 21,
            fractionCount: 3,
            fractionDoseGy: 7.0,
            alphaBeta: 10,
            technique: 'HDR Vajinal Silindir Aplikatör (Mukoza altı 5 mm derinlikte)',
            indication: 'Yüksek-orta risk endometrioid karsinomda (Evre IB G1-2 veya Evre IA G3, yaş ≥60, LVSI+): Pelvik EBRT ile eşit lokal kontrol sağlar, gastrointestinal toksisiteyi belirgin azaltır.',
            targetVolumes: [
              { name: 'CTV_VaginaCuff', doseGy: 21, marginMm: 'Üst 1/3-1/2', anatomical: 'Vajinal kaf ve üst 3-4 cm vajina mukozası' },
            ],
            oars: [
              { organ: 'Rektum Mukoza', metric: 'Dmax', limit: '< 100% reçete dozu', source: 'ABS / ESTRO' },
              { organ: 'Mesane Mukoza', metric: 'Dmax', limit: '< 100% reçete dozu', source: 'ABS / ESTRO' },
            ],
            evidence: 'PORTEC-2 Faz III (Lancet 2010), ASTRO Endometrial Guidelines',
          };
          return {
            statusText: 'ENDİKE: VAJİNAL KAF BRAKİTERAPİSİ (PORTEC-2 STANDARDI)',
            badgeClass: 'bg-emerald-50 text-emerald-800 border-emerald-300',
            primaryScheme: vcb,
            alternativeSchemes: [vcb],
          };
        } else {
          const portec3: DoseScheme = {
            id: 'endo-portec3-45',
            name: '45-50.4 Gy Pelvik EBRT + Eşzamanlı/Adjuvan KT (PORTEC-3)',
            tag: '⚡ PORTEC-3 Yüksek Risk',
            totalDoseGy: 45,
            fractionCount: 25,
            fractionDoseGy: 1.8,
            alphaBeta: 10,
            technique: 'IMRT / VMAT Pelvik Nodal RT ± VCB Boost',
            indication: 'Yüksek riskli endometriyum ca (Evre III, seröz/berrak hücreli veya derin myometriyal invazyon + G3): Pelvik EBRT + KT genel sağkalımı ve nükssüz sağkalımı belirgin artırır.',
            targetVolumes: [
              { name: 'CTV_Pelvis', doseGy: 45, marginMm: 'Anatomik', anatomical: 'Vajinal kaf, paraservikal yatak ve pelvik lenfatikler' },
              { name: 'VCB_Boost', doseGy: 10, marginMm: 'HDR', anatomical: 'Pozitif marjin veya servikal tutulumda vajinal kaf boostu' },
            ],
            oars: [
              { organ: 'İnce Bağırsak', metric: 'V45Gy', limit: '< 65 cc', source: 'PORTEC-3' },
              { organ: 'Mesane', metric: 'V45Gy', limit: '< 35%', source: 'QUANTEC' },
            ],
            systemicTherapy: 'RT sırasında 2 kür Sisplatin (50 mg/m2) ardından 4 kür Karboplatin (AUC 5) + Paklitaksel (175 mg/m2).',
            evidence: 'PORTEC-3 Faz III (Lancet Oncol 2018), GOG 258',
          };
          return {
            statusText: 'ENDİKE: KOMBİNE PELVİK EBRT + SİSTEMİK KT (PORTEC-3)',
            badgeClass: 'bg-emerald-50 text-emerald-800 border-emerald-300 shadow-[0_0_15px_rgba(16,185,129,0.25)]',
            primaryScheme: portec3,
            alternativeSchemes: [portec3],
          };
        }
      }

      if (gynSite === 'Over_Tuba') {
        const sbrtOvary: DoseScheme = {
          id: 'ovary-sbrt-35',
          name: '35-45 Gy / 3-5 fx (Oligometastaz / Rekürrens SBRT)',
          tag: '🎯 Over Oligometastaz SBRT',
          totalDoseGy: 35,
          fractionCount: 5,
          fractionDoseGy: 7.0,
          alphaBeta: 10,
          technique: 'SBRT (MR veya BT Kılavuzluğunda Hassas VMAT)',
          indication: 'Over ve tuba kanserinde primer tedavi cerrahi debulking ve sistemik KT\'dir. İzole pelvik/para-aortik nükste veya kemorezistan oligoprogresyonda SBRT %90+ lokal kontrol sağlar.',
          targetVolumes: [
            { name: 'GTV_Recurrence', doseGy: 35, marginMm: '0 mm', anatomical: 'PET/MR pozitif nüks lenf nodu veya visseral kitle' },
            { name: 'PTV', doseGy: 35, marginMm: 'GTV + 3-5 mm', anatomical: 'Stereotaktik güvenlik marjini' },
          ],
          oars: [
            { organ: 'İnce Bağırsak / Duodenum', metric: 'Dmax', limit: '< 30 Gy', source: 'AAPM TG-101' },
            { organ: 'Büyük Damarlar', metric: 'Dmax', limit: '< 45 Gy', source: 'HyTEC' },
          ],
          systemicTherapy: 'Platin duyarlı/dirençli sistemik tedaviye mola sağlama potansiyeli.',
          evidence: 'MITO RT Group Study, NCCN v1.2025 Ovarian Principles',
        };
        const palOvary: DoseScheme = {
          id: 'ovary-pal-30',
          name: '30 Gy / 10 fx (Pelvik Kitle & Hemostaz Palyatif RT)',
          tag: '🛡️ Palyatif Pelvik RT',
          totalDoseGy: 30,
          fractionCount: 10,
          fractionDoseGy: 3.0,
          alphaBeta: 10,
          technique: '3D-CRT / IMRT',
          indication: 'Ağrılı nüks pelvik kitle veya rektal/vajinal kanama semptomlarını kontrol altına almak için uygulanır.',
          targetVolumes: [{ name: 'GTV_Mass', doseGy: 30, marginMm: '0 mm', anatomical: 'Semptomatik kitle' }],
          oars: [{ organ: 'Bağırsak', metric: 'Dmax', limit: '< 32 Gy', source: 'QUANTEC' }],
          evidence: 'Palliative Radiotherapy Guidelines in Gynecologic Oncology',
        };
        return {
          statusText: 'SEÇİLMİŞ ENDİKASYON: OLİGOMETASTAZDA SBRT VEYA PALYATİF RT',
          badgeClass: 'bg-amber-50 text-amber-800 border-amber-300',
          primaryScheme: ovaryScenario === 'Oligometastatik_SBRT' ? sbrtOvary : palOvary,
          alternativeSchemes: [sbrtOvary, palOvary],
        };
      }

      if (gynSite === 'Vajen') {
        const vajenCrt: DoseScheme = {
          id: 'vagina-crt-45',
          name: '45 Gy EBRT + İnterstisyel / İntrakaviter Brakiterapi (Toplam EQD2 75-80 Gy)',
          tag: '⚡ Definitif Vajen KRT',
          totalDoseGy: 45,
          fractionCount: 25,
          fractionDoseGy: 1.8,
          alphaBeta: 10,
          technique: 'Pelvik (± Kasık) EBRT + 3D HDR Brakiterapi Boost',
          indication: 'Primer Vajen Karsinomu (FIGO Evre II-IVA): Alt 1/3 tutulumunda bilateral inguinal lenfatikler zorunlu olarak alana dahil edilir. Eşzamanlı haftalık Sisplatin uygulanır.',
          targetVolumes: [
            { name: 'CTV_Vagina_Pelvis', doseGy: 45, marginMm: 'Anatomik', anatomical: 'Tüm vajen, parakolpium, pelvik lenf nodları (alt 1/3 ise bilateral kasık dahil)' },
            { name: 'HR-CTV_Brachy', doseGy: 75, marginMm: 'Brakiterapi', anatomical: 'Primer kitle rezidüsü (İnterstisyel iğneler veya silindir ile boost)' },
          ],
          oars: [
            { organ: 'Rektum D2cc', metric: 'EQD2', limit: '< 70 Gy', source: 'ABS Guidelines' },
            { organ: 'Mesane D2cc', metric: 'EQD2', limit: '< 80 Gy', source: 'ABS Guidelines' },
            { organ: 'Femur Başları', metric: 'Dmax', limit: '< 45 Gy', source: 'QUANTEC' },
          ],
          systemicTherapy: 'Eşzamanlı haftalık Sisplatin (40 mg/m2).',
          evidence: 'ABS Consensus Guidelines for Vaginal Cancer, NCCN',
        };
        return {
          statusText: 'ENDİKE: DEFİNİTİF KEMORADYOTERAPİ + İNTERSTİSYEL BRAKİTERAPİ',
          badgeClass: 'bg-emerald-50 text-emerald-800 border-emerald-300 shadow-[0_0_15px_rgba(16,185,129,0.25)]',
          primaryScheme: vajenCrt,
          alternativeSchemes: [vajenCrt],
        };
      }

      if (gynSite === 'Vulva') {
        const isPostop = vulvaScenario === 'Adjuvan_Cerrahi_Sonrasi';
        const vulvaPort: DoseScheme = {
          id: 'vulva-port-50',
          name: '45-50.4 Gy / 25-28 fx (Adjuvan İnguinal & Pelvik RT)',
          tag: '🛡️ GROINSS-V-II Standart',
          totalDoseGy: 50.4,
          fractionCount: 28,
          fractionDoseGy: 1.8,
          alphaBeta: 10,
          technique: 'IMRT / VMAT (Bilateral İnguinal ve Pelvik Lenfatik Işınlama)',
          indication: 'Radikal cerrahi sonrası: Yakın/pozitif marjin (<8 mm), >1 metastatik lenf nodu veya kapsül dışı yayılım (ENE) varlığında kasık nüksünü önler ve sağkalımı korur.',
          targetVolumes: [
            { name: 'CTV_Groin_Pelvis', doseGy: 50.4, marginMm: 'Anatomik', anatomical: 'Bilateral inguinofemoral ve iliak lenf nodu istasyonları' },
            { name: 'Boost_LN_ENE', doseGy: 60, marginMm: 'GTV + 5 mm', anatomical: 'Kapsül dışı yayılan veya rezeke makroskopik nod yatağı' },
          ],
          oars: [
            { organ: 'Femur Başları', metric: 'Dmax', limit: '< 50 Gy', source: 'QUANTEC' },
            { organ: 'Bağırsak Torbası', metric: 'V45Gy', limit: '< 100 cc', source: 'QUANTEC' },
          ],
          systemicTherapy: 'Çoklu lenf nodu veya ENE pozitifliğinde eşzamanlı haftalık Sisplatin düşünülür.',
          evidence: 'GROINSS-V-II Trial (JCO 2021), GOG 37 Faz III (NEJM)',
        };

        const vulvaDefinitive: DoseScheme = {
          id: 'vulva-def-64',
          name: '60-64 Gy / 32-35 fx (Definitif / Neoadjuvan KRT)',
          tag: '⚡ Definitif Vulva KRT',
          totalDoseGy: 64,
          fractionCount: 32,
          fractionDoseGy: 2.0,
          alphaBeta: 10,
          technique: 'IMRT / VMAT SIB (Eşzamanlı Entegre Boost)',
          indication: 'Lokal ileri inoperabl veya organ koruma (sfinkter koruma) hedeflenen olgularda definitif kemoradyoterapi.',
          targetVolumes: [
            { name: 'PTV_Primary_High', doseGy: 64, marginMm: 'GTV + 5 mm', anatomical: 'Primer kitle ve tutulu kasık nodları' },
            { name: 'PTV_Elective_Low', doseGy: 50, marginMm: 'Elektif lenfatik', anatomical: 'Bilateral inguinofemoral ve pelvik istasyonlar' },
          ],
          oars: [
            { organ: 'Femur Başları', metric: 'Dmax', limit: '< 50 Gy', source: 'QUANTEC' },
            { organ: 'Mesane / Rektum', metric: 'V50Gy', limit: '< 20%', source: 'QUANTEC' },
          ],
          systemicTherapy: 'Eşzamanlı Sisplatin veya 5-FU / Mitomisin-C.',
          evidence: 'GOG 101, GOG 205',
        };

        return {
          statusText: isPostop
            ? 'ENDİKE: POSTOPERATİF ADJUVAN İNGUİNAL/PELVİK RT (GROINSS-V)'
            : 'ENDİKE: LOKAL İLERİ VULVA DEFİNİTİF KEMORADYOTERAPİSİ',
          badgeClass: 'bg-emerald-50 text-emerald-800 border-emerald-300 shadow-[0_0_15px_rgba(16,185,129,0.25)]',
          primaryScheme: isPostop ? vulvaPort : vulvaDefinitive,
          alternativeSchemes: [vulvaPort, vulvaDefinitive],
        };
      }
    }

    // ------------------------------------------
    // 3. KEMİK & SARKOM (YDS, OSTEOSARKOM, EWING, KONDROSARKOM, KORDOMA, GCTB)
    // ------------------------------------------
    if (selectedOrgan === 'bone-sarcoma') {
      if (sarcomaSubtype === 'DFSP') {
        const dfspIndicated = dfspStatus !== 'R0';
        const dfspRt: DoseScheme = {
          id: dfspIndicated ? 'dfsp-adjuvant-56' : 'dfsp-observation',
          name: dfspIndicated ? '50-60 Gy / 25-30 fx (DFSP Adjuvan / Definitif RT)' : 'RT Gerekmez - R0 Cerrahi Sonrası İzlem',
          tag: dfspIndicated ? 'Dermatofibrosarkoma Protuberans' : 'R0 Cerrahi',
          totalDoseGy: dfspIndicated ? 56 : 0,
          fractionCount: dfspIndicated ? 28 : 0,
          fractionDoseGy: dfspIndicated ? 2 : 0,
          alphaBeta: 4,
          technique: 'IMRT / VMAT; tümör yatağı ve risk uyarlanmış cerrahi sınırlar',
          indication: dfspIndicated ? 'R1 pozitif marjin veya rezeke edilemeyen dermatofibrosarkoma protuberans olgusunda lokal kontrol amacıyla adjuvan/definitif RT multidisipliner değerlendirilir.' : 'R0 cerrahi sonrası klinik izlem; RT rutin olarak gerekmez.',
          targetVolumes: dfspIndicated ? [{ name: 'CTV_DFSP', doseGy: 56, marginMm: 'Cerrahi skar ve anatomik yayılım doğrultusunda', anatomical: 'Ekstremite veya gövde primer yatağı' }] : [],
          oars: dfspIndicated ? [{ organ: 'Eklem / cilt', metric: 'Dmean', limit: 'Fonksiyonel doku koruması ile optimize et', source: 'ESTRO / NCCN' }] : [],
          evidence: 'NCCN Soft Tissue Sarcoma v1.2025; ESTRO sarcoma guidance',
        };
        return {
          statusText: dfspIndicated ? 'ENDİKE: DFSP R1 MARJİN VEYA REZEKE EDİLEMEYEN HASTALIKTA RT DEĞERLENDİR' : 'R0 CERRAHİ SONRASI RT GEREKMEZ: İZLEM',
          badgeClass: dfspIndicated ? 'bg-emerald-50 text-emerald-800 border-emerald-300' : 'bg-slate-100 text-slate-700 border-slate-300',
          primaryScheme: dfspRt,
          alternativeSchemes: [dfspRt],
        };
      }

      if (sarcomaSubtype === 'Yumusak_Doku') {
        const isPreop = sarcomaSurgery === 'Preop';
        const sarcomaScheme: DoseScheme = {
          id: isPreop ? 'sarcoma-preop-50' : 'sarcoma-postop-66',
          name: isPreop ? '50 Gy / 25 fx (Preoperatif Neoadjuvan RT)' : '60-66 Gy / 30-33 fx (Postoperatif Cerrahi Sınır RT)',
          tag: isPreop ? '🛡️ Preop Altın Standart' : '🔬 Postop Eskalasyon',
          totalDoseGy: isPreop ? 50 : 66,
          fractionCount: isPreop ? 25 : 33,
          fractionDoseGy: 2,
          alphaBeta: 4,
          technique: 'IMRT / VMAT (Ekstremite Cilt Şeridi ve Eklem Koruma Zorunlu)',
          indication: isPreop
            ? 'Yüksek dereceli derin yumuşak doku sarkomunda preoperatif RT: Hedef hacim daha küçük, uzun dönem fibrozis ve lenfödem riski anlamlı düşüktür (Cerrahi 4-6 hafta sonra).'
            : 'Pozitif cerrahi marjin (R1) veya yakın sınır olgularında lokal kontrolü korumak için 66 Gy doza çıkılır.',
          targetVolumes: [
            { name: 'GTV', doseGy: isPreop ? 50 : 66, marginMm: '0 mm', anatomical: 'Primer kitle veya tümör rezeksiyon yatağı' },
            { name: 'CTV', doseGy: isPreop ? 50 : 60, marginMm: 'Boyuna 3-4 cm, radyal 1.5 cm', anatomical: 'Fasyal planlar boyunca anatomik mikroskobik yayılım payı' },
          ],
          oars: [
            { organ: 'Cilt Koruma Şeridi (Strip)', metric: 'Dmean', limit: '< 20 Gy (en az 2 cm serbest kalmalı)', source: 'NCCN Sarcoma (Lenfödem Önleme)' },
            { organ: 'Komşu Eklem', metric: 'V50Gy', limit: '< 50%', source: 'QUANTEC' },
            { organ: 'Kemik Korteksi', metric: 'Dmax', limit: '< 60 Gy (Patolojik fraktür önleme)', source: 'QUANTEC' },
          ],
          evidence: 'Kanada Sarcoma Group Faz III (O\'Sullivan et al. Lancet 2002), NCCN v1.2025',
        };
        return {
          statusText: isPreop
            ? 'ENDİKE: PREOPERATİF 50 GY RT (DÜŞÜK UZUN DÖNEM TOKSİSİTE)'
            : 'ENDİKE: POSTOPERATİF MARJİN ESKALASYONLU RT',
          badgeClass: 'bg-emerald-50 text-emerald-800 border-emerald-300 shadow-[0_0_15px_rgba(16,185,129,0.25)]',
          primaryScheme: sarcomaScheme,
          alternativeSchemes: [sarcomaScheme],
        };
      }

      if (sarcomaSubtype === 'Osteosarkom') {
        if (osteoScenario === 'Cerrahi_R0_Takip') {
          const osteoObs: DoseScheme = {
            id: 'osteo-obs',
            name: 'Radyoterapi Önerilmez (İzlem)',
            tag: '👁️ Cerrahi R0 İzlem',
            totalDoseGy: 0,
            fractionCount: 0,
            fractionDoseGy: 0,
            alphaBeta: 10,
            technique: 'Adjuvan MAP Kemoterapisi + İzlem',
            indication: 'Osteosarkom klasik olarak radyorezistandır. R0 geniş rezeksiyon ve neoadjuvan/adjuvan kemoterapi (Metotreksat, Doksorubisin, Sisplatin) standarttır; RT önerilmez.',
            targetVolumes: [],
            oars: [],
            evidence: 'NCCN Bone Cancer Guidelines - Osteosarcoma Principles',
          };
          return {
            statusText: 'ENDİKE DEĞİLDİR: R0 CERRAHİ SONRASI RT GEREKMEZ (KT + İZLEM)',
            badgeClass: 'bg-slate-100 text-slate-700 border-slate-300',
            primaryScheme: osteoObs,
            alternativeSchemes: [osteoObs],
          };
        } else {
          const osteoHigh: DoseScheme = {
            id: 'osteo-high-70',
            name: '66-74 Gy / 33-37 fx (Yüksek Doz Eskalasyonlu RT)',
            tag: '🔬 Yüksek Doz / Partikül RT',
            totalDoseGy: 70,
            fractionCount: 35,
            fractionDoseGy: 2.0,
            alphaBeta: 10,
            technique: 'IMRT / VMAT veya Proton / Karbon İyon Tedavisi',
            indication: 'Rezeke edilemeyen, pozitif marjinli (R1/R2) veya aksiyel/pelvik/kafatası tabanı osteosarkomlarında lokal kontrol için yüksek doza çıkılmalıdır.',
            targetVolumes: [
              { name: 'GTV_Residue', doseGy: 70, marginMm: '0 mm', anatomical: 'Makroskopik rezidü veya cerrahi sınır pozitif kemik yatağı' },
              { name: 'CTV', doseGy: 60, marginMm: 'GTV + 15 mm', anatomical: 'Mikroskobik kemik iliği ve periostal alan' },
            ],
            oars: [
              { organ: 'Spinal Kord', metric: 'Dmax', limit: '< 45-50 Gy', source: 'QUANTEC' },
              { organ: 'Büyük Sinir Gövdeleri', metric: 'Dmax', limit: '< 60 Gy', source: 'QUANTEC' },
            ],
            systemicTherapy: 'Sistemik MAP kemoterapisi eşlik eder.',
            evidence: 'NCCN Bone Cancer Guidelines, DeLaney et al. (Cancer 2005)',
          };
          return {
            statusText: 'ENDİKE: İNOPERABL VEYA R1/R2 OSTEOSARKOMDA YÜKSEK DOZ RT',
            badgeClass: 'bg-emerald-50 text-emerald-800 border-emerald-300',
            primaryScheme: osteoHigh,
            alternativeSchemes: [osteoHigh],
          };
        }
      }

      if (sarcomaSubtype === 'Ewing') {
        const isDefinitive = ewingIntent === 'Definitif_RT';
        const ewingScheme: DoseScheme = {
          id: isDefinitive ? 'ewing-def-55' : 'ewing-postop-50',
          name: isDefinitive ? '55.8 Gy / 31 fx (Definitif Lokal Kontrol RT)' : '45-50.4 Gy / 25-28 fx (Postoperatif R1/R2 RT)',
          tag: isDefinitive ? '⚡ Definitif Küratif RT' : '🛡️ Postop Adjuvan RT',
          totalDoseGy: isDefinitive ? 55.8 : 50.4,
          fractionCount: isDefinitive ? 31 : 28,
          fractionDoseGy: 1.8,
          alphaBeta: 10,
          technique: 'IMRT / VMAT (Pre-KT Başlangıç Kemik Hacmi Zorunlu)',
          indication: 'Ewing sarkomu yüksek derecede radyosensitiftir. Cerrahiye uygun olmayan olgularda veya pozitif cerrahi sınır sonrası lokal kontrol sağlar.',
          targetVolumes: [
            { name: 'CTV_Initial_Bone', doseGy: 45, marginMm: 'Anatomik', anatomical: 'Kemoterapi ÖNCESİ başlangıçtaki tüm kemik tutulum hacmi' },
            { name: 'CTV_Boost_Residue', doseGy: isDefinitive ? 55.8 : 50.4, marginMm: 'GTV + 10 mm', anatomical: 'Kemoterapi SONRASI rezidüel yumuşak doku kompanenti' },
          ],
          oars: [
            { organ: 'Büyüme Plağı (Pediatrik)', metric: 'Dmean', limit: 'Asimetrik büyümeyi önlemek için homojen alan', source: 'PENTEC' },
            { organ: 'Komşu Eklem', metric: 'V50Gy', limit: '< 50%', source: 'QUANTEC' },
          ],
          systemicTherapy: 'VDC/IE (Vinkristin, Doksorubisin, Siklofosfamid / İfosfamid, Etopozid) kemoterapisi.',
          evidence: 'Euro-EWING 99, Children\'s Oncology Group (COG) Protocols',
        };
        return {
          statusText: 'ENDİKE: RADYOSENSİTİF EWING SARKOMU LOKAL KONTROL PROTOKOLÜ',
          badgeClass: 'bg-emerald-50 text-emerald-800 border-emerald-300 shadow-[0_0_15px_rgba(16,185,129,0.25)]',
          primaryScheme: ewingScheme,
          alternativeSchemes: [ewingScheme],
        };
      }

      if (sarcomaSubtype === 'Kondrosarkom') {
        const chondroRt: DoseScheme = {
          id: 'chondro-70',
          name: '70-74 Gy / 35-37 fx (Partikül / Yüksek Doz Eskalasyon)',
          tag: '🔬 Doz Eskalasyonlu RT',
          totalDoseGy: 70,
          fractionCount: 35,
          fractionDoseGy: 2.0,
          alphaBeta: 10,
          technique: 'Proton Terapi / Karbon İyon veya Yüksek Doz IMRT',
          indication: 'Konvansiyonel kondrosarkomlar radyorezistandır. İnoperabl, kafa tabanı veya sakral olgularda ≥70 Gy EQD2 gereklidir.',
          targetVolumes: [{ name: 'GTV', doseGy: 70, marginMm: '0 mm', anatomical: 'Rezidü veya inoperabl kitle' }],
          oars: [{ organ: 'Beyin Sapı / Optik Yol', metric: 'Dmax', limit: '< 54 Gy', source: 'QUANTEC' }],
          evidence: 'NCCN Bone Cancer, Particle Therapy Oncology Group',
        };
        return {
          statusText: 'SEÇİLMİŞ OLGULARDA: İNOPERABL KONDROSARKOMDA YÜKSEK DOZ RT',
          badgeClass: 'bg-amber-50 text-amber-800 border-amber-300',
          primaryScheme: chondroRt,
          alternativeSchemes: [chondroRt],
        };
      }

      if (sarcomaSubtype === 'Kordoma') {
        const chordomaScheme: DoseScheme = {
          id: 'chordoma-74',
          name: '74-76 Gy / 37-38 fx (Klivus / Sakrum Ultra Yüksek Doz)',
          tag: '⚡ Ultra Yüksek Doz / Partikül',
          totalDoseGy: 74,
          fractionCount: 37,
          fractionDoseGy: 2.0,
          alphaBeta: 2.5,
          technique: 'Proton / Karbon İyon veya Stereotaktik Fraksiyone SRT',
          indication: 'Kordomalar son derece radyorezistandır ve komşu nöral yapılara yakındır. Küratif kontrol için >74 Gy EQD2 dozu şarttır.',
          targetVolumes: [{ name: 'GTV', doseGy: 74, marginMm: '0 mm', anatomical: 'Sakral veya klivus lezyon hacmi' }],
          oars: [{ organ: 'Beyin Sapı / Kord', metric: 'Dmax', limit: '< 54-60 Gy', source: 'HyTEC' }],
          evidence: 'Consensus Guidelines for Chordoma Management',
        };
        return {
          statusText: 'ENDİKE: KORDOMADA ULTRA YÜKSEK DOZ PARTİKÜL / IMRT ESKALASYONU',
          badgeClass: 'bg-emerald-50 text-emerald-800 border-emerald-300',
          primaryScheme: chordomaScheme,
          alternativeSchemes: [chordomaScheme],
        };
      }

      if (sarcomaSubtype === 'GCTB') {
        const gctbScheme: DoseScheme = {
          id: 'gctb-50',
          name: '45-50.4 Gy / 25-28 fx (Definitif Lokal Kontrol RT)',
          tag: '🛡️ GCTB Lokal Kontrol',
          totalDoseGy: 50.4,
          fractionCount: 28,
          fractionDoseGy: 1.8,
          alphaBeta: 10,
          technique: 'Konformal IMRT / VMAT',
          indication: 'Cerrahi rezeksiyonu ağır morbidite veya instabilite yaratacak omurga/pelvis yerleşimli veya Denosumab sonrası inoperabl olgularda %80+ lokal kontrol sağlar.',
          targetVolumes: [{ name: 'GTV', doseGy: 50.4, marginMm: '0 mm', anatomical: 'Ekspansif litik kitle' }],
          oars: [{ organ: 'Spinal Kord', metric: 'Dmax', limit: '< 45 Gy', source: 'QUANTEC' }],
          evidence: 'NCCN Bone Sarcoma Guidelines',
        };
        return {
          statusText: 'ENDİKE: İNOPERABL DEV HÜCRELİ KEMİK TÜMÖRÜNDE DEFİNİTİF RT',
          badgeClass: 'bg-emerald-50 text-emerald-800 border-emerald-300',
          primaryScheme: gctbScheme,
          alternativeSchemes: [gctbScheme],
        };
      }
    }

    // ------------------------------------------
    // 4. BAŞ-BOYUN
    // ------------------------------------------
    if (selectedOrgan === 'head-neck') {
      const bilateralNeck = hnSubsite === 'nasopharynx'
        || hnSubsite === 'oropharynx'
        || hnSubsite === 'hypopharynx'
        || (hnSubsite === 'larynx' && hnLarynxSubsite === 'Lokal_Ileri_T3_T4')
        || hnCrossesMidline
        || (parseFloat(hnDistanceFromMidlineCm) || 0) < 1;
      const electiveNeckIndicated = (parseFloat(hnTumorSizeCm) || 0) > 1 || (parseFloat(hnDoiMm) || 0) > 5;
      if (hnSubsite === 'larynx' && hnLarynxSubsite === 'Erken_Glottik_T1_T2') {
        const earlyGlottic: DoseScheme = {
          id: 'larynx-glottic-63',
          name: '63 Gy / 28 fx (2.25 Gy/fx Hipofraksiyone Glottik RT)',
          tag: '🎯 Erken Glottik Standart',
          totalDoseGy: 63,
          fractionCount: 28,
          fractionDoseGy: 2.25,
          alphaBeta: 10,
          technique: '3D-CRT / VMAT (Yalnızca Vokal Kordlar - Boyun IŞINLANMAZ)',
          indication: 'Erken evre T1a/b-T2 N0 Glottik Kanser: Vokal kord mobilitesi ve ses kalitesini korur; elektif boyun ışınlaması KESİNLİKLE yapılmaz.',
          targetVolumes: [
            { name: 'PTV_Glottic', doseGy: 63, marginMm: '5 mm', anatomical: 'Gerçek vokal kordlar, ön komissür ve aritenoid vokal proçes' },
          ],
          oars: [
            { organ: 'Karotis Arterler', metric: 'Dmean', limit: '< 20-30 Gy (İnme önleme)', source: 'RTOG' },
            { organ: 'Spinal Kord', metric: 'Dmax', limit: '< 30 Gy', source: 'QUANTEC' },
          ],
          evidence: 'RTOG 9512, Yamazaki et al., NCCN v1.2025',
        };
        return {
          statusText: 'ENDİKE: ERKEN GLOTTİK LARİNKS HİPOFRAKSİYONE RT (BOYUNSUZ)',
          badgeClass: 'bg-emerald-50 text-emerald-800 border-emerald-300 shadow-[0_0_15px_rgba(16,185,129,0.25)]',
          primaryScheme: earlyGlottic,
          alternativeSchemes: [earlyGlottic],
        };
      }

      if (hnSubsite === 'oral-cavity') {
        const highRiskAdjuvant = hnENE || hnPositiveMargin;
        const oralCavityDose = highRiskAdjuvant ? 66 : 60;
        const oralCrt: DoseScheme = {
          id: 'oral-postop-66',
          name: `${oralCavityDose} Gy / ${oralCavityDose / 2} fx (Postoperatif ${highRiskAdjuvant ? 'KRT' : 'RT'} - EORTC 22931 / RTOG 9501)`,
          tag: '⚡ EORTC/RTOG Standart',
          totalDoseGy: oralCavityDose,
          fractionCount: oralCavityDose / 2,
          fractionDoseGy: 2.0,
          alphaBeta: 10,
          technique: 'IMRT / VMAT (Yüksek Risk Yatak Boostu)',
          indication: highRiskAdjuvant
            ? 'Oral kavite cerrahisi sonrası ENE veya pozitif cerrahi sınır (R1) nedeniyle Sisplatin eşzamanlı adjuvan KRT değerlendirilir (EORTC 22931 / RTOG 9501).'
            : electiveNeckIndicated
              ? 'Tümör çapı >1 cm veya DOI >5 mm olduğunda elektif boyun tedavisi/diseksiyonu değerlendirilir; iyi lateralize tümörde ipsilateral alan yeterli olabilir.'
              : 'İyi lateralize, düşük riskli oral kavite tümöründe ipsilateral elektif boyun alanı veya uygun cerrahi yaklaşım multidisipliner değerlendirilir.',
          targetVolumes: [
            { name: 'PTV_Primary_Bed', doseGy: oralCavityDose, marginMm: 'Cerrahi yatak + klinik marjin', anatomical: 'Primer rezeksiyon yatağı ve patolojiye göre yüksek risk alanı' },
            ...(electiveNeckIndicated || selectedN !== 'N0' ? [{ name: 'PTV_Elective_Neck', doseGy: 54, marginMm: bilateralNeck ? 'Bilateral boyun' : 'İpsilateral, iyi lateralize tümörde', anatomical: `${bilateralNeck ? 'Bilateral' : 'Lateralize tümörde ipsilateral'} Level I-IV boyun${hnENE || selectedN === 'N2' || selectedN === 'N3' ? ' + Level V' : ''}` }] : []),
            ...(hnENE || selectedN === 'N2' || selectedN === 'N3' ? [{ name: 'PTV_Nodal_High_Risk_Boost', doseGy: selectedN === 'N3' ? 70 : 66, marginMm: 'Tutulu nod yatağı / SIB', anatomical: `Level V dahil yüksek riskli nodal alan; ${selectedN === 'N3' ? '70 Gy' : '66 Gy'} SIB boost` }] : []),
          ],
          oars: [
            { organ: 'Mandibula', metric: 'Dmax', limit: '< 70 Gy (V60 < 30%)', source: 'QUANTEC (ORN Riski)' },
            { organ: 'Parotis Bezi (Karşı)', metric: 'Dmean', limit: '< 26 Gy', source: 'QUANTEC' },
            { organ: 'Spinal Kord', metric: 'Dmax', limit: '< 45 Gy', source: 'QUANTEC' },
          ],
          systemicTherapy: highRiskAdjuvant ? 'Eşzamanlı Sisplatin (100 mg/m2 3 haftalık veya 40 mg/m2 haftalık) değerlendirilir.' : 'Sisplatin, yalnızca patolojik yüksek risk ölçütleri varsa değerlendirilir.',
          evidence: 'EORTC 22931 (NEJM 2004), RTOG 9501 (NEJM 2004)',
        };
        return {
          statusText: highRiskAdjuvant
            ? 'ENDİKE: ENE / R1 VARLIĞINDA POSTOPERATİF ADJUVAN KEMORADYOTERAPİ'
            : electiveNeckIndicated
              ? 'ENDİKE: TÜMÖR ÇAPI / DOI NEDENİYLE ELEKTİF BOYUN TEDAVİSİ DEĞERLENDİR'
              : 'RİSK UYARLI: CERRAHİ SONRASI PRİMER YATAK RT DEĞERLENDİR',
          badgeClass: 'bg-emerald-50 text-emerald-800 border-emerald-300 shadow-[0_0_15px_rgba(16,185,129,0.25)]',
          primaryScheme: oralCrt,
          alternativeSchemes: [oralCrt],
        };
      }

      // Nazofarenks / Orofarenks / Standart SIB
      const hnSib: DoseScheme = {
        id: 'hn-sib-70',
        name: '70 / 60 / 54 Gy - 33 fx (3 Kademeli Standart SIB Kemoradyoterapi)',
        tag: '⚡ Baş-Boyun Standart SIB',
        totalDoseGy: 70,
        fractionCount: 33,
        fractionDoseGy: 2.12,
        alphaBeta: 10,
        technique: 'VMAT / IMRT (Eşzamanlı Entegre Boost)',
        indication: `${hnSubsite === 'larynx' && hnLarynxSubsite === 'Lokal_Ileri_T3_T4' ? 'Lokal ileri supraglottik/glottik' : 'Lokal ileri baş-boyun'} kanserinde definitif kemoradyoterapi. ${hnSubsite === 'nasopharynx' ? 'Bilateral Level II-Vb ve retrofaringeal lenf nodları (RPN) zorunlu hedef hacimdir.' : bilateralNeck ? 'Bilateral Level II-IV kapsanır; nazofarenkste Level II-Vb ve RPN, oral kavitede Level I-IV uygulanır.' : 'İyi lateralize oral kavite primerinde ipsilateral Level I-III; DOI >5 mm ise Level IV eklenir.'} ${hnENE || selectedN === 'N2' || selectedN === 'N3' ? 'ENE+ veya N2-N3 varlığında Level V dahil edilir ve tutulu nod yatağına 66-70 Gy SIB boost uygulanır.' : ''}`,
        targetVolumes: [
          { name: 'PTV_High (GTV)', doseGy: 70, marginMm: 'GTV + 5 mm', anatomical: 'Primer kitle ve makroskopik tutulu lenf nodları' },
          { name: 'PTV_Mid (Subklinik)', doseGy: 60, marginMm: 'Yüksek risk nodlar', anatomical: 'Primer komşuluğu ve tutulu nod istasyonu' },
          { name: 'PTV_Low (Elektif)', doseGy: 54, marginMm: bilateralNeck ? 'Bilateral boyun' : 'İpsilateral boyun', anatomical: hnSubsite === 'nasopharynx' ? 'Bilateral Level II-Vb + retrofaringeal lenf nodları (RPN)' : `${bilateralNeck ? 'Bilateral' : 'İpsilateral'} Level II-IV${hnENE || selectedN === 'N2' || selectedN === 'N3' ? ' + Level V' : ''}` },
          ...(hnENE || selectedN === 'N2' || selectedN === 'N3' ? [{ name: 'PTV_Nodal_High_Risk_Boost', doseGy: selectedN === 'N3' ? 70 : 66, marginMm: 'Tutulu nod yatağı / SIB', anatomical: `Level V dahil tutulu nod yatağı; ${selectedN === 'N3' ? '70 Gy' : '66 Gy'} SIB boost` }] : []),
        ],
        oars: [
          { organ: 'Parotis Bezi (Kontralateral)', metric: 'Dmean', limit: '< 26 Gy', source: 'QUANTEC (Kserostomi koruması)' },
          { organ: 'Spinal Kord', metric: 'Dmax', limit: '< 45 Gy', source: 'QUANTEC' },
          { organ: 'Beyin Sapı', metric: 'Dmax', limit: '< 54 Gy', source: 'QUANTEC' },
        ],
        systemicTherapy: 'Eşzamanlı Sisplatin (100 mg/m2 gün 1, 22, 43 veya 40 mg/m2 haftalık).',
        evidence: 'RTOG 0129, RTOG 0522, GORTEC, NCCN v1.2025 Head and Neck',
      };
      return {
        statusText: 'ENDİKE: DEFİNİTİF KEMORADYOTERAPİ SIB PROTOKOLÜ (70/60/54 GY)',
        badgeClass: 'bg-emerald-50 text-emerald-800 border-emerald-300 shadow-[0_0_15px_rgba(16,185,129,0.25)]',
        primaryScheme: hnSib,
        alternativeSchemes: [hnSib],
      };
    }

    // ------------------------------------------
    // 5. SANTRAL SİNİR SİSTEMİ
    // ------------------------------------------
    if (selectedOrgan === 'cns') {
      if (cnsSubtype === 'gbm') {
        const isElderly = gbmPerformance === 'Duskun_Yasli';
        const stupp: DoseScheme = {
          id: isElderly ? 'gbm-elderly-40' : 'gbm-stupp-60',
          name: isElderly ? '40.05 Gy / 15 fx + Eşzamanlı TMZ (Perry Rejimi)' : '60 Gy / 30 fx + Eşzamanlı ve Adjuvan TMZ (Stupp Protokolü)',
          tag: isElderly ? '👴 Yaşlı/Düşkün Hipofraksiyonasyon' : '⚡ Stupp Altın Standart',
          totalDoseGy: isElderly ? 40.05 : 60,
          fractionCount: isElderly ? 15 : 30,
          fractionDoseGy: isElderly ? 2.67 : 2.0,
          alphaBeta: 10,
          technique: '3D-CRT / VMAT + Günlük Temozolomid',
          indication: isElderly
            ? '≥65-70 yaş veya ECOG ≥2 olgularda 3 haftalık hipofraksiyone KRT: Yaşam kalitesini korur ve genel sağkalımı uzatır (Perry et al. NEJM 2017).'
            : 'Maksimal güvenli cerrahi sonrası Glioblastom altın standardı. Radyoterapi ile eşzamanlı günlük TMZ (75 mg/m2), ardından 6 kür adjuvan TMZ (150-200 mg/m2).',
          targetVolumes: [
            { name: 'GTV', doseGy: isElderly ? 40.05 : 60, marginMm: '0 mm', anatomical: 'T1 kontrastlı rezidü ve cerrahi kavite' },
            { name: 'CTV', doseGy: isElderly ? 40.05 : 60, marginMm: 'GTV + 15-20 mm', anatomical: 'Anatomik bariyerlere saygılı mikroskobik pay' },
            { name: 'PTV', doseGy: isElderly ? 40.05 : 60, marginMm: 'CTV + 3-5 mm', anatomical: 'Set-up güvenlik zarfı' },
          ],
          oars: [
            { organ: 'Optik Kiazma', metric: 'Dmax', limit: '< 54 Gy', source: 'QUANTEC' },
            { organ: 'Beyin Sapı', metric: 'Dmax', limit: '< 54 Gy', source: 'QUANTEC' },
            { organ: 'Göz Lensleri', metric: 'Dmax', limit: '< 7 Gy', source: 'QUANTEC' },
          ],
          systemicTherapy: 'Eşzamanlı günlük Temozolomid (75 mg/m2) ardından 6 kür Adjuvan TMZ.',
          evidence: 'Stupp et al. (NEJM 2005), Perry et al. (NEJM 2017), NCCN v1.2025 CNS',
        };
        return {
          statusText: isElderly
            ? 'ENDİKE: YAŞLI/DÜŞKÜN HASTADA HİPOFRAKSİYONE KRT (PERRY REJİMİ)'
            : 'ENDİKE: DEFİNİTİF KEMORADYOTERAPİ + TMZ (STUPP PROTOKOLÜ)',
          badgeClass: 'bg-emerald-50 text-emerald-800 border-emerald-300 shadow-[0_0_15px_rgba(16,185,129,0.25)]',
          primaryScheme: stupp,
          alternativeSchemes: [stupp],
        };
      }

      if (cnsSubtype === 'meningioma') {
        const isGrade1 = meningiomaGrade === 'Grade_1';
        const isSubtotalGrade1 = isGrade1 && (cnsResection === 'STR' || cnsResection === 'Biyopsi' || meningiomaSimpson === 'IV-V');
        const diameter = parseFloat(cnsMaxDiameter) || 0;
        const useSrs = isSubtotalGrade1 && diameter > 0 && diameter <= 3;
        const meningiomaDose = isGrade1 ? useSrs ? 14 : 54 : 60;
        const menScheme: DoseScheme = {
          id: useSrs ? 'mening-grade1-srs-14' : isGrade1 ? 'mening-54' : 'mening-60',
          name: useSrs ? '12-14 Gy / 1 fx (WHO Grade 1 STR, uygun küçük hedefte SRS)' : isGrade1 ? '54 Gy / 30 fx (WHO Grade 1 Menenjiyom)' : '60 Gy / 30 fx (Grade 2/3 Adjuvan RT)',
          tag: isGrade1 ? useSrs ? 'Grade 1 STR - SRS' : 'Grade 1 Konformal RT' : 'Grade 2/3 - RTOG 0539',
          totalDoseGy: meningiomaDose,
          fractionCount: useSrs ? 1 : isGrade1 ? 30 : 30,
          fractionDoseGy: useSrs ? meningiomaDose : isGrade1 ? 1.8 : 2.0,
          alphaBeta: 3.5,
          technique: useSrs ? 'Stereotaktik radyocerrahi; kritik organ dozları uygunsa' : 'IMRT / VMAT',
          indication: isGrade1
            ? isSubtotalGrade1
              ? 'WHO Grade 1 subtotal rezeksiyon / Simpson IV-V sonrası küçük ve uygun rezidüde SRS 12-14 Gy; büyük veya kritik organ komşuluğunda fraksiyone RT değerlendirilir.'
              : 'WHO Grade 1 tam rezeksiyon sonrası izlem; rezidü, semptom, hacim ve kritik organ ilişkisine göre 54 Gy fraksiyone RT düşünülebilir.'
            : 'WHO Grade 2/3 menenjiyomda rezeksiyon derecesi ve patolojiye göre adjuvan fraksiyone RT (Grade 2/3 için yaklaşık 60 Gy) değerlendirilir.',
          targetVolumes: [
            { name: 'GTV', doseGy: meningiomaDose, marginMm: '0 mm', anatomical: 'Kontrast tutan dural kuyruk ve rezidüel kitle' },
            ...(!useSrs ? [{ name: 'CTV', doseGy: meningiomaDose, marginMm: 'GTV + 5-10 mm dural kuyruk', anatomical: 'Dural yaprak boyunca infiltrasyon' }] : []),
          ],
          oars: [
            { organ: 'Optik Sinir / Kiazma', metric: 'Dmax', limit: '< 54 Gy', source: 'QUANTEC' },
            { organ: 'Beyin Sapı', metric: 'Dmax', limit: '< 54 Gy', source: 'QUANTEC' },
          ],
          evidence: 'RTOG 0539, EORTC 22042-26042, NCCN CNS Guidelines',
        };
        return {
          statusText: 'ENDİKE: MENENJİYOM FRAKSİYONE RT VEYA SRS PROTOKOLÜ',
          badgeClass: 'bg-emerald-50 text-emerald-800 border-emerald-300',
          primaryScheme: menScheme,
          alternativeSchemes: [menScheme],
        };
      }

      // Beyin Metastazı
      if (cnsMidlineShift === '>=5mm') {
        const emer: DoseScheme = {
          id: 'cns-emer',
          name: 'Acil Dekompresyon + Deksametazon Protokolü',
          tag: '🚨 ACİL DURUM',
          totalDoseGy: 0,
          fractionCount: 0,
          fractionDoseGy: 0,
          alphaBeta: 10,
          technique: 'Medikal Acil Girişim',
          indication: 'Orta hat şifti ≥5 mm herniasyon riskini gösterir. ACİL IV Deksametazon başlanmalı, Nöroşirürji ile acil cerrahi dekompresyon tartışılmalıdır.',
          targetVolumes: [],
          oars: [],
          evidence: 'NCCN CNS Emergency Guidelines',
        };
        return {
          statusText: '🚨 ACİL UYARI: ORTA HAT ŞİFTİ ≥5 MM (HERNİASYON RİSKİ)',
          badgeClass: 'bg-rose-50 text-rose-800 border-rose-300 shadow-[0_0_20px_rgba(244,63,94,0.4)] animate-pulse',
          primaryScheme: emer,
          alternativeSchemes: [emer],
        };
      }

      const metCount = parseInt(cnsMetCount) || 1;
      const diam = parseFloat(cnsMaxDiameter) || 1.8;
      if (metCount <= 4 && diam <= 3.5) {
        const isPostoperativeCavity = cnsResection === 'GTR' || cnsResection === 'STR';
        const srsDose = isPostoperativeCavity ? (diam <= 2 ? 18 : 15) : diam <= 2.0 ? 24 : diam <= 3.0 ? 18 : 15;
        const srs: DoseScheme = {
          id: isPostoperativeCavity ? 'cns-cavity-srs' : 'cns-srs',
          name: `${srsDose} Gy / 1 fx (${isPostoperativeCavity ? 'Cerrahi Kavite SRS' : 'Tek Fraksiyon SRS'})`,
          tag: isPostoperativeCavity ? 'Postoperatif Kavite SRS' : 'Tek Fx SRS',
          totalDoseGy: srsDose,
          fractionCount: 1,
          fractionDoseGy: srsDose,
          alphaBeta: 10,
          technique: 'Stereotaktik Radyocerrahi (SRS - Gamma Knife / CyberKnife / VMAT)',
          indication: `${isPostoperativeCavity ? '1-4 odak için rezeksiyon sonrası cerrahi kaviteye SRS; ' : '1-4 odakta tek başına SRS; '}hasta performansı (KPS ${cnsKps}) ve sistemik hastalık kontrolüyle birlikte değerlendirilir. ${cnsSymptoms === 'Semptomatik' ? 'Semptomatik kitle etkisi için steroid ve cerrahi değerlendirmesi de gerekir.' : 'Asemptomatik durumda yakın nörolojik ve görüntüleme izlemi gerekir.'}`,
          targetVolumes: [
            { name: 'GTV_Met', doseGy: srsDose, marginMm: '0 mm', anatomical: 'MR T1 kontrast tutan lezyon' },
            { name: 'PTV_SRS', doseGy: srsDose, marginMm: '1-2 mm', anatomical: 'Sub-milimetrik set-up zarfı' },
          ],
          oars: [
            { organ: 'Beyin Sapı', metric: 'Dmax', limit: '< 12 Gy', source: 'HyTEC' },
            { organ: 'Optik Kiazma', metric: 'Dmax', limit: '< 8-10 Gy', source: 'HyTEC' },
          ],
          evidence: 'NCCN v1.2025 Kategori 1, Yamamoto et al. (Lancet Oncol)',
        };
        return {
          statusText: 'ENDİKE: KÜRATİF STEREOTAKTİK RADYOCERRAHİ (SRS / SRT)',
          badgeClass: 'bg-emerald-50 text-emerald-800 border-emerald-300 shadow-[0_0_15px_rgba(16,185,129,0.25)]',
          primaryScheme: srs,
          alternativeSchemes: [srs],
        };
      } else {
        const wbrt: DoseScheme = {
          id: 'cns-wbrt-30',
          name: '30 Gy / 10 fx + HA & Memantin (Tüm Beyin RT)',
          tag: '🧠 WBRT + HA Standart',
          totalDoseGy: 30,
          fractionCount: 10,
          fractionDoseGy: 3,
          alphaBeta: 10,
          technique: 'Hipokampus Koruyucu VMAT (HA-WBRT) + Memantin',
          indication: '>4 metastaz veya yaygın leptomeningeal tutulum. Bellek fonksiyonlarını korumak için hipokampus Dmax <16 Gy tutulmalıdır.',
          targetVolumes: [
            { name: 'Whole Brain PTV', doseGy: 30, marginMm: 'Kafatası', anatomical: 'Bilateral beyin hemisferleri (Hipokampus alanı hariç)' },
          ],
          oars: [
            { organ: 'Hipokampus Dmax', metric: 'Dmax', limit: '< 16 Gy (D100% < 9 Gy)', source: 'NRG CC001' },
            { organ: 'Göz Lensleri', metric: 'Dmax', limit: '< 7 Gy', source: 'QUANTEC' },
          ],
          systemicTherapy: 'RT ile eşzamanlı ve 6 ay boyunca Memantin (20 mg/gün).',
          evidence: 'NRG Oncology CC001 (JCO 2020), RTOG 0933',
        };
        return {
          statusText: 'ENDİKE: HİPOKAMPUS KORUYUCU WBRT + MEMANTİN',
          badgeClass: 'bg-emerald-50 text-emerald-800 border-emerald-300',
          primaryScheme: wbrt,
          alternativeSchemes: [wbrt],
        };
      }
    }

    // ------------------------------------------
    // 6. PROSTAT VE GÜS
    // ------------------------------------------
    if (selectedOrgan === 'prostate') {
      if (gusSubtype === 'bladder') {
        const isSuitableForTmt = bladderTmtSuitable && bladderTurbtComplete && selectedN === 'N0' && selectedM === 'M0';
        const tmt: DoseScheme = {
          id: 'bladder-tmt-648',
          name: '45 Gy Pelvis + Tümör Yatağı Boost ile 64.8 Gy',
          tag: 'Mesane Koruyucu Trimodal Tedavi',
          totalDoseGy: 64.8,
          fractionCount: 36,
          fractionDoseGy: 1.8,
          alphaBeta: 10,
          technique: 'Maksimal TURBT sonrası görüntü kılavuzlu IMRT / VMAT',
          indication: isSuitableForTmt
            ? 'Seçilmiş cT2-T4a N0 M0 kas-invaziv mesane kanserinde maksimal TURBT sonrası eşzamanlı kemoradyoterapi; sistoskopik yanıt değerlendirmesi ve kurtarma sistektomisi planı gerektirir.'
            : 'TMT için uygunluk, N0M0 durum ve maksimal TURBT yapılabilirliği açısından doğrulanmalıdır; mevcut seçimler uygunluk koşullarını karşılamıyor.',
          targetVolumes: [
            { name: 'Pelvik nodal CTV', doseGy: 45, marginMm: 'Anatomik', anatomical: 'Pelvik lenfatikler ve mesane çevresi' },
            { name: 'Mesane / tümör yatağı', doseGy: 64.8, marginMm: 'Mesane duvarı ve yatak', anatomical: 'Görüntüleme ve TURBT bulgularına göre boost' },
          ],
          oars: [
            { organ: 'Rektum', metric: 'V50Gy', limit: 'Planlama protokolüyle sınırlandır', source: 'QUANTEC / IGRT' },
            { organ: 'İnce bağırsak', metric: 'V45Gy', limit: 'Mümkün olduğunca düşük', source: 'QUANTEC' },
          ],
          systemicTherapy: 'Eşzamanlı Sisplatin veya 5-FU / Mitomisin-C; maksimal TURBT ve yakın sistoskopik izlem.',
          evidence: 'NCCN Bladder Cancer v1.2025; BC2001; RTOG trimodal therapy protocols',
        };
        return {
          statusText: isSuitableForTmt ? 'ENDİKE: UYGUN HASTADA MESANE KORUYUCU TRİMODAL TEDAVİ' : 'UYARI: MESANE KORUYUCU TMT UYGUNLUĞUNU DOĞRULAYIN',
          badgeClass: isSuitableForTmt ? 'bg-emerald-50 text-emerald-800 border-emerald-300' : 'bg-amber-50 text-amber-800 border-amber-300',
          primaryScheme: tmt,
          alternativeSchemes: [tmt],
        };
      }

      if (gusSubtype === 'testis') {
        const testisStage = selectedT === 'I' ? 'I' : selectedT === 'IIB' ? 'IIB' : 'IIA';
        const isStageI = testisStage === 'I';
        const stageIIDoseGy = testisStage === 'IIB' ? 36 : 30;
        const stageIIFractions = testisStage === 'IIB' ? 18 : 15;
        const testisRt: DoseScheme = {
          id: isStageI ? 'seminoma-stage-i-20' : `seminoma-stage-${testisStage.toLowerCase()}-${stageIIDoseGy}`,
          name: isStageI ? '20 Gy / 10 fx (Adjuvan Paraaortik RT)' : `${stageIIDoseGy} Gy / ${stageIIFractions} fx (Paraaortik + İpsilateral İliak RT)`,
          tag: isStageI ? 'Evre I Seminom' : `Evre ${testisStage} Seminom`,
          totalDoseGy: isStageI ? 20 : stageIIDoseGy,
          fractionCount: isStageI ? 10 : stageIIFractions,
          fractionDoseGy: 2,
          alphaBeta: 10,
          technique: 'IMRT / VMAT; böbrek ve karşı testis dozunu en aza indir',
          indication: isStageI
            ? 'Evre I seminomda aktif izlem sıklıkla tercih edilir; RT, bilgilendirilmiş seçilmiş hastalarda adjuvan seçenek olarak değerlendirilir.'
            : 'Evre IIA/B seminomda paraaortik ve ipsilateral iliak lenfatiklere RT, evre ve nodal hacme göre bireyselleştirilir.',
          targetVolumes: [{ name: 'Paraaortik ± ipsilateral iliak', doseGy: isStageI ? 20 : stageIIDoseGy, marginMm: 'Anatomik nodal alan', anatomical: isStageI ? 'Paraaortik lenfatikler' : 'Paraaortik ve ipsilateral iliak lenfatikler' }],
          oars: [
            { organ: 'Karşı testis', metric: 'Dmean', limit: 'Mümkün olan en düşük doz', source: 'NCCN / ESTRO' },
            { organ: 'Böbrekler', metric: 'Dmean', limit: 'Mümkün olan en düşük doz', source: 'QUANTEC' },
          ],
          evidence: 'NCCN Testicular Cancer v1.2025; EAU Guidelines',
        };
        return {
          statusText: isStageI ? 'SEÇENEK: EVRE I SEMİNOMDA AKTİF İZLEM VEYA SEÇİLMİŞ HASTADA ADJUVAN RT' : 'ENDİKE: EVRE II SEMİNOMDA EVREYE GÖRE NODAL RT',
          badgeClass: 'bg-emerald-50 text-emerald-800 border-emerald-300',
          primaryScheme: testisRt,
          alternativeSchemes: [testisRt],
        };
      }

      if (gusSubtype === 'penile') {
        const organPreservation = (selectedT === 'T1' || selectedT === 'T2') && selectedN === 'N0';
        const penileRt: DoseScheme = {
          id: organPreservation ? 'penile-organ-preservation-60' : 'penile-nodal-66',
          name: organPreservation ? '60-66 Gy (Organ Koruyucu Brakiterapi / EBRT)' : '60-66 Gy Primer + İnguinal / Pelvik Nodal RT',
          tag: organPreservation ? 'Organ Koruyucu Yaklaşım' : 'Lokal İleri / Nodal Pozitif',
          totalDoseGy: 60,
          fractionCount: 30,
          fractionDoseGy: 2,
          alphaBeta: 10,
          technique: 'Seçilmiş olguda interstisyel brakiterapi veya IMRT / VMAT',
          indication: organPreservation
            ? 'Seçilmiş T1-T2 penis kanserinde organ koruma amacıyla brakiterapi veya EBRT multidisipliner değerlendirmeyle düşünülebilir.'
            : 'T3-T4 primer veya N+ hastalıkta primer yatağa ve klinik risk durumuna göre inguinal / pelvik lenfatiklere RT değerlendirilir.',
          targetVolumes: [{ name: 'Primer yatak', doseGy: 60, marginMm: 'Anatomik', anatomical: organPreservation ? 'Primer penis lezyonu' : 'Primer yatak ve klinik olarak endike inguinal / pelvik nodlar' }],
          oars: [{ organ: 'Üretra / cilt', metric: 'Dmean', limit: 'Organ koruma ve toksisite hedefleriyle optimize et', source: 'ESTRO / NCCN' }],
          evidence: 'NCCN Penile Cancer v1.2025; EAU Guidelines',
        };
        return {
          statusText: organPreservation ? 'SEÇENEK: ERKEN EVREDE ORGAN KORUYUCU TEDAVİ DEĞERLENDİR' : 'ENDİKE: LOKAL İLERİ / NODAL RİSKTE MULTİDİSİPLİNER RT DEĞERLENDİRMESİ',
          badgeClass: 'bg-emerald-50 text-emerald-800 border-emerald-300',
          primaryScheme: penileRt,
          alternativeSchemes: [penileRt],
        };
      }

      const pG = parseInt(gleasonPrimary) || 3;
      const sG = parseInt(gleasonSecondary) || 4;
      const score = pG + sG;
      const psa = parseFloat(psaLevel) || 8.5;
      const positiveCores = parseFloat(positiveCorePercent) || 0;
      const isNodePositive = selectedN === 'N1';
      const intermediateFactors = Number(selectedT === 'T2b' || selectedT === 'T2c') + Number(score === 7) + Number(psa >= 10 && psa <= 20);
      const isVeryHighRisk = hasSVI || selectedT === 'T3b' || selectedT === 'T4' || pG === 5;
      const isHighRisk = !isVeryHighRisk && (score >= 8 || psa > 20 || selectedT === 'T3a' || selectedT === 'T3b' || hasECE);
      const isIntermediateRisk = !isHighRisk && !isVeryHighRisk && intermediateFactors > 0;
      const isUnfavorableIntermediate = isIntermediateRisk && (pG >= 4 || positiveCores >= 50 || intermediateFactors > 1);
      const prostateRiskGroup = isNodePositive
        ? 'N1'
        : isVeryHighRisk
          ? 'Çok Yüksek'
          : isHighRisk
            ? 'Yüksek'
            : isIntermediateRisk
              ? isUnfavorableIntermediate ? 'Orta-Unfavorable' : 'Orta-Favorable'
              : 'Düşük';

      if (isNodePositive) {
        const pelvicStampede: DoseScheme = {
          id: 'pros-stampede',
          name: '78 Gy Prostat + 46-50 Gy Pelvik LN + 2-3 Yıl ADT',
          tag: '⚡ STAMPEDE Standardı',
          totalDoseGy: 78,
          fractionCount: 39,
          fractionDoseGy: 2,
          alphaBeta: 1.5,
          technique: 'IMRT / VMAT (Elektif Pelvik Lenf Nodu Işınlaması Dahil)',
          indication: 'Çok Yüksek Riskli veya N1 Prostat Ca: Prostat ve seminal veziküllerle birlikte pelvik lenfatik drenaj alanlarının ışınlanması ve 24-36 ay uzun dönem ADT genel sağkalımı belirgin uzatır.',
          targetVolumes: [
            { name: 'PTV_Prostat_High', doseGy: 78, marginMm: '5-7 mm', anatomical: 'Prostat bezi ve seminal vezikül tabanı' },
            { name: 'PTV_Pelvik_LN', doseGy: 46, marginMm: '7 mm', anatomical: 'Bilateral obturator, eksternal iliak, internal iliak nod zinciri' },
          ],
          oars: [
            { organ: 'Rektum V70', metric: 'V70Gy', limit: '< 15%', source: 'QUANTEC' },
            { organ: 'Rektum V50', metric: 'V50Gy', limit: '< 35%', source: 'STAMPEDE' },
            { organ: 'Mesane V70', metric: 'V70Gy', limit: '< 25%', source: 'QUANTEC' },
          ],
          systemicTherapy: '24-36 ay LHRH agonisti/antagonisti + N1 ise Abirateron eklenmesi önerilir.',
          evidence: 'STAMPEDE Trial, POP-RT Trial, RTOG 0521',
        };
        return {
          statusText: 'ENDİKE: YÜKSEK RİSK / N1 PROSTAT PELVİK RT + UZUN ADT',
          badgeClass: 'bg-emerald-50 text-emerald-800 border-emerald-300 shadow-[0_0_15px_rgba(16,185,129,0.25)]',
          primaryScheme: pelvicStampede,
          alternativeSchemes: [pelvicStampede],
        };
      }

      if (isVeryHighRisk || isHighRisk) {
        const highPros: DoseScheme = {
          id: 'pros-high-78',
          name: '78 Gy / 39 fx veya 60 Gy / 20 fx + 18-36 Ay ADT',
          tag: `${prostateRiskGroup} Risk`,
          totalDoseGy: 78,
          fractionCount: 39,
          fractionDoseGy: 2,
          alphaBeta: 1.5,
          technique: 'IGRT VMAT',
          indication: `${prostateRiskGroup} riskli lokalize prostat kanserinde doz eskalasyonu ve uzun dönem hormonoterapi multidisipliner olarak değerlendirilir.`,
          targetVolumes: [
            { name: 'PTV_Prostate_SV', doseGy: 78, marginMm: '5 mm', anatomical: 'Prostat ve seminal veziküller' },
            { name: 'PTV_Pelvic_LN', doseGy: 46, marginMm: '7 mm', anatomical: 'Risk temelli elektif pelvik lenfatik alanlar' },
          ],
          oars: [
            { organ: 'Rektum V70', metric: 'V70Gy', limit: '< 15%', source: 'RTOG 0415' },
            { organ: 'Mesane V70', metric: 'V70Gy', limit: '< 25%', source: 'RTOG 0415' },
          ],
          systemicTherapy: '18-36 ay androjen deprivasyon tedavisi (ADT); elektif pelvik nodal RT (46-50 Gy) risk ve nodal değerlendirmeyle planlanır.',
          evidence: 'DART01/05, EORTC 22961',
        };
        return {
          statusText: 'ENDİKE: YÜKSEK RİSK PROSTAT ESKALE RT + 2 YIL ADT',
          badgeClass: 'bg-emerald-50 text-emerald-800 border-emerald-300',
          primaryScheme: highPros,
          alternativeSchemes: [highPros],
        };
      }

      const isLowRisk = !isIntermediateRisk;
      const lowRiskSurveillance: DoseScheme = {
        id: 'pros-active-surveillance',
        name: 'Aktif İzlem (RT ertelenebilir)',
        tag: 'Düşük Risk Seçeneği',
        totalDoseGy: 0,
        fractionCount: 0,
        fractionDoseGy: 0,
        alphaBeta: 1.5,
        technique: 'PSA, MR ve protokol dahilinde tekrar biyopsi ile yakın izlem',
        indication: 'Düşük riskli hastalıkta uygun hastalar için aktif izlem; tedavi tercihi ortak karar ile belirlenir.',
        targetVolumes: [],
        oars: [],
        evidence: 'NCCN Prostate Cancer v1.2025; AUA/ASTRO Guideline',
      };
      const intPros: DoseScheme = {
        id: 'pros-mod-60',
        name: '60 Gy / 20 fx (Ilımlı Hipofraksiyonasyon CHHiP)',
        tag: '⚡ CHHiP Standart',
        totalDoseGy: 60,
        fractionCount: 20,
        fractionDoseGy: 3,
        alphaBeta: 1.5,
        technique: 'IGRT VMAT',
        indication: 'Orta riskli prostat kanserinde 20 fraksiyonluk rejim 39 fraksiyona non-inferiordur (Kategori 1 standart).',
        targetVolumes: [{ name: 'PTV_Prostate', doseGy: 60, marginMm: '5 mm', anatomical: 'Prostat bezi ve seminal vezikül proksimal 1 cm' }],
        oars: [{ organ: 'Rektum V57', metric: 'V57Gy', limit: '< 15%', source: 'CHHiP' }],
        systemicTherapy: isUnfavorableIntermediate ? 'Orta-unfavorable riskte 4-6 ay kısa dönem ADT; pelvik RT risk temelli değerlendirilir.' : 'Orta-favorable riskte ADT çoğunlukla önerilmez.',
        evidence: 'CHHiP Phase III (Lancet Oncol 2016), PROFIT Trial',
      };
      const sbrtPros: DoseScheme = {
        id: 'pros-sbrt-36',
        name: '36.25 Gy / 5 fx (Ultra-Hipofraksiyonasyon PACE-B)',
        tag: '🎯 SBRT PACE-B',
        totalDoseGy: 36.25,
        fractionCount: 5,
        fractionDoseGy: 7.25,
        alphaBeta: 1.5,
        technique: 'SBRT (Fidüsyel / MR Kılavuzluğunda)',
        indication: 'Düşük ve uygun orta risk olgularda 5 fraksiyonda küratif tedavi.',
        targetVolumes: [{ name: 'PTV_SBRT', doseGy: 36.25, marginMm: '3-4 mm', anatomical: 'Prostat bezi' }],
        oars: [{ organ: 'Rektum V36Gy', metric: 'V36Gy', limit: '< 1 cc', source: 'PACE-B' }],
        evidence: 'PACE-B Trial (NEJM 2024)',
      };
      return {
        statusText: isLowRisk
          ? 'DÜŞÜK RİSK: AKTİF İZLEM VEYA HASTA TERCİHİNE GÖRE KÜRATİF RT'
          : `${prostateRiskGroup.toUpperCase()}: ${isUnfavorableIntermediate ? 'KISA DÖNEM ADT DEĞERLENDİR' : 'ADT GENELLİKLE GEREKMEZ'}`,
        badgeClass: 'bg-emerald-50 text-emerald-800 border-emerald-300',
        primaryScheme: intPros,
        alternativeSchemes: isLowRisk ? [intPros, sbrtPros, lowRiskSurveillance] : [intPros, sbrtPros],
      };
    }

    // ------------------------------------------
    // 7. MEME
    // ------------------------------------------
    if (selectedOrgan === 'breast') {
      if (breastHistology === 'Duktal Karsinoma In Situ (DCIS)') {
        const dcisWbi: DoseScheme = {
          id: 'br-dcis-wbi-26',
          name: '26 Gy / 5 fx (DCIS Tüm Meme RT) ± Tümör Yatağı Boost',
          tag: 'DCIS - Aksiller RT / Kemoterapi Yok',
          totalDoseGy: 26,
          fractionCount: 5,
          fractionDoseGy: 5.2,
          alphaBeta: 4,
          technique: '3D-CRT / VMAT; sol taraflı olguda kalp koruması',
          indication: 'MKC sonrası DCIS için tüm meme ışınlaması lokal nüksü azaltır; boost, yaş, derece, marjin ve nüks riskine göre değerlendirilir. Aksiller RT ve sistemik kemoterapi önerilmez.',
          targetVolumes: [
            { name: 'CTV_WholeBreast', doseGy: 26, marginMm: 'Cilt altı 5 mm', anatomical: 'Tüm meme; nodal alanlar rutin olarak dahil edilmez' },
            ...(breastBoost ? [{ name: 'Tumor bed boost', doseGy: 10, marginMm: 'Kavite + cerrahi klips', anatomical: 'Uygun risk özelliklerinde 10-16 Gy ek boost' }] : []),
          ],
          oars: [
            { organ: 'Kalp (sol taraf)', metric: 'Dmean', limit: 'Mümkün olan en düşük doz', source: 'QUANTEC / FAST-Forward' },
            { organ: 'İpsilateral akciğer', metric: 'V8Gy', limit: '< 15%', source: 'FAST-Forward' },
          ],
          evidence: 'NCCN Breast Cancer v1.2025; ASTRO Whole Breast Irradiation Guideline',
        };
        return {
          statusText: 'ENDİKE: MKC SONRASI DCIS TÜM MEME RT; NODAL RT VE KEMOTERAPİ YOK',
          badgeClass: 'bg-emerald-50 text-emerald-800 border-emerald-300',
          primaryScheme: dcisWbi,
          alternativeSchemes: [
            dcisWbi,
            {
              ...dcisWbi,
              id: 'br-dcis-wbi-40-15',
              name: '40 Gy / 15 fx (DCIS Tüm Meme RT) ± Boost',
              totalDoseGy: 40,
              fractionCount: 15,
              fractionDoseGy: 40 / 15,
              targetVolumes: dcisWbi.targetVolumes.map(volume => ({ ...volume, doseGy: volume.name === 'Tumor bed boost' ? volume.doseGy : 40 })),
            },
          ],
        };
      }

      if (breastHistology === 'Malign Filloides Tümörü') {
        const marginCm = parseFloat(phyllodesMarginCm) || 0;
        const observe = marginCm >= 1 && !phyllodesHighGrade;
        const phyllodes: DoseScheme = {
          id: observe ? 'phyllodes-observation' : 'phyllodes-adjuvant-56',
          name: observe ? 'RT Gerekmez - Cerrahi Sonrası İzlem' : '50-60 Gy / 25-30 fx (Adjuvan Yatak RT)',
          tag: observe ? '≥1 cm Marjin - İzlem' : 'Yakın/Pozitif Marjin veya Yüksek Derece',
          totalDoseGy: observe ? 0 : 56,
          fractionCount: observe ? 0 : 28,
          fractionDoseGy: observe ? 0 : 2,
          alphaBeta: 4,
          technique: observe ? 'Klinik ve radyolojik izlem' : 'Meme yatağına IMRT / VMAT',
          indication: observe
            ? 'Cerrahi marjin ≥1 cm ve yüksek dereceli stromal özellik yoksa izlem tercih edilir.'
            : 'Marjin <1 cm veya yüksek dereceli stromal aşırı büyümede lokal nüks riskini azaltmak için adjuvan meme yatağı RT değerlendirilir; elektif aksiller nodal RT uygulanmaz.',
          targetVolumes: observe ? [] : [{ name: 'CTV_TumorBed', doseGy: 56, marginMm: 'Cerrahi yatak ve klipsler', anatomical: 'Meme yatağı; elektif aksilla dahil edilmez' }],
          oars: observe ? [] : [{ organ: 'Kalp (sol taraf)', metric: 'Dmean', limit: 'Mümkün olan en düşük doz', source: 'QUANTEC' }, { organ: 'İpsilateral akciğer', metric: 'V20Gy', limit: '< 15%', source: 'QUANTEC' }],
          evidence: 'NCCN Breast Cancer v1.2025; ASTRO soft tissue sarcoma guidance',
        };
        return {
          statusText: observe ? 'RT GEREKMEZ: MARJİN ≥1 CM VE YÜKSEK DERECELİ ÖZELLİK YOK - İZLEM' : 'DEĞERLENDİR: YAKIN/POZİTİF MARJİN VEYA YÜKSEK DERECELİ FİLLOİDES',
          badgeClass: observe ? 'bg-slate-100 text-slate-700 border-slate-300' : 'bg-emerald-50 text-emerald-800 border-emerald-300',
          primaryScheme: phyllodes,
          alternativeSchemes: [phyllodes],
        };
      }

      const isMastectomy = breastSurgery === 'Mastektomi';
      const isNodePositive = selectedN === 'N1' || selectedN === 'N2' || selectedN === 'N3';
      const isHighNodal = selectedN === 'N2' || selectedN === 'N3';
      const isT1 = selectedT.startsWith('T1');
      const isT3T4 = selectedT === 'T3' || selectedT === 'T4';
      const highKi67 = Number.parseFloat(breastKi67) >= 20;
      const gradeThree = breastGrade === '3';
      const elevatedBreastRisk = selectedT === 'T1c' || highKi67 || gradeThree;
      const systemicRiskNote = elevatedBreastRisk
        ? `${selectedT === 'T1c' ? 'Tümör çapı >1 cm (T1c); ' : ''}${highKi67 ? 'Ki-67 ≥20%; ' : ''}${gradeThree ? 'Grade 3; ' : ''}Genomik risk skoruna göre adjuvan KT / anti-HER2 endikasyonu tartışılsın.`
        : '';
      const boostRiskNote = elevatedBreastRisk
        ? 'Tümör yatağı boost (10-16 Gy) endikasyonu klinik risk ve yaş ile tartışılsın.'
        : '';

      if (isMastectomy) {
        if (!isNodePositive && !isT3T4 && (isT1 || selectedT === 'T2') && selectedN === 'N0' && breastMargin === 'Negatif') {
          const noRt: DoseScheme = {
            id: 'br-no-pmrt',
            name: 'PMRT Önerilmez (İzlem)',
            tag: '👁️ Yalnızca İzlem',
            totalDoseGy: 0,
            fractionCount: 0,
            fractionDoseGy: 0,
            alphaBeta: 4,
            technique: 'Rutin Onkolojik Takip',
            indication: 'T1-T2 N0 mastektomi ve negatif cerrahi sınır varlığında PMRT endikasyonu yoktur.',
            targetVolumes: [],
            oars: [],
            evidence: 'EBCTCG Meta-analysis, NCCN v1.2025',
          };
          return {
            statusText: 'ENDİKE DEĞİLDİR: T1-T2 N0 MASTEKTOMİDE PMRT GEREKMEZ',
            badgeClass: 'bg-slate-100 text-slate-700 border-slate-300',
            primaryScheme: noRt,
            alternativeSchemes: [noRt],
          };
        }
        const pmrt: DoseScheme = {
          id: 'br-pmrt-50',
          name: '50 Gy / 25 fx veya 40 Gy / 15 fx (Postmastektomi RT - PMRT)',
          tag: '🛡️ PMRT Standart',
          totalDoseGy: 50,
          fractionCount: 25,
          fractionDoseGy: 2,
          alphaBeta: 4,
          technique: '3D-CRT / VMAT (Derin İnspirasyon Nefes Tutma - DIBH Zorunlu)',
          indication: 'T3-T4 tümörler veya ≥4 lenf nodu pozitifliğinde lokoregiyonal nüksü %70 azaltır ve genel sağkalımı artırır.',
          targetVolumes: [
            { name: 'CTV_ChestWall', doseGy: 50, marginMm: 'Cilt altı 5 mm', anatomical: 'Mastektomi skarı ve pektorali kası yüzeyi' },
            { name: 'CTV_Supraclav', doseGy: 46, marginMm: 'Anatomik', anatomical: 'Supraklavikuler fossa ve aksilla apeksi (Level III)' },
          ],
          oars: [
            { organ: 'Kalp', metric: 'Dmean', limit: '< 2.5 Gy', source: 'NCCN Sarcoma/Breast' },
            { organ: 'İpsilateral Akciğer', metric: 'V20Gy', limit: '< 30%', source: 'QUANTEC' },
          ],
          systemicTherapy: `Sistemik tedavi patoloji ve biyobelirteçlerle belirlenir: ER ${breastER ? 'pozitif' : 'negatif'}, PR ${breastPR ? 'pozitif' : 'negatif'}, HER2 ${breastHER2 ? 'pozitif' : 'negatif'}, Ki-67 ${breastKi67}%, Grade ${breastGrade}; menopoz durumu ${breastMenopause}. ${systemicRiskNote}`,
          evidence: 'EBCTCG PMRT Meta-Analysis (Lancet), SUPREMO Trial',
        };
        return {
          statusText: 'ENDİKE: POSTMASTEKTOMİ GÖĞÜS DUVARI + LENFATİK RT (PMRT)',
          badgeClass: 'bg-emerald-50 text-emerald-800 border-emerald-300 shadow-[0_0_15px_rgba(16,185,129,0.25)]',
          primaryScheme: pmrt,
          alternativeSchemes: [
            pmrt,
            {
              ...pmrt,
              id: 'br-pmrt-40-15',
              name: '40 Gy / 15 fx (Hipofraksiyone PMRT)',
              totalDoseGy: 40,
              fractionCount: 15,
              fractionDoseGy: 40 / 15,
              targetVolumes: pmrt.targetVolumes.map(volume => ({ ...volume, doseGy: 40 })),
            },
          ],
        };
      }

      // Meme Koruyucu Cerrahi (MKC)
      const hasNodalDisease = isNodePositive || isHighNodal;
      const fastForward: DoseScheme = {
        id: 'br-fast-26',
        name: '26 Gy / 5 fx (FAST-Forward Ultra-Hipofraksiyonasyon)',
        tag: '⚡ FAST-Forward Standart',
        totalDoseGy: 26,
        fractionCount: 5,
        fractionDoseGy: 5.2,
        alphaBeta: 4,
        technique: '3D-CRT / VMAT (DIBH Sol Kalp Koruması)',
        indication: `Tüm meme ışınlaması; ${isNodePositive ? 'Nodal pozitiflikte bölgesel nodal ışınlama (RNI) ayrıca değerlendirilir.' : 'nodal risk durumuna göre RNI eklenmez.'} Menopoz: ${breastMenopause}. ER ${breastER ? 'pozitif' : 'negatif'}, PR ${breastPR ? 'pozitif' : 'negatif'}, HER2 ${breastHER2 ? 'pozitif' : 'negatif'}, Ki-67 ${breastKi67}%, Grade ${breastGrade}. ${systemicRiskNote} ${boostRiskNote} 40 Gy / 15 fx eşdeğer standart seçenektir.`,
        targetVolumes: [
          { name: 'CTV_WholeBreast', doseGy: 26, marginMm: 'Cilt altı 5 mm', anatomical: 'Tüm meme parankimi' },
          ...(hasNodalDisease ? [{ name: 'CTV_RNI', doseGy: 40, marginMm: 'Risk uyarlanmış', anatomical: 'Nodal durum ve klinik risk doğrultusunda bölgesel nodlar' }] : []),
          ...(breastBoost ? [{ name: 'TumorBedBoost', doseGy: 10, marginMm: 'Kavite ve klipsler', anatomical: `Uygun hastada 10-16 Gy ek boost${boostRiskNote ? `; ${boostRiskNote}` : ''}` }] : []),
        ],
        oars: [
          { organ: 'Kalp (Sol)', metric: 'Dmean', limit: '< 1.5 Gy', source: 'FAST-Forward' },
          { organ: 'İpsilateral Akciğer', metric: 'V8Gy', limit: '< 15%', source: 'FAST-Forward' },
        ],
        systemicTherapy: `Adjuvan sistemik tedavi multidisipliner kararla belirlenir: ER ${breastER ? 'pozitif' : 'negatif'}, PR ${breastPR ? 'pozitif' : 'negatif'}, HER2 ${breastHER2 ? 'pozitif' : 'negatif'}, Ki-67 ${breastKi67}%, Grade ${breastGrade}; menopoz durumu ${breastMenopause}. ${systemicRiskNote}`,
        evidence: 'FAST-Forward Faz III (Lancet 2020), ASTRO 2023 Guidelines',
      };
      return {
        statusText: 'ENDİKE: ADJUVAN TÜM MEME RT (FAST-FORWARD 26 GY / 5 FX)',
        badgeClass: 'bg-emerald-50 text-emerald-800 border-emerald-300 shadow-[0_0_15px_rgba(16,185,129,0.25)]',
        primaryScheme: fastForward,
        alternativeSchemes: [
          fastForward,
          {
            ...fastForward,
            id: 'br-wbi-40-15',
            name: '40 Gy / 15 fx (Hipofraksiyone Tüm Meme RT) + Gereğinde 10-16 Gy Boost',
            totalDoseGy: 40,
            fractionCount: 15,
            fractionDoseGy: 2.67,
            targetVolumes: fastForward.targetVolumes.map(volume => ({ ...volume, doseGy: volume.name === 'TumorBedBoost' ? 10 : 40 })),
          },
        ],
      };
    }

    // ------------------------------------------
    // 8. GİS (REKTUM, MİDE, KARACİĞER, ÖZOFAGUS, PANKREAS, ANAL)
    // ------------------------------------------
    if (selectedOrgan === 'gis') {
      if (gisOrgan === 'Rektum') {
        const rapido: DoseScheme = {
          id: 'gis-rapido-25',
          name: '25 Gy / 5 fx (5x5 Gy RAPIDO Kısa Dönem RT + KT)',
          tag: '⚡ RAPIDO TNT Standardı',
          totalDoseGy: 25,
          fractionCount: 5,
          fractionDoseGy: 5,
          alphaBeta: 10,
          technique: 'VMAT (Dolu Mesane Protokolü)',
          indication: 'Lokal İleri Rektum Ca (cT3-T4, CRM+, N2): Kısa dönem RT ardından konsolidasyon kemoterapisi (CAPOX/FOLFOX) organ koruma ve metastaz kontrolünü maksimize eder.',
          targetVolumes: [
            { name: 'CTV_Pelvis', doseGy: 25, marginMm: 'Anatomik', anatomical: 'Rektal tümör, mezorektum, presakral ve internal iliak lenf nodları' },
          ],
          oars: [
            { organ: 'İnce Bağırsak', metric: 'V15Gy', limit: '< 120 cc', source: 'RAPIDO' },
            { organ: 'Femur Başları', metric: 'Dmax', limit: '< 25 Gy', source: 'QUANTEC' },
            { organ: 'Mesane', metric: 'V20Gy', limit: '< 40%', source: 'RAPIDO' },
          ],
          systemicTherapy: 'RT sonrası cerrahi öncesi 18 hafta CAPOX veya FOLFOX4 kemoterapisi.',
          evidence: 'RAPIDO Faz III (Lancet Oncol 2021 & 2023), PRODIGE 23',
        };
        const standardKrt: DoseScheme = {
          id: 'gis-rectum-long-50',
          name: '50.4 Gy / 28 fx + Eşzamanlı Kapesitabin (Uzun Dönem KRT)',
          tag: '🎯 Klasik Kemoradyoterapi',
          totalDoseGy: 50.4,
          fractionCount: 28,
          fractionDoseGy: 1.8,
          alphaBeta: 10,
          technique: 'VMAT',
          indication: 'Lokal ileri rektum kanserinde sfinkter koruma ve lokal kontrol için uzun dönem eşzamanlı KRT.',
          targetVolumes: [{ name: 'CTV_Pelvis', doseGy: 50.4, marginMm: 'Anatomik', anatomical: 'Mezorektum ve pelvik lenfatik istasyonlar' }],
          oars: [{ organ: 'İnce Bağırsak', metric: 'V45Gy', limit: '< 65 cc', source: 'QUANTEC' }],
          systemicTherapy: 'Eşzamanlı oral Kapesitabin (825 mg/m2 günde iki kez).',
          evidence: 'German Rectal Cancer Study (CAO/ARO/AIO-94)',
        };
        return {
          statusText: 'ENDİKE: NEOADJUVAN TNT / RAPIDO KISA DÖNEM RT PROTOKOLÜ',
          badgeClass: 'bg-emerald-50 text-emerald-800 border-emerald-300 shadow-[0_0_15px_rgba(16,185,129,0.25)]',
          primaryScheme: rapido,
          alternativeSchemes: [rapido, standardKrt],
        };
      }

      if (gisOrgan === 'Mide') {
        const gastricCrt: DoseScheme = {
          id: 'gis-gastric-45',
          name: '45 Gy / 25 fx + Eşzamanlı 5-FU/Kapesitabin (Adjuvan KRT)',
          tag: '⚡ INT-0116 / ARTIST',
          totalDoseGy: 45,
          fractionCount: 25,
          fractionDoseGy: 1.8,
          alphaBeta: 10,
          technique: 'VMAT (Böbrek ve Karaciğer Korumalı)',
          indication: 'Yetersiz lenf nodu diseksiyonu (<D2 rezeksiyon) veya mikroskopik rezidüel hastalık (R1) varlığında lokal nüksü önler.',
          targetVolumes: [
            { name: 'CTV_Stomach_Bed', doseGy: 45, marginMm: 'Anatomik', anatomical: 'Mide yatağı, anastomoz hattı ve perigastrik/çölyak lenf nodları' },
          ],
          oars: [
            { organ: 'Karaciğer', metric: 'Mean', limit: '< 30 Gy (V30 < 60%)', source: 'QUANTEC' },
            { organ: 'Bilateral Böbrek', metric: 'Mean', limit: '< 15 Gy (en az bir böbrek Mean < 12 Gy)', source: 'QUANTEC' },
          ],
          systemicTherapy: 'Eşzamanlı ve takip eden Kapesitabin veya 5-FU/LV.',
          evidence: 'INT-0116 (Macdonald NEJM), ARTIST Trial',
        };
        return {
          statusText: 'ENDİKE: ADJUVAN KEMORADYOTERAPİ (INT-0116 STANDARDI)',
          badgeClass: 'bg-emerald-50 text-emerald-800 border-emerald-300',
          primaryScheme: gastricCrt,
          alternativeSchemes: [gastricCrt],
        };
      }

      if (gisOrgan === 'Karaciger') {
        const liverSbrt: DoseScheme = {
          id: 'gis-liver-sbrt',
          name: '35-50 Gy / 5 fx (Karaciğer SBRT)',
          tag: '🎯 Karaciğer SBRT',
          totalDoseGy: 50,
          fractionCount: 5,
          fractionDoseGy: 10,
          alphaBeta: 10,
          technique: 'SBRT (Nefes Tutma / 4D-CT VMAT)',
          indication: 'Child-Pugh A inoperabl primer hepatoselüler karsinom (HCC), kolanjiokarsinom veya karaciğer metastazlarında yüksek ablasyon sağlar.',
          targetVolumes: [{ name: 'GTV', doseGy: 50, marginMm: '0 mm', anatomical: 'Kontrast tutan karaciğer lezyonu' }],
          oars: [
            { organ: 'Sağlam Karaciğer', metric: 'V15Gy', limit: '< 700 cc (en az 700 cc normal karaciğer < 15 Gy almalı)', source: 'QUANTEC' },
            { organ: 'Mide / Duodenum', metric: 'Dmax', limit: '< 30 Gy', source: 'QUANTEC' },
          ],
          evidence: 'RTOG 1112 (Lancet Oncol), NRG GI003',
        };
        return {
          statusText: 'ENDİKE: KÜRATİF KARACİĞER STEREOTAKTİK SBRT',
          badgeClass: 'bg-emerald-50 text-emerald-800 border-emerald-300',
          primaryScheme: liverSbrt,
          alternativeSchemes: [liverSbrt],
        };
      }

      // Anal / Pankreas / Özofagus
      const generalGis: DoseScheme = {
        id: 'gis-general-50',
        name: '50.4 Gy / 28 fx Kemoradyoterapi',
        tag: '⚡ Definitif GİS KRT',
        totalDoseGy: 50.4,
        fractionCount: 28,
        fractionDoseGy: 1.8,
        alphaBeta: 10,
        technique: 'VMAT',
        indication: 'GİS organı definitif kemoradyoterapi protokolü.',
        targetVolumes: [{ name: 'PTV', doseGy: 50.4, marginMm: '5-7 mm', anatomical: 'Primer kitle ve bölgesel lenfatikler' }],
        oars: [{ organ: 'İnce Bağırsak', metric: 'V45Gy', limit: '< 65 cc', source: 'QUANTEC' }],
        evidence: 'NCCN Gastrointestinal Guidelines',
      };
      return {
        statusText: 'ENDİKE: DEFİNİTİF KEMORADYOTERAPİ',
        badgeClass: 'bg-emerald-50 text-emerald-800 border-emerald-300',
        primaryScheme: generalGis,
        alternativeSchemes: [generalGis],
      };
    }

    // ------------------------------------------
    // 9. CİLT
    // ------------------------------------------
    if (selectedOrgan === 'skin') {
      const isSCC = skinHistology === 'SCC';
      const isBCC = skinHistology === 'BCC';
      const isMelanoma = skinHistology === 'Melanom';
      const isMerkel = skinHistology === 'Merkel';
      const highRiskScc = (parseFloat(skinDepthMm) || 0) > 6 || skinPerineuralInvasion || skinBoneInvasion || skinMargin !== 'Negatif' || selectedN !== 'N0';
      const totalDose = isMelanoma ? skinMargin === 'Negatif' ? 30 : 48 : isMerkel ? 56 : isSCC ? highRiskScc ? 66 : 60 : 50;
      const fractions = isMelanoma ? skinMargin === 'Negatif' ? 5 : 20 : isMerkel ? 28 : isSCC ? highRiskScc ? 33 : 30 : 20;
      const skinScheme: DoseScheme = {
        id: isMelanoma ? 'skin-melanoma-adjuvant' : isMerkel ? 'skin-merkel-adjuvant' : isSCC ? highRiskScc ? 'skin-scc-high-risk' : 'skin-scc-conditional' : 'skin-bcc-50',
        name: isMelanoma ? `${totalDose} Gy / ${fractions} fx (Seçilmiş Melanom Adjuvan RT)` : isMerkel ? '50-56 Gy Primer + 50 Gy Bölgesel Nodal RT' : isSCC ? `${totalDose} Gy / ${fractions} fx (cSCC${highRiskScc ? ' yüksek risk IMRT' : ', RT endikasyonu varsa'})` : '50 Gy / 20 fx (BCC Yüzeyel / Elektron RT)',
        tag: isMelanoma ? 'Melanom - Seçilmiş Endikasyon' : isMerkel ? 'Merkel Hücreli Karsinom' : isSCC ? highRiskScc ? 'Yüksek Risk cSCC' : 'cSCC - RT endikasyonuna bağlı' : 'BCC Konformal RT',
        totalDoseGy: totalDose,
        fractionCount: fractions,
        fractionDoseGy: totalDose / fractions,
        alphaBeta: 10,
        technique: isMelanoma ? 'IMRT / VMAT; nodal hacim endikasyona göre' : isMerkel ? 'IMRT / VMAT; primer yatak ve bölgesel nodal alan' : isSCC ? 'Yüksek riskte IMRT / VMAT' : 'Elektron demeti, yüzeyel RT veya brakiterapi',
        indication: isMelanoma
          ? 'Lokal nüks, R1 cerrahi sınır veya çoklu nodal tutulum gibi seçilmiş durumlarda adjuvan hipofraksiyone RT değerlendirilir.'
          : isMerkel
            ? 'Agresif nöroendokrin biyoloji nedeniyle primer yatak ve elektif bölgesel nodal drenajın tedavisi multidisipliner olarak değerlendirilir.'
            : isSCC
              ? highRiskScc ? 'Derinlik >6 mm, perinöral invazyon, kemik tutulumu, pozitif marjin veya nodal hastalık yüksek risk özelliğidir; adjuvan/definitif IMRT değerlendirilir.' : 'Düşük riskli cSCC için cerrahi/izlem önceliklidir; RT yalnızca klinik endikasyon varsa değerlendirilir.'
              : 'Düşük riskli bazal hücreli karsinomda yüzeyel RT, elektron veya brakiterapi; cerrahiye uygunluk ve kozmetik hedeflerle değerlendirilir.',
        targetVolumes: [
          { name: 'PTV_Primer', doseGy: totalDose, marginMm: 'Klinik marjin ve anatomik bariyerlere göre', anatomical: 'Primer yatak / lezyon' },
          ...(isMerkel ? [{ name: 'CTV_Regional_Nodes', doseGy: 50, marginMm: 'Bölgesel drenaj', anatomical: 'Elektif bölgesel nodal alan; risk uyarlanmış' }] : []),
        ],
        oars: [
          { organ: 'Göz Lensi (Yüz ise)', metric: 'Dmax', limit: '< 5-7 Gy', source: 'QUANTEC' },
          { organ: 'Kemik / Kıkırdak', metric: 'Dmax', limit: '< 60 Gy', source: 'QUANTEC' },
        ],
        evidence: 'NCCN Basal / Squamous Cell Skin Cancer v1.2025; ASTRO Skin Cancer Guidelines; Merkel cell multidisciplinary guidance',
      };
      return {
        statusText: isMelanoma ? 'SEÇİLMİŞ OLGUDA ADJUVAN MELANOM RT DEĞERLENDİR' : isMerkel ? 'ENDİKE: PRİMER YATAK + BÖLGESEL NODAL ALAN DEĞERLENDİR' : isSCC && highRiskScc ? 'YÜKSEK RİSK cSCC: ADJUVAN / DEFİNİTİF IMRT DEĞERLENDİR' : isSCC ? 'DÜŞÜK RİSK cSCC: CERRAHİ / İZLEM; RT YALNIZCA ENDİKASYON VARSA' : isBCC ? 'BCC: CERRAHİ UYGUNLUĞUNA GÖRE YÜZEYEL RT DEĞERLENDİR' : 'ENDİKE: DEFİNİTİF / ADJUVAN KUTANÖZ RT',
        badgeClass: 'bg-emerald-50 text-emerald-800 border-emerald-300',
        primaryScheme: skinScheme,
        alternativeSchemes: [skinScheme],
      };
    }

    // ------------------------------------------
    // 10. HEMATOLOJİK
    // ------------------------------------------
    if (selectedOrgan === 'hematologic') {
      if (hematologicSubtype === 'Plasmacytoma') {
        const plasmacytoma: DoseScheme = {
          id: 'plasmacytoma-45',
          name: '40-50 Gy / 20-25 fx (Soliter Plazmasitom)',
          tag: 'Küratif Lokal RT',
          totalDoseGy: 45,
          fractionCount: 25,
          fractionDoseGy: 1.8,
          alphaBeta: 10,
          technique: 'IMRT / VMAT; tümör hacmine göre lokal alan',
          indication: 'Kemik veya ekstramedüller soliter plazmasitomda kemik iliği ve sistemik değerlendirme sonrası küratif lokal RT; lokal kontrol oranı yüksektir.',
          targetVolumes: [{ name: 'CTV_Plazmasitom', doseGy: 45, marginMm: 'Görüntüleme ve anatomik bariyerlere göre', anatomical: 'Makroskopik lezyon ve subklinik yayılım alanı' }],
          oars: [{ organ: 'Spinal kord (yakınsa)', metric: 'Dmax', limit: 'QUANTEC sınırları içinde', source: 'QUANTEC' }],
          evidence: 'ILROG Guidelines for Solitary Plasmacytoma; NCCN v1.2025',
        };
        return {
          statusText: 'ENDİKE: SOLİTER PLAZMASİTOMDA KÜRATİF LOKAL RT',
          badgeClass: 'bg-emerald-50 text-emerald-800 border-emerald-300',
          primaryScheme: plasmacytoma,
          alternativeSchemes: [plasmacytoma],
        };
      }

      if (hematologicSubtype === 'Myeloma') {
        const singleFraction = myelomaFractionation === 'TekFx';
        const doseGy = singleFraction ? 8 : myelomaFractionation === '30Gy' ? 30 : 20;
        const fractionCount = singleFraction ? 1 : doseGy === 30 ? 10 : 5;
        const myeloma: DoseScheme = {
          id: singleFraction ? 'myeloma-palliative-8' : `myeloma-palliative-${doseGy}`,
          name: `${doseGy} Gy / ${fractionCount} fx (Palyatif Miyelom RT)`,
          tag: 'Multipl Miyelom - Semptom Kontrolü',
          totalDoseGy: doseGy,
          fractionCount,
          fractionDoseGy: doseGy / fractionCount,
          alphaBeta: 10,
          technique: '3D-CRT / IMRT; omurga instabilitesinde cerrahi görüş',
          indication: 'Ağrılı litik lezyon, epidural hastalık veya patolojik fraktür riski için semptom odaklı palyatif RT; hematoloji ve ortopedi/nöroşirürji ile eşgüdüm gerekir.',
          targetVolumes: [{ name: 'PTV_Symptomatic_Lesion', doseGy, marginMm: 'Görüntüleme ve anatomik sınırlara göre', anatomical: 'Ağrılı litik veya fraktür riski taşıyan lezyon' }],
          oars: [{ organ: 'Spinal kord', metric: 'Dmax', limit: 'Fraksiyonasyona uygun QUANTEC sınırları', source: 'QUANTEC' }],
          evidence: 'ASTRO Bone Metastases Guideline; ILROG Myeloma Guidance',
        };
        return {
          statusText: 'ENDİKE: SEMPTOMATİK MİYELOM LEZYONUNDA PALYATİF RT',
          badgeClass: 'bg-indigo-50 text-indigo-800 border-indigo-300',
          primaryScheme: myeloma,
          alternativeSchemes: [myeloma],
        };
      }

      const isCR = lymphomaResponse === 'Tam_Yanit';
      const dose = isCR ? 20 : 30;
      const lymphomaScheme: DoseScheme = {
        id: 'lymphoma-isrt',
        name: `${dose} Gy / ${dose / 2} fx (Tutulu Alan Radyoterapisi - ISRT)`,
        tag: isCR ? '✨ Konsolidasyon ISRT' : '🔬 Refrakter / Rezidü ISRT',
        totalDoseGy: dose,
        fractionCount: dose / 2,
        fractionDoseGy: 2.0,
        alphaBeta: 10,
        technique: 'IMRT / VMAT (ISRT Prensipleri)',
        indication: 'Kemoterapi sonrası tutulu alana konsolidasyon RT nüks riskini %50\'den fazla azaltır.',
        targetVolumes: [
          { name: 'CTV_ISRT', doseGy: dose, marginMm: 'Pre-KT GTV ile sınırlı', anatomical: 'Başlangıçta tutulu lenf nodu hacmi' },
        ],
        oars: [
          { organ: 'Kalp', metric: 'Dmean', limit: '< 5 Gy', source: 'ILROG Guidelines' },
          { organ: 'Akciğer V20Gy', metric: 'V20Gy', limit: '< 10%', source: 'ILROG' },
        ],
        systemicTherapy: 'ABVD, brentuximab veya R-CHOP kemoterapisini takiben.',
        evidence: 'ILROG Guidelines, HD16/HD17 Trials (Lancet Oncol)',
      };
      return {
        statusText: 'ENDİKE: KONSOLİDASYON TUTULU ALAN RT (ISRT)',
        badgeClass: 'bg-emerald-50 text-emerald-800 border-emerald-300',
        primaryScheme: lymphomaScheme,
        alternativeSchemes: [lymphomaScheme],
      };
    }

    // ------------------------------------------
    // 11. PEDİATRİK
    // ------------------------------------------
    if (selectedOrgan === 'pediatric') {
      const isHighRisk = pediatricRisk === 'Yuksek';
      if (pediatricSubtype === 'Wilms') {
        const highRiskWilms = selectedT === 'III' || wilmsStage === 'Evre_III_Anaplazi';
        const wholeAbdomen = highRiskWilms && wilmsWholeAbdomen;
        const wilms: DoseScheme = {
          id: wholeAbdomen ? 'wilms-whole-abdomen-105' : highRiskWilms ? 'wilms-flank-108' : 'wilms-observe',
          name: !highRiskWilms ? 'RT Gerekmez - İzlem' : wholeAbdomen ? '10.5 Gy / 7 fx (Tüm Batın RT)' : '10.8 Gy / 6 fx (Flank RT)',
          tag: !highRiskWilms ? 'Erken Evre / Uygun Histoloji' : 'Wilms Tümörü - Risk Uyarlanmış RT',
          totalDoseGy: highRiskWilms ? wholeAbdomen ? 10.5 : 10.8 : 0,
          fractionCount: highRiskWilms ? wholeAbdomen ? 7 : 6 : 0,
          fractionDoseGy: highRiskWilms ? wholeAbdomen ? 1.5 : 1.8 : 0,
          alphaBeta: 10,
          technique: 'Pediatrik IMRT / 3D-CRT; böbrek, karaciğer ve büyüme dokularını koru',
          indication: highRiskWilms
            ? 'Evre III veya fokal/diffüz anaplazide protokol ve histolojiye göre flank RT; yaygın peritoneal kontaminasyon/implantlarda tüm batın RT değerlendirilir. Alan ve doz çocuk onkoloji protokolüne göre doğrulanmalıdır.'
            : 'Erken evre ve uygun histolojide RT rutin olarak gerekli olmayabilir; çocuk onkoloji protokolüne göre izlem.',
          targetVolumes: highRiskWilms ? [{ name: wholeAbdomen ? 'CTV_Whole_Abdomen' : 'CTV_Flank', doseGy: wholeAbdomen ? 10.5 : 10.8, marginMm: 'COG / SIOP protokol sınırları', anatomical: wholeAbdomen ? 'Peritoneal yayılım / tüm batın endikasyonu' : 'İpsilateral flank ve tümör yatağı' }] : [],
          oars: [{ organ: 'Kontralateral böbrek', metric: 'Dmean', limit: 'Mümkün olduğunca düşük', source: 'COG / PENTEC' }],
          systemicTherapy: 'Çocuk onkoloji protokolü ve evreye göre sistemik tedavi.',
          evidence: 'COG AREN0532 / AREN0533; SIOP-RTSG UMBRELLA',
        };
        return {
          statusText: highRiskWilms ? 'ENDİKE: WILMS TÜMÖRÜNDE EVRE / HİSTOLOJİYE GÖRE PEDİATRİK RT' : 'RİSK UYARLI İZLEM: ERKEN EVRE WILMS TÜMÖRÜNDE RT GEREKMEYEBİLİR',
          badgeClass: highRiskWilms ? 'bg-emerald-50 text-emerald-800 border-emerald-300' : 'bg-slate-100 text-slate-700 border-slate-300',
          primaryScheme: wilms,
          alternativeSchemes: [wilms],
        };
      }

      if (pediatricSubtype === 'Neuroblastom') {
        const neuroblastoma: DoseScheme = {
          id: 'neuroblastoma-primary-216',
          name: '21.6 Gy / 12 fx (Yüksek Risk Primer Yatak RT)',
          tag: 'Nöroblastom - Yüksek Risk',
          totalDoseGy: 21.6,
          fractionCount: 12,
          fractionDoseGy: 1.8,
          alphaBeta: 10,
          technique: 'Pediatrik IMRT / proton; böbrek, karaciğer ve omurilik koruması',
          indication: 'Yüksek risk nöroblastomda primer tümör yatağına konsolidatif RT, indüksiyon ve transplantasyon/immünoterapi protokolüyle koordine edilir.',
          targetVolumes: [{ name: 'CTV_Primary_Bed', doseGy: 21.6, marginMm: 'Başlangıç görüntüleme ve protokol sınırları', anatomical: 'Primer tümör yatağı ve rezidüel hastalık' }],
          oars: [{ organ: 'Böbrekler', metric: 'Dmean', limit: 'Mümkün olduğunca düşük', source: 'COG / PENTEC' }, { organ: 'Spinal kord', metric: 'Dmax', limit: 'Protokol sınırları içinde', source: 'QUANTEC' }],
          systemicTherapy: 'İndüksiyon kemoterapisi, kök hücre nakli ve anti-GD2 tedavisiyle protokol uyumu.',
          evidence: 'COG high-risk neuroblastoma protocols; PENTEC',
        };
        return {
          statusText: 'ENDİKE: YÜKSEK RİSK NÖROBLASTOMDA PRİMER YATAK KONSOLİDASYONU',
          badgeClass: 'bg-emerald-50 text-emerald-800 border-emerald-300',
          primaryScheme: neuroblastoma,
          alternativeSchemes: [neuroblastoma],
        };
      }

      if (pediatricSubtype === 'Ewing') {
        const pediatricEwing: DoseScheme = {
          id: 'pediatric-ewing-558',
          name: '45-55.8 Gy (İndüksiyon KT Sonrası Ewing RT)',
          tag: 'Pediatrik Ewing Sarkomu',
          totalDoseGy: 55.8,
          fractionCount: 31,
          fractionDoseGy: 1.8,
          alphaBeta: 10,
          technique: 'IMRT / proton; başlangıçtaki tümör hacmi ve kemik yatağı dikkate alınır',
          indication: 'Cerrahiye uygun olmayan, rezidüel veya seçilmiş yüksek riskli Ewing sarkomunda indüksiyon kemoterapisi sonrası definitif/adjuvan RT; doz ve hacimler protokole göre bireyselleştirilir.',
          targetVolumes: [{ name: 'CTV_Initial_Disease', doseGy: 45, marginMm: 'Pre-KT başlangıç hacmine göre', anatomical: 'Kemoterapi öncesi kemik ve yumuşak doku hastalığı' }, { name: 'CTV_Boost', doseGy: 55.8, marginMm: 'Rezidüel hacim', anatomical: 'Post-KT rezidüel tümör / yüksek risk alanı' }],
          oars: [{ organ: 'Büyüme plakları', metric: 'Dmean', limit: 'Mümkün olduğunca koru', source: 'PENTEC' }, { organ: 'Komşu eklem', metric: 'V50Gy', limit: 'Hedef hacimle optimize et', source: 'QUANTEC' }],
          systemicTherapy: 'VDC/IE temelli çok ajanlı kemoterapi protokolüyle koordine edilir.',
          evidence: 'COG / Euro-EWING protocols; PENTEC',
        };
        return {
          statusText: 'ENDİKE: PEDİATRİK EWING SARKOMUNDA PROTOKOL UYUMLU LOKAL KONTROL',
          badgeClass: 'bg-emerald-50 text-emerald-800 border-emerald-300',
          primaryScheme: pediatricEwing,
          alternativeSchemes: [pediatricEwing],
        };
      }

      const csiDose = isHighRisk ? 36 : 23.4;
      const boostDose = 54;
      const pediaScheme: DoseScheme = {
        id: 'pedia-csi',
        name: `CSI ${csiDose} Gy + Boost ${boostDose} Gy (Medulloblastom CSI)`,
        tag: isHighRisk ? '⚡ Yüksek Risk CSI' : '🛡️ Standart Risk CSI',
        totalDoseGy: boostDose,
        fractionCount: 30,
        fractionDoseGy: 1.8,
        alphaBeta: 10,
        technique: 'Proton Beam veya VMAT (Kraniyospinal Eksen Işınlama)',
        indication: 'Medulloblastomda nöroaksiyel yayılımı önlemek için kraniyospinal aks ışınlanır, ardından tümör yatağı 54 Gy\'e tamamlanır.',
        targetVolumes: [
          { name: 'CTV_CSI', doseGy: csiDose, marginMm: 'Tüm nöroaksis', anatomical: 'Tüm beyin, tekal kese ve kauda ekuina sonlanımına kadar' },
          { name: 'PTV_Boost', doseGy: boostDose, marginMm: 'Kavite + 15 mm', anatomical: 'Posterior fossa tümör yatağı' },
        ],
        oars: [
          { organ: 'Koklea', metric: 'Dmean', limit: '< 35 Gy', source: 'PENTEC (İşitme kaybı)' },
          { organ: 'Tiroid / Kalp', metric: 'ALARA', limit: 'Minimal doz', source: 'PENTEC' },
        ],
        systemicTherapy: 'Kemoterapi protokolleri (Cisplatin, Lomustine, Vincristine).',
        evidence: 'SIOP PNET 4, COG A9961',
      };
      return {
        statusText: 'ENDİKE: KRANİYOSPİNAL AKS VE TÜMÖR YATAĞI BOOST (CSI)',
        badgeClass: 'bg-emerald-50 text-emerald-800 border-emerald-300 shadow-[0_0_15px_rgba(16,185,129,0.25)]',
        primaryScheme: pediaScheme,
        alternativeSchemes: [pediaScheme],
      };
    }

    // ------------------------------------------
    // 12. PALYATİF BAKIM
    // ------------------------------------------
    const palDose = selectedN === 'TekFx' ? 8 : 20;
    const palFx = palDose === 8 ? 1 : 5;
    const palScheme: DoseScheme = {
      id: `palliative-${palDose}`,
      name: `${palDose} Gy / ${palFx} fx (Palyatif Ağrı / Kitle Kontrolü)`,
      tag: palDose === 8 ? '🎯 8 Gy Tek Fraksiyon (Kategori 1)' : '🛡️ 20 Gy / 5 fx Fraksiyone',
      totalDoseGy: palDose,
      fractionCount: palFx,
      fractionDoseGy: palDose === 8 ? 8 : 4,
      alphaBeta: 10,
      technique: '3D-CRT / Basit Konformal',
      indication: palDose === 8
        ? 'Ağrılı kemik metastazlarında 8 Gy tek fraksiyon, çoklu fraksiyonlarla eşit ağrı palyasyonu sağlar; hasta ve yakınları için en yüksek konforu sunar (Kategori 1).'
        : 'Spinal kord basısı veya uzun sağkalım beklenen oligometastatik olgularda çoklu fraksiyon re-treatment oranını düşürür.',
      targetVolumes: [{ name: 'GTV_Palliative', doseGy: palDose, marginMm: '0 mm', anatomical: 'Metastatik lezyon' }],
      oars: [{ organ: 'Spinal Kord', metric: 'Dmax', limit: palDose === 8 ? '< 8 Gy' : '< 18 Gy', source: 'QUANTEC' }],
      evidence: 'ASTRO Bone Metastases Guidelines, Chow et al. Meta-analysis',
    };
    return {
      statusText: 'ENDİKE: HIZLI VE ETKİN PALYATİF RADYOTERAPİ',
      badgeClass: 'bg-indigo-50 text-indigo-800 border-indigo-300',
      primaryScheme: palScheme,
      alternativeSchemes: [palScheme],
    };
  }, [
    selectedOrgan,
    selectedSubsite,
    benignClinicalStatus,
    selectedT,
    selectedN,
    selectedM,
    thoraxSubtype,
    thoraxCentrality,
    thoraxSurgeryStatus,
    sclcStage,
    sclcTiming,
    thymomaStage,
    thymomaMargin,
    mesoIntent,
    gynSite,
    cervixScenario,
    endoRisk,
    ovaryScenario,
    vulvaScenario,
    sarcomaSubtype,
    dfspStatus,
    sarcomaSurgery,
    osteoScenario,
    ewingIntent,
    hnSubsite,
    hnLarynxSubsite,
    cnsSubtype,
    cnsMidlineShift,
    cnsMetCount,
    cnsMaxDiameter,
    cnsSymptoms,
    cnsResection,
    meningiomaSimpson,
    cnsKps,
    gbmPerformance,
    meningiomaGrade,
    gisOrgan,
    gusSubtype,
    gleasonPrimary,
    gleasonSecondary,
    psaLevel,
    hasECE,
    hasSVI,
    positiveCorePercent,
    bladderTurbtComplete,
    bladderTmtSuitable,
    breastHistology,
    breastMenopause,
    breastSurgery,
    breastMargin,
    breastBoost,
    breastER,
    breastPR,
    breastHER2,
    breastKi67,
    breastGrade,
    phyllodesMarginCm,
    phyllodesHighGrade,
    hnCrossesMidline,
    hnDistanceFromMidlineCm,
    hnTumorSizeCm,
    hnDoiMm,
    hnENE,
    hnPositiveMargin,
    skinHistology,
    skinMargin,
    skinDepthMm,
    skinPerineuralInvasion,
    skinBoneInvasion,
    hematologicSubtype,
    lymphomaResponse,
    myelomaFractionation,
    pediatricSubtype,
    pediatricRisk,
    wilmsStage,
    wilmsWholeAbdomen,
  ]);

  // Aktif Şema
  const activeScheme = useMemo(() => {
    const list = evaluatedDecision.alternativeSchemes;
    return list.find(s => s.id === selectedSchemeId) || evaluatedDecision.primaryScheme;
  }, [evaluatedDecision, selectedSchemeId]);

  // Canlı Radyobiyoloji Hesabı
  const radiobiology = useMemo(() => {
    const D = activeScheme.totalDoseGy;
    const d = activeScheme.fractionDoseGy;
    const ab = activeScheme.alphaBeta;
    if (D <= 0 || d <= 0) return { bed: '0.0', eqd2: '0.0', ab };
    const bed = D * (1 + d / ab);
    const eqd2 = D * ((d + ab) / (2 + ab));
    return { bed: bed.toFixed(1), eqd2: eqd2.toFixed(1), ab };
  }, [activeScheme]);

  const casePrompt = useMemo(
    () =>
      generateCasePrompt(
        selectedOrgan,
        tText(selectedSubsite),
        selectedT,
        selectedN,
        selectedM,
        tText(activeScheme.name),
        `${activeScheme.totalDoseGy} Gy / ${activeScheme.fractionCount} fx`,
        undefined,
        lang,
      ),
    [activeScheme, lang, selectedM, selectedN, selectedOrgan, selectedSubsite, selectedT],
  );
  const copyCasePrompt = () => {
    if (!navigator.clipboard) {
      window.alert(lang === 'tr' ? 'Panoya kopyalama desteklenmiyor.' : 'Clipboard access is not supported.');
      return;
    }
    void navigator.clipboard.writeText(casePrompt).then(
      () => {
        setCopiedPrompt(true);
        window.setTimeout(() => setCopiedPrompt(false), 3000);
      },
      () => window.alert(lang === 'tr' ? 'Vaka sorusu panoya kopyalanamadı.' : 'The case prompt could not be copied.'),
    );
  };

  // Klinik Rapor Metni Kopyalama
  const clinicalSummaryText = useMemo(() => {
    const labels = {
      clinicalSummary: lang === 'tr' ? 'KLİNİK KARAR VE REÇETE ÖZETİ' : 'CLINICAL DECISION AND PRESCRIPTION SUMMARY',
      organSystem: lang === 'tr' ? 'Organ Sistemi' : 'Organ System',
      subsite: lang === 'tr' ? 'Alt Tip' : 'Subsite',
      stage: lang === 'tr' ? 'Evreleme' : 'Stage',
      decision: lang === 'tr' ? 'Karar Durumu' : 'Decision',
      prescription: lang === 'tr' ? 'Önerilen Reçete' : 'Recommended Prescription',
      totalDose: lang === 'tr' ? 'Toplam Doz' : 'Total Dose',
      fraction: lang === 'tr' ? 'Fraksiyon' : 'Fraction',
      technique: lang === 'tr' ? 'Teknik' : 'Technique',
      radiobiology: lang === 'tr' ? 'Radyobiyoloji' : 'Radiobiology',
      oarConstraints: lang === 'tr' ? 'Kritik Organ Kısıtları' : 'Organs-at-Risk Constraints',
      evidence: lang === 'tr' ? 'Kanıt ve Kılavuz' : 'Evidence and Guidelines',
      symptom: lang === 'tr' ? 'semptom' : 'symptoms',
      resection: lang === 'tr' ? 'rezeksiyon' : 'resection',
      nccnRisk: lang === 'tr' ? 'NCCN risk' : 'NCCN risk',
      positiveCores: lang === 'tr' ? 'pozitif kor' : 'positive cores',
      menopause: lang === 'tr' ? 'menopoz' : 'menopausal status',
      margin: lang === 'tr' ? 'marjin' : 'margin',
      depth: lang === 'tr' ? 'derinlik' : 'depth',
      fractionation: lang === 'tr' ? 'fraksiyonasyon' : 'fractionation',
      risk: lang === 'tr' ? 'risk' : 'risk',
      bilateralNeck: lang === 'tr' ? 'bilateral boyun' : 'bilateral neck',
      lateralizedNeck: lang === 'tr' ? 'lateralize boyun' : 'lateralized neck',
      positive: lang === 'tr' ? 'pozitif' : 'positive',
      negative: lang === 'tr' ? 'negatif' : 'negative',
      organ: lang === 'tr' ? 'Organ Sistemi' : 'Organ System',
      fx: 'fx',
    };
    const organNames: Record<OrganId, string> = {
      thorax: 'Thorax',
      prostate: 'Genitourinary',
      breast: 'Breast',
      gis: 'Gastrointestinal',
      'head-neck': 'Head and Neck',
      cns: 'Central Nervous System',
      gynecology: 'Gynecology',
      'bone-sarcoma': 'Bone and Sarcoma',
      skin: 'Skin',
      hematologic: 'Hematologic',
      pediatric: 'Pediatric',
      palliative: 'Palliative',
      benign: 'Benign Conditions',
    };
    let subInfo = '';
    if (selectedOrgan === 'thorax') subInfo = `${labels.subsite}: ${tText(thoraxSubtype)}`;
    if (selectedOrgan === 'gynecology') subInfo = `${labels.subsite}: ${tText(gynSite)}`;
    if (selectedOrgan === 'bone-sarcoma') subInfo = `${labels.subsite}: ${tText(sarcomaSubtype)}`;
    if (selectedOrgan === 'head-neck') subInfo = `${labels.subsite}: ${tText(hnSubsite)}`;
    if (selectedOrgan === 'head-neck') subInfo += `; ${hnCrossesMidline || (parseFloat(hnDistanceFromMidlineCm) || 0) < 1 ? labels.bilateralNeck : labels.lateralizedNeck}; DOI ${hnDoiMm} mm`;
    if (selectedOrgan === 'cns') subInfo = `${labels.subsite}: ${tText(cnsSubtype)}; ${labels.symptom}: ${tText(cnsSymptoms)}; KPS ${cnsKps}; ${labels.resection}: ${tText(cnsResection)}`;
    if (selectedOrgan === 'gis') subInfo = `${labels.organ}: ${tText(gisOrgan)}`;
    if (selectedOrgan === 'prostate') subInfo = gusSubtype === 'prostate'
      ? `${labels.organ}: ${tText(gusSubtype)}; ${labels.nccnRisk}: ${tText(prostateRiskLabel)}; PSA ${psaLevel}; Gleason ${gleasonPrimary}+${gleasonSecondary}; ${labels.positiveCores} ${positiveCorePercent}%`
      : `${labels.organ}: ${tText(gusSubtype)}`;
    if (selectedOrgan === 'breast') subInfo = `${tText(breastHistology)}; ${labels.menopause} ${tText(breastMenopause)}; ER ${breastER ? '+' : '-'}, PR ${breastPR ? '+' : '-'}, HER2 ${breastHER2 ? '+' : '-'}, Ki-67 ${breastKi67}%, Grade ${breastGrade}`;
    if (selectedOrgan === 'skin') subInfo = `${tText(skinHistology)}; ${labels.margin} ${tText(skinMargin)}; ${labels.depth} ${skinDepthMm} mm; PNI ${skinPerineuralInvasion ? labels.positive : labels.negative}`;
    if (selectedOrgan === 'hematologic') subInfo = `${tText(hematologicSubtype)}${hematologicSubtype === 'Myeloma' ? `; ${labels.fractionation} ${tText(myelomaFractionation)}` : ''}`;
    if (selectedOrgan === 'pediatric') subInfo = `${tText(pediatricSubtype)}${pediatricSubtype === 'Medulloblastom' ? `; ${labels.risk} ${tText(pediatricRisk)}` : pediatricSubtype === 'Wilms' ? `; ${tText(wilmsStage)}` : ''}`;

    return `${labels.clinicalSummary} (RadOnco CDSS)
${labels.organSystem}: ${lang === 'tr' ? selectedOrgan.toUpperCase() : organNames[selectedOrgan]} (${subInfo})
${labels.stage}: ${selectedT} ${selectedN} ${selectedM}
${labels.decision}: ${tText(evaluatedDecision.statusText)}
${labels.prescription}: ${tText(activeScheme.name)} [${tText(activeScheme.tag)}]
${labels.totalDose}: ${activeScheme.totalDoseGy} Gy | ${labels.fraction}: ${activeScheme.fractionCount} ${labels.fx} (${activeScheme.fractionDoseGy} Gy/${labels.fx})
${labels.technique}: ${tText(activeScheme.technique)}
${labels.radiobiology}: BED: ${radiobiology.bed} Gy | EQD2: ${radiobiology.eqd2} Gy (α/β = ${radiobiology.ab})
${labels.oarConstraints}:
${activeScheme.oars.map(o => ` * ${tText(o.organ)}: ${tText(o.metric)} ${o.limit} (${tText(o.source)})`).join('\n')}
${labels.evidence}: ${tText(activeScheme.evidence)}`;
  }, [
    lang, selectedOrgan, thoraxSubtype, gynSite, sarcomaSubtype, hnSubsite, cnsSubtype, gisOrgan, gusSubtype,
    selectedT, selectedN, selectedM, evaluatedDecision, activeScheme, radiobiology,
    hnCrossesMidline, hnDistanceFromMidlineCm, hnDoiMm, cnsSymptoms, cnsKps, cnsResection,
    prostateRiskLabel, psaLevel, gleasonPrimary, gleasonSecondary, positiveCorePercent,
    breastHistology, breastMenopause, breastER, breastPR, breastHER2, breastKi67, breastGrade, breastBoost,
    skinHistology, skinMargin, skinDepthMm, skinPerineuralInvasion, hematologicSubtype,
    myelomaFractionation, pediatricSubtype, pediatricRisk, wilmsStage, tText,
  ]);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(clinicalSummaryText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const prescriptionTarget = selectedOrgan === 'breast' && breastHistology !== 'Malign Filloides Tümörü'
    ? 'Tüm Meme (WBRT)'
    : activeScheme.targetVolumes[0]?.anatomical || 'Klinik hedef hacimler';
  const translatePrescriptionBadge = (badge: string | undefined, fallback: string) => {
    const value = badge || fallback;
    if (lang === 'tr') return value;
    const exactTranslations: Record<string, string> = {
      'Hedef: 4D-CT tüm solunum hareket hacmi': 'Target: 4D-CT full respiratory motion ITV',
      'Nodal: Elektif nodal hedef yok': 'Nodal: No elective nodal irradiation',
      'Teknik & Hareket: SBRT (4D-CT / ITV VMAT)': 'Technique: SBRT (4D-CT / ITV VMAT)',
      'Teknik: SBRT (4D-CT / ITV VMAT)': 'Technique: SBRT (4D-CT / ITV VMAT)',
      'Nodal: Uygulanmaz (Benign)': 'Nodal: Not applicable (benign)',
      'RNI: Elektif Nodal Yapılmaz (DCIS)': 'RNI: No elective nodal irradiation (DCIS)',
      'RNI: Elektif Nodal Yapılmaz (Filloides)': 'RNI: No elective nodal irradiation (phyllodes)',
      'RNI: Elektif Nodal Yapılmaz (pN0)': 'RNI: No elective nodal irradiation (pN0)',
      'RNI: Düzey I-IV + SC Kapsanır': 'RNI: Include levels I-IV and supraclavicular nodes',
    };
    if (exactTranslations[value]) return exactTranslations[value];
    return value
      .replace(/^Hedef:/, 'Target:')
      .replace(/^Teknik & Hareket:/, 'Technique:')
      .replace(/^Teknik:/, 'Technique:')
      .replace(/^RNI:/, 'RNI:')
      .replace(/^Nodal:/, 'Nodal:');
  };
  const prescriptionTargetBadge = translatePrescriptionBadge(evaluatedDecision.targetVolumeBadge, `Hedef: ${prescriptionTarget}`);
  const prescriptionTechniqueBadge = translatePrescriptionBadge(evaluatedDecision.techniqueBadge, `Teknik & Hareket: ${activeScheme.technique}`);
  const breastNodalSummary = selectedOrgan === 'breast'
    ? breastHistology === 'Duktal Karsinoma In Situ (DCIS)'
      ? 'RNI: Elektif Nodal Yapılmaz (DCIS)'
      : breastHistology === 'Malign Filloides Tümörü'
        ? 'RNI: Elektif Nodal Yapılmaz (Filloides)'
        : selectedN === 'N0'
          ? 'RNI: Elektif Nodal Yapılmaz (pN0)'
          : 'RNI: Düzey I-IV + SC Kapsanır'
    : undefined;
  const prescriptionNodalTarget = activeScheme.targetVolumes.find(volume =>
    /rni|nodal|neck|supraclav|level|lenf/i.test(`${volume.name} ${volume.anatomical}`)
  );
  const prescriptionNodalSummary = translatePrescriptionBadge(evaluatedDecision.nodalStatusBadge,
    (breastNodalSummary
    || (prescriptionNodalTarget
      ? `Nodal: ${prescriptionNodalTarget.anatomical}`
      : 'Nodal: Elektif nodal hedef yok')));

  if (!isLoaded) {
    return (
      <div className="min-h-screen w-full flex flex-col items-center justify-center bg-[#f8fafc] dark:bg-[#080e1a] text-slate-800 dark:text-slate-200 font-sans" role="status" aria-live="polite">
        <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4" aria-hidden="true" />
        <div className="text-sm font-bold tracking-tight text-slate-900 dark:text-white">
          {lang === 'tr' ? 'Kurumsal Kimlik Bilgileri Doğrulanıyor...' : 'Verifying Institutional Credentials...'}
        </div>
        <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          {lang === 'tr' ? 'Verifying institutional credentials' : 'Kurumsal hekim doğrulaması yapılıyor'}
        </div>
      </div>
    );
  }

  if (user && !isDoctor) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-[#f8fafc] p-6 text-slate-900 font-sans">
        <div className="w-full max-w-md rounded-2xl bg-white border border-slate-200 p-8 shadow-xl text-center">
          <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-600 border border-rose-200 flex items-center justify-center mx-auto mb-4 font-bold text-xl" aria-hidden="true">{tText("!")}</div>
          <h2 className="text-xl font-bold text-slate-900 mb-2">{tText("Kurumsal Hekim Erişimi / Institutional Access")}</h2>
          <p className="text-xs text-slate-600 leading-relaxed mb-6">
            {tText("\n            RadOnc CDSS is restricted to licensed physicians and institutional medical personnel. Yalnızca kurumsal hekim e-postaları geçerlidir.\n          ")}</p>
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 mb-6 text-left text-xs font-mono">
            <div className="text-slate-500">{tText("Account: ")}<span className="text-rose-600 font-bold">{email}</span></div>
            <div className="text-slate-500">{tText("Allowed: ")}<span className="text-emerald-700 font-bold">{tText("@saglik.gov.tr, @*.edu.tr, @*.edu, @nhs.net, @*.ac.uk")}</span></div>
          </div>
          <SignOutButton redirectUrl="/sign-in">
            <button type="button" className="w-full py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold shadow focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2">
              {tText("\n              Farklı Hesapla Giriş / Sign In with Another Account\n            ")}</button>
          </SignOutButton>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen w-full flex flex-col font-sans transition-colors ${theme === 'light' ? 'bg-[#f8fafc] text-slate-800' : 'bg-[#080e1a] text-slate-100'}`}>

      {/* ==========================================
          HEADER: PARILDAYAN RADYASYON LOGOSU
         ========================================== */}
      <header className={`w-full border-b backdrop-blur px-6 py-3 flex items-center justify-between sticky top-0 z-50 transition-colors ${theme === 'light' ? 'bg-white/95 border-slate-200 text-slate-900' : 'bg-[#0d1527]/95 border-slate-800 text-white'}`}>
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-md bg-amber-50 border border-amber-200 text-amber-700 shadow-[0_1px_3px_rgba(0,0,0,0.05)]">
            <Radiation className="w-6 h-6" aria-hidden="true" />
          </div>
          <div>
            <h1 className={`text-base font-bold ${theme === 'light' ? 'text-[#0f294a]' : 'text-slate-100'}`}>
              {lang === 'tr' ? 'Radyasyon Onkolojisi Klinik Karar Destek Sistemi' : 'Radiation Oncology Clinical Decision Support System'}
            </h1>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <button
            onClick={() => {
              setActiveReferenceTab('guidelines');
              setShowGuidelineModal(true);
            }}
            className="flex items-center gap-1.5 text-xs bg-[#0f294a] hover:bg-blue-950 text-white px-3 py-1.5 rounded-lg border border-[#0f294a] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
          >
            <BookOpen className="w-4 h-4 text-amber-700" />
            {tText("\n            📖 ")}{lang === 'tr' ? 'Kılavuz İlkeleri' : 'Clinical Guidelines'}
          </button>
          <button
            type="button"
            onClick={toggleTheme}
            aria-label={theme === 'light' ? 'Koyu temaya geç' : 'Açık temaya geç'}
            aria-pressed={theme === 'dark'}
            className="p-2 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-amber-500 dark:text-blue-400 transition-colors"
          >
            {theme === 'light' ? <Moon className="h-4 w-4" aria-hidden="true" /> : <Sun className="h-4 w-4" aria-hidden="true" />}
          </button>
          <div className="flex items-center rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-0.5 text-xs font-semibold" aria-label={lang === 'tr' ? 'Dil' : 'Language'}>
            <button
              type="button"
              onClick={() => changeLanguage('en')}
              aria-pressed={lang === 'en'}
              className={`px-2 py-1 rounded-md transition ${lang === 'en' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'}`}
            >
              EN
            </button>
            <button
              type="button"
              onClick={() => changeLanguage('tr')}
              aria-pressed={lang === 'tr'}
              className={`px-2 py-1 rounded-md transition ${lang === 'tr' ? 'bg-slate-900 text-white shadow-sm' : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'}`}
            >
              TR
            </button>
          </div>
          <Show when="signed-out">
            <SignInButton mode="redirect">
              <button type="button" className="rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700">
                {lang === 'tr' ? 'Giriş yap' : 'Sign in'}
              </button>
            </SignInButton>
            <SignUpButton mode="redirect">
              <button type="button" className="rounded-md bg-[#0f294a] dark:bg-blue-700 px-3 py-1.5 text-xs font-semibold text-white hover:bg-blue-950 dark:hover:bg-blue-600">
                {lang === 'tr' ? 'Kayıt ol' : 'Sign up'}
              </button>
            </SignUpButton>
          </Show>
          <Show when="signed-in">
            <UserButton />
          </Show>
        </div>
      </header>

      {/* ==========================================
          ORGAN SEÇİM ŞERİDİ (12 ORGAN TAM LİSTE)
         ========================================== */}
      <nav className={`w-full px-6 py-2 transition-colors ${theme === 'light' ? 'bg-[#f8fafc]' : 'bg-[#080e1a]'}`}>
        <div className={`w-full border rounded-lg p-1 shadow-sm mb-4 transition-colors ${theme === 'light' ? 'bg-white border-slate-200' : 'bg-[#0b1324] border-slate-800'}`}>
          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 xl:grid-cols-13 items-center divide-x divide-slate-100 dark:divide-slate-700/60">
        {[
          { id: 'thorax', name_tr: 'Toraks', name_en: 'Thorax', icon: Wind, color: 'text-sky-700' },
          { id: 'prostate', name_tr: 'GÜS', name_en: 'GU', icon: Droplets, color: 'text-blue-700' },
          { id: 'breast', name_tr: 'Meme', name_en: 'Breast', icon: CircleDot, color: 'text-pink-700' },
          { id: 'gis', name_tr: 'GİS', name_en: 'GI', icon: UtensilsCrossed, color: 'text-orange-700' },
          { id: 'head-neck', name_tr: 'Baş-Boyun', name_en: 'Head & Neck', icon: User, color: 'text-indigo-700' },
          { id: 'cns', name_tr: 'MSS', name_en: 'CNS', icon: Brain, color: 'text-purple-700' },
          { id: 'gynecology', name_tr: 'Jinekoloji', name_en: 'Gynecology', icon: Sparkles, color: 'text-rose-700' },
          { id: 'bone-sarcoma', name_tr: 'Kemik & Sarkom', name_en: 'Bone & Sarcoma', icon: Bone, color: 'text-amber-700' },
          { id: 'skin', name_tr: 'Cilt', name_en: 'Skin', icon: Shield, color: 'text-yellow-700' },
          { id: 'hematologic', name_tr: 'Hematolojik', name_en: 'Hematologic', icon: Droplet, color: 'text-red-700' },
          { id: 'pediatric', name_tr: 'Pediatrik', name_en: 'Pediatric', icon: Baby, color: 'text-emerald-700' },
          { id: 'palliative', name_tr: 'Palyatif', name_en: 'Palliative', icon: HandHeart, color: 'text-teal-700' },
          { id: 'benign', name_tr: 'Benign', name_en: 'Benign', icon: ShieldCheck, color: 'text-emerald-700' },
        ].map(item => {
          const Icon = item.icon;
          const isActive = selectedOrgan === item.id;
          const displayName = lang === 'en' ? item.name_en : item.name_tr;
          return (
            <button
              key={item.id}
              onClick={() => handleOrganChange(item.id as OrganId)}
              className={`min-w-0 py-2 px-1 text-xs font-medium text-center flex items-center justify-center gap-1.5 rounded-md transition-colors ${
                isActive
                  ? item.id === 'benign'
                    ? 'bg-emerald-600 text-white font-semibold shadow-sm'
                    : 'bg-slate-900 dark:bg-blue-600 text-white font-semibold shadow-sm'
                  : item.id === 'benign'
                    ? 'text-emerald-800 dark:text-emerald-300 hover:text-emerald-900 dark:hover:text-emerald-100 hover:bg-emerald-50 dark:hover:bg-emerald-900/30'
                    : theme === 'light'
                      ? 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : item.color}`} />
              <span>{displayName}</span>
            </button>
          );
        })}
          </div>
        </div>
      </nav>

      {/* ==========================================
          12 KOLONLUK FULL-WIDTH GRID
         ========================================== */}
      <main className="flex-1 p-5 grid grid-cols-12 gap-5 max-w-[1920px] w-full mx-auto">

        {/* ==========================================
            SOL SÜTUN (3 KOLON): PATOLOJİ, ALT BAŞLIKLAR & RİSK FAKTÖRLERİ
           ========================================== */}
        <aside className="col-span-12 lg:col-span-3 flex flex-col gap-4">
          <div className={`rounded-2xl border p-5 ${theme === 'light' ? 'bg-white border-slate-200 shadow-sm text-slate-800' : 'bg-[#0d172a] border-slate-800 text-slate-200'}`}>
            <h2 className="text-xs font-bold text-slate-600 uppercase tracking-wider mb-2.5 flex items-center justify-between">
              <span>{lang === 'tr' ? 'ORGAN & ALT BAŞLIK SEÇİMİ' : 'ORGAN & SUBSITE SELECTION'}</span>
              <span className="text-[10px] text-amber-700 font-normal">{lang === 'tr' ? 'Kılavuz Tanımlı' : 'Guideline-defined'}</span>
            </h2>

            {/* 1. TORAKS ALT BAŞLIKLARI */}
            {selectedOrgan === 'thorax' && (
              <div className="flex flex-col gap-2.5 text-xs">
                <div>
                  <label className="text-slate-600 block mb-1">{lang === 'tr' ? 'Toraks Tümör Alt Tipi' : 'Thorax Subsite'}</label>
                  <select
                    value={thoraxSubtype}
                    onChange={e => {
                      const val = parseOption(e.currentTarget.value, ['nsclc', 'sclc', 'thymoma', 'mesothelioma'] as const);
                      if (!val) return;
                      setThoraxSubtype(val);
                      handleSubsiteChange(`thorax-${val}`);
                    }}
                    className="bg-white border border-slate-300 text-xs rounded-md p-2.5 text-slate-900 w-full font-bold"
                  >
                    <option value="nsclc">{tText("Küçük Hücreli Dışı Akciğer Ca (KHDAK)")}</option>
                    <option value="sclc">{tText("Küçük Hücreli Akciğer Ca (KHAK / SCLC)")}</option>
                    <option value="thymoma">{tText("Timoma & Timik Karsinom")}</option>
                    <option value="mesothelioma">{tText("Malign Plevral Mezotelyoma (MPM)")}</option>
                  </select>
                </div>
              </div>
            )}

            {selectedOrgan === 'benign' && (
              <div className="flex flex-col gap-2.5 text-xs">
                <label className="text-slate-600">
                  {lang === 'tr' ? 'Benign hastalık / klinik endikasyon' : 'Benign disease / clinical indication'}
                  <select
                    value={selectedSubsite}
                    onChange={event => {
                      const nextSubsite = SUBSITES.benign?.find(option => option.id === event.currentTarget.value);
                      if (!nextSubsite) return;
                      setSelectedSubsite(nextSubsite.id);
                      const firstClinicalOption = BENIGN_CLINICAL_OPTIONS[nextSubsite.id]?.[0];
                      if (firstClinicalOption) setBenignClinicalStatus(firstClinicalOption.value);
                      setSelectedSchemeId('');
                    }}
                    className="mt-1 w-full rounded-md border border-slate-300 bg-white p-2.5 font-semibold text-slate-900"
                  >
                    {SUBSITES.benign?.map(subsite => (
                      <option key={subsite.id} value={subsite.id}>{tText(subsite.name)}</option>
                    ))}
                  </select>
                </label>
              </div>
            )}

            {/* 2. JİNEKOLOJİ ALT BAŞLIKLARI */}
            {selectedOrgan === 'gynecology' && (
              <div className="flex flex-col gap-2.5 text-xs">
                <div>
                  <label className="text-slate-600 block mb-1">{tText("Jinekolojik Kanser Bölgesi")}</label>
                  <select
                    value={gynSite}
                    onChange={e => {
                      const val = parseOption(e.currentTarget.value, ['Serviks', 'Endometriyum', 'Over_Tuba', 'Vajen', 'Vulva'] as const);
                      if (!val) return;
                      setGynSite(val);
                      handleSubsiteChange(`gynecology-${val}`);
                    }}
                    className="bg-white border border-slate-300 text-xs rounded-md p-2.5 text-slate-900 w-full font-bold"
                  >
                    <option value="Serviks">{tText("Serviks Uteri Karsinomu (Cervix)")}</option>
                    <option value="Endometriyum">{tText("Endometriyum Karsinomu (Corpus Uteri)")}</option>
                    <option value="Over_Tuba">{tText("Over & Tuba Uterina Karsinomu")}</option>
                    <option value="Vajen">{tText("Vajen Karsinomu (Vagina)")}</option>
                    <option value="Vulva">{tText("Vulva Karsinomu (Vulva)")}</option>
                  </select>
                </div>
              </div>
            )}

            {/* 3. KEMİK & SARKOM ALT BAŞLIKLARI */}
            {selectedOrgan === 'bone-sarcoma' && (
              <div className="flex flex-col gap-2.5 text-xs">
                <div>
                  <label className="text-slate-600 block mb-1">{tText("Sarkom / Kemik Tümör Tipi")}</label>
                  <select
                    value={sarcomaSubtype}
                    onChange={e => {
                      const val = parseOption(e.currentTarget.value, ['Yumusak_Doku', 'Osteosarkom', 'Ewing', 'Kondrosarkom', 'Kordoma', 'GCTB', 'DFSP'] as const);
                      if (!val) return;
                      setSarcomaSubtype(val);
                      handleSubsiteChange(`bone-sarcoma-${val}`);
                    }}
                    className="bg-white border border-slate-300 text-xs rounded-md p-2.5 text-slate-900 w-full font-bold"
                  >
                    <option value="Yumusak_Doku">{tText("Yumuşak Doku Sarkomu (YDS / STS)")}</option>
                    <option value="Osteosarkom">{tText("Osteosarkom (Osteosarcoma)")}</option>
                    <option value="Ewing">{tText("Ewing Sarkomu (Ewing Sarcoma)")}</option>
                    <option value="Kondrosarkom">{tText("Kondrosarkom (Chondrosarcoma)")}</option>
                    <option value="Kordoma">{tText("Kordoma (Sakral / Klivus Chordoma)")}</option>
                    <option value="GCTB">{tText("Dev Hücreli Kemik Tümörü (GCTB)")}</option>
                    <option value="DFSP">{tText("Dermatofibrosarkoma Protuberans (DFSP)")}</option>
                  </select>
                </div>
              </div>
            )}

            {/* 4. BAŞ-BOYUN ALT BAŞLIKLARI */}
            {selectedOrgan === 'head-neck' && (
              <div className="flex flex-col gap-2.5 text-xs">
                <div>
                  <label className="text-slate-600 block mb-1">{tText("Baş-Boyun Anatomik Bölgesi")}</label>
                  <select
                    value={hnSubsite}
                    onChange={e => {
                      const val = parseOption(e.currentTarget.value, ['nasopharynx', 'oropharynx', 'larynx', 'hypopharynx', 'oral-cavity', 'salivary'] as const);
                      if (!val) return;
                      setHnSubsite(val);
                      handleSubsiteChange(`head-neck-${val}`);
                    }}
                    className="bg-white border border-slate-300 text-xs rounded-md p-2.5 text-slate-900 w-full font-bold"
                  >
                    <option value="nasopharynx">{tText("Nazofarenks Karsinomu (NPC)")}</option>
                    <option value="oropharynx">{tText("Orofarenks Karsinomu (p16/HPV)")}</option>
                    <option value="larynx">{tText("Larinks Karsinomu (Glottik/Supraglottik)")}</option>
                    <option value="hypopharynx">{tText("Hipofarenks Karsinomu")}</option>
                    <option value="oral-cavity">{tText("Oral Kavite Karsinomu")}</option>
                    <option value="salivary">{tText("Tükürük Bezi Tümörleri")}</option>
                  </select>
                </div>
                <details className="rounded-md border border-slate-200/80 bg-[#f1f5f9] p-3">
                  <summary className="cursor-pointer list-none text-xs font-semibold text-[#0f294a] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500">
                    {tText("\n                    📖 Kılavuz Tanımlı Elektif Boyun Drenaj Rehberi (ESTRO / ASTRO Konsensüsü)\n                  ")}</summary>
                  <ul className="mt-3 space-y-2 text-xs leading-relaxed text-slate-700">
                    <li><strong>{tText("Nazofarenks:")}</strong> {tText(" Bilateral Level II-Vb ve retrofaringeal lenf nodları (RPN) kapsanır.")}</li>
                    <li><strong>{tText("Orofarenks / Hipofarenks / Supraglottik:")}</strong> {tText(" Bilateral Level II-IV; orta hat komşuluğu ve bilateral drenaj riski dikkate alınır.")}</li>
                    <li><strong>{tText("Erken glottik (T1-T2 N0):")}</strong> {tText(" Elektif boyun ışınlaması yapılmaz; yalnızca gerçek vokal kordlar hedeflenir.")}</li>
                    <li><strong>{tText("Oral kavite, lateralize (>1 cm):")}</strong> {tText(" İpsilateral Level I-III; DOI >5 mm ise Level IV eklenir.")}</li>
                    <li><strong>{tText("Oral kavite, orta hat tutulumu veya <1 cm:")}</strong> {tText(" Bilateral Level I-IV kapsanır.")}</li>
                    <li><strong>{tText("ENE+ veya N2-N3:")}</strong> {tText(" Level V eklenmesi ve tutulu nod yatağına 66-70 Gy SIB boost değerlendirilir.")}</li>
                  </ul>
                </details>
              </div>
            )}

            {/* 5. MSS ALT BAŞLIKLARI */}
            {selectedOrgan === 'cns' && (
              <div className="flex flex-col gap-2.5 text-xs">
                <div>
                  <label className="text-slate-600 block mb-1">{tText("MSS Patolojisi")}</label>
                  <select
                    value={cnsSubtype}
                    onChange={e => {
                      const val = parseOption(e.currentTarget.value, ['mets', 'gbm', 'meningioma'] as const);
                      if (!val) return;
                      setCnsSubtype(val);
                      handleSubsiteChange(`cns-${val}`);
                    }}
                    className="bg-white border border-slate-300 text-xs rounded-md p-2.5 text-slate-900 w-full font-bold"
                  >
                    <option value="mets">{tText("Beyin Metastazı (SRS vs WBRT)")}</option>
                    <option value="gbm">{tText("Glioblastom (GBM, WHO Grade 4)")}</option>
                    <option value="meningioma">{tText("Menenjiyom (Grade 1 / 2 / 3)")}</option>
                  </select>
                </div>
              </div>
            )}

            {/* 6. GİS ALT BAŞLIKLARI */}
            {selectedOrgan === 'gis' && (
              <div className="flex flex-col gap-2.5 text-xs">
                <div>
                  <label className="text-slate-600 block mb-1">{tText("Primer GİS Organı")}</label>
                  <select
                    value={gisOrgan}
                    onChange={e => {
                      const val = parseOption(e.currentTarget.value, ['Rektum', 'Mide', 'Ozofagus', 'Pankreas', 'Anal', 'Karaciger'] as const);
                      if (!val) return;
                      setGisOrgan(val);
                      handleSubsiteChange(`gis-${val}`);
                    }}
                    className="bg-white border border-slate-300 text-xs rounded-md p-2.5 text-slate-900 w-full font-bold"
                  >
                    <option value="Rektum">{tText("Rektum Karsinomu (TNT RAPIDO)")}</option>
                    <option value="Mide">{tText("Mide / Gastrik Adenokarsinom")}</option>
                    <option value="Karaciger">{tText("Karaciğer (HCC / Kolanjio SBRT)")}</option>
                    <option value="Ozofagus">{tText("Özofagus Karsinomu (CROSS)")}</option>
                    <option value="Pankreas">{tText("Pankreas Adenokarsinomu")}</option>
                    <option value="Anal">{tText("Anal Kanal Skuamöz Karsinom (Nigro)")}</option>
                  </select>
                </div>
              </div>
            )}

            {/* 7. PROSTAT / GÜS */}
            {selectedOrgan === 'prostate' && (
              <div className="flex flex-col gap-2 text-xs">
                <label className="text-slate-600">{tText("GÜS Anatomik Alt Bölgesi")}</label>
                <select
                  value={gusSubtype}
                  onChange={e => {
                    const value = e.currentTarget.value;
                    if (value === 'prostate' || value === 'bladder' || value === 'testis' || value === 'penile') {
                      setGusSubtype(value);
                      handleSubsiteChange(value === 'penile' ? 'prostate-penis' : `prostate-${value}`);
                    }
                  }}
                  className="bg-white border border-slate-300 text-xs rounded-md p-2.5 text-slate-900 w-full font-bold"
                >
                  <option value="prostate">{tText("Prostat")}</option>
                  <option value="bladder">{tText("Mesane")}</option>
                  <option value="testis">{tText("Testis")}</option>
                  <option value="penile">{lang === 'tr' ? 'Penil Kanser' : 'Penile Cancer'}</option>
                </select>
                {gusSubtype === 'prostate' && <span className="font-semibold text-slate-900">{tText("Prostat adenokarsinomu")}</span>}
                {gusSubtype === 'bladder' && <span className="font-semibold text-slate-900">{tText("Mesane koruyucu trimodal tedavi (TMT)")}</span>}
                {gusSubtype === 'testis' && <span className="font-semibold text-slate-900">{tText("Testis seminom evrelemesi")}</span>}
                {gusSubtype === 'penile' && <span className="font-semibold text-slate-900">{lang === 'tr' ? 'Penil kanser evrelemesi' : 'Penile cancer staging'}</span>}
              </div>
            )}

            {/* 8. MEME */}
            {selectedOrgan === 'breast' && (
              <div className="flex flex-col gap-1.5 text-xs">
                <label className="text-slate-600">{tText("Meme Histopatolojisi")}</label>
                <select
                  value={breastHistology}
                  onChange={e => {
                    setBreastHistology(e.currentTarget.value);
                    const nextHistology = e.currentTarget.value;
                    if (nextHistology === 'Duktal Karsinoma In Situ (DCIS)') handleSubsiteChange('breast-dcis');
                    else if (nextHistology === 'Malign Filloides Tümörü') handleSubsiteChange('breast-phyllodes');
                    else handleSubsiteChange('breast-breast');
                  }}
                  className="bg-white border border-slate-300 text-xs rounded-md p-2.5 text-slate-900 w-full"
                >
                  <option value="İnvaziv Duktal Karsinom (İDK)">{tText("İnvaziv Duktal Karsinom (İDK)")}</option>
                  <option value="İnvaziv Lobüler Karsinom (İLK)">{tText("İnvaziv Lobüler Karsinom (İLK)")}</option>
                  <option value="Duktal Karsinoma In Situ (DCIS)">{tText("Duktal Karsinoma In Situ (DCIS)")}</option>
                  <option value="Malign Filloides Tümörü">{tText("Malign Filloides Tümörü")}</option>
                  <option value="Metaplastik Karsinom">{tText("Metaplastik Karsinom")}</option>
                </select>
              </div>
            )}

            {/* 9. CİLT */}
            {selectedOrgan === 'skin' && (
              <div className="flex flex-col gap-1.5 text-xs">
                <label className="text-slate-600">{tText("Cilt Patolojisi")}</label>
                <select
                  value={skinHistology}
                  onChange={e => {
                    const value = e.currentTarget.value;
                    if (value === 'SCC' || value === 'BCC' || value === 'Melanom' || value === 'Merkel') {
                      setSkinHistology(value);
                      handleSubsiteChange(`skin-${value}`);
                    }
                  }}
                  className="bg-white border border-slate-300 text-xs rounded-md p-2.5 text-slate-900 w-full"
                >
                  <option value="SCC">{tText("Kutanöz Skuamöz Hücreli Karsinom (cSCC)")}</option>
                  <option value="BCC">{tText("Bazal Hücreli Karsinom (BCC)")}</option>
                  <option value="Melanom">{tText("Malign Melanom")}</option>
                  <option value="Merkel">{tText("Merkel Hücreli Karsinom")}</option>
                </select>
              </div>
            )}

            {/* 10. HEMATOLOJİK */}
            {selectedOrgan === 'hematologic' && (
              <div className="flex flex-col gap-2 text-xs">
                <label className="text-slate-600">{tText("Hematolojik Tümör")}</label>
                <select
                  value={hematologicSubtype}
                  onChange={e => {
                    const value = e.currentTarget.value;
                    if (value === 'Hodgkin' || value === 'DLBCL' || value === 'Plasmacytoma' || value === 'Myeloma') {
                      setHematologicSubtype(value);
                      handleSubsiteChange(`hematologic-${value}`);
                    }
                  }}
                  className="bg-white border border-slate-300 text-xs rounded-md p-2.5 text-slate-900 w-full"
                >
                  <option value="Hodgkin">{tText("Hodgkin Lenfoma")}</option>
                  <option value="DLBCL">{tText("Diffüz Büyük B Hücreli Lenfoma (DLBCL)")}</option>
                  <option value="Plasmacytoma">{tText("Soliter Plazmasitom")}</option>
                  <option value="Myeloma">{tText("Multiple Miyelom")}</option>
                </select>
              </div>
            )}

            {/* 11. PEDİATRİK */}
            {selectedOrgan === 'pediatric' && (
              <div className="flex flex-col gap-2 text-xs">
                <label className="text-slate-600">{tText("Pediatrik Tümör")}</label>
                <select
                  value={pediatricSubtype}
                  onChange={e => {
                    const value = e.currentTarget.value;
                    if (value === 'Medulloblastom' || value === 'Wilms' || value === 'Neuroblastom' || value === 'Ewing') {
                      setPediatricSubtype(value);
                      handleSubsiteChange(`pediatric-${value}`);
                    }
                  }}
                  className="bg-white border border-slate-300 text-xs rounded-md p-2.5 text-slate-900 w-full"
                >
                  <option value="Medulloblastom">{tText("Medulloblastom")}</option>
                  <option value="Wilms">{tText("Wilms Tümörü")}</option>
                  <option value="Neuroblastom">{tText("Nöroblastom")}</option>
                  <option value="Ewing">{tText("Pediatrik Ewing Sarkomu")}</option>
                </select>
              </div>
            )}

            {/* 12. PALYATİF */}
            {selectedOrgan === 'palliative' && (
              <div className="p-3 bg-[#f1f5f9] rounded-md border border-slate-200/80 text-xs">
                <span className="text-[11px] text-slate-600 block mb-1">{tText("Palyatif Onkoloji")}</span>
                <span className="font-semibold text-slate-900">{tText("Ağrılı Kemik / Beyin / Spinal Kord Basısı")}</span>
              </div>
            )}
          </div>

          {/* DİNAMİK RİSK FAKTÖRLERİ VE CERRAHİ FORMU */}
          <div className={`rounded-2xl border p-5 flex flex-col gap-3 ${theme === 'light' ? 'bg-white border-slate-200 shadow-sm text-slate-800' : 'bg-[#0d172a] border-slate-800 text-slate-200'}`}>
            <h2 className="text-xs font-bold text-amber-700 uppercase tracking-wider flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5" />
              {lang === 'tr' ? 'KLİNİK PARAMETRELER & RİSK' : 'CLINICAL PARAMETERS & RISK'}
            </h2>

            {/* TORAKS: KHDAK PARAMETRELERİ */}
            {selectedOrgan === 'thorax' && thoraxSubtype === 'nsclc' && (
              <div className="flex flex-col gap-3 text-xs">
                <div>
                  <label className="text-slate-600 block mb-1">{lang === 'tr' ? 'Tümör Yerleşimi (Santralite)' : 'Tumor Location (Centrality)'}</label>
                  <div className="grid grid-cols-3 gap-1.5">
                    {[
                      { id: 'Peripheral', label: lang === 'tr' ? 'Periferik' : 'Peripheral' },
                      { id: 'Central', label: lang === 'tr' ? 'Santral' : 'Central' },
                      { id: 'UltraCentral', label: lang === 'tr' ? 'Ultrasantral' : 'Ultracentral' },
                    ].map(item => (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => {
                          const value = parseOption(item.id, ['Peripheral', 'Central', 'UltraCentral'] as const);
                          if (value) setThoraxCentrality(value);
                        }}
                        className={`p-2 rounded-md text-center font-medium border transition-colors ${
                          thoraxCentrality === item.id
                            ? 'bg-amber-50 text-amber-800 border-amber-300'
                            : 'bg-white border-slate-200/80 text-slate-600 hover:bg-slate-100'
                        }`}
                      >
                        {tText(item.label)}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="text-slate-600 block mb-1">{lang === 'tr' ? 'Cerrahi / Operabilite Durumu' : 'Surgical Operability'}</label>
                  <select
                    value={thoraxSurgeryStatus}
                    onChange={e => {
                      const value = parseOption(e.currentTarget.value, ['Inoperable', 'Operable', 'Postop_R0', 'Postop_R1_R2'] as const);
                      if (value) setThoraxSurgeryStatus(value);
                    }}
                    className="bg-white border border-slate-300 text-xs rounded-md p-2.5 text-slate-900 w-full"
                  >
                    <option value="Inoperable">{lang === 'tr' ? 'Medikal İnoperabl / Cerrahi Red' : 'Medically Inoperable / Declines Surgery'}</option>
                    <option value="Operable">{lang === 'tr' ? 'Medikal Operabl' : 'Medically Operable'}</option>
                    <option value="Postop_R0">{lang === 'tr' ? 'Postoperatif R0 Rezeksiyon' : 'Postoperative R0 Resection'}</option>
                    <option value="Postop_R1_R2">{lang === 'tr' ? 'Postoperatif R1 / R2 Rezeksiyon' : 'Postoperative R1 / R2 Resection'}</option>
                  </select>
                </div>
              </div>
            )}

            {/* TORAKS: KHAK (SCLC) PARAMETRELERİ */}
            {selectedOrgan === 'thorax' && thoraxSubtype === 'sclc' && (
              <div className="flex flex-col gap-3 text-xs">
                <div>
                  <label className="text-slate-600 block mb-1">{tText("KHAK Klinik Evresi")}</label>
                  <div className="grid grid-cols-2 gap-1.5">
                    {[
                      { id: 'Sinirli', label: 'Sınırlı Evre (LS-SCLC)' },
                      { id: 'Yaygin', label: 'Yaygın Evre (ES-SCLC)' },
                    ].map(item => (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => {
                          const value = parseOption(item.id, ['Sinirli', 'Yaygin'] as const);
                          if (value) setSclcStage(value);
                        }}
                        className={`p-2 rounded-md text-center font-medium border transition-colors ${
                          sclcStage === item.id
                            ? 'bg-sky-50 text-sky-800 border-sky-300'
                            : 'bg-white border-slate-200/80 text-slate-600 hover:bg-slate-100'
                        }`}
                      >
                        {tText(item.label)}
                      </button>
                    ))}
                  </div>
                </div>
                {sclcStage === 'Sinirli' && (
                  <div>
                    <label className="text-slate-600 block mb-1">{tText("Fraksiyonasyon Rejimi")}</label>
                    <select
                      value={sclcTiming}
                      onChange={e => {
                        const value = parseOption(e.currentTarget.value, ['Erken_BID_45Gy', 'Standart_QD_60Gy'] as const);
                        if (value) setSclcTiming(value);
                      }}
                      className="bg-white border border-slate-300 text-xs rounded-md p-2.5 text-slate-900 w-full"
                    >
                      <option value="Erken_BID_45Gy">{tText("45 Gy / 30 fx (Günde 2x1.5 Gy - Turrisi Altın Standart)")}</option>
                      <option value="Standart_QD_60Gy">{tText("60 Gy / 30 fx (Günde tek 2.0 Gy - CONVERT)")}</option>
                    </select>
                  </div>
                )}
              </div>
            )}

            {/* JİNEKOLOJİ: SERVİKS PARAMETRELERİ */}
            {selectedOrgan === 'gynecology' && gynSite === 'Serviks' && (
              <div className="flex flex-col gap-2.5 text-xs">
                <label className="text-slate-600 block mb-1">{tText("Klinik Senaryo")}</label>
                <select
                  value={cervixScenario}
                  onChange={e => {
                    const value = parseOption(e.currentTarget.value, ['Definitif_KRT', 'Adjuvan_Peters', 'Adjuvan_Sedlis'] as const);
                    if (value) setCervixScenario(value);
                  }}
                  className="bg-white border border-slate-300 text-xs rounded-md p-2.5 text-slate-900 w-full"
                >
                  <option value="Definitif_KRT">{tText("Definitif KRT + 3D IGABT (Lokal İleri)")}</option>
                  <option value="Adjuvan_Peters">{tText("Cerrahi Sonrası Yüksek Risk (Peters: R1/LN+/Parametrium)")}</option>
                  <option value="Adjuvan_Sedlis">{tText("Cerrahi Sonrası Orta Risk (Sedlis: LVSI/Derin İnvazyon)")}</option>
                </select>
              </div>
            )}

            {/* JİNEKOLOJİ: ENDOMETRİYUM PARAMETRELERİ */}
            {selectedOrgan === 'gynecology' && gynSite === 'Endometriyum' && (
              <div className="flex flex-col gap-2.5 text-xs">
                <label className="text-slate-600 block mb-1">{tText("Endometriyum Risk Grubu (PORTEC)")}</label>
                <select
                  value={endoRisk}
                  onChange={e => {
                    const value = parseOption(e.currentTarget.value, ['Low', 'Intermediate', 'High_Intermediate', 'High'] as const);
                    if (value) setEndoRisk(value);
                  }}
                  className="bg-white border border-slate-300 text-xs rounded-md p-2.5 text-slate-900 w-full font-medium"
                >
                  <option value="Low">{tText("Düşük Risk (Evre IA G1-2, LVSI yok - İzlem)")}</option>
                  <option value="Intermediate">{tText("Orta Risk (Evre IB G1-2 veya IA G3)")}</option>
                  <option value="High_Intermediate">{tText("Yüksek-Orta Risk (PORTEC-2: Yalnızca VCB Brakiterapisi)")}</option>
                  <option value="High">{tText("Yüksek Risk (Evre III / Seröz / Derin İnvazyon - PORTEC-3 KRT)")}</option>
                </select>
              </div>
            )}

            {/* JİNEKOLOJİ: OVER & TUBA PARAMETRELERİ */}
            {selectedOrgan === 'gynecology' && gynSite === 'Over_Tuba' && (
              <div className="flex flex-col gap-2.5 text-xs">
                <label className="text-slate-600 block mb-1">{tText("Radyoterapi Amacı")}</label>
                <select
                  value={ovaryScenario}
                  onChange={e => {
                    const value = parseOption(e.currentTarget.value, ['Oligometastatik_SBRT', 'Palyatif_Kitle_Agri'] as const);
                    if (value) setOvaryScenario(value);
                  }}
                  className="bg-white border border-slate-300 text-xs rounded-md p-2.5 text-slate-900 w-full"
                >
                  <option value="Oligometastatik_SBRT">{tText("Oligometastatik Nüks SBRT (1-3 odak ablasyonu)")}</option>
                  <option value="Palyatif_Kitle_Agri">{tText("Palyatif Pelvik Kitle / Hemostaz RT")}</option>
                </select>
              </div>
            )}

            {/* JİNEKOLOJİ: VULVA PARAMETRELERİ */}
            {selectedOrgan === 'gynecology' && gynSite === 'Vulva' && (
              <div className="flex flex-col gap-2.5 text-xs">
                <label className="text-slate-600 block mb-1">{tText("Klinik Evre / Cerrahi")}</label>
                <select
                  value={vulvaScenario}
                  onChange={e => {
                    const value = parseOption(e.currentTarget.value, ['Adjuvan_Cerrahi_Sonrasi', 'Inoperabl_Lokal_Ileri'] as const);
                    if (value) setVulvaScenario(value);
                  }}
                  className="bg-white border border-slate-300 text-xs rounded-md p-2.5 text-slate-900 w-full"
                >
                  <option value="Adjuvan_Cerrahi_Sonrasi">{tText("Cerrahi Sonrası Adjuvan (<8 mm sınır veya Kasık LN+ / ENE)")}</option>
                  <option value="Inoperabl_Lokal_Ileri">{tText("İnoperabl / Lokal İleri Definitif KRT")}</option>
                </select>
              </div>
            )}

            {/* KEMİK & SARKOM: YDS PARAMETRELERİ */}
            {selectedOrgan === 'bone-sarcoma' && sarcomaSubtype === 'Yumusak_Doku' && (
              <div className="flex flex-col gap-2.5 text-xs">
                <label className="text-slate-600 block mb-1">{tText("Radyoterapi Zamanlaması")}</label>
                <div className="grid grid-cols-2 gap-1.5">
                  {[
                    { id: 'Preop', label: 'Preoperatif 50 Gy' },
                    { id: 'Postop_R1', label: 'Postoperatif 66 Gy' },
                  ].map(item => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => {
                        const value = parseOption(item.id, ['Preop', 'Postop_R0', 'Postop_R1'] as const);
                        if (value) setSarcomaSurgery(value);
                      }}
                      className={`p-2 rounded-md text-center font-medium border transition-colors ${
                        sarcomaSurgery === item.id
                          ? 'bg-amber-50 text-amber-800 border-amber-300'
                          : 'bg-white border-slate-200/80 text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      {tText(item.label)}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* KEMİK & SARKOM: OSTEOSARKOM PARAMETRELERİ */}
            {selectedOrgan === 'bone-sarcoma' && sarcomaSubtype === 'Osteosarkom' && (
              <div className="flex flex-col gap-2.5 text-xs">
                <label className="text-slate-600 block mb-1">{tText("Klinik Durum")}</label>
                <select
                  value={osteoScenario}
                  onChange={e => {
                    const value = parseOption(e.currentTarget.value, ['Marjin_Pozitif_R1_R2', 'Inoperabl_Aksiyel_Pelvis', 'Cerrahi_R0_Takip'] as const);
                    if (value) setOsteoScenario(value);
                  }}
                  className="bg-white border border-slate-300 text-xs rounded-md p-2.5 text-slate-900 w-full"
                >
                  <option value="Marjin_Pozitif_R1_R2">{tText("R1/R2 Rezeksiyon (Yüksek Doz Eskalasyonu 70 Gy)")}</option>
                  <option value="Inoperabl_Aksiyel_Pelvis">{tText("İnoperabl Aksiyel/Pelvis (Partikül/IMRT 70+ Gy)")}</option>
                  <option value="Cerrahi_R0_Takip">{tText("R0 Cerrahi Tam Rezeksiyon (RT Gerekmez - İzlem)")}</option>
                </select>
              </div>
            )}

            {/* KEMİK & SARKOM: EWING SARKOMU PARAMETRELERİ */}
            {selectedOrgan === 'bone-sarcoma' && sarcomaSubtype === 'Ewing' && (
              <div className="flex flex-col gap-2.5 text-xs">
                <label className="text-slate-600 block mb-1">{tText("Lokal Kontrol Modalitesi")}</label>
                <select
                  value={ewingIntent}
                  onChange={e => {
                    const value = parseOption(e.currentTarget.value, ['Definitif_RT', 'Postop_R1'] as const);
                    if (value) setEwingIntent(value);
                  }}
                  className="bg-white border border-slate-300 text-xs rounded-md p-2.5 text-slate-900 w-full"
                >
                  <option value="Definitif_RT">{tText("Definitif RT (Cerrahi Yapılamayan / Organ Koruma - 55.8 Gy)")}</option>
                  <option value="Postop_R1">{tText("Postoperatif R1 Cerrahi Sınır (45-50.4 Gy Adjuvan RT)")}</option>
                </select>
              </div>
            )}
            {selectedOrgan === 'bone-sarcoma' && sarcomaSubtype === 'DFSP' && (
              <label className="text-slate-600 text-xs">
                {tText("\n                Cerrahi durumu\n                ")}<select
                  value={dfspStatus}
                  onChange={e => {
                    const value = e.currentTarget.value;
                    if (value === 'R0' || value === 'R1' || value === 'Unresectable') setDfspStatus(value);
                  }}
                  className="mt-1 bg-white border border-slate-300 rounded-md p-2.5 text-slate-900 w-full"
                >
                  <option value="R0">{tText("R0 rezeksiyon")}</option>
                  <option value="R1">{tText("R1 pozitif marjin")}</option>
                  <option value="Unresectable">{tText("Rezeke edilemeyen")}</option>
                </select>
              </label>
            )}

            {selectedOrgan === 'head-neck' && (
              <div className="space-y-2 text-xs">
                {hnSubsite === 'larynx' && (
                  <div>
                    <label className="text-slate-600 block mb-1">{tText("Larinks klinik senaryosu")}</label>
                    <select
                      value={hnLarynxSubsite}
                      onChange={e => {
                        const value = e.currentTarget.value;
                        if (value === 'Erken_Glottik_T1_T2' || value === 'Lokal_Ileri_T3_T4') {
                          setHnLarynxSubsite(value);
                          setSelectedT(value === 'Erken_Glottik_T1_T2' ? 'T1a/b' : 'T3');
                          setSelectedN('N0');
                          setSelectedM('M0');
                        }
                      }}
                      className="bg-white border border-slate-300 rounded-lg p-2 text-slate-900 w-full"
                    >
                      <option value="Erken_Glottik_T1_T2">{tText("Erken glottik T1-T2 N0 (yalnız vokal kord, 63 Gy/28 fx)")}</option>
                      <option value="Lokal_Ileri_T3_T4">{tText("Lokal ileri supraglottik/glottik T3-T4")}</option>
                    </select>
                  </div>
                )}
                <div className="grid grid-cols-2 gap-2">
                  <label className="flex items-center gap-2 text-slate-700">
                    <input type="checkbox" checked={hnCrossesMidline} onChange={e => setHnCrossesMidline(e.currentTarget.checked)} />
                    {tText("\n                    Orta hattı geçiyor\n                  ")}</label>
                  <label className="text-slate-600">
                    {tText("\n                    Orta hatta uzaklık (cm)\n                    ")}<input type="number" min="0" step="0.1" value={hnDistanceFromMidlineCm} onChange={e => setHnDistanceFromMidlineCm(e.currentTarget.value)} className="mt-1 bg-white border border-slate-300 rounded-lg p-1.5 text-slate-900 w-full" />
                  </label>
                  <label className="text-slate-600">
                    {tText("\n                    Tümör çapı (cm)\n                    ")}<input type="number" min="0" step="0.1" value={hnTumorSizeCm} onChange={e => setHnTumorSizeCm(e.currentTarget.value)} className="mt-1 bg-white border border-slate-300 rounded-lg p-1.5 text-slate-900 w-full" />
                  </label>
                  <label className="text-slate-600">
                    {tText("\n                    Derin invazyon (DOI, mm)\n                    ")}<input type="number" min="0" step="0.1" value={hnDoiMm} onChange={e => setHnDoiMm(e.currentTarget.value)} className="mt-1 bg-white border border-slate-300 rounded-lg p-1.5 text-slate-900 w-full" />
                  </label>
                </div>
                {hnSubsite === 'oral-cavity' && (
                  <div className="grid grid-cols-2 gap-2">
                    <label className="flex items-center gap-2 text-slate-700">
                      <input type="checkbox" checked={hnENE} onChange={e => setHnENE(e.currentTarget.checked)} />
                      {tText("\n                      Ekstranodal yayılım (ENE)\n                    ")}</label>
                    <label className="flex items-center gap-2 text-slate-700">
                      <input type="checkbox" checked={hnPositiveMargin} onChange={e => setHnPositiveMargin(e.currentTarget.checked)} />
                      {tText("\n                      Pozitif cerrahi sınır (R1)\n                    ")}</label>
                  </div>
                )}
              </div>
            )}

            {/* GÜS ALT BÖLGE PARAMETRELERİ */}
            {selectedOrgan === 'prostate' && gusSubtype === 'prostate' && (
              <div className="flex flex-col gap-2.5 text-xs">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-slate-600 block mb-1">{tText("Gleason Skoru")}</label>
                    <div className="flex gap-1 items-center">
                      <input
                        type="number"
                        min="1"
                        max="5"
                        value={gleasonPrimary}
                        onChange={e => setGleasonPrimary(e.target.value)}
                        className="bg-white border border-slate-300 rounded-lg p-1.5 text-center w-12 text-slate-900"
                      />
                      <span className="text-slate-500">{tText("+")}</span>
                      <input
                        type="number"
                        min="1"
                        max="5"
                        value={gleasonSecondary}
                        onChange={e => setGleasonSecondary(e.target.value)}
                        className="bg-white border border-slate-300 rounded-lg p-1.5 text-center w-12 text-slate-900"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-slate-600 block mb-1">{tText("PSA (ng/mL)")}</label>
                    <input
                      type="number"
                      min="0"
                      value={psaLevel}
                      onChange={e => setPsaLevel(e.target.value)}
                      className="bg-white border border-slate-300 rounded-lg p-1.5 text-slate-900 w-full"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-slate-600 block mb-1">{tText("Pozitif biyopsi kor oranı (%)")}</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={positiveCorePercent}
                    onChange={e => setPositiveCorePercent(e.currentTarget.value)}
                    className="bg-white border border-slate-300 rounded-lg p-1.5 text-slate-900 w-full"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    aria-pressed={hasECE}
                    onClick={() => setHasECE(value => !value)}
                    className={`rounded-lg border p-2 ${hasECE ? 'border-emerald-300 bg-emerald-50 text-emerald-800' : 'border-slate-300 text-slate-600'}`}
                  >
                    {tText("\n                    Ekstrakapsüler yayılım (ECE)\n                  ")}</button>
                  <button
                    type="button"
                    aria-pressed={hasSVI}
                    onClick={() => setHasSVI(value => !value)}
                    className={`rounded-lg border p-2 ${hasSVI ? 'border-emerald-300 bg-emerald-50 text-emerald-800' : 'border-slate-300 text-slate-600'}`}
                  >
                    {tText("\n                    Seminal vezikül invazyonu\n                  ")}</button>
                </div>
                <div className="rounded-lg border border-sky-300 bg-blue-50 p-2 font-semibold text-blue-900">
                  {tText("\n                  Otomatik NCCN risk grubu: ")}{prostateRiskLabel}
                </div>
              </div>
            )}

            {selectedOrgan === 'prostate' && gusSubtype === 'bladder' && (
              <div className="space-y-2 text-xs">
                <label className="flex items-center gap-2 text-slate-700">
                  <input type="checkbox" checked={bladderTurbtComplete} onChange={e => setBladderTurbtComplete(e.currentTarget.checked)} />
                  {tText("\n                  Maksimal TURBT tamamlandı\n                ")}</label>
                <label className="flex items-center gap-2 text-slate-700">
                  <input type="checkbox" checked={bladderTmtSuitable} onChange={e => setBladderTmtSuitable(e.currentTarget.checked)} />
                  {tText("\n                  Mesane koruyucu TMT için klinik uygunluk\n                ")}</label>
              </div>
            )}

            {selectedOrgan === 'prostate' && gusSubtype === 'testis' && (
              <div className="space-y-2 text-xs">
                <label className="text-slate-600 block">{tText("Seminom evresi")}</label>
                <select
                  value={selectedT}
                  onChange={e => {
                    const value = e.currentTarget.value;
                    if (value === 'I' || value === 'IIA' || value === 'IIB') {
                      setSelectedT(value);
                      setSelectedN(value === 'I' ? 'N0' : value === 'IIA' ? 'N1' : 'N2');
                      setSelectedM('M0');
                    }
                  }}
                  className="bg-white border border-slate-300 rounded-lg p-2 text-slate-900 w-full"
                >
                  <option value="I">{tText("Evre I")}</option>
                  <option value="IIA">{tText("Evre IIA")}</option>
                  <option value="IIB">{tText("Evre IIB")}</option>
                </select>
              </div>
            )}

            {/* MEME PARAMETRELERİ */}
            {selectedOrgan === 'breast' && (
              <div className="flex flex-col gap-2 text-xs">
                <div>
                  <label className="text-slate-600 block mb-1">{tText("Menopoz durumu")}</label>
                  <div role="group" aria-label="Menopoz durumu" className="grid grid-cols-2 gap-1.5">
                    {(['Premenopozal', 'Postmenopozal'] as const).map(value => (
                      <button
                        key={value}
                        type="button"
                        aria-pressed={breastMenopause === value}
                        onClick={() => setBreastMenopause(value)}
                        className={`rounded-md border px-2 py-2 font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 ${
                          breastMenopause === value
                            ? 'bg-blue-50 border-blue-600 text-blue-900 font-semibold shadow-xs'
                            : 'bg-slate-100 border-slate-300 text-slate-600 hover:bg-slate-200'
                        }`}
                      >
                        {value}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-slate-600 block mb-1">{tText("Cerrahi")}</label>
                    <select
                      value={breastSurgery}
                      onChange={e => {
                        const value = parseOption(e.currentTarget.value, ['MKC', 'Mastektomi'] as const);
                        if (value) setBreastSurgery(value);
                      }}
                      className="bg-white border border-slate-300 rounded-md p-2 text-slate-900 w-full"
                    >
                      <option value="MKC">{tText("MKC (Lumpektomi)")}</option>
                      <option value="Mastektomi">{tText("Mastektomi")}</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-slate-600 block mb-1">{tText("Cerrahi Sınır")}</label>
                    <select
                      value={breastMargin}
                      onChange={e => {
                        const value = parseOption(e.currentTarget.value, ['Negatif', 'Yakin', 'Pozitif'] as const);
                        if (value) setBreastMargin(value);
                      }}
                      className="bg-white border border-slate-300 rounded-md p-2 text-slate-900 w-full"
                    >
                      <option value="Negatif">{tText("Negatif (≥2 mm)")}</option>
                      <option value="Yakin">{tText("Yakın (<2 mm)")}</option>
                      <option value="Pozitif">{tText("Pozitif (R1)")}</option>
                    </select>
                  </div>
                </div>
                {breastHistology === 'Malign Filloides Tümörü' ? (
                  <div className="space-y-2">
                    <label className="text-slate-600 block">{tText("En yakın cerrahi marjin (cm)")}</label>
                    <input
                      type="number"
                      min="0"
                      step="0.1"
                      value={phyllodesMarginCm}
                      onChange={e => setPhyllodesMarginCm(e.currentTarget.value)}
                      className="bg-white border border-slate-300 rounded-lg p-1.5 text-slate-900 w-full"
                    />
                    <label className="flex items-center gap-2 text-slate-700">
                      <input type="checkbox" checked={phyllodesHighGrade} onChange={e => setPhyllodesHighGrade(e.currentTarget.checked)} />
                      {tText("\n                      Yüksek dereceli stromal aşırı büyüme\n                    ")}</label>
                  </div>
                ) : (
                  <>
                    <label className="flex items-center gap-2 text-slate-700">
                      <input type="checkbox" checked={breastBoost} onChange={e => setBreastBoost(e.currentTarget.checked)} />
                      {tText("\n                      Tümör yatağı boostu (10-16 Gy) uygula\n                    ")}</label>
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        { label: 'ER', value: breastER, setter: setBreastER },
                        { label: 'PR', value: breastPR, setter: setBreastPR },
                        { label: 'HER2', value: breastHER2, setter: setBreastHER2 },
                      ].map(marker => (
                        <button
                            key={marker.label}
                            type="button"
                            aria-pressed={marker.value}
                            aria-label={`${marker.label} ${marker.value ? 'pozitif' : 'negatif'}`}
                            onClick={() => marker.setter(!marker.value)}
                            className={`flex items-center justify-center gap-1.5 rounded-lg border px-3 py-2 font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 ${
                              marker.value
                                ? 'bg-blue-50 border-blue-600 text-blue-900 font-semibold shadow-xs'
                                : 'bg-[#f1f5f9] border-slate-300 text-slate-700 hover:bg-slate-100'
                            }`}
                          >
                            {marker.value && <Check className="h-3.5 w-3.5" aria-hidden="true" />}
                            {marker.label}{marker.value ? '+' : '-'}
                        </button>
                      ))}
                      <div role="group" aria-label="Ki-67" className="col-span-2 grid grid-cols-2 gap-1.5">
                        {[
                          { label: '<20%', value: 'Low' },
                          { label: '≥20%', value: 'High' },
                        ].map(option => {
                          const selected = (Number.parseFloat(breastKi67) >= 20) === (option.value === 'High');
                          return (
                            <button
                              key={option.value}
                              type="button"
                              aria-pressed={selected}
                              onClick={() => setBreastKi67(option.value === 'High' ? '20' : '19')}
                              className={`rounded-md border px-2 py-2 font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 ${
                                selected
                                  ? 'bg-blue-50 border-blue-600 text-blue-900 font-semibold shadow-xs'
                                  : 'bg-slate-100 border-slate-300 text-slate-600 hover:bg-slate-200'
                              }`}
                            >
                              {tText("\n                              Ki-67 ")}{tText(option.label)}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                    <label className="block text-slate-600">
                      {tText("\n                      Histolojik Grade\n                      ")}<select
                        value={breastGrade}
                        onChange={e => {
                          const value = parseOption(e.currentTarget.value, ['1', '2', '3'] as const);
                          if (value) setBreastGrade(value);
                        }}
                        className="mt-1 w-full rounded-md border border-slate-300 bg-white p-2 text-slate-900"
                      >
                        <option value="1">{tText("Grade 1")}</option>
                        <option value="2">{tText("Grade 2")}</option>
                        <option value="3">{tText("Grade 3")}</option>
                      </select>
                    </label>
                    <p className="text-[11px] text-slate-500">
                      {tText("\n                      Biyobelirteçler sistemik tedavi kararında onkoloji ekibiyle birlikte yorumlanır.\n                    ")}</p>
                  </>
                )}
              </div>
            )}

            {/* MSS BEYİN METASTAZI PARAMETRELERİ */}
            {selectedOrgan === 'cns' && cnsSubtype === 'mets' && (
              <div className="flex flex-col gap-2.5 text-xs">
                <div>
                  <label className="text-slate-600 block mb-1">{tText("Orta Hat Şifti (Herniasyon)")}</label>
                  <select
                    value={cnsMidlineShift}
                    onChange={e => {
                      const value = e.currentTarget.value;
                      if (value === 'Yok' || value === '<5mm' || value === '>=5mm') setCnsMidlineShift(value);
                    }}
                    className="bg-white border border-slate-300 rounded-md p-2 text-slate-900 w-full"
                  >
                    <option value="Yok">{tText("Şift yok")}</option>
                    <option value="<5mm">{tText("Hafif şift (<5 mm)")}</option>
                    <option value=">=5mm">{tText('Kritik Şift (≥5 mm - Acil Dekompresyon)')}</option>
                  </select>
                </div>
                <label className="text-slate-600">
                  {tText("\n                  Semptom durumu\n                  ")}<select
                    value={cnsSymptoms}
                    onChange={e => {
                      const value = e.currentTarget.value;
                      if (value === 'Asimptomatik' || value === 'Semptomatik') setCnsSymptoms(value);
                    }}
                    className="mt-1 bg-white border border-slate-300 rounded-md p-2 text-slate-900 w-full"
                  >
                    <option value="Asimptomatik">{tText("Asemptomatik")}</option>
                    <option value="Semptomatik">{tText("Semptomatik (ödem / defisit / kitle etkisi)")}</option>
                  </select>
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-slate-600 block mb-1">{tText("Metastaz Sayısı")}</label>
                    <input
                      type="number"
                      min="1"
                      value={cnsMetCount}
                      onChange={e => setCnsMetCount(e.target.value)}
                      className="bg-white border border-slate-300 rounded-md p-1.5 text-center text-slate-900 w-full"
                    />
                  </div>
                  <div>
                    <label className="text-slate-600 block mb-1">{tText("Maks Çap (cm)")}</label>
                    <input
                      type="number"
                      min="0"
                      step="0.1"
                      value={cnsMaxDiameter}
                      onChange={e => setCnsMaxDiameter(e.target.value)}
                      className="bg-white border border-slate-300 rounded-md p-1.5 text-center text-slate-900 w-full"
                    />
                  </div>
                </div>
                <label className="text-slate-600">
                  {tText("\n                  Cerrahi / rezeksiyon\n                  ")}<select
                    value={cnsResection}
                    onChange={e => {
                      const value = e.currentTarget.value;
                      if (value === 'Yok' || value === 'GTR' || value === 'STR' || value === 'Biyopsi') setCnsResection(value);
                    }}
                    className="mt-1 bg-white border border-slate-300 rounded-md p-2 text-slate-900 w-full"
                  >
                    <option value="Yok">{tText("Cerrahi yok")}</option>
                    <option value="GTR">{tText("Gross total rezeksiyon (GTR)")}</option>
                    <option value="STR">{tText("Subtotal rezeksiyon (STR)")}</option>
                    <option value="Biyopsi">{tText("Biyopsi")}</option>
                  </select>
                </label>
                <label className="text-slate-600">
                  {tText("\n                  KPS\n                  ")}<input type="number" min="0" max="100" step="10" value={cnsKps} onChange={e => setCnsKps(e.currentTarget.value)} className="mt-1 bg-white border border-slate-300 rounded-md p-1.5 text-slate-900 w-full" />
                </label>
              </div>
            )}
            {selectedOrgan === 'cns' && cnsSubtype === 'gbm' && (
              <div className="space-y-2 text-xs">
                <label className="text-slate-600 block">{tText("Performans / tedavi uygunluğu")}</label>
                <select
                  value={gbmPerformance}
                  onChange={e => {
                    const value = e.currentTarget.value;
                    if (value === 'Iyi_ECOG_0_1' || value === 'Duskun_Yasli') setGbmPerformance(value);
                  }}
                  className="bg-white border border-slate-300 rounded-md p-2 text-slate-900 w-full"
                >
                  <option value="Iyi_ECOG_0_1">{tText("İyi performans (ECOG 0-1): Stupp")}</option>
                  <option value="Duskun_Yasli">{tText("Yaşlı / düşkün: Perry hipofraksiyone KRT")}</option>
                </select>
                <label className="text-slate-600">{tText("KPS: ")}{cnsKps}
                  <input type="range" min="0" max="100" step="10" value={cnsKps} onChange={e => setCnsKps(e.currentTarget.value)} className="block w-full" />
                </label>
              </div>
            )}
            {selectedOrgan === 'cns' && cnsSubtype === 'meningioma' && (
              <div className="space-y-2 text-xs">
                <label className="text-slate-600 block">{tText("WHO derece")}</label>
                <select
                  value={meningiomaGrade}
                  onChange={e => {
                    const value = e.currentTarget.value;
                    if (value === 'Grade_1' || value === 'Grade_2' || value === 'Grade_3') setMeningiomaGrade(value);
                    setSelectedT(value.replace('_', '-'));
                  }}
                  className="bg-white border border-slate-300 rounded-md p-2 text-slate-900 w-full"
                >
                  <option value="Grade_1">{tText("WHO Grade 1")}</option>
                  <option value="Grade_2">{tText("WHO Grade 2")}</option>
                  <option value="Grade_3">{tText("WHO Grade 3")}</option>
                </select>
                <label className="text-slate-600 block">{tText("Rezeksiyon derecesi / cerrahi sınır")}</label>
                <select
                  value={cnsResection}
                  onChange={e => {
                    const value = e.currentTarget.value;
                    if (value === 'Yok' || value === 'GTR' || value === 'STR' || value === 'Biyopsi') setCnsResection(value);
                  }}
                  className="bg-white border border-slate-300 rounded-md p-2 text-slate-900 w-full"
                >
                  <option value="Yok">{tText("Cerrahi yapılmadı")}</option>
                  <option value="GTR">{tText("Gross total rezeksiyon (GTR)")}</option>
                  <option value="STR">{tText("Subtotal rezeksiyon (STR)")}</option>
                  <option value="Biyopsi">{tText("Biyopsi")}</option>
                </select>
                <label className="text-slate-600 block">{tText("Simpson derecesi")}</label>
                <select
                  value={meningiomaSimpson}
                  onChange={e => {
                    const value = e.currentTarget.value;
                    if (value === 'I-III' || value === 'IV-V') setMeningiomaSimpson(value);
                  }}
                  className="bg-white border border-slate-300 rounded-md p-2 text-slate-900 w-full"
                >
                  <option value="I-III">{tText("Simpson I-III (GTR)")}</option>
                  <option value="IV-V">{tText("Simpson IV-V (STR / rezidü)")}</option>
                </select>
                <label className="text-slate-600">{tText("Maksimum çap (cm)\n                  ")}<input type="number" min="0" step="0.1" value={cnsMaxDiameter} onChange={e => setCnsMaxDiameter(e.currentTarget.value)} className="mt-1 bg-white border border-slate-300 rounded-md p-1.5 text-slate-900 w-full" />
                </label>
              </div>
            )}
            {selectedOrgan === 'skin' && (
              <div className="space-y-2 text-xs">
                <label className="text-slate-600 block">{tText("Cerrahi marjin / rezektabilite")}</label>
                <select
                  value={skinMargin}
                  onChange={e => {
                    const value = e.currentTarget.value;
                    if (value === 'Negatif' || value === 'Pozitif' || value === 'Rezeke_Edilemez') setSkinMargin(value);
                  }}
                  className="bg-white border border-slate-300 rounded-md p-2 text-slate-900 w-full"
                >
                  <option value="Negatif">{tText("Negatif marjin")}</option>
                  <option value="Pozitif">{tText("Pozitif marjin (R1)")}</option>
                  <option value="Rezeke_Edilemez">{tText("Rezeke edilemeyen")}</option>
                </select>
                {skinHistology === 'SCC' && (
                  <>
                    <label className="text-slate-600 block">{tText("İnvazyon derinliği (mm)\n                      ")}<input type="number" min="0" step="0.1" value={skinDepthMm} onChange={e => setSkinDepthMm(e.currentTarget.value)} className="mt-1 bg-white border border-slate-300 rounded-lg p-1.5 text-slate-900 w-full" />
                    </label>
                    <label className="flex items-center gap-2 text-slate-700">
                      <input type="checkbox" checked={skinPerineuralInvasion} onChange={e => setSkinPerineuralInvasion(e.currentTarget.checked)} />
                      {tText("\n                      Perinöral invazyon\n                    ")}</label>
                    <label className="flex items-center gap-2 text-slate-700">
                      <input type="checkbox" checked={skinBoneInvasion} onChange={e => setSkinBoneInvasion(e.currentTarget.checked)} />
                      {tText("\n                      Kemik tutulumu\n                    ")}</label>
                  </>
                )}
              </div>
            )}
            {selectedOrgan === 'hematologic' && hematologicSubtype === 'Myeloma' && (
              <label className="text-slate-600 text-xs">
                {tText("\n                Palyatif fraksiyonasyon\n                ")}<select
                  value={myelomaFractionation}
                  onChange={e => {
                    const value = e.currentTarget.value;
                    if (value === 'TekFx' || value === '20Gy' || value === '30Gy') setMyelomaFractionation(value);
                  }}
                  className="mt-1 bg-white border border-slate-300 rounded-md p-2.5 text-slate-900 w-full"
                >
                  <option value="TekFx">{tText("8 Gy / 1 fraksiyon")}</option>
                  <option value="20Gy">{tText("20 Gy / 5 fraksiyon")}</option>
                  <option value="30Gy">{tText("30 Gy / 10 fraksiyon")}</option>
                </select>
              </label>
            )}
            {selectedOrgan === 'hematologic' && (hematologicSubtype === 'Hodgkin' || hematologicSubtype === 'DLBCL') && (
              <label className="text-slate-600 text-xs">
                {tText("\n                Sistemik tedaviye yanıt\n                ")}<select
                  value={lymphomaResponse}
                  onChange={e => {
                    const value = e.currentTarget.value;
                    if (value === 'Tam_Yanit' || value === 'Parsiyel_Rezidü') setLymphomaResponse(value);
                  }}
                  className="mt-1 bg-white border border-slate-300 rounded-md p-2.5 text-slate-900 w-full"
                >
                  <option value="Tam_Yanit">{tText("Tam yanıt")}</option>
                  <option value="Parsiyel_Rezidü">{tText("Parsiyel yanıt / rezidü")}</option>
                </select>
              </label>
            )}
            {selectedOrgan === 'pediatric' && pediatricSubtype === 'Medulloblastom' && (
              <label className="text-slate-600 text-xs">
                {tText("\n                Medulloblastom risk grubu\n                ")}<select
                  value={pediatricRisk}
                  onChange={e => {
                    const value = e.currentTarget.value;
                    if (value === 'Standart' || value === 'Yuksek') setPediatricRisk(value);
                    setSelectedT(value);
                  }}
                  className="mt-1 bg-white border border-slate-300 rounded-md p-2.5 text-slate-900 w-full"
                >
                  <option value="Standart">{tText("Standart risk (CSI 23.4 Gy)")}</option>
                  <option value="Yuksek">{tText("Yüksek risk (CSI 36 Gy)")}</option>
                </select>
              </label>
            )}
            {selectedOrgan === 'pediatric' && pediatricSubtype === 'Wilms' && (
              <div className="space-y-2">
                <label className="text-slate-600 text-xs block">
                  {tText("\n                  Wilms evre / histoloji\n                  ")}<select
                    value={wilmsStage}
                    onChange={e => {
                      const value = e.currentTarget.value;
                      if (value === 'Evre_I_II' || value === 'Evre_III_Anaplazi') {
                        setWilmsStage(value);
                        setSelectedT(value === 'Evre_I_II' ? 'I-II' : 'III');
                      }
                    }}
                    className="mt-1 bg-white border border-slate-300 rounded-md p-2.5 text-slate-900 w-full"
                  >
                    <option value="Evre_I_II">{tText("Evre I-II, uygun histoloji")}</option>
                    <option value="Evre_III_Anaplazi">{tText("Evre III veya anaplazi")}</option>
                  </select>
                </label>
                <label className="flex items-center gap-2 text-slate-700 text-xs">
                  <input type="checkbox" checked={wilmsWholeAbdomen} onChange={e => setWilmsWholeAbdomen(e.currentTarget.checked)} />
                  {tText("\n                  Yaygın peritoneal yayılım / tüm batın RT endikasyonu\n                ")}</label>
              </div>
            )}
          </div>
        </aside>

        {/* ==========================================
            ORTA SÜTUN (4 KOLON): KAYDIRMASIZ AÇIK TABLO MATRİSİ
           ========================================== */}
        <section className="col-span-12 lg:col-span-4 flex flex-col gap-4">
          <div className={`rounded-2xl border p-5 ${theme === 'light' ? 'bg-white border-slate-200 shadow-sm text-slate-800' : 'bg-[#0d172a] border-slate-800 text-slate-200'}`}>
            <div className="flex items-center justify-between pb-3 border-b border-slate-200/80 mb-3">
              <div>
                <h2 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                  {selectedOrgan === 'benign'
                    ? (lang === 'tr' ? 'Klinik Durum, Evre ve Zamanlama Kriteri' : 'Clinical Status and Timing Criteria')
                    : (lang === 'tr' ? 'KILAVUZ TANIMLI AÇIK TNM TABLOSU' : 'GUIDELINE-DEFINED OPEN TNM MATRIX')}
                </h2>
                <span className="text-[11px] text-slate-600">
                  {selectedOrgan === 'benign'
                    ? (lang === 'tr' ? 'Benign hastalıkta TNM evrelemesi uygulanmaz; klinik durum ve tedavi zamanlamasını seçin.' : 'TNM staging does not apply to benign disease; select the clinical status and treatment timing.')
                    : (lang === 'tr' ? 'Seçili alt başlığa özgü kriterler; tıklayarak anında güncelleyin.' : 'Subsite-specific criteria; click to update instantly.')}
                </span>
              </div>
              {selectedOrgan === 'benign'
                ? <span className="rounded border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold text-emerald-800">{lang === 'tr' ? 'TNM uygulanmaz' : 'TNM not applicable'}</span>
                : <span className="text-xs font-mono px-2 py-0.5 rounded bg-slate-100 text-sky-700 border border-slate-300">{selectedT} {selectedN} {selectedM}</span>}
            </div>

            {selectedOrgan === 'benign' ? (
              <div className="space-y-3">
                <p className="text-xs font-semibold text-slate-700">
                  {tText(SUBSITES.benign?.find(subsite => subsite.id === selectedSubsite)?.name)}
                </p>
                <div className="grid grid-cols-1 gap-2">
                  {(BENIGN_CLINICAL_OPTIONS[selectedSubsite] || []).map(option => {
                    const isSelected = benignClinicalStatus === option.value;
                    return (
                      <button
                        key={option.value}
                        type="button"
                        aria-pressed={isSelected}
                        onClick={() => setBenignClinicalStatus(option.value)}
                        className={`flex items-center justify-between rounded-md border p-2.5 text-left text-xs transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${
                          isSelected
                            ? 'border-emerald-600 bg-emerald-50 text-emerald-950 font-semibold ring-1 ring-emerald-500/20'
                            : 'border-slate-200/80 bg-slate-50/70 text-slate-700 hover:bg-slate-100'
                        }`}
                      >
                        {tText(option.label)}
                        {isSelected && <Check className="h-4 w-4 text-emerald-700" aria-hidden="true" />}
                      </button>
                    );
                  })}
                </div>
                {(selectedSubsite === 'benign-ho' || selectedSubsite === 'benign-keloid') && (
                  <div role="note" className="rounded-md border border-amber-200 bg-amber-50 p-2.5 text-xs leading-relaxed text-amber-900">
                    <strong>{lang === 'tr' ? 'Zamanlama kritik:' : 'Timing is critical:'}</strong> {selectedSubsite === 'benign-ho'
                        ? lang === 'tr'
                          ? 'HO profilaksisi preoperatif ilk 4 saatte veya postoperatif ilk 24-48 saatte planlanır; >72 saat sonra etkinlik beklenmez.'
                          : 'HO prophylaxis is planned within 4 hours preoperatively or 24-48 hours postoperatively; benefit is not expected after 72 hours.'
                        : lang === 'tr'
                          ? 'Keloid eksizyonu sonrası RT ilk 24 saat içinde başlatılmalıdır.'
                          : 'Radiotherapy should begin within 24 hours after keloid excision.'}
                  </div>
                )}
              </div>
            ) : (
              <>
            {/* T TABLOSU */}
            <div className="mb-4">
              <span className="text-[11px] font-bold text-slate-600 uppercase tracking-wider block mb-1.5">
                {lang === 'tr' ? 'PRİMER TÜMÖR (T) KRİTERLERİ' : 'PRIMARY TUMOR (T) CRITERIA'}
              </span>
              <div className="grid grid-cols-1 gap-1">
                {currentTNM.T.map(opt => {
                  const isSel = selectedT === opt.code;
                  return (
                    <button
                      key={opt.code}
                      type="button"
                      onClick={() => handleTnmSelection('T', opt.code)}
                      className={`text-left p-2 rounded-md text-xs flex items-center justify-between transition-colors border ${
                        isSel
                          ? theme === 'light'
                            ? 'bg-blue-50 border-blue-400 text-blue-900 font-semibold'
                            : 'bg-blue-950/50 border-blue-500 text-blue-200'
                          : theme === 'light'
                            ? 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                            : 'bg-slate-800/40 border-slate-700/80 text-slate-300 hover:bg-slate-800'
                      }`}
                    >
                      <span className="font-mono font-bold text-[11px] px-2 py-0.5 rounded bg-slate-200/80 text-slate-800">{tText(opt.label)}</span>
                      <span className="text-[11px] flex-1 px-2 line-clamp-1">{tText(opt.criterion)}</span>
                      {isSel && <Check className="w-3.5 h-3.5 text-blue-700 shrink-0" aria-hidden="true" />}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* N TABLOSU */}
            <div className="mb-4">
              <span className="text-[11px] font-bold text-slate-600 uppercase tracking-wider block mb-1.5">
                {lang === 'tr' ? 'BÖLGESEL LENF NODLARI (N)' : 'REGIONAL LYMPH NODES (N)'}
              </span>
              <div className="grid grid-cols-1 gap-1">
                {currentTNM.N.map(opt => {
                  const isSel = selectedN === opt.code;
                  return (
                    <button
                      key={opt.code}
                      type="button"
                      onClick={() => handleTnmSelection('N', opt.code)}
                      className={`text-left p-2 rounded-md text-xs flex items-center justify-between transition-colors border ${
                        isSel
                          ? theme === 'light'
                            ? 'bg-blue-50 border-blue-400 text-blue-900 font-semibold'
                            : 'bg-blue-950/50 border-blue-500 text-blue-200'
                          : theme === 'light'
                            ? 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                            : 'bg-slate-800/40 border-slate-700/80 text-slate-300 hover:bg-slate-800'
                      }`}
                    >
                      <span className="font-mono font-bold text-[11px] px-2 py-0.5 rounded bg-slate-200/80 text-slate-800">{tText(opt.label)}</span>
                      <span className="text-[11px] flex-1 px-2 line-clamp-1">{tText(opt.criterion)}</span>
                      {isSel && <Check className="w-3.5 h-3.5 text-blue-700 shrink-0" aria-hidden="true" />}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* M TABLOSU */}
            <div>
              <span className="text-[11px] font-bold text-slate-600 uppercase tracking-wider block mb-1.5">
                {lang === 'tr' ? 'UZAK METASTAZ (M)' : 'DISTANT METASTASIS (M)'}
              </span>
              <div className="grid grid-cols-1 gap-1">
                {currentTNM.M.map(opt => {
                  const isSel = selectedM === opt.code;
                  return (
                    <button
                      key={opt.code}
                      type="button"
                      onClick={() => handleTnmSelection('M', opt.code)}
                      className={`text-left p-2 rounded-md text-xs flex items-center justify-between transition-colors border ${
                        isSel
                          ? theme === 'light'
                            ? 'bg-blue-50 border-blue-400 text-blue-900 font-semibold'
                            : 'bg-blue-950/50 border-blue-500 text-blue-200'
                          : theme === 'light'
                            ? 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                            : 'bg-slate-800/40 border-slate-700/80 text-slate-300 hover:bg-slate-800'
                      }`}
                    >
                      <span className="font-mono font-bold text-[11px] px-2 py-0.5 rounded bg-slate-200/80 text-slate-800">{tText(opt.label)}</span>
                      <span className="text-[11px] flex-1 px-2 line-clamp-1">{tText(opt.criterion)}</span>
                      {isSel && <Check className="w-3.5 h-3.5 text-blue-700 shrink-0" aria-hidden="true" />}
                    </button>
                  );
                })}
              </div>
            </div>
              </>
            )}
          </div>
        </section>

        {/* ==========================================
            SAĞ SÜTUN (5 KOLON): REAKTİF KARAR VE ÇOKLU REJİMLER
           ========================================== */}
        <section className="col-span-12 lg:col-span-5 flex flex-col gap-4">
          <div className={`rounded-2xl border p-5 ${theme === 'light' ? 'bg-white border-slate-200 shadow-sm text-slate-800' : 'bg-[#0d172a] border-slate-800 text-slate-200'}`}>

            {/* CANLI DİNAMİK TRIAGE ROZETİ */}
            <div className={`p-3.5 rounded-md border font-bold text-xs flex items-center justify-between mb-4 transition-colors ${evaluatedDecision.badgeClass}`}>
              <span className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded bg-current" aria-hidden="true" />
                {tText(evaluatedDecision.statusText)}
              </span>
              <span className="text-[11px] font-normal opacity-80">
                {tText(activeScheme.tag)}
              </span>
            </div>

            {/* ALTERNATİF PROTOKOL SEKMELERİ */}
            {evaluatedDecision.alternativeSchemes.length > 1 && (
              <div className="flex gap-2 mb-4 overflow-x-auto pb-1">
                {evaluatedDecision.alternativeSchemes.map(sch => (
                  <button
                    key={sch.id}
                    onClick={() => setSelectedSchemeId(sch.id)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors border ${
                      activeScheme.id === sch.id
                        ? 'bg-amber-50 text-amber-800 border-amber-300'
                        : 'bg-white border-slate-200/80 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    {tText(sch.tag)} {tText(" (")}{sch.totalDoseGy} {tText(" Gy)\n                  ")}</button>
                ))}
              </div>
            )}

            {/* SEÇİLİ DOZ ŞEMASI KARTI */}
            <div className="bg-[#f1f5f9] border border-slate-200/80 rounded-md p-3.5 mb-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Radiation className="w-4 h-4 text-amber-700" />
                  {tText(activeScheme.name)}
                </h3>
                <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-slate-100 text-emerald-700 border border-slate-300">
                  {activeScheme.totalDoseGy} {tText(" Gy / ")}{activeScheme.fractionCount} {tText(" fx\n                ")}</span>
              </div>
              <div className="flex flex-wrap gap-1.5 mt-2 mb-2.5" aria-label="Reçete özeti">
                <span className="rounded border border-slate-200 bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-700">
                  {prescriptionTargetBadge}
                </span>
                <span className="rounded border border-slate-200 bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-700">
                    {prescriptionNodalSummary}
                  </span>
                <span className="rounded border border-slate-200 bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-700">
                  {prescriptionTechniqueBadge}
                </span>
              </div>
              <p className="text-xs text-slate-700 mb-2 leading-relaxed">
                {tText(activeScheme.indication)}
              </p>
            </div>

            {/* HEDEF HACİMLER VE MARJİNLER */}
            {activeScheme.targetVolumes.length > 0 && (
              <div className="mb-4">
                <div className="flex min-w-0 items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-2 mb-2">
                  <h4 className="flex min-w-0 items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-200">
                    <Layers className="w-3.5 h-3.5 shrink-0 text-sky-700" />
                    <span>{lang === 'tr' ? 'HEDEF HACİMLER (ICRU 83)' : 'TARGET VOLUMES (ICRU 83)'}</span>
                  </h4>
                  <a
                    href={eContour.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group inline-flex max-w-[65%] shrink-0 items-center gap-1.5 rounded-lg border border-blue-200 bg-blue-50 px-2.5 py-1 text-[11px] font-semibold text-blue-700 shadow-sm transition-all hover:bg-blue-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 dark:border-blue-800 dark:bg-blue-950/60 dark:text-blue-300 dark:hover:bg-blue-900/60"
                    title={lang === 'tr' ? 'eContour.org üzerinde bu vakanın 3D interaktif çizimini aç' : 'Open 3D interactive contouring case on eContour.org'}
                    aria-label={lang === 'tr' ? eContour.label_tr : eContour.label_en}
                  >
                    <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-blue-500 transition-transform group-hover:scale-125" aria-hidden="true" />
                    <span className="truncate">{lang === 'tr' ? eContour.label_tr : eContour.label_en}</span>
                    <span className="text-[10px] opacity-70 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" aria-hidden="true">↗</span>
                  </a>
                </div>
                <div className="border border-slate-200/80 rounded-md overflow-hidden text-xs">
                  <table className="w-full text-left">
                    <thead className="bg-[#f1f5f9] text-slate-600 border-b border-slate-200">
                      <tr>
                        <th className="p-2">{lang === 'tr' ? 'Hacim' : 'Volume'}</th>
                        <th className="p-2">{lang === 'tr' ? 'Doz' : 'Dose'}</th>
                        <th className="p-2">{lang === 'tr' ? 'Marjin' : 'Margin'}</th>
                        <th className="p-2">{lang === 'tr' ? 'Anatomik Kapsam' : 'Anatomic Coverage'}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 text-slate-700">
                      {activeScheme.targetVolumes.map((tv, idx) => (
                        <tr key={idx} className="hover:bg-slate-100">
                          <td className="p-2 font-bold text-slate-900">{tText(tv.name)}</td>
                          <td className="p-2 text-emerald-700 font-mono">{tv.doseGy} {tText(" Gy")}</td>
                          <td className="p-2 font-mono text-amber-800">{tv.marginMm}</td>
                          <td className="p-2 text-[11px] text-slate-600">{tText(tv.anatomical)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* KRİTİK ORGAN (OAR) KISITLARI TABLOSU */}
            {activeScheme.oars.length > 0 && (
              <div className="mb-4">
                <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <ShieldAlert className="w-3.5 h-3.5 text-rose-700" aria-hidden="true" />
                  {lang === 'tr' ? 'KRİTİK ORGAN (OAR) KISITLARI' : 'ORGANS AT RISK (OAR) CONSTRAINTS'}
                </h4>
                <div className="border border-slate-200/80 rounded-md overflow-hidden text-xs">
                  <table className="w-full text-left">
                    <thead className="bg-[#f1f5f9] text-slate-600 border-b border-slate-200">
                      <tr>
                        <th className="p-2">{lang === 'tr' ? 'Organ' : 'Organ'}</th>
                        <th className="p-2">{lang === 'tr' ? 'Metrik' : 'Metric'}</th>
                        <th className="p-2">{lang === 'tr' ? 'Doz Limiti' : 'Dose Limit'}</th>
                        <th className="p-2">{lang === 'tr' ? 'Kılavuz' : 'Guideline'}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 text-slate-700">
                      {activeScheme.oars.map((oar, idx) => (
                        <tr key={idx} className="hover:bg-slate-100">
                          <td className="p-2 font-medium text-slate-900">{tText(oar.organ)}</td>
                          <td className="p-2 font-mono text-slate-600">{tText(oar.metric)}</td>
                          <td className="p-2 font-mono text-rose-700 font-bold">{oar.limit}</td>
                          <td className="p-2 text-[10px] text-slate-500">{tText(oar.source)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* RADYOBİYOLOJİ (BED & EQD2 HESAPLAYICI) */}
            <div className="bg-[#f1f5f9] border border-slate-200/80 rounded-md p-3 mb-4 flex items-center justify-between text-xs">
              <div>
                <span className="text-[11px] text-slate-600 block">{lang === 'tr' ? 'Radyobiyolojik Eşdeğerlik' : 'Radiobiological Equivalence'}</span>
                <span className="font-bold text-slate-700">
                  {tText("\n                  α/β = ")}{radiobiology.ab} {tText(" Gy | BED: ")}<span className="text-amber-700">{radiobiology.bed} {tText(" Gy")}</span> {tText(" | EQD2: ")}<span className="text-emerald-700">{radiobiology.eqd2} {tText(" Gy")}</span>
                </span>
              </div>
              <div className="text-[11px] text-slate-500 text-right">
                {lang === 'tr' ? 'Lineer-Kuadratik Model' : 'Linear-Quadratic Model'}</div>
            </div>

            {/* SİSTEMİK TEDAVİ VE KANIT */}
            {activeScheme.systemicTherapy && (
              <div className="p-2.5 rounded-md bg-indigo-50 border border-indigo-300 text-indigo-800 text-xs mb-3">
                <span className="font-bold block mb-0.5">{tText("💊 Eşlik Eden Sistemik Tedavi:")}</span>
                {tText(activeScheme.systemicTherapy)}
              </div>
            )}
            <div className="text-[11px] text-slate-600 italic mb-4">
              {tText("\n              📚 ")}{lang === 'tr' ? 'Kanıt ve Kılavuz' : 'Evidence and Guidelines'}{tText(": ")}{tText(activeScheme.evidence)}
            </div>

            {/* KOPYALANABİLİR RAPOR PANELİ */}
            <div className="pt-3 border-t border-slate-200/80 flex justify-end">
              <button
                onClick={copyToClipboard}
                className="flex items-center gap-2 bg-emerald-700 hover:bg-emerald-800 text-white px-4 py-2 rounded-md text-xs font-semibold shadow-[0_1px_3px_rgba(0,0,0,0.05)] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:ring-offset-2"
              >
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                <span>
                  {copied
                    ? (lang === 'tr' ? 'Rapor Kopyalandı!' : 'Report Copied!')
                    : (lang === 'tr' ? 'Klinik Reçete Raporunu Kopyala' : 'Copy Clinical Prescription Report')}
                </span>
              </button>
            </div>
          </div>
        </section>
      </main>

      <button
        type="button"
        onClick={() => setIsAiOpen(true)}
        className="fixed bottom-6 right-6 z-40 flex items-center gap-2 rounded-full bg-gradient-to-r from-blue-600 via-indigo-600 to-sky-600 px-4 py-2.5 text-xs font-semibold text-white shadow-2xl shadow-blue-500/30 transition-all hover:scale-105 active:scale-95"
      >
        <Sparkles className="h-4 w-4 animate-pulse text-amber-300" aria-hidden="true" />
        <span>{lang === 'tr' ? 'AI Konsültasyon' : 'AI Consultation'}</span>
      </button>

      {isAiOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-end bg-black/40 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-labelledby="ai-copilot-title"
          onMouseDown={event => {
            if (event.target === event.currentTarget) setIsAiOpen(false);
          }}
        >
          <div className="flex h-full w-full max-w-md flex-col justify-between overflow-y-auto border-l border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-900">
            <div>
              <div className="mb-4 flex items-center justify-between border-b border-slate-100 pb-4 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-blue-600" aria-hidden="true" />
                  <h3 id="ai-copilot-title" className="text-sm font-bold text-slate-900 dark:text-white">
                    {lang === 'tr' ? 'Onkoloji AI Danışmanı' : 'Oncology AI Copilot'}
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setIsAiOpen(false)}
                  aria-label={lang === 'tr' ? 'AI danışmanını kapat' : 'Close AI copilot'}
                  className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-white"
                >
                  <XCircle className="h-5 w-5" aria-hidden="true" />
                </button>
              </div>

              <div className="mb-4 rounded-xl border border-blue-200 bg-blue-50 p-3 text-xs dark:border-blue-800/60 dark:bg-blue-950/40">
                <div className="mb-1 font-semibold text-blue-900 dark:text-blue-300">
                  {lang === 'tr' ? 'Aktif Vaka Bağlamı:' : 'Active Case Context:'}
                </div>
                <div className="font-mono text-[11px] text-slate-600 dark:text-slate-400">
                  {selectedOrgan.toUpperCase()} • {selectedT} {selectedN} {selectedM} • {tText(activeScheme.name)}
                </div>
              </div>

              <div className="mb-4">
                <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                  {lang === 'tr' ? 'Hazırlanan Uzman Konsültasyon Sorusu:' : 'Prepared Expert Case Prompt:'}
                </label>
                <div className="max-h-56 overflow-y-auto whitespace-pre-wrap rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs leading-relaxed text-slate-700 dark:border-slate-700/80 dark:bg-slate-800/60 dark:text-slate-300">
                  {casePrompt}
                </div>
              </div>

              <div className="space-y-2">
                <button
                  type="button"
                  onClick={() => {
                    copyCasePrompt();
                    window.open('https://chatgpt.com', '_blank', 'noopener,noreferrer');
                  }}
                  className="flex w-full items-center justify-between rounded-xl bg-[#10a37f] px-3 py-2.5 text-xs font-semibold text-white shadow-sm transition hover:bg-[#0e8c6d]"
                >
                  <span>🟢 {lang === 'tr' ? 'ChatGPT ile Aç' : 'Open in ChatGPT'}</span>
                  <span className="text-[10px] opacity-80">{lang === 'tr' ? 'Panoya Kopyalar ↗' : 'Copies to Clipboard ↗'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    copyCasePrompt();
                    window.open('https://gemini.google.com', '_blank', 'noopener,noreferrer');
                  }}
                  className="flex w-full items-center justify-between rounded-xl bg-[#1a73e8] px-3 py-2.5 text-xs font-semibold text-white shadow-sm transition hover:bg-[#1557b0]"
                >
                  <span>🔵 {lang === 'tr' ? 'Google Gemini ile Aç' : 'Open in Google Gemini'}</span>
                  <span className="text-[10px] opacity-80">{lang === 'tr' ? 'Panoya Kopyalar ↗' : 'Copies to Clipboard ↗'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    copyCasePrompt();
                    window.open('https://claude.ai', '_blank', 'noopener,noreferrer');
                  }}
                  className="flex w-full items-center justify-between rounded-xl bg-[#d97706] px-3 py-2.5 text-xs font-semibold text-white shadow-sm transition hover:bg-[#b45309]"
                >
                  <span>🟣 {lang === 'tr' ? 'Claude ile Aç' : 'Open in Claude'}</span>
                  <span className="text-[10px] opacity-80">{lang === 'tr' ? 'Panoya Kopyalar ↗' : 'Copies to Clipboard ↗'}</span>
                </button>
                <button
                  type="button"
                  onClick={copyCasePrompt}
                  className="flex w-full items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-slate-100 px-3 py-2 text-xs font-medium text-slate-700 transition hover:bg-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
                >
                  <Copy className="h-3.5 w-3.5" aria-hidden="true" />
                  <span>{copiedPrompt ? (lang === 'tr' ? 'Panoya Kopyalandı!' : 'Copied to Clipboard!') : (lang === 'tr' ? 'Sadece Metni Kopyala' : 'Copy Prompt Only')}</span>
                </button>
              </div>
            </div>

            <div className="border-t border-slate-100 pt-4 text-center text-[11px] text-slate-400 dark:border-slate-800">
              {lang === 'tr'
                ? 'API anahtarı gerektirmez. Mevcut AI hesabınızda açmadan önce vaka sorusunu panoya kopyalar.'
                : 'No API key required. The case prompt is copied before opening your existing AI account.'}
            </div>
          </div>
        </div>
      )}

      <footer className="min-h-10 w-full border-t border-slate-200/80 dark:border-slate-800 bg-white dark:bg-[#131c31] px-4 py-1.5 flex items-center justify-between gap-3 transition-colors">
        <p className="min-w-0 truncate text-[11px] text-slate-500 dark:text-slate-400">
          {lang === 'tr'
            ? '© 2026 RadOnc CDSS • NCCN®, ASTRO®, ESTRO®, RTOG®, QUANTEC® ve DEGRO® ilgili kurumların tescilli markalarıdır. Bu sistem klinik karar destek ve eğitim amaçlıdır.'
            : '© 2026 RadOnc CDSS • NCCN®, ASTRO®, ESTRO®, RTOG®, QUANTEC® and DEGRO® are registered trademarks of their respective organizations. This system is intended for clinical decision support and educational purposes only.'}</p>
        <div className="flex shrink-0 items-center gap-3">
          <button
            type="button"
            onClick={() => {
              setActiveReferenceTab('guidelines');
              setShowGuidelineModal(true);
            }}
            className="whitespace-nowrap text-[11px] font-semibold text-blue-800 dark:text-blue-300 hover:underline"
          >
            {tText("\n            📚 Kılavuz & Kaynakça\n          ")}</button>
          <button
            type="button"
            onClick={() => {
              setActiveReferenceTab('disclaimer');
              setShowGuidelineModal(true);
            }}
            className="whitespace-nowrap text-[11px] font-semibold text-slate-700 dark:text-slate-300 hover:underline"
          >
            {tText("\n            ⚖️ Yasal Sorumluluk Reddi\n          ")}</button>
        </div>
      </footer>

      {/* ==========================================
          MODAL: KILAVUZ BİLGİ DOKÜMANI
         ========================================== */}
      {showGuidelineModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="reference-modal-title"
            className="bg-white dark:bg-[#131c31] border border-slate-300 dark:border-slate-700 rounded-lg max-w-3xl w-full p-6 text-xs text-slate-700 dark:text-slate-200 max-h-[85vh] overflow-y-auto"
          >
            <div className="flex justify-between items-center pb-3 border-b border-slate-200/80 mb-4">
              <h3 id="reference-modal-title" className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-amber-700" />
                {tText("\n                Radyasyon Onkolojisi CDSS - Kaynakça ve Yasal Bilgiler\n              ")}</h3>
              <button
                onClick={() => setShowGuidelineModal(false)}
                aria-label="Kılavuz penceresini kapat"
                className="text-slate-600 hover:text-slate-900 p-1 rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
              >
                <XCircle className="w-5 h-5" aria-hidden="true" />
              </button>
            </div>

            <div role="tablist" aria-label="Kaynakça modalı sekmeleri" className="mb-4 flex flex-wrap gap-2 border-b border-slate-200 dark:border-slate-700">
              {([
                ['guidelines', 'Kılavuzlar & Landmark Çalışmalar'],
                ['oar', 'OAR Tolerans Standartları'],
                ['disclaimer', 'Yasal Sorumluluk & Telif'],
              ] as const).map(([tab, label]) => (
                <button
                  key={tab}
                  id={`reference-tab-${tab}`}
                  type="button"
                  role="tab"
                  aria-selected={activeReferenceTab === tab}
                  aria-controls="reference-tab-panel"
                  onClick={() => setActiveReferenceTab(tab)}
                  className={`border-b-2 px-3 py-2 text-xs font-semibold transition-colors ${
                    activeReferenceTab === tab
                      ? 'border-blue-700 text-blue-800 dark:border-blue-400 dark:text-blue-300'
                      : 'border-transparent text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>

            <div
              id="reference-tab-panel"
              role="tabpanel"
              aria-labelledby={`reference-tab-${activeReferenceTab}`}
              className="space-y-4 leading-relaxed text-slate-700 dark:text-slate-200"
            >
              {activeReferenceTab === 'guidelines' && (
                <>
                  <p>
                    {tText("\n                    Klinik kapsam, ")}<strong>{tText("NCCN v1.2025")}</strong>{tText(", ")}<strong>{tText("ASTRO")}</strong> {tText(" ve ")}<strong>{tText("ESTRO")}</strong> {tText(" kılavuzları ile uluslararası randomize Faz III çalışmaların kanıtları doğrultusunda düzenlenmiştir. Kılavuz sürümleri ve öneriler klinik kullanımdan önce güncel kaynaklardan doğrulanmalıdır.\n                  ")}</p>
                  <div>
                    <h4 className="mb-1 font-bold text-amber-700">{tText("Landmark çalışmalar ve klinik başlıklar")}</h4>
                    <ul className="list-disc space-y-1 pl-5">
                      <li><strong>{tText("Toraks:")}</strong> {tText(" PACIFIC (evre III KHDAK), Turrisi ve CONVERT (KHAK), Lung-ART (postoperatif toraks RT).")}</li>
                      <li><strong>{tText("Meme:")}</strong> {tText(" FAST-Forward (hipofraksiyone adjuvan RT).")}</li>
                      <li><strong>{tText("GİS:")}</strong> {tText(" RAPIDO ve PRODIGE-23 (rektum TNT), PORTEC-3 (endometriyum adjuvan kemoradyoterapi).")}</li>
                      <li><strong>{tText("Jinekoloji:")}</strong> {tText(" EMBRACE II (serviks KRT ve görüntü kılavuzlu brakiterapi).")}</li>
                      <li><strong>{tText("MSS:")}</strong> {tText(" Stupp protokolü (glioblastom kemoradyoterapisi).")}</li>
                    </ul>
                  </div>
                  <p className="text-[11px] text-slate-600 dark:text-slate-400">
                    {tText("\n                    NCCN®, ASTRO®, ESTRO®, RTOG®, QUANTEC® ve DEGRO® ilgili kurumların tescilli markalarıdır.\n                  ")}</p>
                </>
              )}
              {activeReferenceTab === 'oar' && (
                <>
                  <p>{tText("Normal doku doz sınırları, kullanılan fraksiyonasyon, hedef hacim, eşzamanlı tedavi ve hastaya özgü klinik koşullarla birlikte değerlendirilmelidir.")}</p>
                  <ul className="list-disc space-y-2 pl-5">
                    <li><strong>{tText("QUANTEC:")}</strong> {tText(" Konvansiyonel fraksiyonasyonda normal doku doz-hacim etkilerini özetleyen, organ ve sonlanıma özgü derlemeler.")}</li>
                    <li><strong>{tText("HyTEC:")}</strong> {tText(" Stereotaktik radyocerrahi ve vücut RT’si için doz-hacim ve toksisite kanıtlarını derleyen raporlar.")}</li>
                    <li><strong>{tText("UK SABR Consortium:")}</strong> {tText(" SABR hasta seçimi, planlama ve organ riskindeki doz kısıtları için teknik rehberler.")}</li>
                    <li><strong>{tText("EMBRACE II:")}</strong> {tText(" Serviks kanserinde görüntü kılavuzlu adaptif brakiterapi hedef ve organ riskindeki doz hedefleri/kısıtları.")}</li>
                  </ul>
                  <p className="rounded-md border border-amber-200 bg-amber-50 p-3 text-amber-900">
                    {tText("\n                    Bu merkez tek başına hasta planlaması için doz reçetesi değildir. OAR kısıtları, geçerli protokolün güncel birincil kaynağından ve kurum onaylı planlama yönergelerinden kontrol edilmelidir.\n                  ")}</p>
                </>
              )}
              {activeReferenceTab === 'disclaimer' && (
                <div className="space-y-3">
                  <h4 className="font-bold text-slate-900 dark:text-slate-100">{tText("Yasal sorumluluk reddi ve telif")}</h4>
                  <p>
                    {tText("\n                    RadOnc CDSS, kanıta dayalı radyasyon onkolojisi literatürünü derleyen bir eğitim ve klinik karar destek aracıdır. Hekimin bireysel tıbbi muhakemesinin ve multidisipliner tümör konseyi (MDT) kararlarının yerine geçemez. Planlama sınırları her hasta için doğrulanmalıdır. NCCN®, ASTRO®, ESTRO®, RTOG®, QUANTEC® ilgili kurumların tescilli markaları olup resmi sponsorluk bağı bulunmamaktadır.\n                  ")}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
