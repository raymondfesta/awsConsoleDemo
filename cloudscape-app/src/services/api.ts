// API Client for communicating with the Express backend

const API_BASE = '/api';

// Types
export interface ConversationMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface ChatContext {
  currentPage?: string;
  selectedOption?: string;
  selectedDatabase?: string;
  databases?: Array<{
    id: string;
    name: string;
    engine: string;
    region: string;
    status: string;
  }>;
}

export interface DynamicComponent {
  type: string;
  props: Record<string, unknown>;
}

export interface SupportPrompt {
  id: string;
  text: string;
}

export interface ConfirmAction {
  label: string;
  variant: 'primary' | 'normal';
  action: string;
  params?: Record<string, unknown>;
}

export interface ChatResponse {
  message: string;
  component?: DynamicComponent;
  suggestedActions?: SupportPrompt[];
  requiresConfirmation?: boolean;
  confirmAction?: ConfirmAction;
}

export interface RDSInstance {
  id: string;
  name: string;
  engine: string;
  engineVersion: string;
  instanceClass: string;
  status: string;
  endpoint?: string;
  port?: number;
  region: string;
  storage: number;
  multiAZ: boolean;
  createdAt: Date;
}

export interface RDSCluster {
  id: string;
  name: string;
  engine: string;
  engineVersion: string;
  status: string;
  endpoint?: string;
  readerEndpoint?: string;
  port?: number;
  region: string;
  instances: string[];
  createdAt: Date;
}

export interface DSQLCluster {
  id: string;
  arn: string;
  status: string;
  endpoint: string;
  createdAt: Date;
}

export interface SQLQueryResult {
  columns: string[];
  rows: Record<string, unknown>[];
  rowCount: number;
}

// Generic fetch wrapper with error handling
async function fetchAPI<T>(
  endpoint: string,
  options?: RequestInit
): Promise<T> {
  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Unknown error' }));
    throw new Error(error.message || `HTTP ${response.status}`);
  }

  return response.json();
}

// ============ CHAT API ============

export const chatApi = {
  /**
   * Send a message to the AI assistant
   */
  sendMessage: async (
    messages: ConversationMessage[],
    context?: ChatContext
  ): Promise<ChatResponse> => {
    return fetchAPI<ChatResponse>('/chat', {
      method: 'POST',
      body: JSON.stringify({ messages, context }),
    });
  },

  /**
   * Test the Bedrock connection
   */
  testConnection: async (): Promise<{ connected: boolean; model: string; region: string }> => {
    return fetchAPI('/chat/test');
  },
};

// ============ RDS API ============

export const rdsApi = {
  /**
   * Get all RDS instances
   */
  getInstances: async (): Promise<RDSInstance[]> => {
    return fetchAPI('/rds/instances');
  },

  /**
   * Get a specific RDS instance
   */
  getInstance: async (id: string): Promise<RDSInstance> => {
    return fetchAPI(`/rds/instances/${encodeURIComponent(id)}`);
  },

  /**
   * Create a new RDS instance
   */
  createInstance: async (params: {
    instanceIdentifier: string;
    instanceClass: string;
    engine: string;
    engineVersion?: string;
    masterUsername: string;
    masterPassword: string;
    allocatedStorage: number;
    multiAZ?: boolean;
    publiclyAccessible?: boolean;
  }): Promise<RDSInstance> => {
    return fetchAPI('/rds/instances', {
      method: 'POST',
      body: JSON.stringify(params),
    });
  },

  /**
   * Modify an RDS instance
   */
  modifyInstance: async (
    id: string,
    params: {
      instanceClass?: string;
      allocatedStorage?: number;
      multiAZ?: boolean;
    }
  ): Promise<RDSInstance> => {
    return fetchAPI(`/rds/instances/${encodeURIComponent(id)}`, {
      method: 'PUT',
      body: JSON.stringify(params),
    });
  },

  /**
   * Delete an RDS instance
   */
  deleteInstance: async (id: string): Promise<void> => {
    await fetchAPI(`/rds/instances/${encodeURIComponent(id)}`, {
      method: 'DELETE',
    });
  },

  /**
   * Get all RDS clusters
   */
  getClusters: async (): Promise<RDSCluster[]> => {
    return fetchAPI('/rds/clusters');
  },

  /**
   * Get a specific RDS cluster
   */
  getCluster: async (id: string): Promise<RDSCluster> => {
    return fetchAPI(`/rds/clusters/${encodeURIComponent(id)}`);
  },

  /**
   * Create a new RDS cluster
   */
  createCluster: async (params: {
    clusterIdentifier: string;
    engine: string;
    engineVersion?: string;
    masterUsername: string;
    masterPassword: string;
    databaseName?: string;
  }): Promise<RDSCluster> => {
    return fetchAPI('/rds/clusters', {
      method: 'POST',
      body: JSON.stringify(params),
    });
  },

  /**
   * Delete an RDS cluster
   */
  deleteCluster: async (id: string): Promise<void> => {
    await fetchAPI(`/rds/clusters/${encodeURIComponent(id)}`, {
      method: 'DELETE',
    });
  },

  /**
   * Get available engine versions
   */
  getEngineVersions: async (engine: string): Promise<string[]> => {
    return fetchAPI(`/rds/engines/${encodeURIComponent(engine)}/versions`);
  },

  /**
   * Get available instance classes
   */
  getInstanceClasses: async (engine: string): Promise<string[]> => {
    return fetchAPI(`/rds/engines/${encodeURIComponent(engine)}/instance-classes`);
  },
};

// ============ DSQL API ============

export const dsqlApi = {
  /**
   * Get all DSQL clusters
   */
  getClusters: async (): Promise<DSQLCluster[]> => {
    return fetchAPI('/dsql/clusters');
  },

  /**
   * Get a specific DSQL cluster
   */
  getCluster: async (id: string): Promise<DSQLCluster> => {
    return fetchAPI(`/dsql/clusters/${encodeURIComponent(id)}`);
  },

  /**
   * Execute a SQL query
   */
  executeQuery: async (
    resourceArn: string,
    secretArn: string,
    sql: string,
    database?: string
  ): Promise<SQLQueryResult> => {
    return fetchAPI('/dsql/query', {
      method: 'POST',
      body: JSON.stringify({ resourceArn, secretArn, sql, database }),
    });
  },

  /**
   * Get tables in a database
   */
  getTables: async (
    resourceArn: string,
    secretArn: string,
    database: string,
    schema?: string
  ): Promise<Array<{ name: string; schema: string }>> => {
    return fetchAPI('/dsql/tables', {
      method: 'POST',
      body: JSON.stringify({ resourceArn, secretArn, database, schema }),
    });
  },

  /**
   * Describe a table schema
   */
  describeTable: async (
    resourceArn: string,
    secretArn: string,
    database: string,
    tableName: string,
    schema?: string
  ): Promise<{
    name: string;
    columns: Array<{
      name: string;
      type: string;
      nullable: boolean;
      primaryKey: boolean;
    }>;
  }> => {
    return fetchAPI('/dsql/describe-table', {
      method: 'POST',
      body: JSON.stringify({ resourceArn, secretArn, database, tableName, schema }),
    });
  },
};

// Export all APIs
export default {
  chat: chatApi,
  rds: rdsApi,
  dsql: dsqlApi,
};
