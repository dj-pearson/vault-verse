import * as Sentry from "@sentry/react";

/**
 * Initialize Sentry error tracking
 * Only initializes if VITE_SENTRY_DSN is set in environment
 */
export function initSentry() {
  const dsn = import.meta.env.VITE_SENTRY_DSN;
  const environment = import.meta.env.VITE_ENV || "development";

  // Only initialize Sentry if DSN is provided
  if (dsn) {
    Sentry.init({
      dsn,
      environment,
      integrations: [
        Sentry.browserTracingIntegration(),
        Sentry.replayIntegration({
          maskAllText: true,
          blockAllMedia: true,
        }),
      ],
      // Performance Monitoring
      tracesSampleRate: environment === "production" ? 0.1 : 1.0,
      // Session Replay
      replaysSessionSampleRate: 0.1,
      replaysOnErrorSampleRate: 1.0,
      // Release tracking
      release: import.meta.env.VITE_APP_VERSION,
      // Filter out sensitive data
      beforeSend(event) {
        // Remove sensitive query parameters
        if (event.request?.url) {
          event.request.url = event.request.url.replace(
            /([?&])(token|key|secret|password)=[^&]*/gi,
            "$1$2=REDACTED"
          );
        }
        return event;
      },
      // Ignore common errors that aren't actionable
      ignoreErrors: [
        // Browser extension errors
        "top.GLOBALS",
        "canvas.contentDocument",
        // Network errors that we can't control
        "Network request failed",
        "NetworkError",
        "Failed to fetch",
        // ResizeObserver errors (known React issue)
        "ResizeObserver loop limit exceeded",
        "ResizeObserver loop completed with undelivered notifications",
      ],
    });

    console.log("Sentry initialized for environment:", environment);
  } else {
    console.log("Sentry DSN not provided, error tracking disabled");
  }
}

/**
 * Manually capture an exception
 */
export function captureException(error: Error, context?: Record<string, any>) {
  if (import.meta.env.VITE_SENTRY_DSN) {
    Sentry.captureException(error, {
      extra: context,
    });
  } else {
    // In development, log to console
    console.error("Error:", error, context);
  }
}

/**
 * Manually capture a message
 */
export function captureMessage(
  message: string,
  level: "info" | "warning" | "error" = "info",
  context?: Record<string, any>
) {
  if (import.meta.env.VITE_SENTRY_DSN) {
    Sentry.captureMessage(message, {
      level,
      extra: context,
    });
  } else {
    console.log(`[${level.toUpperCase()}]`, message, context);
  }
}

/**
 * Set user context for error tracking
 */
export function setUser(user: { id: string; email?: string } | null) {
  if (import.meta.env.VITE_SENTRY_DSN) {
    Sentry.setUser(user);
  }
}

/**
 * Add breadcrumb for debugging
 */
export function addBreadcrumb(message: string, data?: Record<string, any>) {
  if (import.meta.env.VITE_SENTRY_DSN) {
    Sentry.addBreadcrumb({
      message,
      data,
      level: "info",
    });
  }
}

export { Sentry };
