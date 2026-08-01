import { getIntelligenceIntegrationService } from "@/lib/platform/intelligence";
import type { PublishIntelligenceEventInput } from "@/types/intelligence-integration";
import type { ServiceContext } from "@/types/services";

const seededOrganizations = new Set<string>();

/** Seeds representative intelligence events for the executive brief feed (Mission P-006). */
export function seedBriefIntelligenceEvents(context: ServiceContext): void {
  if (seededOrganizations.has(context.organizationId)) {
    return;
  }

  seededOrganizations.add(context.organizationId);
  const service = getIntelligenceIntegrationService();

  const seeds: PublishIntelligenceEventInput[] = [
    {
      eventType: "DecisionUpdated" as const,
      sourceService: "decision-intelligence",
      sourceWorkspace: "Platform",
      entityType: "decision",
      entityId: "dec-revenue-optimization",
      actorId: context.userId,
      payload: { summary: "Revenue optimization decision updated" },
    },
    {
      eventType: "CustomerUpdated" as const,
      sourceService: "crm-workspace",
      sourceWorkspace: "CRM",
      entityType: "customer",
      entityId: "cust-apex-retail",
      actorId: context.userId,
      payload: { summary: "Apex Retail account activity" },
    },
    {
      eventType: "InvoiceIssued" as const,
      sourceService: "finance-workspace",
      sourceWorkspace: "Finance",
      entityType: "invoice",
      entityId: "inv-q3-001",
      actorId: context.userId,
      priority: "high" as const,
      payload: { amount: "125000", currency: "USD" },
    },
  ];

  for (const seed of seeds) {
    try {
      service.publish(seed, context);
    } catch {
      /* Ignore duplicate seed on hot reload */
    }
  }
}
