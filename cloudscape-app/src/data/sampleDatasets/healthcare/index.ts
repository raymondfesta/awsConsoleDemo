// Healthcare Dataset - Medical Practice Management
// Complete export for the dataset registry

import type { SampleDataset, DatasetDefinition, DatasetMetrics } from '../types';
import { HEALTHCARE_SCHEMA, type HealthcareSchema } from './schema';
import { HEALTHCARE_DATA, DATASET_STATS } from './data';
import { HEALTHCARE_QUERIES, HEALTHCARE_QUERY_COLUMNS } from './queries';

// Dataset definition for UI display
export const HEALTHCARE_DEFINITION: DatasetDefinition = {
  id: 'healthcare',
  name: 'Healthcare Records',
  description: 'Medical practice with patients, providers, appointments, and clinical procedures',
  icon: 'user-profile',
  color: '#d13212',
  industries: ['Healthcare', 'Medical', 'Clinical Services'],
  useCases: ['Patient management', 'Appointment scheduling', 'Clinical analytics', 'Revenue tracking'],
};

// Dataset metrics for summary display
export const HEALTHCARE_METRICS: DatasetMetrics = {
  totalRecords: HEALTHCARE_SCHEMA.totalRecords,
  tableCount: HEALTHCARE_SCHEMA.tables.length,
  dateRange: DATASET_STATS.dateRange,
  highlights: [
    {
      id: 'patients',
      label: 'Patients',
      value: DATASET_STATS.totalPatients,
      format: 'number',
    },
    {
      id: 'providers',
      label: 'Providers',
      value: DATASET_STATS.totalProviders,
      format: 'number',
    },
    {
      id: 'appointments',
      label: 'Appointments',
      value: DATASET_STATS.totalAppointments,
      format: 'number',
    },
    {
      id: 'wait_time',
      label: 'Avg Wait Time',
      value: `${DATASET_STATS.avgWaitTime} min`,
      format: 'text',
    },
  ],
};

// Complete dataset export
export const HEALTHCARE_DATASET: SampleDataset<HealthcareSchema, typeof HEALTHCARE_DATA> = {
  definition: HEALTHCARE_DEFINITION,
  schema: HEALTHCARE_SCHEMA,
  data: HEALTHCARE_DATA,
  suggestedQueries: HEALTHCARE_QUERIES,
  metrics: HEALTHCARE_METRICS,
  queryResultColumns: HEALTHCARE_QUERY_COLUMNS,
};

// Re-export everything
export * from './schema';
export * from './data';
export * from './queries';
