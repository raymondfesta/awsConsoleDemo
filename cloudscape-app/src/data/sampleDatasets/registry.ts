// Dataset Registry
// Central registry for all available sample datasets

import type { DatasetType, DatasetDefinition, SampleDataset, SuggestedQuery, QueryResultColumn, BaseSchema } from './types';
import { ECOMMERCE_DATASET, ECOMMERCE_DEFINITION } from './ecommerce';
import { IOT_DATASET, IOT_DEFINITION } from './iotSensors';
import { SAAS_DATASET, SAAS_DEFINITION } from './saasAnalytics';
import { HEALTHCARE_DATASET, HEALTHCARE_DEFINITION } from './healthcare';
import { FINANCIAL_DATASET, FINANCIAL_DEFINITION } from './financial';

// Registry of all datasets
export const DATASET_REGISTRY: Record<DatasetType, SampleDataset> = {
  'ecommerce': ECOMMERCE_DATASET,
  'iot-sensors': IOT_DATASET,
  'saas-analytics': SAAS_DATASET,
  'healthcare': HEALTHCARE_DATASET,
  'financial': FINANCIAL_DATASET,
};

// Array of dataset definitions for UI display
export const DATASET_DEFINITIONS: DatasetDefinition[] = [
  ECOMMERCE_DEFINITION,
  IOT_DEFINITION,
  SAAS_DEFINITION,
  HEALTHCARE_DEFINITION,
  FINANCIAL_DEFINITION,
];

// Helper functions

/**
 * Get a dataset by type
 */
export function getDataset(type: DatasetType): SampleDataset | undefined {
  return DATASET_REGISTRY[type];
}

/**
 * Get dataset schema by type
 */
export function getDatasetSchema(type: DatasetType): BaseSchema | undefined {
  return DATASET_REGISTRY[type]?.schema;
}

/**
 * Get dataset data by type
 */
export function getDatasetData(type: DatasetType): Record<string, unknown[]> | undefined {
  return DATASET_REGISTRY[type]?.data as Record<string, unknown[]>;
}

/**
 * Get suggested queries for a dataset
 */
export function getDatasetQueries(type: DatasetType): SuggestedQuery[] {
  return DATASET_REGISTRY[type]?.suggestedQueries || [];
}

/**
 * Get query result columns for a dataset
 */
export function getQueryResultColumns(type: DatasetType, resultKey: string): QueryResultColumn[] {
  return DATASET_REGISTRY[type]?.queryResultColumns[resultKey] || [];
}

/**
 * Get dataset definition by type
 */
export function getDatasetDefinition(type: DatasetType): DatasetDefinition | undefined {
  return DATASET_DEFINITIONS.find(d => d.id === type);
}

/**
 * Check if a dataset type is valid
 */
export function isValidDatasetType(type: string): type is DatasetType {
  return type in DATASET_REGISTRY;
}

/**
 * Get all available dataset types
 */
export function getAvailableDatasetTypes(): DatasetType[] {
  return Object.keys(DATASET_REGISTRY) as DatasetType[];
}

/**
 * Get query result data for a specific query
 */
export function getQueryResultData(type: DatasetType, resultKey: string): unknown[] {
  const dataset = DATASET_REGISTRY[type];
  if (!dataset) return [];

  const data = dataset.data as Record<string, unknown[]>;
  return data[resultKey] || [];
}

/**
 * Find a query by natural language (fuzzy match)
 */
export function findQueryByNaturalLanguage(type: DatasetType, query: string): SuggestedQuery | undefined {
  const queries = getDatasetQueries(type);
  const normalizedQuery = query.toLowerCase();

  // First try exact match
  const exactMatch = queries.find(q =>
    q.naturalLanguage.toLowerCase() === normalizedQuery
  );
  if (exactMatch) return exactMatch;

  // Then try partial match
  const partialMatch = queries.find(q =>
    normalizedQuery.includes(q.naturalLanguage.toLowerCase()) ||
    q.naturalLanguage.toLowerCase().includes(normalizedQuery) ||
    q.name.toLowerCase().includes(normalizedQuery)
  );
  if (partialMatch) return partialMatch;

  // Try keyword match
  const keywords = normalizedQuery.split(' ').filter(w => w.length > 2);
  return queries.find(q =>
    keywords.some(kw =>
      q.name.toLowerCase().includes(kw) ||
      q.description.toLowerCase().includes(kw)
    )
  );
}
