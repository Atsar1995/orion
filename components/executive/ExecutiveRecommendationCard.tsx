"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ConfidenceIndicator } from "@/components/executive/ConfidenceIndicator";
import { EvidenceList } from "@/components/executive/EvidenceList";
import { ExecutiveActionBar } from "@/components/executive/ExecutiveActionBar";
import { ExplainabilityDrawer } from "@/components/executive/ExplainabilityDrawer";
import { Badge } from "@/components/common/Badge";
import { useDecisionActions } from "@/hooks/useDecisionActions";
import type { ExecutiveRecommendation } from "@/types/executive";
import { cn } from "@/lib/utils";

type ExecutiveRecommendationCardProps = {
  recommendation: ExecutiveRecommendation;
  featured?: boolean;
  compact?: boolean;
  className?: string;
};

/** EC-003 recommendation card with evidence, impact, and quick actions. */
export function ExecutiveRecommendationCard({
  recommendation,
  featured = false,
  compact = false,
  className,
}: ExecutiveRecommendationCardProps) {
  const router = useRouter();
  const { loading, error, recordRecommendationAction } = useDecisionActions();
  const [showExplain, setShowExplain] = useState(false);
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  const explanation = {
    question: "why-this-recommendation" as const,
    title: "Why am I seeing this?",
    summary: recommendation.description,
    factors: recommendation.evidence.map(
      (item) => `${item.source}: ${item.label}${item.value ? ` · ${item.value}` : ""}`,
    ),
  };

  async function handleAction(action: ExecutiveRecommendation["actions"][number]) {
    if (action === "explain") {
      setShowExplain((value) => !value);
      return;
    }

    const decision = await recordRecommendationAction(recommendation, action);

    if (!decision) {
      return;
    }

    const labels = {
      act: "Accepted",
      delegate: "Delegated",
      defer: "Deferred",
      snooze: "Deferred",
      reject: "Rejected",
      complete: "Completed",
    } as const;

    if (action in labels) {
      setActionMessage(`${labels[action as keyof typeof labels]} — decision recorded.`);
    }

    if (action === "act" && recommendation.href) {
      router.push(recommendation.href);
    }
  }

  return (
    <article
      aria-label={`Recommendation: ${recommendation.title}`}
      className={cn(
        "flex h-full flex-col rounded-orion-lg border p-[var(--orion-space-4)] shadow-[var(--orion-shadow-md)]",
        featured
          ? "border-orion-gold/20 bg-gradient-to-br from-orion-gold/[0.08] via-orion-surface to-transparent"
          : "border-orion-border bg-orion-surface",
        className,
      )}
    >
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <Badge className="normal-case tracking-normal">{recommendation.priorityLabel}</Badge>
        <ConfidenceIndicator confidence={recommendation.confidence} showLabel={false} />
      </div>

      <h3 className="text-base font-medium tracking-tight text-orion-text">
        {recommendation.title}
      </h3>
      <p className="mt-2 text-sm font-light leading-relaxed text-orion-muted">
        {recommendation.description}
      </p>

      {!compact || featured ? (
        <div className="mt-4 space-y-3">
          <div>
            <p className="text-[10px] font-medium tracking-wide text-orion-muted uppercase">Impact</p>
            <p className="mt-1 text-sm font-light text-orion-text/85">{recommendation.impact}</p>
          </div>

          {recommendation.businessValue ? (
            <div>
              <p className="text-[10px] font-medium tracking-wide text-orion-muted uppercase">
                Business Value
              </p>
              <p className="mt-1 text-sm font-light text-orion-text/85">
                {recommendation.businessValue}
              </p>
            </div>
          ) : null}

          {recommendation.riskLevel ? (
            <div>
              <p className="text-[10px] font-medium tracking-wide text-orion-muted uppercase">Risk</p>
              <p className="mt-1 text-sm font-light capitalize text-orion-text/85">
                {recommendation.riskLevel}
              </p>
            </div>
          ) : null}

          {recommendation.expectedOutcome ? (
            <div>
              <p className="text-[10px] font-medium tracking-wide text-orion-muted uppercase">
                Expected Outcome
              </p>
              <p className="mt-1 text-sm font-light text-orion-text/85">
                {recommendation.expectedOutcome}
              </p>
            </div>
          ) : null}

          {featured ? (
            <div>
              <p className="mb-2 text-[10px] font-medium tracking-wide text-orion-muted uppercase">
                Evidence
              </p>
              <EvidenceList evidence={recommendation.evidence} />
            </div>
          ) : null}

          {recommendation.alternativeActions && recommendation.alternativeActions.length > 0 ? (
            <div>
              <p className="text-[10px] font-medium tracking-wide text-orion-muted uppercase">
                Alternative Actions
              </p>
              <ul className="mt-1 space-y-1 text-xs font-light text-orion-muted">
                {recommendation.alternativeActions.map((item) => (
                  <li key={item}>· {item}</li>
                ))}
              </ul>
            </div>
          ) : null}
        </div>
      ) : null}

      {compact && !featured ? (
        <div className="mt-3">
          <ExplainabilityDrawer
            explanation={{
              ...explanation,
              title: "Why this matters",
            }}
          />
        </div>
      ) : null}

      {showExplain ? (
        <div className="mt-4">
          <ExplainabilityDrawer explanation={explanation} defaultOpen />
        </div>
      ) : null}

      <div className="mt-auto border-t border-orion-border pt-4">
        {actionMessage ? (
          <p className="mb-3 text-xs font-light text-orion-gold/90" role="status">
            {actionMessage}
          </p>
        ) : null}
        {error ? (
          <p className="mb-3 text-xs font-light text-orion-danger" role="alert">
            {error}
          </p>
        ) : null}
        <ExecutiveActionBar
          actions={recommendation.actions}
          actionHref={loading ? undefined : recommendation.href}
          onAction={(action) => void handleAction(action)}
        />
        {recommendation.href ? (
          <Link
            href={recommendation.href}
            className="mt-3 inline-block text-xs font-medium text-orion-gold/80 hover:text-orion-gold"
          >
            View in workspace →
          </Link>
        ) : null}
      </div>
    </article>
  );
}
