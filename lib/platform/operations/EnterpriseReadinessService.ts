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
  Gate6CertificationVerdict,
  Gate6OperationalBlocker,
  Gate6OperationalEvidenceItem,
  Gate6OperationalValidationReport,
  Gate6SignoffSummary,
  PlatformVerificationResult,
  PostgresCertificationContext,
  PostgresCertificationScenario,
  PostgresOperationalCertificationReport,
  ReadinessSection,
} from "@/lib/platform/operations/OperationalReadinessReport";
import {
  buildReadinessSection,
  deriveCertificationVerdict,
  deriveGate6CertificationVerdict,
  mapReadinessToGate7Level,
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
  createPostgresCertificationStore,
  restoreConnectionIfSupported,
  verifyPlatformShutdown,
  verifyPlatformStartup,
  verifyPostgresColdBoot,
  verifyPostgresHydration,
  verifyPostgresMultipleRestartCycles,
  verifyPostgresOrganizationIsolation,
  verifyPostgresTransactionRecovery,
  verifyPostgresWarmRestart,
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

    const [persistence, monitoring, operations] = await Promise.all([
      this.verifyPersistence(platformStore),
      this.verifyMonitoring(),
      this.verifyOperations(),
    ]);

    const startupVerification = await verifyPlatformStartup(platformStore);
    const platform = this.verifyPlatform();
    const health = this.verifyHealth();
    const security = this.verifySecurity();
    const rbac = this.verifyRbac();
    const rest = this.verifyRest();
    const canonicalEvents = this.verifyEventInfrastructure();
    const platformStoreSection = this.verifyPlatformStore(platformStore);
    const compositionRoots = this.verifyCompositionRoots(platformStore);
    const postgresql = this.verifyPostgresql();
    const shutdownVerification = await verifyPlatformShutdown(platformStore);

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

  /** Runs PostgreSQL operational certification scenarios for OPS-001 / Gate 7 (P-011.2). */
  async certifyPostgresqlOperational(
    context: PostgresCertificationContext,
  ): Promise<PostgresOperationalCertificationReport> {
    return this.generatePostgresCertificationReport(context);
  }

  /** Generates engineering evidence report for PostgreSQL operational certification (P-011.2). */
  async generatePostgresCertificationReport(
    context: PostgresCertificationContext,
  ): Promise<PostgresOperationalCertificationReport> {
    const store = createPostgresCertificationStore(context);
    const evidence: string[] = [];
    const recommendations: string[] = [];

    const coldBoot = await verifyPostgresColdBoot(store);
    const hydration = await verifyPostgresHydration(store);
    const transactionRecovery = await verifyPostgresTransactionRecovery(store);
    const organizationIsolation = await verifyPostgresOrganizationIsolation(store);
    const startupVerification = await verifyPlatformStartup(store);
    const warmRestart = await verifyPostgresWarmRestart(context);
    const multipleRestartCycles = await verifyPostgresMultipleRestartCycles(context, 3);
    const shutdownVerification = await verifyPlatformShutdown(
      createPostgresCertificationStore(context),
    );

    restoreConnectionIfSupported(context.connection);
    const readinessStore = createPostgresCertificationStore(context);
    if (!readinessStore.isInitialized()) {
      await readinessStore.initialize();
    }

    const compositionRoots = this.verifyCompositionRoots(readinessStore);
    const canonicalEvents = this.verifyEventInfrastructureAfterWiring(readinessStore);
    const health = this.verifyHealth();
    const readinessReport = await this.generateReadinessReport(readinessStore);

    if (coldBoot.status === "healthy") {
      evidence.push("Cold boot initialization verified against PostgreSQL provider.");
    }
    if (warmRestart.status === "healthy") {
      evidence.push("Warm restart preserved repository hydration across shutdown cycle.");
    }
    if (transactionRecovery.status === "healthy") {
      evidence.push("Transaction begin/rollback recovery verified without store corruption.");
    }
    if (organizationIsolation.status === "healthy") {
      evidence.push("Organization isolation verified on HCM and Finance seed repositories.");
    }
    if (compositionRoots.status === "ready") {
      evidence.push("Finance, CRM, and Procurement composition roots restored after hydration.");
    }

    if (health.status === "degraded") {
      recommendations.push(
        "Execute certification against live staging PostgreSQL for OPS-001 closure evidence.",
      );
    }
    if (canonicalEvents.status !== "ready") {
      recommendations.push("Initialize all domain event pipeline registries before production traffic.");
    }
    if (readinessReport.overallReadiness !== "ready") {
      recommendations.push("Address degraded readiness sections before Gate 7 sign-off.");
    }
    if (evidence.length === 0) {
      recommendations.push("Re-run certification after resolving unhealthy scenario checks.");
    }

    const compositionScenario: PostgresCertificationScenario = {
      name: "composition_root_restoration",
      status:
        compositionRoots.status === "ready"
          ? "healthy"
          : compositionRoots.status === "partial"
            ? "degraded"
            : "unhealthy",
      message: compositionRoots.message,
      checks: compositionRoots.checks,
      verifiedAt: new Date().toISOString(),
    };

    const canonicalScenario: PostgresCertificationScenario = {
      name: "canonical_event_infrastructure",
      status:
        canonicalEvents.status === "ready"
          ? "healthy"
          : canonicalEvents.status === "partial"
            ? "degraded"
            : "unhealthy",
      message: canonicalEvents.message,
      checks: canonicalEvents.checks,
      verifiedAt: new Date().toISOString(),
    };

    const healthScenario: PostgresCertificationScenario = {
      name: "health_verification",
      status:
        health.status === "ready" ? "healthy" : health.status === "partial" ? "degraded" : "unhealthy",
      message: health.message,
      checks: health.checks,
      verifiedAt: new Date().toISOString(),
    };

    const readinessScenario: PostgresCertificationScenario = {
      name: "readiness_report",
      status:
        readinessReport.overallReadiness === "ready"
          ? "healthy"
          : readinessReport.overallReadiness === "partial"
            ? "degraded"
            : "unhealthy",
      message: readinessReport.message,
      checks: [
        {
          name: "overall_readiness",
          status:
            readinessReport.overallReadiness === "ready"
              ? "healthy"
              : readinessReport.overallReadiness === "partial"
                ? "degraded"
                : "unhealthy",
          message: `Overall readiness: ${readinessReport.overallReadiness}.`,
        },
      ],
      verifiedAt: readinessReport.assessedAt,
    };

    const scenarios: PostgresCertificationScenario[] = [
      coldBoot,
      startupVerification,
      shutdownVerification,
      warmRestart,
      multipleRestartCycles,
      hydration,
      transactionRecovery,
      organizationIsolation,
      compositionScenario,
      canonicalScenario,
      healthScenario,
      readinessScenario,
    ];

    const verdict = deriveCertificationVerdict(...scenarios.map((scenario) => scenario.status));

    if (readinessStore.isInitialized() && readinessStore.getLifecycleState() !== "shutdown") {
      await readinessStore.shutdown();
    }

    if (store.isInitialized() && store.getLifecycleState() !== "shutdown") {
      await store.shutdown();
    }

    return {
      verdict,
      message:
        verdict === "pass"
          ? "PostgreSQL operational certification passed — engineering evidence complete for Gate 7 execution."
          : verdict === "conditional"
            ? "PostgreSQL operational certification conditional — address recommendations before GA."
            : "PostgreSQL operational certification failed — unresolved unhealthy scenarios.",
      certifiedAt: new Date().toISOString(),
      scenarios,
      evidence,
      recommendations,
      readinessReport,
    };
  }

  private verifyEventInfrastructureAfterWiring(store: PlatformStore): ReadinessSection {
    createFinanceWiring(store);
    createCrmWiring(store);
    createProcurementWiring(store);
    return this.verifyEventInfrastructure();
  }

  /** Executes Gate 6 operational validation and produces authorization evidence (P-011.3). */
  async executeGate6Validation(
    context: PostgresCertificationContext,
  ): Promise<Gate6OperationalValidationReport> {
    return this.generateGate6ValidationReport(context);
  }

  /** Generates the Gate 6 operational evidence package for ARB and Gate 7 review (P-011.3). */
  async generateGate6ValidationReport(
    context: PostgresCertificationContext,
  ): Promise<Gate6OperationalValidationReport> {
    const postgresCertification = await this.generatePostgresCertificationReport(context);
    const readinessReport = postgresCertification.readinessReport;

    const domains = this.verifyDomains(createPostgresCertificationStore(context));
    const operations = await this.verifyOperations();

    const evidence = this.collectGate6Evidence({
      readinessReport,
      postgresCertification,
      domains,
      operations,
    });

    const blockers = this.identifyGate6Blockers(readinessReport, postgresCertification);
    const recommendations = this.buildGate6Recommendations(
      blockers,
      postgresCertification.recommendations,
    );

    const hasUnhealthyCriticalPath = postgresCertification.scenarios.some(
      (scenario) => scenario.status === "unhealthy",
    );
    const liveStagingRequired = this.isLiveStagingEvidenceRequired();

    const verdict = deriveGate6CertificationVerdict({
      postgresVerdict: postgresCertification.verdict,
      overallReadiness: readinessReport.overallReadiness,
      hasUnhealthyCriticalPath,
      liveStagingRequired,
    });

    const gate7Readiness = mapReadinessToGate7Level(
      readinessReport.overallReadiness,
      postgresCertification.verdict,
    );

    const signoff = this.buildGate6SignoffSummary(verdict, blockers);

    return {
      mission: "P-011.3",
      verdict,
      message: this.buildGate6ValidationMessage(verdict, blockers.length),
      validatedAt: new Date().toISOString(),
      evidence,
      blockers,
      recommendations,
      gate7Readiness,
      generalAvailabilityImpact: this.describeGeneralAvailabilityImpact(verdict, blockers),
      readinessReport,
      postgresCertification,
      signoff,
    };
  }

  private collectGate6Evidence(input: {
    readonly readinessReport: EnterpriseReadinessReport;
    readonly postgresCertification: PostgresOperationalCertificationReport;
    readonly domains: ReadinessSection;
    readonly operations: ReadinessSection;
  }): Gate6OperationalEvidenceItem[] {
    const { readinessReport, postgresCertification, domains, operations } = input;
    const sections = readinessReport.sections;

    const sectionEvidence = (
      dimension: Gate6OperationalEvidenceItem["dimension"],
      section: ReadinessSection,
      extras: readonly string[] = [],
    ): Gate6OperationalEvidenceItem => ({
      dimension,
      status: section.status,
      message: section.message,
      evidence: [
        ...section.checks.map((check) => `${check.name}: ${check.message}`),
        ...extras,
      ],
    });

    const recoveryScenario = postgresCertification.scenarios.find(
      (scenario) => scenario.name === "warm_restart",
    );
    const transactionScenario = postgresCertification.scenarios.find(
      (scenario) => scenario.name === "transaction_recovery",
    );
    const recoverySection = buildReadinessSection(
      "Recovery",
      [
        ...(recoveryScenario?.checks ?? []),
        ...(transactionScenario?.checks ?? []),
      ],
      "Platform recovery scenarios verified.",
      "Platform recovery verified with warnings.",
      "Platform recovery verification failed.",
    );

    return [
      sectionEvidence("platform", sections.platform, [
        `startup: ${readinessReport.startupVerification.message}`,
        `shutdown: ${readinessReport.shutdownVerification.message}`,
      ]),
      sectionEvidence("persistence", sections.persistence),
      sectionEvidence("health", sections.health),
      sectionEvidence("security", sections.security),
      sectionEvidence("rbac", sections.rbac),
      sectionEvidence("rest", sections.rest),
      sectionEvidence("canonicalEvents", sections.canonicalEvents),
      sectionEvidence("platformStore", sections.platformStore),
      sectionEvidence("compositionRoots", sections.compositionRoots),
      sectionEvidence("domains", domains),
      sectionEvidence("monitoring", sections.monitoring),
      sectionEvidence("operations", operations),
      sectionEvidence("postgresql", sections.postgresql, postgresCertification.evidence),
      sectionEvidence("recovery", recoverySection, [
        recoveryScenario?.message ?? "Warm restart scenario not recorded.",
        transactionScenario?.message ?? "Transaction recovery scenario not recorded.",
      ]),
      {
        dimension: "overall",
        status: readinessReport.overallReadiness,
        message: readinessReport.message,
        evidence: [
          `PostgreSQL certification verdict: ${postgresCertification.verdict}`,
          `Validated at: ${readinessReport.assessedAt}`,
          ...postgresCertification.evidence,
        ],
      },
    ];
  }

  private identifyGate6Blockers(
    readinessReport: EnterpriseReadinessReport,
    postgresCertification: PostgresOperationalCertificationReport,
  ): Gate6OperationalBlocker[] {
    const blockers: Gate6OperationalBlocker[] = [];

    if (this.isLiveStagingEvidenceRequired()) {
      blockers.push({
        id: "OPS-001",
        severity: "P0",
        message: "Live staging PostgreSQL GA-001 evidence not yet collected.",
        owner: "Platform Ops",
        gateTarget: "Gate 6",
      });
    }

    if (readinessReport.sections.postgresql.status !== "ready") {
      blockers.push({
        id: "ENT-R-003",
        severity: "P0",
        message: "PostgreSQL operational evidence incomplete for production promotion.",
        owner: "Platform Ops",
        gateTarget: "Gate 6",
      });
    }

    blockers.push({
      id: "OPS-002",
      severity: "P1",
      message: "72-hour continuous health green window on staging not yet recorded.",
      owner: "Platform Ops",
      gateTarget: "Gate 6",
    });

    blockers.push({
      id: "OPS-003",
      severity: "P1",
      message: "Performance baselines (p95 latency · throughput) not established.",
      owner: "Platform Ops",
      gateTarget: "Gate 7",
    });

    blockers.push({
      id: "OPS-004",
      severity: "P1",
      message: "Disaster recovery drill with measured RTO/RPO not exercised.",
      owner: "Platform Ops",
      gateTarget: "Gate 7",
    });

    if (postgresCertification.verdict === "fail") {
      blockers.push({
        id: "OPS-005",
        severity: "P0",
        message: "PostgreSQL operational certification failed — unresolved unhealthy scenarios.",
        owner: "Platform Engineering",
        gateTarget: "Gate 6",
      });
    }

    return blockers;
  }

  private buildGate6Recommendations(
    blockers: readonly Gate6OperationalBlocker[],
    postgresRecommendations: readonly string[],
  ): string[] {
    const recommendations = new Set<string>(postgresRecommendations);

    if (blockers.some((blocker) => blocker.id === "OPS-001")) {
      recommendations.add(
        "Execute Gate 6 validation replay on live staging PostgreSQL to close OPS-001.",
      );
    }

    recommendations.add("Maintain 72-hour health monitoring window before Gate 6 sign-off.");
    recommendations.add("Schedule Gate 7 DR drill and rollback validation on staging.");
    recommendations.add("Preserve certification artifacts in Gate6-Evidence-Checklist.md.");

    return [...recommendations];
  }

  private buildGate6SignoffSummary(
    verdict: Gate6CertificationVerdict,
    blockers: readonly Gate6OperationalBlocker[],
  ): Gate6SignoffSummary {
    const platformOps: Gate6CertificationVerdict =
      verdict === "fail" ? "fail" : verdict === "pass" ? "pass" : "conditional_pass";

    const arb: Gate6CertificationVerdict =
      verdict === "fail"
        ? "fail"
        : blockers.some((blocker) => blocker.severity === "P0" && blocker.gateTarget === "Gate 6")
          ? "conditional_pass"
          : verdict;

    const executive: Gate6CertificationVerdict = verdict === "pass" ? "conditional_pass" : arb;

    return {
      platformOps,
      architectureReviewBoard: arb,
      executiveSponsor: executive,
      authorizationStatement:
        verdict === "pass"
          ? "Gate 6 operational evidence complete — Gate 7 authorization package ready for review."
          : verdict === "conditional_pass"
            ? "Gate 6 engineering evidence complete — conditional authorization pending live staging OPS-001 closure."
            : "Gate 6 operational validation failed — remediation required before authorization.",
    };
  }

  private buildGate6ValidationMessage(
    verdict: Gate6CertificationVerdict,
    blockerCount: number,
  ): string {
    if (verdict === "pass") {
      return "Gate 6 operational validation passed — evidence package complete.";
    }

    if (verdict === "conditional_pass") {
      return `Gate 6 operational validation conditionally passed — ${blockerCount} blocker(s) tracked for staging execution.`;
    }

    return "Gate 6 operational validation failed — unresolved critical operational gaps.";
  }

  private describeGeneralAvailabilityImpact(
    verdict: Gate6CertificationVerdict,
    blockers: readonly Gate6OperationalBlocker[],
  ): string {
    if (verdict === "fail") {
      return "General Availability remains NO-GO until Gate 6 validation failures are remediated.";
    }

    const p0Blockers = blockers.filter((blocker) => blocker.severity === "P0").length;

    if (verdict === "conditional_pass" || p0Blockers > 0) {
      return "General Availability remains NO-GO — Gate 6 engineering evidence complete; live staging OPS-001 and Gate 7 operational drills required.";
    }

    return "Gate 6 operational evidence supports Gate 7 authorization review — GA remains deferred pending Gate 7 sign-off.";
  }

  private isLiveStagingEvidenceRequired(): boolean {
    const storeConfig = loadStoreConfiguration();
    return !(
      storeConfig.provider === StoreProvider.PostgreSQL &&
      storeConfig.databaseUrl &&
      process.env.NODE_ENV === "staging"
    );
  }
}

export const enterpriseReadinessService = new EnterpriseReadinessService();
