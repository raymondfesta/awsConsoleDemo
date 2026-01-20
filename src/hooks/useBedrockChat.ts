import { useState, useCallback, useRef } from 'react';
import { chatApi, type ConversationMessage, type ChatResponse, type ChatContext } from '../services/api';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  dynamicComponent?: {
    type: string;
    props: Record<string, unknown>;
  };
  suggestedActions?: Array<{
    id: string;
    text: string;
  }>;
  requiresConfirmation?: boolean;
  confirmAction?: {
    label: string;
    variant: 'primary' | 'normal';
    action: string;
    params?: Record<string, unknown>;
  };
}

interface UseBedrockChatOptions {
  context?: ChatContext;
  onError?: (error: Error) => void;
}

interface UseBedrockChatReturn {
  messages: ChatMessage[];
  isLoading: boolean;
  error: Error | null;
  sendMessage: (content: string) => Promise<void>;
  clearMessages: () => void;
  testConnection: () => Promise<boolean>;
}

/**
 * Hook for using Bedrock AI chat with dynamic component rendering
 *
 * Usage:
 * const { messages, isLoading, sendMessage } = useBedrockChat({
 *   context: { currentPage: '/databases', databases: [...] }
 * });
 */
export function useBedrockChat(options: UseBedrockChatOptions = {}): UseBedrockChatReturn {
  const { context, onError } = options;
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  // Keep track of conversation history for API
  const conversationRef = useRef<ConversationMessage[]>([]);

  const sendMessage = useCallback(async (content: string) => {
    // Add user message to state
    const userMessage: ChatMessage = {
      id: `msg-${Date.now()}-user`,
      role: 'user',
      content,
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, userMessage]);

    // Add to conversation history
    conversationRef.current.push({
      role: 'user',
      content,
    });

    setIsLoading(true);
    setError(null);

    try {
      // Call Bedrock API
      const response: ChatResponse = await chatApi.sendMessage(
        conversationRef.current,
        context
      );

      // Create assistant message from response
      const assistantMessage: ChatMessage = {
        id: `msg-${Date.now()}-assistant`,
        role: 'assistant',
        content: response.message,
        timestamp: new Date(),
        dynamicComponent: response.component,
        suggestedActions: response.suggestedActions,
        requiresConfirmation: response.requiresConfirmation,
        confirmAction: response.confirmAction,
      };

      // Add to state
      setMessages(prev => [...prev, assistantMessage]);

      // Add to conversation history
      conversationRef.current.push({
        role: 'assistant',
        content: response.message,
      });
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to send message');
      setError(error);
      onError?.(error);

      // Add error message to chat
      setMessages(prev => [
        ...prev,
        {
          id: `msg-${Date.now()}-error`,
          role: 'assistant',
          content: `Error: ${error.message}. Please try again.`,
          timestamp: new Date(),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  }, [context, onError]);

  const clearMessages = useCallback(() => {
    setMessages([]);
    conversationRef.current = [];
    setError(null);
  }, []);

  const testConnection = useCallback(async () => {
    try {
      const result = await chatApi.testConnection();
      return result.connected;
    } catch {
      return false;
    }
  }, []);

  return {
    messages,
    isLoading,
    error,
    sendMessage,
    clearMessages,
    testConnection,
  };
}

export default useBedrockChat;
