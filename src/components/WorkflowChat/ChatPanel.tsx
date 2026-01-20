import { useState, useRef, useEffect } from 'react';
import Box from '@cloudscape-design/components/box';
import SpaceBetween from '@cloudscape-design/components/space-between';
import PromptInput from '@cloudscape-design/components/prompt-input';
import Button from '@cloudscape-design/components/button';
import ButtonGroup from '@cloudscape-design/components/button-group';
import Alert from '@cloudscape-design/components/alert';
import { ChatBubble, Avatar, LoadingBar } from '@cloudscape-design/chat-components';
import { SupportPromptGroup } from '@cloudscape-design/chat-components';
import { useWorkflow } from './WorkflowContext';
import type { Message } from './types';

interface ChatPanelProps {
  onSendMessage: (message: string) => void;
  onActionClick?: (actionId: string) => void;
  onPromptSelect?: (promptId: string) => void;
  onPromptsConfirm?: () => void;
  showHeader?: boolean;
  headerTitle?: string;
  stepIndicator?: { current: number; total: number };
}

export default function ChatPanel({
  onSendMessage,
  onActionClick,
  onPromptSelect,
  onPromptsConfirm,
  showHeader = false,
  headerTitle,
  stepIndicator,
}: ChatPanelProps) {
  const { state } = useWorkflow();
  const [inputValue, setInputValue] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [state.messages, state.isAgentTyping]);

  const handleSubmit = () => {
    if (inputValue.trim() && !state.isAgentTyping) {
      onSendMessage(inputValue.trim());
      setInputValue('');
    }
  };

  const handlePromptClick = (promptId: string) => {
    if (onPromptSelect) {
      onPromptSelect(promptId);
    }
  };

  const renderMessage = (message: Message) => {
    // Status or Error messages use Alert component
    if (message.type === 'status' || message.type === 'error') {
      return (
        <Alert
          key={message.id}
          type={message.type === 'error' ? 'error' : 'success'}
          header={message.type === 'error' ? 'Error' : undefined}
          action={
            message.actions && message.actions.length > 0 ? (
              <SpaceBetween direction="horizontal" size="xs">
                {message.actions.map((action) => (
                  <Button
                    key={action.id}
                    variant={action.variant === 'primary' ? 'primary' : 'normal'}
                    onClick={() => onActionClick?.(action.id)}
                  >
                    {action.label}
                  </Button>
                ))}
              </SpaceBetween>
            ) : undefined
          }
        >
          {message.content}
        </Alert>
      );
    }

    // User messages
    if (message.type === 'user') {
      return (
        <ChatBubble
          key={message.id}
          type="outgoing"
          ariaLabel="You said"
          avatar={<Avatar color="default" ariaLabel="User" tooltipText="You" />}
        >
          {message.content}
        </ChatBubble>
      );
    }

    // Agent messages with optional actions
    return (
      <div key={message.id}>
        <ChatBubble
          type="incoming"
          ariaLabel="Agent said"
          avatar={
            <Avatar
              color="gen-ai"
              iconName="gen-ai"
              ariaLabel="AI Assistant"
              tooltipText="Database Agent"
            />
          }
          actions={
            message.feedbackEnabled ? (
              <ButtonGroup
                ariaLabel="Message feedback"
                variant="icon"
                items={[
                  { type: 'icon-button', id: 'thumbs-up', iconName: 'thumbs-up', text: 'Helpful' },
                  { type: 'icon-button', id: 'thumbs-down', iconName: 'thumbs-down', text: 'Not helpful' },
                  { type: 'icon-button', id: 'copy', iconName: 'copy', text: 'Copy' },
                ]}
              />
            ) : undefined
          }
        >
          {message.content}
        </ChatBubble>

        {/* Inline action buttons for agent messages */}
        {message.actions && message.actions.length > 0 && (
          <Box margin={{ top: 's', left: 'xxxl' }}>
            <SpaceBetween direction="horizontal" size="xs">
              {message.actions.map((action) => (
                <Button
                  key={action.id}
                  variant={action.variant === 'primary' ? 'primary' : 'normal'}
                  onClick={() => onActionClick?.(action.id)}
                >
                  {action.label}
                </Button>
              ))}
            </SpaceBetween>
          </Box>
        )}
      </div>
    );
  };

  // Check if we have selected prompts that need confirmation
  const hasSelectedPrompts = state.selectedPrompts.length > 0;

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      backgroundColor: 'var(--color-background-layout-main)',
    }}>
      {/* Optional header */}
      {showHeader && (
        <div style={{
          padding: '12px 16px',
          borderBottom: '1px solid var(--color-border-divider-default)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}>
          <Box variant="h3" fontSize="heading-s">
            {headerTitle || 'Chat'}
          </Box>
          {stepIndicator && (
            <Box color="text-body-secondary" fontSize="body-s">
              Step {stepIndicator.current} of {stepIndicator.total}
            </Box>
          )}
        </div>
      )}

      {/* Messages area */}
      <div style={{
        flex: 1,
        overflowY: 'auto',
        padding: '16px',
      }}>
        <SpaceBetween size="m">
          {state.messages.map(renderMessage)}

          {/* Support prompts - appear under last agent message */}
          {state.showPrompts && state.currentPrompts.length > 0 && !state.isAgentTyping && (
            <div style={{ marginLeft: '48px' }}>
              <SpaceBetween size="s">
                <SupportPromptGroup
                  ariaLabel="Suggested prompts"
                  alignment="horizontal"
                  onItemClick={({ detail }) => handlePromptClick(detail.id)}
                  items={state.currentPrompts.map((prompt) => ({
                    id: prompt.id,
                    text: prompt.text,
                  }))}
                />

                {/* Confirm button when prompts are multi-selected */}
                {hasSelectedPrompts && onPromptsConfirm && (
                  <Box textAlign="right">
                    <Button variant="primary" onClick={onPromptsConfirm}>
                      Confirm selection
                    </Button>
                  </Box>
                )}
              </SpaceBetween>
            </div>
          )}

          {/* Loading indicator */}
          {state.isAgentTyping && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <Avatar
                color="gen-ai"
                iconName="gen-ai"
                ariaLabel="AI Assistant"
              />
              <div style={{ flex: 1, maxWidth: '200px' }}>
                <LoadingBar variant="gen-ai" />
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </SpaceBetween>
      </div>

      {/* Input area */}
      <div style={{
        padding: '12px 16px',
        borderTop: '1px solid var(--color-border-divider-default)',
      }}>
        <PromptInput
          value={inputValue}
          onChange={({ detail }) => setInputValue(detail.value)}
          onAction={handleSubmit}
          placeholder="Describe what you need help with"
          actionButtonAriaLabel="Send message"
          actionButtonIconName="send"
          disabled={state.isAgentTyping}
        />
      </div>
    </div>
  );
}
