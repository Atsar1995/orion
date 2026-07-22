import { Card } from "@/components/ui/Card";
import { TODAYS_PRIORITIES } from "@/lib/command-center-data";

/** Ordered list of today's top priorities. */
export function TodaysPrioritiesCard() {
  return (
    <Card title="Today's Priorities">
      <ol className="space-y-2.5">
        {TODAYS_PRIORITIES.map((item, index) => (
          <li
            key={item}
            className="flex items-start gap-3 text-sm font-light leading-relaxed text-white/65"
          >
            <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-orion-gold/25 bg-orion-gold/10 text-[10px] font-medium text-orion-gold">
              {index + 1}
            </span>
            <span>{item}</span>
          </li>
        ))}
      </ol>
    </Card>
  );
}
