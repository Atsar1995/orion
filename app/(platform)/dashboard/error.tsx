"use client";

import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { WORKSPACE_PAGE_CLASS } from "@/lib/constants";

type ExecutiveDashboardErrorProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

/** Error boundary for EP-002 Executive Dashboard. */
export default function ExecutiveDashboardError({ error, reset }: ExecutiveDashboardErrorProps) {
  return (
    <div className={WORKSPACE_PAGE_CLASS}>
      <EmptyState
        title="Executive Dashboard unavailable"
        description={
          error.message ||
          "ORION could not load the Executive Dashboard. Try again in a moment."
        }
        action={
          <Button type="button" onClick={reset}>
            Retry
          </Button>
        }
      />
    </div>
  );
}
