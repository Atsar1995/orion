import type {
  MasterEntityDiscoveryQuery,
  MasterEntityDiscoveryResult,
} from "@/types/enterprise-data";
import type { MasterEntityRepository } from "@/lib/platform/data/repositories/MasterEntityRepository";
import type { ServiceContext } from "@/types/services";

/** Cross-domain master entity discovery (Mission P-011.1). */
export class EntityDiscoveryService {
  constructor(private readonly repository: MasterEntityRepository) {}

  discover(context: ServiceContext, query: MasterEntityDiscoveryQuery = {}): MasterEntityDiscoveryResult {
    const page = query.page ?? 1;
    const pageSize = query.pageSize ?? 50;

    if (page < 1) throw new Error("INVALID_PAGE");
    if (pageSize < 1 || pageSize > 100) throw new Error("INVALID_PAGE_SIZE");

    const entities = this.repository.list(context.organizationId, query);
    const total = this.repository.count(context.organizationId, query);

    return { total, page, pageSize, entities };
  }
}
