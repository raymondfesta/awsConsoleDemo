import { useState, useCallback, useRef } from 'react';
import { WorkflowProvider, useWorkflowScript } from './WorkflowContext';
import EntryView from './EntryView';
import SplitView from './SplitView';
import ChatPanel from './ChatPanel';
import Box from '@cloudscape-design/components/box';
import Container from '@cloudscape-design/components/container';
import Header from '@cloudscape-design/components/header';
import type { WorkflowConfig, ResourceInfo, Message } from './types';

interface WorkflowChatProps {
  config: WorkflowConfig;
  resourceContext?: ResourceInfo | null;
  onWorkflowComplete?: (resource: ResourceInfo) => void;
  onNavigateToResource?: (resource: ResourceInfo) => void;
}

// Inner component that has access to workflow context
function WorkflowChatInner() {
  const {
    config,
    state,
    selectPrompt,
    confirmPromptSelection,
    transitionToView,
    updateStep,
    setResource,
    addAgentMessage,
    setPrompts,
    setAgentTyping,
  } = useWorkflowScript();

  const [chatPanelOpen, setChatPanelOpen] = useState(true);
  const scriptStepRef = useRef(0);
  const isProcessingRef = useRef(false);

  // Demo script simulation
  const runDemoStep = useCallback(async (stepIndex: number) => {
    if (isProcessingRef.current) return;
    isProcessingRef.current = true;

    // Import the demo script
    const { foodDeliveryScript } = await import('../../workflows/createDatabase');

    if (stepIndex >= foodDeliveryScript.length) {
      isProcessingRef.current = false;
      return;
    }

    const step = foodDeliveryScript[stepIndex];

    // Wait for delay
    await new Promise((resolve) => setTimeout(resolve, step.delay || 1000));

    // Transition view if needed
    if (step.transitionToView) {
      transitionToView(step.transitionToView);
    }

    // Update step status if needed
    if (step.updateStep) {
      updateStep(step.updateStep.stepId, step.updateStep.status);
    }

    // Create/update resource if needed
    if (step.createResource) {
      setResource(step.createResource);
    }

    // Add agent message
    addAgentMessage(step.agentResponse);

    // Update prompts if needed
    if (step.nextPrompts) {
      setPrompts(step.nextPrompts);
    }

    isProcessingRef.current = false;
    scriptStepRef.current = stepIndex + 1;
  }, [addAgentMessage, setPrompts, setResource, transitionToView, updateStep]);

  // Handle user submitting from entry view
  const handleEntrySubmit = useCallback((message: string, _selectedOption: string | null) => {
    // Transition to conversation view
    transitionToView('conversation');

    // Add user message
    const userMessage: Message = {
      id: `msg-${Date.now()}`,
      type: 'user',
      content: message,
      timestamp: new Date(),
    };
    addAgentMessage({ ...userMessage, type: 'user' });

    // Start agent typing
    setAgentTyping(true);

    // Run first demo step after a delay
    setTimeout(() => {
      setAgentTyping(false);
      runDemoStep(0);
    }, 1500);
  }, [transitionToView, addAgentMessage, setAgentTyping, runDemoStep]);

  // Handle sending message in chat
  const handleSendMessage = useCallback((message: string) => {
    // Add user message
    addAgentMessage({
      type: 'user',
      content: message,
    });

    setAgentTyping(true);

    // Simulate agent response
    setTimeout(() => {
      setAgentTyping(false);
      runDemoStep(scriptStepRef.current);
    }, 1500);
  }, [addAgentMessage, setAgentTyping, runDemoStep]);

  // Handle action button clicks
  const handleActionClick = useCallback((actionId: string) => {
    if (actionId === 'auto-setup') {
      // Run the auto-setup sequence
      runDemoStep(scriptStepRef.current);

      // Chain the subsequent steps with delays
      const runSequence = async () => {
        await new Promise((r) => setTimeout(r, 2500));
        await runDemoStep(scriptStepRef.current); // setup-progress-1
        await new Promise((r) => setTimeout(r, 3000));
        await runDemoStep(scriptStepRef.current); // setup-progress-2 (configure complete)
      };
      runSequence();
    } else if (actionId === 'complete-setup') {
      // Run completion sequence
      const runCompletion = async () => {
        await runDemoStep(scriptStepRef.current); // complete
        await new Promise((r) => setTimeout(r, 2000));
        await runDemoStep(scriptStepRef.current); // show next steps
      };
      runCompletion();
    } else {
      // Generic action handling
      runDemoStep(scriptStepRef.current);
    }
  }, [runDemoStep]);

  // Handle prompt selection
  const handlePromptSelect = useCallback((promptId: string) => {
    selectPrompt(promptId);

    // For demo, immediately process and move to next step
    setAgentTyping(true);
    setTimeout(() => {
      setAgentTyping(false);
      runDemoStep(scriptStepRef.current);
    }, 1200);
  }, [selectPrompt, setAgentTyping, runDemoStep]);

  // Handle prompt confirmation (multi-select)
  const handlePromptsConfirm = useCallback(() => {
    confirmPromptSelection();

    setAgentTyping(true);
    setTimeout(() => {
      setAgentTyping(false);
      runDemoStep(scriptStepRef.current);
    }, 1200);
  }, [confirmPromptSelection, setAgentTyping, runDemoStep]);

  // Render based on current view
  const renderView = () => {
    switch (state.currentView) {
      case 'entry':
        return (
          <EntryView
            onSubmit={handleEntrySubmit}
            showIllustration={true}
          />
        );

      case 'conversation':
        return (
          <div style={{
            maxWidth: '800px',
            margin: '0 auto',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
          }}>
            {/* Selected option header */}
            <div style={{
              padding: '16px 20px',
              borderBottom: '1px solid var(--color-border-divider-default)',
            }}>
              <Container
                header={
                  <Header variant="h2">
                    {config.options.find((o) => o.id === state.selectedOption)?.title || 'Create new'}
                  </Header>
                }
              >
                <Box color="text-body-secondary">
                  {config.options.find((o) => o.id === state.selectedOption)?.description}
                </Box>
              </Container>
            </div>

            {/* Chat area */}
            <div style={{ flex: 1, overflow: 'hidden' }}>
              <ChatPanel
                onSendMessage={handleSendMessage}
                onActionClick={handleActionClick}
                onPromptSelect={handlePromptSelect}
                onPromptsConfirm={handlePromptsConfirm}
              />
            </div>
          </div>
        );

      case 'split':
        return (
          <SplitView
            onSendMessage={handleSendMessage}
            onActionClick={handleActionClick}
            onPromptSelect={handlePromptSelect}
            onPromptsConfirm={handlePromptsConfirm}
            chatPanelOpen={chatPanelOpen}
            onToggleChatPanel={() => setChatPanelOpen(!chatPanelOpen)}
          />
        );

      case 'completion':
        return (
          <SplitView
            onSendMessage={handleSendMessage}
            onActionClick={handleActionClick}
            onPromptSelect={handlePromptSelect}
            onPromptsConfirm={handlePromptsConfirm}
            chatPanelOpen={chatPanelOpen}
            onToggleChatPanel={() => setChatPanelOpen(!chatPanelOpen)}
          />
        );

      default:
        return null;
    }
  };

  return (
    <div style={{ height: '100%', overflow: 'hidden' }}>
      {renderView()}
    </div>
  );
}

// Main component with provider wrapper
export default function WorkflowChat({
  config,
  resourceContext,
  onWorkflowComplete,
}: WorkflowChatProps) {
  return (
    <WorkflowProvider
      config={config}
      resourceContext={resourceContext}
      onWorkflowComplete={onWorkflowComplete}
    >
      <WorkflowChatInner />
    </WorkflowProvider>
  );
}

// Re-export types and components for external use
export { WorkflowProvider, useWorkflow, useWorkflowScript } from './WorkflowContext';
export { default as EntryView } from './EntryView';
export { default as ChatPanel } from './ChatPanel';
export { default as SplitView } from './SplitView';
export { default as WorkflowStepper } from './WorkflowStepper';
export { default as ResourceCard, MultiRegionCard } from './ResourceCard';
export type * from './types';
