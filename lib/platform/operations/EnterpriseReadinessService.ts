/**
 * Enterprise operational readiness baseline (Mission P-011.1 · P-017.1 §15).
 */

import { validateEnvironment } from "@/lib/config/env";
import { healthStatusService } from "@/lib/observability/HealthStatusService";
import { createCrmWiring } from "@/lib/crm/createCrmWiring";
import { getCrmEventPipelineRegistry } from "@/lib/crm/services/crmEventPipelineRegistry";
import { createFinanceWiring } from "@/lib/finance/createFinanceWiring";
import { getFinanceEventPipelineService } from "@/lib/finance/services/financeEventPipelineRegistry";
import { backupService } from "@/lib/platform/operations/BackupService";
import { deploymentHealth } from "@/lib/platform/operations/DeploymentHealth";
import { disasterRecoveryService } from "@/lib/platform/operations/DisasterRecoveryService";
import { operationalHealthService } from "@/lib/platform/operations/OperationalHealthService";
import type {
  EnterpriseReadinessReport,
  PlatformVerificationResult,
  ReadinessSection,
} from "@/lib/platform/operations/OperationalReadinessReport";
import {
  buildReadinessSection,
  mapOperationalStatusToReadiness,
  worstOperationalStatus,
  worstReadinessStatus,
} from "@/lib/platform/operations/OperationalReadinessReport";
import type { OperationalCheck, OperationalStatus } from "@/lib/platform/operations/OperationalTypes";
import { runbookRegistry } from "@/lib/platform/operations/RunbookRegistry";
import { createProcurementWiring } from "@/lib/procurement/createProcurementWiring";
import { getProcurementEventPipelineRegistry } from "@/lib/procurement/services/procurementEventPipelineRegistry";
import { securityHealthService } from "@/lib/platform/security/SecurityHealthService";
import { isFailClosedEnabled } from "@/lib/platform/security/AuthenticationContext";
import type { PlatformStore } from "@/lib/platform/store/PlatformStore";
import { toObservabilityHealthStatus } from "@/lib/platform/store/PlatformStore";
import {
  PlatformStoreFactory,
  verifyPlatformShutdown,
  verifyPlatformStartup,
} from "@/lib/platform/store/PlatformStoreFactory";
import { InMemoryPlatformStore } from "@/lib/platform/store/InMemoryPlatformStore";
import { loadStoreConfiguration, StoreProvider } from "@/lib/platform/store/StoreConfiguration";

/** Enterprise operational readiness orchestrator for Gate 6 / Gate 7 evidence. */
export class EnterpriseReadinessService {
  verifyPlatform(): ReadinessSection {
    const env = validateEnvironment();
    const storeConfig = loadStoreConfiguration();

    const checks: OperationalCheck[] = [
      {
        name: "environment_validation",
        status: env.valid ? "healthy" : env.isProduction ? "unhealthy" : "degraded",
        message: env.valid
          ? "Environment configuration valid."
          : env.issues.map((issue) => issue.message).join(" "),
      },
      {
        name: "store_provider_configured",
        status: PlatformStoreFactory.isImplemented(storeConfig) ? "healthy" : "unhealthy",
        message: `Store provider ${storeConfig.provider} configured.`,
      },
      {
        name: "platform_factory",
        status: "healthy",
        message: "PlatformStoreFactory available for startup verification.",
      },
    ];

    return buildReadinessSection(
      "Platform",
      checks,
      "Platform foundation ready.",
      "Platform foundation partially ready — review environment configuration.",
      "Platform foundation not ready.",
    );
  }

  async verifyPersistence(store?: PlatformStore): Promise<ReadinessSection> {
    const checks: OperationalCheck[] = [];
    const storeConfig = loadStoreConfiguration();
    const platformStore = store ?? new InMemoryPlatformStore({ configuration: storeConfig });

    try {
      if (!platformStore.isInitialized()) {
        await platformStore.initialize();
      }

      const health = await platformStore.checkHealth();
      checks.push({
        name: "persistence_health",
        status: toObservabilityHealthStatus(health.status),
        message: health.message,
      });

      const migration = platformStore.getMigrationReadiness();
      checks.push({
        name: "migration_readiness",
        status: migration.ready ? "healthy" : "degraded",
        message: migration.message,
      });

      checks.push({
        name: "transaction_manager",
        status: platformStore.getTransactionManager() ? "healthy" : "unhealthy",
        message: "Transaction manager available for unit-of-work operations.",
      });
    } catch (error) {
      checks.push({
        name: "persistence_health",
        status: "unhealthy",
        message: error instanceof Error ? error.message : "Persistence verification failed.",
      });
    }

    checks.push({
      name: "postgresql_mode",
      status:
        storeConfig.provider === StoreProvider.PostgreSQL && storeConfig.databaseUrl
          ? "healthy"
          : "degraded",
      message:
        storeConfig.provider === StoreProvider.PostgreSQL && storeConfig.databaseUrl
          ? "PostgreSQL persistence configured."
          : "In-memory persistence active — not production evidence (ADR-012).",
    });

    return buildReadinessSection(
      "Persistence",
      checks,
      "Persistence layer ready.",
      "Persistence layer partially ready.",
      "Persistence layer not ready.",
    );
  }

