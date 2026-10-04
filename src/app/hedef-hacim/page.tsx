'use client';

import React, { useMemo, useState } from 'react';
import Link from 'next/link';
import {
  Target,
  Calculator,
  ExternalLink,
  BookOpen,
  Layers,
  Search,
  ShieldCheck,
  Activity,
  Sliders,
  Sparkles,
  Info,
  CheckCircle2,
  ChevronRight,
  ArrowRight,
} from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';

type OrganCategory = 'all' | 'thorax' | 'breast' | 'head-neck' | 'prostate' | 'gi' | 'cns' | 'gynecology';

interface ContouringAtlasItem {
  id: string;
  category: OrganCategory;
  title_tr: string;
  title_en: string;
  organ_tr: string;
  organ_en: string;
  gtv_tr: string;
  gtv_en: string;
  ctv_tr: string;
  ctv_en: string;
  itv_tr?: string;
  itv_en?: string;
  ptv_tr: string;
  ptv_en: string;
  keyBoundaries_tr: string[];
  keyBoundaries_en: string[];
  clinicalTips_tr: string;
  clinicalTips_en: string;
  consensusSources: string[];
  eContourUrl?: string;
  guidelineUrl?: string;
}

const CONTOURING_DATA: ContouringAtlasItem[] = [
  {
    id: 'lung-nsclc-sbrt',
    category: 'thorax',
    title_tr: 'Erken Evre KHDAK / Akciğer SBRT & Nodal İstasyonlar',
    title_en: 'Early-Stage NSCLC / Lung SBRT & Nodal Stations',
    organ_tr: 'Toraks / Akciğer',
    organ_en: 'Thorax / Lung',
    gtv_tr: 'Akciğer penceresinde (W: 1600, L: -600) parankimal lezyon. Spikülasyonlar ve atelektaziler dikkatle ayırt edilmelidir.',
    gtv_en: 'Parenchymal lesion on lung window (W: 1600, L: -600). Carefully differentiate spiculation vs benign atelectasis.',
    ctv_tr: 'SBRT için CTV = GTV (0 mm ek marjin, histolojik mikroskopik uzanım PTV içinde kapsanır). Konvansiyonel/Adjuvan RT için GTV + 5–8 mm mikroskopik marjin (kemik ve büyük damarlar hariç).',
    ctv_en: 'For SBRT, CTV = GTV (0 mm margin, microscopic extension covered by steep dose gradient). For conventional RT, GTV + 5–8 mm microscopic margin (excluding uninvolved bone/great vessels).',
    itv_tr: '4D-BT MIP (Maximum Intensity Projection) ve 10 solunum fazı üzerinde GTV birleşimi (Internal Target Volume). Serbest solunumda diyafram hareketi değerlendirilir.',
    itv_en: '4D-CT MIP (Maximum Intensity Projection) and composite GTV envelope across all 10 respiratory phases (ITV). Tracks free-breathing diaphragmatic excursion.',
    ptv_tr: 'Günlük CBCT ile ITV + 5 mm (veya van Herk formülü ile 3–5 mm). SBRT merkezi lezyonlarda D95% ≥ reçete dozu.',
    ptv_en: 'ITV + 5 mm with daily CBCT (or 3–5 mm using recipe van Herk margin). SBRT prescription D95% ≥ prescription dose.',
    keyBoundaries_tr: [
      'IASLC İstasyon 1: Supraklavikuler & sternal çentik üstü nodlar',
      'IASLC İstasyon 2R/2L: Üst paratrakeal (brakiosefalik ven - aortik ark üst kenarı)',
      'IASLC İstasyon 4R/4L: Alt paratrakeal (aort arkından karinaya kadar)',
      'IASLC İstasyon 7: Subkarinal (karinadan sağ/sol alt lob bronş bifurkasyonuna)',
      'IASLC İstasyon 10: Hiler lenf nodları (ana bronş çevresi)',
    ],
    keyBoundaries_en: [
      'IASLC Station 1: Supraclavicular & sternal notch upper boundary',
      'IASLC Station 2R/2L: Upper paratracheal (brachiocephalic vein to top of aortic arch)',
      'IASLC Station 4R/4L: Lower paratracheal (aortic arch to carina)',
      'IASLC Station 7: Subcarinal (carina to lower lobe bronchus bifurcation)',
      'IASLC Station 10: Hilar nodal stations (peribronchial distribution)',
    ],
    clinicalTips_tr: 'Santral lezyonlarda (proksimal bronşiyal ağaca ≤2 cm) ultra-hipofraksiyonasyon (örn. 54 Gy/3 fx) kontrendikedir; 60 Gy/8 fx veya 50 Gy/4–5 fx tercih edilmelidir (RTOG 0813).',
    clinicalTips_en: 'For central/ultracentral lesions (≤2 cm from proximal bronchial tree), 3-fraction regimens are contraindicated; use 60 Gy in 8 fractions or 50 Gy in 4–5 fractions (RTOG 0813).',
    consensusSources: ['IASLC 8th Nodal Map', 'RTOG 0813', 'RTOG 0915', 'ESTRO ACROP SBRT'],
    eContourUrl: 'https://econtour.org/cases/1',
    guidelineUrl: 'https://www.nccn.org/guidelines/guidelines-detail?category=1&id=1450',
  },
  {
    id: 'breast-adjuvant-nodal',
    category: 'breast',
    title_tr: 'Meme Kanseri / Tüm Meme, Tümör Yatağı Boost & Bölgesel Nodal Hacimler',
    title_en: 'Breast Cancer / Whole Breast, Tumor Bed Boost & Regional Nodal Basins',
    organ_tr: 'Meme',
    organ_en: 'Breast',
    gtv_tr: 'Adjuvan durumda GTV tanımlanmaz (cerrahi sonrası rezeke). Pre-op kitle varlığında diagnostik MR/BT eşleştirmesi ile konturlanır.',
    gtv_en: 'GTV is not defined in adjuvant post-op setting. For neoadjuvant/intact tumor, contour on co-registered diagnostic MRI/CT.',
    ctv_tr: 'Tüm Meme CTV: Glandüler doku (deri yüzeyinin 5 mm altı, pektoralis majör ön fasyası). Tümör Yatağı CTV: Cerrahi klipsler, seroma kavitesi (CVS skoru 1–5) + 5–10 mm marjin.',
    ctv_en: 'Whole Breast CTV: Palpable/visible glandular breast tissue (clipped 5 mm beneath skin, anterior to pectoralis major fascia). Tumor Bed CTV: Surgical clips, seroma cavity (CVS 1–5) + 5–10 mm margin.',
    ptv_tr: 'CTV + 5–7 mm marjin (cilt yüzeyinden 3–5 mm içeride kırpılır). Kalp ve LAD (sol ön inen arter) marjin dışında tutulmalıdır.',
    ptv_en: 'CTV + 5–7 mm margin (clipped 3–5 mm within the skin surface). Heart and LAD coronary artery must be protected.',
    keyBoundaries_tr: [
      'Aksilla Seviye I: Pektoralis minör kasının lateralinde kalan aksiller ven altı yağ dokusu',
      'Aksilla Seviye II: Pektoralis minör kasının derininde/arkasında kalan doku (Rotter nodları)',
      'Aksilla Seviye III: Pektoralis minör kasının medialinden kostoklavikuler ligamente kadar',
      'Supraklavikuler Fossa (SC): Klavikulanın kranialinde, vena jugularis interna ve omohiyoid kas komşuluğu',
      'İnternal Mammarian (IMC): 1.–3. interkostal aralıklarda mammaria interna arter/ven çevresinde 4–5 mm damar genişletmesi',
    ],
    keyBoundaries_en: [
      'Axilla Level I: Lateral to pectoralis minor muscle, inferior to axillary vein',
      'Axilla Level II: Posterior/deep to pectoralis minor muscle (includes interpectoral Rotter nodes)',
      'Axilla Level III: Medial to pectoralis minor up to costoclavicular ligament / apex',
      'Supraclavicular (SC): Cranial to clavicle, lateral to internal jugular vein, medial to omohyoid',
      'Internal Mammary Chain (IMC): 1st to 3rd intercostal spaces, 4–5 mm circumferential margin around IMA/IMV',
    ],
    clinicalTips_tr: 'Sol meme vakalarında DIBH (Derin İnspirasyon Nefes Tutma) kullanılarak ortalama kalp dozu < 2–3 Gy ve LAD Dmean < 5–7 Gy seviyelerine düşürülmelidir.',
    clinicalTips_en: 'In left-sided breast cancer, implement DIBH (Deep Inspiration Breath Hold) to reduce mean heart dose < 2–3 Gy and LAD mean < 5–7 Gy.',
    consensusSources: ['ESTRO ACROP Breast Consensus (2020)', 'RTOG Breast Contouring Atlas', 'FAST-Forward Protocol'],
    eContourUrl: 'https://econtour.org/cases/10',
    guidelineUrl: 'https://www.nccn.org/guidelines/guidelines-detail?category=1&id=1419',
  },
  {
    id: 'head-neck-lymphatics',
    category: 'head-neck',
    title_tr: 'Baş-Boyun / Servikal Lenfatik Düzeyler & Doz Düzeyleri (70 / 60 / 54 Gy)',
    title_en: 'Head & Neck / Cervical Lymph Node Levels & Dose Hierarchy (70 / 60 / 54 Gy)',
    organ_tr: 'Baş-Boyun',
    organ_en: 'Head & Neck',
    gtv_tr: 'GTV-P: Primer gross tümör (BT/MR ve FDG-PET SUV tutulumu). GTV-N: ≥10 mm kısa akslı veya nekrotik/PET-pozitif tutulu servikal lenf nodları.',
    gtv_en: 'GTV-P: Primary gross tumor volume on contrast CT/MRI and FDG-PET. GTV-N: Involved metastatic lymph nodes (short axis ≥10 mm or central necrosis/FDG-avid).',
    ctv_tr: 'Yüksek Risk (CTV_70): GTV + 5–10 mm anatomik sınırlara uyumlu marjin. Orta Risk (CTV_60): Pozitif nod seviyeleri ve yüksek riskli komşu alanlar. Elektif Düşük Risk (CTV_54): Tutulmamış elektif servikal drenaj seviyeleri.',
    ctv_en: 'High Risk (CTV_70): GTV + 5–10 mm respecting anatomic fascial barriers. Intermediate Risk (CTV_60): Involved nodal basin and peri-primary soft tissue. Low Risk Elective (CTV_54): Bilateral elective nodal stations.',
    ptv_tr: 'Her bir CTV seviyesine + 3–5 mm PTV marjini (günlük IGRT ile 3 mm, standart kafa-boyun maskesi ile 5 mm).',
    ptv_en: 'CTV + 3–5 mm PTV margin (3 mm with daily kV-CBCT and rigid thermoplastic immobilization, 5 mm standard).',
    keyBoundaries_tr: [
      'Düzey Ia (Submental): Digastrik kasların anterior karınları arası ve hiyoid kemiğin kraniali',
      'Düzey Ib (Submandibular): Mandibula altı, glandula submandibularis çevresi',
      'Düzey IIa/b (Üst Juguler): Kafa tabanından hiyoid kemik alt kenarına; spinal aksesuar sinir komşuluğu',
      'Düzey III (Orta Juguler): Hiyoid alt kenarından krikoid kıkırdak alt sınırına kadar karotis kılıfı çevresi',
      'Düzey IVa/b (Alt Juguler): Krikoid alt sınırından klavikula üst sınırına; supraklavikuler bağlantı',
      'Düzey V (Posterior Üçgen): SCM kası posterior kenarı ile trapezius arası',
      'Düzey VII (Retrofaringeal): Kafa tabanından hiyoid kemiğe prevertebral fasya önü (faringeal konstriktör arkası)',
    ],
    keyBoundaries_en: [
      'Level Ia (Submental): Between anterior bellies of digastric muscles down to hyoid bone',
      'Level Ib (Submandibular): Submandibular space between anterior digastric and stylohyoid muscle',
      'Level IIa/b (Upper Jugular): Skull base to inferior border of hyoid bone; divided by spinal accessory nerve',
      'Level III (Mid-Jugular): Inferior hyoid border to inferior border of cricoid cartilage',
      'Level IVa/b (Lower Jugular): Inferior cricoid border down to clavicle / thoracic inlet',
      'Level V (Posterior Triangle): Between posterior border of sternocleidomastoid and anterior border of trapezius',
      'Level VII (Retropharyngeal): Skull base to hyoid, anterior to prevertebral muscles and posterior to pharyngeal wall',
    ],
    clinicalTips_tr: 'Parotis bezlerinin en az birinde ortalama doz < 20 Gy veya her iki bezde Dmean < 25 Gy tutulması kserostomiyi önlemek için birincil koruma kriteridir (QUANTEC).',
    clinicalTips_en: 'Spariing at least one parotid gland to Dmean < 20 Gy (or bilateral Dmean < 25 Gy) is critical to prevent permanent xerostomia (QUANTEC).',
    consensusSources: ['DAHANCA / EORTC / GORTEC / RTOG International Consensus', 'Gregoire et al. Guidelines'],
    eContourUrl: 'https://econtour.org/cases/2',
    guidelineUrl: 'https://www.nccn.org/guidelines/guidelines-detail?category=1&id=1437',
  },
  {
    id: 'prostate-pelvis-consensus',
    category: 'prostate',
    title_tr: 'Prostat & Pelvik Lenf Düğümü Konturlama (RTOG / EAU / NRG)',
    title_en: 'Prostate & Pelvic Nodal Contouring (RTOG / EAU / NRG Consensus)',
    organ_tr: 'Prostat & Pelvis',
    organ_en: 'Prostate & Pelvis',
    gtv_tr: 'Prostat içi dominant intraprostatik lezyon (DIL) multiparametrik MRG (T2, DWI / ADC, DCE) ve PSMA-PET eşleştirmesi ile konturlanır.',
    gtv_en: 'Dominant intraprostatic lesion (DIL) contoured using multiparametric MRI (T2-weighted, DWI / ADC, and dynamic contrast) or PSMA-PET/CT.',
    ctv_tr: 'Düşük Risk: Sadece prostat bezi. Orta/Yüksek Risk: Prostat bezi + Seminal Veziküller (favorable: taban 1 cm; unfavorable/high: tüm seminal veziküller). Pelvik Nodal CTV (Roach > %15): Obturator, internal iliac, external iliac ve presakral nodlar.',
    ctv_en: 'Low Risk: Prostate capsule alone. Intermediate/High Risk: Prostate + Seminal Vesicles (favorable: proximal 1 cm base; unfavorable/high: whole SV). Pelvic Nodal CTV (Roach >15%): Obturator, internal/external iliac, and presacral nodes.',
    ptv_tr: 'Prostat PTV: Posteriora (rektum yönü) 3–5 mm, diğer yönlerde 5–7 mm. Pelvik nodal PTV: Nodal CTV + 5 mm.',
    ptv_en: 'Prostate PTV: 3–5 mm posteriorly toward the rectum, 5–7 mm in all other directions. Pelvic nodal PTV: Nodal CTV + 5 mm.',
    keyBoundaries_tr: [
      'Prostat Apeks: Üretral sfinkter komşuluğu (BT ve T2 MRG sagittal kesitlerde levator ani seviyesi)',
      'Eksternal İliak Nodlar: Eksternal iliak damarlar çevresinde 7 mm marjin (kemik ve psoas hariç)',
      'İnternal İliak / Hipogastrik: İnternal iliak damarlar çevresinde 7 mm marjin',
      'Obturator Düğüm Zinciri: Obturator internus kası mediali, eksternal/internal damarlar arası yağ dokusu',
      'Presakral Zincir: S1–S3 kemik ön yüzü ile rektum posterioru arasındaki presakral alan (10 mm kalınlık)',
    ],
    keyBoundaries_en: [
      'Prostatic Apex: Urethral sphincter junction on coronal/sagittal T2 MRI (above penile bulb)',
      'External Iliac Nodes: 7 mm circumferential margin around external iliac vessels (excluding bone/psoas)',
      'Internal Iliac Nodes: 7 mm margin around internal iliac hypogastric branch vessels',
      'Obturator Chain: Medial to obturator internus muscle, bridging external and internal iliacs',
      'Presacral Space: Anterior to anterior border of sacrum S1–S3 vertebrae (10 mm depth)',
    ],
    clinicalTips_tr: 'Mesane ve rektum dolum protokolü: Hasta tedavilere rahat dolu mesane ve boş rektum ile girmelidir; rektal hidrojel veya endorektal balon rektal ön duvar dozunu %50 azaltabilir.',
    clinicalTips_en: 'Bladder and rectal prep: Full bladder and empty rectum on daily CBCT. Hydrogel rectal spacers can reduce anterior rectal wall V70Gy by >50%.',
    consensusSources: ['RTOG Pelvic Normal Tissue / Nodal Consensus', 'NRG GU-005', 'ESTRO ACROP Prostate Guidelines'],
    eContourUrl: 'https://econtour.org/cases/7',
    guidelineUrl: 'https://www.nccn.org/guidelines/guidelines-detail?category=1&id=1459',
  },
  {
    id: 'gi-rectum-contouring',
    category: 'gi',
    title_tr: 'Rektum Karsinomu / Mezorektum, Presakral Aralık & İliak Nodlar',
    title_en: 'Rectal Carcinoma / Mesorectum, Presacral Space & Pelvic Inflow Basins',
    organ_tr: 'Gastrointestinal / Rektum',
    organ_en: 'Gastrointestinal / Rectum',
    gtv_tr: 'GTV-P: Pelvik T2-MRG ve endorektal görüntüleme eşliğinde primer rektal lümen tümörü. GTV-N: Mezorektal ve internal iliak patolojik nodlar.',
    gtv_en: 'GTV-P: Primary rectal tumor defined on high-resolution T2 sagittal/axial pelvic MRI. GTV-N: Involved mesorectal and internal iliac lymph nodes.',
    ctv_tr: 'CTV_Elektif: Mezorektal kompartman (fascia recti ile sarılı perirektal yağ dokusu), presakral aralık, internal iliak nodlar. Distal tümörlerde (≤5 cm anal verge) iskioanal fossa ve internal sfinkter dahil edilir.',
    ctv_en: 'CTV_Elective: Entire mesorectal compartment (mesorectal fascia envelope), presacral space, internal iliac nodal basin. Distal tumors (≤5 cm from anal verge) include ischioanal fossa.',
    ptv_tr: 'CTV + 5–7 mm marjin (mesane ve rektum şekil değişimleri için sagittal planda geniş güvenlik marjı uygulanır).',
    ptv_en: 'CTV + 5–7 mm margin (sagittal expansion accounts for bowel/bladder filling fluctuations).',
    keyBoundaries_tr: [
      'Mezorektum Kranial Sınır: Rektosigmoid bileşke (promontoryum sakrum hizası)',
      'Mezorektum Kaudal Sınır: Üst/orta rektumda tümörün 3–5 cm distali; alt rektumda levator ani kas tabanı',
      'Presakral Aralık: Sakrum ön korteksi ile mezorektum arka sınırı arasındaki potansiyel lenfatik boşluk',
      'İnternal İliak İstasyon: cT4, lateral yayılım veya pozitif obturator/internal nod varlığında L5-S1 seviyesine kadar',
    ],
    keyBoundaries_en: [
      'Mesorectum Cranial Margin: Rectosigmoid junction (sacral promontory level S1–S2)',
      'Mesorectum Caudal Margin: 3–5 cm distal to gross tumor for upper rectum; pelvic floor for low rectum',
      'Presacral Space: Space between anterior sacral cortex and posterior mesorectal fascia',
      'Internal Iliac Nodes: Mandatory for cT4, distal anterior tumors, or positive lateral pelvic nodes',
    ],
    clinicalTips_tr: 'RAPIDO protokolü (5 Gy x 5 fx Kısa Dönem RT) sonrası konsolidasyon kemoterapisi, rezektabiliteyi ve tam yanıt oranını konvansiyonel KRT kadar yüksek tutarken tedavi süresini 1 haftaya indirir.',
    clinicalTips_en: 'RAPIDO regimen (5 Gy x 5 fx Short-Course RT followed by consolidation chemotherapy) yields equivalent local control with doubled pCR rate compared to standard long-course CRT.',
    consensusSources: ['RTOG Anorectal Atlas', 'ESTRO ACROP Rectal Cancer Guidelines', 'RAPIDO / PRODIGE Trials'],
    eContourUrl: 'https://econtour.org/cases/14',
    guidelineUrl: 'https://www.nccn.org/guidelines/guidelines-detail?category=1&id=1461',
  },
  {
    id: 'cns-srs-glioma',
    category: 'cns',
    title_tr: 'SSS / Beyin Metastazı (SRS) & Glioblastom (GBM / Stupp)',
    title_en: 'CNS / Brain Metastases (SRS) & Glioblastoma (GBM / Stupp Protocol)',
    organ_tr: 'SSS / Beyin',
    organ_en: 'CNS / Brain',
    gtv_tr: 'SRS: Volümetrik 1 mm kesitli T1+Gd MRG üzerindeki kontrast tutan gross lezyon. GBM: Ameliyat sonrası rezidüel T1+Gd tümör + rezeksiyon kavitesi.',
    gtv_en: 'SRS: Contrast-enhancing lesion on 1 mm thin-slice volumetric T1+Gd MRI. GBM: Post-op residual enhancing tumor + resection cavity.',
    ctv_tr: 'SRS: CTV = GTV (0 mm). GBM (EORTC): GTV + 20 mm izotropik marjin (kemik, ventrikül ve faks kırpılarak anatomik bariyerlere indirgenir).',
    ctv_en: 'SRS: CTV = GTV (0 mm). GBM (EORTC): GTV + 20 mm isotropic margin trimmed at anatomical natural barriers (calvarium, falx, ventricles).',
    ptv_tr: 'SRS (Çerçevesiz maske / 6D kafa masası): CTV + 1.0–1.5 mm (çerçeveli SRS: 0 mm). GBM: CTV + 3–5 mm.',
    ptv_en: 'SRS (Frameless mask with 6DoF couch): CTV + 1.0–1.5 mm (frame-based: 0 mm). GBM: CTV + 3–5 mm.',
    keyBoundaries_tr: [
      'Beyin Sapı & Spinal Kord: Kiazma altından foramen magnuma kadar',
      'Optik Kiazma & Optik Sinirler: T2 CISS / FIESTA MR kesitlerinde net sınırlandırılmış kiazmatik aparat',
      'Koklea: İç kulak kemik labirenti içinde 2–3 mm çaplı spiral yapı',
      'Hipokampus: Nörobilişsel koruma (RTOG 0933) için lateral ventrikül temporal boynuzu mediali',
    ],
    keyBoundaries_en: [
      'Brainstem: Delineated from superior pontomesencephalic junction to foramen magnum',
      'Optic Chiasm & Nerves: Defined on coronal/axial thin-slice T2 CISS/FIESTA MRI',
      'Cochlea: High-attenuation petrous temporal bone labyrinth (2–3 mm diameter)',
      'Hippocampus: Medial wall of temporal horns of lateral ventricles (RTOG 0933 neurocognitive sparing)',
    ],
    clinicalTips_tr: 'SRS için tek fraksiyonda optik kiazma ve beyin sapı Dmax sınırı < 8–10 Gy (3 fx için < 15 Gy, 5 fx için < 25 Gy) olmalıdır.',
    clinicalTips_en: 'For single-fraction SRS, keep optic chiasm and brainstem Dmax < 8–10 Gy (for 3 fx < 15 Gy; 5 fx < 25 Gy) to avoid radiation necrosis and optic neuropathy.',
    consensusSources: ['AAPM TG-101 Stereotactic Guidelines', 'EORTC Glioma Consensus', 'RTOG 0933 Hippocampal Avoidance'],
    eContourUrl: 'https://econtour.org/cases/17',
    guidelineUrl: 'https://www.nccn.org/guidelines/guidelines-detail?category=1&id=1425',
  },
  {
    id: 'gynecology-cervix-embrace',
    category: 'gynecology',
    title_tr: 'Serviks Kanseri / Pelvik EBRT & 3D MR Brakiterapi (EMBRACE II)',
    title_en: 'Cervical Cancer / Pelvic EBRT & 3D MRI Brachytherapy (EMBRACE II)',
    organ_tr: 'Jinekoloji / Serviks',
    organ_en: 'Gynecology / Cervix',
    gtv_tr: 'GTV-P: Primer servikal ve parametriyal tümör (T2-MRG ve PET/BT). GTV-N: Pelvik veya paraaortik pozitif lenf nodları.',
    gtv_en: 'GTV-P: Gross primary cervical-uterine tumor on T2-MRI/FDG-PET. GTV-N: Pathologic pelvic and/or para-aortic lymph nodes.',
    ctv_tr: 'EBRT CTV: Serviks + Uterus + Parametriumlar + Vajinanın üst 1/3–1/2 kısmı + Pelvik lenf nodları (obturator, internal/eksternal iliak, presakral). Brakiterapi HR-CTV: Serviks + rezidüel gri alanlar (≥85 Gy EQD2).',
    ctv_en: 'EBRT CTV: Cervix + Corpus uteri + Parametria + Upper 1/3–1/2 vagina + Regional pelvic nodes (obturator, internal/external iliac, presacral). Brachy HR-CTV: Cervix + residual palpable/visible tumor (≥85 Gy EQD2).',
    ptv_tr: 'EBRT Pelvis: CTV + 5–7 mm (mesane dolum varyasyonları için uterus yönünde 10 mm ITV düşünülebilir). Brakiterapide PTV marjı eklenmez.',
    ptv_en: 'EBRT Pelvis: CTV + 5–7 mm (anterior internal margin up to 10–15 mm for uterine fundus tilt). No PTV margin in brachytherapy.',
    keyBoundaries_tr: [
      'Parametrium: Serviks lateralinden pelvik yan duvara (obturator internus fasyası) kadar',
      'Vajinal Sınır: Tümör tutulumunun en az 2 cm distali veya üst 1/2 vagina',
      'Paraaortik İstasyon: Ortak iliak nod tutulumu veya pozitif nod varlığında sol renal ven seviyesine kadar',
      'Rektovajinal Septum & Mesane Arayüzü: T2 aksiyal/sagittal kesitlerde saptanan doğal bariyerler',
    ],
    keyBoundaries_en: [
      'Parametrial Margins: Lateral cervical boundary to pelvic sidewall (obturator fascia)',
      'Vaginal Extension: At least 2 cm below lowest vaginal involvement, or upper 1/2 of vagina',
      'Common Iliac & Para-aortic Basins: Extended field up to renal vessels if common iliacs involved',
      'Rectovaginal & Vesicovaginal Septa: Clear planes on T2 axial/sagittal MRI',
    ],
    clinicalTips_tr: 'EMBRACE II protokolü uyarınca HR-CTV D90% hedefi ≥ 85–90 Gy EQD2 iken, Rektum D2cc ≤ 65 Gy, Mesane D2cc ≤ 80 Gy ve Sigmoid D2cc ≤ 70 Gy tolerans tavan sınırlarıdır.',
    clinicalTips_en: 'Per EMBRACE II protocol, HR-CTV D90% must reach ≥85–90 Gy EQD2, with strict hard ceilings of Rectum D2cc ≤65 Gy, Bladder D2cc ≤80 Gy, and Sigmoid D2cc ≤70 Gy.',
    consensusSources: ['EMBRACE II Protocol', 'ESTRO GYN GEC-ESTRO Consensus', 'RTOG Cervical Contouring Atlas'],
    eContourUrl: 'https://econtour.org/cases/9',
    guidelineUrl: 'https://www.nccn.org/guidelines/guidelines-detail?category=1&id=1422',
  },
];

