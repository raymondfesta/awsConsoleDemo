// Financial Dataset Schema
// Banking & Transactions - Account and Transaction Analytics

import type { BaseSchema, TableDefinition, Relationship } from '../types';

// Transaction types
export const TRANSACTION_TYPES = ['debit', 'credit', 'transfer', 'payment', 'refund'] as const;
export type TransactionType = typeof TRANSACTION_TYPES[number];

// Account types
export const ACCOUNT_TYPES = ['checking', 'savings', 'credit', 'investment'] as const;
export type AccountType = typeof ACCOUNT_TYPES[number];

// Financial specific schema
export interface FinancialSchema extends BaseSchema {
  accountTypes: string[];
}

// Core tables
const TABLES: TableDefinition[] = [
  {
    name: 'accounts',
    displayName: 'Accounts',
    description: 'Customer bank accounts',
    category: 'Core',
    recordCount: 8000,
    columns: [
      { name: 'account_id', type: 'UUID', primaryKey: true, description: 'Unique account identifier' },
      { name: 'account_number', type: 'VARCHAR(20)', nullable: false, description: 'Account number' },
      { name: 'customer_id', type: 'UUID', description: 'Account owner' },
      { name: 'account_type', type: 'VARCHAR(50)', nullable: false, description: 'Account type' },
      { name: 'account_name', type: 'VARCHAR(100)', description: 'Account nickname' },
      { name: 'balance', type: 'DECIMAL(15,2)', nullable: false, description: 'Current balance' },
      { name: 'currency', type: 'VARCHAR(3)', default: "'USD'", description: 'Currency code' },
      { name: 'opened_date', type: 'DATE', description: 'Account open date' },
      { name: 'status', type: 'VARCHAR(20)', default: "'active'", description: 'Account status' },
      { name: 'interest_rate', type: 'DECIMAL(5,4)', nullable: true, description: 'Interest rate' },
    ],
  },
  {
    name: 'transactions',
    displayName: 'Transactions',
    description: 'Financial transactions',
    category: 'Core',
    recordCount: 200000,
    columns: [
      { name: 'transaction_id', type: 'UUID', primaryKey: true, description: 'Unique transaction identifier' },
      { name: 'account_id', type: 'UUID', foreignKey: 'accounts.account_id', description: 'Source account' },
      { name: 'transaction_date', type: 'TIMESTAMPTZ', nullable: false, description: 'Transaction timestamp' },
      { name: 'transaction_type', type: 'VARCHAR(50)', nullable: false, description: 'Transaction type' },
      { name: 'amount', type: 'DECIMAL(15,2)', nullable: false, description: 'Transaction amount' },
      { name: 'balance_after', type: 'DECIMAL(15,2)', description: 'Balance after transaction' },
      { name: 'merchant_id', type: 'UUID', foreignKey: 'merchants.merchant_id', nullable: true, description: 'Merchant' },
      { name: 'category_id', type: 'UUID', foreignKey: 'categories.category_id', nullable: true, description: 'Category' },
      { name: 'description', type: 'VARCHAR(255)', description: 'Transaction description' },
      { name: 'reference_number', type: 'VARCHAR(50)', description: 'Reference number' },
    ],
  },
  {
    name: 'categories',
    displayName: 'Categories',
    description: 'Transaction categories',
    category: 'Reference',
    recordCount: 50,
    columns: [
      { name: 'category_id', type: 'UUID', primaryKey: true, description: 'Unique category identifier' },
      { name: 'category_name', type: 'VARCHAR(100)', nullable: false, description: 'Category name' },
      { name: 'parent_category', type: 'VARCHAR(100)', nullable: true, description: 'Parent category' },
      { name: 'icon', type: 'VARCHAR(50)', description: 'Category icon' },
      { name: 'is_expense', type: 'BOOLEAN', default: 'true', description: 'Expense category flag' },
    ],
  },
  {
    name: 'merchants',
    displayName: 'Merchants',
    description: 'Merchant directory',
    category: 'Reference',
    recordCount: 5000,
    columns: [
      { name: 'merchant_id', type: 'UUID', primaryKey: true, description: 'Unique merchant identifier' },
      { name: 'merchant_name', type: 'VARCHAR(255)', nullable: false, description: 'Merchant name' },
      { name: 'category_id', type: 'UUID', foreignKey: 'categories.category_id', description: 'Default category' },
      { name: 'city', type: 'VARCHAR(100)', description: 'City' },
      { name: 'state', type: 'VARCHAR(50)', description: 'State' },
      { name: 'mcc_code', type: 'VARCHAR(10)', description: 'Merchant category code' },
    ],
  },
  {
    name: 'fraud_alerts',
    displayName: 'Fraud Alerts',
    description: 'Suspicious activity alerts',
    category: 'Security',
    recordCount: 500,
    columns: [
      { name: 'alert_id', type: 'UUID', primaryKey: true, description: 'Unique alert identifier' },
      { name: 'transaction_id', type: 'UUID', foreignKey: 'transactions.transaction_id', description: 'Flagged transaction' },
      { name: 'account_id', type: 'UUID', foreignKey: 'accounts.account_id', description: 'Account' },
      { name: 'alert_type', type: 'VARCHAR(100)', description: 'Type of alert' },
      { name: 'risk_score', type: 'INTEGER', description: 'Risk score (0-100)' },
      { name: 'detected_at', type: 'TIMESTAMPTZ', description: 'Detection timestamp' },
      { name: 'status', type: 'VARCHAR(50)', default: "'pending'", description: 'Alert status' },
      { name: 'resolved_at', type: 'TIMESTAMPTZ', nullable: true, description: 'Resolution timestamp' },
      { name: 'notes', type: 'TEXT', description: 'Investigation notes' },
    ],
  },
];

// Table relationships
const RELATIONSHIPS: Relationship[] = [
  {
    from: { table: 'transactions', column: 'account_id' },
    to: { table: 'accounts', column: 'account_id' },
    type: 'many-to-one',
    description: 'Each transaction belongs to one account',
  },
  {
    from: { table: 'transactions', column: 'merchant_id' },
    to: { table: 'merchants', column: 'merchant_id' },
    type: 'many-to-one',
    description: 'Each transaction may have one merchant',
  },
  {
    from: { table: 'transactions', column: 'category_id' },
    to: { table: 'categories', column: 'category_id' },
    type: 'many-to-one',
    description: 'Each transaction has one category',
  },
  {
    from: { table: 'fraud_alerts', column: 'transaction_id' },
    to: { table: 'transactions', column: 'transaction_id' },
    type: 'one-to-one',
    description: 'Each alert is for one transaction',
  },
];

// Complete schema
export const FINANCIAL_SCHEMA: FinancialSchema = {
  name: 'Banking & Transactions',
  description: 'Financial data with accounts, transactions, merchants, and fraud detection',
  totalRecords: TABLES.reduce((sum, t) => sum + t.recordCount, 0),
  categories: ['Core', 'Reference', 'Security'],
  accountTypes: [...ACCOUNT_TYPES],
  tables: TABLES,
  relationships: RELATIONSHIPS,
};
