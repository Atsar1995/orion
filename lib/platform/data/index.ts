import { defaultMasterEntityRepository } from "@/lib/platform/data/repositories/InMemoryMasterEntityRepository";
import { defaultValidationRepository } from "@/lib/platform/data/repositories/InMemoryValidationRepository";
import { defaultSynchronizationRepository } from "@/lib/platform/data/repositories/InMemorySynchronizationRepository";
import { EntityDiscoveryService } from "@/lib/platform/data/services/EntityDiscoveryService";
import { EntityLookupService } from "@/lib/platform/data/services/EntityLookupService";
import { IdentityService } from "@/lib/platform/data/services/IdentityService";
import { MasterDataRegistryService } from "@/lib/platform/data/services/MasterDataRegistryService";
import { RegistryQueryService } from "@/lib/platform/data/services/RegistryQueryService";
import { SubscriptionService } from "@/lib/platform/data/services/SubscriptionService";
import { SynchronizationAuditService } from "@/lib/platform/data/services/SynchronizationAuditService";
import { SynchronizationMonitoringService } from "@/lib/platform/data/services/SynchronizationMonitoringService";
import { SynchronizationPolicyService } from "@/lib/platform/data/services/SynchronizationPolicyService";
import { SynchronizationService } from "@/lib/platform/data/services/SynchronizationService";
import { ValidationPolicyService } from "@/lib/platform/data/services/ValidationPolicyService";
import { ValidationRegistryService } from "@/lib/platform/data/services/ValidationRegistryService";
import { ValidationReportService } from "@/lib/platform/data/services/ValidationReportService";
import { ValidationRuleService } from "@/lib/platform/data/services/ValidationRuleService";
import { ValidationService } from "@/lib/platform/data/services/ValidationService";
import type { ServiceContext } from "@/types/services";

/** Public data platform facade — P-011.1 through P-011.5 services. */
export class DataPlatformFacade {
  readonly registry: MasterDataRegistryService;
  readonly lookup: EntityLookupService;
  readonly discovery: EntityDiscoveryService;
  readonly identity: IdentityService;
  readonly registryQuery: RegistryQueryService;
  readonly validation: ValidationService;
  readonly validationRules: ValidationRuleService;
  readonly validationPolicies: ValidationPolicyService;
  readonly validationReports: ValidationReportService;
  readonly validationRegistry: ValidationRegistryService;
  readonly synchronization: SynchronizationService;
  readonly subscriptions: SubscriptionService;
  readonly syncPolicies: SynchronizationPolicyService;
  readonly syncMonitoring: SynchronizationMonitoringService;
  readonly syncAudit: SynchronizationAuditService;

  constructor(
    masterRepository = defaultMasterEntityRepository,
    validationRepository = defaultValidationRepository,
    syncRepository = defaultSynchronizationRepository,
  ) {
    this.registry = new MasterDataRegistryService(masterRepository);
    this.lookup = new EntityLookupService(masterRepository);
    this.discovery = new EntityDiscoveryService(masterRepository);
    this.identity = new IdentityService(masterRepository);
    this.registryQuery = new RegistryQueryService(masterRepository);

    this.validation = new ValidationService(validationRepository, masterRepository);
    this.validationRules = new ValidationRuleService(validationRepository);
    this.validationPolicies = new ValidationPolicyService(validationRepository);
    this.validationReports = new ValidationReportService(validationRepository);
    this.validationRegistry = new ValidationRegistryService(validationRepository);

    const auditService = new SynchronizationAuditService(syncRepository);
    this.syncAudit = auditService;
    this.synchronization = new SynchronizationService(syncRepository, (jobId, action, detail, ctx) => {
      auditService.record(jobId, action, detail, ctx);
    });
    this.subscriptions = new SubscriptionService(syncRepository);
    this.syncPolicies = new SynchronizationPolicyService(syncRepository);
    this.syncMonitoring = new SynchronizationMonitoringService(syncRepository);
  }
}

export const PLATFORM_MISSION_DATA_REGISTRY = "P-011.1";
export const PLATFORM_MISSION_DATA_VALIDATION = "P-011.4";
export const PLATFORM_MISSION_DATA_SYNCHRONIZATION = "P-011.5";

export const dataPlatformFacade = new DataPlatformFacade();

/** Public API exports — no repository implementations exposed. */
export const masterDataRegistryService = dataPlatformFacade.registry;
export const entityLookupService = dataPlatformFacade.lookup;
export const entityDiscoveryService = dataPlatformFacade.discovery;
export const identityService = dataPlatformFacade.identity;
export const registryQueryService = dataPlatformFacade.registryQuery;

export const validationService = dataPlatformFacade.validation;
export const validationRuleService = dataPlatformFacade.validationRules;
export const validationPolicyService = dataPlatformFacade.validationPolicies;
export const validationReportService = dataPlatformFacade.validationReports;
export const validationRegistryService = dataPlatformFacade.validationRegistry;

export const synchronizationService = dataPlatformFacade.synchronization;
export const subscriptionService = dataPlatformFacade.subscriptions;
export const synchronizationPolicyService = dataPlatformFacade.syncPolicies;
export const synchronizationMonitoringService = dataPlatformFacade.syncMonitoring;
export const synchronizationAuditService = dataPlatformFacade.syncAudit;

export { registerDataSubscribers } from "@/lib/platform/data/register-data-subscribers";
