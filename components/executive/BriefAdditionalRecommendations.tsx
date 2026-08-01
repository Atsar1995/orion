"use client";

import { useState } from "react";
import { BriefSection } from "@/components/executive/BriefSection";
import { ExecutiveRecommendationCard } from "@/components/executive/ExecutiveRecommendationCard";
import {
  getExecutivePreferences,
  setExecutivePreferences,
} from "@/lib/executive/personalization";
import type { ExecutiveRecommendation } from "@/types/executive";

const VISIBLE_COUNT = 2;

type BriefAdditionalRecommendationsProps = {
  recommendations: ExecutiveRecommendation[];
};

/** Secondary recommendations — capped with progressive disclosure (EC-001). */
export function BriefAdditionalRecommendations({
  recommendations,
}: BriefAdditionalRecommendationsProps) {
  const [expanded, setExpanded] = useState(
    () => getExecutivePreferences().briefSecondaryExpanded,
  );

  if (recommendations.length === 0) {
    return null;
  }

  const visible = expanded ? recommendations : recommendations.slice(0, VISIBLE_COUNT);
  const hiddenCount = recommendations.length - VISIBLE_COUNT;

  function toggleExpanded() {
    const next = !expanded;
    setExpanded(next);
    setExecutivePreferences({ briefSecondaryExpanded: next });
  }

  return (
    <BriefSection
      id="brief-secondary-recs-heading"
      title="Can Wait"
      subtitle="Secondary recommendations — review when priorities are handled"
    >
      <ul className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {visible.map((recommendation) => (
          <li key={recommendation.id}>
            <ExecutiveRecommendationCard recommendation={recommendation} compact />
          </li>
        ))}
      </ul>

      {hiddenCount > 0 ? (
        <button
          type="button"
          aria-expanded={expanded}
          className="mt-3 text-xs font-medium text-orion-gold/80 transition-colors hover:text-orion-gold focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orion-gold/50"
          onClick={toggleExpanded}
        >
          {expanded
            ? "Show fewer recommendations"
            : `Show ${hiddenCount} more recommendation${hiddenCount === 1 ? "" : "s"}`}
        </button>
      ) : null}
    </BriefSection>
  );
}
