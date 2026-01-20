// E-commerce Suggested Queries
// Pre-built SQL queries with natural language descriptions and result mappings

import {
  TOP_CUSTOMERS,
  CATEGORY_REVENUE,
  MONTHLY_REVENUE,
  LOW_INVENTORY_PRODUCTS,
  TOP_PRODUCTS,
  ORDER_STATUS_DISTRIBUTION,
  CUSTOMER_ACQUISITION,
  SAMPLE_CUSTOMERS,
  SAMPLE_ORDERS,
  SAMPLE_PRODUCTS,
  DATASET_STATS,
} from './ecommerceSampleData';

export type QueryCategory =
  | 'Customer Analytics'
  | 'Revenue Analytics'
  | 'Product Analytics'
  | 'Inventory'
  | 'Operations';

export interface SuggestedQuery {
  id: string;
  category: QueryCategory;
  title: string;
  naturalLanguage: string;
  description: string;
  sql: string;
  resultType: 'table' | 'chart' | 'metric';
  chartType?: 'bar' | 'line' | 'pie';
  resultKey: string;
  columns?: Array<{ id: string; header: string; type?: 'number' | 'currency' | 'percentage' }>;
}

export const SUGGESTED_QUERIES: SuggestedQuery[] = [
  // Customer Analytics
  {
    id: 'top-customers-ltv',
    category: 'Customer Analytics',
    title: 'Top Customers by Revenue',
    naturalLanguage: 'Show me top customers by revenue',
    description: 'Identifies your highest-value customers based on lifetime spend',
    sql: `SELECT
  customer_id,
  email,
  first_name,
  last_name,
  lifetime_value,
  order_count
FROM customers
ORDER BY lifetime_value DESC
LIMIT 10;`,
    resultType: 'table',
    resultKey: 'topCustomers',
    columns: [
      { id: 'first_name', header: 'First Name' },
      { id: 'last_name', header: 'Last Name' },
      { id: 'email', header: 'Email' },
      { id: 'lifetime_value', header: 'Lifetime Value', type: 'currency' },
      { id: 'order_count', header: 'Orders', type: 'number' },
    ],
  },
  {
    id: 'customer-acquisition',
    category: 'Customer Analytics',
    title: 'Customer Acquisition Trend',
    naturalLanguage: 'How are we acquiring new customers over time?',
    description: 'Shows monthly new vs returning customer breakdown',
    sql: `SELECT
  DATE_TRUNC('month', created_at) AS month,
  COUNT(*) AS new_customers,
  (SELECT COUNT(DISTINCT customer_id)
   FROM orders o2
   WHERE DATE_TRUNC('month', o2.order_date) = DATE_TRUNC('month', c.created_at)
   AND o2.customer_id IN (SELECT customer_id FROM orders WHERE order_date < DATE_TRUNC('month', c.created_at))
  ) AS returning_customers
FROM customers c
WHERE created_at >= NOW() - INTERVAL '12 months'
GROUP BY month
ORDER BY month;`,
    resultType: 'chart',
    chartType: 'bar',
    resultKey: 'customerAcquisition',
    columns: [
      { id: 'month_display', header: 'Month' },
      { id: 'new_customers', header: 'New Customers', type: 'number' },
      { id: 'returning_customers', header: 'Returning', type: 'number' },
      { id: 'retention_rate', header: 'Retention %', type: 'percentage' },
    ],
  },

  // Revenue Analytics
  {
    id: 'monthly-revenue',
    category: 'Revenue Analytics',
    title: 'Monthly Revenue Trend',
    naturalLanguage: 'What was our monthly revenue for the past year?',
    description: 'Tracks revenue performance month-over-month',
    sql: `SELECT
  DATE_TRUNC('month', order_date) AS month,
  SUM(total_amount) AS revenue,
  COUNT(*) AS orders,
  AVG(total_amount) AS avg_order_value
FROM orders
WHERE order_date >= NOW() - INTERVAL '12 months'
GROUP BY month
ORDER BY month;`,
    resultType: 'chart',
    chartType: 'line',
    resultKey: 'monthlyRevenue',
    columns: [
      { id: 'month_display', header: 'Month' },
      { id: 'revenue', header: 'Revenue', type: 'currency' },
      { id: 'orders', header: 'Orders', type: 'number' },
      { id: 'avg_order_value', header: 'AOV', type: 'currency' },
    ],
  },
  {
    id: 'category-revenue',
    category: 'Revenue Analytics',
    title: 'Revenue by Category',
    naturalLanguage: 'What are our best-selling product categories?',
    description: 'Breaks down revenue by product category',
    sql: `SELECT
  p.category,
  SUM(oi.line_total) AS total_revenue,
  COUNT(DISTINCT oi.order_id) AS order_count,
  SUM(oi.quantity) AS units_sold,
  AVG(oi.line_total) AS avg_order_value
FROM order_items oi
JOIN products p ON oi.product_id = p.product_id
GROUP BY p.category
ORDER BY total_revenue DESC;`,
    resultType: 'chart',
    chartType: 'bar',
    resultKey: 'categoryRevenue',
    columns: [
      { id: 'category', header: 'Category' },
      { id: 'total_revenue', header: 'Revenue', type: 'currency' },
      { id: 'order_count', header: 'Orders', type: 'number' },
      { id: 'units_sold', header: 'Units Sold', type: 'number' },
      { id: 'percentage', header: 'Share', type: 'percentage' },
    ],
  },

  // Product Analytics
  {
    id: 'top-products',
    category: 'Product Analytics',
    title: 'Top Selling Products',
    naturalLanguage: 'Which products are selling the best?',
    description: 'Shows your best performing products by units sold and revenue',
    sql: `SELECT
  p.product_id,
  p.sku,
  p.name,
  p.category,
  SUM(oi.quantity) AS units_sold,
  SUM(oi.line_total) AS revenue,
  AVG(r.rating) AS avg_rating,
  COUNT(DISTINCT r.review_id) AS review_count
FROM products p
JOIN order_items oi ON p.product_id = oi.product_id
LEFT JOIN reviews r ON p.product_id = r.product_id
GROUP BY p.product_id, p.sku, p.name, p.category
ORDER BY units_sold DESC
LIMIT 10;`,
    resultType: 'table',
    resultKey: 'topProducts',
    columns: [
      { id: 'name', header: 'Product' },
      { id: 'category', header: 'Category' },
      { id: 'units_sold', header: 'Units Sold', type: 'number' },
      { id: 'revenue', header: 'Revenue', type: 'currency' },
      { id: 'avg_rating', header: 'Rating', type: 'number' },
    ],
  },

  // Inventory
  {
    id: 'low-inventory',
    category: 'Inventory',
    title: 'Low Inventory Alert',
    naturalLanguage: 'Which products are running low on inventory?',
    description: 'Products below their reorder point that need restocking',
    sql: `SELECT
  p.product_id,
  p.sku,
  p.name,
  p.category,
  i.quantity_on_hand,
  i.reorder_point,
  i.warehouse_location,
  CASE
    WHEN i.quantity_on_hand = 0 THEN 0
    ELSE CEIL(i.quantity_on_hand / (
      SELECT AVG(daily_sales) FROM (
        SELECT product_id, COUNT(*) / 30.0 AS daily_sales
        FROM order_items
        WHERE order_id IN (SELECT order_id FROM orders WHERE order_date > NOW() - INTERVAL '30 days')
        GROUP BY product_id
      ) avg_sales WHERE avg_sales.product_id = p.product_id
    ))
  END AS days_until_stockout
FROM products p
JOIN inventory i ON p.product_id = i.product_id
WHERE i.quantity_on_hand < i.reorder_point
ORDER BY days_until_stockout ASC, i.quantity_on_hand ASC;`,
    resultType: 'table',
    resultKey: 'lowInventory',
    columns: [
      { id: 'name', header: 'Product' },
      { id: 'category', header: 'Category' },
      { id: 'quantity_on_hand', header: 'In Stock', type: 'number' },
      { id: 'reorder_point', header: 'Reorder At', type: 'number' },
      { id: 'days_until_stockout', header: 'Days Left', type: 'number' },
      { id: 'warehouse_location', header: 'Location' },
    ],
  },

  // Operations
  {
    id: 'order-status',
    category: 'Operations',
    title: 'Order Status Distribution',
    naturalLanguage: 'What is the breakdown of order statuses?',
    description: 'Shows current order fulfillment status distribution',
    sql: `SELECT
  status,
  COUNT(*) AS count,
  ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER (), 1) AS percentage
FROM orders
GROUP BY status
ORDER BY count DESC;`,
    resultType: 'chart',
    chartType: 'pie',
    resultKey: 'orderStatus',
    columns: [
      { id: 'status', header: 'Status' },
      { id: 'count', header: 'Orders', type: 'number' },
      { id: 'percentage', header: 'Percentage', type: 'percentage' },
    ],
  },
  {
    id: 'recent-orders',
    category: 'Operations',
    title: 'Recent Orders',
    naturalLanguage: 'Show me the most recent orders',
    description: 'Lists the latest orders with customer and status info',
    sql: `SELECT
  o.order_id,
  c.first_name || ' ' || c.last_name AS customer_name,
  o.order_date,
  o.status,
  o.total_amount,
  COUNT(oi.item_id) AS items_count
FROM orders o
JOIN customers c ON o.customer_id = c.customer_id
JOIN order_items oi ON o.order_id = oi.order_id
GROUP BY o.order_id, c.first_name, c.last_name, o.order_date, o.status, o.total_amount
ORDER BY o.order_date DESC
LIMIT 10;`,
    resultType: 'table',
    resultKey: 'sampleOrders',
    columns: [
      { id: 'order_id', header: 'Order ID' },
      { id: 'customer_name', header: 'Customer' },
      { id: 'order_date', header: 'Date' },
      { id: 'status', header: 'Status' },
      { id: 'total_amount', header: 'Total', type: 'currency' },
      { id: 'items_count', header: 'Items', type: 'number' },
    ],
  },
];

