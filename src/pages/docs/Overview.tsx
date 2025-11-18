import { Card } from "@/components/ui/card";
import { Zap, Terminal, Users, Shield } from "lucide-react";
import { Link } from "react-router-dom";

export default function Overview() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-bold mb-4">Documentation</h1>
        <p className="text-xl text-muted-foreground">
          Everything you need to get started with ENVault
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <Link to="/docs/installation">
          <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer h-full">
            <Zap className="h-8 w-8 text-primary mb-3" />
            <h3 className="text-xl font-semibold mb-2">Installation</h3>
            <p className="text-muted-foreground">
              Install ENVault CLI on macOS, Linux, or via npm
            </p>
          </Card>
        </Link>

        <Link to="/docs/quickstart">
          <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer h-full">
            <Terminal className="h-8 w-8 text-primary mb-3" />
            <h3 className="text-xl font-semibold mb-2">Quick Start</h3>
            <p className="text-muted-foreground">
              Get up and running in under 5 minutes
            </p>
          </Card>
        </Link>

        <Link to="/docs/team">
          <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer h-full">
            <Users className="h-8 w-8 text-primary mb-3" />
            <h3 className="text-xl font-semibold mb-2">Team Setup</h3>
            <p className="text-muted-foreground">
              Share secrets securely with your team
            </p>
          </Card>
        </Link>

        <Link to="/docs/security">
          <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer h-full">
            <Shield className="h-8 w-8 text-primary mb-3" />
            <h3 className="text-xl font-semibold mb-2">Security</h3>
            <p className="text-muted-foreground">
              Learn about zero-knowledge encryption
            </p>
          </Card>
        </Link>
      </div>

      <Card className="p-6">
        <h2 className="text-2xl font-bold mb-4">What is ENVault?</h2>
        <div className="prose prose-neutral dark:prose-invert max-w-none">
          <p className="text-muted-foreground">
            ENVault is a secure, team-first environment variable management platform. 
            It combines the simplicity of .env files with enterprise-grade security, 
            zero-knowledge encryption, and seamless team collaboration.
          </p>
          <h3 className="text-lg font-semibold mt-6 mb-3">Key Features</h3>
          <ul className="list-disc list-inside space-y-2 text-muted-foreground">
            <li><strong>Zero-knowledge encryption</strong> - Your secrets are encrypted locally before syncing</li>
            <li><strong>Team collaboration</strong> - Share secrets securely with your team</li>
            <li><strong>Multi-environment support</strong> - Manage dev, staging, and production separately</li>
            <li><strong>Audit logging</strong> - Track all changes to your secrets</li>
            <li><strong>CLI-first</strong> - Powerful command-line interface for developers</li>
            <li><strong>IDE integration</strong> - VS Code extension for seamless workflows</li>
          </ul>
        </div>
      </Card>
    </div>
  );
}
