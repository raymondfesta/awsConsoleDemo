import { useState } from 'react';
import Box from '@cloudscape-design/components/box';
import SpaceBetween from '@cloudscape-design/components/space-between';
import Tiles from '@cloudscape-design/components/tiles';
import PromptInput from '@cloudscape-design/components/prompt-input';
import Icon from '@cloudscape-design/components/icon';
import { SupportPromptGroup } from '@cloudscape-design/chat-components';
import { useWorkflow } from './WorkflowContext';

// Database illustration component using Cloudscape styling
function DatabaseIllustration() {
  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      padding: '40px 0',
    }}>
      <div style={{
        position: 'relative',
        width: '200px',
        height: '160px',
      }}>
        {/* Central database icon */}
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '80px',
          height: '80px',
          backgroundColor: 'var(--color-background-container-content)',
          borderRadius: '12px',
          border: '2px solid var(--color-border-status-success)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
        }}>
          <Icon name="settings" size="big" variant="success" />
        </div>

        {/* Decorative elements */}
        <div style={{
          position: 'absolute',
          top: '10px',
          left: '20px',
          opacity: 0.6,
        }}>
          <Icon name="folder" size="medium" variant="subtle" />
        </div>
        <div style={{
          position: 'absolute',
          top: '20px',
          right: '30px',
          opacity: 0.6,
        }}>
          <Icon name="status-positive" size="medium" variant="success" />
        </div>
        <div style={{
          position: 'absolute',
          bottom: '20px',
          left: '30px',
          opacity: 0.6,
        }}>
          <Icon name="share" size="medium" variant="subtle" />
        </div>
        <div style={{
          position: 'absolute',
          bottom: '10px',
          right: '20px',
          opacity: 0.6,
        }}>
          <Icon name="folder" size="medium" variant="subtle" />
        </div>
      </div>
    </div>
  );
}

interface EntryViewProps {
  onSubmit: (message: string, selectedOption: string | null) => void;
  showIllustration?: boolean;
}

export default function EntryView({ onSubmit, showIllustration = true }: EntryViewProps) {
  const { config, state, selectOption } = useWorkflow();
  const [promptValue, setPromptValue] = useState('');

  const handleSubmit = () => {
    if (promptValue.trim()) {
      onSubmit(promptValue.trim(), state.selectedOption);
      setPromptValue('');
    }
  };

  const handlePromptClick = (promptId: string) => {
    // For entry view, clicking a prompt fills the input
    const prompt = config.initialPrompts.find((p) => p.id === promptId);
    if (prompt) {
      setPromptValue(prompt.text);
    }
  };

  const tileItems = config.options.map((option) => ({
    value: option.id,
    label: option.title,
    description: option.description,
  }));

  return (
    <div style={{
      maxWidth: '900px',
      margin: '0 auto',
      padding: '20px',
      minHeight: '100%',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
    }}>
      <SpaceBetween size="l">
        {showIllustration && <DatabaseIllustration />}

        <Box textAlign="center">
          <Box variant="h1" fontSize="display-l" fontWeight="light">
            {config.title}
          </Box>
          {config.subtitle && (
            <Box variant="p" color="text-body-secondary" margin={{ top: 'xs' }}>
              {config.subtitle}
            </Box>
          )}
        </Box>

        <Tiles
          onChange={({ detail }) => selectOption(detail.value)}
          value={state.selectedOption}
          items={tileItems}
          columns={2}
        />

        <PromptInput
          value={promptValue}
          onChange={({ detail }) => setPromptValue(detail.value)}
          onAction={handleSubmit}
          placeholder={config.placeholder}
          actionButtonAriaLabel="Submit"
          actionButtonIconName="angle-right-double"
        />

        {state.showPrompts && config.initialPrompts.length > 0 && (
          <SupportPromptGroup
            ariaLabel="Quick start suggestions"
            alignment="horizontal"
            onItemClick={({ detail }) => handlePromptClick(detail.id)}
            items={config.initialPrompts.map((prompt) => ({
              id: prompt.id,
              text: prompt.text,
            }))}
          />
        )}
      </SpaceBetween>
    </div>
  );
}
