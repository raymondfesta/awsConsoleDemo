// Mock data for Recommendations page

export type RecommendationStatus = 'pending' | 'in_progress' | 'applied' | 'dismissed';

export interface RecommendationFeedback {
  helpful: boolean | null;
  comment?: string;
  submittedAt?: Date;
}

export interface Recommendation {
  id: string;
  severity: 'high' | 'medium' | 'low';
  title: string;
  description: string;
  category: 'capacity' | 'performance' | 'critical' | 'cost' | 'security';
  confidence: number; // 0-100
  timeframe: string;
  database?: string;
  databaseId?: string;
  suggestedAction?: string;
  estimatedImpact?: string;
  createdAt: Date;
  status: RecommendationStatus;
  appliedAt?: Date;
  dismissedAt?: Date;
  feedback?: RecommendationFeedback;
}

export interface RecommendationSummary {
  totalPredictions: number;
  highImpact: number;
  avgConfidence: number;
  databases: number;
}

// Summary statistics matching mockup
export const RECOMMENDATION_SUMMARY: RecommendationSummary = {
  totalPredictions: 4,
  highImpact: 2,
  avgConfidence: 86,
  databases: 6,
};

// Mock recommendations matching the mockup
export const MOCK_RECOMMENDATIONS: Recommendation[] = [
  {
    id: 'rec-001',
    severity: 'high',
    title: 'Storage capacity will reach 80% in 3 days',
    description: 'Based on current growth patterns, your analytics database storage will need attention soon.',
    category: 'capacity',
    confidence: 87,
    timeframe: '3 days',
    database: 'analytics-db',
    databaseId: 'db-rds-001',
    suggestedAction: 'Increase storage allocation or implement data archiving',
    estimatedImpact: 'Prevent service disruption',
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
    status: 'pending',
  },
  {
    id: 'rec-002',
    severity: 'high',
    title: 'Connection pool exhaustion likely',
    description: 'Current connection growth rate suggests pool limits will be reached during peak hours.',
    category: 'critical',
    confidence: 78,
    timeframe: '2 days',
    database: 'prod-db-primary',
    databaseId: 'db-aurora-001',
    suggestedAction: 'Increase connection pool size or optimize connection usage',
    estimatedImpact: 'Avoid connection failures',
    createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000),
    status: 'pending',
  },
  {
    id: 'rec-003',
    severity: 'medium',
    title: 'Query performance degradation expected',
    description: 'Increasing load on user_activity table may cause 40% slower queries without optimization.',
    category: 'performance',
    confidence: 92,
    timeframe: '1 week',
    database: 'prod-db-primary',
    databaseId: 'db-aurora-001',
    suggestedAction: 'Add index on frequently queried columns',
    estimatedImpact: 'Maintain response times under SLA',
    createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000),
    status: 'pending',
  },
  {
    id: 'rec-004',
    severity: 'medium',
    title: 'Memory usage trending upward',
    description: 'Memory consumption has increased 15% over the past week, monitor for potential issues.',
    category: 'capacity',
    confidence: 85,
    timeframe: '5 days',
    database: 'analytics-db',
    databaseId: 'db-rds-001',
    suggestedAction: 'Review memory-intensive queries and consider instance upgrade',
    estimatedImpact: 'Prevent OOM errors',
    createdAt: new Date(Date.now() - 12 * 60 * 60 * 1000),
    status: 'pending',
  },
];

// Category icons mapping
export const CATEGORY_ICONS: Record<string, string> = {
  capacity: 'status-positive',
  performance: 'status-warning',
  critical: 'status-negative',
  cost: 'settings',
  security: 'security',
};

// Severity colors
export const SEVERITY_COLORS: Record<string, string> = {
  high: 'red',
  medium: 'blue',
  low: 'grey',
};

// Helper function to get severity badge color
export function getSeverityColor(severity: string): 'red' | 'blue' | 'grey' {
  switch (severity) {
    case 'high':
      return 'red';
    case 'medium':
      return 'blue';
    default:
      return 'grey';
  }
}

// Helper function to format timeframe
export function formatTimeframe(timeframe: string): string {
  return timeframe;
}

// Status colors
export const STATUS_COLORS: Record<RecommendationStatus, 'grey' | 'blue' | 'green' | 'red'> = {
  pending: 'grey',
  in_progress: 'blue',
  applied: 'green',
  dismissed: 'red',
};

// Helper function to get status badge color
export function getStatusColor(status: RecommendationStatus): 'grey' | 'blue' | 'green' | 'red' {
  return STATUS_COLORS[status] || 'grey';
}

// Helper function to get status display text
export function getStatusDisplayText(status: RecommendationStatus): string {
  switch (status) {
    case 'pending':
      return 'Pending';
    case 'in_progress':
      return 'In Progress';
    case 'applied':
      return 'Applied';
    case 'dismissed':
      return 'Dismissed';
    default:
      return status;
  }
}
