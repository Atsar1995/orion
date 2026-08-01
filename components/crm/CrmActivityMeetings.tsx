import { ActivityStatusBadge } from "@/components/crm/ActivityStatusBadge";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { WORKSPACE_FIELD_LIST_CLASS, WORKSPACE_FIELD_ROW_CLASS } from "@/lib/constants";
import type { CrmActivityMeetingItem } from "@/lib/crm/models/activities";

type CrmActivityMeetingsProps = {
  meetings: CrmActivityMeetingItem[];
};

/** CRM placeholder meetings section. */
export function CrmActivityMeetings({ meetings }: CrmActivityMeetingsProps) {
  return (
    <Card title="Meetings">
      {meetings.length === 0 ? (
        <EmptyState description="No meetings match the current filters." />
      ) : (
        <ul className={WORKSPACE_FIELD_LIST_CLASS}>
          {meetings.map((meeting) => (
            <li key={meeting.id} className={WORKSPACE_FIELD_ROW_CLASS}>
              <div className="min-w-0 space-y-2">
                <p className="text-sm font-medium text-white/85">{meeting.customer}</p>
                <p className="text-xs font-light text-white/45">
                  {meeting.date} · {meeting.time}
                </p>
                <p className="text-xs font-light text-white/55">
                  Participants: {meeting.participants.join(", ") || "—"}
                </p>
                <ActivityStatusBadge status={meeting.status} />
              </div>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}
