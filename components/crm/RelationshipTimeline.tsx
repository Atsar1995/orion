import { Card } from "@/components/ui/Card";
import { WORKSPACE_FIELD_LIST_CLASS, WORKSPACE_FIELD_ROW_CLASS } from "@/lib/constants";
import type { TimelineEvent } from "@/lib/crm-relationships-opportunities";
import { RELATIONSHIP_TIMELINE } from "@/lib/crm-relationships-opportunities";

type RelationshipTimelineProps = {
  events?: TimelineEvent[];
  title?: string;
};

/** Chronological relationship activity timeline — presentation only. */
export function RelationshipTimeline({
  events = RELATIONSHIP_TIMELINE,
  title = "Relationship Timeline",
}: RelationshipTimelineProps) {
  return (
    <Card title={title}>
      <ul className={WORKSPACE_FIELD_LIST_CLASS} aria-label={title}>
        {events.map((event) => (
          <li key={event.id} className={WORKSPACE_FIELD_ROW_CLASS}>
            <div className="min-w-0 space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-orion-sm border border-orion-gold/20 bg-orion-gold/10 px-2 py-0.5 text-[11px] font-medium tracking-wide text-orion-gold/90 uppercase">
                  {event.type}
                </span>
                <p className="text-sm font-medium text-white/80">{event.customer}</p>
              </div>
              <p className="text-sm font-light text-white/55">{event.description}</p>
            </div>
            <div className="shrink-0 text-right">
              <p className="text-xs font-medium text-white/50">{event.date}</p>
              <p className="text-xs font-light text-white/35">{event.time}</p>
            </div>
          </li>
        ))}
      </ul>
    </Card>
  );
}
