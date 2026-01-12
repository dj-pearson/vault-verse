import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { AccessibilityProvider } from "./contexts/AccessibilityContext";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { AdminRoute } from "./components/AdminRoute";
import { SkipLink } from "./components/accessibility/SkipLink";
import Home from "./pages/Home";
import Features from "./pages/Features";
import Pricing from "./pages/Pricing";
import DocsLayout from "./pages/DocsLayout";
import Overview from "./pages/docs/Overview";
import Installation from "./pages/docs/Installation";
import QuickStart from "./pages/docs/QuickStart";
import CLIReference from "./pages/docs/CLIReference";
import TeamSetup from "./pages/docs/TeamSetup";
import Security from "./pages/docs/Security";
import Integrations from "./pages/docs/Integrations";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard";
import Team from "./pages/Team";
import ProjectDetail from "./pages/ProjectDetail";
import Settings from "./pages/Settings";
import Admin from "./pages/Admin";
import Accessibility from "./pages/Accessibility";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AccessibilityProvider>
          <AuthProvider>
            {/* Skip link for keyboard navigation - WCAG 2.4.1 */}
            <SkipLink />
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/features" element={<Features />} />
              <Route path="/pricing" element={<Pricing />} />
              <Route path="/accessibility" element={<Accessibility />} />
              <Route path="/docs" element={<DocsLayout />}>
                <Route index element={<Overview />} />
                <Route path="installation" element={<Installation />} />
                <Route path="quickstart" element={<QuickStart />} />
                <Route path="cli" element={<CLIReference />} />
                <Route path="team" element={<TeamSetup />} />
                <Route path="security" element={<Security />} />
                <Route path="integrations" element={<Integrations />} />
              </Route>
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
              <Route path="/dashboard/team" element={<ProtectedRoute><Team /></ProtectedRoute>} />
              <Route path="/dashboard/projects/:id" element={<ProtectedRoute><ProjectDetail /></ProtectedRoute>} />
              <Route path="/dashboard/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
              <Route path="/admin" element={<AdminRoute><Admin /></AdminRoute>} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </AuthProvider>
        </AccessibilityProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
