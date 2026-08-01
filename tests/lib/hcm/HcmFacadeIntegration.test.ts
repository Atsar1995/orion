import { describe, expect, it } from "vitest";
import {
  HCM_ALL_CAPABILITIES,
  HCM_ALL_MISSIONS,
  HCM_FOUNDATION_CAPABILITIES,
  HCM_MISSION_EMPLOYEE,
  HCM_MISSION_EMPLOYMENT,
  HCM_MISSION_ONBOARDING,
  HCM_MISSION_ORGANIZATION,
  HCM_MISSION_RECRUITMENT,
  HcmFacade,
  hcmFacade,
} from "@/lib/hcm";
import type { ServiceContext } from "@/types/services";

const CONTEXT: ServiceContext = {
  organizationId: "org-facade-test",
  workspaceId: "ws-test",
  userId: "user-hr",
  role: "executive",
};

describe("HCM Facade Integration (S-002.5)", () => {
  it("reports accurate domain status for all missions", () => {
    const status = hcmFacade.getDomainStatus();

    expect(status.missions).toEqual(HCM_ALL_MISSIONS);
    expect(status.organizationImplemented).toBe(true);
    expect(status.employeeMasterImplemented).toBe(true);
    expect(status.employmentLifecycleImplemented).toBe(true);
    expect(status.recruitmentImplemented).toBe(true);
    expect(status.onboardingImplemented).toBe(true);
    expect(status.attendanceImplemented).toBe(true);
    expect(status.payrollFoundationImplemented).toBe(true);
    expect(status.foundationApiRoutesImplemented).toBe(true);
    expect(status.workflowIntegrated).toBe(true);
    expect(status.eventsIntegrated).toBe(true);
    expect(status.readyForEnterpriseHcmCertification).toBe(false);
  });

  it("includes foundation capabilities in workspace bootstrap", () => {
    const bootstrap = hcmFacade.getWorkspaceBootstrap(CONTEXT);

    expect(bootstrap.missions).toEqual(HCM_ALL_MISSIONS);
    expect(bootstrap.foundationMissions).toEqual([
      HCM_MISSION_ORGANIZATION,
      HCM_MISSION_EMPLOYEE,
      HCM_MISSION_EMPLOYMENT,
      HCM_MISSION_RECRUITMENT,
      HCM_MISSION_ONBOARDING,
    ]);
    expect(bootstrap.capabilities).toEqual(HCM_ALL_CAPABILITIES);
    expect(HCM_FOUNDATION_CAPABILITIES.every((cap) =>
      bootstrap.capabilities.some((entry) => entry.key === cap.key),
    )).toBe(true);
  });

  it("does not expose repositories or stores on the public facade", () => {
    const facade = hcmFacade as unknown as Record<string, unknown>;
    expect(facade.store).toBeUndefined();
    expect(facade.defaultHcmStore).toBeUndefined();
    expect(facade.createFoundationRepositories).toBeUndefined();
    expect(facade.OrganizationRulesEngine).toBeUndefined();
  });

  it("delegates organization operations through the facade", () => {
    const unit = hcmFacade.createOrgUnit(
      {
        unitType: "department",
        code: "FAC-ORG",
        name: "Facade Org",
        effectiveFrom: "2026-01-01",
      },
      CONTEXT,
    );

    expect(unit.code).toBe("FAC-ORG");

    const updated = hcmFacade.updateOrgUnit(unit.id, { name: "Facade Org Updated" }, CONTEXT);
    expect(updated.name).toBe("Facade Org Updated");

    const position = hcmFacade.createPosition(
      {
        orgUnitId: unit.id,
        code: "FAC-POS",
        title: "Facade Role",
        effectiveFrom: "2026-01-01",
      },
      CONTEXT,
    );
    expect(position.orgUnitId).toBe(unit.id);

    const hierarchy = hcmFacade.validateHierarchy(CONTEXT);
    expect(Array.isArray(hierarchy)).toBe(true);
  });

  it("delegates employee and employment operations", () => {
    const employee = hcmFacade.createEmployee(
      {
        employeeNumber: "FAC-E001",
        identity: {
          legalName: { givenName: "Facade", familyName: "User" },
          governmentIdentifiers: [],
        },
        effectiveFrom: "2026-01-01",
      },
      CONTEXT,
    );
    expect(employee.status).toBe("draft");

    const active = hcmFacade.activateEmployee(employee.id, CONTEXT);
    expect(active.status).toBe("active");

    const employment = hcmFacade.createEmployment(
      {
        employmentNumber: "FAC-EMP-001",
        employeeId: employee.id,
        legalEntityId: "le-facade",
        employmentType: "permanent",
        contractType: "full_time",
        contract: { startDate: "2026-01-01" },
        effectiveFrom: "2026-01-01",
      },
      CONTEXT,
    );
    expect(employment.employeeId).toBe(employee.id);
  });

  it("delegates recruitment and onboarding operations", () => {
    const candidate = hcmFacade.createCandidate(
      {
        candidateNumber: "FAC-C001",
        legalName: { givenName: "Recruit", familyName: "Target" },
        email: "recruit@example.com",
        source: "direct",
      },
      CONTEXT,
    );

    const application = hcmFacade.createApplication(
      { candidateId: candidate.id, recruitmentRequestId: "req-facade" },
      CONTEXT,
    );
    hcmFacade.submitApplication(application.id, CONTEXT);
    hcmFacade.advanceApplication(application.id, CONTEXT);
    hcmFacade.scheduleInterview(application.id, CONTEXT);

    const offer = hcmFacade.createOffer(
      {
        candidateId: candidate.id,
        applicationId: application.id,
        joiningDate: "2026-09-01",
      },
      CONTEXT,
    );
    const hired = hcmFacade.hireCandidate(offer.id, CONTEXT);
    expect(hired.status).toBe("accepted");

    const process = hcmFacade.startOnboarding(
      {
        candidateId: candidate.id,
        offerId: offer.id,
        joiningDate: "2026-09-01",
      },
      CONTEXT,
    );
    expect(process.offerId).toBe(offer.id);
  });

  it("exposes time services only through the facade instance", () => {
    expect(hcmFacade.attendance).toBeDefined();
    expect(hcmFacade.leave).toBeDefined();
    expect(hcmFacade.roster).toBeDefined();
    expect(typeof hcmFacade.attendance.record).toBe("function");
  });

  it("constructs an isolated facade from wiring without leaking repositories", () => {
    const isolated = new HcmFacade();
    expect(isolated.createOrgUnit).toBeDefined();
    expect(isolated.getDomainStatus().missions.length).toBe(8);
  });
});
