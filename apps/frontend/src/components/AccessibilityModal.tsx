import { useEffect, useRef, useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui';

export interface AccessibilitySettings {
  textSize: 'small' | 'medium' | 'large' | 'extra-large';
  highContrast: boolean;
  reducedMotion: boolean;
  lineSpacing: 'normal' | 'relaxed' | 'loose';
}

const DEFAULT_SETTINGS: AccessibilitySettings = {
  textSize: 'medium',
  highContrast: false,
  reducedMotion: false,
  lineSpacing: 'normal',
};

const STORAGE_KEY = 'accessibility-settings';

interface AccessibilityModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function loadAccessibilitySettings(): AccessibilitySettings {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return { ...DEFAULT_SETTINGS, ...JSON.parse(stored) };
    }
  } catch (e) {
    console.error('Failed to load accessibility settings:', e);
  }
  return DEFAULT_SETTINGS;
}

export function applyAccessibilitySettings(settings: AccessibilitySettings): void {
  const root = document.documentElement;

  // Apply text scale
  const textScales: Record<AccessibilitySettings['textSize'], string> = {
    small: '0.875',
    medium: '1',
    large: '1.125',
    'extra-large': '1.25',
  };
  root.style.setProperty('--text-scale', textScales[settings.textSize]);
  root.style.fontSize = `calc(16px * ${textScales[settings.textSize]})`;

  // Apply line spacing
  const lineHeights: Record<AccessibilitySettings['lineSpacing'], string> = {
    normal: '1.5',
    relaxed: '1.75',
    loose: '2',
  };
  root.style.setProperty('--line-height', lineHeights[settings.lineSpacing]);

  // Apply high contrast mode
  if (settings.highContrast) {
    root.classList.add('high-contrast');
  } else {
    root.classList.remove('high-contrast');
  }

  // Apply reduced motion
  if (settings.reducedMotion) {
    root.classList.add('reduce-motion');
  } else {
    root.classList.remove('reduce-motion');
  }
}

