"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { ExecutiveRecommendationCard } from "@/components/executive/ExecutiveRecommendationCard";
import {
  BRIEF_PAGE_ROOT_ID,
  ORION_EXECUTIVE_KICKER_CLASS,
  ORION_FOCUS_RING_CLASS,
} from "@/lib/constants";
import { cn } from "@/lib/utils";
import type { ExecutiveRecommendation } from "@/types/executive";

type BriefMobilePinnedRecommendationProps = {
  recommendation: ExecutiveRecommendation;
  children: ReactNode;
};

/** Mobile-only pinned featured recommendation with dismiss (P5.1B). */
export function BriefMobilePinnedRecommendation({
  recommendation,
  children,
}: BriefMobilePinnedRecommendationProps) {
  const [dismissed, setDismissed] = useState(false);
  const pinnedActive = !dismissed;
  const pinnedStickyRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!pinnedActive) {
      return;
    }

    const briefRoot = document.getElementById(BRIEF_PAGE_ROOT_ID);
    const pinnedEl = pinnedStickyRef.current;
    if (!briefRoot || !pinnedEl) {
      return;
    }

    briefRoot.setAttribute("data-brief-pinned-rec", "true");

    function syncPinnedHeight() {
      if (!briefRoot || !pinnedEl) {
        return;
      }

      briefRoot.style.setProperty(
        "--orion-brief-mobile-pinned-rec-height",
        `${pinnedEl.offsetHeight}px`,
      );
    }

    syncPinnedHeight();

    const observer =
      typeof ResizeObserver === "function" ? new ResizeObserver(syncPinnedHeight) : null;
    observer?.observe(pinnedEl);

    return () => {
      observer?.disconnect();
      briefRoot.removeAttribute("data-brief-pinned-rec");
      briefRoot.style.setProperty("--orion-brief-mobile-pinned-rec-height", "0px");
    };
  }, [pinnedActive]);

  function handleDismiss() {
    setDismissed(true);
    requestAnimationFrame(() => {
      document.getElementById("brief-top-rec-heading")?.focus({ preventScroll: true });
    });
  }

  return (
    <>
      {pinnedActive ? (
        <div
          ref={pinnedStickyRef}
          className={cn(
            "sticky z-[8] border-b border-orion-gold/20 bg-orion-navy/95 p-3 backdrop-blur-md md:hidden",
            "top-[calc(var(--orion-executive-header-height)+var(--orion-brief-quick-nav-height)+var(--orion-brief-mobile-health-mini-bar-height))]",
          )}
        >
          <div className="mb-2 flex items-center justify-between gap-2">
            <p className={ORION_EXECUTIVE_KICKER_CLASS}>Top Recommendation</p>
            <button
              type="button"
              aria-label="Dismiss pinned recommendation"
              onClick={handleDismiss}
              className={cn(
                "inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-orion-md border border-orion-border bg-orion-surface/60 text-lg leading-none text-orion-muted transition-colors hover:text-orion-text",
                ORION_FOCUS_RING_CLASS,
              )}
            >
              <span aria-hidden="true">×</span>
            </button>
          </div>
          <ExecutiveRecommendationCard recommendation={recommendation} featured compact />
        </div>
      ) : null}
      <div className={cn(pinnedActive && "hidden md:block")}>{children}</div>
    </>
  );
}
