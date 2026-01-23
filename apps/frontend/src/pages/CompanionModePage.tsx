/**
 * @fileoverview Companion mode selection page.
 * Allows users to indicate whether they are a patient or supporting someone else.
 * @module pages/CompanionModePage
 * @version 1.0.0
 * @since 2.7.0
 */

import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useSession } from '@/context/SessionContext';
import type { SupportedLanguage, UserRole, CarerRelationship } from '@renal-decision-aid/shared-types';

/** Carer relationship options for selection. */
const CARER_RELATIONSHIPS: { value: CarerRelationship; labelKey: string }[] = [
  { value: 'spouse', labelKey: 'carerRelationship.spouse' },
  { value: 'mum', labelKey: 'carerRelationship.mum' },
  { value: 'dad', labelKey: 'carerRelationship.dad' },
  { value: 'child', labelKey: 'carerRelationship.child' },
  { value: 'sibling', labelKey: 'carerRelationship.sibling' },
  { value: 'friend', labelKey: 'carerRelationship.friend' },
  { value: 'professional', labelKey: 'carerRelationship.professional' },
  { value: 'other', labelKey: 'carerRelationship.other' },
];

/**
 * Companion mode selection page.
 * Displayed between language selection and disclaimer.
 */
export default function CompanionModePage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();
  const { createSession } = useSession();

  const selectedLanguage = (location.state as { language?: SupportedLanguage })?.language || 'en';

  const [userRoleSelection, setUserRoleSelection] = useState<UserRole>('patient');
  const [carerRelationshipSelection, setCarerRelationshipSelection] = useState<CarerRelationship | null>(null);
  const [customCarerLabel, setCustomCarerLabel] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 50);
    return () => clearTimeout(timer);
  }, []);

  // Redirect to language page if no language was passed
  useEffect(() => {
    if (!location.state || !(location.state as { language?: string }).language) {
      navigate('/language', { replace: true });
    }
  }, [location.state, navigate]);

  const handleContinue = async () => {
    if (isLoading) return;
    setIsLoading(true);

    try {
      await createSession(
        selectedLanguage,
        userRoleSelection,
        carerRelationshipSelection || undefined,
        customCarerLabel.trim() || undefined
      );
      navigate('/disclaimer');
    } catch (err) {
      console.error('Failed to create session:', err);
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-bg-page">
      {/* Progress indicator */}
      <div className="bg-white border-b border-nhs-pale-grey">
        <div className="max-w-container-lg mx-auto px-3 sm:px-4 py-3">
          <div
            className="h-1.5 bg-nhs-pale-grey rounded-full overflow-hidden"
            role="progressbar"
            aria-valuenow={25}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label={t('companion.progressLabel', 'Setup progress: 25%')}
          >
            <div className="h-full w-[25%] bg-gradient-to-r from-nhs-blue to-nhs-aqua-green rounded-full transition-all duration-500" />
          </div>
          <p className="text-center text-xs text-text-secondary mt-2">
            {t('companion.progressText', 'Step 2 of 4: Who is this for?')}
          </p>
        </div>
      </div>

      <div className="max-w-container-lg mx-auto px-3 sm:px-4 py-6 sm:py-8 md:py-12">
        {/* Page Header */}
        <header
          className={`text-center mb-6 sm:mb-8 md:mb-10 transform transition-all duration-500 ease-out
                     ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'}`}
        >
          <div className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 bg-nhs-purple/10 rounded-full mb-4 sm:mb-6">
            <svg className="w-8 h-8 sm:w-10 sm:h-10 text-nhs-purple" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z" />
            </svg>
          </div>

          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-text-primary mb-2 sm:mb-3">
            {t('companion.title', 'Who is this for?')}
          </h1>
          <p className="text-base sm:text-lg text-text-secondary max-w-xl mx-auto px-2">
            {t('companion.subtitle', 'Let us know if you are the patient or if you are supporting someone else.')}
          </p>
        </header>

        {/* Role Selection */}
        <div
          className={`max-w-[600px] mx-auto transform transition-all duration-500 delay-100
                     ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
        >
          <div className="space-y-4">
            {/* Patient Option */}
            <label
              className={`relative flex items-start gap-4 p-5 rounded-xl border-2 cursor-pointer transition-all duration-200
                         ${userRoleSelection === 'patient'
                           ? 'border-nhs-blue bg-nhs-blue/5 shadow-md'
                           : 'border-nhs-pale-grey hover:border-nhs-blue/50 bg-white'
                         }`}
            >
              <input
                type="radio"
                name="userRole"
                value="patient"
                checked={userRoleSelection === 'patient'}
                onChange={() => {
                  setUserRoleSelection('patient');
                  setCarerRelationshipSelection(null);
                  setCustomCarerLabel('');
                }}
                className="sr-only"
              />
              <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0
                             ${userRoleSelection === 'patient' ? 'bg-nhs-blue' : 'bg-nhs-pale-grey'}`}>
                <svg className={`w-5 h-5 ${userRoleSelection === 'patient' ? 'text-white' : 'text-nhs-blue'}`} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                </svg>
              </div>
              <div className="flex-1">
                <p className="font-semibold text-lg text-text-primary">
                  {t('userRole.patient.title', "I'm the patient")}
                </p>
                <p className="text-sm text-text-secondary mt-1">
                  {t('userRole.patient.description', 'I have kidney disease and want to learn about my treatment options')}
                </p>
              </div>
              {userRoleSelection === 'patient' && (
                <div className="absolute top-3 right-3 w-6 h-6 bg-nhs-blue rounded-full flex items-center justify-center">
                  <svg className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" aria-hidden="true">
                    <path d="M20 6L9 17l-5-5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
              )}
            </label>

            {/* Carer Option */}
            <label
              className={`relative flex items-start gap-4 p-5 rounded-xl border-2 cursor-pointer transition-all duration-200
                         ${userRoleSelection === 'carer'
                           ? 'border-nhs-purple bg-nhs-purple/5 shadow-md'
                           : 'border-nhs-pale-grey hover:border-nhs-purple/50 bg-white'
                         }`}
            >
              <input
                type="radio"
                name="userRole"
                value="carer"
                checked={userRoleSelection === 'carer'}
                onChange={() => setUserRoleSelection('carer')}
                className="sr-only"
              />
              <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0
                             ${userRoleSelection === 'carer' ? 'bg-nhs-purple' : 'bg-nhs-pale-grey'}`}>
                <svg className={`w-5 h-5 ${userRoleSelection === 'carer' ? 'text-white' : 'text-nhs-purple'}`} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                </svg>
              </div>
              <div className="flex-1">
                <p className="font-semibold text-lg text-text-primary">
                  {t('userRole.carer.title', "I'm supporting someone")}
                </p>
                <p className="text-sm text-text-secondary mt-1">
                  {t('userRole.carer.description', "I'm a carer, family member, or friend helping someone with kidney disease")}
                </p>
              </div>
              {userRoleSelection === 'carer' && (
                <div className="absolute top-3 right-3 w-6 h-6 bg-nhs-purple rounded-full flex items-center justify-center">
                  <svg className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" aria-hidden="true">
                    <path d="M20 6L9 17l-5-5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
              )}
            </label>
          </div>

          {/* Carer Relationship Selection */}
          {userRoleSelection === 'carer' && (
            <div
              className={`mt-6 p-5 bg-white border-2 border-nhs-purple/20 rounded-xl animate-fade-in
                         transform transition-all duration-300`}
            >
              <p className="font-semibold text-text-primary mb-1">
                {t('carerRelationship.title', 'Your relationship')}
              </p>
              <p className="text-sm text-text-secondary mb-4">
                {t('carerRelationship.subtitle', 'How are you connected to the person you are supporting?')}
              </p>

              <div className="flex flex-wrap gap-2 mb-4">
                {CARER_RELATIONSHIPS.map((rel) => (
                  <button
                    key={rel.value}
                    type="button"
                    onClick={() => {
                      setCarerRelationshipSelection(rel.value);
                      if (rel.value !== 'other') {
                        setCustomCarerLabel('');
                      }
                    }}
                    className={`px-4 py-2.5 rounded-full text-sm font-medium transition-all duration-200
                               ${carerRelationshipSelection === rel.value
                                 ? 'bg-nhs-purple text-white shadow-sm'
                                 : 'bg-nhs-pale-grey text-text-primary hover:bg-nhs-purple/10 hover:text-nhs-purple'
                               }`}
                  >
                    {t(rel.labelKey)}
                  </button>
                ))}
              </div>

              {/* Custom label input */}
              {carerRelationshipSelection && (
                <div className="pt-4 border-t border-nhs-pale-grey animate-fade-in">
                  <label className="block text-sm font-medium text-text-secondary mb-2">
                    {t('carerRelationship.customLabel', 'What should we call them? (optional)')}
                  </label>
                  <input
                    type="text"
                    value={customCarerLabel}
                    onChange={(e) => setCustomCarerLabel(e.target.value)}
                    placeholder={t('carerRelationship.customLabelPlaceholder', 'e.g., Mum, Dad, my friend John')}
                    className="w-full px-4 py-3 border-2 border-nhs-pale-grey rounded-lg text-sm
                               focus:outline-none focus:ring-2 focus:ring-nhs-purple focus:border-nhs-purple
                               placeholder:text-text-muted"
                    maxLength={50}
                  />
                  {customCarerLabel && (
                    <p className="mt-2 text-sm text-nhs-purple">
                      {t('carerRelationship.preview', 'The banner will show: "You are helping {{label}}"', {
                        label: customCarerLabel
                      })}
                    </p>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Navigation Buttons */}
        <div
          className={`flex flex-col-reverse sm:flex-row justify-between items-center gap-3 sm:gap-4 pt-8 mt-8 border-t border-nhs-pale-grey max-w-[600px] mx-auto
                     transform transition-all duration-500 delay-200 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
        >
          <button
            type="button"
            onClick={() => navigate('/language')}
            className="inline-flex items-center gap-2 px-4 sm:px-6 py-3 min-h-[48px] text-nhs-blue
                       transition-all duration-200 hover:bg-nhs-blue/5 rounded-lg
                       focus:outline-none focus:ring-2 focus:ring-focus focus:ring-offset-2 text-base font-medium"
            aria-label={t('nav.backToLanguage', 'Go back to language selection')}
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z" />
            </svg>
            {t('companion.back', 'Back')}
          </button>

          <button
            type="button"
            onClick={handleContinue}
            disabled={isLoading}
            className="group inline-flex items-center gap-2 px-6 sm:px-8 py-3 min-h-[52px] w-full sm:w-auto sm:min-w-[200px] justify-center
                       bg-nhs-green text-white font-bold rounded-lg text-base sm:text-lg
                       transition-all duration-200 ease-out
                       hover:bg-nhs-green-dark hover:shadow-lg hover:scale-[1.02]
                       focus:outline-none focus:ring-[3px] focus:ring-focus focus:ring-offset-2
                       disabled:bg-nhs-mid-grey disabled:cursor-not-allowed disabled:hover:scale-100 disabled:hover:shadow-none
                       active:scale-[0.98]"
            aria-label={t('nav.continueToDisclaimer', 'Continue to privacy disclaimer')}
            aria-busy={isLoading}
          >
            {isLoading ? (
              <>
                <span className="inline-block w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" aria-hidden="true" />
                <span>{t('common.loading', 'Loading...')}</span>
              </>
            ) : (
              <>
                <span>{t('common.continue', 'Continue')}</span>
                <svg className="w-5 h-5 transition-transform duration-200 group-hover:translate-x-0.5" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path d="M12 4l-1.41 1.41L16.17 11H4v2h12.17l-5.58 5.59L12 20l8-8-8-8z" />
                </svg>
              </>
            )}
          </button>
        </div>
      </div>
    </main>
  );
}
