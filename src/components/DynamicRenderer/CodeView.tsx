import React from 'react';
import Box from '@cloudscape-design/components/box';
import Container from '@cloudscape-design/components/container';
import SpaceBetween from '@cloudscape-design/components/space-between';
import CopyToClipboard from '@cloudscape-design/components/copy-to-clipboard';
import Badge from '@cloudscape-design/components/badge';

interface CodeViewProps {
  content: string;
  language?: string;
}

/**
 * CodeView - A read-only code snippet display component following GenAI patterns
 *
 * Features:
 * - Language indicator badge
 * - Copy to clipboard action
 * - Monospace font with proper formatting
 * - Contained in a card for visual separation
 */
export default function CodeView({ content, language }: CodeViewProps): React.ReactElement {
  return (
    <Container
      header={
        <SpaceBetween direction="horizontal" size="xs" alignItems="center">
          {language && <Badge color="blue">{language.toUpperCase()}</Badge>}
          <Box variant="span" color="text-body-secondary" fontSize="body-s">
            Code snippet
          </Box>
        </SpaceBetween>
      }
      footer={
        <Box float="right">
          <CopyToClipboard
            copyButtonAriaLabel="Copy code"
            copyErrorText="Failed to copy"
            copySuccessText="Copied!"
            textToCopy={content}
            variant="icon"
          />
        </Box>
      }
    >
      <Box padding={{ vertical: 'xs' }}>
        <pre
          style={{
            margin: 0,
            padding: '12px',
            backgroundColor: 'var(--color-background-container-content)',
            borderRadius: '4px',
            overflow: 'auto',
            maxHeight: '400px',
            fontFamily: 'Monaco, Menlo, Consolas, "Courier New", monospace',
            fontSize: '13px',
            lineHeight: '1.5',
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-word',
          }}
        >
          <code>{content}</code>
        </pre>
      </Box>
    </Container>
  );
}
