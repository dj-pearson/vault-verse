import { Card } from "@/components/ui/card";
import { TerminalWindow, TerminalLine } from "@/components/TerminalWindow";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Download, Package, Apple, Monitor } from "lucide-react";

export default function Installation() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-bold mb-4">Installation</h1>
        <p className="text-xl text-muted-foreground">
          Install ENVault CLI on your system
        </p>
      </div>

      <Card className="p-6">
        <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
          <Download className="h-6 w-6 text-primary" />
          Choose Your Installation Method
        </h2>
        
        <Tabs defaultValue="homebrew" className="mt-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="homebrew">
              <Apple className="h-4 w-4 mr-2" />
              Homebrew
            </TabsTrigger>
            <TabsTrigger value="npm">
              <Package className="h-4 w-4 mr-2" />
              npm
            </TabsTrigger>
            <TabsTrigger value="script">
              <Monitor className="h-4 w-4 mr-2" />
              Install Script
            </TabsTrigger>
            <TabsTrigger value="binary">Binary</TabsTrigger>
          </TabsList>

          <TabsContent value="homebrew" className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold mb-2">macOS (Homebrew)</h3>
              <p className="text-muted-foreground mb-4">
                The easiest way to install on macOS
              </p>
              <TerminalWindow>
                <TerminalLine prompt>brew tap dj-pearson/tap</TerminalLine>
                <TerminalLine prompt>brew install envault</TerminalLine>
                <div className="h-2" />
                <div className="text-terminal-text/50"># Verify installation</div>
                <TerminalLine prompt>envault --version</TerminalLine>
                <div className="text-terminal-success">envault version 1.0.0</div>
              </TerminalWindow>
            </div>
          </TabsContent>

          <TabsContent value="npm" className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold mb-2">npm (All Platforms)</h3>
              <p className="text-muted-foreground mb-4">
                Install globally via npm. Requires Node.js 16+
              </p>
              <TerminalWindow>
                <TerminalLine prompt>npm install -g envault-cli</TerminalLine>
                <div className="h-2" />
                <div className="text-terminal-text/50"># Verify installation</div>
                <TerminalLine prompt>envault --version</TerminalLine>
                <div className="text-terminal-success">envault version 1.0.0</div>
              </TerminalWindow>
            </div>
          </TabsContent>

          <TabsContent value="script" className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold mb-2">Install Script (macOS/Linux)</h3>
              <p className="text-muted-foreground mb-4">
                Automatic installation script for Unix-like systems
              </p>
              <TerminalWindow>
                <TerminalLine prompt>curl -fsSL https://get.envault.net | sh</TerminalLine>
                <div className="h-2" />
                <div className="text-terminal-text/50"># The script will:</div>
                <div className="text-terminal-text/70">1. Detect your OS and architecture</div>
                <div className="text-terminal-text/70">2. Download the appropriate binary</div>
                <div className="text-terminal-text/70">3. Install to /usr/local/bin</div>
                <div className="text-terminal-text/70">4. Set up shell completions (optional)</div>
              </TerminalWindow>
            </div>
          </TabsContent>

          <TabsContent value="binary" className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold mb-2">Download Binary</h3>
              <p className="text-muted-foreground mb-4">
                Download pre-built binaries for your platform
              </p>
              <div className="space-y-3">
                <Card className="p-4">
                  <h4 className="font-semibold mb-2">macOS (Apple Silicon)</h4>
                  <code className="text-sm text-muted-foreground">envault-darwin-arm64</code>
                </Card>
                <Card className="p-4">
                  <h4 className="font-semibold mb-2">macOS (Intel)</h4>
                  <code className="text-sm text-muted-foreground">envault-darwin-amd64</code>
                </Card>
                <Card className="p-4">
                  <h4 className="font-semibold mb-2">Linux (x64)</h4>
                  <code className="text-sm text-muted-foreground">envault-linux-amd64</code>
                </Card>
                <Card className="p-4">
                  <h4 className="font-semibold mb-2">Linux (ARM)</h4>
                  <code className="text-sm text-muted-foreground">envault-linux-arm64</code>
                </Card>
              </div>
              <TerminalWindow className="mt-4">
                <div className="text-terminal-text/50"># After downloading, make executable and move to PATH</div>
                <TerminalLine prompt>chmod +x envault-*</TerminalLine>
                <TerminalLine prompt>sudo mv envault-* /usr/local/bin/envault</TerminalLine>
              </TerminalWindow>
              <p className="text-sm text-muted-foreground mt-4">
                Download from: <a href="https://github.com/dj-pearson/vault-verse/releases" className="text-primary hover:underline">GitHub Releases</a>
              </p>
            </div>
          </TabsContent>
        </Tabs>
      </Card>

      <Card className="p-6">
        <h2 className="text-xl font-bold mb-4">Verify Installation</h2>
        <p className="text-muted-foreground mb-4">
          Run the following command to verify ENVault is installed correctly:
        </p>
        <TerminalWindow>
          <TerminalLine prompt>envault --version</TerminalLine>
          <div className="text-terminal-success">envault version 1.0.0</div>
        </TerminalWindow>
      </Card>

      <Card className="p-6">
        <h2 className="text-xl font-bold mb-4">Next Steps</h2>
        <ul className="list-disc list-inside space-y-2 text-muted-foreground">
          <li>Follow the <a href="/docs/quickstart" className="text-primary hover:underline">Quick Start Guide</a> to create your first project</li>
          <li>Review the <a href="/docs/cli" className="text-primary hover:underline">CLI Reference</a> for all available commands</li>
          <li>Set up <a href="/docs/team" className="text-primary hover:underline">Team Collaboration</a> to share secrets securely</li>
        </ul>
      </Card>
    </div>
  );
}
