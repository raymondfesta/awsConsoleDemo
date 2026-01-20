// SaaS Analytics Dataset Schema
// B2B SaaS Platform - User and Revenue Analytics

import type { BaseSchema, TableDefinition, Relationship } from '../types';

// Subscription plans
export const SUBSCRIPTION_PLANS = ['free', 'starter', 'professional', 'enterprise'] as const;
export type SubscriptionPlan = typeof SUBSCRIPTION_PLANS[number];

// Event types
export const EVENT_TYPES = ['page_view', 'feature_used', 'api_call', 'export', 'integration'] as const;
export type EventType = typeof EVENT_TYPES[number];

// SaaS specific schema
export interface SaaSSchema extends BaseSchema {
  plans: string[];
}

// Core tables
const TABLES: TableDefinition[] = [
  {
    name: 'accounts',
    displayName: 'Accounts',
    description: 'Company accounts with subscription and billing info',
    category: 'Core',
    recordCount: 2000,
    columns: [
      { name: 'account_id', type: 'UUID', primaryKey: true, description: 'Unique account identifier' },
      { name: 'company_name', type: 'VARCHAR(255)', nullable: false, description: 'Company name' },
      { name: 'plan', type: 'VARCHAR(50)', nullable: false, description: 'Subscription plan' },
      { name: 'mrr', type: 'DECIMAL(10,2)', description: 'Monthly recurring revenue' },
      { name: 'seats', type: 'INTEGER', description: 'Number of user seats' },
      { name: 'industry', type: 'VARCHAR(100)', description: 'Industry vertical' },
      { name: 'created_at', type: 'TIMESTAMP', description: 'Account creation date' },
      { name: 'trial_ends_at', type: 'TIMESTAMP', nullable: true, description: 'Trial end date' },
      { name: 'health_score', type: 'INTEGER', description: 'Account health score (0-100)' },
      { name: 'csm_owner', type: 'VARCHAR(100)', description: 'Customer success manager' },
    ],
  },
  {
    name: 'users',
    displayName: 'Users',
    description: 'End users within company accounts',
    category: 'Core',
    recordCount: 15000,
    columns: [
      { name: 'user_id', type: 'UUID', primaryKey: true, description: 'Unique user identifier' },
      { name: 'account_id', type: 'UUID', foreignKey: 'accounts.account_id', description: 'Parent account' },
      { name: 'email', type: 'VARCHAR(255)', nullable: false, description: 'User email' },
      { name: 'full_name', type: 'VARCHAR(200)', description: 'User full name' },
      { name: 'role', type: 'VARCHAR(50)', description: 'User role (admin, member, viewer)' },
      { name: 'created_at', type: 'TIMESTAMP', description: 'User creation date' },
      { name: 'last_active_at', type: 'TIMESTAMP', description: 'Last activity timestamp' },
      { name: 'is_active', type: 'BOOLEAN', default: 'true', description: 'Active user flag' },
    ],
  },
  {
    name: 'events',
    displayName: 'Usage Events',
    description: 'Feature usage and activity events',
    category: 'Analytics',
    recordCount: 500000,
    columns: [
      { name: 'event_id', type: 'UUID', primaryKey: true, description: 'Unique event identifier' },
      { name: 'user_id', type: 'UUID', foreignKey: 'users.user_id', description: 'User who triggered event' },
      { name: 'account_id', type: 'UUID', foreignKey: 'accounts.account_id', description: 'Account context' },
      { name: 'event_type', type: 'VARCHAR(50)', nullable: false, description: 'Type of event' },
      { name: 'feature_name', type: 'VARCHAR(100)', description: 'Feature used' },
      { name: 'timestamp', type: 'TIMESTAMPTZ', nullable: false, description: 'Event timestamp' },
      { name: 'session_id', type: 'UUID', description: 'Session identifier' },
      { name: 'properties', type: 'JSONB', description: 'Additional event properties' },
    ],
  },
  {
    name: 'subscriptions',
    displayName: 'Subscriptions',
    description: 'Subscription history and billing',
    category: 'Billing',
    recordCount: 2500,
    columns: [
      { name: 'subscription_id', type: 'UUID', primaryKey: true, description: 'Unique subscription identifier' },
      { name: 'account_id', type: 'UUID', foreignKey: 'accounts.account_id', description: 'Account' },
      { name: 'plan', type: 'VARCHAR(50)', nullable: false, description: 'Plan name' },
      { name: 'status', type: 'VARCHAR(50)', description: 'Subscription status' },
      { name: 'started_at', type: 'TIMESTAMP', description: 'Subscription start date' },
      { name: 'ended_at', type: 'TIMESTAMP', nullable: true, description: 'Subscription end date' },
      { name: 'mrr', type: 'DECIMAL(10,2)', description: 'Monthly recurring revenue' },
      { name: 'billing_cycle', type: 'VARCHAR(20)', description: 'monthly or annual' },
    ],
  },
  {
    name: 'features',
    displayName: 'Features',
    description: 'Product features and adoption tracking',
    category: 'Product',
    recordCount: 50,
    columns: [
      { name: 'feature_id', type: 'UUID', primaryKey: true, description: 'Unique feature identifier' },
      { name: 'feature_name', type: 'VARCHAR(100)', nullable: false, description: 'Feature name' },
      { name: 'category', type: 'VARCHAR(50)', description: 'Feature category' },
      { name: 'description', type: 'TEXT', description: 'Feature description' },
      { name: 'min_plan', type: 'VARCHAR(50)', description: 'Minimum plan required' },
      { name: 'released_at', type: 'DATE', description: 'Release date' },
      { name: 'is_beta', type: 'BOOLEAN', default: 'false', description: 'Beta feature flag' },
    ],
  },
];

// Table relationships
const RELATIONSHIPS: Relationship[] = [
  {
    from: { table: 'users', column: 'account_id' },
    to: { table: 'accounts', column: 'account_id' },
    type: 'many-to-one',
    description: 'Each user belongs to one account',
  },
  {
    from: { table: 'events', column: 'user_id' },
    to: { table: 'users', column: 'user_id' },
    type: 'many-to-one',
    description: 'Each event is triggered by one user',
  },
  {
    from: { table: 'events', column: 'account_id' },
    to: { table: 'accounts', column: 'account_id' },
    type: 'many-to-one',
    description: 'Each event belongs to one account',
  },
  {
    from: { table: 'subscriptions', column: 'account_id' },
    to: { table: 'accounts', column: 'account_id' },
    type: 'many-to-one',
    description: 'Each subscription belongs to one account',
  },
];

// Complete schema
export const SAAS_SCHEMA: SaaSSchema = {
  name: 'B2B SaaS Analytics',
  description: 'SaaS platform analytics with accounts, users, usage events, and subscription data',
  totalRecords: TABLES.reduce((sum, t) => sum + t.recordCount, 0),
  categories: ['Core', 'Analytics', 'Billing', 'Product'],
  plans: [...SUBSCRIPTION_PLANS],
  tables: TABLES,
  relationships: RELATIONSHIPS,
};
