"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  GLOBAL_EXECUTIVE_SHORTCUTS,
  isEditableTarget,
  matchesShortcutChord,
} from "@/lib/executive/keyboard-shortcuts";
import { useCommandPalette } from "@/components/layout/CommandPaletteProvider";

/** Global executive keyboard shortcuts — palette, brief, command center. */
export function ExecutiveKeyboardShortcuts() {
  const router = useRouter();
  const { openPalette } = useCommandPalette();

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (isEditableTarget(event.target)) {
        return;
      }

      for (const shortcut of GLOBAL_EXECUTIVE_SHORTCUTS) {
        if (!matchesShortcutChord(event, shortcut.keys)) {
          continue;
        }

        event.preventDefault();

        if (shortcut.action === "open-palette") {
          openPalette();
          return;
        }

        if (shortcut.href) {
          router.push(shortcut.href);
          return;
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [openPalette, router]);

  return null;
}