export default function ContouringAtlasPage() {
  const { language } = useLanguage();
  const [selectedCategory, setSelectedCategory] = useState<OrganCategory>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Van Herk PTV Margin Calculator State
  const [systematicError, setSystematicError] = useState<number>(2.0); // mm
  const [randomError, setRandomError] = useState<number>(1.5); // mm

  const vanHerkMargin = useMemo(() => {
    // Recipe: M = 2.5 * Sigma + 0.7 * sigma
    const s = Number(systematicError) || 0;
    const r = Number(randomError) || 0;
    const result = 2.5 * s + 0.7 * r;
    return Math.max(0, result);
  }, [systematicError, randomError]);

  const applyPreset = (s: number, r: number) => {
    setSystematicError(s);
    setRandomError(r);
  };

  const filteredAtlas = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    return CONTOURING_DATA.filter(item => {
      const matchCategory = selectedCategory === 'all' || item.category === selectedCategory;
      if (!matchCategory) return false;
      if (!q) return true;

      const title = (language === 'en' ? item.title_en : item.title_tr).toLowerCase();
      const organ = (language === 'en' ? item.organ_en : item.organ_tr).toLowerCase();
      const ctv = (language === 'en' ? item.ctv_en : item.ctv_tr).toLowerCase();
      const boundaries = (language === 'en' ? item.keyBoundaries_en : item.keyBoundaries_tr).join(' ').toLowerCase();
      const sources = item.consensusSources.join(' ').toLowerCase();

      return (
        title.includes(q) ||
        organ.includes(q) ||
        ctv.includes(q) ||
        boundaries.includes(q) ||
        sources.includes(q)
      );
    });
  }, [selectedCategory, searchQuery, language]);

  const categories: { id: OrganCategory; label_tr: string; label_en: string }[] = [
    { id: 'all', label_tr: 'Tümü', label_en: 'All Organs' },
    { id: 'thorax', label_tr: 'Toraks / Akciğer', label_en: 'Thorax / Lung' },
    { id: 'breast', label_tr: 'Meme', label_en: 'Breast' },
    { id: 'head-neck', label_tr: 'Baş-Boyun', label_en: 'Head & Neck' },
    { id: 'prostate', label_tr: 'Prostat / Pelvis', label_en: 'Prostate / Pelvis' },
    { id: 'gi', label_tr: 'Gastrointestinal', label_en: 'Gastrointestinal' },
    { id: 'cns', label_tr: 'SSS / Beyin', label_en: 'CNS / Brain' },
    { id: 'gynecology', label_tr: 'Jinekoloji', label_en: 'Gynecology' },
  ];

  return (
    <main className="min-h-screen bg-[#070b14] bg-grid-slate-800/[0.12] text-slate-100 py-8 px-4 sm:px-6 lg:px-12 2xl:px-16">
      <div className="w-full max-w-[1720px] mx-auto space-y-8">

        {/* ── 1. HEADER & MEDICAL CONTEXT ───────────────────────────────── */}
        <header className="relative overflow-hidden rounded-3xl border border-slate-800/80 bg-gradient-to-br from-[#111c2e] via-[#0d1627] to-[#070b14] p-6 sm:p-10 shadow-2xl shadow-cyan-950/20">
          <div className="pointer-events-none absolute -right-10 -top-16 h-72 w-72 rounded-full bg-cyan-500/10 blur-3xl" />
          <div className="pointer-events-none absolute right-48 -bottom-16 h-60 w-60 rounded-full bg-indigo-500/10 blur-3xl" />

          <div className="relative z-10 max-w-4xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-cyan-400/25 bg-cyan-400/10 px-3.5 py-1.5 text-xs font-bold uppercase tracking-wider text-cyan-300 mb-4 shadow-sm">
              <Target className="h-4 w-4" aria-hidden="true" />
              ICRU 50 · 62 · 83 · 91 & ESTRO / RTOG CONSENSUS
            </div>

            <h1 className="text-3xl sm:text-4xl 2xl:text-5xl font-extrabold text-white tracking-tight leading-tight">
              {language === 'en' ? 'Target Volume & Contouring Atlas' : 'Hedef Hacim & Konturlama Atlası'}
            </h1>

            <p className="mt-3 text-sm sm:text-base text-slate-300 leading-relaxed max-w-3xl">
              {language === 'en'
                ? 'Evidence-based target volume delineation standards, anatomical lymphatic basin consensus boundaries, verified eContour reference links, and the Van Herk PTV recipe margin calculator for high-precision radiation oncology.'
                : 'Kanıta dayalı hedef hacim konturlama standartları, anatomik lenfatik düzey uzlaşı sınırları, doğrulanmış eContour referans atlası bağlantıları ve yüksek hassasiyetli radyasyon onkolojisi için Van Herk PTV marjin hesaplayıcısı.'}
            </p>
          </div>
        </header>

        {/* ── 2. ICRU TARGET HIERARCHY REFERENCE BOX ────────────────────── */}
        <section aria-labelledby="icru-hierarchy-title" className="rounded-2xl border border-slate-800 bg-[#0e1726]/80 p-6 backdrop-blur-xl shadow-xl">
          <div className="flex items-center gap-2 mb-4">
            <Layers className="h-5 w-5 text-cyan-400" />
            <h2 id="icru-hierarchy-title" className="text-base sm:text-lg font-bold text-white tracking-wide">
              {language === 'en' ? 'ICRU Target & Normal Tissue Hierarchy (ICRU 50 / 62 / 83 / 91)' : 'ICRU Hedef ve Normal Doku Hiyerarşisi (ICRU 50 / 62 / 83 / 91)'}
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-3.5">
            {/* GTV */}
            <div className="rounded-xl border border-red-500/30 bg-red-950/20 p-4 transition-colors hover:border-red-400/50">
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-black px-2 py-0.5 rounded bg-red-500/20 text-red-300 border border-red-500/40">GTV</span>
                <span className="text-[10px] text-slate-400 font-mono">ICRU 50/62</span>
              </div>
              <h3 className="mt-2 text-sm font-bold text-white">Gross Tumor Volume</h3>
              <p className="mt-1.5 text-xs text-slate-300 leading-relaxed">
                {language === 'en'
                  ? 'Demonstrable gross extent of tumor on imaging (CT/MRI/PET) and clinical exam.'
                  : 'Görüntüleme (BT/MRG/PET) veya fizik muayene ile saptanabilen aşikar tümör dokusu.'}
              </p>
            </div>

            {/* CTV */}
            <div className="rounded-xl border border-amber-500/30 bg-amber-950/20 p-4 transition-colors hover:border-amber-400/50">
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-black px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40">CTV</span>
                <span className="text-[10px] text-slate-400 font-mono">ICRU 50/62</span>
              </div>
              <h3 className="mt-2 text-sm font-bold text-white">Clinical Target Volume</h3>
              <p className="mt-1.5 text-xs text-slate-300 leading-relaxed">
                {language === 'en'
                  ? 'GTV plus subclinical microscopic malignant spread. Trimmed at natural anatomic barriers.'
                  : 'GTV çevresindeki subklinik mikroskopik hastalık yayılımı. Doğal anatomik sınırlarda kırpılır.'}
              </p>
            </div>

            {/* ITV */}
            <div className="rounded-xl border border-blue-500/30 bg-blue-950/20 p-4 transition-colors hover:border-blue-400/50">
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-black px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 border border-blue-500/40">ITV</span>
                <span className="text-[10px] text-slate-400 font-mono">ICRU 62</span>
              </div>
              <h3 className="mt-2 text-sm font-bold text-white">Internal Target Volume</h3>
              <p className="mt-1.5 text-xs text-slate-300 leading-relaxed">
                {language === 'en'
                  ? 'CTV + Internal Margin (IM) accounting for respiration, peristalsis, and physiological motion.'
                  : 'Solunum, peristaltizm ve organ dolum hareketini kapsayan iç hareket payı (IM) eklenmiş CTV.'}
              </p>
            </div>

            {/* PTV */}
            <div className="rounded-xl border border-cyan-500/30 bg-cyan-950/20 p-4 transition-colors hover:border-cyan-400/50">
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-black px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">PTV</span>
                <span className="text-[10px] text-slate-400 font-mono">ICRU 50/62/83</span>
              </div>
              <h3 className="mt-2 text-sm font-bold text-white">Planning Target Volume</h3>
              <p className="mt-1.5 text-xs text-slate-300 leading-relaxed">
                {language === 'en'
                  ? 'CTV/ITV + Setup Margin (SM) ensuring prescription dose coverage with setup uncertainties.'
                  : 'Kurulum ve mekanik belirsizlikler eklenerek reçete dozunun emilimini garanti eden geometrik hacim.'}
              </p>
            </div>

            {/* PRV */}
            <div className="rounded-xl border border-emerald-500/30 bg-emerald-950/20 p-4 transition-colors hover:border-emerald-400/50">
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-black px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">PRV</span>
                <span className="text-[10px] text-slate-400 font-mono">ICRU 62/83</span>
              </div>
              <h3 className="mt-2 text-sm font-bold text-white">Planning Organ at Risk</h3>
              <p className="mt-1.5 text-xs text-slate-300 leading-relaxed">
                {language === 'en'
                  ? 'Organ at Risk + safety margin for internal motion and setup variations to prevent toxic overdose.'
                  : 'Spinal kord gibi kritik organlara hareket ve kurulum payı eklenerek oluşturulan güvenlik tavanı.'}
              </p>
            </div>
          </div>
        </section>

        {/* ── 3. INTERACTIVE VAN HERK PTV MARGIN CALCULATOR ─────────────── */}
        <section aria-labelledby="van-herk-title" className="relative rounded-2xl border border-cyan-500/30 bg-gradient-to-br from-[#0c192d] to-[#070e1c] p-6 sm:p-8 backdrop-blur-xl shadow-2xl shadow-cyan-950/30">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-slate-800">
            <div>
              <div className="flex items-center gap-2 text-cyan-400 text-xs font-bold uppercase tracking-wider mb-1">
                <Calculator className="h-4 w-4" />
                {language === 'en' ? 'RECIPE PTV MARGIN FORMULATION' : 'REÇETE PTV MARJİN HESAPLAMA MOTORU'}
              </div>
              <h2 id="van-herk-title" className="text-xl sm:text-2xl font-extrabold text-white">
                Van Herk PTV Recipe Calculator: <span className="font-mono text-cyan-300">M = 2.5Σ + 0.7σ</span>
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl">
                {language === 'en'
                  ? 'Guarantees 95% minimum dose coverage to 95% of CTV across 90% of the patient population (van Herk et al., IJROBP 2000).'
                  : "Bu formül, hasta popülasyonunun %90'ında CTV'nin %95'ine en az %95 reçete dozunun ulaşmasını garanti eder (van Herk et al., IJROBP 2000)."}
              </p>
            </div>

            {/* Quick presets */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-semibold text-slate-400 mr-1">
                {language === 'en' ? 'Clinical Presets:' : 'Klinik Önayarlar:'}
              </span>
              <button
                type="button"
                onClick={() => applyPreset(0.5, 0.5)}
                className="px-2.5 py-1.5 rounded-lg border border-slate-700 bg-slate-800/60 text-xs font-medium text-slate-200 hover:border-cyan-500 hover:text-white transition"
              >
                Cranial SRS (0.5 / 0.5)
              </button>
              <button
                type="button"
                onClick={() => applyPreset(1.0, 1.0)}
                className="px-2.5 py-1.5 rounded-lg border border-slate-700 bg-slate-800/60 text-xs font-medium text-slate-200 hover:border-cyan-500 hover:text-white transition"
              >
                SBRT + Daily CBCT (1.0 / 1.0)
              </button>
              <button
                type="button"
                onClick={() => applyPreset(2.0, 1.5)}
                className="px-2.5 py-1.5 rounded-lg border border-cyan-500/50 bg-cyan-500/10 text-xs font-semibold text-cyan-200 hover:bg-cyan-500/20 transition"
              >
                Standard IMRT (2.0 / 1.5)
              </button>
              <button
                type="button"
                onClick={() => applyPreset(3.0, 2.5)}
                className="px-2.5 py-1.5 rounded-lg border border-slate-700 bg-slate-800/60 text-xs font-medium text-slate-200 hover:border-cyan-500 hover:text-white transition"
              >
                Non-IGRT Setup (3.0 / 2.5)
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mt-6 items-center">
            {/* Inputs */}
            <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Systematic Error (Sigma) */}
              <div className="p-4 rounded-xl border border-slate-700/80 bg-slate-900/80 shadow-inner">
                <div className="flex justify-between items-center mb-1">
                  <label htmlFor="systematic-input" className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                    <span>{language === 'en' ? 'Systematic Error (Σ)' : 'Sistematik Hata (Σ)'}</span>
                    <span className="text-[10px] text-cyan-400 font-mono font-normal">2.5 × Σ</span>
                  </label>
                  <span className="text-sm font-mono font-bold text-cyan-300">{systematicError.toFixed(1)} mm</span>
                </div>
                <p className="text-[11px] text-slate-400 mb-3">
                  {language === 'en' ? 'Setup shift / organ prep shift constant across all fractions' : 'Tüm fraksiyonlarda sabit kalan kurulum ve hazırlık kayması'}
                </p>
                <input
                  id="systematic-input"
                  type="range"
                  min="0"
                  max="8"
                  step="0.1"
                  value={systematicError}
                  onChange={(e) => setSystematicError(parseFloat(e.target.value) || 0)}
                  className="w-full accent-cyan-400 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-500 font-mono mt-1">
                  <span>0 mm</span>
                  <span>4 mm</span>
                  <span>8 mm</span>
                </div>
              </div>

              {/* Random Error (sigma) */}
              <div className="p-4 rounded-xl border border-slate-700/80 bg-slate-900/80 shadow-inner">
                <div className="flex justify-between items-center mb-1">
                  <label htmlFor="random-input" className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                    <span>{language === 'en' ? 'Random Error (σ)' : 'Rastgele Hata (σ)'}</span>
                    <span className="text-[10px] text-indigo-400 font-mono font-normal">0.7 × σ</span>
                  </label>
                  <span className="text-sm font-mono font-bold text-indigo-300">{randomError.toFixed(1)} mm</span>
                </div>
                <p className="text-[11px] text-slate-400 mb-3">
                  {language === 'en' ? 'Day-to-day day fluctuation error across daily fractions' : 'Günden güne değişen rastgele fraksiyon içi dalgalanma hatası'}
                </p>
                <input
                  id="random-input"
                  type="range"
                  min="0"
                  max="8"
                  step="0.1"
                  value={randomError}
                  onChange={(e) => setRandomError(parseFloat(e.target.value) || 0)}
                  className="w-full accent-indigo-400 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-500 font-mono mt-1">
                  <span>0 mm</span>
                  <span>4 mm</span>
                  <span>8 mm</span>
                </div>
              </div>
            </div>

            {/* Calculated Output Box */}
            <div className="lg:col-span-5 p-5 rounded-xl border border-cyan-500/40 bg-gradient-to-br from-[#0c243b] to-[#0a1727] flex flex-col justify-between shadow-xl">
              <div className="flex items-center justify-between text-xs text-slate-300">
                <span className="font-semibold">{language === 'en' ? 'Calculated Expansion' : 'Hesaplanan PTV Marjı'}</span>
                <span className="font-mono text-cyan-300 text-[11px]">2.5({systematicError}) + 0.7({randomError})</span>
              </div>

              <div className="my-3 flex items-baseline gap-2">
                <span className="text-4xl sm:text-5xl font-black font-mono text-white tracking-tight">
                  {vanHerkMargin.toFixed(1)}
                </span>
                <span className="text-xl font-bold font-mono text-cyan-300">mm</span>
                <span className="text-xs text-slate-400 ml-2 font-mono">({vanHerkMargin.toFixed(2)} mm exact)</span>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-3 border-t border-slate-700/60 text-[11px]">
                <div>
                  <span className="text-slate-400 block">{language === 'en' ? 'Systematic Part:' : 'Sistematik Payı:'}</span>
                  <span className="font-mono font-bold text-cyan-200">{(2.5 * systematicError).toFixed(2)} mm</span>
                </div>
                <div>
                  <span className="text-slate-400 block">{language === 'en' ? 'Random Part:' : 'Rastgele Payı:'}</span>
                  <span className="font-mono font-bold text-indigo-200">{(0.7 * randomError).toFixed(2)} mm</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── 4. ORGAN ATLAS TABS & SEARCH FILTER ───────────────────────── */}
        <section aria-labelledby="atlas-section-title" className="space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h2 id="atlas-section-title" className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                {language === 'en' ? 'Organ-Specific Contouring Consensus Atlas' : 'Organ Spesifik Konturlama Uzlaşı Atlası'}
              </h2>
              <p className="text-xs sm:text-sm text-slate-400">
                {language === 'en'
                  ? `Showing ${filteredAtlas.length} anatomical contouring protocols with consensus delineation limits.`
                  : `${filteredAtlas.length} adet anatomik konturlama protokolü ve uzlaşı sınırları gösteriliyor.`}
              </p>
            </div>

            {/* Search Input */}
            <div className="relative w-full md:w-80">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder={language === 'en' ? 'Search organ, station, margin...' : 'Organ, istasyon veya marjin ara...'}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-xl border border-slate-700 bg-slate-900/90 py-2.5 pl-10 pr-4 text-sm text-white placeholder-slate-500 outline-none transition focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
              />
            </div>
          </div>

          {/* Filter Chips */}
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
            {categories.map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all border ${
                  selectedCategory === cat.id
                    ? 'border-cyan-500/60 bg-cyan-500/15 text-cyan-200 shadow-sm shadow-cyan-950/40'
                    : 'border-slate-800 bg-slate-900/70 text-slate-400 hover:border-slate-700 hover:text-white'
                }`}
              >
                {language === 'en' ? cat.label_en : cat.label_tr}
              </button>
            ))}
          </div>

          {/* ── 5. CARDS GRID ────────────────────────────────────────────── */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 pt-2">
            {filteredAtlas.map((item) => (
              <article
                key={item.id}
                className="rounded-2xl border border-slate-800/90 bg-[#0e1726] p-6 shadow-xl transition-all duration-200 hover:border-slate-700 hover:bg-[#101b2e] flex flex-col justify-between"
              >
                <div>
                  {/* Card Header */}
                  <div className="flex items-start justify-between gap-3 mb-4">
                    <div>
                      <span className="inline-flex rounded-md border border-cyan-500/30 bg-cyan-500/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-cyan-300 mb-1.5">
                        {language === 'en' ? item.organ_en : item.organ_tr}
                      </span>
                      <h3 className="text-lg font-bold text-white tracking-tight">
                        {language === 'en' ? item.title_en : item.title_tr}
                      </h3>
                    </div>

                    {item.eContourUrl && (
                      <a
                        href={item.eContourUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 rounded-lg border border-sky-400/30 bg-sky-500/10 px-3 py-1.5 text-xs font-bold text-sky-300 hover:bg-sky-500/20 transition-colors shrink-0 shadow-sm"
                        title={language === 'en' ? 'Open interactive 3D contouring case on eContour.org' : "eContour.org'da interaktif 3D vakayı aç"}
                      >
                        <span>eContour</span>
                        <ExternalLink className="h-3.5 w-3.5" />
                      </a>
                    )}
                  </div>

                  {/* Target Chains: GTV -> CTV -> ITV -> PTV */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
                    <div className="p-3 rounded-xl border border-red-500/20 bg-red-950/10">
                      <div className="flex items-center gap-1.5 text-red-300 font-mono text-[11px] font-bold mb-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-red-400" />
                        GTV
                      </div>
                      <p className="text-xs text-slate-300 leading-relaxed">
                        {language === 'en' ? item.gtv_en : item.gtv_tr}
                      </p>
                    </div>

                    <div className="p-3 rounded-xl border border-amber-500/20 bg-amber-950/10">
                      <div className="flex items-center gap-1.5 text-amber-300 font-mono text-[11px] font-bold mb-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                        CTV
                      </div>
                      <p className="text-xs text-slate-300 leading-relaxed">
                        {language === 'en' ? item.ctv_en : item.ctv_tr}
                      </p>
                    </div>

                    {item.itv_tr && (
                      <div className="p-3 rounded-xl border border-blue-500/20 bg-blue-950/10">
                        <div className="flex items-center gap-1.5 text-blue-300 font-mono text-[11px] font-bold mb-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-blue-400" />
                          ITV
                        </div>
                        <p className="text-xs text-slate-300 leading-relaxed">
                          {language === 'en' ? item.itv_en : item.itv_tr}
                        </p>
                      </div>
                    )}

                    <div className={`p-3 rounded-xl border border-cyan-500/20 bg-cyan-950/10 ${!item.itv_tr ? 'sm:col-span-2' : ''}`}>
                      <div className="flex items-center gap-1.5 text-cyan-300 font-mono text-[11px] font-bold mb-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                        PTV
                      </div>
                      <p className="text-xs text-slate-300 leading-relaxed">
                        {language === 'en' ? item.ptv_en : item.ptv_tr}
                      </p>
                    </div>
                  </div>

                  {/* Consensus Anatomical Boundaries */}
                  <div className="mb-4">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1.5">
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                      {language === 'en' ? 'Consensus Anatomical Boundaries' : 'Uzlaşı Anatomik Sınırları'}
                    </h4>
                    <ul className="space-y-1.5 text-xs text-slate-300">
                      {(language === 'en' ? item.keyBoundaries_en : item.keyBoundaries_tr).map((boundary, bIdx) => (
                        <li key={bIdx} className="flex items-start gap-2">
                          <span className="text-cyan-400 mt-1 leading-none">•</span>
                          <span>{boundary}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Clinical Tips */}
                  <div className="rounded-xl border border-indigo-500/20 bg-indigo-950/20 p-3 mb-4 text-xs">
                    <span className="font-bold text-indigo-300 block mb-1">
                      {language === 'en' ? '💡 Clinical Practice Tip:' : '💡 Klinik Uygulama Notu:'}
                    </span>
                    <p className="text-slate-300 leading-relaxed">
                      {language === 'en' ? item.clinicalTips_en : item.clinicalTips_tr}
                    </p>
                  </div>
                </div>

                {/* Card Footer: Sources & Guidelines */}
                <div className="pt-4 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3 text-[11px]">
                  <div className="flex flex-wrap items-center gap-1.5">
                    {item.consensusSources.map((source, sIdx) => (
                      <span
                        key={sIdx}
                        className="rounded-md border border-slate-700/80 bg-slate-900/60 px-2 py-0.5 text-slate-400 font-medium"
                      >
                        {source}
                      </span>
                    ))}
                  </div>

                  {item.guidelineUrl && (
                    <a
                      href={item.guidelineUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-slate-400 hover:text-cyan-300 transition-colors font-semibold"
                    >
                      <span>{language === 'en' ? 'Guidelines' : 'Kılavuz'}</span>
                      <ArrowRight className="h-3 w-3" />
                    </a>
                  )}
                </div>
              </article>
            ))}
          </div>

          {filteredAtlas.length === 0 && (
            <div className="text-center py-16 rounded-2xl border border-slate-800 bg-[#0e1726]/40">
              <Search className="h-10 w-10 text-slate-500 mx-auto mb-3" />
              <h3 className="text-base font-bold text-white mb-1">
                {language === 'en' ? 'No contouring protocols match your criteria' : 'Aramanızla eşleşen konturlama protokolü bulunamadı'}
              </h3>
              <p className="text-xs text-slate-400">
                {language === 'en' ? 'Try searching another anatomical term or resetting filters.' : 'Lütfen arama terimini değiştirin veya filtreleri sıfırlayın.'}
              </p>
              <button
                type="button"
                onClick={() => {
                  setSelectedCategory('all');
                  setSearchQuery('');
                }}
                className="mt-4 px-4 py-2 rounded-xl bg-slate-800 text-xs font-semibold text-white hover:bg-slate-700 transition"
              >
                {language === 'en' ? 'Reset Filters' : 'Filtreleri Sıfırla'}
              </button>
            </div>
          )}
        </section>

      </div>
    </main>
  );
}
