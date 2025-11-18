import { Navigation } from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Check, Lock, Terminal } from "lucide-react";
import { Link } from "react-router-dom";

export default function Pricing() {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <section className="pt-32 pb-20 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h1 className="text-5xl md:text-6xl font-bold mb-6">
              Simple, Transparent Pricing
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Start free and scale as you grow. No hidden fees, no surprises.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {/* Free Tier */}
            <Card className="p-8 flex flex-col">
              <div className="mb-6">
                <h3 className="text-2xl font-bold mb-2">Free</h3>
                <div className="flex items-baseline gap-1">
                  <span className="text-5xl font-bold">$0</span>
                  <span className="text-muted-foreground">/forever</span>
                </div>
              </div>

              <ul className="space-y-4 mb-8 flex-1">
                <li className="flex gap-3">
                  <Check className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                  <span className="text-sm">Unlimited projects</span>
                </li>
                <li className="flex gap-3">
                  <Check className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                  <span className="text-sm">Unlimited environments</span>
                </li>
                <li className="flex gap-3">
                  <Check className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                  <span className="text-sm">Local encrypted storage</span>
                </li>
                <li className="flex gap-3">
                  <Check className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                  <span className="text-sm">CLI access</span>
                </li>
                <li className="flex gap-3">
                  <Check className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                  <span className="text-sm">Import/export .env files</span>
                </li>
                <li className="flex gap-3">
                  <Check className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                  <span className="text-sm">Open source</span>
                </li>
              </ul>

              <Button variant="outline" size="lg" className="w-full" asChild>
                <Link to="/signup">Download CLI</Link>
              </Button>
            </Card>

            {/* Team Tier */}
            <Card className="p-8 flex flex-col border-primary shadow-glow relative">
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground px-4 py-1 rounded-full text-sm font-medium">
                Most Popular
              </div>
              
              <div className="mb-6">
                <h3 className="text-2xl font-bold mb-2">Team</h3>
                <div className="flex items-baseline gap-1">
                  <span className="text-5xl font-bold">$8</span>
                  <span className="text-muted-foreground">/user/month</span>
                </div>
                <p className="text-sm text-muted-foreground mt-2">
                  Billed monthly or $80/year
                </p>
              </div>

              <ul className="space-y-4 mb-8 flex-1">
                <li className="flex gap-3">
                  <Check className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                  <span className="text-sm font-medium">Everything in Free, plus:</span>
                </li>
                <li className="flex gap-3">
                  <Check className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                  <span className="text-sm">Encrypted team sync</span>
                </li>
                <li className="flex gap-3">
                  <Check className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                  <span className="text-sm">Web dashboard (metadata only)</span>
                </li>
                <li className="flex gap-3">
                  <Check className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                  <span className="text-sm">Audit logs</span>
                </li>
                <li className="flex gap-3">
                  <Check className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                  <span className="text-sm">Team member management</span>
                </li>
                <li className="flex gap-3">
                  <Check className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                  <span className="text-sm">Priority email support</span>
                </li>
                <li className="text-sm text-muted-foreground mt-4">
                  Up to 25 team members
                </li>
              </ul>

              <Button size="lg" className="w-full" asChild>
                <Link to="/signup">Start 14-Day Free Trial</Link>
              </Button>
              <p className="text-xs text-center text-muted-foreground mt-3">
                No credit card required
              </p>
            </Card>

            {/* Enterprise Tier */}
            <Card className="p-8 flex flex-col">
              <div className="mb-6">
                <h3 className="text-2xl font-bold mb-2">Enterprise</h3>
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-bold">Custom</span>
                </div>
                <p className="text-sm text-muted-foreground mt-2">
                  For large organizations
                </p>
              </div>

              <ul className="space-y-4 mb-8 flex-1">
                <li className="flex gap-3">
                  <Check className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                  <span className="text-sm font-medium">Everything in Team, plus:</span>
                </li>
                <li className="flex gap-3">
                  <Check className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                  <span className="text-sm">Unlimited team members</span>
                </li>
                <li className="flex gap-3">
                  <Check className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                  <span className="text-sm">SSO (SAML, OIDC)</span>
                </li>
                <li className="flex gap-3">
                  <Check className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                  <span className="text-sm">Advanced audit logs</span>
                </li>
                <li className="flex gap-3">
                  <Check className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                  <span className="text-sm">SLA & dedicated support</span>
                </li>
                <li className="flex gap-3">
                  <Check className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                  <span className="text-sm">Self-hosted option</span>
                </li>
              </ul>

              <Button variant="outline" size="lg" className="w-full">
                Contact Sales
              </Button>
            </Card>
          </div>

          {/* Trust Indicators */}
          <div className="mt-20 grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <Card className="p-6 bg-primary/5 border-primary/20">
              <div className="flex gap-4">
                <Lock className="h-8 w-8 text-primary flex-shrink-0" />
                <div>
                  <h3 className="font-semibold mb-2">Zero-Knowledge Security</h3>
                  <p className="text-sm text-muted-foreground">
                    We never see your secrets. All encryption happens on your device.
                  </p>
                </div>
              </div>
            </Card>

            <Card className="p-6 bg-primary/5 border-primary/20">
              <div className="flex gap-4">
                <Terminal className="h-8 w-8 text-primary flex-shrink-0" />
                <div>
                  <h3 className="font-semibold mb-2">Works 100% Offline</h3>
                  <p className="text-sm text-muted-foreground">
                    Free tier works completely offline. Team sync is optional.
                  </p>
                </div>
              </div>
            </Card>
          </div>

          {/* FAQ */}
          <div className="mt-20 max-w-3xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-12">Frequently Asked Questions</h2>
            
            <div className="space-y-6">
              <div>
                <h3 className="font-semibold mb-2">How is this different from .env files?</h3>
                <p className="text-muted-foreground">
                  EnvVault provides encrypted storage, multi-environment support, team collaboration, 
                  and easy injection into your processes - all while maintaining security.
                </p>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Do you store my secrets?</h3>
                <p className="text-muted-foreground">
                  No. We use zero-knowledge encryption. Your secrets are encrypted on your device before 
                  any data reaches our servers. We only store encrypted blobs that we cannot decrypt.
                </p>
              </div>

              <div>
                <h3 className="font-semibold mb-2">What if I lose my encryption key?</h3>
                <p className="text-muted-foreground">
                  Because of zero-knowledge encryption, we cannot recover lost keys. This is a security 
                  feature - no one can access your secrets without your key, including us.
                </p>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Can I use EnvVault without an account?</h3>
                <p className="text-muted-foreground">
                  Yes! The free tier works 100% locally with no account required. You only need an account 
                  if you want to use team sync features.
                </p>
              </div>

              <div>
                <h3 className="font-semibold mb-2">What happens if I cancel my subscription?</h3>
                <p className="text-muted-foreground">
                  Your local data remains intact. You can export all your variables to .env files anytime. 
                  Team sync will stop, but you keep all your data.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 border-t border-border">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center text-sm text-muted-foreground">
            © 2025 ENVault. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
