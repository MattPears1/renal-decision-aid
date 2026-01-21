import { Router, Request, Response } from 'express';
import OpenAI from 'openai';
import { piiFilter } from '../middleware/piiFilter.js';
import { chatRateLimiter } from '../middleware/rateLimiter.js';
import { sessionStore, ChatMessage } from '../services/sessionStore.js';
import logger, { apiLogger, logError } from '../services/logger.js';

const router = Router();

// Initialize OpenAI client (only if API key is available)
const openai = process.env.OPENAI_API_KEY
  ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  : null;

// System prompt for the AI assistant - Enhanced for multilingual kidney care expertise
const SYSTEM_PROMPT = `You are a compassionate NHS healthcare assistant specializing in kidney disease and renal replacement therapy options. You support patients in 7 languages: English, Hindi (हिंदी), Punjabi (ਪੰਜਾਬੀ), Bengali (বাংলা), Urdu (اردو), Gujarati (ગુજરાતી), and Tamil (தமிழ்).

CORE RESPONSIBILITIES:

1. **Treatment Education**: Provide clear, accurate information about kidney disease treatment options:
   - Haemodialysis (in-centre and home HD)
   - Peritoneal dialysis (CAPD and APD)
   - Kidney transplant (living and deceased donor)
   - Conservative management (supportive care)

2. **Patient Support**: Help patients understand benefits, risks, and lifestyle implications of each treatment. Support them in thinking through values and preferences for informed decision-making.

3. **Multilingual Communication**:
   - Respond in the same language the patient uses
   - Use culturally appropriate examples and explanations
   - Be aware of cultural considerations around kidney disease and treatment
   - Use simple, clear language avoiding complex medical jargon

4. **Communication Style**:
   - Be empathetic, patient-centered, and non-judgmental
   - Use plain language; explain medical terms when necessary
   - Be sensitive to the emotional impact of kidney disease
   - Acknowledge uncertainty and complexity when appropriate

5. **Clinical Expertise Areas**:
   - eGFR stages and what they mean (CKD stages 1-5)
   - Dialysis access: fistulas, grafts, PD catheters
   - Transplant evaluation and waiting list process
   - Diet and fluid management
   - Symptom management in kidney disease
   - Quality of life considerations

IMPORTANT GUIDELINES:
- NEVER diagnose conditions or recommend specific treatments
- ALWAYS encourage consultation with the patient's kidney care team
- Be culturally sensitive and inclusive across all communities
- Respect patient autonomy in decision-making
- If a question is outside your scope, acknowledge this and suggest appropriate NHS resources
- Keep responses concise but comprehensive (aim for 150-300 words unless more detail is needed)
- Use bullet points and clear structure for complex information`;

/**
 * POST /api/chat
 * Send a message and receive an AI response
 */
router.post('/', chatRateLimiter, piiFilter, async (req: Request, res: Response) => {
  try {
    const { message, sessionId } = req.body;

    // Validate request
    if (!message || typeof message !== 'string') {
      logger.debug('Invalid chat request: missing message', { requestId: req.requestId });
      res.status(400).json({
        error: 'Invalid Request',
        message: 'Message is required and must be a string',
      });
      return;
    }

    if (message.length > 2000) {
      logger.debug('Invalid chat request: message too long', {
        requestId: req.requestId,
        messageLength: message.length,
      });
      res.status(400).json({
        error: 'Invalid Request',
        message: 'Message must be 2000 characters or less',
      });
      return;
    }

    // Log incoming chat request
    apiLogger.chatRequest(sessionId, message.length, req.requestId);

    // Validate session if provided
    let session = null;
    if (sessionId) {
      session = sessionStore.get(sessionId);
      if (!session) {
        logger.debug('Chat request with invalid session', {
          requestId: req.requestId,
          sessionId,
        });
        res.status(404).json({
          error: 'Session Not Found',
          message: 'The provided session does not exist or has expired',
        });
        return;
      }
    }

    // Build conversation history for context
    const conversationHistory: Array<{ role: 'user' | 'assistant'; content: string }> = [];

    if (session?.chatHistory) {
      // Include last 10 messages for context
      const recentHistory = session.chatHistory.slice(-10);
      for (const msg of recentHistory) {
        conversationHistory.push({
          role: msg.role,
          content: msg.content,
        });
      }
    }

    // Add current message
    conversationHistory.push({
      role: 'user',
      content: message,
    });

    let assistantResponse: string;
    let modelUsed: string = 'fallback';

    if (openai) {
      // Use OpenAI API - GPT-4o for better multilingual support
      const model = process.env.OPENAI_MODEL || 'gpt-4o';
      modelUsed = model;

      logger.debug('Calling OpenAI API', {
        requestId: req.requestId,
        model,
        historyLength: conversationHistory.length,
      });

      const completion = await openai.chat.completions.create({
        model,
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          ...conversationHistory,
        ],
        max_completion_tokens: 1000,
        temperature: 0.7,
      });

      assistantResponse = completion.choices[0]?.message?.content ||
        'I apologize, but I was unable to generate a response. Please try again.';
    } else {
      // Fallback response when no API key is configured
      logger.debug('Using fallback response (no OpenAI key)', { requestId: req.requestId });
      assistantResponse = getFallbackResponse(message);
    }

    // Store messages in session if available
    if (session && sessionId) {
      const userMessage: ChatMessage = {
        id: `msg_${Date.now()}_user`,
        role: 'user',
        content: message,
        timestamp: new Date().toISOString(),
      };

      const assistantMessage: ChatMessage = {
        id: `msg_${Date.now()}_assistant`,
        role: 'assistant',
        content: assistantResponse,
        timestamp: new Date().toISOString(),
      };

      const updatedHistory = [...(session.chatHistory || []), userMessage, assistantMessage];
      sessionStore.update(sessionId, { chatHistory: updatedHistory });
    }

    // Log successful response
    apiLogger.chatResponse(sessionId, assistantResponse.length, modelUsed, req.requestId);

    res.status(200).json({
      response: assistantResponse,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    // Log the error
    apiLogger.chatError(error as Error, req.body?.sessionId, req.requestId);

    // Check for OpenAI-specific errors
    if (error instanceof OpenAI.APIError) {
      apiLogger.openaiError(error.status || 0, error.message, req.requestId);

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
          message: 'The AI service is not properly configured.',
        });
        return;
      }
    }

    logError(error as Error, { requestId: req.requestId, operation: 'chat' });

    res.status(500).json({
      error: 'Chat Error',
      message: 'Unable to process your message. Please try again.',
    });
  }
});

