import { AlertBadge } from "@/components/alerts/AlertBadge";
import type { ExecutiveAlert } from "@/lib/alerts/models/Alert";
import { formatAlertCategory } from "@/lib/alerts/models/AlertCategory";
import { formatAlertSource } from "@/lib/alerts/models/AlertSource";
import { formatAlertStatus } from "@/lib/alerts/models/AlertStatus";
import { cn } from "@/lib/utils";

type AlertCardProps = {
  alert: ExecutiveAlert;
  className?: string;
};

/** Single executive alert card for the notification center. */
export function AlertCard({ alert, className }: AlertCardProps) {
  return (
    <article
      className={cn(
        "rounded-orion-md border border-white/[0.08] bg-white/[0.02] px-4 py-3",
        className,
      )}
    >
      <div className="flex flex-wrap items-center gap-2">
        <AlertBadge severity={alert.severity} />
        <span className="text-[10px] font-medium tracking-wide text-white/45 uppercase">
          {formatAlertCategory(alert.category)}
        </span>
        <span className="text-[10px] font-medium tracking-wide text-white/35 uppercase">
          {formatAlertStatus(alert.status)}
        </span>
      </div>
      <h3 className="mt-2 text-sm font-medium text-white/90">{alert.title}</h3>
      <p className="mt-1 text-sm font-light leading-relaxed text-white/70">{alert.message}</p>
      <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-white/45">
        <span>{alert.workspace}</span>
        <span>{formatAlertSource(alert.source)}</span>
      </div>
    </article>
  );
}
