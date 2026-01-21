import { Router, Request, Response } from 'express';
import OpenAI from 'openai';
import logger, { logError } from '../services/logger.js';

const router = Router();

// Initialize OpenAI client
const openai = process.env.OPENAI_API_KEY
  ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  : null;

// Voice selection - "alloy" works best for multilingual content
// Other options: nova, shimmer, echo, fable, onyx
type TTSVoice = 'alloy' | 'nova' | 'shimmer' | 'echo' | 'fable' | 'onyx';

// Language-to-voice mapping
// Using "alloy" as default for all languages as it has best multilingual support
const LANGUAGE_VOICE_MAP: Record<string, TTSVoice> = {
  en: 'nova',    // English - nova has a warm, friendly tone
  hi: 'alloy',   // Hindi
  pa: 'alloy',   // Punjabi
  bn: 'alloy',   // Bengali
  ur: 'alloy',   // Urdu
  gu: 'alloy',   // Gujarati
  ta: 'alloy',   // Tamil
};

// TTS models available
type TTSModel = 'tts-1' | 'tts-1-hd';

/**
 * POST /api/synthesize
 * Convert text to speech using OpenAI TTS API
 */
router.post('/', async (req: Request, res: Response) => {
  try {
    // Check if OpenAI is configured
    if (!openai) {
      logger.warn('Synthesis attempted without OpenAI API key', { requestId: req.requestId });
      res.status(503).json({
        error: 'Service Unavailable',
        message: 'Text-to-speech service is not configured',
      });
      return;
    }

    const { text, language, voice, model, speed } = req.body;

    // Validate text input
    if (!text || typeof text !== 'string') {
      logger.debug('Synthesis request missing text', { requestId: req.requestId });
      res.status(400).json({
        error: 'Bad Request',
        message: 'Text is required and must be a string',
      });
      return;
    }

    // OpenAI TTS has a 4096 character limit
    if (text.length > 4096) {
      logger.debug('Synthesis text too long', {
        requestId: req.requestId,
        textLength: text.length,
      });
      res.status(400).json({
        error: 'Bad Request',
        message: 'Text must be 4096 characters or less',
      });
      return;
    }

    // Determine voice based on language or use provided voice
    const selectedVoice: TTSVoice = voice && isValidVoice(voice)
      ? voice
      : LANGUAGE_VOICE_MAP[language] || 'alloy';

    // Determine model (tts-1 for speed, tts-1-hd for quality)
    const selectedModel: TTSModel = model === 'tts-1-hd' ? 'tts-1-hd' : 'tts-1';

    // Speed control (0.25 to 4.0, default 1.0)
    const selectedSpeed = typeof speed === 'number'
      ? Math.max(0.25, Math.min(4.0, speed))
      : 1.0;

    logger.debug('Processing synthesis request', {
      requestId: req.requestId,
      textLength: text.length,
      language,
      voice: selectedVoice,
      model: selectedModel,
      speed: selectedSpeed,
    });

    // Call OpenAI TTS API
    const mp3Response = await openai.audio.speech.create({
      model: selectedModel,
      voice: selectedVoice,
      input: text,
      speed: selectedSpeed,
      response_format: 'mp3',
    });

    logger.debug('Synthesis successful', {
      requestId: req.requestId,
      contentType: mp3Response.headers?.get?.('content-type') || 'audio/mpeg',
    });

    // Get the audio data as ArrayBuffer
    const audioBuffer = await mp3Response.arrayBuffer();

    // Set response headers for audio streaming
    res.set({
      'Content-Type': 'audio/mpeg',
      'Content-Length': audioBuffer.byteLength.toString(),
      'Cache-Control': 'no-cache',
      'X-Voice-Used': selectedVoice,
      'X-Model-Used': selectedModel,
    });

    // Send the audio buffer
    res.send(Buffer.from(audioBuffer));
  } catch (error) {
    logError(error as Error, { requestId: req.requestId, operation: 'synthesize' });

    // Check for OpenAI-specific errors
    if (error instanceof OpenAI.APIError) {
      if (error.status === 429) {
        res.status(429).json({
          error: 'Rate Limited',
          message: 'Too many requests. Please wait a moment and try again.',
        });
        return;
      }
      if (error.status === 401) {
        res.status(500).json({
          error: 'Configuration Error',
          message: 'The speech service is not properly configured.',
        });
        return;
      }
    }

    res.status(500).json({
      error: 'Synthesis Error',
      message: 'Unable to generate speech. Please try again.',
    });
  }
});

/**
 * GET /api/synthesize/voices
 * Get list of available voices
 */
router.get('/voices', (_req: Request, res: Response) => {
  res.status(200).json({
    voices: [
      { id: 'alloy', name: 'Alloy', description: 'Neutral, versatile - best for multilingual' },
      { id: 'nova', name: 'Nova', description: 'Warm, friendly - great for English' },
      { id: 'shimmer', name: 'Shimmer', description: 'Clear, expressive' },
      { id: 'echo', name: 'Echo', description: 'Balanced, natural' },
      { id: 'fable', name: 'Fable', description: 'Engaging, storytelling' },
      { id: 'onyx', name: 'Onyx', description: 'Deep, authoritative' },
    ],
    languageDefaults: LANGUAGE_VOICE_MAP,
    models: [
      { id: 'tts-1', name: 'Standard', description: 'Fast, lower latency' },
      { id: 'tts-1-hd', name: 'HD', description: 'Higher quality audio' },
    ],
  });
});

// Helper function to validate voice
function isValidVoice(voice: string): voice is TTSVoice {
  return ['alloy', 'nova', 'shimmer', 'echo', 'fable', 'onyx'].includes(voice);
}

export default router;
