import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useChatContext, type WorkflowConfig, type Message } from '../context/ChatContext';
import DynamicRenderer from '../components/DynamicRenderer';
import Box from '@cloudscape-design/components/box';
import SpaceBetween from '@cloudscape-design/components/space-between';
import Tiles from '@cloudscape-design/components/tiles';
import PromptInput from '@cloudscape-design/components/prompt-input';
import Button from '@cloudscape-design/components/button';
import ButtonGroup from '@cloudscape-design/components/button-group';
import Alert from '@cloudscape-design/components/alert';
import Steps from '@cloudscape-design/components/steps';
import StatusIndicator from '@cloudscape-design/components/status-indicator';
import Header from '@cloudscape-design/components/header';
import ColumnLayout from '@cloudscape-design/components/column-layout';
import Container from '@cloudscape-design/components/container';
import { SupportPromptGroup, ChatBubble, Avatar, LoadingBar } from '@cloudscape-design/chat-components';
import ConfigurationDisplay from '../components/ConfigurationDisplay';

// Prompts for "Create new" option
const CREATE_NEW_PROMPTS = [
  { id: 'ecommerce-analytics', text: 'E-commerce analytics (orders, customers, inventory)' },
  { id: 'ecommerce-inventory', text: 'E-commerce Product Inventory' },
  { id: 'cms', text: 'Content Management System (CMS)' },
  { id: 'financial-logging', text: 'Financial Transaction Logging' },
];

// Prompts for "Create from existing" option
const CREATE_EXISTING_PROMPTS = [
  { id: 'clone-database', text: 'Clone an existing database' },
  { id: 'migrate-ec2', text: 'Migrate from EC2 to Aurora' },
];

// Map prompt IDs to demo paths
const PROMPT_TO_DEMO_PATH: Record<string, 'new' | 'clone' | 'migrate' | 'ecommerce'> = {
  'ecommerce-analytics': 'ecommerce',
  'ecommerce-inventory': 'new',
  'cms': 'new',
  'financial-logging': 'new',
  'clone-database': 'clone',
  'migrate-ec2': 'migrate',
};

