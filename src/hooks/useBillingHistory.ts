import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface BillingRecord {
  id: string;
  user_id: string;
  subscription_id?: string;
  amount: number;
  currency: string;
  status: string;
  invoice_date: string;
  stripe_invoice_id?: string;
  description?: string;
  created_at: string;
}

export const useBillingHistory = () => {
  const { data: billingHistory, isLoading } = useQuery({
    queryKey: ["billing-history"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("billing_history")
        .select("*")
        .eq("user_id", user.id)
        .order("invoice_date", { ascending: false });

      if (error) throw error;
      return data as BillingRecord[];
    },
  });

  return {
    billingHistory,
    isLoading,
  };
};
