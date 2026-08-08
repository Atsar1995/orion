import {
  AURORA_DEFAULT_LOCALE,
  AURORA_DEFAULT_TIMEZONE,
} from "@/lib/aurora/constants";
import type { BrandRepository, TenantRepository } from "@/lib/aurora/admin/repositories/TenantRepository";
import { AURORA_ERR_0404, AuroraError } from "@/lib/aurora/errors/AuroraError";
import { createAuroraRuntimeContext } from "@/lib/aurora/identity/AuroraContextFactory";
import type { AuroraUserIdentity } from "@/lib/aurora/identity/AuroraUserIdentity";
import {
  resolveAuroraRolesFromOrionRole,
} from "@/lib/aurora/identity/aurora-role-permissions";
import { resolveEffectiveAuroraPermissions } from "@/lib/aurora/identity/orion-permission-mapping";
import { assertOperationalTenant } from "@/lib/aurora/identity/tenant-status";
import type { ConfigurationService } from "@/lib/aurora/platform/services/ConfigurationService";
import type { AuroraRuntimeContext } from "@/lib/aurora/runtime/AuroraRuntimeContext";
import type { PlatformLifecycleState } from "@/lib/aurora/runtime/PlatformLifecycleState";
import type { Tenant } from "@/types/aurora-admin";
import type { Session } from "@/types/auth";

/** ORION session alias used in ES-AURORA-006 (`OrionSession`). */
export type OrionSession = Session;

export interface AuroraIdentityBridge {
  resolveUserIdentity(session: OrionSession): Promise<AuroraUserIdentity>;
  buildContext(session: OrionSession, brandId?: string): Promise<AuroraRuntimeContext>;
  resolveTenant(orionOrganizationId: string): Promise<Tenant | null>;
}

export type DefaultAuroraIdentityBridgeDeps = {
  readonly tenantRepository: TenantRepository;
  readonly brandRepository: BrandRepository;
  readonly getLifecycleState: () => PlatformLifecycleState;
  readonly configurationService?: ConfigurationService;
};

export class DefaultAuroraIdentityBridge implements AuroraIdentityBridge {
  constructor(private readonly deps: DefaultAuroraIdentityBridgeDeps) {}

  async resolveUserIdentity(session: OrionSession): Promise<AuroraUserIdentity> {
    const auroraRoles = resolveAuroraRolesFromOrionRole(session.user.role);
    const auroraPermissions = resolveEffectiveAuroraPermissions(
      auroraRoles,
      session.user.permissions,
    );

    return {
      userId: session.user.id,
      email: session.user.email,
      displayName: session.user.name,
      orionOrganizationId: session.user.organizationId,
      orionWorkspaceId: session.user.workspaceId,
      orionRoles: [session.user.role],
      auroraRoles,
      auroraPermissions,
      locale: AURORA_DEFAULT_LOCALE,
      timezone: AURORA_DEFAULT_TIMEZONE,
    };
  }

  async buildContext(session: OrionSession, brandId?: string): Promise<AuroraRuntimeContext> {
    const tenant = await this.resolveTenant(session.user.organizationId);
    if (!tenant) {
      throw new AuroraError(AURORA_ERR_0404, "Tenant not found for ORION organization.", 404);
    }
    assertOperationalTenant(tenant);

    const identity = await this.resolveUserIdentity(session);
    const resolvedBrandId = brandId ?? "";
    const tenantId = session.user.organizationId;
    let resolvedBusinessId = "";

    if (resolvedBrandId) {
      const brand = await this.deps.brandRepository.getById(tenantId, resolvedBrandId);
      if (!brand) {
        throw new AuroraError(AURORA_ERR_0404, "Brand not found.", 404);
      }
      resolvedBusinessId = brand.businessId;
    }

    const platformState = this.deps.getLifecycleState();
    const baseContext = createAuroraRuntimeContext(
      {
        tenantId,
        userId: identity.userId,
        orionOrganizationId: identity.orionOrganizationId,
        workspaceId: identity.orionWorkspaceId,
        roles: identity.auroraRoles,
        auroraPermissions: [...identity.auroraPermissions],
        brandId: resolvedBrandId,
        businessId: resolvedBusinessId,
        locale: identity.locale,
        timezone: identity.timezone,
        sessionId: session.user.id,
        contextSource: "orion-session",
        platformState,
      },
      platformState,
    );

    if (!this.deps.configurationService) {
      return baseContext;
    }

    const featureFlags = await this.deps.configurationService.getFeatureFlags(baseContext);
    return { ...baseContext, featureFlags };
  }

  async resolveTenant(orionOrganizationId: string): Promise<Tenant | null> {
    const tenant = await this.deps.tenantRepository.getById(orionOrganizationId);
    if (!tenant) {
      return null;
    }
    assertOperationalTenant(tenant);
    return tenant;
  }
}
