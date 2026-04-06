import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

export type PlanTier = "free" | "founder" | "pro" | "lifetime";

export function usePlanTier() {
  const { user } = useAuth();
  const [tier, setTier] = useState<PlanTier>("free");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setTier("free");
      setLoading(false);
      return;
    }

    const fetch = async () => {
      const { data } = await supabase
        .from("profiles")
        .select("plan_tier, plan_expires_at")
        .eq("user_id", user.id)
        .single();

      if (data) {
        // Check if founder pass has expired
        if (data.plan_tier === "founder" && data.plan_expires_at) {
          const expires = new Date(data.plan_expires_at);
          if (expires < new Date()) {
            setTier("free");
            setLoading(false);
            return;
          }
        }
        setTier((data.plan_tier as PlanTier) || "free");
      }
      setLoading(false);
    };

    fetch();
  }, [user]);

  const isPaid = tier !== "free";
  const isLifetime = tier === "lifetime";

  return { tier, loading, isPaid, isLifetime };
}
