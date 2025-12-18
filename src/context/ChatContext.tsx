import { createContext, useContext, useState, useCallback, useRef, type ReactNode } from 'react';
import { useAppStore } from './AppContext';

// Types
export type MessageType = 'user' | 'agent' | 'status' | 'error';
export type StepStatus = 'pending' | 'in-progress' | 'success' | 'error';
export type WorkflowView = 'entry' | 'chat' | 'wizard' | 'completion';

export interface MessageAction {
  id: string;
  label: string;
  variant?: 'primary' | 'normal';
}

export interface Message {
  id: string;
  type: MessageType;
  content: string;
  timestamp: Date;
  actions?: MessageAction[];
  feedbackEnabled?: boolean;
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
}

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
  createResource?: ResourceInfo;
  transitionView?: WorkflowView;
  delay?: number;
}

// Food delivery CREATE DATABASE demo script
const CREATE_DATABASE_SCRIPT: DemoStep[] = [
  // Step 0: Initial response after user describes their app
  {
    agentMessage: {
      type: 'agent',
      content: `Great! A food delivery platform has some interesting data requirements. Based on your need for real-time order tracking, I'd recommend Aurora DSQL - it handles high write throughput for order updates while maintaining strong consistency for payments.

Quick question: How many restaurants are you planning to support initially?`,
      feedbackEnabled: true,
    },
    prompts: [
      { id: 'under-50', text: 'Under 50 restaurants' },
      { id: '50-200', text: '50-200 restaurants' },
      { id: '200-plus', text: '200+ restaurants' },
    ],
    delay: 1500,
  },
  // Step 1: After scale selection
  {
    agentMessage: {
      type: 'agent',
      content: `Perfect! For your scale, I recommend starting with a single-region setup in us-east-1. You can easily expand to multi-region later as you grow.

One more thing - do you need separate environments for development and testing?`,
      feedbackEnabled: true,
    },
    prompts: [
      { id: 'dev-prod', text: 'Yes, create dev + prod' },
      { id: 'prod-only', text: 'Just production for now' },
    ],
    delay: 1200,
  },
  // Step 2: Confirmation with action buttons
  {
    agentMessage: {
      type: 'agent',
      content: `Here's what I'll set up for you:

• Aurora DSQL cluster (us-east-1)
• Production environment
• Optimized for high-frequency order updates
• Auto-scaling enabled
• Connection pooling configured

Ready to build?`,
      feedbackEnabled: true,
      actions: [
        { id: 'auto-setup', label: 'Auto DB setup', variant: 'primary' },
        { id: 'configure-manual', label: 'Configure together' },
      ],
    },
    delay: 1500,
  },
  // Step 3: Auto setup starts - stay in chat view
  {
    agentMessage: {
      type: 'agent',
      content: `Starting automated setup. I'll configure everything and keep you updated on the progress.`,
    },
    updateStep: { stepId: 'configure', status: 'in-progress' },
    delay: 800,
  },
  // Step 4: Configure progress
  {
    agentMessage: {
      type: 'agent',
      content: `Setting up your Aurora DSQL cluster...

✓ Creating cluster configuration
✓ Configuring security groups
• Provisioning database instance...`,
    },
    createResource: {
      id: 'food-delivery-db-001',
      name: 'food-delivery-prod - us-east-1',
      type: 'Aurora DSQL - PostgreSQL',
      region: 'us-east-1',
      status: 'creating',
    },
    delay: 2000,
  },
  // Step 5: Configure complete, ask about multi-region
  {
    agentMessage: {
      type: 'agent',
      content: `Configuration complete! Now starting the build process.

Do you need the database to serve traffic across multiple regions? I can set up multi-region replication if you expect customers in different geographic areas.`,
      feedbackEnabled: true,
    },
    updateStep: { stepId: 'configure', status: 'success' },
    prompts: [
      { id: 'multi-region-yes', text: 'Yes, enable multi-region' },
      { id: 'multi-region-no', text: 'No, single region is fine' },
    ],
    delay: 2000,
  },
  // Step 6: Build starts
  {
    agentMessage: {
      type: 'agent',
      content: `Got it! I'll finalize the single-region setup. Starting the build process now...`,
    },
    updateStep: { stepId: 'build', status: 'in-progress' },
    delay: 1000,
  },
  // Step 7: Build progress
  {
    agentMessage: {
      type: 'agent',
      content: `Build in progress...

✓ Database instance provisioned
✓ Network configuration applied
✓ IAM roles created
• Generating connection endpoints...`,
    },
    delay: 2000,
  },
  // Step 8: Build complete - status message with action
  {
    agentMessage: {
      type: 'status',
      content: `Everything is configured. Once you click complete, I'll finalize the remaining resources and generate your connection details.`,
      actions: [
        { id: 'complete-setup', label: 'Complete DB setup', variant: 'primary' },
      ],
    },
    delay: 1500,
  },
  // Step 9: Completion
  {
    agentMessage: {
      type: 'agent',
      content: `Your food delivery database is ready!`,
      feedbackEnabled: true,
    },
    updateStep: { stepId: 'build', status: 'success' },
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
    transitionView: 'completion',
    delay: 1500,
  },
  // Step 10: What's next
  {
    agentMessage: {
      type: 'agent',
      content: `What would you like to do next?`,
    },
    prompts: [
      { id: 'connect', text: 'Connect to my cluster' },
      { id: 'import', text: 'Import sample data' },
      { id: 'schema', text: 'View schema' },
    ],
    delay: 800,
  },
];

