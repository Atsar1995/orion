import { Card } from "@/components/ui/Card";
import { StatusIndicator } from "@/components/command-center/StatusIndicator";
import { CRITICAL_ATTENTION } from "@/lib/command-center-data";
import { WORKSPACE_FIELD_LIST_CLASS, WORKSPACE_FIELD_ROW_CLASS } from "@/lib/constants";

/** Items requiring founder attention with visual priority indicators. */
export function CriticalAttentionCard() {
  return (
    <Card title="Critical Attention">
      <ul className={WORKSPACE_FIELD_LIST_CLASS}>
        {CRITICAL_ATTENTION.map((item) => (
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
