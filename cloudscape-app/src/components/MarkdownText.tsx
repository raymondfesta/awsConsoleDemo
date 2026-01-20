import React from 'react';

interface MarkdownTextProps {
  content: string;
}

/**
 * Simple Markdown renderer that handles common formatting:
 * - **bold** and *italic*
 * - `inline code`
 * - Bullet lists (- item)
 * - Newlines
 */
export default function MarkdownText({ content }: MarkdownTextProps) {
  // Process the content line by line to handle lists and block elements
  const lines = content.split('\n');
  const elements: React.ReactNode[] = [];
  let currentList: React.ReactNode[] = [];
  let elementKey = 0;

  const flushList = () => {
    if (currentList.length > 0) {
      elements.push(
        <ul key={`list-${elementKey++}`} style={{ margin: '8px 0', paddingLeft: '20px' }}>
          {currentList}
        </ul>
      );
      currentList = [];
    }
  };

  lines.forEach((line) => {
    // Check for bullet points (-, *, •)
    const bulletMatch = line.match(/^[-*•]\s+(.+)$/);
    if (bulletMatch) {
      currentList.push(
        <li key={`li-${elementKey++}`}>{renderInlineMarkdown(bulletMatch[1])}</li>
      );
      return;
    }

    // Flush any pending list items before processing non-list content
    flushList();

    // Check for h3 headers (###)
    const h3Match = line.match(/^###\s+(.+)$/);
    if (h3Match) {
      elements.push(
        <h4 key={`h4-${elementKey++}`} style={{ margin: '12px 0 8px 0', fontWeight: 600, fontSize: '14px' }}>
          {renderInlineMarkdown(h3Match[1])}
        </h4>
      );
      return;
    }

    // Check for h2 headers (##)
    const h2Match = line.match(/^##\s+(.+)$/);
    if (h2Match) {
      elements.push(
        <h3 key={`h3-${elementKey++}`} style={{ margin: '12px 0 8px 0', fontWeight: 600, fontSize: '15px' }}>
          {renderInlineMarkdown(h2Match[1])}
        </h3>
      );
      return;
    }

    // Empty line - add spacing
    if (line.trim() === '') {
      elements.push(<div key={`space-${elementKey++}`} style={{ height: '8px' }} />);
      return;
    }

    // Regular paragraph
    elements.push(
      <div key={`p-${elementKey++}`} style={{ marginBottom: '4px' }}>
        {renderInlineMarkdown(line)}
      </div>
    );
  });

  // Flush any remaining list items
  flushList();

  return <div>{elements}</div>;
}

/**
 * Render inline markdown: bold, italic, code, links
 * Uses a token-based approach for reliable parsing
 */
function renderInlineMarkdown(text: string): React.ReactNode {
  // Define token patterns in order of priority
  const patterns = [
    { regex: /\*\*(.+?)\*\*/g, type: 'bold' },
    { regex: /\*([^*]+?)\*/g, type: 'italic' },
    { regex: /`([^`]+?)`/g, type: 'code' },
    { regex: /\[([^\]]+?)\]\(([^)]+?)\)/g, type: 'link' },
  ];

  // Find all matches with their positions
  interface Token {
    start: number;
    end: number;
    type: string;
    content: string;
    url?: string;
    fullMatch: string;
  }

  const tokens: Token[] = [];

  for (const pattern of patterns) {
    const regex = new RegExp(pattern.regex.source, 'g');
    let match;
    while ((match = regex.exec(text)) !== null) {
      // Check if this position overlaps with existing tokens
      const overlaps = tokens.some(
        t => (match!.index >= t.start && match!.index < t.end) ||
             (match!.index + match![0].length > t.start && match!.index + match![0].length <= t.end)
      );

      if (!overlaps) {
        tokens.push({
          start: match.index,
          end: match.index + match[0].length,
          type: pattern.type,
          content: match[1],
          url: pattern.type === 'link' ? match[2] : undefined,
          fullMatch: match[0],
        });
      }
    }
  }

  // Sort tokens by start position
  tokens.sort((a, b) => a.start - b.start);

  // Build the result
  if (tokens.length === 0) {
    return text;
  }

  const result: React.ReactNode[] = [];
  let lastEnd = 0;
  let key = 0;

  for (const token of tokens) {
    // Add text before this token
    if (token.start > lastEnd) {
      result.push(text.slice(lastEnd, token.start));
    }

    // Add the formatted token
    switch (token.type) {
      case 'bold':
        result.push(<strong key={`b-${key++}`}>{token.content}</strong>);
        break;
      case 'italic':
        result.push(<em key={`i-${key++}`}>{token.content}</em>);
        break;
      case 'code':
        result.push(
          <code
            key={`c-${key++}`}
            style={{
              backgroundColor: 'var(--color-background-input-disabled)',
              padding: '2px 6px',
              borderRadius: '4px',
              fontFamily: 'monospace',
              fontSize: '0.9em',
            }}
          >
            {token.content}
          </code>
        );
        break;
      case 'link':
        result.push(
          <a
            key={`a-${key++}`}
            href={token.url}
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: 'var(--color-text-link-default)' }}
          >
            {token.content}
          </a>
        );
        break;
    }

    lastEnd = token.end;
  }

  // Add any remaining text after the last token
  if (lastEnd < text.length) {
    result.push(text.slice(lastEnd));
  }

  return result;
}
