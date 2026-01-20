import { useWorkflow } from '../WorkflowChat/WorkflowContext';
import type { UnifiedChatState, UnifiedChatActions, Message, SupportPrompt } from './types';

/**
 * Adapter hook that connects WorkflowContext to UnifiedChatPanel
 * Maps WorkflowContext state and actions to the unified interface
 */
export function useWorkflowAdapter(handlers: {
  onSendMessage: (content: string) => void;
  onSelectPrompt: (promptId: string) => void;
  onActionClick: (actionId: string) => void;
  onConfirmPrompts?: () => void;
}): UnifiedChatState & UnifiedChatActions & {
  placeholder: string;
} {
  const { state, config } = useWorkflow();

  // Map messages to the unified Message type
  const mappedMessages: Message[] = state.messages.map((msg) => ({
    id: msg.id,
    type: msg.type,
    content: msg.content,
    timestamp: msg.timestamp,
    actions: msg.actions,
    feedbackEnabled: msg.feedbackEnabled,
    dynamicComponent: msg.dynamicComponent,
    suggestedActions: msg.suggestedActions,
    requiresConfirmation: msg.requiresConfirmation,
    confirmAction: msg.confirmAction,
  }));

  // Map prompts to the unified SupportPrompt type
  const mappedPrompts: SupportPrompt[] = state.currentPrompts.map((p) => ({
    id: p.id,
    text: p.text,
  }));

  return {
    // State
    messages: mappedMessages,
    currentPrompts: mappedPrompts,
    showPrompts: state.showPrompts,
    isAgentTyping: state.isAgentTyping,
    selectedPrompts: state.selectedPrompts,

    // Actions - passed in from parent component
    onSendMessage: handlers.onSendMessage,
    onSelectPrompt: handlers.onSelectPrompt,
    onActionClick: handlers.onActionClick,
    onConfirmPrompts: handlers.onConfirmPrompts,

    // Display options
    placeholder: config.placeholder,
  };
}
