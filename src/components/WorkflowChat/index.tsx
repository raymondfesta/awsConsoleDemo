import { useState, useCallback, useRef } from 'react';
import { WorkflowProvider, useWorkflowScript } from './WorkflowContext';
import EntryView from './EntryView';
import SplitView from './SplitView';
import ChatPanel from './ChatPanel';
import Box from '@cloudscape-design/components/box';
import Container from '@cloudscape-design/components/container';
import Header from '@cloudscape-design/components/header';
import { chatApi, type ConversationMessage } from '../../services/api';
import type { WorkflowConfig, ResourceInfo } from './types';

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
    updateStep: _updateStep,
    setResource: _setResource,
    addAgentMessage,
    setPrompts,
    setAgentTyping,
  } = useWorkflowScript();

  const [chatPanelOpen, setChatPanelOpen] = useState(true);
  const conversationRef = useRef<ConversationMessage[]>([]);

  // Send message to Bedrock API
  const sendToAPI = useCallback(async (userContent: string) => {
    // Add user message to conversation history
    conversationRef.current.push({ role: 'user', content: userContent });

    setAgentTyping(true);

    try {
      const response = await chatApi.sendMessage(conversationRef.current, {
        currentPage: '/create-database',
      });

      // Add assistant response to history
      conversationRef.current.push({ role: 'assistant', content: response.message });

      // Add agent message with dynamic component
      addAgentMessage({
        type: 'agent',
        content: response.message,
        feedbackEnabled: true,
        dynamicComponent: response.component,
        suggestedActions: response.suggestedActions,
        requiresConfirmation: response.requiresConfirmation,
        confirmAction: response.confirmAction,
      });

      // Update prompts if provided
      if (response.suggestedActions) {
        setPrompts(response.suggestedActions);
      }
    } catch (error) {
      addAgentMessage({
        type: 'agent',
        content: `Error: ${error instanceof Error ? error.message : 'Failed to get response'}`,
      });
    } finally {
      setAgentTyping(false);
    }
  }, [config.id, addAgentMessage, setPrompts, setAgentTyping]);

  // Handle user submitting from entry view
  const handleEntrySubmit = useCallback((message: string, _selectedOption: string | null) => {
    // Transition to conversation view
    transitionToView('conversation');

    // Add user message to UI
    addAgentMessage({ type: 'user', content: message });

    // Send to Bedrock API
    sendToAPI(message);
  }, [transitionToView, addAgentMessage, sendToAPI]);

  // Handle sending message in chat
  const handleSendMessage = useCallback((message: string) => {
    // Add user message to UI
    addAgentMessage({ type: 'user', content: message });

    // Send to Bedrock API
    sendToAPI(message);
  }, [addAgentMessage, sendToAPI]);

  // Handle action button clicks
  const handleActionClick = useCallback((actionId: string) => {
    // Send action to Bedrock API as user message
    const actionText = `Execute action: ${actionId}`;
    addAgentMessage({ type: 'user', content: actionText });
    sendToAPI(actionText);
  }, [addAgentMessage, sendToAPI]);

  // Handle prompt selection
  const handlePromptSelect = useCallback((promptId: string) => {
    // Find the prompt text
    const prompt = state.currentPrompts.find(p => p.id === promptId);
    if (prompt) {
      // Add user message to UI with the prompt text
      addAgentMessage({ type: 'user', content: prompt.text });
      // Send to Bedrock API
      sendToAPI(prompt.text);
    }
    selectPrompt(promptId);
  }, [state.currentPrompts, addAgentMessage, sendToAPI, selectPrompt]);

  // Handle prompt confirmation (multi-select)
  const handlePromptsConfirm = useCallback(() => {
    // Get selected prompt texts
    const selectedTexts = state.selectedPrompts
      .map(id => state.currentPrompts.find(p => p.id === id)?.text)
      .filter(Boolean)
      .join(', ');

    if (selectedTexts) {
      addAgentMessage({ type: 'user', content: selectedTexts });
      sendToAPI(selectedTexts);
    }
    confirmPromptSelection();
  }, [state.selectedPrompts, state.currentPrompts, addAgentMessage, sendToAPI, confirmPromptSelection]);

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
