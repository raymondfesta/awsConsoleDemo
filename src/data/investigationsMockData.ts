// Mock data for AI Firefighter / Investigations page

export interface Investigation {
  id: string;
  description: string;
  status: 'completed' | 'in_progress' | 'failed' | 'pending';
  startedAt: Date;
  lastUpdated: Date;
  tags: string[];
  findings?: string[];
  recommendations?: string[];
}

export interface QuickTag {
  id: string;
  text: string;
  icon?: string;
}

export interface InvestigationFrequencyData {
  day: string;
  date: string;
  count: number;
}

// Quick tags for starting investigations
export const QUICK_TAGS: QuickTag[] = [
  { id: 'latest-alarm', text: 'Latest alarm' },
  { id: 'high-cpu', text: 'High CPU usage' },
  { id: 'error-spike', text: 'Error rate spike' },
  { id: 'memory-leak', text: 'Memory leak' },
  { id: 'connection-issues', text: 'Connection issues' },
  { id: 'query-timeout', text: 'Query timeout' },
  { id: 'n-plus-one', text: 'N+1 query problem' },
  { id: 'deployment', text: 'Deployment related' },
  { id: 'traffic-spike', text: 'Traffic spike' },
  { id: 'feature-rollout', text: 'Feature rollout' },
];

// Mock investigations matching the mockup
export const MOCK_INVESTIGATIONS: Investigation[] = [
  {
    id: 'Investigation 2026-01-05T22:15:26.28Z',
    description: 'Investigating high CPU usage on prod-db-primary cluster',
    status: 'completed',
    startedAt: new Date('2026-01-05T06:15:00'),
    lastUpdated: new Date('2026-01-07T08:40:00'),
    tags: ['high-cpu'],
    findings: [
      'CPU usage spiked to 87% due to inefficient query pattern',
      'Identified N+1 query in user dashboard endpoint',
    ],
    recommendations: [
      'Add index on user_sessions.user_id column',
      'Implement query batching for dashboard data',
    ],
  },
  {
    id: 'Investigation 2026-01-05T21:29:14.164Z',
    description: 'Memory consumption analysis for analytics-db',
    status: 'completed',
    startedAt: new Date('2026-01-05T05:29:00'),
    lastUpdated: new Date('2026-01-05T10:30:00'),
    tags: ['memory-leak'],
    findings: [
      'Memory leak detected in connection pool management',
      'Connections not being properly released after timeout',
    ],
    recommendations: [
      'Update connection pool configuration',
      'Implement connection health checks',
    ],
  },
  {
    id: 'Investigation 2026-01-05T19:36:14.561Z',
    description: 'Connection pool exhaustion investigation',
    status: 'completed',
    startedAt: new Date('2026-01-05T03:36:00'),
    lastUpdated: new Date('2026-01-05T05:15:00'),
    tags: ['connection-issues'],
    findings: [
      'Connection pool reached 95% capacity during peak hours',
      'Some connections held for extended periods without activity',
    ],
    recommendations: [
      'Increase max pool size from 200 to 300',
      'Implement connection timeout of 30 seconds',
    ],
  },
];

// Daily investigation frequency for bar chart (last 7 days)
export const INVESTIGATION_FREQUENCY: InvestigationFrequencyData[] = [
  { day: 'Jan 7', date: '2026-01-07', count: 0 },
  { day: 'Jan 8', date: '2026-01-08', count: 0 },
  { day: 'Jan 9', date: '2026-01-09', count: 2 },
  { day: 'Jan 10', date: '2026-01-10', count: 4 },
  { day: 'Jan 11', date: '2026-01-11', count: 5 },
  { day: 'Jan 12', date: '2026-01-12', count: 5 },
  { day: 'Jan 13', date: '2026-01-13', count: 3 },
];

// Sandbox environment options
export const SANDBOX_ENVIRONMENTS = [
  { value: 'vscode', label: 'VS Code' },
  { value: 'cloudshell', label: 'AWS CloudShell' },
  { value: 'terminal', label: 'Terminal' },
];

// Format date for display
export function formatInvestigationDate(date: Date): string {
  return date.toLocaleDateString('en-US', {
    month: '2-digit',
    day: '2-digit',
    year: 'numeric',
  });
}

export function formatInvestigationTime(date: Date): string {
  return date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    timeZoneName: 'short',
  });
}
