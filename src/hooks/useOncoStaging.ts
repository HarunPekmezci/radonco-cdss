'use client';

import { useEffect, useMemo, useState } from 'react';
import { ENGINE_REGISTRY, getEnginesByOrgan } from '../engines/registry';
import type { CDSSResult, ClinicalCaseInput, JsonSchema, OrganSystem } from '../types/cdss';

export type StagingOption = {
  value: string;
  label: string;
  description?: string;
};

export type RiskField = {
  key: string;
  label: string;
  description?: string;
  type: 'boolean' | 'select' | 'number' | 'text';
  options?: StagingOption[];
};

export type StagingColumn = {
  label: 'T' | 'N' | 'M';
  key: 't' | 'n' | 'm';
  options: StagingOption[];
  value: unknown;
};

const FALLBACK_TNM: Record<'t' | 'n' | 'm', StagingOption[]> = {
  t: [
    { value: 'T1', label: 'T1' },
    { value: 'T2', label: 'T2' },
    { value: 'T3', label: 'T3' },
    { value: 'T4', label: 'T4' },
    { value: 'Tx', label: 'Tx' },
  ],
  n: [
    { value: 'N0', label: 'N0' },
    { value: 'N1', label: 'N1' },
    { value: 'N2', label: 'N2' },
    { value: 'N3', label: 'N3' },
    { value: 'Nx', label: 'Nx' },
  ],
  m: [
    { value: 'M0', label: 'M0' },
    { value: 'M1', label: 'M1' },
    { value: 'Mx', label: 'Mx' },
  ],
};

function normalizeSchemaProperties(schema?: JsonSchema): Record<string, JsonSchema> {
  return schema && typeof schema === 'object' && schema.properties ? schema.properties : {};
}

