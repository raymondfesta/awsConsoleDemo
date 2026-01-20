import { useState, useRef, useEffect } from 'react';
import SpaceBetween from '@cloudscape-design/components/space-between';
import Box from '@cloudscape-design/components/box';
import Button from '@cloudscape-design/components/button';
import ButtonGroup from '@cloudscape-design/components/button-group';
import PromptInput from '@cloudscape-design/components/prompt-input';
import Alert from '@cloudscape-design/components/alert';
import StatusIndicator from '@cloudscape-design/components/status-indicator';
import { ChatBubble, Avatar, LoadingBar } from '@cloudscape-design/chat-components';
import { SupportPromptGroup } from '@cloudscape-design/chat-components';
import { useChatContext, type Message } from '../context/ChatContext';

// Welcome message for general chat (non-workflow)
const WELCOME_MESSAGE = (
  <>
    <strong>Welcome! I'm your AI Assistant.</strong>
    <br /><br />
    I'm here to help you navigate and work more efficiently throughout this application. Whether you're exploring features, need guidance, or want to accomplish something specific, I'm ready to assist.
    <br /><br />
    <strong>How I can help:</strong>
    <ul style={{ margin: '8px 0', paddingLeft: '20px' }}>
      <li>Answer questions about features and functionality</li>
      <li>Guide you through workflows step-by-step</li>
      <li>Provide contextual suggestions based on what you're doing</li>
      <li>Help you find what you're looking for quickly</li>
      <li>Explain concepts and options when you need clarity</li>
    </ul>
    <strong>Just ask me anything!</strong> I'll provide relevant help based on where you are and what you're working on.
    <br /><br />
    <strong>Tip:</strong> I'm always watching your context, so my suggestions will adapt as you move through different parts of the application.
  </>
);

export default function ChatInterface() {
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

  const [inputValue, setInputValue] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isAgentTyping]);

  const handleSubmit = () => {
    if (inputValue.trim() && !isAgentTyping) {
      sendMessage(inputValue.trim());
      setInputValue('');
    }
  };

  const handlePromptClick = (promptId: string) => {
    selectPrompt(promptId);
  };

  const handleActionClick = (actionId: string) => {
    triggerAction(actionId);
  };

  const renderMessage = (message: Message) => {
    // Status or Error messages use Alert component
    if (message.type === 'status' || message.type === 'error') {
      return (
        <Alert
          key={message.id}
          type={message.type === 'error' ? 'error' : 'success'}
          action={
            message.actions && message.actions.length > 0 ? (
              <SpaceBetween direction="horizontal" size="xs">
                {message.actions.map((action) => (
                  <Button
                    key={action.id}
                    variant={action.variant === 'primary' ? 'primary' : 'normal'}
                    onClick={() => handleActionClick(action.id)}
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
        {/* Show step completed divider with status indicator */}
        {message.stepCompleted && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            margin: '20px 0',
          }}>
            <div style={{
              flex: 1,
              height: '1px',
              backgroundColor: 'var(--color-border-divider-default)',
            }} />
            <StatusIndicator type="success">
              {message.stepCompleted}
            </StatusIndicator>
            <div style={{
              flex: 1,
              height: '1px',
              backgroundColor: 'var(--color-border-divider-default)',
            }} />
          </div>
        )}

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
          {/* Render build progress items with status indicators */}
          {message.buildProgress ? (
            <SpaceBetween size="xs">
              {message.buildProgress.map((item, index) => (
                <StatusIndicator
                  key={index}
                  type={item.status === 'success' ? 'success' : item.status === 'error' ? 'error' : 'in-progress'}
                >
                  {item.label}
                </StatusIndicator>
              ))}
            </SpaceBetween>
          ) : (
            <div style={{ whiteSpace: 'pre-wrap' }}>{message.content}</div>
          )}
        </ChatBubble>

        {/* Inline action buttons for agent messages */}
        {message.actions && message.actions.length > 0 && (
          <Box margin={{ top: 's', left: 'xxxl' }}>
            <SpaceBetween direction="horizontal" size="xs">
              {message.actions.map((action) => (
                <Button
                  key={action.id}
                  variant={action.variant === 'primary' ? 'primary' : 'normal'}
                  onClick={() => handleActionClick(action.id)}
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

  // Determine if we should show the welcome message
  const showWelcome = !workflow.isActive && messages.length === 0;

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      minHeight: 0,
      overflow: 'hidden',
    }}>
      {/* Messages area - scrollable */}
      <div style={{
        flex: 1,
        overflowY: 'auto',
        padding: '16px',
        minHeight: 0,
      }}>
        <SpaceBetween size="m">
          {/* Welcome message for non-workflow */}
          {showWelcome && (
            <ChatBubble
              type="incoming"
              ariaLabel="Welcome message"
              avatar={
                <Avatar
                  color="gen-ai"
                  iconName="gen-ai"
                  ariaLabel="AI Assistant"
                  tooltipText="Database Agent"
                />
              }
            >
              {WELCOME_MESSAGE}
            </ChatBubble>
          )}

          {/* Render all messages */}
          {messages.map(renderMessage)}

          {/* Support prompts - appear under last agent message */}
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

      {/* Input area - fixed at bottom */}
      <div style={{
        flexShrink: 0,
        padding: '12px 16px',
        borderTop: '1px solid var(--color-border-divider-default)',
      }}>
        <PromptInput
          value={inputValue}
          onChange={({ detail }) => setInputValue(detail.value)}
          onAction={handleSubmit}
          placeholder={workflow.isActive ? "Describe what you need help with" : "Ask a question..."}
          actionButtonAriaLabel="Send message"
          actionButtonIconName="send"
          disabled={isAgentTyping}
        />
      </div>
    </div>
  );
}
