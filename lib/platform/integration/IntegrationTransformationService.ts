import type { DataMappingRecord, TransformPayloadInput } from "@/types/integration";
import type { IntegrationRepository } from "@/lib/platform/integration/repositories/IntegrationRepository";
import { createJobId } from "@/lib/platform/integration/repositories/InMemoryIntegrationRepository";
import type { ServiceContext } from "@/types/services";
import { integrationRulesEngine } from "@/lib/platform/integration/IntegrationRulesEngine";

function nowIso(): string {
  return new Date().toISOString();
}

/** Data mapping and transformation framework (Mission P-010.7). */
export class IntegrationTransformationService {
  constructor(private readonly repository: IntegrationRepository) {}

  listMappings(context: ServiceContext, connectorId?: string): readonly DataMappingRecord[] {
    return this.repository.listMappings(context.organizationId, connectorId);
  }

  getMapping(mappingId: string, context: ServiceContext): DataMappingRecord | null {
    return this.repository.findMapping(context.organizationId, mappingId);
  }

  createMapping(
    input: {
      readonly connectorId: string;
      readonly name: string;
      readonly sourceSchema: string;
      readonly targetSchema: string;
      readonly fieldMappings: Readonly<Record<string, string>>;
    },
    context: ServiceContext,
  ): DataMappingRecord {
    const connector = this.repository.findConnector(context.organizationId, input.connectorId);
    if (!connector) throw new Error("CONNECTOR_NOT_FOUND");
    if (Object.keys(input.fieldMappings).length === 0) throw new Error("EMPTY_MAPPINGS");

    const mapping: DataMappingRecord = {
      id: createJobId("map"),
      organizationId: context.organizationId,
      connectorId: input.connectorId,
      name: input.name,
      sourceSchema: input.sourceSchema,
      targetSchema: input.targetSchema,
      fieldMappings: input.fieldMappings,
      version: 1,
      active: true,
      updatedAt: nowIso(),
    };

    return this.repository.createMapping(mapping);
  }

  transform(input: TransformPayloadInput, context: ServiceContext): Record<string, string> {
    const errors = integrationRulesEngine.validateMapping(input);
    if (errors.length > 0) throw new Error(errors[0].code);

    const mapping = this.getMapping(input.mappingId, context);
    if (!mapping || !mapping.active) throw new Error("MAPPING_NOT_FOUND");

    return integrationRulesEngine.transformPayload(input.payload, mapping.fieldMappings);
  }

  previewImport(
    connectorId: string,
    data: readonly Record<string, string>[],
    context: ServiceContext,
  ): { transformed: Record<string, string>[]; valid: number; invalid: number } {
    const mapping = this.repository.listMappings(context.organizationId, connectorId)[0];
    if (!mapping) throw new Error("MAPPING_NOT_FOUND");

    const requiredFields = Object.keys(mapping.fieldMappings);
    const validation = integrationRulesEngine.validatePayloadSchema(data, requiredFields);

    const transformed = data
      .filter((row) => requiredFields.every((field) => row[field]?.trim()))
      .map((row) => integrationRulesEngine.transformPayload(row, mapping.fieldMappings));

    return { transformed, valid: validation.valid, invalid: validation.invalid };
  }
}
