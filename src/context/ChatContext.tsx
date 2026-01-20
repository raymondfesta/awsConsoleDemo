import { createContext, useContext, useState, useCallback, useRef, type ReactNode } from 'react';
import { useAppStore } from './AppContext';
import { chatApi, type ConversationMessage } from '../services/api';

// Types
export type MessageType = 'user' | 'agent' | 'status' | 'error';
export type StepStatus = 'pending' | 'in-progress' | 'success' | 'error';
export type WorkflowView = 'entry' | 'chat' | 'design' | 'review';
export type WorkflowPath = 'customize' | 'auto-setup' | null;
export type DrawerExpansionMode = 'normal' | 'expanded';
export type CreationStatus = 'idle' | 'creating' | 'completed' | 'error';

// Configuration section types
export type ConfigSectionId = 'cluster' | 'instance' | 'storage' | 'security';

export interface ConfigSectionValues {
  [key: string]: string;
}

export interface ConfigSection {
  id: ConfigSectionId;
  title: string;
  status: StepStatus;
  values: ConfigSectionValues;
}

export interface ConfigurationState {
  cluster: ConfigSection;
  instance: ConfigSection;
  storage: ConfigSection;
  security: ConfigSection;
}

export interface MessageAction {
  id: string;
  label: string;
  variant?: 'primary' | 'normal';
}

export interface BuildProgressItem {
  label: string;
  status: 'pending' | 'success' | 'error';
}

export interface RecommendationSection {
  title: string;
  items: Record<string, string>;
}

export interface RecommendationMeta {
  summary: {
    engine: string;
    instanceClass: string;
    region: string;
  };
  sections: RecommendationSection[];
}

// Dynamic component from AI response
export interface DynamicComponent {
  type: string;
  props: Record<string, unknown>;
}

// Confirmation action for user authorized actions
export interface ConfirmAction {
  label: string;
  variant: 'primary' | 'normal';
  action: string;
  params?: Record<string, unknown>;
}

export interface Message {
  id: string;
  type: MessageType;
  content: string;
  timestamp: Date;
  actions?: MessageAction[];
  feedbackEnabled?: boolean;
  stepCompleted?: string; // Step title to show as completed status indicator
  buildProgress?: BuildProgressItem[]; // Progress items with status indicators
  recommendationMeta?: RecommendationMeta; // Metadata for collapsible recommendation display
  // NEW: Dynamic component from AI
  dynamicComponent?: DynamicComponent;
  // NEW: Suggested follow-up prompts from AI
  suggestedActions?: SupportPrompt[];
  // NEW: For user authorized actions pattern
  requiresConfirmation?: boolean;
  confirmAction?: ConfirmAction;
}

export interface SupportPrompt {
  id: string;
  text: string;
}

export interface WorkflowStep {
  id: string;
  title: string;
  status: StepStatus;
}

export interface ResourceInfo {
  id: string;
  name: string;
  type: string;
  region: string;
  status: 'creating' | 'active' | 'error';
  endpoint?: string;
  details?: Record<string, string>;
}

export interface WorkflowConfig {
  id: string;
  title: string;
  subtitle?: string;
  options: Array<{
    id: string;
    title: string;
    description: string;
  }>;
  initialPrompts: SupportPrompt[];
  steps: Array<{ id: string; title: string }>;
  placeholder: string;
}

interface WorkflowState {
  isActive: boolean;
  config: WorkflowConfig | null;
  view: WorkflowView;
  selectedOption: string | null;
  steps: WorkflowStep[];
  currentStepIndex: number;
  resource: ResourceInfo | null;
  inContext: boolean; // True when continuing from another workflow (e.g., import from database details)
  path: WorkflowPath; // 'customize' or 'auto-setup' after user chooses
  configSections: ConfigurationState;
}

// Default configuration state
const DEFAULT_CONFIG_SECTIONS: ConfigurationState = {
  cluster: {
    id: 'cluster',
    title: 'Cluster Configuration',
    status: 'pending',
    values: {},
  },
  instance: {
    id: 'instance',
    title: 'Instance',
    status: 'pending',
    values: {},
  },
  storage: {
    id: 'storage',
    title: 'Storage & Performance',
    status: 'pending',
    values: {},
  },
  security: {
    id: 'security',
    title: 'Security',
    status: 'pending',
    values: {},
  },
};

interface ChatContextType {
  // Chat state
  messages: Message[];
  currentPrompts: SupportPrompt[];
  showPrompts: boolean;
  isAgentTyping: boolean;
  isDrawerOpen: boolean;

  // Drawer expansion state
  drawerMode: DrawerExpansionMode;
  setDrawerMode: (mode: DrawerExpansionMode) => void;
  expandDrawerForWorkflow: () => void;

  // SplitPanel state for configuration preview
  splitPanelConfig: RecommendationMeta | null;
  setSplitPanelConfig: (config: RecommendationMeta | null) => void;

  // Database creation tracking state
  creationStatus: CreationStatus;
  createdDatabaseId: string | null;
  createdDatabaseType: 'dsql' | 'rds' | null;
  createdDatabaseName: string | null;
  startDatabaseCreation: (databaseId: string, databaseType: 'dsql' | 'rds', databaseName: string) => void;
  onCreationComplete: () => void;
  clearCreationState: () => void;

  // Workflow state
  workflow: WorkflowState;

  // Chat actions
  sendMessage: (content: string) => void;
  selectPrompt: (promptId: string) => void;
  triggerAction: (actionId: string, params?: Record<string, unknown>) => void;
  setDrawerOpen: (open: boolean) => void;

  // Workflow actions
  startWorkflow: (config: WorkflowConfig) => void;
  startWorkflowInContext: (config: WorkflowConfig) => void; // Start workflow while preserving context
  selectWorkflowOption: (optionId: string) => void;
  transitionWorkflowView: (view: WorkflowView) => void;
  setWorkflowPath: (path: WorkflowPath) => void;
  updateConfigSection: (sectionId: ConfigSectionId, status: StepStatus, values?: ConfigSectionValues) => void;
  endWorkflow: () => void;

  // Demo script control
  runNextStep: () => void;
  setDemoPath: (path: 'new' | 'clone' | 'migrate' | 'configure' | 'ecommerce') => void;

