import { DefaultCircuitBreakerRegistry } from "@/lib/aurora/infrastructure/CircuitBreakerRegistry";
import { InMemoryQueueManager } from "@/lib/aurora/infrastructure/QueueManager";
import { DefaultRetryManager } from "@/lib/aurora/infrastructure/RetryManager";
import { DefaultSchedulerService } from "@/lib/aurora/infrastructure/SchedulerService";
import { DefaultConnectorRegistry } from "@/lib/aurora/integrations/registry/ConnectorRegistry";
import { DefaultConfigurationService } from "@/lib/aurora/platform/services/ConfigurationService";
import { InMemoryConfigurationCache } from "@/lib/aurora/platform/cache/InMemoryConfigurationCache";
import type { AuroraWiringConfig } from "@/lib/aurora/wiring/AuroraWiring";
import { createAuroraPersistenceWiring } from "@/lib/aurora/wiring/createAuroraPersistenceWiring";
import { EventBus } from "@/lib/platform/events/EventBus";
import { DefaultAuroraEventPublisher } from "@/lib/aurora/events/AuroraEventPublisher";

export function createAuroraPlatformWiring(config: AuroraWiringConfig) {
  const persistence = createAuroraPersistenceWiring(config);
  const retryManager = new DefaultRetryManager();
  const circuitBreakerRegistry = new DefaultCircuitBreakerRegistry();
  const eventPublisher = new DefaultAuroraEventPublisher(config.eventBus ?? new EventBus());
  const connectorRegistry = new DefaultConnectorRegistry();
  const queueManager = new InMemoryQueueManager(retryManager);
  const scheduler = new DefaultSchedulerService(queueManager, persistence.repositories.schedule);
  const configurationCache = new InMemoryConfigurationCache();
  const configurationService = new DefaultConfigurationService(
    config,
    persistence.repositories.tenant,
    persistence.repositories.configuration,
    configurationCache,
  );

  return {
    ...persistence,
    retryManager,
    circuitBreakerRegistry,
    eventPublisher,
    connectorRegistry,
    queueManager,
    scheduler,
    configurationService,
  };
}
