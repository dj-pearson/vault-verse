/**
 * Accessibility Components
 *
 * This module exports components and utilities for ADA/WCAG 2.1 AA compliance.
 *
 * WCAG 2.1 Guidelines Addressed:
 * - Perceivable: Color contrast, text alternatives, adaptable content
 * - Operable: Keyboard accessible, skip links, focus management
 * - Understandable: Labels, error identification, consistent navigation
 * - Robust: ARIA support, valid markup, status messages
 */

// Skip Links - WCAG 2.4.1 Bypass Blocks
export { SkipLink, SkipLinks } from "./SkipLink";

// Live Regions - WCAG 4.1.3 Status Messages
export { LiveRegion, AssertiveLiveRegion, LiveRegionWithRole } from "./LiveRegion";

// Form Accessibility - WCAG 3.3.1, 3.3.3 Error Identification
export { FormErrorSummary, FieldError, convertFormErrors } from "./FormErrorSummary";

// Loading States - WCAG 4.1.3, 2.2.2 Status Messages and Animation
export {
  AccessibleLoading,
  LoadingSpinner,
  Skeleton,
} from "./AccessibleLoading";

// Keyboard Shortcuts - WCAG 3.3.5 Help
export { KeyboardShortcutsHelp } from "./KeyboardShortcutsHelp";
