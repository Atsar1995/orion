"use client";

import type { DataFreshness, DataStatus } from "@/lib/data/types";
import { cn } from "@/lib/utils";

type DataFreshnessIndicatorProps = {
  freshness: DataFreshness;
  status?: DataStatus;
  className?: string;
};

/** Shows last-updated time and freshness state for executive data surfaces (Mission S1C). */
export function DataFreshnessIndicator({
  freshness,
  status = "ready",
  className,
}: DataFreshnessIndicatorProps) {
  const updatedLabel = new Date(freshness.lastUpdatedAt).toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
  });

  const tone =
    status === "error"
      ? "text-orion-danger/90"
      : freshness.isStale || status === "stale"
        ? "text-amber-200/90"
        : "text-orion-muted";

  return (
    <p className={cn("text-xs font-light", tone, className)} role="status" aria-live="polite">
      {status === "error"
        ? "Data unavailable"
        : freshness.isStale
          ? "Data may be stale"
          : "Live data"}
      <span aria-hidden> · </span>
      Updated {updatedLabel}
      {freshness.sourceCount > 0 ? (
        <>
          <span aria-hidden> · </span>
          {freshness.sourceCount} source{freshness.sourceCount === 1 ? "" : "s"}
        </>
      ) : null}
    </p>
  );
}
