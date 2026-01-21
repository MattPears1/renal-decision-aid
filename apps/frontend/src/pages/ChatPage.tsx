/**
 * @fileoverview AI chat page for the NHS Renal Decision Aid.
 * Provides an interactive chat interface where users can ask questions
 * about kidney treatments and receive AI-generated responses.
 *
 * @module pages/ChatPage
 * @version 2.5.0
 * @since 1.0.0
 * @lastModified 21 January 2026
 *
 * @requires react
 * @requires react-i18next
 * @requires react-router-dom
 * @requires @/context/SessionContext
 * @requires @/services/api
 * @requires @/components/ui
 * @requires @/hooks/useVoiceRecording
 * @requires @/hooks/useTextToSpeech
 * @requires @/components/VoiceControls
 * @requires @renal-decision-aid/shared-types
 */

import { useState, useRef, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate } from 'react-router-dom';
import { useSession } from '@/context/SessionContext';
import { chatApi } from '@/services/api';
import { Button } from '@/components/ui';
import { useVoiceRecording } from '@/hooks/useVoiceRecording';
import { useTextToSpeech } from '@/hooks/useTextToSpeech';
import {
  MicrophoneButton,
  SpeakerButton,
  VoiceStatusIndicator,
  AudioWaveform,
} from '@/components/VoiceControls';
import type { ChatMessage } from '@renal-decision-aid/shared-types';

/**
 * Translation keys for suggested questions shown to users.
 * @constant {string[]}
 */
const SUGGESTED_QUESTION_KEYS = [
  'chat.questions.q1',
  'chat.questions.q2',
  'chat.questions.q3',
  'chat.questions.q4',
  'chat.questions.q5',
  'chat.questions.q6',
];

/**
 * Translation keys for quick reply buttons shown after assistant responses.
 * @constant {string[]}
 */
const QUICK_REPLY_KEYS = [
  'chat.quickReplies.tellMeMore',
  'chat.quickReplies.prosAndCons',
  'chat.quickReplies.dailyLife',
];

/**
 * AI chat page component for the NHS Renal Decision Aid.
 * Provides an interactive chat interface for users to ask questions about
 * kidney treatments with AI-generated responses, voice input, and text-to-speech.
 *
 * @component
 * @returns {JSX.Element} The chat page with message history, input area, and voice controls
 *
 * @example
 * // In router configuration
 * <Route path="/chat" element={<ChatPage />} />
 */
