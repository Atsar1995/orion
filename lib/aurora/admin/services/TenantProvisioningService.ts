import type { BrandRepository } from "@/lib/aurora/admin/repositories/TenantRepository";
import type { BusinessEntityRepository } from "@/lib/aurora/admin/repositories/BusinessEntityRepository";
import type { TenantRepository } from "@/lib/aurora/admin/repositories/TenantRepository";
import type { TierLimitService } from "@/lib/aurora/admin/services/TierLimitService";
import type { AuroraAuthorizationService } from "@/lib/aurora/identity/AuroraAuthorizationService";
import type { AuroraEventPublisher } from "@/lib/aurora/events/AuroraEventPublisher";
import {
  AURORA_EVENT_TENANT_PROVISIONED,
} from "@/lib/aurora/events/aurora-event-catalog";
import {
  AURORA_ERR_0503,
  AuroraError,
} from "@/lib/aurora/errors/AuroraError";
import type { ConfigurationService } from "@/lib/aurora/platform/services/ConfigurationService";
import type { AuroraRuntimeContext } from "@/lib/aurora/runtime/AuroraRuntimeContext";
import { isActiveLifecycleState } from "@/lib/aurora/runtime/PlatformLifecycleState";
import type {
  ProvisionTenantInput,
  TenantProvisionResult,
} from "@/types/aurora-admin";

/** Production onboarding orchestration path (ES-AURORA-006 §3.5). */
export class TenantProvisioningService {
  constructor(
    private readonly tenantRepository: TenantRepository,
    private readonly businessRepository: BusinessEntityRepository,
    private readonly brandRepository: BrandRepository,
    private readonly tierLimitService: TierLimitService,
    private readonly configurationService: ConfigurationService,
    private readonly authorizationService: AuroraAuthorizationService,
    private readonly eventPublisher: AuroraEventPublisher,
  ) {}

  async provision(
    ctx: AuroraRuntimeContext,
    input: ProvisionTenantInput,
  ): Promise<TenantProvisionResult> {
    if (!isActiveLifecycleState(ctx.platformState)) {
      throw new AuroraError(AURORA_ERR_0503, "Platform not ready.", 503);
    }

    this.authorizationService.assertPlatformAdmin(ctx, { operation: "provisionTenant" });
    this.authorizationService.assertPermission(ctx, "aurora.admin.tenant", {
      operation: "provisionTenant",
    });

    const tenantId = input.orionOrganizationId;
    const existingTenant = await this.tenantRepository.getById(tenantId);
    if (existingTenant) {
      throw new AuroraError("AURORA_ERR_0409", "Tenant already exists for organization.", 409);
    }

    const slug = input.slug ?? slugify(input.name);
    const businessId = crypto.randomUUID();
    const brandId = crypto.randomUUID();
    let createdTenantId: string | null = null;
    let createdBusinessId: string | null = null;
    let createdBrandId: string | null = null;

    try {
      const tenant = await this.tenantRepository.create(tenantId, {
        name: input.name,
        slug,
        tier: input.tier,
        status: "provisioning",
      });
      createdTenantId = tenant.id;

      const defaultBusiness = await this.businessRepository.create(businessId, {
        tenantId,
        name: "Default",
        slug: "default",
      });
      createdBusinessId = defaultBusiness.id;

      await this.tierLimitService.assertCanCreateBrand(tenantId);

      const defaultBrand = await this.brandRepository.create(brandId, {
        tenantId,
        businessId: defaultBusiness.id,
        name: input.defaultBrandName,
        slug: slugify(input.defaultBrandName),
      });
      createdBrandId = defaultBrand.id;

      await this.configurationService.getTenantConfig({
        ...ctx,
        tenantId,
        orionOrganizationId: tenantId,
        businessId: defaultBusiness.id,
        brandId: defaultBrand.id,
      });

      const activeTenant = await this.tenantRepository.update(tenantId, { status: "active" });

      await this.eventPublisher.publish({
        name: AURORA_EVENT_TENANT_PROVISIONED,
        tenantId,
        brandId: defaultBrand.id,
        payload: {
          tenantId,
          businessId: defaultBusiness.id,
          brandId: defaultBrand.id,
          orionOrganizationId: input.orionOrganizationId,
        },
        metadata: {
          correlationId: ctx.correlationId,
          requestId: ctx.requestId,
          emittedAt: new Date().toISOString(),
        },
      });

      return {
        tenant: activeTenant,
        defaultBusiness,
        defaultBrand,
      };
    } catch (error) {
      if (createdBrandId) {
        await this.brandRepository.delete(tenantId, createdBrandId);
      }
      if (createdBusinessId) {
        await this.businessRepository.delete(tenantId, createdBusinessId);
      }
      if (createdTenantId) {
        await this.tenantRepository.delete(createdTenantId);
      }
      throw error;
    }
  }
}

function slugify(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 64) || "tenant";
}
