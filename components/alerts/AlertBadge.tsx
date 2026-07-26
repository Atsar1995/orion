import type { AlertSeverity } from "@/lib/alerts/models/AlertSeverity";
import { formatAlertSeverity } from "@/lib/alerts/models/AlertSeverity";
import { cn } from "@/lib/utils";

type AlertBadgeProps = {
  severity: AlertSeverity;
  count?: number;
  className?: string;
};

const SEVERITY_CLASS: Record<AlertSeverity, string> = {
  critical: "border-red-400/30 bg-red-500/10 text-red-200",
  high: "border-amber-400/30 bg-amber-500/10 text-amber-200",
  medium: "border-yellow-400/30 bg-yellow-500/10 text-yellow-100",
  low: "border-white/15 bg-white/[0.04] text-white/70",
  information: "border-sky-400/30 bg-sky-500/10 text-sky-100",
};

/** Severity badge for executive alert center surfaces. */
export function AlertBadge({ severity, count, className }: AlertBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[10px] font-medium tracking-wide uppercase",
        SEVERITY_CLASS[severity],
        className,
      )}
    >
      {formatAlertSeverity(severity)}
      {typeof count === "number" ? <span aria-hidden>· {count}</span> : null}
    </span>
  );
}
