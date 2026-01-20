// E-commerce Sample Dataset Schema
// TechStyle Fashion Retailer - Analytics Database Structure

import type { BaseSchema, TableDefinition, Relationship } from '../types';

// Fashion-specific product categories
export const FASHION_CATEGORIES = [
  'Tops',
  'Bottoms',
  'Dresses',
  'Outerwear',
  'Accessories',
  'Shoes',
  'Jewelry',
] as const;

export type FashionCategory = typeof FASHION_CATEGORIES[number];

// E-commerce specific schema extending base
export interface EcommerceSchema extends BaseSchema {
  categories: string[];
}

// Core tables
const TABLES: TableDefinition[] = [
  {
    name: 'customers',
    displayName: 'Customers',
    description: 'Customer profiles with contact info and lifetime metrics',
    category: 'Core',
    recordCount: 8500,
    columns: [
      { name: 'customer_id', type: 'UUID', primaryKey: true, description: 'Unique customer identifier' },
      { name: 'email', type: 'VARCHAR(255)', nullable: false, description: 'Customer email address' },
      { name: 'first_name', type: 'VARCHAR(100)', description: 'First name' },
      { name: 'last_name', type: 'VARCHAR(100)', description: 'Last name' },
      { name: 'phone', type: 'VARCHAR(20)', nullable: true, description: 'Phone number' },
      { name: 'created_at', type: 'TIMESTAMP', default: 'NOW()', description: 'Account creation date' },
      { name: 'lifetime_value', type: 'DECIMAL(10,2)', default: '0.00', description: 'Total spend to date' },
      { name: 'order_count', type: 'INTEGER', default: '0', description: 'Number of orders placed' },
      { name: 'last_order_date', type: 'TIMESTAMP', nullable: true, description: 'Most recent order date' },
    ],
  },
  {
    name: 'orders',
    displayName: 'Orders',
    description: 'Transaction records with status and totals',
    category: 'Core',
    recordCount: 28000,
    columns: [
      { name: 'order_id', type: 'UUID', primaryKey: true, description: 'Unique order identifier' },
      { name: 'customer_id', type: 'UUID', foreignKey: 'customers.customer_id', description: 'Customer who placed order' },
      { name: 'order_date', type: 'TIMESTAMP', nullable: false, description: 'When order was placed' },
      { name: 'status', type: 'VARCHAR(50)', nullable: false, description: 'Order status (pending, shipped, delivered, cancelled)' },
      { name: 'subtotal', type: 'DECIMAL(10,2)', description: 'Order subtotal before tax/shipping' },
      { name: 'tax_amount', type: 'DECIMAL(10,2)', description: 'Tax amount' },
      { name: 'shipping_cost', type: 'DECIMAL(10,2)', description: 'Shipping cost' },
      { name: 'total_amount', type: 'DECIMAL(10,2)', description: 'Final order total' },
      { name: 'shipping_address_id', type: 'UUID', foreignKey: 'shipping.address_id', description: 'Delivery address' },
      { name: 'payment_method', type: 'VARCHAR(50)', description: 'Payment method used' },
    ],
  },
  {
    name: 'products',
    displayName: 'Products',
    description: 'Product catalog with pricing and categories',
    category: 'Catalog',
    recordCount: 1200,
    columns: [
      { name: 'product_id', type: 'UUID', primaryKey: true, description: 'Unique product identifier' },
      { name: 'sku', type: 'VARCHAR(50)', nullable: false, description: 'Stock keeping unit' },
      { name: 'name', type: 'VARCHAR(255)', nullable: false, description: 'Product name' },
      { name: 'category', type: 'VARCHAR(100)', nullable: false, description: 'Fashion category' },
      { name: 'price', type: 'DECIMAL(10,2)', nullable: false, description: 'Current selling price' },
      { name: 'cost', type: 'DECIMAL(10,2)', description: 'Cost of goods' },
      { name: 'description', type: 'TEXT', description: 'Product description' },
      { name: 'brand', type: 'VARCHAR(100)', description: 'Brand name' },
      { name: 'created_at', type: 'TIMESTAMP', default: 'NOW()', description: 'When product was added' },
      { name: 'is_active', type: 'BOOLEAN', default: 'true', description: 'Whether product is available for sale' },
    ],
  },
  {
    name: 'order_items',
    displayName: 'Order Items',
    description: 'Line items connecting orders to products',
    category: 'Core',
    recordCount: 52000,
    columns: [
      { name: 'item_id', type: 'UUID', primaryKey: true, description: 'Unique line item identifier' },
      { name: 'order_id', type: 'UUID', foreignKey: 'orders.order_id', description: 'Parent order' },
      { name: 'product_id', type: 'UUID', foreignKey: 'products.product_id', description: 'Product purchased' },
      { name: 'quantity', type: 'INTEGER', nullable: false, description: 'Quantity ordered' },
      { name: 'unit_price', type: 'DECIMAL(10,2)', nullable: false, description: 'Price per unit at time of order' },
      { name: 'discount_amount', type: 'DECIMAL(10,2)', default: '0.00', description: 'Discount applied' },
      { name: 'line_total', type: 'DECIMAL(10,2)', description: 'Total for this line item' },
    ],
  },
  {
    name: 'inventory',
    displayName: 'Inventory',
    description: 'Stock levels and warehouse locations',
    category: 'Operations',
    recordCount: 1200,
    columns: [
      { name: 'inventory_id', type: 'UUID', primaryKey: true, description: 'Unique inventory record identifier' },
      { name: 'product_id', type: 'UUID', foreignKey: 'products.product_id', description: 'Product being tracked' },
      { name: 'quantity_on_hand', type: 'INTEGER', nullable: false, description: 'Current stock level' },
      { name: 'quantity_reserved', type: 'INTEGER', default: '0', description: 'Reserved for pending orders' },
      { name: 'reorder_point', type: 'INTEGER', default: '10', description: 'When to trigger reorder' },
      { name: 'warehouse_location', type: 'VARCHAR(100)', description: 'Physical location' },
      { name: 'last_restocked', type: 'TIMESTAMP', description: 'Last restock date' },
      { name: 'last_updated', type: 'TIMESTAMP', default: 'NOW()', description: 'Last inventory update' },
    ],
  },
  {
    name: 'shipping',
    displayName: 'Shipping Addresses',
    description: 'Customer shipping addresses',
    category: 'Operations',
    recordCount: 9500,
    columns: [
      { name: 'address_id', type: 'UUID', primaryKey: true, description: 'Unique address identifier' },
      { name: 'customer_id', type: 'UUID', foreignKey: 'customers.customer_id', description: 'Customer who owns this address' },
      { name: 'label', type: 'VARCHAR(50)', description: 'Address label (Home, Work, etc.)' },
      { name: 'street_address', type: 'VARCHAR(255)', nullable: false, description: 'Street address' },
      { name: 'city', type: 'VARCHAR(100)', nullable: false, description: 'City' },
      { name: 'state', type: 'VARCHAR(50)', nullable: false, description: 'State/Province' },
      { name: 'postal_code', type: 'VARCHAR(20)', nullable: false, description: 'ZIP/Postal code' },
      { name: 'country', type: 'VARCHAR(100)', default: "'USA'", description: 'Country' },
      { name: 'is_default', type: 'BOOLEAN', default: 'false', description: 'Is this the default address' },
    ],
  },
  {
    name: 'reviews',
    displayName: 'Reviews',
    description: 'Customer product reviews and ratings',
    category: 'Analytics',
    recordCount: 15000,
    columns: [
      { name: 'review_id', type: 'UUID', primaryKey: true, description: 'Unique review identifier' },
      { name: 'product_id', type: 'UUID', foreignKey: 'products.product_id', description: 'Product being reviewed' },
      { name: 'customer_id', type: 'UUID', foreignKey: 'customers.customer_id', description: 'Customer who wrote review' },
      { name: 'rating', type: 'INTEGER', nullable: false, description: 'Rating 1-5 stars' },
      { name: 'title', type: 'VARCHAR(255)', description: 'Review title' },
      { name: 'comment', type: 'TEXT', description: 'Review text' },
      { name: 'is_verified_purchase', type: 'BOOLEAN', default: 'false', description: 'Verified purchaser' },
      { name: 'helpful_votes', type: 'INTEGER', default: '0', description: 'Number of helpful votes' },
      { name: 'created_at', type: 'TIMESTAMP', default: 'NOW()', description: 'When review was posted' },
    ],
  },
];

