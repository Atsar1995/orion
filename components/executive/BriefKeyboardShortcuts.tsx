"use client";

import { useEffect } from "react";
import {
  BRIEF_SECTION_SHORTCUTS,
  isEditableTarget,
} from "@/lib/executive/keyboard-shortcuts";

type BriefKeyboardShortcutsProps = {
  featuredActionHref?: string;
};

/** In-page keyboard shortcuts for the Morning Executive Brief. */
export function BriefKeyboardShortcuts({ featuredActionHref }: BriefKeyboardShortcutsProps) {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (isEditableTarget(event.target)) {
        return;
      }

      if (event.metaKey || event.ctrlKey || event.altKey) {
        return;
      }

      const section = BRIEF_SECTION_SHORTCUTS.find((entry) => entry.key === event.key);

      if (section) {
        event.preventDefault();
        const target = document.getElementById(section.sectionId);
        target?.scrollIntoView({ behavior: "smooth", block: "start" });
        return;
      }

      if (event.key.toLowerCase() === "a" && featuredActionHref) {
        event.preventDefault();
        const actLink = document.querySelector<HTMLAnchorElement>(
          `[data-brief-act-href="${featuredActionHref}"]`,
        );
        actLink?.click();
        return;
      }

      if (event.key.toLowerCase() === "e") {
        const explainButton = document.querySelector<HTMLButtonElement>(
          '[aria-label="Why am I seeing this?"]',
        );
        explainButton?.click();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [featuredActionHref]);

  return null;
}
