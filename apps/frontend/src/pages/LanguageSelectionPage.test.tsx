import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import LanguageSelectionPage from './LanguageSelectionPage';

// Mock the useSession hook to track createSession calls
const mockCreateSession = vi.fn().mockResolvedValue(undefined);
const mockNavigate = vi.fn();
const mockChangeLanguage = vi.fn().mockResolvedValue(undefined);

// Override the setup.ts mocks for more specific testing
vi.mock('react-router-dom', () => ({
  useNavigate: () => mockNavigate,
  useLocation: () => ({ pathname: '/language' }),
  Link: ({ children, to }: { children: React.ReactNode; to: string }) => {
    const React = require('react');
    return React.createElement('a', { href: to }, children);
  },
  BrowserRouter: ({ children }: { children: React.ReactNode }) => children,
}));

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, defaultValue?: string | object) => {
      // Return the default value if provided (as string or from object)
      if (typeof defaultValue === 'string') return defaultValue;
      if (typeof defaultValue === 'object' && 'defaultValue' in defaultValue) {
        return (defaultValue as { defaultValue: string }).defaultValue;
      }
      return key;
    },
    i18n: {
      language: 'en',
      changeLanguage: mockChangeLanguage,
    },
  }),
  Trans: ({ children }: { children: React.ReactNode }) => children,
}));

vi.mock('@/context/SessionContext', () => ({
  useSession: () => ({
    createSession: mockCreateSession,
    session: null,
    isLoading: false,
    error: null,
  }),
  SessionProvider: ({ children }: { children: React.ReactNode }) => children,
}));

// Mock the i18n config module
vi.mock('@/config/i18n', () => ({
  changeLanguageAndWait: vi.fn().mockResolvedValue(true),
}));

// Import the mocked function for assertions
import { changeLanguageAndWait as mockChangeLanguageAndWait } from '@/config/i18n';

