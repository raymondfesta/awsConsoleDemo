// Mock data for Alerts Dashboard

export interface Alert {
  id: string;
  severity: 'critical' | 'warning' | 'info';
  name: string;
  description: string;
  database: string;
  databaseId: string;
  triggeredAt: Date;
  status: 'active' | 'acknowledged' | 'resolved';
}

export interface AlertSummary {
  critical: number;
  warning: number;
  predictive: number;
  total: number;
}

export interface AlertVolumeData {
  day: string;
  critical: number;
  warning: number;
  info: number;
}

export interface AlertSourceData {
  source: string;
  count: number;
  color: string;
}

// Alert summary matching mockup
export const ALERT_SUMMARY: AlertSummary = {
  critical: 8,
  warning: 15,
  predictive: 7,
  total: 47,
};

// Active alerts matching mockup
export const MOCK_ALERTS: Alert[] = [
  {
    id: 'alert-001',
    severity: 'critical',
    name: 'CPU Spike Detected',
    description: '87% usage',
    database: 'prod-db-primary',
    databaseId: 'db-aurora-001',
    triggeredAt: new Date(Date.now() - 2 * 60 * 1000), // 2 minutes ago
    status: 'active',
  },
  {
    id: 'alert-002',
    severity: 'critical',
    name: 'Memory Leak Detected',
    description: '4.2GB consumed',
    database: 'analytics-db',
    databaseId: 'db-rds-001',
    triggeredAt: new Date(Date.now() - 8 * 60 * 1000), // 8 minutes ago
    status: 'active',
  },
  {
    id: 'alert-003',
    severity: 'critical',
    name: 'Disk Space Critical',
    description: '95% full',
    database: 'backup-db',
    databaseId: 'db-aurora-002',
    triggeredAt: new Date(Date.now() - 15 * 60 * 1000), // 15 minutes ago
    status: 'active',
  },
  {
    id: 'alert-004',
    severity: 'warning',
    name: 'Connection Pool High',
    description: '180/200 connections',
    database: 'prod-db-secondary',
    databaseId: 'db-aurora-003',
    triggeredAt: new Date(Date.now() - 12 * 60 * 1000), // 12 minutes ago
    status: 'active',
  },
  {
    id: 'alert-005',
    severity: 'warning',
    name: 'Slow Query Performance',
    description: '2.5s avg response',
    database: 'analytics-db',
    databaseId: 'db-rds-001',
    triggeredAt: new Date(Date.now() - 18 * 60 * 1000), // 18 minutes ago
    status: 'active',
  },
  {
    id: 'alert-006',
    severity: 'info',
    name: 'Backup Completion Delayed',
    description: '15 min delay',
    database: 'backup-db',
    databaseId: 'db-aurora-002',
    triggeredAt: new Date(Date.now() - 25 * 60 * 1000), // 25 minutes ago
    status: 'active',
  },
];

// 7-day alert volume data for stacked bar chart
export const ALERT_VOLUME_DATA: AlertVolumeData[] = [
  { day: 'Mon', critical: 8, warning: 12, info: 16 },
  { day: 'Tue', critical: 6, warning: 10, info: 14 },
  { day: 'Wed', critical: 10, warning: 14, info: 12 },
  { day: 'Thu', critical: 12, warning: 16, info: 10 },
  { day: 'Fri', critical: 14, warning: 12, info: 8 },
  { day: 'Sat', critical: 8, warning: 10, info: 6 },
  { day: 'Sun', critical: 6, warning: 8, info: 10 },
];

// Alert sources for pie chart
export const ALERT_SOURCES: AlertSourceData[] = [
  { source: 'Aurora PostgreSQL', count: 18, color: '#ff9900' },
  { source: 'RDS MySQL', count: 12, color: '#dd3333' },
  { source: 'DynamoDB', count: 9, color: '#3366cc' },
  { source: 'ElastiCache', count: 8, color: '#22aa22' },
];

// Helper function to format time ago
export function formatTimeAgo(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / (1000 * 60));

  if (diffMins < 1) return 'just now';
  if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;

  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;

  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
}
