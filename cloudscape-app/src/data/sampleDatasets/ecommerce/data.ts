// E-commerce Sample Data - Mock Records for Demo Queries
// Pre-computed results for instant display

import type { FashionCategory } from './schema';

// Dataset summary statistics
export const DATASET_STATS = {
  totalCustomers: 8500,
  totalOrders: 28000,
  totalProducts: 1200,
  totalRevenue: 4247832.50,
  averageOrderValue: 151.71,
  topCategory: 'Dresses',
  dateRange: {
    start: '2024-01-01',
    end: '2025-01-15',
  },
};

// Top customers by lifetime value
export interface TopCustomer {
  customer_id: string;
  email: string;
  first_name: string;
  last_name: string;
  lifetime_value: number;
  order_count: number;
}

export const TOP_CUSTOMERS: TopCustomer[] = [
  { customer_id: 'c-001', email: 'emma.wilson@email.com', first_name: 'Emma', last_name: 'Wilson', lifetime_value: 8945.50, order_count: 47 },
  { customer_id: 'c-002', email: 'james.chen@email.com', first_name: 'James', last_name: 'Chen', lifetime_value: 7832.25, order_count: 38 },
  { customer_id: 'c-003', email: 'sofia.martinez@email.com', first_name: 'Sofia', last_name: 'Martinez', lifetime_value: 6721.80, order_count: 42 },
  { customer_id: 'c-004', email: 'liam.johnson@email.com', first_name: 'Liam', last_name: 'Johnson', lifetime_value: 6543.00, order_count: 35 },
  { customer_id: 'c-005', email: 'olivia.brown@email.com', first_name: 'Olivia', last_name: 'Brown', lifetime_value: 5987.75, order_count: 31 },
  { customer_id: 'c-006', email: 'noah.davis@email.com', first_name: 'Noah', last_name: 'Davis', lifetime_value: 5654.20, order_count: 29 },
  { customer_id: 'c-007', email: 'ava.garcia@email.com', first_name: 'Ava', last_name: 'Garcia', lifetime_value: 5432.90, order_count: 33 },
  { customer_id: 'c-008', email: 'william.lee@email.com', first_name: 'William', last_name: 'Lee', lifetime_value: 5198.45, order_count: 27 },
  { customer_id: 'c-009', email: 'mia.rodriguez@email.com', first_name: 'Mia', last_name: 'Rodriguez', lifetime_value: 4987.30, order_count: 26 },
  { customer_id: 'c-010', email: 'ethan.kim@email.com', first_name: 'Ethan', last_name: 'Kim', lifetime_value: 4765.60, order_count: 24 },
];

// Category revenue breakdown
export interface CategoryRevenue {
  category: FashionCategory;
  total_revenue: number;
  order_count: number;
  units_sold: number;
  avg_order_value: number;
  percentage: number;
}

export const CATEGORY_REVENUE: CategoryRevenue[] = [
  { category: 'Dresses', total_revenue: 892456.80, order_count: 5200, units_sold: 7800, avg_order_value: 171.63, percentage: 21.0 },
  { category: 'Tops', total_revenue: 764532.40, order_count: 8100, units_sold: 14200, avg_order_value: 94.39, percentage: 18.0 },
  { category: 'Shoes', total_revenue: 679853.20, order_count: 4800, units_sold: 5900, avg_order_value: 141.64, percentage: 16.0 },
  { category: 'Bottoms', total_revenue: 594671.55, order_count: 5900, units_sold: 9200, avg_order_value: 100.79, percentage: 14.0 },
  { category: 'Outerwear', total_revenue: 552219.12, order_count: 2800, units_sold: 3100, avg_order_value: 197.22, percentage: 13.0 },
  { category: 'Accessories', total_revenue: 424783.25, order_count: 6200, units_sold: 12400, avg_order_value: 68.51, percentage: 10.0 },
  { category: 'Jewelry', total_revenue: 339316.18, order_count: 3100, units_sold: 4800, avg_order_value: 109.46, percentage: 8.0 },
];

// Monthly revenue trend
export interface MonthlyRevenue {
  month: string;
  month_display: string;
  revenue: number;
  orders: number;
  avg_order_value: number;
}

