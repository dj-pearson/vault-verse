import { Navigation } from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Lock, Check } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useState, useEffect } from "react";

export default function Signup() {
  const { signUp, user } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
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
      await signUp(email, password, fullName);
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
          <div className="grid lg:grid-cols-2 gap-12 items-start">
            {/* Left side - Signup Form */}
            <div>
              <div className="max-w-md">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent text-accent-foreground text-sm font-medium mb-6">
                  <Lock className="h-4 w-4" />
                  Coming Soon
                </div>
                
                <h1 className="text-4xl md:text-5xl font-bold mb-4">
                  Launching December 1st, 2025
                </h1>
                <p className="text-lg text-muted-foreground mb-8">
                  We're preparing something special. Sign up will be available at launch.
                </p>

                <Card className="p-8 bg-muted/30">
                  <div className="text-center py-8">
                    <Lock className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                    <h3 className="text-xl font-semibold mb-2">Signups Currently Closed</h3>
                    <p className="text-muted-foreground mb-6">
                      New account registration will open on December 1st, 2025.
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Already have an account?{" "}
                      <Link to="/login" className="text-primary font-medium hover:underline">
                        Sign in here
                      </Link>
                    </p>
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-6 hidden">
                    <div className="space-y-2">
                      <Label htmlFor="fullName">Full Name</Label>
                      <Input 
                        id="fullName" 
                        type="text" 
                        placeholder="John Doe"
                        className="h-11"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        required
                      />
                    </div>

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
                        placeholder="At least 6 characters"
                        className="h-11"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        minLength={6}
                      />
                      <p className="text-xs text-muted-foreground">
                        Must be at least 6 characters
                      </p>
                    </div>

                    <Button type="submit" className="w-full h-11" size="lg" disabled={loading}>
                      {loading ? 'Creating account...' : 'Create Account'}
                    </Button>
                  </form>

                  <div className="mt-6 text-center text-sm">
                    <span className="text-muted-foreground">Already have an account? </span>
                    <Link to="/login" className="text-primary font-medium hover:underline">
                      Sign in
                    </Link>
                  </div>
                </Card>

                <div className="mt-6 p-4 rounded-lg bg-muted/30 border border-border">
                  <p className="text-sm font-medium mb-2">Want to use the free CLI only?</p>
                  <p className="text-sm text-muted-foreground mb-3">
                    No account needed for local-only usage
                  </p>
                  <Button variant="outline" size="sm" asChild>
                    <Link to="/">Download CLI</Link>
                  </Button>
                </div>
              </div>
            </div>

            {/* Right side - Benefits */}
            <div>
              <Card className="p-8 bg-gradient-primary text-white border-0">
                <h2 className="text-2xl font-bold mb-6">What's included in your trial</h2>
                
                <div className="space-y-4">
                  {[
                    "Unlimited projects and environments",
                    "Encrypted team sync",
                    "Web dashboard for metadata",
                    "Audit logs and activity tracking",
                    "Team member management (up to 25)",
                    "Priority email support",
                    "CLI access on all platforms",
                    "Import/export .env files",
                  ].map((feature, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <div className="p-1 rounded-full bg-white/20 flex-shrink-0 mt-0.5">
                        <Check className="h-4 w-4" />
                      </div>
                      <span className="text-white/90">{feature}</span>
                    </div>
                  ))}
                </div>

                <div className="mt-8 pt-8 border-t border-white/20">
                  <p className="text-sm text-white/80">
                    💳 No credit card required for trial<br />
                    🔒 Your secrets stay encrypted<br />
                    ⚡ Cancel anytime, keep your data
                  </p>
                </div>
              </Card>

              <div className="mt-6 p-6 rounded-lg bg-muted/30 border border-border">
                <h3 className="font-semibold mb-4">Trusted by developers</h3>
                <div className="grid grid-cols-2 gap-4 text-sm text-muted-foreground">
                  <div>
                    <div className="text-2xl font-bold text-foreground mb-1">1,000+</div>
                    <div>Active developers</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-foreground mb-1">10,000+</div>
                    <div>Projects managed</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-foreground mb-1">99.9%</div>
                    <div>Uptime SLA</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-foreground mb-1">Zero</div>
                    <div>Data breaches</div>
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
