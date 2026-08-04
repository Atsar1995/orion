/**
 * CRM Domain — core types (Mission P-008.9).
 * @see docs/CRM/CRM-Reference-Domain-Architecture.md
 */

/** Lifecycle state of CRM domain capability modules. */
export type CrmCapabilityStatus = "foundation" | "planned" | "active" | "deprecated";

/** Organization-scoped CRM entity base. */
export type CrmScopedRecord = {
  readonly id: string;
  readonly organizationId: string;
  readonly createdAt: string;
  readonly updatedAt: string;
};

/** CRM workspace bootstrap metadata. */
export type CrmWorkspaceBootstrap = {
  readonly workspaceId: string;
  readonly moduleKey: string;
  readonly label: string;
  readonly basePath: string;
  readonly iilServiceId: string;
  readonly mission: string;
  readonly capabilities: readonly CrmCapabilityDescriptor[];
};

export type CrmCapabilityDescriptor = {
  readonly key: string;
  readonly label: string;
  readonly status: CrmCapabilityStatus;
  readonly mission?: string;
};

/** Domain readiness snapshot for platform foundation certification. */
export type CrmDomainStatus = {
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

/** CRM workspace view with domain status. */
export type CrmWorkspaceView = CrmWorkspaceBootstrap & {
  readonly domainStatus: CrmDomainStatus;
};
