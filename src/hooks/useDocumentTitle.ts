import { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";

const DEFAULT_TITLE = "ENVault - Secure Environment Variable Management";

/**
 * Hook to manage the document title dynamically.
 *
 * WCAG 2.1 Success Criterion 2.4.2 - Page Titled (Level A)
 *
 * @param title - The page-specific title
 * @param options - Configuration options
 *
 * @example
 * ```tsx
 * // Simple usage
 * useDocumentTitle("Dashboard");
 * // Result: "Dashboard | ENVault"
 *
 * // With announcement
 * useDocumentTitle("Settings", { announcePageChange: true });
 * // Screen reader will announce "Settings page loaded"
 * ```
 */
export function useDocumentTitle(
  title?: string,
  options: {
    /** Suffix to append to the title (default: "ENVault") */
    suffix?: string;
    /** Whether to announce page changes to screen readers */
    announcePageChange?: boolean;
    /** Keep original title when component unmounts */
    preserveOnUnmount?: boolean;
  } = {}
) {
  const {
    suffix = "ENVault",
    announcePageChange = true,
    preserveOnUnmount = false,
  } = options;

  const previousTitle = useRef(document.title);
  const location = useLocation();

  useEffect(() => {
    // Store the original title on mount
    if (!preserveOnUnmount) {
      previousTitle.current = document.title;
    }

    // Construct the new title
    const newTitle = title ? `${title} | ${suffix}` : DEFAULT_TITLE;

    // Update the document title
    document.title = newTitle;

    // Announce page change to screen readers
    if (announcePageChange && title) {
      announcePageLoaded(title);
    }

    // Restore previous title on unmount (optional)
    return () => {
      if (!preserveOnUnmount) {
        document.title = previousTitle.current;
      }
    };
  }, [title, suffix, announcePageChange, preserveOnUnmount, location.pathname]);
}

/**
 * Announce page loaded to screen readers.
 * Creates a temporary live region for the announcement.
 */
function announcePageLoaded(pageTitle: string) {
  // Create a temporary live region for the announcement
  const announcement = document.createElement("div");
  announcement.setAttribute("role", "status");
  announcement.setAttribute("aria-live", "polite");
  announcement.setAttribute("aria-atomic", "true");
  announcement.className = "sr-only";
  announcement.textContent = `${pageTitle} page loaded`;

  document.body.appendChild(announcement);

  // Remove the announcement after it's been read
  setTimeout(() => {
    document.body.removeChild(announcement);
  }, 1000);
}

/**
 * Static page titles for common routes.
 * Use this for consistent title naming across the application.
 */
export const PAGE_TITLES: Record<string, string> = {
  "/": "Home",
  "/features": "Features",
  "/pricing": "Pricing",
  "/docs": "Documentation",
  "/docs/installation": "Installation Guide",
  "/docs/quickstart": "Quick Start",
  "/docs/cli": "CLI Reference",
  "/docs/team": "Team Setup",
  "/docs/security": "Security",
  "/docs/integrations": "Integrations",
  "/login": "Sign In",
  "/signup": "Create Account",
  "/dashboard": "Dashboard",
  "/dashboard/team": "Team Management",
  "/dashboard/settings": "Settings",
  "/admin": "Admin Panel",
  "/accessibility": "Accessibility Statement",
};

/**
 * Hook that automatically sets the document title based on the current route.
 *
 * @example
 * ```tsx
 * // In your layout component
 * useAutoDocumentTitle();
 * ```
 */
export function useAutoDocumentTitle() {
  const location = useLocation();

  useEffect(() => {
    const title = PAGE_TITLES[location.pathname];
    if (title) {
      document.title = `${title} | ENVault`;
    }
  }, [location.pathname]);
}

export default useDocumentTitle;
