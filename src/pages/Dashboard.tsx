import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Lock, Clock, Terminal, Trash2 } from "lucide-react";
import { Link } from "react-router-dom";
import { Navigation } from "@/components/Navigation";
import { useProjects, useDeleteProject } from "@/hooks/useProjects";
import { CreateProjectDialog } from "@/components/CreateProjectDialog";
import { formatDistanceToNow } from "date-fns";

export default function Dashboard() {
  const { data: projects, isLoading } = useProjects();
  const deleteProject = useDeleteProject();

  const handleDelete = async (projectId: string, projectName: string) => {
    if (confirm(`Are you sure you want to delete "${projectName}"? This action cannot be undone.`)) {
      await deleteProject.mutateAsync(projectId);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <div className="container mx-auto px-4 py-8 pt-24">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">Projects</h1>
            <p className="text-muted-foreground">Manage your environment variables</p>
          </div>
          <CreateProjectDialog />
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="text-center py-12">
            <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-muted-foreground">Loading projects...</p>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && (!projects || projects.length === 0) && (
          <Card className="p-12 text-center">
            <div className="max-w-md mx-auto">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Lock className="h-8 w-8 text-primary" />
              </div>
              <h2 className="text-2xl font-bold mb-2">No Projects Yet</h2>
              <p className="text-muted-foreground mb-6">
                Create your first project to start managing environment variables securely
              </p>
              <CreateProjectDialog />
            </div>
          </Card>
        )}

        {/* Projects Grid */}
        {!isLoading && projects && projects.length > 0 && (
          <div className="grid lg:grid-cols-2 gap-6">
            {projects.map((project) => (
              <Card key={project.id} className="p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-xl font-semibold mb-1">{project.name}</h3>
                    <span className="inline-block text-xs px-2 py-1 rounded-full bg-muted text-muted-foreground">
                      Personal
                    </span>
                  </div>
                </div>
                
                {project.description && (
                  <p className="text-sm text-muted-foreground mb-4">
                    {project.description}
                  </p>
                )}

                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
                  <Clock className="h-4 w-4" />
                  <span>Created {formatDistanceToNow(new Date(project.created_at), { addSuffix: true })}</span>
                </div>

                <div className="flex gap-2">
                  <Button variant="outline" size="sm" asChild>
                    <Link to={`/dashboard/projects/${project.id}`}>View Details</Link>
                  </Button>
                  <Button variant="ghost" size="sm" asChild>
                    <Link to="/docs">
                      <Terminal className="h-4 w-4 mr-2" />
                      CLI Setup
                    </Link>
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => handleDelete(project.id, project.name)}
                    className="ml-auto text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Quick Start Guide */}
        {!isLoading && projects && projects.length > 0 && (
          <Card className="mt-8 p-6 bg-muted/50">
            <div className="flex gap-4">
              <div className="p-2 rounded-lg bg-primary/10 flex-shrink-0 h-fit">
                <Terminal className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold mb-2">Next Steps: Set Up CLI</h3>
                <p className="text-sm text-muted-foreground mb-3">
                  Install the EnvVault CLI to sync secrets with your local development environment
                </p>
                <Button variant="outline" size="sm" asChild>
                  <Link to="/docs">View CLI Documentation</Link>
                </Button>
              </div>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
