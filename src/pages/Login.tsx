import { Navigation } from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Lock, Terminal } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { TerminalWindow, TerminalLine } from "@/components/TerminalWindow";
import { useAuth } from "@/contexts/AuthContext";
import { useState, useEffect } from "react";

export default function Login() {
  const { signIn, user } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      await signIn(email, password);
    } catch (error) {
      // Error handled in auth context
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="pt-32 pb-20 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left side - Login Form */}
            <div>
              <div className="max-w-md">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
                  <Lock className="h-4 w-4" />
                  Zero-Knowledge Encryption
                </div>

                <h1 className="text-4xl md:text-5xl font-bold mb-4">
                  Welcome Back
                </h1>
                <p className="text-lg text-muted-foreground mb-8">
                  Sign in to manage your team's environment variables securely.
                </p>

                <Card className="p-8">
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input 
                        id="email" 
                        type="email" 
                        placeholder="you@company.com"
                        className="h-11"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="password">Password</Label>
                      <Input 
                        id="password" 
                        type="password"
                        className="h-11"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                      />
                    </div>

                    <Button type="submit" className="w-full h-11" size="lg" disabled={loading}>
                      {loading ? 'Signing in...' : 'Sign In'}
                    </Button>
                  </form>

                  <div className="mt-6 text-center text-sm">
                    <span className="text-muted-foreground">Don't have an account? </span>
                    <Link to="/signup" className="text-primary font-medium hover:underline">
                      Sign up
                    </Link>
                  </div>
                </Card>

                <div className="mt-6 text-center">
                  <p className="text-sm text-muted-foreground">
                    Using the free CLI?{" "}
                    <a href="#" className="text-primary hover:underline">
                      No account needed
                    </a>
                  </p>
                </div>
              </div>
            </div>

            {/* Right side - Terminal Demo */}
            <div className="hidden lg:block">
              <TerminalWindow>
                <TerminalLine prompt>envault login</TerminalLine>
                <TerminalLine>Opening browser for authentication...</TerminalLine>
                <div className="h-2" />
                <TerminalLine success>Logged in as alice@acme.com</TerminalLine>
                <div className="h-4" />
                <TerminalLine prompt>envault projects</TerminalLine>
                <div className="h-2" />
                <TerminalLine>Personal Projects</TerminalLine>
                <TerminalLine>my-saas-app       3 envs    Local + Synced</TerminalLine>
                <div className="h-2" />
                <TerminalLine>Team Projects (Acme Inc)</TerminalLine>
                <TerminalLine>api-service       2 envs    Synced</TerminalLine>
              </TerminalWindow>

              <div className="mt-8 space-y-4">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-primary/10 flex-shrink-0">
                    <Terminal className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">CLI-First Experience</h3>
                    <p className="text-sm text-muted-foreground">
                      Dashboard shows metadata only. Use CLI for actual secrets.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-primary/10 flex-shrink-0">
                    <Lock className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">Zero-Knowledge Security</h3>
                    <p className="text-sm text-muted-foreground">
                      Your secrets are encrypted before they reach our servers.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
