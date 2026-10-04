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
import { NCCN_GUIDELINE_MAP } from '@/data/nccnGuidelineMap';
import { TRANSLATION_MAP } from '@/data/cdssTranslations';

const SUBTYPE_DISPLAY_MAP: Record<string, string> = {
  nsclc: 'NSCLC (KHDAK)',
  sclc: 'SCLC (KHAK)',
  thymoma: 'Timoma',
  mesothelioma: 'Mezotelyoma',
  'cns-mets': 'Beyin Metastazı',
  gbm: 'Glioblastom (GBM)',
  meningioma: 'Menenjiyom',
  Serviks: 'Serviks Uteri',
  Endometriyum: 'Endometriyum',
  Yumusak_Doku: 'Yumuşak Doku Sarkomu',
  Osteosarkom: 'Osteosarkom',
  cns: 'Merkezi Sinir Sistemi',
  gis: 'Gastrointestinal Sistem',
  gynecology: 'Jinekolojik',
  bone: 'Kemik ve Yumuşak Doku',
  pediatrics: 'Pediatrik',
  headneck: 'Baş-Boyun',
};


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
  } else if (/(akciğer|lung|bronş|khdak|nsclc)/i.test(text)) {
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

  result.er = /(er\s*\(\s*\+\s*\)|er\s*pozitif|östrojen\s*pozitif)/i.test(text);
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
  const isHighRisk = /yüksek|high|unfavorable|unfavourable|çok yüksek/.test(normalizedRisk);
  const target = (url: string, label_tr: string, label_en: string): EContourTarget => ({
    url,
    label_tr,
    label_en,
  });

  if (organ === 'prostate' && normalizedSubsite.includes('bladder')) {
    return target(
      'https://econtour.org/?search=bladder',
      'eContour: Mesane Kanseri Trimodalite (Tüm Mesane + Pelvik Nodal)',
      'eContour: Bladder Cancer Trimodality (Whole Bladder + Pelvic Nodal)',
    );
  }

  if (organ === 'prostate' && normalizedSubsite.includes('testis')) {
    return target(
      'https://econtour.org/?search=seminoma',
      'eContour: Testis Seminomu (Paraaortik / Dogleg Nodal Atlası)',
      'eContour: Testicular Seminoma (Para-aortic / Dogleg Nodal Atlas)',
    );
  }

  if (organ === 'prostate' && normalizedSubsite.includes('penile')) {
    return target(
      'https://econtour.org/?search=penile',
      'eContour: Penil Kanser (İnguinal & Pelvik Lenfatik Atlası)',
      'eContour: Penile Cancer (Inguinal & Pelvic Nodal Atlas)',
    );
  }

  if (organ === 'prostate' && normalizedSubsite.includes('kidney')) {
    return target(
      'https://econtour.org/?search=renal+sbrt',
      'eContour: Böbrek RCC SABR / Normal Doku Atlası',
      'eContour: Renal Cell Carcinoma SABR / Normal Tissue Atlas',
    );
  }

  if (organ === 'prostate' && normalizedSubsite.includes('prostate')) {
    if (normalizedSurgery.includes('postop') || normalizedSurgery.includes('prostatektomi')) {
      return target(
        'https://econtour.org/cases/34',
        'eContour: Post-Prostatektomi Yatağı (RTOG / RADICALS Atlası)',
        'eContour: Post-Prostatectomy Bed (RTOG / RADICALS Atlas)',
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
      'eContour: İntakt Prostat SBRT / PACE-B Atlası',
      'eContour: Intact Prostate SBRT / PACE-B Atlas',
    );
  }

  if (organ === 'thorax') {
    if (normalizedSubsite.includes('thymoma') || normalizedSubsite.includes('timoma')) {
      return target(
        'https://econtour.org/?search=thymoma',
        'eContour: Timüs Masaoka-Koga Cerrahi Yatak PORT Atlası',
        'eContour: Thymoma Masaoka-Koga Post-op Bed (PORT) Atlas',
      );
    }
    if (normalizedSubsite.includes('sclc') && !normalizedSubsite.includes('nsclc')) {
      return target(
        'https://econtour.org/cases/9',
        'eContour: KHAK (SCLC) Pre-KT Mediastinal CTV Atlası',
        'eContour: Small Cell Lung Cancer (Pre-Chemo Mediastinal CTV) Atlas',
      );
    }
    if (normalizedSubsite.includes('mesothelioma')) {
      return target(
        'https://econtour.org/?search=mesothelioma',
        'eContour: Mezotelyoma Hemitorasik Plevral Atlası',
        'eContour: Mesothelioma Hemithoracic Pleural Atlas',
      );
    }
    // KHDAK (NSCLC)
    const isEarlyNsclc = m === 'M0' && n === 'N0' && (t.startsWith('T1') || t === 'T2');
    if (!isEarlyNsclc) {
      return target(
        'https://econtour.org/cases/10',
        'eContour: Lokal İleri KHDAK (PACIFIC / Elektif Nodal CTV)',
        'eContour: Locally Advanced NSCLC (Elective Nodal / Primary CTV)',
      );
    }
    if (motionManagement === 'DIBH') {
      return target(
        'https://econtour.org/?search=lung+dibh',
        'eContour: Akciğer SBRT (DIBH Nefes Tutma GTV→PTV Atlası)',
        'eContour: Lung SBRT (DIBH Breath-Hold GTV→PTV Atlas)',
      );
    }
    return target(
      'https://econtour.org/cases/11',
      'eContour: Akciğer SBRT (4D-CT / ITV Hareket Zarfı Atlası)',
      'eContour: Lung SBRT (4D-CT / ITV Motion Envelope Atlas)',
    );
  }

  if (organ === 'breast') {
    if (normalizedSurgery.includes('mastektomi') || normalizedSurgery.includes('mastectomy')) {
      return target(
        'https://econtour.org/cases/74',
        'eContour: PMRT Göğüs Duvarı & İnternal Mammar Nodal Atlası',
        'eContour: Post-Mastectomy Chest Wall & Internal Mammary Nodal Atlas',
      );
    }
    if (n === 'N2' || n === 'N3') {
      return target(
        'https://econtour.org/cases/74',
        'eContour: Göğüs Duvarı + Aksilla & Supraklavikular (RNI)',
        'eContour: Chest Wall + Regional Nodal Irradiation (RNI)',
      );
    }
    return target(
      'https://econtour.org/hypofrac',
      'eContour: Tüm Meme Tanjantları & Tümör Yatağı Boost Atlası',
      'eContour: Whole Breast Tangents & Tumor Bed Boost Atlas',
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
    if (normalizedSubsite.includes('safra') || normalizedSubsite.includes('biliary') || normalizedSubsite.includes('cholangi')) {
      return target(
        'https://econtour.org/?search=biliary+tract',
        'eContour: Safra Yolları & Postoperatif Safra Kesesi Yatağı',
        'eContour: Biliary Tract & Post-op Gallbladder Bed',
      );
    }
    if (normalizedSubsite.includes('karaciger') || normalizedSubsite.includes('karaciğer') || normalizedSubsite.includes('liver')) {
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
    if (normalizedSubsite.includes('ozofagus') || normalizedSubsite.includes('özofagus') || normalizedSubsite.includes('esophag')) {
      return target(
        'https://econtour.org/?search=esophagus',
        'eContour: Özofagus Karsinomu (CROSS Protokol GTV/CTV Atlası)',
        'eContour: Esophageal Carcinoma (CROSS Protocol GTV/CTV Atlas)',
      );
    }
    if (normalizedSubsite.includes('anal') || normalizedSubsite.includes('anus')) {
      return target(
        'https://econtour.org/?search=anal',
        'eContour: Anal Kanal Skuamöz (İnguinal / Pelvik Nodal Atlası)',
        'eContour: Anal Squamous Cell Carcinoma (Inguinal / Pelvic Nodal Atlas)',
      );
    }
    if (normalizedSubsite.includes('pankreas') || normalizedSubsite.includes('pancrea')) {
      return target(
        'https://econtour.org/?search=pancreas',
        'eContour: Pankreas Adenokarsinomu / SBRT Atlası',
        'eContour: Pancreatic Adenocarcinoma / SBRT Atlas',
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
      'https://econtour.org/?search=head+neck+nodal',
      'eContour: Baş-Boyun Nodal Düzeyler & Primer SIB Hedef Atlası (DAHANCA / RTOG)',
      'eContour: Head & Neck Nodal Levels & Primary SIB Target Atlas (DAHANCA / RTOG)',
    );
  }

  if (organ === 'cns') {
    if (normalizedSubsite.includes('meningioma') || normalizedSubsite.includes('menenj')) {
      return target(
        'https://econtour.org/cases/12',
        'eContour: Menenjiom (Dural Kuyruk & Kemik İnvazyonu Atlası)',
        'eContour: Intracranial Meningioma (Dural Tail & Bone Invasion Atlas)',
      );
    }
    if (normalizedSubsite.includes('glioma') || normalizedSubsite.includes('gbm') || normalizedSubsite.includes('glioblastom')) {
      return target(
        'https://econtour.org/cases/1',
        'eContour: Glial Tümör (ESTRO/EORTC & RTOG T2/FLAIR CTV Atlası)',
        'eContour: Glioma / GBM (ESTRO/EORTC & RTOG T2/FLAIR CTV Atlas)',
      );
    }
    // Beyin metastazları
    const isOligoMets = t.startsWith('T1') || t === 'T2';
    if (isOligoMets) {
      return target(
        'https://econtour.org/cases/2',
        'eContour: Beyin Metastazları SRS / Radyocerrahi Atlası',
        'eContour: Brain Metastases SRS / Radiosurgery Atlas',
      );
    }
    return target(
      'https://econtour.org/?search=ha-wbrt',
      'eContour: HA-WBRT (Hipokampus Koruyucu Tüm Beyin RT Atlası)',
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

  if (organ === 'bone' || organ === 'bone-sarcoma') {
    if (normalizedSubsite.includes('kordoma') || normalizedSubsite.includes('chordoma') || histology === 'Kordoma') {
      return target(
        'https://econtour.org/?search=spine+sbrt',
        'eContour: Kordoma / Omurga SBRT (International Spine Consortium Atlası)',
        'eContour: Chordoma / Spine SBRT (International Spine Consortium Atlas)',
      );
    }
    if (normalizedSubsite.includes('ewing') || normalizedSubsite.includes('osteosarkom') || histology === 'Osteosarkom' || histology === 'Ewing') {
      return target(
        'https://econtour.org/cases/',
        'eContour: Kemik Sarkomları (Pre-KT Kemik Tutulum Hacmi)',
        'eContour: Bone Sarcoma (Pre-chemo Bone Extent CTV)',
      );
    }
    if (normalizedSubsite.includes('yumusak') || normalizedSubsite.includes('soft') || histology === 'ups' || histology === 'liposarcoma' || histology === 'leiomyosarcoma' || histology === 'synovial') {
      return target(
        'https://econtour.org/?search=soft+tissue+sarcoma',
        'eContour: Ekstremite Yumuşak Doku Sarkomu (Preop 50 Gy Fasyal Marjinler)',
        'eContour: Extremity Soft Tissue Sarcoma (Preoperative 50 Gy Fascial Margins)',
      );
    }
    return target(
      'https://econtour.org/cases/',
      'eContour: Kemik & Yumuşak Doku Sarkomu Konturlama Atlası',
      'eContour: Bone & Soft Tissue Sarcoma Contouring Atlas',
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
    if (histology === 'Plasmacytoma' || histology === 'Myeloma') {
      return target(
        'https://econtour.org/?search=myeloma',
        'eContour: Multipl Miyelom / Plazmositom Lokal RT Atlası',
        'eContour: Multiple Myeloma / Plasmacytoma Local RT Atlas',
      );
    }
    return target(
      'https://econtour.org/?search=lymphoma+isrt',
      'eContour: Lenfoma Tutulu Alan RT (ILROG ISRT/INRT Atlası)',
      'eContour: Lymphoma Involved Site RT (ILROG ISRT/INRT Atlas)',
    );
  }

  if (organ === 'pediatric') {
    if (histology === 'Medulloblastom' || normalizedSubsite.includes('medulloblastoma')) {
      return target(
        'https://econtour.org/?search=craniospinal',
        'eContour: Pediatrik Kraniyospinal Işınlama (CSI) & Posterior Fossa Boost',
        'eContour: Pediatric Craniospinal Irradiation (CSI) & Posterior Fossa Boost',
      );
    }
    return target(
      'https://econtour.org/cases/',
      'eContour: Pediatrik Tümör Konturlama Atlası',
      'eContour: Pediatric Tumor Contouring Atlas',
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

const ORGAN_TREE: Record<OrganId, Array<{ id: string; name_tr: string; name_en: string }>> = {
  emergencies: [
    { id: 'emergency-mscc', name_tr: 'Spinal Kord Basısı (MSCC)', name_en: 'Spinal Cord Compression (MSCC)' },
    { id: 'emergency-svcs', name_tr: 'Vena Kava Superior Sendromu (VCSS / SVCS)', name_en: 'Superior Vena Cava Syndrome (SVCS)' },
    { id: 'emergency-airway', name_tr: 'Akut Havayolu Obstrüksiyonu (Trakea & Karina)', name_en: 'Acute Airway Obstruction (Trachea & Carina)' },
    { id: 'emergency-hemorrhage', name_tr: 'Masif Hemoraji / Hemostatik RT', name_en: 'Major Hemorrhage / Hemostatic RT' },
    { id: 'emergency-icp', name_tr: 'Akut KİBAS & Beyin Herniasyonu', name_en: 'Acute Raised ICP & Brain Herniation' },
  ],
  thorax: [
    { id: 'thorax-nsclc', name_tr: 'KHDAK (NSCLC)', name_en: 'NSCLC' },
    { id: 'thorax-sclc', name_tr: 'KHAK (SCLC)', name_en: 'SCLC' },
    { id: 'thorax-thymoma', name_tr: 'Timüs', name_en: 'Thymus' },
    { id: 'thorax-mesothelioma', name_tr: 'Mezotelyoma', name_en: 'Mesothelioma' },
  ],
  prostate: [
    { id: 'prostate-prostate', name_tr: 'Prostat Kanseri', name_en: 'Prostate Cancer' },
    { id: 'prostate-bladder', name_tr: 'Mesane Kanseri', name_en: 'Bladder Cancer' },
    { id: 'prostate-penile', name_tr: 'Penil Kanser', name_en: 'Penile Cancer' },
    { id: 'prostate-testis', name_tr: 'Testis Kanseri', name_en: 'Testicular Cancer' },
    { id: 'prostate-kidney', name_tr: 'Böbrek Kanseri (RCC)', name_en: 'Renal Cell Carcinoma (RCC)' },
  ],
  breast: [
    { id: 'breast-idc', name_tr: 'İnvaziv Duktal Karsinom (İDK)', name_en: 'Invasive Ductal (IDC)' },
    { id: 'breast-ilc', name_tr: 'İnvaziv Lobüler Karsinom (İLK)', name_en: 'Invasive Lobular (ILC)' },
    { id: 'breast-dcis', name_tr: 'Duktal Karsinoma İn Situ (DCIS)', name_en: 'Ductal Carcinoma In Situ' },
    { id: 'breast-inflammatory', name_tr: 'İnflamatuar Meme Kanseri', name_en: 'Inflammatory Breast Ca' },
    { id: 'breast-phyllodes', name_tr: 'Malign Filloides Tümörü', name_en: 'Malignant Phyllodes' },
    { id: 'breast-metaplastic', name_tr: 'Metaplastik Karsinom', name_en: 'Metaplastic Carcinoma' },
  ],
  gis: [
    { id: 'gis-Rektum', name_tr: 'Rektum Kanseri', name_en: 'Rectal Cancer' },
    { id: 'gis-Mide', name_tr: 'Mide Kanseri', name_en: 'Gastric Cancer' },
    { id: 'gis-anus', name_tr: 'Anal Kanal Kanseri (Nigro)', name_en: 'Anal Canal Cancer' },
    { id: 'gis-Karaciger', name_tr: 'Karaciğer (HCC/Met)', name_en: 'Liver (HCC/Met)' },
    { id: 'gis-SafraYollari', name_tr: 'Safra Yolları', name_en: 'Biliary Tract' },
    { id: 'gis-Pankreas', name_tr: 'Pankreas Kanseri', name_en: 'Pancreatic Cancer' },
    { id: 'gis-Ozofagus', name_tr: 'Özofagus Kanseri', name_en: 'Esophageal Cancer' },
  ],
  'head-neck': [
    { id: 'head-neck-nasopharynx', name_tr: 'Nazofarenks (NPC)', name_en: 'Nasopharynx (NPC)' },
    { id: 'head-neck-oropharynx', name_tr: 'Orofarenks (OPC)', name_en: 'Oropharynx (OPC)' },
    { id: 'head-neck-larynx', name_tr: 'Larenks Kanseri', name_en: 'Larynx Cancer' },
    { id: 'head-neck-maxillary-sinus', name_tr: 'Maksiller Sinüs', name_en: 'Maxillary Sinus' },
    { id: 'head-neck-oral-cavity', name_tr: 'Oral Kavite', name_en: 'Oral Cavity' },
    { id: 'head-neck-salivary', name_tr: 'Tükürük Bezi Kanserleri', name_en: 'Salivary Gland Cancer' },
  ],
  cns: [
    { id: 'cns-glioma', name_tr: 'Glial Tümörler (WHO Grade 1-4)', name_en: 'Gliomas (WHO Grade 1-4)' },
    { id: 'cns-mets', name_tr: 'Beyin Metastazları', name_en: 'Brain Metastases' },
    { id: 'cns-meningioma', name_tr: 'Menenjiom', name_en: 'Meningioma' },
  ],
  gynecology: [
    { id: 'gynecology-Serviks', name_tr: 'Serviks Kanseri', name_en: 'Cervical Cancer' },
    { id: 'gynecology-Endometriyum', name_tr: 'Endometriyum Kanseri', name_en: 'Endometrial Cancer' },
    { id: 'gynecology-Vulva', name_tr: 'Vulva Kanseri', name_en: 'Vulvar Cancer' },
    { id: 'gynecology-Vajen', name_tr: 'Vajen Kanseri', name_en: 'Vaginal Cancer' },
    { id: 'gynecology-ovary', name_tr: 'Over & Fallop Tüpü Kanseri', name_en: 'Ovarian Cancer' },
  ],
  'bone-sarcoma': [
    { id: 'bone-sarcoma-Yumusak_Doku', name_tr: 'Yumuşak Doku Sarkomu', name_en: 'Soft Tissue Sarcoma' },
    { id: 'bone-sarcoma-Osteosarkom', name_tr: 'Osteosarkom', name_en: 'Osteosarcoma' },
    { id: 'bone-sarcoma-Ewing', name_tr: 'Ewing Sarkomu', name_en: 'Ewing Sarcoma' },
  ],
  bone: [
    { id: 'bone-osteosarcoma', name_tr: 'Osteosarkom', name_en: 'Osteosarcoma' },
    { id: 'bone-ewing', name_tr: 'Ewing Sarkomu', name_en: 'Ewing Sarcoma' },
    { id: 'bone-chondrosarcoma', name_tr: 'Kondrosarkom', name_en: 'Chondrosarcoma' },
    { id: 'bone-chordoma', name_tr: 'Kordoma (Sakral / Kafa Tabanı)', name_en: 'Chordoma' },
    { id: 'bone-gctb', name_tr: 'Dev Hücreli Kemik Tümörü (GCTB)', name_en: 'Giant Cell Tumor of Bone' },
  ],
  sarcoma: [
    { id: 'sarcoma-extremity', name_tr: 'Ekstremite / Gövde Yumuşak Doku', name_en: 'Extremity / Trunk Soft Tissue Sarcoma' },
    { id: 'sarcoma-retroperitoneal', name_tr: 'Retroperitoneal Sarkom', name_en: 'Retroperitoneal Sarcoma' },
    { id: 'sarcoma-rhabdomyosarcoma', name_tr: 'Rhabdomyosarkom', name_en: 'Rhabdomyosarcoma' },
    { id: 'sarcoma-liposarcoma', name_tr: 'Liposarkom / Leyomiyosarkom', name_en: 'Liposarcoma / LMS' },
    { id: 'sarcoma-dfsp', name_tr: 'Dermatofibrosarkoma Protuberans (DFSP)', name_en: 'Dermatofibrosarcoma Protuberans (DFSP)' },
  ],
  skin: [
    { id: 'skin-scc', name_tr: 'Skuamöz Hücreli Karsinom (cSCC)', name_en: 'Cutaneous SCC' },
    { id: 'skin-bcc', name_tr: 'Bazal Hücreli Karsinom (BCC)', name_en: 'Basal Cell Ca' },
    { id: 'skin-melanom', name_tr: 'Kutanöz Melanom', name_en: 'Cutaneous Melanoma' },
    { id: 'skin-merkel', name_tr: 'Merkel Hücreli Karsinom (MCC)', name_en: 'Merkel Cell Carcinoma' },
    { id: 'skin-mycosis', name_tr: 'Mikozis Fungoides', name_en: 'Mycosis Fungoides / CTCL' },
    { id: 'skin-kaposi', name_tr: 'Kaposi Sarkomu', name_en: 'Kaposi Sarcoma' },
  ],
  hematologic: [
    { id: 'hematologic-hodgkin', name_tr: 'Hodgkin Lenfoma (ISRT)', name_en: 'Hodgkin Lymphoma' },
    { id: 'hematologic-non-hodgkin', name_tr: 'Non-Hodgkin Lenfoma', name_en: 'Non-Hodgkin Lymphoma' },
    { id: 'hematologic-myeloma', name_tr: 'Multipl Miyelom / Plazmositom', name_en: 'Multiple Myeloma / Plasmacytoma' },
    { id: 'hematologic-all', name_tr: 'Akut Lenfoblastik Lösemi', name_en: 'ALL (Cranial/TBI)' },
    { id: 'hematologic-cll', name_tr: 'KLL (Palyatif Dalak / Nodal)', name_en: 'CLL (Splenic/Nodal RT)' },
  ],
  pediatric: [
    { id: 'pediatric-medulloblastoma', name_tr: 'Medulloblastom (CSI)', name_en: 'Medulloblastoma' },
    { id: 'pediatric-wilms', name_tr: 'Wilms Tümörü', name_en: 'Wilms Tumor' },
    { id: 'pediatric-neuroblastoma', name_tr: 'Nöroblastom', name_en: 'Neuroblastoma' },
    { id: 'pediatric-ewing', name_tr: 'Pediatrik Ewing Sarkomu', name_en: 'Pediatric Ewing Sarcoma' },
    { id: 'pediatric-rhabdo', name_tr: 'Pediatrik Rhabdomyosarkom', name_en: 'Pediatric Rhabdomyosarcoma' },
  ],
  palliative: [
    { id: 'palliative-bone', name_tr: 'Kemik Metastazı Palyasyonu', name_en: 'Bone Metastases' },
    { id: 'palliative-brain', name_tr: 'Beyin Metastazları (Elektif WBRT / SRS)', name_en: 'Brain Metastases (Elective WBRT / SRS)' },
    { id: 'palliative-soft-tissue', name_tr: 'Organ & Yumuşak Doku Metastazı Palyasyonu', name_en: 'Organ & Soft-Tissue Metastasis Palliation' },
  ],
  benign: [
    { id: 'benign-ho', name_tr: 'Heterotopik Ossifikasyon', name_en: 'Heterotopic Ossification' },
    { id: 'benign-keloid', name_tr: 'Keloid Profilaksisi', name_en: 'Keloid Prophylaxis' },
    { id: 'benign-dupuytren', name_tr: 'Dupuytren Kontraktürü', name_en: 'Dupuytren Contracture' },
    { id: 'benign-topuk-dikeni', name_tr: 'Topuk Dikeni (Plantar Fasiit)', name_en: 'Plantar Fasciitis' },
    { id: 'benign-pituitary', name_tr: 'Hipofiz Adenomu', name_en: 'Pituitary Adenoma' },
    { id: 'benign-gynecomastia', name_tr: 'Jinekomasti Profilaksisi', name_en: 'Gynecomastia Prophylaxis' },
  ],
};

type QuickCaseCategoryId = 'thorax' | 'breast' | 'cns' | 'gus' | 'renal' | 'gis' | 'gynecology' | 'sarcoma-palliative' | 'emergencies';
type QuickCaseRegimen = 'clinical' | 'ultra_hypo' | 'moderate_hypo' | 'sib_boost' | 'conventional';
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
  { id: 'case-01', category: 'thorax', title_tr: 'Periferik erken evre KHDAK', title_en: 'Peripheral early-stage NSCLC', detail_tr: 'T1b N0 M0 • DIBH • SBRT 54 Gy / 3 fx', detail_en: 'T1b N0 M0 • DIBH • SBRT 54 Gy / 3 fx', organ: 'thorax', subsite: 'thorax-nsclc', t: 'T1b', n: 'N0', m: 'M0', histologyId: 'nsclc-adenocarcinoma', regimen: 'ultra_hypo' },
  { id: 'case-02', category: 'thorax', title_tr: 'Lokal ileri KHDAK', title_en: 'Locally advanced NSCLC', detail_tr: 'Evre IIIA cT2 N2 M0 • Eşzamanlı KRT 60 Gy + PACIFIC', detail_en: 'Stage IIIA cT2 N2 M0 • Concurrent CRT 60 Gy + PACIFIC', organ: 'thorax', subsite: 'thorax-nsclc', t: 'T2a', n: 'N2', m: 'M0', histologyId: 'nsclc-adenocarcinoma', regimen: 'clinical' },
  { id: 'case-03', category: 'thorax', title_tr: 'Sınırlı evre KHAK', title_en: 'Limited-stage SCLC', detail_tr: 'T2 N1 M0 • Turrisi akselere hiperfraksiyonasyon 1.5 Gy BID / 30 fx (≥ 6 saat ara)', detail_en: 'T2 N1 M0 • Turrisi accelerated hyperfractionation 1.5 Gy BID / 30 fx (≥ 6 hours apart)', organ: 'thorax', subsite: 'thorax-sclc', t: 'T2', n: 'N1', m: 'M0', regimen: 'clinical' },
  { id: 'case-04', category: 'thorax', title_tr: 'Timoma, Masaoka evre II', title_en: 'Thymoma, Masaoka stage II', detail_tr: 'R0 rezeksiyon • Adjuvan PORT 50 Gy', detail_en: 'R0 resection • Adjuvant PORT 50 Gy', organ: 'thorax', subsite: 'thorax-thymoma', t: 'Masaoka-II', n: 'N0', m: 'M0', histologyId: 'thymoma', regimen: 'clinical' },
  { id: 'case-05', category: 'breast', title_tr: 'Erken evre standart meme', title_en: 'Early-stage breast cancer', detail_tr: 'pT1c pN0 M0 • Postmenopoz • FAST-Forward 26 Gy / 5 fx', detail_en: 'pT1c pN0 M0 • Postmenopausal • FAST-Forward 26 Gy / 5 fx', organ: 'breast', subsite: 'breast-breast', t: 'T1c', n: 'N0', m: 'M0', histologyId: 'breast-nst', regimen: 'ultra_hypo' },
  { id: 'case-06', category: 'breast', title_tr: 'Yüksek riskli lokal ileri PMRT', title_en: 'High-risk locally advanced PMRT', detail_tr: 'pT3 pN2a M0 • Mastektomi • Göğüs duvarı + RNI 50 Gy / 25 fx', detail_en: 'pT3 pN2a M0 • Mastectomy • Chest wall + RNI 50 Gy / 25 fx', organ: 'breast', subsite: 'breast-breast', t: 'T3', n: 'N2', m: 'M0', histologyId: 'breast-nst', regimen: 'conventional' },
  { id: 'case-07', category: 'breast', title_tr: 'Genç hasta, MKC + SIB boost', title_en: 'Young patient, BCS + SIB boost', detail_tr: 'pT2 pN0 M0 • 38 yaş • WBRT 40.05 Gy + kavite SIB 48 Gy / 15 fx', detail_en: 'pT2 pN0 M0 • Age 38 • WBRT 40.05 Gy + cavity SIB 48 Gy / 15 fx', organ: 'breast', subsite: 'breast-breast', t: 'T2', n: 'N0', m: 'M0', histologyId: 'breast-nst', regimen: 'sib_boost' },
  { id: 'case-08', category: 'cns', title_tr: 'Glioblastoma multiforme', title_en: 'Glioblastoma multiforme', detail_tr: 'WHO Grade 4, IDH-wt • KPS 90 • Stupp 60 Gy / 30 fx + TMZ', detail_en: 'WHO Grade 4, IDH-wt • KPS 90 • Stupp 60 Gy / 30 fx + TMZ', organ: 'cns', subsite: 'cns-glioma', t: 'Grade-4', n: 'N0', m: 'M0', histologyId: 'glioma-gbm', regimen: 'clinical' },
  { id: 'case-09', category: 'cns', title_tr: 'Yüksek riskli düşük dereceli gliom', title_en: 'High-risk low-grade glioma', detail_tr: 'WHO Grade 2 • 45 yaş • STR • RTOG 9802: 54 Gy + PCV', detail_en: 'WHO Grade 2 • Age 45 • STR • RTOG 9802: 54 Gy + PCV', organ: 'cns', subsite: 'cns-glioma', t: 'Grade-2', n: 'N0', m: 'M0', histologyId: 'glioma-astro', regimen: 'clinical' },
  { id: 'case-10', category: 'cns', title_tr: 'Oligometastatik beyin metastazı', title_en: 'Oligometastatic brain metastases', detail_tr: '2 asemptomatik metastaz • Stereotaktik radyocerrahi 24 Gy', detail_en: '2 asymptomatic metastases • Stereotactic radiosurgery 24 Gy', organ: 'cns', subsite: 'cns-mets', t: 'Oligo', n: 'N0', m: 'M1', regimen: 'clinical' },
  { id: 'case-11', category: 'gus', title_tr: 'Orta-favorable risk prostat', title_en: 'Favorable intermediate-risk prostate cancer', detail_tr: 'cT2a • Gleason 3+4 • PSA 8.5 • CHHiP 60 Gy / 20 fx', detail_en: 'cT2a • Gleason 3+4 • PSA 8.5 • CHHiP 60 Gy / 20 fx', organ: 'prostate', subsite: 'prostate-prostate', t: 'T2a', n: 'N0', m: 'M0', histologyId: 'prostate-acinar', regimen: 'moderate_hypo' },
  { id: 'case-12', category: 'gus', title_tr: 'Yüksek risk prostat', title_en: 'High-risk prostate cancer', detail_tr: 'cT3a ECE+ • Gleason 4+4 • PSA 24 • Pelvik nodal + prostat 78 Gy + 24 ay ADT', detail_en: 'cT3a ECE+ • Gleason 4+4 • PSA 24 • Pelvic nodes + prostate 78 Gy + 24 months ADT', organ: 'prostate', subsite: 'prostate-prostate', t: 'T3a', n: 'N1', m: 'M0', histologyId: 'prostate-acinar', regimen: 'conventional' },
  { id: 'case-13', category: 'gus', title_tr: 'Kas invaziv mesane kanseri', title_en: 'Muscle-invasive bladder cancer', detail_tr: 'cT2 N0 M0 • Maksimal TURBT • Trimodalite KRT 64 Gy', detail_en: 'cT2 N0 M0 • Maximal TURBT • Trimodality chemoradiotherapy 64 Gy', organ: 'prostate', subsite: 'prostate-bladder', t: 'T2', n: 'N0', m: 'M0', histologyId: 'bladder-urothelial', regimen: 'clinical' },
  { id: 'case-14', category: 'gus', title_tr: 'Evre I testis seminom', title_en: 'Stage I testicular seminoma', detail_tr: 'Orşiyektomi sonrası pT1 • Paraaortik elektif RT 20 Gy / 10 fx', detail_en: 'Post-orchiectomy pT1 • Elective para-aortic RT 20 Gy / 10 fx', organ: 'prostate', subsite: 'prostate-testis', t: 'I', n: 'N0', m: 'M0', histologyId: 'testis-seminoma', regimen: 'clinical' },
  { id: 'case-15', category: 'gis', title_tr: 'Lokal ileri rektum kanseri', title_en: 'Locally advanced rectal cancer', detail_tr: 'cT3c N1b M0 • RAPIDO kısa dönem 5 × 5 Gy + konsolidasyon KT / TNT', detail_en: 'cT3c N1b M0 • RAPIDO short-course 5 × 5 Gy + consolidation chemotherapy / TNT', organ: 'gis', subsite: 'gis-Rektum', t: 'T3', n: 'N1', m: 'M0', regimen: 'clinical' },
  { id: 'case-16', category: 'gis', title_tr: 'Lokal ileri özofagus kanseri', title_en: 'Locally advanced esophageal cancer', detail_tr: 'cT3 N1 M0 • CROSS neoadjuvan KRT 41.4 Gy + cerrahi', detail_en: 'cT3 N1 M0 • CROSS neoadjuvant CRT 41.4 Gy + surgery', organ: 'gis', subsite: 'gis-Ozofagus', t: 'T3', n: 'N1', m: 'M0', regimen: 'clinical' },
  { id: 'case-17', category: 'gis', title_tr: 'Anal kanal karsinomu', title_en: 'Anal canal carcinoma', detail_tr: 'cT2 N1 M0 • Nigro: Mitomisin-C + 5-FU + 50.4 Gy IMRT', detail_en: 'cT2 N1 M0 • Nigro: Mitomycin-C + 5-FU + 50.4 Gy IMRT', organ: 'gis', subsite: 'gis-anus', t: 'T2', n: 'N1', m: 'M0', regimen: 'clinical' },
  { id: 'case-18', category: 'gynecology', title_tr: 'Lokal ileri serviks kanseri', title_en: 'Locally advanced cervical cancer', detail_tr: 'FIGO IIIC1 (pelvik LN+) • EMBRACE II 45 Gy KRT + 3D IGABT', detail_en: 'FIGO IIIC1 (pelvic LN+) • EMBRACE II 45 Gy CRT + 3D IGABT', organ: 'gynecology', subsite: 'gynecology-Serviks', t: 'IIIA-IIIB', n: 'N1', m: 'M0', regimen: 'clinical' },
  { id: 'case-19', category: 'gynecology', title_tr: 'Yüksek-orta risk endometriyum', title_en: 'High-intermediate-risk endometrial cancer', detail_tr: 'PORTEC-2 ölçütleri • 68 yaş • Vajinal kaf brakiterapisi', detail_en: 'PORTEC-2 criteria • Age 68 • Vaginal cuff brachytherapy', organ: 'gynecology', subsite: 'gynecology-Endometriyum', t: 'IB', n: 'N0', m: 'M0', regimen: 'clinical' },
  { id: 'case-20', category: 'sarcoma-palliative', title_tr: 'Ekstremite yumuşak doku sarkomu', title_en: 'Extremity soft-tissue sarcoma', detail_tr: 'Yüksek dereceli • Rezektabl • Preoperatif RT 50 Gy / 25 fx', detail_en: 'High grade • Resectable • Preoperative RT 50 Gy / 25 fx', organ: 'sarcoma', subsite: 'sarcoma-extremity', t: 'T2', n: 'N0', m: 'M0', regimen: 'clinical' },
  { id: 'case-21', category: 'sarcoma-palliative', title_tr: 'Ağrılı kemik metastazı', title_en: 'Painful bone metastasis', detail_tr: 'ASTRO • Tek fraksiyon 8 Gy analjezik RT', detail_en: 'ASTRO • Single-fraction 8 Gy palliative RT', organ: 'palliative', subsite: 'palliative-bone', t: 'Kemik', n: 'TekFx', m: 'M1', regimen: 'clinical' },
  { id: 'case-22', category: 'emergencies', title_tr: 'Spinal kord basısı (MSCC)', title_en: 'Spinal cord compression (MSCC)', detail_tr: 'Deksametazon • Patchell cerrahi uygunluğu • Acil RT 20 Gy / 5 fx', detail_en: 'Dexamethasone • Patchell surgical criteria • Emergency RT 20 Gy / 5 fx', organ: 'emergencies', subsite: 'emergency-mscc', t: 'Acil', n: 'N/A', m: 'M1', regimen: 'clinical' },
  { id: 'case-23', category: 'renal', title_tr: 'Küçük primer RCC (≤4 cm, T1a) - FASTRACK II', title_en: 'Small Primary RCC (≤4 cm, T1a) - FASTRACK II', detail_tr: 'Medikal inoperabl • 26 Gy / 1 fx • Ablatif primer SABR', detail_en: 'Medically inoperable • 26 Gy / 1 fx • Ablative primary SABR', organ: 'prostate', subsite: 'prostate-kidney', t: 'T1a', n: 'N0', m: 'M0', histologyId: 'renal-clear-cell', regimen: 'ultra_hypo' },
  { id: 'case-24', category: 'renal', title_tr: 'Büyük primer RCC (>4–10 cm, T1b–T2) - FASTRACK II', title_en: 'Larger Primary RCC (>4–10 cm, T1b–T2) - FASTRACK II', detail_tr: 'Örnek çap 8 cm • cT2 N0 M0 • 42 Gy / 3 fx', detail_en: 'Example 8 cm diameter • cT2 N0 M0 • 42 Gy / 3 fx', organ: 'prostate', subsite: 'prostate-kidney', t: 'T2', n: 'N0', m: 'M0', histologyId: 'renal-clear-cell', regimen: 'ultra_hypo' },
  { id: 'case-25', category: 'renal', title_tr: 'Oligometastatik / Rekürren RCC', title_en: 'Oligometastatic / Recurrent RCC', detail_tr: 'Seçilmiş olguda SBRT 30–40 Gy / 5 fx (örnek 35 Gy / 5 fx)', detail_en: 'SBRT 30–40 Gy / 5 fx in selected cases (example: 35 Gy / 5 fx)', organ: 'prostate', subsite: 'prostate-kidney', t: 'T1a', n: 'N0', m: 'M1', histologyId: 'renal-clear-cell', regimen: 'ultra_hypo' },
  { id: 'case-26', category: 'gus', title_tr: 'Prostat ultra-hipofraksiyonasyon (SBRT)', title_en: 'Ultra-hypofractionated prostate SBRT', detail_tr: 'Elverişli orta risk • 36.25 Gy / 5 fx', detail_en: 'Favorable intermediate risk • 36.25 Gy / 5 fx', organ: 'prostate', subsite: 'prostate-prostate', t: 'T2a', n: 'N0', m: 'M0', histologyId: 'prostate-acinar', regimen: 'ultra_hypo' },
  { id: 'case-27', category: 'gus', title_tr: 'Yüksek riskli prostat SIB', title_en: 'High-risk prostate SIB', detail_tr: '70 Gy prostata / 56 Gy pelvik nodlara • 28 fx', detail_en: '70 Gy to prostate / 56 Gy to pelvic nodes • 28 fx', organ: 'prostate', subsite: 'prostate-prostate', t: 'T3a', n: 'N1', m: 'M0', histologyId: 'prostate-acinar', regimen: 'sib_boost' },
];

type GuidedStep = 1 | 2 | 3 | 4;

const GUIDED_QUICK_SCENARIOS: Partial<Record<string, { title_tr: string; title_en: string }>> = {
  'case-05': {
    title_tr: 'Erken Evre MKC Sonrası (FAST-Forward 26 Gy/5 fx)',
    title_en: 'Early-stage Post-BCS (FAST-Forward 26 Gy/5fx)',
  },
  'case-06': {
    title_tr: 'Yüksek Riskli Mastektomi Sonrası (PMRT)',
    title_en: 'High-risk Postmastectomy (PMRT)',
  },
  'case-01': {
    title_tr: 'Erken Periferik KHDAK (SBRT 54 Gy/3 fx)',
    title_en: 'Early Peripheral NSCLC (SBRT 54 Gy/3fx)',
  },
  'case-02': {
    title_tr: 'Lokal İleri Evre III (Eşzamanlı KRT)',
    title_en: 'Locally Advanced Stage III (Concurrent CRT)',
  },
  'case-11': {
    title_tr: 'Elverişli Orta Risk (60 Gy/20 fx Orta HipoFraksiyonasyon)',
    title_en: 'Favorable Intermediate (Moderate Hypofractionation 60 Gy/20fx)',
  },
  'case-12': {
    title_tr: 'Yüksek Risk (78 Gy + Uzun Süreli ADT)',
    title_en: 'High-Risk (78 Gy + Long-term ADT)',
  },
  'case-23': {
    title_tr: 'Küçük Primer RCC (≤4 cm, T1a) - FASTRACK II',
    title_en: 'Small Primary RCC (≤4 cm, T1a) - FASTRACK II',
  },
  'case-24': {
    title_tr: 'Büyük Primer RCC (>4–10 cm, T1b–T2) - FASTRACK II',
    title_en: 'Larger Primary RCC (>4–10 cm, T1b–T2) - FASTRACK II',
  },
  'case-25': {
    title_tr: 'Oligometastatik / Rekürren RCC',
    title_en: 'Oligometastatic / Recurrent RCC',
  },
  'case-26': {
    title_tr: 'Ultra-hipofraksiyone Prostat SBRT (36.25 Gy/5 fx)',
    title_en: 'Ultra-hypofractionated Prostate SBRT (36.25 Gy/5fx)',
  },
  'case-27': {
    title_tr: 'Yüksek Riskli Prostat SIB (70/56 Gy/28 fx)',
    title_en: 'High-Risk Prostate SIB (70/56 Gy/28fx)',
  },
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
  'benign-gynecomastia': [
    { value: 'prophylaxis', label: 'Antiandrojen tedavisi öncesi profilaksi' },
    { value: 'symptomatic', label: 'Ağrılı / yerleşik jinekomasti' },
  ],
  'benign-pituitary': [
    { value: 'functional', label: 'Fonksiyonel adenom' },
    { value: 'nonfunctional', label: 'Non-fonksiyonel adenom' },
    { value: 'chiasm-close', label: 'Optik kiazmaya komşu (<2 mm)' },
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

export interface EvidenceLink {
  authority: 'NCCN' | 'ASTRO' | 'ESTRO' | 'RTOG' | 'NRG';
  title: string;
  url: string;
  category?: string; // e.g., "Kategori 1", "Consensus Guideline", "Phase II Protocol"
  customBadge?: string;
}

export interface RegimenEvidence {
  nccn: { pdfUrl: string; targetPage: number; sectionCode: string; sectionTitle: string; };
  astro?: { title: string; url: string; };
  estro?: { title: string; url: string; };
  landmarkTrial?: { shortName: string; citation: string; doiUrl: string; };
}

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
  evidenceLinks?: EvidenceLink[];
  evidenceObj?: RegimenEvidence;
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
      limit: '≤ 50% of strip receives 20 Gy',
      source: 'RTOG 0630 (2015), DOI: 10.1200/JCO.2014.58.5828',
      context: 'Yalnızca ekstremite yumuşak doku sarkomunda preoperatif RT; protokol talimatı.',
      contextEn: 'Preoperative extremity soft-tissue sarcoma only; protocol-specific instruction.',
      classification: 'protocol-limit',
    }];
  }

  if (organ === 'thorax' && conventionalFractionation) {
    return [
      {
        organ: 'Bilateral akciğer (GTV hariç)',
        metric: 'V20Gy',
        limit: '< 30–35%',
        source: 'QUANTEC lung (2010), DOI: 10.1016/j.ijrobp.2009.06.091',
        context: 'Konvansiyonel toraks RT; SBRT için kullanılmaz.',
        contextEn: 'Conventional thoracic RT; not for SBRT.',
        classification: 'dose-volume-reference',
      },
      {
        organ: 'Bilateral akciğer (GTV hariç)',
        metric: 'Dmean',
        limit: '< 20 Gy',
        source: 'QUANTEC lung (2010), DOI: 10.1016/j.ijrobp.2009.06.091',
        context: 'Konvansiyonel toraks RT; plan ve hasta faktörlerine göre değerlendirilir.',
        contextEn: 'Conventional thoracic RT; interpret with plan and patient factors.',
        classification: 'dose-volume-reference',
      },
      {
        organ: 'Özofagus',
        metric: 'Dmean',
        limit: '< 34 Gy',
        source: 'QUANTEC esophageal toxicity review (2010)',
        context: 'Konvansiyonel toraks RT; doz-hacim ilişkisini ve eşzamanlı tedaviyi birlikte değerlendirin.',
        contextEn: 'Conventional thoracic RT; consider dose-volume exposure and concurrent treatment.',
        classification: 'dose-volume-reference',
      },
      {
        organ: 'Kalp',
        metric: 'Dmean / V30',
        limit: 'Dmean < 20 Gy; V30 < 46%',
        source: 'QUANTEC cardiac review (2010), DOI: 10.1016/j.ijrobp.2009.04.093',
        context: 'Kardiyak doz mümkün olduğunca azaltılmalı; hasta ve plan bağlamında yorumlayın.',
        contextEn: 'Minimize cardiac dose and interpret in the context of the patient and plan.',
        classification: 'dose-volume-reference',
      },
      {
        organ: 'Brakiyal pleksus',
        metric: 'Dmax',
        limit: '< 66 Gy',
        source: 'QUANTEC / thoracic RT planning reference',
        context: 'Konvansiyonel fraksiyonasyon; yeniden ışınlama ve fraksiyonasyon değişikliğinde sınırı doğrudan aktarmayın.',
        contextEn: 'Conventional fractionation; do not transfer this limit directly to re-irradiation or altered fractionation.',
        classification: 'dose-volume-reference',
      },
      {
        organ: 'Spinal kord',
        metric: 'Dmax',
        limit: '≤ 50 Gy',
        source: 'QUANTEC spinal cord (2010); conventional fractionation',
        context: 'Konvansiyonel fraksiyonasyon; kord PRV ve yeniden ışınlama için protokol doğrulaması gerekir.',
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
        context: 'Konvansiyonel prostat RT DVH referansı; PACE-B SBRT için uygulanmaz.',
        contextEn: 'Conventional prostate RT DVH reference; not applicable to PACE-B SBRT.',
        classification: 'dose-volume-reference',
      },
      {
        organ: 'Mesane',
        metric: 'V70Gy / V65Gy',
        limit: '< 35% / < 50%',
        source: 'QUANTEC bladder (2010), conventional fractionation',
        context: 'Konvansiyonel prostat RT; seçilen protokol ve kontur tanımıyla doğrulanmalıdır.',
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
        context: 'Yalnızca peritoneal boşluk/bowel bag konturu için; tek tek bağırsak ansı limiti değildir.',
        contextEn: 'For the peritoneal cavity/bowel-bag contour only; not an individual bowel-loop limit.',
        classification: 'dose-volume-reference',
      });
    }
    return rows;
  }

  if (organ === 'breast') {
    return [{
      organ: 'Kalp / LAD / ipsilateral akciğer / kontralateral meme',
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
        context: 'Konvansiyonel pelvik RT; bowel bag/peritoneal cavity konturu için.',
        contextEn: 'Conventional pelvic RT; for the bowel-bag/peritoneal-cavity contour.',
        classification: 'dose-volume-reference',
      },
      {
        organ: 'Individual small-bowel loops',
        metric: 'V15Gy',
        limit: '< 120 cc',
        source: 'QUANTEC small bowel (2010), DOI: 10.1016/j.ijrobp.2009.05.074',
        context: 'Konvansiyonel pelvik RT; tek tek bağırsak ansları için, bowel bag ile karıştırılmamalıdır.',
        contextEn: 'Conventional pelvic RT; individual loops, not interchangeable with the bowel bag.',
        classification: 'dose-volume-reference',
      },
    ];
  }

  if (organ === 'gis' && subsite === 'gis-Karaciger' && scheme.fractionCount === 5) {
    return [
      {
        organ: lang === 'tr' ? 'Sağlam karaciğer (toplam karaciğer - GTV)' : 'Uninvolved liver (total liver minus GTV)',
        metric: lang === 'tr' ? 'Korunmuş hacim eşiği (V15Gy)' : 'Spared-volume threshold (V15Gy)',
        limit: lang === 'tr' ? 'En az 700 cc, ≤15 Gy doz almalı' : 'At least 700 cc should receive ≤15 Gy',
        source: 'NRG/RTOG 1112 protocol; eviQ hepatic metastases SABR protocol',
        context: lang === 'tr'
          ? 'Beş fraksiyonlu karaciğer SBRT; başlangıç karaciğer fonksiyonu ve önceki karaciğer tedavilerini değerlendirin.'
          : 'Five-fraction liver SBRT; assess baseline liver function and prior liver-directed treatment.',
        contextEn: 'Five-fraction liver SBRT; assess baseline liver function and prior liver-directed treatment.',
        classification: 'protocol-limit',
      },
      {
        organ: lang === 'tr' ? 'Mide / duodenum' : 'Stomach / duodenum',
        metric: 'D0.5cc',
        limit: lang === 'tr' ? '≤30 Gy (5 fraksiyon referansı; seçilen protokolü doğrulayın)' : '≤30 Gy (5-fraction reference; verify selected protocol)',
        source: 'eviQ hepatic metastases stereotactic EBRT protocol',
        context: 'İlgili organa ve fraksiyonasyona özgü DVH kısıtlarını kullanın; gerekirse reçete dozunu azaltın.',
        contextEn: 'Use the relevant organ-specific and fractionation-specific DVH constraints; reduce prescription if needed.',
        classification: 'dose-volume-reference',
      },
    ];
  }

  if (organ === 'gis' && subsite === 'gis-SafraYollari') {
    return [{
      organ: lang === 'tr' ? 'Mide / duodenum / ince bağırsak / santral safra yolları' : 'Stomach / duodenum / small bowel / central bile ducts',
      metric: lang === 'tr' ? 'Fraksiyon ve alt bölgeye özgü doz-hacim sınırları' : 'Fraction- and site-specific dose-volume limits',
      limit: lang === 'tr' ? 'Seçilen protokolü kullanın; evrensel biliyer SBRT eşiği yoktur' : 'Use the selected protocol; no universal biliary SBRT threshold',
      source: 'SWOG S0809 (JCO 2015), DOI: 10.1200/JCO.2014.60.2219; RTOG upper-abdominal atlas',
      context: 'İntrahepatik, perihiler, distal ve safra kesesi yatağı hedeflerinde anatomi ve OAR kısıtları farklıdır.',
      contextEn: 'Anatomy and organ-at-risk limits differ for intrahepatic, perihilar, distal and gallbladder-bed targets.',
      classification: 'context-note',
    }];
  }

  if (organ === 'prostate' && subsite === 'prostate-kidney') {
    if (scheme.id === 'rcc-primary-42-3') {
      return [
        {
          organ: lang === 'tr' ? 'Kontralateral böbrek' : 'Contralateral kidney',
          metric: 'Dmean',
          limit: lang === 'tr' ? '≤8 Gy (eviQ 3 fraksiyon referansı)' : '≤8 Gy (3-fraction eviQ reference)',
          source: 'eviQ renal cell carcinoma definitive stereotactic EBRT protocol',
          context: 'Renal fonksiyonu koruyun; başlangıç eGFR, tek böbrek ve önceki renal tedaviye göre bireyselleştirin.',
          contextEn: 'Preserve renal function; individualise for baseline eGFR, solitary kidney and prior renal treatment.',
          classification: 'dose-volume-reference',
        },
        {
          organ: lang === 'tr' ? 'Bağırsak / duodenum' : 'Bowel / duodenum',
          metric: 'D0.03cc',
          limit: lang === 'tr' ? '≤30 Gy (eviQ 3 fraksiyon referansı)' : '≤30 Gy (3-fraction eviQ reference)',
          source: 'eviQ renal cell carcinoma definitive stereotactic EBRT protocol',
          context: 'Noktasal maksimum D0.5cc veya Dmax ile eşdeğer değildir; güncel protokolün tam metriğini uygulayın.',
          contextEn: 'Point maximum is not interchangeable with D0.5cc or Dmax; apply the exact current protocol.',
          classification: 'dose-volume-reference',
        },
        {
          organ: lang === 'tr' ? 'Spinal kord' : 'Spinal cord',
          metric: lang === 'tr' ? 'Fraksiyona özgü küçük hacim kısıtı' : 'Fraction-specific small-volume constraint',
          limit: lang === 'tr' ? 'Güncel renal SBRT protokolünü kullanın; genel bir değer verilmemiştir' : 'Use current renal SBRT protocol; no generic value asserted',
          source: 'eviQ renal cell carcinoma definitive stereotactic EBRT protocol; AAPM TG-101',
          context: 'Başka bir protokol veya kontur tanımındaki 3 fraksiyon sınırını ikame etmeyin.',
          contextEn: 'Do not substitute a three-fraction limit from another protocol or contour definition.',
          classification: 'context-note',
        },
      ];
    }
    return [{
      organ: lang === 'tr' ? 'Kalan böbrek / bağırsak / spinal kord' : 'Remaining kidney / bowel / spinal cord',
      metric: lang === 'tr' ? 'Fraksiyona özgü doz-hacim sınırları' : 'Fraction-specific dose-volume limits',
      limit: lang === 'tr' ? 'Seçilen FASTRACK II veya oligometastatik SBRT protokolünü kullanın' : 'Use the selected FASTRACK II or oligometastatic SBRT protocol',
      source: 'FASTRACK II (Lancet Oncol 2024), DOI: 10.1016/S1470-2045(24)00020-2; eviQ renal SABR protocol',
      context: 'Tek fraksiyon primer SABR ve 3–5 fraksiyon metastaz SBRT kısıtları farklıdır.',
      contextEn: 'Single-fraction primary SABR and 3–5 fraction metastasis SBRT have different constraints.',
      classification: 'context-note',
    }];
  }

  if (organ === 'thorax' && scheme.fractionCount <= 5) {
    return [
      {
        organ: 'Proksimal bronş ağacı',
        metric: 'Dmax',
        limit: '< 105% of prescription',
        source: 'AAPM TG-101; HyTEC thoracic SBRT',
        context: 'Merkezi/ultramerkezi SBRT için seçilen fraksiyon protokolüyle doğrulayın.',
        contextEn: 'Verify against the selected fractionation protocol for central/ultracentral SBRT.',
        classification: 'protocol-limit',
      },
      {
        organ: 'Göğüs duvarı / kaburga',
        metric: 'V30Gy',
        limit: '< 30 cc',
        source: 'AAPM TG-101; HyTEC thoracic SBRT',
        context: 'SBRT doz-hacim hedefi; reçete ve fraksiyon sayısıyla birlikte değerlendirin.',
        contextEn: 'SBRT dose-volume objective; interpret with prescription and fraction count.',
        classification: 'protocol-limit',
      },
      {
        organ: 'Özofagus',
        metric: 'Fraksiyona özgü doz-hacim metriği',
        limit: 'Seçilen SBRT protokolüne göre doğrulayın',
        source: 'AAPM TG-101; HyTEC thoracic SBRT',
        context: 'Konvansiyonel Dmean eşiği SBRT için kullanılamaz.',
        contextEn: 'The conventional-fractionation Dmean threshold is not applicable to SBRT.',
        classification: 'context-note',
      },
      {
        organ: 'Kalp',
        metric: 'Fraksiyona özgü doz-hacim metriği',
        limit: 'Dozu ALARA; seçilen SBRT protokolünü doğrulayın',
        source: 'AAPM TG-101; HyTEC thoracic SBRT',
        context: 'Konvansiyonel Dmean/V30 eşikleri SBRT için doğrudan kullanılmamalıdır.',
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
        context: 'SRS sınırı fraksiyon sayısı ve kontur tanımıyla doğrulanmalıdır.',
        contextEn: 'Verify SRS limits against fraction count and contour definition.',
        classification: 'dose-volume-reference',
      },
      {
        organ: 'Hipofiz',
        metric: 'Dmax',
        limit: '< 54 Gy',
        source: 'QUANTEC head-and-neck review (2010), PubMed 20171519',
        context: 'Konvansiyonel fraksiyonasyon için referans; SRS ve yeniden ışınlama için ayrı protokol gerekir.',
        contextEn: 'Conventional-fractionation reference; use a separate protocol for SRS and re-irradiation.',
        classification: 'dose-volume-reference',
      },
      {
        organ: 'Optik sinirler / kiazma',
        metric: 'Dmax / SRS Dmax',
        limit: 'Dmax < 54 Gy; SRS < 8-10 Gy',
        source: 'QUANTEC head-and-neck review (2010), PubMed 20171519; AAPM TG-101',
        context: 'SRS eşiği fraksiyon sayısına göre seçilmelidir.',
        contextEn: 'Select the SRS limit according to fraction count.',
        classification: 'dose-volume-reference',
      },
      {
        organ: 'Hipokampus (HA-WBRT)',
        metric: 'D100% / Dmax',
        limit: 'D100% ≤ 9 Gy; Dmax ≤ 16 Gy',
        source: 'NRG CC001 hippocampal-avoidance WBRT trial',
        context: 'Yalnızca hipokampus korumalı WBRT planlamasında; hedef kapsamı ve protokol uygunsa.',
        contextEn: 'For hippocampal-avoidance WBRT only, when target coverage and protocol permit.',
        classification: 'protocol-limit',
      },
      {
        organ: 'Lens',
        metric: 'Dmax',
        limit: '< 7 Gy',
        source: 'QUANTEC head-and-neck review (2010), PubMed 20171519',
        context: 'Lens konturu ve tedavi geometrisine göre doz minimizasyonu.',
        contextEn: 'Minimize dose based on lens contour and treatment geometry.',
        classification: 'planning-aim',
      },
      {
        organ: 'Retina',
        metric: 'Dmax',
        limit: '< 45 Gy',
        source: 'QUANTEC head-and-neck review (2010), PubMed 20171519',
        context: 'Konvansiyonel fraksiyonasyon referansı; göz yapılarının konturları doğrulanmalıdır.',
        contextEn: 'Conventional-fractionation reference; verify ocular structure contours.',
        classification: 'dose-volume-reference',
      },
    ];
  }

  if (organ === 'head-neck' && conventionalFractionation) {
    return [
      {
        organ: 'Beyin sapı',
        metric: 'Dmax',
        limit: '≤ 54 Gy',
        source: 'QUANTEC brainstem (2010), DOI: 10.1016/j.ijrobp.2009.07.1753',
        context: 'Konvansiyonel fraksiyonasyon; D1cc küçük-hacim ölçütüyle aynı değildir.',
        contextEn: 'Conventional fractionation; not interchangeable with a D1cc small-volume metric.',
        classification: 'dose-volume-reference',
      },
      {
        organ: 'Optik sinirler / kiazma',
        metric: 'Dmax',
        limit: '≤ 55 Gy',
        source: 'QUANTEC head-and-neck review (2010), PubMed 20171519',
        context: 'Konvansiyonel fraksiyonasyon; PRV limitleri seçilen protokole bağlıdır.',
        contextEn: 'Conventional fractionation; PRV limits depend on the selected protocol.',
        classification: 'dose-volume-reference',
      },
      {
        organ: 'Parotis (en az bir bez)',
        metric: 'Dmean',
        limit: '< 26 Gy',
        source: 'QUANTEC parotid (2010), DOI: 10.1016/j.ijrobp.2009.06.090',
        context: 'Konvansiyonel baş-boyun RT; hedef kapsamı ve bez konturu dikkate alınır.',
        contextEn: 'Conventional head-and-neck RT; consider target coverage and gland contour.',
        classification: 'dose-volume-reference',
      },
      {
        organ: 'Mandibula',
        metric: 'Dmax',
        limit: '< 70 Gy',
        source: 'Head-and-neck planning reference; verify institutional protocol',
        context: 'Diş sağlığı, cerrahi, hedef komşuluğu ve fraksiyonasyona göre planı doğrulayın.',
        contextEn: 'Verify with dental status, surgery, target proximity and fractionation.',
        classification: 'planning-aim',
      },
      {
        organ: 'Tiroid',
        metric: 'V30Gy',
        limit: '< 50%',
        source: 'Head-and-neck planning reference',
        context: 'Tiroid fonksiyon takibi ve başlangıç durumu dikkate alınmalıdır.',
        contextEn: 'Consider baseline thyroid function and follow-up.',
        classification: 'planning-aim',
      },
      {
        organ: 'Oral kavite',
        metric: 'Dmean',
        limit: '< 35 Gy',
        source: 'QUANTEC head-and-neck review (2010), PubMed 20171519',
        context: 'Hedef kapsamı ve ağız boşluğu kontur tanımıyla birlikte yorumlayın.',
        contextEn: 'Interpret with target coverage and oral-cavity contour definition.',
        classification: 'planning-aim',
      },
      {
        organ: 'Faringeal konstriktörler (PCM)',
        metric: 'Dmean',
        limit: '< 50 Gy',
        source: 'QUANTEC head-and-neck review (2010), PubMed 20171519',
        context: 'Disfaji riskini azaltma hedefi; ilgili konstriktör alt yapılarının konturunu doğrulayın.',
        contextEn: 'Dysphagia-reduction objective; verify contours of relevant constrictor substructures.',
        classification: 'planning-aim',
      },
      {
        organ: 'Larenks',
        metric: 'Dmean',
        limit: '< 45 Gy',
        source: 'QUANTEC head-and-neck review (2010), PubMed 20171519',
        context: 'Hedef kapsamı ve fonksiyonel larenks hacmine göre planı değerlendirin.',
        contextEn: 'Evaluate with target coverage and functional larynx volume.',
        classification: 'planning-aim',
      },
      {
        organ: 'Submandibular / parotis bezleri',
        metric: 'Dmean',
        limit: '< 26 Gy',
        source: 'QUANTEC parotid (2010), DOI: 10.1016/j.ijrobp.2009.06.090',
        context: 'En az bir bezin korunması, tümör konumu ve hedef kapsamına bağlıdır.',
        contextEn: 'Preservation of at least one gland depends on tumor location and target coverage.',
        classification: 'planning-aim',
      },
      {
        organ: 'Koklea',
        metric: 'Dmean',
        limit: '< 45 Gy',
        source: 'QUANTEC head-and-neck review (2010), PubMed 20171519',
        context: 'Konvansiyonel RT için doz azaltma hedefi; işitme riski klinik faktörlere bağlıdır.',
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
      context: 'Serviks D2cc değerleri kümülatif EBRT + brakiterapi EQD2, α/β=3 içindir.',
      contextEn: 'Cervical D2cc values are cumulative EBRT + brachytherapy EQD2, α/β=3.',
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
        riskCategory: oligometastatic ? 'Orta-Kötü Prognoz (Oligometastatik)' : 'Kötü Prognoz (Yaygın Metastatik)',
        medianSurvivalOrRecurrence: oligometastatic ? 'Median OS: ~18-24 ay' : 'Median OS: ~10-14 ay',
        recommendation: oligometastatic ? 'Sistemik Kemo-İmmünoterapi / Hedefe Yönelik Tedavi + primer ve oligometastazlara konsolidatif SBRT/SABR.' : 'Sistemik Kemo-İmmünoterapi (Kategori 1); RT semptomatik lezyonlara palyatif amaçla uygulanır.',
      };
    }
    if (isNodalPositive || /^T[34]/.test(t)) {
      return {
        indexName: 'PACIFIC & RTOG Evre III Lokal İleri Modeli',
        score: `${t} ${n} (Evre III)`,
        riskCategory: 'Lokal İleri Yüksek Risk',
        medianSurvivalOrRecurrence: '5 yıllık genel sağkalım (PACIFIC): ~43%',
        recommendation: 'Eşzamanlı Kemo-Radyoterapi (60-66 Gy), uygun olgularda 12 ay Durvalumab idamesi.',
      };
    }
    return {
      indexName: 'RTOG / ESTRO Erken Evre KHDAK SBRT Modeli',
      score: `${t} ${n} M0 (Evre I)`,
      riskCategory: 'Mükemmel Lokal Kontrol (Düşük Sistemik Risk)',
      medianSurvivalOrRecurrence: '3 yıllık lokal kontrol: >%90; Median OS: ~4-5 yıl',
      recommendation: 'Küratif SBRT (54 Gy/3 fx veya 50 Gy/5 fx); nodal ışınlama yapılmaz.',
    };
  }

  if (organ === 'prostate' || lowerSubsite.includes('prostate')) {
    if (m.includes('M1c')) {
      return {
        indexName: 'CHAARTED & LATITUDE Metastatik Risk Modeli',
        score: 'M1c (Visseral Yüksek Volüm)',
        riskCategory: 'Evre IVB: Kötü Prognoz (Visseral Metastatik mHSPC)',
        medianSurvivalOrRecurrence: 'Median OS: ~32-36 ay',
        recommendation: 'ADT + ARPI ± Dosetaksel ile yoğunlaştırılmış sistemik tedavi esastır; primer RT seçilmiş olgularla sınırlıdır.',
      };
    }
    if (isM1) {
      return {
        indexName: 'STAMPEDE & CHAARTED Düşük Volüm Modeli',
        score: m.includes('M1b') ? 'M1b (Kemik Met)' : 'M1a (Uzak Nodal)',
        riskCategory: 'Evre IVB: Düşük Volümlü / Oligometastatik mHSPC',
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
        indexName: 'UCSF CAPRA & NCCN Çok Yüksek Risk Modeli',
        score: `${Math.max(capra, 6)} / 10`,
        riskCategory: 'Çok Yüksek Risk',
        medianSurvivalOrRecurrence: '5 yıllık biyokimyasal nükssüzlük: ~35-45%',
        recommendation: 'Doz eskalasyonu (78-80 Gy veya SIB) + 24-36 ay ADT + elektif pelvik nodal RT.',
      };
    }
    if (capra >= 3) {
      return {
        indexName: 'UCSF CAPRA & NCCN Orta Risk Modeli',
        score: `${capra} / 10`,
        riskCategory: 'Orta Risk',
        medianSurvivalOrRecurrence: '5 yıllık biyokimyasal nükssüzlük: ~70-75%',
        recommendation: '60 Gy/20 fx veya SBRT (36.25 Gy) ± 4-6 ay kısa dönem ADT.',
      };
    }
    return {
      indexName: 'UCSF CAPRA & NCCN Düşük Risk Modeli',
      score: `${capra} / 10`,
      riskCategory: 'Düşük Risk',
      medianSurvivalOrRecurrence: '5 yıllık biyokimyasal nükssüzlük: ~85-90%',
      recommendation: 'Aktif izlem veya tek başına SBRT / ılımlı hipofraksiyonasyon; ADT gerekmez.',
    };
  }

  if (organ === 'breast') {
    if (isM1) {
      return {
        indexName: 'Evre IV Metastatik Meme Kanseri Risk Modeli',
        score: 'M1 (Uzak Metastaz)',
        riskCategory: 'Evre IV: İleri Sistemik Hastalık',
        medianSurvivalOrRecurrence: 'Median OS: biyolojik alt tipe göre ~2-5+ yıl',
        recommendation: 'Sistemik tedavi önceliklidir; RT semptom palyasyonu veya seçilmiş oligometastaz ablasyonu için uygulanır.',
      };
    }
    if (isNodalPositive || /^T[34]/.test(t)) {
      return {
        indexName: 'Lokal İleri Meme Kanseri (LABC) Risk Modeli',
        score: `${t} ${n} (Evre III)`,
        riskCategory: 'Yüksek Lokal Nüks Riski',
        medianSurvivalOrRecurrence: '10 yıllık lokal nüks riski: ~20-30% (RT ile <%8-10)',
        recommendation: 'PMRT veya meme koruyucu RT + kapsamlı bölgesel nodal ışınlama (RNI).',
      };
    }
    const sizeCm = extraParams.tumorSizeCm || (t === 'T1a' ? 0.5 : t === 'T1b' ? 1 : t === 'T1c' ? 1.8 : 3);
    const npi = (0.2 * sizeCm) + (n === 'N0' ? 1 : 2) + (extraParams.grade || 2);
    const favorable = npi <= 3.4;
    return {
      indexName: 'Nottingham Prognostic Index (NPI)',
      score: npi.toFixed(2),
      riskCategory: favorable ? 'İyi Prognoz (NPI ≤ 3.4)' : 'Orta Prognoz (NPI 3.41-5.4)',
      medianSurvivalOrRecurrence: favorable ? '10 yıllık sağkalım: ~85%' : '10 yıllık sağkalım: ~65%',
      recommendation: favorable ? 'Standart adjuvan tüm meme RT (FAST-Forward 26 Gy/5 fx); RNI yapılmaz.' : 'Tüm meme RT + tümör yatağı boost ve sistemik tedavinin multidisipliner değerlendirilmesi.',
    };
  }

  if (organ === 'cns') {
    if (lowerSubsite.includes('gbm') || lowerSubsite.includes('glioblast')) {
      return {
        indexName: 'EORTC / RTOG RPA Glioblastom Modeli',
        score: age < 50 ? 'RPA Sınıf III' : kps >= 70 ? 'RPA Sınıf IV' : 'RPA Sınıf V',
        riskCategory: age < 50 ? 'Göreceli İyi Prognoz' : kps >= 70 ? 'Standart Yüksek Risk' : 'Kötü Performans / Düşkün',
        medianSurvivalOrRecurrence: age < 50 ? 'Median OS: ~17-24 ay' : kps >= 70 ? 'Median OS: ~14-16 ay' : 'Median OS: ~6-9 ay',
        recommendation: kps >= 70 ? 'Stupp protokolü: 60 Gy/30 fx + eşzamanlı ve adjuvan Temozolomid.' : 'Kısa dönem hipofraksiyonasyon (40.05 Gy/15 fx) ± Temozolomid.',
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
        riskCategory: gpa >= 3.5 ? 'Mükemmel Prognoz' : gpa >= 2.5 ? 'İyi-Orta Prognoz' : 'Kötü Prognoz',
        medianSurvivalOrRecurrence: gpa >= 3.5 ? 'Median OS: ~14-25 ay' : gpa >= 2.5 ? 'Median OS: ~8-12 ay' : 'Median OS: ~3-5 ay',
        recommendation: gpa >= 2.5 ? 'SRS veya hipokampus korumalı WBRT değerlendirilir.' : 'WBRT veya best supportive care değerlendirilir.',
      };
    }
  }

  if (organ === 'gis') {
    if (isM1) {
      return {
        indexName: 'Metastatik Kolorektal / GİS Modeli',
        score: 'M1 (Uzak Metastaz)',
        riskCategory: 'Evre IV GİS Malignitesi',
        medianSurvivalOrRecurrence: 'Median OS: ~20-30 ay',
        recommendation: 'Sistemik kemoterapi ve biyolojik ajanlar; oligometastazlara SBRT veya cerrahi ablasyon.',
      };
    }
    if (lowerSubsite.includes('rect') || lowerSubsite.includes('rekt')) {
      const locallyAdvanced = /^T[34]/.test(t) || isNodalPositive;
      return {
        indexName: 'RAPIDO & PRODIGE-23 LARC Risk Modeli',
        score: locallyAdvanced ? 'Lokal İleri Rektum (LARC)' : 'Erken Evre Rektum',
        riskCategory: locallyAdvanced ? 'Yüksek Lokal ve Sistemik Nüks Riski' : 'Düşük Nüks Riski',
        medianSurvivalOrRecurrence: locallyAdvanced ? '3 yıllık hastalıksız sağkalım: ~75%' : '5 yıllık lokal kontrol: >%90',
        recommendation: locallyAdvanced ? 'Total neoadjuvan tedavi: 25 Gy/5 fx + konsolidasyon KT veya uzun dönem KRT.' : 'Primer cerrahi (TME) veya seçilmiş olguda lokal eksizyon.',
      };
    }
  }

  if (organ === 'head-neck') {
    if (isM1) {
      return {
        indexName: 'KEYNOTE-048 Evre IVC Baş-Boyun Modeli',
        score: 'Evre IVC (Uzak Metastaz)',
        riskCategory: 'Kötü Prognoz',
        medianSurvivalOrRecurrence: 'Median OS: ~10-14 ay',
        recommendation: 'Pembrolizumab ± platin/5-FU; primer kitleye palyatif RT.',
      };
    }
    return {
      indexName: 'Ang et al. Orofarenks / Baş-Boyun RPA Modeli',
      score: isNodalPositive ? 'Nodal Pozitif Lokal İleri' : 'Erken Evre',
      riskCategory: isNodalPositive ? 'Orta-Yüksek Nüks Riski' : 'Düşük Nüks Riski',
      medianSurvivalOrRecurrence: isNodalPositive ? '5 yıllık sağkalım: ~65-75%' : '5 yıllık sağkalım: >%85',
      recommendation: isNodalPositive ? 'Definitif kemoradyoterapi: SIB 70/60/54 Gy/33 fx + yüksek doz Sisplatin.' : 'Küratif radyoterapi veya cerrahi rezeksiyon.',
    };
  }

  if (organ === 'gynecology') {
    if (isM1) {
      return {
        indexName: 'FIGO Evre IVB Jinekolojik Kanser Modeli',
        score: 'Evre IVB (Uzak Metastaz)',
        riskCategory: 'İleri Evre Sistemik Tutulum',
        medianSurvivalOrRecurrence: 'Median OS: ~12-18 ay',
        recommendation: 'Karboplatin + Paklitaksel ± Pembrolizumab/Bevasizumab; kanama kontrolü için palyatif RT.',
      };
    }
    return {
      indexName: 'EMBRACE II & PORTEC-3 Pelvik Risk Modeli',
      score: isNodalPositive ? 'Yüksek Risk (Nodal Tutulum)' : 'Lokal Pelvik Risk',
      riskCategory: isNodalPositive ? 'Yüksek Pelvik ve Paraaortik Nüks Riski' : 'Standart Pelvik Risk',
      medianSurvivalOrRecurrence: '5 yıllık pelvik lokal kontrol: ~70-85%',
      recommendation: 'Pelvik EBRT + eşzamanlı Sisplatin ve 3D MR-IGABT brakiterapi değerlendirilir.',
    };
  }

  if (organ === 'palliative' || lowerSubsite.includes('spinal')) {
    const tokuhashi = (kps >= 80 ? 2 : 1) + (isM1 ? 1 : 2) + 2;
    const favorable = tokuhashi >= 9;
    return {
      indexName: 'Modifiye Tokuhashi & Tomita Spinal İndeksi',
      score: `${tokuhashi} / 15`,
      riskCategory: favorable ? 'Orta/İyi Prognoz' : 'Kısa Yaşam Beklentisi',
      medianSurvivalOrRecurrence: favorable ? 'Beklenen yaşam: > 6-12 ay' : 'Beklenen yaşam: < 6 ay',
      recommendation: favorable ? 'Spine SBRT (16-24 Gy tek fx veya 24-30 Gy/3-5 fx).' : 'Hızlı ağrı ve bası palyasyonu: 8 Gy tek fx veya 20 Gy/5 fx.',
    };
  }

  if (organ === 'bone-sarcoma' || organ === 'hematologic' || organ === 'pediatric' || organ === 'benign') {
    const advanced = isNodalPositive || /^T[34]/.test(t);
    if (isM1) {
      return {
        indexName: 'Uluslararası Evre IV Metastatik Risk Modeli',
        score: 'Evre IV (Metastatik)',
        riskCategory: 'İleri Evre Sistemik Hastalık',
        medianSurvivalOrRecurrence: 'Prognoz primer tümör biyolojisine bağlıdır',
        recommendation: 'Sistemik tedavi önceliklidir; RT semptom palyasyonu veya oligometastaz ablasyonu için uygulanır.',
      };
    }
    return {
      indexName: 'Organ-Spesifik Evreleme ve Nüks Risk Modeli',
      score: advanced ? 'Lokal İleri' : 'Lokalize',
      riskCategory: advanced ? 'Yüksek Nüks Riski' : 'Düşük-Orta Nüks Riski',
      medianSurvivalOrRecurrence: 'Prognoz histoloji, evre ve tedavi yanıtına göre değişir',
      recommendation: advanced ? 'Multidisipliner sistemik tedavi ve definitif/adyuvan RT değerlendirilir.' : 'Evreye uygun cerrahi veya küratif RT ve yakın takip.',
    };
  }

  if (organ === 'cns' && (subsite.includes('mets') || m.includes('M1'))) {
    let gpa = 0;
    if (age < 50) gpa += 1;
    else if (age <= 59) gpa += 0.5;
    if (kps >= 90) gpa += 1;
    else if (kps >= 70) gpa += 0.5;
    gpa += 1;

    let riskCategory = 'Kötü Prognoz (GPA 0-1.0)';
    let medianSurvivalOrRecurrence = 'Median OS: ~3-5 ay';
    let recommendation = 'WBRT veya Best Supportive Care değerlendirilebilir.';
    if (gpa >= 3.5) {
      riskCategory = 'Mükemmel Prognoz (GPA 3.5-4.0)';
      medianSurvivalOrRecurrence = 'Median OS: ~14-25 ay';
      recommendation = 'Agresif Lokal Tedavi: Tek başına SRS / Fraksiyone SRT (Kategori 1).';
    } else if (gpa >= 2.5) {
      riskCategory = 'İyi-Orta Prognoz (GPA 2.5-3.0)';
      medianSurvivalOrRecurrence = 'Median OS: ~8-12 ay';
      recommendation = 'Stereotaktik Radyocerrahi (SRS) veya Hipokampus Korumalı WBRT.';
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

    let riskCategory = 'Düşük Risk (CAPRA 0-2)';
    let medianSurvivalOrRecurrence = '5 yıllık biyokimyasal nükssüzlük: ~85-90%';
    let recommendation = 'Aktif İzlem veya Tek Başına SBRT / Ilımlı Hipofraksiyonasyon (ADT gerekmez).';
    if (capra >= 6) {
      riskCategory = 'Yüksek / Çok Yüksek Risk (CAPRA 6-10)';
      medianSurvivalOrRecurrence = '5 yıllık biyokimyasal nükssüzlük: ~35-50%';
      recommendation = 'Doz Eskalasyonu (78-80 Gy veya SIB) + 18-36 Ay Uzun Dönem ADT + Elektif Pelvik Nodal RT.';
    } else if (capra >= 3) {
      riskCategory = 'Orta Risk (CAPRA 3-5)';
      medianSurvivalOrRecurrence = '5 yıllık biyokimyasal nükssüzlük: ~70-75%';
      recommendation = 'Ilımlı Hipofraksiyon (60 Gy / 20 fx) veya SBRT (36.25 Gy) ± 4-6 Ay Kısa Dönem ADT.';
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
    let riskCategory = 'İyi Prognoz (NPI ≤ 3.4)';
    let medianSurvivalOrRecurrence = '10 yıllık sağkalım: ~83-88%';
    let recommendation = 'Standart Adjuvan WBRT (FAST-Forward 26 Gy/5 fx). Nodal ışınlama (RNI) gerekmez.';
    if (npi > 5.4) {
      riskCategory = 'Kötü Prognoz (NPI > 5.4)';
      medianSurvivalOrRecurrence = '10 yıllık sağkalım: ~13-35%';
      recommendation = 'Kapsamlı Bölgesel Nodal Işınlama (RNI Düzey I-IV + Supraklavikular) + Sistemik KT/Hedefe Yönelik Tedavi.';
    } else if (npi > 3.4) {
      riskCategory = 'Orta Prognoz (NPI 3.41 - 5.4)';
      medianSurvivalOrRecurrence = '10 yıllık sağkalım: ~53-70%';
      recommendation = 'Tüm Meme RT + Risk faktörlerine göre Tümör Yatağı Boost (10-16 Gy) ve Endokrin Tedavi.';
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
    let riskCategory = 'Orta/İyi Prognoz (Tokuhashi ≥ 9)';
    let medianSurvivalOrRecurrence = 'Beklenen Yaşam Süresi: > 6-12 ay';
    let recommendation = 'Omurga Stereotaktik Beden Radyoterapisi (Spine SBRT: 16-24 Gy tek fx veya 24-30 Gy / 3-5 fx).';
    if (tokuhashi < 9) {
      riskCategory = 'Kısa Yaşam Beklentisi (Tokuhashi < 9)';
      medianSurvivalOrRecurrence = 'Beklenen Yaşam Süresi: < 6 ay';
      recommendation = 'Hızlı Ağrı Palyasyonu: Tek Fraksiyon 8 Gy veya 20 Gy / 5 fx Konvansiyonel Dekompresyon.';
    }
    return {
      indexName: 'Modifiye Tokuhashi & Tomita Spinal İndeksi',
      score: `${tokuhashi} / 15`,
      riskCategory,
      medianSurvivalOrRecurrence,
      recommendation,
    };
  }
  if (isM1) {
    return {
      indexName: 'Uluslararası Evre IV Metastatik Risk Modeli',
      score: 'Evre IV (Metastatik)',
      riskCategory: 'İleri Evre Sistemik Hastalık',
      medianSurvivalOrRecurrence: 'Prognoz primer tümör biyolojisine bağlıdır',
      recommendation: 'Sistemik tedavi önceliklidir; RT semptom palyasyonu veya oligometastaz ablasyonu için uygulanır.',
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
    add('Primer Tümör (T)', 'Primary Tumor (T)', t || 'T?');
    add('Mediastinal Nodal (N)', 'Mediastinal Nodal (N)', n || 'N0');
    add('Uzak Metastaz (M)', 'Distant Metastasis (M)', m || 'M0');
    add('Tümör Santralitesi', 'Centrality', extraParams.centrality || 'Peripheral');
    add('Operabilite', 'Operability', isM1 ? 'Sistemik Aday' : n === 'N2' ? 'Medikal İnoperabl' : 'Cerrahi / SBRT Adayı');
  } else if (organ === 'prostate' || subsite.includes('penile')) {
    if (subsite.includes('penile')) {
      add('Primer T Evresi', 'Primary T Stage', t || 'T?');
      add('İnguinal Nodal (N)', 'Inguinal Nodes (N)', n || 'N0');
      add('Metastaz (M)', 'Metastasis (M)', m || 'M0');
      add('Klinik Risk', 'Clinical Risk', isNodalPositive ? 'Yüksek Nodal Risk' : 'Lokalize');
    } else {
      add('PSA Düzeyi', 'PSA Level', `${psa} ng/mL`, psa >= 20 ? '+3' : psa >= 10 ? '+2' : psa >= 6 ? '+1' : '0');
      add('Gleason Skoru', 'Gleason Score', `${g1}+${g2}=${gleasonSum}`, gleasonSum >= 8 ? '+3' : gleasonSum === 7 ? '+1' : '0');
      add('Klinik T', 'Clinical T', t || 'T?', /^T[34]/.test(t) ? '+1' : '0');
      add('Nodal / Met', 'N / M Status', `${n || 'N0'} ${m || 'M0'}`);
      add('Pozitif Kor (%)', 'Positive Cores', `%${extraParams.positiveCorePercent || 35}`);
    }
  } else if (organ === 'breast') {
    const sizeCm = extraParams.tumorSizeCm || (t === 'T1a' ? 0.5 : t === 'T1b' ? 1 : t === 'T1c' ? 1.8 : 3);
    const grade = extraParams.grade || 2;
    add('Tümör Çapı', 'Tumor Size', `${sizeCm} cm`, `0.2 × ${sizeCm} = ${(0.2 * sizeCm).toFixed(2)}`);
    add('Nodal Durum', 'Nodal Status', n || 'N0', n === 'N0' ? '1 Puan' : '2-3 Puan');
    add('Histolojik Grade', 'Grade', `Grade ${grade}`, `${grade} Puan`);
    add('Reseptör Durumu', 'Receptors', `${extraParams.er ? 'ER+' : 'ER-'} ${extraParams.pr ? 'PR+' : 'PR-'} ${extraParams.her2 ? 'HER2+' : 'HER2-'}`);
    add('Ki-67 İndeksi', 'Ki-67 Index', extraParams.ki67 === undefined ? 'Düşük/Orta' : `%${extraParams.ki67}`);
  } else if (organ === 'gis') {
    add('Primer T Evresi', 'Primary T Stage', t || 'T?');
    add('Bölgesel Nodal (N)', 'Regional Nodal (N)', n || 'N0');
    add('Uzak Metastaz (M)', 'Distant Metastasis (M)', m || 'M0');
    add('CRM / Fasiyal Risk', 'CRM Threat', /^T[34]/.test(t) || isNodalPositive ? 'Yüksek Risk (CRM Tehdidi)' : 'Düşük Risk');
    add('LARC Statüsü', 'LARC Status', isM1 ? 'Evre IV Metastatik' : /^T3/.test(t) || isNodalPositive ? 'Lokal İleri (TNT Adayı)' : 'Erken Evre');
  } else if (organ === 'head-neck') {
    add('Primer Kitle (T)', 'Primary Tumor (T)', t || 'T?');
    add('Servikal Nodal (N)', 'Cervical Nodal (N)', n || 'N0');
    add('Uzak Metastaz (M)', 'Distant Metastasis (M)', m || 'M0');
    add('p16 / HPV Durumu', 'p16 / HPV Status', extraParams.hpvStatus === 'positive' ? 'p16 Pozitif (İyi Prognoz)' : 'p16 Negatif / Standart');
    add('Nodal Risk Düzeyi', 'Nodal Risk Tier', isNodalPositive ? 'Bilateral Elektif Boyun Zorunlu' : 'Seçilmiş Nodal Alan');
  } else if (organ === 'cns') {
    add('Hasta Yaşı', 'Age', `${age}`, age < 50 ? '1.0' : age <= 59 ? '0.5' : '0');
    add('Karnofsky (KPS)', 'KPS', `${kps}`, kps >= 90 ? '1.0' : kps >= 70 ? '0.5' : '0');
    add('Lezyon Sayısı', 'Metastases Count', '1 Odak (Soliter)', '1.0');
    add('Ekstrakraniyal Kontrol', 'Extracranial Control', 'Kontrollü', '1.0');
  } else if (organ === 'gynecology') {
    add('Primer FIGO / T', 'Primary FIGO / T', t || 'T?');
    add('Pelvik Nodal (N)', 'Pelvic Nodal (N)', n || 'N0');
    add('Uzak Metastaz (M)', 'Distant Metastasis (M)', m || 'M0');
    add('Pelvik Kapsam', 'Pelvic Extent', isNodalPositive ? 'Bölgesel Nodal Pozitif' : 'Lokal Pelvis Sınırlı');
    add('Brakiterapi Uyumu', 'Brachytherapy Eligibility', '3D MR-IGABT Adayı');
  } else if (organ === 'bone-sarcoma') {
    add('Tümör Boyutu (T)', 'Tumor Size (T)', t || 'T?');
    add('Bölgesel Nodal (N)', 'Regional Nodal (N)', n || 'N0');
    add('Uzak Metastaz (M)', 'Distant Metastasis (M)', m || 'M0');
    add('FNCLCC Grade', 'Histologic Grade', 'Grade 2-3 (Yüksek Dereceli)');
    add('Fasyal Kompartman', 'Fascial Depth', 'Derin İntramüsküler');
  } else if (organ === 'skin') {
    add('Tümör Çapı / T', 'Tumor Diameter / T', t || 'T?');
    add('Nodal Durum (N)', 'Nodal Status (N)', n || 'N0');
    add('Uzak Metastaz (M)', 'Distant Metastasis (M)', m || 'M0');
    add('Yüksek Risk Özellikleri', 'High-Risk Features', 'Perinöral İnvazyon / Derin İnvazyon Yok');
    add('Cerrahi Sınır', 'Surgical Margin', 'R0 Negatif');
  } else if (organ === 'hematologic') {
    add('Ann Arbor Evresi', 'Ann Arbor Stage', isM1 ? 'Evre IV' : isNodalPositive ? 'Evre II-III' : 'Evre I');
    add('Hasta Yaşı', 'Age', `${age}`, age > 60 ? '+1' : '0');
    add('Serum LDH Düzeyi', 'Serum LDH', extraParams.ldhElevated ? 'Yüksek' : 'Normal', extraParams.ldhElevated ? '+1' : '0');
    add('ECOG Performansı', 'ECOG Performance Status', kps >= 80 ? 'ECOG 0-1' : 'ECOG 2+', kps >= 80 ? '0' : '+1');
    add('Ekstranodal Tutulum', 'Extranodal Sites', '≤1 Odak', '0');
  } else if (organ === 'pediatric') {
    add('Hasta Yaşı', 'Age Category', '≥3 Yaş (CSI Adayı)');
    add('Rezeksiyon Rezidüsü', 'Resection Residual', '<1.5 cm² (Standart Risk)');
    add('BOS / Nöroaksiyel Yayılım', 'Neuraxis Seeding', 'M0 (Negatif)');
    add('Moleküler Risk', 'Molecular Risk Tier', 'Standart Risk');
  } else if (organ === 'palliative') {
    add('Karnofsky (KPS)', 'KPS', `${kps}`);
    add('Metastaz Durumu', 'Metastatic Status', isM1 ? 'M1' : 'M0');
    add('Spinal Tedavi Adaylığı', 'Spinal Treatment Candidacy', kps >= 70 ? 'SBRT / Cerrahi değerlendirmesi' : 'Palyatif RT');
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
      { code: 'T1', label: 'T1', criterion: '≤3 cm tümör, akciğer veya visseral plevra ile çevrili' },
      { code: 'T2', label: 'T2', criterion: '>3-5 cm; ana bronş, visseral plevra veya hiler atelektazi tutulumu' },
      { code: 'T3', label: 'T3', criterion: '>5-7 cm veya göğüs duvarı, frenik sinir ya da parietal perikard invazyonu' },
      { code: 'T4', label: 'T4', criterion: '>7 cm veya mediasten, kalp, büyük damar, trakea ya da vertebra invazyonu' },
    ],
    N: [
      { code: 'N0', label: 'N0', criterion: 'Bölgesel lenf nodu metastazı yok' },
      { code: 'N1', label: 'N1', criterion: 'İpsilateral peribronşiyal, hiler veya intrapulmoner lenf nodu tutulumu' },
      { code: 'N2', label: 'N2', criterion: 'İpsilateral mediastinal veya subkarinal lenf nodu tutulumu' },
      { code: 'N3', label: 'N3', criterion: 'Kontralateral mediastinal/hiler veya supraklavikuler lenf nodu tutulumu' },
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
      { code: 'T1a', label: 'T1a', criterion: 'İnsidental TURP materyalinde tümör ≤%5' },
      { code: 'T1b', label: 'T1b', criterion: 'İnsidental TURP materyalinde tümör >%5' },
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
      { code: 'Organ', label: 'Organ / Yumuşak Doku Metastazı', criterion: 'Semptomatik viseral veya yumuşak doku lezyonu' },
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
TNM_DATABASE.breast.T = TNM_DATABASE.breast.T.filter(option => option.code !== 'T4').concat([
  { code: 'T4a', label: 'T4a', criterion: 'Göğüs duvarı invazyonu (kaburgalar, interkostal kaslar; pektoral kas hariç)' },
  { code: 'T4b', label: 'T4b', criterion: 'Ciltte ödem (peau d’orange), ülserasyon veya satellit cilt nodülleri' },
  { code: 'T4c', label: 'T4c', criterion: 'T4a ve T4b özelliklerinin birlikte bulunması' },
  { code: 'T4d', label: 'T4d', criterion: 'İnflamatuar meme karsinomu (memenin en az 1/3’ünde diffüz eritem ve ödem)' },
]);
TNM_DATABASE['breast-breast'] = TNM_DATABASE.breast;
TNM_DATABASE['gis-Ozofagus'] = {
  T: [
    { code: 'T1a', label: 'T1a', criterion: 'Lamina propria veya muskularis mukoza invazyonu' },
    { code: 'T1b', label: 'T1b', criterion: 'Submukoza invazyonu' },
    { code: 'T2', label: 'T2', criterion: 'Muskularis propria invazyonu' },
    { code: 'T3', label: 'T3', criterion: 'Adventisya invazyonu' },
    { code: 'T4a', label: 'T4a', criterion: 'Rezekabl komşu organ invazyonu (plevra, perikard, diyafram)' },
    { code: 'T4b', label: 'T4b', criterion: 'İnrezekabl komşu organ invazyonu (aort, trakea, vertebra)' },
  ],
  N: [
    { code: 'N0', label: 'N0', criterion: 'Bölgesel lenf nodu metastazı yok' },
    { code: 'N1', label: 'N1', criterion: '1-2 bölgesel lenf nodu' },
    { code: 'N2', label: 'N2', criterion: '3-6 bölgesel lenf nodu' },
    { code: 'N3', label: 'N3', criterion: '≥7 bölgesel lenf nodu' },
  ],
  M: [{ code: 'M0', label: 'M0', criterion: 'Uzak metastaz yok' }, { code: 'M1', label: 'M1', criterion: 'Uzak metastaz mevcut' }],
};
TNM_DATABASE['gis-Pankreas'] = {
  T: [
    { code: 'T1', label: 'T1', criterion: 'Tümör ≤2 cm (pankreasa sınırlı)' },
    { code: 'T2', label: 'T2', criterion: 'Tümör >2 cm ama ≤4 cm' },
    { code: 'T3', label: 'T3', criterion: 'Tümör >4 cm (çölyak aks veya SMA tutulumu yok)' },
    { code: 'T4', label: 'T4', criterion: 'Çölyak aks, SMA veya ana hepatik arter tutulumu (inrezekabl lokal ileri)' },
  ],
  N: [{ code: 'N0', label: 'N0', criterion: 'Bölgesel LN metastazı yok' }, { code: 'N1', label: 'N1', criterion: '1-3 bölgesel LN' }, { code: 'N2', label: 'N2', criterion: '≥4 bölgesel LN' }],
  M: [{ code: 'M0', label: 'M0', criterion: 'Uzak metastaz yok' }, { code: 'M1', label: 'M1', criterion: 'Uzak metastaz mevcut' }],
};
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
    { code: 'T1a', label: 'T1a', criterion: 'Tumour ≤4 cm, limited to the kidney.' },
    { code: 'T1b', label: 'T1b', criterion: 'Tumour >4 cm and ≤7 cm, limited to the kidney.' },
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
    { code: 'Grade-1', label: 'WHO Grade 1', criterion: 'Pilositik astrositom veya düşük dereceli circumscribed gliom' },
    { code: 'Grade-2', label: 'WHO Grade 2', criterion: 'Düşük dereceli diffüz astrositom veya oligodendrogliom' },
    { code: 'Grade-3', label: 'WHO Grade 3', criterion: 'Anaplastik astrositom veya anaplastik oligodendrogliom' },
    { code: 'Grade-4', label: 'WHO Grade 4', criterion: 'Glioblastom veya diğer yüksek dereceli diffüz gliom' },
  ],
  N: [{ code: 'N0', label: 'N0', criterion: 'Beyin parankiminde bölgesel lenf nodu evrelemesi uygulanmaz' }],
  M: [
    { code: 'M0', label: 'M0', criterion: 'Uzak metastaz saptanmadı' },
    { code: 'M1', label: 'M1', criterion: 'Leptomeningeal veya uzak ekstrakraniyal yayılım' },
  ],
};
TNM_DATABASE['gynecology-ovary'] = {
  T: [
    { code: 'FIGO-I', label: 'FIGO I', criterion: 'Tümör over/fallop tüpü ile sınırlı' },
    { code: 'FIGO-II', label: 'FIGO II', criterion: 'Pelvise uzanım veya primer peritoneal yayılım' },
    { code: 'FIGO-III', label: 'FIGO III', criterion: 'Ekstrapelvik peritoneal yayılım ve/veya retroperitoneal nod' },
    { code: 'FIGO-IV', label: 'FIGO IV', criterion: 'Uzak metastaz veya malign plevral efüzyon' },
  ],
  N: [
    { code: 'N0', label: 'N0', criterion: 'Retroperitoneal lenf nodu metastazı yok' },
    { code: 'N1', label: 'N1', criterion: 'Retroperitoneal lenf nodu metastazı mevcut' },
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


type EvidenceReference = {
  label: string;
  url: string;
};

export const LUNG_SBRT_EVIDENCE_LINKS: EvidenceLink[] = [
  {
    authority: 'NCCN',
    title: 'NCCN Non-Small Cell Lung Cancer Guidelines (v1.2025 - Principles of Radiation Therapy, p.77)',
    url: 'https://www.nccn.org/professionals/physician_gls/pdf/nscl.pdf#page=77',
    category: 'Kategori 1',
  },
  {
    authority: 'ASTRO',
    title: 'ASTRO Clinical Practice Guideline on SBRT for Early-Stage NSCLC',
    url: 'https://www.astro.org/provider-resources/guidelines/astro-s-guideline-on-sbrt-for-early-stage-nsclc',
    category: 'Consensus Guideline',
  },
  {
    authority: 'ESTRO',
    title: 'ESTRO-ACROP Consensus Recommendations on SBRT for Early-Stage Lung Cancer',
    url: 'https://doi.org/10.1016/j.radonc.2017.05.012',
    category: 'Consensus Guideline',
  },
  {
    authority: 'RTOG',
    title: 'RTOG 0236: Landmark JAMA 2010 Publication (SBRT for Early-Stage NSCLC)',
    url: 'https://doi.org/10.1001/jama.2010.261',
    category: 'Phase II Landmark',
  },
];

export const LUNG_SBRT_0915_EVIDENCE_LINKS: EvidenceLink[] = [
  {
    authority: 'NCCN',
    title: 'NCCN Non-Small Cell Lung Cancer Guidelines (v1.2025 - Principles of Radiation Therapy, p.77)',
    url: 'https://www.nccn.org/professionals/physician_gls/pdf/nscl.pdf#page=77',
    category: 'Kategori 1',
  },
  {
    authority: 'ASTRO',
    title: 'ASTRO Clinical Practice Guideline on SBRT for Early-Stage NSCLC',
    url: 'https://www.astro.org/provider-resources/guidelines/astro-s-guideline-on-sbrt-for-early-stage-nsclc',
    category: 'Consensus Guideline',
  },
  {
    authority: 'ESTRO',
    title: 'ESTRO-ACROP Consensus Recommendations on SBRT for Early-Stage Lung Cancer',
    url: 'https://doi.org/10.1016/j.radonc.2017.05.012',
    category: 'Consensus Guideline',
  },
  {
    authority: 'RTOG',
    title: 'RTOG 0915 trial protocol / reference',
    url: 'https://www.nrgoncology.org/clinical-trials/rtog-0915',
    category: 'Phase II Protocol',
  },
];

export const LUNG_SBRT_0813_EVIDENCE_LINKS: EvidenceLink[] = [
  {
    authority: 'NCCN',
    title: 'NCCN Non-Small Cell Lung Cancer Guidelines (v1.2025 - Principles of Radiation Therapy, p.77)',
    url: 'https://www.nccn.org/professionals/physician_gls/pdf/nscl.pdf#page=77',
    category: 'Kategori 1',
  },
  {
    authority: 'ASTRO',
    title: 'ASTRO Clinical Practice Guideline on SBRT for Early-Stage NSCLC',
    url: 'https://www.astro.org/provider-resources/guidelines/astro-s-guideline-on-sbrt-for-early-stage-nsclc',
    category: 'Consensus Guideline',
  },
  {
    authority: 'ESTRO',
    title: 'ESTRO-ACROP Consensus Recommendations on SBRT for Early-Stage Lung Cancer',
    url: 'https://doi.org/10.1016/j.radonc.2017.05.012',
    category: 'Consensus Guideline',
  },
  {
    authority: 'RTOG',
    title: 'RTOG 0813 trial protocol / reference',
    url: 'https://www.nrgoncology.org/clinical-trials/rtog-0813',
    category: 'Phase I/II Protocol',
  },
];

export const LUNG_HYPO_EVIDENCE_LINKS: EvidenceLink[] = [
  {
    authority: 'NCCN',
    title: 'NCCN Non-Small Cell Lung Cancer Guidelines (v1.2025 - Principles of Radiation Therapy, p.77)',
    url: 'https://www.nccn.org/professionals/physician_gls/pdf/nscl.pdf#page=77',
    category: 'Kategori 1',
  },
  {
    authority: 'ESTRO',
    title: 'ESTRO-ACROP Consensus Recommendations on Lung Radiotherapy',
    url: 'https://doi.org/10.1016/j.radonc.2017.05.012',
    category: 'Consensus Guideline',
  },
  {
    authority: 'ASTRO',
    title: 'ASTRO Clinical Practice Guideline on SBRT for Early-Stage NSCLC',
    url: 'https://www.astro.org/provider-resources/guidelines/astro-s-guideline-on-sbrt-for-early-stage-nsclc',
    category: 'Consensus Guideline',
  },
];

export const LUNG_CONV_0617_EVIDENCE_LINKS: EvidenceLink[] = [
  {
    authority: 'NCCN',
    title: 'NCCN Non-Small Cell Lung Cancer Guidelines (v1.2025 - Principles of Radiation Therapy, p.77)',
    url: 'https://www.nccn.org/professionals/physician_gls/pdf/nscl.pdf#page=77',
    category: 'Kategori 1',
  },
  {
    authority: 'RTOG',
    title: 'RTOG 0617: High-Dose vs Standard-Dose CRT (Lancet Oncol 2015)',
    url: 'https://doi.org/10.1016/S1470-2045(14)71207-0',
    category: 'Phase III Landmark',
  },
  {
    authority: 'ASTRO',
    title: 'ASTRO Clinical Practice Guidelines on Thoracic Radiotherapy',
    url: 'https://www.astro.org/provider-resources/guidelines',
    category: 'Consensus Guideline',
  },
  {
    authority: 'ESTRO',
    title: 'ESTRO-ACROP Consensus Recommendations on Lung Radiotherapy',
    url: 'https://doi.org/10.1016/j.radonc.2017.05.012',
    category: 'Consensus Guideline',
  },
];

const getLungSbrtTargets = (doseGy: number, breathingMotion: string): TargetVolume[] =>
  breathingMotion === 'DIBH'
    ? [
        { name: 'GTV', doseGy, marginMm: '0 mm', anatomical: "Derin inspiryum BT'deki primer parankimal kitle" },
        { name: 'ITV_DIBH', doseGy, marginMm: 'GTV->ITV: DIBH / gating ile artık solunum hareketini doğrulayın', anatomical: 'Hareket yönetimi ve 4D-CT doğrulamasına göre' },
        { name: 'PTV_SBRT', doseGy, marginMm: 'ITV->PTV +3 mm (DIBH / gating)', anatomical: 'Günlük IGRT ve set-up güvenlik marjini' },
      ]
    : [
        { name: 'GTV', doseGy, marginMm: '0 mm', anatomical: 'Parankimal primer kitle (BT/PET füzyonu)' },
        { name: 'ITV_4D', doseGy, marginMm: 'GTV->ITV: 4D-CT solunum hareket zarfı', anatomical: 'Tümörün solunum siklusu boyunca kat ettiği hareket hacmi (MIP)' },
        { name: 'PTV_SBRT', doseGy, marginMm: 'ITV->PTV +5 mm', anatomical: 'Günlük IGRT ve set-up güvenlik marjini' },
      ];

const AUTHORITY_STYLES: Record<EvidenceLink['authority'], {
  button: string;
  badge: string;
}> = {
  NCCN: {
    button: 'border-cyan-500/50 bg-cyan-950/40 text-cyan-200 hover:bg-cyan-900/60 hover:border-cyan-400 hover:text-cyan-100 focus-visible:ring-cyan-400',
    badge: 'bg-cyan-400/20 text-cyan-300 border border-cyan-400/30',
  },
  ASTRO: {
    button: 'border-indigo-500/50 bg-indigo-950/40 text-indigo-200 hover:bg-indigo-900/60 hover:border-indigo-400 hover:text-indigo-100 focus-visible:ring-indigo-400',
    badge: 'bg-indigo-400/20 text-indigo-300 border border-indigo-400/30',
  },
  ESTRO: {
    button: 'border-emerald-500/50 bg-emerald-950/40 text-emerald-200 hover:bg-emerald-900/60 hover:border-emerald-400 hover:text-emerald-100 focus-visible:ring-emerald-400',
    badge: 'bg-emerald-400/20 text-emerald-300 border border-emerald-400/30',
  },
  RTOG: {
    button: 'border-amber-500/50 bg-amber-950/40 text-amber-200 hover:bg-amber-900/60 hover:border-amber-400 hover:text-amber-100 focus-visible:ring-amber-400',
    badge: 'bg-amber-400/20 text-amber-300 border border-amber-400/30',
  },
  NRG: {
    button: 'border-amber-500/50 bg-amber-950/40 text-amber-200 hover:bg-amber-900/60 hover:border-amber-400 hover:text-amber-100 focus-visible:ring-amber-400',
    badge: 'bg-amber-400/20 text-amber-300 border border-amber-400/30',
  },
};

const formatBadgeLabel = (link: EvidenceLink): string => {
  if (link.authority === 'RTOG') {
    if (link.title.includes('0236') || link.url.includes('jama.2010.261') || link.url.includes('rtog-0236')) return 'RTOG 0236';
    if (link.title.includes('0617') || link.url.includes('S1470-2045(14)71207-0') || link.url.includes('rtog-0617')) return 'RTOG 0617';
    if (link.title.includes('0813') || link.url.includes('rtog-0813')) return 'RTOG 0813';
    if (link.title.includes('0915') || link.url.includes('rtog-0915')) return 'RTOG 0915';
    const trialMatch = link.title.match(/RTOG\s*(\d{4})/i) || link.url.match(/rtog-(\d{4})/i);
    if (trialMatch) return `RTOG ${trialMatch[1]}`;
    return 'RTOG';
  }
  if (link.authority === 'NRG') {
    const trialMatch = link.title.match(/NRG[- ]?([A-Z0-9]+)/i);
    if (trialMatch) return `NRG ${trialMatch[1]}`;
    return 'NRG';
  }
  return link.authority;
};

const evidenceLinkTokens = /(FAST[-\s]?Forward|PACIFIC|RAPIDO|STAMPEDE|PORTEC-3|NCCN|ASTRO|ESTRO|RTOG\s*\d*|NRG\s*[A-Z0-9]*|QUANTEC|DEGRO|ILROG|ESMO|EANO|FIGO|DOI:\s*10\.\d{4,9}\/[^\s;,]+)/gi;

const resolveEvidenceUrl = (token: string, clinicalContext = ''): string | undefined => {
  if (/FAST[-\s]?Forward/i.test(token)) return 'https://doi.org/10.1016/S0140-6736(20)30932-6';
  if (/PACIFIC/i.test(token)) return 'https://doi.org/10.1056/NEJMoa1709937';
  if (/RAPIDO/i.test(token)) return 'https://doi.org/10.1016/S1470-2045(20)30555-6';
  if (/STAMPEDE/i.test(token)) return 'https://doi.org/10.1016/S1470-2045(18)30524-1';
  if (/PORTEC-3/i.test(token)) return 'https://doi.org/10.1016/S1470-2045(18)30079-2';
  if (/NCCN/i.test(token)) {
    return /lung|khdak|nsclc/i.test(clinicalContext)
      ? 'https://www.nccn.org/professionals/physician_gls/pdf/nscl.pdf#page=77'
      : 'https://www.nccn.org/guidelines';
  }
  if (/ASTRO/i.test(token)) {
    return /breast|meme|whole breast/i.test(clinicalContext)
      ? 'https://www.practicalradonc.org/article/S1879-8500(18)30116-6/fulltext'
      : /lung|khdak|nsclc|sbrt/i.test(clinicalContext)
        ? 'https://www.astro.org/provider-resources/guidelines/astro-s-guideline-on-sbrt-for-early-stage-nsclc'
        : 'https://www.astro.org/provider-resources/guidelines';
  }
  if (/ESTRO/i.test(token)) {
    return /lung|khdak|nsclc|sbrt/i.test(clinicalContext)
      ? 'https://doi.org/10.1016/j.radonc.2017.05.012'
      : 'https://www.estro.org/Science/Guidelines';
  }
  if (/RTOG\s*0236/i.test(token) || (/RTOG/i.test(token) && /0236/i.test(clinicalContext))) {
    return 'https://doi.org/10.1001/jama.2010.261';
  }
  if (/RTOG\s*0617/i.test(token) || (/RTOG/i.test(token) && /0617/i.test(clinicalContext))) {
    return 'https://doi.org/10.1016/S1470-2045(14)71207-0';
  }
  if (/RTOG\s*0813/i.test(token) || (/RTOG/i.test(token) && /0813/i.test(clinicalContext))) {
    return 'https://www.nrgoncology.org/clinical-trials/rtog-0813';
  }
  if (/RTOG\s*0915/i.test(token) || (/RTOG/i.test(token) && /0915/i.test(clinicalContext))) {
    return 'https://www.nrgoncology.org/clinical-trials/rtog-0915';
  }
  if (/RTOG/i.test(token)) return 'https://www.nrgoncology.org/';
  if (/NRG/i.test(token)) return 'https://www.nrgoncology.org/';
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
          : /ASTRO/i.test(token) && /lung|khdak|nsclc|sbrt/i.test(evidence)
            ? 'ASTRO SBRT Guideline for Early-Stage NSCLC'
            : /ESTRO/i.test(token) && /lung|khdak|nsclc|sbrt/i.test(evidence)
              ? 'ESTRO-ACROP SBRT Consensus Recommendations'
              : /RTOG\s*0236/i.test(token) || (/RTOG/i.test(token) && /0236/i.test(evidence))
                ? 'RTOG 0236 (NRG Oncology)'
                : /RTOG\s*0813/i.test(token) || (/RTOG/i.test(token) && /0813/i.test(evidence))
                  ? 'RTOG 0813 (NRG Oncology)'
                  : /RTOG\s*0915/i.test(token) || (/RTOG/i.test(token) && /0915/i.test(evidence))
                    ? 'RTOG 0915 (NRG Oncology)'
                    : token,
      url,
    });
  }

  return references;
};

const resolveSchemeEvidenceLinks = (
  scheme: DoseScheme,
  organ: OrganId,
  subtype: string,
  thoraxCentrality: string,
  evidenceReferences: EvidenceReference[],
  isSclcTurrisi: boolean,
): EvidenceLink[] => {
  if (scheme.evidenceObj) {
    const objLinks: EvidenceLink[] = [];
    if (scheme.evidenceObj.nccn) {
      objLinks.push({
        authority: 'NCCN',
        title: `NCCN ${scheme.evidenceObj.nccn.sectionCode} (${scheme.evidenceObj.nccn.sectionTitle})`,
        url: `${scheme.evidenceObj.nccn.pdfUrl}#page=${scheme.evidenceObj.nccn.targetPage}`,
        category: 'NCCN Guideline',
        customBadge: `NCCN · ${scheme.evidenceObj.nccn.sectionCode} (p. ${scheme.evidenceObj.nccn.targetPage})`,
      });
    }
    if (scheme.evidenceObj.astro) {
      objLinks.push({
        authority: 'ASTRO',
        title: scheme.evidenceObj.astro.title,
        url: scheme.evidenceObj.astro.url,
        category: 'ASTRO Guideline',
        customBadge: 'ASTRO · Practice Guideline',
      });
    }
    if (scheme.evidenceObj.estro) {
      objLinks.push({
        authority: 'ESTRO',
        title: scheme.evidenceObj.estro.title,
        url: scheme.evidenceObj.estro.url,
        category: 'ESTRO Consensus',
        customBadge: 'ESTRO · Consensus',
      });
    }
    if (scheme.evidenceObj.landmarkTrial) {
      objLinks.push({
        authority: 'RTOG',
        title: `${scheme.evidenceObj.landmarkTrial.shortName}: ${scheme.evidenceObj.landmarkTrial.citation}`,
        url: scheme.evidenceObj.landmarkTrial.doiUrl,
        category: 'Landmark Trial',
        customBadge: `${scheme.evidenceObj.landmarkTrial.shortName} · ${scheme.evidenceObj.landmarkTrial.citation}`,
      });
    }
    return objLinks;
  }

  if (scheme.evidenceLinks && scheme.evidenceLinks.length > 0) {
    return scheme.evidenceLinks;
  }

  // Lung SBRT schemes fallback
  if (scheme.id.includes('lung-sbrt') || (organ === 'thorax' && /sbrt/i.test(scheme.name))) {
    if (thoraxCentrality === 'Central' || scheme.id.includes('50')) {
      return [
        {
          authority: 'NCCN',
          title: 'NCCN Non-Small Cell Lung Cancer Guidelines (v1.2025 - Principles of Radiation Therapy, p.77)',
          url: 'https://www.nccn.org/professionals/physician_gls/pdf/nscl.pdf#page=77',
          category: 'Kategori 1',
        },
        {
          authority: 'ASTRO',
          title: 'ASTRO Clinical Practice Guideline on SBRT for Early-Stage NSCLC',
          url: 'https://www.astro.org/provider-resources/guidelines/astro-s-guideline-on-sbrt-for-early-stage-nsclc',
          category: 'Consensus Guideline',
        },
        {
          authority: 'ESTRO',
          title: 'ESTRO-ACROP Consensus Recommendations on SBRT for Early-Stage Lung Cancer',
          url: 'https://doi.org/10.1016/j.radonc.2017.05.012',
          category: 'Consensus Guideline',
        },
        {
          authority: 'RTOG',
          title: 'RTOG 0813 trial protocol / reference',
          url: 'https://www.nrgoncology.org/clinical-trials/rtog-0813',
          category: 'Phase I/II Protocol',
        },
      ];
    }
    return LUNG_SBRT_EVIDENCE_LINKS;
  }

  const links: EvidenceLink[] = [];
  const seenUrls = new Set<string>();

  for (const ref of evidenceReferences) {
    if (!ref.url || seenUrls.has(ref.url)) continue;
    seenUrls.add(ref.url);

    let authority: EvidenceLink['authority'] = 'NCCN';
    let category: string | undefined;

    if (/ASTRO/i.test(ref.label) || /ASTRO/i.test(ref.url)) {
      authority = 'ASTRO';
      category = 'Clinical Guideline';
    } else if (/ESTRO/i.test(ref.label) || /ESTRO/i.test(ref.url)) {
      authority = 'ESTRO';
      category = 'Consensus Guideline';
    } else if (/RTOG/i.test(ref.label) || /0236|0813|0617|0521|0415|0630|9501|9802|0915/i.test(ref.label)) {
      authority = 'RTOG';
      category = 'Trial Protocol';
    } else if (/NRG/i.test(ref.label) || /CC001/i.test(ref.label)) {
      authority = 'NRG';
      category = 'Trial Protocol';
    } else if (/NCCN/i.test(ref.label) || /NCCN/i.test(ref.url)) {
      authority = 'NCCN';
      category = /Kategori\s*1/i.test(scheme.evidence) ? 'Kategori 1' : 'Guideline';
    }

    links.push({
      authority,
      title: ref.label,
      url: ref.url,
      category,
    });
  }

  if (isSclcTurrisi && !seenUrls.has('https://doi.org/10.1056/NEJM199901283400403')) {
    links.push({
      authority: 'NCCN',
      title: 'Turrisi et al. · NEJM 1999 (BID SCLC Protocol)',
      url: 'https://doi.org/10.1056/NEJM199901283400403',
      category: 'Phase III Landmark',
    });
  }

  if (links.length === 0) {
    const nccnTarget = NCCN_GUIDELINE_MAP[`${organ}-${subtype}`]
      || NCCN_GUIDELINE_MAP[organ]
      || { url: 'https://www.nccn.org/guidelines', title: 'NCCN Guidelines' };
    links.push({
      authority: 'NCCN',
      title: nccnTarget.title,
      url: nccnTarget.url,
      category: 'Kılavuz',
    });
  }

  return links;
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
    // Robust dictionary lookup pattern (deprecating regex matching)
    return TRANSLATION_MAP[text] ?? text;
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
  // 1. TORAKS ALT BAŞLIKLARI VE RİSK FAKTÖRLERİ
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
  // 2. GÜS / PROSTAT ALT BAŞLIKLARI
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
  const [gisOrgan, setGisOrgan] = useState<'Rektum' | 'Mide' | 'Ozofagus' | 'Pankreas' | 'Anal' | 'Karaciger' | 'SafraYollari'>('Rektum');
  const [liverHistology, setLiverHistology] = useState<'hcc' | 'colorectal-metastasis'>('hcc');
  const [liverBclcStage, setLiverBclcStage] = useState<'0' | 'A' | 'B' | 'C'>('A');
  const [biliaryHistology, setBiliaryHistology] = useState<'intrahepatic' | 'perihilar' | 'extrahepatic' | 'gallbladder'>('intrahepatic');
  const [biliaryTreatmentSetting, setBiliaryTreatmentSetting] = useState<'adjuvant' | 'unresectable'>('adjuvant');
  const [biliaryMarginStatus, setBiliaryMarginStatus] = useState<'R0' | 'R1'>('R0');
  const [gisCrmStatus, setGisCrmStatus] = useState<'Negatif' | 'Pozitif'>('Negatif');

  // ==========================================
  // 5. BAŞ-BOYUN ALT BAŞLIKLARI
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
  // 6. MSS / BEYİN ALT BAŞLIKLARI
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
  const [sarcomaSubtype, setSarcomaSubtype] = useState<'Yumusak_Doku' | 'Osteosarkom' | 'Ewing' | 'Kondrosarkom' | 'Kordoma' | 'GCTB' | 'DFSP' | 'Rhabdomyosarkom'>('Yumusak_Doku');
  const [dfspStatus, setDfspStatus] = useState<'R0' | 'R1' | 'Unresectable'>('R1');
  const [sarcomaSurgery, setSarcomaSurgery] = useState<'Preop' | 'Postop_R0' | 'Postop_R1'>('Preop');
  const [osteoScenario, setOsteoScenario] = useState<'Marjin_Pozitif_R1_R2' | 'Inoperabl_Aksiyel_Pelvis' | 'Cerrahi_R0_Takip'>('Marjin_Pozitif_R1_R2');
  const [ewingIntent, setEwingIntent] = useState<'Definitif_RT' | 'Postop_R1'>('Definitif_RT');
  const [stsHistology, setStsHistology] = useState<'ups' | 'liposarcoma' | 'leiomyosarcoma' | 'synovial'>('ups');

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
  const [hematologicSubtype, setHematologicSubtype] = useState<'Hodgkin' | 'DLBCL' | 'Foliküler' | 'Plasmacytoma' | 'Myeloma' | 'ALL' | 'CLL'>('Hodgkin');
  const [lymphomaResponse, setLymphomaResponse] = useState<'Tam_Yanit' | 'Parsiyel_Rezidü'>('Tam_Yanit');
  const [myelomaFractionation, setMyelomaFractionation] = useState<'TekFx' | '20Gy' | '30Gy'>('TekFx');

  // ==========================================
  // 11. PEDİATRİK & 12. PALYATİF
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
        storageError = 'Favoriler yüklenemedi; tarayıcı depolama alanını kontrol edin.';
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
        storageError = 'Vaka arşivi yüklenemedi; tarayıcı depolama alanını kontrol edin.';
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
          storageError = 'Özel favoriler yüklenemedi; tarayıcı depolama alanını kontrol edin.';
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
      setResearchExportNotice('Favoriler kaydedilemedi; tarayıcı depolama alanını kontrol edin.');
      return;
    }
    setFavoritePresetIds(next);
  };

    const saveCurrentCaseToFavorites = (label?: string) => {
      const customCase: CustomFavoriteCase = {
            id: `custom-${crypto.randomUUID()}`,
        label: label?.trim() || `Özel Vaka ${new Date().toLocaleString('tr-TR')}`,
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
        setResearchExportNotice('Özel vaka kaydedilemedi; tarayıcı depolama alanını kontrol edin.');
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
      setResearchExportNotice(`"${fav.label}" yüklendi.`);
    };

    const removeCustomFavorite = (id: string) => {
      const next = customFavorites.filter(f => f.id !== id);
      try {
        window.localStorage.setItem('radonco_custom_favorites', JSON.stringify(next));
      } catch (error) {
        console.error('Custom favorite could not be removed from browser storage.', error);
        setResearchExportNotice('Favori silinemedi; tarayıcı depolama alanını kontrol edin.');
        return;
      }
      setCustomFavorites(next);
    };
  const [selectedSchemeId, setSelectedSchemeId] = useState<string>('');
  const [selectedRegimen, setSelectedRegimen] = useState<QuickCaseRegimen>('moderate_hypo');
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

  // Dinamik TNM Anahtarı
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
      if (breastHistology === 'Malign Filloides Tümörü') return 'breast-phyllodes';
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
    if (hasSVI || selectedT === 'T4' || primary === 5 || (selectedT === 'T3b' && (score >= 8 || psa > 20))) return 'Çok Yüksek';
    if (score >= 8 || psa > 20 || selectedT === 'T3a' || selectedT === 'T3b' || hasECE) return 'Yüksek';
    const intermediateFactors = Number(selectedT === 'T2b' || selectedT === 'T2c') + Number(score === 7) + Number(psa >= 10 && psa <= 20);
    if (intermediateFactors === 0) return 'Düşük';
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

  // Organ Değişimi
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
    if (newOrgan === 'breast') key = breastHistology === 'Duktal Karsinoma In Situ (DCIS)' ? 'breast-dcis' : breastHistology === 'Malign Filloides Tümörü' ? 'breast-phyllodes' : 'breast-breast';
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

  // Alt Başlık Değişimi
  const handleSubsiteChange = (subKey: string) => {
    const [organ, subtype] = subKey.split('-');
    // Alt başlığın hangi ana organa ait olduğunu tespit edip selectedOrgan'ı senkronize et.
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
  // EVRENSEL PATOLOJİK HİSTOLOJİ / ALT TİP MATRİSİ
  // ==========================================
  const BONE_HISTOLOGY_VALUES = ['Osteosarkom', 'Ewing', 'Kondrosarkom', 'Kordoma', 'GCTB'] as const;

  const currentHistologies: { id: string; name: string }[] = (() => {
    if (selectedOrgan === 'prostate') {
      if (gusSubtype === 'kidney') return [
        { id: 'renal-clear-cell', name: lang === 'tr' ? 'Şeffaf Hücreli RCC' : 'Clear-cell RCC' },
        { id: 'renal-papillary', name: lang === 'tr' ? 'Papiller RCC' : 'Papillary RCC' },
        { id: 'renal-chromophobe', name: lang === 'tr' ? 'Kromofob RCC' : 'Chromophobe RCC' },
      ];
      if (gusSubtype === 'prostate') return [
        { id: 'prostate-acinar', name: 'Asiner Adenokarsinom (Klasik)' },
        { id: 'prostate-ductal', name: 'Duktal Karsinom (Agresif)' },
        { id: 'prostate-nepc', name: 'Nöroendokrin / Küçük Hücreli (NEPC)' },
      ];
      if (gusSubtype === 'testis') return [
        { id: 'testis-seminoma', name: 'Seminom (Radyoduyarlı - Paraaortik RT Endike)' },
        { id: 'testis-nonseminoma', name: 'Non-Seminom (RT Genellikle Endike Değil)' },
      ];
      if (gusSubtype === 'bladder') return [
        { id: 'bladder-urothelial', name: 'Ürotelyal Karsinom (TCC - Trimodalite KRT)' },
        { id: 'bladder-non-urothelial', name: 'Skuamöz / Adenokarsinom' },
      ];
      return [];
    }
    if (selectedOrgan === 'gis' && gisOrgan === 'Karaciger') return [
      { id: 'liver-hcc', name: lang === 'tr' ? 'Hepatosellüler Karsinom (HCC)' : 'Hepatocellular Carcinoma (HCC)' },
      { id: 'liver-colorectal-metastasis', name: lang === 'tr' ? 'Kolorektal Karaciğer Metastazı' : 'Colorectal Liver Metastasis' },
    ];
    if (selectedOrgan === 'gis' && gisOrgan === 'SafraYollari') return [
      { id: 'biliary-intrahepatic', name: lang === 'tr' ? 'İntrahepatik Kolanjiyokarsinom' : 'Intrahepatic Cholangiocarcinoma' },
      { id: 'biliary-perihilar', name: lang === 'tr' ? 'Perihiler Kolanjiyokarsinom (Klatskin)' : 'Perihilar Cholangiocarcinoma (Klatskin)' },
      { id: 'biliary-extrahepatic', name: lang === 'tr' ? 'Distal / Ekstrahepatik Kolanjiyokarsinom' : 'Distal / Extrahepatic Cholangiocarcinoma' },
      { id: 'biliary-gallbladder', name: lang === 'tr' ? 'Safra Kesesi Kanseri' : 'Gallbladder Cancer' },
    ];
    if (selectedOrgan === 'thorax') {
      if (thoraxSubtype === 'nsclc') return [
        { id: 'nsclc-adenocarcinoma', name: 'Adenokarsinom' },
        { id: 'nsclc-squamous', name: 'Skuamöz Hücreli Karsinom' },
        { id: 'nsclc-lcnec', name: 'Büyük Hücreli Nöroendokrin (LCNEC)' },
      ];
      if (thoraxSubtype === 'thymoma') return [
        { id: 'thymoma', name: 'Timoma (WHO Tip A, AB, B1, B2, B3)' },
        { id: 'thymic-carcinoma', name: 'Timik Karsinom (Tip C / Agresif)' },
      ];
      return [];
    }
    if (selectedOrgan === 'breast') return [
      { id: 'breast-nst', name: 'İnvaziv Duktal Karsinom (NST)' },
      { id: 'breast-ilc', name: 'İnvaziv Lobüler Karsinom (İLK)' },
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
      { id: 'skin-SCC', name: 'Skuamöz Hücreli (cSCC)' },
      { id: 'skin-BCC', name: 'Bazal Hücreli (BCC)' },
      { id: 'skin-Melanom', name: 'Kutanöz Melanom' },
      { id: 'skin-Merkel', name: 'Merkel Hücreli (MCC)' },
    ];
    if (selectedOrgan === 'hematologic') return [
      { id: 'heme-Hodgkin', name: 'Hodgkin Lenfoma' },
      { id: 'heme-DLBCL', name: 'DLBCL' },
      { id: 'heme-Foliküler', name: 'Foliküler Lenfoma' },
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
      if (breastHistology === 'İnvaziv Duktal Karsinom (İDK)') return 'breast-nst';
      if (breastHistology === 'İnvaziv Lobüler Karsinom (İLK)') return 'breast-ilc';
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
        ? 'İnvaziv Lobüler Karsinom (İLK)'
        : id === 'breast-tnbc'
          ? 'Triple Negatif Meme Kanseri (TNBC)'
          : id === 'breast-metaplastic'
            ? 'Metaplastik Karsinom'
            : 'İnvaziv Duktal Karsinom (İDK)';
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
      prostate: lang === 'tr' ? 'GÜS' : 'Genitourinary',
      breast: lang === 'tr' ? 'Meme' : 'Breast',
      gis: lang === 'tr' ? 'GİS' : 'Gastrointestinal',
      'head-neck': lang === 'tr' ? 'Baş-Boyun' : 'Head & Neck',
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
      .replace(/ı/g, 'i')
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
        title: lang === 'tr' ? 'Klinik Kaynakça ve Kanıt Atlası' : 'Clinical References & Evidence Atlas',
        subtitle: '/references',
        searchText: normalize('references bibliography evidence atlas kaynakca kanit'),
        destination: 'references',
      },
      {
        id: 'page-contact',
        kind: 'page',
        title: lang === 'tr' ? 'İletişim ve Protokol Katkısı' : 'Contact & Protocol Contribution',
        subtitle: lang === 'tr' ? 'E-posta ile iletişim' : 'Contact by email',
        searchText: normalize('contact iletişim protocol contribution katkı'),
        destination: 'contact',
      },
      {
        id: 'page-guidelines',
        kind: 'page',
        title: lang === 'tr' ? 'Kılavuz İlkeleri' : 'Guideline Principles',
        subtitle: lang === 'tr' ? 'Kılavuz ve kanıt penceresini aç' : 'Open the guidelines and evidence dialog',
        searchText: normalize('guidelines guideline principles kılavuz ilkeleri'),
        destination: 'guidelines',
      },
    ];
    const query = normalize(searchQuery.trim());
    const filter = (items: CommandPaletteItem[]) => items
      .filter(item => !query || item.searchText.includes(query))
      .slice(0, query ? 10 : 6);

    return [
      { id: 'tumors', title: lang === 'tr' ? '🎯 Tümörler ve Alt Başlıklar' : '🎯 Tumors & Subsites', items: filter(organItems) },
      { id: 'protocols', title: lang === 'tr' ? '⚡ Protokoller ve Çalışmalar' : '⚡ Protocols & Studies', items: filter(protocolItems) },
      { id: 'pages', title: lang === 'tr' ? '📚 Sayfalar ve Kısayollar' : '📚 Pages & Shortcuts', items: filter(pageItems) },
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
        setBreastHistology('Duktal Karsinoma İn Situ (DCIS)');
      } else if (item.histologyId === 'breast-phyllodes') {
        setBreastHistology('Malign Filloides Tümörü');
      } else if (item.histologyId === 'breast-inflammatory') {
        setBreastHistology('İnflamatuar Meme Kanseri (IBC)');
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
      if (selectedOrgan === 'breast' && breastHistology === 'İnflamatuar Meme Kanseri (IBC)') {
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
      } else if (selectedSubsite === 'benign-gynecomastia') {
        const symptomatic = benignClinicalStatus === 'symptomatic';
        primaryScheme = makeScheme(
          'benign-gynecomastia-12',
          symptomatic ? '12 Gy / 3 fx (Yerleşik Ağrılı Jinekomasti)' : '10 Gy / 1 fx (Jinekomasti Profilaksisi)',
          symptomatic ? 12 : 10,
          symptomatic ? 3 : 1,
          symptomatic ? 4 : 10,
          '6-9 MeV elektron; bilateral meme başına bolus',
          'Prostat kanseri antiandrojen tedavisi öncesi ağrı ve meme büyümesini azaltma; bilateral meme başı ve glandüler doku hedeflenir.',
          'Bilateral meme başı / glandüler meme dokusu',
          [{ organ: 'Kalp ve akciğer', metric: 'Doz', limit: 'Minimal doz', source: 'Benign RT konsensüsü' }],
        );
        alternativeSchemes = [primaryScheme];
        statusText = 'ENDİKE: JİNEKOMASTİ PROFİLAKSİSİ / SEMPTOM KONTROLÜ';
        targetVolumeBadge = 'Hedef: Bilateral Meme Başları';
        techniqueBadge = 'Teknik: 6-9 MeV Elektron + Bolus';
      } else if (selectedSubsite === 'benign-pituitary') {
        const fractionated = benignClinicalStatus === 'chiasm-close';
        const functional = benignClinicalStatus === 'functional';
        primaryScheme = makeScheme(
          fractionated ? 'benign-pituitary-fsrt' : 'benign-pituitary-srs',
          fractionated ? '45-50.4 Gy / 25-28 fx (Kiazma Komşu Fraksiyone SRT)' : `${functional ? 22 : 13} Gy / 1 fx (${functional ? 'Fonksiyonel' : 'Non-fonksiyonel'} Adenom SRS)`,
          fractionated ? 50.4 : functional ? 22 : 13,
          fractionated ? 28 : 1,
          fractionated ? 1.8 : functional ? 22 : 13,
          fractionated ? 'Fraksiyone stereotaktik RT' : 'Stereotaktik radyocerrahi',
          'Hipofiz adenomunda hormon kontrolü ve lokal kontrol için hacim, hormonal alt tip ve optik kiazma mesafesine göre SRS veya fraksiyone SRT.',
          'Hipofiz adenomu ve rezidü tümör',
          [{ organ: 'Optik kiazma', metric: 'Dmax', limit: fractionated ? '<54 Gy' : '<8-10 Gy', source: 'QUANTEC / SRS konsensüsü' }],
        );
        alternativeSchemes = [primaryScheme];
        statusText = fractionated ? 'ENDİKE: KİAZMA KOMŞU HİPOFİZ ADENOMUNDA FRAKSİYONE SRT' : 'ENDİKE: HİPOFİZ ADENOMUNDA SRS';
        targetVolumeBadge = 'Hedef: Hipofiz Adenomu';
        techniqueBadge = fractionated ? 'Teknik: Fraksiyone SRT' : 'Teknik: SRS';
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
            name: isBid ? 'Akselere Hiperfraksiyonasyon (1.5 Gy BID / 30 fx, ≥ 6 saat ara) · Turrisi' : '60-66 Gy QD (CONVERT Günlük Standart)',
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
        if (thymicHistology === 'thymic-carcinoma') {
          const thymicCarcinoma: DoseScheme = {
            id: 'thymic-carcinoma-port',
            name: '50-60 Gy / 25-30 fx (Adjuvan Kemoradyoterapi)',
            tag: '🛡️ Timik Karsinom PORT',
            totalDoseGy: thymomaMargin === 'R1' ? 54 : 60,
            fractionCount: thymomaMargin === 'R1' ? 27 : 30,
            fractionDoseGy: 2,
            alphaBeta: 10,
            technique: 'IMRT / VMAT (Kalp ve Akciğer Koruma)',
            indication: 'Timik karsinomda R0 rezeksiyon sonrasında dahi yüksek lokal ve sistemik nüks riski nedeniyle adjuvan kemoradyoterapi ve PORT değerlendirilmelidir.',
            targetVolumes: [
              { name: 'CTV_Bed', doseGy: thymomaMargin === 'R1' ? 54 : 60, marginMm: 'Anatomik', anatomical: 'Tümör yatağı, cerrahi klipsler ve anterior mediasten' },
              { name: 'PTV', doseGy: thymomaMargin === 'R1' ? 54 : 60, marginMm: 'CTV + 5 mm', anatomical: 'Planlama hedef hacmi' },
            ],
            oars: [
              { organ: 'Kalp Dmean', metric: 'Dmean', limit: '< 20 Gy', source: 'QUANTEC' },
              { organ: 'Akciğer V20Gy', metric: 'V20Gy', limit: '< 25%', source: 'QUANTEC' },
            ],
            systemicTherapy: 'Cerrahi sonrası platin bazlı eşzamanlı kemoterapi, multidisipliner değerlendirme ile planlanır.',
            evidence: 'NCCN v1.2025 Thymic Carcinoma / ITMIG',
          };
          return {
            statusText: 'ENDİKE: TIMİK KARSİNOMDA ADJUVAN KEMORADYOTERAPİ (PORT)',
            badgeClass: 'bg-emerald-950/40 text-emerald-300 border-emerald-500/40',
            primaryScheme: thymicCarcinoma,
            alternativeSchemes: [thymicCarcinoma],
          };
        }
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
            badgeClass: 'bg-slate-800 text-slate-200 border-slate-700',
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
            indication: 'Masaoka Evre II-III veya R1/R2 cerrahi sınır pozitifliği taşıyan timomalarda lokal nüksü azaltmak için adjuvan PORT uygulanır.',
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
            badgeClass: 'bg-emerald-950/40 text-emerald-300 border-emerald-500/40',
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
        const mesoAdj: DoseScheme = {
          id: 'meso-hemithoracic-504',
          name: '50.4 Gy / 28 fx (Adjuvan Hemitorasik IMRT, P/D Sonrası)',
          tag: '⚡ Adjuvan Hemitorasik RT',
          totalDoseGy: 50.4,
          fractionCount: 28,
          fractionDoseGy: 1.8,
          alphaBeta: 10,
          technique: 'Hemitorasik IMRT / VMAT (akciğer koruyucu P/D sonrası); EPD sonrası dikkatli dozimetri',
          indication: 'Plevrektomi/dekortikasyon (P/D) veya genişletilmiş plöropnömonektomi (EPD) sonrası yüksek lokal nüks riskinde adjuvan hemitorasik RT; IMPRINT verisi P/D sonrası akciğer koruyucu IMRT güvenliğini destekler.',
          targetVolumes: [
            { name: 'CTV_Hemithorax', doseGy: 50.4, marginMm: 'Anatomik', anatomical: 'Tüm ipsilateral plevral yüzey, cerrahi yatak ve insizyon/dren bölgeleri' },
            { name: 'PTV', doseGy: 50.4, marginMm: 'CTV + 5-8 mm', anatomical: 'Günlük IGRT ile set-up güvenlik marjini' },
          ],
          oars: [
            { organ: 'İpsilateral Akciğer (P/D sonrası)', metric: 'V20Gy', limit: 'Mümkün olan en düşük; MLD < 20 Gy', source: 'IMPRINT' },
            { organ: 'Karaciğer (Sağ taraf)', metric: 'Mean', limit: '< 30 Gy', source: 'QUANTEC' },
            { organ: 'Kalp (Sol taraf)', metric: 'Dmean', limit: '< 20 Gy', source: 'QUANTEC' },
          ],
          systemicTherapy: 'Platin + pemetrexed bazlı sistemik tedavi ile multidisipliner koordinasyon.',
          evidence: 'IMPRINT Faz II (Rimmer et al. JCO 2016), NCCN v1.2025 Mesothelioma',
        };
        return {
          statusText: mesoIntent === 'Hemitorasik_Postop' ? 'ENDİKE: P/D-EPD SONRASI ADJUVAN HEMİTORASİK RT' : 'PALYATİF VEYA GİRİŞİM YERİ PROFLAKTİK RT',
          badgeClass: mesoIntent === 'Hemitorasik_Postop' ? 'bg-emerald-50 text-emerald-800 border-emerald-300' : 'bg-indigo-50 text-indigo-800 border-indigo-300',
          primaryScheme: mesoIntent === 'Dren_Yeri' ? mesoTract : mesoIntent === 'Hemitorasik_Postop' ? mesoAdj : mesoPal,
          alternativeSchemes: [mesoPal, mesoTract, mesoAdj],
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
      const lungSbrtTargets = (doseGy: number) => breathingMotion === 'DIBH'
        ? [
            { name: 'GTV', doseGy, marginMm: '0 mm', anatomical: "Derin inspiryum BT'deki primer parankimal kitle" },
            { name: 'ITV_DIBH', doseGy, marginMm: 'GTV->ITV: DIBH / gating ile artık solunum hareketini doğrulayın', anatomical: 'Hareket yönetimi ve 4D-CT doğrulamasına göre' },
            { name: 'PTV_SBRT', doseGy, marginMm: 'ITV->PTV +3 mm (DIBH / gating)', anatomical: 'Günlük IGRT ve set-up güvenlik marjini' },
          ]
        : [
            { name: 'GTV', doseGy, marginMm: '0 mm', anatomical: 'Parankimal primer kitle (BT/PET füzyonu)' },
            { name: 'ITV_4D', doseGy, marginMm: 'GTV->ITV: 4D-CT solunum hareket zarfı', anatomical: 'Tümörün solunum siklusu boyunca kat ettiği hareket hacmi (MIP)' },
            { name: 'PTV_SBRT', doseGy, marginMm: 'ITV->PTV +5 mm', anatomical: 'Günlük IGRT ve set-up güvenlik marjini' },
          ];
      const lungSbrtTechnique = breathingMotion === 'DIBH'
        ? 'DIBH (Derin İnspiryumda Nefes Tutma) + SGRT (Optik Yüzey Rehberliği) / VMAT'
        : 'SBRT (4D-CT / ITV tabanlı VMAT)';
      let sbrt: DoseScheme;
      let sbrtAlt: DoseScheme | null = null;
      if (thoraxCentrality === 'Central') {
        sbrt = {
          id: 'lung-sbrt-50',
          name: '50 Gy / 5 fx (SBRT Santral No-Fly Zone)',
          tag: '⚠️ Santral SBRT',
          totalDoseGy: 50,
          fractionCount: 5,
          fractionDoseGy: 10,
          alphaBeta: 10,
          technique: `${lungSbrtTechnique} (Risk-Adapte)`,
          indication: 'PBT ≤2 cm komşu lezyonlar. Fatal hemoptizi ve bronşiyal fistülü önlemek için 5 fraksiyon standardı.',
          targetVolumes: lungSbrtTargets(50),
          oars: [{ organ: 'Proksimal Bronş Ağacı', metric: 'Dmax', limit: '< 50 Gy', source: 'RTOG 0813' }],
          evidence: 'RTOG 0813 (Bezjak et al. JCO 2019)',
          evidenceLinks: [
            {
              authority: 'NCCN',
              title: 'NCCN Non-Small Cell Lung Cancer Guidelines (v1.2025 - Principles of Radiation Therapy, p.77)',
              url: 'https://www.nccn.org/professionals/physician_gls/pdf/nscl.pdf#page=77',
              category: 'Kategori 1',
            },
            {
              authority: 'ASTRO',
              title: 'ASTRO Clinical Practice Guideline on SBRT for Early-Stage NSCLC',
              url: 'https://www.astro.org/provider-resources/guidelines/astro-s-guideline-on-sbrt-for-early-stage-nsclc',
              category: 'Consensus Guideline',
            },
            {
              authority: 'ESTRO',
              title: 'ESTRO-ACROP Consensus Recommendations on SBRT for Early-Stage Lung Cancer',
              url: 'https://doi.org/10.1016/j.radonc.2017.05.012',
              category: 'Consensus Guideline',
            },
            {
              authority: 'RTOG',
              title: 'RTOG 0813 trial protocol / reference',
              url: 'https://www.nrgoncology.org/clinical-trials/rtog-0813',
              category: 'Phase I/II Protocol',
            },
          ],
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
          technique: `${lungSbrtTechnique} (Hipofraksiyone)`,
          indication: 'Trakea veya özofagus ile direkt temas eden lezyonlar. 3-5 fraksiyonluk ablatif dozlar kontrendikedir.',
          targetVolumes: lungSbrtTargets(60),
          oars: [{ organ: 'Ana Bronş / Trakea', metric: 'Dmax', limit: '< 60 Gy', source: 'SUNSET Trial' }],
          evidence: 'SUNSET Trial',
          evidenceLinks: [
            {
              authority: 'NCCN',
              title: 'NCCN Non-Small Cell Lung Cancer Guidelines (v1.2025 - Principles of Radiation Therapy, p.77)',
              url: 'https://www.nccn.org/professionals/physician_gls/pdf/nscl.pdf#page=77',
              category: 'Kategori 1',
            },
            {
              authority: 'ASTRO',
              title: 'ASTRO Clinical Practice Guideline on SBRT for Early-Stage NSCLC',
              url: 'https://www.astro.org/provider-resources/guidelines/astro-s-guideline-on-sbrt-for-early-stage-nsclc',
              category: 'Consensus Guideline',
            },
            {
              authority: 'ESTRO',
              title: 'ESTRO-ACROP Consensus Recommendations on SBRT for Early-Stage Lung Cancer',
              url: 'https://doi.org/10.1016/j.radonc.2017.05.012',
              category: 'Consensus Guideline',
            },
          ],
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
          technique: lungSbrtTechnique,
          indication: 'Periferik erken evre KHDAK (Kategori 1 küratif altın standart, BED10 = 151.2 Gy).',
          targetVolumes: lungSbrtTargets(54),
          oars: [
            { organ: 'Bilateral Akciğer', metric: 'V20Gy', limit: '< 10-15%', source: 'RTOG 0236' },
            { organ: 'Göğüs Duvarı', metric: 'V30Gy', limit: '< 30 cc', source: 'RTOG 0236' },
          ],
          evidence: 'RTOG 0236, RTOG 0915, NCCN v1.2025 Kategori 1',
          evidenceLinks: LUNG_SBRT_EVIDENCE_LINKS,
        };
        sbrtAlt = {
          id: 'lung-sbrt-48',
          name: '48 Gy / 4 fx (SBRT Periferik Alternatif)',
          tag: '🎯 Periferik 4 fx',
          totalDoseGy: 48,
          fractionCount: 4,
          fractionDoseGy: 12,
          alphaBeta: 10,
          technique: lungSbrtTechnique,
          indication: 'Göğüs duvarına komşu veya fraksiyon başına doz toksisitesi sınırlandırılmak istenen periferik erken evre KHDAK alternatifi (BED10 = 105.6 Gy).',
          targetVolumes: lungSbrtTargets(48),
          oars: [
            { organ: 'Bilateral Akciğer', metric: 'V20Gy', limit: '< 10-15%', source: 'RTOG 0915' },
            { organ: 'Göğüs Duvarı', metric: 'V30Gy', limit: '< 30 cc', source: 'RTOG 0915' },
          ],
          evidence: 'RTOG 0915, NCCN v1.2025',
          evidenceLinks: LUNG_SBRT_0915_EVIDENCE_LINKS,
        };
      }
      return {
        statusText: `ENDİKE: KÜRATİF ${sbrt.tag} PROTOKOLÜ`,
        badgeClass: 'bg-emerald-50 text-emerald-800 border-emerald-300 shadow-[0_0_15px_rgba(16,185,129,0.25)]',
        primaryScheme: sbrt,
        alternativeSchemes: sbrtAlt ? [sbrt, sbrtAlt] : [sbrt],
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
            { organ: 'Rektum', metric: 'D2cc EQD2 α/β=3 (planlama hedefi / limit)', limit: '< 65 / < 75 Gy', source: 'EMBRACE II', context: 'Kümülatif EBRT + brakiterapi; yalnızca serviks kanseri.', contextEn: 'Cumulative EBRT + brachytherapy; cervical cancer only.', classification: 'protocol-limit' },
            { organ: 'Mesane', metric: 'D2cc EQD2 α/β=3 (planlama hedefi / limit)', limit: '< 80 / < 90 Gy', source: 'EMBRACE II', context: 'Kümülatif EBRT + brakiterapi; yalnızca serviks kanseri.', contextEn: 'Cumulative EBRT + brachytherapy; cervical cancer only.', classification: 'protocol-limit' },
            { organ: 'Sigmoid / bağırsak', metric: 'D2cc EQD2 α/β=3 (planlama hedefi / limit)', limit: '< 70 / < 75 Gy', source: 'EMBRACE II', context: 'Kümülatif EBRT + brakiterapi; yalnızca serviks kanseri.', contextEn: 'Cumulative EBRT + brachytherapy; cervical cancer only.', classification: 'protocol-limit' },
            { organ: 'Bowel bag (EBRT)', metric: 'V45Gy', limit: '< 195 cc', source: 'QUANTEC small bowel (2010)', context: 'EBRT peritoneal cavity/bowel-bag metric; brakiterapi D2cc değerinden ayrı.', contextEn: 'EBRT peritoneal-cavity/bowel-bag metric; separate from brachytherapy D2cc.', classification: 'dose-volume-reference' },
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
            { organ: 'Individual small-bowel loops', metric: 'V15Gy', limit: '< 120 cc (QUANTEC conventional-fractionation reference)', source: 'QUANTEC small bowel (2010)', context: 'Individual loops only; not interchangeable with a bowel-bag V45Gy metric.', contextEn: 'Individual loops only; not interchangeable with a bowel-bag V45Gy metric.', classification: 'dose-volume-reference' },
            { organ: 'Rectum', metric: 'Protocol-specific DVH', limit: 'Follow the applicable postoperative pelvic RT protocol', source: 'Peters / GOG 109 protocol', context: 'Do not apply prostate-specific QUANTEC rectal DVH values as universal gynecologic limits.', contextEn: 'Do not apply prostate-specific QUANTEC rectal DVH values as universal gynecologic limits.', classification: 'context-note' },
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
              { organ: 'Bowel bag (EBRT)', metric: 'V45Gy', limit: '< 195 cc (QUANTEC reference; protocol-specific)', source: 'QUANTEC small bowel (2010)', context: 'Bowel-bag/peritoneal cavity metric; do not apply as an individual-loop threshold.', contextEn: 'Bowel-bag/peritoneal cavity metric; do not apply as an individual-loop threshold.', classification: 'dose-volume-reference' },
              { organ: 'Mesane', metric: 'Protocol-specific DVH', limit: 'Follow the applicable pelvic RT protocol; no universal QUANTEC V45 limit asserted', source: 'PORTEC-3 protocol', context: 'This is not a QUANTEC small-bowel constraint.', contextEn: 'This is not a QUANTEC small-bowel constraint.', classification: 'context-note' },
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
            { organ: 'Bowel bag / peritoneal cavity', metric: 'V45Gy', limit: '< 195 cc (QUANTEC dose-volume reference)', source: 'QUANTEC small bowel (2010)', context: 'Applies to the bowel-bag/peritoneal-cavity contour, not individual loops.', contextEn: 'Applies to the bowel-bag/peritoneal-cavity contour, not individual loops.', classification: 'dose-volume-reference' },
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
    if (selectedOrgan === 'bone' || selectedOrgan === 'sarcoma' || selectedOrgan === 'bone-sarcoma') {
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
          oars: [],
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

      if (hnSubsite === 'maxillary-sinus') {
        const highRiskAdjuvant = hnENE || hnPositiveMargin;
        const dose = highRiskAdjuvant ? 66 : 60;
        const maxillarySinusScheme: DoseScheme = {
          id: 'maxillary-sinus-postoperative',
          name: `${dose} Gy / ${dose / 2} fx (${highRiskAdjuvant ? 'Kategori 1 eşzamanlı kemoradyoterapi' : 'adjuvan radyoterapi'})`,
          tag: highRiskAdjuvant ? 'Kategori 1 · ENE+ / R1' : 'Maksiller Sinüs',
          totalDoseGy: dose,
          fractionCount: dose / 2,
          fractionDoseGy: 2,
          alphaBeta: 10,
          technique: 'IMRT / VMAT · IGRT',
          indication: highRiskAdjuvant
            ? 'ENE+ veya R1 cerrahi sınır: Kategori 1 adjuvan eşzamanlı sisplatin ve 66 Gy / 33 fx.'
            : 'Maksiller sinüs histolojisi, evresi, cerrahi ve risk özelliklerine göre multidisipliner değerlendirme.',
          targetVolumes: [
            { name: 'CTV_Primary_High_Risk', doseGy: dose, marginMm: 'High-risk CTV->PTV +3-5 mm', anatomical: 'Cerrahi yatak / primer tümör yatağı' },
            { name: 'CTV_Elective_Nodal', doseGy: highRiskAdjuvant ? 54 : 50, marginMm: 'Elective nodal CTV->PTV +5 mm', anatomical: 'Patoloji ve başlangıç görüntülemeye göre elektif boyun' },
          ],
          oars: [],
          systemicTherapy: highRiskAdjuvant ? 'Eşzamanlı sisplatin (uygunluk ve kurum protokolüne göre).' : undefined,
          evidence: 'EORTC 22931 (NEJM 2004), RTOG 9501 (NEJM 2004)',
        };
        return {
          statusText: highRiskAdjuvant
            ? 'KATEGORİ 1: ENE+ / R1 · 66 Gy / 33 fx + EŞZAMANLI SİSPLATİN'
            : 'Maksiller Sinüs: Histoloji, evre ve risk bilgileriyle MDT değerlendirmesi',
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
            { name: 'PTV_Primary_Bed', doseGy: oralCavityDose, marginMm: 'High-risk CTV->PTV +3-5 mm', anatomical: 'Primer rezeksiyon yatağı ve patolojiye göre yüksek risk alanı' },
            ...(electiveNeckIndicated || selectedN !== 'N0' ? [{ name: 'PTV_Elective_Neck', doseGy: 54, marginMm: 'Elective nodal CTV->PTV +5 mm', anatomical: `${bilateralNeck ? 'Bilateral' : 'Lateralize tümörde ipsilateral'} Level I-IV boyun${hnENE || selectedN === 'N2' || selectedN === 'N3' ? ' + Level V' : ''}` }] : []),
            ...(hnENE || selectedN === 'N2' || selectedN === 'N3' ? [{ name: 'PTV_Nodal_High_Risk_Boost', doseGy: selectedN === 'N3' ? 70 : 66, marginMm: 'Tutulu nod yatağı / SIB', anatomical: `Level V dahil yüksek riskli nodal alan; ${selectedN === 'N3' ? '70 Gy' : '66 Gy'} SIB boost` }] : []),
          ],
          oars: [
            { organ: 'Mandibula', metric: 'Plan-specific dose review', limit: 'Minimize dose; assess dental status and osteoradionecrosis risk', source: 'Site- and protocol-specific planning guidance', context: 'No universal QUANTEC Dmax/V60 threshold; evaluate contour, dental factors, surgery and fractionation.', contextEn: 'No universal QUANTEC Dmax/V60 threshold; evaluate contour, dental factors, surgery and fractionation.', classification: 'planning-aim' },
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
          { name: 'PTV_High (GTV)', doseGy: 70, marginMm: 'High-risk CTV->PTV +3-5 mm', anatomical: 'Primer kitle ve makroskopik tutulu lenf nodları' },
          { name: 'PTV_Mid (Subklinik)', doseGy: 60, marginMm: 'Yüksek risk nodlar', anatomical: 'Primer komşuluğu ve tutulu nod istasyonu' },
          { name: 'PTV_Low (Elektif)', doseGy: 54, marginMm: 'Elective nodal CTV->PTV +5 mm', anatomical: hnSubsite === 'nasopharynx' ? 'Bilateral Level II-Vb + retrofaringeal lenf nodları (RPN)' : `${bilateralNeck ? 'Bilateral' : 'İpsilateral'} Level II-IV${hnENE || selectedN === 'N2' || selectedN === 'N3' ? ' + Level V' : ''}` },
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
                  : '45-54 Gy / 25-30 fx veya İzlem',
          tag: isGbm ? 'WHO Grade 4 / GBM (IDH-wildtype)' : isOligo ? 'Oligodendrogliom (1p/19q ko-del)' : isAstro ? 'Astrositom (IDH-mutant)' : highRisk ? 'Yüksek Riskli Gliom' : 'Düşük Riskli Gliom',
          totalDoseGy: dose,
          fractionCount: fractions,
          fractionDoseGy: dose / fractions,
          alphaBeta: 10,
          technique: 'IMRT / VMAT; cerrahi kavite + T2/FLAIR CTV',
          indication: isGbm
            ? 'Maksimal güvenli rezeksiyon sonrası eşzamanlı ve adjuvan TMZ ile Stupp protokolü.'
            : isOligo
              ? '1p/19q ko-delesyonlu oligodendrogliomda RT sonrası adjuvan PCV, RTOG 9402 uzun dönem sağkalım avantajı göstermiştir; TMZ alternatifi daha zayıftır.'
              : isAstro
                ? 'IDH-mutant astrositomda CDKN2A/B delesyonu ve grade; düşük riskli Grade 2 olguda izlem veya fokal RT, yüksek riskte RT + TMZ değerlendirilir.'
                : highRisk
                  ? `Pignatti/RTOG 9802 risk kriterleri: ${riskCount} kriter; PCV veya TMZ ile eskalasyon.`
                  : 'Grade 1-2 düşük riskli gliomda izlem veya fokal RT multidisipliner değerlendirilir.',
          targetVolumes: [{ name: 'GTV/CTV/PTV', doseGy: dose, marginMm: 'GTV + 1.5-2 cm CTV; PTV + 3-5 mm', anatomical: 'Cerrahi kavite, rezidü tümör ve T2/FLAIR anormalliği' }],
          oars: [{ organ: 'Optik kiazma', metric: 'Dmax', limit: '< 54 Gy', source: 'QUANTEC' }, { organ: 'Beyin sapı', metric: 'Dmax', limit: '< 54 Gy', source: 'QUANTEC' }],
          systemicTherapy: isGbm
            ? 'Eşzamanlı TMZ 75 mg/m² ve 6 kür adjuvan TMZ.'
            : isOligo
              ? 'RT sonrası adjuvan PCV (Prokarbazin, Lomustin, Vinkristin) - RTOG 9402 / EORTC 26951.'
              : isAstro
                ? 'IDH-mutant astrositomda yüksek risk özelliklerinde adjuvan TMZ; Grade 2 düşük riskte izlem seçeneği.'
                : highRisk
                  ? 'PCV veya TMZ; moleküler sınıflamaya göre nöro-onkoloji kararı.'
                  : undefined,
          evidence: 'NCCN CNS; RTOG 9802; RTOG 9402; EORTC 26951; EORTC 22033; Stupp',
        };
        return { statusText: highRisk ? 'YÜKSEK RİSKLİ GLİOM: ESKALASYON PROTOKOLÜ' : 'DÜŞÜK RİSKLİ GLİOM: İZLEM / FOKAL RT', badgeClass: highRisk ? 'bg-rose-50 text-rose-800 border-rose-300' : 'bg-emerald-50 text-emerald-800 border-emerald-300', primaryScheme: glioma, alternativeSchemes: [glioma] };
      }
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
            { organ: 'Pelvic bowel', metric: 'Protocol- and contour-specific DVH', limit: 'Minimize dose; follow the selected bladder-preservation protocol', source: 'BC2001 / site-specific protocol', context: 'Do not interpret as a QUANTEC V45 threshold for individual bowel loops.', contextEn: 'Do not interpret as a QUANTEC V45 threshold for individual bowel loops.', classification: 'context-note' },
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
        if (testisHistology === 'nonseminoma') {
          const nonSeminoma: DoseScheme = {
            id: 'testis-nonseminoma-no-rt',
            name: 'Radyoterapi Önerilmez (Kemoterapi / RPLND / İzlem)',
            tag: '⚠️ Non-Seminom',
            totalDoseGy: 0,
            fractionCount: 0,
            fractionDoseGy: 0,
            alphaBeta: 10,
            technique: 'Radyoterapi endike değil',
            indication: 'Non-seminom germ hücreli tümörlerde adjuvan radyoterapi önerilmez; evreye göre aktif izlem, BEP kemoterapi veya RPLND standart yaklaşımdır. Radyoduyarlılık seminoma göre belirgin düşüktür.',
            targetVolumes: [],
            oars: [],
            systemicTherapy: 'Evre ve risk durumuna göre BEP kemoterapi veya RPLND; multidisipliner üro-onkoloji konseyi kararı.',
            evidence: 'NCCN Testicular Cancer v1.2025; EAU Guidelines',
          };
          return {
            statusText: 'ENDİKE DEĞİLDİR: NON-SEMİNOMDA RT ÖNERİLMEZ (KEMOTERAPİ / RPLND / İZLEM)',
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
            name: lang === 'tr' ? 'FASTRACK II uygunluğu için primer böbrek tümörü ≤10 cm olmalı; evre ve protokolü gözden geçirin' : 'FASTRACK II eligibility requires a renal primary ≤10 cm; review stage and local protocol',
            tag: lang === 'tr' ? 'SABR uygunluk değerlendirmesi' : 'SABR eligibility review',
            totalDoseGy: 0,
            fractionCount: 0,
            fractionDoseGy: 0,
            alphaBeta: 10,
            technique: lang === 'tr' ? 'Multidisipliner değerlendirme' : 'Multidisciplinary assessment',
            indication: lang === 'tr'
              ? 'FASTRACK II için tümör çapı ≤10 cm olmalıdır. Çapı ve renal ven/perirenal yayılımı doğrulayın; uygunluk, performans durumu ve güncel renal SBRT protokolü multidisipliner değerlendirilmelidir.'
              : 'FASTRACK II requires a tumour diameter ≤10 cm. Verify diameter and renal vein/perirenal extension; eligibility, fitness and the current renal SBRT protocol require multidisciplinary review.',
            targetVolumes: [],
            oars: [],
            evidence: 'FASTRACK II (Lancet Oncol 2024), DOI: 10.1016/S1470-2045(24)00020-2; eviQ protocol 4381',
          };
          return { statusText: lang === 'tr' ? 'DEĞERLENDİRİN: RCC EVRESİ FASTRACK II BASİT T1 DOZ SEÇİMİ DIŞINDA' : 'REVIEW: SELECTED RCC EXTENT OUTSIDE SIMPLE T1 FASTRACK II DOSE SELECTION', badgeClass: 'bg-amber-50 text-amber-800 border-amber-300', primaryScheme: notApplicable, alternativeSchemes: [notApplicable] };
        }
        const doseGy = primaryRcc ? sizeBasedFractionation === 'single' ? 26 : 42 : 35;
        const fractions = primaryRcc ? sizeBasedFractionation === 'single' ? 1 : 3 : 5;
        const scheme: DoseScheme = {
          id: primaryRcc ? sizeBasedFractionation === 'single' ? 'rcc-primary-26-1' : 'rcc-primary-42-3' : 'rcc-oligometastatic-35-5',
          name: lang === 'tr'
            ? `${doseGy} Gy / ${fractions} fx (${primaryRcc ? 'primer renal SABR' : 'renal oligometastatik / oligoprogresif SBRT'})`
            : `${doseGy} Gy / ${fractions} fx (${primaryRcc ? 'primary renal SABR' : 'renal oligometastatic / oligoprogressive SBRT'})`,
          tag: primaryRcc ? 'FASTRACK II · SABR' : lang === 'tr' ? 'Oligometastatik SBRT' : 'Oligometastatic SBRT',
          totalDoseGy: doseGy,
          fractionCount: fractions,
          fractionDoseGy: doseGy / fractions,
          alphaBeta: 10,
          technique: lang === 'tr' ? 'Solunum hareketi yönetimi ve görüntü kılavuzlu SABR; OAR yakınlığına göre uyarlayın' : 'Image-guided SABR with respiratory motion management; adapt to OAR proximity',
          indication: primaryRcc
            ? lang === 'tr'
              ? `Biyopsiyle doğrulanmış, medikal olarak inoperabl veya cerrahi riski yüksek primer RCC (${renalDiameterCm <= 4 ? '≤4 cm' : '>4–10 cm'}). FASTRACK II, ≤4 cm tümörlerde 26 Gy × 1 ve >4–10 cm tümörlerde 42 Gy / 3 fx kullandı. Seçilen çapı (${renalDiameterCm} cm), eGFR'yi ve uygunluğu doğrulayın.`
              : `Biopsy-confirmed, medically inoperable or high-surgical-risk primary RCC (${renalDiameterCm <= 4 ? '≤4 cm' : '>4–10 cm'}). FASTRACK II delivered 26 Gy x1 for tumours ≤4 cm and 42 Gy in 3 fx for tumours >4–10 cm. Verify the selected diameter (${renalDiameterCm} cm), eGFR and eligibility.`
            : lang === 'tr'
              ? 'Konsey değerlendirmesi sonrası seçilmiş oligometastatik hastalık veya immünoterapi altında oligoprogresyon için örnek 35 Gy / 5 fx. Primer RCC’de FASTRACK II şeması değildir.'
              : 'Example 35 Gy / 5 fx for selected oligometastatic disease or oligoprogression during immunotherapy after MDT review. Not a primary RCC FASTRACK II regimen.',
          targetVolumes: [{ name: 'GTV_Renal', doseGy, marginMm: lang === 'tr' ? 'Güncel protokole göre hareket ve set-up marjini' : 'Motion and setup margin per current protocol', anatomical: lang === 'tr' ? 'Primer renal lezyon veya seçilmiş oligometastatik hedef' : 'Renal primary or selected oligometastatic target' }],
          oars: [],
          evidence: primaryRcc
            ? 'FASTRACK II, Siva et al. Lancet Oncol 2024; DOI: 10.1016/S1470-2045(24)00020-2; eviQ renal SABR protocol 4381'
            : 'Current disease-site SBRT protocol and multidisciplinary review; do not extrapolate FASTRACK II primary RCC limits',
        };
        return {
          statusText: primaryRcc
            ? lang === 'tr' ? 'SEÇENEK: SEÇİLMİŞ MEDİKAL İNOPERABL PRİMER RCC’DE SABR' : 'OPTION: SABR FOR SELECTED MEDICALLY INOPERABLE PRIMARY RCC'
            : lang === 'tr' ? 'SEÇENEK: SEÇİLMİŞ RCC OLİGOMETASTAZI / OLİGOPROGRESYONUNDA SBRT' : 'OPTION: SBRT FOR SELECTED RCC OLIGOMETASTASIS / OLIGOPROGRESSION',
          badgeClass: 'bg-emerald-50 text-emerald-800 border-emerald-300',
          primaryScheme: scheme,
          alternativeSchemes: primaryRcc && sizeBasedFractionation === 'single'
            ? [scheme, { ...scheme, id: 'rcc-primary-42-3', name: lang === 'tr' ? '42 Gy / 3 fx (FASTRACK II; tümör >4–10 cm)' : '42 Gy / 3 fx (FASTRACK II; tumour >4–10 cm)', totalDoseGy: 42, fractionCount: 3, fractionDoseGy: 14 }]
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
        targetVolumes: [
          { name: 'GTV_Prostate', doseGy: 36.25, marginMm: '0 mm', anatomical: 'Prostat bezi; varsa dominant intraprostatik lezyon (DIL) / nodül boostu' },
          { name: 'CTV_Prostate', doseGy: 36.25, marginMm: 'Anatomik', anatomical: 'Prostat ± seminal veziküller, risk uyarlamalı' },
          { name: 'PTV_Prostate', doseGy: 36.25, marginMm: 'CTV->PTV +4-5 mm; posterior +3 mm with SpaceOAR', anatomical: 'Günlük IGRT ve prostat hareket güvenlik marjini' },
        ],
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
              name: '40.05 Gy / 15 fx (DCIS Tüm Meme RT, START-B) ± Boost',
              totalDoseGy: 40.05,
              fractionCount: 15,
              fractionDoseGy: 2.67,
              targetVolumes: dcisWbi.targetVolumes.map(volume => ({ ...volume, doseGy: volume.name === 'Tumor bed boost' ? volume.doseGy : 40.05 })),
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

      if (breastHistology === 'Dermatofibrosarkoma Protuberans (DFSP)') {
       const dfsp: DoseScheme = {
         id: 'dfsp-adjuvant-50-60',
         name: '50-60 Gy / 25-30 fx (Adjuvan DFSP RT)',
         tag: 'DFSP - Yakın/Pozitif Marjin',
         totalDoseGy: 56,
         fractionCount: 28,
         fractionDoseGy: 2,
         alphaBeta: 4,
         technique: 'Elektron veya foton RT; geniş mikroskopik marjin',
         indication: 'Geniş lokal eksizyon (2-3 cm) veya Mohs sonrası pozitif/yakın cerrahi sınırda, re-eksizyon mümkün değilse adjuvan RT.',
         targetVolumes: [{ name: 'CTV_DFSP', doseGy: 56, marginMm: '3-5 cm mikroskopik marjin', anatomical: 'Primer yatak ve cerrahi skar' }],
         oars: [],
         evidence: 'Soft tissue sarcoma / DFSP multidisciplinary guidance',
       };
       return { statusText: 'DEĞERLENDİR: DFSP YAKIN/PozİTİF MARJİNDE ADJUVAN RT', badgeClass: 'bg-amber-50 text-amber-800 border-amber-300', primaryScheme: dfsp, alternativeSchemes: [dfsp] };
      }

      if (breastHistology === 'İnflamatuar Meme Kanseri (IBC)') {
        const inflammatory: DoseScheme = {
          id: 'br-inflammatory-pmrt-50',
          name: 'Neoadjuvan Sistemik Tedavi + Modifiye Radikal Mastektomi Sonrası Kapsamlı Lokoregiyonal RT (50 Gy / 25 fx ± 10 Gy Scar Boost)',
          tag: 'Lokal İleri Yüksek Risk (Evre IIIB/C)',
          totalDoseGy: 50,
          fractionCount: 25,
          fractionDoseGy: 2,
          alphaBeta: 4,
          technique: 'IMRT / VMAT + DIBH',
          indication: 'Neoadjuvan sistemik tedavi ve modifiye radikal mastektomi sonrası göğüs duvarı, supraklavikuler, internal mammary ve aksiller seviye III alanlarına kapsamlı lokoregiyonal RT; uygun seçilmiş olguda 10 Gy scar boost.',
          targetVolumes: [
            { name: 'CTV_ChestWall', doseGy: 50, marginMm: 'Anatomik', anatomical: 'Mastektomi göğüs duvarı ve cilt altı yüzey' },
            { name: 'CTV_RNI', doseGy: 50, marginMm: 'Anatomik', anatomical: 'Aksilla Level I-IV + supraklavikuler + internal mammary chain' },
          ],
          oars: [
            { organ: 'Kalp', metric: 'Dmean', limit: '< 2.5 Gy hedef', source: 'NCCN / EMBRACE prensipleri' },
            { organ: 'İpsilateral akciğer', metric: 'V20Gy', limit: '< 30%', source: 'QUANTEC' },
          ],
          systemicTherapy: 'Neoadjuvan kemoterapi / anti-HER2 tedavi sonrası cerrahi ve PMRT.',
          evidence: 'NCCN Breast Cancer v1.2025; AJCC 8th edition T4d',
        };
        return {
          statusText: 'ENDİKE: İNFLAMATUAR MEME KARSİNOMU T4d - NEOADJUVAN KT + MASTEKTOMİ + PMRT',
          badgeClass: 'bg-rose-50 text-rose-800 border-rose-300',
          primaryScheme: inflammatory,
          alternativeSchemes: [inflammatory],
        };
      }

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
            name: '40.05 Gy / 15 fx (Hipofraksiyone Tüm Meme RT, START-B) + Gereğinde 10-16 Gy Boost',
            totalDoseGy: 40.05,
            fractionCount: 15,
            fractionDoseGy: 2.67,
            targetVolumes: fastForward.targetVolumes.map(volume => ({ ...volume, doseGy: volume.name === 'TumorBedBoost' ? 10 : 40.05 })),
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
            { organ: 'Small bowel', metric: 'Fractionation-specific bowel DVH', limit: 'Use the applicable RAPIDO/site protocol; conventional QUANTEC limits are not transferable', source: 'RAPIDO protocol (verify current version)', context: 'Short-course RT 25 Gy / 5 fx; not the conventional-fractionation setting for QUANTEC V15/V45 references.', contextEn: 'Short-course RT 25 Gy / 5 fx; not the conventional-fractionation setting for QUANTEC V15/V45 references.', classification: 'context-note' },
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
          oars: [],
          systemicTherapy: 'Eşzamanlı oral Kapesitabin (825 mg/m2 günde iki kez).',
          evidence: 'German Rectal Cancer Study (CAO/ARO/AIO-94)',
        };
        const crmPositive = gisCrmStatus === 'Pozitif';
        const rapidoCrm: DoseScheme = crmPositive
          ? { ...rapido, indication: `${rapido.indication} MR-CRM pozitifliği (≤1 mm) lokal nüks ve uzak metastaz riskini artırır; TNT yaklaşımı ve yeterli mezorektal excision kritik önemdedir.` }
          : rapido;
        return {
          statusText: crmPositive ? 'ENDİKE: CRM+ LOKAL İLERİ REKTUM - TNT (RAPIDO / PRODIGE 23) ÖNCELİKLİ' : 'ENDİKE: NEOADJUVAN TNT / RAPIDO KISA DÖNEM RT PROTOKOLÜ',
          badgeClass: 'bg-emerald-50 text-emerald-800 border-emerald-300 shadow-[0_0_15px_rgba(16,185,129,0.25)]',
          primaryScheme: rapidoCrm,
          alternativeSchemes: [rapidoCrm, standardKrt],
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

      if (gisOrgan === 'Karaciger' && liverHistology) {
        const isHcc = liverHistology === 'hcc';
        const doseGy = isHcc ? 45 : 50;
        const stageText = `BCLC ${liverBclcStage}`;
        const liverSbrt: DoseScheme = {
          id: isHcc ? 'gis-liver-hcc-sbrt-45-5' : 'gis-liver-crlm-sbrt-50-5',
          name: lang === 'tr'
            ? `${doseGy} Gy / 5 fx (${isHcc ? 'HCC' : 'kolorektal karaciğer metastazı'} SBRT)`
            : `${doseGy} Gy / 5 fx (${isHcc ? 'HCC' : 'colorectal liver metastasis'} SBRT)`,
          tag: isHcc ? 'NRG/RTOG 1112 · HCC' : lang === 'tr' ? 'Karaciğer oligometastazı SBRT' : 'Liver oligometastasis SBRT',
          totalDoseGy: doseGy,
          fractionCount: 5,
          fractionDoseGy: doseGy / 5,
          alphaBeta: 10,
          technique: breathingMotion === 'DIBH'
            ? (lang === 'tr' ? 'Görüntü kılavuzlu DIBH / SGRT' : 'DIBH / SGRT with image guidance')
            : (lang === 'tr' ? 'Günlük görüntü kılavuzlu 4D-CT / ITV tabanlı VMAT SBRT' : '4D-CT / ITV-based VMAT SBRT with daily image guidance'),
          indication: isHcc
            ? lang === 'tr'
              ? `${stageText}${liverBclcStage === 'C' ? ' (makrovasküler invazyon / PVTT olasılığı)' : ''}: multidisipliner değerlendirme sonrası seçilmiş HCC olgusunda SBRT düşünülebilir. Child-Pugh sınıfını, karaciğer rezervini ve alternatifleri doğrulayın; 45 Gy / 5 fx NRG/RTOG 1112 aralığında örnek bir şemadır.`
              : `${stageText}${liverBclcStage === 'C' ? ' with possible macrovascular invasion/PVTT' : ''}: selected HCC SBRT after MDT review. Confirm Child-Pugh class, liver reserve and alternatives; 45 Gy / 5 fx is an example within NRG/RTOG 1112.`
            : lang === 'tr'
              ? 'Rezeksiyon/ablasyon uygunluğu, sistemik hastalık kontrolü ve OAR yakınlığı konseyde değerlendirildikten sonra seçilmiş kolorektal karaciğer oligometastazı için örnek 50 Gy / 5 fx.'
              : 'Example 50 Gy / 5 fx for selected colorectal liver oligometastasis after MDT review of resection/ablation, systemic disease control and OAR proximity.',
          targetVolumes: [
            { name: 'GTV_Liver', doseGy, marginMm: '0 mm', anatomical: lang === 'tr' ? 'Kontrast tutan karaciğer lezyonu' : 'Contrast-enhancing liver lesion' },
            { name: breathingMotion === 'DIBH' ? 'PTV_Liver_DIBH' : 'ITV_4D', doseGy, marginMm: lang === 'tr' ? 'Kurumsal hareket yönetimi / set-up marjini' : 'Motion management / institution-specific setup margin', anatomical: breathingMotion === 'DIBH' ? (lang === 'tr' ? 'Tekrarlanabilir nefes tutma hedefi' : 'Reproducible breath-hold target') : (lang === 'tr' ? '4D-CT solunum hareket zarfı' : 'Respiratory motion envelope on 4D-CT') },
          ],
          oars: [],
          evidence: isHcc
            ? 'NRG/RTOG 1112; Dawson et al. JAMA Oncol 2025; DOI: 10.1001/jamaoncol.2024.5403; ASTRO primary liver cancer guideline'
            : 'eviQ Hepatic Metastases SABR protocol 4026; HyTEC liver metastases analysis',
        };
        return {
          statusText: isHcc
            ? lang === 'tr' ? `SEÇENEK: HCC SBRT · ${stageText} · karaciğer rezervi ve konsey uygunluğunu doğrulayın` : `OPTION: HCC SBRT · ${stageText} · verify hepatic reserve and MDT suitability`
            : lang === 'tr' ? 'SEÇENEK: SEÇİLMİŞ KOLOREKTAL KARACİĞER OLİGOMETASTAZINDA SBRT' : 'OPTION: SBRT FOR SELECTED COLORECTAL LIVER OLIGOMETASTASIS',
          badgeClass: 'bg-emerald-50 text-emerald-800 border-emerald-300',
          primaryScheme: liverSbrt,
          alternativeSchemes: [
            liverSbrt,
            { ...liverSbrt, id: 'gis-liver-sbrt-60-5', name: lang === 'tr' ? '60 Gy / 5 fx (seçilmiş karaciğer met; yalnızca OAR sınırları uygunsa)' : '60 Gy / 5 fx (selected liver metastasis; only if OAR limits permit)', totalDoseGy: 60, fractionDoseGy: 12 },
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
            ? lang === 'tr' ? `Bölgesel nodlara 45 Gy / 25 fx + tümör yatağına ${boostDose} Gy boost`
              : `45 Gy / 25 fx regional nodes + tumour bed boost to ${boostDose} Gy`
            : lang === 'tr' ? 'Mevcut R0/N0 seçiminde otomatik adjuvan RT önerilmez'
              : 'No automatic adjuvant radiotherapy recommendation for current R0/N0 selection',
          tag: 'SWOG S0809 · postoperative high-risk',
          totalDoseGy: highRisk ? boostDose : 0,
          fractionCount: highRisk ? boostFractions : 0,
          fractionDoseGy: 1.8,
          alphaBeta: 10,
          technique: 'IMRT / VMAT with image guidance',
          indication: highRisk
            ? lang === 'tr'
              ? `${siteName}: R1 marjin veya bölgesel N+ hastalık. SWOG S0809 bölgesel nodlara ve tümör yatağına 45 Gy / 25 fx; R0 için 54 Gy, R1 için 59.4 Gy boost kullandı. Kanıt ekstrahepatik kolanjiyokarsinom ve safra kesesi kanserinde daha güçlüdür; intrahepatik olguyu konseyde bireyselleştirin.`
              : `${siteName}: R1 margin or regional N+ disease. SWOG S0809 used 45 Gy / 25 fx to regional nodes and tumour bed with boost to 54 Gy (R0) or 59.4 Gy (R1). Evidence is strongest for extrahepatic cholangiocarcinoma and gallbladder cancer; individualise intrahepatic cases.`
            : lang === 'tr'
              ? `${siteName}: mevcut R0/N0 seçimi SWOG S0809 yüksek risk ölçütlerini karşılamaz. Adjuvan kemoradyoterapi otomatik değildir; patoloji ve sistemik adjuvan tedaviyi konseyde değerlendirin.`
              : `${siteName}: current R0/N0 selections do not meet high-risk SWOG S0809 criteria. Adjuvant chemoradiation is not automatic; review pathology and systemic adjuvant therapy at MDT.`,
          targetVolumes: highRisk ? [
            { name: 'Regional nodal CTV', doseGy: 45, marginMm: lang === 'tr' ? 'Alt bölgeye özgü atlas' : 'Site-specific atlas', anatomical: lang === 'tr' ? 'Primer alt bölgeye göre bölgesel nodal alan' : 'Regional nodal basin for primary site' },
            { name: 'Tumour bed / high-risk margin', doseGy: boostDose, marginMm: lang === 'tr' ? 'Postoperatif anatomi ve klipler' : 'Postoperative anatomy and clips', anatomical: lang === 'tr' ? 'Rezeksiyon yatağı; R1 ise pozitif marjin' : 'Resection bed; positive margin if R1' },
          ] : [],
          oars: [],
          systemicTherapy: highRisk
            ? lang === 'tr'
              ? 'SWOG S0809 sıralaması: gemsitabin/kapesitabin ardından RT ile eşzamanlı kapesitabin; dozları medikal onkolojiyle koordine edin.'
              : 'SWOG S0809 sequence: gemcitabine/capecitabine followed by concurrent capecitabine with RT; coordinate doses with medical oncology.'
            : undefined,
          evidence: 'SWOG S0809, Ben-Josef et al. JCO 2015; DOI: 10.1200/JCO.2014.60.2219; verify current NCCN version',
        };
        if (biliaryTreatmentSetting === 'adjuvant') {
          return {
            statusText: highRisk
              ? lang === 'tr' ? 'SEÇENEK: R1 VEYA N+ BİLİYER KANSERDE ADJUVAN KRT (SWOG S0809)' : 'OPTION: ADJUVANT CRT FOR R1 OR N+ BILIARY CANCER (SWOG S0809)'
              : lang === 'tr' ? 'ADJUVAN KRT OTOMATİK ENDİKE DEĞİL: R1 / N+ RİSKİNİ DOĞRULAYIN' : 'ADJUVANT CRT NOT AUTOMATICALLY INDICATED: CONFIRM R1 / N+ RISK',
            badgeClass: highRisk ? 'bg-emerald-50 text-emerald-800 border-emerald-300' : 'bg-amber-50 text-amber-800 border-amber-300',
            primaryScheme: adjuvant,
            alternativeSchemes: [adjuvant],
          };
        }
        const sbrt: DoseScheme = {
          ...adjuvant,
          id: 'biliary-unresectable-sbrt-45-5',
          name: lang === 'tr' ? '45 Gy / 5 fx (seçilmiş inoperabl safra yolu olguları)' : '45 Gy / 5 fx (selected unresectable biliary tract cases)',
          tag: lang === 'tr' ? 'SBRT · OAR sınırlı' : 'SBRT · OAR-limited',
          totalDoseGy: 45,
          fractionCount: 5,
          fractionDoseGy: 9,
          technique: lang === 'tr' ? 'Solunum hareketi yönetimli, görüntü kılavuzlu VMAT / SBRT' : 'Image-guided VMAT / SBRT with respiratory motion management',
          indication: lang === 'tr'
            ? `${siteName}: yalnızca konsey değerlendirmesi sonrası ve alt bölgeye özgü mide, bağırsak ve santral safra yolu OAR kısıtları karşılanabiliyorsa düşünün.`
            : `${siteName}: consider after MDT review only when site-specific stomach, bowel and central biliary OAR limits can be met.`,
          targetVolumes: [{ name: 'GTV_Biliary', doseGy: 45, marginMm: lang === 'tr' ? 'Protokole özgü hareket/set-up marjini' : 'Protocol-specific motion/setup margin', anatomical: lang === 'tr' ? 'Makroskopik primer veya nüks; alt bölgeye özgü nodal yaklaşım' : 'Gross primary or recurrence; site-specific nodal policy' }],
          evidence: 'Verify current NCCN Biliary Tract Cancers version; RTOG upper-abdominal atlas; institutional SBRT protocol',
        };
        const conventional: DoseScheme = {
          ...sbrt,
          id: 'biliary-unresectable-conventional-54-30',
          name: lang === 'tr' ? '50.4–54 Gy / 28–30 fx (konvansiyonel fraksiyonlu RT)' : '50.4–54 Gy / 28–30 fx (conventionally fractionated RT)',
          tag: lang === 'tr' ? 'Konvansiyonel RT / KRT' : 'Conventional RT / CRT',
          totalDoseGy: 54,
          fractionCount: 30,
          fractionDoseGy: 1.8,
          technique: lang === 'tr' ? 'Görüntü kılavuzlu IMRT / VMAT' : 'IMRT / VMAT with image guidance',
          targetVolumes: [{ name: 'CTV_Biliary', doseGy: 50.4, marginMm: lang === 'tr' ? 'Alt bölgeye özgü atlas' : 'Site-specific atlas', anatomical: lang === 'tr' ? 'Primer alt bölge ve klinik endikasyonlu bölgesel nodlar' : 'Primary site and clinically indicated regional nodes' }],
          evidence: 'SWOG S0809; verify current NCCN Biliary Tract Cancers version',
        };
        return {
          statusText: lang === 'tr' ? 'SEÇENEK: İNOPERABL BİLİYER HASTALIKTA ANATOMİ VE HASTAYA UYARLANMIŞ RT' : 'OPTION: ANATOMY- AND PATIENT-ADAPTED RT FOR UNRESECTABLE BILIARY DISEASE',
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
          indication: 'Neoadjuvan CROSS protokolü: eşzamanlı karboplatin/paklitaksel ve ardından cerrahi.',
          targetVolumes: [{ name: 'CTV_Esophagus', doseGy: 41.4, marginMm: 'Anatomik', anatomical: 'Primer özofagus tümörü ve bölgesel lenfatikler' }],
          oars: [
            { organ: 'Kalp', metric: 'Dmean', limit: '< 20 Gy; V30 < 30%', source: 'CROSS / QUANTEC' },
            { organ: 'Akciğer', metric: 'V20Gy', limit: '< 20%', source: 'CROSS / QUANTEC' },
            { organ: 'Spinal kord', metric: 'Dmax', limit: '< 45 Gy', source: 'QUANTEC' },
          ],
          systemicTherapy: 'Eşzamanlı karboplatin/paklitaksel.',
          evidence: 'CROSS Trial; NCCN Esophageal Cancer v1.2025',
        };
        const definitive: DoseScheme = { ...cross, id: 'gis-esophagus-definitive-504', name: '50-50.4 Gy / 25-28 fx (Definitif KRT)', totalDoseGy: 50.4, fractionCount: 28, fractionDoseGy: 1.8, tag: 'Definitif Özofagus KRT' };
        return { statusText: 'ENDİKE: ÖZOFAGUS CROSS NEOADJUVAN KRT', badgeClass: 'bg-emerald-50 text-emerald-800 border-emerald-300', primaryScheme: cross, alternativeSchemes: [cross, definitive] };
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
          indication: 'Borderline rezekabl veya seçilmiş lokal ileri pankreas kanserinde eşzamanlı kapesitabin; indüksiyon FOLFIRINOX sonrası SBRT değerlendirilebilir.',
          targetVolumes: [{ name: 'PTV_Pancreas', doseGy: 50.4, marginMm: 'Anatomik', anatomical: 'Primer pankreas tümörü ve ilgili lenfatikler' }],
          oars: [
            { organ: 'Duodenum', metric: 'Dmax', limit: '< 54 Gy; SBRT V33Gy < 1 cc', source: 'NCCN / QUANTEC' },
            { organ: 'Mide', metric: 'Dmax', limit: '< 54 Gy', source: 'NCCN' },
            { organ: 'Bowel bag / peritoneal cavity', metric: 'V45Gy', limit: '< 195 cc (QUANTEC dose-volume reference)', source: 'QUANTEC small bowel (2010)', context: 'Applies to the bowel-bag/peritoneal-cavity contour, not individual loops; conventional fractionation.', contextEn: 'Applies to the bowel-bag/peritoneal-cavity contour, not individual loops; conventional fractionation.', classification: 'dose-volume-reference' },
            { organ: 'Böbrekler', metric: 'V18Gy', limit: '< 30% bilateral', source: 'QUANTEC' },
          ],
          systemicTherapy: 'Eşzamanlı kapesitabin veya indüksiyon FOLFIRINOX sonrası SBRT.',
          evidence: 'NCCN Pancreatic Adenocarcinoma v1.2025',
        };
        const sbrt: DoseScheme = { ...pancreatic, id: 'gis-pancreas-sbrt-40', name: '33-40 Gy / 5 fx (Pankreas SBRT)', totalDoseGy: 40, fractionCount: 5, fractionDoseGy: 8, technique: 'MR-Linac / SBRT' };
        return { statusText: 'ENDİKE: PANKREAS KRT / SEÇİLMİŞ SBRT', badgeClass: 'bg-emerald-50 text-emerald-800 border-emerald-300', primaryScheme: pancreatic, alternativeSchemes: [pancreatic, sbrt] };
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
        oars: [],
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

      if (hematologicSubtype === 'ALL') {
        const allScheme: DoseScheme = {
          id: 'all-tbi-12',
          name: '12 Gy / 6 fx BID (TBI) veya 12-18 Gy Kraniyal Profilaksi',
          tag: 'ALL - KİT Hazırlığı / CNS Profilaksisi',
          totalDoseGy: 12,
          fractionCount: 6,
          fractionDoseGy: 2,
          alphaBeta: 10,
          technique: 'Total Body Irradiation veya risk uyarlı kraniyal RT',
          indication: 'ALL tedavisinde hematopoietik kök hücre nakli hazırlığında TBI; CNS riski olan hastada profilaktik kraniyal RT hematoloji protokolüyle koordine edilir.',
          targetVolumes: [{ name: 'CTV_TBI', doseGy: 12, marginMm: 'Tüm vücut', anatomical: 'Total body / kemik iliği' }],
          oars: [{ organ: 'Akciğer', metric: 'Dmean', limit: 'Akciğer bloklama protokolü', source: 'Hematopoietic transplant protocol' }],
          systemicTherapy: 'ALL sistemik tedavisi ve KİT protokolü ile birlikte.',
          evidence: 'EBMT / ALL transplant conditioning guidance',
        };
        return { statusText: 'ENDİKE: ALL KİT HAZIRLIĞINDA TBI / CNS RİSKİNE GÖRE KRANİYAL RT', badgeClass: 'bg-indigo-50 text-indigo-800 border-indigo-300', primaryScheme: allScheme, alternativeSchemes: [allScheme] };
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
          technique: 'Konformal düşük doz dalak RT',
          indication: 'Semptomatik splenomegali veya lokal nodal KLL progresyonunda düşük doz palyatif RT; hematolojik toksisite için yakın takip.',
          targetVolumes: [{ name: 'CTV_Spleen', doseGy: 6, marginMm: 'Dalak + günlük görüntüleme marjini', anatomical: 'Dalak ve semptomatik nodal hacim' }],
          oars: [{ organ: 'Böbrekler', metric: 'Dmean', limit: 'Mümkün olduğunca düşük', source: 'ILROG' }],
          evidence: 'ILROG low-dose lymphoma guidance',
        };
        return { statusText: 'ENDİKE: KLL SEMPTOMATİK SPLENOMEGALİDE DÜŞÜK DOZ RT', badgeClass: 'bg-amber-50 text-amber-800 border-amber-300', primaryScheme: cllScheme, alternativeSchemes: [cllScheme] };
      }

      if (hematologicSubtype === 'Foliküler') {
        const flScheme: DoseScheme = {
          id: 'follicular-isrt-24',
          name: '24 Gy / 12 fx (Tutulu Alan RT - ISRT)',
          tag: '🎯 Foliküler Lenfoma ISRT',
          totalDoseGy: 24,
          fractionCount: 12,
          fractionDoseGy: 2,
          alphaBeta: 10,
          technique: 'IMRT / VMAT (ISRT Prensipleri)',
          indication: 'Erken evre foliküler lenfomada 24 Gy tutulu alan radyoterapisi yüksek lokal kontrol sağlar; ileri evre semptomatik hastalıkta düşük doz (2x2 Gy) palyasyon hematoloji konseyiyle değerlendirilir.',
          targetVolumes: [{ name: 'CTV_ISRT', doseGy: 24, marginMm: 'Pre-KT GTV ile sınırlı', anatomical: 'Tutulu lenf nodu bölgesi' }],
          oars: [{ organ: 'Komşu OAR', metric: 'Dmean', limit: 'ALARA prensibi', source: 'ILROG' }],
          evidence: 'ILROG Guidelines; FORT Trial',
        };
        return { statusText: 'ENDİKE: FOLİKÜLER LENFOMADA 24 GY TUTULU ALAN RT (ISRT)', badgeClass: 'bg-emerald-50 text-emerald-800 border-emerald-300', primaryScheme: flScheme, alternativeSchemes: [flScheme] };
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
        { name: 'GTV', doseGy: totalDoseGy, marginMm: 'Görüntüleme ve klinik semptomla tanımlanır', anatomical: anatomy },
        { name: 'CTV', doseGy: totalDoseGy, marginMm: 'Anatomik yayılım; elektif nodal hacim rutin değildir', anatomical: `${anatomy} ve gerekli komşu risk alanı` },
        { name: 'PTV', doseGy: totalDoseGy, marginMm: 'Hareket yönetimi ve günlük IGRT ile belirlenir', anatomical: 'Set-up ve organ hareketi güvenlik marjini' },
      ],
      oars: [{ organ: 'Kritik komşu organlar', metric: 'Dmax / Dmean', limit: 'Önceki RT ve güncel protokole göre doğrula', source: 'QUANTEC / kurumsal protokol' }],
      evidence: 'ASTRO / ESTRO; aktif kılavuz sürümü ve kurum protokolü doğrulanmalıdır.',
    });

    if (selectedOrgan === 'emergencies') {
      const emergencyPlans: Record<string, { status: string; primary: DoseScheme; alternatives: DoseScheme[] }> = {
        'emergency-mscc': {
          status: 'ACİL: SPİNAL KORD BASISI (MSCC)',
          primary: createFocusedPlan('mscc-20-5', '20 Gy / 5 fx · MSCC acil RT', 20, 5, 'Deksametazon + cerrahi uygunluk değerlendirmesi', 'MRI ile tanımlanan vertebral metastaz ve epidural hastalık', 'Deksametazon 16 mg IV stat, ardından 4 mg IV/PO 6 saatte bir. Tek seviyeli kompresyon ve uygun performansta Patchell cerrahi/dekompresyon kriterlerini değerlendir.', 'Acil IMRT / 3D-CRT + günlük IGRT'),
          alternatives: [
            createFocusedPlan('mscc-8-1', '8 Gy / 1 fx · kısa prognoz / cerrahiye uygun değil', 8, 1, 'Tek fraksiyon', 'MRI ile tanımlanan semptomatik vertebra ve epidural uzanım', 'Nörolojik durum, instabilite, önceki RT ve cerrahi uygunlukla birlikte seçilir.'),
            createFocusedPlan('mscc-30-10', '30 Gy / 10 fx · seçilmiş uygun prognoz', 30, 10, 'Çoklu fraksiyon', 'MRI ile tanımlanan vertebral metastaz ve epidural hastalık', 'Cerrahi/postoperatif plan, kümülatif kord dozu ve prognoz MDT ile değerlendirilir.'),
          ],
        },
        'emergency-svcs': {
          status: 'ACİL: VENA KAVA SUPERIOR SENDROMU',
          primary: createFocusedPlan('svcs-30-10', '30 Gy / 10 fx · öne yüklemeli torasik RT', 30, 10, 'İlk 2-3 fx: 3-4 Gy/fx, sonra tamamla', 'Vena kava superior obstrüksiyonuna neden olan primer kitle ve semptomatik nodal hastalık', 'İlk 2-3 fraksiyonda 3-4 Gy/fx öne yükleme, ardından toplam 30 Gy / 10 fx tamamlanması örnek bir yaklaşımdır; stabil hastada histoloji ve stent/sistemik tedavi seçenekleri değerlendirilir.'),
          alternatives: [createFocusedPlan('svcs-20-5', '20 Gy / 5 fx · kısa prognozda', 20, 5, 'İlk 2 fx öne yükleme, sonra tamamla', 'Vena kava superior obstrüksiyonuna neden olan makroskopik torasik kitle', 'Histoloji, semptom şiddeti ve klinik yanıtla uyarlanır.')],
        },
        'emergency-airway': {
          status: 'ACİL: TRAKEA / KARİNA HAVAYOLU OBSTRÜKSİYONU',
          primary: createFocusedPlan('airway-17-2', '16-17 Gy / 2 fx · dekompresif RT', 17, 2, 'Stridor / asfiksi riski', 'Trakea, ana bronş veya karinayı daraltan makroskopik tümör', 'Stridor veya asfiksi riski varsa hava yolu güvenliği ve girişimsel bronkoskopi RT’yi geciktirmeden değerlendirilir.'),
          alternatives: [
            createFocusedPlan('airway-8-1', '8 Gy / 1 fx · hızlı kısa şema', 8, 1, 'Tek fraksiyon', 'Hava yolunu daraltan makroskopik tümör', 'Anestezi, göğüs hastalıkları ve girişimsel bronkoskopiyle acil hava yolu yönetimi gerekir.'),
            createFocusedPlan('airway-20-5', '20 Gy / 5 fx · seçilmiş hasta', 20, 5, 'Çoklu fraksiyon', 'Hava yolunu daraltan makroskopik tümör', 'Klinik stabilite ve toleransa göre seçilir.'),
          ],
        },
        'emergency-hemorrhage': {
          status: 'ACİL: MASİF HEMORAJİ / HEMOSTATİK RT',
          primary: createFocusedPlan('hemorrhage-8-1', '8 Gy / 1 fx · hemostatik RT', 8, 1, 'Hızlı hemostaz', 'Hemoptizi, jinekolojik kanama veya hematüri odağındaki makroskopik tümör', 'Resüsitasyon ve kanama odağının endoskopik/girişimsel kontrolü önceliklidir; RT bunları geciktirmemelidir.'),
          alternatives: [createFocusedPlan('hemorrhage-14-8-4', '14.8 Gy / 4 fx BID · en az 6 saat ara', 14.8, 4, 'Quad Shot hemostatik şema', 'Kanayan makroskopik tümör ve gerekli anatomik komşuluk', 'Kanama odağı ve klinik stabiliteye göre seçilir.')],
        },
        'emergency-icp': {
          status: 'ACİL: AKUT KİBAS / BEYİN HERNIASYONU',
          primary: createFocusedPlan('icp-20-5', '20 Gy / 5 fx · acil WBRT', 20, 5, 'Mannitol %20 + deksametazon + stabilizasyon', 'Tüm beyin parankimi; kontrastlı beyin MRI/BT ile metastaz değerlendirmesi', 'Hava yolu/nörolojik stabilizasyon, mannitol %20, deksametazon ve acil nöroşirürji değerlendirmesi RT ile eşzamanlı yürütülür.'),
          alternatives: [createFocusedPlan('icp-30-10', '30 Gy / 10 fx · uygun prognozda WBRT', 30, 10, 'Çoklu fraksiyon', 'Tüm beyin parankimi; lens ve optik yapılar doz optimizasyonuna alınır', 'Cerrahi veya SRS uygunluğu gecikmeden değerlendirilir; prognoz ve sistemik seçeneklere göre seçilir.')],
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
          status: 'ENDİKE: KEMİK METASTAZI AĞRI PALYASYONU',
          primary: createFocusedPlan('bone-palliation-8-1', '8 Gy / 1 fx · kategori 1 analjezi', 8, 1, 'Kemik metastazı', 'Semptomatik kemik metastazı; görüntüleme ile tanımlanan lezyon', '8 Gy tek fraksiyon etkili ağrı palyasyonu sağlar; yeniden ışınlama ve kırık/instabilite riski ayrıca değerlendirilir.'),
          alternatives: [
            createFocusedPlan('bone-palliation-20-5', '20 Gy / 5 fx · çoklu fraksiyon', 20, 5, 'Alternatif analjezik şema', 'Semptomatik kemik metastazı', 'Prognoz, önceki RT ve hasta tercihiyle seçilir.'),
            createFocusedPlan('bone-palliation-sbrt', 'SBRT · seçilmiş oligo-metastatik hedef', 30, 5, 'SBRT / IGRT', 'Sınırlı sayıda, uygun anatomideki metastatik hedef', 'SBRT; kord basısı, instabilite ve kırık riski dışlandıktan sonra seçilmiş hastada değerlendirilir.', 'SBRT / IGRT'),
          ],
        },
        Beyin: {
          status: 'ELEKTİF: BEYİN METASTAZI · SRS / WBRT',
          primary: createFocusedPlan('brain-ha-wbrt-30-10', '30 Gy / 10 fx · HA-WBRT + memantin', 30, 10, 'Elektif beyin metastazı', 'Tüm beyin; hipokampus koruması uygunsa HA-WBRT planlanır', 'Hipokampus koruması ve memantin bilişsel korunma için değerlendirilir; 1-4 uygun lezyonda SRS tercih ölçütleri multidisipliner doğrulanır.'),
          alternatives: [createFocusedPlan('brain-srs-27-3', '27 Gy / 3 fx · seçilmiş SRS/FSRT', 27, 3, 'SRS / FSRT', 'Sınırlı sayıda ve boyutta beyin metastazı; MRI tabanlı GTV/CTV/PTV', 'Lezyon sayısı, hacmi, yerleşimi, semptomlar ve sistemik tedaviye göre SRS/FSRT uygunluğu değerlendirilir.', 'SRS / IGRT')],
        },
        Organ: {
          status: 'ENDİKE: ORGAN / YUMUŞAK DOKU METASTAZI PALYASYONU',
          primary: createFocusedPlan('soft-tissue-palliation-20-5', '20 Gy / 5 fx · organ / yumuşak doku palliasyonu', 20, 5, 'Semptomatik viseral veya yumuşak doku hedefi', 'Karaciğer kapsül ağrısı, pelvik kitle veya semptomatik yumuşak doku metastazı', 'Semptomatik makroskopik hedef ve gerekli anatomik komşuluk ışınlanır; elektif nodal alan rutin değildir.'),
          alternatives: [createFocusedPlan('soft-tissue-palliation-8-1', '8 Gy / 1 fx · kısa semptomatik şema', 8, 1, 'Kısa prognoz / hızlı palyasyon', 'Semptomatik viseral veya yumuşak doku metastazı', 'Organ toleransı, önceki RT ve kanama/obstrüksiyon riski doğrulanır.')],
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

  // Fraksiyonasyon felsefesi kartları için klinik uygunluk kapısı
  const isRegimenEligible = (regimen: 'ultra_hypo' | 'moderate_hypo' | 'sib_boost' | 'conventional'): boolean => {
    if (selectedOrgan === 'prostate') {
      const lowBurden = gusSubtype === 'prostate' && selectedN === 'N0' && selectedM === 'M0' && !hasSVI && selectedT !== 'T3b' && selectedT !== 'T4';
      if (regimen === 'ultra_hypo') return lowBurden;
      if (regimen === 'sib_boost') return gusSubtype === 'prostate' && (selectedN === 'N1' || hasSVI || hasECE || selectedT === 'T3a' || selectedT === 'T3b' || selectedT === 'T4');
      return true;
    }
    if (selectedOrgan === 'thorax') {
      const earlyStage = thoraxSubtype === 'nsclc' && selectedM === 'M0' && selectedN === 'N0' && (selectedT.startsWith('T1') || selectedT === 'T2');
      if (regimen === 'ultra_hypo') return earlyStage;
      if (regimen === 'moderate_hypo') return thoraxSubtype === 'nsclc';
      if (regimen === 'sib_boost') return thoraxSubtype === 'nsclc' && !earlyStage && selectedM === 'M0';
      return true;
    }
    if (selectedOrgan === 'breast') {
      const bcsCandidate = breastSurgery === 'MKC' && breastHistology !== 'İnflamatuar Meme Kanseri (IBC)' && breastHistology !== 'Malign Filloides Tümörü';
      if (regimen === 'ultra_hypo') return bcsCandidate;
      if (regimen === 'moderate_hypo') return true;
      if (regimen === 'sib_boost') return bcsCandidate && breastBoost;
      return true;
    }
    if (selectedOrgan === 'head-neck') {
      if (regimen === 'sib_boost') return true;
      if (regimen === 'conventional') return true;
      return false;
    }
    if (regimen === 'sib_boost') return false;
    return true;
  };

  const effectiveRegimen: 'ultra_hypo' | 'moderate_hypo' | 'sib_boost' | 'conventional' = useMemo(() => {
    if (selectedRegimen !== 'clinical' && isRegimenEligible(selectedRegimen)) return selectedRegimen;
    if (selectedOrgan === 'thorax') {
      const earlyStage = thoraxSubtype === 'nsclc' && selectedM === 'M0' && selectedN === 'N0' && (selectedT.startsWith('T1') || selectedT === 'T2');
      return earlyStage ? 'ultra_hypo' : 'conventional';
    }
    if (selectedOrgan === 'prostate') return 'moderate_hypo';
    if (selectedOrgan === 'breast') return 'moderate_hypo';
    if (selectedOrgan === 'head-neck') return 'sib_boost';
    return 'conventional';
  }, [selectedRegimen, selectedOrgan, thoraxSubtype, selectedM, selectedN, selectedT, gusSubtype, hasSVI, hasECE, breastSurgery, breastHistology, breastBoost]);

  const lungSubSchemesByPhilosophy: Record<'ultra_hypo' | 'moderate_hypo' | 'sib_boost' | 'conventional', DoseScheme[]> = useMemo(() => {
    const lungSbrtTechnique = breathingMotion === 'DIBH'
      ? 'DIBH (Derin İnspiryumda Nefes Tutma) + SGRT (Optik Yüzey Rehberliği) / VMAT'
      : 'SBRT (4D-CT / ITV tabanlı VMAT)';

    const sbrt54: DoseScheme = {
      id: 'lung-sbrt-54',
      name: '54 Gy / 3 fx (Periferik SBRT · 18 Gy/fx)',
      tag: '🎯 Periferik SBRT',
      totalDoseGy: 54,
      fractionCount: 3,
      fractionDoseGy: 18,
      alphaBeta: 10,
      technique: lungSbrtTechnique,
      indication: 'Periferik erken evre KHDAK (Kategori 1 küratif altın standart, BED10 = 151.2 Gy).',
      targetVolumes: getLungSbrtTargets(54, breathingMotion),
      oars: [
        { organ: 'Bilateral Akciğer', metric: 'V20Gy', limit: '< 10-15%', source: 'RTOG 0236' },
        { organ: 'Göğüs Duvarı', metric: 'V30Gy', limit: '< 30 cc', source: 'RTOG 0236' },
      ],
      evidence: 'RTOG 0236, RTOG 0915, NCCN v1.2025 Kategori 1',
      evidenceLinks: LUNG_SBRT_EVIDENCE_LINKS,
    };

    const sbrt48: DoseScheme = {
      id: 'lung-sbrt-48',
      name: '48 Gy / 4 fx (Periferik 4 fx · 12 Gy/fx)',
      tag: '🎯 Periferik 4 fx',
      totalDoseGy: 48,
      fractionCount: 4,
      fractionDoseGy: 12,
      alphaBeta: 10,
      technique: lungSbrtTechnique,
      indication: 'Göğüs duvarına komşu veya fraksiyon başına doz toksisitesi sınırlandırılmak istenen periferik erken evre KHDAK (BED10 = 105.6 Gy).',
      targetVolumes: getLungSbrtTargets(48, breathingMotion),
      oars: [
        { organ: 'Bilateral Akciğer', metric: 'V20Gy', limit: '< 10-15%', source: 'RTOG 0915' },
        { organ: 'Göğüs Duvarı', metric: 'V30Gy', limit: '< 30 cc', source: 'RTOG 0915' },
      ],
      evidence: 'RTOG 0915, NCCN v1.2025',
      evidenceLinks: LUNG_SBRT_0915_EVIDENCE_LINKS,
    };

    const sbrt50: DoseScheme = {
      id: 'lung-sbrt-50',
      name: '50 Gy / 5 fx (Risk-Uyumlu SBRT · 10 Gy/fx)',
      tag: '⚠️ Risk-Uyumlu SBRT',
      totalDoseGy: 50,
      fractionCount: 5,
      fractionDoseGy: 10,
      alphaBeta: 10,
      technique: `${lungSbrtTechnique} (Risk-Adapte)`,
      indication: 'PBT ≤2 cm komşu santral lezyonlar veya santral risk anatomisi (BED10 = 100 Gy). Fatal hemoptizi ve bronşiyal fistülü önlemek için 5 fraksiyon standardı.',
      targetVolumes: getLungSbrtTargets(50, breathingMotion),
      oars: [
        { organ: 'Proksimal Bronş Ağacı', metric: 'Dmax', limit: '< 50 Gy', source: 'RTOG 0813' },
        { organ: 'Bilateral Akciğer', metric: 'V20Gy', limit: '< 10-15%', source: 'RTOG 0813' },
      ],
      evidence: 'RTOG 0813 (Bezjak et al. JCO 2019), NCCN v1.2025 Kategori 1',
      evidenceLinks: LUNG_SBRT_0813_EVIDENCE_LINKS,
    };

    const hypo55: DoseScheme = {
      id: 'lung-hypo-55',
      name: '55 Gy / 20 fx (Ilımlı HipoToraks · 2.75 Gy/fx)',
      tag: '🎯 Ilımlı HipoToraks',
      totalDoseGy: 55,
      fractionCount: 20,
      fractionDoseGy: 2.75,
      alphaBeta: 10,
      technique: 'IMRT / VMAT + Günlük CBCT',
      indication: 'Lokal/medikal inoperabl veya hafif fraksiyonasyon gerektiren toraks RT (UK CHAT, ESTRO konsensus; BED10 = 70.1 Gy, EQD2 = 58.4 Gy).',
      targetVolumes: [
        { name: 'GTV', doseGy: 55, marginMm: '0 mm', anatomical: 'Primer kitle (BT/PET füzyonu)' },
        { name: 'CTV', doseGy: 55, marginMm: 'GTV + 5 mm', anatomical: 'Mikroskobik yayılım payı' },
        { name: 'PTV_Hypo', doseGy: 55, marginMm: 'CTV + 5 mm', anatomical: 'Solunum ve set-up zarfı' },
      ],
      oars: [
        { organ: 'Bilateral Akciğer', metric: 'V20Gy', limit: '< 25%', source: 'UK CHAT / ESTRO' },
        { organ: 'Spinal Kord', metric: 'Dmax', limit: '< 45 Gy', source: 'QUANTEC' },
        { organ: 'Özofagus', metric: 'Dmean', limit: '< 34 Gy', source: 'QUANTEC' },
      ],
      evidence: 'UK CHAT / ESTRO Consensus Guideline',
      evidenceLinks: LUNG_HYPO_EVIDENCE_LINKS,
    };

    const hypo60: DoseScheme = {
      id: 'lung-hypo-60',
      name: '60 Gy / 15 fx (Hızlandırılmış Hipo · 4.0 Gy/fx)',
      tag: '⚡ Hızlandırılmış Hipo',
      totalDoseGy: 60,
      fractionCount: 15,
      fractionDoseGy: 4.0,
      alphaBeta: 10,
      technique: 'IMRT / VMAT (4D-CT rehberliğinde)',
      indication: 'Hızlandırılmış hipofraksiyone torasik radyoterapi (Kanada / Hollanda rejimi; BED10 = 84 Gy, EQD2 = 70 Gy).',
      targetVolumes: [
        { name: 'GTV', doseGy: 60, marginMm: '0 mm', anatomical: 'Primer kitle (BT/PET füzyonu)' },
        { name: 'CTV', doseGy: 60, marginMm: 'GTV + 5 mm', anatomical: 'Mikroskobik yayılım payı' },
        { name: 'PTV_Hypo', doseGy: 60, marginMm: 'CTV + 5 mm', anatomical: 'Set-up ve solunum güvenlik payı' },
      ],
      oars: [
        { organ: 'Bilateral Akciğer', metric: 'V20Gy', limit: '< 20-25%', source: 'Canadian/Dutch Protocol' },
        { organ: 'Spinal Kord', metric: 'Dmax', limit: '< 40 Gy', source: 'QUANTEC' },
        { organ: 'Özofagus', metric: 'Dmean', limit: '< 30 Gy', source: 'QUANTEC' },
      ],
      evidence: 'Canadian / Dutch Regimen (Accelerated Hypofractionation)',
      evidenceLinks: LUNG_HYPO_EVIDENCE_LINKS,
    };

    const hypo45: DoseScheme = {
      id: 'lung-hypo-45',
      name: '45 Gy / 15 fx (Hafif Hipo · 3.0 Gy/fx)',
      tag: '🛡️ Hafif Hipo',
      totalDoseGy: 45,
      fractionCount: 15,
      fractionDoseGy: 3.0,
      alphaBeta: 10,
      technique: 'IMRT / 3D-CRT',
      indication: 'Medikal olarak kırılgan, komorbiditeli veya inoperabl hastalar için hafif hipofraksiyon (BED10 = 58.5 Gy, EQD2 = 48.8 Gy).',
      targetVolumes: [
        { name: 'GTV', doseGy: 45, marginMm: '0 mm', anatomical: 'Primer kitle' },
        { name: 'PTV', doseGy: 45, marginMm: 'GTV + 7 mm', anatomical: 'Set-up ve solunum zarfı' },
      ],
      oars: [
        { organ: 'Bilateral Akciğer', metric: 'V20Gy', limit: '< 20%', source: 'QUANTEC' },
        { organ: 'Spinal Kord', metric: 'Dmax', limit: '< 36 Gy', source: 'QUANTEC' },
      ],
      evidence: 'Medically Fragile / Inoperable Lung Regimen',
      evidenceLinks: LUNG_HYPO_EVIDENCE_LINKS,
    };

    const conv60: DoseScheme = {
      id: 'lung-conv-60',
      name: '60 Gy / 30 fx (Standart Definitif RT · 2.0 Gy/fx)',
      tag: '🎯 Standart Definitif',
      totalDoseGy: 60,
      fractionCount: 30,
      fractionDoseGy: 2.0,
      alphaBeta: 10,
      technique: 'IMRT / VMAT (Elektif Nodal Işınlama Yapılmaz)',
      indication: 'Lokalize veya erken/lokal ileri KHDAK standart konvansiyonel definitif fraksiyonasyon (RTOG 0617 standardı, BED10 = 72 Gy, EQD2 = 60 Gy).',
      targetVolumes: [
        { name: 'GTV', doseGy: 60, marginMm: '0 mm', anatomical: 'Primer kitle (BT/PET füzyonu)' },
        { name: 'CTV', doseGy: 60, marginMm: 'GTV + 5 mm', anatomical: 'Mikroskobik tutulum payı' },
        { name: 'PTV', doseGy: 60, marginMm: 'CTV + 5 mm', anatomical: 'Solunum ve set-up güvenlik zarfı' },
      ],
      oars: [
        { organ: 'Bilateral Akciğer', metric: 'V20Gy', limit: '< 30-35%', source: 'RTOG 0617' },
        { organ: 'Kalp Mean Doz', metric: 'Dmean', limit: '< 15 Gy', source: 'RTOG 0617 (OS Belirleyicisi)' },
        { organ: 'Spinal Kord', metric: 'Dmax', limit: '< 45 Gy', source: 'QUANTEC' },
        { organ: 'Özofagus', metric: 'Dmean', limit: '< 34 Gy', source: 'QUANTEC' },
      ],
      evidence: 'RTOG 0617 (Lancet Oncol 2015), NCCN v1.2025 Kategori 1',
      evidenceLinks: LUNG_CONV_0617_EVIDENCE_LINKS,
    };

    const conv66: DoseScheme = {
      id: 'lung-conv-66',
      name: '66 Gy / 33 fx (Eskalasyon Dozu · 2.0 Gy/fx)',
      tag: '⚡ Eskalasyon Dozu',
      totalDoseGy: 66,
      fractionCount: 33,
      fractionDoseGy: 2.0,
      alphaBeta: 10,
      technique: 'IMRT / VMAT',
      indication: 'OAR kısıtları elveren, seçilmiş anatomik uygun KHDAK olgularında kontrollü doz eskalasyonu (BED10 = 79.2 Gy, EQD2 = 66 Gy).',
      targetVolumes: [
        { name: 'GTV', doseGy: 66, marginMm: '0 mm', anatomical: 'Primer kitle' },
        { name: 'CTV', doseGy: 66, marginMm: 'GTV + 5 mm', anatomical: 'Mikroskobik tutulum payı' },
        { name: 'PTV_Boost', doseGy: 66, marginMm: 'CTV + 5 mm', anatomical: 'Set-up ve solunum güvenlik payı' },
      ],
      oars: [
        { organ: 'Bilateral Akciğer', metric: 'V20Gy', limit: '< 30%', source: 'RTOG 0617' },
        { organ: 'Kalp Mean Doz', metric: 'Dmean', limit: '< 15 Gy', source: 'RTOG 0617' },
        { organ: 'Spinal Kord', metric: 'Dmax', limit: '< 45 Gy', source: 'QUANTEC' },
      ],
      evidence: 'Doz Eskalasyonu Protokolü (RTOG / NCCN)',
      evidenceLinks: LUNG_CONV_0617_EVIDENCE_LINKS,
    };

    const sib60: DoseScheme = {
      id: 'lung-sib-60',
      name: '60 Gy / 30 fx (Eşzamanlı KRT + SIB Boost)',
      tag: '🧬 Eşzamanlı SIB',
      totalDoseGy: 60,
      fractionCount: 30,
      fractionDoseGy: 2.0,
      alphaBeta: 10,
      technique: 'IMRT / VMAT SIB',
      indication: 'Primer kitle 60 Gy (2.0 Gy/fx) + Elektif mediastinal lenf nodları 50 Gy (1.67 Gy/fx) / 30 fx eşzamanlı entegre boost.',
      targetVolumes: [
        { name: 'PTV_High (Primer Kitle)', doseGy: 60, marginMm: 'CTV + 5 mm', anatomical: 'GTV primer kitle ve pozitif nodlar' },
        { name: 'PTV_Low (Elektif Mediasten)', doseGy: 50, marginMm: 'Anatomik', anatomical: 'Elektif nodal istasyonlar (SIB)' },
      ],
      oars: [
        { organ: 'Bilateral Akciğer', metric: 'V20Gy', limit: '< 30-35%', source: 'RTOG 0617' },
        { organ: 'Kalp Mean Doz', metric: 'Dmean', limit: '< 15 Gy', source: 'RTOG 0617' },
        { organ: 'Spinal Kord', metric: 'Dmax', limit: '< 45 Gy', source: 'QUANTEC' },
      ],
      evidence: 'RTOG 0617 / PACIFIC SIB Yaklaşımı',
      evidenceLinks: LUNG_CONV_0617_EVIDENCE_LINKS,
    };

    const sbrtList = thoraxCentrality === 'Central'
      ? [sbrt50, sbrt54, sbrt48]
      : [sbrt54, sbrt48, sbrt50];

    return {
      ultra_hypo: sbrtList,
      moderate_hypo: [hypo55, hypo60, hypo45],
      conventional: [conv60, conv66],
      sib_boost: [sib60],
    };
  }, [breathingMotion, thoraxCentrality]);

  const availableSubSchemes: DoseScheme[] = useMemo(() => {
    if (selectedOrgan === 'thorax' && thoraxSubtype === 'nsclc') {
      const schemes = lungSubSchemesByPhilosophy[effectiveRegimen];
      if (schemes && schemes.length > 0) return schemes;
    }
    return evaluatedDecision.alternativeSchemes;
  }, [selectedOrgan, thoraxSubtype, lungSubSchemesByPhilosophy, effectiveRegimen, evaluatedDecision.alternativeSchemes]);

  const handleSelectPhilosophy = (regimen: 'ultra_hypo' | 'moderate_hypo' | 'sib_boost' | 'conventional') => {
    setSelectedRegimen(regimen);
    if (selectedOrgan === 'thorax' && thoraxSubtype === 'nsclc') {
      const list = lungSubSchemesByPhilosophy[regimen];
      if (list && list.length > 0) {
        setSelectedSchemeId(list[0].id);
      }
    }
  };

  // Aktif Şema
  const baseActiveScheme = useMemo(() => {
    const list = evaluatedDecision.alternativeSchemes;
    return list.find(s => s.id === selectedSchemeId) || evaluatedDecision.primaryScheme;
  }, [evaluatedDecision, selectedSchemeId]);

  const isSclcTurrisiScheme = useMemo(() => selectedOrgan === 'thorax'
    && thoraxSubtype === 'sclc'
    && baseActiveScheme.id === 'sclc-turrisi-45',
  [selectedOrgan, thoraxSubtype, baseActiveScheme]);

  const activeScheme: DoseScheme = useMemo(() => {
    if (selectedOrgan === 'thorax' && thoraxSubtype === 'nsclc') {
      if (availableSubSchemes.length > 0) {
        const found = availableSubSchemes.find(s => s.id === selectedSchemeId);
        if (found) return found;
        return availableSubSchemes[0];
      }
    }

    const regimenByOrgan: Partial<Record<OrganId, Record<Exclude<QuickCaseRegimen, 'clinical'>, { name: string; totalDoseGy: number; fractionCount: number; fractionDoseGy: number; alphaBeta: number; evidenceObj?: RegimenEvidence }>>> = {
      prostate: {
        ultra_hypo: { name: 'Ultra-Hypofractionated / SBRT (PACE-B)', totalDoseGy: 36.25, fractionCount: 5, fractionDoseGy: 7.25, alphaBeta: 1.5, evidenceObj: { landmarkTrial: { shortName: 'PACE-B', citation: 'NEJM 2024', doiUrl: 'https://doi.org/10.1056/NEJMoa191143' }, nccn: { pdfUrl: 'https://www.nccn.org/professionals/physician_gls/pdf/prostate.pdf', targetPage: 50, sectionCode: 'PROS-E', sectionTitle: 'Principles of Radiation Therapy' } } },
        moderate_hypo: { name: 'Moderate Hypofractionation (CHHiP / PROFIT)', totalDoseGy: 60, fractionCount: 20, fractionDoseGy: 3, alphaBeta: 1.5, evidenceObj: { landmarkTrial: { shortName: 'CHHiP', citation: 'Lancet Oncol 2016', doiUrl: 'https://doi.org/10.1016/S1470-2045(16)30102-1' }, nccn: { pdfUrl: 'https://www.nccn.org/professionals/physician_gls/pdf/prostate.pdf', targetPage: 50, sectionCode: 'PROS-E', sectionTitle: 'Principles of Radiation Therapy' } } },
        sib_boost: { name: 'SIB Boost: Prostate 70 Gy + Pelvic Nodes 56 Gy / 28 fx', totalDoseGy: 70, fractionCount: 28, fractionDoseGy: 2.5, alphaBeta: 1.5 },
        conventional: { name: 'Conventional Prostate RT', totalDoseGy: 78, fractionCount: 39, fractionDoseGy: 2, alphaBeta: 1.5 },
      },
      thorax: {
        ultra_hypo: { name: 'Lung SBRT (54 Gy / 3 fx)', totalDoseGy: 54, fractionCount: 3, fractionDoseGy: 18, alphaBeta: 10, evidenceObj: { landmarkTrial: { shortName: 'RTOG 0236', citation: 'JAMA 2010', doiUrl: 'https://doi.org/10.1001/jama.2010.261' }, nccn: { pdfUrl: 'https://www.nccn.org/professionals/physician_gls/pdf/nscl.pdf', targetPage: 77, sectionCode: 'NSCL-C', sectionTitle: 'Principles of Radiation Therapy' }, astro: { title: 'ASTRO SBRT Guideline', url: 'https://www.astro.org/provider-resources/guidelines/astro-s-guideline-on-sbrt-for-early-stage-nsclc' }, estro: { title: 'ESTRO ACROP SBRT', url: 'https://doi.org/10.1016/j.radonc.2017.05.012' } } },
        moderate_hypo: { name: 'Lung Hypofractionation (55 Gy / 20 fx)', totalDoseGy: 55, fractionCount: 20, fractionDoseGy: 2.75, alphaBeta: 10 },
        sib_boost: { name: 'Concurrent Chemoradiotherapy (60 Gy / 30 fx)', totalDoseGy: 60, fractionCount: 30, fractionDoseGy: 2, alphaBeta: 10 },
        conventional: isSclcTurrisiScheme
          ? {
              name: lang === 'tr'
                ? 'Akselere Hiperfraksiyonasyon (1.5 Gy BID / 30 fx, ~ 6 saat ara) - Turrisi'
                : 'Accelerated hyperfractionation (1.5 Gy BID / 30 fx, ~ 6 hours apart) - Turrisi',
              totalDoseGy: 45,
              fractionCount: 30,
              fractionDoseGy: 1.5,
              alphaBeta: 10,
            }
          : { name: 'Conventional Thoracic RT (60 Gy / 30 fx)', totalDoseGy: 60, fractionCount: 30, fractionDoseGy: 2, alphaBeta: 10, evidenceObj: { landmarkTrial: { shortName: 'RTOG 0617', citation: 'Lancet Oncol 2015', doiUrl: 'https://doi.org/10.1016/S1470-2045(14)71207-0' }, nccn: { pdfUrl: 'https://www.nccn.org/professionals/physician_gls/pdf/nscl.pdf', targetPage: 77, sectionCode: 'NSCL-C', sectionTitle: 'Principles of Radiation Therapy' }, estro: { title: 'ESTRO ACROP Stage III', url: 'https://doi.org/10.1016/j.radonc.2021.03.016' } } },
      },
      breast: {
        ultra_hypo: { name: 'Ultra-Hypofractionation (FAST-Forward)', totalDoseGy: 26, fractionCount: 5, fractionDoseGy: 5.2, alphaBeta: 4, evidenceObj: { landmarkTrial: { shortName: 'FAST-Forward', citation: 'Lancet 2020', doiUrl: 'https://doi.org/10.1016/S0140-6736(20)30932-6' }, nccn: { pdfUrl: 'https://www.nccn.org/professionals/physician_gls/pdf/breast.pdf', targetPage: 95, sectionCode: 'BINV-I', sectionTitle: 'Principles of Radiation Therapy' } } },
        moderate_hypo: { name: 'Moderate Hypofractionation (40.05 Gy / 15 fx)', totalDoseGy: 40.05, fractionCount: 15, fractionDoseGy: 2.67, alphaBeta: 4, evidenceObj: { landmarkTrial: { shortName: 'START-B', citation: 'Lancet 2008', doiUrl: 'https://doi.org/10.1016/S1470-2045(08)70077-9' }, nccn: { pdfUrl: 'https://www.nccn.org/professionals/physician_gls/pdf/breast.pdf', targetPage: 95, sectionCode: 'BINV-I', sectionTitle: 'Principles of Radiation Therapy' }, astro: { title: 'ASTRO Whole Breast Hypo', url: 'https://doi.org/10.1016/j.prro.2018.01.012' } } },
        sib_boost: { name: 'Whole Breast 40.05 Gy + Cavity SIB 48 Gy / 15 fx', totalDoseGy: 40.05, fractionCount: 15, fractionDoseGy: 2.67, alphaBeta: 4 },
        conventional: { name: 'Conventional Breast RT (50 Gy / 25 fx)', totalDoseGy: 50, fractionCount: 25, fractionDoseGy: 2, alphaBeta: 4 },
      },
      'head-neck': {
        ultra_hypo: { name: 'SBRT Re-irradiation', totalDoseGy: 40, fractionCount: 5, fractionDoseGy: 8, alphaBeta: 10 },
        moderate_hypo: { name: 'Hypofractionated Palliation', totalDoseGy: 30, fractionCount: 10, fractionDoseGy: 3, alphaBeta: 10 },
        sib_boost: { name: 'Definitive SIB (70 Gy / 56 Gy in 35 fx)', totalDoseGy: 70, fractionCount: 35, fractionDoseGy: 2, alphaBeta: 10, evidenceObj: { landmarkTrial: { shortName: 'RTOG 0129', citation: 'NEJM 2010', doiUrl: 'https://doi.org/10.1056/NEJMoa1003466' }, nccn: { pdfUrl: 'https://www.nccn.org/professionals/physician_gls/pdf/head-and-neck.pdf', targetPage: 85, sectionCode: 'HEAD-F', sectionTitle: 'Principles of Radiation Therapy' } } },
        conventional: { name: 'Conventional RT (70 Gy / 35 fx)', totalDoseGy: 70, fractionCount: 35, fractionDoseGy: 2, alphaBeta: 10 },
      },
      gis: {
        ultra_hypo: { name: 'Rectum Short-Course (25 Gy / 5 fx)', totalDoseGy: 25, fractionCount: 5, fractionDoseGy: 5, alphaBeta: 10, evidenceObj: { landmarkTrial: { shortName: 'RAPIDO', citation: 'Lancet Oncol 2020', doiUrl: 'https://doi.org/10.1016/S1470-2045(20)30555-6' }, nccn: { pdfUrl: 'https://www.nccn.org/professionals/physician_gls/pdf/rectal.pdf', targetPage: 45, sectionCode: 'REC-E', sectionTitle: 'Principles of Radiation Therapy' } } },
        moderate_hypo: { name: 'GI Hypofractionation', totalDoseGy: 40.05, fractionCount: 15, fractionDoseGy: 2.67, alphaBeta: 10 },
        sib_boost: { name: 'Rectum SIB', totalDoseGy: 50.4, fractionCount: 28, fractionDoseGy: 1.8, alphaBeta: 10 },
        conventional: { name: 'Rectum Long-Course (50.4 Gy / 28 fx)', totalDoseGy: 50.4, fractionCount: 28, fractionDoseGy: 1.8, alphaBeta: 10 },
      },
      cns: {
        ultra_hypo: { name: 'SRS Brain Mets', totalDoseGy: 20, fractionCount: 1, fractionDoseGy: 20, alphaBeta: 12 },
        moderate_hypo: { name: 'Glioblastoma Elderly Hypo (40.05 Gy / 15 fx)', totalDoseGy: 40.05, fractionCount: 15, fractionDoseGy: 2.67, alphaBeta: 10, evidenceObj: { landmarkTrial: { shortName: 'Roa et al', citation: 'JCO 2004', doiUrl: 'https://ascopubs.org/doi/10.1200/JCO.2004.12.114' }, nccn: { pdfUrl: 'https://www.nccn.org/professionals/physician_gls/pdf/cns.pdf', targetPage: 40, sectionCode: 'BRAIN-A', sectionTitle: 'Principles of Radiation Therapy' } } },
        sib_boost: { name: 'Glioblastoma SIB', totalDoseGy: 60, fractionCount: 30, fractionDoseGy: 2, alphaBeta: 10 },
        conventional: { name: 'Glioblastoma Stupp (60 Gy / 30 fx)', totalDoseGy: 60, fractionCount: 30, fractionDoseGy: 2, alphaBeta: 10, evidenceObj: { landmarkTrial: { shortName: 'Stupp et al', citation: 'NEJM 2005', doiUrl: 'https://doi.org/10.1056/NEJMoa043489' }, nccn: { pdfUrl: 'https://www.nccn.org/professionals/physician_gls/pdf/cns.pdf', targetPage: 40, sectionCode: 'BRAIN-A', sectionTitle: 'Principles of Radiation Therapy' } } },
      },
      palliative: {
        ultra_hypo: { name: 'Palliative 8 Gy / 1 fx', totalDoseGy: 8, fractionCount: 1, fractionDoseGy: 8, alphaBeta: 10, evidenceObj: { landmarkTrial: { shortName: 'RTOG 9714', citation: 'JCO 2005', doiUrl: 'https://ascopubs.org/doi/10.1200/JCO.2005.04.110' }, astro: { title: 'Palliative Bone Metastases Guideline', url: 'https://doi.org/10.1016/j.prro.2017.02.001' }, nccn: { pdfUrl: 'https://www.nccn.org/professionals/physician_gls/pdf/palliative.pdf', targetPage: 1, sectionCode: 'PAL-A', sectionTitle: 'Palliative RT' } } },
        moderate_hypo: { name: 'Palliative 20 Gy / 5 fx', totalDoseGy: 20, fractionCount: 5, fractionDoseGy: 4, alphaBeta: 10 },
        sib_boost: { name: 'Palliative SIB', totalDoseGy: 30, fractionCount: 10, fractionDoseGy: 3, alphaBeta: 10 },
        conventional: { name: 'Palliative 30 Gy / 10 fx', totalDoseGy: 30, fractionCount: 10, fractionDoseGy: 3, alphaBeta: 10 },
      }
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
      // Yalnızca primer hedef hacim dozu felsefeye uyarlanır; nodal/boost seviyeleri korunur
      targetVolumes: baseActiveScheme.targetVolumes.map(volume => {
        if (selectedOrgan === 'breast' && selectedRegimen === 'sib_boost' && /boost|tumor.?bed|kavite/i.test(`${volume.name} ${volume.anatomical}`)) {
          return { ...volume, doseGy: 48 };
        }
        if (selectedOrgan === 'prostate' && selectedRegimen === 'sib_boost' && /pelvic|pelvis|pelvik|nodal|lenf nod/i.test(`${volume.name} ${volume.anatomical}`)) {
          return { ...volume, doseGy: 56 };
        }
        return {
          ...volume,
          doseGy: volume.doseGy === baseActiveScheme.totalDoseGy ? regimen.totalDoseGy : volume.doseGy,
        };
      }).concat(selectedOrgan === 'prostate' && selectedRegimen === 'sib_boost' ? [{
        name: 'PTV_Pelvic_Nodes',
        doseGy: 56,
        marginMm: 'Elective nodal CTV->PTV +5 mm',
        anatomical: 'Pelvik elektif lenf nodları; uygun evreleme ve görüntülemeyle',
      }] : []),
    };
  }, [
    selectedOrgan,
    thoraxSubtype,
    availableSubSchemes,
    selectedSchemeId,
    baseActiveScheme,
    selectedRegimen,
    isRegimenEligible,
    isSclcTurrisiScheme,
    lang,
    selectedT,
    selectedN,
    selectedM,
    gusSubtype,
    hasSVI,
    hasECE,
    breastSurgery,
    breastHistology,
  ]);

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
      () => window.alert(lang === 'tr' ? 'Vaka sorusu panoya kopyalanamadı.' : 'The case prompt could not be copied.'),
    );
  };
  const handleFileProcess = (file: File) => {
    if (!file) return;
    setUploadedFileName(file.name);
    const isTextFile = file.type.startsWith('text/') || /\.(txt|csv|json|xml|html?)$/i.test(file.name);
    if (!isTextFile) {
      window.alert(lang === 'tr'
        ? 'Bu dosya türü seçildi ancak tarayıcıda doğrudan metin çıkarılamıyor. PDF/DOC/Görsel içeriğini OCR veya metin olarak aşağıdaki alana yapıştırın.'
        : 'This file type was selected, but direct browser text extraction is unavailable. Paste PDF/DOC/image content as OCR or text below.');
      return;
    }
    const reader = new FileReader();
    reader.onload = event => {
      const raw = event.target?.result;
      if (typeof raw !== 'string') {
        window.alert(lang === 'tr' ? 'Dosya metni okunamadı.' : 'The file text could not be read.');
        return;
      }
      setReportInputText(raw);
      setParsedData(raw.trim().length > 10 ? parseMedicalReport(raw) : null);
    };
    reader.onerror = () => {
      window.alert(lang === 'tr' ? 'Dosya okunurken hata oluştu.' : 'An error occurred while reading the file.');
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
      () => window.alert(lang === 'tr' ? 'Vaka bağlamı panoya kopyalanamadı.' : 'The case context could not be copied.'),
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
${labels.organSystem}: ${lang === 'tr' ? selectedOrgan.toUpperCase() : organNames[selectedOrgan]} (${patientAgeYears ? `${lang === 'tr' ? 'Yaş' : 'Age'} ${patientAgeYears}; ` : ''}${subInfo})
${labels.stage}: ${selectedOrgan === 'emergencies' || selectedOrgan === 'palliative' ? (lang === 'tr' ? 'Uygulanmaz' : 'Not applicable') : `${selectedT} ${selectedN} ${selectedM}`}
${labels.decision}: ${tText(evaluatedDecision.statusText)}
${labels.prescription}: ${tText(activeScheme.name)} [${tText(activeScheme.tag)}]
${labels.totalDose}: ${activeScheme.totalDoseGy} Gy | ${labels.fraction}: ${activeScheme.fractionCount} ${labels.fx} (${activeScheme.fractionDoseGy} Gy/${labels.fx})
${labels.technique}: ${tText(activeScheme.technique)}
${labels.radiobiology}: BED: ${radiobiology.bed} Gy | EQD2: ${radiobiology.eqd2} Gy (α/β = ${radiobiology.ab})
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
      thorax: 'Akciğer/Toraks',
      prostate: 'GÜS',
      breast: 'Meme',
      gis: 'GİS',
      'head-neck': 'Baş-Boyun',
      cns: 'MSS',
      gynecology: 'Jinekoloji',
      bone: 'Kemik',
      sarcoma: 'Yumuşak Doku',
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
        ? cnsSubtype === 'gbm' ? 'Glioblastoma' : cnsSubtype === 'glioma' ? `Glial tümör ${gliomaGrade.replace('_', ' ')}` : cnsSubtype
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
      prescription: `${activeScheme.name} · ${activeScheme.totalDoseGy} Gy / ${activeScheme.fractionCount} fx`,
      bed: radiobiologyByAlphaBeta.find(item => item.ab === 10)?.bed ?? radiobiology.bed,
      eqd2: radiobiologyByAlphaBeta.find(item => item.ab === 10)?.eqd2 ?? radiobiology.eqd2,
    };
    const nextArchive = [record, ...caseArchive];
    try {
      window.localStorage.setItem('radonco_clinical_case_archive', JSON.stringify(nextArchive));
    } catch (error) {
      console.error('Clinical case could not be saved to browser storage.', error);
      setResearchExportNotice('Vaka arşive kaydedilemedi; tarayıcı depolama alanı dolu veya kullanılamıyor.');
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
      setResearchExportNotice('Vaka arşivden silinemedi; tarayıcı depolama alanını kontrol edin.');
      return;
    }
    setCaseArchive(nextArchive);
  };

  const exportCaseArchive = () => {
    if (caseArchive.length === 0) {
      setResearchExportNotice('Dışa aktarılacak vaka bulunmuyor.');
      return;
    }
    const headers = ['Hasta_ID', 'Yaş', 'Cinsiyet', 'Tanı', 'Evre', 'Reçete', 'BED10_Gy', 'EQD2_10_Gy', 'Kaydedilme_Tarihi'];
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
      <div className="min-h-screen w-full flex flex-col items-center justify-center bg-slate-100 dark:bg-[#070b14] text-slate-800 dark:text-slate-200 font-sans" role="status" aria-live="polite">
        <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4" aria-hidden="true" />
        <div className="text-sm font-bold tracking-tight text-slate-900 dark:text-white">
          {lang === 'tr' ? 'Kurumsal Kimlik Bilgileri Doğrulanıyor...' : 'Verifying Institutional Credentials...'}
        </div>
        <div className="text-xs text-slate-400 dark:text-slate-200 mt-1">
          {lang === 'tr' ? 'Verifying institutional credentials' : 'Kurumsal hekim doğrulaması yapılıyor'}
        </div>
      </div>
    );
  }

  if (user && !isDoctor) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-slate-100 dark:bg-[#070b14] p-6 text-slate-900 dark:text-slate-100 font-sans">
        <div className="w-full max-w-md rounded-2xl bg-[#0c1322] border border-slate-800 p-8 shadow-xl text-center">
          <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-600 border border-rose-200 flex items-center justify-center mx-auto mb-4 font-bold text-xl" aria-hidden="true">{tText("!")}</div>
          <h2 className="text-xl font-bold text-slate-900 mb-2">{tText("Kurumsal Hekim Erişimi / Institutional Access")}</h2>
          <p className="text-xs text-slate-600 leading-relaxed mb-6">
            {tText("\n            RadOnc CDSS is restricted to licensed physicians and institutional medical personnel. Yalnızca kurumsal hekim e-postaları geçerlidir.\n          ")}</p>
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 mb-6 text-left text-xs font-mono">
            <div className="text-slate-400">{tText("Account: ")}<span className="text-rose-600 font-bold">{email}</span></div>
            <div className="text-slate-400">{tText("Allowed: ")}<span className="text-emerald-700 font-bold">{tText("@saglik.gov.tr, @*.edu.tr, @*.edu, @nhs.net, @*.ac.uk")}</span></div>
          </div>
          <SignOutButton redirectUrl="/sign-in">
            <button type="button" className="w-full py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2">
              {tText("\n              Farklı Hesapla Giriş / Sign In with Another Account\n            ")}</button>
          </SignOutButton>
        </div>
      </div>
    );
  }

  const reportOrganNames: Record<OrganId, string> = {
    thorax: lang === 'tr' ? 'Toraks' : 'Thorax',
    prostate: lang === 'tr' ? 'Genitoüriner Sistem' : 'Genitourinary',
    breast: lang === 'tr' ? 'Meme' : 'Breast',
    gis: lang === 'tr' ? 'Gastrointestinal Sistem' : 'Gastrointestinal',
    'head-neck': lang === 'tr' ? 'Baş-Boyun' : 'Head and Neck',
    cns: lang === 'tr' ? 'Santral Sinir Sistemi' : 'Central Nervous System',
    gynecology: lang === 'tr' ? 'Jinekoloji' : 'Gynecology',
    bone: lang === 'tr' ? 'Kemik' : 'Bone',
    sarcoma: lang === 'tr' ? 'Yumuşak Doku Sarkomu' : 'Soft Tissue Sarcoma',
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
        : '—';
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
          ? [skinPerineuralInvasion && (lang === 'tr' ? 'Perinöral invazyon' : 'Perineural invasion'), skinBoneInvasion && (lang === 'tr' ? 'Kemik invazyonu' : 'Bone invasion')].filter(Boolean).join(' · ')
          : '');
  const clinicalDecisionFactors = [
    { label: 'Tanı / Diagnosis', value: tText(reportDiagnosis) },
    { label: 'Evre / Stage', value: `${selectedT}${selectedN}${selectedM}` },
    { label: 'Histoloji / Histology', value: tText(reportHistology) },
    ...(selectedRisk ? [{ label: 'Risk Grubu / Risk Category', value: tText(selectedRisk) }] : []),
    ...(surgeryLogic ? [{ label: 'Cerrahi / Surgery', value: surgeryLogic }] : []),
    ...(surgicalMarginLogic ? [{ label: 'Cerrahi Sınır / Margin', value: surgicalMarginLogic }] : []),
    { label: 'Endikasyon / Indication', value: tText(activeScheme.indication) },
    {
      label: 'Önerilen Şema / Recommended Scheme',
      value: `${tText(activeScheme.name)} · ${activeScheme.totalDoseGy} Gy / ${activeScheme.fractionCount} fx`,
    },
  ].filter(factor => factor.value.trim().length > 0);
  const evidenceText = tText(activeScheme.evidence);
  const evidenceReferences = getEvidenceReferences(activeScheme, selectedOrgan);
  const resolvedEvidenceLinks = useMemo(
    () => resolveSchemeEvidenceLinks(
      activeScheme,
      selectedOrgan,
      selectedSubsite,
      thoraxCentrality,
      evidenceReferences,
      isSclcTurrisiScheme,
    ),
    [activeScheme, selectedOrgan, selectedSubsite, thoraxCentrality, evidenceReferences, isSclcTurrisiScheme]
  );
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
            aria-label={lang === 'tr' ? 'Anatomik menüyü aç' : 'Open anatomic menu'}
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
            aria-label={lang === 'en' ? 'Quick search or jump' : 'Hızlı arama veya komut'}
            className="hidden items-center gap-2 rounded-xl border border-slate-800 bg-[#0e1726] px-3 py-1.5 text-xs text-slate-400 shadow-sm transition-all hover:border-slate-700 hover:text-slate-200 md:flex"
          >
            <Search className="h-3.5 w-3.5 text-slate-400" aria-hidden="true" />
            <span>{lang === 'en' ? 'Quick search or jump...' : 'Hızlı arama veya komut...'}</span>
            <kbd className="ml-2 rounded-md border border-slate-700 bg-slate-800 px-1.5 py-0.5 font-mono text-[10px] text-slate-300">Ctrl K</kbd>
          </button>
          <button
            type="button"
            onClick={() => {
              setSearchQuery('');
              setActiveSearchIndex(0);
              setIsSearchOpen(true);
            }}
            aria-label={lang === 'en' ? 'Open quick search' : 'Hızlı aramayı aç'}
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
            <span aria-hidden="true">📖</span>
            <span className="hidden sm:inline">{lang === 'tr' ? 'Kılavuz İlkeleri' : 'Clinical Guidelines'}</span>
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
                  aria-label={lang === 'tr' ? 'AI asistanı kapat' : 'Close AI assistant'}
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
                  {selectedOrgan.toUpperCase()} • {selectedT} {selectedN} {selectedM} • {activeScheme.totalDoseGy} Gy / {activeScheme.fractionCount} fx
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
                        : 'text-slate-400 hover:text-slate-800 dark:hover:text-white'
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
                <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                  {lang === 'tr' ? 'Vaka Sorusu Önizleme' : 'Case Question Preview'}
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
                  {lang === 'tr' ? 'Hesabınla Aç & Sor ↗' : 'Open & Ask with Your Account ↗'}
                </a>
                <button
                  type="button"
                  onClick={openSelectedAi}
                  className="mt-2 flex w-full items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-slate-100 px-3 py-2 text-xs font-medium text-slate-700 transition hover:bg-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
                >
                  <Copy className="h-3.5 w-3.5" aria-hidden="true" />
                  {copiedContext
                    ? (lang === 'tr' ? 'Panoya Kopyalandı!' : 'Copied to Clipboard!')
                    : (lang === 'tr' ? 'Vaka Sorusunu Kopyala' : 'Copy Case Question')}
                </button>
              </div>
            </div>

            <div className="border-t border-slate-100 p-3 text-center text-[11px] text-slate-400 dark:border-slate-800">
              {lang === 'tr'
                ? 'API anahtarı gerekmez; vaka sorusu kendi hesabınızla açılan AI platformuna aktarılır.'
                : 'No API key required; the case question is copied before opening the AI platform.'}
            </div>
          </aside>
        </div>
      )}

      <div className="flex min-h-0 flex-1">
      {/* ==========================================
          SOL DİKEY ORGAN NAVİGASYONU
         ========================================== */}
      {isMobileDrawerOpen && (
        <button
          type="button"
          aria-label={lang === 'tr' ? 'Menüyü kapat' : 'Close menu'}
          onClick={() => setIsMobileDrawerOpen(false)}
          className="fixed inset-0 z-40 bg-black/60 lg:hidden"
        />
      )}
      <nav className={`${isGuidedMode && guidedStep !== 1 ? 'hidden' : isMobileDrawerOpen ? 'fixed inset-y-0 left-0 z-50 flex w-72' : 'hidden lg:flex'} ${isSidebarCollapsed ? 'lg:w-16 lg:px-2' : 'lg:w-56 xl:w-60 lg:px-4'} shrink-0 flex-col sticky top-14 h-[calc(100vh-3.5rem)] overflow-y-auto bg-[#0c1322] border border-slate-800/80 rounded-2xl p-4 shadow-2xl lg:shadow-sm`}>
        <div className="mb-3 flex items-center justify-between px-2">
          <span className={`${isSidebarCollapsed ? 'lg:hidden' : ''} text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400 dark:text-slate-300`}>
          {lang === 'tr' ? 'Klinik Navigasyon' : 'Clinical Navigation'}
          </span>
          <button
            type="button"
            aria-label={isSidebarCollapsed ? (lang === 'tr' ? 'Menüyü genişlet' : 'Expand menu') : (lang === 'tr' ? 'Menüyü daralt' : 'Collapse menu')}
            onClick={() => setIsSidebarCollapsed(value => !value)}
            className="hidden rounded-md p-1 text-slate-400 transition hover:bg-slate-800 hover:text-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 lg:block"
          >
            {isSidebarCollapsed ? <ChevronRight className="h-4 w-4" aria-hidden="true" /> : <ChevronLeft className="h-4 w-4" aria-hidden="true" />}
          </button>
          <button
            type="button"
            aria-label={lang === 'tr' ? 'Menüyü kapat' : 'Close menu'}
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
          { id: 'prostate', name_tr: 'GÜS', name_en: 'Genitourinary (GU)', icon: Droplets, color: 'text-blue-700' },
          { id: 'breast', name_tr: 'Meme', name_en: 'Breast', icon: CircleDot, color: 'text-pink-700' },
          { id: 'gis', name_tr: 'GİS', name_en: 'Gastrointestinal (GI)', icon: UtensilsCrossed, color: 'text-orange-700' },
          { id: 'head-neck', name_tr: 'Baş-Boyun', name_en: 'Head & Neck', icon: User, color: 'text-indigo-700' },
          { id: 'cns', name_tr: 'MSS', name_en: 'CNS (Brain & Spine)', icon: Brain, color: 'text-purple-700' },
          { id: 'gynecology', name_tr: 'Jinekoloji', name_en: 'Gynecology', icon: Sparkles, color: 'text-rose-700' },
          { id: 'bone', name_tr: 'Kemik Tümörleri', name_en: 'Bone Tumors', icon: Bone, color: 'text-amber-700' },
          { id: 'sarcoma', name_tr: 'Yumuşak Doku', name_en: 'Soft Tissue', icon: Layers, color: 'text-orange-700' },
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
                  <span>📁 {lang === 'tr' ? 'Anatomik Bölgeler' : 'Anatomic Regions'}</span>
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
                {item.id === 'emergencies' && <span className={`${isSidebarCollapsed ? 'lg:hidden' : ''} rounded-sm border border-amber-400/40 bg-amber-400/15 px-1 py-0.5 text-[8px] font-black uppercase tracking-wide text-amber-300`}>{lang === 'tr' ? 'ACİL' : 'URGENT'}</span>}
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
          FAVORİLERİM: KLASİK NAVİGASYON ÇUBUĞUNUN HEMEN SAĞINDA, AYRI SÜTUN
         ========================================== */}
      <aside
        className={`${isGuidedMode && guidedStep !== 1 ? 'hidden' : 'hidden lg:flex'} w-52 xl:w-56 shrink-0 flex-col sticky top-14 h-fit max-h-[calc(100vh-3.5rem)] overflow-y-auto rounded-xl border border-amber-500/20 bg-amber-500/[0.05] p-2.5 shadow-sm`}
        aria-label={lang === 'tr' ? 'Favori klinik senaryolar' : 'Favorite clinical scenarios'}
      >
        <h2 className="mb-1.5 px-1 text-[10px] font-bold uppercase tracking-wider text-amber-300">
          ⭐ {lang === 'tr' ? 'Favorilerim' : 'Favorites'}
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
              aria-label={`${lang === 'tr' ? 'Favorilerden çıkar' : 'Remove favorite'}: ${lang === 'tr' ? preset.title_tr : preset.title_en}`}
              onClick={() => toggleFavoritePreset(preset.id)}
              className="rounded p-1 text-amber-300 hover:bg-amber-400/10"
            >
              <span aria-hidden="true">⭐</span>
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
              <span>★ {fav.label}</span>
            </button>
            <button
              type="button"
              aria-label={`${lang === 'tr' ? 'Özel favoriyi sil' : 'Remove custom favorite'}: ${fav.label}`}
              onClick={() => removeCustomFavorite(fav.id)}
              className="rounded p-1 text-rose-300 hover:bg-rose-400/10"
            >
              <span aria-hidden="true">×</span>
            </button>
          </div>
        ))}
        {favoritePresetIds.length === 0 && customFavorites.length === 0 && (
          <p className="px-1 py-1 text-[10px] text-slate-400">
            {lang === 'tr' ? 'Senaryoların yanındaki ☆ ile ekleyin.' : 'Add scenarios with the ☆ button.'}
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
            ? 'Karar Destek Sistemi hekim değerlendirmesini desteklemek içindir; nihai klinik ve hukuki sorumluluk uygulayıcı hekime aittir.'
            : 'The Clinical Decision Support System is intended to support physician evaluation; final clinical and legal responsibility rests with the treating physician.'}>
            {lang === 'tr'
              ? 'Karar Destek Sistemi hekim değerlendirmesini desteklemek içindir; nihai klinik ve hukuki sorumluluk uygulayıcı hekime aittir.'
              : 'The Clinical Decision Support System is intended to support physician evaluation; final clinical and legal responsibility rests with the treating physician.'}
          </p>
        </div>
        <div className="col-span-12 flex h-11 min-h-0 min-w-0 items-center justify-between gap-2 rounded-lg border border-slate-800 bg-slate-900/60 px-4 py-2">
          <span className="hidden shrink-0 text-xs font-semibold leading-none text-slate-300 sm:inline">
            {lang === 'tr' ? 'Çalışma Görünümü' : 'Workspace View'}
          </span>
          <div className="flex max-w-full items-center gap-1 rounded-lg border border-slate-700 bg-[#080d18] p-0.5" role="group" aria-label={lang === 'tr' ? 'CDSS görünüm modu' : 'CDSS view mode'}>
            <button
              type="button"
              aria-pressed={isGuidedMode}
              onClick={() => setViewMode(true)}
              className={`rounded-md px-1.5 py-1 text-[9px] font-semibold leading-none transition sm:px-3 sm:text-xs ${
                isGuidedMode ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
              }`}
            >
              {lang === 'tr' ? 'Kılavuzlu Sihirbaz Modu' : 'Guided Wizard Mode'}
            </button>
            <button
              type="button"
              aria-pressed={!isGuidedMode}
              onClick={() => setViewMode(false)}
              className={`rounded-md px-1.5 py-1 text-[9px] font-semibold leading-none transition sm:px-3 sm:text-xs ${
                !isGuidedMode ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
              }`}
            >
              {lang === 'tr' ? 'Tam Matris Görünümü' : 'Full Matrix View'}
            </button>
          </div>
        </div>
          {/* STICKY BREADCRUMBS */}
          <div className="col-span-12 sticky top-0 z-20 flex items-center justify-between gap-2 rounded-lg border border-sky-500/20 bg-[#0a0f1d]/90 backdrop-blur px-4 py-2.5 shadow-lg">
            <div className="flex items-center gap-2 overflow-x-auto text-xs font-medium text-sky-100/90 whitespace-nowrap hide-scrollbar">
              <span className="text-sky-400 font-bold">{lang === 'tr' ? 'Klinik Yol:' : 'Clinical Pathway:'}</span>
              <span>{
                (() => {
                  const niceOrganNames: Record<string, string> = {
                      thorax: lang === 'tr' ? 'Toraks' : 'Thorax',
                      prostate: lang === 'tr' ? 'Genitoüriner' : 'Genitourinary',
                      breast: lang === 'tr' ? 'Meme' : 'Breast',
                      'head-neck': lang === 'tr' ? 'Baş-Boyun' : 'Head & Neck',
                      cns: lang === 'tr' ? 'SSS' : 'CNS',
                      gis: lang === 'tr' ? 'GİS' : 'Gastrointestinal',
                      gynecology: lang === 'tr' ? 'Jinekoloji' : 'Gynecology',
                      sarcoma: lang === 'tr' ? 'Sarkom' : 'Sarcoma',
                      skin: lang === 'tr' ? 'Cilt' : 'Skin',
                      hematology: lang === 'tr' ? 'Hematoloji' : 'Hematology',
                      pediatric: lang === 'tr' ? 'Pediatrik' : 'Pediatric',
                      palliative: lang === 'tr' ? 'Palyatif' : 'Palliative',
                      emergencies: lang === 'tr' ? 'Aciller' : 'Emergencies',
                      benign: lang === 'tr' ? 'Benign' : 'Benign'
                  };
                  const oName = niceOrganNames[selectedOrgan] || selectedOrgan;
                  
                  const allSubsites = ORGAN_TREE[selectedOrgan] || [];
                  const matchedSubsite = allSubsites.find((sub: any) => sub.id === selectedSubsite || sub.id === currentTnmKey);
                  let sName = matchedSubsite ? (lang === 'tr' ? matchedSubsite.name_tr : matchedSubsite.name_en) : '';
                  if (!sName) {
                      if (selectedOrgan === 'thorax') sName = thoraxSubtype === 'sclc' ? 'SCLC' : 'NSCLC';
                      else if (selectedOrgan === 'breast') sName = breastHistology;
                      else if (selectedOrgan === 'head-neck') sName = hnSubsite;
                  }
                  
                  let stageName = '';
                  if (selectedOrgan === 'thorax') stageName = `T${selectedT} N${selectedN} M${selectedM}`;
                  else if (selectedOrgan === 'breast') stageName = breastSurgery + ' ' + breastMargin;
                  else if (selectedOrgan === 'head-neck') stageName = `T${selectedT} N${selectedN} M${selectedM}`;
                  
                  let regName = activeScheme ? activeScheme.name : '';
                  
                  return [oName, sName, stageName, regName].filter(Boolean).join(' > ');
                })()
              }</span>
            </div>
            <button
              onClick={() => {
                document.getElementById('cdss-main-content')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
              }}
              className="shrink-0 rounded bg-sky-500/10 px-2 py-1 text-[10px] font-bold text-sky-400 hover:bg-sky-500/20 transition-colors"
            >
              {lang === 'tr' ? 'En Üste Dön' : 'Reset / Top'}
            </button>
          </div>

        <div className="col-span-12 grid grid-cols-1 gap-2 rounded-lg border border-slate-800 bg-slate-900/40 p-2 sm:grid-cols-3" aria-label={lang === 'tr' ? 'İsteğe bağlı hasta bilgileri' : 'Optional patient information'}>
          <label className="text-[10px] font-semibold text-slate-300">
            {lang === 'tr' ? 'Yaş / Age' : 'Age / Yaş'}
            <input
              type="number"
              min="0"
              max="120"
              value={patientAgeYears}
              onChange={event => setPatientAgeYears(event.currentTarget.value)}
              className="mt-1 h-9 w-full rounded-md border border-slate-700 bg-[#0b1220] px-2 text-xs text-slate-100 placeholder:text-slate-400"
              placeholder={lang === 'tr' ? 'İsteğe bağlı' : 'Optional'}
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
              <option value="Kadın">{lang === 'tr' ? 'Kadın' : 'Female'}</option>
              <option value="Erkek">{lang === 'tr' ? 'Erkek' : 'Male'}</option>
              <option value="Diğer">{lang === 'tr' ? 'Diğer' : 'Other'}</option>
            </select>
          </label>
          <label className="text-[10px] font-semibold text-slate-300">
            {lang === 'tr' ? 'Protokol / Hasta ID' : 'Protocol / Patient ID'}
            <input
              type="text"
              value={patientId}
              onChange={event => setPatientId(event.currentTarget.value)}
              className="mt-1 h-9 w-full rounded-md border border-slate-700 bg-[#0b1220] px-2 text-xs text-slate-100 placeholder:text-slate-400"
              placeholder={lang === 'tr' ? 'İsteğe bağlı, kimliksizleştirilmiş ID' : 'Optional, pseudonymized ID'}
            />
          </label>
        </div>

        {isGuidedMode && (
          <nav className="col-span-12 mx-auto grid w-full max-w-[1720px] grid-cols-1 gap-2 sm:grid-cols-2 xl:grid-cols-4" aria-label={lang === 'tr' ? 'Klinik karar akışı adımları' : 'Clinical decision flow steps'}>
            {[
              {
                step: 1 as const,
                title: lang === 'tr' ? 'Klinik Profil ve Tedavi Amacı' : 'Clinical Profile & Intent',
              },
              {
                step: 2 as const,
                title: lang === 'tr' ? 'Evreleme ve Patoloji' : 'Staging & Pathology',
              },
              {
                step: 3 as const,
                title: lang === 'tr' ? 'Prognostik İndeks ve Risk Sınıflaması' : 'Prognostic Index & Risk Stratification',
              },
              {
                step: 4 as const,
                title: lang === 'tr' ? 'Reçete ve Dozimetri' : 'Prescription & Dosimetry',
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
                {lang === 'tr' ? '1. Klinik Profil ve Tedavi Amacı' : '1. Clinical Profile & Intent'}
              </h2>
              <p className="text-xs leading-relaxed text-slate-400">
                {lang === 'tr'
                  ? 'Soldaki anatomik menüden organ ve alt başlığı seçin veya sık kullanılan klinik senaryolardan biriyle başlayın.'
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
              {lang === 'tr' ? 'Hızlı Klinik Senaryolar' : 'Quick Clinical Scenarios'}
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
                      aria-label={`${favoritePresetIds.includes(preset.id) ? (lang === 'tr' ? 'Favorilerden çıkar' : 'Remove from favorites') : (lang === 'tr' ? 'Favorilere ekle' : 'Add to favorites')}: ${scenarioTitle}`}
                      aria-pressed={favoritePresetIds.includes(preset.id)}
                      onClick={() => toggleFavoritePreset(preset.id)}
                      className="absolute right-3 top-3 rounded-lg border border-slate-700 bg-slate-900/90 px-2 py-1 text-lg text-amber-300 hover:border-amber-400/60"
                    >
                      <span aria-hidden="true">{favoritePresetIds.includes(preset.id) ? '⭐' : '☆'}</span>
                    </button>
                  </div>
                );
              })}
              {guidedScenarioPresets.length === 0 && (
                <p className="col-span-full rounded-xl border border-slate-700/80 bg-[#111c2e] px-4 py-5 text-sm text-slate-400">
                  {lang === 'tr'
                    ? 'Bu organ için hızlı senaryo bulunmuyor. Klinik profili soldaki menüden seçip evrelemeye devam edebilirsiniz.'
                    : 'No quick scenarios are available for this organ. Select the clinical profile from the sidebar and continue to staging.'}
                </p>
              )}
            </div>
            <div className="mt-4 flex flex-col gap-3 rounded-xl border border-slate-700/80 bg-[#0a0f1d]/70 p-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="min-w-0 text-xs text-slate-300">
                <span className="font-semibold text-slate-100">
                  {lang === 'tr' ? `Seçili profil: ${SUBTYPE_DISPLAY_MAP[currentTnmKey] || currentTnmKey.toUpperCase()}` : `Selected profile: ${SUBTYPE_DISPLAY_MAP[currentTnmKey] || currentTnmKey.toUpperCase()}`} <a href={(NCCN_GUIDELINE_MAP[currentTnmKey] || NCCN_GUIDELINE_MAP[selectedOrgan] || { url: 'https://www.nccn.org/guidelines/category_1', title: 'NCCN Guidelines', hint: 'General Cancer Guidelines' }).url} target="_blank" rel="noopener noreferrer" className="ml-2 text-sm underline">{(NCCN_GUIDELINE_MAP[currentTnmKey] || NCCN_GUIDELINE_MAP[selectedOrgan] || { url: 'https://www.nccn.org/guidelines/category_1', title: 'NCCN Guidelines', hint: 'General Cancer Guidelines' }).title} ↗</a> <span className="ml-1 text-xs text-gray-400">{(NCCN_GUIDELINE_MAP[currentTnmKey] || NCCN_GUIDELINE_MAP[selectedOrgan] || { url: 'https://www.nccn.org/guidelines/category_1', title: 'NCCN Guidelines', hint: 'General Cancer Guidelines' }).hint}</span>
                </span>{' '}
                {reportOrganNames[selectedOrgan]} · {tText(reportDiagnosis)}
                <span className="mx-2 text-slate-600">|</span>
                <span className="font-semibold text-slate-100">
                  {lang === 'tr' ? 'Tedavi amacı / endikasyon:' : 'Treatment intent / indication:'}
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
              { id: 'prescription' as const, label: lang === 'tr' ? '3. Reçete & Doz' : '3. Prescription & Dose' },
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
                    SOL SÜTUN (~42%): PARAMETRELER, EVRELEME, HIZLI VAKALAR, PROGNOSTİK
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
            <p className="mb-2.5 text-[11px] text-slate-400 dark:text-slate-200">
              {lang === 'tr' ? 'Rapor metnini yapıştırarak hastanın evresini ve tedavi şemasını otomatik doldurun.' : 'Paste pathology or imaging report to auto-extract TNM stage and protocol.'}
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
              <span>{lang === 'tr' ? 'Rapor Yapıştır & Otomatik Evrele' : 'Paste Report & Auto-Stage'}</span>
            </button>
          </div>

          {/* EVRENSEL PATOLOJİK HİSTOLOJİ / ALT TİP SEÇİCİ */}
          {currentHistologies.length > 0 && (
            <div className="p-3 rounded-2xl bg-[#0f172a] border border-slate-800 shadow-sm mb-4">
              <div className="mb-2">
                <span className="text-[11px] font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                  <span className="text-sky-400">🔬</span> {lang === 'tr' ? 'Patoloji' : 'Pathology'}
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
                      {selectedHistology === h.id ? '✓' : ''}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* DİNAMİK RİSK FAKTÖRLERİ VE CERRAHİ FORMU */}
          <div className="rounded-2xl bg-[#0c1322] border border-slate-800 p-3 shadow-sm flex flex-col gap-2.5 lg:p-5 lg:gap-3">
            <h2 className="text-xs font-bold text-amber-700 uppercase tracking-wider flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5" />
              {lang === 'tr' ? 'KLİNİK PARAMETRELER & RİSK' : 'CLINICAL PARAMETERS & RISK'}
            </h2>
            {patientAgeYears !== '' && (
              <label className="flex max-w-40 flex-col gap-1 text-[11px] font-medium text-slate-300">
                {lang === 'tr' ? 'Hasta yaşı (yıl)' : 'Patient age (years)'}
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

            {/* GİS: CRM VE SOLUNUM HAREKETİ PARAMETRELERİ */}
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
                        { value: 'Pozitif' as const, label: lang === 'tr' ? 'CRM Pozitif / Tehlikeli (≤1 mm)' : 'CRM Positive / Threatened (≤1 mm)' },
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
                          <option value="0">BCLC 0 · {lang === 'tr' ? 'Çok erken' : 'Very early'}</option>
                          <option value="A">BCLC A · {lang === 'tr' ? 'Erken' : 'Early'}</option>
                          <option value="B">BCLC B · {lang === 'tr' ? 'Orta' : 'Intermediate'}</option>
                          <option value="C">BCLC C · {lang === 'tr' ? 'İleri / PVTT' : 'Advanced / PVTT'}</option>
                        </select>
                      </label>
                    )}
                    <div>
                      <span className="mb-1 block font-semibold text-slate-300">
                        {lang === 'tr' ? 'Solunum Hareketi Yönetimi (SBRT)' : 'Respiratory Motion Management'}
                      </span>
                      <div className="grid grid-cols-1 gap-1.5 sm:grid-cols-2">
                        {[
                          { value: '4D-CT' as const, label: lang === 'tr' ? '4D-CT · Serbest Solunum / ITV' : '4D-CT · Free Breathing / ITV' },
                          { value: 'DIBH' as const, label: lang === 'tr' ? 'DIBH · Nefes Tutma / GTV→PTV' : 'DIBH · Breath-Hold / GTV→PTV' },
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
                      {lang === 'tr' ? 'Tedavi bağlamı' : 'Treatment setting'}
                      <select value={biliaryTreatmentSetting} onChange={event => setBiliaryTreatmentSetting(event.currentTarget.value as typeof biliaryTreatmentSetting)} className="mt-1 w-full rounded-lg border border-slate-700 bg-[#131f33] p-2 text-slate-100">
                        <option value="adjuvant">{lang === 'tr' ? 'Postoperatif yüksek risk / adjuvan' : 'Postoperative high-risk / adjuvant'}</option>
                        <option value="unresectable">{lang === 'tr' ? 'İnoperabl lokal ileri' : 'Unresectable locally advanced'}</option>
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

            {/* TORAKS: KHDAK PARAMETRELERİ */}
            {selectedOrgan === 'thorax' && thoraxSubtype === 'nsclc' && (
              <div className="flex flex-col gap-3 text-xs">
                <div>
                  <label className="text-slate-600 block mb-1">{lang === 'tr' ? 'Tümör Yerleşimi (Santralite)' : 'Tumor Centrality / Location'}</label>
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
                    <option value="Inoperable">{lang === 'tr' ? 'Medikal İnoperabl / Cerrahi Red' : 'Medically Inoperable / Surgical Refusal'}</option>
                    <option value="Operable">{lang === 'tr' ? 'Medikal Operabl' : 'Medically Operable'}</option>
                    <option value="Postop_R0">{lang === 'tr' ? 'Postoperatif R0 Rezeksiyon' : 'Postoperative R0 Resection'}</option>
                    <option value="Postop_R1_R2">{lang === 'tr' ? 'Postoperatif R1 / R2 Rezeksiyon' : 'Postoperative R1 / R2 Resection'}</option>
                  </select>
                </div>
                {selectedM === 'M0' && selectedN === 'N0' && (selectedT.startsWith('T1') || selectedT === 'T2') && (
                  <div>
                    <span className="mb-1 block font-semibold text-slate-300">
                      {lang === 'tr' ? 'Solunum Hareketi Yönetimi (SBRT)' : 'Respiratory Motion Management'}
                    </span>
                    <div className="grid grid-cols-1 gap-1.5 sm:grid-cols-2">
                      {[
                        { value: '4D-CT' as const, label: lang === 'tr' ? '4D-CT · Serbest Solunum / ITV' : '4D-CT · Free Breathing / ITV' },
                        { value: 'DIBH' as const, label: lang === 'tr' ? 'DIBH · Nefes Tutma / GTV→PTV' : 'DIBH · Breath-Hold / GTV→PTV' },
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
                      { value: 'thymoma' as const, label: lang === 'tr' ? 'Timoma · WHO A–B3' : 'Thymoma · WHO A–B3' },
                      { value: 'thymic-carcinoma' as const, label: lang === 'tr' ? 'Timik Karsinom · Tip C' : 'Thymic Carcinoma · Type C' },
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
                      {lang === 'tr' ? 'Cerrahi Sınır' : 'Surgical Margin'}
                      <select
                        value={thymomaMargin}
                        onChange={event => setThymomaMargin(event.currentTarget.value as typeof thymomaMargin)}
                        className="mt-1 w-full rounded-md border border-slate-700 bg-slate-800 p-2.5 text-slate-100"
                      >
                        <option value="R0">R0 — Negatif</option>
                        <option value="R1">R1 — Mikroskobik Pozitif</option>
                        <option value="R2">R2 — Makroskobik Rezidü</option>
                      </select>
                    </label>
                  </>
                )}
              </div>
            )}

            {/* TORAKS: KHAK (SCLC) PARAMETRELERİ */}
            {/* MEZOTELYOMA TEDAVİ AMACI */}
            {selectedOrgan === 'thorax' && thoraxSubtype === 'mesothelioma' && (
              <div className="flex flex-col gap-2 text-xs">
                <label className="text-slate-600 block mb-1">{lang === 'tr' ? 'Tedavi Amacı / Cerrahi Durum' : 'Treatment Intent / Surgical Status'}</label>
                <div className="grid grid-cols-1 gap-1.5">
                  {[
                    { id: 'Palyatif', label: lang === 'tr' ? 'Palyatif Semptom Kontrolü (30 Gy/10 fx)' : 'Palliative Symptom Control (30 Gy/10 fx)' },
                    { id: 'Hemitorasik_Postop', label: lang === 'tr' ? 'Adjuvan Hemitorasik RT (P/D veya EPD Sonrası)' : 'Adjuvant Hemithoracic RT (post P/D or EPD)' },
                    { id: 'Dren_Yeri', label: lang === 'tr' ? 'Girişim / Dren Yeri Profilaksisi (21 Gy/3 fx)' : 'Procedure / Drain Tract Prophylaxis (21 Gy/3 fx)' },
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
            {(selectedOrgan === 'bone' || selectedOrgan === 'sarcoma' || selectedOrgan === 'bone-sarcoma') && sarcomaSubtype === 'Yumusak_Doku' && (
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
                      className={parameterButtonClass(sarcomaSurgery === item.id)}
                    >
                      {tText(item.label)}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* KEMİK & SARKOM: OSTEOSARKOM PARAMETRELERİ */}
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
                  <option value="Marjin_Pozitif_R1_R2">{tText("R1/R2 Rezeksiyon (Yüksek Doz Eskalasyonu 70 Gy)")}</option>
                  <option value="Inoperabl_Aksiyel_Pelvis">{tText("İnoperabl Aksiyel/Pelvis (Partikül/IMRT 70+ Gy)")}</option>
                  <option value="Cerrahi_R0_Takip">{tText("R0 Cerrahi Tam Rezeksiyon (RT Gerekmez - İzlem)")}</option>
                </select>
              </div>
            )}

            {/* KEMİK & SARKOM: EWING SARKOMU PARAMETRELERİ */}
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
                  <option value="Definitif_RT">{tText("Definitif RT (Cerrahi Yapılamayan / Organ Koruma - 55.8 Gy)")}</option>
                  <option value="Postop_R1">{tText("Postoperatif R1 Cerrahi Sınır (45-50.4 Gy Adjuvan RT)")}</option>
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
                {(hnSubsite === 'oral-cavity' || hnSubsite === 'maxillary-sinus') && (
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
                      <span className="text-slate-400">{tText("+")}</span>
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

            {selectedOrgan === 'prostate' && gusSubtype === 'kidney' && (
              <div className="space-y-2 text-xs">
                <label className="block text-slate-300">
                  {lang === 'tr' ? 'RCC tedavi bağlamı' : 'RCC treatment setting'}
                  <select value={renalDiseaseSetting} onChange={event => setRenalDiseaseSetting(event.currentTarget.value as typeof renalDiseaseSetting)} className="mt-1 w-full rounded-lg border border-slate-700 bg-[#131f33] p-2 text-slate-100">
                    <option value="primary-inoperable">{lang === 'tr' ? 'Medikal inoperabl primer RCC' : 'Medically inoperable primary RCC'}</option>
                    <option value="oligometastatic">{lang === 'tr' ? 'Oligometastatik / immünoterapi altında oligoprogresyon' : 'Oligometastatic / oligoprogressive on immunotherapy'}</option>
                  </select>
                </label>
                {renalDiseaseSetting === 'primary-inoperable' && (
                  <>
                    <label className="block text-slate-300">
                      {lang === 'tr' ? 'Primer tümör çapı (cm; FASTRACK II doz seçimi)' : 'Primary tumour diameter (cm; FASTRACK II dose selection)'}
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
                      ? 'FASTRACK II doz seçimi gerçek tümör çapına göre yapılır: ≤4 cm için 26 Gy × 1; >4–10 cm için 42 Gy / 3 fx. T kategorisi tek başına tümör çapının yerine geçmez.'
                      : 'FASTRACK II dose selection is by actual tumour diameter: ≤4 cm, 26 Gy × 1; >4–10 cm, 42 Gy / 3 fx. T category alone does not replace measured tumour size.'}
                  </p>
                  </>
                )}
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
                            className={parameterButtonClass(marker.value)}
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
                    <p className="text-[11px] text-slate-400">
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
            {/* MSS GLİOM: GRADE + PIGNATTI / RTOG 9802 RİSK FAKTÖRLERİ */}
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
                  <span className="mb-1 block font-semibold text-slate-300">{lang === 'tr' ? 'Pignatti / RTOG 9802 Yüksek Risk Kriterleri' : 'Pignatti / RTOG 9802 High-Risk Criteria'}</span>
                  <div className="grid grid-cols-1 gap-1.5">
                    {([
                      { key: 'age40', label: lang === 'tr' ? 'Yaş ≥ 40' : 'Age ≥ 40' },
                      { key: 'subtotalResection', label: lang === 'tr' ? 'Subtotal rezeksiyon / biyopsi (STR)' : 'Subtotal resection / biopsy (STR)' },
                      { key: 'largeOrCrossing', label: lang === 'tr' ? 'Çap ≥ 5 cm veya korpus kallozum geçişi' : 'Diameter ≥ 5 cm or corpus callosum crossing' },
                      { key: 'neurologicSymptoms', label: lang === 'tr' ? 'Nörolojik defisit / semptom' : 'Neurological deficit / symptoms' },
                      { key: 'molecularHighRisk', label: lang === 'tr' ? 'Moleküler yüksek risk (IDH-wt, CDKN2A/B del, TERT mut)' : 'Molecular high risk (IDH-wt, CDKN2A/B del, TERT mut)' },
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
            {/* ELECTIVE PALLIATIVE RT SELECTION */}
            {selectedOrgan === 'palliative' && (
              <div className="flex flex-col gap-2 text-xs">
                <span className="mb-1 block font-semibold text-slate-300">{lang === 'tr' ? 'Elektif Palyatif RT' : 'Elective Palliative RT'}</span>
                <div className="grid grid-cols-1 gap-1.5">
                  {[
                    { id: 'Agri', label: lang === 'tr' ? 'Kemik metastazı ağrı palyasyonu' : 'Bone metastasis pain palliation' },
                    { id: 'Beyin', label: lang === 'tr' ? 'Beyin metastazları (elektif WBRT / SRS)' : 'Brain metastases (elective WBRT / SRS)' },
                    { id: 'Organ', label: lang === 'tr' ? 'Organ ve yumuşak doku metastazı' : 'Organ and soft-tissue metastases' },
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
                    ? 'Prognostik İndeks ve Risk Sınıflaması'
                    : 'Prognostic Index & Risk Stratification'}
                </h2>
                <p className="mt-1 text-xs leading-relaxed text-slate-400">
                  {lang === 'tr'
                    ? 'Organ, evre ve girilmiş klinik değişkenlere uygun hesaplanan risk modelini ve kriterlerini inceleyin.'
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
                          ? 'Bu model ayrı bir lokal kontrol tahmini sunmuyor.'
                          : 'This model does not provide a separate local-control estimate.'}
                    </p>
                  </div>
                  <div className="rounded-xl border border-slate-700 bg-[#111c2e] p-3">
                    <p className="mb-2 text-[10px] font-bold uppercase tracking-wide text-slate-400">
                      {hasMedianOsEstimate
                        ? (lang === 'tr' ? 'Medyan Genel Sağkalım (OS)' : 'Median Overall Survival (OS)')
                        : (lang === 'tr' ? 'Bildirilen Sağkalım / Nüks Sonucu' : 'Reported Survival / Recurrence Outcome')}
                    </p>
                    <p className="text-sm font-semibold text-slate-100">
                      {prognosticOutcome
                        ? tText(prognosticOutcome)
                        : lang === 'tr'
                          ? 'Bu model nicel bir sağkalım tahmini sunmuyor.'
                          : 'This model does not provide a quantitative survival estimate.'}
                    </p>
                  </div>
                  <div className="rounded-xl border border-slate-700 bg-[#111c2e] p-3">
                    <p className="mb-2 text-[10px] font-bold uppercase tracking-wide text-slate-400">
                      {lang === 'tr' ? 'Sistemik İlerleme Riski' : 'Systemic Progression Risk'}
                    </p>
                    <p className="text-sm font-semibold text-slate-100">
                      {selectedM.startsWith('M1')
                        ? tText(prognosticResult.riskCategory)
                        : lang === 'tr'
                          ? 'Seçili model bu riski ayrı bir olasılık olarak hesaplamıyor; model risk grubu yukarıda gösterilmiştir.'
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
                <p className="mt-3 text-[10px] leading-relaxed text-slate-400">
                  {lang === 'tr'
                    ? 'Tahminler yalnızca modelin açıkça raporladığı sonuçları gösterir. Model kapsamı ve girdileri klinik ekip tarafından doğrulanmalıdır.'
                    : 'Only outcomes explicitly reported by the model are shown. The clinical team should verify model applicability and inputs.'}
                </p>
              </>
            ) : (
              <div role="status" className="rounded-xl border border-amber-500/30 bg-amber-500/[0.06] p-4 text-sm leading-relaxed text-amber-100/90">
                {lang === 'tr'
                  ? 'Seçili organ ve klinik alt tip için desteklenen bir prognostik model bulunamadı. Klinik riski bağımsız olarak değerlendirin.'
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
                  {lang === 'tr' ? 'Evrelemeye Dön' : 'Back to Staging'}
                </button>
                <button
                  type="button"
                  onClick={() => setGuidedStep(4)}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-xs font-bold text-white shadow-lg shadow-blue-950/30 transition hover:bg-blue-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400"
                >
                  {lang === 'tr' ? 'Tedavi Reçetesine Devam Et' : 'Proceed to Treatment Prescription'}
                  <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
                </button>
              </div>
            )}
          </section>
        )}
        </aside>

        {/* ==========================================
                    ORTA SÜTUN: GİZLİ (TNM TABLOSU SOL SÜTUNA TAŞINDI)
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
              aria-label={lang === 'en' ? 'Quick clinical scenarios' : 'Hızlı klinik senaryolar'}
            >
              <span className="flex items-center gap-1 rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-1.5 font-bold text-amber-400">
                <span aria-hidden="true">⚡</span>
                {lang === 'en' ? 'Quick Scenarios:' : 'Hızlı Vakalar:'}
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
                      <span aria-hidden="true">{preset.badge || '🎯'}</span>
                      <span>{lang === 'en' ? preset.title_en : preset.title_tr}</span>
                    </button>
                    <button
                      type="button"
                      aria-label={`${favoritePresetIds.includes(preset.id) ? (lang === 'tr' ? 'Favorilerden çıkar' : 'Remove from favorites') : (lang === 'tr' ? 'Favorilere ekle' : 'Add to favorites')}: ${lang === 'tr' ? preset.title_tr : preset.title_en}`}
                      aria-pressed={favoritePresetIds.includes(preset.id)}
                      onClick={() => toggleFavoritePreset(preset.id)}
                      className="rounded-lg border border-slate-700/80 bg-slate-800/90 px-2 text-amber-300 hover:border-amber-400/60 hover:bg-slate-700/80"
                    >
                      <span aria-hidden="true">{favoritePresetIds.includes(preset.id) ? '⭐' : '☆'}</span>
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
                    ? (lang === 'tr' ? 'Klinik Durum ve Tedavi Seçimi' : 'Clinical Status and Treatment Selection')
                    : (lang === 'tr' ? 'KILAVUZ TANIMLI AÇIK TNM TABLOSU' : 'GUIDELINE-DEFINED OPEN TNM MATRIX')}
                </h2>
                <span className="text-[11px] text-slate-300">
                  {selectedOrgan === 'benign'
                    ? (lang === 'tr' ? 'Benign hastalıkta TNM evrelemesi uygulanmaz; klinik durum ve tedavi zamanlamasını seçin.' : 'TNM staging does not apply to benign disease; select the clinical status and treatment timing.')
                    : (lang === 'tr' ? 'Seçili alt başlığa özgü kriterler; tıklayarak anında güncelleyin.' : 'Subsite-specific criteria; click to update instantly.')}
                </span>
              </div>
              {selectedOrgan === 'benign' || selectedOrgan === 'palliative' || selectedOrgan === 'emergencies'
                ? <span className={`rounded border px-2 py-0.5 text-[11px] font-semibold ${selectedOrgan === 'emergencies' ? 'border-rose-500/40 bg-rose-950/50 text-rose-200' : 'border-emerald-500/40 bg-emerald-950/40 text-emerald-200'}`}>{selectedOrgan === 'emergencies' ? (lang === 'tr' ? 'ACİL' : 'URGENT') : (lang === 'tr' ? 'TNM uygulanmaz' : 'TNM not applicable')}</span>
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
                          ? 'HO profilaksisi preoperatif ilk 4 saatte veya postoperatif ilk 24-48 saatte planlanır; >72 saat sonra etkinlik beklenmez.'
                          : 'HO prophylaxis is planned within 4 hours preoperatively or 24-48 hours postoperatively; benefit is not expected after 72 hours.'
                        : lang === 'tr'
                          ? 'Keloid eksizyonu sonrası RT ilk 24 saat içinde başlatılmalıdır.'
                          : 'Radiotherapy should begin within 24 hours after keloid excision.'}
                  </div>
                )}
              </div>
              ) : (
                <div className={`rounded-md border p-3 text-xs leading-relaxed ${selectedOrgan === 'emergencies' ? 'border-rose-500/30 bg-rose-950/30 text-rose-100' : 'border-teal-500/30 bg-teal-950/20 text-teal-100'}`}>
                  {selectedOrgan === 'emergencies'
                    ? (lang === 'tr' ? 'Acil senaryo; stabilizasyon ve ilgili uzmanlık değerlendirmesi önceliklidir. Reçete, hedef hacim ve fraksiyonasyon acil vaka motorunda sunulur.' : 'Emergency scenario; stabilization and specialty assessment take priority. Prescription, target volumes, and fractionation are provided by the emergency case engine.')
                    : (lang === 'tr' ? 'Elektif semptomatik RT: kemik metastazı, beyin metastazı veya organ/yumuşak doku metastazı.' : 'Elective symptom-directed RT: bone, brain, or organ/soft-tissue metastases.')}
                </div>
              )
            ) : (
              <>
            {/* T TABLOSU */}
            <div className="mb-4">
              <span className="text-[11px] font-bold text-slate-600 uppercase tracking-wider block mb-1.5">
                {lang === 'tr' ? 'PRİMER TÜMÖR (T) KRİTERLERİ' : 'PRIMARY TUMOR (T) CRITERIA'}
              </span>
              <div className="grid grid-cols-1 gap-1 max-h-[min(55vh,520px)] overflow-y-auto pr-1.5 scrollbar-thin">
                {currentTNM.T.map(opt => {
                  const isSel = selectedT === opt.code;
                  return (
                    <button
                      key={opt.code}
                      type="button"
                      disabled={breastHistology === 'İnflamatuar Meme Kanseri (IBC)' && opt.code !== 'T4d'}
                      onClick={() => handleTnmSelection('T', opt.code)}
                      className={`w-full text-left p-2.5 rounded-xl border transition-all text-xs flex items-center justify-between ${breastHistology === 'İnflamatuar Meme Kanseri (IBC)' && opt.code !== 'T4d' ? 'cursor-not-allowed opacity-45' : ''} ${
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
                {lang === 'tr' ? 'BÖLGESEL LENF NODLARI (N)' : 'REGIONAL LYMPH NODES (N)'}
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
                    SAĞ SÜTUN (~58%): DOZİMETRİ ÖZETİ, ICRU 83 HEDEF HACİMLER, OAR KISITLARI
           ========================================== */}
        <section className={`col-span-12 flex flex-col gap-4 ${
          isGuidedMode
            ? guidedStep === 4 ? 'lg:col-span-12 mx-auto w-full max-w-[1720px]' : 'hidden'
                    : `lg:col-span-7 ${activeMobilePanel !== 'prescription' ? 'hidden lg:flex' : ''}`
        }`}>
          <div className="rounded-2xl glass-panel-glow p-5 sm:p-6 shadow-xl shadow-black/40">

            {/* CANLI DİNAMİK TRIAGE ROZETİ */}
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
                  {lang === 'tr' ? 'Parametreleri Düzenle' : 'Modify Parameters (Edit)'}
                </button>
              </div>
            )}

            <section className="mb-4 rounded-xl border border-sky-500/25 bg-sky-500/[0.04] p-3" aria-labelledby="decision-chain-heading">
              <h3 id="decision-chain-heading" className="mb-2 text-[11px] font-bold uppercase tracking-wide text-sky-200">
                {lang === 'tr'
                  ? 'İzlenebilir Karar Zinciri (Triggered Decision Logic)'
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

            {(() => {
              const eligiblePhilosophies = (['ultra_hypo', 'moderate_hypo', 'sib_boost', 'conventional'] as const).filter(
                regimen => isRegimenEligible(regimen)
              );
              if (eligiblePhilosophies.length === 0 || !(['prostate', 'thorax', 'breast', 'head-neck'] as OrganId[]).includes(selectedOrgan)) {
                return null;
              }
              const currentActivePhilosophy = (selectedRegimen !== 'clinical' && isRegimenEligible(selectedRegimen))
                ? selectedRegimen
                : effectiveRegimen;

              const gridClass =
                eligiblePhilosophies.length === 1 ? 'grid grid-cols-1 gap-2' :
                eligiblePhilosophies.length === 2 ? 'grid grid-cols-1 sm:grid-cols-2 gap-2' :
                eligiblePhilosophies.length === 3 ? 'grid grid-cols-1 sm:grid-cols-3 gap-2' :
                'grid grid-cols-2 gap-2 xl:grid-cols-4';

              return (
                <div className="mb-4">
                  <div className="mb-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-600">
                    {lang === 'tr' ? 'FRAKSİYONASYON FELSEFESİ' : 'FRACTIONATION PHILOSOPHY'}
                  </div>
                  <div className={gridClass}>
                    {eligiblePhilosophies.map(regimen => {
                      const cards = {
                        ultra_hypo: {
                          title: lang === 'tr' ? 'Ultra-Hipo' : 'Ultra-Hypo',
                          badge: '1-5 fx',
                          detail: 'SBRT / Stereotactic',
                          active: 'bg-gradient-to-br from-indigo-600 to-purple-600',
                          hover: 'hover:border-purple-300',
                        },
                        moderate_hypo: {
                          title: lang === 'tr' ? 'Ilımlı Hipo' : 'Moderate',
                          badge: '15-20 fx',
                          detail: 'Hypofractionated',
                          active: 'bg-gradient-to-br from-blue-600 to-cyan-600',
                          hover: 'hover:border-blue-300',
                        },
                        sib_boost: {
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
                            ? lang === 'tr' ? '1.5 Gy / fx (Günde 2 kez BID, ≥ 6 saat ara)' : '1.5 Gy / fx (Twice daily BID, ≥ 6 hours apart)'
                            : '1.8 - 2.0 Gy / fx',
                          active: 'bg-gradient-to-br from-slate-700 to-slate-900',
                          hover: 'hover:border-slate-400',
                        },
                      };
                      const card = cards[regimen];
                      const isActive = currentActivePhilosophy === regimen;
                      return (
                        <button
                          key={regimen}
                          type="button"
                          onClick={() => handleSelectPhilosophy(regimen)}
                          className={`relative overflow-hidden rounded-xl border p-2.5 text-left transition-all ${
                            isActive
                              ? `${card.active} border-transparent text-white shadow-md`
                              : `glass-panel glass-panel-interactive border-slate-700/60 text-slate-200 ${card.hover}`
                          }`}
                        >
                          <div className="mb-1 flex items-center justify-between">
                            <span className="flex items-center gap-1.5 text-xs font-bold">
                              {regimen === 'ultra_hypo' ? '⚡' : regimen === 'moderate_hypo' ? '🎯' : regimen === 'sib_boost' ? '🧬' : '🛡️'} {card.title}
                            </span>
                            {card.badge && <span className="rounded bg-white/20 px-1.5 py-0.5 font-mono text-[10px] font-semibold dark:bg-slate-800/60">{card.badge}</span>}
                          </div>
                          <div className="text-[10px] opacity-80">{card.detail}</div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })()}

            {/* ALTERNATİF PROTOKOL SEKMELERİ */}
            {availableSubSchemes.length > 1 && (
              <div className="flex gap-2 mb-4 overflow-x-auto pb-1">
                {availableSubSchemes.map(sch => (
                  <button
                    key={sch.id}
                    onClick={() => setSelectedSchemeId(sch.id)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors border ${
                      activeScheme.id === sch.id
                        ? 'bg-amber-500/20 text-amber-200 border-amber-400 font-bold shadow-sm'
                        : 'bg-slate-900/60 border-slate-800 text-slate-300 hover:bg-slate-800/80 hover:border-slate-700'
                    }`}
                  >
                    {tText(sch.tag || sch.name)} {tText(" (")}{sch.totalDoseGy} {tText(" Gy)")}
                  </button>
                ))}
              </div>
            )}

            {/* SEÇİLİ DOZ ŞEMASI KARTI */}
            <div className="glass-panel-glow text-slate-200 p-4 sm:p-5 shadow-md mb-4">
              <div className="mb-2">
                <h3 className="text-amber-300 font-bold text-sm flex items-center gap-2">
                  <Radiation className="w-4 h-4 animate-[spin_12s_linear_infinite] text-amber-300" />
                  {tText(activeScheme.name)}
                </h3>
              </div>
              <div className="flex flex-wrap gap-1.5 mt-2 mb-2.5" aria-label="Reçete özeti">
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

            {/* HEDEF HACİMLER VE MARJİNLER */}
            {activeScheme.targetVolumes.length > 0 && (
              <div className="mb-4">
                <div className="flex min-w-0 items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-2 mb-2">
                  <h4 className="flex min-w-0 items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-200">
                    <Layers className="w-3.5 h-3.5 shrink-0 text-sky-700" />
                    <span>{lang === 'tr' ? 'HEDEF HACİMLER (ICRU 83)' : 'TARGET VOLUMES (ICRU 83)'}</span>
                    <span className="shrink-0 rounded border border-emerald-400/40 bg-emerald-400/10 px-1.5 py-0.5 text-[9px] font-bold tracking-wide text-emerald-700 dark:text-emerald-200">TCP TARGET</span>
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
                <div className="overflow-x-auto w-full glass-panel rounded-xl text-xs shadow-sm">
                  <table className="w-full text-left">
                    <thead className="bg-[#131f33] text-slate-300 text-[11px] font-bold uppercase tracking-wider border-b border-slate-700">
                      <tr>
                        <th className="p-2">{lang === 'tr' ? 'Hacim' : 'Volume'}</th>
                        <th className="p-2">{lang === 'tr' ? 'TCP Reçetesi' : 'TCP Prescription'}</th>
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

            {/* KRİTİK ORGAN (OAR) KISITLARI TABLOSU */}
            {clinicallyRelevantOars.length > 0 && (
              <div className="mb-4">
                <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2 flex flex-wrap items-center gap-1.5">
                  <ShieldAlert className="w-3.5 h-3.5 text-rose-400" aria-hidden="true" />
                  {lang === 'tr' ? 'KRİTİK ORGAN (OAR) KISITLARI' : 'ORGANS AT RISK (OAR) CONSTRAINTS'}
                  <span className="rounded border border-rose-400/40 bg-rose-400/10 px-1.5 py-0.5 text-[9px] font-bold tracking-wide text-rose-200">NTCP CEILING</span>
                </h4>
                <p className="mb-2 text-[10px] leading-relaxed text-slate-400">
                  {lang === 'tr'
                    ? 'Doz ölçütleri fraksiyonasyon, kontur tanımı, tedavi alanı ve önceki RT’ye bağlıdır; bunlar planlama referansıdır, hasta-özel doz onayı değildir.'
                    : 'Dose metrics depend on fractionation, contour definition, treatment site and prior RT; these are planning references, not patient-specific approval.'}
                </p>
                <div className="overflow-x-auto w-full glass-panel rounded-xl text-xs shadow-sm">
                  <table className="w-full text-left">
                    <thead className="bg-[#131f33] text-slate-300 text-[11px] font-bold uppercase tracking-wider border-b border-slate-700">
                      <tr>
                        <th className="p-2">{lang === 'tr' ? 'Kritik Organ' : 'Critical Organ (OAR)'}</th>
                        <th className="p-2">{lang === 'tr' ? 'Metrik' : 'Metric'}</th>
                        <th className="p-2">{lang === 'tr' ? 'NTCP Tavan Sınırı' : 'NTCP Ceiling'}</th>
                        <th className="p-2">{lang === 'tr' ? 'Kılavuz' : 'Standard'}</th>
                      </tr>
                    </thead>
                    <tbody className="text-slate-100">
                      {clinicallyRelevantOars.map((oar, idx) => (
                        <tr key={idx} className="border-b border-slate-800/80 hover:bg-slate-800/40 transition-colors">
                          <td className="p-2 text-white font-semibold text-xs">{tText(oar.organ)}</td>
                          <td className="p-2 font-mono text-slate-100 text-xs">
                            {tText(oar.metric)}
                            {oar.context && <span className="mt-1 block font-sans text-[10px] leading-relaxed text-slate-400">{lang === 'tr' ? oar.context : oar.contextEn || oar.context}</span>}
                            {oar.classification && <span className="mt-1 inline-block rounded border border-slate-700 px-1 py-0.5 font-sans text-[8px] uppercase tracking-wide text-sky-300">{oar.classification === 'planning-aim' ? (lang === 'tr' ? 'Planlama hedefi' : 'Planning aim') : oar.classification === 'protocol-limit' ? (lang === 'tr' ? 'Protokol sınırı' : 'Protocol limit') : oar.classification === 'dose-volume-reference' ? (lang === 'tr' ? 'Doz-hacim referansı' : 'Dose-volume reference') : (lang === 'tr' ? 'Bağlam notu' : 'Context note')}</span>}
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

            {/* RADYOBİYOLOJİK EŞDEĞERLİK (BED & EQD2 HESAPLAYICI) */}
            <div className="mb-4 glass-panel-glow p-4 text-xs transition-colors">
              <div className="flex w-full items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <span className="block text-[11px] font-medium text-slate-300">
                    {lang === 'tr' ? 'Radyobiyolojik Eşdeğerlik' : 'Radiobiological Equivalence'}
                  </span>
                  {radiobiologyByAlphaBeta.map(({ ab, bed, eqd2 }) => {
                    const subscript = ab === 10 ? '₁₀' : '₃';
                    const tissue = ab === 10
                      ? lang === 'tr' ? 'Tümör / Akut' : 'Tumor / Acute'
                      : lang === 'tr' ? 'Geç Doku / OAR' : 'Late Tissue / OAR';
                    return (
                      <span key={ab} className="block font-bold leading-5 text-slate-200">
                        α/β = {ab} Gy ({tissue}): BED{subscript} = <span className="text-amber-400">{bed} Gy</span> | EQD2{subscript} = <span className="text-emerald-400">{eqd2} Gy</span>
                      </span>
                    );
                  })}
                </div>
                <button
                  type="button"
                  aria-haspopup="dialog"
                  onClick={openRadiobiologyModal}
                  className="shrink-0 rounded-lg border border-sky-500/30 bg-sky-500/10 px-2.5 py-1.5 text-[10px] font-semibold text-sky-300 transition hover:bg-sky-500/20 hover:border-sky-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500"
                >
                  🧮 {lang === 'tr' ? 'İnteraktif Dönüştürücü ↗' : 'Interactive Calculator ↗'}
                </button>
              </div>

              {/* Bilgilendirme Notu: İki BED/EQD2 hesaplama satırının altında, kartın içinde ve standart blok akışında */}
              <div className="w-full mt-3 flex items-start gap-2 bg-slate-800/70 border border-slate-700/60 rounded-lg p-2.5 text-xs text-slate-300 text-left">
                <span className="shrink-0 text-sky-400">ℹ️</span>
                <p className="leading-relaxed">
                  {lang === 'tr'
                    ? 'd = 2.0 Gy konvansiyonel fraksiyonasyonda matematiksel tanım gereği tüm α/β değerleri için EQD2 = Reçete Dozu (60 Gy) olur. Fraksiyon dozu 2 Gy\'den farklı şemalarda (SBRT/HipoFx) α/β oranına göre ayrışır.'
                    : 'd = 2.0 Gy conventional fractionation results in EQD2 = Prescription Dose (60 Gy) for all α/β values. Schemes with fraction dose ≠ 2 Gy (SBRT/HypoFx) split by α/β ratio.'}
                </p>
              </div>
            </div>

            {/* SİSTEMİK TEDAVİ VE KANIT */}
            {activeScheme.systemicTherapy && (
              <div className="p-2.5 rounded-md bg-indigo-50 border border-indigo-300 text-indigo-800 text-xs mb-3">
                <span className="font-bold block mb-0.5">{tText("💊 Eşlik Eden Sistemik Tedavi:")}</span>
                {tText(activeScheme.systemicTherapy)}
              </div>
            )}
            {/* KANIT VE ÇOKLU KILAVUZ EYLEM GRUBU (EVIDENCE ACTION GROUP) */}
            <div className="mb-4 glass-panel-glow p-4 text-[11px] text-slate-300">
              <div className="flex flex-col gap-2">
                <div>
                  <span className="font-semibold text-slate-200">
                    {lang === 'tr' ? '📚 Kanıt ve Kılavuz: ' : '📚 Evidence and Guidelines: '}
                  </span>
                  <span>{evidenceText}</span>
                </div>

                {resolvedEvidenceLinks.length > 0 && (
                  <div className="mt-1 flex flex-col gap-1.5 pt-2 border-t border-slate-800/60">
                    <span className="text-[10px] font-semibold tracking-wider text-slate-400 uppercase">
                      {lang === 'tr' ? 'Kılavuz ve Protokol Kaynakları:' : 'Guideline & Protocol Sources:'}
                    </span>
                    <div className="flex flex-wrap items-center gap-2">
                      {resolvedEvidenceLinks.map((link, idx) => {
                        const style = AUTHORITY_STYLES[link.authority] || AUTHORITY_STYLES.NCCN;
                        const badgeLabel = link.customBadge || formatBadgeLabel(link);
                        return (
                          <a
                            key={`${link.authority}-${link.url}-${idx}`}
                            href={link.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            title={`${link.authority}: ${link.title}${link.category ? ` (${link.category})` : ''}`}
                            className={`group inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-[11px] font-semibold transition-all duration-150 shadow-sm hover:scale-[1.02] active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 ${style.button}`}
                          >
                            <span className="font-bold tracking-wide">{badgeLabel}</span>
                            {link.category && (
                              <span className="hidden sm:inline-block rounded bg-black/40 px-1 py-0.5 text-[9px] font-normal opacity-85">
                                {link.category}
                              </span>
                            )}
                            <ArrowUpRight className="h-3 w-3 shrink-0 opacity-70 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:opacity-100" aria-hidden="true" />
                          </a>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* KOPYALANABİLİR RAPOR PANELİ */}
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
                    Dışa Aktar / Export
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
                        <span>{lang === 'tr' ? 'Vaka Arşivine Ekle' : 'Add to Case Archive'}</span>
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
                        <span>{lang === 'tr' ? 'PDF Konsey Özeti Yazdır' : 'Print Board Summary PDF'}</span>
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
                  [ ⭐ Bu Vakayı Favorilere Ekle ]
                </button>
                <button
                  type="button"
                  onClick={copyToClipboard}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 py-2.5 text-xs font-bold text-white shadow-lg shadow-emerald-950/40 transition hover:bg-emerald-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 sm:w-auto"
                >
                  {copied ? <Check className="h-4 w-4" aria-hidden="true" /> : <Copy className="h-4 w-4" aria-hidden="true" />}
                  {copied
                    ? (lang === 'tr' ? 'Kopyalandı!' : 'Copied!')
                    : (lang === 'tr' ? 'Klinik Özeti Kopyala' : 'Copy Summary')}
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
              {lang === 'tr' ? '1. Adıma Dön' : 'Back to Step 1'}
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
            aria-label={lang === 'tr' ? 'Hızlı arama ve komut paleti' : 'Quick search and command palette'}
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
                aria-label={lang === 'tr' ? 'Tümör, protokol veya sayfa ara' : 'Search tumors, protocols, or pages'}
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
                placeholder={lang === 'tr' ? 'Tümör, alt tip, çalışma veya sayfa ara…' : 'Search tumors, subsites, trials, or pages…'}
                className="min-w-0 flex-1 bg-transparent p-4 text-sm text-white placeholder:text-slate-400 focus:outline-none"
              />
              <kbd className="shrink-0 rounded-md border border-slate-700 bg-slate-800 px-1.5 py-1 font-mono text-[10px] text-slate-300">ESC</kbd>
            </div>

            <div id="command-palette-results" role="listbox" className="max-h-[min(70vh,560px)] overflow-y-auto p-2">
              {commandPaletteGroups.length === 0 ? (
                <div className="px-4 py-10 text-center text-xs text-slate-400">
                  {lang === 'tr' ? '🔍 Eşleşen klinik protokol veya organ bulunamadı.' : '🔍 No matching clinical protocol or organ found.'}
                </div>
              ) : commandPaletteGroups.map((group, groupIndex) => {
                const groupStartIndex = commandPaletteGroups
                  .slice(0, groupIndex)
                  .reduce((total, previousGroup) => total + previousGroup.items.length, 0);
                return (
                  <div key={group.id} className="mb-2 last:mb-0">
                    <h3 className="px-3 pb-1 pt-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">{group.title}</h3>
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
                              <span className="mt-0.5 block truncate text-[10px] text-slate-400">{item.subtitle}</span>
                            </span>
                            {item.kind === 'page'
                              ? <ArrowUpRight className="h-3.5 w-3.5 shrink-0 text-slate-400" aria-hidden="true" />
                              : item.kind === 'protocol'
                                ? <span className="shrink-0 rounded-md bg-amber-500/10 px-1.5 py-0.5 text-[9px] font-semibold text-amber-300">{lang === 'tr' ? 'YÜKLE' : 'LOAD'}</span>
                                : <span className="shrink-0 text-[9px] text-slate-600">↵</span>}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>

            <footer className="flex items-center justify-between border-t border-slate-800 px-4 py-2 text-[10px] text-slate-400">
              <span>{lang === 'tr' ? '↑ ↓ gezin' : '↑ ↓ navigate'} <span className="mx-1 text-slate-700">•</span> Enter {lang === 'tr' ? 'seç' : 'select'}</span>
              <span>Ctrl K {lang === 'tr' ? 'aç / kapat' : 'toggle'}</span>
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
                  🧮 {lang === 'tr' ? 'LQ Model • BED / EQD2' : 'LQ Model • BED / EQD2'}
                </div>
                <h2 id="radiobiology-modal-title" className="text-lg font-bold text-white sm:text-xl">
                  {lang === 'tr' ? 'Lineer-Kuadratik Radyobiyolojik Doz Eşdeğerlik Konsolu' : 'Linear-Quadratic Radiobiological Dose Equivalence Console'}
                </h2>
                <p className="mt-1 max-w-2xl text-xs leading-relaxed text-slate-400">
                  {lang === 'tr'
                    ? 'Farklı fraksiyonasyon şemalarını kıyaslayın; izoefektif EQD2 ve BED değerlerini anında hesaplayın.'
                    : 'Compare fractionation schedules and calculate isoeffective EQD2 and BED values in real time.'}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsRadiobiologyModalOpen(false)}
                aria-label={lang === 'tr' ? 'Radyobiyoloji dönüştürücüsünü kapat' : 'Close radiobiology calculator'}
                className="shrink-0 rounded-xl border border-slate-700 p-2 text-slate-400 transition hover:border-slate-500 hover:bg-slate-800 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500"
              >
                <XCircle className="h-5 w-5" aria-hidden="true" />
              </button>
            </header>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <section className="rounded-2xl border border-indigo-500/25 bg-indigo-500/[0.06] p-4">
                <div className="mb-4 flex items-center justify-between gap-2">
                  <div>
                    <h3 className="text-sm font-bold text-indigo-200">{lang === 'tr' ? 'A. Mevcut Reçete' : 'A. Current Prescription'}</h3>
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
                      <div className="text-[10px] text-slate-400">{metric.label}</div>
                      <div className="mt-0.5 text-xs font-bold text-white">{metric.value}</div>
                    </div>
                  ))}
                </div>
                <div className="mb-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  {lang === 'tr' ? `Tümör α/β = ${radiobiologyComparison.reference.alphaBeta} Gy` : `Tumor α/β = ${radiobiologyComparison.reference.alphaBeta} Gy`}
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="rounded-xl bg-slate-950/40 p-2.5"><div className="text-[10px] text-slate-400">BED</div><div className="font-mono text-sm font-bold text-amber-300">{radiobiologyComparison.reference.tumorBed.toFixed(1)} Gy</div></div>
                  <div className="rounded-xl bg-slate-950/40 p-2.5"><div className="text-[10px] text-slate-400">EQD2</div><div className="font-mono text-sm font-bold text-emerald-300">{radiobiologyComparison.reference.tumorEqd2.toFixed(1)} Gy</div></div>
                </div>
                <div className="mb-2 mt-4 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  {lang === 'tr' ? 'Geç Hasar / Normal Doku α/β = 3 Gy' : 'Late Tissue / Normal Tissue α/β = 3 Gy'}
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="rounded-xl bg-slate-950/40 p-2.5"><div className="text-[10px] text-slate-400">BED₃</div><div className="font-mono text-sm font-bold text-amber-300">{radiobiologyComparison.reference.lateBed.toFixed(1)} Gy</div></div>
                  <div className="rounded-xl bg-slate-950/40 p-2.5"><div className="text-[10px] text-slate-400">EQD2₃</div><div className="font-mono text-sm font-bold text-emerald-300">{radiobiologyComparison.reference.lateEqd2.toFixed(1)} Gy</div></div>
                </div>
              </section>

              <section className="rounded-2xl border border-sky-500/25 bg-sky-500/[0.05] p-4">
                <div className="mb-4">
                  <h3 className="text-sm font-bold text-sky-200">{lang === 'tr' ? 'B. Test Edilen Fraksiyonasyon' : 'B. Test Fractionation Schedule'}</h3>
                  <p className="mt-0.5 text-[11px] text-slate-400">{lang === 'tr' ? 'Yeni şema için değerleri düzenleyin.' : 'Edit values for the proposed schedule.'}</p>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <label className="text-[11px] font-medium text-slate-300" htmlFor="comparison-fraction-dose">
                    {lang === 'tr' ? 'Fraksiyon başına doz (d), Gy' : 'Dose per fraction (d), Gy'}
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
                    {lang === 'tr' ? 'Fraksiyon sayısı (n)' : 'Number of fractions (n)'}
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
                  aria-label={lang === 'tr' ? 'Fraksiyon başına dozu ayarla' : 'Adjust dose per fraction'}
                  className="mt-2 h-1.5 w-full cursor-pointer accent-sky-500"
                />
                <div className="mt-3 rounded-lg border border-slate-700/70 bg-slate-950/40 px-3 py-2 text-xs">
                  <span className="text-slate-400">{lang === 'tr' ? 'Otomatik toplam doz:' : 'Calculated total dose:'}</span>
                  <strong className="ml-2 font-mono text-white">{radiobiologyComparison.comparison.dose.toFixed(1)} Gy</strong>
                  <span className="ml-2 text-slate-400">D = n × d</span>
                </div>
                <div className="mt-4">
                  <div className="mb-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    {lang === 'tr' ? 'Tümör α/β Seçimi' : 'Tumor α/β Selection'}
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {[
                      { value: 10, label: lang === 'tr' ? '10 Gy • Genel tümör' : '10 Gy • Most tumors' },
                      { value: 4, label: lang === 'tr' ? '4 Gy • Meme' : '4 Gy • Breast' },
                      { value: 1.5, label: lang === 'tr' ? '1.5 Gy • Prostat' : '1.5 Gy • Prostate' },
                      { value: 3, label: lang === 'tr' ? '3 Gy • Sarkom / geç doku' : '3 Gy • Sarcoma / late tissue' },
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
                  {lang === 'tr' ? `Tümör α/β = ${comparisonAlphaBeta} Gy` : `Tumor α/β = ${comparisonAlphaBeta} Gy`}
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="rounded-xl bg-slate-950/40 p-2.5"><div className="text-[10px] text-slate-400">BED</div><div className="font-mono text-sm font-bold text-amber-300">{radiobiologyComparison.comparison.tumorBed.toFixed(1)} Gy</div></div>
                  <div className="rounded-xl bg-slate-950/40 p-2.5"><div className="text-[10px] text-slate-400">EQD2</div><div className="font-mono text-sm font-bold text-emerald-300">{radiobiologyComparison.comparison.tumorEqd2.toFixed(1)} Gy</div></div>
                </div>
                <div className="mb-2 mt-4 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  {lang === 'tr' ? 'Geç Hasar / Normal Doku α/β = 3 Gy' : 'Late Tissue / Normal Tissue α/β = 3 Gy'}
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="rounded-xl bg-slate-950/40 p-2.5"><div className="text-[10px] text-slate-400">BED₃</div><div className="font-mono text-sm font-bold text-amber-300">{radiobiologyComparison.comparison.lateBed.toFixed(1)} Gy</div></div>
                  <div className="rounded-xl bg-slate-950/40 p-2.5"><div className="text-[10px] text-slate-400">EQD2₃</div><div className="font-mono text-sm font-bold text-emerald-300">{radiobiologyComparison.comparison.lateEqd2.toFixed(1)} Gy</div></div>
                </div>
              </section>
            </div>

            <div className="mt-4 rounded-xl border border-slate-700/70 bg-slate-950/40 px-3 py-2.5 text-center font-mono text-[10px] leading-relaxed text-slate-300 sm:text-xs">
              BED = D × (1 + d / (α/β)) <span className="mx-2 text-slate-600">|</span> EQD2 = BED / (1 + 2 / (α/β))
              <span className="mt-1 block font-sans text-[10px] text-slate-400">{lang === 'tr' ? 'Geç doku karşılaştırması için α/β = 3 Gy alınmıştır.' : 'Late-tissue comparison uses α/β = 3 Gy.'}</span>
            </div>

            <section className="mt-4 rounded-2xl border border-slate-700/80 bg-slate-900/50 p-4">
              <h3 className="mb-3 text-sm font-bold text-white">{lang === 'tr' ? 'Otomatik Fark ve Klinik Kıyaslama' : 'Automatic Delta and Clinical Comparison'}</h3>
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                <div className={`rounded-xl border p-3 ${Math.abs(radiobiologyComparison.tumorEqd2DeltaPercent) <= 5 ? 'border-emerald-500/30 bg-emerald-500/10' : radiobiologyComparison.tumorEqd2Delta > 0 ? 'border-amber-500/30 bg-amber-500/10' : 'border-sky-500/30 bg-sky-500/10'}`}>
                  <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">{lang === 'tr' ? 'Tümör EQD2 Farkı' : 'Tumor EQD2 Difference'}</div>
                  <div className="mt-1 text-sm font-bold text-white">
                    {radiobiologyComparison.tumorEqd2Delta > 0 ? '+' : ''}{radiobiologyComparison.tumorEqd2Delta.toFixed(1)} Gy ({radiobiologyComparison.tumorEqd2DeltaPercent > 0 ? '+' : ''}{radiobiologyComparison.tumorEqd2DeltaPercent.toFixed(1)}%)
                  </div>
                  <div className="mt-0.5 text-[11px] text-slate-300">
                    {Math.abs(radiobiologyComparison.tumorEqd2DeltaPercent) <= 5
                      ? (lang === 'tr' ? 'Yakın izoefektif aralık' : 'Within a near-isoeffective range')
                      : radiobiologyComparison.tumorEqd2Delta > 0
                        ? (lang === 'tr' ? 'Modelde daha yüksek tümör EQD2' : 'Higher modeled tumor EQD2')
                        : (lang === 'tr' ? 'Modelde daha düşük tümör EQD2' : 'Lower modeled tumor EQD2')}
                  </div>
                </div>
                <div className={`rounded-xl border p-3 ${radiobiologyComparison.lateBedDelta <= 0 ? 'border-emerald-500/30 bg-emerald-500/10' : 'border-rose-500/30 bg-rose-500/10'}`}>
                  <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">{lang === 'tr' ? 'Normal Doku BED₃ Farkı' : 'Normal Tissue BED₃ Difference'}</div>
                  <div className="mt-1 text-sm font-bold text-white">{radiobiologyComparison.lateBedDelta > 0 ? '+' : ''}{radiobiologyComparison.lateBedDelta.toFixed(1)} Gy</div>
                  <div className="mt-0.5 text-[11px] text-slate-300">
                    {radiobiologyComparison.lateBedDelta < 0
                      ? (lang === 'tr' ? 'Daha düşük modellenen geç doku etkisi' : 'Lower modeled late-tissue effect')
                      : radiobiologyComparison.lateBedDelta > 0
                        ? (lang === 'tr' ? 'Daha yüksek modellenen geç doku etkisi' : 'Higher modeled late-tissue effect')
                        : (lang === 'tr' ? 'Referansla aynı BED₃' : 'Same BED₃ as reference')}
                  </div>
                </div>
              </div>
            </section>

            <section className="mt-4 rounded-2xl border border-amber-500/25 bg-amber-500/[0.05] p-4">
              <h3 className="text-sm font-bold text-amber-100">{lang === 'tr' ? 'Tedavi Arası / Repopülasyon Telafisi Tahmini' : 'Treatment Gap / Repopulation Compensation Estimate'}</h3>
              <p className="mt-1 text-[11px] leading-relaxed text-slate-400">
                {lang === 'tr' ? 'Yaklaşık doğrusal model: ΔD = kaçırılan gün × 0.6 Gy/gün. Bu tahmin reçete değişikliği değildir.' : 'Approximate linear model: ΔD = missed days × 0.6 Gy/day. This estimate is not a prescription change.'}
              </p>
              <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-3">
                <label className="text-[11px] font-medium text-slate-300" htmlFor="missed-treatment-days">
                  {lang === 'tr' ? 'Kaçırılan gün / fraksiyon (k)' : 'Missed days / fractions (k)'}
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
                  {lang === 'tr' ? 'Kalan fraksiyon sayısı' : 'Remaining fractions'}
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
                  <div className="text-[10px] text-slate-400">{lang === 'tr' ? 'Hesaplanan doz kaybı (ΔD)' : 'Estimated dose loss (ΔD)'}</div>
                  <div className="mt-1 font-mono text-sm font-bold text-amber-300">{(missedTreatmentDays * 0.6).toFixed(1)} Gy</div>
                  <div className="mt-1 text-[10px] text-slate-400">
                    {lang === 'tr' ? 'Telafi için kalan fx başına' : 'Estimated per remaining fx'}: <strong className="text-white">{((missedTreatmentDays * 0.6) / remainingTreatmentFractions).toFixed(2)} Gy</strong>
                  </div>
                </div>
              </div>
              <p className="mt-3 text-[10px] leading-relaxed text-slate-400">
                {lang === 'tr'
                  ? 'LQ tahminleri klinik toksisiteyi veya tümör kontrolünü tek başına belirlemez. Herhangi bir fraksiyonasyon telafisi; endikasyon, tedavi amacı, normal doku dozları ve kurum protokolüyle sorumlu radyasyon onkoloğu tarafından doğrulanmalıdır.'
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
                <div className="font-mono text-[11px] text-slate-600 dark:text-slate-200">
                  {selectedOrgan.toUpperCase()} • {selectedT} {selectedN} {selectedM} • {tText(activeScheme.name)}
                </div>
              </div>

              <div className="mb-4">
                <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wider text-slate-400">
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
                  <span className="flex items-center gap-1.5"><AiLogo id="chatgpt" className="h-4 w-4" />{lang === 'tr' ? 'ChatGPT ile Aç' : 'Open in ChatGPT'}</span>
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
                  <span className="flex items-center gap-1.5"><AiLogo id="gemini" className="h-4 w-4" />{lang === 'tr' ? 'Google Gemini ile Aç' : 'Open in Google Gemini'}</span>
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
                  <span className="flex items-center gap-1.5"><AiLogo id="claude" className="h-4 w-4" />{lang === 'tr' ? 'Claude ile Aç' : 'Open in Claude'}</span>
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

      {isReportModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-2xl border border-slate-800 bg-[#0c1322] p-6 shadow-2xl">
            <div className="mb-4 flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-blue-600" aria-hidden="true" />
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  {lang === 'tr' ? 'Tıbbi Rapor Analizi & Otomatik Evreleme' : 'Clinical Report Analysis & Auto-Staging'}
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
                      {lang === 'tr' ? 'Belge / Rapor Dosyası Seçin veya Sürükleyin' : 'Choose or Drag & Drop Report File'}
                    </div>
                    <div className="text-[10px] text-slate-400">
                      PDF, TXT, DOCX, JPG, PNG • {lang === 'tr' ? 'Otomatik Metin Çıkarımı' : 'Automatic Text Extraction'}
                    </div>
                  </>
                )}
              </div>
            </div>
            <div className="mb-3 flex items-center gap-3 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
              <div className="h-px flex-1 bg-slate-200 dark:bg-slate-800" />
              <span>{lang === 'tr' ? 'veya metni aşağıya yapıştırın' : 'or paste text directly below'}</span>
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
              placeholder={lang === 'tr' ? "Örnek: 'Prostat biyopsisinde Gleason 4+3=7, PSA: 14 ng/ml, cT3a, N0, M0...'" : 'Paste pathology, MRI, or PET report text here...'}
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
              <button type="button" onClick={() => { setReportInputText(''); setParsedData(null); setUploadedFileName(''); setIsDragging(false); setIsReportModalOpen(false); }} className="rounded-xl px-3 py-2 text-xs font-semibold text-slate-400 hover:text-slate-700 dark:hover:text-slate-200">
                {lang === 'tr' ? 'Vazgeç' : 'Cancel'}
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
                {lang === 'tr' ? 'Sisteme Uygula & Otomatik Evrele ➔' : 'Apply to CDSS & Auto-Stage ➔'}
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
                📁 {lang === 'tr' ? 'Klinik Vaka Arşivi' : 'Clinical Case Archive'}
              </h2>
              <button
                type="button"
                onClick={() => setIsCaseArchiveOpen(false)}
                aria-label={lang === 'tr' ? 'Vaka arşivini kapat' : 'Close case archive'}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white"
              >
                <XCircle className="h-5 w-5" aria-hidden="true" />
              </button>
            </header>
            <p className="border-b border-slate-800 bg-slate-900/50 px-4 py-2 text-[11px] leading-relaxed text-amber-100/80 sm:px-6">
              {lang === 'tr'
                ? 'Kayıtlar yalnızca bu tarayıcının localStorage alanında tutulur ve sunucuya gönderilmez. Depolama şifreli değildir; mümkünse kimliksiz ID kullanın, cihaz erişimini koruyun ve yerel mevzuat uyumunu kurumunuzla doğrulayın.'
                : 'Records stay in this browser localStorage and are not sent to a server. Storage is not encrypted; use pseudonymous IDs where possible, protect device access, and confirm local regulatory compliance with your institution.'}
            </p>
            <div className="flex-1 space-y-2 overflow-y-auto p-3 sm:p-5">
              {caseArchive.length === 0 ? (
                <p className="rounded-xl border border-dashed border-slate-700 p-6 text-center text-sm text-slate-400">
                  {lang === 'tr' ? 'Henüz arşivlenmiş vaka yok.' : 'No cases have been archived yet.'}
                </p>
              ) : caseArchive.map(record => (
                <article key={record.id} className="rounded-xl border border-slate-800 bg-slate-900/50 p-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <h3 className="truncate text-sm font-semibold text-white">
                        {record.diagnosis} · {record.patientId}
                      </h3>
                      <p className="mt-1 text-xs text-slate-300">
                        {lang === 'tr' ? 'Evre' : 'Stage'}: {record.stage}
                        {record.age && ` · ${record.age} ${lang === 'tr' ? 'yaş' : 'years'}`}
                        {record.gender && ` · ${record.gender}`}
                      </p>
                      <p className="mt-1 text-xs text-slate-200">{record.prescription}</p>
                      <p className="mt-1 font-mono text-[11px] text-sky-200">
                        BED₁₀ {record.bed} Gy · EQD2₁₀ {record.eqd2} Gy
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeArchivedCase(record.id)}
                      aria-label={`${lang === 'tr' ? 'Arşivden sil' : 'Remove from archive'}: ${record.patientId}`}
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
          MODAL: KILAVUZ BİLGİ DOKÜMANI
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
                {lang === 'tr' ? 'Radyasyon Onkolojisi CDSS - Kılavuzlar ve Yasal Bilgilendirme' : 'Radiation Oncology CDSS - Guidelines & Legal Framework'}</h3>
              <button
                onClick={() => setShowGuidelineModal(false)}
                aria-label={lang === 'tr' ? 'Kılavuz penceresini kapat' : 'Close guidelines window'}
                className="text-slate-600 hover:text-slate-900 p-1 rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
              >
                <XCircle className="w-5 h-5" aria-hidden="true" />
              </button>
            </div>

            <div role="tablist" aria-label={lang === 'tr' ? 'Kaynakça modalı sekmeleri' : 'Reference modal tabs'} className="mb-4 flex flex-wrap gap-2 border-b border-slate-200 dark:border-slate-700">
              {([
              ['guidelines', lang === 'tr' ? 'Kılavuzlar & Landmark Çalışmalar' : 'Guidelines & Landmark Trials'],
              ['oar', lang === 'tr' ? 'OAR Tolerans Standartları' : 'OAR Dose Constraints & Standards'],
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
                    ? 'Klinik kapsam, NCCN v1.2025, ASTRO ve ESTRO kılavuzları ile uluslararası randomize Faz III çalışmaların kanıtları doğrultusunda düzenlenmiştir. Kılavuz sürümleri ve öneriler klinik kullanımdan önce güncel kaynaklardan doğrulanmalıdır.'
                    : 'Clinical scope is structured in strict alignment with NCCN v1.2025, ASTRO, ESTRO guidelines, and international randomized Phase III clinical trials. Guideline versions and recommendations must be clinically verified against current institutional protocols prior to application.'}</p>
                  <div>
                    <h4 className="mb-1 font-bold text-amber-700">{lang === 'tr' ? 'Landmark çalışmalar ve klinik başlıklar' : 'Landmark Trials and Clinical Topics'}</h4>
                    <ul className="list-disc space-y-1 pl-5">
                      {lang === 'tr' ? <><li><strong>Toraks:</strong> PACIFIC (evre III KHDAK), Turrisi ve CONVERT (KHAK), Lung-ART (postoperatif toraks RT).</li><li><strong>Meme:</strong> FAST-Forward (hipofraksiyone adjuvan RT).</li><li><strong>GİS:</strong> RAPIDO ve PRODIGE-23 (rektum TNT), PORTEC-3 (endometriyum adjuvan kemoradyoterapi).</li><li><strong>Jinekoloji:</strong> EMBRACE II (serviks KRT ve görüntü kılavuzlu brakiterapi).</li><li><strong>MSS:</strong> Stupp protokolü (glioblastom kemoradyoterapisi).</li></> : <><li>Thorax: PACIFIC (Stage III NSCLC concurrent CRT + durvalumab), Turrisi and CONVERT (SCLC hyperfractionated/conventional CRT), and Lung-ART (PORT indication).</li><li>Breast: FAST-Forward (1-week adjuvant hypofractionation 26 Gy/5 fx), DBCG/BIG (regional nodal irradiation).</li><li>GI: RAPIDO and PRODIGE-23 (total neoadjuvant therapy for LARC), PORTEC-3 (adjuvant chemoradiotherapy for high-risk endometrial cancer).</li><li>Gynecology: EMBRACE II (cervical chemoradiotherapy and 3D MR-IGABT brachytherapy).</li><li>CNS: Stupp protocol (glioblastoma 60 Gy + concurrent/adjuvant TMZ), Perry protocol (elderly hypofractionation).</li></>}
                    </ul>
                  </div>
                  <p className="text-[11px] text-slate-600 dark:text-slate-200">
                    {lang === 'tr' ? 'NCCN®, ASTRO®, ESTRO®, RTOG®, QUANTEC® ve DEGRO® ilgili kurumların tescilli markalarıdır.' : 'NCCN®, ASTRO®, ESTRO®, RTOG®, QUANTEC®, and DEGRO® are registered trademarks of their respective organizations.'}</p>
                </>
              )}
              {activeReferenceTab === 'oar' && (
                <>
                  <p>{lang === 'tr' ? 'Normal doku doz sınırları, kullanılan fraksiyonasyon, hedef hacim, eşzamanlı tedavi ve hastaya özgü klinik koşullarla birlikte değerlendirilmelidir.' : 'Normal tissue dose-volume constraints are derived from QUANTEC (Quantitative Analyses of Normal Tissue Effects in the Clinic), HyTEC (Stereotactic Body Radiotherapy / SRS), and EMBRACE II brachytherapy consensus metrics. Tolerance limits represent safe clinical thresholds and must be individualized per patient anatomy.'}</p>
                  <ul className="list-disc space-y-2 pl-5">
                    <li><strong>{tText("QUANTEC:")}</strong> {tText(" Konvansiyonel fraksiyonasyonda normal doku doz-hacim etkilerini özetleyen, organ ve sonlanıma özgü derlemeler.")}</li>
                    <li><strong>{tText("HyTEC:")}</strong> {tText(" Stereotaktik radyocerrahi ve vücut RT’si için doz-hacim ve toksisite kanıtlarını derleyen raporlar.")}</li>
                    <li><strong>{tText("UK SABR Consortium:")}</strong> {tText(" SABR hasta seçimi, planlama ve organ riskindeki doz kısıtları için teknik rehberler.")}</li>
                    <li><strong>{tText("EMBRACE II:")}</strong> {tText(" Serviks kanserinde görüntü kılavuzlu adaptif brakiterapi hedef ve organ riskindeki doz hedefleri/kısıtları.")}</li>
                  </ul>
                  <p className="rounded-md border border-amber-200 bg-amber-50 p-3 text-amber-900">
                    {lang === 'tr' ? 'Bu merkez tek başına hasta planlaması için doz reçetesi değildir. OAR kısıtları, geçerli protokolün güncel birincil kaynağından ve kurum onaylı planlama yönergelerinden kontrol edilmelidir.' : 'This platform is not a standalone treatment prescription. OAR constraints must be checked against the current primary source and institution-approved planning guidelines.'}</p>
                </>
              )}
              {activeReferenceTab === 'disclaimer' && (
                <div className="space-y-3">
                  <h4 className="font-bold text-slate-900 dark:text-slate-100">{lang === 'tr' ? 'Yasal sorumluluk reddi ve telif' : 'Clinical Disclaimer'}</h4>
                  <p>
                    {lang === 'tr' ? 'RadOnc CDSS, kanıta dayalı radyasyon onkolojisi literatürünü derleyen bir eğitim ve klinik karar destek aracıdır. Hekimin bireysel tıbbi muhakemesinin ve multidisipliner tümör konseyi (MDT) kararlarının yerine geçemez. Planlama sınırları her hasta için doğrulanmalıdır. NCCN®, ASTRO®, ESTRO®, RTOG® ve QUANTEC® ilgili kurumların tescilli markaları olup resmi sponsorluk bağı bulunmamaktadır.' : 'RadOnc CDSS is an evidence-based clinical decision-support and educational platform. It does not replace individualized clinical judgment, physician evaluation, or multidisciplinary tumor board (MDT) consensus. Treatment planning and organ-at-risk safety constraints must be validated by the radiation oncologist and medical physicist for each patient.'}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
      <article id="print-report" className="hidden print:block" aria-label={lang === 'tr' ? 'Multidisipliner tümör konseyi raporu' : 'Multidisciplinary tumor board summary'}>
        <header className="print-report-header">
          <div>
            <div className="font-bold">RadOnc CDSS — {lang === 'tr' ? 'Klinik Karar Destek Platformu' : 'Clinical Decision Support Platform'}</div>
            <div className="text-[8pt]">{lang === 'tr' ? 'Multidisipliner Onkoloji Konsey Raporu' : 'Multidisciplinary Oncology Board Summary'}</div>
          </div>
          <div className="text-right text-[8pt]">
            <div>{printMetadata.timestamp || '—'}</div>
            <div>{lang === 'tr' ? 'Rapor No' : 'Report No'}: {printMetadata.reportId || '—'}</div>
          </div>
        </header>

        <section className="print-report-section">
          <h2>1. {lang === 'tr' ? 'Hasta ve Patolojik Tanı' : 'Patient and Pathologic Diagnosis'}</h2>
          <table className="print-report-table">
            <tbody>
              <tr>
                <th>{lang === 'tr' ? 'Anatomik Bölge' : 'Anatomic Site'}</th><td>{reportOrganNames[selectedOrgan]}</td>
                <th>{lang === 'tr' ? 'Yaş' : 'Age'}</th><td>{patientAgeYears || '—'}</td>
              </tr>
              <tr>
                <th>{lang === 'tr' ? 'Tanı / Alt Tip' : 'Diagnosis / Subsite'}</th><td>{reportDiagnosis}</td>
                <th>{lang === 'tr' ? 'Histoloji' : 'Histology'}</th><td>{reportHistology}</td>
              </tr>
              <tr>
                <th>{lang === 'tr' ? 'Moleküler / Klinik Parametreler' : 'Molecular / Clinical Parameters'}</th><td colSpan={3}>{reportMolecular}</td>
              </tr>
              <tr>
                <th>{lang === 'tr' ? 'Klinik Evre' : 'Clinical Stage'}</th><td colSpan={3}>{selectedT} {selectedN} {selectedM} • {tText(evaluatedDecision.statusText)}</td>
              </tr>
            </tbody>
          </table>
        </section>

        <section className="print-report-section">
          <h2>2. {lang === 'tr' ? 'Endike Radyoterapi ve Fraksiyonasyon Kararı' : 'Radiotherapy and Fractionation Recommendation'}</h2>
          <table className="print-report-table">
            <tbody>
              <tr>
                <th>{lang === 'tr' ? 'Reçete' : 'Prescription'}</th><td>{tText(activeScheme.name)}</td>
                <th>{lang === 'tr' ? 'Doz / Fraksiyon' : 'Dose / Fractions'}</th><td>{activeScheme.totalDoseGy} Gy / {activeScheme.fractionCount} × {activeScheme.fractionDoseGy} Gy</td>
              </tr>
              <tr>
                <th>{lang === 'tr' ? 'Teknik' : 'Technique'}</th><td>{tText(activeScheme.technique)}</td>
                <th>{lang === 'tr' ? 'Solunum Yönetimi' : 'Motion Management'}</th><td>{selectedOrgan === 'thorax' || selectedOrgan === 'breast' ? tText(breathingMotion) : '—'}</td>
              </tr>
              <tr>
                <th>BED (α/β = {radiobiology.ab})</th><td>{radiobiology.bed} Gy</td>
                <th>EQD2</th><td>{radiobiology.eqd2} Gy</td>
              </tr>
              <tr>
                <th>{lang === 'tr' ? 'Sistemik Tedavi' : 'Systemic Therapy'}</th><td colSpan={3}>{tText(activeScheme.systemicTherapy || '—')}</td>
              </tr>
            </tbody>
          </table>
        </section>

        <section className="print-report-section print-report-tables">
          <div>
            <h2>3a. {lang === 'tr' ? 'TCP Hedef Reçetesi ve Hacimler (ICRU 83)' : 'TCP Target Prescription and Volumes (ICRU 83)'}</h2>
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
            <h2>3b. {lang === 'tr' ? 'OAR NTCP Tolerans Tavanları' : 'OAR NTCP Tolerance Ceilings'}</h2>
            <table className="print-report-table">
              <thead><tr><th>{lang === 'tr' ? 'Organ' : 'Organ'}</th><th>{lang === 'tr' ? 'Ölçüt' : 'Metric'}</th><th>{lang === 'tr' ? 'Sınır' : 'Limit'}</th><th>{lang === 'tr' ? 'Kaynak' : 'Source'}</th></tr></thead>
              <tbody>
                  {clinicallyRelevantOars.map((oar, index) => (
                  <tr key={`${oar.organ}-${index}`}><td>{tText(oar.organ)}</td><td>{tText(oar.metric)}{oar.context && <span className="block text-[6pt]">{lang === 'tr' ? oar.context : oar.contextEn || oar.context}</span>}</td><td>{oar.limit}</td><td>{tText(oar.source)}</td></tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="print-report-section print-report-evidence">
          <h2>4. {lang === 'tr' ? 'Kanıt Düzeyi ve Hekim İmzası' : 'Evidence and Physician Sign-off'}</h2>
          <div><strong>{lang === 'tr' ? 'Kanıt / Kılavuz:' : 'Evidence / Guideline:'}</strong> {tText(activeScheme.evidence)}</div>
          <div className="print-report-signature">
            <div className="signature-line" />
            <strong>{lang === 'tr' ? 'Sorumlu Radyasyon Onkoloğu: Dr. Harun PEKMEZCİ, MD' : 'Attending Radiation Oncologist: Dr. Harun PEKMEZCİ, MD'}</strong>
          </div>
        </section>
        <footer className="print-report-footer">
          {lang === 'tr'
            ? 'Klinik karar destek çıktısıdır; nihai tedavi kararı sorumlu hekim ve multidisipliner konsey değerlendirmesine tabidir.'
            : 'Clinical decision-support output only; final treatment decisions remain subject to physician judgment and multidisciplinary review.'}
        </footer>
      </article>
    </>
  );
}
