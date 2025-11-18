import { Card } from "@/components/ui/card";
import { TerminalWindow, TerminalLine } from "@/components/TerminalWindow";
import { Book } from "lucide-react";

export default function QuickStart() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-bold mb-4 flex items-center gap-3">
          <Book className="h-10 w-10 text-primary" />
          Quick Start Guide
        </h1>
        <p className="text-xl text-muted-foreground">
          Get up and running with ENVault in under 5 minutes
        </p>
      </div>

      <Card className="p-6">
        <h2 className="text-2xl font-semibold mb-4">1. Install CLI</h2>
        <p className="text-muted-foreground mb-4">
          Choose your preferred installation method:
        </p>
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
        <h2 className="text-2xl font-semibold mb-4">2. Initialize Your First Project</h2>
        <p className="text-muted-foreground mb-4">
          Create a new project to start managing environment variables:
        </p>
        <TerminalWindow>
          <TerminalLine prompt>envault init my-app</TerminalLine>
          <TerminalLine success>Project 'my-app' initialized</TerminalLine>
          <TerminalLine success>Created environments: development, production</TerminalLine>
        </TerminalWindow>
        <p className="text-sm text-muted-foreground mt-4">
          This creates a local project with default development and production environments.
        </p>
      </Card>

      <Card className="p-6">
        <h2 className="text-2xl font-semibold mb-4">3. Add Environment Variables</h2>
        <p className="text-muted-foreground mb-4">
          Store your secrets securely with zero-knowledge encryption:
        </p>
        <TerminalWindow>
          <TerminalLine prompt>envault set DATABASE_URL=postgres://localhost/mydb</TerminalLine>
          <TerminalLine success>Saved DATABASE_URL (encrypted)</TerminalLine>
          <div className="h-2" />
          <TerminalLine prompt>envault set API_KEY=sk_test_...</TerminalLine>
          <TerminalLine success>Saved API_KEY (encrypted)</TerminalLine>
          <div className="h-2" />
          <div className="text-terminal-text/50"># List all variables (values hidden by default)</div>
          <TerminalLine prompt>envault list</TerminalLine>
          <div className="text-terminal-text/70">DATABASE_URL=***</div>
          <div className="text-terminal-text/70">API_KEY=***</div>
        </TerminalWindow>
      </Card>

      <Card className="p-6">
        <h2 className="text-2xl font-semibold mb-4">4. Use in Your Application</h2>
        <p className="text-muted-foreground mb-4">
          Run your application with encrypted variables injected:
        </p>
        <TerminalWindow>
          <TerminalLine prompt>envault run npm start</TerminalLine>
          <TerminalLine success>Starting with 2 environment variables</TerminalLine>
          <div className="text-terminal-text/70">Server listening on port 3000...</div>
        </TerminalWindow>
        <p className="text-sm text-muted-foreground mt-4">
          Your application now has access to all encrypted variables without exposing them in .env files!
        </p>
      </Card>

      <Card className="p-6">
        <h2 className="text-2xl font-semibold mb-4">5. Import Existing .env Files</h2>
        <p className="text-muted-foreground mb-4">
          Migrate from traditional .env files easily:
        </p>
        <TerminalWindow>
          <TerminalLine prompt>envault import .env</TerminalLine>
          <TerminalLine success>Imported 8 variables from .env</TerminalLine>
          <TerminalLine success>All variables encrypted</TerminalLine>
        </TerminalWindow>
      </Card>

      <Card className="p-6 bg-muted/30">
        <h2 className="text-xl font-semibold mb-4">Next Steps</h2>
        <ul className="space-y-3 text-sm">
          <li className="flex items-start gap-2">
            <span className="text-primary mt-1">→</span>
            <span>Add more environments: <code className="bg-background px-1.5 py-0.5 rounded">envault env create staging</code></span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-primary mt-1">→</span>
            <span>Copy variables between environments: <code className="bg-background px-1.5 py-0.5 rounded">envault env copy dev staging</code></span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-primary mt-1">→</span>
            <span>Enable team sync: <code className="bg-background px-1.5 py-0.5 rounded">envault login</code> then <code className="bg-background px-1.5 py-0.5 rounded">envault init --team</code></span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-primary mt-1">→</span>
            <span>Explore the <a href="/docs/cli" className="text-primary hover:underline">CLI Reference</a> for all available commands</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-primary mt-1">→</span>
            <span>Learn about <a href="/docs/security" className="text-primary hover:underline">Security Best Practices</a></span>
          </li>
        </ul>
      </Card>
    </div>
  );
}
