import Link from "next/link";
import { BriefSection } from "@/components/executive/BriefSection";
import type { ExecutiveMemoryItem } from "@/types/executive";

type ExecutiveMemorySectionProps = {
  items: readonly ExecutiveMemoryItem[];
};

const TYPE_LABELS: Record<ExecutiveMemoryItem["type"], string> = {
  decision: "Recent decision",
  lesson: "Lesson learned",
  context: "Historical context",
  pattern: "Pattern",
};

/** Executive memory — decisions, lessons, and patterns (Mission P-002). */
export function ExecutiveMemorySection({ items }: ExecutiveMemorySectionProps) {
  return (
    <BriefSection
      id="brief-memory"
      title="Executive Memory"
      subtitle="Recent decisions, lessons learned, and organizational patterns"
    >
      <ul className="space-y-3">
        {items.map((item) => (
          <li
            key={item.id}
            className="rounded-orion-md border border-orion-border/60 px-3 py-3"
          >
            <p className="text-[10px] font-medium tracking-wide text-orion-gold/70 uppercase">
              {TYPE_LABELS[item.type]}
            </p>
            <p className="mt-1 text-sm font-medium text-orion-text">{item.title}</p>
            <p className="mt-1 text-xs font-light leading-relaxed text-orion-muted">
              {item.detail}
            </p>
            {item.href ? (
              <Link
                href={item.href}
                className="mt-2 inline-block text-[11px] font-medium text-orion-gold/80 hover:text-orion-gold"
              >
                View context →
              </Link>
            ) : null}
          </li>
        ))}
      </ul>
    </BriefSection>
  );
}
