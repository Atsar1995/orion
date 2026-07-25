"use client";

import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { WORKSPACE_PAGE_CLASS } from "@/lib/constants";

type BriefErrorProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

/** Error boundary for EC-001 Morning Executive Brief. */
export default function MorningExecutiveBriefError({ error, reset }: BriefErrorProps) {
  return (
    <div className={WORKSPACE_PAGE_CLASS}>
      <EmptyState
        title="Morning Brief unavailable"
        description={
          error.message ||
          "ORION could not load your Morning Executive Brief. Try again in a moment."
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
