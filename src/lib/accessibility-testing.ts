/**
 * Accessibility Testing Utilities
 *
 * This module provides utilities for testing accessibility during development.
 * These utilities are designed for use in development and test environments.
 *
 * For production accessibility testing, consider:
 * - axe-core (automated testing)
 * - Pa11y (CI/CD integration)
 * - Lighthouse (Chrome DevTools)
 * - WAVE (browser extension)
 */

/**
 * Check if an element has sufficient color contrast.
 * Note: This is a simplified check. Use a dedicated tool for accurate results.
 */
export function checkColorContrast(
  foreground: string,
  background: string
): { ratio: number; passes: { aa: boolean; aaa: boolean } } {
  const getLuminance = (color: string): number => {
    const hex = color.replace("#", "");
    const r = parseInt(hex.slice(0, 2), 16) / 255;
    const g = parseInt(hex.slice(2, 4), 16) / 255;
    const b = parseInt(hex.slice(4, 6), 16) / 255;

    const sRGB = [r, g, b].map((val) =>
      val <= 0.03928 ? val / 12.92 : Math.pow((val + 0.055) / 1.055, 2.4)
    );

    return 0.2126 * sRGB[0] + 0.7152 * sRGB[1] + 0.0722 * sRGB[2];
  };

  const l1 = getLuminance(foreground);
  const l2 = getLuminance(background);
  const ratio = (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);

  return {
    ratio: Math.round(ratio * 100) / 100,
    passes: {
      aa: ratio >= 4.5, // Normal text
      aaa: ratio >= 7, // Enhanced contrast
    },
  };
}

/**
 * Find all focusable elements within a container.
 */
export function getFocusableElements(
  container: HTMLElement = document.body
): HTMLElement[] {
  const selector = [
    "a[href]",
    "button:not([disabled])",
    "input:not([disabled])",
    "select:not([disabled])",
    "textarea:not([disabled])",
    '[tabindex]:not([tabindex="-1"])',
    "audio[controls]",
    "video[controls]",
    '[contenteditable]:not([contenteditable="false"])',
    "details>summary:first-of-type",
  ].join(",");

  return Array.from(container.querySelectorAll<HTMLElement>(selector));
}

/**
 * Check if an element is hidden from assistive technologies.
 */
export function isHiddenFromAT(element: HTMLElement): boolean {
  // Check aria-hidden
  if (element.getAttribute("aria-hidden") === "true") {
    return true;
  }

  // Check visibility and display
  const style = window.getComputedStyle(element);
  if (style.display === "none" || style.visibility === "hidden") {
    return true;
  }

  // Check if parent is hidden
  const parent = element.parentElement;
  if (parent && parent !== document.body) {
    return isHiddenFromAT(parent);
  }

  return false;
}

/**
 * Audit page for common accessibility issues.
 * Returns an array of issues found.
 */
