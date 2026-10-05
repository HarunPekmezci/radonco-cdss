import React, { useId } from 'react';
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
  Info,
} from 'lucide-react';
import { NCCN_GUIDELINE_MAP } from '@/data/nccnGuidelineMap';

export const SUBTYPE_DISPLAY_MAP: Record<string, string> = {
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
  'gis-Mide': 'Mide Kanseri (Gastric Ca)',
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

// MDR / SaMD Risk Mitigation: Uncontrolled free-text report extraction
// and non-deterministic LLM parsing have been eliminated from the primary decision path.
// All clinical decisions originate strictly from verified, deterministic rule matrices.

export const GeminiIcon = ({ className = 'h-4 w-4' }: { className?: string }) => {
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

export const ChatGPTIcon = ({ className = 'h-4 w-4' }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={`${className} text-[#10a37f]`} aria-hidden="true">
    <path d="M22.2819 9.8211a5.9847 5.9847 0 0 0-.5157-4.9108 6.0462 6.0462 0 0 0-6.5098-2.9A6.0651 6.0651 0 0 0 4.9807 4.1818a5.9847 5.9847 0 0 0-3.9977 2.9 6.0462 6.0462 0 0 0 .7427 7.0966 5.98 5.98 0 0 0 .511 4.9107 6.051 6.051 0 0 0 6.5146 2.9001A5.9847 5.9847 0 0 0 13.2599 24a6.0557 6.0557 0 0 0 5.7718-4.2058 5.9894 5.9894 0 0 0 3.9977-2.9001 6.0557 6.0557 0 0 0-.7475-7.0729zm-9.022 12.6081a4.4755 4.4755 0 0 1-2.8764-1.0408l.1419-.0804 4.7783-2.7582a.7948.7948 0 0 0 .3927-.6813v-6.7369l2.02 1.1686a.071.071 0 0 1 .038.052v5.5826a4.5045 4.5045 0 0 1-4.4945 4.4944zm-9.6607-4.1254a4.4708 4.4708 0 0 1-.5346-3.0137l.142.0852 4.783 2.7582a.7712.7712 0 0 0 .7806 0l5.8428-3.3685v2.3324a.0804.0804 0 0 1-.0332.0615L9.74 19.9502a4.4992 4.4992 0 0 1-6.1408-1.6464zM2.3408 7.8956a4.485 4.485 0 0 1 2.3655-1.9728V11.6a.7664.7664 0 0 0 .3879.6765l5.8144 3.3543-2.0201 1.1685a.0757.0757 0 0 1-.071 0l-4.8303-2.7865A4.504 4.504 0 0 1 2.3408 7.8956zm16.0993 3.8558L12.5973 8.3829l2.02-1.1639a.0804.0804 0 0 1 .071 0l4.8303 2.7913a4.4944 4.4944 0 0 1-.6765 8.1042v-5.6772a.79.79 0 0 0-.402-.6859zm2.0107-3.0231l-.142-.0852-4.7735-2.7818a.7759.7759 0 0 0-.7854 0L9.407 9.2297V6.8974a.0662.0662 0 0 1 .0284-.0615l4.8303-2.7866a4.4992 4.4992 0 0 1 6.6802 4.66zM8.3065 12.863l-2.02-1.1638a.0804.0804 0 0 1-.038-.0567V6.0742a4.4992 4.4992 0 0 1 7.3757-3.4537l-.142.0805L8.704 5.459a.7948.7948 0 0 0-.3927.6813v6.7227zm1.1218-1.9728l3.4111-1.968 3.4158 1.968v3.9409l-3.4158 1.9728-3.4111-1.9728z" />
  </svg>
);

export const PerplexityIcon = ({ className = 'h-4 w-4' }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
    <path d="M12 2L4 7V17L12 22L20 17V7L12 2Z" stroke="#20B2AA" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M12 2V22M4 7L20 17M20 7L4 17" stroke="#20B2AA" strokeWidth="1.5" strokeLinecap="round" />
    <circle cx="12" cy="12" r="2.5" fill="#20B2AA" />
  </svg>
);

export const NotebookLMIcon = ({ className = 'h-4 w-4' }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
    <rect x="3" y="3" width="18" height="18" rx="4" fill="#1e1e2f" stroke="#8b5cf6" strokeWidth="1.5" />
    <path d="M7 7H17M7 11H17M7 15H13" stroke="#c4b5fd" strokeWidth="1.8" strokeLinecap="round" />
    <circle cx="16" cy="15" r="2" fill="#a78bfa" />
  </svg>
);

export const ClaudeIcon = ({ className = 'h-4 w-4' }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
    <path d="M12 2V6M12 18V22M2 12H6M18 12H22M4.93 4.93L7.76 7.76M16.24 16.24L19.07 19.07M4.93 19.07L7.76 16.24M16.24 7.76L19.07 4.93" stroke="#D97706" strokeWidth="2.5" strokeLinecap="round" />
    <circle cx="12" cy="12" r="3.5" fill="#D97706" />
  </svg>
);

export const GrokIcon = ({ className = 'h-4 w-4' }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={`${className} text-slate-100`} aria-hidden="true">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);

export const AiLogo = ({ id, className = 'h-4 w-4' }: { id: string; className?: string }) => {
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

export interface EContourTarget {
  url: string;
  label_tr: string;
  label_en: string;
}

export const getAdaptiveEContour = (
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


export const SUBSITES: Partial<Record<OrganId, { id: string; name: string }[]>> = {
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

export const ORGAN_TREE: Record<OrganId, Array<{ id: string; name_tr: string; name_en: string }>> = {
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
    { id: 'gis-anus', name_tr: 'Anal Kanal Kanseri', name_en: 'Anal Canal Cancer' },
    { id: 'gis-Karaciger', name_tr: 'Karaciğer Kanseri', name_en: 'Liver Cancer' },
    { id: 'gis-SafraYollari', name_tr: 'Safra Yolları Kanseri', name_en: 'Biliary Tract Cancer' },
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

export type QuickCaseCategoryId = 'thorax' | 'breast' | 'cns' | 'gus' | 'renal' | 'gis' | 'gynecology' | 'sarcoma-palliative' | 'emergencies';
export type QuickCaseRegimen = 'clinical' | 'ultra_hypo' | 'moderate_hypo' | 'sib_boost' | 'conventional';
export type QuickCasePreset = {
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

export interface ArchivedClinicalCase {
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

export const isArchivedClinicalCase = (value: unknown): value is ArchivedClinicalCase => {
  if (typeof value !== 'object' || value === null) return false;
  const record = value as Record<string, unknown>;
  return ['id', 'savedAt', 'patientId', 'age', 'gender', 'diagnosis', 'stage', 'prescription', 'bed', 'eqd2']
    .every(key => typeof record[key] === 'string');
};

export interface CustomFavoriteCase {
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

export const isCustomFavoriteCase = (value: unknown): value is CustomFavoriteCase => {
  if (typeof value !== 'object' || value === null) return false;
  const record = value as Record<string, unknown>;
  return ['id', 'label', 'savedAt', 'organ', 'subsite', 'selectedT', 'selectedN', 'selectedM']
    .every(key => typeof record[key] === 'string');
};

export type CommandPaletteItem =
  | { id: string; kind: 'organ'; title: string; subtitle: string; searchText: string; organ: OrganId; subsite: string; histologyId?: string }
  | { id: string; kind: 'protocol'; title: string; subtitle: string; searchText: string; preset: QuickCasePreset }
  | { id: string; kind: 'page'; title: string; subtitle: string; searchText: string; destination: 'references' | 'contact' | 'guidelines' | 'disclaimer' };

export const QUICK_CASE_PRESETS: QuickCasePreset[] = [
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
  { id: 'case-28', category: 'gis', title_tr: 'Postoperatif Mide Adenokarsinomu (INT-0116 / ARTIST)', title_en: 'Postoperative Gastric Adenocarcinoma (INT-0116 / ARTIST)', detail_tr: 'pT3-T4 N+ M0 • <D2 veya nodal+ D2 rezeksiyon • Adjuvan KRT 45 Gy / 25 fx', detail_en: 'pT3-T4 N+ M0 • <D2 or node+ D2 resection • Adjuvant CRT 45 Gy / 25 fx', organ: 'gis', subsite: 'gis-Mide', t: 'T3', n: 'N1', m: 'M0', histologyId: 'gastric-adenocarcinoma', regimen: 'clinical' },
];

export type GuidedStep = 1 | 2 | 3 | 4;

export const GUIDED_QUICK_SCENARIOS: Partial<Record<string, { title_tr: string; title_en: string }>> = {
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
  'case-28': {
    title_tr: 'Postoperatif Mide Karsinomu (INT-0116 / ARTIST)',
    title_en: 'Postoperative Gastric Adenocarcinoma (INT-0116 / ARTIST)',
  },
};

export const BENIGN_CLINICAL_OPTIONS: Record<string, { value: string; label: string }[]> = {
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
  authority: 'NCCN' | 'ASTRO' | 'ESTRO' | 'RTOG' | 'NRG' | 'Trial' | 'QUANTEC';
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

export const getVerifiedOarGuidance = (organ: OrganId, subsite: string, scheme: DoseScheme, lang: 'en' | 'tr'): OARNTPCeiling[] => {
  const isTr = lang === 'tr';
  const conventionalFractionation = scheme.fractionCount >= 15 && scheme.fractionDoseGy <= 2.1;
  const isSbrt = scheme.fractionCount <= 5 && scheme.fractionCount >= 1;
  const hasPelvicNodalTarget = scheme.targetVolumes.some(volume =>
    /pelvic|pelvis|pelvik|nodal|lenf nod/i.test(`${volume.name} ${volume.anatomical}`)
  );

  // 1. BRAIN / CNS
  if (organ === 'cns') {
    return [
      {
        organ: isTr ? 'Beyin Sapı' : 'Brainstem',
        metric: isSbrt ? 'Dmax' : 'Dmax',
        limit: isSbrt ? '< 12 Gy (1 fx) / < 23-31 Gy (3-5 fx)' : '≤ 54 Gy',
        source: 'QUANTEC / HyTEC (2021), DOI: 10.1016/j.ijrobp.2009.07.1753',
        context: isTr ? 'Konvansiyonelde Dmax ≤ 54 Gy; SRS/SRT için 1 fx < 12 Gy, 3-5 fx < 23-31 Gy.' : 'Conventional Dmax ≤ 54 Gy; SRS/SRT 1 fx < 12 Gy, 3-5 fx < 23-31 Gy.',
        contextEn: 'Conventional Dmax ≤ 54 Gy; SRS/SRT 1 fx < 12 Gy, 3-5 fx < 23-31 Gy.',
        classification: 'dose-volume-reference',
      },
      {
        organ: isTr ? 'Optik Sinirler / Kiazma' : 'Optic Nerves / Chiasm',
        metric: 'Dmax',
        limit: isSbrt ? '< 8-10 Gy (1 fx) / < 20-25 Gy (3-5 fx)' : '< 54-55 Gy',
        source: 'QUANTEC / HyTEC (2021); AAPM TG-101',
        context: isTr ? 'Optik nöropati riski; SRS 1 fx < 8-10 Gy, konvansiyonel < 54-55 Gy.' : 'Radiation optic neuropathy risk; SRS 1 fx < 8-10 Gy, conventional < 54-55 Gy.',
        contextEn: 'Radiation optic neuropathy risk; SRS 1 fx < 8-10 Gy, conventional < 54-55 Gy.',
        classification: 'dose-volume-reference',
      },
      {
        organ: isTr ? 'Göz Lensleri' : 'Lens (Bilateral)',
        metric: 'Dmax',
        limit: '< 5-7 Gy',
        source: 'QUANTEC head-and-neck review (2010), PubMed 20171519',
        context: isTr ? 'Kataraktogenesis riski; ALARA prensibiyle mümkün olan en düşük doz.' : 'Cataractogenesis risk; ALARA minimization.',
        contextEn: 'Cataractogenesis risk; ALARA minimization.',
        classification: 'planning-aim',
      },
      {
        organ: isTr ? 'Göz Küreleri (Globes / Eyes)' : 'Eyes (Globes)',
        metric: 'Dmean / Dmax',
        limit: 'Dmean < 35 Gy; Dmax < 45-50 Gy',
        source: 'QUANTEC (2010)',
        context: isTr ? 'Kornea, sklera ve konjonktiva hasarını önleme.' : 'Prevention of scleral/corneal/anterior segment toxicity.',
        contextEn: 'Prevention of scleral/corneal/anterior segment toxicity.',
        classification: 'planning-aim',
      },
      {
        organ: isTr ? 'Retina' : 'Retina',
        metric: 'Dmax',
        limit: '< 45 Gy',
        source: 'QUANTEC head-and-neck review (2010), PubMed 20171519',
        context: isTr ? 'Radyasyon retinopatisi ve neovasküler glokom riski.' : 'Radiation retinopathy and neovascular glaucoma risk.',
        contextEn: 'Radiation retinopathy and neovascular glaucoma risk.',
        classification: 'dose-volume-reference',
      },
      {
        organ: isTr ? 'Lakrimal Bez' : 'Lacrimal Gland',
        metric: 'Dmean',
        limit: '< 30-40 Gy',
        source: 'QUANTEC / Clinical Reference',
        context: isTr ? 'Ciddi kuru göz sendromu (keratokonjonktivitis sikka) önlenmesi.' : 'Prevention of severe dry eye syndrome (keratoconjunctivitis sicca).',
        contextEn: 'Prevention of severe dry eye syndrome (keratoconjunctivitis sicca).',
        classification: 'planning-aim',
      },
      {
        organ: isTr ? 'Koklea' : 'Cochlea',
        metric: isSbrt ? 'Dmax' : 'Dmean',
        limit: isSbrt ? '< 9 Gy (1 fx)' : 'Dmean < 45 Gy (tercihen < 35 Gy)',
        source: 'QUANTEC head-and-neck (2010); AAPM TG-101',
        context: isTr ? 'Sensörinöral işitme kaybı; platin kemoterapisi varsa eşik düşer.' : 'Sensorineural hearing loss; reduced threshold with cisplatin.',
        contextEn: 'Sensorineural hearing loss; reduced threshold with cisplatin.',
        classification: 'dose-volume-reference',
      },
      {
        organ: isTr ? 'Hipofiz (Pituitary)' : 'Pituitary Gland',
        metric: 'Dmax',
        limit: '< 54 Gy',
        source: 'QUANTEC head-and-neck review (2010), PubMed 20171519',
        context: isTr ? 'Hipopitüitarizm ve endokrin eksikliklerin önlenmesi.' : 'Prevention of hypopituitarism and endocrine deficiency.',
        contextEn: 'Prevention of hypopituitarism and endocrine deficiency.',
        classification: 'planning-aim',
      },
      {
        organ: isTr ? 'Hipokampus (HA-WBRT)' : 'Hippocampus (HA-WBRT)',
        metric: 'D100% / Dmax',
        limit: 'D100% ≤ 9 Gy; Dmax ≤ 16 Gy',
        source: 'NRG CC001 / RTOG 0933',
        context: isTr ? 'Hipokampus korumalı tüm beyin RT (HA-WBRT) nörobilişsel koruma.' : 'Neurocognitive protection during hippocampal-avoidance WBRT.',
        contextEn: 'Neurocognitive protection during hippocampal-avoidance WBRT.',
        classification: 'protocol-limit',
      },
      {
        organ: isTr ? 'Normal Beyin Dokusu (Brain - GTV)' : 'Normal Brain Tissue (Brain - GTV)',
        metric: isSbrt ? 'V12Gy' : 'V60Gy',
        limit: isSbrt ? 'V12Gy < 5-10 cc (1 fx) / V20Gy < 20 cc (3 fx)' : 'V60Gy < 100 cc',
        source: 'HyTEC Brain SRS (2021), DOI: 10.1016/j.ijrobp.2020.08.013; QUANTEC',
        context: isTr ? 'Semptomatik radyasyon nekrozu riskini < %10 tutmak için primer kısıt.' : 'Primary constraint to maintain symptomatic radionecrosis rate < 10%.',
        contextEn: 'Primary constraint to maintain symptomatic radionecrosis rate < 10%.',
        classification: 'dose-volume-reference',
      },
      {
        organ: isTr ? 'Saçlı Deri / Skalp' : 'Scalp / Skin',
        metric: 'Dmax',
        limit: '< 50 Gy (Dmean < 20 Gy)',
        source: 'CNS Planning Reference',
        context: isTr ? 'Kalıcı alopesi ve radyasyon dermatiti minimizasyonu.' : 'Minimization of permanent alopecia and severe radiation dermatitis.',
        contextEn: 'Minimization of permanent alopecia and severe radiation dermatitis.',
        classification: 'planning-aim',
      },
    ];
  }

  // 2. HEAD & NECK
  if (organ === 'head-neck') {
    return [
      {
        organ: isTr ? 'Spinal Kord' : 'Spinal Cord',
        metric: 'Dmax',
        limit: '< 45 Gy',
        source: 'QUANTEC spinal cord (2010); conventional fractionation',
        context: isTr ? 'Radyasyon miyelopatisi riski (< %0.2).' : 'Radiation myelopathy risk (< 0.2%).',
        contextEn: 'Radiation myelopathy risk (< 0.2%).',
        classification: 'protocol-limit',
      },
      {
        organ: isTr ? 'Spinal Kord PRV (Planning Organ at Risk Volume)' : 'Spinal Cord PRV',
        metric: 'Dmax',
        limit: '< 48-50 Gy',
        source: 'RTOG / ESTRO Head and Neck Guidelines',
        context: isTr ? 'Spinal korda 1.5-2 mm geometrik güvenlik payı eklenmiş PRV sınırı.' : 'Cord + 1.5-2 mm geometric expansion safety envelope.',
        contextEn: 'Cord + 1.5-2 mm geometric expansion safety envelope.',
        classification: 'protocol-limit',
      },
      {
        organ: isTr ? 'Beyin Sapı' : 'Brainstem',
        metric: 'Dmax',
        limit: '≤ 54 Gy',
        source: 'QUANTEC brainstem (2010), DOI: 10.1016/j.ijrobp.2009.07.1753',
        context: isTr ? 'Konvansiyonel fraksiyonasyon tavan sınırı.' : 'Conventional fractionation ceiling.',
        contextEn: 'Conventional fractionation ceiling.',
        classification: 'dose-volume-reference',
      },
      {
        organ: isTr ? 'Parotis Bezleri' : 'Parotid Glands',
        metric: 'Dmean',
        limit: isTr ? 'En az bir bezde Dmean < 20-26 Gy veya bilateral Dmean < 25 Gy' : 'At least 1 gland Dmean < 20-26 Gy or bilateral Dmean < 25 Gy',
        source: 'QUANTEC parotid (2010), DOI: 10.1016/j.ijrobp.2009.06.090',
        context: isTr ? 'Kalıcı kserostomiyi önleme ve tükürük akışını koruma.' : 'Prevention of long-term xerostomia and saliva flow preservation.',
        contextEn: 'Prevention of long-term xerostomia and saliva flow preservation.',
        classification: 'dose-volume-reference',
      },
      {
        organ: isTr ? 'Submandibular Bezler' : 'Submandibular Glands',
        metric: 'Dmean',
        limit: '< 35 Gy (tutulmayan kontralateral bez)',
        source: 'QUANTEC / Head and Neck IMRT Studies',
        context: isTr ? 'İstirahat tükürük salgısını koruma (uygun cerrahi/hedef durumunda).' : 'Preservation of baseline resting salivation when uninvolved.',
        contextEn: 'Preservation of baseline resting salivation when uninvolved.',
        classification: 'planning-aim',
      },
      {
        organ: isTr ? 'Faringeal Konstriktör Kaslar (PCM: Superior/Medius/Inferior)' : 'Pharyngeal Constrictor Muscles (PCM)',
        metric: 'Dmean',
        limit: '< 50 Gy (Superior/Medius Dmean < 50 Gy)',
        source: 'QUANTEC head-and-neck review (2010), PubMed 20171519',
        context: isTr ? 'Ciddi kronik disfaji, gastrostomi (PEG) bağımlılığı ve aspirasyon pnömonisi önlenmesi.' : 'Prevention of chronic dysphagia, PEG dependence, and aspiration.',
        contextEn: 'Prevention of chronic dysphagia, PEG dependence, and aspiration.',
        classification: 'planning-aim',
      },
      {
        organ: isTr ? 'Larenks (Glottik & Supraglottik)' : 'Larynx (Glottic & Supraglottic)',
        metric: 'Dmean',
        limit: '< 40-45 Gy (Larenks dışı primerlerde)',
        source: 'QUANTEC head-and-neck review (2010)',
        context: isTr ? 'Kalıcı vokal kord ödemi, aspirasyon ve trakeostomi riskini azaltma.' : 'Reduction of chronic laryngeal edema, aspiration, and tracheostomy.',
        contextEn: 'Reduction of chronic laryngeal edema, aspiration, and tracheostomy.',
        classification: 'planning-aim',
      },
      {
        organ: isTr ? 'Servikal Özofagus' : 'Cervical Esophagus',
        metric: 'Dmean / Dmax',
        limit: 'Dmean < 34 Gy; Dmax < 60 Gy',
        source: 'QUANTEC Esophagus (2010)',
        context: isTr ? 'Akut ve geç özofagus striktürü / ülserasyonunun engellenmesi.' : 'Prevention of acute/chronic esophageal stricture and ulceration.',
        contextEn: 'Prevention of acute/chronic esophageal stricture and ulceration.',
        classification: 'planning-aim',
      },
      {
        organ: isTr ? 'Mandibula' : 'Mandible',
        metric: 'Dmax',
        limit: '< 70 Gy (tercihen V60Gy < 30%)',
        source: 'QUANTEC / ESTRO Head and Neck Guidelines',
        context: isTr ? 'Osteoradyonekroz (ORN) riskinin önlenmesi; diş ekstraksiyonları RT öncesi tamamlanmalıdır.' : 'Prevention of osteoradionecrosis (ORN); dental clearance pre-RT.',
        contextEn: 'Prevention of osteoradionecrosis (ORN); dental clearance pre-RT.',
        classification: 'dose-volume-reference',
      },
      {
        organ: isTr ? 'Temporomandibüler Eklem (TMJ)' : 'Temporomandibular Joint (TMJ)',
        metric: 'Dmax',
        limit: '< 60-70 Gy',
        source: 'Head and Neck Planning Guidelines',
        context: isTr ? 'Çiğneme kası fibrozu ve trismus gelişmesini önleme.' : 'Prevention of masseter fibrosis and severe trismus.',
        contextEn: 'Prevention of masseter fibrosis and severe trismus.',
        classification: 'planning-aim',
      },
      {
        organ: isTr ? 'Oral Kavite (GTV Dışı)' : 'Oral Cavity (Excluding GTV)',
        metric: 'Dmean',
        limit: '< 30-35 Gy',
        source: 'QUANTEC (2010)',
        context: isTr ? 'Ciddi mukozit, ağrı ve tat duyusu kaybını (disgeuzi) azaltma.' : 'Reduction of severe mucositis, pain, and dysgeusia.',
        contextEn: 'Reduction of severe mucositis, pain, and dysgeusia.',
        classification: 'planning-aim',
      },
      {
        organ: isTr ? 'Tiroid Bezi' : 'Thyroid Gland',
        metric: 'V30Gy',
        limit: '< 50%',
        source: 'QUANTEC / Clinical Reference',
        context: isTr ? 'Primer hipotiroidi gelişiminin azaltılması; periyodik TSH takibi önerilir.' : 'Reduction of primary hypothyroidism; monitor serial TSH.',
        contextEn: 'Reduction of primary hypothyroidism; monitor serial TSH.',
        classification: 'planning-aim',
      },
      {
        organ: isTr ? 'Brakiyal Pleksus' : 'Brachial Plexus',
        metric: 'Dmax',
        limit: '< 66 Gy',
        source: 'QUANTEC (2010)',
        context: isTr ? 'Brakiyal pleksopati ve motor/duyusal kayıp riski.' : 'Prevention of brachial plexopathy and motor/sensory deficit.',
        contextEn: 'Prevention of brachial plexopathy and motor/sensory deficit.',
        classification: 'dose-volume-reference',
      },
    ];
  }

  // 3. THORAX (LUNG & MEDIASTINUM)
  if (organ === 'thorax') {
    if (isSbrt) {
      return [
        {
          organ: isTr ? 'Spinal Kord' : 'Spinal Cord',
          metric: 'Dmax',
          limit: scheme.fractionCount === 1 ? '< 14 Gy' : scheme.fractionCount === 3 ? '< 18-22 Gy' : '< 25-30 Gy (5 fx)',
          source: 'AAPM TG-101; HyTEC Spine SBRT (2021)',
          context: isTr ? 'SBRT miyelopati güvenliği; kord PRV kısıtı esastır.' : 'SBRT myelopathy safety; cord PRV constraint is mandatory.',
          contextEn: 'SBRT myelopathy safety; cord PRV constraint is mandatory.',
          classification: 'protocol-limit',
        },
        {
          organ: isTr ? 'Proksimal Bronş Ağacı (PBT)' : 'Proximal Bronchial Tree (PBT)',
          metric: 'Dmax',
          limit: scheme.fractionCount <= 3 ? '< 30 Gy (3 fx)' : '< 38-40 Gy (5 fx, RTOG 0813)',
          source: 'RTOG 0813 (Bezjak et al. JCO 2019); HyTEC (2021)',
          context: isTr ? 'Santral hava yolu nekrozu ve ölümcül hemoptiziyi önleme.' : 'Prevention of central airway necrosis and fatal hemoptysis.',
          contextEn: 'Prevention of central airway necrosis and fatal hemoptysis.',
          classification: 'protocol-limit',
        },
        {
          organ: isTr ? 'Bilateral Akciğer (GTV Hariç)' : 'Both Lungs (Minus GTV)',
          metric: 'V20Gy / MLD',
          limit: scheme.fractionCount === 3 ? 'V20Gy < 10-15%' : 'V20Gy < 15-20%; MLD < 8 Gy',
          source: 'RTOG 0236; RTOG 0915; HyTEC',
          context: isTr ? 'SBRT radyasyon pnömonisi riskini < %5 tutmak için.' : 'SBRT radiation pneumonitis risk kept < 5%.',
          contextEn: 'SBRT radiation pneumonitis risk kept < 5%.',
          classification: 'dose-volume-reference',
        },
        {
          organ: isTr ? 'Özofagus' : 'Esophagus',
          metric: 'Dmax',
          limit: scheme.fractionCount === 3 ? '< 27 Gy (3 fx)' : '< 32-35 Gy (5 fx)',
          source: 'AAPM TG-101; HyTEC (2021)',
          context: isTr ? 'Ülserasyon ve bronkoözofageal fistül riskini önleme.' : 'Prevention of esophageal ulceration and tracheoesophageal fistula.',
          contextEn: 'Prevention of esophageal ulceration and tracheoesophageal fistula.',
          classification: 'protocol-limit',
        },
        {
          organ: isTr ? 'Kalp / Perikard' : 'Heart / Pericardium',
          metric: 'Dmax',
          limit: scheme.fractionCount === 3 ? '< 30 Gy (3 fx)' : '< 38-40 Gy (5 fx)',
          source: 'AAPM TG-101; HyTEC (2021)',
          context: isTr ? 'Perikardit ve akut koroner iskemi minimizasyonu.' : 'Minimization of pericarditis and acute coronary ischemia.',
          contextEn: 'Minimization of pericarditis and acute coronary ischemia.',
          classification: 'protocol-limit',
        },
        {
          organ: isTr ? 'LAD Koroner Arter' : 'LAD Coronary Artery',
          metric: 'Dmax / Dmean',
          limit: 'Dmax < 20 Gy; Dmean < 10 Gy',
          source: 'Cardio-Oncology Thoracic SBRT Guidance',
          context: isTr ? 'Akut miyokard enfarktüsü ve radyasyon koroner hasarı koruması.' : 'Protection against radiation-induced coronary artery stenosis.',
          contextEn: 'Protection against radiation-induced coronary artery stenosis.',
          classification: 'planning-aim',
        },
        {
          organ: isTr ? 'Büyük Damarlar / Aorta' : 'Great Vessels / Aorta',
          metric: 'Dmax',
          limit: scheme.fractionCount <= 3 ? '< 45 Gy (3 fx)' : '< 47-50 Gy (5 fx)',
          source: 'AAPM TG-101; HyTEC (2021)',
          context: isTr ? 'Aort ve pulmoner arter rüptürünü önleme.' : 'Prevention of aortic and pulmonary artery rupture.',
          contextEn: 'Prevention of aortic and pulmonary artery rupture.',
          classification: 'protocol-limit',
        },
        {
          organ: isTr ? 'Brakiyal Pleksus' : 'Brachial Plexus',
          metric: 'Dmax',
          limit: scheme.fractionCount === 3 ? '< 24 Gy (3 fx)' : '< 30-32 Gy (5 fx)',
          source: 'AAPM TG-101; RTOG 0618/0813',
          context: isTr ? 'Apikal tümörlerde brakiyal nöropatiyi önleme.' : 'Prevention of apical plexopathy and neuropathic pain.',
          contextEn: 'Prevention of apical plexopathy and neuropathic pain.',
          classification: 'protocol-limit',
        },
        {
          organ: isTr ? 'Göğüs Duvarı / Kaburgalar' : 'Chest Wall / Ribs',
          metric: 'V30Gy',
          limit: '< 30 cc (3-5 fx)',
          source: 'AAPM TG-101; RTOG 0236',
          context: isTr ? 'Kaburga kırığı ve kronik nöropatik göğüs duvarı ağrısı minimizasyonu.' : 'Minimization of rib fracture and chronic chest wall pain.',
          contextEn: 'Minimization of rib fracture and chronic chest wall pain.',
          classification: 'planning-aim',
        },
      ];
    }

    return [
      {
        organ: isTr ? 'Bilateral Akciğer (GTV Hariç)' : 'Both Lungs (Minus GTV)',
        metric: 'V20Gy / MLD',
        limit: 'V20Gy < 30–35%; MLD < 20 Gy (V5Gy < 60%)',
        source: 'QUANTEC lung (2010), DOI: 10.1016/j.ijrobp.2009.06.091; RTOG 0617',
        context: isTr ? 'Semptomatik radyasyon pnömonisi riskini < %15-20 tutmak için kritik.' : 'Critical threshold to maintain symptomatic pneumonitis < 15-20%.',
        contextEn: 'Critical threshold to maintain symptomatic pneumonitis < 15-20%.',
        classification: 'dose-volume-reference',
      },
      {
        organ: isTr ? 'Kalp' : 'Heart',
        metric: 'Dmean / V30',
        limit: 'Dmean < 20 Gy (tercihen < 15 Gy); V30 < 46%',
        source: 'QUANTEC cardiac review (2010), DOI: 10.1016/j.ijrobp.2009.04.093; RTOG 0617',
        context: isTr ? 'Kardiyak mortalite ve genel sağkalımı doğrudan etkiler; ALARA esastır.' : 'Direct predictor of overall survival in RTOG 0617; ALARA.',
        contextEn: 'Direct predictor of overall survival in RTOG 0617; ALARA.',
        classification: 'dose-volume-reference',
      },
      {
        organ: isTr ? 'LAD Koroner Arter' : 'LAD Coronary Artery',
        metric: 'Dmean / Dmax',
        limit: 'Dmean < 10 Gy; Dmax < 20 Gy',
        source: 'Cardio-Oncology Thoracic Guidelines',
        context: isTr ? 'Miyokard enfarktüsü ve koroner stenoz riskini azaltma.' : 'Reduction of late myocardial infarction and coronary stenosis.',
        contextEn: 'Reduction of late myocardial infarction and coronary stenosis.',
        classification: 'planning-aim',
      },
      {
        organ: isTr ? 'Spinal Kord' : 'Spinal Cord',
        metric: 'Dmax',
        limit: '< 45 Gy (PRV < 48-50 Gy)',
        source: 'QUANTEC spinal cord (2010); RTOG 0617',
        context: isTr ? 'Radyasyon miyelopatisini önlemede mutlak sert sınır.' : 'Absolute hard ceiling to prevent radiation myelopathy.',
        contextEn: 'Absolute hard ceiling to prevent radiation myelopathy.',
        classification: 'protocol-limit',
      },
      {
        organ: isTr ? 'Özofagus' : 'Esophagus',
        metric: 'Dmean / V60',
        limit: 'Dmean < 34 Gy; V60 < 17%',
        source: 'QUANTEC esophageal toxicity review (2010)',
        context: isTr ? 'Akut grade ≥3 özofajit ve striktür riskini azaltma.' : 'Reduction of severe acute grade ≥3 esophagitis and stricture.',
        contextEn: 'Reduction of severe acute grade ≥3 esophagitis and stricture.',
        classification: 'dose-volume-reference',
      },
      {
        organ: isTr ? 'Proksimal Bronş Ağacı (PBT)' : 'Proximal Bronchial Tree (PBT)',
        metric: 'Dmax',
        limit: '< 66 Gy',
        source: 'QUANTEC / Thoracic Planning Guidelines',
        context: isTr ? 'Karina ve ana bronşları kapsar; nekroz ve stenozu engeller.' : 'Encompasses carina and mainstem bronchi; prevents necrosis.',
        contextEn: 'Encompasses carina and mainstem bronchi; prevents necrosis.',
        classification: 'dose-volume-reference',
      },
      {
        organ: isTr ? 'Brakiyal Pleksus' : 'Brachial Plexus',
        metric: 'Dmax',
        limit: '< 66 Gy',
        source: 'QUANTEC (2010)',
        context: isTr ? 'Apikal yerleşimli kitlelerde nöropatiyi önleme.' : 'Prevention of plexopathy in apical tumors.',
        contextEn: 'Prevention of plexopathy in apical tumors.',
        classification: 'dose-volume-reference',
      },
      {
        organ: isTr ? 'Büyük Damarlar / Aorta' : 'Great Vessels / Aorta',
        metric: 'Dmax',
        limit: '< 70 Gy',
        source: 'Thoracic RT Guidelines',
        context: isTr ? 'Vasküler erozyon ve kanamayı önleme.' : 'Prevention of major vessel erosion and hemorrhage.',
        contextEn: 'Prevention of major vessel erosion and hemorrhage.',
        classification: 'planning-aim',
      },
    ];
  }

  // 4. GASTRIC & 5. PANCREAS & 7. RECTUM (GIS)
  if (organ === 'gis') {
    if (subsite === 'gis-Mide' || subsite === 'gis-mide') {
      return [
        {
          organ: isTr ? 'Karaciğer' : 'Liver',
          metric: 'Dmean',
          limit: 'Dmean < 30 Gy (tercihen ≥ 700 cc < 15 Gy)',
          source: 'QUANTEC liver (2010), DOI: 10.1016/j.ijrobp.2009.06.092',
          context: isTr ? 'Radyasyon kaynaklı karaciğer hastalığı (RILD) önlenmesi.' : 'Prevention of radiation-induced liver disease (RILD).',
          contextEn: 'Prevention of radiation-induced liver disease (RILD).',
          classification: 'dose-volume-reference',
        },
        {
          organ: isTr ? 'Böbrekler (Bilateral)' : 'Bilateral Kidneys',
          metric: 'Dmean / V20',
          limit: isTr ? 'Bilateral Dmean < 15-18 Gy; en az 1 böbrek Dmean < 12 Gy (V20 < 30%)' : 'Bilateral Dmean < 15-18 Gy; at least 1 kidney Dmean < 12 Gy (V20 < 30%)',
          source: 'QUANTEC renal review (2010); INT-0116 / ARTIST',
          context: isTr ? 'Geç dönem renal yetmezlik ve hipertansiyonu engelleme.' : 'Prevention of late renal failure and radiation nephropathy.',
          contextEn: 'Prevention of late renal failure and radiation nephropathy.',
          classification: 'dose-volume-reference',
        },
        {
          organ: isTr ? 'Spinal Kord' : 'Spinal Cord',
          metric: 'Dmax',
          limit: '< 45 Gy',
          source: 'QUANTEC spinal cord (2010)',
          context: isTr ? 'Radyasyon miyelopatisini önlemede mutlak sınır.' : 'Absolute ceiling for myelopathy prevention.',
          contextEn: 'Absolute ceiling for myelopathy prevention.',
          classification: 'protocol-limit',
        },
        {
          organ: isTr ? 'İnce Bağırsak / Duodenum' : 'Small Bowel / Duodenum',
          metric: 'Dmax / V45',
          limit: 'Dmax < 50 Gy; V45Gy < 100 cc',
          source: 'QUANTEC small bowel (2010), DOI: 10.1016/j.ijrobp.2009.05.074',
          context: isTr ? 'Perforasyon, striktür ve akut/kronik enteriti önleme.' : 'Prevention of perforation, stricture, and chronic enteritis.',
          contextEn: 'Prevention of perforation, stricture, and chronic enteritis.',
          classification: 'dose-volume-reference',
        },
        {
          organ: isTr ? 'Kalp' : 'Heart',
          metric: 'Dmean',
          limit: '< 20-30 Gy (Kardiyak apeks dozunu minimize edin)',
          source: 'QUANTEC (2010); INT-0116',
          context: isTr ? 'Sol üst kadran alanlarında inferior kardiyak duvar dozunu azaltma.' : 'Minimization of inferior wall exposure in left-upper quadrant fields.',
          contextEn: 'Minimization of inferior wall exposure in left-upper quadrant fields.',
          classification: 'planning-aim',
        },
      ];
    }

    if (subsite === 'gis-Pankreas' || subsite === 'gis-pankreas') {
      return [
        {
          organ: isTr ? 'Duodenum' : 'Duodenum',
          metric: isSbrt ? 'Dmax' : 'Dmax',
          limit: isSbrt ? 'Dmax < 33 Gy (5 fx) / D0.5cc < 30 Gy' : 'Dmax < 54 Gy (V50Gy < 10%)',
          source: 'QUANTEC / NCCN Pancreatic Cancer (2025); HyTEC',
          context: isTr ? 'Pankreas RT’sinde primer doz sınırlayıcı kritik organ; ülser ve perforasyon riski.' : 'Primary dose-limiting critical structure; risk of ulceration and perforation.',
          contextEn: 'Primary dose-limiting critical structure; risk of ulceration and perforation.',
          classification: 'protocol-limit',
        },
        {
          organ: isTr ? 'Mide (Stomach)' : 'Stomach',
          metric: 'Dmax',
          limit: isSbrt ? 'Dmax < 33 Gy (5 fx)' : 'Dmax < 50-54 Gy',
          source: 'QUANTEC / NCCN (2025)',
          context: isTr ? 'Gastrik mukozal kanama ve ülserasyonun engellenmesi.' : 'Prevention of gastric mucosal ulceration and bleeding.',
          contextEn: 'Prevention of gastric mucosal ulceration and bleeding.',
          classification: 'dose-volume-reference',
        },
        {
          organ: isTr ? 'İnce Bağırsak / Peritoneal Boşluk' : 'Small Bowel / Bowel Bag',
          metric: 'V45Gy',
          limit: '< 195 cc (tercihen V45 < 100 cc; tek tek anslar V15 < 120 cc)',
          source: 'QUANTEC small bowel (2010), DOI: 10.1016/j.ijrobp.2009.05.074',
          context: isTr ? 'Enterit ve obstrüksiyonu önleme.' : 'Prevention of enteritis and obstruction.',
          contextEn: 'Prevention of enteritis and obstruction.',
          classification: 'dose-volume-reference',
        },
        {
          organ: isTr ? 'Karaciğer' : 'Liver',
          metric: 'Dmean',
          limit: 'Dmean < 30 Gy (≥ 700 cc < 15 Gy)',
          source: 'QUANTEC liver (2010)',
          context: isTr ? 'RILD önleme.' : 'RILD prevention.',
          contextEn: 'RILD prevention.',
          classification: 'dose-volume-reference',
        },
        {
          organ: isTr ? 'Böbrekler (Bilateral)' : 'Bilateral Kidneys',
          metric: 'Dmean / V18',
          limit: 'Bilateral Dmean < 15-18 Gy; en az 1 böbrek Dmean < 12 Gy (V18 < 30%)',
          source: 'QUANTEC (2010)',
          context: isTr ? 'Renal fonksiyonu koruma.' : 'Renal function preservation.',
          contextEn: 'Renal function preservation.',
          classification: 'dose-volume-reference',
        },
        {
          organ: isTr ? 'Spinal Kord' : 'Spinal Cord',
          metric: 'Dmax',
          limit: isSbrt ? '< 25 Gy (5 fx)' : '< 45 Gy',
          source: 'QUANTEC / AAPM TG-101',
          context: isTr ? 'Radyasyon miyelopatisini önleme.' : 'Prevention of radiation myelopathy.',
          contextEn: 'Prevention of radiation myelopathy.',
          classification: 'protocol-limit',
        },
      ];
    }

    if (['gis-Rektum', 'gis-rektum', 'gis-anus', 'gis-Anus'].includes(subsite)) {
      return [
        {
          organ: isTr ? 'Mesane' : 'Bladder',
          metric: 'V50Gy / V40Gy',
          limit: scheme.fractionCount <= 5 ? 'V20Gy < 40%' : 'V50Gy < 50%',
          source: 'QUANTEC / RAPIDO Protocol',
          context: isTr ? 'Sistit ve kontraktür riskini azaltma.' : 'Reduction of cystitis and contracture risk.',
          contextEn: 'Reduction of chronic cystitis and contracture risk.',
          classification: 'dose-volume-reference',
        },
        {
          organ: isTr ? 'İnce Bağırsak / Peritoneal Boşluk (Bowel Bag)' : 'Small Bowel / Bowel Bag',
          metric: 'V45Gy',
          limit: scheme.fractionCount <= 5 ? 'Fraksiyona özgü protokol kriteri' : '< 195 cc (tercihen < 100 cc)',
          source: 'QUANTEC small bowel (2010), DOI: 10.1016/j.ijrobp.2009.05.074',
          context: isTr ? 'Bowel-bag kontur standardı; tekil anslar için V15Gy < 120 cc.' : 'Bowel bag contour reference; individual loops V15Gy < 120 cc.',
          contextEn: 'Bowel bag contour reference; individual loops V15Gy < 120 cc.',
          classification: 'dose-volume-reference',
        },
        {
          organ: isTr ? 'Bilateral Femur Başları' : 'Bilateral Femoral Heads',
          metric: 'Dmax / V40',
          limit: 'Dmax < 50 Gy; V40Gy < 20%',
          source: 'QUANTEC / Pelvic RT Guidelines',
          context: isTr ? 'Femur başı avasküler nekrozu ve kırığını önleme.' : 'Prevention of femoral head avascular necrosis and fracture.',
          contextEn: 'Prevention of femoral head avascular necrosis and fracture.',
          classification: 'dose-volume-reference',
        },
        {
          organ: isTr ? 'Genital Organlar / Vajina / Penil Bulb' : 'Genital Organs / Vagina / Penile Bulb',
          metric: 'Dmean',
          limit: '< 40-50 Gy',
          source: 'ESTRO / Anal Cancer Guidelines',
          context: isTr ? 'Vajinal stenoz, erektil disfonksiyon ve kalıcı cilt/mukozal toksisiteyi önleme.' : 'Prevention of vaginal stenosis, erectile dysfunction, and soft tissue damage.',
          contextEn: 'Prevention of vaginal stenosis, erectile dysfunction, and soft tissue damage.',
          classification: 'planning-aim',
        },
      ];
    }
  }

  // 6. BREAST & CHEST WALL
  if (organ === 'breast') {
    return [
      {
        organ: isTr ? 'Kalp' : 'Heart',
        metric: 'Dmean',
        limit: scheme.fractionCount <= 5 ? 'Dmean < 1.5-2 Gy' : 'Dmean < 2.5-4 Gy (ALARA; hedef < 2 Gy)',
        source: 'Darby et al. (NEJM 2013), DOI: 10.1056/NEJMoa1209825; FAST-Forward / START-B',
        context: isTr ? 'Her 1 Gy ortalama kalp dozu majör koroner olay riskini %7.4 artırır; DIBH sol tarafta zorunludur.' : 'Every 1 Gy mean heart dose increases major coronary events by 7.4%; DIBH indicated for left-sided.',
        contextEn: 'Every 1 Gy mean heart dose increases major coronary events by 7.4%; DIBH indicated for left-sided.',
        classification: 'dose-volume-reference',
      },
      {
        organ: isTr ? 'LAD Koroner Arter' : 'LAD Coronary Artery',
        metric: 'Dmean / Dmax',
        limit: 'Dmean < 10 Gy; Dmax < 20 Gy',
        source: 'ESTRO-ACROP Breast Guidelines (2023)',
        context: isTr ? 'Sol ön inen arter radyasyon aterosklerozu koruması.' : 'Protection against anterior descending artery stenosis.',
        contextEn: 'Protection against anterior descending artery stenosis.',
        classification: 'planning-aim',
      },
      {
        organ: isTr ? 'İpsilateral Akciğer' : 'Ipsilateral Lung',
        metric: 'V20Gy / V5Gy',
        limit: scheme.fractionCount <= 5 ? 'V8Gy < 15%' : 'V20Gy < 30% (tercihen < 20%); V5Gy < 60%',
        source: 'QUANTEC / FAST-Forward (Lancet 2020)',
        context: isTr ? 'Akut ve geç radyasyon pnömonisi minimizasyonu.' : 'Minimization of acute and late radiation pneumonitis.',
        contextEn: 'Minimization of acute and late radiation pneumonitis.',
        classification: 'dose-volume-reference',
      },
      {
        organ: isTr ? 'Kontralateral Meme' : 'Contralateral Breast',
        metric: 'Dmax',
        limit: '< 2-3 Gy',
        source: 'QUANTEC / ESTRO Guidelines',
        context: isTr ? 'Sekonder malignite indüksiyon riskini önleme.' : 'Prevention of secondary radiation-induced breast malignancy.',
        contextEn: 'Prevention of secondary radiation-induced breast malignancy.',
        classification: 'planning-aim',
      },
      {
        organ: isTr ? 'Kontralateral Akciğer' : 'Contralateral Lung',
        metric: 'Dmean',
        limit: '< 2 Gy',
        source: 'Breast RT Planning Guidelines',
        context: isTr ? 'Gereksiz düşük doz banyosunun kısıtlanması.' : 'Restriction of unnecessary low-dose radiation bath.',
        contextEn: 'Restriction of unnecessary low-dose radiation bath.',
        classification: 'planning-aim',
      },
      {
        organ: isTr ? 'Tiroid Bezi (Bölgesel Nodal Işınlamada)' : 'Thyroid Gland (In Regional Nodal RT)',
        metric: 'V30Gy',
        limit: '< 50%',
        source: 'QUANTEC / RNI Studies',
        context: isTr ? 'Supraklavikuler nodal ışınlamada hipotiroidi riskini azaltma.' : 'Reduction of hypothyroidism during supraclavicular nodal irradiation.',
        contextEn: 'Reduction of hypothyroidism during supraclavicular nodal irradiation.',
        classification: 'planning-aim',
      },
      {
        organ: isTr ? 'Brakiyal Pleksus (Supraklavikuler Alanda)' : 'Brachial Plexus (In Supraclavicular Field)',
        metric: 'Dmax',
        limit: '< 60-66 Gy',
        source: 'QUANTEC (2010)',
        context: isTr ? 'Brakiyal pleksopati ve ekstremite fonksiyon kaybını önleme.' : 'Prevention of radiation plexopathy in nodal fields.',
        contextEn: 'Prevention of radiation plexopathy in nodal fields.',
        classification: 'dose-volume-reference',
      },
      {
        organ: isTr ? 'Humerus Başı' : 'Humeral Head',
        metric: 'Dmax',
        limit: '< 50 Gy',
        source: 'Clinical Planning Reference',
        context: isTr ? 'Aksiller seviye I-II ışınlamasında omuz sertliği ve avasküler nekrozu önleme.' : 'Prevention of shoulder joint stiffness and osteonecrosis.',
        contextEn: 'Prevention of shoulder joint stiffness and osteonecrosis.',
        classification: 'planning-aim',
      },
    ];
  }

  // 8. PROSTATE
  if (organ === 'prostate' && subsite === 'prostate-prostate') {
    return [
      {
        organ: isTr ? 'Rektum' : 'Rectum',
        metric: isSbrt ? 'V36Gy / V38Gy' : 'V70Gy / V60Gy / V50Gy',
        limit: isSbrt ? 'V36Gy < 1-2 cc; Dmax < 38-40 Gy' : 'V70Gy < 15-20%; V60Gy < 35%; V50Gy < 50%',
        source: 'QUANTEC rectum (2010), DOI: 10.1016/j.ijrobp.2009.11.003; PACE-B (NEJM 2024)',
        context: isTr ? 'Prostat radyoterapisinde primer doz sınırlayıcı kritik organ; kronik rektal kanama riskini < %5 tutar.' : 'Primary dose-limiting OAR in prostate RT; keeps chronic rectal bleeding < 5%.',
        contextEn: 'Primary dose-limiting OAR in prostate RT; keeps chronic rectal bleeding < 5%.',
        classification: 'dose-volume-reference',
      },
      {
        organ: isTr ? 'Mesane' : 'Bladder',
        metric: isSbrt ? 'V37Gy' : 'V70Gy / V65Gy',
        limit: isSbrt ? 'V37Gy < 5-10 cc' : 'V70Gy < 25-35%; V65Gy < 50%',
        source: 'QUANTEC bladder (2010); PACE-B / RTOG 0415',
        context: isTr ? 'Geç dizüri, hematüri ve kontraktür riskini azaltma.' : 'Reduction of late dysuria, hematuria, and bladder contracture.',
        contextEn: 'Reduction of late dysuria, hematuria, and bladder contracture.',
        classification: 'dose-volume-reference',
      },
      {
        organ: isTr ? 'Sigmoid Kolon' : 'Sigmoid Colon',
        metric: 'Dmax',
        limit: '< 60 Gy',
        source: 'Pelvic RT Guidelines',
        context: isTr ? 'Elektif pelvik nodal veya seminal vezikül ışınlamasında divertikülit/striktür koruması.' : 'Protection against diverticulitis/stricture in pelvic/SV fields.',
        contextEn: 'Protection against diverticulitis/stricture in pelvic/SV fields.',
        classification: 'planning-aim',
      },
      {
        organ: isTr ? 'Bilateral Femur Başları' : 'Bilateral Femoral Heads',
        metric: 'Dmax / V40',
        limit: 'Dmax < 50 Gy; V40Gy < 15-20%',
        source: 'QUANTEC (2010)',
        context: isTr ? 'Avasküler femur başı nekrozunu engelleme.' : 'Prevention of femoral head avascular necrosis.',
        contextEn: 'Prevention of femoral head avascular necrosis.',
        classification: 'dose-volume-reference',
      },
      {
        organ: isTr ? 'Penil Bulb' : 'Penile Bulb',
        metric: 'Dmean',
        limit: '< 40-50 Gy (tercihen D90% < 50 Gy)',
        source: 'QUANTEC penile bulb review (2010)',
        context: isTr ? 'Radyasyon kaynaklı erektil disfonksiyon riskini azaltma.' : 'Preservation of erectile function and reduction of radiation impotence.',
        contextEn: 'Preservation of erectile function and reduction of radiation impotence.',
        classification: 'planning-aim',
      },
      ...(hasPelvicNodalTarget ? [{
        organ: isTr ? 'İnce Bağırsak / Peritoneal Boşluk (Bowel Bag)' : 'Small Bowel / Bowel Bag',
        metric: 'V45Gy',
        limit: '< 195 cc (tercihen < 100 cc)',
        source: 'QUANTEC small bowel (2010), DOI: 10.1016/j.ijrobp.2009.05.074',
        context: isTr ? 'Elektif pelvik lenfatik ışınlamasında bowel bag kısıtı.' : 'Mandatory in whole-pelvis nodal irradiation.',
        contextEn: 'Mandatory in whole-pelvis nodal irradiation.',
        classification: 'dose-volume-reference' as const,
      }] : []),
    ];
  }

  // 9. GYNECOLOGY (CERVIX & ENDOMETRIUM)
  if (organ === 'gynecology') {
    return [
      {
        organ: isTr ? 'Rektum' : 'Rectum',
        metric: 'D2cc EQD2 α/β=3',
        limit: '< 65-75 Gy (EMBRACE II hedef < 65 Gy, limit < 75 Gy)',
        source: 'EMBRACE II protocol; DOI: 10.1016/j.ctro.2018.01.001',
        context: isTr ? 'Kümülatif EBRT + 3D/4D brakiterapi EQD2 dozu; rektal fistül ve kanama önleme.' : 'Cumulative EBRT + 3D/4D brachytherapy EQD2; prevention of fistula/bleeding.',
        contextEn: 'Cumulative EBRT + 3D/4D brachytherapy EQD2; prevention of fistula/bleeding.',
        classification: 'protocol-limit',
      },
      {
        organ: isTr ? 'Mesane' : 'Bladder',
        metric: 'D2cc EQD2 α/β=3',
        limit: '< 80-90 Gy (EMBRACE II hedef < 80 Gy, limit < 90 Gy)',
        source: 'EMBRACE II protocol',
        context: isTr ? 'Kümülatif EBRT + brakiterapi; kronik hematüri ve vezikovajinal fistülü önleme.' : 'Cumulative EBRT + brachytherapy; prevention of chronic hematuria and fistula.',
        contextEn: 'Cumulative EBRT + brachytherapy; prevention of chronic hematuria and fistula.',
        classification: 'protocol-limit',
      },
      {
        organ: isTr ? 'Sigmoid Kolon' : 'Sigmoid Colon',
        metric: 'D2cc EQD2 α/β=3',
        limit: '< 70-75 Gy (EMBRACE II hedef < 70 Gy, limit < 75 Gy)',
        source: 'EMBRACE II protocol',
        context: isTr ? 'Kümülatif EBRT + brakiterapi; sigmoid perforasyon ve striktürünü önleme.' : 'Cumulative EBRT + brachytherapy; prevention of sigmoid perforation and stricture.',
        contextEn: 'Cumulative EBRT + brachytherapy; prevention of sigmoid perforation and stricture.',
        classification: 'protocol-limit',
      },
      {
        organ: isTr ? 'İnce Bağırsak / Bowel Bag (EBRT)' : 'Small Bowel / Bowel Bag (EBRT)',
        metric: 'V45Gy',
        limit: '< 195 cc (tercihen < 100 cc; tekil anslar V15Gy < 120 cc)',
        source: 'QUANTEC small bowel (2010), DOI: 10.1016/j.ijrobp.2009.05.074',
        context: isTr ? 'Pelvik EBRT alanı için bowel bag kısıtı.' : 'Pelvic EBRT bowel bag planning constraint.',
        contextEn: 'Pelvic EBRT bowel bag planning constraint.',
        classification: 'dose-volume-reference',
      },
      {
        organ: isTr ? 'Bilateral Femur Başları' : 'Bilateral Femoral Heads',
        metric: 'Dmax',
        limit: '< 50 Gy',
        source: 'QUANTEC / Pelvic Guidelines',
        context: isTr ? 'Avasküler nekroz ve subkapital kırık riskini önleme.' : 'Prevention of avascular necrosis and subcapital fracture.',
        contextEn: 'Prevention of avascular necrosis and subcapital fracture.',
        classification: 'dose-volume-reference',
      },
      {
        organ: isTr ? 'Spinal Kord (Genişletilmiş Paraaortik Alanda)' : 'Spinal Cord (In Extended Para-aortic Field)',
        metric: 'Dmax',
        limit: '< 45 Gy',
        source: 'QUANTEC spinal cord (2010)',
        context: isTr ? 'Paraaortik lenfatik ışınlaması uygulandığında kord güvenliği.' : 'Cord protection during extended-field para-aortic irradiation.',
        contextEn: 'Cord protection during extended-field para-aortic irradiation.',
        classification: 'protocol-limit',
      },
    ];
  }

  // SARCOMA
  if ((organ === 'sarcoma' || organ === 'bone-sarcoma')
    && scheme.id === 'sarcoma-preop-50'
    && (subsite === 'sarcoma-extremity' || subsite === 'bone-sarcoma-Yumusak_Doku')) {
    return [{
      organ: isTr ? 'Longitudinal deri/deri altı koridor şeridi' : 'Longitudinal skin/subcutaneous strip',
      metric: 'V20Gy',
      limit: '≤ 50% of strip receives 20 Gy',
      source: 'RTOG 0630 (2015), DOI: 10.1200/JCO.2014.58.5828',
      context: isTr ? 'Ekstremite lenfödemini önlemek için en az 2 cm cilt/lenfatik koridoru korunmalıdır.' : 'At least a 2-cm longitudinal strip of skin/lymphatics must be spared to avoid lymphedema.',
      contextEn: 'At least a 2-cm longitudinal strip of skin/lymphatics must be spared to avoid lymphedema.',
      classification: 'protocol-limit',
    }];
  }

  if (organ === 'gis' && subsite === 'gis-Karaciger' && scheme.fractionCount === 5) {
    return [
      {
        organ: isTr ? 'Sağlam karaciğer (toplam karaciğer - GTV)' : 'Uninvolved liver (total liver minus GTV)',
        metric: isTr ? 'Korunmuş hacim eşiği (V15Gy)' : 'Spared-volume threshold (V15Gy)',
        limit: isTr ? 'En az 700 cc, ≤15 Gy doz almalı' : 'At least 700 cc should receive ≤15 Gy',
        source: 'NRG/RTOG 1112 protocol; eviQ hepatic metastases SABR protocol',
        context: isTr
          ? 'Beş fraksiyonlu karaciğer SBRT; başlangıç karaciğer fonksiyonu ve önceki karaciğer tedavilerini değerlendirin.'
          : 'Five-fraction liver SBRT; assess baseline liver function and prior liver-directed treatment.',
        contextEn: 'Five-fraction liver SBRT; assess baseline liver function and prior liver-directed treatment.',
        classification: 'protocol-limit',
      },
      {
        organ: isTr ? 'Mide / duodenum' : 'Stomach / duodenum',
        metric: 'D0.5cc',
        limit: isTr ? '≤30 Gy (5 fraksiyon referansı; seçilen protokolü doğrulayın)' : '≤30 Gy (5-fraction reference; verify selected protocol)',
        source: 'eviQ hepatic metastases stereotactic EBRT protocol',
        context: isTr ? 'İlgili organa ve fraksiyonasyona özgü DVH kısıtlarını kullanın; gerekirse reçete dozunu azaltın.' : 'Use site-specific DVH constraints; reduce prescription if needed.',
        contextEn: 'Use site-specific DVH constraints; reduce prescription if needed.',
        classification: 'dose-volume-reference',
      },
    ];
  }

  if (organ === 'prostate' && subsite === 'prostate-kidney') {
    if (scheme.id === 'rcc-primary-42-3') {
      return [
        {
          organ: isTr ? 'Kontralateral böbrek' : 'Contralateral kidney',
          metric: 'Dmean',
          limit: isTr ? '≤8 Gy (eviQ 3 fraksiyon referansı)' : '≤8 Gy (3-fraction eviQ reference)',
          source: 'eviQ renal cell carcinoma definitive stereotactic EBRT protocol',
          context: isTr ? 'Renal fonksiyonu koruyun; başlangıç eGFR, tek böbrek ve önceki renal tedaviye göre bireyselleştirin.' : 'Preserve renal function; individualise for baseline eGFR.',
          contextEn: 'Preserve renal function; individualise for baseline eGFR, solitary kidney and prior renal treatment.',
          classification: 'dose-volume-reference',
        },
        {
          organ: isTr ? 'Bağırsak / duodenum' : 'Bowel / duodenum',
          metric: 'D0.03cc',
          limit: isTr ? '≤30 Gy (eviQ 3 fraksiyon referansı)' : '≤30 Gy (3-fraction eviQ reference)',
          source: 'eviQ renal cell carcinoma definitive stereotactic EBRT protocol',
          context: isTr ? 'Noktasal maksimum D0.5cc veya Dmax ile eşdeğer değildir; güncel protokolün tam metriğini uygulayın.' : 'Point max is not interchangeable with D0.5cc.',
          contextEn: 'Point maximum is not interchangeable with D0.5cc or Dmax; apply the exact current protocol.',
          classification: 'dose-volume-reference',
        },
        {
          organ: isTr ? 'Spinal kord' : 'Spinal cord',
          metric: isTr ? 'Fraksiyona özgü küçük hacim kısıtı' : 'Fraction-specific small-volume constraint',
          limit: isTr ? 'Dmax < 18-22 Gy (3 fx)' : 'Dmax < 18-22 Gy (3 fx)',
          source: 'eviQ renal cell carcinoma definitive stereotactic EBRT protocol; AAPM TG-101',
          context: isTr ? 'Omurilik PRV güvenliğini doğrulayın.' : 'Verify spinal cord PRV envelope.',
          contextEn: 'Do not substitute a three-fraction limit from another protocol or contour definition.',
          classification: 'protocol-limit',
        },
      ];
    }
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

export const calculatePrognosticIndexBase = (
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

  if (organ === 'benign' || organ === 'emergencies') {
    return null;
  }

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

  if (organ === 'bone-sarcoma' || organ === 'hematologic' || organ === 'pediatric') {
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
  if (organ === 'benign' || organ === 'emergencies') return null;
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

export function parseOption<T extends string>(value: string, options: readonly T[]): T | undefined {
  return options.find(option => option === value);
}

// ==========================================
// 2. TÜM ORGAN VE ALT BAŞLIKLAR İÇİN DİNAMİK TNM / EVRELEME MATRİSİ
// ==========================================

export const TNM_DATABASE: Record<string, { T: TNMOption[]; N: TNMOption[]; M: TNMOption[] }> = {
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

export const generateCasePrompt = (
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


export type EvidenceReference = {
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

export const getLungSbrtTargets = (doseGy: number, breathingMotion: string): TargetVolume[] =>
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

export const AUTHORITY_STYLES: Record<EvidenceLink['authority'], {
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
  Trial: {
    button: 'border-purple-500/50 bg-purple-950/40 text-purple-200 hover:bg-purple-900/60 hover:border-purple-400 hover:text-purple-100 focus-visible:ring-purple-400',
    badge: 'bg-purple-400/20 text-purple-300 border border-purple-400/30',
  },
  QUANTEC: {
    button: 'border-teal-500/50 bg-teal-950/40 text-teal-200 hover:bg-teal-900/60 hover:border-teal-400 hover:text-teal-100 focus-visible:ring-teal-400',
    badge: 'bg-teal-400/20 text-teal-300 border border-teal-400/30',
  },
};

export const formatBadgeLabel = (link: EvidenceLink): string => {
  if (link.customBadge) return link.customBadge;
  if (link.authority === 'RTOG') {
    if (link.title.includes('0236') || link.url.includes('jama.2010.261') || link.url.includes('rtog-0236')) return 'RTOG 0236';
    if (link.title.includes('0617') || link.url.includes('S1470-2045(14)71207-0') || link.url.includes('rtog-0617')) return 'RTOG 0617';
    if (link.title.includes('0813') || link.url.includes('rtog-0813')) return 'RTOG 0813';
    if (link.title.includes('0915') || link.url.includes('rtog-0915')) return 'RTOG 0915';
    if (link.title.includes('9802') || link.url.includes('NEJMoa1512309')) return 'RTOG 9802';
    if (link.title.includes('0521') || link.url.includes('JCO.2015.63.1499')) return 'RTOG 0521';
    if (link.title.includes('9501') || link.url.includes('NEJMoa032641')) return 'RTOG 9501';
    const trialMatch = link.title.match(/RTOG\s*(\d{4})/i) || link.url.match(/rtog-(\d{4})/i);
    if (trialMatch) return `RTOG ${trialMatch[1]}`;
    return 'RTOG';
  }
  if (link.authority === 'NRG') {
    const trialMatch = link.title.match(/NRG[- ]?([A-Z0-9]+)/i);
    if (trialMatch) return `NRG ${trialMatch[1]}`;
    return 'NRG';
  }
  const knownTrials = [
    'FAST-Forward', 'PACIFIC', 'RAPIDO', 'STAMPEDE', 'PORTEC-3', 'PORTEC-2', 'PORTEC',
    'EMBRACE II', 'EMBRACE', 'Turrisi', 'CONVERT', 'CREST', 'CHHiP', 'FLAME', 'PROFIT',
    'CROSS', 'Stupp', 'Patchell', 'FASTRACK II', 'FASTRACK', 'PACE-B', 'HYPO-RT-PC',
    'INT-0116', 'SWOG 9008', 'ARTIST-2', 'ARTIST', 'CRITICS', 'TOPGEAR',
    'AMAROS', 'START', 'GROINSS-V', 'QUANTEC', 'HyTEC', 'Nigro', 'Auperin', 'Slotman'
  ];
  for (const name of knownTrials) {
    if (new RegExp(name, 'i').test(link.title) || new RegExp(name, 'i').test(link.url)) {
      return name;
    }
  }
  return link.authority;
};

export const evidenceLinkTokens = /(FAST[-\s]?Forward|PACIFIC|RAPIDO|STAMPEDE|PORTEC(?:-2|-3)?|EMBRACE(?:\s*II)?|Turrisi|CONVERT|CREST|CHHiP|PROFIT|FLAME|CROSS|Stupp|Patchell|FASTRACK(?:\s*II)?|PACE-B|HYPO-RT-PC|INT-0116|SWOG\s*9008|ARTIST(?:-2)?|CRITICS|TOPGEAR|AMAROS|START|GROINSS-V|Auperin|Slotman|Rimmer|IMPRINT|Nigro|NCCN|ASTRO|ESTRO|RTOG\s*\d*|NRG\s*[A-Z0-9]*|EORTC\s*\d*|QUANTEC|HyTEC|DEGRO|ILROG|ESMO|EANO|FIGO|DOI:\s*10\.\d{4,9}\/[^\s;,]+)/gi;

export const resolveEvidenceUrl = (token: string, clinicalContext = ''): string | undefined => {
  if (/FAST[-\s]?Forward/i.test(token)) return 'https://doi.org/10.1016/S0140-6736(20)30932-6';
  if (/PACIFIC/i.test(token)) return 'https://doi.org/10.1056/NEJMoa1709937';
  if (/RAPIDO/i.test(token)) return 'https://doi.org/10.1016/S1470-2045(20)30555-6';
  if (/STAMPEDE/i.test(token)) return 'https://doi.org/10.1016/S1470-2045(18)30524-1';
  if (/PORTEC-3/i.test(token)) return 'https://doi.org/10.1016/S1470-2045(18)30079-2';
  if (/PORTEC/i.test(token)) return 'https://doi.org/10.1016/S0140-6736(09)61799-2';
  if (/EMBRACE(?:\s*II)?/i.test(token)) return 'https://doi.org/10.1016/S1470-2045(21)00320-2';
  if (/Turrisi/i.test(token)) return 'https://doi.org/10.1056/NEJM199901283400403';
  if (/CONVERT/i.test(token)) return 'https://doi.org/10.1016/S1470-2045(17)30318-2';
  if (/CREST/i.test(token)) return 'https://doi.org/10.1016/S0140-6736(14)61085-0';
  if (/CHHiP/i.test(token)) return 'https://doi.org/10.1016/S1470-2045(16)30102-1';
  if (/PROFIT/i.test(token)) return 'https://doi.org/10.1200/JCO.2016.71.5540';
  if (/FLAME/i.test(token)) return 'https://doi.org/10.1200/JCO.20.02873';
  if (/CROSS/i.test(token)) return 'https://doi.org/10.1056/NEJMoa1102885';
  if (/Stupp/i.test(token)) return 'https://doi.org/10.1056/NEJMoa043330';
  if (/Patchell/i.test(token)) return 'https://doi.org/10.1016/S0140-6736(05)67214-1';
  if (/FASTRACK/i.test(token)) return 'https://doi.org/10.1016/S1470-2045(24)00204-3';
  if (/PACE-B/i.test(token)) return 'https://doi.org/10.1016/S1470-2045(19)30569-8';
  if (/HYPO-RT-PC/i.test(token)) return 'https://doi.org/10.1016/S0140-6736(19)31131-6';
  if (/INT-0116|SWOG\s*9008/i.test(token)) return 'https://doi.org/10.1056/NEJM200109063451001';
  if (/ARTIST(?:-2)?/i.test(token)) return 'https://doi.org/10.1200/JCO.2011.39.1953';
  if (/CRITICS/i.test(token)) return 'https://doi.org/10.1016/S1470-2045(18)30132-3';
  if (/TOPGEAR/i.test(token)) return 'https://doi.org/10.1056/NEJMoa2311451';
  if (/AMAROS/i.test(token)) return 'https://doi.org/10.1016/S1470-2045(14)70449-8';
  if (/START/i.test(token)) return 'https://doi.org/10.1016/S1470-2045(13)70386-3';
  if (/GROINSS-V/i.test(token)) return 'https://doi.org/10.1200/JCO.20.03478';
  if (/Auperin/i.test(token)) return 'https://doi.org/10.1056/NEJM199909303411401';
  if (/Slotman/i.test(token)) return 'https://doi.org/10.1016/S0140-6736(14)61085-0';
  if (/Rimmer|IMPRINT/i.test(token)) return 'https://doi.org/10.1200/JCO.2015.65.6595';
  if (/Nigro/i.test(token)) return 'https://doi.org/10.1007/BF02586832';
  if (/NCCN/i.test(token)) {
    if (/gastric|mide/i.test(clinicalContext)) {
      return 'https://www.nccn.org/guidelines/guidelines-detail?category=1&id=1434';
    }
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
  if (/RTOG\s*9802/i.test(token) || (/RTOG/i.test(token) && /9802/i.test(clinicalContext))) {
    return 'https://doi.org/10.1056/NEJMoa1512309';
  }
  if (/RTOG\s*0521/i.test(token) || (/RTOG/i.test(token) && /0521/i.test(clinicalContext))) {
    return 'https://doi.org/10.1200/JCO.2015.63.1499';
  }
  if (/RTOG\s*9501/i.test(token) || (/RTOG/i.test(token) && /9501/i.test(clinicalContext))) {
    return 'https://doi.org/10.1056/NEJMoa032641';
  }
  if (/RTOG/i.test(token)) return 'https://www.nrgoncology.org/';
  if (/NRG\s*CC001/i.test(token)) return 'https://doi.org/10.1200/JCO.19.02767';
  if (/NRG\s*CC003/i.test(token)) return 'https://clinicaltrials.gov/study/NCT02635009';
  if (/NRG/i.test(token)) return 'https://www.nrgoncology.org/';
  if (/EORTC\s*22922/i.test(token)) return 'https://doi.org/10.1056/NEJMoa1414979';
  if (/EORTC/i.test(token)) return 'https://www.eortc.org/';
  if (/QUANTEC/i.test(token)) return 'https://doi.org/10.1016/j.ijrobp.2009.07.1753';
  if (/HyTEC/i.test(token)) return 'https://doi.org/10.1016/j.ijrobp.2020.11.050';
  if (/DEGRO/i.test(token)) return 'https://www.degro.org/';
  if (/ILROG/i.test(token)) return 'https://www.ilrog.org/';
  if (/ESMO/i.test(token)) return 'https://www.esmo.org/guidelines';
  if (/EANO/i.test(token)) return 'https://www.eano.eu/guidelines/';
  if (/FIGO/i.test(token)) return 'https://www.figo.org/guidelines';

  const doi = token.match(/DOI:\s*(10\.\d{4,9}\/[^\s;,]+)/i);
  return doi ? `https://doi.org/${doi[1].replace(/[.)]+$/, '')}` : undefined;
};

export const getEvidenceReferences = (scheme: DoseScheme, clinicalContext: string): EvidenceReference[] => {
  const evidence = `${clinicalContext}; ${scheme.name}; ${scheme.evidence}`;
  const references: EvidenceReference[] = [];

  for (const token of evidence.match(evidenceLinkTokens) ?? []) {
    const url = resolveEvidenceUrl(token, evidence);
    if (!url || references.some(reference => reference.url === url)) continue;
    references.push({
      label: /FAST[-\s]?Forward/i.test(token)
        ? 'FAST-Forward (Lancet 2020)'
        : /PACIFIC/i.test(token)
          ? 'PACIFIC (NEJM 2017)'
          : /RAPIDO/i.test(token)
            ? 'RAPIDO (Lancet Oncol 2021)'
            : /STAMPEDE/i.test(token)
              ? 'STAMPEDE (Lancet Oncol 2018)'
              : /PORTEC-3/i.test(token)
                ? 'PORTEC-3 (Lancet Oncol 2018)'
                : /EMBRACE/i.test(token)
                  ? 'EMBRACE II (Lancet Oncol 2021)'
                  : /Turrisi/i.test(token)
                    ? 'Turrisi et al. (NEJM 1999)'
                    : /CONVERT/i.test(token)
                      ? 'CONVERT (Lancet Oncol 2017)'
                      : /CREST/i.test(token)
                        ? 'CREST (Lancet 2015)'
                        : /CHHiP/i.test(token)
                          ? 'CHHiP (Lancet Oncol 2016)'
                          : /FLAME/i.test(token)
                            ? 'FLAME (JCO 2021)'
                            : /CROSS/i.test(token)
                              ? 'CROSS (NEJM 2012)'
                              : /Stupp/i.test(token)
                                ? 'Stupp / EORTC 26981 (NEJM 2005)'
                                : /Patchell/i.test(token)
                                  ? 'Patchell (Lancet 2005)'
                                  : /FASTRACK/i.test(token)
                                    ? 'FASTRACK II (Lancet Oncol 2024)'
                                    : /PACE-B/i.test(token)
                                      ? 'PACE-B (Lancet Oncol 2019)'
                                      : /HYPO-RT-PC/i.test(token)
                                        ? 'HYPO-RT-PC (Lancet 2019)'
                                        : /INT-0116|SWOG\s*9008/i.test(token)
                                          ? 'INT-0116 (Macdonald NEJM 2001)'
                                          : /ARTIST/i.test(token)
                                            ? 'ARTIST Trial (Lee JCO 2012 / Park JCO 2021)'
                                            : /CRITICS/i.test(token)
                                              ? 'CRITICS Trial (Cats Lancet Oncol 2018)'
                                              : /TOPGEAR/i.test(token)
                                                ? 'TOPGEAR Trial (Leong NEJM 2024)'
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
                    : /QUANTEC/i.test(token)
                      ? 'QUANTEC Normal Tissue Tolerance (IJROBP 2010)'
                      : /HyTEC/i.test(token)
                        ? 'HyTEC Organ Tolerance in Hypofractionation (IJROBP 2021)'
                        : token,
      url,
    });
  }

  return references;
};

export const resolveSchemeEvidenceLinks = (
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
    } else if (/RTOG/i.test(ref.label) || /0236|0813|0617|0521|0415|0630|9501|9802|0915/i.test(ref.label) || /rtog/i.test(ref.url)) {
      authority = 'RTOG';
      category = 'Trial Protocol';
    } else if (/NRG/i.test(ref.label) || /CC001|CC003/i.test(ref.label) || /nrgoncology/i.test(ref.url)) {
      authority = 'NRG';
      category = 'Trial Protocol';
    } else if (/NCCN/i.test(ref.label) || /nccn\.org/i.test(ref.url)) {
      authority = 'NCCN';
      category = /Kategori\s*1/i.test(scheme.evidence) ? 'Kategori 1' : 'Guideline';
    } else if (/QUANTEC|HyTEC/i.test(ref.label) || /QUANTEC|HyTEC/i.test(ref.url)) {
      authority = 'QUANTEC';
      category = 'Normal Tissue Tolerance';
    } else {
      authority = 'Trial';
      category = 'Phase III / Landmark Trial';
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