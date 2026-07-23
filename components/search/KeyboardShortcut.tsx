"use client";

import { getCommandPaletteShortcutLabel } from "@/lib/search/search-utils";
import { cn } from "@/lib/utils";

type KeyboardShortcutProps = {
  className?: string;
};

export function KeyboardShortcut({ className }: KeyboardShortcutProps) {
  const label = getCommandPaletteShortcutLabel();
  const [modifier, key] = label.split(" ");

  return (
    <kbd
      className={cn(
        "hidden items-center gap-1 rounded-orion-sm border border-white/[0.08] bg-white/[0.04] px-2 py-1 text-[10px] font-medium tracking-wide text-white/40 sm:inline-flex",
        className,
      )}
      aria-hidden
    >
      <span>{modifier}</span>
      <span>{key}</span>
    </kbd>
  );
}
