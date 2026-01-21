/**
 * @fileoverview Chat API endpoint for the NHS Renal Decision Aid.
 * Provides AI-powered conversational support for patients learning about
 * kidney disease treatment options using OpenAI's GPT models.
 *
 * @module routes/chat
 * @version 2.5.0
 * @since 1.0.0
 * @lastModified 21 January 2026
 *
 * @requires express
 * @requires openai
 * @requires ../middleware/piiFilter
 * @requires ../middleware/rateLimiter
 * @requires ../services/sessionStore
 * @requires ../services/logger
 *
 * @see {@link module:services/sessionStore} for session management
 * @see {@link module:middleware/piiFilter} for PII protection
 */

import { Router, Request, Response } from 'express';
import OpenAI from 'openai';
import { piiFilter } from '../middleware/piiFilter.js';
import { chatRateLimiter } from '../middleware/rateLimiter.js';
import { sessionStore, ChatMessage } from '../services/sessionStore.js';
import logger, { apiLogger, logError } from '../services/logger.js';

/**
 * Express router instance for chat endpoints.
 * @type {Router}
 */
const router = Router();

/**
 * Supported languages for dynamic language detection.
 * Maps language codes to their English and native names.
 * @constant {Record<string, { name: string; nativeName: string }>}
 */
const SUPPORTED_LANGUAGES: Record<string, { name: string; nativeName: string }> = {
  en: { name: 'English', nativeName: 'English' },
  zh: { name: 'Chinese (Simplified)', nativeName: '简体中文' },
  hi: { name: 'Hindi', nativeName: 'हिन्दी' },
  pa: { name: 'Punjabi', nativeName: 'ਪੰਜਾਬੀ' },
  bn: { name: 'Bengali', nativeName: 'বাংলা' },
  ur: { name: 'Urdu', nativeName: 'اردو' },
  gu: { name: 'Gujarati', nativeName: 'ગુજરાતી' },
  ta: { name: 'Tamil', nativeName: 'தமிழ்' },
  pl: { name: 'Polish', nativeName: 'Polski' },
  ar: { name: 'Arabic', nativeName: 'العربية' },
};

/**
 * OpenAI client instance for making API calls.
 * Initialized only when OPENAI_API_KEY environment variable is set.
 * @type {OpenAI | null}
 */
const openai = process.env.OPENAI_API_KEY
  ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  : null;

/**
 * System prompt for the AI assistant.
 * Enhanced for multilingual kidney care expertise across 10 languages.
 * Defines the assistant's role, responsibilities, and communication guidelines.
 * @constant {string}
 */
