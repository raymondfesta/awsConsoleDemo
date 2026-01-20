// E-commerce Suggested Queries
// Pre-defined queries with natural language mappings

import type { SuggestedQuery, QueryResultColumn } from '../types';

export const ECOMMERCE_QUERIES: SuggestedQuery[] = [
  {
    id: 'top-customers',
    name: 'Top Customers',
    description: 'Find top 10 customers by lifetime value',
    naturalLanguage: 'Show me our top customers',
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
    resultKey: 'topCustomers',
    category: 'Customers',
  },
  {
    id: 'category-revenue',
    name: 'Revenue by Category',
    description: 'Revenue breakdown by product category',
    naturalLanguage: 'Show revenue by category',
    sql: `SELECT
  p.category,
  SUM(oi.line_total) as total_revenue,
  COUNT(DISTINCT o.order_id) as order_count,
  SUM(oi.quantity) as units_sold
FROM order_items oi
JOIN products p ON oi.product_id = p.product_id
JOIN orders o ON oi.order_id = o.order_id
GROUP BY p.category
ORDER BY total_revenue DESC;`,
    resultKey: 'categoryRevenue',
    category: 'Revenue',
  },
  {
    id: 'monthly-revenue',
    name: 'Monthly Revenue Trend',
    description: 'Revenue trend over the past 12 months',
    naturalLanguage: 'Show monthly revenue trend',
    sql: `SELECT
  DATE_TRUNC('month', order_date) as month,
  SUM(total_amount) as revenue,
  COUNT(*) as orders,
  AVG(total_amount) as avg_order_value
FROM orders
WHERE order_date >= NOW() - INTERVAL '12 months'
GROUP BY DATE_TRUNC('month', order_date)
ORDER BY month;`,
    resultKey: 'monthlyRevenue',
    category: 'Revenue',
  },
  {
    id: 'low-inventory',
    name: 'Low Inventory Alert',
    description: 'Products below reorder point',
    naturalLanguage: 'Show low inventory products',
    sql: `SELECT
  p.product_id,
  p.sku,
  p.name,
  p.category,
  i.quantity_on_hand,
  i.reorder_point,
  i.warehouse_location
FROM inventory i
JOIN products p ON i.product_id = p.product_id
WHERE i.quantity_on_hand < i.reorder_point
ORDER BY i.quantity_on_hand ASC;`,
    resultKey: 'lowInventory',
    category: 'Inventory',
  },
  {
    id: 'top-products',
    name: 'Best Selling Products',
    description: 'Top 10 products by units sold',
    naturalLanguage: 'Show best selling products',
    sql: `SELECT
  p.product_id,
  p.sku,
  p.name,
  p.category,
  SUM(oi.quantity) as units_sold,
  SUM(oi.line_total) as revenue,
  AVG(r.rating) as avg_rating,
  COUNT(DISTINCT r.review_id) as review_count
FROM products p
JOIN order_items oi ON p.product_id = oi.product_id
LEFT JOIN reviews r ON p.product_id = r.product_id
GROUP BY p.product_id, p.sku, p.name, p.category
ORDER BY units_sold DESC
LIMIT 10;`,
    resultKey: 'topProducts',
    category: 'Products',
  },
  {
    id: 'order-status',
    name: 'Order Status Distribution',
    description: 'Current order status breakdown',
    naturalLanguage: 'Show order status distribution',
    sql: `SELECT
  status,
  COUNT(*) as count,
  ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER (), 1) as percentage
FROM orders
GROUP BY status
ORDER BY count DESC;`,
    resultKey: 'orderStatus',
    category: 'Orders',
  },
  {
    id: 'customer-acquisition',
    name: 'Customer Acquisition',
    description: 'New vs returning customers by month',
    naturalLanguage: 'Show customer acquisition trends',
    sql: `SELECT
  DATE_TRUNC('month', o.order_date) as month,
  COUNT(DISTINCT CASE WHEN c.order_count = 1 THEN c.customer_id END) as new_customers,
  COUNT(DISTINCT CASE WHEN c.order_count > 1 THEN c.customer_id END) as returning_customers
FROM orders o
JOIN customers c ON o.customer_id = c.customer_id
GROUP BY DATE_TRUNC('month', o.order_date)
ORDER BY month;`,
    resultKey: 'customerAcquisition',
    category: 'Customers',
  },
  {
    id: 'recent-orders',
    name: 'Recent Orders',
    description: 'Latest 5 orders with details',
    naturalLanguage: 'Show recent orders',
    sql: `SELECT
  o.order_id,
  CONCAT(c.first_name, ' ', c.last_name) as customer_name,
  o.order_date,
  o.status,
  o.total_amount,
  COUNT(oi.item_id) as items_count
FROM orders o
JOIN customers c ON o.customer_id = c.customer_id
JOIN order_items oi ON o.order_id = oi.order_id
GROUP BY o.order_id, c.first_name, c.last_name, o.order_date, o.status, o.total_amount
ORDER BY o.order_date DESC
LIMIT 5;`,
    resultKey: 'sampleOrders',
    category: 'Orders',
  },
];