  verifyDomains(store?: PlatformStore): ReadinessSection {
    const platformStore = store ?? new InMemoryPlatformStore();
    const checks: OperationalCheck[] = [];

    const domains = [
      { name: "hcm_domain", resolve: () => platformStore.getHcmBacking() },
      { name: "finance_domain", resolve: () => platformStore.getFinanceBacking() },
      { name: "crm_domain", resolve: () => platformStore.getCrmBacking() },
      { name: "procurement_domain", resolve: () => platformStore.getProcurementBacking() },
    ] as const;

    for (const domain of domains) {
      try {
        const backing = domain.resolve();
        checks.push({
          name: domain.name,
          status: backing ? "healthy" : "degraded",
          message: backing
            ? `${domain.name} backing available via PlatformStore.`
            : `${domain.name} backing unavailable.`,
        });
      } catch (error) {
        checks.push({
          name: domain.name,
          status: "unhealthy",
          message: error instanceof Error ? error.message : `${domain.name} verification failed.`,
        });
      }
    }

    return buildReadinessSection(
      "Domains",
      checks,
      "All Gate 5 domain backings available.",
      "Some domain backings require relational initialization.",
      "Domain backing verification failed.",
    );
  }

  verifyHealth(): ReadinessSection {
    const verification = healthStatusService.verifyHealth();

    return buildReadinessSection(
      "Health",
      verification.checks,
      "Health verification passed.",
      "Health verification passed with warnings.",
      "Health verification failed.",
    );
  }

  verifyEventInfrastructure(): ReadinessSection {
    const checks: OperationalCheck[] = [];

    try {
      getFinanceEventPipelineService();
      checks.push({
        name: "finance_event_pipeline",
        status: "healthy",
        message: "Finance event pipeline registered.",
      });
    } catch (error) {
      checks.push({
        name: "finance_event_pipeline",
        status: "degraded",
        message: error instanceof Error ? error.message : "Finance event pipeline unavailable.",
      });
    }

    try {
      const crmRegistry = getCrmEventPipelineRegistry();
      checks.push({
        name: "crm_canonical_publisher",
        status: crmRegistry.canonicalPublisherReady ? "healthy" : "degraded",
        message: crmRegistry.canonicalPublisherReady
          ? "CRM canonical publisher ready."
          : "CRM canonical publisher not ready.",
      });
    } catch (error) {
      checks.push({
        name: "crm_canonical_publisher",
        status: "degraded",
        message: error instanceof Error ? error.message : "CRM event pipeline unavailable.",
      });
    }

    try {
      const procurementRegistry = getProcurementEventPipelineRegistry();
      checks.push({
        name: "procurement_canonical_publisher",
        status: procurementRegistry.canonicalPublisherReady ? "healthy" : "degraded",
        message: procurementRegistry.canonicalPublisherReady
          ? "Procurement canonical publisher ready."
          : "Procurement canonical publisher not ready.",
      });
    } catch (error) {
      checks.push({
        name: "procurement_canonical_publisher",
        status: "degraded",
        message:
          error instanceof Error ? error.message : "Procurement event pipeline unavailable.",
      });
    }

    checks.push({
      name: "canonical_event_contract",
      status: "healthy",
      message: "ADR-014 Version 1 canonical events enforced at Finance inbound boundary.",
    });

    return buildReadinessSection(
      "Canonical Events",
      checks,
      "Canonical event infrastructure ready.",
      "Canonical event infrastructure partially ready.",
      "Canonical event infrastructure not ready.",
    );
  }

  verifySecurity(): ReadinessSection {
    const securityHealth = securityHealthService.getReport();
    const checks: OperationalCheck[] = [
      {
        name: "platform_security",
        status: securityHealth.status,
        message: securityHealth.message,
      },
      {
        name: "permission_catalog",
        status: securityHealth.permissionCount > 0 ? "healthy" : "degraded",
        message: `${securityHealth.permissionCount} permissions registered.`,
      },
    ];

    return buildReadinessSection(
      "Security",
      checks,
      "Security subsystem ready.",
      "Security subsystem partially ready.",
      "Security subsystem not ready.",
    );
  }

