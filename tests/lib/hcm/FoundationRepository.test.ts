import { describe, expect, it, beforeEach } from "vitest";
import { InMemoryHcmStore } from "@/lib/hcm/data/InMemoryHcmStore";
import { createFoundationRepositories } from "@/lib/hcm/data/createFoundationRepositories";
import { seedDefaultDocumentRequirements } from "@/lib/hcm/data/InMemoryHcmStore";
import {
  HCM_SEED_ORG_ID,
  SEED_EMPLOYEES,
  SEED_EMPLOYMENTS,
  seedHcmTimeData,
} from "@/lib/hcm/data/seed-hcm-time";
import type { EmploymentHistoryRecord } from "@/types/hcm-employment";

describe("HCM Foundation Repositories (S-002.4)", () => {
  let store: InMemoryHcmStore;
  let repos: ReturnType<typeof createFoundationRepositories>;

  beforeEach(() => {
    store = new InMemoryHcmStore();
    repos = createFoundationRepositories(store);
    seedHcmTimeData(store);
    seedDefaultDocumentRequirements(store, HCM_SEED_ORG_ID);
  });

  describe("Organization repositories", () => {
    it("creates and finds org units by code", () => {
      const unit = repos.organization.createOrgUnit({
        id: "ou-dept-ops",
        organizationId: HCM_SEED_ORG_ID,
        unitType: "department",
        code: "OPS",
        name: "Operations",
        effectiveFrom: "2024-01-01",
        status: "active",
        createdAt: "2026-01-01T00:00:00.000Z",
        updatedAt: "2026-01-01T00:00:00.000Z",
      });

      expect(repos.organization.findOrgUnit(HCM_SEED_ORG_ID, unit.id)?.code).toBe("OPS");
      expect(repos.organization.findOrgUnitByCode(HCM_SEED_ORG_ID, "OPS")?.id).toBe(unit.id);
    });

    it("lists positions filtered by org unit", () => {
      repos.organization.createOrgUnit({
        id: "ou-hr",
        organizationId: HCM_SEED_ORG_ID,
        unitType: "department",
        code: "HR",
        name: "Human Resources",
        effectiveFrom: "2024-01-01",
        status: "active",
        createdAt: "2026-01-01T00:00:00.000Z",
        updatedAt: "2026-01-01T00:00:00.000Z",
      });
      repos.position.createPosition({
        id: "pos-hr-mgr",
        organizationId: HCM_SEED_ORG_ID,
        orgUnitId: "ou-hr",
        code: "HR-MGR",
        title: "HR Manager",
        effectiveFrom: "2024-01-01",
        status: "active",
        createdAt: "2026-01-01T00:00:00.000Z",
        updatedAt: "2026-01-01T00:00:00.000Z",
      });

      const positions = repos.position.listPositions(HCM_SEED_ORG_ID, { orgUnitId: "ou-hr" });
      expect(positions).toHaveLength(1);
      expect(positions[0]?.code).toBe("HR-MGR");
    });

    it("persists reporting relationships and lists children", () => {
      const parent = repos.organization.createOrgUnit({
        id: "ou-parent",
        organizationId: HCM_SEED_ORG_ID,
        unitType: "department",
        code: "PARENT",
        name: "Parent",
        effectiveFrom: "2024-01-01",
        status: "active",
        createdAt: "2026-01-01T00:00:00.000Z",
        updatedAt: "2026-01-01T00:00:00.000Z",
      });
      repos.organization.createOrgUnit({
        id: "ou-child",
        organizationId: HCM_SEED_ORG_ID,
        unitType: "team",
        code: "CHILD",
        name: "Child",
        parentId: parent.id,
        effectiveFrom: "2024-01-01",
        status: "active",
        createdAt: "2026-01-01T00:00:00.000Z",
        updatedAt: "2026-01-01T00:00:00.000Z",
      });

      expect(repos.hierarchy.listChildren(HCM_SEED_ORG_ID, parent.id)).toHaveLength(1);

      repos.hierarchy.createReportingRelationship({
        id: "rpt-1",
        organizationId: HCM_SEED_ORG_ID,
        subordinatePositionId: "pos-sub",
        supervisorPositionId: "pos-sup",
        relationshipType: "direct",
        effectiveFrom: "2024-01-01",
        createdAt: "2026-01-01T00:00:00.000Z",
        updatedAt: "2026-01-01T00:00:00.000Z",
      });

      expect(repos.hierarchy.listReportingRelationships(HCM_SEED_ORG_ID)).toHaveLength(1);
    });
  });

  describe("Employee repository", () => {
    it("loads seed employees", () => {
      const employee = repos.employee.findById(HCM_SEED_ORG_ID, "emp-hcm-001");
      expect(employee?.employeeNumber).toBe("E-1001");
    });

    it("detects duplicate identity fingerprint", () => {
      const seedEmployee = repos.employee.findById(HCM_SEED_ORG_ID, "emp-hcm-001");
      expect(seedEmployee).not.toBeNull();

      const fingerprint = "priya|sharma::";
      const found = repos.employee.findByIdentityFingerprint(HCM_SEED_ORG_ID, fingerprint);
      expect(found?.id).toBe("emp-hcm-001");
    });

    it("scopes search to organization", () => {
      repos.employee.create({
        ...SEED_EMPLOYEES[0]!,
        id: "emp-other-org",
        organizationId: "org-other",
        employeeNumber: "E-9999",
      });

      expect(repos.employee.search(HCM_SEED_ORG_ID)).toHaveLength(SEED_EMPLOYEES.length);
      expect(repos.employee.findById("org-other", "emp-other-org")).not.toBeNull();
      expect(repos.employee.findById(HCM_SEED_ORG_ID, "emp-other-org")).toBeNull();
    });
  });

  describe("Employment repositories", () => {
    it("loads seed employments and searches by status", () => {
      const active = repos.employment.search(HCM_SEED_ORG_ID, { status: "active" });
      expect(active.length).toBeGreaterThanOrEqual(SEED_EMPLOYMENTS.length);
      expect(active.some((e) => e.id === "empl-hcm-001")).toBe(true);
    });

    it("appends immutable employment history", () => {
      const entry: EmploymentHistoryRecord = {
        id: "hist-1",
        organizationId: HCM_SEED_ORG_ID,
        employmentId: "empl-hcm-001",
        eventType: "transferred",
        fromStatus: "active",
        toStatus: "active",
        effectiveDate: "2026-01-01",
        actorId: "user-hr",
        recordedAt: "2026-01-01T00:00:00.000Z",
      };

      repos.employmentHistory.append(entry);
      const history = repos.employmentHistory.listByEmployment(HCM_SEED_ORG_ID, "empl-hcm-001");
      expect(history).toHaveLength(1);
      expect(history[0]?.eventType).toBe("transferred");
    });

    it("lists active primary employments only", () => {
      const primary = repos.employment.listActivePrimary(
        HCM_SEED_ORG_ID,
        "emp-hcm-001",
        "le-orania",
      );
      expect(primary.every((e) => e.isPrimary && e.status === "active")).toBe(true);
    });

    it("tracks assignments with effective dating", () => {
      repos.assignment.create({
        id: "asgn-1",
        organizationId: HCM_SEED_ORG_ID,
        employmentId: "empl-hcm-001",
        assignmentType: "primary",
        orgUnitId: "dept-operations",
        effectiveFrom: "2024-01-01",
        effectiveTo: "2025-12-31",
        createdAt: "2026-01-01T00:00:00.000Z",
        updatedAt: "2026-01-01T00:00:00.000Z",
      });

      const active = repos.assignment.findActiveByEmployment(
        HCM_SEED_ORG_ID,
        "empl-hcm-001",
        "2024-06-01",
      );
      expect(active).toHaveLength(1);

      const expired = repos.assignment.findActiveByEmployment(
        HCM_SEED_ORG_ID,
        "empl-hcm-001",
        "2026-06-01",
      );
      expect(expired).toHaveLength(0);
    });
  });

  describe("Recruitment repositories", () => {
    it("creates candidate, application, and offer with referential links", () => {
      const candidate = repos.candidate.create({
        id: "cand-1",
        organizationId: HCM_SEED_ORG_ID,
        candidateNumber: "C-001",
        legalName: { givenName: "Ravi", familyName: "Patel" },
        email: "ravi@example.com",
        status: "registered",
        source: "direct",
        skills: [],
        createdAt: "2026-01-01T00:00:00.000Z",
        updatedAt: "2026-01-01T00:00:00.000Z",
      });

      const application = repos.application.create({
        id: "app-1",
        organizationId: HCM_SEED_ORG_ID,
        candidateId: candidate.id,
        recruitmentRequestId: "req-1",
        status: "draft",
        createdAt: "2026-01-01T00:00:00.000Z",
        updatedAt: "2026-01-01T00:00:00.000Z",
      });

      repos.offer.create({
        id: "offer-1",
        organizationId: HCM_SEED_ORG_ID,
        candidateId: candidate.id,
        applicationId: application.id,
        status: "draft",
        joiningDate: "2026-08-01",
        createdAt: "2026-01-01T00:00:00.000Z",
        updatedAt: "2026-01-01T00:00:00.000Z",
      });

      expect(repos.recruitment.findCandidate(HCM_SEED_ORG_ID, candidate.id)?.email).toBe(
        "ravi@example.com",
      );
      expect(repos.application.listByCandidate(HCM_SEED_ORG_ID, candidate.id)).toHaveLength(1);
      expect(repos.offer.listByCandidate(HCM_SEED_ORG_ID, candidate.id)).toHaveLength(1);
    });

    it("returns null for cross-organization access", () => {
      repos.candidate.create({
        id: "cand-x",
        organizationId: "org-other",
        candidateNumber: "C-X",
        legalName: { givenName: "X", familyName: "Y" },
        email: "x@example.com",
        status: "registered",
        source: "direct",
        skills: [],
        createdAt: "2026-01-01T00:00:00.000Z",
        updatedAt: "2026-01-01T00:00:00.000Z",
      });

      expect(repos.candidate.findById(HCM_SEED_ORG_ID, "cand-x")).toBeNull();
    });
  });

  describe("Onboarding repositories", () => {
    it("creates process, tasks, documents, and verifications", () => {
      const process = repos.onboarding.createProcess({
        id: "onb-1",
        organizationId: HCM_SEED_ORG_ID,
        candidateId: "cand-seed",
        offerId: "offer-seed",
        joiningDate: "2026-09-01",
        status: "pre_joining",
        checklistStatus: "not_started",
        createdAt: "2026-01-01T00:00:00.000Z",
        updatedAt: "2026-01-01T00:00:00.000Z",
      });

      repos.onboarding.createTask({
        id: "task-1",
        organizationId: HCM_SEED_ORG_ID,
        processId: process.id,
        taskCode: "DOC_UPLOAD",
        title: "Upload documents",
        category: "pre_joining",
        status: "pending",
        mandatory: true,
        createdAt: "2026-01-01T00:00:00.000Z",
        updatedAt: "2026-01-01T00:00:00.000Z",
      });

      const document = repos.document.create({
        id: "doc-1",
        organizationId: HCM_SEED_ORG_ID,
        candidateId: "cand-seed",
        processId: process.id,
        documentType: "identity",
        categoryCode: "identity",
        title: "Passport",
        status: "uploaded",
        createdAt: "2026-01-01T00:00:00.000Z",
        updatedAt: "2026-01-01T00:00:00.000Z",
      });

      repos.verification.save({
        id: "vrf-1",
        organizationId: HCM_SEED_ORG_ID,
        documentId: document.id,
        status: "verified",
        auditTrail: [],
      });

      expect(repos.onboarding.findProcess(HCM_SEED_ORG_ID, process.id)?.status).toBe("pre_joining");
      expect(repos.onboarding.listTasks(HCM_SEED_ORG_ID, process.id)).toHaveLength(1);
      expect(repos.document.listByProcess(HCM_SEED_ORG_ID, process.id)).toHaveLength(1);
      expect(repos.verification.findByDocument(HCM_SEED_ORG_ID, document.id)?.status).toBe(
        "verified",
      );
      expect(repos.onboarding.listRequirements(HCM_SEED_ORG_ID).length).toBeGreaterThan(0);
    });

    it("searches onboarding processes by candidate", () => {
      repos.onboarding.createProcess({
        id: "onb-2",
        organizationId: HCM_SEED_ORG_ID,
        candidateId: "cand-search",
        offerId: "offer-search",
        joiningDate: "2026-10-01",
        status: "in_progress",
        checklistStatus: "in_progress",
        createdAt: "2026-01-01T00:00:00.000Z",
        updatedAt: "2026-01-01T00:00:00.000Z",
      });

      const results = repos.onboarding.searchProcesses(HCM_SEED_ORG_ID, {
        candidateId: "cand-search",
      });
      expect(results).toHaveLength(1);
      expect(repos.onboarding.countProcesses(HCM_SEED_ORG_ID, { candidateId: "cand-search" })).toBe(
        1,
      );
    });
  });
});
