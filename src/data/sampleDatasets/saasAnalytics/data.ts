// SaaS Analytics Sample Data - Mock Records for Demo Queries
// Pre-computed results for instant display

import type { SubscriptionPlan } from './schema';

// Dataset summary statistics
export const DATASET_STATS = {
  totalAccounts: 2000,
  activeAccounts: 1850,
  totalUsers: 15000,
  activeUsers: 12500,
  totalMRR: 485000,
  totalARR: 5820000,
  avgMRR: 262,
  churnRate: 2.8,
  dateRange: {
    start: '2024-01-01',
    end: '2025-01-15',
  },
};

// MRR by plan
export interface MRRByPlan {
  plan: SubscriptionPlan;
  accounts: number;
  mrr: number;
  percentage: number;
  avg_mrr: number;
}

export const MRR_BY_PLAN: MRRByPlan[] = [
  { plan: 'enterprise', accounts: 150, mrr: 225000, percentage: 46.4, avg_mrr: 1500 },
  { plan: 'professional', accounts: 450, mrr: 157500, percentage: 32.5, avg_mrr: 350 },
  { plan: 'starter', accounts: 800, mrr: 80000, percentage: 16.5, avg_mrr: 100 },
  { plan: 'free', accounts: 600, mrr: 0, percentage: 0, avg_mrr: 0 },
];

// Monthly MRR trend
export interface MonthlyMRR {
  month: string;
  month_display: string;
  mrr: number;
  new_mrr: number;
  churned_mrr: number;
  expansion_mrr: number;
  net_mrr: number;
}

export const MONTHLY_MRR: MonthlyMRR[] = [
  { month: '2024-01', month_display: 'Jan 2024', mrr: 385000, new_mrr: 28000, churned_mrr: 12000, expansion_mrr: 8000, net_mrr: 24000 },
  { month: '2024-02', month_display: 'Feb 2024', mrr: 398000, new_mrr: 22000, churned_mrr: 9000, expansion_mrr: 5000, net_mrr: 18000 },
  { month: '2024-03', month_display: 'Mar 2024', mrr: 412000, new_mrr: 25000, churned_mrr: 11000, expansion_mrr: 6000, net_mrr: 20000 },
  { month: '2024-04', month_display: 'Apr 2024', mrr: 425000, new_mrr: 20000, churned_mrr: 7000, expansion_mrr: 4000, net_mrr: 17000 },
  { month: '2024-05', month_display: 'May 2024', mrr: 438000, new_mrr: 24000, churned_mrr: 11000, expansion_mrr: 7000, net_mrr: 20000 },
  { month: '2024-06', month_display: 'Jun 2024', mrr: 450000, new_mrr: 21000, churned_mrr: 9000, expansion_mrr: 5000, net_mrr: 17000 },
  { month: '2024-07', month_display: 'Jul 2024', mrr: 458000, new_mrr: 18000, churned_mrr: 10000, expansion_mrr: 4000, net_mrr: 12000 },
  { month: '2024-08', month_display: 'Aug 2024', mrr: 465000, new_mrr: 19000, churned_mrr: 12000, expansion_mrr: 6000, net_mrr: 13000 },
  { month: '2024-09', month_display: 'Sep 2024', mrr: 472000, new_mrr: 22000, churned_mrr: 15000, expansion_mrr: 8000, net_mrr: 15000 },
  { month: '2024-10', month_display: 'Oct 2024', mrr: 478000, new_mrr: 20000, churned_mrr: 14000, expansion_mrr: 7000, net_mrr: 13000 },
  { month: '2024-11', month_display: 'Nov 2024', mrr: 482000, new_mrr: 18000, churned_mrr: 14000, expansion_mrr: 5000, net_mrr: 9000 },
  { month: '2024-12', month_display: 'Dec 2024', mrr: 485000, new_mrr: 16000, churned_mrr: 13000, expansion_mrr: 4000, net_mrr: 7000 },
];

// Feature adoption
export interface FeatureAdoption {
  feature_name: string;
  category: string;
  adoption_rate: number;
  weekly_users: number;
  events_30d: number;
  min_plan: SubscriptionPlan;
}

export const FEATURE_ADOPTION: FeatureAdoption[] = [
  { feature_name: 'Dashboard', category: 'Core', adoption_rate: 98.5, weekly_users: 12300, events_30d: 450000, min_plan: 'free' },
  { feature_name: 'Reports', category: 'Analytics', adoption_rate: 87.2, weekly_users: 10900, events_30d: 125000, min_plan: 'starter' },
  { feature_name: 'API Access', category: 'Integration', adoption_rate: 45.8, weekly_users: 5700, events_30d: 85000, min_plan: 'professional' },
  { feature_name: 'Custom Exports', category: 'Analytics', adoption_rate: 62.3, weekly_users: 7800, events_30d: 42000, min_plan: 'starter' },
  { feature_name: 'Team Collaboration', category: 'Core', adoption_rate: 78.9, weekly_users: 9850, events_30d: 180000, min_plan: 'starter' },
  { feature_name: 'Advanced Analytics', category: 'Analytics', adoption_rate: 34.5, weekly_users: 4300, events_30d: 28000, min_plan: 'professional' },
  { feature_name: 'SSO Integration', category: 'Security', adoption_rate: 22.1, weekly_users: 2750, events_30d: 15000, min_plan: 'enterprise' },
  { feature_name: 'Custom Workflows', category: 'Automation', adoption_rate: 28.4, weekly_users: 3550, events_30d: 32000, min_plan: 'professional' },
];

