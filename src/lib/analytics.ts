import posthog from "posthog-js";

/**
 * Initialize PostHog analytics
 * Only initializes if VITE_POSTHOG_KEY is set in environment
 */
export function initAnalytics() {
  const apiKey = import.meta.env.VITE_POSTHOG_KEY;
  const apiHost = import.meta.env.VITE_POSTHOG_HOST || "https://app.posthog.com";
  const environment = import.meta.env.VITE_ENV || "development";

  // Only initialize PostHog if API key is provided
  if (apiKey) {
    posthog.init(apiKey, {
      api_host: apiHost,
      autocapture: false, // Disable autocapture for privacy
      capture_pageview: true,
      capture_pageleave: true,
      disable_session_recording: true, // Privacy-first approach
      loaded: (posthog) => {
        if (environment === "development") {
          posthog.debug(); // Enable debug mode in development
        }
      },
      // Respect user privacy
      opt_out_capturing_by_default: false,
      persistence: "localStorage",
      // Don't track sensitive data
      property_blacklist: [
        "$password",
        "$secret",
        "$token",
        "$key",
        "password",
        "secret",
        "token",
        "apiKey",
        "api_key",
      ],
    });

    console.log("PostHog analytics initialized for environment:", environment);
  } else {
    console.log("PostHog API key not provided, analytics disabled");
  }
}

/**
 * Track a custom event
 */
export function trackEvent(
  eventName: string,
  properties?: Record<string, any>
) {
  if (import.meta.env.VITE_POSTHOG_KEY) {
    posthog.capture(eventName, {
      ...properties,
      timestamp: new Date().toISOString(),
    });
  } else {
    // In development without PostHog, log to console
    console.log("[Analytics]", eventName, properties);
  }
}

/**
 * Identify a user (for authenticated users)
 */
export function identifyUser(userId: string, traits?: Record<string, any>) {
  if (import.meta.env.VITE_POSTHOG_KEY) {
    posthog.identify(userId, traits);
  }
}

/**
 * Reset user identity (on logout)
 */
export function resetUser() {
  if (import.meta.env.VITE_POSTHOG_KEY) {
    posthog.reset();
  }
}

/**
 * Set user properties
 */
export function setUserProperties(properties: Record<string, any>) {
  if (import.meta.env.VITE_POSTHOG_KEY) {
    posthog.people.set(properties);
  }
}

/**
 * Track page view
 */
export function trackPageView(pageName?: string) {
  if (import.meta.env.VITE_POSTHOG_KEY) {
    posthog.capture("$pageview", {
      $current_url: window.location.href,
      page_name: pageName,
    });
  }
}

/**
 * Common events to track
 */
export const AnalyticsEvents = {
  // Auth events
  SIGNUP_STARTED: "signup_started",
  SIGNUP_COMPLETED: "signup_completed",
  LOGIN_STARTED: "login_started",
  LOGIN_COMPLETED: "login_completed",
  LOGOUT: "logout",

  // Project events
  PROJECT_CREATED: "project_created",
  PROJECT_VIEWED: "project_viewed",
  PROJECT_DELETED: "project_deleted",

  // Environment events
  ENVIRONMENT_CREATED: "environment_created",
  ENVIRONMENT_SWITCHED: "environment_switched",
  ENVIRONMENT_DELETED: "environment_deleted",

  // Secret events
  SECRET_CREATED: "secret_created",
  SECRET_UPDATED: "secret_updated",
  SECRET_DELETED: "secret_deleted",
  SECRET_COPIED: "secret_copied",
  SECRETS_IMPORTED: "secrets_imported",
  SECRETS_EXPORTED: "secrets_exported",

  // Team events
  TEAM_MEMBER_INVITED: "team_member_invited",
  TEAM_MEMBER_REMOVED: "team_member_removed",

  // Subscription events
  SUBSCRIPTION_VIEWED: "subscription_viewed",
  SUBSCRIPTION_UPGRADED: "subscription_upgraded",
  SUBSCRIPTION_DOWNGRADED: "subscription_downgraded",

  // CLI events
  CLI_TOKEN_GENERATED: "cli_token_generated",
  CLI_TOKEN_REVOKED: "cli_token_revoked",

  // Help & Documentation
  DOCUMENTATION_VIEWED: "documentation_viewed",
  BLOG_ARTICLE_VIEWED: "blog_article_viewed",
  FEATURE_PAGE_VIEWED: "feature_page_viewed",
  PRICING_PAGE_VIEWED: "pricing_page_viewed",
} as const;

export { posthog };