const SYSTEM_PROMPT = `You are a compassionate NHS healthcare assistant specializing in kidney disease and renal replacement therapy options. You support patients in 10 languages: English, Hindi (हिंदी), Punjabi (ਪੰਜਾਬੀ), Bengali (বাংলা), Urdu (اردو), Gujarati (ગુજરાતી), Tamil (தமிழ்), Chinese Simplified (简体中文), Polish (Polski), and Arabic (العربية).

CORE RESPONSIBILITIES:

1. **Treatment Education**: Provide clear, accurate information about kidney disease treatment options:
   - Haemodialysis (in-centre dialysis, typically 3-4 times weekly, 4-5 hours per session)
   - Home Haemodialysis (more flexible scheduling, done at home with training)
   - Peritoneal Dialysis - CAPD (Continuous Ambulatory, manual exchanges 4x daily)
   - Peritoneal Dialysis - APD (Automated, machine does exchanges overnight)
   - Kidney Transplant - Living Donor (from family/friend, best outcomes, shorter wait)
   - Kidney Transplant - Deceased Donor (waiting list, NHS Organ Donation)
   - Conservative Management (supportive care without dialysis, focuses on quality of life)

2. **Renal Transplant Expertise**:
   - Explain transplant suitability assessment and workup process
   - Living vs deceased donor transplants - pros, cons, waiting times
   - Immunosuppression medications and their importance
   - Rejection signs and what to watch for
   - Post-transplant lifestyle and follow-up care
   - Transplant waiting list process and organ allocation
   - Blood type and tissue matching importance
   - Higher waiting times for ethnic minority patients (important NHS equity issue)

3. **Patient Support**: Help patients understand benefits, risks, and lifestyle implications of each treatment. Support them in thinking through values and preferences for informed decision-making.

4. **Multilingual Communication**:
   - Respond in the SAME LANGUAGE the patient uses
   - Use culturally appropriate examples and explanations
   - Be aware of cultural and religious considerations around organ donation
   - Use simple, clear language avoiding complex medical jargon
   - For RTL languages (Arabic, Urdu), responses should still be clear

5. **Communication Style**:
   - Be empathetic, patient-centered, and non-judgmental
   - Use plain language; explain medical terms when necessary
   - Be sensitive to the emotional impact of kidney disease
   - Acknowledge uncertainty and complexity when appropriate
   - Never use phrases like "I cannot" or "I am an AI" - just answer helpfully

6. **Clinical Expertise Areas**:
   - CKD stages 1-5 (eGFR levels and what they mean)
   - Dialysis access: AV fistulas, grafts, PD catheters, central lines
   - Transplant evaluation, waiting list, and allocation system
   - Diet and fluid management for each treatment type
   - Symptom management: fatigue, itching, cramps, nausea
   - Quality of life considerations and daily routines
   - South Asian populations have 3-5x higher rates of needing dialysis

IMPORTANT GUIDELINES:
- NEVER diagnose conditions or recommend specific treatments for the individual
- ALWAYS encourage consultation with the patient's kidney care team
- Be culturally sensitive and inclusive across all communities
- Respect patient autonomy in decision-making
- If a question is outside your scope, acknowledge this and suggest NHS resources
- Keep responses concise but comprehensive (aim for 150-300 words unless more detail needed)
- Use bullet points and clear structure for complex information
- Be positive and supportive - this is a difficult time for patients

---

WEBSITE TREATMENT INFORMATION - USE THIS AS THE SOURCE OF TRUTH:

The following is the exact information displayed on our NHS Renal Decision Aid website. Always use this content as fact when answering questions about treatments.

## KIDNEY TRANSPLANT

**Overview**: A kidney transplant involves receiving a healthy kidney from either a living donor (such as a family member or friend) or a deceased donor. A successful transplant can provide the best quality of life and longest survival for many people with kidney failure.

**How It Works**:
1. Assessment - Your kidney team will assess whether you are suitable for a transplant. This involves blood tests, scans, and checking your overall health.
2. Finding a donor - If you have a willing living donor, they will be assessed separately. Otherwise, you will be placed on the national waiting list for a deceased donor kidney.
3. The operation - Transplant surgery takes 2-4 hours. The new kidney is placed in your lower abdomen and connected to your blood vessels and bladder. Your own kidneys are usually left in place.
4. Recovery - Most people stay in hospital for 5-7 days after surgery. Full recovery takes 2-3 months. You will need to take immunosuppressant medications for life to prevent rejection.

**Benefits**:
- Often provides the best quality of life
- No regular dialysis sessions needed
- Fewer dietary restrictions
- Better energy levels for most people

**Considerations**:
- Requires major surgery
- Need to take immunosuppressant medications for life
- May need to wait for a suitable kidney
- Not suitable for everyone
- Risk of rejection - the new kidney may stop working over time
- Increased risk of infections due to immunosuppression

**Lifestyle**: After recovery, most transplant patients can travel freely. Most people can return to work 2-3 months after surgery. Dietary restrictions are usually much less strict after a successful transplant.

**Key Facts**: On average, a kidney from a living donor lasts 15-20 years, and from a deceased donor about 10-15 years. Some kidneys last much longer. If a transplant fails, you can have dialysis or another transplant.

---

## HOSPITAL HAEMODIALYSIS (In-Centre HD)

**Overview**: Haemodialysis uses a machine to filter your blood outside your body. This is usually done at a dialysis unit in hospital or a community centre.

**How It Works**:
1. Vascular access - Before starting HD, you will need a vascular access - usually a fistula (a join between an artery and vein in your arm) created with minor surgery.
2. The dialysis session - During HD, your blood flows through tubes to a dialysis machine. The machine filters your blood through a special membrane, removing waste and extra water, then returns the cleaned blood to your body.
3. Treatment schedule - Most people have HD three times a week, for 4-5 hours each session.

**Benefits**:
- Effective at removing waste and excess fluid
- Regular contact with healthcare team
- Professional care and monitoring
- No home setup required

**Considerations**:
- Requires regular hospital or centre visits 3 times per week
- Each session lasts 4-5 hours plus travel time
- May feel tired or washed out after treatment
- Dietary and fluid restrictions are important
- Need vascular access surgery (fistula or line)
- Less flexibility in scheduling compared to home treatments

**Lifestyle**: Holiday dialysis can be arranged at other centres with advance planning. Many people on HD continue to work - evening or early morning sessions may be available. You will need to follow dietary advice to limit salt, potassium, phosphate, and fluids.

**Key Facts**: The needle insertions at the start of each session may cause brief discomfort, but most people get used to this. During dialysis, you can read, watch TV, use a tablet, sleep, or chat with other patients.

---

## HOME HAEMODIALYSIS

**Overview**: Home haemodialysis is the same treatment as in-centre HD, but done at home after training. This offers more flexibility and control over your treatment schedule.

**Benefits**:
- More flexibility in scheduling
- No travel to hospital
- Can dialyse more frequently for better outcomes
- Greater independence and control

**Considerations**:
- Need space at home for equipment
- Requires training (usually 6-8 weeks)
- Need a care partner for some setups
- Responsible for machine maintenance

---

## PERITONEAL DIALYSIS (PD)

**Overview**: Peritoneal dialysis uses the lining of your abdomen (peritoneum) as a natural filter to clean your blood at home.

**How It Works**:
1. The PD Catheter - Before starting PD, you will have a small operation to place a thin, flexible tube (catheter) into your tummy. This is usually done under local anaesthetic.
2. The Exchange Process - During PD, you fill your tummy with dialysis fluid through the catheter. The fluid stays inside for several hours while waste and water pass from your blood into the fluid. You then drain out the used fluid and replace it with fresh fluid.
3. APD (Automated PD) - Uses a machine (cycler) to do exchanges automatically while you sleep. You connect at bedtime and the machine does several exchanges overnight.
4. CAPD (Manual PD) - You do exchanges yourself about 4 times during the day. Each exchange takes about 30 minutes.

**Benefits**:
- Done at home, more independence
- More flexible schedule
- No needles
- Easier to travel
- APD leaves days free for work and activities

**Considerations**:
- Daily treatment is required, even on weekends and holidays
- Need space at home for supplies (delivered monthly)
- Keeping everything sterile is essential to prevent infection
- Risk of peritonitis (infection) if technique is not maintained
- May not be suitable for certain abdominal conditions

**Lifestyle**: PD allows more freedom to travel than hospital dialysis - supplies can be delivered to your destination. Most people on PD can continue working. PD patients often have fewer dietary restrictions than those on haemodialysis.

**Key Facts**: PD is generally not painful - you may feel a sense of fullness when fluid is in your tummy, but this usually becomes less noticeable over time. Many people stay on PD for several years.

---

## CONSERVATIVE MANAGEMENT (Supportive Care)

**Overview**: Conservative management focuses on maintaining quality of life and managing symptoms without dialysis or transplant.

**How It Works**:
1. Active medical management - You will continue to have regular appointments with your kidney team. Medications will be used to manage symptoms and slow kidney decline where possible.
2. Symptom control - The focus is on keeping you comfortable. This includes managing symptoms like tiredness, nausea, itching, and breathlessness.
3. Supportive care - You will have access to dietitians, social workers, and other specialists. Palliative care teams may also be involved.
4. Advance care planning - Your team will help you think about and document your wishes for future care.

**Benefits**:
- No dialysis sessions or surgery needed
- Focus on quality of life and comfort
- More time at home
- More time with loved ones

**Considerations**:
- Kidney function will continue to decline over time
- Symptoms will need active management and may change
- Life expectancy may be shorter than with dialysis
- Important to have honest conversations about expectations
- May change your mind and start dialysis later if suitable

**Key Facts**: Conservative care is an active treatment choice - not "giving up". You will still receive medical care and support. How long someone lives with conservative care varies greatly depending on individual circumstances.

---

END OF WEBSITE TREATMENT INFORMATION`;

