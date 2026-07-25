import { StatusIndicator } from "@/components/command-center/StatusIndicator";
import type { BusinessHealth } from "@/types/intelligence";
import { cn } from "@/lib/utils";

type HealthScoreProps = {
  health: BusinessHealth;
  className?: string;
};

/** Executive platform health score with trend, status, and driver breakdown. */
export function HealthScore({ health, className }: HealthScoreProps) {
  return (
    <article
      className={cn(
        "flex h-full flex-col rounded-orion-lg border border-orion-gold/15 bg-gradient-to-br from-orion-gold/[0.08] via-orion-surface to-transparent p-[var(--orion-space-4)] shadow-[var(--orion-shadow-md)]",
        className,
      )}
    >
      <p className="text-[length:var(--orion-text-caption-md)] font-medium tracking-[var(--orion-tracking-wide)] text-orion-muted uppercase">
        Executive Score
      </p>
      <div className="mt-[var(--orion-space-3)] flex items-end gap-[var(--orion-space-2)]">
        <p className="text-4xl font-semibold tracking-[var(--orion-tracking-tight)] text-orion-text">
          {health.score}
        </p>
        <p className="pb-1 text-lg font-light text-orion-muted">/ {health.maxScore}</p>
        {health.trend ? (
          <p className="pb-1 text-sm font-medium text-orion-success">{health.trend}</p>
        ) : null}
      </div>
      <div className="mt-[var(--orion-space-2)]">
        <StatusIndicator status={health.status} />
      </div>
      <p className="mt-[var(--orion-space-3)] text-sm font-light leading-[var(--orion-leading-relaxed)] text-orion-muted">
        {health.summary}
      </p>
      {health.drivers.length > 0 ? (
        <ul className="mt-[var(--orion-space-4)] space-y-[var(--orion-space-2)] border-t border-orion-border pt-[var(--orion-space-3)]">
          {health.drivers.map((driver) => (
            <li
              key={driver.label}
              className="flex items-center justify-between gap-[var(--orion-space-2)]"
            >
              <span className="text-sm font-light text-orion-text/80">{driver.label}</span>
              <StatusIndicator status={driver.status} showLabel={false} />
            </li>
          ))}
        </ul>
      ) : null}
    </article>
  );
}
