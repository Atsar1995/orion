import type { BrandRepository } from "@/lib/aurora/admin/repositories/TenantRepository";
import type { BusinessEntityRepository } from "@/lib/aurora/admin/repositories/BusinessEntityRepository";
import type { TenantService } from "@/lib/aurora/admin/services/TenantService";
import type { TierLimitService } from "@/lib/aurora/admin/services/TierLimitService";
import type { AuroraAuthorizationService } from "@/lib/aurora/identity/AuroraAuthorizationService";
import type { AuroraEventPublisher } from "@/lib/aurora/events/AuroraEventPublisher";
import {
  assertBrandCreateHierarchy,
  assertBrandMutationHierarchy,
} from "@/lib/aurora/admin/hierarchyValidation";
import {
  AURORA_EVENT_BRAND_CREATED,
  AURORA_EVENT_BRAND_UPDATED,
} from "@/lib/aurora/events/aurora-event-catalog";
import {
  AURORA_ERR_0403,
  AURORA_ERR_0404,
  AURORA_ERR_0503,
  AuroraError,
} from "@/lib/aurora/errors/AuroraError";
import type { AuroraRuntimeContext } from "@/lib/aurora/runtime/AuroraRuntimeContext";
import { withBrand } from "@/lib/aurora/runtime/AuroraRuntimeContext";
import { isActiveLifecycleState } from "@/lib/aurora/runtime/PlatformLifecycleState";
import type {
  Brand,
  CreateBrandInput,
  UpdateBrandInput,
} from "@/types/aurora-admin";

export class BrandService {
  constructor(
    private readonly brandRepository: BrandRepository,
    private readonly businessRepository: BusinessEntityRepository,
    private readonly tenantService: TenantService,
    private readonly tierLimitService: TierLimitService,
    private readonly eventPublisher: AuroraEventPublisher,
    private readonly authorizationService: AuroraAuthorizationService,
  ) {}

  private assertMutable(ctx: AuroraRuntimeContext): void {
    if (!isActiveLifecycleState(ctx.platformState)) {
      throw new AuroraError(AURORA_ERR_0503, "Platform not ready.", 503);
    }
  }

  private assertBusinessScope(ctx: AuroraRuntimeContext, businessId: string): void {
    const scopedBusinessId =
      ctx.businessId && ctx.businessId !== ctx.tenantId ? ctx.businessId : null;
    if (scopedBusinessId && scopedBusinessId !== businessId) {
      throw new AuroraError(AURORA_ERR_0403, "Brand business scope violation.", 403);
    }
  }

  async createBrand(ctx: AuroraRuntimeContext, input: CreateBrandInput): Promise<Brand> {
    this.assertMutable(ctx);
    this.authorizationService.assertTenantAccess(ctx, input.tenantId, {
      operation: "createBrand",
      resource: input.tenantId,
    });
    this.authorizationService.assertPermission(ctx, "aurora.admin.brand", {
      operation: "createBrand",
      resource: input.tenantId,
    });
    this.assertBusinessScope(ctx, input.businessId);
    const tenant = await this.tenantService.getTenant(ctx, input.tenantId);
    if (!tenant) {
      throw new AuroraError(AURORA_ERR_0404, "Tenant not found.", 404);
    }

    await assertBrandCreateHierarchy(this.businessRepository, input.tenantId, input.businessId);
    await this.tierLimitService.assertCanCreateBrand(input.tenantId);

    const brandId = crypto.randomUUID();
    const brand = await this.brandRepository.create(brandId, input);
    await this.eventPublisher.publish({
      name: AURORA_EVENT_BRAND_CREATED,
      tenantId: brand.tenantId,
      brandId: brand.id,
      payload: { brandId: brand.id, slug: brand.slug, businessId: brand.businessId },
      metadata: {
        correlationId: ctx.correlationId,
        requestId: ctx.requestId,
        emittedAt: new Date().toISOString(),
      },
    });
    return brand;
  }

  async getBrand(ctx: AuroraRuntimeContext, brandId: string): Promise<Brand | null> {
    this.authorizationService.assertPermission(ctx, "aurora.content.read", {
      operation: "getBrand",
      resource: brandId,
    });
    return this.brandRepository.getById(ctx.tenantId, brandId);
  }

  async updateBrand(
    ctx: AuroraRuntimeContext,
    brandId: string,
    input: UpdateBrandInput,
  ): Promise<Brand> {
    this.assertMutable(ctx);
    this.authorizationService.assertPermission(ctx, "aurora.admin.brand", {
      operation: "updateBrand",
      resource: brandId,
    });
    await assertBrandMutationHierarchy(
      this.businessRepository,
      this.brandRepository,
      ctx.tenantId,
      brandId,
    );
    const brand = await this.brandRepository.update(ctx.tenantId, brandId, input);
    await this.eventPublisher.publish({
      name: AURORA_EVENT_BRAND_UPDATED,
      tenantId: brand.tenantId,
      brandId: brand.id,
      payload: { brandId: brand.id, businessId: brand.businessId },
      metadata: {
        correlationId: ctx.correlationId,
        requestId: ctx.requestId,
        emittedAt: new Date().toISOString(),
      },
    });
    return brand;
  }

  async listBrands(ctx: AuroraRuntimeContext, tenantId: string): Promise<readonly Brand[]> {
    this.authorizationService.assertTenantAccess(ctx, tenantId, {
      operation: "listBrands",
      resource: tenantId,
    });
    this.authorizationService.assertPermission(ctx, "aurora.content.read", {
      operation: "listBrands",
      resource: tenantId,
    });
    return this.brandRepository.listByTenant(tenantId);
  }

  switchBrand(ctx: AuroraRuntimeContext, brandId: string): AuroraRuntimeContext {
    this.authorizationService.assertBrandAccess(ctx, brandId, { operation: "switchBrand" });
    return withBrand(ctx, brandId);
  }
}
