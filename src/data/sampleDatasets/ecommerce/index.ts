// E-commerce Dataset - TechStyle Fashion Retailer
// Complete export for the dataset registry

import type { SampleDataset, DatasetDefinition, DatasetMetrics } from '../types';
import { ECOMMERCE_SCHEMA, type EcommerceSchema } from './schema';
import { ECOMMERCE_DATA, DATASET_STATS } from './data';
import { ECOMMERCE_QUERIES, ECOMMERCE_QUERY_COLUMNS } from './queries';

// Dataset definition for UI display
export const ECOMMERCE_DEFINITION: DatasetDefinition = {
  id: 'ecommerce',
  name: 'E-commerce & Retail',
  description: 'Fashion retailer with customers, orders, products, and inventory tracking',
  icon: 'cart',
  color: '#ff9900',
  industries: ['Retail', 'Fashion', 'Consumer Goods'],
  useCases: ['Customer analytics', 'Inventory management', 'Revenue tracking', 'Order processing'],
};

// Dataset metrics for summary display
export const ECOMMERCE_METRICS: DatasetMetrics = {
  totalRecords: ECOMMERCE_SCHEMA.totalRecords,
  tableCount: ECOMMERCE_SCHEMA.tables.length,
  dateRange: DATASET_STATS.dateRange,
  highlights: [
    {
      id: 'customers',
      label: 'Customers',
      value: DATASET_STATS.totalCustomers,
      format: 'number',
    },
    {
      id: 'orders',
      label: 'Orders',
      value: DATASET_STATS.totalOrders,
      format: 'number',
    },
    {
      id: 'products',
      label: 'Products',
      value: DATASET_STATS.totalProducts,
      format: 'number',
    },
    {
      id: 'revenue',
      label: 'Total Revenue',
      value: DATASET_STATS.totalRevenue,
      format: 'currency',
    },
  ],
};

// Complete dataset export
export const ECOMMERCE_DATASET: SampleDataset<EcommerceSchema, typeof ECOMMERCE_DATA> = {
  definition: ECOMMERCE_DEFINITION,
  schema: ECOMMERCE_SCHEMA,
  data: ECOMMERCE_DATA,
  suggestedQueries: ECOMMERCE_QUERIES,
  metrics: ECOMMERCE_METRICS,
  queryResultColumns: ECOMMERCE_QUERY_COLUMNS,
};

// Re-export everything
export * from './schema';
export * from './data';
export * from './queries';
