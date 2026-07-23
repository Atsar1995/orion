import { Card } from "@/components/ui/Card";
import { WORKSPACE_FIELD_LIST_CLASS, WORKSPACE_FIELD_ROW_CLASS } from "@/lib/constants";
import { CRITICAL_RISKS, RISK_LEVEL_LABELS } from "@/lib/advisor-data";
import { cn } from "@/lib/utils";

const RISK_LEVEL_CLASS: Record<(typeof CRITICAL_RISKS)[number]["level"], string> = {
  high: "text-red-400/90",
  medium: "text-amber-400/90",
  low: "text-white/55",
};

/** Critical business risks with severity indicators. */
export function RisksCard() {
  return (
    <Card title="Critical Risks">
      <ul className={WORKSPACE_FIELD_LIST_CLASS} aria-label="Critical risks">
        {CRITICAL_RISKS.map((item) => (
          <li key={item.message} className={WORKSPACE_FIELD_ROW_CLASS}>
            <p className="text-sm font-light leading-relaxed text-white/60">
              {item.message}
            </p>
            <span
              className={cn(
                "shrink-0 text-xs font-medium tracking-wide uppercase",
                RISK_LEVEL_CLASS[item.level],
              )}
            >
              {RISK_LEVEL_LABELS[item.level]}
            </span>
          </li>
        ))}
      </ul>
    </Card>
  );
}
