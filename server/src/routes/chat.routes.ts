import { Router, Request, Response } from 'express';
import { chat, testConnection } from '../services/bedrock.service.js';
import type { ChatRequest } from '../types/index.js';

const router = Router();

/**
 * POST /api/chat
 * Send a message to the AI assistant
 */
router.post('/', async (req: Request<object, object, ChatRequest>, res: Response) => {
  try {
    const { messages, context } = req.body;

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      res.status(400).json({ error: 'Messages array is required' });
      return;
    }

    const response = await chat(messages, context);
    res.json(response);
  } catch (error) {
    console.error('Chat error:', error);
    res.status(500).json({
      error: 'Failed to process chat request',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * GET /api/chat/test
 * Test the Bedrock connection
 */
router.get('/test', async (_req: Request, res: Response) => {
  try {
    const isConnected = await testConnection();
    res.json({
      connected: isConnected,
      model: process.env.BEDROCK_MODEL_ID,
      region: process.env.AWS_REGION,
    });
  } catch (error) {
    res.status(500).json({
      connected: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

export default router;
