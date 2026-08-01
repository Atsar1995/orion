"use client";

import { useId, useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";

type BriefDisclosureProps = {
  summary: string;
  hideSummary?: string;
  children: ReactNode;
  defaultOpen?: boolean;
  className?: string;
};

/** Progressive disclosure control for EC-001 brief sections — keyboard accessible. */
export function BriefDisclosure({
  summary,
  hideSummary = "Show less",
  children,
  defaultOpen = false,
  className,
}: BriefDisclosureProps) {
  const [open, setOpen] = useState(defaultOpen);
  const panelId = useId();

  return (
    <div className={className}>
      <button
        type="button"
        aria-expanded={open}
        aria-controls={panelId}
        className="text-xs font-medium text-orion-gold/80 transition-colors hover:text-orion-gold focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orion-gold/50"
        onClick={() => setOpen((value) => !value)}
      >
        {open ? hideSummary : summary}
      </button>

      {open ? (
        <div id={panelId} role="region" className="mt-3">
          {children}
        </div>
      ) : null}
    </div>
  );
}

type BriefDisclosurePanelProps = {
  title: string;
  subtitle?: string;
  children: ReactNode;
  defaultOpen?: boolean;
  className?: string;
  id?: string;
};

/** Collapsible brief section with heading — collapsed by default for secondary content. */
export function BriefDisclosurePanel({
  title,
  subtitle,
  children,
  defaultOpen = false,
  className,
  id,
}: BriefDisclosurePanelProps) {
  const [open, setOpen] = useState(defaultOpen);
  const panelId = useId();
  const headingId = id ?? `${title}-heading`;

  return (
    <section
      aria-labelledby={headingId}
      className={cn("rounded-orion-lg border border-orion-border bg-orion-surface/40", className)}
    >
      <button
        type="button"
        aria-expanded={open}
        aria-controls={panelId}
        className="flex w-full items-start justify-between gap-3 px-4 py-3 text-left focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-orion-gold/50"
        onClick={() => setOpen((value) => !value)}
      >
        <div>
          <h2
            id={headingId}
            className="text-[11px] font-medium tracking-[0.14em] text-orion-gold/80 uppercase"
          >
            {title}
          </h2>
          {subtitle ? (
            <p className="mt-1 text-sm font-light text-orion-muted">{subtitle}</p>
          ) : null}
        </div>
        <span aria-hidden className="shrink-0 text-xs text-orion-muted">
          {open ? "−" : "+"}
        </span>
      </button>

      {open ? (
        <div id={panelId} role="region" aria-labelledby={headingId} className="border-t border-orion-border px-4 py-4">
          {children}
        </div>
      ) : null}
    </section>
  );
}
