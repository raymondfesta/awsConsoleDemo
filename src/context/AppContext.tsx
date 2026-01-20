import { create } from 'zustand';
import type { Product, Notification } from '../types';
import { mockProducts } from '../data/mockData';
import { ECOMMERCE_SAMPLE_DATA } from '../data/ecommerceSampleData';
import type { EcommerceSchema } from '../data/ecommerceSampleSchema';
import { getSchemaWithOptions } from '../data/ecommerceSampleSchema';
import { MOCK_ALERTS, type Alert } from '../data/alertsMockData';
import { MOCK_RECOMMENDATIONS, type Recommendation, type RecommendationStatus, type RecommendationFeedback } from '../data/recommendationsMockData';
import type { DatasetType, PopulatedDatabase, DatasetMetrics, BaseSchema } from '../data/sampleDatasets/types';
import { DATASET_DEFINITIONS, getDataset } from '../data/sampleDatasets/registry';

// Database cluster type
export interface DatabaseCluster {
  id: string;
  name: string;
  engine: string;
  region: string;
  status: 'creating' | 'active' | 'stopped' | 'error';
  endpoint?: string;
  createdAt: Date;
  lastActivity?: Date;
  storage?: string;
  connections?: number;
  tags?: Record<string, string>;
}

// Activity event type
export interface ActivityEvent {
  id: string;
  type: 'database_created' | 'data_imported' | 'connection_made' | 'query_executed' | 'error';
  title: string;
  description: string;
  timestamp: Date;
  resourceId?: string;
  resourceName?: string;
}

// Imported sample dataset state
export interface ImportedDataset {
  id: string;
  name: string;
  databaseId: string;
  schema: EcommerceSchema;
  includedTables: string[];
  excludedTables: string[];
  customCategories: string[];
  importedAt: Date;
  recordCount: number;
  data: typeof ECOMMERCE_SAMPLE_DATA;
}

// Alert filter state
export interface AlertFilters {
  severity: string[];
  status: string[];
  database: string[];
}

// Recommendation filter state
export interface RecommendationFilters {
  category: string[];
  severity: string[];
  status: string[];
}

// Re-export types for external use
export type { DatasetType, PopulatedDatabase, DatasetMetrics, BaseSchema };

interface AppState {
  // Existing
  products: Product[];
  notifications: Notification[];
  theme: 'light' | 'dark';
  loading: boolean;

  // Database management
  databases: DatabaseCluster[];
  activities: ActivityEvent[];

  // Sample dataset management (legacy)
  importedDataset: ImportedDataset | null;
  availableSchema: EcommerceSchema;

  // Multi-dataset management (new)
  populatedDatabases: Record<string, PopulatedDatabase>;
  availableDatasets: typeof DATASET_DEFINITIONS;

  // Alerts management
  alerts: Alert[];
  selectedAlertId: string | null;
  alertFilters: AlertFilters;

  // Recommendations management
  recommendations: Recommendation[];
  selectedRecommendationId: string | null;
  recommendationFilters: RecommendationFilters;

  // Existing actions
  addProduct: (product: Product) => void;
  updateProduct: (id: string, product: Partial<Product>) => void;
  deleteProduct: (id: string) => void;
  addNotification: (notification: Omit<Notification, 'id'>) => void;
  removeNotification: (id: string) => void;
  toggleTheme: () => void;
  setLoading: (loading: boolean) => void;

  // Database actions
  addDatabase: (database: DatabaseCluster) => void;
  updateDatabase: (id: string, updates: Partial<DatabaseCluster>) => void;
  removeDatabase: (id: string) => void;
  addActivity: (activity: Omit<ActivityEvent, 'id' | 'timestamp'>) => void;
  clearActivities: () => void;

  // Sample data actions (legacy)
  loadSampleData: (databaseId: string, options?: { excludeTables?: string[]; customCategories?: string[] }) => void;
  clearSampleData: () => void;
  updateSchemaOptions: (options: { includeReviews?: boolean }) => void;

