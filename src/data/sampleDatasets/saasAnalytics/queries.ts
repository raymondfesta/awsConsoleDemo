// SaaS Analytics Suggested Queries
// Pre-defined queries with natural language mappings

import type { SuggestedQuery, QueryResultColumn } from '../types';

export const SAAS_QUERIES: SuggestedQuery[] = [
  {
    id: 'mrr-by-plan',
    name: 'MRR by Plan',
    description: 'Monthly recurring revenue breakdown by subscription plan',
    naturalLanguage: 'Show MRR by plan',
    sql: `SELECT
  plan,
  COUNT(*) as accounts,
  SUM(mrr) as mrr,
  ROUND(SUM(mrr) * 100.0 / SUM(SUM(mrr)) OVER (), 1) as percentage,
  ROUND(AVG(mrr), 2) as avg_mrr
FROM accounts
WHERE plan IS NOT NULL
GROUP BY plan
ORDER BY mrr DESC;`,
    resultKey: 'mrrByPlan',
    category: 'Revenue',
  },
  {
    id: 'monthly-mrr',
    name: 'Monthly MRR Trend',
    description: 'MRR trend over the past 12 months',
    naturalLanguage: 'Show monthly MRR trend',
    sql: `SELECT
  DATE_TRUNC('month', created_at) as month,
  SUM(mrr) as mrr,
  SUM(CASE WHEN is_new THEN mrr ELSE 0 END) as new_mrr,
  SUM(CASE WHEN is_churned THEN mrr ELSE 0 END) as churned_mrr,
  SUM(expansion_mrr) as expansion_mrr
FROM subscription_events
GROUP BY DATE_TRUNC('month', created_at)
ORDER BY month;`,
    resultKey: 'monthlyMRR',
    category: 'Revenue',
  },
  {
    id: 'feature-adoption',
    name: 'Feature Adoption',
    description: 'Feature usage and adoption rates',
    naturalLanguage: 'Show feature adoption',
    sql: `SELECT
  f.feature_name,
  f.category,
  ROUND(COUNT(DISTINCT e.user_id) * 100.0 / total_users.cnt, 1) as adoption_rate,
  COUNT(DISTINCT CASE WHEN e.timestamp > NOW() - INTERVAL '7 days' THEN e.user_id END) as weekly_users,
  COUNT(CASE WHEN e.timestamp > NOW() - INTERVAL '30 days' THEN 1 END) as events_30d,
  f.min_plan
FROM features f
LEFT JOIN events e ON f.feature_name = e.feature_name
CROSS JOIN (SELECT COUNT(DISTINCT user_id) as cnt FROM users WHERE is_active) total_users
GROUP BY f.feature_name, f.category, f.min_plan, total_users.cnt
ORDER BY adoption_rate DESC;`,
    resultKey: 'featureAdoption',
    category: 'Product',
  },
  {
    id: 'top-accounts',
    name: 'Top Accounts by MRR',
    description: 'Highest value accounts',
    naturalLanguage: 'Show top accounts',
    sql: `SELECT
  account_id,
  company_name,
  plan,
  mrr,
  seats,
  health_score,
  created_at
FROM accounts
ORDER BY mrr DESC
LIMIT 10;`,
    resultKey: 'topAccounts',
    category: 'Accounts',
  },
  {
    id: 'engagement-metrics',
    name: 'Engagement by Plan',
    description: 'DAU/MAU and session metrics by plan',
    naturalLanguage: 'Show engagement metrics',
    sql: `SELECT
  a.plan,
  COUNT(DISTINCT CASE WHEN e.timestamp::date = CURRENT_DATE THEN e.user_id END) as dau,
  COUNT(DISTINCT CASE WHEN e.timestamp > NOW() - INTERVAL '7 days' THEN e.user_id END) as wau,
  COUNT(DISTINCT CASE WHEN e.timestamp > NOW() - INTERVAL '30 days' THEN e.user_id END) as mau,
  ROUND(dau * 100.0 / NULLIF(mau, 0), 1) as dau_mau_ratio,
  AVG(session_duration_min) as avg_session_min
FROM accounts a
JOIN users u ON a.account_id = u.account_id
LEFT JOIN events e ON u.user_id = e.user_id
GROUP BY a.plan;`,
    resultKey: 'engagementMetrics',
    category: 'Engagement',
  },
  {
    id: 'churn-risk',
    name: 'Churn Risk Accounts',
    description: 'Accounts at risk of churning',
    naturalLanguage: 'Show churn risk accounts',
    sql: `SELECT
  account_id,
  company_name,
  plan,
  mrr,
  health_score,
  DATE_PART('day', NOW() - last_active_at) as days_since_login,
  CASE
    WHEN health_score < 40 THEN 'high'
    WHEN health_score < 60 THEN 'medium'
    ELSE 'low'
  END as risk_level
FROM accounts
WHERE health_score < 70
ORDER BY health_score ASC
LIMIT 10;`,
    resultKey: 'churnRiskAccounts',
    category: 'Retention',
  },
  {
    id: 'sample-accounts',
    name: 'Account List',
    description: 'Sample of customer accounts',
    naturalLanguage: 'Show account list',
    sql: `SELECT
  account_id,
  company_name,
  plan,
  mrr,
  seats,
  health_score,
  industry
FROM accounts
ORDER BY mrr DESC
LIMIT 10;`,
    resultKey: 'sampleAccounts',
    category: 'Accounts',
  },
];