export default function AccessibilityModal({ isOpen, onClose }: AccessibilityModalProps) {
  const { t } = useTranslation();
  const modalRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  const [settings, setSettings] = useState<AccessibilitySettings>(() => loadAccessibilitySettings());
  const [initialSettings, setInitialSettings] = useState<AccessibilitySettings>(() => loadAccessibilitySettings());

  // Apply settings immediately when they change (live preview)
  useEffect(() => {
    applyAccessibilitySettings(settings);
  }, [settings]);

  // Reset initial settings and reload current settings when modal opens
  useEffect(() => {
    if (isOpen) {
      const currentSettings = loadAccessibilitySettings();
      setSettings(currentSettings);
      setInitialSettings(currentSettings);
    }
  }, [isOpen]);

  // Store original focus and focus close button when modal opens
  useEffect(() => {
    if (isOpen) {
      previousFocusRef.current = document.activeElement as HTMLElement;
      setTimeout(() => {
        closeButtonRef.current?.focus();
      }, 0);
    } else if (previousFocusRef.current) {
      previousFocusRef.current.focus();
    }
  }, [isOpen]);

  // Focus trap
  useEffect(() => {
    if (!isOpen || !modalRef.current) return;

    const modal = modalRef.current;
    const focusableElements = modal.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    const handleTabKey = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;

      if (e.shiftKey && document.activeElement === firstElement) {
        e.preventDefault();
        lastElement?.focus();
      } else if (!e.shiftKey && document.activeElement === lastElement) {
        e.preventDefault();
        firstElement?.focus();
      }
    };

    modal.addEventListener('keydown', handleTabKey);
    return () => modal.removeEventListener('keydown', handleTabKey);
  }, [isOpen]);

  // Handlers defined before effects that use them
  const handleSave = useCallback(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
      // Settings are already applied via the useEffect, just persist them
    } catch (e) {
      console.error('Failed to save accessibility settings:', e);
    }
    onClose();
  }, [settings, onClose]);

  // Handle cancel - revert to initial settings
  const handleCancel = useCallback(() => {
    setSettings(initialSettings);
    applyAccessibilitySettings(initialSettings);
    onClose();
  }, [initialSettings, onClose]);

  const handleReset = useCallback(() => {
    setSettings(DEFAULT_SETTINGS);
  }, []);

  // Escape key handler - must be after handleCancel is defined
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        handleCancel();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, handleCancel]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      handleCancel();
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[500] flex items-end sm:items-center justify-center bg-black/50"
      role="dialog"
      aria-modal="true"
      aria-labelledby="accessibility-modal-title"
      onClick={handleBackdropClick}
    >
      <div
        ref={modalRef}
        className="bg-white rounded-t-2xl sm:rounded-lg shadow-xl w-full sm:max-w-lg sm:mx-4
                   max-h-[95vh] sm:max-h-[90vh] overflow-y-auto overscroll-contain
                   flex flex-col"
      >
        {/* Mobile drag indicator */}
        <div className="sm:hidden flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 bg-nhs-mid-grey/30 rounded-full"></div>
        </div>

        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-nhs-pale-grey sticky top-0 bg-white z-10">
          <h2
            id="accessibility-modal-title"
            className="text-lg sm:text-xl font-bold text-text-primary"
          >
            {t('accessibility.modal.title')}
          </h2>
          <button
            ref={closeButtonRef}
            type="button"
            onClick={handleCancel}
            className="p-2.5 sm:p-2 text-text-secondary hover:text-text-primary rounded-md
                       focus:outline-none focus:ring-2 focus:ring-focus focus:bg-focus
                       min-w-[44px] min-h-[44px] flex items-center justify-center touch-manipulation"
            aria-label={t('common.close')}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content - scrollable area */}
        <div className="p-4 sm:p-6 space-y-5 sm:space-y-6 flex-1 overflow-y-auto">
          {/* Text Size */}
          <fieldset>
            <legend className="text-base font-semibold text-text-primary mb-3">
              {t('accessibility.modal.textSize')}
            </legend>
            <div className="grid grid-cols-2 gap-2 sm:gap-3">
              {(['small', 'medium', 'large', 'extra-large'] as const).map((size) => (
                <label
                  key={size}
                  className={`flex items-center justify-center p-3 sm:p-4 rounded-md border-2 cursor-pointer
                             transition-colors duration-fast min-h-[44px] touch-manipulation
                             ${settings.textSize === size
                               ? 'border-nhs-blue bg-nhs-blue/5 text-nhs-blue'
                               : 'border-nhs-pale-grey hover:border-nhs-mid-grey'
                             }
                             focus-within:ring-2 focus-within:ring-focus focus-within:ring-offset-2`}
                >
                  <input
                    type="radio"
                    name="textSize"
                    value={size}
                    checked={settings.textSize === size}
                    onChange={(e) => setSettings((s) => ({ ...s, textSize: e.target.value as AccessibilitySettings['textSize'] }))}
                    className="sr-only"
                  />
                  <span className="text-sm font-medium">
                    {t(`accessibility.modal.textSizeOptions.${size}`)}
                  </span>
                </label>
              ))}
            </div>
          </fieldset>

          {/* High Contrast Toggle - Larger touch target on mobile */}
          <div className="flex items-center justify-between gap-4 py-2">
            <label htmlFor="highContrast" className="text-base font-semibold text-text-primary flex-1">
              {t('accessibility.modal.highContrast')}
            </label>
            <button
              type="button"
              id="highContrast"
              role="switch"
              aria-checked={settings.highContrast}
              onClick={() => setSettings((s) => ({ ...s, highContrast: !s.highContrast }))}
              className={`relative inline-flex h-8 w-14 sm:h-7 sm:w-12 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent
                         transition-colors duration-200 ease-in-out touch-manipulation
                         focus:outline-none focus:ring-2 focus:ring-focus focus:ring-offset-2
                         ${settings.highContrast ? 'bg-nhs-blue' : 'bg-nhs-mid-grey'}`}
            >
              <span
                className={`pointer-events-none inline-block h-7 w-7 sm:h-6 sm:w-6 transform rounded-full bg-white shadow ring-0
                           transition duration-200 ease-in-out
                           ${settings.highContrast ? 'translate-x-6 sm:translate-x-5' : 'translate-x-0'}`}
              />
            </button>
          </div>

          {/* Reduced Motion Toggle - Larger touch target on mobile */}
          <div className="flex items-center justify-between gap-4 py-2">
            <label htmlFor="reducedMotion" className="text-base font-semibold text-text-primary flex-1">
              {t('accessibility.modal.reducedMotion')}
            </label>
            <button
              type="button"
              id="reducedMotion"
              role="switch"
              aria-checked={settings.reducedMotion}
              onClick={() => setSettings((s) => ({ ...s, reducedMotion: !s.reducedMotion }))}
              className={`relative inline-flex h-8 w-14 sm:h-7 sm:w-12 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent
                         transition-colors duration-200 ease-in-out touch-manipulation
                         focus:outline-none focus:ring-2 focus:ring-focus focus:ring-offset-2
                         ${settings.reducedMotion ? 'bg-nhs-blue' : 'bg-nhs-mid-grey'}`}
            >
              <span
                className={`pointer-events-none inline-block h-7 w-7 sm:h-6 sm:w-6 transform rounded-full bg-white shadow ring-0
                           transition duration-200 ease-in-out
                           ${settings.reducedMotion ? 'translate-x-6 sm:translate-x-5' : 'translate-x-0'}`}
              />
            </button>
          </div>

          {/* Line Spacing */}
          <fieldset>
            <legend className="text-base font-semibold text-text-primary mb-3">
              {t('accessibility.modal.lineSpacing')}
            </legend>
            <div className="grid grid-cols-3 gap-2 sm:gap-3">
              {(['normal', 'relaxed', 'loose'] as const).map((spacing) => (
                <label
                  key={spacing}
                  className={`flex items-center justify-center p-3 sm:p-4 rounded-md border-2 cursor-pointer
                             transition-colors duration-fast min-h-[44px] touch-manipulation
                             ${settings.lineSpacing === spacing
                               ? 'border-nhs-blue bg-nhs-blue/5 text-nhs-blue'
                               : 'border-nhs-pale-grey hover:border-nhs-mid-grey'
                             }
                             focus-within:ring-2 focus-within:ring-focus focus-within:ring-offset-2`}
                >
                  <input
                    type="radio"
                    name="lineSpacing"
                    value={spacing}
                    checked={settings.lineSpacing === spacing}
                    onChange={(e) => setSettings((s) => ({ ...s, lineSpacing: e.target.value as AccessibilitySettings['lineSpacing'] }))}
                    className="sr-only"
                  />
                  <span className="text-sm font-medium">
                    {t(`accessibility.modal.lineSpacingOptions.${spacing}`)}
                  </span>
                </label>
              ))}
            </div>
          </fieldset>
        </div>

        {/* Footer - sticky at bottom, full-width buttons on mobile */}
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 p-4 border-t border-nhs-pale-grey bg-bg-surface-secondary sticky bottom-0">
          <Button
            variant="ghost"
            onClick={handleReset}
            className="order-3 sm:order-1 sm:mr-auto w-full sm:w-auto"
          >
            {t('accessibility.modal.reset')}
          </Button>
          <Button
            variant="outline"
            onClick={handleCancel}
            className="order-2 w-full sm:w-auto"
          >
            {t('accessibility.modal.cancel')}
          </Button>
          <Button
            variant="primary"
            onClick={handleSave}
            className="order-1 sm:order-3 w-full sm:w-auto"
          >
            {t('accessibility.modal.save')}
          </Button>
        </div>
      </div>
    </div>
  );
}
