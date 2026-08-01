"use client";

import { cn } from "@/lib/utils";
import { ORION_FOCUS_RING_CLASS } from "@/lib/constants";

const NAV_ITEMS = [
  { id: "brief-overview", label: "Overview" },
  { id: "brief-attention", label: "Priorities" },
  { id: "brief-decisions-block", label: "Decisions" },
  { id: "brief-intelligence", label: "Intelligence" },
  { id: "brief-context", label: "Summary" },
] as const;

/** In-page jump navigation for Executive Brief v1.0 (Mission P-002). */
export function BriefQuickNav({ className }: { className?: string }) {
  return (
    <nav
      aria-label="Brief sections"
      className={cn(
        "sticky top-[var(--orion-z-header)] z-10 -mx-1 border-b border-orion-border/60 bg-orion-navy/80 px-1 py-2 backdrop-blur-md",
        className,
      )}
    >
      <p className="sr-only">Jump to a section of your executive brief</p>
      <ul className="flex gap-2 overflow-x-auto pb-0.5">
        {NAV_ITEMS.map((item) => (
          <li key={item.id} className="shrink-0">
            <a
              href={`#${item.id}`}
              className={cn(
                "inline-flex rounded-orion-md border border-orion-border bg-orion-surface/80 px-3 py-1.5 text-xs font-medium text-orion-muted transition-colors duration-[var(--orion-duration-normal)] hover:border-orion-gold/25 hover:text-orion-gold",
                ORION_FOCUS_RING_CLASS,
              )}
            >
              {item.label}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
