import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface UsageMetric {
  id: string;
  user_id: string;
  period_start: string;
  period_end: string;
  projects_count: number;
  secrets_count: number;
  team_members_count: number;
  api_calls_count: number;
  created_at: string;
  updated_at: string;
}

export const useUsageMetrics = () => {
  const { data: metrics, isLoading } = useQuery({
    queryKey: ["usage-metrics"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("usage_metrics")
        .select("*")
        .eq("user_id", user.id)
        .order("period_start", { ascending: false });

      if (error) throw error;
      return data as UsageMetric[];
    },
  });

  const currentPeriodMetrics = metrics?.[0];

  return {
    metrics,
    currentPeriodMetrics,
    isLoading,
  };
};