// Column definitions for query results
export const SAAS_QUERY_COLUMNS: Record<string, QueryResultColumn[]> = {
  mrrByPlan: [
    { key: 'plan', label: 'Plan', type: 'string' },
    { key: 'accounts', label: 'Accounts', type: 'number' },
    { key: 'mrr', label: 'MRR', type: 'currency' },
    { key: 'percentage', label: '% of Total', type: 'percentage' },
    { key: 'avg_mrr', label: 'Avg MRR', type: 'currency' },
  ],
  monthlyMRR: [
    { key: 'month_display', label: 'Month', type: 'string' },
    { key: 'mrr', label: 'MRR', type: 'currency' },
    { key: 'new_mrr', label: 'New', type: 'currency' },
    { key: 'churned_mrr', label: 'Churned', type: 'currency' },
    { key: 'expansion_mrr', label: 'Expansion', type: 'currency' },
    { key: 'net_mrr', label: 'Net', type: 'currency' },
  ],
  featureAdoption: [
    { key: 'feature_name', label: 'Feature', type: 'string' },
    { key: 'category', label: 'Category', type: 'string' },
    { key: 'adoption_rate', label: 'Adoption %', type: 'percentage' },
    { key: 'weekly_users', label: 'Weekly Users', type: 'number' },
    { key: 'events_30d', label: 'Events (30d)', type: 'number' },
    { key: 'min_plan', label: 'Min Plan', type: 'string' },
  ],
  topAccounts: [
    { key: 'company_name', label: 'Company', type: 'string' },
    { key: 'plan', label: 'Plan', type: 'string' },
    { key: 'mrr', label: 'MRR', type: 'currency' },
    { key: 'seats', label: 'Seats', type: 'number' },
    { key: 'health_score', label: 'Health', type: 'number' },
    { key: 'created_at', label: 'Created', type: 'date' },
  ],
  engagementMetrics: [
    { key: 'plan', label: 'Plan', type: 'string' },
    { key: 'dau', label: 'DAU', type: 'number' },
    { key: 'wau', label: 'WAU', type: 'number' },
    { key: 'mau', label: 'MAU', type: 'number' },
    { key: 'dau_mau_ratio', label: 'DAU/MAU %', type: 'percentage' },
    { key: 'avg_session_min', label: 'Avg Session', type: 'number' },
  ],
  churnRiskAccounts: [
    { key: 'company_name', label: 'Company', type: 'string' },
    { key: 'plan', label: 'Plan', type: 'string' },
    { key: 'mrr', label: 'MRR', type: 'currency' },
    { key: 'health_score', label: 'Health', type: 'number' },
    { key: 'days_since_login', label: 'Days Inactive', type: 'number' },
    { key: 'risk_level', label: 'Risk', type: 'status' },
  ],
  sampleAccounts: [
    { key: 'company_name', label: 'Company', type: 'string' },
    { key: 'plan', label: 'Plan', type: 'string' },
    { key: 'mrr', label: 'MRR', type: 'currency' },
    { key: 'seats', label: 'Seats', type: 'number' },
    { key: 'health_score', label: 'Health', type: 'number' },
    { key: 'industry', label: 'Industry', type: 'string' },
  ],
};
