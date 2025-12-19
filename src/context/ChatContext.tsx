import { createContext, useContext, useState, useCallback, useRef, type ReactNode } from 'react';
import { useAppStore } from './AppContext';

// Types
export type MessageType = 'user' | 'agent' | 'status' | 'error';
export type StepStatus = 'pending' | 'in-progress' | 'success' | 'error';
export type WorkflowView = 'entry' | 'chat' | 'design' | 'review';
export type WorkflowPath = 'customize' | 'auto-setup' | null;

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

export interface Message {
  id: string;
  type: MessageType;
  content: string;
  timestamp: Date;
  actions?: MessageAction[];
  feedbackEnabled?: boolean;
  stepCompleted?: string; // Step title to show as completed status indicator
  buildProgress?: BuildProgressItem[]; // Progress items with status indicators
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

  // Workflow state
  workflow: WorkflowState;

  // Chat actions
  sendMessage: (content: string) => void;
  selectPrompt: (promptId: string) => void;
  triggerAction: (actionId: string) => void;
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
  setDemoPath: (path: 'new' | 'clone' | 'migrate' | 'configure') => void;

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
  updateConfigSections?: Array<{ sectionId: ConfigSectionId; status: StepStatus; values?: ConfigSectionValues }>;
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
}

// Mapping of prompt IDs to their specific responses
const PROMPT_RESPONSES: Record<string, PromptResponse> = {
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
  // Step 0: Initial response
  {
    agentMessage: {
      type: 'agent',
      content: `I'll help you migrate your database to Aurora DSQL. This includes schema migration, data transfer, and validation.

What's your current database setup?`,
      feedbackEnabled: true,
    },
    prompts: [
      { id: 'migrate-ec2-postgres', text: 'PostgreSQL on EC2' },
      { id: 'migrate-ec2-mysql', text: 'MySQL on EC2' },
      { id: 'migrate-rds', text: 'Amazon RDS' },
      { id: 'migrate-other', text: 'Other source' },
    ],
    delay: 1500,
  },
  // Step 1: After source type selection
  {
    agentMessage: {
      type: 'agent',
      content: `PostgreSQL on EC2 - great choice for migration to Aurora DSQL!

To connect to your source database, I'll need some details. Can you provide the connection information?`,
      feedbackEnabled: true,
    },
    prompts: [
      { id: 'connect-info', text: 'Enter connection details' },
      { id: 'use-secrets', text: 'Use AWS Secrets Manager' },
      { id: 'use-demo', text: 'Use demo settings' },
    ],
    delay: 1200,
  },
  // Step 2: Connection validation
  {
    agentMessage: {
      type: 'agent',
      content: `I've connected to your EC2 PostgreSQL instance.

Source database details:
• Host: ec2-postgres.example.com
• Database: ecommerce_prod
• Size: 45 GB
• Tables: 24
• PostgreSQL version: 14.9

How would you like to handle the migration?`,
      feedbackEnabled: true,
    },
    prompts: [
      { id: 'full-migration', text: 'Full migration (schema + data)' },
      { id: 'schema-only', text: 'Schema only' },
      { id: 'incremental', text: 'Incremental sync' },
    ],
    delay: 1500,
  },
  // Step 3: Migration plan
  {
    agentMessage: {
      type: 'agent',
      content: `I'll perform a full migration. Here's the plan:

Phase 1: Preparation
• Create Aurora DSQL cluster
• Set up AWS DMS replication instance

Phase 2: Schema Migration
• Migrate all 24 tables
• Recreate indexes and constraints

Phase 3: Data Migration
• Initial data load (45 GB)
• Enable CDC for ongoing changes

Phase 4: Validation
• Row count verification
• Data integrity checks

Estimated time: ~2 hours. Ready to start?`,
      feedbackEnabled: true,
      actions: [
        { id: 'start-migration', label: 'Start migration', variant: 'primary' },
        { id: 'configure-manual', label: 'Customize plan' },
      ],
    },
    delay: 2000,
  },
  // Step 4: Migration starts
  {
    agentMessage: {
      type: 'agent',
      content: `Starting migration process...

Phase 1: Creating Aurora DSQL cluster in us-east-1`,
    },
    updateStep: { stepId: 'configure', status: 'in-progress' },
    delay: 800,
  },
  // Step 5: Phase 1 progress
  {
    agentMessage: {
      type: 'agent',
      content: `Phase 1: Preparation

✓ Aurora DSQL cluster created
✓ DMS replication instance launched
✓ Source endpoint configured
• Target endpoint configuration...`,
    },
    createResource: {
      id: 'ecommerce-aurora-001',
      name: 'ecommerce-aurora - us-east-1',
      type: 'Aurora DSQL - PostgreSQL (Migration)',
      region: 'us-east-1',
      status: 'creating',
      details: {
        'Source': 'ec2-postgres.example.com',
        'Migration Type': 'Full + CDC',
      },
    },
    delay: 2500,
  },
  // Step 6: Phase 2
  {
    agentMessage: {
      type: 'agent',
      content: `Phase 2: Schema Migration

✓ Tables created: 24/24
✓ Indexes recreated: 18/18
✓ Foreign keys: 12/12
✓ Sequences configured`,
      feedbackEnabled: true,
    },
    updateStep: { stepId: 'configure', status: 'success' },
    delay: 2000,
  },
  // Step 7: Phase 3
  {
    agentMessage: {
      type: 'agent',
      content: `Phase 3: Data Migration

Transferring data to Aurora DSQL...

Progress: 78% complete
• users: ✓ Complete (1.2M rows)
• orders: ✓ Complete (5.8M rows)
• products: ✓ Complete (45K rows)
• inventory: Loading... (2.1M rows)`,
    },
    updateStep: { stepId: 'build', status: 'in-progress' },
    delay: 2500,
  },
  // Step 8: Migration complete status
  {
    agentMessage: {
      type: 'status',
      content: `Data migration complete! CDC is active for ongoing changes. Click complete to finalize and run validation.`,
      actions: [
        { id: 'complete-migration', label: 'Complete & validate', variant: 'primary' },
      ],
    },
    delay: 2000,
  },
  // Step 9: Validation & Completion
  {
    agentMessage: {
      type: 'agent',
      content: `Migration completed successfully!

Validation Results:
✓ Row counts match: 9.1M rows
✓ Data integrity verified
✓ CDC replication active
✓ No errors detected

Your ecommerce database is now running on Aurora DSQL!`,
      feedbackEnabled: true,
    },
    updateStep: { stepId: 'build', status: 'success' },
    createResource: {
      id: 'ecommerce-aurora-001',
      name: 'ecommerce-aurora - us-east-1',
      type: 'Aurora DSQL - PostgreSQL',
      region: 'us-east-1',
      status: 'active',
      endpoint: 'ecommerce-aurora.dsql.us-east-1.on.aws',
      details: {
        'Source': 'ec2-postgres.example.com',
        'Records Migrated': '9.1M',
        'CDC Status': 'Active',
      },
    },
    delay: 2000,
  },
  // Step 10: What's next
  {
    agentMessage: {
      type: 'agent',
      content: `What would you like to do next?`,
    },
    prompts: [
      { id: 'cutover', text: 'Plan cutover' },
      { id: 'verify', text: 'Run more validations' },
      { id: 'dashboard', text: 'View dashboard' },
    ],
    delay: 800,
  },
];

