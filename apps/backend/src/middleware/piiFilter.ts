/**
 * @fileoverview PII (Personally Identifiable Information) filtering middleware.
 * Detects and blocks messages containing sensitive personal information
 * to protect user privacy in the NHS Renal Decision Aid.
 *
 * @module middleware/piiFilter
 * @version 2.5.0
 * @since 1.0.0
 * @lastModified 21 January 2026
 *
 * @requires express
 *
 * @see {@link module:routes/chat} for chat endpoint using this middleware
 */

import { Request, Response, NextFunction } from 'express';

/**
 * Regular expression patterns for detecting UK-specific PII.
 * Includes patterns for NHS numbers, phone numbers, postcodes, and more.
 * @constant {Record<string, RegExp>}
 */
const PII_PATTERNS = {
  // NHS Number: 10 digits, often formatted as XXX XXX XXXX
  nhsNumber: /\b\d{3}[\s-]?\d{3}[\s-]?\d{4}\b/g,

  // UK Phone numbers: various formats
  ukPhone: /\b(?:(?:\+44\s?|0)(?:7\d{3}|\d{4})[\s-]?\d{3}[\s-]?\d{3,4})\b/g,

  // UK Postcodes
  ukPostcode: /\b[A-Z]{1,2}\d[A-Z\d]?\s*\d[A-Z]{2}\b/gi,

  // Email addresses
  email: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g,

  // National Insurance Number
  nationalInsurance: /\b[A-CEGHJ-PR-TW-Z]{2}\s?\d{2}\s?\d{2}\s?\d{2}\s?[A-D]\b/gi,

  // UK Bank account numbers (8 digits) - basic pattern
  bankAccount: /\b\d{8}\b/g,

  // Sort codes (XX-XX-XX format)
  sortCode: /\b\d{2}[-\s]?\d{2}[-\s]?\d{2}\b/g,

  // Date of birth patterns (DD/MM/YYYY, DD-MM-YYYY)
  dateOfBirth: /\b(?:dob|date of birth|born on)[\s:]*\d{1,2}[/-]\d{1,2}[/-]\d{2,4}\b/gi,

  // Full address patterns (simplified - looks for house number + street name patterns)
  streetAddress: /\b\d+\s+[A-Za-z]+\s+(?:street|road|lane|avenue|drive|close|way|court|place|crescent|terrace|gardens|grove|hill|park|square|mews|row|walk)\b/gi,
};

/**
 * Phrases that indicate the user is about to share personal information.
 * Used for context-aware PII detection.
 * @constant {string[]}
 */
const SENSITIVE_CONTEXT_TERMS = [
  'my address is',
  'i live at',
  'my phone number is',
  'my mobile is',
  'call me on',
  'my nhs number is',
  'my ni number is',
  'my national insurance',
  'my bank details',
  'my account number',
  'my sort code',
];

/**
 * Result of PII detection analysis.
 * @interface PIIDetectionResult
 * @property {boolean} detected - Whether PII was detected
 * @property {string[]} types - Types of PII detected
 * @property {string} message - User-friendly warning message
 */
interface PIIDetectionResult {
  detected: boolean;
  types: string[];
  message: string;
}

/**
 * Detect personally identifiable information in a text string.
 * Uses pattern matching and context analysis to identify sensitive data.
 *
 * @function detectPII
 * @param {string} text - Text to analyze for PII
 * @returns {PIIDetectionResult} Detection result with types and warning message
 *
 * @example
 * const result = detectPII("My NHS number is 123 456 7890");
 * // result.detected === true
 * // result.types === ['nhsNumber']
 */
function detectPII(text: string): PIIDetectionResult {
  const detectedTypes: string[] = [];
  const lowerText = text.toLowerCase();

  // Check for pattern matches
  for (const [type, pattern] of Object.entries(PII_PATTERNS)) {
    // Reset regex lastIndex for global patterns
    pattern.lastIndex = 0;

    if (pattern.test(text)) {
      // Special handling for bank account to reduce false positives
      // Only flag if in context of banking language
      if (type === 'bankAccount') {
        if (lowerText.includes('account') || lowerText.includes('bank') || lowerText.includes('sort code')) {
          detectedTypes.push(type);
        }
      } else if (type === 'sortCode') {
        if (lowerText.includes('sort') || lowerText.includes('bank') || lowerText.includes('account')) {
          detectedTypes.push(type);
        }
      } else {
        detectedTypes.push(type);
      }
    }
  }

  // Check for sensitive context terms
  for (const term of SENSITIVE_CONTEXT_TERMS) {
    if (lowerText.includes(term)) {
      detectedTypes.push('sensitiveContext');
      break;
    }
  }

  if (detectedTypes.length > 0) {
    return {
      detected: true,
      types: [...new Set(detectedTypes)], // Remove duplicates
      message: buildWarningMessage(detectedTypes),
    };
  }

  return {
    detected: false,
    types: [],
    message: '',
  };
}

/**
 * Build a user-friendly warning message based on detected PII types.
 * Generates grammatically correct messages for single or multiple types.
 *
 * @function buildWarningMessage
 * @param {string[]} types - Array of detected PII type identifiers
 * @returns {string} Human-readable warning message
 */
function buildWarningMessage(types: string[]): string {
  const typeMessages: Record<string, string> = {
    nhsNumber: 'NHS number',
    ukPhone: 'phone number',
    ukPostcode: 'postcode',
    email: 'email address',
    nationalInsurance: 'National Insurance number',
    bankAccount: 'bank account number',
    sortCode: 'sort code',
    dateOfBirth: 'date of birth',
    streetAddress: 'street address',
    sensitiveContext: 'personal information',
  };

  const detectedItems = types
    .map((type) => typeMessages[type] || type)
    .filter((item, index, self) => self.indexOf(item) === index);

  if (detectedItems.length === 1) {
    return `Your message appears to contain a ${detectedItems[0]}. For your privacy and security, please do not share personal identifying information in this chat.`;
  }

  const lastItem = detectedItems.pop();
  return `Your message appears to contain ${detectedItems.join(', ')} and ${lastItem}. For your privacy and security, please do not share personal identifying information in this chat.`;
}

/**
 * Express middleware to filter PII from incoming chat messages.
 * Returns 400 error with warning if PII is detected.
 *
 * @function piiFilter
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 * @param {NextFunction} next - Express next middleware function
 * @returns {void}
 *
 * @example
 * // Usage in route
 * router.post('/chat', piiFilter, async (req, res) => { ... });
 */
export function piiFilter(req: Request, res: Response, next: NextFunction): void {
  const { message } = req.body;

  if (!message || typeof message !== 'string') {
    next();
    return;
  }

  const result = detectPII(message);

  if (result.detected) {
    res.status(400).json({
      error: 'Personal Information Detected',
      message: result.message,
      code: 'PII_DETECTED',
      detectedTypes: result.types,
    });
    return;
  }

  next();
}

/**
 * Export detectPII function and PII_PATTERNS for testing.
 * @see detectPII
 * @see PII_PATTERNS
 */
export { detectPII, PII_PATTERNS };
