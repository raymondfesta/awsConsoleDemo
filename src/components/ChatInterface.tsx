import { ChatBubble, Avatar } from '@cloudscape-design/chat-components';
import {
  UnifiedChatPanel,
  useChatAdapter,
  ChatDrawerHeader,
} from './chat';
import { useChatContext } from '../context/ChatContext';

// Welcome message for general chat
const WELCOME_MESSAGE = (
  <ChatBubble
    type="incoming"
    ariaLabel="Welcome message"
    avatar={
      <Avatar
        color="gen-ai"
        iconName="gen-ai"
        ariaLabel="AI Assistant"
        tooltipText="Database Agent"
      />
    }
  >
    <strong>Welcome! I'm your AI Assistant.</strong>
    <br /><br />
    I'm here to help you navigate and work more efficiently throughout this application. Whether you're exploring features, need guidance, or want to accomplish something specific, I'm ready to assist.
    <br /><br />
    <strong>How I can help:</strong>
    <ul style={{ margin: '8px 0', paddingLeft: '20px' }}>
      <li>Answer questions about features and functionality</li>
      <li>Guide you through workflows step-by-step</li>
      <li>Provide contextual suggestions based on what you're doing</li>
      <li>Help you find what you're looking for quickly</li>
      <li>Explain concepts and options when you need clarity</li>
    </ul>
    <strong>Just ask me anything!</strong> I'll provide relevant help based on where you are and what you're working on.
    <br /><br />
    <strong>Tip:</strong> I'm always watching your context, so my suggestions will adapt as you move through different parts of the application.
  </ChatBubble>
);

export default function ChatInterface() {
  const adapter = useChatAdapter();
  const { creationStatus, createdDatabaseName } = useChatContext();

  const isCreating = creationStatus === 'creating';
  const subtitle = isCreating ? `Creating ${createdDatabaseName || 'database'}...` : undefined;

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      minHeight: 0,
      overflow: 'hidden',
    }}>
      {/* Header */}
      <ChatDrawerHeader
        title="AI Assistant"
        subtitle={subtitle}
        showActivityIndicator={isCreating}
      />

      {/* Chat content */}
      <div style={{ flex: 1, overflow: 'hidden' }}>
        <UnifiedChatPanel
          {...adapter}
          variant="drawer"
          welcomeMessage={WELCOME_MESSAGE}
        />
      </div>
    </div>
  );
}
