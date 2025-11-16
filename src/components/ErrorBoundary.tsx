import * as Sentry from "@sentry/react";
import { Component, ErrorInfo, ReactNode } from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { AlertCircle } from "lucide-react";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

/**
 * Error Boundary component that catches React errors and reports to Sentry
 * Provides a fallback UI when an error occurs
 */
class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Error caught by boundary:", error, errorInfo);

    // Report to Sentry
    if (import.meta.env.VITE_SENTRY_DSN) {
      Sentry.captureException(error, {
        extra: {
          componentStack: errorInfo.componentStack,
        },
      });
    }
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
    // Reload the page to reset the app state
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      // Custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default fallback UI
      return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-background">
          <div className="max-w-md w-full">
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Something went wrong</AlertTitle>
              <AlertDescription className="mt-2">
                <p className="mb-4">
                  We encountered an unexpected error. Our team has been notified
                  and will investigate.
                </p>
                {import.meta.env.VITE_ENV === "development" && (
                  <pre className="text-xs bg-muted p-2 rounded mb-4 overflow-auto">
                    {this.state.error?.message}
                  </pre>
                )}
                <div className="flex gap-2">
                  <Button onClick={this.handleReset} variant="outline">
                    Reload Page
                  </Button>
                  <Button
                    onClick={() => (window.location.href = "/")}
                    variant="default"
                  >
                    Go Home
                  </Button>
                </div>
              </AlertDescription>
            </Alert>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Also export the Sentry-wrapped version for better error tracking
export const SentryErrorBoundary =
  import.meta.env.VITE_SENTRY_DSN
    ? Sentry.withErrorBoundary(ErrorBoundary, {
        fallback: <ErrorBoundary hasError={true} error={null} children={null} />,
        showDialog: false,
      })
    : ErrorBoundary;

export default ErrorBoundary;
