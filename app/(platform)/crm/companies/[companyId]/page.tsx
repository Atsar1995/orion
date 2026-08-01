import Link from "next/link";
import { CrmSectionHeader } from "@/components/crm/CrmSectionHeader";
import { Card } from "@/components/ui/Card";
import { WORKSPACE_SECTION_CLASS } from "@/lib/constants";
import { crmPartyService } from "@/lib/crm";
import { getDecisionServiceContext } from "@/lib/decisions/server-context";

const TYPE_LABELS: Record<string, string> = {
  corporate_account: "Corporate Account",
  travel_agency: "Travel Agency",
  tour_operator: "Tour Operator",
  government: "Government",
  supplier: "Supplier",
  partner: "Partner",
  association: "Association",
  education: "Education",
  ngo: "NGO",
  membership: "Membership",
  other: "Other",
};

/** CRM Companies — universal organisation directory (Mission P-008.1). */
export default async function CrmCompanyDetailPage({
  params,
}: {
  params: Promise<{ companyId: string }>;
}) {
  const { companyId } = await params;
  const { context } = await getDecisionServiceContext();
  const detail = crmPartyService.organisations.getDetail(companyId, context);

  if (!detail) {
    return (
      <>
        <CrmSectionHeader title="Company not found" subtitle="The requested organisation could not be located." />
        <section className={WORKSPACE_SECTION_CLASS}>
          <Link
            href="/crm/companies"
            className="inline-flex items-center rounded-orion-md border border-white/10 px-4 py-2 text-sm text-orion-gold/90 hover:text-orion-gold"
          >
            Back to Companies
          </Link>
        </section>
      </>
    );
  }

  return (
    <>
      <CrmSectionHeader
        title={detail.displayName}
        subtitle={`${TYPE_LABELS[detail.organisationType] ?? detail.organisationType}${detail.industry ? ` · ${detail.industry}` : ""}`}
      />
      <section aria-label="Company detail" className={`${WORKSPACE_SECTION_CLASS} space-y-5`}>
        <div className="grid gap-4 lg:grid-cols-3">
          <Card className="lg:col-span-2" title="Profile">
            <dl className="grid gap-3 sm:grid-cols-2">
              <div>
                <dt className="text-xs text-muted-foreground">Legal name</dt>
                <dd>{detail.legalName ?? detail.displayName}</dd>
              </div>
              <div>
                <dt className="text-xs text-muted-foreground">Status</dt>
                <dd className="capitalize">{detail.status}</dd>
              </div>
              <div>
                <dt className="text-xs text-muted-foreground">Email</dt>
                <dd>{detail.contact.email ?? "—"}</dd>
              </div>
              <div>
                <dt className="text-xs text-muted-foreground">Phone</dt>
                <dd>{detail.contact.phone ?? "—"}</dd>
              </div>
              <div>
                <dt className="text-xs text-muted-foreground">Assigned owner</dt>
                <dd>{detail.assignedOwner ?? "—"}</dd>
              </div>
              <div>
                <dt className="text-xs text-muted-foreground">Roles</dt>
                <dd>{detail.roles.join(", ")}</dd>
              </div>
            </dl>
            {detail.notes ? (
              <p className="mt-4 text-sm text-muted-foreground">{detail.notes}</p>
            ) : null}
          </Card>
          <Card title="Relationships">
            {detail.relationships.length === 0 ? (
              <p className="text-sm text-muted-foreground">No linked relationships.</p>
            ) : (
              <ul className="space-y-2 text-sm">
                {detail.relationships.map((rel) => (
                  <li key={rel.id}>
                    <span className="font-medium">{rel.relatedPartyName}</span>
                    <span className="text-muted-foreground"> · {rel.relationshipType}</span>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </div>

        <Card title="Linked contacts">
          {detail.contacts.length === 0 ? (
            <p className="text-sm text-muted-foreground">No person records linked to this organisation.</p>
          ) : (
            <ul className="divide-y divide-border">
              {detail.contacts.map((contact) => (
                <li key={contact.id} className="flex items-center justify-between py-3">
                  <div>
                    <div className="font-medium">{contact.displayName}</div>
                    <div className="text-xs text-muted-foreground">
                      {[contact.jobTitle, contact.email].filter(Boolean).join(" · ")}
                    </div>
                  </div>
                  <span className="text-xs capitalize text-muted-foreground">{contact.status}</span>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Link
          href="/crm/companies"
          className="inline-flex items-center rounded-orion-md border border-white/10 px-4 py-2 text-sm text-orion-gold/90 hover:text-orion-gold"
        >
          Back to Companies
        </Link>
      </section>
    </>
  );
}
