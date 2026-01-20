// Workflow Types and Interfaces

export type WorkflowType =
  | 'create-database'
  | 'migrate-database'
  | 'connect-cluster'
  | 'import-data'
  | 'view-schema';

export type WorkflowView =
  | 'entry'
  | 'conversation'
  | 'split'
  | 'completion';

export type MessageType =
  | 'user'
  | 'agent'
  | 'status'
  | 'error';

export type StepStatus =
  | 'pending'
  | 'in-progress'
  | 'success'
  | 'error';

export interface WorkflowOption {
  id: string;
  title: string;
  description: string;
  icon?: string;
}

export interface SupportPrompt {
  id: string;
  text: string;
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
  isConfirmation?: boolean;
  // NEW: Dynamic component from AI
  dynamicComponent?: DynamicComponent;
  // NEW: Suggested follow-up prompts from AI
  suggestedActions?: SupportPrompt[];
  // NEW: For user authorized actions pattern
  requiresConfirmation?: boolean;
  confirmAction?: ConfirmAction;
}

export interface MessageAction {
  id: string;
  label: string;
  variant?: 'primary' | 'normal';
  onClick?: () => void;
}

export interface WorkflowStep {
  id: string;
  title: string;
  status: StepStatus;
  description?: string;
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
  id: WorkflowType;
  title: string;
  subtitle?: string;
  options: WorkflowOption[];
  initialPrompts: SupportPrompt[];
  steps: Omit<WorkflowStep, 'status'>[];
  placeholder: string;
}

export interface WorkflowState {
  currentView: WorkflowView;
  selectedOption: string | null;
  messages: Message[];
  currentPrompts: SupportPrompt[];
  showPrompts: boolean;
  selectedPrompts: string[];
  steps: WorkflowStep[];
  currentStepIndex: number;
  resource: ResourceInfo | null;
  isAgentTyping: boolean;
  workflowComplete: boolean;
}

export interface WorkflowContextType {
  config: WorkflowConfig;
  state: WorkflowState;
  // Actions
  selectOption: (optionId: string) => void;
  sendMessage: (content: string) => void;
  selectPrompt: (promptId: string) => void;
  confirmPromptSelection: () => void;
  triggerAction: (actionId: string) => void;
  transitionToView: (view: WorkflowView) => void;
  updateStep: (stepId: string, status: StepStatus) => void;
  setResource: (resource: ResourceInfo) => void;
  resetWorkflow: () => void;
}