// Quick prompts for the chat interface
export const QUERY_PROMPTS = [
  { id: 'top-customers', text: 'Show me top customers by revenue' },
  { id: 'best-categories', text: 'What are our best-selling product categories?' },
  { id: 'low-inventory', text: 'Which products are running low on inventory?' },
  { id: 'monthly-revenue', text: 'What was our monthly revenue trend?' },
];

// Map result keys to actual data
export const QUERY_RESULTS: Record<string, unknown[]> = {
  topCustomers: TOP_CUSTOMERS,
  categoryRevenue: CATEGORY_REVENUE,
  monthlyRevenue: MONTHLY_REVENUE,
  lowInventory: LOW_INVENTORY_PRODUCTS,
  topProducts: TOP_PRODUCTS,
  orderStatus: ORDER_STATUS_DISTRIBUTION,
  customerAcquisition: CUSTOMER_ACQUISITION,
  sampleCustomers: SAMPLE_CUSTOMERS,
  sampleOrders: SAMPLE_ORDERS,
  sampleProducts: SAMPLE_PRODUCTS,
};

// Summary metrics for dashboard
export const SUMMARY_METRICS = [
  {
    id: 'total-revenue',
    label: 'Total Revenue',
    value: DATASET_STATS.totalRevenue,
    format: 'currency',
    trend: '+12.5%',
    trendDirection: 'up' as const,
  },
  {
    id: 'total-orders',
    label: 'Total Orders',
    value: DATASET_STATS.totalOrders,
    format: 'number',
    trend: '+8.3%',
    trendDirection: 'up' as const,
  },
  {
    id: 'avg-order-value',
    label: 'Avg Order Value',
    value: DATASET_STATS.averageOrderValue,
    format: 'currency',
    trend: '+3.8%',
    trendDirection: 'up' as const,
  },
  {
    id: 'total-customers',
    label: 'Total Customers',
    value: DATASET_STATS.totalCustomers,
    format: 'number',
    trend: '+15.2%',
    trendDirection: 'up' as const,
  },
];