  // Multi-dataset actions (new)
  populateDatabase: (databaseId: string, datasetType: DatasetType, options?: { excludeTables?: string[] }) => void;
  clearDatabaseData: (databaseId: string) => void;
  getDatabaseDataset: (databaseId: string) => PopulatedDatabase | undefined;
  isDatabasePopulated: (databaseId: string) => boolean;

  // Alert actions
  setSelectedAlertId: (id: string | null) => void;
  acknowledgeAlert: (id: string) => void;
  resolveAlert: (id: string) => void;
  bulkAcknowledgeAlerts: (ids: string[]) => void;
  bulkResolveAlerts: (ids: string[]) => void;
  setAlertFilters: (filters: Partial<AlertFilters>) => void;
  clearAlertFilters: () => void;

  // Recommendation actions
  setSelectedRecommendationId: (id: string | null) => void;
  applyRecommendation: (id: string) => void;
  completeRecommendation: (id: string) => void;
  dismissRecommendation: (id: string) => void;
  undoDismissRecommendation: (id: string) => void;
  submitRecommendationFeedback: (id: string, feedback: RecommendationFeedback) => void;
  setRecommendationFilters: (filters: Partial<RecommendationFilters>) => void;
  clearRecommendationFilters: () => void;
}

// Demo activities to pre-populate activity feed
const demoActivities: ActivityEvent[] = [
  {
    id: 'activity-demo-001',
    type: 'database_created',
    title: 'Database cluster created',
    description: 'aurora-prod-cluster created successfully in us-east-1',
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
    resourceId: 'db-aurora-001',
    resourceName: 'aurora-prod-cluster',
  },
  {
    id: 'activity-demo-002',
    type: 'connection_made',
    title: 'New connection established',
    description: 'Application server connected to user-sessions-table',
    timestamp: new Date(Date.now() - 30 * 60 * 1000), // 30 min ago
    resourceId: 'db-dynamodb-001',
    resourceName: 'user-sessions-table',
  },
  {
    id: 'activity-demo-003',
    type: 'data_imported',
    title: 'Data import completed',
    description: 'Imported 1.2M records into analytics-mysql',
    timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000), // 4 hours ago
    resourceId: 'db-rds-001',
    resourceName: 'analytics-mysql',
  },
  {
    id: 'activity-demo-004',
    type: 'query_executed',
    title: 'Slow query detected',
    description: 'Query on content-catalog took 2.5s to execute',
    timestamp: new Date(Date.now() - 15 * 60 * 1000), // 15 min ago
    resourceId: 'db-docdb-001',
    resourceName: 'content-catalog',
  },
  {
    id: 'activity-demo-005',
    type: 'error',
    title: 'Connection timeout',
    description: 'Failed to connect to session-store (stopped)',
    timestamp: new Date(Date.now() - 45 * 60 * 1000), // 45 min ago
    resourceId: 'db-memorydb-001',
    resourceName: 'session-store',
  },
];

