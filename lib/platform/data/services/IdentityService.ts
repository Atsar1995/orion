import type { CanonicalEntityType, MasterEntityRecord } from "@/types/enterprise-data";
import type { MasterEntityRepository } from "@/lib/platform/data/repositories/MasterEntityRepository";
import { createGlobalId } from "@/lib/platform/data/repositories/InMemoryMasterEntityRepository";
import type { ServiceContext } from "@/types/services";
import { dataRulesEngine } from "@/lib/platform/data/DataRulesEngine";

export type EntityIdentityView = {
  readonly id: string;
  readonly globalId: string;
  readonly organizationId: string;
  readonly entityType: CanonicalEntityType;
  readonly businessKey: string;
  readonly status: MasterEntityRecord["status"];
  readonly version: number;
  readonly createdAt: string;
  readonly updatedAt: string;
};

/** Entity identity resolution — immutable surrogate and global IDs (Mission P-011.1). */
export class IdentityService {
  constructor(private readonly repository: MasterEntityRepository) {}

  resolve(entityId: string, context: ServiceContext): EntityIdentityView | null {
    const record = this.repository.findById(context.organizationId, entityId);
    if (!record) return null;
    return this.toIdentityView(record);
  }

  resolveGlobalId(globalId: string, context: ServiceContext): EntityIdentityView | null {
    const record = this.repository.findByGlobalId(globalId);
    if (!record) return null;
    const accessError = dataRulesEngine.validateOrganizationAccess(record, context);
    if (accessError) throw new Error(accessError.code);
    return this.toIdentityView(record);
  }

  computeGlobalId(
    entityType: CanonicalEntityType,
    businessKey: string,
    context: ServiceContext,
  ): string {
    if (!businessKey.trim()) throw new Error("INVALID_BUSINESS_KEY");
    return createGlobalId(context.organizationId, entityType, businessKey);
  }

  validateIntegrity(entityId: string, context: ServiceContext): boolean {
    const record = this.repository.findById(context.organizationId, entityId);
    if (!record) return false;
    const expected = createGlobalId(record.organizationId, record.entityType, record.businessKey);
    return record.globalId === expected && record.id === entityId;
  }

  private toIdentityView(record: MasterEntityRecord): EntityIdentityView {
    return {
      id: record.id,
      globalId: record.globalId,
      organizationId: record.organizationId,
      entityType: record.entityType,
      businessKey: record.businessKey,
      status: record.status,
      version: record.version,
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
    };
  }
}
