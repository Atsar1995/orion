import { Card } from "@/components/ui/Card";
import { EXECUTIVE_BRIEFING_ITEMS } from "@/lib/command-center-data";

/** Concise overnight and morning briefing for the founder. */
export function ExecutiveBriefingSection() {
  return (
    <Card title="Executive Briefing">
      <ul className="space-y-2.5">
        {EXECUTIVE_BRIEFING_ITEMS.map((item) => (
          <li
            key={item}
            className="flex items-start gap-2 text-sm font-light leading-relaxed text-white/60"
          >
            <span aria-hidden className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-orion-gold/70" />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </Card>
  );
}
