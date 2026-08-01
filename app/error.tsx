"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { observabilityStore } from "@/lib/observability";
import { WORKSPACE_PAGE_CLASS } from "@/lib/constants";

type RootErrorProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

/** Application-level error recovery boundary (Mission S1D). */
export default function RootError({ error, reset }: RootErrorProps) {
  useEffect(() => {
    observabilityStore.reportError({
      message: error.message,
      digest: error.digest,
      route: "root",
      stack: error.stack,
    });
  }, [error]);

  return (
    <div className={`${WORKSPACE_PAGE_CLASS} flex min-h-[50vh] items-center justify-center`}>
      <EmptyState
        title="Something went wrong"
        description={error.message || "ORION could not load this page."}
        action={
          <Button type="button" onClick={reset}>
            Try again
          </Button>
        }
      />
    </div>
  );
}
