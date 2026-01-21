import { Router, Request, Response } from 'express';
import OpenAI from 'openai';
import multer from 'multer';
import logger, { logError } from '../services/logger.js';

const router = Router();

// Initialize OpenAI client
const openai = process.env.OPENAI_API_KEY
  ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  : null;

// Configure multer for memory storage (audio files)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 25 * 1024 * 1024, // 25MB limit (Whisper API limit)
  },
  fileFilter: (_req, file, cb) => {
    // Accept common audio formats supported by Whisper
    const allowedMimeTypes = [
      'audio/webm',
      'audio/mp3',
      'audio/mpeg',
      'audio/wav',
      'audio/wave',
      'audio/x-wav',
      'audio/mp4',
      'audio/m4a',
      'audio/ogg',
      'audio/flac',
    ];

    if (allowedMimeTypes.includes(file.mimetype) || file.originalname.match(/\.(webm|mp3|wav|m4a|ogg|flac|mp4)$/i)) {
      cb(null, true);
    } else {
      cb(new Error(`Unsupported audio format: ${file.mimetype}`));
    }
  },
});

// Language code mapping for Whisper API
const LANGUAGE_MAP: Record<string, string> = {
  en: 'en',
  hi: 'hi',
  pa: 'pa',
  bn: 'bn',
  ur: 'ur',
  gu: 'gu',
  ta: 'ta',
};

/**
 * POST /api/transcribe
 * Transcribe audio to text using OpenAI Whisper API
 */
router.post('/', upload.single('audio'), async (req: Request, res: Response) => {
  try {
    // Check if OpenAI is configured
    if (!openai) {
      logger.warn('Transcription attempted without OpenAI API key', { requestId: req.requestId });
      res.status(503).json({
        error: 'Service Unavailable',
        message: 'Speech-to-text service is not configured',
      });
      return;
    }

    // Check if file was uploaded
    if (!req.file) {
      logger.debug('Transcription request missing audio file', { requestId: req.requestId });
      res.status(400).json({
        error: 'Bad Request',
        message: 'Audio file is required',
      });
      return;
    }

    // Get optional language hint from request body
    const languageHint = req.body.language ? LANGUAGE_MAP[req.body.language] : undefined;

    logger.debug('Processing transcription request', {
      requestId: req.requestId,
      fileSize: req.file.size,
      mimeType: req.file.mimetype,
      languageHint,
    });

    // Create a File object from the buffer for the OpenAI API
    const audioFile = new File(
      [req.file.buffer],
      req.file.originalname || 'audio.webm',
      { type: req.file.mimetype }
    );

    // Call OpenAI Whisper API
    const transcription = await openai.audio.transcriptions.create({
      file: audioFile,
      model: 'whisper-1',
      language: languageHint, // Optional - Whisper can auto-detect
      response_format: 'verbose_json', // Get detected language info
    });

    logger.debug('Transcription successful', {
      requestId: req.requestId,
      textLength: transcription.text?.length || 0,
      detectedLanguage: transcription.language,
    });

    res.status(200).json({
      text: transcription.text,
      language: transcription.language,
      duration: transcription.duration,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    logError(error as Error, { requestId: req.requestId, operation: 'transcribe' });

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

    // Handle multer errors
    if (error instanceof multer.MulterError) {
      if (error.code === 'LIMIT_FILE_SIZE') {
        res.status(400).json({
          error: 'File Too Large',
          message: 'Audio file must be less than 25MB',
        });
        return;
      }
    }

    res.status(500).json({
      error: 'Transcription Error',
      message: 'Unable to transcribe audio. Please try again.',
    });
  }
});

export default router;
