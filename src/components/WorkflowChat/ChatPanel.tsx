import { UnifiedChatPanel, useWorkflowAdapter } from '../chat';

interface ChatPanelProps {
  onSendMessage: (message: string) => void;
  onActionClick?: (actionId: string) => void;
  onPromptSelect?: (promptId: string) => void;
  onPromptsConfirm?: () => void;
  showHeader?: boolean;
  headerTitle?: string;
  stepIndicator?: { current: number; total: number };
}

export default function ChatPanel({
  onSendMessage,
  onActionClick,
  onPromptSelect,
  onPromptsConfirm,
  showHeader = false,
  headerTitle,
  stepIndicator,
}: ChatPanelProps) {
  const adapter = useWorkflowAdapter({
    onSendMessage,
    onSelectPrompt: onPromptSelect || (() => {}),
    onActionClick: onActionClick || (() => {}),
    onConfirmPrompts: onPromptsConfirm,
  });

  return (
    <UnifiedChatPanel
      {...adapter}
      variant="panel"
      showHeader={showHeader}
      headerTitle={headerTitle}
      stepIndicator={stepIndicator}
    />
  );
}
