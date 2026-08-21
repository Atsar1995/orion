"use client";

import { ORION_FOCUS_RING_CLASS } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

type BriefSkipToRecommendationProps = {
  href: string;
};

/** Brief skip link portaled after platform SkipToContent for correct keyboard tab order. */
export function BriefSkipToRecommendation({ href }: BriefSkipToRecommendationProps) {
  const [mountNode, setMountNode] = useState<HTMLElement | null>(null);

  useEffect(() => {
    const platformSkip = document.querySelector<HTMLAnchorElement>('a[href="#main-content"]');
    if (!platformSkip) return;

    const host = document.createElement("div");
    platformSkip.insertAdjacentElement("afterend", host);

    let cancelled = false;
    const frameId = requestAnimationFrame(() => {
      if (!cancelled) setMountNode(host);
    });

    return () => {
      cancelled = true;
      cancelAnimationFrame(frameId);
      host.remove();
      setMountNode(null);
    };
  }, []);

  if (!mountNode) return null;

  return createPortal(
    <a
      href={href}
      className={cn(
        "sr-only focus:not-sr-only focus:fixed focus:top-16 focus:left-4 focus:z-[9999]",
        "rounded-orion-md bg-orion-gold px-4 py-2 text-sm font-medium text-orion-navy",
        ORION_FOCUS_RING_CLASS,
      )}
    >
      Skip to top recommendation
    </a>,
    mountNode,
  );
}