export default function ChatPage() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { session, addChatMessage } = useSession();
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [showPiiWarning, setShowPiiWarning] = useState(true);
  const [lastAssistantMessage, setLastAssistantMessage] = useState<string | null>(null);

  // Capture the language when the page loads (before user can change it on this page)
  // This represents the language from the page they navigated from
  const [initialLanguage] = useState(() => i18n.language);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Voice recording hook
  const {
    state: recordingState,
    isSupported: isVoiceSupported,
    startRecording,
    stopRecording,
    cancelRecording,
    error: recordingError,
    audioLevel,
    duration: recordingDuration,
  } = useVoiceRecording({
    language: i18n.language,
    onTranscription: (result) => {
      // When we get a transcription, send it as a message
      if (result.text && result.text.trim()) {
        handleSend(result.text.trim());
      }
    },
    onError: (error) => {
      console.error('Voice recording error:', error);
    },
  });

  // Text-to-speech hook
  const {
    state: speechState,
    speak,
    pause,
    resume,
    stop: stopSpeech,
    toggle: toggleSpeech,
    error: speechError,
    isPlaying,
    progress: speechProgress,
  } = useTextToSpeech({
    language: i18n.language,
    onEnd: () => {
      // Speech finished
    },
    onError: (error) => {
      console.error('Text-to-speech error:', error);
    },
  });

  // Initialize with welcome message
  useEffect(() => {
    if (session?.chatHistory && session.chatHistory.length > 0) {
      setMessages(session.chatHistory);
    }
  }, [session?.chatHistory]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  // Auto-resize textarea
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.style.height = 'auto';
      inputRef.current.style.height = `${Math.min(inputRef.current.scrollHeight, 120)}px`;
    }
  }, [input]);

  /**
   * Formats a timestamp into a localized time string.
   * @param {string | number} timestamp - Unix timestamp or ISO date string
   * @returns {string} Formatted time string (e.g., "14:30")
   */
  const formatTime = (timestamp: string | number) => {
    const date = typeof timestamp === 'string' ? new Date(timestamp) : new Date(timestamp);
    // Use current language locale for date formatting
    const locale = i18n.language || 'en-GB';
    return date.toLocaleTimeString(locale, {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  /**
   * Sends a chat message to the AI assistant and handles the response.
   * Adds user message to history, calls chat API, and updates with assistant response.
   * @param {string} [messageText] - Optional message text, defaults to input field value
   * @returns {Promise<void>}
   */
  const handleSend = async (messageText?: string) => {
    const text = messageText || input.trim();
    if (!text || isLoading) return;

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: text,
      timestamp: Date.now(),
    };

    setMessages((prev) => [...prev, userMessage]);
    addChatMessage(userMessage);
    setInput('');
    setIsLoading(true);

    try {
      // Pass the initial language to tell the AI what language to respond in
      const response = await chatApi.sendMessage(text, session?.id, initialLanguage);

      if (response.data) {
        const assistantMessage: ChatMessage = {
          id: `assistant-${Date.now()}`,
          role: 'assistant',
          content: response.data.response,
          timestamp: typeof response.data.timestamp === 'string'
            ? new Date(response.data.timestamp).getTime()
            : response.data.timestamp,
        };
        setMessages((prev) => [...prev, assistantMessage]);
        addChatMessage(assistantMessage);
      } else {
        throw new Error(response.message || 'Failed to get response');
      }
    } catch (error) {
      // Fallback to mock response for development
      const mockResponse = generateMockResponse(text);
      const assistantMessage: ChatMessage = {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        content: mockResponse,
        timestamp: Date.now(),
      };
      setMessages((prev) => [...prev, assistantMessage]);
      addChatMessage(assistantMessage);
    } finally {
      setIsLoading(false);
      inputRef.current?.focus();
    }
  };

  /**
   * Handles keyboard events for the input textarea.
   * Sends message on Enter key (without Shift).
   * @param {React.KeyboardEvent} e - Keyboard event
   */
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  /**
   * Toggles voice recording on/off.
   * Starts recording when idle, stops and transcribes when recording.
   * @returns {Promise<void>}
   */
  const handleVoiceToggle = useCallback(async () => {
    if (recordingState === 'recording') {
      // Stop recording and transcribe
      await stopRecording();
    } else if (recordingState === 'idle' || recordingState === 'error') {
      // Start recording
      await startRecording();
    }
  }, [recordingState, startRecording, stopRecording]);

  /**
   * Handles text-to-speech playback for assistant responses.
   * Toggles playback if already playing/paused, otherwise starts speaking.
   * @param {string} text - The text to speak
   */
  const handlePlayResponse = useCallback((text: string) => {
    if (speechState === 'playing' || speechState === 'paused') {
      toggleSpeech();
    } else {
      speak(text);
    }
  }, [speechState, speak, toggleSpeech]);

  // Track last assistant message for TTS
  useEffect(() => {
    const lastMessage = messages[messages.length - 1];
    if (lastMessage?.role === 'assistant') {
      setLastAssistantMessage(lastMessage.content);
    }
  }, [messages]);

  return (
    <main className="flex flex-col h-[calc(100vh-64px)] max-h-[calc(100vh-64px)] bg-gradient-to-b from-bg-page to-nhs-pale-grey/30">
      {/* Breadcrumb Navigation - Enhanced */}
      <nav className="bg-white/80 backdrop-blur-sm border-b border-nhs-pale-grey flex-shrink-0" aria-label={t('accessibility.breadcrumb')}>
        <div className="max-w-container-lg mx-auto px-4 py-3">
          <ol className="flex items-center gap-2 text-sm">
            <li>
              <Link to="/" className="text-nhs-blue hover:text-nhs-blue-dark transition-colors">
                {t('nav.home', 'Home')}
              </Link>
            </li>
            <li className="text-nhs-mid-grey">/</li>
            <li>
              <Link to="/hub" className="text-nhs-blue hover:text-nhs-blue-dark transition-colors">
                {t('hub.title', 'Your Hub')}
              </Link>
            </li>
            <li className="text-nhs-mid-grey">/</li>
            <li className="text-text-secondary font-medium" aria-current="page">
              {t('chat.title', 'Ask Questions')}
            </li>
          </ol>
        </div>
      </nav>

      {/* PII Warning Banner - Enhanced */}
      {showPiiWarning && (
        <div className="bg-gradient-to-r from-nhs-warm-yellow/20 to-nhs-orange/10 border-b-2 border-nhs-warm-yellow py-3 px-4 flex items-center gap-4 flex-shrink-0">
          <div className="w-10 h-10 bg-nhs-warm-yellow/30 rounded-full flex items-center justify-center flex-shrink-0">
            <WarningIcon className="w-5 h-5 text-nhs-orange" />
          </div>
          <p className="text-sm text-text-primary flex-1">
            <span className="font-semibold">{t('chat.privacyReminder', 'Privacy reminder:')}</span>{' '}
            {t('chat.piiWarning')}
          </p>
          <button
            onClick={() => setShowPiiWarning(false)}
            className="p-2 text-text-secondary hover:text-text-primary hover:bg-white/50 rounded-full transition-all"
            aria-label={t('common.close', 'Close')}
          >
            <CloseIcon className="w-5 h-5" />
          </button>
        </div>
      )}

      {/* Chat Header - Enhanced for mobile */}
      <div className="flex items-center justify-between px-3 sm:px-4 md:px-6 py-3 sm:py-4 bg-white border-b border-nhs-pale-grey flex-shrink-0 shadow-sm">
        <div className="flex items-center gap-2 sm:gap-4 min-w-0">
          <div className="relative flex-shrink-0">
            <div className="w-10 h-10 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl bg-gradient-to-br from-nhs-blue to-nhs-blue-dark flex items-center justify-center flex-shrink-0 shadow-lg">
              <BotIcon className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
            </div>
            <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 sm:w-4 sm:h-4 bg-nhs-green rounded-full border-2 border-white animate-pulse" />
          </div>
          <div className="min-w-0">
            <h1 className="text-base sm:text-xl font-bold text-text-primary truncate">
              {t('chat.title', 'NHS Kidney Care Assistant')}
            </h1>
            <div className="flex items-center gap-1 sm:gap-1.5 text-xs sm:text-sm text-nhs-green font-medium">
              <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-nhs-green animate-pulse flex-shrink-0" />
              <span>{t('chat.status.online')}</span>
              <span className="text-text-muted font-normal hidden sm:inline">- {t('chat.readyToHelp')}</span>
            </div>
          </div>
        </div>
        <div className="flex gap-2 flex-shrink-0">
          <Link
            to="/hub"
            className="inline-flex items-center gap-1 sm:gap-2 px-3 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-sm font-medium text-nhs-blue bg-nhs-blue/5 hover:bg-nhs-blue/10 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-focus min-h-[40px] touch-manipulation"
          >
            <BackIcon className="w-4 h-4" />
            <span className="hidden sm:inline">{t('chat.backToHub', 'Back to Hub')}</span>
          </Link>
        </div>
      </div>

      {/* Chat Container */}
      <div className="flex-1 flex flex-col max-w-container-lg mx-auto w-full overflow-hidden">
        {/* Messages Area - Enhanced with modern bubbles */}
        <div
          className="flex-1 overflow-y-auto px-4 md:px-6 py-6 flex flex-col gap-5"
          role="log"
          aria-live="polite"
          aria-label={t('chat.messagesLabel', 'Chat messages')}
        >
          {/* Welcome message if no chat history */}
          {messages.length === 0 && (
            <>
              {/* Welcome Message - Enhanced with mobile optimization */}
              <div className="flex gap-2 sm:gap-4 max-w-[92%] sm:max-w-[85%] self-start animate-fade-in">
                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-gradient-to-br from-nhs-blue to-nhs-blue-dark flex items-center justify-center flex-shrink-0 shadow-md">
                  <BotIcon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                </div>
                <div className="flex flex-col gap-1 sm:gap-2 min-w-0 flex-1">
                  <div className="bg-white border border-nhs-pale-grey rounded-xl sm:rounded-2xl rounded-tl-md p-3 sm:p-5 leading-relaxed shadow-sm">
                    <p className="mb-3 sm:mb-4 text-text-primary text-sm sm:text-base">
                      {t('chat.welcome.greeting', 'Hello! I am the NHS Kidney Care Assistant. I am here to help you understand kidney treatment options.')}
                    </p>
                    <p className="text-text-secondary text-sm sm:text-base">
                      {t('chat.welcome.prompt', 'You can ask me questions about dialysis, transplants, conservative care, or anything else related to kidney treatment. How can I help you today?')}
                    </p>
                  </div>
                  <span className="text-[10px] sm:text-xs text-text-muted px-2">{formatTime(Date.now())}</span>
                </div>
              </div>

              {/* Suggested Questions - Enhanced with better mobile wrapping */}
              <div className="bg-gradient-to-br from-nhs-blue/5 to-nhs-blue/10 border border-nhs-blue/20 rounded-xl sm:rounded-2xl p-4 sm:p-6 mt-4 shadow-sm">
                <h2 className="text-sm sm:text-base font-bold text-text-primary mb-3 sm:mb-4 flex items-center gap-2">
                  <div className="w-7 h-7 sm:w-8 sm:h-8 bg-nhs-blue/20 rounded-lg flex items-center justify-center flex-shrink-0">
                    <QuestionIcon className="w-4 h-4 sm:w-5 sm:h-5 text-nhs-blue" />
                  </div>
                  {t('chat.suggestedQuestions', 'Suggested Questions')}
                </h2>
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 sm:gap-3">
                  {SUGGESTED_QUESTION_KEYS.map((key, index) => {
                    const question = t(key);
                    return (
                      <button
                        key={index}
                        onClick={() => handleSend(question)}
                        className="group text-left px-3 sm:px-4 py-3 bg-white border border-nhs-pale-grey rounded-xl text-xs sm:text-sm text-text-primary hover:border-nhs-blue hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-focus min-h-[44px] touch-manipulation"
                      >
                        <span className="flex items-start gap-2">
                          <span className="w-1.5 h-1.5 bg-nhs-blue rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0 mt-1.5" />
                          <span className="break-words">{question}</span>
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </>
          )}

          {/* Chat Messages - Modern bubble design with mobile optimization */}
          {messages.map((message, index) => (
            <div
              key={message.id}
              className={`flex gap-2 sm:gap-4 max-w-[92%] sm:max-w-[85%] animate-fade-in ${
                message.role === 'assistant' ? 'self-start' : 'self-end flex-row-reverse'
              }`}
            >
              <div
                className={`w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl flex items-center justify-center flex-shrink-0 shadow-md ${
                  message.role === 'assistant'
                    ? 'bg-gradient-to-br from-nhs-blue to-nhs-blue-dark'
                    : 'bg-gradient-to-br from-nhs-aqua-green to-[#008577]'
                }`}
              >
                {message.role === 'assistant' ? (
                  <BotIcon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                ) : (
                  <UserIcon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                )}
              </div>
              <div className="flex flex-col gap-1 sm:gap-2 min-w-0 flex-1">
                <div
                  className={`p-3 sm:p-5 rounded-xl sm:rounded-2xl leading-relaxed shadow-sm ${
                    message.role === 'assistant'
                      ? 'bg-white border border-nhs-pale-grey rounded-tl-md'
                      : 'bg-gradient-to-br from-nhs-blue to-nhs-blue-dark text-white rounded-tr-md'
                  }`}
                >
                  <p className="whitespace-pre-wrap text-sm sm:text-base break-words">{message.content}</p>
                  {/* Speaker button for assistant messages */}
                  {message.role === 'assistant' && (
                    <div className="flex items-center gap-2 mt-3 pt-3 border-t border-nhs-pale-grey">
                      <SpeakerButton
                        speechState={lastAssistantMessage === message.content ? speechState : 'idle'}
                        onClick={() => handlePlayResponse(message.content)}
                        progress={lastAssistantMessage === message.content ? speechProgress : 0}
                        error={speechError}
                        size="sm"
                      />
                      <span className="text-xs text-text-muted">
                        {lastAssistantMessage === message.content && speechState === 'playing'
                          ? t('chat.voice.speaking', 'Speaking...')
                          : lastAssistantMessage === message.content && speechState === 'paused'
                            ? t('chat.voice.paused', 'Paused')
                            : t('chat.voice.playResponse', 'Listen to response')}
                      </span>
                    </div>
                  )}
                </div>
                <span
                  className={`text-[10px] sm:text-xs text-text-muted px-2 ${
                    message.role === 'user' ? 'text-right' : ''
                  }`}
                >
                  {formatTime(message.timestamp)}
                </span>
                {/* Quick Replies for last assistant message - Enhanced with mobile sizing */}
                {message.role === 'assistant' && index === messages.length - 1 && !isLoading && (
                  <div className="flex flex-wrap gap-2 mt-1 sm:mt-2">
                    {QUICK_REPLY_KEYS.map((key, idx) => {
                      const reply = t(key);
                      return (
                        <button
                          key={idx}
                          onClick={() => handleSend(reply)}
                          className="px-3 sm:px-4 py-2 bg-white border-2 border-nhs-blue/30 text-xs sm:text-sm font-medium text-nhs-blue rounded-full hover:bg-nhs-blue hover:border-nhs-blue hover:text-white transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-focus shadow-sm min-h-[36px] sm:min-h-[40px] touch-manipulation"
                        >
                          {reply}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          ))}

          {/* Typing Indicator - Enhanced */}
          {isLoading && (
            <div className="flex gap-4 max-w-[85%] self-start animate-fade-in">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-nhs-blue to-nhs-blue-dark flex items-center justify-center flex-shrink-0 shadow-md">
                <BotIcon className="w-6 h-6 text-white" />
              </div>
              <div className="bg-white border border-nhs-pale-grey rounded-2xl rounded-tl-md px-6 py-5 flex items-center gap-2 shadow-sm">
                <span className="w-2.5 h-2.5 rounded-full bg-nhs-blue/60 animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-2.5 h-2.5 rounded-full bg-nhs-blue/60 animate-bounce" style={{ animationDelay: '200ms' }} />
                <span className="w-2.5 h-2.5 rounded-full bg-nhs-blue/60 animate-bounce" style={{ animationDelay: '400ms' }} />
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Area - Enhanced for mobile with voice controls */}
        <div className="flex-shrink-0 border-t border-nhs-pale-grey bg-white/95 backdrop-blur-sm p-3 sm:p-4 shadow-lg">
          {/* Voice Status Indicator */}
          {(recordingState !== 'idle' || speechState === 'playing' || speechState === 'loading') && (
            <div className="max-w-3xl mx-auto mb-3">
              <div className="flex items-center justify-center gap-3 py-2 px-4 bg-nhs-pale-grey/50 rounded-lg">
                <VoiceStatusIndicator
                  recordingState={recordingState}
                  speechState={speechState}
                />
                {recordingState === 'recording' && (
                  <AudioWaveform
                    level={audioLevel}
                    isActive={true}
                    variant="recording"
                    className="flex-shrink-0"
                  />
                )}
                {speechState === 'playing' && (
                  <AudioWaveform
                    level={0.5}
                    isActive={true}
                    variant="playing"
                    className="flex-shrink-0"
                  />
                )}
              </div>
            </div>
          )}

          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex gap-2 sm:gap-3 items-end max-w-3xl mx-auto"
          >
            {/* Microphone button - standalone on mobile, inline on desktop */}
            <div className="hidden sm:block">
              <MicrophoneButton
                recordingState={recordingState}
                isSupported={isVoiceSupported}
                onClick={handleVoiceToggle}
                audioLevel={audioLevel}
                duration={recordingDuration}
                error={recordingError}
                size="md"
              />
            </div>

            <div className="flex-1 relative min-w-0">
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={
                  recordingState === 'recording'
                    ? t('chat.voice.listening', 'Listening...')
                    : recordingState === 'processing'
                      ? t('chat.voice.processing', 'Processing...')
                      : t('chat.placeholder', 'Type your question here...')
                }
                rows={1}
                className="w-full px-3 sm:px-5 py-3 sm:py-4 pr-24 sm:pr-12 border-2 border-nhs-pale-grey rounded-xl sm:rounded-2xl resize-none focus:outline-none focus:border-nhs-blue focus:ring-4 focus:ring-nhs-blue/20 transition-all shadow-sm text-sm sm:text-base"
                aria-label={t('chat.inputLabel', 'Message input')}
                disabled={isLoading || recordingState === 'recording' || recordingState === 'processing'}
                style={{ fontSize: '16px' }} // Prevents iOS zoom on focus
              />
              {/* Mobile-only inline voice button */}
              <div className="absolute right-2 bottom-2 sm:hidden flex items-center gap-1">
                <MicrophoneButton
                  recordingState={recordingState}
                  isSupported={isVoiceSupported}
                  onClick={handleVoiceToggle}
                  audioLevel={audioLevel}
                  duration={recordingDuration}
                  error={recordingError}
                  size="sm"
                />
              </div>
            </div>
            <button
              type="submit"
              disabled={!input.trim() || isLoading || recordingState === 'recording'}
              className="px-4 sm:px-6 py-3 sm:py-4 bg-gradient-to-r from-nhs-blue to-nhs-blue-dark text-white font-semibold rounded-xl sm:rounded-2xl flex items-center justify-center gap-2 hover:shadow-lg hover:scale-105 disabled:opacity-50 disabled:hover:scale-100 disabled:hover:shadow-none transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-focus min-w-[48px] min-h-[48px] touch-manipulation"
              aria-label={t('chat.send', 'Send message')}
            >
              <SendIcon className="w-5 h-5" />
              <span className="hidden sm:inline">{t('chat.send', 'Send')}</span>
            </button>
          </form>
          <p className="text-[10px] sm:text-xs text-text-muted mt-2 sm:mt-3 text-center flex items-center justify-center gap-1 px-2">
            <svg className="w-3 h-3 sm:w-3.5 sm:h-3.5 flex-shrink-0" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z" />
            </svg>
            <span>{t('chat.disclaimer', 'This assistant provides general information only and is not a substitute for medical advice from your kidney care team.')}</span>
          </p>
        </div>
      </div>
    </main>
  );
}

/**
 * Generates a mock response for development and fallback scenarios.
 * Provides contextual responses based on question keywords.
 *
 * @param {string} question - The user's question
 * @returns {string} A mock AI response relevant to the question topic
 */
function generateMockResponse(question: string): string {
  const lowerQuestion = question.toLowerCase();

  if (lowerQuestion.includes('dialysis') && lowerQuestion.includes('peritoneal')) {
    return "Haemodialysis and peritoneal dialysis are both effective ways to filter waste from your blood when your kidneys cannot do this themselves.\n\n**Haemodialysis** uses a machine to filter your blood outside your body. You typically have treatment 3 times a week for about 4 hours each session, either at a dialysis centre or at home.\n\n**Peritoneal dialysis** uses the lining of your abdomen (the peritoneum) as a natural filter. A fluid is put into your abdomen through a tube, waste products pass into the fluid, and then the fluid is drained out. This can be done at home and often offers more flexibility.\n\nBoth treatments can be effective. The best choice depends on your lifestyle, health, and personal preferences. Your kidney care team can help you decide which option suits you best.";
  }

  if (lowerQuestion.includes('transplant') && lowerQuestion.includes('surgery')) {
    return "A kidney transplant surgery usually takes between 2 to 4 hours. The new kidney is placed in your lower abdomen, and your own kidneys are usually left in place unless there is a specific reason to remove them.\n\nAfter surgery, you will typically stay in hospital for about a week. The new kidney often starts working immediately, though sometimes it takes a few days or weeks.\n\nRecovery time varies, but most people can return to normal activities within 3 to 6 months. You will need to take anti-rejection medicines for as long as you have the transplant.";
  }

  if (lowerQuestion.includes('travel') && lowerQuestion.includes('dialysis')) {
    return "Yes, you can travel while on dialysis! However, it requires some planning:\n\n**Haemodialysis:** You will need to arrange treatment sessions at a dialysis centre at your destination. Most centres welcome visiting patients, but you should book at least 6-8 weeks in advance.\n\n**Peritoneal dialysis:** This offers more flexibility as you can do your treatments yourself. You will need to arrange for your supplies to be delivered to your destination.\n\nMany patients successfully travel both within the UK and abroad. Your renal team can provide specific advice for your situation.";
  }

  if (lowerQuestion.includes('conservative') || lowerQuestion.includes('supportive care')) {
    return "Conservative care (also called supportive care) is a treatment option where you choose not to have dialysis or a transplant.\n\nInstead, treatment focuses on:\n- Managing symptoms like tiredness, nausea, and breathlessness\n- Controlling conditions like anaemia and high blood pressure\n- Maintaining your quality of life for as long as possible\n- Providing support for you and your family\n\nThis is a valid choice and your kidney care team will support you fully. You can always change your mind and start dialysis if you wish.";
  }

  if (lowerQuestion.includes('side effects')) {
    return "Dialysis can have some side effects, though many people manage them well:\n\n**Common side effects of haemodialysis:**\n- Feeling tired, especially after treatment\n- Muscle cramps during treatment\n- Low blood pressure (can cause dizziness)\n- Itchy skin\n\n**Common side effects of peritoneal dialysis:**\n- Risk of infection (peritonitis)\n- Weight gain from the dialysis fluid\n- Feeling full or bloated\n\nYour kidney care team will help you manage any side effects. Many can be reduced by adjusting your treatment or diet.";
  }

  if (lowerQuestion.includes('suitable') && lowerQuestion.includes('transplant')) {
    return "Suitability for a kidney transplant depends on several factors that your kidney care team will assess:\n\n**General requirements:**\n- Your overall health (heart, lungs, and other organs)\n- Ability to take lifelong anti-rejection medicines\n- No active cancer or serious infections\n- Psychological readiness for surgery and aftercare\n\n**Important to know:**\n- Age alone does not rule out transplant - many people over 70 have successful transplants\n- Having diabetes does not prevent transplant\n- Living donor transplants often have better outcomes\n\nSpeak to your kidney care team about starting the assessment process.";
  }

  if (lowerQuestion.includes('tell me more') || lowerQuestion.includes('pros and cons')) {
    return "I would be happy to provide more details! Could you let me know which specific treatment option you would like to learn more about?\n\nI can provide information on:\n- Haemodialysis (in-centre or home)\n- Peritoneal dialysis (CAPD or APD)\n- Kidney transplant (living or deceased donor)\n- Conservative care\n\nEach has its own benefits and considerations that may be more or less suitable depending on your lifestyle and preferences.";
  }

  // Default response
  return "Thank you for your question. This is an important topic when considering kidney treatment options.\n\nI can provide general information about kidney treatments including dialysis (haemodialysis and peritoneal dialysis), kidney transplants, and conservative care. Each treatment has its own benefits and considerations.\n\nFor personalised medical advice about your specific situation, please speak with your kidney care team. They know your health history and can give you the best guidance.\n\nIs there anything specific about kidney treatments you would like me to explain?";
}

// Icon Components

/**
 * Warning triangle icon component.
 * @component
 * @param {Object} props - Component props
 * @param {string} [props.className] - Optional CSS class name
 * @returns {JSX.Element} SVG warning icon
 */
function WarningIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z"/>
    </svg>
  );
}

/**
 * Close/X icon component.
 * @component
 * @param {Object} props - Component props
 * @param {string} [props.className] - Optional CSS class name
 * @returns {JSX.Element} SVG close icon
 */
function CloseIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <line x1="18" y1="6" x2="6" y2="18"/>
      <line x1="6" y1="6" x2="18" y2="18"/>
    </svg>
  );
}

/**
 * Bot/AI avatar icon component.
 * @component
 * @param {Object} props - Component props
 * @param {string} [props.className] - Optional CSS class name
 * @returns {JSX.Element} SVG bot icon
 */
function BotIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z"/>
    </svg>
  );
}

/**
 * User avatar icon component.
 * @component
 * @param {Object} props - Component props
 * @param {string} [props.className] - Optional CSS class name
 * @returns {JSX.Element} SVG user icon
 */
function UserIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
    </svg>
  );
}

/**
 * Back arrow icon component.
 * @component
 * @param {Object} props - Component props
 * @param {string} [props.className] - Optional CSS class name
 * @returns {JSX.Element} SVG back arrow icon
 */
function BackIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <line x1="19" y1="12" x2="5" y2="12"/>
      <polyline points="12 19 5 12 12 5"/>
    </svg>
  );
}

/**
 * Question mark icon component.
 * @component
 * @param {Object} props - Component props
 * @param {string} [props.className] - Optional CSS class name
 * @returns {JSX.Element} SVG question mark icon
 */
function QuestionIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M11 18h2v-2h-2v2zm1-16C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm0-14c-2.21 0-4 1.79-4 4h2c0-1.1.9-2 2-2s2 .9 2 2c0 2-3 1.75-3 5h2c0-2.25 3-2.5 3-5 0-2.21-1.79-4-4-4z"/>
    </svg>
  );
}

/**
 * Microphone icon component.
 * @component
 * @param {Object} props - Component props
 * @param {string} [props.className] - Optional CSS class name
 * @returns {JSX.Element} SVG microphone icon
 */
function MicIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 14c1.66 0 2.99-1.34 2.99-3L15 5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3zm5.3-3c0 3-2.54 5.1-5.3 5.1S6.7 14 6.7 11H5c0 3.41 2.72 6.23 6 6.72V21h2v-3.28c3.28-.48 6-3.3 6-6.72h-1.7z"/>
    </svg>
  );
}

/**
 * Send/paper plane icon component.
 * @component
 * @param {Object} props - Component props
 * @param {string} [props.className] - Optional CSS class name
 * @returns {JSX.Element} SVG send icon
 */
function SendIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
    </svg>
  );
}
