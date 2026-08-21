import { StatusIndicator } from "@/components/command-center/StatusIndicator";
import {
  WORKSPACE_CAPTION_CLASS,
} from "@/lib/constants";
import { cn } from "@/lib/utils";
import type { BriefBusinessHealth } from "@/types/executive";

type BriefMobileHealthMiniBarProps = {
  health: BriefBusinessHealth;
};

/** Mobile-only sticky business health summary for Executive Brief (P5.1A). */
export function BriefMobileHealthMiniBar({ health }: BriefMobileHealthMiniBarProps) {
  const trendClass =
    health.trendDirection === "up"
      ? "text-orion-success"
      : health.trendDirection === "down"
        ? "text-red-300"
        : "text-orion-muted";

  return (
    <div
      aria-label="Business health summary"
      className={cn(
        "sticky z-[9] min-h-[var(--orion-brief-mobile-health-mini-bar-height)] border-b border-orion-border/60 bg-orion-navy/90 px-3 py-2 backdrop-blur-md md:hidden",
        "top-[calc(var(--orion-executive-header-height)+var(--orion-brief-quick-nav-height))]",
      )}
    >
      <div className="flex items-center justify-between gap-3">
        <p className={WORKSPACE_CAPTION_CLASS}>Business Health</p>
        <div className="flex flex-wrap items-center justify-end gap-x-3 gap-y-1">
          <span className="text-lg font-semibold tracking-tight text-orion-text">
            {health.score}
            <span className="text-sm font-light text-orion-muted"> / {health.maxScore}</span>
          </span>
          <StatusIndicator status={health.status} />
          {health.trend ? (
            <span className={cn("text-xs font-medium", trendClass)}>{health.trend}</span>
          ) : null}
        </div>
      </div>
      <p className="sr-only">
        Business health score {health.score} of {health.maxScore}, status {health.status}
        {health.trend ? `, trend ${health.trend}` : ""}
      </p>
    </div>
  );
}