export const MONTHLY_REVENUE: MonthlyRevenue[] = [
  { month: '2024-01', month_display: 'Jan 2024', revenue: 287432.50, orders: 1850, avg_order_value: 155.37 },
  { month: '2024-02', month_display: 'Feb 2024', revenue: 312654.80, orders: 2100, avg_order_value: 148.88 },
  { month: '2024-03', month_display: 'Mar 2024', revenue: 298765.40, orders: 1980, avg_order_value: 150.89 },
  { month: '2024-04', month_display: 'Apr 2024', revenue: 276543.20, orders: 1820, avg_order_value: 151.95 },
  { month: '2024-05', month_display: 'May 2024', revenue: 289876.90, orders: 1900, avg_order_value: 152.57 },
  { month: '2024-06', month_display: 'Jun 2024', revenue: 324567.30, orders: 2150, avg_order_value: 150.96 },
  { month: '2024-07', month_display: 'Jul 2024', revenue: 298432.10, orders: 1950, avg_order_value: 153.04 },
  { month: '2024-08', month_display: 'Aug 2024', revenue: 312876.45, orders: 2050, avg_order_value: 152.62 },
  { month: '2024-09', month_display: 'Sep 2024', revenue: 345678.90, orders: 2300, avg_order_value: 150.30 },
  { month: '2024-10', month_display: 'Oct 2024', revenue: 378943.25, orders: 2500, avg_order_value: 151.58 },
  { month: '2024-11', month_display: 'Nov 2024', revenue: 456789.30, orders: 3100, avg_order_value: 147.35 },
  { month: '2024-12', month_display: 'Dec 2024', revenue: 465272.40, orders: 3200, avg_order_value: 145.40 },
];

// Low inventory products
export interface LowInventoryProduct {
  product_id: string;
  sku: string;
  name: string;
  category: FashionCategory;
  quantity_on_hand: number;
  reorder_point: number;
  warehouse_location: string;
  days_until_stockout: number;
}

export const LOW_INVENTORY_PRODUCTS: LowInventoryProduct[] = [
  { product_id: 'p-234', sku: 'TS-DRS-BLK-M', name: 'Classic Black Cocktail Dress', category: 'Dresses', quantity_on_hand: 3, reorder_point: 15, warehouse_location: 'A-12-3', days_until_stockout: 2 },
  { product_id: 'p-456', sku: 'TS-TOP-WHT-S', name: 'Essential White Blouse', category: 'Tops', quantity_on_hand: 5, reorder_point: 20, warehouse_location: 'B-05-1', days_until_stockout: 3 },
  { product_id: 'p-789', sku: 'TS-SHO-TAN-8', name: 'Leather Ankle Boots', category: 'Shoes', quantity_on_hand: 4, reorder_point: 10, warehouse_location: 'C-08-2', days_until_stockout: 4 },
  { product_id: 'p-112', sku: 'TS-OUT-GRY-L', name: 'Wool Blend Overcoat', category: 'Outerwear', quantity_on_hand: 2, reorder_point: 8, warehouse_location: 'D-02-4', days_until_stockout: 1 },
  { product_id: 'p-345', sku: 'TS-BOT-BLU-M', name: 'High-Rise Skinny Jeans', category: 'Bottoms', quantity_on_hand: 6, reorder_point: 25, warehouse_location: 'A-15-2', days_until_stockout: 5 },
  { product_id: 'p-678', sku: 'TS-ACC-GLD-OS', name: 'Statement Gold Necklace', category: 'Jewelry', quantity_on_hand: 7, reorder_point: 12, warehouse_location: 'E-01-1', days_until_stockout: 6 },
  { product_id: 'p-901', sku: 'TS-DRS-RED-S', name: 'Silk Evening Gown', category: 'Dresses', quantity_on_hand: 1, reorder_point: 5, warehouse_location: 'A-10-5', days_until_stockout: 1 },
  { product_id: 'p-234b', sku: 'TS-TOP-NVY-M', name: 'Cashmere V-Neck Sweater', category: 'Tops', quantity_on_hand: 8, reorder_point: 15, warehouse_location: 'B-07-3', days_until_stockout: 7 },
];

// Top selling products
export interface TopProduct {
  product_id: string;
  sku: string;
  name: string;
  category: FashionCategory;
  units_sold: number;
  revenue: number;
  avg_rating: number;
  review_count: number;
}

