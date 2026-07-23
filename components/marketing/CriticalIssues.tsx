import { StatusIndicator } from "@/components/command-center/StatusIndicator";
import { Card } from "@/components/ui/Card";
import { WORKSPACE_FIELD_LIST_CLASS, WORKSPACE_FIELD_ROW_CLASS } from "@/lib/constants";
import { CRITICAL_ISSUES } from "@/lib/marketing-data";

/** Marketing issues requiring founder attention. */
export function CriticalIssues() {
  return (
    <Card title="Critical Issues">
      <ul className={WORKSPACE_FIELD_LIST_CLASS}>
        {CRITICAL_ISSUES.map((item) => (
          <li key={item.message} className={WORKSPACE_FIELD_ROW_CLASS}>
            <p className="text-sm font-light leading-relaxed text-white/60">
              {item.message}
            </p>
            <StatusIndicator status={item.status} />
          </li>
        ))}
      </ul>
    </Card>
  );
}
