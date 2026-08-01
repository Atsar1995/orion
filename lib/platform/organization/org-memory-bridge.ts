import { delegationService } from "@/lib/platform/organization/DelegationService";
import { userManagementService } from "@/lib/platform/organization/UserManagementService";
import { memoryService } from "@/lib/executive/memory";
import type { ServiceContext } from "@/types/services";

const syncedOrganizations = new Set<string>();

/** Syncs organizational leadership and delegation into Executive Memory (Mission P-005). */
export function syncOrganizationMemory(context: ServiceContext, actorName: string): void {
  if (syncedOrganizations.has(context.organizationId)) {
    return;
  }

  syncedOrganizations.add(context.organizationId);
  const health = userManagementService.getOrganizationHealth(context);
  const delegations = delegationService.list(context);

  memoryService.createMemory(
    {
      category: "historical_context",
      title: `Organizational health — ${health.organizationName}`,
      summary: health.summary,
      fullContext: `Health score ${health.healthScore}/100. ${health.activeUsers} active users. ${health.vacantCriticalRoles.length} vacant critical roles.`,
      workspace: "Platform",
      workspaceId: context.workspaceId,
      tags: ["organization", "leadership", "health"],
      importance: 75,
      confidence: 90,
    },
    context,
    actorName,
  );

  for (const leader of health.leadershipStructure) {
    memoryService.createMemory(
      {
        category: "operational_event",
        title: `Leadership — ${leader.name}`,
        summary: `${leader.title} (${leader.role})`,
        workspace: "Platform",
        workspaceId: context.workspaceId,
        tags: ["leadership", "organization"],
        importance: 60,
        confidence: 95,
      },
      context,
      actorName,
    );
  }

  for (const delegation of delegations) {
    memoryService.createMemory(
      {
        category: "operational_event",
        title: `Delegation — ${delegation.label}`,
        summary: `${delegation.scope} scope delegated until ${delegation.endsAt ?? "revoked"}`,
        workspace: "Platform",
        workspaceId: context.workspaceId,
        tags: ["delegation", "organization"],
        importance: 70,
        confidence: 92,
      },
      context,
      actorName,
    );
  }
}
