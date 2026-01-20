import type { WorkflowConfig } from '../context/ChatContext';

// Prompts for "Create new" option
const CREATE_NEW_PROMPTS = [
  { id: 'ecommerce-inventory', text: 'E-commerce Product Inventory' },
  { id: 'cms', text: 'Content Management System (CMS)' },
  { id: 'financial-logging', text: 'Financial Transaction Logging' },
];

// Prompts for "Create from existing" option
const CREATE_EXISTING_PROMPTS = [
  { id: 'clone-database', text: 'Clone an existing database' },
  { id: 'migrate-ec2', text: 'Migrate from EC2 to Aurora' },
];

// Create Database workflow configuration
export const CREATE_DATABASE_CONFIG: WorkflowConfig = {
  id: 'create-database',
  title: 'Create database',
  subtitle: '',
  options: [
    {
      id: 'create-new',
      title: 'Create new',
      description: "Create a brand new database. Describe your use case and we'll help you set up the optimal solution.",
    },
    {
      id: 'create-existing',
      title: 'Create from existing',
      description: 'Tell us about your existing source database and we will build the right-sized target. We can migrate data for you.',
    },
  ],
  initialPrompts: CREATE_NEW_PROMPTS,
  steps: [
    { id: 'context-requirements', title: 'Context and requirements' },
    { id: 'db-design', title: 'DB Design' },
    { id: 'review-finish', title: 'Review and finish' },
  ],
  placeholder: 'Describe how you plan to use your new database...',
};

// Import Data workflow configuration
export const IMPORT_DATA_CONFIG: WorkflowConfig = {
  id: 'import-data',
  title: 'Import data',
  subtitle: 'Import data into your database from various sources',
  options: [
    {
      id: 'sample-data',
      title: 'Sample data',
      description: 'Import pre-built sample datasets to explore your database capabilities.',
    },
    {
      id: 'existing-data',
      title: 'From existing source',
      description: 'Import data from S3, local files, or another database.',
    },
  ],
  initialPrompts: [
    { id: 'food-orders', text: 'Food delivery orders dataset' },
    { id: 'restaurants', text: 'Restaurant catalog' },
    { id: 'customers', text: 'Customer profiles' },
    { id: 'custom', text: 'Custom CSV upload' },
  ],
  steps: [
    { id: 'configure', title: 'Configure' },
    { id: 'import', title: 'Import' },
  ],
  placeholder: 'Describe the data you want to import. Include the source, format, and any transformation requirements.',
};

// Helper to get prompts based on selected option for create-database workflow
export function getCreateDatabasePrompts(selectedOption: string | null) {
  if (selectedOption === 'create-existing') {
    return CREATE_EXISTING_PROMPTS;
  }
  return CREATE_NEW_PROMPTS;
}
