import Link from "next/link";
import type { OvernightChange } from "@/types/executive";
import { BriefSection } from "@/components/executive/BriefSection";
import { cn } from "@/lib/utils";

type OvernightChangesStripProps = {
  changes: OvernightChange[];
};

const DIRECTION_CLASS: Record<OvernightChange["direction"], string> = {
  up: "border-emerald-400/20 text-emerald-200",
  down: "border-red-400/20 text-red-200",
  neutral: "border-orion-border text-orion-muted",
};

/** Material overnight deltas surfaced above recommendations. */
export function OvernightChangesStrip({ changes }: OvernightChangesStripProps) {
  if (changes.length === 0) {
    return null;
  }

  return (
    <BriefSection
      title="Overnight Changes"
      subtitle={`${changes.length} material delta${changes.length === 1 ? "" : "s"}`}
    >
      <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {changes.map((change) => {
          const content = (
            <>
              <p className="text-[10px] font-medium tracking-wide uppercase opacity-70">
                {change.label}
              </p>
              <p className="mt-1 text-lg font-medium tracking-tight">{change.value}</p>
            </>
          );

          return (
            <li
              key={change.id}
              className={cn(
                "rounded-orion-md border bg-orion-surface px-4 py-3",
                DIRECTION_CLASS[change.direction],
              )}
            >
              {change.href ? (
                <Link href={change.href} className="block transition-opacity hover:opacity-90">
                  {content}
                </Link>
              ) : (
                content
              )}
            </li>
          );
        })}
      </ul>
    </BriefSection>
  );
}
