import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Plus, Folder, Trash2 } from "lucide-react";
import { CreateProjectDialog } from "@/components/CreateProjectDialog";
import { OnboardingDialog } from "@/components/OnboardingDialog";
import { useProjects } from "@/hooks/useProjects";
import { Link } from "react-router-dom";
import { Navigation } from "@/components/Navigation";
import { UsageLimitsBadge } from "@/components/UsageLimitsBadge";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";

export default function Dashboard() {
  useDocumentTitle("Dashboard");

  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState<{ id: string; name: string } | null>(null);
  const { projects, isLoading, deleteProject } = useProjects();

  const handleDeleteProject = () => {
    if (projectToDelete) {
      deleteProject(projectToDelete.id);
      setProjectToDelete(null);
    }
  };

  useEffect(() => {
    // Check if user has completed onboarding
    const onboardingCompleted = localStorage.getItem('envault_onboarding_completed');
    if (!onboardingCompleted && !isLoading) {
      // Show onboarding after a small delay for better UX
      const timer = setTimeout(() => {
        setShowOnboarding(true);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [isLoading]);

  const handleOnboardingClose = (open: boolean) => {
    if (!open) {
      localStorage.setItem('envault_onboarding_completed', 'true');
    }
    setShowOnboarding(open);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main id="main-content" className="container mx-auto p-6" tabIndex={-1}>
        <div className="flex justify-between items-start mb-8">
          <div className="space-y-4">
            <div>
              <h1 className="text-3xl font-bold">Projects</h1>
              <p className="text-muted-foreground">Manage your environment variables and secrets</p>
            </div>
            <UsageLimitsBadge />
          </div>
          <Button onClick={() => setIsCreateDialogOpen(true)} aria-label="Create new project">
            <Plus className="mr-2 h-4 w-4" aria-hidden="true" />
            New Project
          </Button>
        </div>

        {isLoading ? (
          <div className="text-center py-12" role="status" aria-busy="true" aria-live="polite">
            <span className="sr-only">Loading projects</span>
            <p className="text-muted-foreground">Loading projects...</p>
          </div>
        ) : projects && projects.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3" role="list" aria-label="Your projects">
            {projects.map((project) => (
              <Card key={project.id} role="listitem">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <Folder className="h-5 w-5 text-primary" aria-hidden="true" />
                      <CardTitle className="text-lg">{project.name}</CardTitle>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setProjectToDelete({ id: project.id, name: project.name })}
                      aria-label={`Delete ${project.name}`}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" aria-hidden="true" />
                    </Button>
                  </div>
                  {project.description && (
                    <CardDescription>{project.description}</CardDescription>
                  )}
                </CardHeader>
                <CardContent>
                  <Button variant="outline" size="sm" asChild className="w-full">
                    <Link to={`/dashboard/projects/${project.id}`} aria-label={`View details for ${project.name}`}>
                      View Details
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 border-2 border-dashed rounded-lg">
            <Folder className="h-12 w-12 mx-auto text-muted-foreground mb-4" aria-hidden="true" />
            <h3 className="text-lg font-semibold mb-2">No projects yet</h3>
            <p className="text-muted-foreground mb-4">
              Create your first project to get started
            </p>
            <Button onClick={() => setIsCreateDialogOpen(true)} aria-label="Create your first project">
              <Plus className="mr-2 h-4 w-4" aria-hidden="true" />
              Create Project
            </Button>
          </div>
        )}
      </main>

      <CreateProjectDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
      />

      <OnboardingDialog
        open={showOnboarding}
        onOpenChange={handleOnboardingClose}
      />

      <AlertDialog open={!!projectToDelete} onOpenChange={(open) => !open && setProjectToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Project</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{projectToDelete?.name}"? This action cannot be undone and will permanently delete all environments and secrets in this project.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteProject} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
