import { Request, Response, NextFunction } from 'express';

/**
 * PII Detection patterns for UK healthcare context
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
  dateOfBirth: /\b(?:dob|date of birth|born on)[\s:]*\d{1,2}[\/-]\d{1,2}[\/-]\d{2,4}\b/gi,

  // Full address patterns (simplified - looks for house number + street name patterns)
  streetAddress: /\b\d+\s+[A-Za-z]+\s+(?:street|road|lane|avenue|drive|close|way|court|place|crescent|terrace|gardens|grove|hill|park|square|mews|row|walk)\b/gi,
};

/**
 * Additional sensitive terms that might indicate PII context
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

interface PIIDetectionResult {
  detected: boolean;
  types: string[];
  message: string;
}

/**
 * Detect PII in a text string
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
 * Build a user-friendly warning message based on detected PII types
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
 * Express middleware to filter PII from incoming messages
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

// Export for testing
export { detectPII, PII_PATTERNS };
