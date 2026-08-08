import { AURORA_ERR_0403, AuroraError } from "@/lib/aurora/errors/AuroraError";
import type { Tenant, TenantStatus } from "@/types/aurora-admin";

const OPERATIONAL_TENANT_STATUS: TenantStatus = "active";

/** Reject non-operational tenant records before issuing Aurora runtime context. */
export function assertOperationalTenant(tenant: Tenant): void {
  if (tenant.status !== OPERATIONAL_TENANT_STATUS) {
    throw new AuroraError(AURORA_ERR_0403, "Tenant is not active.", 403, {
      tenantId: tenant.id,
      status: tenant.status,
    });
  }
}
