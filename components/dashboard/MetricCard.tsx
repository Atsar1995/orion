import { cn } from "@/lib/utils";

type MetricTrend = "up" | "down" | "neutral";

type MetricCardProps = {
  label: string;
  value: string;
  change?: string;
  trend?: MetricTrend;
  workspace?: string;
  className?: string;
};

const TREND_CLASS: Record<MetricTrend, string> = {
  up: "text-orion-success",
  down: "text-orion-danger",
  neutral: "text-orion-muted",
};

/** KPI metric widget for the Executive Dashboard grid. */
export function MetricCard({
  label,
  value,
  change,
  trend = "neutral",
  workspace,
  className,
}: MetricCardProps) {
  return (
    <article
      className={cn(
        "flex h-full flex-col rounded-orion-md border border-orion-border bg-orion-surface p-[var(--orion-space-3)] shadow-[var(--orion-shadow-sm)] transition-all duration-[var(--orion-duration-normal)] hover:border-orion-gold/20 hover:bg-white/[0.04]",
        className,
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <p className="text-[length:var(--orion-text-caption-md)] font-medium tracking-[var(--orion-tracking-wide)] text-orion-muted uppercase">
          {label}
        </p>
        {workspace ? (
          <span className="text-[10px] font-medium tracking-wide text-orion-gold/80 uppercase">
            {workspace}
          </span>
        ) : null}
      </div>
      <p className="mt-[var(--orion-space-2)] text-[length:var(--orion-text-heading-lg)] font-semibold tracking-[var(--orion-tracking-tight)] text-orion-text">
        {value}
      </p>
      {change ? (
        <p className={cn("mt-1 text-sm font-light", TREND_CLASS[trend])}>{change}</p>
      ) : null}
    </article>
  );
}