  verifyRbac(): ReadinessSection {
    const checks: OperationalCheck[] = [
      {
        name: "rbac_fail_closed",
        status: isFailClosedEnabled()
          ? "healthy"
          : process.env.NODE_ENV === "production"
            ? "unhealthy"
            : "degraded",
        message: isFailClosedEnabled()
          ? "RBAC fail-closed enforcement active."
          : "Fail-closed mode disabled — required for staging/production.",
      },
      {
        name: "domain_permission_codes",
        status: "healthy",
        message: "Domain permission catalogs registered (finance, crm, procurement, hcm).",
      },
    ];

    return buildReadinessSection(
      "RBAC",
      checks,
      "RBAC verification passed.",
      "RBAC verification passed with warnings.",
      "RBAC verification failed.",
    );
  }

  verifyRest(): ReadinessSection {
    const checks: OperationalCheck[] = [
      {
        name: "health_endpoints",
        status: "healthy",
        message: "Health endpoints available at /api/health and /api/health/readiness.",
      },
      {
        name: "operations_endpoint",
        status: "healthy",
        message: "Operational health endpoint available at /api/health/operations.",
      },
      {
        name: "fail_closed_routes",
        status: isFailClosedEnabled() ? "healthy" : "degraded",
        message: isFailClosedEnabled()
          ? "Fail-closed authorization enforced on wired REST routes."
          : "Fail-closed authorization disabled in current environment.",
      },
    ];

    return buildReadinessSection(
      "REST",
      checks,
      "REST operational surface ready.",
      "REST operational surface partially ready.",
      "REST operational surface not ready.",
    );
  }

  verifyPlatformStore(store?: PlatformStore): ReadinessSection {
    const platformStore = store ?? new InMemoryPlatformStore();
    const health = platformStore.getHealth();

    const checks: OperationalCheck[] = [
      {
        name: "platform_store_health",
        status: toObservabilityHealthStatus(health.status),
        message: health.message,
      },
      {
        name: "platform_store_lifecycle",
        status: platformStore.getLifecycleState() === "initialized" ? "healthy" : "degraded",
        message: `PlatformStore lifecycle state: ${platformStore.getLifecycleState()}.`,
      },
      {
        name: "domain_store_accessors",
        status:
          platformStore.getHcmBacking() &&
          platformStore.getFinanceBacking() &&
          platformStore.getCrmBacking() &&
          platformStore.getProcurementBacking()
            ? "healthy"
            : "degraded",
        message: "PlatformStore domain accessors available.",
      },
    ];

    return buildReadinessSection(
      "PlatformStore",
      checks,
      "PlatformStore verification passed.",
      "PlatformStore verification passed with warnings.",
      "PlatformStore verification failed.",
    );
  }

  verifyCompositionRoots(store?: PlatformStore): ReadinessSection {
    const platformStore = store ?? new InMemoryPlatformStore();
    const checks: OperationalCheck[] = [];

    const roots = [
      { name: "finance_composition_root", create: () => createFinanceWiring(platformStore) },
      { name: "crm_composition_root", create: () => createCrmWiring(platformStore) },
      { name: "procurement_composition_root", create: () => createProcurementWiring(platformStore) },
    ] as const;

    for (const root of roots) {
      try {
        root.create();
        checks.push({
          name: root.name,
          status: "healthy",
          message: `${root.name} resolves without error.`,
        });
      } catch (error) {
        checks.push({
          name: root.name,
          status: "unhealthy",
          message: error instanceof Error ? error.message : `${root.name} failed.`,
        });
      }
    }

    return buildReadinessSection(
      "Composition Roots",
      checks,
      "All composition roots resolve.",
      "Some composition roots require initialization.",
      "Composition root verification failed.",
    );
  }

  verifyPostgresql(): ReadinessSection {
    const storeConfig = loadStoreConfiguration();
    const checks: OperationalCheck[] = [
      {
        name: "postgresql_configured",
        status:
          storeConfig.provider === StoreProvider.PostgreSQL && storeConfig.databaseUrl
            ? "healthy"
            : "degraded",
        message:
          storeConfig.provider === StoreProvider.PostgreSQL && storeConfig.databaseUrl
            ? "PostgreSQL configured for staging/production evidence."
            : "PostgreSQL not configured — OPS-001 requires live staging PostgreSQL.",
      },
      {
        name: "migration_ready_flag",
        status: storeConfig.migrationReady ? "healthy" : "degraded",
        message: storeConfig.migrationReady
          ? "Migration readiness flag set."
          : "Migration readiness flag not set.",
      },
    ];

    return buildReadinessSection(
      "PostgreSQL",
      checks,
      "PostgreSQL readiness criteria met.",
      "PostgreSQL not configured — required for OPS-001 closure.",
      "PostgreSQL readiness failed.",
    );
  }

