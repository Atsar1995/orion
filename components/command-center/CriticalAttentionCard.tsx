import { Card } from "@/components/ui/Card";
import { StatusIndicator } from "@/components/command-center/StatusIndicator";
import { CRITICAL_ATTENTION } from "@/lib/command-center-data";

/** Items requiring founder attention with visual priority indicators. */
export function CriticalAttentionCard() {
  return (
    <Card title="Critical Attention">
      <ul className="space-y-3">
        {CRITICAL_ATTENTION.map((item) => (
          <li
            key={item.message}
            className="flex items-start justify-between gap-4 border-b border-white/[0.04] pb-3 last:border-b-0 last:pb-0"
          >
            <p className="text-sm font-light leading-relaxed text-white/65">
              {item.message}
            </p>
            <StatusIndicator status={item.status} />
          </li>
        ))}
      </ul>
    </Card>
  );
}
