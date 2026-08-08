import type { BrandRepository } from "@/lib/aurora/admin/repositories/TenantRepository";
import type { TenantService } from "@/lib/aurora/admin/services/TenantService";
import type { AuroraAuthorizationService } from "@/lib/aurora/identity/AuroraAuthorizationService";
import type { AuroraEventPublisher } from "@/lib/aurora/events/AuroraEventPublisher";
import {
  AURORA_EVENT_BRAND_CREATED,
  AURORA_EVENT_BRAND_UPDATED,
} from "@/lib/aurora/events/aurora-event-catalog";
import {
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
    private readonly tenantService: TenantService,
    private readonly eventPublisher: AuroraEventPublisher,
    private readonly authorizationService: AuroraAuthorizationService,
  ) {}

  private assertMutable(ctx: AuroraRuntimeContext): void {
    if (!isActiveLifecycleState(ctx.platformState)) {
      throw new AuroraError(AURORA_ERR_0503, "Platform not ready.", 503);
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
    const tenant = await this.tenantService.getTenant(ctx, input.tenantId);
    if (!tenant) {
      throw new AuroraError(AURORA_ERR_0404, "Tenant not found.", 404);
    }

    const brandId = crypto.randomUUID();
    const brand = await this.brandRepository.create(brandId, input);
    await this.eventPublisher.publish({
      name: AURORA_EVENT_BRAND_CREATED,
      tenantId: brand.tenantId,
      brandId: brand.id,
      payload: { brandId: brand.id, slug: brand.slug },
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
    const brand = await this.brandRepository.update(ctx.tenantId, brandId, input);
    await this.eventPublisher.publish({
      name: AURORA_EVENT_BRAND_UPDATED,
      tenantId: brand.tenantId,
      brandId: brand.id,
      payload: { brandId: brand.id },
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
