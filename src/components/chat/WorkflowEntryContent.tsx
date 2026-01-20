import { useState } from 'react';
import Box from '@cloudscape-design/components/box';
import SpaceBetween from '@cloudscape-design/components/space-between';
import Tiles from '@cloudscape-design/components/tiles';
import PromptInput from '@cloudscape-design/components/prompt-input';
import { SupportPromptGroup } from '@cloudscape-design/chat-components';
import { useChatContext, type SupportPrompt } from '../../context/ChatContext';

// Database illustration SVG component
function DatabaseIllustration() {
  return (
    <svg width="280" height="160" viewBox="0 0 280 160" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Cloud background */}
      <ellipse cx="140" cy="120" rx="100" ry="30" fill="#F0F4FF" />
      {/* Database stack */}
      <g transform="translate(90, 50)">
        <rect x="0" y="0" width="60" height="20" rx="4" fill="#006CE0" stroke="#0F141A" strokeWidth="1.5"/>
        <rect x="0" y="22" width="60" height="20" rx="4" fill="#006CE0" stroke="#0F141A" strokeWidth="1.5"/>
        <rect x="0" y="44" width="60" height="20" rx="4" fill="#006CE0" stroke="#0F141A" strokeWidth="1.5"/>
        {/* Database lines */}
        <line x1="8" y1="10" x2="40" y2="10" stroke="white" strokeWidth="2" strokeLinecap="round"/>
        <line x1="8" y1="32" x2="35" y2="32" stroke="white" strokeWidth="2" strokeLinecap="round"/>
        <line x1="8" y1="54" x2="30" y2="54" stroke="white" strokeWidth="2" strokeLinecap="round"/>
      </g>
      {/* Robot */}
      <g transform="translate(160, 40)">
        {/* Robot head */}
        <rect x="0" y="0" width="40" height="30" rx="8" fill="#F3F3F7" stroke="#0F141A" strokeWidth="1.5"/>
        {/* Robot eyes */}
        <circle cx="12" cy="14" r="4" fill="#006CE0" stroke="#0F141A" strokeWidth="1"/>
        <circle cx="28" cy="14" r="4" fill="#006CE0" stroke="#0F141A" strokeWidth="1"/>
        {/* Robot antenna */}
        <line x1="20" y1="0" x2="20" y2="-8" stroke="#0F141A" strokeWidth="1.5"/>
        <circle cx="20" cy="-10" r="3" fill="#10B981" stroke="#0F141A" strokeWidth="1"/>
        {/* Robot body */}
        <rect x="5" y="32" width="30" height="25" rx="4" fill="#F3F3F7" stroke="#0F141A" strokeWidth="1.5"/>
        {/* Robot arms */}
        <line x1="0" y1="40" x2="-10" y2="50" stroke="#0F141A" strokeWidth="1.5" strokeLinecap="round"/>
        <line x1="40" y1="40" x2="50" y2="35" stroke="#0F141A" strokeWidth="1.5" strokeLinecap="round"/>
        {/* Watering can */}
        <g transform="translate(45, 25)">
          <ellipse cx="8" cy="12" rx="6" ry="8" fill="#DEDEE3" stroke="#0F141A" strokeWidth="1"/>
          <line x1="8" y1="4" x2="8" y2="-2" stroke="#0F141A" strokeWidth="1"/>
          <line x1="14" y1="8" x2="20" y2="4" stroke="#0F141A" strokeWidth="1"/>
          {/* Water drops */}
          <circle cx="22" cy="8" r="1.5" fill="#60A5FA"/>
          <circle cx="24" cy="12" r="1.5" fill="#60A5FA"/>
          <circle cx="23" cy="16" r="1.5" fill="#60A5FA"/>
        </g>
      </g>
      {/* Stars */}
      <g fill="#FFE8BD" stroke="#0F141A" strokeWidth="1">
        <path d="M70 30 L72 36 L78 36 L73 40 L75 46 L70 42 L65 46 L67 40 L62 36 L68 36 Z" transform="scale(0.6)"/>
        <path d="M220 20 L222 26 L228 26 L223 30 L225 36 L220 32 L215 36 L217 30 L212 26 L218 26 Z" transform="scale(0.5)"/>
      </g>
      {/* Shooting star */}
      <g transform="translate(220, 35)">
        <path d="M0 0 L-15 8" stroke="#FFE8BD" strokeWidth="2" strokeLinecap="round"/>
        <circle cx="0" cy="0" r="3" fill="#FFE8BD" stroke="#0F141A" strokeWidth="0.5"/>
      </g>
      {/* Ground line */}
      <line x1="80" y1="130" x2="200" y2="130" stroke="#0F141A" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  );
}

