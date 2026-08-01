import { ActivityStatusBadge } from "@/components/crm/ActivityStatusBadge";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { WORKSPACE_FIELD_LIST_CLASS, WORKSPACE_FIELD_ROW_CLASS } from "@/lib/constants";
import type { CrmActivityEmailItem } from "@/lib/crm/models/activities";

type CrmActivityEmailsProps = {
  emails: CrmActivityEmailItem[];
};

/** CRM placeholder email activity section. */
export function CrmActivityEmails({ emails }: CrmActivityEmailsProps) {
  return (
    <Card title="Emails">
      {emails.length === 0 ? (
        <EmptyState description="No emails match the current filters." />
      ) : (
        <ul className={WORKSPACE_FIELD_LIST_CLASS}>
          {emails.map((email) => (
            <li key={email.id} className={WORKSPACE_FIELD_ROW_CLASS}>
              <div className="min-w-0 space-y-2">
                <p className="text-sm font-medium text-white/85">{email.subject}</p>
                <p className="text-xs font-light text-white/45">
                  {email.customer} · {email.date}
                </p>
                <ActivityStatusBadge status={email.status} />
              </div>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}
