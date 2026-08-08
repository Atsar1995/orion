import type {
  BusinessEntity,
  CreateBusinessEntityInput,
  UpdateBusinessEntityInput,
} from "@/types/aurora-admin";

/** Business entity persistence contract (ES-AURORA-006 §9.3 · REP-1–REP-4). */
export interface BusinessEntityRepository {
  create(businessId: string, input: CreateBusinessEntityInput): Promise<BusinessEntity>;
  getById(tenantId: string, businessId: string): Promise<BusinessEntity | null>;
  getBySlug(tenantId: string, slug: string): Promise<BusinessEntity | null>;
  update(tenantId: string, businessId: string, input: UpdateBusinessEntityInput): Promise<BusinessEntity>;
  listByTenant(tenantId: string): Promise<readonly BusinessEntity[]>;
  delete(tenantId: string, businessId: string): Promise<void>;
}
