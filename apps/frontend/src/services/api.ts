/**
 * API Service for NHS Renal Decision Aid
 * Handles communication with the backend server
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

interface ApiResponse<T> {
  data?: T;
  error?: string;
  message?: string;
}

interface ChatResponse {
  response: string;
  timestamp: string;
}

interface SessionResponse {
  sessionId: string;
  expiresAt: string;
}

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
 * Generic fetch wrapper with error handling
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
 * Session API
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
 * Chat API
 */
export const chatApi = {
  /**
   * Send a message and get AI response
   */
  sendMessage: async (
    message: string,
    sessionId?: string
  ): Promise<ApiResponse<ChatResponse>> => {
    return fetchApi<ChatResponse>('/chat', {
      method: 'POST',
      body: JSON.stringify({ message, sessionId }),
    });
  },
};

/**
 * Health check API
 */
export const healthApi = {
  /**
   * Check if backend is healthy
   */
  check: async (): Promise<ApiResponse<{ status: string; timestamp: string }>> => {
    return fetchApi<{ status: string; timestamp: string }>('/health');
  },
};

export default {
  session: sessionApi,
  chat: chatApi,
  health: healthApi,
};
