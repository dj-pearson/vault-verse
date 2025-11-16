import { Navigation } from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { TerminalWindow, TerminalLine } from "@/components/TerminalWindow";
import { Lock, Zap, DollarSign, Shield, Users, Terminal, Database, Clock, AlertCircle } from "lucide-react";
import { Link } from "react-router-dom";

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
              <Shield className="h-4 w-4" />
              Zero-knowledge encryption
            </div>
            
            <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-primary bg-clip-text text-transparent">
              Manage Environment Variables
              <br />Without the Pain
            </h1>
            
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Local-first, encrypted, and actually affordable. Stop losing .env files and start shipping faster.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <Button size="lg" className="text-lg px-8" asChild>
                <Link to="/signup">Download CLI - Free</Link>
              </Button>
              <Button size="lg" variant="outline" className="text-lg px-8" asChild>
                <Link to="/pricing">Try Team Sync - $8/user</Link>
              </Button>
            </div>

            <div className="flex flex-col sm:flex-row gap-6 justify-center text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Lock className="h-4 w-4" />
                Your secrets never leave your machine
              </div>
              <div className="flex items-center gap-2">
                <Terminal className="h-4 w-4" />
                Open source CLI
              </div>
            </div>
          </div>

          <TerminalWindow className="max-w-3xl mx-auto">
            <TerminalLine prompt>envault init myproject</TerminalLine>
            <TerminalLine success>Project initialized locally</TerminalLine>
            <div className="h-2" />
            <TerminalLine prompt>envault set DATABASE_URL postgres://...</TerminalLine>
            <TerminalLine success>Saved securely (encrypted at rest)</TerminalLine>
            <div className="h-2" />
            <TerminalLine prompt>envault run npm start</TerminalLine>
            <TerminalLine success>Starting with 12 environment variables</TerminalLine>
          </TerminalWindow>
        </div>
      </section>

      {/* Problems Section */}
      <section className="py-20 px-4 bg-muted/30">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">The Problem</h2>
            <p className="text-xl text-muted-foreground">Managing environment variables shouldn't be this hard</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 mb-20">
            <Card className="p-6">
              <div className="p-3 rounded-lg bg-destructive/10 w-fit mb-4">
                <Database className="h-6 w-6 text-destructive" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Lost in .env Files</h3>
              <ul className="text-muted-foreground space-y-2">
                <li>• Scattered across projects</li>
                <li>• Different values per environment</li>
                <li>• Shared via Slack (insecure)</li>
              </ul>
            </Card>

            <Card className="p-6">
              <div className="p-3 rounded-lg bg-destructive/10 w-fit mb-4">
                <Clock className="h-6 w-6 text-destructive" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Slow Onboarding</h3>
              <ul className="text-muted-foreground space-y-2">
                <li>• New devs wait hours for setup</li>
                <li>• Copy-paste errors</li>
                <li>• "It works on my machine"</li>
              </ul>
            </Card>

            <Card className="p-6">
              <div className="p-3 rounded-lg bg-destructive/10 w-fit mb-4">
                <DollarSign className="h-6 w-6 text-destructive" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Expensive Solutions</h3>
              <ul className="text-muted-foreground space-y-2">
                <li>• Doppler: $12/user/month</li>
                <li>• 1Password: $8/user/month</li>
                <li>• DIY solutions break</li>
              </ul>
            </Card>
          </div>

          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">The Solution</h2>
            <p className="text-xl text-muted-foreground">EnvVault makes it simple and secure</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Card className="p-6 border-primary/20">
              <div className="p-3 rounded-lg bg-primary/10 w-fit mb-4">
                <Lock className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Local-First & Encrypted</h3>
              <ul className="text-muted-foreground space-y-2">
                <li>• Works offline, no account needed</li>
                <li>• Encrypted with your key</li>
                <li>• We can't see your secrets</li>
              </ul>
            </Card>

            <Card className="p-6 border-primary/20">
              <div className="p-3 rounded-lg bg-primary/10 w-fit mb-4">
                <Users className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Team Sync When You Need It</h3>
              <ul className="text-muted-foreground space-y-2">
                <li>• Optional encrypted sync</li>
                <li>• Onboard devs in minutes</li>
                <li>• Audit who changed what</li>
              </ul>
            </Card>

            <Card className="p-6 border-primary/20">
              <div className="p-3 rounded-lg bg-primary/10 w-fit mb-4">
                <Zap className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Actually Affordable</h3>
              <ul className="text-muted-foreground space-y-2">
                <li>• Free for solo devs</li>
                <li>• $8/user for teams</li>
                <li>• No hidden costs</li>
              </ul>
            </Card>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-4xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">How It Works</h2>
            <p className="text-xl text-muted-foreground">Get started in minutes</p>
          </div>

          <div className="space-y-8">
            {[
              { step: "1", title: "Install CLI", command: "brew install envault" },
              { step: "2", title: "Initialize Project", command: "envault init myapp" },
              { step: "3", title: "Add Variables", command: "envault set DATABASE_URL postgres://..." },
              { step: "4", title: "Use Anywhere", command: "envault run npm start" },
            ].map((item) => (
              <div key={item.step} className="flex gap-6 items-start">
                <div className="flex-shrink-0 w-12 h-12 rounded-full bg-gradient-primary flex items-center justify-center text-white font-bold text-xl">
                  {item.step}
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-semibold mb-2">{item.title}</h3>
                  <code className="block bg-terminal-bg text-terminal-text px-4 py-3 rounded-lg font-mono text-sm">
                    $ {item.command}
                  </code>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Comparison Table */}
      <section className="py-20 px-4 bg-muted/30">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Feature Comparison</h2>
            <p className="text-xl text-muted-foreground">See how we stack up</p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left p-4 font-semibold">Feature</th>
                  <th className="text-center p-4 font-semibold text-primary">EnvVault</th>
                  <th className="text-center p-4 font-semibold">Doppler</th>
                  <th className="text-center p-4 font-semibold">1Password</th>
                  <th className="text-center p-4 font-semibold">.env Files</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { feature: "Local-First", envault: true, doppler: false, onepass: false, dotenv: true },
                  { feature: "Team Sync", envault: true, doppler: true, onepass: true, dotenv: false },
                  { feature: "Zero-Knowledge", envault: true, doppler: false, onepass: true, dotenv: null },
                  { feature: "Works Offline", envault: true, doppler: false, onepass: "Partial", dotenv: true },
                  { feature: "CLI-First", envault: true, doppler: true, onepass: false, dotenv: null },
                  { feature: "Open Source", envault: true, doppler: false, onepass: false, dotenv: null },
                ].map((row, i) => (
                  <tr key={i} className="border-b border-border/50">
                    <td className="p-4 font-medium">{row.feature}</td>
                    <td className="text-center p-4">
                      {row.envault === true && <span className="text-primary font-bold">✓</span>}
                      {row.envault === false && <span className="text-muted-foreground">✗</span>}
                      {typeof row.envault === "string" && <span className="text-muted-foreground">{row.envault}</span>}
                      {row.envault === null && <span className="text-muted-foreground">-</span>}
                    </td>
                    <td className="text-center p-4">
                      {row.doppler === true && <span className="text-primary font-bold">✓</span>}
                      {row.doppler === false && <span className="text-muted-foreground">✗</span>}
                    </td>
                    <td className="text-center p-4">
                      {row.onepass === true && <span className="text-primary font-bold">✓</span>}
                      {row.onepass === false && <span className="text-muted-foreground">✗</span>}
                      {typeof row.onepass === "string" && <span className="text-muted-foreground">{row.onepass}</span>}
                    </td>
                    <td className="text-center p-4">
                      {row.dotenv === true && <span className="text-primary font-bold">✓</span>}
                      {row.dotenv === false && <span className="text-muted-foreground">✗</span>}
                      {row.dotenv === null && <span className="text-muted-foreground">-</span>}
                    </td>
                  </tr>
                ))}
                <tr className="bg-primary/5 font-semibold">
                  <td className="p-4">Price (5 users/mo)</td>
                  <td className="text-center p-4 text-primary">$40</td>
                  <td className="text-center p-4">$60</td>
                  <td className="text-center p-4">$40</td>
                  <td className="text-center p-4">Free</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Security Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-4xl">
          <div className="text-center mb-12">
            <Shield className="h-16 w-16 text-primary mx-auto mb-6" />
            <h2 className="text-4xl font-bold mb-4">Your Secrets Are Yours. We Can't See Them.</h2>
            <p className="text-xl text-muted-foreground mb-8">
              EnvVault uses zero-knowledge encryption. Your environment variables are encrypted on your device 
              before anything touches our servers. We store encrypted blobs that only you can decrypt.
            </p>
            <Card className="p-6 bg-primary/5 border-primary/20 text-left">
              <div className="flex gap-4">
                <AlertCircle className="h-6 w-6 text-primary flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-semibold mb-2">What this means for you:</h3>
                  <ul className="space-y-2 text-muted-foreground">
                    <li>• We never see your actual secrets in plaintext</li>
                    <li>• Even if our servers are compromised, your data stays safe</li>
                    <li>• Only you and your team can decrypt your variables</li>
                    <li>• We can't recover lost encryption keys (so keep them safe!)</li>
                  </ul>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-gradient-primary">
        <div className="container mx-auto max-w-4xl text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-6 text-white">
            Ready to Stop Losing .env Files?
          </h2>
          <p className="text-xl text-white/90 mb-8">
            Start managing your environment variables the right way
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" variant="secondary" className="text-lg px-8" asChild>
              <Link to="/signup">Get Started Free</Link>
            </Button>
            <Button size="lg" variant="outline" className="text-lg px-8 bg-white/10 text-white border-white/20 hover:bg-white/20" asChild>
              <Link to="/pricing">View Pricing</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 border-t border-border">
        <div className="container mx-auto max-w-6xl">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-2 font-semibold text-xl mb-4">
                <Lock className="h-5 w-5" />
                <span>EnvVault</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Secure environment variable management for developers
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link to="/features" className="hover:text-foreground transition-colors">Features</Link></li>
                <li><Link to="/pricing" className="hover:text-foreground transition-colors">Pricing</Link></li>
                <li><Link to="/docs" className="hover:text-foreground transition-colors">Documentation</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-foreground transition-colors">About</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Blog</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Contact</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-foreground transition-colors">Privacy</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Terms</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Security</a></li>
              </ul>
            </div>
          </div>
          <div className="mt-12 pt-8 border-t border-border text-center text-sm text-muted-foreground">
            © 2025 EnvVault. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
