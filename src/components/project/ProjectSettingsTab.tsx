import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { Trash2 } from 'lucide-react';

interface Project {
  id: string;
  name: string;
  description: string | null;
  owner_id: string;
  created_at: string;
  updated_at: string;
}

interface ProjectSettingsTabProps {
  project: Project;
}

export const ProjectSettingsTab = ({ project }: ProjectSettingsTabProps) => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [name, setName] = useState(project.name);
  const [description, setDescription] = useState(project.description || '');

  const updateMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from('projects')
        .update({ name, description })
        .eq('id', project.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['project', project.id] });
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      toast({
        title: 'Success',
        description: 'Project updated successfully',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from('projects')
        .delete()
        .eq('id', project.id);

      if (error) throw error;
    },
    onSuccess: () => {
      toast({
        title: 'Success',
        description: 'Project deleted successfully',
      });
      navigate('/dashboard');
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Project Settings</CardTitle>
          <CardDescription>Update project information</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="project-name">Project Name</Label>
            <Input
              id="project-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="My Project"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="project-description">Description</Label>
            <Textarea
              id="project-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Optional project description"
              rows={3}
            />
          </div>

          <Button
            onClick={() => updateMutation.mutate()}
            disabled={updateMutation.isPending || !name}
          >
            {updateMutation.isPending ? 'Saving...' : 'Save Changes'}
          </Button>
        </CardContent>
      </Card>

      <Card className="border-destructive">
        <CardHeader>
          <CardTitle className="text-destructive">Danger Zone</CardTitle>
          <CardDescription>
            Irreversible actions - proceed with caution
          </CardDescription>
        </CardHeader>
        <CardContent>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive">
                <Trash2 className="h-4 w-4 mr-2" />
                Delete Project
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete Project</AlertDialogTitle>
                <AlertDialogDescription>
                  This will permanently delete the project "{project.name}" and all its
                  environments, secrets, and team members. This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={() => deleteMutation.mutate()}
                  className="bg-destructive hover:bg-destructive/90"
                >
                  Delete Project
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </CardContent>
      </Card>
    </div>
  );
};
