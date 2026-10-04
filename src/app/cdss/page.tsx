/**
 * Radiation Oncology Clinical Decision Support System (RadOnco CDSS)
 * Comprehensive 12-Organ Adaptive Clinical Decision & Prescription Matrix
 * Standards: NCCN v1.2025, ASTRO, ESTRO, QUANTEC, HyTEC, EMBRACE II, RAPIDO, PACIFIC, STAMPEDE, PORTEC-3, GROINSS-V
 */

'use client';

import React, { startTransition, useState, useEffect, useEffectEvent, useRef, useCallback, useId, useSyncExternalStore, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import {
  Radiation,
  Search,
  ArrowUpRight,
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
  ShieldAlert,
  Droplet,
  Baby,
  HandHeart,
  User,
  UtensilsCrossed,
  CheckCircle2,
  FileText,
  UploadCloud,
  XCircle,
  Activity,
  Calculator,
  Layers,
  Menu,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  TrendingUp,
  Download,
  Printer,
  Star,
} from 'lucide-react';
import { SignOutButton, useUser } from '@clerk/nextjs';
import { useLanguage } from '@/context/LanguageContext';

const SUBTYPE_DISPLAY_MAP: Record<string, string> = {
  nsclc: 'NSCLC (KHDAK)',
  sclc: 'SCLC (KHAK)',
  thymoma: 'Timoma',
  mesothelioma: 'Mezotelyoma',
  'cns-mets': 'Beyin MetastazÄ±',
  gbm: 'Glioblastom (GBM)',
  meningioma: 'Menenjiyom',
  Serviks: 'Serviks Uteri',
  Endometriyum: 'Endometriyum',
  Yumusak_Doku: 'YumuÅŸak Doku Sarkomu',
  Osteosarkom: 'Osteosarkom',
  cns: 'Merkezi Sinir Sistemi',
  gis: 'Gastrointestinal Sistem',
  gynecology: 'Jinekolojik',
  bone: 'Kemik ve YumuÅŸak Doku',
  pediatrics: 'Pediatrik',
  headneck: 'BaÅŸ-Boyun',
};

const NCCN_GUIDELINE_MAP: Record<string, { url: string; title: string; hint: string }> = {
  'thorax-nsclc': {
    url: 'https://www.nccn.org/guidelines/guidelines-detail?category=1&id=1450',
    title: 'NCCN Non-Small Cell Lung Cancer',
    hint: 'NSCL-C: Principles of Radiation Therapy',
  },
  'thorax-sclc': {
    url: 'https://www.nccn.org/guidelines/guidelines-detail?category=1&id=1462',
    title: 'NCCN Small Cell Lung Cancer',
    hint: 'SCLC: Limited-Stage & PCI',
  },
  'thorax-thymoma': {
    url: 'https://www.nccn.org/guidelines/guidelines-detail?category=1&id=1472',
    title: 'NCCN Thymomas and Thymic Carcinomas',
    hint: 'Thymoma: Postop RT / PORT',
  },
  'thorax-mesothelioma': {
    url: 'https://www.nccn.org/guidelines/guidelines-detail?category=1&id=1443',
    title: 'NCCN Malignant Pleural Mesothelioma',
    hint: 'Mesothelioma: Radiation Principles',
  },
  'prostate-prostate': {
    url: 'https://www.nccn.org/guidelines/guidelines-detail?category=1&id=1459',
    title: 'NCCN Prostate Cancer',
    hint: 'PROS: Risk-Adapted Radiation & ADT',
  },
  breast: {
    url: 'https://www.nccn.org/guidelines/guidelines-detail?category=1&id=1419',
    title: 'NCCN Invasive Breast Cancer',
    hint: 'BINV: Radiation Therapy Principles',
  },
  'gis-Rektum': {
    url: 'https://www.nccn.org/guidelines/guidelines-detail?category=1&id=1461',
    title: 'NCCN Rectal Cancer',
    hint: 'REC: SCRT vs Long-Course TNT',
  },
  'cns-mets': {
    url: 'https://www.nccn.org/guidelines/guidelines-detail?category=1&id=1425',
    title: 'NCCN Central Nervous System Cancers',
    hint: 'BRAIN: Stereotactic Radiosurgery (SRS)',
  },
  'gynecology-Serviks': {
    url: 'https://www.nccn.org/guidelines/guidelines-detail?category=1&id=1422',
    title: 'NCCN Cervical Cancer',
    hint: 'CERV: Definitive CRT + Brachytherapy',
  },
  'bone-sarcoma-Yumusak_Doku': {
    url: 'https://www.nccn.org/guidelines/guidelines-detail?category=1&id=1464',
    title: 'NCCN Soft Tissue Sarcoma',
    hint: 'SARC: Preop vs Postop RT Principles',
  },
};

// ==========================================
// 1. TÄ°PLER VE KLÄ°NÄ°K VERÄ° MODELLERÄ°
// ==========================================

export type OrganId =
  | 'thorax'
  | 'prostate'
  | 'breast'
  | 'gis'
  | 'head-neck'
  | 'cns'
  | 'gynecology'
  | 'bone'
  | 'sarcoma'
  /** @deprecated Kept for report compatibility; use bone or sarcoma. */
  | 'bone-sarcoma'
  | 'skin'
  | 'hematologic'
  | 'pediatric'
  | 'palliative'
  | 'emergencies'
  | 'benign';

interface ParsedReportData {
  detectedOrgan?: OrganId;
  detectedSubsite?: string;
  t?: string;
  n?: string;
  m?: string;
  psa?: string;
  gleasonPrimary?: number;
  gleasonSecondary?: number;
  er?: boolean;
  pr?: boolean;
  her2?: boolean;
  ki67?: number;
  centrality?: 'Peripheral' | 'Central' | 'Ultracentral';
  summary: string;
}

const parseMedicalReport = (text: string): ParsedReportData => {
  const lower = text.toLocaleLowerCase('tr-TR');
  const result: ParsedReportData = { summary: '' };

  if (/\b(prostat|prostate|psa|gleason)\b/i.test(text)) {
    result.detectedOrgan = 'prostate';
    result.detectedSubsite = 'prostate-prostate';
  } else if (/(akciÄŸer|lung|bronÅŸ|khdak|nsclc)/i.test(text)) {
    result.detectedOrgan = 'thorax';
    result.detectedSubsite = 'thorax-nsclc';
  } else if (/(meme|breast|duktal|mastektomi)/i.test(text)) {
    result.detectedOrgan = 'breast';
    result.detectedSubsite = 'breast-breast';
  } else if (/(rektum|rectal|kolon|mezorekt)/i.test(text)) {
    result.detectedOrgan = 'gis';
    result.detectedSubsite = 'gis-Rektum';
  } else if (/(serviks|cervix|endometriyum)/i.test(text)) {
    result.detectedOrgan = 'gynecology';
    result.detectedSubsite = lower.includes('endometriyum') ? 'gynecology-Endometriyum' : 'gynecology-Serviks';
  } else if (/(glioblastom|gbm|beyin|brain)/i.test(text)) {
    result.detectedOrgan = 'cns';
    result.detectedSubsite = 'cns-gbm';
  }

  const tMatch = text.match(/(?:[cp]?t)\s*([0-4][a-c]?|is|mic)\b/i);
  const nMatch = text.match(/(?:[cp]?n)\s*([0-3][a-c]?)\b/i);
  const mMatch = text.match(/(?:[cp]?m)\s*([0-1][a-c]?)\b/i);
  if (tMatch) result.t = `T${tMatch[1].toUpperCase()}`;
  if (nMatch) result.n = `N${nMatch[1].toUpperCase()}`;
  if (mMatch) result.m = `M${mMatch[1].toUpperCase()}`;

  const gleasonMatch = text.match(/gleason\s*(?:skoru?)?\s*[:=]?\s*([3-5])\s*\+\s*([3-5])/i);
  if (gleasonMatch) {
    result.gleasonPrimary = Number.parseInt(gleasonMatch[1], 10);
    result.gleasonSecondary = Number.parseInt(gleasonMatch[2], 10);
  }
  const psaMatch = text.match(/psa\s*[:=]?\s*(\d+[.,]?\d*)/i);
  if (psaMatch) result.psa = psaMatch[1].replace(',', '.');

  result.er = /(er\s*\(\s*\+\s*\)|er\s*pozitif|Ã¶strojen\s*pozitif)/i.test(text);
  result.pr = /(pr\s*\(\s*\+\s*\)|pr\s*pozitif|progesteron\s*pozitif)/i.test(text);
  result.her2 = /(her2\s*\(\s*\+\s*\)|her2\s*pozitif|her2\s*3\+)/i.test(text);
  const ki67Match = text.match(/ki[- ]?67\s*[:=]?\s*%?\s*(\d+)/i);
  if (ki67Match) result.ki67 = Number.parseInt(ki67Match[1], 10);

  if (/ultrasantral|ultracentral/i.test(text)) result.centrality = 'Ultracentral';
  else if (/santral|central/i.test(text)) result.centrality = 'Central';
  else if (/periferik|peripheral/i.test(text)) result.centrality = 'Peripheral';

  result.summary = `${result.detectedOrgan?.toUpperCase() || 'TUMOR'} | ${result.t || 'T?'} ${result.n || 'N?'} ${result.m || 'M?'}`;
  return result;
};

const GeminiIcon = ({ className = 'h-4 w-4' }: { className?: string }) => {
  const gradientId = useId();
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <defs>
        <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#4E82EE" />
          <stop offset="50%" stopColor="#9B72CB" />
          <stop offset="100%" stopColor="#D96570" />
        </linearGradient>
      </defs>
      <path d="M12 2C12 7.523 7.523 12 2 12C7.523 12 12 16.477 12 22C12 16.477 16.477 12 22 12C16.477 12 12 7.523 12 2Z" fill={`url(#${gradientId})`} />
    </svg>
  );
};

const ChatGPTIcon = ({ className = 'h-4 w-4' }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={`${className} text-[#10a37f]`} aria-hidden="true">
    <path d="M22.2819 9.8211a5.9847 5.9847 0 0 0-.5157-4.9108 6.0462 6.0462 0 0 0-6.5098-2.9A6.0651 6.0651 0 0 0 4.9807 4.1818a5.9847 5.9847 0 0 0-3.9977 2.9 6.0462 6.0462 0 0 0 .7427 7.0966 5.98 5.98 0 0 0 .511 4.9107 6.051 6.051 0 0 0 6.5146 2.9001A5.9847 5.9847 0 0 0 13.2599 24a6.0557 6.0557 0 0 0 5.7718-4.2058 5.9894 5.9894 0 0 0 3.9977-2.9001 6.0557 6.0557 0 0 0-.7475-7.0729zm-9.022 12.6081a4.4755 4.4755 0 0 1-2.8764-1.0408l.1419-.0804 4.7783-2.7582a.7948.7948 0 0 0 .3927-.6813v-6.7369l2.02 1.1686a.071.071 0 0 1 .038.052v5.5826a4.5045 4.5045 0 0 1-4.4945 4.4944zm-9.6607-4.1254a4.4708 4.4708 0 0 1-.5346-3.0137l.142.0852 4.783 2.7582a.7712.7712 0 0 0 .7806 0l5.8428-3.3685v2.3324a.0804.0804 0 0 1-.0332.0615L9.74 19.9502a4.4992 4.4992 0 0 1-6.1408-1.6464zM2.3408 7.8956a4.485 4.485 0 0 1 2.3655-1.9728V11.6a.7664.7664 0 0 0 .3879.6765l5.8144 3.3543-2.0201 1.1685a.0757.0757 0 0 1-.071 0l-4.8303-2.7865A4.504 4.504 0 0 1 2.3408 7.8956zm16.0993 3.8558L12.5973 8.3829l2.02-1.1639a.0804.0804 0 0 1 .071 0l4.8303 2.7913a4.4944 4.4944 0 0 1-.6765 8.1042v-5.6772a.79.79 0 0 0-.402-.6859zm2.0107-3.0231l-.142-.0852-4.7735-2.7818a.7759.7759 0 0 0-.7854 0L9.407 9.2297V6.8974a.0662.0662 0 0 1 .0284-.0615l4.8303-2.7866a4.4992 4.4992 0 0 1 6.6802 4.66zM8.3065 12.863l-2.02-1.1638a.0804.0804 0 0 1-.038-.0567V6.0742a4.4992 4.4992 0 0 1 7.3757-3.4537l-.142.0805L8.704 5.459a.7948.7948 0 0 0-.3927.6813v6.7227zm1.1218-1.9728l3.4111-1.968 3.4158 1.968v3.9409l-3.4158 1.9728-3.4111-1.9728z" />
  </svg>
);

const PerplexityIcon = ({ className = 'h-4 w-4' }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
    <path d="M12 2L4 7V17L12 22L20 17V7L12 2Z" stroke="#20B2AA" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M12 2V22M4 7L20 17M20 7L4 17" stroke="#20B2AA" strokeWidth="1.5" strokeLinecap="round" />
    <circle cx="12" cy="12" r="2.5" fill="#20B2AA" />
  </svg>
);

const NotebookLMIcon = ({ className = 'h-4 w-4' }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
    <rect x="3" y="3" width="18" height="18" rx="4" fill="#1e1e2f" stroke="#8b5cf6" strokeWidth="1.5" />
    <path d="M7 7H17M7 11H17M7 15H13" stroke="#c4b5fd" strokeWidth="1.8" strokeLinecap="round" />
    <circle cx="16" cy="15" r="2" fill="#a78bfa" />
  </svg>
);

const ClaudeIcon = ({ className = 'h-4 w-4' }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
    <path d="M12 2V6M12 18V22M2 12H6M18 12H22M4.93 4.93L7.76 7.76M16.24 16.24L19.07 19.07M4.93 19.07L7.76 16.24M16.24 7.76L19.07 4.93" stroke="#D97706" strokeWidth="2.5" strokeLinecap="round" />
    <circle cx="12" cy="12" r="3.5" fill="#D97706" />
  </svg>
);

const GrokIcon = ({ className = 'h-4 w-4' }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={`${className} text-slate-100`} aria-hidden="true">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);

const AiLogo = ({ id, className = 'h-4 w-4' }: { id: string; className?: string }) => {
  switch (id) {
    case 'gemini': return <GeminiIcon className={className} />;
    case 'chatgpt': return <ChatGPTIcon className={className} />;
    case 'perplexity': return <PerplexityIcon className={className} />;
    case 'notebooklm': return <NotebookLMIcon className={className} />;
    case 'claude': return <ClaudeIcon className={className} />;
    case 'grok': return <GrokIcon className={className} />;
    default: return <Sparkles className={className} aria-hidden="true" />;
  }
};

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
  motionManagement?: '4D-CT' | 'DIBH',
  histology?: string,
): EContourTarget => {
  const normalizedSubsite = subsite.toLocaleLowerCase('tr');
  const normalizedSurgery = surgeryStatus?.toLocaleLowerCase('tr') ?? '';
  const normalizedRisk = riskCategory?.toLocaleLowerCase('tr') ?? '';
  const isHighRisk = /yÃ¼ksek|high|unfavorable|unfavourable|Ã§ok yÃ¼ksek/.test(normalizedRisk);
  const target = (url: string, label_tr: string, label_en: string): EContourTarget => ({
    url,
    label_tr,
    label_en,
  });

  if (organ === 'prostate' && normalizedSubsite.includes('bladder')) {
    return target(
      'https://econtour.org/?search=bladder',
      'eContour: Mesane Kanseri Trimodalite (TÃ¼m Mesane + Pelvik Nodal)',
      'eContour: Bladder Cancer Trimodality (Whole Bladder + Pelvic Nodal)',
    );
  }

  if (organ === 'prostate' && normalizedSubsite.includes('testis')) {
    return target(
      'https://econtour.org/?search=seminoma',
      'eContour: Testis Seminomu (Paraaortik / Dogleg Nodal AtlasÄ±)',
      'eContour: Testicular Seminoma (Para-aortic / Dogleg Nodal Atlas)',
    );
  }

  if (organ === 'prostate' && normalizedSubsite.includes('penile')) {
    return target(
      'https://econtour.org/?search=penile',
      'eContour: Penil Kanser (Ä°nguinal & Pelvik Lenfatik AtlasÄ±)',
      'eContour: Penile Cancer (Inguinal & Pelvic Nodal Atlas)',
    );
  }

  if (organ === 'prostate' && normalizedSubsite.includes('kidney')) {
    return target(
      'https://econtour.org/?search=renal+sbrt',
      'eContour: BÃ¶brek RCC SABR / Normal Doku AtlasÄ±',
      'eContour: Renal Cell Carcinoma SABR / Normal Tissue Atlas',
    );
  }

  if (organ === 'prostate' && normalizedSubsite.includes('prostate')) {
    if (normalizedSurgery.includes('postop') || normalizedSurgery.includes('prostatektomi')) {
      return target(
        'https://econtour.org/cases/34',
        'eContour: Post-Prostatektomi YataÄŸÄ± (RTOG / RADICALS AtlasÄ±)',
        'eContour: Post-Prostatectomy Bed (RTOG / RADICALS Atlas)',
      );
    }
    if (t.startsWith('T3') || t.startsWith('T4') || n.startsWith('N1') || isHighRisk) {
      return target(
        'https://econtour.org/cases/34',
        'eContour: YÃ¼ksek Risk Prostat + Pelvik Lenfatikler',
        'eContour: High-Risk Prostate + Pelvic Nodes',
      );
    }
    return target(
      'https://econtour.org/cases/34',
      'eContour: Ä°ntakt Prostat SBRT / PACE-B AtlasÄ±',
      'eContour: Intact Prostate SBRT / PACE-B Atlas',
    );
  }

  if (organ === 'thorax') {
    if (normalizedSubsite.includes('thymoma') || normalizedSubsite.includes('timoma')) {
      return target(
        'https://econtour.org/?search=thymoma',
        'eContour: TimÃ¼s Masaoka-Koga Cerrahi Yatak PORT AtlasÄ±',
        'eContour: Thymoma Masaoka-Koga Post-op Bed (PORT) Atlas',
      );
    }
    if (normalizedSubsite.includes('sclc') && !normalizedSubsite.includes('nsclc')) {
      return target(
        'https://econtour.org/cases/9',
        'eContour: KHAK (SCLC) Pre-KT Mediastinal CTV AtlasÄ±',
        'eContour: Small Cell Lung Cancer (Pre-Chemo Mediastinal CTV) Atlas',
      );
    }
    if (normalizedSubsite.includes('mesothelioma')) {
      return target(
        'https://econtour.org/?search=mesothelioma',
        'eContour: Mezotelyoma Hemitorasik Plevral AtlasÄ±',
        'eContour: Mesothelioma Hemithoracic Pleural Atlas',
      );
    }
    // KHDAK (NSCLC)
    const isEarlyNsclc = m === 'M0' && n === 'N0' && (t.startsWith('T1') || t === 'T2');
    if (!isEarlyNsclc) {
      return target(
        'https://econtour.org/cases/10',
        'eContour: Lokal Ä°leri KHDAK (PACIFIC / Elektif Nodal CTV)',
        'eContour: Locally Advanced NSCLC (Elective Nodal / Primary CTV)',
      );
    }
    if (motionManagement === 'DIBH') {
      return target(
        'https://econtour.org/?search=lung+dibh',
        'eContour: AkciÄŸer SBRT (DIBH Nefes Tutma GTVâ†’PTV AtlasÄ±)',
        'eContour: Lung SBRT (DIBH Breath-Hold GTVâ†’PTV Atlas)',
      );
    }
    return target(
      'https://econtour.org/cases/11',
      'eContour: AkciÄŸer SBRT (4D-CT / ITV Hareket ZarfÄ± AtlasÄ±)',
      'eContour: Lung SBRT (4D-CT / ITV Motion Envelope Atlas)',
    );
  }

  if (organ === 'breast') {
    if (normalizedSurgery.includes('mastektomi') || normalizedSurgery.includes('mastectomy')) {
      return target(
        'https://econtour.org/cases/74',
        'eContour: PMRT GÃ¶ÄŸÃ¼s DuvarÄ± & Ä°nternal Mammar Nodal AtlasÄ±',
        'eContour: Post-Mastectomy Chest Wall & Internal Mammary Nodal Atlas',
      );
    }
    if (n === 'N2' || n === 'N3') {
      return target(
        'https://econtour.org/cases/74',
        'eContour: GÃ¶ÄŸÃ¼s DuvarÄ± + Aksilla & Supraklavikular (RNI)',
        'eContour: Chest Wall + Regional Nodal Irradiation (RNI)',
      );
    }
    return target(
      'https://econtour.org/hypofrac',
      'eContour: TÃ¼m Meme TanjantlarÄ± & TÃ¼mÃ¶r YataÄŸÄ± Boost AtlasÄ±',
      'eContour: Whole Breast Tangents & Tumor Bed Boost Atlas',
    );
  }

  if (organ === 'gis') {
    if (normalizedSubsite.includes('rektum') || normalizedSubsite.includes('rectal')) {
      return target(
        'https://econtour.org/cases/11',
        'eContour: Preoperatif Rektum & Pelvik Mezorektum AtlasÄ±',
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
    if (normalizedSubsite.includes('safra') || normalizedSubsite.includes('biliary') || normalizedSubsite.includes('cholangi')) {
      return target(
        'https://econtour.org/?search=biliary+tract',
        'eContour: Safra YollarÄ± & Postoperatif Safra Kesesi YataÄŸÄ±',
        'eContour: Biliary Tract & Post-op Gallbladder Bed',
      );
    }
    if (normalizedSubsite.includes('karaciger') || normalizedSubsite.includes('karaciÄŸer') || normalizedSubsite.includes('liver')) {
      return target(
        'https://econtour.org/?search=liver+sbrt',
        motionManagement === 'DIBH'
          ? 'eContour: Liver SBRT & Normal Tissue Constraints (DIBH / Motion Atlas)'
          : 'eContour: Liver SBRT & Normal Tissue Constraints (4D-CT / ITV Atlas)',
        motionManagement === 'DIBH'
          ? 'eContour: Liver SBRT & Normal Tissue Constraints (DIBH / Motion Atlas)'
          : 'eContour: Liver SBRT & Normal Tissue Constraints (4D-CT / ITV Atlas)',
      );
    }
    if (normalizedSubsite.includes('ozofagus') || normalizedSubsite.includes('Ã¶zofagus') || normalizedSubsite.includes('esophag')) {
      return target(
        'https://econtour.org/?search=esophagus',
        'eContour: Ã–zofagus Karsinomu (CROSS Protokol GTV/CTV AtlasÄ±)',
        'eContour: Esophageal Carcinoma (CROSS Protocol GTV/CTV Atlas)',
      );
    }
    if (normalizedSubsite.includes('anal') || normalizedSubsite.includes('anus')) {
      return target(
        'https://econtour.org/?search=anal',
        'eContour: Anal Kanal SkuamÃ¶z (Ä°nguinal / Pelvik Nodal AtlasÄ±)',
        'eContour: Anal Squamous Cell Carcinoma (Inguinal / Pelvic Nodal Atlas)',
      );
    }
    if (normalizedSubsite.includes('pankreas') || normalizedSubsite.includes('pancrea')) {
      return target(
        'https://econtour.org/?search=pancreas',
        'eContour: Pankreas Adenokarsinomu / SBRT AtlasÄ±',
        'eContour: Pancreatic Adenocarcinoma / SBRT Atlas',
      );
    }
    return target(
      'https://econtour.org/cases/',
      'eContour: Gastrointestinal TÃ¼mÃ¶r Konturlama AtlasÄ±',
      'eContour: Gastrointestinal Contouring Atlas',
    );
  }

  if (organ === 'head-neck') {
    if (normalizedSubsite.includes('nasopharynx') || normalizedSubsite.includes('nazofarenks')) {
      return target(
        'https://econtour.org/cases/',
        'eContour: Nazofarenks & Retrofarengeal / Kafa TabanÄ± KapsamÄ±',
        'eContour: Nasopharynx & Retropharyngeal / Skull Base',
      );
    }
    return target(
      'https://econtour.org/?search=head+neck+nodal',
      'eContour: BaÅŸ-Boyun Nodal DÃ¼zeyler & Primer SIB Hedef AtlasÄ± (DAHANCA / RTOG)',
      'eContour: Head & Neck Nodal Levels & Primary SIB Target Atlas (DAHANCA / RTOG)',
    );
  }

  if (organ === 'cns') {
    if (normalizedSubsite.includes('meningioma') || normalizedSubsite.includes('menenj')) {
      return target(
        'https://econtour.org/cases/12',
        'eContour: Menenjiom (Dural Kuyruk & Kemik Ä°nvazyonu AtlasÄ±)',
        'eContour: Intracranial Meningioma (Dural Tail & Bone Invasion Atlas)',
      );
    }
    if (normalizedSubsite.includes('glioma') || normalizedSubsite.includes('gbm') || normalizedSubsite.includes('glioblastom')) {
      return target(
        'https://econtour.org/cases/1',
        'eContour: Glial TÃ¼mÃ¶r (ESTRO/EORTC & RTOG T2/FLAIR CTV AtlasÄ±)',
        'eContour: Glioma / GBM (ESTRO/EORTC & RTOG T2/FLAIR CTV Atlas)',
      );
    }
    // Beyin metastazlarÄ±
    const isOligoMets = t.startsWith('T1') || t === 'T2';
    if (isOligoMets) {
      return target(
        'https://econtour.org/cases/2',
        'eContour: Beyin MetastazlarÄ± SRS / Radyocerrahi AtlasÄ±',
        'eContour: Brain Metastases SRS / Radiosurgery Atlas',
      );
    }
    return target(
      'https://econtour.org/?search=ha-wbrt',
      'eContour: HA-WBRT (Hipokampus Koruyucu TÃ¼m Beyin RT AtlasÄ±)',
      'eContour: WBRT with Hippocampal Sparing (HA-WBRT Atlas)',
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
        'eContour: Vulva GROINSS-V KasÄ±k & Pelvik Lenfatikler',
        'eContour: Vulva GROINSS-V Inguinal & Pelvic Nodes',
      );
    }
    return target(
      'https://econtour.org/cases/',
      'eContour: EMBRACE II Serviks Pelvik EBRT & MR-IGABT',
      'eContour: EMBRACE II Cervix Pelvic EBRT & MR-IGABT',
    );
  }

  if (organ === 'bone' || organ === 'bone-sarcoma') {
    if (normalizedSubsite.includes('kordoma') || normalizedSubsite.includes('chordoma') || histology === 'Kordoma') {
      return target(
        'https://econtour.org/?search=spine+sbrt',
        'eContour: Kordoma / Omurga SBRT (International Spine Consortium AtlasÄ±)',
        'eContour: Chordoma / Spine SBRT (International Spine Consortium Atlas)',
      );
    }
    if (normalizedSubsite.includes('ewing') || normalizedSubsite.includes('osteosarkom') || histology === 'Osteosarkom' || histology === 'Ewing') {
      return target(
        'https://econtour.org/cases/',
        'eContour: Kemik SarkomlarÄ± (Pre-KT Kemik Tutulum Hacmi)',
        'eContour: Bone Sarcoma (Pre-chemo Bone Extent CTV)',
      );
    }
    if (normalizedSubsite.includes('yumusak') || normalizedSubsite.includes('soft') || histology === 'ups' || histology === 'liposarcoma' || histology === 'leiomyosarcoma' || histology === 'synovial') {
      return target(
        'https://econtour.org/?search=soft+tissue+sarcoma',
        'eContour: Ekstremite YumuÅŸak Doku Sarkomu (Preop 50 Gy Fasyal Marjinler)',
        'eContour: Extremity Soft Tissue Sarcoma (Preoperative 50 Gy Fascial Margins)',
      );
    }
    return target(
      'https://econtour.org/cases/',
      'eContour: Kemik & YumuÅŸak Doku Sarkomu Konturlama AtlasÄ±',
      'eContour: Bone & Soft Tissue Sarcoma Contouring Atlas',
    );
  }

  if (organ === 'skin') {
    return target(
      'https://econtour.org/cases/',
      'eContour: KutanÃ¶z Melanom / NMSC Marjin ve Nodal AtlasÄ±',
      'eContour: Cutaneous Melanoma / NMSC Margin & Nodal Atlas',
    );
  }

  if (organ === 'hematologic') {
    if (histology === 'Plasmacytoma' || histology === 'Myeloma') {
      return target(
        'https://econtour.org/?search=myeloma',
        'eContour: Multipl Miyelom / Plazmositom Lokal RT AtlasÄ±',
        'eContour: Multiple Myeloma / Plasmacytoma Local RT Atlas',
      );
    }
    return target(
      'https://econtour.org/?search=lymphoma+isrt',
      'eContour: Lenfoma Tutulu Alan RT (ILROG ISRT/INRT AtlasÄ±)',
      'eContour: Lymphoma Involved Site RT (ILROG ISRT/INRT Atlas)',
    );
  }

  if (organ === 'pediatric') {
    if (histology === 'Medulloblastom' || normalizedSubsite.includes('medulloblastoma')) {
      return target(
        'https://econtour.org/?search=craniospinal',
        'eContour: Pediatrik Kraniyospinal IÅŸÄ±nlama (CSI) & Posterior Fossa Boost',
        'eContour: Pediatric Craniospinal Irradiation (CSI) & Posterior Fossa Boost',
      );
    }
    return target(
      'https://econtour.org/cases/',
      'eContour: Pediatrik TÃ¼mÃ¶r Konturlama AtlasÄ±',
      'eContour: Pediatric Tumor Contouring Atlas',
    );
  }

  if (organ === 'palliative') {
    if (normalizedSubsite.includes('spinal') || normalizedSubsite.includes('kord')) {
      return target(
        'https://econtour.org/cases/',
        'eContour: Spinal Kord BasÄ±sÄ± Acil Dekompresif KRT',
        'eContour: Spinal Cord Compression Emergency RT',
      );
    }
    return target(
      'https://econtour.org/cases/',
      'eContour: Kemik MetastazlarÄ± Omurga/Femur SBRT & 3D',
      'eContour: Bone Metastases Spine/Femur SBRT & 3D',
    );
  }

  if (organ === 'benign') {
    if (normalizedSubsite.includes('ho') || normalizedSubsite.includes('heterotopik')) {
      return target(
        'https://econtour.org/cases/',
        'eContour: Heterotopik Ossifikasyon KalÃ§a PeriartikÃ¼ler',
        'eContour: Heterotopic Ossification Periarticular Soft Tissue',
      );
    }
    if (normalizedSubsite.includes('keloid')) {
      return target(
        'https://econtour.org/cases/',
        'eContour: Keloid Cerrahi Eksizyon YataÄŸÄ± (<24h)',
        'eContour: Keloid Excision Bed Superficial Target (<24h)',
      );
    }
    if (normalizedSubsite.includes('dupuytren')) {
      return target(
        'https://econtour.org/cases/',
        'eContour: Dupuytren Palmar AponÃ¶roz NodÃ¼l & Kordon',
        'eContour: Dupuytren Palmar Aponeurosis Cord & Nodule',
      );
    }
    return target(
      'https://econtour.org/cases/',
      'eContour: Dejeneratif Kas-Ä°skelet DÃ¼ÅŸÃ¼k Doz RT Hedefi',
      'eContour: Degenerative Musculoskeletal Low-Dose RT',
    );
  }

  return target(
    'https://econtour.org/cases/',
    'eContour: Ä°nteraktif 3D Konturlama AtlasÄ±',
    'eContour: Interactive 3D Contouring Atlas',
  );
};

const TRANSLATION_MAP: Record<string, string> = {
  'Ä°nvaziv Duktal Karsinom (Ä°DK)': 'Invasive Ductal Carcinoma (IDC)',
  'Ä°nvaziv LobÃ¼ler Karsinom (Ä°LK)': 'Invasive Lobular Carcinoma (ILC)',
  'Duktal Karsinoma Ä°n Situ (DCIS)': 'Ductal Carcinoma In Situ (DCIS)',
  'Malign Filloides TÃ¼mÃ¶rÃ¼': 'Malignant Phyllodes Tumor',
  'Metaplastik Karsinom': 'Metaplastic Carcinoma',
  'MKC (Lumpektomi)': 'BCS (Lumpectomy)',
  'Negatif (â‰¥2 mm)': 'Negative (â‰¥2 mm)',
  'Mikroinvazyon; en bÃ¼yÃ¼k odak â‰¤0.1 cm (1 mm)': 'Microinvasion; largest focus â‰¤0.1 cm (1 mm)',
  '>5 cm primer meme kitlesi': '>5 cm primary breast tumor',
  'GÃ¶ÄŸÃ¼s duvarÄ± fiksasyonu, cilt Ã¼lserasyonu or enflamatuar karsinom': 'Chest wall fixation, skin ulceration, or inflammatory carcinoma',
  'Aksiller lymph node metastasis absent': 'No regional axillary lymph node metastasis',
  '1-3 ipsilateral hareketli Level I-II aksiller lymph node': '1-3 ipsilateral mobile Level I-II axillary lymph nodes',
  '4-9 aksiller lymph node or fikse konglomere kitle': '4-9 axillary lymph nodes or matted conglomerate nodal mass',
  'â‰¥10 aksiller nod or supraklavikuler / internal mammar lymph node': 'â‰¥10 axillary nodes or supraclavicular / internal mammary involvement',
  'Kemik, akciÄŸer, karaciÄŸer or beyin uzak metastasis': 'Distant metastasis (bone, lung, liver, or brain)',
  'Cilt altÄ± 5 mm': '5 mm beneath skin',
  'TÃ¼m meme parankimi': 'Whole breast parenchyma',
  'Kavite ve klipsler': 'Surgical cavity and titanium clips',
  'TÃ¼m meme Ä±ÅŸÄ±nlamasÄ±; nodal risk durumuna gÃ¶re RNI eklenmez. Menopoz: Postmenopozal. ER positive, PR positive, HER2 negative, Ki-67 18%, Grade 2. 40 Gy/15 fx eÅŸdeÄŸer standard seÃ§enektir.': 'Whole breast irradiation; RNI not indicated based on nodal status. Postmenopausal, ER+, PR+, HER2-, Ki-67 18%, Grade 2. 40 Gy/15 fx is an equivalent standard.',
  'Adjuvant sistemik tedavi multidisipliner kararla belirlenir.': 'Adjuvant systemic therapy is guided by multidisciplinary tumor board.',
  'Nasopharynx or orofarenks/burun boÅŸluÄŸu ile limited': 'Confined to nasopharynx, or extending to oropharynx or nasal cavity',
  'Parafaringeal alana uzanÄ±m': 'Extension into parapharyngeal space',
  'KafatasÄ± tabanÄ±, servikal vertebra, pterigoid kemik invasion': 'Invasion of skull base, cervical vertebra, or pterygoid structures',
  'Ä°ntrakraniyal uzanÄ±m, kraniyal sinir involvement, hipofarinks, orbita': 'Intracranial extension, cranial nerve involvement, hypopharynx, or orbit',
  'Unilateral servikal (â‰¤6 cm) or bilateral retrofaringeal lymph node': 'Unilateral cervical lymph node (â‰¤6 cm) or bilateral retropharyngeal lymph nodes',
  'Bilateral servikal lymph node (â‰¤6 cm, klavikula Ã¼stÃ¼)': 'Bilateral cervical lymph nodes (â‰¤6 cm, above supraclavicular fossa)',
  '>6 cm lymph node or supraklavikuler fossa involvement': 'Lymph node >6 cm or extension into supraclavicular fossa',
  'Distant metastaz mevcut': 'Distant metastasis present',
  '70 / 60 / 54 Gy - 33 fx (3 Kademeli Standard SIB Kemoradyoterapi)': '70 / 60 / 54 Gy - 33 fx (3-Dose Level SIB Chemoradiotherapy)',
  'Primer kitle ve makroskopik tutulu lenf nodlarÄ±': 'Primary gross disease and macroscopic involved lymph nodes',
  'VMAT / IMRT (EÅŸzamanlÄ± Entegre Boost)': 'VMAT / IMRT (Simultaneous Integrated Boost - SIB)',
  'YÃ¼ksek risk nodlar': 'High-risk nodal stations',
  'Primary komÅŸuluÄŸu ve involved nod istasyonu': 'Primary tumor bed and adjacent involved nodal stations',
  'Bilateral boyun': 'Bilateral elective neck',
  'Bilateral Level II-V + retrofaringeal lymph nodes (RPN)': 'Bilateral Levels II-V + retropharyngeal lymph nodes (RPN)',
  'Parotid Gland Bezi (Contralateral)': 'Contralateral Parotid Gland',
  'Kserostomi korumasÄ±': 'Xerostomia sparing',
  'EÅŸzamanlÄ± Sisplatin (100 mg/m2 days 1, 22, 43 or 40 mg/m2 haftalÄ±k)': 'Concurrent Cisplatin (100 mg/mÂ² q3w or 40 mg/mÂ² weekly)',
  'Åift absent': 'No midline shift',
  'Asemptomatik': 'Asymptomatic',
  'Surgery absent': 'No prior surgical resection',
  'Soliter N0 M1': 'Solitary Brain Met (N0 M1)',
  'Tek Odak â‰¤2 cm soliter metastatik lezyon': 'Single focus: â‰¤2 cm solitary metastatic lesion',
  '2-4 Odak Oligometastatic intrakraniyal lezyonlar (diameter â‰¤3-4 cm)': '2-4 Foci: Oligometastatic intracranial lesions (diameter â‰¤3-4 cm)',
  '>4 Odak / YaygÄ±n Ã‡oklu intrakranial metastazlar or yaygÄ±n Ã¶dem/kitle etkisi': '>4 Foci / Widespread multiple metastases or significant edema/mass effect',
  'Primary tÃ¼mÃ¶r bÃ¶lgesel lymph node negative': 'Primary tumor regional lymph nodes negative',
  'Primary tÃ¼mÃ¶r bÃ¶lgesel lymph node positive': 'Primary tumor regional lymph nodes positive',
  'Parankimal intrakraniyal beyin metastasis': 'Parenchymal intracranial brain metastasis',
  '24 Gy / 1 fx (Tek Fraksiyon SRS)': '24 Gy / 1 fx (Single-Fraction SRS)',
  'MR T1 kontrast tutan lezyon': 'Contrast-enhancing lesion on T1-weighted MRI',
  'Stereotaktik Radyocerrahi (SRS - Gamma Knife / CyberKnife / VMAT)': 'Stereotactic Radiosurgery (SRS - Gamma Knife / CyberKnife / VMAT)',
  '1-4 odakta tek baÅŸÄ±na SRS; hasta performansÄ± (KPS 90) ve sistemik disease kontrolÃ¼yle birlikte is considered. Asemptomatik durumda yakÄ±n nÃ¶rolojik ve gÃ¶rÃ¼ntÃ¼leme izlemi gerekir.': 'Upfront SRS alone for 1-4 metastases considering patient performance (KPS 90) and systemic control. Close surveillance with serial MRI is required.',
  'Sub-milimetrik set-up zarfÄ±': 'Sub-millimeter set-up safety margin',
  'KutanÃ¶z SkuamÃ¶z HÃ¼creli Karsinom (cSCC)': 'Cutaneous Squamous Cell Carcinoma (cSCC)',
  'Negative marjin': 'Negative margin',
  'â‰¤2 cm diameter; high risk Ã¶zelliÄŸi absent': 'â‰¤2 cm diameter; no high-risk features',
  '>4 cm or derin invazyon (>6 mm) or kemik korteks erozyonu': '>4 cm or deep invasion (>6 mm) or bone cortex erosion',
  'Aksiyel kemik or kafatasÄ± tabanÄ± derin invasion': 'Axial skeleton or skull base deep invasion',
  'Regional lymph node involvement absent': 'No regional lymph node metastasis',
  '1 lymph node metastasis (â‰¤3 cm)': 'Single lymph node metastasis (â‰¤3 cm)',
  'Ã‡oklu lymph node or >3 cm kitle': 'Multiple lymph nodes or >3 cm nodal mass',
  'Distant visseral organ metastazlarÄ±': 'Distant visceral organ metastases',
  'LOW RISK cSCC: SURGERY / SURVEILLANCE; radiotherapy YALNIZCA ENDÄ°KASYON VARSA': 'LOW-RISK cSCC: SURGERY / SURVEILLANCE; RT ONLY IF HIGH-RISK FEATURES',
  '60 Gy / 30 fx (cSCC, radiotherapy endikasyonu varsa)': '60 Gy / 30 fx (cSCC, if adjuvant RT indicated)',
  'Primer yatak / lezyon': 'Primary surgical bed / macroscopic lesion',
  'YÃ¼ksek riskte IMRT / VMAT': 'IMRT / VMAT or electron beam for high-risk anatomy',
  'Klinik marjin ve anatomik bariyerlere gÃ¶re': 'Adjusted for anatomic barriers and clinical margins',
  'Eye / Globe Lensi (YÃ¼z ise)': 'Lens of the Eye (Facial lesions)',
  'Kemik / KÄ±kÄ±rdak': 'Bone / Cartilage',
  'Low risk cSCC for cerrahi/izlem Ã¶nceliklidir; radiotherapy yalnÄ±zca clinical endikasyon varsa is considered.': 'Surgery or observation is preferred for low-risk cSCC; adjuvant RT is indicated only for close/positive margins or high-risk features.',
  'Ä°nsidental TURP materyalinde tÃ¼mÃ¶r â‰¤%5': 'Incidental histologic finding in â‰¤5% of resected tissue',
  'Ä°nsidental TURP materyalinde tÃ¼mÃ¶r >%5': 'Incidental histologic finding in >5% of resected tissue',
  'Muayenede palpe edilemeyen; PSA yÃ¼ksekliÄŸi biyopsisinde saptanan': 'Tumor identified by needle biopsy (elevated PSA), non-palpable',
  'GÃœS Anatomik Alt BÃ¶lgesi': 'GU Anatomic Subsite',
  'INDICATED: HIGH RISK PROSTAT ESKALE radiotherapy + 2 YIL ADT': 'INDICATED: HIGH-RISK PROSTATE DOSE-ESCALATED RT + 2 YEARS ADT',
  '78 Gy / 39 fx or 60 Gy / 20 fx + 18-36 Ay ADT': '78 Gy / 39 fx or 60 Gy / 20 fx + 18-36 Months ADT',
  'Target: Prostat ve seminal vezikÃ¼ller': 'Target: Prostate and seminal vesicles',
  'Nodal: Risk temelli elektif pelvik lenfatik alanlar': 'Nodal: Risk-based elective pelvic nodal volumes',
  'Very High riskli lokalize prostat kanserinde dose eskalasyonu ve uzun dÃ¶nem hormonoterapi multidisipliner olarak is considered.': 'In very high-risk localized prostate cancer, dose escalation and long-term ADT are recommended.',
  'Prostate ve seminal vezikÃ¼ller': 'Prostate and seminal vesicles',
  'Risk temelli elektif pelvik lenfatik alanlar': 'Risk-based elective pelvic nodal volumes',
  '18-36 ay androjen deprivasyon tedavisi (ADT); elektif pelvik nodal radiotherapy (46-50 Gy) risk ve nodal deÄŸerlendirmeyle is planned.': '18-36 months of androgen deprivation therapy (ADT); elective pelvic nodal radiotherapy (46-50 Gy) is planned based on risk evaluation.',
  'BÃ¶lge dÄ±ÅŸÄ± uzak lymph node metastazlarÄ±': 'Distant extra-pelvic lymph node metastases',
  'Kemik metastasis (aksiyel/apandikÃ¼ler iskelet)': 'Bone metastases (axial / appendicular skeleton)',
  'Visseral organ metastazlarÄ± (akciÄŸer, karaciÄŸer vb.)': 'Visceral organ metastases (lung, liver, etc.)',
  'IlÄ±mlÄ± Hipofraksiyonasyon': 'Moderate Hypofractionation',
  'Palpabl tÃ¼mÃ¶r; bir lobun yarÄ±sÄ± or daha azÄ± ile limited': 'Palpable tumor confined to half of one lobe or less',
  'Palpabl tÃ¼mÃ¶r; bir lobun yarÄ±sÄ±ndan fazlasÄ±na uzanmÄ±ÅŸ': 'Palpable tumor involving more than half of one lobe',
  'Bilateral her iki prostat lobunu tutan kitle': 'Tumor involving both lobes bilaterally',
  'Extracapsular extension (ECE) - Prostate kapsÃ¼lÃ¼nÃ¼ aÅŸmÄ±ÅŸ': 'Extracapsular extension (ECE) - Extends beyond prostatic capsule',
  'Rectum, levator kaslarÄ± or pelvik taban komÅŸu organ invasion': 'Invasion of adjacent organs: rectum, levator muscles, or pelvic floor',
  'Regional pelvik lymph node metastasis absent': 'No regional pelvic lymph node metastasis',
  'Pelvic lymph node metastasis (obturator, iliak nodlar)': 'Pelvic lymph node metastasis (obturator, internal/external iliac)',
  'ORTA-FAVORABLE: ADT GENELLÄ°KLE NOT REQUIRED': 'INTERMEDIATE-FAVORABLE: ADT GENERALLY NOT REQUIRED',
  '60 Gy / 20 fx (IlÄ±mlÄ± Hipofraksiyonasyon CHHIP)': '60 Gy / 20 fx (Moderate Hypofractionation - CHHIP Protocol)',
  'Intermediate riskli prostat kanserinde 20 fraksiyonluk rejim 39 fraksiyona non-inferiordur (Category 1 standard).': 'In intermediate-risk prostate cancer, a 20-fraction schedule is non-inferior to 39 fractions (Category 1 standard).',
  'Intermediate-favorable riskte ADT Ã§oÄŸunlukla is not recommended.': 'In favorable-intermediate risk, androgen deprivation therapy (ADT) is generally not recommended.',
  'Target: Prostat bezi ve seminal vezikÃ¼l proksimal 1 cm': 'Target: Prostate gland and proximal 1 cm of seminal vesicles',
  'Prostate bezi ve seminal vezikul proksimal 1 om': 'Prostate gland and proximal 1 cm of seminal vesicles',
  'Ã‡ok YÃ¼ksek Riskli veya N1 Prostat Ca': 'Very High-Risk or N1 Prostate Cancer',
  'Ã‡ok YÃ¼ksek Risk': 'Very High Risk',
  'Ã‡ok yÃ¼ksek risk': 'Very high risk',
  'Ã‡ok YÃ¼ksek': 'Very High Risk',
  'Ã‡ok yÃ¼ksek': 'Very high',
  'YÃ¼ksek-Orta Risk': 'High-Intermediate Risk',
  'YÃ¼ksek Orta Risk': 'High-Intermediate Risk',
  'YÃ¼ksek risk': 'High risk',
  'DÃ¼ÅŸÃ¼k risk': 'Low risk',
  'Standart Risk': 'Standard Risk',
  'KÃ¼Ã§Ã¼k HÃ¼creli DÄ±ÅŸÄ± AkciÄŸer Ca (KHDAK)': 'Non-Small Cell Lung Cancer (NSCLC)',
  'KÃ¼Ã§Ã¼k HÃ¼creli AkciÄŸer Ca (KHAK / SCLC)': 'Small Cell Lung Cancer (SCLC)',
  'KÃ¼Ã§Ã¼k HÃ¼creli AkciÄŸer Ca (KHAK)': 'Small Cell Lung Cancer (SCLC)',
  'Timoma & Timik Karsinom': 'Thymoma / Thymic Carcinoma',
  'Malign Plevral Mezotelyoma (MPM)': 'Malignant Pleural Mesothelioma (MPM)',
  'Nazofarenks Karsinomu (NPC)': 'Nasopharyngeal Carcinoma (NPC)',
  'Orofarenks Karsinomu (p16/HPV)': 'Oropharyngeal Carcinoma (p16/HPV)',
  'Larinks Karsinomu (Glottik/Supraglottik)': 'Laryngeal Cancer (Glottic/Supraglottic)',
  'Hipofarenks Karsinomu': 'Hypopharyngeal Carcinoma',
  'Oral Kavite Karsinomu': 'Oral Cavity Carcinoma',
  'TÃ¼kÃ¼rÃ¼k Bezi TÃ¼mÃ¶rleri': 'Salivary Gland Tumors',
  'Beyin MetastazlarÄ±': 'Brain Metastases',
  'Beyin MetastazÄ±': 'Brain Metastases',
  'Glioblastom': 'Glioblastoma (GBM)',
  'Menenjiyom': 'Meningioma',
  'Serviks Uteri Karsinomu (Cervix)': 'Cervical Cancer',
  'Endometriyum Karsinomu (Corpus Uteri)': 'Endometrial Cancer',
  'Over & Tuba Uterina Karsinomu': 'Ovarian / Fallopian Tube Cancer',
  'Vajen Karsinomu (Vagina)': 'Vaginal Cancer',
  'Vulva Karsinomu (Vulva)': 'Vulvar Cancer',
  'YumuÅŸak Doku Sarkomu (YDS / STS)': 'Soft Tissue Sarcoma (STS)',
  'Osteosarkom (Osteosarcoma)': 'Osteosarcoma',
  'Ewing Sarkomu (Ewing Sarcoma)': 'Ewing Sarcoma',
  'Kondrosarkom (Chondrosarcoma)': 'Chondrosarcoma',
  'Kordoma (Sakral / Klivus Chordoma)': 'Chordoma (Sacral / Clival)',
  'Dev HÃ¼creli Kemik TÃ¼mÃ¶rÃ¼ (GCTB)': 'Giant Cell Tumor of Bone (GCTB)',
  'Melanom': 'Melanoma',
  'Bazal HÃ¼creli Karsinom (BCC)': 'Basal Cell Carcinoma (BCC)',
  'SkuamÃ¶z HÃ¼creli Karsinom (SCC)': 'Squamous Cell Carcinoma (SCC)',
  'Hodgkin Lenfoma': 'Hodgkin Lymphoma',
  'Non-Hodgkin Lenfoma': 'Non-Hodgkin Lymphoma',
  'Multipl Miyelom': 'Multiple Myeloma',
  'Kemik MetastazÄ±': 'Bone Metastases',
  'Spinal Kord BasÄ±sÄ±': 'Spinal Cord Compression',
  'Palyatif Beyin MetastazÄ±': 'Palliative Brain Metastases',
  'Palyatif Radyoterapi': 'Palliative Radiotherapy',
  'Benign HastalÄ±klar': 'Benign Diseases',
  'Heterotopik Ossifikasyon': 'Heterotopic Ossification',
  'Heterotopik Ossifikasyon Profilaksisi': 'Heterotopic Ossification Prophylaxis',
  'Keloid Profilaksisi': 'Keloid Prophylaxis',
  'Dupuytren KontraktÃ¼rÃ¼': 'Dupuytren Contracture',
  'Ledderhose HastalÄ±ÄŸÄ±': 'Ledderhose Disease',
  'Jinekomasti Profilaksisi': 'Gynecomastia Prophylaxis',
  'Plantar Fasiit / Kalkaneus Dikeni': 'Plantar Fasciitis / Heel Spur',
  'TenisÃ§i / GolfÃ§Ã¼ DirseÄŸi': 'Tennis / Golferâ€™s Elbow',
  'Omuz Periartriti / Ä°mpingement': 'Shoulder Periarthritis / Impingement',
  'Gonartroz / Koksartroz': 'Gonarthrosis / Coxarthrosis',
  'Graves Orbitopati': 'Graves Orbitopathy',
  'Trigeminal Nevralji (SRS)': 'Trigeminal Neuralgia (SRS)',
  'Trigeminal Nevralji SRS': 'Trigeminal Neuralgia SRS',
  'VestibÃ¼ler Schwannom': 'Vestibular Schwannoma',
  'ArteriovenÃ¶z Malformasyon (AVM)': 'Arteriovenous Malformation (AVM)',
  'Prostat': 'Prostate',
  'Mesane': 'Bladder',
  'Testis': 'Testis',
  'Prostat Kanseri': 'Prostate Cancer',
  'Mesane Kanseri': 'Bladder Cancer',
  'Meme Kanseri': 'Breast Cancer',
  'Rektum Kanseri': 'Rectal Cancer',
  'Mide Kanseri': 'Gastric Cancer',
  'Pankreas Kanseri': 'Pancreatic Cancer',
  'Ã–zofagus Kanseri': 'Esophageal Cancer',
  'KaraciÄŸer': 'Liver',
  Karaciger: 'Liver',
  SafraYollari: 'Biliary Tract',
  kidney: 'Kidney',
  'renal-clear-cell': 'Clear-cell RCC',
  'renal-papillary': 'Papillary RCC',
  'renal-chromophobe': 'Chromophobe RCC',
  'liver-hcc': 'Hepatocellular Carcinoma (HCC)',
  'liver-colorectal-metastasis': 'Colorectal Liver Metastasis',
  'biliary-intrahepatic': 'Intrahepatic Cholangiocarcinoma',
  'biliary-perihilar': 'Perihilar Cholangiocarcinoma (Klatskin)',
  'biliary-extrahepatic': 'Distal / Extrahepatic Cholangiocarcinoma',
  'biliary-gallbladder': 'Gallbladder Cancer',
  'Nazofarenks': 'Nasopharynx',
  'Orofarenks': 'Oropharynx',
  'Larenks': 'Larynx',
  'Hipofarenks': 'Hypopharynx',
  'Oral Kavite': 'Oral Cavity',
  'Serviks': 'Cervix',
  'Endometriyum': 'Endometrium',
  'Vajen': 'Vagina',
  'Vulva': 'Vulva',
  'YumuÅŸak Doku Sarkomu': 'Soft Tissue Sarcoma',
  'Osteosarkom': 'Osteosarcoma',
  'Ewing Sarkomu': 'Ewing Sarcoma',
  'Kondrosarkom': 'Chondrosarcoma',
  'Kordoma': 'Chordoma',
  'Periferik erken evre KHDAK (Kategori 1 kÃ¼ratif altÄ±n standart, BED10 = 151.2 Gy).': 'Peripheral early-stage NSCLC (Category 1 curative gold standard, BED10 = 151.2 Gy).',
  'Lokal ileri KHDAK; EÅŸzamanlÄ± Kemo-Radyoterapi (Kategori 1).': 'Locally advanced NSCLC; concurrent chemoradiotherapy (Category 1).',
  'Hedef: 4D-CT tÃ¼m solunum hareket hacmi': 'Target: 4D-CT full respiratory motion ITV',
  'Nodal: Elektif nodal hedef yok': 'Nodal: No elective nodal irradiation',
  'Teknik & Hareket: SBRT (4D-CT / ITV VMAT)': 'Technique: SBRT (4D-CT / ITV VMAT)',
  'Teknik: SBRT (4D-CT / ITV VMAT)': 'Technique: SBRT (4D-CT / ITV VMAT)',
  '4D-CT tÃ¼m solunum hareket hacmi': '4D-CT full respiratory motion ITV',
  'Set-up ve internal marjin': 'Set-up and internal margin',
  'Primer tÃ¼mÃ¶r ve tutulu lenfatikler': 'Primary tumor and involved nodal stations',
  'Elektif nodal CTV': 'Elective nodal CTV',
  'Cerrahi yatak ve marjin': 'Surgical bed and microscopic margin',
  'Bilateral AkciÄŸer': 'Bilateral Lung',
  'Spinal Kord': 'Spinal Cord',
  'Kalp': 'Heart',
  'Ã–zofagus': 'Esophagus',
  'Brakiyal Pleksus': 'Brachial Plexus',
  'Trakea / Ana BronÅŸ': 'Trachea / Main Bronchus',
  'GÃ¶z': 'Eye / Globe',
  'Optik Sinir': 'Optic Nerve',
  'Optik Kiazma': 'Optic Chiasm',
  'Beyin SapÄ±': 'Brainstem',
  'Koklea': 'Cochlea',
  'Parotis': 'Parotid Gland',
  'Submandibular': 'Submandibular Gland',
  'Mide': 'Stomach',
  'Duodenum': 'Duodenum',
  'Ä°nce BaÄŸÄ±rsak': 'Small Bowel',
  'Rektum': 'Rectum',
  'Femur BaÅŸÄ±': 'Femoral Head',
  'BÃ¶brek': 'Kidney',
  'Cilt': 'Skin',
  'BÃ¶lgesel lenf nodu metastazÄ± yok': 'No regional lymph node metastasis',
  'Ä°psilateral peribronÅŸiyal / hiler lenf nodu tutulumu': 'Ipsilateral peribronchial / hilar lymph node involvement',
  'Ä°psilateral mediastinal / subkarinal lenf nodu tutulumu': 'Ipsilateral mediastinal / subcarinal lymph node involvement',
  'Kontralateral mediastinal/hiler veya supraklavikular lenf nodu': 'Contralateral mediastinal, hilar, or supraclavicular lymph node involvement',
  'Uzak metastaz yok': 'No distant metastasis',
  'Uzak metastaz var': 'Distant metastasis present',
  'Tek organ / oligometastaz': 'Single organ / oligometastatic disease',
  'Multipl organ metastazÄ±': 'Multiple organ / widespread metastases',
  'ENDÄ°KE: KÃœRATÄ°F': 'INDICATED: CURATIVE',
  'ENDÄ°KE: PALYATÄ°F': 'INDICATED: PALLIATIVE',
  'KONTRENDÄ°KE': 'CONTRAINDICATED',
  'PROTOKOLÃœ': 'PROTOCOL',
  'Periferik SBRT': 'Peripheral SBRT',
  'Santral SBRT': 'Central SBRT',
  'Ultrasantral': 'Ultracentral',
  'SBRT Periferik Standart': 'Standard Peripheral SBRT',
  'â‰¤1 cm primer kitle; ana bronÅŸ dallarÄ±na uzanÄ±m yok': 'â‰¤1 cm primary tumor; no main bronchus involvement',
  '>1 cm ama â‰¤2 cm Ã§ap; visseral plevra intakt': '>1 cm to â‰¤2 cm diameter; visceral pleura intact',
  '>2 cm ama â‰¤3 cm Ã§ap; periferik parankimde': '>2 cm to â‰¤3 cm diameter; in peripheral parenchyma',
  '>3 cm ama â‰¤4 cm veya ana bronÅŸ tutulumu (karina >2 cm)': '>3 cm to â‰¤4 cm or main bronchus involvement (>2 cm from carina)',
  '>4 cm ama â‰¤5 cm veya visseral plevra invazyonu': '>4 cm to â‰¤5 cm or visceral pleura invasion',
  '>5 cm ama â‰¤7 cm veya gÃ¶ÄŸÃ¼s duvarÄ± / frenik sinir tutulumu': '>5 cm to â‰¤7 cm or chest wall / phrenic nerve involvement',
  '>7 cm veya mediasten, kalp, bÃ¼yÃ¼k damarlar, trakea,...': '>7 cm or invasion of the mediastinum, heart, great vessels, or trachea',
  'HEDEF HACÄ°MLER (TARGET VOLUMES)': 'TARGET VOLUMES (ICRU 83)',
  'KRÄ°TÄ°K ORGAN (OAR) KISITLARI': 'ORGANS AT RISK (OAR) CONSTRAINTS',
  'KÃ¼Ã§Ã¼k HÃ¼creli DÄ±ÅŸÄ± AkciÄŸer Ca': 'Non-Small Cell Lung Cancer',
  'KÃ¼Ã§Ã¼k HÃ¼creli AkciÄŸer Ca': 'Small Cell Lung Cancer',
  'Medikal Ä°noperabl / Cerrahi Red': 'Medically Inoperable / Surgical Refusal',
  'Medikal Operabl': 'Medically Operable',
  'Postoperatif': 'Postoperative',
  'Preoperatif': 'Preoperative',
  'Uygulanmaz': 'Not applicable',
  'KÄ±lavuz TanÄ±mlÄ±': 'Guideline-defined',
  'KÄ±lavuz': 'Guideline',
  'Kriterleri': 'Criteria',
  'Kriteri': 'Criteria',
  'Primer TÃ¼mÃ¶r': 'Primary Tumor',
  'BÃ¶lgesel Lenf NodlarÄ±': 'Regional Lymph Nodes',
  'Uzak Metastaz': 'Distant Metastasis',
  'Anatomik Kapsam': 'Anatomic Coverage',
  'Doz Limiti': 'Dose Limit',
  'Marjin': 'Margin',
  'Hacim': 'Volume',
  'Doz': 'Dose',
  'Organ': 'Organ',
  'Metrik': 'Metric',
  'Benign hastalÄ±kta TNM evrelemesi uygulanmaz; klinik durum ve tedavi zamanlamasÄ±nÄ± seÃ§in.': 'TNM staging does not apply to benign disease; select clinical status and treatment timing.',
  'SeÃ§ili alt baÅŸlÄ±ÄŸa Ã¶zgÃ¼ kriterler; tÄ±klayarak anÄ±nda gÃ¼ncelleyin.': 'Subsite-specific criteria; click to update instantly.',
  'Klinik Durum, Evre ve Zamanlama Kriteri': 'Clinical Status and Timing Criteria',
  'TNM uygulanmaz': 'TNM not applicable',
  'Zamanlama kritik:': 'Timing is critical:',
  'HO profilaksisi preoperatif ilk 4 saatte veya postoperatif ilk 24-48 saatte planlanÄ±r; >72 saat sonra etkinlik beklenmez.': 'HO prophylaxis is planned within 4 hours preoperatively or 24-48 hours postoperatively; benefit is not expected after 72 hours.',
  'Keloid eksizyonu sonrasÄ± RT ilk 24 saat iÃ§inde baÅŸlatÄ±lmalÄ±dÄ±r.': 'Radiotherapy should begin within 24 hours after keloid excision.',
  'Jinekolojik Kanser BÃ¶lgesi': 'Gynecologic Cancer Site',
  'Sarkom / Kemik TÃ¼mÃ¶r Tipi': 'Sarcoma / Bone Tumor Type',
  'BaÅŸ-Boyun Anatomik BÃ¶lgesi': 'Head and Neck Subsite',
  'MSS Patolojisi': 'CNS Pathology',
  'Gastrointestinal tÃ¼mÃ¶r alt tipi': 'Gastrointestinal Tumor Subsite',
  'GÄ°S TÃ¼mÃ¶r Alt Tipi': 'GI Tumor Subsite',
  'GÃœS Alt Tipi': 'GU Subsite',
  'Meme Histopatolojisi': 'Breast Histopathology',
  'Cilt Patolojisi': 'Skin Histology',
  'Hematolojik TÃ¼mÃ¶r': 'Hematologic Tumor',
  'Pediatrik TÃ¼mÃ¶r': 'Pediatric Tumor',
  'Palyatif Onkoloji': 'Palliative Oncology',
  'AÄŸrÄ±lÄ± Kemik / Beyin / Spinal Kord BasÄ±sÄ±': 'Painful Bone / Brain / Spinal Cord Compression',
  'DÃ¼ÅŸÃ¼k Risk': 'Low Risk',
  'Orta Risk': 'Intermediate Risk',
  'YÃ¼ksek Risk': 'High Risk',
  'Radyoterapi AmacÄ±': 'Radiotherapy Intent',
  'Klinik Evre / Cerrahi': 'Clinical Stage / Surgery',
  'Radyoterapi ZamanlamasÄ±': 'Radiotherapy Timing',
  'Klinik Durum': 'Clinical Status',
  'Lokal Kontrol Modalitesi': 'Local Control Modality',
  'Seminom evresi': 'Seminoma Stage',
  'Menopoz durumu': 'Menopausal Status',
  'Cerrahi SÄ±nÄ±r': 'Surgical Margin',
  'Cerrahi': 'Surgery',
  'Maksimal TURBT tamamlandÄ±': 'Maximal TURBT completed',
  'Mesane koruyucu TMT iÃ§in klinik uygunluk': 'Clinical eligibility for bladder-preserving TMT',
  'YÃ¼ksek dereceli stromal aÅŸÄ±rÄ± bÃ¼yÃ¼me': 'High-grade stromal overgrowth',
  'TÃ¼mÃ¶r yataÄŸÄ± boostu (10-16 Gy) uygula': 'Apply tumor bed boost (10-16 Gy)',
  'AÄŸrÄ±': 'Pain',
  'Negatif': 'Negative',
  'Pozitif': 'Positive',
  'Rezeke edilemeyen': 'Unresectable',
  'fraksiyon': 'fraction',
  'fraksiyonda': 'fractions',
  'Evre': 'Stage',
  'yanÄ±t': 'response',
  'RezidÃ¼': 'Residual disease',
  'rezeksiyon': 'resection',
  'Cerrahi SonrasÄ±': 'Postoperative',
  'KRT': 'chemoradiotherapy',
  'RT': 'radiotherapy',
  'Ä°zlem': 'surveillance',
  'Gerekmez': 'Not required',
  'Gerekli': 'Required',
  'Uygula': 'Apply',
  'Uygun': 'Eligible',
  'Ä°noperabl': 'Inoperable',
  'Lokal Ä°leri': 'Locally Advanced',
  'Definitif': 'Definitive',
  'Adjuvan': 'Adjuvant',
  'Palyatif': 'Palliative',
  'Oligometastatik': 'Oligometastatic',
  'NÃ¼ks': 'Recurrence',
  'Kitle': 'Mass',
  'Agri': 'Pain',
  'Kanama': 'Bleeding',
  'DÃ¼ÅŸÃ¼k': 'Low',
  'Orta': 'Intermediate',
  'YÃ¼ksek': 'High',
  'Santral': 'Central',
  'Periferik': 'Peripheral',
  'Lateralize': 'Lateralized',
  'Bilaterally': 'Bilateral',
  'Bilateral': 'Bilateral',
  'Ä°psilateral': 'Ipsilateral',
  'Kontralateral': 'Contralateral',
  'Lenf nodu': 'lymph node',
  'lenf nodu': 'lymph node',
  'lenf nodlarÄ±': 'lymph nodes',
  'invazyonu': 'invasion',
  'metastazÄ±': 'metastasis',
  'yok': 'absent',
  'var': 'present',
  'Ã§ap': 'diameter',
  'ama': 'to',
  'veya': 'or',
  'sÄ±nÄ±r': 'margin',
  'kapsanÄ±r': 'included',
  'eklenir': 'is added',
  'Ã¶nerilir': 'is recommended',
  'Ã¶nerilmez': 'is not recommended',
  'deÄŸerlendirilir': 'is considered',
  'deÄŸerlendirme': 'assessment',
  'doz': 'dose',
  'hedef': 'target',
  'saat': 'hours',
  'hafta': 'weeks',
  'gÃ¼n': 'days',
  'Primer': 'Primary',
  'TÃ¼mÃ¶r': 'Tumor',
  'TÃ¼mÃ¶r yataÄŸÄ±': 'Tumor bed',
  'YumuÅŸak Doku': 'Soft Tissue',
  'Beyin': 'Brain',
  'AkciÄŸer': 'Lung',
  'Meme': 'Breast',
  'Boyun': 'Neck',
  'KasÄ±k': 'Groin',
  'Pelvik': 'Pelvic',
  'Pelvis': 'Pelvis',
  'BÃ¶lgesel': 'Regional',
  'Uzak': 'Distant',
  'hastalÄ±k': 'disease',
  'HastalÄ±k': 'Disease',
  'Klinik': 'Clinical',
  'klinik': 'clinical',
  'kÃ¼ratif': 'curative',
  'KÃ¼ratif': 'Curative',
  'standart': 'standard',
  'Standart': 'Standard',
  'yÃ¼ksek risk': 'high risk',
  'dÃ¼ÅŸÃ¼k risk': 'low risk',
  'negatif': 'negative',
  'pozitif': 'positive',
  'Kurumsal Hekim EriÅŸimi / Institutional Access': 'Institutional Physician Access',
  'RadOnc CDSS is restricted to licensed physicians and institutional medical personnel. YalnÄ±zca kurumsal hekim e-postalarÄ± geÃ§erlidir.': 'RadOnc CDSS is restricted to licensed physicians and institutional medical personnel. Only institutional physician email addresses are accepted.',
  'FarklÄ± Hesapla GiriÅŸ / Sign In with Another Account': 'Sign In with Another Account',
  'KÄ±lavuz TanÄ±mlÄ± Elektif Boyun Drenaj Rehberi (ESTRO / ASTRO KonsensÃ¼sÃ¼)': 'Guideline-Defined Elective Neck Irradiation (ESTRO / ASTRO Consensus)',
  'Bilateral Level II-Vb ve retrofaringeal lenf nodlarÄ± (RPN) kapsanÄ±r.': 'Bilateral levels II-Vb and retropharyngeal lymph nodes (RPNs) are included.',
  'Bilateral Level II-IV; orta hat komÅŸuluÄŸu ve bilateral drenaj riski dikkate alÄ±nÄ±r.': 'Bilateral levels II-IV; consider midline proximity and the risk of bilateral drainage.',
  'Elektif boyun Ä±ÅŸÄ±nlamasÄ± yapÄ±lmaz; yalnÄ±zca gerÃ§ek vokal kordlar hedeflenir.': 'Elective neck irradiation is not given; only the true vocal cords are targeted.',
  'Ä°psilateral Level I-III; DOI >5 mm ise Level IV eklenir.': 'Ipsilateral levels I-III; include level IV if DOI is >5 mm.',
  'Bilateral Level I-IV kapsanÄ±r.': 'Bilateral levels I-IV are included.',
  'Level V eklenmesi ve tutulu nod yataÄŸÄ±na 66-70 Gy SIB boost deÄŸerlendirilir.': 'Consider adding level V and a 66-70 Gy SIB boost to the involved nodal bed.',
  'Prostat adenokarsinomu': 'Prostate adenocarcinoma',
  'Mesane koruyucu trimodal tedavi (TMT)': 'Bladder-preserving trimodality therapy (TMT)',
  'Testis seminom evrelemesi': 'Testicular seminoma staging',
  'KHAK Klinik Evresi': 'SCLC Clinical Stage',
  'Fraksiyonasyon Rejimi': 'Fractionation Regimen',
  'Klinik Senaryo': 'Clinical Scenario',
  'Endometriyum Risk Grubu (PORTEC)': 'Endometrial Risk Group (PORTEC)',
  'Cerrahi durumu': 'Surgical Status',
  'Larinks klinik senaryosu': 'Laryngeal Clinical Scenario',
  'Orta hattÄ± geÃ§iyor': 'Crosses the midline',
  'Orta hatta uzaklÄ±k (cm)': 'Distance from midline (cm)',
  'TÃ¼mÃ¶r Ã§apÄ± (cm)': 'Tumor diameter (cm)',
  'Derin invazyon (DOI, mm)': 'Depth of invasion (DOI, mm)',
  'Ekstranodal yayÄ±lÄ±m (ENE)': 'Extranodal extension (ENE)',
  'Pozitif cerrahi sÄ±nÄ±r (R1)': 'Positive surgical margin (R1)',
  'Gleason Skoru': 'Gleason Score',
  'Pozitif biyopsi kor oranÄ± (%)': 'Percentage of Positive Biopsy Cores (%)',
  'EkstrakapsÃ¼ler yayÄ±lÄ±m (ECE)': 'Extracapsular extension (ECE)',
  'Seminal vezikÃ¼l invazyonu': 'Seminal vesicle invasion',
  'Otomatik NCCN risk grubu: ': 'Automated NCCN risk group: ',
  'En yakÄ±n cerrahi marjin (cm)': 'Closest surgical margin (cm)',
  'Histolojik Grade': 'Histologic Grade',
  'BiyobelirteÃ§ler sistemik tedavi kararÄ±nda onkoloji ekibiyle birlikte yorumlanÄ±r.': 'Interpret biomarkers in conjunction with the oncology team when making systemic therapy decisions.',
  'Orta Hat Åifti (Herniasyon)': 'Midline Shift (Herniation)',
  'Semptom durumu': 'Symptom Status',
  'Metastaz SayÄ±sÄ±': 'Number of Metastases',
  'Maks Ã‡ap (cm)': 'Maximum Diameter (cm)',
  'Cerrahi / rezeksiyon': 'Surgery / Resection',
  'Performans / tedavi uygunluÄŸu': 'Performance Status / Treatment Eligibility',
  'WHO derece': 'WHO Grade',
  'Rezeksiyon derecesi / cerrahi sÄ±nÄ±r': 'Extent of Resection / Surgical Margin',
  'Simpson derecesi': 'Simpson Grade',
  'Maksimum Ã§ap (cm)': 'Maximum Diameter (cm)',
  'Cerrahi marjin / rezektabilite': 'Surgical Margin / Resectability',
  'Ä°nvazyon derinliÄŸi (mm)': 'Depth of Invasion (mm)',
  'PerinÃ¶ral invazyon': 'Perineural Invasion',
  'Kemik tutulumu': 'Bone Involvement',
  'Palyatif fraksiyonasyon': 'Palliative Fractionation',
  'Sistemik tedaviye yanÄ±t': 'Response to Systemic Therapy',
  'Medulloblastom risk grubu': 'Medulloblastoma Risk Group',
  'Wilms evre / histoloji': 'Wilms Tumor Stage / Histology',
  'YaygÄ±n peritoneal yayÄ±lÄ±m / tÃ¼m batÄ±n RT endikasyonu': 'Diffuse Peritoneal Spread / Indication for Whole-Abdominal Radiotherapy',
  'Radyobiyolojik EÅŸdeÄŸerlik': 'Radiobiological Equivalence',
  'EÅŸlik Eden Sistemik Tedavi:': 'Concomitant Systemic Therapy:',
  'KanÄ±t ve KÄ±lavuz': 'Evidence and Guidelines',
  'Radyasyon Onkolojisi CDSS - KaynakÃ§a ve Yasal Bilgiler': 'Radiation Oncology CDSS - References and Legal Information',
  'Landmark Ã§alÄ±ÅŸmalar ve klinik baÅŸlÄ±klar': 'Landmark Trials and Clinical Topics',
  'PACIFIC (evre III KHDAK), Turrisi ve CONVERT (KHAK), Lung-ART (postoperatif toraks RT).': 'PACIFIC (stage III NSCLC), Turrisi and CONVERT (SCLC), and Lung-ART (postoperative thoracic radiotherapy).',
  'FAST-Forward (hipofraksiyone adjuvan RT).': 'FAST-Forward (hypofractionated adjuvant radiotherapy).',
  'RAPIDO ve PRODIGE-23 (rektum TNT), PORTEC-3 (endometriyum adjuvan kemoradyoterapi).': 'RAPIDO and PRODIGE-23 (rectal total neoadjuvant therapy), PORTEC-3 (adjuvant chemoradiotherapy for endometrial cancer).',
  'EMBRACE II (serviks KRT ve gÃ¶rÃ¼ntÃ¼ kÄ±lavuzlu brakiterapi).': 'EMBRACE II (cervical chemoradiotherapy and image-guided brachytherapy).',
  'Stupp protokolÃ¼ (glioblastom kemoradyoterapisi).': 'Stupp protocol (glioblastoma chemoradiotherapy).',
  'Normal doku doz sÄ±nÄ±rlarÄ±, kullanÄ±lan fraksiyonasyon, hedef hacim, eÅŸzamanlÄ± tedavi ve hastaya Ã¶zgÃ¼ klinik koÅŸullarla birlikte deÄŸerlendirilmelidir.': 'Normal tissue dose constraints should be evaluated in the context of fractionation, target volume, concurrent treatment, and patient-specific clinical factors.',
  'Konvansiyonel fraksiyonasyonda normal doku doz-hacim etkilerini Ã¶zetleyen, organ ve sonlanÄ±ma Ã¶zgÃ¼ derlemeler.': 'Organ- and endpoint-specific reviews summarizing normal-tissue dose-volume effects with conventional fractionation.',
  'Stereotaktik radyocerrahi ve vÃ¼cut RTâ€™si iÃ§in doz-hacim ve toksisite kanÄ±tlarÄ±nÄ± derleyen raporlar.': 'Reports synthesizing dose-volume and toxicity evidence for stereotactic radiosurgery and body radiotherapy.',
  'SABR hasta seÃ§imi, planlama ve organ riskindeki doz kÄ±sÄ±tlarÄ± iÃ§in teknik rehberler.': 'Technical guidance on SABR patient selection, planning, and organ-at-risk dose constraints.',
  'Serviks kanserinde gÃ¶rÃ¼ntÃ¼ kÄ±lavuzlu adaptif brakiterapi hedef ve organ riskindeki doz hedefleri/kÄ±sÄ±tlarÄ±.': 'Dose objectives and constraints for image-guided adaptive brachytherapy targets and organs at risk in cervical cancer.',
  'Bu merkez tek baÅŸÄ±na hasta planlamasÄ± iÃ§in doz reÃ§etesi deÄŸildir. OAR kÄ±sÄ±tlarÄ±, geÃ§erli protokolÃ¼n gÃ¼ncel birincil kaynaÄŸÄ±ndan ve kurum onaylÄ± planlama yÃ¶nergelerinden kontrol edilmelidir.': 'This reference is not a standalone dose prescription for patient planning. Verify OAR constraints against the current primary source for the applicable protocol and institution-approved planning guidance.',
  'Yasal sorumluluk reddi ve telif': 'Disclaimer and Copyright',
  'RadOnc CDSS, kanÄ±ta dayalÄ± radyasyon onkolojisi literatÃ¼rÃ¼nÃ¼ derleyen bir eÄŸitim ve klinik karar destek aracÄ±dÄ±r. Hekimin bireysel tÄ±bbi muhakemesinin ve multidisipliner tÃ¼mÃ¶r konseyi (MDT) kararlarÄ±nÄ±n yerine geÃ§emez. Planlama sÄ±nÄ±rlarÄ± her hasta iÃ§in doÄŸrulanmalÄ±dÄ±r. NCCNÂ®, ASTROÂ®, ESTROÂ®, RTOGÂ®, QUANTECÂ® ilgili kurumlarÄ±n tescilli markalarÄ± olup resmi sponsorluk baÄŸÄ± bulunmamaktadÄ±r.': 'RadOnc CDSS is an educational and clinical decision-support tool that synthesizes evidence-based radiation oncology literature. It does not replace a physicianâ€™s independent clinical judgment or multidisciplinary tumor board (MDT) decisions. Planning constraints must be verified for each patient. NCCNÂ®, ASTROÂ®, ESTROÂ®, RTOGÂ®, and QUANTECÂ® are registered trademarks of their respective organizations; no official sponsorship is implied.',
  'Toraks': 'Thorax',
  'GÄ°S': 'GI',
  'Jinekoloji': 'Gynecology',
  'MSS': 'CNS',
  'KÄ±lavuz Ä°lkeleri': 'Guideline Principles',
  'KaynakÃ§a': 'References',
  'Kurumsal Hekim PortalÄ±': 'Institutional Physician Portal',
  'GiriÅŸ yap': 'Sign in',
  'KayÄ±t ol': 'Sign up',
  'Onkolojik': 'Oncology',
  'KHAK': 'SCLC',
  'KHDAK': 'NSCLC',
  'evre': 'stage',
  'tutulu': 'involved',
  'geÃ§': 'late',
  'Erken': 'Early',
  'erken': 'early',
  'Ä°leri': 'Advanced',
  'ileri': 'advanced',
  'uygun': 'eligible',
  'Uygunsuz': 'Ineligible',
  'dahil': 'including',
  'dÄ±ÅŸÄ±nda': 'excluding',
  'sonrasÄ±': 'after',
  'Ã¶ncesi': 'before',
  'iÃ§in': 'for',
  'olgu': 'case',
  'olguda': 'in cases',
  'hastada': 'in patients',
  'uygulanÄ±r': 'is applied',
  'uygulanmaz': 'does not apply',
  'yapÄ±lÄ±r': 'is performed',
  'yapÄ±lmalÄ±dÄ±r': 'should be performed',
  'yapÄ±lmaz': 'is not performed',
  'planlanÄ±r': 'is planned',
  'belirlenmeli': 'should be determined',
  'beklenmez': 'is not expected',
  'yararÄ±': 'benefit',
  'sÄ±nÄ±rlÄ±': 'limited',
  'dakika': 'minutes',
  'risk grubu': 'risk group',
  'Risk Grubu': 'Risk Group',
  'ENDÄ°KE:': 'INDICATED:',
  'ENDÄ°KE': 'INDICATED',
  'KONTRENDÄ°KE:': 'CONTRAINDICATED:',
  'Ã–NERÄ°LMEZ:': 'NOT RECOMMENDED:',
  'RT DEÄERLENDÄ°R': 'CONSIDER RADIOTHERAPY',
  'DEÄERLENDÄ°R': 'CONSIDER',
  'DEÄERLENDÄ°RÄ°LÄ°R': 'IS CONSIDERED',
  'YOK': 'ABSENT',
  'VAR': 'PRESENT',
  'VE': 'AND',
  'VEYA': 'OR',
  'Ä°LE': 'WITH',
  'SONRASI': 'AFTER',
  'Ã–NCESÄ°': 'BEFORE',
  'Ä°Ã‡Ä°N': 'FOR',
  'CERRAHÄ°': 'SURGERY',
  'CERRAHÄ°SÄ°': 'SURGERY',
  'POSTOPERATÄ°F': 'POSTOPERATIVE',
  'PREOPERATÄ°F': 'PREOPERATIVE',
  'ADJUVAN': 'ADJUVANT',
  'NEOADJUVAN': 'NEOADJUVANT',
  'EÅZAMANLI': 'CONCURRENT',
  'KEMORADYOTERAPÄ°': 'CHEMORADIOTHERAPY',
  'KEMOTERAPÄ°': 'CHEMOTHERAPY',
  'DEFÄ°NÄ°TÄ°F': 'DEFINITIVE',
  'KÃœRATÄ°F': 'CURATIVE',
  'PALYATÄ°F': 'PALLIATIVE',
  'LOKAL': 'LOCAL',
  'Ä°LERÄ°': 'ADVANCED',
  'ERKEN': 'EARLY',
  'YÃœKSEK': 'HIGH',
  'DÃœÅÃœK': 'LOW',
  'RÄ°SK': 'RISK',
  'EVRE': 'STAGE',
  'KLINÄ°K': 'CLINICAL',
  'KLÄ°NÄ°K': 'CLINICAL',
  'DURUM': 'STATUS',
  'UYGUN': 'ELIGIBLE',
  'UYGUNSUZ': 'INELIGIBLE',
  'YARARI': 'BENEFIT',
  'SINIRLI': 'LIMITED',
  'BEKLENMEZ': 'IS NOT EXPECTED',
  'GEREKMEZ': 'NOT REQUIRED',
  'GEREKLÄ°': 'REQUIRED',
  'Ä°ZLEM': 'SURVEILLANCE',
  'SRS': 'SRS',
  'FRAKSÄ°YONASYON': 'FRACTIONATION',
  'DOZU': 'DOSE',
  'DOZ': 'DOSE',
  'MARJÄ°N': 'MARGIN',
  'CERRAHÄ° SONRASI': 'AFTER SURGERY',
  'LOKAL Ä°LERÄ°': 'LOCALLY ADVANCED',
  'LOKAL NÃœKS': 'LOCAL RECURRENCE',
  'NÃœKS': 'RECURRENCE',
  'REZEKE EDÄ°LEMEYEN': 'UNRESECTABLE',
  'Ä°NOPERABL': 'INOPERABLE',
  'AKTÄ°F': 'ACTIVE',
  'Ä°N-AKTÄ°F': 'INACTIVE',
  'FÄ°BROZÄ°S': 'FIBROSIS',
  'SÄ°STEMÄ°K': 'SYSTEMIC',
  'TEDAVÄ°': 'TREATMENT',
  'TEDAVÄ°YE': 'TREATMENT',
  'PROFÄ°LAKSÄ°SÄ°': 'PROPHYLAXIS',
  'ORBÄ°TOPATÄ°SÄ°NDE': 'ORBITOPATHY',
  'KONTRAKTÃœR': 'CONTRACTURE',
  'PERSISTAN': 'PERSISTENT',
  'SEMPTOM': 'SYMPTOM',
  'SEMPTOMDA': 'FOR SYMPTOMS',
  'REFRAKTER': 'REFRACTORY',
  'DEJENERATÄ°F': 'DEGENERATIVE',
  'ENFLAMATUAR': 'INFLAMMATORY',
  'DOZ RT': 'DOSE RADIOTHERAPY',
  'HÄ°POFRAKSÄ°YONE': 'HYPOFRACTIONATED',
  'BRAKÄ°TERAPÄ°SÄ°': 'BRACHYTHERAPY',
  'KEMORADYOTERAPÄ°SÄ°': 'CHEMORADIOTHERAPY',
  'GÃ–RÃœNTÃœ KILAVUZLU': 'IMAGE-GUIDED',
  'KONSEYDE': 'IN MULTIDISCIPLINARY REVIEW',
  'UZMAN KONSEYÄ°NDE': 'IN A SPECIALIST MULTIDISCIPLINARY REVIEW',
  'SAATTE': 'WITHIN HOURS',
  'HAFTA SONRA': 'WEEKS LATER',
  'STANDARTI': 'STANDARD',
  'STANDART': 'STANDARD',
  'GÃœNDE': 'PER DAY',
  'YATAÄI': 'BED',
  'LENF NODU': 'LYMPH NODE',
  'LENF NODLARI': 'LYMPH NODES',
  'METASTAZI': 'METASTASIS',
  'METASTAZ': 'METASTASIS',
  'KARACÄ°ÄER': 'LIVER',
  'AKCÄ°ÄER': 'LUNG',
  'BEYÄ°N': 'BRAIN',
  'KEMÄ°K': 'BONE',
  'MEME': 'BREAST',
  'SERVÄ°KS': 'CERVIX',
  'ENDOMETRÄ°YUM': 'ENDOMETRIUM',
  'VULVA': 'VULVA',
  'OVER': 'OVARY',
  'HASTALIKTA': 'IN DISEASE',
  'HASTALIÄI': 'DISEASE',
  'HASTALIK': 'DISEASE',
  'YAYILIM': 'SPREAD',
  'TUTULUMU': 'INVOLVEMENT',
  'Ä°NVASÄ°YONU': 'INVASION',
  'BASISI': 'COMPRESSION',
  'DÄ°RENÃ‡LÄ°': 'REFRACTORY',
  'MEDÄ°KAL': 'MEDICAL',
  'TÃœMÃ–RÃœNDE': 'TUMOR',
  'TÃœMÃ–RÃœ': 'TUMOR',
  'TÃœMÃ–R': 'TUMOR',
  'KÄ°TLE': 'MASS',
  'YÃœKSEK DOZ': 'HIGH-DOSE',
  'ULTRA YÃœKSEK DOZ': 'ULTRA-HIGH-DOSE',
  'ESKALASYON': 'ESCALATION',
  'BOOST': 'BOOST',
  'FAYDA BEKLENMEZ': 'NO BENEFIT IS EXPECTED',
  'UYGUN ZAMAN PENCERESÄ°NDE': 'WITHIN THE APPROPRIATE TREATMENT WINDOW',
  'ERKEN BAÅVURU': 'EARLY PRESENTATION',
  'GEÃ‡ BAÅVURU': 'LATE PRESENTATION',
  'TÃœM SOLUNUM HAREKET HACMÄ°': 'FULL RESPIRATORY MOTION VOLUME',
  'HETERO TOPÄ°K OSSÄ°FÄ°KASYON': 'HETEROTOPIC OSSIFICATION',
  'HETEROTOPÄ°K OSSÄ°FÄ°KASYON': 'HETEROTOPIC OSSIFICATION',
  'Menenjiyom (Grade 1 / 2 / 3)': 'Meningioma (Grade 1 / 2 / 3)',
  'Beyin MetastazÄ± (SRS vs WBRT)': 'Brain Metastases (SRS vs WBRT)',
  'Dermatofibrosarkoma Protuberans (DFSP)': 'Dermatofibrosarcoma Protuberans (DFSP)',
  'Rektum Karsinomu (TNT RAPIDO)': 'Rectal Carcinoma (TNT RAPIDO)',
  'Mide / Gastrik Adenokarsinom': 'Gastric Adenocarcinoma',
  'KaraciÄŸer (HCC / Kolanjio SBRT)': 'Liver (HCC / Cholangiocarcinoma SBRT)',
  'Ã–zofagus Karsinomu (CROSS)': 'Esophageal Carcinoma (CROSS)',
  'Pankreas Adenokarsinomu': 'Pancreatic Adenocarcinoma',
  'Anal Kanal SkuamÃ¶z Karsinom (Nigro)': 'Anal Canal Squamous Cell Carcinoma (Nigro)',
  'DÃ¼ÅŸÃ¼k Risk (Evre IA G1-2, LVSI yok - Ä°zlem)': 'Low Risk (Stage IA G1-2, no LVSI - Surveillance)',
  'Orta Risk (Evre IB G1-2 veya IA G3)': 'Intermediate Risk (Stage IB G1-2 or IA G3)',
  'YÃ¼ksek-Orta Risk (PORTEC-2: YalnÄ±zca VCB Brakiterapisi)': 'High-Intermediate Risk (PORTEC-2: Vaginal Cuff Brachytherapy Alone)',
  'YÃ¼ksek Risk (Evre III / SerÃ¶z / Derin Ä°nvazyon - PORTEC-3 KRT)': 'High Risk (Stage III / Serous / Deep Invasion - PORTEC-3 Chemoradiotherapy)',
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
  '>7 cm or mediasten, kalp, bÃ¼yÃ¼k damarlar, trakea, omur...': '>7 cm or mediastinum, heart, great vessels, trachea, and spine invasion',
  'Contralateral mediastinal/hiler or supraklavikular lymph...': 'Contralateral mediastinal, hilar, or supraclavicular lymph node involvement',
  'KarÅŸÄ± akciÄŸer nodÃ¼lÃ¼, plevral/perikardiyal efÃ¼zyon or...': 'Contralateral lung nodules, malignant pleural or pericardial effusion',
  'KarÅŸÄ± akciÄŸer nodÃ¼lÃ¼, plevral/perikardiyal efÃ¼zyon': 'Contralateral lung nodules, malignant pleural or pericardial effusion',
  'Tek bir ekstratorasik organda soliter metastaz...': 'Single extrathoracic metastasis in a single organ (Oligometastatic)',
  'Tek bir ekstratorasik organda soliter metastaz': 'Single extrathoracic metastasis in a single organ (Oligometastatic)',
  'Ã‡oklu organlarda yaygÄ±n metastazlar (Polimetastatik)': 'Multiple extrathoracic metastases in multiple organs (Polymetastatic)',
  'GÃ¶ÄŸÃ¼s DuvarÄ±': 'Chest Wall',
  'Kategori 1': 'Category 1',
  'Kategori 2A': 'Category 2A',
  'Klinik ReÃ§ete Raporunu Kopyala': 'Copy Clinical Prescription Report',
  'Rapor KopyalandÄ±!': 'Report Copied to Clipboard!',
  'KopyalandÄ±!': 'Copied!',
  '>7 cm veya mediasten, kalp, bÃ¼yÃ¼k damarlar, trakea, omurga invazyonu': '>7 cm or invasion of the mediastinum, heart, great vessels, trachea, or spine',
  'KarÅŸÄ± akciÄŸer nodÃ¼lÃ¼, plevral/perikardiyal efÃ¼zyon veya nodÃ¼l': 'Contralateral lung nodules, malignant pleural or pericardial effusion',
  'Tek bir ekstratorasik organda soliter metastaz (Oligometastatik)': 'Single extrathoracic metastasis in a single organ (Oligometastatic)',
  'ile limited': 'confined to',
  'or daha azÄ±': 'or less',
  'or daha fazlasÄ±': 'or more',
  'kapsÃ¼lÃ¼nÃ¼ aÅŸmÄ±ÅŸ': 'extends beyond capsule',
  'komÅŸu organ invasion': 'invasion of adjacent structures',
  'metastasis absent': 'no metastasis',
  'tutulumu': 'involvement',
  'tutulumu absent': 'no involvement',
  'GENELLÄ°KLE NOT REQUIRED': 'GENERALLY NOT REQUIRED',
  'Ã§oÄŸunlukla is not recommended': 'is generally not recommended',
  'riskte ADT': 'risk, ADT',
  'Prostat bezi ve seminal vezikÃ¼l proksimal 1 cm': 'Prostate gland and proximal 1 cm of seminal vesicles',
  'Asemptomatik durumda yakÄ±n nÃ¶rolojik ve gÃ¶rÃ¼ntÃ¼leme izlemi gerekir.': 'Close neurological and imaging surveillance is recommended for asymptomatic cases.',
  'Dozimetrik GÃ¼venlik ve Tolerans ZarfÄ±': 'Dosimetric Safety and Tolerance Envelope',
  // Evrensel Histoloji / Alt Tip SeÃ§ici isimleri
  'Asiner Adenokarsinom (Klasik)': 'Acinar Adenocarcinoma (Classic)',
  'Duktal Karsinom (Agresif)': 'Ductal Carcinoma (Aggressive)',
  'NÃ¶roendokrin / KÃ¼Ã§Ã¼k HÃ¼creli (NEPC)': 'Neuroendocrine / Small Cell (NEPC)',
  'Seminom (RadyoduyarlÄ± - Paraaortik RT Endike)': 'Seminoma (Radiosensitive - Para-aortic RT Indicated)',
  'Non-Seminom (RT Genellikle Endike DeÄŸil)': 'Non-Seminoma (RT Generally Not Indicated)',
  'Ãœrotelyal Karsinom (TCC - Trimodalite KRT)': 'Urothelial Carcinoma (TCC - Trimodal CRT)',
  'SkuamÃ¶z / Adenokarsinom': 'Squamous / Adenocarcinoma',
  'Adenokarsinom': 'Adenocarcinoma',
  'SkuamÃ¶z HÃ¼creli Karsinom': 'Squamous Cell Carcinoma',
  'BÃ¼yÃ¼k HÃ¼creli NÃ¶roendokrin (LCNEC)': 'Large Cell Neuroendocrine (LCNEC)',
  'Timoma (WHO Tip A, AB, B1, B2, B3)': 'Thymoma (WHO Type A, AB, B1, B2, B3)',
  'Timik Karsinom (Tip C / Agresif)': 'Thymic Carcinoma (Type C / Aggressive)',
  'Ä°nvaziv Duktal Karsinom (NST)': 'Invasive Ductal Carcinoma (IDC/NST)',
  'Triple Negatif (TNBC)': 'Triple Negative (TNBC)',
  'Astrositom (IDH-mutant, Grade 2-4)': 'Astrocytoma (IDH-mutant, Grade 2-4)',
  'Oligodendrogliom (1p/19q ko-delesyonlu, Grade 2-3)': 'Oligodendroglioma (1p/19q co-deleted, Grade 2-3)',
  'Pleomorfik Sarkom (UPS)': 'Undifferentiated Pleomorphic Sarcoma (UPS)',
  'Liposarkom': 'Liposarcoma',
  'Leyomiyosarkom': 'Leiomyosarcoma',
  'Sinovyal Sarkom': 'Synovial Sarcoma',
  'SkuamÃ¶z HÃ¼creli (cSCC)': 'Cutaneous Squamous Cell (cSCC)',
  'Bazal HÃ¼creli (BCC)': 'Basal Cell (BCC)',
  'KutanÃ¶z Melanom': 'Cutaneous Melanoma',
  'Merkel HÃ¼creli (MCC)': 'Merkel Cell (MCC)',
  'FolikÃ¼ler Lenfoma': 'Follicular Lymphoma',
  'Multipl Miyelom / Plazmositom': 'Multiple Myeloma / Plasmacytoma',
  // Meme TNM kriterleri ve dinamik klinik veri Ã§evirileri
  'TÃ¼mÃ¶r >0.1 cm ama â‰¤0.5 cm (1-5 mm)': 'Tumor >0.1 cm but â‰¤0.5 cm (1-5 mm)',
  'TÃ¼mÃ¶r >0.5 cm ama â‰¤1.0 cm (5-10 mm)': 'Tumor >0.5 cm but â‰¤1.0 cm (5-10 mm)',
  'TÃ¼mÃ¶r >1.0 cm ama â‰¤2.0 cm (10-20 mm)': 'Tumor >1.0 cm but â‰¤2.0 cm (10-20 mm)',
  '>2 cm ama â‰¤5 cm invaziv kitle': '>2 cm but â‰¤5 cm invasive mass',
  'GÃ¶ÄŸÃ¼s duvarÄ± fiksasyonu, cilt Ã¼lserasyonu veya enflamatuar karsinom': 'Chest wall fixation, skin ulceration, or inflammatory carcinoma',
  'Aksiller lenf nodu metastazÄ± yok': 'No axillary lymph node metastasis',
  '1-3 ipsilateral hareketli Level I-II aksiller lenf nodu': '1-3 ipsilateral mobile Level I-II axillary lymph nodes',
  '4-9 aksiller lenf nodu veya fikse konglomere kitle': '4-9 axillary lymph nodes or matted/fixed mass',
  'â‰¥10 aksiller nod veya supraklavikuler / internal mammar lenf nodu': 'â‰¥10 axillary nodes or supraclavicular / internal mammary nodes',
  'Kemik, akciÄŸer, karaciÄŸer veya beyin uzak metastazÄ±': 'Distant metastasis to bone, lung, liver, or brain',
  'GÃ¶ÄŸÃ¼s duvarÄ± invazyonu (kaburgalar, interkostal kaslar; pektoral kas hariÃ§)': 'Chest wall invasion (ribs, intercostal muscles; excluding pectoralis)',
  'invaziv kitle': 'invasive mass',
  // ReÃ§ete aÃ§Ä±klama ve teknik fragmanlarÄ±
  'TÃ¼m Meme (WBRT)': 'Whole Breast (WBRT)',
  'DIBH Sol Kalp KorumasÄ±': 'Deep Inspiration Breath Hold (Left Heart Sparing)',
  'TÃ¼m meme Ä±ÅŸÄ±nlamasÄ±': 'Whole breast irradiation',
  'Nodal pozitiflikte bÃ¶lgesel nodal Ä±ÅŸÄ±nlama (RNI) ayrÄ±ca deÄŸerlendirilir.': 'Regional nodal irradiation (RNI) is additionally considered in node-positive disease.',
  'nodal risk durumuna gÃ¶re RNI eklenmez.': 'RNI is omitted based on nodal risk.',
  'Menopoz: ': 'Menopause: ',
  'eÅŸdeÄŸer standart seÃ§enektir.': 'is an equivalent standard option.',
  'TÃ¼mÃ¶r Ã§apÄ± >1 cm (T1c); ': 'Tumor size >1 cm (T1c); ',
  'Genomik risk skoruna gÃ¶re adjuvan KT / anti-HER2 endikasyonu tartÄ±ÅŸÄ±lsÄ±n.': 'Discuss adjuvant CT / anti-HER2 indication per genomic risk score.',
  'TÃ¼mÃ¶r yataÄŸÄ± boost (10-16 Gy) endikasyonu klinik risk ve yaÅŸ ile tartÄ±ÅŸÄ±lsÄ±n.': 'Tumor bed boost (10-16 Gy) indication to be discussed per clinical risk and age.',
  'Premenopozal': 'Premenopausal',
  'Postmenopozal': 'Postmenopausal',
  // Hedef hacim marjin ve anatomik kapsam
  'Kavite + cerrahi klips': 'Surgical cavity + clips',
  'TÃ¼m meme; nodal alanlar rutin olarak dahil edilmez': 'Whole breast; nodal regions not routinely included',
  'Uygun hastada 10-16 Gy ek boost': '10-16 Gy sequential/SIB boost in eligible patients',
  'Uygun risk Ã¶zelliklerinde 10-16 Gy ek boost': '10-16 Gy sequential/SIB boost in eligible patients',
  'Nodal durum ve klinik risk doÄŸrultusunda bÃ¶lgesel nodlar': 'Regional nodes per nodal status and clinical risk',
  'Risk uyarlanmÄ±ÅŸ': 'Risk-adapted',
  'Mastektomi skarÄ± ve pektorali kasÄ± yÃ¼zeyi': 'Mastectomy scar and pectoralis surface',
  // --- TNM KRÄ°TERLERÄ° (TAM KAPSAM) ---
  'Lokalize primer kitle (â‰¤5 cm, plevral yayÄ±lÄ±m yok)': 'Localized primary mass (â‰¤5 cm, no pleural spread)',
  'GeniÅŸ mediastinal, trakeal, karinal veya toraks duvarÄ± invazyonu': 'Extensive mediastinal, tracheal, carinal, or chest wall invasion',
  'Nodal tutulum yok veya hiler tutulum ile sÄ±nÄ±rlÄ±': 'No nodal involvement or confined to hilar nodes',
  'Mediastinal, subkarinal veya supraklavikular lenf nodu pozitifliÄŸi': 'Mediastinal, subcarinal, or supraclavicular lymph node positivity',
  'Tek bir tolere edilebilir radyasyon alanÄ± iÃ§ine dahil edilebilen hastalÄ±k (M0)': 'Disease encompassable in a single tolerable radiation field (M0)',
  'KarÅŸÄ± akciÄŸer, plevral efÃ¼zyon veya uzak organ metastazÄ± (M1)': 'Contralateral lung, pleural effusion, or distant organ metastasis (M1)',
  'KapsÃ¼l intakt; makroskopik ve mikroskopik invazyon yok': 'Capsule intact; no macroscopic or microscopic invasion',
  'Mikroskopik transkapsÃ¼ler veya Ã§evre mediastinal yaÄŸ invazyonu': 'Microscopic transcapsular or perimediastinal fat invasion',
  'KomÅŸu organ invazyonu (perikard, bÃ¼yÃ¼k damar, akciÄŸer)': 'Adjacent organ invasion (pericardium, great vessels, lung)',
  'Plevral/perikardiyal tohumlanma (IVA) veya uzak metastaz (IVB)': 'Pleural/pericardial seeding (IVA) or distant metastasis (IVB)',
  'Lenf nodu tutulumu yok': 'No lymph node involvement',
  'Anterior mediastinal lenf nodu tutulumu': 'Anterior mediastinal lymph node involvement',
  'Derin intratorasik veya supraklavikular lenf nodu': 'Deep intrathoracic or supraclavicular lymph nodes',
  'Uzak organ metastazÄ±': 'Distant organ metastasis',
  'Ä°psilateral pariyetal plevra ile sÄ±nÄ±rlÄ±': 'Confined to ipsilateral parietal pleura',
  'Visseral plevra, diyafram kasÄ± veya akciÄŸer parankimi tutulumu': 'Visceral pleura, diaphragmatic muscle, or lung parenchyma involvement',
  'Endotorasik fasya veya mediastinal yaÄŸ dokusu invazyonu': 'Endothoracic fascia or mediastinal fat invasion',
  'GÃ¶ÄŸÃ¼s duvarÄ±, perikard, karÅŸÄ± plevra veya omurga invazyonu': 'Chest wall, pericardium, contralateral pleura, or spine invasion',
  'BÃ¶lgesel lenf nodu tutulumu yok': 'No regional lymph node involvement',
  'Ä°psilateral bronkopulmoner, hiler veya mediastinal lenf nodu': 'Ipsilateral bronchopulmonary, hilar, or mediastinal lymph nodes',
  'Kontralateral mediastinal veya supraklavikular lenf nodu': 'Contralateral mediastinal or supraclavicular lymph nodes',
  'Uzak metastaz mevcut': 'Distant metastasis present',
  'Servikse sÄ±nÄ±rlÄ±, invazyon derinliÄŸi â‰¥5 mm, kitle Ã§apÄ± <4 cm': 'Confined to cervix, invasion depth â‰¥5 mm, mass diameter <4 cm',
  'Servikse sÄ±nÄ±rlÄ± kitle, en bÃ¼yÃ¼k Ã§ap â‰¥4 cm (Lokal ileri)': 'Mass confined to cervix, largest diameter â‰¥4 cm (locally advanced)',
  'Ãœst 2/3 vajen tutulumu (IIA) veya parametriyal invazyon (IIB)': 'Upper 2/3 vaginal involvement (IIA) or parametrial invasion (IIB)',
  'Alt 1/3 vajen tutulumu (IIIA) veya pelvik yan duvar / hidronefroz (IIIB)': 'Lower 1/3 vaginal involvement (IIIA) or pelvic sidewall / hydronephrosis (IIIB)',
  'Mesane veya rektum mukozasÄ± doÄŸrudan invazyonu': 'Direct invasion of bladder or rectal mucosa',
  'Pelvik lenf nodu metastazÄ± pozitif': 'Pelvic lymph node metastasis positive',
  'Paraaortik lenf nodu metastazÄ± pozitif': 'Para-aortic lymph node metastasis positive',
  'Uzak organ metastazÄ± (akciÄŸer, karaciÄŸer, kemik vb.)': 'Distant organ metastasis (lung, liver, bone, etc.)',
  'Uterus korpusuna sÄ±nÄ±rlÄ±, myometrium invazyonu <%50': 'Confined to uterine corpus, myometrial invasion <50%',
  'Myometrium invazyonu â‰¥%50 (Derin myometriyal invazyon)': 'Myometrial invasion â‰¥50% (deep myometrial invasion)',
  'Servikal stromal invazyon mevcut (ancak korpus dÄ±ÅŸÄ±na Ã§Ä±kmamÄ±ÅŸ)': 'Cervical stromal invasion present (without extension beyond corpus)',
  'Uterus seroza/adneks tutulumu (IIIA) veya vajen/parametrium invazyonu (IIIB)': 'Uterine serosal/adnexal involvement (IIIA) or vaginal/parametrial invasion (IIIB)',
  'Mesane veya barsak mukozasÄ± invazyonu': 'Bladder or bowel mucosa invasion',
  'Pelvik lenf nodu pozitifliÄŸi': 'Pelvic lymph node positivity',
  'Paraaortik lenf nodu pozitifliÄŸi': 'Para-aortic lymph node positivity',
  'Uzak organ veya intraabdominal peritoneal yayÄ±lÄ±m': 'Distant organ or intra-abdominal peritoneal spread',
  'Over veya tuba uterina ile sÄ±nÄ±rlÄ± tÃ¼mÃ¶r': 'Tumor confined to ovary or fallopian tube',
  'Pelvik organlara (uterus, mesane, sigmoid) yayÄ±lÄ±m': 'Extension to pelvic organs (uterus, bladder, sigmoid)',
  'Pelvis dÄ±ÅŸÄ± mikroskopik/makroskopik peritoneal yayÄ±lÄ±m': 'Microscopic/macroscopic peritoneal spread beyond pelvis',
  'Retroperitoneal (pelvik/paraaortik) lenf nodu metastazÄ±': 'Retroperitoneal (pelvic/para-aortic) lymph node metastasis',
  'Uzak organ metastazÄ± yok': 'No distant organ metastasis',
  'Plevral efÃ¼zyon sitolojisi pozitif (IVA) veya karaciÄŸer/dalak parankim metastazÄ± (IVB)': 'Positive pleural effusion cytology (IVA) or liver/spleen parenchymal metastasis (IVB)',
  'Vajen duvarÄ± ile sÄ±nÄ±rlÄ± karsinom': 'Carcinoma confined to vaginal wall',
  'Subvajinal doku / paraservikal alana invazyon (pelvis duvarÄ±na ulaÅŸmamÄ±ÅŸ)': 'Invasion into subvaginal tissue / paracervical area (not reaching pelvic wall)',
  'Pelvis yan duvarÄ±na uzanÄ±m': 'Extension to pelvic sidewall',
  'Mesane veya rektum mukozasÄ± invazyonu veya gerÃ§ek pelvis dÄ±ÅŸÄ±na Ã§Ä±kÄ±ÅŸ': 'Bladder or rectal mucosa invasion or extension beyond true pelvis',
  'Pelvik veya inguinal lenf nodu metastazÄ±': 'Pelvic or inguinal lymph node metastasis',
  'Vulva veya perinede sÄ±nÄ±rlÄ±, â‰¤2 cm lezyon': 'Confined to vulva or perineum, â‰¤2 cm lesion',
  '>2 cm kitle veya alt Ã¼retra/alt vajen/anÃ¼s komÅŸuluÄŸu': '>2 cm mass or adjacent to lower urethra/lower vagina/anus',
  'Ãœst Ã¼retra, mesane, rektum mukozasÄ± veya pelvik kemik fiksasyonu': 'Upper urethra, bladder, rectal mucosa, or pelvic bone fixation',
  'Ä°nguinofemoral lenf nodu negatif': 'Inguinofemoral lymph nodes negative',
  '1-2 lenf nodu metastazÄ± (<5 mm)': '1-2 lymph node metastases (<5 mm)',
  'â‰¥3 lenf nodu metastazÄ± veya kapsÃ¼l dÄ±ÅŸÄ± yayÄ±lÄ±m (ENE/ECE)': 'â‰¥3 lymph node metastases or extracapsular extension (ENE/ECE)',
  'Pelvik lenf nodlarÄ± veya uzak organ metastazlarÄ±': 'Pelvic lymph nodes or distant organ metastases',
  'â‰¤5 cm en bÃ¼yÃ¼k Ã§apta yÃ¼zeyel veya derin yerleÅŸimli sarkom': 'Superficial or deep sarcoma â‰¤5 cm in greatest dimension',
  '>5 cm ama â‰¤10 cm Ã§ap; fasyayÄ± aÅŸmamÄ±ÅŸ veya derin': '>5 cm but â‰¤10 cm; not crossing fascia or deep-seated',
  '>10 cm ama â‰¤15 cm Ã§ap': '>10 cm but â‰¤15 cm diameter',
  '>15 cm bÃ¼yÃ¼k dev sarkomatÃ¶z kitle': '>15 cm large giant sarcomatous mass',
  'BÃ¶lgesel lenf nodu tutulumu yok (Ã§oÄŸu YDS)': 'No regional lymph node involvement (most STS)',
  'BÃ¶lgesel lenf nodu metastazÄ± (Evre IV kabul edilir)': 'Regional lymph node metastasis (considered Stage IV)',
  'AkciÄŸer veya diÄŸer uzak organ metastazlarÄ±': 'Lung or other distant organ metastases',
  'â‰¤8 cm primer kemik iÃ§inde sÄ±nÄ±rlÄ± kitle': 'â‰¤8 cm mass confined within primary bone',
  '>8 cm korteksi aÅŸan primer kemik kitlesi': '>8 cm primary bone mass crossing cortex',
  'AynÄ± kemik segmentinde diskontinÃ¼ skip lezyonlar': 'Discontinuous skip lesions in the same bone segment',
  'BÃ¶lgesel lenf nodu tutulumu': 'Regional lymph node involvement',
  'YalnÄ±zca akciÄŸer metastazÄ±': 'Lung-only metastasis',
  'DiÄŸer kemik veya visseral organ metastazlarÄ±': 'Other bone or visceral organ metastases',
  'â‰¤8 cm veya lokalize primer kemik tutulumu': 'â‰¤8 cm or localized primary bone involvement',
  '>8 cm veya geniÅŸ ekstraosseÃ¶z yumuÅŸak doku kompanenti': '>8 cm or large extraosseous soft tissue component',
  'BÃ¶lgesel lenf nodu pozitif': 'Regional lymph node positive',
  'Lokalize hastalÄ±k (metastaz yok)': 'Localized disease (no metastasis)',
  'Kemik iliÄŸi, diÄŸer kemikler veya uzak organ metastazÄ±': 'Bone marrow, other bones, or distant organ metastasis',
  'â‰¤8 cm kortikal veya intramedÃ¼ller lezyon': 'â‰¤8 cm cortical or intramedullary lesion',
  '>8 cm geniÅŸ periostal / ekstraosseÃ¶z kitle': '>8 cm large periosteal / extraosseous mass',
  'AkciÄŸer veya uzak metastaz': 'Lung or distant metastasis',
  'â‰¤5 cm sakrum, vertebra veya klivus yerleÅŸimli': 'â‰¤5 cm, located in sacrum, vertebra, or clivus',
  '>5 cm komÅŸu nÃ¶ral / vaskÃ¼ler veya dural invazyon': '>5 cm with adjacent neural / vascular or dural invasion',
  'Uzak metastaz': 'Distant metastasis',
  'Ä°ntraosseÃ¶z sÄ±nÄ±rlarÄ± belirgin, inaktif lezyon': 'Intraosseous well-demarcated, inactive lesion',
  'Korteks geniÅŸlemiÅŸ ama intakt lezyon': 'Expanded but intact cortex lesion',
  'Kortikal perforasyon ve yumuÅŸak doku yayÄ±lÄ±mÄ±': 'Cortical perforation and soft tissue extension',
  'Lenf nodu pozitif': 'Lymph node positive',
  'Metastaz yok': 'No metastasis',
  'AkciÄŸer benign/malign metastatik implantlarÄ±': 'Benign/malign metastatic lung implants',
  'Nazofarenks veya orofarenks / burun boÅŸluÄŸu ile sÄ±nÄ±rlÄ±': 'Confined to nasopharynx or oropharynx / nasal cavity',
  'KafatasÄ± tabanÄ±, servikal vertebra, pterigoid kemik invazyonu': 'Skull base, cervical vertebra, pterygoid bone invasion',
  'Ä°ntrakraniyal uzanÄ±m, kraniyal sinir tutulumu, hipofarenks, orbita': 'Intracranial extension, cranial nerve involvement, hypopharynx, orbit',
  'Unilateral servikal (â‰¤6 cm) veya bilateral retrofaringeal lenf nodu': 'Unilateral cervical (â‰¤6 cm) or bilateral retropharyngeal lymph nodes',
  'Bilateral servikal lenf nodu (â‰¤6 cm, klavikula Ã¼stÃ¼)': 'Bilateral cervical lymph nodes (â‰¤6 cm, above clavicle)',
  '>6 cm lenf nodu veya supraklavikuler fossa tutulumu': '>6 cm lymph node or supraclavicular fossa involvement',
  'â‰¤2 cm primer tÃ¼mÃ¶r': 'â‰¤2 cm primary tumor',
  '>4 cm veya epiglot lingual yÃ¼zeyi tutulumu': '>4 cm or lingual surface of epiglottis involvement',
  'Larinks, dil kasÄ±, medial pterigoid veya mandibula invazyonu': 'Larynx, tongue muscle, medial pterygoid, or mandible invasion',
  'BÃ¶lgesel lenf nodu yok': 'No regional lymph nodes',
  'Ä°psilateral tek lenf nodu â‰¤3 cm': 'Single ipsilateral lymph node â‰¤3 cm',
  'Bilateral veya kontralateral â‰¤6 cm lenf nodu': 'Bilateral or contralateral lymph nodes â‰¤6 cm',
  '>6 cm lenf nodu veya ENE pozitifliÄŸi': '>6 cm lymph node or ENE positivity',
  'Tek veya her iki vokal kordla sÄ±nÄ±rlÄ±, kord mobilitesi normal': 'Confined to one or both vocal cords, normal cord mobility',
  'Supraglottik/subglottik uzanÄ±m ve/veya azalmÄ±ÅŸ vokal kord mobilitesi': 'Supraglottic/subglottic extension and/or impaired vocal cord mobility',
  'Vokal kord fiksasyonu ve/veya paraglottik alan invazyonu': 'Vocal cord fixation and/or paraglottic space invasion',
  'Tiroid kÄ±kÄ±rdak penetrasyonu, trakea veya derin boyun kasÄ± invazyonu': 'Thyroid cartilage penetration, trachea, or deep neck muscle invasion',
  'Ä°psilateral Ã§oklu veya bilateral lenf nodlarÄ± â‰¤6 cm': 'Multiple ipsilateral or bilateral lymph nodes â‰¤6 cm',
  '>6 cm lenf nodu': '>6 cm lymph node',
  'Oligometastatik intrakraniyal lezyonlar (Ã§ap â‰¤3-4 cm)': 'Oligometastatic intracranial lesions (diameter â‰¤3-4 cm)',
  'Ã‡oklu intrakraniyal metastazlar veya yaygÄ±n Ã¶dem/kitle etkisi': 'Multiple intracranial metastases or extensive edema/mass effect',
  'Primer tÃ¼mÃ¶r bÃ¶lgesel lenf nodu negatif': 'Primary tumor regional lymph node negative',
  'Primer tÃ¼mÃ¶r bÃ¶lgesel lenf nodu pozitif': 'Primary tumor regional lymph node positive',
  'Parankimal intrakraniyal beyin metastazÄ±': 'Parenchymal intracranial brain metastasis',
  'Maksimal gÃ¼venli cerrahiye uygun lober kitle': 'Lobar mass suitable for maximal safe resection',
  'Bazal ganglion, talamus veya korpus kallozum invazyonu': 'Basal ganglia, thalamus, or corpus callosum invasion',
  'Beyin parankiminde birden fazla birbirinden baÄŸÄ±msÄ±z odak': 'Multiple independent foci in brain parenchyma',
  'MSS primer tÃ¼mÃ¶rlerinde lenf nodu deÄŸerlendirmesi yapÄ±lmaz': 'Lymph node assessment not applicable for CNS primary tumors',
  'Leptomeningeal veya spinal tohumlanma yok': 'No leptomeningeal or spinal seeding',
  'BOS sitolojisi pozitif veya spinal tohumlanma mevcut': 'Positive CSF cytology or spinal seeding present',
  'Benign histoloji (Mitoz <4/10 BBA, beyin invazyonu yok)': 'Benign histology (mitoses <4/10 HPF, no brain invasion)',
  'Atipik histoloji (Mitoz 4-19/10 BBA veya beyin invazyonu)': 'Atypical histology (mitoses 4-19/10 HPF or brain invasion)',
  'Lenfatik drenaj deÄŸerlendirilmez': 'Lymphatic drainage not assessed',
  'Ä°ntrakraniyal sÄ±nÄ±rlÄ± lezyon': 'Intracranially confined lesion',
  'Ekstrakraniyal uzak metastaz': 'Extracranial distant metastasis',
  'Submukoza invazyonu (Muskularis propria intakt)': 'Submucosal invasion (muscularis propria intact)',
  'Muskularis propria invazyonu': 'Muscularis propria invasion',
  'Subseroza veya perirektal yaÄŸ dokusu invazyonu (Mezorektum)': 'Subserosa or perirectal fat invasion (mesorectum)',
  'KomÅŸu organ invazyonu (prostat, mesane, vajen, sakrum vb.)': 'Adjacent organ invasion (prostate, bladder, vagina, sacrum, etc.)',
  'BÃ¶lgesel mezorektal lenf nodu metastazÄ± yok': 'No regional mesorectal lymph node metastasis',
  '1-3 bÃ¶lgesel mezorektal lenf nodu pozitif': '1-3 regional mesorectal lymph nodes positive',
  'â‰¥4 bÃ¶lgesel mezorektal lenf nodu pozitif': 'â‰¥4 regional mesorectal lymph nodes positive',
  'Tek bir uzak organda soliter metastaz (Ã¶rn. izole karaciÄŸer)': 'Solitary metastasis in a single distant organ (e.g., isolated liver)',
  'Birden fazla organda metastaz': 'Metastases in multiple organs',
  'Lamina propria veya submukozaya invazyon': 'Invasion into lamina propria or submucosa',
  'Subseroza baÄŸ dokusu invazyonu': 'Subserosal connective tissue invasion',
  'KomÅŸu organ invazyonu (kolon, karaciÄŸer, diyafram, pankreas)': 'Adjacent organ invasion (colon, liver, diaphragm, pancreas)',
  '1-2 bÃ¶lgesel lenf nodu pozitif': '1-2 regional lymph nodes positive',
  '3-6 bÃ¶lgesel lenf nodu pozitif': '3-6 regional lymph nodes positive',
  'â‰¥7 bÃ¶lgesel lenf nodu pozitif': 'â‰¥7 regional lymph nodes positive',
  'Uzak organ veya peritoneal karsinomatozis': 'Distant organ metastasis or peritoneal carcinomatosis',
  'Palpabl tÃ¼mÃ¶r; bir lobun yarÄ±sÄ± veya daha azÄ± ile sÄ±nÄ±rlÄ±': 'Palpable tumor; confined to half of one lobe or less',
  'EkstrakapsÃ¼ler yayÄ±lÄ±m (ECE) - Prostat kapsÃ¼lÃ¼nÃ¼ aÅŸmÄ±ÅŸ': 'Extracapsular extension (ECE) - beyond prostatic capsule',
  'Seminal vezikÃ¼l invazyonu (SVI)': 'Seminal vesicle invasion (SVI)',
  'Rektum, levator kaslarÄ± veya pelvik taban komÅŸu organ invazyonu': 'Rectum, levator muscles, or pelvic floor adjacent organ invasion',
  'BÃ¶lgesel pelvik lenf nodu metastazÄ± yok': 'No regional pelvic lymph node metastasis',
  'Pelvik lenf nodu metastazÄ± (obturator, iliak nodlar)': 'Pelvic lymph node metastasis (obturator, iliac nodes)',
  'BÃ¶lge dÄ±ÅŸÄ± uzak lenf nodu metastazlarÄ±': 'Distant lymph node metastases beyond region',
  'Kemik metastazÄ± (aksiyel/apandikÃ¼ler iskelet)': 'Bone metastasis (axial/appendicular skeleton)',
  'â‰¤2 cm Ã§ap; yÃ¼ksek risk Ã¶zelliÄŸi yok': 'â‰¤2 cm diameter; no high-risk features',
  '>4 cm veya derin invazyon (>6 mm) veya kemik korteks erozyonu': '>4 cm or deep invasion (>6 mm) or bone cortex erosion',
  'Aksiyel kemik veya kafatasÄ± tabanÄ± derin invazyonu': 'Deep invasion of axial bone or skull base',
  '1 lenf nodu metastazÄ± (â‰¤3 cm)': '1 lymph node metastasis (â‰¤3 cm)',
  'Ã‡oklu lenf nodu veya >3 cm kitle': 'Multiple lymph nodes or >3 cm mass',
  'Uzak visseral organ metastazlarÄ±': 'Distant visceral organ metastases',
  'Tek bir lenf nodu bÃ¶lgesi veya tek bir ekstralenfatik organ tutulumu': 'Single lymph node region or single extralymphatic organ involvement',
  'DiyaframÄ±n aynÄ± tarafÄ±nda iki veya daha fazla lenf nodu bÃ¶lgesi': 'Two or more lymph node regions on the same side of the diaphragm',
  'DiyaframÄ±n her iki tarafÄ±nda lenf nodu tutulumu': 'Lymph node involvement on both sides of the diaphragm',
  'YaygÄ±n kemik iliÄŸi, karaciÄŸer veya ekstralenfatik organ yayÄ±lÄ±mÄ±': 'Widespread bone marrow, liver, or extralymphatic organ involvement',
  'Mediastinal veya periferik kitle Ã§apÄ± <7-10 cm': 'Mediastinal or peripheral mass diameter <7-10 cm',
  'â‰¥7-10 cm bÃ¼yÃ¼k kitle veya transtorasik Ã§apÄ±n >1/3\'Ã¼': 'â‰¥7-10 cm bulky mass or >1/3 of transthoracic diameter',
  'B semptomu yok (AteÅŸ, gece terlemesi, kilo kaybÄ± yok)': 'No B symptoms (no fever, night sweats, weight loss)',
  'B semptomlarÄ± mevcut': 'B symptoms present',
  'RezidÃ¼ kitle <1.5 cm2, nÃ¶rolojik defisit ve yayÄ±lÄ±m sÄ±nÄ±rlÄ±': 'Residual mass <1.5 cmÂ², limited neurological deficit and spread',
  'RezidÃ¼ â‰¥1.5 cm2 veya kraniyospinal aksa yayÄ±lÄ±m ÅŸÃ¼phesi': 'Residual â‰¥1.5 cmÂ² or suspected craniospinal axis spread',
  'Nodal tutulum yok': 'No nodal involvement',
  'BÃ¶lgesel nodal tutulum': 'Regional nodal involvement',
  'BOS sitolojisi pozitif veya spinal leptomeningeal tohumlanma': 'Positive CSF cytology or spinal leptomeningeal seeding',
  'Omurga, pelvis, ekstremite kemik tutulumu': 'Spine, pelvis, extremity bone involvement',
  'Kafa iÃ§i kitle lezyonlarÄ±': 'Intracranial mass lesions',
  'Acil medÃ¼ller basÄ± ve paraparezi riski': 'Urgent medullary compression and paraparesis risk',
  'Mediastinal obstrÃ¼ksiyon sendromu': 'Mediastinal obstruction syndrome',
  'Pelvik, mesane veya rektal kanama': 'Pelvic, bladder, or rectal bleeding',
  '8 Gy tek fraksiyon (Optimal aÄŸrÄ± palyasyonu, hasta konforu)': '8 Gy single fraction (optimal pain palliation, patient comfort)',
  '20 Gy / 5 fx veya 30 Gy / 10 fx (Uzun saÄŸkalÄ±m beklentisi)': '20 Gy / 5 fx or 30 Gy / 10 fx (longer survival expectation)',
  'Detrusor kasÄ±nÄ± invaze eden kas-invaziv mesane tÃ¼mÃ¶rÃ¼': 'Muscle-invasive bladder tumor invading detrusor muscle',
  'Perivezikal yaÄŸ dokusuna uzanÄ±m': 'Extension into perivesical fat',
  'Prostat stromasÄ±, uterus veya vajen invazyonu': 'Prostatic stroma, uterus, or vagina invasion',
  'Tek bÃ¶lgesel lenf nodunda metastaz': 'Metastasis in a single regional lymph node',
  'Birden fazla bÃ¶lgesel lenf nodu metastazÄ±': 'Multiple regional lymph node metastases',
  'Seminom testise sÄ±nÄ±rlÄ±, tÃ¼mÃ¶r belirteÃ§leri ve gÃ¶rÃ¼ntÃ¼leme ile N0M0': 'Seminoma confined to testis, N0M0 by tumor markers and imaging',
  'Retroperitoneal lenf nodu metastazÄ±, en bÃ¼yÃ¼k Ã§ap â‰¤2 cm': 'Retroperitoneal lymph node metastasis, largest diameter â‰¤2 cm',
  'Retroperitoneal lenf nodu metastazÄ±, en bÃ¼yÃ¼k Ã§ap >2-5 cm': 'Retroperitoneal lymph node metastasis, largest diameter >2-5 cm',
  'Retroperitoneal lenf nodu metastazÄ± yok': 'No retroperitoneal lymph node metastasis',
  'Metastatik nodal kitle â‰¤2 cm': 'Metastatic nodal mass â‰¤2 cm',
  'Metastatik nodal kitle >2-5 cm': 'Metastatic nodal mass >2-5 cm',
  'Subepitelyal baÄŸ dokusuna invazyon': 'Invasion into subepithelial connective tissue',
  'Corpus spongiosum veya cavernosum invazyonu': 'Corpus spongiosum or cavernosum invasion',
  'Ãœretra veya prostat invazyonu': 'Urethra or prostate invasion',
  'DiÄŸer komÅŸu yapÄ±lara invazyon': 'Invasion into other adjacent structures',
  'Tek unilateral inguinal lenf nodu': 'Single unilateral inguinal lymph node',
  'Ã‡oklu veya bilateral inguinal lenf nodu': 'Multiple or bilateral inguinal lymph nodes',
  'Pelvik nodal metastaz veya ekstranodal yayÄ±lÄ±m': 'Pelvic nodal metastasis or extranodal spread',
  'Duktal karsinoma in situ; stromal invazyon yok': 'Ductal carcinoma in situ; no stromal invasion',
  'TÃ¼mÃ¶r Ã§apÄ± â‰¤5 cm': 'Tumor diameter â‰¤5 cm',
  'TÃ¼mÃ¶r Ã§apÄ± >5 cm': 'Tumor diameter >5 cm',
  'Rutin elektif aksiller nodal Ä±ÅŸÄ±nlama endikasyonu yok': 'No indication for routine elective axillary nodal irradiation',
  'Hipofarenksin tek alt bÃ¶lgesinde, Ã§ap â‰¤2 cm': 'Single hypopharyngeal subsite, diameter â‰¤2 cm',
  'Birden fazla alt bÃ¶lge veya komÅŸu bÃ¶lge tutulumu, Ã§ap â‰¤4 cm': 'Multiple subsites or adjacent site involvement, diameter â‰¤4 cm',
  'Ã‡ap >4 cm veya hemilarinks fiksasyonu': 'Diameter >4 cm or hemilarynx fixation',
  'Tiroid/kÄ±kÄ±rdak veya komÅŸu yapÄ± invazyonu': 'Thyroid/cartilage or adjacent structure invasion',
  'Nod(lar) >3-6 cm veya bilateral/kontralateral tutulum': 'Node(s) >3-6 cm or bilateral/contralateral involvement',
  'TÃ¼mÃ¶r â‰¤2 cm ve DOI â‰¤5 mm': 'Tumor â‰¤2 cm and DOI â‰¤5 mm',
  'TÃ¼mÃ¶r â‰¤2 cm ve DOI >5-10 mm veya >2-4 cm ve DOI â‰¤10 mm': 'Tumor â‰¤2 cm and DOI >5-10 mm or >2-4 cm and DOI â‰¤10 mm',
  'TÃ¼mÃ¶r >4 cm veya DOI >10 mm': 'Tumor >4 cm or DOI >10 mm',
  'Kortikal kemik, maksiller sinÃ¼s veya yÃ¼z cildi invazyonu': 'Cortical bone, maxillary sinus, or facial skin invasion',
  'MastikatÃ¶r alan, pterigoid plak, kafa tabanÄ± veya karotis Ã§evresi invazyonu': 'Masticator space, pterygoid plates, skull base, or carotid encasement',
  'Ã‡oklu/bilateral nodlar â‰¤6 cm, ENE negatif': 'Multiple/bilateral nodes â‰¤6 cm, ENE negative',
  'Nod >6 cm veya klinik olarak anlamlÄ± ENE': 'Node >6 cm or clinically significant ENE',
  'TÃ¼mÃ¶r â‰¤2 cm, ekstraparenkimal yayÄ±lÄ±m yok': 'Tumor â‰¤2 cm, no extraparenchymal extension',
  'TÃ¼mÃ¶r >2-4 cm, ekstraparenkimal yayÄ±lÄ±m yok': 'Tumor >2-4 cm, no extraparenchymal extension',
  'TÃ¼mÃ¶r >4 cm veya ekstraparenkimal yumuÅŸak doku yayÄ±lÄ±mÄ±': 'Tumor >4 cm or extraparenchymal soft tissue extension',
  'Deri, mandibula, dÄ±ÅŸ kulak yolu veya fasiyal sinir invazyonu': 'Skin, mandible, external auditory canal, or facial nerve invasion',
  'Kafa tabanÄ±, pterigoid plak veya karotis Ã§evresi invazyonu': 'Skull base, pterygoid plates, or carotid encasement',
  'Nod >3-6 cm veya Ã§oklu/bilateral nodal hastalÄ±k': 'Node >3-6 cm or multiple/bilateral nodal disease',
  'Tek kemik veya ekstramedÃ¼ller plazmasitom': 'Single bone or extramedullary plasmacytoma',
  'Birden fazla kemik lezyonu; miyelom deÄŸerlendirmesi gerekir': 'Multiple bone lesions; myeloma workup required',
  'Ek odak veya sistemik hastalÄ±k': 'Additional focus or systemic disease',
  'AÄŸrÄ±lÄ± litik lezyon veya patolojik fraktÃ¼r riski': 'Painful lytic lesion or pathologic fracture risk',
  'BÃ¶breÄŸe sÄ±nÄ±rlÄ± veya cerrahiyle tamamen Ã§Ä±karÄ±lmÄ±ÅŸ tÃ¼mÃ¶r': 'Tumor confined to kidney or completely resected',
  'KarÄ±n iÃ§inde rezidÃ¼, nodal tutulum veya fokal/diffÃ¼z anaplazi': 'Intra-abdominal residual, nodal involvement, or focal/diffuse anaplasia',
  'BÃ¶lgesel nodal tutulum yok': 'No regional nodal involvement',
  'Uzak metastaz, sÄ±klÄ±kla akciÄŸer': 'Distant metastasis, frequently lung',
  'GÃ¶rÃ¼ntÃ¼lemede risk faktÃ¶rÃ¼ olmayan lokalize tÃ¼mÃ¶r': 'Localized tumor without imaging-defined risk factors',
  'Bir veya daha fazla gÃ¶rÃ¼ntÃ¼leme tanÄ±mlÄ± risk faktÃ¶rÃ¼ olan lokalize tÃ¼mÃ¶r': 'Localized tumor with one or more imaging-defined risk factors',
  'Uzak metastatik hastalÄ±k': 'Distant metastatic disease',
  'Ä°psilateral bÃ¶lgesel nod tutulumu': 'Ipsilateral regional node involvement',
  'Ciltte Ã¶dem (peau dâ€™orange), Ã¼lserasyon veya satellit cilt nodÃ¼lleri': 'Skin edema (peau d\'orange), ulceration, or satellite skin nodules',
  'T4a ve T4b Ã¶zelliklerinin birlikte bulunmasÄ±': 'Coexistence of T4a and T4b features',
  'Ä°nflamatuar meme karsinomu (memenin en az 1/3â€™Ã¼nde diffÃ¼z eritem ve Ã¶dem)': 'Inflammatory breast carcinoma (diffuse erythema and edema in at least 1/3 of the breast)',
  'Lamina propria veya muskularis mukoza invazyonu': 'Lamina propria or muscularis mucosae invasion',
  'Submukoza invazyonu': 'Submucosal invasion',
  'Adventisya invazyonu': 'Adventitia invasion',
  'Rezekabl komÅŸu organ invazyonu (plevra, perikard, diyafram)': 'Resectable adjacent organ invasion (pleura, pericardium, diaphragm)',
  'Ä°nrezekabl komÅŸu organ invazyonu (aort, trakea, vertebra)': 'Unresectable adjacent organ invasion (aorta, trachea, vertebra)',
  '1-2 bÃ¶lgesel lenf nodu': '1-2 regional lymph nodes',
  '3-6 bÃ¶lgesel lenf nodu': '3-6 regional lymph nodes',
  'â‰¥7 bÃ¶lgesel lenf nodu': 'â‰¥7 regional lymph nodes',
  'TÃ¼mÃ¶r â‰¤2 cm (pankreasa sÄ±nÄ±rlÄ±)': 'Tumor â‰¤2 cm (confined to pancreas)',
  'TÃ¼mÃ¶r >2 cm ama â‰¤4 cm': 'Tumor >2 cm but â‰¤4 cm',
  'TÃ¼mÃ¶r >4 cm (Ã§Ã¶lyak aks veya SMA tutulumu yok)': 'Tumor >4 cm (no celiac axis or SMA involvement)',
  'Ã‡Ã¶lyak aks, SMA veya ana hepatik arter tutulumu (inrezekabl lokal ileri)': 'Celiac axis, SMA, or common hepatic artery involvement (unresectable locally advanced)',
  'BÃ¶lgesel LN metastazÄ± yok': 'No regional LN metastasis',
  '1-3 bÃ¶lgesel LN': '1-3 regional LNs',
  'â‰¥4 bÃ¶lgesel LN': 'â‰¥4 regional LNs',
  'Tek lezyon â‰¤2 cm; vaskÃ¼ler invazyon yok': 'Single lesion â‰¤2 cm; no vascular invasion',
  'Tek lezyon â‰¤2 cm; mikrovaskÃ¼ler invazyon mevcut': 'Single lesion â‰¤2 cm; microvascular invasion present',
  'Tek lezyon >2 cm veya vaskÃ¼ler invazyonlu tek lezyon': 'Single lesion >2 cm or single lesion with vascular invasion',
  'Ã‡apÄ± >5 cm olan Ã§oklu lezyonlar veya ana portal/hepatik ven dalÄ± invazyonu': 'Multiple lesions >5 cm or main portal/hepatic vein branch invasion',
  'KomÅŸu organ invazyonu (safra kesesi hariÃ§) veya visseral periton perforasyonu': 'Adjacent organ invasion (except gallbladder) or visceral peritoneal perforation',
  'BÃ¶lgesel lenf nodu metastazÄ± mevcut': 'Regional lymph node metastasis present',
  'Uzak organ/peritoneal metastaz mevcut': 'Distant organ/peritoneal metastasis present',
  'Pilositik astrositom veya dÃ¼ÅŸÃ¼k dereceli circumscribed gliom': 'Pilocytic astrocytoma or low-grade circumscribed glioma',
  'DÃ¼ÅŸÃ¼k dereceli diffÃ¼z astrositom veya oligodendrogliom': 'Low-grade diffuse astrocytoma or oligodendroglioma',
  'Anaplastik astrositom veya anaplastik oligodendrogliom': 'Anaplastic astrocytoma or anaplastic oligodendroglioma',
  'Glioblastom veya diÄŸer yÃ¼ksek dereceli diffÃ¼z gliom': 'Glioblastoma or other high-grade diffuse glioma',
  'Beyin parankiminde bÃ¶lgesel lenf nodu evrelemesi uygulanmaz': 'Regional lymph node staging not applicable in brain parenchyma',
  'Uzak metastaz saptanmadÄ±': 'No distant metastasis detected',
  'Leptomeningeal veya uzak ekstrakraniyal yayÄ±lÄ±m': 'Leptomeningeal or distant extracranial spread',
  'TÃ¼mÃ¶r over/fallop tÃ¼pÃ¼ ile sÄ±nÄ±rlÄ±': 'Tumor confined to ovary/fallopian tube',
  'Pelvise uzanÄ±m veya primer peritoneal yayÄ±lÄ±m': 'Pelvic extension or primary peritoneal spread',
  'Ekstrapelvik peritoneal yayÄ±lÄ±m ve/veya retroperitoneal nod': 'Extrapelvic peritoneal spread and/or retroperitoneal nodes',
  'Uzak metastaz veya malign plevral efÃ¼zyon': 'Distant metastasis or malignant pleural effusion',
  'Retroperitoneal lenf nodu metastazÄ± mevcut': 'Retroperitoneal lymph node metastasis present',
  // --- HEDEF HACÄ°M ANATOMÄ°K KAPSAMLAR ---
  'Pre-KT primer kitle ve tutulu mediastinal/hiler lenf nodlarÄ±': 'Pre-CT primary mass and involved mediastinal/hilar lymph nodes',
  'YalnÄ±zca tutulu alan mikroskobik yayÄ±lÄ±mÄ± (Elektif nodal Ã¶nerilmez)': 'Microscopic spread of involved field only (elective nodal not recommended)',
  'Solunum ve set-up zarfÄ±': 'Respiratory and set-up envelope',
  'TÃ¼m beyin parankimi (Hipokampus nÃ¶rogenezis zonu hariÃ§)': 'Whole brain parenchyma (excluding hippocampal neurogenesis zone)',
  'Post-KT rezidÃ¼el akciÄŸer kitlesi ve tutulu nodlar': 'Post-CT residual lung mass and involved nodes',
  'TÃ¼mÃ¶r yataÄŸÄ±, cerrahi klipsler ve anterior mediasten': 'Tumor bed, surgical clips, and anterior mediastinum',
  'TÃ¼mÃ¶r yataÄŸÄ±, plevral adezyon bÃ¶lgeleri ve anterior mediasten': 'Tumor bed, pleural adhesion areas, and anterior mediastinum',
  'AÄŸrÄ±lÄ± invaziv plevral kitle odaÄŸÄ±': 'Painful invasive pleural mass focus',
  'Dren ve biyopsi skarlarÄ±': 'Drain and biopsy scars',
  'Metastatik odak ve primer kitle': 'Metastatic focus and primary mass',
  'Semptomatik obstrÃ¼ktif kitle': 'Symptomatic obstructive mass',
  'Primer kitle + PET/biyopsi pozitif mediastinal nodlar': 'Primary mass + PET/biopsy-positive mediastinal nodes',
  'YalnÄ±zca tutulu alan mikroskobik payÄ±': 'Microscopic margin of involved field only',
  'DIBH altÄ±nda set-up ve intra-fraksiyon gÃ¼venlik marjini': 'Set-up and intra-fraction safety margin under DIBH',
  'Parankimal primer kitle (BT/PET fÃ¼zyonu)': 'Parenchymal primary mass (CT/PET fusion)',
  'TÃ¼mÃ¶rÃ¼n solunum siklusu boyunca kat ettiÄŸi hareket hacmi (MIP)': 'Motion envelope traversed by tumor through respiratory cycle (MIP)',
  'GÃ¼nlÃ¼k IGRT ve set-up gÃ¼venlik marjini': 'Daily IGRT and set-up safety margin',
  'Serviks, uterus, parametriyal dokular, vajen Ã¼st 1/2 ve pelvik lenf nodlarÄ±': 'Cervix, uterus, parametrial tissues, upper 1/2 vagina, and pelvic lymph nodes',
  'Rezidu servikal kitle + tÃ¼m serviks (Brakiterapi ile eskalasyon)': 'Residual cervical mass + entire cervix (escalated with brachytherapy)',
  'Vajinal kaf, parametriyum yataÄŸÄ± ve pelvik lenfatik drenaj': 'Vaginal cuff, parametrial bed, and pelvic lymphatic drainage',
  'Vajinal kaf ve Ã¼st 3-4 cm vajina mukozasÄ±': 'Vaginal cuff and upper 3-4 cm vaginal mucosa',
  'Pozitif marjin veya servikal tutulumda vajinal kaf boostu': 'Vaginal cuff boost in positive margin or cervical involvement',
  'PET/MR pozitif nÃ¼ks lenf nodu veya visseral kitle': 'PET/MR-positive recurrent lymph node or visceral mass',
  'Stereotaktik gÃ¼venlik marjini': 'Stereotactic safety margin',
  'Semptomatik kitle': 'Symptomatic mass',
  'TÃ¼m vajen, parakolpium, pelvik lenf nodlarÄ± (alt 1/3 ise bilateral kasÄ±k dahil)': 'Entire vagina, paracolpium, pelvic lymph nodes (including bilateral groins if lower 1/3)',
  'Primer kitle rezidÃ¼sÃ¼ (Ä°nterstisyel iÄŸneler veya silindir ile boost)': 'Primary mass residual (boost with interstitial needles or cylinder)',
  'Bilateral inguinofemoral ve iliak lenf nodu istasyonlarÄ±': 'Bilateral inguinofemoral and iliac lymph node stations',
  'KapsÃ¼l dÄ±ÅŸÄ± yayÄ±lan veya rezeke makroskopik nod yataÄŸÄ±': 'Extracapsular spread or resected macroscopic nodal bed',
  'Primer kitle ve tutulu kasÄ±k nodlarÄ±': 'Primary mass and involved groin nodes',
  'Ekstremite veya gÃ¶vde primer yataÄŸÄ±': 'Extremity or trunk primary bed',
  'Primer kitle veya tÃ¼mÃ¶r rezeksiyon yataÄŸÄ±': 'Primary mass or tumor resection bed',
  'Fasyal planlar boyunca anatomik mikroskobik yayÄ±lÄ±m payÄ±': 'Anatomic microscopic spread margin along fascial planes',
  'Makroskopik rezidÃ¼ veya cerrahi sÄ±nÄ±r pozitif kemik yataÄŸÄ±': 'Macroscopic residual or margin-positive bone bed',
  'Mikroskobik kemik iliÄŸi ve periostal alan': 'Microscopic bone marrow and periosteal area',
  'Kemoterapi Ã–NCESÄ° baÅŸlangÄ±Ã§taki tÃ¼m kemik tutulum hacmi': 'Pre-chemotherapy initial entire bone involvement volume',
  'Kemoterapi SONRASI rezidÃ¼el yumuÅŸak doku kompanenti': 'Post-chemotherapy residual soft tissue component',
  'RezidÃ¼ veya inoperabl kitle': 'Residual or inoperable mass',
  'Sakral veya klivus lezyon hacmi': 'Sacral or clival lesion volume',
  'Ekspansif litik kitle': 'Expansile lytic mass',
  'GerÃ§ek vokal kordlar, Ã¶n komissÃ¼r ve aritenoid vokal proÃ§es': 'True vocal cords, anterior commissure, and arytenoid vocal process',
  'Primer rezeksiyon yataÄŸÄ± ve patolojiye gÃ¶re yÃ¼ksek risk alanÄ±': 'Primary resection bed and high-risk area per pathology',
  'Primer komÅŸuluÄŸu ve tutulu nod istasyonu': 'Primary vicinity and involved nodal station',
  'Cerrahi kavite, rezidÃ¼ tÃ¼mÃ¶r ve T2/FLAIR anormalliÄŸi': 'Surgical cavity, residual tumor, and T2/FLAIR abnormality',
  'T1 kontrastlÄ± rezidÃ¼ ve cerrahi kavite': 'T1 contrast-enhancing residual and surgical cavity',
  'Anatomik bariyerlere saygÄ±lÄ± mikroskobik pay': 'Microscopic margin respecting anatomic barriers',
  'Set-up gÃ¼venlik zarfÄ±': 'Set-up safety envelope',
  'Kontrast tutan dural kuyruk ve rezidÃ¼el kitle': 'Contrast-enhancing dural tail and residual mass',
  'Bilateral beyin hemisferleri (Hipokampus alanÄ± hariÃ§)': 'Bilateral brain hemispheres (excluding hippocampal area)',
  'Pelvik lenfatikler ve mesane Ã§evresi': 'Pelvic lymphatics and peri-bladder area',
  'GÃ¶rÃ¼ntÃ¼leme ve TURBT bulgularÄ±na gÃ¶re boost': 'Boost per imaging and TURBT findings',
  'Prostat bezi ve seminal vezikÃ¼l tabanÄ±': 'Prostate gland and seminal vesicle base',
  'Prostat ve seminal vezikÃ¼ller': 'Prostate and seminal vesicles',
  'Prostat bezi; varsa dominant intraprostatik lezyon (DIL) / nodÃ¼l boostu': 'Prostate gland; dominant intraprostatic lesion (DIL) / nodule boost if present',
  'Prostat Â± seminal vezikÃ¼ller, risk uyarlamalÄ±': 'Prostate Â± seminal vesicles, risk-adapted',
  'GÃ¼nlÃ¼k IGRT ve prostat hareket gÃ¼venlik marjini': 'Daily IGRT and prostate motion safety margin',
  'Meme yataÄŸÄ±; elektif aksilla dahil edilmez': 'Breast bed; elective axilla not included',
  'Primer yatak ve cerrahi skar': 'Primary bed and surgical scar',
  'Mastektomi gÃ¶ÄŸÃ¼s duvarÄ± ve cilt altÄ± yÃ¼zey': 'Mastectomy chest wall and subcutaneous surface',
  'Rektal tÃ¼mÃ¶r, mezorektum, presakral ve internal iliak lenf nodlarÄ±': 'Rectal tumor, mesorectum, presacral and internal iliac lymph nodes',
  'Mide yataÄŸÄ±, anastomoz hattÄ± ve perigastrik/Ã§Ã¶lyak lenf nodlarÄ±': 'Gastric bed, anastomotic line, and perigastric/celiac lymph nodes',
  'Kontrast tutan karaciÄŸer lezyonu': 'Contrast-enhancing liver lesion',
  'MIP Ã¼zerinde tÃ¼mÃ¶rÃ¼n solunum hareket hacmi': 'Tumor respiratory motion volume on MIP',
  'Primer Ã¶zofagus tÃ¼mÃ¶rÃ¼ ve bÃ¶lgesel lenfatikler': 'Primary esophageal tumor and regional lymphatics',
  'Primer pankreas tÃ¼mÃ¶rÃ¼ ve ilgili lenfatikler': 'Primary pancreatic tumor and related lymphatics',
  'Primer kitle ve bÃ¶lgesel lenfatikler': 'Primary mass and regional lymphatics',
  'Elektif bÃ¶lgesel nodal alan; risk uyarlanmÄ±ÅŸ': 'Elective regional nodal area; risk-adapted',
  'Makroskopik lezyon ve subklinik yayÄ±lÄ±m alanÄ±': 'Macroscopic lesion and subclinical spread area',
  'AÄŸrÄ±lÄ± litik veya fraktÃ¼r riski taÅŸÄ±yan lezyon': 'Painful lytic or fracture-risk lesion',
  'Total body / kemik iliÄŸi': 'Total body / bone marrow',
  'Tutulu lenf nodu bÃ¶lgesi': 'Involved lymph node region',
  'BaÅŸlangÄ±Ã§ta tutulu lenf nodu hacmi': 'Initially involved lymph node volume',
  'Primer tÃ¼mÃ¶r yataÄŸÄ± ve rezidÃ¼el hastalÄ±k': 'Primary tumor bed and residual disease',
  'Kemoterapi Ã¶ncesi kemik ve yumuÅŸak doku hastalÄ±ÄŸÄ±': 'Pre-chemotherapy bone and soft tissue disease',
  'Post-KT rezidÃ¼el tÃ¼mÃ¶r / yÃ¼ksek risk alanÄ±': 'Post-CT residual tumor / high-risk area',
  'TÃ¼m beyin, tekal kese ve kauda ekuina sonlanÄ±mÄ±na kadar': 'Entire brain, thecal sac, down to cauda equina terminus',
  'Posterior fossa tÃ¼mÃ¶r yataÄŸÄ±': 'Posterior fossa tumor bed',
  'Makroskopik vertebral metastaz / epidural hastalÄ±k': 'Macroscopic vertebral metastasis / epidural disease',
  'Ä°lgili vertebral segment ve epidural yayÄ±lÄ±m': 'Involved vertebral segment and epidural extension',
  'GÃ¼nlÃ¼k IGRT ve spinal set-up gÃ¼venlik marjini': 'Daily IGRT and spinal set-up safety margin',
  // --- OAR ORGAN Ä°SÄ°MLERÄ° ---
  'Gonad / komÅŸu eklem': 'Gonad / adjacent joint',
  'Cilt / Ã§evre doku': 'Skin / surrounding tissue',
  'Cilt / komÅŸu eklem': 'Skin / adjacent joint',
  'Beyin sapÄ± yÃ¼zeyi': 'Brainstem surface',
  'Beyin sapÄ±': 'Brainstem',
  'Kalp ve akciÄŸer': 'Heart and lung',
  'Beyin sapÄ± / optik yol': 'Brainstem / optic pathway',
  'Ã–zofagus Mean': 'Esophagus Mean',
  'AkciÄŸer V20Gy': 'Lung V20Gy',
  'Proksimal BronÅŸ AÄŸacÄ±': 'Proximal Bronchial Tree',
  'Ana BronÅŸ / Trakea': 'Main Bronchus / Trachea',
  'Ä°nce BaÄŸÄ±rsak D2cc': 'Small Bowel D2cc',
  'Ä°nce BaÄŸÄ±rsak V40Gy': 'Small Bowel V40Gy',
  'Ä°nce BaÄŸÄ±rsak / Duodenum': 'Small Bowel / Duodenum',
  'BÃ¼yÃ¼k Damarlar': 'Great Vessels',
  'BaÄŸÄ±rsak': 'Bowel',
  'Femur BaÅŸlarÄ±': 'Femoral Heads',
  'BaÄŸÄ±rsak TorbasÄ±': 'Bowel Bag',
  'Cilt Koruma Åeridi (Strip)': 'Skin Sparing Strip',
  'KomÅŸu Eklem': 'Adjacent Joint',
  'BÃ¼yÃ¼k Sinir GÃ¶vdeleri': 'Major Nerve Trunks',
  'BÃ¼yÃ¼me PlaÄŸÄ± (Pediatrik)': 'Growth Plate (Pediatric)',
  'Beyin SapÄ± / Optik Yol': 'Brainstem / Optic Pathway',
  'Beyin SapÄ± / Kord': 'Brainstem / Cord',
  'Parotis Bezi (KarÅŸÄ±)': 'Parotid Gland (Contralateral)',
  'GÃ¶z Lensleri': 'Eye Lenses',
  'Ä°nce baÄŸÄ±rsak': 'Small bowel',
  'KarÅŸÄ± testis': 'Contralateral testis',
  'BÃ¶brekler': 'Kidneys',
  'Ãœretra / cilt': 'Urethra / skin',
  'Ä°psilateral akciÄŸer': 'Ipsilateral lung',
  'Ä°psilateral AkciÄŸer': 'Ipsilateral Lung',
  'Bilateral BÃ¶brek': 'Bilateral Kidneys',
  'SaÄŸlam KaraciÄŸer': 'Uninvolved Liver',
  'GÃ¶z Lensi (YÃ¼z ise)': 'Eye Lens (if facial field)',
  'Spinal kord (yakÄ±nsa)': 'Spinal cord (if adjacent)',
  'KomÅŸu OAR': 'Adjacent OAR',
  'Kontralateral bÃ¶brek': 'Contralateral kidney',
  'BÃ¼yÃ¼me plaklarÄ±': 'Growth plates',
  'KomÅŸu eklem': 'Adjacent joint',
  // --- MARJÄ°N TANIMLARI ---
  'GTV + 4D solunum fazlarÄ± zarfÄ±': 'GTV + 4D respiratory phase envelope',
  'MR bazlÄ±': 'MR-based',
  'Ãœst 1/3-1/2': 'Upper 1/3-1/2',
  'Cerrahi skar ve anatomik yayÄ±lÄ±m doÄŸrultusunda': 'Along surgical scar and anatomic spread',
  'Cerrahi yatak + klinik marjin': 'Surgical bed + clinical margin',
  'Tutulu nod yataÄŸÄ± / SIB': 'Involved nodal bed / SIB',
  'KafatasÄ±': 'Skull',
  'Mesane duvarÄ± ve yatak': 'Bladder wall and bed',
  '3-5 mm; rektum yÃ¶nÃ¼nde 3 mm': '3-5 mm; 3 mm toward rectum',
  'Cerrahi yatak ve klipsler': 'Surgical bed and clips',
  'BÃ¶lgesel drenaj': 'Regional drainage',
  'GÃ¶rÃ¼ntÃ¼leme ve anatomik bariyerlere gÃ¶re': 'Per imaging and anatomic barriers',
  'GÃ¶rÃ¼ntÃ¼leme ve anatomik sÄ±nÄ±rlara gÃ¶re': 'Per imaging and anatomic boundaries',
  'TÃ¼m vÃ¼cut': 'Whole body',
  'Dalak + gÃ¼nlÃ¼k gÃ¶rÃ¼ntÃ¼leme marjini': 'Spleen + daily imaging margin',
  'Pre-KT GTV ile sÄ±nÄ±rlÄ±': 'Confined to pre-CT GTV',
  'COG / SIOP protokol sÄ±nÄ±rlarÄ±': 'COG / SIOP protocol boundaries',
  'BaÅŸlangÄ±Ã§ gÃ¶rÃ¼ntÃ¼leme ve protokol sÄ±nÄ±rlarÄ±': 'Baseline imaging and protocol boundaries',
  'Pre-KT baÅŸlangÄ±Ã§ hacmine gÃ¶re': 'Per pre-CT baseline volume',
  'RezidÃ¼el hacim': 'Residual volume',
  'TÃ¼m nÃ¶roaksis': 'Entire neuraxis',
  '1-2 mm (SBRT planÄ±nda)': '1-2 mm (in SBRT plan)',
  'Semptomatik lezyon ve anatomik yayÄ±lÄ±m': 'Symptomatic lesion and anatomic spread',
  'TÃ¼m ipsilateral plevral yÃ¼zey, cerrahi yatak ve insizyon/dren bÃ¶lgeleri': 'Entire ipsilateral pleural surface, surgical bed, and incision/drain sites',
  'GÃ¼nlÃ¼k IGRT ile set-up gÃ¼venlik marjini': 'Set-up safety margin with daily IGRT',
  'Ä°psilateral AkciÄŸer (P/D sonrasÄ±)': 'Ipsilateral Lung (post P/D)',
  'KaraciÄŸer (SaÄŸ taraf)': 'Liver (right-sided)',
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
    { id: 'benign-dupuytren', name: 'Dupuytren KontraktÃ¼rÃ¼' },
    { id: 'benign-ledderhose', name: 'Ledderhose HastalÄ±ÄŸÄ±' },
    { id: 'benign-jinekomasti', name: 'Jinekomasti Profilaksisi' },
    { id: 'benign-topuk-dikeni', name: 'Plantar Fasiit / Kalkaneus Dikeni' },
    { id: 'benign-epikondilit', name: 'TenisÃ§i / GolfÃ§Ã¼ DirseÄŸi' },
    { id: 'benign-omuz', name: 'Omuz Periartriti / Ä°mpingement' },
    { id: 'benign-artroz', name: 'Gonartroz / Koksartroz' },
    { id: 'benign-graves', name: 'Graves Orbitopati' },
    { id: 'benign-trigeminal', name: 'Trigeminal Nevralji (SRS)' },
    { id: 'benign-schwannom', name: 'VestibÃ¼ler Schwannom' },
    { id: 'benign-avm', name: 'ArteriovenÃ¶z Malformasyon (AVM)' },
  ],
};

const ORGAN_TREE: Record<OrganId, Array<{ id: string; name_tr: string; name_en: string }>> = {
  emergencies: [
    { id: 'emergency-mscc', name_tr: 'Spinal Kord BasÄ±sÄ± (MSCC)', name_en: 'Spinal Cord Compression (MSCC)' },
    { id: 'emergency-svcs', name_tr: 'Vena Kava Superior Sendromu (VCSS / SVCS)', name_en: 'Superior Vena Cava Syndrome (SVCS)' },
    { id: 'emergency-airway', name_tr: 'Akut Havayolu ObstrÃ¼ksiyonu (Trakea & Karina)', name_en: 'Acute Airway Obstruction (Trachea & Carina)' },
    { id: 'emergency-hemorrhage', name_tr: 'Masif Hemoraji / Hemostatik RT', name_en: 'Major Hemorrhage / Hemostatic RT' },
    { id: 'emergency-icp', name_tr: 'Akut KÄ°BAS & Beyin Herniasyonu', name_en: 'Acute Raised ICP & Brain Herniation' },
  ],
  thorax: [
    { id: 'thorax-nsclc', name_tr: 'KHDAK (NSCLC)', name_en: 'NSCLC' },
    { id: 'thorax-sclc', name_tr: 'KHAK (SCLC)', name_en: 'SCLC' },
    { id: 'thorax-thymoma', name_tr: 'TimÃ¼s', name_en: 'Thymus' },
    { id: 'thorax-mesothelioma', name_tr: 'Mezotelyoma', name_en: 'Mesothelioma' },
  ],
  prostate: [
    { id: 'prostate-prostate', name_tr: 'Prostat Kanseri', name_en: 'Prostate Cancer' },
    { id: 'prostate-bladder', name_tr: 'Mesane Kanseri', name_en: 'Bladder Cancer' },
    { id: 'prostate-penile', name_tr: 'Penil Kanser', name_en: 'Penile Cancer' },
    { id: 'prostate-testis', name_tr: 'Testis Kanseri', name_en: 'Testicular Cancer' },
    { id: 'prostate-kidney', name_tr: 'BÃ¶brek Kanseri (RCC)', name_en: 'Renal Cell Carcinoma (RCC)' },
  ],
  breast: [
    { id: 'breast-idc', name_tr: 'Ä°nvaziv Duktal Karsinom (Ä°DK)', name_en: 'Invasive Ductal (IDC)' },
    { id: 'breast-ilc', name_tr: 'Ä°nvaziv LobÃ¼ler Karsinom (Ä°LK)', name_en: 'Invasive Lobular (ILC)' },
    { id: 'breast-dcis', name_tr: 'Duktal Karsinoma Ä°n Situ (DCIS)', name_en: 'Ductal Carcinoma In Situ' },
    { id: 'breast-inflammatory', name_tr: 'Ä°nflamatuar Meme Kanseri', name_en: 'Inflammatory Breast Ca' },
    { id: 'breast-phyllodes', name_tr: 'Malign Filloides TÃ¼mÃ¶rÃ¼', name_en: 'Malignant Phyllodes' },
    { id: 'breast-metaplastic', name_tr: 'Metaplastik Karsinom', name_en: 'Metaplastic Carcinoma' },
  ],
  gis: [
    { id: 'gis-Rektum', name_tr: 'Rektum Kanseri', name_en: 'Rectal Cancer' },
    { id: 'gis-Mide', name_tr: 'Mide Kanseri', name_en: 'Gastric Cancer' },
    { id: 'gis-anus', name_tr: 'Anal Kanal Kanseri (Nigro)', name_en: 'Anal Canal Cancer' },
    { id: 'gis-Karaciger', name_tr: 'KaraciÄŸer (HCC/Met)', name_en: 'Liver (HCC/Met)' },
    { id: 'gis-SafraYollari', name_tr: 'Safra YollarÄ±', name_en: 'Biliary Tract' },
    { id: 'gis-Pankreas', name_tr: 'Pankreas Kanseri', name_en: 'Pancreatic Cancer' },
    { id: 'gis-Ozofagus', name_tr: 'Ã–zofagus Kanseri', name_en: 'Esophageal Cancer' },
  ],
  'head-neck': [
    { id: 'head-neck-nasopharynx', name_tr: 'Nazofarenks (NPC)', name_en: 'Nasopharynx (NPC)' },
    { id: 'head-neck-oropharynx', name_tr: 'Orofarenks (OPC)', name_en: 'Oropharynx (OPC)' },
    { id: 'head-neck-larynx', name_tr: 'Larenks Kanseri', name_en: 'Larynx Cancer' },
    { id: 'head-neck-maxillary-sinus', name_tr: 'Maksiller SinÃ¼s', name_en: 'Maxillary Sinus' },
    { id: 'head-neck-oral-cavity', name_tr: 'Oral Kavite', name_en: 'Oral Cavity' },
    { id: 'head-neck-salivary', name_tr: 'TÃ¼kÃ¼rÃ¼k Bezi Kanserleri', name_en: 'Salivary Gland Cancer' },
  ],
  cns: [
    { id: 'cns-glioma', name_tr: 'Glial TÃ¼mÃ¶rler (WHO Grade 1-4)', name_en: 'Gliomas (WHO Grade 1-4)' },
    { id: 'cns-mets', name_tr: 'Beyin MetastazlarÄ±', name_en: 'Brain Metastases' },
    { id: 'cns-meningioma', name_tr: 'Menenjiom', name_en: 'Meningioma' },
  ],
  gynecology: [
    { id: 'gynecology-Serviks', name_tr: 'Serviks Kanseri', name_en: 'Cervical Cancer' },
    { id: 'gynecology-Endometriyum', name_tr: 'Endometriyum Kanseri', name_en: 'Endometrial Cancer' },
    { id: 'gynecology-Vulva', name_tr: 'Vulva Kanseri', name_en: 'Vulvar Cancer' },
    { id: 'gynecology-Vajen', name_tr: 'Vajen Kanseri', name_en: 'Vaginal Cancer' },
    { id: 'gynecology-ovary', name_tr: 'Over & Fallop TÃ¼pÃ¼ Kanseri', name_en: 'Ovarian Cancer' },
  ],
  'bone-sarcoma': [
    { id: 'bone-sarcoma-Yumusak_Doku', name_tr: 'YumuÅŸak Doku Sarkomu', name_en: 'Soft Tissue Sarcoma' },
    { id: 'bone-sarcoma-Osteosarkom', name_tr: 'Osteosarkom', name_en: 'Osteosarcoma' },
    { id: 'bone-sarcoma-Ewing', name_tr: 'Ewing Sarkomu', name_en: 'Ewing Sarcoma' },
  ],
  bone: [
    { id: 'bone-osteosarcoma', name_tr: 'Osteosarkom', name_en: 'Osteosarcoma' },
    { id: 'bone-ewing', name_tr: 'Ewing Sarkomu', name_en: 'Ewing Sarcoma' },
    { id: 'bone-chondrosarcoma', name_tr: 'Kondrosarkom', name_en: 'Chondrosarcoma' },
    { id: 'bone-chordoma', name_tr: 'Kordoma (Sakral / Kafa TabanÄ±)', name_en: 'Chordoma' },
    { id: 'bone-gctb', name_tr: 'Dev HÃ¼creli Kemik TÃ¼mÃ¶rÃ¼ (GCTB)', name_en: 'Giant Cell Tumor of Bone' },
  ],
  sarcoma: [
    { id: 'sarcoma-extremity', name_tr: 'Ekstremite / GÃ¶vde YumuÅŸak Doku', name_en: 'Extremity / Trunk Soft Tissue Sarcoma' },
    { id: 'sarcoma-retroperitoneal', name_tr: 'Retroperitoneal Sarkom', name_en: 'Retroperitoneal Sarcoma' },
    { id: 'sarcoma-rhabdomyosarcoma', name_tr: 'Rhabdomyosarkom', name_en: 'Rhabdomyosarcoma' },
    { id: 'sarcoma-liposarcoma', name_tr: 'Liposarkom / Leyomiyosarkom', name_en: 'Liposarcoma / LMS' },
    { id: 'sarcoma-dfsp', name_tr: 'Dermatofibrosarkoma Protuberans (DFSP)', name_en: 'Dermatofibrosarcoma Protuberans (DFSP)' },
  ],
  skin: [
    { id: 'skin-scc', name_tr: 'SkuamÃ¶z HÃ¼creli Karsinom (cSCC)', name_en: 'Cutaneous SCC' },
    { id: 'skin-bcc', name_tr: 'Bazal HÃ¼creli Karsinom (BCC)', name_en: 'Basal Cell Ca' },
    { id: 'skin-melanom', name_tr: 'KutanÃ¶z Melanom', name_en: 'Cutaneous Melanoma' },
    { id: 'skin-merkel', name_tr: 'Merkel HÃ¼creli Karsinom (MCC)', name_en: 'Merkel Cell Carcinoma' },
    { id: 'skin-mycosis', name_tr: 'Mikozis Fungoides', name_en: 'Mycosis Fungoides / CTCL' },
    { id: 'skin-kaposi', name_tr: 'Kaposi Sarkomu', name_en: 'Kaposi Sarcoma' },
  ],
  hematologic: [
    { id: 'hematologic-hodgkin', name_tr: 'Hodgkin Lenfoma (ISRT)', name_en: 'Hodgkin Lymphoma' },
    { id: 'hematologic-non-hodgkin', name_tr: 'Non-Hodgkin Lenfoma', name_en: 'Non-Hodgkin Lymphoma' },
    { id: 'hematologic-myeloma', name_tr: 'Multipl Miyelom / Plazmositom', name_en: 'Multiple Myeloma / Plasmacytoma' },
    { id: 'hematologic-all', name_tr: 'Akut Lenfoblastik LÃ¶semi', name_en: 'ALL (Cranial/TBI)' },
    { id: 'hematologic-cll', name_tr: 'KLL (Palyatif Dalak / Nodal)', name_en: 'CLL (Splenic/Nodal RT)' },
  ],
  pediatric: [
    { id: 'pediatric-medulloblastoma', name_tr: 'Medulloblastom (CSI)', name_en: 'Medulloblastoma' },
    { id: 'pediatric-wilms', name_tr: 'Wilms TÃ¼mÃ¶rÃ¼', name_en: 'Wilms Tumor' },
    { id: 'pediatric-neuroblastoma', name_tr: 'NÃ¶roblastom', name_en: 'Neuroblastoma' },
    { id: 'pediatric-ewing', name_tr: 'Pediatrik Ewing Sarkomu', name_en: 'Pediatric Ewing Sarcoma' },
    { id: 'pediatric-rhabdo', name_tr: 'Pediatrik Rhabdomyosarkom', name_en: 'Pediatric Rhabdomyosarcoma' },
  ],
  palliative: [
    { id: 'palliative-bone', name_tr: 'Kemik MetastazÄ± Palyasyonu', name_en: 'Bone Metastases' },
    { id: 'palliative-brain', name_tr: 'Beyin MetastazlarÄ± (Elektif WBRT / SRS)', name_en: 'Brain Metastases (Elective WBRT / SRS)' },
    { id: 'palliative-soft-tissue', name_tr: 'Organ & YumuÅŸak Doku MetastazÄ± Palyasyonu', name_en: 'Organ & Soft-Tissue Metastasis Palliation' },
  ],
  benign: [
    { id: 'benign-ho', name_tr: 'Heterotopik Ossifikasyon', name_en: 'Heterotopic Ossification' },
    { id: 'benign-keloid', name_tr: 'Keloid Profilaksisi', name_en: 'Keloid Prophylaxis' },
    { id: 'benign-dupuytren', name_tr: 'Dupuytren KontraktÃ¼rÃ¼', name_en: 'Dupuytren Contracture' },
    { id: 'benign-topuk-dikeni', name_tr: 'Topuk Dikeni (Plantar Fasiit)', name_en: 'Plantar Fasciitis' },
    { id: 'benign-pituitary', name_tr: 'Hipofiz Adenomu', name_en: 'Pituitary Adenoma' },
    { id: 'benign-gynecomastia', name_tr: 'Jinekomasti Profilaksisi', name_en: 'Gynecomastia Prophylaxis' },
  ],
};

type QuickCaseCategoryId = 'thorax' | 'breast' | 'cns' | 'gus' | 'renal' | 'gis' | 'gynecology' | 'sarcoma-palliative' | 'emergencies';
type QuickCaseRegimen = 'clinical' | 'sbrt' | 'moderate' | 'sib' | 'conventional';
type QuickCasePreset = {
  id: string;
  category: QuickCaseCategoryId;
  title_tr: string;
  title_en: string;
  detail_tr: string;
  detail_en: string;
  badge?: string;
  organ: OrganId;
  subsite: string;
  t: string;
  n: string;
  m: string;
  histologyId?: string;
  regimen: QuickCaseRegimen;
};

interface ArchivedClinicalCase {
  id: string;
  savedAt: string;
  patientId: string;
  age: string;
  gender: string;
  diagnosis: string;
  stage: string;
  prescription: string;
  bed: string;
  eqd2: string;
}

const isArchivedClinicalCase = (value: unknown): value is ArchivedClinicalCase => {
  if (typeof value !== 'object' || value === null) return false;
  const record = value as Record<string, unknown>;
  return ['id', 'savedAt', 'patientId', 'age', 'gender', 'diagnosis', 'stage', 'prescription', 'bed', 'eqd2']
    .every(key => typeof record[key] === 'string');
};

interface CustomFavoriteCase {
  id: string;
  label: string;
  savedAt: string;
  organ: string;
  subsite: string;
  selectedT: string;
  selectedN: string;
  selectedM: string;
  selectedSchemeId: string;
  selectedRegimen: string;
  patientAgeYears: string;
  patientGender: string;
  patientId: string;
}

const isCustomFavoriteCase = (value: unknown): value is CustomFavoriteCase => {
  if (typeof value !== 'object' || value === null) return false;
  const record = value as Record<string, unknown>;
  return ['id', 'label', 'savedAt', 'organ', 'subsite', 'selectedT', 'selectedN', 'selectedM']
    .every(key => typeof record[key] === 'string');
};

type CommandPaletteItem =
  | { id: string; kind: 'organ'; title: string; subtitle: string; searchText: string; organ: OrganId; subsite: string; histologyId?: string }
  | { id: string; kind: 'protocol'; title: string; subtitle: string; searchText: string; preset: QuickCasePreset }
  | { id: string; kind: 'page'; title: string; subtitle: string; searchText: string; destination: 'references' | 'contact' | 'guidelines' };

const QUICK_CASE_PRESETS: QuickCasePreset[] = [
  { id: 'case-01', category: 'thorax', title_tr: 'Periferik erken evre KHDAK', title_en: 'Peripheral early-stage NSCLC', detail_tr: 'T1b N0 M0 â€¢ DIBH â€¢ SBRT 54 Gy / 3 fx', detail_en: 'T1b N0 M0 â€¢ DIBH â€¢ SBRT 54 Gy / 3 fx', organ: 'thorax', subsite: 'thorax-nsclc', t: 'T1b', n: 'N0', m: 'M0', histologyId: 'nsclc-adenocarcinoma', regimen: 'sbrt' },
  { id: 'case-02', category: 'thorax', title_tr: 'Lokal ileri KHDAK', title_en: 'Locally advanced NSCLC', detail_tr: 'Evre IIIA cT2 N2 M0 â€¢ EÅŸzamanlÄ± KRT 60 Gy + PACIFIC', detail_en: 'Stage IIIA cT2 N2 M0 â€¢ Concurrent CRT 60 Gy + PACIFIC', organ: 'thorax', subsite: 'thorax-nsclc', t: 'T2a', n: 'N2', m: 'M0', histologyId: 'nsclc-adenocarcinoma', regimen: 'clinical' },
  { id: 'case-03', category: 'thorax', title_tr: 'SÄ±nÄ±rlÄ± evre KHAK', title_en: 'Limited-stage SCLC', detail_tr: 'T2 N1 M0 â€¢ Turrisi akselere hiperfraksiyonasyon 1.5 Gy BID / 30 fx (â‰¥ 6 saat ara)', detail_en: 'T2 N1 M0 â€¢ Turrisi accelerated hyperfractionation 1.5 Gy BID / 30 fx (â‰¥ 6 hours apart)', organ: 'thorax', subsite: 'thorax-sclc', t: 'T2', n: 'N1', m: 'M0', regimen: 'clinical' },
  { id: 'case-04', category: 'thorax', title_tr: 'Timoma, Masaoka evre II', title_en: 'Thymoma, Masaoka stage II', detail_tr: 'R0 rezeksiyon â€¢ Adjuvan PORT 50 Gy', detail_en: 'R0 resection â€¢ Adjuvant PORT 50 Gy', organ: 'thorax', subsite: 'thorax-thymoma', t: 'Masaoka-II', n: 'N0', m: 'M0', histologyId: 'thymoma', regimen: 'clinical' },
  { id: 'case-05', category: 'breast', title_tr: 'Erken evre standart meme', title_en: 'Early-stage breast cancer', detail_tr: 'pT1c pN0 M0 â€¢ Postmenopoz â€¢ FAST-Forward 26 Gy / 5 fx', detail_en: 'pT1c pN0 M0 â€¢ Postmenopausal â€¢ FAST-Forward 26 Gy / 5 fx', organ: 'breast', subsite: 'breast-breast', t: 'T1c', n: 'N0', m: 'M0', histologyId: 'breast-nst', regimen: 'sbrt' },
  { id: 'case-06', category: 'breast', title_tr: 'YÃ¼ksek riskli lokal ileri PMRT', title_en: 'High-risk locally advanced PMRT', detail_tr: 'pT3 pN2a M0 â€¢ Mastektomi â€¢ GÃ¶ÄŸÃ¼s duvarÄ± + RNI 50 Gy / 25 fx', detail_en: 'pT3 pN2a M0 â€¢ Mastectomy â€¢ Chest wall + RNI 50 Gy / 25 fx', organ: 'breast', subsite: 'breast-breast', t: 'T3', n: 'N2', m: 'M0', histologyId: 'breast-nst', regimen: 'conventional' },
  { id: 'case-07', category: 'breast', title_tr: 'GenÃ§ hasta, MKC + SIB boost', title_en: 'Young patient, BCS + SIB boost', detail_tr: 'pT2 pN0 M0 â€¢ 38 yaÅŸ â€¢ WBRT 40.05 Gy + kavite SIB 48 Gy / 15 fx', detail_en: 'pT2 pN0 M0 â€¢ Age 38 â€¢ WBRT 40.05 Gy + cavity SIB 48 Gy / 15 fx', organ: 'breast', subsite: 'breast-breast', t: 'T2', n: 'N0', m: 'M0', histologyId: 'breast-nst', regimen: 'sib' },
  { id: 'case-08', category: 'cns', title_tr: 'Glioblastoma multiforme', title_en: 'Glioblastoma multiforme', detail_tr: 'WHO Grade 4, IDH-wt â€¢ KPS 90 â€¢ Stupp 60 Gy / 30 fx + TMZ', detail_en: 'WHO Grade 4, IDH-wt â€¢ KPS 90 â€¢ Stupp 60 Gy / 30 fx + TMZ', organ: 'cns', subsite: 'cns-glioma', t: 'Grade-4', n: 'N0', m: 'M0', histologyId: 'glioma-gbm', regimen: 'clinical' },
  { id: 'case-09', category: 'cns', title_tr: 'YÃ¼ksek riskli dÃ¼ÅŸÃ¼k dereceli gliom', title_en: 'High-risk low-grade glioma', detail_tr: 'WHO Grade 2 â€¢ 45 yaÅŸ â€¢ STR â€¢ RTOG 9802: 54 Gy + PCV', detail_en: 'WHO Grade 2 â€¢ Age 45 â€¢ STR â€¢ RTOG 9802: 54 Gy + PCV', organ: 'cns', subsite: 'cns-glioma', t: 'Grade-2', n: 'N0', m: 'M0', histologyId: 'glioma-astro', regimen: 'clinical' },
  { id: 'case-10', category: 'cns', title_tr: 'Oligometastatik beyin metastazÄ±', title_en: 'Oligometastatic brain metastases', detail_tr: '2 asemptomatik metastaz â€¢ Stereotaktik radyocerrahi 24 Gy', detail_en: '2 asymptomatic metastases â€¢ Stereotactic radiosurgery 24 Gy', organ: 'cns', subsite: 'cns-mets', t: 'Oligo', n: 'N0', m: 'M1', regimen: 'clinical' },
  { id: 'case-11', category: 'gus', title_tr: 'Orta-favorable risk prostat', title_en: 'Favorable intermediate-risk prostate cancer', detail_tr: 'cT2a â€¢ Gleason 3+4 â€¢ PSA 8.5 â€¢ CHHiP 60 Gy / 20 fx', detail_en: 'cT2a â€¢ Gleason 3+4 â€¢ PSA 8.5 â€¢ CHHiP 60 Gy / 20 fx', organ: 'prostate', subsite: 'prostate-prostate', t: 'T2a', n: 'N0', m: 'M0', histologyId: 'prostate-acinar', regimen: 'moderate' },
  { id: 'case-12', category: 'gus', title_tr: 'YÃ¼ksek risk prostat', title_en: 'High-risk prostate cancer', detail_tr: 'cT3a ECE+ â€¢ Gleason 4+4 â€¢ PSA 24 â€¢ Pelvik nodal + prostat 78 Gy + 24 ay ADT', detail_en: 'cT3a ECE+ â€¢ Gleason 4+4 â€¢ PSA 24 â€¢ Pelvic nodes + prostate 78 Gy + 24 months ADT', organ: 'prostate', subsite: 'prostate-prostate', t: 'T3a', n: 'N1', m: 'M0', histologyId: 'prostate-acinar', regimen: 'conventional' },
  { id: 'case-13', category: 'gus', title_tr: 'Kas invaziv mesane kanseri', title_en: 'Muscle-invasive bladder cancer', detail_tr: 'cT2 N0 M0 â€¢ Maksimal TURBT â€¢ Trimodalite KRT 64 Gy', detail_en: 'cT2 N0 M0 â€¢ Maximal TURBT â€¢ Trimodality chemoradiotherapy 64 Gy', organ: 'prostate', subsite: 'prostate-bladder', t: 'T2', n: 'N0', m: 'M0', histologyId: 'bladder-urothelial', regimen: 'clinical' },
  { id: 'case-14', category: 'gus', title_tr: 'Evre I testis seminom', title_en: 'Stage I testicular seminoma', detail_tr: 'OrÅŸiyektomi sonrasÄ± pT1 â€¢ Paraaortik elektif RT 20 Gy / 10 fx', detail_en: 'Post-orchiectomy pT1 â€¢ Elective para-aortic RT 20 Gy / 10 fx', organ: 'prostate', subsite: 'prostate-testis', t: 'I', n: 'N0', m: 'M0', histologyId: 'testis-seminoma', regimen: 'clinical' },
  { id: 'case-15', category: 'gis', title_tr: 'Lokal ileri rektum kanseri', title_en: 'Locally advanced rectal cancer', detail_tr: 'cT3c N1b M0 â€¢ RAPIDO kÄ±sa dÃ¶nem 5 Ã— 5 Gy + konsolidasyon KT / TNT', detail_en: 'cT3c N1b M0 â€¢ RAPIDO short-course 5 Ã— 5 Gy + consolidation chemotherapy / TNT', organ: 'gis', subsite: 'gis-Rektum', t: 'T3', n: 'N1', m: 'M0', regimen: 'clinical' },
  { id: 'case-16', category: 'gis', title_tr: 'Lokal ileri Ã¶zofagus kanseri', title_en: 'Locally advanced esophageal cancer', detail_tr: 'cT3 N1 M0 â€¢ CROSS neoadjuvan KRT 41.4 Gy + cerrahi', detail_en: 'cT3 N1 M0 â€¢ CROSS neoadjuvant CRT 41.4 Gy + surgery', organ: 'gis', subsite: 'gis-Ozofagus', t: 'T3', n: 'N1', m: 'M0', regimen: 'clinical' },
  { id: 'case-17', category: 'gis', title_tr: 'Anal kanal karsinomu', title_en: 'Anal canal carcinoma', detail_tr: 'cT2 N1 M0 â€¢ Nigro: Mitomisin-C + 5-FU + 50.4 Gy IMRT', detail_en: 'cT2 N1 M0 â€¢ Nigro: Mitomycin-C + 5-FU + 50.4 Gy IMRT', organ: 'gis', subsite: 'gis-anus', t: 'T2', n: 'N1', m: 'M0', regimen: 'clinical' },
  { id: 'case-18', category: 'gynecology', title_tr: 'Lokal ileri serviks kanseri', title_en: 'Locally advanced cervical cancer', detail_tr: 'FIGO IIIC1 (pelvik LN+) â€¢ EMBRACE II 45 Gy KRT + 3D IGABT', detail_en: 'FIGO IIIC1 (pelvic LN+) â€¢ EMBRACE II 45 Gy CRT + 3D IGABT', organ: 'gynecology', subsite: 'gynecology-Serviks', t: 'IIIA-IIIB', n: 'N1', m: 'M0', regimen: 'clinical' },
  { id: 'case-19', category: 'gynecology', title_tr: 'YÃ¼ksek-orta risk endometriyum', title_en: 'High-intermediate-risk endometrial cancer', detail_tr: 'PORTEC-2 Ã¶lÃ§Ã¼tleri â€¢ 68 yaÅŸ â€¢ Vajinal kaf brakiterapisi', detail_en: 'PORTEC-2 criteria â€¢ Age 68 â€¢ Vaginal cuff brachytherapy', organ: 'gynecology', subsite: 'gynecology-Endometriyum', t: 'IB', n: 'N0', m: 'M0', regimen: 'clinical' },
  { id: 'case-20', category: 'sarcoma-palliative', title_tr: 'Ekstremite yumuÅŸak doku sarkomu', title_en: 'Extremity soft-tissue sarcoma', detail_tr: 'YÃ¼ksek dereceli â€¢ Rezektabl â€¢ Preoperatif RT 50 Gy / 25 fx', detail_en: 'High grade â€¢ Resectable â€¢ Preoperative RT 50 Gy / 25 fx', organ: 'sarcoma', subsite: 'sarcoma-extremity', t: 'T2', n: 'N0', m: 'M0', regimen: 'clinical' },
  { id: 'case-21', category: 'sarcoma-palliative', title_tr: 'AÄŸrÄ±lÄ± kemik metastazÄ±', title_en: 'Painful bone metastasis', detail_tr: 'ASTRO â€¢ Tek fraksiyon 8 Gy analjezik RT', detail_en: 'ASTRO â€¢ Single-fraction 8 Gy palliative RT', organ: 'palliative', subsite: 'palliative-bone', t: 'Kemik', n: 'TekFx', m: 'M1', regimen: 'clinical' },
  { id: 'case-22', category: 'emergencies', title_tr: 'Spinal kord basÄ±sÄ± (MSCC)', title_en: 'Spinal cord compression (MSCC)', detail_tr: 'Deksametazon â€¢ Patchell cerrahi uygunluÄŸu â€¢ Acil RT 20 Gy / 5 fx', detail_en: 'Dexamethasone â€¢ Patchell surgical criteria â€¢ Emergency RT 20 Gy / 5 fx', organ: 'emergencies', subsite: 'emergency-mscc', t: 'Acil', n: 'N/A', m: 'M1', regimen: 'clinical' },
  { id: 'case-23', category: 'renal', title_tr: 'KÃ¼Ã§Ã¼k primer RCC (â‰¤4 cm, T1a) - FASTRACK II', title_en: 'Small Primary RCC (â‰¤4 cm, T1a) - FASTRACK II', detail_tr: 'Medikal inoperabl â€¢ 26 Gy / 1 fx â€¢ Ablatif primer SABR', detail_en: 'Medically inoperable â€¢ 26 Gy / 1 fx â€¢ Ablative primary SABR', organ: 'prostate', subsite: 'prostate-kidney', t: 'T1a', n: 'N0', m: 'M0', histologyId: 'renal-clear-cell', regimen: 'sbrt' },
  { id: 'case-24', category: 'renal', title_tr: 'BÃ¼yÃ¼k primer RCC (>4â€“10 cm, T1bâ€“T2) - FASTRACK II', title_en: 'Larger Primary RCC (>4â€“10 cm, T1bâ€“T2) - FASTRACK II', detail_tr: 'Ã–rnek Ã§ap 8 cm â€¢ cT2 N0 M0 â€¢ 42 Gy / 3 fx', detail_en: 'Example 8 cm diameter â€¢ cT2 N0 M0 â€¢ 42 Gy / 3 fx', organ: 'prostate', subsite: 'prostate-kidney', t: 'T2', n: 'N0', m: 'M0', histologyId: 'renal-clear-cell', regimen: 'sbrt' },
  { id: 'case-25', category: 'renal', title_tr: 'Oligometastatik / RekÃ¼rren RCC', title_en: 'Oligometastatic / Recurrent RCC', detail_tr: 'SeÃ§ilmiÅŸ olguda SBRT 30â€“40 Gy / 5 fx (Ã¶rnek 35 Gy / 5 fx)', detail_en: 'SBRT 30â€“40 Gy / 5 fx in selected cases (example: 35 Gy / 5 fx)', organ: 'prostate', subsite: 'prostate-kidney', t: 'T1a', n: 'N0', m: 'M1', histologyId: 'renal-clear-cell', regimen: 'sbrt' },
  { id: 'case-26', category: 'gus', title_tr: 'Prostat ultra-hipofraksiyonasyon (SBRT)', title_en: 'Ultra-hypofractionated prostate SBRT', detail_tr: 'ElveriÅŸli orta risk â€¢ 36.25 Gy / 5 fx', detail_en: 'Favorable intermediate risk â€¢ 36.25 Gy / 5 fx', organ: 'prostate', subsite: 'prostate-prostate', t: 'T2a', n: 'N0', m: 'M0', histologyId: 'prostate-acinar', regimen: 'sbrt' },
  { id: 'case-27', category: 'gus', title_tr: 'YÃ¼ksek riskli prostat SIB', title_en: 'High-risk prostate SIB', detail_tr: '70 Gy prostata / 56 Gy pelvik nodlara â€¢ 28 fx', detail_en: '70 Gy to prostate / 56 Gy to pelvic nodes â€¢ 28 fx', organ: 'prostate', subsite: 'prostate-prostate', t: 'T3a', n: 'N1', m: 'M0', histologyId: 'prostate-acinar', regimen: 'sib' },
];

type GuidedStep = 1 | 2 | 3 | 4;

const GUIDED_QUICK_SCENARIOS: Partial<Record<string, { title_tr: string; title_en: string }>> = {
  'case-05': {
    title_tr: 'Erken Evre MKC SonrasÄ± (FAST-Forward 26 Gy/5 fx)',
    title_en: 'Early-stage Post-BCS (FAST-Forward 26 Gy/5fx)',
  },
  'case-06': {
    title_tr: 'YÃ¼ksek Riskli Mastektomi SonrasÄ± (PMRT)',
    title_en: 'High-risk Postmastectomy (PMRT)',
  },
  'case-01': {
    title_tr: 'Erken Periferik KHDAK (SBRT 54 Gy/3 fx)',
    title_en: 'Early Peripheral NSCLC (SBRT 54 Gy/3fx)',
  },
  'case-02': {
    title_tr: 'Lokal Ä°leri Evre III (EÅŸzamanlÄ± KRT)',
    title_en: 'Locally Advanced Stage III (Concurrent CRT)',
  },
  'case-11': {
    title_tr: 'ElveriÅŸli Orta Risk (60 Gy/20 fx Orta HipoFraksiyonasyon)',
    title_en: 'Favorable Intermediate (Moderate Hypofractionation 60 Gy/20fx)',
  },
  'case-12': {
    title_tr: 'YÃ¼ksek Risk (78 Gy + Uzun SÃ¼reli ADT)',
    title_en: 'High-Risk (78 Gy + Long-term ADT)',
  },
  'case-23': {
    title_tr: 'KÃ¼Ã§Ã¼k Primer RCC (â‰¤4 cm, T1a) - FASTRACK II',
    title_en: 'Small Primary RCC (â‰¤4 cm, T1a) - FASTRACK II',
  },
  'case-24': {
    title_tr: 'BÃ¼yÃ¼k Primer RCC (>4â€“10 cm, T1bâ€“T2) - FASTRACK II',
    title_en: 'Larger Primary RCC (>4â€“10 cm, T1bâ€“T2) - FASTRACK II',
  },
  'case-25': {
    title_tr: 'Oligometastatik / RekÃ¼rren RCC',
    title_en: 'Oligometastatic / Recurrent RCC',
  },
  'case-26': {
    title_tr: 'Ultra-hipofraksiyone Prostat SBRT (36.25 Gy/5 fx)',
    title_en: 'Ultra-hypofractionated Prostate SBRT (36.25 Gy/5fx)',
  },
  'case-27': {
    title_tr: 'YÃ¼ksek Riskli Prostat SIB (70/56 Gy/28 fx)',
    title_en: 'High-Risk Prostate SIB (70/56 Gy/28fx)',
  },
};

const BENIGN_CLINICAL_OPTIONS: Record<string, { value: string; label: string }[]> = {
  'benign-ho': [
    { value: 'preop', label: 'Preoperatif ilk 4 saat' },
    { value: 'postop-24h', label: 'Cerrahi sonrasÄ± <24 saat' },
    { value: 'postop-48h', label: '24-48 saat arasÄ±' },
    { value: 'late', label: '>72 saat - geÃ§ baÅŸvuru' },
  ],
  'benign-keloid': [
    { value: 'postop-24h', label: 'Cerrahi sonrasÄ± <24 saat' },
    { value: 'postop-48h', label: '24-48 saat arasÄ±' },
    { value: 'late', label: '>72 saat - geÃ§ baÅŸvuru' },
  ],
  'benign-gynecomastia': [
    { value: 'prophylaxis', label: 'Antiandrojen tedavisi Ã¶ncesi profilaksi' },
    { value: 'symptomatic', label: 'AÄŸrÄ±lÄ± / yerleÅŸik jinekomasti' },
  ],
  'benign-pituitary': [
    { value: 'functional', label: 'Fonksiyonel adenom' },
    { value: 'nonfunctional', label: 'Non-fonksiyonel adenom' },
    { value: 'chiasm-close', label: 'Optik kiazmaya komÅŸu (<2 mm)' },
  ],
  'benign-dupuytren': [
    { value: 'tubiana-n', label: 'Tubiana Evre N (Palmar nodÃ¼l)' },
    { value: 'tubiana-ni', label: 'Evre N/I (Kordon)' },
    { value: 'advanced', label: 'Ä°leri kontraktÃ¼r (cerrahi Ã¶ncelikli)' },
  ],
  'benign-ledderhose': [
    { value: 'tubiana-n', label: 'Erken nodÃ¼l evresi' },
    { value: 'tubiana-ni', label: 'NodÃ¼l / kordon evresi' },
    { value: 'advanced', label: 'Ä°leri kontraktÃ¼r (cerrahi Ã¶ncelikli)' },
  ],
  'benign-jinekomasti': [
    { value: 'prophylaxis', label: 'Antiandrojen tedavi Ã¶ncesi profilaksi' },
    { value: 'symptomatic', label: 'Semptomatik / yerleÅŸik jinekomasti' },
  ],
  'benign-topuk-dikeni': [
    { value: 'primary', label: 'Primer tedavi (0.5 Gy Ã— 6)' },
    { value: 'repeat', label: 'NÃ¼ks / 2. seri (6-12 hafta sonra)' },
  ],
  'benign-epikondilit': [
    { value: 'primary', label: 'Primer tedavi (0.5 Gy Ã— 6)' },
    { value: 'repeat', label: 'NÃ¼ks / 2. seri (6-12 hafta sonra)' },
  ],
  'benign-omuz': [
    { value: 'primary', label: 'Primer tedavi (0.5 Gy Ã— 6)' },
    { value: 'repeat', label: 'NÃ¼ks / 2. seri (6-12 hafta sonra)' },
  ],
  'benign-artroz': [
    { value: 'primary', label: 'Primer tedavi (0.5 Gy Ã— 6)' },
    { value: 'repeat', label: 'NÃ¼ks / 2. seri (6-12 hafta sonra)' },
  ],
  'benign-graves': [
    { value: 'active', label: 'Aktif orta-aÄŸÄ±r orbitopati' },
    { value: 'fibrotic', label: 'Ä°naktif / fibrotik hastalÄ±k' },
  ],
  'benign-trigeminal': [
    { value: 'refractory', label: 'Medikal tedaviye direnÃ§li trigeminal nevralji' },
  ],
  'benign-schwannom': [
    { value: 'small', label: 'KÃ¼Ã§Ã¼k / orta hacimli tÃ¼mÃ¶r - SRS' },
    { value: 'large', label: 'BÃ¼yÃ¼k tÃ¼mÃ¶r / beyin sapÄ± basÄ±sÄ± - FSRT deÄŸerlendirme' },
  ],
  'benign-avm': [
    { value: 'low-grade', label: 'Spetzler-Martin I-II / kÃ¼Ã§Ã¼k nidus' },
    { value: 'high-grade', label: 'Spetzler-Martin III-V / kompleks nidus' },
  ],
};

export interface TNMOption {
  code: string;
  label: string;
  criterion: string;
}

export interface TCPTargetVolume {
  name: string;
  doseGy: number;
  marginMm: string;
  anatomical: string;
}

export interface TCPTargetPrescription {
  totalDoseGy: number;
  fractionCount: number;
  fractionDoseGy: number;
  targetVolumes: TCPTargetVolume[];
}

export type TargetVolume = TCPTargetVolume;

export interface OARNTPCeiling {
  organ: string;
  metric: string;
  limit: string;
  source: string;
  context?: string;
  contextEn?: string;
  classification?: 'protocol-limit' | 'planning-aim' | 'dose-volume-reference' | 'context-note';
}

export type OARConstraint = OARNTPCeiling;

export interface DoseScheme extends TCPTargetPrescription {
  id: string;
  name: string;
  tag: string;
  alphaBeta: number;
  technique: string;
  indication: string;
  oars: OARNTPCeiling[];
  systemicTherapy?: string;
  evidence: string;
}

const getVerifiedOarGuidance = (organ: OrganId, subsite: string, scheme: DoseScheme, lang: 'en' | 'tr'): OARNTPCeiling[] => {
  const conventionalFractionation = scheme.fractionCount >= 15 && scheme.fractionDoseGy <= 2.1;
  const hasPelvicNodalTarget = scheme.targetVolumes.some(volume =>
    /pelvic|pelvis|pelvik|nodal|lenf nod/i.test(`${volume.name} ${volume.anatomical}`)
  );

  if ((organ === 'sarcoma' || organ === 'bone-sarcoma')
    && scheme.id === 'sarcoma-preop-50'
    && (subsite === 'sarcoma-extremity' || subsite === 'bone-sarcoma-Yumusak_Doku')) {
    return [{
      organ: 'Longitudinal skin/subcutaneous strip',
      metric: 'V20Gy',
      limit: 'â‰¤ 50% of strip receives 20 Gy',
      source: 'RTOG 0630 (2015), DOI: 10.1200/JCO.2014.58.5828',
      context: 'YalnÄ±zca ekstremite yumuÅŸak doku sarkomunda preoperatif RT; protokol talimatÄ±.',
      contextEn: 'Preoperative extremity soft-tissue sarcoma only; protocol-specific instruction.',
      classification: 'protocol-limit',
    }];
  }

  if (organ === 'thorax' && conventionalFractionation) {
    return [
      {
        organ: 'Bilateral akciÄŸer (GTV hariÃ§)',
        metric: 'V20Gy',
        limit: '< 30â€“35%',
        source: 'QUANTEC lung (2010), DOI: 10.1016/j.ijrobp.2009.06.091',
        context: 'Konvansiyonel toraks RT; SBRT iÃ§in kullanÄ±lmaz.',
        contextEn: 'Conventional thoracic RT; not for SBRT.',
        classification: 'dose-volume-reference',
      },
      {
        organ: 'Bilateral akciÄŸer (GTV hariÃ§)',
        metric: 'Dmean',
        limit: '< 20 Gy',
        source: 'QUANTEC lung (2010), DOI: 10.1016/j.ijrobp.2009.06.091',
        context: 'Konvansiyonel toraks RT; plan ve hasta faktÃ¶rlerine gÃ¶re deÄŸerlendirilir.',
        contextEn: 'Conventional thoracic RT; interpret with plan and patient factors.',
        classification: 'dose-volume-reference',
      },
      {
        organ: 'Ã–zofagus',
        metric: 'Dmean',
        limit: '< 34 Gy',
        source: 'QUANTEC esophageal toxicity review (2010)',
        context: 'Konvansiyonel toraks RT; doz-hacim iliÅŸkisini ve eÅŸzamanlÄ± tedaviyi birlikte deÄŸerlendirin.',
        contextEn: 'Conventional thoracic RT; consider dose-volume exposure and concurrent treatment.',
        classification: 'dose-volume-reference',
      },
      {
        organ: 'Kalp',
        metric: 'Dmean / V30',
        limit: 'Dmean < 20 Gy; V30 < 46%',
        source: 'QUANTEC cardiac review (2010), DOI: 10.1016/j.ijrobp.2009.04.093',
        context: 'Kardiyak doz mÃ¼mkÃ¼n olduÄŸunca azaltÄ±lmalÄ±; hasta ve plan baÄŸlamÄ±nda yorumlayÄ±n.',
        contextEn: 'Minimize cardiac dose and interpret in the context of the patient and plan.',
        classification: 'dose-volume-reference',
      },
      {
        organ: 'Brakiyal pleksus',
        metric: 'Dmax',
        limit: '< 66 Gy',
        source: 'QUANTEC / thoracic RT planning reference',
        context: 'Konvansiyonel fraksiyonasyon; yeniden Ä±ÅŸÄ±nlama ve fraksiyonasyon deÄŸiÅŸikliÄŸinde sÄ±nÄ±rÄ± doÄŸrudan aktarmayÄ±n.',
        contextEn: 'Conventional fractionation; do not transfer this limit directly to re-irradiation or altered fractionation.',
        classification: 'dose-volume-reference',
      },
      {
        organ: 'Spinal kord',
        metric: 'Dmax',
        limit: 'â‰¤ 50 Gy',
        source: 'QUANTEC spinal cord (2010); conventional fractionation',
        context: 'Konvansiyonel fraksiyonasyon; kord PRV ve yeniden Ä±ÅŸÄ±nlama iÃ§in protokol doÄŸrulamasÄ± gerekir.',
        contextEn: 'Conventional fractionation; verify protocol for cord PRV and re-irradiation.',
        classification: 'dose-volume-reference',
      },
    ];
  }

  if (organ === 'prostate' && subsite === 'prostate-prostate' && conventionalFractionation) {
    const rows: OARNTPCeiling[] = [
      {
        organ: 'Rektum',
        metric: 'V70Gy / V65Gy / V50Gy',
        limit: '< 20% / < 25% / < 50%',
        source: 'QUANTEC rectum (2010), DOI: 10.1016/j.ijrobp.2009.11.003',
        context: 'Konvansiyonel prostat RT DVH referansÄ±; PACE-B SBRT iÃ§in uygulanmaz.',
        contextEn: 'Conventional prostate RT DVH reference; not applicable to PACE-B SBRT.',
        classification: 'dose-volume-reference',
      },
      {
        organ: 'Mesane',
        metric: 'V70Gy / V65Gy',
        limit: '< 35% / < 50%',
        source: 'QUANTEC bladder (2010), conventional fractionation',
        context: 'Konvansiyonel prostat RT; seÃ§ilen protokol ve kontur tanÄ±mÄ±yla doÄŸrulanmalÄ±dÄ±r.',
        contextEn: 'Conventional prostate RT; verify against the selected protocol and contour definition.',
        classification: 'dose-volume-reference',
      },
    ];
    if (hasPelvicNodalTarget) {
      rows.push({
        organ: 'Peritoneal cavity / bowel bag',
        metric: 'V45Gy',
        limit: '< 195 cc',
        source: 'QUANTEC small bowel (2010), DOI: 10.1016/j.ijrobp.2009.05.074',
        context: 'YalnÄ±zca peritoneal boÅŸluk/bowel bag konturu iÃ§in; tek tek baÄŸÄ±rsak ansÄ± limiti deÄŸildir.',
        contextEn: 'For the peritoneal cavity/bowel-bag contour only; not an individual bowel-loop limit.',
        classification: 'dose-volume-reference',
      });
    }
    return rows;
  }

  if (organ === 'breast') {
    return [{
      organ: 'Kalp / LAD / ipsilateral akciÄŸer / kontralateral meme',
      metric: 'Plan-specific DVH review',
      limit: 'Dose minimization; no universal numerical threshold verified',
      source: 'Darby et al. (NEJM 2013), DOI: 10.1056/NEJMoa1209825; ESTRO-ACROP (2023)',
      context: 'Laterality, chest-wall/RNI fields and DIBH affect achievable dose; report the plan DVH.',
      contextEn: 'Laterality, chest-wall/RNI fields and DIBH affect achievable dose; review the plan DVH.',
      classification: 'planning-aim',
    }];
  }

  if (organ === 'gis' && conventionalFractionation && ['gis-Rektum', 'gis-anus'].includes(subsite)) {
    return [
      {
        organ: 'Peritoneal cavity / bowel bag',
        metric: 'V45Gy',
        limit: '< 195 cc',
        source: 'QUANTEC small bowel (2010), DOI: 10.1016/j.ijrobp.2009.05.074',
        context: 'Konvansiyonel pelvik RT; bowel bag/peritoneal cavity konturu iÃ§in.',
        contextEn: 'Conventional pelvic RT; for the bowel-bag/peritoneal-cavity contour.',
        classification: 'dose-volume-reference',
      },
      {
        organ: 'Individual small-bowel loops',
        metric: 'V15Gy',
        limit: '< 120 cc',
        source: 'QUANTEC small bowel (2010), DOI: 10.1016/j.ijrobp.2009.05.074',
        context: 'Konvansiyonel pelvik RT; tek tek baÄŸÄ±rsak anslarÄ± iÃ§in, bowel bag ile karÄ±ÅŸtÄ±rÄ±lmamalÄ±dÄ±r.',
        contextEn: 'Conventional pelvic RT; individual loops, not interchangeable with the bowel bag.',
        classification: 'dose-volume-reference',
      },
    ];
  }

  if (organ === 'gis' && subsite === 'gis-Karaciger' && scheme.fractionCount === 5) {
    return [
      {
        organ: lang === 'tr' ? 'SaÄŸlam karaciÄŸer (toplam karaciÄŸer - GTV)' : 'Uninvolved liver (total liver minus GTV)',
        metric: lang === 'tr' ? 'KorunmuÅŸ hacim eÅŸiÄŸi (V15Gy)' : 'Spared-volume threshold (V15Gy)',
        limit: lang === 'tr' ? 'En az 700 cc, â‰¤15 Gy doz almalÄ±' : 'At least 700 cc should receive â‰¤15 Gy',
        source: 'NRG/RTOG 1112 protocol; eviQ hepatic metastases SABR protocol',
        context: lang === 'tr'
          ? 'BeÅŸ fraksiyonlu karaciÄŸer SBRT; baÅŸlangÄ±Ã§ karaciÄŸer fonksiyonu ve Ã¶nceki karaciÄŸer tedavilerini deÄŸerlendirin.'
          : 'Five-fraction liver SBRT; assess baseline liver function and prior liver-directed treatment.',
        contextEn: 'Five-fraction liver SBRT; assess baseline liver function and prior liver-directed treatment.',
        classification: 'protocol-limit',
      },
      {
        organ: lang === 'tr' ? 'Mide / duodenum' : 'Stomach / duodenum',
        metric: 'D0.5cc',
        limit: lang === 'tr' ? 'â‰¤30 Gy (5 fraksiyon referansÄ±; seÃ§ilen protokolÃ¼ doÄŸrulayÄ±n)' : 'â‰¤30 Gy (5-fraction reference; verify selected protocol)',
        source: 'eviQ hepatic metastases stereotactic EBRT protocol',
        context: 'Ä°lgili organa ve fraksiyonasyona Ã¶zgÃ¼ DVH kÄ±sÄ±tlarÄ±nÄ± kullanÄ±n; gerekirse reÃ§ete dozunu azaltÄ±n.',
        contextEn: 'Use the relevant organ-specific and fractionation-specific DVH constraints; reduce prescription if needed.',
        classification: 'dose-volume-reference',
      },
    ];
  }

  if (organ === 'gis' && subsite === 'gis-SafraYollari') {
    return [{
      organ: lang === 'tr' ? 'Mide / duodenum / ince baÄŸÄ±rsak / santral safra yollarÄ±' : 'Stomach / duodenum / small bowel / central bile ducts',
      metric: lang === 'tr' ? 'Fraksiyon ve alt bÃ¶lgeye Ã¶zgÃ¼ doz-hacim sÄ±nÄ±rlarÄ±' : 'Fraction- and site-specific dose-volume limits',
      limit: lang === 'tr' ? 'SeÃ§ilen protokolÃ¼ kullanÄ±n; evrensel biliyer SBRT eÅŸiÄŸi yoktur' : 'Use the selected protocol; no universal biliary SBRT threshold',
      source: 'SWOG S0809 (JCO 2015), DOI: 10.1200/JCO.2014.60.2219; RTOG upper-abdominal atlas',
      context: 'Ä°ntrahepatik, perihiler, distal ve safra kesesi yataÄŸÄ± hedeflerinde anatomi ve OAR kÄ±sÄ±tlarÄ± farklÄ±dÄ±r.',
      contextEn: 'Anatomy and organ-at-risk limits differ for intrahepatic, perihilar, distal and gallbladder-bed targets.',
      classification: 'context-note',
    }];
  }

  if (organ === 'prostate' && subsite === 'prostate-kidney') {
    if (scheme.id === 'rcc-primary-42-3') {
      return [
        {
          organ: lang === 'tr' ? 'Kontralateral bÃ¶brek' : 'Contralateral kidney',
          metric: 'Dmean',
          limit: lang === 'tr' ? 'â‰¤8 Gy (eviQ 3 fraksiyon referansÄ±)' : 'â‰¤8 Gy (3-fraction eviQ reference)',
          source: 'eviQ renal cell carcinoma definitive stereotactic EBRT protocol',
          context: 'Renal fonksiyonu koruyun; baÅŸlangÄ±Ã§ eGFR, tek bÃ¶brek ve Ã¶nceki renal tedaviye gÃ¶re bireyselleÅŸtirin.',
          contextEn: 'Preserve renal function; individualise for baseline eGFR, solitary kidney and prior renal treatment.',
          classification: 'dose-volume-reference',
        },
        {
          organ: lang === 'tr' ? 'BaÄŸÄ±rsak / duodenum' : 'Bowel / duodenum',
          metric: 'D0.03cc',
          limit: lang === 'tr' ? 'â‰¤30 Gy (eviQ 3 fraksiyon referansÄ±)' : 'â‰¤30 Gy (3-fraction eviQ reference)',
          source: 'eviQ renal cell carcinoma definitive stereotactic EBRT protocol',
          context: 'Noktasal maksimum D0.5cc veya Dmax ile eÅŸdeÄŸer deÄŸildir; gÃ¼ncel protokolÃ¼n tam metriÄŸini uygulayÄ±n.',
          contextEn: 'Point maximum is not interchangeable with D0.5cc or Dmax; apply the exact current protocol.',
          classification: 'dose-volume-reference',
        },
        {
          organ: lang === 'tr' ? 'Spinal kord' : 'Spinal cord',
          metric: lang === 'tr' ? 'Fraksiyona Ã¶zgÃ¼ kÃ¼Ã§Ã¼k hacim kÄ±sÄ±tÄ±' : 'Fraction-specific small-volume constraint',
          limit: lang === 'tr' ? 'GÃ¼ncel renal SBRT protokolÃ¼nÃ¼ kullanÄ±n; genel bir deÄŸer verilmemiÅŸtir' : 'Use current renal SBRT protocol; no generic value asserted',
          source: 'eviQ renal cell carcinoma definitive stereotactic EBRT protocol; AAPM TG-101',
          context: 'BaÅŸka bir protokol veya kontur tanÄ±mÄ±ndaki 3 fraksiyon sÄ±nÄ±rÄ±nÄ± ikame etmeyin.',
          contextEn: 'Do not substitute a three-fraction limit from another protocol or contour definition.',
          classification: 'context-note',
        },
      ];
    }
    return [{
      organ: lang === 'tr' ? 'Kalan bÃ¶brek / baÄŸÄ±rsak / spinal kord' : 'Remaining kidney / bowel / spinal cord',
      metric: lang === 'tr' ? 'Fraksiyona Ã¶zgÃ¼ doz-hacim sÄ±nÄ±rlarÄ±' : 'Fraction-specific dose-volume limits',
      limit: lang === 'tr' ? 'SeÃ§ilen FASTRACK II veya oligometastatik SBRT protokolÃ¼nÃ¼ kullanÄ±n' : 'Use the selected FASTRACK II or oligometastatic SBRT protocol',
      source: 'FASTRACK II (Lancet Oncol 2024), DOI: 10.1016/S1470-2045(24)00020-2; eviQ renal SABR protocol',
      context: 'Tek fraksiyon primer SABR ve 3â€“5 fraksiyon metastaz SBRT kÄ±sÄ±tlarÄ± farklÄ±dÄ±r.',
      contextEn: 'Single-fraction primary SABR and 3â€“5 fraction metastasis SBRT have different constraints.',
      classification: 'context-note',
    }];
  }

  if (organ === 'thorax' && scheme.fractionCount <= 5) {
    return [
      {
        organ: 'Proksimal bronÅŸ aÄŸacÄ±',
        metric: 'Dmax',
        limit: '< 105% of prescription',
        source: 'AAPM TG-101; HyTEC thoracic SBRT',
        context: 'Merkezi/ultramerkezi SBRT iÃ§in seÃ§ilen fraksiyon protokolÃ¼yle doÄŸrulayÄ±n.',
        contextEn: 'Verify against the selected fractionation protocol for central/ultracentral SBRT.',
        classification: 'protocol-limit',
      },
      {
        organ: 'GÃ¶ÄŸÃ¼s duvarÄ± / kaburga',
        metric: 'V30Gy',
        limit: '< 30 cc',
        source: 'AAPM TG-101; HyTEC thoracic SBRT',
        context: 'SBRT doz-hacim hedefi; reÃ§ete ve fraksiyon sayÄ±sÄ±yla birlikte deÄŸerlendirin.',
        contextEn: 'SBRT dose-volume objective; interpret with prescription and fraction count.',
        classification: 'protocol-limit',
      },
      {
        organ: 'Ã–zofagus',
        metric: 'Fraksiyona Ã¶zgÃ¼ doz-hacim metriÄŸi',
        limit: 'SeÃ§ilen SBRT protokolÃ¼ne gÃ¶re doÄŸrulayÄ±n',
        source: 'AAPM TG-101; HyTEC thoracic SBRT',
        context: 'Konvansiyonel Dmean eÅŸiÄŸi SBRT iÃ§in kullanÄ±lamaz.',
        contextEn: 'The conventional-fractionation Dmean threshold is not applicable to SBRT.',
        classification: 'context-note',
      },
      {
        organ: 'Kalp',
        metric: 'Fraksiyona Ã¶zgÃ¼ doz-hacim metriÄŸi',
        limit: 'Dozu ALARA; seÃ§ilen SBRT protokolÃ¼nÃ¼ doÄŸrulayÄ±n',
        source: 'AAPM TG-101; HyTEC thoracic SBRT',
        context: 'Konvansiyonel Dmean/V30 eÅŸikleri SBRT iÃ§in doÄŸrudan kullanÄ±lmamalÄ±dÄ±r.',
        contextEn: 'Conventional Dmean/V30 thresholds should not be transferred directly to SBRT.',
        classification: 'context-note',
      },
    ];
  }

  if (organ === 'cns') {
    return [
      {
        organ: 'Koklea',
        metric: 'Dmean / SRS Dmax',
        limit: 'Dmean < 45 Gy; SRS Dmax < 9 Gy',
        source: 'QUANTEC head-and-neck review (2010), PubMed 20171519; AAPM TG-101',
        context: 'SRS sÄ±nÄ±rÄ± fraksiyon sayÄ±sÄ± ve kontur tanÄ±mÄ±yla doÄŸrulanmalÄ±dÄ±r.',
        contextEn: 'Verify SRS limits against fraction count and contour definition.',
        classification: 'dose-volume-reference',
      },
      {
        organ: 'Hipofiz',
        metric: 'Dmax',
        limit: '< 54 Gy',
        source: 'QUANTEC head-and-neck review (2010), PubMed 20171519',
        context: 'Konvansiyonel fraksiyonasyon iÃ§in referans; SRS ve yeniden Ä±ÅŸÄ±nlama iÃ§in ayrÄ± protokol gerekir.',
        contextEn: 'Conventional-fractionation reference; use a separate protocol for SRS and re-irradiation.',
        classification: 'dose-volume-reference',
      },
      {
        organ: 'Optik sinirler / kiazma',
        metric: 'Dmax / SRS Dmax',
        limit: 'Dmax < 54 Gy; SRS < 8-10 Gy',
        source: 'QUANTEC head-and-neck review (2010), PubMed 20171519; AAPM TG-101',
        context: 'SRS eÅŸiÄŸi fraksiyon sayÄ±sÄ±na gÃ¶re seÃ§ilmelidir.',
        contextEn: 'Select the SRS limit according to fraction count.',
        classification: 'dose-volume-reference',
      },
      {
        organ: 'Hipokampus (HA-WBRT)',
        metric: 'D100% / Dmax',
        limit: 'D100% â‰¤ 9 Gy; Dmax â‰¤ 16 Gy',
        source: 'NRG CC001 hippocampal-avoidance WBRT trial',
        context: 'YalnÄ±zca hipokampus korumalÄ± WBRT planlamasÄ±nda; hedef kapsamÄ± ve protokol uygunsa.',
        contextEn: 'For hippocampal-avoidance WBRT only, when target coverage and protocol permit.',
        classification: 'protocol-limit',
      },
      {
        organ: 'Lens',
        metric: 'Dmax',
        limit: '< 7 Gy',
        source: 'QUANTEC head-and-neck review (2010), PubMed 20171519',
        context: 'Lens konturu ve tedavi geometrisine gÃ¶re doz minimizasyonu.',
        contextEn: 'Minimize dose based on lens contour and treatment geometry.',
        classification: 'planning-aim',
      },
      {
        organ: 'Retina',
        metric: 'Dmax',
        limit: '< 45 Gy',
        source: 'QUANTEC head-and-neck review (2010), PubMed 20171519',
        context: 'Konvansiyonel fraksiyonasyon referansÄ±; gÃ¶z yapÄ±larÄ±nÄ±n konturlarÄ± doÄŸrulanmalÄ±dÄ±r.',
        contextEn: 'Conventional-fractionation reference; verify ocular structure contours.',
        classification: 'dose-volume-reference',
      },
    ];
  }

  if (organ === 'head-neck' && conventionalFractionation) {
    return [
      {
        organ: 'Beyin sapÄ±',
        metric: 'Dmax',
        limit: 'â‰¤ 54 Gy',
        source: 'QUANTEC brainstem (2010), DOI: 10.1016/j.ijrobp.2009.07.1753',
        context: 'Konvansiyonel fraksiyonasyon; D1cc kÃ¼Ã§Ã¼k-hacim Ã¶lÃ§Ã¼tÃ¼yle aynÄ± deÄŸildir.',
        contextEn: 'Conventional fractionation; not interchangeable with a D1cc small-volume metric.',
        classification: 'dose-volume-reference',
      },
      {
        organ: 'Optik sinirler / kiazma',
        metric: 'Dmax',
        limit: 'â‰¤ 55 Gy',
        source: 'QUANTEC head-and-neck review (2010), PubMed 20171519',
        context: 'Konvansiyonel fraksiyonasyon; PRV limitleri seÃ§ilen protokole baÄŸlÄ±dÄ±r.',
        contextEn: 'Conventional fractionation; PRV limits depend on the selected protocol.',
        classification: 'dose-volume-reference',
      },
      {
        organ: 'Parotis (en az bir bez)',
        metric: 'Dmean',
        limit: '< 26 Gy',
        source: 'QUANTEC parotid (2010), DOI: 10.1016/j.ijrobp.2009.06.090',
        context: 'Konvansiyonel baÅŸ-boyun RT; hedef kapsamÄ± ve bez konturu dikkate alÄ±nÄ±r.',
        contextEn: 'Conventional head-and-neck RT; consider target coverage and gland contour.',
        classification: 'dose-volume-reference',
      },
      {
        organ: 'Mandibula',
        metric: 'Dmax',
        limit: '< 70 Gy',
        source: 'Head-and-neck planning reference; verify institutional protocol',
        context: 'DiÅŸ saÄŸlÄ±ÄŸÄ±, cerrahi, hedef komÅŸuluÄŸu ve fraksiyonasyona gÃ¶re planÄ± doÄŸrulayÄ±n.',
        contextEn: 'Verify with dental status, surgery, target proximity and fractionation.',
        classification: 'planning-aim',
      },
      {
        organ: 'Tiroid',
        metric: 'V30Gy',
        limit: '< 50%',
        source: 'Head-and-neck planning reference',
        context: 'Tiroid fonksiyon takibi ve baÅŸlangÄ±Ã§ durumu dikkate alÄ±nmalÄ±dÄ±r.',
        contextEn: 'Consider baseline thyroid function and follow-up.',
        classification: 'planning-aim',
      },
      {
        organ: 'Oral kavite',
        metric: 'Dmean',
        limit: '< 35 Gy',
        source: 'QUANTEC head-and-neck review (2010), PubMed 20171519',
        context: 'Hedef kapsamÄ± ve aÄŸÄ±z boÅŸluÄŸu kontur tanÄ±mÄ±yla birlikte yorumlayÄ±n.',
        contextEn: 'Interpret with target coverage and oral-cavity contour definition.',
        classification: 'planning-aim',
      },
      {
        organ: 'Faringeal konstriktÃ¶rler (PCM)',
        metric: 'Dmean',
        limit: '< 50 Gy',
        source: 'QUANTEC head-and-neck review (2010), PubMed 20171519',
        context: 'Disfaji riskini azaltma hedefi; ilgili konstriktÃ¶r alt yapÄ±larÄ±nÄ±n konturunu doÄŸrulayÄ±n.',
        contextEn: 'Dysphagia-reduction objective; verify contours of relevant constrictor substructures.',
        classification: 'planning-aim',
      },
      {
        organ: 'Larenks',
        metric: 'Dmean',
        limit: '< 45 Gy',
        source: 'QUANTEC head-and-neck review (2010), PubMed 20171519',
        context: 'Hedef kapsamÄ± ve fonksiyonel larenks hacmine gÃ¶re planÄ± deÄŸerlendirin.',
        contextEn: 'Evaluate with target coverage and functional larynx volume.',
        classification: 'planning-aim',
      },
      {
        organ: 'Submandibular / parotis bezleri',
        metric: 'Dmean',
        limit: '< 26 Gy',
        source: 'QUANTEC parotid (2010), DOI: 10.1016/j.ijrobp.2009.06.090',
        context: 'En az bir bezin korunmasÄ±, tÃ¼mÃ¶r konumu ve hedef kapsamÄ±na baÄŸlÄ±dÄ±r.',
        contextEn: 'Preservation of at least one gland depends on tumor location and target coverage.',
        classification: 'planning-aim',
      },
      {
        organ: 'Koklea',
        metric: 'Dmean',
        limit: '< 45 Gy',
        source: 'QUANTEC head-and-neck review (2010), PubMed 20171519',
        context: 'Konvansiyonel RT iÃ§in doz azaltma hedefi; iÅŸitme riski klinik faktÃ¶rlere baÄŸlÄ±dÄ±r.',
        contextEn: 'Conventional RT dose-reduction objective; hearing risk depends on clinical factors.',
        classification: 'planning-aim',
      },
    ];
  }

  if (organ === 'bone' || (organ === 'bone-sarcoma'
    && !subsite.endsWith('-Yumusak_Doku')
    && !subsite.endsWith('-DFSP'))) {
    if (scheme.fractionCount <= 5) {
      return [{
        organ: 'Spinal cord / cauda equina (when adjacent)',
        metric: 'Fraction-specific dose-volume limit',
        limit: 'Use the selected SBRT protocol; no generic limit',
        source: 'AAPM TG-101 (2010), DOI: 10.1118/1.3438081; HyTEC spine (2021), DOI: 10.1016/j.ijrobp.2019.09.038',
        context: 'SBRT limit depends on fraction count, contour/PRV and prior irradiation.',
        contextEn: 'SBRT limits depend on fraction count, contour/PRV and prior irradiation.',
        classification: 'context-note',
      }];
    }
    return [{
      organ: 'Anatomy-adjacent OARs',
      metric: 'Protocol-specific planning',
      limit: 'No universal bone-tumor OAR matrix verified',
      source: 'QUANTEC / AAPM TG-101 / HyTEC; select by anatomy and fractionation',
      context: 'Skull base, spine and extremity protocols are not interchangeable.',
      contextEn: 'Skull-base, spine and extremity protocols are not interchangeable.',
      classification: 'context-note',
    }];
  }

  if (organ === 'skin') {
    return [{
      organ: 'Site-adjacent OARs (orbit, cartilage, salivary/thyroid tissue)',
      metric: 'Site- and fractionation-specific',
      limit: 'No universal skin-cancer OAR thresholds verified',
      source: 'AAPM TG-101 (2010); QUANTEC head-and-neck review (2010)',
      context: 'Select only structures at risk for the actual lesion and treatment field.',
      contextEn: 'Select only structures at risk for the actual lesion and treatment field.',
      classification: 'context-note',
    }];
  }

  if (organ === 'hematologic') {
    return [{
      organ: 'Heart / lungs / breast / thyroid / kidneys',
      metric: 'Dose minimization',
      limit: 'No universal ILROG numeric matrix verified',
      source: 'ILROG involved-site RT overview (2020), DOI: 10.1016/j.ijrobp.2020.03.019',
      context: 'Use disease-site and protocol-specific objectives; preserve involved-site treatment.',
      contextEn: 'Use disease-site and protocol-specific objectives; preserve involved-site treatment.',
      classification: 'planning-aim',
    }];
  }

  if (organ === 'pediatric') {
    return [{
      organ: 'Age- and endpoint-specific OARs',
      metric: 'PENTEC risk model',
      limit: 'No universal pediatric numeric limit verified',
      source: 'PENTEC publications; apply the organ-specific model and population',
      context: 'Interpret by age, fractionation, organ contour, endpoint and concurrent chemotherapy.',
      contextEn: 'Interpret by age, fractionation, organ contour, endpoint and concurrent chemotherapy.',
      classification: 'context-note',
    }];
  }

  if (organ === 'gynecology') {
    return [{
      organ: 'Pelvic OARs',
      metric: 'EBRT DVH vs cumulative brachytherapy EQD2',
      limit: 'Do not combine or substitute these metrics',
      source: 'EMBRACE II protocol; DOI: 10.1016/j.ctro.2018.01.001',
      context: 'Serviks D2cc deÄŸerleri kÃ¼mÃ¼latif EBRT + brakiterapi EQD2, Î±/Î²=3 iÃ§indir.',
      contextEn: 'Cervical D2cc values are cumulative EBRT + brachytherapy EQD2, Î±/Î²=3.',
      classification: 'context-note',
    }];
  }

  if (organ === 'palliative') {
    return [{
      organ: 'Critical OARs for palliation / re-irradiation',
      metric: 'Intent- and fractionation-specific',
      limit: 'Use the selected palliative or SBRT protocol; no universal value',
      source: 'ASTRO bone metastases guideline (2024), DOI: 10.1016/j.prro.2024.04.018; HyTEC spine (2021)',
      context: 'Distinguish conventional palliation, spine SBRT and prior-RT retreatment.',
      contextEn: 'Distinguish conventional palliation, spine SBRT and prior-RT retreatment.',
      classification: 'context-note',
    }];
  }

  if (organ === 'benign') {
    return [{
      organ: 'Adjacent normal tissue',
      metric: 'Planning objective',
      limit: 'Minimize dose; no universal numeric limit verified',
      source: 'Confirm the indication-specific benign RT guideline and local protocol',
      context: 'Do not extrapolate cancer-site constraints to benign irradiation.',
      contextEn: 'Do not extrapolate cancer-site constraints to benign irradiation.',
      classification: 'planning-aim',
    }];
  }

  return [];
};

export interface EvaluatedDecision {
  statusText: string;
  badgeClass: string;
  primaryScheme: DoseScheme;
  alternativeSchemes: DoseScheme[];
  targetVolumeBadge?: string;
  nodalStatusBadge?: string;
  techniqueBadge?: string;
}

export interface PrognosticResult {
  indexName: string;
  score: string | number;
  riskCategory: string;
  medianSurvivalOrRecurrence: string;
  recommendation: string;
  criteria: PrognosticCriterion[];
}

export interface PrognosticCriterion {
  label_tr: string;
  label_en: string;
  value: string;
  points?: string;
}

const calculatePrognosticIndexBase = (
  organ: string,
  subsite: string,
  t: string,
  n: string,
  m: string,
  extraParams: {
    kps?: number;
    age?: number;
    psa?: number;
    gleasonPrimary?: number;
    gleasonSecondary?: number;
    positiveCorePercent?: number;
    packYears?: number;
    hpvStatus?: 'positive' | 'negative';
    grade?: number;
    tumorSizeCm?: number;
    ldhElevated?: boolean;
    ecog?: number;
    centrality?: 'Peripheral' | 'Central' | 'Ultracentral';
    er?: boolean;
    pr?: boolean;
    her2?: boolean;
    ki67?: number;
  },
): Omit<PrognosticResult, 'criteria'> | null => {
  const age = extraParams.age || 65;
  const kps = extraParams.kps || 80;
  const isM1 = m.startsWith('M1');
  const isNodalPositive = /^N[1-3]/.test(n);
  const lowerSubsite = subsite.toLowerCase();

  if (organ === 'thorax') {
    if (isM1) {
      const oligometastatic = m.includes('M1b');
      return {
        indexName: 'IASLC & NCCN Evre IV KHDAK Modeli',
        score: oligometastatic ? 'Evre IVA (Oligometastatik)' : 'Evre IVB (Polimetastatik)',
        riskCategory: oligometastatic ? 'Orta-KÃ¶tÃ¼ Prognoz (Oligometastatik)' : 'KÃ¶tÃ¼ Prognoz (YaygÄ±n Metastatik)',
        medianSurvivalOrRecurrence: oligometastatic ? 'Median OS: ~18-24 ay' : 'Median OS: ~10-14 ay',
        recommendation: oligometastatic ? 'Sistemik Kemo-Ä°mmÃ¼noterapi / Hedefe YÃ¶nelik Tedavi + primer ve oligometastazlara konsolidatif SBRT/SABR.' : 'Sistemik Kemo-Ä°mmÃ¼noterapi (Kategori 1); RT semptomatik lezyonlara palyatif amaÃ§la uygulanÄ±r.',
      };
    }
    if (isNodalPositive || /^T[34]/.test(t)) {
      return {
        indexName: 'PACIFIC & RTOG Evre III Lokal Ä°leri Modeli',
        score: `${t} ${n} (Evre III)`,
        riskCategory: 'Lokal Ä°leri YÃ¼ksek Risk',
        medianSurvivalOrRecurrence: '5 yÄ±llÄ±k genel saÄŸkalÄ±m (PACIFIC): ~43%',
        recommendation: 'EÅŸzamanlÄ± Kemo-Radyoterapi (60-66 Gy), uygun olgularda 12 ay Durvalumab idamesi.',
      };
    }
    return {
      indexName: 'RTOG / ESTRO Erken Evre KHDAK SBRT Modeli',
      score: `${t} ${n} M0 (Evre I)`,
      riskCategory: 'MÃ¼kemmel Lokal Kontrol (DÃ¼ÅŸÃ¼k Sistemik Risk)',
      medianSurvivalOrRecurrence: '3 yÄ±llÄ±k lokal kontrol: >%90; Median OS: ~4-5 yÄ±l',
      recommendation: 'KÃ¼ratif SBRT (54 Gy/3 fx veya 50 Gy/5 fx); nodal Ä±ÅŸÄ±nlama yapÄ±lmaz.',
    };
  }

  if (organ === 'prostate' || lowerSubsite.includes('prostate')) {
    if (m.includes('M1c')) {
      return {
        indexName: 'CHAARTED & LATITUDE Metastatik Risk Modeli',
        score: 'M1c (Visseral YÃ¼ksek VolÃ¼m)',
        riskCategory: 'Evre IVB: KÃ¶tÃ¼ Prognoz (Visseral Metastatik mHSPC)',
        medianSurvivalOrRecurrence: 'Median OS: ~32-36 ay',
        recommendation: 'ADT + ARPI Â± Dosetaksel ile yoÄŸunlaÅŸtÄ±rÄ±lmÄ±ÅŸ sistemik tedavi esastÄ±r; primer RT seÃ§ilmiÅŸ olgularla sÄ±nÄ±rlÄ±dÄ±r.',
      };
    }
    if (isM1) {
      return {
        indexName: 'STAMPEDE & CHAARTED DÃ¼ÅŸÃ¼k VolÃ¼m Modeli',
        score: m.includes('M1b') ? 'M1b (Kemik Met)' : 'M1a (Uzak Nodal)',
        riskCategory: 'Evre IVB: DÃ¼ÅŸÃ¼k VolÃ¼mlÃ¼ / Oligometastatik mHSPC',
        medianSurvivalOrRecurrence: 'Median OS: ~48-60+ ay',
        recommendation: 'ADT + ARPI kombinasyonu, uygun olguda primer prostat RT ve oligometastazlara SBRT.',
      };
    }
    const psa = extraParams.psa || 8.5;
    const g1 = extraParams.gleasonPrimary || 3;
    const g2 = extraParams.gleasonSecondary || 4;
    const gleasonSum = g1 + g2;
    let capra = psa > 20 ? 3 : psa >= 10 ? 2 : psa >= 6 ? 1 : 0;
    capra += gleasonSum >= 8 || g1 >= 4 ? 3 : gleasonSum === 7 ? 1 : 0;
    if (/^T[34]/.test(t)) capra += 1;
    if (t.startsWith('T4') || t === 'T3b' || capra >= 6 || isNodalPositive) {
      return {
        indexName: 'UCSF CAPRA & NCCN Ã‡ok YÃ¼ksek Risk Modeli',
        score: `${Math.max(capra, 6)} / 10`,
        riskCategory: 'Ã‡ok YÃ¼ksek Risk',
        medianSurvivalOrRecurrence: '5 yÄ±llÄ±k biyokimyasal nÃ¼kssÃ¼zlÃ¼k: ~35-45%',
        recommendation: 'Doz eskalasyonu (78-80 Gy veya SIB) + 24-36 ay ADT + elektif pelvik nodal RT.',
      };
    }
    if (capra >= 3) {
      return {
        indexName: 'UCSF CAPRA & NCCN Orta Risk Modeli',
        score: `${capra} / 10`,
        riskCategory: 'Orta Risk',
        medianSurvivalOrRecurrence: '5 yÄ±llÄ±k biyokimyasal nÃ¼kssÃ¼zlÃ¼k: ~70-75%',
        recommendation: '60 Gy/20 fx veya SBRT (36.25 Gy) Â± 4-6 ay kÄ±sa dÃ¶nem ADT.',
      };
    }
    return {
      indexName: 'UCSF CAPRA & NCCN DÃ¼ÅŸÃ¼k Risk Modeli',
      score: `${capra} / 10`,
      riskCategory: 'DÃ¼ÅŸÃ¼k Risk',
      medianSurvivalOrRecurrence: '5 yÄ±llÄ±k biyokimyasal nÃ¼kssÃ¼zlÃ¼k: ~85-90%',
      recommendation: 'Aktif izlem veya tek baÅŸÄ±na SBRT / Ä±lÄ±mlÄ± hipofraksiyonasyon; ADT gerekmez.',
    };
  }

  if (organ === 'breast') {
    if (isM1) {
      return {
        indexName: 'Evre IV Metastatik Meme Kanseri Risk Modeli',
        score: 'M1 (Uzak Metastaz)',
        riskCategory: 'Evre IV: Ä°leri Sistemik HastalÄ±k',
        medianSurvivalOrRecurrence: 'Median OS: biyolojik alt tipe gÃ¶re ~2-5+ yÄ±l',
        recommendation: 'Sistemik tedavi Ã¶nceliklidir; RT semptom palyasyonu veya seÃ§ilmiÅŸ oligometastaz ablasyonu iÃ§in uygulanÄ±r.',
      };
    }
    if (isNodalPositive || /^T[34]/.test(t)) {
      return {
        indexName: 'Lokal Ä°leri Meme Kanseri (LABC) Risk Modeli',
        score: `${t} ${n} (Evre III)`,
        riskCategory: 'YÃ¼ksek Lokal NÃ¼ks Riski',
        medianSurvivalOrRecurrence: '10 yÄ±llÄ±k lokal nÃ¼ks riski: ~20-30% (RT ile <%8-10)',
        recommendation: 'PMRT veya meme koruyucu RT + kapsamlÄ± bÃ¶lgesel nodal Ä±ÅŸÄ±nlama (RNI).',
      };
    }
    const sizeCm = extraParams.tumorSizeCm || (t === 'T1a' ? 0.5 : t === 'T1b' ? 1 : t === 'T1c' ? 1.8 : 3);
    const npi = (0.2 * sizeCm) + (n === 'N0' ? 1 : 2) + (extraParams.grade || 2);
    const favorable = npi <= 3.4;
    return {
      indexName: 'Nottingham Prognostic Index (NPI)',
      score: npi.toFixed(2),
      riskCategory: favorable ? 'Ä°yi Prognoz (NPI â‰¤ 3.4)' : 'Orta Prognoz (NPI 3.41-5.4)',
      medianSurvivalOrRecurrence: favorable ? '10 yÄ±llÄ±k saÄŸkalÄ±m: ~85%' : '10 yÄ±llÄ±k saÄŸkalÄ±m: ~65%',
      recommendation: favorable ? 'Standart adjuvan tÃ¼m meme RT (FAST-Forward 26 Gy/5 fx); RNI yapÄ±lmaz.' : 'TÃ¼m meme RT + tÃ¼mÃ¶r yataÄŸÄ± boost ve sistemik tedavinin multidisipliner deÄŸerlendirilmesi.',
    };
  }

  if (organ === 'cns') {
    if (lowerSubsite.includes('gbm') || lowerSubsite.includes('glioblast')) {
      return {
        indexName: 'EORTC / RTOG RPA Glioblastom Modeli',
        score: age < 50 ? 'RPA SÄ±nÄ±f III' : kps >= 70 ? 'RPA SÄ±nÄ±f IV' : 'RPA SÄ±nÄ±f V',
        riskCategory: age < 50 ? 'GÃ¶receli Ä°yi Prognoz' : kps >= 70 ? 'Standart YÃ¼ksek Risk' : 'KÃ¶tÃ¼ Performans / DÃ¼ÅŸkÃ¼n',
        medianSurvivalOrRecurrence: age < 50 ? 'Median OS: ~17-24 ay' : kps >= 70 ? 'Median OS: ~14-16 ay' : 'Median OS: ~6-9 ay',
        recommendation: kps >= 70 ? 'Stupp protokolÃ¼: 60 Gy/30 fx + eÅŸzamanlÄ± ve adjuvan Temozolomid.' : 'KÄ±sa dÃ¶nem hipofraksiyonasyon (40.05 Gy/15 fx) Â± Temozolomid.',
      };
    }
    if (isM1 || lowerSubsite.includes('mets')) {
      let gpa = 1;
      if (age < 50) gpa += 1;
      else if (age <= 59) gpa += 0.5;
      if (kps >= 90) gpa += 1;
      else if (kps >= 70) gpa += 0.5;
      return {
        indexName: 'Diagnosis-Specific GPA (DS-GPA)',
        score: `${gpa.toFixed(1)} / 4.0`,
        riskCategory: gpa >= 3.5 ? 'MÃ¼kemmel Prognoz' : gpa >= 2.5 ? 'Ä°yi-Orta Prognoz' : 'KÃ¶tÃ¼ Prognoz',
        medianSurvivalOrRecurrence: gpa >= 3.5 ? 'Median OS: ~14-25 ay' : gpa >= 2.5 ? 'Median OS: ~8-12 ay' : 'Median OS: ~3-5 ay',
        recommendation: gpa >= 2.5 ? 'SRS veya hipokampus korumalÄ± WBRT deÄŸerlendirilir.' : 'WBRT veya best supportive care deÄŸerlendirilir.',
      };
    }
  }

  if (organ === 'gis') {
    if (isM1) {
      return {
        indexName: 'Metastatik Kolorektal / GÄ°S Modeli',
        score: 'M1 (Uzak Metastaz)',
        riskCategory: 'Evre IV GÄ°S Malignitesi',
        medianSurvivalOrRecurrence: 'Median OS: ~20-30 ay',
        recommendation: 'Sistemik kemoterapi ve biyolojik ajanlar; oligometastazlara SBRT veya cerrahi ablasyon.',
      };
    }
    if (lowerSubsite.includes('rect') || lowerSubsite.includes('rekt')) {
      const locallyAdvanced = /^T[34]/.test(t) || isNodalPositive;
      return {
        indexName: 'RAPIDO & PRODIGE-23 LARC Risk Modeli',
        score: locallyAdvanced ? 'Lokal Ä°leri Rektum (LARC)' : 'Erken Evre Rektum',
        riskCategory: locallyAdvanced ? 'YÃ¼ksek Lokal ve Sistemik NÃ¼ks Riski' : 'DÃ¼ÅŸÃ¼k NÃ¼ks Riski',
        medianSurvivalOrRecurrence: locallyAdvanced ? '3 yÄ±llÄ±k hastalÄ±ksÄ±z saÄŸkalÄ±m: ~75%' : '5 yÄ±llÄ±k lokal kontrol: >%90',
        recommendation: locallyAdvanced ? 'Total neoadjuvan tedavi: 25 Gy/5 fx + konsolidasyon KT veya uzun dÃ¶nem KRT.' : 'Primer cerrahi (TME) veya seÃ§ilmiÅŸ olguda lokal eksizyon.',
      };
    }
  }

  if (organ === 'head-neck') {
    if (isM1) {
      return {
        indexName: 'KEYNOTE-048 Evre IVC BaÅŸ-Boyun Modeli',
        score: 'Evre IVC (Uzak Metastaz)',
        riskCategory: 'KÃ¶tÃ¼ Prognoz',
        medianSurvivalOrRecurrence: 'Median OS: ~10-14 ay',
        recommendation: 'Pembrolizumab Â± platin/5-FU; primer kitleye palyatif RT.',
      };
    }
    return {
      indexName: 'Ang et al. Orofarenks / BaÅŸ-Boyun RPA Modeli',
      score: isNodalPositive ? 'Nodal Pozitif Lokal Ä°leri' : 'Erken Evre',
      riskCategory: isNodalPositive ? 'Orta-YÃ¼ksek NÃ¼ks Riski' : 'DÃ¼ÅŸÃ¼k NÃ¼ks Riski',
      medianSurvivalOrRecurrence: isNodalPositive ? '5 yÄ±llÄ±k saÄŸkalÄ±m: ~65-75%' : '5 yÄ±llÄ±k saÄŸkalÄ±m: >%85',
      recommendation: isNodalPositive ? 'Definitif kemoradyoterapi: SIB 70/60/54 Gy/33 fx + yÃ¼ksek doz Sisplatin.' : 'KÃ¼ratif radyoterapi veya cerrahi rezeksiyon.',
    };
  }

  if (organ === 'gynecology') {
    if (isM1) {
      return {
        indexName: 'FIGO Evre IVB Jinekolojik Kanser Modeli',
        score: 'Evre IVB (Uzak Metastaz)',
        riskCategory: 'Ä°leri Evre Sistemik Tutulum',
        medianSurvivalOrRecurrence: 'Median OS: ~12-18 ay',
        recommendation: 'Karboplatin + Paklitaksel Â± Pembrolizumab/Bevasizumab; kanama kontrolÃ¼ iÃ§in palyatif RT.',
      };
    }
    return {
      indexName: 'EMBRACE II & PORTEC-3 Pelvik Risk Modeli',
      score: isNodalPositive ? 'YÃ¼ksek Risk (Nodal Tutulum)' : 'Lokal Pelvik Risk',
      riskCategory: isNodalPositive ? 'YÃ¼ksek Pelvik ve Paraaortik NÃ¼ks Riski' : 'Standart Pelvik Risk',
      medianSurvivalOrRecurrence: '5 yÄ±llÄ±k pelvik lokal kontrol: ~70-85%',
      recommendation: 'Pelvik EBRT + eÅŸzamanlÄ± Sisplatin ve 3D MR-IGABT brakiterapi deÄŸerlendirilir.',
    };
  }

  if (organ === 'palliative' || lowerSubsite.includes('spinal')) {
    const tokuhashi = (kps >= 80 ? 2 : 1) + (isM1 ? 1 : 2) + 2;
    const favorable = tokuhashi >= 9;
    return {
      indexName: 'Modifiye Tokuhashi & Tomita Spinal Ä°ndeksi',
      score: `${tokuhashi} / 15`,
      riskCategory: favorable ? 'Orta/Ä°yi Prognoz' : 'KÄ±sa YaÅŸam Beklentisi',
      medianSurvivalOrRecurrence: favorable ? 'Beklenen yaÅŸam: > 6-12 ay' : 'Beklenen yaÅŸam: < 6 ay',
      recommendation: favorable ? 'Spine SBRT (16-24 Gy tek fx veya 24-30 Gy/3-5 fx).' : 'HÄ±zlÄ± aÄŸrÄ± ve basÄ± palyasyonu: 8 Gy tek fx veya 20 Gy/5 fx.',
    };
  }

  if (organ === 'bone-sarcoma' || organ === 'hematologic' || organ === 'pediatric' || organ === 'benign') {
    const advanced = isNodalPositive || /^T[34]/.test(t);
    if (isM1) {
      return {
        indexName: 'UluslararasÄ± Evre IV Metastatik Risk Modeli',
        score: 'Evre IV (Metastatik)',
        riskCategory: 'Ä°leri Evre Sistemik HastalÄ±k',
        medianSurvivalOrRecurrence: 'Prognoz primer tÃ¼mÃ¶r biyolojisine baÄŸlÄ±dÄ±r',
        recommendation: 'Sistemik tedavi Ã¶nceliklidir; RT semptom palyasyonu veya oligometastaz ablasyonu iÃ§in uygulanÄ±r.',
      };
    }
    return {
      indexName: 'Organ-Spesifik Evreleme ve NÃ¼ks Risk Modeli',
      score: advanced ? 'Lokal Ä°leri' : 'Lokalize',
      riskCategory: advanced ? 'YÃ¼ksek NÃ¼ks Riski' : 'DÃ¼ÅŸÃ¼k-Orta NÃ¼ks Riski',
      medianSurvivalOrRecurrence: 'Prognoz histoloji, evre ve tedavi yanÄ±tÄ±na gÃ¶re deÄŸiÅŸir',
      recommendation: advanced ? 'Multidisipliner sistemik tedavi ve definitif/adyuvan RT deÄŸerlendirilir.' : 'Evreye uygun cerrahi veya kÃ¼ratif RT ve yakÄ±n takip.',
    };
  }

  if (organ === 'cns' && (subsite.includes('mets') || m.includes('M1'))) {
    let gpa = 0;
    if (age < 50) gpa += 1;
    else if (age <= 59) gpa += 0.5;
    if (kps >= 90) gpa += 1;
    else if (kps >= 70) gpa += 0.5;
    gpa += 1;

    let riskCategory = 'KÃ¶tÃ¼ Prognoz (GPA 0-1.0)';
    let medianSurvivalOrRecurrence = 'Median OS: ~3-5 ay';
    let recommendation = 'WBRT veya Best Supportive Care deÄŸerlendirilebilir.';
    if (gpa >= 3.5) {
      riskCategory = 'MÃ¼kemmel Prognoz (GPA 3.5-4.0)';
      medianSurvivalOrRecurrence = 'Median OS: ~14-25 ay';
      recommendation = 'Agresif Lokal Tedavi: Tek baÅŸÄ±na SRS / Fraksiyone SRT (Kategori 1).';
    } else if (gpa >= 2.5) {
      riskCategory = 'Ä°yi-Orta Prognoz (GPA 2.5-3.0)';
      medianSurvivalOrRecurrence = 'Median OS: ~8-12 ay';
      recommendation = 'Stereotaktik Radyocerrahi (SRS) veya Hipokampus KorumalÄ± WBRT.';
    }
    return {
      indexName: 'Diagnosis-Specific GPA (DS-GPA)',
      score: `${gpa.toFixed(1)} / 4.0`,
      riskCategory,
      medianSurvivalOrRecurrence,
      recommendation,
    };
  }

  if (organ === 'prostate') {
    let capra = 0;
    const psa = extraParams.psa || 8.5;
    const g1 = extraParams.gleasonPrimary || 3;
    const g2 = extraParams.gleasonSecondary || 4;
    const gleasonSum = g1 + g2;
    if (psa > 20) capra += 3;
    else if (psa >= 10) capra += 2;
    else if (psa >= 6) capra += 1;
    if (gleasonSum >= 8 || g1 >= 4) capra += 3;
    else if (gleasonSum === 7) capra += 1;
    if (t.startsWith('T3') || t.startsWith('T4')) capra += 1;

    let riskCategory = 'DÃ¼ÅŸÃ¼k Risk (CAPRA 0-2)';
    let medianSurvivalOrRecurrence = '5 yÄ±llÄ±k biyokimyasal nÃ¼kssÃ¼zlÃ¼k: ~85-90%';
    let recommendation = 'Aktif Ä°zlem veya Tek BaÅŸÄ±na SBRT / IlÄ±mlÄ± Hipofraksiyonasyon (ADT gerekmez).';
    if (capra >= 6) {
      riskCategory = 'YÃ¼ksek / Ã‡ok YÃ¼ksek Risk (CAPRA 6-10)';
      medianSurvivalOrRecurrence = '5 yÄ±llÄ±k biyokimyasal nÃ¼kssÃ¼zlÃ¼k: ~35-50%';
      recommendation = 'Doz Eskalasyonu (78-80 Gy veya SIB) + 18-36 Ay Uzun DÃ¶nem ADT + Elektif Pelvik Nodal RT.';
    } else if (capra >= 3) {
      riskCategory = 'Orta Risk (CAPRA 3-5)';
      medianSurvivalOrRecurrence = '5 yÄ±llÄ±k biyokimyasal nÃ¼kssÃ¼zlÃ¼k: ~70-75%';
      recommendation = 'IlÄ±mlÄ± Hipofraksiyon (60 Gy / 20 fx) veya SBRT (36.25 Gy) Â± 4-6 Ay KÄ±sa DÃ¶nem ADT.';
    }
    return {
      indexName: 'UCSF CAPRA Skoru & NCCN Risk Modeli',
      score: `${capra} / 10`,
      riskCategory,
      medianSurvivalOrRecurrence,
      recommendation,
    };
  }

  if (organ === 'breast') {
    const sizeCm = extraParams.tumorSizeCm || (t === 'T1a' ? 0.5 : t === 'T1b' ? 1 : t === 'T1c' ? 1.8 : t === 'T2' ? 3 : 5.5);
    const nodeScore = n === 'N0' ? 1 : n === 'N1' ? 2 : 3;
    const gradeScore = extraParams.grade || 2;
    const npi = (0.2 * sizeCm) + nodeScore + gradeScore;
    let riskCategory = 'Ä°yi Prognoz (NPI â‰¤ 3.4)';
    let medianSurvivalOrRecurrence = '10 yÄ±llÄ±k saÄŸkalÄ±m: ~83-88%';
    let recommendation = 'Standart Adjuvan WBRT (FAST-Forward 26 Gy/5 fx). Nodal Ä±ÅŸÄ±nlama (RNI) gerekmez.';
    if (npi > 5.4) {
      riskCategory = 'KÃ¶tÃ¼ Prognoz (NPI > 5.4)';
      medianSurvivalOrRecurrence = '10 yÄ±llÄ±k saÄŸkalÄ±m: ~13-35%';
      recommendation = 'KapsamlÄ± BÃ¶lgesel Nodal IÅŸÄ±nlama (RNI DÃ¼zey I-IV + Supraklavikular) + Sistemik KT/Hedefe YÃ¶nelik Tedavi.';
    } else if (npi > 3.4) {
      riskCategory = 'Orta Prognoz (NPI 3.41 - 5.4)';
      medianSurvivalOrRecurrence = '10 yÄ±llÄ±k saÄŸkalÄ±m: ~53-70%';
      recommendation = 'TÃ¼m Meme RT + Risk faktÃ¶rlerine gÃ¶re TÃ¼mÃ¶r YataÄŸÄ± Boost (10-16 Gy) ve Endokrin Tedavi.';
    }
    return {
      indexName: 'Nottingham Prognostic Index (NPI)',
      score: npi.toFixed(2),
      riskCategory,
      medianSurvivalOrRecurrence,
      recommendation,
    };
  }

  if (organ === 'palliative' || subsite.includes('Spinal')) {
    let tokuhashi = 3;
    if (kps >= 80) tokuhashi += 2;
    else if (kps >= 50) tokuhashi += 1;
    let riskCategory = 'Orta/Ä°yi Prognoz (Tokuhashi â‰¥ 9)';
    let medianSurvivalOrRecurrence = 'Beklenen YaÅŸam SÃ¼resi: > 6-12 ay';
    let recommendation = 'Omurga Stereotaktik Beden Radyoterapisi (Spine SBRT: 16-24 Gy tek fx veya 24-30 Gy / 3-5 fx).';
    if (tokuhashi < 9) {
      riskCategory = 'KÄ±sa YaÅŸam Beklentisi (Tokuhashi < 9)';
      medianSurvivalOrRecurrence = 'Beklenen YaÅŸam SÃ¼resi: < 6 ay';
      recommendation = 'HÄ±zlÄ± AÄŸrÄ± Palyasyonu: Tek Fraksiyon 8 Gy veya 20 Gy / 5 fx Konvansiyonel Dekompresyon.';
    }
    return {
      indexName: 'Modifiye Tokuhashi & Tomita Spinal Ä°ndeksi',
      score: `${tokuhashi} / 15`,
      riskCategory,
      medianSurvivalOrRecurrence,
      recommendation,
    };
  }
  if (isM1) {
    return {
      indexName: 'UluslararasÄ± Evre IV Metastatik Risk Modeli',
      score: 'Evre IV (Metastatik)',
      riskCategory: 'Ä°leri Evre Sistemik HastalÄ±k',
      medianSurvivalOrRecurrence: 'Prognoz primer tÃ¼mÃ¶r biyolojisine baÄŸlÄ±dÄ±r',
      recommendation: 'Sistemik tedavi Ã¶nceliklidir; RT semptom palyasyonu veya oligometastaz ablasyonu iÃ§in uygulanÄ±r.',
    };
  }
  return null;
};

export const calculatePrognosticIndex = (
  organ: string,
  subsite: string,
  t: string,
  n: string,
  m: string,
  extraParams: {
    kps?: number;
    age?: number;
    psa?: number;
    gleasonPrimary?: number;
    gleasonSecondary?: number;
    positiveCorePercent?: number;
    packYears?: number;
    hpvStatus?: 'positive' | 'negative';
    grade?: number;
    tumorSizeCm?: number;
    ldhElevated?: boolean;
    ecog?: number;
    centrality?: 'Peripheral' | 'Central' | 'Ultracentral';
    er?: boolean;
    pr?: boolean;
    her2?: boolean;
    ki67?: number;
  },
): PrognosticResult | null => {
  const result = calculatePrognosticIndexBase(organ, subsite, t, n, m, extraParams);
  if (!result) return null;

  const age = extraParams.age || 65;
  const kps = extraParams.kps || 80;
  const psa = extraParams.psa || 8.5;
  const g1 = extraParams.gleasonPrimary || 3;
  const g2 = extraParams.gleasonSecondary || 4;
  const gleasonSum = g1 + g2;
  const isM1 = m.startsWith('M1');
  const isNodalPositive = /^N[1-3]/.test(n);
  const criteria: PrognosticCriterion[] = [];
  const add = (label_tr: string, label_en: string, value: string, points?: string) => {
    criteria.push({ label_tr, label_en, value, ...(points ? { points } : {}) });
  };

  if (organ === 'thorax') {
    add('Primer TÃ¼mÃ¶r (T)', 'Primary Tumor (T)', t || 'T?');
    add('Mediastinal Nodal (N)', 'Mediastinal Nodal (N)', n || 'N0');
    add('Uzak Metastaz (M)', 'Distant Metastasis (M)', m || 'M0');
    add('TÃ¼mÃ¶r Santralitesi', 'Centrality', extraParams.centrality || 'Peripheral');
    add('Operabilite', 'Operability', isM1 ? 'Sistemik Aday' : n === 'N2' ? 'Medikal Ä°noperabl' : 'Cerrahi / SBRT AdayÄ±');
  } else if (organ === 'prostate' || subsite.includes('penile')) {
    if (subsite.includes('penile')) {
      add('Primer T Evresi', 'Primary T Stage', t || 'T?');
      add('Ä°nguinal Nodal (N)', 'Inguinal Nodes (N)', n || 'N0');
      add('Metastaz (M)', 'Metastasis (M)', m || 'M0');
      add('Klinik Risk', 'Clinical Risk', isNodalPositive ? 'YÃ¼ksek Nodal Risk' : 'Lokalize');
    } else {
      add('PSA DÃ¼zeyi', 'PSA Level', `${psa} ng/mL`, psa >= 20 ? '+3' : psa >= 10 ? '+2' : psa >= 6 ? '+1' : '0');
      add('Gleason Skoru', 'Gleason Score', `${g1}+${g2}=${gleasonSum}`, gleasonSum >= 8 ? '+3' : gleasonSum === 7 ? '+1' : '0');
      add('Klinik T', 'Clinical T', t || 'T?', /^T[34]/.test(t) ? '+1' : '0');
      add('Nodal / Met', 'N / M Status', `${n || 'N0'} ${m || 'M0'}`);
      add('Pozitif Kor (%)', 'Positive Cores', `%${extraParams.positiveCorePercent || 35}`);
    }
  } else if (organ === 'breast') {
    const sizeCm = extraParams.tumorSizeCm || (t === 'T1a' ? 0.5 : t === 'T1b' ? 1 : t === 'T1c' ? 1.8 : 3);
    const grade = extraParams.grade || 2;
    add('TÃ¼mÃ¶r Ã‡apÄ±', 'Tumor Size', `${sizeCm} cm`, `0.2 Ã— ${sizeCm} = ${(0.2 * sizeCm).toFixed(2)}`);
    add('Nodal Durum', 'Nodal Status', n || 'N0', n === 'N0' ? '1 Puan' : '2-3 Puan');
    add('Histolojik Grade', 'Grade', `Grade ${grade}`, `${grade} Puan`);
    add('ReseptÃ¶r Durumu', 'Receptors', `${extraParams.er ? 'ER+' : 'ER-'} ${extraParams.pr ? 'PR+' : 'PR-'} ${extraParams.her2 ? 'HER2+' : 'HER2-'}`);
    add('Ki-67 Ä°ndeksi', 'Ki-67 Index', extraParams.ki67 === undefined ? 'DÃ¼ÅŸÃ¼k/Orta' : `%${extraParams.ki67}`);
  } else if (organ === 'gis') {
    add('Primer T Evresi', 'Primary T Stage', t || 'T?');
    add('BÃ¶lgesel Nodal (N)', 'Regional Nodal (N)', n || 'N0');
    add('Uzak Metastaz (M)', 'Distant Metastasis (M)', m || 'M0');
    add('CRM / Fasiyal Risk', 'CRM Threat', /^T[34]/.test(t) || isNodalPositive ? 'YÃ¼ksek Risk (CRM Tehdidi)' : 'DÃ¼ÅŸÃ¼k Risk');
    add('LARC StatÃ¼sÃ¼', 'LARC Status', isM1 ? 'Evre IV Metastatik' : /^T3/.test(t) || isNodalPositive ? 'Lokal Ä°leri (TNT AdayÄ±)' : 'Erken Evre');
  } else if (organ === 'head-neck') {
    add('Primer Kitle (T)', 'Primary Tumor (T)', t || 'T?');
    add('Servikal Nodal (N)', 'Cervical Nodal (N)', n || 'N0');
    add('Uzak Metastaz (M)', 'Distant Metastasis (M)', m || 'M0');
    add('p16 / HPV Durumu', 'p16 / HPV Status', extraParams.hpvStatus === 'positive' ? 'p16 Pozitif (Ä°yi Prognoz)' : 'p16 Negatif / Standart');
    add('Nodal Risk DÃ¼zeyi', 'Nodal Risk Tier', isNodalPositive ? 'Bilateral Elektif Boyun Zorunlu' : 'SeÃ§ilmiÅŸ Nodal Alan');
  } else if (organ === 'cns') {
    add('Hasta YaÅŸÄ±', 'Age', `${age}`, age < 50 ? '1.0' : age <= 59 ? '0.5' : '0');
    add('Karnofsky (KPS)', 'KPS', `${kps}`, kps >= 90 ? '1.0' : kps >= 70 ? '0.5' : '0');
    add('Lezyon SayÄ±sÄ±', 'Metastases Count', '1 Odak (Soliter)', '1.0');
    add('Ekstrakraniyal Kontrol', 'Extracranial Control', 'KontrollÃ¼', '1.0');
  } else if (organ === 'gynecology') {
    add('Primer FIGO / T', 'Primary FIGO / T', t || 'T?');
    add('Pelvik Nodal (N)', 'Pelvic Nodal (N)', n || 'N0');
    add('Uzak Metastaz (M)', 'Distant Metastasis (M)', m || 'M0');
    add('Pelvik Kapsam', 'Pelvic Extent', isNodalPositive ? 'BÃ¶lgesel Nodal Pozitif' : 'Lokal Pelvis SÄ±nÄ±rlÄ±');
    add('Brakiterapi Uyumu', 'Brachytherapy Eligibility', '3D MR-IGABT AdayÄ±');
  } else if (organ === 'bone-sarcoma') {
    add('TÃ¼mÃ¶r Boyutu (T)', 'Tumor Size (T)', t || 'T?');
    add('BÃ¶lgesel Nodal (N)', 'Regional Nodal (N)', n || 'N0');
    add('Uzak Metastaz (M)', 'Distant Metastasis (M)', m || 'M0');
    add('FNCLCC Grade', 'Histologic Grade', 'Grade 2-3 (YÃ¼ksek Dereceli)');
    add('Fasyal Kompartman', 'Fascial Depth', 'Derin Ä°ntramÃ¼skÃ¼ler');
  } else if (organ === 'skin') {
    add('TÃ¼mÃ¶r Ã‡apÄ± / T', 'Tumor Diameter / T', t || 'T?');
    add('Nodal Durum (N)', 'Nodal Status (N)', n || 'N0');
    add('Uzak Metastaz (M)', 'Distant Metastasis (M)', m || 'M0');
    add('YÃ¼ksek Risk Ã–zellikleri', 'High-Risk Features', 'PerinÃ¶ral Ä°nvazyon / Derin Ä°nvazyon Yok');
    add('Cerrahi SÄ±nÄ±r', 'Surgical Margin', 'R0 Negatif');
  } else if (organ === 'hematologic') {
    add('Ann Arbor Evresi', 'Ann Arbor Stage', isM1 ? 'Evre IV' : isNodalPositive ? 'Evre II-III' : 'Evre I');
    add('Hasta YaÅŸÄ±', 'Age', `${age}`, age > 60 ? '+1' : '0');
    add('Serum LDH DÃ¼zeyi', 'Serum LDH', extraParams.ldhElevated ? 'YÃ¼ksek' : 'Normal', extraParams.ldhElevated ? '+1' : '0');
    add('ECOG PerformansÄ±', 'ECOG Performance Status', kps >= 80 ? 'ECOG 0-1' : 'ECOG 2+', kps >= 80 ? '0' : '+1');
    add('Ekstranodal Tutulum', 'Extranodal Sites', 'â‰¤1 Odak', '0');
  } else if (organ === 'pediatric') {
    add('Hasta YaÅŸÄ±', 'Age Category', 'â‰¥3 YaÅŸ (CSI AdayÄ±)');
    add('Rezeksiyon RezidÃ¼sÃ¼', 'Resection Residual', '<1.5 cmÂ² (Standart Risk)');
    add('BOS / NÃ¶roaksiyel YayÄ±lÄ±m', 'Neuraxis Seeding', 'M0 (Negatif)');
    add('MolekÃ¼ler Risk', 'Molecular Risk Tier', 'Standart Risk');
  } else if (organ === 'palliative') {
    add('Karnofsky (KPS)', 'KPS', `${kps}`);
    add('Metastaz Durumu', 'Metastatic Status', isM1 ? 'M1' : 'M0');
    add('Spinal Tedavi AdaylÄ±ÄŸÄ±', 'Spinal Treatment Candidacy', kps >= 70 ? 'SBRT / Cerrahi deÄŸerlendirmesi' : 'Palyatif RT');
  } else {
    add('T Evresi', 'T Stage', t || 'T?');
    add('N Evresi', 'N Stage', n || 'N0');
    add('M Evresi', 'M Stage', m || 'M0');
  }

  return { ...result, criteria };
};

function parseOption<T extends string>(value: string, options: readonly T[]): T | undefined {
  return options.find(option => option === value);
}

// ==========================================
// 2. TÃœM ORGAN VE ALT BAÅLIKLAR Ä°Ã‡Ä°N DÄ°NAMÄ°K TNM / EVRELEME MATRÄ°SÄ°
// ==========================================

const TNM_DATABASE: Record<string, { T: TNMOption[]; N: TNMOption[]; M: TNMOption[] }> = {
  // --- TORAKS: KHDAK ---
  'thorax-nsclc': {
    T: [
      { code: 'T1a', label: 'T1a', criterion: 'â‰¤1 cm primer kitle; ana bronÅŸ dallarÄ±na uzanÄ±m yok' },
      { code: 'T1b', label: 'T1b', criterion: '>1 cm ama â‰¤2 cm Ã§ap; visseral plevra intakt' },
      { code: 'T1c', label: 'T1c', criterion: '>2 cm ama â‰¤3 cm Ã§ap; periferik parankimde' },
      { code: 'T2a', label: 'T2a', criterion: '>3 cm ama â‰¤4 cm veya ana bronÅŸ tutulumu (karina >2 cm)' },
      { code: 'T2b', label: 'T2b', criterion: '>4 cm ama â‰¤5 cm veya visseral plevra invazyonu' },
      { code: 'T3', label: 'T3', criterion: '>5 cm ama â‰¤7 cm veya gÃ¶ÄŸÃ¼s duvarÄ± / frenik sinir tutulumu' },
      { code: 'T4', label: 'T4', criterion: '>7 cm veya mediasten, kalp, bÃ¼yÃ¼k damarlar, trakea, omurga invazyonu' },
    ],
    N: [
      { code: 'N0', label: 'N0', criterion: 'BÃ¶lgesel lenf nodu metastazÄ± yok' },
      { code: 'N1', label: 'N1', criterion: 'Ä°psilateral peribronÅŸiyal / hiler lenf nodu tutulumu' },
      { code: 'N2', label: 'N2', criterion: 'Ä°psilateral mediastinal / subkarinal lenf nodu tutulumu' },
      { code: 'N3', label: 'N3', criterion: 'Kontralateral mediastinal/hiler veya supraklavikular lenf nodu' },
    ],
    M: [
      { code: 'M0', label: 'M0', criterion: 'Uzak metastaz yok' },
      { code: 'M1a', label: 'M1a', criterion: 'KarÅŸÄ± akciÄŸer nodÃ¼lÃ¼, plevral/perikardiyal efÃ¼zyon veya nodÃ¼l' },
      { code: 'M1b', label: 'M1b', criterion: 'Tek bir ekstratorasik organda soliter metastaz (Oligometastatik)' },
      { code: 'M1c', label: 'M1c', criterion: 'Ã‡oklu organlarda yaygÄ±n metastazlar (Polimetastatik)' },
    ],
  },
  // --- TORAKS: KHAK (KÃ¼Ã§Ã¼k HÃ¼creli AkciÄŸer Kanseri) ---
  'thorax-sclc': {
    T: [
      { code: 'T1', label: 'T1', criterion: 'â‰¤3 cm tÃ¼mÃ¶r, akciÄŸer veya visseral plevra ile Ã§evrili' },
      { code: 'T2', label: 'T2', criterion: '>3-5 cm; ana bronÅŸ, visseral plevra veya hiler atelektazi tutulumu' },
      { code: 'T3', label: 'T3', criterion: '>5-7 cm veya gÃ¶ÄŸÃ¼s duvarÄ±, frenik sinir ya da parietal perikard invazyonu' },
      { code: 'T4', label: 'T4', criterion: '>7 cm veya mediasten, kalp, bÃ¼yÃ¼k damar, trakea ya da vertebra invazyonu' },
    ],
    N: [
      { code: 'N0', label: 'N0', criterion: 'BÃ¶lgesel lenf nodu metastazÄ± yok' },
      { code: 'N1', label: 'N1', criterion: 'Ä°psilateral peribronÅŸiyal, hiler veya intrapulmoner lenf nodu tutulumu' },
      { code: 'N2', label: 'N2', criterion: 'Ä°psilateral mediastinal veya subkarinal lenf nodu tutulumu' },
      { code: 'N3', label: 'N3', criterion: 'Kontralateral mediastinal/hiler veya supraklavikuler lenf nodu tutulumu' },
    ],
    M: [
      { code: 'M0', label: 'SÄ±nÄ±rlÄ± Evre (LS-SCLC)', criterion: 'Tek bir tolere edilebilir radyasyon alanÄ± iÃ§ine dahil edilebilen hastalÄ±k (M0)' },
      { code: 'M1', label: 'YaygÄ±n Evre (ES-SCLC)', criterion: 'KarÅŸÄ± akciÄŸer, plevral efÃ¼zyon veya uzak organ metastazÄ± (M1)' },
    ],
  },
  // --- TORAKS: Timoma & Timik Karsinom ---
  'thorax-thymoma': {
    T: [
      { code: 'Masaoka-I', label: 'Evre I', criterion: 'KapsÃ¼l intakt; makroskopik ve mikroskopik invazyon yok' },
      { code: 'Masaoka-II', label: 'Evre II', criterion: 'Mikroskopik transkapsÃ¼ler veya Ã§evre mediastinal yaÄŸ invazyonu' },
      { code: 'Masaoka-III', label: 'Evre III', criterion: 'KomÅŸu organ invazyonu (perikard, bÃ¼yÃ¼k damar, akciÄŸer)' },
      { code: 'Masaoka-IV', label: 'Evre IV', criterion: 'Plevral/perikardiyal tohumlanma (IVA) veya uzak metastaz (IVB)' },
    ],
    N: [
      { code: 'N0', label: 'N0', criterion: 'Lenf nodu tutulumu yok' },
      { code: 'N1', label: 'N1', criterion: 'Anterior mediastinal lenf nodu tutulumu' },
      { code: 'N2', label: 'N2', criterion: 'Derin intratorasik veya supraklavikular lenf nodu' },
    ],
    M: [
      { code: 'M0', label: 'M0', criterion: 'Uzak metastaz yok' },
      { code: 'M1', label: 'M1', criterion: 'Uzak organ metastazÄ±' },
    ],
  },
  // --- TORAKS: Mezotelyoma ---
  'thorax-mesothelioma': {
    T: [
      { code: 'T1', label: 'T1', criterion: 'Ä°psilateral pariyetal plevra ile sÄ±nÄ±rlÄ±' },
      { code: 'T2', label: 'T2', criterion: 'Visseral plevra, diyafram kasÄ± veya akciÄŸer parankimi tutulumu' },
      { code: 'T3', label: 'T3', criterion: 'Endotorasik fasya veya mediastinal yaÄŸ dokusu invazyonu' },
      { code: 'T4', label: 'T4', criterion: 'GÃ¶ÄŸÃ¼s duvarÄ±, perikard, karÅŸÄ± plevra veya omurga invazyonu' },
    ],
    N: [
      { code: 'N0', label: 'N0', criterion: 'BÃ¶lgesel lenf nodu tutulumu yok' },
      { code: 'N1', label: 'N1', criterion: 'Ä°psilateral bronkopulmoner, hiler veya mediastinal lenf nodu' },
      { code: 'N2', label: 'N2', criterion: 'Kontralateral mediastinal veya supraklavikular lenf nodu' },
    ],
    M: [
      { code: 'M0', label: 'M0', criterion: 'Uzak metastaz yok' },
      { code: 'M1', label: 'M1', criterion: 'Uzak metastaz mevcut' },
    ],
  },
  // --- JÄ°NEKOLOJÄ°: Serviks Uteri ---
  'gynecology-Serviks': {
    T: [
      { code: 'IB1-IB2', label: 'FIGO IB1-IB2', criterion: 'Servikse sÄ±nÄ±rlÄ±, invazyon derinliÄŸi â‰¥5 mm, kitle Ã§apÄ± <4 cm' },
      { code: 'IB3', label: 'FIGO IB3', criterion: 'Servikse sÄ±nÄ±rlÄ± kitle, en bÃ¼yÃ¼k Ã§ap â‰¥4 cm (Lokal ileri)' },
      { code: 'IIA-IIB', label: 'FIGO IIA-IIB', criterion: 'Ãœst 2/3 vajen tutulumu (IIA) veya parametriyal invazyon (IIB)' },
      { code: 'IIIA-IIIB', label: 'FIGO IIIA-IIIB', criterion: 'Alt 1/3 vajen tutulumu (IIIA) veya pelvik yan duvar / hidronefroz (IIIB)' },
      { code: 'IVA', label: 'FIGO IVA', criterion: 'Mesane veya rektum mukozasÄ± doÄŸrudan invazyonu' },
    ],
    N: [
      { code: 'N0', label: 'N0', criterion: 'BÃ¶lgesel lenf nodu metastazÄ± yok' },
      { code: 'N1', label: 'N1 (FIGO IIIC1)', criterion: 'Pelvik lenf nodu metastazÄ± pozitif' },
      { code: 'N2', label: 'N2 (FIGO IIIC2)', criterion: 'Paraaortik lenf nodu metastazÄ± pozitif' },
    ],
    M: [
      { code: 'M0', label: 'M0', criterion: 'Uzak metastaz yok' },
      { code: 'M1', label: 'M1 (FIGO IVB)', criterion: 'Uzak organ metastazÄ± (akciÄŸer, karaciÄŸer, kemik vb.)' },
    ],
  },
  // --- JÄ°NEKOLOJÄ°: Endometriyum ---
  'gynecology-Endometriyum': {
    T: [
      { code: 'IA', label: 'FIGO IA', criterion: 'Uterus korpusuna sÄ±nÄ±rlÄ±, myometrium invazyonu <%50' },
      { code: 'IB', label: 'FIGO IB', criterion: 'Myometrium invazyonu â‰¥%50 (Derin myometriyal invazyon)' },
      { code: 'II', label: 'FIGO II', criterion: 'Servikal stromal invazyon mevcut (ancak korpus dÄ±ÅŸÄ±na Ã§Ä±kmamÄ±ÅŸ)' },
      { code: 'IIIA-IIIB', label: 'FIGO IIIA-IIIB', criterion: 'Uterus seroza/adneks tutulumu (IIIA) veya vajen/parametrium invazyonu (IIIB)' },
      { code: 'IVA', label: 'FIGO IVA', criterion: 'Mesane veya barsak mukozasÄ± invazyonu' },
    ],
    N: [
      { code: 'N0', label: 'N0', criterion: 'BÃ¶lgesel lenf nodu metastazÄ± yok' },
      { code: 'N1', label: 'N1 (FIGO IIIC1)', criterion: 'Pelvik lenf nodu pozitifliÄŸi' },
      { code: 'N2', label: 'N2 (FIGO IIIC2)', criterion: 'Paraaortik lenf nodu pozitifliÄŸi' },
    ],
    M: [
      { code: 'M0', label: 'M0', criterion: 'Uzak metastaz yok' },
      { code: 'M1', label: 'M1 (FIGO IVB)', criterion: 'Uzak organ veya intraabdominal peritoneal yayÄ±lÄ±m' },
    ],
  },
  // --- JÄ°NEKOLOJÄ°: Over & Tuba Uterina ---
  'gynecology-Over_Tuba': {
    T: [
      { code: 'FIGO-I', label: 'FIGO I', criterion: 'Over veya tuba uterina ile sÄ±nÄ±rlÄ± tÃ¼mÃ¶r' },
      { code: 'FIGO-II', label: 'FIGO II', criterion: 'Pelvik organlara (uterus, mesane, sigmoid) yayÄ±lÄ±m' },
      { code: 'FIGO-III', label: 'FIGO III', criterion: 'Pelvis dÄ±ÅŸÄ± mikroskopik/makroskopik peritoneal yayÄ±lÄ±m' },
    ],
    N: [
      { code: 'N0', label: 'N0', criterion: 'Lenf nodu tutulumu yok' },
      { code: 'N1', label: 'N1 (FIGO IIIA1)', criterion: 'Retroperitoneal (pelvik/paraaortik) lenf nodu metastazÄ±' },
    ],
    M: [
      { code: 'M0', label: 'M0', criterion: 'Uzak organ metastazÄ± yok' },
      { code: 'M1', label: 'M1 (FIGO IV)', criterion: 'Plevral efÃ¼zyon sitolojisi pozitif (IVA) veya karaciÄŸer/dalak parankim metastazÄ± (IVB)' },
    ],
  },
  // --- JÄ°NEKOLOJÄ°: Vajen Karsinomu ---
  'gynecology-Vajen': {
    T: [
      { code: 'FIGO-I', label: 'FIGO I', criterion: 'Vajen duvarÄ± ile sÄ±nÄ±rlÄ± karsinom' },
      { code: 'FIGO-II', label: 'FIGO II', criterion: 'Subvajinal doku / paraservikal alana invazyon (pelvis duvarÄ±na ulaÅŸmamÄ±ÅŸ)' },
      { code: 'FIGO-III', label: 'FIGO III', criterion: 'Pelvis yan duvarÄ±na uzanÄ±m' },
      { code: 'FIGO-IVA', label: 'FIGO IVA', criterion: 'Mesane veya rektum mukozasÄ± invazyonu veya gerÃ§ek pelvis dÄ±ÅŸÄ±na Ã§Ä±kÄ±ÅŸ' },
    ],
    N: [
      { code: 'N0', label: 'N0', criterion: 'BÃ¶lgesel lenf nodu tutulumu yok' },
      { code: 'N1', label: 'N1', criterion: 'Pelvik veya inguinal lenf nodu metastazÄ±' },
    ],
    M: [
      { code: 'M0', label: 'M0', criterion: 'Uzak metastaz yok' },
      { code: 'M1', label: 'M1', criterion: 'Uzak organ metastazÄ±' },
    ],
  },
  // --- JÄ°NEKOLOJÄ°: Vulva Karsinomu ---
  'gynecology-Vulva': {
    T: [
      { code: 'FIGO-I', label: 'FIGO I', criterion: 'Vulva veya perinede sÄ±nÄ±rlÄ±, â‰¤2 cm lezyon' },
      { code: 'FIGO-II', label: 'FIGO II', criterion: '>2 cm kitle veya alt Ã¼retra/alt vajen/anÃ¼s komÅŸuluÄŸu' },
      { code: 'FIGO-III', label: 'FIGO III', criterion: 'Ãœst Ã¼retra, mesane, rektum mukozasÄ± veya pelvik kemik fiksasyonu' },
    ],
    N: [
      { code: 'N0', label: 'N0', criterion: 'Ä°nguinofemoral lenf nodu negatif' },
      { code: 'N1', label: 'N1', criterion: '1-2 lenf nodu metastazÄ± (<5 mm)' },
      { code: 'N2', label: 'N2', criterion: 'â‰¥3 lenf nodu metastazÄ± veya kapsÃ¼l dÄ±ÅŸÄ± yayÄ±lÄ±m (ENE/ECE)' },
    ],
    M: [
      { code: 'M0', label: 'M0', criterion: 'Uzak metastaz yok' },
      { code: 'M1', label: 'M1', criterion: 'Pelvik lenf nodlarÄ± veya uzak organ metastazlarÄ±' },
    ],
  },
  // --- KEMÄ°K & SARKOM: YumuÅŸak Doku Sarkomu ---
  'bone-sarcoma-Yumusak_Doku': {
    T: [
      { code: 'T1', label: 'T1', criterion: 'â‰¤5 cm en bÃ¼yÃ¼k Ã§apta yÃ¼zeyel veya derin yerleÅŸimli sarkom' },
      { code: 'T2', label: 'T2', criterion: '>5 cm ama â‰¤10 cm Ã§ap; fasyayÄ± aÅŸmamÄ±ÅŸ veya derin' },
      { code: 'T3', label: 'T3', criterion: '>10 cm ama â‰¤15 cm Ã§ap' },
      { code: 'T4', label: 'T4', criterion: '>15 cm bÃ¼yÃ¼k dev sarkomatÃ¶z kitle' },
    ],
    N: [
      { code: 'N0', label: 'N0', criterion: 'BÃ¶lgesel lenf nodu tutulumu yok (Ã§oÄŸu YDS)' },
      { code: 'N1', label: 'N1', criterion: 'BÃ¶lgesel lenf nodu metastazÄ± (Evre IV kabul edilir)' },
    ],
    M: [
      { code: 'M0', label: 'M0', criterion: 'Uzak metastaz yok' },
      { code: 'M1', label: 'M1', criterion: 'AkciÄŸer veya diÄŸer uzak organ metastazlarÄ±' },
    ],
  },
  // --- KEMÄ°K & SARKOM: Osteosarkom ---
  'bone-sarcoma-Osteosarkom': {
    T: [
      { code: 'T1', label: 'T1', criterion: 'â‰¤8 cm primer kemik iÃ§inde sÄ±nÄ±rlÄ± kitle' },
      { code: 'T2', label: 'T2', criterion: '>8 cm korteksi aÅŸan primer kemik kitlesi' },
      { code: 'T3', label: 'T3', criterion: 'AynÄ± kemik segmentinde diskontinÃ¼ skip lezyonlar' },
    ],
    N: [
      { code: 'N0', label: 'N0', criterion: 'BÃ¶lgesel lenf nodu tutulumu yok' },
      { code: 'N1', label: 'N1', criterion: 'BÃ¶lgesel lenf nodu tutulumu' },
    ],
    M: [
      { code: 'M0', label: 'M0', criterion: 'Uzak metastaz yok' },
      { code: 'M1a', label: 'M1a', criterion: 'YalnÄ±zca akciÄŸer metastazÄ±' },
      { code: 'M1b', label: 'M1b', criterion: 'DiÄŸer kemik veya visseral organ metastazlarÄ±' },
    ],
  },
  // --- KEMÄ°K & SARKOM: Ewing Sarkomu ---
  'bone-sarcoma-Ewing': {
    T: [
      { code: 'T1', label: 'T1', criterion: 'â‰¤8 cm veya lokalize primer kemik tutulumu' },
      { code: 'T2', label: 'T2', criterion: '>8 cm veya geniÅŸ ekstraosseÃ¶z yumuÅŸak doku kompanenti' },
    ],
    N: [
      { code: 'N0', label: 'N0', criterion: 'BÃ¶lgesel lenf nodu metastazÄ± yok' },
      { code: 'N1', label: 'N1', criterion: 'BÃ¶lgesel lenf nodu pozitif' },
    ],
    M: [
      { code: 'M0', label: 'M0', criterion: 'Lokalize hastalÄ±k (metastaz yok)' },
      { code: 'M1a', label: 'M1a', criterion: 'YalnÄ±zca akciÄŸer metastazÄ±' },
      { code: 'M1b', label: 'M1b', criterion: 'Kemik iliÄŸi, diÄŸer kemikler veya uzak organ metastazÄ±' },
    ],
  },
  // --- KEMÄ°K & SARKOM: Kondrosarkom ---
  'bone-sarcoma-Kondrosarkom': {
    T: [
      { code: 'T1', label: 'T1', criterion: 'â‰¤8 cm kortikal veya intramedÃ¼ller lezyon' },
      { code: 'T2', label: 'T2', criterion: '>8 cm geniÅŸ periostal / ekstraosseÃ¶z kitle' },
    ],
    N: [
      { code: 'N0', label: 'N0', criterion: 'Lenf nodu tutulumu yok' },
      { code: 'N1', label: 'N1', criterion: 'BÃ¶lgesel lenf nodu pozitif' },
    ],
    M: [
      { code: 'M0', label: 'M0', criterion: 'Uzak metastaz yok' },
      { code: 'M1', label: 'M1', criterion: 'AkciÄŸer veya uzak metastaz' },
    ],
  },
  // --- KEMÄ°K & SARKOM: Kordoma ---
  'bone-sarcoma-Kordoma': {
    T: [
      { code: 'T1', label: 'T1', criterion: 'â‰¤5 cm sakrum, vertebra veya klivus yerleÅŸimli' },
      { code: 'T2', label: 'T2', criterion: '>5 cm komÅŸu nÃ¶ral / vaskÃ¼ler veya dural invazyon' },
    ],
    N: [
      { code: 'N0', label: 'N0', criterion: 'Lenf nodu tutulumu yok' },
      { code: 'N1', label: 'N1', criterion: 'BÃ¶lgesel lenf nodu tutulumu' },
    ],
    M: [
      { code: 'M0', label: 'M0', criterion: 'Uzak metastaz yok' },
      { code: 'M1', label: 'M1', criterion: 'Uzak metastaz' },
    ],
  },
  // --- KEMÄ°K & SARKOM: Dev HÃ¼creli Kemik TÃ¼mÃ¶rÃ¼ (GCTB) ---
  'bone-sarcoma-GCTB': {
    T: [
      { code: 'T1', label: 'Evre 1 (Latent)', criterion: 'Ä°ntraosseÃ¶z sÄ±nÄ±rlarÄ± belirgin, inaktif lezyon' },
      { code: 'T2', label: 'Evre 2 (Aktif)', criterion: 'Korteks geniÅŸlemiÅŸ ama intakt lezyon' },
      { code: 'T3', label: 'Evre 3 (Agresif)', criterion: 'Kortikal perforasyon ve yumuÅŸak doku yayÄ±lÄ±mÄ±' },
    ],
    N: [
      { code: 'N0', label: 'N0', criterion: 'Lenf nodu tutulumu yok' },
      { code: 'N1', label: 'N1', criterion: 'Lenf nodu pozitif' },
    ],
    M: [
      { code: 'M0', label: 'M0', criterion: 'Metastaz yok' },
      { code: 'M1', label: 'M1', criterion: 'AkciÄŸer benign/malign metastatik implantlarÄ±' },
    ],
  },
  // --- BAÅ-BOYUN: Nazofarenks ---
  'head-neck-nasopharynx': {
    T: [
      { code: 'T1', label: 'T1', criterion: 'Nazofarenks veya orofarenks / burun boÅŸluÄŸu ile sÄ±nÄ±rlÄ±' },
      { code: 'T2', label: 'T2', criterion: 'Parafaringeal alana uzanÄ±m' },
      { code: 'T3', label: 'T3', criterion: 'KafatasÄ± tabanÄ±, servikal vertebra, pterigoid kemik invazyonu' },
      { code: 'T4', label: 'T4', criterion: 'Ä°ntrakraniyal uzanÄ±m, kraniyal sinir tutulumu, hipofarenks, orbita' },
    ],
    N: [
      { code: 'N0', label: 'N0', criterion: 'BÃ¶lgesel lenf nodu metastazÄ± yok' },
      { code: 'N1', label: 'N1', criterion: 'Unilateral servikal (â‰¤6 cm) veya bilateral retrofaringeal lenf nodu' },
      { code: 'N2', label: 'N2', criterion: 'Bilateral servikal lenf nodu (â‰¤6 cm, klavikula Ã¼stÃ¼)' },
      { code: 'N3', label: 'N3', criterion: '>6 cm lenf nodu veya supraklavikuler fossa tutulumu' },
    ],
    M: [
      { code: 'M0', label: 'M0', criterion: 'Uzak metastaz yok' },
      { code: 'M1', label: 'M1', criterion: 'Uzak metastaz mevcut' },
    ],
  },
  // --- BAÅ-BOYUN: Orofarenks ---
  'head-neck-oropharynx': {
    T: [
      { code: 'T1', label: 'T1', criterion: 'â‰¤2 cm primer tÃ¼mÃ¶r' },
      { code: 'T2', label: 'T2', criterion: '>2 cm ama â‰¤4 cm' },
      { code: 'T3', label: 'T3', criterion: '>4 cm veya epiglot lingual yÃ¼zeyi tutulumu' },
      { code: 'T4', label: 'T4', criterion: 'Larinks, dil kasÄ±, medial pterigoid veya mandibula invazyonu' },
    ],
    N: [
      { code: 'N0', label: 'N0', criterion: 'BÃ¶lgesel lenf nodu yok' },
      { code: 'N1', label: 'N1', criterion: 'Ä°psilateral tek lenf nodu â‰¤3 cm' },
      { code: 'N2', label: 'N2', criterion: 'Bilateral veya kontralateral â‰¤6 cm lenf nodu' },
      { code: 'N3', label: 'N3', criterion: '>6 cm lenf nodu veya ENE pozitifliÄŸi' },
    ],
    M: [
      { code: 'M0', label: 'M0', criterion: 'Uzak metastaz yok' },
      { code: 'M1', label: 'M1', criterion: 'Uzak metastaz' },
    ],
  },
  // --- BAÅ-BOYUN: Larinks ---
  'head-neck-larynx': {
    T: [
      { code: 'T1a/b', label: 'T1a/b', criterion: 'Tek veya her iki vokal kordla sÄ±nÄ±rlÄ±, kord mobilitesi normal' },
      { code: 'T2', label: 'T2', criterion: 'Supraglottik/subglottik uzanÄ±m ve/veya azalmÄ±ÅŸ vokal kord mobilitesi' },
      { code: 'T3', label: 'T3', criterion: 'Vokal kord fiksasyonu ve/veya paraglottik alan invazyonu' },
      { code: 'T4a', label: 'T4a', criterion: 'Tiroid kÄ±kÄ±rdak penetrasyonu, trakea veya derin boyun kasÄ± invazyonu' },
    ],
    N: [
      { code: 'N0', label: 'N0', criterion: 'Lenf nodu tutulumu yok' },
      { code: 'N1', label: 'N1', criterion: 'Ä°psilateral tek lenf nodu â‰¤3 cm' },
      { code: 'N2', label: 'N2', criterion: 'Ä°psilateral Ã§oklu veya bilateral lenf nodlarÄ± â‰¤6 cm' },
      { code: 'N3', label: 'N3', criterion: '>6 cm lenf nodu' },
    ],
    M: [
      { code: 'M0', label: 'M0', criterion: 'Uzak metastaz yok' },
      { code: 'M1', label: 'M1', criterion: 'Uzak metastaz' },
    ],
  },
  // --- MSS: Beyin MetastazÄ± ---
  'cns-mets': {
    T: [
      { code: 'Soliter', label: 'Tek Odak', criterion: 'â‰¤2 cm soliter metastatik lezyon' },
      { code: 'Oligo', label: '2-4 Odak', criterion: 'Oligometastatik intrakraniyal lezyonlar (Ã§ap â‰¤3-4 cm)' },
      { code: 'Coklu', label: '>4 Odak / YaygÄ±n', criterion: 'Ã‡oklu intrakraniyal metastazlar veya yaygÄ±n Ã¶dem/kitle etkisi' },
    ],
    N: [
      { code: 'N0', label: 'Primer N0', criterion: 'Primer tÃ¼mÃ¶r bÃ¶lgesel lenf nodu negatif' },
      { code: 'N+', label: 'Primer N+', criterion: 'Primer tÃ¼mÃ¶r bÃ¶lgesel lenf nodu pozitif' },
    ],
    M: [
      { code: 'M1', label: 'M1 Beyin', criterion: 'Parankimal intrakraniyal beyin metastazÄ±' },
    ],
  },
  // --- MSS: Glioblastom ---
  'cns-gbm': {
    T: [
      { code: 'Lokalize', label: 'Lokalize Kitle', criterion: 'Maksimal gÃ¼venli cerrahiye uygun lober kitle' },
      { code: 'Derin_Infiltratif', label: 'Derin / Santral', criterion: 'Bazal ganglion, talamus veya korpus kallozum invazyonu' },
      { code: 'Multifokal', label: 'Multifokal GBM', criterion: 'Beyin parankiminde birden fazla birbirinden baÄŸÄ±msÄ±z odak' },
    ],
    N: [
      { code: 'N0', label: 'Uygulanamaz', criterion: 'MSS primer tÃ¼mÃ¶rlerinde lenf nodu deÄŸerlendirmesi yapÄ±lmaz' },
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
      { code: 'Grade-3', label: 'WHO Grade 3 (Malign)', criterion: 'Anaplastik / malign histoloji (Mitoz â‰¥20/10 BBA)' },
    ],
    N: [
      { code: 'N0', label: 'Uygulanamaz', criterion: 'Lenfatik drenaj deÄŸerlendirilmez' },
    ],
    M: [
      { code: 'M0', label: 'M0', criterion: 'Ä°ntrakraniyal sÄ±nÄ±rlÄ± lezyon' },
      { code: 'M1', label: 'M1', criterion: 'Ekstrakraniyal uzak metastaz' },
    ],
  },
  // --- GÄ°S: Rektum ---
  'gis-Rektum': {
    T: [
      { code: 'T1', label: 'T1', criterion: 'Submukoza invazyonu (Muskularis propria intakt)' },
      { code: 'T2', label: 'T2', criterion: 'Muskularis propria invazyonu' },
      { code: 'T3', label: 'T3', criterion: 'Subseroza veya perirektal yaÄŸ dokusu invazyonu (Mezorektum)' },
      { code: 'T4a', label: 'T4a', criterion: 'Visseral periton penetrasyonu' },
      { code: 'T4b', label: 'T4b', criterion: 'KomÅŸu organ invazyonu (prostat, mesane, vajen, sakrum vb.)' },
    ],
    N: [
      { code: 'N0', label: 'N0', criterion: 'BÃ¶lgesel mezorektal lenf nodu metastazÄ± yok' },
      { code: 'N1', label: 'N1', criterion: '1-3 bÃ¶lgesel mezorektal lenf nodu pozitif' },
      { code: 'N2', label: 'N2', criterion: 'â‰¥4 bÃ¶lgesel mezorektal lenf nodu pozitif' },
    ],
    M: [
      { code: 'M0', label: 'M0', criterion: 'Uzak organ metastazÄ± yok' },
      { code: 'M1a', label: 'M1a', criterion: 'Tek bir uzak organda soliter metastaz (Ã¶rn. izole karaciÄŸer)' },
      { code: 'M1b', label: 'M1b', criterion: 'Birden fazla organda metastaz' },
    ],
  },
  // --- GÄ°S: Mide ---
  'gis-Mide': {
    T: [
      { code: 'T1', label: 'T1', criterion: 'Lamina propria veya submukozaya invazyon' },
      { code: 'T2', label: 'T2', criterion: 'Muskularis propria invazyonu' },
      { code: 'T3', label: 'T3', criterion: 'Subseroza baÄŸ dokusu invazyonu' },
      { code: 'T4a', label: 'T4a', criterion: 'Seroza (visseral periton) perforasyonu' },
      { code: 'T4b', label: 'T4b', criterion: 'KomÅŸu organ invazyonu (kolon, karaciÄŸer, diyafram, pankreas)' },
    ],
    N: [
      { code: 'N0', label: 'N0', criterion: 'BÃ¶lgesel lenf nodu metastazÄ± yok' },
      { code: 'N1', label: 'N1', criterion: '1-2 bÃ¶lgesel lenf nodu pozitif' },
      { code: 'N2', label: 'N2', criterion: '3-6 bÃ¶lgesel lenf nodu pozitif' },
      { code: 'N3', label: 'N3', criterion: 'â‰¥7 bÃ¶lgesel lenf nodu pozitif' },
    ],
    M: [
      { code: 'M0', label: 'M0', criterion: 'Uzak metastaz yok' },
      { code: 'M1', label: 'M1', criterion: 'Uzak organ veya peritoneal karsinomatozis' },
    ],
  },
  // --- GÃœS: Prostat ---
  'prostate-prostate': {
    T: [
      { code: 'T1a', label: 'T1a', criterion: 'Ä°nsidental TURP materyalinde tÃ¼mÃ¶r â‰¤%5' },
      { code: 'T1b', label: 'T1b', criterion: 'Ä°nsidental TURP materyalinde tÃ¼mÃ¶r >%5' },
      { code: 'T1c', label: 'T1c', criterion: 'Muayenede palpe edilemeyen; PSA yÃ¼ksekliÄŸi biyopsisinde saptanan' },
      { code: 'T2a', label: 'T2a', criterion: 'Palpabl tÃ¼mÃ¶r; bir lobun yarÄ±sÄ± veya daha azÄ± ile sÄ±nÄ±rlÄ±' },
      { code: 'T2b', label: 'T2b', criterion: 'Palpabl tÃ¼mÃ¶r; bir lobun yarÄ±sÄ±ndan fazlasÄ±na uzanmÄ±ÅŸ' },
      { code: 'T2c', label: 'T2c', criterion: 'Bilateral her iki prostat lobunu tutan kitle' },
      { code: 'T3a', label: 'T3a', criterion: 'EkstrakapsÃ¼ler yayÄ±lÄ±m (ECE) - Prostat kapsÃ¼lÃ¼nÃ¼ aÅŸmÄ±ÅŸ' },
      { code: 'T3b', label: 'T3b', criterion: 'Seminal vezikÃ¼l invazyonu (SVI)' },
      { code: 'T4', label: 'T4', criterion: 'Rektum, levator kaslarÄ± veya pelvik taban komÅŸu organ invazyonu' },
    ],
    N: [
      { code: 'N0', label: 'N0', criterion: 'BÃ¶lgesel pelvik lenf nodu metastazÄ± yok' },
      { code: 'N1', label: 'N1', criterion: 'Pelvik lenf nodu metastazÄ± (obturator, iliak nodlar)' },
    ],
    M: [
      { code: 'M0', label: 'M0', criterion: 'Uzak metastaz yok' },
      { code: 'M1a', label: 'M1a', criterion: 'BÃ¶lge dÄ±ÅŸÄ± uzak lenf nodu metastazlarÄ±' },
      { code: 'M1b', label: 'M1b', criterion: 'Kemik metastazÄ± (aksiyel/apandikÃ¼ler iskelet)' },
      { code: 'M1c', label: 'M1c', criterion: 'Visseral organ metastazlarÄ± (akciÄŸer, karaciÄŸer vb.)' },
    ],
  },
  // --- MEME ---
  breast: {
    T: [
      { code: 'T1mic', label: 'T1mic', criterion: 'Mikroinvazyon; en bÃ¼yÃ¼k odak â‰¤0.1 cm (1 mm)' },
      { code: 'T1a', label: 'T1a', criterion: 'TÃ¼mÃ¶r >0.1 cm ama â‰¤0.5 cm (1-5 mm)' },
      { code: 'T1b', label: 'T1b', criterion: 'TÃ¼mÃ¶r >0.5 cm ama â‰¤1.0 cm (5-10 mm)' },
      { code: 'T1c', label: 'T1c', criterion: 'TÃ¼mÃ¶r >1.0 cm ama â‰¤2.0 cm (10-20 mm)' },
      { code: 'T2', label: 'T2', criterion: '>2 cm ama â‰¤5 cm invaziv kitle' },
      { code: 'T3', label: 'T3', criterion: '>5 cm primer meme kitlesi' },
      { code: 'T4', label: 'T4', criterion: 'GÃ¶ÄŸÃ¼s duvarÄ± fiksasyonu, cilt Ã¼lserasyonu veya enflamatuar karsinom' },
    ],
    N: [
      { code: 'N0', label: 'N0', criterion: 'Aksiller lenf nodu metastazÄ± yok' },
      { code: 'N1', label: 'N1', criterion: '1-3 ipsilateral hareketli Level I-II aksiller lenf nodu' },
      { code: 'N2', label: 'N2', criterion: '4-9 aksiller lenf nodu veya fikse konglomere kitle' },
      { code: 'N3', label: 'N3', criterion: 'â‰¥10 aksiller nod veya supraklavikuler / internal mammar lenf nodu' },
    ],
    M: [
      { code: 'M0', label: 'M0', criterion: 'Uzak metastaz yok' },
      { code: 'M1', label: 'M1', criterion: 'Kemik, akciÄŸer, karaciÄŸer veya beyin uzak metastazÄ±' },
    ],
  },
  // --- CÄ°LT ---
  skin: {
    T: [
      { code: 'T1', label: 'T1', criterion: 'â‰¤2 cm Ã§ap; yÃ¼ksek risk Ã¶zelliÄŸi yok' },
      { code: 'T2', label: 'T2', criterion: '>2 cm ama â‰¤4 cm' },
      { code: 'T3', label: 'T3', criterion: '>4 cm veya derin invazyon (>6 mm) veya kemik korteks erozyonu' },
      { code: 'T4', label: 'T4', criterion: 'Aksiyel kemik veya kafatasÄ± tabanÄ± derin invazyonu' },
    ],
    N: [
      { code: 'N0', label: 'N0', criterion: 'BÃ¶lgesel lenf nodu tutulumu yok' },
      { code: 'N1', label: 'N1', criterion: '1 lenf nodu metastazÄ± (â‰¤3 cm)' },
      { code: 'N2', label: 'N2', criterion: 'Ã‡oklu lenf nodu veya >3 cm kitle' },
    ],
    M: [
      { code: 'M0', label: 'M0', criterion: 'Uzak metastaz yok' },
      { code: 'M1', label: 'M1', criterion: 'Uzak visseral organ metastazlarÄ±' },
    ],
  },
  // --- HEMATOLOJÄ°K ---
  hematologic: {
    T: [
      { code: 'Evre I', label: 'Evre I', criterion: 'Tek bir lenf nodu bÃ¶lgesi veya tek bir ekstralenfatik organ tutulumu' },
      { code: 'Evre II', label: 'Evre II', criterion: 'DiyaframÄ±n aynÄ± tarafÄ±nda iki veya daha fazla lenf nodu bÃ¶lgesi' },
      { code: 'Evre III', label: 'Evre III', criterion: 'DiyaframÄ±n her iki tarafÄ±nda lenf nodu tutulumu' },
      { code: 'Evre IV', label: 'Evre IV', criterion: 'YaygÄ±n kemik iliÄŸi, karaciÄŸer veya ekstralenfatik organ yayÄ±lÄ±mÄ±' },
    ],
    N: [
      { code: 'Non-Bulky', label: 'Non-Bulky', criterion: 'Mediastinal veya periferik kitle Ã§apÄ± <7-10 cm' },
      { code: 'Bulky', label: 'Bulky Kitle', criterion: 'â‰¥7-10 cm bÃ¼yÃ¼k kitle veya transtorasik Ã§apÄ±n >1/3\'Ã¼' },
    ],
    M: [
      { code: 'A', label: 'A', criterion: 'B semptomu yok (AteÅŸ, gece terlemesi, kilo kaybÄ± yok)' },
      { code: 'B', label: 'B', criterion: 'B semptomlarÄ± mevcut' },
    ],
  },
  // --- PEDÄ°ATRÄ°K ---
  pediatric: {
    T: [
      { code: 'Standart', label: 'Standart Risk', criterion: 'RezidÃ¼ kitle <1.5 cm2, nÃ¶rolojik defisit ve yayÄ±lÄ±m sÄ±nÄ±rlÄ±' },
      { code: 'Yuksek', label: 'YÃ¼ksek Risk', criterion: 'RezidÃ¼ â‰¥1.5 cm2 veya kraniyospinal aksa yayÄ±lÄ±m ÅŸÃ¼phesi' },
    ],
    N: [
      { code: 'N0', label: 'N0', criterion: 'Nodal tutulum yok' },
      { code: 'N1', label: 'N1', criterion: 'BÃ¶lgesel nodal tutulum' },
    ],
    M: [
      { code: 'M0', label: 'M0', criterion: 'BOS sitolojisi ve omurilik MR temiz (CSI lokalize)' },
      { code: 'M1-3', label: 'M+', criterion: 'BOS sitolojisi pozitif veya spinal leptomeningeal tohumlanma' },
    ],
  },
  // --- PALYATÄ°F ---
  palliative: {
    T: [
      { code: 'Kemik', label: 'AÄŸrÄ±lÄ± Kemik MetastazÄ±', criterion: 'Omurga, pelvis, ekstremite kemik tutulumu' },
      { code: 'Beyin', label: 'Beyin MetastazÄ±', criterion: 'Kafa iÃ§i kitle lezyonlarÄ±' },
      { code: 'Organ', label: 'Organ / YumuÅŸak Doku MetastazÄ±', criterion: 'Semptomatik viseral veya yumuÅŸak doku lezyonu' },
    ],
    N: [
      { code: 'TekFx', label: 'Tek Fraksiyon Tercihi', criterion: '8 Gy tek fraksiyon (Optimal aÄŸrÄ± palyasyonu, hasta konforu)' },
      { code: 'CokFx', label: 'Ã‡oklu Fraksiyon Tercihi', criterion: '20 Gy / 5 fx veya 30 Gy / 10 fx (Uzun saÄŸkalÄ±m beklentisi)' },
    ],
    M: [
      { code: 'M1', label: 'Metastatik / Ä°lerlemiÅŸ', criterion: 'Palyatif semptomatik endikasyon' },
    ],
  },
};

TNM_DATABASE['prostate-bladder'] = {
  T: [
    { code: 'T2', label: 'cT2', criterion: 'Detrusor kasÄ±nÄ± invaze eden kas-invaziv mesane tÃ¼mÃ¶rÃ¼' },
    { code: 'T3', label: 'cT3', criterion: 'Perivezikal yaÄŸ dokusuna uzanÄ±m' },
    { code: 'T4a', label: 'cT4a', criterion: 'Prostat stromasÄ±, uterus veya vajen invazyonu' },
  ],
  N: [
    { code: 'N0', label: 'N0', criterion: 'BÃ¶lgesel lenf nodu metastazÄ± yok' },
    { code: 'N1', label: 'N1', criterion: 'Tek bÃ¶lgesel lenf nodunda metastaz' },
    { code: 'N2', label: 'N2', criterion: 'Birden fazla bÃ¶lgesel lenf nodu metastazÄ±' },
  ],
  M: [
    { code: 'M0', label: 'M0', criterion: 'Uzak metastaz yok' },
    { code: 'M1', label: 'M1', criterion: 'Uzak metastaz mevcut' },
  ],
};
TNM_DATABASE['prostate-testis'] = {
  T: [
    { code: 'I', label: 'Evre I', criterion: 'Seminom testise sÄ±nÄ±rlÄ±, tÃ¼mÃ¶r belirteÃ§leri ve gÃ¶rÃ¼ntÃ¼leme ile N0M0' },
    { code: 'IIA', label: 'Evre IIA', criterion: 'Retroperitoneal lenf nodu metastazÄ±, en bÃ¼yÃ¼k Ã§ap â‰¤2 cm' },
    { code: 'IIB', label: 'Evre IIB', criterion: 'Retroperitoneal lenf nodu metastazÄ±, en bÃ¼yÃ¼k Ã§ap >2-5 cm' },
  ],
  N: [
    { code: 'N0', label: 'N0', criterion: 'Retroperitoneal lenf nodu metastazÄ± yok' },
    { code: 'N1', label: 'N1', criterion: 'Metastatik nodal kitle â‰¤2 cm' },
    { code: 'N2', label: 'N2', criterion: 'Metastatik nodal kitle >2-5 cm' },
  ],
  M: [
    { code: 'M0', label: 'M0', criterion: 'Uzak metastaz yok' },
    { code: 'M1', label: 'M1', criterion: 'Uzak metastaz mevcut' },
  ],
};
TNM_DATABASE['prostate-penis'] = {
  T: [
    { code: 'T1', label: 'T1', criterion: 'Subepitelyal baÄŸ dokusuna invazyon' },
    { code: 'T2', label: 'T2', criterion: 'Corpus spongiosum veya cavernosum invazyonu' },
    { code: 'T3', label: 'T3', criterion: 'Ãœretra veya prostat invazyonu' },
    { code: 'T4', label: 'T4', criterion: 'DiÄŸer komÅŸu yapÄ±lara invazyon' },
  ],
  N: [
    { code: 'N0', label: 'N0', criterion: 'BÃ¶lgesel lenf nodu metastazÄ± yok' },
    { code: 'N1', label: 'N1', criterion: 'Tek unilateral inguinal lenf nodu' },
    { code: 'N2', label: 'N2', criterion: 'Ã‡oklu veya bilateral inguinal lenf nodu' },
    { code: 'N3', label: 'N3', criterion: 'Pelvik nodal metastaz veya ekstranodal yayÄ±lÄ±m' },
  ],
  M: [
    { code: 'M0', label: 'M0', criterion: 'Uzak metastaz yok' },
    { code: 'M1', label: 'M1', criterion: 'Uzak metastaz mevcut' },
  ],
};
TNM_DATABASE['breast-dcis'] = {
  T: [{ code: 'Tis', label: 'Tis (DCIS)', criterion: 'Duktal karsinoma in situ; stromal invazyon yok' }],
  N: [{ code: 'N0', label: 'N0', criterion: 'BÃ¶lgesel lenf nodu metastazÄ± yok' }],
  M: [{ code: 'M0', label: 'M0', criterion: 'Uzak metastaz yok' }],
};
TNM_DATABASE['breast-phyllodes'] = {
  T: [
    { code: 'T1', label: 'T1', criterion: 'TÃ¼mÃ¶r Ã§apÄ± â‰¤5 cm' },
    { code: 'T2', label: 'T2', criterion: 'TÃ¼mÃ¶r Ã§apÄ± >5 cm' },
  ],
  N: [{ code: 'N0', label: 'N0', criterion: 'Rutin elektif aksiller nodal Ä±ÅŸÄ±nlama endikasyonu yok' }],
  M: [
    { code: 'M0', label: 'M0', criterion: 'Uzak metastaz yok' },
    { code: 'M1', label: 'M1', criterion: 'Uzak metastaz mevcut' },
  ],
};
TNM_DATABASE['head-neck-hypopharynx'] = {
  T: [
    { code: 'T1', label: 'T1', criterion: 'Hipofarenksin tek alt bÃ¶lgesinde, Ã§ap â‰¤2 cm' },
    { code: 'T2', label: 'T2', criterion: 'Birden fazla alt bÃ¶lge veya komÅŸu bÃ¶lge tutulumu, Ã§ap â‰¤4 cm' },
    { code: 'T3', label: 'T3', criterion: 'Ã‡ap >4 cm veya hemilarinks fiksasyonu' },
    { code: 'T4', label: 'T4', criterion: 'Tiroid/kÄ±kÄ±rdak veya komÅŸu yapÄ± invazyonu' },
  ],
  N: [
    { code: 'N0', label: 'N0', criterion: 'BÃ¶lgesel lenf nodu metastazÄ± yok' },
    { code: 'N1', label: 'N1', criterion: 'Tek ipsilateral nod â‰¤3 cm' },
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
    { code: 'T1', label: 'T1', criterion: 'TÃ¼mÃ¶r â‰¤2 cm ve DOI â‰¤5 mm' },
    { code: 'T2', label: 'T2', criterion: 'TÃ¼mÃ¶r â‰¤2 cm ve DOI >5-10 mm veya >2-4 cm ve DOI â‰¤10 mm' },
    { code: 'T3', label: 'T3', criterion: 'TÃ¼mÃ¶r >4 cm veya DOI >10 mm' },
    { code: 'T4a', label: 'T4a', criterion: 'Kortikal kemik, maksiller sinÃ¼s veya yÃ¼z cildi invazyonu' },
    { code: 'T4b', label: 'T4b', criterion: 'MastikatÃ¶r alan, pterigoid plak, kafa tabanÄ± veya karotis Ã§evresi invazyonu' },
  ],
  N: [
    { code: 'N0', label: 'N0', criterion: 'BÃ¶lgesel lenf nodu metastazÄ± yok' },
    { code: 'N1', label: 'N1', criterion: 'Tek ipsilateral nod â‰¤3 cm, ENE negatif' },
    { code: 'N2', label: 'N2', criterion: 'Ã‡oklu/bilateral nodlar â‰¤6 cm, ENE negatif' },
    { code: 'N3', label: 'N3', criterion: 'Nod >6 cm veya klinik olarak anlamlÄ± ENE' },
  ],
  M: [
    { code: 'M0', label: 'M0', criterion: 'Uzak metastaz yok' },
    { code: 'M1', label: 'M1', criterion: 'Uzak metastaz mevcut' },
  ],
};
TNM_DATABASE['head-neck-salivary'] = {
  T: [
    { code: 'T1', label: 'T1', criterion: 'TÃ¼mÃ¶r â‰¤2 cm, ekstraparenkimal yayÄ±lÄ±m yok' },
    { code: 'T2', label: 'T2', criterion: 'TÃ¼mÃ¶r >2-4 cm, ekstraparenkimal yayÄ±lÄ±m yok' },
    { code: 'T3', label: 'T3', criterion: 'TÃ¼mÃ¶r >4 cm veya ekstraparenkimal yumuÅŸak doku yayÄ±lÄ±mÄ±' },
    { code: 'T4a', label: 'T4a', criterion: 'Deri, mandibula, dÄ±ÅŸ kulak yolu veya fasiyal sinir invazyonu' },
    { code: 'T4b', label: 'T4b', criterion: 'Kafa tabanÄ±, pterigoid plak veya karotis Ã§evresi invazyonu' },
  ],
  N: [
    { code: 'N0', label: 'N0', criterion: 'BÃ¶lgesel lenf nodu metastazÄ± yok' },
    { code: 'N1', label: 'N1', criterion: 'Tek ipsilateral nod â‰¤3 cm, ENE negatif' },
    { code: 'N2', label: 'N2', criterion: 'Nod >3-6 cm veya Ã§oklu/bilateral nodal hastalÄ±k' },
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
    { code: 'Soliter', label: 'Soliter', criterion: 'Tek kemik veya ekstramedÃ¼ller plazmasitom' },
    { code: 'Multifokal', label: 'Multifokal', criterion: 'Birden fazla kemik lezyonu; miyelom deÄŸerlendirmesi gerekir' },
  ],
  N: [{ code: 'N0', label: 'N0', criterion: 'BÃ¶lgesel lenf nodu tutulumu yok' }],
  M: [
    { code: 'M0', label: 'M0', criterion: 'Tek lokalize plazmasitom' },
    { code: 'M1', label: 'M1', criterion: 'Ek odak veya sistemik hastalÄ±k' },
  ],
};
TNM_DATABASE['hematologic-Myeloma'] = {
  T: [{ code: 'Semptomatik', label: 'Semptomatik', criterion: 'AÄŸrÄ±lÄ± litik lezyon veya patolojik fraktÃ¼r riski' }],
  N: [{ code: 'N0', label: 'N0', criterion: 'Nodal evreleme uygulanmaz' }],
  M: [{ code: 'Sistemik', label: 'Sistemik', criterion: 'Sistemik multipl miyelom' }],
};
TNM_DATABASE['pediatric-Medulloblastom'] = TNM_DATABASE.pediatric;
TNM_DATABASE['pediatric-Wilms'] = {
  T: [
    { code: 'I-II', label: 'Evre I-II', criterion: 'BÃ¶breÄŸe sÄ±nÄ±rlÄ± veya cerrahiyle tamamen Ã§Ä±karÄ±lmÄ±ÅŸ tÃ¼mÃ¶r' },
    { code: 'III', label: 'Evre III', criterion: 'KarÄ±n iÃ§inde rezidÃ¼, nodal tutulum veya fokal/diffÃ¼z anaplazi' },
  ],
  N: [
    { code: 'N0', label: 'N0', criterion: 'BÃ¶lgesel nodal tutulum yok' },
    { code: 'N1', label: 'N1', criterion: 'BÃ¶lgesel lenf nodu tutulumu' },
  ],
  M: [
    { code: 'M0', label: 'M0', criterion: 'Uzak metastaz yok' },
    { code: 'M1', label: 'M1', criterion: 'Uzak metastaz, sÄ±klÄ±kla akciÄŸer' },
  ],
};
TNM_DATABASE['pediatric-Neuroblastom'] = {
  T: [
    { code: 'L1', label: 'L1', criterion: 'GÃ¶rÃ¼ntÃ¼lemede risk faktÃ¶rÃ¼ olmayan lokalize tÃ¼mÃ¶r' },
    { code: 'L2', label: 'L2', criterion: 'Bir veya daha fazla gÃ¶rÃ¼ntÃ¼leme tanÄ±mlÄ± risk faktÃ¶rÃ¼ olan lokalize tÃ¼mÃ¶r' },
    { code: 'M', label: 'M', criterion: 'Uzak metastatik hastalÄ±k' },
  ],
  N: [{ code: 'N0', label: 'N0', criterion: 'Lenf nodu tutulumu yok' }, { code: 'N1', label: 'N1', criterion: 'Ä°psilateral bÃ¶lgesel nod tutulumu' }],
  M: [{ code: 'M0', label: 'M0', criterion: 'Uzak metastaz yok' }, { code: 'M1', label: 'M1', criterion: 'Uzak metastaz mevcut' }],
};
TNM_DATABASE['breast-breast'] = TNM_DATABASE.breast;
TNM_DATABASE.breast.T = TNM_DATABASE.breast.T.filter(option => option.code !== 'T4').concat([
  { code: 'T4a', label: 'T4a', criterion: 'GÃ¶ÄŸÃ¼s duvarÄ± invazyonu (kaburgalar, interkostal kaslar; pektoral kas hariÃ§)' },
  { code: 'T4b', label: 'T4b', criterion: 'Ciltte Ã¶dem (peau dâ€™orange), Ã¼lserasyon veya satellit cilt nodÃ¼lleri' },
  { code: 'T4c', label: 'T4c', criterion: 'T4a ve T4b Ã¶zelliklerinin birlikte bulunmasÄ±' },
  { code: 'T4d', label: 'T4d', criterion: 'Ä°nflamatuar meme karsinomu (memenin en az 1/3â€™Ã¼nde diffÃ¼z eritem ve Ã¶dem)' },
]);
TNM_DATABASE['breast-breast'] = TNM_DATABASE.breast;
TNM_DATABASE['gis-Ozofagus'] = {
  T: [
    { code: 'T1a', label: 'T1a', criterion: 'Lamina propria veya muskularis mukoza invazyonu' },
    { code: 'T1b', label: 'T1b', criterion: 'Submukoza invazyonu' },
    { code: 'T2', label: 'T2', criterion: 'Muskularis propria invazyonu' },
    { code: 'T3', label: 'T3', criterion: 'Adventisya invazyonu' },
    { code: 'T4a', label: 'T4a', criterion: 'Rezekabl komÅŸu organ invazyonu (plevra, perikard, diyafram)' },
    { code: 'T4b', label: 'T4b', criterion: 'Ä°nrezekabl komÅŸu organ invazyonu (aort, trakea, vertebra)' },
  ],
  N: [
    { code: 'N0', label: 'N0', criterion: 'BÃ¶lgesel lenf nodu metastazÄ± yok' },
    { code: 'N1', label: 'N1', criterion: '1-2 bÃ¶lgesel lenf nodu' },
    { code: 'N2', label: 'N2', criterion: '3-6 bÃ¶lgesel lenf nodu' },
    { code: 'N3', label: 'N3', criterion: 'â‰¥7 bÃ¶lgesel lenf nodu' },
  ],
  M: [{ code: 'M0', label: 'M0', criterion: 'Uzak metastaz yok' }, { code: 'M1', label: 'M1', criterion: 'Uzak metastaz mevcut' }],
};
TNM_DATABASE['gis-Pankreas'] = {
  T: [
    { code: 'T1', label: 'T1', criterion: 'TÃ¼mÃ¶r â‰¤2 cm (pankreasa sÄ±nÄ±rlÄ±)' },
    { code: 'T2', label: 'T2', criterion: 'TÃ¼mÃ¶r >2 cm ama â‰¤4 cm' },
    { code: 'T3', label: 'T3', criterion: 'TÃ¼mÃ¶r >4 cm (Ã§Ã¶lyak aks veya SMA tutulumu yok)' },
    { code: 'T4', label: 'T4', criterion: 'Ã‡Ã¶lyak aks, SMA veya ana hepatik arter tutulumu (inrezekabl lokal ileri)' },
  ],
  N: [{ code: 'N0', label: 'N0', criterion: 'BÃ¶lgesel LN metastazÄ± yok' }, { code: 'N1', label: 'N1', criterion: '1-3 bÃ¶lgesel LN' }, { code: 'N2', label: 'N2', criterion: 'â‰¥4 bÃ¶lgesel LN' }],
  M: [{ code: 'M0', label: 'M0', criterion: 'Uzak metastaz yok' }, { code: 'M1', label: 'M1', criterion: 'Uzak metastaz mevcut' }],
};
TNM_DATABASE['gis-Karaciger'] = {
  T: [
    { code: 'T1a', label: 'T1a', criterion: 'Tek lezyon â‰¤2 cm; vaskÃ¼ler invazyon yok' },
    { code: 'T1b', label: 'T1b', criterion: 'Tek lezyon â‰¤2 cm; mikrovaskÃ¼ler invazyon mevcut' },
    { code: 'T2', label: 'T2', criterion: 'Tek lezyon >2 cm veya vaskÃ¼ler invazyonlu tek lezyon' },
    { code: 'T3', label: 'T3', criterion: 'Ã‡apÄ± >5 cm olan Ã§oklu lezyonlar veya ana portal/hepatik ven dalÄ± invazyonu' },
    { code: 'T4', label: 'T4', criterion: 'KomÅŸu organ invazyonu (safra kesesi hariÃ§) veya visseral periton perforasyonu' },
  ],
  N: [
    { code: 'N0', label: 'N0', criterion: 'BÃ¶lgesel lenf nodu metastazÄ± yok' },
    { code: 'N1', label: 'N1', criterion: 'BÃ¶lgesel lenf nodu metastazÄ± mevcut' },
  ],
  M: [
    { code: 'M0', label: 'M0', criterion: 'Uzak metastaz yok' },
    { code: 'M1', label: 'M1', criterion: 'Uzak organ/peritoneal metastaz mevcut' },
  ],
};
TNM_DATABASE['gis-liver-metastasis'] = {
  T: [{ code: 'N/A', label: 'N/A', criterion: 'The liver lesion is metastatic; stage the colorectal primary separately.' }],
  N: [{ code: 'N/A', label: 'N/A', criterion: 'Primary-tumor nodal status is staged separately.' }],
  M: [{ code: 'M1', label: 'M1', criterion: 'Distant metastatic disease involving the liver.' }],
};
TNM_DATABASE['gis-SafraYollari'] = {
  T: [
    { code: 'T1', label: 'T1', criterion: 'Site-specific early wall/depth-limited primary; use the intrahepatic, perihilar, distal or gallbladder AJCC definition.' },
    { code: 'T2', label: 'T2', criterion: 'Site-specific local extension; criteria differ by biliary subsite.' },
    { code: 'T3', label: 'T3', criterion: 'Advanced local extension or vascular/serosal involvement; consult site-specific AJCC criteria.' },
    { code: 'T4', label: 'T4', criterion: 'Major vascular or adjacent-organ involvement; consult site-specific AJCC criteria.' },
  ],
  N: [
    { code: 'N0', label: 'N0', criterion: 'No regional lymph-node metastasis.' },
    { code: 'N1', label: 'N1', criterion: 'Regional lymph-node metastasis; definitions vary by site.' },
  ],
  M: [
    { code: 'M0', label: 'M0', criterion: 'No distant metastasis.' },
    { code: 'M1', label: 'M1', criterion: 'Distant metastasis.' },
  ],
};
TNM_DATABASE['prostate-kidney'] = {
  T: [
    { code: 'T1a', label: 'T1a', criterion: 'Tumour â‰¤4 cm, limited to the kidney.' },
    { code: 'T1b', label: 'T1b', criterion: 'Tumour >4 cm and â‰¤7 cm, limited to the kidney.' },
    { code: 'T2', label: 'T2', criterion: 'Tumour >7 cm, limited to the kidney (subcategories depend on size).' },
    { code: 'T3', label: 'T3', criterion: 'Renal vein/segmental branches, perirenal or renal sinus fat, or vena cava involvement without extension beyond Gerota fascia.' },
    { code: 'T4', label: 'T4', criterion: 'Extension beyond Gerota fascia, including contiguous ipsilateral adrenal involvement.' },
  ],
  N: [
    { code: 'N0', label: 'N0', criterion: 'No regional lymph-node metastasis.' },
    { code: 'N1', label: 'N1', criterion: 'Regional lymph-node metastasis.' },
  ],
  M: [
    { code: 'M0', label: 'M0', criterion: 'No distant metastasis.' },
    { code: 'M1', label: 'M1', criterion: 'Distant metastasis.' },
  ],
};
TNM_DATABASE['pediatric-Ewing'] = TNM_DATABASE['bone-sarcoma-Ewing'];
TNM_DATABASE['skin-BCC'] = TNM_DATABASE.skin;
TNM_DATABASE['skin-SCC'] = TNM_DATABASE.skin;
TNM_DATABASE['skin-Melanom'] = TNM_DATABASE.skin;
TNM_DATABASE['skin-Merkel'] = TNM_DATABASE.skin;
TNM_DATABASE['bone-sarcoma-DFSP'] = TNM_DATABASE['bone-sarcoma-Yumusak_Doku'];
TNM_DATABASE['prostate-testis'] = TNM_DATABASE['prostate-testis'] || TNM_DATABASE['prostate'];
TNM_DATABASE['gis-anus'] = TNM_DATABASE['gis-anus'] || TNM_DATABASE['gis-Rektum'];
TNM_DATABASE['head-neck-salivary'] = TNM_DATABASE['head-neck-salivary'] || TNM_DATABASE['head-neck-nasopharynx'];
TNM_DATABASE['cns-glioma'] = {
  T: [
    { code: 'Grade-1', label: 'WHO Grade 1', criterion: 'Pilositik astrositom veya dÃ¼ÅŸÃ¼k dereceli circumscribed gliom' },
    { code: 'Grade-2', label: 'WHO Grade 2', criterion: 'DÃ¼ÅŸÃ¼k dereceli diffÃ¼z astrositom veya oligodendrogliom' },
    { code: 'Grade-3', label: 'WHO Grade 3', criterion: 'Anaplastik astrositom veya anaplastik oligodendrogliom' },
    { code: 'Grade-4', label: 'WHO Grade 4', criterion: 'Glioblastom veya diÄŸer yÃ¼ksek dereceli diffÃ¼z gliom' },
  ],
  N: [{ code: 'N0', label: 'N0', criterion: 'Beyin parankiminde bÃ¶lgesel lenf nodu evrelemesi uygulanmaz' }],
  M: [
    { code: 'M0', label: 'M0', criterion: 'Uzak metastaz saptanmadÄ±' },
    { code: 'M1', label: 'M1', criterion: 'Leptomeningeal veya uzak ekstrakraniyal yayÄ±lÄ±m' },
  ],
};
TNM_DATABASE['gynecology-ovary'] = {
  T: [
    { code: 'FIGO-I', label: 'FIGO I', criterion: 'TÃ¼mÃ¶r over/fallop tÃ¼pÃ¼ ile sÄ±nÄ±rlÄ±' },
    { code: 'FIGO-II', label: 'FIGO II', criterion: 'Pelvise uzanÄ±m veya primer peritoneal yayÄ±lÄ±m' },
    { code: 'FIGO-III', label: 'FIGO III', criterion: 'Ekstrapelvik peritoneal yayÄ±lÄ±m ve/veya retroperitoneal nod' },
    { code: 'FIGO-IV', label: 'FIGO IV', criterion: 'Uzak metastaz veya malign plevral efÃ¼zyon' },
  ],
  N: [
    { code: 'N0', label: 'N0', criterion: 'Retroperitoneal lenf nodu metastazÄ± yok' },
    { code: 'N1', label: 'N1', criterion: 'Retroperitoneal lenf nodu metastazÄ± mevcut' },
  ],
  M: [
    { code: 'M0', label: 'M0', criterion: 'Uzak metastaz yok' },
    { code: 'M1', label: 'M1', criterion: 'Uzak metastaz mevcut' },
  ],
};
TNM_DATABASE['skin-merkel'] = TNM_DATABASE['skin-merkel'] || TNM_DATABASE.skin;
TNM_DATABASE['hematologic-myeloma'] = TNM_DATABASE['hematologic-myeloma'] || TNM_DATABASE['hematologic-Myeloma'];
TNM_DATABASE['bone'] = TNM_DATABASE['bone'] || TNM_DATABASE['bone-sarcoma-Osteosarkom'];
TNM_DATABASE['sarcoma'] = TNM_DATABASE['sarcoma'] || TNM_DATABASE['bone-sarcoma-Yumusak_Doku'];
for (const key of [
  'breast-idc', 'breast-ilc', 'breast-inflammatory', 'breast-metaplastic',
  'gynecology-ovary', 'hematologic-all', 'hematologic-cll',
  'pediatric-rhabdo', 'pediatric-ewing', 'palliative-brain', 'palliative-bleeding',
  'skin-mycosis', 'skin-kaposi', 'benign-pituitary', 'benign-gynecomastia',
  'sarcoma-extremity', 'sarcoma-retroperitoneal', 'sarcoma-rhabdomyosarcoma', 'sarcoma-liposarcoma',
  'bone-osteosarcoma', 'bone-ewing', 'bone-chondrosarcoma', 'bone-chordoma', 'bone-gctb',
]) {
  const organ = key.split('-')[0];
  TNM_DATABASE[key] = TNM_DATABASE[key] || TNM_DATABASE[organ] || TNM_DATABASE['thorax-nsclc'];
}

// Fallback atamalarÄ±
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

  return `SayÄ±n Onkoloji DanÄ±ÅŸmanÄ±, aÅŸaÄŸÄ±daki radyasyon onkolojisi vakasÄ±nÄ± NCCN v1.2025, ASTRO, ESTRO ve gÃ¼ncel randomize Faz III klinik Ã§alÄ±ÅŸma kanÄ±tlarÄ± doÄŸrultusunda deÄŸerlendirmenizi rica ediyorum:

KLÄ°NÄ°K VAKA BÄ°LGÄ°LERÄ°:
- Anatomik BÃ¶lge: ${organ.toUpperCase()} - ${subsite}
- Evreleme: ${t} ${n} ${m}
${riskGroup ? `- Risk Grubu / BiyobelirteÃ§ler: ${riskGroup}` : ''}
- Planlanan ReÃ§ete: ${totalDose || ''} (${schemeName || ''})

DEÄERLENDÄ°RÄ°LMESÄ° Ä°STENEN NOKTALAR:
1. Bu evre ve risk profili iÃ§in Ã¶nerilen fraksiyonasyon ÅŸemasÄ± ve biyolojik eÅŸdeÄŸer doz (BED/EQD2) uygunluÄŸu nedir?
2. EÅŸzamanlÄ± veya ardÄ±ÅŸÄ±k sistemik tedavi (Kemoterapi, ADT, Ä°mmÃ¼noterapi) endikasyonu ve kanÄ±t dÃ¼zeyi nedir?
3. Hedef hacim marjinleri (CTV/PTV) ve ICRU 83 / QUANTEC kritik organ (OAR) toleranslarÄ± aÃ§Ä±sÄ±ndan dikkat edilmesi gereken Ã¶zel riskler nelerdir?
4. Bu klinik senaryoyu destekleyen gÃ¼ncel landmark Faz III Ã§alÄ±ÅŸmalar hangileridir?`;
};


type EvidenceReference = {
  label: string;
  url: string;
};

const evidenceLinkTokens = /(FAST[-\s]?Forward|PACIFIC|RAPIDO|STAMPEDE|PORTEC-3|NCCN|ASTRO|ESTRO|QUANTEC|DEGRO|ILROG|ESMO|EANO|FIGO|DOI:\s*10\.\d{4,9}\/[^\s;,]+)/gi;

const resolveEvidenceUrl = (token: string, clinicalContext = ''): string | undefined => {
  if (/FAST[-\s]?Forward/i.test(token)) return 'https://doi.org/10.1016/S0140-6736(20)30932-6';
  if (/PACIFIC/i.test(token)) return 'https://doi.org/10.1056/NEJMoa1709937';
  if (/RAPIDO/i.test(token)) return 'https://doi.org/10.1016/S1470-2045(20)30555-6';
  if (/STAMPEDE/i.test(token)) return 'https://doi.org/10.1016/S1470-2045(18)30524-1';
  if (/PORTEC-3/i.test(token)) return 'https://doi.org/10.1016/S1470-2045(18)30079-2';
  if (/NCCN/i.test(token)) return 'https://www.nccn.org/guidelines';
  if (/ASTRO/i.test(token)) {
    return /breast|meme|whole breast/i.test(clinicalContext)
      ? 'https://www.practicalradonc.org/article/S1879-8500(18)30116-6/fulltext'
      : 'https://www.astro.org/provider-resources/guidelines';
  }
  if (/ESTRO/i.test(token)) return 'https://www.estro.org/Science/Guidelines';
  if (/QUANTEC/i.test(token)) return 'https://doi.org/10.1016/j.ijrobp.2009.07.1753';
  if (/DEGRO/i.test(token)) return 'https://www.degro.org/';
  if (/ILROG/i.test(token)) return 'https://www.ilrog.org/';
  if (/ESMO/i.test(token)) return 'https://www.esmo.org/guidelines';
  if (/EANO/i.test(token)) return 'https://www.eano.eu/guidelines/';
  if (/FIGO/i.test(token)) return 'https://www.figo.org/guidelines';

  const doi = token.match(/DOI:\s*(10\.\d{4,9}\/[^\s;,]+)/i);
  return doi ? `https://doi.org/${doi[1].replace(/[.)]+$/, '')}` : undefined;
};

const getEvidenceReferences = (scheme: DoseScheme, clinicalContext: string): EvidenceReference[] => {
  const evidence = `${clinicalContext}; ${scheme.name}; ${scheme.evidence}`;
  const references: EvidenceReference[] = [];

  for (const token of evidence.match(evidenceLinkTokens) ?? []) {
    const url = resolveEvidenceUrl(token, evidence);
    if (!url || references.some(reference => reference.url === url)) continue;
    references.push({
      label: /FAST[-\s]?Forward/i.test(token)
        ? 'FAST-Forward (Lancet 2020)'
        : /ASTRO/i.test(token) && /breast|meme|whole breast/i.test(evidence)
          ? 'ASTRO Whole Breast Irradiation Guideline'
          : token,
      url,
    });
  }

  return references;
};

const CDSS_VIEW_MODE_STORAGE_KEY = 'radonco-cdss-view-mode';
const CDSS_VIEW_MODE_CHANGE_EVENT = 'radonco:cdss-view-mode-change';

const subscribeToViewMode = (onStoreChange: () => void) => {
  window.addEventListener(CDSS_VIEW_MODE_CHANGE_EVENT, onStoreChange);
  window.addEventListener('storage', onStoreChange);
  return () => {
    window.removeEventListener(CDSS_VIEW_MODE_CHANGE_EVENT, onStoreChange);
    window.removeEventListener('storage', onStoreChange);
  };
};

const getGuidedModeSnapshot = () => (
  window.localStorage.getItem(CDSS_VIEW_MODE_STORAGE_KEY) !== 'full-matrix'
);

const getServerGuidedModeSnapshot = () => true;

export default function RadoncoCDSSPage() {
  const { isLoaded, user } = useUser();
  const router = useRouter();
  const { language: lang } = useLanguage();
  const isGuidedMode = useSyncExternalStore(
    subscribeToViewMode,
    getGuidedModeSnapshot,
    getServerGuidedModeSnapshot,
  );
  const [guidedStep, setGuidedStep] = useState<GuidedStep>(1);
  const [printMetadata, setPrintMetadata] = useState({ timestamp: '', reportId: '' });
  const [activeReferenceTab, setActiveReferenceTab] = useState<'guidelines' | 'oar' | 'disclaimer'>('guidelines');
  const tText = useCallback((text: string | undefined): string => {
    if (!text) return '';
    if (lang === 'tr') return text;
    if (TRANSLATION_MAP[text]) return TRANSLATION_MAP[text];

    return text.replace(TRANSLATION_MATCHER, match => TRANSLATION_MAP[match] ?? match);
  }, [lang]);
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
    document.documentElement.classList.add('dark');
  }, []);

  useEffect(() => {
    if (!isGuidedMode) return;
    document.getElementById('cdss-main-content')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, [guidedStep, isGuidedMode]);

  // ==========================================
  // ANA ORGAN VE EVRE DURUMU
  // ==========================================
  const [selectedOrgan, setSelectedOrgan] = useState<OrganId>('thorax');
  const [selectedQuickCaseId, setSelectedQuickCaseId] = useState<string | null>(null);
  const [openCategories, setOpenCategories] = useState<string[]>(['emergencies', 'thorax']);
  const [isAnatomicRegionsOpen, setIsAnatomicRegionsOpen] = useState(true);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);
  const [activeMobilePanel, setActiveMobilePanel] = useState<'parameters' | 'tnm' | 'prescription'>('parameters');
  const setViewMode = (useGuidedMode: boolean) => {
    window.localStorage.setItem(CDSS_VIEW_MODE_STORAGE_KEY, useGuidedMode ? 'guided' : 'full-matrix');
    window.dispatchEvent(new Event(CDSS_VIEW_MODE_CHANGE_EVENT));
    setGuidedStep(1);
    setActiveMobilePanel('parameters');
  };
  const [selectedT, setSelectedT] = useState<string>('T1b');
  const [selectedN, setSelectedN] = useState<string>('N0');
  const [selectedM, setSelectedM] = useState<string>('M0');
  const [patientAgeYears, setPatientAgeYears] = useState<string>('');
  const [patientGender, setPatientGender] = useState<string>('');
  const [patientId, setPatientId] = useState<string>('');
  const [favoritePresetIds, setFavoritePresetIds] = useState<string[]>([]);
    const [customFavorites, setCustomFavorites] = useState<CustomFavoriteCase[]>([]);
    const [caseArchive, setCaseArchive] = useState<ArchivedClinicalCase[]>([]);
  const [isCaseArchiveOpen, setIsCaseArchiveOpen] = useState(false);
  const [selectedSubsite, setSelectedSubsite] = useState<string>('benign-ho');
  const [benignClinicalStatus, setBenignClinicalStatus] = useState<string>('postop-24h');

  // ==========================================
  // 1. TORAKS ALT BAÅLIKLARI VE RÄ°SK FAKTÃ–RLERÄ°
  // ==========================================
  const [thoraxSubtype, setThoraxSubtype] = useState<'nsclc' | 'sclc' | 'thymoma' | 'mesothelioma'>('nsclc');
  const [thoraxCentrality, setThoraxCentrality] = useState<'Peripheral' | 'Central' | 'UltraCentral'>('Peripheral');
  const [breathingMotion, setBreathingMotion] = useState<'4D-CT' | 'DIBH'>('4D-CT');
  const [thoraxSurgeryStatus, setThoraxSurgeryStatus] = useState<'Inoperable' | 'Operable' | 'Postop_R0' | 'Postop_R1_R2'>('Inoperable');
  // KHAK (SCLC)
  const [sclcStage, setSclcStage] = useState<'Sinirli' | 'Yaygin'>('Sinirli');
  const [sclcTiming, setSclcTiming] = useState<'Erken_BID_45Gy' | 'Standart_QD_60Gy'>('Erken_BID_45Gy');
  // Timoma
  const [thymomaStage, setThymomaStage] = useState<'Masaoka_I' | 'Masaoka_II' | 'Masaoka_III' | 'Masaoka_IV'>('Masaoka_II');
  const [thymomaMargin, setThymomaMargin] = useState<'R0' | 'R1' | 'R2'>('R0');
  const [thymicHistology, setThymicHistology] = useState<'thymoma' | 'thymic-carcinoma'>('thymoma');
  const [nsclcHistology, setNsclcHistology] = useState<'adenocarcinoma' | 'squamous' | 'lcnec'>('adenocarcinoma');
  // Mezotelyoma
  const [mesoIntent, setMesoIntent] = useState<'Palyatif' | 'Hemitorasik_Postop' | 'Dren_Yeri'>('Palyatif');

  // ==========================================
  // 2. GÃœS / PROSTAT ALT BAÅLIKLARI
  // ==========================================
  const [gusSubtype, setGusSubtype] = useState<'prostate' | 'bladder' | 'testis' | 'penile' | 'kidney'>('prostate');
  const [gleasonPrimary, setGleasonPrimary] = useState<string>('3');
  const [gleasonSecondary, setGleasonSecondary] = useState<string>('4');
  const [psaLevel, setPsaLevel] = useState<string>('8.5');
  const [hasECE, setHasECE] = useState<boolean>(false);
  const [hasSVI, setHasSVI] = useState<boolean>(false);
  const [positiveCorePercent, setPositiveCorePercent] = useState<string>('35');
  const [bladderTurbtComplete, setBladderTurbtComplete] = useState<boolean>(true);
  const [bladderTmtSuitable, setBladderTmtSuitable] = useState<boolean>(true);
  const [prostateHistology, setProstateHistology] = useState<'acinar' | 'ductal' | 'nepc'>('acinar');
  const [testisHistology, setTestisHistology] = useState<'seminoma' | 'nonseminoma'>('seminoma');
  const [bladderHistology, setBladderHistology] = useState<'urothelial' | 'non-urothelial'>('urothelial');
  const [renalHistology, setRenalHistology] = useState<'clear-cell' | 'papillary' | 'chromophobe'>('clear-cell');
  const [renalDiseaseSetting, setRenalDiseaseSetting] = useState<'primary-inoperable' | 'oligometastatic'>('primary-inoperable');
  const [renalTumorSizeCm, setRenalTumorSizeCm] = useState('3');

  // ==========================================
  // 3. MEME RÄ°SK FAKTÃ–RLERÄ°
  // ==========================================
  const [breastHistology, setBreastHistology] = useState<string>('Ä°nvaziv Duktal Karsinom (Ä°DK)');
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
  // 4. GÄ°S ALT BAÅLIKLARI
  // ==========================================
  const [gisOrgan, setGisOrgan] = useState<'Rektum' | 'Mide' | 'Ozofagus' | 'Pankreas' | 'Anal' | 'Karaciger' | 'SafraYollari'>('Rektum');
  const [liverHistology, setLiverHistology] = useState<'hcc' | 'colorectal-metastasis'>('hcc');
  const [liverBclcStage, setLiverBclcStage] = useState<'0' | 'A' | 'B' | 'C'>('A');
  const [biliaryHistology, setBiliaryHistology] = useState<'intrahepatic' | 'perihilar' | 'extrahepatic' | 'gallbladder'>('intrahepatic');
  const [biliaryTreatmentSetting, setBiliaryTreatmentSetting] = useState<'adjuvant' | 'unresectable'>('adjuvant');
  const [biliaryMarginStatus, setBiliaryMarginStatus] = useState<'R0' | 'R1'>('R0');
  const [gisCrmStatus, setGisCrmStatus] = useState<'Negatif' | 'Pozitif'>('Negatif');

  // ==========================================
  // 5. BAÅ-BOYUN ALT BAÅLIKLARI
  // ==========================================
  const [hnSubsite, setHnSubsite] = useState<'nasopharynx' | 'oropharynx' | 'larynx' | 'hypopharynx' | 'maxillary-sinus' | 'oral-cavity' | 'salivary'>('nasopharynx');
  const [hnLarynxSubsite, setHnLarynxSubsite] = useState<'Erken_Glottik_T1_T2' | 'Lokal_Ileri_T3_T4'>('Erken_Glottik_T1_T2');
  const [hnCrossesMidline, setHnCrossesMidline] = useState<boolean>(false);
  const [hnDistanceFromMidlineCm, setHnDistanceFromMidlineCm] = useState<string>('2');
  const [hnTumorSizeCm, setHnTumorSizeCm] = useState<string>('1.5');
  const [hnDoiMm, setHnDoiMm] = useState<string>('4');
  const [hnENE, setHnENE] = useState<boolean>(false);
  const [hnPositiveMargin, setHnPositiveMargin] = useState<boolean>(false);

  // ==========================================
  // 6. MSS / BEYÄ°N ALT BAÅLIKLARI
  // ==========================================
  const [cnsSubtype, setCnsSubtype] = useState<'mets' | 'gbm' | 'glioma' | 'meningioma'>('mets');
  const [gliomaGrade, setGliomaGrade] = useState<'Grade_1' | 'Grade_2' | 'Grade_3' | 'Grade_4'>('Grade_2');
  const [gliomaRiskFactors, setGliomaRiskFactors] = useState({
    age40: false,
    subtotalResection: false,
    largeOrCrossing: false,
    neurologicSymptoms: false,
    molecularHighRisk: false,
  });
  const [cnsMidlineShift, setCnsMidlineShift] = useState<'Yok' | '<5mm' | '>=5mm'>('Yok');
  const [cnsMetCount, setCnsMetCount] = useState<string>('1');
  const [cnsMaxDiameter, setCnsMaxDiameter] = useState<string>('1.8');
  const [cnsSymptoms, setCnsSymptoms] = useState<'Asimptomatik' | 'Semptomatik'>('Asimptomatik');
  const [cnsResection, setCnsResection] = useState<'Yok' | 'GTR' | 'STR' | 'Biyopsi'>('Yok');
  const [meningiomaSimpson, setMeningiomaSimpson] = useState<'I-III' | 'IV-V'>('I-III');
  const [cnsKps, setCnsKps] = useState<string>('90');
  const [gbmPerformance, setGbmPerformance] = useState<'Iyi_ECOG_0_1' | 'Duskun_Yasli'>('Iyi_ECOG_0_1');
  const [meningiomaGrade, setMeningiomaGrade] = useState<'Grade_1' | 'Grade_2' | 'Grade_3'>('Grade_1');
  const [gliomaHistology, setGliomaHistology] = useState<'gbm' | 'astrocytoma' | 'oligodendroglioma'>('gbm');

  // ==========================================
  // 7. JÄ°NEKOLOJÄ° ALT BAÅLIKLARI (SERVÄ°KS, ENDOMETRÄ°YUM, OVER, VAJEN, VULVA)
  // ==========================================
  const [gynSite, setGynSite] = useState<'Serviks' | 'Endometriyum' | 'Over_Tuba' | 'Vajen' | 'Vulva'>('Serviks');
  const [cervixScenario, setCervixScenario] = useState<'Definitif_KRT' | 'Adjuvan_Peters' | 'Adjuvan_Sedlis'>('Definitif_KRT');
  const [endoRisk, setEndoRisk] = useState<'Low' | 'Intermediate' | 'High_Intermediate' | 'High'>('High_Intermediate');
  const [ovaryScenario, setOvaryScenario] = useState<'Oligometastatik_SBRT' | 'Palyatif_Kitle_Agri'>('Oligometastatik_SBRT');
  const [vulvaScenario, setVulvaScenario] = useState<'Adjuvan_Cerrahi_Sonrasi' | 'Inoperabl_Lokal_Ileri'>('Adjuvan_Cerrahi_Sonrasi');

  // ==========================================
  // 8. KEMÄ°K & SARKOM ALT BAÅLIKLARI (YDS, OSTEOSARKOM, EWING, KONDROSARKOM, KORDOMA, GCTB)
  // ==========================================
  const [sarcomaSubtype, setSarcomaSubtype] = useState<'Yumusak_Doku' | 'Osteosarkom' | 'Ewing' | 'Kondrosarkom' | 'Kordoma' | 'GCTB' | 'DFSP' | 'Rhabdomyosarkom'>('Yumusak_Doku');
  const [dfspStatus, setDfspStatus] = useState<'R0' | 'R1' | 'Unresectable'>('R1');
  const [sarcomaSurgery, setSarcomaSurgery] = useState<'Preop' | 'Postop_R0' | 'Postop_R1'>('Preop');
  const [osteoScenario, setOsteoScenario] = useState<'Marjin_Pozitif_R1_R2' | 'Inoperabl_Aksiyel_Pelvis' | 'Cerrahi_R0_Takip'>('Marjin_Pozitif_R1_R2');
  const [ewingIntent, setEwingIntent] = useState<'Definitif_RT' | 'Postop_R1'>('Definitif_RT');
  const [stsHistology, setStsHistology] = useState<'ups' | 'liposarcoma' | 'leiomyosarcoma' | 'synovial'>('ups');

  // ==========================================
  // 9. CÄ°LT RÄ°SK FAKTÃ–RLERÄ°
  // ==========================================
  const [skinHistology, setSkinHistology] = useState<'BCC' | 'SCC' | 'Melanom' | 'Merkel'>('SCC');
  const [skinMargin, setSkinMargin] = useState<'Negatif' | 'Pozitif' | 'Rezeke_Edilemez'>('Negatif');
  const [skinDepthMm, setSkinDepthMm] = useState<string>('4');
  const [skinPerineuralInvasion, setSkinPerineuralInvasion] = useState<boolean>(false);
  const [skinBoneInvasion, setSkinBoneInvasion] = useState<boolean>(false);

  // ==========================================
  // 10. HEMATOLOJÄ°K
  // ==========================================
  const [hematologicSubtype, setHematologicSubtype] = useState<'Hodgkin' | 'DLBCL' | 'FolikÃ¼ler' | 'Plasmacytoma' | 'Myeloma' | 'ALL' | 'CLL'>('Hodgkin');
  const [lymphomaResponse, setLymphomaResponse] = useState<'Tam_Yanit' | 'Parsiyel_RezidÃ¼'>('Tam_Yanit');
  const [myelomaFractionation, setMyelomaFractionation] = useState<'TekFx' | '20Gy' | '30Gy'>('TekFx');

  // ==========================================
  // 11. PEDÄ°ATRÄ°K & 12. PALYATÄ°F
  // ==========================================
  const [pediatricSubtype, setPediatricSubtype] = useState<'Medulloblastom' | 'Wilms' | 'Neuroblastom' | 'Ewing' | 'Rhabdo'>('Medulloblastom');
  const [pediatricRisk, setPediatricRisk] = useState<'Standart' | 'Yuksek'>('Standart');
  const [wilmsStage, setWilmsStage] = useState<'Evre_I_II' | 'Evre_III_Anaplazi'>('Evre_I_II');
  const [wilmsWholeAbdomen, setWilmsWholeAbdomen] = useState<boolean>(false);
  const [palliativeIntent, setPalliativeIntent] = useState<'Agri' | 'Beyin' | 'Organ'>('Agri');

  // Modal ve Kopyalama State'leri
  const [showGuidelineModal, setShowGuidelineModal] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);
  const [researchExportNotice, setResearchExportNotice] = useState<string>('');
  const [isExportMenuOpen, setIsExportMenuOpen] = useState(false);
  const exportMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      let storageError = '';
      try {
        const stored = window.localStorage.getItem('radonco_favorite_presets');
        if (stored) {
          const parsed: unknown = JSON.parse(stored);
          if (!Array.isArray(parsed) || parsed.some(id =>
            typeof id !== 'string' || !QUICK_CASE_PRESETS.some(preset => preset.id === id)
          )) {
            throw new Error('Stored favorite presets have an invalid format.');
          }
          setFavoritePresetIds(parsed);
        }
      } catch (error) {
        console.error('Favorite presets could not be loaded from browser storage.', error);
        storageError = 'Favoriler yÃ¼klenemedi; tarayÄ±cÄ± depolama alanÄ±nÄ± kontrol edin.';
      }

      try {
        const stored = window.localStorage.getItem('radonco_clinical_case_archive');
        if (stored) {
          const parsed: unknown = JSON.parse(stored);
          if (!Array.isArray(parsed) || !parsed.every(isArchivedClinicalCase)) {
            throw new Error('Stored clinical case archive has an invalid format.');
          }
          setCaseArchive(parsed);
        }
      } catch (error) {
        console.error('Clinical case archive could not be loaded from browser storage.', error);
        storageError = 'Vaka arÅŸivi yÃ¼klenemedi; tarayÄ±cÄ± depolama alanÄ±nÄ± kontrol edin.';
      }

        try {
          const stored = window.localStorage.getItem('radonco_custom_favorites');
          if (stored) {
            const parsed: unknown = JSON.parse(stored);
            if (!Array.isArray(parsed) || !parsed.every(isCustomFavoriteCase)) {
              throw new Error('Stored custom favorites have an invalid format.');
            }
            setCustomFavorites(parsed);
          }
        } catch (error) {
          console.error('Custom favorites could not be loaded from browser storage.', error);
          storageError = 'Ã–zel favoriler yÃ¼klenemedi; tarayÄ±cÄ± depolama alanÄ±nÄ± kontrol edin.';
        }
        if (storageError) setResearchExportNotice(storageError);
      }, 0);
      return () => window.clearTimeout(timeout);
    }, []);

  const toggleFavoritePreset = (presetId: string) => {
    const next = favoritePresetIds.includes(presetId)
      ? favoritePresetIds.filter(id => id !== presetId)
      : [...favoritePresetIds, presetId];
    try {
      window.localStorage.setItem('radonco_favorite_presets', JSON.stringify(next));
    } catch (error) {
      console.error('Favorite presets could not be saved to browser storage.', error);
      setResearchExportNotice('Favoriler kaydedilemedi; tarayÄ±cÄ± depolama alanÄ±nÄ± kontrol edin.');
      return;
    }
    setFavoritePresetIds(next);
  };

    const saveCurrentCaseToFavorites = (label?: string) => {
      const customCase: CustomFavoriteCase = {
            id: `custom-${crypto.randomUUID()}`,
        label: label?.trim() || `Ã–zel Vaka ${new Date().toLocaleString('tr-TR')}`,
        savedAt: new Date().toISOString(),
        organ: selectedOrgan,
        subsite: selectedSubsite,
        selectedT,
        selectedN,
        selectedM,
        selectedSchemeId,
        selectedRegimen,
        patientAgeYears,
        patientGender,
        patientId,
      };
      const next = [...customFavorites, customCase];
      try {
        window.localStorage.setItem('radonco_custom_favorites', JSON.stringify(next));
      } catch (error) {
        console.error('Custom favorite could not be saved to browser storage.', error);
        setResearchExportNotice('Ã–zel vaka kaydedilemedi; tarayÄ±cÄ± depolama alanÄ±nÄ± kontrol edin.');
        return;
      }
      setCustomFavorites(next);
      setResearchExportNotice(`"${customCase.label}" favorilere eklendi.`);
    };

    const restoreCustomFavorite = (fav: CustomFavoriteCase) => {
      setSelectedOrgan(fav.organ as OrganId);
      setSelectedSubsite(fav.subsite);
      setSelectedT(fav.selectedT);
      setSelectedN(fav.selectedN);
      setSelectedM(fav.selectedM);
      setSelectedSchemeId(fav.selectedSchemeId);
      setSelectedRegimen(fav.selectedRegimen as QuickCaseRegimen);
      setPatientAgeYears(fav.patientAgeYears);
      setPatientGender(fav.patientGender);
      setPatientId(fav.patientId);
      setResearchExportNotice(`"${fav.label}" yÃ¼klendi.`);
    };

    const removeCustomFavorite = (id: string) => {
      const next = customFavorites.filter(f => f.id !== id);
      try {
        window.localStorage.setItem('radonco_custom_favorites', JSON.stringify(next));
      } catch (error) {
        console.error('Custom favorite could not be removed from browser storage.', error);
        setResearchExportNotice('Favori silinemedi; tarayÄ±cÄ± depolama alanÄ±nÄ± kontrol edin.');
        return;
      }
      setCustomFavorites(next);
    };
  const [selectedSchemeId, setSelectedSchemeId] = useState<string>('');
  const [selectedRegimen, setSelectedRegimen] = useState<QuickCaseRegimen>('moderate');
  const [isAiOpen, setIsAiOpen] = useState<boolean>(false);
  const [copiedPrompt, setCopiedPrompt] = useState<boolean>(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState<boolean>(false);
  const [isRadiobiologyModalOpen, setIsRadiobiologyModalOpen] = useState<boolean>(false);
  const [isSearchOpen, setIsSearchOpen] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeSearchIndex, setActiveSearchIndex] = useState(0);
  const [comparisonDosePerFraction, setComparisonDosePerFraction] = useState<number>(2);
  const [comparisonFractions, setComparisonFractions] = useState<number>(30);
  const [comparisonAlphaBeta, setComparisonAlphaBeta] = useState<number>(10);
  const [missedTreatmentDays, setMissedTreatmentDays] = useState<number>(0);
  const [remainingTreatmentFractions, setRemainingTreatmentFractions] = useState<number>(30);
  const [reportInputText, setReportInputText] = useState<string>('');
  const [parsedData, setParsedData] = useState<ParsedReportData | null>(null);
  const [uploadedFileName, setUploadedFileName] = useState<string>('');
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isAiDockOpen, setIsAiDockOpen] = useState<boolean>(false);

  useEffect(() => {
    if (!isExportMenuOpen) return;

    const closeOnOutsidePointer = (event: PointerEvent) => {
      if (event.target instanceof Node && !exportMenuRef.current?.contains(event.target)) {
        setIsExportMenuOpen(false);
      }
    };
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setIsExportMenuOpen(false);
    };

    document.addEventListener('pointerdown', closeOnOutsidePointer);
    document.addEventListener('keydown', closeOnEscape);
    return () => {
      document.removeEventListener('pointerdown', closeOnOutsidePointer);
      document.removeEventListener('keydown', closeOnEscape);
    };
  }, [isExportMenuOpen]);
  const [activeAiTab, setActiveAiTab] = useState<'gemini' | 'chatgpt' | 'claude'>('gemini');
  const [copiedContext, setCopiedContext] = useState<boolean>(false);

  useEffect(() => {
    if (!isRadiobiologyModalOpen) return;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setIsRadiobiologyModalOpen(false);
    };
    window.addEventListener('keydown', closeOnEscape);
    return () => window.removeEventListener('keydown', closeOnEscape);
  }, [isRadiobiologyModalOpen]);

  useEffect(() => {
    const handleSearchShortcut = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        setIsSearchOpen(open => !open);
      } else if (event.key === 'Escape') {
        setIsSearchOpen(false);
      }
    };

    window.addEventListener('keydown', handleSearchShortcut);
    return () => window.removeEventListener('keydown', handleSearchShortcut);
  }, []);

  // Dinamik TNM AnahtarÄ±
  const currentTnmKey = useMemo(() => {
    if (selectedOrgan === 'gis' && gisOrgan === 'Karaciger' && liverHistology === 'colorectal-metastasis') {
      return 'gis-liver-metastasis';
    }
    if (selectedSubsite && TNM_DATABASE[selectedSubsite]) return selectedSubsite;
    if (selectedOrgan === 'thorax') return `thorax-${thoraxSubtype}`;
    if (selectedOrgan === 'gynecology') return `gynecology-${gynSite}`;
    if (selectedOrgan === 'bone') return `bone-sarcoma-${sarcomaSubtype}`;
    if (selectedOrgan === 'sarcoma') return `bone-sarcoma-${sarcomaSubtype}`;
    if (selectedOrgan === 'bone-sarcoma') return `bone-sarcoma-${sarcomaSubtype}`;
    if (selectedOrgan === 'head-neck') return `head-neck-${hnSubsite}`;
    if (selectedOrgan === 'cns') return `cns-${cnsSubtype}`;
    if (selectedOrgan === 'gis') return `gis-${gisOrgan}`;
    if (selectedOrgan === 'prostate') return gusSubtype === 'penile' ? 'prostate-penis' : `prostate-${gusSubtype}`;
    if (selectedOrgan === 'skin') return `skin-${skinHistology}`;
    if (selectedOrgan === 'breast') {
      if (breastHistology === 'Duktal Karsinoma In Situ (DCIS)') return 'breast-dcis';
      if (breastHistology === 'Malign Filloides TÃ¼mÃ¶rÃ¼') return 'breast-phyllodes';
      return 'breast-breast';
    }
    if (selectedOrgan === 'hematologic') return `hematologic-${hematologicSubtype}`;
    if (selectedOrgan === 'pediatric') return `pediatric-${pediatricSubtype}`;
    return selectedOrgan;
  }, [selectedOrgan, selectedSubsite, thoraxSubtype, gynSite, sarcomaSubtype, hnSubsite, cnsSubtype, gisOrgan, liverHistology, gusSubtype, breastHistology, hematologicSubtype, pediatricSubtype, skinHistology]);

    const currentTNM = selectedOrgan === 'emergencies' || selectedOrgan === 'palliative'
      ? { T: [], N: [], M: [] }
      : TNM_DATABASE[currentTnmKey] || TNM_DATABASE[selectedOrgan] || TNM_DATABASE['thorax-nsclc'];
  const prostateRiskLabel = useMemo(() => {
    const primary = Number.parseInt(gleasonPrimary, 10) || 3;
    const secondary = Number.parseInt(gleasonSecondary, 10) || 4;
    const score = primary + secondary;
    const psa = Number.parseFloat(psaLevel) || 0;
    const cores = Number.parseFloat(positiveCorePercent) || 0;
    if (selectedN === 'N1') return 'N1';
    if (hasSVI || selectedT === 'T4' || primary === 5 || (selectedT === 'T3b' && (score >= 8 || psa > 20))) return 'Ã‡ok YÃ¼ksek';
    if (score >= 8 || psa > 20 || selectedT === 'T3a' || selectedT === 'T3b' || hasECE) return 'YÃ¼ksek';
    const intermediateFactors = Number(selectedT === 'T2b' || selectedT === 'T2c') + Number(score === 7) + Number(psa >= 10 && psa <= 20);
    if (intermediateFactors === 0) return 'DÃ¼ÅŸÃ¼k';
    return primary >= 4 || cores >= 50 || intermediateFactors > 1 ? 'Orta-Unfavorable' : 'Orta-Favorable';
  }, [gleasonPrimary, gleasonSecondary, psaLevel, positiveCorePercent, selectedN, selectedT, hasSVI, hasECE]);

  const eContourSubsite = useMemo(() => [
    currentTnmKey,
    selectedOrgan === 'palliative' ? palliativeIntent : '',
    selectedOrgan === 'benign' ? selectedSubsite : '',
  ].filter(Boolean).join(' '),
  [currentTnmKey, selectedOrgan, palliativeIntent, selectedSubsite]);
  const eContourRiskCategory = useMemo(() => selectedOrgan === 'prostate'
    ? prostateRiskLabel
    : selectedOrgan === 'gynecology' && gynSite === 'Endometriyum'
      ? endoRisk
      : selectedOrgan === 'breast' && (selectedN === 'N2' || selectedN === 'N3')
        ? 'high'
        : undefined,
  [selectedOrgan, prostateRiskLabel, gynSite, endoRisk, selectedN]);
  const eContourSurgeryStatus = useMemo(() => selectedOrgan === 'thorax'
    ? thoraxSurgeryStatus
    : selectedOrgan === 'breast'
      ? breastSurgery
      : selectedOrgan === 'bone-sarcoma'
        ? sarcomaSurgery
        : undefined,
  [selectedOrgan, thoraxSurgeryStatus, breastSurgery, sarcomaSurgery]);
  const eContourHistologyParam = useMemo(() => {
    if (selectedOrgan === 'bone') return sarcomaSubtype;
    if (selectedOrgan === 'bone-sarcoma') return sarcomaSubtype === 'Yumusak_Doku' ? stsHistology : sarcomaSubtype;
    if (selectedOrgan === 'hematologic') return hematologicSubtype;
    if (selectedOrgan === 'pediatric') return pediatricSubtype;
    return undefined;
  }, [selectedOrgan, sarcomaSubtype, stsHistology, hematologicSubtype, pediatricSubtype]);

  const eContour = getAdaptiveEContour(
    selectedOrgan,
    eContourSubsite,
    selectedT,
    selectedN,
    selectedM,
    eContourRiskCategory,
    eContourSurgeryStatus,
    breathingMotion,
    eContourHistologyParam,
  );

  // Organ DeÄŸiÅŸimi
  const handleOrganChange = (newOrgan: OrganId) => {
    setIsMobileDrawerOpen(false);
    setSelectedOrgan(newOrgan);
    setSelectedSubsite(newOrgan === 'emergencies' || newOrgan === 'palliative' ? ORGAN_TREE[newOrgan][0]?.id ?? '' : '');
    if (newOrgan === 'palliative') setPalliativeIntent('Agri');
    setSelectedQuickCaseId(null);
    setPatientAgeYears('');
    setSelectedRegimen('clinical');
    setSelectedSchemeId('');
    let key = newOrgan as string;
    if (newOrgan === 'thorax') key = `thorax-${thoraxSubtype}`;
    if (newOrgan === 'gynecology') key = `gynecology-${gynSite}`;
    if (newOrgan === 'bone' || newOrgan === 'sarcoma') key = `bone-sarcoma-${sarcomaSubtype}`;
    if (newOrgan === 'bone-sarcoma') key = `bone-sarcoma-${sarcomaSubtype}`;
    if (newOrgan === 'head-neck') key = `head-neck-${hnSubsite}`;
    if (newOrgan === 'cns') key = `cns-${cnsSubtype}`;
    if (newOrgan === 'gis') key = `gis-${gisOrgan}`;
    if (newOrgan === 'prostate') key = gusSubtype === 'penile' ? 'prostate-penis' : `prostate-${gusSubtype}`;
    if (newOrgan === 'skin') key = `skin-${skinHistology}`;
    if (newOrgan === 'breast') key = breastHistology === 'Duktal Karsinoma In Situ (DCIS)' ? 'breast-dcis' : breastHistology === 'Malign Filloides TÃ¼mÃ¶rÃ¼' ? 'breast-phyllodes' : 'breast-breast';
    if (newOrgan === 'hematologic') key = `hematologic-${hematologicSubtype}`;
    if (newOrgan === 'pediatric') key = `pediatric-${pediatricSubtype}`;

    const db = TNM_DATABASE[key] || TNM_DATABASE[newOrgan] || TNM_DATABASE['thorax-nsclc'];
    if (db && db.T.length > 0) setSelectedT(db.T[0].code);
    if (db && db.N.length > 0) setSelectedN(db.N[0].code);
    if (db && db.M.length > 0) setSelectedM(db.M[0].code);
  };

  const toggleCategory = (categoryId: string) => {
    setOpenCategories(prev => (
      prev.includes(categoryId)
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId]
    ));
  };

  const parameterButtonClass = (selected: boolean) => selected
    ? 'w-full rounded-xl border border-blue-500 bg-blue-600 px-3 py-2 text-xs font-semibold text-white shadow-md shadow-blue-500/20 ring-1 ring-blue-400 transition-all flex items-center justify-center gap-1.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-300'
    : 'w-full rounded-xl border border-slate-700/80 bg-[#131f33] px-3 py-2 text-xs font-medium text-slate-200 transition-all hover:border-slate-500 hover:bg-[#182842] hover:text-white flex items-center justify-center gap-1.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400';

  // Alt BaÅŸlÄ±k DeÄŸiÅŸimi
  const handleSubsiteChange = (subKey: string) => {
    const [organ, subtype] = subKey.split('-');
    // Alt baÅŸlÄ±ÄŸÄ±n hangi ana organa ait olduÄŸunu tespit edip selectedOrgan'Ä± senkronize et.
    const parentOrgan = (Object.keys(ORGAN_TREE) as OrganId[]).find(
      organId => ORGAN_TREE[organId].some(sub => sub.id === subKey)
    );
    if (parentOrgan) setSelectedOrgan(parentOrgan);
    if (subKey === 'palliative-bone') setPalliativeIntent('Agri');
    if (subKey === 'palliative-brain') setPalliativeIntent('Beyin');
    if (subKey === 'palliative-soft-tissue') setPalliativeIntent('Organ');
    if (organ === 'thorax' && ['nsclc', 'sclc', 'thymoma', 'mesothelioma'].includes(subtype)) setThoraxSubtype(subtype as typeof thoraxSubtype);
    if (organ === 'prostate' && ['prostate', 'bladder', 'penile', 'testis', 'kidney'].includes(subtype)) setGusSubtype(subtype as typeof gusSubtype);
    if (organ === 'gis' && ['Rektum', 'Mide', 'Karaciger', 'Pankreas', 'Ozofagus', 'SafraYollari'].includes(subtype)) setGisOrgan(subtype as typeof gisOrgan);
    if (subKey.startsWith('head-neck-')) setHnSubsite(subKey.replace('head-neck-', '') as typeof hnSubsite);
    if (organ === 'cns' && ['glioma', 'gbm', 'mets', 'meningioma'].includes(subtype)) setCnsSubtype(subtype as typeof cnsSubtype);
    if (organ === 'gynecology' && ['Serviks', 'Endometriyum', 'Vulva', 'Vajen'].includes(subtype)) setGynSite(subtype as typeof gynSite);
    if (subKey === 'bone-osteosarcoma') setSarcomaSubtype('Osteosarkom');
    if (subKey === 'bone-ewing') setSarcomaSubtype('Ewing');
    if (subKey === 'bone-chondrosarcoma') setSarcomaSubtype('Kondrosarkom');
    if (subKey === 'bone-chordoma') setSarcomaSubtype('Kordoma');
    if (subKey === 'bone-gctb') setSarcomaSubtype('GCTB');
    if (subKey === 'sarcoma-extremity' || subKey === 'sarcoma-retroperitoneal' || subKey === 'sarcoma-liposarcoma') setSarcomaSubtype('Yumusak_Doku');
    if (subKey === 'sarcoma-rhabdomyosarcoma') setSarcomaSubtype('Rhabdomyosarkom' as typeof sarcomaSubtype);
    if (subKey === 'sarcoma-dfsp') setSarcomaSubtype('DFSP');
    if (subKey.startsWith('bone-sarcoma-') && ['Yumusak_Doku', 'Osteosarkom', 'Ewing', 'Kondrosarkom', 'Kordoma', 'GCTB', 'DFSP'].includes(subKey.replace('bone-sarcoma-', ''))) setSarcomaSubtype(subKey.replace('bone-sarcoma-', '') as typeof sarcomaSubtype);
    if (organ === 'skin' && ['scc', 'bcc', 'melanom'].includes(subtype)) setSkinHistology(subtype === 'scc' ? 'SCC' : subtype === 'bcc' ? 'BCC' : 'Melanom');
    if (organ === 'pediatric' && subtype === 'medulloblastoma') setPediatricSubtype('Medulloblastom');
    if (organ === 'pediatric' && subtype === 'wilms') setPediatricSubtype('Wilms');
    setSelectedSubsite(subKey);
    setSelectedQuickCaseId(null);
    setPatientAgeYears('');
    setSelectedRegimen('clinical');
    setIsMobileDrawerOpen(false);
    const firstClinicalOption = BENIGN_CLINICAL_OPTIONS[subKey]?.[0];
    if (firstClinicalOption) setBenignClinicalStatus(firstClinicalOption.value);
    setSelectedSchemeId('');
    const db = TNM_DATABASE[subKey] || TNM_DATABASE[subKey === 'prostate-penile' ? 'prostate-penis' : subKey] || currentTNM;
    if (subKey === 'breast-inflammatory') setSelectedT('T4d');
    else if (db && db.T.length > 0) setSelectedT(db.T[0].code);
    if (db && db.N.length > 0) setSelectedN(db.N[0].code);
    if (db && db.M.length > 0) setSelectedM(db.M[0].code);
  };

  // ==========================================
  // EVRENSEL PATOLOJÄ°K HÄ°STOLOJÄ° / ALT TÄ°P MATRÄ°SÄ°
  // ==========================================
  const BONE_HISTOLOGY_VALUES = ['Osteosarkom', 'Ewing', 'Kondrosarkom', 'Kordoma', 'GCTB'] as const;

  const currentHistologies: { id: string; name: string }[] = (() => {
    if (selectedOrgan === 'prostate') {
      if (gusSubtype === 'kidney') return [
        { id: 'renal-clear-cell', name: lang === 'tr' ? 'Åeffaf HÃ¼creli RCC' : 'Clear-cell RCC' },
        { id: 'renal-papillary', name: lang === 'tr' ? 'Papiller RCC' : 'Papillary RCC' },
        { id: 'renal-chromophobe', name: lang === 'tr' ? 'Kromofob RCC' : 'Chromophobe RCC' },
      ];
      if (gusSubtype === 'prostate') return [
        { id: 'prostate-acinar', name: 'Asiner Adenokarsinom (Klasik)' },
        { id: 'prostate-ductal', name: 'Duktal Karsinom (Agresif)' },
        { id: 'prostate-nepc', name: 'NÃ¶roendokrin / KÃ¼Ã§Ã¼k HÃ¼creli (NEPC)' },
      ];
      if (gusSubtype === 'testis') return [
        { id: 'testis-seminoma', name: 'Seminom (RadyoduyarlÄ± - Paraaortik RT Endike)' },
        { id: 'testis-nonseminoma', name: 'Non-Seminom (RT Genellikle Endike DeÄŸil)' },
      ];
      if (gusSubtype === 'bladder') return [
        { id: 'bladder-urothelial', name: 'Ãœrotelyal Karsinom (TCC - Trimodalite KRT)' },
        { id: 'bladder-non-urothelial', name: 'SkuamÃ¶z / Adenokarsinom' },
      ];
      return [];
    }
    if (selectedOrgan === 'gis' && gisOrgan === 'Karaciger') return [
      { id: 'liver-hcc', name: lang === 'tr' ? 'HepatosellÃ¼ler Karsinom (HCC)' : 'Hepatocellular Carcinoma (HCC)' },
      { id: 'liver-colorectal-metastasis', name: lang === 'tr' ? 'Kolorektal KaraciÄŸer MetastazÄ±' : 'Colorectal Liver Metastasis' },
    ];
    if (selectedOrgan === 'gis' && gisOrgan === 'SafraYollari') return [
      { id: 'biliary-intrahepatic', name: lang === 'tr' ? 'Ä°ntrahepatik Kolanjiyokarsinom' : 'Intrahepatic Cholangiocarcinoma' },
      { id: 'biliary-perihilar', name: lang === 'tr' ? 'Perihiler Kolanjiyokarsinom (Klatskin)' : 'Perihilar Cholangiocarcinoma (Klatskin)' },
      { id: 'biliary-extrahepatic', name: lang === 'tr' ? 'Distal / Ekstrahepatik Kolanjiyokarsinom' : 'Distal / Extrahepatic Cholangiocarcinoma' },
      { id: 'biliary-gallbladder', name: lang === 'tr' ? 'Safra Kesesi Kanseri' : 'Gallbladder Cancer' },
    ];
    if (selectedOrgan === 'thorax') {
      if (thoraxSubtype === 'nsclc') return [
        { id: 'nsclc-adenocarcinoma', name: 'Adenokarsinom' },
        { id: 'nsclc-squamous', name: 'SkuamÃ¶z HÃ¼creli Karsinom' },
        { id: 'nsclc-lcnec', name: 'BÃ¼yÃ¼k HÃ¼creli NÃ¶roendokrin (LCNEC)' },
      ];
      if (thoraxSubtype === 'thymoma') return [
        { id: 'thymoma', name: 'Timoma (WHO Tip A, AB, B1, B2, B3)' },
        { id: 'thymic-carcinoma', name: 'Timik Karsinom (Tip C / Agresif)' },
      ];
      return [];
    }
    if (selectedOrgan === 'breast') return [
      { id: 'breast-nst', name: 'Ä°nvaziv Duktal Karsinom (NST)' },
      { id: 'breast-ilc', name: 'Ä°nvaziv LobÃ¼ler Karsinom (Ä°LK)' },
      { id: 'breast-tnbc', name: 'Triple Negatif (TNBC)' },
      { id: 'breast-metaplastic', name: 'Metaplastik Karsinom' },
    ];
    if (selectedOrgan === 'cns' && (cnsSubtype === 'glioma' || cnsSubtype === 'gbm')) return [
      { id: 'glioma-gbm', name: 'Glioblastoma (WHO Grade 4, IDH-wildtype)' },
      { id: 'glioma-astro', name: 'Astrositom (IDH-mutant, Grade 2-4)' },
      { id: 'glioma-oligo', name: 'Oligodendrogliom (1p/19q ko-delesyonlu, Grade 2-3)' },
    ];
    if (selectedOrgan === 'bone' || (selectedOrgan === 'bone-sarcoma' && (BONE_HISTOLOGY_VALUES as readonly string[]).includes(sarcomaSubtype))) {
      if (selectedOrgan === 'bone') return [
        { id: 'bone-Osteosarkom', name: 'Osteosarkom' },
        { id: 'bone-Ewing', name: 'Ewing Sarkomu' },
        { id: 'bone-Kondrosarkom', name: 'Kondrosarkom' },
        { id: 'bone-Kordoma', name: 'Kordoma' },
        { id: 'bone-GCTB', name: 'GCTB' },
      ];
      return [
        { id: 'bone-Osteosarkom', name: 'Osteosarkom' },
        { id: 'bone-Ewing', name: 'Ewing Sarkomu' },
      ];
    }
    if (selectedOrgan === 'bone-sarcoma') return [
      { id: 'sts-ups', name: 'Pleomorfik Sarkom (UPS)' },
      { id: 'sts-liposarcoma', name: 'Liposarkom' },
      { id: 'sts-leiomyosarcoma', name: 'Leyomiyosarkom' },
      { id: 'sts-synovial', name: 'Sinovyal Sarkom' },
    ];
    if (selectedOrgan === 'skin') return [
      { id: 'skin-SCC', name: 'SkuamÃ¶z HÃ¼creli (cSCC)' },
      { id: 'skin-BCC', name: 'Bazal HÃ¼creli (BCC)' },
      { id: 'skin-Melanom', name: 'KutanÃ¶z Melanom' },
      { id: 'skin-Merkel', name: 'Merkel HÃ¼creli (MCC)' },
    ];
    if (selectedOrgan === 'hematologic') return [
      { id: 'heme-Hodgkin', name: 'Hodgkin Lenfoma' },
      { id: 'heme-DLBCL', name: 'DLBCL' },
      { id: 'heme-FolikÃ¼ler', name: 'FolikÃ¼ler Lenfoma' },
      { id: 'heme-Myeloma', name: 'Multipl Miyelom / Plazmositom' },
    ];
    return [];
  })();

  const selectedHistology: string = (() => {
    if (selectedOrgan === 'prostate') {
      if (gusSubtype === 'kidney') return `renal-${renalHistology}`;
      if (gusSubtype === 'prostate') return `prostate-${prostateHistology}`;
      if (gusSubtype === 'testis') return `testis-${testisHistology}`;
      if (gusSubtype === 'bladder') return `bladder-${bladderHistology}`;
      return '';
    }
    if (selectedOrgan === 'gis' && gisOrgan === 'Karaciger') return `liver-${liverHistology}`;
    if (selectedOrgan === 'gis' && gisOrgan === 'SafraYollari') return `biliary-${biliaryHistology}`;
    if (selectedOrgan === 'thorax') {
      if (thoraxSubtype === 'nsclc') return `nsclc-${nsclcHistology}`;
      if (thoraxSubtype === 'thymoma') return thymicHistology;
      return '';
    }
    if (selectedOrgan === 'breast') {
      if (breastHistology === 'Ä°nvaziv Duktal Karsinom (Ä°DK)') return 'breast-nst';
      if (breastHistology === 'Ä°nvaziv LobÃ¼ler Karsinom (Ä°LK)') return 'breast-ilc';
      if (breastHistology === 'Triple Negatif Meme Kanseri (TNBC)') return 'breast-tnbc';
      if (breastHistology === 'Metaplastik Karsinom') return 'breast-metaplastic';
      return '';
    }
    if (selectedOrgan === 'cns' && (cnsSubtype === 'glioma' || cnsSubtype === 'gbm')) return `glioma-${gliomaHistology}`;
    if (selectedOrgan === 'bone') return (BONE_HISTOLOGY_VALUES as readonly string[]).includes(sarcomaSubtype) ? `bone-${sarcomaSubtype}` : 'bone-Osteosarkom';
    if (selectedOrgan === 'bone-sarcoma') return (BONE_HISTOLOGY_VALUES as readonly string[]).includes(sarcomaSubtype) ? `bone-${sarcomaSubtype}` : `sts-${stsHistology}`;
    if (selectedOrgan === 'skin') return `skin-${skinHistology}`;
    if (selectedOrgan === 'hematologic') return `heme-${hematologicSubtype}`;
    return '';
  })();

  const handleHistologySelect = (id: string) => {
    if (id === 'renal-clear-cell') setRenalHistology('clear-cell');
    else if (id === 'renal-papillary') setRenalHistology('papillary');
    else if (id === 'renal-chromophobe') setRenalHistology('chromophobe');
    else if (id === 'liver-hcc') {
      setLiverHistology('hcc');
      setLiverBclcStage('A');
      setSelectedT('T1a');
      setSelectedN('N0');
      setSelectedM('M0');
    }
    else if (id === 'liver-colorectal-metastasis') {
      setLiverHistology('colorectal-metastasis');
      setSelectedT('N/A');
      setSelectedN('N/A');
      setSelectedM('M1');
    }
    else if (id === 'biliary-intrahepatic') setBiliaryHistology('intrahepatic');
    else if (id === 'biliary-perihilar') setBiliaryHistology('perihilar');
    else if (id === 'biliary-extrahepatic') setBiliaryHistology('extrahepatic');
    else if (id === 'biliary-gallbladder') setBiliaryHistology('gallbladder');
    else if (id.startsWith('prostate-')) setProstateHistology(id.replace('prostate-', '') as typeof prostateHistology);
    else if (id.startsWith('testis-')) setTestisHistology(id.replace('testis-', '') as typeof testisHistology);
    else if (id.startsWith('bladder-')) setBladderHistology(id.replace('bladder-', '') as typeof bladderHistology);
    else if (id.startsWith('nsclc-')) setNsclcHistology(id.replace('nsclc-', '') as typeof nsclcHistology);
    else if (id === 'thymoma' || id === 'thymic-carcinoma') setThymicHistology(id);
    else if (id.startsWith('breast-')) {
      const next = id === 'breast-ilc'
        ? 'Ä°nvaziv LobÃ¼ler Karsinom (Ä°LK)'
        : id === 'breast-tnbc'
          ? 'Triple Negatif Meme Kanseri (TNBC)'
          : id === 'breast-metaplastic'
            ? 'Metaplastik Karsinom'
            : 'Ä°nvaziv Duktal Karsinom (Ä°DK)';
      setBreastHistology(next);
      handleSubsiteChange('breast-breast');
      return;
    }
    else if (id === 'glioma-gbm') { setGliomaHistology('gbm'); setGliomaGrade('Grade_4'); }
    else if (id === 'glioma-astro') setGliomaHistology('astrocytoma');
    else if (id === 'glioma-oligo') { setGliomaHistology('oligodendroglioma'); if (gliomaGrade === 'Grade_4') setGliomaGrade('Grade_3'); }
    else if (id.startsWith('bone-')) {
      const boneSubsiteKeys: Record<string, string> = {
        'bone-Osteosarkom': 'bone-osteosarcoma',
        'bone-Ewing': 'bone-ewing',
        'bone-Kondrosarkom': 'bone-chondrosarcoma',
        'bone-Kordoma': 'bone-chordoma',
        'bone-GCTB': 'bone-gctb',
      };
      handleSubsiteChange(boneSubsiteKeys[id] || 'bone-osteosarcoma');
      return;
    }
    else if (id.startsWith('sts-')) {
      setStsHistology(id.replace('sts-', '') as typeof stsHistology);
      handleSubsiteChange('bone-sarcoma-Yumusak_Doku');
      return;
    }
    else if (id.startsWith('skin-')) {
      const value = id.replace('skin-', '');
      if (value === 'SCC' || value === 'BCC' || value === 'Melanom' || value === 'Merkel') {
        setSkinHistology(value);
        handleSubsiteChange(`skin-${value}`);
        return;
      }
    }
    else if (id.startsWith('heme-')) {
      const value = id.replace('heme-', '') as typeof hematologicSubtype;
      setHematologicSubtype(value);
      handleSubsiteChange(`hematologic-${value}`);
      return;
    }
    setSelectedSchemeId('');
  };

  const handleQuickCaseSelect = (preset: QuickCasePreset) => {
    handleSubsiteChange(preset.subsite);
    setSelectedOrgan(preset.organ);
    setSelectedQuickCaseId(preset.id);
    setSelectedSchemeId('');
    setSelectedRegimen(preset.regimen);
    setPatientAgeYears('');
    setOpenCategories(previous => previous.includes(preset.organ) ? previous : [...previous, preset.organ]);
    if (preset.histologyId) handleHistologySelect(preset.histologyId);

    switch (preset.id) {
      case 'case-01':
        setThoraxCentrality('Peripheral');
        setThoraxSurgeryStatus('Inoperable');
        setBreathingMotion('DIBH');
        break;
      case 'case-02':
        setThoraxCentrality('Central');
        setThoraxSurgeryStatus('Inoperable');
        setBreathingMotion('4D-CT');
        break;
      case 'case-03':
        setSclcStage('Sinirli');
        setSclcTiming('Erken_BID_45Gy');
        break;
      case 'case-04':
        setThymomaStage('Masaoka_II');
        setThymomaMargin('R0');
        setThoraxSurgeryStatus('Postop_R0');
        break;
      case 'case-05':
        setBreastSurgery('MKC');
        setBreastMargin('Negatif');
        setBreastMenopause('Postmenopozal');
        setBreastBoost(true);
        break;
      case 'case-06':
        setBreastSurgery('Mastektomi');
        setBreastMargin('Negatif');
        setBreastMenopause('Postmenopozal');
        setBreastBoost(false);
        break;
      case 'case-07':
        setPatientAgeYears('38');
        setBreastSurgery('MKC');
        setBreastMargin('Negatif');
        setBreastMenopause('Premenopozal');
        setBreastBoost(true);
        break;
      case 'case-08':
        setGliomaGrade('Grade_4');
        setCnsKps('90');
        setCnsResection('GTR');
        setGbmPerformance('Iyi_ECOG_0_1');
        setGliomaRiskFactors({ age40: false, subtotalResection: false, largeOrCrossing: false, neurologicSymptoms: false, molecularHighRisk: false });
        break;
      case 'case-09':
        setPatientAgeYears('45');
        setGliomaGrade('Grade_2');
        setCnsKps('90');
        setCnsResection('STR');
        setGliomaRiskFactors({ age40: true, subtotalResection: true, largeOrCrossing: false, neurologicSymptoms: false, molecularHighRisk: false });
        break;
      case 'case-10':
        setCnsMetCount('2');
        setCnsMaxDiameter('2');
        setCnsSymptoms('Asimptomatik');
        setCnsKps('90');
        break;
      case 'case-11':
        setGleasonPrimary('3');
        setGleasonSecondary('4');
        setPsaLevel('8.5');
        setPositiveCorePercent('35');
        setHasECE(false);
        setHasSVI(false);
        break;
      case 'case-12':
        setGleasonPrimary('4');
        setGleasonSecondary('4');
        setPsaLevel('24');
        setPositiveCorePercent('60');
        setHasECE(true);
        setHasSVI(false);
        break;
      case 'case-23':
        setRenalDiseaseSetting('primary-inoperable');
        setRenalTumorSizeCm('3.5');
        break;
      case 'case-24':
        setRenalDiseaseSetting('primary-inoperable');
        setRenalTumorSizeCm('8');
        break;
      case 'case-25':
        setRenalDiseaseSetting('oligometastatic');
        break;
      case 'case-26':
        setGleasonPrimary('3');
        setGleasonSecondary('4');
        setPsaLevel('8.5');
        setPositiveCorePercent('35');
        setHasECE(false);
        setHasSVI(false);
        break;
      case 'case-27':
        setGleasonPrimary('4');
        setGleasonSecondary('4');
        setPsaLevel('24');
        setPositiveCorePercent('60');
        setHasECE(true);
        setHasSVI(false);
        break;
      case 'case-13':
        setBladderTurbtComplete(true);
        setBladderTmtSuitable(true);
        break;
      case 'case-15':
        setGisOrgan('Rektum');
        setGisCrmStatus('Pozitif');
        break;
      case 'case-16':
        setGisOrgan('Ozofagus');
        setGisCrmStatus('Negatif');
        break;
      case 'case-17':
        setGisOrgan('Anal');
        setGisCrmStatus('Pozitif');
        break;
      case 'case-18':
        setGynSite('Serviks');
        setCervixScenario('Definitif_KRT');
        break;
      case 'case-19':
        setPatientAgeYears('68');
        setGynSite('Endometriyum');
        setEndoRisk('High_Intermediate');
        break;
      case 'case-20':
        setSarcomaSubtype('Yumusak_Doku');
        setStsHistology('ups');
        setSarcomaSurgery('Preop');
        break;
      case 'case-21':
        setPalliativeIntent('Agri');
        break;
      case 'case-22':
        break;
      case 'case-23':
      case 'case-24':
        setRenalDiseaseSetting('primary-inoperable');
        break;
      default:
        break;
    }

    const database = TNM_DATABASE[preset.subsite] || TNM_DATABASE[preset.organ] || TNM_DATABASE['thorax-nsclc'];
    setSelectedT(database.T.some(option => option.code === preset.t) ? preset.t : database.T[0]?.code ?? preset.t);
    setSelectedN(database.N.some(option => option.code === preset.n) ? preset.n : database.N[0]?.code ?? preset.n);
    setSelectedM(database.M.some(option => option.code === preset.m) ? preset.m : database.M[0]?.code ?? preset.m);
    setSelectedRegimen(preset.regimen);
    setActiveMobilePanel('prescription');
    if (isGuidedMode) setGuidedStep(2);
  };

  const launchQuickCaseFromUrl = useEffectEvent(() => {
    const params = new URLSearchParams(window.location.search);
    const caseId = params.get('quickCase') ?? (params.get('scenario') === 'palliative' ? 'case-21' : null);
    const preset = QUICK_CASE_PRESETS.find(item => item.id === caseId);
    if (preset) handleQuickCaseSelect(preset);
  });

  useEffect(() => {
    startTransition(() => launchQuickCaseFromUrl());
  }, []);

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      const tab = new URLSearchParams(window.location.search).get('tab');
      if (tab === 'contouring') {
        setViewMode(true);
        setGuidedStep(4);
      } else if (tab === 'prognostic') {
        setViewMode(true);
        setGuidedStep(3);
      }
    }, 0);
    return () => window.clearTimeout(timeout);
  }, []);

  const currentOrganPresets = QUICK_CASE_PRESETS.filter(preset => {
    if (selectedOrgan === 'prostate' && gusSubtype === 'kidney') {
      return preset.id === 'case-23' || preset.id === 'case-24';
    }
    if (selectedOrgan === 'bone-sarcoma') return preset.category === 'sarcoma-palliative';
    if (selectedOrgan === 'sarcoma') return preset.id === 'case-20';
    if (selectedOrgan === 'palliative') return preset.id === 'case-21';
    if (selectedOrgan === 'emergencies') return preset.category === 'emergencies';
    if (selectedOrgan === 'prostate' && selectedSubsite === 'prostate-kidney') return preset.category === 'renal';
    if (selectedOrgan === 'prostate' && selectedSubsite === 'prostate-prostate') {
      return preset.category === 'gus' && preset.subsite === 'prostate-prostate';
    }

    const categoryByOrgan: Partial<Record<OrganId, QuickCaseCategoryId>> = {
      thorax: 'thorax',
      breast: 'breast',
      cns: 'cns',
      prostate: 'gus',
      gis: 'gis',
      gynecology: 'gynecology',
      emergencies: 'emergencies',
    };
    return preset.category === categoryByOrgan[selectedOrgan];
  });

  const activeGuidedSubsite = ORGAN_TREE[selectedOrgan].some(subsite => subsite.id === selectedSubsite)
    ? selectedSubsite
    : null;
  const guidedScenarioPresets = currentOrganPresets.filter(preset => {
    if (!activeGuidedSubsite) return true;
    if (selectedOrgan === 'cns' && activeGuidedSubsite === 'cns-gbm') return preset.id === 'case-08';
    if (selectedOrgan === 'breast') {
      return ['breast-idc', 'breast-ilc', 'breast-metaplastic'].includes(activeGuidedSubsite);
    }
    return preset.subsite === activeGuidedSubsite;
  });

  const commandPaletteGroups = useMemo(() => {
    const organNames: Record<OrganId, string> = {
      thorax: lang === 'tr' ? 'Toraks' : 'Thorax',
      prostate: lang === 'tr' ? 'GÃœS' : 'Genitourinary',
      breast: lang === 'tr' ? 'Meme' : 'Breast',
      gis: lang === 'tr' ? 'GÄ°S' : 'Gastrointestinal',
      'head-neck': lang === 'tr' ? 'BaÅŸ-Boyun' : 'Head & Neck',
      cns: lang === 'tr' ? 'MSS' : 'CNS',
      gynecology: lang === 'tr' ? 'Jinekoloji' : 'Gynecology',
      bone: lang === 'tr' ? 'Kemik' : 'Bone',
      sarcoma: lang === 'tr' ? 'Sarkom' : 'Sarcoma',
      'bone-sarcoma': lang === 'tr' ? 'Kemik & Sarkom' : 'Bone & Sarcoma',
      skin: lang === 'tr' ? 'Cilt' : 'Skin',
      hematologic: lang === 'tr' ? 'Hematoloji' : 'Hematologic',
      pediatric: lang === 'tr' ? 'Pediatri' : 'Pediatric',
      palliative: lang === 'tr' ? 'Palyatif' : 'Palliative',
      emergencies: lang === 'tr' ? 'Onkolojik Aciller' : 'Oncologic Emergencies',
      benign: lang === 'tr' ? 'Benign' : 'Benign',
    };
    const aliases: Record<string, string> = {
      'thorax-nsclc': 'khdak nsclc lung non-small-cell carcinoma lung cancer',
      'thorax-sclc': 'khak sclc small-cell lung cancer',
      'thorax-thymoma': 'thymoma thymus timoma timus mediastinum',
      'cns-glioma': 'glioblastoma gbm stupp glioma glial',
      'cns-mets': 'brain metastasis metastases srs radiosurgery',
      'prostate-prostate': 'prostate cancer prostat cancer prostate carcinoma',
      'prostate-testis': 'testis seminoma testicular cancer seminom',
      'breast-idc': 'invasive ductal idc invaziv duktal',
      'gis-Rektum': 'rectum rectal cancer RAPIDO',
      'gynecology-Serviks': 'cervix cervical cancer EMBRACE',
    };
    const normalize = (value: string) => value
      .toLocaleLowerCase(lang === 'tr' ? 'tr-TR' : 'en-US')
      .replace(/Ä±/g, 'i')
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '');

    const organItems: CommandPaletteItem[] = (Object.entries(ORGAN_TREE) as [OrganId, typeof ORGAN_TREE[OrganId]][])
      .flatMap(([organ, subsites]) => subsites.map(subsite => {
        const title = lang === 'tr' ? subsite.name_tr : subsite.name_en;
        const histologyId = subsite.id === 'breast-idc'
          ? 'breast-nst'
          : subsite.id === 'breast-ilc'
            ? 'breast-ilc'
            : subsite.id === 'breast-dcis' || subsite.id === 'breast-phyllodes' || subsite.id === 'breast-inflammatory'
              ? subsite.id
              : undefined;
        return {
          id: `organ-${subsite.id}`,
          kind: 'organ' as const,
          title,
          subtitle: organNames[organ],
          searchText: normalize(`${title} ${subsite.name_tr} ${subsite.name_en} ${organNames[organ]} ${aliases[subsite.id] || ''}`),
          organ,
          subsite: subsite.id,
          histologyId,
        };
      }));

    organItems.push({
      id: 'organ-glioblastoma',
      kind: 'organ',
      title: lang === 'tr' ? 'Glioblastoma (GBM)' : 'Glioblastoma (GBM)',
      subtitle: organNames.cns,
      searchText: normalize('glioblastoma GBM glioma WHO grade 4 idh wildtype'),
      organ: 'cns',
      subsite: 'cns-glioma',
      histologyId: 'glioma-gbm',
    });
    organItems.push({
      id: 'organ-prostate',
      kind: 'organ',
      title: lang === 'tr' ? 'Prostat Kanseri' : 'Prostate Cancer',
      subtitle: organNames.prostate,
      searchText: normalize('prostate prostate cancer prostat kanseri'),
      organ: 'prostate',
      subsite: 'prostate-prostate',
      histologyId: 'prostate-acinar',
    });

    const protocolItems: CommandPaletteItem[] = QUICK_CASE_PRESETS.map(preset => ({
      id: `protocol-${preset.id}`,
      kind: 'protocol',
      title: lang === 'tr' ? preset.title_tr : preset.title_en,
      subtitle: lang === 'tr' ? preset.detail_tr : preset.detail_en,
      searchText: normalize(`${preset.title_tr} ${preset.title_en} ${preset.detail_tr} ${preset.detail_en} ${preset.id}`),
      preset,
    }));
    const pageItems: CommandPaletteItem[] = [
      {
        id: 'page-references',
        kind: 'page',
        title: lang === 'tr' ? 'Klinik KaynakÃ§a ve KanÄ±t AtlasÄ±' : 'Clinical References & Evidence Atlas',
        subtitle: '/references',
        searchText: normalize('references bibliography evidence atlas kaynakca kanit'),
        destination: 'references',
      },
      {
        id: 'page-contact',
        kind: 'page',
        title: lang === 'tr' ? 'Ä°letiÅŸim ve Protokol KatkÄ±sÄ±' : 'Contact & Protocol Contribution',
        subtitle: lang === 'tr' ? 'E-posta ile iletiÅŸim' : 'Contact by email',
        searchText: normalize('contact iletiÅŸim protocol contribution katkÄ±'),
        destination: 'contact',
      },
      {
        id: 'page-guidelines',
        kind: 'page',
        title: lang === 'tr' ? 'KÄ±lavuz Ä°lkeleri' : 'Guideline Principles',
        subtitle: lang === 'tr' ? 'KÄ±lavuz ve kanÄ±t penceresini aÃ§' : 'Open the guidelines and evidence dialog',
        searchText: normalize('guidelines guideline principles kÄ±lavuz ilkeleri'),
        destination: 'guidelines',
      },
    ];
    const query = normalize(searchQuery.trim());
    const filter = (items: CommandPaletteItem[]) => items
      .filter(item => !query || item.searchText.includes(query))
      .slice(0, query ? 10 : 6);

    return [
      { id: 'tumors', title: lang === 'tr' ? 'ğŸ¯ TÃ¼mÃ¶rler ve Alt BaÅŸlÄ±klar' : 'ğŸ¯ Tumors & Subsites', items: filter(organItems) },
      { id: 'protocols', title: lang === 'tr' ? 'âš¡ Protokoller ve Ã‡alÄ±ÅŸmalar' : 'âš¡ Protocols & Studies', items: filter(protocolItems) },
      { id: 'pages', title: lang === 'tr' ? 'ğŸ“š Sayfalar ve KÄ±sayollar' : 'ğŸ“š Pages & Shortcuts', items: filter(pageItems) },
    ].filter(group => group.items.length > 0);
  }, [lang, searchQuery]);
  const commandPaletteResults = commandPaletteGroups.flatMap(group => group.items);
  const commandPaletteResultRefs = useRef<Array<HTMLButtonElement | null>>([]);

  useEffect(() => {
    commandPaletteResultRefs.current[activeSearchIndex]?.scrollIntoView({ block: 'nearest' });
  }, [activeSearchIndex, commandPaletteResults.length]);

  const selectCommandPaletteItem = (item: CommandPaletteItem) => {
    setIsSearchOpen(false);
    if (item.kind === 'organ') {
      const targetSubsite = item.subsite.startsWith('breast-') && !['breast-dcis', 'breast-phyllodes'].includes(item.subsite)
        ? 'breast-breast'
        : item.subsite;
      handleSubsiteChange(targetSubsite);
      setOpenCategories(previous => previous.includes(item.organ) ? previous : [...previous, item.organ]);
      if (item.histologyId === 'breast-dcis') {
        setBreastHistology('Duktal Karsinoma Ä°n Situ (DCIS)');
      } else if (item.histologyId === 'breast-phyllodes') {
        setBreastHistology('Malign Filloides TÃ¼mÃ¶rÃ¼');
      } else if (item.histologyId === 'breast-inflammatory') {
        setBreastHistology('Ä°nflamatuar Meme Kanseri (IBC)');
      } else if (item.histologyId) {
        handleHistologySelect(item.histologyId);
      }
      return;
    }
    if (item.kind === 'protocol') {
      handleQuickCaseSelect(item.preset);
      return;
    }
    if (item.destination === 'references') {
      router.push('/references');
    } else if (item.destination === 'contact') {
      router.push('/contact');
    } else {
      setActiveReferenceTab('guidelines');
      setShowGuidelineModal(true);
    }
  };

  const handleTnmSelection = (axis: 'T' | 'N' | 'M', code: string) => {
    if (axis === 'T') {
      if (selectedOrgan === 'breast' && breastHistology === 'Ä°nflamatuar Meme Kanseri (IBC)') {
        setSelectedT('T4d');
        return;
      }
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
  // 3. REAKTÄ°F KLÄ°NÄ°K KARAR MOTORU (12 ORGAN VE TÃœM ALT BAÅLIKLAR)
  // ==========================================
  const evaluatedDecision: EvaluatedDecision = useMemo(() => {
    if (selectedOrgan === 'benign') {
      const selectedClinicalOption = BENIGN_CLINICAL_OPTIONS[selectedSubsite]?.find(option => option.value === benignClinicalStatus);
      const clinicalContext = selectedClinicalOption?.label || 'Klinik durum deÄŸerlendirmesi';
      const makeScheme = (
        id: string,
        name: string,
        totalDoseGy: number,
        fractionCount: number,
        fractionDoseGy: number,
        technique: string,
        indication: string,
        target: string,
        oars: OARNTPCeiling[] = [],
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
        evidence: 'DEGRO / ESTRO benign radyoterapi Ã¶nerileri; hasta bazÄ±nda klinik doÄŸrulama gerekir.',
      });
      let primaryScheme: DoseScheme;
      let alternativeSchemes: DoseScheme[] = [];
      let statusText: string;
      let targetVolumeBadge = 'Hedef: Klinik hedef hacim';
      let techniqueBadge = 'Teknik: Klinik endikasyona gÃ¶re planlama';
      const noNodalDisease = 'Nodal: Uygulanmaz (Benign)';

      if (selectedSubsite === 'benign-ho') {
        const late = benignClinicalStatus === 'late';
        primaryScheme = makeScheme(
          'benign-ho-7gy',
          late ? 'RT Ã¶nerilmez (>72 saat)' : '7 Gy / 1 fx (Heterotopik Ossifikasyon Profilaksisi)',
          late ? 0 : 7,
          late ? 0 : 1,
          late ? 0 : 7,
          'Tek fraksiyon konformal RT',
          `${clinicalContext}. Cerrahi yatak ve periartikÃ¼ler yumuÅŸak doku hedeflenir; eklem aralÄ±ÄŸÄ± hariÃ§ tutulur. Preoperatif ilk 4 saat veya postoperatif 24-48 saat iÃ§inde uygulanmalÄ±dÄ±r; >72 saatte etkinlik beklenmez.`,
          'Cerrahi yatak ve periartikÃ¼ler yumuÅŸak doku (eklem aralÄ±ÄŸÄ± hariÃ§)',
          [{ organ: 'Gonad / komÅŸu eklem', metric: 'Doz', limit: 'MÃ¼mkÃ¼n olduÄŸunca dÃ¼ÅŸÃ¼k', source: 'DEGRO' }],
        );
        alternativeSchemes = late ? [primaryScheme] : [primaryScheme, makeScheme(
          'benign-ho-10gy-5fx', '10 Gy / 5 fx (Alternatif Profilaksi)', 10, 5, 2,
          'Konformal 3D-CRT', `${clinicalContext}. Zamanlama cerrahi ekiple koordine edilmelidir.`,
          'Cerrahi yatak ve periartikÃ¼ler yumuÅŸak doku (eklem aralÄ±ÄŸÄ± hariÃ§)',
          [{ organ: 'Gonad / komÅŸu eklem', metric: 'Doz', limit: 'MÃ¼mkÃ¼n olduÄŸunca dÃ¼ÅŸÃ¼k', source: 'DEGRO' }],
        )];
        statusText = late ? 'GEÃ‡ BAÅVURU: >72 SAATTE HO PROFÄ°LAKSÄ°SÄ°NDEN FAYDA BEKLENMEZ' : 'ENDÄ°KE: UYGUN ZAMAN PENCERESÄ°NDE HO PROFÄ°LAKSÄ°SÄ°';
        targetVolumeBadge = 'Hedef: Cerrahi Yatak / PeriartikÃ¼ler YumuÅŸak Doku';
        techniqueBadge = 'Teknik: Konformal 3D-CRT';
      } else if (selectedSubsite === 'benign-keloid') {
        const late = benignClinicalStatus === 'late';
        primaryScheme = makeScheme(
          'benign-keloid-12gy', late ? 'RT zamanlamasÄ± yeniden deÄŸerlendirilmelidir' : '12 Gy / 3 fx (Keloid Eksizyon SonrasÄ±)',
          late ? 0 : 12, late ? 0 : 3, late ? 0 : 4,
          'YÃ¼zeysel elektron veya brakiterapi',
          `${clinicalContext}. Cerrahi eksizyon sonrasÄ± RT ideal olarak ilk 24 saat iÃ§inde baÅŸlatÄ±lmalÄ±dÄ±r.`,
          'Eksizyon yataÄŸÄ± ve keloid skarÄ±',
          [{ organ: 'Cilt / Ã§evre doku', metric: 'Doz', limit: 'Hedef dÄ±ÅŸÄ± dokularda en aza indir', source: 'ESTRO' }],
        );
        alternativeSchemes = late ? [primaryScheme] : [primaryScheme, makeScheme(
          'benign-keloid-18gy', '18 Gy / 3 fx (YÃ¼ksek Riskli NÃ¼ks)', 18, 3, 6,
          'YÃ¼zeysel elektron veya brakiterapi', 'YÃ¼ksek nÃ¼ks riskinde uzman deÄŸerlendirmesiyle fraksiyone RT.',
          'Eksizyon yataÄŸÄ± ve keloid skarÄ±',
          [{ organ: 'Cilt / Ã§evre doku', metric: 'Doz', limit: 'Hedef dÄ±ÅŸÄ± dokularda en aza indir', source: 'ESTRO' }],
        )];
        statusText = late ? 'ZAMANLAMA UYGUN DEÄÄ°L: KONSEYDE TEDAVÄ° YAKLAÅIMINI DEÄERLENDÄ°RÄ°N' : 'ENDÄ°KE: EKSÄ°ZYON SONRASI ERKEN KELOÄ°D PROFÄ°LAKSÄ°SÄ°';
        targetVolumeBadge = 'Hedef: Cerrahi Yatak (<24 saat)';
        techniqueBadge = 'Teknik: YÃ¼zeysel Elektron / Brakiterapi';
      } else if (selectedSubsite === 'benign-dupuytren' || selectedSubsite === 'benign-ledderhose') {
        const advanced = benignClinicalStatus === 'advanced';
        const label = selectedSubsite === 'benign-dupuytren' ? 'Dupuytren' : 'Ledderhose';
        primaryScheme = makeScheme(
          `benign-${label.toLowerCase()}-30gy`,
          advanced ? 'RT rutin Ã¶nerilmez - ileri hastalÄ±kta cerrahi deÄŸerlendirme' : '30 Gy / 10 fx (Split-Course)',
          advanced ? 0 : 30, advanced ? 0 : 10, advanced ? 0 : 3,
          'Elektron / ortovoltaj; 5 fx + 6-8 hafta ara + 5 fx',
          `${clinicalContext}. Erken nodÃ¼l/kordon evresinde: Faz 1 5 Ã— 3 Gy = 15 Gy, 6-8 hafta ara, ardÄ±ndan Faz 2 5 Ã— 3 Gy = 15 Gy.`,
          `${label} nodÃ¼l ve kordonlarÄ±; eklem aralÄ±klarÄ± korunur`,
          [{ organ: 'Cilt / el-ayak eklemleri', metric: 'Doz', limit: 'Klinik planlama ile korunur', source: 'DEGRO' }],
        );
        alternativeSchemes = [primaryScheme];
        statusText = advanced ? 'Ä°LERÄ° KONTRAKTÃœR: CERRAHÄ° Ã–NCELÄ°KLÄ°, RT YARARI SINIRLI' : 'ERKEN NODÃœL / KORDON: SPLIT-COURSE RT DEÄERLENDÄ°R';
        targetVolumeBadge = `Hedef: ${label} NodÃ¼l ve Kordonlar`;
        techniqueBadge = 'Teknik: Elektron / Ortovoltaj';
      } else if (['benign-topuk-dikeni', 'benign-epikondilit', 'benign-omuz', 'benign-artroz'].includes(selectedSubsite)) {
        const repeat = benignClinicalStatus === 'repeat';
        const sites: Record<string, string> = {
          'benign-topuk-dikeni': 'Plantar fasya / kalkaneus yapÄ±ÅŸma alanÄ±',
          'benign-epikondilit': 'Lateral veya medial epikondil ve tendon yapÄ±ÅŸma alanÄ±',
          'benign-omuz': 'Omuz periartikÃ¼ler yumuÅŸak dokularÄ±',
          'benign-artroz': 'Semptomatik eklem Ã§evresi; eklem aralÄ±ÄŸÄ± korunur',
        };
        primaryScheme = makeScheme(
          repeat ? `benign-${selectedSubsite}-repeat-6gy` : `benign-${selectedSubsite}-3gy`,
          repeat ? '6 Gy / 6 fx (Ä°kinci Seri)' : '3 Gy / 6 fx (DEGRO DÃ¼ÅŸÃ¼k Doz)',
          repeat ? 6 : 3, 6, repeat ? 1 : 0.5,
          'Konformal dÃ¼ÅŸÃ¼k doz RT; haftada 2-3 fraksiyon',
          `${clinicalContext}. Refrakter semptomlarda 6-12 hafta sonra klinik deÄŸerlendirme ve gerekirse ikinci seri dÃ¼ÅŸÃ¼nÃ¼lÃ¼r.`,
          sites[selectedSubsite],
          [{ organ: 'Cilt / komÅŸu eklem', metric: 'Doz', limit: 'DÃ¼ÅŸÃ¼k doz protokolÃ¼', source: 'DEGRO' }],
        );
        alternativeSchemes = [primaryScheme];
        statusText = repeat ? 'PERSISTAN SEMPTOM: 6-12 HAFTA SONRA Ä°KÄ°NCÄ° SERÄ° DEÄERLENDÄ°R' : 'ENDÄ°KE: REFRAKTER DEJENERATÄ°F / ENFLAMATUAR SEMPTOMDA DÃœÅÃœK DOZ RT';
        targetVolumeBadge = `Hedef: ${sites[selectedSubsite]}`;
        techniqueBadge = 'Teknik: Konformal DÃ¼ÅŸÃ¼k Doz RT';
      } else if (selectedSubsite === 'benign-graves') {
        const inactive = benignClinicalStatus === 'fibrotic';
        primaryScheme = makeScheme(
          'benign-graves-20gy', inactive ? 'Ä°naktif fibrotik hastalÄ±kta RT rutin Ã¶nerilmez' : '20 Gy / 10 fx (Graves Orbitopati)',
          inactive ? 0 : 20, inactive ? 0 : 10, inactive ? 0 : 2,
          'IMRT / VMAT; lens korumasÄ±',
          `${clinicalContext}. Aktif orta-aÄŸÄ±r orbitopatide 2 haftada uygulanÄ±r.`,
          'Orbital yumuÅŸak dokular ve ekstraokÃ¼ler kaslar',
          [{ organ: 'Lens', metric: 'Dmax', limit: '<5 Gy', source: 'DEGRO' }, { organ: 'Retina', metric: 'Dmean', limit: '<30 Gy', source: 'DEGRO' }],
          3,
        );
        alternativeSchemes = [primaryScheme];
        statusText = inactive ? 'Ä°N-AKTÄ°F FÄ°BROZÄ°S: RT YARARI BEKLENMEZ' : 'ENDÄ°KE: AKTÄ°F GRAVES ORBÄ°TOPATÄ°SÄ°NDE ORBÄ°TAL RT';
        targetVolumeBadge = 'Hedef: Bilateral Orbital YumuÅŸak Dokular';
        techniqueBadge = 'Teknik: IMRT / VMAT, Lens KorumasÄ±';
      } else if (selectedSubsite === 'benign-trigeminal') {
        primaryScheme = makeScheme(
          'benign-trigeminal-80gy', '80 Gy / 1 fx (Trigeminal Nevralji SRS)', 80, 1, 80,
          'Stereotaktik radyocerrahi (SRS)',
          `${clinicalContext}. Maksimum tolere edilebilir doz REZ bÃ¶lgesine odaklanÄ±r.`,
          'Trigeminal sinirin kÃ¶k giriÅŸ bÃ¶lgesi (REZ)',
          [{ organ: 'Beyin sapÄ± yÃ¼zeyi', metric: 'Dmax', limit: '<12 Gy', source: 'SRS konsensÃ¼sÃ¼' }],
          2,
        );
        alternativeSchemes = [primaryScheme, { ...primaryScheme, id: 'benign-trigeminal-70gy', name: '70 Gy / 1 fx (Trigeminal Nevralji SRS)', totalDoseGy: 70, fractionDoseGy: 70 }];
        statusText = 'ENDÄ°KE: MEDÄ°KAL TEDAVÄ°YE DÄ°RENÃ‡LÄ° OLGUDA SRS DEÄERLENDÄ°R';
        targetVolumeBadge = 'Hedef: Trigeminal REZ BÃ¶lgesi';
        techniqueBadge = 'Teknik: Stereotaktik Radyocerrahi';
      } else if (selectedSubsite === 'benign-schwannom') {
        const large = benignClinicalStatus === 'large';
        primaryScheme = makeScheme(
          large ? 'benign-schwannom-fsrt' : 'benign-schwannom-srs',
          large ? '50.4 Gy / 28 fx (VestibÃ¼ler Schwannom FSRT)' : '12.5 Gy / 1 fx (VestibÃ¼ler Schwannom SRS)',
          large ? 50.4 : 12.5, large ? 28 : 1, large ? 1.8 : 12.5,
          large ? 'Fraksiyone stereotaktik RT' : 'Stereotaktik radyocerrahi (SRS)',
          `${clinicalContext}. Ä°ÅŸitme, tÃ¼mÃ¶r hacmi ve beyin sapÄ± komÅŸuluÄŸu multidisipliner deÄŸerlendirilmelidir.`,
          'VestibÃ¼ler schwannom hedefi',
          [{ organ: 'Koklea', metric: 'Dmean', limit: '<4 Gy (SRS)', source: 'SRS konsensÃ¼sÃ¼' }, { organ: 'Beyin sapÄ±', metric: 'Dmax', limit: 'Planlama protokolÃ¼ iÃ§inde', source: 'QUANTEC / HyTEC' }],
          3,
        );
        alternativeSchemes = [primaryScheme, { ...primaryScheme, id: large ? 'benign-schwannom-srs-alt' : 'benign-schwannom-fsrt-alt', name: large ? '12-13 Gy / 1 fx (uygun kÃ¼Ã§Ã¼k hedefte SRS)' : '50.4 Gy / 28 fx (FSRT)', totalDoseGy: large ? 12.5 : 50.4, fractionCount: large ? 1 : 28, fractionDoseGy: large ? 12.5 : 1.8 }];
        statusText = 'ENDÄ°KE: VESTÄ°BÃœLER SCHWANNOMDA SRS / FSRT DEÄERLENDÄ°R';
        targetVolumeBadge = 'Hedef: VestibÃ¼ler Schwannom';
        techniqueBadge = large ? 'Teknik: Fraksiyone Stereotaktik RT' : 'Teknik: SRS';
      } else if (selectedSubsite === 'benign-gynecomastia') {
        const symptomatic = benignClinicalStatus === 'symptomatic';
        primaryScheme = makeScheme(
          'benign-gynecomastia-12',
          symptomatic ? '12 Gy / 3 fx (YerleÅŸik AÄŸrÄ±lÄ± Jinekomasti)' : '10 Gy / 1 fx (Jinekomasti Profilaksisi)',
          symptomatic ? 12 : 10,
          symptomatic ? 3 : 1,
          symptomatic ? 4 : 10,
          '6-9 MeV elektron; bilateral meme baÅŸÄ±na bolus',
          'Prostat kanseri antiandrojen tedavisi Ã¶ncesi aÄŸrÄ± ve meme bÃ¼yÃ¼mesini azaltma; bilateral meme baÅŸÄ± ve glandÃ¼ler doku hedeflenir.',
          'Bilateral meme baÅŸÄ± / glandÃ¼ler meme dokusu',
          [{ organ: 'Kalp ve akciÄŸer', metric: 'Doz', limit: 'Minimal doz', source: 'Benign RT konsensÃ¼sÃ¼' }],
        );
        alternativeSchemes = [primaryScheme];
        statusText = 'ENDÄ°KE: JÄ°NEKOMASTÄ° PROFÄ°LAKSÄ°SÄ° / SEMPTOM KONTROLÃœ';
        targetVolumeBadge = 'Hedef: Bilateral Meme BaÅŸlarÄ±';
        techniqueBadge = 'Teknik: 6-9 MeV Elektron + Bolus';
      } else if (selectedSubsite === 'benign-pituitary') {
        const fractionated = benignClinicalStatus === 'chiasm-close';
        const functional = benignClinicalStatus === 'functional';
        primaryScheme = makeScheme(
          fractionated ? 'benign-pituitary-fsrt' : 'benign-pituitary-srs',
          fractionated ? '45-50.4 Gy / 25-28 fx (Kiazma KomÅŸu Fraksiyone SRT)' : `${functional ? 22 : 13} Gy / 1 fx (${functional ? 'Fonksiyonel' : 'Non-fonksiyonel'} Adenom SRS)`,
          fractionated ? 50.4 : functional ? 22 : 13,
          fractionated ? 28 : 1,
          fractionated ? 1.8 : functional ? 22 : 13,
          fractionated ? 'Fraksiyone stereotaktik RT' : 'Stereotaktik radyocerrahi',
          'Hipofiz adenomunda hormon kontrolÃ¼ ve lokal kontrol iÃ§in hacim, hormonal alt tip ve optik kiazma mesafesine gÃ¶re SRS veya fraksiyone SRT.',
          'Hipofiz adenomu ve rezidÃ¼ tÃ¼mÃ¶r',
          [{ organ: 'Optik kiazma', metric: 'Dmax', limit: fractionated ? '<54 Gy' : '<8-10 Gy', source: 'QUANTEC / SRS konsensÃ¼sÃ¼' }],
        );
        alternativeSchemes = [primaryScheme];
        statusText = fractionated ? 'ENDÄ°KE: KÄ°AZMA KOMÅU HÄ°POFÄ°Z ADENOMUNDA FRAKSÄ°YONE SRT' : 'ENDÄ°KE: HÄ°POFÄ°Z ADENOMUNDA SRS';
        targetVolumeBadge = 'Hedef: Hipofiz Adenomu';
        techniqueBadge = fractionated ? 'Teknik: Fraksiyone SRT' : 'Teknik: SRS';
      } else {
        const highGrade = benignClinicalStatus === 'high-grade';
        primaryScheme = makeScheme(
          'benign-avm-20gy', '20 Gy / 1 fx (AVM SRS)', 20, 1, 20,
          'Stereotaktik radyocerrahi (SRS)',
          `${clinicalContext}. Marjin dozu nidus hacmi ve Spetzler-Martin / Pollock skoruna gÃ¶re 16-24 Gy aralÄ±ÄŸÄ±nda bireyselleÅŸtirilir.`,
          'AVM nidusu',
          [{ organ: 'Beyin sapÄ± / optik yol', metric: 'Dmax', limit: 'Konum ve protokole gÃ¶re kÄ±sÄ±tla', source: 'HyTEC / SRS konsensÃ¼sÃ¼' }],
          2,
        );
        alternativeSchemes = [primaryScheme, { ...primaryScheme, id: 'benign-avm-16gy', name: '16 Gy / 1 fx (AVM SRS)', totalDoseGy: 16, fractionDoseGy: 16 }];
        statusText = highGrade ? 'KOMPLEKS AVM: SRS DOZU / FRAKSÄ°YONASYON UZMAN KONSEYÄ°NDE BELÄ°RLENMELÄ°' : 'ENDÄ°KE: UYGUN AVM NÄ°DUSUNDA SRS DEÄERLENDÄ°R';
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
      // 1.A. KHAK (KÃ¼Ã§Ã¼k HÃ¼creli AkciÄŸer Kanseri)
      if (thoraxSubtype === 'sclc') {
        if (sclcStage === 'Sinirli') {
          const isBid = sclcTiming === 'Erken_BID_45Gy';
          const sclcChest: DoseScheme = {
            id: isBid ? 'sclc-turrisi-45' : 'sclc-convert-60',
            name: isBid ? 'Akselere Hiperfraksiyonasyon (1.5 Gy BID / 30 fx, â‰¥ 6 saat ara) Â· Turrisi' : '60-66 Gy QD (CONVERT GÃ¼nlÃ¼k Standart)',
            tag: isBid ? 'âš¡ Turrisi AltÄ±n Standart' : 'ğŸ¯ CONVERT GÃ¼nlÃ¼k',
            totalDoseGy: isBid ? 45 : 60,
            fractionCount: isBid ? 30 : 30,
            fractionDoseGy: isBid ? 1.5 : 2.0,
            alphaBeta: 10,
            technique: 'IMRT / VMAT (Erken EÅŸzamanlÄ± KRT - KT KÃ¼r 1 veya 2 ile)',
            indication: 'SÄ±nÄ±rlÄ± Evre KHAK: Kemoterapi (Sisplatin + Etopozid) ile eÅŸzamanlÄ± erken torasik RT saÄŸkalÄ±m avantajÄ± saÄŸlar (Kategori 1).',
            targetVolumes: [
              { name: 'GTV_T & Nodal', doseGy: isBid ? 45 : 60, marginMm: '0 mm', anatomical: 'Pre-KT primer kitle ve tutulu mediastinal/hiler lenf nodlarÄ±' },
              { name: 'CTV_Involved', doseGy: isBid ? 45 : 60, marginMm: 'GTV + 5 mm', anatomical: 'YalnÄ±zca tutulu alan mikroskobik yayÄ±lÄ±mÄ± (Elektif nodal Ã¶nerilmez)' },
              { name: 'PTV', doseGy: isBid ? 45 : 60, marginMm: 'CTV + 5 mm', anatomical: 'Solunum ve set-up zarfÄ±' },
            ],
            oars: [
              { organ: 'Bilateral AkciÄŸer', metric: 'V20Gy', limit: '< 30%', source: 'CONVERT / Turrisi' },
              { organ: 'Spinal Kord', metric: 'Dmax', limit: '< 45 Gy', source: 'QUANTEC' },
              { organ: 'Ã–zofagus Mean', metric: 'Dmean', limit: '< 34 Gy', source: 'QUANTEC' },
            ],
            systemicTherapy: 'EÅŸzamanlÄ± Sisplatin (60 mg/m2 d1) + Etopozid (120 mg/m2 d1-3) q3w x 4 kÃ¼r.',
            evidence: 'Turrisi et al. (NEJM 1999), CONVERT Trial (Lancet Oncol 2017), NCCN v1.2025 SCLC',
          };

          const sclcPCI: DoseScheme = {
            id: 'sclc-pci-25',
            name: '25 Gy / 10 fx (Profilaktik Kraniyal IÅŸÄ±nlama - PCI)',
            tag: 'ğŸ§  Standart PCI (HA-PCI)',
            totalDoseGy: 25,
            fractionCount: 10,
            fractionDoseGy: 2.5,
            alphaBeta: 10,
            technique: 'VMAT (Hipokampus Koruma - HA-PCI Tercih Edilir)',
            indication: 'Torasik KRT sonrasÄ± tam/kÄ±smi yanÄ±t veren SÄ±nÄ±rlÄ± Evre KHAK olgularÄ±nda beyin metastazÄ± riskini %50 azaltÄ±r ve saÄŸkalÄ±mÄ± uzatÄ±r.',
            targetVolumes: [
              { name: 'PTV_Brain', doseGy: 25, marginMm: '3 mm', anatomical: 'TÃ¼m beyin parankimi (Hipokampus nÃ¶rogenezis zonu hariÃ§)' },
            ],
            oars: [
              { organ: 'Hipokampus Dmax', metric: 'Dmax', limit: '< 16 Gy (D100% < 9 Gy)', source: 'RTOG 0933 / NRG CC003' },
              { organ: 'Optik Kiazma', metric: 'Dmax', limit: '< 25 Gy', source: 'QUANTEC' },
            ],
            systemicTherapy: 'Sistemik KRT tamamlandÄ±ktan 3-4 hafta sonra baÅŸlanÄ±r.',
            evidence: 'Auperin et al. Meta-analysis (NEJM), NRG CC003',
          };

          return {
            statusText: 'ENDÄ°KE: SINIRLI EVRE KHAK ERKEN EÅZAMANLI KRT Â± PCI',
            badgeClass: 'bg-emerald-50 text-emerald-800 border-emerald-300 shadow-[0_0_15px_rgba(16,185,129,0.25)]',
            primaryScheme: sclcChest,
            alternativeSchemes: [sclcChest, sclcPCI],
          };
        } else {
          // YaygÄ±n Evre
          const crest: DoseScheme = {
            id: 'sclc-crest-30',
            name: '30 Gy / 10 fx (CREST Torasik Konsolidasyon RT)',
            tag: 'ğŸ›¡ï¸ CREST Konsolidasyon',
            totalDoseGy: 30,
            fractionCount: 10,
            fractionDoseGy: 3.0,
            alphaBeta: 10,
            technique: '3D-CRT / IMRT',
            indication: 'YaygÄ±n Evre KHAK: Sistemik kemo-immÃ¼noterapiye (EP + Atezolizumab/Durvalumab) yanÄ±t veren olgularda rezidÃ¼el torasik kitleye konsolidasyon RT 2 yÄ±llÄ±k saÄŸkalÄ±mÄ± artÄ±rÄ±r.',
            targetVolumes: [
              { name: 'GTV_Residue', doseGy: 30, marginMm: '0 mm', anatomical: 'Post-KT rezidÃ¼el akciÄŸer kitlesi ve tutulu nodlar' },
              { name: 'PTV', doseGy: 30, marginMm: 'GTV + 8 mm', anatomical: 'Planlanan hedef alan' },
            ],
            oars: [
              { organ: 'Bilateral AkciÄŸer', metric: 'V20Gy', limit: '< 25%', source: 'CREST Trial' },
              { organ: 'Spinal Kord', metric: 'Dmax', limit: '< 30 Gy', source: 'QUANTEC' },
            ],
            systemicTherapy: 'Ä°mmÃ¼noterapi (Atezolizumab veya Durvalumab) idamesine RT sonrasÄ± devam edilir.',
            evidence: 'CREST Faz III Ã‡alÄ±ÅŸmasÄ± (Slotman et al. Lancet 2015)',
          };
          return {
            statusText: 'Ã–NERÄ°LÄ°R: YAYGIN EVRE YANITLI HASTADA TORASÄ°K KONSOLÄ°DASYON RT',
            badgeClass: 'bg-indigo-50 text-indigo-800 border-indigo-300',
            primaryScheme: crest,
            alternativeSchemes: [crest],
          };
        }
      }

      // 1.B. TÄ°MOMA VE TÄ°MÄ°K KARSÄ°NOM
      if (thoraxSubtype === 'thymoma') {
        if (thymicHistology === 'thymic-carcinoma') {
          const thymicCarcinoma: DoseScheme = {
            id: 'thymic-carcinoma-port',
            name: '50-60 Gy / 25-30 fx (Adjuvan Kemoradyoterapi)',
            tag: 'ğŸ›¡ï¸ Timik Karsinom PORT',
            totalDoseGy: thymomaMargin === 'R1' ? 54 : 60,
            fractionCount: thymomaMargin === 'R1' ? 27 : 30,
            fractionDoseGy: 2,
            alphaBeta: 10,
            technique: 'IMRT / VMAT (Kalp ve AkciÄŸer Koruma)',
            indication: 'Timik karsinomda R0 rezeksiyon sonrasÄ±nda dahi yÃ¼ksek lokal ve sistemik nÃ¼ks riski nedeniyle adjuvan kemoradyoterapi ve PORT deÄŸerlendirilmelidir.',
            targetVolumes: [
              { name: 'CTV_Bed', doseGy: thymomaMargin === 'R1' ? 54 : 60, marginMm: 'Anatomik', anatomical: 'TÃ¼mÃ¶r yataÄŸÄ±, cerrahi klipsler ve anterior mediasten' },
              { name: 'PTV', doseGy: thymomaMargin === 'R1' ? 54 : 60, marginMm: 'CTV + 5 mm', anatomical: 'Planlama hedef hacmi' },
            ],
            oars: [
              { organ: 'Kalp Dmean', metric: 'Dmean', limit: '< 20 Gy', source: 'QUANTEC' },
              { organ: 'AkciÄŸer V20Gy', metric: 'V20Gy', limit: '< 25%', source: 'QUANTEC' },
            ],
            systemicTherapy: 'Cerrahi sonrasÄ± platin bazlÄ± eÅŸzamanlÄ± kemoterapi, multidisipliner deÄŸerlendirme ile planlanÄ±r.',
            evidence: 'NCCN v1.2025 Thymic Carcinoma / ITMIG',
          };
          return {
            statusText: 'ENDÄ°KE: TIMÄ°K KARSÄ°NOMDA ADJUVAN KEMORADYOTERAPÄ° (PORT)',
            badgeClass: 'bg-emerald-950/40 text-emerald-300 border-emerald-500/40',
            primaryScheme: thymicCarcinoma,
            alternativeSchemes: [thymicCarcinoma],
          };
        }
        if (thymomaStage === 'Masaoka_I' && thymomaMargin === 'R0') {
          const noRt: DoseScheme = {
            id: 'thymoma-obs',
            name: 'Radyoterapi Ã–nerilmez (Ä°zlem)',
            tag: 'ğŸ‘ï¸ YalnÄ±zca Ä°zlem',
            totalDoseGy: 0,
            fractionCount: 0,
            fractionDoseGy: 0,
            alphaBeta: 10,
            technique: 'Klinik ve Toraks BT Ä°zlemi',
            indication: 'Tam rezeke (R0) Masaoka Evre I timomalarda adjuvan radyoterapi nÃ¼ks veya saÄŸkalÄ±m avantajÄ± saÄŸlamaz.',
            targetVolumes: [],
            oars: [],
            evidence: 'ITMIG & NCCN Guidelines for Thymoma and Thymic Carcinoma',
          };
          return {
            statusText: 'ENDÄ°KE DEÄÄ°LDÄ°R: R0 EVRE I TÄ°MOMADA PORT GEREKMEZ (Ä°ZLEM)',
            badgeClass: 'bg-slate-800 text-slate-200 border-slate-700',
            primaryScheme: noRt,
            alternativeSchemes: [noRt],
          };
        } else {
          const dose = thymomaMargin === 'R1' ? 54 : thymomaStage === 'Masaoka_II' ? 50 : 60;
          const thymomaRt: DoseScheme = {
            id: 'thymoma-port-50',
            name: `${dose} Gy / ${Math.round(dose / 2)} fx (Adjuvan / Definitif Mediastinal RT)`,
            tag: 'ğŸ›¡ï¸ PORT StandardÄ±',
            totalDoseGy: dose,
            fractionCount: Math.round(dose / 2),
            fractionDoseGy: 2.0,
            alphaBeta: 10,
            technique: 'IMRT / VMAT (Kalp ve AkciÄŸer Koruma)',
            indication: 'Masaoka Evre II-III veya R1/R2 cerrahi sÄ±nÄ±r pozitifliÄŸi taÅŸÄ±yan timomalarda lokal nÃ¼ksÃ¼ azaltmak iÃ§in adjuvan PORT uygulanÄ±r.',
            targetVolumes: [
              { name: 'CTV_Bed', doseGy: dose, marginMm: 'Anatomik', anatomical: 'TÃ¼mÃ¶r yataÄŸÄ±, plevral adezyon bÃ¶lgeleri ve anterior mediasten' },
              { name: 'PTV', doseGy: dose, marginMm: 'CTV + 5 mm', anatomical: 'Planlama hedef hacmi' },
            ],
            oars: [
              { organ: 'Kalp Dmean', metric: 'Dmean', limit: '< 20 Gy', source: 'QUANTEC' },
              { organ: 'AkciÄŸer V20Gy', metric: 'V20Gy', limit: '< 25%', source: 'QUANTEC' },
            ],
            evidence: 'ITMIG Retrospective Studies, NCCN v1.2025',
          };
          return {
            statusText: 'ENDÄ°KE: POSTOPERATÄ°F ADJUVAN MEDÄ°ASTÄ°NAL RT (PORT)',
            badgeClass: 'bg-emerald-950/40 text-emerald-300 border-emerald-500/40',
            primaryScheme: thymomaRt,
            alternativeSchemes: [thymomaRt],
          };
        }
      }

      // 1.C. MALÄ°GN PLEVRAL MEZOTELYOMA
      if (thoraxSubtype === 'mesothelioma') {
        const mesoPal: DoseScheme = {
          id: 'meso-pal-30',
          name: '30 Gy / 10 fx (Palyatif Semptom KontrolÃ¼)',
          tag: 'ğŸ›¡ï¸ Palyatif Plevral RT',
          totalDoseGy: 30,
          fractionCount: 10,
          fractionDoseGy: 3.0,
          alphaBeta: 10,
          technique: '3D-CRT / IMRT',
          indication: 'GÃ¶ÄŸÃ¼s duvarÄ± aÄŸrÄ±sÄ± ve nefes darlÄ±ÄŸÄ±nÄ± palye etmek iÃ§in uygulanÄ±r.',
          targetVolumes: [{ name: 'GTV_Pain', doseGy: 30, marginMm: '0 mm', anatomical: 'AÄŸrÄ±lÄ± invaziv plevral kitle odaÄŸÄ±' }],
          oars: [{ organ: 'Spinal Kord', metric: 'Dmax', limit: '< 30 Gy', source: 'QUANTEC' }],
          evidence: 'NCCN v1.2025 Mesothelioma Principles',
        };
        const mesoTract: DoseScheme = {
          id: 'meso-tract-21',
          name: '21 Gy / 3 fx (GiriÅŸim / Dren Yeri Proflaksisi)',
          tag: 'âš ï¸ GiriÅŸim Yeri RT',
          totalDoseGy: 21,
          fractionCount: 3,
          fractionDoseGy: 7.0,
          alphaBeta: 10,
          technique: 'Elektron Demeti veya YÃ¼zeyel Foton',
          indication: 'Torasentez ve dren giriÅŸ traktusunda tÃ¼mÃ¶r tohumlanmasÄ±nÄ± engellemek amacÄ±yla uygulanÄ±r (Klinik tartÄ±ÅŸmalÄ±).',
          targetVolumes: [{ name: 'PTV_Scar', doseGy: 21, marginMm: 'Skar + 10 mm', anatomical: 'Dren ve biyopsi skarlarÄ±' }],
          oars: [{ organ: 'AkciÄŸer', metric: 'Dmax', limit: '< 10 Gy', source: 'Klinik' }],
          evidence: 'SMART Trial, NCCN',
        };
        const mesoAdj: DoseScheme = {
          id: 'meso-hemithoracic-504',
          name: '50.4 Gy / 28 fx (Adjuvan Hemitorasik IMRT, P/D SonrasÄ±)',
          tag: 'âš¡ Adjuvan Hemitorasik RT',
          totalDoseGy: 50.4,
          fractionCount: 28,
          fractionDoseGy: 1.8,
          alphaBeta: 10,
          technique: 'Hemitorasik IMRT / VMAT (akciÄŸer koruyucu P/D sonrasÄ±); EPD sonrasÄ± dikkatli dozimetri',
          indication: 'Plevrektomi/dekortikasyon (P/D) veya geniÅŸletilmiÅŸ plÃ¶ropnÃ¶monektomi (EPD) sonrasÄ± yÃ¼ksek lokal nÃ¼ks riskinde adjuvan hemitorasik RT; IMPRINT verisi P/D sonrasÄ± akciÄŸer koruyucu IMRT gÃ¼venliÄŸini destekler.',
          targetVolumes: [
            { name: 'CTV_Hemithorax', doseGy: 50.4, marginMm: 'Anatomik', anatomical: 'TÃ¼m ipsilateral plevral yÃ¼zey, cerrahi yatak ve insizyon/dren bÃ¶lgeleri' },
            { name: 'PTV', doseGy: 50.4, marginMm: 'CTV + 5-8 mm', anatomical: 'GÃ¼nlÃ¼k IGRT ile set-up gÃ¼venlik marjini' },
          ],
          oars: [
            { organ: 'Ä°psilateral AkciÄŸer (P/D sonrasÄ±)', metric: 'V20Gy', limit: 'MÃ¼mkÃ¼n olan en dÃ¼ÅŸÃ¼k; MLD < 20 Gy', source: 'IMPRINT' },
            { organ: 'KaraciÄŸer (SaÄŸ taraf)', metric: 'Mean', limit: '< 30 Gy', source: 'QUANTEC' },
            { organ: 'Kalp (Sol taraf)', metric: 'Dmean', limit: '< 20 Gy', source: 'QUANTEC' },
          ],
          systemicTherapy: 'Platin + pemetrexed bazlÄ± sistemik tedavi ile multidisipliner koordinasyon.',
          evidence: 'IMPRINT Faz II (Rimmer et al. JCO 2016), NCCN v1.2025 Mesothelioma',
        };
        return {
          statusText: mesoIntent === 'Hemitorasik_Postop' ? 'ENDÄ°KE: P/D-EPD SONRASI ADJUVAN HEMÄ°TORASÄ°K RT' : 'PALYATÄ°F VEYA GÄ°RÄ°ÅÄ°M YERÄ° PROFLAKTÄ°K RT',
          badgeClass: mesoIntent === 'Hemitorasik_Postop' ? 'bg-emerald-50 text-emerald-800 border-emerald-300' : 'bg-indigo-50 text-indigo-800 border-indigo-300',
          primaryScheme: mesoIntent === 'Dren_Yeri' ? mesoTract : mesoIntent === 'Hemitorasik_Postop' ? mesoAdj : mesoPal,
          alternativeSchemes: [mesoPal, mesoTract, mesoAdj],
        };
      }

      // 1.D. KHDAK (KÃ¼Ã§Ã¼k HÃ¼creli DÄ±ÅŸÄ± AkciÄŸer Kanseri)
      const isM1 = selectedM.startsWith('M1');
      const isLocallyAdvanced = selectedN === 'N2' || selectedN === 'N3' || selectedT === 'T3' || selectedT === 'T4';
      const isPostop = thoraxSurgeryStatus.startsWith('Postop');

      if (isM1) {
        if (selectedM === 'M1b') {
          const sbrtOligo: DoseScheme = {
            id: 'lung-oligo-sbrt',
            name: '50 Gy / 5 fx (SABR-COMET Oligometastaz SBRT)',
            tag: 'ğŸ¯ SABR-COMET',
            totalDoseGy: 50,
            fractionCount: 5,
            fractionDoseGy: 10,
            alphaBeta: 10,
            technique: 'SBRT (4D-CT Entegre VMAT)',
            indication: 'Oligometastatik KHDAK (1-3 odak). Primer tÃ¼mÃ¶r ve metastazlara ablatif SBRT genel saÄŸkalÄ±m avantajÄ± saÄŸlar.',
            targetVolumes: [
              { name: 'GTV_Oligo', doseGy: 50, marginMm: '0 mm', anatomical: 'Metastatik odak ve primer kitle' },
              { name: 'PTV_SBRT', doseGy: 50, marginMm: 'ITV + 4 mm', anatomical: 'Ablatif PTV hedefi' },
            ],
            oars: [
              { organ: 'Spinal Kord', metric: 'Dmax', limit: '< 25 Gy', source: 'AAPM TG-101' },
              { organ: 'Bilateral AkciÄŸer', metric: 'V20Gy', limit: '< 15%', source: 'AAPM TG-101' },
            ],
            systemicTherapy: 'Sistemik Kemo-Ä°mmÃ¼noterapi veya hedefe yÃ¶nelik TKI devamlÄ±lÄ±ÄŸÄ±.',
            evidence: 'SABR-COMET Trial (Lancet), Gomez et al.',
          };
          return {
            statusText: 'DEÄERLENDÄ°RÄ°LMELÄ°: OLÄ°GOMETASTAZ ABLATÄ°F SBRT (SABR-COMET)',
            badgeClass: 'bg-amber-50 text-amber-800 border-amber-300 shadow-[0_0_15px_rgba(245,158,11,0.25)]',
            primaryScheme: sbrtOligo,
            alternativeSchemes: [sbrtOligo],
          };
        }
        const pal: DoseScheme = {
          id: 'lung-pal-30',
          name: '30 Gy / 10 fx (Semptom KontrolÃ¼ Palyatif RT)',
          tag: 'ğŸ›¡ï¸ Palyatif RT',
          totalDoseGy: 30,
          fractionCount: 10,
          fractionDoseGy: 3,
          alphaBeta: 10,
          technique: '3D-CRT / Konformal RT',
          indication: 'YaygÄ±n polimetastatik hastalÄ±kta primer tÃ¼mÃ¶re ablatif RT saÄŸkalÄ±mÄ± artÄ±rmaz. Sistemik tedavi Ã¶nceliklidir; RT hemoptizi/aÄŸrÄ± palyasyonuna yÃ¶neliktir.',
          targetVolumes: [{ name: 'GTV_Palyatif', doseGy: 30, marginMm: '0 mm', anatomical: 'Semptomatik obstrÃ¼ktif kitle' }],
          oars: [{ organ: 'Spinal Kord', metric: 'Dmax', limit: '< 30 Gy', source: 'QUANTEC' }],
          systemicTherapy: 'Birinci basamak Kemo-Ä°mmÃ¼noterapi (KEYNOTE-189/407).',
          evidence: 'NCCN v1.2025 Palyatif Ä°lkeler',
        };
        return {
          statusText: 'PALYATÄ°F / SÄ°STEMÄ°K TEDAVÄ° Ã–NCELÄ°KLÄ° (SEMPTOMATÄ°K RT)',
          badgeClass: 'bg-indigo-50 text-indigo-800 border-indigo-300',
          primaryScheme: pal,
          alternativeSchemes: [pal],
        };
      }

      if (isPostop && thoraxSurgeryStatus === 'Postop_R0' && (selectedN === 'N0' || selectedN === 'N1')) {
        const contra: DoseScheme = {
          id: 'lung-contra',
          name: 'Radyoterapi Ã–nerilmez (Ä°zlem)',
          tag: 'â›” KONTRENDÄ°KE',
          totalDoseGy: 0,
          fractionCount: 0,
          fractionDoseGy: 0,
          alphaBeta: 10,
          technique: 'Ä°zlem / Rutin BT Takibi',
          indication: 'R0 rezeke pN0-pN1 olgularda postoperatif radyoterapi (PORT) saÄŸkalÄ±mÄ± dÃ¼ÅŸÃ¼rÃ¼r ve kardiyopulmoner mortaliteyi artÄ±rÄ±r. UYGULANMAMALIDIR.',
          targetVolumes: [],
          oars: [],
          evidence: 'PORT Meta-Analysis (Lancet), Lung-ART (Lancet Oncol 2022)',
        };
        return {
          statusText: 'ENDÄ°KE DEÄÄ°LDÄ°R: PORT KONTRENDÄ°KEDÄ°R (LUNG-ART)',
          badgeClass: 'bg-rose-50 text-rose-800 border-rose-300 shadow-[0_0_15px_rgba(244,63,94,0.3)]',
          primaryScheme: contra,
          alternativeSchemes: [contra],
        };
      }

      if (isLocallyAdvanced) {
        const pacific: DoseScheme = {
          id: 'lung-pacific',
          name: '60 Gy / 30 fx (EÅŸzamanlÄ± KRT + PACIFIC)',
          tag: 'âš¡ PACIFIC Standart',
          totalDoseGy: 60,
          fractionCount: 30,
          fractionDoseGy: 2,
          alphaBeta: 10,
          technique: 'IMRT / VMAT (Elektif Nodal IÅŸÄ±nlama YAPILMAZ)',
          indication: 'Lokal ileri rezeke edilemez Evre III olgularda kesin eÅŸzamanlÄ± KRT standardÄ±. KRT bitiminde progresyonsuz olgularda 12 aya kadar Durvalumab (Kategori 1).',
          targetVolumes: [
            { name: 'GTV_T & Nodal', doseGy: 60, marginMm: '0 mm', anatomical: 'Primer kitle + PET/biyopsi pozitif mediastinal nodlar' },
            { name: 'CTV_Involved', doseGy: 60, marginMm: 'GTV + 5-7 mm', anatomical: 'YalnÄ±zca tutulu alan mikroskobik payÄ±' },
            { name: 'PTV_Definitive', doseGy: 60, marginMm: 'CTV + 5 mm', anatomical: 'Solunum ve set-up zarfÄ±' },
          ],
          oars: [
            { organ: 'Bilateral AkciÄŸer', metric: 'V20Gy', limit: '< 30-35%', source: 'RTOG 0617' },
            { organ: 'Kalp Mean Doz', metric: 'Dmean', limit: '< 15 Gy', source: 'RTOG 0617 (OS Belirleyicisi)' },
            { organ: 'Spinal Kord', metric: 'Dmax', limit: '< 45-50 Gy', source: 'QUANTEC' },
          ],
          systemicTherapy: 'EÅŸzamanlÄ± Sisplatin/Etopozid. KRT bitiminde 12 ay Durvalumab konsolidasyonu.',
          evidence: 'PACIFIC Faz III (NEJM 2017 & 2021), RTOG 0617',
        };
        const highDose: DoseScheme = { ...pacific, id: 'lung-high-66', name: '66 Gy / 33 fx (YÃ¼ksek Doz KRT)', totalDoseGy: 66, fractionCount: 33 };
        return {
          statusText: 'ENDÄ°KE: DEFÄ°NÄ°TÄ°F EÅZAMANLI KRT + PACIFIC DURVALUMAB',
          badgeClass: 'bg-emerald-50 text-emerald-800 border-emerald-300 shadow-[0_0_15px_rgba(16,185,129,0.25)]',
          primaryScheme: pacific,
          alternativeSchemes: [pacific, highDose],
        };
      }

      // Erken Evre SBRT
      const lungSbrtTargets = (doseGy: number) => breathingMotion === 'DIBH'
        ? [
            { name: 'GTV', doseGy, marginMm: '0 mm', anatomical: "Derin inspiryum BT'deki primer parankimal kitle" },
            { name: 'ITV_DIBH', doseGy, marginMm: 'GTV->ITV: DIBH / gating ile artÄ±k solunum hareketini doÄŸrulayÄ±n', anatomical: 'Hareket yÃ¶netimi ve 4D-CT doÄŸrulamasÄ±na gÃ¶re' },
            { name: 'PTV_SBRT', doseGy, marginMm: 'ITV->PTV +3 mm (DIBH / gating)', anatomical: 'GÃ¼nlÃ¼k IGRT ve set-up gÃ¼venlik marjini' },
          ]
        : [
            { name: 'GTV', doseGy, marginMm: '0 mm', anatomical: 'Parankimal primer kitle (BT/PET fÃ¼zyonu)' },
            { name: 'ITV_4D', doseGy, marginMm: 'GTV->ITV: 4D-CT solunum hareket zarfÄ±', anatomical: 'TÃ¼mÃ¶rÃ¼n solunum siklusu boyunca kat ettiÄŸi hareket hacmi (MIP)' },
            { name: 'PTV_SBRT', doseGy, marginMm: 'ITV->PTV +5 mm', anatomical: 'GÃ¼nlÃ¼k IGRT ve set-up gÃ¼venlik marjini' },
          ];
      const lungSbrtTechnique = breathingMotion === 'DIBH'
        ? 'DIBH (Derin Ä°nspiryumda Nefes Tutma) + SGRT (Optik YÃ¼zey RehberliÄŸi) / VMAT'
        : 'SBRT (4D-CT / ITV tabanlÄ± VMAT)';
      let sbrt: DoseScheme;
      let sbrtAlt: DoseScheme | null = null;
      if (thoraxCentrality === 'Central') {
        sbrt = {
          id: 'lung-sbrt-50',
          name: '50 Gy / 5 fx (SBRT Santral No-Fly Zone)',
          tag: 'âš ï¸ Santral SBRT',
          totalDoseGy: 50,
          fractionCount: 5,
          fractionDoseGy: 10,
          alphaBeta: 10,
          technique: `${lungSbrtTechnique} (Risk-Adapte)`,
          indication: 'PBT â‰¤2 cm komÅŸu lezyonlar. Fatal hemoptizi ve bronÅŸiyal fistÃ¼lÃ¼ Ã¶nlemek iÃ§in 5 fraksiyon standardÄ±.',
          targetVolumes: lungSbrtTargets(50),
          oars: [{ organ: 'Proksimal BronÅŸ AÄŸacÄ±', metric: 'Dmax', limit: '< 50 Gy', source: 'RTOG 0813' }],
          evidence: 'RTOG 0813 (Bezjak et al. JCO 2019)',
        };
      } else if (thoraxCentrality === 'UltraCentral') {
        sbrt = {
          id: 'lung-sbrt-60',
          name: '60 Gy / 12 fx (SBRT Ultrasantral SUNSET)',
          tag: 'ğŸ›¡ï¸ Ultrasantral',
          totalDoseGy: 60,
          fractionCount: 12,
          fractionDoseGy: 5,
          alphaBeta: 10,
          technique: `${lungSbrtTechnique} (Hipofraksiyone)`,
          indication: 'Trakea veya Ã¶zofagus ile direkt temas eden lezyonlar. 3-5 fraksiyonluk ablatif dozlar kontrendikedir.',
          targetVolumes: lungSbrtTargets(60),
          oars: [{ organ: 'Ana BronÅŸ / Trakea', metric: 'Dmax', limit: '< 60 Gy', source: 'SUNSET Trial' }],
          evidence: 'SUNSET Trial',
        };
      } else {
        sbrt = {
          id: 'lung-sbrt-54',
          name: '54 Gy / 3 fx (SBRT Periferik Standart)',
          tag: 'ğŸ¯ Periferik SBRT',
          totalDoseGy: 54,
          fractionCount: 3,
          fractionDoseGy: 18,
          alphaBeta: 10,
          technique: lungSbrtTechnique,
          indication: 'Periferik erken evre KHDAK (Kategori 1 kÃ¼ratif altÄ±n standart, BED10 = 151.2 Gy).',
          targetVolumes: lungSbrtTargets(54),
          oars: [
            { organ: 'Bilateral AkciÄŸer', metric: 'V20Gy', limit: '< 10-15%', source: 'RTOG 0236' },
            { organ: 'GÃ¶ÄŸÃ¼s DuvarÄ±', metric: 'V30Gy', limit: '< 30 cc', source: 'RTOG 0236' },
          ],
          evidence: 'RTOG 0236, RTOG 0915, NCCN v1.2025 Kategori 1',
        };
        sbrtAlt = {
          id: 'lung-sbrt-48',
          name: '48 Gy / 4 fx (SBRT Periferik Alternatif)',
          tag: 'ğŸ¯ Periferik 4 fx',
          totalDoseGy: 48,
          fractionCount: 4,
          fractionDoseGy: 12,
          alphaBeta: 10,
          technique: lungSbrtTechnique,
          indication: 'GÃ¶ÄŸÃ¼s duvarÄ±na komÅŸu veya fraksiyon baÅŸÄ±na doz toksisitesi sÄ±nÄ±rlandÄ±rÄ±lmak istenen periferik erken evre KHDAK alternatifi (BED10 = 105.6 Gy).',
          targetVolumes: lungSbrtTargets(48),
          oars: [
            { organ: 'Bilateral AkciÄŸer', metric: 'V20Gy', limit: '< 10-15%', source: 'RTOG 0915' },
            { organ: 'GÃ¶ÄŸÃ¼s DuvarÄ±', metric: 'V30Gy', limit: '< 30 cc', source: 'RTOG 0915' },
          ],
          evidence: 'RTOG 0915, NCCN v1.2025',
        };
      }
      return {
        statusText: `ENDÄ°KE: KÃœRATÄ°F ${sbrt.tag} PROTOKOLÃœ`,
        badgeClass: 'bg-emerald-50 text-emerald-800 border-emerald-300 shadow-[0_0_15px_rgba(16,185,129,0.25)]',
        primaryScheme: sbrt,
        alternativeSchemes: sbrtAlt ? [sbrt, sbrtAlt] : [sbrt],
      };
    }

    // ------------------------------------------
    // 2. JÄ°NEKOLOJÄ° (SERVÄ°KS, ENDOMETRÄ°YUM, OVER, VAJEN, VULVA)
    // ------------------------------------------
    if (selectedOrgan === 'gynecology') {
      if (gynSite === 'Serviks') {
        const cervixCrt: DoseScheme = {
          id: 'gyn-cervix-embrace',
          name: '45-50.4 Gy Pelvik EBRT + HDR 3D Brakiterapi (EMBRACE II)',
          tag: 'âš¡ EMBRACE II Standart',
          totalDoseGy: 45,
          fractionCount: 25,
          fractionDoseGy: 1.8,
          alphaBeta: 10,
          technique: 'IGRT Pelvik KRT + MR KÄ±lavuzluÄŸunda 3D/4D Ä°ntrakaviter/Ä°nterstisyel Brakiterapi',
          indication: 'Lokal ileri Serviks Karsinomu (FIGO IB3-IVA veya LN+). EÅŸzamanlÄ± haftalÄ±k Sisplatinli EBRT sonrasÄ± IGABT ile HR-CTV D90 â‰¥85-90 Gy EQD2 hedeflenir.',
          targetVolumes: [
            { name: 'CTV_Pelvis', doseGy: 45, marginMm: 'Anatomik', anatomical: 'Serviks, uterus, parametriyal dokular, vajen Ã¼st 1/2 ve pelvik lenf nodlarÄ±' },
            { name: 'HR-CTV (High-Risk)', doseGy: 85, marginMm: 'MR bazlÄ±', anatomical: 'Rezidu servikal kitle + tÃ¼m serviks (Brakiterapi ile eskalasyon)' },
          ],
          oars: [
            { organ: 'Rektum', metric: 'D2cc EQD2 Î±/Î²=3 (planlama hedefi / limit)', limit: '< 65 / < 75 Gy', source: 'EMBRACE II', context: 'KÃ¼mÃ¼latif EBRT + brakiterapi; yalnÄ±zca serviks kanseri.', contextEn: 'Cumulative EBRT + brachytherapy; cervical cancer only.', classification: 'protocol-limit' },
            { organ: 'Mesane', metric: 'D2cc EQD2 Î±/Î²=3 (planlama hedefi / limit)', limit: '< 80 / < 90 Gy', source: 'EMBRACE II', context: 'KÃ¼mÃ¼latif EBRT + brakiterapi; yalnÄ±zca serviks kanseri.', contextEn: 'Cumulative EBRT + brachytherapy; cervical cancer only.', classification: 'protocol-limit' },
            { organ: 'Sigmoid / baÄŸÄ±rsak', metric: 'D2cc EQD2 Î±/Î²=3 (planlama hedefi / limit)', limit: '< 70 / < 75 Gy', source: 'EMBRACE II', context: 'KÃ¼mÃ¼latif EBRT + brakiterapi; yalnÄ±zca serviks kanseri.', contextEn: 'Cumulative EBRT + brachytherapy; cervical cancer only.', classification: 'protocol-limit' },
            { organ: 'Bowel bag (EBRT)', metric: 'V45Gy', limit: '< 195 cc', source: 'QUANTEC small bowel (2010)', context: 'EBRT peritoneal cavity/bowel-bag metric; brakiterapi D2cc deÄŸerinden ayrÄ±.', contextEn: 'EBRT peritoneal-cavity/bowel-bag metric; separate from brachytherapy D2cc.', classification: 'dose-volume-reference' },
          ],
          systemicTherapy: 'EÅŸzamanlÄ± haftalÄ±k Sisplatin (40 mg/m2, 5-6 kÃ¼r).',
          evidence: 'EMBRACE II ProtokolÃ¼, NCCN v1.2025 Kategori 1',
        };

        const postopPeters: DoseScheme = {
          id: 'gyn-cervix-peters',
          name: '50.4 Gy / 28 fx Pelvik KRT (Peters ProtokolÃ¼)',
          tag: 'ğŸ”¬ Peters Adjuvan KRT',
          totalDoseGy: 50.4,
          fractionCount: 28,
          fractionDoseGy: 1.8,
          alphaBeta: 10,
          technique: 'IMRT / VMAT + EÅŸzamanlÄ± Sisplatin',
          indication: 'Radikal histerektomi sonrasÄ± yÃ¼ksek risk faktÃ¶rleri (Pozitif cerrahi marjin, pozitif pelvik lenf nodlarÄ±, parametriyal tutulum).',
          targetVolumes: [
            { name: 'CTV_Bed_Pelvis', doseGy: 50.4, marginMm: 'Anatomik', anatomical: 'Vajinal kaf, parametriyum yataÄŸÄ± ve pelvik lenfatik drenaj' },
          ],
          oars: [
            { organ: 'Individual small-bowel loops', metric: 'V15Gy', limit: '< 120 cc (QUANTEC conventional-fractionation reference)', source: 'QUANTEC small bowel (2010)', context: 'Individual loops only; not interchangeable with a bowel-bag V45Gy metric.', contextEn: 'Individual loops only; not interchangeable with a bowel-bag V45Gy metric.', classification: 'dose-volume-reference' },
            { organ: 'Rectum', metric: 'Protocol-specific DVH', limit: 'Follow the applicable postoperative pelvic RT protocol', source: 'Peters / GOG 109 protocol', context: 'Do not apply prostate-specific QUANTEC rectal DVH values as universal gynecologic limits.', contextEn: 'Do not apply prostate-specific QUANTEC rectal DVH values as universal gynecologic limits.', classification: 'context-note' },
          ],
          systemicTherapy: 'EÅŸzamanlÄ± Sisplatin (40-50 mg/m2 haftalÄ±k).',
          evidence: 'Peters et al. (JCO 2000), GOG 109',
        };

        return {
          statusText: cervixScenario === 'Adjuvan_Peters'
            ? 'ENDÄ°KE: POSTOPERATÄ°F YÃœKSEK RÄ°SK ADJUVAN KRT (PETERS)'
            : 'ENDÄ°KE: DEFÄ°NÄ°TÄ°F KEMORADYOTERAPÄ° + 3D IGABT (EMBRACE II)',
          badgeClass: 'bg-emerald-50 text-emerald-800 border-emerald-300 shadow-[0_0_15px_rgba(16,185,129,0.25)]',
          primaryScheme: cervixScenario === 'Adjuvan_Peters' ? postopPeters : cervixCrt,
          alternativeSchemes: [cervixCrt, postopPeters],
        };
      }

      if (gynSite === 'Endometriyum') {
        if (endoRisk === 'Low') {
          const noRt: DoseScheme = {
            id: 'endo-obs',
            name: 'Radyoterapi Ã–nerilmez (Ä°zlem)',
            tag: 'ğŸ‘ï¸ YalnÄ±zca Ä°zlem',
            totalDoseGy: 0,
            fractionCount: 0,
            fractionDoseGy: 0,
            alphaBeta: 10,
            technique: 'DÃ¼zenli Jinekolojik Takip',
            indication: 'DÃ¼ÅŸÃ¼k riskli endometrioid adenokarsinomda (Evre IA, G1-2, LVSI yok) cerrahi sonrasÄ± radyoterapiye gerek yoktur.',
            targetVolumes: [],
            oars: [],
            evidence: 'PORTEC-1, ASTRO Guidelines',
          };
          return {
            statusText: 'ENDÄ°KE DEÄÄ°LDÄ°R: DÃœÅÃœK RÄ°SK ENDOMETRÄ°YUMDA Ä°ZLEM STANDARTTIR',
            badgeClass: 'bg-slate-100 text-slate-700 border-slate-300',
            primaryScheme: noRt,
            alternativeSchemes: [noRt],
          };
        } else if (endoRisk === 'Intermediate' || endoRisk === 'High_Intermediate') {
          const vcb: DoseScheme = {
            id: 'endo-vcb-21',
            name: '21 Gy / 3 fx veya 25 Gy / 5 fx (Vajinal Kaf Brakiterapisi - VCB)',
            tag: 'ğŸ¯ VCB StandardÄ± (PORTEC-2)',
            totalDoseGy: 21,
            fractionCount: 3,
            fractionDoseGy: 7.0,
            alphaBeta: 10,
            technique: 'HDR Vajinal Silindir AplikatÃ¶r (Mukoza altÄ± 5 mm derinlikte)',
            indication: 'YÃ¼ksek-orta risk endometrioid karsinomda (Evre IB G1-2 veya Evre IA G3, yaÅŸ â‰¥60, LVSI+): Pelvik EBRT ile eÅŸit lokal kontrol saÄŸlar, gastrointestinal toksisiteyi belirgin azaltÄ±r.',
            targetVolumes: [
              { name: 'CTV_VaginaCuff', doseGy: 21, marginMm: 'Ãœst 1/3-1/2', anatomical: 'Vajinal kaf ve Ã¼st 3-4 cm vajina mukozasÄ±' },
            ],
            oars: [
              { organ: 'Rektum Mukoza', metric: 'Dmax', limit: '< 100% reÃ§ete dozu', source: 'ABS / ESTRO' },
              { organ: 'Mesane Mukoza', metric: 'Dmax', limit: '< 100% reÃ§ete dozu', source: 'ABS / ESTRO' },
            ],
            evidence: 'PORTEC-2 Faz III (Lancet 2010), ASTRO Endometrial Guidelines',
          };
          return {
            statusText: 'ENDÄ°KE: VAJÄ°NAL KAF BRAKÄ°TERAPÄ°SÄ° (PORTEC-2 STANDARDI)',
            badgeClass: 'bg-emerald-50 text-emerald-800 border-emerald-300',
            primaryScheme: vcb,
            alternativeSchemes: [vcb],
          };
        } else {
          const portec3: DoseScheme = {
            id: 'endo-portec3-45',
            name: '45-50.4 Gy Pelvik EBRT + EÅŸzamanlÄ±/Adjuvan KT (PORTEC-3)',
            tag: 'âš¡ PORTEC-3 YÃ¼ksek Risk',
            totalDoseGy: 45,
            fractionCount: 25,
            fractionDoseGy: 1.8,
            alphaBeta: 10,
            technique: 'IMRT / VMAT Pelvik Nodal RT Â± VCB Boost',
            indication: 'YÃ¼ksek riskli endometriyum ca (Evre III, serÃ¶z/berrak hÃ¼creli veya derin myometriyal invazyon + G3): Pelvik EBRT + KT genel saÄŸkalÄ±mÄ± ve nÃ¼kssÃ¼z saÄŸkalÄ±mÄ± belirgin artÄ±rÄ±r.',
            targetVolumes: [
              { name: 'CTV_Pelvis', doseGy: 45, marginMm: 'Anatomik', anatomical: 'Vajinal kaf, paraservikal yatak ve pelvik lenfatikler' },
              { name: 'VCB_Boost', doseGy: 10, marginMm: 'HDR', anatomical: 'Pozitif marjin veya servikal tutulumda vajinal kaf boostu' },
            ],
            oars: [
              { organ: 'Bowel bag (EBRT)', metric: 'V45Gy', limit: '< 195 cc (QUANTEC reference; protocol-specific)', source: 'QUANTEC small bowel (2010)', context: 'Bowel-bag/peritoneal cavity metric; do not apply as an individual-loop threshold.', contextEn: 'Bowel-bag/peritoneal cavity metric; do not apply as an individual-loop threshold.', classification: 'dose-volume-reference' },
              { organ: 'Mesane', metric: 'Protocol-specific DVH', limit: 'Follow the applicable pelvic RT protocol; no universal QUANTEC V45 limit asserted', source: 'PORTEC-3 protocol', context: 'This is not a QUANTEC small-bowel constraint.', contextEn: 'This is not a QUANTEC small-bowel constraint.', classification: 'context-note' },
            ],
            systemicTherapy: 'RT sÄ±rasÄ±nda 2 kÃ¼r Sisplatin (50 mg/m2) ardÄ±ndan 4 kÃ¼r Karboplatin (AUC 5) + Paklitaksel (175 mg/m2).',
            evidence: 'PORTEC-3 Faz III (Lancet Oncol 2018), GOG 258',
          };
          return {
            statusText: 'ENDÄ°KE: KOMBÄ°NE PELVÄ°K EBRT + SÄ°STEMÄ°K KT (PORTEC-3)',
            badgeClass: 'bg-emerald-50 text-emerald-800 border-emerald-300 shadow-[0_0_15px_rgba(16,185,129,0.25)]',
            primaryScheme: portec3,
            alternativeSchemes: [portec3],
          };
        }
      }

      if (gynSite === 'Over_Tuba') {
        const sbrtOvary: DoseScheme = {
          id: 'ovary-sbrt-35',
          name: '35-45 Gy / 3-5 fx (Oligometastaz / RekÃ¼rrens SBRT)',
          tag: 'ğŸ¯ Over Oligometastaz SBRT',
          totalDoseGy: 35,
          fractionCount: 5,
          fractionDoseGy: 7.0,
          alphaBeta: 10,
          technique: 'SBRT (MR veya BT KÄ±lavuzluÄŸunda Hassas VMAT)',
          indication: 'Over ve tuba kanserinde primer tedavi cerrahi debulking ve sistemik KT\'dir. Ä°zole pelvik/para-aortik nÃ¼kste veya kemorezistan oligoprogresyonda SBRT %90+ lokal kontrol saÄŸlar.',
          targetVolumes: [
            { name: 'GTV_Recurrence', doseGy: 35, marginMm: '0 mm', anatomical: 'PET/MR pozitif nÃ¼ks lenf nodu veya visseral kitle' },
            { name: 'PTV', doseGy: 35, marginMm: 'GTV + 3-5 mm', anatomical: 'Stereotaktik gÃ¼venlik marjini' },
          ],
          oars: [
            { organ: 'Ä°nce BaÄŸÄ±rsak / Duodenum', metric: 'Dmax', limit: '< 30 Gy', source: 'AAPM TG-101' },
            { organ: 'BÃ¼yÃ¼k Damarlar', metric: 'Dmax', limit: '< 45 Gy', source: 'HyTEC' },
          ],
          systemicTherapy: 'Platin duyarlÄ±/direnÃ§li sistemik tedaviye mola saÄŸlama potansiyeli.',
          evidence: 'MITO RT Group Study, NCCN v1.2025 Ovarian Principles',
        };
        const palOvary: DoseScheme = {
          id: 'ovary-pal-30',
          name: '30 Gy / 10 fx (Pelvik Kitle & Hemostaz Palyatif RT)',
          tag: 'ğŸ›¡ï¸ Palyatif Pelvik RT',
          totalDoseGy: 30,
          fractionCount: 10,
          fractionDoseGy: 3.0,
          alphaBeta: 10,
          technique: '3D-CRT / IMRT',
          indication: 'AÄŸrÄ±lÄ± nÃ¼ks pelvik kitle veya rektal/vajinal kanama semptomlarÄ±nÄ± kontrol altÄ±na almak iÃ§in uygulanÄ±r.',
          targetVolumes: [{ name: 'GTV_Mass', doseGy: 30, marginMm: '0 mm', anatomical: 'Semptomatik kitle' }],
          oars: [{ organ: 'BaÄŸÄ±rsak', metric: 'Dmax', limit: '< 32 Gy', source: 'QUANTEC' }],
          evidence: 'Palliative Radiotherapy Guidelines in Gynecologic Oncology',
        };
        return {
          statusText: 'SEÃ‡Ä°LMÄ°Å ENDÄ°KASYON: OLÄ°GOMETASTAZDA SBRT VEYA PALYATÄ°F RT',
          badgeClass: 'bg-amber-50 text-amber-800 border-amber-300',
          primaryScheme: ovaryScenario === 'Oligometastatik_SBRT' ? sbrtOvary : palOvary,
          alternativeSchemes: [sbrtOvary, palOvary],
        };
      }

      if (gynSite === 'Vajen') {
        const vajenCrt: DoseScheme = {
          id: 'vagina-crt-45',
          name: '45 Gy EBRT + Ä°nterstisyel / Ä°ntrakaviter Brakiterapi (Toplam EQD2 75-80 Gy)',
          tag: 'âš¡ Definitif Vajen KRT',
          totalDoseGy: 45,
          fractionCount: 25,
          fractionDoseGy: 1.8,
          alphaBeta: 10,
          technique: 'Pelvik (Â± KasÄ±k) EBRT + 3D HDR Brakiterapi Boost',
          indication: 'Primer Vajen Karsinomu (FIGO Evre II-IVA): Alt 1/3 tutulumunda bilateral inguinal lenfatikler zorunlu olarak alana dahil edilir. EÅŸzamanlÄ± haftalÄ±k Sisplatin uygulanÄ±r.',
          targetVolumes: [
            { name: 'CTV_Vagina_Pelvis', doseGy: 45, marginMm: 'Anatomik', anatomical: 'TÃ¼m vajen, parakolpium, pelvik lenf nodlarÄ± (alt 1/3 ise bilateral kasÄ±k dahil)' },
            { name: 'HR-CTV_Brachy', doseGy: 75, marginMm: 'Brakiterapi', anatomical: 'Primer kitle rezidÃ¼sÃ¼ (Ä°nterstisyel iÄŸneler veya silindir ile boost)' },
          ],
          oars: [
            { organ: 'Rektum D2cc', metric: 'EQD2', limit: '< 70 Gy', source: 'ABS Guidelines' },
            { organ: 'Mesane D2cc', metric: 'EQD2', limit: '< 80 Gy', source: 'ABS Guidelines' },
            { organ: 'Femur BaÅŸlarÄ±', metric: 'Dmax', limit: '< 45 Gy', source: 'QUANTEC' },
          ],
          systemicTherapy: 'EÅŸzamanlÄ± haftalÄ±k Sisplatin (40 mg/m2).',
          evidence: 'ABS Consensus Guidelines for Vaginal Cancer, NCCN',
        };
        return {
          statusText: 'ENDÄ°KE: DEFÄ°NÄ°TÄ°F KEMORADYOTERAPÄ° + Ä°NTERSTÄ°SYEL BRAKÄ°TERAPÄ°',
          badgeClass: 'bg-emerald-50 text-emerald-800 border-emerald-300 shadow-[0_0_15px_rgba(16,185,129,0.25)]',
          primaryScheme: vajenCrt,
          alternativeSchemes: [vajenCrt],
        };
      }

      if (gynSite === 'Vulva') {
        const isPostop = vulvaScenario === 'Adjuvan_Cerrahi_Sonrasi';
        const vulvaPort: DoseScheme = {
          id: 'vulva-port-50',
          name: '45-50.4 Gy / 25-28 fx (Adjuvan Ä°nguinal & Pelvik RT)',
          tag: 'ğŸ›¡ï¸ GROINSS-V-II Standart',
          totalDoseGy: 50.4,
          fractionCount: 28,
          fractionDoseGy: 1.8,
          alphaBeta: 10,
          technique: 'IMRT / VMAT (Bilateral Ä°nguinal ve Pelvik Lenfatik IÅŸÄ±nlama)',
          indication: 'Radikal cerrahi sonrasÄ±: YakÄ±n/pozitif marjin (<8 mm), >1 metastatik lenf nodu veya kapsÃ¼l dÄ±ÅŸÄ± yayÄ±lÄ±m (ENE) varlÄ±ÄŸÄ±nda kasÄ±k nÃ¼ksÃ¼nÃ¼ Ã¶nler ve saÄŸkalÄ±mÄ± korur.',
          targetVolumes: [
            { name: 'CTV_Groin_Pelvis', doseGy: 50.4, marginMm: 'Anatomik', anatomical: 'Bilateral inguinofemoral ve iliak lenf nodu istasyonlarÄ±' },
            { name: 'Boost_LN_ENE', doseGy: 60, marginMm: 'GTV + 5 mm', anatomical: 'KapsÃ¼l dÄ±ÅŸÄ± yayÄ±lan veya rezeke makroskopik nod yataÄŸÄ±' },
          ],
          oars: [
            { organ: 'Femur BaÅŸlarÄ±', metric: 'Dmax', limit: '< 50 Gy', source: 'QUANTEC' },
            { organ: 'Bowel bag / peritoneal cavity', metric: 'V45Gy', limit: '< 195 cc (QUANTEC dose-volume reference)', source: 'QUANTEC small bowel (2010)', context: 'Applies to the bowel-bag/peritoneal-cavity contour, not individual loops.', contextEn: 'Applies to the bowel-bag/peritoneal-cavity contour, not individual loops.', classification: 'dose-volume-reference' },
          ],
          systemicTherapy: 'Ã‡oklu lenf nodu veya ENE pozitifliÄŸinde eÅŸzamanlÄ± haftalÄ±k Sisplatin dÃ¼ÅŸÃ¼nÃ¼lÃ¼r.',
          evidence: 'GROINSS-V-II Trial (JCO 2021), GOG 37 Faz III (NEJM)',
        };

        const vulvaDefinitive: DoseScheme = {
          id: 'vulva-def-64',
          name: '60-64 Gy / 32-35 fx (Definitif / Neoadjuvan KRT)',
          tag: 'âš¡ Definitif Vulva KRT',
          totalDoseGy: 64,
          fractionCount: 32,
          fractionDoseGy: 2.0,
          alphaBeta: 10,
          technique: 'IMRT / VMAT SIB (EÅŸzamanlÄ± Entegre Boost)',
          indication: 'Lokal ileri inoperabl veya organ koruma (sfinkter koruma) hedeflenen olgularda definitif kemoradyoterapi.',
          targetVolumes: [
            { name: 'PTV_Primary_High', doseGy: 64, marginMm: 'GTV + 5 mm', anatomical: 'Primer kitle ve tutulu kasÄ±k nodlarÄ±' },
            { name: 'PTV_Elective_Low', doseGy: 50, marginMm: 'Elektif lenfatik', anatomical: 'Bilateral inguinofemoral ve pelvik istasyonlar' },
          ],
          oars: [
            { organ: 'Femur BaÅŸlarÄ±', metric: 'Dmax', limit: '< 50 Gy', source: 'QUANTEC' },
            { organ: 'Mesane / Rektum', metric: 'V50Gy', limit: '< 20%', source: 'QUANTEC' },
          ],
          systemicTherapy: 'EÅŸzamanlÄ± Sisplatin veya 5-FU / Mitomisin-C.',
          evidence: 'GOG 101, GOG 205',
        };

        return {
          statusText: isPostop
            ? 'ENDÄ°KE: POSTOPERATÄ°F ADJUVAN Ä°NGUÄ°NAL/PELVÄ°K RT (GROINSS-V)'
            : 'ENDÄ°KE: LOKAL Ä°LERÄ° VULVA DEFÄ°NÄ°TÄ°F KEMORADYOTERAPÄ°SÄ°',
          badgeClass: 'bg-emerald-50 text-emerald-800 border-emerald-300 shadow-[0_0_15px_rgba(16,185,129,0.25)]',
          primaryScheme: isPostop ? vulvaPort : vulvaDefinitive,
          alternativeSchemes: [vulvaPort, vulvaDefinitive],
        };
      }
    }

    // ------------------------------------------
    // 3. KEMÄ°K & SARKOM (YDS, OSTEOSARKOM, EWING, KONDROSARKOM, KORDOMA, GCTB)
    // ------------------------------------------
    if (selectedOrgan === 'bone' || selectedOrgan === 'sarcoma' || selectedOrgan === 'bone-sarcoma') {
      if (sarcomaSubtype === 'DFSP') {
        const dfspIndicated = dfspStatus !== 'R0';
        const dfspRt: DoseScheme = {
          id: dfspIndicated ? 'dfsp-adjuvant-56' : 'dfsp-observation',
          name: dfspIndicated ? '50-60 Gy / 25-30 fx (DFSP Adjuvan / Definitif RT)' : 'RT Gerekmez - R0 Cerrahi SonrasÄ± Ä°zlem',
          tag: dfspIndicated ? 'Dermatofibrosarkoma Protuberans' : 'R0 Cerrahi',
          totalDoseGy: dfspIndicated ? 56 : 0,
          fractionCount: dfspIndicated ? 28 : 0,
          fractionDoseGy: dfspIndicated ? 2 : 0,
          alphaBeta: 4,
          technique: 'IMRT / VMAT; tÃ¼mÃ¶r yataÄŸÄ± ve risk uyarlanmÄ±ÅŸ cerrahi sÄ±nÄ±rlar',
          indication: dfspIndicated ? 'R1 pozitif marjin veya rezeke edilemeyen dermatofibrosarkoma protuberans olgusunda lokal kontrol amacÄ±yla adjuvan/definitif RT multidisipliner deÄŸerlendirilir.' : 'R0 cerrahi sonrasÄ± klinik izlem; RT rutin olarak gerekmez.',
          targetVolumes: dfspIndicated ? [{ name: 'CTV_DFSP', doseGy: 56, marginMm: 'Cerrahi skar ve anatomik yayÄ±lÄ±m doÄŸrultusunda', anatomical: 'Ekstremite veya gÃ¶vde primer yataÄŸÄ±' }] : [],
          oars: dfspIndicated ? [{ organ: 'Eklem / cilt', metric: 'Dmean', limit: 'Fonksiyonel doku korumasÄ± ile optimize et', source: 'ESTRO / NCCN' }] : [],
          evidence: 'NCCN Soft Tissue Sarcoma v1.2025; ESTRO sarcoma guidance',
        };
        return {
          statusText: dfspIndicated ? 'ENDÄ°KE: DFSP R1 MARJÄ°N VEYA REZEKE EDÄ°LEMEYEN HASTALIKTA RT DEÄERLENDÄ°R' : 'R0 CERRAHÄ° SONRASI RT GEREKMEZ: Ä°ZLEM',
          badgeClass: dfspIndicated ? 'bg-emerald-50 text-emerald-800 border-emerald-300' : 'bg-slate-100 text-slate-700 border-slate-300',
          primaryScheme: dfspRt,
          alternativeSchemes: [dfspRt],
        };
      }

      if (sarcomaSubtype === 'Yumusak_Doku') {
        const isPreop = sarcomaSurgery === 'Preop';
        const sarcomaScheme: DoseScheme = {
          id: isPreop ? 'sarcoma-preop-50' : 'sarcoma-postop-66',
          name: isPreop ? '50 Gy / 25 fx (Preoperatif Neoadjuvan RT)' : '60-66 Gy / 30-33 fx (Postoperatif Cerrahi SÄ±nÄ±r RT)',
          tag: isPreop ? 'ğŸ›¡ï¸ Preop AltÄ±n Standart' : 'ğŸ”¬ Postop Eskalasyon',
          totalDoseGy: isPreop ? 50 : 66,
          fractionCount: isPreop ? 25 : 33,
          fractionDoseGy: 2,
          alphaBeta: 4,
          technique: 'IMRT / VMAT (Ekstremite Cilt Åeridi ve Eklem Koruma Zorunlu)',
          indication: isPreop
            ? 'YÃ¼ksek dereceli derin yumuÅŸak doku sarkomunda preoperatif RT: Hedef hacim daha kÃ¼Ã§Ã¼k, uzun dÃ¶nem fibrozis ve lenfÃ¶dem riski anlamlÄ± dÃ¼ÅŸÃ¼ktÃ¼r (Cerrahi 4-6 hafta sonra).'
            : 'Pozitif cerrahi marjin (R1) veya yakÄ±n sÄ±nÄ±r olgularÄ±nda lokal kontrolÃ¼ korumak iÃ§in 66 Gy doza Ã§Ä±kÄ±lÄ±r.',
          targetVolumes: [
            { name: 'GTV', doseGy: isPreop ? 50 : 66, marginMm: '0 mm', anatomical: 'Primer kitle veya tÃ¼mÃ¶r rezeksiyon yataÄŸÄ±' },
            { name: 'CTV', doseGy: isPreop ? 50 : 60, marginMm: 'Boyuna 3-4 cm, radyal 1.5 cm', anatomical: 'Fasyal planlar boyunca anatomik mikroskobik yayÄ±lÄ±m payÄ±' },
          ],
          oars: [],
          evidence: 'Kanada Sarcoma Group Faz III (O\'Sullivan et al. Lancet 2002), NCCN v1.2025',
        };
        return {
          statusText: isPreop
            ? 'ENDÄ°KE: PREOPERATÄ°F 50 GY RT (DÃœÅÃœK UZUN DÃ–NEM TOKSÄ°SÄ°TE)'
            : 'ENDÄ°KE: POSTOPERATÄ°F MARJÄ°N ESKALASYONLU RT',
          badgeClass: 'bg-emerald-50 text-emerald-800 border-emerald-300 shadow-[0_0_15px_rgba(16,185,129,0.25)]',
          primaryScheme: sarcomaScheme,
          alternativeSchemes: [sarcomaScheme],
        };
      }

      if (sarcomaSubtype === 'Osteosarkom') {
        if (osteoScenario === 'Cerrahi_R0_Takip') {
          const osteoObs: DoseScheme = {
            id: 'osteo-obs',
            name: 'Radyoterapi Ã–nerilmez (Ä°zlem)',
            tag: 'ğŸ‘ï¸ Cerrahi R0 Ä°zlem',
            totalDoseGy: 0,
            fractionCount: 0,
            fractionDoseGy: 0,
            alphaBeta: 10,
            technique: 'Adjuvan MAP Kemoterapisi + Ä°zlem',
            indication: 'Osteosarkom klasik olarak radyorezistandÄ±r. R0 geniÅŸ rezeksiyon ve neoadjuvan/adjuvan kemoterapi (Metotreksat, Doksorubisin, Sisplatin) standarttÄ±r; RT Ã¶nerilmez.',
            targetVolumes: [],
            oars: [],
            evidence: 'NCCN Bone Cancer Guidelines - Osteosarcoma Principles',
          };
          return {
            statusText: 'ENDÄ°KE DEÄÄ°LDÄ°R: R0 CERRAHÄ° SONRASI RT GEREKMEZ (KT + Ä°ZLEM)',
            badgeClass: 'bg-slate-100 text-slate-700 border-slate-300',
            primaryScheme: osteoObs,
            alternativeSchemes: [osteoObs],
          };
        } else {
          const osteoHigh: DoseScheme = {
            id: 'osteo-high-70',
            name: '66-74 Gy / 33-37 fx (YÃ¼ksek Doz Eskalasyonlu RT)',
            tag: 'ğŸ”¬ YÃ¼ksek Doz / PartikÃ¼l RT',
            totalDoseGy: 70,
            fractionCount: 35,
            fractionDoseGy: 2.0,
            alphaBeta: 10,
            technique: 'IMRT / VMAT veya Proton / Karbon Ä°yon Tedavisi',
            indication: 'Rezeke edilemeyen, pozitif marjinli (R1/R2) veya aksiyel/pelvik/kafatasÄ± tabanÄ± osteosarkomlarÄ±nda lokal kontrol iÃ§in yÃ¼ksek doza Ã§Ä±kÄ±lmalÄ±dÄ±r.',
            targetVolumes: [
              { name: 'GTV_Residue', doseGy: 70, marginMm: '0 mm', anatomical: 'Makroskopik rezidÃ¼ veya cerrahi sÄ±nÄ±r pozitif kemik yataÄŸÄ±' },
              { name: 'CTV', doseGy: 60, marginMm: 'GTV + 15 mm', anatomical: 'Mikroskobik kemik iliÄŸi ve periostal alan' },
            ],
            oars: [
              { organ: 'Spinal Kord', metric: 'Dmax', limit: '< 45-50 Gy', source: 'QUANTEC' },
              { organ: 'BÃ¼yÃ¼k Sinir GÃ¶vdeleri', metric: 'Dmax', limit: '< 60 Gy', source: 'QUANTEC' },
            ],
            systemicTherapy: 'Sistemik MAP kemoterapisi eÅŸlik eder.',
            evidence: 'NCCN Bone Cancer Guidelines, DeLaney et al. (Cancer 2005)',
          };
          return {
            statusText: 'ENDÄ°KE: Ä°NOPERABL VEYA R1/R2 OSTEOSARKOMDA YÃœKSEK DOZ RT',
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
          tag: isDefinitive ? 'âš¡ Definitif KÃ¼ratif RT' : 'ğŸ›¡ï¸ Postop Adjuvan RT',
          totalDoseGy: isDefinitive ? 55.8 : 50.4,
          fractionCount: isDefinitive ? 31 : 28,
          fractionDoseGy: 1.8,
          alphaBeta: 10,
          technique: 'IMRT / VMAT (Pre-KT BaÅŸlangÄ±Ã§ Kemik Hacmi Zorunlu)',
          indication: 'Ewing sarkomu yÃ¼ksek derecede radyosensitiftir. Cerrahiye uygun olmayan olgularda veya pozitif cerrahi sÄ±nÄ±r sonrasÄ± lokal kontrol saÄŸlar.',
          targetVolumes: [
            { name: 'CTV_Initial_Bone', doseGy: 45, marginMm: 'Anatomik', anatomical: 'Kemoterapi Ã–NCESÄ° baÅŸlangÄ±Ã§taki tÃ¼m kemik tutulum hacmi' },
            { name: 'CTV_Boost_Residue', doseGy: isDefinitive ? 55.8 : 50.4, marginMm: 'GTV + 10 mm', anatomical: 'Kemoterapi SONRASI rezidÃ¼el yumuÅŸak doku kompanenti' },
          ],
          oars: [
            { organ: 'BÃ¼yÃ¼me PlaÄŸÄ± (Pediatrik)', metric: 'Dmean', limit: 'Asimetrik bÃ¼yÃ¼meyi Ã¶nlemek iÃ§in homojen alan', source: 'PENTEC' },
            { organ: 'KomÅŸu Eklem', metric: 'V50Gy', limit: '< 50%', source: 'QUANTEC' },
          ],
          systemicTherapy: 'VDC/IE (Vinkristin, Doksorubisin, Siklofosfamid / Ä°fosfamid, Etopozid) kemoterapisi.',
          evidence: 'Euro-EWING 99, Children\'s Oncology Group (COG) Protocols',
        };
        return {
          statusText: 'ENDÄ°KE: RADYOSENSÄ°TÄ°F EWING SARKOMU LOKAL KONTROL PROTOKOLÃœ',
          badgeClass: 'bg-emerald-50 text-emerald-800 border-emerald-300 shadow-[0_0_15px_rgba(16,185,129,0.25)]',
          primaryScheme: ewingScheme,
          alternativeSchemes: [ewingScheme],
        };
      }

      if (sarcomaSubtype === 'Kondrosarkom') {
        const chondroRt: DoseScheme = {
          id: 'chondro-70',
          name: '70-74 Gy / 35-37 fx (PartikÃ¼l / YÃ¼ksek Doz Eskalasyon)',
          tag: 'ğŸ”¬ Doz Eskalasyonlu RT',
          totalDoseGy: 70,
          fractionCount: 35,
          fractionDoseGy: 2.0,
          alphaBeta: 10,
          technique: 'Proton Terapi / Karbon Ä°yon veya YÃ¼ksek Doz IMRT',
          indication: 'Konvansiyonel kondrosarkomlar radyorezistandÄ±r. Ä°noperabl, kafa tabanÄ± veya sakral olgularda â‰¥70 Gy EQD2 gereklidir.',
          targetVolumes: [{ name: 'GTV', doseGy: 70, marginMm: '0 mm', anatomical: 'RezidÃ¼ veya inoperabl kitle' }],
          oars: [{ organ: 'Beyin SapÄ± / Optik Yol', metric: 'Dmax', limit: '< 54 Gy', source: 'QUANTEC' }],
          evidence: 'NCCN Bone Cancer, Particle Therapy Oncology Group',
        };
        return {
          statusText: 'SEÃ‡Ä°LMÄ°Å OLGULARDA: Ä°NOPERABL KONDROSARKOMDA YÃœKSEK DOZ RT',
          badgeClass: 'bg-amber-50 text-amber-800 border-amber-300',
          primaryScheme: chondroRt,
          alternativeSchemes: [chondroRt],
        };
      }

      if (sarcomaSubtype === 'Kordoma') {
        const chordomaScheme: DoseScheme = {
          id: 'chordoma-74',
          name: '74-76 Gy / 37-38 fx (Klivus / Sakrum Ultra YÃ¼ksek Doz)',
          tag: 'âš¡ Ultra YÃ¼ksek Doz / PartikÃ¼l',
          totalDoseGy: 74,
          fractionCount: 37,
          fractionDoseGy: 2.0,
          alphaBeta: 2.5,
          technique: 'Proton / Karbon Ä°yon veya Stereotaktik Fraksiyone SRT',
          indication: 'Kordomalar son derece radyorezistandÄ±r ve komÅŸu nÃ¶ral yapÄ±lara yakÄ±ndÄ±r. KÃ¼ratif kontrol iÃ§in >74 Gy EQD2 dozu ÅŸarttÄ±r.',
          targetVolumes: [{ name: 'GTV', doseGy: 74, marginMm: '0 mm', anatomical: 'Sakral veya klivus lezyon hacmi' }],
          oars: [{ organ: 'Beyin SapÄ± / Kord', metric: 'Dmax', limit: '< 54-60 Gy', source: 'HyTEC' }],
          evidence: 'Consensus Guidelines for Chordoma Management',
        };
        return {
          statusText: 'ENDÄ°KE: KORDOMADA ULTRA YÃœKSEK DOZ PARTÄ°KÃœL / IMRT ESKALASYONU',
          badgeClass: 'bg-emerald-50 text-emerald-800 border-emerald-300',
          primaryScheme: chordomaScheme,
          alternativeSchemes: [chordomaScheme],
        };
      }

      if (sarcomaSubtype === 'GCTB') {
        const gctbScheme: DoseScheme = {
          id: 'gctb-50',
          name: '45-50.4 Gy / 25-28 fx (Definitif Lokal Kontrol RT)',
          tag: 'ğŸ›¡ï¸ GCTB Lokal Kontrol',
          totalDoseGy: 50.4,
          fractionCount: 28,
          fractionDoseGy: 1.8,
          alphaBeta: 10,
          technique: 'Konformal IMRT / VMAT',
          indication: 'Cerrahi rezeksiyonu aÄŸÄ±r morbidite veya instabilite yaratacak omurga/pelvis yerleÅŸimli veya Denosumab sonrasÄ± inoperabl olgularda %80+ lokal kontrol saÄŸlar.',
          targetVolumes: [{ name: 'GTV', doseGy: 50.4, marginMm: '0 mm', anatomical: 'Ekspansif litik kitle' }],
          oars: [{ organ: 'Spinal Kord', metric: 'Dmax', limit: '< 45 Gy', source: 'QUANTEC' }],
          evidence: 'NCCN Bone Sarcoma Guidelines',
        };
        return {
          statusText: 'ENDÄ°KE: Ä°NOPERABL DEV HÃœCRELÄ° KEMÄ°K TÃœMÃ–RÃœNDE DEFÄ°NÄ°TÄ°F RT',
          badgeClass: 'bg-emerald-50 text-emerald-800 border-emerald-300',
          primaryScheme: gctbScheme,
          alternativeSchemes: [gctbScheme],
        };
      }
    }

    // ------------------------------------------
    // 4. BAÅ-BOYUN
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
          tag: 'ğŸ¯ Erken Glottik Standart',
          totalDoseGy: 63,
          fractionCount: 28,
          fractionDoseGy: 2.25,
          alphaBeta: 10,
          technique: '3D-CRT / VMAT (YalnÄ±zca Vokal Kordlar - Boyun IÅINLANMAZ)',
          indication: 'Erken evre T1a/b-T2 N0 Glottik Kanser: Vokal kord mobilitesi ve ses kalitesini korur; elektif boyun Ä±ÅŸÄ±nlamasÄ± KESÄ°NLÄ°KLE yapÄ±lmaz.',
          targetVolumes: [
            { name: 'PTV_Glottic', doseGy: 63, marginMm: '5 mm', anatomical: 'GerÃ§ek vokal kordlar, Ã¶n komissÃ¼r ve aritenoid vokal proÃ§es' },
          ],
          oars: [
            { organ: 'Karotis Arterler', metric: 'Dmean', limit: '< 20-30 Gy (Ä°nme Ã¶nleme)', source: 'RTOG' },
            { organ: 'Spinal Kord', metric: 'Dmax', limit: '< 30 Gy', source: 'QUANTEC' },
          ],
          evidence: 'RTOG 9512, Yamazaki et al., NCCN v1.2025',
        };
        return {
          statusText: 'ENDÄ°KE: ERKEN GLOTTÄ°K LARÄ°NKS HÄ°POFRAKSÄ°YONE RT (BOYUNSUZ)',
          badgeClass: 'bg-emerald-50 text-emerald-800 border-emerald-300 shadow-[0_0_15px_rgba(16,185,129,0.25)]',
          primaryScheme: earlyGlottic,
          alternativeSchemes: [earlyGlottic],
        };
      }

      if (hnSubsite === 'maxillary-sinus') {
        const highRiskAdjuvant = hnENE || hnPositiveMargin;
        const dose = highRiskAdjuvant ? 66 : 60;
        const maxillarySinusScheme: DoseScheme = {
          id: 'maxillary-sinus-postoperative',
          name: `${dose} Gy / ${dose / 2} fx (${highRiskAdjuvant ? 'Kategori 1 eÅŸzamanlÄ± kemoradyoterapi' : 'adjuvan radyoterapi'})`,
          tag: highRiskAdjuvant ? 'Kategori 1 Â· ENE+ / R1' : 'Maksiller SinÃ¼s',
          totalDoseGy: dose,
          fractionCount: dose / 2,
          fractionDoseGy: 2,
          alphaBeta: 10,
          technique: 'IMRT / VMAT Â· IGRT',
          indication: highRiskAdjuvant
            ? 'ENE+ veya R1 cerrahi sÄ±nÄ±r: Kategori 1 adjuvan eÅŸzamanlÄ± sisplatin ve 66 Gy / 33 fx.'
            : 'Maksiller sinÃ¼s histolojisi, evresi, cerrahi ve risk Ã¶zelliklerine gÃ¶re multidisipliner deÄŸerlendirme.',
          targetVolumes: [
            { name: 'CTV_Primary_High_Risk', doseGy: dose, marginMm: 'High-risk CTV->PTV +3-5 mm', anatomical: 'Cerrahi yatak / primer tÃ¼mÃ¶r yataÄŸÄ±' },
            { name: 'CTV_Elective_Nodal', doseGy: highRiskAdjuvant ? 54 : 50, marginMm: 'Elective nodal CTV->PTV +5 mm', anatomical: 'Patoloji ve baÅŸlangÄ±Ã§ gÃ¶rÃ¼ntÃ¼lemeye gÃ¶re elektif boyun' },
          ],
          oars: [],
          systemicTherapy: highRiskAdjuvant ? 'EÅŸzamanlÄ± sisplatin (uygunluk ve kurum protokolÃ¼ne gÃ¶re).' : undefined,
          evidence: 'EORTC 22931 (NEJM 2004), RTOG 9501 (NEJM 2004)',
        };
        return {
          statusText: highRiskAdjuvant
            ? 'KATEGORÄ° 1: ENE+ / R1 Â· 66 Gy / 33 fx + EÅZAMANLI SÄ°SPLATÄ°N'
            : 'Maksiller SinÃ¼s: Histoloji, evre ve risk bilgileriyle MDT deÄŸerlendirmesi',
          badgeClass: highRiskAdjuvant
            ? 'bg-rose-950/60 text-rose-100 border-rose-500/60'
            : 'bg-sky-950/60 text-sky-100 border-sky-500/40',
          primaryScheme: maxillarySinusScheme,
          alternativeSchemes: [maxillarySinusScheme],
        };
      }

      if (hnSubsite === 'oral-cavity') {
        const highRiskAdjuvant = hnENE || hnPositiveMargin;
        const oralCavityDose = highRiskAdjuvant ? 66 : 60;
        const oralCrt: DoseScheme = {
          id: 'oral-postop-66',
          name: `${oralCavityDose} Gy / ${oralCavityDose / 2} fx (Postoperatif ${highRiskAdjuvant ? 'KRT' : 'RT'} - EORTC 22931 / RTOG 9501)`,
          tag: 'âš¡ EORTC/RTOG Standart',
          totalDoseGy: oralCavityDose,
          fractionCount: oralCavityDose / 2,
          fractionDoseGy: 2.0,
          alphaBeta: 10,
          technique: 'IMRT / VMAT (YÃ¼ksek Risk Yatak Boostu)',
          indication: highRiskAdjuvant
            ? 'Oral kavite cerrahisi sonrasÄ± ENE veya pozitif cerrahi sÄ±nÄ±r (R1) nedeniyle Sisplatin eÅŸzamanlÄ± adjuvan KRT deÄŸerlendirilir (EORTC 22931 / RTOG 9501).'
            : electiveNeckIndicated
              ? 'TÃ¼mÃ¶r Ã§apÄ± >1 cm veya DOI >5 mm olduÄŸunda elektif boyun tedavisi/diseksiyonu deÄŸerlendirilir; iyi lateralize tÃ¼mÃ¶rde ipsilateral alan yeterli olabilir.'
              : 'Ä°yi lateralize, dÃ¼ÅŸÃ¼k riskli oral kavite tÃ¼mÃ¶rÃ¼nde ipsilateral elektif boyun alanÄ± veya uygun cerrahi yaklaÅŸÄ±m multidisipliner deÄŸerlendirilir.',
          targetVolumes: [
            { name: 'PTV_Primary_Bed', doseGy: oralCavityDose, marginMm: 'High-risk CTV->PTV +3-5 mm', anatomical: 'Primer rezeksiyon yataÄŸÄ± ve patolojiye gÃ¶re yÃ¼ksek risk alanÄ±' },
            ...(electiveNeckIndicated || selectedN !== 'N0' ? [{ name: 'PTV_Elective_Neck', doseGy: 54, marginMm: 'Elective nodal CTV->PTV +5 mm', anatomical: `${bilateralNeck ? 'Bilateral' : 'Lateralize tÃ¼mÃ¶rde ipsilateral'} Level I-IV boyun${hnENE || selectedN === 'N2' || selectedN === 'N3' ? ' + Level V' : ''}` }] : []),
            ...(hnENE || selectedN === 'N2' || selectedN === 'N3' ? [{ name: 'PTV_Nodal_High_Risk_Boost', doseGy: selectedN === 'N3' ? 70 : 66, marginMm: 'Tutulu nod yataÄŸÄ± / SIB', anatomical: `Level V dahil yÃ¼ksek riskli nodal alan; ${selectedN === 'N3' ? '70 Gy' : '66 Gy'} SIB boost` }] : []),
          ],
          oars: [
            { organ: 'Mandibula', metric: 'Plan-specific dose review', limit: 'Minimize dose; assess dental status and osteoradionecrosis risk', source: 'Site- and protocol-specific planning guidance', context: 'No universal QUANTEC Dmax/V60 threshold; evaluate contour, dental factors, surgery and fractionation.', contextEn: 'No universal QUANTEC Dmax/V60 threshold; evaluate contour, dental factors, surgery and fractionation.', classification: 'planning-aim' },
            { organ: 'Parotis Bezi (KarÅŸÄ±)', metric: 'Dmean', limit: '< 26 Gy', source: 'QUANTEC' },
            { organ: 'Spinal Kord', metric: 'Dmax', limit: '< 45 Gy', source: 'QUANTEC' },
          ],
          systemicTherapy: highRiskAdjuvant ? 'EÅŸzamanlÄ± Sisplatin (100 mg/m2 3 haftalÄ±k veya 40 mg/m2 haftalÄ±k) deÄŸerlendirilir.' : 'Sisplatin, yalnÄ±zca patolojik yÃ¼ksek risk Ã¶lÃ§Ã¼tleri varsa deÄŸerlendirilir.',
          evidence: 'EORTC 22931 (NEJM 2004), RTOG 9501 (NEJM 2004)',
        };
        return {
          statusText: highRiskAdjuvant
            ? 'ENDÄ°KE: ENE / R1 VARLIÄINDA POSTOPERATÄ°F ADJUVAN KEMORADYOTERAPÄ°'
            : electiveNeckIndicated
              ? 'ENDÄ°KE: TÃœMÃ–R Ã‡API / DOI NEDENÄ°YLE ELEKTÄ°F BOYUN TEDAVÄ°SÄ° DEÄERLENDÄ°R'
              : 'RÄ°SK UYARLI: CERRAHÄ° SONRASI PRÄ°MER YATAK RT DEÄERLENDÄ°R',
          badgeClass: 'bg-emerald-50 text-emerald-800 border-emerald-300 shadow-[0_0_15px_rgba(16,185,129,0.25)]',
          primaryScheme: oralCrt,
          alternativeSchemes: [oralCrt],
        };
      }

      // Nazofarenks / Orofarenks / Standart SIB
      const hnSib: DoseScheme = {
        id: 'hn-sib-70',
        name: '70 / 60 / 54 Gy - 33 fx (3 Kademeli Standart SIB Kemoradyoterapi)',
        tag: 'âš¡ BaÅŸ-Boyun Standart SIB',
        totalDoseGy: 70,
        fractionCount: 33,
        fractionDoseGy: 2.12,
        alphaBeta: 10,
        technique: 'VMAT / IMRT (EÅŸzamanlÄ± Entegre Boost)',
        indication: `${hnSubsite === 'larynx' && hnLarynxSubsite === 'Lokal_Ileri_T3_T4' ? 'Lokal ileri supraglottik/glottik' : 'Lokal ileri baÅŸ-boyun'} kanserinde definitif kemoradyoterapi. ${hnSubsite === 'nasopharynx' ? 'Bilateral Level II-Vb ve retrofaringeal lenf nodlarÄ± (RPN) zorunlu hedef hacimdir.' : bilateralNeck ? 'Bilateral Level II-IV kapsanÄ±r; nazofarenkste Level II-Vb ve RPN, oral kavitede Level I-IV uygulanÄ±r.' : 'Ä°yi lateralize oral kavite primerinde ipsilateral Level I-III; DOI >5 mm ise Level IV eklenir.'} ${hnENE || selectedN === 'N2' || selectedN === 'N3' ? 'ENE+ veya N2-N3 varlÄ±ÄŸÄ±nda Level V dahil edilir ve tutulu nod yataÄŸÄ±na 66-70 Gy SIB boost uygulanÄ±r.' : ''}`,
        targetVolumes: [
          { name: 'PTV_High (GTV)', doseGy: 70, marginMm: 'High-risk CTV->PTV +3-5 mm', anatomical: 'Primer kitle ve makroskopik tutulu lenf nodlarÄ±' },
          { name: 'PTV_Mid (Subklinik)', doseGy: 60, marginMm: 'YÃ¼ksek risk nodlar', anatomical: 'Primer komÅŸuluÄŸu ve tutulu nod istasyonu' },
          { name: 'PTV_Low (Elektif)', doseGy: 54, marginMm: 'Elective nodal CTV->PTV +5 mm', anatomical: hnSubsite === 'nasopharynx' ? 'Bilateral Level II-Vb + retrofaringeal lenf nodlarÄ± (RPN)' : `${bilateralNeck ? 'Bilateral' : 'Ä°psilateral'} Level II-IV${hnENE || selectedN === 'N2' || selectedN === 'N3' ? ' + Level V' : ''}` },
          ...(hnENE || selectedN === 'N2' || selectedN === 'N3' ? [{ name: 'PTV_Nodal_High_Risk_Boost', doseGy: selectedN === 'N3' ? 70 : 66, marginMm: 'Tutulu nod yataÄŸÄ± / SIB', anatomical: `Level V dahil tutulu nod yataÄŸÄ±; ${selectedN === 'N3' ? '70 Gy' : '66 Gy'} SIB boost` }] : []),
        ],
        oars: [
          { organ: 'Parotis Bezi (Kontralateral)', metric: 'Dmean', limit: '< 26 Gy', source: 'QUANTEC (Kserostomi korumasÄ±)' },
          { organ: 'Spinal Kord', metric: 'Dmax', limit: '< 45 Gy', source: 'QUANTEC' },
          { organ: 'Beyin SapÄ±', metric: 'Dmax', limit: '< 54 Gy', source: 'QUANTEC' },
        ],
        systemicTherapy: 'EÅŸzamanlÄ± Sisplatin (100 mg/m2 gÃ¼n 1, 22, 43 veya 40 mg/m2 haftalÄ±k).',
        evidence: 'RTOG 0129, RTOG 0522, GORTEC, NCCN v1.2025 Head and Neck',
      };
      return {
        statusText: 'ENDÄ°KE: DEFÄ°NÄ°TÄ°F KEMORADYOTERAPÄ° SIB PROTOKOLÃœ (70/60/54 GY)',
        badgeClass: 'bg-emerald-50 text-emerald-800 border-emerald-300 shadow-[0_0_15px_rgba(16,185,129,0.25)]',
        primaryScheme: hnSib,
        alternativeSchemes: [hnSib],
      };
    }

    // ------------------------------------------
    // 5. SANTRAL SÄ°NÄ°R SÄ°STEMÄ°
    // ------------------------------------------
    if (selectedOrgan === 'cns') {
      if (cnsSubtype === 'glioma') {
        const riskCount = Object.values(gliomaRiskFactors).filter(Boolean).length;
        const highRisk = gliomaGrade === 'Grade_3' || gliomaGrade === 'Grade_4' || riskCount >= 2 || gliomaRiskFactors.molecularHighRisk;
        const isGbm = gliomaHistology === 'gbm' || gliomaGrade === 'Grade_4';
        const isOligo = gliomaHistology === 'oligodendroglioma';
        const isAstro = gliomaHistology === 'astrocytoma';
        const dose = isGbm ? 60 : gliomaGrade === 'Grade_3' ? 59.4 : highRisk ? 54 : 50.4;
        const fractions = isGbm ? 30 : gliomaGrade === 'Grade_3' ? 33 : highRisk ? 30 : 28;
        const glioma: DoseScheme = {
          id: isGbm ? 'glioma-stupp-60' : isOligo ? 'glioma-oligo-pcv' : highRisk ? 'glioma-high-risk-57' : 'glioma-low-risk-504',
          name: isGbm
            ? '60 Gy / 30 fx + TMZ (Stupp)'
            : isOligo
              ? '54-59.4 Gy / 30-33 fx + PCV (RTOG 9402 Oligodendrogliom)'
              : gliomaGrade === 'Grade_3'
                ? '59.4-60 Gy / 30-33 fx + TMZ/PCV'
                : highRisk
                  ? '54 Gy / 30 fx + TMZ/PCV'
                  : '45-54 Gy / 25-30 fx veya Ä°zlem',
          tag: isGbm ? 'WHO Grade 4 / GBM (IDH-wildtype)' : isOligo ? 'Oligodendrogliom (1p/19q ko-del)' : isAstro ? 'Astrositom (IDH-mutant)' : highRisk ? 'YÃ¼ksek Riskli Gliom' : 'DÃ¼ÅŸÃ¼k Riskli Gliom',
          totalDoseGy: dose,
          fractionCount: fractions,
          fractionDoseGy: dose / fractions,
          alphaBeta: 10,
          technique: 'IMRT / VMAT; cerrahi kavite + T2/FLAIR CTV',
          indication: isGbm
            ? 'Maksimal gÃ¼venli rezeksiyon sonrasÄ± eÅŸzamanlÄ± ve adjuvan TMZ ile Stupp protokolÃ¼.'
            : isOligo
              ? '1p/19q ko-delesyonlu oligodendrogliomda RT sonrasÄ± adjuvan PCV, RTOG 9402 uzun dÃ¶nem saÄŸkalÄ±m avantajÄ± gÃ¶stermiÅŸtir; TMZ alternatifi daha zayÄ±ftÄ±r.'
              : isAstro
                ? 'IDH-mutant astrositomda CDKN2A/B delesyonu ve grade; dÃ¼ÅŸÃ¼k riskli Grade 2 olguda izlem veya fokal RT, yÃ¼ksek riskte RT + TMZ deÄŸerlendirilir.'
                : highRisk
                  ? `Pignatti/RTOG 9802 risk kriterleri: ${riskCount} kriter; PCV veya TMZ ile eskalasyon.`
                  : 'Grade 1-2 dÃ¼ÅŸÃ¼k riskli gliomda izlem veya fokal RT multidisipliner deÄŸerlendirilir.',
          targetVolumes: [{ name: 'GTV/CTV/PTV', doseGy: dose, marginMm: 'GTV + 1.5-2 cm CTV; PTV + 3-5 mm', anatomical: 'Cerrahi kavite, rezidÃ¼ tÃ¼mÃ¶r ve T2/FLAIR anormalliÄŸi' }],
          oars: [{ organ: 'Optik kiazma', metric: 'Dmax', limit: '< 54 Gy', source: 'QUANTEC' }, { organ: 'Beyin sapÄ±', metric: 'Dmax', limit: '< 54 Gy', source: 'QUANTEC' }],
          systemicTherapy: isGbm
            ? 'EÅŸzamanlÄ± TMZ 75 mg/mÂ² ve 6 kÃ¼r adjuvan TMZ.'
            : isOligo
              ? 'RT sonrasÄ± adjuvan PCV (Prokarbazin, Lomustin, Vinkristin) - RTOG 9402 / EORTC 26951.'
              : isAstro
                ? 'IDH-mutant astrositomda yÃ¼ksek risk Ã¶zelliklerinde adjuvan TMZ; Grade 2 dÃ¼ÅŸÃ¼k riskte izlem seÃ§eneÄŸi.'
                : highRisk
                  ? 'PCV veya TMZ; molekÃ¼ler sÄ±nÄ±flamaya gÃ¶re nÃ¶ro-onkoloji kararÄ±.'
                  : undefined,
          evidence: 'NCCN CNS; RTOG 9802; RTOG 9402; EORTC 26951; EORTC 22033; Stupp',
        };
        return { statusText: highRisk ? 'YÃœKSEK RÄ°SKLÄ° GLÄ°OM: ESKALASYON PROTOKOLÃœ' : 'DÃœÅÃœK RÄ°SKLÄ° GLÄ°OM: Ä°ZLEM / FOKAL RT', badgeClass: highRisk ? 'bg-rose-50 text-rose-800 border-rose-300' : 'bg-emerald-50 text-emerald-800 border-emerald-300', primaryScheme: glioma, alternativeSchemes: [glioma] };
      }
      if (cnsSubtype === 'gbm') {
        const isElderly = gbmPerformance === 'Duskun_Yasli';
        const stupp: DoseScheme = {
          id: isElderly ? 'gbm-elderly-40' : 'gbm-stupp-60',
          name: isElderly ? '40.05 Gy / 15 fx + EÅŸzamanlÄ± TMZ (Perry Rejimi)' : '60 Gy / 30 fx + EÅŸzamanlÄ± ve Adjuvan TMZ (Stupp ProtokolÃ¼)',
          tag: isElderly ? 'ğŸ‘´ YaÅŸlÄ±/DÃ¼ÅŸkÃ¼n Hipofraksiyonasyon' : 'âš¡ Stupp AltÄ±n Standart',
          totalDoseGy: isElderly ? 40.05 : 60,
          fractionCount: isElderly ? 15 : 30,
          fractionDoseGy: isElderly ? 2.67 : 2.0,
          alphaBeta: 10,
          technique: '3D-CRT / VMAT + GÃ¼nlÃ¼k Temozolomid',
          indication: isElderly
            ? 'â‰¥65-70 yaÅŸ veya ECOG â‰¥2 olgularda 3 haftalÄ±k hipofraksiyone KRT: YaÅŸam kalitesini korur ve genel saÄŸkalÄ±mÄ± uzatÄ±r (Perry et al. NEJM 2017).'
            : 'Maksimal gÃ¼venli cerrahi sonrasÄ± Glioblastom altÄ±n standardÄ±. Radyoterapi ile eÅŸzamanlÄ± gÃ¼nlÃ¼k TMZ (75 mg/m2), ardÄ±ndan 6 kÃ¼r adjuvan TMZ (150-200 mg/m2).',
          targetVolumes: [
            { name: 'GTV', doseGy: isElderly ? 40.05 : 60, marginMm: '0 mm', anatomical: 'T1 kontrastlÄ± rezidÃ¼ ve cerrahi kavite' },
            { name: 'CTV', doseGy: isElderly ? 40.05 : 60, marginMm: 'GTV + 15-20 mm', anatomical: 'Anatomik bariyerlere saygÄ±lÄ± mikroskobik pay' },
            { name: 'PTV', doseGy: isElderly ? 40.05 : 60, marginMm: 'CTV + 3-5 mm', anatomical: 'Set-up gÃ¼venlik zarfÄ±' },
          ],
          oars: [
            { organ: 'Optik Kiazma', metric: 'Dmax', limit: '< 54 Gy', source: 'QUANTEC' },
            { organ: 'Beyin SapÄ±', metric: 'Dmax', limit: '< 54 Gy', source: 'QUANTEC' },
            { organ: 'GÃ¶z Lensleri', metric: 'Dmax', limit: '< 7 Gy', source: 'QUANTEC' },
          ],
          systemicTherapy: 'EÅŸzamanlÄ± gÃ¼nlÃ¼k Temozolomid (75 mg/m2) ardÄ±ndan 6 kÃ¼r Adjuvan TMZ.',
          evidence: 'Stupp et al. (NEJM 2005), Perry et al. (NEJM 2017), NCCN v1.2025 CNS',
        };
        return {
          statusText: isElderly
            ? 'ENDÄ°KE: YAÅLI/DÃœÅKÃœN HASTADA HÄ°POFRAKSÄ°YONE KRT (PERRY REJÄ°MÄ°)'
            : 'ENDÄ°KE: DEFÄ°NÄ°TÄ°F KEMORADYOTERAPÄ° + TMZ (STUPP PROTOKOLÃœ)',
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
          name: useSrs ? '12-14 Gy / 1 fx (WHO Grade 1 STR, uygun kÃ¼Ã§Ã¼k hedefte SRS)' : isGrade1 ? '54 Gy / 30 fx (WHO Grade 1 Menenjiyom)' : '60 Gy / 30 fx (Grade 2/3 Adjuvan RT)',
          tag: isGrade1 ? useSrs ? 'Grade 1 STR - SRS' : 'Grade 1 Konformal RT' : 'Grade 2/3 - RTOG 0539',
          totalDoseGy: meningiomaDose,
          fractionCount: useSrs ? 1 : isGrade1 ? 30 : 30,
          fractionDoseGy: useSrs ? meningiomaDose : isGrade1 ? 1.8 : 2.0,
          alphaBeta: 3.5,
          technique: useSrs ? 'Stereotaktik radyocerrahi; kritik organ dozlarÄ± uygunsa' : 'IMRT / VMAT',
          indication: isGrade1
            ? isSubtotalGrade1
              ? 'WHO Grade 1 subtotal rezeksiyon / Simpson IV-V sonrasÄ± kÃ¼Ã§Ã¼k ve uygun rezidÃ¼de SRS 12-14 Gy; bÃ¼yÃ¼k veya kritik organ komÅŸuluÄŸunda fraksiyone RT deÄŸerlendirilir.'
              : 'WHO Grade 1 tam rezeksiyon sonrasÄ± izlem; rezidÃ¼, semptom, hacim ve kritik organ iliÅŸkisine gÃ¶re 54 Gy fraksiyone RT dÃ¼ÅŸÃ¼nÃ¼lebilir.'
            : 'WHO Grade 2/3 menenjiyomda rezeksiyon derecesi ve patolojiye gÃ¶re adjuvan fraksiyone RT (Grade 2/3 iÃ§in yaklaÅŸÄ±k 60 Gy) deÄŸerlendirilir.',
          targetVolumes: [
            { name: 'GTV', doseGy: meningiomaDose, marginMm: '0 mm', anatomical: 'Kontrast tutan dural kuyruk ve rezidÃ¼el kitle' },
            ...(!useSrs ? [{ name: 'CTV', doseGy: meningiomaDose, marginMm: 'GTV + 5-10 mm dural kuyruk', anatomical: 'Dural yaprak boyunca infiltrasyon' }] : []),
          ],
          oars: [
            { organ: 'Optik Sinir / Kiazma', metric: 'Dmax', limit: '< 54 Gy', source: 'QUANTEC' },
            { organ: 'Beyin SapÄ±', metric: 'Dmax', limit: '< 54 Gy', source: 'QUANTEC' },
          ],
          evidence: 'RTOG 0539, EORTC 22042-26042, NCCN CNS Guidelines',
        };
        return {
          statusText: 'ENDÄ°KE: MENENJÄ°YOM FRAKSÄ°YONE RT VEYA SRS PROTOKOLÃœ',
          badgeClass: 'bg-emerald-50 text-emerald-800 border-emerald-300',
          primaryScheme: menScheme,
          alternativeSchemes: [menScheme],
        };
      }

      // Beyin MetastazÄ±
      if (cnsMidlineShift === '>=5mm') {
        const emer: DoseScheme = {
          id: 'cns-emer',
          name: 'Acil Dekompresyon + Deksametazon ProtokolÃ¼',
          tag: 'ğŸš¨ ACÄ°L DURUM',
          totalDoseGy: 0,
          fractionCount: 0,
          fractionDoseGy: 0,
          alphaBeta: 10,
          technique: 'Medikal Acil GiriÅŸim',
          indication: 'Orta hat ÅŸifti â‰¥5 mm herniasyon riskini gÃ¶sterir. ACÄ°L IV Deksametazon baÅŸlanmalÄ±, NÃ¶roÅŸirÃ¼rji ile acil cerrahi dekompresyon tartÄ±ÅŸÄ±lmalÄ±dÄ±r.',
          targetVolumes: [],
          oars: [],
          evidence: 'NCCN CNS Emergency Guidelines',
        };
        return {
          statusText: 'ğŸš¨ ACÄ°L UYARI: ORTA HAT ÅÄ°FTÄ° â‰¥5 MM (HERNÄ°ASYON RÄ°SKÄ°)',
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
          indication: `${isPostoperativeCavity ? '1-4 odak iÃ§in rezeksiyon sonrasÄ± cerrahi kaviteye SRS; ' : '1-4 odakta tek baÅŸÄ±na SRS; '}hasta performansÄ± (KPS ${cnsKps}) ve sistemik hastalÄ±k kontrolÃ¼yle birlikte deÄŸerlendirilir. ${cnsSymptoms === 'Semptomatik' ? 'Semptomatik kitle etkisi iÃ§in steroid ve cerrahi deÄŸerlendirmesi de gerekir.' : 'Asemptomatik durumda yakÄ±n nÃ¶rolojik ve gÃ¶rÃ¼ntÃ¼leme izlemi gerekir.'}`,
          targetVolumes: [
            { name: 'GTV_Met', doseGy: srsDose, marginMm: '0 mm', anatomical: 'MR T1 kontrast tutan lezyon' },
            { name: 'PTV_SRS', doseGy: srsDose, marginMm: '1-2 mm', anatomical: 'Sub-milimetrik set-up zarfÄ±' },
          ],
          oars: [
            { organ: 'Beyin SapÄ±', metric: 'Dmax', limit: '< 12 Gy', source: 'HyTEC' },
            { organ: 'Optik Kiazma', metric: 'Dmax', limit: '< 8-10 Gy', source: 'HyTEC' },
          ],
          evidence: 'NCCN v1.2025 Kategori 1, Yamamoto et al. (Lancet Oncol)',
        };
        return {
          statusText: 'ENDÄ°KE: KÃœRATÄ°F STEREOTAKTÄ°K RADYOCERRAHÄ° (SRS / SRT)',
          badgeClass: 'bg-emerald-50 text-emerald-800 border-emerald-300 shadow-[0_0_15px_rgba(16,185,129,0.25)]',
          primaryScheme: srs,
          alternativeSchemes: [srs],
        };
      } else {
        const wbrt: DoseScheme = {
          id: 'cns-wbrt-30',
          name: '30 Gy / 10 fx + HA & Memantin (TÃ¼m Beyin RT)',
          tag: 'ğŸ§  WBRT + HA Standart',
          totalDoseGy: 30,
          fractionCount: 10,
          fractionDoseGy: 3,
          alphaBeta: 10,
          technique: 'Hipokampus Koruyucu VMAT (HA-WBRT) + Memantin',
          indication: '>4 metastaz veya yaygÄ±n leptomeningeal tutulum. Bellek fonksiyonlarÄ±nÄ± korumak iÃ§in hipokampus Dmax <16 Gy tutulmalÄ±dÄ±r.',
          targetVolumes: [
            { name: 'Whole Brain PTV', doseGy: 30, marginMm: 'KafatasÄ±', anatomical: 'Bilateral beyin hemisferleri (Hipokampus alanÄ± hariÃ§)' },
          ],
          oars: [
            { organ: 'Hipokampus Dmax', metric: 'Dmax', limit: '< 16 Gy (D100% < 9 Gy)', source: 'NRG CC001' },
            { organ: 'GÃ¶z Lensleri', metric: 'Dmax', limit: '< 7 Gy', source: 'QUANTEC' },
          ],
          systemicTherapy: 'RT ile eÅŸzamanlÄ± ve 6 ay boyunca Memantin (20 mg/gÃ¼n).',
          evidence: 'NRG Oncology CC001 (JCO 2020), RTOG 0933',
        };
        return {
          statusText: 'ENDÄ°KE: HÄ°POKAMPUS KORUYUCU WBRT + MEMANTÄ°N',
          badgeClass: 'bg-emerald-50 text-emerald-800 border-emerald-300',
          primaryScheme: wbrt,
          alternativeSchemes: [wbrt],
        };
      }
    }

    // ------------------------------------------
    // 6. PROSTAT VE GÃœS
    // ------------------------------------------
    if (selectedOrgan === 'prostate') {
      if (gusSubtype === 'bladder') {
        const isSuitableForTmt = bladderTmtSuitable && bladderTurbtComplete && selectedN === 'N0' && selectedM === 'M0';
        const tmt: DoseScheme = {
          id: 'bladder-tmt-648',
          name: '45 Gy Pelvis + TÃ¼mÃ¶r YataÄŸÄ± Boost ile 64.8 Gy',
          tag: 'Mesane Koruyucu Trimodal Tedavi',
          totalDoseGy: 64.8,
          fractionCount: 36,
          fractionDoseGy: 1.8,
          alphaBeta: 10,
          technique: 'Maksimal TURBT sonrasÄ± gÃ¶rÃ¼ntÃ¼ kÄ±lavuzlu IMRT / VMAT',
          indication: isSuitableForTmt
            ? 'SeÃ§ilmiÅŸ cT2-T4a N0 M0 kas-invaziv mesane kanserinde maksimal TURBT sonrasÄ± eÅŸzamanlÄ± kemoradyoterapi; sistoskopik yanÄ±t deÄŸerlendirmesi ve kurtarma sistektomisi planÄ± gerektirir.'
            : 'TMT iÃ§in uygunluk, N0M0 durum ve maksimal TURBT yapÄ±labilirliÄŸi aÃ§Ä±sÄ±ndan doÄŸrulanmalÄ±dÄ±r; mevcut seÃ§imler uygunluk koÅŸullarÄ±nÄ± karÅŸÄ±lamÄ±yor.',
          targetVolumes: [
            { name: 'Pelvik nodal CTV', doseGy: 45, marginMm: 'Anatomik', anatomical: 'Pelvik lenfatikler ve mesane Ã§evresi' },
            { name: 'Mesane / tÃ¼mÃ¶r yataÄŸÄ±', doseGy: 64.8, marginMm: 'Mesane duvarÄ± ve yatak', anatomical: 'GÃ¶rÃ¼ntÃ¼leme ve TURBT bulgularÄ±na gÃ¶re boost' },
          ],
          oars: [
            { organ: 'Rektum', metric: 'V50Gy', limit: 'Planlama protokolÃ¼yle sÄ±nÄ±rlandÄ±r', source: 'QUANTEC / IGRT' },
            { organ: 'Pelvic bowel', metric: 'Protocol- and contour-specific DVH', limit: 'Minimize dose; follow the selected bladder-preservation protocol', source: 'BC2001 / site-specific protocol', context: 'Do not interpret as a QUANTEC V45 threshold for individual bowel loops.', contextEn: 'Do not interpret as a QUANTEC V45 threshold for individual bowel loops.', classification: 'context-note' },
          ],
          systemicTherapy: 'EÅŸzamanlÄ± Sisplatin veya 5-FU / Mitomisin-C; maksimal TURBT ve yakÄ±n sistoskopik izlem.',
          evidence: 'NCCN Bladder Cancer v1.2025; BC2001; RTOG trimodal therapy protocols',
        };
        return {
          statusText: isSuitableForTmt ? 'ENDÄ°KE: UYGUN HASTADA MESANE KORUYUCU TRÄ°MODAL TEDAVÄ°' : 'UYARI: MESANE KORUYUCU TMT UYGUNLUÄUNU DOÄRULAYIN',
          badgeClass: isSuitableForTmt ? 'bg-emerald-50 text-emerald-800 border-emerald-300' : 'bg-amber-50 text-amber-800 border-amber-300',
          primaryScheme: tmt,
          alternativeSchemes: [tmt],
        };
      }

      if (gusSubtype === 'testis') {
        if (testisHistology === 'nonseminoma') {
          const nonSeminoma: DoseScheme = {
            id: 'testis-nonseminoma-no-rt',
            name: 'Radyoterapi Ã–nerilmez (Kemoterapi / RPLND / Ä°zlem)',
            tag: 'âš ï¸ Non-Seminom',
            totalDoseGy: 0,
            fractionCount: 0,
            fractionDoseGy: 0,
            alphaBeta: 10,
            technique: 'Radyoterapi endike deÄŸil',
            indication: 'Non-seminom germ hÃ¼creli tÃ¼mÃ¶rlerde adjuvan radyoterapi Ã¶nerilmez; evreye gÃ¶re aktif izlem, BEP kemoterapi veya RPLND standart yaklaÅŸÄ±mdÄ±r. RadyoduyarlÄ±lÄ±k seminoma gÃ¶re belirgin dÃ¼ÅŸÃ¼ktÃ¼r.',
            targetVolumes: [],
            oars: [],
            systemicTherapy: 'Evre ve risk durumuna gÃ¶re BEP kemoterapi veya RPLND; multidisipliner Ã¼ro-onkoloji konseyi kararÄ±.',
            evidence: 'NCCN Testicular Cancer v1.2025; EAU Guidelines',
          };
          return {
            statusText: 'ENDÄ°KE DEÄÄ°LDÄ°R: NON-SEMÄ°NOMDA RT Ã–NERÄ°LMEZ (KEMOTERAPÄ° / RPLND / Ä°ZLEM)',
            badgeClass: 'bg-amber-950/40 text-amber-300 border-amber-500/40',
            primaryScheme: nonSeminoma,
            alternativeSchemes: [nonSeminoma],
          };
        }
        const testisStage = selectedT === 'I' ? 'I' : selectedT === 'IIB' ? 'IIB' : 'IIA';
        const isStageI = testisStage === 'I';
        const stageIIDoseGy = testisStage === 'IIB' ? 36 : 30;
        const stageIIFractions = testisStage === 'IIB' ? 18 : 15;
        const testisRt: DoseScheme = {
          id: isStageI ? 'seminoma-stage-i-20' : `seminoma-stage-${testisStage.toLowerCase()}-${stageIIDoseGy}`,
          name: isStageI ? '20 Gy / 10 fx (Adjuvan Paraaortik RT)' : `${stageIIDoseGy} Gy / ${stageIIFractions} fx (Paraaortik + Ä°psilateral Ä°liak RT)`,
          tag: isStageI ? 'Evre I Seminom' : `Evre ${testisStage} Seminom`,
          totalDoseGy: isStageI ? 20 : stageIIDoseGy,
          fractionCount: isStageI ? 10 : stageIIFractions,
          fractionDoseGy: 2,
          alphaBeta: 10,
          technique: 'IMRT / VMAT; bÃ¶brek ve karÅŸÄ± testis dozunu en aza indir',
          indication: isStageI
            ? 'Evre I seminomda aktif izlem sÄ±klÄ±kla tercih edilir; RT, bilgilendirilmiÅŸ seÃ§ilmiÅŸ hastalarda adjuvan seÃ§enek olarak deÄŸerlendirilir.'
            : 'Evre IIA/B seminomda paraaortik ve ipsilateral iliak lenfatiklere RT, evre ve nodal hacme gÃ¶re bireyselleÅŸtirilir.',
          targetVolumes: [{ name: 'Paraaortik Â± ipsilateral iliak', doseGy: isStageI ? 20 : stageIIDoseGy, marginMm: 'Anatomik nodal alan', anatomical: isStageI ? 'Paraaortik lenfatikler' : 'Paraaortik ve ipsilateral iliak lenfatikler' }],
          oars: [
            { organ: 'KarÅŸÄ± testis', metric: 'Dmean', limit: 'MÃ¼mkÃ¼n olan en dÃ¼ÅŸÃ¼k doz', source: 'NCCN / ESTRO' },
            { organ: 'BÃ¶brekler', metric: 'Dmean', limit: 'MÃ¼mkÃ¼n olan en dÃ¼ÅŸÃ¼k doz', source: 'QUANTEC' },
          ],
          evidence: 'NCCN Testicular Cancer v1.2025; EAU Guidelines',
        };
        return {
          statusText: isStageI ? 'SEÃ‡ENEK: EVRE I SEMÄ°NOMDA AKTÄ°F Ä°ZLEM VEYA SEÃ‡Ä°LMÄ°Å HASTADA ADJUVAN RT' : 'ENDÄ°KE: EVRE II SEMÄ°NOMDA EVREYE GÃ–RE NODAL RT',
          badgeClass: 'bg-emerald-50 text-emerald-800 border-emerald-300',
          primaryScheme: testisRt,
          alternativeSchemes: [testisRt],
        };
      }

      if (gusSubtype === 'penile') {
        const organPreservation = (selectedT === 'T1' || selectedT === 'T2') && selectedN === 'N0';
        const penileRt: DoseScheme = {
          id: organPreservation ? 'penile-organ-preservation-60' : 'penile-nodal-66',
          name: organPreservation ? '60-66 Gy (Organ Koruyucu Brakiterapi / EBRT)' : '60-66 Gy Primer + Ä°nguinal / Pelvik Nodal RT',
          tag: organPreservation ? 'Organ Koruyucu YaklaÅŸÄ±m' : 'Lokal Ä°leri / Nodal Pozitif',
          totalDoseGy: 60,
          fractionCount: 30,
          fractionDoseGy: 2,
          alphaBeta: 10,
          technique: 'SeÃ§ilmiÅŸ olguda interstisyel brakiterapi veya IMRT / VMAT',
          indication: organPreservation
            ? 'SeÃ§ilmiÅŸ T1-T2 penis kanserinde organ koruma amacÄ±yla brakiterapi veya EBRT multidisipliner deÄŸerlendirmeyle dÃ¼ÅŸÃ¼nÃ¼lebilir.'
            : 'T3-T4 primer veya N+ hastalÄ±kta primer yataÄŸa ve klinik risk durumuna gÃ¶re inguinal / pelvik lenfatiklere RT deÄŸerlendirilir.',
          targetVolumes: [{ name: 'Primer yatak', doseGy: 60, marginMm: 'Anatomik', anatomical: organPreservation ? 'Primer penis lezyonu' : 'Primer yatak ve klinik olarak endike inguinal / pelvik nodlar' }],
          oars: [{ organ: 'Ãœretra / cilt', metric: 'Dmean', limit: 'Organ koruma ve toksisite hedefleriyle optimize et', source: 'ESTRO / NCCN' }],
          evidence: 'NCCN Penile Cancer v1.2025; EAU Guidelines',
        };
        return {
          statusText: organPreservation ? 'SEÃ‡ENEK: ERKEN EVREDE ORGAN KORUYUCU TEDAVÄ° DEÄERLENDÄ°R' : 'ENDÄ°KE: LOKAL Ä°LERÄ° / NODAL RÄ°SKTE MULTÄ°DÄ°SÄ°PLÄ°NER RT DEÄERLENDÄ°RMESÄ°',
          badgeClass: 'bg-emerald-50 text-emerald-800 border-emerald-300',
          primaryScheme: penileRt,
          alternativeSchemes: [penileRt],
        };
      }

      if (gusSubtype === 'kidney') {
        const primaryRcc = renalDiseaseSetting === 'primary-inoperable';
        const renalDiameterCm = Number.parseFloat(renalTumorSizeCm);
        const sizeBasedFractionation = !Number.isFinite(renalDiameterCm) || renalDiameterCm <= 0
          ? 'ineligible'
          : renalDiameterCm <= 4
            ? 'single'
            : renalDiameterCm <= 10
              ? 'three'
              : 'ineligible';
        if (primaryRcc && sizeBasedFractionation === 'ineligible') {
          const notApplicable: DoseScheme = {
            id: 'rcc-primary-outside-fastrack-size',
            name: lang === 'tr' ? 'FASTRACK II uygunluÄŸu iÃ§in primer bÃ¶brek tÃ¼mÃ¶rÃ¼ â‰¤10 cm olmalÄ±; evre ve protokolÃ¼ gÃ¶zden geÃ§irin' : 'FASTRACK II eligibility requires a renal primary â‰¤10 cm; review stage and local protocol',
            tag: lang === 'tr' ? 'SABR uygunluk deÄŸerlendirmesi' : 'SABR eligibility review',
            totalDoseGy: 0,
            fractionCount: 0,
            fractionDoseGy: 0,
            alphaBeta: 10,
            technique: lang === 'tr' ? 'Multidisipliner deÄŸerlendirme' : 'Multidisciplinary assessment',
            indication: lang === 'tr'
              ? 'FASTRACK II iÃ§in tÃ¼mÃ¶r Ã§apÄ± â‰¤10 cm olmalÄ±dÄ±r. Ã‡apÄ± ve renal ven/perirenal yayÄ±lÄ±mÄ± doÄŸrulayÄ±n; uygunluk, performans durumu ve gÃ¼ncel renal SBRT protokolÃ¼ multidisipliner deÄŸerlendirilmelidir.'
              : 'FASTRACK II requires a tumour diameter â‰¤10 cm. Verify diameter and renal vein/perirenal extension; eligibility, fitness and the current renal SBRT protocol require multidisciplinary review.',
            targetVolumes: [],
            oars: [],
            evidence: 'FASTRACK II (Lancet Oncol 2024), DOI: 10.1016/S1470-2045(24)00020-2; eviQ protocol 4381',
          };
          return { statusText: lang === 'tr' ? 'DEÄERLENDÄ°RÄ°N: RCC EVRESÄ° FASTRACK II BASÄ°T T1 DOZ SEÃ‡Ä°MÄ° DIÅINDA' : 'REVIEW: SELECTED RCC EXTENT OUTSIDE SIMPLE T1 FASTRACK II DOSE SELECTION', badgeClass: 'bg-amber-50 text-amber-800 border-amber-300', primaryScheme: notApplicable, alternativeSchemes: [notApplicable] };
        }
        const doseGy = primaryRcc ? sizeBasedFractionation === 'single' ? 26 : 42 : 35;
        const fractions = primaryRcc ? sizeBasedFractionation === 'single' ? 1 : 3 : 5;
        const scheme: DoseScheme = {
          id: primaryRcc ? sizeBasedFractionation === 'single' ? 'rcc-primary-26-1' : 'rcc-primary-42-3' : 'rcc-oligometastatic-35-5',
          name: lang === 'tr'
            ? `${doseGy} Gy / ${fractions} fx (${primaryRcc ? 'primer renal SABR' : 'renal oligometastatik / oligoprogresif SBRT'})`
            : `${doseGy} Gy / ${fractions} fx (${primaryRcc ? 'primary renal SABR' : 'renal oligometastatic / oligoprogressive SBRT'})`,
          tag: primaryRcc ? 'FASTRACK II Â· SABR' : lang === 'tr' ? 'Oligometastatik SBRT' : 'Oligometastatic SBRT',
          totalDoseGy: doseGy,
          fractionCount: fractions,
          fractionDoseGy: doseGy / fractions,
          alphaBeta: 10,
          technique: lang === 'tr' ? 'Solunum hareketi yÃ¶netimi ve gÃ¶rÃ¼ntÃ¼ kÄ±lavuzlu SABR; OAR yakÄ±nlÄ±ÄŸÄ±na gÃ¶re uyarlayÄ±n' : 'Image-guided SABR with respiratory motion management; adapt to OAR proximity',
          indication: primaryRcc
            ? lang === 'tr'
              ? `Biyopsiyle doÄŸrulanmÄ±ÅŸ, medikal olarak inoperabl veya cerrahi riski yÃ¼ksek primer RCC (${renalDiameterCm <= 4 ? 'â‰¤4 cm' : '>4â€“10 cm'}). FASTRACK II, â‰¤4 cm tÃ¼mÃ¶rlerde 26 Gy Ã— 1 ve >4â€“10 cm tÃ¼mÃ¶rlerde 42 Gy / 3 fx kullandÄ±. SeÃ§ilen Ã§apÄ± (${renalDiameterCm} cm), eGFR'yi ve uygunluÄŸu doÄŸrulayÄ±n.`
              : `Biopsy-confirmed, medically inoperable or high-surgical-risk primary RCC (${renalDiameterCm <= 4 ? 'â‰¤4 cm' : '>4â€“10 cm'}). FASTRACK II delivered 26 Gy x1 for tumours â‰¤4 cm and 42 Gy in 3 fx for tumours >4â€“10 cm. Verify the selected diameter (${renalDiameterCm} cm), eGFR and eligibility.`
            : lang === 'tr'
              ? 'Konsey deÄŸerlendirmesi sonrasÄ± seÃ§ilmiÅŸ oligometastatik hastalÄ±k veya immÃ¼noterapi altÄ±nda oligoprogresyon iÃ§in Ã¶rnek 35 Gy / 5 fx. Primer RCCâ€™de FASTRACK II ÅŸemasÄ± deÄŸildir.'
              : 'Example 35 Gy / 5 fx for selected oligometastatic disease or oligoprogression during immunotherapy after MDT review. Not a primary RCC FASTRACK II regimen.',
          targetVolumes: [{ name: 'GTV_Renal', doseGy, marginMm: lang === 'tr' ? 'GÃ¼ncel protokole gÃ¶re hareket ve set-up marjini' : 'Motion and setup margin per current protocol', anatomical: lang === 'tr' ? 'Primer renal lezyon veya seÃ§ilmiÅŸ oligometastatik hedef' : 'Renal primary or selected oligometastatic target' }],
          oars: [],
          evidence: primaryRcc
            ? 'FASTRACK II, Siva et al. Lancet Oncol 2024; DOI: 10.1016/S1470-2045(24)00020-2; eviQ renal SABR protocol 4381'
            : 'Current disease-site SBRT protocol and multidisciplinary review; do not extrapolate FASTRACK II primary RCC limits',
        };
        return {
          statusText: primaryRcc
            ? lang === 'tr' ? 'SEÃ‡ENEK: SEÃ‡Ä°LMÄ°Å MEDÄ°KAL Ä°NOPERABL PRÄ°MER RCCâ€™DE SABR' : 'OPTION: SABR FOR SELECTED MEDICALLY INOPERABLE PRIMARY RCC'
            : lang === 'tr' ? 'SEÃ‡ENEK: SEÃ‡Ä°LMÄ°Å RCC OLÄ°GOMETASTAZI / OLÄ°GOPROGRESYONUNDA SBRT' : 'OPTION: SBRT FOR SELECTED RCC OLIGOMETASTASIS / OLIGOPROGRESSION',
          badgeClass: 'bg-emerald-50 text-emerald-800 border-emerald-300',
          primaryScheme: scheme,
          alternativeSchemes: primaryRcc && sizeBasedFractionation === 'single'
            ? [scheme, { ...scheme, id: 'rcc-primary-42-3', name: lang === 'tr' ? '42 Gy / 3 fx (FASTRACK II; tÃ¼mÃ¶r >4â€“10 cm)' : '42 Gy / 3 fx (FASTRACK II; tumour >4â€“10 cm)', totalDoseGy: 42, fractionCount: 3, fractionDoseGy: 14 }]
            : [scheme],
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
          ? 'Ã‡ok YÃ¼ksek'
          : isHighRisk
            ? 'YÃ¼ksek'
            : isIntermediateRisk
              ? isUnfavorableIntermediate ? 'Orta-Unfavorable' : 'Orta-Favorable'
              : 'DÃ¼ÅŸÃ¼k';

      if (isNodePositive) {
        const pelvicStampede: DoseScheme = {
          id: 'pros-stampede',
          name: '78 Gy Prostat + 46-50 Gy Pelvik LN + 2-3 YÄ±l ADT',
          tag: 'âš¡ STAMPEDE StandardÄ±',
          totalDoseGy: 78,
          fractionCount: 39,
          fractionDoseGy: 2,
          alphaBeta: 1.5,
          technique: 'IMRT / VMAT (Elektif Pelvik Lenf Nodu IÅŸÄ±nlamasÄ± Dahil)',
          indication: 'Ã‡ok YÃ¼ksek Riskli veya N1 Prostat Ca: Prostat ve seminal vezikÃ¼llerle birlikte pelvik lenfatik drenaj alanlarÄ±nÄ±n Ä±ÅŸÄ±nlanmasÄ± ve 24-36 ay uzun dÃ¶nem ADT genel saÄŸkalÄ±mÄ± belirgin uzatÄ±r.',
          targetVolumes: [
            { name: 'PTV_Prostat_High', doseGy: 78, marginMm: '5-7 mm', anatomical: 'Prostat bezi ve seminal vezikÃ¼l tabanÄ±' },
            { name: 'PTV_Pelvik_LN', doseGy: 46, marginMm: '7 mm', anatomical: 'Bilateral obturator, eksternal iliak, internal iliak nod zinciri' },
          ],
          oars: [
            { organ: 'Rektum V70', metric: 'V70Gy', limit: '< 15%', source: 'QUANTEC' },
            { organ: 'Rektum V50', metric: 'V50Gy', limit: '< 35%', source: 'STAMPEDE' },
            { organ: 'Mesane V70', metric: 'V70Gy', limit: '< 25%', source: 'QUANTEC' },
          ],
          systemicTherapy: '24-36 ay LHRH agonisti/antagonisti + N1 ise Abirateron eklenmesi Ã¶nerilir.',
          evidence: 'STAMPEDE Trial, POP-RT Trial, RTOG 0521',
        };
        return {
          statusText: 'ENDÄ°KE: YÃœKSEK RÄ°SK / N1 PROSTAT PELVÄ°K RT + UZUN ADT',
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
          indication: `${prostateRiskGroup} riskli lokalize prostat kanserinde doz eskalasyonu ve uzun dÃ¶nem hormonoterapi multidisipliner olarak deÄŸerlendirilir.`,
          targetVolumes: [
            { name: 'PTV_Prostate_SV', doseGy: 78, marginMm: '5 mm', anatomical: 'Prostat ve seminal vezikÃ¼ller' },
            { name: 'PTV_Pelvic_LN', doseGy: 46, marginMm: '7 mm', anatomical: 'Risk temelli elektif pelvik lenfatik alanlar' },
          ],
          oars: [
            { organ: 'Rektum V70', metric: 'V70Gy', limit: '< 15%', source: 'RTOG 0415' },
            { organ: 'Mesane V70', metric: 'V70Gy', limit: '< 25%', source: 'RTOG 0415' },
          ],
          systemicTherapy: '18-36 ay androjen deprivasyon tedavisi (ADT); elektif pelvik nodal RT (46-50 Gy) risk ve nodal deÄŸerlendirmeyle planlanÄ±r.',
          evidence: 'DART01/05, EORTC 22961',
        };
        return {
          statusText: 'ENDÄ°KE: YÃœKSEK RÄ°SK PROSTAT ESKALE RT + 2 YIL ADT',
          badgeClass: 'bg-emerald-50 text-emerald-800 border-emerald-300',
          primaryScheme: highPros,
          alternativeSchemes: [highPros],
        };
      }

      const isLowRisk = !isIntermediateRisk;
      const lowRiskSurveillance: DoseScheme = {
        id: 'pros-active-surveillance',
        name: 'Aktif Ä°zlem (RT ertelenebilir)',
        tag: 'DÃ¼ÅŸÃ¼k Risk SeÃ§eneÄŸi',
        totalDoseGy: 0,
        fractionCount: 0,
        fractionDoseGy: 0,
        alphaBeta: 1.5,
        technique: 'PSA, MR ve protokol dahilinde tekrar biyopsi ile yakÄ±n izlem',
        indication: 'DÃ¼ÅŸÃ¼k riskli hastalÄ±kta uygun hastalar iÃ§in aktif izlem; tedavi tercihi ortak karar ile belirlenir.',
        targetVolumes: [],
        oars: [],
        evidence: 'NCCN Prostate Cancer v1.2025; AUA/ASTRO Guideline',
      };
      const intPros: DoseScheme = {
        id: 'pros-mod-60',
        name: '60 Gy / 20 fx (IlÄ±mlÄ± Hipofraksiyonasyon CHHiP)',
        tag: 'âš¡ CHHiP Standart',
        totalDoseGy: 60,
        fractionCount: 20,
        fractionDoseGy: 3,
        alphaBeta: 1.5,
        technique: 'IGRT VMAT',
        indication: 'Orta riskli prostat kanserinde 20 fraksiyonluk rejim 39 fraksiyona non-inferiordur (Kategori 1 standart).',
        targetVolumes: [{ name: 'PTV_Prostate', doseGy: 60, marginMm: '5 mm', anatomical: 'Prostat bezi ve seminal vezikÃ¼l proksimal 1 cm' }],
        oars: [{ organ: 'Rektum V57', metric: 'V57Gy', limit: '< 15%', source: 'CHHiP' }],
        systemicTherapy: isUnfavorableIntermediate ? 'Orta-unfavorable riskte 4-6 ay kÄ±sa dÃ¶nem ADT; pelvik RT risk temelli deÄŸerlendirilir.' : 'Orta-favorable riskte ADT Ã§oÄŸunlukla Ã¶nerilmez.',
        evidence: 'CHHiP Phase III (Lancet Oncol 2016), PROFIT Trial',
      };
      const sbrtPros: DoseScheme = {
        id: 'pros-sbrt-36',
        name: '36.25 Gy / 5 fx (Ultra-Hipofraksiyonasyon PACE-B)',
        tag: 'ğŸ¯ SBRT PACE-B',
        totalDoseGy: 36.25,
        fractionCount: 5,
        fractionDoseGy: 7.25,
        alphaBeta: 1.5,
        technique: 'SBRT (FidÃ¼syel / MR KÄ±lavuzluÄŸunda)',
        indication: 'DÃ¼ÅŸÃ¼k ve uygun orta risk olgularda 5 fraksiyonda kÃ¼ratif tedavi.',
        targetVolumes: [
          { name: 'GTV_Prostate', doseGy: 36.25, marginMm: '0 mm', anatomical: 'Prostat bezi; varsa dominant intraprostatik lezyon (DIL) / nodÃ¼l boostu' },
          { name: 'CTV_Prostate', doseGy: 36.25, marginMm: 'Anatomik', anatomical: 'Prostat Â± seminal vezikÃ¼ller, risk uyarlamalÄ±' },
          { name: 'PTV_Prostate', doseGy: 36.25, marginMm: 'CTV->PTV +4-5 mm; posterior +3 mm with SpaceOAR', anatomical: 'GÃ¼nlÃ¼k IGRT ve prostat hareket gÃ¼venlik marjini' },
        ],
        oars: [{ organ: 'Rektum V36Gy', metric: 'V36Gy', limit: '< 1 cc', source: 'PACE-B' }],
        evidence: 'PACE-B Trial (NEJM 2024)',
      };
      return {
        statusText: isLowRisk
          ? 'DÃœÅÃœK RÄ°SK: AKTÄ°F Ä°ZLEM VEYA HASTA TERCÄ°HÄ°NE GÃ–RE KÃœRATÄ°F RT'
          : `${prostateRiskGroup.toUpperCase()}: ${isUnfavorableIntermediate ? 'KISA DÃ–NEM ADT DEÄERLENDÄ°R' : 'ADT GENELLÄ°KLE GEREKMEZ'}`,
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
          name: '26 Gy / 5 fx (DCIS TÃ¼m Meme RT) Â± TÃ¼mÃ¶r YataÄŸÄ± Boost',
          tag: 'DCIS - Aksiller RT / Kemoterapi Yok',
          totalDoseGy: 26,
          fractionCount: 5,
          fractionDoseGy: 5.2,
          alphaBeta: 4,
          technique: '3D-CRT / VMAT; sol taraflÄ± olguda kalp korumasÄ±',
          indication: 'MKC sonrasÄ± DCIS iÃ§in tÃ¼m meme Ä±ÅŸÄ±nlamasÄ± lokal nÃ¼ksÃ¼ azaltÄ±r; boost, yaÅŸ, derece, marjin ve nÃ¼ks riskine gÃ¶re deÄŸerlendirilir. Aksiller RT ve sistemik kemoterapi Ã¶nerilmez.',
          targetVolumes: [
            { name: 'CTV_WholeBreast', doseGy: 26, marginMm: 'Cilt altÄ± 5 mm', anatomical: 'TÃ¼m meme; nodal alanlar rutin olarak dahil edilmez' },
            ...(breastBoost ? [{ name: 'Tumor bed boost', doseGy: 10, marginMm: 'Kavite + cerrahi klips', anatomical: 'Uygun risk Ã¶zelliklerinde 10-16 Gy ek boost' }] : []),
          ],
          oars: [
            { organ: 'Kalp (sol taraf)', metric: 'Dmean', limit: 'MÃ¼mkÃ¼n olan en dÃ¼ÅŸÃ¼k doz', source: 'QUANTEC / FAST-Forward' },
            { organ: 'Ä°psilateral akciÄŸer', metric: 'V8Gy', limit: '< 15%', source: 'FAST-Forward' },
          ],
          evidence: 'NCCN Breast Cancer v1.2025; ASTRO Whole Breast Irradiation Guideline',
        };
        return {
          statusText: 'ENDÄ°KE: MKC SONRASI DCIS TÃœM MEME RT; NODAL RT VE KEMOTERAPÄ° YOK',
          badgeClass: 'bg-emerald-50 text-emerald-800 border-emerald-300',
          primaryScheme: dcisWbi,
          alternativeSchemes: [
            dcisWbi,
            {
              ...dcisWbi,
              id: 'br-dcis-wbi-40-15',
              name: '40.05 Gy / 15 fx (DCIS TÃ¼m Meme RT, START-B) Â± Boost',
              totalDoseGy: 40.05,
              fractionCount: 15,
              fractionDoseGy: 2.67,
              targetVolumes: dcisWbi.targetVolumes.map(volume => ({ ...volume, doseGy: volume.name === 'Tumor bed boost' ? volume.doseGy : 40.05 })),
            },
          ],
        };
      }

      if (breastHistology === 'Malign Filloides TÃ¼mÃ¶rÃ¼') {
        const marginCm = parseFloat(phyllodesMarginCm) || 0;
        const observe = marginCm >= 1 && !phyllodesHighGrade;
        const phyllodes: DoseScheme = {
          id: observe ? 'phyllodes-observation' : 'phyllodes-adjuvant-56',
          name: observe ? 'RT Gerekmez - Cerrahi SonrasÄ± Ä°zlem' : '50-60 Gy / 25-30 fx (Adjuvan Yatak RT)',
          tag: observe ? 'â‰¥1 cm Marjin - Ä°zlem' : 'YakÄ±n/Pozitif Marjin veya YÃ¼ksek Derece',
          totalDoseGy: observe ? 0 : 56,
          fractionCount: observe ? 0 : 28,
          fractionDoseGy: observe ? 0 : 2,
          alphaBeta: 4,
          technique: observe ? 'Klinik ve radyolojik izlem' : 'Meme yataÄŸÄ±na IMRT / VMAT',
          indication: observe
            ? 'Cerrahi marjin â‰¥1 cm ve yÃ¼ksek dereceli stromal Ã¶zellik yoksa izlem tercih edilir.'
            : 'Marjin <1 cm veya yÃ¼ksek dereceli stromal aÅŸÄ±rÄ± bÃ¼yÃ¼mede lokal nÃ¼ks riskini azaltmak iÃ§in adjuvan meme yataÄŸÄ± RT deÄŸerlendirilir; elektif aksiller nodal RT uygulanmaz.',
          targetVolumes: observe ? [] : [{ name: 'CTV_TumorBed', doseGy: 56, marginMm: 'Cerrahi yatak ve klipsler', anatomical: 'Meme yataÄŸÄ±; elektif aksilla dahil edilmez' }],
          oars: observe ? [] : [{ organ: 'Kalp (sol taraf)', metric: 'Dmean', limit: 'MÃ¼mkÃ¼n olan en dÃ¼ÅŸÃ¼k doz', source: 'QUANTEC' }, { organ: 'Ä°psilateral akciÄŸer', metric: 'V20Gy', limit: '< 15%', source: 'QUANTEC' }],
          evidence: 'NCCN Breast Cancer v1.2025; ASTRO soft tissue sarcoma guidance',
        };
        return {
          statusText: observe ? 'RT GEREKMEZ: MARJÄ°N â‰¥1 CM VE YÃœKSEK DERECELÄ° Ã–ZELLÄ°K YOK - Ä°ZLEM' : 'DEÄERLENDÄ°R: YAKIN/POZÄ°TÄ°F MARJÄ°N VEYA YÃœKSEK DERECELÄ° FÄ°LLOÄ°DES',
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
        ? `${selectedT === 'T1c' ? 'TÃ¼mÃ¶r Ã§apÄ± >1 cm (T1c); ' : ''}${highKi67 ? 'Ki-67 â‰¥20%; ' : ''}${gradeThree ? 'Grade 3; ' : ''}Genomik risk skoruna gÃ¶re adjuvan KT / anti-HER2 endikasyonu tartÄ±ÅŸÄ±lsÄ±n.`
        : '';
      const boostRiskNote = elevatedBreastRisk
        ? 'TÃ¼mÃ¶r yataÄŸÄ± boost (10-16 Gy) endikasyonu klinik risk ve yaÅŸ ile tartÄ±ÅŸÄ±lsÄ±n.'
        : '';

      if (breastHistology === 'Dermatofibrosarkoma Protuberans (DFSP)') {
       const dfsp: DoseScheme = {
         id: 'dfsp-adjuvant-50-60',
         name: '50-60 Gy / 25-30 fx (Adjuvan DFSP RT)',
         tag: 'DFSP - YakÄ±n/Pozitif Marjin',
         totalDoseGy: 56,
         fractionCount: 28,
         fractionDoseGy: 2,
         alphaBeta: 4,
         technique: 'Elektron veya foton RT; geniÅŸ mikroskopik marjin',
         indication: 'GeniÅŸ lokal eksizyon (2-3 cm) veya Mohs sonrasÄ± pozitif/yakÄ±n cerrahi sÄ±nÄ±rda, re-eksizyon mÃ¼mkÃ¼n deÄŸilse adjuvan RT.',
         targetVolumes: [{ name: 'CTV_DFSP', doseGy: 56, marginMm: '3-5 cm mikroskopik marjin', anatomical: 'Primer yatak ve cerrahi skar' }],
         oars: [],
         evidence: 'Soft tissue sarcoma / DFSP multidisciplinary guidance',
       };
       return { statusText: 'DEÄERLENDÄ°R: DFSP YAKIN/PozÄ°TÄ°F MARJÄ°NDE ADJUVAN RT', badgeClass: 'bg-amber-50 text-amber-800 border-amber-300', primaryScheme: dfsp, alternativeSchemes: [dfsp] };
      }

      if (breastHistology === 'Ä°nflamatuar Meme Kanseri (IBC)') {
        const inflammatory: DoseScheme = {
          id: 'br-inflammatory-pmrt-50',
          name: 'Neoadjuvan Sistemik Tedavi + Modifiye Radikal Mastektomi SonrasÄ± KapsamlÄ± Lokoregiyonal RT (50 Gy / 25 fx Â± 10 Gy Scar Boost)',
          tag: 'Lokal Ä°leri YÃ¼ksek Risk (Evre IIIB/C)',
          totalDoseGy: 50,
          fractionCount: 25,
          fractionDoseGy: 2,
          alphaBeta: 4,
          technique: 'IMRT / VMAT + DIBH',
          indication: 'Neoadjuvan sistemik tedavi ve modifiye radikal mastektomi sonrasÄ± gÃ¶ÄŸÃ¼s duvarÄ±, supraklavikuler, internal mammary ve aksiller seviye III alanlarÄ±na kapsamlÄ± lokoregiyonal RT; uygun seÃ§ilmiÅŸ olguda 10 Gy scar boost.',
          targetVolumes: [
            { name: 'CTV_ChestWall', doseGy: 50, marginMm: 'Anatomik', anatomical: 'Mastektomi gÃ¶ÄŸÃ¼s duvarÄ± ve cilt altÄ± yÃ¼zey' },
            { name: 'CTV_RNI', doseGy: 50, marginMm: 'Anatomik', anatomical: 'Aksilla Level I-IV + supraklavikuler + internal mammary chain' },
          ],
          oars: [
            { organ: 'Kalp', metric: 'Dmean', limit: '< 2.5 Gy hedef', source: 'NCCN / EMBRACE prensipleri' },
            { organ: 'Ä°psilateral akciÄŸer', metric: 'V20Gy', limit: '< 30%', source: 'QUANTEC' },
          ],
          systemicTherapy: 'Neoadjuvan kemoterapi / anti-HER2 tedavi sonrasÄ± cerrahi ve PMRT.',
          evidence: 'NCCN Breast Cancer v1.2025; AJCC 8th edition T4d',
        };
        return {
          statusText: 'ENDÄ°KE: Ä°NFLAMATUAR MEME KARSÄ°NOMU T4d - NEOADJUVAN KT + MASTEKTOMÄ° + PMRT',
          badgeClass: 'bg-rose-50 text-rose-800 border-rose-300',
          primaryScheme: inflammatory,
          alternativeSchemes: [inflammatory],
        };
      }

      if (isMastectomy) {
        if (!isNodePositive && !isT3T4 && (isT1 || selectedT === 'T2') && selectedN === 'N0' && breastMargin === 'Negatif') {
          const noRt: DoseScheme = {
            id: 'br-no-pmrt',
            name: 'PMRT Ã–nerilmez (Ä°zlem)',
            tag: 'ğŸ‘ï¸ YalnÄ±zca Ä°zlem',
            totalDoseGy: 0,
            fractionCount: 0,
            fractionDoseGy: 0,
            alphaBeta: 4,
            technique: 'Rutin Onkolojik Takip',
            indication: 'T1-T2 N0 mastektomi ve negatif cerrahi sÄ±nÄ±r varlÄ±ÄŸÄ±nda PMRT endikasyonu yoktur.',
            targetVolumes: [],
            oars: [],
            evidence: 'EBCTCG Meta-analysis, NCCN v1.2025',
          };
          return {
            statusText: 'ENDÄ°KE DEÄÄ°LDÄ°R: T1-T2 N0 MASTEKTOMÄ°DE PMRT GEREKMEZ',
            badgeClass: 'bg-slate-100 text-slate-700 border-slate-300',
            primaryScheme: noRt,
            alternativeSchemes: [noRt],
          };
        }
        const pmrt: DoseScheme = {
          id: 'br-pmrt-50',
          name: '50 Gy / 25 fx veya 40 Gy / 15 fx (Postmastektomi RT - PMRT)',
          tag: 'ğŸ›¡ï¸ PMRT Standart',
          totalDoseGy: 50,
          fractionCount: 25,
          fractionDoseGy: 2,
          alphaBeta: 4,
          technique: '3D-CRT / VMAT (Derin Ä°nspirasyon Nefes Tutma - DIBH Zorunlu)',
          indication: 'T3-T4 tÃ¼mÃ¶rler veya â‰¥4 lenf nodu pozitifliÄŸinde lokoregiyonal nÃ¼ksÃ¼ %70 azaltÄ±r ve genel saÄŸkalÄ±mÄ± artÄ±rÄ±r.',
          targetVolumes: [
            { name: 'CTV_ChestWall', doseGy: 50, marginMm: 'Cilt altÄ± 5 mm', anatomical: 'Mastektomi skarÄ± ve pektorali kasÄ± yÃ¼zeyi' },
            { name: 'CTV_Supraclav', doseGy: 46, marginMm: 'Anatomik', anatomical: 'Supraklavikuler fossa ve aksilla apeksi (Level III)' },
          ],
          oars: [
            { organ: 'Kalp', metric: 'Dmean', limit: '< 2.5 Gy', source: 'NCCN Sarcoma/Breast' },
            { organ: 'Ä°psilateral AkciÄŸer', metric: 'V20Gy', limit: '< 30%', source: 'QUANTEC' },
          ],
          systemicTherapy: `Sistemik tedavi patoloji ve biyobelirteÃ§lerle belirlenir: ER ${breastER ? 'pozitif' : 'negatif'}, PR ${breastPR ? 'pozitif' : 'negatif'}, HER2 ${breastHER2 ? 'pozitif' : 'negatif'}, Ki-67 ${breastKi67}%, Grade ${breastGrade}; menopoz durumu ${breastMenopause}. ${systemicRiskNote}`,
          evidence: 'EBCTCG PMRT Meta-Analysis (Lancet), SUPREMO Trial',
        };
        return {
          statusText: 'ENDÄ°KE: POSTMASTEKTOMÄ° GÃ–ÄÃœS DUVARI + LENFATÄ°K RT (PMRT)',
          badgeClass: 'bg-emerald-50 text-emerald-800 border-emerald-300 shadow-[0_0_15px_rgba(16,185,129,0.25)]',
          primaryScheme: pmrt,
          alternativeSchemes: [
            pmrt,
            {
              ...pmrt,
              id: 'br-pmrt-40-15',
              name: '40.05 Gy / 15 fx (Hipofraksiyone PMRT, START-B)',
              totalDoseGy: 40.05,
              fractionCount: 15,
              fractionDoseGy: 2.67,
              targetVolumes: pmrt.targetVolumes.map(volume => ({ ...volume, doseGy: 40.05 })),
            },
          ],
        };
      }

      // Meme Koruyucu Cerrahi (MKC)
      const hasNodalDisease = isNodePositive || isHighNodal;
      const fastForward: DoseScheme = {
        id: 'br-fast-26',
        name: '26 Gy / 5 fx (FAST-Forward Ultra-Hipofraksiyonasyon)',
        tag: 'âš¡ FAST-Forward Standart',
        totalDoseGy: 26,
        fractionCount: 5,
        fractionDoseGy: 5.2,
        alphaBeta: 4,
        technique: '3D-CRT / VMAT (DIBH Sol Kalp KorumasÄ±)',
        indication: `TÃ¼m meme Ä±ÅŸÄ±nlamasÄ±; ${isNodePositive ? 'Nodal pozitiflikte bÃ¶lgesel nodal Ä±ÅŸÄ±nlama (RNI) ayrÄ±ca deÄŸerlendirilir.' : 'nodal risk durumuna gÃ¶re RNI eklenmez.'} Menopoz: ${breastMenopause}. ER ${breastER ? 'pozitif' : 'negatif'}, PR ${breastPR ? 'pozitif' : 'negatif'}, HER2 ${breastHER2 ? 'pozitif' : 'negatif'}, Ki-67 ${breastKi67}%, Grade ${breastGrade}. ${systemicRiskNote} ${boostRiskNote} 40 Gy / 15 fx eÅŸdeÄŸer standart seÃ§enektir.`,
        targetVolumes: [
          { name: 'CTV_WholeBreast', doseGy: 26, marginMm: 'Cilt altÄ± 5 mm', anatomical: 'TÃ¼m meme parankimi' },
          ...(hasNodalDisease ? [{ name: 'CTV_RNI', doseGy: 40, marginMm: 'Risk uyarlanmÄ±ÅŸ', anatomical: 'Nodal durum ve klinik risk doÄŸrultusunda bÃ¶lgesel nodlar' }] : []),
          ...(breastBoost ? [{ name: 'TumorBedBoost', doseGy: 10, marginMm: 'Kavite ve klipsler', anatomical: `Uygun hastada 10-16 Gy ek boost${boostRiskNote ? `; ${boostRiskNote}` : ''}` }] : []),
        ],
        oars: [
          { organ: 'Kalp (Sol)', metric: 'Dmean', limit: '< 1.5 Gy', source: 'FAST-Forward' },
          { organ: 'Ä°psilateral AkciÄŸer', metric: 'V8Gy', limit: '< 15%', source: 'FAST-Forward' },
        ],
        systemicTherapy: `Adjuvan sistemik tedavi multidisipliner kararla belirlenir: ER ${breastER ? 'pozitif' : 'negatif'}, PR ${breastPR ? 'pozitif' : 'negatif'}, HER2 ${breastHER2 ? 'pozitif' : 'negatif'}, Ki-67 ${breastKi67}%, Grade ${breastGrade}; menopoz durumu ${breastMenopause}. ${systemicRiskNote}`,
        evidence: 'FAST-Forward Faz III (Lancet 2020), ASTRO 2023 Guidelines',
      };
      return {
        statusText: 'ENDÄ°KE: ADJUVAN TÃœM MEME RT (FAST-FORWARD 26 GY / 5 FX)',
        badgeClass: 'bg-emerald-50 text-emerald-800 border-emerald-300 shadow-[0_0_15px_rgba(16,185,129,0.25)]',
        primaryScheme: fastForward,
        alternativeSchemes: [
          fastForward,
          {
            ...fastForward,
            id: 'br-wbi-40-15',
            name: '40.05 Gy / 15 fx (Hipofraksiyone TÃ¼m Meme RT, START-B) + GereÄŸinde 10-16 Gy Boost',
            totalDoseGy: 40.05,
            fractionCount: 15,
            fractionDoseGy: 2.67,
            targetVolumes: fastForward.targetVolumes.map(volume => ({ ...volume, doseGy: volume.name === 'TumorBedBoost' ? 10 : 40.05 })),
          },
        ],
      };
    }

    // ------------------------------------------
    // 8. GÄ°S (REKTUM, MÄ°DE, KARACÄ°ÄER, Ã–ZOFAGUS, PANKREAS, ANAL)
    // ------------------------------------------
    if (selectedOrgan === 'gis') {
      if (gisOrgan === 'Rektum') {
        const rapido: DoseScheme = {
          id: 'gis-rapido-25',
          name: '25 Gy / 5 fx (5x5 Gy RAPIDO KÄ±sa DÃ¶nem RT + KT)',
          tag: 'âš¡ RAPIDO TNT StandardÄ±',
          totalDoseGy: 25,
          fractionCount: 5,
          fractionDoseGy: 5,
          alphaBeta: 10,
          technique: 'VMAT (Dolu Mesane ProtokolÃ¼)',
          indication: 'Lokal Ä°leri Rektum Ca (cT3-T4, CRM+, N2): KÄ±sa dÃ¶nem RT ardÄ±ndan konsolidasyon kemoterapisi (CAPOX/FOLFOX) organ koruma ve metastaz kontrolÃ¼nÃ¼ maksimize eder.',
          targetVolumes: [
            { name: 'CTV_Pelvis', doseGy: 25, marginMm: 'Anatomik', anatomical: 'Rektal tÃ¼mÃ¶r, mezorektum, presakral ve internal iliak lenf nodlarÄ±' },
          ],
          oars: [
            { organ: 'Small bowel', metric: 'Fractionation-specific bowel DVH', limit: 'Use the applicable RAPIDO/site protocol; conventional QUANTEC limits are not transferable', source: 'RAPIDO protocol (verify current version)', context: 'Short-course RT 25 Gy / 5 fx; not the conventional-fractionation setting for QUANTEC V15/V45 references.', contextEn: 'Short-course RT 25 Gy / 5 fx; not the conventional-fractionation setting for QUANTEC V15/V45 references.', classification: 'context-note' },
            { organ: 'Femur BaÅŸlarÄ±', metric: 'Dmax', limit: '< 25 Gy', source: 'QUANTEC' },
            { organ: 'Mesane', metric: 'V20Gy', limit: '< 40%', source: 'RAPIDO' },
          ],
          systemicTherapy: 'RT sonrasÄ± cerrahi Ã¶ncesi 18 hafta CAPOX veya FOLFOX4 kemoterapisi.',
          evidence: 'RAPIDO Faz III (Lancet Oncol 2021 & 2023), PRODIGE 23',
        };
        const standardKrt: DoseScheme = {
          id: 'gis-rectum-long-50',
          name: '50.4 Gy / 28 fx + EÅŸzamanlÄ± Kapesitabin (Uzun DÃ¶nem KRT)',
          tag: 'ğŸ¯ Klasik Kemoradyoterapi',
          totalDoseGy: 50.4,
          fractionCount: 28,
          fractionDoseGy: 1.8,
          alphaBeta: 10,
          technique: 'VMAT',
          indication: 'Lokal ileri rektum kanserinde sfinkter koruma ve lokal kontrol iÃ§in uzun dÃ¶nem eÅŸzamanlÄ± KRT.',
          targetVolumes: [{ name: 'CTV_Pelvis', doseGy: 50.4, marginMm: 'Anatomik', anatomical: 'Mezorektum ve pelvik lenfatik istasyonlar' }],
          oars: [],
          systemicTherapy: 'EÅŸzamanlÄ± oral Kapesitabin (825 mg/m2 gÃ¼nde iki kez).',
          evidence: 'German Rectal Cancer Study (CAO/ARO/AIO-94)',
        };
        const crmPositive = gisCrmStatus === 'Pozitif';
        const rapidoCrm: DoseScheme = crmPositive
          ? { ...rapido, indication: `${rapido.indication} MR-CRM pozitifliÄŸi (â‰¤1 mm) lokal nÃ¼ks ve uzak metastaz riskini artÄ±rÄ±r; TNT yaklaÅŸÄ±mÄ± ve yeterli mezorektal excision kritik Ã¶nemdedir.` }
          : rapido;
        return {
          statusText: crmPositive ? 'ENDÄ°KE: CRM+ LOKAL Ä°LERÄ° REKTUM - TNT (RAPIDO / PRODIGE 23) Ã–NCELÄ°KLÄ°' : 'ENDÄ°KE: NEOADJUVAN TNT / RAPIDO KISA DÃ–NEM RT PROTOKOLÃœ',
          badgeClass: 'bg-emerald-50 text-emerald-800 border-emerald-300 shadow-[0_0_15px_rgba(16,185,129,0.25)]',
          primaryScheme: rapidoCrm,
          alternativeSchemes: [rapidoCrm, standardKrt],
        };
      }

      if (gisOrgan === 'Mide') {
        const gastricCrt: DoseScheme = {
          id: 'gis-gastric-45',
          name: '45 Gy / 25 fx + EÅŸzamanlÄ± 5-FU/Kapesitabin (Adjuvan KRT)',
          tag: 'âš¡ INT-0116 / ARTIST',
          totalDoseGy: 45,
          fractionCount: 25,
          fractionDoseGy: 1.8,
          alphaBeta: 10,
          technique: 'VMAT (BÃ¶brek ve KaraciÄŸer KorumalÄ±)',
          indication: 'Yetersiz lenf nodu diseksiyonu (<D2 rezeksiyon) veya mikroskopik rezidÃ¼el hastalÄ±k (R1) varlÄ±ÄŸÄ±nda lokal nÃ¼ksÃ¼ Ã¶nler.',
          targetVolumes: [
            { name: 'CTV_Stomach_Bed', doseGy: 45, marginMm: 'Anatomik', anatomical: 'Mide yataÄŸÄ±, anastomoz hattÄ± ve perigastrik/Ã§Ã¶lyak lenf nodlarÄ±' },
          ],
          oars: [
            { organ: 'KaraciÄŸer', metric: 'Mean', limit: '< 30 Gy (V30 < 60%)', source: 'QUANTEC' },
            { organ: 'Bilateral BÃ¶brek', metric: 'Mean', limit: '< 15 Gy (en az bir bÃ¶brek Mean < 12 Gy)', source: 'QUANTEC' },
          ],
          systemicTherapy: 'EÅŸzamanlÄ± ve takip eden Kapesitabin veya 5-FU/LV.',
          evidence: 'INT-0116 (Macdonald NEJM), ARTIST Trial',
        };
        return {
          statusText: 'ENDÄ°KE: ADJUVAN KEMORADYOTERAPÄ° (INT-0116 STANDARDI)',
          badgeClass: 'bg-emerald-50 text-emerald-800 border-emerald-300',
          primaryScheme: gastricCrt,
          alternativeSchemes: [gastricCrt],
        };
      }

      if (gisOrgan === 'Karaciger' && liverHistology) {
        const isHcc = liverHistology === 'hcc';
        const doseGy = isHcc ? 45 : 50;
        const stageText = `BCLC ${liverBclcStage}`;
        const liverSbrt: DoseScheme = {
          id: isHcc ? 'gis-liver-hcc-sbrt-45-5' : 'gis-liver-crlm-sbrt-50-5',
          name: lang === 'tr'
            ? `${doseGy} Gy / 5 fx (${isHcc ? 'HCC' : 'kolorektal karaciÄŸer metastazÄ±'} SBRT)`
            : `${doseGy} Gy / 5 fx (${isHcc ? 'HCC' : 'colorectal liver metastasis'} SBRT)`,
          tag: isHcc ? 'NRG/RTOG 1112 Â· HCC' : lang === 'tr' ? 'KaraciÄŸer oligometastazÄ± SBRT' : 'Liver oligometastasis SBRT',
          totalDoseGy: doseGy,
          fractionCount: 5,
          fractionDoseGy: doseGy / 5,
          alphaBeta: 10,
          technique: breathingMotion === 'DIBH'
            ? (lang === 'tr' ? 'GÃ¶rÃ¼ntÃ¼ kÄ±lavuzlu DIBH / SGRT' : 'DIBH / SGRT with image guidance')
            : (lang === 'tr' ? 'GÃ¼nlÃ¼k gÃ¶rÃ¼ntÃ¼ kÄ±lavuzlu 4D-CT / ITV tabanlÄ± VMAT SBRT' : '4D-CT / ITV-based VMAT SBRT with daily image guidance'),
          indication: isHcc
            ? lang === 'tr'
              ? `${stageText}${liverBclcStage === 'C' ? ' (makrovaskÃ¼ler invazyon / PVTT olasÄ±lÄ±ÄŸÄ±)' : ''}: multidisipliner deÄŸerlendirme sonrasÄ± seÃ§ilmiÅŸ HCC olgusunda SBRT dÃ¼ÅŸÃ¼nÃ¼lebilir. Child-Pugh sÄ±nÄ±fÄ±nÄ±, karaciÄŸer rezervini ve alternatifleri doÄŸrulayÄ±n; 45 Gy / 5 fx NRG/RTOG 1112 aralÄ±ÄŸÄ±nda Ã¶rnek bir ÅŸemadÄ±r.`
              : `${stageText}${liverBclcStage === 'C' ? ' with possible macrovascular invasion/PVTT' : ''}: selected HCC SBRT after MDT review. Confirm Child-Pugh class, liver reserve and alternatives; 45 Gy / 5 fx is an example within NRG/RTOG 1112.`
            : lang === 'tr'
              ? 'Rezeksiyon/ablasyon uygunluÄŸu, sistemik hastalÄ±k kontrolÃ¼ ve OAR yakÄ±nlÄ±ÄŸÄ± konseyde deÄŸerlendirildikten sonra seÃ§ilmiÅŸ kolorektal karaciÄŸer oligometastazÄ± iÃ§in Ã¶rnek 50 Gy / 5 fx.'
              : 'Example 50 Gy / 5 fx for selected colorectal liver oligometastasis after MDT review of resection/ablation, systemic disease control and OAR proximity.',
          targetVolumes: [
            { name: 'GTV_Liver', doseGy, marginMm: '0 mm', anatomical: lang === 'tr' ? 'Kontrast tutan karaciÄŸer lezyonu' : 'Contrast-enhancing liver lesion' },
            { name: breathingMotion === 'DIBH' ? 'PTV_Liver_DIBH' : 'ITV_4D', doseGy, marginMm: lang === 'tr' ? 'Kurumsal hareket yÃ¶netimi / set-up marjini' : 'Motion management / institution-specific setup margin', anatomical: breathingMotion === 'DIBH' ? (lang === 'tr' ? 'Tekrarlanabilir nefes tutma hedefi' : 'Reproducible breath-hold target') : (lang === 'tr' ? '4D-CT solunum hareket zarfÄ±' : 'Respiratory motion envelope on 4D-CT') },
          ],
          oars: [],
          evidence: isHcc
            ? 'NRG/RTOG 1112; Dawson et al. JAMA Oncol 2025; DOI: 10.1001/jamaoncol.2024.5403; ASTRO primary liver cancer guideline'
            : 'eviQ Hepatic Metastases SABR protocol 4026; HyTEC liver metastases analysis',
        };
        return {
          statusText: isHcc
            ? lang === 'tr' ? `SEÃ‡ENEK: HCC SBRT Â· ${stageText} Â· karaciÄŸer rezervi ve konsey uygunluÄŸunu doÄŸrulayÄ±n` : `OPTION: HCC SBRT Â· ${stageText} Â· verify hepatic reserve and MDT suitability`
            : lang === 'tr' ? 'SEÃ‡ENEK: SEÃ‡Ä°LMÄ°Å KOLOREKTAL KARACÄ°ÄER OLÄ°GOMETASTAZINDA SBRT' : 'OPTION: SBRT FOR SELECTED COLORECTAL LIVER OLIGOMETASTASIS',
          badgeClass: 'bg-emerald-50 text-emerald-800 border-emerald-300',
          primaryScheme: liverSbrt,
          alternativeSchemes: [
            liverSbrt,
            { ...liverSbrt, id: 'gis-liver-sbrt-60-5', name: lang === 'tr' ? '60 Gy / 5 fx (seÃ§ilmiÅŸ karaciÄŸer met; yalnÄ±zca OAR sÄ±nÄ±rlarÄ± uygunsa)' : '60 Gy / 5 fx (selected liver metastasis; only if OAR limits permit)', totalDoseGy: 60, fractionDoseGy: 12 },
          ],
        };
      }

      if (gisOrgan === 'SafraYollari') {
        const siteName = {
          intrahepatic: lang === 'tr' ? 'intrahepatik kolanjiyokarsinom' : 'intrahepatic cholangiocarcinoma',
          perihilar: lang === 'tr' ? 'perihiler kolanjiyokarsinom (Klatskin)' : 'perihilar cholangiocarcinoma (Klatskin)',
          extrahepatic: lang === 'tr' ? 'distal / ekstrahepatik kolanjiyokarsinom' : 'distal / extrahepatic cholangiocarcinoma',
          gallbladder: lang === 'tr' ? 'safra kesesi karsinomu' : 'gallbladder carcinoma',
        }[biliaryHistology];
        const highRisk = biliaryMarginStatus === 'R1' || selectedN === 'N1';
        const boostDose = biliaryMarginStatus === 'R1' ? 59.4 : 54;
        const boostFractions = Math.round(boostDose / 1.8);
        const adjuvant: DoseScheme = {
          id: `biliary-adjuvant-${biliaryMarginStatus.toLowerCase()}-${selectedN.toLowerCase()}`,
          name: highRisk
            ? lang === 'tr' ? `BÃ¶lgesel nodlara 45 Gy / 25 fx + tÃ¼mÃ¶r yataÄŸÄ±na ${boostDose} Gy boost`
              : `45 Gy / 25 fx regional nodes + tumour bed boost to ${boostDose} Gy`
            : lang === 'tr' ? 'Mevcut R0/N0 seÃ§iminde otomatik adjuvan RT Ã¶nerilmez'
              : 'No automatic adjuvant radiotherapy recommendation for current R0/N0 selection',
          tag: 'SWOG S0809 Â· postoperative high-risk',
          totalDoseGy: highRisk ? boostDose : 0,
          fractionCount: highRisk ? boostFractions : 0,
          fractionDoseGy: 1.8,
          alphaBeta: 10,
          technique: 'IMRT / VMAT with image guidance',
          indication: highRisk
            ? lang === 'tr'
              ? `${siteName}: R1 marjin veya bÃ¶lgesel N+ hastalÄ±k. SWOG S0809 bÃ¶lgesel nodlara ve tÃ¼mÃ¶r yataÄŸÄ±na 45 Gy / 25 fx; R0 iÃ§in 54 Gy, R1 iÃ§in 59.4 Gy boost kullandÄ±. KanÄ±t ekstrahepatik kolanjiyokarsinom ve safra kesesi kanserinde daha gÃ¼Ã§lÃ¼dÃ¼r; intrahepatik olguyu konseyde bireyselleÅŸtirin.`
              : `${siteName}: R1 margin or regional N+ disease. SWOG S0809 used 45 Gy / 25 fx to regional nodes and tumour bed with boost to 54 Gy (R0) or 59.4 Gy (R1). Evidence is strongest for extrahepatic cholangiocarcinoma and gallbladder cancer; individualise intrahepatic cases.`
            : lang === 'tr'
              ? `${siteName}: mevcut R0/N0 seÃ§imi SWOG S0809 yÃ¼ksek risk Ã¶lÃ§Ã¼tlerini karÅŸÄ±lamaz. Adjuvan kemoradyoterapi otomatik deÄŸildir; patoloji ve sistemik adjuvan tedaviyi konseyde deÄŸerlendirin.`
              : `${siteName}: current R0/N0 selections do not meet high-risk SWOG S0809 criteria. Adjuvant chemoradiation is not automatic; review pathology and systemic adjuvant therapy at MDT.`,
          targetVolumes: highRisk ? [
            { name: 'Regional nodal CTV', doseGy: 45, marginMm: lang === 'tr' ? 'Alt bÃ¶lgeye Ã¶zgÃ¼ atlas' : 'Site-specific atlas', anatomical: lang === 'tr' ? 'Primer alt bÃ¶lgeye gÃ¶re bÃ¶lgesel nodal alan' : 'Regional nodal basin for primary site' },
            { name: 'Tumour bed / high-risk margin', doseGy: boostDose, marginMm: lang === 'tr' ? 'Postoperatif anatomi ve klipler' : 'Postoperative anatomy and clips', anatomical: lang === 'tr' ? 'Rezeksiyon yataÄŸÄ±; R1 ise pozitif marjin' : 'Resection bed; positive margin if R1' },
          ] : [],
          oars: [],
          systemicTherapy: highRisk
            ? lang === 'tr'
              ? 'SWOG S0809 sÄ±ralamasÄ±: gemsitabin/kapesitabin ardÄ±ndan RT ile eÅŸzamanlÄ± kapesitabin; dozlarÄ± medikal onkolojiyle koordine edin.'
              : 'SWOG S0809 sequence: gemcitabine/capecitabine followed by concurrent capecitabine with RT; coordinate doses with medical oncology.'
            : undefined,
          evidence: 'SWOG S0809, Ben-Josef et al. JCO 2015; DOI: 10.1200/JCO.2014.60.2219; verify current NCCN version',
        };
        if (biliaryTreatmentSetting === 'adjuvant') {
          return {
            statusText: highRisk
              ? lang === 'tr' ? 'SEÃ‡ENEK: R1 VEYA N+ BÄ°LÄ°YER KANSERDE ADJUVAN KRT (SWOG S0809)' : 'OPTION: ADJUVANT CRT FOR R1 OR N+ BILIARY CANCER (SWOG S0809)'
              : lang === 'tr' ? 'ADJUVAN KRT OTOMATÄ°K ENDÄ°KE DEÄÄ°L: R1 / N+ RÄ°SKÄ°NÄ° DOÄRULAYIN' : 'ADJUVANT CRT NOT AUTOMATICALLY INDICATED: CONFIRM R1 / N+ RISK',
            badgeClass: highRisk ? 'bg-emerald-50 text-emerald-800 border-emerald-300' : 'bg-amber-50 text-amber-800 border-amber-300',
            primaryScheme: adjuvant,
            alternativeSchemes: [adjuvant],
          };
        }
        const sbrt: DoseScheme = {
          ...adjuvant,
          id: 'biliary-unresectable-sbrt-45-5',
          name: lang === 'tr' ? '45 Gy / 5 fx (seÃ§ilmiÅŸ inoperabl safra yolu olgularÄ±)' : '45 Gy / 5 fx (selected unresectable biliary tract cases)',
          tag: lang === 'tr' ? 'SBRT Â· OAR sÄ±nÄ±rlÄ±' : 'SBRT Â· OAR-limited',
          totalDoseGy: 45,
          fractionCount: 5,
          fractionDoseGy: 9,
          technique: lang === 'tr' ? 'Solunum hareketi yÃ¶netimli, gÃ¶rÃ¼ntÃ¼ kÄ±lavuzlu VMAT / SBRT' : 'Image-guided VMAT / SBRT with respiratory motion management',
          indication: lang === 'tr'
            ? `${siteName}: yalnÄ±zca konsey deÄŸerlendirmesi sonrasÄ± ve alt bÃ¶lgeye Ã¶zgÃ¼ mide, baÄŸÄ±rsak ve santral safra yolu OAR kÄ±sÄ±tlarÄ± karÅŸÄ±lanabiliyorsa dÃ¼ÅŸÃ¼nÃ¼n.`
            : `${siteName}: consider after MDT review only when site-specific stomach, bowel and central biliary OAR limits can be met.`,
          targetVolumes: [{ name: 'GTV_Biliary', doseGy: 45, marginMm: lang === 'tr' ? 'Protokole Ã¶zgÃ¼ hareket/set-up marjini' : 'Protocol-specific motion/setup margin', anatomical: lang === 'tr' ? 'Makroskopik primer veya nÃ¼ks; alt bÃ¶lgeye Ã¶zgÃ¼ nodal yaklaÅŸÄ±m' : 'Gross primary or recurrence; site-specific nodal policy' }],
          evidence: 'Verify current NCCN Biliary Tract Cancers version; RTOG upper-abdominal atlas; institutional SBRT protocol',
        };
        const conventional: DoseScheme = {
          ...sbrt,
          id: 'biliary-unresectable-conventional-54-30',
          name: lang === 'tr' ? '50.4â€“54 Gy / 28â€“30 fx (konvansiyonel fraksiyonlu RT)' : '50.4â€“54 Gy / 28â€“30 fx (conventionally fractionated RT)',
          tag: lang === 'tr' ? 'Konvansiyonel RT / KRT' : 'Conventional RT / CRT',
          totalDoseGy: 54,
          fractionCount: 30,
          fractionDoseGy: 1.8,
          technique: lang === 'tr' ? 'GÃ¶rÃ¼ntÃ¼ kÄ±lavuzlu IMRT / VMAT' : 'IMRT / VMAT with image guidance',
          targetVolumes: [{ name: 'CTV_Biliary', doseGy: 50.4, marginMm: lang === 'tr' ? 'Alt bÃ¶lgeye Ã¶zgÃ¼ atlas' : 'Site-specific atlas', anatomical: lang === 'tr' ? 'Primer alt bÃ¶lge ve klinik endikasyonlu bÃ¶lgesel nodlar' : 'Primary site and clinically indicated regional nodes' }],
          evidence: 'SWOG S0809; verify current NCCN Biliary Tract Cancers version',
        };
        return {
          statusText: lang === 'tr' ? 'SEÃ‡ENEK: Ä°NOPERABL BÄ°LÄ°YER HASTALIKTA ANATOMÄ° VE HASTAYA UYARLANMIÅ RT' : 'OPTION: ANATOMY- AND PATIENT-ADAPTED RT FOR UNRESECTABLE BILIARY DISEASE',
          badgeClass: 'bg-emerald-50 text-emerald-800 border-emerald-300',
          primaryScheme: sbrt,
          alternativeSchemes: [
            sbrt,
            conventional,
            { ...conventional, id: 'biliary-unresectable-conventional-504-28', name: lang === 'tr' ? '50.4 Gy / 28 fx (konvansiyonel fraksiyonlu RT)' : '50.4 Gy / 28 fx (conventionally fractionated RT)', totalDoseGy: 50.4, fractionCount: 28 },
          ],
        };
      }

      if (gisOrgan === 'Ozofagus') {
        const cross: DoseScheme = {
          id: 'gis-esophagus-cross-414',
          name: '41.4 Gy / 23 fx (CROSS Neoadjuvan KRT)',
          tag: 'CROSS Kategori 1',
          totalDoseGy: 41.4,
          fractionCount: 23,
          fractionDoseGy: 1.8,
          alphaBeta: 10,
          technique: 'VMAT / IMRT',
          indication: 'Neoadjuvan CROSS protokolÃ¼: eÅŸzamanlÄ± karboplatin/paklitaksel ve ardÄ±ndan cerrahi.',
          targetVolumes: [{ name: 'CTV_Esophagus', doseGy: 41.4, marginMm: 'Anatomik', anatomical: 'Primer Ã¶zofagus tÃ¼mÃ¶rÃ¼ ve bÃ¶lgesel lenfatikler' }],
          oars: [
            { organ: 'Kalp', metric: 'Dmean', limit: '< 20 Gy; V30 < 30%', source: 'CROSS / QUANTEC' },
            { organ: 'AkciÄŸer', metric: 'V20Gy', limit: '< 20%', source: 'CROSS / QUANTEC' },
            { organ: 'Spinal kord', metric: 'Dmax', limit: '< 45 Gy', source: 'QUANTEC' },
          ],
          systemicTherapy: 'EÅŸzamanlÄ± karboplatin/paklitaksel.',
          evidence: 'CROSS Trial; NCCN Esophageal Cancer v1.2025',
        };
        const definitive: DoseScheme = { ...cross, id: 'gis-esophagus-definitive-504', name: '50-50.4 Gy / 25-28 fx (Definitif KRT)', totalDoseGy: 50.4, fractionCount: 28, fractionDoseGy: 1.8, tag: 'Definitif Ã–zofagus KRT' };
        return { statusText: 'ENDÄ°KE: Ã–ZOFAGUS CROSS NEOADJUVAN KRT', badgeClass: 'bg-emerald-50 text-emerald-800 border-emerald-300', primaryScheme: cross, alternativeSchemes: [cross, definitive] };
      }

      if (gisOrgan === 'Pankreas') {
        const pancreatic: DoseScheme = {
          id: 'gis-pancreas-504',
          name: '50.4 Gy / 28 fx (Borderline Rezekabl Neoadjuvan KRT)',
          tag: 'NCCN Pankreas',
          totalDoseGy: 50.4,
          fractionCount: 28,
          fractionDoseGy: 1.8,
          alphaBeta: 10,
          technique: 'IMRT / VMAT',
          indication: 'Borderline rezekabl veya seÃ§ilmiÅŸ lokal ileri pankreas kanserinde eÅŸzamanlÄ± kapesitabin; indÃ¼ksiyon FOLFIRINOX sonrasÄ± SBRT deÄŸerlendirilebilir.',
          targetVolumes: [{ name: 'PTV_Pancreas', doseGy: 50.4, marginMm: 'Anatomik', anatomical: 'Primer pankreas tÃ¼mÃ¶rÃ¼ ve ilgili lenfatikler' }],
          oars: [
            { organ: 'Duodenum', metric: 'Dmax', limit: '< 54 Gy; SBRT V33Gy < 1 cc', source: 'NCCN / QUANTEC' },
            { organ: 'Mide', metric: 'Dmax', limit: '< 54 Gy', source: 'NCCN' },
            { organ: 'Bowel bag / peritoneal cavity', metric: 'V45Gy', limit: '< 195 cc (QUANTEC dose-volume reference)', source: 'QUANTEC small bowel (2010)', context: 'Applies to the bowel-bag/peritoneal-cavity contour, not individual loops; conventional fractionation.', contextEn: 'Applies to the bowel-bag/peritoneal-cavity contour, not individual loops; conventional fractionation.', classification: 'dose-volume-reference' },
            { organ: 'BÃ¶brekler', metric: 'V18Gy', limit: '< 30% bilateral', source: 'QUANTEC' },
          ],
          systemicTherapy: 'EÅŸzamanlÄ± kapesitabin veya indÃ¼ksiyon FOLFIRINOX sonrasÄ± SBRT.',
          evidence: 'NCCN Pancreatic Adenocarcinoma v1.2025',
        };
        const sbrt: DoseScheme = { ...pancreatic, id: 'gis-pancreas-sbrt-40', name: '33-40 Gy / 5 fx (Pankreas SBRT)', totalDoseGy: 40, fractionCount: 5, fractionDoseGy: 8, technique: 'MR-Linac / SBRT' };
        return { statusText: 'ENDÄ°KE: PANKREAS KRT / SEÃ‡Ä°LMÄ°Å SBRT', badgeClass: 'bg-emerald-50 text-emerald-800 border-emerald-300', primaryScheme: pancreatic, alternativeSchemes: [pancreatic, sbrt] };
      }

      // Anal / Pankreas / Ã–zofagus
      const generalGis: DoseScheme = {
        id: 'gis-general-50',
        name: '50.4 Gy / 28 fx Kemoradyoterapi',
        tag: 'âš¡ Definitif GÄ°S KRT',
        totalDoseGy: 50.4,
        fractionCount: 28,
        fractionDoseGy: 1.8,
        alphaBeta: 10,
        technique: 'VMAT',
        indication: 'GÄ°S organÄ± definitif kemoradyoterapi protokolÃ¼.',
        targetVolumes: [{ name: 'PTV', doseGy: 50.4, marginMm: '5-7 mm', anatomical: 'Primer kitle ve bÃ¶lgesel lenfatikler' }],
        oars: [],
        evidence: 'NCCN Gastrointestinal Guidelines',
      };
      return {
        statusText: 'ENDÄ°KE: DEFÄ°NÄ°TÄ°F KEMORADYOTERAPÄ°',
        badgeClass: 'bg-emerald-50 text-emerald-800 border-emerald-300',
        primaryScheme: generalGis,
        alternativeSchemes: [generalGis],
      };
    }

    // ------------------------------------------
    // 9. CÄ°LT
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
        name: isMelanoma ? `${totalDose} Gy / ${fractions} fx (SeÃ§ilmiÅŸ Melanom Adjuvan RT)` : isMerkel ? '50-56 Gy Primer + 50 Gy BÃ¶lgesel Nodal RT' : isSCC ? `${totalDose} Gy / ${fractions} fx (cSCC${highRiskScc ? ' yÃ¼ksek risk IMRT' : ', RT endikasyonu varsa'})` : '50 Gy / 20 fx (BCC YÃ¼zeyel / Elektron RT)',
        tag: isMelanoma ? 'Melanom - SeÃ§ilmiÅŸ Endikasyon' : isMerkel ? 'Merkel HÃ¼creli Karsinom' : isSCC ? highRiskScc ? 'YÃ¼ksek Risk cSCC' : 'cSCC - RT endikasyonuna baÄŸlÄ±' : 'BCC Konformal RT',
        totalDoseGy: totalDose,
        fractionCount: fractions,
        fractionDoseGy: totalDose / fractions,
        alphaBeta: 10,
        technique: isMelanoma ? 'IMRT / VMAT; nodal hacim endikasyona gÃ¶re' : isMerkel ? 'IMRT / VMAT; primer yatak ve bÃ¶lgesel nodal alan' : isSCC ? 'YÃ¼ksek riskte IMRT / VMAT' : 'Elektron demeti, yÃ¼zeyel RT veya brakiterapi',
        indication: isMelanoma
          ? 'Lokal nÃ¼ks, R1 cerrahi sÄ±nÄ±r veya Ã§oklu nodal tutulum gibi seÃ§ilmiÅŸ durumlarda adjuvan hipofraksiyone RT deÄŸerlendirilir.'
          : isMerkel
            ? 'Agresif nÃ¶roendokrin biyoloji nedeniyle primer yatak ve elektif bÃ¶lgesel nodal drenajÄ±n tedavisi multidisipliner olarak deÄŸerlendirilir.'
            : isSCC
              ? highRiskScc ? 'Derinlik >6 mm, perinÃ¶ral invazyon, kemik tutulumu, pozitif marjin veya nodal hastalÄ±k yÃ¼ksek risk Ã¶zelliÄŸidir; adjuvan/definitif IMRT deÄŸerlendirilir.' : 'DÃ¼ÅŸÃ¼k riskli cSCC iÃ§in cerrahi/izlem Ã¶nceliklidir; RT yalnÄ±zca klinik endikasyon varsa deÄŸerlendirilir.'
              : 'DÃ¼ÅŸÃ¼k riskli bazal hÃ¼creli karsinomda yÃ¼zeyel RT, elektron veya brakiterapi; cerrahiye uygunluk ve kozmetik hedeflerle deÄŸerlendirilir.',
        targetVolumes: [
          { name: 'PTV_Primer', doseGy: totalDose, marginMm: 'Klinik marjin ve anatomik bariyerlere gÃ¶re', anatomical: 'Primer yatak / lezyon' },
          ...(isMerkel ? [{ name: 'CTV_Regional_Nodes', doseGy: 50, marginMm: 'BÃ¶lgesel drenaj', anatomical: 'Elektif bÃ¶lgesel nodal alan; risk uyarlanmÄ±ÅŸ' }] : []),
        ],
        oars: [
          { organ: 'GÃ¶z Lensi (YÃ¼z ise)', metric: 'Dmax', limit: '< 5-7 Gy', source: 'QUANTEC' },
          { organ: 'Kemik / KÄ±kÄ±rdak', metric: 'Dmax', limit: '< 60 Gy', source: 'QUANTEC' },
        ],
        evidence: 'NCCN Basal / Squamous Cell Skin Cancer v1.2025; ASTRO Skin Cancer Guidelines; Merkel cell multidisciplinary guidance',
      };
      return {
        statusText: isMelanoma ? 'SEÃ‡Ä°LMÄ°Å OLGUDA ADJUVAN MELANOM RT DEÄERLENDÄ°R' : isMerkel ? 'ENDÄ°KE: PRÄ°MER YATAK + BÃ–LGESEL NODAL ALAN DEÄERLENDÄ°R' : isSCC && highRiskScc ? 'YÃœKSEK RÄ°SK cSCC: ADJUVAN / DEFÄ°NÄ°TÄ°F IMRT DEÄERLENDÄ°R' : isSCC ? 'DÃœÅÃœK RÄ°SK cSCC: CERRAHÄ° / Ä°ZLEM; RT YALNIZCA ENDÄ°KASYON VARSA' : isBCC ? 'BCC: CERRAHÄ° UYGUNLUÄUNA GÃ–RE YÃœZEYEL RT DEÄERLENDÄ°R' : 'ENDÄ°KE: DEFÄ°NÄ°TÄ°F / ADJUVAN KUTANÃ–Z RT',
        badgeClass: 'bg-emerald-50 text-emerald-800 border-emerald-300',
        primaryScheme: skinScheme,
        alternativeSchemes: [skinScheme],
      };
    }

    // ------------------------------------------
    // 10. HEMATOLOJÄ°K
    // ------------------------------------------
    if (selectedOrgan === 'hematologic') {
      if (hematologicSubtype === 'Plasmacytoma') {
        const plasmacytoma: DoseScheme = {
          id: 'plasmacytoma-45',
          name: '40-50 Gy / 20-25 fx (Soliter Plazmasitom)',
          tag: 'KÃ¼ratif Lokal RT',
          totalDoseGy: 45,
          fractionCount: 25,
          fractionDoseGy: 1.8,
          alphaBeta: 10,
          technique: 'IMRT / VMAT; tÃ¼mÃ¶r hacmine gÃ¶re lokal alan',
          indication: 'Kemik veya ekstramedÃ¼ller soliter plazmasitomda kemik iliÄŸi ve sistemik deÄŸerlendirme sonrasÄ± kÃ¼ratif lokal RT; lokal kontrol oranÄ± yÃ¼ksektir.',
          targetVolumes: [{ name: 'CTV_Plazmasitom', doseGy: 45, marginMm: 'GÃ¶rÃ¼ntÃ¼leme ve anatomik bariyerlere gÃ¶re', anatomical: 'Makroskopik lezyon ve subklinik yayÄ±lÄ±m alanÄ±' }],
          oars: [{ organ: 'Spinal kord (yakÄ±nsa)', metric: 'Dmax', limit: 'QUANTEC sÄ±nÄ±rlarÄ± iÃ§inde', source: 'QUANTEC' }],
          evidence: 'ILROG Guidelines for Solitary Plasmacytoma; NCCN v1.2025',
        };
        return {
          statusText: 'ENDÄ°KE: SOLÄ°TER PLAZMASÄ°TOMDA KÃœRATÄ°F LOKAL RT',
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
          tag: 'Multipl Miyelom - Semptom KontrolÃ¼',
          totalDoseGy: doseGy,
          fractionCount,
          fractionDoseGy: doseGy / fractionCount,
          alphaBeta: 10,
          technique: '3D-CRT / IMRT; omurga instabilitesinde cerrahi gÃ¶rÃ¼ÅŸ',
          indication: 'AÄŸrÄ±lÄ± litik lezyon, epidural hastalÄ±k veya patolojik fraktÃ¼r riski iÃ§in semptom odaklÄ± palyatif RT; hematoloji ve ortopedi/nÃ¶roÅŸirÃ¼rji ile eÅŸgÃ¼dÃ¼m gerekir.',
          targetVolumes: [{ name: 'PTV_Symptomatic_Lesion', doseGy, marginMm: 'GÃ¶rÃ¼ntÃ¼leme ve anatomik sÄ±nÄ±rlara gÃ¶re', anatomical: 'AÄŸrÄ±lÄ± litik veya fraktÃ¼r riski taÅŸÄ±yan lezyon' }],
          oars: [{ organ: 'Spinal kord', metric: 'Dmax', limit: 'Fraksiyonasyona uygun QUANTEC sÄ±nÄ±rlarÄ±', source: 'QUANTEC' }],
          evidence: 'ASTRO Bone Metastases Guideline; ILROG Myeloma Guidance',
        };
        return {
          statusText: 'ENDÄ°KE: SEMPTOMATÄ°K MÄ°YELOM LEZYONUNDA PALYATÄ°F RT',
          badgeClass: 'bg-indigo-50 text-indigo-800 border-indigo-300',
          primaryScheme: myeloma,
          alternativeSchemes: [myeloma],
        };
      }

      if (hematologicSubtype === 'ALL') {
        const allScheme: DoseScheme = {
          id: 'all-tbi-12',
          name: '12 Gy / 6 fx BID (TBI) veya 12-18 Gy Kraniyal Profilaksi',
          tag: 'ALL - KÄ°T HazÄ±rlÄ±ÄŸÄ± / CNS Profilaksisi',
          totalDoseGy: 12,
          fractionCount: 6,
          fractionDoseGy: 2,
          alphaBeta: 10,
          technique: 'Total Body Irradiation veya risk uyarlÄ± kraniyal RT',
          indication: 'ALL tedavisinde hematopoietik kÃ¶k hÃ¼cre nakli hazÄ±rlÄ±ÄŸÄ±nda TBI; CNS riski olan hastada profilaktik kraniyal RT hematoloji protokolÃ¼yle koordine edilir.',
          targetVolumes: [{ name: 'CTV_TBI', doseGy: 12, marginMm: 'TÃ¼m vÃ¼cut', anatomical: 'Total body / kemik iliÄŸi' }],
          oars: [{ organ: 'AkciÄŸer', metric: 'Dmean', limit: 'AkciÄŸer bloklama protokolÃ¼', source: 'Hematopoietic transplant protocol' }],
          systemicTherapy: 'ALL sistemik tedavisi ve KÄ°T protokolÃ¼ ile birlikte.',
          evidence: 'EBMT / ALL transplant conditioning guidance',
        };
        return { statusText: 'ENDÄ°KE: ALL KÄ°T HAZIRLIÄINDA TBI / CNS RÄ°SKÄ°NE GÃ–RE KRANÄ°YAL RT', badgeClass: 'bg-indigo-50 text-indigo-800 border-indigo-300', primaryScheme: allScheme, alternativeSchemes: [allScheme] };
      }

      if (hematologicSubtype === 'CLL') {
        const cllScheme: DoseScheme = {
          id: 'cll-spleen-6',
          name: '4-10 Gy / 0.5-1 Gy fx (Dalak Palyasyonu)',
          tag: 'KLL - Semptomatik Splenomegali',
          totalDoseGy: 6,
          fractionCount: 6,
          fractionDoseGy: 1,
          alphaBeta: 10,
          technique: 'Konformal dÃ¼ÅŸÃ¼k doz dalak RT',
          indication: 'Semptomatik splenomegali veya lokal nodal KLL progresyonunda dÃ¼ÅŸÃ¼k doz palyatif RT; hematolojik toksisite iÃ§in yakÄ±n takip.',
          targetVolumes: [{ name: 'CTV_Spleen', doseGy: 6, marginMm: 'Dalak + gÃ¼nlÃ¼k gÃ¶rÃ¼ntÃ¼leme marjini', anatomical: 'Dalak ve semptomatik nodal hacim' }],
          oars: [{ organ: 'BÃ¶brekler', metric: 'Dmean', limit: 'MÃ¼mkÃ¼n olduÄŸunca dÃ¼ÅŸÃ¼k', source: 'ILROG' }],
          evidence: 'ILROG low-dose lymphoma guidance',
        };
        return { statusText: 'ENDÄ°KE: KLL SEMPTOMATÄ°K SPLENOMEGALÄ°DE DÃœÅÃœK DOZ RT', badgeClass: 'bg-amber-50 text-amber-800 border-amber-300', primaryScheme: cllScheme, alternativeSchemes: [cllScheme] };
      }

      if (hematologicSubtype === 'FolikÃ¼ler') {
        const flScheme: DoseScheme = {
          id: 'follicular-isrt-24',
          name: '24 Gy / 12 fx (Tutulu Alan RT - ISRT)',
          tag: 'ğŸ¯ FolikÃ¼ler Lenfoma ISRT',
          totalDoseGy: 24,
          fractionCount: 12,
          fractionDoseGy: 2,
          alphaBeta: 10,
          technique: 'IMRT / VMAT (ISRT Prensipleri)',
          indication: 'Erken evre folikÃ¼ler lenfomada 24 Gy tutulu alan radyoterapisi yÃ¼ksek lokal kontrol saÄŸlar; ileri evre semptomatik hastalÄ±kta dÃ¼ÅŸÃ¼k doz (2x2 Gy) palyasyon hematoloji konseyiyle deÄŸerlendirilir.',
          targetVolumes: [{ name: 'CTV_ISRT', doseGy: 24, marginMm: 'Pre-KT GTV ile sÄ±nÄ±rlÄ±', anatomical: 'Tutulu lenf nodu bÃ¶lgesi' }],
          oars: [{ organ: 'KomÅŸu OAR', metric: 'Dmean', limit: 'ALARA prensibi', source: 'ILROG' }],
          evidence: 'ILROG Guidelines; FORT Trial',
        };
        return { statusText: 'ENDÄ°KE: FOLÄ°KÃœLER LENFOMADA 24 GY TUTULU ALAN RT (ISRT)', badgeClass: 'bg-emerald-50 text-emerald-800 border-emerald-300', primaryScheme: flScheme, alternativeSchemes: [flScheme] };
      }

      const isCR = lymphomaResponse === 'Tam_Yanit';
      const dose = isCR ? 20 : 30;
      const lymphomaScheme: DoseScheme = {
        id: 'lymphoma-isrt',
        name: `${dose} Gy / ${dose / 2} fx (Tutulu Alan Radyoterapisi - ISRT)`,
        tag: isCR ? 'âœ¨ Konsolidasyon ISRT' : 'ğŸ”¬ Refrakter / RezidÃ¼ ISRT',
        totalDoseGy: dose,
        fractionCount: dose / 2,
        fractionDoseGy: 2.0,
        alphaBeta: 10,
        technique: 'IMRT / VMAT (ISRT Prensipleri)',
        indication: 'Kemoterapi sonrasÄ± tutulu alana konsolidasyon RT nÃ¼ks riskini %50\'den fazla azaltÄ±r.',
        targetVolumes: [
          { name: 'CTV_ISRT', doseGy: dose, marginMm: 'Pre-KT GTV ile sÄ±nÄ±rlÄ±', anatomical: 'BaÅŸlangÄ±Ã§ta tutulu lenf nodu hacmi' },
        ],
        oars: [
          { organ: 'Kalp', metric: 'Dmean', limit: '< 5 Gy', source: 'ILROG Guidelines' },
          { organ: 'AkciÄŸer V20Gy', metric: 'V20Gy', limit: '< 10%', source: 'ILROG' },
        ],
        systemicTherapy: 'ABVD, brentuximab veya R-CHOP kemoterapisini takiben.',
        evidence: 'ILROG Guidelines, HD16/HD17 Trials (Lancet Oncol)',
      };
      return {
        statusText: 'ENDÄ°KE: KONSOLÄ°DASYON TUTULU ALAN RT (ISRT)',
        badgeClass: 'bg-emerald-50 text-emerald-800 border-emerald-300',
        primaryScheme: lymphomaScheme,
        alternativeSchemes: [lymphomaScheme],
      };
    }

    // ------------------------------------------
    // 11. PEDÄ°ATRÄ°K
    // ------------------------------------------
    if (selectedOrgan === 'pediatric') {
      const isHighRisk = pediatricRisk === 'Yuksek';
      if (pediatricSubtype === 'Wilms') {
        const highRiskWilms = selectedT === 'III' || wilmsStage === 'Evre_III_Anaplazi';
        const wholeAbdomen = highRiskWilms && wilmsWholeAbdomen;
        const wilms: DoseScheme = {
          id: wholeAbdomen ? 'wilms-whole-abdomen-105' : highRiskWilms ? 'wilms-flank-108' : 'wilms-observe',
          name: !highRiskWilms ? 'RT Gerekmez - Ä°zlem' : wholeAbdomen ? '10.5 Gy / 7 fx (TÃ¼m BatÄ±n RT)' : '10.8 Gy / 6 fx (Flank RT)',
          tag: !highRiskWilms ? 'Erken Evre / Uygun Histoloji' : 'Wilms TÃ¼mÃ¶rÃ¼ - Risk UyarlanmÄ±ÅŸ RT',
          totalDoseGy: highRiskWilms ? wholeAbdomen ? 10.5 : 10.8 : 0,
          fractionCount: highRiskWilms ? wholeAbdomen ? 7 : 6 : 0,
          fractionDoseGy: highRiskWilms ? wholeAbdomen ? 1.5 : 1.8 : 0,
          alphaBeta: 10,
          technique: 'Pediatrik IMRT / 3D-CRT; bÃ¶brek, karaciÄŸer ve bÃ¼yÃ¼me dokularÄ±nÄ± koru',
          indication: highRiskWilms
            ? 'Evre III veya fokal/diffÃ¼z anaplazide protokol ve histolojiye gÃ¶re flank RT; yaygÄ±n peritoneal kontaminasyon/implantlarda tÃ¼m batÄ±n RT deÄŸerlendirilir. Alan ve doz Ã§ocuk onkoloji protokolÃ¼ne gÃ¶re doÄŸrulanmalÄ±dÄ±r.'
            : 'Erken evre ve uygun histolojide RT rutin olarak gerekli olmayabilir; Ã§ocuk onkoloji protokolÃ¼ne gÃ¶re izlem.',
          targetVolumes: highRiskWilms ? [{ name: wholeAbdomen ? 'CTV_Whole_Abdomen' : 'CTV_Flank', doseGy: wholeAbdomen ? 10.5 : 10.8, marginMm: 'COG / SIOP protokol sÄ±nÄ±rlarÄ±', anatomical: wholeAbdomen ? 'Peritoneal yayÄ±lÄ±m / tÃ¼m batÄ±n endikasyonu' : 'Ä°psilateral flank ve tÃ¼mÃ¶r yataÄŸÄ±' }] : [],
          oars: [{ organ: 'Kontralateral bÃ¶brek', metric: 'Dmean', limit: 'MÃ¼mkÃ¼n olduÄŸunca dÃ¼ÅŸÃ¼k', source: 'COG / PENTEC' }],
          systemicTherapy: 'Ã‡ocuk onkoloji protokolÃ¼ ve evreye gÃ¶re sistemik tedavi.',
          evidence: 'COG AREN0532 / AREN0533; SIOP-RTSG UMBRELLA',
        };
        return {
          statusText: highRiskWilms ? 'ENDÄ°KE: WILMS TÃœMÃ–RÃœNDE EVRE / HÄ°STOLOJÄ°YE GÃ–RE PEDÄ°ATRÄ°K RT' : 'RÄ°SK UYARLI Ä°ZLEM: ERKEN EVRE WILMS TÃœMÃ–RÃœNDE RT GEREKMEYEBÄ°LÄ°R',
          badgeClass: highRiskWilms ? 'bg-emerald-50 text-emerald-800 border-emerald-300' : 'bg-slate-100 text-slate-700 border-slate-300',
          primaryScheme: wilms,
          alternativeSchemes: [wilms],
        };
      }

      if (pediatricSubtype === 'Neuroblastom') {
        const neuroblastoma: DoseScheme = {
          id: 'neuroblastoma-primary-216',
          name: '21.6 Gy / 12 fx (YÃ¼ksek Risk Primer Yatak RT)',
          tag: 'NÃ¶roblastom - YÃ¼ksek Risk',
          totalDoseGy: 21.6,
          fractionCount: 12,
          fractionDoseGy: 1.8,
          alphaBeta: 10,
          technique: 'Pediatrik IMRT / proton; bÃ¶brek, karaciÄŸer ve omurilik korumasÄ±',
          indication: 'YÃ¼ksek risk nÃ¶roblastomda primer tÃ¼mÃ¶r yataÄŸÄ±na konsolidatif RT, indÃ¼ksiyon ve transplantasyon/immÃ¼noterapi protokolÃ¼yle koordine edilir.',
          targetVolumes: [{ name: 'CTV_Primary_Bed', doseGy: 21.6, marginMm: 'BaÅŸlangÄ±Ã§ gÃ¶rÃ¼ntÃ¼leme ve protokol sÄ±nÄ±rlarÄ±', anatomical: 'Primer tÃ¼mÃ¶r yataÄŸÄ± ve rezidÃ¼el hastalÄ±k' }],
          oars: [{ organ: 'BÃ¶brekler', metric: 'Dmean', limit: 'MÃ¼mkÃ¼n olduÄŸunca dÃ¼ÅŸÃ¼k', source: 'COG / PENTEC' }, { organ: 'Spinal kord', metric: 'Dmax', limit: 'Protokol sÄ±nÄ±rlarÄ± iÃ§inde', source: 'QUANTEC' }],
          systemicTherapy: 'Ä°ndÃ¼ksiyon kemoterapisi, kÃ¶k hÃ¼cre nakli ve anti-GD2 tedavisiyle protokol uyumu.',
          evidence: 'COG high-risk neuroblastoma protocols; PENTEC',
        };
        return {
          statusText: 'ENDÄ°KE: YÃœKSEK RÄ°SK NÃ–ROBLASTOMDA PRÄ°MER YATAK KONSOLÄ°DASYONU',
          badgeClass: 'bg-emerald-50 text-emerald-800 border-emerald-300',
          primaryScheme: neuroblastoma,
          alternativeSchemes: [neuroblastoma],
        };
      }

      if (pediatricSubtype === 'Ewing') {
        const pediatricEwing: DoseScheme = {
          id: 'pediatric-ewing-558',
          name: '45-55.8 Gy (Ä°ndÃ¼ksiyon KT SonrasÄ± Ewing RT)',
          tag: 'Pediatrik Ewing Sarkomu',
          totalDoseGy: 55.8,
          fractionCount: 31,
          fractionDoseGy: 1.8,
          alphaBeta: 10,
          technique: 'IMRT / proton; baÅŸlangÄ±Ã§taki tÃ¼mÃ¶r hacmi ve kemik yataÄŸÄ± dikkate alÄ±nÄ±r',
          indication: 'Cerrahiye uygun olmayan, rezidÃ¼el veya seÃ§ilmiÅŸ yÃ¼ksek riskli Ewing sarkomunda indÃ¼ksiyon kemoterapisi sonrasÄ± definitif/adjuvan RT; doz ve hacimler protokole gÃ¶re bireyselleÅŸtirilir.',
          targetVolumes: [{ name: 'CTV_Initial_Disease', doseGy: 45, marginMm: 'Pre-KT baÅŸlangÄ±Ã§ hacmine gÃ¶re', anatomical: 'Kemoterapi Ã¶ncesi kemik ve yumuÅŸak doku hastalÄ±ÄŸÄ±' }, { name: 'CTV_Boost', doseGy: 55.8, marginMm: 'RezidÃ¼el hacim', anatomical: 'Post-KT rezidÃ¼el tÃ¼mÃ¶r / yÃ¼ksek risk alanÄ±' }],
          oars: [{ organ: 'BÃ¼yÃ¼me plaklarÄ±', metric: 'Dmean', limit: 'MÃ¼mkÃ¼n olduÄŸunca koru', source: 'PENTEC' }, { organ: 'KomÅŸu eklem', metric: 'V50Gy', limit: 'Hedef hacimle optimize et', source: 'QUANTEC' }],
          systemicTherapy: 'VDC/IE temelli Ã§ok ajanlÄ± kemoterapi protokolÃ¼yle koordine edilir.',
          evidence: 'COG / Euro-EWING protocols; PENTEC',
        };
        return {
          statusText: 'ENDÄ°KE: PEDÄ°ATRÄ°K EWING SARKOMUNDA PROTOKOL UYUMLU LOKAL KONTROL',
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
        tag: isHighRisk ? 'âš¡ YÃ¼ksek Risk CSI' : 'ğŸ›¡ï¸ Standart Risk CSI',
        totalDoseGy: boostDose,
        fractionCount: 30,
        fractionDoseGy: 1.8,
        alphaBeta: 10,
        technique: 'Proton Beam veya VMAT (Kraniyospinal Eksen IÅŸÄ±nlama)',
        indication: 'Medulloblastomda nÃ¶roaksiyel yayÄ±lÄ±mÄ± Ã¶nlemek iÃ§in kraniyospinal aks Ä±ÅŸÄ±nlanÄ±r, ardÄ±ndan tÃ¼mÃ¶r yataÄŸÄ± 54 Gy\'e tamamlanÄ±r.',
        targetVolumes: [
          { name: 'CTV_CSI', doseGy: csiDose, marginMm: 'TÃ¼m nÃ¶roaksis', anatomical: 'TÃ¼m beyin, tekal kese ve kauda ekuina sonlanÄ±mÄ±na kadar' },
          { name: 'PTV_Boost', doseGy: boostDose, marginMm: 'Kavite + 15 mm', anatomical: 'Posterior fossa tÃ¼mÃ¶r yataÄŸÄ±' },
        ],
        oars: [
          { organ: 'Koklea', metric: 'Dmean', limit: '< 35 Gy', source: 'PENTEC (Ä°ÅŸitme kaybÄ±)' },
          { organ: 'Tiroid / Kalp', metric: 'ALARA', limit: 'Minimal doz', source: 'PENTEC' },
        ],
        systemicTherapy: 'Kemoterapi protokolleri (Cisplatin, Lomustine, Vincristine).',
        evidence: 'SIOP PNET 4, COG A9961',
      };
      return {
        statusText: 'ENDÄ°KE: KRANÄ°YOSPÄ°NAL AKS VE TÃœMÃ–R YATAÄI BOOST (CSI)',
        badgeClass: 'bg-emerald-50 text-emerald-800 border-emerald-300 shadow-[0_0_15px_rgba(16,185,129,0.25)]',
        primaryScheme: pediaScheme,
        alternativeSchemes: [pediaScheme],
      };
    }

    const createFocusedPlan = (
      id: string,
      name: string,
      totalDoseGy: number,
      fractionCount: number,
      tag: string,
      anatomy: string,
      indication: string,
      technique = '3D-CRT / IMRT / IGRT',
    ): DoseScheme => ({
      id,
      name,
      tag,
      totalDoseGy,
      fractionCount,
      fractionDoseGy: totalDoseGy / fractionCount,
      alphaBeta: 10,
      technique,
      indication,
      targetVolumes: [
        { name: 'GTV', doseGy: totalDoseGy, marginMm: 'GÃ¶rÃ¼ntÃ¼leme ve klinik semptomla tanÄ±mlanÄ±r', anatomical: anatomy },
        { name: 'CTV', doseGy: totalDoseGy, marginMm: 'Anatomik yayÄ±lÄ±m; elektif nodal hacim rutin deÄŸildir', anatomical: `${anatomy} ve gerekli komÅŸu risk alanÄ±` },
        { name: 'PTV', doseGy: totalDoseGy, marginMm: 'Hareket yÃ¶netimi ve gÃ¼nlÃ¼k IGRT ile belirlenir', anatomical: 'Set-up ve organ hareketi gÃ¼venlik marjini' },
      ],
      oars: [{ organ: 'Kritik komÅŸu organlar', metric: 'Dmax / Dmean', limit: 'Ã–nceki RT ve gÃ¼ncel protokole gÃ¶re doÄŸrula', source: 'QUANTEC / kurumsal protokol' }],
      evidence: 'ASTRO / ESTRO; aktif kÄ±lavuz sÃ¼rÃ¼mÃ¼ ve kurum protokolÃ¼ doÄŸrulanmalÄ±dÄ±r.',
    });

    if (selectedOrgan === 'emergencies') {
      const emergencyPlans: Record<string, { status: string; primary: DoseScheme; alternatives: DoseScheme[] }> = {
        'emergency-mscc': {
          status: 'ACÄ°L: SPÄ°NAL KORD BASISI (MSCC)',
          primary: createFocusedPlan('mscc-20-5', '20 Gy / 5 fx Â· MSCC acil RT', 20, 5, 'Deksametazon + cerrahi uygunluk deÄŸerlendirmesi', 'MRI ile tanÄ±mlanan vertebral metastaz ve epidural hastalÄ±k', 'Deksametazon 16 mg IV stat, ardÄ±ndan 4 mg IV/PO 6 saatte bir. Tek seviyeli kompresyon ve uygun performansta Patchell cerrahi/dekompresyon kriterlerini deÄŸerlendir.', 'Acil IMRT / 3D-CRT + gÃ¼nlÃ¼k IGRT'),
          alternatives: [
            createFocusedPlan('mscc-8-1', '8 Gy / 1 fx Â· kÄ±sa prognoz / cerrahiye uygun deÄŸil', 8, 1, 'Tek fraksiyon', 'MRI ile tanÄ±mlanan semptomatik vertebra ve epidural uzanÄ±m', 'NÃ¶rolojik durum, instabilite, Ã¶nceki RT ve cerrahi uygunlukla birlikte seÃ§ilir.'),
            createFocusedPlan('mscc-30-10', '30 Gy / 10 fx Â· seÃ§ilmiÅŸ uygun prognoz', 30, 10, 'Ã‡oklu fraksiyon', 'MRI ile tanÄ±mlanan vertebral metastaz ve epidural hastalÄ±k', 'Cerrahi/postoperatif plan, kÃ¼mÃ¼latif kord dozu ve prognoz MDT ile deÄŸerlendirilir.'),
          ],
        },
        'emergency-svcs': {
          status: 'ACÄ°L: VENA KAVA SUPERIOR SENDROMU',
          primary: createFocusedPlan('svcs-30-10', '30 Gy / 10 fx Â· Ã¶ne yÃ¼klemeli torasik RT', 30, 10, 'Ä°lk 2-3 fx: 3-4 Gy/fx, sonra tamamla', 'Vena kava superior obstrÃ¼ksiyonuna neden olan primer kitle ve semptomatik nodal hastalÄ±k', 'Ä°lk 2-3 fraksiyonda 3-4 Gy/fx Ã¶ne yÃ¼kleme, ardÄ±ndan toplam 30 Gy / 10 fx tamamlanmasÄ± Ã¶rnek bir yaklaÅŸÄ±mdÄ±r; stabil hastada histoloji ve stent/sistemik tedavi seÃ§enekleri deÄŸerlendirilir.'),
          alternatives: [createFocusedPlan('svcs-20-5', '20 Gy / 5 fx Â· kÄ±sa prognozda', 20, 5, 'Ä°lk 2 fx Ã¶ne yÃ¼kleme, sonra tamamla', 'Vena kava superior obstrÃ¼ksiyonuna neden olan makroskopik torasik kitle', 'Histoloji, semptom ÅŸiddeti ve klinik yanÄ±tla uyarlanÄ±r.')],
        },
        'emergency-airway': {
          status: 'ACÄ°L: TRAKEA / KARÄ°NA HAVAYOLU OBSTRÃœKSÄ°YONU',
          primary: createFocusedPlan('airway-17-2', '16-17 Gy / 2 fx Â· dekompresif RT', 17, 2, 'Stridor / asfiksi riski', 'Trakea, ana bronÅŸ veya karinayÄ± daraltan makroskopik tÃ¼mÃ¶r', 'Stridor veya asfiksi riski varsa hava yolu gÃ¼venliÄŸi ve giriÅŸimsel bronkoskopi RTâ€™yi geciktirmeden deÄŸerlendirilir.'),
          alternatives: [
            createFocusedPlan('airway-8-1', '8 Gy / 1 fx Â· hÄ±zlÄ± kÄ±sa ÅŸema', 8, 1, 'Tek fraksiyon', 'Hava yolunu daraltan makroskopik tÃ¼mÃ¶r', 'Anestezi, gÃ¶ÄŸÃ¼s hastalÄ±klarÄ± ve giriÅŸimsel bronkoskopiyle acil hava yolu yÃ¶netimi gerekir.'),
            createFocusedPlan('airway-20-5', '20 Gy / 5 fx Â· seÃ§ilmiÅŸ hasta', 20, 5, 'Ã‡oklu fraksiyon', 'Hava yolunu daraltan makroskopik tÃ¼mÃ¶r', 'Klinik stabilite ve toleransa gÃ¶re seÃ§ilir.'),
          ],
        },
        'emergency-hemorrhage': {
          status: 'ACÄ°L: MASÄ°F HEMORAJÄ° / HEMOSTATÄ°K RT',
          primary: createFocusedPlan('hemorrhage-8-1', '8 Gy / 1 fx Â· hemostatik RT', 8, 1, 'HÄ±zlÄ± hemostaz', 'Hemoptizi, jinekolojik kanama veya hematÃ¼ri odaÄŸÄ±ndaki makroskopik tÃ¼mÃ¶r', 'ResÃ¼sitasyon ve kanama odaÄŸÄ±nÄ±n endoskopik/giriÅŸimsel kontrolÃ¼ Ã¶nceliklidir; RT bunlarÄ± geciktirmemelidir.'),
          alternatives: [createFocusedPlan('hemorrhage-14-8-4', '14.8 Gy / 4 fx BID Â· en az 6 saat ara', 14.8, 4, 'Quad Shot hemostatik ÅŸema', 'Kanayan makroskopik tÃ¼mÃ¶r ve gerekli anatomik komÅŸuluk', 'Kanama odaÄŸÄ± ve klinik stabiliteye gÃ¶re seÃ§ilir.')],
        },
        'emergency-icp': {
          status: 'ACÄ°L: AKUT KÄ°BAS / BEYÄ°N HERNIASYONU',
          primary: createFocusedPlan('icp-20-5', '20 Gy / 5 fx Â· acil WBRT', 20, 5, 'Mannitol %20 + deksametazon + stabilizasyon', 'TÃ¼m beyin parankimi; kontrastlÄ± beyin MRI/BT ile metastaz deÄŸerlendirmesi', 'Hava yolu/nÃ¶rolojik stabilizasyon, mannitol %20, deksametazon ve acil nÃ¶roÅŸirÃ¼rji deÄŸerlendirmesi RT ile eÅŸzamanlÄ± yÃ¼rÃ¼tÃ¼lÃ¼r.'),
          alternatives: [createFocusedPlan('icp-30-10', '30 Gy / 10 fx Â· uygun prognozda WBRT', 30, 10, 'Ã‡oklu fraksiyon', 'TÃ¼m beyin parankimi; lens ve optik yapÄ±lar doz optimizasyonuna alÄ±nÄ±r', 'Cerrahi veya SRS uygunluÄŸu gecikmeden deÄŸerlendirilir; prognoz ve sistemik seÃ§eneklere gÃ¶re seÃ§ilir.')],
        },
      };
      const selectedPlan = emergencyPlans[selectedSubsite] ?? emergencyPlans['emergency-mscc'];
      return {
        statusText: selectedPlan.status,
        badgeClass: 'bg-rose-50 text-rose-900 border-rose-300 shadow-[0_0_15px_rgba(244,63,94,0.2)]',
        primaryScheme: selectedPlan.primary,
        alternativeSchemes: [selectedPlan.primary, ...selectedPlan.alternatives],
      };
    }

    if (selectedOrgan === 'palliative') {
      const palliativePlans: Record<'Agri' | 'Beyin' | 'Organ', { status: string; primary: DoseScheme; alternatives: DoseScheme[] }> = {
        Agri: {
          status: 'ENDÄ°KE: KEMÄ°K METASTAZI AÄRI PALYASYONU',
          primary: createFocusedPlan('bone-palliation-8-1', '8 Gy / 1 fx Â· kategori 1 analjezi', 8, 1, 'Kemik metastazÄ±', 'Semptomatik kemik metastazÄ±; gÃ¶rÃ¼ntÃ¼leme ile tanÄ±mlanan lezyon', '8 Gy tek fraksiyon etkili aÄŸrÄ± palyasyonu saÄŸlar; yeniden Ä±ÅŸÄ±nlama ve kÄ±rÄ±k/instabilite riski ayrÄ±ca deÄŸerlendirilir.'),
          alternatives: [
            createFocusedPlan('bone-palliation-20-5', '20 Gy / 5 fx Â· Ã§oklu fraksiyon', 20, 5, 'Alternatif analjezik ÅŸema', 'Semptomatik kemik metastazÄ±', 'Prognoz, Ã¶nceki RT ve hasta tercihiyle seÃ§ilir.'),
            createFocusedPlan('bone-palliation-sbrt', 'SBRT Â· seÃ§ilmiÅŸ oligo-metastatik hedef', 30, 5, 'SBRT / IGRT', 'SÄ±nÄ±rlÄ± sayÄ±da, uygun anatomideki metastatik hedef', 'SBRT; kord basÄ±sÄ±, instabilite ve kÄ±rÄ±k riski dÄ±ÅŸlandÄ±ktan sonra seÃ§ilmiÅŸ hastada deÄŸerlendirilir.', 'SBRT / IGRT'),
          ],
        },
        Beyin: {
          status: 'ELEKTÄ°F: BEYÄ°N METASTAZI Â· SRS / WBRT',
          primary: createFocusedPlan('brain-ha-wbrt-30-10', '30 Gy / 10 fx Â· HA-WBRT + memantin', 30, 10, 'Elektif beyin metastazÄ±', 'TÃ¼m beyin; hipokampus korumasÄ± uygunsa HA-WBRT planlanÄ±r', 'Hipokampus korumasÄ± ve memantin biliÅŸsel korunma iÃ§in deÄŸerlendirilir; 1-4 uygun lezyonda SRS tercih Ã¶lÃ§Ã¼tleri multidisipliner doÄŸrulanÄ±r.'),
          alternatives: [createFocusedPlan('brain-srs-27-3', '27 Gy / 3 fx Â· seÃ§ilmiÅŸ SRS/FSRT', 27, 3, 'SRS / FSRT', 'SÄ±nÄ±rlÄ± sayÄ±da ve boyutta beyin metastazÄ±; MRI tabanlÄ± GTV/CTV/PTV', 'Lezyon sayÄ±sÄ±, hacmi, yerleÅŸimi, semptomlar ve sistemik tedaviye gÃ¶re SRS/FSRT uygunluÄŸu deÄŸerlendirilir.', 'SRS / IGRT')],
        },
        Organ: {
          status: 'ENDÄ°KE: ORGAN / YUMUÅAK DOKU METASTAZI PALYASYONU',
          primary: createFocusedPlan('soft-tissue-palliation-20-5', '20 Gy / 5 fx Â· organ / yumuÅŸak doku palliasyonu', 20, 5, 'Semptomatik viseral veya yumuÅŸak doku hedefi', 'KaraciÄŸer kapsÃ¼l aÄŸrÄ±sÄ±, pelvik kitle veya semptomatik yumuÅŸak doku metastazÄ±', 'Semptomatik makroskopik hedef ve gerekli anatomik komÅŸuluk Ä±ÅŸÄ±nlanÄ±r; elektif nodal alan rutin deÄŸildir.'),
          alternatives: [createFocusedPlan('soft-tissue-palliation-8-1', '8 Gy / 1 fx Â· kÄ±sa semptomatik ÅŸema', 8, 1, 'KÄ±sa prognoz / hÄ±zlÄ± palyasyon', 'Semptomatik viseral veya yumuÅŸak doku metastazÄ±', 'Organ toleransÄ±, Ã¶nceki RT ve kanama/obstrÃ¼ksiyon riski doÄŸrulanÄ±r.')],
        },
      };
      const selectedPlan = palliativePlans[palliativeIntent];
      return {
        statusText: selectedPlan.status,
        badgeClass: 'bg-teal-50 text-teal-900 border-teal-300',
        primaryScheme: selectedPlan.primary,
        alternativeSchemes: [selectedPlan.primary, ...selectedPlan.alternatives],
      };
    }
    const palDose = selectedN === 'TekFx' ? 8 : 20;
    const palFx = palDose === 8 ? 1 : 5;
    const palScheme: DoseScheme = {
      id: `palliative-${palDose}`,
      name: `${palDose} Gy / ${palFx} fx (Palyatif AÄŸrÄ± / Kitle KontrolÃ¼)`,
      tag: palDose === 8 ? 'ğŸ¯ 8 Gy Tek Fraksiyon (Kategori 1)' : 'ğŸ›¡ï¸ 20 Gy / 5 fx Fraksiyone',
      totalDoseGy: palDose,
      fractionCount: palFx,
      fractionDoseGy: palDose === 8 ? 8 : 4,
      alphaBeta: 10,
      technique: '3D-CRT / Basit Konformal',
      indication: palDose === 8
        ? 'AÄŸrÄ±lÄ± kemik metastazlarÄ±nda 8 Gy tek fraksiyon, Ã§oklu fraksiyonlarla eÅŸit aÄŸrÄ± palyasyonu saÄŸlar; hasta ve yakÄ±nlarÄ± iÃ§in en yÃ¼ksek konforu sunar (Kategori 1).'
        : 'Spinal kord basÄ±sÄ± veya uzun saÄŸkalÄ±m beklenen oligometastatik olgularda Ã§oklu fraksiyon re-treatment oranÄ±nÄ± dÃ¼ÅŸÃ¼rÃ¼r.',
      targetVolumes: [{ name: 'GTV_Palliative', doseGy: palDose, marginMm: '0 mm', anatomical: 'Metastatik lezyon' }],
      oars: [{ organ: 'Spinal Kord', metric: 'Dmax', limit: palDose === 8 ? '< 8 Gy' : '< 18 Gy', source: 'QUANTEC' }],
      evidence: 'ASTRO Bone Metastases Guidelines, Chow et al. Meta-analysis',
    };
    return {
      statusText: 'ENDÄ°KE: HIZLI VE ETKÄ°N PALYATÄ°F RADYOTERAPÄ°',
      badgeClass: 'bg-indigo-50 text-indigo-800 border-indigo-300',
      primaryScheme: palScheme,
      alternativeSchemes: [palScheme],
    };
  }, [
    selectedOrgan,
    selectedSubsite,
    lang,
    benignClinicalStatus,
    selectedT,
    selectedN,
    selectedM,
    palliativeIntent,
    thoraxSubtype,
    thoraxCentrality,
    breathingMotion,
    thoraxSurgeryStatus,
    sclcStage,
    sclcTiming,
    thymomaStage,
    thymomaMargin,
    thymicHistology,
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
    gliomaGrade,
    gliomaHistology,
    gliomaRiskFactors,
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
    liverHistology,
    liverBclcStage,
    biliaryHistology,
    biliaryTreatmentSetting,
    biliaryMarginStatus,
    gisCrmStatus,
    gusSubtype,
    renalDiseaseSetting,
    testisHistology,
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
    renalTumorSizeCm,
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

  // Aktif Åema
    const baseActiveScheme = useMemo(() => {
      const list = evaluatedDecision.alternativeSchemes;
      return list.find(s => s.id === selectedSchemeId) || evaluatedDecision.primaryScheme;
    }, [evaluatedDecision, selectedSchemeId]);
    const isSclcTurrisiScheme = useMemo(() => selectedOrgan === 'thorax'
      && thoraxSubtype === 'sclc'
      && baseActiveScheme.id === 'sclc-turrisi-45',
    [selectedOrgan, thoraxSubtype, baseActiveScheme]);

  // Fraksiyonasyon felsefesi kartlarÄ± iÃ§in klinik uygunluk kapÄ±sÄ±
  const isRegimenEligible = (regimen: 'sbrt' | 'moderate' | 'sib' | 'conventional'): boolean => {
    if (selectedOrgan === 'prostate') {
      const lowBurden = gusSubtype === 'prostate' && selectedN === 'N0' && selectedM === 'M0' && !hasSVI && selectedT !== 'T3b' && selectedT !== 'T4';
      if (regimen === 'sbrt') return lowBurden;
      if (regimen === 'sib') return gusSubtype === 'prostate' && (selectedN === 'N1' || hasSVI || hasECE || selectedT === 'T3a' || selectedT === 'T3b' || selectedT === 'T4');
      return true;
    }
    if (selectedOrgan === 'thorax') {
      const earlyStage = thoraxSubtype === 'nsclc' && selectedM === 'M0' && selectedN === 'N0' && (selectedT.startsWith('T1') || selectedT === 'T2');
      if (regimen === 'sbrt' || regimen === 'moderate') return earlyStage;
      if (regimen === 'sib') return thoraxSubtype === 'nsclc' && !earlyStage && selectedM === 'M0';
      return true;
    }
    if (selectedOrgan === 'breast') {
      const bcsCandidate = breastSurgery === 'MKC' && breastHistology !== 'Ä°nflamatuar Meme Kanseri (IBC)' && breastHistology !== 'Malign Filloides TÃ¼mÃ¶rÃ¼';
      if (regimen === 'sbrt' || regimen === 'moderate' || regimen === 'sib') return bcsCandidate;
      return true;
    }
    return true;
  };

  const activeScheme = useMemo(() => {
    const regimenByOrgan: Partial<Record<OrganId, Record<Exclude<QuickCaseRegimen, 'clinical'>, { name: string; totalDoseGy: number; fractionCount: number; fractionDoseGy: number; alphaBeta: number }>>> = {
      prostate: {
        sbrt: { name: 'Ultra-Hypofractionated / SBRT (PACE-B)', totalDoseGy: 36.25, fractionCount: 5, fractionDoseGy: 7.25, alphaBeta: 1.5 },
        moderate: { name: 'Moderate Hypofractionation (CHHiP / PROFIT)', totalDoseGy: 60, fractionCount: 20, fractionDoseGy: 3, alphaBeta: 1.5 },
        sib: { name: 'SIB Boost: Prostate 70 Gy + Pelvic Nodes 56 Gy / 28 fx', totalDoseGy: 70, fractionCount: 28, fractionDoseGy: 2.5, alphaBeta: 1.5 },
        conventional: { name: 'Conventional Prostate RT', totalDoseGy: 78, fractionCount: 39, fractionDoseGy: 2, alphaBeta: 1.5 },
      },
      thorax: {
        sbrt: { name: 'Lung SBRT (54 Gy / 3 fx)', totalDoseGy: 54, fractionCount: 3, fractionDoseGy: 18, alphaBeta: 10 },
        moderate: { name: 'Lung Hypofractionation (50 Gy / 5 fx)', totalDoseGy: 50, fractionCount: 5, fractionDoseGy: 10, alphaBeta: 10 },
        sib: { name: 'Concurrent Chemoradiotherapy (60 Gy / 30 fx)', totalDoseGy: 60, fractionCount: 30, fractionDoseGy: 2, alphaBeta: 10 },
        conventional: isSclcTurrisiScheme
          ? {
              name: lang === 'tr'
                ? 'Akselere Hiperfraksiyonasyon (1.5 Gy BID / 30 fx, â‰¥ 6 saat ara) Â· Turrisi'
                : 'Accelerated hyperfractionation (1.5 Gy BID / 30 fx, â‰¥ 6 hours apart) Â· Turrisi',
              totalDoseGy: 45,
              fractionCount: 30,
              fractionDoseGy: 1.5,
              alphaBeta: 10,
            }
          : { name: 'Conventional Thoracic RT (60 Gy / 30 fx)', totalDoseGy: 60, fractionCount: 30, fractionDoseGy: 2, alphaBeta: 10 },
      },
      breast: {
        sbrt: { name: 'Ultra-Hypofractionation (FAST-Forward)', totalDoseGy: 26, fractionCount: 5, fractionDoseGy: 5.2, alphaBeta: 4 },
        moderate: { name: 'Moderate Hypofractionation (40.05 Gy / 15 fx)', totalDoseGy: 40.05, fractionCount: 15, fractionDoseGy: 2.67, alphaBeta: 4 },
        sib: { name: 'Whole Breast 40.05 Gy + Cavity SIB 48 Gy / 15 fx', totalDoseGy: 40.05, fractionCount: 15, fractionDoseGy: 2.67, alphaBeta: 4 },
        conventional: { name: 'Conventional Breast RT (50 Gy / 25 fx)', totalDoseGy: 50, fractionCount: 25, fractionDoseGy: 2, alphaBeta: 4 },
      },
    };
    if (selectedRegimen === 'clinical') return baseActiveScheme;
    const regimen = regimenByOrgan[selectedOrgan]?.[selectedRegimen];
    if (!regimen || !isRegimenEligible(selectedRegimen)) return baseActiveScheme;
    return {
      ...baseActiveScheme,
      id: `${baseActiveScheme.id}-${selectedRegimen}`,
      name: regimen.name,
      tag: regimen.name,
      totalDoseGy: regimen.totalDoseGy,
      fractionCount: regimen.fractionCount,
      fractionDoseGy: regimen.fractionDoseGy,
      alphaBeta: regimen.alphaBeta,
      // YalnÄ±zca primer hedef hacim dozu felsefeye uyarlanÄ±r; nodal/boost seviyeleri korunur
      targetVolumes: baseActiveScheme.targetVolumes.map(volume => {
        if (selectedOrgan === 'breast' && selectedRegimen === 'sib' && /boost|tumor.?bed|kavite/i.test(`${volume.name} ${volume.anatomical}`)) {
          return { ...volume, doseGy: 48 };
        }
        if (selectedOrgan === 'prostate' && selectedRegimen === 'sib' && /pelvic|pelvis|pelvik|nodal|lenf nod/i.test(`${volume.name} ${volume.anatomical}`)) {
          return { ...volume, doseGy: 56 };
        }
        return {
          ...volume,
          doseGy: volume.doseGy === baseActiveScheme.totalDoseGy ? regimen.totalDoseGy : volume.doseGy,
        };
      }).concat(selectedOrgan === 'prostate' && selectedRegimen === 'sib' ? [{
        name: 'PTV_Pelvic_Nodes',
        doseGy: 56,
        marginMm: 'Elective nodal CTV->PTV +5 mm',
        anatomical: 'Pelvik elektif lenf nodlarÄ±; uygun evreleme ve gÃ¶rÃ¼ntÃ¼lemeyle',
      }] : []),
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [baseActiveScheme, selectedOrgan, selectedRegimen, selectedT, selectedN, selectedM, thoraxSubtype, gusSubtype, hasSVI, hasECE, breastSurgery, breastHistology, lang]);

  // CanlÄ± Radyobiyoloji HesabÄ±
  const radiobiology = useMemo(() => {
    const D = activeScheme.totalDoseGy;
    const d = activeScheme.fractionDoseGy;
    const ab = activeScheme.alphaBeta;
    if (D <= 0 || d <= 0) return { bed: '0.0', eqd2: '0.0', ab };
    const bed = D * (1 + d / ab);
    const eqd2 = D * ((d + ab) / (2 + ab));
    return { bed: bed.toFixed(1), eqd2: eqd2.toFixed(1), ab };
  }, [activeScheme]);

  const radiobiologyByAlphaBeta = useMemo(() => [10, 3].map(ab => {
    const D = activeScheme.totalDoseGy;
    const d = activeScheme.fractionDoseGy;
    if (D <= 0 || d <= 0) return { bed: '0.0', eqd2: '0.0', ab };
    const bed = D * (1 + d / ab);
    const eqd2 = bed / (1 + 2 / ab);
    return { bed: bed.toFixed(1), eqd2: eqd2.toFixed(1), ab };
  }), [activeScheme]);

  const clinicallyRelevantOars = useMemo(() => {
    const verifiedGuidance = getVerifiedOarGuidance(selectedOrgan, selectedSubsite, activeScheme, lang);
    const existingOarKeys = new Set(activeScheme.oars.map(oar =>
      `${oar.organ.trim().toLocaleLowerCase('tr-TR')}|${oar.metric.trim().toLocaleLowerCase('tr-TR')}`
    ));
    const additionalGuidance = verifiedGuidance.filter(oar =>
      !existingOarKeys.has(`${oar.organ.trim().toLocaleLowerCase('tr-TR')}|${oar.metric.trim().toLocaleLowerCase('tr-TR')}`)
    );
    return [...activeScheme.oars, ...additionalGuidance];
  }, [activeScheme, selectedOrgan, selectedSubsite, lang]);

  const radiobiologyComparison = useMemo(() => {
    const referenceDose = activeScheme.totalDoseGy;
    const referenceFractionDose = activeScheme.fractionDoseGy;
    const referenceAlphaBeta = activeScheme.alphaBeta;
    const referenceTumorBed = referenceDose * (1 + referenceFractionDose / referenceAlphaBeta);
    const referenceTumorEqd2 = referenceTumorBed / (1 + 2 / referenceAlphaBeta);
    const referenceLateBed = referenceDose * (1 + referenceFractionDose / 3);
    const referenceLateEqd2 = referenceLateBed / (1 + 2 / 3);
    const comparisonDose = comparisonFractions * comparisonDosePerFraction;
    const comparisonTumorBed = comparisonDose * (1 + comparisonDosePerFraction / comparisonAlphaBeta);
    const comparisonTumorEqd2 = comparisonTumorBed / (1 + 2 / comparisonAlphaBeta);
    const comparisonLateBed = comparisonDose * (1 + comparisonDosePerFraction / 3);
    const comparisonLateEqd2 = comparisonLateBed / (1 + 2 / 3);

    return {
      reference: {
        dose: referenceDose,
        fractions: activeScheme.fractionCount,
        fractionDose: referenceFractionDose,
        alphaBeta: referenceAlphaBeta,
        tumorBed: referenceTumorBed,
        tumorEqd2: referenceTumorEqd2,
        lateBed: referenceLateBed,
        lateEqd2: referenceLateEqd2,
      },
      comparison: {
        dose: comparisonDose,
        tumorBed: comparisonTumorBed,
        tumorEqd2: comparisonTumorEqd2,
        lateBed: comparisonLateBed,
        lateEqd2: comparisonLateEqd2,
      },
      tumorEqd2Delta: comparisonTumorEqd2 - referenceTumorEqd2,
      tumorEqd2DeltaPercent: referenceTumorEqd2 === 0 ? 0 : ((comparisonTumorEqd2 - referenceTumorEqd2) / referenceTumorEqd2) * 100,
      lateBedDelta: comparisonLateBed - referenceLateBed,
    };
  }, [activeScheme, comparisonAlphaBeta, comparisonDosePerFraction, comparisonFractions]);

  const openRadiobiologyModal = () => {
    setComparisonDosePerFraction(Math.min(20, Math.max(1.8, activeScheme.fractionDoseGy)));
    setComparisonFractions(Math.min(40, Math.max(1, activeScheme.fractionCount)));
    setComparisonAlphaBeta(activeScheme.alphaBeta);
    setRemainingTreatmentFractions(Math.min(40, Math.max(1, activeScheme.fractionCount)));
    setIsRadiobiologyModalOpen(true);
  };

  const prognosticResult = useMemo(
    () => calculatePrognosticIndex(
      selectedOrgan,
      selectedSubsite || (selectedOrgan === 'cns' ? cnsSubtype : ''),
      selectedT,
      selectedN,
      selectedM,
      {
        kps: Number.parseInt(cnsKps, 10),
        psa: Number.parseFloat(psaLevel),
        gleasonPrimary: Number.parseInt(gleasonPrimary, 10),
        gleasonSecondary: Number.parseInt(gleasonSecondary, 10),
        positiveCorePercent: Number.parseFloat(positiveCorePercent),
        grade: Number.parseInt(breastGrade, 10),
        er: breastER,
        pr: breastPR,
        her2: breastHER2,
        ki67: Number.parseFloat(breastKi67),
      },
    ),
    [
      breastER,
      breastGrade,
      breastHER2,
      breastKi67,
      breastPR,
      cnsKps,
      cnsSubtype,
      gleasonPrimary,
      gleasonSecondary,
      positiveCorePercent,
      psaLevel,
      selectedM,
      selectedN,
      selectedOrgan,
      selectedSubsite,
      selectedT,
    ],
  );
  const prognosticOutcome = prognosticResult?.medianSurvivalOrRecurrence ?? '';
  const hasLocalControlEstimate = /local control|lokal kontrol/i.test(prognosticOutcome);
  const hasMedianOsEstimate = /median\s*(?:overall\s*)?(?:os|survival)/i.test(prognosticOutcome);

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
    [activeScheme, lang, selectedM, selectedN, selectedOrgan, selectedSubsite, selectedT, tText],
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
      () => window.alert(lang === 'tr' ? 'Vaka sorusu panoya kopyalanamadÄ±.' : 'The case prompt could not be copied.'),
    );
  };
  const handleFileProcess = (file: File) => {
    if (!file) return;
    setUploadedFileName(file.name);
    const isTextFile = file.type.startsWith('text/') || /\.(txt|csv|json|xml|html?)$/i.test(file.name);
    if (!isTextFile) {
      window.alert(lang === 'tr'
        ? 'Bu dosya tÃ¼rÃ¼ seÃ§ildi ancak tarayÄ±cÄ±da doÄŸrudan metin Ã§Ä±karÄ±lamÄ±yor. PDF/DOC/GÃ¶rsel iÃ§eriÄŸini OCR veya metin olarak aÅŸaÄŸÄ±daki alana yapÄ±ÅŸtÄ±rÄ±n.'
        : 'This file type was selected, but direct browser text extraction is unavailable. Paste PDF/DOC/image content as OCR or text below.');
      return;
    }
    const reader = new FileReader();
    reader.onload = event => {
      const raw = event.target?.result;
      if (typeof raw !== 'string') {
        window.alert(lang === 'tr' ? 'Dosya metni okunamadÄ±.' : 'The file text could not be read.');
        return;
      }
      setReportInputText(raw);
      setParsedData(raw.trim().length > 10 ? parseMedicalReport(raw) : null);
    };
    reader.onerror = () => {
      window.alert(lang === 'tr' ? 'Dosya okunurken hata oluÅŸtu.' : 'An error occurred while reading the file.');
    };
    reader.readAsText(file);
  };
  const copyCaseContext = () => {
    const prompt = `${casePrompt}\n\nPlease answer as a consultant reviewing this active case.`;
    if (!navigator.clipboard) {
      window.alert(lang === 'tr' ? 'Panoya kopyalama desteklenmiyor.' : 'Clipboard access is not supported.');
      return false;
    }
    void navigator.clipboard.writeText(prompt).then(
      () => {
        setCopiedContext(true);
        window.setTimeout(() => setCopiedContext(false), 3000);
      },
      () => window.alert(lang === 'tr' ? 'Vaka baÄŸlamÄ± panoya kopyalanamadÄ±.' : 'The case context could not be copied.'),
    );
    return true;
  };
  const getAiUrl = () => {
    if (activeAiTab === 'gemini') return 'https://gemini.google.com';
    if (activeAiTab === 'chatgpt') return 'https://chatgpt.com';
    return 'https://claude.ai';
  };
  const openSelectedAi = () => {
    const aiUrls = {
      gemini: 'https://gemini.google.com',
      chatgpt: 'https://chatgpt.com',
      claude: 'https://claude.ai',
    };
    if (copyCaseContext()) {
      window.open(aiUrls[activeAiTab], 'ai_dock', 'width=480,height=900,left=1400');
    }
  };

  // Klinik Rapor Metni Kopyalama
  const clinicalSummaryText = useMemo(() => {
    const labels = {
      clinicalSummary: lang === 'tr' ? 'KLÄ°NÄ°K KARAR VE REÃ‡ETE Ã–ZETÄ°' : 'CLINICAL DECISION AND PRESCRIPTION SUMMARY',
      organSystem: lang === 'tr' ? 'Organ Sistemi' : 'Organ System',
      subsite: lang === 'tr' ? 'Alt Tip' : 'Subsite',
      stage: lang === 'tr' ? 'Evreleme' : 'Stage',
      decision: lang === 'tr' ? 'Karar Durumu' : 'Decision',
      prescription: lang === 'tr' ? 'Ã–nerilen ReÃ§ete' : 'Recommended Prescription',
      totalDose: lang === 'tr' ? 'Toplam Doz' : 'Total Dose',
      fraction: lang === 'tr' ? 'Fraksiyon' : 'Fraction',
      technique: lang === 'tr' ? 'Teknik' : 'Technique',
      radiobiology: lang === 'tr' ? 'Radyobiyoloji' : 'Radiobiology',
      oarConstraints: lang === 'tr' ? 'Kritik Organ KÄ±sÄ±tlarÄ±' : 'Organs-at-Risk Constraints',
      evidence: lang === 'tr' ? 'KanÄ±t ve KÄ±lavuz' : 'Evidence and Guidelines',
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
      bone: 'Bone Tumors',
      sarcoma: 'Soft Tissue Sarcomas',
      'bone-sarcoma': 'Bone and Sarcoma',
      skin: 'Skin',
      hematologic: 'Hematologic',
      pediatric: 'Pediatric',
      palliative: 'Palliative',
      emergencies: 'Oncologic Emergencies',
      benign: 'Benign Conditions',
    };
    let subInfo = '';
    if (selectedOrgan === 'thorax') subInfo = `${labels.subsite}: ${tText(thoraxSubtype)}`;
    if (selectedOrgan === 'gynecology') subInfo = `${labels.subsite}: ${tText(gynSite)}`;
    if (selectedOrgan === 'bone' || selectedOrgan === 'sarcoma' || selectedOrgan === 'bone-sarcoma') subInfo = `${labels.subsite}: ${tText(sarcomaSubtype)}`;
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
${labels.organSystem}: ${lang === 'tr' ? selectedOrgan.toUpperCase() : organNames[selectedOrgan]} (${patientAgeYears ? `${lang === 'tr' ? 'YaÅŸ' : 'Age'} ${patientAgeYears}; ` : ''}${subInfo})
${labels.stage}: ${selectedOrgan === 'emergencies' || selectedOrgan === 'palliative' ? (lang === 'tr' ? 'Uygulanmaz' : 'Not applicable') : `${selectedT} ${selectedN} ${selectedM}`}
${labels.decision}: ${tText(evaluatedDecision.statusText)}
${labels.prescription}: ${tText(activeScheme.name)} [${tText(activeScheme.tag)}]
${labels.totalDose}: ${activeScheme.totalDoseGy} Gy | ${labels.fraction}: ${activeScheme.fractionCount} ${labels.fx} (${activeScheme.fractionDoseGy} Gy/${labels.fx})
${labels.technique}: ${tText(activeScheme.technique)}
${labels.radiobiology}: BED: ${radiobiology.bed} Gy | EQD2: ${radiobiology.eqd2} Gy (Î±/Î² = ${radiobiology.ab})
${labels.oarConstraints}:
${clinicallyRelevantOars.map(o => ` * ${tText(o.organ)}: ${tText(o.metric)} ${o.limit}${o.context ? ` [${lang === 'tr' ? o.context : o.contextEn || o.context}]` : ''} (${tText(o.source)})`).join('\n')}
${labels.evidence}: ${tText(activeScheme.evidence)}`;
  }, [
    lang, selectedOrgan, thoraxSubtype, gynSite, sarcomaSubtype, hnSubsite, cnsSubtype, gisOrgan, gusSubtype, patientAgeYears,
    selectedT, selectedN, selectedM, evaluatedDecision, activeScheme, clinicallyRelevantOars, radiobiology,
    hnCrossesMidline, hnDistanceFromMidlineCm, hnDoiMm, cnsSymptoms, cnsKps, cnsResection,
    prostateRiskLabel, psaLevel, gleasonPrimary, gleasonSecondary, positiveCorePercent,
    breastHistology, breastMenopause, breastER, breastPR, breastHER2, breastKi67, breastGrade,
    skinHistology, skinMargin, skinDepthMm, skinPerineuralInvasion, hematologicSubtype,
    myelomaFractionation, pediatricSubtype, pediatricRisk, wilmsStage, tText,
  ]);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(clinicalSummaryText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const printBoardSummary = () => {
    const now = new Date();
    const timestamp = new Intl.DateTimeFormat(lang === 'tr' ? 'tr-TR' : 'en-US', {
      dateStyle: 'medium',
      timeStyle: 'short',
    }).format(now);
    const reportId = `RO-${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}-${String(now.getHours()).padStart(2, '0')}${String(now.getMinutes()).padStart(2, '0')}`;
    setPrintMetadata({ timestamp, reportId });
    window.requestAnimationFrame(() => window.print());
  };

  const saveCaseToArchive = () => {
    const organNames: Record<OrganId, string> = {
      thorax: 'AkciÄŸer/Toraks',
      prostate: 'GÃœS',
      breast: 'Meme',
      gis: 'GÄ°S',
      'head-neck': 'BaÅŸ-Boyun',
      cns: 'MSS',
      gynecology: 'Jinekoloji',
      bone: 'Kemik',
      sarcoma: 'YumuÅŸak Doku',
      'bone-sarcoma': 'Kemik/Sarkom',
      skin: 'Cilt',
      hematologic: 'Hematoloji',
      pediatric: 'Pediatri',
      palliative: 'Palyatif',
      emergencies: 'Onkolojik Aciller',
      benign: 'Benign',
    };
    const diagnosis = selectedOrgan === 'breast'
      ? breastHistology
      : selectedOrgan === 'cns'
        ? cnsSubtype === 'gbm' ? 'Glioblastoma' : cnsSubtype === 'glioma' ? `Glial tÃ¼mÃ¶r ${gliomaGrade.replace('_', ' ')}` : cnsSubtype
        : selectedOrgan === 'bone' || selectedOrgan === 'sarcoma' || selectedOrgan === 'bone-sarcoma'
          ? sarcomaSubtype
          : selectedOrgan === 'skin'
            ? skinHistology
            : selectedOrgan === 'hematologic'
              ? hematologicSubtype
              : selectedSubsite || organNames[selectedOrgan];
    const now = new Date();
    const record: ArchivedClinicalCase = {
      id: window.crypto.randomUUID(),
      savedAt: now.toISOString(),
      patientId: patientId.trim() || `LOCAL-${now.getTime()}`,
      age: patientAgeYears,
      gender: patientGender,
      diagnosis,
      stage: `${selectedT} ${selectedN} ${selectedM}`,
      prescription: `${activeScheme.name} Â· ${activeScheme.totalDoseGy} Gy / ${activeScheme.fractionCount} fx`,
      bed: radiobiologyByAlphaBeta.find(item => item.ab === 10)?.bed ?? radiobiology.bed,
      eqd2: radiobiologyByAlphaBeta.find(item => item.ab === 10)?.eqd2 ?? radiobiology.eqd2,
    };
    const nextArchive = [record, ...caseArchive];
    try {
      window.localStorage.setItem('radonco_clinical_case_archive', JSON.stringify(nextArchive));
    } catch (error) {
      console.error('Clinical case could not be saved to browser storage.', error);
      setResearchExportNotice('Vaka arÅŸive kaydedilemedi; tarayÄ±cÄ± depolama alanÄ± dolu veya kullanÄ±lamÄ±yor.');
      return;
    }
    setCaseArchive(nextArchive);
    setResearchExportNotice('');
    setIsCaseArchiveOpen(true);
  };

  const removeArchivedCase = (caseId: string) => {
    const nextArchive = caseArchive.filter(record => record.id !== caseId);
    try {
      window.localStorage.setItem('radonco_clinical_case_archive', JSON.stringify(nextArchive));
    } catch (error) {
      console.error('Clinical case could not be removed from browser storage.', error);
      setResearchExportNotice('Vaka arÅŸivden silinemedi; tarayÄ±cÄ± depolama alanÄ±nÄ± kontrol edin.');
      return;
    }
    setCaseArchive(nextArchive);
  };

  const exportCaseArchive = () => {
    if (caseArchive.length === 0) {
      setResearchExportNotice('DÄ±ÅŸa aktarÄ±lacak vaka bulunmuyor.');
      return;
    }
    const headers = ['Hasta_ID', 'YaÅŸ', 'Cinsiyet', 'TanÄ±', 'Evre', 'ReÃ§ete', 'BED10_Gy', 'EQD2_10_Gy', 'Kaydedilme_Tarihi'];
    const csvEscape = (value: string) => {
      const safeValue = /^[=+\-@]/.test(value) ? `'${value}` : value;
      return `"${safeValue.replaceAll('"', '""')}"`;
    };
    const csvRows = caseArchive.map(record => [
      record.patientId,
      record.age,
      record.gender,
      record.diagnosis,
      record.stage,
      record.prescription,
      record.bed,
      record.eqd2,
      record.savedAt,
    ]);
    const csv = `\uFEFF${headers.join(',')}\n${csvRows.map(row => row.map(csvEscape).join(',')).join('\n')}`;
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `radonco_klinik_vaka_arsivi_${new Date().toISOString().slice(0, 10)}.csv`;
    anchor.click();
    URL.revokeObjectURL(url);
  };

  const prescriptionTarget = selectedOrgan === 'breast' && breastHistology !== 'Malign Filloides TÃ¼mÃ¶rÃ¼'
    ? 'TÃ¼m Meme (WBRT)'
    : activeScheme.targetVolumes[0]?.anatomical || 'Klinik hedef hacimler';
  const translatePrescriptionBadge = (badge: string | undefined, fallback: string) => {
    const value = badge || fallback;
    if (lang === 'tr') return value;
    const exactTranslations: Record<string, string> = {
      'Hedef: 4D-CT tÃ¼m solunum hareket hacmi': 'Target: 4D-CT full respiratory motion ITV',
      'Nodal: Elektif nodal hedef yok': 'Nodal: No elective nodal irradiation',
      'Teknik & Hareket: SBRT (4D-CT / ITV VMAT)': 'Technique: SBRT (4D-CT / ITV VMAT)',
      'Teknik: SBRT (4D-CT / ITV VMAT)': 'Technique: SBRT (4D-CT / ITV VMAT)',
      'Nodal: Uygulanmaz (Benign)': 'Nodal: Not applicable (benign)',
      'RNI: Elektif Nodal YapÄ±lmaz (DCIS)': 'RNI: No elective nodal irradiation (DCIS)',
      'RNI: Elektif Nodal YapÄ±lmaz (Filloides)': 'RNI: No elective nodal irradiation (phyllodes)',
      'RNI: Elektif Nodal YapÄ±lmaz (pN0)': 'RNI: No elective nodal irradiation (pN0)',
      'RNI: DÃ¼zey I-IV + SC KapsanÄ±r': 'RNI: Include levels I-IV and supraclavicular nodes',
    };
    if (exactTranslations[value]) return exactTranslations[value];
    return tText(value
      .replace(/^Hedef:/, 'Target:')
      .replace(/^Teknik & Hareket:/, 'Technique:')
      .replace(/^Teknik:/, 'Technique:')
      .replace(/^Nodal:/, 'Nodal:'));
  };
  const prescriptionTargetBadge = translatePrescriptionBadge(evaluatedDecision.targetVolumeBadge, `Hedef: ${prescriptionTarget}`);
  const prescriptionTechniqueBadge = translatePrescriptionBadge(evaluatedDecision.techniqueBadge, `Teknik & Hareket: ${activeScheme.technique}`);
  const breastNodalSummary = selectedOrgan === 'breast'
    ? breastHistology === 'Duktal Karsinoma In Situ (DCIS)'
      ? 'RNI: Elektif Nodal YapÄ±lmaz (DCIS)'
      : breastHistology === 'Malign Filloides TÃ¼mÃ¶rÃ¼'
        ? 'RNI: Elektif Nodal YapÄ±lmaz (Filloides)'
        : selectedN === 'N0'
          ? 'RNI: Elektif Nodal YapÄ±lmaz (pN0)'
          : 'RNI: DÃ¼zey I-IV + SC KapsanÄ±r'
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
      <div className="min-h-screen w-full flex flex-col items-center justify-center bg-slate-100 dark:bg-[#070b14] text-slate-800 dark:text-slate-200 font-sans" role="status" aria-live="polite">
        <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4" aria-hidden="true" />
        <div className="text-sm font-bold tracking-tight text-slate-900 dark:text-white">
          {lang === 'tr' ? 'Kurumsal Kimlik Bilgileri DoÄŸrulanÄ±yor...' : 'Verifying Institutional Credentials...'}
        </div>
        <div className="text-xs text-slate-500 dark:text-slate-200 mt-1">
          {lang === 'tr' ? 'Verifying institutional credentials' : 'Kurumsal hekim doÄŸrulamasÄ± yapÄ±lÄ±yor'}
        </div>
      </div>
    );
  }

  if (user && !isDoctor) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-slate-100 dark:bg-[#070b14] p-6 text-slate-900 dark:text-slate-100 font-sans">
        <div className="w-full max-w-md rounded-2xl bg-[#0c1322] border border-slate-800 p-8 shadow-xl text-center">
          <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-600 border border-rose-200 flex items-center justify-center mx-auto mb-4 font-bold text-xl" aria-hidden="true">{tText("!")}</div>
          <h2 className="text-xl font-bold text-slate-900 mb-2">{tText("Kurumsal Hekim EriÅŸimi / Institutional Access")}</h2>
          <p className="text-xs text-slate-600 leading-relaxed mb-6">
            {tText("\n            RadOnc CDSS is restricted to licensed physicians and institutional medical personnel. YalnÄ±zca kurumsal hekim e-postalarÄ± geÃ§erlidir.\n          ")}</p>
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 mb-6 text-left text-xs font-mono">
            <div className="text-slate-500">{tText("Account: ")}<span className="text-rose-600 font-bold">{email}</span></div>
            <div className="text-slate-500">{tText("Allowed: ")}<span className="text-emerald-700 font-bold">{tText("@saglik.gov.tr, @*.edu.tr, @*.edu, @nhs.net, @*.ac.uk")}</span></div>
          </div>
          <SignOutButton redirectUrl="/sign-in">
            <button type="button" className="w-full py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2">
              {tText("\n              FarklÄ± Hesapla GiriÅŸ / Sign In with Another Account\n            ")}</button>
          </SignOutButton>
        </div>
      </div>
    );
  }

  const reportOrganNames: Record<OrganId, string> = {
    thorax: lang === 'tr' ? 'Toraks' : 'Thorax',
    prostate: lang === 'tr' ? 'GenitoÃ¼riner Sistem' : 'Genitourinary',
    breast: lang === 'tr' ? 'Meme' : 'Breast',
    gis: lang === 'tr' ? 'Gastrointestinal Sistem' : 'Gastrointestinal',
    'head-neck': lang === 'tr' ? 'BaÅŸ-Boyun' : 'Head and Neck',
    cns: lang === 'tr' ? 'Santral Sinir Sistemi' : 'Central Nervous System',
    gynecology: lang === 'tr' ? 'Jinekoloji' : 'Gynecology',
    bone: lang === 'tr' ? 'Kemik' : 'Bone',
    sarcoma: lang === 'tr' ? 'YumuÅŸak Doku Sarkomu' : 'Soft Tissue Sarcoma',
    'bone-sarcoma': lang === 'tr' ? 'Kemik ve Sarkom' : 'Bone and Sarcoma',
    skin: lang === 'tr' ? 'Cilt' : 'Skin',
    hematologic: lang === 'tr' ? 'Hematolojik' : 'Hematologic',
    pediatric: lang === 'tr' ? 'Pediatrik' : 'Pediatric',
    palliative: lang === 'tr' ? 'Palyatif' : 'Palliative',
    emergencies: lang === 'tr' ? 'Onkolojik Aciller' : 'Oncologic Emergencies',
    benign: lang === 'tr' ? 'Benign' : 'Benign',
  };
  const reportDiagnosis = selectedOrgan === 'breast'
    ? breastHistology
    : selectedOrgan === 'thorax'
      ? tText(thoraxSubtype)
      : selectedOrgan === 'cns'
        ? tText(cnsSubtype)
        : selectedOrgan === 'prostate'
          ? tText(gusSubtype)
          : selectedOrgan === 'gynecology'
            ? tText(gynSite)
            : selectedOrgan === 'gis'
              ? tText(gisOrgan)
              : selectedOrgan === 'head-neck'
                ? tText(hnSubsite)
                : tText(selectedSubsite || selectedOrgan);
  const reportHistology = selectedOrgan === 'breast'
    ? breastHistology
    : selectedOrgan === 'thorax'
      ? thoraxSubtype === 'nsclc' ? tText(nsclcHistology) : thoraxSubtype === 'thymoma' ? tText(thymicHistology) : tText(thoraxSubtype)
      : selectedOrgan === 'cns'
        ? cnsSubtype === 'glioma' || cnsSubtype === 'gbm' ? tText(gliomaHistology) : tText(cnsSubtype)
        : tText(selectedHistology) || reportDiagnosis;
  const reportMolecular = selectedOrgan === 'breast'
    ? `ER ${breastER ? '+' : '-'} / PR ${breastPR ? '+' : '-'} / HER2 ${breastHER2 ? '+' : '-'} / Ki-67 ${breastKi67}%`
    : selectedOrgan === 'prostate'
      ? gusSubtype === 'kidney'
        ? tText(selectedHistology)
        : `PSA ${psaLevel} ng/mL / Gleason ${gleasonPrimary}+${gleasonSecondary}`
      : selectedOrgan === 'cns'
        ? `${tText(gliomaGrade)} / KPS ${cnsKps}${gliomaRiskFactors.molecularHighRisk ? ' / IDH-wt or molecular high risk' : ''}`
        : 'â€”';
  const surgeryLogic = selectedOrgan === 'breast'
    ? tText(breastSurgery)
    : selectedOrgan === 'thorax'
      ? thoraxSubtype === 'thymoma'
        ? tText(thoraxSurgeryStatus)
        : tText(thoraxSurgeryStatus)
      : selectedOrgan === 'gis' && gisOrgan === 'SafraYollari'
        ? tText(biliaryTreatmentSetting)
        : selectedOrgan === 'cns'
            ? tText(cnsResection)
            : selectedOrgan === 'bone' || selectedOrgan === 'bone-sarcoma' || selectedOrgan === 'sarcoma'
              ? tText(sarcomaSurgery)
              : '';
  const surgicalMarginLogic = selectedOrgan === 'breast'
    ? tText(breastMargin)
    : selectedOrgan === 'thorax' && thoraxSubtype === 'thymoma'
      ? tText(thymomaMargin)
      : selectedOrgan === 'gis' && gisOrgan === 'SafraYollari'
        ? tText(biliaryMarginStatus)
        : selectedOrgan === 'gis' && gisOrgan === 'Rektum'
          ? tText(gisCrmStatus)
          : selectedOrgan === 'skin'
            ? tText(skinMargin)
            : selectedOrgan === 'head-neck' && hnPositiveMargin
              ? 'R1'
              : (selectedOrgan === 'bone' || selectedOrgan === 'bone-sarcoma' || selectedOrgan === 'sarcoma') && sarcomaSurgery === 'Postop_R1'
                ? 'R1'
                : selectedOrgan === 'bone' && osteoScenario === 'Marjin_Pozitif_R1_R2'
                  ? 'R1/R2'
                  : '';
  const selectedRisk = prognosticResult?.riskCategory
    ?? (selectedOrgan === 'pediatric'
      ? tText(pediatricRisk)
      : selectedOrgan === 'gynecology' && gynSite === 'Endometriyum'
        ? tText(endoRisk)
        : selectedOrgan === 'skin' && (skinPerineuralInvasion || skinBoneInvasion)
          ? [skinPerineuralInvasion && (lang === 'tr' ? 'PerinÃ¶ral invazyon' : 'Perineural invasion'), skinBoneInvasion && (lang === 'tr' ? 'Kemik invazyonu' : 'Bone invasion')].filter(Boolean).join(' Â· ')
          : '');
  const clinicalDecisionFactors = [
    { label: 'TanÄ± / Diagnosis', value: tText(reportDiagnosis) },
    { label: 'Evre / Stage', value: `${selectedT}${selectedN}${selectedM}` },
    { label: 'Histoloji / Histology', value: tText(reportHistology) },
    ...(selectedRisk ? [{ label: 'Risk Grubu / Risk Category', value: tText(selectedRisk) }] : []),
    ...(surgeryLogic ? [{ label: 'Cerrahi / Surgery', value: surgeryLogic }] : []),
    ...(surgicalMarginLogic ? [{ label: 'Cerrahi SÄ±nÄ±r / Margin', value: surgicalMarginLogic }] : []),
    { label: 'Endikasyon / Indication', value: tText(activeScheme.indication) },
    {
      label: 'Ã–nerilen Åema / Recommended Scheme',
      value: `${tText(activeScheme.name)} Â· ${activeScheme.totalDoseGy} Gy / ${activeScheme.fractionCount} fx`,
    },
  ].filter(factor => factor.value.trim().length > 0);
  const evidenceText = tText(activeScheme.evidence);
  const evidenceReferences = getEvidenceReferences(activeScheme, selectedOrgan);
  const verifyReference = evidenceReferences[0];

  return (
    <>
    <div id="clinical-app" className="min-h-screen w-full bg-[#0a0f1d] text-slate-100 flex flex-col font-sans">

      {/* ==========================================
          HEADER: PARILDAYAN RADYASYON LOGOSU
         ========================================== */}
      <header className="w-full border-b border-slate-800 bg-[#080d1a]/95 backdrop-blur px-3 py-2.5 sm:px-6 sm:py-3 flex items-center justify-between sticky top-0 z-50">
        <div className="flex min-w-0 flex-1 items-center gap-2 sm:gap-3">
          <button
            type="button"
            aria-label={lang === 'tr' ? 'Anatomik menÃ¼yÃ¼ aÃ§' : 'Open anatomic menu'}
            onClick={() => setIsMobileDrawerOpen(true)}
            className="rounded-lg border border-slate-700 bg-slate-800 p-2 text-slate-200 transition hover:bg-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 lg:hidden"
          >
            <Menu className="h-4 w-4" aria-hidden="true" />
          </button>
          <div className="min-w-0">
            <h1 className="truncate text-xs font-bold text-slate-900 dark:text-white sm:text-base">
              {lang === 'tr' ? 'Radyasyon Onkolojisi Klinik Karar Destek Sistemi' : 'Radiation Oncology Clinical Decision Support System'}
            </h1>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-1.5">
          <button
            type="button"
            onClick={() => {
              setSearchQuery('');
              setActiveSearchIndex(0);
              setIsSearchOpen(true);
            }}
            aria-label={lang === 'en' ? 'Quick search or jump' : 'HÄ±zlÄ± arama veya komut'}
            className="hidden items-center gap-2 rounded-xl border border-slate-800 bg-[#0e1726] px-3 py-1.5 text-xs text-slate-400 shadow-sm transition-all hover:border-slate-700 hover:text-slate-200 md:flex"
          >
            <Search className="h-3.5 w-3.5 text-slate-400" aria-hidden="true" />
            <span>{lang === 'en' ? 'Quick search or jump...' : 'HÄ±zlÄ± arama veya komut...'}</span>
            <kbd className="ml-2 rounded-md border border-slate-700 bg-slate-800 px-1.5 py-0.5 font-mono text-[10px] text-slate-300">Ctrl K</kbd>
          </button>
          <button
            type="button"
            onClick={() => {
              setSearchQuery('');
              setActiveSearchIndex(0);
              setIsSearchOpen(true);
            }}
            aria-label={lang === 'en' ? 'Open quick search' : 'HÄ±zlÄ± aramayÄ± aÃ§'}
            className="flex items-center justify-center rounded-lg border border-slate-700 bg-slate-800 p-2 text-slate-300 transition hover:bg-slate-700 md:hidden"
          >
            <Search className="h-4 w-4" aria-hidden="true" />
          </button>
          <button
            onClick={() => {
              setActiveReferenceTab('guidelines');
              setShowGuidelineModal(true);
            }}
            className="flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800 px-2 py-1.5 text-xs text-slate-100 transition-colors hover:bg-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 sm:px-3"
          >
            <BookOpen className="w-4 h-4 text-amber-700" />
            <span aria-hidden="true">ğŸ“–</span>
            <span className="hidden sm:inline">{lang === 'tr' ? 'KÄ±lavuz Ä°lkeleri' : 'Clinical Guidelines'}</span>
          </button>
        </div>
      </header>

      {isAiDockOpen && (
        <div
          className="fixed inset-0 z-50 bg-slate-950/20"
          role="presentation"
          onMouseDown={event => {
            if (event.target === event.currentTarget) setIsAiDockOpen(false);
          }}
        >
          <aside
            className="fixed right-0 top-0 flex h-full w-full flex-col justify-between border-l border-slate-200 bg-white shadow-2xl transition-all duration-200 dark:border-slate-800 dark:bg-[#0c1322] sm:w-[420px]"
            role="dialog"
            aria-modal="true"
            aria-labelledby="ai-dock-title"
          >
            <div className="flex min-h-0 flex-1 flex-col">
              <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/80 p-4 dark:border-slate-800 dark:bg-slate-800/80">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-blue-600" aria-hidden="true" />
                  <span id="ai-dock-title" className="text-sm font-bold text-slate-900 dark:text-white">RadOnc AI Copilot</span>
                  <span className="rounded-full bg-blue-100 px-2 py-0.5 font-mono text-[10px] font-semibold text-blue-700 dark:bg-blue-900/40 dark:text-blue-300">No API Key</span>
                </div>
                <button
                  type="button"
                  onClick={() => setIsAiDockOpen(false)}
                  aria-label={lang === 'tr' ? 'AI asistanÄ± kapat' : 'Close AI assistant'}
                  className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-white"
                >
                  <XCircle className="h-5 w-5" aria-hidden="true" />
                </button>
              </div>

              <div className="mx-4 mt-3 rounded-xl border border-emerald-200 bg-emerald-50 p-2.5 text-xs dark:border-emerald-800/60 dark:bg-emerald-950/30">
                <div className="mb-0.5 flex items-center gap-1.5 font-semibold text-emerald-800 dark:text-emerald-300">
                  <span className="h-2 w-2 animate-ping rounded-full bg-emerald-500" aria-hidden="true" />
                  {lang === 'tr' ? 'Ekran Otomatik Okundu:' : 'Screen Context Active:'}
                </div>
                <div className="truncate font-mono text-[11px] text-slate-600 dark:text-slate-300">
                  {selectedOrgan.toUpperCase()} â€¢ {selectedT} {selectedN} {selectedM} â€¢ {activeScheme.totalDoseGy} Gy / {activeScheme.fractionCount} fx
                </div>
              </div>

              <div className="flex gap-1 border-b border-slate-100 p-4 pb-0 dark:border-slate-800">
                {([
                  ['gemini', 'Google Gemini'],
                  ['chatgpt', 'ChatGPT'],
                  ['claude', 'Claude'],
                ] as const).map(([tab, label]) => (
                  <button
                    key={tab}
                    type="button"
                    onClick={() => setActiveAiTab(tab)}
                    className={`rounded-t-lg px-3 py-2 text-xs font-semibold ${
                      activeAiTab === tab
                        ? 'border border-b-0 border-slate-200 bg-white text-blue-700 dark:border-slate-700 dark:bg-[#0c1322] dark:text-blue-300'
                        : 'text-slate-500 hover:text-slate-800 dark:hover:text-white'
                    }`}
                  >
                    <span className="flex items-center gap-1.5">
                      <AiLogo id={tab} className="h-3.5 w-3.5" />
                      {label}
                    </span>
                  </button>
                ))}
              </div>

              <div className="flex-1 overflow-y-auto p-4">
                <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                  {lang === 'tr' ? 'Vaka Sorusu Ã–nizleme' : 'Case Question Preview'}
                </label>
                <textarea
                  readOnly
                  value={casePrompt}
                  className="h-64 w-full resize-none rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs leading-relaxed text-slate-700 outline-none dark:border-slate-700 dark:bg-slate-800/60 dark:text-slate-300"
                />
                <a
                  href={getAiUrl()}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={copyCaseContext}
                  className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-3 py-2.5 text-xs font-semibold text-white transition hover:bg-blue-700"
                >
                  <AiLogo id={activeAiTab} className="h-4 w-4" />
                  {lang === 'tr' ? 'HesabÄ±nla AÃ§ & Sor â†—' : 'Open & Ask with Your Account â†—'}
                </a>
                <button
                  type="button"
                  onClick={openSelectedAi}
                  className="mt-2 flex w-full items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-slate-100 px-3 py-2 text-xs font-medium text-slate-700 transition hover:bg-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
                >
                  <Copy className="h-3.5 w-3.5" aria-hidden="true" />
                  {copiedContext
                    ? (lang === 'tr' ? 'Panoya KopyalandÄ±!' : 'Copied to Clipboard!')
                    : (lang === 'tr' ? 'Vaka Sorusunu Kopyala' : 'Copy Case Question')}
                </button>
              </div>
            </div>

            <div className="border-t border-slate-100 p-3 text-center text-[11px] text-slate-400 dark:border-slate-800">
              {lang === 'tr'
                ? 'API anahtarÄ± gerekmez; vaka sorusu kendi hesabÄ±nÄ±zla aÃ§Ä±lan AI platformuna aktarÄ±lÄ±r.'
                : 'No API key required; the case question is copied before opening the AI platform.'}
            </div>
          </aside>
        </div>
      )}

      <div className="flex min-h-0 flex-1">
      {/* ==========================================
          SOL DÄ°KEY ORGAN NAVÄ°GASYONU
         ========================================== */}
      {isMobileDrawerOpen && (
        <button
          type="button"
          aria-label={lang === 'tr' ? 'MenÃ¼yÃ¼ kapat' : 'Close menu'}
          onClick={() => setIsMobileDrawerOpen(false)}
          className="fixed inset-0 z-40 bg-black/60 lg:hidden"
        />
      )}
      <nav className={`${isGuidedMode && guidedStep !== 1 ? 'hidden' : isMobileDrawerOpen ? 'fixed inset-y-0 left-0 z-50 flex w-72' : 'hidden lg:flex'} ${isSidebarCollapsed ? 'lg:w-16 lg:px-2' : 'lg:w-56 xl:w-60 lg:px-4'} shrink-0 flex-col sticky top-14 h-[calc(100vh-3.5rem)] overflow-y-auto bg-[#0c1322] border border-slate-800/80 rounded-2xl p-4 shadow-2xl lg:shadow-sm`}>
        <div className="mb-3 flex items-center justify-between px-2">
          <span className={`${isSidebarCollapsed ? 'lg:hidden' : ''} text-[10px] font-bold uppercase tracking-[0.16em] text-slate-500 dark:text-slate-300`}>
          {lang === 'tr' ? 'Klinik Navigasyon' : 'Clinical Navigation'}
          </span>
          <button
            type="button"
            aria-label={isSidebarCollapsed ? (lang === 'tr' ? 'MenÃ¼yÃ¼ geniÅŸlet' : 'Expand menu') : (lang === 'tr' ? 'MenÃ¼yÃ¼ daralt' : 'Collapse menu')}
            onClick={() => setIsSidebarCollapsed(value => !value)}
            className="hidden rounded-md p-1 text-slate-400 transition hover:bg-slate-800 hover:text-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 lg:block"
          >
            {isSidebarCollapsed ? <ChevronRight className="h-4 w-4" aria-hidden="true" /> : <ChevronLeft className="h-4 w-4" aria-hidden="true" />}
          </button>
          <button
            type="button"
            aria-label={lang === 'tr' ? 'MenÃ¼yÃ¼ kapat' : 'Close menu'}
            onClick={() => setIsMobileDrawerOpen(false)}
            className="rounded-md p-1 text-slate-400 transition hover:bg-slate-800 hover:text-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 lg:hidden"
          >
            <ChevronLeft className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>
        <div className="flex flex-col gap-1">
        {[
          { id: 'emergencies', name_tr: 'Acil Radyoterapi', name_en: 'Emergency Radiotherapy', icon: ShieldAlert, color: 'text-rose-400' },
          { id: 'thorax', name_tr: 'Toraks', name_en: 'Thorax', icon: Wind, color: 'text-sky-700' },
          { id: 'prostate', name_tr: 'GÃœS', name_en: 'Genitourinary (GU)', icon: Droplets, color: 'text-blue-700' },
          { id: 'breast', name_tr: 'Meme', name_en: 'Breast', icon: CircleDot, color: 'text-pink-700' },
          { id: 'gis', name_tr: 'GÄ°S', name_en: 'Gastrointestinal (GI)', icon: UtensilsCrossed, color: 'text-orange-700' },
          { id: 'head-neck', name_tr: 'BaÅŸ-Boyun', name_en: 'Head & Neck', icon: User, color: 'text-indigo-700' },
          { id: 'cns', name_tr: 'MSS', name_en: 'CNS (Brain & Spine)', icon: Brain, color: 'text-purple-700' },
          { id: 'gynecology', name_tr: 'Jinekoloji', name_en: 'Gynecology', icon: Sparkles, color: 'text-rose-700' },
          { id: 'bone', name_tr: 'Kemik TÃ¼mÃ¶rleri', name_en: 'Bone Tumors', icon: Bone, color: 'text-amber-700' },
          { id: 'sarcoma', name_tr: 'YumuÅŸak Doku', name_en: 'Soft Tissue', icon: Layers, color: 'text-orange-700' },
          { id: 'skin', name_tr: 'Cilt', name_en: 'Skin Cancers', icon: Shield, color: 'text-yellow-700' },
          { id: 'hematologic', name_tr: 'Hematolojik', name_en: 'Hematologic', icon: Droplet, color: 'text-red-700' },
          { id: 'pediatric', name_tr: 'Pediatrik', name_en: 'Pediatric Tumors', icon: Baby, color: 'text-emerald-700' },
          { id: 'palliative', name_tr: 'Palyatif Radyoterapi', name_en: 'Palliative Radiotherapy', icon: HandHeart, color: 'text-teal-300' },
          { id: 'benign', name_tr: 'Benign', name_en: 'Benign Conditions', icon: ShieldCheck, color: 'text-emerald-700' },
        ].map(item => {
          if (item.id !== 'emergencies' && item.id !== 'thorax' && !isAnatomicRegionsOpen) return null;
          const Icon = item.icon;
          const isActive = selectedOrgan === item.id;
          const displayName = lang === 'en' ? item.name_en : item.name_tr;
          return (
            <div key={item.id}>
              {item.id === 'thorax' && (
                <button
                  type="button"
                  aria-expanded={isAnatomicRegionsOpen}
                  onClick={() => setIsAnatomicRegionsOpen(open => !open)}
                  className={`${isSidebarCollapsed ? 'lg:hidden' : ''} mb-1 mt-2 flex w-full items-center gap-2 rounded-lg px-2 py-2 text-left text-[10px] font-bold uppercase tracking-wider text-slate-400 hover:bg-slate-800/60 hover:text-slate-200`}
                >
                  <span>ğŸ“ {lang === 'tr' ? 'Anatomik BÃ¶lgeler' : 'Anatomic Regions'}</span>
                  <ChevronDown className={`ml-auto h-3.5 w-3.5 transition-transform ${isAnatomicRegionsOpen ? 'rotate-180' : ''}`} aria-hidden="true" />
                </button>
              )}
              {(item.id === 'emergencies' || isAnatomicRegionsOpen) && (
              <>
              <button
                type="button"
                onClick={() => {
                  if (!isActive) handleOrganChange(item.id as OrganId);
                  toggleCategory(item.id);
                }}
                className={`rounded-xl py-1.5 px-2 text-[11px] flex items-center gap-2 transition-all w-full text-left ${
                  isActive
                    ? item.id === 'emergencies'
                      ? 'bg-rose-700 text-white font-bold shadow-md shadow-rose-950/40 ring-1 ring-rose-500/50'
                      : item.id === 'benign'
                      ? 'bg-emerald-600 text-white font-bold shadow-md'
                      : 'bg-blue-600 text-white font-bold shadow-md'
                    : item.id === 'benign'
                      ? 'text-emerald-800 dark:text-emerald-300 hover:text-emerald-900 dark:hover:text-emerald-100 hover:bg-emerald-50 dark:hover:bg-emerald-900/30'
                      : item.id === 'emergencies'
                        ? 'text-rose-300 hover:text-rose-100 hover:bg-rose-950/50 font-semibold border border-rose-500/30'
                      : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60 font-medium'
                }`}
              >
                <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : item.color}`} />
                <span className={isSidebarCollapsed ? 'lg:hidden' : ''}>{displayName}</span>
                {item.id === 'emergencies' && <span className={`${isSidebarCollapsed ? 'lg:hidden' : ''} rounded-sm border border-amber-400/40 bg-amber-400/15 px-1 py-0.5 text-[8px] font-black uppercase tracking-wide text-amber-300`}>{lang === 'tr' ? 'ACÄ°L' : 'URGENT'}</span>}
                <ChevronDown className={`${isSidebarCollapsed ? 'lg:hidden' : ''} ml-auto h-3.5 w-3.5 transition-transform ${openCategories.includes(item.id) ? 'rotate-180' : ''}`} aria-hidden="true" />
              </button>
              {openCategories.includes(item.id) && !isSidebarCollapsed && (
                <div className="ml-4 flex flex-col gap-1 border-l-2 border-blue-500/40 py-1 pl-4">
                  {ORGAN_TREE[item.id as OrganId].map(sub => {
                    const isSubsiteActive = selectedSubsite === sub.id || currentTnmKey === sub.id;
                    return (
                      <button
                        key={sub.id}
                        type="button"
                        onClick={() => handleSubsiteChange(sub.id)}
                        className={`rounded-lg px-2 py-1.5 text-left text-[11px] leading-tight transition-colors ${
                          isSubsiteActive
                            ? 'bg-blue-100 font-bold text-blue-900 dark:bg-blue-950/70 dark:text-blue-100'
                            : 'font-medium text-slate-700 hover:bg-slate-100 hover:text-slate-950 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white'
                        }`}
                      >
                        {lang === 'tr' ? sub.name_tr : sub.name_en}
                      </button>
                    );
                  })}
                </div>
              )}
              </>
              )}
            </div>
          );
        })}
        </div>
      </nav>

      {/* ==========================================
          FAVORÄ°LERÄ°M: KLASÄ°K NAVÄ°GASYON Ã‡UBUÄUNUN HEMEN SAÄINDA, AYRI SÃœTUN
         ========================================== */}
      <aside
        className={`${isGuidedMode && guidedStep !== 1 ? 'hidden' : 'hidden lg:flex'} w-52 xl:w-56 shrink-0 flex-col sticky top-14 h-fit max-h-[calc(100vh-3.5rem)] overflow-y-auto rounded-xl border border-amber-500/20 bg-amber-500/[0.05] p-2.5 shadow-sm`}
        aria-label={lang === 'tr' ? 'Favori klinik senaryolar' : 'Favorite clinical scenarios'}
      >
        <h2 className="mb-1.5 px-1 text-[10px] font-bold uppercase tracking-wider text-amber-300">
          â­ {lang === 'tr' ? 'Favorilerim' : 'Favorites'}
        </h2>
        {QUICK_CASE_PRESETS.filter(preset => favoritePresetIds.includes(preset.id)).map(preset => (
          <div key={preset.id} className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => handleQuickCaseSelect(preset)}
              className="min-w-0 flex-1 truncate rounded-md px-2 py-1.5 text-left text-[10px] font-medium text-slate-200 transition hover:bg-slate-800 hover:text-white"
              title={lang === 'tr' ? preset.title_tr : preset.title_en}
            >
              <span>{lang === 'tr' ? preset.title_tr : preset.title_en}</span>
            </button>
            <button
              type="button"
              aria-label={`${lang === 'tr' ? 'Favorilerden Ã§Ä±kar' : 'Remove favorite'}: ${lang === 'tr' ? preset.title_tr : preset.title_en}`}
              onClick={() => toggleFavoritePreset(preset.id)}
              className="rounded p-1 text-amber-300 hover:bg-amber-400/10"
            >
              <span aria-hidden="true">â­</span>
            </button>
          </div>
        ))}
        {customFavorites.map(fav => (
          <div key={fav.id} className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => restoreCustomFavorite(fav)}
              className="min-w-0 flex-1 truncate rounded-md px-2 py-1.5 text-left text-[10px] font-medium text-emerald-200 transition hover:bg-slate-800 hover:text-white"
              title={`${fav.label} (${fav.organ} / ${fav.subsite} ${fav.selectedT}${fav.selectedN}${fav.selectedM})`}
            >
              <span>â˜… {fav.label}</span>
            </button>
            <button
              type="button"
              aria-label={`${lang === 'tr' ? 'Ã–zel favoriyi sil' : 'Remove custom favorite'}: ${fav.label}`}
              onClick={() => removeCustomFavorite(fav.id)}
              className="rounded p-1 text-rose-300 hover:bg-rose-400/10"
            >
              <span aria-hidden="true">Ã—</span>
            </button>
          </div>
        ))}
        {favoritePresetIds.length === 0 && customFavorites.length === 0 && (
          <p className="px-1 py-1 text-[10px] text-slate-400">
            {lang === 'tr' ? 'SenaryolarÄ±n yanÄ±ndaki â˜† ile ekleyin.' : 'Add scenarios with the â˜† button.'}
          </p>
        )}
      </aside>

      {/* ==========================================
          12 KOLONLUK FULL-WIDTH GRID
         ========================================== */}
      <main id="cdss-main-content" className="flex-1 min-w-0 overflow-x-hidden bg-[#0a0f1d] p-3 sm:p-4 xl:p-6 grid grid-cols-1 lg:grid-cols-12 content-start gap-3 xl:gap-5 w-full max-w-[1720px] mx-auto px-6 sm:px-10 lg:px-12">
        <div className="col-span-12 w-full h-auto min-h-0 py-2 px-3.5 text-xs flex items-center gap-2 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-200/90 leading-tight">
          <ShieldAlert className="h-4 w-4 shrink-0 text-amber-300" aria-hidden="true" />
          <p className="min-w-0 truncate" title={lang === 'tr'
            ? 'Karar Destek Sistemi hekim deÄŸerlendirmesini desteklemek iÃ§indir; nihai klinik ve hukuki sorumluluk uygulayÄ±cÄ± hekime aittir.'
            : 'The Clinical Decision Support System is intended to support physician evaluation; final clinical and legal responsibility rests with the treating physician.'}>
            {lang === 'tr'
              ? 'Karar Destek Sistemi hekim deÄŸerlendirmesini desteklemek iÃ§indir; nihai klinik ve hukuki sorumluluk uygulayÄ±cÄ± hekime aittir.'
              : 'The Clinical Decision Support System is intended to support physician evaluation; final clinical and legal responsibility rests with the treating physician.'}
          </p>
        </div>
        <div className="col-span-12 flex h-11 min-h-0 min-w-0 items-center justify-between gap-2 rounded-lg border border-slate-800 bg-slate-900/60 px-4 py-2">
          <span className="hidden shrink-0 text-xs font-semibold leading-none text-slate-300 sm:inline">
            {lang === 'tr' ? 'Ã‡alÄ±ÅŸma GÃ¶rÃ¼nÃ¼mÃ¼' : 'Workspace View'}
          </span>
          <div className="flex max-w-full items-center gap-1 rounded-lg border border-slate-700 bg-[#080d18] p-0.5" role="group" aria-label={lang === 'tr' ? 'CDSS gÃ¶rÃ¼nÃ¼m modu' : 'CDSS view mode'}>
            <button
              type="button"
              aria-pressed={isGuidedMode}
              onClick={() => setViewMode(true)}
              className={`rounded-md px-1.5 py-1 text-[9px] font-semibold leading-none transition sm:px-3 sm:text-xs ${
                isGuidedMode ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
              }`}
            >
              {lang === 'tr' ? 'KÄ±lavuzlu Sihirbaz Modu' : 'Guided Wizard Mode'}
            </button>
            <button
              type="button"
              aria-pressed={!isGuidedMode}
              onClick={() => setViewMode(false)}
              className={`rounded-md px-1.5 py-1 text-[9px] font-semibold leading-none transition sm:px-3 sm:text-xs ${
                !isGuidedMode ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
              }`}
            >
              {lang === 'tr' ? 'Tam Matris GÃ¶rÃ¼nÃ¼mÃ¼' : 'Full Matrix View'}
            </button>
          </div>
        </div>
        <div className="col-span-12 grid grid-cols-1 gap-2 rounded-lg border border-slate-800 bg-slate-900/40 p-2 sm:grid-cols-3" aria-label={lang === 'tr' ? 'Ä°steÄŸe baÄŸlÄ± hasta bilgileri' : 'Optional patient information'}>
          <label className="text-[10px] font-semibold text-slate-300">
            {lang === 'tr' ? 'YaÅŸ / Age' : 'Age / YaÅŸ'}
            <input
              type="number"
              min="0"
              max="120"
              value={patientAgeYears}
              onChange={event => setPatientAgeYears(event.currentTarget.value)}
              className="mt-1 h-9 w-full rounded-md border border-slate-700 bg-[#0b1220] px-2 text-xs text-slate-100 placeholder:text-slate-500"
              placeholder={lang === 'tr' ? 'Ä°steÄŸe baÄŸlÄ±' : 'Optional'}
            />
          </label>
          <label className="text-[10px] font-semibold text-slate-300">
            {lang === 'tr' ? 'Cinsiyet / Gender' : 'Gender / Cinsiyet'}
            <select
              value={patientGender}
              onChange={event => setPatientGender(event.currentTarget.value)}
              className="mt-1 h-9 w-full rounded-md border border-slate-700 bg-[#0b1220] px-2 text-xs text-slate-100"
            >
              <option value="">{lang === 'tr' ? 'Belirtilmedi' : 'Not specified'}</option>
              <option value="KadÄ±n">{lang === 'tr' ? 'KadÄ±n' : 'Female'}</option>
              <option value="Erkek">{lang === 'tr' ? 'Erkek' : 'Male'}</option>
              <option value="DiÄŸer">{lang === 'tr' ? 'DiÄŸer' : 'Other'}</option>
            </select>
          </label>
          <label className="text-[10px] font-semibold text-slate-300">
            {lang === 'tr' ? 'Protokol / Hasta ID' : 'Protocol / Patient ID'}
            <input
              type="text"
              value={patientId}
              onChange={event => setPatientId(event.currentTarget.value)}
              className="mt-1 h-9 w-full rounded-md border border-slate-700 bg-[#0b1220] px-2 text-xs text-slate-100 placeholder:text-slate-500"
              placeholder={lang === 'tr' ? 'Ä°steÄŸe baÄŸlÄ±, kimliksizleÅŸtirilmiÅŸ ID' : 'Optional, pseudonymized ID'}
            />
          </label>
        </div>

        {isGuidedMode && (
          <nav className="col-span-12 mx-auto grid w-full max-w-[1720px] grid-cols-1 gap-2 sm:grid-cols-2 xl:grid-cols-4" aria-label={lang === 'tr' ? 'Klinik karar akÄ±ÅŸÄ± adÄ±mlarÄ±' : 'Clinical decision flow steps'}>
            {[
              {
                step: 1 as const,
                title: lang === 'tr' ? 'Klinik Profil ve Tedavi AmacÄ±' : 'Clinical Profile & Intent',
              },
              {
                step: 2 as const,
                title: lang === 'tr' ? 'Evreleme ve Patoloji' : 'Staging & Pathology',
              },
              {
                step: 3 as const,
                title: lang === 'tr' ? 'Prognostik Ä°ndeks ve Risk SÄ±nÄ±flamasÄ±' : 'Prognostic Index & Risk Stratification',
              },
              {
                step: 4 as const,
                title: lang === 'tr' ? 'ReÃ§ete ve Dozimetri' : 'Prescription & Dosimetry',
              },
            ].map(item => (
              <button
                key={item.step}
                type="button"
                aria-current={guidedStep === item.step ? 'step' : undefined}
                onClick={() => setGuidedStep(item.step)}
                className={`flex min-h-12 items-center gap-3 rounded-xl border px-3 py-2.5 text-left transition ${
                  guidedStep === item.step
                    ? 'border-sky-400/60 bg-sky-500/10 text-white shadow-sm'
                    : guidedStep > item.step
                      ? 'border-emerald-500/30 bg-emerald-500/[0.04] text-slate-200'
                      : 'border-slate-800 bg-[#0e1726] text-slate-400 hover:border-slate-600 hover:text-slate-200'
                }`}
              >
                <span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                  guidedStep === item.step ? 'bg-sky-400 text-slate-950' : guidedStep > item.step ? 'bg-emerald-400 text-slate-950' : 'bg-slate-800 text-slate-400'
                }`}>
                  {guidedStep > item.step ? <Check className="h-4 w-4" aria-hidden="true" /> : item.step}
                </span>
                <span className="text-xs font-semibold leading-snug">{item.title}</span>
              </button>
            ))}
          </nav>
        )}

        {isGuidedMode && guidedStep === 1 && (
          <section id="guided-step-content" className="col-span-12 mx-auto w-full max-w-[1720px] rounded-2xl border border-slate-800 bg-[#0e1726] p-4 shadow-xl sm:p-6" aria-labelledby="guided-profile-title">
            <div className="mb-4 flex flex-col gap-1">
              <h2 id="guided-profile-title" className="text-base font-bold text-white">
                {lang === 'tr' ? '1. Klinik Profil ve Tedavi AmacÄ±' : '1. Clinical Profile & Intent'}
              </h2>
              <p className="text-xs leading-relaxed text-slate-400">
                {lang === 'tr'
                  ? 'Soldaki anatomik menÃ¼den organ ve alt baÅŸlÄ±ÄŸÄ± seÃ§in veya sÄ±k kullanÄ±lan klinik senaryolardan biriyle baÅŸlayÄ±n.'
                  : 'Choose an organ and subsite from the anatomic menu, or start with one of the common clinical scenarios.'}
              </p>
            </div>
            <div className="mb-6 flex justify-center">
              <button
                type="button"
                onClick={() => setGuidedStep(2)}
                className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-blue-950/40 transition hover:bg-blue-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 sm:w-auto"
              >
                {lang === 'tr' ? 'Evreleme ve Patolojiye Devam' : 'Continue to Staging & Pathology'}
                <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>
            <h3 className="mb-3 text-xs font-bold uppercase tracking-wider text-amber-300">
              {lang === 'tr' ? 'HÄ±zlÄ± Klinik Senaryolar' : 'Quick Clinical Scenarios'}
            </h3>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 2xl:grid-cols-3">
              {guidedScenarioPresets.map(preset => {
                const scenario = GUIDED_QUICK_SCENARIOS[preset.id];
                const scenarioTitle = lang === 'tr'
                  ? scenario?.title_tr ?? preset.title_tr
                  : scenario?.title_en ?? preset.title_en;
                const scenarioDetail = lang === 'tr' ? preset.detail_tr : preset.detail_en;
                return (
                  <div key={preset.id} className="relative">
                    <button
                      type="button"
                      onClick={() => handleQuickCaseSelect(preset)}
                      aria-label={`${scenarioTitle}. ${scenarioDetail}`}
                      className={`flex min-h-36 w-full flex-col items-start justify-between gap-3 rounded-2xl border p-4 pr-14 text-left transition hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 ${
                        selectedQuickCaseId === preset.id
                          ? 'border-amber-400 bg-amber-500/15 shadow-lg shadow-amber-950/20'
                          : 'border-slate-700 bg-[#111c2e] hover:border-amber-400/60 hover:bg-[#15233a]'
                      }`}
                    >
                      <span className="rounded-full border border-sky-400/25 bg-sky-400/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-sky-300">
                        {reportOrganNames[preset.organ]}
                      </span>
                      <span className="text-sm font-bold leading-snug text-white">
                        {scenarioTitle}
                      </span>
                      <span className="text-xs leading-relaxed text-slate-300">
                        {scenarioDetail}
                      </span>
                    </button>
                    <button
                      type="button"
                      aria-label={`${favoritePresetIds.includes(preset.id) ? (lang === 'tr' ? 'Favorilerden Ã§Ä±kar' : 'Remove from favorites') : (lang === 'tr' ? 'Favorilere ekle' : 'Add to favorites')}: ${scenarioTitle}`}
                      aria-pressed={favoritePresetIds.includes(preset.id)}
                      onClick={() => toggleFavoritePreset(preset.id)}
                      className="absolute right-3 top-3 rounded-lg border border-slate-700 bg-slate-900/90 px-2 py-1 text-lg text-amber-300 hover:border-amber-400/60"
                    >
                      <span aria-hidden="true">{favoritePresetIds.includes(preset.id) ? 'â­' : 'â˜†'}</span>
                    </button>
                  </div>
                );
              })}
              {guidedScenarioPresets.length === 0 && (
                <p className="col-span-full rounded-xl border border-slate-700/80 bg-[#111c2e] px-4 py-5 text-sm text-slate-400">
                  {lang === 'tr'
                    ? 'Bu organ iÃ§in hÄ±zlÄ± senaryo bulunmuyor. Klinik profili soldaki menÃ¼den seÃ§ip evrelemeye devam edebilirsiniz.'
                    : 'No quick scenarios are available for this organ. Select the clinical profile from the sidebar and continue to staging.'}
                </p>
              )}
            </div>
            <div className="mt-4 flex flex-col gap-3 rounded-xl border border-slate-700/80 bg-[#0a0f1d]/70 p-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="min-w-0 text-xs text-slate-300">
                <span className="font-semibold text-slate-100">
                  {lang === 'tr' ? `SeÃ§ili profil: ${SUBTYPE_DISPLAY_MAP[currentTnmKey] || currentTnmKey.toUpperCase()}` : `Selected profile: ${SUBTYPE_DISPLAY_MAP[currentTnmKey] || currentTnmKey.toUpperCase()}`} <a href={(NCCN_GUIDELINE_MAP[currentTnmKey] || NCCN_GUIDELINE_MAP[selectedOrgan] || { url: 'https://www.nccn.org/guidelines/category_1', title: 'NCCN Guidelines', hint: 'General Cancer Guidelines' }).url} target="_blank" rel="noopener noreferrer" className="ml-2 text-sm underline">{(NCCN_GUIDELINE_MAP[currentTnmKey] || NCCN_GUIDELINE_MAP[selectedOrgan] || { url: 'https://www.nccn.org/guidelines/category_1', title: 'NCCN Guidelines', hint: 'General Cancer Guidelines' }).title} â†—</a> <span className="ml-1 text-xs text-gray-400">{(NCCN_GUIDELINE_MAP[currentTnmKey] || NCCN_GUIDELINE_MAP[selectedOrgan] || { url: 'https://www.nccn.org/guidelines/category_1', title: 'NCCN Guidelines', hint: 'General Cancer Guidelines' }).hint}</span>
                </span>{' '}
                {reportOrganNames[selectedOrgan]} Â· {tText(reportDiagnosis)}
                <span className="mx-2 text-slate-600">|</span>
                <span className="font-semibold text-slate-100">
                  {lang === 'tr' ? 'Tedavi amacÄ± / endikasyon:' : 'Treatment intent / indication:'}
                </span>{' '}
                <span className="text-slate-400">{tText(activeScheme.indication)}</span>
              </div>
            </div>
          </section>
        )}

        {!isGuidedMode && (
          <div className="col-span-12 mb-3 grid h-11 grid-cols-3 items-center gap-1 rounded-xl border border-slate-800 bg-[#0e1726] p-1 lg:hidden" role="tablist" aria-label={lang === 'tr' ? 'Klinik paneller' : 'Clinical panels'}>
            {[
              { id: 'parameters' as const, label: lang === 'tr' ? '1. Parametreler' : '1. Parameters' },
              { id: 'tnm' as const, label: lang === 'tr' ? '2. TNM Tablosu' : '2. TNM Table' },
              { id: 'prescription' as const, label: lang === 'tr' ? '3. ReÃ§ete & Doz' : '3. Prescription & Dose' },
            ].map(tab => (
              <button
                key={tab.id}
                type="button"
                role="tab"
                aria-selected={activeMobilePanel === tab.id}
                onClick={() => setActiveMobilePanel(tab.id)}
                className={`flex h-9 items-center justify-center truncate rounded-lg px-1 text-center text-xs font-semibold transition-all ${
                  activeMobilePanel === tab.id
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-300 hover:bg-slate-800'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        )}

        {/* ==========================================
                    SOL SÃœTUN (~42%): PARAMETRELER, EVRELEME, HIZLI VAKALAR, PROGNOSTÄ°K
           ========================================== */}
        <aside className={`col-span-12 flex flex-col gap-2.5 lg:gap-4 ${
          isGuidedMode
            ? (guidedStep === 2 || guidedStep === 3) ? 'lg:col-span-5 xl:max-w-[760px] xl:justify-self-end' : 'hidden'
                    : `lg:col-span-5 ${activeMobilePanel !== 'parameters' ? 'hidden lg:flex' : ''}`
        }`}>
          <div className="rounded-xl border border-blue-200/80 bg-gradient-to-r from-blue-50 to-indigo-50/60 p-3 shadow-sm dark:border-blue-800/60 dark:from-blue-950/40 dark:to-indigo-950/20">
            <div className="mb-1.5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-blue-600" aria-hidden="true" />
                <span className="text-xs font-bold text-slate-900 dark:text-white">
                  {lang === 'tr' ? 'AI Rapor Okuyucu & Evreleme' : 'AI Medical Report Stager'}
                </span>
              </div>
            </div>
            <p className="mb-2.5 text-[11px] text-slate-500 dark:text-slate-200">
              {lang === 'tr' ? 'Rapor metnini yapÄ±ÅŸtÄ±rarak hastanÄ±n evresini ve tedavi ÅŸemasÄ±nÄ± otomatik doldurun.' : 'Paste pathology or imaging report to auto-extract TNM stage and protocol.'}
            </p>
            <button
              type="button"
              onClick={() => {
                setUploadedFileName('');
                setIsDragging(false);
                setIsReportModalOpen(true);
              }}
              className="flex w-full items-center justify-center gap-1.5 rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white shadow-sm transition hover:bg-blue-700"
            >
              <UploadCloud className="h-3.5 w-3.5" aria-hidden="true" />
              <span>{lang === 'tr' ? 'Rapor YapÄ±ÅŸtÄ±r & Otomatik Evrele' : 'Paste Report & Auto-Stage'}</span>
            </button>
          </div>

          {/* EVRENSEL PATOLOJÄ°K HÄ°STOLOJÄ° / ALT TÄ°P SEÃ‡Ä°CÄ° */}
          {currentHistologies.length > 0 && (
            <div className="p-3 rounded-2xl bg-[#0f172a] border border-slate-800 shadow-sm mb-4">
              <div className="mb-2">
                <span className="text-[11px] font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                  <span className="text-sky-400">ğŸ”¬</span> {lang === 'tr' ? 'Patoloji' : 'Pathology'}
                </span>
              </div>
              <div className="flex w-full flex-col gap-2">
                {currentHistologies.map(h => (
                  <button
                    key={h.id}
                    type="button"
                    onClick={() => handleHistologySelect(h.id)}
                    className={`flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-left text-xs transition-all ${
                      selectedHistology === h.id
                        ? 'bg-sky-600 font-semibold text-white shadow-md shadow-sky-600/20 ring-1 ring-sky-400'
                        : 'border border-slate-700/80 bg-[#131f33] font-medium text-slate-200 hover:border-slate-500 hover:bg-[#182842] hover:text-white'
                    }`}
                  >
                    <span>{tText(h.name)}</span>
                    <span className="ml-3 shrink-0" aria-hidden="true">
                      {selectedHistology === h.id ? 'âœ“' : ''}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* DÄ°NAMÄ°K RÄ°SK FAKTÃ–RLERÄ° VE CERRAHÄ° FORMU */}
          <div className="rounded-2xl bg-[#0c1322] border border-slate-800 p-3 shadow-sm flex flex-col gap-2.5 lg:p-5 lg:gap-3">
            <h2 className="text-xs font-bold text-amber-700 uppercase tracking-wider flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5" />
              {lang === 'tr' ? 'KLÄ°NÄ°K PARAMETRELER & RÄ°SK' : 'CLINICAL PARAMETERS & RISK'}
            </h2>
            {patientAgeYears !== '' && (
              <label className="flex max-w-40 flex-col gap-1 text-[11px] font-medium text-slate-300">
                {lang === 'tr' ? 'Hasta yaÅŸÄ± (yÄ±l)' : 'Patient age (years)'}
                <input
                  type="number"
                  min="0"
                  max="120"
                  value={patientAgeYears}
                  onChange={event => {
                    const value = event.currentTarget.value;
                    if (value === '' || (Number(value) >= 0 && Number(value) <= 120)) setPatientAgeYears(value);
                  }}
                  className="w-full rounded-lg border border-slate-700 bg-[#131f33] px-2.5 py-2 text-xs text-slate-100 focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
                />
              </label>
            )}

            {/* GÄ°S: CRM VE SOLUNUM HAREKETÄ° PARAMETRELERÄ° */}
            {selectedOrgan === 'gis' && (
              <div className="flex flex-col gap-3 text-xs">
                {gisOrgan === 'Rektum' && (
                  <div>
                    <span className="mb-1 block font-semibold text-slate-300">
                      {lang === 'tr' ? 'MR CRM (Mezorektal Fasya) Durumu' : 'MRI CRM (Mesorectal Fascia) Status'}
                    </span>
                    <div className="grid grid-cols-2 gap-1.5">
                      {[
                        { value: 'Negatif' as const, label: lang === 'tr' ? 'CRM Negatif (>1 mm)' : 'CRM Negative (>1 mm)' },
                        { value: 'Pozitif' as const, label: lang === 'tr' ? 'CRM Pozitif / Tehlikeli (â‰¤1 mm)' : 'CRM Positive / Threatened (â‰¤1 mm)' },
                      ].map(option => (
                        <button
                          key={option.value}
                          type="button"
                          aria-pressed={gisCrmStatus === option.value}
                          onClick={() => setGisCrmStatus(option.value)}
                          className={parameterButtonClass(gisCrmStatus === option.value)}
                        >
                          {option.label}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
                {gisOrgan === 'Karaciger' && (
                  <>
                    {liverHistology === 'hcc' && (
                      <label className="block font-semibold text-slate-300">
                        {lang === 'tr' ? 'BCLC klinik evresi' : 'BCLC clinical stage'}
                        <select
                          value={liverBclcStage}
                          onChange={event => {
                            const stage = event.currentTarget.value as typeof liverBclcStage;
                            setLiverBclcStage(stage);
                            setSelectedT(stage === 'C' ? 'T3' : stage === 'B' ? 'T2' : 'T1a');
                            setSelectedN('N0');
                            setSelectedM('M0');
                          }}
                          className="mt-1 w-full rounded-lg border border-slate-700 bg-[#131f33] p-2 text-slate-100"
                        >
                          <option value="0">BCLC 0 Â· {lang === 'tr' ? 'Ã‡ok erken' : 'Very early'}</option>
                          <option value="A">BCLC A Â· {lang === 'tr' ? 'Erken' : 'Early'}</option>
                          <option value="B">BCLC B Â· {lang === 'tr' ? 'Orta' : 'Intermediate'}</option>
                          <option value="C">BCLC C Â· {lang === 'tr' ? 'Ä°leri / PVTT' : 'Advanced / PVTT'}</option>
                        </select>
                      </label>
                    )}
                    <div>
                      <span className="mb-1 block font-semibold text-slate-300">
                        {lang === 'tr' ? 'Solunum Hareketi YÃ¶netimi (SBRT)' : 'Respiratory Motion Management'}
                      </span>
                      <div className="grid grid-cols-1 gap-1.5 sm:grid-cols-2">
                        {[
                          { value: '4D-CT' as const, label: lang === 'tr' ? '4D-CT Â· Serbest Solunum / ITV' : '4D-CT Â· Free Breathing / ITV' },
                          { value: 'DIBH' as const, label: lang === 'tr' ? 'DIBH Â· Nefes Tutma / GTVâ†’PTV' : 'DIBH Â· Breath-Hold / GTVâ†’PTV' },
                        ].map(option => (
                          <button
                            key={option.value}
                            type="button"
                            aria-pressed={breathingMotion === option.value}
                            onClick={() => setBreathingMotion(option.value)}
                            className={parameterButtonClass(breathingMotion === option.value)}
                          >
                            {option.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  </>
                )}
                {gisOrgan === 'SafraYollari' && (
                  <>
                    <label className="block font-semibold text-slate-300">
                      {lang === 'tr' ? 'Tedavi baÄŸlamÄ±' : 'Treatment setting'}
                      <select value={biliaryTreatmentSetting} onChange={event => setBiliaryTreatmentSetting(event.currentTarget.value as typeof biliaryTreatmentSetting)} className="mt-1 w-full rounded-lg border border-slate-700 bg-[#131f33] p-2 text-slate-100">
                        <option value="adjuvant">{lang === 'tr' ? 'Postoperatif yÃ¼ksek risk / adjuvan' : 'Postoperative high-risk / adjuvant'}</option>
                        <option value="unresectable">{lang === 'tr' ? 'Ä°noperabl lokal ileri' : 'Unresectable locally advanced'}</option>
                      </select>
                    </label>
                    {biliaryTreatmentSetting === 'adjuvant' && (
                      <div>
                        <span className="mb-1 block font-semibold text-slate-300">{lang === 'tr' ? 'Rezeksiyon marjini' : 'Resection margin'}</span>
                        <div className="grid grid-cols-2 gap-1.5">
                          {(['R0', 'R1'] as const).map(value => (
                            <button key={value} type="button" aria-pressed={biliaryMarginStatus === value} onClick={() => setBiliaryMarginStatus(value)} className={parameterButtonClass(biliaryMarginStatus === value)}>{value}</button>
                          ))}
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            )}

            {/* TORAKS: KHDAK PARAMETRELERÄ° */}
            {selectedOrgan === 'thorax' && thoraxSubtype === 'nsclc' && (
              <div className="flex flex-col gap-3 text-xs">
                <div>
                  <label className="text-slate-600 block mb-1">{lang === 'tr' ? 'TÃ¼mÃ¶r YerleÅŸimi (Santralite)' : 'Tumor Centrality / Location'}</label>
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
                        className={parameterButtonClass(thoraxCentrality === item.id)}
                      >
                        {tText(item.label)}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="text-slate-600 block mb-1">{lang === 'tr' ? 'Cerrahi / Operabilite Durumu' : 'Surgical / Operability Status'}</label>
                  <select
                    value={thoraxSurgeryStatus}
                    onChange={e => {
                      const value = parseOption(e.currentTarget.value, ['Inoperable', 'Operable', 'Postop_R0', 'Postop_R1_R2'] as const);
                      if (value) setThoraxSurgeryStatus(value);
                    }}
                    className="bg-white border border-slate-300 text-xs rounded-md p-2.5 text-slate-900 w-full"
                  >
                    <option value="Inoperable">{lang === 'tr' ? 'Medikal Ä°noperabl / Cerrahi Red' : 'Medically Inoperable / Surgical Refusal'}</option>
                    <option value="Operable">{lang === 'tr' ? 'Medikal Operabl' : 'Medically Operable'}</option>
                    <option value="Postop_R0">{lang === 'tr' ? 'Postoperatif R0 Rezeksiyon' : 'Postoperative R0 Resection'}</option>
                    <option value="Postop_R1_R2">{lang === 'tr' ? 'Postoperatif R1 / R2 Rezeksiyon' : 'Postoperative R1 / R2 Resection'}</option>
                  </select>
                </div>
                {selectedM === 'M0' && selectedN === 'N0' && (selectedT.startsWith('T1') || selectedT === 'T2') && (
                  <div>
                    <span className="mb-1 block font-semibold text-slate-300">
                      {lang === 'tr' ? 'Solunum Hareketi YÃ¶netimi (SBRT)' : 'Respiratory Motion Management'}
                    </span>
                    <div className="grid grid-cols-1 gap-1.5 sm:grid-cols-2">
                      {[
                        { value: '4D-CT' as const, label: lang === 'tr' ? '4D-CT Â· Serbest Solunum / ITV' : '4D-CT Â· Free Breathing / ITV' },
                        { value: 'DIBH' as const, label: lang === 'tr' ? 'DIBH Â· Nefes Tutma / GTVâ†’PTV' : 'DIBH Â· Breath-Hold / GTVâ†’PTV' },
                      ].map(option => (
                        <button
                          key={option.value}
                          type="button"
                          aria-pressed={breathingMotion === option.value}
                          onClick={() => setBreathingMotion(option.value)}
                          className={parameterButtonClass(breathingMotion === option.value)}
                        >
                          {option.label}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {selectedOrgan === 'thorax' && thoraxSubtype === 'thymoma' && (
              <div className="flex flex-col gap-3 text-xs">
                <div>
                  <span className="mb-1 block font-semibold text-slate-300">
                    {lang === 'tr' ? 'Histolojik Alt Tip' : 'Histologic Subtype'}
                  </span>
                  <div className="grid grid-cols-1 gap-1.5 sm:grid-cols-2">
                    {[
                      { value: 'thymoma' as const, label: lang === 'tr' ? 'Timoma Â· WHO Aâ€“B3' : 'Thymoma Â· WHO Aâ€“B3' },
                      { value: 'thymic-carcinoma' as const, label: lang === 'tr' ? 'Timik Karsinom Â· Tip C' : 'Thymic Carcinoma Â· Type C' },
                    ].map(option => (
                      <button
                        key={option.value}
                        type="button"
                        aria-pressed={thymicHistology === option.value}
                        onClick={() => setThymicHistology(option.value)}
                        className={`rounded-lg border p-2 text-left font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${
                          thymicHistology === option.value
                            ? 'border-blue-400 bg-blue-600 text-white'
                            : 'border-slate-700 bg-slate-800 text-slate-200 hover:border-slate-500 hover:bg-slate-700'
                        }`}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                </div>
                {thymicHistology === 'thymoma' && (
                  <>
                    <label className="font-medium text-slate-300">
                      {lang === 'tr' ? 'Masaoka-Koga Evresi' : 'Masaoka-Koga Stage'}
                      <select
                        value={thymomaStage}
                        onChange={event => setThymomaStage(event.currentTarget.value as typeof thymomaStage)}
                        className="mt-1 w-full rounded-md border border-slate-700 bg-slate-800 p-2.5 text-slate-100"
                      >
                        <option value="Masaoka_I">Evre I</option>
                        <option value="Masaoka_II">Evre II</option>
                        <option value="Masaoka_III">Evre III</option>
                        <option value="Masaoka_IV">Evre IV</option>
                      </select>
                    </label>
                    <label className="font-medium text-slate-300">
                      {lang === 'tr' ? 'Cerrahi SÄ±nÄ±r' : 'Surgical Margin'}
                      <select
                        value={thymomaMargin}
                        onChange={event => setThymomaMargin(event.currentTarget.value as typeof thymomaMargin)}
                        className="mt-1 w-full rounded-md border border-slate-700 bg-slate-800 p-2.5 text-slate-100"
                      >
                        <option value="R0">R0 â€” Negatif</option>
                        <option value="R1">R1 â€” Mikroskobik Pozitif</option>
                        <option value="R2">R2 â€” Makroskobik RezidÃ¼</option>
                      </select>
                    </label>
                  </>
                )}
              </div>
            )}

            {/* TORAKS: KHAK (SCLC) PARAMETRELERÄ° */}
            {/* MEZOTELYOMA TEDAVÄ° AMACI */}
            {selectedOrgan === 'thorax' && thoraxSubtype === 'mesothelioma' && (
              <div className="flex flex-col gap-2 text-xs">
                <label className="text-slate-600 block mb-1">{lang === 'tr' ? 'Tedavi AmacÄ± / Cerrahi Durum' : 'Treatment Intent / Surgical Status'}</label>
                <div className="grid grid-cols-1 gap-1.5">
                  {[
                    { id: 'Palyatif', label: lang === 'tr' ? 'Palyatif Semptom KontrolÃ¼ (30 Gy/10 fx)' : 'Palliative Symptom Control (30 Gy/10 fx)' },
                    { id: 'Hemitorasik_Postop', label: lang === 'tr' ? 'Adjuvan Hemitorasik RT (P/D veya EPD SonrasÄ±)' : 'Adjuvant Hemithoracic RT (post P/D or EPD)' },
                    { id: 'Dren_Yeri', label: lang === 'tr' ? 'GiriÅŸim / Dren Yeri Profilaksisi (21 Gy/3 fx)' : 'Procedure / Drain Tract Prophylaxis (21 Gy/3 fx)' },
                  ].map(item => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => {
                        const value = parseOption(item.id, ['Palyatif', 'Hemitorasik_Postop', 'Dren_Yeri'] as const);
                        if (value) setMesoIntent(value);
                      }}
                      className={parameterButtonClass(mesoIntent === item.id)}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {selectedOrgan === 'thorax' && thoraxSubtype === 'sclc' && (
              <div className="flex flex-col gap-3 text-xs">
                <div>
                  <label className="text-slate-600 block mb-1">{tText("KHAK Klinik Evresi")}</label>
                  <div className="grid grid-cols-2 gap-1.5">
                    {[
                      { id: 'Sinirli', label: 'SÄ±nÄ±rlÄ± Evre (LS-SCLC)' },
                      { id: 'Yaygin', label: 'YaygÄ±n Evre (ES-SCLC)' },
                    ].map(item => (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => {
                          const value = parseOption(item.id, ['Sinirli', 'Yaygin'] as const);
                          if (value) setSclcStage(value);
                        }}
                        className={parameterButtonClass(sclcStage === item.id)}
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
                      <option value="Erken_BID_45Gy">{tText("45 Gy / 30 fx (GÃ¼nde 2x1.5 Gy - Turrisi AltÄ±n Standart)")}</option>
                      <option value="Standart_QD_60Gy">{tText("60 Gy / 30 fx (GÃ¼nde tek 2.0 Gy - CONVERT)")}</option>
                    </select>
                  </div>
                )}
              </div>
            )}

            {/* JÄ°NEKOLOJÄ°: SERVÄ°KS PARAMETRELERÄ° */}
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
                  <option value="Definitif_KRT">{tText("Definitif KRT + 3D IGABT (Lokal Ä°leri)")}</option>
                  <option value="Adjuvan_Peters">{tText("Cerrahi SonrasÄ± YÃ¼ksek Risk (Peters: R1/LN+/Parametrium)")}</option>
                  <option value="Adjuvan_Sedlis">{tText("Cerrahi SonrasÄ± Orta Risk (Sedlis: LVSI/Derin Ä°nvazyon)")}</option>
                </select>
              </div>
            )}

            {/* JÄ°NEKOLOJÄ°: ENDOMETRÄ°YUM PARAMETRELERÄ° */}
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
                  <option value="Low">{tText("DÃ¼ÅŸÃ¼k Risk (Evre IA G1-2, LVSI yok - Ä°zlem)")}</option>
                  <option value="Intermediate">{tText("Orta Risk (Evre IB G1-2 veya IA G3)")}</option>
                  <option value="High_Intermediate">{tText("YÃ¼ksek-Orta Risk (PORTEC-2: YalnÄ±zca VCB Brakiterapisi)")}</option>
                  <option value="High">{tText("YÃ¼ksek Risk (Evre III / SerÃ¶z / Derin Ä°nvazyon - PORTEC-3 KRT)")}</option>
                </select>
              </div>
            )}

            {/* JÄ°NEKOLOJÄ°: OVER & TUBA PARAMETRELERÄ° */}
            {selectedOrgan === 'gynecology' && gynSite === 'Over_Tuba' && (
              <div className="flex flex-col gap-2.5 text-xs">
                <label className="text-slate-600 block mb-1">{tText("Radyoterapi AmacÄ±")}</label>
                <select
                  value={ovaryScenario}
                  onChange={e => {
                    const value = parseOption(e.currentTarget.value, ['Oligometastatik_SBRT', 'Palyatif_Kitle_Agri'] as const);
                    if (value) setOvaryScenario(value);
                  }}
                  className="bg-white border border-slate-300 text-xs rounded-md p-2.5 text-slate-900 w-full"
                >
                  <option value="Oligometastatik_SBRT">{tText("Oligometastatik NÃ¼ks SBRT (1-3 odak ablasyonu)")}</option>
                  <option value="Palyatif_Kitle_Agri">{tText("Palyatif Pelvik Kitle / Hemostaz RT")}</option>
                </select>
              </div>
            )}

            {/* JÄ°NEKOLOJÄ°: VULVA PARAMETRELERÄ° */}
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
                  <option value="Adjuvan_Cerrahi_Sonrasi">{tText("Cerrahi SonrasÄ± Adjuvan (<8 mm sÄ±nÄ±r veya KasÄ±k LN+ / ENE)")}</option>
                  <option value="Inoperabl_Lokal_Ileri">{tText("Ä°noperabl / Lokal Ä°leri Definitif KRT")}</option>
                </select>
              </div>
            )}

            {/* KEMÄ°K & SARKOM: YDS PARAMETRELERÄ° */}
            {(selectedOrgan === 'bone' || selectedOrgan === 'sarcoma' || selectedOrgan === 'bone-sarcoma') && sarcomaSubtype === 'Yumusak_Doku' && (
              <div className="flex flex-col gap-2.5 text-xs">
                <label className="text-slate-600 block mb-1">{tText("Radyoterapi ZamanlamasÄ±")}</label>
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
                      className={parameterButtonClass(sarcomaSurgery === item.id)}
                    >
                      {tText(item.label)}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* KEMÄ°K & SARKOM: OSTEOSARKOM PARAMETRELERÄ° */}
            {(selectedOrgan === 'bone' || selectedOrgan === 'bone-sarcoma') && sarcomaSubtype === 'Osteosarkom' && (
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
                  <option value="Marjin_Pozitif_R1_R2">{tText("R1/R2 Rezeksiyon (YÃ¼ksek Doz Eskalasyonu 70 Gy)")}</option>
                  <option value="Inoperabl_Aksiyel_Pelvis">{tText("Ä°noperabl Aksiyel/Pelvis (PartikÃ¼l/IMRT 70+ Gy)")}</option>
                  <option value="Cerrahi_R0_Takip">{tText("R0 Cerrahi Tam Rezeksiyon (RT Gerekmez - Ä°zlem)")}</option>
                </select>
              </div>
            )}

            {/* KEMÄ°K & SARKOM: EWING SARKOMU PARAMETRELERÄ° */}
            {(selectedOrgan === 'bone' || selectedOrgan === 'bone-sarcoma') && sarcomaSubtype === 'Ewing' && (
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
                  <option value="Definitif_RT">{tText("Definitif RT (Cerrahi YapÄ±lamayan / Organ Koruma - 55.8 Gy)")}</option>
                  <option value="Postop_R1">{tText("Postoperatif R1 Cerrahi SÄ±nÄ±r (45-50.4 Gy Adjuvan RT)")}</option>
                </select>
              </div>
            )}
            {(selectedOrgan === 'sarcoma' || selectedOrgan === 'bone-sarcoma') && sarcomaSubtype === 'DFSP' && (
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
                      <option value="Erken_Glottik_T1_T2">{tText("Erken glottik T1-T2 N0 (yalnÄ±z vokal kord, 63 Gy/28 fx)")}</option>
                      <option value="Lokal_Ileri_T3_T4">{tText("Lokal ileri supraglottik/glottik T3-T4")}</option>
                    </select>
                  </div>
                )}
                <div className="grid grid-cols-2 gap-2">
                  <label className="flex items-center gap-2 text-slate-700">
                    <input type="checkbox" checked={hnCrossesMidline} onChange={e => setHnCrossesMidline(e.currentTarget.checked)} />
                    {tText("\n                    Orta hattÄ± geÃ§iyor\n                  ")}</label>
                  <label className="text-slate-600">
                    {tText("\n                    Orta hatta uzaklÄ±k (cm)\n                    ")}<input type="number" min="0" step="0.1" value={hnDistanceFromMidlineCm} onChange={e => setHnDistanceFromMidlineCm(e.currentTarget.value)} className="mt-1 bg-white border border-slate-300 rounded-lg p-1.5 text-slate-900 w-full" />
                  </label>
                  <label className="text-slate-600">
                    {tText("\n                    TÃ¼mÃ¶r Ã§apÄ± (cm)\n                    ")}<input type="number" min="0" step="0.1" value={hnTumorSizeCm} onChange={e => setHnTumorSizeCm(e.currentTarget.value)} className="mt-1 bg-white border border-slate-300 rounded-lg p-1.5 text-slate-900 w-full" />
                  </label>
                  <label className="text-slate-600">
                    {tText("\n                    Derin invazyon (DOI, mm)\n                    ")}<input type="number" min="0" step="0.1" value={hnDoiMm} onChange={e => setHnDoiMm(e.currentTarget.value)} className="mt-1 bg-white border border-slate-300 rounded-lg p-1.5 text-slate-900 w-full" />
                  </label>
                </div>
                {(hnSubsite === 'oral-cavity' || hnSubsite === 'maxillary-sinus') && (
                  <div className="grid grid-cols-2 gap-2">
                    <label className="flex items-center gap-2 text-slate-700">
                      <input type="checkbox" checked={hnENE} onChange={e => setHnENE(e.currentTarget.checked)} />
                      {tText("\n                      Ekstranodal yayÄ±lÄ±m (ENE)\n                    ")}</label>
                    <label className="flex items-center gap-2 text-slate-700">
                      <input type="checkbox" checked={hnPositiveMargin} onChange={e => setHnPositiveMargin(e.currentTarget.checked)} />
                      {tText("\n                      Pozitif cerrahi sÄ±nÄ±r (R1)\n                    ")}</label>
                  </div>
                )}
              </div>
            )}

            {/* GÃœS ALT BÃ–LGE PARAMETRELERÄ° */}
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
                  <label className="text-slate-600 block mb-1">{tText("Pozitif biyopsi kor oranÄ± (%)")}</label>
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
                    {tText("\n                    EkstrakapsÃ¼ler yayÄ±lÄ±m (ECE)\n                  ")}</button>
                  <button
                    type="button"
                    aria-pressed={hasSVI}
                    onClick={() => setHasSVI(value => !value)}
                    className={`rounded-lg border p-2 ${hasSVI ? 'border-emerald-300 bg-emerald-50 text-emerald-800' : 'border-slate-300 text-slate-600'}`}
                  >
                    {tText("\n                    Seminal vezikÃ¼l invazyonu\n                  ")}</button>
                </div>
                <div className="rounded-lg border border-sky-300 bg-blue-50 p-2 font-semibold text-blue-900">
                  {tText("\n                  Otomatik NCCN risk grubu: ")}{prostateRiskLabel}
                </div>
              </div>
            )}

            {selectedOrgan === 'prostate' && gusSubtype === 'kidney' && (
              <div className="space-y-2 text-xs">
                <label className="block text-slate-300">
                  {lang === 'tr' ? 'RCC tedavi baÄŸlamÄ±' : 'RCC treatment setting'}
                  <select value={renalDiseaseSetting} onChange={event => setRenalDiseaseSetting(event.currentTarget.value as typeof renalDiseaseSetting)} className="mt-1 w-full rounded-lg border border-slate-700 bg-[#131f33] p-2 text-slate-100">
                    <option value="primary-inoperable">{lang === 'tr' ? 'Medikal inoperabl primer RCC' : 'Medically inoperable primary RCC'}</option>
                    <option value="oligometastatic">{lang === 'tr' ? 'Oligometastatik / immÃ¼noterapi altÄ±nda oligoprogresyon' : 'Oligometastatic / oligoprogressive on immunotherapy'}</option>
                  </select>
                </label>
                {renalDiseaseSetting === 'primary-inoperable' && (
                  <>
                    <label className="block text-slate-300">
                      {lang === 'tr' ? 'Primer tÃ¼mÃ¶r Ã§apÄ± (cm; FASTRACK II doz seÃ§imi)' : 'Primary tumour diameter (cm; FASTRACK II dose selection)'}
                      <input
                        type="number"
                        min="0.1"
                        max="30"
                        step="0.1"
                        value={renalTumorSizeCm}
                        onChange={event => setRenalTumorSizeCm(event.currentTarget.value)}
                        className="mt-1 w-full rounded-lg border border-slate-700 bg-[#131f33] p-2 text-slate-100"
                      />
                    </label>
                  <p className="rounded-lg border border-amber-700/40 bg-amber-950/20 p-2 text-[10px] leading-relaxed text-amber-200">
                    {lang === 'tr'
                      ? 'FASTRACK II doz seÃ§imi gerÃ§ek tÃ¼mÃ¶r Ã§apÄ±na gÃ¶re yapÄ±lÄ±r: â‰¤4 cm iÃ§in 26 Gy Ã— 1; >4â€“10 cm iÃ§in 42 Gy / 3 fx. T kategorisi tek baÅŸÄ±na tÃ¼mÃ¶r Ã§apÄ±nÄ±n yerine geÃ§mez.'
                      : 'FASTRACK II dose selection is by actual tumour diameter: â‰¤4 cm, 26 Gy Ã— 1; >4â€“10 cm, 42 Gy / 3 fx. T category alone does not replace measured tumour size.'}
                  </p>
                  </>
                )}
              </div>
            )}

            {selectedOrgan === 'prostate' && gusSubtype === 'bladder' && (
              <div className="space-y-2 text-xs">
                <label className="flex items-center gap-2 text-slate-700">
                  <input type="checkbox" checked={bladderTurbtComplete} onChange={e => setBladderTurbtComplete(e.currentTarget.checked)} />
                  {tText("\n                  Maksimal TURBT tamamlandÄ±\n                ")}</label>
                <label className="flex items-center gap-2 text-slate-700">
                  <input type="checkbox" checked={bladderTmtSuitable} onChange={e => setBladderTmtSuitable(e.currentTarget.checked)} />
                  {tText("\n                  Mesane koruyucu TMT iÃ§in klinik uygunluk\n                ")}</label>
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

            {/* MEME PARAMETRELERÄ° */}
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
                        className={parameterButtonClass(breastMenopause === value)}
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
                    <label className="text-slate-600 block mb-1">{tText("Cerrahi SÄ±nÄ±r")}</label>
                    <select
                      value={breastMargin}
                      onChange={e => {
                        const value = parseOption(e.currentTarget.value, ['Negatif', 'Yakin', 'Pozitif'] as const);
                        if (value) setBreastMargin(value);
                      }}
                      className="bg-white border border-slate-300 rounded-md p-2 text-slate-900 w-full"
                    >
                      <option value="Negatif">{tText("Negatif (â‰¥2 mm)")}</option>
                      <option value="Yakin">{tText("YakÄ±n (<2 mm)")}</option>
                      <option value="Pozitif">{tText("Pozitif (R1)")}</option>
                    </select>
                  </div>
                </div>
                {breastHistology === 'Malign Filloides TÃ¼mÃ¶rÃ¼' ? (
                  <div className="space-y-2">
                    <label className="text-slate-600 block">{tText("En yakÄ±n cerrahi marjin (cm)")}</label>
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
                      {tText("\n                      YÃ¼ksek dereceli stromal aÅŸÄ±rÄ± bÃ¼yÃ¼me\n                    ")}</label>
                  </div>
                ) : (
                  <>
                    <label className="flex items-center gap-2 text-slate-700">
                      <input type="checkbox" checked={breastBoost} onChange={e => setBreastBoost(e.currentTarget.checked)} />
                      {tText("\n                      TÃ¼mÃ¶r yataÄŸÄ± boostu (10-16 Gy) uygula\n                    ")}</label>
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
                            className={parameterButtonClass(marker.value)}
                          >
                            {marker.value && <Check className="h-3.5 w-3.5" aria-hidden="true" />}
                            {marker.label}{marker.value ? '+' : '-'}
                        </button>
                      ))}
                      <div role="group" aria-label="Ki-67" className="col-span-2 grid grid-cols-2 gap-1.5">
                        {[
                          { label: '<20%', value: 'Low' },
                          { label: 'â‰¥20%', value: 'High' },
                        ].map(option => {
                          const selected = (Number.parseFloat(breastKi67) >= 20) === (option.value === 'High');
                          return (
                            <button
                              key={option.value}
                              type="button"
                              aria-pressed={selected}
                              onClick={() => setBreastKi67(option.value === 'High' ? '20' : '19')}
                              className={parameterButtonClass(selected)}
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
                      {tText("\n                      BiyobelirteÃ§ler sistemik tedavi kararÄ±nda onkoloji ekibiyle birlikte yorumlanÄ±r.\n                    ")}</p>
                  </>
                )}
              </div>
            )}

            {/* MSS BEYÄ°N METASTAZI PARAMETRELERÄ° */}
            {selectedOrgan === 'cns' && cnsSubtype === 'mets' && (
              <div className="flex flex-col gap-2.5 text-xs">
                <div>
                  <label className="text-slate-600 block mb-1">{tText("Orta Hat Åifti (Herniasyon)")}</label>
                  <select
                    value={cnsMidlineShift}
                    onChange={e => {
                      const value = e.currentTarget.value;
                      if (value === 'Yok' || value === '<5mm' || value === '>=5mm') setCnsMidlineShift(value);
                    }}
                    className="bg-white border border-slate-300 rounded-md p-2 text-slate-900 w-full"
                  >
                    <option value="Yok">{tText("Åift yok")}</option>
                    <option value="<5mm">{tText("Hafif ÅŸift (<5 mm)")}</option>
                    <option value=">=5mm">{tText('Kritik Åift (â‰¥5 mm - Acil Dekompresyon)')}</option>
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
                    <option value="Semptomatik">{tText("Semptomatik (Ã¶dem / defisit / kitle etkisi)")}</option>
                  </select>
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-slate-600 block mb-1">{tText("Metastaz SayÄ±sÄ±")}</label>
                    <input
                      type="number"
                      min="1"
                      value={cnsMetCount}
                      onChange={e => setCnsMetCount(e.target.value)}
                      className="bg-white border border-slate-300 rounded-md p-1.5 text-center text-slate-900 w-full"
                    />
                  </div>
                  <div>
                    <label className="text-slate-600 block mb-1">{tText("Maks Ã‡ap (cm)")}</label>
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
                <label className="text-slate-600 block">{tText("Performans / tedavi uygunluÄŸu")}</label>
                <select
                  value={gbmPerformance}
                  onChange={e => {
                    const value = e.currentTarget.value;
                    if (value === 'Iyi_ECOG_0_1' || value === 'Duskun_Yasli') setGbmPerformance(value);
                  }}
                  className="bg-white border border-slate-300 rounded-md p-2 text-slate-900 w-full"
                >
                  <option value="Iyi_ECOG_0_1">{tText("Ä°yi performans (ECOG 0-1): Stupp")}</option>
                  <option value="Duskun_Yasli">{tText("YaÅŸlÄ± / dÃ¼ÅŸkÃ¼n: Perry hipofraksiyone KRT")}</option>
                </select>
                <label className="text-slate-600">{tText("KPS: ")}{cnsKps}
                  <input type="range" min="0" max="100" step="10" value={cnsKps} onChange={e => setCnsKps(e.currentTarget.value)} className="block w-full" />
                </label>
              </div>
            )}
            {/* MSS GLÄ°OM: GRADE + PIGNATTI / RTOG 9802 RÄ°SK FAKTÃ–RLERÄ° */}
            {selectedOrgan === 'cns' && cnsSubtype === 'glioma' && (
              <div className="flex flex-col gap-2.5 text-xs">
                <div>
                  <span className="mb-1 block font-semibold text-slate-300">{lang === 'tr' ? 'WHO Grade' : 'WHO Grade'}</span>
                  <div className="grid grid-cols-4 gap-1.5">
                    {(['Grade_1', 'Grade_2', 'Grade_3', 'Grade_4'] as const).map(grade => (
                      <button
                        key={grade}
                        type="button"
                        aria-pressed={gliomaGrade === grade}
                        onClick={() => setGliomaGrade(grade)}
                        className={parameterButtonClass(gliomaGrade === grade)}
                      >
                        {grade.replace('_', ' ')}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <span className="mb-1 block font-semibold text-slate-300">{lang === 'tr' ? 'Pignatti / RTOG 9802 YÃ¼ksek Risk Kriterleri' : 'Pignatti / RTOG 9802 High-Risk Criteria'}</span>
                  <div className="grid grid-cols-1 gap-1.5">
                    {([
                      { key: 'age40', label: lang === 'tr' ? 'YaÅŸ â‰¥ 40' : 'Age â‰¥ 40' },
                      { key: 'subtotalResection', label: lang === 'tr' ? 'Subtotal rezeksiyon / biyopsi (STR)' : 'Subtotal resection / biopsy (STR)' },
                      { key: 'largeOrCrossing', label: lang === 'tr' ? 'Ã‡ap â‰¥ 5 cm veya korpus kallozum geÃ§iÅŸi' : 'Diameter â‰¥ 5 cm or corpus callosum crossing' },
                      { key: 'neurologicSymptoms', label: lang === 'tr' ? 'NÃ¶rolojik defisit / semptom' : 'Neurological deficit / symptoms' },
                      { key: 'molecularHighRisk', label: lang === 'tr' ? 'MolekÃ¼ler yÃ¼ksek risk (IDH-wt, CDKN2A/B del, TERT mut)' : 'Molecular high risk (IDH-wt, CDKN2A/B del, TERT mut)' },
                    ] as const).map(item => (
                      <button
                        key={item.key}
                        type="button"
                        aria-pressed={gliomaRiskFactors[item.key]}
                        onClick={() => setGliomaRiskFactors(prev => ({ ...prev, [item.key]: !prev[item.key] }))}
                        className={parameterButtonClass(gliomaRiskFactors[item.key])}
                      >
                        {item.label}
                      </button>
                    ))}
                  </div>
                </div>
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
                <label className="text-slate-600 block">{tText("Rezeksiyon derecesi / cerrahi sÄ±nÄ±r")}</label>
                <select
                  value={cnsResection}
                  onChange={e => {
                    const value = e.currentTarget.value;
                    if (value === 'Yok' || value === 'GTR' || value === 'STR' || value === 'Biyopsi') setCnsResection(value);
                  }}
                  className="bg-white border border-slate-300 rounded-md p-2 text-slate-900 w-full"
                >
                  <option value="Yok">{tText("Cerrahi yapÄ±lmadÄ±")}</option>
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
                  <option value="IV-V">{tText("Simpson IV-V (STR / rezidÃ¼)")}</option>
                </select>
                <label className="text-slate-600">{tText("Maksimum Ã§ap (cm)\n                  ")}<input type="number" min="0" step="0.1" value={cnsMaxDiameter} onChange={e => setCnsMaxDiameter(e.currentTarget.value)} className="mt-1 bg-white border border-slate-300 rounded-md p-1.5 text-slate-900 w-full" />
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
                    <label className="text-slate-600 block">{tText("Ä°nvazyon derinliÄŸi (mm)\n                      ")}<input type="number" min="0" step="0.1" value={skinDepthMm} onChange={e => setSkinDepthMm(e.currentTarget.value)} className="mt-1 bg-white border border-slate-300 rounded-lg p-1.5 text-slate-900 w-full" />
                    </label>
                    <label className="flex items-center gap-2 text-slate-700">
                      <input type="checkbox" checked={skinPerineuralInvasion} onChange={e => setSkinPerineuralInvasion(e.currentTarget.checked)} />
                      {tText("\n                      PerinÃ¶ral invazyon\n                    ")}</label>
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
                {tText("\n                Sistemik tedaviye yanÄ±t\n                ")}<select
                  value={lymphomaResponse}
                  onChange={e => {
                    const value = e.currentTarget.value;
                    if (value === 'Tam_Yanit' || value === 'Parsiyel_RezidÃ¼') setLymphomaResponse(value);
                  }}
                  className="mt-1 bg-white border border-slate-300 rounded-md p-2.5 text-slate-900 w-full"
                >
                  <option value="Tam_Yanit">{tText("Tam yanÄ±t")}</option>
                  <option value="Parsiyel_RezidÃ¼">{tText("Parsiyel yanÄ±t / rezidÃ¼")}</option>
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
                  <option value="Yuksek">{tText("YÃ¼ksek risk (CSI 36 Gy)")}</option>
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
                  {tText("\n                  YaygÄ±n peritoneal yayÄ±lÄ±m / tÃ¼m batÄ±n RT endikasyonu\n                ")}</label>
              </div>
            )}
            {/* ELECTIVE PALLIATIVE RT SELECTION */}
            {selectedOrgan === 'palliative' && (
              <div className="flex flex-col gap-2 text-xs">
                <span className="mb-1 block font-semibold text-slate-300">{lang === 'tr' ? 'Elektif Palyatif RT' : 'Elective Palliative RT'}</span>
                <div className="grid grid-cols-1 gap-1.5">
                  {[
                    { id: 'Agri', label: lang === 'tr' ? 'Kemik metastazÄ± aÄŸrÄ± palyasyonu' : 'Bone metastasis pain palliation' },
                    { id: 'Beyin', label: lang === 'tr' ? 'Beyin metastazlarÄ± (elektif WBRT / SRS)' : 'Brain metastases (elective WBRT / SRS)' },
                    { id: 'Organ', label: lang === 'tr' ? 'Organ ve yumuÅŸak doku metastazÄ±' : 'Organ and soft-tissue metastases' },
                  ].map(item => (
                    <button
                      key={item.id}
                      type="button"
                      aria-pressed={palliativeIntent === item.id}
                      onClick={() => {
                        const value = parseOption(item.id, ['Agri', 'Beyin', 'Organ'] as const);
                        if (value) setPalliativeIntent(value);
                      }}
                      className={parameterButtonClass(palliativeIntent === item.id)}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
          {(!isGuidedMode || guidedStep === 2 || guidedStep === 3) && (
          <section
            id="guided-prognostic-assessment"
            className="w-full rounded-2xl border border-slate-800 bg-[#0e1726] p-4 shadow-xl sm:p-6"
            aria-labelledby="prognostic-assessment-heading"
          >
            <div className="mb-4 flex flex-col gap-2 border-b border-slate-800 pb-4 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <p className="mb-1 text-[10px] font-bold uppercase tracking-[0.16em] text-sky-300">
                  {lang === 'tr' ? '3. ADIM' : 'STEP 3'}
                </p>
                <h2 id="prognostic-assessment-heading" className="text-lg font-bold text-white">
                  {lang === 'tr'
                    ? 'Prognostik Ä°ndeks ve Risk SÄ±nÄ±flamasÄ±'
                    : 'Prognostic Index & Risk Stratification'}
                </h2>
                <p className="mt-1 text-xs leading-relaxed text-slate-400">
                  {lang === 'tr'
                    ? 'Organ, evre ve girilmiÅŸ klinik deÄŸiÅŸkenlere uygun hesaplanan risk modelini ve kriterlerini inceleyin.'
                    : 'Review the risk model selected from the organ, stage, and entered clinical variables, together with its criteria.'}
                </p>
              </div>
              {prognosticResult && (
                <span className="inline-flex w-fit items-center gap-2 rounded-xl border border-sky-500/30 bg-sky-500/10 px-3 py-2 text-xs font-semibold text-sky-200">
                  <TrendingUp className="h-4 w-4" aria-hidden="true" />
                  {lang === 'tr' ? 'Skor' : 'Score'}: {prognosticResult.score}
                </span>
              )}
            </div>

            {prognosticResult ? (
              <>
                <div className="mb-4 flex flex-col gap-2 rounded-xl border border-sky-500/25 bg-sky-500/[0.05] p-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-white">{tText(prognosticResult.indexName)}</h3>
                    <p className="mt-1 text-xs text-slate-400">
                      {lang === 'tr' ? 'Model risk grubu' : 'Model risk stratum'}
                    </p>
                  </div>
                  <span className="rounded-lg border border-sky-400/30 bg-sky-400/10 px-3 py-2 text-sm font-semibold text-sky-200">
                    {tText(prognosticResult.riskCategory)}
                  </span>
                </div>

                <div className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
                  <div className="rounded-xl border border-slate-700 bg-[#111c2e] p-3">
                    <p className="mb-2 text-[10px] font-bold uppercase tracking-wide text-slate-400">
                      {lang === 'tr' ? 'Beklenen Lokal Kontrol' : 'Expected Local Control'}
                    </p>
                    <p className="text-sm font-semibold text-slate-100">
                      {hasLocalControlEstimate
                        ? tText(prognosticOutcome)
                        : lang === 'tr'
                          ? 'Bu model ayrÄ± bir lokal kontrol tahmini sunmuyor.'
                          : 'This model does not provide a separate local-control estimate.'}
                    </p>
                  </div>
                  <div className="rounded-xl border border-slate-700 bg-[#111c2e] p-3">
                    <p className="mb-2 text-[10px] font-bold uppercase tracking-wide text-slate-400">
                      {hasMedianOsEstimate
                        ? (lang === 'tr' ? 'Medyan Genel SaÄŸkalÄ±m (OS)' : 'Median Overall Survival (OS)')
                        : (lang === 'tr' ? 'Bildirilen SaÄŸkalÄ±m / NÃ¼ks Sonucu' : 'Reported Survival / Recurrence Outcome')}
                    </p>
                    <p className="text-sm font-semibold text-slate-100">
                      {prognosticOutcome
                        ? tText(prognosticOutcome)
                        : lang === 'tr'
                          ? 'Bu model nicel bir saÄŸkalÄ±m tahmini sunmuyor.'
                          : 'This model does not provide a quantitative survival estimate.'}
                    </p>
                  </div>
                  <div className="rounded-xl border border-slate-700 bg-[#111c2e] p-3">
                    <p className="mb-2 text-[10px] font-bold uppercase tracking-wide text-slate-400">
                      {lang === 'tr' ? 'Sistemik Ä°lerleme Riski' : 'Systemic Progression Risk'}
                    </p>
                    <p className="text-sm font-semibold text-slate-100">
                      {selectedM.startsWith('M1')
                        ? tText(prognosticResult.riskCategory)
                        : lang === 'tr'
                          ? 'SeÃ§ili model bu riski ayrÄ± bir olasÄ±lÄ±k olarak hesaplamÄ±yor; model risk grubu yukarÄ±da gÃ¶sterilmiÅŸtir.'
                          : 'The selected model does not calculate this as a separate probability; its overall risk stratum is shown above.'}
                    </p>
                  </div>
                </div>

                <div className="overflow-hidden rounded-xl border border-slate-700/80">
                  <div className="border-b border-slate-700/80 bg-[#131f33] px-3 py-2 text-[10px] font-bold uppercase tracking-wide text-slate-300">
                    {lang === 'tr' ? 'Hesaplama Kriterleri' : 'Calculation Criteria'}
                  </div>
                  <div className="divide-y divide-slate-700/60">
                    {prognosticResult.criteria.map(criterion => (
                      <div key={`${criterion.label_en}-${criterion.value}`} className="flex flex-col gap-1 bg-[#111c2e] px-3 py-2 sm:flex-row sm:items-center sm:justify-between sm:gap-3">
                        <span className="text-xs font-medium text-slate-300">
                          {lang === 'tr' ? criterion.label_tr : criterion.label_en}
                        </span>
                        <span className="text-xs font-semibold text-white sm:text-right">
                          {tText(criterion.value)}
                          {criterion.points && <span className="ml-1 font-mono text-sky-300">[{criterion.points}]</span>}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
                <p className="mt-3 text-[10px] leading-relaxed text-slate-500">
                  {lang === 'tr'
                    ? 'Tahminler yalnÄ±zca modelin aÃ§Ä±kÃ§a raporladÄ±ÄŸÄ± sonuÃ§larÄ± gÃ¶sterir. Model kapsamÄ± ve girdileri klinik ekip tarafÄ±ndan doÄŸrulanmalÄ±dÄ±r.'
                    : 'Only outcomes explicitly reported by the model are shown. The clinical team should verify model applicability and inputs.'}
                </p>
              </>
            ) : (
              <div role="status" className="rounded-xl border border-amber-500/30 bg-amber-500/[0.06] p-4 text-sm leading-relaxed text-amber-100/90">
                {lang === 'tr'
                  ? 'SeÃ§ili organ ve klinik alt tip iÃ§in desteklenen bir prognostik model bulunamadÄ±. Klinik riski baÄŸÄ±msÄ±z olarak deÄŸerlendirin.'
                  : 'No supported prognostic model is available for the selected organ and clinical subtype. Assess clinical risk independently.'}
              </div>
            )}

            {isGuidedMode && guidedStep === 3 && (
              <div className="mt-5 flex flex-col-reverse gap-2 border-t border-slate-800 pt-4 sm:flex-row sm:items-center sm:justify-between">
                <button
                  type="button"
                  onClick={() => setGuidedStep(2)}
                  className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-slate-700 bg-[#111c2e] px-4 py-2.5 text-xs font-semibold text-slate-200 transition hover:border-slate-500 hover:bg-[#182842] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400"
                >
                  <ChevronLeft className="h-4 w-4" aria-hidden="true" />
                  {lang === 'tr' ? 'Evrelemeye DÃ¶n' : 'Back to Staging'}
                </button>
                <button
                  type="button"
                  onClick={() => setGuidedStep(4)}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-xs font-bold text-white shadow-lg shadow-blue-950/30 transition hover:bg-blue-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400"
                >
                  {lang === 'tr' ? 'Tedavi ReÃ§etesine Devam Et' : 'Proceed to Treatment Prescription'}
                  <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
                </button>
              </div>
            )}
          </section>
        )}
        </aside>

        {/* ==========================================
                    ORTA SÃœTUN: GÄ°ZLÄ° (TNM TABLOSU SOL SÃœTUNA TAÅINDI)
           ========================================== */}
        <section className={`col-span-12 flex flex-col gap-4 ${
          isGuidedMode
            ? guidedStep === 2 ? 'lg:col-span-7 xl:max-w-[1100px]' : 'hidden'
                    : 'hidden lg:hidden'
        }`}>
          {!isGuidedMode && selectedOrgan !== 'emergencies' && currentOrganPresets.length > 0 && (
            <div
              className="mb-0 flex flex-wrap items-center gap-2.5"
              role="group"
              aria-label={lang === 'en' ? 'Quick clinical scenarios' : 'HÄ±zlÄ± klinik senaryolar'}
            >
              <span className="flex items-center gap-1 rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-1.5 font-bold text-amber-400">
                <span aria-hidden="true">âš¡</span>
                {lang === 'en' ? 'Quick Scenarios:' : 'HÄ±zlÄ± Vakalar:'}
              </span>
              {currentOrganPresets.map(preset => {
                const isSelected = selectedQuickCaseId === preset.id;
                return (
                  <div key={preset.id} className="inline-flex items-stretch gap-1">
                    <button
                      type="button"
                      title={lang === 'en' ? preset.detail_en : preset.detail_tr}
                      onClick={() => handleQuickCaseSelect(preset)}
                      aria-pressed={isSelected}
                      className={`inline-flex items-center gap-1.5 rounded-lg border px-4 py-2.5 text-xs font-semibold shadow-sm transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 ${
                        isSelected
                          ? 'ring-1 ring-amber-400 border-amber-400/80 bg-amber-500/20 text-white'
                          : 'border-slate-700/80 bg-slate-800/90 text-slate-100 hover:border-amber-400/60 hover:bg-slate-700/80'
                      }`}
                    >
                      <span aria-hidden="true">{preset.badge || 'ğŸ¯'}</span>
                      <span>{lang === 'en' ? preset.title_en : preset.title_tr}</span>
                    </button>
                    <button
                      type="button"
                      aria-label={`${favoritePresetIds.includes(preset.id) ? (lang === 'tr' ? 'Favorilerden Ã§Ä±kar' : 'Remove from favorites') : (lang === 'tr' ? 'Favorilere ekle' : 'Add to favorites')}: ${lang === 'tr' ? preset.title_tr : preset.title_en}`}
                      aria-pressed={favoritePresetIds.includes(preset.id)}
                      onClick={() => toggleFavoritePreset(preset.id)}
                      className="rounded-lg border border-slate-700/80 bg-slate-800/90 px-2 text-amber-300 hover:border-amber-400/60 hover:bg-slate-700/80"
                    >
                      <span aria-hidden="true">{favoritePresetIds.includes(preset.id) ? 'â­' : 'â˜†'}</span>
                    </button>
                  </div>
                );
              })}
            </div>
          )}
          <div className="rounded-2xl bg-[#0e1726] border border-slate-800/90 p-4 shadow-xl shadow-black/40">
            <div className="flex items-center justify-between pb-3 border-b border-slate-700/80 mb-3">
              <div>
                <h2 className="text-xs font-bold uppercase tracking-wider text-slate-200">
                  {selectedOrgan === 'benign' || selectedOrgan === 'palliative' || selectedOrgan === 'emergencies'
                    ? (lang === 'tr' ? 'Klinik Durum ve Tedavi SeÃ§imi' : 'Clinical Status and Treatment Selection')
                    : (lang === 'tr' ? 'KILAVUZ TANIMLI AÃ‡IK TNM TABLOSU' : 'GUIDELINE-DEFINED OPEN TNM MATRIX')}
                </h2>
                <span className="text-[11px] text-slate-300">
                  {selectedOrgan === 'benign'
                    ? (lang === 'tr' ? 'Benign hastalÄ±kta TNM evrelemesi uygulanmaz; klinik durum ve tedavi zamanlamasÄ±nÄ± seÃ§in.' : 'TNM staging does not apply to benign disease; select the clinical status and treatment timing.')
                    : (lang === 'tr' ? 'SeÃ§ili alt baÅŸlÄ±ÄŸa Ã¶zgÃ¼ kriterler; tÄ±klayarak anÄ±nda gÃ¼ncelleyin.' : 'Subsite-specific criteria; click to update instantly.')}
                </span>
              </div>
              {selectedOrgan === 'benign' || selectedOrgan === 'palliative' || selectedOrgan === 'emergencies'
                ? <span className={`rounded border px-2 py-0.5 text-[11px] font-semibold ${selectedOrgan === 'emergencies' ? 'border-rose-500/40 bg-rose-950/50 text-rose-200' : 'border-emerald-500/40 bg-emerald-950/40 text-emerald-200'}`}>{selectedOrgan === 'emergencies' ? (lang === 'tr' ? 'ACÄ°L' : 'URGENT') : (lang === 'tr' ? 'TNM uygulanmaz' : 'TNM not applicable')}</span>
                : <span className="text-xs font-mono px-2 py-0.5 rounded bg-slate-800 text-sky-400 border border-slate-700">{selectedT} {selectedN} {selectedM}</span>}
            </div>

            {selectedOrgan === 'benign' || selectedOrgan === 'palliative' || selectedOrgan === 'emergencies' ? (
              selectedOrgan === 'benign' ? (
              <div className="space-y-3">
                <p className="text-xs font-semibold text-slate-100">
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
                            : 'border-slate-700 bg-slate-900/70 text-slate-200 hover:bg-slate-800'
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
                          ? 'HO profilaksisi preoperatif ilk 4 saatte veya postoperatif ilk 24-48 saatte planlanÄ±r; >72 saat sonra etkinlik beklenmez.'
                          : 'HO prophylaxis is planned within 4 hours preoperatively or 24-48 hours postoperatively; benefit is not expected after 72 hours.'
                        : lang === 'tr'
                          ? 'Keloid eksizyonu sonrasÄ± RT ilk 24 saat iÃ§inde baÅŸlatÄ±lmalÄ±dÄ±r.'
                          : 'Radiotherapy should begin within 24 hours after keloid excision.'}
                  </div>
                )}
              </div>
              ) : (
                <div className={`rounded-md border p-3 text-xs leading-relaxed ${selectedOrgan === 'emergencies' ? 'border-rose-500/30 bg-rose-950/30 text-rose-100' : 'border-teal-500/30 bg-teal-950/20 text-teal-100'}`}>
                  {selectedOrgan === 'emergencies'
                    ? (lang === 'tr' ? 'Acil senaryo; stabilizasyon ve ilgili uzmanlÄ±k deÄŸerlendirmesi Ã¶nceliklidir. ReÃ§ete, hedef hacim ve fraksiyonasyon acil vaka motorunda sunulur.' : 'Emergency scenario; stabilization and specialty assessment take priority. Prescription, target volumes, and fractionation are provided by the emergency case engine.')
                    : (lang === 'tr' ? 'Elektif semptomatik RT: kemik metastazÄ±, beyin metastazÄ± veya organ/yumuÅŸak doku metastazÄ±.' : 'Elective symptom-directed RT: bone, brain, or organ/soft-tissue metastases.')}
                </div>
              )
            ) : (
              <>
            {/* T TABLOSU */}
            <div className="mb-4">
              <span className="text-[11px] font-bold text-slate-600 uppercase tracking-wider block mb-1.5">
                {lang === 'tr' ? 'PRÄ°MER TÃœMÃ–R (T) KRÄ°TERLERÄ°' : 'PRIMARY TUMOR (T) CRITERIA'}
              </span>
              <div className="grid grid-cols-1 gap-1 max-h-[min(55vh,520px)] overflow-y-auto pr-1.5 scrollbar-thin">
                {currentTNM.T.map(opt => {
                  const isSel = selectedT === opt.code;
                  return (
                    <button
                      key={opt.code}
                      type="button"
                      disabled={breastHistology === 'Ä°nflamatuar Meme Kanseri (IBC)' && opt.code !== 'T4d'}
                      onClick={() => handleTnmSelection('T', opt.code)}
                      className={`w-full text-left p-2.5 rounded-xl border transition-all text-xs flex items-center justify-between ${breastHistology === 'Ä°nflamatuar Meme Kanseri (IBC)' && opt.code !== 'T4d' ? 'cursor-not-allowed opacity-45' : ''} ${
                        isSel
                          ? 'bg-blue-600 border-blue-500 text-white font-bold shadow-md ring-1 ring-blue-400'
                            : 'bg-slate-900/60 border-slate-800 text-slate-200 hover:border-blue-400 hover:bg-slate-800/80'
                      }`}
                    >
                      <span className="px-2 py-0.5 rounded font-mono font-bold text-[11px] bg-slate-800 text-slate-300 border border-slate-700">{tText(opt.label)}</span>
                      <span className={`text-xs leading-relaxed flex-1 px-2 ${isSel ? 'text-white font-semibold' : 'text-slate-100 font-medium group-hover:text-white'}`}>{tText(opt.criterion)}</span>
                      {isSel && <Check className="w-3.5 h-3.5 text-white shrink-0" aria-hidden="true" />}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* N TABLOSU */}
            <div className="mb-4">
              <span className="text-[11px] font-bold text-slate-600 uppercase tracking-wider block mb-1.5">
                {lang === 'tr' ? 'BÃ–LGESEL LENF NODLARI (N)' : 'REGIONAL LYMPH NODES (N)'}
              </span>
              <div className="grid grid-cols-1 gap-1 max-h-[min(55vh,520px)] overflow-y-auto pr-1.5 scrollbar-thin">
                {currentTNM.N.map(opt => {
                  const isSel = selectedN === opt.code;
                  return (
                    <button
                      key={opt.code}
                      type="button"
                      onClick={() => handleTnmSelection('N', opt.code)}
                      className={`w-full text-left p-2.5 rounded-xl border transition-all text-xs flex items-center justify-between ${
                        isSel
                          ? 'bg-blue-600 border-blue-500 text-white font-bold shadow-md ring-1 ring-blue-400'
                          : 'bg-slate-900/60 border-slate-800 text-slate-200 hover:border-blue-400 hover:bg-slate-800/80'
                      }`}
                    >
                      <span className="px-2 py-0.5 rounded font-mono font-bold text-[11px] bg-slate-800 text-slate-300 border border-slate-700">{tText(opt.label)}</span>
                      <span className={`text-xs leading-relaxed flex-1 px-2 ${isSel ? 'text-white font-semibold' : 'text-slate-100 font-medium group-hover:text-white'}`}>{tText(opt.criterion)}</span>
                      {isSel && <Check className="w-3.5 h-3.5 text-white shrink-0" aria-hidden="true" />}
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
              <div className="grid grid-cols-1 gap-1 max-h-[min(55vh,520px)] overflow-y-auto pr-1.5 scrollbar-thin">
                {currentTNM.M.map(opt => {
                  const isSel = selectedM === opt.code;
                  return (
                    <button
                      key={opt.code}
                      type="button"
                      onClick={() => handleTnmSelection('M', opt.code)}
                      className={`w-full text-left p-2.5 rounded-xl border transition-all text-xs flex items-center justify-between ${
                        isSel
                          ? 'bg-blue-600 border-blue-500 text-white font-bold shadow-md ring-1 ring-blue-400'
                          : 'bg-slate-900/60 border-slate-800 text-slate-200 hover:border-blue-400 hover:bg-slate-800/80'
                      }`}
                    >
                      <span className="px-2 py-0.5 rounded font-mono font-bold text-[11px] bg-slate-800 text-slate-300 border border-slate-700">{tText(opt.label)}</span>
                      <span className={`text-xs leading-relaxed flex-1 px-2 ${isSel ? 'text-white font-semibold' : 'text-slate-100 font-medium group-hover:text-white'}`}>{tText(opt.criterion)}</span>
                      {isSel && <Check className="w-3.5 h-3.5 text-white shrink-0" aria-hidden="true" />}
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
                    SAÄ SÃœTUN (~58%): DOZÄ°METRÄ° Ã–ZETÄ°, ICRU 83 HEDEF HACÄ°MLER, OAR KISITLARI
           ========================================== */}
        <section className={`col-span-12 flex flex-col gap-4 ${
          isGuidedMode
            ? guidedStep === 4 ? 'lg:col-span-12 mx-auto w-full max-w-[1720px]' : 'hidden'
                    : `lg:col-span-7 ${activeMobilePanel !== 'prescription' ? 'hidden lg:flex' : ''}`
        }`}>
          <div className="rounded-2xl bg-[#0e1726] border border-slate-800/90 p-5 shadow-xl shadow-black/40">

            {/* CANLI DÄ°NAMÄ°K TRIAGE ROZETÄ° */}
            <div className="bg-emerald-950/40 border border-emerald-500/40 text-emerald-300 px-4 py-2.5 rounded-xl font-semibold text-xs flex items-center justify-between shadow-sm mb-4">
              <span className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded bg-current" aria-hidden="true" />
                {tText(evaluatedDecision.statusText)}
              </span>
              <span className="text-[11px] font-normal opacity-80">
                {tText(activeScheme.tag)}
              </span>
            </div>

            {isGuidedMode && guidedStep === 4 && (
              <div className="mb-3 flex justify-end">
                <button
                  type="button"
                  onClick={() => setGuidedStep(2)}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-900/70 px-3 py-2 text-[11px] font-semibold text-slate-300 transition hover:border-sky-500/60 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400"
                >
                  <ChevronLeft className="h-3.5 w-3.5" aria-hidden="true" />
                  {lang === 'tr' ? 'Parametreleri DÃ¼zenle' : 'Modify Parameters (Edit)'}
                </button>
              </div>
            )}

            <section className="mb-4 rounded-xl border border-sky-500/25 bg-sky-500/[0.04] p-3" aria-labelledby="decision-chain-heading">
              <h3 id="decision-chain-heading" className="mb-2 text-[11px] font-bold uppercase tracking-wide text-sky-200">
                {lang === 'tr'
                  ? 'Ä°zlenebilir Karar Zinciri (Triggered Decision Logic)'
                  : 'Traceable Decision Chain (Triggered Decision Logic)'}
              </h3>
              <div className="flex flex-wrap gap-1.5">
                {clinicalDecisionFactors.map((factor, index) => (
                  <span
                    key={`${factor.label}-${index}`}
                    className="inline-flex items-center gap-1 rounded-lg border border-slate-700/80 bg-[#0a0f1d]/80 px-2 py-1 text-[10px] leading-relaxed text-slate-200"
                  >
                    <span className="font-semibold text-slate-400">{factor.label}:</span>
                    <span>{factor.value}</span>
                  </span>
                ))}
              </div>
            </section>

            {(['prostate', 'thorax', 'breast'] as OrganId[]).includes(selectedOrgan) && (
              <div className="mb-4">
                <div className="mb-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-600">
                  {lang === 'tr' ? 'FRAKSÄ°YONASYON FELSEFESÄ°' : 'FRACTIONATION PHILOSOPHY'}
                </div>
                <div className="grid grid-cols-2 gap-2 xl:grid-cols-4">
                  {(['sbrt', 'moderate', 'sib', 'conventional'] as const).map(regimen => {
                    const cards = {
                      sbrt: {
                        title: lang === 'tr' ? 'Ultra-Hipo' : 'Ultra-Hypo',
                        badge: '1-5 fx',
                        detail: 'SBRT / Stereotactic',
                        active: 'bg-gradient-to-br from-indigo-600 to-purple-600',
                        hover: 'hover:border-purple-300',
                      },
                      moderate: {
                        title: lang === 'tr' ? 'IlÄ±mlÄ± Hipo' : 'Moderate',
                        badge: '15-20 fx',
                        detail: 'Hypofractionated',
                        active: 'bg-gradient-to-br from-blue-600 to-cyan-600',
                        hover: 'hover:border-blue-300',
                      },
                      sib: {
                        title: 'SIB Boost',
                        badge: lang === 'tr' ? 'Entegre' : 'Integrated',
                        detail: 'Simultaneous Boost',
                        active: 'bg-gradient-to-br from-emerald-600 to-teal-600',
                        hover: 'hover:border-emerald-300',
                      },
                      conventional: {
                        title: isSclcTurrisiScheme
                          ? lang === 'tr' ? 'Akselere Hiperfraksiyonasyon (30 fx BID)' : 'Accelerated Hyperfractionation (30 fx BID)'
                          : lang === 'tr' ? 'Konvansiyonel' : 'Conventional',
                        badge: isSclcTurrisiScheme ? '45 Gy' : undefined,
                        detail: isSclcTurrisiScheme
                          ? lang === 'tr' ? '1.5 Gy / fx (GÃ¼nde 2 kez BID, â‰¥ 6 saat ara)' : '1.5 Gy / fx (Twice daily BID, â‰¥ 6 hours apart)'
                          : '1.8 - 2.0 Gy / fx',
                        active: 'bg-gradient-to-br from-slate-700 to-slate-900',
                        hover: 'hover:border-slate-400',
                      },
                    };
                    const card = cards[regimen];
                    const eligible = isRegimenEligible(regimen);
                    return (
                      <button
                        key={regimen}
                        type="button"
                        disabled={!eligible}
                        title={eligible ? undefined : (lang === 'tr' ? 'Bu fraksiyonasyon felsefesi mevcut klinik senaryo iÃ§in uygun deÄŸil' : 'This fractionation philosophy is not appropriate for the current clinical scenario')}
                        onClick={() => setSelectedRegimen(regimen)}
                        className={`relative overflow-hidden rounded-xl border p-2.5 text-left transition-all ${
                          !eligible
                            ? 'cursor-not-allowed border-slate-800 bg-slate-900/40 text-slate-600 opacity-50'
                            : selectedRegimen === regimen
                              ? `${card.active} border-transparent text-white shadow-md`
                              : `border-slate-700 bg-slate-800/80 text-slate-200 ${card.hover}`
                        }`}
                      >
                        <div className="mb-1 flex items-center justify-between">
                          <span className="flex items-center gap-1.5 text-xs font-bold">
                            {regimen === 'sbrt' ? 'âš¡' : regimen === 'moderate' ? 'ğŸ¯' : regimen === 'sib' ? 'ğŸ§¬' : 'ğŸ›¡ï¸'} {card.title}
                          </span>
                          {card.badge && <span className="rounded bg-white/20 px-1.5 py-0.5 font-mono text-[10px] font-semibold dark:bg-slate-800/60">{card.badge}</span>}
                        </div>
                        <div className="text-[10px] opacity-80">{card.detail}</div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* ALTERNATÄ°F PROTOKOL SEKMELERÄ° */}
            {evaluatedDecision.alternativeSchemes.length > 1 && (
              <div className="flex gap-2 mb-4 overflow-x-auto pb-1">
                {evaluatedDecision.alternativeSchemes.map(sch => (
                  <button
                    key={sch.id}
                    onClick={() => setSelectedSchemeId(sch.id)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors border ${
                      activeScheme.id === sch.id
                        ? 'bg-amber-50 text-amber-800 border-amber-300'
                        : 'bg-slate-900/60 border-slate-800 text-slate-300 hover:bg-slate-800/80'
                    }`}
                  >
                    {tText(sch.tag)} {tText(" (")}{sch.totalDoseGy} {tText(" Gy)\n                  ")}</button>
                ))}
              </div>
            )}

            {/* SEÃ‡Ä°LÄ° DOZ ÅEMASI KARTI */}
            <div className="bg-[#111c2e] border border-slate-700/80 text-slate-200 rounded-xl p-4 shadow-md mb-4">
              <div className="mb-2">
                <h3 className="text-amber-300 font-bold text-sm flex items-center gap-2">
                  <Radiation className="w-4 h-4 animate-[spin_12s_linear_infinite] text-amber-300" />
                  {tText(activeScheme.name)}
                </h3>
              </div>
              <div className="flex flex-wrap gap-1.5 mt-2 mb-2.5" aria-label="ReÃ§ete Ã¶zeti">
                <span className="bg-[#090e17] border border-slate-700 text-slate-200 px-3 py-1.5 rounded-lg text-xs font-medium">
                  {prescriptionTargetBadge}
                </span>
                <span className="bg-[#090e17] border border-slate-700 text-slate-200 px-3 py-1.5 rounded-lg text-xs font-medium">
                    {prescriptionNodalSummary}
                  </span>
                <span className="bg-[#090e17] border border-slate-700 text-slate-200 px-3 py-1.5 rounded-lg text-xs font-medium">
                  {prescriptionTechniqueBadge}
                </span>
              </div>
              <p className="text-slate-200 text-xs mt-2.5 leading-relaxed mb-2">
                {tText(activeScheme.indication)}
              </p>
            </div>

            {/* HEDEF HACÄ°MLER VE MARJÄ°NLER */}
            {activeScheme.targetVolumes.length > 0 && (
              <div className="mb-4">
                <div className="flex min-w-0 items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-2 mb-2">
                  <h4 className="flex min-w-0 items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-200">
                    <Layers className="w-3.5 h-3.5 shrink-0 text-sky-700" />
                    <span>{lang === 'tr' ? 'HEDEF HACÄ°MLER (ICRU 83)' : 'TARGET VOLUMES (ICRU 83)'}</span>
                    <span className="shrink-0 rounded border border-emerald-400/40 bg-emerald-400/10 px-1.5 py-0.5 text-[9px] font-bold tracking-wide text-emerald-700 dark:text-emerald-200">TCP TARGET</span>
                  </h4>
                  <a
                    href={eContour.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group inline-flex max-w-[65%] shrink-0 items-center gap-1.5 rounded-lg border border-blue-200 bg-blue-50 px-2.5 py-1 text-[11px] font-semibold text-blue-700 shadow-sm transition-all hover:bg-blue-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 dark:border-blue-800 dark:bg-blue-950/60 dark:text-blue-300 dark:hover:bg-blue-900/60"
                    title={lang === 'tr' ? 'eContour.org Ã¼zerinde bu vakanÄ±n 3D interaktif Ã§izimini aÃ§' : 'Open 3D interactive contouring case on eContour.org'}
                    aria-label={lang === 'tr' ? eContour.label_tr : eContour.label_en}
                  >
                    <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-blue-500 transition-transform group-hover:scale-125" aria-hidden="true" />
                    <span className="truncate">{lang === 'tr' ? eContour.label_tr : eContour.label_en}</span>
                    <span className="text-[10px] opacity-70 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" aria-hidden="true">â†—</span>
                  </a>
                </div>
                <div className="border border-slate-700/80 rounded-xl overflow-hidden text-xs shadow-sm bg-[#0e1726]">
                  <table className="w-full text-left">
                    <thead className="bg-[#131f33] text-slate-300 text-[11px] font-bold uppercase tracking-wider border-b border-slate-700">
                      <tr>
                        <th className="p-2">{lang === 'tr' ? 'Hacim' : 'Volume'}</th>
                        <th className="p-2">{lang === 'tr' ? 'TCP ReÃ§etesi' : 'TCP Prescription'}</th>
                        <th className="p-2">{lang === 'tr' ? 'Marjin' : 'Margin'}</th>
                        <th className="p-2">{lang === 'tr' ? 'Anatomik Kapsam' : 'Anatomic Coverage'}</th>
                      </tr>
                    </thead>
                    <tbody className="text-slate-100">
                      {activeScheme.targetVolumes.map((tv, idx) => (
                        <tr key={idx} className="border-b border-slate-800/80 hover:bg-slate-800/40 transition-colors">
                          <td className="p-2 text-white font-semibold text-xs">{tText(tv.name)}</td>
                          <td className="p-2 text-emerald-400 font-mono font-bold text-xs">{tv.doseGy} {tText(" Gy")}</td>
                          <td className="p-2 font-mono text-amber-300">{tText(tv.marginMm)}</td>
                          <td className="p-2 text-xs text-slate-100">{tText(tv.anatomical)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* KRÄ°TÄ°K ORGAN (OAR) KISITLARI TABLOSU */}
            {clinicallyRelevantOars.length > 0 && (
              <div className="mb-4">
                <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2 flex flex-wrap items-center gap-1.5">
                  <ShieldAlert className="w-3.5 h-3.5 text-rose-400" aria-hidden="true" />
                  {lang === 'tr' ? 'KRÄ°TÄ°K ORGAN (OAR) KISITLARI' : 'ORGANS AT RISK (OAR) CONSTRAINTS'}
                  <span className="rounded border border-rose-400/40 bg-rose-400/10 px-1.5 py-0.5 text-[9px] font-bold tracking-wide text-rose-200">NTCP CEILING</span>
                </h4>
                <p className="mb-2 text-[10px] leading-relaxed text-slate-500">
                  {lang === 'tr'
                    ? 'Doz Ã¶lÃ§Ã¼tleri fraksiyonasyon, kontur tanÄ±mÄ±, tedavi alanÄ± ve Ã¶nceki RTâ€™ye baÄŸlÄ±dÄ±r; bunlar planlama referansÄ±dÄ±r, hasta-Ã¶zel doz onayÄ± deÄŸildir.'
                    : 'Dose metrics depend on fractionation, contour definition, treatment site and prior RT; these are planning references, not patient-specific approval.'}
                </p>
                <div className="border border-slate-700/80 rounded-xl overflow-hidden text-xs shadow-sm bg-[#0e1726]">
                  <table className="w-full text-left">
                    <thead className="bg-[#131f33] text-slate-300 text-[11px] font-bold uppercase tracking-wider border-b border-slate-700">
                      <tr>
                        <th className="p-2">{lang === 'tr' ? 'Kritik Organ' : 'Critical Organ (OAR)'}</th>
                        <th className="p-2">{lang === 'tr' ? 'Metrik' : 'Metric'}</th>
                        <th className="p-2">{lang === 'tr' ? 'NTCP Tavan SÄ±nÄ±rÄ±' : 'NTCP Ceiling'}</th>
                        <th className="p-2">{lang === 'tr' ? 'KÄ±lavuz' : 'Standard'}</th>
                      </tr>
                    </thead>
                    <tbody className="text-slate-100">
                      {clinicallyRelevantOars.map((oar, idx) => (
                        <tr key={idx} className="border-b border-slate-800/80 hover:bg-slate-800/40 transition-colors">
                          <td className="p-2 text-white font-semibold text-xs">{tText(oar.organ)}</td>
                          <td className="p-2 font-mono text-slate-100 text-xs">
                            {tText(oar.metric)}
                            {oar.context && <span className="mt-1 block font-sans text-[10px] leading-relaxed text-slate-500">{lang === 'tr' ? oar.context : oar.contextEn || oar.context}</span>}
                            {oar.classification && <span className="mt-1 inline-block rounded border border-slate-700 px-1 py-0.5 font-sans text-[8px] uppercase tracking-wide text-sky-300">{oar.classification === 'planning-aim' ? (lang === 'tr' ? 'Planlama hedefi' : 'Planning aim') : oar.classification === 'protocol-limit' ? (lang === 'tr' ? 'Protokol sÄ±nÄ±rÄ±' : 'Protocol limit') : oar.classification === 'dose-volume-reference' ? (lang === 'tr' ? 'Doz-hacim referansÄ±' : 'Dose-volume reference') : (lang === 'tr' ? 'BaÄŸlam notu' : 'Context note')}</span>}
                          </td>
                          <td className="p-2 text-rose-400 font-mono font-bold text-xs">{oar.limit}</td>
                          <td className="p-2 text-[10px] text-slate-300">{tText(oar.source)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* RADYOBÄ°YOLOJÄ° (BED & EQD2 HESAPLAYICI) */}
            <div className="relative">
              <button
                type="button"
                aria-haspopup="dialog"
                onClick={openRadiobiologyModal}
                className="mb-4 flex w-full items-center justify-between gap-3 rounded-xl border border-slate-800 bg-[#0b1220] p-3 text-left text-xs transition-colors hover:border-sky-700/70 hover:bg-[#101b2d] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500"
              >
                <span className="min-w-0">
                  <span className="block text-[11px] text-slate-300">{lang === 'tr' ? 'Radyobiyolojik EÅŸdeÄŸerlik' : 'Radiobiological Equivalence'}</span>
                  {radiobiologyByAlphaBeta.map(({ ab, bed, eqd2 }) => {
                    const subscript = ab === 10 ? 'â‚â‚€' : 'â‚ƒ';
                    const tissue = ab === 10
                      ? lang === 'tr' ? 'TÃ¼mÃ¶r / Akut' : 'Tumor / Acute'
                      : lang === 'tr' ? 'GeÃ§ Doku / OAR' : 'Late Tissue / OAR';
                    return (
                      <span key={ab} className="block font-bold leading-5 text-slate-200">
                        Î±/Î² = {ab} Gy ({tissue}): BED{subscript} = <span className="text-amber-400">{bed} Gy</span> | EQD2{subscript} = <span className="text-emerald-400">{eqd2} Gy</span>
                      </span>
                    );
                  })}
                </span>
                <span className="shrink-0 rounded-lg border border-sky-500/30 bg-sky-500/10 px-2 py-1.5 text-[10px] font-semibold text-sky-300">
                  ğŸ§® {lang === 'tr' ? 'Ä°nteraktif DÃ¶nÃ¼ÅŸtÃ¼rÃ¼cÃ¼ â†—' : 'Interactive Calculator â†—'}
                </span>
              </button>
              <div className="absolute -bottom-2 left-0 right-0 mx-auto w-max rounded-md bg-slate-800 px-2 py-1 text-center text-[10px] text-slate-300">
                â„¹ï¸ {lang === 'tr' ? 'd = 2.0 Gy konvansiyonel fraksiyonasyonda matematiksel tanÄ±m gereÄŸi tÃ¼m Î±/Î² deÄŸerleri iÃ§in EQD2 = ReÃ§ete Dozu (60 Gy) olur. Fraksiyon dozu 2 Gy\'den farklÄ± ÅŸemalarda (SBRT/HipoFx) Î±/Î² oranÄ±na gÃ¶re ayrÄ±ÅŸÄ±r.' : 'd = 2.0 Gy conventional fractionation results in EQD2 = Prescription Dose (60 Gy) for all Î±/Î² values. Schemes with fraction dose â‰  2 Gy (SBRT/HypoFx) split by Î±/Î² ratio.'}
              </div>
            </div>

            {/* SÄ°STEMÄ°K TEDAVÄ° VE KANIT */}
            {activeScheme.systemicTherapy && (
              <div className="p-2.5 rounded-md bg-indigo-50 border border-indigo-300 text-indigo-800 text-xs mb-3">
                <span className="font-bold block mb-0.5">{tText("ğŸ’Š EÅŸlik Eden Sistemik Tedavi:")}</span>
                {tText(activeScheme.systemicTherapy)}
              </div>
            )}
            <div className="mb-4 rounded-xl border border-slate-800 bg-[#0b1220] p-3 text-[11px] text-slate-300">
              <p className="font-semibold text-slate-200">
                {lang === 'tr' ? 'ğŸ“š KanÄ±t ve KÄ±lavuz: ' : 'ğŸ“š Evidence and Guidelines: '}
                {evidenceText}
              </p>
              {(verifyReference || isSclcTurrisiScheme) && (
                <a
                  href={isSclcTurrisiScheme ? 'https://doi.org/10.1056/NEJM199901283400403' : verifyReference.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-2 inline-flex items-center gap-1.5 rounded-lg bg-sky-500 px-2.5 py-1.5 text-[10px] font-bold text-slate-950 transition hover:bg-sky-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-300"
                >
                  {isSclcTurrisiScheme
                    ? 'Turrisi et al. Â· NEJM 1999 (DOI)'
                    : lang === 'tr' ? `KanÄ±tÄ± doÄŸrula Â· ${verifyReference?.label}` : `Verify evidence Â· ${verifyReference?.label}`}
                  <ArrowUpRight className="h-3 w-3" aria-hidden="true" />
                </a>
              )}
            </div>

            {/* KOPYALANABÄ°LÄ°R RAPOR PANELÄ° */}
            {researchExportNotice && (
              <div role="status" className="mt-4 rounded-xl border border-emerald-800 bg-emerald-950/40 px-3 py-2 text-[11px] font-semibold text-emerald-200">
                {researchExportNotice}
              </div>
            )}
            <div className="mt-8 flex w-full flex-col gap-3 border-t border-slate-800/80 pt-6 sm:flex-row sm:items-center sm:justify-between">
              <div className="w-full sm:w-auto">
                {isGuidedMode && guidedStep === 4 && (
                  <button
                    type="button"
                    onClick={() => setGuidedStep(3)}
                    className="inline-flex w-full items-center justify-center gap-1.5 rounded-xl border border-slate-700 bg-slate-800/50 px-4 py-2.5 text-xs font-semibold text-slate-300 transition hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-500 sm:w-auto"
                  >
                    <ChevronLeft className="h-4 w-4" aria-hidden="true" />
                    Geri (Back)
                  </button>
                )}
              </div>
              <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:items-center">
                <div ref={exportMenuRef} className="relative">
                  <button
                    type="button"
                    aria-haspopup="true"
                    aria-expanded={isExportMenuOpen}
                    aria-controls="cdss-export-menu"
                    onClick={() => setIsExportMenuOpen(open => !open)}
                    className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-slate-700 bg-[#111c2e] px-4 py-2.5 text-xs font-semibold text-slate-200 transition hover:border-slate-500 hover:bg-[#182842] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-500 sm:w-auto"
                  >
                    <Download className="h-4 w-4" aria-hidden="true" />
                    DÄ±ÅŸa Aktar / Export
                    <ChevronDown className={`h-3.5 w-3.5 transition-transform ${isExportMenuOpen ? 'rotate-180' : ''}`} aria-hidden="true" />
                  </button>
                  {isExportMenuOpen && (
                    <div
                      id="cdss-export-menu"
                      className="absolute bottom-full right-0 z-30 mb-2 flex w-64 flex-col rounded-xl border border-slate-700/80 bg-[#0d1527] p-1.5 shadow-2xl backdrop-blur-xl"
                    >
                      <button
                        type="button"
                        onClick={() => {
                          setIsExportMenuOpen(false);
                          saveCaseToArchive();
                        }}
                        className="flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-left text-xs font-medium text-slate-200 transition hover:bg-slate-800 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500"
                      >
                        <BookOpen className="h-4 w-4 shrink-0 text-emerald-400" aria-hidden="true" />
                        <span>{lang === 'tr' ? 'Vaka ArÅŸivine Ekle' : 'Add to Case Archive'}</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setIsExportMenuOpen(false);
                          printBoardSummary();
                        }}
                        className="flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-left text-xs font-medium text-slate-200 transition hover:bg-slate-800 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500"
                      >
                        <Printer className="h-4 w-4 shrink-0 text-sky-400" aria-hidden="true" />
                        <span>{lang === 'tr' ? 'PDF Konsey Ã–zeti YazdÄ±r' : 'Print Board Summary PDF'}</span>
                      </button>
                    </div>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => saveCurrentCaseToFavorites()}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-amber-500/40 bg-amber-500/10 px-4 py-2.5 text-xs font-bold text-amber-300 transition hover:bg-amber-500/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 sm:w-auto"
                >
                  <Star className="h-4 w-4 text-amber-400 fill-amber-400" aria-hidden="true" />
                  [ â­ Bu VakayÄ± Favorilere Ekle ]
                </button>
                <button
                  type="button"
                  onClick={copyToClipboard}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 py-2.5 text-xs font-bold text-white shadow-lg shadow-emerald-950/40 transition hover:bg-emerald-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 sm:w-auto"
                >
                  {copied ? <Check className="h-4 w-4" aria-hidden="true" /> : <Copy className="h-4 w-4" aria-hidden="true" />}
                  {copied
                    ? (lang === 'tr' ? 'KopyalandÄ±!' : 'Copied!')
                    : (lang === 'tr' ? 'Klinik Ã–zeti Kopyala' : 'Copy Summary')}
                </button>
              </div>
            </div>
          </div>
        </section>
        {isGuidedMode && guidedStep === 2 && (
          <div className="col-span-12 mx-auto flex w-full max-w-[1800px] flex-col-reverse gap-2 border-t border-slate-800 pt-4 sm:flex-row sm:items-center sm:justify-between">
            <button
              type="button"
              onClick={() => setGuidedStep(1)}
              className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-slate-700 bg-[#111c2e] px-4 py-2.5 text-xs font-semibold text-slate-200 transition hover:border-slate-500 hover:bg-[#182842] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400"
            >
              <ChevronLeft className="h-4 w-4" aria-hidden="true" />
              {lang === 'tr' ? '1. AdÄ±ma DÃ¶n' : 'Back to Step 1'}
            </button>
            <button
              type="button"
              onClick={() => setGuidedStep(3)}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-xs font-bold text-white shadow-lg shadow-blue-950/30 transition hover:bg-blue-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400"
            >
              {lang === 'tr' ? 'Prognostik Riski Hesapla' : 'Calculate Prognostic Risk'}
              <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>
        )}
      </main>
      </div>

      {isSearchOpen && (
        <div
          className="fixed inset-0 z-[100] flex items-start justify-center bg-black/75 p-4 pt-20 backdrop-blur-md"
          onMouseDown={event => {
            if (event.target === event.currentTarget) setIsSearchOpen(false);
          }}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-label={lang === 'tr' ? 'HÄ±zlÄ± arama ve komut paleti' : 'Quick search and command palette'}
            className="flex w-full max-w-xl flex-col overflow-hidden rounded-2xl border border-slate-800 bg-[#0e1726]/95 shadow-2xl backdrop-blur-2xl"
          >
            <div className="flex items-center gap-3 border-b border-slate-800 px-4">
              <Search className="h-4 w-4 shrink-0 text-slate-400" aria-hidden="true" />
              <input
                autoFocus
                type="search"
                role="combobox"
                aria-expanded="true"
                aria-controls="command-palette-results"
                aria-activedescendant={commandPaletteResults[activeSearchIndex] ? `command-result-${commandPaletteResults[activeSearchIndex].id}` : undefined}
                aria-label={lang === 'tr' ? 'TÃ¼mÃ¶r, protokol veya sayfa ara' : 'Search tumors, protocols, or pages'}
                value={searchQuery}
                onChange={event => {
                  setSearchQuery(event.currentTarget.value);
                  setActiveSearchIndex(0);
                }}
                onKeyDown={event => {
                  if (event.key === 'ArrowDown') {
                    event.preventDefault();
                    setActiveSearchIndex(index => commandPaletteResults.length ? (index + 1) % commandPaletteResults.length : 0);
                  } else if (event.key === 'ArrowUp') {
                    event.preventDefault();
                    setActiveSearchIndex(index => commandPaletteResults.length ? (index - 1 + commandPaletteResults.length) % commandPaletteResults.length : 0);
                  } else if (event.key === 'Enter') {
                    event.preventDefault();
                    const result = commandPaletteResults[activeSearchIndex];
                    if (result) selectCommandPaletteItem(result);
                  } else if (event.key === 'Escape') {
                    setIsSearchOpen(false);
                  }
                }}
                placeholder={lang === 'tr' ? 'TÃ¼mÃ¶r, alt tip, Ã§alÄ±ÅŸma veya sayfa araâ€¦' : 'Search tumors, subsites, trials, or pagesâ€¦'}
                className="min-w-0 flex-1 bg-transparent p-4 text-sm text-white placeholder:text-slate-500 focus:outline-none"
              />
              <kbd className="shrink-0 rounded-md border border-slate-700 bg-slate-800 px-1.5 py-1 font-mono text-[10px] text-slate-300">ESC</kbd>
            </div>

            <div id="command-palette-results" role="listbox" className="max-h-[min(70vh,560px)] overflow-y-auto p-2">
              {commandPaletteGroups.length === 0 ? (
                <div className="px-4 py-10 text-center text-xs text-slate-400">
                  {lang === 'tr' ? 'ğŸ” EÅŸleÅŸen klinik protokol veya organ bulunamadÄ±.' : 'ğŸ” No matching clinical protocol or organ found.'}
                </div>
              ) : commandPaletteGroups.map((group, groupIndex) => {
                const groupStartIndex = commandPaletteGroups
                  .slice(0, groupIndex)
                  .reduce((total, previousGroup) => total + previousGroup.items.length, 0);
                return (
                  <div key={group.id} className="mb-2 last:mb-0">
                    <h3 className="px-3 pb-1 pt-2 text-[10px] font-bold uppercase tracking-wider text-slate-500">{group.title}</h3>
                    <div className="space-y-0.5">
                      {group.items.map((item, itemIndex) => {
                        const resultIndex = groupStartIndex + itemIndex;
                        const selected = activeSearchIndex === resultIndex;
                        return (
                          <button
                            key={item.id}
                            id={`command-result-${item.id}`}
                            ref={element => { commandPaletteResultRefs.current[resultIndex] = element; }}
                            type="button"
                            role="option"
                            aria-selected={selected}
                            onMouseEnter={() => setActiveSearchIndex(resultIndex)}
                            onClick={() => selectCommandPaletteItem(item)}
                            className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-colors ${selected ? 'bg-sky-500/15 text-white ring-1 ring-inset ring-sky-500/40' : 'text-slate-300 hover:bg-slate-800/70'}`}
                          >
                            <span className="min-w-0 flex-1">
                              <span className="block truncate text-xs font-semibold">{item.title}</span>
                              <span className="mt-0.5 block truncate text-[10px] text-slate-500">{item.subtitle}</span>
                            </span>
                            {item.kind === 'page'
                              ? <ArrowUpRight className="h-3.5 w-3.5 shrink-0 text-slate-500" aria-hidden="true" />
                              : item.kind === 'protocol'
                                ? <span className="shrink-0 rounded-md bg-amber-500/10 px-1.5 py-0.5 text-[9px] font-semibold text-amber-300">{lang === 'tr' ? 'YÃœKLE' : 'LOAD'}</span>
                                : <span className="shrink-0 text-[9px] text-slate-600">â†µ</span>}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>

            <footer className="flex items-center justify-between border-t border-slate-800 px-4 py-2 text-[10px] text-slate-500">
              <span>{lang === 'tr' ? 'â†‘ â†“ gezin' : 'â†‘ â†“ navigate'} <span className="mx-1 text-slate-700">â€¢</span> Enter {lang === 'tr' ? 'seÃ§' : 'select'}</span>
              <span>Ctrl K {lang === 'tr' ? 'aÃ§ / kapat' : 'toggle'}</span>
            </footer>
          </section>
        </div>
      )}

      {isRadiobiologyModalOpen && (
        <div
          className="fixed inset-0 z-[80] flex items-start justify-center overflow-y-auto bg-slate-950/80 p-3 backdrop-blur-sm sm:p-6"
          onMouseDown={event => {
            if (event.target === event.currentTarget) setIsRadiobiologyModalOpen(false);
          }}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="radiobiology-modal-title"
            className="my-auto w-full max-w-4xl rounded-3xl border border-slate-800 bg-[#0e1726] p-5 text-slate-100 shadow-2xl sm:p-6 md:p-8"
          >
            <header className="mb-6 flex items-start justify-between gap-4">
              <div>
                <div className="mb-1 text-xs font-semibold uppercase tracking-[0.14em] text-sky-400">
                  ğŸ§® {lang === 'tr' ? 'LQ Model â€¢ BED / EQD2' : 'LQ Model â€¢ BED / EQD2'}
                </div>
                <h2 id="radiobiology-modal-title" className="text-lg font-bold text-white sm:text-xl">
                  {lang === 'tr' ? 'Lineer-Kuadratik Radyobiyolojik Doz EÅŸdeÄŸerlik Konsolu' : 'Linear-Quadratic Radiobiological Dose Equivalence Console'}
                </h2>
                <p className="mt-1 max-w-2xl text-xs leading-relaxed text-slate-400">
                  {lang === 'tr'
                    ? 'FarklÄ± fraksiyonasyon ÅŸemalarÄ±nÄ± kÄ±yaslayÄ±n; izoefektif EQD2 ve BED deÄŸerlerini anÄ±nda hesaplayÄ±n.'
                    : 'Compare fractionation schedules and calculate isoeffective EQD2 and BED values in real time.'}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsRadiobiologyModalOpen(false)}
                aria-label={lang === 'tr' ? 'Radyobiyoloji dÃ¶nÃ¼ÅŸtÃ¼rÃ¼cÃ¼sÃ¼nÃ¼ kapat' : 'Close radiobiology calculator'}
                className="shrink-0 rounded-xl border border-slate-700 p-2 text-slate-400 transition hover:border-slate-500 hover:bg-slate-800 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500"
              >
                <XCircle className="h-5 w-5" aria-hidden="true" />
              </button>
            </header>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <section className="rounded-2xl border border-indigo-500/25 bg-indigo-500/[0.06] p-4">
                <div className="mb-4 flex items-center justify-between gap-2">
                  <div>
                    <h3 className="text-sm font-bold text-indigo-200">{lang === 'tr' ? 'A. Mevcut ReÃ§ete' : 'A. Current Prescription'}</h3>
                    <p className="mt-0.5 text-[11px] text-slate-400">{tText(activeScheme.name)}</p>
                  </div>
                  <span className="rounded-full border border-indigo-400/30 bg-indigo-400/10 px-2 py-1 text-[10px] font-semibold text-indigo-200">
                    {lang === 'tr' ? 'REFERANS' : 'REFERENCE'}
                  </span>
                </div>
                <div className="mb-4 grid grid-cols-3 gap-2">
                  {[
                    { label: 'D', value: `${radiobiologyComparison.reference.dose.toFixed(1)} Gy` },
                    { label: 'n', value: `${radiobiologyComparison.reference.fractions} fx` },
                    { label: 'd', value: `${radiobiologyComparison.reference.fractionDose.toFixed(2)} Gy/fx` },
                  ].map(metric => (
                    <div key={metric.label} className="rounded-xl border border-slate-700/70 bg-slate-950/40 p-2">
                      <div className="text-[10px] text-slate-500">{metric.label}</div>
                      <div className="mt-0.5 text-xs font-bold text-white">{metric.value}</div>
                    </div>
                  ))}
                </div>
                <div className="mb-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  {lang === 'tr' ? `TÃ¼mÃ¶r Î±/Î² = ${radiobiologyComparison.reference.alphaBeta} Gy` : `Tumor Î±/Î² = ${radiobiologyComparison.reference.alphaBeta} Gy`}
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="rounded-xl bg-slate-950/40 p-2.5"><div className="text-[10px] text-slate-400">BED</div><div className="font-mono text-sm font-bold text-amber-300">{radiobiologyComparison.reference.tumorBed.toFixed(1)} Gy</div></div>
                  <div className="rounded-xl bg-slate-950/40 p-2.5"><div className="text-[10px] text-slate-400">EQD2</div><div className="font-mono text-sm font-bold text-emerald-300">{radiobiologyComparison.reference.tumorEqd2.toFixed(1)} Gy</div></div>
                </div>
                <div className="mb-2 mt-4 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  {lang === 'tr' ? 'GeÃ§ Hasar / Normal Doku Î±/Î² = 3 Gy' : 'Late Tissue / Normal Tissue Î±/Î² = 3 Gy'}
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="rounded-xl bg-slate-950/40 p-2.5"><div className="text-[10px] text-slate-400">BEDâ‚ƒ</div><div className="font-mono text-sm font-bold text-amber-300">{radiobiologyComparison.reference.lateBed.toFixed(1)} Gy</div></div>
                  <div className="rounded-xl bg-slate-950/40 p-2.5"><div className="text-[10px] text-slate-400">EQD2â‚ƒ</div><div className="font-mono text-sm font-bold text-emerald-300">{radiobiologyComparison.reference.lateEqd2.toFixed(1)} Gy</div></div>
                </div>
              </section>

              <section className="rounded-2xl border border-sky-500/25 bg-sky-500/[0.05] p-4">
                <div className="mb-4">
                  <h3 className="text-sm font-bold text-sky-200">{lang === 'tr' ? 'B. Test Edilen Fraksiyonasyon' : 'B. Test Fractionation Schedule'}</h3>
                  <p className="mt-0.5 text-[11px] text-slate-400">{lang === 'tr' ? 'Yeni ÅŸema iÃ§in deÄŸerleri dÃ¼zenleyin.' : 'Edit values for the proposed schedule.'}</p>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <label className="text-[11px] font-medium text-slate-300" htmlFor="comparison-fraction-dose">
                    {lang === 'tr' ? 'Fraksiyon baÅŸÄ±na doz (d), Gy' : 'Dose per fraction (d), Gy'}
                    <input
                      id="comparison-fraction-dose"
                      type="number"
                      min="1.8"
                      max="20"
                      step="0.1"
                      value={comparisonDosePerFraction}
                      onChange={event => {
                        const value = Number(event.currentTarget.value);
                        if (Number.isFinite(value)) setComparisonDosePerFraction(Math.min(20, Math.max(1.8, value)));
                      }}
                      className="mt-1.5 w-full rounded-lg border border-slate-700 bg-slate-950/60 px-2.5 py-2 text-sm text-white outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
                    />
                  </label>
                  <label className="text-[11px] font-medium text-slate-300" htmlFor="comparison-fraction-count">
                    {lang === 'tr' ? 'Fraksiyon sayÄ±sÄ± (n)' : 'Number of fractions (n)'}
                    <input
                      id="comparison-fraction-count"
                      type="number"
                      min="1"
                      max="40"
                      step="1"
                      value={comparisonFractions}
                      onChange={event => {
                        const value = Number(event.currentTarget.value);
                        if (Number.isFinite(value)) setComparisonFractions(Math.round(Math.min(40, Math.max(1, value))));
                      }}
                      className="mt-1.5 w-full rounded-lg border border-slate-700 bg-slate-950/60 px-2.5 py-2 text-sm text-white outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
                    />
                  </label>
                </div>
                <input
                  type="range"
                  min="1.8"
                  max="20"
                  step="0.1"
                  value={comparisonDosePerFraction}
                  onChange={event => setComparisonDosePerFraction(Number(event.currentTarget.value))}
                  aria-label={lang === 'tr' ? 'Fraksiyon baÅŸÄ±na dozu ayarla' : 'Adjust dose per fraction'}
                  className="mt-2 h-1.5 w-full cursor-pointer accent-sky-500"
                />
                <div className="mt-3 rounded-lg border border-slate-700/70 bg-slate-950/40 px-3 py-2 text-xs">
                  <span className="text-slate-400">{lang === 'tr' ? 'Otomatik toplam doz:' : 'Calculated total dose:'}</span>
                  <strong className="ml-2 font-mono text-white">{radiobiologyComparison.comparison.dose.toFixed(1)} Gy</strong>
                  <span className="ml-2 text-slate-500">D = n Ã— d</span>
                </div>
                <div className="mt-4">
                  <div className="mb-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    {lang === 'tr' ? 'TÃ¼mÃ¶r Î±/Î² SeÃ§imi' : 'Tumor Î±/Î² Selection'}
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {[
                      { value: 10, label: lang === 'tr' ? '10 Gy â€¢ Genel tÃ¼mÃ¶r' : '10 Gy â€¢ Most tumors' },
                      { value: 4, label: lang === 'tr' ? '4 Gy â€¢ Meme' : '4 Gy â€¢ Breast' },
                      { value: 1.5, label: lang === 'tr' ? '1.5 Gy â€¢ Prostat' : '1.5 Gy â€¢ Prostate' },
                      { value: 3, label: lang === 'tr' ? '3 Gy â€¢ Sarkom / geÃ§ doku' : '3 Gy â€¢ Sarcoma / late tissue' },
                    ].map(option => (
                      <button
                        key={option.value}
                        type="button"
                        aria-pressed={comparisonAlphaBeta === option.value}
                        onClick={() => setComparisonAlphaBeta(option.value)}
                        className={`rounded-lg border px-2 py-1.5 text-[10px] font-semibold transition ${comparisonAlphaBeta === option.value ? 'border-sky-400 bg-sky-500/20 text-sky-100' : 'border-slate-700 bg-slate-900/70 text-slate-400 hover:border-slate-500 hover:text-white'}`}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="mb-2 mt-4 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  {lang === 'tr' ? `TÃ¼mÃ¶r Î±/Î² = ${comparisonAlphaBeta} Gy` : `Tumor Î±/Î² = ${comparisonAlphaBeta} Gy`}
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="rounded-xl bg-slate-950/40 p-2.5"><div className="text-[10px] text-slate-400">BED</div><div className="font-mono text-sm font-bold text-amber-300">{radiobiologyComparison.comparison.tumorBed.toFixed(1)} Gy</div></div>
                  <div className="rounded-xl bg-slate-950/40 p-2.5"><div className="text-[10px] text-slate-400">EQD2</div><div className="font-mono text-sm font-bold text-emerald-300">{radiobiologyComparison.comparison.tumorEqd2.toFixed(1)} Gy</div></div>
                </div>
                <div className="mb-2 mt-4 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  {lang === 'tr' ? 'GeÃ§ Hasar / Normal Doku Î±/Î² = 3 Gy' : 'Late Tissue / Normal Tissue Î±/Î² = 3 Gy'}
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="rounded-xl bg-slate-950/40 p-2.5"><div className="text-[10px] text-slate-400">BEDâ‚ƒ</div><div className="font-mono text-sm font-bold text-amber-300">{radiobiologyComparison.comparison.lateBed.toFixed(1)} Gy</div></div>
                  <div className="rounded-xl bg-slate-950/40 p-2.5"><div className="text-[10px] text-slate-400">EQD2â‚ƒ</div><div className="font-mono text-sm font-bold text-emerald-300">{radiobiologyComparison.comparison.lateEqd2.toFixed(1)} Gy</div></div>
                </div>
              </section>
            </div>

            <div className="mt-4 rounded-xl border border-slate-700/70 bg-slate-950/40 px-3 py-2.5 text-center font-mono text-[10px] leading-relaxed text-slate-300 sm:text-xs">
              BED = D Ã— (1 + d / (Î±/Î²)) <span className="mx-2 text-slate-600">|</span> EQD2 = BED / (1 + 2 / (Î±/Î²))
              <span className="mt-1 block font-sans text-[10px] text-slate-500">{lang === 'tr' ? 'GeÃ§ doku karÅŸÄ±laÅŸtÄ±rmasÄ± iÃ§in Î±/Î² = 3 Gy alÄ±nmÄ±ÅŸtÄ±r.' : 'Late-tissue comparison uses Î±/Î² = 3 Gy.'}</span>
            </div>

            <section className="mt-4 rounded-2xl border border-slate-700/80 bg-slate-900/50 p-4">
              <h3 className="mb-3 text-sm font-bold text-white">{lang === 'tr' ? 'Otomatik Fark ve Klinik KÄ±yaslama' : 'Automatic Delta and Clinical Comparison'}</h3>
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                <div className={`rounded-xl border p-3 ${Math.abs(radiobiologyComparison.tumorEqd2DeltaPercent) <= 5 ? 'border-emerald-500/30 bg-emerald-500/10' : radiobiologyComparison.tumorEqd2Delta > 0 ? 'border-amber-500/30 bg-amber-500/10' : 'border-sky-500/30 bg-sky-500/10'}`}>
                  <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">{lang === 'tr' ? 'TÃ¼mÃ¶r EQD2 FarkÄ±' : 'Tumor EQD2 Difference'}</div>
                  <div className="mt-1 text-sm font-bold text-white">
                    {radiobiologyComparison.tumorEqd2Delta > 0 ? '+' : ''}{radiobiologyComparison.tumorEqd2Delta.toFixed(1)} Gy ({radiobiologyComparison.tumorEqd2DeltaPercent > 0 ? '+' : ''}{radiobiologyComparison.tumorEqd2DeltaPercent.toFixed(1)}%)
                  </div>
                  <div className="mt-0.5 text-[11px] text-slate-300">
                    {Math.abs(radiobiologyComparison.tumorEqd2DeltaPercent) <= 5
                      ? (lang === 'tr' ? 'YakÄ±n izoefektif aralÄ±k' : 'Within a near-isoeffective range')
                      : radiobiologyComparison.tumorEqd2Delta > 0
                        ? (lang === 'tr' ? 'Modelde daha yÃ¼ksek tÃ¼mÃ¶r EQD2' : 'Higher modeled tumor EQD2')
                        : (lang === 'tr' ? 'Modelde daha dÃ¼ÅŸÃ¼k tÃ¼mÃ¶r EQD2' : 'Lower modeled tumor EQD2')}
                  </div>
                </div>
                <div className={`rounded-xl border p-3 ${radiobiologyComparison.lateBedDelta <= 0 ? 'border-emerald-500/30 bg-emerald-500/10' : 'border-rose-500/30 bg-rose-500/10'}`}>
                  <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">{lang === 'tr' ? 'Normal Doku BEDâ‚ƒ FarkÄ±' : 'Normal Tissue BEDâ‚ƒ Difference'}</div>
                  <div className="mt-1 text-sm font-bold text-white">{radiobiologyComparison.lateBedDelta > 0 ? '+' : ''}{radiobiologyComparison.lateBedDelta.toFixed(1)} Gy</div>
                  <div className="mt-0.5 text-[11px] text-slate-300">
                    {radiobiologyComparison.lateBedDelta < 0
                      ? (lang === 'tr' ? 'Daha dÃ¼ÅŸÃ¼k modellenen geÃ§ doku etkisi' : 'Lower modeled late-tissue effect')
                      : radiobiologyComparison.lateBedDelta > 0
                        ? (lang === 'tr' ? 'Daha yÃ¼ksek modellenen geÃ§ doku etkisi' : 'Higher modeled late-tissue effect')
                        : (lang === 'tr' ? 'Referansla aynÄ± BEDâ‚ƒ' : 'Same BEDâ‚ƒ as reference')}
                  </div>
                </div>
              </div>
            </section>

            <section className="mt-4 rounded-2xl border border-amber-500/25 bg-amber-500/[0.05] p-4">
              <h3 className="text-sm font-bold text-amber-100">{lang === 'tr' ? 'Tedavi ArasÄ± / RepopÃ¼lasyon Telafisi Tahmini' : 'Treatment Gap / Repopulation Compensation Estimate'}</h3>
              <p className="mt-1 text-[11px] leading-relaxed text-slate-400">
                {lang === 'tr' ? 'YaklaÅŸÄ±k doÄŸrusal model: Î”D = kaÃ§Ä±rÄ±lan gÃ¼n Ã— 0.6 Gy/gÃ¼n. Bu tahmin reÃ§ete deÄŸiÅŸikliÄŸi deÄŸildir.' : 'Approximate linear model: Î”D = missed days Ã— 0.6 Gy/day. This estimate is not a prescription change.'}
              </p>
              <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-3">
                <label className="text-[11px] font-medium text-slate-300" htmlFor="missed-treatment-days">
                  {lang === 'tr' ? 'KaÃ§Ä±rÄ±lan gÃ¼n / fraksiyon (k)' : 'Missed days / fractions (k)'}
                  <input
                    id="missed-treatment-days"
                    type="number"
                    min="0"
                    max="40"
                    step="1"
                    value={missedTreatmentDays}
                    onChange={event => {
                      const value = Number(event.currentTarget.value);
                      if (Number.isFinite(value)) setMissedTreatmentDays(Math.round(Math.min(40, Math.max(0, value))));
                    }}
                    className="mt-1.5 w-full rounded-lg border border-slate-700 bg-slate-950/60 px-2.5 py-2 text-sm text-white outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
                  />
                </label>
                <label className="text-[11px] font-medium text-slate-300" htmlFor="remaining-treatment-fractions">
                  {lang === 'tr' ? 'Kalan fraksiyon sayÄ±sÄ±' : 'Remaining fractions'}
                  <input
                    id="remaining-treatment-fractions"
                    type="number"
                    min="1"
                    max="40"
                    step="1"
                    value={remainingTreatmentFractions}
                    onChange={event => {
                      const value = Number(event.currentTarget.value);
                      if (Number.isFinite(value)) setRemainingTreatmentFractions(Math.round(Math.min(40, Math.max(1, value))));
                    }}
                    className="mt-1.5 w-full rounded-lg border border-slate-700 bg-slate-950/60 px-2.5 py-2 text-sm text-white outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
                  />
                </label>
                <div className="rounded-xl border border-slate-700/70 bg-slate-950/40 p-3">
                  <div className="text-[10px] text-slate-400">{lang === 'tr' ? 'Hesaplanan doz kaybÄ± (Î”D)' : 'Estimated dose loss (Î”D)'}</div>
                  <div className="mt-1 font-mono text-sm font-bold text-amber-300">{(missedTreatmentDays * 0.6).toFixed(1)} Gy</div>
                  <div className="mt-1 text-[10px] text-slate-400">
                    {lang === 'tr' ? 'Telafi iÃ§in kalan fx baÅŸÄ±na' : 'Estimated per remaining fx'}: <strong className="text-white">{((missedTreatmentDays * 0.6) / remainingTreatmentFractions).toFixed(2)} Gy</strong>
                  </div>
                </div>
              </div>
              <p className="mt-3 text-[10px] leading-relaxed text-slate-500">
                {lang === 'tr'
                  ? 'LQ tahminleri klinik toksisiteyi veya tÃ¼mÃ¶r kontrolÃ¼nÃ¼ tek baÅŸÄ±na belirlemez. Herhangi bir fraksiyonasyon telafisi; endikasyon, tedavi amacÄ±, normal doku dozlarÄ± ve kurum protokolÃ¼yle sorumlu radyasyon onkoloÄŸu tarafÄ±ndan doÄŸrulanmalÄ±dÄ±r.'
                  : 'LQ estimates do not independently predict clinical toxicity or tumor control. Any compensation must be reviewed by the treating radiation oncologist against intent, indication, normal-tissue doses, and institutional protocol.'}
              </p>
            </section>
          </section>
        </div>
      )}

      {isAiOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-end bg-slate-950/40 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-labelledby="ai-copilot-title"
          onMouseDown={event => {
            if (event.target === event.currentTarget) setIsAiOpen(false);
          }}
        >
          <div className="flex h-full w-full max-w-md flex-col justify-between overflow-y-auto border-l border-slate-800 bg-[#0c1322] p-6 shadow-2xl">
            <div>
              <div className="mb-4 flex items-center justify-between border-b border-slate-100 pb-4 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-blue-600" aria-hidden="true" />
                  <h3 id="ai-copilot-title" className="text-sm font-bold text-slate-900 dark:text-white">
                    {lang === 'tr' ? 'Onkoloji AI DanÄ±ÅŸmanÄ±' : 'Oncology AI Copilot'}
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setIsAiOpen(false)}
                  aria-label={lang === 'tr' ? 'AI danÄ±ÅŸmanÄ±nÄ± kapat' : 'Close AI copilot'}
                  className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-white"
                >
                  <XCircle className="h-5 w-5" aria-hidden="true" />
                </button>
              </div>

              <div className="mb-4 rounded-xl border border-blue-200 bg-blue-50 p-3 text-xs dark:border-blue-800/60 dark:bg-blue-950/40">
                <div className="mb-1 font-semibold text-blue-900 dark:text-blue-300">
                  {lang === 'tr' ? 'Aktif Vaka BaÄŸlamÄ±:' : 'Active Case Context:'}
                </div>
                <div className="font-mono text-[11px] text-slate-600 dark:text-slate-200">
                  {selectedOrgan.toUpperCase()} â€¢ {selectedT} {selectedN} {selectedM} â€¢ {tText(activeScheme.name)}
                </div>
              </div>

              <div className="mb-4">
                <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                  {lang === 'tr' ? 'HazÄ±rlanan Uzman KonsÃ¼ltasyon Sorusu:' : 'Prepared Expert Case Prompt:'}
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
                  <span className="flex items-center gap-1.5"><AiLogo id="chatgpt" className="h-4 w-4" />{lang === 'tr' ? 'ChatGPT ile AÃ§' : 'Open in ChatGPT'}</span>
                  <span className="text-[10px] opacity-80">{lang === 'tr' ? 'Panoya Kopyalar â†—' : 'Copies to Clipboard â†—'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    copyCasePrompt();
                    window.open('https://gemini.google.com', '_blank', 'noopener,noreferrer');
                  }}
                  className="flex w-full items-center justify-between rounded-xl bg-[#1a73e8] px-3 py-2.5 text-xs font-semibold text-white shadow-sm transition hover:bg-[#1557b0]"
                >
                  <span className="flex items-center gap-1.5"><AiLogo id="gemini" className="h-4 w-4" />{lang === 'tr' ? 'Google Gemini ile AÃ§' : 'Open in Google Gemini'}</span>
                  <span className="text-[10px] opacity-80">{lang === 'tr' ? 'Panoya Kopyalar â†—' : 'Copies to Clipboard â†—'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    copyCasePrompt();
                    window.open('https://claude.ai', '_blank', 'noopener,noreferrer');
                  }}
                  className="flex w-full items-center justify-between rounded-xl bg-[#d97706] px-3 py-2.5 text-xs font-semibold text-white shadow-sm transition hover:bg-[#b45309]"
                >
                  <span className="flex items-center gap-1.5"><AiLogo id="claude" className="h-4 w-4" />{lang === 'tr' ? 'Claude ile AÃ§' : 'Open in Claude'}</span>
                  <span className="text-[10px] opacity-80">{lang === 'tr' ? 'Panoya Kopyalar â†—' : 'Copies to Clipboard â†—'}</span>
                </button>
                <button
                  type="button"
                  onClick={copyCasePrompt}
                  className="flex w-full items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-slate-100 px-3 py-2 text-xs font-medium text-slate-700 transition hover:bg-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
                >
                  <Copy className="h-3.5 w-3.5" aria-hidden="true" />
                  <span>{copiedPrompt ? (lang === 'tr' ? 'Panoya KopyalandÄ±!' : 'Copied to Clipboard!') : (lang === 'tr' ? 'Sadece Metni Kopyala' : 'Copy Prompt Only')}</span>
                </button>
              </div>
            </div>

            <div className="border-t border-slate-100 pt-4 text-center text-[11px] text-slate-400 dark:border-slate-800">
              {lang === 'tr'
                ? 'API anahtarÄ± gerektirmez. Mevcut AI hesabÄ±nÄ±zda aÃ§madan Ã¶nce vaka sorusunu panoya kopyalar.'
                : 'No API key required. The case prompt is copied before opening your existing AI account.'}
            </div>
          </div>
        </div>
      )}

      {isReportModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-2xl border border-slate-800 bg-[#0c1322] p-6 shadow-2xl">
            <div className="mb-4 flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-blue-600" aria-hidden="true" />
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  {lang === 'tr' ? 'TÄ±bbi Rapor Analizi & Otomatik Evreleme' : 'Clinical Report Analysis & Auto-Staging'}
                </h3>
              </div>
              <button type="button" onClick={() => { setIsReportModalOpen(false); setIsDragging(false); }} aria-label={lang === 'tr' ? 'Rapor penceresini kapat' : 'Close report window'} className="text-slate-400 hover:text-slate-600 dark:hover:text-white">
                <XCircle className="h-5 w-5" aria-hidden="true" />
              </button>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept=".txt,.pdf,.doc,.docx,.png,.jpg,.jpeg"
              className="hidden"
              onChange={event => {
                const file = event.currentTarget.files?.[0];
                if (file) handleFileProcess(file);
                event.currentTarget.value = '';
              }}
            />
            <div
              onDragOver={event => {
                event.preventDefault();
                setIsDragging(true);
              }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={event => {
                event.preventDefault();
                setIsDragging(false);
                const file = event.dataTransfer.files?.[0];
                if (file) handleFileProcess(file);
              }}
              onClick={() => fileInputRef.current?.click()}
              onKeyDown={event => {
                if (event.key === 'Enter' || event.key === ' ') fileInputRef.current?.click();
              }}
              role="button"
              tabIndex={0}
              className={`mb-4 cursor-pointer rounded-xl border-2 border-dashed p-4 text-center transition-all ${
                isDragging
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/40'
                  : 'border-slate-300 bg-slate-50/50 hover:border-blue-400 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800/20 dark:hover:bg-slate-800/50'
              }`}
            >
              <div className="flex flex-col items-center justify-center gap-1.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-100 text-blue-600 dark:bg-blue-900/40 dark:text-blue-400">
                  <UploadCloud className="h-5 w-5" aria-hidden="true" />
                </div>
                {uploadedFileName ? (
                  <div className="flex max-w-full items-center gap-2 text-xs font-bold text-emerald-600 dark:text-emerald-400">
                    <CheckCircle2 className="h-4 w-4 shrink-0" aria-hidden="true" />
                    <span className="max-w-[280px] truncate">{uploadedFileName}</span>
                    <span className="text-[10px] font-normal text-slate-400">({lang === 'tr' ? 'Okundu' : 'Loaded'})</span>
                  </div>
                ) : (
                  <>
                    <div className="text-xs font-bold text-slate-800 dark:text-slate-200">
                      {lang === 'tr' ? 'Belge / Rapor DosyasÄ± SeÃ§in veya SÃ¼rÃ¼kleyin' : 'Choose or Drag & Drop Report File'}
                    </div>
                    <div className="text-[10px] text-slate-400">
                      PDF, TXT, DOCX, JPG, PNG â€¢ {lang === 'tr' ? 'Otomatik Metin Ã‡Ä±karÄ±mÄ±' : 'Automatic Text Extraction'}
                    </div>
                  </>
                )}
              </div>
            </div>
            <div className="mb-3 flex items-center gap-3 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
              <div className="h-px flex-1 bg-slate-200 dark:bg-slate-800" />
              <span>{lang === 'tr' ? 'veya metni aÅŸaÄŸÄ±ya yapÄ±ÅŸtÄ±rÄ±n' : 'or paste text directly below'}</span>
              <div className="h-px flex-1 bg-slate-200 dark:bg-slate-800" />
            </div>
            <textarea
              rows={6}
              value={reportInputText}
              onChange={event => {
                const value = event.currentTarget.value;
                setReportInputText(value);
                setParsedData(value.trim().length > 10 ? parseMedicalReport(value) : null);
              }}
              placeholder={lang === 'tr' ? "Ã–rnek: 'Prostat biyopsisinde Gleason 4+3=7, PSA: 14 ng/ml, cT3a, N0, M0...'" : 'Paste pathology, MRI, or PET report text here...'}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs leading-relaxed text-slate-700 outline-none dark:border-slate-700 dark:bg-slate-800/80 dark:text-slate-200"
            />
            {parsedData && (
              <div className="mb-4 mt-3 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-xs dark:border-emerald-800/60 dark:bg-emerald-950/40">
                <div className="mb-1.5 flex items-center gap-1.5 font-bold text-emerald-800 dark:text-emerald-300">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" aria-hidden="true" />
                  <span>{lang === 'tr' ? 'Tespit Edilen Klinik Veriler:' : 'Extracted Clinical Parameters:'}</span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-[11px] font-mono text-slate-700 dark:text-slate-300">
                  <div>Organ: <span className="font-bold text-slate-900 dark:text-white">{parsedData.detectedOrgan?.toUpperCase() || '-'}</span></div>
                  <div>TNM: <span className="font-bold text-blue-600">{parsedData.t || 'T?'} {parsedData.n || 'N?'} {parsedData.m || 'M?'}</span></div>
                  {parsedData.psa && <div>PSA: <span className="font-bold text-slate-900 dark:text-white">{parsedData.psa} ng/mL</span></div>}
                  {parsedData.gleasonPrimary && <div>Gleason: <span className="font-bold text-slate-900 dark:text-white">{parsedData.gleasonPrimary}+{parsedData.gleasonSecondary}</span></div>}
                  {parsedData.ki67 !== undefined && <div>Ki-67: <span className="font-bold text-slate-900 dark:text-white">%{parsedData.ki67}</span></div>}
                  {parsedData.centrality && <div>Centrality: <span className="font-bold text-slate-900 dark:text-white">{parsedData.centrality}</span></div>}
                </div>
              </div>
            )}
            <div className="flex items-center justify-end gap-2 border-t border-slate-100 pt-3 dark:border-slate-800">
              <button type="button" onClick={() => { setReportInputText(''); setParsedData(null); setUploadedFileName(''); setIsDragging(false); setIsReportModalOpen(false); }} className="rounded-xl px-3 py-2 text-xs font-semibold text-slate-500 hover:text-slate-700 dark:hover:text-slate-200">
                {lang === 'tr' ? 'VazgeÃ§' : 'Cancel'}
              </button>
              <button
                type="button"
                disabled={!parsedData?.detectedOrgan}
                onClick={() => {
                  if (!parsedData?.detectedOrgan) return;
                  setSelectedOrgan(parsedData.detectedOrgan);
                  if (parsedData.detectedSubsite) {
                    setSelectedSubsite(parsedData.detectedSubsite);
                    handleSubsiteChange(parsedData.detectedSubsite);
                  } else {
                    handleOrganChange(parsedData.detectedOrgan);
                  }
                  if (parsedData.t) setSelectedT(parsedData.t);
                  if (parsedData.n) setSelectedN(parsedData.n);
                  if (parsedData.m) setSelectedM(parsedData.m);
                  if (parsedData.psa) setPsaLevel(parsedData.psa);
                  if (parsedData.gleasonPrimary !== undefined) setGleasonPrimary(String(parsedData.gleasonPrimary));
                  if (parsedData.gleasonSecondary !== undefined) setGleasonSecondary(String(parsedData.gleasonSecondary));
                  setIsReportModalOpen(false);
                  setIsDragging(false);
                }}
                className="rounded-xl bg-blue-600 px-4 py-2 text-xs font-bold text-white shadow-md transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {lang === 'tr' ? 'Sisteme Uygula & Otomatik Evrele â”' : 'Apply to CDSS & Auto-Stage â”'}
              </button>
            </div>
          </div>
        </div>
      )}

      {isCaseArchiveOpen && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-950/80 p-3 backdrop-blur-sm">
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="case-archive-title"
            className="flex max-h-[90vh] w-full max-w-4xl flex-col overflow-hidden rounded-2xl border border-slate-700 bg-[#0d1527] shadow-2xl"
          >
            <header className="flex items-center justify-between gap-3 border-b border-slate-800 px-4 py-3 sm:px-6">
              <h2 id="case-archive-title" className="text-base font-bold text-white sm:text-lg">
                ğŸ“ {lang === 'tr' ? 'Klinik Vaka ArÅŸivi' : 'Clinical Case Archive'}
              </h2>
              <button
                type="button"
                onClick={() => setIsCaseArchiveOpen(false)}
                aria-label={lang === 'tr' ? 'Vaka arÅŸivini kapat' : 'Close case archive'}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white"
              >
                <XCircle className="h-5 w-5" aria-hidden="true" />
              </button>
            </header>
            <p className="border-b border-slate-800 bg-slate-900/50 px-4 py-2 text-[11px] leading-relaxed text-amber-100/80 sm:px-6">
              {lang === 'tr'
                ? 'KayÄ±tlar yalnÄ±zca bu tarayÄ±cÄ±nÄ±n localStorage alanÄ±nda tutulur ve sunucuya gÃ¶nderilmez. Depolama ÅŸifreli deÄŸildir; mÃ¼mkÃ¼nse kimliksiz ID kullanÄ±n, cihaz eriÅŸimini koruyun ve yerel mevzuat uyumunu kurumunuzla doÄŸrulayÄ±n.'
                : 'Records stay in this browser localStorage and are not sent to a server. Storage is not encrypted; use pseudonymous IDs where possible, protect device access, and confirm local regulatory compliance with your institution.'}
            </p>
            <div className="flex-1 space-y-2 overflow-y-auto p-3 sm:p-5">
              {caseArchive.length === 0 ? (
                <p className="rounded-xl border border-dashed border-slate-700 p-6 text-center text-sm text-slate-400">
                  {lang === 'tr' ? 'HenÃ¼z arÅŸivlenmiÅŸ vaka yok.' : 'No cases have been archived yet.'}
                </p>
              ) : caseArchive.map(record => (
                <article key={record.id} className="rounded-xl border border-slate-800 bg-slate-900/50 p-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <h3 className="truncate text-sm font-semibold text-white">
                        {record.diagnosis} Â· {record.patientId}
                      </h3>
                      <p className="mt-1 text-xs text-slate-300">
                        {lang === 'tr' ? 'Evre' : 'Stage'}: {record.stage}
                        {record.age && ` Â· ${record.age} ${lang === 'tr' ? 'yaÅŸ' : 'years'}`}
                        {record.gender && ` Â· ${record.gender}`}
                      </p>
                      <p className="mt-1 text-xs text-slate-200">{record.prescription}</p>
                      <p className="mt-1 font-mono text-[11px] text-sky-200">
                        BEDâ‚â‚€ {record.bed} Gy Â· EQD2â‚â‚€ {record.eqd2} Gy
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeArchivedCase(record.id)}
                      aria-label={`${lang === 'tr' ? 'ArÅŸivden sil' : 'Remove from archive'}: ${record.patientId}`}
                      className="shrink-0 rounded-lg p-1.5 text-slate-400 hover:bg-rose-500/10 hover:text-rose-300"
                    >
                      <XCircle className="h-4 w-4" aria-hidden="true" />
                    </button>
                  </div>
                </article>
              ))}
            </div>
            <footer className="flex flex-col-reverse gap-2 border-t border-slate-800 p-3 sm:flex-row sm:justify-end sm:px-5">
              <button
                type="button"
                onClick={() => setIsCaseArchiveOpen(false)}
                className="rounded-lg border border-slate-700 px-3 py-2 text-xs font-semibold text-slate-300 hover:bg-slate-800"
              >
                {lang === 'tr' ? 'Kapat' : 'Close'}
              </button>
              <button
                type="button"
                disabled={caseArchive.length === 0}
                onClick={exportCaseArchive}
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-emerald-600 px-3 py-2 text-xs font-bold text-white hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <Download className="h-4 w-4" aria-hidden="true" />
                {lang === 'tr' ? "Excel'e Aktar (.csv)" : 'Export for Excel (.csv)'}
              </button>
            </footer>
          </section>
        </div>
      )}

      {/* ==========================================
          MODAL: KILAVUZ BÄ°LGÄ° DOKÃœMANI
         ========================================== */}
      {showGuidelineModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="reference-modal-title"
            className="bg-[#131c31] border border-slate-700 rounded-lg max-w-3xl w-full p-6 text-xs text-slate-200 max-h-[85vh] overflow-y-auto"
          >
            <div className="flex justify-between items-center pb-3 border-b border-slate-200/80 mb-4">
              <h3 id="reference-modal-title" className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-amber-700" />
                {lang === 'tr' ? 'Radyasyon Onkolojisi CDSS - KÄ±lavuzlar ve Yasal Bilgilendirme' : 'Radiation Oncology CDSS - Guidelines & Legal Framework'}</h3>
              <button
                onClick={() => setShowGuidelineModal(false)}
                aria-label={lang === 'tr' ? 'KÄ±lavuz penceresini kapat' : 'Close guidelines window'}
                className="text-slate-600 hover:text-slate-900 p-1 rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
              >
                <XCircle className="w-5 h-5" aria-hidden="true" />
              </button>
            </div>

            <div role="tablist" aria-label={lang === 'tr' ? 'KaynakÃ§a modalÄ± sekmeleri' : 'Reference modal tabs'} className="mb-4 flex flex-wrap gap-2 border-b border-slate-200 dark:border-slate-700">
              {([
              ['guidelines', lang === 'tr' ? 'KÄ±lavuzlar & Landmark Ã‡alÄ±ÅŸmalar' : 'Guidelines & Landmark Trials'],
              ['oar', lang === 'tr' ? 'OAR Tolerans StandartlarÄ±' : 'OAR Dose Constraints & Standards'],
              ['disclaimer', lang === 'tr' ? 'Yasal Sorumluluk & Telif' : 'Legal Disclaimer & Copyright'],
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
                  <p>{lang === 'tr'
                    ? 'Klinik kapsam, NCCN v1.2025, ASTRO ve ESTRO kÄ±lavuzlarÄ± ile uluslararasÄ± randomize Faz III Ã§alÄ±ÅŸmalarÄ±n kanÄ±tlarÄ± doÄŸrultusunda dÃ¼zenlenmiÅŸtir. KÄ±lavuz sÃ¼rÃ¼mleri ve Ã¶neriler klinik kullanÄ±mdan Ã¶nce gÃ¼ncel kaynaklardan doÄŸrulanmalÄ±dÄ±r.'
                    : 'Clinical scope is structured in strict alignment with NCCN v1.2025, ASTRO, ESTRO guidelines, and international randomized Phase III clinical trials. Guideline versions and recommendations must be clinically verified against current institutional protocols prior to application.'}</p>
                  <div>
                    <h4 className="mb-1 font-bold text-amber-700">{lang === 'tr' ? 'Landmark Ã§alÄ±ÅŸmalar ve klinik baÅŸlÄ±klar' : 'Landmark Trials and Clinical Topics'}</h4>
                    <ul className="list-disc space-y-1 pl-5">
                      {lang === 'tr' ? <><li><strong>Toraks:</strong> PACIFIC (evre III KHDAK), Turrisi ve CONVERT (KHAK), Lung-ART (postoperatif toraks RT).</li><li><strong>Meme:</strong> FAST-Forward (hipofraksiyone adjuvan RT).</li><li><strong>GÄ°S:</strong> RAPIDO ve PRODIGE-23 (rektum TNT), PORTEC-3 (endometriyum adjuvan kemoradyoterapi).</li><li><strong>Jinekoloji:</strong> EMBRACE II (serviks KRT ve gÃ¶rÃ¼ntÃ¼ kÄ±lavuzlu brakiterapi).</li><li><strong>MSS:</strong> Stupp protokolÃ¼ (glioblastom kemoradyoterapisi).</li></> : <><li>Thorax: PACIFIC (Stage III NSCLC concurrent CRT + durvalumab), Turrisi and CONVERT (SCLC hyperfractionated/conventional CRT), and Lung-ART (PORT indication).</li><li>Breast: FAST-Forward (1-week adjuvant hypofractionation 26 Gy/5 fx), DBCG/BIG (regional nodal irradiation).</li><li>GI: RAPIDO and PRODIGE-23 (total neoadjuvant therapy for LARC), PORTEC-3 (adjuvant chemoradiotherapy for high-risk endometrial cancer).</li><li>Gynecology: EMBRACE II (cervical chemoradiotherapy and 3D MR-IGABT brachytherapy).</li><li>CNS: Stupp protocol (glioblastoma 60 Gy + concurrent/adjuvant TMZ), Perry protocol (elderly hypofractionation).</li></>}
                    </ul>
                  </div>
                  <p className="text-[11px] text-slate-600 dark:text-slate-200">
                    {lang === 'tr' ? 'NCCNÂ®, ASTROÂ®, ESTROÂ®, RTOGÂ®, QUANTECÂ® ve DEGROÂ® ilgili kurumlarÄ±n tescilli markalarÄ±dÄ±r.' : 'NCCNÂ®, ASTROÂ®, ESTROÂ®, RTOGÂ®, QUANTECÂ®, and DEGROÂ® are registered trademarks of their respective organizations.'}</p>
                </>
              )}
              {activeReferenceTab === 'oar' && (
                <>
                  <p>{lang === 'tr' ? 'Normal doku doz sÄ±nÄ±rlarÄ±, kullanÄ±lan fraksiyonasyon, hedef hacim, eÅŸzamanlÄ± tedavi ve hastaya Ã¶zgÃ¼ klinik koÅŸullarla birlikte deÄŸerlendirilmelidir.' : 'Normal tissue dose-volume constraints are derived from QUANTEC (Quantitative Analyses of Normal Tissue Effects in the Clinic), HyTEC (Stereotactic Body Radiotherapy / SRS), and EMBRACE II brachytherapy consensus metrics. Tolerance limits represent safe clinical thresholds and must be individualized per patient anatomy.'}</p>
                  <ul className="list-disc space-y-2 pl-5">
                    <li><strong>{tText("QUANTEC:")}</strong> {tText(" Konvansiyonel fraksiyonasyonda normal doku doz-hacim etkilerini Ã¶zetleyen, organ ve sonlanÄ±ma Ã¶zgÃ¼ derlemeler.")}</li>
                    <li><strong>{tText("HyTEC:")}</strong> {tText(" Stereotaktik radyocerrahi ve vÃ¼cut RTâ€™si iÃ§in doz-hacim ve toksisite kanÄ±tlarÄ±nÄ± derleyen raporlar.")}</li>
                    <li><strong>{tText("UK SABR Consortium:")}</strong> {tText(" SABR hasta seÃ§imi, planlama ve organ riskindeki doz kÄ±sÄ±tlarÄ± iÃ§in teknik rehberler.")}</li>
                    <li><strong>{tText("EMBRACE II:")}</strong> {tText(" Serviks kanserinde gÃ¶rÃ¼ntÃ¼ kÄ±lavuzlu adaptif brakiterapi hedef ve organ riskindeki doz hedefleri/kÄ±sÄ±tlarÄ±.")}</li>
                  </ul>
                  <p className="rounded-md border border-amber-200 bg-amber-50 p-3 text-amber-900">
                    {lang === 'tr' ? 'Bu merkez tek baÅŸÄ±na hasta planlamasÄ± iÃ§in doz reÃ§etesi deÄŸildir. OAR kÄ±sÄ±tlarÄ±, geÃ§erli protokolÃ¼n gÃ¼ncel birincil kaynaÄŸÄ±ndan ve kurum onaylÄ± planlama yÃ¶nergelerinden kontrol edilmelidir.' : 'This platform is not a standalone treatment prescription. OAR constraints must be checked against the current primary source and institution-approved planning guidelines.'}</p>
                </>
              )}
              {activeReferenceTab === 'disclaimer' && (
                <div className="space-y-3">
                  <h4 className="font-bold text-slate-900 dark:text-slate-100">{lang === 'tr' ? 'Yasal sorumluluk reddi ve telif' : 'Clinical Disclaimer'}</h4>
                  <p>
                    {lang === 'tr' ? 'RadOnc CDSS, kanÄ±ta dayalÄ± radyasyon onkolojisi literatÃ¼rÃ¼nÃ¼ derleyen bir eÄŸitim ve klinik karar destek aracÄ±dÄ±r. Hekimin bireysel tÄ±bbi muhakemesinin ve multidisipliner tÃ¼mÃ¶r konseyi (MDT) kararlarÄ±nÄ±n yerine geÃ§emez. Planlama sÄ±nÄ±rlarÄ± her hasta iÃ§in doÄŸrulanmalÄ±dÄ±r. NCCNÂ®, ASTROÂ®, ESTROÂ®, RTOGÂ® ve QUANTECÂ® ilgili kurumlarÄ±n tescilli markalarÄ± olup resmi sponsorluk baÄŸÄ± bulunmamaktadÄ±r.' : 'RadOnc CDSS is an evidence-based clinical decision-support and educational platform. It does not replace individualized clinical judgment, physician evaluation, or multidisciplinary tumor board (MDT) consensus. Treatment planning and organ-at-risk safety constraints must be validated by the radiation oncologist and medical physicist for each patient.'}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
      <article id="print-report" className="hidden print:block" aria-label={lang === 'tr' ? 'Multidisipliner tÃ¼mÃ¶r konseyi raporu' : 'Multidisciplinary tumor board summary'}>
        <header className="print-report-header">
          <div>
            <div className="font-bold">RadOnc CDSS â€” {lang === 'tr' ? 'Klinik Karar Destek Platformu' : 'Clinical Decision Support Platform'}</div>
            <div className="text-[8pt]">{lang === 'tr' ? 'Multidisipliner Onkoloji Konsey Raporu' : 'Multidisciplinary Oncology Board Summary'}</div>
          </div>
          <div className="text-right text-[8pt]">
            <div>{printMetadata.timestamp || 'â€”'}</div>
            <div>{lang === 'tr' ? 'Rapor No' : 'Report No'}: {printMetadata.reportId || 'â€”'}</div>
          </div>
        </header>

        <section className="print-report-section">
          <h2>1. {lang === 'tr' ? 'Hasta ve Patolojik TanÄ±' : 'Patient and Pathologic Diagnosis'}</h2>
          <table className="print-report-table">
            <tbody>
              <tr>
                <th>{lang === 'tr' ? 'Anatomik BÃ¶lge' : 'Anatomic Site'}</th><td>{reportOrganNames[selectedOrgan]}</td>
                <th>{lang === 'tr' ? 'YaÅŸ' : 'Age'}</th><td>{patientAgeYears || 'â€”'}</td>
              </tr>
              <tr>
                <th>{lang === 'tr' ? 'TanÄ± / Alt Tip' : 'Diagnosis / Subsite'}</th><td>{reportDiagnosis}</td>
                <th>{lang === 'tr' ? 'Histoloji' : 'Histology'}</th><td>{reportHistology}</td>
              </tr>
              <tr>
                <th>{lang === 'tr' ? 'MolekÃ¼ler / Klinik Parametreler' : 'Molecular / Clinical Parameters'}</th><td colSpan={3}>{reportMolecular}</td>
              </tr>
              <tr>
                <th>{lang === 'tr' ? 'Klinik Evre' : 'Clinical Stage'}</th><td colSpan={3}>{selectedT} {selectedN} {selectedM} â€¢ {tText(evaluatedDecision.statusText)}</td>
              </tr>
            </tbody>
          </table>
        </section>

        <section className="print-report-section">
          <h2>2. {lang === 'tr' ? 'Endike Radyoterapi ve Fraksiyonasyon KararÄ±' : 'Radiotherapy and Fractionation Recommendation'}</h2>
          <table className="print-report-table">
            <tbody>
              <tr>
                <th>{lang === 'tr' ? 'ReÃ§ete' : 'Prescription'}</th><td>{tText(activeScheme.name)}</td>
                <th>{lang === 'tr' ? 'Doz / Fraksiyon' : 'Dose / Fractions'}</th><td>{activeScheme.totalDoseGy} Gy / {activeScheme.fractionCount} Ã— {activeScheme.fractionDoseGy} Gy</td>
              </tr>
              <tr>
                <th>{lang === 'tr' ? 'Teknik' : 'Technique'}</th><td>{tText(activeScheme.technique)}</td>
                <th>{lang === 'tr' ? 'Solunum YÃ¶netimi' : 'Motion Management'}</th><td>{selectedOrgan === 'thorax' || selectedOrgan === 'breast' ? tText(breathingMotion) : 'â€”'}</td>
              </tr>
              <tr>
                <th>BED (Î±/Î² = {radiobiology.ab})</th><td>{radiobiology.bed} Gy</td>
                <th>EQD2</th><td>{radiobiology.eqd2} Gy</td>
              </tr>
              <tr>
                <th>{lang === 'tr' ? 'Sistemik Tedavi' : 'Systemic Therapy'}</th><td colSpan={3}>{tText(activeScheme.systemicTherapy || 'â€”')}</td>
              </tr>
            </tbody>
          </table>
        </section>

        <section className="print-report-section print-report-tables">
          <div>
            <h2>3a. {lang === 'tr' ? 'TCP Hedef ReÃ§etesi ve Hacimler (ICRU 83)' : 'TCP Target Prescription and Volumes (ICRU 83)'}</h2>
            <table className="print-report-table">
              <thead><tr><th>{lang === 'tr' ? 'Hacim' : 'Volume'}</th><th>{lang === 'tr' ? 'Doz' : 'Dose'}</th><th>{lang === 'tr' ? 'Marjin' : 'Margin'}</th><th>{lang === 'tr' ? 'Anatomi' : 'Anatomy'}</th></tr></thead>
              <tbody>
                {activeScheme.targetVolumes.map((volume, index) => (
                  <tr key={`${volume.name}-${index}`}><td>{tText(volume.name)}</td><td>{volume.doseGy} Gy</td><td>{volume.marginMm}</td><td>{tText(volume.anatomical)}</td></tr>
                ))}
              </tbody>
            </table>
          </div>
          <div>
            <h2>3b. {lang === 'tr' ? 'OAR NTCP Tolerans TavanlarÄ±' : 'OAR NTCP Tolerance Ceilings'}</h2>
            <table className="print-report-table">
              <thead><tr><th>{lang === 'tr' ? 'Organ' : 'Organ'}</th><th>{lang === 'tr' ? 'Ã–lÃ§Ã¼t' : 'Metric'}</th><th>{lang === 'tr' ? 'SÄ±nÄ±r' : 'Limit'}</th><th>{lang === 'tr' ? 'Kaynak' : 'Source'}</th></tr></thead>
              <tbody>
                  {clinicallyRelevantOars.map((oar, index) => (
                  <tr key={`${oar.organ}-${index}`}><td>{tText(oar.organ)}</td><td>{tText(oar.metric)}{oar.context && <span className="block text-[6pt]">{lang === 'tr' ? oar.context : oar.contextEn || oar.context}</span>}</td><td>{oar.limit}</td><td>{tText(oar.source)}</td></tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="print-report-section print-report-evidence">
          <h2>4. {lang === 'tr' ? 'KanÄ±t DÃ¼zeyi ve Hekim Ä°mzasÄ±' : 'Evidence and Physician Sign-off'}</h2>
          <div><strong>{lang === 'tr' ? 'KanÄ±t / KÄ±lavuz:' : 'Evidence / Guideline:'}</strong> {tText(activeScheme.evidence)}</div>
          <div className="print-report-signature">
            <div className="signature-line" />
            <strong>{lang === 'tr' ? 'Sorumlu Radyasyon OnkoloÄŸu: Dr. Harun PEKMEZCÄ°, MD' : 'Attending Radiation Oncologist: Dr. Harun PEKMEZCÄ°, MD'}</strong>
          </div>
        </section>
        <footer className="print-report-footer">
          {lang === 'tr'
            ? 'Klinik karar destek Ã§Ä±ktÄ±sÄ±dÄ±r; nihai tedavi kararÄ± sorumlu hekim ve multidisipliner konsey deÄŸerlendirmesine tabidir.'
            : 'Clinical decision-support output only; final treatment decisions remain subject to physician judgment and multidisciplinary review.'}
        </footer>
      </article>
    </>
  );
}