// Workflow configuration with 3 steps
const CREATE_DATABASE_CONFIG: WorkflowConfig = {
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

export default function CreateDatabase() {
  const navigate = useNavigate();
  const {
    workflow,
    messages,
    currentPrompts,
    showPrompts,
    isAgentTyping,
    startWorkflow,
    selectWorkflowOption,
    sendMessage,
    selectPrompt,
    triggerAction,
    setDemoPath,
    setSplitPanelConfig,
  } = useChatContext();

  const [promptValue, setPromptValue] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Get the appropriate prompts based on selected option
  const getPromptsForOption = (optionId: string | null) => {
    if (optionId === 'create-existing') {
      return CREATE_EXISTING_PROMPTS;
    }
    return CREATE_NEW_PROMPTS;
  };

  // Current prompts to display based on selected option
  const displayPrompts = workflow.view === 'entry'
    ? getPromptsForOption(workflow.selectedOption)
    : currentPrompts;

  // Start the workflow when component mounts
  useEffect(() => {
    if (!workflow.isActive) {
      startWorkflow(CREATE_DATABASE_CONFIG);
    }
  }, [workflow.isActive, startWorkflow]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isAgentTyping]);

  const handleSubmit = () => {
    if (promptValue.trim() && !isAgentTyping) {
      // Set demo path based on selected option
      if (workflow.selectedOption === 'create-existing') {
        setDemoPath('clone');
      } else {
        setDemoPath('new');
      }
      sendMessage(promptValue.trim());
      setPromptValue('');
    }
  };

  // Get placeholder text based on selected option
  const getPlaceholder = () => {
    if (workflow.selectedOption === 'create-existing') {
      return 'Describe your existing database setup and what you want to do (clone, migrate, etc.)';
    }
    return CREATE_DATABASE_CONFIG.placeholder;
  };

  const handlePromptClick = (promptId: string) => {
    const allPrompts = [...CREATE_NEW_PROMPTS, ...CREATE_EXISTING_PROMPTS];
    const prompt = allPrompts.find(p => p.id === promptId);
    if (prompt) {
      const demoPath = PROMPT_TO_DEMO_PATH[promptId] || 'new';
      setDemoPath(demoPath);
      sendMessage(prompt.text);
    }
  };

  const handleChatPromptClick = (promptId: string) => {
    selectPrompt(promptId);
  };

  const handleActionClick = (actionId: string) => {
    triggerAction(actionId);
  };

  const handleCancel = () => {
    navigate(-1);
  };


  // Get the current step title for the configuration display
  const getDesignTitle = () => {
    if (workflow.view === 'review') {
      return 'Review and finish';
    }
    if (workflow.path === 'customize') {
      return 'DB Design - customize';
    }
    if (workflow.path === 'auto-setup') {
      return 'DB Design - Auto setup';
    }
    return 'DB Design';
  };

  // Render a single message
  const renderMessage = (message: Message) => {
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
              backgroundColor: '#e9ebed',
            }} />
            <StatusIndicator type="success">
              {message.stepCompleted}
            </StatusIndicator>
            <div style={{
              flex: 1,
              height: '1px',
              backgroundColor: '#e9ebed',
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
            message.feedbackEnabled && !message.recommendationMeta ? (
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
          ) : message.recommendationMeta ? (
            <div>Here is my recommended database configuration for your application. Review and confirm or let me know if you would like any changes.</div>
          ) : message.dynamicComponent ? (
            <SpaceBetween size="s">
              {message.content && (
                <div style={{ whiteSpace: 'pre-wrap' }}>{message.content}</div>
              )}
              <DynamicRenderer
                component={message.dynamicComponent}
                onAction={(actionId) => handleActionClick(actionId)}
              />
            </SpaceBetween>
          ) : (
            <div style={{ whiteSpace: 'pre-wrap' }}>{message.content}</div>
          )}
        </ChatBubble>

        {/* Render recommendation preview card outside the chat bubble */}
        {message.recommendationMeta && (
          <Box margin={{ top: 's', left: 'xxxl' }}>
            <div
              onClick={() => setSplitPanelConfig(message.recommendationMeta!)}
              style={{ cursor: 'pointer' }}
            >
              <Container
                header={
                  <Header
                    variant="h3"
                    actions={
                      <Button
                        variant="icon"
                        iconName="arrow-right"
                        ariaLabel="View details"
                        onClick={() => setSplitPanelConfig(message.recommendationMeta!)}
                      />
                    }
                  >
                    Database Configuration
                  </Header>
                }
              >
                <ColumnLayout columns={3} variant="text-grid">
                  <div>
                    <Box color="text-body-secondary" fontSize="body-s">Engine</Box>
                    <Box>{message.recommendationMeta.summary.engine}</Box>
                  </div>
                  <div>
                    <Box color="text-body-secondary" fontSize="body-s">Instance</Box>
                    <Box>{message.recommendationMeta.summary.instanceClass}</Box>
                  </div>
                  <div>
                    <Box color="text-body-secondary" fontSize="body-s">Region</Box>
                    <Box>{message.recommendationMeta.summary.region}</Box>
                  </div>
                </ColumnLayout>
              </Container>
            </div>
          </Box>
        )}

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

  // Render chat panel (reusable for split view)
  const renderChatPanel = (compact = false) => (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      width: compact ? '364px' : '100%',
      minWidth: compact ? '320px' : undefined,
    }}>
      <div style={{
        flex: 1,
        overflowY: 'auto',
        marginBottom: '16px',
      }}>
        <SpaceBetween size="s">
          {messages.map(renderMessage)}

          {showPrompts && currentPrompts.length > 0 && !isAgentTyping && (
            <div style={{ marginLeft: compact ? '0' : '48px' }}>
              <SupportPromptGroup
                ariaLabel="Suggested actions"
                alignment="horizontal"
                onItemClick={({ detail }) => handleChatPromptClick(detail.id)}
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

      <PromptInput
        value={promptValue}
        onChange={({ detail }) => setPromptValue(detail.value)}
        onAction={handleSubmit}
        placeholder="Chat"
        actionButtonAriaLabel="Send message"
        actionButtonIconName="send"
        disabled={isAgentTyping}
        minRows={3}
        maxRows={6}
      />
    </div>
  );

  // Entry View
  if (workflow.view === 'entry') {
    return (
      <div style={{ padding: '40px 20px' }}>
        <div style={{ marginBottom: '20px' }}>
          <Button
            variant="link"
            iconName="close"
            onClick={handleCancel}
          >
            Cancel
          </Button>
        </div>
        <div style={{
          maxWidth: '720px',
          margin: '0 auto',
        }}>
        <SpaceBetween size="l">
          {/* Illustration */}
          <Box textAlign="center">
            <svg width="280" height="160" viewBox="0 0 280 160" fill="none" xmlns="http://www.w3.org/2000/svg">
              {/* Cloud background */}
              <ellipse cx="140" cy="120" rx="100" ry="30" fill="#F0F4FF" />
              {/* Database stack */}
              <g transform="translate(90, 50)">
                <rect x="0" y="0" width="60" height="20" rx="4" fill="#006CE0" stroke="#0F141A" strokeWidth="1.5"/>
                <rect x="0" y="22" width="60" height="20" rx="4" fill="#006CE0" stroke="#0F141A" strokeWidth="1.5"/>
                <rect x="0" y="44" width="60" height="20" rx="4" fill="#006CE0" stroke="#0F141A" strokeWidth="1.5"/>
                {/* Database lines */}
                <line x1="8" y1="10" x2="40" y2="10" stroke="white" strokeWidth="2" strokeLinecap="round"/>
                <line x1="8" y1="32" x2="35" y2="32" stroke="white" strokeWidth="2" strokeLinecap="round"/>
                <line x1="8" y1="54" x2="30" y2="54" stroke="white" strokeWidth="2" strokeLinecap="round"/>
              </g>
              {/* Robot */}
              <g transform="translate(160, 40)">
                {/* Robot head */}
                <rect x="0" y="0" width="40" height="30" rx="8" fill="#F3F3F7" stroke="#0F141A" strokeWidth="1.5"/>
                {/* Robot eyes */}
                <circle cx="12" cy="14" r="4" fill="#006CE0" stroke="#0F141A" strokeWidth="1"/>
                <circle cx="28" cy="14" r="4" fill="#006CE0" stroke="#0F141A" strokeWidth="1"/>
                {/* Robot antenna */}
                <line x1="20" y1="0" x2="20" y2="-8" stroke="#0F141A" strokeWidth="1.5"/>
                <circle cx="20" cy="-10" r="3" fill="#10B981" stroke="#0F141A" strokeWidth="1"/>
                {/* Robot body */}
                <rect x="5" y="32" width="30" height="25" rx="4" fill="#F3F3F7" stroke="#0F141A" strokeWidth="1.5"/>
                {/* Robot arms */}
                <line x1="0" y1="40" x2="-10" y2="50" stroke="#0F141A" strokeWidth="1.5" strokeLinecap="round"/>
                <line x1="40" y1="40" x2="50" y2="35" stroke="#0F141A" strokeWidth="1.5" strokeLinecap="round"/>
                {/* Watering can */}
                <g transform="translate(45, 25)">
                  <ellipse cx="8" cy="12" rx="6" ry="8" fill="#DEDEE3" stroke="#0F141A" strokeWidth="1"/>
                  <line x1="8" y1="4" x2="8" y2="-2" stroke="#0F141A" strokeWidth="1"/>
                  <line x1="14" y1="8" x2="20" y2="4" stroke="#0F141A" strokeWidth="1"/>
                  {/* Water drops */}
                  <circle cx="22" cy="8" r="1.5" fill="#60A5FA"/>
                  <circle cx="24" cy="12" r="1.5" fill="#60A5FA"/>
                  <circle cx="23" cy="16" r="1.5" fill="#60A5FA"/>
                </g>
              </g>
              {/* Stars */}
              <g fill="#FFE8BD" stroke="#0F141A" strokeWidth="1">
                <path d="M70 30 L72 36 L78 36 L73 40 L75 46 L70 42 L65 46 L67 40 L62 36 L68 36 Z" transform="scale(0.6)"/>
                <path d="M220 20 L222 26 L228 26 L223 30 L225 36 L220 32 L215 36 L217 30 L212 26 L218 26 Z" transform="scale(0.5)"/>
              </g>
              {/* Shooting star */}
              <g transform="translate(220, 35)">
                <path d="M0 0 L-15 8" stroke="#FFE8BD" strokeWidth="2" strokeLinecap="round"/>
                <circle cx="0" cy="0" r="3" fill="#FFE8BD" stroke="#0F141A" strokeWidth="0.5"/>
              </g>
              {/* Ground line */}
              <line x1="80" y1="130" x2="200" y2="130" stroke="#0F141A" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </Box>

          {/* Title */}
          <Box textAlign="center">
            <Box
              variant="h1"
              fontSize="display-l"
              fontWeight="heavy"
            >
              {CREATE_DATABASE_CONFIG.title}
            </Box>
          </Box>

          {/* Tiles */}
          <Tiles
            onChange={({ detail }) => selectWorkflowOption(detail.value)}
            value={workflow.selectedOption}
            items={CREATE_DATABASE_CONFIG.options.map(opt => ({
              value: opt.id,
              label: opt.title,
              description: opt.description,
            }))}
            columns={2}
          />

          {/* Prompt Input */}
          <PromptInput
            value={promptValue}
            onChange={({ detail }) => setPromptValue(detail.value)}
            onAction={handleSubmit}
            placeholder={getPlaceholder()}
            actionButtonAriaLabel="Start conversation"
            actionButtonIconName="send"
            minRows={2}
            maxRows={6}
          />

          {/* Quick start use-cases */}
          <SpaceBetween size="s">
            <Box fontWeight="bold" fontSize="heading-s">
              Quick start use-cases
            </Box>
            <SupportPromptGroup
              ariaLabel="Quick start use-cases"
              alignment="horizontal"
              onItemClick={({ detail }) => handlePromptClick(detail.id)}
              items={displayPrompts.map(p => ({
                id: p.id,
                text: p.text,
              }))}
            />
          </SpaceBetween>
        </SpaceBetween>
        </div>
      </div>
    );
  }

  // Chat View (Step 1: Context and Requirements - centered conversation)
  if (workflow.view === 'chat') {
    // Map workflow steps to Steps component format
    const stepsItems = workflow.steps.map((step, index) => {
      let status: 'pending' | 'loading' | 'success' | 'error' = 'pending';

      if (step.status === 'success') {
        status = 'success';
      } else if (step.status === 'in-progress') {
        status = 'loading';
      } else if (step.status === 'error') {
        status = 'error';
      } else if (index === 0) {
        status = 'loading'; // First step is always in progress during chat
      }

      return {
        header: step.title,
        status,
        statusIconAriaLabel: status,
      };
    });

    return (
      <div style={{ padding: '40px 20px' }}>
        <div style={{ marginBottom: '20px' }}>
          <Button
            variant="link"
            iconName="close"
            onClick={handleCancel}
          >
            Cancel
          </Button>
        </div>
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto',
        }}>
          <div style={{
            display: 'flex',
            gap: '40px',
          }}>
            {/* Left: Steps indicator */}
            <div style={{ width: '200px', flexShrink: 0 }}>
              <Steps
                steps={stepsItems}
                ariaLabel="Database creation progress"
              />
            </div>

            {/* Right: Chat content */}
            <div style={{ flex: 1, maxWidth: '800px' }}>
              <Box variant="h1" fontSize="heading-l" fontWeight="bold" margin={{ bottom: 'm' }}>
                Context and requirements
              </Box>
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                height: 'calc(100vh - 240px)',
              }}>
                {renderChatPanel()}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Design View (Step 2) and Review View (Step 3) - Steps + Configuration
  if (workflow.view === 'design' || workflow.view === 'review') {
    // Map workflow steps to Steps component format
    const stepsItems = workflow.steps.map((step, index) => {
      const currentIndex = workflow.view === 'review' ? 2 : 1;
      let status: 'pending' | 'loading' | 'success' | 'error' = 'pending';

      if (step.status === 'success') {
        status = 'success';
      } else if (step.status === 'in-progress') {
        status = 'loading';
      } else if (step.status === 'error') {
        status = 'error';
      } else if (index < currentIndex) {
        status = 'success';
      }

      return {
        header: step.title,
        status,
        statusIconAriaLabel: status,
      };
    });

    return (
      <div style={{ padding: '40px 20px' }}>
        <div style={{ marginBottom: '20px' }}>
          <Button
            variant="link"
            iconName="close"
            onClick={handleCancel}
          >
            Cancel
          </Button>
        </div>
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto',
        }}>
          <div style={{
            display: 'flex',
            gap: '40px',
          }}>
            {/* Left: Steps indicator */}
            <div style={{ width: '200px', flexShrink: 0 }}>
              <Steps
                steps={stepsItems}
                ariaLabel="Database creation progress"
              />
            </div>

            {/* Right: Configuration Display */}
            <div style={{ flex: 1, maxWidth: '800px' }}>
              <ConfigurationDisplay
                title={getDesignTitle()}
                configSections={workflow.configSections}
              />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Fallback
  return null;
}
