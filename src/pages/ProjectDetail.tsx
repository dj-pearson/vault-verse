import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Navigation } from '@/components/Navigation';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { SecretManager } from '@/components/SecretManager';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Settings, Users, FileText, ChevronLeft } from 'lucide-react';
import { ProjectSettingsTab } from '@/components/project/ProjectSettingsTab';
import { ProjectTeamTab } from '@/components/project/ProjectTeamTab';
import { ProjectAuditTab } from '@/components/project/ProjectAuditTab';
import { Skeleton } from '@/components/ui/skeleton';

interface Environment {
  id: string;
  name: string;
  project_id: string;
  created_at: string;
}

interface Project {
  id: string;
  name: string;
  description: string | null;
  owner_id: string;
  created_at: string;
  updated_at: string;
}

export default function ProjectDetail() {
  const { id } = useParams<{ id: string }>();
  const [activeTab, setActiveTab] = useState('environments');
  const [activeEnvironmentId, setActiveEnvironmentId] = useState<string | null>(null);

  const { data: project, isLoading: projectLoading } = useQuery({
    queryKey: ['project', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      return data as Project;
    },
    enabled: !!id,
  });

  const { data: environments, isLoading: envsLoading } = useQuery({
    queryKey: ['environments', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('environments')
        .select('*')
        .eq('project_id', id)
        .order('created_at', { ascending: true });

      if (error) throw error;
      return data as Environment[];
    },
    enabled: !!id,
  });

  const { data: teamMembers } = useQuery({
    queryKey: ['team-members', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('team_members')
        .select('*')
        .eq('project_id', id);

      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });

  if (projectLoading || envsLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <main className="container mx-auto px-4 py-8 mt-16">
          {/* Header Skeleton */}
          <div className="mb-8">
            <Skeleton className="h-4 w-32 mb-4" />
            <div className="flex items-start justify-between">
              <div>
                <Skeleton className="h-9 w-64 mb-2" />
                <Skeleton className="h-5 w-96" />
              </div>
              <Skeleton className="h-6 w-24" />
            </div>
          </div>

          {/* Tabs Skeleton */}
          <div className="space-y-6">
            <div className="flex gap-2">
              <Skeleton className="h-10 w-32" />
              <Skeleton className="h-10 w-20" />
              <Skeleton className="h-10 w-24" />
              <Skeleton className="h-10 w-24" />
            </div>

            {/* Environment tabs skeleton */}
            <div className="flex gap-2 mb-4">
              <Skeleton className="h-9 w-28" />
              <Skeleton className="h-9 w-28" />
              <Skeleton className="h-9 w-28" />
            </div>

            {/* Card skeleton */}
            <Card>
              <CardHeader>
                <Skeleton className="h-6 w-48 mb-2" />
                <Skeleton className="h-4 w-72" />
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Secret rows skeleton */}
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="flex items-center justify-between py-3 border-b last:border-0">
                    <div className="flex items-center gap-4">
                      <Skeleton className="h-5 w-32" />
                      <Skeleton className="h-5 w-48" />
                    </div>
                    <div className="flex gap-2">
                      <Skeleton className="h-8 w-8" />
                      <Skeleton className="h-8 w-8" />
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <main className="container mx-auto px-4 py-8 mt-16">
          <div className="text-center py-12">
            <p className="text-muted-foreground">Project not found</p>
            <Button asChild className="mt-4">
              <Link to="/dashboard">Back to Dashboard</Link>
            </Button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="container mx-auto px-4 py-8 mt-16">
        {/* Header */}
        <div className="mb-8">
          <Link to="/dashboard" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-4">
            <ChevronLeft className="h-4 w-4 mr-1" />
            Back to Projects
          </Link>
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2">{project.name}</h1>
              {project.description && (
                <p className="text-muted-foreground">{project.description}</p>
              )}
            </div>
            <div className="flex items-center gap-2">
              {teamMembers && teamMembers.length > 0 && (
                <Badge variant="secondary">
                  <Users className="h-3 w-3 mr-1" />
                  {teamMembers.length + 1} members
                </Badge>
              )}
            </div>
          </div>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList>
            <TabsTrigger value="environments">Environments</TabsTrigger>
            <TabsTrigger value="team">
              <Users className="h-4 w-4 mr-2" />
              Team
            </TabsTrigger>
            <TabsTrigger value="audit">
              <FileText className="h-4 w-4 mr-2" />
              Audit Log
            </TabsTrigger>
            <TabsTrigger value="settings">
              <Settings className="h-4 w-4 mr-2" />
              Settings
            </TabsTrigger>
          </TabsList>

          {/* Environments Tab */}
          <TabsContent value="environments" className="space-y-6">
            {environments && environments.length > 0 ? (
              <Tabs
                value={activeEnvironmentId || environments[0].id}
                onValueChange={setActiveEnvironmentId}
                className="space-y-6"
              >
                <TabsList>
                  {environments.map((env) => (
                    <TabsTrigger key={env.id} value={env.id} className="capitalize">
                      {env.name}
                    </TabsTrigger>
                  ))}
                </TabsList>

                {/* Only render the active environment's SecretManager */}
                {environments.map((env) => {
                  const isActive = env.id === (activeEnvironmentId || environments[0].id);
                  return (
                    <TabsContent key={env.id} value={env.id}>
                      <Card>
                        <CardHeader>
                          <CardTitle className="capitalize">{env.name} Environment</CardTitle>
                          <CardDescription>
                            Manage environment variables for {env.name}
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          {isActive && (
                            <SecretManager
                              environmentId={env.id}
                              environmentName={env.name}
                              canEdit={true}
                            />
                          )}
                        </CardContent>
                      </Card>
                    </TabsContent>
                  );
                })}
              </Tabs>
            ) : (
              <Card>
                <CardContent className="text-center py-12">
                  <p className="text-muted-foreground">No environments found</p>
                  <p className="text-sm text-muted-foreground mt-2">
                    Environments are created automatically when you initialize a project
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Team Tab */}
          <TabsContent value="team">
            <ProjectTeamTab projectId={id!} ownerId={project.owner_id} />
          </TabsContent>

          {/* Audit Log Tab */}
          <TabsContent value="audit">
            <ProjectAuditTab projectId={id!} />
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings">
            <ProjectSettingsTab project={project} />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
