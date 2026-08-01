import type { RegisteredService } from "@/types/intelligence-integration";

const DEFAULT_SERVICES: RegisteredService[] = [
  {
    serviceId: "executive-brief",
    label: "Executive Brief",
    workspace: "Platform",
    canPublish: false,
    canSubscribe: true,
  },
  {
    serviceId: "executive-memory",
    label: "Executive Memory",
    workspace: "Platform",
    canPublish: false,
    canSubscribe: true,
  },
  {
    serviceId: "decision-intelligence",
    label: "Decision Intelligence",
    workspace: "Platform",
    canPublish: true,
    canSubscribe: true,
  },
  {
    serviceId: "organization-platform",
    label: "Organization Platform",
    workspace: "Platform",
    canPublish: true,
    canSubscribe: true,
  },
  {
    serviceId: "crm-workspace",
    label: "CRM Workspace",
    workspace: "CRM",
    canPublish: true,
    canSubscribe: false,
  },
  {
    serviceId: "finance-workspace",
    label: "Finance Workspace",
    workspace: "Finance",
    canPublish: true,
    canSubscribe: true,
  },
  {
    serviceId: "hospitality-workspace",
    label: "Hospitality Workspace",
    workspace: "Hospitality",
    canPublish: true,
    canSubscribe: false,
  },
  {
    serviceId: "hcm-workspace",
    label: "HCM Workspace",
    workspace: "HCM",
    canPublish: true,
    canSubscribe: false,
  },
  {
    serviceId: "webhook-gateway",
    label: "Webhook Gateway",
    workspace: "Integrations",
    canPublish: false,
    canSubscribe: true,
  },
  {
    serviceId: "workflow-platform",
    label: "Workflow Platform",
    workspace: "Platform",
    canPublish: true,
    canSubscribe: true,
  },
  {
    serviceId: "notification-platform",
    label: "Notification Platform",
    workspace: "Platform",
    canPublish: true,
    canSubscribe: true,
  },
  {
    serviceId: "search-platform",
    label: "Search Platform",
    workspace: "Platform",
    canPublish: true,
    canSubscribe: true,
  },
  {
    serviceId: "compliance-platform",
    label: "Compliance Platform",
    workspace: "Platform",
    canPublish: true,
    canSubscribe: true,
  },
  {
    serviceId: "integration-platform",
    label: "Integration Platform",
    workspace: "Integrations",
    canPublish: true,
    canSubscribe: true,
  },
  {
    serviceId: "data-platform",
    label: "Data Platform",
    workspace: "Platform",
    canPublish: true,
    canSubscribe: true,
  },
];

/** Registry of services authorized to publish or subscribe (Mission P-006). */
export class ServiceRegistry {
  private readonly services = new Map<string, RegisteredService>();

  constructor(seed: readonly RegisteredService[] = DEFAULT_SERVICES) {
    for (const service of seed) {
      this.services.set(service.serviceId, service);
    }
  }

  list(): readonly RegisteredService[] {
    return [...this.services.values()];
  }

  find(serviceId: string): RegisteredService | null {
    return this.services.get(serviceId.trim()) ?? null;
  }

  canPublish(serviceId: string): boolean {
    return this.find(serviceId)?.canPublish ?? false;
  }

  register(service: RegisteredService): void {
    this.services.set(service.serviceId, service);
  }
}

export const defaultServiceRegistry = new ServiceRegistry();
