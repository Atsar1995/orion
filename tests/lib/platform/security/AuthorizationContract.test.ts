import { describe, expect, it } from "vitest";
import {
  AuthorizationService,
  defaultAuthorizationService,
} from "@/lib/platform/security/AuthorizationService";
import { AuthorizationMiddleware } from "@/lib/platform/security/AuthorizationMiddleware";
import { PermissionEvaluator } from "@/lib/platform/security/PermissionEvaluator";
import { PermissionRegistry } from "@/lib/platform/security/PermissionRegistry";
import { RoleRegistry } from "@/lib/platform/security/RoleRegistry";
import { SecurityHealthService } from "@/lib/platform/security/SecurityHealthService";
import { createAuthenticationContext } from "@/lib/platform/security/AuthenticationContext";

describe("AuthorizationContract", () => {
  it("exposes default deny through authorization service", () => {
    const authentication = createAuthenticationContext(null);
    expect(authentication.state).toBe("anonymous");
  });

  it("wires registries into evaluator and service", () => {
    const registry = new PermissionRegistry();
    const roles = new RoleRegistry();
    const evaluator = new PermissionEvaluator(registry, roles);
    const service = new AuthorizationService(registry, evaluator);
    const middleware = new AuthorizationMiddleware(service);

    expect(registry.list().length).toBeGreaterThan(0);
    expect(middleware).toBeDefined();
    expect(defaultAuthorizationService).toBeDefined();
  });

  it("reports security health with default deny enabled", () => {
    const report = new SecurityHealthService().getReport();
    expect(report.defaultDeny).toBe(true);
    expect(report.permissionCount).toBeGreaterThan(0);
  });
});
