"use client";

import { useEffect, useState } from "react";
import { ConfidenceIndicator } from "@/components/executive/ConfidenceIndicator";
import type { AiExecutiveSummary } from "@/types/executive";
import { WORKSPACE_SUMMARY_CLASS } from "@/lib/constants";

type AiExecutiveSummaryProps = {
  summary: AiExecutiveSummary;
};

/** AI-generated executive synthesis — collapsed on mobile, expanded on tablet+. */
export function AiExecutiveSummaryCard({ summary }: AiExecutiveSummaryProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    if (typeof window.matchMedia !== "function") {
      return;
    }

    const media = window.matchMedia("(max-width: 767px)");

    function sync() {
      setIsMobile(media.matches);
    }

    sync();
    media.addEventListener("change", sync);

    return () => media.removeEventListener("change", sync);
  }, []);

  const open = isMobile ? mobileOpen : true;

  return (
    <section
      aria-labelledby="ai-summary-heading"
      className="rounded-orion-lg border border-orion-gold/15 bg-gradient-to-br from-orion-gold/[0.06] via-orion-surface to-transparent shadow-[var(--orion-shadow-md)]"
    >
      {isMobile ? (
        <button
          type="button"
          aria-expanded={open}
          aria-controls="ai-summary-panel"
          className="flex w-full items-start justify-between gap-3 px-4 py-3 text-left focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-orion-gold/50"
          onClick={() => setMobileOpen((value) => !value)}
        >
          <div>
            <h2
              id="ai-summary-heading"
              className="text-[11px] font-medium tracking-[0.14em] text-orion-gold/80 uppercase"
            >
              AI Executive Summary
            </h2>
            {!open ? (
              <p className="mt-1 line-clamp-2 text-sm font-light text-orion-muted">
                {summary.narrative}
              </p>
            ) : null}
          </div>
          <span aria-hidden className="shrink-0 text-xs text-orion-muted">
            {open ? "−" : "+"}
          </span>
        </button>
      ) : (
        <div className="px-4 py-3">
          <h2
            id="ai-summary-heading"
            className="text-[11px] font-medium tracking-[0.14em] text-orion-gold/80 uppercase"
          >
            AI Executive Summary
          </h2>
        </div>
      )}

      {open ? (
        <div
          id="ai-summary-panel"
          role="region"
          aria-labelledby="ai-summary-heading"
          className="border-t border-orion-border px-4 py-4 md:border-t-0 md:pt-0"
        >
          <blockquote className={WORKSPACE_SUMMARY_CLASS}>{summary.narrative}</blockquote>

          <div className="mt-5 flex flex-col gap-3 border-t border-orion-border pt-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-[10px] font-medium tracking-wide text-orion-muted uppercase">
                Sources
              </p>
              <p className="mt-1 text-sm font-light text-orion-muted">
                {summary.sources.join(" · ")}
              </p>
            </div>
            <ConfidenceIndicator confidence={summary.confidence} />
          </div>
        </div>
      ) : null}
    </section>
  );
}
