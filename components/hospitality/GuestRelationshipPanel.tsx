import type { GuestRelationship } from "@/types/hospitality-guest";
import { WORKSPACE_FIELD_LIST_CLASS } from "@/lib/constants";

type GuestRelationshipPanelProps = {
  readonly relationships: readonly GuestRelationship[];
};

const TYPE_LABELS: Record<string, string> = {
  family: "Family",
  companion: "Companion",
  corporate: "Corporate",
  travel_agent: "Travel Agent",
  membership: "Membership",
  referral: "Referral",
};

/** Guest relationship network (Mission P-007.3). */
export function GuestRelationshipPanel({ relationships }: GuestRelationshipPanelProps) {
  if (relationships.length === 0) {
    return <p className="text-sm text-white/50">No relationships recorded.</p>;
  }

  return (
    <ul className={WORKSPACE_FIELD_LIST_CLASS} aria-label="Guest relationships">
      {relationships.map((rel) => (
        <li key={rel.id} className="border-b border-white/[0.04] pb-3 last:border-b-0">
          <p className="text-sm font-medium text-white/90">{rel.relatedName}</p>
          <p className="text-xs text-white/50">
            {TYPE_LABELS[rel.type] ?? rel.type}
            {rel.company ? ` · ${rel.company}` : ""}
            {rel.role ? ` · ${rel.role}` : ""}
          </p>
        </li>
      ))}
    </ul>
  );
}