// Track which demo path to use (set when user clicks initial prompt or action)
let currentDemoPath: 'new' | 'clone' | 'migrate' | 'configure' = 'new';

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
      }
      return CREATE_DATABASE_SCRIPT;
    default:
      return CREATE_DATABASE_SCRIPT;
  }
}

// Set the demo path
function setDemoPath(path: 'new' | 'clone' | 'migrate' | 'configure') {
  currentDemoPath = path;
}

export function ChatProvider({ children }: { children: ReactNode }) {
  // App store for persisting databases and activities
  const { addDatabase, addActivity } = useAppStore();

  // Chat state
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentPrompts, setCurrentPrompts] = useState<SupportPrompt[]>([]);
  const [showPrompts, setShowPrompts] = useState(true);
  const [isAgentTyping, setIsAgentTyping] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

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

  // Navigation callback
  const navigateRef = useRef<((path: string) => void) | null>(null);

  // Refs for app store functions (to avoid dependency issues)
  const addDatabaseRef = useRef(addDatabase);
  const addActivityRef = useRef(addActivity);
  addDatabaseRef.current = addDatabase;
  addActivityRef.current = addActivity;

  const setNavigateCallback = useCallback((callback: (path: string) => void) => {
    navigateRef.current = callback;
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
      // First message - transition to centered chat view and run demo
      setWorkflow(prev => ({ ...prev, view: 'chat' }));
      setIsAgentTyping(true);
      setShowPrompts(false);
      setTimeout(() => {
        executeDemoStep(0);
      }, 1500);
    } else {
      // Continue demo
      runNextStep();
    }
  }, [addMessage, workflow.isActive, workflow.view, executeDemoStep, runNextStep]);

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
          navigateRef.current?.('/database-details');
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
          navigateRef.current?.('/database-details');
        }, 500);
        return;
      }

      if (promptId === 'connect' || promptId === 'schema') {
        // These could navigate to other pages in the future
        runNextStep();
        return;
      }

      // Check if there's a prompt-specific response
      const promptResponse = PROMPT_RESPONSES[promptId];
      if (promptResponse) {
        setIsAgentTyping(true);

        setTimeout(() => {
          // Apply config updates and step updates
          setWorkflow(prev => {
            let newState = { ...prev };

            // Apply config section updates if any
            if (promptResponse.configUpdates) {
              const newConfigSections = { ...prev.configSections };
              for (const update of promptResponse.configUpdates) {
                newConfigSections[update.sectionId] = {
                  ...newConfigSections[update.sectionId],
                  status: update.status,
                  values: update.values || newConfigSections[update.sectionId].values,
                };
              }
              newState = { ...newState, configSections: newConfigSections };
            }

            // Apply step status update if any
            if (promptResponse.updateStep) {
              const newSteps = prev.steps.map(step =>
                step.id === promptResponse.updateStep!.stepId
                  ? { ...step, status: promptResponse.updateStep!.status }
                  : step
              );
              newState = { ...newState, steps: newSteps };
            }

            return newState;
          });

          // Add the response message with actions and stepCompleted if present
          addMessage({
            type: 'agent',
            content: promptResponse.message,
            feedbackEnabled: promptResponse.feedbackEnabled,
            actions: promptResponse.actions,
            stepCompleted: promptResponse.stepCompleted,
          });

          // Set next prompts if any
          if (promptResponse.nextPrompts) {
            setCurrentPrompts(promptResponse.nextPrompts);
            setShowPrompts(true);
          } else {
            setShowPrompts(false);
          }

          setIsAgentTyping(false);

          // If this is a security confirmation, trigger Step 4 of CONFIGURE_TOGETHER_SCRIPT to show final summary
          if (promptId === 'security-confirm' || promptId === 'security-custom-key' || promptId === 'security-change-vpc') {
            // Skip to Step 4 (final summary) - steps 0-3 are handled by PROMPT_RESPONSES
            scriptStepRef.current = 4;
            // Short delay then run Step 4 to show the summary with Create database button
            setTimeout(() => {
              runNextStep();
            }, 800);
          }
        }, 1200);
        return;
      }

      // Check if this is a multi-region prompt - need to chain build steps
      if (promptId === 'multi-region-yes' || promptId === 'multi-region-no') {
        // Run step 6 (build starts), then auto-chain 7 and 8
        runNextStep();

        const runBuildSequence = async () => {
          // Wait for step 6 to complete
          await new Promise(r => setTimeout(r, 2000));

          // Step 7: Build progress
          if (!isProcessingRef.current) {
            isProcessingRef.current = true;
            setIsAgentTyping(true);
            await executeDemoStep(scriptStepRef.current);
          }

          // Wait then step 8: Build complete
          await new Promise(r => setTimeout(r, 2500));
          if (!isProcessingRef.current) {
            isProcessingRef.current = true;
            setIsAgentTyping(true);
            await executeDemoStep(scriptStepRef.current);
          }
        };

        runBuildSequence();
      } else {
        runNextStep();
      }
    }
  }, [currentPrompts, addMessage, runNextStep, executeDemoStep, startWorkflowInContext]);

  // Trigger an action from a message
  const triggerAction = useCallback((actionId: string) => {
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

        // Save database to store
        await new Promise(r => setTimeout(r, 500));
        addDatabaseRef.current({
          id: `db-${Date.now()}`,
          name: 'food-delivery-prod',
          engine: 'Aurora DSQL - PostgreSQL',
          region: 'us-east-1',
          status: 'active',
          endpoint: 'food-delivery-xyz.dsql.us-east-1.on.aws',
          createdAt: new Date(),
          connections: 0,
          tags: { Environment: 'Production', Application: 'Food Delivery' },
        });

        // Add activity
        addActivityRef.current({
          type: 'database_created',
          title: 'Database cluster created',
          description: 'food-delivery-prod cluster is now active in us-east-1',
          resourceId: 'food-delivery-prod',
          resourceName: 'food-delivery-prod',
        });

        // Navigate to database details page after completion
        await new Promise(r => setTimeout(r, 1000));
        if (navigateRef.current) {
          navigateRef.current('/database-details');
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
    } else if (actionId === 'start-migration') {
      // Transition to design view for migration
      setWorkflow(prev => ({ ...prev, view: 'design' }));
      setIsDrawerOpen(true);

      // Run migration sequence
      runNextStep();

      const runMigrationSequence = async () => {
        // Wait for step 4 to complete
        await new Promise(r => setTimeout(r, 2000));

        // Step 5: Phase 1 progress
        if (!isProcessingRef.current) {
          isProcessingRef.current = true;
          setIsAgentTyping(true);
          await executeDemoStep(scriptStepRef.current);
        }

        // Wait then step 6: Phase 2
        await new Promise(r => setTimeout(r, 3000));
        if (!isProcessingRef.current) {
          isProcessingRef.current = true;
          setIsAgentTyping(true);
          await executeDemoStep(scriptStepRef.current);
        }

        // Wait then step 7: Phase 3
        await new Promise(r => setTimeout(r, 2500));
        if (!isProcessingRef.current) {
          isProcessingRef.current = true;
          setIsAgentTyping(true);
          await executeDemoStep(scriptStepRef.current);
        }

        // Wait then step 8: Migration complete status
        await new Promise(r => setTimeout(r, 3000));
        if (!isProcessingRef.current) {
          isProcessingRef.current = true;
          setIsAgentTyping(true);
          await executeDemoStep(scriptStepRef.current);
        }
      };

      runMigrationSequence();
    } else if (actionId === 'complete-migration') {
      // Run migration completion sequence
      runNextStep();

      const runMigrationCompletionSequence = async () => {
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
          tags: { Environment: 'Production', Source: 'EC2 PostgreSQL', 'Migration Status': 'Complete' },
        });

        // Add activity
        addActivityRef.current({
          type: 'database_created',
          title: 'Database migration completed',
          description: 'ecommerce-aurora migrated from EC2 PostgreSQL',
          resourceId: 'ecommerce-aurora',
          resourceName: 'ecommerce-aurora',
        });

        // Navigate to database details page after completion
        await new Promise(r => setTimeout(r, 1000));
        if (navigateRef.current) {
          navigateRef.current('/database-details');
        }
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
      selectedOption: null,
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
