import type { HealthStatus } from "@/lib/command-center-data";
import { cn } from "@/lib/utils";

const STATUS_LABELS: Record<HealthStatus, string> = {
  healthy: "Healthy",
  attention: "Attention",
  critical: "Critical",
};

const STATUS_DOT: Record<HealthStatus, string> = {
  healthy: "bg-emerald-400",
  attention: "bg-amber-400",
  critical: "bg-red-400",
};

type StatusIndicatorProps = {
  status: HealthStatus;
  showLabel?: boolean;
};

/** Compact green / amber / red status indicator for executive scanning. */
export function StatusIndicator({ status, showLabel = true }: StatusIndicatorProps) {
  return (
    <span className="inline-flex items-center gap-2">
      <span
        aria-hidden
        className={cn("h-2 w-2 shrink-0 rounded-full", STATUS_DOT[status])}
      />
      {showLabel ? (
        <span className="text-xs font-medium text-white/55">
          {STATUS_LABELS[status]}
        </span>
      ) : null}
    </span>
  );
}