function friendlyEnumLabel(value: string): string {
  const map: Record<string, string> = {
    'medically-inoperable-early': 'Medikal İnoperabl (Erken Evre)',
    'operable-early': 'Operabl (Erken Evre)',
    'resectable': 'Rezekabl',
    'borderline': 'Sınırda Rezekabl',
    'unresectable': 'Rezeke Edilemez',
    'non-keratinizing': 'Non-keratinize (Diferansiye/İndiferansiye)',
    'localized': 'Lokalize',
    'postoperative': 'Postoperatif / Adjuvan',
    'locally-advanced': 'Lokal İleri',
    'biochemical-recurrence': 'Biyokimyasal Nüks',
    'metastatic': 'Metastatik',
    'adequate': 'Yeterli Fonksiyon',
    'squamous': 'Yassı Hücreli (Skuamöz)',
    'unknown': 'Bilinmiyor',
    'not-done': 'Yapılmadı',
    'negative': 'Negatif',
    'positive': 'Pozitif',
    'indeterminate': 'Belirsiz',
    'not-applicable': 'Uygulanamaz',
    'not-performed': 'Yapılmadı',
    'M0': 'M0',
    'M1': 'M1',
    'N0': 'N0',
    'N1': 'N1',
    'N2': 'N2',
    'N3': 'N3',
    'T1': 'T1',
    'T2': 'T2',
    'T3': 'T3',
    'T4': 'T4',
    'Tx': 'Tx',
    peripheral: 'Periferik',
    central: 'Santral',
    'ultra-central': 'Ultra-santral',
    'no-actionable-alteration': 'Eyleme geçirilebilir değişiklik yok',
    };

  if (map[value]) return map[value];
  return value
    .replace(/-/g, ' ')
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function coerceOptions(property: JsonSchema | undefined): StagingOption[] {
  if (!property) return [];

  if (Array.isArray(property.enum)) {
    return property.enum.map((value) => ({
      value: String(value),
      label: friendlyEnumLabel(String(value)),
    }));
  }

  if (Array.isArray((property as { anyOf?: JsonSchema[] }).anyOf)) {
    const values = (property as { anyOf?: JsonSchema[] }).anyOf ?? [];
    return values.flatMap((entry) => coerceOptions(entry));
  }

  if (Array.isArray((property as { oneOf?: JsonSchema[] }).oneOf)) {
    const values = (property as { oneOf?: JsonSchema[] }).oneOf ?? [];
    return values.flatMap((entry) => coerceOptions(entry));
  }

  return [];
}

function groupKeyMatches(key: string, group: 't' | 'n' | 'm'): boolean {
  const normalized = key.toLowerCase().replace(/[^a-z]/g, '');

  if (!normalized) return false;
  if (normalized === group) return true;

  const patterns: Record<'t' | 'n' | 'm', string[]> = {
    t: ['tumor', 'tumour', 'tcategory', 'clinicalt', 'pathologict', 'tstage'],
    n: ['node', 'lymphnode', 'ncategory', 'clinicaln', 'pathologicn', 'nstage'],
    m: ['metastasis', 'metastatic', 'mcategory', 'clinicalm', 'pathologicm', 'mstage'],
  };

  return patterns[group].some((pattern) => normalized.includes(pattern));
}

function parseStagingOptions(schema: JsonSchema | undefined): Record<'t' | 'n' | 'm', StagingOption[]> {
  const properties = normalizeSchemaProperties(schema);
  const matchGroup = (group: 't' | 'n' | 'm') => {
    const matchedKey = Object.keys(properties).find((key) => groupKeyMatches(key, group));
    if (!matchedKey) return FALLBACK_TNM[group];

    const options = coerceOptions(properties[matchedKey]);
    return options.length > 0 ? options : FALLBACK_TNM[group];
  };

  return {
    t: matchGroup('t'),
    n: matchGroup('n'),
    m: matchGroup('m'),
  };
}

function parseRiskFields(schema: JsonSchema | undefined): RiskField[] {
  const properties = normalizeSchemaProperties(schema);
  const excluded = new Set([
    'organSystem',
    'disease',
    'diagnosis',
    'stage',
    'staging',
    'stageGroup',
    'clinicalT',
    'clinicalN',
    'clinicalM',
    'pathologicT',
    'pathologicN',
    'pathologicM',
    't',
    'n',
    'm',
    'tCategory',
    'nCategory',
    'mCategory',
    'setting',
    'riskGroup',
  ]);

  return Object.entries(properties)
    .filter(([key]) => !excluded.has(key) && !groupKeyMatches(key, 't') && !groupKeyMatches(key, 'n') && !groupKeyMatches(key, 'm'))
    .map(([key, property]) => {
      const labelMap: Record<string, string> = {
        centrality: 'Yerleşim',
        mediastinalStaging: 'Mediastinal Evreleme',
        resectability: 'Rezektabilite',
        surgicalMargin: 'Cerrahi Marjin',
        nodalDisease: 'Nodal Hastalık',
        bulkyNodalDisease: 'Bulky Nodal Hastalık',
        actionableAlteration: 'Eyleme Geçirilebilir Genetik Değişiklik',
        performanceStatusECOG: 'Performans Durumu (ECOG)',
        interstitialLungDisease: 'İnterstisyel Akciğer Hastalığı',
        priorThoracicRT: 'Önceki Toraks RT',
      };
      const label = labelMap[key] ?? key
        .replace(/([a-z])([A-Z])/g, '$1 $2')
        .replace(/_/g, ' ')
        .replace(/\b\w/g, (char) => char.toUpperCase());

      const options = coerceOptions(property);
      const clinicalOptions = key === 'actionableAlteration'
        ? [
            { value: 'no-actionable-alteration', label: 'Hedefe yönelik mutasyon yok / saptanmadı' },
            { value: 'EGFR', label: 'EGFR' },
            { value: 'ALK', label: 'ALK' },
            { value: 'KRAS_G12C', label: 'KRAS G12C' },
            { value: 'unknown', label: 'Bilinmiyor' },
          ]
        : options;
      const normalizedType: RiskField['type'] = property.type === 'boolean'
        ? 'boolean'
        : property.type === 'number'
          ? 'number'
          : clinicalOptions.length > 0 || property.type === 'string'
            ? 'select'
            : 'text';

      if (normalizedType === 'boolean') {
        return {
          key,
          label,
          description: property.description,
          type: 'boolean' as const,
        };
      }

      if (normalizedType === 'select') {
        return {
          key,
          label,
          description: property.description,
          type: 'select' as const,
          options: clinicalOptions,
        };
      }

      if (normalizedType === 'number') {
        return {
          key,
          label,
          description: property.description,
          type: 'number' as const,
        };
      }

      return {
        key,
        label,
        description: property.description,
        type: 'text' as const,
      };
    })
    .filter((field) => field.label.length > 0)
    .slice(0, 10);
}

function coerceValue(propertyKey: string, value: unknown): unknown {
  if (typeof value === 'string' && value.trim() === '') return undefined;
  const lowered = propertyKey.toLowerCase();

  if (lowered.includes('score') || lowered.includes('age') || lowered.includes('size') || lowered.includes('count') || lowered.includes('volume')) {
    const numeric = Number(value);
    return Number.isFinite(numeric) ? numeric : value;
  }

  return value;
}

export function useOncoStaging(initialOrgan: OrganSystem = 'thorax') {
  const [selectedOrgan, setSelectedOrgan] = useState<OrganSystem>(initialOrgan);
  const [selectedEngineId, setSelectedEngineId] = useState<string>(
    initialOrgan === 'thorax' ? 'thorax-nsclc' : '',
  );
  const [input, setInput] = useState<Record<string, unknown>>({
    organSystem: 'thorax',
    disease: 'non-small-cell-lung-cancer',
    diagnosis: 'Evre IA KHDAK',
    setting: 'medically-inoperable-early',
    stage: { edition: 'AJCC_8', t: 'T1a', n: 'N0', m: 'M0', stageGroup: 'IA' },
    clinicalT: 'T1a',
    clinicalN: 'N0',
    clinicalM: 'M0',
    tumorSizeCm: 1,
    centrality: 'peripheral',
    mediastinalStaging: 'negative',
    resectability: 'resectable',
    actionableAlteration: 'no-actionable-alteration',
    performanceStatusECOG: 0,
  });
  const [result, setResult] = useState<CDSSResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const availableEngines = useMemo(() => getEnginesByOrgan(selectedOrgan), [selectedOrgan]);

  const engine = useMemo(() => {
    if (!availableEngines.length) return undefined;
    const exact = availableEngines.find((item) => item.id === selectedEngineId);
    if (exact) return exact;

    const normalizedId = selectedEngineId?.trim();
    return availableEngines.find((item) => item.id === normalizedId || item.id.replace(/\./g, '-') === normalizedId?.replace(/\./g, '-')) ?? availableEngines[0];
  }, [availableEngines, selectedEngineId]);

  useEffect(() => {
    if (!availableEngines.length) return;
    if (!selectedEngineId || !availableEngines.some((item) => item.id === selectedEngineId || item.id.replace(/\./g, '-') === selectedEngineId.replace(/\./g, '-'))) {
      setSelectedEngineId(availableEngines[0].id);
    }
  }, [availableEngines, selectedEngineId]);

  useEffect(() => {
    if (!engine) {
      setInput((current) => ({
        ...current,
        organSystem: selectedOrgan,
      }));
      return;
    }

    const defaults = {
      ...(engine.defaults ?? {}),
      organSystem: engine.defaults?.organSystem ?? selectedOrgan,
      disease: engine.defaults?.disease ?? '',
      diagnosis: engine.defaults?.diagnosis ?? '',
    } as Record<string, unknown>;

    setInput((current) => ({
      ...defaults,
      ...current,
      organSystem: defaults.organSystem,
      disease: defaults.disease,
      diagnosis: current.diagnosis ?? defaults.diagnosis ?? '',
    }));
  }, [engine, selectedOrgan]);

  const stagingOptions = useMemo(() => parseStagingOptions(engine?.inputSchema), [engine]);
  const riskFields = useMemo(() => parseRiskFields(engine?.inputSchema), [engine]);

  const updateField = (key: string, value: unknown) => {
    setInput((current) => ({
      ...current,
      [key]: coerceValue(key, value),
    }));
  };

  const applyTnmSelection = (group: 't' | 'n' | 'm', value: string) => {
    setInput((current) => {
      const next = { ...current };
      const schemaProperties = normalizeSchemaProperties(engine?.inputSchema);

      const directKeys = Object.keys(schemaProperties).filter((key) => groupKeyMatches(key, group));
      directKeys.forEach((key) => {
        next[key] = value;
      });

      if (!directKeys.length) {
        next[group] = value;
      }

      if (schemaProperties.staging && typeof schemaProperties.staging === 'object') {
        next.staging = {
          ...(typeof current.staging === 'object' && current.staging ? current.staging : {}),
          [group]: value,
        };
      }

      if (schemaProperties.stage && typeof schemaProperties.stage === 'object') {
        next.stage = {
          ...(typeof current.stage === 'object' && current.stage ? current.stage : {}),
          [group]: value,
        };
      }

      return next;
    });
  };

  const tnmColumns = useMemo<StagingColumn[]>(() => {
    const groupLabels: Array<{ label: 'T' | 'N' | 'M'; key: 't' | 'n' | 'm' }> = [
      { label: 'T', key: 't' },
      { label: 'N', key: 'n' },
      { label: 'M', key: 'm' },
    ];

    return groupLabels.map(({ label, key }) => ({
      label,
      key,
      options: stagingOptions[key],
      value:
        input[key] ??
        input[`${key}Category`] ??
        input[`${label.toLowerCase()}Category`] ??
        ((input.staging as Record<string, unknown> | undefined)?.[key] ??
          (input.stage as Record<string, unknown> | undefined)?.[key]),
    }));
  }, [input, stagingOptions]);

  useEffect(() => {
    if (!engine) {
      setResult(null);
      setError(null);
      return;
    }

    try {
      const preparedInput: ClinicalCaseInput = {
        ...(input as Record<string, unknown>),
        organSystem: (input.organSystem ?? engine.defaults?.organSystem ?? selectedOrgan) as OrganSystem,
        disease: String(input.disease ?? engine.defaults?.disease ?? ''),
      };

      const evaluated = engine.evaluate(preparedInput);
      setResult(evaluated);
      setError(null);
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : 'Motor değerlendirmesi sırasında hata oluştu.');
      setResult(null);
    }
  }, [engine, input, selectedOrgan]);

  return {
    selectedOrgan,
    setSelectedOrgan,
    engine,
    availableEngines,
    selectedEngineId,
    setSelectedEngineId,
    input,
    updateField,
    applyTnmSelection,
    tnmColumns,
    riskFields,
    result,
    error,
  };
}
