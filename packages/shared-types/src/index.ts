// =============================================================================
// NHS Renal Decision Aid - Shared Types
// =============================================================================

// Language Support
export type SupportedLanguage = 'en' | 'hi' | 'pa' | 'bn' | 'ur' | 'gu' | 'ta';

export interface LanguageConfig {
  code: SupportedLanguage;
  name: string;
  nativeName: string;
  direction: 'ltr' | 'rtl';
  fontFamily: string;
}

export const SUPPORTED_LANGUAGES: LanguageConfig[] = [
  { code: 'en', name: 'English', nativeName: 'English', direction: 'ltr', fontFamily: 'Noto Sans' },
  { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी', direction: 'ltr', fontFamily: 'Noto Sans Devanagari' },
  { code: 'pa', name: 'Punjabi', nativeName: 'ਪੰਜਾਬੀ', direction: 'ltr', fontFamily: 'Noto Sans Gurmukhi' },
  { code: 'bn', name: 'Bengali', nativeName: 'বাংলা', direction: 'ltr', fontFamily: 'Noto Sans Bengali' },
  { code: 'ur', name: 'Urdu', nativeName: 'اردو', direction: 'rtl', fontFamily: 'Noto Nastaliq Urdu' },
  { code: 'gu', name: 'Gujarati', nativeName: 'ગુજરાતી', direction: 'ltr', fontFamily: 'Noto Sans Gujarati' },
  { code: 'ta', name: 'Tamil', nativeName: 'தமிழ்', direction: 'ltr', fontFamily: 'Noto Sans Tamil' },
];

// Journey Stages
export type JourneyStage =
  | 'newly-diagnosed'
  | 'monitoring'
  | 'preparing'
  | 'on-dialysis'
  | 'transplant-waiting'
  | 'post-transplant'
  | 'supporting-someone';

export interface JourneyStageInfo {
  id: JourneyStage;
  titleKey: string;
  descriptionKey: string;
  iconName: string;
}

// Treatment Types
export type TreatmentType =
  | 'kidney-transplant'
  | 'hemodialysis'
  | 'peritoneal-dialysis'
  | 'conservative-care';

export type DialysisSubType =
  | 'in-centre-hd'
  | 'home-hd'
  | 'capd'
  | 'apd';

export interface TreatmentInfo {
  id: TreatmentType;
  titleKey: string;
  descriptionKey: string;
  iconName: string;
  subtypes?: DialysisSubType[];
}

// Questionnaire
export interface QuestionnaireQuestion {
  id: string;
  type: 'slider' | 'radio' | 'checkbox' | 'text';
  questionKey: string;
  hintKey?: string;
  options?: QuestionOption[];
  min?: number;
  max?: number;
  step?: number;
  required: boolean;
}

export interface QuestionOption {
  value: string;
  labelKey: string;
}

export interface QuestionnaireAnswer {
  questionId: string;
  value: string | number | string[];
  timestamp: number;
}

// Values Exercise
export interface ValueStatement {
  id: string;
  statementKey: string;
  category: 'independence' | 'health' | 'lifestyle' | 'social' | 'practical';
}

export interface ValueRating {
  statementId: string;
  rating: 1 | 2 | 3 | 4 | 5;
}

// Session
export interface Session {
  id: string;
  language: SupportedLanguage;
  journeyStage?: JourneyStage;
  questionnaireAnswers: QuestionnaireAnswer[];
  valueRatings: ValueRating[];
  viewedTreatments: TreatmentType[];
  chatHistory: ChatMessage[];
  createdAt: number;
  expiresAt: number;
  lastActivityAt: number;
}

export interface SessionCreateRequest {
  language: SupportedLanguage;
}

export interface SessionCreateResponse {
  sessionId: string;
  expiresAt: number;
}

export interface SessionUpdateRequest {
  language?: SupportedLanguage;
  journeyStage?: JourneyStage;
  questionnaireAnswer?: QuestionnaireAnswer;
  valueRating?: ValueRating;
  viewedTreatment?: TreatmentType;
}

// Chat
export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
  quickReplies?: string[];
}

export interface ChatRequest {
  sessionId: string;
  message: string;
  language: SupportedLanguage;
}

export interface ChatResponse {
  message: ChatMessage;
  piiDetected?: boolean;
  piiWarning?: string;
}

// API Responses
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: ApiError;
}

export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
}

// Session Summary
export interface SessionSummary {
  sessionId: string;
  language: SupportedLanguage;
  journeyStage?: JourneyStage;
  topValues: ValueRating[];
  questionnaireSummary: QuestionnaireAnswer[];
  viewedTreatments: TreatmentType[];
  questionsAsked: string[];
  generatedAt: number;
}

// Health Check
export interface HealthCheckResponse {
  status: 'healthy' | 'degraded' | 'unhealthy';
  version: string;
  timestamp: number;
  services: {
    database: 'up' | 'down';
    openai: 'up' | 'down';
  };
}