// CONFIGURE TOGETHER demo script (Hybrid Guided Review)
const CONFIGURE_TOGETHER_SCRIPT: DemoStep[] = [
  // Step 0: Show full configuration recommendation
  {
    agentMessage: {
      type: 'agent',
      content: `Here's my recommended configuration for your food delivery application:

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  CLUSTER CONFIGURATION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  Cluster name:     food-delivery-prod
  Engine:           Aurora DSQL (PostgreSQL)
  Region:           us-east-1

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  INSTANCE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  Instance class:   db.r6g.large (2 vCPU, 16 GB RAM)
  Multi-AZ:         Enabled (high availability)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  STORAGE & PERFORMANCE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  Storage:          Auto-scaling (20 GB - 1 TB)
  IOPS:             3,000 (auto-scales with storage)
  Connection pool:  Enabled (max 100 connections)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  SECURITY
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  Encryption:       Enabled (AWS managed key)
  Public access:    Disabled
  IAM auth:         Enabled

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

What would you like to change? You can select an option below or describe what you'd like to modify.`,
      feedbackEnabled: true,
    },
    prompts: [
      { id: 'change-instance', text: 'Change instance size' },
      { id: 'change-region', text: 'Change region' },
      { id: 'why-multi-az', text: 'Why Multi-AZ?' },
      { id: 'looks-good', text: 'Looks good, proceed' },
    ],
    delay: 1500,
  },
  // Step 1: Response to "Change instance size"
  {
    agentMessage: {
      type: 'agent',
      content: `Good question! Here are the available instance options:

• db.r6g.medium (1 vCPU, 8 GB) - $0.125/hr
  → Best for: Development, testing, low-traffic apps

• db.r6g.large (2 vCPU, 16 GB) - $0.250/hr ← Current
  → Best for: Small-medium production workloads

• db.r6g.xlarge (4 vCPU, 32 GB) - $0.500/hr
  → Best for: High-traffic production apps

• db.r6g.2xlarge (8 vCPU, 64 GB) - $1.00/hr
  → Best for: Large-scale, high-concurrency workloads

For a food delivery app expecting 50-200 restaurants, I'd recommend sticking with db.r6g.large. It can handle ~500 concurrent orders comfortably.

Which size would you prefer?`,
      feedbackEnabled: true,
    },
    prompts: [
      { id: 'instance-medium', text: 'Use medium (save cost)' },
      { id: 'instance-large', text: 'Keep large (recommended)' },
      { id: 'instance-xlarge', text: 'Use xlarge (more headroom)' },
    ],
    delay: 1200,
  },
  // Step 2: After instance selection - update config
  {
    agentMessage: {
      type: 'agent',
      content: `Got it! I've updated the configuration:

✓ Instance class: db.r6g.xlarge (4 vCPU, 32 GB)

This gives you extra headroom for traffic spikes during peak meal times. Good choice for a growing platform!

Here's your updated configuration summary:

  Cluster:    food-delivery-prod
  Engine:     Aurora DSQL (PostgreSQL)
  Region:     us-east-1
  Instance:   db.r6g.xlarge (4 vCPU, 32 GB) ← Updated
  Storage:    Auto-scaling (20 GB - 1 TB)
  Multi-AZ:   Enabled
  Encryption: Enabled

Anything else you'd like to adjust?`,
      feedbackEnabled: true,
    },
    prompts: [
      { id: 'change-more', text: 'Change something else' },
      { id: 'ready-build', text: 'Ready to build' },
    ],
    delay: 1500,
  },
  // Step 3: Ready to build confirmation
  {
    agentMessage: {
      type: 'agent',
      content: `Perfect! Here's the final configuration:

┌─────────────────────────────────────────┐
│  food-delivery-prod                     │
│  Aurora DSQL (PostgreSQL)               │
├─────────────────────────────────────────┤
│  Region:       us-east-1                │
│  Instance:     db.r6g.xlarge            │
│  Storage:      Auto-scaling             │
│  Multi-AZ:     Enabled                  │
│  Encryption:   Enabled                  │
│  IAM Auth:     Enabled                  │
└─────────────────────────────────────────┘

Ready to create your database?`,
      feedbackEnabled: true,
      actions: [
        { id: 'start-build-configured', label: 'Create database', variant: 'primary' },
        { id: 'change-more', label: 'Make more changes' },
      ],
    },
    delay: 1200,
  },
  // Step 4: Build starts
  {
    agentMessage: {
      type: 'agent',
      content: `Creating your database with the configured settings...`,
    },
    updateStep: { stepId: 'configure', status: 'success' },
    delay: 800,
  },
  // Step 5: Build progress
  {
    agentMessage: {
      type: 'agent',
      content: `Build in progress...

✓ Cluster configuration applied
✓ db.r6g.xlarge instance provisioning
✓ Multi-AZ standby launching
✓ Security groups configured
• Generating connection endpoints...`,
    },
    updateStep: { stepId: 'build', status: 'in-progress' },
    createResource: {
      id: 'food-delivery-db-001',
      name: 'food-delivery-prod - us-east-1',
      type: 'Aurora DSQL - PostgreSQL',
      region: 'us-east-1',
      status: 'creating',
      details: {
        'Instance': 'db.r6g.xlarge',
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

The db.r6g.xlarge instance gives you plenty of headroom for growth.`,
      feedbackEnabled: true,
    },
    updateStep: { stepId: 'build', status: 'success' },
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
        'Instance': 'db.r6g.xlarge',
        'Multi-AZ': 'Enabled',
      },
    },
    transitionView: 'completion',
    delay: 1500,
  },
  // Step 8: What's next
  {
    agentMessage: {
      type: 'agent',
      content: `What would you like to do next?`,
    },
    prompts: [
      { id: 'connect', text: 'Connect to my cluster' },
      { id: 'import', text: 'Import sample data' },
      { id: 'schema', text: 'View schema' },
    ],
    delay: 800,
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
    transitionView: 'completion',
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
    transitionView: 'completion',
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
    transitionView: 'completion',
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
      // Open drawer when transitioning to wizard view
      if (step.transitionView === 'wizard') {
        setIsDrawerOpen(true);
      }
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
      // Move chat to drawer when action is triggered
      setWorkflow(prev => ({ ...prev, view: 'wizard' }));
      setIsDrawerOpen(true);

      // Run auto-setup sequence
      runNextStep();

      // Chain subsequent steps
      const runAutoSetupSequence = async () => {
        // Wait for step 3 to complete
        await new Promise(r => setTimeout(r, 2000));

        // Step 4: Configure progress
        if (!isProcessingRef.current) {
          isProcessingRef.current = true;
          setIsAgentTyping(true);
          await executeDemoStep(scriptStepRef.current);
        }

        // Wait then step 5: Configure complete
        await new Promise(r => setTimeout(r, 2500));
        if (!isProcessingRef.current) {
          isProcessingRef.current = true;
          setIsAgentTyping(true);
          await executeDemoStep(scriptStepRef.current);
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
      // Move chat to drawer when import action is triggered
      setWorkflow(prev => ({ ...prev, view: 'wizard' }));
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
      // Move chat to drawer when migration starts
      setWorkflow(prev => ({ ...prev, view: 'wizard' }));
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
      // Switch to "Configure together" flow
      setDemoPath('configure');
      scriptStepRef.current = 0;

      // Run the configure together flow
      setIsAgentTyping(true);
      setShowPrompts(false);
      setTimeout(() => {
        executeDemoStep(0);
      }, 1000);
    } else if (actionId === 'start-build-configured') {
      // Move chat to drawer and start build from configure together flow
      setWorkflow(prev => ({ ...prev, view: 'wizard' }));
      setIsDrawerOpen(true);

      // Run build sequence (steps 4-6 in CONFIGURE_TOGETHER_SCRIPT)
      runNextStep();

      const runConfiguredBuildSequence = async () => {
        // Wait for step 4 to complete
        await new Promise(r => setTimeout(r, 1500));

        // Step 5: Build progress
        if (!isProcessingRef.current) {
          isProcessingRef.current = true;
          setIsAgentTyping(true);
          await executeDemoStep(scriptStepRef.current);
        }

        // Wait then step 6: Build complete status
        await new Promise(r => setTimeout(r, 3000));
        if (!isProcessingRef.current) {
          isProcessingRef.current = true;
          setIsAgentTyping(true);
          await executeDemoStep(scriptStepRef.current);
        }
      };

      runConfiguredBuildSequence();
    } else if (actionId === 'complete-configured') {
      // Complete the configure together flow
      runNextStep();

      const runConfiguredCompletionSequence = async () => {
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

        // Navigate to database details page after completion
        await new Promise(r => setTimeout(r, 1000));
        if (navigateRef.current) {
          navigateRef.current('/database-details');
        }
      };

      runConfiguredCompletionSequence();
    } else {
      runNextStep();
    }
  }, [runNextStep, executeDemoStep]);

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
