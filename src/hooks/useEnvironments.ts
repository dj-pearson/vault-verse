import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export interface Environment {
  id: string;
  project_id: string;
  name: string;
  created_at: string;
}

export interface CreateEnvironmentParams {
  projectId: string;
  name: string;
}

export interface DeleteEnvironmentParams {
  environmentId: string;
}

export interface CopySecretsParams {
  sourceEnvId: string;
  targetEnvId: string;
  overwrite?: boolean;
}

// Hook to get environments for a project
export const useEnvironments = (projectId: string | undefined) => {
  return useQuery({
    queryKey: ['environments', projectId],
    queryFn: async () => {
      if (!projectId) return [];

      const { data, error } = await supabase
        .from('environments')
        .select('*')
        .eq('project_id', projectId)
        .order('name');

      if (error) throw error;
      return (data || []) as Environment[];
    },
    enabled: !!projectId,
  });
};

// Hook to create an environment
export const useCreateEnvironment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ projectId, name }: CreateEnvironmentParams) => {
      const { data, error } = await supabase.rpc('create_environment', {
        p_project_id: projectId,
        p_name: name,
      });

      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['environments', variables.projectId] });
      toast({
        title: 'Success',
        description: `Environment ${variables.name} created successfully`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to create environment',
        variant: 'destructive',
      });
    },
  });
};

// Hook to delete an environment
export const useDeleteEnvironment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ environmentId }: DeleteEnvironmentParams) => {
      const { data, error } = await supabase.rpc('delete_environment', {
        p_environment_id: environmentId,
      });

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['environments'] });
      toast({
        title: 'Success',
        description: 'Environment deleted successfully',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to delete environment',
        variant: 'destructive',
      });
    },
  });
};

// Hook to copy secrets between environments
export const useCopySecrets = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ sourceEnvId, targetEnvId, overwrite = false }: CopySecretsParams) => {
      const { data, error } = await supabase.rpc('copy_environment_secrets', {
        p_source_env_id: sourceEnvId,
        p_target_env_id: targetEnvId,
        p_overwrite: overwrite,
      });

      if (error) throw error;
      return data;
    },
    onSuccess: (copiedCount, variables) => {
      queryClient.invalidateQueries({ queryKey: ['secrets', variables.targetEnvId] });
      toast({
        title: 'Success',
        description: `Copied ${copiedCount} variables successfully`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to copy secrets',
        variant: 'destructive',
      });
    },
  });
};