  // Navigation
  setNavigateCallback: (callback: (path: string) => void) => void;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

// Demo script step definition
interface DemoStep {
  agentMessage: Omit<Message, 'id' | 'timestamp'>;
  prompts?: SupportPrompt[];
  updateStep?: { stepId: string; status: StepStatus };
  updateConfigSection?: { sectionId: ConfigSectionId; status: StepStatus; values?: ConfigSectionValues };
  updateConfigSections?: Array<{ sectionId: ConfigSectionId; status: StepStatus; title?: string; values?: ConfigSectionValues }>;
  createResource?: ResourceInfo;
  transitionView?: WorkflowView;
  setPath?: WorkflowPath;
  delay?: number;
}

// Prompt-aware response system for realistic demo variability
interface PromptResponse {
  message: string;
  configUpdates?: Array<{ sectionId: ConfigSectionId; status: StepStatus; values?: ConfigSectionValues }>;
  nextPrompts?: SupportPrompt[];
  actions?: MessageAction[]; // Action buttons on the message
  stepCompleted?: string; // Step title to show completion divider
  updateStep?: { stepId: string; status: StepStatus }; // Update workflow step status
  skipToStep?: number; // Skip to a specific step in the script
  feedbackEnabled?: boolean;
  recommendationMeta?: RecommendationMeta; // Metadata for collapsible recommendation display
}

// Mapping of prompt IDs to their specific responses
const PROMPT_RESPONSES: Record<string, PromptResponse> = {
  // === INITIAL QUICK-START PROMPTS ===
  'ecommerce-analytics': {
    message: `Great choice! E-commerce analytics requires handling high read volumes for dashboards while managing concurrent data updates. Aurora DSQL's PostgreSQL compatibility and automatic scaling make it ideal for this use case.

How many products and orders are you expecting to track?`,
    nextPrompts: [
      { id: 'under-50', text: 'Under 10,000 products' },
      { id: '50-200', text: '10,000-100,000 products' },
      { id: '200-plus', text: '100,000+ products' },
    ],
    feedbackEnabled: true,
  },
  'ecommerce-inventory': {
    message: `Product inventory management needs real-time stock tracking and high write throughput for updates. Aurora DSQL handles concurrent inventory operations excellently.

What's the scale of your product catalog?`,
    nextPrompts: [
      { id: 'under-50', text: 'Under 10,000 SKUs' },
      { id: '50-200', text: '10,000-100,000 SKUs' },
      { id: '200-plus', text: '100,000+ SKUs' },
    ],
    feedbackEnabled: true,
  },
  'cms': {
    message: `A Content Management System needs to handle hierarchical content relationships, full-text search, and concurrent editing. Aurora DSQL with PostgreSQL's built-in capabilities is a great fit.

What's your expected content volume?`,
    nextPrompts: [
      { id: 'under-50', text: 'Under 1,000 articles' },
      { id: '50-200', text: '1,000-10,000 articles' },
      { id: '200-plus', text: '10,000+ articles' },
    ],
    feedbackEnabled: true,
  },
  'financial-logging': {
    message: `Financial transaction logging requires strong ACID compliance, audit trails, and high write throughput. Aurora DSQL's automatic scaling and strong consistency guarantees make it perfect for this use case.

What's your expected transaction volume?`,
    nextPrompts: [
      { id: 'under-50', text: 'Under 10,000 transactions/day' },
      { id: '50-200', text: '10,000-100,000 transactions/day' },
      { id: '200-plus', text: '100,000+ transactions/day' },
    ],
    feedbackEnabled: true,
  },
  'clone-database': {
    message: `I can help you clone an existing database. This creates an exact copy of your source database with all data and schema.

Which database would you like to clone?`,
    nextPrompts: [
      { id: 'under-50', text: 'A small database (< 10 GB)' },
      { id: '50-200', text: 'A medium database (10-100 GB)' },
      { id: '200-plus', text: 'A large database (100+ GB)' },
    ],
    feedbackEnabled: true,
  },
  'migrate-ec2': {
    message: `I'll help you migrate your EC2-hosted database to Aurora. This provides better scalability, automated backups, and reduced operational overhead.

What database engine are you currently running on EC2?`,
    nextPrompts: [
      { id: 'under-50', text: 'PostgreSQL' },
      { id: '50-200', text: 'MySQL/MariaDB' },
      { id: '200-plus', text: 'Other' },
    ],
    feedbackEnabled: true,
  },
  // === CREATE DATABASE SCRIPT - Scale Selection ===
  'under-50': {
    message: `Perfect! For under 50 restaurants, here's my recommended configuration:

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
CLUSTER CONFIGURATION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
• Cluster name: food-delivery-prod
• Engine: Aurora DSQL (PostgreSQL 15.4)
• Region: us-east-1 (N. Virginia)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
INSTANCE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
• Instance class: db.r6g.medium
• vCPU: 1 core
• Memory: 8 GB RAM
• Estimated cost: ~$0.125/hour (~$90/month)
• Multi-AZ: Enabled (automatic failover)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
STORAGE & PERFORMANCE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
• Storage type: Aurora Auto-scaling
• Initial storage: 10 GB
• Max storage: 500 GB (scales automatically)
• IOPS: 3,000 baseline
• Connection pooling: Enabled (max 50 connections)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SECURITY
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
• Encryption at rest: AES-256 (AWS managed key)
• Encryption in transit: TLS 1.3
• Authentication: IAM + password
• Public access: Disabled
• VPC: Default VPC with private subnets

This smaller instance is cost-effective for your scale. Would you like to adjust the region?`,
    configUpdates: [
      { sectionId: 'instance', status: 'pending', values: { 'Instance class': 'db.r6g.medium', 'vCPU': '1', 'Memory': '8 GB', 'Multi-AZ': 'Enabled' } },
      { sectionId: 'storage', status: 'pending', values: { 'Storage type': 'Auto-scaling', 'Min storage': '10 GB', 'Max storage': '500 GB', 'IOPS': '3,000', 'Connection pool': 'Enabled (max 50)' } },
    ],
    nextPrompts: [
      { id: 'us-east-1', text: 'Keep US East (N. Virginia)' },
      { id: 'us-west-2', text: 'Change to US West (Oregon)' },
      { id: 'eu-west-1', text: 'Change to Europe (Ireland)' },
    ],
    feedbackEnabled: true,
    recommendationMeta: {
      summary: {
        engine: 'Aurora DSQL',
        instanceClass: 'db.r6g.medium',
        region: 'us-east-1',
      },
      sections: [
        {
          title: 'Cluster Configuration',
          items: {
            'Cluster name': 'food-delivery-prod',
            'Engine': 'Aurora DSQL (PostgreSQL 15.4)',
            'Region': 'us-east-1 (N. Virginia)',
          },
        },
        {
          title: 'Instance',
          items: {
            'Instance class': 'db.r6g.medium',
            'vCPU': '1 core',
            'Memory': '8 GB RAM',
            'Estimated cost': '~$0.125/hour (~$90/month)',
            'Multi-AZ': 'Enabled (automatic failover)',
          },
        },
        {
          title: 'Storage & Performance',
          items: {
            'Storage type': 'Aurora Auto-scaling',
            'Initial storage': '10 GB',
            'Max storage': '500 GB (scales automatically)',
            'IOPS': '3,000 baseline',
            'Connection pooling': 'Enabled (max 50 connections)',
          },
        },
        {
          title: 'Security',
          items: {
            'Encryption at rest': 'AES-256 (AWS managed key)',
            'Encryption in transit': 'TLS 1.3',
            'Authentication': 'IAM + password',
            'Public access': 'Disabled',
            'VPC': 'Default VPC with private subnets',
          },
        },
      ],
    },
  },
  '50-200': {
    message: `Perfect! For 50-200 restaurants, here's my recommended configuration:

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
CLUSTER CONFIGURATION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
• Cluster name: food-delivery-prod
• Engine: Aurora DSQL (PostgreSQL 15.4)
• Region: us-east-1 (N. Virginia)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
INSTANCE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
• Instance class: db.r6g.large
• vCPU: 2 cores
• Memory: 16 GB RAM
• Estimated cost: ~$0.250/hour (~$180/month)
• Multi-AZ: Enabled (automatic failover)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
STORAGE & PERFORMANCE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
• Storage type: Aurora Auto-scaling
• Initial storage: 20 GB
• Max storage: 1 TB (scales automatically)
• IOPS: 3,000 baseline (bursts to 10,000)
• Connection pooling: Enabled (max 100 connections)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SECURITY
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
• Encryption at rest: AES-256 (AWS managed key)
• Encryption in transit: TLS 1.3
• Authentication: IAM + password
• Public access: Disabled
• VPC: Default VPC with private subnets

This configuration can handle ~500 concurrent orders and supports your expected growth. Would you like to adjust the region?`,
    nextPrompts: [
      { id: 'us-east-1', text: 'Keep US East (N. Virginia)' },
      { id: 'us-west-2', text: 'Change to US West (Oregon)' },
      { id: 'eu-west-1', text: 'Change to Europe (Ireland)' },
    ],
    feedbackEnabled: true,
    recommendationMeta: {
      summary: {
        engine: 'Aurora DSQL',
        instanceClass: 'db.r6g.large',
        region: 'us-east-1',
      },
      sections: [
        {
          title: 'Cluster Configuration',
          items: {
            'Cluster name': 'food-delivery-prod',
            'Engine': 'Aurora DSQL (PostgreSQL 15.4)',
            'Region': 'us-east-1 (N. Virginia)',
          },
        },
        {
          title: 'Instance',
          items: {
            'Instance class': 'db.r6g.large',
            'vCPU': '2 cores',
            'Memory': '16 GB RAM',
            'Estimated cost': '~$0.250/hour (~$180/month)',
            'Multi-AZ': 'Enabled (automatic failover)',
          },
        },
        {
          title: 'Storage & Performance',
          items: {
            'Storage type': 'Aurora Auto-scaling',
            'Initial storage': '20 GB',
            'Max storage': '1 TB (scales automatically)',
            'IOPS': '3,000 baseline (bursts to 10,000)',
            'Connection pooling': 'Enabled (max 100 connections)',
          },
        },
        {
          title: 'Security',
          items: {
            'Encryption at rest': 'AES-256 (AWS managed key)',
            'Encryption in transit': 'TLS 1.3',
            'Authentication': 'IAM + password',
            'Public access': 'Disabled',
            'VPC': 'Default VPC with private subnets',
          },
        },
      ],
    },
  },
  '200-plus': {
    message: `Excellent! For 200+ restaurants, you'll need a robust configuration:

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
CLUSTER CONFIGURATION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
• Cluster name: food-delivery-prod
• Engine: Aurora DSQL (PostgreSQL 15.4)
• Region: us-east-1 (N. Virginia)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
INSTANCE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
• Instance class: db.r6g.xlarge
• vCPU: 4 cores
• Memory: 32 GB RAM
• Estimated cost: ~$0.500/hour (~$360/month)
• Multi-AZ: Enabled (automatic failover)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
STORAGE & PERFORMANCE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
• Storage type: Aurora Auto-scaling
• Initial storage: 50 GB
• Max storage: 2 TB (scales automatically)
• IOPS: 6,000 baseline (bursts to 20,000)
• Connection pooling: Enabled (max 200 connections)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SECURITY
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
• Encryption at rest: AES-256 (AWS managed key)
• Encryption in transit: TLS 1.3
• Authentication: IAM + password
• Public access: Disabled
• VPC: Default VPC with private subnets

This high-capacity configuration handles 1000+ concurrent orders with room to grow. Would you like to adjust the region?`,
    configUpdates: [
      { sectionId: 'instance', status: 'pending', values: { 'Instance class': 'db.r6g.xlarge', 'vCPU': '4', 'Memory': '32 GB', 'Multi-AZ': 'Enabled' } },
      { sectionId: 'storage', status: 'pending', values: { 'Storage type': 'Auto-scaling', 'Min storage': '50 GB', 'Max storage': '2 TB', 'IOPS': '6,000 (auto-scales)', 'Connection pool': 'Enabled (max 200)' } },
    ],
    nextPrompts: [
      { id: 'us-east-1', text: 'Keep US East (N. Virginia)' },
      { id: 'us-west-2', text: 'Change to US West (Oregon)' },
      { id: 'eu-west-1', text: 'Change to Europe (Ireland)' },
    ],
    feedbackEnabled: true,
    recommendationMeta: {
      summary: {
        engine: 'Aurora DSQL',
        instanceClass: 'db.r6g.xlarge',
        region: 'us-east-1',
      },
      sections: [
        {
          title: 'Cluster Configuration',
          items: {
            'Cluster name': 'food-delivery-prod',
            'Engine': 'Aurora DSQL (PostgreSQL 15.4)',
            'Region': 'us-east-1 (N. Virginia)',
          },
        },
        {
          title: 'Instance',
          items: {
            'Instance class': 'db.r6g.xlarge',
            'vCPU': '4 cores',
            'Memory': '32 GB RAM',
            'Estimated cost': '~$0.500/hour (~$360/month)',
            'Multi-AZ': 'Enabled (automatic failover)',
          },
        },
        {
          title: 'Storage & Performance',
          items: {
            'Storage type': 'Aurora Auto-scaling',
            'Initial storage': '50 GB',
            'Max storage': '2 TB (scales automatically)',
            'IOPS': '6,000 baseline (bursts to 20,000)',
            'Connection pooling': 'Enabled (max 200 connections)',
          },
        },
        {
          title: 'Security',
          items: {
            'Encryption at rest': 'AES-256 (AWS managed key)',
            'Encryption in transit': 'TLS 1.3',
            'Authentication': 'IAM + password',
            'Public access': 'Disabled',
            'VPC': 'Default VPC with private subnets',
          },
        },
      ],
    },
  },

  // === CREATE DATABASE SCRIPT - Region Selection (End of Step 1: Context and Requirements) ===
  'us-east-1': {
    message: `Great choice! US East (N. Virginia) offers the lowest latency for East Coast users and has the most AWS services available.

Here's your final configuration summary:

• Aurora DSQL cluster in US East (N. Virginia)
• Instance sized for your scale with Multi-AZ
• Auto-scaling storage
• Full encryption and IAM authentication

How would you like to proceed?`,
    configUpdates: [
      { sectionId: 'cluster', status: 'success', values: { 'Cluster name': 'food-delivery-prod', 'Engine': 'Aurora DSQL (PostgreSQL)', 'Region': 'us-east-1' } },
    ],
    actions: [
      { id: 'auto-setup', label: 'Auto DB setup', variant: 'primary' },
      { id: 'configure-manual', label: 'Customize' },
    ],
    stepCompleted: 'Context and requirements',
    updateStep: { stepId: 'context-requirements', status: 'success' },
    feedbackEnabled: true,
  },
  'us-west-2': {
    message: `Good choice! US West (Oregon) is excellent for West Coast users and offers competitive pricing.

Here's your final configuration summary:

• Aurora DSQL cluster in US West (Oregon)
• Instance sized for your scale with Multi-AZ
• Auto-scaling storage
• Full encryption and IAM authentication

How would you like to proceed?`,
    configUpdates: [
      { sectionId: 'cluster', status: 'success', values: { 'Cluster name': 'food-delivery-prod', 'Engine': 'Aurora DSQL (PostgreSQL)', 'Region': 'us-west-2' } },
    ],
    actions: [
      { id: 'auto-setup', label: 'Auto DB setup', variant: 'primary' },
      { id: 'configure-manual', label: 'Customize' },
    ],
    stepCompleted: 'Context and requirements',
    updateStep: { stepId: 'context-requirements', status: 'success' },
    feedbackEnabled: true,
  },
  'eu-west-1': {
    message: `Good choice! Europe (Ireland) is ideal for European users and ensures GDPR compliance.

Here's your final configuration summary:

• Aurora DSQL cluster in Europe (Ireland)
• Instance sized for your scale with Multi-AZ
• Auto-scaling storage
• Full encryption and IAM authentication

How would you like to proceed?`,
    configUpdates: [
      { sectionId: 'cluster', status: 'success', values: { 'Cluster name': 'food-delivery-prod', 'Engine': 'Aurora DSQL (PostgreSQL)', 'Region': 'eu-west-1' } },
    ],
    actions: [
      { id: 'auto-setup', label: 'Auto DB setup', variant: 'primary' },
      { id: 'configure-manual', label: 'Customize' },
    ],
    stepCompleted: 'Context and requirements',
    updateStep: { stepId: 'context-requirements', status: 'success' },
    feedbackEnabled: true,
  },

  // === CUSTOMIZE FLOW - Cluster Review ===
  'cluster-confirm': {
    message: `✓ Cluster configuration confirmed.

Now let's review the Instance settings:

• Instance class: db.r6g.large
• vCPU: 2 cores
• Memory: 16 GB RAM
• Multi-AZ: Enabled (automatic failover)
• Estimated cost: ~$0.250/hour (~$180/month)

This can handle ~500 concurrent orders. Would you like to adjust the instance size?`,
    configUpdates: [
      { sectionId: 'cluster', status: 'success' },
      { sectionId: 'instance', status: 'in-progress' },
    ],
    nextPrompts: [
      { id: 'instance-confirm', text: 'Looks good, continue' },
      { id: 'instance-smaller', text: 'Use smaller (save cost)' },
      { id: 'instance-larger', text: 'Use larger (more capacity)' },
    ],
    feedbackEnabled: true,
  },
  'cluster-change-name': {
    message: `I can update the cluster name. For a food delivery platform, I'd suggest something descriptive like:

• food-delivery-prod (production)
• food-delivery-staging (staging/test)
• fd-orders-cluster (if order-focused)

What name would you like to use?`,
    configUpdates: [
      { sectionId: 'cluster', status: 'in-progress' },
    ],
    nextPrompts: [
      { id: 'name-prod', text: 'Use food-delivery-prod' },
      { id: 'name-staging', text: 'Use food-delivery-staging' },
      { id: 'name-orders', text: 'Use fd-orders-cluster' },
    ],
    feedbackEnabled: true,
  },
  'cluster-change-region': {
    message: `Here are the available regions for Aurora DSQL:

• US East (N. Virginia) - us-east-1 ← Current
  → Lowest latency for East Coast, most services available

• US West (Oregon) - us-west-2
  → Great for West Coast users, competitive pricing

• Europe (Ireland) - eu-west-1
  → Ideal for European users, GDPR compliant

Which region would you prefer?`,
    configUpdates: [
      { sectionId: 'cluster', status: 'in-progress' },
    ],
    nextPrompts: [
      { id: 'region-us-east', text: 'Keep US East (N. Virginia)' },
      { id: 'region-us-west', text: 'US West (Oregon)' },
      { id: 'region-eu', text: 'Europe (Ireland)' },
    ],
    feedbackEnabled: true,
  },
  'name-prod': {
    message: `✓ Cluster name set to "food-delivery-prod"

Now let's review the Instance settings:

• Instance class: db.r6g.large
• vCPU: 2 cores
• Memory: 16 GB RAM
• Multi-AZ: Enabled (automatic failover)
• Estimated cost: ~$0.250/hour (~$180/month)

Would you like to adjust the instance size?`,
    configUpdates: [
      { sectionId: 'cluster', status: 'success', values: { 'Cluster name': 'food-delivery-prod', 'Engine': 'Aurora DSQL (PostgreSQL)', 'Region': 'us-east-1' } },
      { sectionId: 'instance', status: 'in-progress' },
    ],
    nextPrompts: [
      { id: 'instance-confirm', text: 'Looks good, continue' },
      { id: 'instance-smaller', text: 'Use smaller (save cost)' },
      { id: 'instance-larger', text: 'Use larger (more capacity)' },
    ],
    feedbackEnabled: true,
  },
  'name-staging': {
    message: `✓ Cluster name set to "food-delivery-staging"

Now let's review the Instance settings:

• Instance class: db.r6g.large
• vCPU: 2 cores
• Memory: 16 GB RAM
• Multi-AZ: Enabled (automatic failover)
• Estimated cost: ~$0.250/hour (~$180/month)

Would you like to adjust the instance size?`,
    configUpdates: [
      { sectionId: 'cluster', status: 'success', values: { 'Cluster name': 'food-delivery-staging', 'Engine': 'Aurora DSQL (PostgreSQL)', 'Region': 'us-east-1' } },
      { sectionId: 'instance', status: 'in-progress' },
    ],
    nextPrompts: [
      { id: 'instance-confirm', text: 'Looks good, continue' },
      { id: 'instance-smaller', text: 'Use smaller (save cost)' },
      { id: 'instance-larger', text: 'Use larger (more capacity)' },
    ],
    feedbackEnabled: true,
  },
  'name-orders': {
    message: `✓ Cluster name set to "fd-orders-cluster"

Now let's review the Instance settings:

• Instance class: db.r6g.large
• vCPU: 2 cores
• Memory: 16 GB RAM
• Multi-AZ: Enabled (automatic failover)
• Estimated cost: ~$0.250/hour (~$180/month)

Would you like to adjust the instance size?`,
    configUpdates: [
      { sectionId: 'cluster', status: 'success', values: { 'Cluster name': 'fd-orders-cluster', 'Engine': 'Aurora DSQL (PostgreSQL)', 'Region': 'us-east-1' } },
      { sectionId: 'instance', status: 'in-progress' },
    ],
    nextPrompts: [
      { id: 'instance-confirm', text: 'Looks good, continue' },
      { id: 'instance-smaller', text: 'Use smaller (save cost)' },
      { id: 'instance-larger', text: 'Use larger (more capacity)' },
    ],
    feedbackEnabled: true,
  },
  'region-us-east': {
    message: `✓ Region confirmed: US East (N. Virginia)

Now let's review the Instance settings:

• Instance class: db.r6g.large
• vCPU: 2 cores
• Memory: 16 GB RAM
• Multi-AZ: Enabled (automatic failover)

Would you like to adjust the instance size?`,
    configUpdates: [
      { sectionId: 'cluster', status: 'success', values: { 'Cluster name': 'food-delivery-prod', 'Engine': 'Aurora DSQL (PostgreSQL)', 'Region': 'us-east-1' } },
      { sectionId: 'instance', status: 'in-progress' },
    ],
    nextPrompts: [
      { id: 'instance-confirm', text: 'Looks good, continue' },
      { id: 'instance-smaller', text: 'Use smaller (save cost)' },
      { id: 'instance-larger', text: 'Use larger (more capacity)' },
    ],
    feedbackEnabled: true,
  },
  'region-us-west': {
    message: `✓ Region updated to: US West (Oregon)

Now let's review the Instance settings:

• Instance class: db.r6g.large
• vCPU: 2 cores
• Memory: 16 GB RAM
• Multi-AZ: Enabled (automatic failover)

Would you like to adjust the instance size?`,
    configUpdates: [
      { sectionId: 'cluster', status: 'success', values: { 'Cluster name': 'food-delivery-prod', 'Engine': 'Aurora DSQL (PostgreSQL)', 'Region': 'us-west-2' } },
      { sectionId: 'instance', status: 'in-progress' },
    ],
    nextPrompts: [
      { id: 'instance-confirm', text: 'Looks good, continue' },
      { id: 'instance-smaller', text: 'Use smaller (save cost)' },
      { id: 'instance-larger', text: 'Use larger (more capacity)' },
    ],
    feedbackEnabled: true,
  },
  'region-eu': {
    message: `✓ Region updated to: Europe (Ireland)

Now let's review the Instance settings:

• Instance class: db.r6g.large
• vCPU: 2 cores
• Memory: 16 GB RAM
• Multi-AZ: Enabled (automatic failover)

Would you like to adjust the instance size?`,
    configUpdates: [
      { sectionId: 'cluster', status: 'success', values: { 'Cluster name': 'food-delivery-prod', 'Engine': 'Aurora DSQL (PostgreSQL)', 'Region': 'eu-west-1' } },
      { sectionId: 'instance', status: 'in-progress' },
    ],
    nextPrompts: [
      { id: 'instance-confirm', text: 'Looks good, continue' },
      { id: 'instance-smaller', text: 'Use smaller (save cost)' },
      { id: 'instance-larger', text: 'Use larger (more capacity)' },
    ],
    feedbackEnabled: true,
  },

  // === CUSTOMIZE FLOW - Instance Review ===
  'instance-confirm': {
    message: `✓ Instance configuration confirmed: db.r6g.large

Now let's review the Storage & Performance settings:

• Storage type: Aurora Auto-scaling
• Initial storage: 20 GB
• Max storage: 1 TB (scales automatically)
• IOPS: 3,000 baseline (bursts to 10,000)
• Connection pooling: Enabled (max 100 connections)

Auto-scaling means you only pay for what you use. Any changes needed?`,
    configUpdates: [
      { sectionId: 'instance', status: 'success' },
      { sectionId: 'storage', status: 'in-progress' },
    ],
    nextPrompts: [
      { id: 'storage-confirm', text: 'Looks good, continue' },
      { id: 'storage-increase-max', text: 'Increase max storage' },
      { id: 'storage-more-iops', text: 'Need more IOPS' },
    ],
    feedbackEnabled: true,
  },
  'instance-smaller': {
    message: `✓ Instance updated to db.r6g.medium

• Instance class: db.r6g.medium
• vCPU: 1 core
• Memory: 8 GB RAM
• Multi-AZ: Enabled
• Estimated cost: ~$0.125/hour (~$90/month) — 50% savings!

Great for development or smaller workloads. Now let's review Storage:

• Storage type: Aurora Auto-scaling
• Initial storage: 20 GB
• Max storage: 1 TB
• IOPS: 3,000 baseline

Any changes needed?`,
    configUpdates: [
      { sectionId: 'instance', status: 'success', values: { 'Instance class': 'db.r6g.medium', 'vCPU': '1', 'Memory': '8 GB', 'Multi-AZ': 'Enabled' } },
      { sectionId: 'storage', status: 'in-progress' },
    ],
    nextPrompts: [
      { id: 'storage-confirm', text: 'Looks good, continue' },
      { id: 'storage-increase-max', text: 'Increase max storage' },
      { id: 'storage-more-iops', text: 'Need more IOPS' },
    ],
    feedbackEnabled: true,
  },
  'instance-larger': {
    message: `✓ Instance updated to db.r6g.xlarge

• Instance class: db.r6g.xlarge
• vCPU: 4 cores
• Memory: 32 GB RAM
• Multi-AZ: Enabled
• Estimated cost: ~$0.500/hour (~$360/month)

This handles 1000+ concurrent orders with headroom for growth. Now let's review Storage:

• Storage type: Aurora Auto-scaling
• Initial storage: 20 GB
• Max storage: 1 TB
• IOPS: 3,000 baseline (bursts to 10,000)

Any changes needed?`,
    configUpdates: [
      { sectionId: 'instance', status: 'success', values: { 'Instance class': 'db.r6g.xlarge', 'vCPU': '4', 'Memory': '32 GB', 'Multi-AZ': 'Enabled' } },
      { sectionId: 'storage', status: 'in-progress' },
    ],
    nextPrompts: [
      { id: 'storage-confirm', text: 'Looks good, continue' },
      { id: 'storage-increase-max', text: 'Increase max storage' },
      { id: 'storage-more-iops', text: 'Need more IOPS' },
    ],
    feedbackEnabled: true,
  },

  // === CUSTOMIZE FLOW - Storage Review ===
  'storage-confirm': {
    message: `✓ Storage configuration confirmed.

Finally, let's review the Security settings:

• Encryption at rest: AES-256 (AWS managed key)
• Encryption in transit: TLS 1.3
• Authentication: IAM + password
• Public access: Disabled
• VPC: Default VPC with private subnets

These are secure defaults for production. Any changes?`,
    configUpdates: [
      { sectionId: 'storage', status: 'success' },
      { sectionId: 'security', status: 'in-progress' },
    ],
    nextPrompts: [
      { id: 'security-confirm', text: 'Looks good, continue' },
      { id: 'security-custom-key', text: 'Use custom encryption key' },
      { id: 'security-change-vpc', text: 'Change VPC settings' },
    ],
    feedbackEnabled: true,
  },
  'storage-increase-max': {
    message: `✓ Storage updated with higher capacity:

• Storage type: Aurora Auto-scaling
• Initial storage: 50 GB
• Max storage: 4 TB (increased from 1 TB)
• IOPS: 6,000 baseline (bursts to 20,000)
• Connection pooling: Enabled (max 150 connections)

This gives you 4x the storage headroom. Now let's review Security:

• Encryption at rest: AES-256 (AWS managed key)
• Encryption in transit: TLS 1.3
• Public access: Disabled

Any security changes needed?`,
    configUpdates: [
      { sectionId: 'storage', status: 'success', values: { 'Storage type': 'Auto-scaling', 'Min storage': '50 GB', 'Max storage': '4 TB', 'IOPS': '6,000 (auto-scales)', 'Connection pool': 'Enabled (max 150)' } },
      { sectionId: 'security', status: 'in-progress' },
    ],
    nextPrompts: [
      { id: 'security-confirm', text: 'Looks good, continue' },
      { id: 'security-custom-key', text: 'Use custom encryption key' },
      { id: 'security-change-vpc', text: 'Change VPC settings' },
    ],
    feedbackEnabled: true,
  },
  'storage-more-iops': {
    message: `✓ Storage updated for high performance:

• Storage type: Aurora Auto-scaling
• Initial storage: 20 GB
• Max storage: 1 TB
• IOPS: 10,000 provisioned (consistent performance)
• Connection pooling: Enabled (max 200 connections)

Provisioned IOPS ensures consistent performance during peak times. Now let's review Security:

• Encryption at rest: AES-256 (AWS managed key)
• Encryption in transit: TLS 1.3
• Public access: Disabled

Any security changes needed?`,
    configUpdates: [
      { sectionId: 'storage', status: 'success', values: { 'Storage type': 'Provisioned IOPS', 'Min storage': '20 GB', 'Max storage': '1 TB', 'IOPS': '10,000 provisioned', 'Connection pool': 'Enabled (max 200)' } },
      { sectionId: 'security', status: 'in-progress' },
    ],
    nextPrompts: [
      { id: 'security-confirm', text: 'Looks good, continue' },
      { id: 'security-custom-key', text: 'Use custom encryption key' },
      { id: 'security-change-vpc', text: 'Change VPC settings' },
    ],
    feedbackEnabled: true,
  },

  // === CUSTOMIZE FLOW - Security Confirmation (triggers script Step 4 for final summary) ===
  'security-confirm': {
    message: `✓ Security configuration confirmed.

All configuration sections have been reviewed.`,
    configUpdates: [
      { sectionId: 'security', status: 'success' },
    ],
    feedbackEnabled: true,
    // Note: No actions here - script Step 4 will show the final summary with Create database button
  },
  'security-custom-key': {
    message: `✓ Security updated with custom encryption:

• Encryption at rest: AES-256 (Customer managed KMS key)
• Encryption in transit: TLS 1.3
• Authentication: IAM + password
• Public access: Disabled
• VPC: Default VPC with private subnets

Using your own KMS key gives you full control over key rotation and access policies.`,
    configUpdates: [
      { sectionId: 'security', status: 'success', values: { 'Encryption': 'Enabled (Customer managed key)', 'Public access': 'Disabled', 'IAM auth': 'Enabled', 'VPC': 'Default VPC' } },
    ],
    feedbackEnabled: true,
  },
  'security-change-vpc': {
    message: `✓ Security updated with custom VPC:

• Encryption at rest: AES-256 (AWS managed key)
• Encryption in transit: TLS 1.3
• Authentication: IAM + password
• Public access: Disabled
• VPC: Custom VPC (vpc-food-delivery)
• Subnets: Private subnets across 3 AZs

Your database will be deployed in your custom VPC for network isolation.`,
    configUpdates: [
      { sectionId: 'security', status: 'success', values: { 'Encryption': 'Enabled (AWS managed key)', 'Public access': 'Disabled', 'IAM auth': 'Enabled', 'VPC': 'Custom VPC (vpc-food-delivery)' } },
    ],
    feedbackEnabled: true,
  },

  // === Review Configuration (from final summary) ===
  'review-again': {
    message: `Let's review your configuration. Here's what we have:

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
CLUSTER
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
• Cluster name: food-delivery-prod
• Engine: Aurora DSQL (PostgreSQL 15.4)
• Region: us-east-1

Which section would you like to modify?`,
    nextPrompts: [
      { id: 'cluster-change-name', text: 'Change cluster name' },
      { id: 'cluster-change-region', text: 'Change region' },
      { id: 'back-to-summary', text: 'Back to summary' },
    ],
    feedbackEnabled: true,
  },

  // === Back to Summary ===
  'back-to-summary': {
    message: `Here's your final configuration summary:

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SUMMARY
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
• Cluster: food-delivery-prod (Aurora DSQL)
• Instance: db.r6g.large (2 vCPU, 16 GB)
• Storage: Auto-scaling up to 1 TB
• Security: Encrypted, private access, IAM auth

Ready to create your database?`,
    actions: [
      { id: 'start-build-configured', label: 'Create database', variant: 'primary' },
      { id: 'review-again', label: 'Review settings' },
    ],
    stepCompleted: 'DB Design',
    updateStep: { stepId: 'db-design', status: 'success' },
    feedbackEnabled: true,
  },

  // ===== MIGRATION FLOW PROMPT RESPONSES =====
  // Source Discovery
  'source-ec2': {
    message: '', // Handled by script - just advance
    feedbackEnabled: false,
  },
  'source-onprem': {
    message: '', // Handled by script - just advance
    feedbackEnabled: false,
  },
  'source-other-cloud': {
    message: '', // Handled by script - just advance
    feedbackEnabled: false,
  },
  'ec2-prod': {
    message: '', // Handled by script - just advance
    feedbackEnabled: false,
  },
  'ec2-staging': {
    message: '', // Handled by script - just advance
    feedbackEnabled: false,
  },
  'ec2-manual': {
    message: '', // Handled by script - just advance
    feedbackEnabled: false,
  },
  'db-ecommerce': {
    message: '', // Handled by script - just advance
    feedbackEnabled: false,
  },
  'db-analytics': {
    message: '', // Handled by script - just advance
    feedbackEnabled: false,
  },
  'db-manual': {
    message: '', // Handled by script - just advance
    feedbackEnabled: false,
  },

  // Target Configuration (for customize option)
  'target-change-instance': {
    message: `I can adjust the instance size. Based on your 45 GB database, here are the options:

• db.r6g.large (current): 2 vCPU, 16 GB - Good for moderate workloads
• db.r6g.xlarge: 4 vCPU, 32 GB - Better for high concurrency
• db.r6g.2xlarge: 8 vCPU, 64 GB - Best for heavy workloads

Which would you prefer?`,
    nextPrompts: [
      { id: 'instance-large', text: 'db.r6g.large (16 GB)' },
      { id: 'instance-xlarge', text: 'db.r6g.xlarge (32 GB)' },
      { id: 'instance-2xlarge', text: 'db.r6g.2xlarge (64 GB)' },
    ],
    feedbackEnabled: true,
  },
  'target-change-region': {
    message: `Available regions for Aurora DSQL:

• us-east-1 (N. Virginia) - Same as source, lowest latency
• us-west-2 (Oregon) - West Coast presence
• eu-west-1 (Ireland) - European compliance

Which region would you prefer?`,
    nextPrompts: [
      { id: 'region-us-east-1', text: 'us-east-1 (same as source)' },
      { id: 'region-us-west-2', text: 'us-west-2 (Oregon)' },
      { id: 'region-eu-west-1', text: 'eu-west-1 (Ireland)' },
    ],
    feedbackEnabled: true,
  },
  'instance-large': {
    message: '', // Handled by script - just advance
    feedbackEnabled: false,
  },
  'instance-xlarge': {
    message: '', // Handled by script - just advance
    feedbackEnabled: false,
  },
  'instance-2xlarge': {
    message: '', // Handled by script - just advance
    feedbackEnabled: false,
  },
  'region-us-east-1': {
    message: '', // Handled by script - just advance
    feedbackEnabled: false,
  },
  'region-us-west-2': {
    message: '', // Handled by script - just advance
    feedbackEnabled: false,
  },
  'region-eu-west-1': {
    message: '', // Handled by script - just advance
    feedbackEnabled: false,
  },

  // Migration Settings
  'migration-settings-confirm': {
    message: '', // Handled by script - just advance
    feedbackEnabled: false,
  },
  'migration-select-tables': {
    message: `Select which tables to include in the migration:

All tables are selected by default. You can exclude tables that aren't needed in the target.`,
    nextPrompts: [
      { id: 'tables-all', text: 'Migrate all tables' },
      { id: 'tables-exclude-audit', text: 'Exclude audit tables' },
      { id: 'tables-core-only', text: 'Core tables only' },
    ],
    feedbackEnabled: true,
  },
  'migration-change-type': {
    message: `Migration type options:

• Full load + CDC: Complete data copy with ongoing replication (recommended)
• Full load only: One-time data copy, no ongoing sync
• CDC only: Only replicate changes (requires existing schema)

Which type would you prefer?`,
    nextPrompts: [
      { id: 'type-full-cdc', text: 'Full load + CDC (recommended)' },
      { id: 'type-full-only', text: 'Full load only' },
      { id: 'type-cdc-only', text: 'CDC only' },
    ],
    feedbackEnabled: true,
  },
  'tables-all': {
    message: '', // Handled by script - just advance
    feedbackEnabled: false,
  },
  'tables-exclude-audit': {
    message: '', // Handled by script - just advance
    feedbackEnabled: false,
  },
  'tables-core-only': {
    message: '', // Handled by script - just advance
    feedbackEnabled: false,
  },
  'type-full-cdc': {
    message: '', // Handled by script - just advance
    feedbackEnabled: false,
  },
  'type-full-only': {
    message: '', // Handled by script - just advance
    feedbackEnabled: false,
  },
  'type-cdc-only': {
    message: '', // Handled by script - just advance
    feedbackEnabled: false,
  },

  // Schedule
  'schedule-now': {
    message: '', // Handled by script - just advance
    feedbackEnabled: false,
  },
  'schedule-tonight': {
    message: '', // Handled by script - just advance
    feedbackEnabled: false,
  },
  'schedule-weekend': {
    message: '', // Handled by script - just advance
    feedbackEnabled: false,
  },
  'schedule-custom': {
    message: '', // Handled by script - just advance
    feedbackEnabled: false,
  },
};

// Food delivery CREATE DATABASE demo script
// Flow: All questions in Step 1 (chat) → Auto runs uninterrupted in Step 2 (design) → Review in Step 3
const CREATE_DATABASE_SCRIPT: DemoStep[] = [
  // Step 0: Initial response - ask about scale
  {
    agentMessage: {
      type: 'agent',
      content: `Great choice! A food delivery platform has some interesting data requirements. Based on your need for real-time order tracking, I'd recommend Aurora DSQL - it handles high write throughput for order updates while maintaining strong consistency for payments.

How many restaurants are you planning to support initially?`,
      feedbackEnabled: true,
    },
    prompts: [
      { id: 'under-50', text: 'Under 50 restaurants' },
      { id: '50-200', text: '50-200 restaurants' },
      { id: '200-plus', text: '200+ restaurants' },
    ],
    delay: 1500,
  },
  // Step 1: After scale - show full recommended configuration
  {
    agentMessage: {
      type: 'agent',
      content: `Perfect! For 50-200 restaurants, here's my recommended configuration:

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
CLUSTER CONFIGURATION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
• Cluster name: food-delivery-prod
• Engine: Aurora DSQL (PostgreSQL 15.4)
• Region: us-east-1 (N. Virginia)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
INSTANCE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
• Instance class: db.r6g.large
• vCPU: 2 cores
• Memory: 16 GB RAM
• Estimated cost: ~$0.250/hour (~$180/month)
• Multi-AZ: Enabled (automatic failover)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
STORAGE & PERFORMANCE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
• Storage type: Aurora Auto-scaling
• Initial storage: 20 GB
• Max storage: 1 TB (scales automatically)
• IOPS: 3,000 baseline (bursts to 10,000)
• Connection pooling: Enabled (max 100 connections)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SECURITY
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
• Encryption at rest: AES-256 (AWS managed key)
• Encryption in transit: TLS 1.3
• Authentication: IAM + password
• Public access: Disabled
• VPC: Default VPC with private subnets

This configuration can handle ~500 concurrent orders and supports your expected growth. Would you like to adjust the region?`,
      feedbackEnabled: true,
    },
    prompts: [
      { id: 'us-east-1', text: 'Keep US East (N. Virginia)' },
      { id: 'us-west-2', text: 'Change to US West (Oregon)' },
      { id: 'eu-west-1', text: 'Change to Europe (Ireland)' },
    ],
    delay: 1500,
  },
  // Step 2: Summary and action buttons - completes Step 1
  {
    agentMessage: {
      type: 'agent',
      content: `Here's what I'll set up for your food delivery platform:

• Aurora DSQL cluster in US East (N. Virginia)
• db.r6g.large instance (2 vCPU, 16 GB RAM)
• Auto-scaling storage (20 GB - 1 TB)
• Multi-AZ enabled for high availability
• IAM authentication and encryption enabled

How would you like to proceed?`,
      feedbackEnabled: true,
      actions: [
        { id: 'auto-setup', label: 'Auto DB setup', variant: 'primary' },
        { id: 'configure-manual', label: 'Customize' },
      ],
      stepCompleted: 'Context and requirements',
    },
    updateStep: { stepId: 'context-requirements', status: 'success' },
    delay: 1500,
  },
  // Step 3: Auto setup starts - transition to design view, open drawer
  {
    agentMessage: {
      type: 'agent',
      content: `Starting automated setup. I'll configure everything and keep you updated on the progress.`,
    },
    transitionView: 'design',
    setPath: 'auto-setup',
    updateStep: { stepId: 'db-design', status: 'in-progress' },
    updateConfigSection: {
      sectionId: 'cluster',
      status: 'in-progress',
      values: {
        'Cluster name': 'food-delivery-prod',
        'Engine': 'Aurora DSQL (PostgreSQL)',
        'Region': 'us-east-1',
      },
    },
    delay: 1000,
  },
  // Step 4: Cluster complete
  {
    agentMessage: {
      type: 'agent',
      content: `✓ Cluster configuration complete
• Configuring instance...`,
    },
    updateConfigSection: {
      sectionId: 'cluster',
      status: 'success',
      values: {
        'Cluster name': 'food-delivery-prod',
        'Engine': 'Aurora DSQL (PostgreSQL)',
        'Region': 'us-east-1',
      },
    },
    delay: 1500,
  },
  // Step 5: Instance complete
  {
    agentMessage: {
      type: 'agent',
      content: `✓ Cluster configuration complete
✓ Instance provisioned
• Configuring storage...`,
    },
    updateConfigSection: {
      sectionId: 'instance',
      status: 'success',
      values: {
        'Instance class': 'db.r6g.large',
        'vCPU': '2',
        'Memory': '16 GB',
        'Multi-AZ': 'Enabled',
      },
    },
    createResource: {
      id: 'food-delivery-db-001',
      name: 'food-delivery-prod - us-east-1',
      type: 'Aurora DSQL - PostgreSQL',
      region: 'us-east-1',
      status: 'creating',
    },
    delay: 1500,
  },
  // Step 6: Storage complete
  {
    agentMessage: {
      type: 'agent',
      content: `✓ Cluster configuration complete
✓ Instance provisioned
✓ Storage configured
• Applying security settings...`,
    },
    updateConfigSection: {
      sectionId: 'storage',
      status: 'success',
      values: {
        'Storage type': 'Auto-scaling',
        'Min storage': '20 GB',
        'Max storage': '1 TB',
        'IOPS': '3,000 (auto-scales)',
        'Connection pool': 'Enabled (max 100)',
      },
    },
    delay: 1500,
  },
  // Step 7: Security complete - DB Design step complete
  {
    agentMessage: {
      type: 'agent',
      content: `✓ Cluster configuration complete
✓ Instance provisioned
✓ Storage configured
✓ Security settings applied

All configuration complete! Generating connection endpoints...`,
      stepCompleted: 'DB Design',
    },
    updateStep: { stepId: 'db-design', status: 'success' },
    updateConfigSection: {
      sectionId: 'security',
      status: 'success',
      values: {
        'Encryption': 'Enabled (AWS managed key)',
        'Public access': 'Disabled',
        'IAM auth': 'Enabled',
        'VPC': 'Default VPC',
      },
    },
    delay: 1500,
  },
  // Step 8: Transition to review - offer completion
  {
    agentMessage: {
      type: 'status',
      content: `Your database is ready! Click Complete to finalize and view your connection details.`,
      actions: [
        { id: 'complete-setup', label: 'Complete', variant: 'primary' },
      ],
    },
    transitionView: 'review',
    updateStep: { stepId: 'review-finish', status: 'in-progress' },
    delay: 1000,
  },
  // Step 9: Completion
  {
    agentMessage: {
      type: 'agent',
      content: `Your food delivery database is ready!

Endpoint: food-delivery-xyz.dsql.us-east-1.on.aws

What would you like to do next?`,
      feedbackEnabled: true,
      stepCompleted: 'Review and finish',
    },
    updateStep: { stepId: 'review-finish', status: 'success' },
    createResource: {
      id: 'food-delivery-db-001',
      name: 'food-delivery-prod - us-east-1',
      type: 'Aurora DSQL - PostgreSQL',
      region: 'us-east-1',
      status: 'active',
      endpoint: 'food-delivery-xyz.dsql.us-east-1.on.aws',
      details: {
        'Cluster ID': 'food-delivery-prod-xyz',
        'Engine': 'Aurora DSQL',
        'Auto-scaling': 'Enabled',
      },
    },
    prompts: [
      { id: 'view-database', text: 'View the database' },
      { id: 'import', text: 'Import sample data' },
      { id: 'connect', text: 'Connect to my cluster' },
    ],
    delay: 1500,
  },
];

// CUSTOMIZE demo script - interactive configuration through conversation
// Flow: All sections populated → Review each section step-by-step → Build
const CONFIGURE_TOGETHER_SCRIPT: DemoStep[] = [
  // Step 0: Populate ALL sections, start reviewing Cluster
  {
    agentMessage: {
      type: 'agent',
      content: `Let's review each configuration section together. I've loaded the recommended settings based on your requirements.

Let's start with the Cluster Configuration:

• Cluster name: food-delivery-prod
• Engine: Aurora DSQL (PostgreSQL 15.4)
• Region: us-east-1 (N. Virginia)

Does this look good, or would you like to make changes?`,
      feedbackEnabled: true,
    },
    transitionView: 'design',
    setPath: 'customize',
    updateStep: { stepId: 'db-design', status: 'in-progress' },
    updateConfigSections: [
      {
        sectionId: 'cluster',
        status: 'in-progress',
        values: {
          'Cluster name': 'food-delivery-prod',
          'Engine': 'Aurora DSQL (PostgreSQL)',
          'Region': 'us-east-1',
        },
      },
      {
        sectionId: 'instance',
        status: 'pending',
        values: {
          'Instance class': 'db.r6g.large',
          'vCPU': '2',
          'Memory': '16 GB',
          'Multi-AZ': 'Enabled',
        },
      },
      {
        sectionId: 'storage',
        status: 'pending',
        values: {
          'Storage type': 'Auto-scaling',
          'Min storage': '20 GB',
          'Max storage': '1 TB',
          'IOPS': '3,000 (auto-scales)',
          'Connection pool': 'Enabled (max 100)',
        },
      },
      {
        sectionId: 'security',
        status: 'pending',
        values: {
          'Encryption': 'Enabled (AWS managed key)',
          'Public access': 'Disabled',
          'IAM auth': 'Enabled',
          'VPC': 'Default VPC',
        },
      },
    ],
    prompts: [
      { id: 'cluster-confirm', text: 'Looks good, continue' },
      { id: 'cluster-change-name', text: 'Change cluster name' },
      { id: 'cluster-change-region', text: 'Change region' },
    ],
    delay: 1500,
  },
  // Step 1: Cluster confirmed, review Instance
  {
    agentMessage: {
      type: 'agent',
      content: `✓ Cluster configuration confirmed.

Now let's review the Instance settings:

• Instance class: db.r6g.large
• vCPU: 2 cores
• Memory: 16 GB RAM
• Multi-AZ: Enabled (automatic failover)
• Estimated cost: ~$0.250/hour (~$180/month)

This can handle ~500 concurrent orders. Would you like to adjust the instance size?`,
      feedbackEnabled: true,
    },
    updateConfigSections: [
      { sectionId: 'cluster', status: 'success' },
      { sectionId: 'instance', status: 'in-progress' },
    ],
    prompts: [
      { id: 'instance-confirm', text: 'Looks good, continue' },
      { id: 'instance-smaller', text: 'Use smaller (save cost)' },
      { id: 'instance-larger', text: 'Use larger (more capacity)' },
    ],
    delay: 1200,
  },
  // Step 2: Instance confirmed, review Storage
  {
    agentMessage: {
      type: 'agent',
      content: `✓ Instance configuration confirmed.

Now let's review the Storage & Performance settings:

• Storage type: Aurora Auto-scaling
• Initial storage: 20 GB
• Max storage: 1 TB (scales automatically)
• IOPS: 3,000 baseline (bursts to 10,000)
• Connection pooling: Enabled (max 100 connections)

Auto-scaling means you only pay for what you use. Any changes needed?`,
      feedbackEnabled: true,
    },
    updateConfigSections: [
      { sectionId: 'instance', status: 'success' },
      { sectionId: 'storage', status: 'in-progress' },
    ],
    prompts: [
      { id: 'storage-confirm', text: 'Looks good, continue' },
      { id: 'storage-increase-max', text: 'Increase max storage' },
      { id: 'storage-more-iops', text: 'Need more IOPS' },
    ],
    delay: 1200,
  },
  // Step 3: Storage confirmed, review Security
  {
    agentMessage: {
      type: 'agent',
      content: `✓ Storage configuration confirmed.

Finally, let's review the Security settings:

• Encryption at rest: AES-256 (AWS managed key)
• Encryption in transit: TLS 1.3
• Authentication: IAM + password
• Public access: Disabled
• VPC: Default VPC with private subnets

These are secure defaults for production. Any changes?`,
      feedbackEnabled: true,
    },
    updateConfigSections: [
      { sectionId: 'storage', status: 'success' },
      { sectionId: 'security', status: 'in-progress' },
    ],
    prompts: [
      { id: 'security-confirm', text: 'Confirm and continue' },
      { id: 'security-custom-key', text: 'Use custom encryption key' },
      { id: 'security-change-vpc', text: 'Change VPC settings' },
    ],
    delay: 1200,
  },
  // Step 4: All sections confirmed, ready to build
  {
    agentMessage: {
      type: 'agent',
      content: `✓ Security configuration confirmed.

All configuration sections are complete! Here's your final configuration:

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SUMMARY
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
• Cluster: food-delivery-prod (Aurora DSQL)
• Instance: db.r6g.large (2 vCPU, 16 GB)
• Storage: Auto-scaling up to 1 TB
• Security: Encrypted, private access, IAM auth

Ready to create your database?`,
      feedbackEnabled: true,
      stepCompleted: 'DB Design',
      actions: [
        { id: 'start-build-configured', label: 'Create database', variant: 'primary' },
        { id: 'review-again', label: 'Review settings' },
      ],
    },
    updateConfigSections: [
      { sectionId: 'security', status: 'success' },
    ],
    updateStep: { stepId: 'db-design', status: 'success' },
    delay: 1500,
  },
  // Step 5: Build starts - transition to review
  {
    agentMessage: {
      type: 'agent',
      content: `Creating your database with the configured settings...

✓ Cluster configuration applied
✓ db.r6g.large instance provisioning
✓ Multi-AZ standby launching
✓ Security groups configured
• Generating connection endpoints...`,
    },
    updateStep: { stepId: 'review-finish', status: 'in-progress' },
    transitionView: 'review',
    createResource: {
      id: 'food-delivery-db-001',
      name: 'food-delivery-prod - us-east-1',
      type: 'Aurora DSQL - PostgreSQL',
      region: 'us-east-1',
      status: 'creating',
      details: {
        'Instance': 'db.r6g.large',
        'Multi-AZ': 'Enabled',
      },
    },
    delay: 2500,
  },
  // Step 6: Build complete status
  {
    agentMessage: {
      type: 'status',
      content: `Database creation complete! Click below to finalize and view your connection details.`,
      actions: [
        { id: 'complete-configured', label: 'Complete setup', variant: 'primary' },
      ],
    },
    delay: 2000,
  },
  // Step 7: Completion
  {
    agentMessage: {
      type: 'agent',
      content: `Your food delivery database is ready!

Endpoint: food-delivery-xyz.dsql.us-east-1.on.aws

What would you like to do next?`,
      feedbackEnabled: true,
      stepCompleted: 'Review and finish',
    },
    updateStep: { stepId: 'review-finish', status: 'success' },
    createResource: {
      id: 'food-delivery-db-001',
      name: 'food-delivery-prod - us-east-1',
      type: 'Aurora DSQL - PostgreSQL',
      region: 'us-east-1',
      status: 'active',
      endpoint: 'food-delivery-xyz.dsql.us-east-1.on.aws',
      details: {
        'Cluster ID': 'food-delivery-prod-xyz',
        'Engine': 'Aurora DSQL',
        'Instance': 'db.r6g.large',
        'Multi-AZ': 'Enabled',
      },
    },
    prompts: [
      { id: 'view-database', text: 'View the database' },
      { id: 'import', text: 'Import sample data' },
      { id: 'connect', text: 'Connect to my cluster' },
    ],
    delay: 1500,
  },
];

// IMPORT DATA demo script
const IMPORT_DATA_SCRIPT: DemoStep[] = [
  // Step 0: Initial response after user describes what data to import
  {
    agentMessage: {
      type: 'agent',
      content: `Great choice! I'll help you import sample data for your food delivery application. The orders dataset includes realistic transaction data that will help you test your database queries.

How much data would you like to import?`,
      feedbackEnabled: true,
    },
    prompts: [
      { id: 'small', text: '1,000 records (quick test)' },
      { id: 'medium', text: '10,000 records (development)' },
      { id: 'large', text: '100,000 records (load testing)' },
    ],
    delay: 1500,
  },
  // Step 1: After size selection
  {
    agentMessage: {
      type: 'agent',
      content: `Perfect! 10,000 records is ideal for development testing. The dataset will include:

• Orders with timestamps and status
• Customer information
• Restaurant details
• Delivery addresses

Should I also create sample indexes for common query patterns?`,
      feedbackEnabled: true,
    },
    prompts: [
      { id: 'with-indexes', text: 'Yes, create indexes' },
      { id: 'no-indexes', text: 'No, just the data' },
    ],
    delay: 1200,
  },
  // Step 2: Confirmation with action buttons
  {
    agentMessage: {
      type: 'agent',
      content: `Here's what I'll import:

• 10,000 order records
• 500 customer profiles
• 50 restaurant entries
• Optimized indexes for order lookups

Ready to start the import?`,
      feedbackEnabled: true,
      actions: [
        { id: 'start-import', label: 'Start import', variant: 'primary' },
        { id: 'customize', label: 'Customize selection' },
      ],
    },
    delay: 1500,
  },
  // Step 3: Import starts
  {
    agentMessage: {
      type: 'agent',
      content: `Starting data import. This will take a moment...`,
    },
    updateStep: { stepId: 'configure', status: 'success' },
    delay: 800,
  },
  // Step 4: Import progress
  {
    agentMessage: {
      type: 'agent',
      content: `Importing data to food-delivery-prod...

✓ Connected to database
✓ Schema validated
• Importing records...`,
    },
    updateStep: { stepId: 'import', status: 'in-progress' },
    createResource: {
      id: 'import-job-001',
      name: 'Food delivery sample data',
      type: 'Sample Dataset Import',
      region: 'food-delivery-prod',
      status: 'creating',
      details: {
        'Records': '10,000',
        'Tables': '4',
        'Format': 'Structured JSON',
      },
    },
    delay: 2000,
  },
  // Step 5: Import progress continued
  {
    agentMessage: {
      type: 'agent',
      content: `Import progress...

✓ Orders table: 10,000 records
✓ Customers table: 500 records
✓ Restaurants table: 50 records
• Creating indexes...`,
    },
    delay: 2000,
  },
  // Step 6: Import complete - status message
  {
    agentMessage: {
      type: 'status',
      content: `Import ready to finalize. Click complete to verify data integrity and finish the import.`,
      actions: [
        { id: 'complete-import', label: 'Complete import', variant: 'primary' },
      ],
    },
    delay: 1500,
  },
  // Step 7: Completion
  {
    agentMessage: {
      type: 'agent',
      content: `Import completed successfully!

Summary:
• 10,550 total records imported
• 4 tables populated
• 3 indexes created
• Data integrity verified`,
      feedbackEnabled: true,
    },
    updateStep: { stepId: 'import', status: 'success' },
    createResource: {
      id: 'import-job-001',
      name: 'Food delivery sample data',
      type: 'Sample Dataset Import',
      region: 'food-delivery-prod',
      status: 'active',
      details: {
        'Records': '10,550',
        'Tables': '4',
        'Indexes': '3',
        'Duration': '12 seconds',
      },
    },
    delay: 1500,
  },
  // Step 8: What's next
  {
    agentMessage: {
      type: 'agent',
      content: `What would you like to do next?`,
    },
    prompts: [
      { id: 'query', text: 'Run sample queries' },
      { id: 'more-data', text: 'Import more data' },
      { id: 'dashboard', text: 'View dashboard' },
    ],
    delay: 800,
  },
];

// CLONE DATABASE demo script (copy settings from existing)
const CLONE_DATABASE_SCRIPT: DemoStep[] = [
  // Step 0: Initial response after user wants to clone
  {
    agentMessage: {
      type: 'agent',
      content: `I can help you create a new database by copying settings from an existing one. This will replicate all configurations including engine settings, parameter groups, and security configurations.

Which database would you like to clone from?`,
      feedbackEnabled: true,
    },
    prompts: [
      { id: 'clone-food-delivery', text: 'food-delivery-prod' },
      { id: 'clone-analytics', text: 'analytics-cluster' },
      { id: 'clone-other', text: 'Enter database name' },
    ],
    delay: 1500,
  },
  // Step 1: After source selection
  {
    agentMessage: {
      type: 'agent',
      content: `I found food-delivery-prod (Aurora DSQL - PostgreSQL) in us-east-1.

Current settings:
• Engine: Aurora DSQL - PostgreSQL
• Instance class: db.r6g.large
• Storage: Auto-scaling enabled
• Multi-AZ: Enabled

What would you like to name the new cluster?`,
      feedbackEnabled: true,
    },
    prompts: [
      { id: 'name-staging', text: 'food-delivery-staging' },
      { id: 'name-dev', text: 'food-delivery-dev' },
      { id: 'name-custom', text: 'Custom name' },
    ],
    delay: 1200,
  },
  // Step 2: Region selection
  {
    agentMessage: {
      type: 'agent',
      content: `Great! I'll create food-delivery-staging.

Should this cluster be in the same region (us-east-1) or a different one?`,
      feedbackEnabled: true,
    },
    prompts: [
      { id: 'same-region', text: 'Same region (us-east-1)' },
      { id: 'different-region', text: 'Different region' },
    ],
    delay: 1200,
  },
  // Step 3: Confirmation with action buttons
  {
    agentMessage: {
      type: 'agent',
      content: `Here's what I'll create:

• New cluster: food-delivery-staging
• Source: food-delivery-prod
• Region: us-east-1
• All settings cloned (engine, parameters, security)
• Data will NOT be copied (empty database)

Ready to create?`,
      feedbackEnabled: true,
      actions: [
        { id: 'auto-setup', label: 'Create cluster', variant: 'primary' },
        { id: 'configure-manual', label: 'Modify settings' },
      ],
    },
    delay: 1500,
  },
  // Step 4: Clone starts
  {
    agentMessage: {
      type: 'agent',
      content: `Starting cluster creation. Cloning settings from food-delivery-prod...`,
    },
    updateStep: { stepId: 'configure', status: 'in-progress' },
    delay: 800,
  },
  // Step 5: Clone progress
  {
    agentMessage: {
      type: 'agent',
      content: `Cloning cluster configuration...

✓ Parameter groups copied
✓ Security groups configured
✓ Network settings applied
• Creating database instance...`,
    },
    createResource: {
      id: 'food-delivery-staging-001',
      name: 'food-delivery-staging - us-east-1',
      type: 'Aurora DSQL - PostgreSQL',
      region: 'us-east-1',
      status: 'creating',
    },
    delay: 2000,
  },
  // Step 6: Configure complete
  {
    agentMessage: {
      type: 'agent',
      content: `Configuration cloned successfully! Starting the build process...`,
      feedbackEnabled: true,
    },
    updateStep: { stepId: 'configure', status: 'success' },
    delay: 1500,
  },
  // Step 7: Build starts
  {
    agentMessage: {
      type: 'agent',
      content: `Build in progress...

✓ Database instance provisioned
✓ Parameter groups applied
✓ Security configuration active
• Generating connection endpoints...`,
    },
    updateStep: { stepId: 'build', status: 'in-progress' },
    delay: 2000,
  },
  // Step 8: Build complete
  {
    agentMessage: {
      type: 'status',
      content: `Cluster is ready. Click complete to finalize and generate connection details.`,
      actions: [
        { id: 'complete-clone', label: 'Complete setup', variant: 'primary' },
      ],
    },
    delay: 1500,
  },
  // Step 9: Completion
  {
    agentMessage: {
      type: 'agent',
      content: `Your staging cluster is ready!

food-delivery-staging has been created with all settings from food-delivery-prod.`,
      feedbackEnabled: true,
    },
    updateStep: { stepId: 'build', status: 'success' },
    createResource: {
      id: 'food-delivery-staging-001',
      name: 'food-delivery-staging - us-east-1',
      type: 'Aurora DSQL - PostgreSQL',
      region: 'us-east-1',
      status: 'active',
      endpoint: 'food-delivery-staging.dsql.us-east-1.on.aws',
      details: {
        'Source': 'food-delivery-prod',
        'Cluster ID': 'food-delivery-staging-xyz',
        'Engine': 'Aurora DSQL',
      },
    },
    delay: 1500,
  },
  // Step 10: What's next
  {
    agentMessage: {
      type: 'agent',
      content: `What would you like to do next?`,
    },
    prompts: [
      { id: 'connect', text: 'Connect to cluster' },
      { id: 'import', text: 'Import sample data' },
      { id: 'schema', text: 'Copy schema from source' },
    ],
    delay: 800,
  },
];

// MIGRATE DATABASE demo script (EC2 to Aurora)
const MIGRATE_DATABASE_SCRIPT: DemoStep[] = [
  // ===== SOURCE DISCOVERY =====
  // Step 0: Initial - Ask which EC2 instance hosts the database
  {
    agentMessage: {
      type: 'agent',
      content: `I'll help you migrate your PostgreSQL database from EC2 to Aurora DSQL. This process includes source analysis, schema migration, data transfer, and CDC replication.

I found the following EC2 instances in your account:

• i-0abc123def (prod-db-server) - us-east-1a
• i-0def456abc (staging-db) - us-east-1b

Which instance is running your PostgreSQL database?`,
      feedbackEnabled: true,
    },
    updateStep: { stepId: 'source-discovery', status: 'in-progress' },
    prompts: [
      { id: 'ec2-prod', text: 'i-0abc123def (prod-db-server)' },
      { id: 'ec2-staging', text: 'i-0def456abc (staging-db)' },
      { id: 'ec2-manual', text: 'Enter instance ID manually' },
    ],
    delay: 1500,
  },

  // ===== CONNECTION SETUP =====
  // Step 1: Ask for connection details and create migration user
  {
    agentMessage: {
      type: 'agent',
      content: `✓ Selected: i-0abc123def (prod-db-server)

To analyze your database and perform the migration, I need read access to your PostgreSQL instance. Please create a migration user with the required permissions:

\`\`\`sql
-- Create migration user
CREATE USER migration_user WITH PASSWORD 'your-secure-password';

-- Grant required permissions
GRANT pg_read_all_data TO migration_user;
GRANT USAGE ON SCHEMA public TO migration_user;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO migration_user;
GRANT SELECT ON ALL SEQUENCES IN SCHEMA public TO migration_user;
\`\`\`

Once you've created the user, click below to provide the connection details.`,
      feedbackEnabled: true,
      actions: [
        { id: 'migration-user-created', label: 'I\'ve created the user', variant: 'primary' },
        { id: 'copy-scripts', label: 'Copy scripts' },
      ],
    },
    // Source discovery still in progress - waiting for connection and db selection
    delay: 1500,
  },
  // Step 2: Provide credentials (auto-advances after button click)
  {
    agentMessage: {
      type: 'agent',
      content: `Please provide the connection details. I'll securely store them in AWS Secrets Manager.

For this demo, I'll use:
• Host: 10.0.1.45 (private IP of i-0abc123def)
• Port: 5432
• Username: migration_user
• Password: ••••••••••••

Saving to Secrets Manager...`,
      feedbackEnabled: true,
    },
    delay: 1500,
  },
  // Step 3: Saved credentials, now connecting (auto-advances)
  {
    agentMessage: {
      type: 'agent',
      content: `✓ Credentials saved to Secrets Manager (secret: migration/prod-db-server)

Connecting to source database...`,
    },
    delay: 1200,
  },
  // Step 4: Connected - discover databases
  {
    agentMessage: {
      type: 'agent',
      content: `✓ Connected successfully!

I detected PostgreSQL 14.9 running on this instance. I found the following databases:

Which database do you want to migrate?`,
      feedbackEnabled: true,
    },
    updateStep: { stepId: 'source-discovery', status: 'success' },
    prompts: [
      { id: 'db-ecommerce', text: 'ecommerce_prod (45 GB)' },
      { id: 'db-analytics', text: 'analytics_db (12 GB)' },
      { id: 'db-manual', text: 'Enter database name' },
    ],
    delay: 1500,
  },
  // Step 5: Analyzing selected database (auto-advances after prompt selection)
  {
    agentMessage: {
      type: 'agent',
      content: `✓ Selected database: ecommerce_prod

Analyzing database schema and gathering metadata...`,
    },
    updateStep: { stepId: 'connection-setup', status: 'in-progress' },
    delay: 1500,
  },
  // Step 6: Show metadata analysis results
  {
    agentMessage: {
      type: 'agent',
      content: `Analysis complete! Here's what I found:

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SOURCE DATABASE ANALYSIS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
• Database: ecommerce_prod
• PostgreSQL Version: 14.9
• Total Size: 45 GB
• Tables: 24
• Schemas: 3 (public, analytics, audit)
• Indexes: 42
• Foreign Keys: 18

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
LARGEST TABLES
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
• orders: 5.8M rows (22 GB)
• order_items: 12.4M rows (8 GB)
• users: 1.2M rows (3 GB)
• products: 45K rows (500 MB)
• inventory: 2.1M rows (4 GB)

Generating target configuration recommendation...`,
      feedbackEnabled: true,
    },
    updateStep: { stepId: 'connection-setup', status: 'success' },
    delay: 2500,
  },

  // ===== TARGET CONFIGURATION =====
  // Step 7: Recommend target config with action buttons (matching Create New pattern)
  {
    agentMessage: {
      type: 'agent',
      content: `Based on your source database analysis, here's my recommended Aurora DSQL configuration:

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
CLUSTER CONFIGURATION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
• Cluster name: ecommerce-aurora
• Engine: Aurora DSQL (PostgreSQL 15.4)
• Region: us-east-1 (same as source)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
INSTANCE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
• Instance class: db.r6g.xlarge (recommended for 45GB + growth)
• vCPU: 4 cores
• Memory: 32 GB RAM
• Multi-AZ: Enabled

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
STORAGE & PERFORMANCE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
• Storage type: Aurora Auto-scaling
• Initial: 100 GB
• Max: 1 TB
• IOPS: 6,000 baseline

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SECURITY
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
• Encryption at rest: AES-256 (AWS managed key)
• Encryption in transit: TLS 1.3
• Authentication: IAM + password
• Public access: Disabled

How would you like to proceed?`,
      feedbackEnabled: true,
      actions: [
        { id: 'create-target', label: 'Create target database', variant: 'primary' },
        { id: 'customize-target', label: 'Customize' },
      ],
      stepCompleted: 'Connection Setup',
    },
    updateStep: { stepId: 'target-config', status: 'in-progress' },
    delay: 2000,
  },
  // Step 8: Start target creation - transition to design view
  {
    agentMessage: {
      type: 'agent',
      content: `Creating target database. I'll configure everything and keep you updated on the progress.`,
    },
    transitionView: 'design',
    setPath: 'auto-setup',
    updateConfigSection: {
      sectionId: 'cluster',
      status: 'in-progress',
      values: {
        'Cluster name': 'ecommerce-aurora',
        'Engine': 'Aurora DSQL (PostgreSQL)',
        'Region': 'us-east-1',
      },
    },
    delay: 1000,
  },
  // Step 9: Cluster complete
  {
    agentMessage: {
      type: 'agent',
      content: `✓ Cluster configuration complete
• Configuring instance...`,
    },
    updateConfigSection: {
      sectionId: 'cluster',
      status: 'success',
      values: {
        'Cluster name': 'ecommerce-aurora',
        'Engine': 'Aurora DSQL (PostgreSQL)',
        'Region': 'us-east-1',
      },
    },
    delay: 1500,
  },
  // Step 10: Instance complete
  {
    agentMessage: {
      type: 'agent',
      content: `✓ Cluster configuration complete
✓ Instance provisioned
• Configuring storage...`,
    },
    updateConfigSection: {
      sectionId: 'instance',
      status: 'success',
      values: {
        'Instance class': 'db.r6g.xlarge',
        'vCPU': '4',
        'Memory': '32 GB',
        'Multi-AZ': 'Enabled',
      },
    },
    createResource: {
      id: 'ecommerce-aurora-001',
      name: 'ecommerce-aurora - us-east-1',
      type: 'Aurora DSQL - PostgreSQL',
      region: 'us-east-1',
      status: 'creating',
      endpoint: 'ecommerce-aurora.dsql.us-east-1.on.aws',
    },
    delay: 1500,
  },
  // Step 11: Storage complete
  {
    agentMessage: {
      type: 'agent',
      content: `✓ Cluster configuration complete
✓ Instance provisioned
✓ Storage configured
• Applying security settings...`,
    },
    updateConfigSection: {
      sectionId: 'storage',
      status: 'success',
      values: {
        'Storage type': 'Aurora Auto-scaling',
        'Initial storage': '100 GB',
        'Max storage': '1 TB',
        'IOPS': '6,000 baseline',
      },
    },
    delay: 1500,
  },
  // Step 12: Security complete - target creation done
  {
    agentMessage: {
      type: 'agent',
      content: `✓ Cluster configuration complete
✓ Instance provisioned
✓ Storage configured
✓ Security settings applied

Target database created successfully!`,
      feedbackEnabled: true,
      stepCompleted: 'Target Configuration',
    },
    updateConfigSection: {
      sectionId: 'security',
      status: 'success',
      values: {
        'Encryption': 'AES-256',
        'Authentication': 'IAM + password',
        'Public access': 'Disabled',
        'VPC': 'Default VPC',
      },
    },
    updateStep: { stepId: 'target-config', status: 'success' },
    delay: 1500,
  },

  // ===== MIGRATION SETTINGS =====
  // Step 13: Migration settings recommendation
  {
    agentMessage: {
      type: 'agent',
      content: `Target database ready! Now let's configure migration settings:

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
MIGRATION CONFIGURATION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
• Data scope: All 24 tables
• Migration type: Full load + CDC (continuous replication)
• Auto-partitioning: Enabled for large tables
• Parallel threads: 4 (optimized for your instance)
• LOB handling: Limited LOB mode (faster)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
ESTIMATED TIMELINE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
• Schema migration: ~5 minutes
• Data migration: ~2 hours
• CDC activation: Immediate after full load

Would you like to modify these settings?`,
      feedbackEnabled: true,
    },
    updateStep: { stepId: 'migration-settings', status: 'in-progress' },
    prompts: [
      { id: 'migration-settings-confirm', text: 'Use recommended settings' },
      { id: 'migration-select-tables', text: 'Select specific tables' },
      { id: 'migration-change-type', text: 'Change migration type' },
    ],
    delay: 2000,
  },
  // Step 14: Schedule selection
  {
    agentMessage: {
      type: 'agent',
      content: `When would you like to start the migration?`,
      feedbackEnabled: true,
    },
    prompts: [
      { id: 'schedule-now', text: 'Start now' },
      { id: 'schedule-tonight', text: 'Tonight at 11 PM (off-peak)' },
      { id: 'schedule-weekend', text: 'This weekend' },
      { id: 'schedule-custom', text: 'Custom time' },
    ],
    delay: 1000,
  },

  // ===== REVIEW & START =====
  // Step 15: Pre-flight checks
  {
    agentMessage: {
      type: 'agent',
      content: `Running pre-flight checks before starting migration...`,
    },
    updateStep: { stepId: 'migration-settings', status: 'success' },
    delay: 800,
  },
  // Step 16: Pre-flight results
  {
    agentMessage: {
      type: 'agent',
      content: `Pre-flight verification complete:

✓ Source connection: Verified
✓ Target connection: Verified
✓ Network connectivity: Verified
✓ Migration permissions: Verified
✓ Schema compatibility: 24/24 tables compatible
✓ Data types: All supported
✓ Storage capacity: Sufficient

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
MIGRATION SUMMARY
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
• Source: ecommerce_prod on i-0abc123def
• Target: ecommerce-aurora (Aurora DSQL)
• Data: 45 GB across 24 tables
• Estimated time: ~2 hours
• Schedule: Starting now
• CDC: Will be enabled after full load

Ready to start the migration?`,
      feedbackEnabled: true,
      actions: [
        { id: 'start-migration', label: 'Start migration', variant: 'primary' },
        { id: 'review-warnings', label: 'Review details' },
      ],
    },
    updateStep: { stepId: 'review-start', status: 'in-progress' },
    delay: 2500,
  },
  // Step 17: Migration started - transition to review and show migration progress
  {
    agentMessage: {
      type: 'agent',
      content: `Migration started! Migrating schema first...`,
    },
    transitionView: 'review',
    // Reset config sections to show migration progress with migration-specific titles
    updateConfigSections: [
      {
        sectionId: 'cluster',
        title: 'Migration Overview',
        status: 'in-progress',
        values: {
          'Migration Phase': 'Schema Migration',
          'Status': 'In Progress',
          'Source': 'i-0abc123def (ecommerce_prod)',
          'Target': 'ecommerce-aurora',
        },
      },
      {
        sectionId: 'instance',
        title: 'Schema Migration',
        status: 'pending',
        values: {
          'Tables': '0/24',
          'Indexes': '0/42',
          'Foreign Keys': '0/18',
          'Sequences': '0/8',
        },
      },
      {
        sectionId: 'storage',
        title: 'Data Migration',
        status: 'pending',
        values: {
          'Records Migrated': '0',
          'Data Transferred': '0 GB',
          'Progress': '0%',
        },
      },
      {
        sectionId: 'security',
        title: 'Validation & CDC',
        status: 'pending',
        values: {
          'CDC Status': 'Pending',
          'Replication Lag': '-',
          'Validation': 'Pending',
        },
      },
    ],
    delay: 800,
  },
  // Step 18: Schema migration
  {
    agentMessage: {
      type: 'agent',
      content: `Schema Migration:

✓ Tables created: 24/24
✓ Indexes created: 42/42
✓ Foreign keys: 18/18
✓ Sequences configured: 8/8

Starting data migration...`,
      feedbackEnabled: true,
    },
    updateConfigSections: [
      {
        sectionId: 'cluster',
        status: 'success',
        values: {
          'Migration Phase': 'Data Migration',
          'Status': 'In Progress',
          'Source': 'i-0abc123def (ecommerce_prod)',
          'Target': 'ecommerce-aurora',
        },
      },
      {
        sectionId: 'instance',
        status: 'success',
        values: {
          'Tables': '24/24 ✓',
          'Indexes': '42/42 ✓',
          'Foreign Keys': '18/18 ✓',
          'Sequences': '8/8 ✓',
        },
      },
      {
        sectionId: 'storage',
        status: 'in-progress',
        values: {
          'Records Migrated': '0',
          'Data Transferred': '0 GB',
          'Progress': '0%',
        },
      },
    ],
    delay: 2000,
  },
  // Step 19: Data migration progress
  {
    agentMessage: {
      type: 'agent',
      content: `Data Migration in Progress:

• users: ✓ Complete (1.2M rows)
• products: ✓ Complete (45K rows)
• orders: ✓ Complete (5.8M rows)
• order_items: ✓ Complete (12.4M rows)
• inventory: Loading... (2.1M rows)

Progress: 85% complete`,
    },
    updateConfigSections: [
      {
        sectionId: 'storage',
        status: 'in-progress',
        values: {
          'Records Migrated': '19.4M / 21.5M',
          'Data Transferred': '38 GB / 45 GB',
          'Progress': '85%',
        },
      },
    ],
    delay: 2500,
  },
  // Step 20: Migration complete status
  {
    agentMessage: {
      type: 'status',
      content: `Data migration complete! CDC replication is now active. Click complete to run final validation.`,
      actions: [
        { id: 'complete-migration', label: 'Complete & validate', variant: 'primary' },
      ],
    },
    updateConfigSections: [
      {
        sectionId: 'storage',
        status: 'success',
        values: {
          'Records Migrated': '21.5M ✓',
          'Data Transferred': '45 GB ✓',
          'Progress': '100%',
        },
      },
      {
        sectionId: 'security',
        status: 'in-progress',
        values: {
          'CDC Status': 'Active',
          'Replication Lag': '< 1 second',
          'Validation': 'Pending',
        },
      },
    ],
    delay: 2000,
  },
  // Step 21: Validation results
  {
    agentMessage: {
      type: 'agent',
      content: `Migration completed successfully!

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
VALIDATION RESULTS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✓ Row counts match: 21.5M total rows
✓ Data integrity verified
✓ Checksums validated
✓ CDC replication active and synced
✓ No errors detected

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
MIGRATION COMPLETE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
• Duration: 1 hour 47 minutes
• Records migrated: 21.5M
• Data transferred: 45 GB
• CDC lag: < 1 second

Your ecommerce database is now running on Aurora DSQL!`,
      feedbackEnabled: true,
    },
    updateStep: { stepId: 'review-start', status: 'success' },
    updateConfigSections: [
      {
        sectionId: 'cluster',
        status: 'success',
        values: {
          'Migration Phase': 'Complete',
          'Status': 'Success ✓',
          'Source': 'i-0abc123def (ecommerce_prod)',
          'Target': 'ecommerce-aurora',
        },
      },
      {
        sectionId: 'security',
        status: 'success',
        values: {
          'CDC Status': 'Active ✓',
          'Replication Lag': '< 1 second',
          'Validation': 'Passed ✓',
        },
      },
    ],
    createResource: {
      id: 'ecommerce-aurora-001',
      name: 'ecommerce-aurora - us-east-1',
      type: 'Aurora DSQL - PostgreSQL',
      region: 'us-east-1',
      status: 'active',
      endpoint: 'ecommerce-aurora.dsql.us-east-1.on.aws',
      details: {
        'Source': 'i-0abc123def (ecommerce_prod)',
        'Records Migrated': '21.5M',
        'CDC Status': 'Active',
      },
    },
    delay: 2500,
  },
];

// E-COMMERCE ANALYTICS demo script - Sarah's journey from database creation to first queries
// Flow: Use case discovery → Recommendations → Configuration → Creation → Sample data → Schema → Import → Queries
const ECOMMERCE_ANALYTICS_SCRIPT: DemoStep[] = [
  // Step 0: Welcome and use case discovery
  {
    agentMessage: {
      type: 'agent',
      content: `I'm here to help you set up your database. What will you be using it for?`,
      feedbackEnabled: true,
    },
    prompts: [
      { id: 'ecommerce-analytics', text: 'E-commerce analytics (orders, customers, inventory)' },
      { id: 'content-management', text: 'Content management system' },
      { id: 'other-usecase', text: 'Something else' },
    ],
    delay: 1000,
  },
  // Step 1: Recommendations based on e-commerce use case
  {
    agentMessage: {
      type: 'agent',
      content: `For e-commerce analytics with complex queries across orders, customers, and inventory, I recommend:

**Aurora PostgreSQL** - Optimized for analytics workloads
**db.r6g.xlarge** - 4 vCPU, 32 GB RAM (handles 50K+ orders/month)
**Multi-AZ deployment** - High availability for production

Estimated cost: ~$450/month

Would you like me to explain these choices or proceed with this configuration?`,
      feedbackEnabled: true,
    },
    prompts: [
      { id: 'why-postgresql', text: 'Why PostgreSQL over MySQL?' },
      { id: 'proceed-config', text: 'Proceed with this configuration' },
      { id: 'adjust-config', text: 'I need to adjust the configuration' },
    ],
    delay: 1500,
  },
  // Step 2: Educational explanation (PostgreSQL vs MySQL)
  {
    agentMessage: {
      type: 'agent',
      content: `**PostgreSQL excels at complex analytical queries:**

• **Window functions & CTEs** - Essential for revenue trends, cohort analysis
• **Better JSON support** - Flexible product attributes and metadata
• **Concurrent reads** - Multiple analysts querying simultaneously
• **Full-text search** - Product catalog search

MySQL is faster for simple transactional workloads, but for analytics dashboards, trend analysis, and business intelligence - PostgreSQL is the better choice.

Ready to continue with the configuration?`,
      feedbackEnabled: true,
    },
    prompts: [
      { id: 'continue-config', text: 'Yes, continue' },
      { id: 'use-mysql', text: 'Actually, use MySQL instead' },
    ],
    delay: 1500,
  },
  // Step 3: Configuration refinement questions
  {
    agentMessage: {
      type: 'agent',
      content: `A few quick questions to finalize your configuration:

**Expected data volume?**
Based on 50K orders/month, I estimate ~50GB initial storage with auto-scaling.

**Access requirements?**
I recommend VPC-only access (more secure), but public access is available if needed.

**Region preference?**
US East (N. Virginia) has the lowest latency for most US users.`,
      feedbackEnabled: true,
    },
    prompts: [
      { id: 'config-default', text: 'Use recommended settings' },
      { id: 'config-public', text: 'Enable public access' },
      { id: 'config-region', text: 'Change region' },
    ],
    delay: 1500,
  },
  // Step 4: Summary with action buttons
  {
    agentMessage: {
      type: 'agent',
      content: `Here's what I'll set up for your TechStyle analytics database:

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
CONFIGURATION SUMMARY
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
• **Cluster name:** techstyle-analytics-prod
• **Engine:** Aurora PostgreSQL 15.4
• **Instance:** db.r6g.xlarge (4 vCPU, 32 GB RAM)
• **Storage:** 50 GB auto-scaling (up to 1 TB)
• **Region:** US East (N. Virginia)
• **Multi-AZ:** Enabled
• **Monthly cost:** ~$450

How would you like to proceed?`,
      feedbackEnabled: true,
      actions: [
        { id: 'create-database', label: 'Create database', variant: 'primary' },
        { id: 'customize-config', label: 'Customize' },
      ],
      stepCompleted: 'Context and requirements',
    },
    updateStep: { stepId: 'context-requirements', status: 'success' },
    delay: 1500,
  },
  // Step 5: Database creation starts
  {
    agentMessage: {
      type: 'agent',
      content: `Creating **techstyle-analytics-prod** with optimized settings for analytics workloads. This takes 5-7 minutes.

• Provisioning Aurora cluster...`,
    },
    transitionView: 'design',
    setPath: 'auto-setup',
    updateStep: { stepId: 'db-design', status: 'in-progress' },
    updateConfigSection: {
      sectionId: 'cluster',
      status: 'in-progress',
      values: {
        'Cluster name': 'techstyle-analytics-prod',
        'Engine': 'Aurora PostgreSQL 15.4',
        'Region': 'us-east-1',
      },
    },
    delay: 1500,
  },
  // Step 6: Cluster configured
  {
    agentMessage: {
      type: 'agent',
      content: `✓ Aurora cluster provisioned
• Configuring instance...`,
    },
    updateConfigSection: {
      sectionId: 'cluster',
      status: 'success',
      values: {
        'Cluster name': 'techstyle-analytics-prod',
        'Engine': 'Aurora PostgreSQL 15.4',
        'Region': 'us-east-1',
      },
    },
    delay: 1500,
  },
  // Step 7: Instance configured
  {
    agentMessage: {
      type: 'agent',
      content: `✓ Aurora cluster provisioned
✓ Instance configured (db.r6g.xlarge)
• Setting up storage...`,
    },
    updateConfigSection: {
      sectionId: 'instance',
      status: 'success',
      values: {
        'Instance class': 'db.r6g.xlarge',
        'vCPU': '4',
        'Memory': '32 GB',
        'Multi-AZ': 'Enabled',
      },
    },
    createResource: {
      id: 'techstyle-analytics-001',
      name: 'techstyle-analytics-prod - us-east-1',
      type: 'Aurora PostgreSQL',
      region: 'us-east-1',
      status: 'creating',
    },
    delay: 1500,
  },
  // Step 8: Storage configured
  {
    agentMessage: {
      type: 'agent',
      content: `✓ Aurora cluster provisioned
✓ Instance configured
✓ Storage configured (50 GB, auto-scaling)
• Applying security settings...`,
    },
    updateConfigSection: {
      sectionId: 'storage',
      status: 'success',
      values: {
        'Storage type': 'Auto-scaling',
        'Initial': '50 GB',
        'Maximum': '1 TB',
        'IOPS': '3,000 baseline',
      },
    },
    delay: 1500,
  },
  // Step 9: Security configured, database ready
  {
    agentMessage: {
      type: 'agent',
      content: `✓ Aurora cluster provisioned
✓ Instance configured
✓ Storage configured
✓ Security settings applied

**Database ready!**

Endpoint: techstyle-analytics-prod.cluster-xxxxx.us-east-1.rds.amazonaws.com`,
      stepCompleted: 'DB Design',
      feedbackEnabled: true,
    },
    updateStep: { stepId: 'db-design', status: 'success' },
    updateConfigSection: {
      sectionId: 'security',
      status: 'success',
      values: {
        'Encryption': 'AES-256 (AWS managed)',
        'TLS': '1.3',
        'IAM auth': 'Enabled',
        'Public access': 'Disabled',
      },
    },
    createResource: {
      id: 'techstyle-analytics-001',
      name: 'techstyle-analytics-prod - us-east-1',
      type: 'Aurora PostgreSQL',
      region: 'us-east-1',
      status: 'active',
      endpoint: 'techstyle-analytics-prod.cluster-xxxxx.us-east-1.rds.amazonaws.com',
    },
    delay: 2000,
  },
  // Step 10: What's Next options
  {
    agentMessage: {
      type: 'agent',
      content: `Your database is empty and ready for data. You have three options:

**1. Import sample dataset** (Recommended for first-time users)
See how a production e-commerce database looks with realistic data

**2. Import your data**
Upload your Excel/CSV files or connect to another source

**3. Start from scratch**
Design your own schema and tables

Which would you like to try?`,
      feedbackEnabled: true,
    },
    transitionView: 'review',
    updateStep: { stepId: 'review-finish', status: 'in-progress' },
    prompts: [
      { id: 'import-sample', text: 'Import sample dataset (recommended)' },
      { id: 'import-own-data', text: 'Import my own data' },
      { id: 'start-scratch', text: 'Start from scratch' },
    ],
    delay: 1500,
  },
  // Step 11: Sample dataset selection
  {
    agentMessage: {
      type: 'agent',
      content: `**E-commerce & Retail Sample Dataset**

This dataset follows e-commerce best practices with:

| Table | Records | Purpose |
|-------|---------|---------|
| customers | 8,500 | Customer profiles & lifetime value |
| orders | 28,000 | Transaction history |
| products | 1,200 | Product catalog |
| order_items | 52,000 | Line items per order |
| inventory | 1,200 | Stock levels |
| shipping | 9,500 | Delivery addresses |

**Total:** ~100,000 records across 6 tables

Want to see the schema diagram or customize before importing?`,
      feedbackEnabled: true,
    },
    prompts: [
      { id: 'preview-schema', text: 'Show me the schema' },
      { id: 'customize-dataset', text: 'Customize the dataset' },
      { id: 'import-now', text: 'Import as-is' },
    ],
    delay: 1500,
  },
  // Step 12: Schema explanation
  {
    agentMessage: {
      type: 'agent',
      content: `**Schema Design Highlights:**

The schema follows a **star schema** pattern optimized for analytics:

• **customers** ← central entity for customer analytics
• **orders** ← the heart of transaction analysis (linked to customers)
• **order_items** ← connects orders to products
• **products** ← product catalog with categories
• **inventory** ← stock tracking per product
• **shipping** ← customer addresses for fulfillment

**Key relationships:**
• orders.customer_id → customers.customer_id
• order_items.order_id → orders.order_id
• order_items.product_id → products.product_id

The product categories are fashion-specific: Tops, Bottoms, Dresses, Outerwear, Accessories, Shoes, Jewelry.

Ready to import?`,
      feedbackEnabled: true,
    },
    prompts: [
      { id: 'start-import', text: 'Start import' },
      { id: 'remove-table', text: 'Remove a table' },
      { id: 'change-categories', text: 'Change product categories' },
    ],
    delay: 1500,
  },
  // Step 13: Import starts
  {
    agentMessage: {
      type: 'agent',
      content: `**Starting import...**

Importing 6 tables with ~100,000 records:

✓ customers (8,500 records)
◐ orders (importing...)
○ products
○ order_items
○ inventory
○ shipping

Estimated time: 2 minutes`,
    },
    delay: 2000,
  },
  // Step 14: Import progress with optimization suggestion
  {
    agentMessage: {
      type: 'agent',
      content: `**Import progress:**

✓ customers (8,500 records)
✓ orders (28,000 records)
✓ products (1,200 records)
◐ order_items (importing...)
○ inventory
○ shipping

💡 **Optimization opportunity:** I noticed you'll likely query by order_date frequently. Adding an index would speed up date range queries by ~80%.

Would you like me to add this index?`,
      feedbackEnabled: true,
    },
    prompts: [
      { id: 'add-index', text: 'Yes, add the index' },
      { id: 'skip-index', text: 'Skip for now' },
    ],
    delay: 2000,
  },
  // Step 15: Import complete
  {
    agentMessage: {
      type: 'agent',
      content: `**Import complete!** ✓

All data validated and ready:
• **8,500** customers
• **28,000** orders ($4.2M total revenue)
• **1,200** products across 7 categories
• All foreign key relationships valid

✓ Added index on orders.order_date (+2MB storage)

What would you like to do next?`,
      feedbackEnabled: true,
      stepCompleted: 'Review and finish',
    },
    updateStep: { stepId: 'review-finish', status: 'success' },
    prompts: [
      { id: 'explore-data', text: 'Explore my data' },
      { id: 'run-query', text: 'Run a query' },
      { id: 'view-dashboard', text: 'View database details' },
    ],
    delay: 1500,
  },
  // Step 16: Guided exploration
  {
    agentMessage: {
      type: 'agent',
      content: `Let's explore your data! Try asking questions like:

• "Show me top customers by revenue"
• "What are our best-selling product categories?"
• "Which products are low on inventory?"

Or click one of the suggestions below:`,
      feedbackEnabled: true,
    },
    prompts: [
      { id: 'query-top-customers', text: 'Show me top customers by revenue' },
      { id: 'query-categories', text: 'What are our best-selling categories?' },
      { id: 'query-inventory', text: 'Which products are running low?' },
    ],
    delay: 1500,
  },
  // Step 17: Query result example
  {
    agentMessage: {
      type: 'agent',
      content: `**Top 10 Customers by Lifetime Value:**

| Customer | Email | Lifetime Value | Orders |
|----------|-------|----------------|--------|
| Emma Wilson | emma.wilson@email.com | $8,945.50 | 47 |
| James Chen | james.chen@email.com | $7,832.25 | 38 |
| Sofia Martinez | sofia.martinez@email.com | $6,721.80 | 42 |
| Liam Johnson | liam.johnson@email.com | $6,543.00 | 35 |
| Olivia Brown | olivia.brown@email.com | $5,987.75 | 31 |

**SQL used:**
\`\`\`sql
SELECT first_name, last_name, email, lifetime_value, order_count
FROM customers
ORDER BY lifetime_value DESC
LIMIT 10;
\`\`\`

Would you like to try another query or import your actual data?`,
      feedbackEnabled: true,
    },
    prompts: [
      { id: 'query-another', text: 'Try another query' },
      { id: 'import-real-data', text: 'Import my real data' },
      { id: 'done-exploring', text: 'I\'m done exploring' },
    ],
    delay: 1500,
  },
  // Step 18: Transition to real data
  {
    agentMessage: {
      type: 'agent',
      content: `Now that you understand the structure, you're ready to import your actual data!

I can help you:
• **Map your Excel columns** to this schema
• **Identify data quality issues** before import
• **Suggest schema modifications** if needed

When you're ready, navigate to **Import Data** to get started, or continue exploring the sample data.`,
      feedbackEnabled: true,
    },
    prompts: [
      { id: 'go-import', text: 'Go to Import Data' },
      { id: 'keep-exploring', text: 'Keep exploring sample data' },
      { id: 'view-database', text: 'View database details' },
    ],
    delay: 1500,
  },
];

// Track which demo path to use (set when user clicks initial prompt or action)
let currentDemoPath: 'new' | 'clone' | 'migrate' | 'configure' | 'ecommerce' = 'new';

// Get the appropriate demo script for a workflow
function getDemoScript(workflowId: string | undefined): DemoStep[] {
  switch (workflowId) {
    case 'import-data':
      return IMPORT_DATA_SCRIPT;
    case 'create-database':
      // Check which path based on currentDemoPath
      if (currentDemoPath === 'clone') {
        return CLONE_DATABASE_SCRIPT;
      } else if (currentDemoPath === 'migrate') {
        return MIGRATE_DATABASE_SCRIPT;
      } else if (currentDemoPath === 'configure') {
        return CONFIGURE_TOGETHER_SCRIPT;
      } else if (currentDemoPath === 'ecommerce') {
        return ECOMMERCE_ANALYTICS_SCRIPT;
      }
      return CREATE_DATABASE_SCRIPT;
    default:
      return CREATE_DATABASE_SCRIPT;
  }
}

// Migration-specific workflow steps
const MIGRATION_WORKFLOW_STEPS = [
  { id: 'source-discovery', title: 'Source Discovery' },
  { id: 'connection-setup', title: 'Connection Setup' },
  { id: 'target-config', title: 'Target Configuration' },
  { id: 'migration-settings', title: 'Migration Settings' },
  { id: 'review-start', title: 'Review & Start' },
];

// Set the demo path (module level for script access)
function setDemoPathInternal(path: 'new' | 'clone' | 'migrate' | 'configure' | 'ecommerce') {
  currentDemoPath = path;
}

export function ChatProvider({ children }: { children: ReactNode }) {
  // App store for persisting databases and activities
  const { addDatabase, addActivity, updateDatabase } = useAppStore();

  // Chat state
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentPrompts, setCurrentPrompts] = useState<SupportPrompt[]>([]);
  const [showPrompts, setShowPrompts] = useState(true);
  const [isAgentTyping, setIsAgentTyping] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // Drawer expansion state
  const [drawerMode, setDrawerMode] = useState<DrawerExpansionMode>('normal');

