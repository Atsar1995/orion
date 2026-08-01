import { describe, expect, it, beforeEach } from "vitest";
import { DataPlatformFacade } from "@/lib/platform/data";
import { InMemoryMasterEntityRepository } from "@/lib/platform/data/repositories/InMemoryMasterEntityRepository";
import { InMemorySynchronizationRepository } from "@/lib/platform/data/repositories/InMemorySynchronizationRepository";
import { InMemoryValidationRepository } from "@/lib/platform/data/repositories/InMemoryValidationRepository";
import type { ServiceContext } from "@/types/services";

const CONTEXT: ServiceContext = {
  organizationId: "org-orania",
  workspaceId: "workspace-orania",
  userId: "user-executive",
  role: "executive",
};

describe("Mission P-011.5 Enterprise Data Synchronization Engine — Operations", () => {
  let facade: DataPlatformFacade;

  beforeEach(() => {
    facade = new DataPlatformFacade(
      new InMemoryMasterEntityRepository(),
      new InMemoryValidationRepository(),
      new InMemorySynchronizationRepository(),
    );
  });

  it("lists seeded subscriptions", () => {
    const subs = facade.subscriptions.listSubscriptions(CONTEXT);
    expect(subs.length).toBeGreaterThanOrEqual(4);
    expect(subs.some((s) => s.subscriberService === "search-platform")).toBe(true);
  });

  it("enqueues and completes master data synchronization", () => {
    const job = facade.synchronization.enqueue(
      {
        syncType: "master_data",
        changeEventType: "EntityUpdated",
        entityType: "customer",
        entityId: "md-cust-001",
        incomingVersion: 2,
        payload: { validationPassed: "true" },
      },
      CONTEXT,
    );

    expect(job.id).toMatch(/^sync-/);
    expect(job.status).toBe("completed");
    expect(job.subscriptionIds.length).toBeGreaterThan(0);
  });

  it("records synchronization audit trail", () => {
    const job = facade.synchronization.enqueue(
      {
        syncType: "master_data",
        changeEventType: "EntityCreated",
        entityType: "guest",
        entityId: "md-guest-new",
        incomingVersion: 1,
        payload: { validationPassed: "true" },
      },
      CONTEXT,
    );

    const audits = facade.syncAudit.listAudits(CONTEXT, job.id);
    expect(audits.length).toBeGreaterThan(0);
    expect(audits.some((a) => a.action === "synchronization_confirmed")).toBe(true);
  });

  it("detects version conflicts under version_comparison policy", () => {
    facade.synchronization.enqueue(
      {
        syncType: "master_data",
        changeEventType: "EntityUpdated",
        entityType: "vendor",
        entityId: "md-vnd-conflict",
        incomingVersion: 3,
        payload: { validationPassed: "true" },
        policyId: "spolicy-org-orania",
      },
      CONTEXT,
    );

    const conflictJob = facade.synchronization.enqueue(
      {
        syncType: "master_data",
        changeEventType: "EntityUpdated",
        entityType: "vendor",
        entityId: "md-vnd-conflict",
        incomingVersion: 2,
        payload: { validationPassed: "true" },
        policyId: "spolicy-org-orania",
      },
      CONTEXT,
    );

    expect(conflictJob.status).toBe("conflict");
    expect(conflictJob.conflictDetected).toBe(true);

    const conflicts = facade.syncMonitoring.listUnresolvedConflicts(CONTEXT);
    expect(conflicts.some((c) => c.entityId === "md-vnd-conflict")).toBe(true);
  });

  it("blocks sync when validation is required but not passed", () => {
    const job = facade.synchronization.enqueue(
      {
        syncType: "master_data",
        changeEventType: "EntityUpdated",
        entityType: "customer",
        entityId: "md-cust-val",
        incomingVersion: 1,
        policyId: "spolicy-org-orania",
      },
      CONTEXT,
    );

    expect(job.status).toBe("failed");
    expect(job.lastError).toBe("VALIDATION_REQUIRED");
  });

  it("registers a new subscription", () => {
    const sub = facade.subscriptions.registerSubscription(
      {
        subscriberId: "crm-workspace",
        subscriberService: "crm-workspace",
        domainKey: "commercial",
        syncTypes: ["master_data"],
        changeEventTypes: ["EntityUpdated"],
        entityTypes: ["customer"],
      },
      CONTEXT,
    );

    expect(sub.id).toMatch(/^ssub-/);
    expect(sub.active).toBe(true);
  });

  it("provides monitoring statistics", () => {
    facade.synchronization.enqueue(
      {
        syncType: "reference_data",
        changeEventType: "ReferenceUpdated",
        entityType: "currency",
        entityId: "ref-usd",
        payload: { validationPassed: "true" },
      },
      CONTEXT,
    );

    const stats = facade.syncMonitoring.getStats(CONTEXT);
    expect(stats.totalJobs).toBeGreaterThan(0);
    expect(stats.activeSubscriptions).toBeGreaterThan(0);
  });
});
