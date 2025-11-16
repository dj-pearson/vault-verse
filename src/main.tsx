import { createRoot } from "react-dom/client";
import { HelmetProvider } from "react-helmet-async";
import App from "./App.tsx";
import "./index.css";
import { initSentry } from "./lib/sentry";
import { initAnalytics } from "./lib/analytics";
import ErrorBoundary from "./components/ErrorBoundary";

// Initialize monitoring and analytics before rendering the app
initSentry();
initAnalytics();

createRoot(document.getElementById("root")!).render(
  <ErrorBoundary>
    <HelmetProvider>
      <App />
    </HelmetProvider>
  </ErrorBoundary>
);
