import type { IntegrationSyncEvent } from "@/lib/integrations/types";
import { cn } from "@/lib/utils";
import { formatIntegrationTimestamp } from "@/components/integrations/ProviderStatusCard";

type SyncHistoryProps = {
  events: IntegrationSyncEvent[];
  providerId?: string;
  className?: string;
  limit?: number;
};

/** Recent sync and connection activity for providers. */
export function SyncHistory({ events, providerId, className, limit = 6 }: SyncHistoryProps) {
  const filtered = providerId
    ? events.filter((event) => event.providerId === providerId)
    : events;

  const visible = filtered.slice(0, limit);

  if (visible.length === 0) {
    return (
      <p className={cn("text-sm font-light text-white/45", className)}>
        No sync activity recorded yet.
      </p>
    );
  }

  return (
    <ul className={cn("space-y-2", className)}>
      {visible.map((event) => (
        <li
          key={event.id}
          className="rounded-orion-md border border-white/[0.05] bg-white/[0.02] px-3 py-2.5"
        >
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 space-y-1">
              <p className="truncate text-sm font-medium text-white/80">
                {event.providerName} · {event.action}
              </p>
              <p className="text-xs font-light text-white/45">{event.message}</p>
            </div>
            <span
              className={cn(
                "shrink-0 text-[10px] font-medium tracking-wide uppercase",
                event.success ? "text-emerald-300" : "text-red-300",
              )}
            >
              {event.success ? "OK" : "Failed"}
            </span>
          </div>
          <p className="mt-2 text-[11px] text-white/30">
            {formatIntegrationTimestamp(event.timestamp)}
          </p>
        </li>
      ))}
    </ul>
  );
}
