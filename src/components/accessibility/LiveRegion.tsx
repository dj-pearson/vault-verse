import { useEffect, useState, useId } from "react";
import { cn } from "@/lib/utils";

type AriaLiveType = "polite" | "assertive" | "off";
type AriaAtomicType = boolean;

interface LiveRegionProps {
  /** The message to announce to screen readers */
  message: string;
  /** The politeness level of the announcement */
  politeness?: AriaLiveType;
  /** Whether to announce the entire region or just changes */
  atomic?: AriaAtomicType;
  /** Delay before announcement (in ms) to avoid interrupting */
  delay?: number;
  /** Additional CSS classes */
  className?: string;
  /** Clear message after announcement (in ms), 0 to keep */
  clearAfter?: number;
}

/**
 * LiveRegion component for dynamic screen reader announcements.
 *
 * WCAG 2.1 Success Criterion 4.1.3 - Status Messages (Level AA)
 *
 * Use 'polite' for non-urgent updates (default)
 * Use 'assertive' for urgent/critical messages
 */
export function LiveRegion({
  message,
  politeness = "polite",
  atomic = true,
  delay = 100,
  className,
  clearAfter = 5000,
}: LiveRegionProps) {
  const [announcement, setAnnouncement] = useState("");
  const id = useId();

  useEffect(() => {
    if (!message) {
      setAnnouncement("");
      return;
    }

    // Small delay to ensure DOM updates complete before announcement
    const announceTimer = setTimeout(() => {
      setAnnouncement(message);
    }, delay);

    // Clear the message after a period to allow re-announcement of same message
    let clearTimer: NodeJS.Timeout | undefined;
    if (clearAfter > 0) {
      clearTimer = setTimeout(() => {
        setAnnouncement("");
      }, clearAfter);
    }

    return () => {
      clearTimeout(announceTimer);
      if (clearTimer) clearTimeout(clearTimer);
    };
  }, [message, delay, clearAfter]);

  return (
    <div
      id={id}
      role="status"
      aria-live={politeness}
      aria-atomic={atomic}
      className={cn(
        // Visually hidden but accessible to screen readers
        "sr-only",
        className
      )}
    >
      {announcement}
    </div>
  );
}

/**
 * AssertiveLiveRegion for urgent announcements that interrupt the user.
 * Use sparingly - only for critical errors or urgent information.
 */
export function AssertiveLiveRegion({
  message,
  className,
  ...props
}: Omit<LiveRegionProps, "politeness">) {
  return (
    <LiveRegion
      message={message}
      politeness="assertive"
      role="alert"
      className={className}
      {...props}
    />
  );
}

interface LiveRegionWithRoleProps extends LiveRegionProps {
  role?: "status" | "alert" | "log" | "timer" | "marquee";
}

/**
 * Extended LiveRegion with additional ARIA roles.
 */
export function LiveRegionWithRole({
  role = "status",
  ...props
}: LiveRegionWithRoleProps) {
  return (
    <div role={role}>
      <LiveRegion {...props} />
    </div>
  );
}

export default LiveRegion;
