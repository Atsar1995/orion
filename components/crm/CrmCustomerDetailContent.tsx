import Link from "next/link";
import { CustomerHealthBadge } from "@/components/crm/CustomerHealthBadge";
import { CrmRecentActivity } from "@/components/crm/CrmRecentActivity";
import { CrmSectionPlaceholder } from "@/components/crm/CrmSectionPlaceholder";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { StatCard } from "@/components/ui/StatCard";
import {
  WORKSPACE_FIELD_LIST_CLASS,
  WORKSPACE_FIELD_ROW_CLASS,
  WORKSPACE_GRID_2_COL,
  WORKSPACE_SUMMARY_CLASS,
} from "@/lib/constants";
import type { CrmCustomerDetailView } from "@/lib/crm/models/customers";

type CrmCustomerDetailViewProps = {
  detail: CrmCustomerDetailView;
};

/** CRM customer detail presentation (Mission 16A.3). */
export function CrmCustomerDetailContent({ detail }: CrmCustomerDetailViewProps) {
  const { customer } = detail;

  return (
    <div className="space-y-6">
      <div>
        <Link
          href="/crm/customers"
          className="text-sm font-medium text-orion-gold/90 hover:text-orion-gold"
        >
          ← Back to Customers
        </Link>
      </div>

      <Card title="Customer Profile" variant="premium">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold tracking-tight text-white">{customer.name}</h2>
            <p className="mt-1 text-sm font-light text-white/55">{customer.company}</p>
          </div>
          <CustomerHealthBadge label={customer.healthLabel} />
        </div>
        <p className={WORKSPACE_SUMMARY_CLASS}>{customer.executiveNotes}</p>
        <div className={`mt-4 ${WORKSPACE_GRID_2_COL}`}>
          <StatCard label="Health Score" value={`${customer.healthScore}/100`} />
          <StatCard label="Lifetime Value" value={customer.lifetimeValue} />
          <StatCard label="Relationship Status" value={customer.relationshipStatus} />
          <StatCard label="Open Opportunities" value={String(customer.openOpportunities)} />
        </div>
      </Card>

      <div className={WORKSPACE_GRID_2_COL}>
        <Card title="Contact Information">
          <ul className={WORKSPACE_FIELD_LIST_CLASS}>
            <li className={WORKSPACE_FIELD_ROW_CLASS}>
              <span className="text-sm font-light text-white/60">Email</span>
              <span className="text-sm text-white/85">{customer.email}</span>
            </li>
            <li className={WORKSPACE_FIELD_ROW_CLASS}>
              <span className="text-sm font-light text-white/60">Phone</span>
              <span className="text-sm text-white/85">{customer.phone}</span>
            </li>
            <li className={WORKSPACE_FIELD_ROW_CLASS}>
              <span className="text-sm font-light text-white/60">Country</span>
              <span className="text-sm text-white/85">{customer.country}</span>
            </li>
            <li className={WORKSPACE_FIELD_ROW_CLASS}>
              <span className="text-sm font-light text-white/60">Assigned Owner</span>
              <span className="text-sm text-white/85">{customer.assignedOwner}</span>
            </li>
          </ul>
        </Card>

        <Card title="Company Information">
          <ul className={WORKSPACE_FIELD_LIST_CLASS}>
            <li className={WORKSPACE_FIELD_ROW_CLASS}>
              <span className="text-sm font-light text-white/60">Company</span>
              <span className="text-sm text-white/85">{customer.company}</span>
            </li>
            <li className={WORKSPACE_FIELD_ROW_CLASS}>
              <span className="text-sm font-light text-white/60">Industry</span>
              <span className="text-sm text-white/85">{customer.industry}</span>
            </li>
            <li className={WORKSPACE_FIELD_ROW_CLASS}>
              <span className="text-sm font-light text-white/60">Status</span>
              <span className="text-sm text-white/85">{customer.status}</span>
            </li>
            <li className={WORKSPACE_FIELD_ROW_CLASS}>
              <span className="text-sm font-light text-white/60">Next Follow-up</span>
              <span className="text-sm text-white/85">{customer.nextFollowUp}</span>
            </li>
          </ul>
        </Card>
      </div>

      <div className={WORKSPACE_GRID_2_COL}>
        <CrmRecentActivity activities={detail.recentActivity} />
        <Card title="Open Opportunities">
          {detail.openOpportunities.length === 0 ? (
            <EmptyState description="No open opportunities for this customer." />
          ) : (
            <ul className={WORKSPACE_FIELD_LIST_CLASS}>
              {detail.openOpportunities.map((opportunity) => (
                <li key={opportunity.name} className={WORKSPACE_FIELD_ROW_CLASS}>
                  <div>
                    <p className="text-sm font-medium text-white/85">{opportunity.name}</p>
                    <p className="text-xs font-light text-white/45">
                      {opportunity.stage} · Close {opportunity.expectedClose}
                    </p>
                  </div>
                  <span className="text-sm font-medium tabular-nums text-white/85">
                    {opportunity.value}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>

      <div className={WORKSPACE_GRID_2_COL}>
        <CrmSectionPlaceholder
          title="Notes"
          description="Customer notes and executive context will be editable when CRM persistence ships."
        />
        <CrmSectionPlaceholder
          title="Timeline"
          description="Full relationship timeline will appear when activity integrations are connected."
        />
      </div>
    </div>
  );
}