describe('LanguageSelectionPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset speechSynthesis mocks (already stubbed in setup.ts)
    vi.mocked(window.speechSynthesis.speak).mockClear();
    vi.mocked(window.speechSynthesis.cancel).mockClear();
  });

  describe('Rendering', () => {
    it('renders the page title', () => {
      render(<LanguageSelectionPage />);

      // The title uses t() which returns the default value "Choose Your Language"
      expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Choose Your Language');
    });

    it('renders all supported languages from SUPPORTED_LANGUAGES', () => {
      render(<LanguageSelectionPage />);

      // These values come from SUPPORTED_LANGUAGES constant, not translations
      // English appears twice (nativeName and englishName are both "English")
      expect(screen.getAllByText('English').length).toBeGreaterThanOrEqual(1);
      expect(screen.getByText('Hindi')).toBeInTheDocument();
      expect(screen.getByText('Punjabi')).toBeInTheDocument();
      expect(screen.getByText('Bengali')).toBeInTheDocument();
      expect(screen.getByText('Urdu')).toBeInTheDocument();
      expect(screen.getByText('Gujarati')).toBeInTheDocument();
      expect(screen.getByText('Tamil')).toBeInTheDocument();
    });

    it('renders native language names', () => {
      render(<LanguageSelectionPage />);

      // Native names from SUPPORTED_LANGUAGES
      expect(screen.getAllByText('English').length).toBeGreaterThanOrEqual(1);
      expect(screen.getByText('हिन्दी')).toBeInTheDocument();
      expect(screen.getByText('ਪੰਜਾਬੀ')).toBeInTheDocument();
      expect(screen.getByText('বাংলা')).toBeInTheDocument();
      expect(screen.getByText('اردو')).toBeInTheDocument();
      expect(screen.getByText('ગુજરાતી')).toBeInTheDocument();
      expect(screen.getByText('தமிழ்')).toBeInTheDocument();
    });

    it('renders navigation buttons', () => {
      render(<LanguageSelectionPage />);

      expect(screen.getByText('Back to Home')).toBeInTheDocument();
      expect(screen.getByText('Continue')).toBeInTheDocument();
    });

    it('renders instruction text', () => {
      render(<LanguageSelectionPage />);

      expect(screen.getByText('Please select your preferred language. You can change this at any time.')).toBeInTheDocument();
    });

    it('renders a form with proper accessibility attributes', () => {
      render(<LanguageSelectionPage />);

      const form = screen.getByRole('form', { name: /language selection/i });
      expect(form).toBeInTheDocument();
    });

    it('renders radio group for language selection', () => {
      render(<LanguageSelectionPage />);

      const radioGroup = screen.getByRole('radiogroup');
      expect(radioGroup).toBeInTheDocument();
    });
  });

  describe('Language Selection', () => {
    it('selects a language when clicking on a language card', async () => {
      const user = userEvent.setup();
      render(<LanguageSelectionPage />);

      // Find the English radio button using its aria-label pattern
      const radios = screen.getAllByRole('radio');
      const englishRadio = radios[0]; // English is first in the list

      await user.click(englishRadio);

      expect(englishRadio).toBeChecked();
    });

    it('allows changing language selection', async () => {
      const user = userEvent.setup();
      render(<LanguageSelectionPage />);

      const radios = screen.getAllByRole('radio');
      const englishRadio = radios[0];
      const hindiRadio = radios[1];

      await user.click(englishRadio);
      expect(englishRadio).toBeChecked();

      await user.click(hindiRadio);
      expect(hindiRadio).toBeChecked();
      expect(englishRadio).not.toBeChecked();
    });

    it('shows visual selection indicator when language is selected', async () => {
      const user = userEvent.setup();
      render(<LanguageSelectionPage />);

      const radios = screen.getAllByRole('radio');
      const englishRadio = radios[0];
      await user.click(englishRadio);

      // The label should have the selected styling class
      const label = englishRadio.closest('label');
      expect(label).toHaveClass('border-nhs-blue');
    });
  });

  describe('Error Handling', () => {
    it('disables continue button when no language is selected', () => {
      render(<LanguageSelectionPage />);

      const continueButton = screen.getByRole('button', { name: /continue/i });
      expect(continueButton).toBeDisabled();
    });

    it('enables continue button when a language is selected', async () => {
      const user = userEvent.setup();
      render(<LanguageSelectionPage />);

      const continueButton = screen.getByRole('button', { name: /continue/i });
      expect(continueButton).toBeDisabled();

      // Select a language
      const radios = screen.getAllByRole('radio');
      await user.click(radios[0]);

      expect(continueButton).not.toBeDisabled();
    });
  });

  describe('Navigation', () => {
    it('navigates to home when clicking back button', async () => {
      const user = userEvent.setup();
      render(<LanguageSelectionPage />);

      const backButton = screen.getByText('Back to Home');
      await user.click(backButton);

      expect(mockNavigate).toHaveBeenCalledWith('/');
    });

    it('creates session and navigates to disclaimer on continue', async () => {
      const user = userEvent.setup();
      render(<LanguageSelectionPage />);

      // Select a language
      const radios = screen.getAllByRole('radio');
      await user.click(radios[0]); // English

      // Click continue
      const continueButton = screen.getByText('Continue');
      await user.click(continueButton);

      await waitFor(() => {
        expect(mockChangeLanguageAndWait).toHaveBeenCalledWith('en');
        // createSession is now called with (language, userRole, carerRelationship, customLabel)
        expect(mockCreateSession).toHaveBeenCalledWith('en', 'patient', undefined, undefined);
        expect(mockNavigate).toHaveBeenCalledWith('/disclaimer');
      });
    });
  });

  describe('Audio Preview', () => {
    it('renders listen buttons for each language', () => {
      render(<LanguageSelectionPage />);

      const listenButtons = screen.getAllByText('Listen');
      expect(listenButtons.length).toBe(15); // 15 supported languages
    });

    it('triggers speech synthesis when clicking listen button', async () => {
      const user = userEvent.setup();
      render(<LanguageSelectionPage />);

      const listenButtons = screen.getAllByText('Listen');
      await user.click(listenButtons[0]); // Click first listen button

      expect(window.speechSynthesis.speak).toHaveBeenCalled();
    });

    it('cancels previous audio when clicking a new listen button', async () => {
      const user = userEvent.setup();
      render(<LanguageSelectionPage />);

      const listenButtons = screen.getAllByText('Listen');

      // Click first listen button
      await user.click(listenButtons[0]);

      // Click second listen button
      await user.click(listenButtons[1]);

      // Cancel should have been called
      expect(window.speechSynthesis.cancel).toHaveBeenCalled();
    });
  });

  describe('Accessibility', () => {
    it('has accessible form labels', () => {
      render(<LanguageSelectionPage />);

      // Check for fieldset
      const fieldset = screen.getByRole('group');
      expect(fieldset).toBeInTheDocument();
    });

    it('has aria-live region for help text', () => {
      render(<LanguageSelectionPage />);

      const helpText = screen.getByText('Your language choice will be remembered for this session');
      expect(helpText.closest('[aria-live]')).toHaveAttribute('aria-live', 'polite');
    });

    it('has aria-busy on continue button while loading', async () => {
      const user = userEvent.setup();
      render(<LanguageSelectionPage />);

      // Select a language first
      const radios = screen.getAllByRole('radio');
      await user.click(radios[0]);

      const continueButton = screen.getByLabelText(/continue with selected language/i);
      // Button should have aria-busy attribute (false initially)
      expect(continueButton).toHaveAttribute('aria-busy', 'false');
    });

    it('provides aria-labels for navigation buttons', () => {
      render(<LanguageSelectionPage />);

      const backButton = screen.getByLabelText(/go back to home page/i);
      expect(backButton).toBeInTheDocument();

      const continueButton = screen.getByLabelText(/continue with selected language/i);
      expect(continueButton).toBeInTheDocument();
    });
  });
});
