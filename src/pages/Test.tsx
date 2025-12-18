import { useState } from 'react';
import ContentLayout from '@cloudscape-design/components/content-layout';
import SpaceBetween from '@cloudscape-design/components/space-between';
import Box from '@cloudscape-design/components/box';
import PromptInput from '@cloudscape-design/components/prompt-input';
import { SupportPromptGroup } from '@cloudscape-design/chat-components';

type DatabaseOption = 'create-new' | 'create-existing';

interface SelectableCardProps {
  title: string;
  description: string;
  selected: boolean;
  onClick: () => void;
}

function SelectableCard({ title, description, selected, onClick }: SelectableCardProps) {
  return (
    <div
      onClick={onClick}
      style={{
        cursor: 'pointer',
        borderRadius: '16px',
        border: selected ? '1px solid #006ce0' : '1px solid #c6c6cd',
        backgroundColor: selected ? '#f0fbff' : '#ffffff',
        padding: '12px 20px 20px 20px',
        transition: 'all 0.15s ease-in-out',
      }}
      onMouseEnter={(e) => {
        if (!selected) {
          e.currentTarget.style.borderColor = '#8c8c94';
        }
      }}
      onMouseLeave={(e) => {
        if (!selected) {
          e.currentTarget.style.borderColor = '#c6c6cd';
        }
      }}
    >
      <SpaceBetween size="xs">
        <Box variant="h2" fontSize="heading-m">{title}</Box>
        <Box variant="p">{description}</Box>
      </SpaceBetween>
    </div>
  );
}

export default function Test() {
  const [promptValue, setPromptValue] = useState('');
  const [selectedOption, setSelectedOption] = useState<DatabaseOption>('create-new');

  const handlePromptSubmit = () => {
    if (promptValue.trim()) {
      console.log('Submitted:', promptValue);
      setPromptValue('');
    }
  };

  const handleSupportPromptClick = (text: string) => {
    setPromptValue(text);
  };

  return (
    <ContentLayout>
      <div style={{ maxWidth: '920px', margin: '0 auto', paddingTop: '40px' }}>
        <SpaceBetween size="l">
          <Box
            variant="h1"
            fontWeight="light"
            fontSize="display-l"
            textAlign="center"
          >
            Create database
          </Box>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <SelectableCard
              title="Create new"
              description="Create a brand new database. Describe your use case and we'll help you set up the optimal solution."
              selected={selectedOption === 'create-new'}
              onClick={() => setSelectedOption('create-new')}
            />
            <SelectableCard
              title="Create from existing"
              description="Tell us about your existing workload and we will build the right solution. We can duplicate existing resources, migrate from on prem, etc..."
              selected={selectedOption === 'create-existing'}
              onClick={() => setSelectedOption('create-existing')}
            />
          </div>

          <PromptInput
            value={promptValue}
            onChange={({ detail }) => setPromptValue(detail.value)}
            onAction={handlePromptSubmit}
            placeholder="Ask a question"
            actionButtonAriaLabel="Submit"
            actionButtonIconName="send"
          />

          <SupportPromptGroup
            ariaLabel="Quick actions"
            alignment="horizontal"
            onItemClick={({ detail }) => handleSupportPromptClick(detail.id)}
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
