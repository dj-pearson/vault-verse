import { useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Lock, Copy, AlertCircle, Users, Settings, Activity, Database, Plus } from "lucide-react";
import { Link } from "react-router-dom";
import { TerminalWindow, TerminalLine } from "@/components/TerminalWindow";
import { SecretManager } from "@/components/SecretManager";
import { useEnvironments } from "@/hooks/useEnvironments";
import { useProjects } from "@/hooks/useProjects";
import { useAuditLogs } from "@/hooks/useAuditLogs";
import { useState } from "react";
import { formatDistanceToNow } from "date-fns";

export default function ProjectDetailNew() {
  const { projectId } = useParams<{ projectId: string }>();
  const { data: projects } = useProjects();
  const { data: environments } = useEnvironments(projectId);
  const { data: auditLogs } = useAuditLogs(projectId);
  const [selectedEnv, setSelectedEnv] = useState<string | undefined>();

  const project = projects?.find(p => p.id === projectId);

  if (!project) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Project not found</h2>
          <Link to="/dashboard" className="text-primary hover:underline">
            Return to dashboard
          </Link>
        </div>
      </div>
    );
  }

  const totalSecrets = environments?.reduce((sum, env) => {
    // This would need to be calculated properly with secret counts
    return sum + 0;
  }, 0) || 0;

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
                <h1 className="text-3xl font-bold">{project.name}</h1>
                <Badge variant="secondary">Personal</Badge>
              </div>
              <p className="text-muted-foreground">{project.description || 'No description'}</p>
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
            <span>Created: {formatDistanceToNow(new Date(project.created_at), { addSuffix: true })}</span>
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
                    <TerminalLine prompt>envault pull {project.name}</TerminalLine>
                  </TerminalWindow>
                </div>

                <div>
                  <h3 className="text-sm font-medium mb-2">View variables (CLI only):</h3>
                  <TerminalWindow className="max-w-2xl">
                    <TerminalLine prompt>envault list {project.name}</TerminalLine>
                  </TerminalWindow>
                </div>

                <div>
                  <h3 className="text-sm font-medium mb-2">Add variable (CLI only):</h3>
                  <TerminalWindow className="max-w-2xl">
                    <TerminalLine prompt>envault set KEY=value --env production</TerminalLine>
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
                    Variable VALUES are encrypted and can be viewed/edited through this dashboard.
                    For enhanced security, you can also use the CLI for all secret operations.
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
                    <div className="text-2xl font-bold">{environments?.length || 0}</div>
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
                    <div className="text-2xl font-bold">{totalSecrets}</div>
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
                    <div className="text-2xl font-bold">{auditLogs?.length || 0}</div>
                    <div className="text-sm text-muted-foreground">Recent Actions</div>
                  </div>
                </div>
              </Card>
            </div>
          </TabsContent>

          {/* Environments Tab */}
          <TabsContent value="environments" className="space-y-6">
            {!environments || environments.length === 0 ? (
              <Card className="p-12 text-center">
                <Database className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-xl font-semibold mb-2">No Environments Yet</h3>
                <p className="text-muted-foreground mb-4">
                  Create your first environment to start managing secrets
                </p>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Environment
                </Button>
              </Card>
            ) : (
              environments.map((env) => (
                <Card key={env.id} className="p-6">
                  <div className="flex items-start justify-between mb-6">
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-xl font-semibold capitalize">{env.name}</h3>
                        {env.name === 'development' && <Badge variant="secondary">Default</Badge>}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Created {formatDistanceToNow(new Date(env.created_at), { addSuffix: true })}
                      </p>
                    </div>
                  </div>

                  <SecretManager
                    environmentId={env.id}
                    environmentName={env.name}
                    canEdit={true}
                  />
                </Card>
              ))
            )}
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

              <div className="text-center py-12 text-muted-foreground">
                <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Team member management coming soon</p>
                <p className="text-sm mt-2">Invite collaborators to work on this project together</p>
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
                {!auditLogs || auditLogs.length === 0 ? (
                  <div className="p-12 text-center text-muted-foreground">
                    <Activity className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No activity yet</p>
                    <p className="text-sm mt-2">Actions will appear here as you make changes</p>
                  </div>
                ) : (
                  auditLogs.map((log) => (
                    <div key={log.id} className="p-6">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <p className="font-medium">
                            {log.action.replace(/_/g, ' ')}
                          </p>
                          <div className="flex items-center gap-3 text-sm text-muted-foreground mt-1">
                            <span>Type: {log.resource_type}</span>
                            {log.metadata && (
                              <>
                                <span>•</span>
                                <span className="font-mono text-xs">
                                  {JSON.stringify(log.metadata).substring(0, 50)}...
                                </span>
                              </>
                            )}
                          </div>
                        </div>
                        <span className="text-sm text-muted-foreground">
                          {formatDistanceToNow(new Date(log.created_at), { addSuffix: true })}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
