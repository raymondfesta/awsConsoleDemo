// IoT Sensor Dataset - Industrial IoT Monitoring
// Complete export for the dataset registry

import type { SampleDataset, DatasetDefinition, DatasetMetrics } from '../types';
import { IOT_SCHEMA, type IoTSchema } from './schema';
import { IOT_DATA, DATASET_STATS } from './data';
import { IOT_QUERIES, IOT_QUERY_COLUMNS } from './queries';

// Dataset definition for UI display
export const IOT_DEFINITION: DatasetDefinition = {
  id: 'iot-sensors',
  name: 'IoT Sensor Data',
  description: 'Industrial sensors with time-series readings, anomaly detection, and maintenance tracking',
  icon: 'status-positive',
  color: '#0972d3',
  industries: ['Manufacturing', 'Energy', 'Smart Cities', 'Industrial'],
  useCases: ['Real-time monitoring', 'Predictive maintenance', 'Anomaly detection', 'Equipment health'],
};

// Dataset metrics for summary display
export const IOT_METRICS: DatasetMetrics = {
  totalRecords: IOT_SCHEMA.totalRecords,
  tableCount: IOT_SCHEMA.tables.length,
  dateRange: DATASET_STATS.dateRange,
  highlights: [
    {
      id: 'devices',
      label: 'Devices',
      value: DATASET_STATS.totalDevices,
      format: 'number',
    },
    {
      id: 'readings',
      label: 'Sensor Readings',
      value: DATASET_STATS.totalReadings,
      format: 'number',
    },
    {
      id: 'anomalies',
      label: 'Anomalies',
      value: DATASET_STATS.anomaliesDetected,
      format: 'number',
    },
    {
      id: 'uptime',
      label: 'Uptime',
      value: `${DATASET_STATS.uptime}%`,
      format: 'text',
    },
  ],
};

// Complete dataset export
export const IOT_DATASET: SampleDataset<IoTSchema, typeof IOT_DATA> = {
  definition: IOT_DEFINITION,
  schema: IOT_SCHEMA,
  data: IOT_DATA,
  suggestedQueries: IOT_QUERIES,
  metrics: IOT_METRICS,
  queryResultColumns: IOT_QUERY_COLUMNS,
};

// Re-export everything
export * from './schema';
export * from './data';
export * from './queries';
