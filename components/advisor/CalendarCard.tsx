import { Card } from "@/components/ui/Card";
import { WORKSPACE_FIELD_LIST_CLASS } from "@/lib/constants";
import { CALENDAR_EVENTS } from "@/lib/advisor-data";

/** Placeholder schedule for today's executive calendar. */
export function CalendarCard() {
  return (
    <Card title="Today's Schedule">
      <ul className={WORKSPACE_FIELD_LIST_CLASS} aria-label="Today's schedule">
        {CALENDAR_EVENTS.map((event) => (
          <li
            key={`${event.time}-${event.title}`}
            className="flex gap-4 border-b border-white/[0.04] pb-3 last:border-b-0 last:pb-0"
          >
            <span className="w-14 shrink-0 text-sm font-medium tabular-nums text-orion-gold/90">
              {event.time}
            </span>
            <span className="text-sm font-light text-white/70">{event.title}</span>
          </li>
        ))}
      </ul>
    </Card>
  );
}
