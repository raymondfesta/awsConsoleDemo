// SaaS Analytics Dataset - B2B SaaS Platform
// Complete export for the dataset registry

import type { SampleDataset, DatasetDefinition, DatasetMetrics } from '../types';
import { SAAS_SCHEMA, type SaaSSchema } from './schema';
import { SAAS_DATA, DATASET_STATS } from './data';
import { SAAS_QUERIES, SAAS_QUERY_COLUMNS } from './queries';

// Dataset definition for UI display
export const SAAS_DEFINITION: DatasetDefinition = {
  id: 'saas-analytics',
  name: 'SaaS Analytics',
  description: 'B2B SaaS platform with accounts, users, feature usage, and subscription metrics',
  icon: 'multiscreen',
  color: '#037f0c',
  industries: ['Technology', 'Software', 'B2B Services'],
  useCases: ['Revenue analytics', 'User engagement', 'Churn prediction', 'Feature adoption'],
};

// Dataset metrics for summary display
export const SAAS_METRICS: DatasetMetrics = {
  totalRecords: SAAS_SCHEMA.totalRecords,
  tableCount: SAAS_SCHEMA.tables.length,
  dateRange: DATASET_STATS.dateRange,
  highlights: [
    {
      id: 'accounts',
      label: 'Accounts',
      value: DATASET_STATS.totalAccounts,
      format: 'number',
    },
    {
      id: 'users',
      label: 'Users',
      value: DATASET_STATS.totalUsers,
      format: 'number',
    },
    {
      id: 'mrr',
      label: 'MRR',
      value: DATASET_STATS.totalMRR,
      format: 'currency',
    },
    {
      id: 'churn',
      label: 'Churn Rate',
      value: `${DATASET_STATS.churnRate}%`,
      format: 'text',
    },
  ],
};

// Complete dataset export
export const SAAS_DATASET: SampleDataset<SaaSSchema, typeof SAAS_DATA> = {
  definition: SAAS_DEFINITION,
  schema: SAAS_SCHEMA,
  data: SAAS_DATA,
  suggestedQueries: SAAS_QUERIES,
  metrics: SAAS_METRICS,
  queryResultColumns: SAAS_QUERY_COLUMNS,
};

// Re-export everything
export * from './schema';
export * from './data';
export * from './queries';
