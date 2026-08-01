"use client";

import { useState, type ReactNode } from "react";
import { ORION_FOCUS_RING_CLASS } from "@/lib/constants";
import { cn } from "@/lib/utils";

type CollapsibleSectionProps = {
  title: string;
  subtitle?: string;
  defaultOpen?: boolean;
  children: ReactNode;
  className?: string;
};

/** Progressive disclosure wrapper for executive panels. */
export function CollapsibleSection({
  title,
  subtitle,
  defaultOpen = false,
  children,
  className,
}: CollapsibleSectionProps) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <section className={cn("rounded-orion-lg border border-orion-border bg-orion-surface/30", className)}>
      <button
        type="button"
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
        className={cn(
          "flex w-full items-start justify-between gap-3 px-5 py-4 text-left",
          ORION_FOCUS_RING_CLASS,
        )}
      >
        <div>
          <h2 className="text-sm font-medium text-orion-text">{title}</h2>
          {subtitle ? (
            <p className="mt-1 text-xs font-light text-orion-muted">{subtitle}</p>
          ) : null}
        </div>
        <span className="shrink-0 text-xs font-medium text-orion-gold/80">
          {open ? "Hide" : "Show"}
        </span>
      </button>
      {open ? <div className="border-t border-orion-border px-5 py-4">{children}</div> : null}
    </section>
  );
}
