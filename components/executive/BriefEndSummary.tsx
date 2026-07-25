import Link from "next/link";
import { QUICK_ACTION_BUTTON_CLASSNAME } from "@/lib/constants";
import type { BriefEndSummary } from "@/types/executive";
import { cn } from "@/lib/utils";

type BriefEndSummaryProps = {
  summary: BriefEndSummary;
};

/** End-of-brief closure — condition, priority, and first action. */
export function BriefEndSummary({ summary }: BriefEndSummaryProps) {
  return (
    <section
      aria-label="Brief complete"
      className="rounded-orion-lg border border-white/[0.06] bg-white/[0.02] px-5 py-4"
    >
      <p className="text-[11px] font-medium tracking-[0.14em] text-orion-gold/80 uppercase">
        Brief Complete
      </p>
      <dl className="mt-3 grid grid-cols-1 gap-3 text-sm sm:grid-cols-3">
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
      <div className="mt-4">
        <Link
          href="/command-center"
          className={cn(QUICK_ACTION_BUTTON_CLASSNAME, "inline-flex rounded-orion-md px-4 py-2")}
        >
          Start your day → Command Center
        </Link>
      </div>
    </section>
  );
}
