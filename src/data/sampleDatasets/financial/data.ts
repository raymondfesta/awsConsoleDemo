// Financial Sample Data - Mock Records for Demo Queries
// Pre-computed results for instant display

import type { TransactionType, AccountType } from './schema';

// Dataset summary statistics
export const DATASET_STATS = {
  totalAccounts: 8000,
  activeAccounts: 7500,
  totalTransactions: 200000,
  totalBalance: 125000000,
  avgBalance: 15625,
  fraudAlerts: 500,
  fraudRate: 0.25,
  dateRange: {
    start: '2024-01-01',
    end: '2025-01-15',
  },
};

// Spending by category
export interface SpendingByCategory {
  category_name: string;
  total_amount: number;
  transaction_count: number;
  percentage: number;
  avg_transaction: number;
}

export const SPENDING_BY_CATEGORY: SpendingByCategory[] = [
  { category_name: 'Groceries', total_amount: 2850000, transaction_count: 45000, percentage: 18.5, avg_transaction: 63.33 },
  { category_name: 'Restaurants', total_amount: 1980000, transaction_count: 32000, percentage: 12.8, avg_transaction: 61.88 },
  { category_name: 'Shopping', total_amount: 2450000, transaction_count: 28000, percentage: 15.9, avg_transaction: 87.50 },
  { category_name: 'Transportation', total_amount: 1650000, transaction_count: 22000, percentage: 10.7, avg_transaction: 75.00 },
  { category_name: 'Utilities', total_amount: 1200000, transaction_count: 15000, percentage: 7.8, avg_transaction: 80.00 },
  { category_name: 'Entertainment', total_amount: 980000, transaction_count: 18000, percentage: 6.4, avg_transaction: 54.44 },
  { category_name: 'Healthcare', total_amount: 1450000, transaction_count: 12000, percentage: 9.4, avg_transaction: 120.83 },
  { category_name: 'Travel', total_amount: 1850000, transaction_count: 8000, percentage: 12.0, avg_transaction: 231.25 },
  { category_name: 'Other', total_amount: 990000, transaction_count: 20000, percentage: 6.4, avg_transaction: 49.50 },
];

// Monthly transaction volume
export interface MonthlyVolume {
  month: string;
  month_display: string;
  transaction_count: number;
  total_debits: number;
  total_credits: number;
  net_flow: number;
}

export const MONTHLY_VOLUME: MonthlyVolume[] = [
  { month: '2024-01', month_display: 'Jan 2024', transaction_count: 15500, total_debits: 1150000, total_credits: 1280000, net_flow: 130000 },
  { month: '2024-02', month_display: 'Feb 2024', transaction_count: 14800, total_debits: 1080000, total_credits: 1220000, net_flow: 140000 },
  { month: '2024-03', month_display: 'Mar 2024', transaction_count: 16200, total_debits: 1200000, total_credits: 1350000, net_flow: 150000 },
  { month: '2024-04', month_display: 'Apr 2024', transaction_count: 15900, total_debits: 1180000, total_credits: 1300000, net_flow: 120000 },
  { month: '2024-05', month_display: 'May 2024', transaction_count: 16500, total_debits: 1220000, total_credits: 1380000, net_flow: 160000 },
  { month: '2024-06', month_display: 'Jun 2024', transaction_count: 17200, total_debits: 1280000, total_credits: 1420000, net_flow: 140000 },
  { month: '2024-07', month_display: 'Jul 2024', transaction_count: 17800, total_debits: 1320000, total_credits: 1450000, net_flow: 130000 },
  { month: '2024-08', month_display: 'Aug 2024', transaction_count: 16900, total_debits: 1250000, total_credits: 1400000, net_flow: 150000 },
  { month: '2024-09', month_display: 'Sep 2024', transaction_count: 17500, total_debits: 1300000, total_credits: 1480000, net_flow: 180000 },
  { month: '2024-10', month_display: 'Oct 2024', transaction_count: 18200, total_debits: 1350000, total_credits: 1520000, net_flow: 170000 },
  { month: '2024-11', month_display: 'Nov 2024', transaction_count: 19500, total_debits: 1450000, total_credits: 1580000, net_flow: 130000 },
  { month: '2024-12', month_display: 'Dec 2024', transaction_count: 21000, total_debits: 1580000, total_credits: 1650000, net_flow: 70000 },
];

// Account balances by type
export interface BalanceByType {
  account_type: AccountType;
  account_count: number;
  total_balance: number;
  avg_balance: number;
  percentage: number;
}

export const BALANCE_BY_TYPE: BalanceByType[] = [
  { account_type: 'checking', account_count: 3200, total_balance: 28000000, avg_balance: 8750, percentage: 22.4 },
  { account_type: 'savings', account_count: 2800, total_balance: 52000000, avg_balance: 18571, percentage: 41.6 },
  { account_type: 'credit', account_count: 1500, total_balance: -8500000, avg_balance: -5667, percentage: -6.8 },
  { account_type: 'investment', account_count: 500, total_balance: 53500000, avg_balance: 107000, percentage: 42.8 },
];

// Top merchants by volume
export interface TopMerchant {
  merchant_id: string;
  merchant_name: string;
  category: string;
  transaction_count: number;
  total_amount: number;
  avg_transaction: number;
}

