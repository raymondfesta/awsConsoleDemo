import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Container from '@cloudscape-design/components/container';
import Box from '@cloudscape-design/components/box';
import SpaceBetween from '@cloudscape-design/components/space-between';
import Button from '@cloudscape-design/components/button';
import PromptInput from '@cloudscape-design/components/prompt-input';
import { SupportPromptGroup } from '@cloudscape-design/chat-components';
import { useChatContext } from '../context/ChatContext';

const QUICK_START_PROMPTS = [
  { id: 'ecommerce', text: 'E-commerce or retail analytics' },
  { id: 'web-backend', text: 'Web application backend' },
  { id: 'iot', text: 'IoT data collection' },
  { id: 'financial', text: 'Financial transactions' },
];

// Database illustration SVG component
function DatabaseIllustration() {
  return (
    <svg width="160" height="100" viewBox="0 0 160 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Pink/purple circle background */}
      <circle cx="70" cy="50" r="45" fill="#e8d5f9" />

      {/* Database stack */}
      <g transform="translate(45, 25)">
        <rect x="0" y="0" width="50" height="14" rx="3" fill="#3b82f6" stroke="#1e40af" strokeWidth="1"/>
        <rect x="0" y="16" width="50" height="14" rx="3" fill="#60a5fa" stroke="#1e40af" strokeWidth="1"/>
        <rect x="0" y="32" width="50" height="14" rx="3" fill="#93c5fd" stroke="#1e40af" strokeWidth="1"/>
        {/* Database lines */}
        <line x1="6" y1="7" x2="30" y2="7" stroke="white" strokeWidth="2" strokeLinecap="round"/>
        <line x1="6" y1="23" x2="25" y2="23" stroke="white" strokeWidth="2" strokeLinecap="round"/>
        <line x1="6" y1="39" x2="20" y2="39" stroke="white" strokeWidth="2" strokeLinecap="round"/>
        {/* Plus icon */}
        <circle cx="42" cy="7" r="6" fill="#10b981" stroke="#047857" strokeWidth="1"/>
        <line x1="42" y1="4" x2="42" y2="10" stroke="white" strokeWidth="1.5"/>
        <line x1="39" y1="7" x2="45" y2="7" stroke="white" strokeWidth="1.5"/>
      </g>

      {/* Server icon */}
      <g transform="translate(105, 30)">
        <rect x="0" y="0" width="35" height="40" rx="4" fill="#e5e7eb" stroke="#374151" strokeWidth="1"/>
        <circle cx="17.5" cy="12" r="4" fill="#374151"/>
        <line x1="8" y1="24" x2="27" y2="24" stroke="#374151" strokeWidth="1.5" strokeLinecap="round"/>
        <line x1="8" y1="30" x2="22" y2="30" stroke="#374151" strokeWidth="1.5" strokeLinecap="round"/>
      </g>

      {/* Decorative elements */}
      <path d="M25 25 L27 30 L32 30 L28 33 L30 38 L25 35 L20 38 L22 33 L18 30 L23 30 Z" fill="#fbbf24" stroke="#d97706" strokeWidth="0.5"/>
      <circle cx="130" cy="20" r="3" fill="#a78bfa"/>
      <circle cx="145" cy="35" r="2" fill="#f472b6"/>

      {/* Sparkle lines */}
      <line x1="135" y1="15" x2="140" y2="10" stroke="#c4b5fd" strokeWidth="1.5" strokeLinecap="round"/>
      <line x1="138" y1="18" x2="145" y2="18" stroke="#c4b5fd" strokeWidth="1.5" strokeLinecap="round"/>

      {/* Small diamond decorations */}
      <path d="M82 55 L84 58 L82 61 L80 58 Z" fill="#10b981"/>
    </svg>
  );
}

export default function AmazonDatabases() {
  const navigate = useNavigate();
  const { setDemoPath, sendMessage } = useChatContext();
  const [promptValue, setPromptValue] = useState('');

  const handleStartCreating = () => {
    if (promptValue.trim()) {
      setDemoPath('new');
      sendMessage(promptValue.trim());
    }
    navigate('/create-database');
  };

  const handlePromptClick = (promptId: string) => {
    const prompt = QUICK_START_PROMPTS.find(p => p.id === promptId);
    if (prompt) {
      setDemoPath('new');
      sendMessage(prompt.text);
      navigate('/create-database');
    }
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--color-background-layout-main, #f1f1f1)' }}>
      {/* Dark Header Banner */}
      <div style={{
        backgroundColor: '#0f1b2a',
        padding: '40px 24px 48px 24px',
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <h1 style={{
            fontSize: '36px',
            fontWeight: 700,
            margin: 0,
            marginBottom: '8px',
            color: '#ff9900',
            fontFamily: 'var(--font-family-base, "Amazon Ember", "Helvetica Neue", Roboto, Arial, sans-serif)',
          }}>
            Amazon Databases
          </h1>
          <p style={{
            fontSize: '20px',
            fontWeight: 300,
            margin: 0,
            color: '#d1d5db',
            fontFamily: 'var(--font-family-base, "Amazon Ember", "Helvetica Neue", Roboto, Arial, sans-serif)',
          }}>
            Create, manage, and monitor your database resources all in one place.
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div style={{
        maxWidth: '800px',
        margin: '0 auto',
        padding: '32px 24px',
        marginTop: '-24px',
      }}>
        <Container>
          <SpaceBetween size="l">
            {/* Database Illustration */}
            <Box textAlign="center" padding={{ top: 's' }}>
              <DatabaseIllustration />
            </Box>

            {/* Title and Description */}
            <Box textAlign="center">
              <SpaceBetween size="xs">
                <Box variant="h2" fontSize="heading-l" fontWeight="bold">
                  Create a database
                </Box>
                <Box color="text-body-secondary" fontSize="body-m">
                  Our database agent will guide you through the configuration and setup process.
                </Box>
              </SpaceBetween>
            </Box>

            {/* Prompt Input */}
            <PromptInput
              value={promptValue}
              onChange={({ detail }) => setPromptValue(detail.value)}
              onAction={handleStartCreating}
              placeholder="What type of application or workload will this database support?"
              actionButtonAriaLabel="Send"
              actionButtonIconName="send"
              minRows={2}
              maxRows={4}
            />

            {/* Quick Start Use Cases */}
            <SpaceBetween size="s">
              <Box fontWeight="bold" fontSize="body-s">
                Quick start use-cases
              </Box>
              <SupportPromptGroup
                ariaLabel="Quick start use-cases"
                alignment="horizontal"
                onItemClick={({ detail }) => handlePromptClick(detail.id)}
                items={QUICK_START_PROMPTS.map(p => ({
                  id: p.id,
                  text: p.text,
                }))}
              />
            </SpaceBetween>

            {/* Start Creating Button */}
            <Box textAlign="center" padding={{ top: 's', bottom: 's' }}>
              <Button
                variant="primary"
                iconName="gen-ai"
                onClick={handleStartCreating}
              >
                Start creating
              </Button>
            </Box>
          </SpaceBetween>
        </Container>
      </div>
    </div>
  );
}
