import { Card } from "@/components/ui/Card";

const RECENT_SPECIFICATIONS = [
  { id: "ES-011A", title: "Platform Services – Phase A" },
  { id: "ES-011B", title: "Platform Services – Phase B" },
  { id: "ES-012", title: "Engineering Workspace" },
] as const;

/** Placeholder list of recent engineering specifications. */
export function RecentSpecificationsCard() {
  return (
    <Card title="Recent Engineering Specifications">
      <ul className="space-y-3">
        {RECENT_SPECIFICATIONS.map((spec) => (
          <li
            key={spec.id}
            className="flex items-start justify-between gap-4 border-b border-white/[0.04] pb-3 last:border-b-0 last:pb-0"
          >
            <div>
              <p className="text-sm font-medium text-white/80">{spec.id}</p>
              <p className="mt-0.5 text-xs font-light text-white/45">
                {spec.title}
              </p>
            </div>
            <span className="shrink-0 text-[10px] font-medium tracking-wider text-white/30 uppercase">
              Complete
            </span>
          </li>
        ))}
      </ul>
    </Card>
  );
}