  // Helper to expand drawer for workflows
  const expandDrawerForWorkflow = useCallback(() => {
    setDrawerMode('expanded');
    setIsDrawerOpen(true);
  }, []);

  // SplitPanel state for configuration preview
  const [splitPanelConfig, setSplitPanelConfig] = useState<RecommendationMeta | null>(null);

  // Database creation tracking state
  const [creationStatus, setCreationStatus] = useState<CreationStatus>('idle');
  const [createdDatabaseId, setCreatedDatabaseId] = useState<string | null>(null);
  const [createdDatabaseType, setCreatedDatabaseType] = useState<'dsql' | 'rds' | null>(null);
  const [createdDatabaseName, setCreatedDatabaseName] = useState<string | null>(null);

  // Workflow state
  const [workflow, setWorkflow] = useState<WorkflowState>({
    isActive: false,
    config: null,
    view: 'entry',
    selectedOption: null,
    steps: [],
    currentStepIndex: 0,
    resource: null,
    inContext: false,
    path: null,
    configSections: DEFAULT_CONFIG_SECTIONS,
  });

  // Demo script tracking
  const scriptStepRef = useRef(0);
  const isProcessingRef = useRef(false);

  // Conversation history for API calls
  const conversationRef = useRef<ConversationMessage[]>([]);