// Demo databases showcasing various AWS database types
const demoDatabases: DatabaseCluster[] = [
  {
    id: 'db-aurora-001',
    name: 'aurora-prod-cluster',
    engine: 'Amazon Aurora PostgreSQL',
    region: 'us-east-1',
    status: 'active',
    endpoint: 'aurora-prod-cluster.cluster-abc123.us-east-1.rds.amazonaws.com',
    createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
    lastActivity: new Date(Date.now() - 5 * 60 * 1000), // 5 minutes ago
    storage: '500 GB',
    connections: 42,
    tags: { Environment: 'Production', Team: 'Backend' },
  },
  {
    id: 'db-dynamodb-001',
    name: 'user-sessions-table',
    engine: 'Amazon DynamoDB',
    region: 'us-west-2',
    status: 'active',
    endpoint: 'dynamodb.us-west-2.amazonaws.com',
    createdAt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000), // 90 days ago
    lastActivity: new Date(Date.now() - 1 * 60 * 1000), // 1 minute ago
    storage: '25 GB',
    connections: 156,
    tags: { Environment: 'Production', Team: 'Platform' },
  },
  {
    id: 'db-rds-001',
    name: 'analytics-mysql',
    engine: 'Amazon RDS for MySQL',
    region: 'eu-west-1',
    status: 'active',
    endpoint: 'analytics-mysql.def456.eu-west-1.rds.amazonaws.com',
    createdAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000), // 60 days ago
    lastActivity: new Date(Date.now() - 30 * 60 * 1000), // 30 minutes ago
    storage: '1 TB',
    connections: 28,
    tags: { Environment: 'Production', Team: 'Analytics' },
  },
  {
    id: 'db-elasticache-001',
    name: 'redis-cache-cluster',
    engine: 'Amazon ElastiCache for Redis',
    region: 'us-east-1',
    status: 'active',
    endpoint: 'redis-cache-cluster.xyz789.use1.cache.amazonaws.com',
    createdAt: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000), // 45 days ago
    lastActivity: new Date(),
    storage: '13 GB',
    connections: 89,
    tags: { Environment: 'Production', Team: 'Backend' },
  },
  {
    id: 'db-docdb-001',
    name: 'content-catalog',
    engine: 'Amazon DocumentDB',
    region: 'ap-southeast-1',
    status: 'active',
    endpoint: 'content-catalog.cluster-ghi012.ap-southeast-1.docdb.amazonaws.com',
    createdAt: new Date(Date.now() - 21 * 24 * 60 * 60 * 1000), // 21 days ago
    lastActivity: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
    storage: '200 GB',
    connections: 15,
    tags: { Environment: 'Production', Team: 'Content' },
  },
  {
    id: 'db-neptune-001',
    name: 'knowledge-graph',
    engine: 'Amazon Neptune',
    region: 'us-east-2',
    status: 'active',
    endpoint: 'knowledge-graph.cluster-jkl345.us-east-2.neptune.amazonaws.com',
    createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000), // 14 days ago
    lastActivity: new Date(Date.now() - 45 * 60 * 1000), // 45 minutes ago
    storage: '75 GB',
    connections: 8,
    tags: { Environment: 'Production', Team: 'ML' },
  },
  {
    id: 'db-timestream-001',
    name: 'iot-metrics',
    engine: 'Amazon Timestream',
    region: 'eu-central-1',
    status: 'creating',
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
    storage: '50 GB',
    connections: 0,
    tags: { Environment: 'Development', Team: 'IoT' },
  },
  {
    id: 'db-memorydb-001',
    name: 'session-store',
    engine: 'Amazon MemoryDB for Redis',
    region: 'us-west-1',
    status: 'stopped',
    endpoint: 'session-store.mno678.memorydb.us-west-1.amazonaws.com',
    createdAt: new Date(Date.now() - 120 * 24 * 60 * 60 * 1000), // 120 days ago
    lastActivity: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
    storage: '32 GB',
    connections: 0,
    tags: { Environment: 'Staging', Team: 'Backend' },
  },
];

