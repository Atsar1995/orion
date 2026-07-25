import { StatusIndicator } from "@/components/command-center/StatusIndicator";
import type { HealthSnapshot } from "@/types/executive";
import { cn } from "@/lib/utils";

type BusinessHealthCardProps = {
  health: HealthSnapshot;
  className?: string;
};

/** EC-001 / EC-002 business health card with score, domains, and trend. */
export function BusinessHealthCard({ health, className }: BusinessHealthCardProps) {
  const trendClass =
    health.trendDirection === "up"
      ? "text-orion-success"
      : health.trendDirection === "down"
        ? "text-red-300"
        : "text-orion-muted";

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
          Business Health
        </p>
        {health.explanationAvailable ? (
          <button
            type="button"
            className="text-xs font-medium text-orion-gold/80 transition-colors hover:text-orion-gold"
          >
            Why this score?
          </button>
        ) : null}
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

      {health.domains.length > 0 ? (
        <ul className="mt-[var(--orion-space-4)] grid grid-cols-1 gap-2 border-t border-orion-border pt-[var(--orion-space-3)] sm:grid-cols-2">
          {health.domains.map((domain) => (
            <li
              key={domain.id}
              className="flex items-center justify-between gap-3 rounded-orion-md border border-orion-border bg-orion-surface px-3 py-2"
            >
              <div className="min-w-0">
                <p className="text-sm font-medium text-orion-text/85">{domain.label}</p>
                <p className="truncate text-xs font-light text-orion-muted">{domain.summary}</p>
              </div>
              <StatusIndicator status={domain.status} showLabel={false} />
            </li>
          ))}
        </ul>
      ) : null}
    </article>
  );
}
