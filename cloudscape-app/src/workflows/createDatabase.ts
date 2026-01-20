import type { WorkflowConfig, Message, SupportPrompt, ResourceInfo } from '../components/WorkflowChat/types';

// Workflow configuration
export const createDatabaseConfig: WorkflowConfig = {
  id: 'create-database',
  title: 'Create database',
  subtitle: 'Describe what you\'re building and we\'ll help you set up the optimal solution',
  options: [
    {
      id: 'create-new',
      title: 'Create new',
      description: 'Create a brand new database. Describe your use case and we\'ll help you set up the optimal solution.',
    },
    {
      id: 'create-existing',
      title: 'Create from existing',
      description: 'Tell us about your existing workload and we will build the right solution. We can duplicate existing resources, migrate from on prem, etc...',
    },
  ],
  initialPrompts: [
    { id: 'food-delivery', text: 'Food delivery application' },
    { id: 'ecommerce', text: 'E-commerce platform' },
    { id: 'iot', text: 'IoT sensor data' },
    { id: 'saas', text: 'SaaS analytics' },
  ],
  steps: [
    { id: 'configure', title: 'Configure' },
    { id: 'build', title: 'Build' },
  ],
  placeholder: 'Describe what you are trying to build. A good description should include an application overview, data requirements, and key use cases.',
};

// Demo conversation script
export interface ConversationStep {
  trigger: 'initial' | 'user-message' | 'prompt-selection' | 'action';
  triggerValue?: string;
  agentResponse: Omit<Message, 'id' | 'timestamp'>;
  nextPrompts?: SupportPrompt[];
  updateStep?: { stepId: string; status: 'pending' | 'in-progress' | 'success' | 'error' };
  createResource?: ResourceInfo;
  transitionToView?: 'entry' | 'conversation' | 'split' | 'completion';
  delay?: number;
}

// Script for "Food delivery" demo flow
export const foodDeliveryScript: ConversationStep[] = [
  // Step 1: Initial user message response
  {
    trigger: 'initial',
    agentResponse: {
      type: 'agent',
      content: `Great! A food delivery platform has some interesting data requirements. Based on your need for real-time order tracking, I'd recommend Aurora DSQL - it handles high write throughput for order updates while maintaining strong consistency for payments.

Quick question: How many restaurants are you planning to support initially?`,
      feedbackEnabled: true,
    },
    nextPrompts: [
      { id: 'under-50', text: 'Under 50 restaurants' },
      { id: '50-200', text: '50-200 restaurants' },
      { id: '200-plus', text: '200+ restaurants' },
    ],
    delay: 1500,
  },

  // Step 2: After scale selection
  {
    trigger: 'prompt-selection',
    triggerValue: 'scale',
    agentResponse: {
      type: 'agent',
      content: `Perfect! For your scale, I recommend starting with a single-region setup in us-east-1. You can easily expand to multi-region later as you grow.

One more thing - do you need separate environments for development and testing?`,
      feedbackEnabled: true,
    },
    nextPrompts: [
      { id: 'dev-prod', text: 'Yes, create dev + prod' },
      { id: 'prod-only', text: 'Just production for now' },
    ],
    delay: 1200,
  },

  // Step 3: Confirmation message with actions
  {
    trigger: 'prompt-selection',
    triggerValue: 'environment',
    agentResponse: {
      type: 'agent',
      content: `Here's what I'll set up for you:

• Aurora DSQL cluster (us-east-1)
• Production environment
• Optimized for high-frequency order updates
• Auto-scaling enabled
• Connection pooling configured

Ready to build?`,
      feedbackEnabled: true,
      isConfirmation: true,
      actions: [
        { id: 'auto-setup', label: 'Auto DB setup', variant: 'primary' },
        { id: 'configure-manual', label: 'Configure together' },
      ],
    },
    delay: 1500,
  },

  // Step 4: Auto setup - transition to split view
  {
    trigger: 'action',
    triggerValue: 'auto-setup',
    agentResponse: {
      type: 'agent',
      content: `Starting automated setup. I'll configure everything and keep you updated on the progress.`,
      feedbackEnabled: false,
    },
    transitionToView: 'split',
    updateStep: { stepId: 'configure', status: 'in-progress' },
    delay: 800,
  },

  // Step 5: Configure step progress
  {
    trigger: 'action',
    triggerValue: 'setup-progress-1',
    agentResponse: {
      type: 'agent',
      content: `Setting up your Aurora DSQL cluster...

✓ Creating cluster configuration
✓ Configuring security groups
• Provisioning database instance...`,
      feedbackEnabled: false,
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

  // Step 6: Configure complete
  {
    trigger: 'action',
    triggerValue: 'setup-progress-2',
    agentResponse: {
      type: 'agent',
      content: `Configuration complete! Now starting the build process.

Do you need the database to serve traffic across multiple regions? I can set up multi-region replication if you expect customers in different geographic areas.`,
      feedbackEnabled: true,
    },
    updateStep: { stepId: 'configure', status: 'success' },
    nextPrompts: [
      { id: 'multi-region-yes', text: 'Yes, enable multi-region' },
      { id: 'multi-region-no', text: 'No, single region is fine' },
    ],
    delay: 2500,
  },

  // Step 7: Build step starts
  {
    trigger: 'prompt-selection',
    triggerValue: 'multi-region',
    agentResponse: {
      type: 'agent',
      content: `Got it! I'll finalize the single-region setup. Starting the build process now...`,
      feedbackEnabled: false,
    },
    updateStep: { stepId: 'build', status: 'in-progress' },
    delay: 1000,
  },

  // Step 8: Build progress
  {
    trigger: 'action',
    triggerValue: 'build-progress-1',
    agentResponse: {
      type: 'agent',
      content: `Build in progress...

✓ Database instance provisioned
✓ Network configuration applied
✓ IAM roles created
• Generating connection endpoints...`,
      feedbackEnabled: false,
    },
    delay: 2000,
  },

  // Step 9: Build complete - status message
  {
    trigger: 'action',
    triggerValue: 'build-complete',
    agentResponse: {
      type: 'status',
      content: `Everything is configured. Once you click complete, I'll finalize the remaining resources and generate your connection details.`,
      actions: [
        { id: 'complete-setup', label: 'Complete DB setup', variant: 'primary' },
      ],
    },
    delay: 2000,
  },

  // Step 10: Workflow complete
  {
    trigger: 'action',
    triggerValue: 'complete-setup',
    agentResponse: {
      type: 'agent',
      content: `Your food delivery database is ready! Here's what I set up:`,
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
    transitionToView: 'completion',
    delay: 1500,
  },

  // Step 11: What's next
  {
    trigger: 'action',
    triggerValue: 'show-next-steps',
    agentResponse: {
      type: 'agent',
      content: `What would you like to do next?`,
      feedbackEnabled: false,
    },
    nextPrompts: [
      { id: 'connect', text: 'Connect to my cluster' },
      { id: 'import', text: 'Import sample data' },
      { id: 'schema', text: 'View schema' },
    ],
    delay: 800,
  },
];

// Helper to get next script step based on current state
export function getNextScriptStep(
  currentStepIndex: number,
  _trigger: ConversationStep['trigger'],
  _triggerValue?: string
): ConversationStep | null {
  // For demo, we'll use a simplified linear flow
  if (currentStepIndex >= foodDeliveryScript.length) {
    return null;
  }
  return foodDeliveryScript[currentStepIndex];
}
