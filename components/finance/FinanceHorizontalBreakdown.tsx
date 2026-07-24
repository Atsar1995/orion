import type { FinanceBreakdownItem } from "@/lib/finance-insights";
import { getBreakdownMaxValue } from "@/lib/finance-insights";
import { WORKSPACE_FIELD_ROW_CLASS } from "@/lib/constants";

type FinanceHorizontalBreakdownProps = {
  items: FinanceBreakdownItem[];
  ariaLabel: string;
};

/** Horizontal bar breakdown for expense and category analysis. */
export function FinanceHorizontalBreakdown({
  items,
  ariaLabel,
}: FinanceHorizontalBreakdownProps) {
  const maxValue = getBreakdownMaxValue(items);

  return (
    <ul className="space-y-4" aria-label={ariaLabel}>
      {items.map((item) => {
        const widthPercent = Math.round((item.value / maxValue) * 100);

        return (
          <li key={item.label} className="space-y-2">
            <div className={WORKSPACE_FIELD_ROW_CLASS}>
              <span className="text-sm font-light text-white/70">{item.label}</span>
              <span className="text-sm font-medium tabular-nums text-white/85">
                {item.displayValue}{" "}
                <span className="text-white/40">({item.share})</span>
              </span>
            </div>
            <div
              className="h-2 overflow-hidden rounded-full bg-white/[0.04]"
              role="presentation"
              aria-hidden
            >
              <div
                className="h-full rounded-full bg-gradient-to-r from-orion-gold/50 to-orion-gold/90"
                style={{ width: `${widthPercent}%` }}
              />
            </div>
          </li>
        );
      })}
    </ul>
  );
}