  // Navigation callback
  const navigateRef = useRef<((path: string) => void) | null>(null);

  // Refs for app store functions (to avoid dependency issues)
  const addDatabaseRef = useRef(addDatabase);
  const addActivityRef = useRef(addActivity);
  const updateDatabaseRef = useRef(updateDatabase);
  addDatabaseRef.current = addDatabase;
  addActivityRef.current = addActivity;
  updateDatabaseRef.current = updateDatabase;

  const setNavigateCallback = useCallback((callback: (path: string) => void) => {
    navigateRef.current = callback;
  }, []);

  // Set demo path and update workflow steps if needed
  const setDemoPath = useCallback((path: 'new' | 'clone' | 'migrate' | 'configure' | 'ecommerce') => {
    setDemoPathInternal(path);

    // Update workflow steps for migration path
    if (path === 'migrate') {
      setWorkflow(prev => ({
        ...prev,
        steps: MIGRATION_WORKFLOW_STEPS.map(s => ({ ...s, status: 'pending' as StepStatus })),
      }));
    }
  }, []);

  // Add a message to the chat
  const addMessage = useCallback((message: Omit<Message, 'id' | 'timestamp'>) => {
    const newMessage: Message = {
      ...message,
      id: `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, newMessage]);
  }, []);

  // Ref for addNotification to avoid dependency issues
  const addNotificationRef = useRef(useAppStore.getState().addNotification);
  addNotificationRef.current = useAppStore.getState().addNotification;

  // Database creation management functions
  const startDatabaseCreation = useCallback((databaseId: string, databaseType: 'dsql' | 'rds', databaseName: string) => {
    setCreationStatus('creating');
    setCreatedDatabaseId(databaseId);
    setCreatedDatabaseType(databaseType);
    setCreatedDatabaseName(databaseName);
    setIsDrawerOpen(true);
  }, []);

  const onCreationComplete = useCallback(() => {
    const dbName = createdDatabaseName || 'Database';

    // Update status
    setCreationStatus('completed');

    // Show success flashbar notification
    addNotificationRef.current({
      type: 'success',
      content: `Database cluster "${dbName}" created successfully!`,
      dismissible: true,
    });

    // Add completion message to chat
    setMessages(prev => [...prev, {
      id: `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type: 'status',
      content: `Your database cluster "${dbName}" has been created successfully and is now active.`,
      timestamp: new Date(),
    }]);

