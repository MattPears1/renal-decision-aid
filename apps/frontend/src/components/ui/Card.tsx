/**
 * @fileoverview Card component for the NHS Renal Decision Aid.
 * Provides a flexible container component with multiple variants.
 * @module components/ui/Card
 * @version 2.5.0
 * @since 1.0.0
 * @lastModified 21 January 2026
 */

import { HTMLAttributes, forwardRef } from 'react';
import clsx from 'clsx';

/**
 * Props for the Card component.
 * @interface CardProps
 * @extends HTMLAttributes<HTMLDivElement>
 * @property {'default' | 'elevated' | 'bordered' | 'interactive'} [variant='default'] - Visual variant
 * @property {'none' | 'sm' | 'md' | 'lg'} [padding='md'] - Padding size
 */
export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'elevated' | 'bordered' | 'interactive';
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

/**
 * Card container component with NHS styling.
 *
 * Features:
 * - Multiple visual variants
 * - Responsive padding options
 * - Interactive variant for clickable cards
 * - Rounded corners and border styling
 *
 * @component
 * @param {CardProps} props - Component props
 * @param {React.Ref<HTMLDivElement>} ref - Forwarded ref
 * @returns {JSX.Element} The rendered card
 *
 * @example
 * <Card variant="elevated" padding="lg">
 *   <CardHeader>
 *     <CardTitle>Title</CardTitle>
 *   </CardHeader>
 *   <CardContent>Content here</CardContent>
 * </Card>
 */
const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant = 'default', padding = 'md', children, ...props }, ref) => {
    const baseStyles = 'bg-white rounded-lg w-full';

    const variants = {
      default: 'border border-nhs-pale-grey',
      elevated: 'shadow-md',
      bordered: 'border-2 border-nhs-pale-grey',
      interactive:
        'border-2 border-nhs-pale-grey hover:border-nhs-blue hover:shadow-md transition-all duration-200 cursor-pointer touch-manipulation',
    };

    // Mobile-first responsive padding
    const paddings = {
      none: '',
      sm: 'p-3 sm:p-4',
      md: 'p-4 sm:p-5 md:p-6',
      lg: 'p-4 sm:p-6 md:p-8',
    };

    return (
      <div
        ref={ref}
        className={clsx(baseStyles, variants[variant], paddings[padding], className)}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Card.displayName = 'Card';

/**
 * Props for the CardHeader component.
 * @interface CardHeaderProps
 * @extends HTMLAttributes<HTMLDivElement>
 */
export interface CardHeaderProps extends HTMLAttributes<HTMLDivElement> {}

/**
 * Card header section component.
 * @component
 * @param {CardHeaderProps} props - Component props
 * @returns {JSX.Element} The rendered header
 */
export const CardHeader = forwardRef<HTMLDivElement, CardHeaderProps>(
  ({ className, children, ...props }, ref) => (
    <div ref={ref} className={clsx('mb-4', className)} {...props}>
      {children}
    </div>
  )
);

CardHeader.displayName = 'CardHeader';

/**
 * Props for the CardTitle component.
 * @interface CardTitleProps
 * @extends HTMLAttributes<HTMLHeadingElement>
 * @property {'h1' | 'h2' | 'h3' | 'h4'} [as='h3'] - Heading level to render
 */
export interface CardTitleProps extends HTMLAttributes<HTMLHeadingElement> {
  as?: 'h1' | 'h2' | 'h3' | 'h4';
}

/**
 * Card title component with configurable heading level.
 * @component
 * @param {CardTitleProps} props - Component props
 * @returns {JSX.Element} The rendered title
 */
export const CardTitle = forwardRef<HTMLHeadingElement, CardTitleProps>(
  ({ className, as: Component = 'h3', children, ...props }, ref) => (
    <Component
      ref={ref}
      className={clsx('text-lg font-semibold text-text-primary', className)}
      {...props}
    >
      {children}
    </Component>
  )
);

CardTitle.displayName = 'CardTitle';

/**
 * Props for the CardContent component.
 * @interface CardContentProps
 * @extends HTMLAttributes<HTMLDivElement>
 */
export interface CardContentProps extends HTMLAttributes<HTMLDivElement> {}

/**
 * Card content section component.
 * @component
 * @param {CardContentProps} props - Component props
 * @returns {JSX.Element} The rendered content
 */
export const CardContent = forwardRef<HTMLDivElement, CardContentProps>(
  ({ className, children, ...props }, ref) => (
    <div ref={ref} className={clsx('text-text-secondary', className)} {...props}>
      {children}
    </div>
  )
);

CardContent.displayName = 'CardContent';

/**
 * Props for the CardFooter component.
 * @interface CardFooterProps
 * @extends HTMLAttributes<HTMLDivElement>
 */
export interface CardFooterProps extends HTMLAttributes<HTMLDivElement> {}

/**
 * Card footer section component with top border.
 * @component
 * @param {CardFooterProps} props - Component props
 * @returns {JSX.Element} The rendered footer
 */
export const CardFooter = forwardRef<HTMLDivElement, CardFooterProps>(
  ({ className, children, ...props }, ref) => (
    <div ref={ref} className={clsx('mt-4 pt-4 border-t border-nhs-pale-grey', className)} {...props}>
      {children}
    </div>
  )
);

CardFooter.displayName = 'CardFooter';

export default Card;
