"use client";

import { useState } from "react";
import {
  getExecutivePreferences,
  setExecutivePreferences,
  type ExecutiveFocus,
} from "@/lib/executive/personalization";
import { ORION_FOCUS_RING_CLASS, WORKSPACE_CAPTION_CLASS } from "@/lib/constants";
import { cn } from "@/lib/utils";

const FOCUS_OPTIONS: { value: ExecutiveFocus; label: string }[] = [
  { value: "general", label: "General" },
  { value: "sales", label: "Sales" },
  { value: "finance", label: "Finance" },
  { value: "operations", label: "Operations" },
];

/** Compact executive focus selector — personalizes palette favourites. */
export function ExecutiveFocusSelector({ className }: { className?: string }) {
  const [focus, setFocus] = useState<ExecutiveFocus>(
    () => getExecutivePreferences().focus,
  );

  function handleChange(next: ExecutiveFocus) {
    setFocus(next);
    setExecutivePreferences({ focus: next });
  }

  return (
    <div className={cn("space-y-2", className)}>
      <p className={WORKSPACE_CAPTION_CLASS}>Executive focus</p>
      <div className="flex flex-wrap gap-2">
        {FOCUS_OPTIONS.map((option) => (
          <button
            key={option.value}
            type="button"
            aria-pressed={focus === option.value}
            onClick={() => handleChange(option.value)}
            className={cn(
              "rounded-orion-md border px-3 py-1.5 text-xs font-medium transition-colors",
              ORION_FOCUS_RING_CLASS,
              focus === option.value
                ? "border-orion-gold/30 bg-orion-gold/10 text-orion-gold"
                : "border-orion-border bg-orion-surface/60 text-orion-muted hover:border-orion-gold/20 hover:text-orion-text",
            )}
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  );
}
