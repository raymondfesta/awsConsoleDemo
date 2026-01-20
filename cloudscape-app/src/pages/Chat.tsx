import Container from '@cloudscape-design/components/container';
import Header from '@cloudscape-design/components/header';
import ChatInterface from '../components/ChatInterface';

export default function Chat() {
  return (
    <Container
      header={<Header variant="h1">Chat Assistant</Header>}
      disableContentPaddings
    >
      <div style={{ height: '70vh' }}>
        <ChatInterface />
      </div>
    </Container>
  );
}
