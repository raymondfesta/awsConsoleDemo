// Unified Chat Component Types
// These types are shared between ChatInterface and WorkflowChat

import type { ReactNode } from 'react';

// Message types
export type MessageType = 'user' | 'agent' | 'status' | 'error';

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

// Support prompt / suggested action
export interface SupportPrompt {
  id: string;
  text: string;
}

// Action button on messages
export interface MessageAction {
  id: string;
  label: string;
  variant?: 'primary' | 'normal';
}

// Build progress item (for ChatInterface features)
export interface BuildProgressItem {
  label: string;
  status: 'pending' | 'success' | 'error';
}

// Recommendation section (for collapsible recommendations)
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

// Core message interface - combines all features from both interfaces
export interface Message {
  id: string;
  type: MessageType;
  content: string;
  timestamp: Date;
  // Optional features
  actions?: MessageAction[];
  feedbackEnabled?: boolean;
  // ChatInterface-specific features
  stepCompleted?: string;
  buildProgress?: BuildProgressItem[];
  recommendationMeta?: RecommendationMeta;
  // AI response features
  dynamicComponent?: DynamicComponent;
  suggestedActions?: SupportPrompt[];
  requiresConfirmation?: boolean;
  confirmAction?: ConfirmAction;
}

// State interface for unified chat panel
export interface UnifiedChatState {
  messages: Message[];
  currentPrompts: SupportPrompt[];
  showPrompts: boolean;
  isAgentTyping: boolean;
  selectedPrompts?: string[];
}

// Actions interface for unified chat panel
export interface UnifiedChatActions {
  onSendMessage: (content: string) => void;
  onSelectPrompt: (promptId: string) => void;
  onActionClick: (actionId: string) => void;
  onConfirmPrompts?: () => void;
}

// Props for the unified chat panel component
export interface UnifiedChatPanelProps extends UnifiedChatState, UnifiedChatActions {
  // Display variant
  variant?: 'drawer' | 'page' | 'panel';

  // Welcome/empty state
  showWelcome?: boolean;
  welcomeMessage?: ReactNode;

  // Input configuration
  placeholder?: string;

  // Header configuration
  showHeader?: boolean;
  headerTitle?: string;
  stepIndicator?: { current: number; total: number };
}

// Props for message renderer component
export interface MessageRendererProps {
  message: Message;
  onActionClick: (actionId: string) => void;
  onPromptClick?: (promptId: string) => void;
  onFormChange?: (fieldId: string, value: unknown) => void;
}