export const TOP_PRODUCTS: TopProduct[] = [
  { product_id: 'p-001', sku: 'TS-DRS-FLR-M', name: 'Floral Midi Dress', category: 'Dresses', units_sold: 1245, revenue: 112050.00, avg_rating: 4.8, review_count: 342 },
  { product_id: 'p-002', sku: 'TS-TOP-STR-S', name: 'Striped Cotton Tee', category: 'Tops', units_sold: 2156, revenue: 64680.00, avg_rating: 4.6, review_count: 521 },
  { product_id: 'p-003', sku: 'TS-BOT-DNM-M', name: 'Classic Denim Jeans', category: 'Bottoms', units_sold: 1834, revenue: 128380.00, avg_rating: 4.7, review_count: 456 },
  { product_id: 'p-004', sku: 'TS-SHO-SNK-9', name: 'White Leather Sneakers', category: 'Shoes', units_sold: 987, revenue: 88830.00, avg_rating: 4.5, review_count: 234 },
  { product_id: 'p-005', sku: 'TS-OUT-JKT-L', name: 'Denim Trucker Jacket', category: 'Outerwear', units_sold: 654, revenue: 78480.00, avg_rating: 4.9, review_count: 187 },
  { product_id: 'p-006', sku: 'TS-ACC-BAG-OS', name: 'Crossbody Leather Bag', category: 'Accessories', units_sold: 1432, revenue: 100240.00, avg_rating: 4.7, review_count: 312 },
  { product_id: 'p-007', sku: 'TS-JWL-EAR-OS', name: 'Pearl Drop Earrings', category: 'Jewelry', units_sold: 876, revenue: 43800.00, avg_rating: 4.4, review_count: 198 },
  { product_id: 'p-008', sku: 'TS-DRS-MXI-L', name: 'Bohemian Maxi Dress', category: 'Dresses', units_sold: 1123, revenue: 123530.00, avg_rating: 4.8, review_count: 289 },
  { product_id: 'p-009', sku: 'TS-TOP-BLZ-M', name: 'Tailored Blazer', category: 'Tops', units_sold: 765, revenue: 114750.00, avg_rating: 4.6, review_count: 176 },
  { product_id: 'p-010', sku: 'TS-SHO-HEL-7', name: 'Stiletto Heels', category: 'Shoes', units_sold: 543, revenue: 65160.00, avg_rating: 4.3, review_count: 145 },
];

// Order status distribution
export interface OrderStatus {
  status: string;
  count: number;
  percentage: number;
}

export const ORDER_STATUS_DISTRIBUTION: OrderStatus[] = [
  { status: 'Delivered', count: 24500, percentage: 87.5 },
  { status: 'Shipped', count: 2100, percentage: 7.5 },
  { status: 'Processing', count: 980, percentage: 3.5 },
  { status: 'Cancelled', count: 420, percentage: 1.5 },
];

// Customer acquisition by month
export interface CustomerAcquisition {
  month: string;
  month_display: string;
  new_customers: number;
  returning_customers: number;
  retention_rate: number;
}

export const CUSTOMER_ACQUISITION: CustomerAcquisition[] = [
  { month: '2024-01', month_display: 'Jan 2024', new_customers: 420, returning_customers: 1430, retention_rate: 77.3 },
  { month: '2024-02', month_display: 'Feb 2024', new_customers: 485, returning_customers: 1615, retention_rate: 76.9 },
  { month: '2024-03', month_display: 'Mar 2024', new_customers: 510, returning_customers: 1470, retention_rate: 74.2 },
  { month: '2024-04', month_display: 'Apr 2024', new_customers: 445, returning_customers: 1375, retention_rate: 75.5 },
  { month: '2024-05', month_display: 'May 2024', new_customers: 490, returning_customers: 1410, retention_rate: 74.2 },
  { month: '2024-06', month_display: 'Jun 2024', new_customers: 565, returning_customers: 1585, retention_rate: 73.7 },
  { month: '2024-07', month_display: 'Jul 2024', new_customers: 520, returning_customers: 1430, retention_rate: 73.3 },
  { month: '2024-08', month_display: 'Aug 2024', new_customers: 545, returning_customers: 1505, retention_rate: 73.4 },
  { month: '2024-09', month_display: 'Sep 2024', new_customers: 610, returning_customers: 1690, retention_rate: 73.5 },
  { month: '2024-10', month_display: 'Oct 2024', new_customers: 680, returning_customers: 1820, retention_rate: 72.8 },
  { month: '2024-11', month_display: 'Nov 2024', new_customers: 890, returning_customers: 2210, retention_rate: 71.3 },
  { month: '2024-12', month_display: 'Dec 2024', new_customers: 920, returning_customers: 2280, retention_rate: 71.2 },
];

