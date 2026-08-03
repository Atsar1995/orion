/**
 * GA-001 — ORION General Availability Readiness Sprint operational certification.
 * Executes restart-survival, backup/restore, RBAC fail-closed, and secrets checks.
 * Live PostgreSQL checks run when GA001_LIVE_POSTGRES=1 (CI staging service).
 *
 * Finance production path certification: tests/ga/FinanceGA001Certification.test.ts (P-009.17).
 */

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { getPermissionsForRole } from "@/lib/identity/role-permissions";
import { validateEnvironment } from "@/lib/config/env";
import { backupService, disasterRecoveryService, operationalReadinessService } from "@/lib/platform/operations";
import { secretsAudit } from "@/lib/platform/security/compliance/SecretsAudit";
import { createAuthenticationContext } from "@/lib/platform/security/AuthenticationContext";
import { AuthorizationMiddleware } from "@/lib/platform/security/AuthorizationMiddleware";
import { AuthorizationError } from "@/lib/platform/security/AuthorizationResult";
import { HCM_PERMISSIONS } from "@/lib/platform/security/RoleRegistry";
import { evaluateOrganizationBoundary } from "@/lib/platform/security/AuthorizationPolicy";
import { createIdentityContextFromServiceContext } from "@/lib/platform/security/IdentityContext";
import { createHcmWiring } from "@/lib/hcm/createHcmWiring";
import { HCM_SEED_ORG_ID } from "@/lib/hcm/data/seed-hcm-time";
import {
  ensureDefaultPlatformStoreInitialized,
  resetDefaultPlatformStoreForTests,
} from "@/lib/platform/store/PlatformStoreFactory";
import { SystemRole } from "@/lib/auth/roles";
import type { RoleSlug, Session } from "@/types/auth";
import { UserStatus } from "@/types/auth";

const GA_RESTART_EMPLOYEE_ID = "emp-hcm-001";

const LIVE_POSTGRES = process.env.GA001_LIVE_POSTGRES === "1";

