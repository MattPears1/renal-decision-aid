import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import Layout from './Layout';

// Mock session and carer hooks
vi.mock('@/context/SessionContext', () => ({
  useSession: () => ({ session: null }),
}));

vi.mock('@/hooks/useCarerText', () => ({
  useCarerText: () => ({ isCarer: false, relationshipLabel: '' }),
}));

// Mock child components to simplify testing
vi.mock('./NHSHeader', () => ({
  default: () => <header data-testid="nhs-header">NHS Header</header>,
}));

vi.mock('./NHSFooter', () => ({
  default: () => <footer data-testid="nhs-footer">NHS Footer</footer>,
}));

vi.mock('./AccessibilityModal', () => ({
  default: ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) =>
    isOpen ? (
      <div data-testid="accessibility-modal" role="dialog">
        <button onClick={onClose}>Close</button>
      </div>
    ) : null,
  loadAccessibilitySettings: () => ({}),
  applyAccessibilitySettings: vi.fn(),
}));

// Mock react-router-dom Outlet
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    Outlet: () => <div data-testid="outlet-content">Page Content</div>,
    useLocation: () => ({ pathname: '/test' }),
  };
});

describe('Layout Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('renders the NHS header', () => {
      render(<Layout />);

      expect(screen.getByTestId('nhs-header')).toBeInTheDocument();
    });

    it('renders the NHS footer', () => {
      render(<Layout />);

      expect(screen.getByTestId('nhs-footer')).toBeInTheDocument();
    });

    it('renders the main content area', () => {
      render(<Layout />);

      const main = screen.getByRole('main');
      expect(main).toBeInTheDocument();
      expect(main).toHaveAttribute('id', 'main-content');
    });

    it('renders the outlet for child routes', () => {
      render(<Layout />);

      expect(screen.getByTestId('outlet-content')).toBeInTheDocument();
    });

    it('renders a skip link for accessibility', () => {
      render(<Layout />);

      const skipLink = screen.getByText('accessibility.skipToContent');
      expect(skipLink).toBeInTheDocument();
      expect(skipLink).toHaveAttribute('href', '#main-content');
    });

    it('renders the accessibility settings button', () => {
      render(<Layout />);

      const accessibilityButton = screen.getByLabelText('accessibility.settingsLabel');
      expect(accessibilityButton).toBeInTheDocument();
    });
  });

  describe('Structure', () => {
    it('has correct flex layout structure', () => {
      render(<Layout />);

      const container = screen.getByRole('main').parentElement;
      expect(container).toHaveClass('min-h-screen', 'flex', 'flex-col');
    });

    it('main content area has flex-1 for proper spacing', () => {
      render(<Layout />);

      const main = screen.getByRole('main');
      expect(main).toHaveClass('flex-1');
    });
  });

  describe('Accessibility Modal', () => {
    it('accessibility modal is closed by default', () => {
      render(<Layout />);

      expect(screen.queryByTestId('accessibility-modal')).not.toBeInTheDocument();
    });

    it('opens accessibility modal when button is clicked', async () => {
      const user = userEvent.setup();
      render(<Layout />);

      const accessibilityButton = screen.getByLabelText('accessibility.settingsLabel');
      await user.click(accessibilityButton);

      expect(screen.getByTestId('accessibility-modal')).toBeInTheDocument();
    });

    it('closes accessibility modal when close button is clicked', async () => {
      const user = userEvent.setup();
      render(<Layout />);

      // Open modal
      const accessibilityButton = screen.getByLabelText('accessibility.settingsLabel');
      await user.click(accessibilityButton);

      expect(screen.getByTestId('accessibility-modal')).toBeInTheDocument();

      // Close modal
      const closeButton = screen.getByText('Close');
      await user.click(closeButton);

      expect(screen.queryByTestId('accessibility-modal')).not.toBeInTheDocument();
    });
  });

  describe('Skip Link Functionality', () => {
    it('skip link has proper href to main content', () => {
      render(<Layout />);

      const skipLink = screen.getByText('accessibility.skipToContent');
      expect(skipLink.tagName).toBe('A');
      expect(skipLink).toHaveAttribute('href', '#main-content');
    });

    it('skip link has proper class for screen reader visibility', () => {
      render(<Layout />);

      const skipLink = screen.getByText('accessibility.skipToContent');
      expect(skipLink).toHaveClass('skip-link');
    });
  });

  describe('Accessibility', () => {
    it('main content has role="main"', () => {
      render(<Layout />);

      const main = screen.getByRole('main');
      expect(main).toHaveAttribute('role', 'main');
    });

    it('accessibility button has descriptive aria-label', () => {
      render(<Layout />);

      const button = screen.getByLabelText('accessibility.settingsLabel');
      expect(button).toBeInTheDocument();
    });

    it('accessibility button has title attribute', () => {
      render(<Layout />);

      const button = screen.getByLabelText('accessibility.settingsLabel');
      expect(button).toHaveAttribute('title', 'accessibility.settingsTitle');
    });
  });
});
