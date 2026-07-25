import type { ConfidenceScore } from "@/types/executive";
import { cn } from "@/lib/utils";

type ConfidenceIndicatorProps = {
  confidence: ConfidenceScore;
  className?: string;
  showLabel?: boolean;
};

const LABEL_COPY: Record<ConfidenceScore["label"], string> = {
  high: "High confidence",
  medium: "Medium confidence",
  low: "Low confidence",
};

const LABEL_CLASS: Record<ConfidenceScore["label"], string> = {
  high: "text-emerald-300",
  medium: "text-amber-300",
  low: "text-red-300",
};

/** Compact confidence indicator for executive intelligence outputs. */
export function ConfidenceIndicator({
  confidence,
  className,
  showLabel = true,
}: ConfidenceIndicatorProps) {
  return (
    <span
      className={cn("inline-flex items-center gap-2 text-xs font-medium", className)}
      aria-label={`Confidence ${confidence.value} percent, ${LABEL_COPY[confidence.label]}`}
    >
      <span
        aria-hidden
        className={cn(
          "inline-flex h-5 min-w-5 items-center justify-center rounded-full border border-white/10 bg-white/[0.04] px-1.5",
          LABEL_CLASS[confidence.label],
        )}
      >
        {confidence.value}%
      </span>
      {showLabel ? (
        <span className={cn("font-light text-orion-muted", LABEL_CLASS[confidence.label])}>
          {LABEL_COPY[confidence.label]}
        </span>
      ) : null}
    </span>
  );
}
