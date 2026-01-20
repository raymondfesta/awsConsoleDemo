import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import type {
  WorkflowConfig,
  WorkflowState,
  WorkflowContextType,
  WorkflowView,
  StepStatus,
  ResourceInfo,
  Message,
  SupportPrompt,
} from './types';

const WorkflowContext = createContext<WorkflowContextType | null>(null);

export function useWorkflow() {
  const context = useContext(WorkflowContext);
  if (!context) {
    throw new Error('useWorkflow must be used within a WorkflowProvider');
  }
  return context;
}

interface WorkflowProviderProps {
  config: WorkflowConfig;
  resourceContext?: ResourceInfo | null;
  onWorkflowComplete?: (resource: ResourceInfo) => void;
  children: ReactNode;
}

function createInitialState(config: WorkflowConfig, resourceContext?: ResourceInfo | null): WorkflowState {
  return {
    currentView: 'entry',
    selectedOption: null,
    messages: [],
    currentPrompts: config.initialPrompts,
    showPrompts: true,
    selectedPrompts: [],
    steps: config.steps.map((step) => ({ ...step, status: 'pending' as StepStatus })),
    currentStepIndex: 0,
    resource: resourceContext || null,
    isAgentTyping: false,
    workflowComplete: false,
  };
}

export function WorkflowProvider({
  config,
  resourceContext,
  onWorkflowComplete,
  children,
}: WorkflowProviderProps) {
  const [state, setState] = useState<WorkflowState>(() =>
    createInitialState(config, resourceContext)
  );

  const selectOption = useCallback((optionId: string) => {
    setState((prev) => ({
      ...prev,
      selectedOption: optionId,
    }));
  }, []);

  const sendMessage = useCallback((content: string) => {
    const userMessage: Message = {
      id: `msg-${Date.now()}`,
      type: 'user',
      content,
      timestamp: new Date(),
    };

    setState((prev) => ({
      ...prev,
      messages: [...prev.messages, userMessage],
      isAgentTyping: true,
    }));
  }, []);

  const addAgentMessage = useCallback((message: Omit<Message, 'id' | 'timestamp'>) => {
    const agentMessage: Message = {
      ...message,
      id: `msg-${Date.now()}`,
      timestamp: new Date(),
    };

    setState((prev) => ({
      ...prev,
      messages: [...prev.messages, agentMessage],
      isAgentTyping: false,
    }));
  }, []);

  const selectPrompt = useCallback((promptId: string) => {
    setState((prev) => {
      const isSelected = prev.selectedPrompts.includes(promptId);
      return {
        ...prev,
        selectedPrompts: isSelected
          ? prev.selectedPrompts.filter((id) => id !== promptId)
          : [...prev.selectedPrompts, promptId],
      };
    });
  }, []);

  const confirmPromptSelection = useCallback(() => {
    setState((prev) => ({
      ...prev,
      showPrompts: false,
    }));
  }, []);

  const setPrompts = useCallback((prompts: SupportPrompt[]) => {
    setState((prev) => ({
      ...prev,
      currentPrompts: prompts,
      showPrompts: true,
      selectedPrompts: [],
    }));
  }, []);

  const triggerAction = useCallback((actionId: string) => {
    // This will be handled by the workflow script
    console.log('Action triggered:', actionId);
  }, []);

  const transitionToView = useCallback((view: WorkflowView) => {
    setState((prev) => ({
      ...prev,
      currentView: view,
    }));
  }, []);

  const updateStep = useCallback((stepId: string, status: StepStatus) => {
    setState((prev) => ({
      ...prev,
      steps: prev.steps.map((step) =>
        step.id === stepId ? { ...step, status } : step
      ),
      currentStepIndex:
        status === 'success'
          ? prev.steps.findIndex((s) => s.id === stepId) + 1
          : prev.currentStepIndex,
    }));
  }, []);

  const setResource = useCallback((resource: ResourceInfo) => {
    setState((prev) => ({
      ...prev,
      resource,
    }));

    if (resource.status === 'active' && onWorkflowComplete) {
      onWorkflowComplete(resource);
    }
  }, [onWorkflowComplete]);

  const setAgentTyping = useCallback((isTyping: boolean) => {
    setState((prev) => ({
      ...prev,
      isAgentTyping: isTyping,
    }));
  }, []);

  const setWorkflowComplete = useCallback((complete: boolean) => {
    setState((prev) => ({
      ...prev,
      workflowComplete: complete,
    }));
  }, []);

  const resetWorkflow = useCallback(() => {
    setState(createInitialState(config, resourceContext));
  }, [config, resourceContext]);

  const contextValue: WorkflowContextType & {
    addAgentMessage: typeof addAgentMessage;
    setPrompts: typeof setPrompts;
    setAgentTyping: typeof setAgentTyping;
    setWorkflowComplete: typeof setWorkflowComplete;
  } = {
    config,
    state,
    selectOption,
    sendMessage,
    selectPrompt,
    confirmPromptSelection,
    triggerAction,
    transitionToView,
    updateStep,
    setResource,
    resetWorkflow,
    // Extended actions for workflow scripts
    addAgentMessage,
    setPrompts,
    setAgentTyping,
    setWorkflowComplete,
  };

  return (
    <WorkflowContext.Provider value={contextValue as WorkflowContextType}>
      {children}
    </WorkflowContext.Provider>
  );
}

// Extended hook with script actions
export function useWorkflowScript() {
  const context = useContext(WorkflowContext);
  if (!context) {
    throw new Error('useWorkflowScript must be used within a WorkflowProvider');
  }
  return context as WorkflowContextType & {
    addAgentMessage: (message: Omit<Message, 'id' | 'timestamp'>) => void;
    setPrompts: (prompts: SupportPrompt[]) => void;
    setAgentTyping: (isTyping: boolean) => void;
    setWorkflowComplete: (complete: boolean) => void;
  };
}
