"use client";

import { SearchIcon } from "@/components/common/icons";
import { useCommandPalette } from "@/components/layout/CommandPaletteProvider";
import { KeyboardShortcut } from "@/components/search/KeyboardShortcut";
import { cn } from "@/lib/utils";

type CommandPaletteTriggerProps = {
  className?: string;
};

export function CommandPaletteTrigger({ className }: CommandPaletteTriggerProps) {
  const { openPalette } = useCommandPalette();

  return (
    <button
      type="button"
      onClick={openPalette}
      className={cn(
        "relative flex w-full items-center rounded-orion-md border border-white/[0.08] bg-white/[0.04] py-2.5 pr-4 pl-10 text-left text-sm font-light text-white/30 transition-colors duration-[var(--orion-duration-normal)] hover:border-orion-gold/25 hover:bg-white/[0.06] hover:text-white/50",
        className,
      )}
      aria-label="Open command palette"
    >
      <SearchIcon
        className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-white/30"
        aria-hidden
      />
      <span className="truncate">Search ORION...</span>
      <span className="ml-auto pl-3">
        <KeyboardShortcut />
      </span>
    </button>
  );
}
