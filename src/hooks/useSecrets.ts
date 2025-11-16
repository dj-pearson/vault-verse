import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface Secret {
  id: string;
  environment_id: string;
  key: string;
  value: string;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export function useSecrets(environmentId: string) {
  return useQuery({
    queryKey: ['secrets', environmentId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('secrets')
        .select('*')
        .eq('environment_id', environmentId)
        .order('key', { ascending: true });

      if (error) throw error;
      return data as Secret[];
    },
    enabled: !!environmentId,
  });
}

export function useCreateSecret() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      environmentId,
      key,
      value,
    }: {
      environmentId: string;
      key: string;
      value: string;
    }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('secrets')
        .insert([
          {
            environment_id: environmentId,
            key,
            value,
            created_by: user.id,
          },
        ])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['secrets', variables.environmentId] });
      toast.success('Secret added successfully');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to add secret');
    },
  });
}

export function useUpdateSecret() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      secretId,
      environmentId,
      value,
    }: {
      secretId: string;
      environmentId: string;
      value: string;
    }) => {
      const { data, error } = await supabase
        .from('secrets')
        .update({ value })
        .eq('id', secretId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['secrets', variables.environmentId] });
      toast.success('Secret updated successfully');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to update secret');
    },
  });
}

export function useDeleteSecret() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ secretId, environmentId }: { secretId: string; environmentId: string }) => {
      const { error } = await supabase.from('secrets').delete().eq('id', secretId);

      if (error) throw error;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['secrets', variables.environmentId] });
      toast.success('Secret deleted successfully');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to delete secret');
    },
  });
}
