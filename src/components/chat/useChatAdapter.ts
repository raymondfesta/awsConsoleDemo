import { useChatContext } from '../../context/ChatContext';
import type { UnifiedChatState, UnifiedChatActions, Message, SupportPrompt } from './types';

/**
 * Adapter hook that connects ChatContext to UnifiedChatPanel
 * Maps ChatContext state and actions to the unified interface
 */
export function useChatAdapter(): UnifiedChatState & UnifiedChatActions & {
  showWelcome: boolean;
  placeholder: string;
} {
  const {
    messages,
    currentPrompts,
    showPrompts,
    isAgentTyping,
    workflow,
    sendMessage,
    selectPrompt,
    triggerAction,
  } = useChatContext();

  // Map messages to the unified Message type
  const mappedMessages: Message[] = messages.map((msg) => ({
    id: msg.id,
    type: msg.type,
    content: msg.content,
    timestamp: msg.timestamp,
    actions: msg.actions,
    feedbackEnabled: msg.feedbackEnabled,
    stepCompleted: msg.stepCompleted,
    buildProgress: msg.buildProgress,
    recommendationMeta: msg.recommendationMeta,
    dynamicComponent: msg.dynamicComponent,
    suggestedActions: msg.suggestedActions,
    requiresConfirmation: msg.requiresConfirmation,
    confirmAction: msg.confirmAction,
  }));

  // Map prompts to the unified SupportPrompt type
  const mappedPrompts: SupportPrompt[] = currentPrompts.map((p) => ({
    id: p.id,
    text: p.text,
  }));

  return {
    // State
    messages: mappedMessages,
    currentPrompts: mappedPrompts,
    showPrompts,
    isAgentTyping,
    selectedPrompts: [], // ChatContext doesn't use multi-select

    // Actions
    onSendMessage: sendMessage,
    onSelectPrompt: selectPrompt,
    onActionClick: triggerAction,
    onConfirmPrompts: undefined, // ChatContext doesn't use multi-select confirmation

    // Display options
    showWelcome: !workflow.isActive && messages.length === 0,
    placeholder: workflow.isActive
      ? 'Describe what you need help with'
      : 'Ask a question about your databases...',
  };
}
