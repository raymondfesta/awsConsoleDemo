import { useEffect, useState, useRef } from 'react';
import { useChatContext, type WorkflowConfig, type Message } from '../context/ChatContext';
import Box from '@cloudscape-design/components/box';
import SpaceBetween from '@cloudscape-design/components/space-between';
import Tiles from '@cloudscape-design/components/tiles';
import PromptInput from '@cloudscape-design/components/prompt-input';
import Container from '@cloudscape-design/components/container';
import Icon from '@cloudscape-design/components/icon';
import Link from '@cloudscape-design/components/link';
import StatusIndicator from '@cloudscape-design/components/status-indicator';
import ColumnLayout from '@cloudscape-design/components/column-layout';
import Steps from '@cloudscape-design/components/steps';
import Button from '@cloudscape-design/components/button';
import ButtonGroup from '@cloudscape-design/components/button-group';
import Alert from '@cloudscape-design/components/alert';
import { SupportPromptGroup, ChatBubble, Avatar, LoadingBar } from '@cloudscape-design/chat-components';

// Prompts for "Create new" option
const CREATE_NEW_PROMPTS = [
  { id: 'food-delivery', text: 'Food delivery application' },
  { id: 'ecommerce', text: 'E-commerce platform' },
  { id: 'iot', text: 'IoT sensor data' },
  { id: 'saas', text: 'SaaS analytics' },
];

// Prompts for "Create from existing" option
const CREATE_EXISTING_PROMPTS = [
  { id: 'clone-database', text: 'Clone an existing database' },
  { id: 'migrate-ec2', text: 'Migrate from EC2 to Aurora' },
];

// Map prompt IDs to demo paths
const PROMPT_TO_DEMO_PATH: Record<string, 'new' | 'clone' | 'migrate'> = {
  'food-delivery': 'new',
  'ecommerce': 'new',
  'iot': 'new',
  'saas': 'new',
  'clone-database': 'clone',
  'migrate-ec2': 'migrate',
};

// Workflow configuration
const CREATE_DATABASE_CONFIG: WorkflowConfig = {
  id: 'create-database',
  title: 'Create database',
  subtitle: 'Describe what you\'re building and we\'ll help you set up the optimal solution',
  options: [
    {
      id: 'create-new',
      title: 'Create new',
      description: 'Create a brand new database. Describe your use case and we\'ll help you set up the optimal solution.',
    },
    {
      id: 'create-existing',
      title: 'Create from existing',
      description: 'Tell us about your existing workload and we will build the right solution. We can duplicate existing resources, migrate from on prem, etc...',
    },
  ],
  initialPrompts: CREATE_NEW_PROMPTS,
  steps: [
    { id: 'configure', title: 'Configure' },
    { id: 'build', title: 'Build' },
  ],
  placeholder: 'Describe what you are trying to build. A good description should include an application overview, data requirements, and key use cases.',
};

// Map status to Steps component status
function mapStepStatus(status: string): 'pending' | 'loading' | 'success' | 'error' {
  switch (status) {
    case 'in-progress': return 'loading';
    case 'success': return 'success';
    case 'error': return 'error';
    default: return 'pending';
  }
}

