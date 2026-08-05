/**
 * Procurement Domain — core types (Mission P-010.3).
 * @see docs/Procurement/Procurement-Reference-Domain-Strategy.md
 */

/** Lifecycle state of Procurement domain capability modules. */
export type ProcurementCapabilityStatus = "foundation" | "planned" | "active" | "deprecated";

/** Organization-scoped Procurement entity base. */
export type ProcurementScopedRecord = {
  readonly id: string;
  readonly organizationId: string;
  readonly createdAt: string;
  readonly updatedAt: string;
};

/** Procurement workspace bootstrap metadata. */
export type ProcurementWorkspaceBootstrap = {
  readonly workspaceId: string;
  readonly moduleKey: string;
  readonly label: string;
  readonly basePath: string;
  readonly iilServiceId: string;
  readonly mission: string;
  readonly capabilities: readonly ProcurementCapabilityDescriptor[];
};

export type ProcurementCapabilityDescriptor = {
  readonly key: string;
  readonly label: string;
  readonly status: ProcurementCapabilityStatus;
  readonly mission?: string;
};

/** Domain readiness snapshot for platform foundation certification. */
export type ProcurementDomainStatus = {
  readonly foundationComplete: boolean;
  readonly platformStoreIntegrated: boolean;
  readonly repositoryWiringReady: boolean;
  readonly eventPipelineRegistryReady: boolean;
  readonly healthMonitoringReady: boolean;
  readonly readyForPlatformPersistence: boolean;
  readonly readyForCanonicalEvents: boolean;
  readonly readyForRbac: boolean;
  readonly readyForCertification: boolean;
};

/** Procurement workspace view with domain status. */
export type ProcurementWorkspaceView = ProcurementWorkspaceBootstrap & {
  readonly domainStatus: ProcurementDomainStatus;
};
