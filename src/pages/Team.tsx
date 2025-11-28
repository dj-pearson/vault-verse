import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Lock, Search, Shield, Crown, Users as UsersIcon, FolderOpen, ArrowRight, Info } from "lucide-react";
import { Link } from "react-router-dom";
import { useProjects } from "@/hooks/useProjects";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface TeamMemberWithProject {
  id: string;
  role: string;
  projectId: string;
  projectName: string;
  user: {
    id: string;
    email: string;
    full_name: string | null;
    avatar_url: string | null;
  };
}

export default function Team() {
  const { user } = useAuth();
  const { projects, isLoading: projectsLoading } = useProjects();
  const [searchQuery, setSearchQuery] = useState("");

  // Fetch all team members across all user's projects
  const { data: allTeamMembers, isLoading: membersLoading } = useQuery({
    queryKey: ["all-team-members", projects?.map(p => p.id)],
    queryFn: async () => {
      if (!projects || projects.length === 0) return [];

      const projectIds = projects.map(p => p.id);

      const { data, error } = await supabase
        .from("team_members")
        .select("id, role, project_id, user_id, profiles(id, email, full_name, avatar_url)")
        .in("project_id", projectIds);

      if (error) throw error;

      // Map to include project names
      const projectMap = new Map(projects.map(p => [p.id, p.name]));

      return (data || []).map(member => ({
        id: member.id,
        role: member.role,
        projectId: member.project_id,
        projectName: projectMap.get(member.project_id) || "Unknown",
        user: {
          id: member.profiles?.id || member.user_id,
          email: member.profiles?.email || "Unknown",
          full_name: member.profiles?.full_name || null,
          avatar_url: member.profiles?.avatar_url || null,
        },
      })) as TeamMemberWithProject[];
    },
    enabled: !!projects && projects.length > 0,
  });

  // Get unique team members (deduplicated by user id)
  const uniqueMembers = useMemo(() => {
    if (!allTeamMembers) return [];

    const memberMap = new Map<string, TeamMemberWithProject & { projects: { id: string; name: string; role: string }[] }>();

    allTeamMembers.forEach(member => {
      const existing = memberMap.get(member.user.id);
      if (existing) {
        existing.projects.push({
          id: member.projectId,
          name: member.projectName,
          role: member.role
        });
      } else {
        memberMap.set(member.user.id, {
          ...member,
          projects: [{ id: member.projectId, name: member.projectName, role: member.role }],
        });
      }
    });

    return Array.from(memberMap.values());
  }, [allTeamMembers]);

  // Filter members based on search query
  const filteredMembers = useMemo(() => {
    if (!searchQuery.trim()) return uniqueMembers;

    const query = searchQuery.toLowerCase();
    return uniqueMembers.filter(member =>
      member.user.email.toLowerCase().includes(query) ||
      member.user.full_name?.toLowerCase().includes(query)
    );
  }, [uniqueMembers, searchQuery]);

  // Calculate stats
  const stats = useMemo(() => {
    return {
      totalMembers: uniqueMembers.length,
      projectsWithTeams: new Set(allTeamMembers?.map(m => m.projectId) || []).size,
      totalProjects: projects?.length || 0,
    };
  }, [uniqueMembers, allTeamMembers, projects]);

  const isLoading = projectsLoading || membersLoading;

  const getInitials = (name: string | null, email: string) => {
    if (name) {
      return name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2);
    }
    return email.slice(0, 2).toUpperCase();
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case "admin":
        return <Shield className="h-3 w-3" />;
      case "owner":
        return <Crown className="h-3 w-3" />;
      default:
        return null;
    }
  };

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case "admin":
        return "default";
      case "owner":
        return "default";
      default:
        return "secondary";
    }
  };

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
              <span>ENVault</span>
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
            <h1 className="text-3xl font-bold mb-2">Team Overview</h1>
            <p className="text-muted-foreground">View team members across all your projects</p>
          </div>
        </div>

        {/* Info Alert */}
        <Alert className="mb-6">
          <Info className="h-4 w-4" />
          <AlertDescription>
            Team members are managed at the project level. To invite or manage members, go to a specific project's Team tab.
          </AlertDescription>
        </Alert>

        {/* Team Overview Stats */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card className="p-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 rounded-lg bg-primary/10">
                <UsersIcon className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{isLoading ? "..." : stats.totalMembers}</p>
                <p className="text-sm text-muted-foreground">Team Members</p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 rounded-lg bg-accent/10">
                <FolderOpen className="h-5 w-5 text-accent" />
              </div>
              <div>
                <p className="text-2xl font-bold">{isLoading ? "..." : stats.projectsWithTeams}</p>
                <p className="text-sm text-muted-foreground">Projects with Teams</p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 rounded-lg bg-primary/10">
                <Shield className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{isLoading ? "..." : stats.totalProjects}</p>
                <p className="text-sm text-muted-foreground">Total Projects</p>
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
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* Team Members List */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">
            Team Members {!isLoading && `(${filteredMembers.length})`}
          </h2>

          {isLoading ? (
            <Card className="p-8 text-center text-muted-foreground">
              Loading team members...
            </Card>
          ) : filteredMembers.length === 0 ? (
            <Card className="p-8 text-center">
              <UsersIcon className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
              <p className="text-muted-foreground">
                {searchQuery ? "No team members match your search" : "No team members yet"}
              </p>
              <p className="text-sm text-muted-foreground mt-2">
                Invite team members from within a project's Team tab
              </p>
            </Card>
          ) : (
            <div className="space-y-3">
              {filteredMembers.map((member) => (
                <Card key={member.user.id} className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={member.user.avatar_url || undefined} />
                        <AvatarFallback className="bg-gradient-primary text-white">
                          {getInitials(member.user.full_name, member.user.email)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-medium">
                            {member.user.full_name || member.user.email}
                          </p>
                          {member.user.id === user?.id && (
                            <span className="text-xs text-muted-foreground">(You)</span>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">{member.user.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="flex flex-wrap gap-1 justify-end max-w-xs">
                        {member.projects.slice(0, 3).map((project) => (
                          <Link
                            key={project.id}
                            to={`/project/${project.id}`}
                            className="group"
                          >
                            <Badge
                              variant={getRoleBadgeVariant(project.role)}
                              className="gap-1 hover:bg-primary/80 transition-colors cursor-pointer"
                            >
                              {getRoleIcon(project.role)}
                              {project.name}
                            </Badge>
                          </Link>
                        ))}
                        {member.projects.length > 3 && (
                          <Badge variant="outline">
                            +{member.projects.length - 3} more
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Projects Quick Access */}
        {projects && projects.length > 0 && (
          <div>
            <h2 className="text-xl font-semibold mb-4">Manage Project Teams</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {projects.slice(0, 6).map((project) => (
                <Link key={project.id} to={`/project/${project.id}`}>
                  <Card className="p-4 hover:border-primary/50 transition-colors cursor-pointer">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{project.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {project.description || "No description"}
                        </p>
                      </div>
                      <ArrowRight className="h-4 w-4 text-muted-foreground" />
                    </div>
                  </Card>
                </Link>
              ))}
            </div>
            {projects.length > 6 && (
              <div className="mt-4 text-center">
                <Link to="/dashboard">
                  <Button variant="outline">
                    View All Projects
                  </Button>
                </Link>
              </div>
            )}
          </div>
        )}

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
                <strong>Member:</strong> Read/write dev & staging, read-only production
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