// Sample customers for listing
export interface SampleCustomer {
  customer_id: string;
  email: string;
  first_name: string;
  last_name: string;
  created_at: string;
  lifetime_value: number;
  order_count: number;
  last_order_date: string;
}

export const SAMPLE_CUSTOMERS: SampleCustomer[] = [
  { customer_id: 'c-001', email: 'emma.wilson@email.com', first_name: 'Emma', last_name: 'Wilson', created_at: '2023-03-15', lifetime_value: 8945.50, order_count: 47, last_order_date: '2025-01-10' },
  { customer_id: 'c-002', email: 'james.chen@email.com', first_name: 'James', last_name: 'Chen', created_at: '2023-05-22', lifetime_value: 7832.25, order_count: 38, last_order_date: '2025-01-08' },
  { customer_id: 'c-003', email: 'sofia.martinez@email.com', first_name: 'Sofia', last_name: 'Martinez', created_at: '2023-02-10', lifetime_value: 6721.80, order_count: 42, last_order_date: '2025-01-12' },
  { customer_id: 'c-004', email: 'liam.johnson@email.com', first_name: 'Liam', last_name: 'Johnson', created_at: '2023-07-18', lifetime_value: 6543.00, order_count: 35, last_order_date: '2025-01-05' },
  { customer_id: 'c-005', email: 'olivia.brown@email.com', first_name: 'Olivia', last_name: 'Brown', created_at: '2023-04-25', lifetime_value: 5987.75, order_count: 31, last_order_date: '2025-01-11' },
];

// Sample orders for listing
export interface SampleOrder {
  order_id: string;
  customer_name: string;
  order_date: string;
  status: string;
  total_amount: number;
  items_count: number;
}

export const SAMPLE_ORDERS: SampleOrder[] = [
  { order_id: 'ORD-28001', customer_name: 'Emma Wilson', order_date: '2025-01-15', status: 'Processing', total_amount: 245.80, items_count: 3 },
  { order_id: 'ORD-28000', customer_name: 'Michael Thompson', order_date: '2025-01-15', status: 'Processing', total_amount: 189.50, items_count: 2 },
  { order_id: 'ORD-27999', customer_name: 'Sofia Martinez', order_date: '2025-01-14', status: 'Shipped', total_amount: 312.25, items_count: 4 },
  { order_id: 'ORD-27998', customer_name: 'James Chen', order_date: '2025-01-14', status: 'Shipped', total_amount: 156.00, items_count: 2 },
  { order_id: 'ORD-27997', customer_name: 'Olivia Brown', order_date: '2025-01-14', status: 'Delivered', total_amount: 428.75, items_count: 5 },
];

// Sample products for listing
export interface SampleProduct {
  product_id: string;
  sku: string;
  name: string;
  category: FashionCategory;
  price: number;
  quantity_on_hand: number;
  is_active: boolean;
}

export const SAMPLE_PRODUCTS: SampleProduct[] = [
  { product_id: 'p-001', sku: 'TS-DRS-FLR-M', name: 'Floral Midi Dress', category: 'Dresses', price: 89.99, quantity_on_hand: 45, is_active: true },
  { product_id: 'p-002', sku: 'TS-TOP-STR-S', name: 'Striped Cotton Tee', category: 'Tops', price: 29.99, quantity_on_hand: 120, is_active: true },
  { product_id: 'p-003', sku: 'TS-BOT-DNM-M', name: 'Classic Denim Jeans', category: 'Bottoms', price: 69.99, quantity_on_hand: 85, is_active: true },
  { product_id: 'p-004', sku: 'TS-SHO-SNK-9', name: 'White Leather Sneakers', category: 'Shoes', price: 89.99, quantity_on_hand: 32, is_active: true },
  { product_id: 'p-005', sku: 'TS-OUT-JKT-L', name: 'Denim Trucker Jacket', category: 'Outerwear', price: 119.99, quantity_on_hand: 28, is_active: true },
];

// All sample data combined
export const ECOMMERCE_DATA = {
  stats: DATASET_STATS,
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
