import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Lock, Plus, Search, Mail, Shield, UserX, Crown, Users as UsersIcon } from "lucide-react";
import { Link } from "react-router-dom";

export default function Team() {
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
                Projects
              </Link>
              <Link to="/dashboard/team" className="text-sm font-medium">
                Team
              </Link>
              <Link to="/dashboard/settings" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                Settings
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">Team Management</h1>
            <p className="text-muted-foreground">Manage team members and their access</p>
          </div>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Invite Member
          </Button>
        </div>

        {/* Team Overview */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card className="p-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 rounded-lg bg-primary/10">
                <UsersIcon className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">5</p>
                <p className="text-sm text-muted-foreground">Team Members</p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 rounded-lg bg-accent/10">
                <Shield className="h-5 w-5 text-accent" />
              </div>
              <div>
                <p className="text-2xl font-bold">4</p>
                <p className="text-sm text-muted-foreground">Shared Projects</p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 rounded-lg bg-primary/10">
                <Mail className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">2</p>
                <p className="text-sm text-muted-foreground">Pending Invites</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Search */}
        <div className="mb-6">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search team members..."
              className="pl-10"
            />
          </div>
        </div>

        {/* Active Members */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Active Members (5)</h2>
          
          <div className="space-y-3">
            <Card className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded-full bg-gradient-primary flex items-center justify-center text-white font-semibold">
                    AC
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-medium">alice@acme.com</p>
                      <span className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full bg-primary/10 text-primary">
                        <Crown className="h-3 w-3" />
                        Owner
                      </span>
                      <span className="text-xs text-muted-foreground">(You)</span>
                    </div>
                    <p className="text-sm text-muted-foreground">Joined Oct 1, 2025 • Last active: Now</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" disabled>
                    View Projects
                  </Button>
                </div>
              </div>
            </Card>

            <Card className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center text-foreground font-semibold">
                    BJ
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-medium">bob@acme.com</p>
                      <span className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full bg-muted text-muted-foreground">
                        <Shield className="h-3 w-3" />
                        Admin
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">Joined Oct 5, 2025 • Last active: 2h ago</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm">
                    Change Role
                  </Button>
                  <Button variant="ghost" size="sm">
                    <UserX className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </Card>

            <Card className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center text-foreground font-semibold">
                    CD
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-medium">charlie@acme.com</p>
                      <span className="text-xs px-2 py-1 rounded-full bg-muted text-muted-foreground">
                        Developer
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">Joined Oct 12, 2025 • Last active: 5h ago</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm">
                    Change Role
                  </Button>
                  <Button variant="ghost" size="sm">
                    <UserX className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </Card>

            <Card className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center text-foreground font-semibold">
                    DL
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-medium">diana@acme.com</p>
                      <span className="text-xs px-2 py-1 rounded-full bg-muted text-muted-foreground">
                        Developer
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">Joined Oct 18, 2025 • Last active: Yesterday</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm">
                    Change Role
                  </Button>
                  <Button variant="ghost" size="sm">
                    <UserX className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </Card>

            <Card className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center text-foreground font-semibold">
                    ET
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-medium">eve@acme.com</p>
                      <span className="text-xs px-2 py-1 rounded-full bg-muted text-muted-foreground">
                        Viewer
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">Joined Nov 1, 2025 • Last active: 3d ago</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm">
                    Change Role
                  </Button>
                  <Button variant="ghost" size="sm">
                    <UserX className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        </div>

        {/* Pending Invites */}
        <div>
          <h2 className="text-xl font-semibold mb-4">Pending Invites (2)</h2>
          
          <div className="space-y-3">
            <Card className="p-4 bg-muted/30">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded-full border-2 border-dashed border-muted-foreground/30 flex items-center justify-center">
                    <Mail className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="font-medium">frank@acme.com</p>
                    <p className="text-sm text-muted-foreground">Invited 2 days ago • Developer role</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm">
                    Resend Invite
                  </Button>
                  <Button variant="ghost" size="sm">
                    Cancel
                  </Button>
                </div>
              </div>
            </Card>

            <Card className="p-4 bg-muted/30">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded-full border-2 border-dashed border-muted-foreground/30 flex items-center justify-center">
                    <Mail className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="font-medium">grace@acme.com</p>
                    <p className="text-sm text-muted-foreground">Invited 5 days ago • Viewer role</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm">
                    Resend Invite
                  </Button>
                  <Button variant="ghost" size="sm">
                    Cancel
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        </div>

        {/* Role Information */}
        <Card className="mt-8 p-6 bg-muted/30">
          <h3 className="text-lg font-semibold mb-4">Role Permissions</h3>
          <div className="space-y-3 text-sm">
            <div className="flex gap-3">
              <Crown className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
              <div>
                <strong>Owner:</strong> Full access including billing, team management, and all projects
              </div>
            </div>
            <div className="flex gap-3">
              <Shield className="h-5 w-5 text-accent flex-shrink-0 mt-0.5" />
              <div>
                <strong>Admin:</strong> Manage team members, create/delete projects, full variable access
              </div>
            </div>
            <div className="flex gap-3">
              <UsersIcon className="h-5 w-5 text-muted-foreground flex-shrink-0 mt-0.5" />
              <div>
                <strong>Developer:</strong> Read/write dev & staging, read-only production
              </div>
            </div>
            <div className="flex gap-3">
              <Lock className="h-5 w-5 text-muted-foreground flex-shrink-0 mt-0.5" />
              <div>
                <strong>Viewer:</strong> Read-only access to all environments
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
