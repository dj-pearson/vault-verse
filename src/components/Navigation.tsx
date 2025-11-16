import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Lock, LogOut, Shield } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useUserRole } from "@/hooks/useUserRole";

export const Navigation = () => {
  const { user, signOut } = useAuth();
  const { isAdmin } = useUserRole();

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-border bg-background/80 backdrop-blur-lg">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <Link to={user ? "/dashboard" : "/"} className="flex items-center gap-2 font-semibold text-xl">
            <div className="p-1.5 rounded-lg bg-gradient-primary">
              <Lock className="h-5 w-5 text-white" />
            </div>
            <span>EnvVault</span>
          </Link>

          <div className="hidden md:flex items-center gap-8">
            {!user && (
              <>
                <Link to="/features" className="text-sm font-medium text-foreground/80 hover:text-foreground transition-colors">
                  Features
                </Link>
                <Link to="/pricing" className="text-sm font-medium text-foreground/80 hover:text-foreground transition-colors">
                  Pricing
                </Link>
                <Link to="/docs" className="text-sm font-medium text-foreground/80 hover:text-foreground transition-colors">
                  Docs
                </Link>
              </>
            )}
            {user && (
              <>
                <Link to="/dashboard" className="text-sm font-medium text-foreground/80 hover:text-foreground transition-colors">
                  Projects
                </Link>
                <Link to="/dashboard/team" className="text-sm font-medium text-foreground/80 hover:text-foreground transition-colors">
                  Team
                </Link>
                <Link to="/dashboard/settings" className="text-sm font-medium text-foreground/80 hover:text-foreground transition-colors">
                  Settings
                </Link>
                {isAdmin && (
                  <Link to="/admin" className="text-sm font-medium text-foreground/80 hover:text-foreground transition-colors flex items-center gap-1">
                    <Shield className="h-4 w-4" />
                    Admin
                  </Link>
                )}
              </>
            )}
          </div>

          <div className="flex items-center gap-3">
            {!user ? (
              <>
                <Button variant="ghost" asChild>
                  <Link to="/login">Sign In</Link>
                </Button>
                <Button asChild>
                  <Link to="/signup">Get Started</Link>
                </Button>
              </>
            ) : (
              <Button variant="ghost" onClick={() => signOut()}>
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </Button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};
