import { StatusIndicator } from "@/components/command-center/StatusIndicator";
import { Card } from "@/components/ui/Card";
import { WORKSPACE_FIELD_LIST_CLASS, WORKSPACE_FIELD_ROW_CLASS } from "@/lib/constants";
import { BUSINESS_SNAPSHOT } from "@/lib/advisor-data";

/** Cross-domain business health at a glance. */
export function BusinessSnapshotCard() {
  return (
    <Card title="Business Snapshot">
      <ul className={WORKSPACE_FIELD_LIST_CLASS} aria-label="Business snapshot by domain">
        {BUSINESS_SNAPSHOT.map((item) => (
          <li key={item.domain} className={WORKSPACE_FIELD_ROW_CLASS}>
            <div>
              <p className="text-sm font-medium text-white/85">{item.domain}</p>
              <p className="mt-0.5 text-xs font-light text-white/45">{item.status}</p>
            </div>
            <StatusIndicator status={item.health} showLabel={false} />
          </li>
        ))}
      </ul>
    </Card>
  );
}
