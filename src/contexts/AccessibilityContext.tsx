import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  ReactNode,
} from "react";
import { LiveRegion, AssertiveLiveRegion } from "@/components/accessibility/LiveRegion";

interface AccessibilityContextType {
  /** Announce a message to screen readers (polite) */
  announce: (message: string) => void;
  /** Announce an urgent message to screen readers (assertive) */
  announceUrgent: (message: string) => void;
  /** Whether reduced motion is preferred */
  prefersReducedMotion: boolean;
  /** Whether high contrast is preferred */
  prefersHighContrast: boolean;
  /** Focus a specific element by ID */
  focusElement: (elementId: string) => void;
  /** Return focus to the previously focused element */
  returnFocus: () => void;
  /** Save the current focused element for later restoration */
  saveFocus: () => void;
}

const AccessibilityContext = createContext<AccessibilityContextType | undefined>(
  undefined
);

interface AccessibilityProviderProps {
  children: ReactNode;
}

/**
 * AccessibilityProvider provides accessibility features throughout the application.
 *
 * Features:
 * - Screen reader announcements via ARIA live regions
 * - Reduced motion detection
 * - High contrast detection
 * - Focus management utilities
 *
 * WCAG 2.1 Compliance:
 * - 4.1.3 Status Messages (Level AA)
 * - 2.3.3 Animation from Interactions (Level AAA)
 * - 2.4.3 Focus Order (Level A)
 */
export function AccessibilityProvider({ children }: AccessibilityProviderProps) {
  const [politeMessage, setPoliteMessage] = useState("");
  const [assertiveMessage, setAssertiveMessage] = useState("");
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const [prefersHighContrast, setPrefersHighContrast] = useState(false);
  const [savedFocus, setSavedFocus] = useState<HTMLElement | null>(null);

  // Detect user preferences for reduced motion
  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    setPrefersReducedMotion(mediaQuery.matches);

    const handler = (e: MediaQueryListEvent) => {
      setPrefersReducedMotion(e.matches);
    };

    mediaQuery.addEventListener("change", handler);
    return () => mediaQuery.removeEventListener("change", handler);
  }, []);

  // Detect user preferences for high contrast
  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-contrast: more)");
    setPrefersHighContrast(mediaQuery.matches);

    const handler = (e: MediaQueryListEvent) => {
      setPrefersHighContrast(e.matches);
    };

    mediaQuery.addEventListener("change", handler);
    return () => mediaQuery.removeEventListener("change", handler);
  }, []);

  // Polite announcement (non-interrupting)
  const announce = useCallback((message: string) => {
    // Clear first to ensure re-announcement of same message works
    setPoliteMessage("");
    // Small delay to ensure DOM updates
    setTimeout(() => setPoliteMessage(message), 50);
  }, []);

  // Assertive announcement (interrupting)
  const announceUrgent = useCallback((message: string) => {
    setAssertiveMessage("");
    setTimeout(() => setAssertiveMessage(message), 50);
  }, []);

  // Focus management
  const focusElement = useCallback((elementId: string) => {
    const element = document.getElementById(elementId);
    if (element) {
      // Ensure element is focusable
      if (!element.hasAttribute("tabindex")) {
        element.setAttribute("tabindex", "-1");
      }
      element.focus();
    }
  }, []);

  const saveFocus = useCallback(() => {
    setSavedFocus(document.activeElement as HTMLElement);
  }, []);

  const returnFocus = useCallback(() => {
    if (savedFocus && document.body.contains(savedFocus)) {
      savedFocus.focus();
      setSavedFocus(null);
    }
  }, [savedFocus]);

  const value: AccessibilityContextType = {
    announce,
    announceUrgent,
    prefersReducedMotion,
    prefersHighContrast,
    focusElement,
    returnFocus,
    saveFocus,
  };

  return (
    <AccessibilityContext.Provider value={value}>
      {children}
      {/* Global live regions for announcements */}
      <LiveRegion message={politeMessage} politeness="polite" />
      <AssertiveLiveRegion message={assertiveMessage} />
    </AccessibilityContext.Provider>
  );
}

/**
 * Hook to access accessibility features.
 *
 * @example
 * ```tsx
 * const { announce, prefersReducedMotion } = useAccessibility();
 *
 * // Announce to screen readers
 * announce("Item successfully deleted");
 *
 * // Check motion preference
 * if (!prefersReducedMotion) {
 *   // Run animation
 * }
 * ```
 */
export function useAccessibility() {
  const context = useContext(AccessibilityContext);
  if (context === undefined) {
    throw new Error(
      "useAccessibility must be used within an AccessibilityProvider"
    );
  }
  return context;
}

/**
 * Hook for simple announcements without the full context.
 * Falls back gracefully if provider is not present.
 */
export function useAnnounce() {
  const context = useContext(AccessibilityContext);

  const announce = useCallback(
    (message: string) => {
      if (context) {
        context.announce(message);
      } else {
        // Fallback: log to console in development
        if (process.env.NODE_ENV === "development") {
          console.log("[Accessibility Announcement]:", message);
        }
      }
    },
    [context]
  );

  const announceUrgent = useCallback(
    (message: string) => {
      if (context) {
        context.announceUrgent(message);
      } else {
        if (process.env.NODE_ENV === "development") {
          console.log("[Urgent Accessibility Announcement]:", message);
        }
      }
    },
    [context]
  );

  return { announce, announceUrgent };
}

export default AccessibilityProvider;
