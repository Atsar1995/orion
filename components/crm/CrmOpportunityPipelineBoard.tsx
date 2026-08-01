"use client";

import Link from "next/link";
import { useMemo, useState, useTransition } from "react";
import { OpportunityHealthBadge } from "@/components/crm/OpportunityHealthBadge";
import { OpportunityPriorityBadge } from "@/components/crm/OpportunityPriorityBadge";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { SearchBox } from "@/components/ui/SearchBox";
import type {
  CrmOpportunityRecord,
  OpportunityHealthLabel,
  OpportunityListQuery,
  OpportunityPriorityLabel,
  OpportunityStage,
} from "@/lib/crm/models/opportunities";
import { groupOpportunitiesByStage } from "@/lib/crm/services/opportunities/opportunity-query";

type CrmOpportunityPipelineBoardProps = {
  records: CrmOpportunityRecord[];
  stages: OpportunityStage[];
};

/** Kanban-style CRM opportunity pipeline board. */
export function CrmOpportunityPipelineBoard({ records, stages }: CrmOpportunityPipelineBoardProps) {
  const [query, setQuery] = useState<OpportunityListQuery>({
    sortField: "name",
    sortDirection: "asc",
    filters: {
      stage: "all",
      health: "all",
      priority: "all",
      assignedOwner: "all",
    },
  });
  const [, startTransition] = useTransition();

  const columns = useMemo(() => groupOpportunitiesByStage(records, query), [records, query]);
  const totalVisible = useMemo(
    () => Object.values(columns).reduce((sum, items) => sum + items.length, 0),
    [columns],
  );

  function updateQuery(next: Partial<OpportunityListQuery>) {
    startTransition(() => {
      setQuery((current) => ({ ...current, ...next }));
    });
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <SearchBox
          value={query.search ?? ""}
          onChange={(value) => updateQuery({ search: value })}
          placeholder="Search pipeline..."
          className="max-w-md"
          id="crm-opportunity-pipeline-search"
        />
        <p className="text-sm font-light text-white/45">
          {totalVisible} opportunit{totalVisible === 1 ? "y" : "ies"} in pipeline
        </p>
      </div>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
        <label className="space-y-1">
          <span className="text-xs text-white/45">Health</span>
          <select
            aria-label="Filter pipeline by health"
            className="w-full rounded-orion-md border border-white/[0.08] bg-white/[0.03] px-3 py-2 text-sm text-white/85"
            value={query.filters?.health ?? "all"}
            onChange={(event) =>
              updateQuery({
                filters: {
                  ...query.filters,
                  health: event.target.value as OpportunityHealthLabel | "all",
                },
              })
            }
          >
            <option value="all">All health levels</option>
            <option value="Healthy">Healthy</option>
            <option value="Needs Attention">Needs Attention</option>
            <option value="High Risk">High Risk</option>
            <option value="Closed Won">Closed Won</option>
            <option value="Closed Lost">Closed Lost</option>
          </select>
        </label>

        <label className="space-y-1">
          <span className="text-xs text-white/45">Priority</span>
          <select
            aria-label="Filter pipeline by priority"
            className="w-full rounded-orion-md border border-white/[0.08] bg-white/[0.03] px-3 py-2 text-sm text-white/85"
            value={query.filters?.priority ?? "all"}
            onChange={(event) =>
              updateQuery({
                filters: {
                  ...query.filters,
                  priority: event.target.value as OpportunityPriorityLabel | "all",
                },
              })
            }
          >
            <option value="all">All priorities</option>
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
          </select>
        </label>

        <label className="space-y-1 md:col-span-2 xl:col-span-2">
          <span className="text-xs text-white/45">Assigned Owner</span>
          <select
            aria-label="Filter pipeline by assigned owner"
            className="w-full rounded-orion-md border border-white/[0.08] bg-white/[0.03] px-3 py-2 text-sm text-white/85"
            value={query.filters?.assignedOwner ?? "all"}
            onChange={(event) =>
              updateQuery({
                filters: { ...query.filters, assignedOwner: event.target.value },
              })
            }
          >
            <option value="all">All owners</option>
            {[...new Set(records.map((record) => record.assignedOwner))]
              .sort()
              .map((owner) => (
                <option key={owner} value={owner}>
                  {owner}
                </option>
              ))}
          </select>
        </label>
      </div>

      {totalVisible === 0 ? (
        <Card title="Pipeline Board">
          <EmptyState description="No opportunities match the current search or filters." />
        </Card>
      ) : (
        <div
          className="grid gap-4 overflow-x-auto pb-2 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6"
          role="list"
          aria-label="Opportunity pipeline stages"
        >
          {stages.map((stage) => (
            <Card key={stage} title={stage} className="min-w-[240px]">
              <ul className="space-y-3" role="list" aria-label={`${stage} opportunities`}>
                {columns[stage].length === 0 ? (
                  <li className="text-sm font-light text-white/40">No deals in this stage.</li>
                ) : (
                  columns[stage].map((opportunity) => (
                    <li key={opportunity.id}>
                      <Link
                        href={`/crm/opportunities/${opportunity.id}`}
                        className="block rounded-orion-md border border-white/[0.06] bg-white/[0.02] p-3 transition-colors hover:border-orion-gold/20 hover:bg-white/[0.04]"
                      >
                        <div className="flex flex-wrap items-start justify-between gap-2">
                          <p className="text-sm font-medium text-white/90">{opportunity.name}</p>
                          <OpportunityPriorityBadge label={opportunity.priority} />
                        </div>
                        <p className="mt-1 text-xs font-light text-white/50">{opportunity.customer}</p>
                        <dl className="mt-3 space-y-1 text-xs">
                          <div className="flex justify-between gap-2">
                            <dt className="text-white/40">Value</dt>
                            <dd className="font-medium tabular-nums text-white/80">
                              {opportunity.value}
                            </dd>
                          </div>
                          <div className="flex justify-between gap-2">
                            <dt className="text-white/40">Probability</dt>
                            <dd className="tabular-nums text-white/70">{opportunity.probability}%</dd>
                          </div>
                          <div className="flex justify-between gap-2">
                            <dt className="text-white/40">Close</dt>
                            <dd className="text-white/70">{opportunity.expectedClose}</dd>
                          </div>
                          <div className="flex justify-between gap-2">
                            <dt className="text-white/40">Owner</dt>
                            <dd className="text-white/70">{opportunity.assignedOwner}</dd>
                          </div>
                        </dl>
                        <div className="mt-3">
                          <OpportunityHealthBadge label={opportunity.healthLabel} />
                        </div>
                      </Link>
                    </li>
                  ))
                )}
              </ul>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
