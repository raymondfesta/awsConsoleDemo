// E-commerce Sample Dataset Schema
// TechStyle Fashion Retailer - Analytics Database Structure

export interface ColumnDefinition {
  name: string;
  type: string;
  primaryKey?: boolean;
  foreignKey?: string;
  nullable?: boolean;
  default?: string;
  description?: string;
}

export interface TableDefinition {
  name: string;
  displayName: string;
  description: string;
  columns: ColumnDefinition[];
  recordCount: number;
  category: 'Core' | 'Catalog' | 'Operations' | 'Analytics';
  icon?: string;
}

export interface Relationship {
  from: { table: string; column: string };
  to: { table: string; column: string };
  type: 'one-to-many' | 'many-to-one' | 'one-to-one' | 'many-to-many';
  description?: string;
}

export interface EcommerceSchema {
  name: string;
  description: string;
  tables: TableDefinition[];
  relationships: Relationship[];
  totalRecords: number;
  categories: string[];
}

// Fashion-specific product categories for TechStyle
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

// E-commerce Analytics Schema Definition
export const ECOMMERCE_SCHEMA: EcommerceSchema = {
  name: 'TechStyle E-commerce Analytics',
  description: 'Complete e-commerce database for fashion retail analytics with 50K+ monthly orders',
  totalRecords: 41847,
  categories: [...FASHION_CATEGORIES],

  tables: [
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
  ],

  relationships: [
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
  ],
};

// Reviews table (optional - can be removed during customization)
export const REVIEWS_TABLE: TableDefinition = {
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
};

export const REVIEWS_RELATIONSHIPS: Relationship[] = [
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

// Helper function to get schema with or without reviews
export function getSchemaWithOptions(includeReviews: boolean = true): EcommerceSchema {
  if (includeReviews) {
    return {
      ...ECOMMERCE_SCHEMA,
      tables: [...ECOMMERCE_SCHEMA.tables, REVIEWS_TABLE],
      relationships: [...ECOMMERCE_SCHEMA.relationships, ...REVIEWS_RELATIONSHIPS],
      totalRecords: ECOMMERCE_SCHEMA.totalRecords + REVIEWS_TABLE.recordCount,
    };
  }
  return ECOMMERCE_SCHEMA;
}

// Index recommendations for optimization
export interface IndexRecommendation {
  id: string;
  table: string;
  name: string;
  columns: string[];
  type: 'btree' | 'hash' | 'gin';
  reason: string;
  impact: 'High' | 'Medium' | 'Low';
  estimatedSpeedup: string;
  storageOverhead: string;
  sql: string;
}

export const OPTIMIZATION_RECOMMENDATIONS: IndexRecommendation[] = [
  {
    id: 'idx-orders-customer',
    table: 'orders',
    name: 'idx_orders_customer_id',
    columns: ['customer_id'],
    type: 'btree',
    reason: 'Speeds up customer order history lookups and lifetime value calculations',
    impact: 'High',
    estimatedSpeedup: '~10x faster for customer queries',
    storageOverhead: '~1.5 MB',
    sql: 'CREATE INDEX idx_orders_customer_id ON orders(customer_id);',
  },
  {
    id: 'idx-orders-date',
    table: 'orders',
    name: 'idx_orders_order_date',
    columns: ['order_date'],
    type: 'btree',
    reason: 'Improves time-range queries for revenue reports and trend analysis',
    impact: 'High',
    estimatedSpeedup: '~80% faster for date range queries',
    storageOverhead: '~2 MB',
    sql: 'CREATE INDEX idx_orders_order_date ON orders(order_date);',
  },
  {
    id: 'idx-order-items-order',
    table: 'order_items',
    name: 'idx_order_items_order_id',
    columns: ['order_id'],
    type: 'btree',
    reason: 'Accelerates order detail lookups and revenue calculations',
    impact: 'High',
    estimatedSpeedup: '~5x faster for order details',
    storageOverhead: '~3 MB',
    sql: 'CREATE INDEX idx_order_items_order_id ON order_items(order_id);',
  },
  {
    id: 'idx-order-items-product',
    table: 'order_items',
    name: 'idx_order_items_product_id',
    columns: ['product_id'],
    type: 'btree',
    reason: 'Speeds up product sales analysis and inventory planning',
    impact: 'Medium',
    estimatedSpeedup: '~4x faster for product analytics',
    storageOverhead: '~3 MB',
    sql: 'CREATE INDEX idx_order_items_product_id ON order_items(product_id);',
  },
  {
    id: 'idx-products-category',
    table: 'products',
    name: 'idx_products_category',
    columns: ['category'],
    type: 'btree',
    reason: 'Improves category-based product browsing and analytics',
    impact: 'Medium',
    estimatedSpeedup: '~3x faster for category queries',
    storageOverhead: '~0.5 MB',
    sql: 'CREATE INDEX idx_products_category ON products(category);',
  },
  {
    id: 'idx-inventory-quantity',
    table: 'inventory',
    name: 'idx_inventory_low_stock',
    columns: ['quantity_on_hand'],
    type: 'btree',
    reason: 'Enables fast low-stock alerts and inventory monitoring',
    impact: 'Medium',
    estimatedSpeedup: '~2x faster for inventory alerts',
    storageOverhead: '~0.5 MB',
    sql: 'CREATE INDEX idx_inventory_low_stock ON inventory(quantity_on_hand);',
  },
];

// Database configuration recommendations
export const DATABASE_RECOMMENDATIONS = {
  engine: 'Aurora PostgreSQL',
  engineVersion: '15.4',
  instanceClass: 'db.r6g.xlarge',
  storage: '100 GB',
  multiAZ: true,
  estimatedCost: '$450/month',
  rationale: {
    postgresql: [
      'Excellent for complex analytical queries with window functions and CTEs',
      'Superior JSON support for flexible product attributes',
      'Better handling of concurrent read operations from multiple analysts',
      'Advanced full-text search capabilities for product catalog',
    ],
    instanceSize: [
      '4 vCPUs and 32 GB RAM handles 50K monthly orders with headroom',
      'Graviton2 processors offer best price/performance ratio',
      'Suitable for analytical workloads with complex joins',
    ],
    multiAZ: [
      'Automatic failover ensures high availability',
      'Required for production analytics workloads',
      'Synchronous replication protects against data loss',
    ],
  },
};