// Natural language to query mapping for the agent
export const NL_QUERY_MAPPINGS: Array<{ patterns: string[]; queryId: string }> = [
  {
    patterns: ['top customer', 'best customer', 'highest value customer', 'customer revenue', 'lifetime value'],
    queryId: 'top-customers-ltv',
  },
  {
    patterns: ['monthly revenue', 'revenue trend', 'revenue over time', 'sales trend'],
    queryId: 'monthly-revenue',
  },
  {
    patterns: ['category', 'best selling category', 'product category', 'category breakdown'],
    queryId: 'category-revenue',
  },
  {
    patterns: ['low inventory', 'out of stock', 'restock', 'inventory alert', 'running low'],
    queryId: 'low-inventory',
  },
  {
    patterns: ['top product', 'best selling product', 'popular product', 'best seller'],
    queryId: 'top-products',
  },
  {
    patterns: ['order status', 'fulfillment', 'order breakdown', 'shipping status'],
    queryId: 'order-status',
  },
  {
    patterns: ['recent order', 'latest order', 'new order'],
    queryId: 'recent-orders',
  },
  {
    patterns: ['new customer', 'customer acquisition', 'customer growth', 'retention'],
    queryId: 'customer-acquisition',
  },
];

// Helper function to find matching query from natural language
export function findQueryFromNaturalLanguage(input: string): SuggestedQuery | undefined {
  const normalizedInput = input.toLowerCase();

  for (const mapping of NL_QUERY_MAPPINGS) {
    if (mapping.patterns.some(pattern => normalizedInput.includes(pattern))) {
      return SUGGESTED_QUERIES.find(q => q.id === mapping.queryId);
    }
  }

  return undefined;
}

// Helper function to get query result data
export function getQueryResult(queryId: string): unknown[] | undefined {
  const query = SUGGESTED_QUERIES.find(q => q.id === queryId);
  if (query) {
    return QUERY_RESULTS[query.resultKey];
  }
  return undefined;
}

export default SUGGESTED_QUERIES;
