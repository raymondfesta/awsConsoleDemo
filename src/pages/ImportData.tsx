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

// Workflow configuration for Import Data
export const IMPORT_DATA_CONFIG: WorkflowConfig = {
  id: 'import-data',
  title: 'Import data',
  subtitle: 'Import data into your database from various sources',
  options: [
    {
      id: 'sample-data',
      title: 'Sample data',
      description: 'Import pre-built sample datasets to explore your database capabilities.',
    },
    {
      id: 'existing-data',
      title: 'From existing source',
      description: 'Import data from S3, local files, or another database.',
    },
  ],
  initialPrompts: [
    { id: 'food-orders', text: 'Food delivery orders dataset' },
    { id: 'restaurants', text: 'Restaurant catalog' },
    { id: 'customers', text: 'Customer profiles' },
    { id: 'custom', text: 'Custom CSV upload' },
  ],
  steps: [
    { id: 'configure', title: 'Configure' },
    { id: 'import', title: 'Import' },
  ],
  placeholder: 'Describe the data you want to import. Include the source, format, and any transformation requirements.',
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

export default function ImportData() {
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
  } = useChatContext();

  const [promptValue, setPromptValue] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Start fresh workflow when navigating directly to this page
  // This ensures entry view is always shown when accessing /import-data directly
  // (The in-context flow from database details stays on database-details page)
  useEffect(() => {
    startWorkflow(IMPORT_DATA_CONFIG);
  }, [startWorkflow]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isAgentTyping]);

  const handleSubmit = () => {
    if (promptValue.trim() && !isAgentTyping) {
      sendMessage(promptValue.trim());
      setPromptValue('');
    }
  };

  const handlePromptClick = (promptId: string) => {
    const prompt = IMPORT_DATA_CONFIG.initialPrompts.find(p => p.id === promptId);
    if (prompt) {
      setPromptValue(prompt.text);
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
              {IMPORT_DATA_CONFIG.title}
            </Box>
            <Box variant="p" color="text-body-secondary" margin={{ top: 'xs' }}>
              {IMPORT_DATA_CONFIG.subtitle}
            </Box>
          </Box>

          {/* Option Tiles */}
          <Tiles
            onChange={({ detail }) => selectWorkflowOption(detail.value)}
            value={workflow.selectedOption}
            items={IMPORT_DATA_CONFIG.options.map(opt => ({
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
            placeholder={IMPORT_DATA_CONFIG.placeholder}
            actionButtonAriaLabel="Start conversation"
            actionButtonIconName="angle-right-double"
          />

          {/* Support Prompts */}
          <SupportPromptGroup
            ariaLabel="Quick start suggestions"
            alignment="horizontal"
            onItemClick={({ detail }) => handlePromptClick(detail.id)}
            items={IMPORT_DATA_CONFIG.initialPrompts.map(p => ({
              id: p.id,
              text: p.text,
            }))}
          />
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
          placeholder="Describe what you need help with..."
          actionButtonAriaLabel="Send message"
          actionButtonIconName="send"
          disabled={isAgentTyping}
        />
      </div>
    );
  }

  // Wizard View (when Import phase starts)
  const resourceStatusType = workflow.resource?.status === 'active'
    ? 'success'
    : workflow.resource?.status === 'creating'
      ? 'loading'
      : 'error';

  const resourceStatusLabel = workflow.resource?.status === 'active'
    ? 'Complete'
    : workflow.resource?.status === 'creating'
      ? 'Importing...'
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
          <Icon name="upload" variant="link" />
          <Box variant="h2" fontSize="heading-m">
            {workflow.selectedOption === 'existing-data' ? 'Import from source' : 'Import sample data'}
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
                  backgroundColor: 'var(--color-background-status-info)',
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                  <Icon name="upload" size="medium" variant="link" />
                </div>

                <div style={{ flex: 1 }}>
                  <SpaceBetween size="xxs">
                    <Box variant="h3">{workflow.resource.name}</Box>
                    <Box color="text-body-secondary">{workflow.resource.type}</Box>
                    <Link href="#" fontSize="body-s">
                      <Icon name="external" size="small" /> View import details
                    </Link>
                  </SpaceBetween>
                </div>
              </div>

              <ColumnLayout columns={workflow.resource.details ? 3 : 2} variant="text-grid">
                <div>
                  <Box color="text-body-secondary" fontSize="body-s">Target Database</Box>
                  <Box>{workflow.resource.region}</Box>
                </div>
                <div>
                  <Box color="text-body-secondary" fontSize="body-s">Status</Box>
                  <StatusIndicator type={resourceStatusType}>{resourceStatusLabel}</StatusIndicator>
                </div>
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
                <Box>Waiting for import configuration...</Box>
                <Box fontSize="body-s">Use the chat panel to describe your data source</Box>
              </SpaceBetween>
            </Box>
          </Container>
        )}
      </SpaceBetween>
    </div>
  );
}
