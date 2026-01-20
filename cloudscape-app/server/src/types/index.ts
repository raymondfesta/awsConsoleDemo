// Shared types for the backend

export interface ConversationMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface ChatContext {
  currentPage?: string;
  selectedOption?: string;
  selectedDatabase?: string;
  databases?: DatabaseInfo[];
}

export interface DatabaseInfo {
  id: string;
  name: string;
  engine: string;
  region: string;
  status: string;
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

export interface ChatRequest {
  messages: ConversationMessage[];
  context?: ChatContext;
}

export interface ChatResponse {
  message: string;
  component?: DynamicComponent;
  suggestedActions?: SupportPrompt[];
  requiresConfirmation?: boolean;
  confirmAction?: ConfirmAction;
}

// RDS Types
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

export interface CreateInstanceParams {
  instanceIdentifier: string;
  instanceClass: string;
  engine: string;
  engineVersion?: string;
  masterUsername: string;
  masterPassword: string;
  allocatedStorage: number;
  multiAZ?: boolean;
  publiclyAccessible?: boolean;
}

export interface CreateClusterParams {
  clusterIdentifier: string;
  engine: string;
  engineVersion?: string;
  masterUsername: string;
  masterPassword: string;
  databaseName?: string;
}

// Aurora DSQL Types
export interface DSQLCluster {
  id: string;
  arn: string;
  status: string;
  endpoint?: string;
  createdAt: Date;
}

export interface SQLQueryResult {
  columns: string[];
  rows: Record<string, unknown>[];
  rowCount: number;
}

export interface TableInfo {
  name: string;
  schema: string;
  rowCount?: number;
}

export interface TableSchema {
  name: string;
  columns: ColumnInfo[];
}

export interface ColumnInfo {
  name: string;
  type: string;
  nullable: boolean;
  primaryKey: boolean;
}
