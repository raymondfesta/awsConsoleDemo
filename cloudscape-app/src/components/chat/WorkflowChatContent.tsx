import { useState, useRef, useEffect } from 'react';
import SpaceBetween from '@cloudscape-design/components/space-between';
import Box from '@cloudscape-design/components/box';
import PromptInput from '@cloudscape-design/components/prompt-input';
import { SupportPromptGroup, Avatar, LoadingBar } from '@cloudscape-design/chat-components';
import { useChatContext } from '../../context/ChatContext';
import MessageRenderer from './MessageRenderer';

export default function WorkflowChatContent() {
  const {
    workflow,
    messages,
    currentPrompts,
    showPrompts,
    isAgentTyping,
    sendMessage,
    selectPrompt,
    triggerAction,
  } = useChatContext();

  const [promptValue, setPromptValue] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isAgentTyping]);

  const config = workflow.config;

  const handleSubmit = () => {
    if (promptValue.trim() && !isAgentTyping) {
      sendMessage(promptValue.trim());
      setPromptValue('');
    }
  };

  const handlePromptClick = (promptId: string) => {
    selectPrompt(promptId);
  };

  const handleActionClick = (actionId: string) => {
    triggerAction(actionId);
  };

  // Get current step title for header
  const getCurrentStepTitle = () => {
    const currentStep = workflow.steps.find(s => s.status === 'in-progress');
    return currentStep?.title || config?.title || 'Chat';
  };

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      overflow: 'hidden',
    }}>
      {/* Step header */}
      <div style={{
        padding: '12px 16px',
        borderBottom: '1px solid var(--color-border-divider-default)',
      }}>
        <Box variant="h3" fontSize="heading-s">
          {getCurrentStepTitle()}
        </Box>
      </div>

      {/* Messages area */}
      <div style={{
        flex: 1,
        overflowY: 'auto',
        padding: '16px',
      }}>
        <SpaceBetween size="s">
          {messages.map((message) => (
            <MessageRenderer
              key={message.id}
              message={message}
              onActionClick={handleActionClick}
              onPromptClick={handlePromptClick}
            />
          ))}

          {showPrompts && currentPrompts.length > 0 && !isAgentTyping && (
            <div style={{ marginLeft: '48px' }}>
              <SupportPromptGroup
                ariaLabel="Suggested actions"
                alignment="horizontal"
                onItemClick={({ detail }) => handlePromptClick(detail.id)}
                items={currentPrompts.map((prompt) => ({
                  id: prompt.id,
                  text: prompt.text,
                }))}
              />
            </div>
          )}

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
      <div style={{ padding: '16px', borderTop: '1px solid var(--color-border-divider-default)' }}>
        <PromptInput
          value={promptValue}
          onChange={({ detail }) => setPromptValue(detail.value)}
          onAction={handleSubmit}
          placeholder="Chat"
          actionButtonAriaLabel="Send message"
          actionButtonIconName="send"
          disabled={isAgentTyping}
          minRows={2}
          maxRows={6}
        />
      </div>
    </div>
  );
}
