import { Navigation } from "@/components/Navigation";
import { Card } from "@/components/ui/card";
import { TerminalWindow, TerminalLine } from "@/components/TerminalWindow";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Book, Terminal, Zap, Shield, Users } from "lucide-react";

export default function Docs() {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            {/* Header */}
            <div className="mb-12">
              <h1 className="text-4xl md:text-5xl font-bold mb-4">Documentation</h1>
              <p className="text-xl text-muted-foreground">
                Everything you need to get started with EnvVault
              </p>
            </div>

            {/* Quick Links */}
            <div className="grid md:grid-cols-4 gap-4 mb-12">
              <Card className="p-4 hover:shadow-lg transition-shadow cursor-pointer">
                <Zap className="h-6 w-6 text-primary mb-2" />
                <h3 className="font-semibold text-sm">Quick Start</h3>
              </Card>
              <Card className="p-4 hover:shadow-lg transition-shadow cursor-pointer">
                <Terminal className="h-6 w-6 text-primary mb-2" />
                <h3 className="font-semibold text-sm">CLI Reference</h3>
              </Card>
              <Card className="p-4 hover:shadow-lg transition-shadow cursor-pointer">
                <Users className="h-6 w-6 text-primary mb-2" />
                <h3 className="font-semibold text-sm">Team Setup</h3>
              </Card>
              <Card className="p-4 hover:shadow-lg transition-shadow cursor-pointer">
                <Shield className="h-6 w-6 text-primary mb-2" />
                <h3 className="font-semibold text-sm">Security</h3>
              </Card>
            </div>

            <Tabs defaultValue="quickstart" className="space-y-8">
              <TabsList className="grid grid-cols-4 w-full">
                <TabsTrigger value="quickstart">Quick Start</TabsTrigger>
                <TabsTrigger value="cli">CLI Reference</TabsTrigger>
                <TabsTrigger value="team">Team Setup</TabsTrigger>
                <TabsTrigger value="security">Security</TabsTrigger>
              </TabsList>

              {/* Quick Start */}
              <TabsContent value="quickstart" className="space-y-8">
                <div>
                  <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                    <Book className="h-6 w-6 text-primary" />
                    Quick Start Guide
                  </h2>
                  <p className="text-muted-foreground mb-6">
                    Get up and running with EnvVault in under 5 minutes
                  </p>
                </div>

                <Card className="p-6">
                  <h3 className="text-xl font-semibold mb-4">1. Install CLI</h3>
                  <TerminalWindow>
                    <div className="text-terminal-text/50"># macOS (Homebrew)</div>
                    <TerminalLine prompt>brew tap dj-pearson/tap</TerminalLine>
                    <TerminalLine prompt>brew install envault</TerminalLine>
                    <div className="h-2" />
                    <div className="text-terminal-text/50"># macOS/Linux (Install Script)</div>
                    <TerminalLine prompt>curl -fsSL https://get.envault.net | sh</TerminalLine>
                    <div className="h-2" />
                    <div className="text-terminal-text/50"># npm (all platforms)</div>
                    <TerminalLine prompt>npm install -g envault-cli</TerminalLine>
                    <div className="h-2" />
                    <div className="text-terminal-text/50"># Or download from GitHub Releases</div>
                    <div className="text-terminal-text/70">https://github.com/dj-pearson/vault-verse/releases</div>
                  </TerminalWindow>
                </Card>

                <Card className="p-6">
                  <h3 className="text-xl font-semibold mb-4">2. Initialize Your First Project</h3>
                  <TerminalWindow>
                    <TerminalLine prompt>envault init my-app</TerminalLine>
                    <TerminalLine success>Project 'my-app' initialized</TerminalLine>
                    <TerminalLine success>Created environments: development, production</TerminalLine>
                  </TerminalWindow>
                </Card>

                <Card className="p-6">
                  <h3 className="text-xl font-semibold mb-4">3. Add Environment Variables</h3>
                  <TerminalWindow>
                    <TerminalLine prompt>envault set DATABASE_URL=postgres://localhost/mydb</TerminalLine>
                    <TerminalLine success>Saved DATABASE_URL (encrypted)</TerminalLine>
                    <div className="h-2" />
                    <TerminalLine prompt>envault set API_KEY=sk_test_...</TerminalLine>
                    <TerminalLine success>Saved API_KEY (encrypted)</TerminalLine>
                  </TerminalWindow>
                </Card>

                <Card className="p-6">
                  <h3 className="text-xl font-semibold mb-4">4. Use in Your Application</h3>
                  <TerminalWindow>
                    <TerminalLine prompt>envault run npm start</TerminalLine>
                    <TerminalLine success>Starting with 2 environment variables</TerminalLine>
                    <div className="text-terminal-text/70">Server listening on port 3000...</div>
                  </TerminalWindow>
                  <p className="text-sm text-muted-foreground mt-4">
                    Your application now has access to all encrypted variables without exposing them in .env files!
                  </p>
                </Card>

                <Card className="p-6 bg-muted/30">
                  <h3 className="text-lg font-semibold mb-3">Next Steps</h3>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-start gap-2">
                      <span className="text-primary mt-1">→</span>
                      <span>Add more environments: <code className="bg-background px-1.5 py-0.5 rounded">envault env create staging</code></span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary mt-1">→</span>
                      <span>Import existing .env: <code className="bg-background px-1.5 py-0.5 rounded">envault import .env</code></span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary mt-1">→</span>
                      <span>Enable team sync: <code className="bg-background px-1.5 py-0.5 rounded">envault init --team</code></span>
                    </li>
                  </ul>
                </Card>
              </TabsContent>

              {/* CLI Reference */}
              <TabsContent value="cli" className="space-y-6">
                <div>
                  <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                    <Terminal className="h-6 w-6 text-primary" />
                    CLI Reference
                  </h2>
                </div>

                <Card className="p-6">
                  <h3 className="font-semibold mb-3">envault init</h3>
                  <p className="text-sm text-muted-foreground mb-3">Initialize a new project</p>
                  <div className="bg-terminal-bg text-terminal-text p-3 rounded font-mono text-sm">
                    <div>envault init [project-name] [flags]</div>
                    <div className="mt-2 text-terminal-comment">Flags:</div>
                    <div>  --team              Enable team sync</div>
                    <div>  --env ENVIRONMENTS  Comma-separated environments</div>
                  </div>
                </Card>

                <Card className="p-6">
                  <h3 className="font-semibold mb-3">envault set</h3>
                  <p className="text-sm text-muted-foreground mb-3">Set an environment variable</p>
                  <div className="bg-terminal-bg text-terminal-text p-3 rounded font-mono text-sm">
                    <div>envault set KEY=value [flags]</div>
                    <div className="mt-2 text-terminal-comment">Flags:</div>
                    <div>  --env ENVIRONMENT   Target environment (default: development)</div>
                    <div>  --file FILE         Import from .env file</div>
                  </div>
                </Card>

                <Card className="p-6">
                  <h3 className="font-semibold mb-3">envault get</h3>
                  <p className="text-sm text-muted-foreground mb-3">Get a variable value</p>
                  <div className="bg-terminal-bg text-terminal-text p-3 rounded font-mono text-sm">
                    <div>envault get KEY [flags]</div>
                    <div className="mt-2 text-terminal-comment">Flags:</div>
                    <div>  --env ENVIRONMENT   Target environment</div>
                    <div>  --format FORMAT     Output format: plain, json, export</div>
                  </div>
                </Card>

                <Card className="p-6">
                  <h3 className="font-semibold mb-3">envault list</h3>
                  <p className="text-sm text-muted-foreground mb-3">List all variables</p>
                  <div className="bg-terminal-bg text-terminal-text p-3 rounded font-mono text-sm">
                    <div>envault list [flags]</div>
                    <div className="mt-2 text-terminal-comment">Flags:</div>
                    <div>  --env ENVIRONMENT   Filter by environment</div>
                    <div>  --show-values       Show actual values (default: hidden)</div>
                  </div>
                </Card>

                <Card className="p-6">
                  <h3 className="font-semibold mb-3">envault run</h3>
                  <p className="text-sm text-muted-foreground mb-3">Run command with injected variables</p>
                  <div className="bg-terminal-bg text-terminal-text p-3 rounded font-mono text-sm">
                    <div>envault run [command] [flags]</div>
                    <div className="mt-2 text-terminal-comment">Flags:</div>
                    <div>  --env ENVIRONMENT   Use variables from environment</div>
                  </div>
                </Card>

                <Card className="p-6">
                  <h3 className="font-semibold mb-3">envault import</h3>
                  <p className="text-sm text-muted-foreground mb-3">Import variables from .env file</p>
                  <div className="bg-terminal-bg text-terminal-text p-3 rounded font-mono text-sm">
                    <div>envault import FILE [flags]</div>
                    <div className="mt-2 text-terminal-comment">Flags:</div>
                    <div>  --env ENVIRONMENT   Target environment</div>
                    <div>  --overwrite         Overwrite existing variables</div>
                    <div>  --dry-run           Preview without importing</div>
                  </div>
                </Card>

                <Card className="p-6">
                  <h3 className="font-semibold mb-3">envault export</h3>
                  <p className="text-sm text-muted-foreground mb-3">Export variables to file</p>
                  <div className="bg-terminal-bg text-terminal-text p-3 rounded font-mono text-sm">
                    <div>envault export [flags]</div>
                    <div className="mt-2 text-terminal-comment">Flags:</div>
                    <div>  --env ENVIRONMENT   Export from environment</div>
                    <div>  --output FILE       Output file (default: stdout)</div>
                    <div>  --format FORMAT     Format: dotenv, json, yaml</div>
                  </div>
                </Card>

                <Card className="p-6">
                  <h3 className="font-semibold mb-3">envault login</h3>
                  <p className="text-sm text-muted-foreground mb-3">Authenticate CLI for team features</p>
                  <div className="bg-terminal-bg text-terminal-text p-3 rounded font-mono text-sm">
                    <div>envault login [flags]</div>
                    <div className="mt-2 text-terminal-comment">Flags:</div>
                    <div>  --token TOKEN      Use personal access token</div>
                    <div>  --manual           Manual authentication</div>
                  </div>
                </Card>

                <Card className="p-6">
                  <h3 className="font-semibold mb-3">envault sync</h3>
                  <p className="text-sm text-muted-foreground mb-3">Sync project with team (encrypted)</p>
                  <div className="bg-terminal-bg text-terminal-text p-3 rounded font-mono text-sm">
                    <div>envault sync [flags]</div>
                    <div className="mt-2 text-terminal-comment">Flags:</div>
                    <div>  --push             Push local changes only</div>
                    <div>  --pull             Pull cloud changes only</div>
                    <div>  --force            Force sync (override conflicts)</div>
                  </div>
                </Card>

                <Card className="p-6">
                  <h3 className="font-semibold mb-3">envault env</h3>
                  <p className="text-sm text-muted-foreground mb-3">Manage environments</p>
                  <div className="bg-terminal-bg text-terminal-text p-3 rounded font-mono text-sm">
                    <div>envault env [subcommand]</div>
                    <div className="mt-2 text-terminal-comment">Subcommands:</div>
                    <div>  list               List all environments</div>
                    <div>  create NAME        Create new environment</div>
                    <div>  delete NAME        Delete environment</div>
                    <div>  copy SRC DST       Copy variables between environments</div>
                  </div>
                </Card>

                <Card className="p-6">
                  <h3 className="font-semibold mb-3">envault team</h3>
                  <p className="text-sm text-muted-foreground mb-3">Manage team members</p>
                  <div className="bg-terminal-bg text-terminal-text p-3 rounded font-mono text-sm">
                    <div>envault team [subcommand]</div>
                    <div className="mt-2 text-terminal-comment">Subcommands:</div>
                    <div>  list               List team members</div>
                    <div>  invite EMAIL       Invite team member</div>
                    <div>  remove EMAIL       Remove team member</div>
                  </div>
                </Card>

                <Card className="p-6 bg-muted/30">
                  <p className="text-sm">
                    <strong>Pro tip:</strong> Use <code className="bg-background px-1.5 py-0.5 rounded">envault [command] --help</code> for detailed information about any command.
                  </p>
                </Card>
              </TabsContent>

              {/* Team Setup */}
              <TabsContent value="team" className="space-y-6">
                <div>
                  <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                    <Users className="h-6 w-6 text-primary" />
                    Team Setup
                  </h2>
                </div>

                <Card className="p-6">
                  <h3 className="text-xl font-semibold mb-4">1. Enable Team Sync</h3>
                  <TerminalWindow>
                    <TerminalLine prompt>envault login</TerminalLine>
                    <div className="text-terminal-text/70">Opening browser for authentication...</div>
                    <TerminalLine success>Logged in as you@company.com</TerminalLine>
                    <div className="h-2" />
                    <TerminalLine prompt>envault init my-team-project --team</TerminalLine>
                    <TerminalLine success>Team sync enabled</TerminalLine>
                  </TerminalWindow>
                </Card>

                <Card className="p-6">
                  <h3 className="text-xl font-semibold mb-4">2. Invite Team Members</h3>
                  <p className="text-sm text-muted-foreground mb-3">
                    From the web dashboard, navigate to Team → Invite Members
                  </p>
                  <TerminalWindow>
                    <div className="text-terminal-text/50"># Or via CLI</div>
                    <TerminalLine prompt>envault team invite alice@company.com</TerminalLine>
                    <TerminalLine success>Invitation sent to alice@company.com</TerminalLine>
                  </TerminalWindow>
                </Card>

                <Card className="p-6">
                  <h3 className="text-xl font-semibold mb-4">3. Team Members Pull Project</h3>
                  <TerminalWindow>
                    <TerminalLine prompt>envault login</TerminalLine>
                    <TerminalLine prompt>envault pull my-team-project</TerminalLine>
                    <TerminalLine success>Pulled 24 variables (encrypted)</TerminalLine>
                    <TerminalLine success>Project ready to use</TerminalLine>
                  </TerminalWindow>
                </Card>

                <Card className="p-6 bg-muted/30">
                  <h3 className="text-lg font-semibold mb-3">How Team Sync Works</h3>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-start gap-2">
                      <span className="text-primary">1.</span>
                      <span>Variables are encrypted on your device before upload</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary">2.</span>
                      <span>Project encryption key shared via secure invite link</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary">3.</span>
                      <span>Team members decrypt locally with the shared key</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary">4.</span>
                      <span>EnvVault servers never see plaintext values</span>
                    </li>
                  </ul>
                </Card>
              </TabsContent>

              {/* Security */}
              <TabsContent value="security" className="space-y-6">
                <div>
                  <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                    <Shield className="h-6 w-6 text-primary" />
                    Security Architecture
                  </h2>
                </div>

                <Card className="p-6">
                  <h3 className="text-xl font-semibold mb-4">Zero-Knowledge Encryption</h3>
                  <p className="text-muted-foreground mb-4">
                    EnvVault uses zero-knowledge encryption, meaning we cannot access your secrets even if we wanted to.
                  </p>
                  <div className="space-y-3 text-sm">
                    <div className="p-3 bg-muted/30 rounded">
                      <strong>Encryption:</strong> AES-256-GCM with authenticated encryption
                    </div>
                    <div className="p-3 bg-muted/30 rounded">
                      <strong>Key Storage:</strong> Master keys stored in OS keychain (Keychain/Credential Manager)
                    </div>
                    <div className="p-3 bg-muted/30 rounded">
                      <strong>Team Keys:</strong> Shared via secure invite links, never stored on servers
                    </div>
                  </div>
                </Card>

                <Card className="p-6">
                  <h3 className="text-xl font-semibold mb-4">What We Store</h3>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-border">
                          <th className="text-left py-2 font-semibold">Data Type</th>
                          <th className="text-left py-2 font-semibold">Storage</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr className="border-b border-border">
                          <td className="py-3">Variable Names</td>
                          <td className="py-3">Encrypted ✓</td>
                        </tr>
                        <tr className="border-b border-border">
                          <td className="py-3">Variable Values</td>
                          <td className="py-3">Encrypted ✓</td>
                        </tr>
                        <tr className="border-b border-border">
                          <td className="py-3">Project Metadata</td>
                          <td className="py-3">Plaintext (name, description)</td>
                        </tr>
                        <tr className="border-b border-border">
                          <td className="py-3">Encryption Keys</td>
                          <td className="py-3">Never stored on servers</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </Card>

                <Card className="p-6">
                  <h3 className="text-xl font-semibold mb-4">Threat Model</h3>
                  <div className="space-y-3">
                    <div className="p-3 bg-green-500/10 border border-green-500/20 rounded">
                      <strong className="text-green-700 dark:text-green-400">✓ Protected:</strong>
                      <p className="text-sm mt-1">Server breach, insider threat, man-in-the-middle attacks</p>
                    </div>
                    <div className="p-3 bg-yellow-500/10 border border-yellow-500/20 rounded">
                      <strong className="text-yellow-700 dark:text-yellow-400">⚠ User Responsibility:</strong>
                      <p className="text-sm mt-1">Device security, master key backup, secure key sharing</p>
                    </div>
                  </div>
                </Card>

                <Card className="p-6 bg-muted/30">
                  <h3 className="text-lg font-semibold mb-3">Best Practices</h3>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-start gap-2">
                      <span className="text-primary">✓</span>
                      <span>Enable full disk encryption on your device</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary">✓</span>
                      <span>Use strong passwords and 2FA for your account</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary">✓</span>
                      <span>Backup your master key securely (offline)</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary">✓</span>
                      <span>Rotate sensitive credentials regularly</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary">✓</span>
                      <span>Review audit logs for suspicious activity</span>
                    </li>
                  </ul>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border py-8 mt-16">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>© 2025 ENVault. Built with security in mind.</p>
        </div>
      </footer>
    </div>
  );
}
