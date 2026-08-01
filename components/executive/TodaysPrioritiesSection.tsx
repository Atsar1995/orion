import Link from "next/link";
import { EmptyState } from "@/components/ui/EmptyState";
import type { BriefPriority } from "@/types/executive";
import { BriefSection } from "@/components/executive/BriefSection";
import { WORKSPACE_LIST_CLASS } from "@/lib/constants";

type TodaysPrioritiesSectionProps = {
  priorities: BriefPriority[];
};

/** Ranked executive priorities — max 3 visible for 60-second scan. */
export function TodaysPrioritiesSection({ priorities }: TodaysPrioritiesSectionProps) {
  const visiblePriorities = priorities.slice(0, 3);

  return (
    <BriefSection title="Today's Priorities" subtitle="Your first three actions for today">
      {visiblePriorities.length > 0 ? (
        <ol className={WORKSPACE_LIST_CLASS}>
          {visiblePriorities.map((priority) => (
            <li
              key={priority.id}
              className="flex items-start gap-3 text-sm font-light leading-relaxed text-orion-muted"
            >
              <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-orion-gold/25 bg-orion-gold/10 text-[10px] font-medium text-orion-gold">
                {priority.rank}
              </span>
              <span className="text-orion-text/85">
                {priority.href ? (
                  <Link href={priority.href} className="hover:text-orion-gold">
                    {priority.title}
                  </Link>
                ) : (
                  priority.title
                )}
              </span>
            </li>
          ))}
        </ol>
      ) : (
        <EmptyState
          title="No priorities queued"
          description="ORION will surface ranked priorities when new signals arrive."
        />
      )}
    </BriefSection>
  );
}
