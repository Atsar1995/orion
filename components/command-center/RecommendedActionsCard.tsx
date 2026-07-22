import { Card } from "@/components/ui/Card";
import { RECOMMENDED_ACTIONS } from "@/lib/command-center-data";

/** Executive recommended actions for today. */
export function RecommendedActionsCard() {
  return (
    <Card title="Recommended Actions">
      <ul className="space-y-2.5">
        {RECOMMENDED_ACTIONS.map((item) => (
          <li
            key={item}
            className="flex items-start gap-2 text-sm font-light leading-relaxed text-white/65"
          >
            <span aria-hidden className="text-orion-gold">
              →
            </span>
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </Card>
  );
}
