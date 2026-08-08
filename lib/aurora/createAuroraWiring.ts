import { AdminModuleRuntime } from "@/lib/aurora/admin/AdminModuleRuntime";
import { BrandService } from "@/lib/aurora/admin/services/BrandService";
import { TenantService } from "@/lib/aurora/admin/services/TenantService";
import { AuroraFacade } from "@/lib/aurora/AuroraFacade";
import { DefaultAuroraEventPublisher } from "@/lib/aurora/events/AuroraEventPublisher";
import { DefaultCircuitBreakerRegistry } from "@/lib/aurora/infrastructure/CircuitBreakerRegistry";
import { InMemoryQueueManager } from "@/lib/aurora/infrastructure/QueueManager";
import { DefaultRetryManager } from "@/lib/aurora/infrastructure/RetryManager";
import { DefaultSchedulerService } from "@/lib/aurora/infrastructure/SchedulerService";
import { DefaultAuroraAuthorizationService } from "@/lib/aurora/identity/AuroraAuthorizationService";
import { DefaultAuroraIdentityBridge } from "@/lib/aurora/identity/AuroraIdentityBridge";
import { DefaultConnectorRegistry } from "@/lib/aurora/integrations/registry/ConnectorRegistry";
import { ensureAuroraPlatformBacking } from "@/lib/aurora/persistence/AuroraPlatformBacking";
import { createAuroraRepositories } from "@/lib/aurora/persistence/createAuroraRepositories";
import { registerAuroraReadinessProbe } from "@/lib/aurora/platform/registerAuroraReadinessProbe";
import { DefaultConfigurationService } from "@/lib/aurora/platform/services/ConfigurationService";
import { DefaultAuroraHealthStatusService } from "@/lib/aurora/platform/services/AuroraHealthStatusService";
import { AuroraLoggingService } from "@/lib/aurora/platform/services/AuroraLoggingService";
import { AuroraMetricsCollector } from "@/lib/aurora/platform/services/AuroraMetricsCollector";
import { AuroraTracingService } from "@/lib/aurora/platform/services/AuroraTracingService";
import { AuroraModuleRegistry } from "@/lib/aurora/runtime/AuroraModuleRegistry";
import {
  AuroraRuntimeConfiguration,
  type AuroraWiringConfig,
} from "@/lib/aurora/runtime/AuroraRuntimeConfiguration";
import type { AuroraRuntimeLike } from "@/lib/aurora/runtime/AuroraRuntimeLike";
import type { PlatformLifecycleState } from "@/lib/aurora/runtime/PlatformLifecycleState";
import type { AuroraWiring } from "@/lib/aurora/wiring/AuroraWiring";
import { EventBus } from "@/lib/platform/events/EventBus";
import { InMemoryPlatformStore } from "@/lib/platform/store/InMemoryPlatformStore";
import { getDefaultPlatformStore } from "@/lib/platform/store/PlatformStoreFactory";

function resolvePlatformStore(config: AuroraWiringConfig) {
  if (config.platformStore) {
    return config.platformStore;
  }
  if (config.environment === "test") {
    return new InMemoryPlatformStore();
  }
  return getDefaultPlatformStore();
}

function resolveInitialLifecycle(config: AuroraWiringConfig): PlatformLifecycleState {
  if (config.initialLifecycle) {
    return config.initialLifecycle;
  }
  if (config.enabled || config.environment === "test") {
    return "initializing";
  }
  return "shutdown";
}

/** Authoritative Aurora composition root (ES-AURORA-005 §4.1). */
export function createAuroraWiring(
  config: AuroraWiringConfig = AuroraRuntimeConfiguration.fromEnvironment(),
  runtime: AuroraRuntimeLike,
): AuroraWiring {
  const platformStore = resolvePlatformStore(config);
  const backing = ensureAuroraPlatformBacking(platformStore);
  const repositories = createAuroraRepositories(backing);
  const retryManager = new DefaultRetryManager();
  const circuitBreakerRegistry = new DefaultCircuitBreakerRegistry();
  const eventBus = config.eventBus ?? new EventBus();
  const eventPublisher = new DefaultAuroraEventPublisher(eventBus);
  const connectorRegistry = new DefaultConnectorRegistry();
  const queueManager = new InMemoryQueueManager(retryManager);
  const scheduler = new DefaultSchedulerService(queueManager, repositories.schedule);
  const configurationService = new DefaultConfigurationService(config, backing);
  const tenantService = new TenantService(repositories.tenant, eventPublisher);
  const brandService = new BrandService(repositories.brand, tenantService, eventPublisher);
  const moduleRegistry = new AuroraModuleRegistry();
  moduleRegistry.register(new AdminModuleRuntime());

  const lifecycleHolder = { value: resolveInitialLifecycle(config) };
  const degradedReasons: string[] = [];
  const metricsCollector = new AuroraMetricsCollector();
  const loggingService = new AuroraLoggingService(config);
  const tracingService = new AuroraTracingService(config);

  const healthService = new DefaultAuroraHealthStatusService(
    () => lifecycleHolder.value,
    () => degradedReasons,
    repositories,
    queueManager,
    circuitBreakerRegistry,
    moduleRegistry,
    platformStore,
  );

  const identityBridge = new DefaultAuroraIdentityBridge({
    tenantRepository: repositories.tenant,
    brandRepository: repositories.brand,
    getLifecycleState: () => lifecycleHolder.value,
    configurationService,
  });
  const authorizationService = new DefaultAuroraAuthorizationService();

  const facade = new AuroraFacade({
    tenantService,
    brandService,
    configurationService,
    healthService,
    getLifecycleState: () => lifecycleHolder.value,
  });

  const wiring = {
    runtime,
    facade,
    platformStore,
    backing,
    repositories,
    tenantService,
    brandService,
    configurationService,
    eventPublisher,
    connectorRegistry,
    scheduler,
    queueManager,
    retryManager,
    circuitBreakerRegistry,
    healthService,
    metricsCollector,
    loggingService,
    tracingService,
    moduleRegistry,
    identityBridge,
    authorizationService,
    degradedReasons,
    get lifecycle() {
      return lifecycleHolder.value;
    },
    set lifecycle(value: PlatformLifecycleState) {
      lifecycleHolder.value = value;
    },
    shutdown: async () => runtime.shutdown({ reason: "admin" }),
    healthCheck: async () => healthService.getPlatformHealth(),
    startBackgroundWorkers: async () => {
      await scheduler.start();
      await queueManager.startWorkers({});
    },
  } as AuroraWiring;

  registerAuroraReadinessProbe(healthService);

  if (
    config.skipWorkers !== true &&
    lifecycleHolder.value === "ready"
  ) {
    void wiring.startBackgroundWorkers();
  }

  runtime.attachWiring(wiring);
  return wiring;
}

export type { AuroraWiring };
