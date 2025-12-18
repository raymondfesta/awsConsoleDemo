import { AppLayout, ContentLayout, Header } from '@cloudscape-design/components';
import ChatInterface from '../components/ChatInterface';

export default function ChatPage() {
  return (
    <AppLayout
      navigationHide
      toolsHide
      content={
        <ContentLayout header={<Header variant="h1">Chat Interface</Header>}>
          <ChatInterface />
        </ContentLayout>
      }
    />
  );
}