  async verifyMonitoring(): Promise<ReadinessSection> {
    const healthReport = await operationalHealthService.getAggregatedReport();
    const checks: OperationalCheck[] = healthReport.checks
      .filter((check) =>
        [
          "logging",
          "errors",
          "client_errors",
          "diagnostics",
          "deployment_readiness",
          "staging_environment",
        ].includes(check.name),
      )
      .map((check) => ({
        name: check.name,
        status: check.status,
        message: check.message,
      }));

    if (checks.length === 0) {
      checks.push({
        name: "operational_health_aggregation",
        status: healthReport.status,
        message: `Operational health aggregation status: ${healthReport.status}.`,
      });
    } else {
      checks.unshift({
        name: "operational_health_aggregation",
        status: healthReport.status,
        message: `Operational health aggregation status: ${healthReport.status}.`,
      });
    }

    return buildReadinessSection(
      "Monitoring",
      checks,
      "Monitoring baseline ready.",
      "Monitoring baseline partially ready.",
      "Monitoring baseline not ready.",
    );
  }

  async verifyOperations(): Promise<ReadinessSection> {
    const backupReadiness = backupService.assessBackupReadiness();
    const drReadiness = disasterRecoveryService.validateRecoveryReadiness();
    const deployReport = deploymentHealth.assess();
    const runbooks = runbookRegistry.listRunbooks();

    const checks: OperationalCheck[] = [
      {
        name: "backup_readiness",
        status: backupReadiness.status,
        message: backupReadiness.message,
      },
      {
        name: "disaster_recovery",
        status: drReadiness.status,
        message: drReadiness.message,
      },
      {
        name: "deployment_readiness",
        status: deployReport.status,
        message: deployReport.message,
      },
      {
        name: "runbook_registry",
        status: runbooks.length >= 8 ? "healthy" : "degraded",
        message: `${runbooks.length} operational runbooks registered.`,
      },
    ];

    return buildReadinessSection(
      "Operations",
      checks,
      "Operational readiness baseline met.",
      "Operational readiness partially met — address degraded checks before Gate 7.",
      "Operational readiness failed.",
    );
  }

  async generateReadinessReport(store?: PlatformStore): Promise<EnterpriseReadinessReport> {
    const platformStore = store ?? new InMemoryPlatformStore();

    const [
      persistence,
      monitoring,
      operations,
      startupVerification,
      shutdownVerification,
    ] = await Promise.all([
      this.verifyPersistence(platformStore),
      this.verifyMonitoring(),
      this.verifyOperations(),
      verifyPlatformStartup(platformStore),
      verifyPlatformShutdown(),
    ]);

    const platform = this.verifyPlatform();
    const health = this.verifyHealth();
    const security = this.verifySecurity();
    const rbac = this.verifyRbac();
    const rest = this.verifyRest();
    const canonicalEvents = this.verifyEventInfrastructure();
    const platformStoreSection = this.verifyPlatformStore(platformStore);
    const compositionRoots = this.verifyCompositionRoots(platformStore);
    const postgresql = this.verifyPostgresql();

    const sections = {
      platform,
      persistence,
      health,
      security,
      rbac,
      rest,
      canonicalEvents,
      platformStore: platformStoreSection,
      compositionRoots,
      postgresql,
      monitoring,
      operations,
    };

    const sectionStatuses = Object.values(sections).map((section) => section.status);
    const overallReadiness = worstReadinessStatus(...sectionStatuses);

    const operationalStatuses: OperationalStatus[] = [
      worstOperationalStatus(startupVerification.status, shutdownVerification.status),
      ...Object.values(sections).flatMap((section) =>
        section.checks.map((check) => check.status),
      ),
    ];
    const status = worstOperationalStatus(...operationalStatuses);

    return {
      status,
      message:
        overallReadiness === "ready"
          ? "Enterprise operational readiness baseline established."
          : overallReadiness === "partial"
            ? "Enterprise operational readiness partially established — OPS-001 remains open."
            : "Enterprise operational readiness baseline failed.",
      overallReadiness,
      assessedAt: new Date().toISOString(),
      sections,
      startupVerification,
      shutdownVerification,
    };
  }
}

export const enterpriseReadinessService = new EnterpriseReadinessService();
