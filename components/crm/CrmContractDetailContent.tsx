import { Card } from "@/components/ui/Card";
import { formatCommercialCurrency } from "@/lib/crm/data/seed-commercial";
import type { ContractRecord } from "@/types/crm-agreements";

type CrmContractDetailContentProps = {
  contract: ContractRecord;
  partyName: string;
};

/** Contract detail view with version history (Mission P-008.3). */
export function CrmContractDetailContent({ contract, partyName }: CrmContractDetailContentProps) {
  return (
    <div className="grid gap-5 lg:grid-cols-2">
      <Card title="Contract Summary" subtitle={contract.title}>
        <dl className="space-y-3 text-sm">
          <div className="flex justify-between gap-4">
            <dt className="text-muted-foreground">Customer</dt>
            <dd className="font-medium">{partyName}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-muted-foreground">Type</dt>
            <dd className="capitalize">{contract.contractType.replace(/_/g, " ")}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-muted-foreground">Status</dt>
            <dd className="capitalize">{contract.status.replace(/_/g, " ")}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-muted-foreground">Owner</dt>
            <dd>{contract.owner}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-muted-foreground">Effective</dt>
            <dd>
              {contract.effectiveFrom} — {contract.effectiveTo}
            </dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-muted-foreground">Total Value</dt>
            <dd className="font-medium">{formatCommercialCurrency(contract.pricing.total)}</dd>
          </div>
          {contract.renewalRule ? (
            <div className="flex justify-between gap-4">
              <dt className="text-muted-foreground">Renewal Rule</dt>
              <dd className="text-right">{contract.renewalRule}</dd>
            </div>
          ) : null}
          {contract.signedAt ? (
            <div className="flex justify-between gap-4">
              <dt className="text-muted-foreground">Signed</dt>
              <dd>{new Date(contract.signedAt).toLocaleDateString()}</dd>
            </div>
          ) : null}
        </dl>
      </Card>

      <Card title="Version History" subtitle={`Version ${contract.version}`}>
        <ol className="space-y-3 text-sm">
          {[...contract.versions].reverse().map((version) => (
            <li key={version.version} className="rounded-md border border-border/60 p-3">
              <div className="flex items-center justify-between gap-2">
                <span className="font-medium">v{version.version}</span>
                <span className="capitalize text-muted-foreground">
                  {version.snapshotStatus.replace(/_/g, " ")}
                </span>
              </div>
              <p className="mt-1">{version.changeSummary}</p>
              <p className="mt-1 text-xs text-muted-foreground">
                {new Date(version.createdAt).toLocaleString()}
                {version.createdBy ? ` · ${version.createdBy}` : ""}
              </p>
            </li>
          ))}
        </ol>
      </Card>

      {contract.terms.length > 0 ? (
        <Card title="Commercial Terms" subtitle={`${contract.terms.length} terms`} className="lg:col-span-2">
          <ul className="grid gap-3 text-sm sm:grid-cols-2">
            {contract.terms.map((term) => (
              <li key={term.id} className="rounded-md border border-border/60 p-3">
                <p className="font-medium">{term.label}</p>
                <p className="text-muted-foreground">{term.value}</p>
              </li>
            ))}
          </ul>
        </Card>
      ) : null}
    </div>
  );
}
