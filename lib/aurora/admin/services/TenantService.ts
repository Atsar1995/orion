import type { TenantRepository } from "@/lib/aurora/admin/repositories/TenantRepository";
import {
  assertPlatformAdminContext,
  assertTenantAccess,
} from "@/lib/aurora/admin/tenantAuthorization";
import type { AuroraEventPublisher } from "@/lib/aurora/events/AuroraEventPublisher";
import {
  AURORA_EVENT_TENANT_CREATED,
  AURORA_EVENT_TENANT_UPDATED,
} from "@/lib/aurora/events/aurora-event-catalog";
import {
  AURORA_ERR_0403,
  AURORA_ERR_0503,
  AuroraError,
} from "@/lib/aurora/errors/AuroraError";
import type { AuroraRuntimeContext } from "@/lib/aurora/runtime/AuroraRuntimeContext";
import { isActiveLifecycleState } from "@/lib/aurora/runtime/PlatformLifecycleState";
import type {
  CreateTenantInput,
  Tenant,
  UpdateTenantInput,
} from "@/types/aurora-admin";

export class TenantService {
  constructor(
    private readonly tenantRepository: TenantRepository,
    private readonly eventPublisher: AuroraEventPublisher,
  ) {}

  private assertMutable(ctx: AuroraRuntimeContext): void {
    if (!isActiveLifecycleState(ctx.platformState)) {
      throw new AuroraError(AURORA_ERR_0503, "Platform not ready.", 503);
    }
    if (!ctx.roles.includes("aurora.admin")) {
      throw new AuroraError(AURORA_ERR_0403, "Admin role required.", 403);
    }
  }

  async createTenant(ctx: AuroraRuntimeContext, input: CreateTenantInput): Promise<Tenant> {
    this.assertMutable(ctx);
    assertPlatformAdminContext(ctx);
    const tenantId = crypto.randomUUID();
    const tenant = await this.tenantRepository.create(tenantId, input);
    await this.eventPublisher.publish({
      name: AURORA_EVENT_TENANT_CREATED,
      tenantId: tenant.id,
      payload: { tenantId: tenant.id, slug: tenant.slug },
      metadata: {
        correlationId: ctx.correlationId,
        requestId: ctx.requestId,
        emittedAt: new Date().toISOString(),
      },
    });
    return tenant;
  }

  async getTenant(ctx: AuroraRuntimeContext, tenantId: string): Promise<Tenant | null> {
    assertTenantAccess(ctx, tenantId);
    return this.tenantRepository.getById(tenantId);
  }

  async updateTenant(
    ctx: AuroraRuntimeContext,
    tenantId: string,
    input: UpdateTenantInput,
  ): Promise<Tenant> {
    this.assertMutable(ctx);
    assertTenantAccess(ctx, tenantId);
    const tenant = await this.tenantRepository.update(tenantId, input);
    await this.eventPublisher.publish({
      name: AURORA_EVENT_TENANT_UPDATED,
      tenantId: tenant.id,
      payload: { tenantId: tenant.id },
      metadata: {
        correlationId: ctx.correlationId,
        requestId: ctx.requestId,
        emittedAt: new Date().toISOString(),
      },
    });
    return tenant;
  }

  async listTenants(ctx: AuroraRuntimeContext): Promise<readonly Tenant[]> {
    assertPlatformAdminContext(ctx);
    return this.tenantRepository.list();
  }
}
