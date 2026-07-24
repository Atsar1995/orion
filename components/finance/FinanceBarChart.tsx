import type { FinanceChartPoint } from "@/lib/finance-insights";
import { getChartMaxValue } from "@/lib/finance-insights";

type FinanceBarChartProps = {
  data: FinanceChartPoint[];
  ariaLabel: string;
};

/** Accessible CSS bar chart for finance trend data — no external chart library. */
export function FinanceBarChart({ data, ariaLabel }: FinanceBarChartProps) {
  const maxValue = getChartMaxValue(data);

  return (
    <div role="img" aria-label={ariaLabel}>
      <ul className="flex h-44 items-end gap-2 sm:gap-3">
        {data.map((point) => {
          const heightPercent = Math.round((point.value / maxValue) * 100);

          return (
            <li
              key={point.label}
              className="flex min-w-0 flex-1 flex-col items-center gap-2"
            >
              <span className="text-[10px] font-medium tabular-nums text-white/50 sm:text-xs">
                {point.displayValue}
              </span>
              <div
                className="flex w-full flex-1 items-end"
                aria-hidden
              >
                <div
                  className="w-full rounded-t-orion-sm bg-gradient-to-t from-orion-gold/40 to-orion-gold/80 transition-all"
                  style={{ height: `${heightPercent}%` }}
                />
              </div>
              <span className="text-[10px] font-light text-white/40 sm:text-xs">
                {point.label}
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
