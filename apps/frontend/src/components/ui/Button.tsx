import { ButtonHTMLAttributes, forwardRef } from 'react';
import clsx from 'clsx';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  fullWidth?: boolean;
  isLoading?: boolean;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = 'primary',
      size = 'md',
      fullWidth = false,
      isLoading = false,
      disabled,
      children,
      ...props
    },
    ref
  ) => {
    // Base styles with min-h-[48px] for enhanced WCAG 2.2 touch target compliance (elderly users)
    // Includes touch-manipulation for instant tap response
    const baseStyles = clsx(
      'inline-flex items-center justify-center gap-2',
      'font-semibold rounded-md',
      'transition-all duration-200 ease-out',
      'focus:outline-none focus:ring-[3px] focus:ring-offset-2 focus:ring-focus',
      'focus-visible:bg-focus focus-visible:text-text-primary',
      'disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none',
      'min-h-[48px] touch-manipulation',
      'active:scale-[0.98] active:transition-transform active:duration-75'
    );

    const variants = {
      primary: clsx(
        'bg-nhs-blue text-white',
        'hover:bg-nhs-blue-dark',
        'active:bg-nhs-blue-dark'
      ),
      secondary: clsx(
        'bg-nhs-green text-white',
        'hover:bg-nhs-green-dark',
        'active:bg-nhs-green-dark'
      ),
      outline: clsx(
        'border-2 border-nhs-blue text-nhs-blue bg-transparent',
        'hover:bg-nhs-blue hover:text-white',
        'active:bg-nhs-blue-dark active:text-white'
      ),
      ghost: clsx(
        'text-nhs-blue bg-transparent',
        'hover:bg-nhs-blue/10',
        'active:bg-nhs-blue/20'
      ),
      danger: clsx(
        'bg-nhs-red text-white',
        'hover:bg-nhs-red-dark',
        'active:bg-nhs-red-dark'
      ),
    };

    // Sizes with enhanced touch target dimensions
    // sm: 44px minimum (WCAG AA)
    // md: 48px (enhanced for elderly users)
    // lg: 52px (prominent actions)
    // xl: 56px (critical CTAs)
    const sizes = {
      sm: 'px-4 py-2 text-sm min-w-[44px] min-h-[44px]',
      md: 'px-5 py-2.5 text-base min-w-[48px] min-h-[48px]',
      lg: 'px-6 py-3 text-lg min-w-[52px] min-h-[52px]',
      xl: 'px-8 py-4 text-lg min-w-[56px] min-h-[56px]',
    };

    return (
      <button
        ref={ref}
        className={clsx(
          baseStyles,
          variants[variant],
          sizes[size],
          fullWidth && 'w-full',
          className
        )}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading && (
          <svg
            className="animate-spin h-5 w-5"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            aria-hidden="true"
            focusable="false"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        )}
        {isLoading && <span className="sr-only">Loading...</span>}
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';

export default Button;
