import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export interface Secret {
  id: string;
  key: string;
  value: string;
  created_at: string;
  updated_at: string;
}

export interface UpsertSecretParams {
  environmentId: string;
  key: string;
  value: string;
  description?: string;
}

export interface DeleteSecretParams {
  environmentId: string;
  key: string;
}

// Hook to get secrets for an environment
export const useSecrets = (environmentId: string | undefined) => {
  return useQuery({
    queryKey: ['secrets', environmentId],
    queryFn: async () => {
      if (!environmentId) return [];

      const { data, error } = await supabase.rpc('get_environment_secrets', {
        p_environment_id: environmentId,
      });

      if (error) throw error;
      return (data || []) as Secret[];
    },
    enabled: !!environmentId,
  });
};

// Hook to create or update a secret
export const useUpsertSecret = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ environmentId, key, value, description }: UpsertSecretParams) => {
      const { data, error } = await supabase.rpc('upsert_secret', {
        p_environment_id: environmentId,
        p_key: key,
        p_value: value,
        p_description: description,
      });

      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['secrets', variables.environmentId] });
      toast({
        title: 'Success',
        description: `Variable ${variables.key} saved successfully`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to save variable',
        variant: 'destructive',
      });
    },
  });
};

// Hook to delete a secret
export const useDeleteSecret = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ environmentId, key }: DeleteSecretParams) => {
      const { data, error } = await supabase.rpc('delete_secret', {
        p_environment_id: environmentId,
        p_key: key,
      });

      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['secrets', variables.environmentId] });
      toast({
        title: 'Success',
        description: `Variable ${variables.key} deleted successfully`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to delete variable',
        variant: 'destructive',
      });
    },
  });
};
