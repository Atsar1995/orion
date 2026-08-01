"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { StatusIndicator } from "@/components/command-center/StatusIndicator";
import { ExplainabilityDrawer } from "@/components/executive/ExplainabilityDrawer";
import type { HealthSnapshot } from "@/types/executive";
import { cn } from "@/lib/utils";

type BusinessHealthCardProps = {
  health: HealthSnapshot;
  className?: string;
};

function isHealthyDomain(status: HealthSnapshot["domains"][number]["status"]): boolean {
  return status === "healthy";
}

/** EC-001 / EC-002 business health card with score, domains, and trend. */
export function BusinessHealthCard({ health, className }: BusinessHealthCardProps) {
  const [showHealthyDomains, setShowHealthyDomains] = useState(false);

  const { attentionDomains, healthyDomains } = useMemo(() => {
    const attention = health.domains.filter((domain) => !isHealthyDomain(domain.status));
    const healthy = health.domains.filter((domain) => isHealthyDomain(domain.status));

    return { attentionDomains: attention, healthyDomains: healthy };
  }, [health.domains]);

  const visibleDomains = showHealthyDomains
    ? health.domains
    : attentionDomains.length > 0
      ? attentionDomains
      : health.domains.slice(0, 2);

  const trendClass =
    health.trendDirection === "up"
      ? "text-orion-success"
      : health.trendDirection === "down"
        ? "text-red-300"
        : "text-orion-muted";

  const explanation = {
    question: "why-this-score" as const,
    title: "Why this score?",
    summary: health.summary,
    factors: health.domains.map((domain) => `${domain.label}: ${domain.summary}`),
  };

  return (
    <article
      aria-label="Business health"
      className={cn(
        "flex h-full flex-col rounded-orion-lg border border-orion-gold/15 bg-gradient-to-br from-orion-gold/[0.08] via-orion-surface to-transparent p-[var(--orion-space-4)] shadow-[var(--orion-shadow-md)]",
        className,
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <p className="text-[length:var(--orion-text-caption-md)] font-medium tracking-[var(--orion-tracking-wide)] text-orion-muted uppercase">
          What Happened · Business Health
        </p>
      </div>

      <div className="mt-[var(--orion-space-3)] flex items-end gap-[var(--orion-space-2)]">
        <p className="text-4xl font-semibold tracking-[var(--orion-tracking-tight)] text-orion-text">
          {health.score}
        </p>
        <p className="pb-1 text-lg font-light text-orion-muted">/ {health.maxScore}</p>
        {health.trend ? (
          <p className={cn("pb-1 text-sm font-medium", trendClass)}>{health.trend}</p>
        ) : null}
      </div>

      <div className="mt-[var(--orion-space-2)]">
        <StatusIndicator status={health.status} />
      </div>

      <p className="mt-[var(--orion-space-3)] text-sm font-light leading-[var(--orion-leading-relaxed)] text-orion-muted">
        {health.summary}
      </p>

      {health.explanationAvailable ? (
        <div className="mt-[var(--orion-space-3)]">
          <ExplainabilityDrawer explanation={explanation} />
        </div>
      ) : null}

      {health.domains.length > 0 ? (
        <div className="mt-[var(--orion-space-4)] border-t border-orion-border pt-[var(--orion-space-3)]">
          <ul className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            {visibleDomains.map((domain) => (
              <li
                key={domain.id}
                className="flex items-center justify-between gap-3 rounded-orion-md border border-orion-border bg-orion-surface px-3 py-2"
              >
                <div className="min-w-0">
                  {domain.href ? (
                    <Link href={domain.href} className="hover:text-orion-gold">
                      <p className="text-sm font-medium text-orion-text/85">{domain.label}</p>
                    </Link>
                  ) : (
                    <p className="text-sm font-medium text-orion-text/85">{domain.label}</p>
                  )}
                  <p className="truncate text-xs font-light text-orion-muted">{domain.summary}</p>
                </div>
                <StatusIndicator status={domain.status} showLabel={false} />
              </li>
            ))}
          </ul>

          {healthyDomains.length > 0 && attentionDomains.length > 0 ? (
            <button
              type="button"
              aria-expanded={showHealthyDomains}
              className="mt-3 text-xs font-medium text-orion-gold/80 transition-colors hover:text-orion-gold focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orion-gold/50"
              onClick={() => setShowHealthyDomains((value) => !value)}
            >
              {showHealthyDomains
                ? "Hide healthy domains"
                : `Show ${healthyDomains.length} healthy domain${healthyDomains.length === 1 ? "" : "s"}`}
            </button>
          ) : null}
        </div>
      ) : null}
    </article>
  );
}
