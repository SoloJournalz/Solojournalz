"use client";

import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { PLANS, PlanKey, isPlanKey } from "@/lib/plans";

type TradePlanState = {
  plan: PlanKey | null;
  loading: boolean;
  error: string | null;
  hasPlan: boolean;
  isFree: boolean;
  isExpert: boolean;
  limits: typeof PLANS[PlanKey] | null;
  refresh: () => Promise<void>;
};

export function useTradePlan(): TradePlanState {
  const [plan, setPlan] = useState<PlanKey | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError) throw userError;

      if (!user) {
        setPlan(null);
        return;
      }

      const { data, error: planError } = await supabase
        .from("user_plans")
        .select("plan")
        .eq("user_id", user.id)
        .maybeSingle();

      if (planError) throw planError;

      if (!data) {
        setPlan(null);
        return;
      }

      setPlan(isPlanKey(data.plan) ? data.plan : "FREE");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Could not load plan.";
      setError(message);
      setPlan(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return {
    plan,
    loading,
    error,
    hasPlan: plan !== null,
    isFree: plan === "FREE",
    isExpert: plan === "EXPERT",
    limits: plan ? PLANS[plan] : null,
    refresh,
  };
}
