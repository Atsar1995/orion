"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { observabilityStore } from "@/lib/observability";
import { WORKSPACE_PAGE_CLASS } from "@/lib/constants";

type GlobalErrorProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

/** Root application error boundary with observability hooks (Mission S1D). */
export default function GlobalError({ error, reset }: GlobalErrorProps) {
  useEffect(() => {
    observabilityStore.reportError({
      message: error.message,
      digest: error.digest,
      route: "global",
      stack: error.stack,
    });
  }, [error]);

  return (
    <html lang="en">
      <body className="min-h-screen bg-orion-navy font-sans text-white">
        <div className={`${WORKSPACE_PAGE_CLASS} flex min-h-screen items-center justify-center px-4`}>
          <EmptyState
            title="ORION encountered an unexpected error"
            description="The platform could not complete this request. You can retry or return to sign in."
            action={
              <div className="flex flex-wrap gap-3">
                <Button type="button" onClick={reset}>
                  Retry
                </Button>
                <Button type="button" onClick={() => (window.location.href = "/brief")}>
                  Go to Morning Brief
                </Button>
              </div>
            }
          />
        </div>
      </body>
    </html>
  );
}
