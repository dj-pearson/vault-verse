import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export interface CLIToken {
  id: string;
  user_id: string;
  token_hash: string;
  name: string;
  last_used_at: string | null;
  expires_at: string | null;
  created_at: string;
}

export interface GeneratedToken {
  id: string;
  token: string;
  name: string;
  expires_at: string | null;
  warning: string;
}

// Hook to get all CLI tokens for current user
export const useCLITokens = () => {
  return useQuery({
    queryKey: ['cli_tokens'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('cli_tokens')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return (data || []) as CLIToken[];
    },
  });
};

// Hook to generate a new CLI token
export const useGenerateCLIToken = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ name, expiresInDays = 90 }: { name: string; expiresInDays?: number }) => {
      const { data, error } = await supabase.rpc('generate_cli_token', {
        p_name: name,
        p_expires_in_days: expiresInDays,
      });

      if (error) throw error;
      return data as GeneratedToken;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cli_tokens'] });
      toast({
        title: 'Token Generated',
        description: 'Save this token securely - it will not be shown again!',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to generate token',
        variant: 'destructive',
      });
    },
  });
};

// Hook to revoke a CLI token
export const useRevokeCLIToken = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (tokenId: string) => {
      const { data, error } = await supabase.rpc('revoke_cli_token', {
        p_token_id: tokenId,
      });

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cli_tokens'] });
      toast({
        title: 'Success',
        description: 'Token revoked successfully',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to revoke token',
        variant: 'destructive',
      });
    },
  });
};
