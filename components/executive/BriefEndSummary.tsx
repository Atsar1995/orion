import Link from "next/link";
import {
  ORION_EXECUTIVE_KICKER_CLASS,
  ORION_FOCUS_RING_CLASS,
  ORION_SECONDARY_LINK_CLASS,
  QUICK_ACTION_BUTTON_CLASSNAME,
} from "@/lib/constants";
import type { BriefEndSummary } from "@/types/executive";
import { cn } from "@/lib/utils";

type BriefEndSummaryProps = {
  summary: BriefEndSummary;
};

/** End-of-brief closure — confident orientation before the working day begins. */
export function BriefEndSummary({ summary }: BriefEndSummaryProps) {
  return (
    <section
      aria-label="Brief complete"
      className="rounded-orion-lg border border-orion-border bg-orion-surface/40 px-5 py-4"
    >
      <p className={ORION_EXECUTIVE_KICKER_CLASS}>You&apos;re Oriented</p>
      <p className="mt-2 text-sm font-light text-orion-muted">
        Your priorities are clear. Proceed with confidence.
      </p>
      <dl className="mt-4 grid grid-cols-1 gap-3 text-sm sm:grid-cols-3">
        <div>
          <dt className="text-orion-muted">Condition</dt>
          <dd className="mt-1 font-medium text-orion-text">{summary.condition}</dd>
        </div>
        <div>
          <dt className="text-orion-muted">Priority</dt>
          <dd className="mt-1 font-medium text-orion-text">{summary.priority}</dd>
        </div>
        <div>
          <dt className="text-orion-muted">First action</dt>
          <dd className="mt-1 font-medium text-orion-text">{summary.firstAction}</dd>
        </div>
      </dl>
      <div className="mt-5 flex flex-wrap items-center gap-3">
        <Link
          href="/command-center"
          className={cn(
            QUICK_ACTION_BUTTON_CLASSNAME,
            "inline-flex rounded-orion-md px-4 py-2 transition-colors duration-[var(--orion-duration-normal)]",
            ORION_FOCUS_RING_CLASS,
          )}
        >
          Enter Command Center
        </Link>
        <Link href="/crm" className={cn(ORION_SECONDARY_LINK_CLASS, ORION_FOCUS_RING_CLASS)}>
          Open CRM workspace →
        </Link>
      </div>
    </section>
  );
}
