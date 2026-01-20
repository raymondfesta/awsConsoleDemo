// Financial Dataset - Banking & Transactions
// Complete export for the dataset registry

import type { SampleDataset, DatasetDefinition, DatasetMetrics } from '../types';
import { FINANCIAL_SCHEMA, type FinancialSchema } from './schema';
import { FINANCIAL_DATA, DATASET_STATS } from './data';
import { FINANCIAL_QUERIES, FINANCIAL_QUERY_COLUMNS } from './queries';

// Dataset definition for UI display
export const FINANCIAL_DEFINITION: DatasetDefinition = {
  id: 'financial',
  name: 'Financial Transactions',
  description: 'Banking data with accounts, transactions, merchant analytics, and fraud detection',
  icon: 'key',
  color: '#7d2105',
  industries: ['Banking', 'Finance', 'Fintech'],
  useCases: ['Transaction analytics', 'Spending tracking', 'Fraud detection', 'Account management'],
};

// Dataset metrics for summary display
export const FINANCIAL_METRICS: DatasetMetrics = {
  totalRecords: FINANCIAL_SCHEMA.totalRecords,
  tableCount: FINANCIAL_SCHEMA.tables.length,
  dateRange: DATASET_STATS.dateRange,
  highlights: [
    {
      id: 'accounts',
      label: 'Accounts',
      value: DATASET_STATS.totalAccounts,
      format: 'number',
    },
    {
      id: 'transactions',
      label: 'Transactions',
      value: DATASET_STATS.totalTransactions,
      format: 'number',
    },
    {
      id: 'balance',
      label: 'Total Balance',
      value: DATASET_STATS.totalBalance,
      format: 'currency',
    },
    {
      id: 'fraud_rate',
      label: 'Fraud Rate',
      value: `${DATASET_STATS.fraudRate}%`,
      format: 'text',
    },
  ],
};

// Complete dataset export
export const FINANCIAL_DATASET: SampleDataset<FinancialSchema, typeof FINANCIAL_DATA> = {
  definition: FINANCIAL_DEFINITION,
  schema: FINANCIAL_SCHEMA,
  data: FINANCIAL_DATA,
  suggestedQueries: FINANCIAL_QUERIES,
  metrics: FINANCIAL_METRICS,
  queryResultColumns: FINANCIAL_QUERY_COLUMNS,
};

// Re-export everything
export * from './schema';
export * from './data';
export * from './queries';
