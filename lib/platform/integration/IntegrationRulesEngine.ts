import type {
  ImportRequestInput,
  IntegrationDataFormat,
  IntegrationType,
  RegisterConnectorInput,
  TransformPayloadInput,
} from "@/types/integration";
import type { ServiceContext } from "@/types/services";

export type IntegrationValidationError = {
  readonly code: string;
  readonly message: string;
};

const VALID_TYPES: readonly IntegrationType[] = [
  "rest_api",
  "graphql_api",
  "webhook",
  "file_import",
  "file_export",
  "csv",
  "json",
  "xml",
  "streaming",
];

const VALID_FORMATS: readonly IntegrationDataFormat[] = ["csv", "json", "xml"];

/** Domain-agnostic integration validation (Mission P-010.7). */
export class IntegrationRulesEngine {
  validateOrganizationAccess(
    record: { readonly organizationId: string },
    context: ServiceContext,
  ): IntegrationValidationError | null {
    if (record.organizationId !== context.organizationId && context.role !== "super_admin") {
      return { code: "ORGANIZATION_ISOLATION", message: "Organization access denied." };
    }
    return null;
  }

  validateConnectorRegistration(input: RegisterConnectorInput): IntegrationValidationError[] {
    const errors: IntegrationValidationError[] = [];
    if (!input.name.trim()) errors.push({ code: "INVALID_NAME", message: "Connector name is required." });
    if (!input.providerKey.trim()) errors.push({ code: "INVALID_PROVIDER", message: "Provider key is required." });
    if (!VALID_TYPES.includes(input.integrationType)) {
      errors.push({ code: "INVALID_TYPE", message: `Unknown integration type: ${input.integrationType}` });
    }
    return errors;
  }

  validateImportRequest(input: ImportRequestInput): IntegrationValidationError[] {
    const errors: IntegrationValidationError[] = [];
    if (!input.connectorId.trim()) errors.push({ code: "INVALID_CONNECTOR", message: "Connector id is required." });
    if (!VALID_FORMATS.includes(input.format)) {
      errors.push({ code: "INVALID_FORMAT", message: `Unsupported format: ${input.format}` });
    }
    if (!input.preview && input.data.length === 0) {
      errors.push({ code: "EMPTY_PAYLOAD", message: "Import data cannot be empty." });
    }
    return errors;
  }

  validatePayloadSchema(
    data: readonly Record<string, string>[],
    requiredFields: readonly string[],
  ): { valid: number; invalid: number; issues: string[] } {
    let valid = 0;
    let invalid = 0;
    const issues: string[] = [];

    for (const [index, row] of data.entries()) {
      const missing = requiredFields.filter((field) => !row[field]?.trim());
      if (missing.length > 0) {
        invalid += 1;
        issues.push(`Row ${index + 1}: missing fields ${missing.join(", ")}`);
      } else {
        valid += 1;
      }
    }

    return { valid, invalid, issues };
  }

  validateMapping(input: TransformPayloadInput): IntegrationValidationError[] {
    const errors: IntegrationValidationError[] = [];
    if (!input.mappingId.trim()) errors.push({ code: "INVALID_MAPPING", message: "Mapping id is required." });
    if (Object.keys(input.payload).length === 0) {
      errors.push({ code: "EMPTY_PAYLOAD", message: "Payload cannot be empty." });
    }
    return errors;
  }

  validateWebhookUrl(url: string): IntegrationValidationError | null {
    if (!url.trim()) return { code: "INVALID_URL", message: "Webhook URL is required." };
    try {
      const parsed = new URL(url);
      if (!["http:", "https:"].includes(parsed.protocol)) {
        return { code: "INVALID_URL", message: "Webhook URL must use HTTP or HTTPS." };
      }
    } catch {
      return { code: "INVALID_URL", message: "Webhook URL is malformed." };
    }
    return null;
  }

  transformPayload(
    payload: Readonly<Record<string, string>>,
    fieldMappings: Readonly<Record<string, string>>,
  ): Record<string, string> {
    const result: Record<string, string> = {};
    for (const [source, target] of Object.entries(fieldMappings)) {
      if (payload[source] !== undefined) {
        result[target] = payload[source];
      }
    }
    return result;
  }
}

export const integrationRulesEngine = new IntegrationRulesEngine();
