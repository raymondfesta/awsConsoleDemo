import { InvokeModelCommand } from '@aws-sdk/client-bedrock-runtime';
import { bedrockClient, BEDROCK_MODEL_ID } from '../config/aws.js';
import { SYSTEM_PROMPT } from '../prompts/system-prompt.js';
import type {
  ConversationMessage,
  ChatContext,
  ChatResponse,
  DynamicComponent,
  SupportPrompt
} from '../types/index.js';

interface ClaudeMessage {
  role: 'user' | 'assistant';
  content: string;
}

interface ClaudeRequest {
  anthropic_version: string;
  max_tokens: number;
  system: string;
  messages: ClaudeMessage[];
}

interface ClaudeResponse {
  content: Array<{
    type: string;
    text: string;
  }>;
  stop_reason: string;
  usage: {
    input_tokens: number;
    output_tokens: number;
  };
}

/**
 * Build context string from the chat context
 */
function buildContextString(context?: ChatContext): string {
  if (!context) return '';

  const parts: string[] = [];

  if (context.currentPage) {
    parts.push(`Current page: ${context.currentPage}`);
  }

  if (context.selectedOption) {
    const optionDescriptions: Record<string, string> = {
      'create-new': 'User wants to create a brand new database from scratch',
      'create-existing': 'User wants to create from an existing database (clone or migrate)',
    };
    const description = optionDescriptions[context.selectedOption] || context.selectedOption;
    parts.push(`Selected option: ${description}`);
  }

  if (context.selectedDatabase) {
    parts.push(`Selected database: ${context.selectedDatabase}`);
  }

  if (context.databases && context.databases.length > 0) {
    const dbList = context.databases
      .map(db => `- ${db.name} (${db.engine}, ${db.region}, ${db.status})`)
      .join('\n');
    parts.push(`Available databases:\n${dbList}`);
  }

  return parts.length > 0 ? `\n\nCurrent Context:\n${parts.join('\n')}` : '';
}

/**
 * Sanitize text to remove invalid escape sequences that break JSON
 * The AI sometimes returns LaTeX-style escapes like \! which are invalid in JSON
 */
function sanitizeText(text: string): string {
  // Remove backslash before punctuation marks (LaTeX-style escaping)
  return text.replace(/\\([!?.,;:'"()[\]{}])/g, '$1');
}

/**
 * Parse the AI response to extract message and optional component
 */
function parseResponse(text: string, wasTruncated: boolean = false): ChatResponse {
  // Try to find JSON in the response
  const jsonMatch = text.match(/```json\s*([\s\S]*?)\s*```/);

  if (jsonMatch) {
    try {
      const parsed = JSON.parse(jsonMatch[1]);
      return {
        message: sanitizeText(parsed.message || ''),
        component: parsed.component as DynamicComponent | undefined,
        suggestedActions: parsed.suggestedActions as SupportPrompt[] | undefined,
        requiresConfirmation: parsed.requiresConfirmation,
        confirmAction: parsed.confirmAction,
      };
    } catch (e) {
      // If response was truncated, provide a helpful error message
      if (wasTruncated) {
        console.error('JSON parse failed - response was truncated due to token limit');
        return {
          message: 'The response was too large and got truncated. Please try a simpler request or ask for the content in smaller parts.',
        };
      }
      console.error('Failed to parse JSON response:', e);
    }
  }

  // Try to parse the entire response as JSON (in case it's not wrapped in code blocks)
  try {
    const parsed = JSON.parse(text);
    if (parsed.message !== undefined) {
      return {
        message: sanitizeText(parsed.message || ''),
        component: parsed.component as DynamicComponent | undefined,
        suggestedActions: parsed.suggestedActions as SupportPrompt[] | undefined,
        requiresConfirmation: parsed.requiresConfirmation,
        confirmAction: parsed.confirmAction,
      };
    }
  } catch {
    // Not JSON, treat as plain text
    // If truncated and looks like it started as JSON, provide helpful message
    if (wasTruncated && (text.trim().startsWith('{') || text.trim().startsWith('```json'))) {
      return {
        message: 'The response was too large and got truncated. Please try a simpler request or ask for the content in smaller parts.',
      };
    }
  }

  // Return as plain text message
  return {
    message: sanitizeText(text.trim()),
  };
}

/**
 * Send a chat message to Bedrock and get a response
 */
export async function chat(
  messages: ConversationMessage[],
  context?: ChatContext
): Promise<ChatResponse> {
  const contextString = buildContextString(context);
  const systemPrompt = SYSTEM_PROMPT + contextString;

  // Convert messages to Claude format
  const claudeMessages: ClaudeMessage[] = messages.map(msg => ({
    role: msg.role,
    content: msg.content,
  }));

  const request: ClaudeRequest = {
    anthropic_version: 'bedrock-2023-05-31',
    max_tokens: 16384,  // Increased to handle large responses with embedded code/SQL
    system: systemPrompt,
    messages: claudeMessages,
  };

  try {
    const command = new InvokeModelCommand({
      modelId: BEDROCK_MODEL_ID,
      contentType: 'application/json',
      accept: 'application/json',
      body: JSON.stringify(request),
    });

    const response = await bedrockClient.send(command);
    const responseBody = JSON.parse(new TextDecoder().decode(response.body)) as ClaudeResponse;

    // Extract text from response
    const responseText = responseBody.content
      .filter(c => c.type === 'text')
      .map(c => c.text)
      .join('');

    // Check if response was truncated due to max_tokens
    const wasTruncated = responseBody.stop_reason === 'max_tokens';
    if (wasTruncated) {
      console.warn('Response was truncated - hit max_tokens limit');
    }

    console.log('Bedrock response tokens:', responseBody.usage);

    return parseResponse(responseText, wasTruncated);
  } catch (error) {
    console.error('Bedrock API error:', error);
    throw error;
  }
}

/**
 * Simple greeting response for testing
 */
export async function testConnection(): Promise<boolean> {
  try {
    const response = await chat([
      { role: 'user', content: 'Say "Hello" in one word.' }
    ]);
    return response.message.toLowerCase().includes('hello');
  } catch (error) {
    console.error('Bedrock connection test failed:', error);
    return false;
  }
}

export default { chat, testConnection };
