/**
 * @fileoverview Back to top button component for the NHS Renal Decision Aid.
 * Provides a floating button to scroll back to the top of the page.
 * @module components/BackToTop
 * @version 2.5.0
 * @since 1.0.0
 * @lastModified 21 January 2026
 */

import { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import clsx from 'clsx';

/**
 * Props for the BackToTop component.
 * @interface BackToTopProps
 * @property {number} [threshold=300] - Scroll threshold in pixels before button appears
 * @property {string} [className] - Additional CSS classes
 * @property {boolean} [show=true] - Whether to show the button
 */
interface BackToTopProps {
  /** Scroll threshold in pixels before button appears */
  threshold?: number;
  /** Custom className for styling */
  className?: string;
  /** Whether to show on this page */
  show?: boolean;
}

/**
 * Back to top floating button component.
 *
 * Features:
 * - Appears after scrolling past threshold
 * - Large touch targets for elderly/accessibility users
 * - Smooth scroll animation (respects reduced motion)
 * - Keyboard accessible
 * - Focus moves to main content after scroll
 * - Pulse animation during scroll
 *
 * @component
 * @param {BackToTopProps} props - Component props
 * @returns {JSX.Element | null} The rendered button or null
 *
 * @example
 * <BackToTop threshold={400} />
 */
export default function BackToTop({
  threshold = 300,
  className,
  show = true,
}: BackToTopProps) {
  const { t } = useTranslation();
  const [isVisible, setIsVisible] = useState(false);
  const [isScrolling, setIsScrolling] = useState(false);

  // Handle scroll visibility
  useEffect(() => {
    if (!show) return;

    let scrollTimeout: ReturnType<typeof setTimeout>;

    const handleScroll = () => {
      const scrollY = window.scrollY || document.documentElement.scrollTop;
      setIsVisible(scrollY > threshold);

      // Show scrolling state briefly
      setIsScrolling(true);
      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(() => setIsScrolling(false), 150);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });

    // Check initial position
    handleScroll();

    return () => {
      window.removeEventListener('scroll', handleScroll);
      clearTimeout(scrollTimeout);
    };
  }, [threshold, show]);

  // Scroll to top function
  const scrollToTop = useCallback(() => {
    // Check if user prefers reduced motion
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    window.scrollTo({
      top: 0,
      behavior: prefersReducedMotion ? 'auto' : 'smooth',
    });

    // Focus on the main content for accessibility
    const mainContent = document.getElementById('main-content');
    if (mainContent) {
      mainContent.setAttribute('tabindex', '-1');
      mainContent.focus();
      mainContent.removeAttribute('tabindex');
    }
  }, []);

  // Handle keyboard interaction
  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      scrollToTop();
    }
  };

  if (!show) return null;

  return (
    <button
      type="button"
      onClick={scrollToTop}
      onKeyDown={handleKeyDown}
      className={clsx(
        // Base positioning and sizing
        'fixed bottom-20 right-4 sm:bottom-24 sm:right-6 z-[250]',
        // Size - large touch target for elderly users (56px)
        'w-14 h-14 sm:w-16 sm:h-16',
        // Flexbox centering
        'flex items-center justify-center',
        // Colors
        'bg-nhs-blue text-white',
        // Shape and shadow
        'rounded-full shadow-lg',
        // Transitions
        'transition-all duration-300 ease-out',
        // Hover states
        'hover:bg-nhs-blue-dark hover:shadow-xl hover:scale-110',
        // Focus states for accessibility
        'focus:outline-none focus:ring-[3px] focus:ring-focus focus:ring-offset-2',
        'focus-visible:bg-focus focus-visible:text-text-primary',
        // Active state
        'active:scale-95 active:transition-transform active:duration-75',
        // Touch optimization
        'touch-manipulation',
        // Visibility animation
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none',
        // Subtle pulse when scrolling to draw attention
        isScrolling && isVisible && 'animate-pulse',
        className
      )}
      aria-label={t('accessibility.backToTop', 'Back to top')}
      title={t('accessibility.backToTop', 'Back to top')}
      aria-hidden={!isVisible}
      tabIndex={isVisible ? 0 : -1}
    >
      {/* Arrow Up Icon */}
      <svg
        className="w-6 h-6 sm:w-7 sm:h-7"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
        focusable="false"
      >
        <path d="M12 19V5" />
        <path d="M5 12l7-7 7 7" />
      </svg>
    </button>
  );
}