    // Show follow-up prompts
    setCurrentPrompts([
      { id: 'import-data', text: 'Import data' },
      { id: 'connect-database', text: 'Connect to database' },
      { id: 'view-monitoring', text: 'View monitoring' },
    ]);
    setShowPrompts(true);
  }, [createdDatabaseName]);

  const clearCreationState = useCallback(() => {
    setCreationStatus('idle');
    setCreatedDatabaseId(null);
    setCreatedDatabaseType(null);
    setCreatedDatabaseName(null);
  }, []);

  // Helper to find a demo response for user input (fallback when API unavailable)
  const findDemoResponse = useCallback((userContent: string, promptId?: string): PromptResponse | null => {
    // First, try exact prompt ID match
    if (promptId && PROMPT_RESPONSES[promptId]) {
      return PROMPT_RESPONSES[promptId];
    }

    // Try to find matching prompt in currentPrompts by text
    const matchingPrompt = currentPrompts.find(p =>
      p.text.toLowerCase() === userContent.toLowerCase()
    );
    if (matchingPrompt && PROMPT_RESPONSES[matchingPrompt.id]) {
      return PROMPT_RESPONSES[matchingPrompt.id];
    }

    return null;
  }, [currentPrompts]);

  // Apply a demo response (message, configUpdates, nextPrompts, etc.)
  const applyDemoResponse = useCallback((response: PromptResponse) => {
    addMessage({
      type: 'agent',
      content: response.message,
      feedbackEnabled: response.feedbackEnabled,
      actions: response.actions,
      stepCompleted: response.stepCompleted,
      recommendationMeta: response.recommendationMeta,
    });

    // Apply config section updates
    if (response.configUpdates) {
      setWorkflow(prev => {
        const newConfigSections = { ...prev.configSections };
        for (const update of response.configUpdates!) {
          newConfigSections[update.sectionId] = {
            ...newConfigSections[update.sectionId],
            status: update.status,
            values: update.values || newConfigSections[update.sectionId].values,
          };
        }
        return { ...prev, configSections: newConfigSections };
      });
    }

    // Update workflow step if specified
    if (response.updateStep) {
      setWorkflow(prev => ({
        ...prev,
        steps: prev.steps.map(s =>
          s.id === response.updateStep!.stepId
            ? { ...s, status: response.updateStep!.status }
            : s
        ),
      }));
    }

    // Update prompts
    if (response.nextPrompts) {
      setCurrentPrompts(response.nextPrompts);
      setShowPrompts(true);
    } else {
      setShowPrompts(false);
    }
  }, [addMessage]);

  // Get initial demo response for free-form user input
  const getInitialDemoResponse = useCallback((): PromptResponse => {
    return {
      message: `Great! Based on your requirements, I'd recommend Aurora DSQL - it handles high write throughput while maintaining strong consistency.

How many users/records are you planning to support initially?`,
      nextPrompts: [
        { id: 'under-50', text: 'Under 50 restaurants' },
        { id: '50-200', text: '50-200 restaurants' },
        { id: '200-plus', text: '200+ restaurants' },
      ],
      feedbackEnabled: true,
    };
  }, []);

  // Send message to Bedrock API with demo fallback
  const sendToAPI = useCallback(async (userContent: string, promptId?: string) => {
    // Add user message to conversation history
    conversationRef.current.push({ role: 'user', content: userContent });

    setIsAgentTyping(true);

    try {
      const response = await chatApi.sendMessage(conversationRef.current, {
        currentPage: workflow.config?.id || '/create-database',
        selectedOption: workflow.selectedOption || undefined,
      });

      // Add assistant response to history
      conversationRef.current.push({ role: 'assistant', content: response.message });

      // Add agent message with dynamic component
      addMessage({
        type: 'agent',
        content: response.message,
        feedbackEnabled: true,
        dynamicComponent: response.component,
        suggestedActions: response.suggestedActions,
        requiresConfirmation: response.requiresConfirmation,
        confirmAction: response.confirmAction,
      });

      // Update prompts if provided
      if (response.suggestedActions) {
        setCurrentPrompts(response.suggestedActions);
        setShowPrompts(true);
      } else {
        setShowPrompts(false);
      }
    } catch (error) {
      // Demo fallback: Try to find a matching demo response when API unavailable
      const demoResponse = findDemoResponse(userContent, promptId);

      if (demoResponse) {
        applyDemoResponse(demoResponse);
      } else if (workflow.view === 'entry' || workflow.view === 'chat') {
        // For free-form initial messages, start demo flow
        applyDemoResponse(getInitialDemoResponse());
      } else {
        addMessage({
          type: 'agent',
          content: `I'm running in demo mode. Please use the suggested prompts to continue.`,
        });
        if (currentPrompts.length > 0) {
          setShowPrompts(true);
        }
      }
    } finally {
      setIsAgentTyping(false);
    }
  }, [workflow.config?.id, workflow.selectedOption, workflow.view, addMessage, currentPrompts, findDemoResponse, applyDemoResponse, getInitialDemoResponse]);

  // Run the next demo step
  const executeDemoStep = useCallback(async (stepIndex: number) => {
    const script = getDemoScript(workflow.config?.id);

    if (stepIndex >= script.length) {
      isProcessingRef.current = false;
      return;
    }

    const step = script[stepIndex];

    // Wait for delay
    if (step.delay) {
      await new Promise(resolve => setTimeout(resolve, step.delay));
    }

    // Update workflow view if needed
    if (step.transitionView) {
      setWorkflow(prev => ({ ...prev, view: step.transitionView! }));
      // Open drawer when transitioning to design or review view
      if (step.transitionView === 'design' || step.transitionView === 'review') {
        setIsDrawerOpen(true);
      }
    }

    // Set workflow path if specified
    if (step.setPath) {
      setWorkflow(prev => ({ ...prev, path: step.setPath! }));
    }

    // Update config section if needed
    if (step.updateConfigSection) {
      setWorkflow(prev => ({
        ...prev,
        configSections: {
          ...prev.configSections,
          [step.updateConfigSection!.sectionId]: {
            ...prev.configSections[step.updateConfigSection!.sectionId],
            status: step.updateConfigSection!.status,
            values: step.updateConfigSection!.values || prev.configSections[step.updateConfigSection!.sectionId].values,
          },
        },
      }));
    }

    // Update multiple config sections if needed
    if (step.updateConfigSections) {
      setWorkflow(prev => {
        const newConfigSections = { ...prev.configSections };
        for (const update of step.updateConfigSections!) {
          newConfigSections[update.sectionId] = {
            ...newConfigSections[update.sectionId],
            status: update.status,
            title: update.title || newConfigSections[update.sectionId].title,
            values: update.values || newConfigSections[update.sectionId].values,
          };
        }
        return { ...prev, configSections: newConfigSections };
      });
    }

    // Update step status if needed
    if (step.updateStep) {
      setWorkflow(prev => ({
        ...prev,
        steps: prev.steps.map(s =>
          s.id === step.updateStep!.stepId
            ? { ...s, status: step.updateStep!.status }
            : s
        ),
        currentStepIndex: step.updateStep!.status === 'success'
          ? prev.steps.findIndex(s => s.id === step.updateStep!.stepId) + 1
          : prev.currentStepIndex,
      }));
    }

    // Create/update resource if needed
    if (step.createResource) {
      setWorkflow(prev => ({ ...prev, resource: step.createResource! }));
    }

    // Stop typing indicator
    setIsAgentTyping(false);

    // Add agent message
    addMessage(step.agentMessage);

    // Update prompts if needed
    if (step.prompts) {
      setCurrentPrompts(step.prompts);
      setShowPrompts(true);
    } else {
      setShowPrompts(false);
    }

    scriptStepRef.current = stepIndex + 1;
    isProcessingRef.current = false;
  }, [addMessage, workflow.config?.id]);

  // Run next step in demo
  const runNextStep = useCallback(() => {
    if (isProcessingRef.current) return;
    isProcessingRef.current = true;
    setIsAgentTyping(true);
    setShowPrompts(false);
    executeDemoStep(scriptStepRef.current);
  }, [executeDemoStep]);

  // Start a workflow while preserving context (skip entry view)
  const startWorkflowInContext = useCallback((config: WorkflowConfig) => {
    // Don't reset messages - keep conversation history
    setCurrentPrompts([]);
    setShowPrompts(false);
    scriptStepRef.current = 0;
    isProcessingRef.current = false;

    setWorkflow(prev => ({
      isActive: true,
      config,
      view: 'chat', // Skip entry, go directly to chat view
      selectedOption: config.options[0]?.id || null, // Default to first option
      steps: config.steps.map(s => ({ ...s, status: 'pending' as StepStatus })),
      currentStepIndex: 0,
      resource: prev.resource, // Keep the resource from previous workflow
      inContext: true,
      path: prev.path, // Keep the path from previous workflow
      configSections: prev.configSections, // Keep config sections from previous workflow
    }));

    // Start the agent response
    setIsAgentTyping(true);
    setTimeout(() => {
      executeDemoStep(0);
    }, 1500);
  }, [executeDemoStep]);

  // Send a message
  const sendMessage = useCallback((content: string) => {
    // Add user message
    addMessage({
      type: 'user',
      content,
    });

    // If this is the first message in a workflow, transition to chat view (centered)
    if (workflow.isActive && workflow.view === 'entry') {
      setWorkflow(prev => ({ ...prev, view: 'chat' }));
    }

    // Send to Bedrock API
    sendToAPI(content);
  }, [addMessage, workflow.isActive, workflow.view, sendToAPI]);

  // Select a support prompt
  const selectPrompt = useCallback((promptId: string) => {
    const prompt = currentPrompts.find(p => p.id === promptId);
    if (prompt) {
      // Add as user message
      addMessage({
        type: 'user',
        content: prompt.text,
      });
      setShowPrompts(false);

      // Check if this is "View the database" prompt - navigate to database details
      if (promptId === 'view-database' && navigateRef.current) {
        setTimeout(() => {
          navigateRef.current?.(`/database-details?id=${createdDatabaseId}&type=${createdDatabaseType || 'dsql'}`);
        }, 500);
        return;
      }

      // Check if this is a navigation prompt (at end of create database workflow)
      if (promptId === 'import' && navigateRef.current) {
        // Navigate to database details and start import workflow in context
        setTimeout(() => {
          // Import workflow config (inline to avoid circular dependencies)
          const importConfig: WorkflowConfig = {
            id: 'import-data',
            title: 'Import data',
            subtitle: 'Import data into your database from various sources',
            options: [
              { id: 'sample-data', title: 'Sample data', description: 'Import pre-built sample datasets' },
              { id: 'existing-data', title: 'From existing source', description: 'Import from S3, files, or another database' },
            ],
            initialPrompts: [],
            steps: [
              { id: 'configure', title: 'Configure' },
              { id: 'import', title: 'Import' },
            ],
            placeholder: 'Describe the data you want to import',
          };

          // Start import workflow in context (skip entry view)
          startWorkflowInContext(importConfig);

          // Navigate to database details page
          navigateRef.current?.(`/database-details?id=${createdDatabaseId}&type=${createdDatabaseType || 'dsql'}`);
        }, 500);
        return;
      }

      // Send prompt text to Bedrock API (with prompt ID for demo fallback)
      sendToAPI(prompt.text, promptId);
    }
  }, [currentPrompts, addMessage, sendToAPI, startWorkflowInContext]);

  // Helper to detect if an action ID indicates database creation
  const isCreationAction = (actionId: string): boolean => {
    const id = actionId.toLowerCase();

    // Explicit action IDs that trigger creation
    const explicitIds = [
      'complete-setup',
      'confirm-create',
      'start-build-configured',
      'auto-setup',
      'create-database',
      'create_database',
      'deploy-database',
      'deploy_database',
      'provision-database',
      'provision_database',
      'create-cluster',
      'create_cluster',
      'deploy-cluster',
      'deploy_cluster',
    ];

    if (explicitIds.includes(id)) return true;

    // Pattern matching for dynamic action IDs
    const createPatterns = ['create', 'deploy', 'provision', 'launch', 'start'];
    const targetPatterns = ['database', 'cluster', 'db', 'aurora', 'dsql', 'rds'];

    const hasCreateWord = createPatterns.some(p => id.includes(p));
    const hasTargetWord = targetPatterns.some(p => id.includes(p));

    return hasCreateWord && hasTargetWord;
  };

  // Trigger an action from a message (supports optional params from dynamic components)
  const triggerAction = useCallback((actionId: string, params?: Record<string, unknown>) => {
    // Handle database creation confirmation
    if (isCreationAction(actionId)) {
      // Generate database ID and get name from params or config
      const databaseId = `db-${Date.now()}`;

      // Try to get database info from action params first, then fall back to workflow config
      const databaseName = (params?.databaseName as string) ||
        (params?.clusterName as string) ||
        (params?.name as string) ||
        workflow.configSections.cluster.values['Cluster name'] ||
        'my-database';

      const region = (params?.region as string) ||
        workflow.configSections.cluster.values['Region'] ||
        'us-east-1';

      const engine = (params?.engine as string) || 'Aurora DSQL - PostgreSQL';

      // Add database to store with creating status
      addDatabaseRef.current({
        id: databaseId,
        name: databaseName,
        engine: engine,
        region: region,
        status: 'creating',
        endpoint: `${databaseName}.dsql.${region}.on.aws`,
        createdAt: new Date(),
        connections: 0,
        tags: { Environment: 'Production' },
      });

      // Add activity
      addActivityRef.current({
        type: 'database_created',
        title: 'Database cluster creation started',
        description: `${databaseName} cluster is being created in ${region}`,
        resourceId: databaseName,
        resourceName: databaseName,
      });

      // Start creation tracking
      startDatabaseCreation(databaseId, 'dsql', databaseName);

      // Add status message to chat
      addMessage({
        type: 'status',
        content: `Creating database cluster "${databaseName}"... You can continue chatting while the cluster is being provisioned.`,
      });

      // Navigate to database details page
      if (navigateRef.current) {
        navigateRef.current(`/database-details?id=${databaseId}&type=dsql`);
      }

      return;
    }

    // For other actions, add as user message and send to API
    const actionMessage = `Execute action: ${actionId}`;
    addMessage({
      type: 'user',
      content: actionMessage,
    });
    sendToAPI(actionMessage);
  }, [addMessage, sendToAPI, workflow.configSections, startDatabaseCreation]);

  // DEPRECATED: Old demo script action handling - keeping function stub for reference
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  // @ts-expect-error - keeping function stub for reference
  const _legacyTriggerAction = useCallback((actionId: string) => {
    if (actionId === 'auto-setup') {
      // Transition to design view with auto-setup path
      setWorkflow(prev => ({ ...prev, view: 'design', path: 'auto-setup' }));
      setIsDrawerOpen(true);

      // Run auto-setup sequence - runs steps 3-8 automatically
      runNextStep();

      const runAutoSetupSequence = async () => {
        // Run through all auto-setup steps (4, 5, 6, 7, 8)
        for (let i = 0; i < 5; i++) {
          await new Promise(r => setTimeout(r, 2000));
          if (!isProcessingRef.current) {
            isProcessingRef.current = true;
            setIsAgentTyping(true);
            await executeDemoStep(scriptStepRef.current);
          }
        }
      };

      runAutoSetupSequence();
    } else if (actionId === 'complete-setup') {
      // Run completion sequence for create database
      runNextStep();

      const runCompletionSequence = async () => {
        await new Promise(r => setTimeout(r, 2000));
        if (!isProcessingRef.current) {
          isProcessingRef.current = true;
          setIsAgentTyping(true);
          await executeDemoStep(scriptStepRef.current);
        }

        // Update existing database status to active
        await new Promise(r => setTimeout(r, 500));
        if (createdDatabaseId) {
          updateDatabaseRef.current(createdDatabaseId, { status: 'active' });
        }

        // Add activity
        const dbName = createdDatabaseName || 'database';
        addActivityRef.current({
          type: 'database_created',
          title: 'Database cluster created',
          description: `${dbName} cluster is now active`,
          resourceId: createdDatabaseId || dbName,
          resourceName: dbName,
        });

        // Navigate to database details page after completion
        await new Promise(r => setTimeout(r, 1000));
        if (navigateRef.current) {
          navigateRef.current(`/database-details?id=${createdDatabaseId}&type=${createdDatabaseType || 'dsql'}`);
        }
      };

      runCompletionSequence();
    } else if (actionId === 'start-import') {
      // Transition to design view for import
      setWorkflow(prev => ({ ...prev, view: 'design' }));
      setIsDrawerOpen(true);

      // Run import sequence
      runNextStep();

      const runImportSequence = async () => {
        // Wait for step 3 to complete
        await new Promise(r => setTimeout(r, 2000));

        // Step 4: Import progress
        if (!isProcessingRef.current) {
          isProcessingRef.current = true;
          setIsAgentTyping(true);
          await executeDemoStep(scriptStepRef.current);
        }

        // Wait then step 5: Import progress continued
        await new Promise(r => setTimeout(r, 2500));
        if (!isProcessingRef.current) {
          isProcessingRef.current = true;
          setIsAgentTyping(true);
          await executeDemoStep(scriptStepRef.current);
        }

        // Wait then step 6: Import ready to finalize
        await new Promise(r => setTimeout(r, 2500));
        if (!isProcessingRef.current) {
          isProcessingRef.current = true;
          setIsAgentTyping(true);
          await executeDemoStep(scriptStepRef.current);
        }
      };

      runImportSequence();
    } else if (actionId === 'complete-import') {
      // Run import completion sequence
      runNextStep();

      const runImportCompletionSequence = async () => {
        await new Promise(r => setTimeout(r, 2000));
        if (!isProcessingRef.current) {
          isProcessingRef.current = true;
          setIsAgentTyping(true);
          await executeDemoStep(scriptStepRef.current);
        }

        // Add activity for data import
        await new Promise(r => setTimeout(r, 500));
        addActivityRef.current({
          type: 'data_imported',
          title: 'Sample data imported',
          description: '10,550 records imported into food-delivery-prod',
          resourceId: 'food-delivery-prod',
          resourceName: 'food-delivery-prod',
        });
      };

      runImportCompletionSequence();
    } else if (actionId === 'complete-clone') {
      // Run clone completion sequence
      runNextStep();

      const runCloneCompletionSequence = async () => {
        await new Promise(r => setTimeout(r, 2000));
        if (!isProcessingRef.current) {
          isProcessingRef.current = true;
          setIsAgentTyping(true);
          await executeDemoStep(scriptStepRef.current);
        }

        // Save cloned database to store
        await new Promise(r => setTimeout(r, 500));
        addDatabaseRef.current({
          id: `db-${Date.now()}`,
          name: 'food-delivery-staging',
          engine: 'Aurora DSQL - PostgreSQL',
          region: 'us-east-1',
          status: 'active',
          endpoint: 'food-delivery-staging.dsql.us-east-1.on.aws',
          createdAt: new Date(),
          connections: 0,
          tags: { Environment: 'Staging', Source: 'food-delivery-prod' },
        });

        // Add activity
        addActivityRef.current({
          type: 'database_created',
          title: 'Database cluster cloned',
          description: 'food-delivery-staging created from food-delivery-prod',
          resourceId: 'food-delivery-staging',
          resourceName: 'food-delivery-staging',
        });

        // Navigate to database details page after completion
        await new Promise(r => setTimeout(r, 1000));
        if (navigateRef.current) {
          navigateRef.current('/database-details');
        }
      };

      runCloneCompletionSequence();
    } else if (actionId === 'migration-user-created' || actionId === 'copy-scripts') {
      // User has created the migration user or wants to copy scripts
      // Advance to next step (Step 2: credentials) then auto-advance through connection
      runNextStep();

      // Auto-advance through credentials → connecting → discover databases (Steps 2-4)
      const runConnectionSequence = async () => {
        // Step 3: Connecting
        await new Promise(r => setTimeout(r, 1500));
        if (!isProcessingRef.current) {
          isProcessingRef.current = true;
          setIsAgentTyping(true);
          await executeDemoStep(scriptStepRef.current);
        }

        // Step 4: Discover databases (has prompts, will stop here)
        await new Promise(r => setTimeout(r, 1200));
        if (!isProcessingRef.current) {
          isProcessingRef.current = true;
          setIsAgentTyping(true);
          await executeDemoStep(scriptStepRef.current);
        }
      };

      runConnectionSequence();
    } else if (actionId === 'create-target' || actionId === 'customize-target') {
      // User clicked to create target database - run target creation sequence (Steps 8-12)
      runNextStep();

      const runTargetCreationSequence = async () => {
        // Step 9: Cluster complete
        await new Promise(r => setTimeout(r, 1000));
        if (!isProcessingRef.current) {
          isProcessingRef.current = true;
          setIsAgentTyping(true);
          await executeDemoStep(scriptStepRef.current);
        }

        // Step 10: Instance complete
        await new Promise(r => setTimeout(r, 1500));
        if (!isProcessingRef.current) {
          isProcessingRef.current = true;
          setIsAgentTyping(true);
          await executeDemoStep(scriptStepRef.current);
        }

        // Step 11: Storage complete
        await new Promise(r => setTimeout(r, 1500));
        if (!isProcessingRef.current) {
          isProcessingRef.current = true;
          setIsAgentTyping(true);
          await executeDemoStep(scriptStepRef.current);
        }

        // Step 12: Security complete (has stepCompleted divider, then continues to migration settings)
        await new Promise(r => setTimeout(r, 1500));
        if (!isProcessingRef.current) {
          isProcessingRef.current = true;
          setIsAgentTyping(true);
          await executeDemoStep(scriptStepRef.current);
        }

        // Step 13: Migration settings (has prompts, will stop here)
        await new Promise(r => setTimeout(r, 1500));
        if (!isProcessingRef.current) {
          isProcessingRef.current = true;
          setIsAgentTyping(true);
          await executeDemoStep(scriptStepRef.current);
        }
      };

      runTargetCreationSequence();
    } else if (actionId === 'start-migration') {
      // Start the actual migration process
      // Note: Step 17 handles transitionView: 'review' and updates configSections for migration progress
      setIsDrawerOpen(true);

      // Run migration execution sequence (Steps 17-20)
      runNextStep();

      const runMigrationSequence = async () => {
        // Step 18: Schema migration
        await new Promise(r => setTimeout(r, 1500));
        if (!isProcessingRef.current) {
          isProcessingRef.current = true;
          setIsAgentTyping(true);
          await executeDemoStep(scriptStepRef.current);
        }

        // Step 19: Data migration progress
        await new Promise(r => setTimeout(r, 2500));
        if (!isProcessingRef.current) {
          isProcessingRef.current = true;
          setIsAgentTyping(true);
          await executeDemoStep(scriptStepRef.current);
        }

        // Step 20: Migration complete status (has action button, will stop here)
        await new Promise(r => setTimeout(r, 2500));
        if (!isProcessingRef.current) {
          isProcessingRef.current = true;
          setIsAgentTyping(true);
          await executeDemoStep(scriptStepRef.current);
        }
      };

      runMigrationSequence();
    } else if (actionId === 'review-warnings') {
      // User wants to review details before starting - just acknowledge
      addMessage({
        type: 'agent',
        content: `All pre-flight checks have passed. You can proceed with confidence.`,
        feedbackEnabled: true,
      });
    } else if (actionId === 'complete-migration') {
      // Run migration completion - show validation results
      runNextStep();

      const runMigrationCompletionSequence = async () => {
        // Step 21: Validation results
        await new Promise(r => setTimeout(r, 2000));
        if (!isProcessingRef.current) {
          isProcessingRef.current = true;
          setIsAgentTyping(true);
          await executeDemoStep(scriptStepRef.current);
        }

        // Save migrated database to store
        await new Promise(r => setTimeout(r, 500));
        addDatabaseRef.current({
          id: `db-${Date.now()}`,
          name: 'ecommerce-aurora',
          engine: 'Aurora DSQL - PostgreSQL',
          region: 'us-east-1',
          status: 'active',
          endpoint: 'ecommerce-aurora.dsql.us-east-1.on.aws',
          createdAt: new Date(),
          connections: 0,
          tags: { Environment: 'Production', Source: 'EC2 PostgreSQL', 'Migration Status': 'Complete', 'CDC': 'Active' },
        });

        // Add activity
        addActivityRef.current({
          type: 'database_created',
          title: 'Database migration completed',
          description: 'ecommerce-aurora migrated from EC2 PostgreSQL (21.5M rows)',
          resourceId: 'ecommerce-aurora',
          resourceName: 'ecommerce-aurora',
        });

        // Navigate to database details page
        if (navigateRef.current) {
          navigateRef.current('/database-details');
        }

        // Add agent message asking what to do next with contextual prompts
        await new Promise(r => setTimeout(r, 800));
        setIsAgentTyping(true);
        await new Promise(r => setTimeout(r, 600));
        setIsAgentTyping(false);
        addMessage({
          type: 'agent',
          content: 'What would you like to do next?',
          feedbackEnabled: true,
        });
        setCurrentPrompts([
          { id: 'plan-cutover', text: 'Plan application cutover' },
          { id: 'verify-data', text: 'Run additional validations' },
          { id: 'view-cdc-status', text: 'View CDC replication status' },
          { id: 'view-database', text: 'View database details' },
        ]);
        setShowPrompts(true);
      };

      runMigrationCompletionSequence();
    } else if (actionId === 'configure-manual') {
      // Switch to "Customize" flow
      setDemoPath('configure');
      setWorkflow(prev => ({ ...prev, path: 'customize' }));
      scriptStepRef.current = 0;

      // Run the customize flow
      setIsAgentTyping(true);
      setShowPrompts(false);
      setTimeout(() => {
        executeDemoStep(0);
      }, 1000);
    } else if (actionId === 'start-build-configured') {
      // Transition to review view for final build from customize flow
      setWorkflow(prev => ({ ...prev, view: 'review' }));
      setIsDrawerOpen(true);

      // Update step to in-progress
      setWorkflow(prev => ({
        ...prev,
        steps: prev.steps.map(s =>
          s.id === 'review-finish' ? { ...s, status: 'in-progress' } : s
        ),
      }));

      // Sequential build progress with individual status indicators
      const runConfiguredBuildSequence = async () => {
        const buildSteps = [
          { label: 'Applying cluster configuration...', successLabel: 'Cluster configuration applied' },
          { label: 'Provisioning db.r6g.large instance...', successLabel: 'Instance provisioned' },
          { label: 'Launching Multi-AZ standby...', successLabel: 'Multi-AZ standby launched' },
          { label: 'Configuring security groups...', successLabel: 'Security groups configured' },
          { label: 'Generating connection endpoints...', successLabel: 'Connection endpoints generated' },
        ];

        // Add initial message
        setIsAgentTyping(true);
        await new Promise(r => setTimeout(r, 800));
        setIsAgentTyping(false);

        const initialMessageId = `msg-build-start-${Date.now()}`;
        setMessages(prev => [...prev, {
          id: initialMessageId,
          type: 'agent' as MessageType,
          content: 'Creating your database with the configured settings...',
          timestamp: new Date(),
          feedbackEnabled: false,
        }]);

        // Show each build step sequentially
        for (let i = 0; i < buildSteps.length; i++) {
          await new Promise(r => setTimeout(r, 600));
          setIsAgentTyping(true);
          await new Promise(r => setTimeout(r, 400));
          setIsAgentTyping(false);

          const stepMessageId = `msg-build-step-${i}-${Date.now()}`;

          // First show pending status
          setMessages(prev => [...prev, {
            id: stepMessageId,
            type: 'agent' as MessageType,
            content: '',
            timestamp: new Date(),
            buildProgress: [{ label: buildSteps[i].label, status: 'pending' as const }],
          }]);

          // After a delay, update to success
          await new Promise(r => setTimeout(r, 800));
          setMessages(prev => prev.map(msg =>
            msg.id === stepMessageId
              ? {
                  ...msg,
                  buildProgress: [{ label: buildSteps[i].successLabel, status: 'success' as const }],
                }
              : msg
          ));
        }

        // Final completion message
        await new Promise(r => setTimeout(r, 500));
        setIsAgentTyping(true);
        await new Promise(r => setTimeout(r, 600));
        setIsAgentTyping(false);

        // Create the resource
        const resourceData = {
          id: 'food-delivery-db-001',
          name: 'food-delivery-prod - us-east-1',
          type: 'Aurora DSQL - PostgreSQL',
          region: 'us-east-1',
          status: 'active' as const,
          endpoint: 'food-delivery-prod.dsql.us-east-1.on.aws',
        };

        setWorkflow(prev => ({
          ...prev,
          resource: resourceData,
        }));

        setMessages(prev => [...prev, {
          id: `msg-build-complete-${Date.now()}`,
          type: 'status' as MessageType,
          content: 'Database cluster created successfully!',
          timestamp: new Date(),
          actions: [
            { id: 'complete-configured', label: 'View database', variant: 'primary' },
          ],
        }]);

        // Update step to success
        setWorkflow(prev => ({
          ...prev,
          steps: prev.steps.map(s =>
            s.id === 'review-finish' ? { ...s, status: 'success' } : s
          ),
        }));
      };

      runConfiguredBuildSequence();
    } else if (actionId === 'complete-configured') {
      // Complete the configure together flow
      // Save database to store
      addDatabaseRef.current({
        id: `db-${Date.now()}`,
        name: 'food-delivery-prod',
        engine: 'Aurora DSQL - PostgreSQL',
        region: 'us-east-1',
        status: 'active',
        endpoint: 'food-delivery-xyz.dsql.us-east-1.on.aws',
        createdAt: new Date(),
        connections: 0,
        tags: { Environment: 'Production', Application: 'Food Delivery', Instance: 'db.r6g.xlarge' },
      });

      // Add activity
      addActivityRef.current({
        type: 'database_created',
        title: 'Database cluster created',
        description: 'food-delivery-prod cluster created with custom configuration',
        resourceId: 'food-delivery-prod',
        resourceName: 'food-delivery-prod',
      });

      // Navigate to database details page
      if (navigateRef.current) {
        navigateRef.current('/database-details');
      }

      // Add agent message asking what to do next with contextual prompts
      setIsAgentTyping(true);
      setTimeout(() => {
        setIsAgentTyping(false);
        addMessage({
          type: 'agent',
          content: 'What would you like to do next?',
          feedbackEnabled: true,
        });
        setCurrentPrompts([
          { id: 'import', text: 'Import data' },
          { id: 'connect', text: 'Connect to database' },
          { id: 'schema', text: 'Design schema' },
          { id: 'view-database', text: 'View database details' },
        ]);
        setShowPrompts(true);
      }, 800);
    } else if (actionId === 'review-again') {
      // User wants to review configuration again
      // Show the review-again response from PROMPT_RESPONSES
      const reviewResponse = PROMPT_RESPONSES['review-again'];
      if (reviewResponse) {
        setIsAgentTyping(true);
        setTimeout(() => {
          addMessage({
            type: 'agent',
            content: reviewResponse.message,
            feedbackEnabled: reviewResponse.feedbackEnabled,
          });
          if (reviewResponse.nextPrompts) {
            setCurrentPrompts(reviewResponse.nextPrompts);
            setShowPrompts(true);
          }
          setIsAgentTyping(false);
        }, 800);
      }
    } else {
      runNextStep();
    }
  }, [runNextStep, executeDemoStep, addMessage]);

  // Set drawer open state
  const setDrawerOpen = useCallback((open: boolean) => {
    setIsDrawerOpen(open);
  }, []);

  // Start a workflow
  const startWorkflow = useCallback((config: WorkflowConfig) => {
    // Reset state
    setMessages([]);
    setCurrentPrompts(config.initialPrompts);
    setShowPrompts(true);
    scriptStepRef.current = 0;
    isProcessingRef.current = false;

    setWorkflow({
      isActive: true,
      config,
      view: 'entry',
      selectedOption: config.options[0]?.id || null, // Default to first option
      steps: config.steps.map(s => ({ ...s, status: 'pending' as StepStatus })),
      currentStepIndex: 0,
      resource: null,
      inContext: false,
      path: null,
      configSections: DEFAULT_CONFIG_SECTIONS,
    });
  }, []);

  // Select a workflow option (tile)
  const selectWorkflowOption = useCallback((optionId: string) => {
    setWorkflow(prev => ({ ...prev, selectedOption: optionId }));
  }, []);

  // Transition workflow view
  const transitionWorkflowView = useCallback((view: WorkflowView) => {
    setWorkflow(prev => ({ ...prev, view }));
  }, []);

  // Set workflow path (customize or auto-setup)
  const setWorkflowPath = useCallback((path: WorkflowPath) => {
    setWorkflow(prev => ({ ...prev, path }));
  }, []);

  // Update a configuration section
  const updateConfigSection = useCallback((sectionId: ConfigSectionId, status: StepStatus, values?: ConfigSectionValues) => {
    setWorkflow(prev => ({
      ...prev,
      configSections: {
        ...prev.configSections,
        [sectionId]: {
          ...prev.configSections[sectionId],
          status,
          values: values || prev.configSections[sectionId].values,
        },
      },
    }));
  }, []);

  // End workflow
  const endWorkflow = useCallback(() => {
    setWorkflow({
      isActive: false,
      config: null,
      view: 'entry',
      selectedOption: null,
      steps: [],
      currentStepIndex: 0,
      resource: null,
      inContext: false,
      path: null,
      configSections: DEFAULT_CONFIG_SECTIONS,
    });
    setMessages([]);
    setCurrentPrompts([]);
    setShowPrompts(true);
  }, []);

  const value: ChatContextType = {
    messages,
    currentPrompts,
    showPrompts,
    isAgentTyping,
    isDrawerOpen,
    drawerMode,
    setDrawerMode,
    expandDrawerForWorkflow,
    splitPanelConfig,
    setSplitPanelConfig,
    creationStatus,
    createdDatabaseId,
    createdDatabaseType,
    createdDatabaseName,
    startDatabaseCreation,
    onCreationComplete,
    clearCreationState,
    workflow,
    sendMessage,
    selectPrompt,
    triggerAction,
    setDrawerOpen,
    startWorkflow,
    startWorkflowInContext,
    selectWorkflowOption,
    transitionWorkflowView,
    setWorkflowPath,
    updateConfigSection,
    endWorkflow,
    runNextStep,
    setDemoPath,
    setNavigateCallback,
  };

  return (
    <ChatContext.Provider value={value}>
      {children}
    </ChatContext.Provider>
  );
}

export function useChatContext() {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChatContext must be used within ChatProvider');
  }
  return context;
}
