"use client";

import { useCallback, useState } from "react";
import type { ExecutiveRecommendation, ExecutiveRecommendationAction } from "@/types/executive";
import type { ExecutiveDecision } from "@/types/decisions";

type UseDecisionActionsResult = {
  loading: boolean;
  error: string | null;
  lastDecision: ExecutiveDecision | null;
  recordRecommendationAction: (
    recommendation: ExecutiveRecommendation,
    action: ExecutiveRecommendationAction,
  ) => Promise<ExecutiveDecision | null>;
};

/** Client hook for Executive Decision Intelligence actions (Mission S1B+). */
export function useDecisionActions(): UseDecisionActionsResult {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastDecision, setLastDecision] = useState<ExecutiveDecision | null>(null);

  const recordRecommendationAction = useCallback(
    async (recommendation: ExecutiveRecommendation, action: ExecutiveRecommendationAction) => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch("/api/decisions/recommendations/action", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ recommendation, action }),
        });

        const payload = (await response.json()) as {
          success: boolean;
          data?: { decision: ExecutiveDecision | null };
          error?: { message?: string };
        };

        if (!response.ok || !payload.success) {
          setError(payload.error?.message ?? "Decision action failed.");
          return null;
        }

        const decision = payload.data?.decision ?? null;
        setLastDecision(decision);
        return decision;
      } catch {
        setError("Decision action failed.");
        return null;
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  return { loading, error, lastDecision, recordRecommendationAction };
}
