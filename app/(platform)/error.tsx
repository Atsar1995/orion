"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { observabilityStore } from "@/lib/observability";
import { WORKSPACE_PAGE_CLASS } from "@/lib/constants";

type PlatformErrorProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

/** EP-001 platform route error boundary. */
export default function PlatformError({ error, reset }: PlatformErrorProps) {
  useEffect(() => {
    observabilityStore.reportError({
      message: error.message,
      digest: error.digest,
      route: "platform",
      stack: error.stack,
    });
  }, [error]);

  return (
    <div className={WORKSPACE_PAGE_CLASS}>
      <EmptyState
        title="Executive platform unavailable"
        description={
          error.message || "ORION could not load this executive surface. Try again in a moment."
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
