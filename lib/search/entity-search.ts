import { crmService } from "@/lib/crm";
import { FINANCE_NAV } from "@/lib/finance-nav";
import type { SearchItem } from "@/lib/search/search-types";

const ENTITY_LIMIT = 5;

function mapCustomerItems(query: string): SearchItem[] {
  const result = crmService.listCustomers({
    search: query,
    page: 1,
    pageSize: ENTITY_LIMIT,
  });

  return result.items.map((customer) => ({
    id: `entity-customer-${customer.id}`,
    label: customer.name,
    category: "entities" as const,
    description: `Customer · ${customer.company}`,
    href: `/crm/customers/${customer.id}`,
    keywords: [customer.company, customer.industry, "customer", "crm"],
  }));
}

function mapOpportunityItems(query: string): SearchItem[] {
  const result = crmService.listOpportunities({
    search: query,
    page: 1,
    pageSize: ENTITY_LIMIT,
  });

  return result.items.map((opportunity) => ({
    id: `entity-opportunity-${opportunity.id}`,
    label: opportunity.name,
    category: "entities" as const,
    description: `Opportunity · ${opportunity.stage} · ${opportunity.value}`,
    href: `/crm/opportunities/${opportunity.id}`,
    keywords: [opportunity.customer, opportunity.stage, "pipeline", "deal"],
  }));
}

function mapFinanceItems(query: string): SearchItem[] {
  return FINANCE_NAV.filter((item) => {
    const label = item.label.toLowerCase();
    const segment = item.href.split("/").pop()?.toLowerCase() ?? "";

    return label.includes(query) || segment.includes(query);
  })
    .slice(0, ENTITY_LIMIT)
    .map((item) => ({
      id: `entity-finance-${item.href}`,
      label: `Finance — ${item.label}`,
      category: "entities" as const,
      description: "Finance workspace",
      href: item.href,
      keywords: ["finance", item.label.toLowerCase()],
    }));
}

/** Searches CRM customers, opportunities, and finance routes for the command palette. */
export function searchExecutiveEntities(query: string): SearchItem[] {
  const normalized = query.trim().toLowerCase();

  if (normalized.length < 2) {
    return [];
  }

  const stripped = normalized.replace(/^(customer:|opportunity:|finance:)\s*/, "");
  const mode = normalized.startsWith("customer:")
    ? "customer"
    : normalized.startsWith("opportunity:")
      ? "opportunity"
      : normalized.startsWith("finance:")
        ? "finance"
        : "all";

  const searchTerm = stripped.length >= 2 ? stripped : normalized;

  const customers = mode === "all" || mode === "customer" ? mapCustomerItems(searchTerm) : [];
  const opportunities =
    mode === "all" || mode === "opportunity" ? mapOpportunityItems(searchTerm) : [];
  const finance = mode === "all" || mode === "finance" ? mapFinanceItems(searchTerm) : [];

  return [...customers, ...opportunities, ...finance].slice(0, ENTITY_LIMIT * 2);
}
