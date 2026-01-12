import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

interface AccessibleLoadingProps {
  /** Loading state */
  isLoading: boolean;
  /** Screen reader announcement when loading starts */
  loadingText?: string;
  /** Screen reader announcement when loading completes */
  completedText?: string;
  /** Size of the spinner */
  size?: "sm" | "md" | "lg";
  /** Additional CSS classes */
  className?: string;
  /** Whether to show inline (within content) or as overlay */
  variant?: "inline" | "overlay" | "fullscreen";
  /** Children to render when not loading */
  children?: React.ReactNode;
}

const sizeClasses = {
  sm: "h-4 w-4",
  md: "h-6 w-6",
  lg: "h-8 w-8",
};

/**
 * AccessibleLoading component for indicating loading states.
 *
 * WCAG 2.1 Success Criteria:
 * - 4.1.3 Status Messages (Level AA) - Uses aria-live for announcements
 * - 2.2.2 Pause, Stop, Hide (Level A) - Animation respects prefers-reduced-motion
 *
 * @example
 * ```tsx
 * <AccessibleLoading
 *   isLoading={isLoading}
 *   loadingText="Loading your projects"
 * >
 *   <ProjectList projects={projects} />
 * </AccessibleLoading>
 * ```
 */
export function AccessibleLoading({
  isLoading,
  loadingText = "Loading",
  completedText = "Content loaded",
  size = "md",
  className,
  variant = "inline",
  children,
}: AccessibleLoadingProps) {
  if (variant === "overlay" || variant === "fullscreen") {
    return (
      <div className="relative">
        {/* Content with aria-busy */}
        <div
          aria-busy={isLoading}
          aria-live="polite"
          className={cn(isLoading && "opacity-50 pointer-events-none")}
        >
          {children}
        </div>

        {/* Loading overlay */}
        {isLoading && (
          <div
            className={cn(
              "absolute inset-0 flex items-center justify-center bg-background/80",
              variant === "fullscreen" && "fixed z-50",
              className
            )}
            role="status"
            aria-label={loadingText}
          >
            <div className="flex flex-col items-center gap-2">
              <Loader2
                className={cn(
                  sizeClasses[size],
                  "animate-spin text-primary",
                  // Respect reduced motion preference
                  "motion-reduce:animate-none"
                )}
                aria-hidden="true"
              />
              <span className="text-sm text-muted-foreground">{loadingText}</span>
            </div>
          </div>
        )}

        {/* Screen reader announcements */}
        <div className="sr-only" aria-live="polite" aria-atomic="true">
          {isLoading ? loadingText : completedText}
        </div>
      </div>
    );
  }

  // Inline variant
  if (isLoading) {
    return (
      <div
        role="status"
        aria-busy="true"
        aria-live="polite"
        className={cn("flex items-center gap-2", className)}
      >
        <Loader2
          className={cn(
            sizeClasses[size],
            "animate-spin text-primary",
            "motion-reduce:animate-none"
          )}
          aria-hidden="true"
        />
        <span className="text-muted-foreground">{loadingText}</span>
        <span className="sr-only">{loadingText}</span>
      </div>
    );
  }

  return (
    <>
      {children}
      {/* Announce when loading completes */}
      <div className="sr-only" aria-live="polite" aria-atomic="true">
        {completedText}
      </div>
    </>
  );
}

/**
 * Simple loading spinner with accessibility support.
 */
interface LoadingSpinnerProps {
  /** Screen reader label */
  label?: string;
  /** Size of the spinner */
  size?: "sm" | "md" | "lg";
  /** Additional CSS classes */
  className?: string;
}

export function LoadingSpinner({
  label = "Loading",
  size = "md",
  className,
}: LoadingSpinnerProps) {
  return (
    <div role="status" aria-label={label} className={className}>
      <Loader2
        className={cn(
          sizeClasses[size],
          "animate-spin text-primary",
          "motion-reduce:animate-none"
        )}
        aria-hidden="true"
      />
      <span className="sr-only">{label}</span>
    </div>
  );
}

/**
 * Skeleton loading placeholder with accessibility support.
 */
interface SkeletonProps {
  /** Width of the skeleton (CSS value) */
  width?: string;
  /** Height of the skeleton (CSS value) */
  height?: string;
  /** Additional CSS classes */
  className?: string;
  /** Screen reader label */
  label?: string;
}

export function Skeleton({
  width = "100%",
  height = "1rem",
  className,
  label = "Loading content",
}: SkeletonProps) {
  return (
    <div
      role="status"
      aria-label={label}
      className={cn(
        "animate-pulse bg-muted rounded",
        "motion-reduce:animate-none",
        className
      )}
      style={{ width, height }}
    >
      <span className="sr-only">{label}</span>
    </div>
  );
}

export default AccessibleLoading;
