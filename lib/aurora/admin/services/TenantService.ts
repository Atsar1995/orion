import type { TenantRepository } from "@/lib/aurora/admin/repositories/TenantRepository";
import type { AuroraAuthorizationService } from "@/lib/aurora/identity/AuroraAuthorizationService";
import type { AuroraEventPublisher } from "@/lib/aurora/events/AuroraEventPublisher";
import {
  AURORA_EVENT_TENANT_CREATED,
  AURORA_EVENT_TENANT_UPDATED,
} from "@/lib/aurora/events/aurora-event-catalog";
import {
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
    private readonly authorizationService: AuroraAuthorizationService,
  ) {}

  private assertMutable(ctx: AuroraRuntimeContext): void {
    if (!isActiveLifecycleState(ctx.platformState)) {
      throw new AuroraError(AURORA_ERR_0503, "Platform not ready.", 503);
    }
  }

  async createTenant(ctx: AuroraRuntimeContext, input: CreateTenantInput): Promise<Tenant> {
    this.assertMutable(ctx);
    this.authorizationService.assertPlatformAdmin(ctx, { operation: "createTenant" });
    this.authorizationService.assertPermission(ctx, "aurora.admin.tenant", {
      operation: "createTenant",
    });
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
    this.authorizationService.assertTenantAccess(ctx, tenantId, {
      operation: "getTenant",
      resource: tenantId,
    });
    this.authorizationService.assertPermission(ctx, "aurora.content.read", {
      operation: "getTenant",
      resource: tenantId,
    });
    return this.tenantRepository.getById(tenantId);
  }

  async updateTenant(
    ctx: AuroraRuntimeContext,
    tenantId: string,
    input: UpdateTenantInput,
  ): Promise<Tenant> {
    this.assertMutable(ctx);
    this.authorizationService.assertTenantAccess(ctx, tenantId, {
      operation: "updateTenant",
      resource: tenantId,
    });
    this.authorizationService.assertPermission(ctx, "aurora.admin.config", {
      operation: "updateTenant",
      resource: tenantId,
    });
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
    this.authorizationService.assertPlatformAdmin(ctx, { operation: "listTenants" });
    this.authorizationService.assertPermission(ctx, "aurora.admin.tenant", {
      operation: "listTenants",
    });
    return this.tenantRepository.list();
  }
}
