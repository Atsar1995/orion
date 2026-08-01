import Link from "next/link";
import { CrmSectionHeader } from "@/components/crm/CrmSectionHeader";
import { Card } from "@/components/ui/Card";
import { WORKSPACE_SECTION_CLASS } from "@/lib/constants";
import { crmCommercialService } from "@/lib/crm";
import { getDecisionServiceContext } from "@/lib/decisions/server-context";

/** CRM Lead detail (Mission P-008.2). */
export default async function CrmLeadDetailPage({
  params,
}: {
  params: Promise<{ leadId: string }>;
}) {
  const { leadId } = await params;
  const { context } = await getDecisionServiceContext();
  const detail = crmCommercialService.leads.getDetail(leadId, context);

  if (!detail) {
    return (
      <>
        <CrmSectionHeader title="Lead not found" subtitle="The requested lead could not be located." />
        <section className={WORKSPACE_SECTION_CLASS}>
          <Link href="/crm/leads" className="text-orion-gold/90 hover:text-orion-gold">
            Back to Leads
          </Link>
        </section>
      </>
    );
  }

  const activities = crmCommercialService.activities.listForLead(leadId, context);

  return (
    <>
      <CrmSectionHeader
        title={detail.displayName}
        subtitle={`${detail.source.replace(/_/g, " ")} · ${detail.status.replace(/_/g, " ")}`}
      />
      <section className={`${WORKSPACE_SECTION_CLASS} space-y-5`}>
        <Card title="Lead Profile">
          <dl className="grid gap-3 sm:grid-cols-2 text-sm">
            <div>
              <dt className="text-muted-foreground">Owner</dt>
              <dd>{detail.owner}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Estimated value</dt>
              <dd>{detail.estimatedValue}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Score</dt>
              <dd>{detail.probability}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Next activity</dt>
              <dd>{detail.nextActivity ?? "—"}</dd>
            </div>
            {detail.notes ? (
              <div className="sm:col-span-2">
                <dt className="text-muted-foreground">Notes</dt>
                <dd>{detail.notes}</dd>
              </div>
            ) : null}
          </dl>
        </Card>

        <Card title="Activities">
          {activities.length === 0 ? (
            <p className="text-sm text-muted-foreground">No activities recorded.</p>
          ) : (
            <ul className="space-y-2 text-sm">
              {activities.map((activity) => (
                <li key={activity.id}>
                  <span className="font-medium">{activity.subject}</span>
                  <span className="text-muted-foreground"> · {activity.type}</span>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Link href="/crm/leads" className="text-orion-gold/90 hover:text-orion-gold">
          Back to Leads
        </Link>
      </section>
    </>
  );
}