export default function CreateDatabase() {
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
      // If "create-existing" is selected, default to 'clone' for custom messages
      if (workflow.selectedOption === 'create-existing') {
        setDemoPath('clone');
      } else {
        setDemoPath('new');
      }
      // Send the message (this will trigger the demo flow and transition to chat view)
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

  // Get subtitle text based on selected option
  const getSubtitle = () => {
    if (workflow.selectedOption === 'create-existing') {
      return 'Clone an existing database or migrate from another source';
    }
    return CREATE_DATABASE_CONFIG.subtitle;
  };

  const handlePromptClick = (promptId: string) => {
    // Find prompt in either list
    const allPrompts = [...CREATE_NEW_PROMPTS, ...CREATE_EXISTING_PROMPTS];
    const prompt = allPrompts.find(p => p.id === promptId);
    if (prompt) {
      // Set the demo path based on the prompt
      const demoPath = PROMPT_TO_DEMO_PATH[promptId] || 'new';
      setDemoPath(demoPath);
      // Send the message directly to start the conversation
      sendMessage(prompt.text);
    }
  };

  const handleChatPromptClick = (promptId: string) => {
    selectPrompt(promptId);
  };

  const handleActionClick = (actionId: string) => {
    triggerAction(actionId);
  };

  // Render a single message
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
          <div style={{ whiteSpace: 'pre-wrap' }}>{message.content}</div>
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

  // Entry View
  if (workflow.view === 'entry') {
    return (
      <div style={{
        maxWidth: '900px',
        margin: '0 auto',
        padding: '40px 20px',
      }}>
        <SpaceBetween size="l">
          {/* Title */}
          <Box textAlign="center">
            <Box variant="h1" fontSize="display-l" fontWeight="light">
              {CREATE_DATABASE_CONFIG.title}
            </Box>
            <Box variant="p" color="text-body-secondary" margin={{ top: 'xs' }}>
              {getSubtitle()}
            </Box>
          </Box>

          {/* Option Tiles */}
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

          {/* Prompt Input with larger rows for entry */}
          <PromptInput
            value={promptValue}
            onChange={({ detail }) => setPromptValue(detail.value)}
            onAction={handleSubmit}
            placeholder={getPlaceholder()}
            actionButtonAriaLabel="Start conversation"
            actionButtonIconName="send"
            minRows={3}
            maxRows={8}
          />

          {/* Support Prompts - only show when a tile is selected */}
          {workflow.selectedOption && (
            <SupportPromptGroup
              ariaLabel="Quick start suggestions"
              alignment="horizontal"
              onItemClick={({ detail }) => handlePromptClick(detail.id)}
              items={displayPrompts.map(p => ({
                id: p.id,
                text: p.text,
              }))}
            />
          )}
        </SpaceBetween>
      </div>
    );
  }

  // Chat View (centered conversation during Configure phase)
  if (workflow.view === 'chat') {
    return (
      <div style={{
        maxWidth: '800px',
        margin: '0 auto',
        padding: '40px 20px',
        display: 'flex',
        flexDirection: 'column',
        height: 'calc(100vh - 160px)',
      }}>
        {/* Messages area */}
        <div style={{
          flex: 1,
          overflowY: 'auto',
          marginBottom: '16px',
        }}>
          <SpaceBetween size="m">
            {messages.map(renderMessage)}

            {/* Support prompts - appear under last agent message */}
            {showPrompts && currentPrompts.length > 0 && !isAgentTyping && (
              <div style={{ marginLeft: '48px' }}>
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
        <PromptInput
          value={promptValue}
          onChange={({ detail }) => setPromptValue(detail.value)}
          onAction={handleSubmit}
          placeholder="Describe what you need help with..."
          actionButtonAriaLabel="Send message"
          actionButtonIconName="send"
          disabled={isAgentTyping}
          minRows={3}
          maxRows={8}
        />
      </div>
    );
  }

  // Wizard View (when Build phase starts)
  const resourceStatusType = workflow.resource?.status === 'active'
    ? 'success'
    : workflow.resource?.status === 'creating'
      ? 'loading'
      : 'error';

  const resourceStatusLabel = workflow.resource?.status === 'active'
    ? 'Active'
    : workflow.resource?.status === 'creating'
      ? 'Creating...'
      : 'Error';

  return (
    <div style={{ padding: '20px' }}>
      <SpaceBetween size="l">
        {/* Header */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          padding: '16px',
          backgroundColor: 'var(--color-background-container-content)',
          borderRadius: '8px',
          border: '1px solid var(--color-border-divider-default)',
        }}>
          <Icon name="settings" variant="success" />
          <Box variant="h2" fontSize="heading-m">
            {workflow.selectedOption === 'create-existing' ? 'Create from existing' : 'Create new'}
          </Box>
        </div>

        {/* Stepper */}
        <Steps
          steps={workflow.steps.map(step => ({
            header: step.title,
            status: mapStepStatus(step.status),
            statusIconAriaLabel: `${step.title} ${step.status}`,
          }))}
        />

        {/* Resource Card */}
        {workflow.resource ? (
          <Container>
            <SpaceBetween size="m">
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
                <div style={{
                  width: '48px',
                  height: '48px',
                  backgroundColor: 'var(--color-background-status-success)',
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                  <Icon name="settings" size="medium" variant="success" />
                </div>

                <div style={{ flex: 1 }}>
                  <SpaceBetween size="xxs">
                    <Box variant="h3">{workflow.resource.name}</Box>
                    <Box color="text-body-secondary">{workflow.resource.type}</Box>
                    <Link href="#" fontSize="body-s">
                      <Icon name="external" size="small" /> Learn more
                    </Link>
                  </SpaceBetween>
                </div>
              </div>

              <ColumnLayout columns={workflow.resource.details ? 3 : 2} variant="text-grid">
                <div>
                  <Box color="text-body-secondary" fontSize="body-s">Region</Box>
                  <Box>{workflow.resource.region}</Box>
                </div>
                <div>
                  <Box color="text-body-secondary" fontSize="body-s">Status</Box>
                  <StatusIndicator type={resourceStatusType}>{resourceStatusLabel}</StatusIndicator>
                </div>
                {workflow.resource.endpoint && (
                  <div>
                    <Box color="text-body-secondary" fontSize="body-s">Endpoint</Box>
                    <code style={{ fontSize: '12px' }}>{workflow.resource.endpoint}</code>
                  </div>
                )}
                {workflow.resource.details && Object.entries(workflow.resource.details).map(([key, value]) => (
                  <div key={key}>
                    <Box color="text-body-secondary" fontSize="body-s">{key}</Box>
                    <Box>{value}</Box>
                  </div>
                ))}
              </ColumnLayout>
            </SpaceBetween>
          </Container>
        ) : (
          <Container>
            <Box textAlign="center" color="text-body-secondary" padding="l">
              <SpaceBetween size="s" alignItems="center">
                <Icon name="status-pending" size="large" />
                <Box>Waiting for configuration...</Box>
                <Box fontSize="body-s">Use the chat panel to describe your requirements</Box>
              </SpaceBetween>
            </Box>
          </Container>
        )}
      </SpaceBetween>
    </div>
  );
}
