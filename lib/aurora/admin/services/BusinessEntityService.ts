/**
 * Business entity admin operations.
 * Permission mapping (ES-AURORA-006 §5.7): structural hierarchy ops use `aurora.admin.brand`.
 */
import {
  assertActiveBusinessInTenant,
} from "@/lib/aurora/admin/hierarchyValidation";
import type { BusinessEntityRepository } from "@/lib/aurora/admin/repositories/BusinessEntityRepository";
import type { AuroraAuthorizationService } from "@/lib/aurora/identity/AuroraAuthorizationService";
import {
  AURORA_ERR_0404,
  AURORA_ERR_0503,
  AuroraError,
} from "@/lib/aurora/errors/AuroraError";
import type { AuroraRuntimeContext } from "@/lib/aurora/runtime/AuroraRuntimeContext";
import { isActiveLifecycleState } from "@/lib/aurora/runtime/PlatformLifecycleState";
import type {
  BusinessEntity,
  CreateBusinessEntityInput,
  UpdateBusinessEntityInput,
} from "@/types/aurora-admin";

export class BusinessEntityService {
  constructor(
    private readonly businessRepository: BusinessEntityRepository,
    private readonly authorizationService: AuroraAuthorizationService,
  ) {}

  private assertMutable(ctx: AuroraRuntimeContext): void {
    if (!isActiveLifecycleState(ctx.platformState)) {
      throw new AuroraError(AURORA_ERR_0503, "Platform not ready.", 503);
    }
  }

  async createBusiness(
    ctx: AuroraRuntimeContext,
    input: CreateBusinessEntityInput,
  ): Promise<BusinessEntity> {
    this.assertMutable(ctx);
    this.authorizationService.assertTenantAccess(ctx, input.tenantId, {
      operation: "createBusiness",
      resource: input.tenantId,
    });
    this.authorizationService.assertPermission(ctx, "aurora.admin.brand", {
      operation: "createBusiness",
      resource: input.tenantId,
    });

    const businessId = crypto.randomUUID();
    return this.businessRepository.create(businessId, input);
  }

  async getBusiness(ctx: AuroraRuntimeContext, businessId: string): Promise<BusinessEntity | null> {
    this.authorizationService.assertTenantAccess(ctx, ctx.tenantId, {
      operation: "getBusiness",
      resource: businessId,
    });
    this.authorizationService.assertPermission(ctx, "aurora.content.read", {
      operation: "getBusiness",
      resource: businessId,
    });
    return this.businessRepository.getById(ctx.tenantId, businessId);
  }

  async listBusinesses(ctx: AuroraRuntimeContext, tenantId: string): Promise<readonly BusinessEntity[]> {
    this.authorizationService.assertTenantAccess(ctx, tenantId, {
      operation: "listBusinesses",
      resource: tenantId,
    });
    this.authorizationService.assertPermission(ctx, "aurora.content.read", {
      operation: "listBusinesses",
      resource: tenantId,
    });
    return this.businessRepository.listByTenant(tenantId);
  }

  async updateBusiness(
    ctx: AuroraRuntimeContext,
    businessId: string,
    input: UpdateBusinessEntityInput,
  ): Promise<BusinessEntity> {
    this.assertMutable(ctx);
    this.authorizationService.assertTenantAccess(ctx, ctx.tenantId, {
      operation: "updateBusiness",
      resource: businessId,
    });
    await assertActiveBusinessInTenant(this.businessRepository, ctx.tenantId, businessId);
    this.authorizationService.assertPermission(ctx, "aurora.admin.brand", {
      operation: "updateBusiness",
      resource: businessId,
    });
    return this.businessRepository.update(ctx.tenantId, businessId, input);
  }

  async archiveBusiness(ctx: AuroraRuntimeContext, businessId: string): Promise<BusinessEntity> {
    this.assertMutable(ctx);
    const existing = await this.businessRepository.getById(ctx.tenantId, businessId);
    if (!existing) {
      throw new AuroraError(AURORA_ERR_0404, "Business entity not found.", 404);
    }
    this.authorizationService.assertPermission(ctx, "aurora.admin.brand", {
      operation: "archiveBusiness",
      resource: businessId,
    });
    return this.businessRepository.update(ctx.tenantId, businessId, { status: "archived" });
  }
}
