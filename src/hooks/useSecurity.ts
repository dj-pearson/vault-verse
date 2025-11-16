import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { runFullSecurityScan } from '@/utils/security-detection';

export interface SecurityLeak {
  id: string;
  detection_type: 'database_leak' | 'env_leak' | 'api_key_leak' | 'credential_leak';
  severity: 'critical' | 'high' | 'medium' | 'low';
  source: string;
  description: string;
  leaked_data_sample?: string;
  affected_tables?: string[];
  affected_users?: string[];
  auto_resolved: boolean;
  resolved_at?: string;
  resolved_by?: string;
  resolution_notes?: string;
  metadata?: Record<string, any>;
  created_at: string;
}

export interface EnvScan {
  id: string;
  scan_type: 'automated' | 'manual' | 'scheduled';
  status: 'running' | 'completed' | 'failed';
  findings_count: number;
  critical_findings_count: number;
  high_findings_count: number;
  medium_findings_count: number;
  low_findings_count: number;
  scan_results?: Record<string, any>;
  started_at: string;
  completed_at?: string;
  triggered_by?: string;
}

export interface EnvFinding {
  id: string;
  scan_id: string;
  finding_type: 'exposed_in_code' | 'exposed_in_logs' | 'weak_encryption' | 'public_repository' | 'insecure_transmission';
  severity: 'critical' | 'high' | 'medium' | 'low';
  environment_id?: string;
  project_id?: string;
  variable_name: string;
  location?: string;
  description: string;
  recommendation?: string;
  status: 'open' | 'acknowledged' | 'resolved' | 'false_positive';
  resolved_at?: string;
  resolved_by?: string;
  created_at: string;
}

/**
 * Fetch all security leak detections
 */
export function useSecurityLeaks(limit: number = 100) {
  return useQuery({
    queryKey: ['security-leaks', limit],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('security_leak_detections')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data as SecurityLeak[];
    },
  });
}

/**
 * Fetch security leaks by severity
 */
export function useSecurityLeaksBySeverity(severity: 'critical' | 'high' | 'medium' | 'low') {
  return useQuery({
    queryKey: ['security-leaks', 'severity', severity],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('security_leak_detections')
        .select('*')
        .eq('severity', severity)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as SecurityLeak[];
    },
  });
}

/**
 * Resolve a security leak
 */
export function useResolveSecurityLeak() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, notes }: { id: string; notes: string }) => {
      const { data: user } = await supabase.auth.getUser();

      const { data, error } = await supabase
        .from('security_leak_detections')
        .update({
          auto_resolved: false,
          resolved_at: new Date().toISOString(),
          resolved_by: user.user?.id,
          resolution_notes: notes,
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['security-leaks'] });
    },
  });
}

/**
 * Fetch all environment scans
 */
export function useEnvScans(limit: number = 50) {
  return useQuery({
    queryKey: ['env-scans', limit],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('env_exposure_scans')
        .select('*')
        .order('started_at', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data as EnvScan[];
    },
  });
}

/**
 * Fetch findings for a specific scan
 */
export function useEnvFindingsByScan(scanId: string) {
  return useQuery({
    queryKey: ['env-findings', scanId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('env_exposure_findings')
        .select('*')
        .eq('scan_id', scanId)
        .order('severity', { ascending: false });

      if (error) throw error;
      return data as EnvFinding[];
    },
    enabled: !!scanId,
  });
}

/**
 * Fetch all open environment findings
 */
export function useOpenEnvFindings() {
  return useQuery({
    queryKey: ['env-findings', 'open'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('env_exposure_findings')
        .select('*')
        .eq('status', 'open')
        .order('severity', { ascending: false });

      if (error) throw error;
      return data as EnvFinding[];
    },
  });
}

/**
 * Run a new security scan
 */
export function useRunSecurityScan() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const results = await runFullSecurityScan();
      return results;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['security-leaks'] });
      queryClient.invalidateQueries({ queryKey: ['env-scans'] });
      queryClient.invalidateQueries({ queryKey: ['env-findings'] });
    },
  });
}

/**
 * Update finding status
 */
export function useUpdateFindingStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      status,
    }: {
      id: string;
      status: 'open' | 'acknowledged' | 'resolved' | 'false_positive';
    }) => {
      const { data: user } = await supabase.auth.getUser();

      const updates: any = { status };
      if (status === 'resolved') {
        updates.resolved_at = new Date().toISOString();
        updates.resolved_by = user.user?.id;
      }

      const { data, error } = await supabase
        .from('env_exposure_findings')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['env-findings'] });
    },
  });
}

/**
 * Get security statistics
 */
export function useSecurityStats() {
  return useQuery({
    queryKey: ['security-stats'],
    queryFn: async () => {
      const [leaksRes, findingsRes] = await Promise.all([
        supabase
          .from('security_leak_detections')
          .select('severity', { count: 'exact' }),
        supabase
          .from('env_exposure_findings')
          .select('severity, status', { count: 'exact' }),
      ]);

      const stats = {
        totalLeaks: leaksRes.count || 0,
        totalFindings: findingsRes.count || 0,
        criticalLeaks: 0,
        highLeaks: 0,
        openFindings: 0,
        resolvedFindings: 0,
      };

      if (leaksRes.data) {
        stats.criticalLeaks = leaksRes.data.filter((l) => l.severity === 'critical').length;
        stats.highLeaks = leaksRes.data.filter((l) => l.severity === 'high').length;
      }

      if (findingsRes.data) {
        stats.openFindings = findingsRes.data.filter((f) => f.status === 'open').length;
        stats.resolvedFindings = findingsRes.data.filter((f) => f.status === 'resolved').length;
      }

      return stats;
    },
  });
}
