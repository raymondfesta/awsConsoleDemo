import Box from '@cloudscape-design/components/box';
import SpaceBetween from '@cloudscape-design/components/space-between';
import Button from '@cloudscape-design/components/button';
import Icon from '@cloudscape-design/components/icon';
import WorkflowStepper from './WorkflowStepper';
import ResourceCard, { MultiRegionCard } from './ResourceCard';
import ChatPanel from './ChatPanel';
import { useWorkflow } from './WorkflowContext';

interface SplitViewProps {
  onSendMessage: (message: string) => void;
  onActionClick: (actionId: string) => void;
  onPromptSelect: (promptId: string) => void;
  onPromptsConfirm: () => void;
  chatPanelOpen?: boolean;
  onToggleChatPanel?: () => void;
}

export default function SplitView({
  onSendMessage,
  onActionClick,
  onPromptSelect,
  onPromptsConfirm,
  chatPanelOpen = true,
  onToggleChatPanel,
}: SplitViewProps) {
  const { config, state } = useWorkflow();

  // Get the selected option title for the header
  const selectedOption = config.options.find((opt) => opt.id === state.selectedOption);

  // Calculate step indicator
  const currentStep = state.currentStepIndex + 1;
  const totalSteps = state.steps.length;

  // Check if we have multiple regions
  const isMultiRegion = state.resource && state.resource.details?.['Multi-Region'] === 'true';

  return (
    <div style={{
      display: 'flex',
      height: '100%',
      overflow: 'hidden',
    }}>
      {/* Wizard Panel (Left) */}
      <div style={{
        flex: chatPanelOpen ? '1 1 60%' : '1 1 100%',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        borderRight: chatPanelOpen ? '1px solid var(--color-border-divider-default)' : 'none',
        transition: 'flex 0.3s ease',
      }}>
        {/* Wizard Header */}
        <div style={{
          padding: '16px 24px',
          borderBottom: '1px solid var(--color-border-divider-default)',
          backgroundColor: 'var(--color-background-container-content)',
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <Icon name="settings" variant="success" />
              <Box variant="h2" fontSize="heading-m">
                {selectedOption?.title || config.title}
              </Box>
            </div>

            {/* Toggle chat panel button (when closed) */}
            {!chatPanelOpen && onToggleChatPanel && (
              <Button
                iconName="contact"
                variant="icon"
                onClick={onToggleChatPanel}
                ariaLabel="Open chat panel"
              />
            )}
          </div>
        </div>

        {/* Stepper */}
        <div style={{
          padding: '16px 24px',
          borderBottom: '1px solid var(--color-border-divider-default)',
        }}>
          <WorkflowStepper />
        </div>

        {/* Resource Display Area */}
        <div style={{
          flex: 1,
          overflow: 'auto',
          padding: '24px',
        }}>
          <SpaceBetween size="l">
            {state.resource && (
              <>
                {isMultiRegion ? (
                  // Multi-region display
                  <MultiRegionCard
                    title="Multi-Region cluster"
                    resources={[
                      state.resource,
                      // Create a secondary region resource for demo
                      {
                        ...state.resource,
                        id: `${state.resource.id}-west`,
                        name: state.resource.name.replace('east', 'west'),
                        region: state.resource.region.replace('east', 'west'),
                      },
                    ]}
                  />
                ) : (
                  // Single resource display
                  <ResourceCard resource={state.resource} />
                )}
              </>
            )}

            {!state.resource && (
              <Box textAlign="center" color="text-body-secondary" padding="xxl">
                <SpaceBetween size="s" alignItems="center">
                  <Icon name="status-pending" size="large" />
                  <Box>Waiting for configuration...</Box>
                </SpaceBetween>
              </Box>
            )}
          </SpaceBetween>
        </div>
      </div>

      {/* Chat Panel (Right) */}
      {chatPanelOpen && (
        <div style={{
          flex: '0 0 400px',
          minWidth: '350px',
          maxWidth: '500px',
          display: 'flex',
          flexDirection: 'column',
          backgroundColor: 'var(--color-background-layout-main)',
        }}>
          {/* Chat Panel Header */}
          <div style={{
            padding: '12px 16px',
            borderBottom: '1px solid var(--color-border-divider-default)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Button
                iconName="angle-left"
                variant="icon"
                onClick={onToggleChatPanel}
                ariaLabel="Close chat panel"
              />
              <Box variant="h3" fontSize="heading-s">ChatDBE</Box>
            </div>
            <Box color="text-body-secondary" fontSize="body-s">
              Step {currentStep} of {totalSteps}
            </Box>
          </div>

          {/* Chat Content */}
          <div style={{ flex: 1, overflow: 'hidden' }}>
            <ChatPanel
              onSendMessage={onSendMessage}
              onActionClick={onActionClick}
              onPromptSelect={onPromptSelect}
              onPromptsConfirm={onPromptsConfirm}
            />
          </div>
        </div>
      )}
    </div>
  );
}