// Table relationships
const RELATIONSHIPS: Relationship[] = [
  {
    from: { table: 'orders', column: 'customer_id' },
    to: { table: 'customers', column: 'customer_id' },
    type: 'many-to-one',
    description: 'Each order belongs to one customer',
  },
  {
    from: { table: 'orders', column: 'shipping_address_id' },
    to: { table: 'shipping', column: 'address_id' },
    type: 'many-to-one',
    description: 'Each order ships to one address',
  },
  {
    from: { table: 'order_items', column: 'order_id' },
    to: { table: 'orders', column: 'order_id' },
    type: 'many-to-one',
    description: 'Each order has multiple line items',
  },
  {
    from: { table: 'order_items', column: 'product_id' },
    to: { table: 'products', column: 'product_id' },
    type: 'many-to-one',
    description: 'Each line item references one product',
  },
  {
    from: { table: 'inventory', column: 'product_id' },
    to: { table: 'products', column: 'product_id' },
    type: 'one-to-one',
    description: 'Each product has one inventory record',
  },
  {
    from: { table: 'shipping', column: 'customer_id' },
    to: { table: 'customers', column: 'customer_id' },
    type: 'many-to-one',
    description: 'Each customer can have multiple addresses',
  },
  {
    from: { table: 'reviews', column: 'product_id' },
    to: { table: 'products', column: 'product_id' },
    type: 'many-to-one',
    description: 'Each product can have multiple reviews',
  },
  {
    from: { table: 'reviews', column: 'customer_id' },
    to: { table: 'customers', column: 'customer_id' },
    type: 'many-to-one',
    description: 'Each customer can write multiple reviews',
  },
];

// Complete schema
export const ECOMMERCE_SCHEMA: EcommerceSchema = {
  name: 'TechStyle E-commerce Analytics',
  description: 'Complete e-commerce database for fashion retail analytics with 50K+ monthly orders',
  totalRecords: TABLES.reduce((sum, t) => sum + t.recordCount, 0),
  categories: [...FASHION_CATEGORIES],
  tables: TABLES,
  relationships: RELATIONSHIPS,
};
