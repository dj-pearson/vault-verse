import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export type SubscriptionPlan = "free" | "team" | "enterprise";
export type SubscriptionStatus = "active" | "canceled" | "past_due" | "trialing";

export interface Subscription {
  id: string;
  user_id: string;
  plan: SubscriptionPlan;
  status: SubscriptionStatus;
  stripe_customer_id?: string;
  stripe_subscription_id?: string;
  current_period_start?: string;
  current_period_end?: string;
  cancel_at_period_end: boolean;
  created_at: string;
  updated_at: string;
}

export interface PlanLimits {
  projects: number;
  secrets_per_project: number;
  team_members: number;
  environments: number;
}

export interface UsageCheck {
  plan: SubscriptionPlan;
  limits: PlanLimits;
  usage: {
    projects: number;
    team_members: number;
    exceeds_limits: boolean;
  };
}

export const useSubscription = () => {
  const queryClient = useQueryClient();

  const { data: subscription, isLoading } = useQuery({
    queryKey: ["subscription"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("subscriptions")
        .select("*")
        .eq("user_id", user.id)
        .single();

      if (error && error.code !== "PGRST116") throw error;
      
      // If no subscription exists, create a default free one
      if (!data) {
        const { data: newSub, error: insertError } = await supabase
          .from("subscriptions")
          .insert({
            user_id: user.id,
            plan: "free",
            status: "active",
          })
          .select()
          .single();
        
        if (insertError) throw insertError;
        return newSub as Subscription;
      }

      return data as Subscription;
    },
  });

  const { data: usageCheck } = useQuery({
    queryKey: ["usage-check"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase.rpc("check_plan_limits", {
        user_uuid: user.id,
      });

      if (error) throw error;
      return data as unknown as UsageCheck;
    },
  });

  const updatePlanMutation = useMutation({
    mutationFn: async (newPlan: SubscriptionPlan) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { error } = await supabase
        .from("subscriptions")
        .update({ plan: newPlan })
        .eq("user_id", user.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["subscription"] });
      queryClient.invalidateQueries({ queryKey: ["usage-check"] });
      toast.success("Subscription plan updated successfully");
    },
    onError: (error) => {
      toast.error(`Failed to update plan: ${error.message}`);
    },
  });

  const cancelSubscriptionMutation = useMutation({
    mutationFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { error } = await supabase
        .from("subscriptions")
        .update({ 
          cancel_at_period_end: true,
          status: "canceled" 
        })
        .eq("user_id", user.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["subscription"] });
      toast.success("Subscription canceled");
    },
    onError: (error) => {
      toast.error(`Failed to cancel subscription: ${error.message}`);
    },
  });

  return {
    subscription,
    usageCheck,
    isLoading,
    updatePlan: updatePlanMutation.mutate,
    cancelSubscription: cancelSubscriptionMutation.mutate,
    isUpdating: updatePlanMutation.isPending,
  };
};
