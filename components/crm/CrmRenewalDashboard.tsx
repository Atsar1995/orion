import { Card } from "@/components/ui/Card";
import type { RenewalDashboardView } from "@/lib/crm/models/agreements";

type CrmRenewalDashboardProps = {
  view: RenewalDashboardView;
};

/** Renewal dashboard — upcoming renewals, expiring contracts, pending approvals (Mission P-008.3). */
export function CrmRenewalDashboard({ view }: CrmRenewalDashboardProps) {
  return (
    <div className="grid gap-5 lg:grid-cols-2">
      <Card title="Upcoming Renewals" subtitle={`${view.upcoming.length} scheduled`}>
        {view.upcoming.length === 0 ? (
          <p className="text-sm text-muted-foreground">No renewals scheduled.</p>
        ) : (
          <ul className="space-y-3 text-sm">
            {view.upcoming.map((entry) => (
              <li key={entry.id} className="rounded-md border border-border/60 p-3">
                <p className="font-medium">{entry.contractTitle}</p>
                <p className="text-muted-foreground">{entry.partyName}</p>
                <p className="mt-1">
                  Renewal {entry.renewalDate} → valid to {entry.newValidTo}
                </p>
                {entry.notes ? <p className="mt-1 text-xs text-muted-foreground">{entry.notes}</p> : null}
              </li>
            ))}
          </ul>
        )}
      </Card>

      <Card title="Expiring Contracts" subtitle={`${view.expiring.length} within 45 days`}>
        {view.expiring.length === 0 ? (
          <p className="text-sm text-muted-foreground">No contracts expiring soon.</p>
        ) : (
          <ul className="space-y-3 text-sm">
            {view.expiring.map((entry) => (
              <li key={entry.id} className="rounded-md border border-border/60 p-3">
                <p className="font-medium">{entry.title}</p>
                <p className="text-muted-foreground">{entry.partyName}</p>
                <p className="mt-1 text-amber-400">
                  Expires {entry.effectiveTo}
                  {entry.daysToExpiry !== undefined ? ` (${entry.daysToExpiry} days)` : ""}
                </p>
              </li>
            ))}
          </ul>
        )}
      </Card>

      <Card
        title="Pending Approvals"
        subtitle={`${view.pendingApprovals.length} awaiting decision`}
        className="lg:col-span-2"
      >
        {view.pendingApprovals.length === 0 ? (
          <p className="text-sm text-muted-foreground">No pending approvals.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="border-b border-border text-left">
                <tr>
                  <th className="px-3 py-2 font-medium">Entity</th>
                  <th className="px-3 py-2 font-medium">Type</th>
                  <th className="px-3 py-2 font-medium">Requested By</th>
                  <th className="px-3 py-2 font-medium">Requested At</th>
                  <th className="px-3 py-2 font-medium">Notes</th>
                </tr>
              </thead>
              <tbody>
                {view.pendingApprovals.map((entry) => (
                  <tr key={entry.id} className="border-b border-border/60 last:border-0">
                    <td className="px-3 py-2 font-mono text-xs">{entry.entityId}</td>
                    <td className="px-3 py-2 capitalize">{entry.entityType.replace(/_/g, " ")}</td>
                    <td className="px-3 py-2">{entry.requestedBy}</td>
                    <td className="px-3 py-2">{new Date(entry.requestedAt).toLocaleDateString()}</td>
                    <td className="px-3 py-2 text-muted-foreground">{entry.notes ?? "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
