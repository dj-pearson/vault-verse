import { Navigation } from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Lock, Check } from "lucide-react";
import { Link } from "react-router-dom";

export default function Signup() {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="pt-32 pb-20 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="grid lg:grid-cols-2 gap-12 items-start">
            {/* Left side - Signup Form */}
            <div>
              <div className="max-w-md">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
                  <Lock className="h-4 w-4" />
                  14-day free trial
                </div>
                
                <h1 className="text-4xl md:text-5xl font-bold mb-4">
                  Start Your Free Trial
                </h1>
                <p className="text-lg text-muted-foreground mb-8">
                  No credit card required. Get your team syncing in minutes.
                </p>

                <Card className="p-8">
                  <form className="space-y-6">
                    <div className="space-y-2">
                      <Label htmlFor="email">Work Email</Label>
                      <Input 
                        id="email" 
                        type="email" 
                        placeholder="you@company.com"
                        className="h-11"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="team">Team Name</Label>
                      <Input 
                        id="team" 
                        type="text" 
                        placeholder="Acme Inc"
                        className="h-11"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="password">Password</Label>
                      <Input 
                        id="password" 
                        type="password"
                        placeholder="At least 8 characters"
                        className="h-11"
                      />
                      <p className="text-xs text-muted-foreground">
                        Must be at least 8 characters with a mix of letters and numbers
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="members">How many team members?</Label>
                      <Input 
                        id="members" 
                        type="number" 
                        placeholder="5"
                        min="2"
                        className="h-11"
                      />
                      <p className="text-xs text-muted-foreground">
                        $8 per user/month after trial
                      </p>
                    </div>

                    <div className="flex items-start gap-3">
                      <Checkbox id="terms" className="mt-1" />
                      <label htmlFor="terms" className="text-sm text-muted-foreground leading-relaxed">
                        I agree to the{" "}
                        <a href="#" className="text-primary hover:underline">Terms of Service</a>
                        {" "}and{" "}
                        <a href="#" className="text-primary hover:underline">Privacy Policy</a>
                      </label>
                    </div>

                    <Button type="submit" className="w-full h-11" size="lg">
                      Create Account
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
