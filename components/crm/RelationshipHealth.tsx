import { StatusIndicator } from "@/components/command-center/StatusIndicator";
import { Card } from "@/components/ui/Card";
import { WORKSPACE_FIELD_ROW_CLASS } from "@/lib/constants";
import { RELATIONSHIP_HEALTH } from "@/lib/crm-insights";

/** Relationship health segments across the customer base. */
export function RelationshipHealth() {
  return (
    <Card title="Relationship Health">
      <ul className="space-y-4" aria-label="Relationship health segments">
        {RELATIONSHIP_HEALTH.map((segment) => (
          <li key={segment.label} className={WORKSPACE_FIELD_ROW_CLASS}>
            <div className="flex items-center gap-3">
              <StatusIndicator status={segment.status} />
              <div>
                <p className="text-sm font-light text-white/70">{segment.label}</p>
                <p className="text-xs font-light text-white/40">{segment.share} of base</p>
              </div>
            </div>
            <span className="text-sm font-medium tabular-nums text-white/85">
              {segment.displayValue}
            </span>
          </li>
        ))}
      </ul>
    </Card>
  );
}
