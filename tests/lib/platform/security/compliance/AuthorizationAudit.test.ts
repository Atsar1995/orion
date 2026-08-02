import { describe, expect, it } from "vitest";
import { authorizationAudit } from "@/lib/platform/security/compliance";

describe("AuthorizationAudit", () => {
  it("audits default deny RBAC", () => {
    const result = authorizationAudit.audit();

    const defaultDeny = result.checks.find((check) => check.id === "AUTHZ-001");
    expect(defaultDeny?.status).toBe("pass");
  });

  it("verifies organization isolation", () => {
    const result = authorizationAudit.audit();

    const orgIsolation = result.checks.find((check) => check.id === "AUTHZ-003");
    expect(orgIsolation?.status).toBe("pass");
  });

  it("denies unknown permissions", () => {
    const result = authorizationAudit.audit();

    const unknownPerm = result.checks.find((check) => check.id === "AUTHZ-004");
    expect(unknownPerm?.status).toBe("pass");
  });

  it("enforces least privilege for readonly role", () => {
    const result = authorizationAudit.audit();

    const leastPrivilege = result.checks.find((check) => check.id === "AUTHZ-007");
    expect(leastPrivilege?.status).toBe("pass");
  });

  it("confirms HCM permission catalog exists", () => {
    const result = authorizationAudit.audit();

    const catalog = result.checks.find((check) => check.id === "AUTHZ-006");
    expect(catalog?.status).toBe("pass");
  });
});