interface WorkflowEntryContentProps {
  initialPrompts?: SupportPrompt[];
  onPromptClick?: (promptId: string) => void;
}

export default function WorkflowEntryContent({
  initialPrompts,
  onPromptClick,
}: WorkflowEntryContentProps) {
  const {
    workflow,
    isAgentTyping,
    selectWorkflowOption,
    sendMessage,
    setDemoPath,
  } = useChatContext();

  const [promptValue, setPromptValue] = useState('');

  // Get workflow config from context
  const config = workflow.config;

  if (!config) {
    return null;
  }

  // Get prompts to display (from props or config)
  const displayPrompts = initialPrompts || config.initialPrompts || [];

  // Get placeholder text
  const getPlaceholder = () => {
    return config.placeholder || 'Describe what you want to do...';
  };

  // Handle form submission
  const handleSubmit = () => {
    if (promptValue.trim() && !isAgentTyping) {
      // Set demo path based on selected option
      if (workflow.selectedOption === 'create-existing') {
        setDemoPath('clone');
      } else {
        setDemoPath('new');
      }
      sendMessage(promptValue.trim());
      setPromptValue('');
    }
  };

  // Handle quick prompt click
  const handlePromptClick = (promptId: string) => {
    if (onPromptClick) {
      onPromptClick(promptId);
      return;
    }

    // Default behavior: find the prompt and send it
    const prompt = displayPrompts.find(p => p.id === promptId);
    if (prompt) {
      setDemoPath('new');
      sendMessage(prompt.text);
    }
  };

  return (
    <div style={{
      height: '100%',
      overflow: 'auto',
      padding: '24px 20px',
    }}>
      <div style={{
        maxWidth: '720px',
        margin: '0 auto',
      }}>
        <SpaceBetween size="l">
          {/* Illustration */}
          <Box textAlign="center">
            <DatabaseIllustration />
          </Box>

          {/* Title */}
          <Box textAlign="center">
            <Box
              variant="h1"
              fontSize="display-l"
              fontWeight="heavy"
            >
              {config.title}
            </Box>
            {config.subtitle && (
              <Box color="text-body-secondary" margin={{ top: 'xs' }}>
                {config.subtitle}
              </Box>
            )}
          </Box>

          {/* Tiles for option selection */}
          {config.options && config.options.length > 0 && (
            <Tiles
              onChange={({ detail }) => selectWorkflowOption(detail.value)}
              value={workflow.selectedOption}
              items={config.options.map(opt => ({
                value: opt.id,
                label: opt.title,
                description: opt.description,
              }))}
              columns={2}
            />
          )}

          {/* Prompt Input */}
          <PromptInput
            value={promptValue}
            onChange={({ detail }) => setPromptValue(detail.value)}
            onAction={handleSubmit}
            placeholder={getPlaceholder()}
            actionButtonAriaLabel="Start conversation"
            actionButtonIconName="send"
            disabled={isAgentTyping}
            minRows={2}
            maxRows={6}
          />

          {/* Quick start use-cases */}
          {displayPrompts.length > 0 && (
            <SpaceBetween size="s">
              <Box fontWeight="bold" fontSize="heading-s">
                Quick start use-cases
              </Box>
              <SupportPromptGroup
                ariaLabel="Quick start use-cases"
                alignment="horizontal"
                onItemClick={({ detail }) => handlePromptClick(detail.id)}
                items={displayPrompts.map(p => ({
                  id: p.id,
                  text: p.text,
                }))}
              />
            </SpaceBetween>
          )}
        </SpaceBetween>
      </div>
    </div>
  );
}
