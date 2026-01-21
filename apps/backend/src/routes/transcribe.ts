/**
 * @fileoverview Speech-to-text transcription endpoint for the NHS Renal Decision Aid.
 * Converts audio recordings to text using OpenAI's Whisper API to enable
 * voice-based interaction with the decision support tool.
 *
 * @module routes/transcribe
 * @version 2.5.0
 * @since 1.0.0
 * @lastModified 21 January 2026
 *
 * @requires express
 * @requires openai
 * @requires multer
 * @requires ../services/logger
 *
 * @see {@link module:routes/synthesize} for text-to-speech functionality
 */

import { Router, Request, Response } from 'express';
import OpenAI from 'openai';
import multer from 'multer';
import logger, { logError } from '../services/logger.js';

/**
 * Express router instance for transcription endpoints.
 * @type {Router}
 */
const router = Router();

/**
 * OpenAI client instance for Whisper API calls.
 * @type {OpenAI | null}
 */
const openai = process.env.OPENAI_API_KEY
  ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  : null;

/**
 * Multer upload configuration for handling audio file uploads.
 * Uses memory storage with a 25MB file size limit (Whisper API limit).
 * Accepts common audio formats: webm, mp3, wav, m4a, ogg, flac, mp4.
 * @type {multer.Multer}
 */
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

/**
 * Language code mapping for Whisper API.
 * Maps application language codes to Whisper-supported language codes.
 * @constant {Record<string, string>}
 */
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
 * Transcribe audio to text using OpenAI Whisper API.
 *
 * POST /api/transcribe
 *
 * @async
 * @function
 * @param {Request} req - Express request object
 * @param {Express.Multer.File} req.file - Audio file uploaded via multipart form
 * @param {string} [req.body.language] - Optional language hint for transcription
 * @param {Response} res - Express response object
 * @returns {Promise<void>} JSON response with transcribed text
 *
 * @throws {400} Bad Request - No audio file provided
 * @throws {400} File Too Large - Audio exceeds 25MB limit
 * @throws {429} Rate Limited - Too many requests
 * @throws {500} Transcription Error - API or processing error
 * @throws {503} Service Unavailable - OpenAI not configured
 *
 * @example
 * // Request (multipart/form-data)
 * POST /api/transcribe
 * audio: [binary audio file]
 * language: "en"
 *
 * // Response
 * {
 *   "text": "What is peritoneal dialysis?",
 *   "language": "en",
 *   "duration": 3.5,
 *   "timestamp": "2026-01-21T10:30:00.000Z"
 * }
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

    // Call OpenAI Speech-to-Text API
    const transcription = await openai.audio.transcriptions.create({
      file: audioFile,
      model: 'gpt-4o-transcribe',
      language: languageHint, // Optional - can auto-detect
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
