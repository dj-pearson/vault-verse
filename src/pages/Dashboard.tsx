import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Lock, Plus, Users, Clock, Terminal } from "lucide-react";
import { Link } from "react-router-dom";

export default function Dashboard() {
  return (
    <div className="min-h-screen bg-background">
      {/* Top Navigation */}
      <nav className="border-b border-border bg-background">
        <div className="container mx-auto px-4">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-2 font-semibold text-xl">
              <div className="p-1.5 rounded-lg bg-gradient-primary">
                <Lock className="h-5 w-5 text-white" />
              </div>
              <span>EnvVault</span>
            </div>

            <div className="flex items-center gap-6">
              <Link to="/dashboard" className="text-sm font-medium">
                Projects
              </Link>
              <Link to="/dashboard/team" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                Team
              </Link>
              <Link to="/dashboard/settings" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                Settings
              </Link>
              <div className="h-8 w-px bg-border" />
              <Button size="sm" variant="ghost">
                <Terminal className="h-4 w-4 mr-2" />
                CLI Docs
              </Button>
            </div>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">Projects</h1>
            <p className="text-muted-foreground">Manage your environment variables</p>
          </div>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            New Project
          </Button>
        </div>

        {/* Projects Grid */}
        <div className="grid lg:grid-cols-2 gap-6 mb-12">
          <Card className="p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-xl font-semibold mb-1">my-saas-app</h3>
                <span className="inline-block text-xs px-2 py-1 rounded-full bg-muted text-muted-foreground">
                  Personal
                </span>
              </div>
            </div>
            
            <p className="text-sm text-muted-foreground mb-4">
              Production web application
            </p>

            <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
              <span>3 environments</span>
              <span>•</span>
              <span>24 variables</span>
            </div>

            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
              <Clock className="h-4 w-4" />
              <span>Last sync: 2h ago</span>
            </div>

            <div className="flex gap-2">
              <Button variant="outline" size="sm" asChild>
                <Link to="/dashboard/projects/1">View Details</Link>
              </Button>
              <Button variant="ghost" size="sm">
                CLI Setup
              </Button>
              <Button variant="ghost" size="sm">
                Share
              </Button>
            </div>
          </Card>

          <Card className="p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-xl font-semibold mb-1">api-service</h3>
                <span className="inline-block text-xs px-2 py-1 rounded-full bg-primary/10 text-primary">
                  Team: Acme Inc
                </span>
              </div>
            </div>
            
            <p className="text-sm text-muted-foreground mb-4">
              Backend API microservice
            </p>

            <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
              <span>2 environments</span>
              <span>•</span>
              <span>18 variables</span>
            </div>

            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
              <Users className="h-4 w-4" />
              <span>Team members: alice, bob (+3)</span>
            </div>

            <div className="flex gap-2">
              <Button variant="outline" size="sm" asChild>
                <Link to="/dashboard/projects/2">View Details</Link>
              </Button>
              <Button variant="ghost" size="sm">
                Audit Log
              </Button>
            </div>
          </Card>
        </div>

        {/* Recent Activity */}
        <div>
          <h2 className="text-2xl font-bold mb-6">Recent Activity</h2>
          
          <Card className="divide-y divide-border">
            <div className="p-4 flex items-start gap-4">
              <div className="p-2 rounded-full bg-primary/10">
                <Clock className="h-4 w-4 text-primary" />
              </div>
              <div className="flex-1">
                <p className="font-medium">alice@acme.com synced api-service</p>
                <p className="text-sm text-muted-foreground">2 hours ago</p>
              </div>
            </div>

            <div className="p-4 flex items-start gap-4">
              <div className="p-2 rounded-full bg-accent/10">
                <Terminal className="h-4 w-4 text-accent" />
              </div>
              <div className="flex-1">
                <p className="font-medium">You updated my-saas-app (staging)</p>
                <p className="text-sm text-muted-foreground">3 hours ago</p>
              </div>
            </div>

            <div className="p-4 flex items-start gap-4">
              <div className="p-2 rounded-full bg-primary/10">
                <Users className="h-4 w-4 text-primary" />
              </div>
              <div className="flex-1">
                <p className="font-medium">bob@acme.com joined team</p>
                <p className="text-sm text-muted-foreground">5 hours ago</p>
              </div>
            </div>
          </Card>
        </div>

        {/* CLI Quick Start */}
        <Card className="mt-8 p-6 bg-muted/30">
          <h3 className="text-xl font-semibold mb-4">Quick CLI Commands</h3>
          <div className="space-y-2 font-mono text-sm">
            <div className="bg-terminal-bg text-terminal-text px-4 py-2 rounded">
              <span className="text-terminal-prompt">$</span> envvault pull my-saas-app
            </div>
            <div className="bg-terminal-bg text-terminal-text px-4 py-2 rounded">
              <span className="text-terminal-prompt">$</span> envvault list
            </div>
            <div className="bg-terminal-bg text-terminal-text px-4 py-2 rounded">
              <span className="text-terminal-prompt">$</span> envvault set KEY=value --env production
            </div>
          </div>
          <p className="text-sm text-muted-foreground mt-4">
            ℹ️  Security Note: Variable VALUES are never shown in the dashboard. Use CLI to view/edit secrets.
          </p>
        </Card>
      </div>
    </div>
  );
}
