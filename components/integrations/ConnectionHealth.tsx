import type { ProviderHealth } from "@/types/providers";
import { cn } from "@/lib/utils";

type ConnectionHealthProps = {
  health: ProviderHealth;
  className?: string;
};

const HEALTH_DOT_CLASS: Record<ProviderHealth["status"], string> = {
  connected: "bg-emerald-400",
  disconnected: "bg-white/30",
  syncing: "bg-orion-gold",
  error: "bg-red-400",
};

/** Visual health indicator with last-checked timestamp. */
export function ConnectionHealth({ health, className }: ConnectionHealthProps) {
  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex items-center gap-2">
        <span
          aria-hidden
          className={cn("h-2 w-2 rounded-full", HEALTH_DOT_CLASS[health.status])}
        />
        <p className="text-sm font-medium text-white/80">
          {health.healthy ? "Healthy" : "Unhealthy"}
        </p>
      </div>
      <p className="text-xs leading-relaxed font-light text-white/45">
        {health.message ?? "No health message available."}
      </p>
      <p className="text-[11px] text-white/30">
        Last checked {new Date(health.lastCheckedAt).toLocaleString("en-IN")}
      </p>
    </div>
  );
}
