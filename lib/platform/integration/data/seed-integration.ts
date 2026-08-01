import type {
  ConnectorRecord,
  DataMappingRecord,
  WebhookSubscriptionRecord,
} from "@/types/integration";

const NOW = "2026-07-01T00:00:00.000Z";
const ORG = "org-orania";

/** Seed integration connectors and mappings (Mission P-010.7). */
export function seedIntegrationPlatform(organizationId: string): {
  connectors: ConnectorRecord[];
  mappings: DataMappingRecord[];
  webhooks: WebhookSubscriptionRecord[];
} {
  const connectors: ConnectorRecord[] = [
    {
      id: "conn-generic-rest",
      organizationId,
      name: "Generic REST Connector",
      providerKey: "generic-rest",
      integrationType: "rest_api",
      version: 1,
      status: "active",
      healthStatus: "healthy",
      credentialRef: "cred-rest-vault-001",
      configuration: { baseUrl: "https://api.example.com", timeout: "30000" },
      createdAt: NOW,
      updatedAt: NOW,
    },
    {
      id: "conn-csv-import",
      organizationId,
      name: "CSV File Import",
      providerKey: "csv-import",
      integrationType: "csv",
      version: 1,
      status: "active",
      healthStatus: "healthy",
      configuration: { delimiter: ",", encoding: "utf-8" },
      createdAt: NOW,
      updatedAt: NOW,
    },
    {
      id: "conn-webhook-out",
      organizationId,
      name: "Outbound Webhook",
      providerKey: "webhook-outbound",
      integrationType: "webhook",
      version: 1,
      status: "active",
      healthStatus: "healthy",
      credentialRef: "cred-webhook-secret-001",
      configuration: { retryAttempts: "3", retryDelayMs: "5000" },
      createdAt: NOW,
      updatedAt: NOW,
    },
    {
      id: "conn-json-export",
      organizationId,
      name: "JSON Export",
      providerKey: "json-export",
      integrationType: "json",
      version: 1,
      status: "inactive",
      healthStatus: "unknown",
      configuration: { prettyPrint: "true" },
      createdAt: NOW,
      updatedAt: NOW,
    },
  ];

  const mappings: DataMappingRecord[] = [
    {
      id: "map-vendor-csv",
      organizationId,
      connectorId: "conn-csv-import",
      name: "Vendor CSV Mapping",
      sourceSchema: "vendor_csv",
      targetSchema: "vendor_entity",
      fieldMappings: {
        vendor_name: "name",
        vendor_code: "code",
        contact_email: "email",
      },
      version: 1,
      active: true,
      updatedAt: NOW,
    },
    {
      id: "map-invoice-json",
      organizationId,
      connectorId: "conn-json-export",
      name: "Invoice JSON Mapping",
      sourceSchema: "invoice_entity",
      targetSchema: "invoice_json",
      fieldMappings: {
        id: "invoiceId",
        amount: "totalAmount",
        currency: "currencyCode",
      },
      version: 1,
      active: true,
      updatedAt: NOW,
    },
  ];

  const webhooks: WebhookSubscriptionRecord[] = [
    {
      id: "wh-001",
      organizationId,
      connectorId: "conn-webhook-out",
      targetUrl: "https://hooks.example.com/orion/events",
      eventTypes: ["IntegrationCompleted", "ImportCompleted"],
      secretRef: "cred-webhook-secret-001",
      enabled: true,
      createdAt: NOW,
    },
  ];

  return { connectors, mappings, webhooks };
}

export const SEED_ORG_ID = ORG;
