import clsx from 'clsx';

interface SkeletonProps {
  /** Custom className */
  className?: string;
  /** Width of the skeleton */
  width?: string | number;
  /** Height of the skeleton */
  height?: string | number;
  /** Border radius variant */
  variant?: 'text' | 'circular' | 'rectangular' | 'rounded';
  /** Animation style */
  animation?: 'pulse' | 'wave' | 'none';
}

/**
 * Skeleton Component
 *
 * Loading placeholder that shows while content is being fetched.
 * Respects reduced motion preferences.
 */
export function Skeleton({
  className,
  width,
  height,
  variant = 'text',
  animation = 'pulse',
}: SkeletonProps) {
  const variantClasses = {
    text: 'rounded h-4',
    circular: 'rounded-full',
    rectangular: 'rounded-none',
    rounded: 'rounded-lg',
  };

  const animationClasses = {
    pulse: 'animate-pulse',
    wave: 'skeleton-wave',
    none: '',
  };

  return (
    <div
      className={clsx(
        'bg-nhs-pale-grey',
        variantClasses[variant],
        animationClasses[animation],
        // Respect reduced motion preference
        'motion-reduce:animate-none',
        className
      )}
      style={{
        width: typeof width === 'number' ? `${width}px` : width,
        height: typeof height === 'number' ? `${height}px` : height,
      }}
      aria-hidden="true"
    />
  );
}

/**
 * SkeletonText Component
 *
 * Text placeholder with multiple lines.
 */
interface SkeletonTextProps {
  /** Number of lines to display */
  lines?: number;
  /** Custom className */
  className?: string;
  /** Width of the last line (percentage) */
  lastLineWidth?: string;
}

export function SkeletonText({
  lines = 3,
  className,
  lastLineWidth = '75%',
}: SkeletonTextProps) {
  return (
    <div className={clsx('space-y-3', className)} aria-hidden="true">
      {Array.from({ length: lines }, (_, i) => (
        <Skeleton
          key={i}
          variant="text"
          className="h-4"
          width={i === lines - 1 ? lastLineWidth : '100%'}
        />
      ))}
    </div>
  );
}

/**
 * SkeletonCard Component
 *
 * Card placeholder for treatment cards and hub cards.
 */
interface SkeletonCardProps {
  /** Whether to show an image area */
  hasImage?: boolean;
  /** Custom className */
  className?: string;
}

export function SkeletonCard({ hasImage = true, className }: SkeletonCardProps) {
  return (
    <div
      className={clsx(
        'bg-white border border-nhs-pale-grey rounded-xl overflow-hidden',
        className
      )}
      aria-hidden="true"
    >
      {/* Image area */}
      {hasImage && (
        <Skeleton
          variant="rectangular"
          className="w-full h-32 sm:h-40"
          animation="wave"
        />
      )}

      {/* Content area */}
      <div className="p-4 sm:p-6 space-y-4">
        {/* Title */}
        <Skeleton variant="text" className="h-6 w-3/4" />

        {/* Description lines */}
        <SkeletonText lines={2} lastLineWidth="60%" />

        {/* Button */}
        <Skeleton variant="rounded" className="h-10 w-32 mt-4" />
      </div>
    </div>
  );
}

/**
 * SkeletonTreatmentCard Component
 *
 * Specific skeleton for treatment overview cards.
 */
export function SkeletonTreatmentCard({ className }: { className?: string }) {
  return (
    <div
      className={clsx(
        'bg-white border border-nhs-pale-grey rounded-lg overflow-hidden shadow-sm',
        className
      )}
      aria-hidden="true"
    >
      {/* Icon/Visual area */}
      <div className="p-6 sm:p-8 bg-nhs-pale-grey/30 flex items-center justify-center min-h-[120px] sm:min-h-[160px]">
        <Skeleton variant="circular" className="w-16 h-16 sm:w-20 sm:h-20" />
      </div>

      {/* Content */}
      <div className="p-4 sm:p-6 space-y-4">
        <Skeleton variant="text" className="h-6 w-3/4" />
        <SkeletonText lines={2} lastLineWidth="80%" />

        {/* Key facts */}
        <div className="space-y-2 py-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center gap-2">
              <Skeleton variant="circular" className="w-4 h-4 flex-shrink-0" />
              <Skeleton variant="text" className="h-4 flex-1" />
            </div>
          ))}
        </div>

        {/* Button */}
        <Skeleton variant="rounded" className="h-11 w-full mt-4" />
      </div>
    </div>
  );
}

/**
 * SkeletonHubCard Component
 *
 * Specific skeleton for hub page cards.
 */
export function SkeletonHubCard({ className }: { className?: string }) {
  return (
    <div
      className={clsx(
        'bg-white border border-nhs-pale-grey rounded-xl sm:rounded-2xl overflow-hidden',
        className
      )}
      aria-hidden="true"
    >
      {/* Gradient header */}
      <Skeleton
        variant="rectangular"
        className="h-28 sm:h-40 bg-gradient-to-br from-nhs-pale-grey to-nhs-mid-grey/30"
        animation="wave"
      />

      {/* Content */}
      <div className="p-4 sm:p-6 space-y-3">
        <Skeleton variant="text" className="h-6 w-2/3" />
        <SkeletonText lines={2} lastLineWidth="90%" />

        {/* Footer */}
        <div className="flex justify-between items-center pt-4 border-t border-nhs-pale-grey">
          <Skeleton variant="rounded" className="h-6 w-20" />
          <Skeleton variant="rounded" className="h-10 w-24" />
        </div>
      </div>
    </div>
  );
}

/**
 * SkeletonSection Component
 *
 * Full section skeleton with heading and cards.
 */
interface SkeletonSectionProps {
  /** Number of cards to display */
  cardCount?: number;
  /** Card type */
  cardType?: 'default' | 'treatment' | 'hub';
  /** Custom className */
  className?: string;
}

export function SkeletonSection({
  cardCount = 4,
  cardType = 'default',
  className,
}: SkeletonSectionProps) {
  const CardComponent =
    cardType === 'treatment'
      ? SkeletonTreatmentCard
      : cardType === 'hub'
      ? SkeletonHubCard
      : SkeletonCard;

  return (
    <section className={clsx('space-y-6', className)} aria-hidden="true">
      {/* Section heading */}
      <div className="space-y-2">
        <Skeleton variant="text" className="h-8 w-64" />
        <Skeleton variant="text" className="h-4 w-48" />
      </div>

      {/* Cards grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-4 sm:gap-6">
        {Array.from({ length: cardCount }, (_, i) => (
          <CardComponent key={i} />
        ))}
      </div>
    </section>
  );
}

export default Skeleton;
