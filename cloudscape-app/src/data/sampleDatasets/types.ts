// Core type definitions for all sample datasets
// Unified dataset architecture supporting multiple industry domains

// Available dataset types
export type DatasetType =
  | 'ecommerce'
  | 'iot-sensors'
  | 'saas-analytics'
  | 'healthcare'
  | 'financial';

// Column definition for table schemas
export interface ColumnDefinition {
  name: string;
  type: string;
  primaryKey?: boolean;
  foreignKey?: string;
  nullable?: boolean;
  default?: string;
  description?: string;
}

// Table definition within a schema
export interface TableDefinition {
  name: string;
  displayName: string;
  description: string;
  columns: ColumnDefinition[];
  recordCount: number;
  category: string;
  icon?: string;
}

// Relationship between tables
export interface Relationship {
  from: { table: string; column: string };
  to: { table: string; column: string };
  type: 'one-to-many' | 'many-to-one' | 'one-to-one' | 'many-to-many';
  description?: string;
}

// Base schema interface that all datasets must implement
export interface BaseSchema {
  name: string;
  description: string;
  tables: TableDefinition[];
  relationships: Relationship[];
  totalRecords: number;
  categories: string[];
}

// Dataset metadata for UI display
export interface DatasetDefinition {
  id: DatasetType;
  name: string;
  description: string;
  icon: string;
  color: string;
  industries: string[];
  useCases: string[];
}

// Metric highlight for dataset statistics
export interface MetricHighlight {
  id: string;
  label: string;
  value: number | string;
  format: 'number' | 'currency' | 'percentage' | 'text';
  trend?: {
    direction: 'up' | 'down' | 'stable';
    value: string;
  };
}

// Dataset metrics summary
export interface DatasetMetrics {
  totalRecords: number;
  tableCount: number;
  dateRange: { start: string; end: string };
  highlights: MetricHighlight[];
}

// Suggested query for dataset
export interface SuggestedQuery {
  id: string;
  name: string;
  description: string;
  naturalLanguage: string;
  sql: string;
  resultKey: string;
  category: string;
}

// Query result column definition
export interface QueryResultColumn {
  key: string;
  label: string;
  type: 'string' | 'number' | 'currency' | 'date' | 'percentage' | 'status';
}

// Complete sample dataset structure
export interface SampleDataset<
  TSchema extends BaseSchema = BaseSchema,
  TData extends Record<string, unknown> = Record<string, unknown>
> {
  definition: DatasetDefinition;
  schema: TSchema;
  data: TData;
  suggestedQueries: SuggestedQuery[];
  metrics: DatasetMetrics;
  queryResultColumns: Record<string, QueryResultColumn[]>;
}

// Populated database tracking
export interface PopulatedDatabase {
  databaseId: string;
  datasetType: DatasetType;
  importedAt: Date;
  tableCount: number;
  recordCount: number;
  metrics: DatasetMetrics;
}

// Options for populating a database
export interface PopulateOptions {
  excludeTables?: string[];
  recordMultiplier?: number;
}