export const TOP_MERCHANTS: TopMerchant[] = [
  { merchant_id: 'merch-001', merchant_name: 'Whole Foods Market', category: 'Groceries', transaction_count: 8500, total_amount: 680000, avg_transaction: 80.00 },
  { merchant_id: 'merch-002', merchant_name: 'Amazon.com', category: 'Shopping', transaction_count: 7200, total_amount: 720000, avg_transaction: 100.00 },
  { merchant_id: 'merch-003', merchant_name: 'Shell Gas Station', category: 'Transportation', transaction_count: 6800, total_amount: 340000, avg_transaction: 50.00 },
  { merchant_id: 'merch-004', merchant_name: 'Starbucks', category: 'Restaurants', transaction_count: 6500, total_amount: 52000, avg_transaction: 8.00 },
  { merchant_id: 'merch-005', merchant_name: 'Target', category: 'Shopping', transaction_count: 5200, total_amount: 312000, avg_transaction: 60.00 },
  { merchant_id: 'merch-006', merchant_name: 'Uber', category: 'Transportation', transaction_count: 4800, total_amount: 144000, avg_transaction: 30.00 },
  { merchant_id: 'merch-007', merchant_name: 'Netflix', category: 'Entertainment', transaction_count: 4500, total_amount: 72000, avg_transaction: 16.00 },
  { merchant_id: 'merch-008', merchant_name: 'Costco', category: 'Groceries', transaction_count: 3800, total_amount: 532000, avg_transaction: 140.00 },
];

// Fraud alerts summary
export interface FraudAlertSummary {
  alert_type: string;
  count: number;
  total_amount: number;
  avg_risk_score: number;
  pending: number;
  confirmed: number;
}

export const FRAUD_ALERT_SUMMARY: FraudAlertSummary[] = [
  { alert_type: 'Unusual Location', count: 180, total_amount: 245000, avg_risk_score: 75, pending: 45, confirmed: 85 },
  { alert_type: 'Large Transaction', count: 120, total_amount: 890000, avg_risk_score: 68, pending: 30, confirmed: 52 },
  { alert_type: 'Rapid Transactions', count: 95, total_amount: 125000, avg_risk_score: 82, pending: 25, confirmed: 48 },
  { alert_type: 'New Merchant', count: 65, total_amount: 85000, avg_risk_score: 55, pending: 20, confirmed: 18 },
  { alert_type: 'Card Not Present', count: 40, total_amount: 52000, avg_risk_score: 72, pending: 12, confirmed: 22 },
];

// Recent transactions
export interface RecentTransaction {
  transaction_id: string;
  account_number: string;
  transaction_date: string;
  merchant_name: string;
  category: string;
  amount: number;
  transaction_type: TransactionType;
}

export const RECENT_TRANSACTIONS: RecentTransaction[] = [
  { transaction_id: 'txn-001', account_number: '****4521', transaction_date: '2025-01-15T14:30:00Z', merchant_name: 'Whole Foods Market', category: 'Groceries', amount: -85.42, transaction_type: 'debit' },
  { transaction_id: 'txn-002', account_number: '****4521', transaction_date: '2025-01-15T12:15:00Z', merchant_name: 'Starbucks', category: 'Restaurants', amount: -6.75, transaction_type: 'debit' },
  { transaction_id: 'txn-003', account_number: '****7832', transaction_date: '2025-01-15T10:00:00Z', merchant_name: 'Payroll Deposit', category: 'Income', amount: 3250.00, transaction_type: 'credit' },
  { transaction_id: 'txn-004', account_number: '****4521', transaction_date: '2025-01-14T18:45:00Z', merchant_name: 'Amazon.com', category: 'Shopping', amount: -124.99, transaction_type: 'debit' },
  { transaction_id: 'txn-005', account_number: '****7832', transaction_date: '2025-01-14T15:30:00Z', merchant_name: 'Transfer to Savings', category: 'Transfer', amount: -500.00, transaction_type: 'transfer' },
];

// Sample accounts for listing
export interface SampleAccount {
  account_id: string;
  account_number: string;
  account_type: AccountType;
  account_name: string;
  balance: number;
  status: 'active' | 'inactive' | 'frozen';
}

export const SAMPLE_ACCOUNTS: SampleAccount[] = [
  { account_id: 'acc-001', account_number: '****4521', account_type: 'checking', account_name: 'Primary Checking', balance: 5842.50, status: 'active' },
  { account_id: 'acc-002', account_number: '****7832', account_type: 'savings', account_name: 'Emergency Fund', balance: 15250.00, status: 'active' },
  { account_id: 'acc-003', account_number: '****9156', account_type: 'credit', account_name: 'Rewards Card', balance: -2450.75, status: 'active' },
  { account_id: 'acc-004', account_number: '****3287', account_type: 'investment', account_name: 'Brokerage', balance: 45820.00, status: 'active' },
  { account_id: 'acc-005', account_number: '****6543', account_type: 'savings', account_name: 'Vacation Fund', balance: 3200.00, status: 'active' },
];

// All sample data combined
export const FINANCIAL_DATA = {
  stats: DATASET_STATS,
  spendingByCategory: SPENDING_BY_CATEGORY,
  monthlyVolume: MONTHLY_VOLUME,
  balanceByType: BALANCE_BY_TYPE,
  topMerchants: TOP_MERCHANTS,
  fraudAlertSummary: FRAUD_ALERT_SUMMARY,
  recentTransactions: RECENT_TRANSACTIONS,
  sampleAccounts: SAMPLE_ACCOUNTS,
};
