// Financial Suggested Queries
// Pre-defined queries with natural language mappings

import type { SuggestedQuery, QueryResultColumn } from '../types';

export const FINANCIAL_QUERIES: SuggestedQuery[] = [
  {
    id: 'spending-by-category',
    name: 'Spending by Category',
    description: 'Total spending breakdown by category',
    naturalLanguage: 'Show spending by category',
    sql: `SELECT
  c.category_name,
  SUM(ABS(t.amount)) as total_amount,
  COUNT(*) as transaction_count,
  ROUND(SUM(ABS(t.amount)) * 100.0 / SUM(SUM(ABS(t.amount))) OVER (), 1) as percentage,
  ROUND(AVG(ABS(t.amount)), 2) as avg_transaction
FROM transactions t
JOIN categories c ON t.category_id = c.category_id
WHERE t.transaction_type = 'debit'
GROUP BY c.category_name
ORDER BY total_amount DESC;`,
    resultKey: 'spendingByCategory',
    category: 'Spending',
  },
  {
    id: 'monthly-volume',
    name: 'Monthly Transaction Volume',
    description: 'Transaction volume trend over time',
    naturalLanguage: 'Show monthly transactions',
    sql: `SELECT
  DATE_TRUNC('month', transaction_date) as month,
  COUNT(*) as transaction_count,
  SUM(CASE WHEN transaction_type = 'debit' THEN ABS(amount) ELSE 0 END) as total_debits,
  SUM(CASE WHEN transaction_type = 'credit' THEN amount ELSE 0 END) as total_credits,
  SUM(CASE WHEN transaction_type = 'credit' THEN amount ELSE -ABS(amount) END) as net_flow
FROM transactions
GROUP BY DATE_TRUNC('month', transaction_date)
ORDER BY month;`,
    resultKey: 'monthlyVolume',
    category: 'Analytics',
  },
  {
    id: 'balance-by-type',
    name: 'Balance by Account Type',
    description: 'Total balance across account types',
    naturalLanguage: 'Show balance by account type',
    sql: `SELECT
  account_type,
  COUNT(*) as account_count,
  SUM(balance) as total_balance,
  ROUND(AVG(balance), 2) as avg_balance,
  ROUND(SUM(balance) * 100.0 / SUM(SUM(balance)) OVER (), 1) as percentage
FROM accounts
GROUP BY account_type
ORDER BY total_balance DESC;`,
    resultKey: 'balanceByType',
    category: 'Accounts',
  },
  {
    id: 'top-merchants',
    name: 'Top Merchants',
    description: 'Merchants with highest transaction volume',
    naturalLanguage: 'Show top merchants',
    sql: `SELECT
  m.merchant_id,
  m.merchant_name,
  c.category_name as category,
  COUNT(t.transaction_id) as transaction_count,
  SUM(ABS(t.amount)) as total_amount,
  ROUND(AVG(ABS(t.amount)), 2) as avg_transaction
FROM merchants m
JOIN transactions t ON m.merchant_id = t.merchant_id
JOIN categories c ON m.category_id = c.category_id
GROUP BY m.merchant_id, m.merchant_name, c.category_name
ORDER BY transaction_count DESC
LIMIT 10;`,
    resultKey: 'topMerchants',
    category: 'Merchants',
  },
  {
    id: 'fraud-alerts',
    name: 'Fraud Alert Summary',
    description: 'Summary of fraud alerts by type',
    naturalLanguage: 'Show fraud alerts',
    sql: `SELECT
  alert_type,
  COUNT(*) as count,
  SUM(t.amount) as total_amount,
  ROUND(AVG(risk_score)) as avg_risk_score,
  SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending,
  SUM(CASE WHEN status = 'confirmed' THEN 1 ELSE 0 END) as confirmed
FROM fraud_alerts f
JOIN transactions t ON f.transaction_id = t.transaction_id
GROUP BY alert_type
ORDER BY count DESC;`,
    resultKey: 'fraudAlertSummary',
    category: 'Security',
  },
  {
    id: 'recent-transactions',
    name: 'Recent Transactions',
    description: 'Latest transactions across accounts',
    naturalLanguage: 'Show recent transactions',
    sql: `SELECT
  t.transaction_id,
  CONCAT('****', RIGHT(a.account_number, 4)) as account_number,
  t.transaction_date,
  COALESCE(m.merchant_name, t.description) as merchant_name,
  c.category_name as category,
  t.amount,
  t.transaction_type
FROM transactions t
JOIN accounts a ON t.account_id = a.account_id
LEFT JOIN merchants m ON t.merchant_id = m.merchant_id
LEFT JOIN categories c ON t.category_id = c.category_id
ORDER BY t.transaction_date DESC
LIMIT 10;`,
    resultKey: 'recentTransactions',
    category: 'Transactions',
  },
  {
    id: 'sample-accounts',
    name: 'Account List',
    description: 'Sample of customer accounts',
    naturalLanguage: 'Show account list',
    sql: `SELECT
  account_id,
  CONCAT('****', RIGHT(account_number, 4)) as account_number,
  account_type,
  account_name,
  balance,
  status
FROM accounts
ORDER BY balance DESC
LIMIT 10;`,
    resultKey: 'sampleAccounts',
    category: 'Accounts',
  },
];

