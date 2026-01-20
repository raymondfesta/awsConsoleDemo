import { useState } from 'react';
import ContentLayout from '@cloudscape-design/components/content-layout';
import SpaceBetween from '@cloudscape-design/components/space-between';
import Container from '@cloudscape-design/components/container';
import Box from '@cloudscape-design/components/box';
import PromptInput from '@cloudscape-design/components/prompt-input';
import { SupportPromptGroup } from '@cloudscape-design/chat-components';

export default function DatabaseWizard() {
  const [promptValue, setPromptValue] = useState('');

  return (
    <ContentLayout>
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      <SpaceBetween size="l">
        <Box variant="h1" fontWeight="light" fontSize="display-l">Create database</Box>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          <Container>
            <div style={{ height: '100%' }}>
              <SpaceBetween size="s">
                <Box variant="h2" fontSize="heading-m">Create new</Box>
                <Box variant="p">Create a brand new database. Describe your use case and we'll help you set up the optimal solution.</Box>
              </SpaceBetween>
            </div>
          </Container>
          <Container>
            <div style={{ height: '100%' }}>
              <SpaceBetween size="s">
                <Box variant="h2" fontSize="heading-m">Create from existing</Box>
                <Box variant="p">Tell us about your existing workload and we will build the right solution. We can duplicate existing resources, migrate from on prem, etc...</Box>
              </SpaceBetween>
            </div>
          </Container>
        </div>
        <PromptInput
          value={promptValue}
          onChange={({ detail }) => setPromptValue(detail.value)}
          placeholder="Ask a question"
          actionButtonAriaLabel="Submit"
          actionButtonIconName="send"
        />
        <SupportPromptGroup
          ariaLabel="Quick actions"
          alignment="horizontal"
          onItemClick={({ detail }) => setPromptValue(detail.id)}
          items={[
            { id: 'Create image', text: 'Create image' },
            { id: 'Brainstorm', text: 'Brainstorm' },
            { id: 'Summarize text', text: 'Summarize text' }
          ]}
        />
      </SpaceBetween>
      </div>
    </ContentLayout>
  );
}
