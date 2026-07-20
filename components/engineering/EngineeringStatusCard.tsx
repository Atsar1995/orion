import { Badge } from "@/components/common/Badge";
import { Card } from "@/components/ui/Card";

const ENGINEERING_STATUS = [
  { label: "Build Status", value: "🟢 Passing" },
  { label: "Repository Health", value: "🟢 Healthy" },
  { label: "GitHub Sync", value: "🟢 Synchronized" },
  { label: "Working Tree", value: "🟢 Clean" },
] as const;

/** Static engineering status summary for the Engineering Workspace. */
export function EngineeringStatusCard() {
  return (
    <Card title="Engineering Status">
      <ul className="space-y-3">
        {ENGINEERING_STATUS.map((item) => (
          <li
            key={item.label}
            className="flex items-center justify-between gap-4 border-b border-white/[0.04] pb-3 last:border-b-0 last:pb-0"
          >
            <span className="text-sm font-light text-white/55">{item.label}</span>
            <Badge className="normal-case tracking-normal">{item.value}</Badge>
          </li>
        ))}
      </ul>
    </Card>
  );
}
