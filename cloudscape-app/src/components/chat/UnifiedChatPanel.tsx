import { useState, useRef, useEffect } from 'react';
import Box from '@cloudscape-design/components/box';
import SpaceBetween from '@cloudscape-design/components/space-between';
import Button from '@cloudscape-design/components/button';
import PromptInput from '@cloudscape-design/components/prompt-input';
import { Avatar, LoadingBar } from '@cloudscape-design/chat-components';
import { SupportPromptGroup } from '@cloudscape-design/chat-components';
import MessageRenderer from './MessageRenderer';
import type { UnifiedChatPanelProps } from './types';

export default function UnifiedChatPanel({
  // State
  messages,
  currentPrompts,
  showPrompts,
  isAgentTyping,
  selectedPrompts = [],

  // Actions
  onSendMessage,
  onSelectPrompt,
  onActionClick,
  onConfirmPrompts,

  // Display configuration
  variant = 'panel',
  showWelcome = false,
  welcomeMessage,
  placeholder = 'Describe what you need help with',
  showHeader = false,
  headerTitle,
  stepIndicator,
}: UnifiedChatPanelProps) {
  const [inputValue, setInputValue] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isAgentTyping]);

  const handleSubmit = () => {
    if (inputValue.trim() && !isAgentTyping) {
      onSendMessage(inputValue.trim());
      setInputValue('');
    }
  };

  const handlePromptClick = (promptId: string) => {
    onSelectPrompt(promptId);
  };

  // Check if we have selected prompts that need confirmation
  const hasSelectedPrompts = selectedPrompts.length > 0;

  // Variant-specific styles
  const containerStyle = {
    display: 'flex',
    flexDirection: 'column' as const,
    height: '100%',
    backgroundColor: variant === 'drawer'
      ? 'var(--color-background-container-content)'
      : 'var(--color-background-layout-main)',
  };

  const messagesAreaStyle = {
    flex: 1,
    overflowY: 'auto' as const,
    padding: variant === 'drawer' ? '12px' : '16px',
  };

  const inputAreaStyle = {
    padding: variant === 'drawer' ? '12px' : '12px 16px',
    borderTop: '1px solid var(--color-border-divider-default)',
  };

  return (
    <div style={containerStyle}>
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
      <div style={messagesAreaStyle}>
        <SpaceBetween size="m">
          {/* Welcome message when no messages */}
          {showWelcome && messages.length === 0 && welcomeMessage && (
            <div style={{ marginBottom: '16px' }}>
              {welcomeMessage}
            </div>
          )}

          {/* Render all messages */}
          {messages.map((message) => (
            <MessageRenderer
              key={message.id}
              message={message}
              onActionClick={onActionClick}
              onPromptClick={handlePromptClick}
            />
          ))}

          {/* Support prompts - appear under last agent message */}
          {showPrompts && currentPrompts.length > 0 && !isAgentTyping && (
            <div style={{ marginLeft: variant === 'drawer' ? '40px' : '48px' }}>
              <SpaceBetween size="s">
                <SupportPromptGroup
                  ariaLabel="Suggested prompts"
                  alignment="horizontal"
                  onItemClick={({ detail }) => handlePromptClick(detail.id)}
                  items={currentPrompts.map((prompt) => ({
                    id: prompt.id,
                    text: prompt.text,
                  }))}
                />

                {/* Confirm button when prompts are multi-selected */}
                {hasSelectedPrompts && onConfirmPrompts && (
                  <Box textAlign="right">
                    <Button variant="primary" onClick={onConfirmPrompts}>
                      Confirm selection
                    </Button>
                  </Box>
                )}
              </SpaceBetween>
            </div>
          )}

          {/* Loading indicator */}
          {isAgentTyping && (
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
      <div style={inputAreaStyle}>
        <PromptInput
          value={inputValue}
          onChange={({ detail }) => setInputValue(detail.value)}
          onAction={handleSubmit}
          placeholder={placeholder}
          actionButtonAriaLabel="Send message"
          actionButtonIconName="send"
          disabled={isAgentTyping}
        />
      </div>
    </div>
  );
}
