import type { CanonicalEntityType, MasterEntityRecord } from "@/types/enterprise-data";
import type { MasterEntityRepository } from "@/lib/platform/data/repositories/MasterEntityRepository";
import type { ServiceContext } from "@/types/services";
import { dataRulesEngine } from "@/lib/platform/data/DataRulesEngine";

/** Master entity lookup by id, business key, or global id (Mission P-011.1). */
export class EntityLookupService {
  constructor(private readonly repository: MasterEntityRepository) {}

  getById(entityId: string, context: ServiceContext): MasterEntityRecord | null {
    const record = this.repository.findById(context.organizationId, entityId);
    if (!record) return null;
    const accessError = dataRulesEngine.validateOrganizationAccess(record, context);
    if (accessError) throw new Error(accessError.code);
    return record;
  }

  getByBusinessKey(
    entityType: CanonicalEntityType,
    businessKey: string,
    context: ServiceContext,
  ): MasterEntityRecord | null {
    return this.repository.findByBusinessKey(context.organizationId, entityType, businessKey);
  }

  getByGlobalId(globalId: string, context: ServiceContext): MasterEntityRecord | null {
    const record = this.repository.findByGlobalId(globalId);
    if (!record) return null;
    const accessError = dataRulesEngine.validateOrganizationAccess(record, context);
    if (accessError) throw new Error(accessError.code);
    return record;
  }
}