export function auditPage(): {
  type: string;
  severity: "error" | "warning";
  element?: HTMLElement;
  message: string;
}[] {
  const issues: ReturnType<typeof auditPage> = [];

  // Check for images without alt text
  document.querySelectorAll<HTMLImageElement>("img:not([alt])").forEach((img) => {
    issues.push({
      type: "missing-alt",
      severity: "error",
      element: img,
      message: `Image missing alt attribute: ${img.src.slice(0, 50)}...`,
    });
  });

  // Check for buttons without accessible names
  document.querySelectorAll<HTMLButtonElement>("button").forEach((button) => {
    const hasText = button.textContent?.trim();
    const hasAriaLabel = button.getAttribute("aria-label");
    const hasAriaLabelledBy = button.getAttribute("aria-labelledby");
    const hasTitle = button.getAttribute("title");

    if (!hasText && !hasAriaLabel && !hasAriaLabelledBy && !hasTitle) {
      issues.push({
        type: "button-no-name",
        severity: "error",
        element: button,
        message: "Button has no accessible name",
      });
    }
  });

  // Check for form inputs without labels
  document
    .querySelectorAll<HTMLInputElement>("input:not([type='hidden']), select, textarea")
    .forEach((input) => {
      const id = input.id;
      const hasLabel = id && document.querySelector(`label[for="${id}"]`);
      const hasAriaLabel = input.getAttribute("aria-label");
      const hasAriaLabelledBy = input.getAttribute("aria-labelledby");
      const parentLabel = input.closest("label");

      if (!hasLabel && !hasAriaLabel && !hasAriaLabelledBy && !parentLabel) {
        issues.push({
          type: "input-no-label",
          severity: "error",
          element: input,
          message: `Form input missing label: ${input.type || "input"}`,
        });
      }
    });

  // Check for links without text
  document.querySelectorAll<HTMLAnchorElement>("a[href]").forEach((link) => {
    const hasText = link.textContent?.trim();
    const hasAriaLabel = link.getAttribute("aria-label");
    const hasAriaLabelledBy = link.getAttribute("aria-labelledby");
    const hasImg = link.querySelector("img[alt]");

    if (!hasText && !hasAriaLabel && !hasAriaLabelledBy && !hasImg) {
      issues.push({
        type: "link-no-text",
        severity: "error",
        element: link,
        message: `Link has no accessible name: ${link.href.slice(0, 50)}`,
      });
    }
  });

  // Check for proper heading hierarchy
  const headings = Array.from(
    document.querySelectorAll<HTMLHeadingElement>("h1, h2, h3, h4, h5, h6")
  );
  let lastLevel = 0;
  headings.forEach((heading) => {
    const level = parseInt(heading.tagName[1]);
    if (level > lastLevel + 1 && lastLevel !== 0) {
      issues.push({
        type: "heading-skip",
        severity: "warning",
        element: heading,
        message: `Heading level skipped from h${lastLevel} to h${level}`,
      });
    }
    lastLevel = level;
  });

  // Check for multiple h1 elements
  const h1s = document.querySelectorAll("h1");
  if (h1s.length > 1) {
    issues.push({
      type: "multiple-h1",
      severity: "warning",
      message: `Multiple h1 elements found (${h1s.length})`,
    });
  }

  // Check for main landmark
  if (!document.querySelector("main, [role='main']")) {
    issues.push({
      type: "no-main",
      severity: "warning",
      message: "No main landmark found on the page",
    });
  }

  // Check for skip link
  const firstLink = document.querySelector("a");
  if (
    !firstLink ||
    (!firstLink.textContent?.toLowerCase().includes("skip") &&
      !firstLink.getAttribute("aria-label")?.toLowerCase().includes("skip"))
  ) {
    issues.push({
      type: "no-skip-link",
      severity: "warning",
      message: "No skip link found as first focusable element",
    });
  }

  return issues;
}

/**
 * Log accessibility audit results to console (for development).
 */
export function logAccessibilityAudit(): void {
  if (process.env.NODE_ENV !== "development") {
    return;
  }

  const issues = auditPage();

  if (issues.length === 0) {
    console.log(
      "%c✓ Accessibility audit passed!",
      "color: green; font-weight: bold"
    );
    return;
  }

  console.group(
    `%c⚠ Accessibility issues found (${issues.length})`,
    "color: orange; font-weight: bold"
  );

  const errors = issues.filter((i) => i.severity === "error");
  const warnings = issues.filter((i) => i.severity === "warning");

  if (errors.length > 0) {
    console.group(`Errors (${errors.length})`);
    errors.forEach((issue) => {
      console.error(issue.message, issue.element);
    });
    console.groupEnd();
  }

  if (warnings.length > 0) {
    console.group(`Warnings (${warnings.length})`);
    warnings.forEach((issue) => {
      console.warn(issue.message, issue.element);
    });
    console.groupEnd();
  }

  console.groupEnd();
}

export default {
  checkColorContrast,
  getFocusableElements,
  isHiddenFromAT,
  auditPage,
  logAccessibilityAudit,
};
