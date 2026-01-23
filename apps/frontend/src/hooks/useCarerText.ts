/**
 * @fileoverview Hook for carer/companion mode text personalization.
 * Provides utilities for displaying carer-aware text based on the user's role
 * and their relationship to the patient.
 * @module hooks/useCarerText
 * @version 1.0.0
 * @since 2.7.0
 */

import { useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useSession } from '@/context/SessionContext';
import type { CarerRelationship } from '@renal-decision-aid/shared-types';

/**
 * Result type for the useCarerText hook.
 * @interface CarerTextResult
 */
interface CarerTextResult {
  /** Whether the user is in carer/companion mode */
  isCarer: boolean;
  /** The carer's relationship to the patient */
  relationship: CarerRelationship | undefined;
  /** Translated relationship label (e.g., "your spouse", "your parent") */
  relationshipLabel: string;
  /** Possessive form with "your" prefix (e.g., "your spouse's") */
  possessiveLabel: string;
  /** Subject pronoun (e.g., "they" for carer, "you" for patient) */
  subjectPronoun: string;
  /** Object pronoun (e.g., "them" for carer, "you" for patient) */
  objectPronoun: string;
  /** Possessive pronoun (e.g., "their" for carer, "your" for patient) */
  possessivePronoun: string;
  /**
   * Get the appropriate translation key based on carer mode.
   * Returns carer variant key if in carer mode and variant exists.
   * @param baseKey - The base translation key (without _carer suffix)
   * @returns The appropriate key to use
   */
  getKey: (baseKey: string) => string;
  /**
   * Translate with automatic carer variant selection and relationship interpolation.
   * @param baseKey - The base translation key (without _carer suffix)
   * @param defaultValue - Optional default value if key not found
   * @param options - Additional interpolation options
   * @returns Translated string with carer-aware content
   */
  tCarer: (
    baseKey: string,
    defaultValue?: string,
    options?: Record<string, unknown>
  ) => string;
}

/**
 * Hook for carer/companion mode text personalization.
 *
 * Provides utilities for:
 * - Detecting if user is in carer mode
 * - Getting translated relationship labels
 * - Auto-selecting carer variant translations (with _carer suffix)
 * - Interpolating relationship and pronoun placeholders
 *
 * @example
 * ```tsx
 * function JourneyStagePage() {
 *   const { tCarer, isCarer } = useCarerText();
 *
 *   return (
 *     <h1>{tCarer('journey.title')}</h1>
 *     // Patient mode: "Where Are You in Your Journey?"
 *     // Carer mode (spouse): "Where is Your Spouse/Partner in Their Journey?"
 *   );
 * }
 * ```
 *
 * @returns {CarerTextResult} Object with carer text utilities
 */
export function useCarerText(): CarerTextResult {
  const { t, i18n } = useTranslation();
  const { session } = useSession();

  const userRole = session?.userRole || 'patient';
  const carerRelationship = session?.carerRelationship;
  const customCarerLabel = session?.customCarerLabel;
  const isCarer = userRole === 'carer';

  // Get the translated relationship label
  // Priority: customCarerLabel > translated relationship > default
  const relationshipLabel = useMemo(() => {
    if (!isCarer) return '';

    // Use custom label if provided (e.g., "Mum", "my friend John")
    if (customCarerLabel?.trim()) {
      return customCarerLabel.trim();
    }

    if (!carerRelationship) {
      return t('carerRelationship.thePerson', 'the person you\'re supporting');
    }

    // Return "your [relationship]" format for preset relationships
    const relationshipName = t(
      `carerRelationship.${carerRelationship}`,
      carerRelationship
    );
    return `${t('pronouns.your', 'your')} ${relationshipName}`;
  }, [isCarer, carerRelationship, customCarerLabel, t]);

  // Possessive form of relationship (e.g., "your spouse's", "Mum's")
  const possessiveLabel = useMemo(() => {
    if (!isCarer) return t('pronouns.your', 'your');

    // Use custom label if provided
    if (customCarerLabel?.trim()) {
      return `${customCarerLabel.trim()}'s`;
    }

    if (!carerRelationship) {
      return t('pronouns.their', 'their');
    }
    const relationshipName = t(
      `carerRelationship.${carerRelationship}`,
      carerRelationship
    );
    return `${t('pronouns.your', 'your')} ${relationshipName}'s`;
  }, [isCarer, carerRelationship, customCarerLabel, t]);

  // Pronouns based on mode
  const subjectPronoun = useMemo(
    () => (isCarer ? t('pronouns.they', 'they') : t('pronouns.you', 'you')),
    [isCarer, t]
  );

  const objectPronoun = useMemo(
    () => (isCarer ? t('pronouns.them', 'them') : t('pronouns.you', 'you')),
    [isCarer, t]
  );

  const possessivePronoun = useMemo(
    () => (isCarer ? t('pronouns.their', 'their') : t('pronouns.your', 'your')),
    [isCarer, t]
  );

  // Get the appropriate key based on carer mode
  const getKey = useCallback(
    (baseKey: string): string => {
      if (!isCarer) return baseKey;
      const carerKey = `${baseKey}_carer`;
      // Check if carer variant exists in translations
      const hasCarerVariant = i18n.exists(carerKey);
      return hasCarerVariant ? carerKey : baseKey;
    },
    [isCarer, i18n]
  );

  // Translate with automatic carer variant and relationship interpolation
  const tCarer = useCallback(
    (
      baseKey: string,
      defaultValue?: string,
      options?: Record<string, unknown>
    ): string => {
      const key = getKey(baseKey);
      const capitalizedRelationship = relationshipLabel.charAt(0).toUpperCase() + relationshipLabel.slice(1);
      const interpolationOptions = {
        relationship: relationshipLabel,
        Relationship: capitalizedRelationship,
        they: subjectPronoun,
        They: subjectPronoun.charAt(0).toUpperCase() + subjectPronoun.slice(1),
        them: objectPronoun,
        Them: objectPronoun.charAt(0).toUpperCase() + objectPronoun.slice(1),
        their: possessivePronoun,
        Their: possessivePronoun.charAt(0).toUpperCase() + possessivePronoun.slice(1),
        ...options,
      };

      if (defaultValue) {
        return t(key, defaultValue, interpolationOptions);
      }
      return t(key, interpolationOptions);
    },
    [getKey, t, relationshipLabel, subjectPronoun, objectPronoun, possessivePronoun]
  );

  return {
    isCarer,
    relationship: carerRelationship,
    relationshipLabel,
    possessiveLabel,
    subjectPronoun,
    objectPronoun,
    possessivePronoun,
    getKey,
    tCarer,
  };
}

export default useCarerText;
