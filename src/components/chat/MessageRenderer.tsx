import Box from '@cloudscape-design/components/box';
import SpaceBetween from '@cloudscape-design/components/space-between';
import Button from '@cloudscape-design/components/button';
import ButtonGroup from '@cloudscape-design/components/button-group';
import Alert from '@cloudscape-design/components/alert';
import StatusIndicator from '@cloudscape-design/components/status-indicator';
import ExpandableSection from '@cloudscape-design/components/expandable-section';
import ColumnLayout from '@cloudscape-design/components/column-layout';
import { ChatBubble, Avatar } from '@cloudscape-design/chat-components';
import DynamicRenderer from '../DynamicRenderer';
import MarkdownText from '../MarkdownText';
import type { Message, MessageRendererProps } from './types';

// Render step completed indicator
function StepCompletedIndicator({ stepTitle }: { stepTitle: string }) {
  return (
    <Box
      padding={{ vertical: 's' }}
      textAlign="center"
      color="text-status-success"
    >
      <SpaceBetween direction="horizontal" size="xs" alignItems="center">
        <div style={{ flex: 1, height: '1px', backgroundColor: 'var(--color-border-divider-default)' }} />
        <StatusIndicator type="success">{stepTitle}</StatusIndicator>
        <div style={{ flex: 1, height: '1px', backgroundColor: 'var(--color-border-divider-default)' }} />
      </SpaceBetween>
    </Box>
  );
}

// Render build progress items
function BuildProgressIndicator({ items }: { items: { label: string; status: 'pending' | 'success' | 'error' }[] }) {
  return (
    <Box padding={{ vertical: 'xs' }}>
      <SpaceBetween size="xs">
        {items.map((item, index) => (
          <StatusIndicator
            key={index}
            type={item.status === 'success' ? 'success' : item.status === 'error' ? 'error' : 'pending'}
          >
            {item.label}
          </StatusIndicator>
        ))}
      </SpaceBetween>
    </Box>
  );
}

// Render recommendation metadata in collapsible sections
function RecommendationCard({ meta }: { meta: Message['recommendationMeta'] }) {
  if (!meta) return null;

  return (
    <Box margin={{ top: 's' }}>
      <SpaceBetween size="s">
        {/* Summary badges */}
        <SpaceBetween direction="horizontal" size="xs">
          <Box variant="span" fontWeight="bold">{meta.summary.engine}</Box>
          <Box variant="span" color="text-body-secondary">|</Box>
          <Box variant="span">{meta.summary.instanceClass}</Box>
          <Box variant="span" color="text-body-secondary">|</Box>
          <Box variant="span">{meta.summary.region}</Box>
        </SpaceBetween>

        {/* Expandable sections */}
        {meta.sections.map((section, index) => (
          <ExpandableSection key={index} headerText={section.title} variant="footer">
            <ColumnLayout columns={2} variant="text-grid">
              {Object.entries(section.items).map(([label, value]) => (
                <div key={label}>
                  <Box variant="awsui-key-label">{label}</Box>
                  <div>{value}</div>
                </div>
              ))}
            </ColumnLayout>
          </ExpandableSection>
        ))}
      </SpaceBetween>
    </Box>
  );
}

export default function MessageRenderer({
  message,
  onActionClick,
  onPromptClick: _onPromptClick,
  onFormChange,
}: MessageRendererProps) {
  // Status or Error messages use Alert component
  if (message.type === 'status' || message.type === 'error') {
    return (
      <Alert
        type={message.type === 'error' ? 'error' : 'success'}
        header={message.type === 'error' ? 'Error' : undefined}
        action={
          message.actions && message.actions.length > 0 ? (
            <SpaceBetween direction="horizontal" size="xs">
              {message.actions.map((action) => (
                <Button
                  key={action.id}
                  variant={action.variant === 'primary' ? 'primary' : 'normal'}
                  onClick={() => onActionClick(action.id)}
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
        type="outgoing"
        ariaLabel="You said"
        avatar={<Avatar color="default" ariaLabel="User" tooltipText="You" />}
      >
        {message.content}
      </ChatBubble>
    );
  }

  // Step completed indicator (renders before the message)
  const stepIndicator = message.stepCompleted ? (
    <StepCompletedIndicator stepTitle={message.stepCompleted} />
  ) : null;

  // Agent messages with all features
  return (
    <div>
      {stepIndicator}

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
        {/* Build progress items */}
        {message.buildProgress && message.buildProgress.length > 0 && (
          <BuildProgressIndicator items={message.buildProgress} />
        )}

        {/* Text content with Markdown rendering */}
        {message.content && !message.buildProgress && (
          <MarkdownText content={message.content} />
        )}

        {/* Recommendation metadata card */}
        {message.recommendationMeta && (
          <RecommendationCard meta={message.recommendationMeta} />
        )}

        {/* Dynamic component from AI response */}
        {message.dynamicComponent && (
          <Box margin={{ top: message.content ? 'm' : 'n' }}>
            <DynamicRenderer
              component={message.dynamicComponent}
              onAction={(actionId) => onActionClick(actionId)}
              onFormChange={onFormChange}
            />
          </Box>
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
                onClick={() => onActionClick(action.id)}
              >
                {action.label}
              </Button>
            ))}
          </SpaceBetween>
        </Box>
      )}
    </div>
  );
}