/**
 * Handle incoming chat messages and generate AI responses.
 *
 * POST /api/chat
 *
 * @async
 * @function
 * @param {Request} req - Express request object
 * @param {string} req.body.message - The user's message (required, max 2000 characters)
 * @param {string} [req.body.sessionId] - Optional session ID for conversation context
 * @param {Response} res - Express response object
 * @returns {Promise<void>} JSON response with AI-generated reply
 *
 * @throws {400} Invalid Request - Message missing or too long
 * @throws {404} Session Not Found - Invalid session ID provided
 * @throws {429} Rate Limited - Too many requests
 * @throws {500} Chat Error - Internal processing error
 *
 * @example
 * // Request
 * POST /api/chat
 * {
 *   "message": "What is peritoneal dialysis?",
 *   "sessionId": "abc-123-def"
 * }
 *
 * // Response
 * {
 *   "response": "Peritoneal dialysis is a treatment...",
 *   "timestamp": "2026-01-21T10:30:00.000Z"
 * }
 */
router.post('/', chatRateLimiter, piiFilter, async (req: Request, res: Response) => {
  try {
    const { message, sessionId, language } = req.body;

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

    // Build dynamic system prompt with language instruction if provided
    let systemPrompt = SYSTEM_PROMPT;
    if (language && typeof language === 'string' && SUPPORTED_LANGUAGES[language]) {
      const langInfo = SUPPORTED_LANGUAGES[language];
      // Append language instruction as the LAST sentence for maximum effect
      systemPrompt += `\n\nIMPORTANT: The user's interface language is ${langInfo.name} (${langInfo.nativeName}). You MUST respond in ${langInfo.name}.`;
    }

    if (openai) {
      // Use OpenAI API - GPT-4o for better multilingual support
      const model = process.env.OPENAI_MODEL || 'gpt-4o';
      modelUsed = model;

      logger.debug('Calling OpenAI API', {
        requestId: req.requestId,
        model,
        historyLength: conversationHistory.length,
        language: language || 'not specified',
      });

      const completion = await openai.chat.completions.create({
        model,
        messages: [
          { role: 'system', content: systemPrompt },
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
 * Generate fallback responses when OpenAI API is not available.
 * Provides basic informational responses about kidney treatment options
 * based on keyword matching in the user's message.
 *
 * @function getFallbackResponse
 * @param {string} message - The user's message to analyze
 * @returns {string} A pre-defined response based on detected keywords
 *
 * @example
 * const response = getFallbackResponse("Tell me about dialysis");
 * // Returns information about dialysis options
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