// Column definitions for query results
export const ECOMMERCE_QUERY_COLUMNS: Record<string, QueryResultColumn[]> = {
  topCustomers: [
    { key: 'customer_id', label: 'ID', type: 'string' },
    { key: 'email', label: 'Email', type: 'string' },
    { key: 'first_name', label: 'First Name', type: 'string' },
    { key: 'last_name', label: 'Last Name', type: 'string' },
    { key: 'lifetime_value', label: 'Lifetime Value', type: 'currency' },
    { key: 'order_count', label: 'Orders', type: 'number' },
  ],
  categoryRevenue: [
    { key: 'category', label: 'Category', type: 'string' },
    { key: 'total_revenue', label: 'Revenue', type: 'currency' },
    { key: 'order_count', label: 'Orders', type: 'number' },
    { key: 'units_sold', label: 'Units Sold', type: 'number' },
    { key: 'avg_order_value', label: 'Avg Order', type: 'currency' },
    { key: 'percentage', label: '% of Total', type: 'percentage' },
  ],
  monthlyRevenue: [
    { key: 'month_display', label: 'Month', type: 'string' },
    { key: 'revenue', label: 'Revenue', type: 'currency' },
    { key: 'orders', label: 'Orders', type: 'number' },
    { key: 'avg_order_value', label: 'Avg Order', type: 'currency' },
  ],
  lowInventory: [
    { key: 'sku', label: 'SKU', type: 'string' },
    { key: 'name', label: 'Product', type: 'string' },
    { key: 'category', label: 'Category', type: 'string' },
    { key: 'quantity_on_hand', label: 'In Stock', type: 'number' },
    { key: 'reorder_point', label: 'Reorder At', type: 'number' },
    { key: 'days_until_stockout', label: 'Days Left', type: 'number' },
  ],
  topProducts: [
    { key: 'sku', label: 'SKU', type: 'string' },
    { key: 'name', label: 'Product', type: 'string' },
    { key: 'category', label: 'Category', type: 'string' },
    { key: 'units_sold', label: 'Units Sold', type: 'number' },
    { key: 'revenue', label: 'Revenue', type: 'currency' },
    { key: 'avg_rating', label: 'Rating', type: 'number' },
  ],
  orderStatus: [
    { key: 'status', label: 'Status', type: 'status' },
    { key: 'count', label: 'Count', type: 'number' },
    { key: 'percentage', label: 'Percentage', type: 'percentage' },
  ],
  customerAcquisition: [
    { key: 'month_display', label: 'Month', type: 'string' },
    { key: 'new_customers', label: 'New', type: 'number' },
    { key: 'returning_customers', label: 'Returning', type: 'number' },
    { key: 'retention_rate', label: 'Retention %', type: 'percentage' },
  ],
  sampleOrders: [
    { key: 'order_id', label: 'Order ID', type: 'string' },
    { key: 'customer_name', label: 'Customer', type: 'string' },
    { key: 'order_date', label: 'Date', type: 'date' },
    { key: 'status', label: 'Status', type: 'status' },
    { key: 'total_amount', label: 'Total', type: 'currency' },
    { key: 'items_count', label: 'Items', type: 'number' },
  ],
  sampleCustomers: [
    { key: 'customer_id', label: 'ID', type: 'string' },
    { key: 'email', label: 'Email', type: 'string' },
    { key: 'first_name', label: 'First Name', type: 'string' },
    { key: 'last_name', label: 'Last Name', type: 'string' },
    { key: 'lifetime_value', label: 'Lifetime Value', type: 'currency' },
    { key: 'order_count', label: 'Orders', type: 'number' },
  ],
  sampleProducts: [
    { key: 'sku', label: 'SKU', type: 'string' },
    { key: 'name', label: 'Product', type: 'string' },
    { key: 'category', label: 'Category', type: 'string' },
    { key: 'price', label: 'Price', type: 'currency' },
    { key: 'quantity_on_hand', label: 'Stock', type: 'number' },
    { key: 'is_active', label: 'Active', type: 'string' },
  ],
};
