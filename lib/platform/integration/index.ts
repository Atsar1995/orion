import { defaultIntegrationRepository } from "@/lib/platform/integration/repositories/InMemoryIntegrationRepository";
import { ConnectorService, EnterpriseIntegrationService } from "@/lib/platform/integration/ConnectorService";
import { ExportService } from "@/lib/platform/integration/ExportService";
import { ImportService } from "@/lib/platform/integration/ImportService";
import { IntegrationTransformationService } from "@/lib/platform/integration/IntegrationTransformationService";
import { WebhookService } from "@/lib/platform/integration/WebhookService";

/** Public integration facade — exposes only approved services (Mission P-010.7). */
export class IntegrationFacade {
  readonly integration: EnterpriseIntegrationService;
  readonly connector: ConnectorService;
  readonly webhook: WebhookService;
  readonly import: ImportService;
  readonly export: ExportService;
  readonly transformation: IntegrationTransformationService;

  constructor(repository = defaultIntegrationRepository) {
    const connector = new ConnectorService(repository);
    this.connector = connector;
    this.integration = new EnterpriseIntegrationService(repository, connector);
    this.webhook = new WebhookService(repository);
    this.import = new ImportService(repository);
    this.export = new ExportService(repository);
    this.transformation = new IntegrationTransformationService(repository);
  }
}

export const PLATFORM_MISSION_INTEGRATION = "P-010.7";
export const integrationFacade = new IntegrationFacade();

/** Public API exports — no connector implementation details exposed. */
export const integrationService = integrationFacade.integration;
export const connectorService = integrationFacade.connector;
export const webhookService = integrationFacade.webhook;
export const importService = integrationFacade.import;
export const exportService = integrationFacade.export;
export const integrationTransformationService = integrationFacade.transformation;

export { registerIntegrationSubscribers } from "@/lib/platform/integration/register-integration-subscribers";
