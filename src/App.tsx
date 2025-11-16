import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { AdminRoute } from "./components/AdminRoute";
import Home from "./pages/Home";
import Features from "./pages/Features";
import Pricing from "./pages/Pricing";
import Docs from "./pages/Docs";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard";
import Team from "./pages/Team";
import ProjectDetail from "./pages/ProjectDetail";
import Settings from "./pages/Settings";
import Admin from "./pages/Admin";
import { AdminBlog } from "./pages/AdminBlog";
import { AdminSEO } from "./pages/AdminSEO";
import { AdminSecurity } from "./pages/AdminSecurity";
import { Blog } from "./pages/Blog";
import { BlogArticle } from "./pages/BlogArticle";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/features" element={<Features />} />
            <Route path="/pricing" element={<Pricing />} />
            <Route path="/docs" element={<Docs />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/blog" element={<Blog />} />
            <Route path="/blog/:slug" element={<BlogArticle />} />
            <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/dashboard/team" element={<ProtectedRoute><Team /></ProtectedRoute>} />
            <Route path="/dashboard/projects/:id" element={<ProtectedRoute><ProjectDetail /></ProtectedRoute>} />
            <Route path="/dashboard/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
            <Route path="/admin" element={<AdminRoute><Admin /></AdminRoute>} />
            <Route path="/admin/blog" element={<AdminRoute><AdminBlog /></AdminRoute>} />
            <Route path="/admin/seo" element={<AdminRoute><AdminSEO /></AdminRoute>} />
            <Route path="/admin/security" element={<AdminRoute><AdminSecurity /></AdminRoute>} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
