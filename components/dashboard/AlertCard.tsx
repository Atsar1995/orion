import { StatusIndicator } from "@/components/command-center/StatusIndicator";
import type { Alert } from "@/types/intelligence";
import { cn } from "@/lib/utils";

type AlertCardProps = {
  alert: Alert;
  className?: string;
};

const CATEGORY_LABEL: Record<NonNullable<Alert["category"]>, string> = {
  risk: "Risk",
  "follow-up": "Follow-up",
  opportunity: "Opportunity",
  operational: "Operational",
};

/** Single business alert — maps to Alert Engine output (ES-030). */
export function AlertCard({ alert, className }: AlertCardProps) {
  return (
    <article
      className={cn(
        "flex items-start gap-[var(--orion-space-3)] rounded-orion-md border border-orion-border bg-orion-surface p-[var(--orion-space-3)] transition-colors duration-[var(--orion-duration-normal)] hover:border-orion-gold/15 hover:bg-white/[0.04]",
        className,
      )}
    >
      <StatusIndicator status={alert.severity} showLabel={false} />
      <div className="min-w-0 flex-1">
        {alert.category ? (
          <p className="text-[10px] font-medium tracking-wide text-orion-muted uppercase">
            {CATEGORY_LABEL[alert.category]}
          </p>
        ) : null}
        <p className="mt-1 text-sm font-light leading-[var(--orion-leading-relaxed)] text-orion-text/85">
          {alert.message}
        </p>
      </div>
    </article>
  );
}
