import { render } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { axe } from 'vitest-axe';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';

describe('Accessibility Tests', () => {
  describe('Button Component', () => {
    it('should have no accessibility violations', async () => {
      const { container } = render(<Button>Click me</Button>);
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('should have no violations with different variants', async () => {
      const { container } = render(
        <div>
          <Button variant="primary">Primary</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="outline">Outline</Button>
          <Button variant="ghost">Ghost</Button>
          <Button variant="danger">Danger</Button>
        </div>
      );
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('should have no violations when disabled', async () => {
      const { container } = render(<Button disabled>Disabled Button</Button>);
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('should have no violations when loading', async () => {
      const { container } = render(<Button isLoading>Loading</Button>);
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });

  describe('Card Component', () => {
    it('should have no accessibility violations', async () => {
      const { container } = render(
        <Card>
          <h2>Card Title</h2>
          <p>Card content</p>
        </Card>
      );
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('should have no violations with different variants', async () => {
      const { container } = render(
        <div>
          <Card variant="default">
            <h2>Default Card</h2>
            <p>Content</p>
          </Card>
          <Card variant="elevated">
            <h2>Elevated Card</h2>
            <p>Content</p>
          </Card>
          <Card variant="bordered">
            <h2>Bordered Card</h2>
            <p>Content</p>
          </Card>
          <Card variant="interactive">
            <h2>Interactive Card</h2>
            <p>Content</p>
          </Card>
        </div>
      );
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('should have no violations with different padding sizes', async () => {
      const { container } = render(
        <div>
          <Card padding="none">
            <h2>No Padding</h2>
          </Card>
          <Card padding="sm">
            <h2>Small Padding</h2>
          </Card>
          <Card padding="md">
            <h2>Medium Padding</h2>
          </Card>
          <Card padding="lg">
            <h2>Large Padding</h2>
          </Card>
        </div>
      );
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });
});