// Top accounts by MRR
export interface TopAccount {
  account_id: string;
  company_name: string;
  plan: SubscriptionPlan;
  mrr: number;
  seats: number;
  health_score: number;
  created_at: string;
}

export const TOP_ACCOUNTS: TopAccount[] = [
  { account_id: 'acc-001', company_name: 'TechCorp Industries', plan: 'enterprise', mrr: 4500, seats: 250, health_score: 92, created_at: '2023-03-15' },
  { account_id: 'acc-002', company_name: 'Global Finance Ltd', plan: 'enterprise', mrr: 3800, seats: 180, health_score: 88, created_at: '2023-05-22' },
  { account_id: 'acc-003', company_name: 'Innovate Solutions', plan: 'enterprise', mrr: 3200, seats: 150, health_score: 95, created_at: '2023-02-10' },
  { account_id: 'acc-004', company_name: 'DataDriven Co', plan: 'enterprise', mrr: 2800, seats: 120, health_score: 85, created_at: '2023-07-18' },
  { account_id: 'acc-005', company_name: 'CloudFirst Inc', plan: 'enterprise', mrr: 2500, seats: 100, health_score: 90, created_at: '2023-04-25' },
  { account_id: 'acc-006', company_name: 'Agile Systems', plan: 'professional', mrr: 850, seats: 45, health_score: 78, created_at: '2023-08-12' },
  { account_id: 'acc-007', company_name: 'Smart Analytics', plan: 'professional', mrr: 700, seats: 35, health_score: 82, created_at: '2023-09-05' },
  { account_id: 'acc-008', company_name: 'Digital Ventures', plan: 'professional', mrr: 600, seats: 28, health_score: 75, created_at: '2023-10-20' },
];

// DAU/MAU by plan
export interface EngagementMetrics {
  plan: SubscriptionPlan;
  dau: number;
  wau: number;
  mau: number;
  dau_mau_ratio: number;
  avg_session_min: number;
}

export const ENGAGEMENT_METRICS: EngagementMetrics[] = [
  { plan: 'enterprise', dau: 2800, wau: 4200, mau: 4500, dau_mau_ratio: 62.2, avg_session_min: 45 },
  { plan: 'professional', dau: 3200, wau: 4800, mau: 5200, dau_mau_ratio: 61.5, avg_session_min: 38 },
  { plan: 'starter', dau: 2400, wau: 3600, mau: 4100, dau_mau_ratio: 58.5, avg_session_min: 25 },
  { plan: 'free', dau: 1800, wau: 2800, mau: 3500, dau_mau_ratio: 51.4, avg_session_min: 12 },
];

// Churn risk accounts
export interface ChurnRiskAccount {
  account_id: string;
  company_name: string;
  plan: SubscriptionPlan;
  mrr: number;
  health_score: number;
  days_since_login: number;
  risk_level: 'high' | 'medium' | 'low';
}

export const CHURN_RISK_ACCOUNTS: ChurnRiskAccount[] = [
  { account_id: 'acc-101', company_name: 'Legacy Systems Inc', plan: 'professional', mrr: 450, health_score: 32, days_since_login: 28, risk_level: 'high' },
  { account_id: 'acc-102', company_name: 'Old School Tech', plan: 'starter', mrr: 100, health_score: 38, days_since_login: 21, risk_level: 'high' },
  { account_id: 'acc-103', company_name: 'Sunset Corp', plan: 'professional', mrr: 350, health_score: 45, days_since_login: 14, risk_level: 'medium' },
  { account_id: 'acc-104', company_name: 'Quiet Partners', plan: 'starter', mrr: 100, health_score: 52, days_since_login: 12, risk_level: 'medium' },
  { account_id: 'acc-105', company_name: 'Slow Movers LLC', plan: 'professional', mrr: 350, health_score: 58, days_since_login: 7, risk_level: 'low' },
];

// Sample accounts for listing
export interface SampleAccount {
  account_id: string;
  company_name: string;
  plan: SubscriptionPlan;
  mrr: number;
  seats: number;
  health_score: number;
  industry: string;
}

export const SAMPLE_ACCOUNTS: SampleAccount[] = [
  { account_id: 'acc-001', company_name: 'TechCorp Industries', plan: 'enterprise', mrr: 4500, seats: 250, health_score: 92, industry: 'Technology' },
  { account_id: 'acc-002', company_name: 'Global Finance Ltd', plan: 'enterprise', mrr: 3800, seats: 180, health_score: 88, industry: 'Finance' },
  { account_id: 'acc-003', company_name: 'Innovate Solutions', plan: 'professional', mrr: 850, seats: 45, health_score: 95, industry: 'Consulting' },
  { account_id: 'acc-004', company_name: 'StartupXYZ', plan: 'starter', mrr: 100, seats: 8, health_score: 75, industry: 'Technology' },
  { account_id: 'acc-005', company_name: 'FreeUser Co', plan: 'free', mrr: 0, seats: 3, health_score: 60, industry: 'Marketing' },
];

// All sample data combined
export const SAAS_DATA = {
  stats: DATASET_STATS,
  mrrByPlan: MRR_BY_PLAN,
  monthlyMRR: MONTHLY_MRR,
  featureAdoption: FEATURE_ADOPTION,
  topAccounts: TOP_ACCOUNTS,
  engagementMetrics: ENGAGEMENT_METRICS,
  churnRiskAccounts: CHURN_RISK_ACCOUNTS,
  sampleAccounts: SAMPLE_ACCOUNTS,
};
