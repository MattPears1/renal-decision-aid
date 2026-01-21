/**
 * @fileoverview API service for the NHS Renal Decision Aid.
 * Handles all HTTP communication with the backend server.
 * @module services/api
 * @version 2.5.0
 * @since 1.0.0
 * @lastModified 21 January 2026
 */

/** API base URL from environment or default. */
const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

/**
 * Generic API response wrapper.
 * @interface ApiResponse
 * @template T - Response data type
 * @property {T} [data] - Response data if successful
 * @property {string} [error] - Error code if failed
 * @property {string} [message] - Human-readable message
 */
interface ApiResponse<T> {
  data?: T;
  error?: string;
  message?: string;
}

/**
 * Chat API response format.
 * @interface ChatResponse
 * @property {string} response - AI response text
 * @property {string} timestamp - Response timestamp
 */
interface ChatResponse {
  response: string;
  timestamp: string;
}

/**
 * Session creation response.
 * @interface SessionResponse
 * @property {string} sessionId - New session ID
 * @property {string} expiresAt - Expiration timestamp
 */
interface SessionResponse {
  sessionId: string;
  expiresAt: string;
}

/**
 * Full session data structure.
 * @interface SessionData
 * @property {string} id - Session ID
 * @property {Record<string, unknown>} preferences - User preferences
 * @property {Array} questionnaireAnswers - Questionnaire answers
 * @property {Record<string, unknown>} values - Value ratings
 * @property {Array} chatHistory - Chat message history
 * @property {string} currentStep - Current journey step
 */
interface SessionData {
  id: string;
  preferences: Record<string, unknown>;
  questionnaireAnswers: Array<{
    questionId: string;
    answer: string | number | boolean | string[];
    answeredAt: string;
  }>;
  values: Record<string, unknown>;
  chatHistory: Array<{
    id: string;
    role: 'user' | 'assistant';
    content: string;
    timestamp: string;
  }>;
  currentStep: string;
}

/**
 * Generic fetch wrapper with error handling.
 * @template T - Expected response data type
 * @param {string} endpoint - API endpoint path
 * @param {RequestInit} [options={}] - Fetch options
 * @returns {Promise<ApiResponse<T>>} Response with data or error
 */
async function fetchApi<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        error: data.error || 'Request failed',
        message: data.message || `HTTP ${response.status}`,
      };
    }

    return { data };
  } catch (error) {
    console.error('API Error:', error);
    return {
      error: 'Network Error',
      message: error instanceof Error ? error.message : 'Unable to connect to server',
    };
  }
}

/**
 * Session management API endpoints.
 * @namespace sessionApi
 */
export const sessionApi = {
  /**
   * Create a new session
   */
  create: async (language: string): Promise<ApiResponse<SessionResponse>> => {
    return fetchApi<SessionResponse>('/session', {
      method: 'POST',
      body: JSON.stringify({ language }),
    });
  },

  /**
   * Get session data
   */
  get: async (sessionId: string): Promise<ApiResponse<SessionData>> => {
    return fetchApi<SessionData>(`/session/${sessionId}`);
  },

  /**
   * Update session data
   */
  update: async (
    sessionId: string,
    updates: Partial<SessionData>
  ): Promise<ApiResponse<SessionData>> => {
    return fetchApi<SessionData>(`/session/${sessionId}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  },

  /**
   * Delete/end session
   */
  delete: async (sessionId: string): Promise<ApiResponse<{ message: string }>> => {
    return fetchApi<{ message: string }>(`/session/${sessionId}`, {
      method: 'DELETE',
    });
  },
};

/**
 * Chat API endpoints for AI conversation.
 * @namespace chatApi
 */
export const chatApi = {
  /**
   * Send a message and get AI response
   * @param message - The user's message
   * @param sessionId - Optional session ID for conversation context
   * @param language - Optional language code (e.g., 'hi', 'pa', 'ur') to indicate user's preferred language
   */
  sendMessage: async (
    message: string,
    sessionId?: string,
    language?: string
  ): Promise<ApiResponse<ChatResponse>> => {
    return fetchApi<ChatResponse>('/chat', {
      method: 'POST',
      body: JSON.stringify({ message, sessionId, language }),
    });
  },
};

/**
 * Health check API endpoints.
 * @namespace healthApi
 */
export const healthApi = {
  /**
   * Check if backend is healthy
   */
  check: async (): Promise<ApiResponse<{ status: string; timestamp: string }>> => {
    return fetchApi<{ status: string; timestamp: string }>('/health');
  },
};

/**
 * Combined API object with all endpoints.
 * @default
 */
export default {
  session: sessionApi,
  chat: chatApi,
  health: healthApi,
};
