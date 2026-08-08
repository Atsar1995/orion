import type { PoolClient } from "pg";
import {
  AURORA_ERR_0403,
  AURORA_ERR_0404,
  AuroraError,
} from "@/lib/aurora/errors/AuroraError";

export function assertRepositoryTenantParam(ctxTenantId: string, tenantIdParam: string): void {
  if (ctxTenantId !== tenantIdParam) {
    throw new AuroraError(AURORA_ERR_0403, "Tenant scope violation.", 403);
  }
}

export function mapNotFound(entity: string): AuroraError {
  return new AuroraError(AURORA_ERR_0404, `${entity} not found.`, 404);
}

export function toIsoString(value: Date | string): string {
  return value instanceof Date ? value.toISOString() : value;
}

export type SqlClient = Pick<PoolClient, "query">;
