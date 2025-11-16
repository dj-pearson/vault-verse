import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface Environment {
  id: string;
  project_id: string;
  name: string;
  created_at: string;
}

export function useEnvironments(projectId: string) {
  return useQuery({
    queryKey: ['environments', projectId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('environments')
        .select('*')
        .eq('project_id', projectId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      return data as Environment[];
    },
    enabled: !!projectId,
  });
}

export function useCreateEnvironment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ projectId, name }: { projectId: string; name: string }) => {
      const { data, error } = await supabase
        .from('environments')
        .insert([{ project_id: projectId, name }])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['environments', variables.projectId] });
      toast.success('Environment created successfully');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to create environment');
    },
  });
}