function createSession(role: RoleSlug): Session {
  return {
    user: {
      id: "user-ga001",
      email: "ga001@orion.local",
      name: "GA001 Operator",
      status: UserStatus.Active,
      organizationId: "org-orania",
      workspaceId: "workspace-orania",
      role,
      permissions: getPermissionsForRole(role),
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    expiresAt: new Date(Date.now() + 60_000),
    activeWorkspace: {
      id: "workspace-orania",
      organizationId: "org-orania",
      name: "Default",
      slug: "default",
      modules: ["executive"],
    },
  };
}

describe("GA-001 Operational Certification", () => {
  const originalEnv = { ...process.env };

  beforeEach(() => {
    backupService.resetForTests();
    resetDefaultPlatformStoreForTests();
    process.env.ORION_AUTH_FAIL_CLOSED = "true";
  });

  afterEach(() => {
    process.env = { ...originalEnv };
    resetDefaultPlatformStoreForTests();
  });

  describe("Condition 2 — Restart-survival certification", () => {
    it("validates platform restart and store reinitialization", async () => {
      const first = await operationalReadinessService.validateStaging();
      resetDefaultPlatformStoreForTests();
      const second = await operationalReadinessService.validateStaging();

      const restartCheck = second.checks.find((check) => check.name === "restart_survival");
      expect(restartCheck).toBeDefined();
      expect(["healthy", "degraded"]).toContain(restartCheck?.status);
      expect(first.checks.length).toBe(second.checks.length);
    });

    it("validates migration execution readiness", async () => {
      const staging = await operationalReadinessService.validateStaging();
      const migrationCheck = staging.checks.find((check) => check.name === "migration_execution");
      expect(migrationCheck?.status).toMatch(/healthy|degraded/);
    });

    it("validates health endpoint registration", async () => {
      const staging = await operationalReadinessService.validateStaging();
      const healthCheck = staging.checks.find((check) => check.name === "health_endpoints");
      expect(healthCheck?.status).toBe("healthy");
    });
  });

  describe("Condition 3 — Backup and restore certification", () => {
    it("creates backup, verifies integrity, and validates restore", () => {
      const backup = backupService.createBackup({
        provider: LIVE_POSTGRES ? "postgresql" : "postgresql-simulated",
        tables: ["hcm_employees", "hcm_positions", "platform_migrations"],
        sizeBytes: 8192,
      });

      const verification = backupService.verifyBackup(backup.id);
      expect(verification.status).toBe("healthy");
      expect(verification.withinRpo).toBe(true);

      const restore = backupService.validateRestore(backup.id);
      expect(restore.integrityValid).toBe(true);
      expect(restore.status).toBe("healthy");
    });

    it("executes disaster recovery drill for database recovery", () => {
      backupService.createBackup({
        provider: "postgresql",
        tables: ["platform_migrations"],
      });

      const drill = disasterRecoveryService.executeRecoveryDrill("database_recovery");
      expect(["healthy", "degraded"]).toContain(drill.status);
      expect(drill.checks.length).toBeGreaterThan(0);
    });
  });

  describe("Condition 4 — RBAC fail-closed verification", () => {
    it("returns UNAUTHORIZED (401) for unauthenticated requests when fail-closed is enabled", () => {
      process.env.ORION_AUTH_FAIL_CLOSED = "true";
      const middleware = new AuthorizationMiddleware();
      const authentication = createAuthenticationContext(null);

      expect(() =>
        middleware.authorize(authentication, {
          permission: HCM_PERMISSIONS.employeeRead,
        }),
      ).toThrow(AuthorizationError);

      try {
        middleware.authorize(authentication, {
          permission: HCM_PERMISSIONS.employeeRead,
        });
      } catch (error) {
        expect(error).toBeInstanceOf(AuthorizationError);
        expect((error as AuthorizationError).code).toBe("UNAUTHORIZED");
      }
    });

    it("returns FORBIDDEN (403) for authenticated users without required permission", () => {
      process.env.ORION_AUTH_FAIL_CLOSED = "true";
      const middleware = new AuthorizationMiddleware();
      const authentication = createAuthenticationContext(createSession(SystemRole.ReadOnly));

      try {
        middleware.authorize(authentication, {
          permission: HCM_PERMISSIONS.employeeWrite,
        });
        expect.fail("Expected authorization to fail");
      } catch (error) {
        expect(error).toBeInstanceOf(AuthorizationError);
        expect((error as AuthorizationError).code).toBe("FORBIDDEN");
      }
    });

    it("enforces organization isolation across tenants", () => {
      const identity = createIdentityContextFromServiceContext({
        organizationId: "org-a",
        workspaceId: "workspace-a",
        userId: "user-a",
        role: SystemRole.Manager,
      });

      const boundary = evaluateOrganizationBoundary({
        identity,
        permission: HCM_PERMISSIONS.employeeRead,
        resourceOrganizationId: "org-b",
      });

      expect(boundary.allowed).toBe(false);
    });

    it("reports fail-closed mode as active in staging validation", async () => {
      const staging = await operationalReadinessService.validateStaging();
      const rbacCheck = staging.checks.find((check) => check.name === "rbac_fail_closed");
      expect(rbacCheck?.status).toBe("healthy");
    });
  });

  describe("Condition 6 — Production secrets verification", () => {
    it("passes secrets audit when staging session secret is configured", () => {
      process.env.ORION_SESSION_SECRET = "ga001-staging-secret-minimum-32-characters-long";
      delete process.env.ORION_DEMO_PASSWORD;

      const { checks } = secretsAudit.audit();
      const sessionCheck = checks.find((check) => check.id === "SEC-001");
      const demoCheck = checks.find((check) => check.id === "SEC-003");

      expect(sessionCheck?.status).toBe("pass");
      expect(demoCheck?.status).toBe("pass");
    });

    it("validates production environment rejects default session secret", () => {
      vi.stubEnv("NODE_ENV", "production");
      vi.stubEnv("ORION_SESSION_SECRET", "orion-dev-session-secret-change-in-production");

      const validation = validateEnvironment();
      expect(validation.valid).toBe(false);
      expect(validation.issues.some((issue) => issue.key === "ORION_SESSION_SECRET")).toBe(true);

      vi.unstubAllEnvs();
    });
  });

  describe("Condition 1 — Staging PostgreSQL deployment", () => {
    it.skipIf(!LIVE_POSTGRES)("connects to PostgreSQL and passes staging validation", async () => {
      process.env.ORION_STORE_ADAPTER = "postgres";
      process.env.ORION_DATABASE_URL =
        process.env.ORION_DATABASE_URL ??
        "postgresql://orion:orion_staging_secret@localhost:5432/orion_staging";

      resetDefaultPlatformStoreForTests();
      const store = await ensureDefaultPlatformStoreInitialized();
      expect(store.isInitialized()).toBe(true);

      const health = await store.checkHealth();
      expect(health.status).toBe("healthy");

      const staging = await operationalReadinessService.validateStaging();
      const postgresCheck = staging.checks.find((check) => check.name === "postgresql_configured");
      const connectionCheck = staging.checks.find((check) => check.name === "connection_recovery");

      expect(postgresCheck?.status).toBe("healthy");
      expect(connectionCheck?.status).toBe("healthy");
      expect(staging.status).toBe("healthy");
    });

    it.skipIf(!LIVE_POSTGRES)("survives platform restart with PostgreSQL persistence", async () => {
      process.env.ORION_STORE_ADAPTER = "postgres";
      process.env.ORION_DATABASE_URL =
        process.env.ORION_DATABASE_URL ??
        "postgresql://orion:orion_staging_secret@localhost:5432/orion_staging";

      resetDefaultPlatformStoreForTests();

      const store = await ensureDefaultPlatformStoreInitialized();
      expect(store.isInitialized()).toBe(true);

      createHcmWiring(store);

      const employeeBefore = store.getHcmBacking().employees.get(GA_RESTART_EMPLOYEE_ID);
      expect(employeeBefore).toBeDefined();
      expect(employeeBefore?.organizationId).toBe(HCM_SEED_ORG_ID);

      await store.shutdown();

      resetDefaultPlatformStoreForTests();
      const recovered = await ensureDefaultPlatformStoreInitialized();
      const employeeAfter = recovered.getHcmBacking().employees.get(GA_RESTART_EMPLOYEE_ID);

      expect(recovered.isInitialized()).toBe(true);
      expect(employeeAfter).toBeDefined();
      expect(employeeAfter?.organizationId).toBe(employeeBefore?.organizationId);
    });
  });
});
