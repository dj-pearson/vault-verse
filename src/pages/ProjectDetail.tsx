import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Lock, Copy, AlertCircle, Users, Settings, Activity, Database } from "lucide-react";
import { Link } from "react-router-dom";
import { TerminalWindow, TerminalLine } from "@/components/TerminalWindow";

export default function ProjectDetail() {
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
              <Link to="/dashboard" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                ← Back to Projects
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-start justify-between mb-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-3xl font-bold">my-saas-app</h1>
                <Badge variant="secondary">Personal</Badge>
              </div>
              <p className="text-muted-foreground">Production web application</p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline">
                <Users className="h-4 w-4 mr-2" />
                Share
              </Button>
              <Button variant="outline">
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </Button>
            </div>
          </div>

          <div className="flex items-center gap-6 text-sm text-muted-foreground">
            <span>Last sync: 2 hours ago</span>
            <span>•</span>
            <span>Created: Oct 1, 2025</span>
          </div>
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="environments">Environments</TabsTrigger>
            <TabsTrigger value="access">Access</TabsTrigger>
            <TabsTrigger value="activity">Activity</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
              
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium mb-2">Clone this project:</h3>
                  <TerminalWindow className="max-w-2xl">
                    <TerminalLine prompt>envvault pull my-saas-app</TerminalLine>
                  </TerminalWindow>
                </div>

                <div>
                  <h3 className="text-sm font-medium mb-2">View variables (CLI only):</h3>
                  <TerminalWindow className="max-w-2xl">
                    <TerminalLine prompt>envvault list my-saas-app</TerminalLine>
                  </TerminalWindow>
                </div>

                <div>
                  <h3 className="text-sm font-medium mb-2">Add variable (CLI only):</h3>
                  <TerminalWindow className="max-w-2xl">
                    <TerminalLine prompt>envvault set KEY=value --env production</TerminalLine>
                  </TerminalWindow>
                </div>
              </div>
            </Card>

            <Card className="p-6 bg-primary/5 border-primary/20">
              <div className="flex gap-4">
                <AlertCircle className="h-6 w-6 text-primary flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-semibold mb-2">Security Note</h3>
                  <p className="text-sm text-muted-foreground">
                    Variable VALUES are never shown in the dashboard. This maintains zero-knowledge 
                    encryption. Use the CLI to view or edit actual secret values.
                  </p>
                </div>
              </div>
            </Card>

            <div className="grid md:grid-cols-3 gap-6">
              <Card className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <Database className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold">3</div>
                    <div className="text-sm text-muted-foreground">Environments</div>
                  </div>
                </div>
              </Card>

              <Card className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 rounded-lg bg-accent/10">
                    <Lock className="h-5 w-5 text-accent" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold">24</div>
                    <div className="text-sm text-muted-foreground">Total Variables</div>
                  </div>
                </div>
              </Card>

              <Card className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <Activity className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold">47</div>
                    <div className="text-sm text-muted-foreground">Syncs Today</div>
                  </div>
                </div>
              </Card>
            </div>
          </TabsContent>

          {/* Environments Tab */}
          <TabsContent value="environments" className="space-y-6">
            {["development", "staging", "production"].map((env, i) => (
              <Card key={env} className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-xl font-semibold capitalize">{env}</h3>
                      {i === 0 && <Badge variant="secondary">Default</Badge>}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {i === 0 ? "12 variables" : i === 1 ? "15 variables" : "18 variables"}
                    </p>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Last updated: {i === 0 ? "3 hours ago" : i === 1 ? "1 day ago" : "2 days ago"}
                  </div>
                </div>

                <div className="mb-4">
                  <h4 className="text-sm font-medium mb-2">Variable Names (values hidden):</h4>
                  <div className="space-y-2">
                    {["DATABASE_URL", "API_KEY", "REDIS_URL", "STRIPE_SECRET_KEY"].map((varName) => (
                      <div key={varName} className="flex items-center gap-2 text-sm">
                        <div className="w-2 h-2 rounded-full bg-primary" />
                        <code className="font-mono">{varName}</code>
                      </div>
                    ))}
                    <div className="text-sm text-muted-foreground ml-4">
                      ...and {i === 0 ? "8" : i === 1 ? "11" : "14"} more
                    </div>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    View in CLI
                  </Button>
                  <Button variant="ghost" size="sm">
                    <Copy className="h-4 w-4 mr-2" />
                    Copy Pull Command
                  </Button>
                </div>
              </Card>
            ))}
          </TabsContent>

          {/* Access Tab */}
          <TabsContent value="access" className="space-y-6">
            <Card className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-xl font-semibold mb-1">Team Members</h2>
                  <p className="text-sm text-muted-foreground">Manage who can access this project</p>
                </div>
                <Button>
                  <Users className="h-4 w-4 mr-2" />
                  Invite Member
                </Button>
              </div>

              <div className="space-y-4">
                {[
                  { email: "alice@acme.com", role: "Admin", you: true },
                  { email: "bob@acme.com", role: "Developer", you: false },
                  { email: "charlie@acme.com", role: "Developer", you: false },
                ].map((member) => (
                  <div key={member.email} className="flex items-center justify-between p-4 rounded-lg border border-border">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <span className="text-sm font-medium text-primary">
                          {member.email[0].toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{member.email}</span>
                          {member.you && (
                            <Badge variant="secondary" className="text-xs">You</Badge>
                          )}
                        </div>
                        <span className="text-sm text-muted-foreground">{member.role}</span>
                      </div>
                    </div>
                    {!member.you && (
                      <Button variant="ghost" size="sm" className="text-destructive">
                        Remove
                      </Button>
                    )}
                  </div>
                ))}
              </div>

              <div className="mt-6 p-4 rounded-lg bg-muted/30">
                <h3 className="font-semibold mb-2">Roles & Permissions</h3>
                <ul className="space-y-1 text-sm text-muted-foreground">
                  <li>• <strong>Admin:</strong> Full access, can invite/remove members</li>
                  <li>• <strong>Developer:</strong> Read/write dev/staging, read-only prod</li>
                  <li>• <strong>Viewer:</strong> Read-only access to all environments</li>
                </ul>
              </div>
            </Card>
          </TabsContent>

          {/* Activity Tab */}
          <TabsContent value="activity" className="space-y-6">
            <Card>
              <div className="p-6 border-b border-border">
                <h2 className="text-xl font-semibold">Audit Log</h2>
                <p className="text-sm text-muted-foreground">Track all changes to this project</p>
              </div>

              <div className="divide-y divide-border">
                {[
                  {
                    user: "alice@acme.com",
                    action: "updated variables",
                    env: "production",
                    count: "2 variables",
                    time: "2 hours ago",
                    ip: "192.168.1.100",
                  },
                  {
                    user: "bob@acme.com",
                    action: "synced project",
                    env: "staging",
                    count: "15 variables",
                    time: "5 hours ago",
                    ip: "192.168.1.101",
                  },
                  {
                    user: "alice@acme.com",
                    action: "created environment",
                    env: "staging",
                    count: null,
                    time: "1 day ago",
                    ip: "192.168.1.100",
                  },
                ].map((log, i) => (
                  <div key={i} className="p-6">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <p className="font-medium">
                          {log.user} {log.action}
                        </p>
                        <div className="flex items-center gap-3 text-sm text-muted-foreground mt-1">
                          <span>Environment: {log.env}</span>
                          {log.count && (
                            <>
                              <span>•</span>
                              <span>{log.count}</span>
                            </>
                          )}
                        </div>
                      </div>
                      <span className="text-sm text-muted-foreground">{log.time}</span>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      IP: {log.ip} • CLI v1.2.0
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
