import { Badge } from "@/components/common/Badge";
import { Card } from "@/components/ui/Card";

const PLATFORM_HEALTH = [
  { label: "Repository", value: "Healthy" },
  { label: "GitHub", value: "Synchronized" },
  { label: "Working Tree", value: "Clean" },
  { label: "Branch", value: "main" },
] as const;

/** Static platform health summary for the Command Center. */
export function PlatformHealthCard() {
  return (
    <Card title="Platform Health">
      <ul className="space-y-3">
        {PLATFORM_HEALTH.map((item) => (
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
