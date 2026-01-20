import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useChatContext, type WorkflowConfig, type Message } from '../context/ChatContext';
import Box from '@cloudscape-design/components/box';
import SpaceBetween from '@cloudscape-design/components/space-between';
import Tiles from '@cloudscape-design/components/tiles';
import PromptInput from '@cloudscape-design/components/prompt-input';
import Button from '@cloudscape-design/components/button';
import ButtonGroup from '@cloudscape-design/components/button-group';
import Alert from '@cloudscape-design/components/alert';
import Steps from '@cloudscape-design/components/steps';
import StatusIndicator from '@cloudscape-design/components/status-indicator';
import { SupportPromptGroup, ChatBubble, Avatar, LoadingBar } from '@cloudscape-design/chat-components';
import ConfigurationDisplay from '../components/ConfigurationDisplay';

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

// Workflow configuration with 3 steps
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
    { id: 'context-requirements', title: 'Context and requirements' },
    { id: 'db-design', title: 'DB Design' },
    { id: 'review-finish', title: 'Review and finish' },
  ],
  placeholder: 'Describe what you are trying to build. A good description should include an application overview, data requirements, and key use cases.',
};

export default function CreateDatabase() {
  useNavigate(); // Keep for potential future navigation
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

  // Get subtitle text based on selected option
  const getSubtitle = () => {
    if (workflow.selectedOption === 'create-existing') {
      return 'Clone an existing database or migrate from another source';
    }
    return CREATE_DATABASE_CONFIG.subtitle;
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
        minRows={1}
        maxRows={4}
      />
    </div>
  );

  // Entry View
  if (workflow.view === 'entry') {
    return (
      <div style={{
        maxWidth: '900px',
        margin: '0 auto',
        padding: '40px 20px',
      }}>
        <SpaceBetween size="l">
          <Box textAlign="center">
            <Box variant="h1" fontSize="display-l" fontWeight="light">
              {CREATE_DATABASE_CONFIG.title}
            </Box>
            <Box variant="p" color="text-body-secondary" margin={{ top: 'xs' }}>
              {getSubtitle()}
            </Box>
          </Box>

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
      <div style={{
        display: 'flex',
        gap: '40px',
        padding: '40px 20px',
        maxWidth: '1200px',
        margin: '0 auto',
      }}>
        {/* Left: Steps indicator */}
        <div style={{ width: '200px', flexShrink: 0 }}>
          <Steps
            steps={stepsItems}
            ariaLabel="Database creation progress"
          />
        </div>

        {/* Right: Main content */}
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
      <div style={{
        display: 'flex',
        gap: '40px',
        padding: '40px 20px',
        maxWidth: '1200px',
        margin: '0 auto',
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
    );
  }

  // Fallback
  return null;
}
