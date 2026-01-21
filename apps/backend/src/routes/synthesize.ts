/**
 * @fileoverview Text-to-speech synthesis endpoint for the NHS Renal Decision Aid.
 * Converts text responses to speech audio using OpenAI's TTS API to enable
 * voice-based interaction and accessibility support.
 *
 * @module routes/synthesize
 * @version 2.5.0
 * @since 1.0.0
 * @lastModified 21 January 2026
 *
 * @requires express
 * @requires openai
 * @requires ../services/logger
 *
 * @see {@link module:routes/transcribe} for speech-to-text functionality
 */

import { Router, Request, Response } from 'express';
import OpenAI from 'openai';
import logger, { logError } from '../services/logger.js';

/**
 * Express router instance for text-to-speech endpoints.
 * @type {Router}
 */
const router = Router();

/**
 * OpenAI client instance for TTS API calls.
 * @type {OpenAI | null}
 */
const openai = process.env.OPENAI_API_KEY
  ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  : null;

/**
 * Available TTS voice options from OpenAI.
 * @typedef {'alloy' | 'nova' | 'shimmer' | 'echo' | 'fable' | 'onyx'} TTSVoice
 */
type TTSVoice = 'alloy' | 'nova' | 'shimmer' | 'echo' | 'fable' | 'onyx';

/**
 * Language-to-voice mapping for optimal multilingual support.
 * Uses "alloy" as default for non-English languages due to best multilingual support.
 * @constant {Record<string, TTSVoice>}
 */
const LANGUAGE_VOICE_MAP: Record<string, TTSVoice> = {
  en: 'nova',    // English - nova has a warm, friendly tone
  hi: 'alloy',   // Hindi
  pa: 'alloy',   // Punjabi
  bn: 'alloy',   // Bengali
  ur: 'alloy',   // Urdu
  gu: 'alloy',   // Gujarati
  ta: 'alloy',   // Tamil
};

/**
 * Available TTS model options from OpenAI.
 * @typedef {'gpt-4o-mini-tts' | 'tts-1' | 'tts-1-hd'} TTSModel
 */
type TTSModel = 'gpt-4o-mini-tts' | 'tts-1' | 'tts-1-hd';

/**
 * Convert text to speech using OpenAI TTS API.
 *
 * POST /api/synthesize
 *
 * @async
 * @function
 * @param {Request} req - Express request object
 * @param {string} req.body.text - Text to convert (required, max 4096 characters)
 * @param {string} [req.body.language] - Language code for voice selection
 * @param {TTSVoice} [req.body.voice] - Specific voice to use
 * @param {TTSModel} [req.body.model] - TTS model to use
 * @param {number} [req.body.speed] - Speech speed (0.25 to 4.0, default 1.0)
 * @param {Response} res - Express response object
 * @returns {Promise<void>} MP3 audio stream
 *
 * @throws {400} Bad Request - Text missing or too long
 * @throws {429} Rate Limited - Too many requests
 * @throws {500} Synthesis Error - API or processing error
 * @throws {503} Service Unavailable - OpenAI not configured
 *
 * @example
 * // Request
 * POST /api/synthesize
 * {
 *   "text": "Hello, how can I help you today?",
 *   "language": "en",
 *   "speed": 1.0
 * }
 *
 * // Response: audio/mpeg stream
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

    // Determine model - default to gpt-4o-mini-tts
    const selectedModel: TTSModel = model === 'tts-1-hd' ? 'tts-1-hd' : model === 'tts-1' ? 'tts-1' : 'gpt-4o-mini-tts';

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
 * Get list of available TTS voices and models.
 *
 * GET /api/synthesize/voices
 *
 * @function
 * @param {Request} _req - Express request object (unused)
 * @param {Response} res - Express response object
 * @returns {void} JSON response with available voices and models
 *
 * @example
 * // Response
 * {
 *   "voices": [
 *     { "id": "alloy", "name": "Alloy", "description": "Neutral, versatile - best for multilingual" },
 *     ...
 *   ],
 *   "languageDefaults": { "en": "nova", "hi": "alloy", ... },
 *   "models": [
 *     { "id": "gpt-4o-mini-tts", "name": "GPT-4o Mini TTS", "description": "Latest, best quality" },
 *     ...
 *   ]
 * }
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
      { id: 'gpt-4o-mini-tts', name: 'GPT-4o Mini TTS', description: 'Latest, best quality' },
      { id: 'tts-1', name: 'Standard', description: 'Fast, lower latency' },
      { id: 'tts-1-hd', name: 'HD', description: 'Higher quality audio' },
    ],
  });
});

/**
 * Validate if a string is a valid TTS voice option.
 *
 * @function isValidVoice
 * @param {string} voice - Voice string to validate
 * @returns {boolean} True if voice is valid TTSVoice type
 */
function isValidVoice(voice: string): voice is TTSVoice {
  return ['alloy', 'nova', 'shimmer', 'echo', 'fable', 'onyx'].includes(voice);
}

export default router;
