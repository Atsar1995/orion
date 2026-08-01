import { ORION_FOCUS_RING_CLASS } from "@/lib/constants";
import { cn } from "@/lib/utils";

/** WCAG skip navigation link for keyboard users (Mission S1D). */
export function SkipToContent() {
  return (
    <a
      href="#main-content"
      className={cn(
        "sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[9999]",
        "rounded-orion-md bg-orion-gold px-4 py-2 text-sm font-medium text-orion-navy",
        ORION_FOCUS_RING_CLASS,
      )}
    >
      Skip to main content
    </a>
  );
}