/**
 * Fallback responses when OpenAI API is not available
 */
function getFallbackResponse(message: string): string {
  const lowerMessage = message.toLowerCase();

  if (lowerMessage.includes('dialysis') || lowerMessage.includes('haemodialysis')) {
    return `Dialysis is a treatment that helps filter waste products and excess fluid from your blood when your kidneys can no longer do this effectively. There are two main types:

**Haemodialysis** - Blood is filtered through a machine, usually done at a dialysis centre 3 times a week for about 4 hours each session. Home haemodialysis is also an option for some patients.

**Peritoneal Dialysis** - Uses the lining of your abdomen to filter blood inside your body. This can be done at home and gives you more flexibility.

Would you like to know more about either of these options? Remember to discuss any treatment decisions with your healthcare team.`;
  }

  if (lowerMessage.includes('transplant')) {
    return `A kidney transplant involves receiving a healthy kidney from either a living or deceased donor. It's often considered the best treatment for kidney failure when suitable, as it can provide a better quality of life compared to dialysis.

**Living donor transplant** - A kidney from a living person, often a family member or friend. These tend to last longer and can be planned in advance.

**Deceased donor transplant** - A kidney from someone who has died. This requires joining a waiting list.

Not everyone is suitable for a transplant, and your healthcare team will assess your individual situation. Would you like to know more about the transplant process?`;
  }

  if (lowerMessage.includes('conservative') || lowerMessage.includes('supportive care')) {
    return `Conservative management (sometimes called supportive care) is an option for people who choose not to have dialysis or a transplant. This approach focuses on:

- Managing symptoms and maintaining quality of life
- Treating complications of kidney disease
- Providing emotional and practical support
- Planning for the future

This is a valid choice, especially for older people or those with other serious health conditions. Your healthcare team can provide comprehensive supportive care to help you live as well as possible.

Would you like to discuss what conservative management might involve?`;
  }

  if (lowerMessage.includes('hello') || lowerMessage.includes('hi') || lowerMessage.includes('help')) {
    return `Hello! I'm here to help you learn about kidney disease treatment options and support you in thinking through your choices.

I can provide information about:
- **Dialysis** (haemodialysis and peritoneal dialysis)
- **Kidney transplant** (living and deceased donor)
- **Conservative management**
- **Questions to discuss with your healthcare team**

What would you like to know more about?`;
  }

  return `Thank you for your question. I'm here to help you understand your kidney treatment options.

The main treatment choices for kidney failure include:
1. **Haemodialysis** - Filtering blood using a machine
2. **Peritoneal dialysis** - Filtering blood using the lining of your abdomen
3. **Kidney transplant** - Receiving a healthy kidney from a donor
4. **Conservative management** - Supportive care without dialysis

Each option has different benefits and considerations depending on your individual situation, lifestyle, and preferences.

Would you like to explore any of these options in more detail? Remember, any decisions about treatment should always be discussed with your healthcare team.`;
}

export default router;
