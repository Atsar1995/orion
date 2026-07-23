"use client";

import type { RefObject } from "react";
import { SearchIcon } from "@/components/common/icons";
import { getCommandPaletteShortcutLabel } from "@/lib/search/search-utils";
import { cn } from "@/lib/utils";

type SearchInputProps = {
  value: string;
  onChange: (value: string) => void;
  inputRef?: RefObject<HTMLInputElement | null>;
  id?: string;
};

export function SearchInput({
  value,
  onChange,
  inputRef,
  id = "command-palette-input",
}: SearchInputProps) {
  return (
    <div className="relative border-b border-white/[0.06]">
      <SearchIcon
        className="pointer-events-none absolute top-1/2 left-4 h-4 w-4 -translate-y-1/2 text-white/30"
        aria-hidden
      />
      <input
        ref={inputRef}
        id={id}
        type="search"
        role="combobox"
        aria-autocomplete="list"
        aria-controls="command-palette-results"
        aria-expanded="true"
        autoComplete="off"
        autoCorrect="off"
        spellCheck={false}
        placeholder="Search ORION..."
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className={cn(
          "w-full bg-transparent py-4 pr-24 pl-11 text-base font-light text-white placeholder:text-white/30 outline-none",
        )}
      />
      <div className="pointer-events-none absolute top-1/2 right-4 -translate-y-1/2">
        <kbd className="rounded-orion-sm border border-white/[0.08] bg-white/[0.04] px-2 py-1 text-[10px] font-medium tracking-wide text-white/40">
          {getCommandPaletteShortcutLabel()}
        </kbd>
      </div>
    </div>
  );
}
