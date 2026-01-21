import { ButtonHTMLAttributes, forwardRef } from 'react';
import clsx from 'clsx';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
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
    // Base styles with min-h-[44px] for WCAG 2.2 touch target compliance
    const baseStyles =
      'inline-flex items-center justify-center font-semibold rounded-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-focus disabled:opacity-50 disabled:cursor-not-allowed min-h-[44px] touch-manipulation';

    const variants = {
      primary:
        'bg-nhs-blue text-white hover:bg-nhs-dark-blue active:bg-nhs-dark-blue',
      secondary:
        'bg-nhs-green text-white hover:bg-nhs-green-dark active:bg-nhs-green-dark',
      outline:
        'border-2 border-nhs-blue text-nhs-blue bg-transparent hover:bg-nhs-blue hover:text-white',
      ghost:
        'text-nhs-blue bg-transparent hover:bg-nhs-pale-grey',
      danger:
        'bg-nhs-red text-white hover:bg-red-700 active:bg-red-800',
    };

    // Sizes with minimum touch target dimensions (44px) on mobile
    const sizes = {
      sm: 'px-3 py-2 text-sm min-w-[44px]',
      md: 'px-4 py-2.5 text-base min-w-[44px]',
      lg: 'px-6 py-3 text-lg min-w-[44px]',
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
            className="animate-spin -ml-1 mr-2 h-4 w-4"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
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
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';

export default Button;
