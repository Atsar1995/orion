import { StatusIndicator } from "@/components/command-center/StatusIndicator";
import { Card } from "@/components/ui/Card";
import { WORKSPACE_FIELD_LIST_CLASS, WORKSPACE_FIELD_ROW_CLASS } from "@/lib/constants";
import { CRITICAL_RISKS } from "@/lib/advisor-data";

/** Critical business risks requiring founder attention. */
export function CriticalRisks() {
  return (
    <Card title="Critical Risks">
      <ul className={WORKSPACE_FIELD_LIST_CLASS}>
        {CRITICAL_RISKS.map((item) => (
          <li key={item.risk} className={WORKSPACE_FIELD_ROW_CLASS}>
            <p className="text-sm font-light leading-relaxed text-white/60">{item.risk}</p>
            <StatusIndicator status={item.severity} />
          </li>
        ))}
      </ul>
    </Card>
  );
}
