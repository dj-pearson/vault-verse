import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Lock, User, CreditCard, Users, Key, AlertCircle } from "lucide-react";
import { Link } from "react-router-dom";

export default function Settings() {
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
                ← Back to Dashboard
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Settings</h1>
          <p className="text-muted-foreground">Manage your account and team settings</p>
        </div>

        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList>
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="security">Security</TabsTrigger>
            <TabsTrigger value="cli">CLI Access</TabsTrigger>
            <TabsTrigger value="billing">Billing</TabsTrigger>
            <TabsTrigger value="team">Team</TabsTrigger>
          </TabsList>

          {/* Profile Tab */}
          <TabsContent value="profile" className="space-y-6">
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-6">Profile Settings</h2>
              
              <div className="space-y-6 max-w-2xl">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input 
                    id="email" 
                    type="email" 
                    defaultValue="alice@acme.com"
                    className="h-11"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="name">Display Name</Label>
                  <Input 
                    id="name" 
                    type="text" 
                    defaultValue="Alice Chen"
                    className="h-11"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="timezone">Time Zone</Label>
                  <Input 
                    id="timezone" 
                    type="text" 
                    defaultValue="America/New_York"
                    className="h-11"
                  />
                </div>

                <Button>Save Changes</Button>
              </div>
            </Card>
          </TabsContent>

          {/* Security Tab */}
          <TabsContent value="security" className="space-y-6">
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-6">Change Password</h2>
              
              <div className="space-y-6 max-w-2xl">
                <div className="space-y-2">
                  <Label htmlFor="current">Current Password</Label>
                  <Input 
                    id="current" 
                    type="password"
                    className="h-11"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="new">New Password</Label>
                  <Input 
                    id="new" 
                    type="password"
                    className="h-11"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirm">Confirm New Password</Label>
                  <Input 
                    id="confirm" 
                    type="password"
                    className="h-11"
                  />
                </div>

                <Button>Change Password</Button>
              </div>
            </Card>

            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4">Active Sessions</h2>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 rounded-lg border border-border">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium">🖥️ Current Session</span>
                      <Badge variant="secondary">Now</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">Chrome on macOS • 192.168.1.100</p>
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 rounded-lg border border-border">
                  <div>
                    <div className="font-medium mb-1">💻 CLI Session</div>
                    <p className="text-sm text-muted-foreground">CLI v1.2.0 • 2h ago</p>
                  </div>
                  <Button variant="ghost" size="sm" className="text-destructive">
                    Revoke
                  </Button>
                </div>
              </div>
            </Card>
          </TabsContent>

          {/* CLI Access Tab */}
          <TabsContent value="cli" className="space-y-6">
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4">Personal Access Token</h2>
              <p className="text-sm text-muted-foreground mb-6">
                Use this token to authenticate the CLI without browser login
              </p>

              <div className="space-y-4 max-w-2xl">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label>Your Token</Label>
                    <div className="flex gap-2">
                      <Button variant="ghost" size="sm">Show Full</Button>
                      <Button variant="ghost" size="sm">Copy</Button>
                    </div>
                  </div>
                  <Input 
                    type="password"
                    value="envt_a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6"
                    readOnly
                    className="h-11 font-mono"
                  />
                </div>

                <Card className="p-4 bg-destructive/5 border-destructive/20">
                  <div className="flex gap-3">
                    <AlertCircle className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium text-sm mb-1">Keep this secret</p>
                      <p className="text-sm text-muted-foreground">
                        Anyone with this token can access your projects. Never share it or commit it to version control.
                      </p>
                    </div>
                  </div>
                </Card>

                <div>
                  <h3 className="font-medium mb-2">Usage:</h3>
                  <div className="bg-terminal-bg text-terminal-text px-4 py-3 rounded-lg font-mono text-sm">
                    <span className="text-terminal-prompt">$</span> envvault login --token envt_a1b2c3...
                  </div>
                </div>

                <Button variant="outline">Regenerate Token</Button>
              </div>
            </Card>
          </TabsContent>

          {/* Billing Tab */}
          <TabsContent value="billing" className="space-y-6">
            <Card className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-xl font-semibold mb-1">Current Plan</h2>
                  <div className="flex items-center gap-3">
                    <Badge className="bg-gradient-primary">Team Plan</Badge>
                    <span className="text-sm text-muted-foreground">Active</span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold">$40.00</div>
                  <div className="text-sm text-muted-foreground">per month</div>
                </div>
              </div>

              <div className="space-y-4 mb-6">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">5 team members</span>
                  <span>$8.00 each</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Next billing date</span>
                  <span>December 15, 2025</span>
                </div>
              </div>

              <div className="flex gap-2">
                <Button variant="outline">Change Plan</Button>
                <Button variant="ghost" className="text-destructive">Cancel Subscription</Button>
              </div>
            </Card>

            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-6">Usage</h2>
              
              <div className="space-y-6">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Team Members</span>
                    <span className="text-sm text-muted-foreground">5 / 25</span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-primary" style={{ width: "20%" }} />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Projects</span>
                    <span className="text-sm text-muted-foreground">4 / Unlimited</span>
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Storage</span>
                    <span className="text-sm text-muted-foreground">2.4 MB / Unlimited</span>
                  </div>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-6">Invoices</h2>
              
              <div className="space-y-3">
                {[
                  { date: "Nov 15, 2025", amount: "$40.00", status: "Paid" },
                  { date: "Oct 15, 2025", amount: "$40.00", status: "Paid" },
                  { date: "Sep 15, 2025", amount: "$40.00", status: "Paid" },
                ].map((invoice, i) => (
                  <div key={i} className="flex items-center justify-between p-4 rounded-lg border border-border">
                    <div className="flex items-center gap-4">
                      <CreditCard className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <div className="font-medium">{invoice.date}</div>
                        <div className="text-sm text-muted-foreground">{invoice.amount}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge variant="secondary">{invoice.status}</Badge>
                      <Button variant="ghost" size="sm">Download</Button>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </TabsContent>

          {/* Team Tab */}
          <TabsContent value="team" className="space-y-6">
            <Card className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-xl font-semibold mb-1">Team Members</h2>
                  <p className="text-sm text-muted-foreground">Manage your team</p>
                </div>
                <Button>
                  <Users className="h-4 w-4 mr-2" />
                  Invite Member
                </Button>
              </div>

              <div className="space-y-4">
                {[
                  { email: "alice@acme.com", role: "Owner", joined: "Oct 1, 2025", projects: 4, you: true },
                  { email: "bob@acme.com", role: "Admin", joined: "Oct 5, 2025", projects: 3, you: false },
                  { email: "charlie@acme.com", role: "Developer", joined: "Oct 10, 2025", projects: 2, you: false },
                  { email: "diana@acme.com", role: "Developer", joined: "Oct 15, 2025", projects: 1, you: false },
                ].map((member) => (
                  <div key={member.email} className="p-4 rounded-lg border border-border">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                          <span className="text-lg font-medium text-primary">
                            {member.email[0].toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium">{member.email}</span>
                            {member.you && (
                              <Badge variant="secondary" className="text-xs">You</Badge>
                            )}
                            <Badge variant="outline" className="text-xs">{member.role}</Badge>
                          </div>
                          <div className="text-sm text-muted-foreground">
                            Joined: {member.joined} • Projects: {member.projects}
                          </div>
                        </div>
                      </div>
                      {!member.you && (
                        <div className="flex gap-2">
                          <Button variant="ghost" size="sm">Change Role</Button>
                          <Button variant="ghost" size="sm" className="text-destructive">Remove</Button>
                        </div>
                      )}
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
