import { Navigation } from "@/components/Navigation";
import { Card } from "@/components/ui/card";
import { Lock, Laptop, Users, Terminal, FileCode, Shield, Zap, Globe } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

export default function Features() {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4">
          {/* Header */}
          <div className="max-w-3xl mx-auto text-center mb-16">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Built for Developers, Secured by Design
            </h1>
            <p className="text-xl text-muted-foreground">
              Everything you need to manage environment variables securely, without the complexity or cost of enterprise tools.
            </p>
          </div>

          {/* Core Features */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
            <Card className="p-6 hover:shadow-lg transition-shadow">
              <div className="h-12 w-12 rounded-lg bg-gradient-primary flex items-center justify-center mb-4">
                <Laptop className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Local-First Architecture</h3>
              <p className="text-muted-foreground mb-4">
                Works 100% offline with no account required. Your secrets stay on your machine, encrypted at rest.
              </p>
              <ul className="space-y-2 text-sm">
                <li className="flex items-start gap-2">
                  <span className="text-primary">✓</span>
                  <span>SQLite encrypted storage</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary">✓</span>
                  <span>No network required</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary">✓</span>
                  <span>Export to .env anytime</span>
                </li>
              </ul>
            </Card>

            <Card className="p-6 hover:shadow-lg transition-shadow">
              <div className="h-12 w-12 rounded-lg bg-gradient-primary flex items-center justify-center mb-4">
                <Shield className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Zero-Knowledge Encryption</h3>
              <p className="text-muted-foreground mb-4">
                We can't see your secrets. Period. End-to-end encryption means only you hold the keys.
              </p>
              <ul className="space-y-2 text-sm">
                <li className="flex items-start gap-2">
                  <span className="text-primary">✓</span>
                  <span>AES-256-GCM encryption</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary">✓</span>
                  <span>Keys stored in OS keychain</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary">✓</span>
                  <span>Server stores encrypted blobs only</span>
                </li>
              </ul>
            </Card>

            <Card className="p-6 hover:shadow-lg transition-shadow">
              <div className="h-12 w-12 rounded-lg bg-gradient-primary flex items-center justify-center mb-4">
                <Users className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Team Collaboration</h3>
              <p className="text-muted-foreground mb-4">
                Optional encrypted sync for teams. Share projects, manage access, and track changes.
              </p>
              <ul className="space-y-2 text-sm">
                <li className="flex items-start gap-2">
                  <span className="text-primary">✓</span>
                  <span>Encrypted team sync</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary">✓</span>
                  <span>Role-based permissions</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary">✓</span>
                  <span>Audit logs</span>
                </li>
              </ul>
            </Card>

            <Card className="p-6 hover:shadow-lg transition-shadow">
              <div className="h-12 w-12 rounded-lg bg-gradient-primary flex items-center justify-center mb-4">
                <Terminal className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-2">CLI-First Experience</h3>
              <p className="text-muted-foreground mb-4">
                Intuitive commands that feel natural. No complex configuration or setup required.
              </p>
              <ul className="space-y-2 text-sm">
                <li className="flex items-start gap-2">
                  <span className="text-primary">✓</span>
                  <span>Simple, memorable commands</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary">✓</span>
                  <span>Run commands with injected vars</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary">✓</span>
                  <span>Cross-platform support</span>
                </li>
              </ul>
            </Card>

            <Card className="p-6 hover:shadow-lg transition-shadow">
              <div className="h-12 w-12 rounded-lg bg-gradient-primary flex items-center justify-center mb-4">
                <FileCode className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Multi-Environment Support</h3>
              <p className="text-muted-foreground mb-4">
                Manage dev, staging, and production environments in one place. No more scattered .env files.
              </p>
              <ul className="space-y-2 text-sm">
                <li className="flex items-start gap-2">
                  <span className="text-primary">✓</span>
                  <span>Unlimited environments</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary">✓</span>
                  <span>Copy variables between envs</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary">✓</span>
                  <span>Environment-specific access</span>
                </li>
              </ul>
            </Card>

            <Card className="p-6 hover:shadow-lg transition-shadow">
              <div className="h-12 w-12 rounded-lg bg-gradient-primary flex items-center justify-center mb-4">
                <Zap className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Lightning Fast</h3>
              <p className="text-muted-foreground mb-4">
                Local SQLite database means instant reads and writes. No API latency or rate limits.
              </p>
              <ul className="space-y-2 text-sm">
                <li className="flex items-start gap-2">
                  <span className="text-primary">✓</span>
                  <span>&lt;10ms variable lookups</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary">✓</span>
                  <span>No network overhead</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary">✓</span>
                  <span>Efficient binary format</span>
                </li>
              </ul>
            </Card>
          </div>

          {/* Security Deep Dive */}
          <div className="max-w-4xl mx-auto mb-16">
            <Card className="p-8 bg-muted/30">
              <div className="flex items-start gap-4 mb-6">
                <div className="h-12 w-12 rounded-lg bg-gradient-primary flex items-center justify-center flex-shrink-0">
                  <Lock className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold mb-2">How Zero-Knowledge Works</h2>
                  <p className="text-muted-foreground">
                    Your secrets are encrypted on your device before anything touches our servers.
                  </p>
                </div>
              </div>

              <div className="space-y-4 font-mono text-sm">
                <div className="bg-terminal-bg text-terminal-text p-4 rounded-lg">
                  <div className="text-terminal-comment"># 1. Local Encryption</div>
                  <div>plaintext → AES-256-GCM → encrypted_blob</div>
                </div>

                <div className="bg-terminal-bg text-terminal-text p-4 rounded-lg">
                  <div className="text-terminal-comment"># 2. Stored Locally</div>
                  <div>SQLite (encrypted) + OS Keychain (master key)</div>
                </div>

                <div className="bg-terminal-bg text-terminal-text p-4 rounded-lg">
                  <div className="text-terminal-comment"># 3. Team Sync (Optional)</div>
                  <div>encrypted_blob → Cloud (we can't decrypt)</div>
                  <div className="text-terminal-comment"># Project key shared via secure invite</div>
                </div>
              </div>

              <div className="mt-6 p-4 bg-background rounded-lg border border-border">
                <p className="text-sm">
                  <strong>What this means:</strong> Even if our servers were compromised, attackers would only find encrypted blobs they can't decrypt. Your master key never leaves your machine, and project keys are shared peer-to-peer via invite links.
                </p>
              </div>
            </Card>
          </div>

          {/* Platform Support */}
          <div className="max-w-4xl mx-auto mb-16">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold mb-2">Works Everywhere</h2>
              <p className="text-muted-foreground">Single binary, no dependencies, all platforms</p>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              <Card className="p-6 text-center">
                <Globe className="h-8 w-8 mx-auto mb-3 text-primary" />
                <h3 className="font-semibold mb-2">macOS</h3>
                <p className="text-sm text-muted-foreground mb-3">Intel & Apple Silicon</p>
                <code className="text-xs bg-muted px-2 py-1 rounded">brew tap dj-pearson/tap && brew install envault</code>
              </Card>

              <Card className="p-6 text-center">
                <Globe className="h-8 w-8 mx-auto mb-3 text-primary" />
                <h3 className="font-semibold mb-2">Linux</h3>
                <p className="text-sm text-muted-foreground mb-3">x64 & ARM64</p>
                <code className="text-xs bg-muted px-2 py-1 rounded">curl -fsSL https://get.envault.net | sh</code>
              </Card>

              <Card className="p-6 text-center">
                <Globe className="h-8 w-8 mx-auto mb-3 text-primary" />
                <h3 className="font-semibold mb-2">Windows / npm</h3>
                <p className="text-sm text-muted-foreground mb-3">All platforms</p>
                <code className="text-xs bg-muted px-2 py-1 rounded">npm install -g envault-cli</code>
              </Card>
            </div>
          </div>

          {/* CTA */}
          <div className="text-center">
            <Card className="max-w-2xl mx-auto p-8 bg-gradient-primary text-white">
              <h2 className="text-3xl font-bold mb-4">Ready to Secure Your Secrets?</h2>
              <p className="text-white/90 mb-6">
                Join developers who trust EnvVault with their environment variables
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button size="lg" variant="secondary" asChild>
                  <Link to="/signup">Start Free Trial</Link>
                </Button>
                <Button size="lg" variant="outline" asChild className="border-white text-white hover:bg-white/10">
                  <Link to="/docs">Read Documentation</Link>
                </Button>
              </div>
            </Card>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border py-8">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>© 2025 ENVault. Built with security in mind.</p>
        </div>
      </footer>
    </div>
  );
}