// Column definitions for query results
export const FINANCIAL_QUERY_COLUMNS: Record<string, QueryResultColumn[]> = {
  spendingByCategory: [
    { key: 'category_name', label: 'Category', type: 'string' },
    { key: 'total_amount', label: 'Total', type: 'currency' },
    { key: 'transaction_count', label: 'Transactions', type: 'number' },
    { key: 'percentage', label: '% of Total', type: 'percentage' },
    { key: 'avg_transaction', label: 'Avg Transaction', type: 'currency' },
  ],
  monthlyVolume: [
    { key: 'month_display', label: 'Month', type: 'string' },
    { key: 'transaction_count', label: 'Transactions', type: 'number' },
    { key: 'total_debits', label: 'Debits', type: 'currency' },
    { key: 'total_credits', label: 'Credits', type: 'currency' },
    { key: 'net_flow', label: 'Net Flow', type: 'currency' },
  ],
  balanceByType: [
    { key: 'account_type', label: 'Type', type: 'string' },
    { key: 'account_count', label: 'Accounts', type: 'number' },
    { key: 'total_balance', label: 'Total Balance', type: 'currency' },
    { key: 'avg_balance', label: 'Avg Balance', type: 'currency' },
    { key: 'percentage', label: '% of Total', type: 'percentage' },
  ],
  topMerchants: [
    { key: 'merchant_name', label: 'Merchant', type: 'string' },
    { key: 'category', label: 'Category', type: 'string' },
    { key: 'transaction_count', label: 'Transactions', type: 'number' },
    { key: 'total_amount', label: 'Total', type: 'currency' },
    { key: 'avg_transaction', label: 'Avg Transaction', type: 'currency' },
  ],
  fraudAlertSummary: [
    { key: 'alert_type', label: 'Alert Type', type: 'string' },
    { key: 'count', label: 'Count', type: 'number' },
    { key: 'total_amount', label: 'Amount', type: 'currency' },
    { key: 'avg_risk_score', label: 'Avg Risk', type: 'number' },
    { key: 'pending', label: 'Pending', type: 'number' },
    { key: 'confirmed', label: 'Confirmed', type: 'number' },
  ],
  recentTransactions: [
    { key: 'account_number', label: 'Account', type: 'string' },
    { key: 'transaction_date', label: 'Date', type: 'date' },
    { key: 'merchant_name', label: 'Merchant', type: 'string' },
    { key: 'category', label: 'Category', type: 'string' },
    { key: 'amount', label: 'Amount', type: 'currency' },
    { key: 'transaction_type', label: 'Type', type: 'string' },
  ],
  sampleAccounts: [
    { key: 'account_number', label: 'Account', type: 'string' },
    { key: 'account_type', label: 'Type', type: 'string' },
    { key: 'account_name', label: 'Name', type: 'string' },
    { key: 'balance', label: 'Balance', type: 'currency' },
    { key: 'status', label: 'Status', type: 'status' },
  ],
};
