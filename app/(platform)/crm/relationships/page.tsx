import { CrmSectionHeader } from "@/components/crm/CrmSectionHeader";
import { Card } from "@/components/ui/Card";
import { WORKSPACE_SECTION_CLASS } from "@/lib/constants";
import { crmPartyService } from "@/lib/crm";
import { getDecisionServiceContext } from "@/lib/decisions/server-context";

/** CRM Relationships — party relationship graph explorer (Mission P-008.1). */
export default async function CrmRelationshipsPage() {
  const { context } = await getDecisionServiceContext();
  const graph = crmPartyService.explorer.getGraph(context);

  return (
    <>
      <CrmSectionHeader
        title="Relationship Explorer"
        subtitle="Party relationship networks, business ecosystems, and high-value organisation clusters."
      />
      <section aria-label="CRM Relationship Graph" className={`${WORKSPACE_SECTION_CLASS} space-y-5`}>
        <div className="grid gap-4 md:grid-cols-3">
          <Card title="Network nodes" subtitle="Connected parties">
            <p className="text-2xl font-semibold tabular-nums">{graph.ecosystemCount}</p>
          </Card>
          <Card title="Relationships" subtitle="Active edges">
            <p className="text-2xl font-semibold tabular-nums">{graph.edges.length}</p>
          </Card>
          <Card title="High-value orgs" subtitle="Customers & partners">
            <p className="text-2xl font-semibold tabular-nums">{graph.highValueOrganisations}</p>
          </Card>
        </div>

        <Card title="Relationship Graph">
          {graph.edges.length === 0 ? (
            <p className="text-sm text-muted-foreground">No relationships recorded.</p>
          ) : (
            <ul className="divide-y divide-border text-sm">
              {graph.edges.map((edge) => {
                const from = graph.nodes.find((node) => node.id === edge.from);
                const to = graph.nodes.find((node) => node.id === edge.to);
                return (
                  <li key={edge.id} className="flex flex-wrap items-center gap-2 py-3">
                    <span className="font-medium">{from?.displayName ?? edge.from}</span>
                    <span className="text-muted-foreground">→ {edge.type} →</span>
                    <span className="font-medium">{to?.displayName ?? edge.to}</span>
                    {edge.role ? <span className="text-xs text-muted-foreground">({edge.role})</span> : null}
                  </li>
                );
              })}
            </ul>
          )}
        </Card>
      </section>
    </>
  );
}
