export const NCCN_GUIDELINE_MAP: Record<string, { url: string; title: string; hint: string }> = {
  'thorax-nsclc': {
    url: 'https://www.nccn.org/professionals/physician_gls/pdf/nscl.pdf#page=77',
    title: 'NCCN Non-Small Cell Lung Cancer',
    hint: 'NSCL-C: Principles of Radiation Therapy (p. 77)',
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
