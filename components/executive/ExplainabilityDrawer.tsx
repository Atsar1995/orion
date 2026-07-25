"use client";

import { useState } from "react";
import type { ExecutiveExplanation } from "@/types/executive";

type ExplainabilityDrawerProps = {
  explanation: ExecutiveExplanation;
};

/** Lightweight explainability panel for executive intelligence outputs. */
export function ExplainabilityDrawer({ explanation }: ExplainabilityDrawerProps) {
  const [open, setOpen] = useState(false);

  return (
    <div className="space-y-3">
      <button
        type="button"
        className="text-xs font-medium text-orion-gold/80 transition-colors hover:text-orion-gold"
        onClick={() => setOpen((value) => !value)}
      >
        {open ? "Hide explanation" : explanation.title}
      </button>

      {open ? (
        <div
          role="region"
          aria-label={explanation.title}
          className="rounded-orion-md border border-orion-border bg-orion-surface p-4"
        >
          <p className="text-sm font-light leading-relaxed text-orion-muted">
            {explanation.summary}
          </p>
          {explanation.factors.length > 0 ? (
            <ul className="mt-3 space-y-2">
              {explanation.factors.map((factor) => (
                <li key={factor} className="flex items-start gap-2 text-sm font-light text-orion-text/80">
                  <span aria-hidden className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-orion-gold/70" />
                  <span>{factor}</span>
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