export const useAppStore = create<AppState>((set, get) => ({
  // Initial state
  products: mockProducts,
  notifications: [],
  theme: 'light',
  loading: false,
  databases: demoDatabases,
  activities: demoActivities,
  importedDataset: null,
  availableSchema: getSchemaWithOptions(true),

  // Multi-dataset state
  populatedDatabases: {},
  availableDatasets: DATASET_DEFINITIONS,

  // Alerts initial state
  alerts: MOCK_ALERTS,
  selectedAlertId: null,
  alertFilters: {
    severity: [],
    status: [],
    database: [],
  },

  // Recommendations initial state
  recommendations: MOCK_RECOMMENDATIONS,
  selectedRecommendationId: null,
  recommendationFilters: {
    category: [],
    severity: [],
    status: [],
  },

  // Product actions
  addProduct: (product) =>
    set((state) => ({ products: [...state.products, product] })),
  updateProduct: (id, updatedProduct) =>
    set((state) => ({
      products: state.products.map((p) =>
        p.id === id ? { ...p, ...updatedProduct } : p
      ),
    })),
  deleteProduct: (id) =>
    set((state) => ({
      products: state.products.filter((p) => p.id !== id),
    })),

  // Notification actions
  addNotification: (notification) =>
    set((state) => ({
      notifications: [
        ...state.notifications,
        { ...notification, id: Date.now().toString() },
      ],
    })),
  removeNotification: (id) =>
    set((state) => ({
      notifications: state.notifications.filter((n) => n.id !== id),
    })),

  // Theme actions
  toggleTheme: () =>
    set((state) => ({ theme: state.theme === 'light' ? 'dark' : 'light' })),
  setLoading: (loading) => set({ loading }),

  // Database actions
  addDatabase: (database) =>
    set((state) => ({ databases: [...state.databases, database] })),
  updateDatabase: (id, updates) =>
    set((state) => ({
      databases: state.databases.map((db) =>
        db.id === id ? { ...db, ...updates } : db
      ),
    })),
  removeDatabase: (id) =>
    set((state) => ({
      databases: state.databases.filter((db) => db.id !== id),
    })),

  // Activity actions
  addActivity: (activity) =>
    set((state) => ({
      activities: [
        {
          ...activity,
          id: `activity-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          timestamp: new Date(),
        },
        ...state.activities,
      ].slice(0, 50), // Keep last 50 activities
    })),
  clearActivities: () => set({ activities: [] }),

  // Sample data actions
  loadSampleData: (databaseId, options = {}) => {
    const { excludeTables = [], customCategories = [] } = options;
    const schema = get().availableSchema;
    const includedTables = schema.tables
      .filter((t) => !excludeTables.includes(t.name))
      .map((t) => t.name);
    const totalRecords = schema.tables
      .filter((t) => includedTables.includes(t.name))
      .reduce((sum, t) => sum + t.recordCount, 0);

    set({
      importedDataset: {
        id: `dataset-${Date.now()}`,
        name: 'TechStyle E-commerce Analytics',
        databaseId,
        schema,
        includedTables,
        excludedTables: excludeTables,
        customCategories: customCategories.length > 0 ? customCategories : [...schema.categories],
        importedAt: new Date(),
        recordCount: totalRecords,
        data: ECOMMERCE_SAMPLE_DATA,
      },
    });

    // Add activity event
    get().addActivity({
      type: 'data_imported',
      title: 'Sample data imported',
      description: `Imported ${totalRecords.toLocaleString()} records across ${includedTables.length} tables`,
      resourceId: databaseId,
      resourceName: 'TechStyle E-commerce Dataset',
    });
  },

  clearSampleData: () => set({ importedDataset: null }),

  updateSchemaOptions: (options) => {
    const { includeReviews = true } = options;
    set({ availableSchema: getSchemaWithOptions(includeReviews) });
  },

  // Multi-dataset actions
  populateDatabase: (databaseId, datasetType, options = {}) => {
    const dataset = getDataset(datasetType);
    if (!dataset) return;

    const { excludeTables = [] } = options;
    const includedTables = dataset.schema.tables.filter(
      (t) => !excludeTables.includes(t.name)
    );
    const totalRecords = includedTables.reduce((sum, t) => sum + t.recordCount, 0);

    const populatedDb: PopulatedDatabase = {
      databaseId,
      datasetType,
      importedAt: new Date(),
      tableCount: includedTables.length,
      recordCount: totalRecords,
      metrics: {
        ...dataset.metrics,
        totalRecords,
        tableCount: includedTables.length,
      },
    };

    set((state) => ({
      populatedDatabases: {
        ...state.populatedDatabases,
        [databaseId]: populatedDb,
      },
      // Update database storage based on record count
      databases: state.databases.map((db) =>
        db.id === databaseId
          ? {
              ...db,
              storage: `${Math.round(totalRecords / 1000)} GB`,
              lastActivity: new Date(),
            }
          : db
      ),
    }));

    // Add activity event
    get().addActivity({
      type: 'data_imported',
      title: 'Sample data imported',
      description: `Imported ${dataset.definition.name} dataset (${totalRecords.toLocaleString()} records)`,
      resourceId: databaseId,
      resourceName: dataset.definition.name,
    });
  },

  clearDatabaseData: (databaseId) => {
    set((state) => {
      const { [databaseId]: removed, ...rest } = state.populatedDatabases;
      return { populatedDatabases: rest };
    });
  },

  getDatabaseDataset: (databaseId) => {
    return get().populatedDatabases[databaseId];
  },

  isDatabasePopulated: (databaseId) => {
    return databaseId in get().populatedDatabases;
  },

  // Alert actions
  setSelectedAlertId: (id) => set({ selectedAlertId: id }),

  acknowledgeAlert: (id) =>
    set((state) => ({
      alerts: state.alerts.map((alert) =>
        alert.id === id ? { ...alert, status: 'acknowledged' as const } : alert
      ),
    })),

  resolveAlert: (id) =>
    set((state) => ({
      alerts: state.alerts.map((alert) =>
        alert.id === id ? { ...alert, status: 'resolved' as const } : alert
      ),
    })),

  bulkAcknowledgeAlerts: (ids) =>
    set((state) => ({
      alerts: state.alerts.map((alert) =>
        ids.includes(alert.id) ? { ...alert, status: 'acknowledged' as const } : alert
      ),
    })),

  bulkResolveAlerts: (ids) =>
    set((state) => ({
      alerts: state.alerts.map((alert) =>
        ids.includes(alert.id) ? { ...alert, status: 'resolved' as const } : alert
      ),
    })),

  setAlertFilters: (filters) =>
    set((state) => ({
      alertFilters: { ...state.alertFilters, ...filters },
    })),

  clearAlertFilters: () =>
    set({
      alertFilters: {
        severity: [],
        status: [],
        database: [],
      },
    }),

  // Recommendation actions
  setSelectedRecommendationId: (id) => set({ selectedRecommendationId: id }),

  applyRecommendation: (id) =>
    set((state) => ({
      recommendations: state.recommendations.map((rec) =>
        rec.id === id ? { ...rec, status: 'in_progress' as RecommendationStatus } : rec
      ),
    })),

  completeRecommendation: (id) =>
    set((state) => ({
      recommendations: state.recommendations.map((rec) =>
        rec.id === id
          ? { ...rec, status: 'applied' as RecommendationStatus, appliedAt: new Date() }
          : rec
      ),
    })),

  dismissRecommendation: (id) =>
    set((state) => ({
      recommendations: state.recommendations.map((rec) =>
        rec.id === id
          ? { ...rec, status: 'dismissed' as RecommendationStatus, dismissedAt: new Date() }
          : rec
      ),
    })),

  undoDismissRecommendation: (id) =>
    set((state) => ({
      recommendations: state.recommendations.map((rec) =>
        rec.id === id
          ? { ...rec, status: 'pending' as RecommendationStatus, dismissedAt: undefined }
          : rec
      ),
    })),

  submitRecommendationFeedback: (id, feedback) =>
    set((state) => ({
      recommendations: state.recommendations.map((rec) =>
        rec.id === id ? { ...rec, feedback: { ...feedback, submittedAt: new Date() } } : rec
      ),
    })),

  setRecommendationFilters: (filters) =>
    set((state) => ({
      recommendationFilters: { ...state.recommendationFilters, ...filters },
    })),

  clearRecommendationFilters: () =>
    set({
      recommendationFilters: {
        category: [],
        severity: [],
        status: [],
      },
    }),
}));
